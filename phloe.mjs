/**
 * Phloemjs
 * 
 * @author Thanh Nguyen Thuan <thanhntmany@gmail.com>
 */
class StringRef { constructor(o, k) { this.v = o; this.k = k } toString() { const v = this.v; return Array.isArray(v) ? v.flat(Infinity).join(S0) : String(v) } }
class StringAr {
 constructor(o, m) { if (o instanceof this.constructor) { this.r = o.r; this._ = o._.map(ca, this.m = {}) } else { this.r = new Set(); (this._ = String(o).split(pRe)).forEach(sa, this.m = {}) } if (m) this.assign(m) }
 HTMLrequire() { [...arguments].flat(Infinity).filter(SnhE, this.r).forEach(SaE, this.r = new Set(this.r)); return this }
 _r(S) { Object.values(this.m).map(_v).forEach(raF, S.add(this.r)) }
 HTMLgetRequireList(O, S) { const o = (O instanceof Set ? O : O = new Set()).size, s = (S instanceof Set ? S : S = new Set()).size; this._r(S); const n = s - S.size; if (n < 0) { [...S].slice(n).forEach(SSaE, O) } else return []; const m = o - O.size; return m < 0 ? [...O].slice(m) : [] }
 toString() { return this._.join(S0) }
 getRef(k) { return this.m[k] }
 set(k, v) { const o = this.m[k]; if (o !== undefined) o.v = v; return this }
 get(k) { const o = this.m[k]; if (o !== undefined) return o.v }
 assign(o) { const m = this.m; var k, i; for (k in m) if ((i = o[k]) !== undefined) m[k].v = i instanceof SR ? i.v : i; return this }
 $(m) { return new this.constructor(this, m) }
}
const SR = StringRef, pRe = /({{[\S]+?}})/g,
 ca = function (e) { return e instanceof SR ? this[e.k] = new SR(e.v, e.k) : e },
 sa = function (e, i, a) { e.match(pRe) && (a[i] = (this[e = e.slice(2, -2)] || (this[e] = new SR(e, e)))) },
 SnhE = function (e) { return !this.has(e) },
 SaE = function (e) { this.add(e) },
 SSaE = function (s) { s.forEach(SaE, this) },
 _v = e => e.v,
 raF = function (e) { if (Array.isArray(e)) { e.forEach(raF, this) } else { if (e.r) this.add(e.r); if (e._r) e._r(this) } },
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
 M = { wwwDir: R, dir, pathname: pn, dirname: dr, resolve: rs, relative: rl, moduleIdFromUrl: mu, StringAr, StringRef, HTML: { buildTag: { css: u => { Hcss[1] = u; return Hcss.join(S0) }, js: u => { Hjs[1] = u; return Hjs.join(S0) }, mjs: u => { Hmjs[1] = u; return Hmjs.join(S0) } } } }
export default M

if (typeof window !== "undefined") {
 const W = window, doc = W.document, head = doc.head, iH = head.innerHTML, _L = new Set(), _L1 = new Set(), niiH = e => !iH.includes(e),
  _a = function (e) { this.append(e) }, _iB = function (e) { this.parentNode.insertBefore(e, this) },
  _c = e => { const n = doc.createElement(e.nodeName), att = e.attributes; var a; for (a of att) n.setAttribute(a.name, a.value); e.childNodes.forEach(_a, n); return n },
  _p = StringAr.prototype
 function NfS(s) { const T = doc.createElement("div"); T.innerHTML = s; return T.childNodes }
 function wR() { [...NfS([...arguments].flat(Infinity).filter(niiH).join(S0))].map(_c).forEach(_a, head) }
 W.phloemjs = M
 _p.toDom = function () { wR(this.HTMLgetRequireList(_L, _L1)); return NfS(this.toString()) }
 _p.appendInto = function (p) { this.toDom().forEach(_a, p) }
 _p.insertBefore = function (n) { this.toDom().forEach(_iB, n) }
}