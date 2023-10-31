import phloemjs from "www/phloe.mjs"
const __dirname = phloemjs.dirname(import.meta.url), { StringAr } = phloemjs, buildTag = phloemjs.HTML.buildTag

export default new StringAr(`<div do-active="${__dirname + "/card-active.mjs"}"><hr>card<hr><div>`)