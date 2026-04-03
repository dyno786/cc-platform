export const config = { maxDuration: 60 }

// TEST ENDPOINT — creates a real test blog post in Shopify
// DELETE the post after testing via Shopify admin
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  const base = `https://${shop}/admin/api/2024-01`
  const log = []

  try {
    // Step 1 — list all blogs
    log.push('Fetching blogs...')
    const blogsRes = await fetch(`${base}/blogs.json`, { headers })
    const blogsData = await blogsRes.json()
    const blogs = blogsData.blogs || []
    log.push(`Found ${blogs.length} blogs: ${blogs.map(b => `${b.title} (${b.handle})`).join(', ')}`)

    if (blogs.length === 0) {
      return res.status(200).json({ ok: false, log, error: 'No blogs found in Shopify' })
    }

    // Step 2 — find the leeds blog
    const blog = blogs.find(b => b.handle === 'leeds') || blogs[0]
    log.push(`Using blog: "${blog.title}" handle:"${blog.handle}" id:${blog.id}`)

    // Step 3 — create test article (draft, not published)
    log.push('Creating test article...')
    const articleRes = await fetch(`${base}/blogs/${blog.id}/articles.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        article: {
          title: '[TEST] CC Platform Debug Post — Delete Me',
          body_html: '<h1>CC Platform Test Post</h1><p>This is a test post created by the CC Intelligence Platform debug tool. Please delete this post from Shopify admin.</p><p>If you can see this, the Shopify publish integration is working correctly.</p>',
          handle: 'cc-platform-debug-test-' + Date.now(),
          published: false, // draft — won't show on live site
          tags: 'test, debug, delete-me',
        }
      })
    })

    const articleData = await articleRes.json()

    if (articleData.errors) {
      log.push(`Article creation FAILED: ${JSON.stringify(articleData.errors)}`)
      return res.status(200).json({ ok: false, log, error: JSON.stringify(articleData.errors) })
    }

    const article = articleData.article
    log.push(`✓ Article created! ID: ${article.id}`)
    log.push(`Admin URL: https://admin.shopify.com/store/cchairandbeauty/blogs/${blog.id}/articles/${article.id}`)
    log.push(`Status: ${article.published_at ? 'Published' : 'Draft (not live)'}`)
    log.push('✓ DELETE THIS TEST POST from Shopify admin when done')

    res.status(200).json({
      ok: true,
      log,
      article: {
        id: article.id,
        title: article.title,
        blog: blog.title,
        adminUrl: `https://admin.shopify.com/store/cchairandbeauty/blogs/${blog.id}/articles/${article.id}`,
        status: 'draft',
      }
    })

  } catch(e) {
    log.push(`Exception: ${e.message}`)
    res.status(200).json({ ok: false, log, error: e.message })
  }
}
