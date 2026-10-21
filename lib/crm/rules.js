// Product categories, reorder windows, cross-sell rules and the 12 flows.
// Categories are worked out from the Shopify product type (and title as a fallback).

export const CATEGORIES = [
  { key: 'edge',      name: 'Edge control & gel',       re: /edge|gel|pomade|wax stick|hair dress|sheen|hair spray/i, reorder: [25, 35] },
  { key: 'shampoo',   name: 'Shampoo',                  re: /shampoo/i, reorder: [30, 45] },
  { key: 'conditioner', name: 'Conditioner & leave-in', re: /conditioner|leave.?in|curl cream|hair butter|mousse|foam/i, reorder: [30, 45] },
  { key: 'treatment', name: 'Oils, masks & treatments', re: /oil|serum|mask|treatment|scalp|hair loss|hair food|grease/i, reorder: [45, 60] },
  { key: 'wigglue',   name: 'Wig glue & melting spray', re: /glue|adhesive|melt|lace tint|got2b|wig cap|wig band/i, reorder: [25, 40] },
  { key: 'dye',       name: 'Hair colour',              re: /colou?r|dye|developer|bleach|toner|hicolor|relaxer/i, reorder: [42, 56] },
  { key: 'skin',      name: 'Skin & body care',         re: /lotion|body|cream|soap|cleanser|face|skin|moisturi|butter|cocoa|shea/i, reorder: [30, 60] },
  { key: 'braid',     name: 'Braiding & crochet hair',  re: /braid|crochet|x-?pression|bulk|french curl|kinky|twist|locs?\b/i, reorder: [42, 70] },
  { key: 'wig',       name: 'Wigs & bundles',           re: /wig|weave|bundle|closure|frontal|extension|human hair|ponytail|clip.?in/i, reorder: [60, 120] },
  { key: 'makeup',    name: 'Makeup & nails',           re: /makeup|concealer|foundation|lip|eye|brow|lash|nail|powder|setting|mascara|liner/i, reorder: [45, 75] },
  { key: 'kids',      name: 'Kids range',               re: /kid|child|baby/i, reorder: [30, 45] },
  { key: 'mens',      name: "Men's grooming",           re: /beard|shav|razor|clipper|bump/i, reorder: [30, 45] },
  { key: 'tools',     name: 'Tools & accessories',      re: /comb|brush|bonnet|scarf|durag|cap|clip|roller|dryer|straightener|iron|mirror/i, reorder: null },
]

export function categorise(item) {
  const hay = (item.type || '') + ' | ' + (item.title || '')
  // product type first (exact-ish), then title
  for (const c of CATEGORIES) if (c.re.test(item.type || '')) return c
  for (const c of CATEGORIES) if (c.re.test(item.title || '')) return c
  return { key: 'other', name: 'Other', reorder: null }
}
export const catByKey = k => CATEGORIES.find(c => c.key === k) || { key: k, name: k, reorder: null }

// "Complete your routine": what to suggest after a purchase in each category
export const CROSS_SELL = {
  wig:       { title: 'Wig care kit',       items: ['Wig cap', 'Lace glue or melting spray', 'Wig mousse', 'Edge control', 'Wide-tooth brush'] },
  braid:     { title: 'Braid maintenance',  items: ['Edge control', 'Braid mousse', 'Braid spray / scalp oil', 'Satin bonnet'] },
  shampoo:   { title: 'Finish wash day',    items: ['Matching conditioner', 'Deep conditioning mask', 'Leave-in conditioner'] },
  conditioner: { title: 'Complete the set', items: ['Matching shampoo', 'Hair oil or serum', 'Satin bonnet'] },
  dye:       { title: 'Colour care',        items: ['Developer', 'Colour-safe shampoo', 'Colour-safe conditioner', 'Toner'] },
  edge:      { title: 'Hold it all day',    items: ['Edge brush', 'Edge laying scarf', 'Holding spray'] },
  skin:      { title: 'Skin routine',       items: ['Body wash', 'Face cleanser', 'Matching body lotion'] },
  makeup:    { title: 'Finish the look',    items: ['Setting spray', 'Setting powder', 'Lip liner', 'Lashes'] },
  kids:      { title: 'Kids hair care',     items: ['Detangler', 'Kids leave-in', 'Satin bonnet'] },
  treatment: { title: 'Treatment routine',  items: ['Shampoo', 'Conditioner', 'Scalp massager'] },
  mens:      { title: 'Grooming kit',       items: ['Beard oil', 'Bump stopper', 'Wave brush'] },
  wigglue:   { title: 'Install essentials', items: ['Wig cap', 'Melting spray', 'Wig mousse', 'Edge control'] },
}

// Brand families for new-arrival targeting
export function brandOf(item) {
  const v = (item.vendor || '').trim()
  if (v && !/^(cc|general|default|other)$/i.test(v)) return v
  const m = (item.title || '').match(/^([A-Z][\w'&.-]+(?:\s+[A-Z][\w'&.-]+)?)/)
  return m ? m[1] : ''
}

// The 12 flows. owner: 'shopify' = Shopify Email automation / notification handles it; 'crm' = this app queues it.
export const FLOWS = [
  { key: 'welcome',  n: 1,  name: 'Welcome series',             owner: 'shopify', channels: ['email'],
    trigger: 'Signs up to email marketing, no order yet', steps: ['Now: welcome + first-order code', '+1 day: best sellers', '+3 days: hair-care guide', '+5–7 days: shop-now nudge'], exit: 'First purchase',
    shopify: 'Marketing → Automations → Welcome new subscribers' },
  { key: 'browse',   n: 2,  name: 'Browse abandonment',         owner: 'shopify', channels: ['email'],
    trigger: 'Known customer views a product and leaves', steps: ['+4h: the product viewed + 3 similar'], exit: 'Adds to cart or buys',
    shopify: 'Marketing → Automations → Recover abandoned product browse' },
  { key: 'cart',     n: 3,  name: 'Abandoned cart',             owner: 'shopify', channels: ['email', 'whatsapp'],
    trigger: 'Adds to cart, never reaches checkout', steps: ['+1h email', '+6–8h email with items', 'Next day WhatsApp (CRM queue)', '+48h final'], exit: 'Order placed',
    shopify: 'Marketing → Automations → Recover abandoned cart' },
  { key: 'checkout', n: 4,  name: 'Abandoned checkout',         owner: 'shopify', channels: ['email', 'whatsapp'],
    trigger: 'Starts checkout, no payment', steps: ['+30–60m email', '+4h email', 'WhatsApp for payment failures (CRM queue)', '+24h final'], exit: 'Order completed',
    shopify: 'Marketing → Automations → Recover abandoned checkout' },
  { key: 'confirm',  n: 5,  name: 'Order confirmation WhatsApp', owner: 'crm', channels: ['whatsapp'],
    trigger: 'Order paid', steps: ['Same day: name, order number, value, status link, "we\'ll message again at dispatch"'], exit: 'One-off' },
  { key: 'shipped',  n: 6,  name: 'Shipping confirmation',      owner: 'crm', channels: ['whatsapp'],
    trigger: 'Order fulfilled with tracking', steps: ['Same day: courier, tracking number, track link'], exit: 'One-off', note: 'Shopify already emails this; the WhatsApp copy is the extra.' },
  { key: 'delivered', n: 7, name: 'Delivered check-in',         owner: 'crm', channels: ['whatsapp', 'email'],
    trigger: 'About 3 days after dispatch', steps: ['"Has it arrived? Anything wrong?" with support link', 'Then 48h quiet: no marketing'], exit: 'One-off' },
  { key: 'review',   n: 8,  name: 'Review request',             owner: 'crm', channels: ['whatsapp', 'email'],
    trigger: 'Dispatched 6+ days ago, no refund, no cancellation, no open issue', steps: ['"How did we do?" with Google review link', '+7 days: one polite reminder, then stop'], exit: 'Review or reminder sent' },
  { key: 'crosssell', n: 9, name: 'Complete your routine',      owner: 'crm', channels: ['email', 'whatsapp'],
    trigger: 'Dispatched 10 days ago', steps: ['Suggestions matched to what they bought'], exit: 'Next purchase' },
  { key: 'reorder',  n: 10, name: 'Reorder reminder',           owner: 'crm', channels: ['email', 'whatsapp'],
    trigger: 'A product reaches its usual run-out window', steps: ['Email "Running low?" with Buy Again', '+3 days WhatsApp if opted in', '+7 days final'], exit: 'Repurchase of the same category' },
  { key: 'newproduct', n: 11, name: 'New-product recommendation', owner: 'crm', channels: ['email'],
    trigger: 'New product goes live', steps: ['Match the brand to previous buyers (strongest message)', 'Browsers of the brand get a softer version'], exit: 'One-off per product', note: 'Built as a campaign from the Suggestions tab, sent through Shopify Email.' },
  { key: 'winback',  n: 12, name: '60 / 90 / 180-day win-back', owner: 'crm', channels: ['email', 'whatsapp'],
    trigger: 'No order for 60 days', steps: ['60d: "It\'s been a little while", relevant products', '90d: new arrivals from their brands, small incentive for the right segment', '180d: what\'s changed, app, stores, delivery', 'Still quiet: reduce frequency'], exit: 'Any purchase' },
]

export const DEFAULT_SETTINGS = {
  flows: Object.fromEntries(FLOWS.map(f => [f.key, true])),
  quietStart: 9, quietEnd: 20,           // only send between these hours (UK time)
  weeklyCap: 2,                           // marketing messages per customer per 7 days (transactional not counted)
  postDeliveryQuietHours: 48,
  whatsappConsent: 'sms',                 // 'sms' = needs SMS marketing consent for marketing WhatsApp; 'any' = any phone number (transactional only is always allowed)
  reorderDays: Object.fromEntries(CATEGORIES.filter(c => c.reorder).map(c => [c.key, c.reorder[0]])),
  lookbackDays: 200,
  store: { phone: '0113 249 5562', freeDelivery: '75', rating: '', count: '', ios: 'https://apps.apple.com/gb/app/id1591623552', android: '', appOffer: '', reviewUrl: 'https://g.page/r/cchairandbeauty/review', supportEmail: 'cchnboders@gmail.com' },
}
