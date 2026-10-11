// One-off helper: finds the archived supermarket (food) products and tags them "delete".
// A product only counts as food when it is archived, tagged "supermarket", has no product type,
// has no stock, is not tagged as a hair product and its vendor is not on the skip list.
// Without go=1 it only reports. Remove once the tagging is done.
import { gql } from '../../lib/intake'

export const config = { maxDuration: 60 }

const SKIP = /cc hair|hair|wig|beauty|braid|lash|nail|cosmetic|sleek|kiss|magic collection|eden/i

export default async function handler(req, res) {
  const go = req.query.go === '1'
  const limit = Math.min(parseInt(req.query.limit || '1000', 10) || 1000, 1000)
  let cursor = req.query.cursor ? String(req.query.cursor) : null
  const started = Date.now()
  const vendors = {}
  const skipped = {}
  let seen = 0, matched = 0, tagged = 0, done = false
  const errors = []
  try {
    while (Date.now() - started < 45000 && matched < limit) {
      const d = await gql('query($c: String) { products(first: 250, after: $c, query: "tag:supermarket AND status:archived AND -tag:delete") { pageInfo { hasNextPage endCursor } nodes { id vendor productType totalInventory tags } } }', { c: cursor })
      const nodes = d.products.nodes || []
      seen += nodes.length
      const hits = []
      for (const p of nodes) {
        if (p.productType || p.totalInventory > 0 || p.tags.includes('afro hair products')) { skipped.other = (skipped.other || 0) + 1; continue }
        if (SKIP.test(p.vendor || '')) { skipped[p.vendor] = (skipped[p.vendor] || 0) + 1; continue }
        vendors[p.vendor] = (vendors[p.vendor] || 0) + 1
        hits.push(p.id)
      }
      matched += hits.length
      if (go) {
        for (let i = 0; i < hits.length; i += 25) {
          const part = hits.slice(i, i + 25)
          const m = 'mutation { ' + part.map((id, n) => 't' + n + ': tagsAdd(id: "' + id + '", tags: ["delete"]) { userErrors { message } }').join(' ') + ' }'
          const r = await gql(m)
          for (const k of Object.keys(r)) { if (r[k].userErrors && r[k].userErrors.length) errors.push(r[k].userErrors[0].message); else tagged++ }
        }
      }
      if (!d.products.pageInfo.hasNextPage) { done = true; break }
      cursor = d.products.pageInfo.endCursor
    }
    res.status(200).json({ ok: true, go, seen, matched, tagged, done, cursor, errors: errors.slice(0, 5), vendors, skipped })
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e.message || e), seen, matched, tagged, cursor })
  }
}
