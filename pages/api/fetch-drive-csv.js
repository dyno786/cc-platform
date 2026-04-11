export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { url } = req.body
  if (!url) return res.status(200).json({ ok: false, error: 'No URL provided' })

  try {
    let fileId = null

    // Extract file ID from any Google Drive URL format
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
    ]
    for (const p of patterns) {
      const m = url.match(p)
      if (m) { fileId = m[1]; break }
    }

    if (!fileId) {
      return res.status(200).json({ ok: false, error: 'Could not extract file ID from URL. Make sure you paste a Google Drive file link.' })
    }

    // Use the export/download endpoint that bypasses virus check
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`

    const r = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/csv,text/plain,*/*',
      },
      redirect: 'follow',
    })

    const contentType = r.headers.get('content-type') || ''
    const text = await r.text()

    // Check if we got HTML (Google warning page or login page)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      // Try alternate direct download approach
      const altUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`
      const r2 = await fetch(altUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow',
      })
      const text2 = await r2.text()

      if (text2.trim().startsWith('<!DOCTYPE') || text2.trim().startsWith('<html')) {
        return res.status(200).json({
          ok: false,
          error: 'Google Drive returned a login page. Please make sure: 1) The file is shared with "Anyone with the link", 2) You copied the correct share link.'
        })
      }

      if (!text2 || text2.trim().length < 20) {
        return res.status(200).json({ ok: false, error: 'File appears empty' })
      }

      const lines = text2.trim().split('\n')
      return res.status(200).json({
        ok: true,
        content: text2.slice(0, 100000),
        lines: lines.length,
        preview: lines.slice(0, 2).join(' | '),
      })
    }

    if (!text || text.trim().length < 20) {
      return res.status(200).json({ ok: false, error: 'File appears empty or could not be read' })
    }

    const lines = text.trim().split('\n')
    res.status(200).json({
      ok: true,
      content: text.slice(0, 100000),
      lines: lines.length,
      preview: lines.slice(0, 2).join(' | '),
    })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
