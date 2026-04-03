export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { title, cat, keywords } = req.body

  // Build a tailored prompt based on blog category
  const catPrompts = {
    local: `Professional ecommerce product photography style. A clean, bright hair and beauty retail shop interior in Leeds UK. Shelves stocked with hair products, wigs on display stands, braiding hair packages. Modern, welcoming, professional. Topic: ${title}. Photorealistic, natural lighting, white and clean aesthetic.`,
    ads:   `Professional product photography on a clean white background. Beautiful hair and beauty product shot. The product is the hero. Studio lighting, sharp focus, ecommerce style. Topic: ${title}. Keywords: ${keywords?.slice(0,3).join(', ')}. Clean, professional, commercial quality.`,
    org:   `Beautiful lifestyle hair photography. A woman with gorgeous natural afro or relaxed hair showing the result of the hair care topic. Natural lighting, warm tones, professional beauty editorial style. Topic: ${title}. UK hair and beauty aesthetic. No text overlay.`,
  }

  const prompt = catPrompts[cat] || catPrompts.org

  try {
    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
        style: 'natural',
      })
    })

    const d = await r.json()

    if (d.error) {
      return res.status(200).json({ ok: false, error: d.error.message })
    }

    const imageUrl = d.data?.[0]?.url
    if (!imageUrl) return res.status(200).json({ ok: false, error: 'No image returned' })

    // Fetch the image immediately and convert to base64
    // This avoids OpenAI URL expiry issues — image is self-contained
    const imgResponse = await fetch(imageUrl)
    const arrayBuffer = await imgResponse.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    const altText = `${title} - CC Hair & Beauty Leeds`
    const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.png'

    res.status(200).json({
      ok: true,
      imageUrl: dataUrl,
      altText,
      filename,
      prompt,
    })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
