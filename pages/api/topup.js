// Store top-up list: every night at 6pm, prints on the Zebra GK420d at Roundhay Road (through PrintNode, the same
// way as the order pick labels in zebra.js) what Chapeltown and City Centre each need to bring a shelf back up to 12.
// Products: everything in Shopify tagged "roundhay warehouse". For now only the synthetic hair (Shopify category
// "Hair Extensions"); add &range=all for the cosmetics too, or set TOPUP_RANGE=all in Vercel.
// Stock: Shopify's stock for each branch. Roundhay Road holds the bulk and supplies the other two stores.
// Listed: only lines Roundhay Road has in stock and a store has fewer than 12 of. Lines Roundhay has none of are left off.
// Quantity: tops the store up to 12, never more than Roundhay has (shared between the two stores, the lower one first).
// Roundhay's stock (plus any Warehouse stock) is printed in brackets beside each line.
//   job=preview[&label=0][&range=all][&max=12]  the list as JSON, plus label ZPL and a PNG picture. Prints nothing.
//   job=print                                   print the full list now
//   job=print&demo=1                            print only the first label, marked DEMO
//   job=status                                  switch, printer, last print
//   job=start / job=stop                        nightly printing on / off (on unless stopped)
//   cron=1                                      vercel.json, 17:00 and 18:00 UTC: prints once, when it is 6pm in London
// Needs Vercel env PRINTNODE_API_KEY. Optional PRINTNODE_PRINTER_ID, ZEBRA_PAPER, ZEBRA_MODE, TOPUP_MAX, TOPUP_RANGE.
// Read-only on products and stock: it never changes stock, products or orders. It only keeps its own on/off
// switch and "last printed" date on the shop (metafield cc_print.topup).
import { gql } from '../../lib/intake'
import { TAG, STORES, SOURCE, WAREHOUSE, HAIR, MAX_LABELS, london, londonDay, buildList, buildZpl } from '../../lib/topup'

export const config = { maxDuration: 120 }
// ---- stock from Shopify
async function loadVariants() {
  const out = []; let after = null
  for (let page = 0; page < 30; page++) {
    const d = await gql(`query($q:String!, $after:String){ productVariants(first:60, after:$after, query:$q){ pageInfo{ hasNextPage endCursor }
      nodes{ sku title position product{ id title status category{ fullName } }
        inventoryItem{ inventoryLevels(first:6){ nodes{ location{ name } quantities(names:["available"]){ quantity } } } } } } }`, { q: `tag:'${TAG}'`, after })
    const c = d.productVariants
    for (const v of c.nodes) {
      const qty = { chap: 0, city: 0, round: 0, wh: 0 }
      for (const l of v.inventoryItem.inventoryLevels.nodes) {
        const name = (l.location && l.location.name) || '', q = (l.quantities[0] && l.quantities[0].quantity) || 0
        const s = STORES.find(x => x.re.test(name))
        if (s) qty[s.key] += q; else if (SOURCE.test(name)) qty.round += q; else if (WAREHOUSE.test(name)) qty.wh += q
      }
      out.push({ sku: v.sku || '', variant: v.title === 'Default Title' ? '' : v.title, position: v.position || 0, productId: v.product.id, product: v.product.title, status: v.product.status, hair: HAIR.test((v.product.category && v.product.category.fullName) || ''), qty })
    }
    if (!c.pageInfo.hasNextPage) break
    after = c.pageInfo.endCursor
  }
  return out
}

// ---- PrintNode (same printer and method as zebra.js)
async function pn(path, opts = {}) {
  const key = process.env.PRINTNODE_API_KEY
  if (!key) throw new Error('PrintNode is not set up yet: add PRINTNODE_API_KEY in Vercel')
  const r = await fetch('https://api.printnode.com' + path, { ...opts, headers: { Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64'), 'Content-Type': 'application/json', ...(opts.headers || {}) } })
  const t = await r.text(); let j = null; try { j = JSON.parse(t) } catch (e) {}
  if (!r.ok) throw new Error('PrintNode ' + r.status + ': ' + t.slice(0, 200))
  return j
}
async function printer() {
  if (process.env.PRINTNODE_PRINTER_ID) return { id: Number(process.env.PRINTNODE_PRINTER_ID), name: 'set in Vercel' }
  const list = await pn('/printers')
  // Roundhay Road: Zebra_Technologies_ZTC_GK420d on THES-IMAC (73823768), used whenever it is in PrintNode
  const fixed = list.find(x => x.id === 73823768)
  if (fixed) return { id: fixed.id, name: fixed.name, state: fixed.state, computer: fixed.computer && fixed.computer.name }
  const score = x => (/gk420/i.test(x.name + ' ' + (x.description || '')) ? 4 : /zdesigner|zebra_technologies/i.test(x.name) ? 2 : 0) + (x.state === 'online' ? 8 : 0) + (x.computer && /thes-imac/i.test(x.computer.name) ? 2 : 0) - (/amazon/i.test(x.name) ? 3 : 0)
  const p = list.filter(x => /zebra|zdesigner|gk420/i.test(x.name + ' ' + (x.description || ''))).sort((a, b) => score(b) - score(a))[0]
  if (!p) throw new Error('No Zebra found in PrintNode. Printers seen: ' + list.map(x => x.name).join(', '))
  return { id: p.id, name: p.name, state: p.state, computer: p.computer && p.computer.name }
}
// The Mac's Zebra driver prints raw label code as text, so labels go as a 6 x 4 inch PDF made from the ZPL by Labelary.
async function labelary(zpl, accept, index) {
  const fd = new FormData(); fd.append('file', new Blob([zpl], { type: 'text/plain' }), 'label.zpl')
  const r = await fetch('https://api.labelary.com/v1/printers/8dpmm/labels/4x6/' + (index == null ? '' : index + '/'), { method: 'POST', headers: { Accept: accept }, body: fd })
  if (!r.ok) throw new Error('label picture failed ' + r.status + ' ' + (await r.text()).slice(0, 120))
  return Buffer.from(await r.arrayBuffer()).toString('base64')
}
async function sendToPrinter(zpls, title) {
  const p = await printer()
  const raw = process.env.ZEBRA_MODE === 'raw'
  const jobs = []
  // 10 labels per print job keeps each PDF small and inside Labelary's limits
  for (let i = 0; i < zpls.length; i += 10) {
    const part = zpls.slice(i, i + 10)
    const body = { printerId: p.id, title: title + (zpls.length > 10 ? ' part ' + (i / 10 + 1) : ''), source: 'CC store top-up list' }
    if (raw) { body.contentType = 'raw_base64'; body.content = Buffer.from(part.join('\n')).toString('base64') }
    else { body.contentType = 'pdf_base64'; body.content = await labelary(part.join('\n'), 'application/pdf'); body.options = { fit_to_page: true, paper: process.env.ZEBRA_PAPER || 'w288h432' } }
    jobs.push(await pn('/printjobs', { method: 'POST', body: JSON.stringify(body) }))
  }
  return { printer: p.name, printerState: p.state, jobs, labels: zpls.length, as: raw ? 'zpl' : 'pdf' }
}

// ---- switch and "last printed", kept on the shop so they survive deploys
async function state() {
  const d = await gql('query{ shop{ id metafield(namespace:"cc_print", key:"topup"){ value } } }')
  return { shopId: d.shop.id, v: d.shop.metafield ? JSON.parse(d.shop.metafield.value) : { on: true } }
}
async function setState(shopId, v) {
  const r = await gql('mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ message } } }', { m: [{ ownerId: shopId, namespace: 'cc_print', key: 'topup', type: 'json', value: JSON.stringify(v) }] })
  return r.metafieldsSet.userErrors
}

const summary = list => ({
  topUpTo: list.max, range: list.range === 'all' ? 'everything tagged ' + TAG : 'synthetic hair only', linesChecked: list.checked,
  stores: list.stores.map(s => ({ store: s.label, lines: s.lines, pieces: s.pieces })),
  linesLeftOffRoundhayHasNone: list.notListedRoundhayHasNone,
})

export default async function handler(req, res) {
  try {
    const job = String(req.query.job || (req.query.cron === '1' ? 'cron' : ''))
    const max = Math.min(99, Math.max(1, Number(req.query.max || process.env.TOPUP_MAX || 12)))
    const range = String(req.query.range || process.env.TOPUP_RANGE || 'hair') === 'all' ? 'all' : 'hair'
    const make = async () => { const list = buildList(await loadVariants(), { max, range }); return list }

    if (job === 'preview') {
      const list = await make(); const zpls = buildZpl(list)
      const i = Math.max(0, Math.min(Number(req.query.label || 0), zpls.length - 1))
      return res.status(200).json({ ok: true, ...summary(list), labels: zpls.length, lists: list.stores, zpl: zpls[i], png: req.query.png === '0' || !zpls.length ? undefined : await labelary(zpls[i], 'image/png', 0) })
    }
    if (job === 'status') {
      const s = await state(); const out = { ok: true, switch: s.v, printNodeKey: !!process.env.PRINTNODE_API_KEY, londonTime: london({ hour: '2-digit', minute: '2-digit' }) }
      if (out.printNodeKey) { try { out.zebra = await printer() } catch (e) { out.zebraError = String(e.message) } }
      return res.status(200).json(out)
    }
    if (job === 'start' || job === 'stop') {
      const s = await state(); const v = { ...s.v, on: job === 'start', changed: new Date().toISOString() }
      return res.status(200).json({ ok: true, switch: v, errors: await setState(s.shopId, v) })
    }
    if (job === 'print') {
      const list = await make(); const demo = req.query.demo === '1'
      let zpls = buildZpl(list, { demo })
      if (!zpls.length) return res.status(200).json({ ok: true, printed: false, reason: 'nothing to send: both stores have ' + max + ' of everything Roundhay has in stock', ...summary(list) })
      const all = zpls.length
      if (demo) zpls = zpls.slice(0, 1)
      if (zpls.length > MAX_LABELS) return res.status(400).json({ ok: false, error: 'The list is ' + zpls.length + ' labels, more than the limit of ' + MAX_LABELS + '. Nothing was printed.', ...summary(list) })
      const r = await sendToPrinter(zpls, 'CC top-up ' + londonDay() + (demo ? ' demo' : ''))
      return res.status(200).json({ ok: true, printed: true, demo, labelsInFullList: all, ...r, ...summary(list) })
    }
    if (job === 'cron') {
      // vercel.json calls this at 17:00 and 18:00 UTC; only the one that is 6pm in London prints (summer and winter time)
      if (Number(london({ hour: '2-digit', hour12: false })) !== 18) return res.status(200).json({ ok: true, skipped: 'not 6pm in London' })
      const s = await state(); const today = londonDay()
      if (!s.v.on) return res.status(200).json({ ok: true, skipped: 'nightly printing is off' })
      if (s.v.lastDay === today) return res.status(200).json({ ok: true, skipped: 'already printed today' })
      if (!process.env.PRINTNODE_API_KEY) return res.status(200).json({ ok: true, skipped: 'no PrintNode key' })
      const list = await make(); const zpls = buildZpl(list)
      // mark the day first, so a second call can never print the list twice
      await setState(s.shopId, { ...s.v, lastDay: today, lastAt: new Date().toISOString(), last: 'printing' })
      let last
      try {
        if (!zpls.length) last = 'nothing to send'
        else if (zpls.length > MAX_LABELS) last = 'not printed: ' + zpls.length + ' labels is over the limit of ' + MAX_LABELS
        else { const r = await sendToPrinter(zpls, 'CC top-up ' + today); last = 'printed ' + r.labels + ' label(s), job ' + r.jobs.join(', ') }
      } catch (e) { last = 'failed: ' + String(e.message).slice(0, 160) }
      await setState(s.shopId, { ...s.v, lastDay: today, lastAt: new Date().toISOString(), last, lastSummary: summary(list) })
      console.log('topup cron', last, JSON.stringify(summary(list)))
      return res.status(200).json({ ok: true, result: last, ...summary(list) })
    }
    return res.status(400).json({ ok: false, error: 'unknown job: use job=preview, print, status, start or stop' })
  } catch (e) { return res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
