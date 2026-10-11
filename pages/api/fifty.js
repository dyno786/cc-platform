// One-off helper: finds "free delivery over £50" wording and changes the £50 to £75 (the real threshold).
// It only touches a £50 that sits next to the words delivery, shipping or postage.
// job=scan reports; job=fix&go=1 runs the product changes as a bulk job; job=other&go=1 fixes collections and pages.
import { gql, stripHtml } from '../../lib/intake'

export const config = { maxDuration: 60 }

export function swap(s) {
  s = String(s || '')
  return s.replace(/(£|&pound;|&#163;)\s?50(\.00)?(?![\d,])/g, (m, sym, dec, off) => {
    const ctx = stripHtml(s.slice(Math.max(0, off - 140), off + 90))
    return /deliver|shipping|postage/i.test(ctx) ? sym + '75' : m
  })
}

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

export default async function handler(req, res) {
  const job = String(req.query.job || 'scan')
  const go = req.query.go === '1'
  let cursor = req.query.cursor ? String(req.query.cursor) : null
  const st = ['active', 'draft', 'archived'].includes(req.query.st) ? req.query.st : 'active'
  const started = Date.now()
  let seen = 0, done = false, hasFifty = 0, inSeo = 0
  const lines = [], snippets = {}, untouched = {}
  const note = (bag, html) => { const t = stripHtml(html); const re = /.{0,45}£\s?50(?:\.00)?(?![\d,]).{0,25}/g; let m; while ((m = re.exec(t))) { const k = m[0].trim(); bag[k] = (bag[k] || 0) + 1 } }
  try {
    if (job === 'status') {
      const s = await gql('{ currentBulkOperation(type: MUTATION) { id status errorCode objectCount completedAt } }')
      return res.status(200).json({ ok: true, op: s.currentBulkOperation })
    }
    if (job === 'other') {
      const out = []
      let c = null
      for (;;) {
        const d = await gql('query($c: String) { collections(first: 100, after: $c) { pageInfo { hasNextPage endCursor } nodes { id handle descriptionHtml seo { title description } } } }', { c })
        for (const n of d.collections.nodes) {
          const nd = swap(n.descriptionHtml), ns = swap(n.seo.description || '')
          if (nd !== (n.descriptionHtml || '') || ns !== (n.seo.description || '')) {
            out.push('collection ' + n.handle)
            if (go) await gql('mutation($i: CollectionInput!) { collectionUpdate(input: $i) { userErrors { message } } }', { i: { id: n.id, descriptionHtml: nd, seo: { title: n.seo.title, description: ns } } })
          }
        }
        if (!d.collections.pageInfo.hasNextPage) break
        c = d.collections.pageInfo.endCursor
      }
      const pg = await gql('{ pages(first: 250) { nodes { id handle body } } articles(first: 100) { nodes { id handle body } } }')
      for (const n of pg.pages.nodes) {
        const nb = swap(n.body)
        if (nb !== (n.body || '')) { out.push('page ' + n.handle); if (go) await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { userErrors { message } } }', { id: n.id, p: { body: nb } }) }
        else if (/£\s?50(?![\d,])/.test(stripHtml(n.body))) out.push('page ' + n.handle + ' mentions £50, left alone')
      }
      for (const n of pg.articles.nodes) { if (swap(n.body) !== (n.body || '')) out.push('blog post ' + n.handle + ' (not changed)') }
      return res.status(200).json({ ok: true, job, go, found: out })
    }
    while (Date.now() - started < 36000) {
      const d = await gql('query($c: String) { products(first: 120, after: $c, query: "status:' + st + '") { pageInfo { hasNextPage endCursor } nodes { id descriptionHtml seo { title description } } } }', { c: cursor })
      for (const p of d.products.nodes || []) {
        seen++
        const html = p.descriptionHtml || '', sd = (p.seo && p.seo.description) || ''
        if (!/50/.test(html) && !/50/.test(sd)) continue
        const nh = swap(html), ns = swap(sd)
        if (nh === html && ns === sd) { if (/(£|&pound;)\s?50(?![\d,])/.test(html)) note(untouched, html); continue }
        hasFifty++
        if (ns !== sd) inSeo++
        if (Object.keys(snippets).length < 60) note(snippets, html)
        const input = { id: p.id }
        if (nh !== html) input.descriptionHtml = nh
        if (ns !== sd) input.seo = { title: p.seo.title, description: ns }
        lines.push(JSON.stringify({ input }))
      }
      if (!d.products.pageInfo.hasNextPage) { done = true; break }
      cursor = d.products.pageInfo.endCursor
    }
    const run = job === 'fix' && go && lines.length ? await bulk(lines, 'mutation call($input: ProductInput!) { productUpdate(input: $input) { product { id } userErrors { message } } }') : null
    const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 14)
    res.status(200).json({ ok: true, job, st, go, seen, toChange: hasFifty, inSeo, done, cursor, run, wording: top(snippets), leftAlone: top(untouched) })
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e.message || e), job, seen, cursor })
  }
}
