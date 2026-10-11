// Salon finder: called from the city pages on cchairandbeauty.com.
//  - action "click": adds one to a salon's click count for the month (no visitor details are kept)
//  - action "join":  saves an email that ticked the offers box as a Shopify customer, then returns the city's code
// GET ?report=1 gives the counts to the Salon Clicks page. GET ?check=1 says whether the Shopify key has the permissions needed.
import { CITIES, STYLES, countClick, joinList, readClicks, scopes } from '../../lib/salon'
import { sameSite } from '../../lib/intake'

export const config = { maxDuration: 30 }

const SHOP_ORIGINS = ['https://cchairandbeauty.com', 'https://www.cchairandbeauty.com']
const EMAIL = /^[a-z0-9._%+-]{1,64}@[a-z0-9-]+(\.[a-z0-9-]+)+$/

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const origin = String(req.headers.origin || '')
  const fromShop = SHOP_ORIGINS.includes(origin)
  if (fromShop) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin') }
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Methods', 'POST'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).end() }

  try {
    if (req.method === 'GET') {
      if (req.query.check === '1') {
        const s = await scopes()
        return res.status(200).json({ ok: true, customers: s.includes('write_customers'), pages: s.includes('write_content') || s.includes('write_online_store_pages') })
      }
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

    if (b.action === 'join') {
      if (b.website) return res.status(200).json({ ok: true, code: CITIES[city].code })   // hidden field only robots fill in: do nothing
      const email = String(b.email || '').trim().toLowerCase()
      const style = String(b.style || '')
      if (!EMAIL.test(email) || email.length > 120) return res.status(200).json({ ok: false, error: 'Check the email address and try again.' })
      if (!STYLES[style]) return res.status(200).json({ ok: false, error: 'Choose the hairstyle you are booking.' })
      if (b.agree !== true) return res.status(200).json({ ok: false, error: 'Tick the box to get the code.' })
      await joinList(city, email, style)
      return res.status(200).json({ ok: true, code: CITIES[city].code })
    }
    return res.status(200).json({ ok: false, error: 'Unknown request.' })
  } catch (e) {
    console.error('salon-finder', e)
    return res.status(200).json({ ok: false, error: 'Something went wrong. Please try again in a minute.' })
  }
}
