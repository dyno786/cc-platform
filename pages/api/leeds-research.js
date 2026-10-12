// One-off helper: checks a postcode request is counted and read back, then clears the test. Remove once run.
import { countWant, readWants } from '../../lib/salon'
import { gql } from '../../lib/intake'
export default async function handler(req, res) {
  try {
    const ok = await countWant('leeds', 'ZZ9', 'braids')
    const after = await readWants()
    const d = await gql('query { pages(first: 1, query: "handle:afro-hair-salons-leeds") { nodes { id } } }')
    const r = await gql('mutation($m: [MetafieldIdentifierInput!]!) { metafieldsDelete(metafields: $m) { userErrors { message } } }', { m: [{ ownerId: d.pages.nodes[0].id, namespace: 'cc_salon', key: 'demand' }] })
    res.status(200).json({ ok, after, cleared: !r.metafieldsDelete.userErrors.length, left: (await readWants()).length })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
