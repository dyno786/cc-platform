export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { ads, sc, gbp } = req.body

  const prompt = `You are a business intelligence analyst for CC Hair and Beauty, Leeds UK.
A hair and beauty retailer established 1979 with 3 branches (Chapeltown LS7, Roundhay LS8, City Centre LS2) and Shopify store cchairandbeauty.com.

You have been given two CSV data exports:

GOOGLE ADS DATA:
${ads}

SEARCH CONSOLE DATA:
${sc}

${gbp ? `GBP INSIGHTS DATA:\n${gbp}` : ''}

Analyse both datasets and return a JSON object with exactly this structure:
{
  "summary": "3-4 sentence plain English summary of the most important findings this week. What is working, what is wasting money, what opportunities exist.",
  "topActions": [
    "Action 1 — specific, data-driven, e.g. Pause energy drink keywords — £1,284 wasted at 0.26x ROAS",
    "Action 2",
    "Action 3",
    "Action 4",
    "Action 5"
  ],
  "adsInsights": {
    "totalSpend": "£X,XXX",
    "totalRevenue": "£X,XXX",
    "roas": "X.XXx",
    "wastedSpend": "£X,XXX",
    "topConverter": "product name — £X CPA",
    "worstWaste": "product/campaign — £X wasted",
    "scaleNow": "campaign/keyword with high ROAS but low spend",
    "negativeKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  },
  "seoInsights": {
    "totalClicks": "X,XXX",
    "totalImpressions": "X,XXX",
    "avgPosition": "X.X",
    "quickWins": ["keyword at pos 5-15 with high impressions 1", "keyword 2", "keyword 3"],
    "topKeywords": ["keyword with most clicks 1", "keyword 2", "keyword 3"],
    "ctrOpportunities": ["page/keyword with low CTR 1", "page 2"],
    "newContent": ["blog topic suggested by data 1", "topic 2", "topic 3"]
  },
  "weeklyBlogPriority": [
    {"title": "suggested blog post title 1", "reason": "why this week based on data", "type": "local/ads/organic"},
    {"title": "suggested blog post title 2", "reason": "why this week based on data", "type": "local/ads/organic"},
    {"title": "suggested blog post title 3", "reason": "why this week based on data", "type": "local/ads/organic"}
  ],
  "tasksThisWeek": [
    "Specific task 1 derived from data",
    "Specific task 2",
    "Specific task 3",
    "Specific task 4",
    "Specific task 5",
    "Specific task 6",
    "Specific task 7"
  ]
}

Return ONLY the JSON object. No markdown, no backticks, no explanation.`

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

    const d = await r.json()
    const text = d.content?.[0]?.text || ''

    // Parse JSON safely
    const clean = text.replace(/```json|```/g, '').trim()
    let results
    try {
      results = JSON.parse(clean)
    } catch(e) {
      // Try to extract JSON from the response
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) results = JSON.parse(match[0])
      else throw new Error('Could not parse AI response')
    }

    res.status(200).json({ ok: true, results })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
