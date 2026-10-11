// One-off helper for the Afro hairstyles guide page: makes the style illustrations, stores them in Shopify Files
// and creates the page. Remove once run.
import { gql } from '../../lib/intake'
import { STYLES, PAGE, buildPage } from '../../lib/hairstyles'

export const config = { maxDuration: 60 }

const LOOK = {
  'knotless-braids': 'medium knotless box braids, mid-back length, neat square partings, each braid starting flat and smooth at the scalp with no knot',
  'box-braids': 'classic medium box braids, mid-back length, clear square partings with a small knot at the root of each braid',
  'ghana-braids': 'six thick Ghana braids, feed-in cornrows braided flat to the scalp straight back from the hairline, ends hanging to the shoulder blades',
  'fulani-braids': 'Fulani braids: thin cornrows at the front with one braid down the centre parting, loose braids at the back and sides, gold beads and cuffs on the ends',
  'boho-braids': 'boho goddess knotless braids, mid-back length, with loose curly strands left out along the braids and curly ends',
  'french-curl-braids': 'French curl braids: braids that stop halfway down and finish in long, smooth, bouncy spiral curls',
  'senegalese-twists': 'Senegalese twists: long, smooth, sleek two-strand rope twists, mid-back length, neat partings',
  'passion-twists': 'passion twists: soft, springy, slightly fluffy two-strand twists, shoulder-blade length, relaxed bohemian texture',
  'marley-twists': 'Marley twists: chunky two-strand twists with a coarse, kinky, matte natural afro texture, shoulder-blade length',
  'faux-locs': 'faux locs: long, even, cylindrical wrapped locs, mid-back length, a few with gold cuffs',
  'crochet-braids': 'crochet braids with full, bouncy, defined curls at shoulder length, lots of volume',
  'sew-in-weave': 'a sleek sew-in weave: long, smooth, glossy straight hair with a clean middle parting, mid-back length',
  'wig-install': 'a lace front wig with soft body waves, natural-looking hairline and side parting, shoulder-blade length',
  'starter-locs': 'short starter locs: neat comb coil locs about ear length, tidy grid partings',
  'kids-braids': 'a young girl, about eight years old, with neat cornrows into short braids finished with colourful beads on the ends',
}
const prompt = id => 'Flat modern digital illustration, clean vector style with soft shading. ' + (id === 'kids-braids' ? 'Seen from a three-quarter back view: ' + LOOK[id] + '. She wears a simple teal t-shirt.' : 'A Black woman seen from a three-quarter back view, showing her hairstyle: ' + LOOK[id] + '. Dark black hair. She wears a simple coral top.') + ' Plain warm cream background, colour #f6efe4. Head and shoulders centred with space around the hair. Calm and elegant; the hairstyle is the focus and is drawn accurately and neatly. No text, no logos, no watermark, no border.'

async function makeImage(id) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.OPENAI_API_KEY },
    body: JSON.stringify({ model: 'gpt-image-1', prompt: prompt(id), n: 1, size: '1024x1024', quality: 'medium', output_format: 'jpeg', output_compression: 88 }),
  })
  const d = await r.json()
  if (d.error) throw new Error('Image maker said: ' + d.error.message)
  const b64 = d.data && d.data[0] && d.data[0].b64_json
  if (!b64) throw new Error('No image came back.')
  return Buffer.from(b64, 'base64')
}

// The app's Shopify key cannot add files, so each picture is parked on the page as a temporary field and served
// from here once, for Shopify to copy into Files. The temporary fields are deleted at the end.
const mkey = id => 'img_' + id.replace(/-/g, '_')
async function pageId() {
  const f = await gql('query($q: String!) { pages(first: 1, query: $q) { nodes { id handle } } }', { q: 'handle:' + PAGE.handle })
  const p = (f.pages.nodes || []).find(x => x.handle === PAGE.handle)
  if (!p) throw new Error('Create the page first.')
  return p.id
}
async function park(id, buf) {
  const r = await gql('mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { message } } }', { m: [{ ownerId: await pageId(), namespace: 'cc_tmp', key: mkey(id), type: 'json', value: JSON.stringify({ b64: buf.toString('base64') }) }] })
  if (r.metafieldsSet.userErrors.length) throw new Error(r.metafieldsSet.userErrors.map(e => e.message).join('; '))
}
async function parked(id) {
  const d = await gql('query($id: ID!, $k: String!) { page(id: $id) { metafield(namespace: "cc_tmp", key: $k) { value } } }', { id: await pageId(), k: mkey(id) })
  return d.page && d.page.metafield ? Buffer.from(JSON.parse(d.page.metafield.value).b64, 'base64') : null
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const q = req.query
    if (q.step === 'scopes') {
      const d = await gql('query { currentAppInstallation { accessScopes { handle } } }')
      const s = d.currentAppInstallation.accessScopes.map(x => x.handle)
      return res.status(200).json({ files: s.includes('write_files'), content: s.includes('write_content') || s.includes('write_online_store_pages'), openai: !!process.env.OPENAI_API_KEY })
    }
    if (q.step === 'img') {
      if (!LOOK[q.id]) return res.status(200).json({ ok: false, error: 'Unknown style.' })
      const buf = await makeImage(q.id)
      await park(q.id, buf)
      return res.status(200).json({ ok: true, id: q.id, bytes: buf.length })
    }
    if (q.step === 'raw') {
      const buf = await parked(String(q.id || ''))
      if (!buf) return res.status(404).end()
      res.setHeader('Content-Type', 'image/jpeg')
      return res.status(200).send(buf)
    }
    if (q.step === 'clean') {
      const ownerId = await pageId()
      const r = await gql('mutation($m: [MetafieldIdentifierInput!]!) { metafieldsDelete(metafields: $m) { deletedMetafields { key } userErrors { message } } }', { m: STYLES.map(s => ({ ownerId, namespace: 'cc_tmp', key: mkey(s.id) })) })
      return res.status(200).json({ ok: !r.metafieldsDelete.userErrors.length, deleted: (r.metafieldsDelete.deletedMetafields || []).filter(Boolean).length })
    }
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
