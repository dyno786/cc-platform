import Head from 'next/head'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8',
}

export default function AbandonedCartsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [section, setSection] = useState('carts')
  const [sent, setSent] = useState({})
  const [sending, setSending] = useState({})

  useEffect(() => {
    fetch('/api/abandoned-carts')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  function markSent(id, type) {
    setSent(p => ({ ...p, [`${id}_${type}`]: true }))
  }

  function urgencyColor(hours) {
    if (hours < 6)  return C.red
    if (hours < 24) return C.amber
    return C.text3
  }

  function urgencyLabel(hours) {
    if (hours < 1)  return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.round(hours/24)}d ago`
  }

  return (
    <>
      <Head>
        <title>Abandoned Carts — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button,a{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      {/* Header */}
      <div style={{background:C.surface,borderBottom:'1px solid '+C.border,padding:'0 20px',display:'flex',alignItems:'center',height:52,gap:16,position:'sticky',top:0,zIndex:100}}>
        <Link href="/" style={{color:C.text2,textDecoration:'none',fontSize:13}}>← Dashboard</Link>
        <span style={{color:C.border}}>|</span>
        <span style={{fontWeight:700,fontSize:14}}>🛒 Abandoned Carts &amp; Retention</span>
        {data && <span style={{background:C.red+'20',color:C.red,padding:'2px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>{data.totalAbandoned} carts · {data.totalAbandonedValue}</span>}
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          <button onClick={()=>setSection('carts')} style={{padding:'5px 14px',borderRadius:6,border:section==='carts'?'none':'1px solid '+C.border,background:section==='carts'?C.accent:C.surface2,color:C.text,cursor:'pointer',fontSize:12}}>
            🛒 Abandoned Carts
          </button>
          <button onClick={()=>setSection('reviews')} style={{padding:'5px 14px',borderRadius:6,border:section==='reviews'?'none':'1px solid '+C.border,background:section==='reviews'?C.accent:C.surface2,color:C.text,cursor:'pointer',fontSize:12}}>
            ⭐ Review Requests
          </button>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:20}}>

        {loading && (
          <div style={{textAlign:'center',padding:60,color:C.text3}}>
            <div style={{fontSize:32,marginBottom:12}}>⟳</div>
            <div>Loading from Shopify...</div>
          </div>
        )}

        {error && (
          <div style={{background:'rgba(239,68,68,.08)',border:'1px solid '+C.red+'30',borderRadius:12,padding:16,color:C.red}}>
            Failed to load: {error}
          </div>
        )}

        {/* ── ABANDONED CARTS ── */}
        {data && section === 'carts' && (
          <div>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
              <div style={{background:C.surface,border:'1px solid '+C.red+'30',borderRadius:12,padding:16}}>
                <div style={{fontSize:32,fontWeight:800,color:C.red}}>{data.totalAbandoned}</div>
                <div style={{color:C.text2,fontSize:13,marginTop:4}}>Abandoned carts (7 days)</div>
              </div>
              <div style={{background:C.surface,border:'1px solid '+C.amber+'30',borderRadius:12,padding:16}}>
                <div style={{fontSize:32,fontWeight:800,color:C.amber}}>{data.totalAbandonedValue}</div>
                <div style={{color:C.text2,fontSize:13,marginTop:4}}>Total abandoned value</div>
              </div>
              <div style={{background:C.surface,border:'1px solid '+C.green+'30',borderRadius:12,padding:16}}>
                <div style={{fontSize:32,fontWeight:800,color:C.green}}>~30%</div>
                <div style={{color:C.text2,fontSize:13,marginTop:4}}>Avg WhatsApp recovery rate</div>
              </div>
            </div>

            <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:C.accent2}}>
              Connected to <strong>abandoned-cart-theta.vercel.app</strong> · WhatsApp Business API active
            </div>

            <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:12}}>
              Abandoned carts — WhatsApp &amp; Email recovery
            </div>

            {data.abandonedCarts.length === 0 ? (
              <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:60,textAlign:'center',color:C.text3}}>
                <div style={{fontSize:40,marginBottom:12}}>🎉</div>
                <div style={{fontSize:16}}>No abandoned carts in the last 7 days</div>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {data.abandonedCarts.map(cart => {
                  const waSent   = sent[`${cart.id}_wa`]
                  const emSent   = sent[`${cart.id}_em`]
                  const uc       = urgencyColor(cart.abandonedHoursAgo)
                  return (
                    <div key={cart.id} style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16,display:'flex',alignItems:'center',gap:16}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
                          <span style={{fontWeight:700,color:C.text,fontSize:15}}>{cart.customer}</span>
                          <span style={{background:uc+'20',color:uc,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700}}>
                            {urgencyLabel(cart.abandonedHoursAgo)}
                          </span>
                          <span style={{fontWeight:800,color:C.green,fontSize:16}}>{cart.total}</span>
                          <span style={{color:C.text3,fontSize:12}}>{cart.itemCount} item{cart.itemCount!==1?'s':''}</span>
                        </div>
                        <div style={{color:C.text2,fontSize:13,marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cart.items}</div>
                        <div style={{color:C.text3,fontSize:12}}>{cart.email}</div>
                      </div>
                      <div style={{display:'flex',gap:8,flexShrink:0}}>
                        <button
                          onClick={() => markSent(cart.id,'wa')}
                          disabled={waSent}
                          style={{padding:'9px 18px',borderRadius:8,border:'none',background:waSent?C.green+'20':C.green,color:waSent?C.green:'#000',fontWeight:700,fontSize:13,cursor:waSent?'default':'pointer',transition:'all .15s'}}
                        >
                          {waSent ? '✓ Sent' : '📱 WhatsApp'}
                        </button>
                        <button
                          onClick={() => markSent(cart.id,'em')}
                          disabled={emSent}
                          style={{padding:'9px 18px',borderRadius:8,border:'1px solid '+C.border,background:emSent?C.blue+'20':C.surface2,color:emSent?C.blue:C.text,fontWeight:600,fontSize:13,cursor:emSent?'default':'pointer'}}
                        >
                          {emSent ? '✓ Sent' : '✉️ Email'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEW REQUESTS ── */}
        {data && section === 'reviews' && (
          <div>
            <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:C.accent2}}>
              Customers with orders delivered 7+ days ago — eligible for Trustpilot &amp; Google review requests
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
              <div style={{background:C.surface,border:'1px solid '+C.green+'30',borderRadius:12,padding:16}}>
                <div style={{fontSize:32,fontWeight:800,color:C.green}}>{data.reviewEligible.length}</div>
                <div style={{color:C.text2,fontSize:13,marginTop:4}}>Eligible for review request</div>
              </div>
              <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16}}>
                <div style={{fontSize:32,fontWeight:800,color:C.text}}>3.8★</div>
                <div style={{color:C.text2,fontSize:13,marginTop:4}}>Current avg Google rating</div>
              </div>
              <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16}}>
                <div style={{fontSize:32,fontWeight:800,color:C.amber}}>220</div>
                <div style={{color:C.text2,fontSize:13,marginTop:4}}>Total Google reviews</div>
              </div>
            </div>

            <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:12}}>
              Post-purchase review requests ({data.reviewEligible.length} eligible)
            </div>

            {data.reviewEligible.length === 0 ? (
              <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:60,textAlign:'center',color:C.text3}}>
                <div style={{fontSize:40,marginBottom:12}}>⏳</div>
                <div>No orders eligible yet — customers need 7+ days since delivery</div>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {data.reviewEligible.map(order => {
                  const tpSent = sent[`${order.id}_tp`]
                  const gSent  = sent[`${order.id}_g`]
                  return (
                    <div key={order.id} style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16,display:'flex',alignItems:'center',gap:16}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                          <span style={{fontWeight:700,color:C.text,fontSize:14}}>{order.customer}</span>
                          <span style={{color:C.text3,fontSize:12}}>{order.name}</span>
                          <span style={{fontWeight:600,color:C.text,fontSize:13}}>{order.total}</span>
                        </div>
                        <div style={{color:C.text3,fontSize:12}}>
                          Delivered {order.daysSinceFulfilled} days ago · {order.email}
                        </div>
                      </div>
                      <div style={{display:'flex',gap:8,flexShrink:0}}>
                        <button
                          onClick={() => markSent(order.id,'tp')}
                          disabled={tpSent}
                          style={{padding:'8px 14px',borderRadius:7,border:'none',background:tpSent?C.green+'20':C.green,color:tpSent?C.green:'#000',fontWeight:700,fontSize:12,cursor:tpSent?'default':'pointer'}}
                        >
                          {tpSent ? '✓ Sent' : '★ Trustpilot'}
                        </button>
                        <button
                          onClick={() => markSent(order.id,'g')}
                          disabled={gSent}
                          style={{padding:'8px 14px',borderRadius:7,border:'1px solid '+C.border,background:gSent?C.blue+'20':C.surface2,color:gSent?C.blue:C.text,fontWeight:600,fontSize:12,cursor:gSent?'default':'pointer'}}
                        >
                          {gSent ? '✓ Sent' : 'G Google'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
