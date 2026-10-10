// Add products, photos tab: draft products made by the scanning page whose options still need photos.
import { gql, cleanBarcode } from '../../lib/intake'

export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const d = await gql('query($q: String!) { products(first: 30, query: $q, sortKey: CREATED_AT, reverse: true) { nodes { id title status createdAt featuredMedia { preview { image { url } } } variants(first: 100) { nodes { id title barcode media(first: 1) { nodes { id } } } } } } }', { q: 'tag:intake-needs-photos' })
    const products = (d.products.nodes || []).map(p => ({
      id: p.id, title: p.title, status: p.status, created: String(p.createdAt).slice(0, 10), image: p.featuredMedia && p.featuredMedia.preview && p.featuredMedia.preview.image ? p.featuredMedia.preview.image.url : '',
      adminUrl: 'https://' + process.env.SHOPIFY_STORE + '/admin/products/' + p.id.split('/').pop(),
      variants: (p.variants.nodes || []).map(v => ({ id: v.id, title: v.title, barcode: cleanBarcode(v.barcode), hasPhoto: (v.media.nodes || []).length > 0 })),
    }))
    return res.status(200).json({ ok: true, products })
  } catch (e) {
    return res.status(200).json({ ok: false, error: e && e.message ? e.message : 'Could not load the list.' })
  }
}
