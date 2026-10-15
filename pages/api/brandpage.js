// Brand page builder: builds and refreshes the brand pages (shop by ingredient, collections, guides, FAQs) from live Shopify data. Kept for the weekly brand pages audit and the dashboard "Refresh page" button.
//   job=vendors&q=regex      list vendor names that match
//   job=build&b=slug[&go=1]  build one brand page (preview without go=1)
import { gql, policyFlag } from '../../lib/intake'
import BRANDS from '../../lib/brands.json'
import SEASONS from '../../lib/seasons.json'
import STATIC from '../../lib/staticpages'

export const config = { maxDuration: 60 }
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const money = n => '£' + Number(n).toFixed(2)
const LIGHT = /lighten|whiten|bleaching cream|fade cream|dark spot|toning (soap|cream|lotion|serum|oil|gel)|hydroquinone|clarifying (cream|lotion|serum)|carotone|caro light|fair\s*(&|and)\s*(white|lovely)|fair lady|makari|skin tone/i

const ING = [
  ['shea', 'Shea Butter', /shea/i], ['coconut', 'Coconut', /coconut/i], ['argan', 'Argan Oil', /argan|morocc/i],
  ['castor', 'Castor Oil', /castor|jbco/i], ['olive', 'Olive Oil', /olive/i], ['avocado', 'Avocado', /avocado/i],
  ['rosemary', 'Rosemary & Mint', /rosemary|peppermint|\bmint\b/i], ['teatree', 'Tea Tree', /tea tree/i],
  ['aloe', 'Aloe Vera', /aloe/i], ['honey', 'Honey & Manuka', /honey|manuka/i], ['batana', 'Batana Oil', /batana/i],
  ['biotin', 'Biotin', /biotin/i], ['keratin', 'Keratin & Protein', /keratin|protein|collagen/i], ['vitamin', 'Vitamin E', /vitamin e\b|vit e\b/i],
  ['cocoa', 'Cocoa Butter', /cocoa/i], ['mango', 'Mango', /mango/i], ['hibiscus', 'Hibiscus', /hibiscus/i], ['jojoba', 'Jojoba', /jojoba/i],
  ['babassu', 'Babassu', /babassu/i], ['grapeseed', 'Grapeseed', /grape ?seed/i], ['flaxseed', 'Flaxseed', /flax/i], ['charcoal', 'Charcoal', /charcoal/i],
  ['chebe', 'Chebe', /chebe/i], ['black-seed', 'Black Seed', /black seed|nigella/i], ['lavender', 'Lavender', /lavender/i], ['curcuma', 'Turmeric', /turmeric/i],
  ['hemp', 'Hemp Seed', /hemp/i], ['acv', 'Apple Cider Vinegar', /cider vinegar/i], ['sulfur', 'Sulfur', /sulfur|sulphur/i], ['ricewater', 'Rice Water', /rice water/i],
  ['hyaluronic', 'Hyaluronic Acid', /hyaluronic/i], ['niacinamide', 'Niacinamide', /niacinamide/i], ['snail', 'Snail Mucin', /snail/i], ['retinol', 'Retinol', /retinol/i],
]
function typeName(t) {
  t = String(t || '').trim()
  if (!t || /^(general|cc|hair|other|health and beauty)$/i.test(t)) return 'More'
  return t.replace(/\b\w/g, c => c.toUpperCase())
}

async function vendors(q) {
  const kws = String(q).split('|').map(x => x.trim()).filter(Boolean)
  const out = {}
  let i = 0
  const work = async () => { while (i < kws.length) { const k = kws[i++]; try {
    const w = k.split(/\s+/).sort((a, b) => b.length - a.length)[0].replace(/[^a-z0-9]/gi, '')
    const d = await gql('query($q:String!){ products(first:250, query:$q){ nodes{ vendor status } } }', { q: 'vendor:*' + w + '*' })
    const re = new RegExp(k, 'i')
    d.products.nodes.forEach(n => { if (re.test(n.vendor)) { const o = out[n.vendor] = out[n.vendor] || { kw: k, active: 0, all: 0 }; o.all++; if (n.status === 'ACTIVE') o.active++ } })
  } catch (e) { out['ERR ' + k] = String(e.message) } } }
  await Promise.all(Array.from({ length: 8 }, work))
  return out
}

let LOGOS = null
async function logoFiles() {
  if (LOGOS) return LOGOS
  LOGOS = []; let c = null
  try {
  for (let i = 0; i < 5; i++) {
    const d = await gql('query($c:String){ files(first:250, after:$c, query:"filename:*logo*"){ pageInfo{hasNextPage endCursor} nodes{ ... on MediaImage{ image{url} } } } }', { c })
    d.files.nodes.forEach(n => { if (n.image && !/cchairandbeauty|cc_logo|cc-logo|cc_hnb|newsletter|nologo|template/i.test(n.image.url)) LOGOS.push(n.image.url) })
    if (!d.files.pageInfo.hasNextPage) break; c = d.files.pageInfo.endCursor
  }
  } catch (e) { }
  return LOGOS
}

async function products(q) {
  const out = []; let c = null
  for (let i = 0; i < 6; i++) {
    const d = await gql('query($q:String!,$c:String){ products(first:250, after:$c, query:$q){ pageInfo{hasNextPage endCursor} nodes{ handle title vendor productType totalInventory featuredImage{url} priceRangeV2{minVariantPrice{amount}} } } }', { q, c })
    out.push(...d.products.nodes)
    if (!d.products.pageInfo.hasNextPage) break; c = d.products.pageInfo.endCursor
  }
  return out
}

function css() {
  return `<style>.main-page-title{text-align:center}.ct{--ink:#1F1611;--br:#3B2416;--gd:#D9A441;--gr:#2F6B3A;--cr:#FBF4E8;--mut:#6B5A4C;--ln:#EADCC6;color:var(--ink);font-size:17px;line-height:1.6}.ct *{box-sizing:border-box}.ct p{margin:0 0 12px}.ct a{color:inherit}.ct h2{font-size:28px;line-height:1.15;font-weight:800;margin:0 0 10px;text-align:center}.ct h3{font-size:24px;line-height:1.15;font-weight:800;margin:0}.ct-hero{background:var(--br);color:#fff;border-radius:24px;padding:40px 20px 30px;text-align:center;background-image:radial-gradient(rgba(217,164,65,.18) 2px,transparent 2.5px);background-size:22px 22px}.ct-logo{display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:18px;padding:10px;width:150px;height:150px;margin:0 0 16px}.ct .ct-logo img{max-width:100%!important;max-height:100%!important;width:auto!important;height:auto!important;object-fit:contain;margin:0!important;border:0!important}.ct-word{width:auto;height:auto;min-height:90px;padding:16px 26px;font-weight:900;font-size:26px;line-height:1.1;color:var(--br);letter-spacing:.02em}.ct-kick{display:inline-block;background:var(--gd);color:var(--br);font-weight:800;font-size:12px;letter-spacing:.16em;text-transform:uppercase;border-radius:999px;padding:7px 16px;margin:0 0 14px}.ct .ct-big{color:#fff;font-size:38px;line-height:1.05;font-weight:900;margin:0 0 14px}.ct-big span{color:var(--gd)}.ct-hero p{color:#F3E6D2;max-width:680px;margin:0 auto 20px}.ct-cta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.ct-btn{display:inline-block;background:var(--gd);color:var(--br)!important;font-weight:800;text-decoration:none;border-radius:999px;padding:12px 24px}.ct-ghost{background:transparent;color:#fff!important;border:2px solid rgba(255,255,255,.6)}.ct-stats{list-style:none;padding:0;margin:26px 0 0;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ct-stats li{background:rgba(255,255,255,.08);border-radius:14px;padding:12px;font-size:14px;color:#F3E6D2}.ct-stats b{display:block;color:#fff;font-size:20px}.ct-chips{display:flex;gap:8px;overflow-x:auto;padding:18px 2px 8px;margin:0 0 6px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}.ct-chips a{flex:0 0 auto;background:var(--cr);border:1px solid var(--ln);border-radius:999px;padding:9px 16px;font-weight:700;font-size:15px;text-decoration:none;white-space:nowrap}.ct-chips a:hover{background:var(--gd);border-color:var(--gd)}.ct-ing{padding:26px 0 8px;border-bottom:1px solid var(--ln);scroll-margin-top:90px}.ct-ih{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin:0 0 8px}.ct-tag{display:block;color:var(--gr);font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase}.ct-ing>p{color:var(--mut);max-width:760px}.ct-more{font-weight:800;color:var(--gr)!important;text-decoration:none;white-space:nowrap}.ct-row{display:flex;gap:12px;overflow-x:auto;padding:4px 2px 14px;scroll-snap-type:x proximity;scrollbar-width:thin;-webkit-overflow-scrolling:touch}.ct-p{flex:0 0 150px;scroll-snap-align:start;display:flex;flex-direction:column;background:#fff;border:1px solid var(--ln);border-radius:14px;overflow:hidden;text-decoration:none}.ct-p:hover{border-color:var(--br)}.ct-pi{display:block;position:relative;aspect-ratio:1/1;background:#fff}.ct .ct-pi img{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:contain;padding:8px;margin:0!important;border:0!important}.ct-pn{display:block;font-size:14px;font-weight:700;line-height:1.3;padding:6px 10px 2px;flex:1}.ct-pp{display:block;font-weight:800;color:var(--gr);padding:0 10px 10px}.ct-sec{padding:44px 0 0}.ct-lead{text-align:center;color:var(--mut);max-width:680px;margin:0 auto 18px!important}.ct-cg{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.ct-c{display:flex;flex-direction:column;background:var(--cr);border-radius:16px;overflow:hidden;text-decoration:none;font-weight:800;text-align:center}.ct-c>span:last-child{padding:10px 8px 12px;font-size:15px;line-height:1.25}.ct-ci{display:block;position:relative;aspect-ratio:1/1;background:#fff}.ct .ct-ci img{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:contain;margin:0!important;border:0!important}.ct-noimg{display:flex!important;align-items:center;justify-content:center;font-size:30px;color:var(--br);background:var(--cr)!important}.ct-about{max-width:820px;margin:0 auto}.ct-bg{display:grid;gap:14px}.ct-b{display:flex;flex-direction:column;background:#fff;border:1px solid var(--ln);border-radius:16px;overflow:hidden;text-decoration:none}.ct-bi{display:block;position:relative;aspect-ratio:16/10;background:var(--cr)}.ct .ct-bi img{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:cover;margin:0!important;border:0!important}.ct-bt{font-weight:800;font-size:17px;line-height:1.3;padding:12px 14px 4px}.ct-bl{color:var(--gr);font-weight:700;padding:0 14px 14px;font-size:15px}.ct-faq{max-width:820px;margin:0 auto}.ct-faq details{border-bottom:1px solid var(--ln);padding:14px 4px}.ct-faq summary{font-weight:700;cursor:pointer}.ct-faq details p{margin:10px 0 0;color:var(--mut)}@media(min-width:750px){.ct-hero{padding:60px 40px 40px}.ct .ct-big{font-size:56px}.ct-stats{grid-template-columns:repeat(4,1fr)}.ct-p{flex-basis:180px}.ct-cg{grid-template-columns:repeat(3,1fr)}.ct-bg{grid-template-columns:repeat(3,1fr)}}@media(min-width:990px){.ct{width:min(1240px,calc(100vw - 100px));position:relative;left:50%;transform:translateX(-50%)}.ct-cg{grid-template-columns:repeat(6,1fr)}}</style>`
}

async function build(slug, B) {
  const name = B.name, kw = B.kw || [name]
  // products
  const vre = new RegExp(B.vre, 'i')
  let prods = (await products('(' + B.q + ') AND status:active')).filter(p => vre.test(p.vendor))
  const seen = new Set(); const ex = B.exclude ? new RegExp(B.exclude, 'i') : null; const inc = B.mustMatch ? new RegExp(B.mustMatch, 'i') : null
  prods = prods.filter(p => { if (seen.has(p.handle)) return false; seen.add(p.handle); if (policyFlag(p.title) || LIGHT.test(p.title)) return false; if (ex && ex.test(p.title)) return false; if (inc && !inc.test(p.title + ' ' + p.vendor)) return false; return true })
  const total = prods.length
  const show = prods.filter(p => p.totalInventory >= 2 && p.featuredImage)
  // collections
  const cq = kw.map(k => 'title:*' + k.split(/\s+/)[0] + '*').join(' OR ')
  const cd = await gql('query($q:String!){ collections(first:120, query:$q){ nodes{ handle title productsCount{count} image{url} } } }', { q: cq })
  const kre = new RegExp(kw.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*')).join('|'), 'i')
  let cols = cd.collections.nodes.filter(c => kre.test(c.title) && !/delete|-old|\bold\b|copy|\(dup/i.test(c.title + ' ' + c.handle) && c.productsCount.count >= 2 && !LIGHT.test(c.title))
  if (B.skipCols) { const sk = new RegExp(B.skipCols, 'i'); cols = cols.filter(c => !sk.test(c.title)) }
  cols.sort((a, b) => b.productsCount.count - a.productsCount.count)
  if (B.cols) { // hand-picked collections, in this order
    const picked = []
    for (const h of B.cols) { const d = await gql('query($h:String!){ collectionByHandle(handle:$h){ handle title productsCount{count} image{url} } }', { h }); const c = d.collectionByHandle; if (c && c.productsCount.count >= 1) { if ((B.noImg || []).includes(h)) c.image = null; picked.push(c) } }
    cols = picked
  }
  if (B.main && !cols.find(c => c.handle === B.main)) { const d = await gql('query($h:String!){ collectionByHandle(handle:$h){ handle title productsCount{count} image{url} } }', { h: B.main }); if (d.collectionByHandle) B._main = d.collectionByHandle }
  const colName = t => B.colStrip ? (String(t).replace(new RegExp(B.colStrip, 'i'), '').trim() || t) : t
  const nm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')
  const exact = cols.filter(c => kw.concat([name]).some(k => nm(c.title) === nm(k)))
  const main = (B.main && (cols.find(c => c.handle === B.main) || B._main)) || cols.find(c => c.handle === slug) || exact[0] || cols[0] || null
  const logoCol = cols.find(c => c.image && /logo/i.test(c.image.url) && kw.concat([name]).some(k => nm(c.image.url).includes(nm(k).slice(0, 6))))
  const words = kw.concat([name, slug]).map(nm).filter(x => x.length >= 3)
  const lf = (await logoFiles().catch(() => [])).find(u => { const f = nm(u.split('/').pop().split('?')[0].replace(/logo.*$/i, '')); return f.length >= 3 && words.some(w => w.startsWith(f) || f.startsWith(w)) })
  let logo = B.logo || lf || (logoCol && logoCol.image.url) || null
  // best sellers
  let best = []
  if (main) {
    const bd = await gql('query($h:String!){ collectionByHandle(handle:$h){ products(first:40, sortKey:BEST_SELLING){ nodes{ handle status totalInventory } } } }', { h: main.handle })
    const ok = new Set(show.map(p => p.handle))
    best = (bd.collectionByHandle ? bd.collectionByHandle.products.nodes : []).filter(n => n.status === 'ACTIVE' && ok.has(n.handle)).map(n => show.find(p => p.handle === n.handle)).slice(0, 12)
  }
  if (best.length < 4) best = show.slice().sort((a, b) => b.totalInventory - a.totalInventory).slice(0, 12)
  // groups
  const bre = new RegExp(kw.concat([name]).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi')
  const stripBrand = t => String(t).replace(bre, ' ')
  let groups = []
  if (!B.byType) {
    for (const [k, label, re] of ING) {
      const items = show.filter(p => re.test(stripBrand(p.title)))
      if (items.length >= 2) groups.push({ k, label, items })
    }
  }
  let mode = 'ingredient'
  const covered = new Set(); groups.forEach(g => g.items.forEach(p => covered.add(p.handle)))
  if (B.byType || groups.length < 3 || covered.size < show.length * 0.4) {
    mode = 'type'; groups = []
    const by = {}
    show.forEach(p => { const t = typeName(p.productType); (by[t] = by[t] || []).push(p) })
    Object.entries(by).filter(([t, a]) => a.length >= 2 && t !== 'More').sort((a, b) => b[1].length - a[1].length).slice(0, 10).forEach(([t, a]) => groups.push({ k: t.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: t, items: a }))
  }
  groups.sort((a, b) => b.items.length - a.items.length)
  groups = groups.slice(0, 12)
  // articles
  let arts = []
  try {
    const ad = await gql('query($q:String!){ articles(first:40, query:$q){ nodes{ title handle publishedAt isPublished image{url} blog{handle} } } }', { q: kw.map(k => '"' + k + '"').join(' OR ') })
    arts = ad.articles.nodes.filter(a => a.isPublished && a.publishedAt && kre.test(a.title)).slice(0, 6)
    if (arts.length < 3) arts = arts.concat(ad.articles.nodes.filter(a => a.isPublished && a.publishedAt && !arts.includes(a))).slice(0, 6)
  } catch (e) { }
  // html
  const short = t => { let s = String(t); for (const k of kw.concat([name])) { const e = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]?").replace(/\\s+/g, '\\s*'); s = s.replace(new RegExp('^\\s*' + e + "(['’]s)?", 'i'), '') } s = s.replace(/^[\s,:;\-–|\[\]()]+/, '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : t }
  const card = p => `<a class="ct-p" href="/products/${p.handle}"><span class="ct-pi"><img src="${esc(p.featuredImage.url.split('?')[0])}?width=360" alt="${esc(p.title)}" loading="lazy" width="360" height="360"></span><span class="ct-pn">${esc(short(p.title))}</span><span class="ct-pp">${money(p.priceRangeV2.minVariantPrice.amount)}</span></a>`
  const minP = Math.min(...prods.map(p => +p.priceRangeV2.minVariantPrice.amount).filter(x => x > 0))
  const word = mode === 'ingredient' ? 'ingredient' : 'type'
  const chips = [{ k: 'best', label: 'Best sellers' }].concat(groups).map(g => `<a href="#ct-${g.k}">${esc(g.label)}</a>`).join('')
  const sec = (k, tag, title, desc, items, more) => `<section class="ct-ing" id="ct-${k}"><div class="ct-ih"><div><span class="ct-tag">${esc(tag)}</span><h3>${esc(title)}</h3></div>${more || ''}</div>${desc ? '<p>' + desc + '</p>' : ''}<div class="ct-row">${items.map(card).join('')}</div></section>`
  let rows = sec('best', 'Most popular', name + ' best sellers', 'The ' + esc(name) + ' products our customers buy most, in stock now.', best, main ? `<a class="ct-more" href="/collections/${main.handle}">Shop all ${esc(name)} &rarr;</a>` : '')
  for (const g of groups) {
    const col = cols.find(c => new RegExp(g.label.split(/[ &]/)[0], 'i').test(c.title) && c !== main)
    rows += sec(g.k, mode === 'ingredient' ? 'Shop by ingredient' : 'Shop by type', name + ' ' + g.label, mode === 'ingredient' ? esc(name) + ' products made with ' + esc(g.label.toLowerCase()) + ', in stock now.' : '', g.items.slice(0, 14), col ? `<a class="ct-more" href="/collections/${col.handle}">Shop ${esc(colName(col.title))} &rarr;</a>` : '')
  }
  const colh = cols.slice(0, 24).map(c => `<a class="ct-c" href="/collections/${c.handle}">${c.image ? `<span class="ct-ci"><img src="${esc(c.image.url.split('?')[0])}?width=400" alt="${esc(c.title)} collection" loading="lazy" width="400" height="400"></span>` : `<span class="ct-ci ct-noimg">${esc(name.charAt(0))}</span>`}<span>${esc(colName(c.title))}</span></a>`).join('')
  const types = {}; prods.forEach(p => { const t = typeName(p.productType); if (t !== 'More') types[t] = (types[t] || 0) + 1 })
  const topTypes = Object.entries(types).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0].toLowerCase())
  const list = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : (a[0] || '')
  const about = (B.about ? B.about.map(p => '<p>' + p + '</p>').join('') : '') +
    `<p>We stock ${total} ${esc(name)} products at CC Hair &amp; Beauty${topTypes.length ? ', including ' + esc(list(topTypes)) : ''}. ${cols.length > 1 ? 'They are organised into ' + cols.length + ' collections, so you can shop by range.' : ''}</p><p>CC Hair &amp; Beauty has sold afro hair and beauty in Leeds since 1979. Order online with free UK delivery over £75, or visit our stores on Chapeltown Road, Roundhay Road and in the City Centre. To check stock, call 0113 249 5562.</p>`
  const bestNames = best.slice(0, 3).map(p => p.title)
  const FAQ = [
    ['What are the best-selling ' + name + ' products?', bestNames.length ? 'Our current ' + name + ' best sellers are ' + list(bestNames) + '.' : null],
    ['How many ' + name + ' products do you stock?', 'We stock ' + total + ' ' + name + ' products online' + (topTypes.length ? ', including ' + list(topTypes) : '') + '.'],
    ['Where can I buy ' + name + ' in Leeds?', 'Order online at cchairandbeauty.com or ask in any of our three Leeds stores: Chapeltown Road, Roundhay Road and the City Centre. Call 0113 249 5562 to check stock.'],
    ['Do you deliver ' + name + ' across the UK?', 'Yes. We deliver ' + name + ' across the UK, and standard delivery is free on orders over £75.'],
  ].concat(B.faq || []).filter(x => x[1])
  const faqh = FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  const blogs = arts.map(a => `<a class="ct-b" href="/blogs/${a.blog.handle}/${a.handle}"><span class="ct-bi">${a.image ? `<img src="${esc(a.image.url.split('?')[0])}?width=480" alt="" loading="lazy" width="480" height="300">` : ''}</span><span class="ct-bt">${esc(a.title)}</span><span class="ct-bl">Read the guide &rarr;</span></a>`).join('')
  const hero = `<div class="ct-hero">${logo ? `<span class="ct-logo"><img src="${esc(logo.split('?')[0])}?width=300" alt="${esc(name)} logo" width="150" height="150"></span><br>` : `<span class="ct-logo ct-word">${esc(name)}</span><br>`}<span class="ct-kick">${esc(name)} at CC Hair &amp; Beauty</span><h2 class="ct-big">${esc(name)}, <span>shop by ${word}</span></h2><p>${esc(B.intro || ('Shop ' + total + ' ' + name + ' products online or in our Leeds stores' + (topTypes.length ? ': ' + list(topTypes.slice(0, 3)) + ' and more' : '') + '.'))}</p><div class="ct-cta">${main ? `<a class="ct-btn" href="/collections/${main.handle}">Shop all ${esc(name)}</a>` : ''}<a class="ct-btn ct-ghost" href="#ct-shop">Shop by ${word}</a></div><ul class="ct-stats"><li><b>${total}</b>${esc(name)} products</li><li><b>${groups.length}</b>${mode === 'ingredient' ? 'ingredient ranges' : 'product types'}</li><li><b>${isFinite(minP) ? 'From ' + money(minP) : cols.length}</b>${isFinite(minP) ? 'prices' : 'collections'}</li><li><b>Free UK delivery</b>over £75</li></ul></div>`
  const body = css() + `<div class="ct">${hero}<nav class="ct-chips" id="ct-shop" aria-label="Shop ${esc(name)} by ${word}">${chips}</nav>${rows}` +
    (colh ? `<section class="ct-sec"><h2>Every ${esc(name)} collection</h2><p class="ct-lead">Browse each ${esc(name)} range in full.</p><div class="ct-cg">${colh}</div></section>` : '') +
    `<section class="ct-sec ct-about"><h2>About ${esc(name)}</h2>${about}</section>` +
    (blogs ? `<section class="ct-sec"><h2>Hair care guides and reviews</h2><div class="ct-bg">${blogs}</div></section>` : '') +
    `<section class="ct-sec ct-faq"><h2>${esc(name)} FAQs</h2>${faqh}</section></div><script type="application/ld+json">${JSON.stringify(ld)}</script>`
  const seoT = (name + ' UK | Shop by ' + (mode === 'ingredient' ? 'Ingredient' : 'Type')).slice(0, 60)
  const seoD = ('Shop ' + total + ' ' + name + ' products' + (topTypes.length ? ': ' + list(topTypes.slice(0, 3)) : '') + '. Leeds stores and free UK delivery over £75.').slice(0, 160)
  return { body, seoT, seoD, total, shown: show.length, mode, groups: groups.map(g => g.label + ' (' + g.items.length + ')'), cols: cols.length, colList: cols.slice(0, 24).map(c => [c.handle, colName(c.title), c.image ? 1 : 0, c.productsCount.count]), main: main && main.handle, logo: logo ? logo.split('/').pop().split('?')[0] : null, blogs: arts.length, best: best.length, bestHandles: best.map(p => p.handle), mainCol: main && main.handle }
}

const BLOG_CSS = "<style>.main-page-title{text-align:center}.bl{--b:#1D3E9E;--r:#C2312B;--ink:#121A33;--mut:#4A5578;--soft:#EEF2FB;--ln:#E3E8F4;color:var(--ink);font-size:17px;line-height:1.55}.bl *{box-sizing:border-box}.bl p{margin:0}.bl-hero{background:var(--b);color:#fff;border-radius:24px;padding:36px 20px;text-align:center;background-image:radial-gradient(rgba(255,255,255,.09) 2px,transparent 2.5px);background-size:20px 20px}.bl .bl-big{color:#fff;font-size:36px;line-height:1.05;font-weight:900;margin:0 0 12px}.bl-hero p{color:#E6ECFB;max-width:640px;margin:0 auto 18px}.bl-find{width:100%;max-width:520px;border:0;border-radius:999px;padding:13px 20px;font-size:16px;color:var(--ink)}.bl-chips{display:flex;gap:8px;overflow-x:auto;padding:18px 2px 6px;scrollbar-width:thin}.bl-chips a{flex:0 0 auto;background:var(--soft);border-radius:999px;padding:9px 15px;font-weight:700;font-size:15px;text-decoration:none;color:var(--ink);white-space:nowrap}.bl-chips a b{color:var(--r);margin-left:4px}.bl-chips a:hover{background:var(--b);color:#fff}.bl-s{padding:34px 0 8px;scroll-margin-top:90px}.bl-h{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap;margin:0 0 14px}.bl h2{font-size:26px;line-height:1.15;font-weight:800;margin:0 0 4px}.bl-h p{color:var(--mut);font-size:15px;max-width:640px}.bl-all{font-weight:800;color:var(--b)!important;text-decoration:none;white-space:nowrap}.bl-g{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.bl-c{display:flex;flex-direction:column;background:#fff;border:1px solid var(--ln);border-radius:14px;overflow:hidden;text-decoration:none;color:var(--ink)}.bl-c:hover{border-color:var(--b)}.bl-i{display:block;position:relative;aspect-ratio:16/10;background:var(--soft)}.bl .bl-i img{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:cover;margin:0!important}.bl-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;color:var(--b)}.bl-d{display:block;font-size:12.5px;color:var(--mut);padding:10px 12px 0;font-weight:600}.bl-t{display:block;font-weight:800;font-size:15px;line-height:1.3;padding:4px 12px 14px}.bl-s.cut .bl-c:nth-child(n+9){display:none}.bl-more{display:block;margin:14px auto 0;background:#fff;border:2px solid var(--b);color:var(--b);border-radius:999px;padding:10px 22px;font-weight:800;font-size:15px;cursor:pointer}.bl-s:not(.cut) .bl-more{display:none}.bl-none{display:none;text-align:center;color:var(--mut);padding:30px 0}.bl.q .bl-s .bl-c{display:none!important}.bl.q .bl-s .bl-c.hit{display:flex!important}.bl.q .bl-more,.bl.q #bl-latest{display:none}.bl.q .bl-s.miss{display:none}@media(min-width:750px){.bl-hero{padding:52px 40px}.bl .bl-big{font-size:52px}.bl-g{grid-template-columns:repeat(4,1fr);gap:16px}}@media(min-width:990px){.bl{width:min(1240px,calc(100vw - 100px));position:relative;left:50%;transform:translateX(-50%)}}</style>"
const BLOG_JS = "<script>(function(){var r=document.getElementById('bl');if(!r)return;r.querySelectorAll('.bl-s').forEach(function(s){if(s.querySelectorAll('.bl-c').length>8)s.classList.add('cut')});r.addEventListener('click',function(e){var b=e.target.closest('.bl-more');if(b)b.closest('.bl-s').classList.remove('cut')});var f=document.getElementById('bl-find'),n=document.getElementById('bl-none');f.addEventListener('input',function(){var q=f.value.trim().toLowerCase();r.classList.toggle('q',!!q);var any=0;r.querySelectorAll('.bl-s').forEach(function(s){if(s.id==='bl-latest')return;var h=0;s.querySelectorAll('.bl-c').forEach(function(c){var m=q&&c.getAttribute('data-t').indexOf(q)>-1;c.classList.toggle('hit',m);if(m)h++});s.classList.toggle('miss',!h);any+=h});n.style.display=q&&!any?'block':'none'})})();</script>"

// Blog index: every published post, grouped by category, at /pages/blogs
const BLOG_CATS = [['hair-care-guides','Hair Care Guides','Step-by-step help for afro, curly and coily hair: routines, edges, protective styles and caring for your hair through the seasons.'],['product-reviews','Product Reviews','A closer look at products we stock, from hair oils and relaxers to braiding hair, with tips on how to use them.'],['skin-care-guides','Skin Care Guides','Skin care for Black and brown skin, season by season.'],['leeds','Leeds Hair Shop Guides','Where to buy wigs, braiding hair, hair dye and afro hair products in Leeds.'],['new-afro-products-reviews','Product Comparisons','Side-by-side comparisons of popular products.'],['children-guide',"Children's Hair",'Gentle hair care for children with afro and curly hair.'],['news','Community News','News from Chapeltown and Leeds, and the community events we support.']]
const unesc = t => String(t || '').replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
async function blogIndex(go) {
  const all = []; let c = null
  for (let i = 0; i < 6; i++) {
    const d = await gql('query($c:String){ articles(first:250, after:$c, sortKey:PUBLISHED_AT, reverse:true){ pageInfo{hasNextPage endCursor} nodes{ title handle isPublished publishedAt image{url} blog{handle title} } } }', { c })
    all.push(...d.articles.nodes); if (!d.articles.pageInfo.hasNextPage) break; c = d.articles.pageInfo.endCursor
  }
  const pub = all.filter(a => a.isPublished && a.publishedAt)
  const by = {}; pub.forEach(a => (by[a.blog.handle] = by[a.blog.handle] || []).push(a))
  const cats = BLOG_CATS.concat(Object.keys(by).filter(h => !BLOG_CATS.some(x => x[0] === h)).map(h => [h, unesc(by[h][0].blog.title), '']))
  const nice = iso => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' })
  const card = a => `<a class="bl-c" href="/blogs/${a.blog.handle}/${a.handle}" data-t="${esc(unesc(a.title).toLowerCase())}"><span class="bl-i">${a.image ? `<img src="${esc(a.image.url.split('?')[0])}?width=480" alt="" loading="lazy" width="480" height="300">` : `<span class="bl-ph">${esc(unesc(a.title).charAt(0))}</span>`}</span><span class="bl-d">${nice(a.publishedAt)}</span><span class="bl-t">${esc(unesc(a.title))}</span></a>`
  const chips = cats.filter(x => by[x[0]]).map(([h, n]) => `<a href="#bl-${h}">${esc(n)} <b>${by[h].length}</b></a>`).join('')
  const secs = cats.filter(x => by[x[0]]).map(([h, n, d]) => `<section class="bl-s" id="bl-${h}"><div class="bl-h"><div><h2>${esc(n)}</h2>${d ? '<p>' + esc(d) + '</p>' : ''}</div><a class="bl-all" href="/blogs/${h}">View all ${by[h].length} &rarr;</a></div><div class="bl-g">${by[h].map(card).join('')}</div>${by[h].length > 8 ? `<button type="button" class="bl-more">Show all ${by[h].length} posts</button>` : ''}</section>`).join('')
  const body = BLOG_CSS + `<div class="bl" id="bl"><div class="bl-hero"><h2 class="bl-big">Hair &amp; beauty guides</h2><p>Every guide, review and news story from CC Hair &amp; Beauty, sorted by topic. ${pub.length} posts from our team in Leeds.</p><input class="bl-find" id="bl-find" type="search" placeholder="Search the guides, e.g. edge control" aria-label="Search the guides"></div><nav class="bl-chips" aria-label="Blog categories">${chips}</nav><p class="bl-none" id="bl-none">No posts match that search. Try a shorter word.</p><section class="bl-s" id="bl-latest"><div class="bl-h"><div><h2>Latest posts</h2></div></div><div class="bl-g">${pub.slice(0, 4).map(card).join('')}</div></section>${secs}</div>` + BLOG_JS
  let action = 'preview'
  if (go) {
    const pd = await gql('query{ pages(first:3, query:"handle:blogs"){ nodes{ id handle } } }')
    const ex = pd.pages.nodes.find(p => p.handle === 'blogs')
    const mf = [{ namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: 'Afro Hair & Beauty Blog: Guides and Reviews' }, { namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: 'Every CC Hair & Beauty guide in one place: afro hair care, edge control, braids, skin care, product reviews, Leeds shop guides and community news.' }]
    if (ex) { const u = await gql('mutation($id:ID!,$p:PageUpdateInput!){ pageUpdate(id:$id, page:$p){ userErrors{message} } }', { id: ex.id, p: { title: 'Hair & Beauty Blog', templateSuffix: '', body, metafields: mf } }); action = 'updated ' + JSON.stringify(u.pageUpdate.userErrors) }
    else { const cr = await gql('mutation($p:PageCreateInput!){ pageCreate(page:$p){ userErrors{message} } }', { p: { title: 'Hair & Beauty Blog', handle: 'blogs', isPublished: true, body, metafields: mf } }); action = 'created ' + JSON.stringify(cr.pageCreate.userErrors) }
  }
  return { action, posts: pub.length, categories: cats.filter(x => by[x[0]]).map(x => x[1] + ' (' + by[x[0]].length + ')') }
}

// "Shop this post" block on blog posts: links readers to the products, brand pages and collections a post talks about
const SHOP_RE = /<!--cc-shop-->[\s\S]*?<!--\/cc-shop-->/g
const STOP = new Set(['review','reviews','cc','hair','beauty','leeds','and','the','for','with','your','guide','new','in','at','now','of','a','to','how','best','uk','tips','by','is','on','why','you','what','which','2024','2025','2026','5','essential','routine','sunday','benefits','complete','buyer','s','vs','or','one','do','need','it','use','using','from','our','this','that','products','product','should','buy','does','not','turn','white','lay','step','look','causes','fixes','day','daily','all','tips','results','real','new','magic','luxurious','transform','fast','busy','professionals','professional','home','premium','treatment','care','natural','spotlight','brand','excellence'])
const TOPICS = [[/edge/i, 'edge-control', 'Edge Control'], [/relax|texturi/i, 'relaxers', 'Relaxers'], [/braid|crochet/i, 'crochet-braided', 'Braiding Hair'], [/wig/i, 'wigs-lace-wigs', 'Wigs'], [/shampoo/i, 'shampoo', 'Shampoo'], [/\bdye\b|hair colou?r|hicolor|colour for me|casting|gloss/i, 'hair-dyes', 'Hair Dyes'], [/kid|child/i, 'kids', 'Kids Hair Care'], [/body|lotion|skin|ashy|spf|soap/i, 'lotions', 'Body Lotions & Creams'], [/curl/i, 'curl-creams', 'Curl Creams'], [/oil|serum/i, 'hair-oil', 'Hair Oils'], [/winter/i, 'winter-hair-care', 'Winter Hair Care']]
const plain = h => String(h || '').replace(SHOP_RE, ' ').replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/gi, ' ')
async function shopBlock(a) {
  const body = a.body || ''
  const text = (a.title + ' ' + plain(body)).toLowerCase()
  // 1. products the post already links to
  const linked = [...new Set([...body.matchAll(/\/products\/([a-z0-9\-]+)/gi)].map(m => m[1].toLowerCase()))].slice(0, 8)
  let prods = []
  if (linked.length) {
    const d = await gql('query($q:String!){ products(first:20, query:$q){ nodes{ handle title vendor status totalInventory featuredImage{url} priceRangeV2{minVariantPrice{amount}} } } }', { q: linked.map(h => 'handle:' + h).join(' OR ') })
    prods = d.products.nodes
  }
  // 2. products named in the title
  const words = unesc(a.title).replace(/['’]/g, '').replace(/[|–—:\-(),!?"]/g, ' ').split(/\s+/).map(w => w.toLowerCase()).filter(w => w.length > 1 && !STOP.has(w)).filter((w, i, a) => a.indexOf(w) === i)
  if (prods.filter(p => p.status === 'ACTIVE' && p.totalInventory > 0).length < 3 && words.length >= 2) {
    const q = words.slice(0, 6).map(w => 'title:*' + w.replace(/[^a-z0-9]/g, '') + '*').filter(x => x.length > 9)
    for (const n of [Math.min(4, q.length), 3, 2, 1]) {
      if (n < 1 || q.length < n) continue
      const d = await gql('query($q:String!){ products(first:12, query:$q, sortKey:RELEVANCE){ nodes{ handle title vendor status totalInventory featuredImage{url} priceRangeV2{minVariantPrice{amount}} } } }', { q: q.slice(0, n).join(' AND ') + ' AND status:active' })
      const stem = w => w.replace(/(es|s)$/, '')
      const need = Math.min(3, words.length)
      const got = d.products.nodes.filter(p => !prods.some(x => x.handle === p.handle)).filter(p => { const t = p.title.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).map(stem); return words.filter(w => t.includes(stem(w))).length >= need })
      prods = prods.concat(got)
      if (prods.filter(p => p.status === 'ACTIVE' && p.totalInventory > 0).length >= 3) break
    }
  }
  const seenT = new Set(); prods = prods.filter(p => !/razor|blade/i.test(p.title) || /razor|blade|shav/i.test(a.title)).filter(p => p.status === 'ACTIVE' && p.totalInventory > 0 && p.featuredImage && !policyFlag(p.title) && !LIGHT.test(p.title + ' ' + p.vendor)).filter(p => { const k = p.title.toLowerCase().trim(); if (seenT.has(k)) return false; seenT.add(k); return true }).slice(0, 6)
  // 3. brand pages mentioned
  const COMMON = /^(sleek|absolute|kiss|hive|titan|obsession|feme|outre)$/i
  const brands = Object.entries(BRANDS).filter(([slug, B]) => [B.name].concat(B.kw || []).some(k => k.length > 3 && !COMMON.test(k.trim()) && new RegExp('\\b' + k.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]?") + '\\b').test(text))).slice(0, 3)
  if (/\bcantu\b/.test(text) && !brands.some(b => b[0] === 'cantu')) brands.unshift(['cantu', { name: 'Cantu' }])
  // 4. topic collection
  const topic = TOPICS.find(t => t[0].test(a.title)) || null
  if (!prods.length && !brands.length && !topic) return null
  const card = p => `<a href="/products/${p.handle}" style="flex:0 0 150px;display:flex;flex-direction:column;background:#fff;border:1px solid #E3E8F4;border-radius:12px;overflow:hidden;text-decoration:none;color:#121A33"><span style="display:block;aspect-ratio:1/1;background:#fff"><img src="${esc(p.featuredImage.url.split('?')[0])}?width=300" alt="${esc(p.title)}" loading="lazy" width="300" height="300" style="width:100%;height:100%;object-fit:contain;padding:6px;margin:0"></span><span style="display:block;font-size:14px;font-weight:700;line-height:1.3;padding:6px 10px 2px;flex:1">${esc(p.title)}</span><span style="display:block;font-weight:800;color:#C2312B;padding:2px 10px 10px">${money(p.priceRangeV2.minVariantPrice.amount)}</span></a>`
  const btn = (href, t) => `<a href="${href}" style="display:inline-block;background:#1D3E9E;color:#fff;text-decoration:none;font-weight:800;border-radius:999px;padding:10px 18px;margin:4px 6px 0 0;font-size:15px">${esc(t)}</a>`
  return `<!--cc-shop--><div style="margin:32px 0 8px;padding:20px 16px;background:#EEF2FB;border-radius:16px;font-family:inherit"><p style="margin:0 0 4px;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#C2312B">Shop this post</p><p style="margin:0 0 14px;font-size:22px;font-weight:800;line-height:1.2;color:#121A33">${prods.length ? 'The products in this post, in stock now' : 'Shop the range'}</p>${prods.length ? `<div style="display:flex;gap:10px;overflow-x:auto;padding:0 0 10px">${prods.map(card).join('')}</div>` : ''}<div>${brands.map(([slug, B]) => btn('/pages/' + slug, 'Shop all ' + B.name)).join('')}${topic ? btn('/collections/' + topic[1], 'Shop ' + topic[2]) : ''}</div><p style="margin:12px 0 0;font-size:14px;color:#4A5578">Free UK delivery on orders over £75, or visit our Leeds stores on Chapeltown Road, Roundhay Road and in the City Centre.</p></div><!--/cc-shop-->`
}
async function shopBlogs(off, lim, go, only) {
  const d = await gql('query{ articles(first:250, sortKey:PUBLISHED_AT, reverse:true){ nodes{ id title handle isPublished publishedAt body blog{handle} } } }')
  let list = d.articles.nodes.filter(a => a.isPublished && a.publishedAt && a.blog.handle !== 'news')
  if (only) list = list.filter(a => a.handle === only)
  const out = []; const slice = list.slice(off, off + lim); const t0 = Date.now()
  for (const a of slice) {
    if (Date.now() - t0 > 45000) { out.push({ handle: a.handle, skipped: 'time' }); continue }
    try {
      const blk = await shopBlock(a)
      if (!blk) { out.push({ handle: a.handle, block: false }); continue }
      const nb = String(a.body || '').replace(SHOP_RE, '').replace(/\s+$/, '') + blk
      let act = 'preview'
      if (go) { const u = await gql('mutation($id:ID!,$a:ArticleUpdateInput!){ articleUpdate(id:$id, article:$a){ userErrors{message} } }', { id: a.id, a: { body: nb } }); act = u.articleUpdate.userErrors.length ? JSON.stringify(u.articleUpdate.userErrors) : 'updated' }
      out.push({ handle: a.handle, act, products: [...blk.matchAll(/alt="([^"]*)"/g)].map(m => m[1]), links: [...blk.matchAll(/href="(\/(?:pages|collections)\/[^"]+)"/g)].map(m => m[1]) })
    } catch (e) { out.push({ handle: a.handle, error: String(e.message || e) }) }
  }
  return { total: list.length, off, lim, next: off + lim < list.length ? off + lim : null, out }
}


// ---------- homepage slots ----------
const SLOTS = {
  'cc-todays-edit': "Today's Edit",
  'cc-new-in': 'New In This Week',
  'cc-brand-of-the-week': 'Brand of the Week',
  'cc-seasonal': 'Seasonal Picks',
  'cc-trending': 'Trending in Leeds This Week'
}
const DAY_EDIT = [ // Sun..Sat, same themes as the nightly newsletter
  ['lotions', 'Self-Care Sunday', 'Body lotions, creams and butters for soft skin all week.'],
  ['hair-dyes', 'Colour Monday', 'Salon-grade colour at home, from the brands Leeds buys most.'],
  ['crochet-braided', 'Braid Tuesday', 'Braiding and crochet hair in every core colour.'],
  ['shampoo', 'Wash Day Wednesday', 'Shampoo, conditioner and leave-ins for wash day.'],
  ['edge-control', 'Edges Thursday', 'Edge control, gels and scarves to lay, wrap and hold.'],
  ['human-hair-extensions', 'Bundle Friday', 'Human hair bundles and weaves for your next install.'],
  ['make-up', 'Makeup Saturday', 'Setting sprays, powders and the makeup to last all night.']
]
const okP = p => p && p.status === 'ACTIVE' && p.totalInventory >= 3 && p.featuredImage && !policyFlag(p.title) && !LIGHT.test(p.title + ' ' + (p.vendor || ''))
async function colBest(handle, n) {
  const d = await gql('query($h:String!){ collectionByHandle(handle:$h){ products(first:80, sortKey:BEST_SELLING){ nodes{ id handle title vendor productType status totalInventory featuredImage{url} } } } }', { h: handle })
  if (!d.collectionByHandle) return []
  const seen = new Set(); return d.collectionByHandle.products.nodes.filter(okP).filter(p => { const k = p.title.toLowerCase().replace(/\s*-\s*\d.*$/, ''); if (seen.has(k)) return false; seen.add(k); return true }).slice(0, n)
}
async function ensureSlot(handle) {
  const d = await gql('query($h:String!){ collectionByHandle(handle:$h){ id } }', { h: handle })
  if (d.collectionByHandle) return d.collectionByHandle.id
  const c = await gql('mutation($i:CollectionInput!){ collectionCreate(input:$i){ collection{ id } userErrors{ message } } }', { i: { title: SLOTS[handle] || handle, handle, sortOrder: 'MANUAL', metafields: [{ namespace: 'seo', key: 'hidden', type: 'number_integer', value: '1' }] } })
  const id = c.collectionCreate.collection && c.collectionCreate.collection.id
  if (!id) throw new Error('collectionCreate ' + JSON.stringify(c.collectionCreate.userErrors))
  try { await gql('mutation($id:ID!,$p:[PublicationInput!]!){ publishablePublish(id:$id, input:$p){ userErrors{ message } } }', { id, p: [{ publicationId: 'gid://shopify/Publication/77511721181' }] }) } catch (e) { }
  return id
}
async function fillSlot(handle, title, desc, prods) {
  const id = await ensureSlot(handle)
  const cur = await gql('query($id:ID!){ collection(id:$id){ products(first:250){ nodes{ id } } } }', { id })
  const old = cur.collection.products.nodes.map(n => n.id)
  if (old.length) await gql('mutation($id:ID!,$p:[ID!]!){ collectionRemoveProducts(id:$id, productIds:$p){ userErrors{ message } } }', { id, p: old })
  if (prods.length) await gql('mutation($id:ID!,$p:[ID!]!){ collectionAddProducts(id:$id, productIds:$p){ userErrors{ message } } }', { id, p: prods.map(p => p.id) })
  await gql('mutation($i:CollectionInput!){ collectionUpdate(input:$i){ userErrors{ message } } }', { i: { id, title, descriptionHtml: desc ? '<p>' + desc + '</p>' : '' } })
  return { handle, title, n: prods.length, items: prods.map(p => p.title).slice(0, 8) }
}
async function homeSlots(only) {
  const out = []; const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }))
  const want = h => !only || only.split(',').includes(h)
  if (want('cc-todays-edit')) { const [h, t, d] = DAY_EDIT[today.getDay()]; out.push(await fillSlot('cc-todays-edit', "Today's Edit: " + t, d, await colBest(h, 8))) }
  if (want('cc-new-in')) {
    const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)
    const d = await gql('query($q:String!){ products(first:100, query:$q, sortKey:CREATED_AT, reverse:true){ nodes{ id handle title vendor status totalInventory featuredImage{url} } } }', { q: 'status:active created_at:>' + since })
    out.push(await fillSlot('cc-new-in', 'New In This Week', 'The latest arrivals at CC Hair & Beauty, in stock now.', d.products.nodes.filter(okP).slice(0, 12)))
  }
  if (want('cc-brand-of-the-week')) {
    const keys = Object.keys(BRANDS).filter(k => !['sleek-hair', 'feme', 'dressmaker', 'janet-collection', 'model-model', 'outre', 'obsession', 'hairmaker', 'remington', 'andis', 'satin-smooth'].includes(k))
    const wk = Math.floor((Date.now() / 864e5 + 3) / 7); const slug = keys[wk % keys.length]; const B = BRANDS[slug]
    const r = await build(slug, B)
    const d = r.bestHandles.length ? await gql('query($q:String!){ products(first:20, query:$q){ nodes{ id handle title vendor status totalInventory featuredImage{url} } } }', { q: r.bestHandles.map(h => 'handle:' + h).join(' OR ') }) : { products: { nodes: [] } }
    const byH = Object.fromEntries(d.products.nodes.map(p => [p.handle, p]))
    out.push(Object.assign(await fillSlot('cc-brand-of-the-week', 'Brand of the Week: ' + B.name, 'Shop the best of ' + B.name + ' at CC Hair & Beauty. <a href="/pages/' + slug + '">See the full ' + B.name + ' range</a>.', r.bestHandles.map(h => byH[h]).filter(okP).slice(0, 8)), { brand: slug }))
  }
  if (want('cc-seasonal')) {
    const d0 = today.toLocaleDateString('en-CA'); const day = s => Math.round((Date.parse(s) - Date.parse(d0)) / 864e5)
    const ev = SEASONS.events.filter(e => e.collections.length && day(e.end) >= 0 && day(e.start) <= Math.max(e.lead || 0, 14)).sort((a, b) => day(a.start) - day(b.start))
    const e = ev.find(x => day(x.start) > 0) || ev[0]
    if (e) { let ps = []; for (const h of e.collections) { ps = ps.concat(await colBest(h, 6)); if (ps.length >= 12) break }
      const seen = new Set(); ps = ps.filter(p => !seen.has(p.id) && seen.add(p.id)).slice(0, 12)
      out.push(Object.assign(await fillSlot('cc-seasonal', e.name, e.angle + (e.page ? ' <a href="' + e.page + '">Find out more</a>.' : ''), ps), { event: e.id })) }
  }
  return out
}

// ---------- homepage auto slideshow: 5 slides x 3 products, refreshed 5 times a day ----------
// Each slide is a hidden collection cc-slide-1..5 (title = heading, description = text,
// metafields custom.kicker / custom.link / custom.button). The theme section reads them.
const SLIDE_RUNS = [7, 10, 13, 16, 19] // London hours the scheduled task fires
// Rough product kind, so a slide shows e.g. a gel, a brush and a scarf rather than three oils
const KINDS = [['durag', /du-?rag/i], ['bonnet', /bonnet/i], ['cap', /\bcaps?\b/i], ['scarf', /scarf|\bwrap\b/i], ['wig', /\bwigs?\b|lace front/i], ['braid', /braid|crochet|\blocs?\b|twist/i], ['bundle', /bundle|weave|weft|clip-?in/i], ['edge', /edge/i], ['gel', /\bgel\b|glue/i], ['makeup', /\blip|lash|brow|foundation|concealer|mascara|eyeliner|palette|blush|highlighter|setting spray|primer/i], ['nail', /\bnail|polish/i], ['oil', /\boils?\b/i], ['shampoo', /shampoo|cleans/i], ['conditioner', /condition|leave-?in|mask|masque|detangl/i], ['colour', /colou?r|\bdye|bleach|lighten/i], ['styler', /mousse|spray|foam|\bwax|pomade|serum/i], ['cream', /cream|butter|lotion|moistur|custard|pudding/i], ['tool', /brush|\bcomb\b|\bclips?\b|\bpins?\b|dryer|straighten|curler|\btongs?\b|clipper|trimmer|razor/i]]
const kindOf = p => { const t = p.title || ''; const k = KINDS.find(([, re]) => re.test(t)); return k ? k[0] : 'type:' + typeName(p.productType).toLowerCase() }
async function slideProducts(q, n) {
  const d = await gql('query($q:String!){ products(first:' + n + ', query:$q){ nodes{ id handle title vendor productType status totalInventory featuredImage{url} } } }', { q })
  return d.products.nodes
}
async function setSlide(i, s, prods) {
  const handle = 'cc-slide-' + i
  if (!SLOTS[handle]) SLOTS[handle] = 'Homepage slide ' + i
  const r = await fillSlot(handle, s.title, s.text, prods)
  const id = await ensureSlot(handle)
  await gql('mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ message } } }', { m: [
    { ownerId: id, namespace: 'custom', key: 'kicker', type: 'single_line_text_field', value: s.kicker },
    { ownerId: id, namespace: 'custom', key: 'link', type: 'single_line_text_field', value: s.link },
    { ownerId: id, namespace: 'custom', key: 'button', type: 'single_line_text_field', value: s.button || 'Shop now' }
  ] })
  return Object.assign(r, { kicker: s.kicker, link: s.link })
}
async function homeSlides(runParam) {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }))
  const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5)
  let run = runParam !== undefined && runParam !== '' ? parseInt(runParam, 10) : SLIDE_RUNS.reduce((a, h, k) => now.getHours() >= h ? k : a, 0)
  const turn = doy * SLIDE_RUNS.length + run // changes every run, every day
  const used = new Set()
  const pick = (pool, k) => { // 3 products of different kinds, a different window each run, no repeats across slides
    pool = pool.filter(p => !used.has(p.id)); if (!pool.length) return []
    const off = (k * 3) % pool.length; const rot = pool.slice(off).concat(pool.slice(0, off))
    const out = []; const kinds = new Set()
    for (const p of rot) { if (out.length >= 3) break; const t = kindOf(p); if (!kinds.has(t)) { out.push(p); kinds.add(t) } }
    for (const p of rot) { if (out.length >= 3) break; if (!out.includes(p)) out.push(p) } // only if the pool has fewer than 3 kinds
    out.forEach(p => used.add(p.id)); return out
  }
  const slides = []
  // 1. Season or event
  const d0 = now.toLocaleDateString('en-CA'); const day = s => Math.round((Date.parse(s) - Date.parse(d0)) / 864e5)
  // slidePriority / slideLead in seasons.json let an event (e.g. Halloween) take slide 1 early, ahead of nearer events
  const ev = SEASONS.events.filter(e => e.collections.length && day(e.end) >= 0 && day(e.start) <= Math.max(e.slideLead || e.lead || 0, 14)).sort((a, b) => (b.slidePriority || 0) - (a.slidePriority || 0) || day(a.start) - day(b.start))
  const e = ev.find(x => x.slidePriority) || ev.find(x => day(x.start) > 0) || ev[0]
  if (e) {
    let ps = []; for (const h of e.collections) { ps = ps.concat(await colBest(h, 8)); if (ps.length >= 18) break }
    const seen = new Set(); ps = ps.filter(p => !seen.has(p.id) && seen.add(p.id))
    const fmt = s => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    slides.push([{ kicker: day(e.start) > 0 ? 'Coming up · ' + fmt(e.start) + (e.end !== e.start ? '–' + fmt(e.end) : '') : 'On now · ' + e.name, title: e.name, text: e.angle, link: e.page || '/collections/' + e.collections[0], button: 'Shop now' }, pick(ps, turn)])
  }
  // 2. Best sellers
  slides.push([{ kicker: "Leeds' best sellers", title: 'What Leeds is buying', text: 'Our most-bought products right now, in stock and ready to go.', link: '/collections/best-sellers-live', button: 'Shop best sellers' }, pick(await colBest('best-sellers-live', 24), turn)])
  // 3. Today's edit (weekday theme, same as the newsletter)
  const [dh, dt, dd] = DAY_EDIT[now.getDay()]
  slides.push([{ kicker: "Today's edit", title: dt, text: dd, link: '/collections/' + dh, button: 'Shop the edit' }, pick(await colBest(dh, 18), turn)])
  // 4. Brand spotlight: a different brand every run (the homepage row and newsletter keep the weekly brand, so skip that one here)
  const keys = Object.keys(BRANDS).filter(k => !['sleek-hair', 'feme', 'dressmaker', 'janet-collection', 'model-model', 'outre', 'obsession', 'hairmaker', 'remington', 'andis', 'satin-smooth'].includes(k))
  const wk = Math.floor((Date.now() / 864e5 + 3) / 7); const weekly = keys[wk % keys.length]
  const bkeys = keys.filter(k => k !== weekly); let brandSlide = null; const t0 = Date.now()
  for (let a = 0; a < 4 && !brandSlide; a++) { // move on to the next brand if this one has fewer than 3 products to show
    const slug = bkeys[(turn + a) % bkeys.length]; const B = BRANDS[slug]
    const r = await build(slug, B)
    const bp = r.bestHandles.length ? await slideProducts(r.bestHandles.map(h => 'handle:' + h).join(' OR '), 30) : []
    const byH = Object.fromEntries(bp.map(p => [p.handle, p]))
    const pool = r.bestHandles.map(h => byH[h]).filter(okP).filter(p => !used.has(p.id))
    if (pool.length >= 3 || a === 3 || Date.now() - t0 > 25000) brandSlide = [{ kicker: 'Brand spotlight', title: B.name, text: 'The ' + B.name + ' products our customers rate most, all in one place.', link: '/pages/' + slug, button: 'Shop ' + B.name }, pick(pool, turn)]
  }
  slides.push(brandSlide)
  // 5. Just landed
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)
  const d = await gql('query($q:String!){ products(first:100, query:$q, sortKey:CREATED_AT, reverse:true){ nodes{ id handle title vendor productType status totalInventory featuredImage{url} } } }', { q: 'status:active created_at:>' + since })
  slides.push([{ kicker: 'Just landed', title: 'New in at CC', text: 'The latest arrivals across our Leeds shops, in stock now.', link: '/collections/all?sort_by=created-descending', button: 'See what is new' }, pick(d.products.nodes.filter(okP).slice(0, 30), turn)])
  const out = []
  for (let i = 0; i < 5; i++) {
    const [s, prods] = slides[i] || [{ kicker: '', title: 'Homepage slide ' + (i + 1), text: '', link: '/', button: '' }, []]
    out.push(await setSlide(i + 1, s, prods))
  }
  return { run, turn, slides: out }
}

export default async function handler(req, res) {
  try {
    const job = String(req.query.job || '')
    if (job === 'vendors') {
      return res.status(200).json({ ok: true, vendors: await vendors(req.query.q || '') })
    }
    if (job === 'themegrep') { // search theme files: t=theme gid number, re=regex; returns filename|count|first match
      const tid = 'gid://shopify/OnlineStoreTheme/' + (req.query.t || '128853410013'); const re = new RegExp(req.query.re, 'g'); const out = []; let c = null
      for (let i = 0; i < 20; i++) { const d = await gql('query($id:ID!,$c:String){ theme(id:$id){ files(first:50, after:$c){ pageInfo{hasNextPage endCursor} nodes{ filename body{ ... on OnlineStoreThemeFileBodyText{ content } } } } } }', { id: tid, c }); const f = d.theme.files; for (const n of f.nodes) { const t = n.body && n.body.content; if (!t) continue; const m = t.match(re); if (m) { const k = t.search(new RegExp(req.query.re)); out.push(n.filename + '|' + m.length + '|' + t.slice(Math.max(0, k - 60), k + 100).replace(/\s+/g, ' ')) } } if (!f.pageInfo.hasNextPage) break; c = f.pageInfo.endCursor }
      res.setHeader('content-type', 'text/plain; charset=utf-8'); return res.status(200).send(out.join('\n') || 'none')
    }
    if (job === 'slides') return res.status(200).json({ ok: true, ...(await homeSlides(req.query.run)) })
    if (job === 'homeslots') return res.status(200).json({ ok: true, slots: await homeSlots(req.query.only || '') })
    if (job === 'setslot') { // h=collection handle, p=product handles comma list, t=title, d=description
      const hs = (req.query.p || '').split(',').filter(Boolean)
      const d = hs.length ? await gql('query($q:String!){ products(first:50, query:$q){ nodes{ id handle title vendor status totalInventory featuredImage{url} } } }', { q: hs.map(h => 'handle:' + h).join(' OR ') }) : { products: { nodes: [] } }
      const byH = Object.fromEntries(d.products.nodes.map(p => [p.handle, p]))
      return res.status(200).json({ ok: true, slot: await fillSlot(req.query.h, req.query.t || SLOTS[req.query.h] || req.query.h, req.query.d || '', hs.map(h => byH[h]).filter(okP)) })
    }
    if (job === 'staticpage') { // publish a hand-written page kept in lib/staticpages.js
      const P = STATIC[req.query.h]; if (!P) return res.status(400).json({ ok: false, error: 'unknown page' })
      const pd = await gql('query($q:String!){ pages(first:3, query:$q){ nodes{ id handle } } }', { q: 'handle:' + req.query.h })
      const ex = pd.pages.nodes.find(p => p.handle === req.query.h)
      const mf = [{ namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: P.seoT }, { namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: P.seoD }]
      if (req.query.go !== '1') return res.status(200).json({ ok: true, action: 'preview', exists: !!ex, len: P.body.length })
      let action
      if (ex) { const u = await gql('mutation($id:ID!,$p:PageUpdateInput!){ pageUpdate(id:$id, page:$p){ userErrors{message} } }', { id: ex.id, p: { title: P.title, body: P.body, metafields: mf } }); action = 'updated ' + JSON.stringify(u.pageUpdate.userErrors) }
      else { const c = await gql('mutation($p:PageCreateInput!){ pageCreate(page:$p){ page{handle} userErrors{message} } }', { p: { title: P.title, handle: req.query.h, isPublished: true, body: P.body, metafields: mf } }); action = 'created ' + JSON.stringify(c.pageCreate.userErrors) }
      return res.status(200).json({ ok: true, action })
    }
    if (job === 'season') { // seasonal calendar: what is live / coming up on a date (default today, Europe/London)
      const S = SEASONS
      const d = req.query.d || new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' })
      const day = s => Math.round((Date.parse(s) - Date.parse(d)) / 864e5)
      const live = [], promote = [], soon = []
      for (const e of S.events) { const toStart = day(e.start), toEnd = day(e.end); const x = Object.assign({ daysToStart: toStart }, e)
        if (toStart <= 0 && toEnd >= 0) live.push(x); else if (toStart > 0 && toStart <= (e.lead || 0)) promote.push(x); else if (toStart > 0 && toStart <= 42) soon.push(x) }
      return res.status(200).json({ ok: true, date: d, live, promote, soon })
    }
    if (job === 'cols') { // list every collection (handle|title|products|hasImage), optional title regex re=
      const re = req.query.re ? new RegExp(req.query.re, 'i') : null; const out = []; let c = null
      for (let i = 0; i < 20; i++) { const d = await gql('query($c:String){ collections(first:250, after:$c){ pageInfo{hasNextPage endCursor} nodes{ handle title productsCount{count} image{url} } } }', { c }); for (const n of d.collections.nodes) if (!re || re.test(n.title) || re.test(n.handle)) out.push([n.handle, n.title, n.productsCount.count, n.image ? 1 : 0].join('|')); if (!d.collections.pageInfo.hasNextPage) break; c = d.collections.pageInfo.endCursor }
      res.setHeader('content-type', 'text/plain; charset=utf-8'); return res.status(200).send(out.join('\n'))
    }
    if (job === 'logos') { // collections whose image is a made logo tile: handle|title|products|width|height|url
      const out = []; let c = null
      for (let i = 0; i < 20; i++) { const d = await gql('query($c:String){ collections(first:250, after:$c){ pageInfo{hasNextPage endCursor} nodes{ id handle title productsCount{count} image{url width height} } } }', { c }); for (const n of d.collections.nodes) if (n.image && /logo/i.test(n.image.url)) out.push([n.handle, n.title, n.productsCount.count, n.image.width, n.image.height, n.id, n.image.url.split('/').pop().split('?')[0]].join('|')); if (!d.collections.pageInfo.hasNextPage) break; c = d.collections.pageInfo.endCursor }
      res.setHeader('content-type', 'text/plain; charset=utf-8'); return res.status(200).send(out.join('\n'))
    }
    if (job === 'shopblogs') return res.status(200).json({ ok: true, ...(await shopBlogs(parseInt(req.query.off || '0', 10), Math.min(30, parseInt(req.query.lim || '15', 10)), req.query.go === '1', req.query.h || '')) })
    if (job === 'blogs') return res.status(200).json({ ok: true, ...(await blogIndex(req.query.go === '1')) })
    if (job === 'build') {
      const slugs = String(req.query.b || '').split(',').filter(Boolean)
      const out = []
      for (const slug of slugs) {
        const B = BRANDS[slug]; if (!B) { out.push({ slug, error: 'not in list' }); continue }
        try {
          const r = await build(slug, B)
          const handle = B.handle || slug
          let action = 'preview'
          if (req.query.go === '1') {
            const pd = await gql('query($q:String!){ pages(first:5, query:$q){ nodes{ id handle body } } }', { q: 'handle:' + handle })
            const ex = pd.pages.nodes.find(p => p.handle === handle)
            const mf = [{ namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: r.seoT }, { namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: r.seoD }]
            if (ex && !/class="ct"/.test(ex.body) && req.query.force !== '1') action = 'skipped: a different page already uses /pages/' + handle
            else if (ex) { const u = await gql('mutation($id:ID!,$p:PageUpdateInput!){ pageUpdate(id:$id, page:$p){ userErrors{message} } }', { id: ex.id, p: Object.assign({ title: B.name, body: r.body, metafields: mf }, req.query.force === '1' ? { templateSuffix: '' } : {}) }); action = 'updated ' + JSON.stringify(u.pageUpdate.userErrors) }
            else { const c = await gql('mutation($p:PageCreateInput!){ pageCreate(page:$p){ page{handle} userErrors{message} } }', { p: { title: B.name, handle, isPublished: true, body: r.body, metafields: mf } }); action = 'created ' + JSON.stringify(c.pageCreate.userErrors) }
          }
          if (req.query.raw === '1') return res.status(200).send(r.body)
          delete r.body
          out.push({ slug, action, ...r })
        } catch (e) { out.push({ slug, error: String(e.message || e) }) }
      }
      return res.status(200).json({ ok: true, out })
    }
    return res.status(400).json({ ok: false, error: 'job?' })
  } catch (e) { return res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
