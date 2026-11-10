// Store top-up list: the working-out and the label layout. Used by pages/api/topup.js (see the notes there).
export const TAG = 'roundhay warehouse'
const W = 812, H = 1218, M = 28            // 4 x 6 inch at 203 dpi, portrait
const FOOT = 70
export const MAX_LABELS = 40                       // never send more than this in one go
export const STORES = [                            // the stores that get a list, in print order
  { key: 'chap', label: 'Chapeltown', re: /chapeltown/i },
  { key: 'city', label: 'City Centre', re: /city cent/i },
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

// One list per store, holding only what Roundhay Road can actually send.
// A line is listed when the store has fewer than `max` AND Roundhay Road (plus any Warehouse stock) has some.
// The quantity tops the store up to `max` but never asks for more than Roundhay has. When both stores want the
// same line and there is not enough for both, it is shared out one piece at a time, the store with less first.
export function share(qty, max) {
  const have = k => Math.max(0, qty[k] || 0)       // a minus figure on the till counts as none on the shelf
  let left = have('round') + have('wh')
  const send = {}; for (const s of STORES) send[s.key] = 0
  while (left > 0) {
    const open = STORES.map(s => s.key).filter(k => have(k) + send[k] < max)
    if (!open.length) break
    open.sort((a, b) => (have(a) + send[a]) - (have(b) + send[b]))
    send[open[0]]++; left--
  }
  return send
}
export function buildList(variants, { max = 12, range = 'hair' } = {}) {
  const stores = STORES.map(s => ({ key: s.key, label: s.label, pieces: 0, lines: 0, products: [] }))
  const rows = variants.filter(v => v.status === 'ACTIVE' && (range === 'all' || v.hair))
    .sort((a, b) => a.product.localeCompare(b.product) || a.position - b.position)
  let skipped = 0
  for (const v of rows) {
    const pick = Math.max(0, v.qty.round || 0) + Math.max(0, v.qty.wh || 0)   // what is there to pick from
    if (!pick) { if (STORES.some(s => Math.max(0, v.qty[s.key] || 0) < max)) skipped++; continue }
    const send = share(v.qty, max)
    for (const s of stores) {
      const n = send[s.key]; if (!n) continue
      let p = s.products[s.products.length - 1]
      if (!p || p.id !== v.productId) { p = { id: v.productId, title: v.product, items: [] }; s.products.push(p) }
      p.items.push({ q: n, variant: v.variant, sku: v.sku, storeHas: v.qty[s.key] || 0, roundhayHas: v.qty.round || 0, warehouseHas: v.qty.wh || 0, pick })
      s.pieces += n; s.lines++
    }
  }
  return { max, range, checked: rows.length, notListedRoundhayHasNone: skipped, stores: stores.filter(s => s.lines) }
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
      z += T(M, 22, 24, 'CC HAIR & BEAUTY  |  STORE TOP-UP' + (demo ? '  |  DEMO PRINT' : ''))
      z += T(M, 52, 62, s.label.toUpperCase(), true)
      z += T(M, 124, 26, when + '   |   ' + s.lines + ' line' + (s.lines === 1 ? '' : 's') + ', ' + s.pieces + ' pcs' + (n > 1 ? '   (continued)' : ''))
      z += T(M, 156, 24, 'Pick at Roundhay Road. Tops the shelf up to ' + list.max + '.  (n) = Roundhay has n')
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
            const name = clean((it.variant || 'one size').replace(/\s+-\s+/, ' ')).slice(0, 15)
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
