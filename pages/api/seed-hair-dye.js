// One-off helper: creates the Hair Dye Leeds page from lib/hairdye.js. Remove once run.
import { gql } from '../../lib/intake'
import { buildHairDye, PAGE } from '../../lib/hairdye'
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const body = buildHairDye()
    const f = await gql('query($q: String!) { pages(first: 1, query: $q) { nodes { id handle } } }', { q: 'handle:' + PAGE.handle })
    const old = (f.pages.nodes || []).find(p => p.handle === PAGE.handle)
    if (req.query.go !== '1') return res.status(200).json({ ok: true, exists: !!old, length: body.length })
    if (old) {
      const u = await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { userErrors { message } } }', { id: old.id, p: { body } })
      return res.status(200).json({ ok: !u.pageUpdate.userErrors.length, updated: true, errors: u.pageUpdate.userErrors })
    }
    const c = await gql('mutation($p: PageCreateInput!) { pageCreate(page: $p) { page { id } userErrors { message } } }', { p: { title: PAGE.title, handle: PAGE.handle, body, isPublished: true, metafields: [
      { namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: PAGE.seoTitle },
      { namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: PAGE.seoDescription }] } })
    res.status(200).json({ ok: !c.pageCreate.userErrors.length, id: c.pageCreate.page && c.pageCreate.page.id, errors: c.pageCreate.userErrors })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
