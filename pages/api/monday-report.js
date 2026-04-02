export const config = { maxDuration: 60 }

const DEFAULT_SHEET_IDS = {
  campaigns:    '1qULuI_YAOIZRM5tebrz9VAss5BT4RO21DU_zg9Yfy7M',
  devices:      '1QxkUwDLGjq-W8GhWH-9QFlhX9D5Ly8fXdc6hsq96IBk',
  locations:    '1pU7GUJkCuJ2CIbVbPDDfqOlF1-7fjFzbC0q3pRII1qc',
  shopping:     '1RGqr8VbHb-TXdFRRhVSCzKiYg5-G3mJqMpkKYBinLlE',
  searchTerms:  '19hyImj3WVjVFBf_KUuB61975JuQ7kv-tqjTbQFM-V0g',
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

async function readSheet(sheetId, token, maxRows = 500) {
  try {
    // Get sheet metadata
    const meta = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const md = await meta.json()
    if (md.error) return { error: md.error.message, sheetId }
    const tabName = md.sheets?.[0]?.properties?.title || 'Sheet1'

    // Read data
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}?majorDimension=ROWS`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const d = await res.json()
    const rows = d.values || []

    // Find header row (skip metadata rows at top)
    let headerIdx = 0
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      if (rows[i].length > 3 && rows[i].some(c => ['Campaign','Search term','City','Device','Item ID','Clicks'].includes(c))) {
        headerIdx = i
        break
      }
    }

    const headers = rows[headerIdx] || []
    const data = rows.slice(headerIdx + 1)
      .filter(r => r.some(c => c && c !== '0' && c !== '--' && c !== ''))

    // Find cost column and filter rows with spend
    const costIdx = headers.findIndex(h => h === 'Cost')
    const filtered = costIdx >= 0
      ? data.filter(r => {
          const v = parseFloat((r[costIdx] || '0').replace(/[£,]/g, ''))
          return v > 0
        }).slice(0, maxRows)
      : data.slice(0, maxRows)

    return { headers, rows: filtered, totalRows: data.length, tab: tabName }
  } catch(e) {
    return { error: e.message, sheetId }
  }
}

function rowsToText(label, { headers, rows, error }) {
  if (error) return `${label}: ERROR - ${error}\n`
  if (!rows?.length) return `${label}: No data with spend\n`
  const lines = [label + ':']
  lines.push(headers.join(','))
  rows.slice(0, 150).forEach(r => lines.push(r.join(',')))
  return lines.join('\n')
}

export default async function handler(req, res) {
  try {
    const token = await getAccessToken()
    if (!token) return res.status(200).json({ ok: false, error: 'Auth failed' })

    // Use sheet IDs from query params if provided, otherwise use defaults
    const SHEET_IDS = {
      campaigns:   req.query.campaigns   || DEFAULT_SHEET_IDS.campaigns,
      devices:     req.query.devices     || DEFAULT_SHEET_IDS.devices,
      locations:   req.query.locations   || DEFAULT_SHEET_IDS.locations,
      shopping:    req.query.shopping    || DEFAULT_SHEET_IDS.shopping,
      searchTerms: req.query.searchTerms || DEFAULT_SHEET_IDS.searchTerms,
    }

    // Read all 5 sheets in parallel
    const [campaigns, devices, locations, shopping, searchTerms] = await Promise.all([
      readSheet(SHEET_IDS.campaigns,   token, 50),
      readSheet(SHEET_IDS.devices,     token, 100),
      readSheet(SHEET_IDS.locations,   token, 100),
      readSheet(SHEET_IDS.shopping,    token, 50),
      readSheet(SHEET_IDS.searchTerms, token, 200),
    ])

    // Also get Search Console keywords
    const scRes = await fetch(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/search-console`)
    const scData = await scRes.json()
    const scKeywords = scData.keywords?.slice(0, 20) || []

    // Build combined data text for AI
    const dataText = [
      rowsToText('CAMPAIGNS', campaigns),
      rowsToText('DEVICES', devices),
      rowsToText('LOCATIONS (top by spend)', locations),
      rowsToText('SEARCH TERMS (with spend)', searchTerms),
      rowsToText('SHOPPING PRODUCTS', shopping),
      `\nSEARCH CONSOLE KEYWORDS (last 28 days):\n${scKeywords.map(k => `${k.query}: ${k.clicks} clicks, pos ${k.position}, CTR ${k.ctr}`).join('\n')}`,
    ].join('\n\n')

    // AI analysis
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `You are an expert digital marketing analyst for CC Hair & Beauty Leeds — a UK hair and beauty retailer with 23,000+ products, 3 branches (Chapeltown LS7 3DU, Roundhay LS8 5RL, City Centre LS2 6BY), and a Shopify store at cchairandbeauty.com.

CRITICAL RULE: Every single recommendation MUST be 100% specific and actionable. Never say vague things like "fix the product page" or "improve your title". Always say EXACTLY what to change, what to write, what number to set, what keyword to use.

EXAMPLES OF BAD (vague) recommendations — NEVER do this:
- "Fix Cherish French Curl product page"
- "Improve your meta descriptions"  
- "Increase bids in Wolverhampton"
- "Add more blog content"

EXAMPLES OF GOOD (specific) recommendations — ALWAYS do this:
- "Change Cherish French Curl Shopify product title to: 'Cherish French Curl Braiding Hair | CC Hair & Beauty Leeds' — this will move it from position #8.7 to top 5 and triple CTR from 1.7%"
- "Change Wigs collection meta description to: 'Shop 500+ wigs at CC Hair & Beauty Leeds. Lace fronts, synthetic & human hair wigs. In-store Chapeltown, Roundhay & City Centre. Free UK delivery over £50.' — target keyword: wigs leeds"
- "Set Wolverhampton location bid to +50% in Google Ads — currently spending £14 at £1.60 CPA which is your best performing city"
- "Publish blog post titled: 'Where to Buy Braiding Hair in Leeds 2026 — CC Hair & Beauty' targeting keyword 'where to buy braiding hair in leeds' — you're already ranking #1.8 for 'braiding hair leeds', this blog will capture 180+ monthly question searches"

For EVERY blog topic: provide the EXACT title, EXACT target keyword, EXACT first paragraph to write, and EXACT meta description.
For EVERY product fix: provide the EXACT new title and EXACT new meta description to paste into Shopify.
For EVERY GBP post: provide the COMPLETE post text ready to copy and paste.
For EVERY bid change: provide the EXACT percentage and EXACT campaign/location name.
For EVERY negative keyword: provide the EXACT term to add.

Here is this week's data across all channels:

${dataText.substring(0, 14000)}

Generate a comprehensive Weekly Intelligence Report. Return ONLY valid JSON:
{
  "weekSummary": "2-3 sentence overview of overall performance this week",
  "dateRange": "date range from data",
  
  "pillar1_paidAds": {
    "headline": "one line summary",
    "totalSpend": "£X,XXX",
    "totalRevenue": "£X,XXX", 
    "overallROAS": "X.Xx",
    "urgentActions": ["action with specific numbers", "action 2", "action 3"],
    "campaigns": [{"name":"","spend":"£0","revenue":"£0","roas":"0x","status":"SCALE|GROW|REDUCE|PAUSE","action":"specific action"}],
    "deviceInsights": [{"device":"Mobile|Desktop|Tablet","spend":"£0","conversions":0,"roas":"0x","recommendation":"increase/decrease bid by X%"}],
    "topLocations": [{"city":"","spend":"£0","conversions":0,"cpa":"£0","action":"increase/decrease bids"}],
    "wastedSpend": [{"term":"","spend":"£0","action":"Add as negative keyword"}],
    "newNegativeKeywords": ["term1","term2","term3"]
  },

  "pillar2_organicSeo": {
    "headline": "one line summary",
    "topKeywords": [{"keyword":"","clicks":0,"position":0,"opportunity":""}],
    "blogTopics": [
      {"title":"EXACT blog post title","keyword":"exact target keyword","type":"local|national|product","priority":"urgent|high|medium","reason":"specific reason with real data","metaDescription":"EXACT meta description 155 chars max","firstParagraph":"EXACT first paragraph with keyword naturally included"}
    ],
    "keywordGaps": ["keyword we should rank for but dont"],
    "quickWins": ["EXACT action — e.g. Change Cherish French Curl Shopify title to: [exact title] — this will improve CTR from 1.7% to 5%+"],
    "contentCalendar": [
      {"day":"Mon","topic":"blog title","keyword":"keyword","type":"local|product|brand"}
    ]
  },

  "pillar3_localSeo": {
    "headline": "one line summary",
    "gbpActions": [
      {"branch":"Chapeltown|Roundhay|City Centre","action":"specific action","priority":"urgent|high|medium"}
    ],
    "gbpPostIdeas": [
      {"branch":"all|Chapeltown|Roundhay|City Centre","postText":"ready to paste GBP post text based on top performing products/searches","product":"product name"}
    ],
    "reviewStrategy": "specific advice based on ratings and review counts",
    "localKeywordOpportunities": ["local keyword to target based on location data"]
  },

  "crossChannelInsights": [
    "insight that connects paid ads data with organic/local opportunity"
  ],

  "top5ActionsThisWeek": [
    {"priority":1,"action":"specific action","channel":"Paid|Organic|Local","impact":"expected outcome","effort":"5min|30min|1hr"}
  ]
}`
        }]
      })
    })

    const aiData = await aiRes.json()
    const text = aiData.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    let report
    try { report = JSON.parse(clean) }
    catch(e) {
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) report = JSON.parse(match[0])
      else return res.status(200).json({ ok: false, error: 'Parse failed', raw: clean.substring(0, 300) })
    }

    res.status(200).json({
      ok: true,
      generatedAt: new Date().toISOString(),
      dataFreshness: {
        campaigns: !campaigns.error,
        devices: !devices.error,
        locations: !locations.error,
        searchTerms: !searchTerms.error,
        shopping: !shopping.error,
        searchConsole: scData.ok,
      },
      ...report
    })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
