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

    const orders = await Promise.all((d.orders || []).map(async o => {
      const lineItems = o.line_items || []

      // Check stock for each line item variant
      const itemsWithStock = await Promise.all(lineItems.map(async item => {
        let inStock = true
        let inventoryQty = null
        try {
          if (item.variant_id) {
            const vr = await fetch(
              `https://${shop}/admin/api/2024-01/variants/${item.variant_id}.json?fields=id,inventory_quantity,product_id`,
              { headers }
            )
            const vd = await vr.json()
            inventoryQty = vd.variant?.inventory_quantity ?? null
            inStock = inventoryQty === null || inventoryQty > 0
          }
        } catch(e) {}
        return {
          title: item.title,
          variantId: item.variant_id,
          productId: item.product_id,
          productHandle: item.handle || null,
          quantity: item.quantity,
          price: item.price,
          inStock,
          inventoryQty,
        }
      }))

      const fulfillment = o.fulfillments?.[0]
      const trackingNumber = fulfillment?.tracking_number || null
      const trackingCompany = fulfillment?.tracking_company || 'Royal Mail'
      const trackingUrl = fulfillment?.tracking_url ||
        (trackingNumber ? `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}` : null)

      const allInStock = itemsWithStock.every(i => i.inStock)
      const anyOutOfStock = itemsWithStock.some(i => !i.inStock)

      return {
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
        items: lineItems.map(i => i.title).join(', '),
        lineItems: itemsWithStock,
        allInStock,
        anyOutOfStock,
        trackingNumber,
        trackingCompany,
        trackingUrl,
        fulfilled: !!o.fulfillments?.length,
        adminUrl: `https://admin.shopify.com/store/cchairandbeauty/orders/${o.id}`,
      }
    }))

    res.status(200).json({ ok: true, orders, count: orders.length })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message, orders: [] })
  }
}
