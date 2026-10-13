// One-off helper: saves the current Hair Extensions Leeds page as an unpublished backup, then rebuilds it.
// ?save=1 to save; without it, a dry run. Remove once run.
import { gql } from '../../lib/intake'
import { PAGES, buildShopPage } from '../../lib/leedspages'
const H = 'hair-extensions-leeds', BACKUP = 'hair-extensions-leeds-old-version'
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const c = PAGES[H], body = buildShopPage(H)
    const f = await gql('query($q: String!) { pages(first: 5, query: $q) { nodes { id handle title body } } }', { q: 'handle:' + H + '*' })
    const page = f.pages.nodes.find(p => p.handle === H), backup = f.pages.nodes.find(p => p.handle === BACKUP)
    if (!page) throw new Error('page not found')
    if (req.query.save !== '1') return res.status(200).json({ ok: true, dry: true, oldLength: page.body.length, newLength: body.length, hasBackup: !!backup })
    if (!backup) {
      const b = await gql('mutation($p: PageCreateInput!) { pageCreate(page: $p) { page { id } userErrors { message } } }', { p: { title: page.title + ' (old version)', handle: BACKUP, body: page.body, isPublished: false } })
      if (b.pageCreate.userErrors.length) throw new Error('backup: ' + b.pageCreate.userErrors[0].message)
    }
    const u = await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { userErrors { message } } }', { id: page.id, p: { title: c.title, body } })
    if (u.pageUpdate.userErrors.length) throw new Error(u.pageUpdate.userErrors[0].message)
    const m = await gql('mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { message } } }', { m: [
      { ownerId: page.id, namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: c.seoTitle },
      { ownerId: page.id, namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: c.seoDescription }] })
    res.status(200).json({ ok: true, saved: true, seo: m.metafieldsSet.userErrors })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
