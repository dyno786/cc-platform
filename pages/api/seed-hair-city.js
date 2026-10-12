// One-off helper: keeps the old "Hair City Leeds" page as a hidden draft, then rewrites the live page. Remove once run.
import { gql } from '../../lib/intake'
import { buildHairCity, PAGE } from '../../lib/haircity'
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const d = await gql('query($q: String!) { pages(first: 5, query: $q) { nodes { id handle title body } } }', { q: 'handle:' + PAGE.handle + ' OR handle:hair-city-leeds-old-version' })
    const live = d.pages.nodes.find(p => p.handle === PAGE.handle), backup = d.pages.nodes.find(p => p.handle === 'hair-city-leeds-old-version')
    if (!live) return res.status(200).json({ ok: false, error: 'live page missing' })
    if (req.query.go !== '1') return res.status(200).json({ ok: true, backupExists: !!backup, oldTitle: live.title })
    if (!backup) {
      const c = await gql('mutation($p: PageCreateInput!) { pageCreate(page: $p) { page { id } userErrors { message } } }', { p: { title: live.title + ' (old version, hidden)', handle: 'hair-city-leeds-old-version', body: live.body, isPublished: false } })
      if (c.pageCreate.userErrors.length) throw new Error(c.pageCreate.userErrors[0].message)
    }
    const u = await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { userErrors { message } } }', { id: live.id, p: { title: PAGE.title, body: buildHairCity(), metafields: [
      { namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: PAGE.seoTitle },
      { namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: PAGE.seoDescription }] } })
    res.status(200).json({ ok: !u.pageUpdate.userErrors.length, errors: u.pageUpdate.userErrors })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
