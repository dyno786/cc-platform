export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { url } = req.body
  if (!url) return res.status(400).json({ ok: false, error: 'No URL provided' })

  try {
    // Convert Google Drive share URL to direct download URL
    let downloadUrl = url
    // Handle: https://drive.google.com/file/d/FILE_ID/view
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileMatch) {
      downloadUrl = `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`
    }
    // Handle: https://docs.google.com/spreadsheets/d/FILE_ID/...
    const sheetMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
    if (sheetMatch) {
      downloadUrl = `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=csv`
    }

    const r = await fetch(downloadUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    })

    if (!r.ok) {
      return res.status(200).json({ ok: false, error: `Could not fetch file: ${r.status} ${r.statusText}. Make sure the file is shared with "Anyone with the link".` })
    }

    const text = await r.text()
    if (!text || text.trim().length < 10) {
      return res.status(200).json({ ok: false, error: 'File appears empty or could not be read' })
    }

    // Check it looks like CSV
    const lines = text.trim().split('\n')
    res.status(200).json({
      ok: true,
      content: text.slice(0, 50000), // max 50KB
      lines: lines.length,
      preview: lines.slice(0, 3).join('\n'),
    })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
