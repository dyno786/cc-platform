export const config = { maxDuration: 60 }

const BIZ = `CC Hair & Beauty is Leeds' largest afro hair and beauty retailer established in 1979.
3 branches: Chapeltown LS7 (Chapeltown Road), Roundhay LS8 (Roundhay Road), City Centre (New York Street).
Shopify store: cchairandbeauty.com with 23,000+ products.
Discount codes: WIGDEAL15 (15% wigs), COLOUR10 (10% hair dye), EDGE15 (15% edge control), BRAID10 (10% braiding hair), OIL10 (10% hair oils), GROW10 (10% hair growth).
Tone: friendly, expert, helpful. Never name competitors directly.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { title, seoTitle, metaDesc, keywords, slug, cat, data } = req.body

  const catContext = {
    local: 'This is a LOCAL SEO blog post for CC Hair & Beauty Leeds. Focus on local Leeds context — mention specific branches (Chapeltown LS7, Roundhay LS8, City Centre), local customers, in-store experience, click and collect, parking. End with a call to action to visit the nearest branch or shop online at cchairandbeauty.com.',
    ads: 'This is a PRODUCT REVIEW blog post. This keyword converts extremely well in Google Ads. Write a genuine, helpful product review covering: what it is, who it is for, how to use it, results, pros and cons, price point, and where to buy. End with a call to action to buy at cchairandbeauty.com with the relevant discount code.',
    org: 'This is an ORGANIC SEO blog post targeting national search volume. Write a comprehensive, helpful guide that genuinely answers the search query. Include product recommendations available at CC Hair & Beauty, tips from experts, and practical advice. End with a call to action to shop at cchairandbeauty.com.'
  }

  const prompt = `${BIZ}

Write a complete, publish-ready blog post for CC Hair & Beauty website.

TITLE: ${title}
SEO TITLE: ${seoTitle}  
META DESCRIPTION: ${metaDesc}
TARGET KEYWORDS: ${keywords.join(', ')}
DATA/CONTEXT: ${data}
CATEGORY INSTRUCTION: ${catContext[cat]}

Write the full blog post in HTML format ready to paste into Shopify. Requirements:
- 700-900 words
- Use <h1> for the title
- Use <h2> for 3-4 subheadings 
- Use <p> for paragraphs
- Use <ul><li> for any lists
- Include the primary keyword naturally in: title, first paragraph, at least 2 subheadings, throughout body, last paragraph
- Include secondary keywords naturally throughout
- Mention CC Hair & Beauty by name at least 3 times
- Mention cchairandbeauty.com at least once
- End with a strong call to action paragraph with the most relevant discount code
- Write in a friendly, expert, helpful tone
- Sound like a real person who knows hair and beauty, not AI
- Do NOT include any markdown, backticks or code fences — pure HTML only
- Start directly with <h1> tag`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const d = await r.json()
  const content = d.content?.[0]?.text || ''
  res.status(200).json({ ok: true, content })
}
