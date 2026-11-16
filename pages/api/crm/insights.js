// What sells: revenue, units, repeat rate and 7/30-day trend by category, brand and product,
// plus the Korean beauty range and how many customers are due a reorder per category.
//   GET /api/crm/insights            ranked lists (top 25 each)
import { getJSON, PATHS } from '../../../lib/crm/store'
import { categorise, brandOf } from '../../../lib/crm/rules'
import reordersHandler from './reorders'

export const config = { maxDuration: 60 }

const KOREAN = /medicube|haruharu|cosrx|skin ?1004|anua\b|beauty of joseon|round ?lab|missha|innisfree|laneige|dr\.? ?jart|some by mi|torriden|mediheal|isntree|numbuzin|etude|tonymoly|banila|sulwhasoo|k-?beauty|korean|snail|centella|mugwort|rice (toner|water)|glow deep/i
const DAY = 86400000
const r2 = n => Math.round(n * 100) / 100

function bucket() { return { rev: 0, units: 0, orders: 0, custs: new Set(), perCust: {}, r7: 0, r30: 0, rPrev30: 0, u7: 0, u30: 0 } }

export default async function handler(req, res) {
  try {
    const snap = await getJSON(PATHS.snapshot, null)
    if (!snap) return res.status(200).json({ ok: false, pending: true })
    const now = Date.now()
    const cats = {}, brands = {}, prods = {}, korean = {}
    let totalRev = 0, totalOrders = 0
    const orders = snap.orders.filter(o => !o.test && !o.cancelledAt)
    const add = (map, key, extra, o, it, rev) => {
      const b = map[key] || (map[key] = Object.assign(bucket(), extra || {}))
      const age = (now - new Date(o.createdAt).getTime()) / DAY
      b.rev += rev; b.units += it.qty || 1; b.orders += 1
      if (o.customerId) { b.custs.add(o.customerId); b.perCust[o.customerId] = (b.perCust[o.customerId] || new Set()).add(o.id) }
      if (age <= 7) { b.r7 += rev; b.u7 += it.qty || 1 }
      if (age <= 30) { b.r30 += rev; b.u30 += it.qty || 1 } else if (age <= 60) b.rPrev30 += rev
    }
    for (const o of orders) {
      totalOrders++
      for (const it of o.items) {
        const rev = (it.price || 0) * (it.qty || 1)
        if (!(rev > 0)) continue
        totalRev += rev
        const c = categorise(it), brand = brandOf(it) || 'Unbranded'
        add(cats, c.key, { name: c.name }, o, it, rev)
        add(brands, brand, { name: brand }, o, it, rev)
        add(prods, it.handle || it.title, { title: it.title, handle: it.handle, brand, cat: c.name }, o, it, rev)
        if (KOREAN.test((it.vendor || '') + ' ' + (it.title || '') + ' ' + (it.type || ''))) add(korean, it.handle || it.title, { title: it.title, handle: it.handle, brand, cat: c.name }, o, it, rev)
      }
    }
    const fin = b => {
      const buyers = b.custs.size
      const repeat = Object.values(b.perCust).filter(s => s.size >= 2).length
      const trend = b.rPrev30 > 0 ? Math.round((b.r30 / b.rPrev30 - 1) * 100) : null
      return { name: b.name || b.title, handle: b.handle, brand: b.brand, cat: b.cat, rev: r2(b.rev), units: b.units, buyers, repeatPct: buyers ? Math.round(repeat / buyers * 100) : 0, rev7: r2(b.r7), rev30: r2(b.r30), units7: b.u7, units30: b.u30, trend30pct: trend, sharePct: totalRev ? r2(b.rev / totalRev * 100) : 0 }
    }
    const top = (map, n, by) => Object.values(map).map(fin).sort((a, b) => b[by || 'rev'] - a[by || 'rev']).slice(0, n)
    const trending = Object.values(prods).map(fin).filter(p => p.rev7 > 0).sort((a, b) => b.rev7 - a.rev7).slice(0, 25)
    const risers = Object.values(prods).map(fin).filter(p => p.trend30pct !== null && p.rev30 >= 100).sort((a, b) => b.trend30pct - a.trend30pct).slice(0, 15)
    // reorders due per category (same window logic as the Reorders tab)
    const reorders = await new Promise(resolve => reordersHandler({ method: 'GET', query: {} }, { status: () => ({ json: resolve, send: resolve }), setHeader() {} }))
    const due = {}
    for (const r of (reorders.rows || [])) { const d = due[r.catName] || (due[r.catName] = { due: 0, upcoming: 0 }); r.due ? d.due++ : d.upcoming++ }
    res.status(200).json({
      ok: true, windowDays: 200, builtAt: snap.updatedAt, orders: totalOrders, revenue: r2(totalRev),
      categories: top(cats, 20), brands: top(brands, 30), products: top(prods, 25), repeatProducts: Object.values(prods).map(fin).filter(p => p.buyers >= 15).sort((a, b) => b.repeatPct - a.repeatPct).slice(0, 15),
      trending, risers, korean: top(korean, 25), koreanSummary: (() => { const t = Object.values(korean).map(fin); return { products: t.length, rev: r2(t.reduce((s, p) => s + p.rev, 0)), sharePct: totalRev ? r2(t.reduce((s, p) => s + p.rev, 0) / totalRev * 100) : 0, rev30: r2(t.reduce((s, p) => s + p.rev30, 0)) } })(),
      reordersDue: due, reorderTotals: { due: reorders.due || 0, rows: (reorders.rows || []).length },
    })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
