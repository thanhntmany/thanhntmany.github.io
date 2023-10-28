import phloemjs from "phloemjs/server-side.mjs"
const __dirname = phloemjs.dirname(import.meta.url), buildTag = phloemjs.HTML.buildTag
import html5 from "phloemjs/htmlbase/html5.mjs"


export default html5.$({
    body: "Thanhntmany"
}).HTMLrequire(
    buildTag.css(__dirname + "/static/main.css"),
)