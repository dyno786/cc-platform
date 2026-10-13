// African styling for the Afro Hairstyles page: hand-drawn SVG flags (so they show on every phone and computer,
// unlike emoji flags on Windows), a kente-style woven band, a mudcloth-style background pattern and origin tags.
// Only flags with simple, exactly-drawable designs are included, so none are drawn wrong.

const star = (cx, cy, r, fill) => {
  const p = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.382 : r
    p.push((cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2))
  }
  return '<polygon fill="' + fill + '" points="' + p.join(' ') + '"/>'
}
const v3 = (a, b, c) => '<rect width="10" height="20" fill="' + a + '"/><rect x="10" width="10" height="20" fill="' + b + '"/><rect x="20" width="10" height="20" fill="' + c + '"/>'
const h3 = (a, b, c) => '<rect width="30" height="6.67" fill="' + a + '"/><rect y="6.67" width="30" height="6.67" fill="' + b + '"/><rect y="13.33" width="30" height="6.67" fill="' + c + '"/>'

// [code, name, svg body on a 30x20 canvas]
export const FLAGS = [
  ['ng', 'Nigeria', v3('#008751', '#fff', '#008751')],
  ['gh', 'Ghana', h3('#ce1126', '#fcd116', '#006b3f') + star(15, 10, 3.2, '#000')],
  ['sn', 'Senegal', v3('#00853f', '#fdef42', '#e31b23') + star(15, 10, 3, '#00853f')],
  ['jm', 'Jamaica', '<rect width="30" height="20" fill="#000"/><polygon fill="#009b3a" points="0,0 30,0 15,10"/><polygon fill="#009b3a" points="0,20 30,20 15,10"/><path d="M0,0L30,20M30,0L0,20" stroke="#fed100" stroke-width="3"/>'],
  ['ci', "Côte d'Ivoire", v3('#f77f00', '#fff', '#009e60')],
  ['cm', 'Cameroon', v3('#007a5e', '#ce1126', '#fcd116') + star(15, 10, 3, '#fcd116')],
  ['ml', 'Mali', v3('#14b53a', '#fcd116', '#ce1126')],
  ['sl', 'Sierra Leone', h3('#1eb53a', '#fff', '#0072c6')],
  ['gn', 'Guinea', v3('#ce1126', '#fcd116', '#009460')],
  ['tt', 'Trinidad and Tobago', '<rect width="30" height="20" fill="#ce1126"/><path d="M1,-1L29,21" stroke="#fff" stroke-width="7"/><path d="M1,-1L29,21" stroke="#000" stroke-width="5"/>'],
  ['gm', 'The Gambia', '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.3" fill="#ce1126"/><rect y="7.4" width="30" height="5.2" fill="#0c1c8c"/><rect y="13.7" width="30" height="6.3" fill="#3a7728"/>'],
  ['bj', 'Benin', '<rect width="30" height="10" fill="#fcd116"/><rect y="10" width="30" height="10" fill="#e8112d"/><rect width="12" height="20" fill="#008751"/>'],
  ['bw', 'Botswana', '<rect width="30" height="20" fill="#75aadb"/><rect y="7.5" width="30" height="5" fill="#fff"/><rect y="8.33" width="30" height="3.33" fill="#000"/>'],
  ['ga', 'Gabon', h3('#009e60', '#fcd116', '#3a75c4')],
  ['so', 'Somalia', '<rect width="30" height="20" fill="#4189dd"/>' + star(15, 10, 4.5, '#fff')],
]
const flagSvg = (f, h) => '<svg viewBox="0 0 30 20" width="' + Math.round(h * 1.5) + '" height="' + h + '" role="img" aria-label="' + f[1] + ' flag"><title>' + f[1] + '</title>' + f[2] + '</svg>'
const flagByCode = Object.fromEntries(FLAGS.map(f => [f[0], f]))
export const flag = (code, h) => flagByCode[code] ? flagSvg(flagByCode[code], h) : ''

// Where a style comes from. Only styles whose roots are well documented are tagged.
export const ORIGIN = {
  'ghana-braids': [['gh'], 'From Ghana'],
  'senegalese-twists': [['sn'], 'From Senegal'],
  'fulani-braids': [['ml', 'gn', 'sn', 'ng'], 'Fulani people, West Africa'],
  'box-braids': [[], 'African roots'],
}
export const originTag = id => {
  const o = ORIGIN[id]
  if (!o) return ''
  return '<span class="af-o">' + o[0].map(c => flag(c, 13)).join('') + (o[0].length ? '' : '<i aria-hidden="true">✦</i>') + o[1] + '</span>'
}

const enc = svg => 'url("data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29') + '")'

// Kente-style woven strip: gold ground, green and black warp stripes, red and black woven blocks.
const KENTE = enc('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="24" viewBox="0 0 96 24">'
  + '<rect width="96" height="24" fill="#f2b134"/>'
  + '<rect x="0" width="6" height="24" fill="#0b7a3b"/><rect x="8" width="3" height="24" fill="#1d1b2f"/><rect x="13" width="6" height="24" fill="#0b7a3b"/>'
  + '<rect x="24" y="0" width="22" height="24" fill="#c8102e"/>'
  + '<g fill="#f2b134"><rect x="24" y="4" width="22" height="2"/><rect x="24" y="11" width="22" height="2"/><rect x="24" y="18" width="22" height="2"/></g>'
  + '<g fill="#1d1b2f"><rect x="28" y="7" width="4" height="4"/><rect x="38" y="7" width="4" height="4"/><rect x="33" y="14" width="4" height="4"/></g>'
  + '<rect x="51" width="6" height="24" fill="#0b7a3b"/><rect x="59" width="3" height="24" fill="#1d1b2f"/><rect x="64" width="6" height="24" fill="#0b7a3b"/>'
  + '<rect x="74" width="22" height="24" fill="#1d1b2f"/>'
  + '<g fill="#f2b134"><polygon points="74,0 85,12 74,24"/><polygon points="96,0 85,12 96,24"/></g>'
  + '<polygon points="85,5 91,12 85,19 79,12" fill="#c8102e"/>'
  + '</svg>')

// Mudcloth-style pattern in cream lines on the dark background: rows of crosses, dots and zigzags.
const MUD = enc('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="#f6efe4" stroke-width="2" stroke-linecap="round" opacity=".09">'
  + '<path d="M0 10H120M0 50H120M0 70H120M0 110H120"/>'
  + '<path d="M10 22l8 8m0-8l-8 8M50 22l8 8m0-8l-8 8M90 22l8 8m0-8l-8 8"/>'
  + '<path d="M0 90l10-10 10 10 10-10 10 10 10-10 10 10 10-10 10 10 10-10 10 10 10-10 10 10"/>'
  + '<g fill="#f6efe4" stroke="none"><circle cx="34" cy="26" r="2.4"/><circle cx="74" cy="26" r="2.4"/><circle cx="114" cy="26" r="2.4"/><circle cx="20" cy="60" r="2"/><circle cx="40" cy="60" r="2"/><circle cx="60" cy="60" r="2"/><circle cx="80" cy="60" r="2"/><circle cx="100" cy="60" r="2"/></g>'
  + '</svg>')

// A small diamond ornament row used as a divider.
const ORN = enc('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="14" viewBox="0 0 120 14"><g fill="#f2b134"><polygon points="60,0 67,7 60,14 53,7"/></g><g fill="#e4572e"><polygon points="40,3 44,7 40,11 36,7"/><polygon points="80,3 84,7 80,11 76,7"/></g><g fill="#0c6f6f"><polygon points="22,4 25,7 22,10 19,7"/><polygon points="98,4 101,7 98,10 95,7"/></g><path d="M0 7H14M106 7H120" stroke="#f2b134" stroke-width="2"/></svg>')

export function flagStrip() {
  const set = FLAGS.map(f => '<li>' + flagSvg(f, 22) + '</li>').join('')
  return '<div class="af-fl" aria-label="Flags of African and Caribbean countries"><ul>' + set + '</ul><ul aria-hidden="true">' + set + '</ul></div>'
}

// Overrides on top of the page's own CSS. Centres the content and adds the patterns.
export const AFRICA_CSS = `
.hs{background-color:#1d1b2f;background-image:${MUD};background-size:120px 120px}
.hs-band{height:24px;background:${KENTE} repeat-x;background-size:96px 24px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.25)}
.af-fl{overflow:hidden;padding:12px 0 2px;display:flex;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.af-fl ul{display:flex;gap:12px;list-style:none;margin:0;padding:0 12px 0 0;flex:0 0 auto;animation:afScroll 48s linear infinite}
.af-fl li{margin:0;line-height:0}.af-fl svg{display:block;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.4)}
@keyframes afScroll{to{transform:translateX(-100%)}}
@media(prefers-reduced-motion:reduce){.af-fl ul{animation:none}.af-fl{justify-content:center;flex-wrap:wrap}.af-fl ul[aria-hidden]{display:none}}
.hs-hero.hs-mini{padding:10px 16px 4px}.hs-hero.hs-mini p{font-size:16px}
.af-orn{height:14px;background:${ORN} center no-repeat;margin:12px auto 14px}
.hs-hint{font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:12.5px!important}
.hs-gh{justify-content:center!important}
@media(max-width:989px){.hs-rail a:first-child{margin-left:auto}.hs-rail a:last-child{margin-right:auto}}
.hs-p,.hs-s{text-align:center;border-top:0;position:relative;padding-top:30px;overflow:hidden}
.hs-p::before,.hs-s::before{content:"";position:absolute;left:0;right:0;top:0;height:12px;background:${KENTE} repeat-x;background-size:48px 12px}
.hs-p p,.hs-s p{margin-left:auto;margin-right:auto;max-width:620px}
.hs-img{margin:0 auto}
.hs-f,.hs-len,.hs-city{justify-content:center}
.hs-need{border-left:0;border-top:6px solid var(--gd);max-width:460px;margin-left:auto;margin-right:auto}
.hs-pr{justify-content:flex-start}.hs-pr a:first-child{margin-left:auto}.hs-pr a:last-child{margin-right:auto}.hs-pr a{text-align:left}
.hs h3{display:flex;align-items:center;justify-content:center;gap:10px}.hs h3::before,.hs h3::after{content:"";width:18px;height:10px;flex:0 0 18px;background:${ORN} center/120px 10px no-repeat}
.hs-p ul{list-style:none;padding:0;max-width:560px;margin-left:auto;margin-right:auto}.hs-p li{background:var(--sd);border-radius:14px;padding:10px 14px;margin:0 0 8px}
.hs-care{max-width:640px;margin:0 auto}.hs-care a{text-align:left}
.hs details{text-align:center}.hs summary{list-style-position:inside}
.af-o{display:inline-flex;align-items:center;gap:5px;background:#1d1b2f;color:#fff;font-size:12.5px;font-weight:700;border-radius:999px;padding:4px 11px 4px 8px;margin:0 0 10px;line-height:1.2}.af-o svg{border-radius:2px;flex:0 0 auto}.af-o i{font-style:normal;color:var(--gd)}
.hs-gal a .af-o{position:absolute;top:12px;left:12px;right:auto;bottom:auto;margin:0;padding:4px 11px 4px 8px;font-size:12.5px;background:rgba(29,27,47,.82);z-index:1}
.hs-gal a{outline:3px solid rgba(242,177,52,.0)}.hs-gal a::after{content:"";position:absolute;inset:0;border-radius:20px;box-shadow:inset 0 0 0 3px rgba(242,177,52,.55);pointer-events:none}
`
