// CRM storage on Vercel Blob (private store "cc-crm", BLOB_READ_WRITE_TOKEN is set on the project).
// Everything is small JSON documents:
//   crm/snapshot.json   customers + their orders for the last 200 days, rebuilt by /api/crm/sync
//   crm/state.json      what has been sent/skipped per customer, pauses, notes
//   crm/settings.json   flow switches, reorder windows, quiet hours, store details
//   crm/log/YYYY-MM.json  every message marked as sent, for reporting
import { put, get, head } from '@vercel/blob'

const ACCESS = 'private'

export function storeReady() { return !!process.env.BLOB_READ_WRITE_TOKEN }

export async function getJSON(path, fallback) {
  if (!storeReady()) return fallback
  try {
    const r = await get(path, { access: ACCESS, useCache: false })
    if (!r) return fallback
    const text = await new Response(r.stream).text()
    return text ? JSON.parse(text) : fallback
  } catch (e) {
    if (/not.?found|404/i.test(String(e.message || e))) return fallback
    throw e
  }
}

export async function putJSON(path, obj) {
  if (!storeReady()) throw new Error('The CRM storage is not connected (BLOB_READ_WRITE_TOKEN is missing on Vercel).')
  await put(path, JSON.stringify(obj), { access: ACCESS, addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 0 })
  return true
}

export async function exists(path) {
  try { await head(path, { access: ACCESS }); return true } catch (e) { return false }
}

// Read-modify-write with a tiny retry, used for state.json so two clicks at once don't lose a mark.
export async function updateJSON(path, fallback, fn) {
  let last
  for (let i = 0; i < 3; i++) {
    try {
      const cur = await getJSON(path, fallback)
      const next = fn(cur) || cur
      await putJSON(path, next)
      return next
    } catch (e) { last = e; await new Promise(r => setTimeout(r, 150 * (i + 1))) }
  }
  throw last
}

export const PATHS = {
  snapshot: 'crm/snapshot.json',
  state: 'crm/state.json',
  settings: 'crm/settings.json',
  sync: 'crm/sync.json',
  log: (ym) => 'crm/log/' + ym + '.json',
  campaigns: 'crm/campaigns.json',
}
