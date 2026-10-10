// One-off helper: creates the ten city guide pages in Shopify from data/city-pages.json.
// It only creates a page when no page with that handle exists, and the content is fixed
// in the repo, so calling it again changes nothing. Remove once the pages are live.
import { gql } from '../../lib/intake'
import pagesData from '../../data/city-pages.json'

export default async function handler(req, res) {
  const go = req.query.go === '1'
  const only = req.query.only ? String(req.query.only) : null
  const out = []
  try {
    for (const p of pagesData) {
      if (only && p.handle !== only) continue
      const found = await gql('query($q: String!) { pages(first: 1, query: $q) { nodes { id handle } } }', { q: 'handle:' + p.handle })
      const hit = (found.pages.nodes || []).find(n => n.handle === p.handle)
      if (hit) { out.push({ handle: p.handle, status: 'exists', id: hit.id }); continue }
      if (!go) { out.push({ handle: p.handle, status: 'would create', bytes: p.body.length }); continue }
      const d = await gql('mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle isPublished } userErrors { field message } } }', {
        page: {
          title: p.title, handle: p.handle, isPublished: true, body: p.body,
          metafields: [
            { namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: p.seoTitle },
            { namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: p.seoDescription },
          ],
        },
      })
      const r = d.pageCreate
      if (r.userErrors && r.userErrors.length) out.push({ handle: p.handle, status: 'error', errors: r.userErrors })
      else out.push({ handle: p.handle, status: 'created', id: r.page.id, published: r.page.isPublished })
    }
    res.status(200).json({ ok: true, go, pages: out })
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e.message || e), pages: out })
  }
}
