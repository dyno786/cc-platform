// Live SEO data for the CC SEO dashboard. Read only: it changes nothing in Google.
//
//   /api/seo-live?report=summary            totals now vs the period before, plus a daily series
//   /api/seo-live?report=queries            searches, now vs before (for rising and falling)
//   /api/seo-live?report=pages              pages, now vs before
//   /api/seo-live?report=page&path=/collections/edge-control    one page: totals, searches, devices
//   /api/seo-live?report=gbp                rating, review count and reviews for the three branches
//
// Optional on the Search Console reports: days=28 (7 to 90), country=gbr (or "all"), limit=500

export const config = { maxDuration: 60 }

const SITE = 'sc-domain:cchairandbeauty.com'
const ORIGIN = 'https://cchairandbeauty.com'
const PLACE_IDS = {
  Chapeltown: 'ChIJ_5jc6wlceUgRo_t7u41q3Dw',
  Roundhay: 'ChIJSwvcAYlbeUgRT7wTEeJy25A',
  'City Centre': 'ChIJqTbKkhlceUgRcbg1e3Z7Ezo',
}

const iso = d => d.toISOString().slice(0, 10)
const addDays = (d, n) => new Date(d.getTime() + n * 86400000)

// Search Console data settles after about two days, so periods end three days back.
function periods(days) {
  const end = addDays(new Date(), -3)
  const start = addDays(end, -(days - 1))
  const prevEnd = addDays(start, -1)
  const prevStart = addDays(prevEnd, -(days - 1))
  return { now: [iso(start), iso(end)], prev: [iso(prevStart), iso(prevEnd)] }
}

async function accessToken() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const d = await r.json()
  if (!d.access_token) {
    const e = new Error('Google sign-in failed: ' + (d.error || 'no token') + '. Renew GOOGLE_REFRESH_TOKEN at /api/search-console-auth, then redeploy.')
    e.code = 'auth'
    throw e
  }
  return d.access_token
}

async function sc(token, range, dimensions, filters, rowLimit) {
  const body = { startDate: range[0], endDate: range[1], dimensions, rowLimit: rowLimit || 1000, type: 'web' }
  if (filters.length) body.dimensionFilterGroups = [{ filters }]
  const r = await fetch('https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(SITE) + '/searchAnalytics/query', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const d = await r.json()
  if (d.error) {
    const e = new Error('Search Console: ' + (d.error.message || 'request failed'))
    e.code = 'sc'
    throw e
  }
  return d.rows || []
}

const tot = rows => {
  const r = rows[0] || {}
  return { clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.impressions ? r.clicks / r.impressions : 0, position: r.position ? Math.round(r.position * 10) / 10 : 0 }
}

// Join the current and previous period by key, so each row carries both.
function joined(now, prev, limit) {
  const before = new Map(prev.map(r => [r.keys[0], r]))
  const seen = new Set()
  const out = now.map(r => {
    const p = before.get(r.keys[0]) || {}
    seen.add(r.keys[0])
    return { key: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: Math.round(r.position * 10) / 10,
      prevClicks: p.clicks || 0, prevImpressions: p.impressions || 0, prevPosition: p.position ? Math.round(p.position * 10) / 10 : null }
  })
  // rows that had clicks before and have vanished now are the sharpest falls
  prev.forEach(p => {
    if (!seen.has(p.keys[0]) && p.clicks > 0) out.push({ key: p.keys[0], clicks: 0, impressions: 0, position: null,
      prevClicks: p.clicks, prevImpressions: p.impressions, prevPosition: Math.round(p.position * 10) / 10 })
  })
  return out.slice(0, limit)
}

async function gbp() {
  const key = process.env.GOOGLE_PLACES_KEY
  const fields = 'name,rating,user_ratings_total,formatted_address,opening_hours,reviews'
  const branches = await Promise.all(Object.entries(PLACE_IDS).map(async ([branch, placeId]) => {
    const r = await fetch('https://maps.googleapis.com/maps/api/place/details/json?place_id=' + placeId + '&fields=' + fields + '&key=' + key + '&language=en&reviews_sort=newest')
    const d = await r.json()
    if (d.status !== 'OK') return { branch, placeId, ok: false, error: d.status + (d.error_message ? ': ' + d.error_message : '') }
    const p = d.result || {}
    return {
      branch, placeId, ok: true, name: p.name, rating: p.rating, reviewCount: p.user_ratings_total, address: p.formatted_address,
      hours: (p.opening_hours && p.opening_hours.weekday_text) || [],
      reviewLink: 'https://search.google.com/local/writereview?placeid=' + placeId,
      reviews: (p.reviews || []).map(v => ({ author: v.author_name, stars: v.rating, text: v.text, when: v.relative_time_description, time: v.time })),
    }
  }))
  return { ok: true, report: 'gbp', fetchedAt: new Date().toISOString(), branches }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex')
  const report = String(req.query.report || 'summary')
  try {
    if (report === 'gbp') return res.status(200).json(await gbp())

    const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 28))
    const country = String(req.query.country || 'gbr').toLowerCase()
    const limit = Math.min(2000, Math.max(10, parseInt(req.query.limit, 10) || 500))
    const filters = country === 'all' ? [] : [{ dimension: 'country', operator: 'equals', expression: country }]
    const per = periods(days)
    const token = await accessToken()
    const base = { ok: true, report, days, country, period: per.now, previousPeriod: per.prev, searchType: 'web', fetchedAt: new Date().toISOString() }

    if (report === 'summary') {
      const [a, b, daily] = await Promise.all([
        sc(token, per.now, [], filters, 1), sc(token, per.prev, [], filters, 1),
        sc(token, [per.prev[0], per.now[1]], ['date'], filters, 400),
      ])
      return res.status(200).json({ ...base, totals: tot(a), previous: tot(b),
        daily: daily.map(r => [r.keys[0], r.clicks, r.impressions, Math.round(r.position * 10) / 10]) })
    }

    if (report === 'queries' || report === 'pages') {
      const dim = report === 'queries' ? 'query' : 'page'
      const [a, b] = await Promise.all([sc(token, per.now, [dim], filters, 5000), sc(token, per.prev, [dim], filters, 5000)])
      let rows = joined(a, b, 6000)
      if (dim === 'page') rows = rows.map(r => ({ ...r, key: r.key.replace(/^https?:\/\/(www\.)?cchairandbeauty\.com/, '') || '/' }))
      rows.sort((x, y) => (y.clicks + y.prevClicks) - (x.clicks + x.prevClicks) || y.impressions - x.impressions)
      return res.status(200).json({ ...base, rowCount: rows.length, rows: rows.slice(0, limit) })
    }

    if (report === 'page') {
      const path = String(req.query.path || '')
      if (!/^\/[A-Za-z0-9\-_/.%]*$/.test(path)) return res.status(400).json({ ok: false, error: 'Give a path that starts with /, for example /collections/edge-control' })
      // match the address with or without www, and nothing longer
      const rx = '^https://(www\\.)?cchairandbeauty\\.com' + path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'
      const pageOnly = [{ dimension: 'page', operator: 'includingRegex', expression: rx }]
      const pf = filters.concat(pageOnly)
      const [a, b, q, qPrev, dev, ctry] = await Promise.all([
        sc(token, per.now, [], pf, 1), sc(token, per.prev, [], pf, 1),
        sc(token, per.now, ['query'], pf, 1000), sc(token, per.prev, ['query'], pf, 1000),
        sc(token, per.now, ['device'], pf, 5), sc(token, per.now, ['country'], pageOnly, 8),
      ])
      const queries = joined(q, qPrev, 1000).sort((x, y) => y.impressions - x.impressions)
      const sumI = queries.reduce((s, r) => s + r.impressions, 0), sumC = queries.reduce((s, r) => s + r.clicks, 0)
      return res.status(200).json({ ...base, path, url: ORIGIN + path, totals: tot(a), previous: tot(b),
        queryRowCount: queries.length, queryImpressions: sumI, queryClicks: sumC, queries: queries.slice(0, Math.min(limit, 200)),
        devices: dev.map(r => ({ device: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: Math.round(r.position * 10) / 10 })),
        countries: ctry.map(r => ({ country: r.keys[0], clicks: r.clicks, impressions: r.impressions })) })
    }

    return res.status(400).json({ ok: false, error: 'Unknown report. Use summary, queries, pages, page or gbp.' })
  } catch (e) {
    return res.status(200).json({ ok: false, report, code: e.code || 'error', error: e.message })
  }
}
