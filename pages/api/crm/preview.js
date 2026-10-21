// Branded email HTML for one queued action (?key=...), shown in the preview pane.
import { getJSON, PATHS } from '../../../lib/crm/store'
import { buildActions } from '../../../lib/crm/engine'
import { compose } from '../../../lib/crm/messages'

export default async function handler(req, res) {
  try {
    const [snap, state, settings] = await Promise.all([getJSON(PATHS.snapshot, null), getJSON(PATHS.state, {}), getJSON(PATHS.settings, {})])
    if (!snap) return res.status(404).send('No data yet')
    const q = buildActions(snap, state, settings)
    const a = q.actions.find(x => x.key === req.query.key)
    if (!a) return res.status(404).send('This action is no longer in the queue')
    const m = compose(a, q.settings.store)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(200).send(m.html)
  } catch (e) { res.status(500).send(String(e.message || e)) }
}
