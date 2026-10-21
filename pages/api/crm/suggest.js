// Product suggestions: new arrivals matched to the customers who buy that brand, and cross-sell counts.
//   GET  /api/crm/suggest
//   POST /api/crm/suggest { tag: 'crm-new-cantu', customerIds: [...] }   tags those customers in Shopify so a Shopify Email segment can target them
import { getJSON, PATHS } from '../../../lib/crm/store'
import { customerView } from '../../../lib/crm/engine'
import { CROSS_SELL, catByKey } from '../../../lib/crm/rules'
import { gql } from '../../../lib/intake'

export const config = { maxDuration: 60 }
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { tag, customerIds } = req.body || {}
      if (!tag || !Array.isArray(customerIds) || !customerIds.length) return res.status(400).json({ ok: false, error: 'tag and customerIds needed' })
      let done = 0
      for (let i = 0; i < customerIds.length; i += 25) {
        const chunk = customerIds.slice(i, i + 25)
        const m = chunk.map((id, k) => `t${k}: tagsAdd(id:"${id}", tags:["${tag}"]){ userErrors{ message } }`).join(' ')
        await gql('mutation{ ' + m + ' }'); done += chunk.length
      }
      return res.status(200).json({ ok: true, tagged: done, segmentQuery: `email_subscription_status = 'SUBSCRIBED' AND customer_tags CONTAINS '${tag}'` })
    }
    const snap = await getJSON(PATHS.snapshot, null)
    if (!snap) return res.status(200).json({ ok: false, pending: true, error: 'No data yet. Run the first sync from Settings.' })
    const now = Date.now()
    const views = Object.values(snap.customers).map(c => customerView(c, snap.orders, now)).filter(v => v.orders.length)
    // brand -> customers
    const brandCustomers = {}
    for (const v of views) for (const b of v.brands) (brandCustomers[b] = brandCustomers[b] || []).push({ id: v.id, name: v.name, email: v.email, emailSub: v.emailSub, phone: v.phone })
    // new arrivals: active products created in the last 21 days with stock
    const since = new Date(now - 21 * 86400000).toISOString().slice(0, 10)
    const d = await gql(`{ products(first:50, query:"status:active AND created_at:>=${since}", sortKey:CREATED_AT, reverse:true){ nodes{ id title handle vendor productType totalInventory createdAt featuredImage{ url } priceRangeV2{ minVariantPrice{ amount } } } } }`)
    const newProducts = d.products.nodes.filter(p => p.totalInventory >= 3).map(p => {
      const vendor = (p.vendor || '').trim()
      const match = brandCustomers[vendor] || []
      return { id: p.id, title: p.title, handle: p.handle, vendor, type: p.productType, stock: p.totalInventory, createdAt: p.createdAt, image: p.featuredImage ? p.featuredImage.url : '', price: p.priceRangeV2 ? parseFloat(p.priceRangeV2.minVariantPrice.amount) : null,
        buyers: match.length, subscribed: match.filter(m => m.emailSub).length, withPhone: match.filter(m => m.phone).length, customerIds: match.filter(m => m.emailSub).map(m => m.id), tag: 'crm-new-' + slug(vendor || p.handle) }
    })
    // cross-sell counts: customers whose most recent category has a rule
    const cross = Object.entries(CROSS_SELL).map(([key, r]) => {
      const who = views.filter(v => v.cats[0] && v.cats[0].key === key)
      return { key, name: catByKey(key).name, title: r.title, items: r.items, customers: who.length, recent: who.filter(v => v.daysSinceOrder != null && v.daysSinceOrder <= 30).length }
    }).sort((a, b) => b.customers - a.customers)
    const topBrands = Object.entries(brandCustomers).map(([b, l]) => ({ brand: b, customers: l.length, subscribed: l.filter(x => x.emailSub).length })).sort((a, b) => b.customers - a.customers).slice(0, 25)
    res.status(200).json({ ok: true, newProducts, cross, topBrands })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
