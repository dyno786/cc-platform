export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { adsText, termsText, keywordsText, devicesText, scheduleText, auctionText } = req.body

  console.log('[analyse-data] reports received:', {
    ads: adsText?.length || 0,
    terms: termsText?.length || 0,
    keywords: keywordsText?.length || 0,
    devices: devicesText?.length || 0,
    schedule: scheduleText?.length || 0,
    auction: auctionText?.length || 0,
  })

  if (!adsText || adsText.trim().length < 20) {
    return res.status(200).json({ ok: false, error: 'Campaign Performance CSV is empty or missing.' })
  }

  const prompt = `You are a senior Google Ads consultant conducting a FULL AUDIT for CC Hair and Beauty Leeds UK.
Business: Afro hair and beauty retailer, 3 branches (Chapeltown LS7, Roundhay LS8, Leeds City Centre), online store cchairandbeauty.com.
Target: 3x ROAS minimum. Hair City Visitors is a LOCAL SEARCH/TEXT ad targeting people near branches — NOT a product ad.

IMPORTANT: Base ALL analysis on the REAL data below. Use actual campaign names and real numbers throughout.

=== CAMPAIGN PERFORMANCE ===
${adsText.slice(0, 6000)}

${termsText ? `=== SEARCH TERMS (actual queries triggering ads) ===
${termsText.slice(0, 2000)}` : ''}

${keywordsText ? `=== KEYWORDS (bids, quality scores) ===
${keywordsText.slice(0, 1500)}` : ''}

${devicesText ? `=== DEVICE PERFORMANCE (mobile/desktop/tablet) ===
${devicesText.slice(0, 1000)}` : ''}

${scheduleText ? `=== WHEN ADS SHOWED (day/hour performance) ===
${scheduleText.slice(0, 1000)}` : ''}

${auctionText ? `=== AUCTION INSIGHTS (competitors) ===
${auctionText.slice(0, 1000)}` : ''}

Return ONLY valid JSON — no markdown, no backticks:

{
  "summary": "5-6 sentence executive summary with REAL figures and campaign names. What is working, what is failing, root causes, biggest opportunity.",
  "totalSpend": "total spend from data e.g. £2,814.62",
  "totalConversions": "total conversions",
  "overallRoas": "ROAS if calculable, else explain why not",
  "wastedSpend": "spend on underperforming campaigns",
  "topActions": [
    "Action 1 with real campaign name and figures",
    "Action 2",
    "Action 3",
    "Action 4",
    "Action 5"
  ],
  "campaigns": [
    {
      "name": "exact campaign name",
      "spend": "£XXX",
      "clicks": "XXX",
      "conversions": "X",
      "roas": "X.Xx or N/A",
      "action": "Scale or Reduce or Pause or Restructure",
      "reason": "one line reason with real numbers"
    }
  ],
  "deviceInsights": "${devicesText ? 'Analysis of mobile vs desktop vs tablet performance with specific bid adjustment recommendations' : 'No device data uploaded'}",
  "scheduleInsights": "${scheduleText ? 'Best and worst times/days to run ads with specific dayparting recommendations' : 'No schedule data uploaded'}",
  "competitorInsights": "${auctionText ? 'Who your main competitors are and how often they outrank you, with strategy to beat them' : 'No auction insights data uploaded'}",
  "keywordInsights": "${keywordsText ? 'Which keywords have poor quality scores, which to pause, which to increase bids on' : 'No keyword data uploaded'}",
  "negativeKeywords": ["actual wasted search term 1 from data", "term 2", "term 3", "term 4", "term 5", "term 6", "term 7", "term 8", "term 9", "term 10"],
  "scaleOpportunity": "specific campaign/keyword to scale with exact budget recommendation",
  "biggestWaste": "specific campaign/keyword wasting most money with exact figures",
  "stepByStepGuide": [
    {
      "action": "Step 1 title — do this today",
      "detail": "Exactly what to do in Google Ads — specific clicks and settings to change",
      "impact": "Expected result e.g. Save £X/day or +X% conversions"
    },
    {
      "action": "Step 2 title — do this week",
      "detail": "Specific action with real numbers from the data",
      "impact": "Expected result"
    },
    {
      "action": "Step 3",
      "detail": "Detail",
      "impact": "Impact"
    },
    {
      "action": "Step 4",
      "detail": "Detail",
      "impact": "Impact"
    },
    {
      "action": "Step 5",
      "detail": "Detail",
      "impact": "Impact"
    },
    {
      "action": "Step 6",
      "detail": "Detail",
      "impact": "Impact"
    },
    {
      "action": "Step 7",
      "detail": "Detail",
      "impact": "Impact"
    }
  ],
  "weeklyTasks": [
    "Specific task 1 to do in Google Ads this week",
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
      // Try to extract just the JSON object
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          results = JSON.parse(match[0])
        } catch(e2) {
          // JSON was truncated — try to repair by closing open structures
          let partial = match[0]
          // Count open brackets and close them
          const openBraces = (partial.match(/\{/g) || []).length
          const closeBraces = (partial.match(/\}/g) || []).length
          const openBrackets = (partial.match(/\[/g) || []).length
          const closeBrackets = (partial.match(/\]/g) || []).length
          // Remove trailing incomplete line
          partial = partial.replace(/,\s*"[^"]*"?\s*$/, '')
          partial = partial.replace(/,\s*\{[^}]*$/, '')
          // Close open arrays and objects
          for (let i = closeBrackets; i < openBrackets; i++) partial += ']'
          for (let i = closeBraces; i < openBraces; i++) partial += '}'
          try {
            results = JSON.parse(partial)
          } catch(e3) {
            return res.status(200).json({ ok: false, error: 'AI response was too long and could not be parsed. Try with fewer reports or contact support.' })
          }
        }
      } else {
        return res.status(200).json({ ok: false, error: 'Could not parse AI response: ' + clean.slice(0, 300) })
      }
    }

    res.status(200).json({ ok: true, results })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
