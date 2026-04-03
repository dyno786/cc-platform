export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { handle, metaTitle, metaDesc } = req.body
  if (!handle || !metaTitle) return res.status(400).json({ ok: false, error: 'Missing handle or metaTitle' })

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  const base = `https://${shop}/admin/api/2024-01`

  try {
    // Find collection by handle
    const r = await fetch(`${base}/collections.json?handle=${handle}&limit=1`, { headers })
    const d = await r.json()
    let collection = d.collections?.[0]

    // Try custom_collections if not found
    if (!collection) {
      const r2 = await fetch(`${base}/custom_collections.json?handle=${handle}&limit=1`, { headers })
      const d2 = await r2.json()
      collection = d2.custom_collections?.[0]
    }

    if (!collection) return res.status(200).json({ ok: false, error: `Collection not found: ${handle}` })

    // Determine if smart or custom collection
    const collType = collection.rules ? 'smart_collections' : 'custom_collections'

    // Update SEO fields
    const updateRes = await fetch(`${base}/${collType}/${collection.id}.json`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        [collType.slice(0,-1)]: {
          id: collection.id,
          metafields_global_title_tag: metaTitle,
          metafields_global_description_tag: metaDesc || '',
        }
      })
    })
    const updateData = await updateRes.json()
    if (updateData.errors) return res.status(200).json({ ok: false, error: JSON.stringify(updateData.errors) })

    console.log(`[update-collection-seo] Updated: ${handle} → "${metaTitle}"`)
    res.status(200).json({ ok: true, id: collection.id, handle, metaTitle })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
