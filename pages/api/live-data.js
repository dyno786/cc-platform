export const config = { maxDuration: 60 }

// Single endpoint that fetches ALL live data in one call
// Used by Overview, Organic SEO, Local SEO, Shopify tabs
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { source } = req.query

  try {
    if (source === 'shopify') {
      const shop = process.env.SHOPIFY_STORE
      const token = process.env.SHOPIFY_TOKEN
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
      const base = 'https://searchconsole.googleapis.com/webmasters/v3'
      const site = 'sc-domain%3Acchairandbeauty.com'

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

      // Fetch keywords (1000 rows), pages (50 rows), and content gap keywords in parallel
      const scHeaders = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' }
      const [kwRes, pageRes, gapRes] = await Promise.all([
        // Top keywords by clicks
        fetch(`${base}/sites/${site}/searchAnalytics/query`, {
          method: 'POST', headers: scHeaders,
          body: JSON.stringify({ startDate, endDate, dimensions: ['query'], rowLimit: 1000, startRow: 0 })
        }),
        // Top pages by clicks
        fetch(`${base}/sites/${site}/searchAnalytics/query`, {
          method: 'POST', headers: scHeaders,
          body: JSON.stringify({ startDate, endDate, dimensions: ['page'], rowLimit: 50 })
        }),
        // Content gaps — high impressions, low CTR (sorted by impressions desc)
        fetch(`${base}/sites/${site}/searchAnalytics/query`, {
          method: 'POST', headers: scHeaders,
          body: JSON.stringify({
            startDate, endDate, dimensions: ['query'], rowLimit: 1000,
            dimensionFilterGroups: [{
              filters: [{
                dimension: 'query',
                operator: 'notContains',
                expression: 'cc hair' // exclude branded terms
              }]
            }]
          })
        }),
      ])

      const [kwData, pageData, gapData] = await Promise.all([
        kwRes.json(), pageRes.json(), gapRes.json()
      ])

      const mapKeyword = r => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(1)),
        ctrStr: (r.ctr * 100).toFixed(1) + '%',
        position: parseFloat(r.position.toFixed(1)),
      })

      const keywords = (kwData.rows || []).map(mapKeyword)
      const pages = (pageData.rows || []).map(r => ({
        page: r.keys[0].replace('https://cchairandbeauty.com','').replace('http://www.cchairandbeauty.com','').replace('https://www.cchairandbeauty.com','') || '/',
        rawPage: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(1)),
        ctrStr: (r.ctr * 100).toFixed(1) + '%',
        position: parseFloat(r.position.toFixed(1)),
      }))

      // Totals from all keywords
      const totals = keywords.reduce((acc, k) => ({
        clicks: acc.clicks + k.clicks,
        impressions: acc.impressions + k.impressions,
      }), { clicks: 0, impressions: 0 })

      const avgPos = keywords.length
        ? (keywords.reduce((s, k) => s + k.position, 0) / keywords.length).toFixed(1)
        : 0
      const avgCtr = totals.impressions
        ? ((totals.clicks / totals.impressions) * 100).toFixed(1)
        : 0

      // Quick wins — positions 4-20, impressions 200+, not brand terms
      const brand = ['cc hair','cchairandbeauty','continental hair']
      const quickWins = keywords
        .filter(k => k.position >= 4 && k.position <= 20 && k.impressions >= 200)
        .filter(k => !brand.some(b => k.query.toLowerCase().includes(b)))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 20)
        .map(k => ({
          ...k,
          potentialClicks: Math.round((k.impressions * 0.05) - k.clicks),
          fix: k.position <= 10
            ? `Improve meta title and description for "${k.query}" — you rank page 1 but CTR is low`
            : `Create a dedicated page or blog post targeting "${k.query}" — ${k.impressions.toLocaleString()} people search this monthly`,
        }))

      // Content gaps — 100+ impressions, under 3% CTR, not brand, not already ranking top 5
      const contentGaps = (gapData.rows || [])
        .map(mapKeyword)
        .filter(k => k.impressions >= 100 && k.ctr < 3 && k.position > 5)
        .filter(k => !brand.some(b => k.query.toLowerCase().includes(b)))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 30)

      // Low CTR pages — pages with 1000+ impressions and under 2% CTR
      const lowCtrPages = pages
        .filter(p => p.impressions >= 500 && p.ctr < 2)
        .sort((a, b) => b.impressions - a.impressions)

      res.status(200).json({
        ok: true, live: true,
        period: `${startDate} to ${endDate}`,
        totals: {
          clicks: totals.clicks,
          impressions: totals.impressions,
          avgPosition: avgPos,
          avgCtr: avgCtr + '%',
        },
        keywords: keywords.slice(0, 100),
        pages,
        quickWins,
        contentGaps,
        lowCtrPages,
        keywordCount: keywords.length,
      })

    } else if (source === 'gbp') {
      const key = process.env.GOOGLE_PLACES_KEY
      // Place IDs confirmed via API — do not change these
      const PLACE_IDS = {
        Chapeltown: 'ChIJ_5jc6wlceUgRo_t7u41q3Dw',
        Roundhay:   'ChIJSwvcAYlbeUgRT7wTEeJy25A',
        'City Centre': 'ChIJqTbKkhlceUgRcbg1e3Z7Ezo',
      }
      const FIELDS = 'name,rating,user_ratings_total,formatted_address,opening_hours,reviews,url,website,formatted_phone_number'

      const results = await Promise.all(
        Object.entries(PLACE_IDS).map(async ([name, placeId]) => {
          const r = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${FIELDS}&key=${key}&language=en`
          )
          const d = await r.json()
          const p = d.result || {}
          return {
            name,
            placeId,
            rating: p.rating,
            reviewCount: p.user_ratings_total,
            address: p.formatted_address,
            phone: p.formatted_phone_number,
            website: p.website,
            mapsUrl: p.url,
            isOpen: p.opening_hours?.open_now,
            hours: p.opening_hours?.weekday_text || [],
            reviewLink: `https://search.google.com/local/writereview?placeid=${placeId}`,
            mapsLink: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
            recentReviews: (p.reviews || []).slice(0, 5).map(r => ({
              author: r.author_name,
              rating: r.rating,
              text: r.text,
              time: r.relative_time_description,
              replied: false,
            })),
          }
        })
      )

      res.status(200).json({ ok: true, branches: results })

    } else if (source === 'shopify-collections') {
      const shop = process.env.SHOPIFY_STORE
      const token = process.env.SHOPIFY_TOKEN
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
        shopifyAdminLink: `https://admin.shopify.com/store/cchairandbeauty/collections/${c.id}`,
      }))

      res.status(200).json({ ok: true, collections })
    } else {
      res.status(400).json({ ok: false, error: 'Invalid source' })
    }
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
