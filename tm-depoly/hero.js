/*
 * TM-Depoly — hero scene.
 *
 * A branded, auto-rotating 3D scene rendered live by the tmd WASM engine for the
 * site hero. It consumes the shared library bundle (window.TMD, from tmd.lib.js):
 * a blue/white/chrome composition (Bézier patches + a chrome torus) orbited by a
 * camera. Drag to orbit, wheel/pinch to zoom, click to pause/resume the spin.
 *
 * Performance & resilience:
 *   - Auto-rotation runs only when WebGPU is available; on the CPU (wasm) path the
 *     scene renders once and stays interactive (drag/zoom) to keep weak devices smooth.
 *   - Renders are coalesced and driven by completion, so we never queue frames faster
 *     than the device can draw them.
 *   - Posts "tmd:ready" to the parent after the first frame so the host can fade the
 *     live canvas in over its static poster; "tmd:error" if the engine fails to boot.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("view");
  const ctx = canvas.getContext("2d");

  let tmd = null;
  let W = 820, H = 540;

  // Orbit camera around the composition.
  const target = [0.1, 0.85, 0.0];
  let azim = -0.35, elev = 0.40, radius = 8.4;

  let autorot = false;        // continuous spin (GPU only)
  let dragging = false;
  let rendering = false, pending = false, firstDone = false;

  // Fit the render buffer to the canvas box, capped for performance.
  function fit() {
    const r = canvas.getBoundingClientRect();
    const aspect = (r.width > 0 && r.height > 0) ? r.width / r.height : 1.6;
    H = 540;
    W = Math.max(520, Math.min(1100, Math.round(H * aspect)));
    canvas.width = W;
    canvas.height = H;
  }

  // 3x3 Bezier control net from a height grid, offset to (ox,oy,oz).
  function bezierGrid(hy, ox, oy, oz, span) {
    const cp = [];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const x = -span + span * i + ox;
        const z = -span + span * j + oz;
        cp.push(x, oy + hy[i][j], z);
      }
    return cp;
  }

  // The brand scene: cool-blue sky, a blue metal dome, a pale ceramic sheet and a
  // chrome torus — blue / white / chrome, matching the site palette.
  function buildScene() {
    tmd.reset();
    tmd.env(0.09, 0.14, 0.42, 0.42, 0.55, 0.95, 0.30);

    // Ground plane (subtle checker).
    tmd.addPlane(0, 0, 0, 0, 1, 0, 0.42, 0.45, 0.52, 0.0, 0.55, 0.06, 1);

    // Blue metal dome (the brand accent, #0057ff-ish).
    tmd.addBezier(bezierGrid(
      [[0, 0.5, 0], [0.5, 1.8, 0.5], [0, 0.5, 0]], -1.7, 0.2, 0.0, 1.4),
      0.02, 0.34, 1.0, 1.0, 0.22, 0.6);

    // Pale ceramic wavy sheet (white).
    tmd.addBezier(bezierGrid(
      [[1.0, 0.1, 1.0], [0.1, -0.6, 0.1], [1.0, 0.1, 1.0]], 2.0, 0.8, 0.2, 1.3),
      0.90, 0.92, 0.96, 0.0, 0.25, 0.08);

    // Chrome torus — quartic intersection, the engine's signature.
    tmd.addTorus(0.0, 1.1, 0.2, 0.3, 1.0, 0.2, 0.95, 0.32,
      0.74, 0.76, 0.82, 1.0, 0.10, 0.6);

    // Lights: cool key + blue fill.
    tmd.addLight(0, -0.5, 1.0, 0.4, 1.0, 0.98, 0.92, 2.6);
    tmd.addLight(1, 3.5, 3.0, 3.5, 0.40, 0.58, 1.0, 18.0);
  }

  function updateCamera() {
    const cx = target[0] + radius * Math.cos(elev) * Math.sin(azim);
    const cy = target[1] + radius * Math.sin(elev);
    const cz = target[2] + radius * Math.cos(elev) * Math.cos(azim);
    tmd.camera(cx, cy, cz, target[0], target[1], target[2], 45, 0, 0);
  }

  function signalReady() {
    try { if (window.parent !== window) window.parent.postMessage("tmd:ready", "*"); } catch (e) {}
  }
  function signalError() {
    try { if (window.parent !== window) window.parent.postMessage("tmd:error", "*"); } catch (e) {}
  }

  // Render one frame; when `loop` and auto-rotation is on, chain the next one after
  // this one finishes (completion-driven pacing, never faster than the device).
  async function renderNow(loop) {
    if (rendering) { pending = true; return; }
    rendering = true;

    buildScene();
    updateCamera();

    let out = null;
    try {
      out = await tmd.render(W, H, {
        spp: 1, depth: 2, exposure: 1.15, backend: "auto", gpuCapable: true,
      });
    } catch (e) { out = null; }

    if (out) ctx.putImageData(new ImageData(out.pixels, W, H), 0, 0);
    rendering = false;

    if (!firstDone) {
      firstDone = true;
      if (out) signalReady(); else signalError();
    }

    if (pending) { pending = false; renderNow(loop); return; }
    if (loop && autorot && !dragging) {
      azim += 0.006;
      requestAnimationFrame(() => renderNow(true));
    }
  }

  function kick() {
    if (autorot && !dragging) renderNow(true);
    else renderNow(false);
  }

  // --- interaction --------------------------------------------------------
  let lastX = 0, lastY = 0;
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    azim -= (e.clientX - lastX) * 0.008;
    elev = Math.max(-0.1, Math.min(1.4, elev + (e.clientY - lastY) * 0.006));
    lastX = e.clientX; lastY = e.clientY;
    renderNow(false);
  });
  canvas.addEventListener("pointerup", (e) => {
    dragging = false;
    if (autorot) renderNow(true);
  });
  // Deliberately no wheel handler: the wheel stays reserved for scrolling the page
  // (this scene is a full-bleed background), so it must not be hijacked for zoom.

  // Click (not a drag) toggles the spin, where the GPU can sustain it.
  let downX = 0, downY = 0;
  canvas.addEventListener("pointerdown", (e) => { downX = e.clientX; downY = e.clientY; });
  canvas.addEventListener("click", (e) => {
    if (Math.abs(e.clientX - downX) > 4 || Math.abs(e.clientY - downY) > 4) return;
    if (!tmd || !tmd.gpuReady) return;
    autorot = !autorot;
    if (autorot) renderNow(true);
  });

  // Pause the spin when the tab/section is hidden; resume on return.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && autorot) renderNow(true);
  });

  let rs;
  window.addEventListener("resize", () => {
    clearTimeout(rs);
    rs = setTimeout(() => { fit(); kick(); }, 150);
  });

  // --- boot ---------------------------------------------------------------
  fit();
  if (!window.TMD) { signalError(); return; }
  TMD.create().then((instance) => {
    tmd = instance;
    autorot = !!tmd.gpuReady;   // only auto-spin where WebGPU can keep up
    kick();
  }).catch((err) => {
    console.error(err);
    signalError();
  });
})();
