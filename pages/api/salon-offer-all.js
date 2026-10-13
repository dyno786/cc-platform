// One-off helper: puts the 10% sign-up box on every salon finder city page (codes are made in Shopify).
// ?save=1 to save; without it, a dry run. Remove once run.
import { CITIES, installOffer } from '../../lib/salon'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const save = req.query.save === '1'
  const out = {}
  for (const city of Object.keys(CITIES)) {
    try { out[city] = await installOffer(city, save) } catch (e) { out[city] = { error: String(e.message || e) } }
  }
  res.status(200).json(out)
}
