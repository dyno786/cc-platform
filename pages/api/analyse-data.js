export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { adsText, termsText, keywordsText, devicesText, scheduleText, auctionText } = req.body

  if (!adsText || adsText.trim().length < 20) {
    return res.status(200).json({ ok: false, error: 'Campaign Performance CSV is empty or missing.' })
  }

  // Build a focused prompt that extracts brand/product level intelligence
  const prompt = `You are a senior Google Ads consultant. Analyse this Google Ads data for CC Hair and Beauty Leeds UK.
Business: Afro hair and beauty PRODUCT retailer. Shopify store with 23,000+ products. 3 branches in Leeds.
Current ROAS: Unknown from data (no conversion values set). Goal: 6x ROAS.
Google Ads cannot show ROAS without conversion values — we judge performance by conversion RATE and CPA instead.

KEY RULES:
- Hair City Visitors = local text/search ad targeting people near branches. NOT a Shopping product ad.
- Shopify All Products / All By Brands = Shopping campaigns showing individual products
- For Shopping campaigns, the search terms report reveals WHICH products/brands are getting clicks
- A brand with many clicks but zero conversions = PAUSE that brand from Shopping
- A brand with high conversion rate = SCALE that brand's budget
- Use REAL numbers from the data throughout. Never invent figures.

=== CAMPAIGN PERFORMANCE CSV ===
${adsText.slice(0, 8000)}

${termsText ? `=== SEARCH TERMS REPORT (this shows which actual searches triggered your ads — USE THIS to identify brand and product level waste) ===
${termsText.slice(0, 6000)}` : ''}

${keywordsText ? `=== KEYWORDS REPORT ===
${keywordsText.slice(0, 2000)}` : ''}

${devicesText ? `=== DEVICE PERFORMANCE ===
${devicesText.slice(0, 1500)}` : ''}

${scheduleText ? `=== SCHEDULE — WHEN ADS SHOWED ===
${scheduleText.slice(0, 1500)}` : ''}

${auctionText ? `=== AUCTION INSIGHTS (competitors bidding on same keywords) ===
${auctionText.slice(0, 1500)}` : ''}

Return ONLY valid JSON. No markdown, no backticks, no explanation outside the JSON.

Analyse deeply at the BRAND and PRODUCT level using the search terms data. I need to know:
- Which hair product BRANDS (ORS, Cantu, Dark & Lovely, Sensationnel, X-Pression etc) are worth bidding on vs wasting money
- Which specific PRODUCTS or product types should be excluded from Shopping
- Which search terms to add as negatives RIGHT NOW
- Exact budget moves to reach 6x ROAS

{
  "summary": "5-6 sentence executive summary. What campaigns exist, total spend, which are performing, which are failing, and the single most important action to take today. Use real campaign names and real figures.",

  "totalSpend": "total spend figure from campaign data e.g. £2,814.62",
  "totalConversions": "total conversions across all campaigns",
  "overallRoas": "if conversion values exist calculate ROAS, else explain that conversion values are not set in Google Ads and recommend fixing this",
  "wastedSpend": "estimated spend on zero-conversion search terms and underperforming campaigns",

  "campaigns": [
    {
      "name": "exact campaign name from CSV",
      "spend": "£XXX",
      "clicks": "XXX",
      "conversions": "XX",
      "convRate": "X.X%",
      "cpa": "£XX per conversion",
      "roas": "Xx if available else N/A",
      "action": "Scale" or "Reduce" or "Pause" or "Restructure" or "Keep",
      "reason": "specific reason with real numbers e.g. 16.67% conv rate at £6.59 CPA — best performing campaign"
    }
  ],

  "brandAnalysis": [
    {
      "brand": "Brand name e.g. ORS, Cantu, Dark & Lovely, Sensationnel, X-Pression, Cherish, Freetress etc",
      "searchVolume": "how many searches/clicks this brand got",
      "conversions": "conversions attributed to this brand",
      "verdict": "Scale" or "Keep" or "Reduce" or "Pause" or "Exclude",
      "reason": "why — e.g. 0 conversions from 234 clicks, wasting £45 — exclude from Shopping",
      "budgetAction": "specific action e.g. Add as negative keyword in All By Brands campaign to stop spending on this brand"
    }
  ],

  "productExclusions": [
    {
      "product": "specific product or product type to exclude",
      "reason": "why it's wasting money — clicks with no conversions, irrelevant searches etc",
      "action": "exact step in Google Ads to exclude it e.g. Campaigns → All By Brands → Products → find [product] → Exclude"
    }
  ],

  "searchTermsToBlock": [
    {
      "term": "exact search term to add as negative",
      "spend": "estimated spend wasted on this term",
      "reason": "why it's irrelevant — e.g. searching for a service not a product, wrong brand, competitor name"
    }
  ],

  "budgetReallocation": {
    "currentTotalBudget": "£X/day total across all campaigns",
    "targetRoas": "6x",
    "moves": [
      {
        "from": "campaign or brand to reduce",
        "to": "campaign or brand to increase",
        "amount": "£X/day",
        "expectedImpact": "why this improves ROAS"
      }
    ],
    "projectedOutcome": "If you make these budget moves, estimated improvement e.g. move from 1.8x to 4x ROAS within 30 days"
  },

  "topActions": [
    "Action 1 — most urgent, with exact steps and real figures",
    "Action 2",
    "Action 3",
    "Action 4",
    "Action 5",
    "Action 6",
    "Action 7"
  ],

  "negativeKeywords": ["exact term 1 to add as negative", "term 2", "term 3", "term 4", "term 5", "term 6", "term 7", "term 8", "term 9", "term 10"],

  "deviceInsights": "${devicesText ? 'mobile vs desktop vs tablet — which device has best conversion rate, what bid adjustments to make with exact percentages' : 'No device data uploaded — upload Device Performance CSV for this analysis'}",

  "scheduleInsights": "${scheduleText ? 'best and worst days/hours — which to increase bids and which to turn off ads completely, with exact percentages' : 'No schedule data uploaded — upload When Ads Showed CSV for this analysis'}",

  "competitorInsights": "${auctionText ? 'which competitors are outbidding you and on which campaigns, with strategy to beat them' : 'No auction insights uploaded — upload Auction Insights CSV for this analysis'}",

  "scaleOpportunity": "the single best campaign, brand or keyword to put more budget into right now, with exact recommended daily budget",

  "biggestWaste": "the single biggest money drain right now with exact spend figure and the one action to stop it today",

  "stepByStepGuide": [
    {
      "action": "Step title — timeframe e.g. Do today",
      "detail": "Exact Google Ads navigation steps e.g. Campaigns → All By Brands → Keywords → Negative keywords → Add [list]. Be specific.",
      "impact": "Expected result with figures e.g. Save £45/week, improve overall ROAS from 1.8x to 2.4x"
    }
  ],

  "weeklyTasks": [
    "Specific task 1 with exact steps",
    "Task 2",
    "Task 3",
    "Task 4",
    "Task 5"
  ]
}`

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const d = await r.json()
    const text = d.content?.[0]?.text || ''

    if (!text) {
      return res.status(200).json({ ok: false, error: 'AI returned empty response: ' + JSON.stringify(d.error || '') })
    }

    const clean = text.replace(/```json|```/g, '').trim()
    let results
    try {
      results = JSON.parse(clean)
    } catch(e) {
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          results = JSON.parse(match[0])
        } catch(e2) {
          let partial = match[0]
          const openBraces = (partial.match(/\{/g) || []).length
          const closeBraces = (partial.match(/\}/g) || []).length
          const openBrackets = (partial.match(/\[/g) || []).length
          const closeBrackets = (partial.match(/\]/g) || []).length
          partial = partial.replace(/,\s*"[^"]*"?\s*$/, '')
          partial = partial.replace(/,\s*\{[^}]*$/, '')
          for (let i = closeBrackets; i < openBrackets; i++) partial += ']'
          for (let i = closeBraces; i < openBraces; i++) partial += '}'
          try {
            results = JSON.parse(partial)
          } catch(e3) {
            return res.status(200).json({ ok: false, error: 'Response too long to parse. Try uploading fewer reports at once.' })
          }
        }
      } else {
        return res.status(200).json({ ok: false, error: 'Could not parse response: ' + clean.slice(0, 300) })
      }
    }

    res.status(200).json({ ok: true, results })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
