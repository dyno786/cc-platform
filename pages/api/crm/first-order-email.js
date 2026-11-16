// The "10% off your first order" email for subscribers who have never bought (AfterShip audience: orders = 0).
//   GET /api/crm/first-order-email   -> { subject, preview, html, products }
import { getJSON, PATHS } from '../../../lib/crm/store'
import { mergeSettings } from '../../../lib/crm/engine'
import { utm } from '../../../lib/crm/messages'
import { bestSellers, firstOrderEmail } from '../../../lib/crm/welcome'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  try {
    const [snap, settingsRaw] = await Promise.all([getJSON(PATHS.snapshot, null), getJSON(PATHS.settings, {})])
    if (!snap) return res.status(200).json({ ok: false, pending: true })
    const S = mergeSettings(settingsRaw).store
    const products = await bestSellers(snap, 4, 120)
    const em = firstOrderEmail(products, S)
    const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' })).toISOString().slice(0, 10)
    res.status(200).json({ ok: true, subject: em.subject, preview: em.preview, enough: products.length >= 4, products, campaign: 'first-order-' + date, html: utm(em.html, 'first-order-' + date) })
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }) }
}
