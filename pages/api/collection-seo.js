// One-off helper: reports on (and with go=1 fills in) the search title and description of collections
// whose description is in the new house format (starts with an h2). Remove once done.
import { gql, stripHtml } from '../../lib/intake'

export const config = { maxDuration: 60 }

const clip = (s, n) => { s = s.replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; const c = s.slice(0, n); const dot = c.lastIndexOf('. '); return dot > 90 ? c.slice(0, dot + 1) : c.slice(0, c.lastIndexOf(' ')).replace(/[,;:]$/, '') + '.' }

export default async function handler(req, res) {
  const go = req.query.go === '1'
  let cursor = req.query.cursor ? String(req.query.cursor) : null
  const started = Date.now()
  let seen = 0, ours = 0, saved = 0, emptyAll = 0, emptyDesc = 0, withProducts = 0, done = false
  const samples = [], errors = []
  try {
    while (Date.now() - started < 42000) {
      const d = await gql('query($c: String) { collections(first: 100, after: $c) { pageInfo { hasNextPage endCursor } nodes { id handle title descriptionHtml seo { title description } productsCount { count } } } }', { c: cursor })
      const nodes = d.collections.nodes || []
      seen += nodes.length
      const hits = []
      for (const c of nodes) {
        if (c.productsCount && c.productsCount.count > 0) withProducts++
        if (!c.descriptionHtml) emptyAll++
        if (!c.seo || !c.seo.description) emptyDesc++
        const m = /^\s*<h2>([\s\S]*?)<\/h2>\s*<p>([\s\S]*?)<\/p>/i.exec(c.descriptionHtml || '')
        if (!m) continue
        ours++
        const h = stripHtml(m[1]).replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
        const desc = clip(stripHtml(m[2]).replace(/&amp;/g, '&'), 155)
        const title = (h + ' | CC Hair & Beauty').length <= 60 ? h + ' | CC Hair & Beauty' : h.slice(0, 60)
        if (samples.length < 12) samples.push({ handle: c.handle, was: c.seo, title, desc })
        if (c.seo && c.seo.title === title && c.seo.description === desc) continue
        hits.push({ id: c.id, seo: { title, description: desc } })
      }
      if (go) {
        for (let i = 0; i < hits.length; i += 20) {
          const part = hits.slice(i, i + 20)
          const vars = {}, decl = [], body = []
          part.forEach((h, n) => { vars['c' + n] = h; decl.push('$c' + n + ': CollectionInput!'); body.push('c' + n + ': collectionUpdate(input: $c' + n + ') { userErrors { message } }') })
          const r = await gql('mutation(' + decl.join(', ') + ') { ' + body.join(' ') + ' }', vars)
          for (const k of Object.keys(r)) { if (r[k].userErrors && r[k].userErrors.length) errors.push(r[k].userErrors[0].message); else saved++ }
        }
      }
      if (!d.collections.pageInfo.hasNextPage) { done = true; break }
      cursor = d.collections.pageInfo.endCursor
    }
    res.status(200).json({ ok: true, go, seen, ours, saved, emptyAll, emptyDesc, withProducts, done, cursor, errors: errors.slice(0, 5), samples: go ? [] : samples })
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e.message || e), seen, ours, saved, cursor })
  }
}
