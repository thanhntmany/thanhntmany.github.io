// English strings for the landing page. Keep keys in sync with vi.mjs.
export default {
    lang: "en",
    path: "/",
    switchLabel: "Tiếng Việt",
    title: "Nguyễn Thuận Thành — ERP Fullstack Dev & IoT Engineer",
    description: "Nguyễn Thuận Thành — ERP Fullstack Dev & IoT Engineer in Vietnam. Free consulting on ERP (Odoo), web systems, microservices, embedded Android/Linux and IoT, plus free programming mentoring.",
    skip: "Skip to content",
    home: "home",
    nav: { services: "Services", about: "About", projects: "Projects", notebook: "Notebook", sections: "Sections" },
    cta: "Get in touch",
    themeToggle: "Toggle dark mode",
    copied: "Copied",
    copy: "Copy",
    num: { services: "services", about: "about", projects: "projects", notebook: "notebook", contact: "contact" },
    free: "free",

    hero: {
        eyebrow: "Free IT consulting · Free programming mentoring",
        h1: ["How can I ", "help you", "?"],
        lede: "Need a solution for your <b>business</b>, <b>project</b>, <b>issue</b> or <b>assignment</b>? Tell me about it through any channel here. I'm <b>Nguyễn Thuận Thành</b>, an ERP Fullstack Dev &amp; IoT Engineer in Vietnam — I build ERP systems, web platforms and embedded Android/Linux IoT systems.",
        email: "Email me",
        contact: "Contact",
        note: "I go through emails and messages every day after <b>20:30 (GMT+7)</b>.",
    },
    channel: { email: "Email", phone: "Phone", facebook: "Facebook", x: "X" },

    services: {
        h2: "Two ways I can help — both free",
        sub: "Bring me a specific problem and we'll work out a specific solution. Don't be shy!",
        consulting: {
            h3: "IT solution consulting",
            p: "Whether it's your business, a project, a technical issue or an assignment, tell me what you need and I'll help you find the right solution. Areas I work in:",
            areasLabel: "Areas",
            areas: ["ERP on Odoo", "Web systems & microservices", "LMS", "GIS integration", "Embedded Android & Linux", "IoT & control systems"],
            btn: "Describe your problem",
            subject: "Solution consulting",
        },
        mentoring: {
            h3: "Programming mentoring",
            p: "For teammates, friends and anyone curious to learn. Every evening after 20:30 (GMT+7) I go through my inbox and run training sessions. Send me a message in any of these languages:",
            langsLabel: "Languages I can reply in",
            fine: "…or any other language through a translator.",
            btn: "Message me on Facebook",
        },
        focus: {
            h3: "Get straight to the problem",
            do: "✅ Do",
            dont: "❌ Don't",
            wait: "waiting…",
            you: "You",
            me: "Thành",
            doAsk: "Hi! I'm stuck on … — here's the problem: …",
            answer: "Got it — here's how to solve it: …",
            hi: "Hi.",
            hiBack: "Hi! How can I help?",
            late: "So, the problem is …",
            evening: "…a whole evening later",
        },
    },

    about: {
        h2: "Technology that improves business and life",
        sub: "I started with assembly (MASM) at the age of 10, which taught me to understand systems from the ground up and to optimize them. Since 2018 I have built ERP systems and microservices, led teams and delivered whole systems from scratch. Today I work across ERP and IoT, with the goal of becoming a solution architect.",
        // Career path from the CV, without employer names.
        timeline: [
            ["Now", "ERP Fullstack Dev & IoT Engineer", "Customizing Android and embedded Linux operating systems for devices, and building the control systems, Android apps and ESP32 firmware around them."],
            ["2024 – now", "Project Manager · Team Lead", "Built a dedicated team to deliver a tailored LMS for a Korean client on Odoo 17 and ExpressJS, with an architecture designed to scale."],
            ["2023 – 2024", "Team Lead · Freelance team", "Delivered business management solutions for SMEs, including water supply and drainage management built on Odoo 16 and ArcGIS."],
            ["2021 – 2023", "Signals Officer · Military service", "Ran wireless communication operations and maintained computer systems and data infrastructure on Microsoft SQL Server."],
            ["2019 – 2021", "ERP · Fullstack Developer", "Built microservices from scratch, created automated document-processing tools, and trained and mentored new team members."],
            ["2018 – 2019", "Odoo ERP Technical Consultant", "Developed and maintained Accounting, Warehouse, CRM and Sales modules."],
            ["2017 – 2019", "Bachelor's degree", "University of Economics Ho Chi Minh City."],
            ["2008", "First lines of code", "Started with Assembly (MASM32) and C, analysing software in depth and tracing problems to their root cause."],
        ],
        skills: [
            ["Languages", ["JavaScript / Node.js", "Python", "C / C++", "Kotlin", "PHP", "SQL (MySQL, MS SQL Server)", "HTML5 / CSS3", "Assembly (MASM)"]],
            ["ERP & frameworks", ["Odoo 16 / 17", "Django", "ReactJS", "ExpressJS", "Socket.IO", "Symfony", "ArcGIS"]],
            ["Embedded & IoT", ["Android OS customization", "Embedded Linux", "Android apps (Kotlin, C)", "Control systems", "ESP32 / Embedded C", "Ubuntu administration"]],
            ["DevOps", ["Docker", "AWS", "GitHub CI/CD", "CircleCI"]],
            ["UI design", ["Figma", "Illustrator", "Photoshop"]],
        ],
    },

    projects: {
        h2: "Projects",
        sub: "ERP platforms, web systems, microservices and IoT, each built around a specific problem. Client names are kept confidential.",
        status: { completed: "completed", ongoing: "ongoing" },
        more: "<b>More projects are on the way.</b> Ask me about work similar to what you need.",
        empty: "<b>This list is being updated.</b> Many completed projects aren't listed yet — ask me about work similar to what you need.",
        btn: "Ask about my projects",
        subject: "Your projects",
        github: "Open-source work on GitHub",
    },

    notebook: {
        h2: "Notebook",
        sub: "Notes I keep while learning: fundamentals, specification summaries and references I come back to.",
        shelves: [
            ["Basics", [["notebook/basic/OSI-OpenSystemsInterconnection", "OSI model", "networking"], ["notebook/basic/regex", "Regular expressions", "text"]]],
            ["RFC summaries", [["notebook/summary/rfc/rfc5389", "RFC 5389 — STUN", "NAT"], ["notebook/summary/rfc", "RFC map", "index"]]],
            ["References", [["notebook/open-source-license", "Open source licenses", "legal"]]],
        ],
    },

    contact: {
        kicker: "05 / contact — reach me any way you like",
        copy: "Copy email",
        note: "I go through emails and messages every day after 20:30 (GMT+7). Put the problem in your first message and I can help faster.",
        country: "Vietnam",
        built: ["Built with", "hosted on GitHub Pages"],
    },
}
