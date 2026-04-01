export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { branches, topic } = req.body

  const prompt = `Write a Google Business Profile post for CC Hair & Beauty, a specialist hair and beauty retailer in Leeds, UK (est. 1979).

Branches selected: ${Array.isArray(branches) ? branches.join(', ') : 'all branches'}
Topic hint: ${topic || 'weekly offer or new products'}

Requirements:
- 2-3 sentences maximum
- Include a relevant emoji at the start
- Mention Leeds or the specific branch if only one branch is selected
- Include a call to action (visit in-store or check online)
- If relevant, hint at current discount codes: WIGDEAL15 (wigs), COLOUR10 (hair dye/colour), EDGE15 (edge control/styling), BRAID10 (braiding hair), OIL10 (hair oils), GROW10 (growth products)
- Keep it natural and engaging, not salesy

Return only the post text, no quotes, no preamble.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const post = data.content?.[0]?.text || ''
    res.status(200).json({ post })
  } catch (err) {
    console.error('GBP post error:', err)
    res.status(500).json({ error: 'Failed to generate post' })
  }
}
