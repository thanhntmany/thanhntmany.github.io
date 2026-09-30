import phloemjs from "phloemjs/server-side.mjs"
const __dirname = phloemjs.dirname(import.meta.url), { StringAr } = phloemjs, buildTag = phloemjs.HTML.buildTag
import html5 from "phloemjs/htmlbase/html5.mjs"

const page = html5.c(), $ = page.$
export default page

const GH = "https://github.com/thanhntmany", REPO = GH + "/thanhntmany.github.io/tree/main"
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

const EMAIL = "thanhntmany@gmail.com", PHONE = "+84 344 087 349", TEL = "+84344087349",
    FB = "https://fb.com/thanhntmany", X = "https://twitter.com/Thanhnt_many"

const channels = [
    { icon: icon.mail, label: "Email", value: EMAIL, href: "mailto:" + EMAIL, copy: EMAIL },
    { icon: icon.phone, label: "Phone", value: PHONE, href: "tel:" + TEL, copy: PHONE },
    { icon: icon.facebook, label: "Facebook", value: "fb.com/thanhntmany", href: FB },
    { icon: icon.x, label: "X", value: "@Thanhnt_many", href: X },
]
const channel = c => `<li><a href="${c.href}"${c.href.startsWith("http") ? ` target="_blank" rel="noopener"` : ""}>${c.icon}<span><small>${c.label}</small>${c.value}</span></a>${c.copy ? `<button class="icon-btn" type="button" aria-label="Copy ${c.label.toLowerCase()}" data-copy="${c.copy}" do-active="${__dirname + "/cpn/copy.mjs"}">${icon.copy}</button>` : ""}</li>`

const langs = ["English", "Tiếng Việt", "中文", "Deutsch", "Français", "日本語", "한국어", "Русский"]

// "Some public projects" from the GitHub profile README; repo is set only where a public repository exists.
const STATUS = { Stable: "live", WIP: "", Pending: "" }
const projects = [
    { name: "TNT build system", status: "WIP", stack: "C, Cross platforms", repo: "tntbuild" },
    { name: "Node server eco-system", status: "WIP", stack: "JS, Java, C, Cross platforms, Web3" },
    { name: "Phloemjs web framework", status: "WIP", stack: "JS, C", repo: "phloemjs" },
    { name: "Module-based web/app-system", status: "WIP", stack: "JS, C" },
    { name: "do-it-later-js", status: "Stable", stack: "JS", repo: "do-it-later-js" },
    { name: "rfc-diagram", status: "Stable", stack: "CSV", repo: "rfc-diagram" },
    { name: "rfcs-graph-data-processer", status: "Stable", stack: "HTML, JS" },
    { name: "directory-as-set-js", status: "Stable", stack: "JS", repo: "directory-as-set-js" },
    { name: "directory-as-set-js (C version)", status: "Pending", stack: "C, Cross platforms" },
]
const row = p => {
    const cells = `<span class="ledger-name">${p.name}</span><span class="status ${STATUS[p.status]}">${p.status}</span><span class="ledger-stack">${p.stack}</span><span class="ledger-go">${p.repo ? icon.arrow : ""}</span>`
    return p.repo ? `<li><a href="${GH}/${p.repo}" target="_blank" rel="noopener">${cells}</a></li>` : `<li><div>${cells}</div></li>`
}

// Other public repositories on github.com/thanhntmany
const more = [
    { repo: "esp32-oscilloscope", name: "ESP32 Oscilloscope", tags: ["C", "ESP-IDF", "IoT"], desc: "A 2-channel oscilloscope on an ESP32 that serves its waveform display and controls to any browser over its own Wi-Fi." },
    { repo: "rounding-zoom", name: "Rounding Zoom", tags: ["TypeScript", "VS Code"], desc: "A VS Code extension with font-size based, integer-rounded zoom so text stays sharp." },
    { repo: "esp-flasher", name: "esp-flasher", tags: ["C", "IoT"], desc: "A standalone tool and C library for flashing ESP devices without esptool." },
    { repo: "pn532-js", name: "pn532-js", tags: ["JavaScript", "RFID"], desc: "A library to handle the PN532 RFID reader." },
]
const card = p => `<a class="card reveal" href="${GH}/${p.repo}" target="_blank" rel="noopener">
            <span class="card-path">thanhntmany/${p.repo}</span>
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <div class="card-foot">${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
            <span class="card-arrow">${icon.arrow}</span>
          </a>`

const stack = [
    ["MASM", "RCA, application analysing"],
    ["C / C++", "applications, tools, LeetCode algorithm problems"],
    ["JavaScript", "Node.js — both web and application"],
    ["Python", "data science, Django, Odoo, academic research"],
    ["Go", "embedded systems"],
    ["VBA", "especially VBA for Excel"],
    ["PHP", "vBulletin, WordPress, Symfony"],
    ["Java", "especially tools for processing PDFs"],
    ["R", "processing data, academic research"],
]

// Applied before first paint so the saved theme never flashes.
page.HTMLrequire(`<meta name="description" content="Need a solution for your business, issue, task, project or assignment? Free IT solution consulting and programming training by Nguyễn Thuận Thành — ERP · IoT · Fullstack developer.">`)
page.HTMLrequire(`<meta name="theme-color" content="#f6f3ec">`)
page.HTMLrequire(`<link rel="icon" href="/favicon.ico">`)
page.HTMLrequire(`<script>try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>`)
page.HTMLrequire(`<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`)
page.HTMLrequire(buildTag.css("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"))
page.HTMLrequire(buildTag.css(__dirname + "/static/main.css"))
page.HTMLrequire(buildTag.mjs(__dirname + "/main.mjs"))
$.title = "Nguyễn Thuận Thành — Free IT solution consulting & programming training"
$.body = new StringAr(`<a class="skip" href="#main">Skip to content</a>

<header class="topbar" do-active="${__dirname + "/cpn/topbar.mjs"}">
  <div class="wrap">
    <a class="brand" href="#top" aria-label="thanhntmany — home"><span class="brand-mark">TN</span><span><span class="brand-tilde">~/</span>thanhntmany</span></a>
    <nav class="nav" aria-label="Sections">
      <a href="#services">Services</a>
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#notebook">Notebook</a>
    </nav>
    <a class="btn btn-primary btn-sm" href="#contact">${icon.mail}<span>Get in touch</span></a>
    <button class="icon-btn theme-toggle" type="button" aria-label="Toggle dark mode" do-active="${__dirname + "/cpn/theme-toggle.mjs"}">${icon.moon}${icon.sun}</button>
  </div>
</header>

<main id="main" do-active="${__dirname + "/cpn/reveal.mjs"}">
  <section class="hero" id="top">
    <div class="wrap">
      <div>
        <span class="eyebrow"><span class="dot"></span>Free IT consulting · Free programming training</span>
        <h1>Might I <span class="accent">help you</span>?</h1>
        <p class="lede">Just inform me by any way if you need a solution for your <b>business</b>, <b>issue</b>, <b>task</b>, <b>project</b> or <b>assignment</b>. I'm <b>Nguyễn Thuận Thành</b> — an ERP · IoT · Fullstack developer in Vietnam.</p>
        <div class="actions">
          <a class="btn btn-primary" href="mailto:${EMAIL}">${icon.mail}Email me</a>
          <a class="btn" href="tel:${TEL}">${icon.phone}${PHONE}</a>
        </div>
      </div>

      <aside class="reach" id="contact-card" aria-label="Contact">
        <div class="reach-head">
          <span class="brand-mark">TN</span>
          <div><b>Thanh Nguyen Thuan</b><small>ERP · IoT · Fullstack Developer</small></div>
        </div>
        <ul class="channels">
          ${channels.map(channel).join("\n          ")}
        </ul>
        <p class="reach-note">${icon.clock}<span>I check my mail and message inbox every day after <b>20:30 (GMT+7)</b>.</span></p>
      </aside>
    </div>
  </section>

  <section class="section" id="services">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>01</b> / services</div>
        <div>
          <h2>How I can help — for free</h2>
          <p class="section-sub">Everything you need is a specific solution. Don't be shy!</p>
        </div>
      </div>
      <div class="section-body">
        <div class="services">
          <div class="service reveal">
            <span class="service-num">A</span>
            <h3>IT Solution Consultant <span class="status live">free</span></h3>
            <p>Just inform me by any way if you need a solution for your business, issue, task, project or assignment.</p>
            <p class="service-ask">Might I help you?</p>
            <a class="btn btn-primary" href="mailto:${EMAIL}?subject=Solution%20consulting">${icon.mail}Describe your problem</a>
          </div>
          <div class="service reveal">
            <span class="service-num">B</span>
            <h3>Programming training / supporter <span class="status live">free</span></h3>
            <p>For my teammates, my friends and the curious ones. Every day after 20:30 (GMT+7) I check the mail and message inbox and start training classes. Feel free to inbox me.</p>
            <ul class="langs" aria-label="Languages I can reply in">${langs.map(l => `<li>${l}</li>`).join("")}</ul>
            <p class="service-fine">Or try using any translator.</p>
            <a class="btn" href="${FB}" target="_blank" rel="noopener">${icon.facebook}Message me</a>
          </div>
        </div>

        <div class="focus reveal">
          <h3>Pls. focus on the problem</h3>
          <div class="chats">
            <div class="chat chat-do">
              <p class="chat-label">✅ Do</p>
              <p class="msg you">Hi. I'm confused about … and the problem is …</p>
              <p class="wait">waiting…</p>
              <p class="msg me">I reply</p>
            </div>
            <div class="chat chat-dont">
              <p class="chat-label">❌ Don't</p>
              <p class="msg you">Hi.</p>
              <p class="wait">waiting…</p>
              <p class="msg me">I greet back</p>
              <p class="wait">waiting…</p>
              <p class="msg you">The problem is that …</p>
              <p class="wait">waiting…</p>
              <p class="msg me">I reply</p>
              <p class="wait">waiting… waiting… waiting…</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>02</b> / about</div>
        <div>
          <h2>Foundation and optimization mindset</h2>
          <p class="section-sub">I began coding with MASM (an assembly language) at 10 years old, then delved into C and C++. Based on that, I have learned and used higher level programming languages. I have led a small team specializing in building business-ERP websites, optimizing systems and building solutions for specific problems.</p>
        </div>
      </div>
      <div class="section-body">
        <div class="shelf reveal">
          <h3>Languages <span>${String(stack.length).padStart(2, "0")}+</span></h3>
          <ul class="stack">
            ${stack.map(([l, u]) => `<li><b>${l}</b><small>${u}</small></li>`).join("\n            ")}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="projects">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>03</b> / projects</div>
        <div>
          <h2>Some public projects</h2>
          <p class="section-sub">Build systems, web frameworks, standards tracking and embedded tools.</p>
        </div>
      </div>
      <div class="section-body">
        <ul class="ledger reveal">
          <li class="ledger-head"><div><span>Name</span><span>Status</span><span>Stack</span><span></span></div></li>
          ${projects.map(row).join("\n          ")}
        </ul>
        <h3 class="subhead reveal">Also on GitHub</h3>
        <div class="cards">
          ${more.map(card).join("\n          ")}
        </div>
        <a class="more reveal" href="${GH}?tab=repositories" target="_blank" rel="noopener">${icon.github}See all repositories on GitHub${icon.arrow}</a>
      </div>
    </div>
  </section>

  <section class="section" id="notebook">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>04</b> / notebook</div>
        <div>
          <h2>Notebook</h2>
          <p class="section-sub">Notes I write while learning — fundamentals, summaries of specifications and references I keep coming back to.</p>
        </div>
      </div>
      <div class="section-body">
        <div class="index">
          <div class="shelf reveal">
            <h3>Basics <span>02</span></h3>
            <ul>
              <li><a href="${REPO}/notebook/basic/OSI-OpenSystemsInterconnection" target="_blank" rel="noopener"><span>OSI model</span><small>networking</small></a></li>
              <li><a href="${REPO}/notebook/basic/regex" target="_blank" rel="noopener"><span>Regular expressions</span><small>text</small></a></li>
            </ul>
          </div>
          <div class="shelf reveal">
            <h3>RFC summaries <span>02</span></h3>
            <ul>
              <li><a href="${REPO}/notebook/summary/rfc/rfc5389" target="_blank" rel="noopener"><span>RFC 5389 — STUN</span><small>NAT</small></a></li>
              <li><a href="${REPO}/notebook/summary/rfc" target="_blank" rel="noopener"><span>RFC map</span><small>index</small></a></li>
            </ul>
          </div>
          <div class="shelf reveal">
            <h3>References <span>01</span></h3>
            <ul>
              <li><a href="${REPO}/notebook/open-source-license" target="_blank" rel="noopener"><span>Open source licenses</span><small>legal</small></a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="contact" id="contact">
  <div class="wrap">
    <p class="contact-kicker">05 / contact — just inform me by any way</p>
    <a class="contact-mail" href="mailto:${EMAIL}">${EMAIL}</a>
    <div class="contact-row">
      <button class="btn" type="button" data-copy="${EMAIL}" do-active="${__dirname + "/cpn/copy.mjs"}">${icon.copy}Copy email</button>
      <a class="btn" href="tel:${TEL}">${icon.phone}${PHONE}</a>
      <a class="btn" href="${FB}" target="_blank" rel="noopener">${icon.facebook}Facebook</a>
      <a class="btn" href="${X}" target="_blank" rel="noopener">${icon.x}@Thanhnt_many</a>
      <a class="btn" href="${GH}" target="_blank" rel="noopener">${icon.github}GitHub</a>
    </div>
    <p class="contact-note">${icon.clock}Inbox checked every day after 20:30 (GMT+7). Please focus on the problem in your first message.</p>
    <div class="footer">
      <span>© Nguyễn Thuận Thành · Vietnam</span>
      <span>Built with <a href="${GH}/phloemjs" target="_blank" rel="noopener">phloemjs</a> · hosted on GitHub Pages</span>
    </div>
  </div>
</footer>`)
