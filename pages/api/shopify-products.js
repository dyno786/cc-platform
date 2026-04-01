export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  const store   = process.env.SHOPIFY_STORE
  const token   = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token }
  const { type = 'products', limit = 30 } = req.query

  try {
    const url = type === 'collections'
      ? `https://${store}/admin/api/2024-01/custom_collections.json?limit=${limit}&fields=id,title,handle,published_at,updated_at`
      : `https://${store}/admin/api/2024-01/products.json?limit=${limit}&fields=id,title,handle,product_type,tags,images,published_at,status&order=created_at+desc`

    const r = await fetch(url, { headers })
    const d = await r.json()
    res.status(200).json({ ok: true, data: d.products || d.custom_collections || [] })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
