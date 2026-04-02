export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { csv, reportType } = req.body
  if (!csv) return res.status(400).json({ error: 'No CSV data' })

  try {
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
        messages: [{
          role: 'user',
          content: `You are analysing a Google Ads CSV report for CC Hair & Beauty Leeds.
Report type: ${reportType}
CSV data:
${csv.substring(0, 8000)}

Return ONLY a JSON object with this structure (no markdown, no backticks):
{
  "reportType": "${reportType}",
  "summary": {
    "totalSpend": "£X,XXX",
    "totalRevenue": "£X,XXX",
    "totalConversions": 0,
    "overallROAS": "0.0x",
    "overallCPA": "£0.00",
    "dateRange": "extracted from data"
  },
  "campaigns": [
    {
      "name": "campaign name",
      "spend": "£000",
      "revenue": "£000",
      "conversions": 0,
      "cpa": "£0.00",
      "roas": "0.0x",
      "status": "SCALE|GROW|REDUCE|PAUSE",
      "action": "specific action to take"
    }
  ],
  "topKeywords": [
    { "keyword": "keyword text", "clicks": 0, "spend": "£0", "conversions": 0, "cpa": "£0" }
  ],
  "wastedSpend": [
    { "term": "search term", "spend": "£0", "conversions": 0, "action": "Exclude as negative keyword" }
  ],
  "urgentActions": [
    "Action 1 — reason",
    "Action 2 — reason"
  ],
  "insights": "2-3 sentence summary of overall account performance and biggest opportunities"
}`
        }]
      })
    })
    const d = await r.json()
    const text = d.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    res.status(200).json({ ok: true, ...parsed })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
