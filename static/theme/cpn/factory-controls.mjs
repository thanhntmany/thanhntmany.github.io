/*
 * factory-controls — the bridge between the page and the fixed 3D backdrop
 * (#bg3d → tm-depoly/factory.html). It:
 *   - maps page scroll to a camera fly-through (posts {cmd:"scroll", p}),
 *   - wires the control-room panel buttons (run line, toggle robots, camera
 *     presets, reset) and reflects the engine's state back onto them,
 *   - hands the backdrop free control (drag/orbit, wheel/zoom) only while the
 *     control-room section is on screen, and
 *   - pauses the engine when neither the hero nor the control room is visible.
 *
 * do-active is attached to the control-room <section>; #bg3d is found globally.
 * Everything degrades gracefully: before the iframe mounts, sends are no-ops; on
 * coarse pointers the backdrop stays an ambient, scroll-driven scene (no drag).
 */
export function activeDom(section) {
  const bg = document.getElementById("bg3d");
  if (!bg) return;
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const frame = () => bg.querySelector("iframe");
  const send = (msg) => { const f = frame(); if (f && f.contentWindow) f.contentWindow.postMessage(Object.assign({ type: "tmd:cmd" }, msg), "*"); };

  // --- page scroll → fly-through progress --------------------------------
  let ticking = false;
  function pushScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      send({ cmd: "scroll", p: max > 0 ? window.scrollY / max : 0 });
    });
  }
  window.addEventListener("scroll", pushScroll, { passive: true });
  window.addEventListener("resize", pushScroll);

  // --- control-room buttons ----------------------------------------------
  const btns = section.querySelectorAll("[data-cmd]");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const [cmd, arg] = btn.getAttribute("data-cmd").split(":");
      if (cmd === "line") send({ cmd: "line", on: btn.getAttribute("aria-pressed") !== "true" });
      else if (cmd === "robot") send({ cmd: "robot", id: arg, on: btn.getAttribute("aria-pressed") !== "true" });
      else if (cmd === "view") send({ cmd: "view", preset: arg });
      else if (cmd === "reset") send({ cmd: "reset" });
    });
  });
  const setPressed = (sel, on) => { const b = section.querySelector(sel); if (b) b.setAttribute("aria-pressed", on ? "true" : "false"); };

  // --- engine → panel state ----------------------------------------------
  window.addEventListener("message", (e) => {
    const f = frame();
    if (!f || e.source !== f.contentWindow) return;
    const d = e.data;
    if (d === "tmd:ready") { pushScroll(); return; }
    if (d && d.type === "tmd:state") {
      setPressed('[data-cmd="line"]', d.line);
      ["A", "B", "C"].forEach((id) => setPressed(`[data-cmd="robot:${id}"]`, d.robots && d.robots[id]));
    }
  });

  // --- free control only while the control room is on screen -------------
  // The backdrop stays live across the whole page (the translucent sections let
  // the fly-through show through), so there is no occlusion pause — only the
  // control room hands over free orbit/zoom.
  if (!coarse && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        const controlIn = en.isIntersecting && en.intersectionRatio > 0.45;
        bg.classList.toggle("is-controlling", controlIn);
        document.body.classList.toggle("is-controlling", controlIn);
        send({ cmd: "mode", free: controlIn });
      }
    }, { threshold: [0, 0.45, 1] });
    io.observe(section);
  }
}
