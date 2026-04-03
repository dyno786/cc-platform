export const config = { maxDuration: 60 }

const BLOG_HANDLES = {
  local: 'leeds',
  ads:   'product-reviews',
  org:   'hair-care-guides',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { title, seoTitle, metaDesc, slug, content, imageUrl, imageAlt, imageFilename, cat, keywords } = req.body

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  const base = `https://${shop}/admin/api/2024-01`

  try {
    // Step 1 — find the correct blog by handle
    const blogHandle = BLOG_HANDLES[cat] || 'news'
    const blogsRes = await fetch(`${base}/blogs.json`, { headers })
    const blogsData = await blogsRes.json()
    const blog = blogsData.blogs?.find(b => b.handle === blogHandle)
      || blogsData.blogs?.find(b => b.handle === 'news')
      || blogsData.blogs?.[0]

    if (!blog) {
      return res.status(200).json({ ok: false, error: 'No blog found in Shopify. Please create the blog first.' })
    }

    console.log(`[publish] Using blog: ${blog.title} (${blog.handle}) id:${blog.id}`)

    // Step 2 — use image URL directly (Shopify CDN or any public URL)
    let featuredImageUrl = imageUrl || null
    console.log(`[publish] Image URL: ${featuredImageUrl ? 'provided' : 'none'}`)

    // Step 3 — build article body with image embedded after h1
    let body = content || ''
    if (featuredImageUrl) {
      const imgHtml = `\n<img src="${featuredImageUrl}" alt="${imageAlt || title}" style="width:100%;max-width:800px;height:auto;border-radius:8px;margin:16px 0 24px;" loading="lazy"/>\n`
      if (body.includes('</h1>')) {
        body = body.replace('</h1>', `</h1>${imgHtml}`)
      } else {
        body = imgHtml + body
      }
    }

    // Step 4 — create the article
    const articleRes = await fetch(`${base}/blogs/${blog.id}/articles.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        article: {
          title,
          body_html: body,
          handle: slug,
          published: true,
          tags: keywords?.join(', ') || '',
          metafields: [
            { key: 'title_tag',       value: seoTitle || title,  type: 'single_line_text_field', namespace: 'global' },
            { key: 'description_tag', value: metaDesc || '',      type: 'single_line_text_field', namespace: 'global' },
          ],
          ...(featuredImageUrl ? { image: { src: featuredImageUrl, alt: imageAlt || title } } : {}),
        }
      })
    })

    const articleData = await articleRes.json()

    if (articleData.errors) {
      const errMsg = JSON.stringify(articleData.errors)
      console.error(`[publish] Article error:`, errMsg)
      return res.status(200).json({ ok: false, error: errMsg })
    }

    const article = articleData.article
    const liveUrl = `https://cchairandbeauty.com/blogs/${blog.handle}/${article.handle}`

    console.log(`[publish] Published: ${liveUrl}`)

    res.status(200).json({
      ok: true,
      articleId: article.id,
      articleUrl: liveUrl,
      blogTitle: blog.title,
      imageUploaded: !!featuredImageUrl,
    })

  } catch(e) {
    console.error(`[publish] Exception:`, e.message)
    res.status(200).json({ ok: false, error: e.message })
  }
}
