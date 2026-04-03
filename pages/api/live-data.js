export const config = { maxDuration: 60 }

// Single endpoint that fetches ALL live data in one call
// Used by Overview, Organic SEO, Local SEO, Shopify tabs
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { source } = req.query

  try {
    if (source === 'shopify') {
      const shop = process.env.SHOPIFY_STORE_URL
      const token = process.env.SHOPIFY_ACCESS_TOKEN
      const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }

      // Parallel fetch everything
      const [ordersToday, ordersWeek, ordersMonth, products, abandoned] = await Promise.all([
        fetch(`https://${shop}/admin/api/2024-01/orders.json?status=any&created_at_min=${new Date(new Date().setHours(0,0,0,0)).toISOString()}&limit=50`, { headers }),
        fetch(`https://${shop}/admin/api/2024-01/orders.json?status=any&created_at_min=${new Date(Date.now()-7*86400000).toISOString()}&limit=250`, { headers }),
        fetch(`https://${shop}/admin/api/2024-01/orders.json?status=any&created_at_min=${new Date(Date.now()-30*86400000).toISOString()}&limit=250`, { headers }),
        fetch(`https://${shop}/admin/api/2024-01/products/count.json`, { headers }),
        fetch(`https://${shop}/admin/api/2024-01/checkouts.json?limit=50`, { headers }),
      ])

      const [ot, ow, om, pc, ab] = await Promise.all([
        ordersToday.json(), ordersWeek.json(), ordersMonth.json(), products.json(), abandoned.json()
      ])

      const calcRevenue = (orders) => orders.orders?.reduce((s, o) => s + parseFloat(o.total_price || 0), 0) || 0
      const todayRev = calcRevenue(ot)
      const weekRev = calcRevenue(ow)
      const monthRev = calcRevenue(om)

      res.status(200).json({
        ok: true,
        productCount: pc.count || 0,
        today: { revenue: todayRev, orders: ot.orders?.length || 0, formatted: `£${todayRev.toFixed(0)}` },
        week: { revenue: weekRev, orders: ow.orders?.length || 0, formatted: `£${weekRev.toFixed(0)}` },
        month: { revenue: monthRev, orders: om.orders?.length || 0, formatted: `£${monthRev.toFixed(0)}` },
        recentOrders: (ot.orders || []).slice(0, 5).map(o => ({
          id: o.id, name: o.name, total: `£${parseFloat(o.total_price).toFixed(2)}`,
          status: o.financial_status, created: o.created_at,
          customer: `${o.customer?.first_name || ''} ${o.customer?.last_name || ''}`.trim(),
          items: o.line_items?.[0]?.title || '',
        })),
        abandonedCount: ab.checkouts?.length || 0,
        abandonedValue: ab.checkouts?.reduce((s, c) => s + parseFloat(c.total_price || 0), 0).toFixed(2) || '0',
      })

    } else if (source === 'searchconsole') {
      const base = 'https://www.googleapis.com/webmasters/v3'
      const site = 'sc-domain:cchairandbeauty.com'

      // Get access token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        })
      })
      const { access_token } = await tokenRes.json()

      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

      // Fetch keywords and pages in parallel
      const [kwRes, pageRes, summaryRes] = await Promise.all([
        fetch(`${base}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate, endDate, dimensions: ['query'], rowLimit: 100, startRow: 0 })
        }),
        fetch(`${base}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate, endDate, dimensions: ['page'], rowLimit: 25 })
        }),
        fetch(`${base}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate, endDate, dimensions: ['date'], rowLimit: 90 })
        }),
      ])

      const [kwData, pageData, summaryData] = await Promise.all([
        kwRes.json(), pageRes.json(), summaryRes.json()
      ])

      const keywords = (kwData.rows || []).map(r => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: (r.ctr * 100).toFixed(1) + '%',
        position: parseFloat(r.position.toFixed(1)),
      }))

      const pages = (pageData.rows || []).map(r => ({
        page: r.keys[0].replace('https://cchairandbeauty.com', ''),
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: (r.ctr * 100).toFixed(1) + '%',
        position: parseFloat(r.position.toFixed(1)),
      }))

      const totals = (summaryData.rows || []).reduce((acc, r) => ({
        clicks: acc.clicks + r.clicks,
        impressions: acc.impressions + r.impressions,
      }), { clicks: 0, impressions: 0 })

      const avgPos = keywords.length ? (keywords.reduce((s, k) => s + k.position, 0) / keywords.length).toFixed(1) : 0
      const avgCtr = keywords.length ? (keywords.reduce((s, k) => s + parseFloat(k.ctr), 0) / keywords.length).toFixed(1) : 0

      // Find quick wins - pos 4-15 with high impressions
      const quickWins = keywords
        .filter(k => k.position >= 4 && k.position <= 15 && k.impressions > 200)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 10)
        .map(k => ({
          ...k,
          potentialClicks: Math.round((k.impressions * 0.03) - k.clicks),
        }))

      res.status(200).json({
        ok: true, live: true,
        period: `${startDate} to ${endDate}`,
        totals: { ...totals, avgPosition: avgPos, avgCtr: avgCtr + '%' },
        keywords: keywords.slice(0, 50),
        pages: pages.slice(0, 20),
        quickWins,
      })

    } else if (source === 'gbp') {
      const key = process.env.GOOGLE_PLACES_KEY
      // Search for each branch
      const branches = [
        { name: 'Chapeltown', query: 'CC Hair and Beauty Chapeltown Leeds' },
        { name: 'Roundhay', query: 'CC Hair and Beauty Roundhay Leeds' },
        { name: 'City Centre', query: 'CC Hair and Beauty New York Street Leeds' },
      ]

      const results = await Promise.all(branches.map(async (b) => {
        const searchRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(b.query)}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total,formatted_address&key=${key}`
        )
        const data = await searchRes.json()
        const place = data.candidates?.[0]
        return {
          name: b.name,
          placeId: place?.place_id,
          rating: place?.rating,
          reviewCount: place?.user_ratings_total,
          address: place?.formatted_address,
          reviewLink: place?.place_id ? `https://search.google.com/local/writereview?placeid=${place.place_id}` : null,
        }
      }))

      res.status(200).json({ ok: true, branches: results })

    } else if (source === 'shopify-collections') {
      const shop = process.env.SHOPIFY_STORE_URL
      const token = process.env.SHOPIFY_ACCESS_TOKEN
      const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }

      const res2 = await fetch(
        `https://${shop}/admin/api/2024-01/custom_collections.json?limit=50&fields=id,title,handle,products_count,published_at`,
        { headers }
      )
      const data = await res2.json()

      const collections = (data.custom_collections || []).map(c => ({
        id: c.id,
        name: c.title,
        handle: c.handle,
        productCount: c.products_count,
        published: !!c.published_at,
        shopifyAdminLink: `https://admin.shopify.com/store/cchairnbeauty/collections/${c.id}`,
      }))

      res.status(200).json({ ok: true, collections })
    } else {
      res.status(400).json({ ok: false, error: 'Invalid source' })
    }
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
