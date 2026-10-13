// One-off helper: Search Console data for the Hair Extensions Leeds rewrite. Remove once used.
export const config = { maxDuration: 60 }
async function token() {
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: process.env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' }) })
  return (await r.json()).access_token
}
async function q(t, body) {
  const end = new Date(), start = new Date(); start.setDate(end.getDate() - 365)
  const r = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Acchairandbeauty.com/searchAnalytics/query', { method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({ startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), rowLimit: 150 }, body)) })
  const j = await r.json()
  return (j.rows || []).map(x => [x.keys.join(' | '), x.clicks, x.impressions, +x.position.toFixed(1)])
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const t = await token()
    const ext = await q(t, { dimensions: ['query'], dimensionFilterGroups: [{ filters: [{ dimension: 'query', operator: 'contains', expression: 'extension' }] }] })
    const page = await q(t, { dimensions: ['query'], dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'contains', expression: 'hair-extensions-leeds' }] }] })
    const who = await q(t, { dimensions: ['page'], dimensionFilterGroups: [{ filters: [{ dimension: 'query', operator: 'contains', expression: 'extensions leeds' }] }] })
    res.status(200).json({ ext, page, who })
  } catch (e) { res.status(200).json({ error: String(e.message || e) }) }
}
