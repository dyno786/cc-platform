export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  const clientId     = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!refreshToken) {
    return res.status(200).json({
      ok: false,
      note: 'Search Console OAuth pending — showing last known keyword data',
      keywords: [
        { query:'cc hair beauty',              clicks:1150, impressions:4200, position:1.2 },
        { query:'hair shop leeds',             clicks:220,  impressions:1800, position:3.1 },
        { query:'braiding hair leeds',         clicks:180,  impressions:760,  position:1.8 },
        { query:'wigs leeds',                  clicks:95,   impressions:890,  position:2.4 },
        { query:'natural hair products leeds', clicks:76,   impressions:540,  position:2.1 },
        { query:'afro hair shop leeds',        clicks:54,   impressions:420,  position:3.8 },
        { query:'hair extensions leeds',       clicks:43,   impressions:380,  position:6.2 },
        { query:'ors relaxer uk',              clicks:38,   impressions:290,  position:4.1 },
        { query:'cantu shea butter uk',        clicks:31,   impressions:240,  position:5.3 },
        { query:'mielle organics uk',          clicks:28,   impressions:210,  position:4.7 },
      ]
    })
  }

  try {
    // Step 1 — get access token using refresh token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type:    'refresh_token',
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      return res.status(200).json({ ok: false, error: 'Failed to get access token', detail: tokenData })
    }

    const accessToken = tokenData.access_token

    // Step 2 — fetch Search Console data
    const end   = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 28)
    const startDate = start.toISOString().split('T')[0]
    const endDate   = end.toISOString().split('T')[0]

    const scRes = await fetch(
      'https://searchconsole.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fcchairandbeauty.com%2F/searchAnalytics/query',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 25,
          startRow: 0,
        }),
      }
    )

    const scData = await scRes.json()

    if (scData.error) {
      return res.status(200).json({ ok: false, error: scData.error.message, code: scData.error.code })
    }

    const keywords = (scData.rows || []).map(r => ({
      query:       r.keys[0],
      clicks:      r.clicks,
      impressions: r.impressions,
      ctr:         (r.ctr * 100).toFixed(1) + '%',
      position:    parseFloat(r.position.toFixed(1)),
    }))

    res.status(200).json({ ok: true, live: true, startDate, endDate, keywords })

  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
