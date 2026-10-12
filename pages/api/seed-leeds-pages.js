// One-off helper: creates the Leeds shopping pages and the trade "coming soon" page, then adds them to the menus. Remove once run.
import { gql } from '../../lib/intake'
import { PAGES, buildShopPage, TRADE, buildTrade } from '../../lib/leedspages'
export const config = { maxDuration: 60 }
const F = 'id title url type resourceId tags'
const strip = it => ({ id: it.id, title: it.title, type: it.type, url: it.url, resourceId: it.resourceId || undefined, tags: it.tags, items: (it.items || []).map(strip) })
async function upsert(handle, title, body, seoTitle, seoDescription) {
  const f = await gql('query($q: String!) { pages(first: 1, query: $q) { nodes { id handle } } }', { q: 'handle:' + handle })
  const old = (f.pages.nodes || []).find(p => p.handle === handle)
  if (old) { const u = await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { userErrors { message } } }', { id: old.id, p: { body } }); if (u.pageUpdate.userErrors.length) throw new Error(handle + ': ' + u.pageUpdate.userErrors[0].message); return old.id }
  const c = await gql('mutation($p: PageCreateInput!) { pageCreate(page: $p) { page { id } userErrors { message } } }', { p: { title, handle, body, isPublished: true, metafields: [{ namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: seoTitle }, { namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: seoDescription }] } })
  if (c.pageCreate.userErrors.length) throw new Error(handle + ': ' + c.pageCreate.userErrors[0].message)
  return c.pageCreate.page.id
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const shop = await gql('query { shop { contactEmail } }')
    const ids = {}
    for (const h of Object.keys(PAGES)) ids[h] = await upsert(h, PAGES[h].title, buildShopPage(h), PAGES[h].seoTitle, PAGES[h].seoDescription)
    ids[TRADE.handle] = await upsert(TRADE.handle, TRADE.title, buildTrade(shop.shop.contactEmail || 'info@cchairandbeauty.com'), TRADE.seoTitle, TRADE.seoDescription)
    const item = (h, t) => ({ title: t, type: 'PAGE', resourceId: ids[h], url: '/pages/' + h, tags: [], items: [] })
    const plan = [
      ['gid://shopify/Menu/193117618397', [['Hair Extensions', item('human-hair-extensions-leeds', 'Human Hair Extensions Leeds')], ['Hair Extensions', item('hair-weave-leeds', 'Hair Weave Leeds')], ['Wigs & Lace Wigs', item('human-hair-wigs-leeds', 'Human Hair Wigs Leeds')]]],
      ['gid://shopify/Menu/307240665466', [[null, item('human-hair-extensions-leeds', 'Human Hair Extensions Leeds')], [null, item('hair-weave-leeds', 'Hair Weave Leeds')], [null, item('human-hair-wigs-leeds', 'Human Hair Wigs Leeds')], [null, item('beauty-wholesalers-leeds', 'Trade & Wholesale (Coming Soon)')]]],
    ]
    const out = { pages: ids }
    for (const [id, adds] of plan) {
      const d = await gql('query($id: ID!) { menu(id: $id) { id handle title items { ' + F + ' items { ' + F + ' items { ' + F + ' } } } } }', { id })
      const items = d.menu.items.map(strip)
      for (const [parent, it] of adds) {
        if (JSON.stringify(items).includes(it.url + '"')) continue
        if (parent) { const p = items.find(i => i.title === parent); if (!p) throw new Error('no menu ' + parent); p.items.push(it) }
        else { const i = items.findIndex(x => x.url === '/pages/hair-dye-leeds'); items.splice(i < 0 ? items.length : i + 1, 0, it) }
      }
      const r = await gql('mutation($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $title, items: $items) { userErrors { message } } }', { id, title: d.menu.title, items })
      out[d.menu.handle] = r.menuUpdate.userErrors.length ? r.menuUpdate.userErrors : 'saved'
    }
    res.status(200).json({ ok: true, out })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
