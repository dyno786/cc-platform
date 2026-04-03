export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  const base = `https://${shop}/admin/api/2024-01`

  try {
    // Fetch ALL collections across both types with pagination
    const allCollections = []

    // Custom collections
    let url = `${base}/custom_collections.json?limit=250&fields=id,title,handle`
    while (url) {
      const r = await fetch(url, { headers })
      const d = await r.json()
      allCollections.push(...(d.custom_collections || []).map(c => ({...c, type:'custom'})))
      const link = r.headers.get('link') || ''
      const next = link.match(/<([^>]+)>;\s*rel="next"/)
      url = next ? next[1] : null
    }

    // Smart collections
    let url2 = `${base}/smart_collections.json?limit=250&fields=id,title,handle`
    while (url2) {
      const r = await fetch(url2, { headers })
      const d = await r.json()
      allCollections.push(...(d.smart_collections || []).map(c => ({...c, type:'smart'})))
      const link = r.headers.get('link') || ''
      const next = link.match(/<([^>]+)>;\s*rel="next"/)
      url2 = next ? next[1] : null
    }

    // Map to clean format with correct admin URLs
    const collections = allCollections.map(c => ({
      id: c.id,
      name: c.title,
      handle: c.handle,
      type: c.type,
      adminUrl: `https://admin.shopify.com/store/cchairandbeauty/collections/${c.id}`,
      storeUrl: `https://cchairandbeauty.com/collections/${c.handle}`,
    }))

    console.log(`[shopify-collections-search] Found ${collections.length} total collections`)
    res.status(200).json({ ok: true, count: collections.length, collections })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
