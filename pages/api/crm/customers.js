// Customer list from the snapshot, or one customer in detail (?id=gid://shopify/Customer/123).
import { getJSON, PATHS } from '../../../lib/crm/store'
import { customerView, buildActions, flowName, mergeSettings } from '../../../lib/crm/engine'
import { fetchCustomer } from '../../../lib/crm/shopify'
import { compose, waLink, gmailLink } from '../../../lib/crm/messages'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  try {
    const [snap, state, settingsRaw] = await Promise.all([getJSON(PATHS.snapshot, null), getJSON(PATHS.state, {}), getJSON(PATHS.settings, {})])
    if (!snap) return res.status(200).json({ ok: false, pending: true, error: 'No data yet. Run the first sync from Settings.' })
    const now = Date.now()
    const settings = mergeSettings(settingsRaw)

    if (req.query.id) {
      const id = String(req.query.id)
      let live = null
      try { live = await fetchCustomer(id) } catch (e) { }
      const base = live || snap.customers[id]
      if (!base) return res.status(404).json({ ok: false, error: 'Customer not found' })
      const orders = live ? live.orders : snap.orders
      const v = customerView(base, orders, now)
      const q = buildActions({ ...snap, customers: { ...snap.customers, [id]: base }, orders: [...snap.orders.filter(o => o.customerId !== id), ...(live ? live.orders : snap.orders.filter(o => o.customerId === id))] }, state, settingsRaw, now)
      const S = settings.store
      const upcoming = q.actions.filter(a => a.customerId === id).map(a => { const m = compose(a, S); const { order, checkout, ...rest } = a; return { ...rest, flowName: flowName(a.flow), text: m.text, subject: m.subject, link: a.channel === 'whatsapp' ? waLink(a.phone, m.text) : gmailLink(a.email, m.subject, m.text) } })
      const st = state[id] || { done: {}, log: [] }
      const timeline = [
        ...v.orders.map(o => ({ ts: o.createdAt, kind: 'order', text: 'Ordered ' + o.name + ' · £' + o.total.toFixed(2) + ' · ' + o.items.map(i => i.title).slice(0, 3).join(', ') + (o.items.length > 3 ? ' +' + (o.items.length - 3) : '') })),
        ...v.orders.filter(o => o.fulfilledAt).map(o => ({ ts: o.fulfilledAt, kind: 'ship', text: 'Dispatched ' + o.name + (o.tracking && o.tracking.company ? ' · ' + o.tracking.company : '') })),
        ...(st.log || []).map(l => ({ ts: l.ts, kind: 'msg', text: flowName(l.flow) + ' sent by ' + (l.channel === 'whatsapp' ? 'WhatsApp' : 'email') })),
      ].sort((a, b) => (a.ts < b.ts ? 1 : -1))
      return res.status(200).json({ ok: true, customer: { ...v, orders: v.orders.map(o => ({ ...o, items: o.items })) }, state: st, upcoming, timeline })
    }

    const q = buildActions(snap, state, settingsRaw, now)
    const nextByCustomer = {}
    for (const a of q.actions) if (!nextByCustomer[a.customerId]) nextByCustomer[a.customerId] = { flow: a.flow, flowName: flowName(a.flow), title: a.title, channel: a.channel, blocked: a.blocked }
    const search = String(req.query.q || '').toLowerCase()
    const filter = String(req.query.filter || '')
    let rows = Object.values(snap.customers).map(c => {
      const v = customerView(c, snap.orders, now)
      const st = state[c.id] || {}
      return { id: c.id, name: v.name, email: v.email, phone: v.phone, city: v.city, emailSub: v.emailSub, smsSub: v.smsSub, waOk: !!st.waOk, paused: !!st.paused, issue: !!st.issue,
        orders: v.orders.length, ltv: v.ltv, lastOrderAt: v.lastOrder ? v.lastOrder.createdAt : null, daysSinceOrder: v.daysSinceOrder,
        cats: v.cats.slice(0, 3).map(x => x.name), brands: v.brands.slice(0, 3), topType: v.topType, lastItems: v.lastOrder ? v.lastOrder.items.slice(0, 3).map(i => i.title) : [],
        next: nextByCustomer[c.id] || null, lastContact: st.lastContact || null, tags: c.tags }
    })
    if (search) rows = rows.filter(r => (r.name + ' ' + r.email + ' ' + r.phone + ' ' + r.city + ' ' + r.brands.join(' ') + ' ' + r.cats.join(' ') + ' ' + r.lastItems.join(' ') + ' ' + (r.tags || []).join(' ')).toLowerCase().includes(search))
    if (filter === 'whatsapp') rows = rows.filter(r => r.phone)
    if (filter === 'email') rows = rows.filter(r => r.emailSub)
    if (filter === 'due') rows = rows.filter(r => r.next && !r.next.blocked.length)
    if (filter === 'repeat') rows = rows.filter(r => r.orders >= 2)
    if (filter === 'lapsed') rows = rows.filter(r => r.daysSinceOrder != null && r.daysSinceOrder >= 60)
    if (filter === 'new') rows = rows.filter(r => r.orders === 1 && r.daysSinceOrder != null && r.daysSinceOrder <= 14)
    rows.sort((a, b) => (a.lastOrderAt || '') < (b.lastOrderAt || '') ? 1 : -1)
    const total = rows.length
    const page = parseInt(req.query.page || '0'), size = 100
    const stats = { customers: Object.keys(snap.customers).length, withPhone: rows.filter(r => r.phone).length, emailSub: rows.filter(r => r.emailSub).length, repeat: rows.filter(r => r.orders >= 2).length, due: Object.keys(nextByCustomer).length }
    res.status(200).json({ ok: true, total, rows: rows.slice(page * size, (page + 1) * size), stats, updatedAt: snap.updatedAt })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
