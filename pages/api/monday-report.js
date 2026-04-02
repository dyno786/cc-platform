export const config = { maxDuration: 60 }

const DEFAULT_IDS = {
  campaigns:   '1qULuI_YAOIZRM5tebrz9VAss5BT4RO21DU_zg9Yfy7M',
  devices:     '1QxkUwDLGjq-W8GhWH-9QFlhX9D5Ly8fXdc6hsq96IBk',
  locations:   '1pU7GUJkCuJ2CIbVbPDDfqOlF1-7fjFzbC0q3pRII1qc',
  shopping:    '1RGqr8VbHb-TXdFRRhVSCzKiYg5-G3mJqMpkKYBinLlE',
  searchTerms: '19hyImj3WVjVFBf_KUuB61975JuQ7kv-tqjTbQFM-V0g',
}

async function getToken() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  return (await r.json()).access_token
}

async function readSheet(id, token, max = 40) {
  try {
    const meta = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const md = await meta.json()
    if (md.error) return `[unavailable: ${md.error.message}]`
    const tab = md.sheets?.[0]?.properties?.title || 'Sheet1'
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(tab)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const rows = (await res.json()).values || []
    let hi = 0
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      if (rows[i].some(c => ['Campaign','Search term','City','Item ID','Clicks','Device'].includes(c))) { hi = i; break }
    }
    const headers = rows[hi] || []
    const ci = headers.findIndex(h => h === 'Cost')
    const data = rows.slice(hi + 1)
      .filter(r => r.length > 1 && r.some(c => c && c !== '--' && c !== '0'))
      .filter(r => ci < 0 || parseFloat((r[ci]||'0').replace(/[£,]/g,'')) > 0)
      .slice(0, max)
    if (!data.length) return '[no spend data found]'
    return [headers.join(','), ...data.map(r => r.join(','))].join('\n')
  } catch(e) {
    return `[error: ${e.message}]`
  }
}

function parseJson(text) {
  let clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s !== -1 && e !== -1) clean = clean.substring(s, e + 1)
  try { return JSON.parse(clean) } catch(err) {
    // recover truncated JSON
    let depth = 0, last = 0
    for (let i = 0; i < clean.length; i++) {
      if ('{['.includes(clean[i])) depth++
      if ('}]'.includes(clean[i])) { depth--; if (depth === 0) last = i }
    }
    return JSON.parse(clean.substring(0, last + 1))
  }
}

export default async function handler(req, res) {
  // Two modes: 
  // GET  ?step=sheets  → read sheets only (fast, ~10s)
  // POST ?step=analyse → AI analysis on pre-fetched data (fast, ~20s)

  const step = req.query.step || 'sheets'

  if (step === 'sheets') {
    try {
      const token = await getToken()
      if (!token) return res.status(200).json({ ok: false, error: 'Auth failed' })

      const IDS = {
        campaigns:   req.query.campaigns   || DEFAULT_IDS.campaigns,
        devices:     req.query.devices     || DEFAULT_IDS.devices,
        locations:   req.query.locations   || DEFAULT_IDS.locations,
        shopping:    req.query.shopping    || DEFAULT_IDS.shopping,
        searchTerms: req.query.searchTerms || DEFAULT_IDS.searchTerms,
      }

      const [campaigns, devices, locations, shopping, searchTerms] = await Promise.all([
        readSheet(IDS.campaigns,   token, 15),
        readSheet(IDS.devices,     token, 20),
        readSheet(IDS.locations,   token, 25),
        readSheet(IDS.shopping,    token, 15),
        readSheet(IDS.searchTerms, token, 50),
      ])

      let scText = ''
      try {
        const proto = req.headers['x-forwarded-proto'] || 'https'
        const sc = await fetch(`${proto}://${req.headers.host}/api/search-console`)
        const sd = await sc.json()
        scText = (sd.keywords||[]).slice(0,12).map(k=>`${k.query},${k.clicks} clicks,pos ${k.position}`).join('\n')
      } catch(e) {}

      return res.status(200).json({
        ok: true,
        step: 'sheets',
        sheets: { campaigns, devices, locations, shopping, searchTerms, searchConsole: scText },
        freshness: {
          campaigns:    !campaigns.includes('unavailable') && !campaigns.includes('no spend'),
          devices:      !devices.includes('unavailable') && !devices.includes('no spend'),
          locations:    !locations.includes('unavailable') && !locations.includes('no spend'),
          shopping:     !shopping.includes('unavailable') && !shopping.includes('no spend'),
          searchTerms:  !searchTerms.includes('unavailable') && !searchTerms.includes('no spend'),
          searchConsole: !!scText,
        }
      })
    } catch(e) {
      return res.status(500).json({ ok: false, error: e.message })
    }
  }

  if (step === 'analyse' && req.method === 'POST') {
    try {
      const { sheets } = req.body || {}
      if (!sheets) return res.status(200).json({ ok: false, error: 'No sheet data' })

      const dataText = `
=== CAMPAIGNS ===
${sheets.campaigns}

=== DEVICES ===
${sheets.devices}

=== LOCATIONS ===
${sheets.locations}

=== SEARCH TERMS (with spend) ===
${sheets.searchTerms}

=== SHOPPING ===
${sheets.shopping}

=== SEARCH CONSOLE KEYWORDS ===
${sheets.searchConsole || 'unavailable'}
`.substring(0, 11000)

      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 5000,
          messages: [{
            role: 'user',
            content: `You are an expert digital marketing analyst for CC Hair & Beauty Leeds UK. 23,000+ products. 3 branches: Chapeltown LS7 (4.1 stars), Roundhay LS8 (3.8 stars), City Centre LS2 (3.5 stars). Website: cchairandbeauty.com.

RULE: Every recommendation must be 100% specific with exact numbers, exact titles, exact keywords, exact bid percentages. Never be vague.

DATA THIS WEEK:
${dataText}

Return ONLY valid JSON, no markdown:
{
  "weekSummary": "2-3 sentences with real spend/revenue numbers from the data",
  "dateRange": "from data",
  "pillar1_paidAds": {
    "headline": "headline with real £ numbers",
    "totalSpend": "£X,XXX",
    "totalRevenue": "£X,XXX",
    "overallROAS": "X.Xx",
    "urgentActions": ["exact action with campaign name and exact £ or % — max 5 items"],
    "campaigns": [{"name":"","spend":"£0","revenue":"£0","roas":"0.0x","status":"SCALE|GROW|REDUCE|PAUSE","action":"exact step to take in Google Ads"}],
    "deviceInsights": [{"device":"Mobile|Desktop|Tablet","spend":"£0","conversions":0,"roas":"0.0x","recommendation":"exact bid change e.g. Increase mobile bid +20% in campaign settings"}],
    "topLocations": [{"city":"","spend":"£0","conversions":0,"cpa":"£0.00","action":"exact action e.g. Set Wolverhampton bid to +50%"}],
    "wastedSpend": [{"term":"","spend":"£0","action":"Add as negative keyword — max 8 items"}],
    "newNegativeKeywords": ["term1","term2"]
  },
  "pillar2_organicSeo": {
    "headline": "headline with real keyword data",
    "topKeywords": [{"keyword":"","clicks":0,"position":0.0,"opportunity":"exact action"}],
    "blogTopics": [
      {"title":"EXACT blog title with keyword","keyword":"exact keyword","type":"local|national|product","priority":"urgent|high|medium","reason":"specific data e.g. 417 impressions 1.7% CTR","metaDescription":"EXACT meta under 155 chars","firstParagraph":"EXACT 2-sentence opener with keyword and cchairandbeauty.com"}
    ],
    "keywordGaps": ["keyword — reason why it will rank"],
    "quickWins": ["EXACT action e.g. In Shopify go to Products > [name] > SEO > change title to: [exact title]"],
    "contentCalendar": [{"day":"Mon","topic":"exact title","keyword":"exact keyword","type":"local|product|national"}]
  },
  "pillar3_localSeo": {
    "headline": "headline with branch ratings",
    "gbpActions": [{"branch":"Chapeltown|Roundhay|City Centre|All branches","action":"exact steps","priority":"urgent|high|medium"}],
    "gbpPostIdeas": [{"branch":"","product":"","postText":"COMPLETE ready-to-paste post with address, URL, emoji, CTA"}],
    "reviewStrategy": "exact strategy with numbers",
    "localKeywordOpportunities": ["exact keyword + exact reason"]
  },
  "crossChannelInsights": ["specific insight connecting two channels with exact data"],
  "top5ActionsThisWeek": [{"priority":1,"action":"exact action","channel":"Paid|Organic|Local","impact":"exact expected result","effort":"5min|30min|1hr"}]
}`
          }]
        })
      })

      const aiData = await aiRes.json()
      if (aiData.error) return res.status(200).json({ ok: false, error: aiData.error.message })
      const text = aiData.content?.[0]?.text || '{}'
      
      let report
      try { report = parseJson(text) }
      catch(e) { return res.status(200).json({ ok: false, error: `Parse error: ${e.message}`, raw: text.substring(0,300) }) }

      return res.status(200).json({ ok: true, generatedAt: new Date().toISOString(), ...report })
    } catch(e) {
      return res.status(500).json({ ok: false, error: e.message })
    }
  }

  res.status(400).json({ ok: false, error: 'Use ?step=sheets (GET) or ?step=analyse (POST)' })
}
