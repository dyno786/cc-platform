// One-off helper: rebuilds the Afro hairstyles page with its style pictures. Remove once run.
import { gql } from '../../lib/intake'
import { buildPage, PAGE, IMAGES } from '../../lib/hairstyles'
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const f = await gql('query($q: String!) { pages(first: 1, query: $q) { nodes { id handle } } }', { q: 'handle:' + PAGE.handle })
    const page = (f.pages.nodes || []).find(p => p.handle === PAGE.handle)
    const u = await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { userErrors { message } } }', { id: page.id, p: { body: buildPage(IMAGES) } })
    res.status(200).json({ ok: !u.pageUpdate.userErrors.length, errors: u.pageUpdate.userErrors })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
