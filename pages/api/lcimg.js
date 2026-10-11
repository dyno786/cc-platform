// One-off helper: points the six carnival tiles on the Leeds Carnival page at the new collection images. Remove once run.
import { gql } from '../../lib/intake'
const F = 'https://cdn.shopify.com/s/files/1/0605/2118/5501/'
const SWAP = {
  'leeds-carnival': 'collections/leeds-carnival-collection.png?v=1791728705',
  'carnival-xpression-braiding-hair': 'collections/carnival-xpression-braiding-hair-collection.png?v=1791728797',
  'carnival-bright-hair-colour': 'collections/carnival-bright-hair-colour-collection.png?v=1791728819',
  'carnival-makeup': 'collections/carnival-makeup-collection.png?v=1791729012',
  'carnival-hair-accessories': 'collections/carnival-hair-accessories-collection.png?v=1791729036',
  'carnival-head-scarves-wraps': 'collections/carnival-head-scarves-wraps-collection.png?v=1791729068',
}
export default async function handler(req, res) {
  try {
    const id = 'gid://shopify/Page/702396367226'
    const d = await gql('query($id: ID!) { page(id: $id) { body } }', { id })
    let body = d.page.body, n = 0
    for (const h of Object.keys(SWAP)) {
      const re = new RegExp('(<a href="/collections/' + h + '"><span class="lc-i)( lc-c)?("><img src=")[^"]+(")')
      body = body.replace(re, (m, a, c, b, e) => { n++; return a + b + F + SWAP[h] + '&amp;width=500' + e })
    }
    let saved = false
    if (req.query.go === '1' && n === 6) { const r = await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { userErrors { message } } }', { id, p: { body } }); saved = !r.pageUpdate.userErrors.length }
    res.status(200).json({ ok: true, tilesMatched: n, saved })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
