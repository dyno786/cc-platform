// Builds the nightly newsletter HTML for Shopify Email, with live prices and stock from the store.
import { DAYS, EXTRA, ALL } from './newsletterData'
import { shell, appStrip, audienceBlock, P, DISP, btn, escA, escT, STORE } from './messages'
import { productsByHandles } from './shopify'

const CDN = 'https://cdn.shopify.com/s/files/1/0605/2118/5501/'
const imgUrl = p => { let u = CDN + p + '&width=400'; if (/\.webp\?/.test(p)) u += '&format=jpg'; return u }
const LIGHT = /skin.?(lighten|whiten|bleach)|whitening|lightening|fade cream|hydroquinone|carotone/i

export { DAYS, EXTRA, ALL }
export const todayKey = (d) => ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][(d || new Date()).getDay()]

// Check the four products live: active, 3+ in stock. Swaps the price and image for the live ones.
export async function checkDay(day) {
  const handles = day.products.map(p => p[2])
  const live = await productsByHandles(handles)
  return day.products.map(p => {
    const L = live[p[2]]
    const ok = !!(L && L.status === 'ACTIVE' && L.totalInventory >= 3 && !LIGHT.test(L.title))
    const price = L && L.priceRangeV2 ? '£' + parseFloat(L.priceRangeV2.minVariantPrice.amount).toFixed(2) : p[1]
    return { name: p[0], price: /^from/.test(p[1]) && L ? 'from ' + price : price, handle: p[2], img: L && L.featuredImage ? L.featuredImage.url : imgUrl(p[3]), blurb: p[4], ok, stock: L ? L.totalInventory : null, status: L ? L.status : 'missing' }
  })
}

function cell(pr) {
  const url = STORE + '/products/' + pr.handle
  const src = /^https?:/.test(pr.img) ? (pr.img.includes('?') ? pr.img + '&width=400' : pr.img + '?width=400') : pr.img
  return `<td class="stack" width="50%" valign="top" align="center" style="text-align:center; padding:8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E3E8F4; border-radius:14px;">
    <tr><td align="center" style="text-align:center; padding:14px 14px 0;"><a href="${escA(url)}"><img src="${escA(src)}" width="160" alt="${escA(pr.name)}" style="display:block; margin:0 auto; width:160px; height:auto; border:0;"></a></td></tr>
    <tr><td align="center" style="text-align:center; padding:12px 14px 16px;">${P('font-size:15px; font-weight:700; line-height:1.3; color:#121A33;', '0', escT(pr.name))}${P('font-size:13px; line-height:1.45; color:#4A5578;', '6px 0 0', escT(pr.blurb))}${P('font-size:17px; font-weight:800; color:#121A33;', '10px 0 0', escT(pr.price))}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:10px auto 0;"><tr><td style="background:#1D3E9E; border-radius:999px;"><a href="${escA(url)}" style="display:inline-block; padding:10px 20px; font-size:13px; font-weight:700; color:#FFFFFF; text-decoration:none;">Shop now</a></td></tr></table></td></tr></table></td>`
}

// day: a DAYS entry; products: checked products (4); o: { local, app, offer, offerText }; S: store settings
export function nightly(day, products, o, S) {
  const rows = [0, 2].map(i => `<tr>${cell(products[i])}${products[i + 1] ? cell(products[i + 1]) : '<td></td>'}</tr>`).join('')
  const offer = o.offer ? `<tr><td align="center" style="text-align:center; background:#C2312B; color:#FFFFFF; padding:12px 16px; font-size:14px; font-weight:700;">Tonight only: ${escT(o.offerText)}</td></tr>` : ''
  const body = `${offer}<tr><td align="center" class="pad" style="text-align:center; padding:40px 44px 0;">
  ${P('font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#C2312B;', '0', escT(day.theme))}
  <h1 class="h1" style="text-align:center; margin:12px 0 0; ${DISP} font-size:48px; line-height:1; color:#121A33;">${escT(day.headline)}</h1>
  ${P('font-size:16px; line-height:1.6; color:#3A4466;', '16px 0 22px', escT(day.intro))}
  ${btn(STORE + day.ctaUrl, day.cta, '#C2312B', '#FFFFFF')}
</td></tr>
<tr><td class="pad" style="padding:28px 24px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr>
${audienceBlock(S, o.local, day.key)}
<tr><td class="pad" style="padding:24px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid #E3E8F4; border-radius:16px;"><tr><td align="center" style="text-align:center; padding:24px 24px;">
  ${P('font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#1D3E9E;', '0', 'Tip of the night')}
  ${P(DISP + ' font-size:22px; line-height:1.15; color:#121A33;', '8px 0 0', escT(day.tipT))}
  ${P('font-size:15px; line-height:1.6; color:#3A4466;', '10px 0 0', escT(day.tip))}
  ${P('font-size:14px; font-weight:700;', '12px 0 0', `<a href="${escA(STORE + day.ctaUrl)}" style="color:#1D3E9E; text-decoration:underline;">${escT(day.cta)} &rarr;</a>`)}
</td></tr></table></td></tr>
${o.app ? appStrip(S) : ''}`
  return shell(day.theme, day.preview, S, body, 'shopify')
}

export const SEGMENT_FOR = { local: 'Newsletter: Local West Yorkshire', uk: 'Newsletter: Engaged outside West Yorkshire' }
