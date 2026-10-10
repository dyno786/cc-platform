// Add products, step 2: save the scanned product in Shopify as a DRAFT.
// Nothing made here is visible to customers until someone publishes it in Shopify.
// No price and no stock are set: the daily data file fills those in by barcode.
import { cleanBarcode, gql, ourTypes, vendorsLike, writeListing, policyFlag, sameSite, stripHtml } from '../../lib/intake'

export const config = { maxDuration: 60 }

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const tidy = s => String(s || '').replace(/\s+/g, ' ').trim()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(200).json({ ok: false, error: 'Use the Add products page.' })
  if (!sameSite(req)) return res.status(200).json({ ok: false, error: 'This can only be used from the Add products page.' })
  try {
    const b = req.body || {}
    const sources = (Array.isArray(b.sources) ? b.sources : []).slice(0, 4).map(s => ({ shop: tidy(s.shop).slice(0, 80), title: tidy(s.title).slice(0, 200), brand: tidy(s.vendor).slice(0, 100), category: tidy(s.type).slice(0, 100), description: stripHtml(s.description).slice(0, 1500), option: tidy(s.variantTitle).slice(0, 80) }))
    const staff = { name: tidy(b.name).slice(0, 200), brand: tidy(b.brand).slice(0, 100) }
    const optionNames = (Array.isArray(b.optionNames) ? b.optionNames : []).map(n => tidy(n).slice(0, 30)).filter(Boolean).slice(0, 2)
    const hasOptions = optionNames.length > 0
    let variants = []
    if (hasOptions) {
      const seen = new Set()
      for (const v of (Array.isArray(b.variants) ? b.variants : []).slice(0, 100)) {
        const values = (Array.isArray(v.values) ? v.values : []).map(x => tidy(x).slice(0, 60))
        const barcode = cleanBarcode(v.barcode)
        if (values.length !== optionNames.length || values.some(x => !x) || barcode.length < 6) continue
        const k = values.join('|').toLowerCase()
        if (seen.has(k)) continue
        seen.add(k); variants.push({ values, barcode })
      }
      if (!variants.length) return res.status(200).json({ ok: false, error: 'Add at least one option with its barcode.' })
    } else {
      const barcode = cleanBarcode(b.barcode)
      if (barcode.length < 6) return res.status(200).json({ ok: false, error: 'The barcode is missing.' })
      variants = [{ values: [], barcode }]
    }
    const codes = variants.map(v => v.barcode)
    const dupe = codes.find((c, i) => codes.indexOf(c) !== i)
    if (dupe) return res.status(200).json({ ok: false, error: 'Barcode ' + dupe + ' is on two options. Each option needs its own barcode.' })
    if (!sources.length && !staff.name) return res.status(200).json({ ok: false, error: 'Type the product name, because no other shop had this barcode.' })

    // none of these barcodes may already be in our shop
    for (let i = 0; i < codes.length; i += 20) {
      const chunk = codes.slice(i, i + 20)
      const d = await gql('query($q: String!) { productVariants(first: 50, query: $q) { nodes { barcode product { title } } } }', { q: chunk.map(c => 'barcode:' + c).join(' OR ') })
      const hit = (d.productVariants.nodes || []).find(n => chunk.includes(cleanBarcode(n.barcode)))
      if (hit) return res.status(200).json({ ok: false, error: 'Barcode ' + cleanBarcode(hit.barcode) + ' is already in the shop on "' + hit.product.title + '". Take it off the list and try again.' })
    }

    const rawTitle = staff.name || sources[0].title
    const flagged = policyFlag(rawTitle + ' ' + sources.map(s => s.title + ' ' + s.description).join(' '))
    let listing = null
    if (!flagged) {
      const [types, vendors] = await Promise.all([ourTypes().catch(() => []), vendorsLike(staff.brand || (sources[0] || {}).brand, rawTitle).catch(() => [])])
      listing = await writeListing({ sources, staff: { ...staff, has_options: hasOptions, option_names: optionNames }, types, vendors })
      if (listing && types.length && !types.includes(listing.product_type)) { const t = types.find(x => x.toLowerCase() === listing.product_type.toLowerCase()); if (t) listing.product_type = t }
    }
    const written = !!listing
    if (!listing) listing = { title: rawTitle, vendor: staff.brand || (sources[0] || {}).brand || '', product_type: '', description_html: flagged ? '' : '<p>' + esc(rawTitle) + '.</p>', seo_title: '', seo_description: '', image_alt: rawTitle, tags: [] }

    const tags = [...new Set([...listing.tags, 'intake', hasOptions ? 'intake-needs-photos' : '', flagged ? 'policy-check' : '', written || flagged ? '' : 'intake-needs-wording'].filter(Boolean))]
    const images = (Array.isArray(b.images) ? b.images : []).map(u => String(u || '')).filter(u => /^https:\/\/[^\s"'<>]+$/.test(u) && u.length < 600).slice(0, 6)
    const product = { title: listing.title, descriptionHtml: listing.description_html, vendor: listing.vendor, productType: listing.product_type, tags, status: 'DRAFT' }
    if (listing.seo_title || listing.seo_description) product.seo = { title: listing.seo_title, description: listing.seo_description }
    if (hasOptions) product.productOptions = optionNames.map((name, i) => ({ name, values: [...new Set(variants.map(v => v.values[i]))].map(x => ({ name: x })) }))
    const media = images.map((u, i) => ({ originalSource: u, alt: (listing.image_alt || listing.title) + (i ? ' (' + (i + 1) + ')' : ''), mediaContentType: 'IMAGE' }))

    const c = await gql('mutation($product: ProductCreateInput!, $media: [CreateMediaInput!]) { productCreate(product: $product, media: $media) { product { id handle title status variants(first: 1) { nodes { id } } } userErrors { field message } } }', { product, media })
    const ce = c.productCreate.userErrors || []
    if (ce.length || !c.productCreate.product) return res.status(200).json({ ok: false, error: 'Shopify would not save it: ' + (ce.map(e => e.message).join('; ') || 'no reason given') })
    const p = c.productCreate.product
    let made = []
    let warn = ''
    if (hasOptions) {
      const input = variants.map(v => ({ barcode: v.barcode, optionValues: v.values.map((x, i) => ({ optionName: optionNames[i], name: x })) }))
      const v = await gql('mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: REMOVE_STANDALONE_VARIANT) { productVariants { id title barcode } userErrors { field message } } }', { productId: p.id, variants: input })
      const ve = v.productVariantsBulkCreate.userErrors || []
      made = v.productVariantsBulkCreate.productVariants || []
      if (ve.length) warn = 'The product was saved, but some options were not: ' + ve.map(e => e.message).join('; ')
    } else {
      const v = await gql('mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id title barcode } userErrors { field message } } }', { productId: p.id, variants: [{ id: p.variants.nodes[0].id, barcode: variants[0].barcode }] })
      const ve = v.productVariantsBulkUpdate.userErrors || []
      made = v.productVariantsBulkUpdate.productVariants || []
      if (ve.length) warn = 'The product was saved, but the barcode was not: ' + ve.map(e => e.message).join('; ')
    }
    const num = p.id.split('/').pop()
    return res.status(200).json({
      ok: true, productId: p.id, title: p.title, vendor: listing.vendor, type: listing.product_type, status: 'Draft', images: images.length,
      adminUrl: 'https://' + process.env.SHOPIFY_STORE + '/admin/products/' + num, options: made.length && hasOptions ? made.length : 0,
      written, flagged, warn,
    })
  } catch (e) {
    return res.status(200).json({ ok: false, error: e && e.message ? e.message : 'Something went wrong.' })
  }
}
