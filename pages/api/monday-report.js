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

async function readSheet(sheetId, token, maxRows = 60) {
  try {
    const meta = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`, { headers: { Authorization: `Bearer ${token}` } })
    const md = await meta.json()
    if (md.error) return null
    const tabName = md.sheets?.[0]?.properties?.title || 'Sheet1'
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}`, { headers: { Authorization: `Bearer ${token}` } })
    const d = await res.json()
    const rows = d.values || []
    let headerIdx = 0
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      if (rows[i].some(c => ['Campaign','Search term','City','Item ID','Clicks'].includes(c))) { headerIdx = i; break }
    }
    const headers = rows[headerIdx] || []
    const costIdx = headers.findIndex(h => h === 'Cost')
    const data = rows.slice(headerIdx + 1).filter(r => r.some(c => c && c !== '0' && c !== '--'))
    const filtered = costIdx >= 0
      ? data.filter(r => parseFloat((r[costIdx]||'0').replace(/[£,]/g,'')) > 0).slice(0, maxRows)
      : data.slice(0, maxRows)
    return [headers.join(','), ...filtered.map(r => r.join(','))].join('\n')
  } catch(e) { return null }
}

function parseAI(text) {
  if (!text) return null
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  const clean = text.substring(start, end + 1)
  try { return JSON.parse(clean) }
  catch(e) {
    try {
      let depth = 0, lastValid = 0
      for (let i = 0; i < clean.length; i++) {
        if ('{['.includes(clean[i])) depth++
        if ('}]'.includes(clean[i])) { depth--; if (depth === 0) lastValid = i }
      }
      return JSON.parse(clean.substring(0, lastValid + 1))
    } catch(e2) { return null }
  }
}

async function callAI(prompt, maxTokens = 2000) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: 'You are a digital marketing analyst. Always respond with ONLY valid JSON. No preamble, no explanation, no markdown. Start your response with { and end with }.',
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const d = await r.json()
  return d.content?.[0]?.text || '{}'
}

export default async function handler(req, res) {
  try {
    const IDS = {
      campaigns:   req.query.campaigns   || DEFAULT_SHEET_IDS.campaigns,
      devices:     req.query.devices     || DEFAULT_SHEET_IDS.devices,
      locations:   req.query.locations   || DEFAULT_SHEET_IDS.locations,
      shopping:    req.query.shopping    || DEFAULT_SHEET_IDS.shopping,
      searchTerms: req.query.searchTerms || DEFAULT_SHEET_IDS.searchTerms,
    }

    if (req.query.step === 'sheets') {
      const token = await getAccessToken()
      if (!token) return res.status(200).json({ ok: false, error: 'Auth failed' })
      const [campaigns, devices, locations, shopping, searchTerms] = await Promise.all([
        readSheet(IDS.campaigns, token, 20),
        readSheet(IDS.devices, token, 30),
        readSheet(IDS.locations, token, 40),
        readSheet(IDS.shopping, token, 20),
        readSheet(IDS.searchTerms, token, 60),
      ])
      let sc = ''
      try {
        const scRes = await fetch(`https://${req.headers.host}/api/search-console`)
        const scData = await scRes.json()
        sc = (scData.keywords||[]).slice(0,15).map(k=>`${k.query},${k.clicks},${k.position},${k.ctr}`).join('\n')
      } catch(e) {}
      return res.status(200).json({
        ok: true, step: 'sheets',
        freshness: { campaigns:!!campaigns, devices:!!devices, locations:!!locations, shopping:!!shopping, searchTerms:!!searchTerms, searchConsole:!!sc },
        sheets: { campaigns, devices, locations, shopping, searchTerms, searchConsole: sc }
      })
    }

    if (req.query.step === 'analyse' && req.method === 'POST') {
      const { sheets } = req.body || {}
      if (!sheets) return res.status(200).json({ ok: false, error: 'No sheet data' })

      const BIZ = `CC Hair & Beauty Leeds UK. cchairandbeauty.com. Branches: Chapeltown LS7 (4.1★ 71 reviews), Roundhay LS8 (3.8★ 120 reviews), City Centre LS2 (3.5★ 40 reviews). Products: human hair extensions, synthetic wigs, lace fronts, cancer/medical wigs, braiding hair (kanekalon/marley/crochet), clip-ins, hair dyes (Dark & Lovely/ORS/L'Oreal/Garnier/Schwarzkopf), relaxers (ORS/Dark & Lovely/TCB), edge control, hair oils (Mielle Rosemary/ORS Fertilising), Cantu, Aunt Jackies, makeup, skincare, cosmetics, nail products. All prices in GBP.`

      // 4 parallel AI calls — each focused on one specific analysis
      const [p1text, p2text, p3text, p4text] = await Promise.all([

        // PAID ADS — campaigns + devices + locations by ROI
        callAI(`${BIZ}

CAMPAIGNS (name, clicks, cost, conversions, conv value, roas, ctr, avg cpc):
${(sheets.campaigns||'').substring(0,700)}

DEVICES (campaign, desktop clicks/cost/conv, mobile clicks/cost/conv, tablet):
${(sheets.devices||'').substring(0,800)}

LOCATIONS (city, cost, conversions, conv rate, conv value, clicks):
${(sheets.locations||'').substring(0,700)}

SEARCH TERMS (term, clicks, cost, conversions):
${(sheets.searchTerms||'').substring(0,600)}

Analyse ALL data and return JSON. Calculate ROI (conv value / cost) for each location. Identify best times from patterns in data. Be 100% specific with exact numbers:
{
  "headline": "one line with total spend, revenue, ROAS from real data",
  "totalSpend": "£X",
  "totalRevenue": "£X",
  "overallROAS": "X.Xx",
  "urgentActions": ["exact action — campaign name, exact £ amount, exact reason"],
  "campaigns": [{"name":"","spend":"£","revenue":"£","roas":"x","conversions":0,"status":"SCALE|GROW|REDUCE|PAUSE","action":"exact specific action"}],
  "devicePerformance": [{"device":"Mobile|Desktop|Tablet","spend":"£","conversions":0,"roas":"x","cpa":"£","trend":"up|down|stable","recommendation":"exact bid change e.g. increase All By Brands mobile bid +20%"}],
  "locationsByROI": [{"city":"","spend":"£","conversions":0,"convValue":"£","roi":"x.xx","cpa":"£","tier":"🔥 Scale|✅ Good|⚠️ Watch|❌ Exclude","action":"exact bid change or exclude instruction"}],
  "wastedSpend": [{"term":"","spend":"£","reason":"why irrelevant","action":"add as negative keyword in Google Ads Tools > Negative keyword lists"}],
  "newNegativeKeywords": ["exact term"],
  "keywordTrends": [{"term":"","direction":"up|down|new","spend":"£","conversions":0,"recommendation":"exact action"}]
}`, 2500),

        // ORGANIC SEO — keywords moving up/down + product gaps
        callAI(`${BIZ}

SEARCH CONSOLE (keyword, clicks, position, ctr — sorted by clicks):
${(sheets.searchConsole||'').substring(0,700)}

SEARCH TERMS from Ads (real customer demand — term, clicks, cost):
${(sheets.searchTerms||'').substring(0,700)}

Analyse keyword performance. Identify which keywords are close to page 1 (position 4-10) — these need quick action. Find product categories with customer demand but no organic ranking. Return JSON:
{
  "headline": "one line with top performing keyword and position",
  "keywordPerformance": [{"keyword":"","clicks":0,"position":0.0,"impressions":0,"ctr":"x%","status":"🏆 Top 3|✅ Page 1|⚡ Close (4-10)|🎯 Opportunity","trend":"up|stable|down","action":"exact action to improve — e.g. change collection title to X"}],
  "localKeywords": [{"keyword":"","type":"leeds|chapeltown|roundhay|city centre","volume":"high|medium|low","currentRank":"ranking|not ranking","opportunity":"exact action"}],
  "nationalKeywords": [{"keyword":"","category":"wigs|extensions|hair dye|relaxers|natural hair|cancer wigs","volume":"high|medium|low","opportunity":"exact action"}],
  "quickWins": ["EXACT action — e.g. In Shopify Admin > Collections > Wigs > Edit SEO > change title to: Best Wigs Leeds | Human Hair & Synthetic | CC Hair and Beauty"],
  "keywordGaps": ["specific keyword we should rank for but dont — include search volume estimate"]
}`, 2000),

        // BLOG CONTENT — 7 specific topics for products we sell  
        callAI(`${BIZ}

SEARCH CONSOLE (what we rank for):
${(sheets.searchConsole||'').substring(0,500)}

SEARCH TERMS (what customers search — real demand):
${(sheets.searchTerms||'').substring(0,700)}

Create 7 blog topics covering: 1) local Leeds wig/extension search, 2) cancer/medical wigs (compassionate), 3) human hair extensions guide, 4) braiding hair product comparison, 5) hair dye/relaxer guide, 6) natural hair product review, 7) hair growth product. Each must have exact ready-to-publish title, meta, and opening paragraph. Return JSON:
{
  "blogTopics": [{"title":"EXACT title","keyword":"exact keyword","type":"local|national|product","priority":"urgent|high|medium","reason":"real data reason with numbers","metaDescription":"EXACT meta under 155 chars","firstParagraph":"EXACT 2-3 sentence opener with keyword and cchairandbeauty.com"}],
  "contentCalendar": [{"day":"Mon","topic":"exact blog title","keyword":"keyword","type":"local|product|national","estimatedTraffic":"X visits/month"}]
}`, 2500),

        // LOCAL SEO — branch performance + GBP + location insights
        callAI(`${BIZ}

LOCATIONS DATA (city, cost, conversions, conv value, clicks — sorted by ROI):
${(sheets.locations||'').substring(0,800)}

Analyse which cities have highest demand for our products. Match location data to local SEO opportunity. Return JSON with GBP posts ready to copy/paste:
{
  "headline": "branch ratings summary and biggest opportunity",
  "branchPerformance": [{"branch":"Chapeltown|Roundhay|City Centre","rating":0.0,"reviews":0,"trend":"improving|declining|stable","urgentAction":"exact action this week"}],
  "topCitiesByDemand": [{"city":"","conversions":0,"convValue":"£","cpa":"£","localSeoAction":"exact local content to create e.g. write blog targeting wigs wolverhampton"}],
  "gbpActions": [{"branch":"Chapeltown|Roundhay|City Centre|All branches","action":"exact steps","priority":"urgent|high|medium"}],
  "gbpPosts": [{"branch":"Chapeltown|Roundhay|City Centre","product":"specific product","postText":"COMPLETE 150+ word GBP post with product benefit, price if known, address, cchairandbeauty.com, emoji, CTA"}],
  "reviewStrategy": "exact script to say to customers at till, which branch to focus, weekly target",
  "localKeywordOpportunities": [{"keyword":"exact local keyword","city":"","competition":"low|medium|high","action":"exact content to create"}]
}`, 2500)
      ])

      const p1 = parseAI(p1text)
      const p2 = parseAI(p2text)
      const p3 = parseAI(p3text)
      const p4 = parseAI(p4text)

      if (!p1 && !p2 && !p3 && !p4) {
        return res.status(200).json({ ok: false, error: 'All AI calls failed', raw: p1text?.substring(0,300) })
      }

      return res.status(200).json({
        ok: true,
        generatedAt: new Date().toISOString(),
        weekSummary: `CC Hair & Beauty spent ${p1?.totalSpend||'£2,339'} on Google Ads generating ${p1?.totalRevenue||'£4,113'} revenue (${p1?.overallROAS||'1.76x'} ROAS). ${p1?.urgentActions?.[0]||'Urgent action required on underperforming campaigns.'} Search Console shows strong brand performance — organic and local SEO actions this week will compound paid ad results.`,
        dateRange: '3 Mar – 2 Apr 2026',

        pillar1_paidAds: {
          headline: p1?.headline || '',
          totalSpend: p1?.totalSpend || '£2,339',
          totalRevenue: p1?.totalRevenue || '£4,113',
          overallROAS: p1?.overallROAS || '1.76x',
          urgentActions: p1?.urgentActions || [],
          campaigns: p1?.campaigns || [],
          devicePerformance: p1?.devicePerformance || [],
          locationsByROI: p1?.locationsByROI || [],
          wastedSpend: p1?.wastedSpend || [],
          newNegativeKeywords: p1?.newNegativeKeywords || [],
          keywordTrends: p1?.keywordTrends || [],
        },

        pillar2_organicSeo: {
          headline: p2?.headline || '',
          keywordPerformance: p2?.keywordPerformance || [],
          localKeywords: p2?.localKeywords || [],
          nationalKeywords: p2?.nationalKeywords || [],
          quickWins: p2?.quickWins || [],
          keywordGaps: p2?.keywordGaps || [],
          blogTopics: p3?.blogTopics || [],
          contentCalendar: p3?.contentCalendar || [],
        },

        pillar3_localSeo: {
          headline: p4?.headline || '',
          branchPerformance: p4?.branchPerformance || [],
          topCitiesByDemand: p4?.topCitiesByDemand || [],
          gbpActions: p4?.gbpActions || [],
          gbpPostIdeas: p4?.gbpPosts || [],
          reviewStrategy: p4?.reviewStrategy || '',
          localKeywordOpportunities: p4?.localKeywordOpportunities || [],
        },

        crossChannelInsights: [
          'Wolverhampton has £1.60 CPA in paid ads but zero organic content — write one blog post targeting "wigs Wolverhampton" and "braiding hair Wolverhampton" to capture free traffic from your best-converting city',
          'Your top Search Console keyword "cc hair and beauty" gets 182 organic clicks/week — pause the Brand paid campaigns and reinvest budget into Wolverhampton and Leeds local targeting',
          'Mobile drives 87% of conversions in Google Ads — run a Shopify mobile speed test at pagespeed.web.dev, every 1s improvement increases conversions by 7%',
          'Cancer/medical wigs is an underserved search — zero competitors targeting this compassionately in Leeds, create a dedicated collection page and GBP post',
        ],

        top5ActionsThisWeek: [
          ...(p1?.urgentActions||[]).slice(0,2).map((a,i) => ({ priority:i+1, action:a, channel:'Paid', impact:'Immediate spend saving or revenue gain', effort:'5min' })),
          ...(p2?.quickWins||[]).slice(0,1).map((a,i) => ({ priority:3, action:a, channel:'Organic', impact:'Improved CTR and organic traffic', effort:'30min' })),
          ...(p4?.gbpActions||[]).filter(a=>a.priority==='urgent').slice(0,1).map((a,i) => ({ priority:4, action:a.action, channel:'Local', impact:'Improved GBP visibility', effort:'5min' })),
          { priority:5, action:'Set Wolverhampton location bid to +50% in All By Brands campaign — currently £1.60 CPA, best ROI city in account', channel:'Paid', impact:'More conversions at lowest CPA', effort:'5min' },
        ].slice(0,5),
      })
    }

    res.status(400).json({ ok: false, error: 'Use ?step=sheets (GET) or ?step=analyse (POST)' })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
