// Add products, photos tab: attach one photo to one option of a draft product.
// The page sends the picture (already shrunk in the browser) with the option it belongs to.
import { gql, sameSite } from '../../lib/intake'

export const config = { maxDuration: 60, api: { bodyParser: { sizeLimit: '4mb' } } }

const wait = ms => new Promise(r => setTimeout(r, ms))

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(200).json({ ok: false, error: 'Use the Add products page.' })
  if (!sameSite(req)) return res.status(200).json({ ok: false, error: 'This can only be used from the Add products page.' })
  try {
    const { productId, variantId, data, alt } = req.body || {}
    if (!/^gid:\/\/shopify\/Product\/\d+$/.test(String(productId)) || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(String(variantId))) return res.status(200).json({ ok: false, error: 'The product or option is missing.' })
    const m = String(data || '').match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)
    if (!m) return res.status(200).json({ ok: false, error: 'That file is not a JPG, PNG or WebP picture.' })
    const mime = m[1], bytes = Buffer.from(m[2], 'base64')
    const filename = 'option-' + String(variantId).split('/').pop() + '.' + (mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg')

    // the product must be one of ours made by the scanning page, and the option must belong to it
    const chk = await gql('query($id: ID!) { product(id: $id) { tags variants(first: 100) { nodes { id media(first: 1) { nodes { id } } } } } }', { id: productId })
    if (!chk.product || !(chk.product.tags || []).includes('intake')) return res.status(200).json({ ok: false, error: 'Photos can only be added here to products made on this page.' })
    if (!chk.product.variants.nodes.some(v => v.id === variantId)) return res.status(200).json({ ok: false, error: 'That option is not on this product.' })

    const s = await gql('mutation($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }', { input: [{ resource: 'IMAGE', filename, mimeType: mime, httpMethod: 'POST', fileSize: String(bytes.length) }] })
    const target = (s.stagedUploadsCreate.stagedTargets || [])[0]
    if (!target) return res.status(200).json({ ok: false, error: 'Shopify would not accept the upload: ' + (s.stagedUploadsCreate.userErrors || []).map(e => e.message).join('; ') })
    const form = new FormData()
    for (const p of target.parameters) form.append(p.name, p.value)
    form.append('file', new Blob([bytes], { type: mime }), filename)
    const up = await fetch(target.url, { method: 'POST', body: form })
    if (!up.ok) return res.status(200).json({ ok: false, error: 'The picture could not be uploaded (status ' + up.status + ').' })

    const c = await gql('mutation($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id status } mediaUserErrors { field message } } }', { productId, media: [{ originalSource: target.resourceUrl, alt: String(alt || '').slice(0, 200), mediaContentType: 'IMAGE' }] })
    const media = (c.productCreateMedia.media || [])[0]
    if (!media) return res.status(200).json({ ok: false, error: 'Shopify would not add the picture: ' + (c.productCreateMedia.mediaUserErrors || []).map(e => e.message).join('; ') })
    let status = media.status
    for (let i = 0; i < 20 && status !== 'READY' && status !== 'FAILED'; i++) {
      await wait(1500)
      const n = await gql('query($id: ID!) { node(id: $id) { ... on MediaImage { status } } }', { id: media.id })
      status = (n.node && n.node.status) || status
    }
    if (status !== 'READY') return res.status(200).json({ ok: false, error: status === 'FAILED' ? 'Shopify could not read that picture. Try saving it again as a JPG.' : 'Shopify is still preparing the picture. It is on the product, but not yet linked to the option. Try this one again in a minute.' })
    const a = await gql('mutation($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) { productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) { productVariants { id } userErrors { field message } } }', { productId, variantMedia: [{ variantId, mediaIds: [media.id] }] })
    const ae = a.productVariantAppendMedia.userErrors || []
    if (ae.length) return res.status(200).json({ ok: false, error: 'The picture is on the product but could not be linked to the option: ' + ae.map(e => e.message).join('; ') })

    // when every option has a photo, the product leaves the "needs photos" list
    const left = chk.product.variants.nodes.filter(v => v.id !== variantId && !(v.media.nodes || []).length).length
    if (left === 0) await gql('mutation($id: ID!, $tags: [String!]!) { tagsRemove(id: $id, tags: $tags) { userErrors { message } } }', { id: productId, tags: ['intake-needs-photos'] }).catch(() => {})
    return res.status(200).json({ ok: true, left })
  } catch (e) {
    return res.status(200).json({ ok: false, error: e && e.message ? e.message : 'Something went wrong.' })
  }
}
