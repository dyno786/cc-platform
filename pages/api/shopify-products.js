export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  const { q } = req.query
  if (!q) return res.status(400).json({ ok: false, error: 'Missing q' })

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }

  try {
    // Use Shopify search endpoint — searches title AND tags
    const r = await fetch(
      `https://${shop}/admin/api/2024-01/products.json?limit=6&fields=id,title,handle,images,variants&title=${encodeURIComponent(q)}`,
      { headers }
    )
    let data = await r.json()
    let products = data.products || []

    // If title search returns nothing, try a broader search via product listing
    if (products.length === 0) {
      const r2 = await fetch(
        `https://${shop}/admin/api/2024-01/products.json?limit=10&fields=id,title,handle,images,variants`,
        { headers }
      )
      const d2 = await r2.json()
      // Filter by keyword in title
      const kw = q.toLowerCase()
      products = (d2.products || []).filter(p =>
        p.title.toLowerCase().includes(kw) ||
        kw.split(' ').some(w => w.length > 3 && p.title.toLowerCase().includes(w))
      ).slice(0, 6)
    }

    const mapped = products.map(p => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      url: `https://cchairandbeauty.com/products/${p.handle}`,
      image: p.images?.[0]?.src || null,
      imageAlt: p.images?.[0]?.alt || p.title,
      price: p.variants?.[0]?.price || null,
    }))

    res.status(200).json({ ok: true, products: mapped, count: mapped.length })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message, products: [] })
  }
}
