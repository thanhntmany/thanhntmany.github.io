export function activeDom(main) {
    if (!("IntersectionObserver" in window)) return
    const items = [...main.querySelectorAll(".reveal")], h = window.innerHeight
    // Anything already on screen is shown without animating.
    items.forEach(el => { if (el.getBoundingClientRect().top < h) el.classList.add("is-in") })
    main.classList.add("reveal-ready")
    const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target) }
    }), { rootMargin: "0px 0px -8% 0px" })
    items.forEach(el => el.classList.contains("is-in") || io.observe(el))
}
