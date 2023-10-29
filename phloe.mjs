/**
 * Phloemjs
 * 
 * @author Thanh Nguyen Thuan <thanhntmany@gmail.com>
 */
class StringAr {
 constructor(o, $) { if (o instanceof this.constructor) { this.r = o.r; this._ = o._; this.$ = Object.assign({}, o.$, $)} else { this.r = new Set(); (this._ = String(o).split(pRe)).forEach(sa); this.$ = $ || {} } }
 HTMLrequire() { [...arguments].flat(Infinity).filter(SnhE, this.r).forEach(SaE, this.r = new Set(this.r)); return this }
 _r(S) { S.add(this.r); Object.values(this.$).forEach(_r, S) }
 HTMLgetRequireList(L, L1) { var l1 = (L1 || (L1 = new Set())).size; this._r(L1); if ((l1 -= L1.size) < 0) { var l = (L || (L = new Set())).size;[...L1].slice(l1).forEach(SSaE, L); if ((l -= L.size) < 0) return [...L].slice(l) } return [] }
 _f() { return this._.map(_f, this.$) }
 toString(S) { return this._f().flat(Infinity).join(S0) }
 c($) { return new this.constructor(this, $) }
}
const pRe = /({{[\S]+?}})/g, SA = StringAr,
 sa = function (e, i, a) { if (e.match(pRe)) a[i] = { k: e.slice(2, -2) } },
 _f = function (e) { return e.k !== undefined && (e = this[e.k]) !== undefined && e._f ? e._f() : Array.isArray(e) ? e.map(_f) : e },
 _r = function (e) { e._r ? e._r(this) : Array.isArray(e) ? e.forEach(_r, this) : undefined },
 SnhE = function (e) { return !this.has(e) },
 SaE = function (e) { this.add(e) },
 SSaE = function (s) { s.forEach(SaE, this) },
 S = "/", S0 = "", URLRe = /(([^\s:]+:)?(\/\/([^\s@]+@)?((\[[^\]]+\])|([^\s:\/]+))?(\:\d+)?)?)((\/?[^\s?#]+)((\?[^\s\#]*)?(#\S*)?)?)?/,
 dir = u => u.substring(0, u.lastIndexOf(S)),
 R = dir(import.meta.url), RA = URLRe.exec(R), fc = ["/", "."],
 _jp = function (e, i) { if (e !== ".") if (e === ".." && this.length > 0 && this[this.length - 1] !== "..") { this.pop() } else this.push(e) },
 jp = function () { const a = [...arguments], l = a.length; if (l < 1) return undefined; for (var i = 1, m, n; i < l; i++) if ((m = a[i - 1]).endsWith(S) && (n = a[i].startsWith(S))) { a[i] = a[i].substring[1] } else if (!m && !n) a[i - 1] += S; const o = []; a.join(S0).split(S).forEach(_jp, o); return o.join(S) },
 rs = function (u, b) { if ((u = URLRe.exec(u)) === null) return undefined; if (b) { if ((b = URLRe.exec(b)) === null) return undefined; if (!b[1]) b[1] = RA[1] } else b = RA; if (u[1]) return jp(arguments[0]); const p = jp(b[10] || S0, u[10] || S0); return b[1] + (p.startsWith(S) ? S0 : S) + p + (u[11] || S0) },
 rl = function (f, t) { const F = URLRe.exec(f = rs(f)), T = URLRe.exec(t = rs(t)); if (F === null || T === null) return undefined; if (T[1] !== F[1]) return t; const Fa = ((f = F[10] || S0).endsWith(S) ? f : f + S).split(S), Ta = (T[10] || S0).split(S); var i = 0, l = Ta.length, k = Fa.length; if (l > k) l = k; for (; i < l; i++) if (Fa[i] !== Ta[i]) break; return "../".repeat(k - i - 1) + Ta.slice(i).join(S) + (T[11] || S0) },
 pn = u => S + rl(R, u),
 dr = u => S + rl(R, dir(rs(u))),
 mu = u => "www" + pn(u),
 Hcss = [`<link rel="stylesheet" href="`, , `">`], Hjs = [`<script type="text/javascript" src="`, , `"></script>`], Hmjs = [`<script type="module" src="`, , `"></script>`],
 M = { StringAr, wwwDir: R, dir, pathname: pn, dirname: dr, resolve: rs, relative: rl, moduleIdFromUrl: mu, HTML: { buildTag: { css: u => { Hcss[1] = u; return Hcss.join(S0) }, js: u => { Hjs[1] = u; return Hjs.join(S0) }, mjs: u => { Hmjs[1] = u; return Hmjs.join(S0) } } } }
export default M

if (typeof window !== "undefined") {
 const W = window, doc = W.document, head = doc.head, iH = head.innerHTML, L = new Set(), L1 = new Set(), niiH = e => !iH.includes(e),
  _a = function (e) { this.append(e) }, _iB = function (e) { this.parentNode.insertBefore(e, this) },
  _c = e => { const n = doc.createElement(e.nodeName), att = e.attributes; var a; for (a of att) n.setAttribute(a.name, a.value); e.childNodes.forEach(_a, n); return n }
 function NfS(s) { const T = doc.createElement("div"); T.innerHTML = s; return T.childNodes }
 function wR() { [...NfS([...arguments].flat(Infinity).filter(niiH).join(S0))].map(_c).forEach(_a, head) }
 W.phloemjs = M
 Object.assign(SA.prototype, {
  toDom: function () { wR(this.HTMLgetRequireList()); return NfS(this.toString()) },
  appendInto: function (p) { this.toDom().forEach(_a, p) },
  insertBefore: function (n) { this.toDom().forEach(_iB, n) },
 })
//  #TODO: active Dom feature
}