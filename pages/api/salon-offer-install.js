// One-off helper: refreshes the 10% sign-up box on a city page. Remove once run.
import { installOffer } from '../../lib/salon'
export default async function handler(req, res) {
  try { res.status(200).json(await installOffer(String(req.query.city || ''), req.query.go === '1')) }
  catch (e) { res.status(200).json({ ok: false, error: String(e.message || e) }) }
}
