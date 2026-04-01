export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { product, contentType, collection } = req.body

  const subject = product
    ? `the product "${product.title}"${product.product_type ? ' ('+product.product_type+')' : ''}`
    : `the collection "${collection}"`

  const prompts = {
    blog: `Write a 400-word SEO blog post for CC Hair & Beauty (Leeds UK hair shop est. 1979, 3 branches: Chapeltown LS7, Roundhay LS8, City Centre) about ${subject}. Include: engaging intro, product/topic benefits, why Leeds customers love it, call to action to visit cchairandbeauty.com. Use natural keywords for Leeds hair shoppers. Format with a title and 3-4 paragraphs.`,
    gbp:  `Write a Google Business Profile post for CC Hair & Beauty Leeds about ${subject}. 2-3 sentences max, start with a relevant emoji, include a call to action. Keep it natural, not salesy. If relevant use one of these codes: WIGDEAL15, COLOUR10, EDGE15, BRAID10.`,
    ad:   `Write a Google Ads description for CC Hair & Beauty about ${subject}. Maximum 90 characters. Focus on value and urgency. Include "Leeds" if it fits.`,
    social:`Write an Instagram caption for CC Hair & Beauty Leeds about ${subject}. Engaging and authentic tone. End with relevant hashtags including #LeedsHair #CCHairBeauty #NaturalHair.`,
    meta: `Write an SEO meta description for CC Hair & Beauty's page about ${subject}. Maximum 155 characters. Include "Leeds", a primary keyword, and a call to action.`,
  }

  const prompt = prompts[contentType] || prompts.gbp

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
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const d = await r.json()
    res.status(200).json({ ok: true, content: d.content?.[0]?.text || '', contentType })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
