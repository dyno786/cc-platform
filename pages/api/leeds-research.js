// One-off helper: creates the Leeds salon finder page from lib/leeds.js. Remove once run.
import { gql } from '../../lib/intake'
import { buildLeeds, PAGE, COUNT } from '../../lib/leeds'
export const config = { maxDuration: 60 }
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const n = await gql('query { pages(first: 1, query: "handle:afro-hair-salons-nottingham") { nodes { handle body } } }')
    const src = n.pages.nodes[0].body
    const css = src.slice(0, src.indexOf('</style>') + 8)
    const a = src.indexOf('<section class="cg-s" id="shop">'), shop = src.slice(a, src.indexOf('</section>', a) + 10)
    if (!css.startsWith('<style>') || a < 0) return res.status(200).json({ ok: false, error: 'Nottingham page layout not as expected' })
    const body = buildLeeds(css, shop)
    const f = await gql('query($q: String!) { pages(first: 1, query: $q) { nodes { id handle } } }', { q: 'handle:' + PAGE.handle })
    const old = (f.pages.nodes || []).find(p => p.handle === PAGE.handle)
    if (req.query.go !== '1') return res.status(200).json({ ok: true, saved: false, exists: !!old, length: body.length, listings: COUNT })
    if (old) {
      const u = await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { userErrors { message } } }', { id: old.id, p: { body } })
      if (u.pageUpdate.userErrors.length) throw new Error(u.pageUpdate.userErrors.map(e => e.message).join('; '))
      return res.status(200).json({ ok: true, saved: true, updated: true })
    }
    const c = await gql('mutation($p: PageCreateInput!) { pageCreate(page: $p) { page { id } userErrors { message } } }', { p: { title: PAGE.title, handle: PAGE.handle, body, isPublished: true, metafields: [
      { namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: PAGE.seoTitle },
      { namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: PAGE.seoDescription }] } })
    if (c.pageCreate.userErrors.length) throw new Error(c.pageCreate.userErrors.map(e => e.message).join('; '))
    return res.status(200).json({ ok: true, saved: true, id: c.pageCreate.page.id })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
