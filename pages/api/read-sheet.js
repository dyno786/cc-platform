export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  const sheetId = '1PcGT29XY-yhowz3-NWgwxvj0frfIAiqfG7J30WGp9Wg'
  const gid = '1120701758'

  try {
    // Get access token using existing refresh token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        grant_type:    'refresh_token',
      }),
    })
    const { access_token, error } = await tokenRes.json()
    if (!access_token) return res.status(200).json({ ok: false, error: error || 'No access token' })

    // Read all sheets in the spreadsheet first
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
    const meta = await metaRes.json()
    if (meta.error) return res.status(200).json({ ok: false, error: meta.error.message, hint: 'Enable Google Sheets API or check permissions' })

    const sheets = meta.sheets?.map(s => ({ title: s.properties.title, sheetId: s.properties.sheetId, rows: s.properties.gridProperties?.rowCount }))

    // Read first sheet data
    const dataRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheets[0]?.title || 'Sheet1')}?majorDimension=ROWS`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
    const data = await dataRes.json()

    res.status(200).json({
      ok: true,
      sheets,
      firstSheetPreview: data.values?.slice(0, 5), // first 5 rows
      totalRows: data.values?.length,
    })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
