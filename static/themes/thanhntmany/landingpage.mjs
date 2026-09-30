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
}

const STATUS = { stable: "live", wip: "", paused: "" }
const card = (p, feature) => `<a class="card${feature ? " card-feature" : ""} reveal" href="${GH}/${p.repo}" target="_blank" rel="noopener">
            <div class="card-top"><span class="card-path">thanhntmany/${p.repo}</span><span class="status ${STATUS[p.status]}">${p.status}</span></div>
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <div class="card-foot">${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}${p.stars ? `<span class="stars">${icon.star}${p.stars}</span>` : ""}</div>
            <span class="card-arrow">${icon.arrow}</span>
          </a>`

// Sourced from the public repositories at github.com/thanhntmany
const projects = [
    { repo: "rfc-diagram", name: "RFC Diagram", status: "stable", stars: 1, tags: ["IETF RFCs", "Graph", "SVG"], desc: "An arranged diagram of the RFC series for tracking standards more easily — which documents update or obsolete which, rendered as one large graph in light and dark versions." },
    { repo: "tntbuild", name: "tntbuild", status: "wip", stars: 2, tags: ["C", "Cross-platform"], desc: "The TNT build system: targets, dependencies, related files and build or on-change scripts are declared as tags straight from the shell." },
    { repo: "esp32-oscilloscope", name: "ESP32 Oscilloscope", status: "wip", tags: ["C", "ESP-IDF", "IoT"], desc: "A 2-channel oscilloscope on an ESP32 NodeMCU-32. The board runs its own Wi-Fi access point and serves the waveform display and every control to a browser — no screen, no app." },
    { repo: "phloemjs", name: "Phloemjs", status: "wip", tags: ["JavaScript", "C", "Web framework"], desc: "A web framework built on what the platform already provides — browsers, devices, network topology. This website is built with it." },
    { repo: "rounding-zoom", name: "Rounding Zoom", status: "wip", tags: ["TypeScript", "VS Code"], desc: "A VS Code extension that replaces the built-in zoom with a font-size based, integer-rounded zoom, so text stays sharp at every zoom level." },
    { repo: "esp-flasher", name: "esp-flasher", status: "paused", tags: ["C", "IoT"], desc: "A standalone tool and C library for flashing ESP devices without esptool, including mass flashing. Postponed until the next stable version." },
    { repo: "pn532-js", name: "pn532-js", status: "wip", tags: ["JavaScript", "RFID"], desc: "A library to handle the NXP PN532 RFID/NFC reader." },
    { repo: "directory-as-set-js", name: "directory-as-set.js", status: "stable", stars: 1, tags: ["Node.js", "CLI"], desc: "The das command line tool for working with directories as sets — can run straight from GitHub without installing." },
    { repo: "do-it-later-js", name: "do-it-later-js", status: "stable", tags: ["JavaScript", "Queue"], desc: "A small queue library for deferring work until later." },
]

const stack = [
    ["MASM", "root-cause analysis, application analysis"],
    ["C / C++", "applications, tools, algorithm problems"],
    ["JavaScript", "web and applications on Node.js"],
    ["Python", "data science, Django, Odoo, research"],
    ["Go", "embedded systems"],
    ["VBA", "Excel automation"],
    ["PHP", "vBulletin, WordPress, Symfony"],
    ["Java", "tools for processing PDFs"],
    ["R", "data processing, academic research"],
]

// Applied before first paint so the saved theme never flashes.
page.HTMLrequire(`<meta name="description" content="Nguyễn Thuận Thành (thanhntmany) — ERP, IoT and fullstack developer from Vietnam. Projects, notebook and contact.">`)
page.HTMLrequire(`<meta name="theme-color" content="#f6f3ec">`)
page.HTMLrequire(`<link rel="icon" href="/favicon.ico">`)
page.HTMLrequire(`<script>try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>`)
page.HTMLrequire(`<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`)
page.HTMLrequire(buildTag.css("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"))
page.HTMLrequire(buildTag.css(__dirname + "/static/main.css"))
page.HTMLrequire(buildTag.mjs(__dirname + "/main.mjs"))
$.title = "Nguyễn Thuận Thành — ERP · IoT · Fullstack Developer"
$.body = new StringAr(`<a class="skip" href="#main">Skip to content</a>

<header class="topbar" do-active="${__dirname + "/cpn/topbar.mjs"}">
  <div class="wrap">
    <a class="brand" href="#top" aria-label="thanhntmany — home"><span class="brand-mark">TN</span><span><span class="brand-tilde">~/</span>thanhntmany</span></a>
    <nav class="nav" aria-label="Sections">
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#notebook">Notebook</a>
      <a href="#contact">Contact</a>
    </nav>
    <button class="icon-btn theme-toggle" type="button" aria-label="Toggle dark mode" do-active="${__dirname + "/cpn/theme-toggle.mjs"}">${icon.moon}${icon.sun}</button>
  </div>
</header>

<main id="main" do-active="${__dirname + "/cpn/reveal.mjs"}">
  <section class="hero" id="top">
    <div class="wrap">
      <div>
        <span class="eyebrow"><span class="dot"></span>ERP · IoT · Fullstack Developer</span>
        <h1>Nguyễn<br>Thuận <span class="accent">Thành</span>.</h1>
        <p class="lede">I began coding with MASM assembly at ten, then delved into C and C++ — so I work with a foundation-and-optimization mindset. I lead a small team building business ERP websites, optimizing systems and building solutions for specific problems.</p>
        <div class="actions">
          <a class="btn btn-primary" href="mailto:thanhntmany@gmail.com">${icon.mail}Get in touch</a>
          <a class="btn" href="${GH}" target="_blank" rel="noopener">${icon.github}GitHub</a>
        </div>
      </div>

      <div class="term" aria-label="About me in a terminal">
        <div class="term-bar"><i></i><i></i><i></i><span>thanhntmany.github.io</span></div>
        <div class="term-body"><pre><span class="p">$</span> whoami
thanhntmany <span class="c"># Vietnam</span>
<span class="p">$</span> cat roles
IT         ERP · IoT · Fullstack
Marketing  Account Planner
<span class="p">$</span> ls ~/work
<a href="#projects">tntbuild/</a>  <a href="#projects">phloemjs/</a>
<a href="#projects">rfc-diagram/</a>  <a href="#projects">esp32-oscilloscope/</a>
<span class="p">$</span> <span class="cursor"></span></pre></div>
      </div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>01</b> / about</div>
        <div>
          <h2>Foundation first, then optimize</h2>
          <p class="section-sub">Starting from assembly shaped how I approach everything since: understand the layer underneath, then pick the right higher-level tool for the job.</p>
        </div>
      </div>
      <div class="section-body">
        <div class="about">
          <div class="shelf reveal">
            <h3>Languages I use <span>${String(stack.length).padStart(2, "0")}</span></h3>
            <ul class="stack">
              ${stack.map(([l, u]) => `<li><b>${l}</b><small>${u}</small></li>`).join("\n              ")}
            </ul>
          </div>
          <div class="services">
            <div class="soon-item reveal">
              <h3>IT solution consulting <span class="status live">free</span></h3>
              <p>Need a solution for your business, issue, task, project or assignment? Just let me know — any channel works.</p>
            </div>
            <div class="soon-item reveal">
              <h3>Programming training <span class="status live">free</span></h3>
              <p>For teammates, friends and the curious. Every day after 20:30 (GMT+7) I check my inbox and start training sessions. English, Tiếng Việt, 中文, Deutsch, Français, 日本語, 한국어 or Русский — or any translator.</p>
            </div>
            <div class="tip reveal">
              <p class="tip-title">Please focus on the problem</p>
              <div class="tip-grid">
                <div><span class="tip-ok">Do</span><p>“Hi, I'm confused about … and the problem is …”</p></div>
                <div><span class="tip-no">Don't</span><p>“Hi.” <span class="c">…waiting…</span> then the problem, three messages later.</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="projects">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>02</b> / projects</div>
        <div>
          <h2>Public projects</h2>
          <p class="section-sub">Build tools, web frameworks, embedded devices and standards tracking — from my GitHub.</p>
        </div>
      </div>
      <div class="section-body">
        <div class="cards">
          ${projects.map((p, i) => card(p, i === 0)).join("\n          ")}
        </div>
        <a class="more reveal" href="${GH}?tab=repositories" target="_blank" rel="noopener">${icon.github}See all repositories on GitHub${icon.arrow}</a>
      </div>
    </div>
  </section>

  <section class="section" id="notebook">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="section-num"><b>03</b> / notebook</div>
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
    <p class="contact-kicker">04 / contact — have a problem to solve?</p>
    <a class="contact-mail" href="mailto:thanhntmany@gmail.com">thanhntmany@gmail.com</a>
    <div class="contact-row">
      <button class="btn" type="button" data-copy="thanhntmany@gmail.com" do-active="${__dirname + "/cpn/copy.mjs"}">${icon.copy}Copy email</button>
      <a class="btn" href="${GH}" target="_blank" rel="noopener">${icon.github}GitHub</a>
      <a class="btn" href="https://www.facebook.com/thanhntmany/" target="_blank" rel="noopener">${icon.facebook}Facebook</a>
      <a class="btn" href="https://twitter.com/Thanhnt_many" target="_blank" rel="noopener">${icon.x}@Thanhnt_many</a>
    </div>
    <div class="footer">
      <span>© Nguyễn Thuận Thành · Vietnam</span>
      <span>Built with <a href="${GH}/phloemjs" target="_blank" rel="noopener">phloemjs</a> · hosted on GitHub Pages</span>
    </div>
  </div>
</footer>`)
