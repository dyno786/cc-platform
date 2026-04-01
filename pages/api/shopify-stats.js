export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  const store = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const base = `https://${store}/admin/api/2024-01`
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }

  try {
    // Today's date range
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString()

    // Run all fetches in parallel
    const [
      todayOrdersRes,
      weekOrdersRes,
      monthOrdersRes,
      yearOrdersRes,
      productCountRes,
      recentOrdersRes,
    ] = await Promise.all([
      fetch(`${base}/orders.json?status=any&created_at_min=${todayStart}&fields=total_price,financial_status&limit=250`, { headers }),
      fetch(`${base}/orders.json?status=any&created_at_min=${weekStart}&fields=total_price,financial_status&limit=250`, { headers }),
      fetch(`${base}/orders.json?status=any&created_at_min=${monthStart}&fields=total_price,financial_status&limit=250`, { headers }),
      fetch(`${base}/orders.json?status=any&created_at_min=${yearStart}&fields=total_price,financial_status&limit=250`, { headers }),
      fetch(`${base}/products/count.json`, { headers }),
      fetch(`${base}/orders.json?status=any&limit=5&fields=id,name,total_price,created_at,financial_status,line_items,customer`, { headers }),
    ])

    const [todayData, weekData, monthData, yearData, countData, recentData] = await Promise.all([
      todayOrdersRes.json(),
      weekOrdersRes.json(),
      monthOrdersRes.json(),
      yearOrdersRes.json(),
      productCountRes.json(),
      recentOrdersRes.json(),
    ])

    function sumOrders(orders) {
      if (!orders) return { revenue: 0, count: 0 }
      return {
        revenue: orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0),
        count: orders.length,
      }
    }

    const today = sumOrders(todayData.orders)
    const week = sumOrders(weekData.orders)
    const month = sumOrders(monthData.orders)
    const year = sumOrders(yearData.orders)

    res.status(200).json({
      ok: true,
      productCount: countData.count || 0,
      periods: {
        today: {
          revenue: today.revenue.toFixed(2),
          revenueFormatted: '£' + today.revenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
          orders: today.count,
        },
        week: {
          revenue: week.revenue.toFixed(2),
          revenueFormatted: '£' + week.revenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
          orders: week.count,
        },
        month: {
          revenue: month.revenue.toFixed(2),
          revenueFormatted: '£' + month.revenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
          orders: month.count,
        },
        year: {
          revenue: year.revenue.toFixed(2),
          revenueFormatted: '£' + year.revenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
          orders: year.count,
        },
      },
      recentOrders: (recentData.orders || []).map(o => ({
        id: o.id,
        name: o.name,
        total: '£' + parseFloat(o.total_price).toFixed(2),
        status: o.financial_status,
        created: o.created_at,
        customer: o.customer ? (o.customer.first_name + ' ' + o.customer.last_name).trim() : 'Guest',
        items: (o.line_items || []).slice(0, 2).map(i => i.title).join(', '),
      })),
    })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
