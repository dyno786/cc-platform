// Shopify reads for the CRM. Uses the same key as the rest of the platform.
import { gql } from '../intake'

const REST_VER = '2024-01'
export const ORDER_FIELDS = `
  id name createdAt updatedAt cancelledAt test email phone
  displayFulfillmentStatus displayFinancialStatus tags
  totalPriceSet{ shopMoney{ amount } }
  customer{ id }
  shippingAddress{ city zip phone }
  fulfillments{ createdAt trackingInfo{ number url company } }
  refunds{ id }
  lineItems(first:20){ nodes{ title quantity product{ id handle productType vendor } originalUnitPriceSet{ shopMoney{ amount } } } }`

export const CUSTOMER_FIELDS = `
  id firstName lastName email phone tags createdAt numberOfOrders note
  amountSpent{ amount }
  emailMarketingConsent{ marketingState }
  smsMarketingConsent{ marketingState }
  defaultAddress{ city zip phone }`

const money = m => parseFloat((m && m.shopMoney && m.shopMoney.amount) || 0)

export function shapeOrder(o, items) {
  const li = items || ((o.lineItems && o.lineItems.nodes) || [])
  return {
    id: o.id, name: o.name, createdAt: o.createdAt, cancelledAt: o.cancelledAt || null, test: !!o.test,
    email: o.email || '', phone: o.phone || (o.shippingAddress && o.shippingAddress.phone) || '',
    city: (o.shippingAddress && o.shippingAddress.city) || '',
    status: o.displayFulfillmentStatus, pay: o.displayFinancialStatus, tags: o.tags || [],
    total: money(o.totalPriceSet), customerId: o.customer ? o.customer.id : null,
    fulfilledAt: (o.fulfillments || []).map(f => f.createdAt).sort()[0] || null,
    tracking: ((o.fulfillments || []).flatMap(f => f.trackingInfo || [])[0]) || null,
    refunded: (o.refunds || []).length > 0,
    items: li.map(i => ({
      title: i.title, qty: i.quantity || 1,
      handle: i.product ? i.product.handle : '', type: i.product ? (i.product.productType || '') : '', vendor: i.product ? (i.product.vendor || '') : '',
      price: money(i.originalUnitPriceSet),
    })),
  }
}

export function shapeCustomer(c) {
  return {
    id: c.id, firstName: c.firstName || '', lastName: c.lastName || '',
    name: ((c.firstName || '') + ' ' + (c.lastName || '')).trim() || (c.email || 'Customer'),
    email: c.email || '', phone: c.phone || (c.defaultAddress && c.defaultAddress.phone) || '',
    city: (c.defaultAddress && c.defaultAddress.city) || '',
    tags: (c.tags || []).map(t => t.toLowerCase()), createdAt: c.createdAt, note: c.note || '',
    ordersCount: parseInt(c.numberOfOrders || 0), spent: parseFloat((c.amountSpent && c.amountSpent.amount) || 0),
    emailSub: !!(c.emailMarketingConsent && c.emailMarketingConsent.marketingState === 'SUBSCRIBED'),
    smsSub: !!(c.smsMarketingConsent && c.smsMarketingConsent.marketingState === 'SUBSCRIBED'),
  }
}

// Orders page by page (used for the hourly top-up). query = Shopify search syntax.
export async function fetchOrders(query, max) {
  const out = []; let after = null
  while (out.length < (max || 2000)) {
    const d = await gql(`query($q:String!,$a:String){ orders(first:50, query:$q, after:$a, sortKey:UPDATED_AT, reverse:true){ pageInfo{ hasNextPage endCursor } nodes{ ${ORDER_FIELDS} } } }`, { q: query, a: after })
    const page = d.orders
    page.nodes.forEach(o => out.push(shapeOrder(o)))
    if (!page.pageInfo.hasNextPage) break
    after = page.pageInfo.endCursor
  }
  return out
}

export async function fetchCustomersByIds(ids) {
  const out = {}
  for (let i = 0; i < ids.length; i += 50) {
    const d = await gql(`query($ids:[ID!]!){ nodes(ids:$ids){ ... on Customer { ${CUSTOMER_FIELDS} } } }`, { ids: ids.slice(i, i + 50) })
    d.nodes.filter(Boolean).forEach(c => { out[c.id] = shapeCustomer(c) })
  }
  return out
}

export async function fetchCustomers(query, max) {
  const out = []; let after = null
  while (out.length < (max || 500)) {
    const d = await gql(`query($q:String!,$a:String){ customers(first:100, query:$q, after:$a, sortKey:CREATED_AT, reverse:true){ pageInfo{ hasNextPage endCursor } nodes{ ${CUSTOMER_FIELDS} } } }`, { q: query, a: after })
    d.customers.nodes.forEach(c => out.push(shapeCustomer(c)))
    if (!d.customers.pageInfo.hasNextPage) break
    after = d.customers.pageInfo.endCursor
  }
  return out
}

export async function fetchCustomer(id) {
  const d = await gql(`query($id:ID!){ customer(id:$id){ ${CUSTOMER_FIELDS} orders(first:50, sortKey:CREATED_AT, reverse:true){ nodes{ ${ORDER_FIELDS} } } } }`, { id })
  if (!d.customer) return null
  const c = shapeCustomer(d.customer)
  c.orders = d.customer.orders.nodes.map(o => shapeOrder(o))
  return c
}

export async function fetchCheckouts(days) {
  const store = process.env.SHOPIFY_STORE, token = process.env.SHOPIFY_TOKEN
  const since = new Date(Date.now() - (days || 3) * 86400000).toISOString()
  const r = await fetch(`https://${store}/admin/api/${REST_VER}/checkouts.json?created_at_min=${since}&limit=100`, { headers: { 'X-Shopify-Access-Token': token } })
  const j = await r.json()
  return (j.checkouts || []).filter(c => parseFloat(c.total_price || 0) > 0 && !c.completed_at).map(c => ({
    id: String(c.id), createdAt: c.created_at, email: c.email || '', total: parseFloat(c.total_price || 0),
    customerId: c.customer ? 'gid://shopify/Customer/' + c.customer.id : null,
    name: c.customer ? ((c.customer.first_name || '') + ' ' + (c.customer.last_name || '')).trim() : (c.email || 'Unknown'),
    phone: (c.customer && c.customer.phone) || (c.shipping_address && c.shipping_address.phone) || (c.billing_address && c.billing_address.phone) || '',
    items: (c.line_items || []).map(i => ({ title: i.title, qty: i.quantity, price: parseFloat(i.price || 0) })),
    url: c.abandoned_checkout_url || '',
  }))
}

// ---------- full history through a bulk operation (one file, no page limits) ----------
export async function startBulkOrders(sinceISO) {
  const BULK_FIELDS = ORDER_FIELDS.split('lineItems(')[0] + `lineItems{ edges{ node{ title quantity product{ id handle productType vendor } originalUnitPriceSet{ shopMoney{ amount } } } } }`
  const q = `{ orders(query:"created_at:>=${sinceISO.slice(0, 10)}") { edges { node { ${BULK_FIELDS} } } } }`
  const d = await gql('mutation($q:String!){ bulkOperationRunQuery(query:$q){ bulkOperation{ id status } userErrors{ field message } } }', { q })
  const r = d.bulkOperationRunQuery
  if (r.userErrors && r.userErrors.length) throw new Error('Shopify bulk export: ' + r.userErrors.map(e => e.message).join('; '))
  return r.bulkOperation
}

export async function currentBulk() {
  const d = await gql('query{ currentBulkOperation(type:QUERY){ id status url errorCode objectCount createdAt completedAt } }')
  return d.currentBulkOperation
}

export async function downloadBulkOrders(url) {
  const r = await fetch(url); if (!r.ok) throw new Error('bulk download failed ' + r.status)
  const text = await r.text()
  const orders = {}; const items = {}
  for (const line of text.split('\n')) {
    if (!line) continue
    const row = JSON.parse(line)
    if (row.__parentId) { (items[row.__parentId] = items[row.__parentId] || []).push(row) }
    else orders[row.id] = row
  }
  return Object.values(orders).map(o => shapeOrder(o, items[o.id] || []))
}

export async function accessScopes() {
  const store = process.env.SHOPIFY_STORE, token = process.env.SHOPIFY_TOKEN
  const r = await fetch(`https://${store}/admin/oauth/access_scopes.json`, { headers: { 'X-Shopify-Access-Token': token } })
  const j = await r.json()
  return (j.access_scopes || []).map(s => s.handle)
}

// Live check for the newsletter: is the product active, in stock, and what does it cost now?
export async function productsByHandles(handles) {
  const out = {}
  for (let i = 0; i < handles.length; i += 10) {
    const chunk = handles.slice(i, i + 10)
    const q = chunk.map((h, k) => `p${k}: productByHandle(handle:"${h}"){ id handle title status totalInventory featuredImage{ url } priceRangeV2{ minVariantPrice{ amount } } }`).join(' ')
    const d = await gql('{ ' + q + ' }')
    chunk.forEach((h, k) => { out[h] = d['p' + k] })
  }
  return out
}
