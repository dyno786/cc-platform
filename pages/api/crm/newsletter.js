// Tonight's newsletter with a live stock and price check.
//   GET /api/crm/newsletter                 list of emails + which is tonight's
//   GET /api/crm/newsletter?day=wed&aud=local&app=1&offer=0&offerText=...   the HTML + subject + segment
import { getJSON, PATHS } from '../../../lib/crm/store'
import { mergeSettings } from '../../../lib/crm/engine'
import { DAYS, EXTRA, checkDay, nightly, todayKey, SEGMENT_FOR } from '../../../lib/crm/newsletter'
import { SEGMENTS } from '../../../lib/crm/newsletterData'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  try {
    const S = mergeSettings(await getJSON(PATHS.settings, {})).store
    const today = todayKey(new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' })))
    if (!req.query.day) {
      return res.status(200).json({ ok: true, today, days: DAYS.map(d => ({ key: d.key, d: d.d, theme: d.theme, short: d.short, headline: d.headline, subjects: d.subjects, preview: d.preview, why: d.why, products: d.products.map(p => ({ name: p[0], price: p[1], handle: p[2] })) })), extra: EXTRA.map(e => ({ key: e.key, theme: e.theme, short: e.short, seg: e.seg, segN: e.segN, subjects: e.subjects })), segments: SEGMENTS, segmentFor: SEGMENT_FOR })
    }
    const day = DAYS.find(d => d.key === req.query.day)
    if (!day) return res.status(400).json({ ok: false, error: 'Only the seven nightly emails are built here. One-offs (story, app, still-with-us) are in the Newsletter Maker page.' })
    const products = await checkDay(day)
    const o = { local: req.query.aud === 'local', app: req.query.app !== '0', offer: req.query.offer === '1', offerText: String(req.query.offerText || 'free UK delivery on every order') }
    const html = nightly(day, products, o, S)
    res.status(200).json({ ok: true, html, subject: day.subjects[0], subjects: day.subjects, preview: day.preview, theme: day.theme, segment: o.local ? SEGMENT_FOR.local : SEGMENT_FOR.uk, products, swaps: products.filter(p => !p.ok).map(p => p.name) })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
