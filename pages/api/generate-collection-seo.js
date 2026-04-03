export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { collection, keywords, currentTitle } = req.body

  const prompt = `You are an SEO expert for CC Hair and Beauty, a Leeds UK afro hair and beauty retailer established 1979.
Store: cchairandbeauty.com | 3 branches: Chapeltown LS7, Roundhay LS8, City Centre LS2.

Write complete SEO content for this Shopify collection page:

COLLECTION NAME: ${collection}
CURRENT TITLE (needs improving): ${currentTitle}
TARGET KEYWORDS: ${keywords}

Return ONLY a JSON object with this exact structure:
{
  "metaTitle": "SEO optimised title under 70 characters including primary keyword and brand name CC Hair and Beauty Leeds",
  "metaDescription": "SEO meta description 140-155 characters including primary keyword, location, and call to action",
  "collectionDescription": "200-250 word HTML description for the collection page using h2 for subheading, p tags for paragraphs. Include the primary keyword naturally 3-4 times. Mention CC Hair and Beauty, Leeds, and the relevant branch postcodes. End with a call to action to shop online or visit in store. Pure HTML only, no markdown.",
  "altText": "Alt text for the collection hero image under 125 characters",
  "filename": "seo-friendly-filename-for-collection-image.jpg",
  "internalLinks": ["suggestion for internal link anchor text and destination 1", "suggestion 2", "suggestion 3"]
}

No markdown, no backticks, pure JSON only.`

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
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const d = await r.json()
    const text = d.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean.match(/\{[\s\S]*\}/)[0])
    res.status(200).json({ ok: true, result })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
