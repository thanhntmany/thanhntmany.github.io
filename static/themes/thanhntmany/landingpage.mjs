import phloemjs from "phloemjs/server-side.mjs"
import html5 from "phloemjs/htmlbase/html5.mjs"


const { dirname } = phloemjs,
    __dirname = dirname(import.meta.url)


export default html5.$({
    body: "Thanhntmany"
})