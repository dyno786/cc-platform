// Shared server code for the "Add products" page (pages/intake.js).
// Used only by the /api/intake-* routes. Nothing here runs in the browser.

export const API_VERSION = '2025-01'

// The shops on the price watch list. Each one is asked for the scanned barcode.
export const SHOPS = [
  'kiyobeauty.com', 'justmylook.com', 'shabacosmetics.com', 'superbhb.co.uk', 'pakcosmetics.com',
  'murphysbeauty.co.uk', 'hamnasbeauty.co.uk', 'afropride.co.uk', 'urbanbeaute.co.uk',
  'beautyqueenscosmetics.com', 'tjbeautyproducts.co.uk', 'manchesterhairproducts.com', 'beautyflex.co.uk',
  'venuscosmetics.co.uk', 'britshairandbeauty.co.uk', 'beutyfusion.co.uk', 'agloryhairandcosmetics.co.uk',
]

const UA = 'Mozilla/5.0 (compatible; CC-product-intake/1.0; +https://cchairandbeauty.com)'
const UK = { 'accept-language': 'en-GB,en;q=0.9', cookie: 'localization=GB; cart_currency=GBP' }

export const cleanBarcode = b => String(b || '').replace(/[^0-9]/g, '').slice(0, 14)
export const stripHtml = h => String(h || '').replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;|&#8217;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()

// ---------- our own Shopify shop ----------
export async function gql(query, variables) {
  const shop = process.env.SHOPIFY_STORE, token = process.env.SHOPIFY_TOKEN
  if (!shop || !token) throw new Error('The Shopify connection is not set up on this app (SHOPIFY_STORE and SHOPIFY_TOKEN are missing).')
  const r = await fetch('https://' + shop + '/admin/api/' + API_VERSION + '/graphql.json', {
    method: 'POST', headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: variables || {} }),
  })
  const text = await r.text()
  let j = null
  try { j = JSON.parse(text) } catch (e) { throw new Error('Shopify did not answer properly (status ' + r.status + ').') }
  if (j.errors) {
    const msg = Array.isArray(j.errors) ? j.errors.map(e => e.message).join('; ') : String(j.errors)
    if (/access denied|scope/i.test(msg)) throw new Error('The app\'s Shopify key is not allowed to do this. It needs the "write_products" permission. (' + msg + ')')
    throw new Error('Shopify said: ' + msg)
  }
  return j.data
}

// Is this barcode already on a product in our shop?
export async function findOurs(barcode) {
  const d = await gql('query($q: String!) { productVariants(first: 5, query: $q) { nodes { id title barcode product { id title handle status } } } }', { q: 'barcode:' + barcode })
  const v = (d.productVariants.nodes || []).find(x => cleanBarcode(x.barcode) === barcode)
  if (!v) return null
  return { variantId: v.id, variantTitle: v.title, productId: v.product.id, title: v.product.title, handle: v.product.handle, status: v.product.status }
}

// ---------- other shops ----------
async function getJson(url, ms) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms)
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json', ...UK }, signal: ctl.signal, redirect: 'follow' })
    if (!r.ok) return null
    return JSON.parse(await r.text())
  } catch (e) { return null } finally { clearTimeout(t) }
}

// A Shopify shop: its search finds the product by barcode, then its product file gives the full details.
async function fromShopify(domain, barcode) {
  const s = await getJson('https://' + domain + '/search/suggest.json?q=' + encodeURIComponent(barcode) + '&resources[type]=product&resources[limit]=3&resources[options][fields]=variants.barcode,variants.sku', 7000)
  if (!s || !s.resources) return undefined            // not a Shopify shop, or no answer
  const hit = (((s.resources.results || {}).products) || [])[0]
  if (!hit) return null
  const handle = hit.handle || String(hit.url || '').split('/products/')[1]?.split('?')[0]
  if (!handle) return null
  const j = await getJson('https://' + domain + '/products/' + encodeURIComponent(handle) + '.json', 7000)
  const p = j && j.product
  if (!p) return { shop: domain, title: hit.title, vendor: hit.vendor || '', type: hit.type || '', description: stripHtml(hit.body).slice(0, 1500), images: hit.image ? [hit.image] : [], url: 'https://' + domain + '/products/' + handle, exact: false, variants: [] }
  const vs = Array.isArray(p.variants) ? p.variants : []
  const mine = vs.find(v => cleanBarcode(v.barcode) === barcode || cleanBarcode(v.sku) === barcode)
  const imgs = (p.images || []).map(i => ({ id: i.id, src: String(i.src || '').split('?')[0] })).filter(i => i.src)
  const mineImg = mine && mine.image_id ? imgs.find(i => i.id === mine.image_id) : null
  const ordered = mineImg ? [mineImg, ...imgs.filter(i => i !== mineImg)] : imgs
  return {
    shop: domain, title: p.title, vendor: p.vendor || '', type: p.product_type || '', description: stripHtml(p.body_html).slice(0, 1500),
    images: ordered.slice(0, 6).map(i => i.src), url: 'https://' + domain + '/products/' + handle, exact: !!mine,
    price: mine ? Number(mine.price) || null : (vs[0] ? Number(vs[0].price) || null : null),
    optionNames: (p.options || []).map(o => o.name).filter(n => n && n !== 'Title'),
    variantTitle: mine && mine.title !== 'Default Title' ? mine.title : '',
    variants: vs.length > 1 ? vs.slice(0, 120).map(v => ({ title: v.title, options: [v.option1, v.option2, v.option3].filter(Boolean), barcode: cleanBarcode(v.barcode) })) : [],
  }
}

// A WooCommerce shop: its public product list can be searched by SKU or by the barcode as text.
async function fromWoo(domain, barcode) {
  const base = 'https://' + domain + '/wp-json/wc/store/v1/products?per_page=3&'
  let list = await getJson(base + 'sku=' + barcode, 7000)
  if (!Array.isArray(list)) return undefined
  if (!list.length) { const again = await getJson(base + 'search=' + barcode, 7000); if (Array.isArray(again)) list = again }
  const p = list[0]
  if (!p) return null
  const minor = Number((p.prices && p.prices.currency_minor_unit) ?? 2)
  const gbp = !p.prices || !p.prices.currency_code || String(p.prices.currency_code).toUpperCase() === 'GBP'
  return {
    shop: domain, title: stripHtml(p.name), vendor: '', type: ((p.categories || [])[0] || {}).name || '',
    description: stripHtml(p.description || p.short_description).slice(0, 1500),
    images: (p.images || []).slice(0, 6).map(i => i.src).filter(Boolean), url: p.permalink, exact: cleanBarcode(p.sku) === barcode,
    price: gbp && p.prices ? Number(p.prices.price) / Math.pow(10, minor) || null : null, optionNames: [], variantTitle: '', variants: [],
  }
}

// Open Beauty Facts: a free public barcode database. Used as a last resort for the name and brand.
async function fromOpenFacts(barcode) {
  const j = await getJson('https://world.openbeautyfacts.org/api/v2/product/' + barcode + '.json?fields=product_name,brands,image_url,quantity', 6000)
  const p = j && j.status === 1 && j.product
  if (!p || !p.product_name) return null
  return { shop: 'openbeautyfacts.org', title: [p.brands, p.product_name, p.quantity].filter(Boolean).join(' '), vendor: String(p.brands || '').split(',')[0].trim(), type: '', description: '', images: p.image_url ? [p.image_url] : [], url: 'https://world.openbeautyfacts.org/product/' + barcode, exact: true, price: null, optionNames: [], variantTitle: '', variants: [] }
}

export async function lookupElsewhere(barcode) {
  const one = async domain => {
    try {
      const s = await fromShopify(domain, barcode)
      if (s !== undefined) return s
      const w = await fromWoo(domain, barcode)
      return w === undefined ? null : w
    } catch (e) { return null }
  }
  const slow = (p) => Promise.race([p, new Promise(r => setTimeout(() => r(null), 16000))])
  const all = await Promise.all([...SHOPS.map(d => slow(one(d))), slow(fromOpenFacts(barcode).catch(() => null))])
  const found = all.filter(Boolean)
  // best first: the barcode was matched exactly, then the one with most detail
  const score = f => (f.exact ? 100 : 0) + (f.images.length ? 20 : 0) + Math.min(20, f.description.length / 50) + (f.vendor ? 5 : 0) + (f.shop === 'openbeautyfacts.org' ? -60 : 0)
  return found.sort((a, b) => score(b) - score(a))
}

// ---------- our existing product types and brand names ----------
export async function ourTypes() {
  const d = await gql('query { shop { productTypes(first: 250) { nodes } } }')
  return (d.shop.productTypes.nodes || []).filter(Boolean)
}
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
// Brand names in our shop that look like the brand found, so the new product joins the brand collection that already exists.
export async function vendorsLike(brand, title) {
  const words = [...new Set((norm(brand) + ' ' + norm(title).split(' ').slice(0, 3).join(' ')).split(' ').filter(w => w.length > 2))].slice(0, 4)
  const out = new Set()
  for (const w of words) {
    try {
      const d = await gql('query($q: String!) { products(first: 40, query: $q) { nodes { vendor } } }', { q: 'vendor:' + w + '*' })
      for (const n of d.products.nodes || []) if (n.vendor) out.add(n.vendor)
    } catch (e) { }
  }
  return [...out].slice(0, 40)
}

// Products we never write selling copy for. They are still saved as drafts, flagged for the owner.
export const policyFlag = text => /\b(skin\s*(lighten|whiten|bleach|brighten(ing)?\s*cream)|lightening\s+(cream|lotion|soap|serum|oil|gel)|whitening\s+(cream|lotion|soap|serum|body)|bleaching\s+(cream|lotion)|hydroquinone|fade\s+cream|caro\s*(white|light)|fair\s*(and|&)\s*white|maxi\s*-?\s*(tone|light|white)|skin\s*light)\b/i.test(String(text || ''))

// ---------- the wording, written by Claude ----------
export async function writeListing(facts) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const prompt = `You are writing a product listing for CC Hair & Beauty, a family-run afro hair and beauty shop in Leeds, UK.

FACTS ABOUT THE PRODUCT (gathered from other shops' listings for the same barcode; treat as raw notes, not as text to copy):
${JSON.stringify(facts.sources, null, 1).slice(0, 6000)}

What our staff entered: ${JSON.stringify(facts.staff)}

OUR EXISTING PRODUCT TYPES (pick exactly one of these; do not invent a new one unless nothing fits):
${facts.types.join(' | ')}

BRAND NAMES ALREADY IN OUR SHOP THAT MAY MATCH (pick one exactly as written if it is the same brand and range; otherwise give the plain brand name):
${facts.vendors.join(' | ') || '(none found)'}

RULES
- Plain UK English. Short sentences. No hype, no exclamation marks.
- Write your own wording. Do not copy sentences from the notes.
- Only state what the notes support. Never invent ingredients, sizes, results, awards or reviews. No medical or hair-growth promises.
- Title: Brand + product name + size, in Title Case, under 90 characters. Do NOT put a colour, shade or length in the title when the product has options.
- description_html: 2 short paragraphs then a "How to use" paragraph only if the notes say how. Use <p> and, if useful, one <ul>. End with: <p>Order online for UK delivery, or visit CC Hair &amp; Beauty in Chapeltown, Roundhay or Leeds City Centre.</p>
- seo_title: under 60 characters, no shop name. seo_description: 120 to 155 characters.
- image_alt: what the picture shows, under 100 characters, e.g. "Cantu Shea Butter Edge Stay Gel 2.25 oz jar".
- tags: 3 to 6 short lower-case tags (brand, product kind, hair or skin concern).

Reply with ONLY a JSON object with these keys: title, vendor, product_type, description_html, seo_title, seo_description, image_alt, tags.`
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
    })
    const j = await r.json()
    const text = ((j.content || [])[0] || {}).text || ''
    const m = text.match(/\{[\s\S]*\}/)
    if (!m) return null
    const o = JSON.parse(m[0])
    if (!o.title) return null
    return {
      title: String(o.title).slice(0, 200), vendor: String(o.vendor || '').slice(0, 100), product_type: String(o.product_type || '').slice(0, 100),
      description_html: String(o.description_html || ''), seo_title: String(o.seo_title || '').slice(0, 70), seo_description: String(o.seo_description || '').slice(0, 320),
      image_alt: String(o.image_alt || '').slice(0, 200), tags: (Array.isArray(o.tags) ? o.tags : []).map(t => String(t).slice(0, 40)).slice(0, 8),
    }
  } catch (e) { return null }
}

// Only requests that come from this app's own pages are accepted by the routes that change the shop.
export function sameSite(req) {
  const host = String(req.headers.host || '')
  const from = String(req.headers.origin || req.headers.referer || '')
  if (!from) return false
  try { return new URL(from).host === host } catch (e) { return false }
}
