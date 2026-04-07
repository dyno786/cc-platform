export const config = { maxDuration: 60 }

// Track weekly positions for key Leeds local search terms
const TARGET_KEYWORDS = [
  'afro hair shop Leeds',
  'hair shop Leeds',
  'afro hair Leeds',
  'black hair shop Leeds',
  'braiding hair Leeds',
  'relaxer Leeds',
  'hair extensions Leeds',
  'wigs Leeds',
  'hair salon Leeds',
  'beauty supply Leeds',
  'afro Caribbean hair Leeds',
  'hair shop Chapeltown',
  'hair shop Roundhay',
  'hair and beauty Leeds',
  'cchairandbeauty',
]

export default async function handler(req, res) {
  const base = 'https://searchconsole.googleapis.com/webmasters/v3'
  const site = 'sc-domain%3Acchairandbeauty.com'

  try {
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
    if (!access_token) return res.status(200).json({ ok: false, error: 'No access token' })

    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0]
    const startDatePrev = new Date(Date.now() - 56 * 86400000).toISOString().split('T')[0]
    const endDatePrev = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0]

    const scHeaders = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' }

    // Fetch current and previous period for each keyword
    const [currentRes, prevRes] = await Promise.all([
      fetch(`${base}/sites/${site}/searchAnalytics/query`, {
        method: 'POST', headers: scHeaders,
        body: JSON.stringify({
          startDate, endDate, dimensions: ['query'], rowLimit: 5000,
        })
      }),
      fetch(`${base}/sites/${site}/searchAnalytics/query`, {
        method: 'POST', headers: scHeaders,
        body: JSON.stringify({
          startDate: startDatePrev, endDate: endDatePrev, dimensions: ['query'], rowLimit: 5000,
        })
      })
    ])

    const [currentData, prevData] = await Promise.all([currentRes.json(), prevRes.json()])

    const toMap = rows => {
      const m = {}
      ;(rows || []).forEach(r => { m[r.keys[0].toLowerCase()] = r })
      return m
    }
    const currentMap = toMap(currentData.rows)
    const prevMap = toMap(prevData.rows)

    const results = TARGET_KEYWORDS.map(kw => {
      const cur = currentMap[kw.toLowerCase()]
      const prev = prevMap[kw.toLowerCase()]
      return {
        keyword: kw,
        current: cur ? {
          position: parseFloat(cur.position.toFixed(1)),
          clicks: cur.clicks,
          impressions: cur.impressions,
          ctr: parseFloat((cur.ctr * 100).toFixed(1)),
        } : null,
        previous: prev ? {
          position: parseFloat(prev.position.toFixed(1)),
          clicks: prev.clicks,
          impressions: prev.impressions,
        } : null,
        change: cur && prev ? parseFloat((prev.position - cur.position).toFixed(1)) : null, // positive = improved
      }
    })

    res.status(200).json({
      ok: true,
      keywords: results,
      period: `${startDate} to ${endDate}`,
      prevPeriod: `${startDatePrev} to ${endDatePrev}`,
    })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
