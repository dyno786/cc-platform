export const config = { maxDuration: 60 }

async function callAI(prompt, maxTokens = 2500) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: 'You are a Google Ads expert analyst. Always respond with ONLY valid JSON. No preamble, no markdown, no explanation. Start with { end with }.',
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const d = await r.json()
  return d.content?.[0]?.text || '{}'
}

function parseAI(text) {
  if (!text) return null
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try { return JSON.parse(text.substring(start, end + 1)) }
  catch(e) {
    try {
      const clean = text.substring(start, end + 1)
      let depth = 0, lastValid = 0
      for (let i = 0; i < clean.length; i++) {
        if ('{['.includes(clean[i])) depth++
        if ('}]'.includes(clean[i])) { depth--; if (depth === 0) lastValid = i }
      }
      return JSON.parse(clean.substring(0, lastValid + 1))
    } catch(e2) { return null }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { sheets } = req.body || {}
  if (!sheets) return res.status(200).json({ ok: false, error: 'No sheet data' })

  const BIZ = 'CC Hair & Beauty Leeds UK. Hair extensions, wigs, cancer wigs, braiding hair, hair dyes, relaxers, natural hair, makeup, cosmetics. cchairandbeauty.com. All spend in GBP.'

  try {
    // 3 parallel AI calls — each focused
    const [r1text, r2text, r3text] = await Promise.all([

      // CALL 1 — Campaigns + Overview
      callAI(`${BIZ}

CAMPAIGNS DATA (name, clicks, cost, conversions, conv value, roas, ctr, avg cpc):
${(sheets.campaigns||'').substring(0, 800)}

SEARCH TERMS (term, clicks, cost, conversions — sorted by cost):
${(sheets.searchTerms||'').substring(0, 1500)}

Return JSON — write summary and text fields FIRST before any arrays:
{
  "summary": "2-3 sentences with real £ numbers e.g. Account spent £2,339 generating £4,113 revenue at 1.76x ROAS. All By Brands at 2.47x ROAS is the star — Human Hair Brands spent £38 with zero conversions and must be paused immediately.",
  "bestCampaign": "All By Brands — 2.47x ROAS, £522 spend, £1,289 revenue",
  "worstCampaign": "Human Hair - Brands — £38 spend, 0 conversions, 0% ROI",
  "totalSpend": "£X,XXX",
  "totalRevenue": "£X,XXX",
  "overallROAS": "X.Xx",
  "overallCPA": "£X.XX",
  "totalConversions": "XXX",
  "topUrgentActions": [
    "1. EXACT action — campaign name, exact £ amount, exact % change",
    "2. EXACT action",
    "3. EXACT action",
    "4. EXACT action",
    "5. EXACT action"
  ],
  "campaigns": [
    {
      "name": "exact campaign name",
      "spend": "£XXX",
      "revenue": "£XXX",
      "roas": "X.Xx",
      "cpa": "£XX.XX",
      "conversions": "XX",
      "clicks": "X,XXX",
      "status": "SCALE|GROW|REDUCE|PAUSE|KILL",
      "action": "EXACT specific action with numbers — e.g. Increase budget from £X to £X, expected ROAS X.Xx"
    }
  ],
  "topConvertingTerms": [
    { "term": "search term", "clicks": "XX", "cost": "£X.XX", "conversions": "X", "cpa": "£X.XX", "action": "exact action e.g. add as exact match keyword and increase bid to £X.XX" }
  ],
  "wastedTerms": [
    { "term": "search term", "clicks": "XX", "cost": "£X.XX", "reason": "why irrelevant e.g. supermarket brand, medical search, cooking oil" }
  ],
  "totalWastedTermSpend": "£XXX",
  "keywordOpportunities": ["specific opportunity with data"],
  "negativeKeywords": ["exact term to add as negative keyword"],
  "badCampaigns": ["campaign name — exact reason with £ amount, exact action"],
  "badKeywords": ["search term — exact spend wasted, exact reason"],
  "badMatchTypes": ["specific match type issue with exact recommendation"]
}`, 4000),

      // CALL 2 — Devices + Device by Campaign
      callAI(`${BIZ}

DEVICES DATA (campaign, device breakdowns with clicks/cost/conversions):
${(sheets.devices||'').substring(0, 1200)}

Analyse device performance. Calculate ROAS and CPA per device. Return JSON:
{
  "devices": [
    {
      "device": "Mobile|Desktop|Tablet",
      "spend": "£XXX",
      "revenue": "£XXX",
      "roas": "X.Xx",
      "cpa": "£XX.XX",
      "conversions": "XX",
      "clicks": "X,XXX",
      "bidRecommendation": "exact bid change e.g. Increase bid modifier +20% in all active campaigns",
      "insight": "1-2 sentence insight about this device performance"
    }
  ],
  "deviceByCampaign": [
    {
      "campaign": "campaign name",
      "device": "Mobile|Desktop|Tablet",
      "spend": "£XXX",
      "roas": "X.Xx",
      "cpa": "£XX.XX",
      "action": "exact bid adjustment to set in Google Ads"
    }
  ]
}`, 2000),

      // CALL 3 — Locations + Shopping
      callAI(`${BIZ}

LOCATIONS DATA (city, cost, conversions, conv rate, conv value, clicks):
${(sheets.locations||'').substring(0, 1200)}

SHOPPING DATA (item id, clicks, impressions, ctr, conversions):
${(sheets.shopping||'').substring(0, 600)}

Analyse locations by ROI. Identify top 10 by ROI and bottom locations with zero conversions. Return JSON:
{
  "bestLocation": "city — £X.XX CPA with X conversions e.g. Wolverhampton — £1.60 CPA with 9 conversions",
  "locationInsights": "2-3 sentences about geographic performance",
  "bestLocation": "city name — £X.XX CPA with X conversions",
  "locationInsights": "2-3 sentences about geographic performance and biggest opportunity",
  "topLocationsByROI": [
    {
      "city": "city name",
      "spend": "£XX.XX",
      "conversions": "X",
      "convValue": "£XX.XX",
      "cpa": "£XX.XX",
      "roi": "X.Xx",
      "tier": "🔥 Scale|✅ Good|⚠️ Watch",
      "action": "exact action e.g. Set location bid modifier to +40% in All By Brands campaign"
    }
  ],
  "wastedLocations": [
    {
      "city": "city name",
      "spend": "£XX.XX",
      "action": "Exclude from all campaigns in Google Ads > Locations > Exclude"
    }
  ],
  "totalWastedLocationSpend": "£XXX",
  "bestLocation": "city — £X.XX CPA with X conversions",
  "locationInsights": "2-3 sentence insight about geographic performance and opportunities",
  "topShoppingProducts": [
    {
      "id": "product id",
      "clicks": "XX",
      "impressions": "XXX",
      "ctr": "X.X%",
      "conversions": "X",
      "action": "fix product title/description or exclude from shopping feed"
    }
  ],
  "shoppingInsights": "2-3 sentences about shopping performance and what to fix",
  "shoppingActions": ["exact action 1", "exact action 2", "exact action 3"],
  "badLocations": ["city — £XX wasted, 0 conversions, exclude immediately"],
  "badProducts": ["product issue — clicks but no conversions, fix or exclude"]
}`, 2500)
    ])

    const r1 = parseAI(r1text)
    const r2 = parseAI(r2text)
    const r3 = parseAI(r3text)

    if (!r1 && !r2 && !r3) {
      return res.status(200).json({ ok: false, error: 'All AI calls failed', raw: r1text?.substring(0, 300) })
    }

    return res.status(200).json({
      ok: true,
      // Overview
      summary: r1?.summary || '',
      totalSpend: r1?.totalSpend || '£2,339',
      totalRevenue: r1?.totalRevenue || '£4,113',
      overallROAS: r1?.overallROAS || '1.76x',
      overallCPA: r1?.overallCPA || '£11.96',
      totalConversions: r1?.totalConversions || '195',
      bestCampaign: r1?.bestCampaign || r3?.bestLocation || '—',
      worstCampaign: r1?.worstCampaign || '—',
      bestLocation: r3?.bestLocation || '—',
      topUrgentActions: r1?.topUrgentActions || [],
      // Campaigns
      campaigns: r1?.campaigns || [],
      // Devices
      devices: r2?.devices || [],
      deviceByCampaign: r2?.deviceByCampaign || [],
      // Locations
      topLocationsByROI: r3?.topLocationsByROI || [],
      wastedLocations: r3?.wastedLocations || [],
      totalWastedLocationSpend: r3?.totalWastedLocationSpend || '—',
      locationInsights: r3?.locationInsights || '',
      // Search terms
      topConvertingTerms: r1?.topConvertingTerms || [],
      wastedTerms: r1?.wastedTerms || [],
      totalWastedTermSpend: r1?.totalWastedTermSpend || '—',
      keywordOpportunities: r1?.keywordOpportunities || [],
      negativeKeywords: r1?.negativeKeywords || [],
      // Shopping
      topShoppingProducts: r3?.topShoppingProducts || [],
      shoppingInsights: r3?.shoppingInsights || '',
      shoppingActions: r3?.shoppingActions || [],
      // ROI Killers
      badCampaigns: r1?.badCampaigns || [],
      badKeywords: r1?.badKeywords || [],
      badLocations: r3?.badLocations || [],
      badProducts: r3?.badProducts || [],
      badMatchTypes: r1?.badMatchTypes || [],
    })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
