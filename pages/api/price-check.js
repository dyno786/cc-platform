// Price check for the CC SEO dashboard. Read only: it looks up one product on other shops' public websites.
//
//   /api/price-check?barcode=3600520987675&q=Casting+Creme+Gloss+200+Ebony+Black&shops=kiyobeauty.com,justmylook.com
//
// For each shop it asks the shop's own public product search, first by barcode, then by name.
// It can read three kinds of shop: Shopify, WooCommerce, and shops with a standard search page
// whose product pages carry a machine-readable price. Anything else is reported as "not readable".

export const config = { maxDuration: 60 }

const UA = 'Mozilla/5.0 (compatible; CC-price-check/1.0; +https://cchairandbeauty.com)'
const okDomain = d => /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d) && d.length < 80 && !/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(d) && !/\.(local|internal)$/.test(d)
const words = s => String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(' ').filter(w => w.length > 1 && !['the', 'and', 'for', 'with', 'hair', 'ml', 'oz'].includes(w))

async function getJson(url, ms) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms)
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' }, signal: ctl.signal, redirect: 'follow' })
    if (!r.ok) return { status: r.status }
    const text = await r.text()
    try { return { status: 200, json: JSON.parse(text) } } catch (e) { return { status: 200, notJson: true } }
  } catch (e) { return { status: 0 } } finally { clearTimeout(t) }
}

async function suggest(domain, term, fields) {
  const u = 'https://' + domain + '/search/suggest.json?q=' + encodeURIComponent(term) + '&resources[type]=product&resources[limit]=5' + (fields ? '&resources[options][fields]=' + fields : '')
  const r = await getJson(u, 7000)
  if (r.status === 0) return { down: true }
  if (r.status !== 200 || r.notJson || !r.json || !r.json.resources) return { other: true }
  return { products: ((r.json.resources.results || {}).products) || [] }
}

// the price of the exact shade, when the shop publishes barcodes on its product data
async function exactVariant(domain, handle, barcode) {
  if (!barcode || !handle) return null
  const r = await getJson('https://' + domain + '/products/' + encodeURIComponent(handle) + '.json', 6000)
  const vs = r.json && r.json.product && r.json.product.variants
  if (!Array.isArray(vs)) return null
  const v = vs.find(x => String(x.barcode || '') === barcode || String(x.sku || '') === barcode)
  return v ? { price: Number(v.price), shade: v.title } : null
}

async function getText(url, ms) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms)
  try { const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,*/*' }, signal: ctl.signal, redirect: 'follow' }); if (!r.ok) return null; return (await r.text()).slice(0, 600000) } catch (e) { return null } finally { clearTimeout(t) }
}
const nameScore = (want, title) => { const w = words(want); const have = new Set(words(title)); return w.length ? w.filter(x => have.has(x)).length / w.length : 0 }

// WooCommerce shops publish a product list that can be searched by SKU (often the barcode) or by name
async function woo(domain, barcode, name) {
  const base = 'https://' + domain + '/wp-json/wc/store/v1/products?per_page=5&'
  const pick = async (qs) => { const r = await getJson(base + qs, 7000); return Array.isArray(r.json) ? r.json : (r.status === 200 && !r.notJson ? [] : null) }
  let list = barcode ? await pick('sku=' + encodeURIComponent(barcode)) : []
  if (list === null) return null                       // not a WooCommerce shop
  let matched = 'barcode'
  if (!list.length && barcode) { const again = await pick('search=' + encodeURIComponent(barcode)); if (again && again.length) list = again }
  if (!list.length && name) { matched = 'name'; const byName = (await pick('search=' + encodeURIComponent(name))) || []; const best = byName.map(x => ({ x, s: nameScore(name, x.name) })).sort((a, b) => b.s - a.s)[0]; list = best && best.s >= 0.6 ? [best.x] : [] }
  const p = list[0]; if (!p) return { state: 'not stocked', note: 'No matching product was found on this shop.' }
  const minor = Number((p.prices && p.prices.currency_minor_unit) ?? 2), price = p.prices ? Number(p.prices.price) / Math.pow(10, minor) : 0
  if (!(price > 0)) return { state: 'not stocked', note: 'A product was found but it shows no price.' }
  return { state: 'found', matched, title: String(p.name || '').replace(/&amp;/g, '&').replace(/&#8211;/g, '-'), price, priceMax: price, available: p.is_in_stock !== false, url: p.permalink }
}

// any other shop: use its search page, open the first product it returns, and read the price it declares for search engines
function declaredPrice(html) {
  const blocks = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1])
  for (const b of blocks) { try { const walk = o => { if (!o || typeof o !== 'object') return null; if (Array.isArray(o)) { for (const x of o) { const r = walk(x); if (r) return r } return null }
        if (/Product/i.test(String(o['@type'])) && o.offers) { const of = Array.isArray(o.offers) ? o.offers[0] : o.offers; const pr = Number(of.price ?? of.lowPrice); if (pr > 0) return { price: pr, title: String(o.name || ''), gtin: String(o.gtin13 || o.gtin12 || o.gtin || o.sku || ''), available: !/OutOfStock/i.test(String(of.availability || '')), currency: String(of.priceCurrency || '') } }
        for (const k of Object.keys(o)) { const r = walk(o[k]); if (r) return r } return null }
      const r = walk(JSON.parse(b)); if (r) return r } catch (e) { } }
  const m = html.match(/property=["'](?:product:price:amount|og:price:amount)["'][^>]*content=["']([0-9.]+)["']/i) || html.match(/content=["']([0-9.]+)["'][^>]*property=["'](?:product:price:amount|og:price:amount)["']/i)
  if (m) { const t = html.match(/<title[^>]*>([^<]*)<\/title>/i); return { price: Number(m[1]), title: t ? t[1].trim() : '', gtin: '', available: true, currency: '' } }
  return null
}
async function generic(domain, barcode, name) {
  const term = barcode || name; if (!term) return null
  for (const path of ['/search.php?search_query=', '/search?q=', '/?s=', '/catalogsearch/result/?q=']) {
    const html = await getText('https://' + domain + path + encodeURIComponent(term), 7000); if (!html) continue
    const direct = declaredPrice(html)                  // some shops jump straight to the product when one item matches
    if (direct && (!barcode || html.includes(barcode))) return { state: 'found', matched: barcode && html.includes(barcode) ? 'barcode' : 'name', title: direct.title, price: direct.price, priceMax: direct.price, available: direct.available, url: 'https://' + domain + path + encodeURIComponent(term) }
    const links = [...new Set([...html.matchAll(/href=["'](https?:\/\/[^"']+|\/[^"'#?]+)["']/gi)].map(m => m[1].startsWith('/') ? 'https://' + domain + m[1] : m[1]).filter(u => u.includes(domain) && !/\/(cart|account|login|search|category|categories|brands?|blog|pages?|wp-|checkout|contact)/i.test(u) && !/\.(css|js|png|jpg|jpeg|svg|webp|ico|xml)(\?|$)/i.test(u)))]
    const want = words(name || ''); const ranked = links.map(u => ({ u, s: want.length ? want.filter(w => u.toLowerCase().includes(w)).length / want.length : 0 })).filter(x => x.s >= 0.5).sort((a, b) => b.s - a.s).slice(0, 2)
    for (const cand of ranked) { const page = await getText(cand.u, 7000); if (!page) continue; const d = declaredPrice(page); if (!d) continue
      const byCode = !!barcode && page.includes(barcode); if (!byCode && name && nameScore(name, d.title) < 0.6) continue
      return { state: 'found', matched: byCode ? 'barcode' : 'name', title: d.title, price: d.price, priceMax: d.price, available: d.available, url: cand.u } }
  }
  return null
}

async function checkShop(domain, barcode, name) {
  const out = { shop: domain }
  let res = barcode ? await suggest(domain, barcode, 'variants.barcode,variants.sku') : await suggest(domain, name, '')
  if (res.down) return { ...out, state: 'no answer' }
  if (res.other) {
    const w = await woo(domain, barcode, name); if (w) return { ...out, platform: 'WooCommerce', ...w }
    const g = await generic(domain, barcode, name); if (g) return { ...out, platform: 'other', ...g }
    return { ...out, state: 'not readable', note: 'This shop\'s search could not be read automatically.' }
  }
  if (!barcode) res = { products: [] }
  let matched = 'barcode'; let p = res.products[0]
  if (!p && name) {
    matched = 'name'
    const byName = await suggest(domain, name, '')
    const want = words(name)
    const scored = (byName.products || []).map(x => { const have = new Set(words(x.title)); return { x, score: want.length ? want.filter(w => have.has(w)).length / want.length : 0 } }).sort((a, b) => b.score - a.score)
    if (scored[0] && scored[0].score >= 0.6) p = scored[0].x
  }
  if (!p) return { ...out, platform: 'Shopify', state: 'not stocked', note: 'No matching product was found on this shop.' }
  const handle = p.handle || String(p.url || '').split('/products/')[1]?.split('?')[0]
  const exact = await exactVariant(domain, handle, barcode)
  const price = exact ? exact.price : Number(p.price_min || p.price)
  if (!(price > 0)) return { ...out, state: 'not stocked', note: 'A product was found but it shows no price.' }
  return { ...out, platform: 'Shopify', state: 'found', matched: exact ? 'barcode' : matched, title: p.title, shade: exact ? exact.shade : '', price, priceMax: Number(p.price_max || p.price) || price, available: p.available !== false, url: 'https://' + domain + String(p.url || '/products/' + handle).split('?')[0] }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const barcode = String(req.query.barcode || '').replace(/[^0-9]/g, '').slice(0, 14)
    const name = String(req.query.q || '').slice(0, 140)
    const shops = [...new Set(String(req.query.shops || '').toLowerCase().split(',').map(s => s.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')).filter(okDomain))].slice(0, 8)
    if (!barcode && !name) return res.status(200).json({ ok: false, error: 'Give a barcode or a product name.' })
    if (!shops.length) return res.status(200).json({ ok: false, error: 'Give at least one shop address.' })
    const limit = (p, d) => Promise.race([p, new Promise(r => setTimeout(() => r({ shop: d, state: 'no answer', note: 'This shop was too slow to answer.' }), 40000))])
    const results = await Promise.all(shops.map(d => limit(checkShop(d, barcode, name).catch(() => ({ shop: d, state: 'no answer' })), d)))
    return res.status(200).json({ ok: true, barcode, name, checked: new Date().toISOString().slice(0, 10), results })
  } catch (e) {
    return res.status(200).json({ ok: false, error: 'The price check failed: ' + (e && e.message ? e.message : 'unknown error') })
  }
}
