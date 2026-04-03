export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { handle, collectionId, metaTitle, metaDesc } = req.body
  if (!handle || !metaTitle) return res.status(400).json({ ok: false, error: 'Missing handle or metaTitle' })

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  const base = `https://${shop}/admin/api/2024-01`

  try {
    let collection = null
    let collType = 'custom_collections'

    if (collectionId) {
      // Try direct lookup by ID — much faster and reliable
      const r1 = await fetch(`${base}/custom_collections/${collectionId}.json`, { headers })
      if (r1.ok) {
        const d1 = await r1.json()
        collection = d1.custom_collection
        collType = 'custom_collections'
      }
      if (!collection) {
        const r2 = await fetch(`${base}/smart_collections/${collectionId}.json`, { headers })
        if (r2.ok) {
          const d2 = await r2.json()
          collection = d2.smart_collection
          collType = 'smart_collections'
        }
      }
    }

    if (!collection) {
      // Fallback: search by handle
      const r3 = await fetch(`${base}/custom_collections.json?handle=${handle}&limit=1`, { headers })
      const d3 = await r3.json()
      collection = d3.custom_collections?.[0]
      collType = 'custom_collections'
    }
    if (!collection) {
      const r4 = await fetch(`${base}/smart_collections.json?handle=${handle}&limit=1`, { headers })
      const d4 = await r4.json()
      collection = d4.smart_collections?.[0]
      collType = 'smart_collections'
    }

    if (!collection) return res.status(200).json({ ok: false, error: `Collection not found: ${handle} (ID: ${collectionId})` })

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
