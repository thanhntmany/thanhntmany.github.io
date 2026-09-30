// Projects shown in the Projects section, newest first. Client and employer names are intentionally left out.
// While the list is empty the section shows an "being updated" note that points visitors to contact instead.
// Text fields take a plain string (same in every language) or { en, vi }.
//
// {
//     name: { en: "Project name", vi: "Tên dự án" },
//     year: "2025",                        // or a range, e.g. "2023 – 2024"
//     type: "ERP website",                 // role, kind of work, client industry, ...
//     status: "completed",                 // optional: "completed" or "ongoing"
//     summary: { en: "What problem it solved and the result.", vi: "Giải quyết vấn đề gì và kết quả." },
//     stack: ["Python", "Odoo"],
//     link: "https://...",                 // optional: live site, repo or case study
// },
export default [
    {
        name: { en: "Embedded Android & Linux IoT systems", vi: "Hệ thống IoT trên Android & Linux nhúng" },
        type: "IoT Engineer",
        status: "ongoing",
        summary: {
            en: "End-to-end IoT systems: customizing Android and embedded Linux for the devices, plus the control system, Android apps and ESP32 firmware in C.",
            vi: "Làm trọn gói hệ thống IoT: tuỳ biến Android và Linux nhúng cho thiết bị, cùng hệ thống điều khiển, app Android và firmware ESP32 viết bằng C.",
        },
        stack: ["Android OS", "Embedded Linux", "Kotlin", "C", "Control systems", "ESP32"],
    },
    {
        name: { en: "Tailored LMS platform", vi: "Nền tảng LMS làm riêng" },
        year: { en: "2024 – now", vi: "2024 – nay" },
        type: "Project Manager · Team Lead",
        summary: {
            en: "A learning management system for a Korean client, delivered by a dedicated team on an architecture designed for higher load and new services. Custom Odoo 17 modules, widgets and integrations cover courses, college transcripts, payroll and payments, with ExpressJS APIs for customer support and static assets.",
            vi: "Hệ thống quản lý học tập cho một khách hàng Hàn Quốc, do đội mình tự lập và phát triển, kiến trúc được thiết kế để chịu tải cao và dễ thêm dịch vụ mới. Module, widget và tích hợp Odoo 17 làm riêng cho khoá học, bảng điểm, tính lương và thanh toán; API ExpressJS phục vụ chăm sóc khách hàng và tài nguyên tĩnh.",
        },
        stack: ["Odoo 17", "Python", "ExpressJS", "System architecture"],
    },
    {
        name: { en: "Water supply & drainage management", vi: "Quản lý cấp thoát nước" },
        year: "2023 – 2024",
        type: "Team Lead",
        status: "completed",
        summary: {
            en: "Water supply and drainage management built on Odoo 16 and integrated with the ArcGIS geospatial platform, delivered as part of business management solutions for SMEs.",
            vi: "Quản lý cấp thoát nước trên nền Odoo 16, tích hợp bản đồ ArcGIS, nằm trong bộ giải pháp quản lý cho doanh nghiệp vừa và nhỏ.",
        },
        stack: ["Odoo 16", "ArcGIS", "Python"],
    },
    {
        name: { en: "Microservices & automated document processing", vi: "Microservices & xử lý tài liệu tự động" },
        year: "2019 – 2021",
        type: "ERP · Fullstack Developer",
        status: "completed",
        summary: {
            en: "Microservices built from scratch and tools for automated document processing for an international company, alongside training and mentoring new team members.",
            vi: "Dựng microservices từ đầu và làm công cụ xử lý tài liệu tự động cho một công ty nước ngoài, đồng thời kèm các bạn mới vào nhóm.",
        },
        stack: ["Node.js", "ExpressJS", "Socket.IO", "React", "Django", "Docker", "AWS", "CI/CD"],
    },
    {
        name: { en: "Odoo ERP modules", vi: "Module Odoo ERP" },
        year: "2018 – 2019",
        type: "Odoo ERP Technical Consultant",
        status: "completed",
        summary: {
            en: "Accounting, warehouse, CRM and sales modules developed and maintained for an Odoo Gold Partner.",
            vi: "Phát triển và bảo trì các module kế toán, kho, CRM và bán hàng cho một Odoo Gold Partner.",
        },
        stack: ["Odoo", "Python", "JavaScript"],
    },
]
