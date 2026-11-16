// Customer segments by product type and recency: "bought hair colour in the last 7 days", "30+ days ago", and so on.
// Built from the full order history in the snapshot. A customer sits in exactly one bucket per category.
import { categorise, CATEGORIES } from './rules'

const DAY = 86400000
export const BUCKETS = [
  { key: 'new',     name: 'Bought in the last 7 days',  from: 0,   to: 7 },
  { key: 'recent',  name: 'Bought 8 to 30 days ago',    from: 8,   to: 30 },
  { key: 'cooling', name: 'Bought 31 to 90 days ago',   from: 31,  to: 90 },
  { key: 'lapsed',  name: 'Bought 91 to 365 days ago',  from: 91,  to: 365 },
  { key: 'dormant', name: 'Bought over a year ago',     from: 366, to: 99999 },
]
export const bucketOf = d => (BUCKETS.find(b => d >= b.from && d <= b.to) || BUCKETS[4]).key
export const tagFor = (cat, bucket) => 'cc-' + cat + '-' + bucket

// Per customer: for each category, last purchase date, number of orders and spend.
export function customerCategories(snap, nowMs) {
  const now = nowMs || Date.now()
  const out = {}
  for (const o of snap.orders) {
    if (!o.customerId || o.test || o.cancelledAt) continue
    const seen = {}
    for (const it of o.items) {
      const cat = categorise(it).key; if (cat === 'other' || seen[cat]) continue
      seen[cat] = 1
      const c = (out[o.customerId] = out[o.customerId] || {})
      const r = (c[cat] = c[cat] || { last: o.createdAt, orders: 0, title: it.title, handle: it.handle })
      r.orders++
      if (o.createdAt > r.last) { r.last = o.createdAt; r.title = it.title; r.handle = it.handle }
    }
  }
  for (const id in out) for (const k in out[id]) out[id][k].days = Math.floor((now - new Date(out[id][k].last).getTime()) / DAY)
  return out
}

// has: category the customer must have bought; not: category they must never have bought (cross-sell audience).
export function segmentMembers(snap, cc, { cat, bucket, not, repeat }) {
  const rows = []
  for (const id in cc) {
    const c = snap.customers[id]; if (!c || !c.email) continue
    const m = cc[id][cat]; if (!m) continue
    if (bucket && bucketOf(m.days) !== bucket) continue
    if (not && cc[id][not]) continue
    if (repeat && m.orders < 2) continue
    rows.push({ customerId: id, email: c.email, name: c.name, emailSub: !!c.emailSub, product: m.title, days: m.days, orders: m.orders })
  }
  return rows
}
