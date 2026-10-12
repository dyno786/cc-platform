// One-off helper: rebuilds the Afro hairstyles page with the style illustrations uploaded to Shopify Files. Remove once run.
import { gql } from '../../lib/intake'
import { buildPage, PAGE } from '../../lib/hairstyles'
const F = 'https://cdn.shopify.com/s/files/1/0605/2118/5501/files/'
const IMAGES = {
  'knotless-braids': F + 'knotless-braids-cc-hair-and-beauty.png?v=1791796014', 'box-braids': F + 'box-braids-cc-hair-and-beauty.png?v=1791796282',
  'ghana-braids': F + 'ghana-braids-cc-hair-and-beauty.png?v=1791796290', 'fulani-braids': F + 'fulani-braids-cc-hair-and-beauty.png?v=1791796300',
  'boho-braids': F + 'boho-braids-cc-hair-and-beauty.png?v=1791796311', 'french-curl-braids': F + 'french-curl-braids-cc-hair-and-beauty.png?v=1791796321',
  'senegalese-twists': F + 'senegalese-twists-cc-hair-and-beauty.png?v=1791796330', 'passion-twists': F + 'passion-twists-cc-hair-and-beauty.png?v=1791796341',
  'marley-twists': F + 'marley-twists-cc-hair-and-beauty.png?v=1791796351', 'faux-locs': F + 'faux-locs-cc-hair-and-beauty.png?v=1791796361',
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const f = await gql('query($q: String!) { pages(first: 1, query: $q) { nodes { id handle } } }', { q: 'handle:' + PAGE.handle })
    const page = (f.pages.nodes || []).find(p => p.handle === PAGE.handle)
    if (!page) return res.status(200).json({ ok: false, error: 'page missing' })
    const body = buildPage(IMAGES)
    if (req.query.go !== '1') return res.status(200).json({ ok: true, length: body.length })
    const u = await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { userErrors { message } } }', { id: page.id, p: { body } })
    res.status(200).json({ ok: !u.pageUpdate.userErrors.length, errors: u.pageUpdate.userErrors })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
