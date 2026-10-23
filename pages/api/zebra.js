// Zebra pick labels: prints a 6 x 4 inch (Royal Mail size) pick label for every new paid order on the
// Zebra GK420d at Roundhay Road, through PrintNode. Items are grouped by the branch Shopify allocated them to:
// Chapeltown, Roundhay Road, City Centre, Warehouse. Each order prints once (order metafield custom.zebra_printed).
//   job=preview&order=33930[&label=0]  label as ZPL and a PNG picture (via Labelary). Prints nothing.
//   job=status                          is PrintNode set up, which printer, when printing started
//   job=start                           start automatic printing from now (orders before now are never printed)
//   job=stop                            stop automatic printing
//   job=reprint&order=33930             print that order's label again
//   cron=1                              every minute (vercel.json): print new paid orders not printed yet
// Needs Vercel env PRINTNODE_API_KEY (set by the owner in Vercel; never pasted in chat). Optional PRINTNODE_PRINTER_ID.
// Never changes items, stock, fulfilment, payment or customers.
import { gql } from '../../lib/intake'

export const config = { maxDuration: 120 }
const W = 812, H = 1218, M = 28            // 4 x 6 inch at 203 dpi, portrait
const FOOT = 70                             // space kept for the footer on every label
const GROUPS = [['Chapeltown', /chapeltown/i], ['Roundhay Road', /roundhay/i], ['City Centre', /city cent/i], ['Warehouse', /warehouse/i]]
const LIVE = /^(OPEN|IN_PROGRESS|SCHEDULED|ON_HOLD)$/

const clean = s => String(s == null ? '' : s).replace(/[\^~\\]/g, ' ').replace(/\s+/g, ' ').trim()
function wrap(text, max) {
  const words = clean(text).split(' '), out = []; let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) { if (line) out.push(line); line = w.length > max ? w.slice(0, max) : w } else line = (line + ' ' + w).trim()
  }
  if (line) out.push(line)
  return out
}
const T = (x, y, h, s, bold) => `^FO${x},${y}^A0N,${h},${bold ? Math.round(h * 1.05) : h}^FD${clean(s)}^FS`

const ORDER_FIELDS = `id name createdAt displayFinancialStatus note
  shippingLine{ title }
  shippingAddress{ name address1 city zip }
  billingAddress{ name address1 zip }
  printed: metafield(namespace:"custom", key:"zebra_printed"){ value compareDigest }
  fulfillmentOrders(first:10){ nodes{ status assignedLocation{ name } lineItems(first:100){ nodes{ remainingQuantity sku productTitle variantTitle } } } }`

async function findOrder(num) {
  const n = String(num).replace(/[^0-9]/g, '')
  const d = await gql(`query($q:String){ orders(first:1, query:$q){ nodes{ ${ORDER_FIELDS} } } }`, { q: 'name:#' + n })
  return d.orders.nodes[0]
}

function groupItems(o) {
  const groups = GROUPS.map(([label]) => ({ label, items: [] })); const other = {}
  for (const fo of o.fulfillmentOrders.nodes) {
    if (!LIVE.test(fo.status)) continue
    const loc = (fo.assignedLocation && fo.assignedLocation.name) || 'Not allocated'
    let g = GROUPS.findIndex(([, re]) => re.test(loc))
    for (const li of fo.lineItems.nodes) {
      if (!li.remainingQuantity) continue
      const item = { q: li.remainingQuantity, sku: li.sku || '', title: li.productTitle + (li.variantTitle && li.variantTitle !== 'Default Title' ? ' (' + li.variantTitle + ')' : '') }
      if (g >= 0) groups[g].items.push(item)
      else (other[loc] = other[loc] || { label: loc.replace(/ Branch$/, ''), items: [] }).items.push(item)
    }
  }
  return groups.concat(Object.values(other)).filter(g => g.items.length)
}

// Build one or more 6 x 4 labels (ZPL) for an order.
function buildZpl(o) {
  const num = o.name.replace('#', '')
  const groups = groupItems(o)
  const totalQty = groups.reduce((n, g) => n + g.items.reduce((m, i) => m + i.q, 0), 0)
  const ship = o.shippingAddress || {}, bill = o.billingAddress || {}
  const norm = s => String(s || '').toUpperCase().replace(/\s/g, '')
  let addr = 'none'
  if (o.shippingAddress && o.billingAddress) addr = norm(ship.zip) === norm(bill.zip) && String(ship.address1 || '').toLowerCase().trim() === String(bill.address1 || '').toLowerCase().trim() ? 'match' : 'differ'
  const date = new Date(o.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  const labels = []; let z = '', y = 0
  const header = (first) => {
    z = '^XA^CI28^PW' + W + '^LL' + H + '^LH0,0'
    z += T(M, 22, 24, 'CC HAIR & BEAUTY  |  PACK AT ROUNDHAY ROAD')
    z += T(M, 52, 62, 'Order #' + num, true)
    z += T(W - M - 250, 64, 26, date)
    z += `^FO${M},128^BY2,3,84^B3N,N,84,N,N^FD${num}^FS`
    z += T(M + 470, 140, 24, 'Scan in PackCheck')
    y = 226
    if (!first) { z += T(M, y, 26, 'continued...'); y += 36; return }
    for (const l of wrap('Delivery: ' + ((o.shippingLine && o.shippingLine.title) || 'Not specified'), 52).slice(0, 2)) { z += T(M, y, 26, l); y += 30 }
    z += T(M, y + 4, 32, 'To: ' + clean(ship.name || 'No delivery address') + (ship.zip ? '  ' + ship.zip : ''), true); y += 46
    if (addr === 'differ') {
      z += `^FO${M},${y}^GB${W - 2 * M},44,44^FS^FO${M + 12},${y + 9}^FR^A0N,28,28^FDCHECK: delivery address differs from billing^FS`; y += 56
    }
    if (o.note) { for (const l of wrap('NOTE: ' + o.note, 52).slice(0, 3)) { z += T(M, y, 24, l); y += 28 } y += 6 }
    z += `^FO${M},${y}^GB${W - 2 * M},3,3^FS`; y += 14
  }
  const finish = () => { labels.push(z); z = '' }
  header(true)
  for (const g of groups) {
    const gq = g.items.reduce((m, i) => m + i.q, 0)
    if (y + 46 + 60 > H - FOOT) { finish(); header(false) }
    z += `^FO${M},${y}^GB${W - 2 * M},42,42^FS^FO${M + 12},${y + 8}^FR^A0N,30,32^FD${clean(g.label.toUpperCase())}  -  ${gq} item${gq === 1 ? '' : 's'}^FS`; y += 52
    for (const it of g.items) {
      const lines = wrap(it.title, 40).slice(0, 3)
      const need = lines.length * 30 + (it.sku ? 26 : 0) + 14
      if (y + need > H - FOOT) {
        finish(); header(false)
        z += `^FO${M},${y}^GB${W - 2 * M},42,42^FS^FO${M + 12},${y + 8}^FR^A0N,30,32^FD${clean(g.label.toUpperCase())} (continued)^FS`; y += 52
      }
      z += `^FO${M},${y}^GB30,30,3^FS`
      z += T(M + 44, y, 30, it.q + 'x', true)
      let ly = y
      for (const l of lines) { z += T(M + 120, ly, 28, l); ly += 30 }
      if (it.sku) { z += T(M + 120, ly, 22, 'SKU ' + it.sku); ly += 26 }
      y = ly + 8
      z += `^FO${M + 120},${y - 4}^GB${W - 2 * M - 120},1,1^FS`
      y += 6
    }
    y += 6
  }
  if (!groups.length) { z += T(M, y, 30, 'Nothing left to pick on this order.'); y += 40 }
  finish()
  // footers: label x of n, totals, picked by
  return labels.map((l, i) => l
    + `^FO${M},${H - FOOT + 4}^GB${W - 2 * M},2,2^FS`
    + T(M, H - FOOT + 16, 24, `Label ${i + 1} of ${labels.length}  |  ${totalQty} item${totalQty === 1 ? '' : 's'} in total`)
    + T(M, H - FOOT + 44, 22, 'Picked by ___________   Checked by ___________')
    + '^XZ')
}

// ---- PrintNode
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
  const p = list.find(x => /zebra|zdesigner|gk420/i.test(x.name + ' ' + (x.description || '')))
  if (!p) throw new Error('No Zebra found in PrintNode. Printers seen: ' + list.map(x => x.name).join(', '))
  return { id: p.id, name: p.name, state: p.state, computer: p.computer && p.computer.name }
}
async function sendToPrinter(o, zpls, why) {
  const p = await printer()
  const job = await pn('/printjobs', { method: 'POST', body: JSON.stringify({ printerId: p.id, title: 'CC ' + o.name + (why ? ' ' + why : ''), contentType: 'raw_base64', content: Buffer.from(zpls.join('\n')).toString('base64'), source: 'CC Shopify pick labels' }) })
  return { printer: p.name, job, labels: zpls.length }
}

// ---- on/off switch, kept on the shop so it survives deploys
async function switchState() {
  const d = await gql('query{ shop{ id metafield(namespace:"cc_print", key:"zebra"){ value } } }')
  return { shopId: d.shop.id, v: d.shop.metafield ? JSON.parse(d.shop.metafield.value) : { on: false } }
}
async function setSwitch(shopId, v) {
  const r = await gql('mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ message } } }', { m: [{ ownerId: shopId, namespace: 'cc_print', key: 'zebra', type: 'json', value: JSON.stringify(v) }] })
  return r.metafieldsSet.userErrors
}

async function labelPng(zpl) {
  const r = await fetch('https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/', { method: 'POST', headers: { Accept: 'image/png', 'Content-Type': 'application/x-www-form-urlencoded' }, body: zpl })
  if (!r.ok) return null
  return Buffer.from(await r.arrayBuffer()).toString('base64')
}

export default async function handler(req, res) {
  try {
    const job = String(req.query.job || (req.query.cron === '1' ? 'cron' : ''))
    if (job === 'preview') {
      const o = await findOrder(req.query.order); if (!o) return res.status(404).json({ ok: false, error: 'order not found' })
      const zpls = buildZpl(o); const i = Math.min(Number(req.query.label || 0), zpls.length - 1)
      return res.status(200).json({ ok: true, order: o.name, labels: zpls.length, zpl: zpls[i], png: req.query.png === '0' ? undefined : await labelPng(zpls[i]) })
    }
    if (job === 'status') {
      const s = await switchState(); const out = { ok: true, switch: s.v, printNodeKey: !!process.env.PRINTNODE_API_KEY }
      if (out.printNodeKey) { try { out.printer = await printer() } catch (e) { out.printerError = String(e.message) } }
      return res.status(200).json(out)
    }
    if (job === 'start' || job === 'stop') {
      const s = await switchState()
      const v = job === 'start' ? { on: true, since: new Date().toISOString() } : { ...s.v, on: false, stopped: new Date().toISOString() }
      return res.status(200).json({ ok: true, switch: v, errors: await setSwitch(s.shopId, v) })
    }
    if (job === 'reprint') {
      const o = await findOrder(req.query.order); if (!o) return res.status(404).json({ ok: false, error: 'order not found' })
      return res.status(200).json({ ok: true, order: o.name, ...(await sendToPrinter(o, buildZpl(o), 'reprint')) })
    }
    if (job === 'cron') {
      const s = await switchState()
      if (!s.v.on || !process.env.PRINTNODE_API_KEY) return res.status(200).json({ ok: true, skipped: !s.v.on ? 'printing is off' : 'no PrintNode key' })
      const since = new Date(Math.max(new Date(s.v.since).getTime(), Date.now() - 2 * 86400000)).toISOString()
      const d = await gql(`query($q:String){ orders(first:20, sortKey:CREATED_AT, query:$q){ nodes{ ${ORDER_FIELDS} } } }`,
        { q: `financial_status:paid AND status:open AND (fulfillment_status:unfulfilled OR fulfillment_status:partial) AND created_at:>'${since}'` })
      const done = []
      for (const o of d.orders.nodes) {
        if (o.printed) continue
        // claim the order first, so two runs can never print it twice
        const c = await gql('mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ code message } } }', { m: [{ ownerId: o.id, namespace: 'custom', key: 'zebra_printed', type: 'single_line_text_field', value: 'printing ' + new Date().toISOString(), compareDigest: null }] })
        if (c.metafieldsSet.userErrors.length) continue
        try {
          const r = await sendToPrinter(o, buildZpl(o))
          await gql('mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ message } } }', { m: [{ ownerId: o.id, namespace: 'custom', key: 'zebra_printed', type: 'single_line_text_field', value: 'printed ' + new Date().toISOString() + ' job ' + r.job }] })
          done.push(o.name + ' ' + r.labels + ' label(s)')
        } catch (e) {
          await gql('mutation($m:[MetafieldsDeleteInput!]!){ metafieldsDelete(metafields:$m){ userErrors{ message } } }', { m: [{ ownerId: o.id, namespace: 'custom', key: 'zebra_printed' }] }) // not printed: try again next minute
          done.push(o.name + ' failed: ' + String(e.message).slice(0, 120))
        }
      }
      if (done.length) console.log('zebra cron', JSON.stringify(done))
      return res.status(200).json({ ok: true, printed: done })
    }
    return res.status(400).json({ ok: false, error: 'unknown job' })
  } catch (e) { return res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
