// One-off helper: lists the shop's Search Console terms that mention Leeds or "near me". Remove once run.
export const config = { maxDuration: 60 }
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const t = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: process.env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' }) }).then(r => r.json())
    const end = new Date(), start = new Date(Date.now() - 365 * 864e5)
    const r = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Acchairandbeauty.com/searchAnalytics/query', { method: 'POST', headers: { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), dimensions: ['query'], rowLimit: 25000 }) }).then(r => r.json())
    if (r.error) return res.status(200).json({ ok: false, error: r.error.message })
    const re = new RegExp(req.query.re || 'leeds|chapeltown|harehills|roundhay|ls\\d', 'i')
    const rows = (r.rows || []).filter(x => re.test(x.keys[0])).map(x => [x.keys[0], x.impressions, x.clicks, Math.round(x.position)]).sort((a, b) => b[1] - a[1]).slice(0, 150)
    res.status(200).json({ ok: true, total: (r.rows || []).length, rows })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
