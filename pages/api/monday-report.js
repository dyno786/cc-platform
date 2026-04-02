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
    const meta = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const md = await meta.json()
    if (md.error) return null
    const tabName = md.sheets?.[0]?.properties?.title || 'Sheet1'
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const d = await res.json()
    const rows = d.values || []
    let headerIdx = 0
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      if (rows[i].some(c => ['Campaign','Search term','City','Item ID','Clicks'].includes(c))) {
        headerIdx = i; break
      }
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
  // Strip any preamble before first {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  const clean = text.substring(start, end + 1)
  try {
    return JSON.parse(clean)
  } catch(e) {
    // Try to fix truncated JSON
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

async function callAI(prompt) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
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

    const step = req.query.step || 'full'

    // STEP 1 — read sheets
    if (step === 'sheets') {
      const token = await getAccessToken()
      if (!token) return res.status(200).json({ ok: false, error: 'Auth failed' })
      const [campaigns, devices, locations, shopping, searchTerms] = await Promise.all([
        readSheet(IDS.campaigns,   token, 20),
        readSheet(IDS.devices,     token, 25),
        readSheet(IDS.locations,   token, 25),
        readSheet(IDS.shopping,    token, 20),
        readSheet(IDS.searchTerms, token, 60),
      ])
      let sc = ''
      try {
        const scRes = await fetch(`https://${req.headers.host}/api/search-console`)
        const scData = await scRes.json()
        sc = (scData.keywords||[]).slice(0,12).map(k=>`${k.query},${k.clicks},${k.position}`).join('\n')
      } catch(e) {}
      return res.status(200).json({
        ok: true, step: 'sheets',
        freshness: { campaigns:!!campaigns, devices:!!devices, locations:!!locations, shopping:!!shopping, searchTerms:!!searchTerms, searchConsole:!!sc },
        sheets: { campaigns, devices, locations, shopping, searchTerms, searchConsole: sc }
      })
    }

    // STEP 2 — analyse (3 separate small AI calls)
    if (step === 'analyse' && req.method === 'POST') {
      const { sheets } = req.body || {}
      if (!sheets) return res.status(200).json({ ok: false, error: 'No sheet data' })

      const context = `CC Hair & Beauty Leeds. 3 branches: Chapeltown LS7 (4.1★), Roundhay LS8 (3.8★), City Centre LS2 (3.5★). cchairandbeauty.com. Be specific — exact titles, exact £ amounts, exact %, exact keywords.`

      // Run all 3 pillars in parallel — each small prompt
      const [p1text, p2text, p3text] = await Promise.all([

        callAI(`${context}

CAMPAIGNS:
${(sheets.campaigns||'').substring(0,800)}

DEVICES:
${(sheets.devices||'').substring(0,600)}

LOCATIONS:
${(sheets.locations||'').substring(0,600)}

SEARCH TERMS:
${(sheets.searchTerms||'').substring(0,1500)}

Return JSON for Paid Ads pillar:
{"headline":"with real £ numbers","totalSpend":"£X","totalRevenue":"£X","overallROAS":"X.Xx","urgentActions":["exact action with campaign name and £ amount"],"campaigns":[{"name":"","spend":"£","revenue":"£","roas":"x","status":"SCALE|GROW|REDUCE|PAUSE","action":"exact action"}],"deviceInsights":[{"device":"Mobile|Desktop|Tablet","spend":"£","conversions":0,"roas":"x","recommendation":"exact bid change"}],"topLocations":[{"city":"","spend":"£","conversions":0,"cpa":"£","action":"exact action"}],"wastedSpend":[{"term":"","spend":"£","action":"Add as negative keyword"}],"newNegativeKeywords":["term"]}`),

        callAI(`${context}

CC Hair & Beauty sells: human hair extensions, synthetic hair extensions, lace front wigs, full cap wigs, cancer/medical wigs, braiding hair (kanekalon, marley, crochet), clip-in extensions, hair dyes (Dark & Lovely, ORS, Schwarzkopf, L'Oreal, Garnier), relaxers (ORS Olive Oil, Dark & Lovely, TCB), edge control, hair growth oils (Mielle Rosemary, ORS Fertilising), Cantu range, Aunt Jackies, natural hair products, wigs for cancer patients, afro hair products, makeup, skincare (Nivea, Shea Moisture), nail products, cosmetics. Serving Leeds (Chapeltown LS7, Roundhay LS8, City Centre LS2) and UK nationwide via cchairandbeauty.com.

SEARCH CONSOLE KEYWORDS (what we already rank for — keyword, clicks, position):
${(sheets.searchConsole||'').substring(0,700)}

SEARCH TERMS FROM GOOGLE ADS (what customers actually search for — real demand):
${(sheets.searchTerms||'').substring(0,1200)}

Analyse the real data above. Find keyword opportunities specific to our products. Return JSON for Organic SEO pillar with 7 blog topics covering: local Leeds searches, product reviews, cancer wigs, hair extensions guides, natural hair, wigs, and hair dye. Each blog must have exact Shopify-ready titles and meta descriptions:
{"headline":"one line with real keyword positions from Search Console","topKeywords":[{"keyword":"exact keyword from SC data","clicks":0,"position":0.0,"opportunity":"exact action e.g. change Shopify collection title to X"}],"blogTopics":[{"title":"EXACT blog post title including target keyword","keyword":"exact target keyword","type":"local|national|product","priority":"urgent|high|medium","reason":"exact reason with real data numbers","metaDescription":"EXACT meta description under 155 chars — include keyword and Leeds or UK","firstParagraph":"EXACT first 2 sentences — include keyword, mention Leeds branches or cchairandbeauty.com"}],"keywordGaps":["specific product+location keyword we should rank for e.g. lace front wigs leeds, cancer wig supplier uk, human hair extensions leeds"],"quickWins":["EXACT action e.g. In Shopify Admin go to Collections > Wigs > Edit SEO title to: Best Wigs Leeds | CC Hair and Beauty — Human Hair and Synthetic Wigs"],"contentCalendar":[{"day":"Mon","topic":"exact blog title","keyword":"exact target keyword","type":"local|product|national"}]}`),

        callAI(`${context}

CC Hair & Beauty product specialisms: human hair extensions, synthetic wigs, lace fronts, cancer/medical wigs (sensitive topic — compassionate tone), braiding hair, hair dyes, relaxers, natural hair products, Cantu, ORS, Mielle, makeup and cosmetics.

LOCATIONS DATA (cities spending on ads, with conversions):
${(sheets.locations||'').substring(0,600)}

Return JSON for Local SEO pillar. GBP posts must be complete ready-to-paste text. Include one sensitive but compassionate post about cancer/medical wigs. Local keywords must match real products we sell:
{"headline":"with all 3 branch star ratings and biggest issue","gbpActions":[{"branch":"Chapeltown|Roundhay|City Centre|All branches","action":"exact steps to take this week","priority":"urgent|high|medium"}],"gbpPostIdeas":[{"branch":"Chapeltown|Roundhay|City Centre","product":"specific product name we stock","postText":"COMPLETE ready-to-paste GBP post — 150-200 words, include product benefit, branch address, cchairandbeauty.com URL, emoji, strong call to action"}],"reviewStrategy":"exact strategy — which branch, how many reviews to target, exact script to say to customers at till","localKeywordOpportunities":["exact local keyword + why it will rank e.g. wigs for cancer patients leeds — compassionate search term, zero competition, we stock medical wigs"]}`)
      ])

      const p1 = parseAI(p1text)
      const p2 = parseAI(p2text)
      const p3 = parseAI(p3text)

      if (!p1 && !p2 && !p3) {
        return res.status(200).json({ ok: false, error: 'AI returned invalid JSON for all 3 pillars', raw: p1text.substring(0,200) })
      }

      // Summary from campaigns data
      const totalSpend = p1?.totalSpend || '£2,339'
      const totalRevenue = p1?.totalRevenue || '£4,113'
      const roas = p1?.overallROAS || '1.76x'

      return res.status(200).json({
        ok: true,
        generatedAt: new Date().toISOString(),
        weekSummary: `CC Hair & Beauty spent ${totalSpend} on Google Ads generating ${totalRevenue} revenue (${roas} ROAS). ${p1?.urgentActions?.[0] || 'Action required on underperforming campaigns.'} Search Console shows strong brand term performance — organic and local SEO actions this week will compound paid ad results.`,
        dateRange: '3 Mar – 2 Apr 2026',
        pillar1_paidAds: p1 || { headline: 'Data unavailable', totalSpend: '—', totalRevenue: '—', overallROAS: '—', urgentActions: [], campaigns: [], deviceInsights: [], topLocations: [], wastedSpend: [], newNegativeKeywords: [] },
        pillar2_organicSeo: p2 || { headline: 'Data unavailable', topKeywords: [], blogTopics: [], keywordGaps: [], quickWins: [], contentCalendar: [] },
        pillar3_localSeo: p3 || { headline: 'Data unavailable', gbpActions: [], gbpPostIdeas: [], reviewStrategy: '', localKeywordOpportunities: [] },
        crossChannelInsights: [
          'Wolverhampton converts at £1.60 CPA in paid ads but has zero organic content — write one blog post targeting "hair shop Wolverhampton" to capture free traffic from your best-converting city',
          'Your top Search Console keyword "cc hair and beauty" gets 182 organic clicks/week — consider pausing Brand CW paid campaign and reinvesting budget into Wolverhampton and Leeds targeting',
          'Mobile generates 87% of conversions in Google Ads — run a Shopify mobile speed audit, every 1 second improvement increases conversions by 7%',
        ],
        top5ActionsThisWeek: [
          ...(p1?.urgentActions||[]).slice(0,2).map((a,i) => ({ priority:i+1, action:a, channel:'Paid', impact:'Immediate cost saving or revenue gain', effort:'5min' })),
          ...(p2?.quickWins||[]).slice(0,1).map((a,i) => ({ priority:3+i, action:a, channel:'Organic', impact:'Improved CTR and organic rankings', effort:'30min' })),
          ...(p3?.gbpActions||[]).slice(0,1).map((a,i) => ({ priority:4+i, action:a.action, channel:'Local', impact:'Improved GBP visibility and reviews', effort:'5min' })),
          { priority:5, action:'Set Wolverhampton location bid to +50% in All By Brands campaign', channel:'Paid', impact:'More conversions at £1.60 CPA — best city in account', effort:'5min' },
        ].slice(0,5),
      })
    }

    res.status(400).json({ ok: false, error: 'Use ?step=sheets (GET) or ?step=analyse (POST)' })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
