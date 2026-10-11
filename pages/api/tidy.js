// One-off helper for three clean-up jobs. Without go=1 each job only reports. Remove once done.
//   job=titles  moves staff notes out of product titles: "-Oos" becomes the tag "out of stock",
//               "- Keep" becomes the tag "keep", and "- U1" style notes are removed.
//   job=seo     fills the search title and description of collections where they are missing or stale.
//   job=alt     gives product images that have no alt text the product title as alt text.
//   job=status  shows how the last bulk job is getting on.
import { gql, stripHtml } from '../../lib/intake'

export const config = { maxDuration: 60 }

const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; const c = s.slice(0, n); const dot = c.lastIndexOf('. '); return dot > 80 ? c.slice(0, dot + 1) : c.slice(0, c.lastIndexOf(' ')).replace(/[,;:&-]$/, '').trim() + '.' }
const STALE = /more (choice|brands) than any other|largest|number one|most established|since the 19|leading afro|premium quality|high-quality|discover the|transform your|experience the|unleash|shop the latest/i

async function bulk(lines, mutation) {
  const su = await gql('mutation { stagedUploadsCreate(input: [{ resource: BULK_MUTATION_VARIABLES, filename: "vars.jsonl", mimeType: "text/jsonl", httpMethod: POST }]) { stagedTargets { url parameters { name value } } userErrors { message } } }')
  const tgt = su.stagedUploadsCreate.stagedTargets[0]
  const form = new FormData()
  let key = ''
  for (const prm of tgt.parameters) { form.append(prm.name, prm.value); if (prm.name === 'key') key = prm.value }
  form.append('file', new Blob([lines.join('\n')], { type: 'text/jsonl' }), 'vars.jsonl')
  const up = await fetch(tgt.url, { method: 'POST', body: form })
  if (!up.ok) throw new Error('upload failed ' + up.status)
  const run = await gql('mutation($m: String!, $p: String!) { bulkOperationRunMutation(mutation: $m, stagedUploadPath: $p) { bulkOperation { id status } userErrors { message } } }', { m: mutation, p: key })
  return run.bulkOperationRunMutation
}

export function cleanTitle(t) {
  let s = String(t || ''), oos = false, keep = false
  if (/\boos\b/i.test(s)) { oos = true; s = s.replace(/\s*[-–(]?\s*\boos\b\)?/gi, '') }
  if (/[-–]\s*keep\b/i.test(s)) { keep = true; s = s.replace(/\s*[-–]\s*keep\b/gi, '') }
  s = s.replace(/\s*[-–]\s*U\d\b/gi, '')
  s = s.replace(/\s{2,}/g, ' ').replace(/\s*[-–]\s*$/, '').trim()
  return { title: s, oos, keep }
}

export default async function handler(req, res) {
  const job = String(req.query.job || '')
  const go = req.query.go === '1'
  let cursor = req.query.cursor ? String(req.query.cursor) : null
  const started = Date.now()
  let seen = 0, done = false
  const lines = [], samples = [], counts = {}
  const bump = k => { counts[k] = (counts[k] || 0) + 1 }
  try {
    if (job === 'status') {
      const st = await gql('{ currentBulkOperation(type: MUTATION) { id status errorCode objectCount createdAt completedAt } }')
      return res.status(200).json({ ok: true, op: st.currentBulkOperation })
    }
    if (job === 'titles') {
      const status = req.query.st === 'draft' ? 'draft' : 'active'
      while (Date.now() - started < 38000) {
        const d = await gql('query($c: String) { products(first: 250, after: $c, query: "status:' + status + '") { pageInfo { hasNextPage endCursor } nodes { id title tags old: metafield(namespace: "custom", key: "old_title") { value } } } }', { c: cursor })
        for (const p of d.products.nodes || []) {
          seen++
          const r = cleanTitle(p.title)
          if (r.title === p.title || !r.title) continue
          const tags = p.tags.slice()
          if (r.oos && !tags.includes('out of stock')) { tags.push('out of stock'); bump('oos') }
          if (r.keep && !tags.includes('keep')) { tags.push('keep'); bump('keep') }
          if (!r.oos && !r.keep) bump('u')
          const input = { id: p.id, title: r.title, tags }
          if (!p.old) input.metafields = [{ namespace: 'custom', key: 'old_title', type: 'single_line_text_field', value: p.title.slice(0, 250) }]
          lines.push(JSON.stringify({ input }))
          if (samples.length < 30 && lines.length % 7 === 1) samples.push([p.title, r.title])
        }
        if (!d.products.pageInfo.hasNextPage) { done = true; break }
        cursor = d.products.pageInfo.endCursor
      }
      const run = go && lines.length ? await bulk(lines, 'mutation call($input: ProductInput!) { productUpdate(input: $input) { product { id } userErrors { message } } }') : null
      return res.status(200).json({ ok: true, job, status, go, seen, changes: lines.length, counts, done, cursor, run, samples: go ? [] : samples })
    }
    if (job === 'seo') {
      while (Date.now() - started < 38000) {
        const d = await gql('query($c: String) { collections(first: 100, after: $c) { pageInfo { hasNextPage endCursor } nodes { id handle title descriptionHtml seo { title description } productsCount { count } } } }', { c: cursor })
        for (const c of d.collections.nodes || []) {
          seen++
          if (!c.productsCount || !c.productsCount.count) { bump('empty collection'); continue }
          const od = (c.seo && c.seo.description) || '', ot = (c.seo && c.seo.title) || ''
          const badDesc = !od || STALE.test(od) || (od.length >= 150 && !/[.!?]$/.test(od)) || od.trim().toLowerCase() === c.title.trim().toLowerCase()
          const badTitle = !ot || (ot.length >= 58 && !/(beauty|leeds|uk)$/i.test(ot))
          if (!badDesc && !badTitle) { bump('already fine'); continue }
          const name = c.title.replace(/\s+/g, ' ').trim()
          const text = stripHtml(c.descriptionHtml || '').replace(/^\s*(.{0,80}?)\s{2,}/, '$1 ')
          const first = /^\s*<h2>[\s\S]*?<\/h2>\s*<p>([\s\S]*?)<\/p>/i.exec(c.descriptionHtml || '')
          let desc
          if (first) { desc = clip(stripHtml(first[1]), 155); bump('desc from new text') }
          else if (text.length > 60 && !STALE.test(text.slice(0, 200)) && text.toLowerCase() !== name.toLowerCase()) { desc = clip(text, 155); bump('desc from own text') }
          else { desc = clip('Shop ' + name + ' at CC Hair & Beauty. Order online for UK delivery, or visit our Leeds shops in Chapeltown, Roundhay and the City Centre.', 160); bump('desc from template') }
          const title = (name + ' | CC Hair & Beauty').length <= 60 ? name + ' | CC Hair & Beauty' : name.slice(0, 60)
          if (badTitle) bump('title set')
          lines.push(JSON.stringify({ input: { id: c.id, seo: { title: badTitle ? title : ot, description: badDesc ? desc : od } } }))
          if (samples.length < 25 && lines.length % 40 === 1) samples.push({ handle: c.handle, was: c.seo, title: badTitle ? title : ot, desc: badDesc ? desc : od })
        }
        if (!d.collections.pageInfo.hasNextPage) { done = true; break }
        cursor = d.collections.pageInfo.endCursor
      }
      const run = go && lines.length ? await bulk(lines, 'mutation call($input: CollectionInput!) { collectionUpdate(input: $input) { collection { id } userErrors { message } } }') : null
      return res.status(200).json({ ok: true, job, go, seen, changes: lines.length, counts, done, cursor, run, samples: go ? [] : samples })
    }
    if (job === 'alt') {
      let images = 0, missing = 0
      while (Date.now() - started < 36000) {
        const d = await gql('query($c: String) { products(first: 100, after: $c, query: "status:active") { pageInfo { hasNextPage endCursor } nodes { id title media(first: 6) { nodes { id alt mediaContentType } } } } }', { c: cursor })
        for (const p of d.products.nodes || []) {
          seen++
          const todo = []
          const imgs = (p.media.nodes || []).filter(m => m.mediaContentType === 'IMAGE')
          imgs.forEach((m, i) => { images++; if (!m.alt || !m.alt.trim()) { missing++; todo.push({ id: m.id, alt: (i ? p.title + ' - view ' + (i + 1) : p.title).slice(0, 500) }) } })
          if (todo.length) lines.push(JSON.stringify({ productId: p.id, media: todo }))
        }
        if (!d.products.pageInfo.hasNextPage) { done = true; break }
        cursor = d.products.pageInfo.endCursor
      }
      const run = go && lines.length ? await bulk(lines, 'mutation call($productId: ID!, $media: [UpdateMediaInput!]!) { productUpdateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { message } } }') : null
      return res.status(200).json({ ok: true, job, go, seen, images, missing, products: lines.length, done, cursor, run })
    }
    res.status(200).json({ ok: false, error: 'job must be titles, seo, alt or status' })
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e.message || e), job, seen, cursor })
  }
}
