export const config = {
  maxDuration: 60,
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { imageBase64, mimeType, branch, postType, postTypeLabel, mediaType, productText } = req.body
  const isTextMode = !imageBase64 && !!productText

  if (!branch || !postType) return res.status(400).json({ ok: false, error: 'Missing branch or postType' })
  if (!imageBase64 && !productText) return res.status(400).json({ ok: false, error: 'Need either image or product text' })

  const isVideo = mediaType === 'reel'

  const jsonSchema = `{
  "productName": "name of the product",
  "instagram": {
    "caption": "2-3 paragraph Instagram caption, mentions ${branch}, ends with cchairandbeauty.com",
    "hashtags": "20-25 hashtags starting with # — Leeds local, product-specific, afro hair and UK beauty"
  },
  "facebook": {
    "caption": "Slightly longer Facebook post, community tone, mentions CC Hair and Beauty Leeds since 1979, includes cchairandbeauty.com"
  },
  "tiktok": {
    "hook": "${isVideo ? 'One punchy spoken-word hook for first 3 seconds of video' : 'Short TikTok photo mode opening caption'}",
    "caption": "Short TikTok caption, 3-5 hashtags only, current TikTok language"
  },
  "gbp": {
    "post": "Google Business Profile post, max 280 chars, mentions ${branch} branch and product name"
  }
}`

  const textContent = isTextMode
    ? `Product: ${productText}\nPost type: ${postTypeLabel}\nBranch: ${branch}\nMedia: ${isVideo ? 'Reel/Video' : 'Photo post'}\n\nWrite social media content for this product. Return JSON only, no markdown:\n${jsonSchema}`
    : `This is a ${postTypeLabel} post for CC Hair and Beauty Leeds ${branch} branch.\nMedia: ${isVideo ? 'Reel/Video' : 'Photo post'}\n\nLook at the product image and write social media content. Return JSON only, no markdown:\n${jsonSchema}`

  // Build message content — text only OR image + text
  const messageContent = isTextMode
    ? [{ type: 'text', text: textContent }]
    : [
        { type: 'image', source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imageBase64 } },
        { type: 'text', text: textContent }
      ]

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: messageContent }]
      })
    })

    if (!r.ok) {
      const errText = await r.text()
      console.error('[generate-social] Anthropic error:', r.status, errText.slice(0, 200))
      return res.status(200).json({ ok: false, error: `Anthropic API error ${r.status}: ${errText.slice(0, 100)}` })
    }

    const d = await r.json()
    const text = d.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('[generate-social] No JSON in response:', text.slice(0, 300))
      return res.status(200).json({ ok: false, error: 'AI did not return valid JSON. Raw: ' + text.slice(0, 200) })
    }

    const parsed = JSON.parse(match[0])
    res.status(200).json({ ok: true, ...parsed })
  } catch(e) {
    console.error('[generate-social] Error:', e.message)
    res.status(200).json({ ok: false, error: e.message })
  }
}
