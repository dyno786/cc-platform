export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  // Quick test — send minimal data to AI and return raw response
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: 'You are a Google Ads analyst. Always respond with ONLY valid JSON. No preamble. Start with { end with }.',
      messages: [{
        role: 'user',
        content: `Analyse this Google Ads data for CC Hair & Beauty Leeds:

CAMPAIGNS:
Human Hair - Brands,430,GBP,38.63,0,0,0
Synthetic Wigs 2026,415,GBP,64.15,3.99,92.82,1.45
All By Brands,9144,GBP,522.69,86.58,1289.37,2.47
Shopify All Products,11351,GBP,1441.5,86.58,2175.64,1.51

Return JSON:
{
  "summary": "2-3 sentence account summary with real numbers",
  "bestCampaign": "campaign name and why",
  "worstCampaign": "campaign name and why",
  "totalSpend": "£X,XXX",
  "totalRevenue": "£X,XXX",
  "overallROAS": "X.Xx",
  "topActions": ["action 1", "action 2", "action 3"]
}`
      }]
    })
  })
  const d = await r.json()
  const raw = d.content?.[0]?.text || 'no response'
  
  // Try to parse
  let parsed = null
  try {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    parsed = JSON.parse(raw.substring(start, end + 1))
  } catch(e) {}
  
  res.status(200).json({ raw, parsed, ok: !!parsed })
}
