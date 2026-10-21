// Records what happened to an action, and per-customer switches.
//   POST { customerId, key, flow, channel, marketing, status: 'sent' | 'skipped', name }
//   POST { customerId, set: { paused?, waOk?, issue?, note? } }
import { updateJSON, getJSON, putJSON, PATHS } from '../../../lib/crm/store'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false })
  try {
    const b = req.body || {}
    if (!b.customerId) return res.status(400).json({ ok: false, error: 'customerId missing' })
    const ts = new Date().toISOString()
    const state = await updateJSON(PATHS.state, {}, st => {
      const c = st[b.customerId] = st[b.customerId] || { done: {}, log: [] }
      c.done = c.done || {}; c.log = c.log || []
      if (b.set) Object.assign(c, b.set)
      if (b.key) {
        c.done[b.key] = ts
        if (b.status === 'sent') { c.log.push({ ts, key: b.key, flow: b.flow, channel: b.channel, marketing: !!b.marketing }); if (c.log.length > 60) c.log = c.log.slice(-60) }
        if (b.status === 'skipped') c.done[b.key] = ts  // skipped = never ask again for this step
        c.lastContact = b.status === 'sent' ? ts : c.lastContact
      }
      return st
    })
    if (b.key && b.status === 'sent') {
      const ym = ts.slice(0, 7)
      const log = await getJSON(PATHS.log(ym), [])
      log.push({ ts, customerId: b.customerId, name: b.name || '', key: b.key, flow: b.flow, channel: b.channel, marketing: !!b.marketing })
      await putJSON(PATHS.log(ym), log)
    }
    res.status(200).json({ ok: true, customer: state[b.customerId] })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
