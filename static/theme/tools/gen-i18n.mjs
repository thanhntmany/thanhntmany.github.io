/*
 * Generate the i18n catalogue from the single source of truth: the landing-page
 * template. render(lang) records every key→value pair it emits (via t()/ta())
 * onto page.i18n, so the JSON can never drift from the data-i18n markup.
 *
 *   node static/theme/tools/gen-i18n.mjs
 *
 * LAYOUT — modelled on smart-tool-box/assets/i18n (see cpn/i18n.mjs for the
 * matching runtime):
 *
 *   i18n/index.json          the manifest: every file "stem" there is to load,
 *                            e.g. "about", "about/skills" — a bounded radix tree.
 *   i18n/<locale>/_meta.json the @-keys for a locale: @dir, @locale, @name.
 *   i18n/<locale>/<ns>.json  one namespace per file, keys stored with the
 *                            namespace prefix STRIPPED ("about.h2" → "h2").
 *   i18n/<locale>/<ns>/<sub>.json
 *                            a namespace whose keys share a big further prefix
 *                            is split into a subdirectory; "about.skills.*" lives
 *                            in "about/skills.json" as "0.group", … The runtime
 *                            rebuilds the full key from the stem on load.
 *
 * en-US is the baseline every key exists in; vi-VN overlays it.
 */
import { render } from "../landingpage.mjs"
import { writeFileSync, rmSync, mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dir = dirname(fileURLToPath(import.meta.url))
const I18N_DIR = join(__dir, "..", "i18n")

// short lang code (used across the site) → BCP-47 locale dir + its _meta.
const LOCALES = {
    en: { dir: "en-US", meta: { "@dir": "ltr", "@locale": "en-US", "@name": "English" } },
    vi: { dir: "vi-VN", meta: { "@dir": "ltr", "@locale": "vi-VN", "@name": "Tiếng Việt" } },
}

// A second-level group (keys sharing "<ns>.<sub>.") is split into its own file
// once it reaches this many keys; smaller groups stay inline in the namespace.
const SPLIT_AT = 9

// Decide the file stem each full key belongs to, from the baseline's shape.
// Returns { stems: sorted stem list, assign: key → stem }.
function planStems(keys) {
    const byNs = {}                       // ns → [keys]
    for (const k of keys) {
        const ns = k.slice(0, (k.indexOf(".") + 1 || k.length + 1) - 1)
        ;(byNs[ns] ||= []).push(k)
    }
    const assign = {}
    const stems = new Set()
    for (const ns in byNs) {
        const sub = {}                    // "ns.sub" → [keys]
        for (const k of byNs[ns]) {
            const rest = k.slice(ns.length + 1)         // after "ns."
            const seg1 = rest.indexOf(".") < 0 ? null : rest.slice(0, rest.indexOf("."))
            if (seg1 != null) (sub[seg1] ||= []).push(k)
        }
        const split = new Set(Object.keys(sub).filter(s => sub[s].length >= SPLIT_AT))
        for (const k of byNs[ns]) {
            const rest = k.slice(ns.length + 1)
            const seg1 = rest.indexOf(".") < 0 ? null : rest.slice(0, rest.indexOf("."))
            const stem = seg1 != null && split.has(seg1) ? ns + "/" + seg1 : ns
            assign[k] = stem
            stems.add(stem)
        }
    }
    return { stems: [...stems].sort(), assign }
}

// Bucket a flat map into { stem → { shortKey → value } }, stripping the stem's
// dotted prefix from each key (so "about/skills.json" holds "0.group").
function bucketize(map, assign) {
    const out = {}
    for (const k in map) {
        const stem = assign[k]
        const prefix = stem.replace(/\//g, ".") + "."
        ;(out[stem] ||= {})[k.slice(prefix.length)] = map[k]
    }
    return out
}

function writeSorted(path, obj) {
    const sorted = Object.keys(obj).sort().reduce((o, k) => (o[k] = obj[k], o), {})
    writeFileSync(path, JSON.stringify(sorted, null, 2) + "\n")
}

// --- build ------------------------------------------------------------------

const maps = {}
for (const lang in LOCALES) maps[lang] = render(lang).i18n

// The manifest is defined by the baseline (en); every key exists there first.
const { stems, assign } = planStems(Object.keys(maps.en))

// Clear only the GENERATED artefacts (the *.mjs sources live here too, and the
// landing page imports them) so renamed or removed keys never linger.
mkdirSync(I18N_DIR, { recursive: true })
rmSync(join(I18N_DIR, "index.json"), { force: true })
rmSync(join(I18N_DIR, "en.json"), { force: true })   // legacy flat catalogues
rmSync(join(I18N_DIR, "vi.json"), { force: true })
for (const lang in LOCALES) rmSync(join(I18N_DIR, LOCALES[lang].dir), { recursive: true, force: true })

// index.json is a plain array of file stems (the manifest), _meta first.
const manifest = ["_meta", ...stems].sort()
writeFileSync(join(I18N_DIR, "index.json"), JSON.stringify(manifest, null, 2) + "\n")

for (const lang in LOCALES) {
    const { dir, meta } = LOCALES[lang]
    const base = join(I18N_DIR, dir)
    mkdirSync(base, { recursive: true })
    writeSorted(join(base, "_meta.json"), meta)

    const buckets = bucketize(maps[lang], assign)
    let files = 1
    for (const stem of stems) {
        const target = join(base, ...stem.split("/")) + ".json"
        mkdirSync(dirname(target), { recursive: true })
        writeSorted(target, buckets[stem] || {})
        files++
    }
    console.log(`${dir}: ${files} files, ${Object.keys(maps[lang]).length} keys`)
}

console.log(`index.json: ${manifest.length} stems`)
