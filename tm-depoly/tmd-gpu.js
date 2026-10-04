/*
 * tmd-gpu.js -- the WebGPU compute backend for the browser.
 *
 * This is the GPU half of the resource layer: when the browser exposes WebGPU,
 * the whole analytic ray tracer (plane / torus / biquadratic Bezier, the
 * closed-form quartic solver, Cook-Torrance shading, ACES tone mapping) runs as
 * a single WGSL compute shader -- one invocation per pixel, all in parallel on
 * the GPU. It consumes the exact same scene the CPU path uses, exported as a
 * flat float32 blob by tmdw_scene_export() (layout mirrored below).
 *
 * If WebGPU is missing or the kernel fails, gpuInit()/gpuRender() report it and
 * the caller (main.js) falls back to the wasm CPU render -- the image is never
 * lost. The math here is single precision (f32); the native/CPU path stays the
 * double-precision reference.
 */
(function () {
  "use strict";

  // ---- scene blob layout (must match bindings.c) -------------------------
  const HEADER = 22, LSTRIDE = 8, MAXLIGHT = 8;
  const LIGHTS_BASE = HEADER;                 // 22
  const SURF_BASE = HEADER + LSTRIDE * MAXLIGHT; // 86
  const SSTRIDE = 40;

  const WGSL = /* wgsl */ `
// ---- bindings -----------------------------------------------------------
struct Params {
  W: u32, H: u32, spp: u32, maxDepth: i32,
  exposure: f32, _p0: u32, _p1: u32, _p2: u32,
};
@group(0) @binding(0) var<storage, read>       scene : array<f32>;
@group(0) @binding(1) var<uniform>             P     : Params;
@group(0) @binding(2) var<storage, read_write> outp  : array<u32>;

const HEADER : u32 = ${HEADER}u;
const LIGHTS_BASE : u32 = ${LIGHTS_BASE}u;
const LSTRIDE : u32 = ${LSTRIDE}u;
const SURF_BASE : u32 = ${SURF_BASE}u;
const SSTRIDE : u32 = ${SSTRIDE}u;
const PI : f32 = 3.14159265358979;

const KIND_PLANE : u32 = 0u;
const KIND_BEZIER : u32 = 1u;
const KIND_TORUS : u32 = 2u;

// ---- scene accessors ----------------------------------------------------
fn sf(i: u32) -> f32 { return scene[i]; }
fn sv3(i: u32) -> vec3f { return vec3f(scene[i], scene[i + 1u], scene[i + 2u]); }

fn nSurf() -> u32 { return u32(scene[1]); }
fn nLight() -> u32 { return u32(scene[2]); }
fn ambient() -> f32 { return scene[3]; }
fn camPos() -> vec3f { return sv3(4u); }
fn camTarget() -> vec3f { return sv3(7u); }
fn camUp() -> vec3f { return sv3(10u); }
fn camFov() -> f32 { return scene[13]; }
fn skyTop() -> vec3f { return sv3(14u); }
fn skyBottom() -> vec3f { return sv3(17u); }
fn camProj() -> f32 { return scene[20]; }   // 0 = perspective, 1 = parallel
fn camOrtho() -> f32 { return scene[21]; }  // parallel view height (world units)

fn surfBase(i: u32) -> u32 { return SURF_BASE + i * SSTRIDE; }
fn surfKind(b: u32) -> u32 { return u32(scene[b]); }
fn matAlbedo(b: u32) -> vec3f { return sv3(b + 1u); }
fn matMetallic(b: u32) -> f32 { return scene[b + 4u]; }
fn matRough(b: u32) -> f32 { return scene[b + 5u]; }
fn matEmissive(b: u32) -> vec3f { return sv3(b + 6u); }
fn matReflect(b: u32) -> f32 { return scene[b + 9u]; }

// ---- small helpers ------------------------------------------------------
fn csign(mag: f32, s: f32) -> f32 {
  if (s >= 0.0) { return abs(mag); }
  return -abs(mag);
}

// orthonormal basis (Duff et al.) for unit n
fn basis(n: vec3f, t: ptr<function, vec3f>, b: ptr<function, vec3f>) {
  let sgn = select(-1.0, 1.0, n.z >= 0.0);
  let a = -1.0 / (sgn + n.z);
  let d = n.x * n.y * a;
  *t = vec3f(1.0 + sgn * n.x * n.x * a, sgn * d, -sgn * n.x);
  *b = vec3f(d, sgn + n.y * n.y * a, -n.y);
}

// ---- polynomial roots (f32 port of components/algebra) ------------------
fn quadRoots(a2: f32, a1: f32, a0: f32, out: ptr<function, array<f32,4>>) -> i32 {
  if (abs(a2) < 1e-30) {
    if (abs(a1) < 1e-30) { return 0; }
    (*out)[0] = -a0 / a1;
    return 1;
  }
  let disc = a1 * a1 - 4.0 * a2 * a0;
  if (disc < 0.0) { return 0; }
  let sq = sqrt(disc);
  let q = -0.5 * (a1 + csign(sq, a1));
  var n = 0;
  (*out)[n] = q / a2; n = n + 1;
  if (abs(q) > 1e-30) { (*out)[n] = a0 / q; n = n + 1; }
  return n;
}

// principal complex sqrt, Re>=0
fn sqrtc(u: f32, v: f32) -> vec2f {
  if (v == 0.0) {
    if (u >= 0.0) { return vec2f(sqrt(u), 0.0); }
    return vec2f(0.0, sqrt(-u));
  }
  let m = sqrt(u * u + v * v);
  let re = sqrt((m + u) * 0.5);
  let im = select(-1.0, 1.0, v >= 0.0) * sqrt((m - u) * 0.5);
  return vec2f(re, im);
}

// ---- robust real-root finder (bracket + bisection) ----------------------
// The vendored closed-form quartic solver collapses two factors into a
// spurious double root when its resolvent term is ~0, dropping real roots on
// ~1 torus ray in 20; Newton from those seeds cannot recover them, so the
// torus speckled. This finder brackets every sign change between the
// derivative's roots and bisects, so no real root is missed. f32 throughout.
fn qeval(a4: f32, a3: f32, a2: f32, a1: f32, a0: f32, x: f32) -> f32 {
  return (((a4 * x + a3) * x + a2) * x + a1) * x + a0;
}
fn qbisect(a4: f32, a3: f32, a2: f32, a1: f32, a0: f32, lo0: f32, hi0: f32) -> f32 {
  var lo = lo0; var hi = hi0;
  var flo = qeval(a4, a3, a2, a1, a0, lo);
  for (var it = 0; it < 40; it = it + 1) {
    let mid = 0.5 * (lo + hi);
    let fm = qeval(a4, a3, a2, a1, a0, mid);
    if ((flo < 0.0) == (fm < 0.0)) { lo = mid; flo = fm; } else { hi = mid; }
  }
  return 0.5 * (lo + hi);
}
fn ceval(c3: f32, c2: f32, c1: f32, c0: f32, x: f32) -> f32 {
  return ((c3 * x + c2) * x + c1) * x + c0;
}
fn cbisect(c3: f32, c2: f32, c1: f32, c0: f32, lo0: f32, hi0: f32) -> f32 {
  var lo = lo0; var hi = hi0;
  var flo = ceval(c3, c2, c1, c0, lo);
  for (var it = 0; it < 40; it = it + 1) {
    let mid = 0.5 * (lo + hi);
    let fm = ceval(c3, c2, c1, c0, mid);
    if ((flo < 0.0) == (fm < 0.0)) { lo = mid; flo = fm; } else { hi = mid; }
  }
  return 0.5 * (lo + hi);
}
// real roots of c3 x^3 + c2 x^2 + c1 x + c0 (c3 != 0), ascending in out.
fn cubicRootsRobust(c3: f32, c2: f32, c1: f32, c0: f32,
                    out: ptr<function, array<f32,4>>) -> i32 {
  var b: array<f32,4>;
  let nb = quadRoots(3.0 * c3, 2.0 * c2, c1, &b);   // derivative roots
  if (nb == 2 && b[0] > b[1]) { let t = b[0]; b[0] = b[1]; b[1] = t; }
  let bound = 1.0 + max(abs(c2 / c3), max(abs(c1 / c3), abs(c0 / c3)));
  var node: array<f32,4>;
  var nn = 0;
  node[nn] = -bound; nn = nn + 1;
  for (var i = 0; i < nb; i = i + 1) {
    if (b[i] > -bound && b[i] < bound) { node[nn] = b[i]; nn = nn + 1; }
  }
  node[nn] = bound; nn = nn + 1;
  var n = 0;
  for (var i = 0; i + 1 < nn && n < 4; i = i + 1) {
    let x0 = node[i]; let x1 = node[i + 1];
    let f0 = ceval(c3, c2, c1, c0, x0);
    let f1 = ceval(c3, c2, c1, c0, x1);
    if (f0 == 0.0) { (*out)[n] = x0; n = n + 1; }
    else if ((f0 < 0.0) != (f1 < 0.0)) {
      (*out)[n] = cbisect(c3, c2, c1, c0, x0, x1); n = n + 1;
    }
  }
  return n;
}

// real roots of a4 x^4 + a3 x^3 + a2 x^2 + a1 x + a0 (Ferrari, vendored form)
fn quarticRoots(a4: f32, a3: f32, a2: f32, a1: f32, a0: f32,
                out: ptr<function, array<f32,4>>) -> i32 {
  let scale = abs(a4) + abs(a3) + abs(a2) + abs(a1) + abs(a0);
  if (scale < 1e-30) { return 0; }
  let eps = 1e-8 * scale;

  if (abs(a4) < eps) {
    if (abs(a3) < eps) { return quadRoots(a2, a1, a0, out); }
    return cubicRootsRobust(a3, a2, a1, a0, out);
  }

  // Bracket every sign change between the derivative's roots and bisect, so no
  // real root is ever dropped. The derivative 4a4 x^3 + 3a3 x^2 + 2a2 x + a1
  // has (ascending) roots that split the axis into monotone pieces; every real
  // quartic root is the lone sign change inside one such piece.
  var brk: array<f32,4>;
  let nb = cubicRootsRobust(4.0 * a4, 3.0 * a3, 2.0 * a2, a1, &brk);
  let bound = 1.0 + max(abs(a3 / a4),
                        max(abs(a2 / a4), max(abs(a1 / a4), abs(a0 / a4))));
  var node: array<f32,6>;
  var nn = 0;
  node[nn] = -bound; nn = nn + 1;
  for (var i = 0; i < nb; i = i + 1) {
    if (brk[i] > -bound && brk[i] < bound) { node[nn] = brk[i]; nn = nn + 1; }
  }
  node[nn] = bound; nn = nn + 1;

  var n = 0;
  for (var i = 0; i + 1 < nn && n < 4; i = i + 1) {
    let x0 = node[i]; let x1 = node[i + 1];
    let f0 = qeval(a4, a3, a2, a1, a0, x0);
    let f1 = qeval(a4, a3, a2, a1, a0, x1);
    if (f0 == 0.0) { (*out)[n] = x0; n = n + 1; }
    else if ((f0 < 0.0) != (f1 < 0.0)) {
      (*out)[n] = qbisect(a4, a3, a2, a1, a0, x0, x1); n = n + 1;
    }
  }
  return n;
}

// ---- hit record ---------------------------------------------------------
struct Hit {
  hit: bool,
  t: f32,
  p: vec3f,
  n: vec3f,
  surf: u32,
};

// ---- Bezier helpers -----------------------------------------------------
fn bern2(t: f32) -> vec3f {
  let it = 1.0 - t;
  return vec3f(it * it, 2.0 * t * it, t * t);
}
fn dbern2(t: f32) -> vec3f {
  return vec3f(-2.0 * (1.0 - t), 2.0 - 4.0 * t, 2.0 * t);
}
fn bezCP(b: u32, k: u32) -> vec3f { return sv3(b + 10u + k * 3u); }

fn bezEval(b: u32, u: f32, v: f32) -> vec3f {
  let bu = bern2(u); let bv = bern2(v);
  var p = vec3f(0.0);
  for (var i = 0u; i < 3u; i = i + 1u) {
    for (var j = 0u; j < 3u; j = j + 1u) {
      p = p + bezCP(b, i * 3u + j) * (bu[i] * bv[j]);
    }
  }
  return p;
}
fn bezPartials(b: u32, u: f32, v: f32,
               S: ptr<function, vec3f>, Su: ptr<function, vec3f>, Sv: ptr<function, vec3f>) {
  let bu = bern2(u); let bv = bern2(v);
  let du = dbern2(u); let dv = dbern2(v);
  var p = vec3f(0.0); var pu = vec3f(0.0); var pv = vec3f(0.0);
  for (var i = 0u; i < 3u; i = i + 1u) {
    for (var j = 0u; j < 3u; j = j + 1u) {
      let c = bezCP(b, i * 3u + j);
      p = p + c * (bu[i] * bv[j]);
      pu = pu + c * (du[i] * bv[j]);
      pv = pv + c * (bu[i] * dv[j]);
    }
  }
  *S = p; *Su = pu; *Sv = pv;
}

fn rayAabb(o: vec3f, d: vec3f, mn: vec3f, mx: vec3f, tmin: f32, tmax: f32) -> bool {
  var lo = tmin; var hi = tmax;
  for (var a = 0; a < 3; a = a + 1) {
    let oa = o[a]; let da = d[a];
    if (abs(da) < 1e-30) {
      if (oa < mn[a] || oa > mx[a]) { return false; }
    } else {
      let inv = 1.0 / da;
      var t0 = (mn[a] - oa) * inv;
      var t1 = (mx[a] - oa) * inv;
      if (t0 > t1) { let tmp = t0; t0 = t1; t1 = tmp; }
      if (t0 > lo) { lo = t0; }
      if (t1 < hi) { hi = t1; }
      if (lo > hi) { return false; }
    }
  }
  return true;
}

fn newtonPolish(b: u32, n1: vec3f, d1: f32, n2: vec3f, d2: f32,
                u: ptr<function, f32>, v: ptr<function, f32>) {
  for (var it = 0; it < 12; it = it + 1) {
    var S: vec3f; var Su: vec3f; var Sv: vec3f;
    bezPartials(b, *u, *v, &S, &Su, &Sv);
    let F1 = dot(n1, S) - d1;
    let F2 = dot(n2, S) - d2;
    if (abs(F1) < 1e-6 && abs(F2) < 1e-6) { break; }
    let J00 = dot(n1, Su); let J01 = dot(n1, Sv);
    let J10 = dot(n2, Su); let J11 = dot(n2, Sv);
    let det = J00 * J11 - J01 * J10;
    if (abs(det) < 1e-12) { break; }
    let ddu = (-F1 * J11 + J01 * F2) / det;
    let ddv = (-J00 * F2 + J10 * F1) / det;
    *u = clamp(*u + ddu, 0.0, 1.0);
    *v = clamp(*v + ddv, 0.0, 1.0);
  }
}

// ---- intersections ------------------------------------------------------
fn isectPlane(b: u32, ro: vec3f, rd: vec3f, tmin: f32, tmax: f32) -> Hit {
  var h: Hit; h.hit = false;
  let pn = sv3(b + 13u);
  let pp = sv3(b + 10u);
  let denom = dot(pn, rd);
  if (abs(denom) < 1e-9) { return h; }
  let t = dot(pp - ro, pn) / denom;
  if (t <= tmin || t >= tmax) { return h; }
  h.hit = true; h.t = t; h.p = ro + rd * t;
  h.n = select(-pn, pn, denom < 0.0);
  return h;
}

fn isectTorus(b: u32, ro: vec3f, rd: vec3f, tmin: f32, tmax: f32) -> Hit {
  var h: Hit; h.hit = false;
  let c = sv3(b + 10u);
  let bx = sv3(b + 13u); let by = sv3(b + 16u); let bz = sv3(b + 19u);
  let R = scene[b + 22u]; let r = scene[b + 23u];

  let oc = ro - c;
  let O = vec3f(dot(oc, bx), dot(oc, by), dot(oc, bz));
  let Dd = vec3f(dot(rd, bx), dot(rd, by), dot(rd, bz));

  let R2 = R * R; let r2 = r * r;
  let Aa = dot(Dd, Dd);
  let Bb = 2.0 * dot(O, Dd);
  let Cc = dot(O, O) + R2 - r2;
  let a2 = Dd.x * Dd.x + Dd.y * Dd.y;
  let b2 = 2.0 * (O.x * Dd.x + O.y * Dd.y);
  let c2 = O.x * O.x + O.y * O.y;

  let k4 = Aa * Aa;
  let k3 = 2.0 * Aa * Bb;
  let k2 = Bb * Bb + 2.0 * Aa * Cc - 4.0 * R2 * a2;
  let k1 = 2.0 * Bb * Cc - 4.0 * R2 * b2;
  let k0 = Cc * Cc - 4.0 * R2 * c2;

  var roots: array<f32,4>;
  let nn = quarticRoots(k4, k3, k2, k1, k0, &roots);

  // The quartic coefficients are themselves inaccurate in f32, so a root of the
  // f32 quartic does not sit exactly on the true torus (worst at grazing/edge
  // rays, where it speckles the silhouette). Snap each candidate onto the exact
  // implicit torus with a couple of Newton steps and reject any that will not
  // converge -- the analogue of the Bezier patch polish.
  let ftol = 1e-3 * (R2 * R2 + r2 * r2 + 1.0);
  var best = tmax; var found = false;
  for (var i = 0; i < nn; i = i + 1) {
    var t = roots[i];
    for (var it = 0; it < 3; it = it + 1) {
      let q = O + Dd * t;
      let s = dot(q, q) + R2 - r2;
      let F = s * s - 4.0 * R2 * (q.x * q.x + q.y * q.y);
      let grad = vec3f(q.x * (s - 2.0 * R2), q.y * (s - 2.0 * R2), q.z * s) * 4.0;
      let dF = dot(grad, Dd);
      if (abs(dF) < 1e-20) { break; }
      t = t - F / dF;
    }
    let q = O + Dd * t;
    let s = dot(q, q) + R2 - r2;
    let F = s * s - 4.0 * R2 * (q.x * q.x + q.y * q.y);
    if (abs(F) > ftol) { continue; }
    if (t > tmin && t < best) { best = t; found = true; }
  }
  if (!found) { return h; }

  let pl = O + Dd * best;
  let ss = pl.x * pl.x + pl.y * pl.y + pl.z * pl.z + R2 - r2;
  let gl = vec3f(pl.x * (ss - 2.0 * R2), pl.y * (ss - 2.0 * R2), pl.z * ss);
  var nw = normalize(bx * gl.x + by * gl.y + bz * gl.z);
  if (dot(nw, rd) > 0.0) { nw = -nw; }
  h.hit = true; h.t = best; h.p = ro + rd * best; h.n = nw;
  return h;
}

fn isectBezier(b: u32, ro: vec3f, rd: vec3f, tmin: f32, tmax: f32) -> Hit {
  var h: Hit; h.hit = false;

  var mn = bezCP(b, 0u); var mx = mn;
  for (var k = 1u; k < 9u; k = k + 1u) {
    let c = bezCP(b, k);
    mn = min(mn, c); mx = max(mx, c);
  }
  if (!rayAabb(ro, rd, mn, mx, tmin, tmax)) { return h; }

  let dn = normalize(rd);
  var n1: vec3f; var n2: vec3f;
  basis(dn, &n1, &n2);
  let d1 = dot(n1, ro);
  let d2 = dot(n2, ro);
  let dd = dot(rd, rd);

  // f32-robust patch intersection. The strip-quartic seeding used by the double
  // CPU path is ill-conditioned in single precision -- it both misses real hits
  // (cracks in the patch) and invents spurious ones. Instead, run Newton on the
  // two-plane system F1 = n1.S - d1, F2 = n2.S - d2 from a grid of (u,v) seeds
  // and accept a converged point when it lies within THICK of the ray line: a
  // small surface "thickness" (a shell) that stops thin patches from cracking
  // under f32. THICK is world-space and tunable -- larger = thicker, crack-free
  // but blunter silhouettes.
  let THICK = 4e-3;
  let thick2 = THICK * THICK;
  let SEED = 5;
  var best = tmax; var found = false;
  var bn = vec3f(0.0, 1.0, 0.0);
  for (var si = 0; si < SEED; si = si + 1) {
    for (var sj = 0; sj < SEED; sj = sj + 1) {
      var uu = (f32(si) + 0.5) / f32(SEED);
      var vv = (f32(sj) + 0.5) / f32(SEED);
      newtonPolish(b, n1, d1, n2, d2, &uu, &vv);
      var S: vec3f; var Su: vec3f; var Sv: vec3f;
      bezPartials(b, uu, vv, &S, &Su, &Sv);
      let e1 = dot(n1, S) - d1;
      let e2 = dot(n2, S) - d2;
      if (e1 * e1 + e2 * e2 > thick2) { continue; }   // outside the shell
      let t = dot(S - ro, rd) / dd;
      if (t <= tmin || t >= best) { continue; }
      var nrm = normalize(cross(Su, Sv));
      if (dot(nrm, rd) > 0.0) { nrm = -nrm; }
      best = t; found = true; bn = nrm;
    }
  }
  if (!found) { return h; }
  h.hit = true; h.t = best; h.p = ro + rd * best; h.n = bn;
  return h;
}

fn intersect(i: u32, ro: vec3f, rd: vec3f, tmin: f32, tmax: f32) -> Hit {
  let b = surfBase(i);
  let kind = surfKind(b);
  if (kind == KIND_PLANE) { return isectPlane(b, ro, rd, tmin, tmax); }
  if (kind == KIND_TORUS) { return isectTorus(b, ro, rd, tmin, tmax); }
  return isectBezier(b, ro, rd, tmin, tmax);
}

fn sceneHit(ro: vec3f, rd: vec3f, tmin: f32, tmax: f32) -> Hit {
  var best: Hit; best.hit = false;
  var closest = tmax;
  let ns = nSurf();
  for (var i = 0u; i < ns; i = i + 1u) {
    let hh = intersect(i, ro, rd, tmin, closest);
    if (hh.hit && hh.t < closest) { closest = hh.t; best = hh; best.surf = i; }
  }
  return best;
}

fn sky(dir: vec3f) -> vec3f {
  let d = normalize(dir);
  let t = clamp(0.5 * (d.y + 1.0), 0.0, 1.0);
  return mix(skyBottom(), skyTop(), t);
}

// ---- shading (Cook-Torrance) -------------------------------------------
fn ndfGGX(NdotH: f32, rough: f32) -> f32 {
  let a = rough * rough;
  let a2 = a * a;
  let d = NdotH * NdotH * (a2 - 1.0) + 1.0;
  return a2 / (PI * d * d + 1e-9);
}
fn gSchlick(NdotX: f32, k: f32) -> f32 {
  return NdotX / (NdotX * (1.0 - k) + k + 1e-9);
}
fn gSmith(NdotV: f32, NdotL: f32, rough: f32) -> f32 {
  let k = (rough + 1.0) * (rough + 1.0) / 8.0;
  return gSchlick(NdotV, k) * gSchlick(NdotL, k);
}
fn fresnel(cosT: f32, F0: vec3f) -> vec3f {
  let f = pow(clamp(1.0 - cosT, 0.0, 1.0), 5.0);
  return F0 + (vec3f(1.0) - F0) * f;
}

fn surfaceAlbedo(b: u32, kind: u32, p: vec3f) -> vec3f {
  var base = matAlbedo(b);
  if (kind == KIND_PLANE && scene[b + 16u] != 0.0) {
    let sc = scene[b + 20u];
    let cx = i32(floor(p.x * sc));
    let cz = i32(floor(p.z * sc));
    if (((cx + cz) & 1) == 0) { base = sv3(b + 17u); }
  }
  return base;
}

fn shadeDirect(h: Hit, wo: vec3f) -> vec3f {
  let b = surfBase(h.surf);
  let kind = surfKind(b);
  let N = h.n;
  let albedo = surfaceAlbedo(b, kind, h.p);
  let metallic = matMetallic(b);
  let rough = matRough(b);
  let NdotV = max(dot(N, wo), 1e-4);
  let F0 = vec3f(0.04) * (1.0 - metallic) + albedo * metallic;

  var Lo = matEmissive(b);
  let nl = nLight();
  for (var i = 0u; i < nl; i = i + 1u) {
    let lb = LIGHTS_BASE + i * LSTRIDE;
    let lkind = scene[lb];
    let lv = sv3(lb + 1u);
    let lcolor = sv3(lb + 4u);
    let lint = scene[lb + 7u];

    var L: vec3f;
    var radiance: vec3f;
    var maxdist: f32;
    if (lkind == 0.0) {
      L = normalize(lv);
      radiance = lcolor * lint;
      maxdist = 1e30;
    } else {
      let dv = lv - h.p;
      let dist2 = dot(dv, dv);
      let dist = sqrt(dist2);
      L = dv / dist;
      radiance = lcolor * (lint / max(dist2, 1e-6));
      maxdist = dist;
    }

    let NdotL = dot(N, L);
    if (NdotL <= 0.0) { continue; }

    // Larger shadow-ray offset than the CPU path: f32 self-intersection would
    // otherwise speckle curved surfaces with shadow acne.
    let so = h.p + N * 2e-3;
    let sh = sceneHit(so, L, 2e-3, maxdist - 2e-3);
    if (sh.hit) { continue; }

    let Hh = normalize(wo + L);
    let NdotH = max(dot(N, Hh), 0.0);
    let VdotH = max(dot(wo, Hh), 0.0);
    let D = ndfGGX(NdotH, rough);
    let G = gSmith(NdotV, NdotL, rough);
    let F = fresnel(VdotH, F0);
    let spec = F * (D * G / (4.0 * NdotV * NdotL + 1e-6));
    let kd = (vec3f(1.0) - F) * (1.0 - metallic);
    let diffuse = kd * albedo * (1.0 / PI);
    Lo = Lo + (diffuse + spec) * (radiance * NdotL);
  }

  let ambEnv = sky(N);
  let amb = albedo * ambEnv * (ambient() * (1.0 - 0.5 * metallic));
  return Lo + amb;
}

// ---- trace (iterative; mirrors render.c recursion) ----------------------
fn trace(ro0: vec3f, rd0: vec3f, maxDepth: i32) -> vec3f {
  var ro = ro0;
  var rd = rd0;
  var accum = vec3f(0.0);
  var throughput = vec3f(1.0);

  for (var depth = 0; depth <= maxDepth; depth = depth + 1) {
    let h = sceneHit(ro, rd, 1e-4, 1e30);
    if (!h.hit) {
      accum = accum + throughput * sky(rd);
      break;
    }
    let b = surfBase(h.surf);
    let wo = normalize(-rd);
    accum = accum + throughput * shadeDirect(h, wo);

    let metallic = matMetallic(b);
    let rough = matRough(b);
    var strength = matReflect(b) + metallic * (1.0 - rough);
    if (depth == maxDepth || strength <= 1e-3) { break; }
    strength = clamp(strength, 0.0, 1.0);

    let albedo = matAlbedo(b);
    let F0 = vec3f(0.04) * (1.0 - metallic) + albedo * metallic;
    let NdotV = max(dot(h.n, wo), 0.0);
    let f = pow(clamp(1.0 - NdotV, 0.0, 1.0), 5.0);
    let F = F0 + (vec3f(1.0) - F0) * f;

    throughput = throughput * (F * strength);
    rd = reflect(normalize(rd), h.n);
    ro = h.p + h.n * 1e-4;
  }
  return accum;
}

// ---- tone map + output --------------------------------------------------
fn aces(x: f32) -> f32 {
  let a = 2.51; let b = 0.03; let c = 2.43; let d = 0.59; let e = 0.14;
  let y = (x * (a * x + b)) / (x * (c * x + d) + e);
  return clamp(y, 0.0, 1.0);
}
fn toSrgb8(lin: f32) -> u32 {
  let c = pow(aces(lin), 1.0 / 2.2);
  return u32(clamp(c * 255.0 + 0.5, 0.0, 255.0));
}

fn xorshift(st: ptr<function, u32>) -> u32 {
  var x = *st;
  x = x ^ (x << 13u);
  x = x ^ (x >> 17u);
  x = x ^ (x << 5u);
  *st = x;
  return x;
}
fn rnd(st: ptr<function, u32>) -> f32 {
  return f32(xorshift(st) >> 8u) * (1.0 / 16777216.0);
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let W = P.W; let H = P.H;
  if (gid.x >= W || gid.y >= H) { return; }
  let x = gid.x; let y = gid.y;

  let aspect = f32(W) / f32(H);
  let cam = camPos();
  let fwd = normalize(camTarget() - cam);
  let right = normalize(cross(fwd, camUp()));
  let up = cross(right, fwd);
  let parallel = camProj() > 0.5;
  let halfH = select(tan(camFov() * 0.5), camOrtho() * 0.5, parallel);
  let halfW = halfH * aspect;

  let spp = max(P.spp, 1u);
  var st = (y * W + x) * 2654435761u + 1u;
  var acc = vec3f(0.0);
  for (var s = 0u; s < spp; s = s + 1u) {
    var jx = 0.5; var jy = 0.5;
    if (spp > 1u) { jx = rnd(&st); jy = rnd(&st); }
    let px = (2.0 * (f32(x) + jx) / f32(W) - 1.0) * halfW;
    let py = (1.0 - 2.0 * (f32(y) + jy) / f32(H)) * halfH;
    let plane = right * px + up * py;
    // Perspective: fixed origin, direction varies. Parallel: fixed direction
    // (forward), origin slides across the image plane.
    let ro = select(cam, cam + plane, parallel);
    let rd = select(normalize(fwd + plane), fwd, parallel);
    acc = acc + trace(ro, rd, P.maxDepth);
  }
  let col = acc * (P.exposure / f32(spp));

  let idx = y * W + x;
  let packed = toSrgb8(col.x) | (toSrgb8(col.y) << 8u) | (toSrgb8(col.z) << 16u) | (255u << 24u);
  outp[idx] = packed;
}
`;

  // ---- WebGPU host --------------------------------------------------------
  let device = null;
  let pipeline = null;
  let paramsBuf = null;
  let sceneBuf = null, sceneBufFloats = 0;
  let outBuf = null, readBuf = null, outBytes = 0;
  let initTried = false, ok = false, adapterInfo = "";

  async function gpuInit() {
    if (initTried) return ok;
    initTried = true;
    if (!("gpu" in navigator)) { ok = false; return false; }
    try {
      const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
      if (!adapter) { ok = false; return false; }
      device = await adapter.requestDevice();
      device.lost.then(() => { ok = false; });

      const module = device.createShaderModule({ code: WGSL });
      // Surface compile errors early so we can fall back cleanly.
      if (module.getCompilationInfo) {
        const info = await module.getCompilationInfo();
        const errs = info.messages.filter((m) => m.type === "error");
        if (errs.length) {
          console.error("WGSL compile errors:", errs);
          ok = false; return false;
        }
      }
      pipeline = device.createComputePipeline({
        layout: "auto",
        compute: { module, entryPoint: "main" },
      });
      paramsBuf = device.createBuffer({
        size: 32,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      try {
        const ai = adapter.info || (adapter.requestAdapterInfo ? await adapter.requestAdapterInfo() : null);
        if (ai) adapterInfo = [ai.vendor, ai.architecture, ai.description].filter(Boolean).join(" ");
      } catch (e) { /* optional */ }
      ok = true;
      return true;
    } catch (e) {
      console.error("WebGPU init failed:", e);
      ok = false;
      return false;
    }
  }

  function ensureBuffers(sceneFloats, bytes) {
    if (!sceneBuf || sceneBufFloats < sceneFloats) {
      if (sceneBuf) sceneBuf.destroy();
      sceneBufFloats = Math.max(sceneFloats, 256);
      sceneBuf = device.createBuffer({
        size: sceneBufFloats * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
    }
    if (!outBuf || outBytes < bytes) {
      if (outBuf) outBuf.destroy();
      if (readBuf) readBuf.destroy();
      outBytes = bytes;
      outBuf = device.createBuffer({
        size: bytes,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      });
      readBuf = device.createBuffer({
        size: bytes,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
      });
    }
  }

  // Render one frame on the GPU. 'scene' is the Float32Array from
  // tmdw_scene_export. Returns a Uint8ClampedArray (W*H*4 RGBA), or null on
  // failure so the caller can fall back to the CPU path.
  async function gpuRender(scene, W, H, opts) {
    if (!ok || !device) return null;
    try {
      const bytes = W * H * 4;
      ensureBuffers(scene.length, bytes);

      device.queue.writeBuffer(sceneBuf, 0, scene.buffer, scene.byteOffset, scene.byteLength);

      const params = new ArrayBuffer(32);
      const dv = new DataView(params);
      dv.setUint32(0, W, true);
      dv.setUint32(4, H, true);
      dv.setUint32(8, Math.max(1, opts.spp | 0), true);
      dv.setInt32(12, opts.depth | 0, true);
      dv.setFloat32(16, opts.exposure, true);
      device.queue.writeBuffer(paramsBuf, 0, params);

      const bind = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: sceneBuf } },
          { binding: 1, resource: { buffer: paramsBuf } },
          { binding: 2, resource: { buffer: outBuf } },
        ],
      });

      const enc = device.createCommandEncoder();
      const pass = enc.beginComputePass();
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bind);
      pass.dispatchWorkgroups(Math.ceil(W / 8), Math.ceil(H / 8), 1);
      pass.end();
      enc.copyBufferToBuffer(outBuf, 0, readBuf, 0, bytes);
      device.queue.submit([enc.finish()]);

      await readBuf.mapAsync(GPUMapMode.READ, 0, bytes);
      const copy = new Uint8ClampedArray(readBuf.getMappedRange(0, bytes).slice(0));
      readBuf.unmap();
      return copy;
    } catch (e) {
      console.error("WebGPU render failed:", e);
      return null;
    }
  }

  window.tmdGPU = {
    init: gpuInit,
    render: gpuRender,
    available: () => ok,
    info: () => adapterInfo,
    layout: { HEADER, LIGHTS_BASE, SURF_BASE, SSTRIDE },
  };
})();
