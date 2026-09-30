export function activeDom(bar) {
    const onScroll = () => bar.classList.toggle("is-scrolled", window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    // Highlight the nav link of the section currently in view.
    const links = new Map([...bar.querySelectorAll('.nav a[href^="#"]')].map(a => [a.getAttribute("href").slice(1), a]))
    if (!("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (!e.isIntersecting) return
        links.forEach(a => a.classList.remove("is-active"))
        const a = links.get(e.target.id)
        if (a) a.classList.add("is-active")
    }), { rootMargin: "-45% 0px -50% 0px" })
    links.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s) })
}
