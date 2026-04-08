export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { handle, seoTitle, metaDesc } = req.body
  if (!handle || !seoTitle) return res.status(400).json({ ok: false, error: 'Missing handle or seoTitle' })

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  const base = `https://${shop}/admin/api/2024-01`

  try {
    // Try custom collection first
    let colId = null, colType = null
    const r1 = await fetch(`${base}/custom_collections.json?handle=${handle}&limit=1&fields=id`, { headers })
    const d1 = await r1.json()
    if (d1.custom_collections?.[0]) { colId = d1.custom_collections[0].id; colType = 'custom_collections' }

    if (!colId) {
      const r2 = await fetch(`${base}/smart_collections.json?handle=${handle}&limit=1&fields=id`, { headers })
      const d2 = await r2.json()
      if (d2.smart_collections?.[0]) { colId = d2.smart_collections[0].id; colType = 'smart_collections' }
    }

    if (!colId) return res.status(200).json({ ok: false, error: `Collection not found: ${handle}` })

    // Update SEO via metafields
    const body = { [colType.replace('s','')]: { id: colId, metafields_global_title_tag: seoTitle, metafields_global_description_tag: metaDesc || '' } }
    const ur = await fetch(`${base}/${colType}/${colId}.json`, { method: 'PUT', headers, body: JSON.stringify(body) })
    const ud = await ur.json()

    if (ud.custom_collection || ud.smart_collection) {
      res.status(200).json({ ok: true, handle, seoTitle, adminUrl: `https://admin.shopify.com/store/cchairandbeauty/collections/${colId}` })
    } else {
      res.status(200).json({ ok: false, error: JSON.stringify(ud).slice(0,200) })
    }
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
