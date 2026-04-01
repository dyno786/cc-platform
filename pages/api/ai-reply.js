export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { review, branch, rating } = req.body
  const ratingContext = { 5: 'very positive', 4: 'mostly positive', 3: 'neutral/mixed', 2: 'negative', 1: 'very negative' }
  const prompt = `You are writing a Google review reply for CC Hair & Beauty, a specialist hair and beauty retailer in Leeds UK (est. 1979) with branches in Chapeltown (LS7), Roundhay (LS8), and City Centre.

Branch: ${branch}
Rating: ${rating}/5 (${ratingContext[rating] || 'neutral'})
Review: "${review}"

Write a warm, genuine 2-3 sentence reply. For negative reviews be apologetic but explain the value of specialist professional brands. For positive reviews thank them and invite back. Sound like a real business owner. No excessive exclamation marks.

Reply with the response text only, no quotes or preamble.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await response.json()
    res.status(200).json({ reply: data.content?.[0]?.text || '' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
