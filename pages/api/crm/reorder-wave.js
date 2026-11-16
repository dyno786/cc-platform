// Reorder email waves, built as one email per category.
//   GET  /api/crm/reorder-wave                         today's plan: categories and how many are due (Tue/Thu/Sat)
//   GET  /api/crm/reorder-wave?cat=dye&step=1          the email (HTML, subject) + audience for that category
//   GET  /api/crm/reorder-wave?cat=dye&step=1&format=csv   audience as CSV (email,first_name,product)
//   GET/POST ...&action=tag                             tags the audience in Shopify (reorder-<cat>[-final]) so AfterShip can segment on it; clears last wave's tag first
//   GET/POST ...&action=mark                            marks the audience as emailed so they are never sent it twice
import { getJSON, updateJSON, PATHS } from '../../../lib/crm/store'
import { mergeSettings } from '../../../lib/crm/engine'
import { CATEGORIES } from '../../../lib/crm/rules'
import { utm } from '../../../lib/crm/messages'
import { gql } from '../../../lib/intake'
import { waveAudience, topProducts, reorderEmail, WAVE_DAYS, dayOfCat } from '../../../lib/crm/reorder'

export const config = { maxDuration: 60 }
const MIN = 10 // categories with fewer people than this wait for the next wave

export default async function handler(req, res) {
  try {
    const [snap, state, settingsRaw] = await Promise.all([getJSON(PATHS.snapshot, null), getJSON(PATHS.state, {}), getJSON(PATHS.settings, {})])
    if (!snap) return res.status(200).json({ ok: false, pending: true })
    const S = mergeSettings(settingsRaw)
    const ukNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }))
    const today = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][ukNow.getDay()]
    const src = req.method === 'POST' ? (req.body || {}) : req.query
    const cat = src.cat, step = parseInt(src.step || '1', 10) === 3 ? 3 : 1

    if (!cat) {
      const plan = CATEGORIES.filter(c => c.reorder).map(c => {
        const a1 = waveAudience(snap, state, settingsRaw, c.key, 1), a3 = waveAudience(snap, state, settingsRaw, c.key, 3)
        return { cat: c.key, name: c.name, day: dayOfCat(c.key), first: a1.rows.length, final: a3.rows.length, window: a1.window }
      })
      const todays = plan.filter(p => p.day === (src.day || today))
      return res.status(200).json({ ok: true, today, waveDays: WAVE_DAYS, min: MIN, plan, todays: todays.flatMap(p => [p.first >= MIN ? { cat: p.cat, step: 1, n: p.first } : null, p.final >= MIN ? { cat: p.cat, step: 3, n: p.final } : null]).filter(Boolean) })
    }
    if (!CATEGORIES.find(c => c.key === cat && c.reorder)) return res.status(400).json({ ok: false, error: 'Unknown reorder category' })
    const aud = waveAudience(snap, state, settingsRaw, cat, step)

    if (src.action === 'tag') {
      const tag = 'reorder-' + cat + (step === 3 ? '-final' : '')
      const gid = id => String(id).startsWith('gid://') ? String(id) : 'gid://shopify/Customer/' + id
      // clear the tag from last wave
      let cleared = 0, after = null
      for (let i = 0; i < 20; i++) {
        const d = await gql('query($q:String!,$a:String){ customers(first:100, query:$q, after:$a){ pageInfo{ hasNextPage endCursor } nodes{ id } } }', { q: 'tag:' + tag, a: after })
        for (const n of d.customers.nodes) { await gql('mutation($id:ID!,$t:[String!]!){ tagsRemove(id:$id, tags:$t){ userErrors{ message } } }', { id: n.id, t: [tag] }); cleared++ }
        if (!d.customers.pageInfo.hasNextPage) break
        after = d.customers.pageInfo.endCursor
      }
      let tagged = 0
      for (const r of aud.rows) {
        const d = await gql('mutation($id:ID!,$t:[String!]!){ tagsAdd(id:$id, tags:$t){ userErrors{ message } } }', { id: gid(r.customerId), t: [tag] })
        if (!(d.tagsAdd.userErrors || []).length) tagged++
      }
      return res.status(200).json({ ok: true, tag, cleared, tagged, of: aud.rows.length })
    }

    if (req.method === 'POST' || src.action === 'mark') {
      const ts = new Date().toISOString()
      const keys = {}; aud.rows.forEach(r => { keys[r.customerId] = r.key })
      await updateJSON(PATHS.state, {}, st => {
        for (const cid in keys) {
          const c = st[cid] = st[cid] || { done: {}, log: [] }
          c.done = c.done || {}; c.log = c.log || []
          c.done[keys[cid]] = ts
          c.log.push({ ts, key: keys[cid], flow: 'reorder', channel: 'email', marketing: true }); if (c.log.length > 60) c.log = c.log.slice(-60)
          c.lastContact = ts
        }
        return st
      })
      return res.status(200).json({ ok: true, marked: aud.rows.length })
    }

    if (src.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
      return res.status(200).send('email,first_name,product\n' + aud.rows.map(r => [r.email, (r.name || '').split(' ')[0], r.product].map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(',')).join('\n'))
    }
    const products = await topProducts(snap, cat, 4)
    const em = reorderEmail(cat, step, products, S.store, aud.window)
    const campaign = 'reorder-' + cat + '-' + (step === 3 ? 'final' : 'first') + '-' + ukNow.toISOString().slice(0, 10)
    res.status(200).json({ ok: true, cat, step, window: aud.window, count: aud.rows.length, enough: aud.rows.length >= MIN && products.length >= 2, subject: em.subject, preview: em.preview, html: utm(em.html, campaign), products, campaign, emails: aud.rows.map(r => r.email) })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
