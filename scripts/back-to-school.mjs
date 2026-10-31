// Back to school newsletter, both audiences, in the CC newsletter design.
import { shell, appStrip, audienceBlock, P, DISP, btn, escA, escT, STORE } from '../lib/crm/messages.js'

const S = { phone: '0113 249 5562', freeDelivery: '75', rating: '', count: '', ios: 'https://apps.apple.com/gb/app/id1591623552', android: '', appOffer: '' }
const utm = '?utm_source=shopify_email&utm_medium=email&utm_campaign=back_to_school'
const PRODUCTS = [
  ['Cantu Kids Tear-free Nourishing Shampoo 8oz', '£4.99', 'cantu-care-for-kids-tear-free-nourishing-shampoo-8oz', 'https://cdn.shopify.com/s/files/1/0605/2118/5501/files/befa8aabfc0ada6d95c16335dac3ba09_35d7a7a4-1caa-4497-b6f5-06249f349528.webp?v=1724262416', 'Step 1 · Wash. No tears, no stripping', 14],
  ['Cantu Care for Kids Conditioning Detangler 6oz', '£4.99', 'cantu-care-for-kids-conditioning-detangler-6oz-177ml', 'https://cdn.shopify.com/s/files/1/0605/2118/5501/files/245ed4b0847cb79db90d23320b024cac.jpg?v=1724262544', 'Step 2 · Detangle. Combs glide through', 22],
  ['Just For Me Hair Milk Leave-In Detangler 10oz', '£4.49', 'just-for-me-natural-hair-milk-leave-in-detangler-10-oz', 'https://cdn.shopify.com/s/files/1/0605/2118/5501/files/just-for-me-natural-hair-milk-leave-in-detangler-10oz-802535365100.jpg?v=1792178858', 'Step 3 · Moisturise. Light, no build-up', 25],
  ["Africa's Best Kids Organics Olive Oil Styling Gel 426g", '£4.99', 'africa-s-best-kids-organics-olive-oil-smoothing-styling-gel-426g', 'https://cdn.shopify.com/s/files/1/0605/2118/5501/products/smoothstlinggel.jpg?v=1661941061', 'Step 4 · Style. Soft hold, no flakes', 26],
]
const img = u => u + (u.includes('?') ? '&' : '?') + 'width=400' + (/\.webp\?/.test(u) ? '&format=jpg' : '')
function cell(pr) {
  const [name, price, handle, image, blurb] = pr, url = STORE + '/products/' + handle + utm
  return `<td class="stack" width="50%" valign="top" align="center" style="text-align:center; padding:8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E3E8F4; border-radius:14px;">
    <tr><td align="center" style="text-align:center; padding:14px 14px 0;"><a href="${escA(url)}"><img src="${escA(img(image))}" width="160" alt="${escA(name)}" style="display:block; margin:0 auto; width:160px; height:auto; border:0;"></a></td></tr>
    <tr><td align="center" style="text-align:center; padding:12px 14px 16px;">${P('font-size:15px; font-weight:700; line-height:1.3; color:#121A33;', '0', escT(name))}${P('font-size:13px; line-height:1.45; color:#4A5578;', '6px 0 0', escT(blurb))}${P('font-size:17px; font-weight:800; color:#121A33;', '10px 0 0', escT(price))}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:10px auto 0;"><tr><td style="background:#1D3E9E; border-radius:999px;"><a href="${escA(url)}" style="display:inline-block; padding:10px 20px; font-size:13px; font-weight:700; color:#FFFFFF; text-decoration:none;">Shop now</a></td></tr></table></td></tr></table></td>`
}
const tiles = items => `<tr><td class="pad" style="padding:26px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items.map(([label, href]) => `<tr><td style="padding:4px 0;"><a href="${escA(STORE + href + utm)}" style="display:block; background:#EEF2FB; border-radius:12px; padding:13px 16px; color:#1D3E9E; font-weight:700; font-size:15px; text-decoration:none;">${escT(label)} &rarr;</a></td></tr>`).join('')}</table></td></tr>`

function build(local) {
  const rows = [0, 2].map(i => `<tr>${cell(PRODUCTS[i])}${cell(PRODUCTS[i + 1])}</tr>`).join('')
  const body = `<tr><td align="center" class="pad" style="text-align:center; padding:40px 44px 0;">
  ${P('font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#C2312B;', '0', 'Back to school Monday')}
  <h1 class="h1" style="text-align:center; margin:12px 0 0; ${DISP} font-size:48px; line-height:1; color:#121A33;">School hair, sorted this weekend</h1>
  ${P('font-size:16px; line-height:1.6; color:#3A4466;', '16px 0 22px', 'Half term is over on Monday. Wash, detangle and style this weekend and the week looks after itself. Four steps, four products, all made for curly, coily and afro hair, all under &pound;5.')}
  ${btn(STORE + '/pages/back-to-school' + utm, 'Shop the kids range', '#C2312B', '#FFFFFF')}
</td></tr>
<tr><td class="pad" style="padding:28px 24px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr>
<tr><td align="center" class="pad" style="text-align:center; padding:30px 44px 0;">${P(DISP + ' font-size:24px; color:#121A33;', '0', 'Shop by what your child needs')}</td></tr>
${tiles([['Braids, twists and cornrows that last the week', '/collections/braid-care-kids'], ['Beads, bobbles and bands', '/collections/hair-beads'], ['Kids skin care: lotions, jelly and soaps', '/collections/childrens-body-creams-lotions'], ['Kids brands: Cantu Kids, Just For Me, Curly Kids, Africa\'s Best', '/pages/back-to-school']])}
${audienceBlock(S, local, 'sat')}
<tr><td class="pad" style="padding:24px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid #E3E8F4; border-radius:16px;"><tr><td align="center" style="text-align:center; padding:24px 24px;">
  ${P('font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#1D3E9E;', '0', 'Three tips for school mornings')}
  ${P(DISP + ' font-size:22px; line-height:1.15; color:#121A33;', '8px 0 0', 'Do the hard bit on Sunday')}
  ${P('font-size:15px; line-height:1.6; color:#3A4466;', '10px 0 0', '1. Wash, condition and detangle at the weekend, so mornings are a quick refresh with leave-in and a brush.<br>2. Pick braids, twists or cornrows that stay neat all week, and keep them loose at the hairline.<br>3. Lotion on slightly damp skin after the bath, and a tub of jelly in the school bag for dry lips and knees.')}
  ${P('font-size:14px; font-weight:700;', '12px 0 0', `<a href="${escA(STORE + '/blogs/children-guide/the-safe-guide-to-combining-afro-hair-in-children-tips-and-tricks' + utm)}" style="color:#1D3E9E; text-decoration:underline;">Read the combing guide for parents &rarr;</a>`)}
</td></tr></table></td></tr>
${appStrip(S)}`
  return shell('Back to school', 'Four steps, four products, all under £5. Ready for Monday.', S, body, 'shopify')
}
process.stdout.write(JSON.stringify({
  subjects: ['School hair, sorted this weekend', 'Back to school Monday: the 4-step kids kit', 'Four products, all under £5, ready for Monday'],
  preview: 'Wash, detangle, moisturise, style. Made for curly, coily and afro hair.',
  products: PRODUCTS.map(p => ({ name: p[0], price: p[1], handle: p[2], blurb: p[4], stock: p[5] })),
  local: build(true), uk: build(false),
}))
