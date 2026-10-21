// The flow engine: turns the Shopify snapshot + what has already been sent into today's list of actions.
// Pure function, no network. Every action has a stable key so it is only ever done once.
import { categorise, CROSS_SELL, FLOWS, DEFAULT_SETTINGS } from './rules'

const DAY = 86400000
const days = (iso, now) => (now - new Date(iso).getTime()) / DAY
const hours = (iso, now) => (now - new Date(iso).getTime()) / 3600000

export function mergeSettings(s) {
  const d = DEFAULT_SETTINGS
  return { ...d, ...(s || {}), flows: { ...d.flows, ...((s || {}).flows || {}) }, reorderDays: { ...d.reorderDays, ...((s || {}).reorderDays || {}) }, store: { ...d.store, ...((s || {}).store || {}) } }
}

export function customerView(c, orders, now) {
  const mine = orders.filter(o => o.customerId === c.id && !o.test && !o.cancelledAt).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  const last = mine[0]
  const cats = {}
  const brands = {}
  for (const o of mine) for (const it of o.items) {
    const cat = categorise(it)
    if (!cats[cat.key] || cats[cat.key].last < o.createdAt) cats[cat.key] = { key: cat.key, name: cat.name, last: o.createdAt, lastOrderId: o.id, title: it.title, handle: it.handle }
    const b = (it.vendor || '').trim(); if (b && !/^(cc|general|default)$/i.test(b)) brands[b] = (brands[b] || 0) + 1
  }
  const topType = (c.tags || []).find(t => t.startsWith('top-'))
  return {
    ...c, orders: mine, lastOrder: last || null, daysSinceOrder: last ? Math.floor(days(last.createdAt, now)) : null,
    cats: Object.values(cats).sort((a, b) => (a.last < b.last ? 1 : -1)), brands: Object.entries(brands).sort((a, b) => b[1] - a[1]).map(x => x[0]),
    topType: topType ? topType.slice(4).replace(/-/g, ' ') : '', ltv: mine.reduce((s, o) => s + o.total, 0) || c.spent,
  }
}

export function buildActions(snapshot, state, settingsIn, nowMs) {
  const now = nowMs || Date.now()
  const S = mergeSettings(settingsIn)
  const st = state || {}
  const customers = snapshot.customers || {}
  const orders = (snapshot.orders || []).filter(o => !o.test)
  const checkouts = snapshot.checkouts || []
  const actions = []
  const on = k => S.flows[k] !== false
  const cs = id => st[id] || {}
  const done = (id, key) => !!(cs(id).done && cs(id).done[key])
  const doneAt = (id, key) => cs(id).done && cs(id).done[key] ? new Date(cs(id).done[key]).getTime() : null
  const marketingCount7d = id => ((cs(id).log) || []).filter(l => l.marketing && now - new Date(l.ts).getTime() < 7 * DAY).length
  const ordersByCustomer = {}
  for (const o of orders) if (o.customerId) (ordersByCustomer[o.customerId] = ordersByCustomer[o.customerId] || []).push(o)
  for (const k in ordersByCustomer) ordersByCustomer[k].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  function push(a) {
    const c = customers[a.customerId] || {}
    const cstate = cs(a.customerId)
    if (cstate.paused) return
    if (done(a.customerId, a.key)) return
    const phone = (c.phone || a.phone || '').replace(/\D/g, '')
    const email = c.email || a.email || ''
    a.name = a.name || c.name || 'Customer'
    a.firstName = (a.name || '').split(' ')[0]
    a.phone = phone; a.email = email
    // channel: prefer what the flow asks for, fall back to the other if the customer has no such contact
    if (a.channel === 'whatsapp' && !phone) a.channel = email ? 'email' : 'none'
    if (a.channel === 'email' && !email) a.channel = phone ? 'whatsapp' : 'none'
    if (a.channel === 'none') return
    const blocks = []
    if (a.marketing) {
      if (cstate.issue) blocks.push('Open issue on this customer')
      if (a.channel === 'email' && !c.emailSub) blocks.push('Not subscribed to email marketing')
      if (a.channel === 'whatsapp' && S.whatsappConsent === 'sms' && !c.smsSub && !cstate.waOk) blocks.push('No WhatsApp/SMS marketing consent')
      if (marketingCount7d(a.customerId) >= S.weeklyCap) blocks.push('Weekly cap reached (' + S.weeklyCap + ' marketing messages)')
      const recent = (ordersByCustomer[a.customerId] || []).find(o => o.fulfilledAt && hours(o.fulfilledAt, now) < S.postDeliveryQuietHours && hours(o.fulfilledAt, now) > 0)
      if (recent && a.flow !== 'crosssell') blocks.push('Quiet period after delivery')
    }
    if (a.flow === 'review' && cstate.issue) blocks.push('Open issue: no review request')
    a.blocked = blocks
    a.consent = { email: !!c.emailSub, sms: !!c.smsSub, waOk: !!cstate.waOk }
    actions.push(a)
  }

  // ---- per order ----
  for (const o of orders) {
    if (!o.customerId || o.cancelledAt) continue
    const c = customers[o.customerId]; if (!c) continue
    const mine = ordersByCustomer[o.customerId] || []
    const isLatest = mine[0] && mine[0].id === o.id
    const ageH = hours(o.createdAt, now)
    const paid = /PAID|PARTIALLY_REFUNDED|AUTHORIZED/.test(o.pay || '')
    if (on('confirm') && paid && ageH <= 48 && !o.fulfilledAt)
      push({ key: 'confirm:' + o.id, flow: 'confirm', step: 1, channel: 'whatsapp', marketing: false, priority: 1, customerId: c.id, orderId: o.id, orderName: o.name, order: o, due: o.createdAt, title: 'Order confirmation ' + o.name })
    if (o.fulfilledAt) {
      const fd = days(o.fulfilledAt, now)
      if (on('shipped') && fd <= 3)
        push({ key: 'shipped:' + o.id, flow: 'shipped', step: 1, channel: 'whatsapp', marketing: false, priority: 1, customerId: c.id, orderId: o.id, orderName: o.name, order: o, due: o.fulfilledAt, title: 'On its way ' + o.name })
      if (on('delivered') && fd >= 3 && fd <= 6)
        push({ key: 'delivered:' + o.id, flow: 'delivered', step: 1, channel: 'whatsapp', marketing: false, priority: 2, customerId: c.id, orderId: o.id, orderName: o.name, order: o, due: new Date(new Date(o.fulfilledAt).getTime() + 3 * DAY).toISOString(), title: 'Delivered check-in ' + o.name })
      if (on('review') && isLatest && !o.refunded && fd >= 6 && fd <= 24) {
        const r1 = 'review:' + o.id, r1at = doneAt(c.id, r1)
        const reviewedRecently = Object.keys(cs(c.id).done || {}).some(k => k.startsWith('review') && now - new Date(cs(c.id).done[k]).getTime() < 60 * DAY && k !== r1)
        if (!reviewedRecently) {
          if (!r1at) push({ key: r1, flow: 'review', step: 1, channel: 'whatsapp', marketing: false, priority: 3, customerId: c.id, orderId: o.id, orderName: o.name, order: o, due: new Date(new Date(o.fulfilledAt).getTime() + 6 * DAY).toISOString(), title: 'Review request ' + o.name })
          else if (now - r1at >= 7 * DAY && fd <= 24) push({ key: 'review2:' + o.id, flow: 'review', step: 2, channel: 'whatsapp', marketing: false, priority: 4, customerId: c.id, orderId: o.id, orderName: o.name, order: o, due: new Date(r1at + 7 * DAY).toISOString(), title: 'Review reminder ' + o.name })
        }
      }
      if (on('crosssell') && isLatest && fd >= 10 && fd <= 24) {
        const cat = o.items.map(categorise).find(ct => CROSS_SELL[ct.key])
        if (cat) push({ key: 'crosssell:' + o.id, flow: 'crosssell', step: 1, channel: 'email', marketing: true, priority: 5, customerId: c.id, orderId: o.id, orderName: o.name, order: o, cat: cat.key, due: new Date(new Date(o.fulfilledAt).getTime() + 10 * DAY).toISOString(), title: 'Complete your routine: ' + CROSS_SELL[cat.key].title })
      }
    }
  }

  // ---- per customer: reorder + win-back ----
  for (const cid in ordersByCustomer) {
    const c = customers[cid]; if (!c) continue
    const mine = ordersByCustomer[cid]
    const last = mine[0]
    if (on('reorder')) {
      const seen = {}
      for (const o of mine) for (const it of o.items) {
        const cat = categorise(it); if (!cat.reorder) continue
        if (!seen[cat.key] || seen[cat.key].at < o.createdAt) seen[cat.key] = { at: o.createdAt, orderId: o.id, title: it.title, handle: it.handle, cat }
      }
      for (const k in seen) {
        const s = seen[k], win = S.reorderDays[k] || s.cat.reorder[0], d = days(s.at, now)
        if (d < win || d > win + 28) continue
        const base = 'reorder:' + cid + ':' + k + ':' + s.at.slice(0, 10)
        const common = { flow: 'reorder', marketing: true, customerId: cid, orderId: s.orderId, product: s.title, handle: s.handle, cat: k, catName: s.cat.name, boughtAt: s.at, window: win }
        const t1 = doneAt(cid, base + ':1'), t2 = doneAt(cid, base + ':2')
        if (!t1) push({ ...common, key: base + ':1', step: 1, channel: 'email', priority: 5, due: new Date(new Date(s.at).getTime() + win * DAY).toISOString(), title: 'Running low? ' + s.title })
        else if (!t2 && now - t1 >= 3 * DAY && c.phone) push({ ...common, key: base + ':2', step: 2, channel: 'whatsapp', priority: 5, due: new Date(t1 + 3 * DAY).toISOString(), title: 'Reorder nudge (WhatsApp) ' + s.title })
        else if (t1 && !done(cid, base + ':3') && now - Math.max(t1, t2 || 0) >= 7 * DAY && d <= win + 28) push({ ...common, key: base + ':3', step: 3, channel: 'email', priority: 6, due: new Date(Math.max(t1, t2 || 0) + 7 * DAY).toISOString(), title: 'Last reorder reminder ' + s.title })
      }
    }
    if (on('winback') && last) {
      const d = days(last.createdAt, now)
      const stage = d >= 180 && d <= 200 ? 180 : d >= 90 && d <= 104 ? 90 : d >= 60 && d <= 74 ? 60 : 0
      if (stage) push({ key: 'winback' + stage + ':' + cid + ':' + last.id, flow: 'winback', step: stage, channel: 'email', marketing: true, priority: 7, customerId: cid, orderId: last.id, order: last, due: new Date(new Date(last.createdAt).getTime() + stage * DAY).toISOString(), title: stage + '-day win-back' })
    }
  }

  // ---- abandoned checkouts: WhatsApp follow-up the next day (Shopify Email does the emails) ----
  if (on('checkout')) for (const ck of checkouts) {
    const ageH = hours(ck.createdAt, now)
    if (ageH < 18 || ageH > 60) continue
    const cid = ck.customerId
    if (cid && (ordersByCustomer[cid] || []).some(o => o.createdAt > ck.createdAt)) continue
    if (!ck.phone) continue
    push({ key: 'cartwa:' + ck.id, flow: 'checkout', step: 3, channel: 'whatsapp', marketing: true, priority: 2, customerId: cid || ('guest:' + ck.id), name: ck.name, phone: ck.phone, email: ck.email, checkout: ck, due: new Date(new Date(ck.createdAt).getTime() + DAY).toISOString(), title: 'Checkout reminder £' + ck.total.toFixed(2) })
  }

  actions.sort((a, b) => a.priority - b.priority || (a.due < b.due ? -1 : 1))
  const byFlow = {}
  for (const a of actions) byFlow[a.flow] = (byFlow[a.flow] || 0) + 1
  return { actions, byFlow, ready: actions.filter(a => !a.blocked.length).length, blocked: actions.filter(a => a.blocked.length).length, settings: S }
}

export const flowName = k => (FLOWS.find(f => f.key === k) || { name: k }).name
