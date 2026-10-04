/*
 * i18n — a compact runtime translator.
 *
 * Both pages are pre-rendered (good SEO + no flash of keys), and every translatable
 * node carries a data-i18n key. This library swaps the text in place on a language
 * switch, without a reload:
 *   [data-i18n]       → textContent
 *   [data-i18n-html]  → innerHTML
 *   [data-i18n-attr]  → attributes, from "attr:key;attr2:key2"
 * The choice is remembered in localStorage and re-applied on later visits. If a fetch
 * fails, we fall back to navigating to the other pre-rendered page — the site never breaks.
 *
 * CATALOGUE LAYOUT — modelled on smart-tool-box/assets/i18n (see tools/gen-i18n.mjs):
 *
 *   i18n/index.json          the manifest: every file "stem" there is to load.
 *   i18n/<locale>/_meta.json the @-keys: @dir, @locale, @name.
 *   i18n/<locale>/<ns>.json  one namespace per file; a namespace whose keys share a
 *   i18n/<locale>/<ns>/<sub>.json   big further prefix is split into a subdirectory
 *                            ("about.skills.*" → "about/skills.json"). Each file drops
 *                            the prefix its path carries ("about/skills.json" holds
 *                            "0.group"), rebuilt here from the stem on the way in.
 *
 * Only the namespaces a page actually shows are fetched, and each is loaded in the
 * chosen language AND in the en-US baseline underneath it, so a missing translation
 * falls back to the English sentence — never to a raw key.
 *
 * Attached (do-active) to the language-switch anchor.
 */
const BASE = "/static/theme/i18n/"
const BASELINE = "en-US"
const META = {
    en: { path: "/", code: "EN", dir: "en-US" },
    vi: { path: "/vi/", code: "VI", dir: "vi-VN" },
}

let FILES = null            // the manifest (array of stems), once loaded
let MANIFEST = null         // the in-flight manifest fetch, shared by callers
const CATS = {}             // locale dir → { map, loaded:Set, inflight:Map }

// The namespace a key belongs to: its first dotted segment, or "_meta" for the
// @-prefixed metadata. "about.skills.0.group" → "about", "cta" → "cta".
function nsOf(key) {
    if (!key) return ""
    if (key.charCodeAt(0) === 64 /* @ */) return "_meta"
    const i = key.indexOf(".")
    return i < 0 ? key : key.slice(0, i)
}

async function loadManifest() {
    if (FILES) return
    if (MANIFEST) return MANIFEST
    return (MANIFEST = (async () => {
        try {
            const res = await fetch(BASE + "index.json")
            if (res.ok) {
                const list = await res.json()
                if (Array.isArray(list)) FILES = list
            }
        } catch (e) { /* stemsFor() copes with a null manifest */ }
    })())
}

// The file stems that make up a namespace: its own file and any subdirectory
// files beneath it. Without a manifest, just the namespace itself.
function stemsFor(ns) {
    if (!FILES) return [ns]
    const pre = ns + "/"
    const out = FILES.filter(s => s === ns || s.lastIndexOf(pre, 0) === 0)
    return out.length ? out : [ns]
}

function cat(dir) {
    return CATS[dir] || (CATS[dir] = { map: {}, loaded: new Set(), inflight: new Map() })
}

// Load one file of one locale into its flat map, at most once. A file drops the
// path its name already carries, so the full key is rebuilt as "<stem.with.dots>.short";
// "_meta" is the exception — its @-keys carry no prefix.
function fetchInto(dir, stem) {
    const c = cat(dir)
    if (c.loaded.has(stem)) return Promise.resolve()
    if (c.inflight.has(stem)) return c.inflight.get(stem)
    const path = [dir].concat(stem.split("/")).map(encodeURIComponent).join("/")
    const p = fetch(BASE + path + ".json")
        .then(res => res.ok ? res.json() : {})
        .catch(() => ({}))
        .then(obj => {
            if (obj && typeof obj === "object") {
                if (stem === "_meta") {
                    Object.assign(c.map, obj)
                } else {
                    const prefix = stem.replace(/\//g, ".") + "."
                    for (const short in obj) c.map[prefix + short] = obj[short]
                }
            }
            c.loaded.add(stem)
        })
    c.inflight.set(stem, p)
    return p
}

// Make sure the given namespaces are present in the target locale and in the
// en-US baseline underneath it — every file each namespace is made of.
function ensure(namespaces, dir) {
    const jobs = []
    for (const ns of namespaces)
        for (const stem of stemsFor(ns)) {
            jobs.push(fetchInto(BASELINE, stem))
            if (dir !== BASELINE) jobs.push(fetchInto(dir, stem))
        }
    return Promise.all(jobs)
}

// Every namespace the markup under `root` names, read from the same attributes
// apply() paints — so the two can never disagree about which words a page holds.
function namespacesInDom(root) {
    const set = new Set(["_meta", "common"])   // common holds the switch label
    root.querySelectorAll("[data-i18n]").forEach(el => set.add(nsOf(el.getAttribute("data-i18n"))))
    root.querySelectorAll("[data-i18n-html]").forEach(el => set.add(nsOf(el.getAttribute("data-i18n-html"))))
    root.querySelectorAll("[data-i18n-attr]").forEach(el => {
        el.getAttribute("data-i18n-attr").split(";").forEach(pair => {
            const i = pair.indexOf(":")
            if (i >= 0) set.add(nsOf(pair.slice(i + 1).trim()))
        })
    })
    set.delete("")
    return [...set]
}

function apply(dict) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const v = dict[el.getAttribute("data-i18n")]
        if (v != null) el.textContent = v
    })
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
        const v = dict[el.getAttribute("data-i18n-html")]
        if (v != null) el.innerHTML = v
    })
    document.querySelectorAll("[data-i18n-attr]").forEach(el => {
        el.getAttribute("data-i18n-attr").split(";").forEach(pair => {
            const idx = pair.indexOf(":")
            if (idx < 0) return
            const attr = pair.slice(0, idx).trim(), v = dict[pair.slice(idx + 1).trim()]
            if (v != null) el.setAttribute(attr, v)
        })
    })
}

// Point the switch at the OTHER language, and label it in the CURRENT one.
function refreshSwitch(a, lang, dict) {
    const other = lang === "vi" ? "en" : "vi"
    a.textContent = META[other].code
    a.setAttribute("href", META[other].path)
    a.setAttribute("hreflang", other)
    a.setAttribute("lang", other)
    const label = dict["common.switchLabel"]
    if (label) {
        a.setAttribute("aria-label", label)
        a.setAttribute("title", label)
    }
}

async function setLang(lang, a) {
    const dir = (META[lang] || META.en).dir
    await loadManifest()
    await ensure(namespacesInDom(document), dir)
    // The en-US baseline underneath, the chosen language on top.
    const dict = Object.assign({}, cat(BASELINE).map, dir === BASELINE ? null : cat(dir).map)
    apply(dict)
    document.documentElement.lang = lang
    const meta = dict["@dir"]
    if (meta) document.documentElement.dir = meta
    try { localStorage.setItem("lang", lang) } catch (e) {}
    refreshSwitch(a, lang, dict)
}

export function activeDom(a) {
    a.addEventListener("click", (e) => {
        e.preventDefault()
        const next = document.documentElement.lang === "vi" ? "en" : "vi"
        setLang(next, a).catch(err => {
            console.error(err)
            location.href = a.getAttribute("href")   // graceful fallback: the SSR page
        })
    })

    // Re-apply a remembered choice that differs from this pre-rendered page.
    let saved = null
    try { saved = localStorage.getItem("lang") } catch (e) {}
    const current = document.documentElement.lang || "en"
    if ((saved === "en" || saved === "vi") && saved !== current) setLang(saved, a).catch(() => {})
}
