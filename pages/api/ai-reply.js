export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { review, branch, rating } = req.body

  const ratingContext = {
    5: 'very positive and enthusiastic',
    4: 'mostly positive',
    3: 'neutral or mixed',
    2: 'negative or disappointed',
    1: 'very negative or angry',
  }

  const prompt = `You are writing a Google review reply for CC Hair & Beauty, a well-established Leeds hair and beauty retailer with branches in Chapeltown (LS7), Roundhay (LS8), and City Centre.

Branch: ${branch}
Customer rating: ${rating}/5 (${ratingContext[rating] || 'neutral'})
Customer review: "${review}"

Write a professional, warm, genuine reply that:
- Thanks the customer by name if a name was given
- Acknowledges their specific points
- For negative reviews: is apologetic but not grovelling, explains the value proposition (specialist professional brands)
- For positive reviews: expresses genuine thanks and invites them back
- Ends with a warm invitation to return
- Is 2-3 sentences maximum
- Does NOT use exclamation marks excessively
- Sounds like a real business owner wrote it, not a bot

Reply only with the response text, no quotes, no preamble.`

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
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const reply = data.content?.[0]?.text || ''
    res.status(200).json({ reply })
  } catch (err) {
    console.error('AI reply error:', err)
    res.status(500).json({ error: 'Failed to generate reply' })
  }
}
