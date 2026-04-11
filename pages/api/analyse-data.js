export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { adsText, termsText } = req.body

  console.log('[analyse-data] adsText length:', adsText?.length || 0)
  console.log('[analyse-data] termsText length:', termsText?.length || 0)
  console.log('[analyse-data] adsText first 200:', (adsText || '').slice(0, 200))

  if (!adsText || adsText.trim().length < 20) {
    return res.status(200).json({
      ok: false,
      error: 'CSV data is empty or too short. Received: ' + (adsText?.length || 0) + ' characters.'
    })
  }

  const prompt = `You are a Google Ads expert analyst for CC Hair and Beauty Leeds UK — an afro hair and beauty retailer with 3 branches (Chapeltown LS7, Roundhay LS8, Leeds City Centre) and online store cchairandbeauty.com.

Below is REAL Google Ads data exported as CSV. Read every row carefully and base your entire analysis on the ACTUAL numbers in this data. Do NOT say data is missing or empty — it is all below.

=== CAMPAIGN PERFORMANCE CSV DATA ===
${adsText.slice(0, 10000)}
=== END CAMPAIGN DATA ===

${termsText ? `=== SEARCH TERMS CSV DATA ===
${termsText.slice(0, 5000)}
=== END SEARCH TERMS ===` : ''}

Based on the ACTUAL data above, return ONLY a valid JSON object with no markdown, no backticks, no explanation:

{
  "summary": "3-4 sentences about what the data actually shows — reference real campaign names and real numbers from the CSV",
  "totalSpend": "total cost from the data e.g. £1,240.50",
  "totalConversions": "total conversions from the data",
  "overallRoas": "overall ROAS calculated from data e.g. 3.2x",
  "wastedSpend": "spend on campaigns with ROAS below 2x",
  "topActions": [
    "Specific action using real campaign name and real figures from the data",
    "Specific action 2",
    "Specific action 3",
    "Specific action 4",
    "Specific action 5"
  ],
  "campaigns": [
    {
      "name": "exact campaign name from CSV",
      "spend": "£XXX",
      "clicks": "XXX",
      "conversions": "X",
      "roas": "X.Xx",
      "action": "Scale",
      "reason": "why in one line"
    }
  ],
  "negativeKeywords": ["wasted search term 1", "term 2", "term 3", "term 4", "term 5"],
  "scaleOpportunity": "exact campaign name with best ROAS that needs more budget",
  "biggestWaste": "exact campaign or keyword wasting most money",
  "weeklyTasks": [
    "Exact task 1 to do in Google Ads this week",
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
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const d = await r.json()
    console.log('[analyse-data] Anthropic status:', r.status)
    console.log('[analyse-data] response preview:', JSON.stringify(d).slice(0, 300))

    const text = d.content?.[0]?.text || ''
    if (!text) {
      return res.status(200).json({ ok: false, error: 'AI returned empty response. Anthropic error: ' + JSON.stringify(d.error || d) })
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
        return res.status(200).json({ ok: false, error: 'Could not parse AI response. Raw: ' + clean.slice(0, 500) })
      }
    }

    res.status(200).json({ ok: true, results })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
