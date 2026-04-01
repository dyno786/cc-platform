export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { branches, topic } = req.body
  const prompt = `Write a Google Business Profile post for CC Hair & Beauty, a specialist hair and beauty retailer in Leeds UK.
Branches: ${Array.isArray(branches) ? branches.join(', ') : 'all branches'}
Topic: ${topic || 'weekly offer or new stock'}
Requirements: 2-3 sentences, start with an emoji, include a call to action. Relevant discount codes: WIGDEAL15, COLOUR10, EDGE15, BRAID10, OIL10, GROW10. Sound natural, not salesy.
Return post text only.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 200, messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await response.json()
    res.status(200).json({ post: data.content?.[0]?.text || '' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
