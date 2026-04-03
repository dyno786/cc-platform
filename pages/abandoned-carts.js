import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const CC_WHATSAPP = '447911123456' // CC main WhatsApp number — update this
const STORE_URL = 'https://cchairandbeauty.com'

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
  const firstName = cart.customer?.split(' ')[0] || 'there'
  const itemShort = cart.items?.split(',')[0]?.slice(0, 50) || 'your items'
  const msg = `Hi ${firstName}! 👋 I'm from CC Hair and Beauty Leeds. I noticed you left ${itemShort} in your cart (${cart.total}). Need any help completing your order? We're happy to assist! 😊 Shop here: ${STORE_URL}/cart — Use code SAVE10 for 10% off today only! 🛍️`
  return `https://wa.me/${cart.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

function buildEmailMsg(cart) {
  const firstName = cart.customer?.split(' ')[0] || 'there'
  const subject = `You left something behind — ${cart.total} in your CC Hair & Beauty cart`
  const body = `Hi ${firstName},\n\nWe noticed you left some items in your cart at CC Hair and Beauty!\n\nYou had: ${cart.items}\nCart value: ${cart.total}\n\nComplete your order here: ${STORE_URL}/cart\n\nUse code SAVE10 for 10% off — valid today only!\n\nNeed help? Just reply to this email.\n\nCC Hair and Beauty Leeds\nChapeltown LS7 | Roundhay LS8 | City Centre\ncchairandbeauty.com`
  return `mailto:${cart.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function buildReorderMsg(order) {
  const firstName = order.customer?.split(' ')[0] || 'there'
  const subject = `Time to restock? Your CC Hair & Beauty order was 30 days ago`
  const body = `Hi ${firstName},\n\nIt's been about a month since your last order from CC Hair and Beauty!\n\nYou ordered: ${order.items}\n\nRunning low? Shop again here: ${STORE_URL}\n\nAs a returning customer, use LOYAL10 for 10% off your next order!\n\nCC Hair and Beauty Leeds\ncchairandbeauty.com`
  return `mailto:${order.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function AbandonedCarts() {
  const [tab, setTab] = useState('Abandoned')
  const [carts, setCarts] = useState([])
  const [reorders, setReorders] = useState([])
  const [loading, setLoading] = useState(true)
  const [contacted, setContacted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_contacted') || '{}') } catch(e) { return {} }
  })
  const [filter, setFilter] = useState('all') // all, whatsapp, email, high-value
  const [sort, setSort] = useState('value') // value, time

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/abandoned-carts')
        const d = await r.json()
        if (d.ok) {
          setCarts(d.abandonedCarts || [])
          setReorders(d.reviewEligible || [])
        }
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

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

  const totalValue = carts.reduce((s, c) => s + c.totalRaw, 0)
  const withPhone = carts.filter(c => c.phone).length
  const withEmail = carts.filter(c => c.email && !c.phone).length
  const contactedCount = Object.keys(contacted).length
  const highValue = carts.filter(c => c.totalRaw >= 30).length

  const TABS = ['Abandoned', 'Reorder Reminders', 'Order Tracking']

  return (
    <>
      <Head><title>Abandoned Carts — CC Intelligence</title></Head>
      <Shell title="Abandoned Carts" subtitle="Recover lost revenue · WhatsApp & email recovery · reorder reminders">

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Total abandoned', value: `£${totalValue.toFixed(0)}`, sub: `${carts.length} carts`, color: T.red },
            { label: 'WhatsApp ready', value: withPhone, sub: 'have phone number', color: '#25D366' },
            { label: 'Email ready', value: withEmail, sub: 'email only', color: T.blue },
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
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', fontSize: 12, fontWeight: 600, border: 'none', background: 'none',
              borderBottom: tab === t ? `2px solid ${T.blue}` : '2px solid transparent',
              color: tab === t ? T.blue : T.textMuted, cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>

        {/* ABANDONED CARTS TAB */}
        {tab === 'Abandoned' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: T.textMuted }}>Filter:</span>
              {[
                { id: 'all', label: `All (${carts.length})` },
                { id: 'whatsapp', label: `📱 WhatsApp (${withPhone})` },
                { id: 'email', label: `✉️ Email only (${withEmail})` },
                { id: 'high-value', label: `💰 £30+ (${highValue})` },
                { id: 'not-contacted', label: `⏳ Not contacted (${carts.length - contactedCount})` },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{
                  padding: '4px 12px', fontSize: 11, fontWeight: 600, borderRadius: 20,
                  border: `1px solid ${filter === f.id ? T.blue : T.border}`,
                  background: filter === f.id ? T.blueBg : T.bg,
                  color: filter === f.id ? T.blue : T.textMuted, cursor: 'pointer',
                }}>{f.label}</button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: T.textMuted }}>Sort:</span>
                <button onClick={() => setSort('value')} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 4, border: `1px solid ${sort === 'value' ? T.blue : T.border}`, background: sort === 'value' ? T.blueBg : T.bg, color: sort === 'value' ? T.blue : T.textMuted, cursor: 'pointer' }}>Value ↓</button>
                <button onClick={() => setSort('time')} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 4, border: `1px solid ${sort === 'time' ? T.blue : T.border}`, background: sort === 'time' ? T.blueBg : T.bg, color: sort === 'time' ? T.blue : T.textMuted, cursor: 'pointer' }}>Recent first</button>
              </div>
            </div>

            {loading && <div style={{ padding: 40, textAlign: 'center', color: T.textMuted }}>Loading carts...</div>}

            {filtered.map(cart => {
              const urg = urgencyColor(cart.abandonedHoursAgo)
              const isContacted = contacted[cart.id]
              const hasPhone = !!cart.phone
              const hasEmail = !!cart.email
              const firstName = cart.customer?.split(' ')[0] || ''
              const isNameNull = cart.customer?.includes('null')

              return (
                <div key={cart.id} style={{
                  background: isContacted ? '#f6fbf7' : T.surface,
                  border: `1px solid ${isContacted ? '#1a7f3730' : urg.border}30`,
                  borderLeft: `4px solid ${isContacted ? T.green : urg.border}`,
                  borderRadius: 8, padding: '12px 14px', marginBottom: 7,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Left — customer info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                          {isNameNull ? '(No name)' : cart.customer}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: urg.bg, color: urg.text, border: `1px solid ${urg.border}20` }}>
                          {urg.label} · {timeAgo(cart.abandonedHoursAgo)}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.green }}>{cart.total}</span>
                        {isContacted && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#1a7f37', background: '#dafbe1', padding: '2px 7px', borderRadius: 4 }}>
                            ✓ Contacted via {isContacted.method}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>
                        🛍️ {cart.items?.slice(0, 100)}{cart.items?.length > 100 ? '...' : ''} ({cart.itemCount} item{cart.itemCount > 1 ? 's' : ''})
                      </div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: T.textMuted }}>
                        {hasPhone && <span style={{ color: '#25D366', fontWeight: 600 }}>📱 {cart.phone}</span>}
                        {hasEmail && <span>✉️ {cart.email}</span>}
                        {!hasPhone && !hasEmail && <span style={{ color: T.red }}>⚠ No contact info</span>}
                      </div>
                    </div>

                    {/* Right — action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                      {hasPhone && (
                        <a href={buildWhatsAppMsg(cart)} target="_blank" rel="noreferrer"
                          onClick={() => markContacted(cart.id, 'WhatsApp')}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', fontSize: 11, fontWeight: 700, color: '#fff', background: '#25D366', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          📱 WhatsApp {firstName}
                        </a>
                      )}
                      {hasEmail && (
                        <a href={buildEmailMsg(cart)} target="_blank" rel="noreferrer"
                          onClick={() => markContacted(cart.id, 'Email')}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', fontSize: 11, fontWeight: 700, color: '#fff', background: T.blue, borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          ✉️ Send email
                        </a>
                      )}
                      <a href={`${STORE_URL}/cart`} target="_blank" rel="noreferrer"
                        style={{ padding: '5px 12px', fontSize: 11, color: T.blue, background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 6, textDecoration: 'none', textAlign: 'center' }}>
                        View cart →
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}

            {!loading && filtered.length === 0 && (
              <div style={{ padding: 30, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>No carts match this filter.</div>
            )}
          </div>
        )}

        {/* REORDER REMINDERS TAB */}
        {tab === 'Reorder Reminders' && (
          <div>
            <div style={{ background: T.amberBg, border: `0.5px solid ${T.amberBorder}`, borderRadius: 7, padding: '9px 13px', marginBottom: 14, fontSize: 11, color: T.amber }}>
              Customers who ordered 30+ days ago — remind them to restock. Hair products typically run out in 4-8 weeks.
            </div>
            {reorders.length === 0 ? (
              <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 30, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
                Reorder reminders come from customers with orders 30+ days old who have email addresses.<br/>
                This data updates from Shopify automatically.
              </div>
            ) : reorders.map((order, i) => (
              <div key={i} style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3 }}>{order.customer}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>Last ordered: {order.items?.slice(0, 80)}</div>
                  <div style={{ fontSize: 11, color: T.amber, marginTop: 2 }}>Ordered {Math.round(order.daysSince)} days ago · {order.total}</div>
                </div>
                <a href={buildReorderMsg(order)} target="_blank" rel="noreferrer"
                  style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, color: '#fff', background: T.amber, borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  ✉️ Send reminder
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ORDER TRACKING TAB */}
        {tab === 'Order Tracking' && (
          <div>
            <div style={{ background: T.blueBg, border: `0.5px solid ${T.blueBorder}`, borderRadius: 7, padding: '9px 13px', marginBottom: 14, fontSize: 11, color: T.blue }}>
              Recent orders — track fulfilment status. Green = fulfilled & shipped, Amber = pending, Red = needs attention.
            </div>

            {/* Link to Shopify orders */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <a href="https://admin.shopify.com/store/cchairandbeauty/orders?status=unfulfilled" target="_blank" rel="noreferrer"
                style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#fff', background: T.red, borderRadius: 7, textDecoration: 'none' }}>
                ⚠ Unfulfilled orders →
              </a>
              <a href="https://admin.shopify.com/store/cchairandbeauty/orders" target="_blank" rel="noreferrer"
                style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#fff', background: T.blue, borderRadius: 7, textDecoration: 'none' }}>
                All orders in Shopify →
              </a>
            </div>

            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 100px', gap: 0, padding: '7px 14px', background: T.bg, borderBottom: `0.5px solid ${T.border}`, fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase' }}>
                <div>Order</div><div>Customer</div><div>Items</div><div>Value</div><div>Status</div>
              </div>
              {/* Live orders pulled from Shopify API via live-data */}
              <LiveOrders />
            </div>
          </div>
        )}

      </Shell>
    </>
  )
}

function LiveOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/shopify-stats')
      .then(r => r.json())
      .then(d => { if (d.ok) setOrders(d.recentOrders || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: T.textMuted, fontSize: 12 }}>Loading orders...</div>

  return orders.map((order, i) => {
    const isPaid = order.status === 'paid'
    return (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 100px', gap: 0, padding: '9px 14px', borderBottom: `0.5px solid ${T.borderLight}`, alignItems: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.blue }}>
          <a href={`https://admin.shopify.com/store/cchairandbeauty/orders/${order.id}`} target="_blank" rel="noreferrer" style={{ color: T.blue, textDecoration: 'none' }}>
            {order.name}
          </a>
        </div>
        <div style={{ fontSize: 12, color: T.text }}>{order.customer}</div>
        <div style={{ fontSize: 11, color: T.textMuted }}>{order.items?.slice(0, 50)}{order.items?.length > 50 ? '...' : ''}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.green }}>{order.total}</div>
        <div style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: isPaid ? '#dafbe1' : '#fff8e1', color: isPaid ? '#1a7f37' : '#9a6700', display: 'inline-block' }}>
          {isPaid ? '✓ Paid' : '⏳ Pending'}
        </div>
      </div>
    )
  })
}
