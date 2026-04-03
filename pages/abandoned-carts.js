import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const STORE_URL = 'https://cchairandbeauty.com'
const TRUSTPILOT_URL = 'https://uk.trustpilot.com/review/cchairandbeauty.com'

// Generate month options — last 18 months
function getMonthOptions() {
  const opts = []
  const now = new Date()
  for (let i = 1; i <= 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    opts.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    })
  }
  return opts
}

function timeAgo(hours) {
  if (hours < 2) return `${Math.round(hours * 60)}m ago`
  if (hours < 24) return `${Math.round(hours)}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function urgencyColor(hours) {
  if (hours < 24) return { bg: '#fff0f0', border: '#cf222e', text: '#cf222e', label: 'HOT' }
  if (hours < 72) return { bg: '#fff8e1', border: '#9a6700', text: '#9a6700', label: 'WARM' }
  return { bg: '#f6f8fa', border: '#57606a', text: '#57606a', label: 'COLD' }
}

function buildWhatsAppMsg(cart) {
  const firstName = cart.customer?.split(' ')[0]?.replace('null', '') || 'there'
  const item = cart.items?.split(',')[0]?.trim()?.slice(0, 60) || 'your items'
  // Line breaks via %0A, formatting with icons
  const msg = [
    `Hi ${firstName}! 👋`,
    ``,
    `I'm from *CC Hair and Beauty Leeds* — I noticed you left something in your cart! 🛒`,
    ``,
    `🛍️ *${item}*`,
    `💰 Cart value: *${cart.total}*`,
    ``,
    `Can we help you complete your order? We have 3 stores across Leeds:`,
    `📍 Chapeltown LS7 | Roundhay LS8 | City Centre`,
    ``,
    `👉 Complete your order here:`,
    `${STORE_URL}/cart`,
    ``,
    `🎁 Use code *SAVE10* for 10% off — today only!`,
    ``,
    `Any questions, just reply here 😊`,
    `— CC Hair & Beauty Team`,
  ].join('\n')
  return `https://wa.me/${cart.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

function buildCartEmailMsg(cart) {
  const firstName = cart.customer?.split(' ')[0]?.replace('null', '') || 'there'
  const subject = `You left ${cart.total} in your CC Hair & Beauty cart 🛒`
  const body = `Hi ${firstName},\n\nYou left some items in your cart at CC Hair and Beauty!\n\n🛍️ Items: ${cart.items}\n💰 Cart total: ${cart.total}\n\n👉 Complete your order: ${STORE_URL}/cart\n\n🎁 Use code SAVE10 for 10% off — today only!\n\nNeed help? Just reply to this email or visit us in store:\n📍 Chapeltown LS7 | Roundhay LS8 | City Centre\n🌐 cchairandbeauty.com\n\nKind regards,\nCC Hair & Beauty Team`
  return `mailto:${cart.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function buildReorderWhatsApp(order) {
  const firstName = order.customer?.split(' ')[0] || 'there'
  const item = order.items?.split(',')[0]?.trim()?.slice(0, 50) || 'your products'
  const msg = [
    `Hi ${firstName}! 👋`,
    ``,
    `It's been about a month since your last order from *CC Hair and Beauty*!`,
    ``,
    `🛍️ You ordered: *${item}*`,
    ``,
    `Running low? Time to restock! 💁‍♀️`,
    ``,
    `👉 Shop again: ${STORE_URL}`,
    ``,
    `🎁 As a returning customer, use *LOYAL10* for 10% off!`,
    ``,
    `— CC Hair & Beauty Team`,
  ].join('\n')
  return `https://wa.me/${order.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

function buildReorderEmail(order) {
  const firstName = order.customer?.split(' ')[0] || 'there'
  const subject = `Time to restock? Your CC Hair & Beauty order was a month ago 💁‍♀️`
  const body = `Hi ${firstName},\n\nIt's been about a month since your last order!\n\n🛍️ You ordered: ${order.items?.slice(0, 100)}\n\nRunning low? Shop again here: ${STORE_URL}\n\n🎁 Use code LOYAL10 for 10% off as a returning customer!\n\nKind regards,\nCC Hair & Beauty Team\n📍 Chapeltown LS7 | Roundhay LS8 | City Centre`
  return `mailto:${order.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function buildReviewWhatsApp(order) {
  const firstName = order.customer?.split(' ')[0] || 'there'
  const msg = [
    `Hi ${firstName}! 👋`,
    ``,
    `Your order from CC Hair and Beauty has been delivered! 📦✅`,
    ``,
    `We hope you love your products! 💕`,
    ``,
    `Would you mind leaving us a quick review on Trustpilot?`,
    `It really helps small businesses like ours! 🙏`,
    ``,
    `⭐ Leave a review here:`,
    `${TRUSTPILOT_URL}`,
    ``,
    `Thank you so much!`,
    `— CC Hair & Beauty Team`,
  ].join('\n')
  return `https://wa.me/${order.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

function buildReviewEmail(order) {
  const firstName = order.customer?.split(' ')[0] || 'there'
  const subject = `How was your CC Hair & Beauty order? ⭐ Leave us a review!`
  const body = `Hi ${firstName},\n\nYour recent order from CC Hair and Beauty has been delivered! 📦\n\nWe hope you're loving your products!\n\nWould you mind leaving us a quick review on Trustpilot? It takes less than 2 minutes and really helps us grow:\n\n⭐ ${TRUSTPILOT_URL}\n\nThank you so much for your support!\n\nKind regards,\nCC Hair & Beauty Team\n📍 Chapeltown LS7 | Roundhay LS8 | City Centre\n🌐 cchairandbeauty.com`
  return `mailto:${order.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function getRoyalMailTrackingUrl(trackingNumber) {
  if (!trackingNumber) return null
  return `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`
}

export default function AbandonedCarts() {
  const [tab, setTab] = useState('Abandoned')
  const [carts, setCarts] = useState([])
  const [loading, setLoading] = useState(true)
  const [contacted, setContacted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_contacted') || '{}') } catch(e) { return {} }
  })
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('value')

  // Reorder / tracking state
  const MONTH_OPTS = getMonthOptions()
  const [selectedMonth, setSelectedMonth] = useState(MONTH_OPTS[0].value)
  const [monthOrders, setMonthOrders] = useState([])
  const [monthLoading, setMonthLoading] = useState(false)
  const [trackingView, setTrackingView] = useState('reorder') // reorder | tracking

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/abandoned-carts')
        const d = await r.json()
        if (d.ok) setCarts(d.abandonedCarts || [])
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

  async function loadMonthOrders(val) {
    setSelectedMonth(val)
    setMonthLoading(true)
    setMonthOrders([])
    const [year, month] = val.split('-')
    try {
      const r = await fetch(`/api/shopify-orders-by-month?year=${year}&month=${month}`)
      const d = await r.json()
      if (d.ok) setMonthOrders(d.orders || [])
    } catch(e) {}
    setMonthLoading(false)
  }

  function markContacted(id, method) {
    const u = { ...contacted, [id]: { method, time: new Date().toISOString() } }
    setContacted(u)
    try { localStorage.setItem('cc_contacted', JSON.stringify(u)) } catch(e) {}
  }

  const filtered = carts
    .filter(c => {
      if (filter === 'whatsapp') return c.phone
      if (filter === 'email') return c.email
      if (filter === 'high-value') return c.totalRaw >= 30
      if (filter === 'not-contacted') return !contacted[c.id]
      return true
    })
    .sort((a, b) => sort === 'value' ? b.totalRaw - a.totalRaw : a.abandonedHoursAgo - b.abandonedHoursAgo)

  const totalValue = carts.reduce((s, c) => s + (c.totalRaw || 0), 0)
  const withPhone = carts.filter(c => c.phone).length
  const withEmail = carts.filter(c => c.email && !c.phone).length
  const contactedCount = Object.keys(contacted).length
  const highValue = carts.filter(c => (c.totalRaw || 0) >= 30).length

  const fulfilled = monthOrders.filter(o => o.fulfilled)
  const unfulfilled = monthOrders.filter(o => !o.fulfilled)
  const hasTracking = fulfilled.filter(o => o.trackingNumber)

  return (
    <>
      <Head><title>Abandoned Carts — CC Intelligence</title></Head>
      <Shell title="Abandoned Carts & Recovery" subtitle="Recover lost revenue · WhatsApp & email · reorder reminders · Trustpilot reviews">

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Total abandoned', value: `£${totalValue.toFixed(0)}`, sub: `${carts.length} carts`, color: T.red },
            { label: 'WhatsApp ready', value: withPhone, sub: 'have phone number', color: '#25D366' },
            { label: 'Email only', value: withEmail, sub: 'no phone number', color: T.blue },
            { label: 'High value (£30+)', value: highValue, sub: 'priority carts', color: T.amber },
            { label: 'Contacted', value: contactedCount, sub: `${carts.length - contactedCount} remaining`, color: T.green },
          ].map((s, i) => (
            <div key={i} style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: `1px solid ${T.border}` }}>
          {['Abandoned', 'Reorder & Tracking'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', fontSize: 12, fontWeight: 600, border: 'none', background: 'none',
              borderBottom: tab === t ? `2px solid ${T.blue}` : '2px solid transparent',
              color: tab === t ? T.blue : T.textMuted, cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>

        {/* ── ABANDONED CARTS ── */}
        {tab === 'Abandoned' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Filter:</span>
              {[
                { id: 'all', label: `All (${carts.length})` },
                { id: 'whatsapp', label: `📱 WhatsApp (${withPhone})` },
                { id: 'email', label: `✉️ Email (${withEmail})` },
                { id: 'high-value', label: `💰 £30+ (${highValue})` },
                { id: 'not-contacted', label: `⏳ Not yet (${carts.length - contactedCount})` },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{
                  padding: '4px 12px', fontSize: 11, fontWeight: 600, borderRadius: 20,
                  border: `1px solid ${filter === f.id ? T.blue : T.border}`,
                  background: filter === f.id ? T.blueBg : T.bg,
                  color: filter === f.id ? T.blue : T.textMuted, cursor: 'pointer',
                }}>{f.label}</button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
                {['value', 'time'].map(s => (
                  <button key={s} onClick={() => setSort(s)} style={{
                    padding: '4px 10px', fontSize: 11, borderRadius: 4,
                    border: `1px solid ${sort === s ? T.blue : T.border}`,
                    background: sort === s ? T.blueBg : T.bg,
                    color: sort === s ? T.blue : T.textMuted, cursor: 'pointer'
                  }}>{s === 'value' ? '£ Value' : '🕐 Recent'}</button>
                ))}
              </div>
            </div>

            {loading && <div style={{ padding: 30, textAlign: 'center', color: T.textMuted }}>Loading carts...</div>}

            {filtered.map(cart => {
              const urg = urgencyColor(cart.abandonedHoursAgo)
              const isContacted = contacted[cart.id]
              const hasPhone = !!cart.phone
              const hasEmail = !!cart.email
              const firstName = cart.customer?.replace(/null/g, '').trim().split(' ')[0] || ''
              const displayName = cart.customer?.replace(/null/g, '').trim() || '(No name)'

              return (
                <div key={cart.id} style={{
                  background: isContacted ? '#f6fbf7' : T.surface,
                  border: `1px solid ${isContacted ? '#1a7f3740' : urg.border + '40'}`,
                  borderLeft: `4px solid ${isContacted ? T.green : urg.border}`,
                  borderRadius: 8, padding: '12px 14px', marginBottom: 7,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{displayName}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: urg.bg, color: urg.text }}>
                          {urg.label} · {timeAgo(cart.abandonedHoursAgo)}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.green }}>{cart.total}</span>
                        {isContacted && (
                          <span style={{ fontSize: 10, color: '#1a7f37', background: '#dafbe1', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>
                            ✓ {isContacted.method} · {new Date(isContacted.time).toLocaleDateString('en-GB')}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: T.text, marginBottom: 4, lineHeight: 1.5 }}>
                        🛍️ {cart.items?.slice(0, 120)}{cart.items?.length > 120 ? '...' : ''}
                        {cart.itemCount > 1 && <span style={{ color: T.textMuted }}> ({cart.itemCount} items)</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                        {hasPhone && <span style={{ color: '#25D366', fontWeight: 600 }}>📱 {cart.phone}</span>}
                        {hasEmail && <span style={{ color: T.textMuted }}>✉️ {cart.email}</span>}
                        {!hasPhone && !hasEmail && <span style={{ color: T.red, fontWeight: 600 }}>⚠ No contact info</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                      {hasPhone && (
                        <a href={buildWhatsAppMsg(cart)} target="_blank" rel="noreferrer"
                          onClick={() => markContacted(cart.id, 'WhatsApp')}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#fff', background: '#25D366', borderRadius: 7, textDecoration: 'none' }}>
                          📱 WhatsApp {firstName}
                        </a>
                      )}
                      {hasEmail && (
                        <a href={buildCartEmailMsg(cart)} target="_blank" rel="noreferrer"
                          onClick={() => markContacted(cart.id, 'Email')}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#fff', background: T.blue, borderRadius: 7, textDecoration: 'none' }}>
                          ✉️ Email {firstName}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {!loading && filtered.length === 0 && (
              <div style={{ padding: 30, textAlign: 'center', color: T.textMuted }}>No carts match this filter.</div>
            )}
          </div>
        )}

        {/* ── REORDER & TRACKING ── */}
        {tab === 'Reorder & Tracking' && (
          <div>
            {/* Month selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>📅 Month:</span>
              <select value={selectedMonth} onChange={e => loadMonthOrders(e.target.value)}
                style={{ padding: '6px 12px', fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 7, background: T.bg, color: T.text, cursor: 'pointer' }}>
                {MONTH_OPTS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {monthOrders.length > 0 && (
                <span style={{ fontSize: 11, color: T.textMuted }}>
                  {monthOrders.length} orders · £{monthOrders.reduce((s, o) => s + o.totalRaw, 0).toFixed(0)} total ·
                  <span style={{ color: T.green }}> {fulfilled.length} fulfilled</span> ·
                  <span style={{ color: T.red }}> {unfulfilled.length} unfulfilled</span>
                </span>
              )}
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {[
                { id: 'reorder', label: `🔄 Reorder Reminders (${monthOrders.filter(o => o.email || o.phone).length})` },
                { id: 'tracking', label: `📦 Order Tracking (${fulfilled.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setTrackingView(t.id)} style={{
                  padding: '6px 14px', fontSize: 11, fontWeight: 600, borderRadius: 7,
                  border: `1px solid ${trackingView === t.id ? T.blue : T.border}`,
                  background: trackingView === t.id ? T.blueBg : T.bg,
                  color: trackingView === t.id ? T.blue : T.textMuted, cursor: 'pointer'
                }}>{t.label}</button>
              ))}
            </div>

            {monthLoading && <div style={{ padding: 30, textAlign: 'center', color: T.textMuted }}>Loading orders...</div>}

            {!monthLoading && monthOrders.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: T.textMuted, fontSize: 12, background: T.surface, borderRadius: 8, border: `0.5px solid ${T.border}` }}>
                Select a month above to load orders
              </div>
            )}

            {/* REORDER VIEW */}
            {trackingView === 'reorder' && !monthLoading && monthOrders.filter(o => o.email || o.phone).map(order => {
              const isContacted = contacted[`reorder_${order.id}`]
              return (
                <div key={order.id} style={{
                  background: isContacted ? '#f6fbf7' : T.surface,
                  border: `0.5px solid ${isContacted ? '#1a7f3740' : T.border}`,
                  borderLeft: `4px solid ${isContacted ? T.green : T.amber}`,
                  borderRadius: 8, padding: '12px 14px', marginBottom: 7,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{order.customer}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.green }}>{order.total}</span>
                        <span style={{ fontSize: 11, color: T.textMuted }}>{order.name}</span>
                        {isContacted && <span style={{ fontSize: 10, color: '#1a7f37', background: '#dafbe1', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>✓ Contacted</span>}
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>
                        🛍️ {order.items?.slice(0, 100)}{order.items?.length > 100 ? '...' : ''}
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>
                        📅 {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {order.phone && <span style={{ color: '#25D366', marginLeft: 12, fontWeight: 600 }}>📱 {order.phone}</span>}
                        {order.email && <span style={{ color: T.textMuted, marginLeft: 12 }}>✉️ {order.email}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                      {order.phone && (
                        <a href={buildReorderWhatsApp(order)} target="_blank" rel="noreferrer"
                          onClick={() => markContacted(`reorder_${order.id}`, 'WhatsApp')}
                          style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#fff', background: '#25D366', borderRadius: 7, textDecoration: 'none' }}>
                          📱 WhatsApp reminder
                        </a>
                      )}
                      {order.email && (
                        <a href={buildReorderEmail(order)} target="_blank" rel="noreferrer"
                          onClick={() => markContacted(`reorder_${order.id}`, 'Email')}
                          style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#fff', background: T.blue, borderRadius: 7, textDecoration: 'none' }}>
                          ✉️ Email reminder
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* TRACKING VIEW */}
            {trackingView === 'tracking' && !monthLoading && (
              <div>
                {unfulfilled.length > 0 && (
                  <div style={{ background: '#fff0f0', border: `1px solid ${T.red}30`, borderRadius: 7, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: T.red, fontWeight: 600 }}>
                    ⚠ {unfulfilled.length} orders still unfulfilled —
                    <a href="https://admin.shopify.com/store/cchairandbeauty/orders?status=unfulfilled" target="_blank" rel="noreferrer"
                      style={{ color: T.red, marginLeft: 6, textDecoration: 'underline' }}>View in Shopify →</a>
                  </div>
                )}

                {fulfilled.map(order => {
                  const isContacted = contacted[`review_${order.id}`]
                  const trackUrl = order.trackingUrl || getRoyalMailTrackingUrl(order.trackingNumber)
                  return (
                    <div key={order.id} style={{
                      background: isContacted ? '#f6fbf7' : T.surface,
                      border: `0.5px solid ${T.border}`,
                      borderLeft: `4px solid ${T.green}`,
                      borderRadius: 8, padding: '12px 14px', marginBottom: 7,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{order.customer}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: T.green }}>{order.total}</span>
                            <span style={{ fontSize: 11, color: T.textMuted }}>{order.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: '#dafbe1', color: '#1a7f37' }}>
                              ✓ Fulfilled
                            </span>
                            {isContacted && <span style={{ fontSize: 10, color: '#1a7f37', background: '#dafbe1', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>⭐ Review requested</span>}
                          </div>
                          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>
                            🛍️ {order.items?.slice(0, 100)}{order.items?.length > 100 ? '...' : ''}
                          </div>
                          <div style={{ display: 'flex', gap: 12, fontSize: 11, flexWrap: 'wrap' }}>
                            {order.trackingNumber && (
                              <span style={{ fontFamily: 'monospace', color: T.blue }}>
                                📦 {order.trackingCompany || 'Royal Mail'}: {order.trackingNumber}
                              </span>
                            )}
                            {trackUrl && (
                              <a href={trackUrl} target="_blank" rel="noreferrer"
                                style={{ color: T.blue, fontWeight: 600, textDecoration: 'none' }}>
                                Track parcel →
                              </a>
                            )}
                            {!order.trackingNumber && <span style={{ color: T.textMuted }}>No tracking number</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                          {order.phone && (
                            <a href={buildReviewWhatsApp(order)} target="_blank" rel="noreferrer"
                              onClick={() => markContacted(`review_${order.id}`, 'WhatsApp')}
                              style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#fff', background: '#25D366', borderRadius: 7, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                              ⭐ WhatsApp review request
                            </a>
                          )}
                          {order.email && (
                            <a href={buildReviewEmail(order)} target="_blank" rel="noreferrer"
                              onClick={() => markContacted(`review_${order.id}`, 'Email')}
                              style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#fff', background: '#7c3aed', borderRadius: 7, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                              ⭐ Email review request
                            </a>
                          )}
                          <a href={order.adminUrl} target="_blank" rel="noreferrer"
                            style={{ padding: '5px 10px', fontSize: 11, color: T.blue, background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 6, textDecoration: 'none', textAlign: 'center' }}>
                            View order →
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {fulfilled.length === 0 && !monthLoading && (
                  <div style={{ padding: 20, textAlign: 'center', color: T.textMuted, fontSize: 12 }}>No fulfilled orders this month yet.</div>
                )}
              </div>
            )}
          </div>
        )}

      </Shell>
    </>
  )
}
