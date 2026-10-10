// Add products, step 1: look a scanned barcode up.
//   /api/intake-lookup?barcode=0817513010040
// Says whether we already sell it, and what the price watch shops publish about it. Read only.
import { cleanBarcode, findOurs, lookupElsewhere } from '../../lib/intake'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const barcode = cleanBarcode(req.query.barcode)
  if (barcode.length < 6) return res.status(200).json({ ok: false, error: 'That does not look like a barcode. Scan it again or type the numbers under the bars.' })
  try {
    const [ours, found] = await Promise.all([
      findOurs(barcode).catch(e => ({ error: e.message })),
      lookupElsewhere(barcode),
    ])
    if (ours && ours.error) return res.status(200).json({ ok: false, error: ours.error })
    return res.status(200).json({ ok: true, barcode, ours: ours || null, found })
  } catch (e) {
    return res.status(200).json({ ok: false, error: 'The lookup failed: ' + (e && e.message ? e.message : 'unknown error') })
  }
}
