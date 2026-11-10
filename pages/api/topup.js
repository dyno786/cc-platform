// Store top-up list: every night at 6pm, prints on the HP OfficeJet Pro 8710 (through PrintNode) what Chapeltown and
// City Centre each need to bring a shelf back up to 12. One A4 page per store. (&device=zebra prints 6 x 4 labels
// on the Zebra GK420d instead, the same way as the order pick labels in zebra.js.)
// Products: everything in Shopify tagged "roundhay warehouse". For now only the synthetic hair (Shopify category
// "Hair Extensions"); add &range=all for the cosmetics too, or set TOPUP_RANGE=all in Vercel.
// Stock: Shopify's stock for each branch. Roundhay Road holds the bulk and supplies the other two stores.
// Listed: only lines Roundhay Road has in stock and a store has fewer than 12 of. Lines Roundhay has none of are left off.
// Quantity: tops the store up to 12, never more than Roundhay has (shared between the two stores, the lower one first).
// Roundhay's stock (plus any Warehouse stock) is printed in brackets beside each line.
//   job=preview[&store=city][&range=all]        a page staff can read, one branch at a time, with print buttons. Prints nothing.
//   job=preview&json=1[&label=0]                the same list as JSON, plus label ZPL and a PNG picture
//   job=print                                   print the full list now (one A4 page per store)
//   job=pdf[&store=city]                        open the A4 page(s) as a PDF to look at. Prints nothing.
//   job=print&store=chapeltown  (or store=city)  print one store's list only; works on preview too
//   job=print&demo=1                            print only the first label, marked DEMO
//   job=status                                  switch, printer, last print
//   job=start / job=stop                        nightly printing on / off (on unless stopped)
//   cron=1                                      vercel.json, 17:00 and 18:00 UTC: prints once, when it is 6pm in London
// Needs Vercel env PRINTNODE_API_KEY. Optional TOPUP_PRINTER_ID (the HP, default 73836448), TOPUP_DEVICE=zebra, PRINTNODE_PRINTER_ID, ZEBRA_PAPER, ZEBRA_MODE, TOPUP_MAX, TOPUP_RANGE.
// Read-only on products and stock: it never changes stock, products or orders. It only keeps its own on/off
// switch and "last printed" date on the shop (metafield cc_print.topup).
import { gql } from '../../lib/intake'
import { TAG, STORES, SOURCE, WAREHOUSE, HAIR, MAX_LABELS, london, londonDay, buildList, buildZpl, buildPdf } from '../../lib/topup'

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
// The HP for the A4 sheets: HP_OfficeJet_Pro_8710_2 (73836448)
async function hpPrinter() {
  const id = Number(process.env.TOPUP_PRINTER_ID || 73836448)
  const list = await pn('/printers')
  const p = list.find(x => x.id === id)
  if (!p) throw new Error('Printer ' + id + ' is not in PrintNode. HP printers seen: ' + (list.filter(x => /hp|officejet/i.test(x.name) && !/fax/i.test(x.name)).map(x => x.name + ' ' + x.id + ' (' + x.state + ')').join(', ') || 'none'))
  return { id: p.id, name: p.name, state: p.state, computer: p.computer && p.computer.name }
}
async function sendPdf(pdf, title) {
  const p = await hpPrinter()
  const job = await pn('/printjobs', { method: 'POST', body: JSON.stringify({ printerId: p.id, title, source: 'CC store top-up list', contentType: 'pdf_base64', content: pdf.toString('base64'), options: { fit_to_page: true } })   // the HP's own A4 paper, as zebra.js does })
  return { printer: p.name, printerState: p.state, computer: p.computer, jobs: [job], as: 'A4 pdf' }
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
    const device = String(req.query.device || process.env.TOPUP_DEVICE || 'hp') === 'zebra' ? 'zebra' : 'hp'
    const range = String(req.query.range || process.env.TOPUP_RANGE || 'hair') === 'all' ? 'all' : 'hair'
    // &store=chapeltown or &store=city : just that one store's list (for a test run). Left out: both stores.
    const only = String(req.query.store || '').toLowerCase().replace(/[^a-z]/g, '')
    const pick = only ? STORES.find(s => s.re.test(only) || s.key === only || (/^city/.test(only) && s.key === 'city') || (/^chap/.test(only) && s.key === 'chap')) : null
    if (only && !pick) return res.status(400).json({ ok: false, error: 'unknown store: use store=chapeltown or store=city' })
    const make = async () => { const list = buildList(await loadVariants(), { max, range }); if (pick) list.stores = list.stores.filter(s => s.key === pick.key); return list }

    if (job === 'pdf') {
      const list = await make()
      if (!list.stores.length) return res.status(200).send('Nothing to send.')
      res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', 'inline; filename="top-up-' + londonDay() + '.pdf"'); res.setHeader('Cache-Control', 'no-store')
      return res.status(200).send(buildPdf(list).pdf)
    }
    if (job === 'preview' && req.query.json === '1') {
      const list = await make(); const zpls = buildZpl(list)
      const i = Math.max(0, Math.min(Number(req.query.label || 0), zpls.length - 1))
      return res.status(200).json({ ok: true, ...summary(list), labels: zpls.length, lists: list.stores, zpl: zpls[i], png: req.query.png === '0' || !zpls.length ? undefined : await labelary(zpls[i], 'image/png', 0) })
    }
    if (job === 'preview' || job === '') {
      // a page staff can read: the list for one branch at a time, with print buttons. Prints nothing by itself.
      const full = buildList(await loadVariants(), { max, range })
      const cur = pick ? pick.key : (full.stores[0] ? full.stores[0].key : STORES[0].key)
      const s = full.stores.find(x => x.key === cur)
      const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
      const q = (extra) => '?' + ['job=' + extra.job, 'store=' + (extra.store || cur), range === 'all' ? 'range=all' : '', extra.demo ? 'demo=1' : ''].filter(Boolean).join('&')
      const tabs = STORES.map(x => { const f = full.stores.find(y => y.key === x.key); return `<a class="tab${x.key === cur ? ' on' : ''}" href="${q({ job: 'preview', store: x.key })}">${esc(x.label)}<small>${f ? f.lines + ' lines, ' + f.pieces + ' pcs' : 'nothing to send'}</small></a>` }).join('')
      const body = !s ? '<p class="none">Nothing to send to this branch: it has ' + max + ' of everything Roundhay has in stock.</p>' : s.products.map(p => `<h2>${esc(p.title)}</h2><table><tr><th>Send</th><th>Colour</th><th>Branch has</th><th>Roundhay has</th></tr>${p.items.map(i => `<tr><td class="q">${i.q}</td><td>${esc(i.variant || 'one size')}</td><td>${i.storeHas}</td><td>${i.pick}</td></tr>`).join('')}</table>`).join('')
      const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CC store top-up</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:20px auto;padding:0 14px 60px;background:#fff;color:#111}h1{font-size:22px;margin:0 0 4px}p{color:#444;margin:6px 0}
.tabs{display:flex;gap:10px;margin:14px 0}.tab{flex:1;text-align:center;padding:12px 6px;border:2px solid #111;border-radius:10px;text-decoration:none;color:#111;font-weight:700;font-size:17px}.tab small{display:block;font-weight:400;font-size:13px;margin-top:2px}.tab.on{background:#111;color:#fff}
.btns{display:flex;gap:10px;margin:10px 0 18px}.b{flex:1;text-align:center;padding:14px 6px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;background:#0a7a3c;color:#fff}.b.alt{background:#fff;color:#111;border:2px solid #111}
h2{font-size:16px;margin:20px 0 6px;padding-top:10px;border-top:2px solid #111}table{width:100%;border-collapse:collapse;font-size:15px}th{text-align:left;font-size:12px;color:#666;font-weight:600;padding:4px 6px}td{padding:6px;border-top:1px solid #ddd}td.q{font-weight:800;font-size:18px;width:60px}.none{padding:20px;background:#f3f3f3;border-radius:8px}</style></head><body>
<h1>Store top-up from Roundhay</h1>
<p>${esc(london({ weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}. ${range === 'all' ? 'All tagged products' : 'Synthetic hair only'}. Tops each shelf up to ${max}. Only lines Roundhay has in stock are listed (${full.notListedRoundhayHasNone} left off).</p>
<div class="tabs">${tabs}</div>
${s ? `<div class="btns"><a class="b" href="${q({ job: 'print' })}" onclick="return confirm('Print the ${esc(s.label)} page on the HP printer now?')">Print ${esc(s.label)} (1 page)</a><a class="b alt" href="${q({ job: 'pdf' })}" target="_blank">See the page first</a></div>` : ''}
${body}</body></html>`
      res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); return res.status(200).send(html)
    }
    if (job === 'status') {
      const s = await state(); const out = { ok: true, switch: s.v, printNodeKey: !!process.env.PRINTNODE_API_KEY, londonTime: london({ hour: '2-digit', minute: '2-digit' }) }
      out.printsOn = device
      if (out.printNodeKey) { try { out.hp = await hpPrinter() } catch (e) { out.hpError = String(e.message) } }
      return res.status(200).json(out)
    }
    if (job === 'start' || job === 'stop') {
      const s = await state(); const v = { ...s.v, on: job === 'start', changed: new Date().toISOString() }
      return res.status(200).json({ ok: true, switch: v, errors: await setState(s.shopId, v) })
    }
    if (job === 'print') {
      const list = await make(); const demo = req.query.demo === '1'
      if (!list.stores.length) return res.status(200).json({ ok: true, printed: false, reason: 'nothing to send: both stores have ' + max + ' of everything Roundhay has in stock', ...summary(list) })
      const title = 'CC top-up ' + londonDay() + (pick ? ' ' + pick.label : '') + (demo ? ' demo' : '')
      let r
      if (device === 'zebra') {
        let zpls = buildZpl(list, { demo }); if (demo) zpls = zpls.slice(0, 1)
        if (zpls.length > MAX_LABELS) return res.status(400).json({ ok: false, error: 'The list is ' + zpls.length + ' labels, more than the limit of ' + MAX_LABELS + '. Nothing was printed.', ...summary(list) })
        r = { ...(await sendToPrinter(zpls, title)), sheets: zpls.length, what: 'label' }
      } else {
        const d = buildPdf(list); r = { ...(await sendPdf(d.pdf, title)), sheets: d.pages.length, what: 'page', pages: d.pages }
      }
      if (req.query.json !== '1' && /text\/html/.test(req.headers.accept || '')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        return res.status(200).send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui,sans-serif;max-width:480px;margin:40px auto;padding:0 16px"><h1 style="font-size:22px">Sent to the ${device === 'zebra' ? 'Zebra' : 'HP printer'}</h1><p>${r.sheets} ${r.what}${r.sheets === 1 ? '' : 's'}${pick ? ' for ' + pick.label : ''}. Printer: ${r.printer} (${r.printerState || 'unknown'}).</p><p><a href="?job=preview${pick ? '&store=' + pick.key : ''}">Back to the list</a></p></body>`)
      }
      return res.status(200).json({ ok: true, printed: true, device, ...r, ...summary(list) })
    }
    if (job === 'cron') {
      // vercel.json calls this at 17:00 and 18:00 UTC; only the one that is 6pm in London prints (summer and winter time)
      if (Number(london({ hour: '2-digit', hour12: false })) !== 18) return res.status(200).json({ ok: true, skipped: 'not 6pm in London' })
      const s = await state(); const today = londonDay()
      if (!s.v.on) return res.status(200).json({ ok: true, skipped: 'nightly printing is off' })
      if (s.v.lastDay === today) return res.status(200).json({ ok: true, skipped: 'already printed today' })
      if (!process.env.PRINTNODE_API_KEY) return res.status(200).json({ ok: true, skipped: 'no PrintNode key' })
      const list = await make()
      // mark the day first, so a second call can never print the list twice
      await setState(s.shopId, { ...s.v, lastDay: today, lastAt: new Date().toISOString(), last: 'printing' })
      let last
      try {
        if (!list.stores.length) last = 'nothing to send'
        else if (device === 'zebra') {
          const zpls = buildZpl(list)
          if (zpls.length > MAX_LABELS) last = 'not printed: ' + zpls.length + ' labels is over the limit of ' + MAX_LABELS
          else { const r = await sendToPrinter(zpls, 'CC top-up ' + today); last = 'printed ' + r.labels + ' label(s) on the Zebra, job ' + r.jobs.join(', ') }
        } else { const d = buildPdf(list); const r = await sendPdf(d.pdf, 'CC top-up ' + today); last = 'printed ' + d.pages.length + ' page(s) on ' + r.printer + ', job ' + r.jobs.join(', ') }
      } catch (e) { last = 'failed: ' + String(e.message).slice(0, 160) }
      await setState(s.shopId, { ...s.v, lastDay: today, lastAt: new Date().toISOString(), last, lastSummary: summary(list) })
      console.log('topup cron', last, JSON.stringify(summary(list)))
      return res.status(200).json({ ok: true, result: last, ...summary(list) })
    }
    return res.status(400).json({ ok: false, error: 'unknown job: use job=preview, print, status, start or stop' })
  } catch (e) { return res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
