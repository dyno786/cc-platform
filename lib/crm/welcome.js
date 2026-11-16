// First-order email for subscribers who have never bought: 10% off (WELCOME10) plus the store's current best sellers.
import { shell, appStrip, P, DISP, btn, escT, STORE } from './messages'
import { cell } from './newsletter'
import { productsByHandles } from './shopify'

const LIGHT = /skin.?(lighten|whiten|bleach)|whitening|lightening|fade cream|hydroquinone|carotone/i
export const CODE = 'WELCOME10'

// Best sellers over the last N days (by number of buyers), checked live: active, 3+ in stock, real price.
export async function bestSellers(snap, n, days) {
  const since = Date.now() - (days || 120) * 86400000
  const agg = {}
  for (const o of snap.orders) {
    if (o.test || o.cancelledAt || new Date(o.createdAt).getTime() < since) continue
    const seen = {}
    for (const it of o.items) {
      if (!it.handle || LIGHT.test(it.title) || seen[it.handle]) continue
      seen[it.handle] = 1
      const a = agg[it.handle] = agg[it.handle] || { handle: it.handle, buyers: 0 }
      a.buyers++
    }
  }
  const cands = Object.values(agg).sort((a, b) => b.buyers - a.buyers).slice(0, n * 4)
  const live = await productsByHandles(cands.map(c => c.handle))
  const out = []
  for (const c of cands) {
    const L = live[c.handle]
    if (!L || L.status !== 'ACTIVE' || L.totalInventory < 3 || LIGHT.test(L.title)) continue
    const amt = L.priceRangeV2 ? parseFloat(L.priceRangeV2.minVariantPrice.amount) : 0
    if (!(amt > 0)) continue
    out.push({ name: L.title, price: '£' + amt.toFixed(2), handle: c.handle, img: L.featuredImage ? L.featuredImage.url : '', blurb: 'A CC best seller', ok: true })
    if (out.length === n) break
  }
  return out
}

export function firstOrderEmail(products, S) {
  const subject = '10% off your first CC order'
  const preview = 'Use ' + CODE + ' on orders over £25. Ends 30 November.'
  const rows = [0, 2].map(i => products[i] ? `<tr>${cell(products[i])}${products[i + 1] ? cell(products[i + 1]) : '<td></td>'}</tr>` : '').join('')
  const body = `<tr><td align="center" style="text-align:center; background:#C2312B; color:#FFFFFF; padding:12px 16px; font-size:14px; font-weight:700;">Ends 30 November &middot; one use per customer</td></tr>
<tr><td align="center" class="pad" style="text-align:center; padding:40px 44px 0;">
  ${P('font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#C2312B;', '0', 'Welcome to CC')}
  <h1 class="h1" style="text-align:center; margin:12px 0 0; ${DISP} font-size:44px; line-height:1; color:#121A33;">10% off your first order</h1>
  ${P('font-size:16px; line-height:1.6; color:#3A4466;', '16px 0 22px', 'You joined our list but have not ordered yet. Here is 10% off to get you started, from the Leeds family-run shop trusted since 1979.')}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 22px;"><tr><td align="center" style="text-align:center; border:2px dashed #1D3E9E; border-radius:14px; padding:14px 30px; background:#EEF2FB;">${P('font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#1D3E9E;', '0', 'Your code')}${P(DISP + ' font-size:34px; letter-spacing:3px; color:#121A33;', '4px 0 0', CODE)}${P('font-size:13px; color:#4A5578;', '4px 0 0', 'On orders over &pound;25')}</td></tr></table>
  ${btn(STORE + '/discount/' + CODE + '?redirect=/collections/new-items-in-stock', 'Shop with 10% off', '#C2312B', '#FFFFFF')}
</td></tr>
<tr><td align="center" class="pad" style="text-align:center; padding:34px 44px 0;">${P(DISP + ' font-size:22px; color:#121A33;', '0', 'What Leeds buys most')}</td></tr>
<tr><td class="pad" style="padding:12px 24px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr>
${appStrip(S)}`
  return { subject, preview, html: shell(subject, preview, S, body, 'shopify') }
}
