// Shared server code for the salon finder pages on cchairandbeauty.com.
// Used by /api/salon-finder (called from the shop's city pages) and the Salon Clicks page.
import { gql } from './intake'

// Cities where the sign-up box and click counting are switched on. Add a city here when its page gets the box.
export const CITIES = {
  nottingham: { name: 'Nottingham', code: 'NOTTINGHAM10' },
}

export const STYLES = {
  braids: 'Braids', twists: 'Twists', crochet: 'Crochet', wig: 'Wig', weave: 'Weave or sew-in',
  locs: 'Locs', natural: 'Natural hair', barber: 'Barber cut', other: 'Not sure yet',
}

const NS = 'cc_salon', KEY = 'clicks'
const unesc = s => String(s || '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
export const monthKey = () => new Date().toISOString().slice(0, 7)

async function loadPage(city) {
  const d = await gql('query($q: String!) { pages(first: 1, query: $q) { nodes { id handle body metafield(namespace: "' + NS + '", key: "' + KEY + '") { value } } } }', { q: 'handle:afro-hair-salons-' + city })
  const p = (d.pages.nodes || [])[0]
  if (!p || p.handle !== 'afro-hair-salons-' + city) return null
  let counts = {}
  try { counts = p.metafield ? JSON.parse(p.metafield.value) || {} : {} } catch (e) { counts = {} }
  return { id: p.id, body: String(p.body || ''), counts }
}

// The salon's name is read from our own page, so nothing a visitor sends is ever stored.
function salonName(body, placeId) {
  const at = body.indexOf('query_place_id=' + placeId + '"')
  if (at < 0) return null
  const b = body.lastIndexOf('<b>', at)
  if (b < 0) return null
  const end = body.indexOf('</b>', b)
  return unesc(body.slice(b + 3, end)).trim().slice(0, 120) || null
}

// Adds one click to a salon's count for this month. Counts are per salon, never per visitor.
export async function countClick(city, placeId, kind) {
  if (!CITIES[city] || !/^[A-Za-z0-9_-]{10,80}$/.test(placeId)) return false
  const page = await loadPage(city)
  if (!page) return false
  const name = salonName(page.body, placeId)
  if (!name) return false
  const m = monthKey()
  const month = page.counts[m] || (page.counts[m] = {})
  const row = month[placeId] || (month[placeId] = { name, maps: 0, phone: 0 })
  row.name = name
  if (kind === 'phone') row.phone = (row.phone || 0) + 1; else row.maps = (row.maps || 0) + 1
  const r = await gql('mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { message } } }', { m: [{ ownerId: page.id, namespace: NS, key: KEY, type: 'json', value: JSON.stringify(page.counts) }] })
  return !(r.metafieldsSet.userErrors || []).length
}

export async function readClicks() {
  const out = []
  for (const city of Object.keys(CITIES)) {
    const page = await loadPage(city)
    if (!page) continue
    for (const m of Object.keys(page.counts)) for (const id of Object.keys(page.counts[m])) {
      const r = page.counts[m][id]
      out.push({ city: CITIES[city].name, month: m, salon: r.name, maps: r.maps || 0, phone: r.phone || 0 })
    }
  }
  return out
}

// Saves the person as a Shopify customer who has agreed to email offers, tagged with the city and hairstyle.
export async function joinList(city, email, style) {
  const tags = ['salon-finder', 'salon-city-' + city, 'salon-style-' + style]
  const consent = { marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN', consentUpdatedAt: new Date().toISOString() }
  const f = await gql('query($q: String!) { customers(first: 1, query: $q) { nodes { id defaultEmailAddress { emailAddress marketingState } } } }', { q: 'email:"' + email + '"' })
  const c = (f.customers.nodes || []).find(x => x.defaultEmailAddress && String(x.defaultEmailAddress.emailAddress).toLowerCase() === email)
  if (c) {
    await gql('mutation($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { message } } }', { id: c.id, tags })
    if (c.defaultEmailAddress.marketingState !== 'SUBSCRIBED') {
      const u = await gql('mutation($input: CustomerEmailMarketingConsentUpdateInput!) { customerEmailMarketingConsentUpdate(input: $input) { userErrors { message } } }', { input: { customerId: c.id, emailMarketingConsent: consent } })
      const ue = u.customerEmailMarketingConsentUpdate.userErrors || []
      if (ue.length) throw new Error(ue.map(e => e.message).join('; '))
    }
    return true
  }
  const n = await gql('mutation($input: CustomerInput!) { customerCreate(input: $input) { customer { id } userErrors { message } } }', { input: { email, tags, emailMarketingConsent: consent } })
  const ne = n.customerCreate.userErrors || []
  if (ne.length) throw new Error(ne.map(e => e.message).join('; '))
  return true
}

// Which Shopify permissions the app's key has, so a missing one is reported in plain words.
export async function scopes() {
  const d = await gql('query { currentAppInstallation { accessScopes { handle } } }')
  return (d.currentAppInstallation.accessScopes || []).map(s => s.handle)
}
