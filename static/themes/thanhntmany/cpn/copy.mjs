let toast, timer

function notify(msg) {
    if (!toast) {
        toast = document.createElement("div")
        toast.className = "toast"
        toast.setAttribute("role", "status")
        document.body.append(toast)
    }
    toast.textContent = msg
    toast.classList.add("is-on")
    clearTimeout(timer)
    timer = setTimeout(() => toast.classList.remove("is-on"), 1800)
}

export function activeDom(btn) {
    btn.addEventListener("click", async () => {
        const text = btn.getAttribute("data-copy")
        try {
            await navigator.clipboard.writeText(text)
            notify("Copied " + text)
        } catch (e) {
            window.location.href = "mailto:" + text
        }
    })
}
