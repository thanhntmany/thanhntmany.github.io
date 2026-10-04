/*
 * lab3d — mounts a TM-Depoly (tmd) engine iframe inside a host box, with a static
 * poster for instant paint and graceful fallback, a loading state, and lazy mounting.
 *
 * The box carries:
 *   data-src     URL of the engine page (hero.html or the full demo)
 *   data-poster  (already rendered as <img class="lab3d-poster">) static fallback
 *   data-eager   present → mount at idle (hero, above the fold); absent → mount when
 *                the box scrolls near the viewport (IntersectionObserver)
 *   data-title   iframe title
 *
 * The engine posts "tmd:ready" after its first frame; we then fade the live canvas in
 * over the poster. On "tmd:error", an unsupported browser, a load error or a timeout we
 * keep the poster — the page never blocks or crashes on weak devices.
 */
export function activeDom(box) {
  const src = box.getAttribute("data-src");
  if (!src) return;

  const loader = box.querySelector(".lab3d-loader");
  const hideLoader = () => { if (loader) loader.classList.add("is-done"); };

  // Fallback: keep the poster, drop the spinner, mark the box.
  function fail() {
    box.classList.add("lab3d-failed");
    hideLoader();
  }

  // No WebAssembly → the engine can't run anywhere; stay on the poster.
  if (typeof WebAssembly !== "object") { fail(); return; }

  let mounted = false;
  function mount() {
    if (mounted) return;
    mounted = true;

    const frame = document.createElement("iframe");
    frame.className = "lab3d-frame";
    frame.title = box.getAttribute("data-title") || "TM-Depoly — 3D";
    frame.setAttribute("loading", "lazy");
    frame.setAttribute("allow", "fullscreen");
    frame.setAttribute("referrerpolicy", "no-referrer");

    let settled = false;
    const ready = () => {
      if (settled) return;
      settled = true;
      box.classList.add("is-ready");
      hideLoader();
      window.removeEventListener("message", onMsg);
    };

    function onMsg(e) {
      if (e.source !== frame.contentWindow) return;
      if (e.data === "tmd:ready") ready();
      else if (e.data === "tmd:error") { settled = true; fail(); window.removeEventListener("message", onMsg); }
    }
    window.addEventListener("message", onMsg);

    // If the engine never messages (older build), reveal shortly after load anyway.
    frame.addEventListener("load", () => setTimeout(ready, 1400));
    frame.addEventListener("error", fail);
    // Hard stop: never leave the spinner running forever.
    setTimeout(() => { if (!settled) ready(); }, 15000);

    frame.src = src;
    box.appendChild(frame);   // layering is handled by z-index in CSS
  }

  if (box.hasAttribute("data-eager")) {
    // Above the fold: let the first paint (poster) land, then boot at idle.
    const go = () => mount();
    if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 1800 });
    else setTimeout(go, 250);
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { io.disconnect(); mount(); break; }
    }, { rootMargin: "300px 0px" });
    io.observe(box);
  } else {
    mount();
  }
}
