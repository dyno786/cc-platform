export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { keyword } = req.body
  if (!keyword) return res.status(400).json({ error: 'No keyword' })

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
        max_tokens: 1500,
        messages: [{ role: 'user', content: `Write a LOCAL SEO blog post for CC Hair & Beauty Leeds.

Target keyword: "${keyword}"

Return ONLY a JSON object with these exact fields, no markdown, no backticks:
{
  "seoTitle": "SEO page title under 60 chars including keyword",
  "urlSlug": "keyword-as-url-slug-with-hyphens",
  "metaDescription": "Meta description 140-155 chars with keyword and call to action",
  "h1": "H1 heading engaging and includes keyword",
  "imageAlt": "Alt text for hero image descriptive includes keyword",
  "blogContent": "<h2>Introduction</h2><p>Opening paragraph mentioning CC Hair and Beauty Leeds and the keyword naturally.</p><h2>Second heading</h2><p>Helpful content paragraph.</p><h2>Third heading</h2><p>More helpful content. Mention Chapeltown LS7 Roundhay LS8 and City Centre branches.</p><h2>Where to Find Us in Leeds</h2><p>CC Hair and Beauty has 3 branches in Leeds. Visit us at Chapeltown Road LS7 Roundhay Road LS8 or New York Street City Centre. Shop online at cchairandbeauty.com</p>"
}` }],
      }),
    })
    const d = await r.json()
    const text = d.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    res.status(200).json({ ok: true, ...parsed, keyword })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
