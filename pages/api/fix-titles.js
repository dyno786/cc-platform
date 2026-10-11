// One-off helper: tidies size units in live product titles (see lib/titlefix.js) and keeps the old title
// in the product metafield custom.old_title so any change can be put back. Without go=1 it only reports.
import { gql } from '../../lib/intake'
import { fixTitle } from '../../lib/titlefix'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  const go = req.query.go === '1'
  let cursor = req.query.cursor ? String(req.query.cursor) : null
  const started = Date.now()
  let seen = 0, changed = 0, saved = 0, noSize = 0, oos = 0, noSeoDesc = 0, noSeoTitle = 0, done = false
  const samples = [], errors = []
  try {
    if (req.query.status === '1') {
      const st = await gql('{ currentBulkOperation(type: MUTATION) { id status errorCode objectCount createdAt completedAt url } }')
      return res.status(200).json({ ok: true, op: st.currentBulkOperation })
    }
    if (req.query.bulk === '1') {
      const lines = []
      while (Date.now() - started < 38000) {
        const d = await gql('query($c: String) { products(first: 250, after: $c, query: "status:active") { pageInfo { hasNextPage endCursor } nodes { id title } } }', { c: cursor })
        for (const p of d.products.nodes || []) {
          seen++
          const n = fixTitle(p.title)
          if (n !== p.title) lines.push(JSON.stringify({ input: { id: p.id, title: n, metafields: [{ namespace: 'custom', key: 'old_title', type: 'single_line_text_field', value: p.title.slice(0, 250) }] } }))
        }
        if (!d.products.pageInfo.hasNextPage) { done = true; break }
        cursor = d.products.pageInfo.endCursor
      }
      if (!lines.length) return res.status(200).json({ ok: true, seen, changed: 0, done, cursor })
      const su = await gql('mutation { stagedUploadsCreate(input: [{ resource: BULK_MUTATION_VARIABLES, filename: "titles.jsonl", mimeType: "text/jsonl", httpMethod: POST }]) { stagedTargets { url parameters { name value } } userErrors { message } } }')
      const tgt = su.stagedUploadsCreate.stagedTargets[0]
      const form = new FormData()
      let key = ''
      for (const prm of tgt.parameters) { form.append(prm.name, prm.value); if (prm.name === 'key') key = prm.value }
      form.append('file', new Blob([lines.join('\n')], { type: 'text/jsonl' }), 'titles.jsonl')
      const up = await fetch(tgt.url, { method: 'POST', body: form })
      if (!up.ok) return res.status(200).json({ ok: false, error: 'upload ' + up.status, seen, changed: lines.length, cursor })
      const run = await gql('mutation($m: String!, $p: String!) { bulkOperationRunMutation(mutation: $m, stagedUploadPath: $p) { bulkOperation { id status } userErrors { message } } }', { m: 'mutation call($input: ProductInput!) { productUpdate(input: $input) { product { id } userErrors { message } } }', p: key })
      return res.status(200).json({ ok: true, seen, changed: lines.length, done, cursor, run: run.bulkOperationRunMutation })
    }
    while (Date.now() - started < 42000) {
      const d = await gql('query($c: String) { products(first: 250, after: $c, query: "status:active") { pageInfo { hasNextPage endCursor } nodes { id title seo { title description } } } }', { c: cursor })
      const nodes = d.products.nodes || []
      seen += nodes.length
      const hits = []
      for (const p of nodes) {
        if (!/\d\s*(oz|ml|g|kg|l|lb|"|''|inch|pcs|pc|pack)\b/i.test(p.title) && !/\d+\s*("|”|″)/.test(p.title)) noSize++
        if (/-\s*oos\b/i.test(p.title)) oos++
        if (!p.seo || !p.seo.description) noSeoDesc++
        if (!p.seo || !p.seo.title) noSeoTitle++
        const n = fixTitle(p.title)
        if (n !== p.title) { hits.push({ id: p.id, old: p.title, title: n }); if (samples.length < 40 && changed % 9 === 0) samples.push([p.title, n]); changed++ }
      }
      if (go) {
        for (let i = 0; i < hits.length; i += 20) {
          const part = hits.slice(i, i + 20)
          const vars = {}, decl = [], body = []
          part.forEach((h, n) => {
            vars['p' + n] = { id: h.id, title: h.title, metafields: [{ namespace: 'custom', key: 'old_title', type: 'single_line_text_field', value: h.old.slice(0, 250) }] }
            decl.push('$p' + n + ': ProductInput!')
            body.push('p' + n + ': productUpdate(input: $p' + n + ') { userErrors { message } }')
          })
          const r = await gql('mutation(' + decl.join(', ') + ') { ' + body.join(' ') + ' }', vars)
          for (const k of Object.keys(r)) { if (r[k].userErrors && r[k].userErrors.length) errors.push(r[k].userErrors[0].message); else saved++ }
        }
      }
      if (!d.products.pageInfo.hasNextPage) { done = true; break }
      cursor = d.products.pageInfo.endCursor
      if (!go && seen >= 2500) break
    }
    res.status(200).json({ ok: true, go, seen, changed, saved, noSize, oos, noSeoDesc, noSeoTitle, done, cursor, errors: errors.slice(0, 5), samples: go ? samples.slice(0, 6) : samples })
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e.message || e), seen, changed, saved, cursor })
  }
}
