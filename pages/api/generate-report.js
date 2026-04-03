// Vercel Cron Job — runs at 7am UTC (8am UK) every day
// Reads all 5 Google Ads Sheets + Search Console, runs AI analysis, saves to cache file
export const config = { maxDuration: 60 }

const DEFAULT_IDS = {
  campaigns:   '1qULuI_YAOIZRM5tebrz9VAss5BT4RO21DU_zg9Yfy7M',
  devices:     '1QxkUwDLGjq-W8GhWH-9QFlhX9D5Ly8fXdc6hsq96IBk',
  locations:   '1pU7GUJkCuJ2CIbVbPDDfqOlF1-7fjFzbC0q3pRII1qc',
  shopping:    '1RGqr8VbHb-TXdFRRhVSCzKiYg5-G3mJqMpkKYBinLlE',
  searchTerms: '19hyImj3WVjVFBf_KUuB61975JuQ7kv-tqjTbQFM-V0g',
}

// Simple in-memory cache — persists for the duration of the serverless instance
// For production use, upgrade to Vercel KV
let reportCache = null
let cacheTime = null

async function getToken() {
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
  return (await r.json()).access_token
}

async function readSheet(id, token, max = 50) {
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
      if (rows[i].some(c => ['Campaign','Search term','City','Item ID','Clicks'].includes(c))) { hi = i; break }
    }

    const headers = rows[hi] || []
    const ci = headers.findIndex(h => h === 'Cost')
    const data = rows.slice(hi + 1)
      .filter(r => r.length > 1 && r.some(c => c && c !== '--'))
      .filter(r => ci < 0 || parseFloat((r[ci]||'0').replace(/[£,]/g,'')) > 0)
      .slice(0, max)

    if (!data.length) return `[${tab}: no spend data]`
    return [headers.join(','), ...data.map(r => r.join(','))].join('\n')
  } catch(e) {
    return `[error: ${e.message}]`
  }
}

export async function generateReport(host, queryIds = {}) {
  const token = await getToken()
  if (!token) throw new Error('Auth failed — check GOOGLE_REFRESH_TOKEN')

  const IDS = { ...DEFAULT_IDS, ...queryIds }

  const [campaigns, devices, locations, shopping, searchTerms] = await Promise.all([
    readSheet(IDS.campaigns,   token, 15),
    readSheet(IDS.devices,     token, 20),
    readSheet(IDS.locations,   token, 25),
    readSheet(IDS.shopping,    token, 15),
    readSheet(IDS.searchTerms, token, 60),
  ])

  let scText = ''
  try {
    const sc = await fetch(`https://${host}/api/search-console`)
    const sd = await sc.json()
    scText = sd.keywords?.slice(0,12).map(k=>`${k.query},${k.clicks} clicks,pos ${k.position}`).join('\n') || ''
  } catch(e) {}

  const dataText = [
    `=== CAMPAIGNS ===\n${campaigns}`,
    `=== DEVICES ===\n${devices}`,
    `=== LOCATIONS ===\n${locations}`,
    `=== SEARCH TERMS (spend > 0 only) ===\n${searchTerms}`,
    `=== SHOPPING ===\n${shopping}`,
    scText ? `=== SEARCH CONSOLE TOP KEYWORDS ===\n${scText}` : '',
  ].filter(Boolean).join('\n\n')

  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 6000,
      messages: [{
        role: 'user',
        content: `You are an expert digital marketing analyst for CC Hair & Beauty Leeds UK — 23,000+ products, 3 branches: Chapeltown LS7 (4.1★ GBP), Roundhay LS8 (3.8★), City Centre LS2 (3.5★). Website: cchairandbeauty.com.

RULE: Every recommendation must be 100% specific with exact numbers, exact titles, exact keywords, exact percentages. Never be vague.

DATA THIS WEEK:
${dataText.substring(0, 11000)}

Return ONLY valid JSON, no markdown:
{
  "weekSummary": "2-3 sentences with real numbers from the data",
  "dateRange": "X Mar - X Apr 2026",
  "pillar1_paidAds": {
    "headline": "one line with real spend/revenue/ROAS",
    "totalSpend": "£X,XXX",
    "totalRevenue": "£X,XXX",
    "overallROAS": "X.Xx",
    "urgentActions": ["exact action with campaign name and exact numbers"],
    "campaigns": [{"name":"","spend":"£0","revenue":"£0","roas":"0x","status":"SCALE|GROW|REDUCE|PAUSE","action":"exact action"}],
    "deviceInsights": [{"device":"Mobile|Desktop|Tablet","spend":"£0","conversions":0,"roas":"0x","recommendation":"exact bid % change"}],
    "topLocations": [{"city":"","spend":"£0","conversions":0,"cpa":"£0","action":"exact bid change with campaign name"}],
    "wastedSpend": [{"term":"","spend":"£0","action":"Add as negative keyword — go to Tools > Shared Library > Negative keyword lists"}],
    "newNegativeKeywords": ["term1","term2"]
  },
  "pillar2_organicSeo": {
    "headline": "one line with real keyword numbers",
    "topKeywords": [{"keyword":"","clicks":0,"position":0.0,"opportunity":"exact action"}],
    "blogTopics": [
      {
        "title": "EXACT blog post title including target keyword",
        "keyword": "exact keyword to target",
        "type": "local|national|product",
        "priority": "urgent|high|medium",
        "reason": "specific data e.g. 417 impressions at 1.7% CTR position #8.7",
        "metaDescription": "EXACT meta description under 155 chars with keyword and Leeds",
        "firstParagraph": "EXACT first paragraph 2-3 sentences with keyword and cchairandbeauty.com"
      }
    ],
    "keywordGaps": ["keyword gap with specific reason"],
    "quickWins": ["EXACT action e.g. In Shopify go to Products > [product] > SEO > change title to: [exact title]"],
    "contentCalendar": [{"day":"Mon","topic":"exact title","keyword":"keyword","type":"local|product|national"}]
  },
  "pillar3_localSeo": {
    "headline": "one line with branch ratings and specific issue",
    "gbpActions": [{"branch":"Chapeltown|Roundhay|City Centre|All branches","action":"exact steps to take","priority":"urgent|high|medium"}],
    "gbpPostIdeas": [
      {
        "branch": "branch name",
        "product": "specific product",
        "postText": "COMPLETE post text ready to paste — include product, branch address, website, emoji, call to action"
      }
    ],
    "reviewStrategy": "exact strategy with specific targets e.g. ask every customer at City Centre till, target 5 new 5-star reviews by Friday",
    "localKeywordOpportunities": ["exact local keyword + why it will rank"]
  },
  "crossChannelInsights": ["specific insight connecting two channels with exact data"],
  "top5ActionsThisWeek": [
    {"priority":1,"action":"exact specific action","channel":"Paid|Organic|Local","impact":"exact expected result with numbers","effort":"5min|30min|1hr"}
  ]
}`
      }]
    })
  })

  const aiData = await aiRes.json()
  if (aiData.error) throw new Error(aiData.error.message)

  let clean = (aiData.content?.[0]?.text || '{}')
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s !== -1 && e !== -1) clean = clean.substring(s, e + 1)

  let report
  try {
    report = JSON.parse(clean)
  } catch(err) {
    // Recover truncated JSON
    let depth = 0, last = 0
    for (let i = 0; i < clean.length; i++) {
      if ('{['.includes(clean[i])) depth++
      if ('}]'.includes(clean[i])) { depth--; if (depth === 0) last = i }
    }
    report = JSON.parse(clean.substring(0, last + 1))
  }

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    dataFreshness: {
      campaigns:    !campaigns.startsWith('[unavailable'),
      devices:      !devices.startsWith('[unavailable'),
      locations:    !locations.startsWith('[unavailable'),
      searchTerms:  !searchTerms.startsWith('[unavailable'),
      shopping:     !shopping.startsWith('[unavailable'),
      searchConsole: !!scText,
    },
    ...report
  }
}

export default async function handler(req, res) {
  // Allow manual trigger or cron
  try {
    const queryIds = {
      campaigns:   req.query.campaigns,
      devices:     req.query.devices,
      locations:   req.query.locations,
      shopping:    req.query.shopping,
      searchTerms: req.query.searchTerms,
    }
    const report = await generateReport(req.headers.host, queryIds)
    // Store in module-level cache
    reportCache = report
    cacheTime = new Date().toISOString()
    res.status(200).json({ ok: true, message: 'Report generated and cached', generatedAt: cacheTime })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}

// Export cache so monday-report.js can read it
export { reportCache, cacheTime }
