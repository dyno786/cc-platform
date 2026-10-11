// Salon finder: called from the city pages on cchairandbeauty.com.
// Each click on a salon's map link or phone number adds one to that salon's count for the month.
// No visitor details are kept. The email sign-up on those pages goes straight to Shopify, not through here.
// GET ?report=1 gives the counts to the Salon Clicks page.
import { CITIES, countClick, readClicks } from '../../lib/salon'
import { sameSite } from '../../lib/intake'

export const config = { maxDuration: 30 }

const SHOP_ORIGINS = ['https://cchairandbeauty.com', 'https://www.cchairandbeauty.com']
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const origin = String(req.headers.origin || '')
  const fromShop = SHOP_ORIGINS.includes(origin)
  if (fromShop) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin') }
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Methods', 'POST'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).end() }

  try {
    if (req.method === 'GET') {
      if (req.query.report === '1' && sameSite(req)) return res.status(200).json({ ok: true, rows: await readClicks() })
      return res.status(200).json({ ok: false, error: 'Nothing to show here.' })
    }
    if (req.method !== 'POST' || !fromShop) return res.status(200).json({ ok: false, error: 'This can only be used from the shop website.' })

    // The pages send plain text so the browser does not need a separate permission request first.
    let b = req.body
    if (typeof b === 'string') { try { b = JSON.parse(b) } catch (e) { b = {} } }
    b = b || {}
    const city = String(b.city || '').toLowerCase()
    if (!CITIES[city]) return res.status(200).json({ ok: false, error: 'This offer is not running for that city.' })

    if (b.action === 'click') {
      const ok = await countClick(city, String(b.id || ''), b.kind === 'phone' ? 'phone' : 'maps')
      return res.status(200).json({ ok })
    }

    return res.status(200).json({ ok: false, error: 'Unknown request.' })
  } catch (e) {
    console.error('salon-finder', e)
    return res.status(200).json({ ok: false, error: 'Something went wrong. Please try again in a minute.' })
  }
}
