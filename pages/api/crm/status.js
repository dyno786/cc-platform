// What is connected and how fresh the data is.
import { getJSON, PATHS, storeReady } from '../../../lib/crm/store'
import { accessScopes } from '../../../lib/crm/shopify'

export default async function handler(req, res) {
  const out = { ok: true, blob: storeReady(), shopify: !!(process.env.SHOPIFY_STORE && process.env.SHOPIFY_TOKEN), claude: !!process.env.ANTHROPIC_API_KEY, ses: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) }
  try { out.scopes = await accessScopes() } catch (e) { out.scopesError = String(e.message || e) }
  try {
    const [sync, snap] = await Promise.all([getJSON(PATHS.sync, {}), getJSON(PATHS.snapshot, null)])
    out.sync = sync
    out.snapshot = snap ? { builtAt: snap.builtAt, updatedAt: snap.updatedAt, since: snap.since, counts: snap.counts } : null
    const ym = new Date().toISOString().slice(0, 7)
    const log = await getJSON(PATHS.log(ym), [])
    const byFlow = {}; const byChannel = {}
    for (const l of log) { byFlow[l.flow] = (byFlow[l.flow] || 0) + 1; byChannel[l.channel] = (byChannel[l.channel] || 0) + 1 }
    out.thisMonth = { sent: log.length, byFlow, byChannel }
  } catch (e) { out.storeError = String(e.message || e) }
  res.status(200).json(out)
}
