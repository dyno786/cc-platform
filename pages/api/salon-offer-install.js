// One-off helper: checks that a click can be counted and read back, then clears the test click. Remove once run.
import { countClick, readClicks } from '../../lib/salon'
import { gql } from '../../lib/intake'
export default async function handler(req, res) {
  try {
    const before = await readClicks()
    const counted = await countClick('nottingham', 'ChIJ4XkineHBeUgRystLJmNbnbo', 'maps')
    const junk = await countClick('nottingham', 'NotARealPlaceId12345', 'maps')
    const after = await readClicks()
    let cleared = false
    if (before.length === 0) {
      const d = await gql('query { pages(first: 1, query: "handle:afro-hair-salons-nottingham") { nodes { id } } }')
      const r = await gql('mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { message } } }', { m: [{ ownerId: d.pages.nodes[0].id, namespace: 'cc_salon', key: 'clicks', type: 'json', value: '{}' }] })
      cleared = !r.metafieldsSet.userErrors.length
    }
    res.status(200).json({ before: before.length, counted, junkRejected: !junk, after, cleared })
  } catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
