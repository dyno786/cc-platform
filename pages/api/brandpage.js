// One-off helper: builds brand pages (shop by ingredient, collections, guides, FAQs) from live Shopify data. Remove once done.
//   job=vendors&q=regex      list vendor names that match
//   job=build&b=slug[&go=1]  build one brand page (preview without go=1)
import { gql, policyFlag } from '../../lib/intake'
import BRANDS from '../../lib/brands.json'

export const config = { maxDuration: 60 }
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const money = n => '£' + Number(n).toFixed(2)
const LIGHT = /lighten|whiten|bleaching cream|fade cream|dark spot|toning (soap|cream|lotion|serum|oil|gel)|hydroquinone|clarifying (cream|lotion|serum)|carotone|caro light|fair\s*(&|and)\s*white|makari|skin tone/i

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
  return `<style>.main-page-title{text-align:center}.ct{--ink:#1F1611;--br:#3B2416;--gd:#D9A441;--gr:#2F6B3A;--cr:#FBF4E8;--mut:#6B5A4C;--ln:#EADCC6;color:var(--ink);font-size:17px;line-height:1.6}.ct *{box-sizing:border-box}.ct p{margin:0 0 12px}.ct a{color:inherit}.ct h2{font-size:28px;line-height:1.15;font-weight:800;margin:0 0 10px;text-align:center}.ct h3{font-size:24px;line-height:1.15;font-weight:800;margin:0}.ct-hero{background:var(--br);color:#fff;border-radius:24px;padding:40px 20px 30px;text-align:center;background-image:radial-gradient(rgba(217,164,65,.18) 2px,transparent 2.5px);background-size:22px 22px}.ct-logo{display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:18px;padding:10px;width:150px;height:150px;margin:0 0 16px}.ct .ct-logo img{max-width:100%!important;max-height:100%!important;width:auto!important;height:auto!important;object-fit:contain;margin:0!important;border:0!important}.ct-kick{display:inline-block;background:var(--gd);color:var(--br);font-weight:800;font-size:12px;letter-spacing:.16em;text-transform:uppercase;border-radius:999px;padding:7px 16px;margin:0 0 14px}.ct .ct-big{color:#fff;font-size:38px;line-height:1.05;font-weight:900;margin:0 0 14px}.ct-big span{color:var(--gd)}.ct-hero p{color:#F3E6D2;max-width:680px;margin:0 auto 20px}.ct-cta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.ct-btn{display:inline-block;background:var(--gd);color:var(--br)!important;font-weight:800;text-decoration:none;border-radius:999px;padding:12px 24px}.ct-ghost{background:transparent;color:#fff!important;border:2px solid rgba(255,255,255,.6)}.ct-stats{list-style:none;padding:0;margin:26px 0 0;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ct-stats li{background:rgba(255,255,255,.08);border-radius:14px;padding:12px;font-size:14px;color:#F3E6D2}.ct-stats b{display:block;color:#fff;font-size:20px}.ct-chips{display:flex;gap:8px;overflow-x:auto;padding:18px 2px 8px;margin:0 0 6px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}.ct-chips a{flex:0 0 auto;background:var(--cr);border:1px solid var(--ln);border-radius:999px;padding:9px 16px;font-weight:700;font-size:15px;text-decoration:none;white-space:nowrap}.ct-chips a:hover{background:var(--gd);border-color:var(--gd)}.ct-ing{padding:26px 0 8px;border-bottom:1px solid var(--ln);scroll-margin-top:90px}.ct-ih{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin:0 0 8px}.ct-tag{display:block;color:var(--gr);font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase}.ct-ing>p{color:var(--mut);max-width:760px}.ct-more{font-weight:800;color:var(--gr)!important;text-decoration:none;white-space:nowrap}.ct-row{display:flex;gap:12px;overflow-x:auto;padding:4px 2px 14px;scroll-snap-type:x proximity;scrollbar-width:thin;-webkit-overflow-scrolling:touch}.ct-p{flex:0 0 150px;scroll-snap-align:start;display:flex;flex-direction:column;background:#fff;border:1px solid var(--ln);border-radius:14px;overflow:hidden;text-decoration:none}.ct-p:hover{border-color:var(--br)}.ct-pi{display:block;position:relative;aspect-ratio:1/1;background:#fff}.ct .ct-pi img{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:contain;padding:8px;margin:0!important;border:0!important}.ct-pn{display:block;font-size:14px;font-weight:700;line-height:1.3;padding:6px 10px 2px;flex:1}.ct-pp{display:block;font-weight:800;color:var(--gr);padding:0 10px 10px}.ct-sec{padding:44px 0 0}.ct-lead{text-align:center;color:var(--mut);max-width:680px;margin:0 auto 18px!important}.ct-cg{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.ct-c{display:flex;flex-direction:column;background:var(--cr);border-radius:16px;overflow:hidden;text-decoration:none;font-weight:800;text-align:center}.ct-c>span:last-child{padding:10px 8px 12px;font-size:15px;line-height:1.25}.ct-ci{display:block;position:relative;aspect-ratio:1/1;background:#fff}.ct .ct-ci img{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:contain;margin:0!important;border:0!important}.ct-noimg{display:flex!important;align-items:center;justify-content:center;font-size:30px;color:var(--br);background:var(--cr)!important}.ct-about{max-width:820px;margin:0 auto}.ct-bg{display:grid;gap:14px}.ct-b{display:flex;flex-direction:column;background:#fff;border:1px solid var(--ln);border-radius:16px;overflow:hidden;text-decoration:none}.ct-bi{display:block;position:relative;aspect-ratio:16/10;background:var(--cr)}.ct .ct-bi img{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:cover;margin:0!important;border:0!important}.ct-bt{font-weight:800;font-size:17px;line-height:1.3;padding:12px 14px 4px}.ct-bl{color:var(--gr);font-weight:700;padding:0 14px 14px;font-size:15px}.ct-faq{max-width:820px;margin:0 auto}.ct-faq details{border-bottom:1px solid var(--ln);padding:14px 4px}.ct-faq summary{font-weight:700;cursor:pointer}.ct-faq details p{margin:10px 0 0;color:var(--mut)}@media(min-width:750px){.ct-hero{padding:60px 40px 40px}.ct .ct-big{font-size:56px}.ct-stats{grid-template-columns:repeat(4,1fr)}.ct-p{flex-basis:180px}.ct-cg{grid-template-columns:repeat(3,1fr)}.ct-bg{grid-template-columns:repeat(3,1fr)}}@media(min-width:990px){.ct{width:min(1240px,calc(100vw - 100px));position:relative;left:50%;transform:translateX(-50%)}.ct-cg{grid-template-columns:repeat(6,1fr)}}</style>`
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
  const main = (B.main && cols.find(c => c.handle === B.main)) || cols.find(c => c.handle === slug) || cols[0] || null
  let logo = B.logo || (main && main.image && main.image.url) || null
  // best sellers
  let best = []
  if (main) {
    const bd = await gql('query($h:String!){ collectionByHandle(handle:$h){ products(first:40, sortKey:BEST_SELLING){ nodes{ handle status totalInventory } } } }', { h: main.handle })
    const ok = new Set(show.map(p => p.handle))
    best = (bd.collectionByHandle ? bd.collectionByHandle.products.nodes : []).filter(n => n.status === 'ACTIVE' && ok.has(n.handle)).map(n => show.find(p => p.handle === n.handle)).slice(0, 12)
  }
  if (best.length < 4) best = show.slice().sort((a, b) => b.totalInventory - a.totalInventory).slice(0, 12)
  // groups
  let groups = []
  if (!B.byType) {
    for (const [k, label, re] of ING) {
      const items = show.filter(p => re.test(p.title))
      if (items.length >= 2) groups.push({ k, label, items })
    }
  }
  let mode = 'ingredient'
  if (B.byType || groups.length < 3) {
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
  const short = t => { let s = String(t); for (const k of kw) s = s.replace(new RegExp('^\\s*' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s:\\-–]*', 'i'), ''); return s.trim() || t }
  const card = p => `<a class="ct-p" href="/products/${p.handle}"><span class="ct-pi"><img src="${esc(p.featuredImage.url.split('?')[0])}?width=360" alt="${esc(p.title)}" loading="lazy" width="360" height="360"></span><span class="ct-pn">${esc(short(p.title))}</span><span class="ct-pp">${money(p.priceRangeV2.minVariantPrice.amount)}</span></a>`
  const minP = Math.min(...prods.map(p => +p.priceRangeV2.minVariantPrice.amount).filter(x => x > 0))
  const word = mode === 'ingredient' ? 'ingredient' : 'type'
  const chips = [{ k: 'best', label: 'Best sellers' }].concat(groups).map(g => `<a href="#ct-${g.k}">${esc(g.label)}</a>`).join('')
  const sec = (k, tag, title, desc, items, more) => `<section class="ct-ing" id="ct-${k}"><div class="ct-ih"><div><span class="ct-tag">${esc(tag)}</span><h3>${esc(title)}</h3></div>${more || ''}</div>${desc ? '<p>' + desc + '</p>' : ''}<div class="ct-row">${items.map(card).join('')}</div></section>`
  let rows = sec('best', 'Most popular', name + ' best sellers', 'The ' + esc(name) + ' products our customers buy most, in stock now.', best, main ? `<a class="ct-more" href="/collections/${main.handle}">Shop all ${esc(name)} &rarr;</a>` : '')
  for (const g of groups) {
    const col = cols.find(c => new RegExp(g.label.split(/[ &]/)[0], 'i').test(c.title) && c !== main)
    rows += sec(g.k, mode === 'ingredient' ? 'Shop by ingredient' : 'Shop by type', name + ' ' + g.label, mode === 'ingredient' ? esc(name) + ' products made with ' + esc(g.label.toLowerCase()) + ', in stock now.' : '', g.items.slice(0, 14), col ? `<a class="ct-more" href="/collections/${col.handle}">Shop ${esc(col.title)} &rarr;</a>` : '')
  }
  const colh = cols.slice(0, 24).map(c => `<a class="ct-c" href="/collections/${c.handle}">${c.image ? `<span class="ct-ci"><img src="${esc(c.image.url.split('?')[0])}?width=400" alt="${esc(c.title)} collection" loading="lazy" width="400" height="400"></span>` : `<span class="ct-ci ct-noimg">${esc(name.charAt(0))}</span>`}<span>${esc(c.title)}</span></a>`).join('')
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
  const hero = `<div class="ct-hero">${logo ? `<span class="ct-logo"><img src="${esc(logo.split('?')[0])}?width=300" alt="${esc(name)} logo" width="150" height="150"></span><br>` : ''}<span class="ct-kick">${esc(name)} at CC Hair &amp; Beauty</span><h2 class="ct-big">${esc(name)}, <span>shop by ${word}</span></h2><p>${esc(B.intro || ('Shop ' + total + ' ' + name + ' products online or in our Leeds stores' + (topTypes.length ? ': ' + list(topTypes.slice(0, 3)) + ' and more' : '') + '.'))}</p><div class="ct-cta">${main ? `<a class="ct-btn" href="/collections/${main.handle}">Shop all ${esc(name)}</a>` : ''}<a class="ct-btn ct-ghost" href="#ct-shop">Shop by ${word}</a></div><ul class="ct-stats"><li><b>${total}</b>${esc(name)} products</li><li><b>${groups.length}</b>${mode === 'ingredient' ? 'ingredient ranges' : 'product types'}</li><li><b>${isFinite(minP) ? 'From ' + money(minP) : cols.length}</b>${isFinite(minP) ? 'prices' : 'collections'}</li><li><b>Free UK delivery</b>over £75</li></ul></div>`
  const body = css() + `<div class="ct">${hero}<nav class="ct-chips" id="ct-shop" aria-label="Shop ${esc(name)} by ${word}">${chips}</nav>${rows}` +
    (colh ? `<section class="ct-sec"><h2>Every ${esc(name)} collection</h2><p class="ct-lead">Browse each ${esc(name)} range in full.</p><div class="ct-cg">${colh}</div></section>` : '') +
    `<section class="ct-sec ct-about"><h2>About ${esc(name)}</h2>${about}</section>` +
    (blogs ? `<section class="ct-sec"><h2>Hair care guides and reviews</h2><div class="ct-bg">${blogs}</div></section>` : '') +
    `<section class="ct-sec ct-faq"><h2>${esc(name)} FAQs</h2>${faqh}</section></div><script type="application/ld+json">${JSON.stringify(ld)}</script>`
  const seoT = (name + ' UK | Shop by ' + (mode === 'ingredient' ? 'Ingredient' : 'Type')).slice(0, 60)
  const seoD = ('Shop ' + total + ' ' + name + ' products' + (topTypes.length ? ': ' + list(topTypes.slice(0, 3)) : '') + '. Leeds stores and free UK delivery over £75.').slice(0, 160)
  return { body, seoT, seoD, total, shown: show.length, mode, groups: groups.map(g => g.label + ' (' + g.items.length + ')'), cols: cols.length, main: main && main.handle, logo: !!logo, blogs: arts.length, best: best.length }
}

export default async function handler(req, res) {
  try {
    const job = String(req.query.job || '')
    if (job === 'vendors') {
      return res.status(200).json({ ok: true, vendors: await vendors(req.query.q || '') })
    }
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
            else if (ex) { const u = await gql('mutation($id:ID!,$p:PageUpdateInput!){ pageUpdate(id:$id, page:$p){ userErrors{message} } }', { id: ex.id, p: { title: B.name, body: r.body, metafields: mf } }); action = 'updated ' + JSON.stringify(u.pageUpdate.userErrors) }
            else { const c = await gql('mutation($p:PageCreateInput!){ pageCreate(page:$p){ page{handle} userErrors{message} } }', { p: { title: B.name, handle, isPublished: true, body: r.body, metafields: mf } }); action = 'created ' + JSON.stringify(c.pageCreate.userErrors) }
          }
          delete r.body
          out.push({ slug, action, ...r })
        } catch (e) { out.push({ slug, error: String(e.message || e) }) }
      }
      return res.status(200).json({ ok: true, out })
    }
    return res.status(400).json({ ok: false, error: 'job?' })
  } catch (e) { return res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
