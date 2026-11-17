// Writes the product-type x recency segments to Shopify as customer tags so AfterShip can build segments from them.
//   GET /api/crm/segment-tags?dry=1                 how many customers need tag changes (no writes)
//   GET /api/crm/segment-tags?offset=0&limit=400    applies the next batch; keep calling with next= until done:true
// Tag format: cc-<category>-<bucket>, e.g. cc-dye-recent. Only email-subscribed customers carry tags.
// It compares against the tags in the latest sync and only touches customers whose tags are out of date.
import { getJSON, PATHS } from '../../../lib/crm/store'
import { CATEGORIES } from '../../../lib/crm/rules'
import { customerCategories, bucketOf, tagFor } from '../../../lib/crm/segments'
import { gql } from '../../../lib/intake'

export const config = { maxDuration: 60 }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const OURS = /^cc-[a-z]+-(new|recent|cooling|lapsed|dormant)$/
const gid = id => String(id).startsWith('gid://') ? String(id) : 'gid://shopify/Customer/' + id

async function run(query, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try { return await gql(query) } catch (e) {
      if (/throttl/i.test(String(e.message)) && i < tries - 1) { await sleep(1500 + i * 1000); continue }
      throw e
    }
  }
}

export default async function handler(req, res) {
  try {
    const snap = await getJSON(PATHS.snapshot, null)
    if (!snap) return res.status(200).json({ ok: false, pending: true })
    const cc = customerCategories(snap)
    const cats = CATEGORIES.filter(c => c.key !== 'tools').map(c => c.key)
    const work = []
    for (const id in snap.customers) {
      const c = snap.customers[id]
      const mine = cc[id] || {}
      const want = new Set()
      if (c.email && c.emailSub) for (const k of Object.keys(mine)) if (cats.includes(k)) want.add(tagFor(k, bucketOf(mine[k].days)))
      const have = (c.tags || []).filter(t => OURS.test(t))
      const add = [...want].filter(t => !have.includes(t))
      const rem = have.filter(t => !want.has(t))
      if (add.length || rem.length) work.push({ id: gid(id), add, rem })
    }
    if (req.query.dry) {
      return res.status(200).json({ ok: true, needChanges: work.length, tagsToAdd: work.reduce((n, w) => n + w.add.length, 0), tagsToRemove: work.reduce((n, w) => n + w.rem.length, 0), sample: work.slice(0, 3) })
    }
    const offset = parseInt(req.query.offset || '0', 10), limit = Math.min(parseInt(req.query.limit || '400', 10), 1000)
    const started = Date.now()
    let i = offset, errors = [], applied = 0
    while (i < Math.min(work.length, offset + limit) && Date.now() - started < 48000) {
      const chunk = work.slice(i, Math.min(i + 8, work.length, offset + limit))
      const parts = []
      chunk.forEach((w, n) => {
        if (w.add.length) parts.push('a' + n + ': tagsAdd(id: ' + JSON.stringify(w.id) + ', tags: ' + JSON.stringify(w.add) + ') { userErrors { message } }')
        if (w.rem.length) parts.push('r' + n + ': tagsRemove(id: ' + JSON.stringify(w.id) + ', tags: ' + JSON.stringify(w.rem) + ') { userErrors { message } }')
      })
      try {
        const d = await run('mutation { ' + parts.join(' ') + ' }')
        for (const k in d) for (const ue of ((d[k] && d[k].userErrors) || [])) errors.push(ue.message)
        applied += chunk.length
      } catch (e) { errors.push(String(e.message).slice(0, 200)); break }
      i += chunk.length
    }
    const done = i >= work.length
    res.status(200).json({ ok: errors.length === 0, total: work.length, from: offset, applied, next: i, done, errors: errors.slice(0, 5) })
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e.message || e) })
  }
}
