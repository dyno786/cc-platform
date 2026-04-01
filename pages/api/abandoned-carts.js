export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  const store   = process.env.SHOPIFY_STORE
  const token   = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token }
  const since   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const [cartsRes, ordersRes] = await Promise.all([
      fetch(`https://${store}/admin/api/2024-01/checkouts.json?created_at_min=${since}&limit=50`, { headers }),
      fetch(`https://${store}/admin/api/2024-01/orders.json?status=any&created_at_min=${since}&limit=50&fields=id,name,email,total_price,created_at,fulfillment_status,customer`, { headers }),
    ])

    const [cartsData, ordersData] = await Promise.all([
      cartsRes.json(), ordersRes.json()
    ])

    const abandonedCarts = (cartsData.checkouts || [])
      .map(c => ({
        id:                  c.id,
        email:               c.email || '',
        total:               '£' + parseFloat(c.total_price || 0).toFixed(2),
        totalRaw:            parseFloat(c.total_price || 0),
        createdAt:           c.created_at,
        customer:            c.customer ? (c.customer.first_name + ' ' + c.customer.last_name).trim() : (c.email || 'Unknown'),
        phone:               c.customer?.phone || null,
        items:               (c.line_items || []).slice(0, 3).map(i => i.title).join(', '),
        itemCount:           (c.line_items || []).length,
        abandonedHoursAgo:   Math.round((Date.now() - new Date(c.created_at)) / 3600000),
      }))
      .filter(c => c.totalRaw > 0)
      .sort((a, b) => b.totalRaw - a.totalRaw)

    const reviewEligible = (ordersData.orders || [])
      .filter(o => o.fulfillment_status === 'fulfilled')
      .map(o => ({
        id:                  o.id,
        name:                o.name,
        email:               o.email || '',
        customer:            o.customer ? (o.customer.first_name + ' ' + o.customer.last_name).trim() : 'Customer',
        phone:               o.customer?.phone || null,
        total:               '£' + parseFloat(o.total_price || 0).toFixed(2),
        daysSinceFulfilled:  Math.round((Date.now() - new Date(o.created_at)) / 86400000),
      }))
      .filter(o => o.daysSinceFulfilled >= 7)
      .slice(0, 20)

    res.status(200).json({
      ok: true,
      abandonedCarts,
      totalAbandoned:      abandonedCarts.length,
      totalAbandonedValue: '£' + abandonedCarts.reduce((s, c) => s + c.totalRaw, 0).toFixed(0),
      reviewEligible,
    })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
