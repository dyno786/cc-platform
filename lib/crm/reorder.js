// Reorder email waves: who is due, what the category email says, and what to mark done afterwards.
// One email per category (so AfterShip can send it as a normal campaign), personalised by timing and category.
import { categorise, CATEGORIES, catByKey } from './rules'
import { mergeSettings } from './engine'
import { shell, appStrip, P, DISP, btn, escT, escA, STORE } from './messages'
import { cell } from './newsletter'
import { productsByHandles } from './shopify'

const DAY = 86400000

// Which categories go out on which day (Tue / Thu / Sat, UK time). Anything not listed goes on Saturday.
export const WAVE_DAYS = {
  tue: ['dye', 'treatment', 'wigglue'],
  thu: ['conditioner', 'shampoo', 'edge'],
  sat: ['braid', 'skin', 'makeup', 'kids', 'mens', 'wig'],
}
export const CAT_COPY = {
  dye:         { h: 'Time for fresh colour?',      search: '/search?q=hair+colour', noun: 'hair colour' },
  treatment:   { h: 'Time to top up your oils?',   search: '/search?q=hair+oil',   noun: 'hair oil or treatment' },
  wigglue:     { h: 'Running low on wig glue?',    search: '/search?q=wig+glue',   noun: 'wig glue or melting spray' },
  conditioner: { h: 'Running low on conditioner?', search: '/collections/conditioner', noun: 'conditioner or leave-in' },
  shampoo:     { h: 'Running low on shampoo?',     search: '/collections/shampoo', noun: 'shampoo' },
  edge:        { h: 'Edges need a top-up?',        search: '/search?q=edge+control', noun: 'edge control' },
  braid:       { h: 'Your next braid starts here', search: '/pages/braids-range',  noun: 'braiding hair' },
  skin:        { h: 'Time to restock skin care?',  search: '/search?q=body+lotion', noun: 'skin and body care' },
  makeup:      { h: 'Running low on makeup?',      search: '/search?q=makeup',     noun: 'makeup' },
  kids:        { h: 'Kids hair care top-up?',      search: '/search?q=kids',       noun: 'kids hair care' },
  mens:        { h: 'Restock your grooming kit',   search: '/search?q=beard',      noun: 'grooming products' },
  wig:         { h: 'Ready for a new look?',       search: '/pages/wigs-lace-wigs', noun: 'wigs and bundles' },
}

export const dayOfCat = cat => Object.keys(WAVE_DAYS).find(d => WAVE_DAYS[d].includes(cat)) || 'sat'

// step 1 = first "running low" email, step 3 = final reminder 7 days later
export function waveAudience(snap, state, settingsRaw, cat, step, nowMs) {
  const now = nowMs || Date.now()
  const S = mergeSettings(settingsRaw)
  const win = S.reorderDays[cat] || (catByKey(cat).reorder || [30])[0]
  const rows = []
  const byCust = {}
  for (const o of snap.orders) if (o.customerId && !o.test && !o.cancelledAt) (byCust[o.customerId] = byCust[o.customerId] || []).push(o)
  for (const cid in byCust) {
    const c = snap.customers[cid]; if (!c || !c.email || !c.emailSub) continue
    const st = state[cid] || {}
    if (st.paused || st.issue) continue
    let last = null
    for (const o of byCust[cid]) for (const it of o.items) {
      if (categorise(it).key !== cat) continue
      if (!last || last.at < o.createdAt) last = { at: o.createdAt, title: it.title, handle: it.handle }
    }
    if (!last) continue
    const d = Math.floor((now - new Date(last.at).getTime()) / DAY)
    const base = 'reorder:' + cid + ':' + cat + ':' + last.at.slice(0, 10)
    const done = st.done || {}
    if (step === 1) {
      if (d < win || d > win + 28 || done[base + ':1']) continue
    } else {
      if (!done[base + ':1'] || done[base + ':3']) continue
      if (now - new Date(done[base + ':1']).getTime() < 7 * DAY) continue
    }
    const cap = (st.log || []).filter(l => l.marketing && now - new Date(l.ts).getTime() < 7 * DAY).length
    if (cap >= S.weeklyCap) continue
    rows.push({ customerId: cid, email: c.email, name: c.name, product: last.title, days: d, key: base + ':' + step })
  }
  return { cat, step, window: win, rows }
}

// Best sellers in this category from the snapshot, checked live: active and 3+ in stock.
export async function topProducts(snap, cat, n) {
  const agg = {}
  for (const o of snap.orders) {
    if (o.test || o.cancelledAt) continue
    const seen = {}
    for (const it of o.items) {
      if (!it.handle || categorise(it).key !== cat) continue
      const a = agg[it.handle] = agg[it.handle] || { handle: it.handle, title: it.title, units: 0, buyers: 0 }
      a.units += it.qty || it.quantity || 1
      if (!seen[it.handle]) { a.buyers++; seen[it.handle] = 1 }
    }
  }
  const cands = Object.values(agg).sort((a, b) => b.buyers - a.buyers).slice(0, n * 3)
  if (!cands.length) return []
  const live = await productsByHandles(cands.map(c => c.handle))
  const out = []
  for (const c of cands) {
    const L = live[c.handle]
    if (!L || L.status !== 'ACTIVE' || L.totalInventory < 3) continue
    const amt = L.priceRangeV2 ? parseFloat(L.priceRangeV2.minVariantPrice.amount) : 0
    if (!(amt > 0)) continue
    out.push({ name: L.title, price: '£' + amt.toFixed(2), handle: c.handle, img: L.featuredImage ? L.featuredImage.url : '', blurb: c.buyers + ' CC customers bought this recently', ok: true })
    if (out.length === n) break
  }
  return out
}

export function reorderEmail(cat, step, products, S, window) {
  const copy = CAT_COPY[cat] || { h: 'Time for a top-up?', search: '/', noun: catByKey(cat).name.toLowerCase() }
  const weeks = Math.max(1, Math.round(window / 7))
  const final = step === 3
  const subject = final ? 'Last reminder: your ' + copy.noun : copy.h
  const preview = final ? 'In case you missed it: your favourites are still in stock.' : 'About ' + weeks + ' weeks since your last ' + copy.noun + '. Your favourites are in stock.'
  const rows = [0, 2].map(i => products[i] ? `<tr>${cell(products[i])}${products[i + 1] ? cell(products[i + 1]) : '<td></td>'}</tr>` : '').join('')
  const body = `<tr><td align="center" class="pad" style="text-align:center; padding:40px 44px 0;">
  ${P('font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#C2312B;', '0', final ? 'Last reminder' : 'Time for a top-up?')}
  <h1 class="h1" style="text-align:center; margin:12px 0 0; ${DISP} font-size:44px; line-height:1; color:#121A33;">${escT(copy.h)}</h1>
  ${P('font-size:16px; line-height:1.6; color:#3A4466;', '16px 0 22px', `It has been about ${weeks} weeks since you last bought ${escT(copy.noun)} from us, which is usually when it runs out. Here are the favourites our customers reorder.${S.freeDelivery ? ' Free UK delivery over &pound;' + escT(S.freeDelivery) + '.' : ''}`)}
  ${btn(STORE + copy.search, 'Buy again', '#C2312B', '#FFFFFF')}
</td></tr>
<tr><td class="pad" style="padding:28px 24px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr>
${appStrip(S)}`
  return { subject, preview, html: shell(subject, preview, S, body, 'shopify') }
}
