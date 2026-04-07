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
      `https://${shop}/admin/api/2024-01/orders.json?status=any&created_at_min=${startDate.toISOString()}&created_at_max=${endDate.toISOString()}&limit=250&fields=id,name,email,phone,created_at,financial_status,fulfillment_status,total_price,customer,line_items,fulfillments,shipping_address`,
      { headers }
    )
    const d = await r.json()

    // Also get order count per customer email for the year
    const customerEmails = [...new Set((d.orders||[]).map(o => o.email || o.customer?.email).filter(Boolean))]

    const orders = await Promise.all((d.orders || []).map(async o => {
      const lineItems = o.line_items || []

      // Check stock per line item
      const itemsWithStock = await Promise.all(lineItems.map(async item => {
        let inStock = true
        try {
          if (item.variant_id) {
            const vr = await fetch(
              `https://${shop}/admin/api/2024-01/variants/${item.variant_id}.json?fields=id,inventory_quantity`,
              { headers }
            )
            const vd = await vr.json()
            const qty = vd.variant?.inventory_quantity ?? 1
            inStock = qty > 0
          }
        } catch(e) {}
        return { title: item.title, variantId: item.variant_id, productId: item.product_id, inStock }
      }))

      const fulfillment = o.fulfillments?.[0]
      const trackingNumber = fulfillment?.tracking_number || null
      const trackingCompany = fulfillment?.tracking_company || 'Royal Mail'
      const trackingUrl = fulfillment?.tracking_url ||
        (trackingNumber ? `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}` : null)

      // Postcode from shipping address
      const postcode = o.shipping_address?.zip || o.shipping_address?.postal_code || o.customer?.default_address?.zip || null

      const inStock = itemsWithStock.filter(i => i.inStock)
      const outOfStock = itemsWithStock.filter(i => !i.inStock)

      // Check if order was refunded
      const isRefunded = o.financial_status === 'refunded' || o.financial_status === 'partially_refunded'
      const isDispatched = o.fulfillment_status === 'fulfilled' || (o.fulfillments && o.fulfillments.length > 0)

      return {
        id: o.id,
        name: o.name,
        email: o.email || o.customer?.email || '',
        phone: o.phone || o.customer?.phone || '',
        customer: [o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(' ') || 'Customer',
        total: `£${parseFloat(o.total_price).toFixed(2)}`,
        totalRaw: parseFloat(o.total_price),
        createdAt: o.created_at,
        fulfillmentStatus: o.fulfillment_status || 'unfulfilled',
        financialStatus: o.financial_status,
        isRefunded,
        isDispatched,
        items: lineItems.map(i => i.title).join(', '),
        lineItems: itemsWithStock,
        inStockItems: inStock,
        outOfStockItems: outOfStock,
        anyOutOfStock: outOfStock.length > 0,
        canReorder: inStock.length > 0,
        trackingNumber,
        trackingCompany,
        trackingUrl,
        postcode,
        fulfilled: !!o.fulfillments?.length,
        adminUrl: `https://admin.shopify.com/store/cchairandbeauty/orders/${o.id}`,
      }
    }))

    // Get order counts per customer for the current year
    const yearStart = new Date(parseInt(year), 0, 1)
    const yearEnd = new Date(parseInt(year), 11, 31, 23, 59, 59)
    const orderCounts = {}
    try {
      const cr = await fetch(
        `https://${shop}/admin/api/2024-01/orders.json?status=any&created_at_min=${yearStart.toISOString()}&created_at_max=${yearEnd.toISOString()}&limit=250&fields=id,email,customer`,
        { headers }
      )
      const cd = await cr.json()
      ;(cd.orders || []).forEach(o => {
        const email = o.email || o.customer?.email
        if (email) orderCounts[email] = (orderCounts[email] || 0) + 1
      })
    } catch(e) {}

    // Attach order count to each order
    orders.forEach(o => {
      o.orderCountThisYear = orderCounts[o.email] || 1
    })

    res.status(200).json({ ok: true, orders, count: orders.length })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message, orders: [] })
  }
}
