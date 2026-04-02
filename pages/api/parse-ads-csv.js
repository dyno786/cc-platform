export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { csv, reportType, filesCount, fileNames } = req.body
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
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `You are a Google Ads expert analysing account data for CC Hair & Beauty Leeds — a hair and beauty retailer with 23,000+ products.

Files uploaded: ${fileNames?.join(', ') || 'unknown'}
Total files: ${filesCount || 1}

CSV DATA:
${csv.substring(0, 12000)}

Analyse ALL the data across all files. Return ONLY valid JSON (no markdown, no backticks, no explanation):
{
  "summary": {
    "totalSpend": "£X,XXX",
    "totalRevenue": "£X,XXX",
    "totalConversions": 0,
    "overallROAS": "0.0x",
    "overallCPA": "£0.00",
    "dateRange": "X Mar - X Apr 2026"
  },
  "insights": "3-4 sentence expert summary covering biggest wins and opportunities",
  "urgentActions": [
    "Specific action — specific reason with numbers"
  ],
  "campaigns": [
    {
      "name": "campaign name",
      "spend": "£000",
      "revenue": "£000",
      "conversions": 0,
      "cpa": "£0.00",
      "roas": "0.0x",
      "status": "SCALE|GROW|REDUCE|PAUSE",
      "action": "specific action to take now"
    }
  ],
  "devicePerformance": [
    {
      "device": "Mobile|Desktop|Tablet",
      "spend": "£000",
      "conversions": 0,
      "roas": "0.0x",
      "cpa": "£0.00",
      "recommendation": "Increase bid +X%|Reduce bid X%|Keep current"
    }
  ],
  "bestTimes": [
    { "time": "Mon-Fri 9am-12pm", "roas": "0.0x", "conversions": 0 }
  ],
  "topLocations": [
    { "location": "Leeds", "conversions": 0, "spend": "£000", "roas": "0.0x" }
  ],
  "keywordOpportunities": [
    {
      "keyword": "keyword text",
      "clicks": 0,
      "conversions": 0,
      "cpa": "£0.00",
      "opportunity": "Low CPA — scale|High impression share — expand|Low competition"
    }
  ],
  "wastedSpend": [
    { "term": "irrelevant search term", "spend": "£000", "conversions": 0, "action": "Add as negative keyword" }
  ],
  "topProducts": [
    { "product": "product name", "clicks": 0, "conversions": 0, "revenue": "£000", "roas": "0.0x" }
  ]
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
