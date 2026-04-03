export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { url } = req.body
  if (!url) return res.status(400).json({ ok: false, error: 'Missing url' })

  try {
    const r = await fetch(url)
    if (!r.ok) return res.status(200).json({ ok: false, error: `Image fetch failed: ${r.status}` })

    const contentType = r.headers.get('content-type') || 'image/jpeg'
    const buffer = await r.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:${contentType};base64,${base64}`

    res.status(200).json({ ok: true, dataUrl, contentType })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
