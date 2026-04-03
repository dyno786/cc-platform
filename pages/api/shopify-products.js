export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { q } = req.query
  if (!q) return res.status(400).json({ ok: false, error: 'Missing search query' })

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }

  try {
    // Search products by title
    const r = await fetch(
      `https://${shop}/admin/api/2024-01/products.json?title=${encodeURIComponent(q)}&limit=6&fields=id,title,handle,images,variants`,
      { headers }
    )
    const data = await r.json()
    const products = (data.products || []).map(p => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      url: `https://cchairandbeauty.com/products/${p.handle}`,
      image: p.images?.[0]?.src || null,
      imageAlt: p.images?.[0]?.alt || p.title,
      price: p.variants?.[0]?.price || null,
    }))

    res.status(200).json({ ok: true, products })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message, products: [] })
  }
}
