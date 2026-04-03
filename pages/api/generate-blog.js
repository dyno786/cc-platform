export const config = { maxDuration: 60 }

const BIZ = `CC Hair and Beauty is Leeds' largest afro hair and beauty retailer established in 1979.
3 branches: Chapeltown LS7, Roundhay LS8, City Centre (New York Street).
Store: cchairandbeauty.com — 23,000+ products.
Discount codes: WIGDEAL15 (15% wigs), COLOUR10 (10% hair dye), EDGE15 (15% edge control), BRAID10 (10% braiding hair), OIL10 (10% hair oils), GROW10 (10% hair growth).
Tone: friendly, expert, helpful. Never name competitors.`

const CAT = {
  local:     'LOCAL SEO post. Focus on Leeds — mention branches (Chapeltown LS7, Roundhay LS8, City Centre). End with CTA to visit nearest branch or shop at cchairandbeauty.com.',
  ads:       'PRODUCT REVIEW post. Genuine helpful review: what it is, who for, how to use, results, pros/cons, where to buy. End with CTA and relevant discount code.',
  org:       'ORGANIC SEO post. Comprehensive helpful guide answering the search query. Include tips, advice, product recommendations. End with CTA to shop at cchairandbeauty.com.',
  community: 'COMMUNITY post. Local Leeds community story. Connect naturally to CC Hair and Beauty as community business since 1979. End with warm CTA.',
}

async function searchProducts(shop, token, keywords) {
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  const allProducts = []
  const seen = new Set()

  // Search for each keyword — take first 3 results each
  for (const kw of keywords.slice(0, 3)) {
    try {
      const r = await fetch(
        `https://${shop}/admin/api/2024-01/products.json?title=${encodeURIComponent(kw)}&limit=3&fields=id,title,handle,images,variants`,
        { headers }
      )
      const d = await r.json()
      for (const p of (d.products || [])) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          allProducts.push({
            title: p.title,
            url: `https://cchairandbeauty.com/products/${p.handle}`,
            image: p.images?.[0]?.src || null,
            imageAlt: p.images?.[0]?.alt || p.title,
            price: p.variants?.[0]?.price || null,
          })
        }
      }
    } catch(e) {
      console.error(`[generate-blog] Product search failed for "${kw}":`, e.message)
    }
  }
  return allProducts.slice(0, 6)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { title, seoTitle, metaDesc, keywords, slug, cat, data } = req.body

  if (!title || !cat) {
    return res.status(400).json({ ok: false, error: 'Missing title or cat', content: '' })
  }

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN

  // Step 1 — search Shopify for real matching products
  console.log(`[generate-blog] Searching products for: ${keywords?.slice(0,3).join(', ')}`)
  const products = await searchProducts(shop, token, keywords || [title])

  // Pick featured image from first product that has one
  const featuredProduct = products.find(p => p.image)
  const featuredImage = featuredProduct ? {
    src: featuredProduct.image,
    alt: featuredProduct.imageAlt,
    productUrl: featuredProduct.url,
  } : null

  console.log(`[generate-blog] Found ${products.length} products. Featured image: ${featuredImage ? featuredProduct.title : 'none'}`)

  // Step 2 — build product list for AI to use
  const productList = products.length > 0
    ? products.map(p => `- ${p.title} | URL: ${p.url} | Price: £${p.price || 'varies'}`).join('\n')
    : 'No specific products found — mention the category generally and link to cchairandbeauty.com'

  const catInstructions = CAT[cat] || CAT.org

  const prompt = `${BIZ}

Write a complete, publish-ready blog post for CC Hair and Beauty website.

TITLE: ${title}
SEO TITLE: ${seoTitle || title}
META DESCRIPTION: ${metaDesc || ''}
TARGET KEYWORDS: ${Array.isArray(keywords) ? keywords.join(', ') : (keywords || title)}
DATA/CONTEXT: ${data || ''}
CATEGORY: ${catInstructions}

REAL PRODUCTS FROM OUR SHOPIFY STORE — USE THESE WITH EXACT LINKS:
${productList}

CRITICAL INSTRUCTIONS FOR PRODUCT LINKS:
- You MUST link to these real products using <a href="[URL]">[product name]</a> tags
- Link each product name the FIRST time you mention it in the body
- Use the exact URLs provided above — do not change them
- Recommend 2-4 products naturally within the content
- If a product has a price, mention it: "available from £[price] at CC Hair and Beauty"

Requirements:
- 700-900 words
- HTML format ready to paste into Shopify
- <h1> for title, <h2> for 3-4 subheadings, <p> for paragraphs, <ul><li> for lists
- Include primary keyword in title, first paragraph, 2+ subheadings, throughout body
- Mention CC Hair and Beauty at least 3 times
- Link to cchairandbeauty.com at least once
- End with strong CTA paragraph with the most relevant discount code
- Sound like a real expert — not AI-generated
- NO markdown, NO backticks — pure HTML only
- Start directly with <h1> tag`

  try {
    console.log(`[generate-blog] Generating: "${title}" cat:${cat} products:${products.length}`)

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
      console.error(`[generate-blog] Anthropic error ${r.status}:`, errText)
      return res.status(200).json({ ok: false, error: `Anthropic API error: ${r.status}`, content: '' })
    }

    const d = await r.json()
    if (d.error) return res.status(200).json({ ok: false, error: d.error.message, content: '' })

    const content = d.content?.[0]?.text || ''
    if (!content) return res.status(200).json({ ok: false, error: 'Empty response from AI', content: '' })

    console.log(`[generate-blog] Success — ${content.length} chars, ${products.length} products linked`)

    res.status(200).json({
      ok: true,
      content,
      products,        // return products so blog planner can show them
      featuredImage,   // real Shopify product image to use instead of DALL-E
    })

  } catch(e) {
    console.error(`[generate-blog] Exception:`, e.message)
    res.status(200).json({ ok: false, error: e.message, content: '' })
  }
}
