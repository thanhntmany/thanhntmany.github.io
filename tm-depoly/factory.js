/*
 * TM-Depoly — automated robot-factory background.
 *
 * The site's shared, position-fixed 3D backdrop: an automated factory — solid
 * monochrome floor, two conveyor belts with crates, three articulated robot
 * arms, support pillars, an overhead light bar and a chrome torus accent.
 *
 * Two stacked layers, one geometry model:
 *   - #wire  a live VECTOR "blueprint" (2D canvas). Cheap enough to run at 60fps,
 *            so it carries the scroll-linked camera fly-through, the progressive
 *            boot and the running machines without touching the ray tracer.
 *   - #rt    the tmd WASM ray-traced "photo". Rendering curved/box geometry is a
 *            CPU-path job in tmd, so we do it only as a FOCUS pass: when the view
 *            settles (no scroll / drag for a moment) we ray-trace the current
 *            instant and cross-fade it in (blueprint fades out); any new motion
 *            snaps back to the blueprint. Outline-first keeps it lag-free.
 *
 * buildPrims(t) produces one flat list of primitive descriptors; drawWire() strokes
 * them and emitRT() feeds the exact same geometry to tmd — the two layers can never
 * drift apart.
 *
 * Camera: scroll drives a fly-through path through the factory; the "control room"
 * section switches to FREE mode (drag = orbit, wheel = zoom, buttons actuate).
 *
 * Host protocol — the parent window posts:
 *   {type:"tmd:cmd", cmd:"scroll", p:<0..1>}            page scroll progress
 *   {type:"tmd:cmd", cmd:"mode",   free:<bool>}         free control on/off
 *   {type:"tmd:cmd", cmd:"line",   on:<bool>}           run / stop the belts
 *   {type:"tmd:cmd", cmd:"robot",  id:"A"|"B"|"C", on}  toggle a robot
 *   {type:"tmd:cmd", cmd:"view",   preset:"overview"|"line"|"arm"|"top"}
 *   {type:"tmd:cmd", cmd:"reset"}
 * and we post "tmd:ready" / "tmd:error" (first blueprint frame / boot failure) and
 * {type:"tmd:state", line, free, robots:{A,B,C}} so the panel can reflect state.
 */
(function () {
  "use strict";

  const wire = document.getElementById("wire");
  const rtc = document.getElementById("rt");
  const wctx = wire.getContext("2d");
  const rctx = rtc.getContext("2d");
  const reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let tmd = null, tmdReady = false;
  let cw = 900, ch = 500, dpr = 1;   // blueprint CSS size + pixel ratio
  let RW = 900, RH = 460;            // ray-trace buffer size

  // ---- vec helpers -------------------------------------------------------
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---- timing / reveal ---------------------------------------------------
  const REVEAL_STEP = 0.4, INTRO = 0.7;
  let animT = 0, lastNow = 0;
  function eob(x) { const c1 = 1.70158, c3 = c1 + 1, u = x - 1; return 1 + c3 * u * u * u + c1 * u * u; }

  // ---- machine / mode state ----------------------------------------------
  let running = !reducedMotion;
  const robotOn = { A: !reducedMotion, B: false, C: !reducedMotion };
  let freeMode = false;         // control room takes the wheel
  let scrollP = 0;              // page scroll progress 0..1
  let active = true;            // host marks the backdrop on/off screen (occlusion)

  // ---- camera ------------------------------------------------------------
  // Fly-through waypoints the page scroll interpolates between.
  const PATH = [
    { target: [0.0, 1.2, 0.0], azim: -0.72, elev: 0.50, radius: 15.5 },
    { target: [0.0, 1.1, -0.6], azim: -0.30, elev: 0.33, radius: 11.5 },
    { target: [-0.4, 1.0, -1.3], azim: 0.18, elev: 0.18, radius: 8.6 },
    { target: [-1.2, 1.6, -2.7], azim: 0.60, elev: 0.30, radius: 8.2 },
    { target: [0.0, 0.7, -0.4], azim: 1.00, elev: 0.82, radius: 13.0 },
  ];
  const PRESETS = {
    overview: PATH[0], line: PATH[2], arm: PATH[3], top: PATH[4],
  };
  const cam = { target: PATH[0].target.slice(), azim: PATH[0].azim, elev: PATH[0].elev, radius: PATH[0].radius };
  const goal = Object.assign({}, cam, { target: cam.target.slice() });
  let easing = false;

  function pathAt(p) {
    const n = PATH.length - 1, f = clamp(p, 0, 1) * n;
    const i = Math.min(n - 1, Math.floor(f)), t = f - i, a = PATH[i], b = PATH[i + 1];
    return {
      target: [lerp(a.target[0], b.target[0], t), lerp(a.target[1], b.target[1], t), lerp(a.target[2], b.target[2], t)],
      azim: lerp(a.azim, b.azim, t), elev: lerp(a.elev, b.elev, t), radius: lerp(a.radius, b.radius, t),
    };
  }
  function applyCam(c) { cam.target = c.target.slice(); cam.azim = c.azim; cam.elev = c.elev; cam.radius = c.radius; }
  function setGoal(c) { goal.target = c.target.slice(); goal.azim = c.azim; goal.elev = c.elev; goal.radius = c.radius; easing = true; }
  function stepEase() {
    if (!easing) return false;
    const k = 0.2, e = 1e-3; let m = false;
    cam.azim += (goal.azim - cam.azim) * k; cam.elev += (goal.elev - cam.elev) * k; cam.radius += (goal.radius - cam.radius) * k;
    for (let i = 0; i < 3; i++) cam.target[i] += (goal.target[i] - cam.target[i]) * k;
    if (Math.abs(goal.azim - cam.azim) > e || Math.abs(goal.elev - cam.elev) > e || Math.abs(goal.radius - cam.radius) > e) m = true;
    for (let i = 0; i < 3; i++) if (Math.abs(goal.target[i] - cam.target[i]) > e) m = true;
    easing = m; return m;
  }
  function eye() {
    return [cam.target[0] + cam.radius * Math.cos(cam.elev) * Math.sin(cam.azim),
            cam.target[1] + cam.radius * Math.sin(cam.elev),
            cam.target[2] + cam.radius * Math.cos(cam.elev) * Math.cos(cam.azim)];
  }

  function fit() {
    cw = wire.clientWidth || window.innerWidth; ch = wire.clientHeight || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    wire.width = Math.round(cw * dpr); wire.height = Math.round(ch * dpr);
    wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    RH = 448; RW = Math.max(480, Math.round(RH * cw / ch));   // same aspect as display → no crop
    rtc.width = RW; rtc.height = RH;
  }

  // ---- materials (r,g,b, metal, rough, reflect) + blueprint stroke color --
  const MAT = {
    floor:  [0.16, 0.18, 0.23, 0.0, 0.5, 0.07],
    belt:   [0.11, 0.12, 0.15, 0.0, 0.85, 0.02],
    roller: [0.70, 0.72, 0.78, 1.0, 0.28, 0.4],
    white:  [0.88, 0.90, 0.94, 0.1, 0.35, 0.08],
    joint:  [0.15, 0.40, 1.00, 0.3, 0.40, 0.3],
    chrome: [0.74, 0.76, 0.82, 1.0, 0.12, 0.6],
    crateB: [0.10, 0.36, 0.95, 0.0, 0.45, 0.05],
    crateA: [0.95, 0.60, 0.12, 0.0, 0.5, 0.04],
    pillar: [0.18, 0.20, 0.25, 0.2, 0.6, 0.06],
    bar:    [0.80, 0.82, 0.86, 0.6, 0.3, 0.3],
  };
  const INK = {                 // blueprint stroke colors (r,g,b strings)
    struct: "123,160,255", white: "150,180,255", joint: "150,200,255",
    chrome: "150,220,255", crateB: "90,150,255", crateA: "255,180,90",
    pillar: "90,110,160", bar: "150,190,255", roller: "150,210,255",
  };

  // ---- geometry: one model, two renderers --------------------------------
  const grow = (anchor, pt, p) =>
    [anchor[0] + (pt[0] - anchor[0]) * p, anchor[1] + (pt[1] - anchor[1]) * p, anchor[2] + (pt[2] - anchor[2]) * p];

  function emitBox(P, center, half, mat, ink, p, anchor) {
    const c = grow(anchor, center, p), h = [half[0] * p, half[1] * p, half[2] * p];
    P.push({ k: "box", c, h, mat, ink });
  }
  function emitCyl(P, p0, p1, r, mat, ink, p, anchor) {
    P.push({ k: "cyl", a: grow(anchor, p0, p), b: grow(anchor, p1, p), r: r * p, mat, ink });
  }
  function emitSphere(P, center, r, mat, ink, p, anchor) {
    P.push({ k: "sphere", c: grow(anchor, center, p), r: r * p, mat, ink });
  }

  function robotArm(P, def, p, t) {
    const anchor = [def.x, 0, def.z], on = robotOn[def.id] && !reducedMotion, w = 0.9, ph = def.phase;
    const yaw = def.yaw0 + (on ? 0.6 * Math.sin(w * t + ph) : 0);
    const s = def.s0 + (on ? 0.45 * Math.sin(w * t * 1.1 + ph) : 0);
    const e = def.e0 + (on ? 0.5 * Math.sin(w * t * 1.3 + ph + 1.1) : 0);
    const dH = [Math.sin(yaw), 0, Math.cos(yaw)], baseTop = [def.x, def.baseH, def.z], S = baseTop;
    const E = [S[0] + def.L1 * Math.sin(s) * dH[0], S[1] + def.L1 * Math.cos(s), S[2] + def.L1 * Math.sin(s) * dH[2]];
    const a2 = s + e;
    const Wst = [E[0] + def.L2 * Math.sin(a2) * dH[0], E[1] + def.L2 * Math.cos(a2), E[2] + def.L2 * Math.sin(a2) * dH[2]];
    emitCyl(P, [def.x, 0, def.z], baseTop, 0.42, MAT.white, INK.white, p, anchor);
    emitSphere(P, S, 0.30, MAT.joint, INK.joint, p, anchor);
    emitCyl(P, S, E, 0.15, MAT.white, INK.white, p, anchor);
    emitSphere(P, E, 0.22, MAT.joint, INK.joint, p, anchor);
    emitCyl(P, E, Wst, 0.12, MAT.white, INK.white, p, anchor);
    emitSphere(P, Wst, 0.17, MAT.chrome, INK.chrome, p, anchor);
  }
  function belt(P, def, p) {
    const anchor = [(def.x0 + def.x1) / 2, 0, def.z], cx = (def.x0 + def.x1) / 2, len = (def.x1 - def.x0) / 2;
    emitBox(P, [cx, def.y, def.z], [len, 0.1, def.w], MAT.belt, INK.struct, p, anchor);
    emitBox(P, [def.x0 + 0.4, def.y / 2, def.z], [0.12, def.y / 2, def.w], MAT.pillar, INK.pillar, p, anchor);
    emitBox(P, [def.x1 - 0.4, def.y / 2, def.z], [0.12, def.y / 2, def.w], MAT.pillar, INK.pillar, p, anchor);
    emitCyl(P, [def.x0, def.y, def.z - def.w], [def.x0, def.y, def.z + def.w], 0.18, MAT.roller, INK.roller, p, anchor);
    emitCyl(P, [def.x1, def.y, def.z - def.w], [def.x1, def.y, def.z + def.w], 0.18, MAT.roller, INK.roller, p, anchor);
  }
  function crates(P, def, p, t) {
    const span = def.x1 - def.x0 - 0.8, n = def.n, gap = span / n, drift = running ? (t * def.speed) % gap : 0;
    for (let i = 0; i < n; i++) {
      const x = def.x0 + 0.4 + ((i * gap + drift) % span), anchor = [x, def.y + 0.1, def.z];
      const mat = i % 2 ? MAT.crateA : MAT.crateB, ink = i % 2 ? INK.crateA : INK.crateB;
      emitBox(P, [x, def.y + 0.38, def.z], [0.3, 0.28, 0.3], mat, ink, p, anchor);
    }
  }

  const BELT_A = { x0: -4.2, x1: 4.2, y: 0.82, z: -1.6, w: 0.46 };
  const BELT_B = { x0: -4.2, x1: 4.2, y: 0.82, z: 1.7, w: 0.46 };
  const ACTORS = [
    { intro: false, f: () => {} },                                  // 0 floor (handled apart)
    { f: (P, p) => { for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const a = [sx * 5.6, 0, sz * 3.6]; emitBox(P, [sx * 5.6, 2.6, sz * 3.6], [0.22, 2.6, 0.22], MAT.pillar, INK.pillar, p, a); } } },
    { f: (P, p) => emitBox(P, [0, 5.1, 0], [5.4, 0.12, 0.3], MAT.bar, INK.bar, p, [0, 5.1, 0]) },
    { f: (P, p) => belt(P, BELT_A, p) },
    { f: (P, p) => belt(P, BELT_B, p) },
    { f: (P, p, t) => robotArm(P, { id: "A", x: -3.2, z: -3.3, baseH: 1.0, L1: 1.5, L2: 1.2, yaw0: 0.5, s0: 0.7, e0: -0.9, phase: 0.0 }, p, t) },
    { f: (P, p, t) => robotArm(P, { id: "B", x: 0.0, z: -3.5, baseH: 1.1, L1: 1.6, L2: 1.25, yaw0: 0.0, s0: 0.6, e0: -0.8, phase: 2.1 }, p, t) },
    { f: (P, p, t) => robotArm(P, { id: "C", x: 3.2, z: -3.3, baseH: 1.0, L1: 1.5, L2: 1.2, yaw0: -0.5, s0: 0.7, e0: -0.9, phase: 4.0 }, p, t) },
    { f: (P, p, t) => crates(P, Object.assign({ n: 5, speed: 0.9 }, BELT_A), p, t) },
    { f: (P, p, t) => crates(P, Object.assign({ n: 5, speed: 0.7 }, BELT_B), p, t) },
    { f: (P, p, t) => { const by = 2.7 + (reducedMotion ? 0 : 0.18 * Math.sin(t * 0.8)); P.push({ k: "torus", c: [0, by, 0], R: 0.8, cr: 0.26, mat: MAT.chrome, ink: INK.chrome }); } },
  ];
  ACTORS.forEach((a, i) => { a.index = i; });
  const LAST_REVEAL = (ACTORS.length - 1) * REVEAL_STEP;

  function buildPrims(t) {
    const P = [];
    for (const a of ACTORS) {
      if (a.index === 0) continue;                       // floor is drawn directly
      const rt = a.index * REVEAL_STEP;
      if (!reducedMotion && t < rt) continue;
      const p = (a.intro === false || reducedMotion) ? 1 : eob(clamp((t - rt) / INTRO, 0, 1));
      a.f(P, p, t);
    }
    return P;
  }

  // ---- blueprint (vector) renderer ---------------------------------------
  function project(basis, P) {
    const d = sub(P, basis.e), vz = dot(d, basis.f);
    if (vz <= 0.06) return null;
    return { x: cw / 2 + (dot(d, basis.r) / vz) * basis.fl, y: ch / 2 - (dot(d, basis.u) / vz) * basis.fl, z: vz };
  }
  function viewBasis() {
    const e = eye(), f = norm(sub(cam.target, e)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
    return { e, f, r, u, fl: (ch / 2) / Math.tan((46 * Math.PI / 180) / 2) };
  }
  const BOX_EDGES = [[0,1],[1,3],[3,2],[2,0],[4,5],[5,7],[7,6],[6,4],[0,4],[1,5],[2,6],[3,7]];
  function depthAlpha(z) { return clamp(1.5 - z / 24, 0.22, 0.95); }

  function drawWire(prims) {
    const b = viewBasis();
    // Sky + solid monochrome ground split at the horizon line.
    const horiz = project(b, [b.e[0] + norm([b.f[0], 0, b.f[2]])[0] * 800, 0, b.e[2] + norm([b.f[0], 0, b.f[2]])[2] * 800]);
    const hy = clamp(horiz ? horiz.y : ch * 0.42, -40, ch + 40);
    wctx.clearRect(0, 0, cw, ch);
    const sky = wctx.createLinearGradient(0, 0, 0, Math.max(1, hy));
    sky.addColorStop(0, "#060910"); sky.addColorStop(1, "#0b1324");
    wctx.fillStyle = sky; wctx.fillRect(0, 0, cw, Math.max(0, hy));
    const gnd = wctx.createLinearGradient(0, hy, 0, ch);
    gnd.addColorStop(0, "#0e1830"); gnd.addColorStop(1, "#070c17");
    wctx.fillStyle = gnd; wctx.fillRect(0, Math.max(0, hy), cw, ch - Math.max(0, hy));
    wctx.fillStyle = "rgba(90,130,230,.18)"; wctx.fillRect(0, hy - 1, cw, 2);  // horizon glow
    wctx.lineJoin = "round"; wctx.lineCap = "round";

    for (const o of prims) {
      if (o.k === "box") {
        const c = o.c, h = o.h, pts = [];
        for (let i = 0; i < 8; i++)
          pts.push(project(b, [c[0] + (i & 1 ? h[0] : -h[0]), c[1] + (i & 2 ? h[1] : -h[1]), c[2] + (i & 4 ? h[2] : -h[2])]));
        wctx.lineWidth = 1.3;
        for (const [m, n] of BOX_EDGES) {
          const A = pts[m], B = pts[n]; if (!A || !B) continue;
          wctx.strokeStyle = `rgba(${o.ink},${depthAlpha((A.z + B.z) / 2)})`;
          wctx.beginPath(); wctx.moveTo(A.x, A.y); wctx.lineTo(B.x, B.y); wctx.stroke();
        }
      } else if (o.k === "cyl") {
        const A = project(b, o.a), B = project(b, o.b); if (!A || !B) continue;
        const z = (A.z + B.z) / 2;
        wctx.strokeStyle = `rgba(${o.ink},${depthAlpha(z)})`;
        wctx.lineWidth = clamp(o.r * b.fl / z * 2, 1.4, 22);
        wctx.beginPath(); wctx.moveTo(A.x, A.y); wctx.lineTo(B.x, B.y); wctx.stroke();
      } else if (o.k === "sphere") {
        const C = project(b, o.c); if (!C) continue;
        wctx.strokeStyle = `rgba(${o.ink},${depthAlpha(C.z)})`; wctx.lineWidth = 1.4;
        wctx.beginPath(); wctx.arc(C.x, C.y, Math.max(1.5, o.r * b.fl / C.z), 0, 6.2832); wctx.stroke();
      } else if (o.k === "torus") {
        const C = project(b, o.c); if (!C) continue;
        const rx = (o.R + o.cr) * b.fl / C.z, ry = rx * clamp(Math.sin(cam.elev) + 0.12, 0.12, 1);
        wctx.strokeStyle = `rgba(${o.ink},${depthAlpha(C.z)})`; wctx.lineWidth = 1.6;
        wctx.beginPath(); wctx.ellipse(C.x, C.y, rx, ry, 0, 0, 6.2832); wctx.stroke();
        wctx.beginPath(); wctx.ellipse(C.x, C.y, (o.R - o.cr) * b.fl / C.z, (o.R - o.cr) / (o.R + o.cr) * ry, 0, 0, 6.2832); wctx.stroke();
      }
    }
  }

  // ---- ray-trace (focus) renderer ----------------------------------------
  function emitRT(prims) {
    tmd.reset();
    tmd.env(0.035, 0.055, 0.12, 0.16, 0.22, 0.42, 0.24);
    tmd.addPlane(0, 0, 0, 0, 1, 0, MAT.floor[0], MAT.floor[1], MAT.floor[2], MAT.floor[3], MAT.floor[4], MAT.floor[5], 0);
    for (const o of prims) {
      const m = o.mat;
      if (o.k === "box") tmd.addBox(o.c[0], o.c[1], o.c[2], o.h[0], o.h[1], o.h[2], m[0], m[1], m[2], m[3], m[4], m[5]);
      else if (o.k === "cyl") tmd.addCylinder(o.a[0], o.a[1], o.a[2], o.b[0] - o.a[0], o.b[1] - o.a[1], o.b[2] - o.a[2], o.r, m[0], m[1], m[2], m[3], m[4], m[5]);
      else if (o.k === "sphere") tmd.addSphere(o.c[0], o.c[1], o.c[2], o.r, m[0], m[1], m[2], m[3], m[4], m[5]);
      else if (o.k === "torus") tmd.addTorus(o.c[0], o.c[1], o.c[2], 0.2, 1.0, 0.1, o.R, o.cr, m[0], m[1], m[2], m[3], m[4], m[5]);
    }
    tmd.addLight(0, -0.4, 1.0, 0.35, 1.0, 0.98, 0.92, 2.4);
    tmd.addLight(1, 4.5, 5.5, 4.5, 0.45, 0.6, 1.0, 34.0);
    tmd.addLight(1, -3.5, 3.0, -2.5, 1.0, 0.72, 0.42, 20.0);
    const e = eye();
    tmd.camera(e[0], e[1], e[2], cam.target[0], cam.target[1], cam.target[2], 46, 0, 0);
  }
  let rtToken = 0, rtBusy = false;
  async function renderRT() {
    if (!tmdReady || rtBusy) return;
    rtBusy = true; const my = ++rtToken;
    emitRT(buildPrims(animT));
    let out = null;
    try { out = await tmd.render(RW, RH, { spp: 1, depth: 2, exposure: 1.18, backend: "cpu", gpuCapable: false }); }
    catch (e) { out = null; }
    rtBusy = false;
    if (out && my === rtToken && !live) {          // still settled → reveal it
      rctx.putImageData(new ImageData(out.pixels, RW, RH), 0, 0);
      wire.style.opacity = "0";
    }
  }

  // ---- driver: blueprint loop + settle → ray-trace -----------------------
  let live = true, looping = false, quietAt = 0;
  const QUIET = reducedMotion ? 60 : 420;   // ms of calm before the focus pass

  function moving() {
    return !reducedMotion && (animT < LAST_REVEAL + INTRO || running || robotOn.A || robotOn.B || robotOn.C || easing);
  }
  function goLive() {
    if (!active) return;
    live = true; wire.style.opacity = "1"; quietAt = performance.now();
    if (!looping) { lastNow = performance.now(); looping = true; requestAnimationFrame(frame); }
  }
  function frame() {
    const now = performance.now();
    let dt = (now - lastNow) / 1000; lastNow = now; if (dt > 0.1) dt = 0.1;
    if (live) animT += dt;
    stepEase();
    drawWire(buildPrims(animT));
    if (!firstFrame) { firstFrame = true; signalReady(); }

    const settled = !moving();
    if (settled && now - quietAt > QUIET) { live = false; renderRT(); }
    if (!settled) quietAt = now;

    // Keep ticking while the blueprint is live (animation/interaction); once the
    // focus pass is showing and nothing moves (or the host hid us), let it sleep.
    if (active && (live || moving())) requestAnimationFrame(frame);
    else looping = false;
  }

  // ---- host messaging ----------------------------------------------------
  function post(m) { try { if (window.parent !== window) window.parent.postMessage(m, "*"); } catch (e) {} }
  function postState() { post({ type: "tmd:state", line: running, free: freeMode, robots: Object.assign({}, robotOn) }); }
  let firstFrame = false, booted = false;
  function signalReady() { if (!booted) { booted = true; post("tmd:ready"); postState(); } }
  function signalError() { if (!booted) { booted = true; post("tmd:error"); } }

  // scroll drives the fly-through unless the control room has the wheel.
  function applyScroll() { if (!freeMode) { applyCam(pathAt(scrollP)); easing = false; } }

  window.addEventListener("message", (e) => {
    const d = e.data; if (!d || d.type !== "tmd:cmd") return;
    switch (d.cmd) {
      case "scroll": scrollP = clamp(+d.p || 0, 0, 1); applyScroll(); goLive(); break;
      case "mode": freeMode = !!d.free; if (!freeMode) applyScroll(); else setGoal(pathAt(scrollP)); postState(); goLive(); break;
      case "line": running = !!d.on; postState(); goLive(); break;
      case "robot": if (d.id in robotOn) { robotOn[d.id] = !!d.on; postState(); goLive(); } break;
      case "view": setGoal(PRESETS[d.preset] || PRESETS.overview); goLive(); break;
      case "reset": running = !reducedMotion; robotOn.A = robotOn.C = !reducedMotion; robotOn.B = false; setGoal(PRESETS.overview); postState(); goLive(); break;
      case "active": active = !!d.on; if (active) goLive(); break;
    }
  });

  // ---- free-mode interaction: drag orbit, wheel zoom ---------------------
  let dragging = false, lx = 0, ly = 0;
  wire.addEventListener("pointerdown", (e) => { if (!freeMode) return; dragging = true; lx = e.clientX; ly = e.clientY; wire.setPointerCapture(e.pointerId); });
  wire.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    cam.azim -= (e.clientX - lx) * 0.008; cam.elev = clamp(cam.elev + (e.clientY - ly) * 0.006, 0.03, 1.45);
    easing = false; lx = e.clientX; ly = e.clientY; goLive();
  });
  wire.addEventListener("pointerup", (e) => { dragging = false; try { wire.releasePointerCapture(e.pointerId); } catch (_) {} });
  wire.addEventListener("wheel", (e) => {
    if (!freeMode) return; e.preventDefault();
    cam.radius = clamp(cam.radius + Math.sign(e.deltaY) * 0.6, 5.5, 22); easing = false; goLive();
  }, { passive: false });

  document.addEventListener("visibilitychange", () => { if (!document.hidden) goLive(); });
  let rs; window.addEventListener("resize", () => { clearTimeout(rs); rs = setTimeout(() => { fit(); goLive(); }, 150); });

  // ---- dev hook (verification; harmless in production) -------------------
  window.__factory = {
    async shot(opts) {
      opts = opts || {};
      if (opts.t != null) animT = opts.t;
      if (opts.scroll != null) { scrollP = opts.scroll; freeMode = false; applyScroll(); }
      if (opts.preset) { freeMode = true; applyCam(PRESETS[opts.preset]); }
      if (opts.line != null) running = opts.line;
      drawWire(buildPrims(animT));
      if (opts.rt) { live = false; await renderRT(); }
      else { wire.style.opacity = "1"; }
      return { animT, scrollP, freeMode, running, robotOn: Object.assign({}, robotOn), tmdReady };
    },
  };

  // ---- boot --------------------------------------------------------------
  fit();
  applyScroll();
  goLive();                                   // blueprint is up immediately
  if (window.TMD) {
    setTimeout(() => signalReady(), 100);     // blueprint counts as "ready"
    TMD.create({ gpu: false }).then((inst) => { tmd = inst; tmdReady = true; goLive(); })
      .catch((err) => { console.error(err); /* blueprint still works without the ray tracer */ });
  } else {
    signalReady();                            // no WASM: blueprint-only, still fine
  }
})();
