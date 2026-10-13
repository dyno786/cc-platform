// One-off helper: makes a 10% code for every salon finder city and puts the sign-up box on each city page.
// ?save=1 to save; without it, a dry run. Remove once run.
import { gql } from '../../lib/intake'
import { CITIES, installOffer } from '../../lib/salon'

const COLLECTIONS = ['gid://shopify/Collection/287126520029', 'gid://shopify/Collection/287248416989', 'gid://shopify/Collection/287248449757', 'gid://shopify/Collection/287251169501', 'gid://shopify/Collection/287261491421']

async function ensureCode(c, save) {
  const f = await gql('query($c: String!) { codeDiscountNodeByCode(code: $c) { id } }', { c: c.code })
  if (f.codeDiscountNodeByCode) return 'exists'
  if (!save) return 'would create'
  const r = await gql('mutation($d: DiscountCodeBasicInput!) { discountCodeBasicCreate(basicCodeDiscount: $d) { codeDiscountNode { id } userErrors { field message } } }', { d: {
    title: 'Salon finder - ' + c.name + ' 10% off hair', code: c.code, startsAt: new Date().toISOString(),
    customerSelection: { all: true }, appliesOncePerCustomer: true,
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: false },
    customerGets: { value: { percentage: 0.1 }, items: { collections: { add: COLLECTIONS } } },
  } })
  const ue = r.discountCodeBasicCreate.userErrors || []
  return ue.length ? 'error: ' + ue.map(e => e.message).join('; ') : 'created'
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const save = req.query.save === '1'
  const out = {}
  for (const city of Object.keys(CITIES)) {
    try {
      const code = await ensureCode(CITIES[city], save)
      const page = code.startsWith('error') ? { ok: false, error: 'code not made' } : await installOffer(city, save)
      out[city] = { code, page }
    } catch (e) { out[city] = { error: String(e.message || e) } }
  }
  res.status(200).json(out)
}
