// Projects shown in the Projects section, newest first. Client and employer names are intentionally left out.
// While the list is empty the section shows an "being updated" note that points visitors to contact instead.
//
// {
//     name: "Project name",
//     year: "2025",                        // or a range, e.g. "2023 – 2024"
//     type: "ERP website",                 // role, kind of work, client industry, ...
//     status: "completed",                 // optional: "completed" or "ongoing"
//     summary: "What problem it solved and the result, in one or two sentences.",
//     stack: ["Python", "Odoo"],
//     link: "https://...",                 // optional: live site, repo or case study
// },
export default [
    {
        name: "Embedded Android & Linux IoT systems",
        type: "IoT Engineer",
        status: "ongoing",
        summary: "End-to-end IoT systems: customizing Android and embedded Linux for the devices, plus the control system, Android apps and ESP32 firmware in C.",
        stack: ["Android OS", "Embedded Linux", "Kotlin", "C", "Control systems", "ESP32"],
    },
    {
        name: "Tailored LMS platform",
        year: "2024 – now",
        type: "Project Manager · Team Lead",
        summary: "A learning management system for a Korean client, delivered by a dedicated team on an architecture designed for higher load and new services. Custom Odoo 17 modules, widgets and integrations cover courses, college transcripts, payroll and payments, with ExpressJS APIs for customer support and static assets.",
        stack: ["Odoo 17", "Python", "ExpressJS", "System architecture"],
    },
    {
        name: "Water supply & drainage management",
        year: "2023 – 2024",
        type: "Team Lead",
        status: "completed",
        summary: "Water supply and drainage management built on Odoo 16 and integrated with the ArcGIS geospatial platform, delivered as part of business management solutions for SMEs.",
        stack: ["Odoo 16", "ArcGIS", "Python"],
    },
    {
        name: "Microservices & automated document processing",
        year: "2019 – 2021",
        type: "ERP · Fullstack Developer",
        status: "completed",
        summary: "Microservices built from scratch and tools for automated document processing for an international company, alongside training and mentoring new team members.",
        stack: ["Node.js", "ExpressJS", "Socket.IO", "React", "Django", "Docker", "AWS", "CI/CD"],
    },
    {
        name: "Odoo ERP modules",
        year: "2018 – 2019",
        type: "Odoo ERP Technical Consultant",
        status: "completed",
        summary: "Accounting, warehouse, CRM and sales modules developed and maintained for an Odoo Gold Partner.",
        stack: ["Odoo", "Python", "JavaScript"],
    },
]
