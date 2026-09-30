import phloemjs from "phloemjs/server-side.mjs"
const __dirname = phloemjs.dirname(import.meta.url), { StringAr } = phloemjs, buildTag = phloemjs.HTML.buildTag
import html5 from "phloemjs/htmlbase/html5.mjs"
import projects from "./data/projects.mjs"
import en from "./i18n/en.mjs"
import vi from "./i18n/vi.mjs"

const GH = "https://github.com/thanhntmany", REPO = GH + "/thanhntmany.github.io/tree/main", SITE = "https://thanhntmany.github.io"
const EMAIL = "thanhntmany@gmail.com", PHONE = "+84 344 087 349", TEL = "+84344087349",
    FB = "https://fb.com/thanhntmany", X = "https://twitter.com/Thanhnt_many"
const langs = ["English", "Tiếng Việt", "中文", "Deutsch", "Français", "日本語", "한국어", "Русский"]
export const dict = { en, vi }

const icon = {
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`,
    github: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>`,
    arrow: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>`,
    moon: `<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>`,
    sun: `<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5-4.9-4.6 6.6-.8z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8V6.2c0-.8.2-1.2 1.4-1.2H17V2h-2.6C11.6 2 10.5 3.4 10.5 5.9V8H8v3h2.5v11H14V11h2.6l.4-3z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 2.5h3.1l-6.8 7.8 8 10.9h-6.3l-4.9-6.4-5.6 6.4H2.2l7.3-8.3L1.8 2.5h6.4l4.4 5.9zm-1.1 16.8h1.7L7.4 4.3H5.6z"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
}

// Renders the landing page in one language ("en" or "vi").
export function render(lang) {
    const T = dict[lang], other = lang === "en" ? vi : en, page = html5.c(), $ = page.$
    const tr = v => v && typeof v === "object" && !Array.isArray(v) ? v[lang] ?? v.en : v
    const copyAttrs = value => `data-copy="${value}" data-copied="${T.copied}" do-active="${__dirname + "/cpn/copy.mjs"}"`

    const channels = [
        { icon: icon.mail, label: T.channel.email, value: EMAIL, href: "mailto:" + EMAIL, copy: EMAIL },
        { icon: icon.phone, label: T.channel.phone, value: PHONE, href: "tel:" + TEL, copy: PHONE },
        { icon: icon.facebook, label: T.channel.facebook, value: "fb.com/thanhntmany", href: FB },
        { icon: icon.x, label: T.channel.x, value: "@Thanhnt_many", href: X },
    ]
    const channel = c => `<li><a href="${c.href}"${c.href.startsWith("http") ? ` target="_blank" rel="noopener"` : ""}>${c.icon}<span><small>${c.label}</small>${c.value}</span></a>${c.copy ? `<button class="icon-btn" type="button" aria-label="${T.copy} ${c.label.toLowerCase()}" ${copyAttrs(c.copy)}>${icon.copy}</button>` : ""}</li>`

    const card = p => {
        const inner = `
            <div class="card-top"><span class="card-path">${[tr(p.year), tr(p.type)].filter(Boolean).join(" · ")}</span>${p.status ? `<span class="status ${p.status === "completed" ? "live" : ""}">${T.projects.status[p.status]}</span>` : ""}</div>
            <h3>${tr(p.name)}</h3>
            <p>${tr(p.summary)}</p>
            <div class="card-foot">${(p.stack || []).map(t => `<span class="tag">${t}</span>`).join("")}</div>${p.link ? `
            <span class="card-arrow">${icon.arrow}</span>` : ""}
          `
        return p.link ? `<a class="card reveal" href="${p.link}" target="_blank" rel="noopener">${inner}</a>` : `<div class="card reveal">${inner}</div>`
    }
    const ask = subject => `<a class="btn btn-primary" href="mailto:${EMAIL}?subject=${encodeURIComponent(subject)}">${icon.mail}${T.projects.btn}</a>`
    const S = T.services, F = S.focus
    // A chat bubble from the visitor ("you") or from me, labelled so replies are clearly mine.
    const msg = (who, text) => who === "me"
        ? `<div class="msg-row me"><span class="avatar" aria-hidden="true">TN</span><div><small class="who">${F.me}</small><p class="msg me">${text}</p></div></div>`
        : `<div class="msg-row you"><div><small class="who">${F.you}</small><p class="msg you">${text}</p></div></div>`

    $.lang = lang
    // Applied before first paint so the saved theme never flashes.
    page.HTMLrequire(`<meta name="description" content="${T.description}">`)
    page.HTMLrequire(`<meta name="theme-color" content="#f6f3ec">`)
    page.HTMLrequire(`<link rel="icon" href="/favicon.ico">`)
    page.HTMLrequire(`<link rel="canonical" href="${SITE + T.path}"><link rel="alternate" hreflang="en" href="${SITE}/"><link rel="alternate" hreflang="vi" href="${SITE}/vi/"><link rel="alternate" hreflang="x-default" href="${SITE}/">`)
    page.HTMLrequire(`<script>document.documentElement.lang="${lang}";try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>`)
    page.HTMLrequire(`<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`)
    page.HTMLrequire(buildTag.css("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"))
    page.HTMLrequire(buildTag.css(__dirname + "/static/main.css"))
    page.HTMLrequire(buildTag.mjs(__dirname + "/main.mjs"))
    $.title = T.title
    $.body = new StringAr(`<a class="skip" href="#main">${T.skip}</a>

<header class="topbar" do-active="${__dirname + "/cpn/topbar.mjs"}">
  <div class="wrap">
    <a class="brand" href="#top" aria-label="thanhntmany — ${T.home}"><span class="brand-mark">TN</span><span><span class="brand-tilde">~/</span>thanhntmany</span></a>
    <nav class="nav" aria-label="${T.nav.sections}">
      <a href="#services">${T.nav.services}</a>
      <a href="#about">${T.nav.about}</a>
      <a href="#projects">${T.nav.projects}</a>
      <a href="#notebook">${T.nav.notebook}</a>
    </nav>
    <a class="btn btn-primary btn-sm" href="#contact">${icon.mail}<span>${T.cta}</span></a>
    <a class="icon-btn lang-switch" href="${other.path}" hreflang="${other.lang}" lang="${other.lang}" aria-label="${T.switchLabel}" title="${T.switchLabel}">${other.lang.toUpperCase()}</a>
    <button class="icon-btn theme-toggle" type="button" aria-label="${T.themeToggle}" do-active="${__dirname + "/cpn/theme-toggle.mjs"}">${icon.moon}${icon.sun}</button>
  </div>
</header>

<main id="main" do-active="${__dirname + "/cpn/reveal.mjs"}">
  <section class="hero" id="top">
    <div class="wrap">
      <div>
        <span class="eyebrow"><span class="dot"></span>${T.hero.eyebrow}</span>
        <h1>${T.hero.h1[0]}<span class="accent">${T.hero.h1[1]}</span>${T.hero.h1[2]}</h1>
        <p class="lede">${T.hero.lede}</p>
        <div class="actions">
          <a class="btn btn-primary" href="mailto:${EMAIL}">${icon.mail}${T.hero.email}</a>
          <a class="btn" href="tel:${TEL}">${icon.phone}${PHONE}</a>
        </div>
      </div>

      <aside class="reach" id="contact-card" aria-label="${T.hero.contact}">
        <div class="reach-head">
          <span class="brand-mark">TN</span>
          <div><b>Nguyễn Thuận Thành</b><small>ERP Fullstack Dev &amp; IoT Engineer</small></div>
        </div>
        <ul class="channels">
          ${channels.map(channel).join("\n          ")}
        </ul>
        <p class="reach-note">${icon.clock}<span>${T.hero.note}</span></p>
      </aside>
    </div>
  </section>

  <section class="section" id="services">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>01</b> / ${T.num.services}</div>
        <div>
          <h2>${S.h2}</h2>
          <p class="section-sub">${S.sub}</p>
        </div>
      </div>
      <div class="section-body">
        <div class="services">
          <div class="service reveal">
            <span class="service-num">A</span>
            <h3>${S.consulting.h3} <span class="status live">${T.free}</span></h3>
            <p>${S.consulting.p}</p>
            <ul class="chips" aria-label="${S.consulting.areasLabel}">${S.consulting.areas.map(a => `<li>${a}</li>`).join("")}</ul>
            <a class="btn btn-primary" href="mailto:${EMAIL}?subject=${encodeURIComponent(S.consulting.subject)}">${icon.mail}${S.consulting.btn}</a>
          </div>
          <div class="service reveal">
            <span class="service-num">B</span>
            <h3>${S.mentoring.h3} <span class="status live">${T.free}</span></h3>
            <p>${S.mentoring.p}</p>
            <ul class="langs" aria-label="${S.mentoring.langsLabel}">${langs.map(l => `<li>${l}</li>`).join("")}</ul>
            <p class="service-fine">${S.mentoring.fine}</p>
            <a class="btn" href="${FB}" target="_blank" rel="noopener">${icon.facebook}${S.mentoring.btn}</a>
          </div>
        </div>

        <div class="focus reveal">
          <h3>${F.h3}</h3>
          <div class="chats">
            <div class="chat chat-do">
              <p class="chat-label">${F.do}</p>
              ${msg("you", F.doAsk)}
              <p class="wait">${F.wait}</p>
              ${msg("me", F.answer)}
            </div>
            <div class="chat chat-dont">
              <p class="chat-label">${F.dont}</p>
              ${msg("you", F.hi)}
              <p class="wait">${F.wait}</p>
              ${msg("me", F.hiBack)}
              <p class="wait">${F.wait}</p>
              ${msg("you", F.late)}
              <p class="wait">${F.wait}</p>
              ${msg("me", F.answer)}
              <p class="wait">${F.evening}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>02</b> / ${T.num.about}</div>
        <div>
          <h2>${T.about.h2}</h2>
          <p class="section-sub">${T.about.sub}</p>
        </div>
      </div>
      <div class="section-body">
        <div class="about">
          <ol class="timeline reveal">
            ${T.about.timeline.map(([when, role, what]) => `<li><span class="tl-when">${when}</span><div><b>${role}</b><p>${what}</p></div></li>`).join("\n            ")}
          </ol>
          <div class="shelf skills reveal">
            ${T.about.skills.map(([group, items]) => `<h3>${group}</h3><ul class="chips">${items.map(i => `<li>${i}</li>`).join("")}</ul>`).join("\n            ")}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="projects">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>03</b> / ${T.num.projects}</div>
        <div>
          <h2>${T.projects.h2}</h2>
          <p class="section-sub">${T.projects.sub}</p>
        </div>
      </div>
      <div class="section-body">
        ${projects.length ? `<div class="cards">
          ${projects.map(card).join("\n          ")}
        </div>
        <div class="updating reveal">
          <p>${T.projects.more}</p>
          ${ask(T.projects.subject)}
        </div>` : `<div class="updating reveal">
          <p>${T.projects.empty}</p>
          ${ask(T.projects.subject)}
        </div>`}
        <a class="more reveal" href="${GH}?tab=repositories" target="_blank" rel="noopener">${icon.github}${T.projects.github}${icon.arrow}</a>
      </div>
    </div>
  </section>

  <section class="section" id="notebook">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>04</b> / ${T.num.notebook}</div>
        <div>
          <h2>${T.notebook.h2}</h2>
          <p class="section-sub">${T.notebook.sub}</p>
        </div>
      </div>
      <div class="section-body">
        <div class="index">
          ${T.notebook.shelves.map(([title, items]) => `<div class="shelf reveal">
            <h3>${title} <span>${String(items.length).padStart(2, "0")}</span></h3>
            <ul>
              ${items.map(([path, name, topic]) => `<li><a href="${REPO}/${path}" target="_blank" rel="noopener"><span>${name}</span><small>${topic}</small></a></li>`).join("\n              ")}
            </ul>
          </div>`).join("\n          ")}
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="contact" id="contact">
  <div class="wrap">
    <p class="contact-kicker">${T.contact.kicker}</p>
    <a class="contact-mail" href="mailto:${EMAIL}">${EMAIL}</a>
    <div class="contact-row">
      <button class="btn" type="button" ${copyAttrs(EMAIL)}>${icon.copy}${T.contact.copy}</button>
      <a class="btn" href="tel:${TEL}">${icon.phone}${PHONE}</a>
      <a class="btn" href="${FB}" target="_blank" rel="noopener">${icon.facebook}Facebook</a>
      <a class="btn" href="${X}" target="_blank" rel="noopener">${icon.x}@Thanhnt_many</a>
      <a class="btn" href="${GH}" target="_blank" rel="noopener">${icon.github}GitHub</a>
    </div>
    <p class="contact-note">${icon.clock}${T.contact.note}</p>
    <div class="footer">
      <span>© Nguyễn Thuận Thành · ${T.contact.country}</span>
      <span>${T.contact.built[0]} <a href="${GH}/phloemjs" target="_blank" rel="noopener">phloemjs</a> · ${T.contact.built[1]}</span>
    </div>
  </div>
</footer>`)
    return page
}

export default render("en")
