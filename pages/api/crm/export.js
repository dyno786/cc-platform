// One compact bundle of everything the CRM page shows, for building the review artifact.
import { loadQueue } from './queue'
import { getJSON, PATHS } from '../../../lib/crm/store'
import { customerView, buildActions, flowName, mergeSettings } from '../../../lib/crm/engine'
import { FLOWS, CATEGORIES, CROSS_SELL } from '../../../lib/crm/rules'
import reordersHandler from './reorders'
import suggestHandler from './suggest'
import newsletterHandler from './newsletter'
const call = (h, query) => new Promise(resolve => h({ method: 'GET', query: query || {} }, { status: () => ({ json: resolve, send: resolve }), setHeader() {} }))

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  try {
    const [snap, state, settingsRaw] = await Promise.all([getJSON(PATHS.snapshot, null), getJSON(PATHS.state, {}), getJSON(PATHS.settings, {})])
    if (!snap) return res.status(200).json({ ok: false })
    const now = Date.now()
    const q = await loadQueue({ all: true })
    const actions = q.actions.map(a => ({ key: a.key, flow: a.flow, flowName: a.flowName, step: a.step, channel: a.channel, marketing: a.marketing, customerId: a.customerId, name: a.name, firstName: a.firstName, phone: a.phone, email: a.email, title: a.title, due: a.due, blocked: a.blocked, consent: a.consent, orderName: a.orderName, orderTotal: a.orderTotal, items: a.items, text: a.text, subject: a.subject, product: a.product, handle: a.handle, cat: a.cat }))
    const qq = buildActions(snap, state, settingsRaw, now)
    const nextBy = {}
    for (const a of qq.actions) if (!nextBy[a.customerId]) nextBy[a.customerId] = { flowName: flowName(a.flow), blocked: a.blocked.length > 0 }
    const customers = Object.values(snap.customers).map(c => {
      const v = customerView(c, snap.orders, now); const st = state[c.id] || {}
      return { id: c.id, name: v.name, email: v.email, phone: v.phone, city: v.city, emailSub: v.emailSub, smsSub: v.smsSub, orders: v.orders.length, ltv: Math.round(v.ltv * 100) / 100, lastOrderAt: v.lastOrder ? v.lastOrder.createdAt : null, days: v.daysSinceOrder, cats: v.cats.slice(0, 3).map(x => x.name), brands: v.brands.slice(0, 3), lastItems: v.lastOrder ? v.lastOrder.items.slice(0, 3).map(i => i.title) : [], next: nextBy[c.id] || null, paused: !!st.paused, issue: !!st.issue,
        history: v.orders.slice(0, 6).map(o => ({ name: o.name, at: o.createdAt, total: o.total, items: o.items.slice(0, 4).map(i => i.title), shipped: o.fulfilledAt })) }
    }).sort((a, b) => (a.lastOrderAt || '') < (b.lastOrderAt || '') ? 1 : -1)
    const [reorders, suggest, nlMeta, nlLocal, nlUk] = await Promise.all([call(reordersHandler), call(suggestHandler), call(newsletterHandler), call(newsletterHandler, { day: 'wed', aud: 'local' }), call(newsletterHandler, { day: 'wed', aud: 'uk' })])
    res.status(200).json({ ok: true, reorders, suggest, newsletter: { meta: nlMeta, local: nlLocal, uk: nlUk }, builtAt: snap.updatedAt, counts: snap.counts, subscribers: snap.subscribers.length, settings: mergeSettings(settingsRaw), flows: FLOWS, categories: CATEGORIES.map(c => ({ key: c.key, name: c.name, reorder: c.reorder })), crossSell: CROSS_SELL, actions, backlog: q.backlog, customers })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
