/*
 * tmd web front end (demo).
 *
 * A thin consumer of the tmd library bundle (window.TMD, from tmd.lib.js): it
 * builds the showcase / primitives scene, orbits a camera, and renders into a
 * <canvas>. All the wasm/GPU plumbing lives in the library; this file is only
 * scene content + DOM. Drag to orbit, wheel to zoom, sliders for quality.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("view");
  const ctx = canvas.getContext("2d");
  const statusEl = document.getElementById("status");

  const W = canvas.width, H = canvas.height;

  // Orbit camera state around the scene target.
  const target = [0.2, 0.7, 0.0];
  let azim = -0.15, elev = 0.42, radius = 8.0;

  const ui = {
    spp: document.getElementById("spp"),
    depth: document.getElementById("depth"),
    exp: document.getElementById("exp"),
    sppVal: document.getElementById("sppVal"),
    depthVal: document.getElementById("depthVal"),
    expVal: document.getElementById("expVal"),
    backend: document.getElementById("backend"),
    scene: document.getElementById("scene"),
  };

  // Whether the current scene uses only primitives the WebGPU kernel supports
  // (plane/torus/bezier, no solid textures). The transform-placed primitives
  // and solid textures are CPU-path features, so a scene using them renders on
  // the CPU even when WebGPU is available.
  let sceneGpuCapable = true;

  let tmd = null;          // TMD library instance
  let renderScheduled = false;

  // Build a 3x3 control net from a grid of heights, offset to (ox,oy,oz).
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

  // The classic showcase: plane + two Bezier patches + a torus. Uses only the
  // primitives the WebGPU kernel supports, so it runs on the GPU when available.
  function buildShowcase() {
    tmd.env(0.30, 0.50, 0.90, 0.85, 0.88, 0.95, 0.30);

    // Ground plane (checkered).
    tmd.addPlane(0, 0, 0, 0, 1, 0, 0.60, 0.62, 0.65, 0.0, 0.6, 0.05, 1);

    // Bezier dome (red plastic).
    tmd.addBezier(bezierGrid(
      [[0, 0.5, 0], [0.5, 1.8, 0.5], [0, 0.5, 0]], -1.7, 0.2, 0.0, 1.4),
      0.85, 0.20, 0.22, 0.0, 0.25, 0.04);

    // Bezier wavy sheet (gold metal).
    tmd.addBezier(bezierGrid(
      [[1.0, 0.1, 1.0], [0.1, -0.6, 0.1], [1.0, 0.1, 1.0]], 2.0, 0.8, 0.2, 1.3),
      0.95, 0.78, 0.35, 1.0, 0.18, 0.6);

    // Torus (chrome) — quartic intersection.
    tmd.addTorus(0.0, 1.1, 0.2, 0.3, 1.0, 0.2, 0.95, 0.32,
      0.72, 0.74, 0.80, 1.0, 0.12, 0.6);

    return true;   // GPU-capable
  }

  // The transform-placed primitives: sphere, a rotated box, a cylinder, and an
  // instanced trio of beads, plus solid checker textures. These are CPU-path
  // features (the WebGPU kernel does not consume them), so this scene renders on
  // the CPU even when WebGPU is present.
  function buildPrimitives() {
    tmd.env(0.35, 0.55, 0.92, 0.90, 0.90, 0.95, 0.35);

    // Floor with a world-space checker from the material.
    tmd.addPlane(0, 0, 0, 0, 1, 0, 0.85, 0.85, 0.88, 0.0, 0.7, 0.04, 0);
    tmd.textureLast(1, 0, 0.15, 0.17, 0.2, 0.5);

    // Glossy sphere.
    tmd.addSphere(-2.0, 0.9, 0.0, 0.9, 0.20, 0.45, 0.85, 0.0, 0.15, 0.1);

    // Object-space checkered sphere.
    tmd.addSphere(0.6, 0.7, 1.3, 0.7, 0.9, 0.35, 0.3, 0.0, 0.3, 0.05);
    tmd.textureLast(1, 1, 0.15, 0.1, 0.1, 3.0);

    // Rotated box.
    tmd.addBox(0.0, 0.6, 0.0, 0.6, 0.6, 0.6, 0.85, 0.30, 0.25, 0.0, 0.35, 0.05);
    tmd.rotateLast(0, 1, 0, 30);

    // Metallic cylinder.
    tmd.addCylinder(2.2, 0.0, -0.4, 0, 1.6, 0, 0.5, 0.80, 0.80, 0.85, 1.0, 0.2, 0.4);

    // Object-space checkered metal torus.
    tmd.addTorus(0.0, 1.9, -1.6, 0, 0, 1, 0.8, 0.28, 0.95, 0.8, 0.4, 1.0, 0.2, 0.5);
    tmd.textureLast(1, 1, 0.1, 0.1, 0.12, 6.0);

    // Instanced trio of gold beads.
    for (let i = 0; i < 3; i++)
      tmd.addSphere(-0.9 + 0.9 * i, 0.22, 2.4, 0.22, 0.95, 0.80, 0.35, 1.0, 0.10, 0.2);

    return false;  // not GPU-capable -> CPU
  }

  function buildScene() {
    tmd.reset();
    sceneGpuCapable = ui.scene.value === "primitives"
      ? buildPrimitives()
      : buildShowcase();

    // Lights (shared by both scenes).
    tmd.addLight(0, -0.5, 1.0, 0.4, 1.0, 0.97, 0.9, 2.6);   // sun (directional)
    tmd.addLight(1, 3.5, 3.0, 3.5, 0.5, 0.6, 1.0, 18.0);    // fill (point)
  }

  function updateCamera() {
    const cx = target[0] + radius * Math.cos(elev) * Math.sin(azim);
    const cy = target[1] + radius * Math.sin(elev);
    const cz = target[2] + radius * Math.cos(elev) * Math.cos(azim);
    // proj=0 (perspective), ortho_height unused; the orbit camera stays pinhole.
    tmd.camera(cx, cy, cz, target[0], target[1], target[2], 45, 0, 0);
  }

  let rendering = false, pending = false;

  async function renderNow() {
    renderScheduled = false;
    if (rendering) { pending = true; return; }   // coalesce during a GPU frame
    rendering = true;

    const spp = +ui.spp.value, depth = +ui.depth.value, exp = +ui.exp.value;
    const mode = ui.backend.value;               // "auto" | "gpu" | "cpu"
    const gpuWasReady = tmd.gpuReady;
    const t0 = performance.now();
    buildScene();
    updateCamera();

    const out = await tmd.render(W, H, {
      spp, depth, exposure: exp, backend: mode, gpuCapable: sceneGpuCapable,
    });

    // The library disables WebGPU for good if its kernel fails at runtime;
    // reflect that in the backend selector.
    if (gpuWasReady && !tmd.gpuReady) refreshBackend();

    if (!out) { statusEl.textContent = "render failed"; rendering = false; return; }

    // Device label: refine the CPU case with why we fell back, for the demo UI.
    let dev = out.device;
    if (out.backend === "cpu" && mode === "gpu")
      dev = sceneGpuCapable ? "CPU · wasm (GPU lỗi)" : "CPU · wasm (cảnh cần CPU)";

    ctx.putImageData(new ImageData(out.pixels, W, H), 0, 0);
    const ms = (performance.now() - t0).toFixed(0);
    statusEl.textContent = `${dev} · ${W}×${H} · ${spp} spp · ${ms} ms`;

    // Tell an embedding host the first live frame is up (fade in over its poster).
    if (!renderNow._announced) {
      renderNow._announced = true;
      try { if (window.parent !== window) window.parent.postMessage("tmd:ready", "*"); } catch (e) {}
    }

    rendering = false;
    if (pending) { pending = false; scheduleRender(); }
  }

  function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(renderNow);
  }

  // --- interaction --------------------------------------------------------
  let dragging = false, lastX = 0, lastY = 0;
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    azim -= (e.clientX - lastX) * 0.008;
    elev = Math.max(-0.2, Math.min(1.45, elev + (e.clientY - lastY) * 0.006));
    lastX = e.clientX; lastY = e.clientY;
    scheduleRender();
  });
  canvas.addEventListener("pointerup", () => { dragging = false; });
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    radius = Math.max(3.5, Math.min(20, radius + Math.sign(e.deltaY) * 0.5));
    scheduleRender();
  }, { passive: false });

  for (const key of ["spp", "depth", "exp"]) {
    ui[key].addEventListener("input", () => {
      ui[key + "Val"].textContent = ui[key].value;
      scheduleRender();
    });
  }
  ui.backend.addEventListener("change", scheduleRender);
  ui.scene.addEventListener("change", scheduleRender);

  // Reflect GPU availability in the backend selector: disable WebGPU when it is
  // not usable, and steer a stale selection back to a valid choice.
  function refreshBackend() {
    const gpuOpt = ui.backend.querySelector('option[value="gpu"]');
    if (gpuOpt) {
      gpuOpt.disabled = !tmd.gpuReady;
      gpuOpt.textContent = tmd.gpuReady ? "GPU · WebGPU" : "GPU · WebGPU (không khả dụng)";
    }
    if (!tmd.gpuReady && ui.backend.value === "gpu") ui.backend.value = "auto";
  }

  // --- boot ---------------------------------------------------------------
  statusEl.textContent = "đang tải WebAssembly…";
  TMD.create().then((instance) => {
    tmd = instance;
    refreshBackend();
    statusEl.textContent = tmd.gpuReady
      ? "GPU (WebGPU) sẵn sàng — kéo để xoay"
      : "WebGPU không có — chạy CPU (wasm) — kéo để xoay";
    renderNow();
  }).catch((err) => {
    statusEl.textContent = "không tải được WASM: " + err;
    console.error(err);
  });
})();
