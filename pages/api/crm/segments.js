// Customer segments by product type and recency.
//   GET /api/crm/segments                                       counts for every category x bucket (all customers / email-subscribed)
//   GET /api/crm/segments?cat=dye&bucket=recent&format=csv      one segment's members
//   GET /api/crm/segments?cat=dye&not=shampoo                   bought colour, never shampoo (cross-sell audience)
import { getJSON, PATHS } from '../../../lib/crm/store'
import { CATEGORIES } from '../../../lib/crm/rules'
import { BUCKETS, customerCategories, segmentMembers, tagFor } from '../../../lib/crm/segments'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  try {
    const snap = await getJSON(PATHS.snapshot, null)
    if (!snap) return res.status(200).json({ ok: false, pending: true })
    const cc = customerCategories(snap)
    const q = req.query
    if (q.cat) {
      const rows = segmentMembers(snap, cc, { cat: q.cat, bucket: q.bucket, not: q.not, repeat: q.repeat === '1' })
      const sub = rows.filter(r => r.emailSub)
      if (q.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv')
        return res.status(200).send('email,first_name,last_product,days_ago\n' + sub.map(r => [r.email, (r.name || '').split(' ')[0], r.product, r.days].map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\n'))
      }
      return res.status(200).json({ ok: true, cat: q.cat, bucket: q.bucket || 'all', total: rows.length, emailable: sub.length, sample: sub.slice(0, 10) })
    }
    const cats = CATEGORIES.filter(c => c.key !== 'tools').map(c => {
      const row = { cat: c.key, name: c.name, tagPrefix: tagFor(c.key, ''), buckets: {}, buyers: 0, emailable: 0, repeatBuyers: 0 }
      BUCKETS.forEach(b => { row.buckets[b.key] = { all: 0, emailable: 0 } })
      for (const id in cc) {
        const m = cc[id][c.key]; if (!m) continue
        const cust = snap.customers[id]; if (!cust || !cust.email) continue
        const b = BUCKETS.find(x => m.days >= x.from && m.days <= x.to) || BUCKETS[4]
        row.buyers++; row.buckets[b.key].all++
        if (cust.emailSub) { row.emailable++; row.buckets[b.key].emailable++ }
        if (m.orders >= 2) row.repeatBuyers++
      }
      return row
    })
    res.status(200).json({ ok: true, history: { from: snap.since, orders: snap.orders.length, customers: Object.keys(snap.customers).length }, buckets: BUCKETS, categories: cats })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
