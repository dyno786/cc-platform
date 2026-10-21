import { getJSON, putJSON, PATHS } from '../../../lib/crm/store'
import { mergeSettings } from '../../../lib/crm/engine'
import { FLOWS, CATEGORIES, CROSS_SELL } from '../../../lib/crm/rules'

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const cur = await getJSON(PATHS.settings, {})
      const b = req.body || {}
      const next = { ...cur, ...b, flows: { ...(cur.flows || {}), ...(b.flows || {}) }, reorderDays: { ...(cur.reorderDays || {}), ...(b.reorderDays || {}) }, store: { ...(cur.store || {}), ...(b.store || {}) } }
      await putJSON(PATHS.settings, next)
      return res.status(200).json({ ok: true, settings: mergeSettings(next) })
    }
    const s = mergeSettings(await getJSON(PATHS.settings, {}))
    res.status(200).json({ ok: true, settings: s, flows: FLOWS, categories: CATEGORIES.map(c => ({ key: c.key, name: c.name, reorder: c.reorder })), crossSell: CROSS_SELL })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
