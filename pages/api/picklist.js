// Branch pick lists: copies Shopify's own branch allocation (each fulfillment order's assigned location)
// onto the order, so packing slips, invoices and emails can show staff which branch holds each item.
//   job=picklist            preview: how many open orders would change (no changes)
//   job=picklist&go=1       write order metafields custom.branch_picklist and custom.pick_branches
// custom.branch_picklist: one line per item  "Branch|quantity|SKU|product (variant)", grouped by branch
// custom.pick_branches:   "Chapeltown Branch, Roundhay Road"
// Only touches orders that are open and not yet fully fulfilled. Never changes items, stock, fulfilment or customers.
import { gql } from '../../lib/intake'

export const config = { maxDuration: 300 }
const LIVE = /^(OPEN|IN_PROGRESS|SCHEDULED|ON_HOLD)$/

function build(o) {
  const by = {}
  for (const fo of o.fulfillmentOrders.nodes) {
    if (!LIVE.test(fo.status)) continue
    const b = (fo.assignedLocation && fo.assignedLocation.name) || 'Unassigned'
    for (const li of fo.lineItems.nodes) {
      const q = li.remainingQuantity; if (!q) continue
      const name = String(li.productTitle || '').replace(/\|/g, '/') + (li.variantTitle && li.variantTitle !== 'Default Title' ? ' (' + String(li.variantTitle).replace(/\|/g, '/') + ')' : '')
      ;(by[b] = by[b] || []).push(b + '|' + q + '|' + (li.sku || '') + '|' + name)
    }
  }
  const branches = Object.keys(by).sort()
  return { list: branches.map(b => by[b].join('\n')).join('\n'), branches: branches.join(', ') }
}

export default async function handler(req, res) {
  try {
    const go = req.query.go === '1'
    const started = Date.now()
    let cur = null, seen = 0, changed = 0, same = 0, empty = 0, errors = []
    const sample = []
    const pending = []
    const flush = async () => {
      while (pending.length) {
        const batch = pending.splice(0, 24)
        const r = await gql('mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ field message } } }', { m: batch })
        if (r.metafieldsSet.userErrors.length) errors.push(...r.metafieldsSet.userErrors.slice(0, 3))
      }
    }
    for (let page = 0; page < 40; page++) {
      const d = await gql(`query($c:String){ orders(first:25, after:$c, sortKey:CREATED_AT, reverse:true, query:"status:open AND (fulfillment_status:unfulfilled OR fulfillment_status:partial)"){
        pageInfo{ hasNextPage endCursor }
        nodes{ id name
          a: metafield(namespace:"custom", key:"branch_picklist"){ value }
          fulfillmentOrders(first:10){ nodes{ status assignedLocation{ name } lineItems(first:100){ nodes{ remainingQuantity sku productTitle variantTitle } } } } } } }`, { c: cur })
      for (const o of d.orders.nodes) {
        seen++
        const v = build(o)
        if (!v.list) { empty++; continue }
        if (o.a && o.a.value === v.list) { same++; continue }
        changed++
        if (sample.length < 3) sample.push({ order: o.name, branches: v.branches, lines: v.list.split('\n').length })
        if (go) {
          pending.push({ ownerId: o.id, namespace: 'custom', key: 'branch_picklist', type: 'multi_line_text_field', value: v.list })
          pending.push({ ownerId: o.id, namespace: 'custom', key: 'pick_branches', type: 'single_line_text_field', value: v.branches })
          if (pending.length >= 24) await flush()
        }
      }
      if (!d.orders.pageInfo.hasNextPage || Date.now() - started > 240000) break
      cur = d.orders.pageInfo.endCursor
    }
    if (go) await flush()
    return res.status(200).json({ ok: errors.length === 0, preview: !go, openOrders: seen, updated: go ? changed : 0, wouldUpdate: go ? undefined : changed, alreadyRight: same, nothingToPick: empty, errors, sample })
  } catch (e) { return res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
