export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { adsText, termsText } = req.body
  console.log('[analyse-data] adsText length:', adsText?.length || 0)
  console.log('[analyse-data] termsText length:', termsText?.length || 0)
  console.log('[analyse-data] adsText preview:', (adsText||'').slice(0, 100))

  // Support both old field names (ads/sc) and new (adsText/termsText)
  const finalAdsText = adsText || req.body.ads || ''
  const finalTermsText = termsText || req.body.terms || req.body.sc || ''
  console.log('[analyse-data] finalAdsText length:', finalAdsText.length)

  if (!finalAdsText || finalAdsText.trim().length < 20) {
    return res.status(200).json({
      ok: false,
      error: 'Google Ads CSV appears empty. Please upload your Campaign Performance CSV from Google Ads → Reports → Predefined reports → Campaign performance → Download.'
    })
  }

  const prompt = `You are a Google Ads analyst for CC Hair and Beauty Leeds — an afro hair and beauty retailer established 1979. They have 3 branches: Chapeltown LS7, Roundhay LS8, Leeds City Centre LS2, and online store cchairandbeauty.com.

Analyse the Google Ads data below and return a JSON report.

CAMPAIGN PERFORMANCE CSV:
${finalAdsText.slice(0, 8000)}

${finalTermsText ? `SEARCH KEYWORDS/TERMS CSV:
${finalTermsText.slice(0, 4000)}` : 'Note: No search terms data provided.'}

Return ONLY a valid JSON object — no markdown, no backticks, no explanation before or after:

{
  "summary": "3-4 sentence plain English summary based on the actual data. What is working well, what is wasting money, and the single biggest opportunity right now.",
  "totalSpend": "Total spend extracted from data e.g. £1,240",
  "totalConversions": "Total conversions from data",
  "overallRoas": "Overall ROAS calculated from data e.g. 3.2x",
  "wastedSpend": "Estimated spend on campaigns/keywords with poor ROAS e.g. £340",
  "topActions": [
    "Action 1 — specific, name the actual campaign from the data with exact figures",
    "Action 2 — specific",
    "Action 3 — specific",
    "Action 4 — specific",
    "Action 5 — specific"
  ],
  "campaigns": [
    {
      "name": "Exact campaign name from CSV",
      "spend": "£XXX",
      "clicks": "XXX",
      "conversions": "X",
      "roas": "X.Xx",
      "action": "Scale",
      "reason": "High ROAS — increase budget by 20%"
    }
  ],
  "negativeKeywords": ${termsText ? '["wasteful search term 1 from terms data", "term 2", "term 3", "term 4", "term 5"]' : '["Upload Search Terms CSV to get negative keyword recommendations"]'},
  "scaleOpportunity": "Name the specific campaign with best ROAS that deserves more budget — be specific",
  "biggestWaste": "Name the specific campaign or keyword wasting the most money — be specific",
  "weeklyTasks": [
    "Task 1 — exact action to do in Google Ads today",
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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!r.ok) {
      const errText = await r.text()
      return res.status(200).json({ ok: false, error: 'Anthropic API error: ' + r.status + ' — ' + errText.slice(0, 100) })
    }

    const d = await r.json()
    const text = d.content?.[0]?.text || ''

    if (!text) {
      return res.status(200).json({ ok: false, error: 'AI returned empty response' })
    }

    const clean = text.replace(/```json|```/g, '').trim()
    let results
    try {
      results = JSON.parse(clean)
    } catch(e) {
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) {
        results = JSON.parse(match[0])
      } else {
        return res.status(200).json({ ok: false, error: 'Could not parse AI response. Raw: ' + clean.slice(0, 300) })
      }
    }

    res.status(200).json({ ok: true, results })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
