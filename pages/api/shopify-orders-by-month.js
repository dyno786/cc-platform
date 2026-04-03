export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  const { year, month } = req.query
  if (!year || !month) return res.status(400).json({ ok: false, error: 'Missing year or month' })

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }

  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

  try {
    const r = await fetch(
      `https://${shop}/admin/api/2024-01/orders.json?status=any&created_at_min=${startDate.toISOString()}&created_at_max=${endDate.toISOString()}&limit=250&fields=id,name,email,phone,created_at,financial_status,fulfillment_status,total_price,customer,line_items,fulfillments`,
      { headers }
    )
    const d = await r.json()
    const orders = (d.orders || []).map(o => ({
      id: o.id,
      name: o.name,
      email: o.email || o.customer?.email || '',
      phone: o.phone || o.customer?.phone || '',
      customer: [o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(' ') || 'Customer',
      total: `£${parseFloat(o.total_price).toFixed(2)}`,
      totalRaw: parseFloat(o.total_price),
      createdAt: o.created_at,
      financialStatus: o.financial_status,
      fulfillmentStatus: o.fulfillment_status || 'unfulfilled',
      items: o.line_items?.map(i => i.title).join(', ') || '',
      trackingNumber: o.fulfillments?.[0]?.tracking_number || null,
      trackingCompany: o.fulfillments?.[0]?.tracking_company || null,
      trackingUrl: o.fulfillments?.[0]?.tracking_url || null,
      fulfilled: !!o.fulfillments?.length,
      adminUrl: `https://admin.shopify.com/store/cchairandbeauty/orders/${o.id}`,
    }))

    res.status(200).json({ ok: true, orders, count: orders.length, month: `${year}-${month}` })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
