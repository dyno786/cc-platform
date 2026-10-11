import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

// Salon clicks: how many times visitors clicked through to each salon from the city pages on the shop.
// Counts are per salon and per month. Nothing about the visitor is recorded.

const box = { background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }
const th = { textAlign: 'left', padding: '8px 10px', fontSize: 12, color: T.textMuted, borderBottom: `1px solid ${T.border}`, fontWeight: 600 }
const td = { padding: '9px 10px', fontSize: 14, borderBottom: `0.5px solid ${T.borderLight}`, color: T.text }
const num = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }
const monthName = m => new Date(m + '-01T00:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export default function Page() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [month, setMonth] = useState('')

  useEffect(() => {
    fetch('/api/salon-finder?report=1').then(r => r.json()).then(j => {
      if (!j.ok) { setError(j.error || 'The counts could not load.'); return }
      setRows(j.rows)
      const months = [...new Set(j.rows.map(r => r.month))].sort().reverse()
      setMonth(months[0] || '')
    }).catch(() => setError('No connection. Check the internet and reload the page.'))
  }, [])

  const months = rows ? [...new Set(rows.map(r => r.month))].sort().reverse() : []
  const shown = (rows || []).filter(r => r.month === month).map(r => ({ ...r, total: r.maps + r.phone })).sort((a, b) => b.total - a.total)
  const total = shown.reduce((s, r) => s + r.total, 0)

  return (
    <>
      <Head><title>Salon Clicks — CC Intelligence</title></Head>
      <Shell title="Salon Clicks" subtitle="Clicks from the city pages to each salon">
        <div style={box}>
          <p style={{ fontSize: 13.5, color: T.textMuted, lineHeight: 1.5 }}>
            Each time a visitor taps a salon's Google Maps link or phone number on a city page, one click is added to that salon. Only the salon is counted, never the visitor.
          </p>
        </div>
        {error && <div style={{ ...box, borderColor: T.redBorder, background: T.redBg, color: T.red, fontSize: 14 }}>{error}</div>}
        {!error && rows === null && <div style={{ ...box, color: T.textMuted, fontSize: 14 }}>Loading the counts.</div>}
        {rows && rows.length === 0 && <div style={{ ...box, color: T.textMuted, fontSize: 14 }}>No clicks have been counted yet.</div>}
        {rows && rows.length > 0 && (
          <div style={box}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{total} {total === 1 ? 'click' : 'clicks'} in {monthName(month)}</div>
              <select value={month} onChange={e => setMonth(e.target.value)} aria-label="Month" style={{ padding: '8px 10px', fontSize: 14, border: `1px solid ${T.border}`, borderRadius: 8, background: '#fff', color: T.text }}>
                {months.map(m => <option key={m} value={m}>{monthName(m)}</option>)}
              </select>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>Salon</th><th style={th}>City</th><th style={{ ...th, textAlign: 'right' }}>Maps</th><th style={{ ...th, textAlign: 'right' }}>Phone</th><th style={{ ...th, textAlign: 'right' }}>Total</th></tr></thead>
                <tbody>
                  {shown.map(r => (
                    <tr key={r.city + r.salon}><td style={td}>{r.salon}</td><td style={td}>{r.city}</td><td style={num}>{r.maps}</td><td style={num}>{r.phone}</td><td style={{ ...num, fontWeight: 600 }}>{r.total}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Shell>
    </>
  )
}
