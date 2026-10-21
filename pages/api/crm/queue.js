// Today's actions, worked out from the snapshot and what has already been sent.
import { getJSON, PATHS } from '../../../lib/crm/store'
import { buildActions, flowName } from '../../../lib/crm/engine'
import { compose, waLink, gmailLink } from '../../../lib/crm/messages'

export const config = { maxDuration: 60 }

// overdueDays: how far back a "due" date may be and still show (default 3). The older backlog from before
// the CRM existed is counted but hidden unless all=1, so the first days aren't a 2,000-item list.
export async function loadQueue(opts) {
  const o = opts || {}
  const [snap, state, settings] = await Promise.all([getJSON(PATHS.snapshot, null), getJSON(PATHS.state, {}), getJSON(PATHS.settings, {})])
  if (!snap) return { ok: false, error: 'No data yet. Run the first sync from Settings.', pending: true }
  const q = buildActions(snap, state, settings)
  const S = q.settings.store
  const cutoff = new Date(Date.now() - (o.overdueDays == null ? 3 : o.overdueDays) * 86400000).toISOString()
  const backlog = {}
  const kept = q.actions.filter(a => { if (o.all || a.due >= cutoff || ['confirm', 'shipped', 'checkout'].includes(a.flow)) return true; backlog[a.flow] = (backlog[a.flow] || 0) + 1; return false })
  const actions = kept.map(a => {
    const m = compose(a, S)
    const { order, checkout, ...rest } = a
    return { ...rest, flowName: flowName(a.flow), text: m.text, subject: m.subject,
      link: a.channel === 'whatsapp' ? waLink(a.phone, m.text) : gmailLink(a.email, m.subject, m.text),
      orderTotal: order ? order.total : (checkout ? checkout.total : null), items: order ? order.items.slice(0, 4).map(i => i.title) : (checkout ? checkout.items.slice(0, 4).map(i => i.title) : []) }
  })
  const byFlow = {}; for (const a of actions) byFlow[a.flow] = (byFlow[a.flow] || 0) + 1
  return { ok: true, actions, byFlow, backlog, backlogTotal: Object.values(backlog).reduce((s, n) => s + n, 0), ready: actions.filter(a => !a.blocked.length).length, blocked: actions.filter(a => a.blocked.length).length, updatedAt: snap.updatedAt, counts: snap.counts, subscribers: snap.subscribers || [], checkouts: (snap.checkouts || []).length }
}

export default async function handler(req, res) {
  try { const q = await loadQueue({ all: req.query.all === '1', overdueDays: req.query.overdue != null ? +req.query.overdue : undefined }); res.status(200).json(q) }
  catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
