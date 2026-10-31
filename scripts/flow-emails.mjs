// Builds the Shopify Email automation emails in the CC Newsletter Maker design.
// node scripts/flow-emails.mjs > /tmp/flow-emails.json
import { shell, appStrip, audienceBlock, P, DISP, btn, escA, escT, STORE } from '../lib/crm/messages.js'

const S = { phone: '0113 249 5562', freeDelivery: '75', rating: '', count: '', ios: 'https://apps.apple.com/gb/app/id1591623552', android: '', appOffer: '' }
const utm = c => `?utm_source=shopify_email&utm_medium=email&utm_campaign=${c}`
const FIRST = "{{ customer.first_name | default: 'there' }}"
const hero = (eyebrow, h1, paras, cta, href) => `<tr><td align="center" class="pad" style="text-align:center; padding:40px 44px 0;">
  ${P('font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#C2312B;', '0', escT(eyebrow))}
  <h1 class="h1" style="text-align:center; margin:12px 0 0; ${DISP} font-size:44px; line-height:1; color:#121A33;">${h1}</h1>
  ${paras.map((p, i) => P('font-size:16px; line-height:1.6; color:#3A4466;', (i ? '12px' : '16px') + ' 0 0', p)).join('')}
  ${cta ? '<div style="height:22px"></div>' + btn(href, cta, '#C2312B', '#FFFFFF') : ''}</td></tr>`
const tiles = (items, c) => `<tr><td class="pad" style="padding:26px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items.map(([label, href]) => `<tr><td style="padding:4px 0;"><a href="${escA(STORE + href + utm(c))}" style="display:block; background:#EEF2FB; border-radius:12px; padding:14px 16px; color:#1D3E9E; font-weight:700; font-size:15px; text-decoration:none;">${escT(label)} &rarr;</a></td></tr>`).join('')}</table></td></tr>`
const panel = (title, lines) => `<tr><td class="pad" style="padding:26px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid #E3E8F4; border-radius:16px;"><tr><td align="center" style="text-align:center; padding:22px 22px;">
  ${P(DISP + ' font-size:22px; line-height:1.15; color:#121A33;', '0', escT(title))}${lines.map(l => P('font-size:15px; line-height:1.6; color:#3A4466;', '10px 0 0', l)).join('')}</td></tr></table></td></tr>`
const stores = `<tr><td class="pad" style="padding:26px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF2FB; border-radius:16px;"><tr><td align="center" style="text-align:center; padding:22px;">
  ${P(DISP + ' font-size:22px; color:#121A33;', '0', 'Three stores in Leeds')}
  ${P('font-size:14px; line-height:1.7; color:#121A33; font-weight:600;', '8px 0 0', 'Chapeltown Road, LS7 3DU &middot; Roundhay Road, LS8 5RL &middot; 1 New York Street, LS2 7DT')}
  ${P('font-size:13px; line-height:1.6; color:#4A5578;', '8px 0 0', 'Open until 8pm Monday to Saturday. Click &amp; Collect from any of them.')}</td></tr></table></td></tr>`
const delivery = (c) => audienceBlock(S, false)
const basketBtn = (c, label) => `<tr><td align="center" style="padding:24px 24px 0;">${btn(STORE + '/cart' + utm(c), label || 'Return to your basket', '#C2312B', '#FFFFFF')}</td></tr>`

const E = []
const add = (group, order, name, wait, subject, preview, body, notes) => E.push({ group, order, name, wait, subject, preview, html: shell(subject, preview, S, body, 'shopify'), notes: notes || '' })

/* ---------- Welcome series (4) ---------- */
add('welcome', 1, 'Welcome 1', 'Straight away', 'Welcome to the CC family', 'Family-run in Leeds since 1979. Here\'s where to start.',
  hero('Welcome', `Hi ${FIRST}, welcome to CC`, [
    'Thanks for joining us. We&rsquo;ve looked after Leeds hair and beauty since 1979: three stores, thousands of genuine products from the official UK distributors, and advice from people who actually use them.',
    'You&rsquo;ll be first to hear about new arrivals, restocks of your favourites, and member offers.'], 'Start shopping', STORE + '/collections/new-items-in-stock' + utm('welcome1'))
  + tiles([['Braiding & crochet hair', '/pages/braids-range'], ['Hair colour', '/search?q=hair+colour'], ['Shampoo, conditioner & leave-ins', '/collections/shampoo'], ['Wigs & bundles', '/pages/wigs-lace-wigs'], ['Edge control & styling', '/collections/edge-control'], ['Makeup', '/pages/makeup']], 'welcome1')
  + stores + appStrip(S),
  'If you create a WELCOME10 code, add one line under the heading: "Your 10% welcome code: WELCOME10, valid for 7 days." Don\'t mention a code that doesn\'t exist yet.')

add('welcome', 2, 'Welcome 2', '1 day later', 'What Leeds buys most', 'Our best sellers, by what you\'re shopping for.',
  hero('Best sellers', 'What Leeds buys most', [
    `Hi ${FIRST}, here are the ranges our customers come back for. Shop by what you need, and if you&rsquo;re not sure which product suits your hair, reply to this email and we&rsquo;ll help.`], 'Shop best sellers', STORE + '/collections/best-sellers-live' + utm('welcome2'))
  + tiles([['French curl & knotless braids: Cherish, Aftress, X-Pression', '/pages/braids-range'], ['Colour: L\'Oréal HiColor, Wella toners, Schwarzkopf Live', '/search?q=hair+colour'], ['Wash day: Color Wow, Cantu, Shea Moisture', '/collections/shampoo'], ['Edges: Red By Kiss, Got2b, Eco Style', '/collections/edge-control'], ['Body care: Nivea, Palmer\'s, cocoa butter', '/collections/lotions']], 'welcome2')
  + delivery('welcome2') + appStrip(S))

add('welcome', 3, 'Welcome 3', '3 days later', 'A little advice from the shop floor', 'Three tips our customers ask about most.',
  hero('From the shop floor', 'Three things we get asked every day', [
    `Hi ${FIRST}, forty-five years behind the counter teaches you a lot. Here are the questions we answer most.`])
  + panel('How many packs of braiding hair?', ['Knotless or box braids usually take 6 to 8 packs of pre-stretched hair, more for longer or thicker styles. Buy an extra pack: you can always use it next time.'])
  + panel('Going lighter on dark hair?', ['L&rsquo;Or&eacute;al HiColor lifts and tints dark hair in one step. Follow with a Wella ColorCharm toner to cancel brassy tones, and a colour-safe shampoo to keep it.'])
  + panel('Edges that last all day', ['Apply edge control to clean, dry edges, brush into shape, then tie down with a satin scarf for ten minutes. A satin bonnet at night keeps them laid.'])
  + `<tr><td align="center" style="padding:24px 24px 0;">${btn(STORE + '/blogs/news' + utm('welcome3'), 'More guides', '#1D3E9E', '#FFFFFF')}</td></tr>` + appStrip(S),
  'Swap the three panels for whatever you get asked most. Keep it to advice, no selling.')

add('welcome', 4, 'Welcome 4', '6 days later · only if no order yet', 'Ready when you are', 'Free delivery over £75, or collect in Leeds today.',
  hero('Ready when you are', 'Still deciding?', [
    `Hi ${FIRST}, no rush. When you&rsquo;re ready, every order is packed in Leeds and posted across the UK, with free delivery over &pound;${S.freeDelivery}. Or order online and collect from any of our three stores the same day.`,
    'If there&rsquo;s something you can&rsquo;t find, reply to this email. We stock over 9,000 lines and can usually get it.'], 'Shop now', STORE + utm('welcome4'))
  + stores + appStrip(S),
  'In the workflow, add a condition before this email: "Customer has placed order = No". If you run a welcome code, this is the email that says it expires tomorrow.')

/* ---------- Abandoned checkout (2) ---------- */
add('checkout', 1, 'Checkout 1', '1 hour', 'You left something behind', 'Your basket is saved. Finish in one tap.',
  hero('Your basket is saved', `${FIRST}, you left something behind`, [
    'You started checking out at CC Hair &amp; Beauty but didn&rsquo;t quite finish. Everything is still saved, so it only takes a minute.',
    'If your card didn&rsquo;t go through or something looked wrong, reply to this email or call us and we&rsquo;ll sort it.'])
  + basketBtn('checkout1', 'Finish my order') + delivery('checkout1'),
  'In the Shopify editor you can add the "Abandoned checkout" product block above the button so the customer sees their actual items. Code-your-own emails can\'t pull the items in automatically.')

add('checkout', 2, 'Checkout 2', '24 hours · only if still no order', 'Still thinking it over?', 'Popular lines sell out. Your basket is still here.',
  hero('Still here', 'Still thinking it over?', [
    `Hi ${FIRST}, your basket is still saved. Our most popular hair and colour lines do sell out, so we can&rsquo;t hold stock for long.`,
    'Not sure it&rsquo;s the right shade, length or size? Call us on ' + S.phone + ' or reply here. We&rsquo;ve done this since 1979.'])
  + basketBtn('checkout2', 'Return to my basket') + stores,
  'No discount here. If you ever add one, only for baskets over £40 and only in this second email.')

/* ---------- Abandoned cart (2) ---------- */
add('cart', 1, 'Cart 1', '2 hours', 'Your basket at CC Hair & Beauty', 'Everything you picked is still here.',
  hero('Great picks', 'Everything you picked is still here', [
    `Hi ${FIRST}, you added some good things to your basket. Finish your order whenever you&rsquo;re ready, or choose Click &amp; Collect and pick it up from one of our Leeds stores.`])
  + basketBtn('cart1', 'View my basket') + delivery('cart1'))

add('cart', 2, 'Cart 2', '24 hours · only if still no order', 'Goes well with what\'s in your basket', 'A few extras customers add, and free delivery over £75.',
  hero('Customers also add', 'Goes well with your basket', [
    `Hi ${FIRST}, your basket is still saved. These are the extras our customers add most, and one of them might get you to free delivery at &pound;${S.freeDelivery}.`])
  + tiles([['Edge control & braid spray, for any braid or wig install', '/collections/edge-control'], ['Colour-safe shampoo & toner, for any hair colour', '/collections/shampoo'], ['Satin bonnets & scarves, for everything', '/search?q=bonnet']], 'cart2')
  + basketBtn('cart2', 'Complete my order'))

/* ---------- Browse abandonment (1) ---------- */
add('browse', 1, 'Browse 1', '4 hours', 'Still looking?', 'The products Leeds is buying right now.',
  hero('Still looking?', 'Found what you need?', [
    `Hi ${FIRST}, we noticed you were browsing. If you&rsquo;re comparing products or not sure what suits your hair, reply to this email and tell us what you&rsquo;re after. Otherwise, here&rsquo;s what&rsquo;s selling best this week.`], 'Shop best sellers', STORE + '/collections/best-sellers-live' + utm('browse1'))
  + tiles([['New in this week', '/collections/new-items-in-stock'], ['Best sellers', '/collections/best-sellers-live'], ['Brands A to Z', '/pages/brands']], 'browse1') + appStrip(S),
  'Shopify\'s editor can add the "Browsed product" block so the exact product shows. In code-your-own it can\'t, so this version points to best sellers.')

/* ---------- After first purchase (1) ---------- */
add('thanks', 1, 'Thank you', '2 days after first order', 'Thank you from the CC family', 'Here\'s what goes well with your order.',
  hero('Thank you', `Thanks for your first order, ${FIRST}`, [
    'Your order is on its way from Leeds. We hope you love it. If anything isn&rsquo;t right when it arrives, reply to this email and we&rsquo;ll put it right.',
    'To get the most out of what you bought, these are what customers usually pair with it:'])
  + tiles([['Bought braids or a wig? Edge control, mousse and a satin bonnet', '/collections/edge-control'], ['Bought colour? Colour-safe shampoo and conditioner', '/collections/shampoo'], ['Bought shampoo? The matching conditioner and a leave-in', '/collections/shampoo'], ['Bought makeup? Setting spray and powder', '/pages/makeup']], 'thanks')
  + appStrip(S),
  'Shopify\'s "Thank customers after first purchase" automation. The CRM also sends the review request later, so this email should not ask for a review.')

/* ---------- Win-back (2) ---------- */
add('winback', 1, 'Win-back 60', '60 days since last order', 'It\'s been a little while', 'See what\'s new at CC since your last order.',
  hero('60 days', `${FIRST}, it&rsquo;s been a little while`, [
    'Plenty has landed since your last order: new braiding shades, new colour lines and restocks of the favourites. Have a look when you have a minute.'], "See what's new", STORE + '/collections/new-items-in-stock' + utm('winback60'))
  + tiles([['New in this week', '/collections/new-items-in-stock'], ['Best sellers', '/collections/best-sellers-live']], 'winback60') + delivery('winback60') + appStrip(S),
  'Shopify\'s "Win back customers" automation, set to 60 days. Condition: has not placed an order since.')

add('winback', 2, 'Win-back 90', '90 days since last order', 'We miss you at CC', 'New arrivals from the brands you buy, and a little something.',
  hero('90 days', `We miss you, ${FIRST}`, [
    'It&rsquo;s been three months. We&rsquo;d love to see you back, so here&rsquo;s what&rsquo;s new from the brands our customers buy most, with free delivery over &pound;' + S.freeDelivery + '.',
    'And if you stopped shopping with us because something went wrong, reply and tell us. We read every one.'], 'Come back and see', STORE + '/collections/new-items-in-stock' + utm('winback90'))
  + stores + appStrip(S),
  'A second "Win back customers" automation at 90 days. If you want an incentive anywhere, this is the place, and only for customers who have spent over £50 with you.')

process.stdout.write(JSON.stringify(E))
