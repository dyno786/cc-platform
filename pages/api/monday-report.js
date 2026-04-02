export const config = { maxDuration: 60 }

const DEFAULT_SHEET_IDS = {
  campaigns:   '1qULuI_YAOIZRM5tebrz9VAss5BT4RO21DU_zg9Yfy7M',
  devices:     '1QxkUwDLGjq-W8GhWH-9QFlhX9D5Ly8fXdc6hsq96IBk',
  locations:   '1pU7GUJkCuJ2CIbVbPDDfqOlF1-7fjFzbC0q3pRII1qc',
  shopping:    '1RGqr8VbHb-TXdFRRhVSCzKiYg5-G3mJqMpkKYBinLlE',
  searchTerms: '19hyImj3WVjVFBf_KUuB61975JuQ7kv-tqjTbQFM-V0g',
}

async function getAccessToken() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  })
  const d = await r.json()
  return d.access_token
}

async function readSheet(sheetId, token, maxRows = 100) {
  try {
    const meta = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const md = await meta.json()
    if (md.error) return { error: md.error.message }
    const tabName = md.sheets?.[0]?.properties?.title || 'Sheet1'

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}?majorDimension=ROWS`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const d = await res.json()
    const rows = d.values || []

    // Find header row
    let headerIdx = 0
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      if (rows[i].some(c => ['Campaign','Search term','City','Item ID','Clicks','Device'].includes(c))) {
        headerIdx = i; break
      }
    }

    const headers = rows[headerIdx] || []
    const costIdx = headers.findIndex(h => h === 'Cost')
    const data = rows.slice(headerIdx + 1).filter(r => r.some(c => c && c !== '0' && c !== '--'))

    // Only keep rows with spend
    const filtered = costIdx >= 0
      ? data.filter(r => parseFloat((r[costIdx]||'0').replace(/[£,]/g,'')) > 0).slice(0, maxRows)
      : data.slice(0, maxRows)

    return { headers, rows: filtered, tab: tabName }
  } catch(e) {
    return { error: e.message }
  }
}

function toText(label, sheet) {
  if (!sheet || sheet.error) return `${label}: unavailable\n`
  if (!sheet.rows?.length) return `${label}: no spend data\n`
  const lines = [`=== ${label} ===`, sheet.headers.join(',')]
  sheet.rows.forEach(r => lines.push(r.join(',')))
  return lines.join('\n')
}

export default async function handler(req, res) {
  try {
    const token = await getAccessToken()
    if (!token) return res.status(200).json({ ok: false, error: 'Auth failed — check GOOGLE_REFRESH_TOKEN' })

    const IDS = {
      campaigns:   req.query.campaigns   || DEFAULT_SHEET_IDS.campaigns,
      devices:     req.query.devices     || DEFAULT_SHEET_IDS.devices,
      locations:   req.query.locations   || DEFAULT_SHEET_IDS.locations,
      shopping:    req.query.shopping    || DEFAULT_SHEET_IDS.shopping,
      searchTerms: req.query.searchTerms || DEFAULT_SHEET_IDS.searchTerms,
    }

    // Read all sheets in parallel — tight row limits to stay fast
    const [campaigns, devices, locations, shopping, searchTerms] = await Promise.all([
      readSheet(IDS.campaigns,   token, 20),
      readSheet(IDS.devices,     token, 30),
      readSheet(IDS.locations,   token, 30),
      readSheet(IDS.shopping,    token, 20),
      readSheet(IDS.searchTerms, token, 80),
    ])

    // Get Search Console top keywords
    let scKeywords = []
    try {
      const scRes = await fetch(`https://${req.headers.host}/api/search-console`)
      const scData = await scRes.json()
      scKeywords = scData.keywords?.slice(0, 15) || []
    } catch(e) {}

    const dataText = [
      toText('CAMPAIGNS', campaigns),
      toText('DEVICES', devices),
      toText('LOCATIONS', locations),
      toText('SEARCH TERMS (with spend only)', searchTerms),
      toText('SHOPPING', shopping),
      scKeywords.length ? `=== SEARCH CONSOLE ===\n${scKeywords.map(k=>`${k.query},${k.clicks} clicks,pos ${k.position},${k.ctr} CTR`).join('\n')}` : '',
    ].filter(Boolean).join('\n\n')

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 6000,
        messages: [{
          role: 'user',
          content: `You are an expert digital marketing analyst for CC Hair & Beauty Leeds UK — hair and beauty retailer, 23,000+ products, 3 branches: Chapeltown LS7, Roundhay LS8, City Centre LS2. Website: cchairandbeauty.com. GBP ratings: Chapeltown 4.1★, Roundhay 3.8★, City Centre 3.5★.

CRITICAL: Every recommendation must be 100% specific. Never be vague.
BAD: "Fix the product page" — GOOD: "Change Cherish French Curl Shopify title to: 'Cherish French Curl Braiding Hair UK | CC Hair & Beauty' — moves from position #8.7 to top 5"
BAD: "Increase bids" — GOOD: "Set Wolverhampton location bid to +50% in All By Brands campaign — currently £1.60 CPA, best in account"
BAD: "Write more blogs" — GOOD: "Publish blog titled 'Where to Buy Braiding Hair in Leeds 2026' targeting keyword 'braiding hair leeds' — you rank #1.8 already, this captures question searches"

DATA:
${dataText.substring(0, 12000)}

Return ONLY this exact JSON structure, no markdown, no extra text:
{
  "weekSummary": "2-3 sentence expert summary with real numbers from the data",
  "dateRange": "date range from data",
  "pillar1_paidAds": {
    "headline": "one line with real spend/revenue/ROAS numbers",
    "totalSpend": "£X,XXX",
    "totalRevenue": "£X,XXX",
    "overallROAS": "X.Xx",
    "urgentActions": [
      "EXACT action with campaign name, exact % or £ amount, exact reason"
    ],
    "campaigns": [
      {"name":"exact campaign name","spend":"£000","revenue":"£000","roas":"0.0x","status":"SCALE|GROW|REDUCE|PAUSE","action":"exact specific action to take"}
    ],
    "deviceInsights": [
      {"device":"Mobile|Desktop|Tablet","spend":"£000","conversions":0,"roas":"0.0x","recommendation":"exact bid change e.g. Increase bid +20% in Google Ads campaign settings"}
    ],
    "topLocations": [
      {"city":"city name","spend":"£000","conversions":0,"cpa":"£0.00","action":"exact action e.g. Set location bid to +50% in All By Brands campaign"}
    ],
    "wastedSpend": [
      {"term":"exact search term","spend":"£0.00","action":"Add as negative keyword in Google Ads — Tools > Negative keyword lists"}
    ],
    "newNegativeKeywords": ["exact term 1","exact term 2"]
  },
  "pillar2_organicSeo": {
    "headline": "one line summary with real keyword data",
    "topKeywords": [
      {"keyword":"exact keyword","clicks":0,"position":0.0,"opportunity":"exact action to take"}
    ],
    "blogTopics": [
      {
        "title": "EXACT blog post title — include target keyword naturally",
        "keyword": "exact target keyword",
        "type": "local|national|product",
        "priority": "urgent|high|medium",
        "reason": "specific reason with real data e.g. 417 impressions at 1.7% CTR position #8.7",
        "metaDescription": "EXACT meta description under 155 chars — include keyword and location",
        "firstParagraph": "EXACT first paragraph — 2 sentences with keyword, mention Leeds and cchairandbeauty.com"
      }
    ],
    "keywordGaps": ["specific keyword gap with reason"],
    "quickWins": ["EXACT action — e.g. In Shopify admin go to Products > Cherish French Curl > Edit > change SEO title to: [exact title]"],
    "contentCalendar": [
      {"day":"Mon","topic":"exact blog title","keyword":"exact keyword","type":"local|product|national"}
    ]
  },
  "pillar3_localSeo": {
    "headline": "one line with branch ratings and specific issue",
    "gbpActions": [
      {"branch":"Chapeltown|Roundhay|City Centre|All branches","action":"exact action with specific steps","priority":"urgent|high|medium"}
    ],
    "gbpPostIdeas": [
      {
        "branch": "Chapeltown|Roundhay|City Centre",
        "product": "specific product name",
        "postText": "COMPLETE ready-to-paste GBP post — include product, price if known, branch address, website URL, emoji, call to action"
      }
    ],
    "reviewStrategy": "exact strategy with specific numbers e.g. ask every customer at Chapeltown till this week, target 5 new reviews",
    "localKeywordOpportunities": ["exact local keyword + exact reason why it will rank"]
  },
  "crossChannelInsights": [
    "specific insight connecting two channels with exact data e.g. Wolverhampton converts at £1.60 CPA in paid ads but zero organic content targets Wolverhampton — write one blog post to capture free traffic"
  ],
  "top5ActionsThisWeek": [
    {"priority":1,"action":"exact specific action","channel":"Paid|Organic|Local","impact":"exact expected result","effort":"5min|30min|1hr"}
  ]
}`
        }]
      })
    })

    const aiData = await aiRes.json()
    if (aiData.error) return res.status(200).json({ ok: false, error: aiData.error.message })

    const text = aiData.content?.[0]?.text || '{}'
    let clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    if (start !== -1 && end !== -1) clean = clean.substring(start, end + 1)

    let report
    try {
      report = JSON.parse(clean)
    } catch(e) {
      // Try to recover truncated JSON
      try {
        let depth = 0, lastValid = 0
        for (let i = 0; i < clean.length; i++) {
          if ('{['.includes(clean[i])) depth++
          if ('}]'.includes(clean[i])) { depth--; if (depth === 0) lastValid = i }
        }
        report = JSON.parse(clean.substring(0, lastValid + 1))
      } catch(e2) {
        return res.status(200).json({ ok: false, error: `Parse error: ${e.message}`, raw: clean.substring(0, 400) })
      }
    }

    res.status(200).json({
      ok: true,
      generatedAt: new Date().toISOString(),
      dataFreshness: {
        campaigns:   !campaigns.error,
        devices:     !devices.error,
        locations:   !locations.error,
        searchTerms: !searchTerms.error,
        shopping:    !shopping.error,
        searchConsole: scKeywords.length > 0,
      },
      ...report
    })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
