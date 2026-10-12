// One-off helper: gathers Leeds salons from Google and the shop's own Leeds search terms for the Leeds salon page. Remove once run.
export const config = { maxDuration: 60 }
const Q = ['afro hair salon Leeds', 'black hair salon Leeds', 'braiders Leeds', 'knotless braids Leeds', 'hair braiding Chapeltown Leeds', 'afro barber Leeds', 'black barber shop Leeds', 'loc specialist Leeds', 'dreadlocks salon Leeds', 'wig install Leeds', 'natural hair salon Leeds', 'afro caribbean hairdresser Leeds', 'braids Harehills Leeds', 'african hair braiding Leeds']
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.query.step === 'places') {
      const key = process.env.GOOGLE_PLACES_KEY, seen = {}
      for (const q of Q) {
        const r = await fetch('https://places.googleapis.com/v1/places:searchText', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.types,places.primaryType,places.businessStatus,places.websiteUri,places.editorialSummary' }, body: JSON.stringify({ textQuery: q, regionCode: 'GB', maxResultCount: 20 }) })
        const d = await r.json()
        if (d.error) return res.status(200).json({ ok: false, error: d.error.message })
        for (const p of d.places || []) {
          if (!seen[p.id]) seen[p.id] = { id: p.id, name: p.displayName && p.displayName.text, addr: p.formattedAddress, phone: p.nationalPhoneNumber || '', primary: p.primaryType || '', types: (p.types || []).filter(t => !['point_of_interest', 'establishment'].includes(t)).join(','), status: p.businessStatus, web: p.websiteUri || '', about: p.editorialSummary ? p.editorialSummary.text : '', q: [] }
          seen[p.id].q.push(q)
        }
      }
      const list = Object.values(seen).filter(p => /Leeds|LS\d/.test(p.addr || ''))
      return res.status(200).json({ ok: true, count: list.length, list })
    }
    if (req.query.step === 'sc') {
      const t = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: process.env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' }) }).then(r => r.json())
      if (!t.access_token) return res.status(200).json({ ok: false, error: 'No Search Console access' })
      const end = new Date(), start = new Date(Date.now() - 180 * 864e5)
      const r = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Acchairandbeauty.com/searchAnalytics/query', { method: 'POST', headers: { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), dimensions: ['query'], rowLimit: 25000 }) }).then(r => r.json())
      if (r.error) return res.status(200).json({ ok: false, error: r.error.message })
      const re = /salon|braid|barber|hairdress|locs|dread|weave|wig install|stylist|hair dresser|cornrow|twist/i
      const rows = (r.rows || []).filter(x => re.test(x.keys[0]) && /leeds|ls\d|chapeltown|harehills|roundhay|headingley|beeston|armley|seacroft|near me/i.test(x.keys[0])).map(x => [x.keys[0], x.impressions, x.clicks, Math.round(x.position * 10) / 10]).sort((a, b) => b[1] - a[1]).slice(0, 80)
      return res.status(200).json({ ok: true, rows })
    }
    res.status(200).json({ ok: false })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
