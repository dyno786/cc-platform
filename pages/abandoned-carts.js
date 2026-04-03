import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const STORE_URL = 'https://cchairandbeauty.com'
const CC_EMAIL = 'cchndorders@gmail.com'
const TRUSTPILOT = 'https://uk.trustpilot.com/review/www.cchairandbeauty.com'
const COMMUNITY_BLOG = 'https://cchairandbeauty.com/blogs/news'
const ROYAL_MAIL_BASE = 'https://www.royalmail.com/track-your-item#/tracking-results/'

function getMonthOptions() {
  const opts = []
  const now = new Date()
  for (let i = 1; i <= 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    opts.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`,
      label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      year: d.getFullYear(), month: d.getMonth() + 1,
    })
  }
  return opts
}

function timeAgo(hours) {
  if (hours < 24) return `${Math.round(hours)}h ago`
  return `${Math.round(hours/24)}d ago`
}

function urgency(hours) {
  if (hours < 24) return { bg:'#fff0f0', border:'#cf222e', text:'#cf222e', label:'HOT' }
  if (hours < 72) return { bg:'#fff8e1', border:'#9a6700', text:'#9a6700', label:'WARM' }
  return { bg:'#f6f8fa', border:'#57606a', text:'#57606a', label:'COLD' }
}

function firstName(customer) {
  return customer?.replace(/null/g,'').trim().split(' ')[0] || 'there'
}

// ── MESSAGES — plain text, no emojis ──
function cartWhatsApp(cart) {
  const name = firstName(cart.customer)
  const item = cart.items?.split(',')[0]?.trim()?.slice(0,60) || 'your items'
  const msg = [
    `Hi ${name},`,
    ``,
    `This is CC Hair and Beauty Leeds. We noticed you left ${item} in your cart (${cart.total}).`,
    ``,
    `Can we help you complete your order? We have 3 stores in Leeds - Chapeltown LS7, Roundhay LS8 and City Centre.`,
    ``,
    `Complete your order here: ${STORE_URL}/cart`,
    ``,
    `Use code SAVE10 for 10% off today only.`,
    ``,
    `CC Hair and Beauty Leeds`,
  ].join('\n')
  return `https://wa.me/${cart.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`
}

function cartEmail(cart) {
  const name = firstName(cart.customer)
  const subj = `You left ${cart.total} in your CC Hair and Beauty cart`
  const body = [
    `Hi ${name},`,
    ``,
    `You left some items in your cart at CC Hair and Beauty.`,
    ``,
    `Items: ${cart.items}`,
    `Cart total: ${cart.total}`,
    ``,
    `Complete your order here: ${STORE_URL}/cart`,
    ``,
    `Use code SAVE10 for 10% off today only.`,
    ``,
    `If you need any help, just reply to this email.`,
    ``,
    `CC Hair and Beauty Leeds`,
    `Chapeltown LS7 | Roundhay LS8 | City Centre`,
  ].join('\n')
  return `mailto:${CC_EMAIL}?to=${encodeURIComponent(cart.email)}&subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
}

function reorderWhatsApp(order, inStockItems) {
  const name = firstName(order.customer)
  const item = inStockItems[0]?.title?.slice(0,50) || order.items?.split(',')[0]?.trim()
  const msg = [
    `Hi ${name},`,
    ``,
    `This is CC Hair and Beauty Leeds.`,
    ``,
    `It has been about a month since you ordered ${item}.`,
    ``,
    `Running low? Shop here: ${STORE_URL}`,
    ``,
    `CC Hair and Beauty Leeds`,
  ].join('\n')
  return `https://wa.me/${order.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`
}

function reorderCommunityWhatsApp(order) {
  const name = firstName(order.customer)
  const msg = [
    `Hi ${name},`,
    ``,
    `We also wanted to say a genuine thank you for your continued support.`,
    ``,
    `As a Leeds community business since 1979, your loyalty helps us support the local community in Chapeltown, Roundhay and across the city.`,
    ``,
    `You can read more about what we do here: ${COMMUNITY_BLOG}`,
    ``,
    `CC Hair and Beauty Leeds`,
  ].join('\n')
  return `https://wa.me/${order.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`
}

function reorderEmail(order, inStockItems) {
  const name = firstName(order.customer)
  const item = inStockItems[0]?.title?.slice(0,80) || order.items?.slice(0,80)
  const subj = `Checking in from CC Hair and Beauty Leeds`
  const body = [
    `Hi ${name},`,
    ``,
    `It has been about a month since your last order from CC Hair and Beauty and we just wanted to check in.`,
    ``,
    `You ordered: ${item}`,
    ``,
    `Running low? Shop again here: ${STORE_URL}`,
    ``,
    `We also wanted to say a genuine thank you for your support. As a Leeds community business since 1979, your loyalty makes a real difference to us and to the communities we serve across Chapeltown, Roundhay and the wider city.`,
    ``,
    `You can read more about our community work here: ${COMMUNITY_BLOG}`,
    ``,
    `Thank you again. We hope to see you soon.`,
    ``,
    `Warm regards,`,
    `CC Hair and Beauty Leeds`,
    `Chapeltown LS7 | Roundhay LS8 | City Centre`,
    `cchairandbeauty.com`,
  ].join('\n')
  return `mailto:${CC_EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
}

function reviewWhatsApp(order) {
  const name = firstName(order.customer)
  const tracking = order.trackingNumber ? `Your tracking reference: ${order.trackingNumber}` : ''
  const msg = [
    `Hi ${name},`,
    ``,
    `This is CC Hair and Beauty Leeds. Your recent order has been delivered.`,
    tracking ? tracking : null,
    ``,
    `We hope you are happy with your products.`,
    ``,
    `We would really appreciate it if you could leave us a quick review on Trustpilot. It takes less than 2 minutes and means the world to a family business that has been serving the Leeds community since 1979.`,
    ``,
    `Leave a review here: ${TRUSTPILOT}`,
    ``,
    `As a Leeds community business, we are proud to support local causes and events across Chapeltown, Roundhay and the wider city. You can read more about what we do here: ${COMMUNITY_BLOG}`,
    ``,
    `Thank you so much for your support. It means everything to us.`,
    `CC Hair and Beauty Leeds`,
  ].filter(l => l !== null).join('\n')
  return `https://wa.me/${order.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`
}

function reviewEmail(order) {
  const name = firstName(order.customer)
  const tracking = order.trackingNumber ? `Tracking reference: ${order.trackingNumber}` : ''
  const subj = `How was your CC Hair and Beauty order? We would love your review`
  const body = [
    `Hi ${name},`,
    ``,
    `Your recent order from CC Hair and Beauty has been delivered.`,
    tracking ? tracking : null,
    ``,
    `We hope you are absolutely happy with your products.`,
    ``,
    `We would really appreciate it if you could spare 2 minutes to leave us a review on Trustpilot. As a family business serving the Leeds community since 1979, every review genuinely helps us grow and continue doing what we love.`,
    ``,
    `Leave a review here: ${TRUSTPILOT}`,
    ``,
    `We are proud to be a Leeds community business. From supporting local events in Chapeltown and Roundhay to celebrating the incredible diversity of our city, community is at the heart of everything we do. You can read more about our community work and the latest news here: ${COMMUNITY_BLOG}`,
    ``,
    `Thank you so much for your continued support. It truly means everything to us.`,
    ``,
    `Warm regards,`,
    `CC Hair and Beauty Leeds`,
    `Chapeltown LS7 | Roundhay LS8 | City Centre`,
    `cchairandbeauty.com`,
  ].filter(l => l !== null).join('\n')
  return `mailto:${CC_EMAIL}?to=${encodeURIComponent(order.email)}&subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
}

// ── MAIN COMPONENT ──
export default function AbandonedCarts() {
  const [tab, setTab] = useState('Abandoned')
  const [carts, setCarts] = useState([])
  const [loading, setLoading] = useState(true)
  const [contacted, setContacted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_contacted') || '{}') } catch(e) { return {} }
  })
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('value')

  const MONTH_OPTS = getMonthOptions()
  const [selectedMonth, setSelectedMonth] = useState(MONTH_OPTS[0].value)
  const [monthOrders, setMonthOrders] = useState([])
  const [monthLoading, setMonthLoading] = useState(false)

  // Alternative suggestion state
  const [altLoading, setAltLoading] = useState({})
  const [altData, setAltData] = useState({})
  const [altMsg, setAltMsg] = useState({}) // which message type shown: 'ai' | 'generic'

  // Delivery confirmed state — staff manually marks as delivered
  const [delivered, setDelivered] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_delivered') || '{}') } catch(e) { return {} }
  })

  useEffect(() => {
    fetch('/api/abandoned-carts')
      .then(r => r.json())
      .then(d => { if (d.ok) setCarts(d.abandonedCarts || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function loadMonth(val) {
    setSelectedMonth(val)
    setMonthLoading(true)
    setMonthOrders([])
    const [y, m] = val.split('-')
    try {
      const r = await fetch(`/api/shopify-orders-by-month?year=${y}&month=${m}`)
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

  function markDelivered(orderId) {
    const u = { ...delivered, [orderId]: true }
    setDelivered(u)
    try { localStorage.setItem('cc_delivered', JSON.stringify(u)) } catch(e) {}
  }

  async function loadAlternative(item, customer) {
    const key = item.title
    setAltLoading(a => ({...a, [key]: true}))
    try {
      const r = await fetch('/api/suggest-alternative', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ outOfStockItem: item.title, customerName: customer })
      })
      const d = await r.json()
      if (d.ok) {
        setAltData(a => ({...a, [key]: d}))
        setAltMsg(a => ({...a, [key]: d.aiMessage ? 'ai' : 'generic'}))
      }
    } catch(e) {}
    setAltLoading(a => ({...a, [key]: false}))
  }

  const filtered = carts
    .filter(c => {
      if (filter === 'whatsapp') return c.phone
      if (filter === 'email') return c.email
      if (filter === 'high') return c.totalRaw >= 30
      if (filter === 'todo') return !contacted[c.id]
      return true
    })
    .sort((a,b) => sort === 'value' ? b.totalRaw - a.totalRaw : a.abandonedHoursAgo - b.abandonedHoursAgo)

  const withPhone = carts.filter(c => c.phone).length
  const withEmail = carts.filter(c => c.email && !c.phone).length
  const highVal = carts.filter(c => c.totalRaw >= 30).length
  const doneCount = Object.keys(contacted).length
  const totalVal = carts.reduce((s,c) => s + (c.totalRaw||0), 0)

  const fulfilled = monthOrders.filter(o => o.fulfilled)
  const unfulfilled = monthOrders.filter(o => !o.fulfilled)

  const TABS = ['Abandoned', 'Reorder Reminders', 'Order Tracking & Reviews']

  return (
    <>
      <Head><title>Abandoned Carts — CC Intelligence</title></Head>
      <Shell title="Abandoned Carts & Recovery" subtitle="Recover lost sales · reorder reminders · delivery tracking · Trustpilot reviews">

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:16}}>
          {[
            {label:'Total abandoned', value:`£${totalVal.toFixed(0)}`, sub:`${carts.length} carts`, color:T.red},
            {label:'WhatsApp ready', value:withPhone, sub:'have phone number', color:'#25D366'},
            {label:'Email only', value:withEmail, sub:'no phone number', color:T.blue},
            {label:'High value 30+', value:highVal, sub:'priority carts', color:T.amber},
            {label:'Contacted', value:doneCount, sub:`${carts.length-doneCount} remaining`, color:T.green},
          ].map((s,i) => (
            <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',fontWeight:600,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:14,borderBottom:`1px solid ${T.border}`}}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'7px 16px',fontSize:12,fontWeight:600,border:'none',background:'none',
              borderBottom:tab===t?`2px solid ${T.blue}`:'2px solid transparent',
              color:tab===t?T.blue:T.textMuted,cursor:'pointer',
            }}>{t}</button>
          ))}
        </div>

        {/* ── ABANDONED CARTS ── */}
        {tab==='Abandoned' && (
          <div>
            <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
              {[
                {id:'all',label:`All (${carts.length})`},
                {id:'whatsapp',label:`WhatsApp (${withPhone})`},
                {id:'email',label:`Email (${withEmail})`},
                {id:'high',label:`30+ (${highVal})`},
                {id:'todo',label:`Not contacted (${carts.length-doneCount})`},
              ].map(f => (
                <button key={f.id} onClick={()=>setFilter(f.id)} style={{
                  padding:'4px 12px',fontSize:11,fontWeight:600,borderRadius:20,
                  border:`1px solid ${filter===f.id?T.blue:T.border}`,
                  background:filter===f.id?T.blueBg:T.bg,
                  color:filter===f.id?T.blue:T.textMuted,cursor:'pointer',
                }}>{f.label}</button>
              ))}
              <div style={{marginLeft:'auto',display:'flex',gap:5}}>
                {[['value','Value'],['time','Recent']].map(([id,label]) => (
                  <button key={id} onClick={()=>setSort(id)} style={{
                    padding:'4px 10px',fontSize:11,borderRadius:4,
                    border:`1px solid ${sort===id?T.blue:T.border}`,
                    background:sort===id?T.blueBg:T.bg,
                    color:sort===id?T.blue:T.textMuted,cursor:'pointer'
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {loading && <div style={{padding:30,textAlign:'center',color:T.textMuted}}>Loading...</div>}

            {filtered.map(cart => {
              const urg = urgency(cart.abandonedHoursAgo)
              const done = contacted[cart.id]
              const name = firstName(cart.customer)
              const displayName = cart.customer?.replace(/null/g,'').trim() || 'No name'
              return (
                <div key={cart.id} style={{
                  background:done?'#f6fbf7':T.surface,
                  border:`1px solid ${done?'#1a7f3740':urg.border+'40'}`,
                  borderLeft:`4px solid ${done?T.green:urg.border}`,
                  borderRadius:8,padding:'12px 14px',marginBottom:7,
                }}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap'}}>
                        <span style={{fontSize:13,fontWeight:700,color:T.text}}>{displayName}</span>
                        <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,background:urg.bg,color:urg.text}}>{urg.label} · {timeAgo(cart.abandonedHoursAgo)}</span>
                        <span style={{fontSize:14,fontWeight:700,color:T.green}}>{cart.total}</span>
                        {done && <span style={{fontSize:10,color:'#1a7f37',background:'#dafbe1',padding:'2px 7px',borderRadius:4,fontWeight:600}}>Contacted via {done.method} · {new Date(done.time).toLocaleDateString('en-GB')}</span>}
                      </div>
                      <div style={{fontSize:11,color:T.text,marginBottom:4,lineHeight:1.5}}>
                        {cart.items?.slice(0,120)}{cart.items?.length>120?'...':''}
                        {cart.itemCount>1 && <span style={{color:T.textMuted}}> ({cart.itemCount} items)</span>}
                      </div>
                      <div style={{display:'flex',gap:12,fontSize:11}}>
                        {cart.phone && <span style={{color:'#25D366',fontWeight:600}}>{cart.phone}</span>}
                        {cart.email && <span style={{color:T.textMuted}}>{cart.email}</span>}
                        {!cart.phone && !cart.email && <span style={{color:T.red,fontWeight:600}}>No contact info</span>}
                      </div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0}}>
                      {cart.phone && (
                        <a href={cartWhatsApp(cart)} target="_blank" rel="noreferrer"
                          onClick={()=>markContacted(cart.id,'WhatsApp')}
                          style={{padding:'7px 14px',fontSize:12,fontWeight:700,color:'#fff',background:'#25D366',borderRadius:7,textDecoration:'none'}}>
                          WhatsApp {name}
                        </a>
                      )}
                      {cart.email && (
                        <a href={cartEmail(cart)} target="_blank" rel="noreferrer"
                          onClick={()=>markContacted(cart.id,'Email')}
                          style={{padding:'7px 14px',fontSize:12,fontWeight:700,color:'#fff',background:T.blue,borderRadius:7,textDecoration:'none'}}>
                          Email {name}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── REORDER REMINDERS ── */}
        {tab==='Reorder Reminders' && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14,flexWrap:'wrap'}}>
              <span style={{fontSize:12,fontWeight:600,color:T.text}}>Month:</span>
              <select value={selectedMonth} onChange={e=>loadMonth(e.target.value)}
                style={{padding:'6px 12px',fontSize:12,border:`1px solid ${T.border}`,borderRadius:7,background:T.bg,color:T.text}}>
                {MONTH_OPTS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              {monthOrders.length > 0 && (
                <span style={{fontSize:11,color:T.textMuted}}>
                  {monthOrders.length} orders · £{monthOrders.reduce((s,o)=>s+o.totalRaw,0).toFixed(0)} total
                </span>
              )}
            </div>

            {monthLoading && <div style={{padding:30,textAlign:'center',color:T.textMuted}}>Loading orders...</div>}

            {!monthLoading && monthOrders.length === 0 && (
              <div style={{padding:20,textAlign:'center',color:T.textMuted,background:T.surface,borderRadius:8,border:`0.5px solid ${T.border}`}}>
                Select a month above to load orders for reorder reminders
              </div>
            )}

            {!monthLoading && monthOrders.filter(o=>o.email||o.phone).map(order => {
              const done = contacted[`reorder_${order.id}`]
              const inStock = (order.lineItems||[]).filter(i=>i.inStock)
              const outOfStock = (order.lineItems||[]).filter(i=>!i.inStock)
              const canReorder = inStock.length > 0

              return (
                <div key={order.id} style={{
                  background:done?'#f6fbf7':T.surface,
                  border:`0.5px solid ${done?'#1a7f3740':T.border}`,
                  borderLeft:`4px solid ${done?T.green:canReorder?T.amber:T.red}`,
                  borderRadius:8,padding:'12px 14px',marginBottom:8,
                }}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap'}}>
                        <span style={{fontSize:13,fontWeight:700,color:T.text}}>{order.customer}</span>
                        <span style={{fontSize:11,fontWeight:700,color:T.green}}>{order.total}</span>
                        <span style={{fontSize:11,color:T.textMuted}}>{order.name} · {new Date(order.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
                        <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,background:T.blueBg,color:T.blue}}>
                          {order.orderCountThisYear === 1 ? '1 order this year' : `${order.orderCountThisYear} orders this year`}
                        </span>
                        {done && <span style={{fontSize:10,color:'#1a7f37',background:'#dafbe1',padding:'2px 7px',borderRadius:4,fontWeight:600}}>Contacted</span>}
                      </div>

                      {/* Line items with stock status */}
                      <div style={{marginBottom:6}}>
                        {(order.lineItems||[]).map((item,i) => (
                          <div key={i} style={{
                            fontSize:11,
                            color:item.inStock?T.text:T.textMuted,
                            textDecoration:item.inStock?'none':'line-through',
                            marginBottom:2,lineHeight:1.4,
                          }}>
                            {item.title}
                            {!item.inStock && (
                              <span style={{textDecoration:'none',marginLeft:6,fontSize:10,color:T.red,fontWeight:600}}>OUT OF STOCK</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Out of stock alternatives */}
                      {outOfStock.map(item => {
                        const key = item.title
                        const alt = altData[key]
                        const isLoading = altLoading[key]
                        const msgType = altMsg[key] || 'ai'
                        const msg = alt ? (msgType === 'ai' ? alt.aiMessage : alt.genericMessage) : null

                        return (
                          <div key={key} style={{background:'#fff8f8',border:`1px solid ${T.red}20`,borderRadius:6,padding:'8px 10px',marginBottom:6}}>
                            <div style={{fontSize:11,fontWeight:600,color:T.red,marginBottom:6}}>Out of stock: {item.title}</div>
                            {!alt && (
                              <button onClick={()=>loadAlternative(item,order.customer)} disabled={isLoading}
                                style={{padding:'4px 12px',fontSize:11,fontWeight:600,background:isLoading?T.border:T.blue,color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}}>
                                {isLoading?'Finding alternatives...':'Find alternatives + write message'}
                              </button>
                            )}
                            {alt && (
                              <div>
                                {alt.alternatives?.length > 0 && (
                                  <div style={{marginBottom:6}}>
                                    <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>In stock alternatives:</div>
                                    {alt.alternatives.map((a,i) => (
                                      <div key={i} style={{fontSize:11,marginBottom:2}}>
                                        <a href={a.url} target="_blank" rel="noreferrer" style={{color:T.blue}}>{a.title}</a>
                                        <span style={{color:T.textMuted,marginLeft:6}}>{a.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div style={{display:'flex',gap:6,marginBottom:6}}>
                                  {alt.aiMessage && (
                                    <button onClick={()=>setAltMsg(a=>({...a,[key]:'ai'}))} style={{
                                      padding:'3px 8px',fontSize:10,borderRadius:4,
                                      border:`1px solid ${msgType==='ai'?T.blue:T.border}`,
                                      background:msgType==='ai'?T.blueBg:T.bg,
                                      color:msgType==='ai'?T.blue:T.textMuted,cursor:'pointer'
                                    }}>AI message</button>
                                  )}
                                  <button onClick={()=>setAltMsg(a=>({...a,[key]:'generic'}))} style={{
                                    padding:'3px 8px',fontSize:10,borderRadius:4,
                                    border:`1px solid ${msgType==='generic'?T.blue:T.border}`,
                                    background:msgType==='generic'?T.blueBg:T.bg,
                                    color:msgType==='generic'?T.blue:T.textMuted,cursor:'pointer'
                                  }}>Generic message</button>
                                </div>
                                {msg && (
                                  <div>
                                    <textarea readOnly value={msg} rows={4}
                                      style={{width:'100%',fontSize:11,padding:'6px 8px',border:`1px solid ${T.border}`,borderRadius:5,background:T.bg,color:T.text,resize:'vertical',fontFamily:'inherit',lineHeight:1.5,marginBottom:6}}/>
                                    <div style={{display:'flex',gap:6}}>
                                      {order.phone && (
                                        <a href={`https://wa.me/${order.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`}
                                          target="_blank" rel="noreferrer"
                                          onClick={()=>markContacted(`reorder_${order.id}`,'WhatsApp')}
                                          style={{padding:'5px 12px',fontSize:11,fontWeight:700,color:'#fff',background:'#25D366',borderRadius:6,textDecoration:'none'}}>
                                          Send via WhatsApp
                                        </a>
                                      )}
                                      {order.email && (
                                        <a href={`mailto:${order.email}?subject=${encodeURIComponent('Regarding your recent CC Hair and Beauty order')}&body=${encodeURIComponent(msg)}`}
                                          target="_blank" rel="noreferrer"
                                          onClick={()=>markContacted(`reorder_${order.id}`,'Email')}
                                          style={{padding:'5px 12px',fontSize:11,fontWeight:700,color:'#fff',background:T.blue,borderRadius:6,textDecoration:'none'}}>
                                          Send via Email
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}

                      <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>
                        {order.phone && <span style={{marginRight:12}}>{order.phone}</span>}
                        {order.email && <span>{order.email}</span>}
                      </div>
                    </div>

                    {/* Reorder buttons — only show if any items in stock */}
                    {canReorder && (
                      <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0,minWidth:160}}>
                        {order.phone && (
                          <>
                            <a href={reorderWhatsApp(order,inStock)} target="_blank" rel="noreferrer"
                              onClick={()=>markContacted(`reorder_${order.id}`,'WhatsApp')}
                              style={{padding:'6px 12px',fontSize:11,fontWeight:700,color:'#fff',background:'#25D366',borderRadius:7,textDecoration:'none',whiteSpace:'nowrap'}}>
                              WhatsApp — restock reminder
                            </a>
                            <a href={reorderCommunityWhatsApp(order)} target="_blank" rel="noreferrer"
                              style={{padding:'6px 12px',fontSize:11,fontWeight:600,color:'#fff',background:'#128C7E',borderRadius:7,textDecoration:'none',whiteSpace:'nowrap'}}>
                              WhatsApp — thank you message
                            </a>
                          </>
                        )}
                        {order.email && (
                          <a href={reorderEmail(order,inStock)} target="_blank" rel="noreferrer"
                            onClick={()=>markContacted(`reorder_${order.id}`,'Email')}
                            style={{padding:'6px 12px',fontSize:11,fontWeight:700,color:'#fff',background:T.blue,borderRadius:7,textDecoration:'none',whiteSpace:'nowrap'}}>
                            Email reminder
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── ORDER TRACKING & REVIEWS ── */}
        {tab==='Order Tracking & Reviews' && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14,flexWrap:'wrap'}}>
              <span style={{fontSize:12,fontWeight:600,color:T.text}}>Month:</span>
              <select value={selectedMonth} onChange={e=>loadMonth(e.target.value)}
                style={{padding:'6px 12px',fontSize:12,border:`1px solid ${T.border}`,borderRadius:7,background:T.bg,color:T.text}}>
                {MONTH_OPTS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              {monthOrders.length > 0 && (
                <div style={{display:'flex',gap:10,fontSize:11}}>
                  <span style={{color:T.green,fontWeight:600}}>{fulfilled.length} fulfilled</span>
                  <span style={{color:T.red,fontWeight:600}}>{unfulfilled.length} unfulfilled</span>
                </div>
              )}
              {unfulfilled.length > 0 && (
                <a href="https://admin.shopify.com/store/cchairandbeauty/orders?status=unfulfilled" target="_blank" rel="noreferrer"
                  style={{padding:'5px 12px',fontSize:11,fontWeight:700,color:'#fff',background:T.red,borderRadius:6,textDecoration:'none'}}>
                  {unfulfilled.length} unfulfilled orders in Shopify
                </a>
              )}
            </div>

            {monthLoading && <div style={{padding:30,textAlign:'center',color:T.textMuted}}>Loading orders...</div>}

            {!monthLoading && monthOrders.length === 0 && (
              <div style={{padding:20,textAlign:'center',color:T.textMuted,background:T.surface,borderRadius:8,border:`0.5px solid ${T.border}`}}>
                Select a month above to load order tracking data
              </div>
            )}

            {!monthLoading && fulfilled.map(order => {
              const isDelivered = delivered[order.id]
              const reviewDone = contacted[`review_${order.id}`]
              const trackUrl = order.trackingUrl || (order.trackingNumber ? `${ROYAL_MAIL_BASE}${order.trackingNumber}` : null)

              return (
                <div key={order.id} style={{
                  background:reviewDone?'#f6fbf7':T.surface,
                  border:`0.5px solid ${T.border}`,
                  borderLeft:`4px solid ${isDelivered?T.green:T.amber}`,
                  borderRadius:8,padding:'12px 14px',marginBottom:7,
                }}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap'}}>
                        <span style={{fontSize:13,fontWeight:700,color:T.text}}>{order.customer}</span>
                        <span style={{fontSize:11,fontWeight:700,color:T.green}}>{order.total}</span>
                        <span style={{fontSize:11,color:T.textMuted}}>{order.name}</span>
                        <span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:4,background:'#dafbe1',color:'#1a7f37'}}>Fulfilled</span>
                        {reviewDone && <span style={{fontSize:10,color:'#1a7f37',background:'#dafbe1',padding:'2px 7px',borderRadius:4,fontWeight:600}}>Review requested</span>}
                      </div>

                      <div style={{fontSize:11,color:T.textMuted,marginBottom:8}}>
                        {order.items?.slice(0,100)}{order.items?.length>100?'...':''}
                      </div>

                      {/* Tracking info — shown on dashboard for staff */}
                      <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,padding:'8px 10px'}}>
                        <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:5}}>Tracking</div>
                        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:6}}>
                          {order.trackingNumber ? (
                            <>
                              <span style={{fontSize:12,fontFamily:'monospace',fontWeight:700,color:T.text,background:T.surface,padding:'3px 8px',borderRadius:4,border:`1px solid ${T.border}`}}>
                                {order.trackingNumber}
                              </span>
                              <button onClick={()=>navigator.clipboard.writeText(order.trackingNumber)}
                                style={{padding:'2px 8px',fontSize:10,fontWeight:600,background:T.surface,color:T.blue,border:`1px solid ${T.border}`,borderRadius:4,cursor:'pointer'}}>
                                Copy
                              </button>
                              <span style={{fontSize:11,color:T.textMuted}}>{order.trackingCompany || 'Royal Mail'}</span>
                              {trackUrl && (
                                <a href={trackUrl} target="_blank" rel="noreferrer"
                                  style={{fontSize:11,fontWeight:600,color:T.blue,textDecoration:'none'}}>
                                  Check delivery status on Royal Mail
                                </a>
                              )}
                            </>
                          ) : (
                            <span style={{fontSize:11,color:T.textMuted}}>No tracking number on this order</span>
                          )}
                        </div>

                        {/* Postcode for Royal Mail login */}
                        {order.postcode && (
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,padding:'5px 8px',background:'#fff8e1',borderRadius:5,border:'1px solid #f0c04040'}}>
                            <span style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase'}}>Postcode:</span>
                            <span style={{fontSize:13,fontFamily:'monospace',fontWeight:700,color:T.text}}>{order.postcode}</span>
                            <button onClick={()=>navigator.clipboard.writeText(order.postcode)}
                              style={{padding:'2px 8px',fontSize:10,fontWeight:600,background:T.surface,color:T.blue,border:`1px solid ${T.border}`,borderRadius:4,cursor:'pointer'}}>
                              Copy
                            </button>
                            <span style={{fontSize:10,color:T.textMuted}}>Use this to log into Royal Mail tracking</span>
                          </div>
                        )}

                        {/* Staff manually confirms delivery */}
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:11,color:T.textMuted}}>Delivery confirmed?</span>
                          {isDelivered ? (
                            <span style={{fontSize:11,fontWeight:700,color:'#1a7f37'}}>Yes — confirmed delivered</span>
                          ) : (
                            <button onClick={()=>markDelivered(order.id)}
                              style={{padding:'4px 12px',fontSize:11,fontWeight:600,background:T.green,color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}}>
                              Mark as delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Review request — only if staff confirmed delivered */}
                    <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0}}>
                      {isDelivered ? (
                        <>
                          {order.phone && (
                            <a href={reviewWhatsApp(order)} target="_blank" rel="noreferrer"
                              onClick={()=>markContacted(`review_${order.id}`,'WhatsApp')}
                              style={{padding:'6px 12px',fontSize:11,fontWeight:700,color:'#fff',background:'#25D366',borderRadius:7,textDecoration:'none',whiteSpace:'nowrap'}}>
                              WhatsApp review request
                            </a>
                          )}
                          {order.email && (
                            <a href={reviewEmail(order)} target="_blank" rel="noreferrer"
                              onClick={()=>markContacted(`review_${order.id}`,'Email')}
                              style={{padding:'6px 12px',fontSize:11,fontWeight:700,color:'#fff',background:'#7c3aed',borderRadius:7,textDecoration:'none',whiteSpace:'nowrap'}}>
                              Email review request
                            </a>
                          )}
                          <a href={TRUSTPILOT} target="_blank" rel="noreferrer"
                            style={{padding:'5px 10px',fontSize:10,color:'#00b67a',textDecoration:'none',textAlign:'center',border:'1px solid #00b67a',borderRadius:5,fontWeight:600}}>
                            View our Trustpilot page
                          </a>
                          <a href={COMMUNITY_BLOG} target="_blank" rel="noreferrer"
                            style={{padding:'5px 10px',fontSize:10,color:T.blue,textDecoration:'none',textAlign:'center',border:`0.5px solid ${T.border}`,borderRadius:5}}>
                            Community blog
                          </a>
                        </>
                      ) : (
                        <div style={{fontSize:11,color:T.textMuted,textAlign:'center',maxWidth:120,lineHeight:1.4}}>
                          Confirm delivery first before sending review request
                        </div>
                      )}
                      <a href={order.adminUrl} target="_blank" rel="noreferrer"
                        style={{padding:'5px 10px',fontSize:11,color:T.blue,background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:6,textDecoration:'none',textAlign:'center'}}>
                        View order
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </Shell>
    </>
  )
}
