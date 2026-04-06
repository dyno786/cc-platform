export const config = { maxDuration: 30 }

// Fetch existing SEO meta data for a collection from Shopify
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { handle } = req.query
  if (!handle) return res.status(400).json({ ok: false, error: 'Missing handle' })

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  const base = `https://${shop}/admin/api/2024-01`

  try {
    // Try custom collections first
    let collection = null
    let type = null

    const r1 = await fetch(`${base}/custom_collections.json?handle=${handle}&limit=1&fields=id,title,handle,body_html,metafields_global_title_tag,metafields_global_description_tag,image`, { headers })
    const d1 = await r1.json()
    if (d1.custom_collections?.[0]) { collection = d1.custom_collections[0]; type = 'custom' }

    if (!collection) {
      const r2 = await fetch(`${base}/smart_collections.json?handle=${handle}&limit=1&fields=id,title,handle,body_html,metafields_global_title_tag,metafields_global_description_tag,image`, { headers })
      const d2 = await r2.json()
      if (d2.smart_collections?.[0]) { collection = d2.smart_collections[0]; type = 'smart' }
    }

    if (!collection) return res.status(200).json({ ok: false, error: `Collection not found: ${handle}` })

    // Also fetch metafields for SEO title/description
    const mr = await fetch(`${base}/${type}_collections/${collection.id}/metafields.json`, { headers })
    const md = await mr.json()
    const metafields = md.metafields || []
    const seoTitle = metafields.find(m => m.key === 'title_tag')?.value || collection.metafields_global_title_tag || ''
    const seoDesc = metafields.find(m => m.key === 'description_tag')?.value || collection.metafields_global_description_tag || ''

    res.status(200).json({
      ok: true,
      id: collection.id,
      type,
      title: collection.title,
      handle: collection.handle,
      hasDescription: !!(collection.body_html && collection.body_html.replace(/<[^>]*>/g,'').trim().length > 10),
      descriptionLength: collection.body_html ? collection.body_html.replace(/<[^>]*>/g,'').trim().length : 0,
      currentSeoTitle: seoTitle,
      currentSeoDesc: seoDesc,
      adminUrl: `https://admin.shopify.com/store/cchairandbeauty/collections/${collection.id}`,
    })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
