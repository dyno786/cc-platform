// Message copy for every flow: WhatsApp text, email subject, and the branded email HTML
// (same design as the CC Newsletter Maker: blue #1D3E9E, red #C2312B, centred table layout).
import { CROSS_SELL, catByKey } from './rules'

export const STORE = 'https://cchairandbeauty.com'
const CDN = 'https://cdn.shopify.com/s/files/1/0605/2118/5501/'
export const LOGO = CDN + 'files/logo-cchairandbeauty-400-black.png?v=1636964048'
export const LOGO_W = CDN + 'files/logo-cchairandbeauty-400-white.png?v=1636964048'

export const escA = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
export const escT = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/£/g, '&pound;')
export const P = (style, margin, inner) => `<p style="text-align:center; margin:${margin}; ${style}">${inner}</p>`
export const DISP = "font-family:'Archivo','Arial Black',Arial,sans-serif; font-weight:900; text-transform:uppercase;"
export const btn = (href, label, bg, fg) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr><td style="background:${bg || '#C2312B'}; border-radius:999px;"><a href="${escA(href)}" style="display:inline-block; padding:14px 30px; font-size:15px; font-weight:700; color:${fg || '#FFFFFF'}; text-decoration:none;">${escT(label)}</a></td></tr></table>`
export const gbp = n => '£' + Number(n || 0).toFixed(2)
const orderNum = o => o && o.name ? o.name : ''
const orderUrl = (o) => STORE + '/account/orders'

export function appStrip(S) {
  const ios = S.ios || '', and = S.android || ''
  if (!ios && !and) return ''
  const offer = S.appOffer ? P('font-size:15px; font-weight:700; color:#FFD25A;', '8px 0 0', escT(S.appOffer)) : ''
  const b = (href, label) => `<td style="background:#FFFFFF; border-radius:999px;"><a href="${escA(href)}" style="display:inline-block; padding:11px 20px; font-size:13px; font-weight:700; color:#0F2259; text-decoration:none;">${label}</a></td>`
  return `<tr><td class="pad" style="padding:30px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0F2259; border-radius:16px;"><tr><td align="center" style="text-align:center; padding:26px 24px; color:#FFFFFF;">
  ${P(DISP + ' font-size:24px; line-height:1.1; color:#FFFFFF;', '0', 'Shop faster on the CC app')}
  ${P('font-size:14px; line-height:1.55; color:#DCE3F7;', '8px 0 0', 'App-only offers, saved favourites and order tracking, all in one place.')}${offer}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px auto 0;"><tr>${ios ? b(ios, 'App Store') : ''}${ios && and ? '<td width="10"></td>' : ''}${and ? b(and, 'Google Play') : ''}</tr></table>
</td></tr></table></td></tr>`
}

export function audienceBlock(S, local, dayKey) {
  if (local) {
    const hours = dayKey === 'sun' ? 'Open tonight until 7pm at Chapeltown Road (Roundhay Road and City Centre closed Sundays).' : 'All three stores are open tonight until 8pm.'
    return `<tr><td class="pad" style="padding:30px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF2FB; border-radius:16px;"><tr><td align="center" style="text-align:center; padding:24px 22px;">
    ${P(DISP + ' font-size:22px; color:#121A33;', '0', 'Pop in tonight')}${P('font-size:14px; line-height:1.6; color:#3A4466;', '8px 0 0', escT(hours))}
    ${P('font-size:14px; line-height:1.7; color:#121A33; font-weight:600;', '10px 0 0', 'Chapeltown Road, LS7 3DU &middot; Roundhay Road, LS8 5RL &middot; 1 New York Street, LS2 7DT')}
    ${P('font-size:13px; line-height:1.6; color:#4A5578;', '8px 0 0', 'Questions? Call us on ' + escT(S.phone) + '.')}</td></tr></table></td></tr>`
  }
  const free = S.freeDelivery ? ` Free delivery on orders over &pound;${escT(S.freeDelivery)}.` : ''
  return `<tr><td class="pad" style="padding:30px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF2FB; border-radius:16px;"><tr><td align="center" style="text-align:center; padding:24px 22px;">
  ${P(DISP + ' font-size:22px; color:#121A33;', '0', 'Sent from Leeds to your door')}${P('font-size:14px; line-height:1.6; color:#3A4466;', '8px 0 0', 'Every order is packed by our team in Leeds and shipped across the UK.' + free)}</td></tr></table></td></tr>`
}

// mode: 'shopify' (Shopify Email merge tags for unsubscribe/open tracking) or 'direct' (1-to-1 email: no merge tags)
export function shell(title, preheader, S, body, mode) {
  const rl = (S.rating && S.count) ? `&#9733;&#9733;&#9733;&#9733;&#9733; ${escT(S.rating)} on Google from ${escT(S.count)} reviews` : ''
  const unsub = mode === 'shopify' ? '<a href="{{ unsubscribe_url }}" style="color:#FFFFFF; text-decoration:underline;">Unsubscribe</a>' : 'Reply STOP and we will not message you about offers again.'
  return `<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escT(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@800;900&amp;family=DM+Sans:wght@400;600;700&amp;display=swap" rel="stylesheet">
<style>body{margin:0;padding:0;background:#EEF2FB}table{border-collapse:collapse}img{border:0;display:block}a{text-decoration:none}
@media screen and (max-width:620px){.container{width:100%!important}.stack{display:block!important;width:100%!important}.pad{padding-left:18px!important;padding-right:18px!important}.h1{font-size:38px!important}}</style></head>
<body style="margin:0; padding:0; background:#EEF2FB;">
<div style="display:none; max-height:0; overflow:hidden;">${escT(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF2FB;"><tr><td align="center" style="text-align:center;">
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; background:#FFFFFF; font-family:'DM Sans',Arial,Helvetica,sans-serif; color:#121A33;">
<tr><td align="center" style="text-align:center; background:#1D3E9E; color:#FFFFFF; padding:10px 16px; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Family-run in Leeds since 1979 &nbsp;&middot;&nbsp; 100% genuine brands</td></tr>
<tr><td align="center" style="text-align:center; padding:24px 24px 20px; border-bottom:1px solid #E3E8F4;"><a href="${STORE}"><img src="${LOGO}" width="190" alt="CC Hair &amp; Beauty" style="display:block; margin:0 auto; width:190px; height:auto;"></a></td></tr>
${body}
<tr><td align="center" class="pad" style="text-align:center; padding:34px 40px 0;">
  ${P(DISP + ' font-size:20px; color:#121A33;', '0', 'Family-run in Chapeltown since 1979')}
  ${P('font-size:14px; line-height:1.6; color:#4A5578;', '8px 0 0', 'Genuine products from official UK distributors, and honest advice in our Chapeltown Road, Roundhay Road and City Centre stores.')}
  ${rl ? P('font-size:13px; font-weight:700; color:#B07D00;', '10px 0 0', rl) : ''}
</td></tr>
<tr><td style="height:34px; line-height:34px; font-size:0;">&nbsp;</td></tr>
<tr><td align="center" style="text-align:center; background:#1D3E9E; padding:30px 28px 34px; color:#FFFFFF;">
  <a href="${STORE}"><img src="${LOGO_W}" width="160" alt="CC Hair &amp; Beauty" style="display:block; margin:0 auto; width:160px; height:auto;"></a>
  ${P('font-size:13px; font-weight:700;', '16px 0 0', `<a href="${STORE}/pages/hair-care" style="color:#FFFFFF; padding:0 8px;">Hair Care</a><a href="${STORE}/pages/wigs-lace-wigs" style="color:#FFFFFF; padding:0 8px;">Wigs</a><a href="${STORE}/pages/makeup" style="color:#FFFFFF; padding:0 8px;">Makeup</a><a href="${STORE}/pages/about" style="color:#FFFFFF; padding:0 8px;">About us</a>`)}
  ${P('font-size:12px; line-height:1.6; color:#DCE3F7;', '18px 0 0', 'CC Hair &amp; Beauty, Leeds &middot; ' + escT(S.phone) + '<br>You are getting this because you shop with or signed up to CC Hair &amp; Beauty.')}
  ${P('font-size:12px;', '8px 0 0', unsub)}
  ${mode === 'shopify' ? '{{ open_tracking_block }}' : ''}
</td></tr>
</table></td></tr></table></body></html>`
}

const hero = (eyebrow, h1, intro) => `<tr><td align="center" class="pad" style="text-align:center; padding:40px 44px 0;">
  ${P('font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#C2312B;', '0', escT(eyebrow))}
  <h1 class="h1" style="text-align:center; margin:12px 0 0; ${DISP} font-size:44px; line-height:1; color:#121A33;">${escT(h1)}</h1>
  ${P('font-size:16px; line-height:1.6; color:#3A4466;', '16px 0 22px', intro)}</td></tr>`
const ctaRow = (href, label) => `<tr><td align="center" style="padding:0 24px;">${btn(href, label)}</td></tr>`
const itemList = items => `<tr><td class="pad" style="padding:26px 40px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF2FB; border-radius:14px;"><tr><td style="padding:18px 22px;">${items.map(i => `<p style="margin:0 0 6px; font-size:15px; color:#121A33;">&bull; ${escT(i)}</p>`).join('')}</td></tr></table></td></tr>`

// ---------- the copy for each action ----------
export function compose(a, S) {
  const f = a.firstName || 'there'
  const o = a.order || {}
  const num = orderNum(o)
  const sig = '\n\nCC Hair & Beauty, Leeds'
  const stop = '\n\nReply STOP to opt out of offers.'
  let text = '', subject = '', html = '', body = ''
  switch (a.flow) {
    case 'confirm':
      text = `Hi ${f}, thanks for your order with CC Hair & Beauty! 💜\n\nOrder ${num} · ${gbp(o.total)}\nWe've got it and it's being packed in Leeds. We'll message you again when it's on the way.\n\nTrack it anytime: ${STORE}/account/orders${sig}`
      subject = `Your CC order ${num} is confirmed`
      body = hero('Order received', 'Thank you, ' + f, `We've got order <b>${escT(num)}</b> (${escT(gbp(o.total))}) and it's being packed in Leeds. We'll email again when it's on the way.`) + ctaRow(orderUrl(o), 'View your order')
      break
    case 'shipped': {
      const t = o.tracking || {}
      text = `Hi ${f}, your CC Hair & Beauty order ${num} is on its way! 📦${t.company ? '\nCourier: ' + t.company : ''}${t.number ? '\nTracking: ' + t.number : ''}${t.url ? '\nTrack it: ' + t.url : ''}\n\nAnything wrong when it arrives, just reply here.${sig}`
      subject = `Order ${num} is on its way`
      body = hero('On its way', 'Your order has shipped', `Order <b>${escT(num)}</b> left Leeds today${t.company ? ' with ' + escT(t.company) : ''}.${t.number ? ' Tracking number ' + escT(t.number) + '.' : ''}`) + ctaRow(t.url || orderUrl(o), 'Track parcel')
      break }
    case 'delivered':
      text = `Hi ${f}, your CC order ${num} should have arrived by now. We hope everything's right! 🙌\n\nIf anything's missing, damaged or not what you expected, reply here and we'll sort it straight away.${sig}`
      subject = `Did order ${num} arrive safely?`
      body = hero('Quick check', 'Did everything arrive?', `Order <b>${escT(num)}</b> should be with you now. If anything is missing, damaged or not what you expected, reply to this email and we'll put it right.`) + ctaRow('mailto:' + S.supportEmail, 'Something wrong? Tell us')
      break
    case 'review':
      if (a.step === 1) {
        text = `Hi ${f}, how did we do? ⭐\n\nIf you're happy with your CC Hair & Beauty order, a quick Google review helps our family business more than you'd think. It takes 30 seconds:\n${S.reviewUrl}\n\nIf something wasn't right, reply here instead and we'll fix it.${sig}`
        subject = 'How did we do?'
        body = hero('30 seconds', 'How did we do?', 'If you were happy with your order, a quick Google review helps our family business more than you\'d think. If something wasn\'t right, reply to this email instead and we\'ll fix it.') + ctaRow(S.reviewUrl, 'Leave a Google review')
      } else {
        text = `Hi ${f}, just a gentle reminder in case you missed it. If you've got a spare minute, we'd love a Google review: ${S.reviewUrl}\n\nNo worries if not, this is the last time we'll ask.${sig}`
        subject = 'One last ask: a quick review?'
        body = hero('Last time we ask', 'Got a spare minute?', 'A quick Google review would mean a lot to the team in Leeds. This is the last reminder, promise.') + ctaRow(S.reviewUrl, 'Leave a Google review')
      }
      break
    case 'crosssell': {
      const x = CROSS_SELL[a.cat] || { title: 'Complete your routine', items: [] }
      text = `Hi ${f}, hope you're loving your ${catByKey(a.cat).name.toLowerCase()} from CC! 💜\n\nTo get the most out of it, customers usually pair it with:\n${x.items.map(i => '• ' + i).join('\n')}\n\nShop the set: ${STORE}${stop}`
      subject = x.title + ': what goes with your last order'
      body = hero('Complete your routine', x.title, `Hope you're loving your ${escT(catByKey(a.cat).name.toLowerCase())}. These are what customers usually pair it with.`) + itemList(x.items) + `<tr><td style="height:22px"></td></tr>` + ctaRow(STORE, 'Shop the set') + appStrip(S)
      break }
    case 'reorder':
      text = a.step === 3
        ? `Hi ${f}, last nudge from us: running low on your ${a.product}? Reorder in one tap and we'll post it from Leeds today.\n${STORE}/products/${a.handle}${stop}`
        : `Hi ${f}, running low on your ${a.product}? 🧴\n\nIt's been about ${Math.round(a.window / 7)} weeks, so it might be time for a top-up. Buy again in one tap:\n${STORE}/products/${a.handle}\n\nFree UK delivery over £${S.freeDelivery}, or collect in Leeds.${stop}`
      subject = a.step === 3 ? `Last reminder: ${a.product}` : `Running low on your ${a.product}?`
      body = hero('Time for a top-up?', 'Running low?', `It's been about ${Math.round(a.window / 7)} weeks since you bought <b>${escT(a.product)}</b>. Reorder in one tap and we'll post it from Leeds.${S.freeDelivery ? ' Free UK delivery over &pound;' + escT(S.freeDelivery) + '.' : ''}`) + ctaRow(STORE + '/products/' + a.handle, 'Buy again') + appStrip(S)
      break
    case 'winback': {
      const w = a.step
      const line = w === 60 ? "It's been a little while! We've had plenty of new stock in since your last order." : w === 90 ? 'We miss you at CC. New arrivals from the brands you buy are in, and there may be a little something for you if you come back this week.' : "A lot has changed at CC: new brands, a bigger range, UK-wide delivery and our app. We'd love to see you again."
      text = `Hi ${f}, ${line}\n\nSee what's new: ${STORE}/collections/new-items-in-stock${stop}`
      subject = w === 60 ? "It's been a little while" : w === 90 ? 'We miss you, ' + f : "What's new at CC since you last shopped"
      body = hero(w + ' days', w === 180 ? 'A lot has changed' : "It's been a while", escT(line)) + ctaRow(STORE + '/collections/new-items-in-stock', "See what's new") + audienceBlock(S, false) + appStrip(S)
      break }
    case 'checkout': {
      const ck = a.checkout || {}
      const names = (ck.items || []).slice(0, 3).map(i => i.title).join(', ')
      text = `Hi ${f}, you left ${names ? names : 'some items'} in your basket at CC Hair & Beauty (£${(ck.total || 0).toFixed(2)}). It's still saved for you.\n\nFinish your order here: ${ck.url || STORE + '/cart'}\n\nIf your card didn't go through, reply here and we'll help.${stop}`
      subject = 'Your basket is still waiting'
      body = hero('Still saved', 'You left something behind', `${escT(names || 'Your items')} are still in your basket (${escT(gbp(ck.total))}).`) + ctaRow(ck.url || STORE + '/cart', 'Return to your basket')
      break }
    default:
      text = `Hi ${f},${sig}`; subject = 'CC Hair & Beauty'; body = hero('CC', 'Hello', '')
  }
  html = shell(subject, subject, S, body, 'direct')
  return { text, subject, html }
}

export const waLink = (phone, text) => 'https://wa.me/' + String(phone || '').replace(/\D/g, '').replace(/^0/, '44') + '?text=' + encodeURIComponent(text)
export const gmailLink = (to, subject, text) => 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text)
