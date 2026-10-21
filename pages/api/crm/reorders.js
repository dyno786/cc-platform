// Every customer/category pair approaching or inside its reorder window.
import { getJSON, PATHS } from '../../../lib/crm/store'
import { mergeSettings } from '../../../lib/crm/engine'
import { categorise } from '../../../lib/crm/rules'

export default async function handler(req, res) {
  try {
    const [snap, state, settingsRaw] = await Promise.all([getJSON(PATHS.snapshot, null), getJSON(PATHS.state, {}), getJSON(PATHS.settings, {})])
    if (!snap) return res.status(200).json({ ok: false, pending: true })
    const S = mergeSettings(settingsRaw)
    const now = Date.now()
    const rows = []
    const byCust = {}
    for (const o of snap.orders) if (o.customerId && !o.test && !o.cancelledAt) (byCust[o.customerId] = byCust[o.customerId] || []).push(o)
    for (const cid in byCust) {
      const c = snap.customers[cid]; if (!c) continue
      const seen = {}
      for (const o of byCust[cid]) for (const it of o.items) {
        const cat = categorise(it); if (!cat.reorder) continue
        if (!seen[cat.key] || seen[cat.key].at < o.createdAt) seen[cat.key] = { at: o.createdAt, title: it.title, handle: it.handle, cat }
      }
      for (const k in seen) {
        const s = seen[k], win = S.reorderDays[k] || s.cat.reorder[0]
        const d = Math.floor((now - new Date(s.at).getTime()) / 86400000)
        if (d < win - 10 || d > win + 28) continue
        const base = 'reorder:' + cid + ':' + k + ':' + s.at.slice(0, 10)
        const done = (state[cid] && state[cid].done) || {}
        const step = done[base + ':3'] ? 'Finished' : done[base + ':2'] ? 'WhatsApp sent · final due' : done[base + ':1'] ? 'Email sent · WhatsApp next' : d >= win ? 'Due now' : 'Due in ' + (win - d) + ' days'
        rows.push({ customerId: cid, name: c.name, email: c.email, phone: c.phone, emailSub: c.emailSub, smsSub: c.smsSub, product: s.title, handle: s.handle, cat: k, catName: s.cat.name, boughtAt: s.at, days: d, window: win, max: s.cat.reorder[1], step, due: d >= win })
      }
    }
    rows.sort((a, b) => (b.days - b.window) - (a.days - a.window))
    res.status(200).json({ ok: true, rows, due: rows.filter(r => r.due && !/Finished/.test(r.step)).length })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
