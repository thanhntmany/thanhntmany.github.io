const root = document.documentElement, mq = window.matchMedia("(prefers-color-scheme: dark)")

const current = () => root.getAttribute("data-theme") || (mq.matches ? "dark" : "light")

function paint() {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute("content", getComputedStyle(document.body).backgroundColor)
}

export function activeDom(btn) {
    const sync = () => btn.setAttribute("aria-pressed", String(current() === "dark"))
    sync(); paint()
    btn.addEventListener("click", () => {
        const next = current() === "dark" ? "light" : "dark"
        root.setAttribute("data-theme", next)
        try { localStorage.setItem("theme", next) } catch (e) { }
        sync(); paint()
    })
    mq.addEventListener("change", () => { sync(); paint() })
}
