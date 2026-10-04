/*
 * tmd.lib.js -- the redistributable browser API for the tmd analytic renderer.
 *
 * This is the one JS surface a third-party website embeds. It wraps the raw
 * Emscripten module (createTMD, from tmd.js) and the WebGPU kernel (window.tmdGPU,
 * from tmd-gpu.js) behind a small, stable object -- so a host page never has to
 * cwrap the tmdw_* C exports or reimplement the GPU->CPU fallback by hand.
 *
 * Load order on the page (plain <script> tags, no bundler needed):
 *     <script src="tmd.js"></script>       // Emscripten loader -> global createTMD
 *     <script src="tmd-gpu.js"></script>   // WebGPU compute backend -> window.tmdGPU
 *     <script src="tmd.lib.js"></script>   // this file -> window.TMD
 *
 * Usage:
 *     const tmd = await TMD.create();                 // loads wasm, probes WebGPU
 *     tmd.reset();
 *     tmd.env(0.30, 0.50, 0.90, 0.85, 0.88, 0.95, 0.30);
 *     tmd.addTorus(0,1.1,0.2, 0.3,1.0,0.2, 0.95,0.32, 0.72,0.74,0.80, 1.0,0.12,0.6);
 *     tmd.camera(cx,cy,cz, tx,ty,tz, 45, 0, 0);
 *     tmd.addLight(0, -0.5,1.0,0.4, 1.0,0.97,0.9, 2.6);
 *     const { pixels, device } = await tmd.render(W, H, { spp: 2, depth: 3 });
 *     ctx.putImageData(new ImageData(pixels, W, H), 0, 0);
 *
 * The scene-building methods mirror the tmdw_* bindings one-to-one (see the
 * bindings.c table); render() owns the device policy (GPU when available and the
 * scene is GPU-capable, else the wasm CPU path) and always returns pixels or null.
 */
(function () {
  "use strict";

  // tmd_device_kind (must match include/tmd_device.h).
  const DEV = { NONE: 0, GPU_NATIVE: 1, GPU_WEBGPU: 2, CPU_MT: 3, CPU: 4 };

  // cwrap the flat tmdw_* C API into plain JS functions.
  function bind(Module) {
    return {
      reset: Module.cwrap("tmdw_reset", null, []),
      camera: Module.cwrap("tmdw_camera", null, Array(9).fill("number")),
      env: Module.cwrap("tmdw_env", null, Array(7).fill("number")),
      addPlane: Module.cwrap("tmdw_add_plane", null, Array(13).fill("number")),
      addTorus: Module.cwrap("tmdw_add_torus", null, Array(14).fill("number")),
      addBezier: Module.cwrap("tmdw_add_bezier", null, Array(7).fill("number")),
      addSphere: Module.cwrap("tmdw_add_sphere", null, Array(10).fill("number")),
      addBox: Module.cwrap("tmdw_add_box", null, Array(12).fill("number")),
      addCylinder: Module.cwrap("tmdw_add_cylinder", null, Array(13).fill("number")),
      translateLast: Module.cwrap("tmdw_translate_last", null, Array(3).fill("number")),
      rotateLast: Module.cwrap("tmdw_rotate_last", null, Array(4).fill("number")),
      scaleLast: Module.cwrap("tmdw_scale_last", null, Array(3).fill("number")),
      textureLast: Module.cwrap("tmdw_texture_last", null, Array(6).fill("number")),
      addLight: Module.cwrap("tmdw_add_light", null, Array(8).fill("number")),
      render: Module.cwrap("tmdw_render", "number",
        ["number", "number", "number", "number", "number"]),
      alloc: Module.cwrap("tmdw_alloc", "number", ["number"]),
      free: Module.cwrap("tmdw_free", null, ["number"]),
      webgpuSet: Module.cwrap("tmdw_webgpu_set", null, ["number", "number"]),
      bestKind: Module.cwrap("tmdw_device_best_kind", "number", []),
      bestName: Module.cwrap("tmdw_device_best_name", "string", []),
      exportSize: Module.cwrap("tmdw_scene_export_size", "number", []),
      exportScene: Module.cwrap("tmdw_scene_export", "number", ["number", "number"]),
    };
  }

  function makeInstance(Module) {
    const M = Module;
    const api = bind(Module);
    let gpuReady = false;   // WebGPU device up and registered with the C policy

    // Pull the current scene out as a Float32Array the WGSL kernel consumes --
    // the exact same scene the CPU path renders.
    function exportScene() {
      const n = api.exportSize();
      const ptr = api.alloc(n * 4);
      api.exportScene(ptr, n);
      const floats = M.HEAPF32.slice(ptr / 4, ptr / 4 + n);
      api.free(ptr);
      return floats;
    }

    // A Bezier patch needs its 27-double control net staged on the wasm heap.
    function addBezier(cp, r, g, b, metal, rough, reflect) {
      const ptr = api.alloc(cp.length * 8);
      M.HEAPF64.set(new Float64Array(cp), ptr / 8);
      api.addBezier(ptr, r, g, b, metal, rough, reflect);
      api.free(ptr);
    }

    // Probe WebGPU and, if present, register it with the C resource layer so the
    // policy ranks WebGPU above the CPU. Safe to call once after create().
    async function initGPU() {
      try {
        if (window.tmdGPU && await window.tmdGPU.init()) {
          gpuReady = true;
          api.webgpuSet(1, 0);
          return true;
        }
      } catch (e) { console.error(e); }
      gpuReady = false;
      return false;
    }

    // Render the current scene. opts:
    //   spp, depth, exposure   quality knobs (default 2 / 3 / 1.0)
    //   backend                "auto" | "gpu" | "cpu"  (default "auto")
    //   gpuCapable             false if the scene uses CPU-only features
    //                          (transform-placed primitives / solid textures)
    // Resolves to { pixels: Uint8ClampedArray(W*H*4), device, backend, gpuReady }
    // or null if rendering failed on every backend.
    async function render(w, h, opts) {
      opts = opts || {};
      const spp = opts.spp != null ? opts.spp : 2;
      const depth = opts.depth != null ? opts.depth : 3;
      const exposure = opts.exposure != null ? opts.exposure : 1.0;
      const mode = opts.backend || "auto";              // "auto" | "gpu" | "cpu"
      const gpuCapable = opts.gpuCapable !== false;

      const preferGPU = mode !== "cpu" && gpuReady && gpuCapable &&
                        (mode === "gpu" || api.bestKind() === DEV.GPU_WEBGPU);

      let pixels = null, backend = "cpu";
      if (preferGPU) {
        const scene = exportScene();
        pixels = await window.tmdGPU.render(scene, w, h, { spp, depth, exposure });
        if (pixels) {
          backend = "gpu";
        } else {
          // GPU failed at runtime: drop it from the policy for good.
          gpuReady = false;
          api.webgpuSet(0, 0);
        }
      }
      if (!pixels) {
        const ptr = api.render(w, h, spp, depth, exposure);
        if (ptr) {
          pixels = new Uint8ClampedArray(M.HEAPU8.subarray(ptr, ptr + w * h * 4));
          backend = "cpu";
        }
      }
      if (!pixels) return null;
      return {
        pixels,
        backend,
        device: backend === "gpu" ? "GPU · WebGPU" : "CPU · wasm",
        gpuReady,
      };
    }

    return {
      // raw module + cwrapped API, for callers that need to go lower-level
      module: M,
      api,
      DEV,
      // scene building (mirrors the tmdw_* bindings)
      reset: api.reset,
      camera: api.camera,
      env: api.env,
      addPlane: api.addPlane,
      addTorus: api.addTorus,
      addBezier,                 // wrapped: stages control points on the heap
      addSphere: api.addSphere,
      addBox: api.addBox,
      addCylinder: api.addCylinder,
      translateLast: api.translateLast,
      rotateLast: api.rotateLast,
      scaleLast: api.scaleLast,
      textureLast: api.textureLast,
      addLight: api.addLight,
      // rendering + device
      render,
      exportScene,
      initGPU,
      bestKind: api.bestKind,
      bestName: api.bestName,
      webgpuSet: api.webgpuSet,
      get gpuReady() { return gpuReady; },
    };
  }

  // Load the wasm module and return a ready-to-use instance.
  //   opts.gpu === false    skip the WebGPU probe (CPU-only)
  //   opts.moduleConfig     extra config passed to the Emscripten factory
  //                         (e.g. { locateFile } when tmd.wasm lives elsewhere)
  async function create(opts) {
    opts = opts || {};
    if (typeof createTMD !== "function")
      throw new Error("tmd.lib.js: global createTMD not found -- load tmd.js first");
    const Module = await createTMD(opts.moduleConfig || {});
    const inst = makeInstance(Module);
    if (opts.gpu !== false) await inst.initGPU();
    return inst;
  }

  window.TMD = { create, version: "0.1.0" };
})();
