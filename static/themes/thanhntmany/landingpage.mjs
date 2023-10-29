import phloemjs from "phloemjs/server-side.mjs"
const __dirname = phloemjs.dirname(import.meta.url), { StringAr } = phloemjs, buildTag = phloemjs.HTML.buildTag
import html5 from "phloemjs/htmlbase/html5.mjs"

const page = html5.c(), $ = page.$
export default page

page.HTMLrequire(buildTag.css(__dirname + "/static/main.css"))
$.title = "Fullstack-ERP Developer - Nguyễn Thuận Thành <thanhntmany@gmail.com>"
$.body = new StringAr(`<div>
    <div>Tools</div>
    <div>Personal Projects</div>
    <div>Blogs</div>
    <div>Tools</div>
    <div>profile</div>
</div>
<div>
    <div>Nguyễn Thuận Thành</div>
    <div>Thanhntmany@gmail.com</div>
</div>`
)
