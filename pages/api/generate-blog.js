export const config = { maxDuration: 60 }

const BIZ = `CC Hair and Beauty is Leeds' largest afro hair and beauty retailer established in 1979.
3 branches: Chapeltown LS7 (Chapeltown Road), Roundhay LS8 (Roundhay Road), City Centre (New York Street).
Shopify store: cchairandbeauty.com with 23,000+ products.
Discount codes: WIGDEAL15 (15% wigs), COLOUR10 (10% hair dye), EDGE15 (15% edge control), BRAID10 (10% braiding hair), OIL10 (10% hair oils), GROW10 (10% hair growth).
Tone: friendly, expert, helpful. Never name competitors directly.`

const CAT = {
  local: 'LOCAL SEO post. Focus on Leeds context — mention branches (Chapeltown LS7, Roundhay LS8, City Centre), local customers, in-store experience. End with CTA to visit nearest branch or shop online.',
  ads:   'PRODUCT REVIEW post. Keyword converts well in Ads. Write genuine helpful review: what it is, who for, how to use, results, pros/cons, price, where to buy. End with CTA to buy at cchairandbeauty.com with relevant discount code.',
  org:   'ORGANIC SEO post. Comprehensive helpful guide answering the search query. Include product recommendations, expert tips, practical advice. End with CTA to shop at cchairandbeauty.com.',
  community: 'COMMUNITY post. About local Leeds community news/events/stories — Chapeltown, Roundhay or city centre. Connect naturally to CC Hair and Beauty as community-rooted business since 1979. End with warm CTA to visit or shop.',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { title, seoTitle, metaDesc, keywords, slug, cat, data } = req.body

  // Validate required fields
  if (!title || !cat) {
    return res.status(400).json({ ok: false, error: 'Missing title or cat', content: '' })
  }

  const catInstructions = CAT[cat] || CAT.org

  const prompt = `${BIZ}

Write a complete, publish-ready blog post for CC Hair and Beauty website.

TITLE: ${title}
SEO TITLE: ${seoTitle || title}
META DESCRIPTION: ${metaDesc || ''}
TARGET KEYWORDS: ${Array.isArray(keywords) ? keywords.join(', ') : (keywords || title)}
DATA/CONTEXT: ${data || 'No additional context'}
CATEGORY: ${catInstructions}

Requirements:
- 700-900 words
- HTML format ready to paste into Shopify
- <h1> for title, <h2> for 3-4 subheadings, <p> for paragraphs, <ul><li> for lists
- Include primary keyword in title, first paragraph, at least 2 subheadings, throughout body
- Mention CC Hair and Beauty at least 3 times
- Mention cchairandbeauty.com at least once
- End with strong CTA paragraph with relevant discount code
- Friendly, expert, helpful tone — sound like a real person who knows hair and beauty
- NO markdown, NO backticks, NO code fences — pure HTML only
- Start directly with <h1> tag`

  try {
    console.log(`[generate-blog] Generating post: "${title}" cat:${cat}`)

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!r.ok) {
      const errText = await r.text()
      console.error(`[generate-blog] Anthropic API error ${r.status}: ${errText}`)
      return res.status(200).json({ ok: false, error: `Anthropic API error: ${r.status}`, content: '' })
    }

    const d = await r.json()

    if (d.error) {
      console.error(`[generate-blog] Anthropic error:`, JSON.stringify(d.error))
      return res.status(200).json({ ok: false, error: d.error.message || 'Anthropic error', content: '' })
    }

    const content = d.content?.[0]?.text || ''

    if (!content) {
      console.error(`[generate-blog] Empty content. Full response:`, JSON.stringify(d))
      return res.status(200).json({ ok: false, error: 'Empty response from AI', content: '' })
    }

    console.log(`[generate-blog] Success — ${content.length} chars generated`)
    res.status(200).json({ ok: true, content })

  } catch(e) {
    console.error(`[generate-blog] Exception:`, e.message)
    res.status(200).json({ ok: false, error: e.message, content: '' })
  }
}
