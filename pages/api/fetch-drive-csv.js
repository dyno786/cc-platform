export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { url } = req.body
  if (!url) return res.status(200).json({ ok: false, error: 'No URL provided' })

  try {
    // Extract file ID from any Google Drive/Sheets URL format
    let fileId = null
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
    ]
    for (const p of patterns) {
      const m = url.match(p)
      if (m) { fileId = m[1]; break }
    }

    if (!fileId) {
      return res.status(200).json({ ok: false, error: 'Could not extract file ID from URL' })
    }

    const isSheet = url.includes('spreadsheets')

    // Get OAuth access token using existing credentials
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      })
    })
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return res.status(200).json({ ok: false, error: 'Could not get Google access token. Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN in Vercel env vars.' })
    }

    // Download the file
    let downloadUrl
    if (isSheet) {
      // Export Google Sheet as CSV
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`
    } else {
      // Download regular file (CSV)
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    }

    const fileRes = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (!fileRes.ok) {
      const errText = await fileRes.text()
      return res.status(200).json({ ok: false, error: `Drive API error ${fileRes.status}: ${errText.slice(0, 200)}` })
    }

    const text = await fileRes.text()

    if (!text || text.trim().length < 10) {
      return res.status(200).json({ ok: false, error: 'File appears empty' })
    }

    const lines = text.trim().split('\n')
    console.log('[fetch-drive-csv] Successfully read', lines.length, 'rows from', fileId)

    res.status(200).json({
      ok: true,
      content: text.slice(0, 100000),
      lines: lines.length,
      preview: lines.slice(0, 2).join(' | '),
      fileId,
    })
  } catch(e) {
    console.error('[fetch-drive-csv] Error:', e.message)
    res.status(200).json({ ok: false, error: e.message })
  }
}
