// Customer product-type tags, from real orders.
//   job=analyse&o=<orders bulk export url>&c=<customers bulk export url>   report only, no changes
//   job=tag&o=..&c=..&go=1                                                 add the tags with one bulk tagsAdd run
// Tags added: "buys-<type>" for every product type a customer has ordered, "top-<type>" for their most-ordered type.
// Counts only real orders: not test, not cancelled. Never removes tags, never changes consent, never sends email.
// Skin-lightening product types are never tagged (they are not promoted).
import { gql } from '../../lib/intake'

export const config = { maxDuration: 300 }
const LIGHT = /skin.?(lighten|whiten|bleach)|whitening|lightening (cream|lotion|serum|soap)|fade cream|dark spot|hydroquinone|skin tone|carotone|caro (light|white)|fair\s*(&|and)\s*(white|lovely)/i
const SKIP = /^(|general|cc|other|health and beauty|default|gift card|shipping)$/i
export const slug = t => String(t).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function lines(u) {
  if (!/^https:\/\/storage\.googleapis\.com\//.test(u || '')) throw new Error('need Shopify bulk export URLs')
  const r = await fetch(u); if (!r.ok) throw new Error('download failed ' + r.status + ' (export may have expired)')
  return (await r.text()).split('\n').filter(Boolean).map(l => JSON.parse(l))
}

async function build(o, c) {
  const [orows, crows] = await Promise.all([lines(o), lines(c)])
  const orders = {}
  let skippedTest = 0, skippedCancelled = 0, noCustomer = 0
  for (const r of orows) {
    if (r.__parentId) { const p = orders[r.__parentId]; if (p) p.items.push(r); continue }
    orders[r.id] = { ...r, items: [] }
  }
  const per = {} // customer -> type -> {orders, units, last}
  const typeName = {}
  const excludedTypes = {}
  for (const od of Object.values(orders)) {
    if (od.test) { skippedTest++; continue }
    if (od.cancelledAt) { skippedCancelled++; continue }
    if (!od.customer) { noCustomer++; continue }
    const cid = od.customer.id
    const seen = new Set()
    for (const it of od.items) {
      const t = ((it.product && it.product.productType) || '').trim()
      if (SKIP.test(t)) continue
      if (LIGHT.test(t)) { excludedTypes[t] = (excludedTypes[t] || 0) + 1; continue }
      const k = slug(t); if (!k) continue
      typeName[k] = typeName[k] || t
      const P = per[cid] = per[cid] || {}
      const T = P[k] = P[k] || { orders: 0, units: 0, last: '' }
      T.units += it.quantity || 0
      if (!seen.has(k)) { T.orders++; seen.add(k) }
      if (od.createdAt > T.last) T.last = od.createdAt
    }
  }
  const sub = {}; const existing = {}
  for (const cu of crows) { sub[cu.id] = (cu.emailMarketingConsent || {}).marketingState === 'SUBSCRIBED'; existing[cu.id] = new Set((cu.tags || []).map(t => t.trim().toLowerCase())) }
  const stats = {}; const todo = []
  for (const [cid, P] of Object.entries(per)) {
    const ranked = Object.entries(P).sort((a, b) => b[1].orders - a[1].orders || b[1].units - a[1].units || (a[1].last < b[1].last ? 1 : -1) || (a[0] < b[0] ? -1 : 1))
    const tags = ranked.map(([k]) => 'buys-' + k)
    tags.push('top-' + ranked[0][0])
    ranked.forEach(([k, v], i) => {
      const S = stats[k] = stats[k] || { type: typeName[k], customers: 0, subscribed: 0, topFor: 0, topForSubscribed: 0, orders: 0, units: 0 }
      S.customers++; S.orders += v.orders; S.units += v.units
      if (sub[cid]) S.subscribed++
      if (i === 0) { S.topFor++; if (sub[cid]) S.topForSubscribed++ }
    })
    const ex = existing[cid] || new Set()
    const need = tags.filter(t => !ex.has(t))
    if (need.length) todo.push({ id: cid, tags: need })
  }
  const table = Object.entries(stats).map(([k, s]) => ({ tag: 'buys-' + k, topTag: 'top-' + k, ...s })).sort((a, b) => b.customers - a.customers)
  return { ordersRead: Object.keys(orders).length, skippedTest, skippedCancelled, noCustomer, customersWithOrders: Object.keys(per).length, customersNeedingTags: todo.length, tagsToAdd: todo.reduce((n, t) => n + t.tags.length, 0), excludedTypes, table, todo }
}

async function stagedUpload(jsonl) {
  const s = await gql('mutation($i:[StagedUploadInput!]!){ stagedUploadsCreate(input:$i){ stagedTargets{ url parameters{ name value } } userErrors{ message } } }',
    { i: [{ resource: 'BULK_MUTATION_VARIABLES', filename: 'ptypes.jsonl', mimeType: 'text/jsonl', httpMethod: 'POST' }] })
  const tg = s.stagedUploadsCreate.stagedTargets[0]
  if (!tg) throw new Error('staged upload failed: ' + JSON.stringify(s.stagedUploadsCreate.userErrors))
  const fd = new FormData()
  for (const p of tg.parameters) fd.append(p.name, p.value)
  fd.append('file', new Blob([jsonl], { type: 'text/jsonl' }), 'ptypes.jsonl')
  const r = await fetch(tg.url, { method: 'POST', body: fd })
  if (r.status >= 300) throw new Error('upload failed ' + r.status)
  return tg.parameters.find(p => p.name === 'key').value
}

export default async function handler(req, res) {
  try {
    const job = String(req.query.job || '')
    const B = await build(req.query.o, req.query.c)
    const { todo, ...report } = B
    if (job === 'analyse' || req.query.go !== '1') return res.status(200).json({ ok: true, ...report, sample: todo.slice(0, 3) })
    if (job === 'tag') {
      const running = await gql('query{ currentBulkOperation(type:MUTATION){ id status } }')
      if (running.currentBulkOperation && /CREATED|RUNNING/.test(running.currentBulkOperation.status)) return res.status(409).json({ ok: false, error: 'another bulk tagging run is still going', running: running.currentBulkOperation })
      if (!todo.length) return res.status(200).json({ ok: true, nothingToDo: true, ...report })
      const path = await stagedUpload(todo.map(t => JSON.stringify(t)).join('\n'))
      const m = await gql('mutation($m:String!,$p:String!){ bulkOperationRunMutation(mutation:$m, stagedUploadPath:$p){ bulkOperation{ id status } userErrors{ message } } }',
        { m: 'mutation call($id:ID!,$tags:[String!]!){ tagsAdd(id:$id, tags:$tags){ userErrors{ message } } }', p: path })
      return res.status(200).json({ ok: true, started: m.bulkOperationRunMutation, ...report })
    }
    return res.status(400).json({ ok: false, error: 'unknown job' })
  } catch (e) { return res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
