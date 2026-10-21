// Today's actions, worked out from the snapshot and what has already been sent.
import { getJSON, PATHS } from '../../../lib/crm/store'
import { buildActions, flowName } from '../../../lib/crm/engine'
import { compose, waLink, gmailLink } from '../../../lib/crm/messages'

export const config = { maxDuration: 60 }

export async function loadQueue() {
  const [snap, state, settings] = await Promise.all([getJSON(PATHS.snapshot, null), getJSON(PATHS.state, {}), getJSON(PATHS.settings, {})])
  if (!snap) return { ok: false, error: 'No data yet. Run the first sync from Settings.', pending: true }
  const q = buildActions(snap, state, settings)
  const S = q.settings.store
  const actions = q.actions.map(a => {
    const m = compose(a, S)
    const { order, checkout, ...rest } = a
    return { ...rest, flowName: flowName(a.flow), text: m.text, subject: m.subject,
      link: a.channel === 'whatsapp' ? waLink(a.phone, m.text) : gmailLink(a.email, m.subject, m.text),
      orderTotal: order ? order.total : (checkout ? checkout.total : null), items: order ? order.items.slice(0, 4).map(i => i.title) : (checkout ? checkout.items.slice(0, 4).map(i => i.title) : []) }
  })
  return { ok: true, actions, byFlow: q.byFlow, ready: q.ready, blocked: q.blocked, updatedAt: snap.updatedAt, counts: snap.counts, subscribers: snap.subscribers || [], checkouts: (snap.checkouts || []).length }
}

export default async function handler(req, res) {
  try { const q = await loadQueue(); res.status(q.ok ? 200 : 200).json(q) }
  catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
