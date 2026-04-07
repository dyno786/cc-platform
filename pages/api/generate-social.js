export const config = {
  maxDuration: 60,
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { imageBase64, mimeType, branch, postType, postTypeLabel, mediaType, productText } = req.body
  const isTextMode = !imageBase64 && !!productText
  if (!branch || !postType || (!imageBase64 && !productText)) return res.status(400).json({ ok: false, error: 'Missing required fields — need either image or product text' })

  const isVideo = mediaType === 'reel'

  const prompt = `You are writing social media content for CC Hair and Beauty Leeds, a community hair and beauty retailer established in 1979 with 3 branches (Chapeltown LS7, Roundhay LS8, City Centre).

This is a ${postTypeLabel} post for the ${branch} branch.
Media type: ${isVideo ? 'Short video/Reel' : 'Photo post'}
${isTextMode ? `Product details: ${productText}` : 'Look at the product image provided.'}

Generate the following social media content. Return as JSON only, no markdown, no backticks, no extra text:

{
  "productName": "Your best guess at the product name from the image",
  "instagram": {
    "caption": "Engaging Instagram caption, 2-3 short paragraphs, friendly tone, mentions ${branch} branch, ends with call to action to visit or shop at cchairandbeauty.com. ${isVideo ? 'Written for a Reel — punchy opening hook, fast energy.' : 'Written for a photo post — warm and informative.'}",
    "hashtags": "20-25 relevant hashtags as a single string — mix of product-specific, Leeds local (#LeedsHair #LeedsBeauty #ChapeltownLeeds etc), afro hair community and UK beauty hashtags"
  },
  "facebook": {
    "caption": "Facebook post — more conversational and community-focused, slightly longer than Instagram, mentions CC Hair and Beauty Leeds as a community business since 1979, includes cchairandbeauty.com. Warm Leeds community tone."
  },
  "tiktok": {
    "hook": "${isVideo ? 'First 3 seconds hook — one short punchy sentence that stops the scroll, written for spoken word on camera' : 'Photo carousel opening text — short trend-aware caption for TikTok photo mode'}",
    "caption": "TikTok caption — short and energetic, ${isVideo ? 'suggest a trending audio sound that would fit this type of product video,' : ''} 3-5 hashtags only, uses current TikTok language naturally without being forced"
  },
  "gbp": {
    "post": "Google Business Profile post — max 280 characters, professional, mentions the specific branch (${branch}), includes the product name and a call to action"
  }
}`

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
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    })

    if (!r.ok) {
      const err = await r.text()
      return res.status(200).json({ ok: false, error: `API error: ${r.status}` })
    }

    const d = await r.json()
    const text = d.content?.[0]?.text || ''
    // Strip any markdown fences and find the JSON object
    let clean = text.replace(/```json|```/g, '').trim()
    // Extract just the JSON object if there's surrounding text
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[generate-social] No JSON found in response:', text.slice(0, 200))
      return res.status(200).json({ ok: false, error: 'AI did not return valid JSON', raw: text.slice(0, 500) })
    }
    const parsed = JSON.parse(jsonMatch[0])
    res.status(200).json({ ok: true, ...parsed })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
