// Store top-up list: the working-out and the label layout. Used by pages/api/topup.js (see the notes there).
export const TAG = 'roundhay warehouse'
const W = 812, H = 1218, M = 28            // 4 x 6 inch at 203 dpi, portrait
const FOOT = 70
export const MAX_LABELS = 40                       // never send more than this in one go
export const STORES = [                            // the stores that get a list, in print order
  { key: 'chap', label: 'Chapeltown', re: /chapeltown/i },
  { key: 'city', label: 'City Centre', re: /city cent/i },
  { key: 'round', label: 'Roundhay Road', re: /roundhay/i },   // the shop floor at Roundhay: topped up from the Warehouse only
]
export const SOURCE = /roundhay/i                  // where the stock is picked: Roundhay Road holds the bulk
export const WAREHOUSE = /warehouse/i
export const HAIR = /hair extensions/i             // Shopify product category of the braids and bulk hair

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
export const london = (opts, d = new Date()) => d.toLocaleString('en-GB', { timeZone: 'Europe/London', ...opts })
export const londonDay = () => london({ year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-')

// One list per store, holding only what can actually be sent.
// Roundhay Road is a shop as well as the stock room: its first `max` of every line stay on its own shop floor and are
// never sent anywhere. Only what it holds ABOVE `max` (the stock upstairs) is spare for Chapeltown and City Centre.
// The Warehouse location's stock is spare for all three shops, and it is the only place Roundhay's own shelf is
// topped up from. A store is listed for a line when it has fewer than `max` and there is spare stock for it.
// If there is not enough for everyone, it is shared one piece at a time, the store with the least first.
export function share(qty, max) {
  const have = k => Math.max(0, qty[k] || 0)       // a minus figure on the till counts as none on the shelf
  let spare = Math.max(0, have('round') - max), wh = have('wh')
  const send = {}, fromWh = {}; for (const s of STORES) { send[s.key] = 0; fromWh[s.key] = 0 }
  for (;;) {
    const open = STORES.map(s => s.key).filter(k => have(k) + send[k] < max && (wh > 0 || (k !== 'round' && spare > 0)))
    if (!open.length) break
    open.sort((a, b) => (have(a) + send[a]) - (have(b) + send[b]))
    const k = open[0]
    if (k !== 'round' && spare > 0) spare--          // the other shops take Roundhay's upstairs stock first
    else { wh--; fromWh[k]++ }                       // then the Warehouse; Roundhay's shelf only ever from the Warehouse
    send[k]++
  }
  return { send, fromWh }
}
export function buildList(variants, { max = 12, range = 'hair' } = {}) {
  const stores = STORES.map(s => ({ key: s.key, label: s.label, pieces: 0, lines: 0, products: [] }))
  const rows = variants.filter(v => v.status === 'ACTIVE' && (range === 'all' || v.hair))
    .sort((a, b) => a.product.localeCompare(b.product) || a.position - b.position)
  let skipped = 0
  for (const v of rows) {
    const spare = Math.max(0, (v.qty.round || 0) - max), wh = Math.max(0, v.qty.wh || 0)
    const { send, fromWh } = share(v.qty, max)
    if (!spare && !wh) { if (STORES.some(s => Math.max(0, v.qty[s.key] || 0) < max)) skipped++; continue }
    for (const s of stores) {
      const n = send[s.key]; if (!n) continue
      let p = s.products[s.products.length - 1]
      if (!p || p.id !== v.productId) { p = { id: v.productId, title: v.product, items: [] }; s.products.push(p) }
      // pick = what is spare for this store: the Warehouse, plus (not for Roundhay itself) Roundhay's stock above its own shelf
      p.items.push({ q: n, variant: v.variant, sku: v.sku, storeHas: v.qty[s.key] || 0, roundhayHas: v.qty.round || 0, warehouseHas: v.qty.wh || 0, fromWarehouse: fromWh[s.key], pick: wh + (s.key === 'round' ? 0 : spare) })
      s.pieces += n; s.lines++
    }
  }
  return { max, range, checked: rows.length, notListedNothingSpare: skipped, stores: stores.filter(s => s.lines) }
}

// An order from an outside supplier (products tagged "supplier <name>"). Nothing is moved between our own shops here:
// each shop (Chapeltown, City Centre, Roundhay Road) is worked out by itself from the supplier's rule.
//   top up:  order what brings the shop back up to `max` (and, if `when` is set, only once it has `when` or fewer)
//   fixed:   when the shop has `when` or fewer, order `qty`
// The first sheet is the total to order; one sheet per shop follows, to split the delivery by.
export function buildOrder(variants, { max = 12, when = null, qty = null, supplier = '' } = {}) {
  const stores = STORES.map(s => ({ key: s.key, label: s.label, pieces: 0, lines: 0, products: [] }))
  const total = { key: 'total', label: 'Total order', pieces: 0, lines: 0, products: [] }
  const rows = variants.filter(v => v.status === 'ACTIVE').sort((a, b) => a.product.localeCompare(b.product) || a.position - b.position)
  const add = (s, v, item) => {
    let p = s.products[s.products.length - 1]
    if (!p || p.id !== v.productId) { p = { id: v.productId, title: v.product, items: [] }; s.products.push(p) }
    p.items.push(item); s.pieces += item.q; s.lines++
  }
  for (const v of rows) {
    let sum = 0, stock = Math.max(0, v.qty.wh || 0); const per = {}
    for (const s of stores) {
      const has = v.qty[s.key] || 0, h = Math.max(0, has); stock += h
      let n = 0
      if (qty && when != null) { if (h <= when) n = qty }
      else if (when == null || h <= when) n = max - h
      if (n <= 0) continue
      per[s.key] = n; sum += n
      add(s, v, { q: n, variant: v.variant, sku: v.sku, storeHas: has, pick: h })
    }
    if (sum) add(total, v, { q: sum, variant: v.variant, sku: v.sku, storeHas: stock, pick: stock, split: per })
  }
  return { kind: 'supplier', supplier, max, when, qty, range: 'all', checked: rows.length, stores: [total, ...stores].filter(s => s.lines) }
}

// ---- labels (ZPL), one run of 6 x 4 labels per store
export function buildZpl(list, { demo = false } = {}) {
  const when = london({ weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const labels = []
  for (const s of list.stores) {
    let z = '', y = 0, n = 0
    const header = () => {
      n++
      z = '^XA^CI28^PW' + W + '^LL' + H + '^LH0,0'
      z += T(M, 22, 24, 'CC HAIR & BEAUTY  |  ' + (list.kind === 'supplier' ? 'SUPPLIER ORDER' : 'STORE TOP-UP') + (demo ? '  |  DEMO PRINT' : ''))
      z += T(M, 52, 62, s.label.toUpperCase(), true)
      z += T(M, 124, 26, when + '   |   ' + s.lines + ' line' + (s.lines === 1 ? '' : 's') + ', ' + s.pieces + ' pcs' + (n > 1 ? '   (continued)' : ''))
      z += T(M, 156, 24, (list.kind === 'supplier' ? 'Order from ' + list.supplier + '.  (n) = in stock now' : (s.key === 'round' ? 'Pick from the Warehouse.' : 'Pick at Roundhay Road.') + ' Tops the shelf up to ' + list.max + '.  (n) = spare stock'))
      z += `^FO${M},190^GB${W - 2 * M},3,3^FS`
      y = 204
    }
    const finish = () => { labels.push({ store: s.label, z }); z = '' }
    const COLS = 2, COL = Math.floor((W - 2 * M) / COLS), ROW = 34
    header()
    for (const p of s.products) {
      const title = wrap(p.title, 50).slice(0, 2)
      let i = 0
      while (i < p.items.length) {
        // a product starts (or carries on) only if its name and at least one row of colours still fit
        if (y + title.length * 30 + 4 + ROW > H - FOOT) { finish(); header() }
        for (let t = 0; t < title.length; t++) { z += T(M, y, 28, title[t] + (i && t === title.length - 1 ? ' (cont.)' : ''), true); y += 30 }
        y += 4
        while (i < p.items.length && y + ROW <= H - FOOT) {
          for (let c = 0; c < COLS && i < p.items.length; c++, i++) {
            const it = p.items[i], x = M + c * COL
            const name = clean((it.variant || 'one size').replace(/\s+-\s+/, ' ')).slice(0, it.fromWarehouse && s.key !== 'round' ? 11 : 15) + (it.fromWarehouse && s.key !== 'round' ? ' W' + it.fromWarehouse : '')
            z += T(x, y, 30, it.q + 'x', true) + T(x + 62, y + 2, 26, name) + T(x + COL - 84, y + 2, 26, '(' + it.pick + ')')
          }
          y += ROW
        }
        z += `^FO${M},${y}^GB${W - 2 * M},1,1^FS`; y += 10
      }
    }
    finish()
  }
  return labels.map((l, i) => l.z
    + `^FO${M},${H - FOOT + 4}^GB${W - 2 * M},2,2^FS`
    + T(M, H - FOOT + 16, 24, `Label ${i + 1} of ${labels.length}  |  ${l.store}`)
    + T(M, H - FOOT + 44, 22, 'Picked by ___________   Checked by ___________')
    + '^XZ')
}

// ---- A4 sheet (PDF), one page per store, for the HP office printer
// Everything for a store is squeezed onto ONE page: the layout tries bigger print first and steps down
// (more columns, smaller type) until the whole list fits. Only if even the smallest does not fit does it run on.
const HELV = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584]
const ascii = s => String(s == null ? '' : s).replace(/[–—]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim()
const textW = (s, size, bold) => { let w = 0; for (const ch of s) w += HELV[ch.charCodeAt(0) - 32] || 556; return w * size / 1000 * (bold ? 1.09 : 1) }
function fit(s, size, bold, max) { s = ascii(s); if (textW(s, size, bold) <= max) return s; while (s.length > 1 && textW(s + '..', size, bold) > max) s = s.slice(0, -1); return s.trim() + '..' }
function wrapW(s, size, bold, max, lines) {
  const words = ascii(s).split(' '), out = []; let line = ''
  for (const w of words) { const t = (line + ' ' + w).trim(); if (textW(t, size, bold) > max && line) { out.push(line); line = w } else line = t }
  if (line) out.push(line)
  if (out.length > lines) { out[lines - 1] = fit(out.slice(lines - 1).join(' '), size, bold, max); out.length = lines }
  return out
}
const PW = 595.28, PH = 841.89, PM = 26, HEAD = 74, FOOTER = 22
const SIZES = [[3, 10], [3, 9], [4, 9], [4, 8], [5, 8], [5, 7.2], [5, 6.5], [6, 6]]   // [columns, type size], biggest first

function layoutStore(s, cols, size) {
  const gap = 12, colW = (PW - 2 * PM - gap * (cols - 1)) / cols, row = size * 1.38
  const top = PH - PM - HEAD, bottom = PM + FOOTER
  const pages = [[]]; let col = 0, y = top
  const ops = () => pages[pages.length - 1]
  const x0 = () => PM + col * (colW + gap)
  const nextCol = () => { col++; y = top; if (col >= cols) { col = 0; pages.push([]) } }
  for (const p of s.products) {
    let title = wrapW(p.title, size, true, colW, 2), i = 0
    while (i < p.items.length) {
      if (y !== top) y -= row * 0.35
      // a product's name is only started where the name and at least one of its lines still fit
      if (y - row * (title.length + 1) < bottom) nextCol()
      for (const t of title) { y -= row; ops().push({ t: 'text', x: x0(), y, s: t, size, bold: true }) }
      ops().push({ t: 'line', x1: x0(), x2: x0() + colW, y: y - row * 0.28 })
      while (i < p.items.length && y - row >= bottom) {
        const it = p.items[i++]; y -= row
        const x = x0(), box = size * 0.78, qx = x + box + 3, qw = textW('12', size, true) + 2
        ops().push({ t: 'box', x, y: y - 1, w: box })
        ops().push({ t: 'text', x: qx + qw - textW(String(it.q), size, true), y, s: String(it.q), size, bold: true })
        const have = '(' + it.pick + ')', hw = textW(have, size, false)
        ops().push({ t: 'text', x: x + colW - hw, y, s: have, size, bold: false })
        const tag = it.fromWarehouse && s.key !== 'round' ? ' W' + it.fromWarehouse : '', tw = textW(tag, size, true)
        const nm = fit(it.variant || 'one size', size, false, colW - (qx + qw + 5 - x) - hw - 4 - tw)
        ops().push({ t: 'text', x: qx + qw + 5, y, s: nm, size, bold: false })
        if (tag) ops().push({ t: 'text', x: qx + qw + 5 + textW(nm, size, false) + 2, y, s: tag.trim(), size, bold: true })
      }
      if (i < p.items.length) { nextCol(); title = [fit(p.title, size, true, colW - textW(' (cont.)', size, true)) + ' (cont.)'] }
    }
  }
  return pages
}

export function buildPdf(list) {
  const when = london({ weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const sheets = []          // one entry per printed page
  for (const s of list.stores) {
    let pages = null, used = null
    for (const [cols, size] of SIZES) { pages = layoutStore(s, cols, size); used = [cols, size]; if (pages.length === 1) break }
    pages.forEach((ops, n) => sheets.push({ s, ops, n, of: pages.length, used }))
  }
  const esc = t => ascii(t).replace(/[\\()]/g, '\\$&')
  const txt = (x, y, str, size, bold) => `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${esc(str)}) Tj ET\n`
  const streams = sheets.map(({ s, ops, n, of }) => {
    let c = '0 G 0 g 0.6 w\n'
    const sup = list.kind === 'supplier'
    if (sup) c += txt(PM, PH - PM - 9, 'CC HAIR & BEAUTY  |  ORDER FROM ' + ascii(list.supplier).toUpperCase() + (s.key === 'total' ? '' : '  |  ' + s.label.toUpperCase() + ' SHARE OF THE ORDER'), 9, false)
    else c += txt(PM, PH - PM - 9, 'CC HAIR & BEAUTY  |  STORE TOP-UP  |  ' + (s.key === 'round' ? 'PICK FROM THE WAREHOUSE FOR THE ROUNDHAY SHOP FLOOR' : 'PICK FROM ROUNDHAY UPSTAIRS STOCK (ROUNDHAY KEEPS ITS OWN ' + list.max + ')'), 9, false)
    c += txt(PM, PH - PM - 36, s.label.toUpperCase() + (of > 1 ? '  (page ' + (n + 1) + ' of ' + of + ')' : ''), 26, true)
    const right = when + '   |   ' + s.lines + ' line' + (s.lines === 1 ? '' : 's') + ', ' + s.pieces + ' pcs'
    c += txt(PW - PM - textW(right, 11, true), PH - PM - 30, right, 11, true)
    if (sup) c += txt(PM, PH - PM - 54, s.key === 'total' ? 'Number = how many to order for all shops together.   (n) = how many we have in stock now, all branches.' : 'Number = how many of the order are for this shop.   (n) = how many the shop has now.   Tick the box when put away.', 9, false)
    else c += txt(PM, PH - PM - 54, s.key === 'round' ? 'Number = how many to bring down (tops the shelf up to ' + list.max + ').   (n) = how many the Warehouse has.   Tick the box when picked.' : 'Number = how many to send (tops the shelf up to ' + list.max + ').   (n) = spare stock.   W3 = 3 of them come from the Warehouse.   Tick when picked.', 9, false)
    c += `1.2 w ${PM} ${(PH - PM - 62).toFixed(2)} m ${(PW - PM).toFixed(2)} ${(PH - PM - 62).toFixed(2)} l S 0.4 w\n`
    for (const o of ops) {
      if (o.t === 'text') c += txt(o.x, o.y, o.s, o.size, o.bold)
      else if (o.t === 'box') c += `${o.x.toFixed(2)} ${o.y.toFixed(2)} ${o.w.toFixed(2)} ${o.w.toFixed(2)} re S\n`
      else if (o.t === 'line') c += `${o.x1.toFixed(2)} ${o.y.toFixed(2)} m ${o.x2.toFixed(2)} ${o.y.toFixed(2)} l S\n`
    }
    c += txt(PM, PM + 2, sup ? (s.key === 'total' ? 'Ordered by ____________________     Date ordered ____________________     Order ref ____________________' : 'Delivered ____________________     Checked by ____________________     Received at ' + s.label + ' by ____________________') : 'Picked by ____________________     Checked by ____________________     Received at ' + s.label + ' by ____________________', 9, false)
    return c
  })
  // write the PDF by hand (plain text pages, built-in Helvetica): no library needed
  const objs = []
  const kids = streams.map((_, i) => (5 + i * 2) + ' 0 R').join(' ')
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objs[2] = `<< /Type /Pages /Kids [${kids}] /Count ${streams.length} >>`
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  streams.forEach((c, i) => {
    objs[5 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`
    objs[6 + i * 2] = `<< /Length ${Buffer.byteLength(c, 'latin1')} >>\nstream\n${c}endstream`
  })
  let pdf = '%PDF-1.4\n'; const offs = []
  for (let i = 1; i < objs.length; i++) { offs[i] = Buffer.byteLength(pdf, 'latin1'); pdf += `${i} 0 obj\n${objs[i]}\nendobj\n` }
  const xref = Buffer.byteLength(pdf, 'latin1')
  pdf += `xref\n0 ${objs.length}\n0000000000 65535 f \n` + offs.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')
  pdf += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return { pdf: Buffer.from(pdf, 'latin1'), pages: sheets.map(x => ({ store: x.s.label, columns: x.used[0], typeSize: x.used[1] })) }
}
