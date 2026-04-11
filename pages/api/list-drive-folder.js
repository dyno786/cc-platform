export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { folderId } = req.body
  if (!folderId) return res.status(200).json({ ok: false, error: 'No folder ID' })

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      })
    })
    const tokenData = await tokenRes.json()
    console.log('[list-drive-folder] token response:', JSON.stringify(tokenData).slice(0,200))
    const access_token = tokenData.access_token
    if (!access_token) {
      return res.status(200).json({ 
        ok: false, 
        error: 'No access token. Google said: ' + (tokenData.error_description || tokenData.error || 'unknown error')
      })
    }

    const r = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,modifiedTime,size)&orderBy=modifiedTime+desc`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
    const d = await r.json()
    res.status(200).json({ ok: true, files: d.files || [] })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
