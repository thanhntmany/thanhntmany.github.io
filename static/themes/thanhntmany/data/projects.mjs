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
        type: "IoT engineer",
        status: "ongoing",
        summary: "End-to-end IoT systems, mainly customizing Android and embedded Linux operating systems for the devices, plus the control system, Android apps and the C firmware core of ESP32 nodes.",
        stack: ["Android OS", "Embedded Linux", "Kotlin", "C", "Control systems", "ESP32"],
    },
    {
        name: "Tailored LMS platform",
        year: "2024 – now",
        type: "Project manager · Team lead",
        summary: "Built a specialized team and a learning management system for a Korean customer, with an architecture designed for higher load and new services. Custom Odoo 17 modules, widgets and integrations for courses, college transcripts, payroll and payments; ExpressJS APIs for customer support and static assets.",
        stack: ["Odoo 17", "Python", "ExpressJS", "System architecture"],
    },
    {
        name: "Water supply & drainage management",
        year: "2023 – 2024",
        type: "Team lead",
        status: "completed",
        summary: "Odoo 16 integrated with the ArcGIS geospatial platform to create, customize and maintain water supply and drainage systems, as part of business management solutions for SME customers.",
        stack: ["Odoo 16", "ArcGIS", "Python"],
    },
    {
        name: "Microservices & automated document processing",
        year: "2019 – 2021",
        type: "ERP · Fullstack developer",
        status: "completed",
        summary: "Built microservices from scratch and designed tools for automated document processing for an international company, while training and mentoring newcomers.",
        stack: ["Node.js", "ExpressJS", "Socket.IO", "React", "Django", "Docker", "AWS", "CI/CD"],
    },
    {
        name: "Odoo ERP modules",
        year: "2018 – 2019",
        type: "ERP technical consultant",
        status: "completed",
        summary: "Developed and maintained Odoo ERP modules for accounting, warehouse, CRM and sales at an Odoo Gold Partner.",
        stack: ["Odoo", "Python", "JavaScript"],
    },
]
