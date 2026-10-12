// One-off helper: adds Hair Dye Leeds to the main menu (under Hair Dyes) and the footer Guides menu. Remove once run.
import { gql } from '../../lib/intake'
const F = 'id title url type resourceId tags'
const strip = it => ({ id: it.id, title: it.title, type: it.type, url: it.url, resourceId: it.resourceId || undefined, tags: it.tags, items: (it.items || []).map(strip) })
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const p = await gql('query { pages(first: 1, query: "handle:hair-dye-leeds") { nodes { id handle } } }')
    const page = p.pages.nodes.find(x => x.handle === 'hair-dye-leeds')
    if (!page) return res.status(200).json({ ok: false, error: 'page missing' })
    const add = { title: 'Hair Dye Leeds', type: 'PAGE', resourceId: page.id, url: '/pages/hair-dye-leeds', tags: [], items: [] }
    const out = {}
    for (const [id, parent, after] of [['gid://shopify/Menu/193117618397', 'Hair Dyes', null], ['gid://shopify/Menu/307240665466', null, 'Hair Extensions Leeds']]) {
      const d = await gql('query($id: ID!) { menu(id: $id) { id handle title items { ' + F + ' items { ' + F + ' items { ' + F + ' } } } } }', { id })
      const m = d.menu, items = m.items.map(strip)
      const json = JSON.stringify(items)
      if (json.includes('/pages/hair-dye-leeds')) { out[m.handle] = 'already there'; continue }
      if (parent) { const t = items.find(i => i.title === parent); if (!t) throw new Error('no ' + parent); t.items.push(add) }
      else { const i = items.findIndex(x => x.title === after); items.splice(i + 1, 0, add) }
      if (req.query.go !== '1') { out[m.handle] = 'ready, ' + items.length + ' top items'; continue }
      const r = await gql('mutation($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $title, items: $items) { menu { id } userErrors { field message } } }', { id, title: m.title, items })
      out[m.handle] = r.menuUpdate.userErrors.length ? r.menuUpdate.userErrors : 'saved'
    }
    res.status(200).json({ ok: true, out })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
