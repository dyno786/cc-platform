export const config = { 
  maxDuration: 60,
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { csv, reportType, filesCount, fileNames } = req.body
  if (!csv) return res.status(400).json({ error: 'No CSV data' })

  try {
    // Smart truncation — keep first 500 rows per file section
    function truncateCSV(text, maxRows = 500) {
      const sections = text.split(/\n\n=== FILE:/)
      return sections.map((section, i) => {
        const lines = section.split('\n')
        if (lines.length <= maxRows) return section
        // Keep header rows (first 3) + top rows sorted by cost
        const header = lines.slice(0, 3)
        const data = lines.slice(3).filter(l => l.trim())
        // Sort by cost column (usually col 2) descending
        const sorted = data.sort((a, b) => {
          const costA = parseFloat((a.match(/£?([\d,]+\.?\d*)/g) || ['0'])[1]?.replace(/[£,]/g,'') || 0)
          const costB = parseFloat((b.match(/£?([\d,]+\.?\d*)/g) || ['0'])[1]?.replace(/[£,]/g,'') || 0)
          return costB - costA
        })
        return [...header, ...sorted.slice(0, maxRows)].join('\n')
      }).join('\n\n=== FILE:')
    }

    const trimmed = truncateCSV(csv, 400)
    const limited = trimmed.substring(0, 15000)

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
          content: `You are a Google Ads expert analysing account data for CC Hair & Beauty Leeds — a UK hair and beauty retailer.

Files: ${fileNames?.join(', ') || 'unknown'} (${filesCount || 1} file${filesCount !== 1 ? 's' : ''})

DATA (top rows by spend shown):
${limited}

Analyse everything and return ONLY valid JSON with no markdown or backticks:
{
  "summary": {
    "totalSpend": "£X,XXX",
    "totalRevenue": "£X,XXX",
    "totalConversions": 0,
    "overallROAS": "0.0x",
    "overallCPA": "£0.00",
    "dateRange": "X Mar - X Apr 2026"
  },
  "insights": "3-4 sentence expert summary of biggest wins and opportunities",
  "urgentActions": ["Action with specific numbers", "Action 2", "Action 3"],
  "campaigns": [
    { "name": "name", "spend": "£000", "revenue": "£000", "conversions": 0, "cpa": "£0.00", "roas": "0.0x", "status": "SCALE|GROW|REDUCE|PAUSE", "action": "specific action" }
  ],
  "devicePerformance": [
    { "device": "Mobile|Desktop|Tablet", "spend": "£000", "conversions": 0, "roas": "0.0x", "cpa": "£0.00", "recommendation": "Increase bid +X%|Reduce bid X%|Keep current" }
  ],
  "bestTimes": [
    { "time": "time range", "roas": "0.0x", "conversions": 0 }
  ],
  "topLocations": [
    { "location": "city", "conversions": 0, "spend": "£000", "roas": "0.0x" }
  ],
  "keywordOpportunities": [
    { "keyword": "term", "clicks": 0, "conversions": 0, "cpa": "£0.00", "opportunity": "reason to scale" }
  ],
  "wastedSpend": [
    { "term": "irrelevant term", "spend": "£000", "conversions": 0, "action": "Add as negative keyword" }
  ],
  "topProducts": [
    { "product": "product name", "clicks": 0, "conversions": 0, "revenue": "£000", "roas": "0.0x" }
  ]
}`
        }]
      })
    })

    const d = await r.json()
    if (d.error) return res.status(200).json({ ok: false, error: d.error.message })
    
    const text = d.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    
    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch(e) {
      // Try to extract JSON if there's extra text
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
      else return res.status(200).json({ ok: false, error: 'Could not parse AI response', raw: clean.substring(0, 200) })
    }
    
    res.status(200).json({ ok: true, ...parsed })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
