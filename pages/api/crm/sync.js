// Keeps crm/snapshot.json fresh.
//   GET /api/crm/sync           hourly (cron): top up orders changed since the last run, refresh checkouts and new subscribers
//   GET /api/crm/sync?full=1    start a full rebuild (Shopify bulk export of the last 200 days); poll with the plain call until it lands
import { getJSON, putJSON, PATHS, storeReady } from '../../../lib/crm/store'
import { fetchOrders, fetchCustomersByIds, fetchCustomers, fetchCheckouts, startBulkOrders, currentBulk, downloadBulkOrders } from '../../../lib/crm/shopify'
import { mergeSettings } from '../../../lib/crm/engine'

export const config = { maxDuration: 300 }

export default async function handler(req, res) {
  try {
    if (!storeReady()) return res.status(500).json({ ok: false, error: 'CRM storage not connected (BLOB_READ_WRITE_TOKEN missing).' })
    const settings = mergeSettings(await getJSON(PATHS.settings, {}))
    const lookback = settings.lookbackDays || 200
    const since = new Date(Date.now() - lookback * 86400000).toISOString()
    const sync = await getJSON(PATHS.sync, {})
    let snap = await getJSON(PATHS.snapshot, null)
    const notes = []

    // 1. full rebuild requested, or nothing yet: start the bulk export
    if (req.query.full === '1' || (!snap && !sync.bulkId)) {
      const running = await currentBulk()
      if (running && /CREATED|RUNNING/.test(running.status)) { notes.push('A Shopify export is already running; waiting for it.'); sync.bulkId = running.id }
      else { const op = await startBulkOrders(since); sync.bulkId = op.id; sync.bulkStartedAt = new Date().toISOString(); notes.push('Started a full export of orders since ' + since.slice(0, 10) + '.') }
      await putJSON(PATHS.sync, sync)
      if (req.query.full === '1') return res.status(200).json({ ok: true, started: true, notes })
    }

    // 2. a bulk export is in flight: pick it up when done
    if (sync.bulkId) {
      const op = await currentBulk()
      if (op && op.id === sync.bulkId && op.status === 'COMPLETED' && op.url) {
        const orders = await downloadBulkOrders(op.url)
        snap = { builtAt: new Date().toISOString(), since, orders, customers: {}, checkouts: [], subscribers: [] }
        notes.push('Full export landed: ' + orders.length + ' orders.')
        sync.bulkId = null; sync.fullAt = new Date().toISOString()
      } else if (op && op.id === sync.bulkId && /FAILED|CANCELED|EXPIRED/.test(op.status)) {
        notes.push('Shopify export ' + op.status + (op.errorCode ? ' (' + op.errorCode + ')' : '')); sync.bulkId = null
      } else if (op && op.id === sync.bulkId) {
        await putJSON(PATHS.sync, sync)
        return res.status(200).json({ ok: true, pending: true, status: op.status, objects: op.objectCount, notes: notes.concat(['Export still running (' + op.status + ').']) })
      } else { sync.bulkId = null }
    }
    if (!snap) { await putJSON(PATHS.sync, sync); return res.status(200).json({ ok: true, pending: true, notes }) }

    // 3. incremental top-up: anything updated since the last run (with a 2h overlap)
    const from = sync.lastAt ? new Date(new Date(sync.lastAt).getTime() - 2 * 3600000).toISOString() : snap.builtAt
    const changed = await fetchOrders(`updated_at:>='${from}'`, 1500)
    const byId = Object.fromEntries((snap.orders || []).map(o => [o.id, o]))
    for (const o of changed) byId[o.id] = o
    snap.orders = Object.values(byId).filter(o => o.createdAt >= since)
    notes.push(changed.length + ' orders changed since ' + from.slice(0, 16).replace('T', ' ') + '.')

    // 4. customers: everyone with an order in the snapshot, plus new subscribers
    const subs = await fetchCustomers(`created_at:>='${new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)}' AND email_marketing_state:subscribed`, 300)
    snap.subscribers = subs.filter(c => c.ordersCount === 0).map(c => ({ id: c.id, name: c.name, email: c.email, createdAt: c.createdAt, city: c.city, tags: c.tags }))
    const touched = new Set(changed.map(o => o.customerId).filter(Boolean))
    const missing = snap.orders.map(o => o.customerId).filter(id => id && !snap.customers[id])
    const refreshAll = !sync.customersAt || Date.now() - new Date(sync.customersAt).getTime() > 24 * 3600000
    const ids = refreshAll ? [...new Set(snap.orders.map(o => o.customerId).filter(Boolean))] : [...new Set([...touched, ...missing])]
    if (ids.length) {
      const got = await fetchCustomersByIds(ids)
      Object.assign(snap.customers, got)
      for (const c of subs) snap.customers[c.id] = snap.customers[c.id] || c
      if (refreshAll) sync.customersAt = new Date().toISOString()
      notes.push('Refreshed ' + ids.length + ' customers.')
    }
    for (const c of subs) if (!snap.customers[c.id]) snap.customers[c.id] = c

    // 5. abandoned checkouts (last 3 days)
    try { snap.checkouts = await fetchCheckouts(3) } catch (e) { notes.push('Checkouts not read: ' + e.message) }

    snap.updatedAt = new Date().toISOString()
    snap.counts = { orders: snap.orders.length, customers: Object.keys(snap.customers).length, checkouts: snap.checkouts.length, subscribers: snap.subscribers.length }
    await putJSON(PATHS.snapshot, snap)
    sync.lastAt = snap.updatedAt; sync.lastNotes = notes
    await putJSON(PATHS.sync, sync)
    res.status(200).json({ ok: true, counts: snap.counts, notes })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
