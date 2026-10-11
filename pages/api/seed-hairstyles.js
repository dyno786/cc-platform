// One-off helper for the Afro hairstyles guide page: creates or refreshes the page. Remove once run.
import { gql } from '../../lib/intake'
import { PAGE, buildPage } from '../../lib/hairstyles'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const q = req.query
    if (q.step === 'page') {
      const images = JSON.parse(q.images || '{}')
      const body = buildPage(images)
      if (q.go !== '1') return res.status(200).json({ ok: true, saved: false, length: body.length, images: Object.keys(images).length })
      const f = await gql('query($q: String!) { pages(first: 1, query: $q) { nodes { id handle } } }', { q: 'handle:' + PAGE.handle })
      const old = (f.pages.nodes || []).find(p => p.handle === PAGE.handle)
      const metafields = [
        { namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: PAGE.seoTitle },
        { namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: PAGE.seoDescription },
        { namespace: 'seo', key: 'hidden', type: 'number_integer', value: '1' },
      ]
      let id
      if (old) {
        const u = await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { page { id } userErrors { message } } }', { id: old.id, p: { body } })
        if (u.pageUpdate.userErrors.length) throw new Error(u.pageUpdate.userErrors.map(e => e.message).join('; '))
        id = old.id
      } else {
        const c = await gql('mutation($p: PageCreateInput!) { pageCreate(page: $p) { page { id } userErrors { message } } }', { p: { title: PAGE.title, handle: PAGE.handle, body, isPublished: true, metafields } })
        if (c.pageCreate.userErrors.length) throw new Error(c.pageCreate.userErrors.map(e => e.message).join('; '))
        id = c.pageCreate.page.id
      }
      return res.status(200).json({ ok: true, saved: true, id, updated: !!old })
    }
    return res.status(200).json({ ok: false, error: 'Nothing to do.' })
  } catch (e) { return res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
