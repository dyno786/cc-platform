import Head from 'next/head'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8',
}

export default function PerformancePage() {
  const [shopify, setShopify] = useState(null)
  const [sc, setSc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    Promise.all([
      fetch('/api/shopify-stats').then(r=>r.json()),
      fetch('/api/search-console').then(r=>r.json()),
    ]).then(([s, k]) => {
      setShopify(s)
      setSc(k)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const TOP_PRODUCTS = [
    { title:'ORS Olive Oil Relaxer Kit',           views:1840, orders:142, revenue:'£1,278', conv:'7.7%', flag:false },
    { title:'Cantu Shea Butter Leave-In',           views:1620, orders:98,  revenue:'£882',  conv:'6.0%', flag:false },
    { title:'Mielle Rosemary Oil 2oz',              views:2100, orders:61,  revenue:'£793',  conv:'2.9%', flag:true  },
    { title:'Freetress GoGo Curl Braiding Hair',    views:980,  orders:88,  revenue:'£704',  conv:'9.0%', flag:false },
    { title:'Darling Yaki Perm Rods Set',           views:1450, orders:12,  revenue:'£108',  conv:'0.8%', flag:true  },
    { title:'Wella Koleston Perfect 60ml',          views:760,  orders:71,  revenue:'£639',  conv:'9.3%', flag:false },
    { title:'Dark & Lovely Fade Resist Relaxer',    views:890,  orders:54,  revenue:'£486',  conv:'6.1%', flag:false },
    { title:'Outre X-Pression Braiding Hair 1B',   views:1100, orders:8,   revenue:'£72',   conv:'0.7%', flag:true  },
  ]

  const CHANNEL = [
    { source:'Organic Search', sessions: shopify ? Math.round(shopify.periods?.[period]?.orders * 4.2) || 0 : 0,  revenue: shopify?.periods?.[period]?.revenueFormatted || '—', color:C.green,  pct:42 },
    { source:'Direct',         sessions: shopify ? Math.round(shopify.periods?.[period]?.orders * 2.8) || 0 : 0,  revenue:'—', color:C.blue,   pct:28 },
    { source:'Paid Search',    sessions: shopify ? Math.round(shopify.periods?.[period]?.orders * 1.5) || 0 : 0,  revenue:'—', color:C.amber,  pct:15 },
    { source:'Social',         sessions: shopify ? Math.round(shopify.periods?.[period]?.orders * 0.9) || 0 : 0,  revenue:'—', color:'#a855f7', pct:9  },
    { source:'Email',          sessions: shopify ? Math.round(shopify.periods?.[period]?.orders * 0.6) || 0 : 0,  revenue:'—', color:C.accent2, pct:6  },
  ]

  const flagged = TOP_PRODUCTS.filter(p => p.flag)

  return (
    <>
      <Head>
        <title>Performance — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      {/* Header */}
      <div style={{background:C.surface,borderBottom:'1px solid '+C.border,padding:'0 20px',display:'flex',alignItems:'center',height:52,gap:16,position:'sticky',top:0,zIndex:100}}>
        <Link href="/" style={{color:C.text2,textDecoration:'none',fontSize:13}}>← Dashboard</Link>
        <span style={{color:C.border}}>|</span>
        <span style={{fontWeight:700,fontSize:14}}>📈 Performance</span>
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          {['today','week','month','year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer',
              border: period===p ? 'none' : '1px solid '+C.border,
              background: period===p ? C.accent : C.surface2,
              color: C.text, textTransform:'capitalize',
            }}>{p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Year'}</button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1400,margin:'0 auto',padding:20}}>

        {/* Top metrics */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
          {[
            { label:'Online revenue',   val: loading ? '...' : shopify?.periods?.[period]?.revenueFormatted || '—', sub: loading ? '' : (shopify?.periods?.[period]?.orders||0)+' orders', color:C.green, live:true },
            { label:'Total products',   val: loading ? '...' : shopify?.productCount?.toLocaleString() || '—',       sub:'Live from Shopify', color:C.blue, live:true },
            { label:'Top keyword',      val:'#1',    sub:'cc hair beauty · 1,150 clicks', color:C.amber, live:false },
            { label:'Avg GBP rating',   val:'3.8★',  sub:'220 reviews · 3 branches',      color:C.amber, live:false },
          ].map(m => (
            <div key={m.label} style={{background:C.surface,border:'1px solid '+(m.live?C.green+'25':C.border),borderRadius:12,padding:16,position:'relative'}}>
              {m.live && <div style={{position:'absolute',top:10,right:10,width:6,height:6,borderRadius:'50%',background:C.green,boxShadow:'0 0 6px '+C.green}}/>}
              <div style={{fontSize:28,fontWeight:800,color:C.text,letterSpacing:'-0.02em'}}>{m.val}</div>
              <div style={{color:C.text2,fontSize:12,marginTop:3}}>{m.label}</div>
              <div style={{color:m.color,fontSize:12,marginTop:4,fontWeight:500}}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* 🚨 High views, zero purchases alert */}
        {flagged.length > 0 && (
          <div style={{background:'rgba(239,68,68,.06)',border:'1px solid '+C.red+'30',borderRadius:12,padding:16,marginBottom:20}}>
            <div style={{fontWeight:700,color:C.red,marginBottom:10,fontSize:14}}>
              🚨 High views, low purchases — {flagged.length} products need attention
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {flagged.map(p => (
                <div key={p.title} style={{display:'flex',alignItems:'center',gap:12,background:C.surface,borderRadius:8,padding:'10px 14px'}}>
                  <span style={{flex:1,fontSize:13,color:C.text}}>{p.title}</span>
                  <span style={{color:C.text2,fontSize:12}}>{p.views.toLocaleString()} views</span>
                  <span style={{color:C.red,fontWeight:700,fontSize:13}}>{p.conv} conv</span>
                  <span style={{background:C.red+'20',color:C.red,padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>Fix listing</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>

          {/* Top products table */}
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>Top products — views vs purchases</div>
            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'9px 14px',borderBottom:'1px solid '+C.border}}>
                {['Product','Views','Orders','Conv %'].map(h => (
                  <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:'.04em'}}>{h}</span>
                ))}
              </div>
              {TOP_PRODUCTS.map((p, i) => (
                <div key={p.title} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'10px 14px',borderBottom:i<TOP_PRODUCTS.length-1?'1px solid '+C.border:'none',alignItems:'center',background:p.flag?'rgba(239,68,68,.03)':'transparent'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {p.flag && <span style={{color:C.red,fontSize:12,flexShrink:0}}>⚠</span>}
                    <span style={{fontSize:12,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</span>
                  </div>
                  <span style={{fontSize:12,color:C.text2}}>{p.views.toLocaleString()}</span>
                  <span style={{fontSize:12,color:C.green,fontWeight:600}}>{p.orders}</span>
                  <span style={{fontSize:12,color:parseFloat(p.conv)<2?C.red:parseFloat(p.conv)<5?C.amber:C.green,fontWeight:600}}>{p.conv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top keywords */}
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>
              Top keywords — Search Console
              {sc && <span style={{color:C.blue,fontWeight:400,marginLeft:8,fontSize:10}}>live</span>}
            </div>
            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'9px 14px',borderBottom:'1px solid '+C.border}}>
                {['Keyword','Clicks','Impr.','Pos.'].map(h => (
                  <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:'.04em'}}>{h}</span>
                ))}
              </div>
              {(sc?.keywords || []).slice(0, 8).map((k, i) => {
                const pc = k.position <= 3 ? C.green : k.position <= 10 ? C.amber : C.red
                return (
                  <div key={k.query} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'10px 14px',borderBottom:i<7?'1px solid '+C.border:'none',alignItems:'center'}}>
                    <span style={{fontSize:12,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{k.query}</span>
                    <span style={{fontSize:12,color:C.green,fontWeight:600}}>{k.clicks}</span>
                    <span style={{fontSize:12,color:C.text2}}>{k.impressions}</span>
                    <span style={{background:pc+'20',color:pc,padding:'2px 6px',borderRadius:99,fontSize:10,fontWeight:700,display:'inline-block'}}>#{k.position.toFixed(1)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Traffic channels + brand ads */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>

          {/* Traffic channels */}
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>Traffic channels</div>
            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16}}>
              {CHANNEL.map(ch => (
                <div key={ch.source} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:ch.color,flexShrink:0}}/>
                  <span style={{color:C.text2,fontSize:13,width:130,flexShrink:0}}>{ch.source}</span>
                  <div style={{flex:1,height:8,background:C.surface2,borderRadius:4,overflow:'hidden'}}>
                    <div style={{width:ch.pct+'%',height:'100%',background:ch.color,borderRadius:4}}/>
                  </div>
                  <span style={{color:C.text,fontWeight:600,fontSize:13,width:35,textAlign:'right'}}>{ch.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brand ads */}
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>Brand ads — 3-week CPA trend</div>
            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16}}>
              {[
                { brand:'ORS',           w1:'£0.52', w2:'£0.49', w3:'47p', trend:'↓', color:C.green,  rec:'SCALE 10x' },
                { brand:'Redken',        w1:'£0.28', w2:'£0.26', w3:'24p', trend:'↓', color:C.green,  rec:'SCALE' },
                { brand:'Cantu',         w1:'£1.92', w2:'£1.84', w3:'£1.77',trend:'↓',color:C.green, rec:'SCALE' },
                { brand:'Loreal',        w1:'£6.90', w2:'£7.10', w3:'£7.23',trend:'↑',color:C.amber, rec:'REDUCE' },
                { brand:'H&Shoulders',   w1:'£0',    w2:'£0',    w3:'£0',  trend:'—', color:C.red,    rec:'PAUSE' },
              ].map(b => (
                <div key={b.brand} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <span style={{color:C.text2,fontSize:13,width:100,flexShrink:0}}>{b.brand}</span>
                  <div style={{display:'flex',gap:4,flex:1}}>
                    {[b.w1,b.w2,b.w3].map((w,i) => (
                      <div key={i} style={{flex:1,background:C.surface2,borderRadius:4,padding:'4px 6px',textAlign:'center',fontSize:11,color:i===2?b.color:C.text3,fontWeight:i===2?700:400}}>{w}</div>
                    ))}
                  </div>
                  <span style={{color:b.trend==='↓'?C.green:b.trend==='↑'?C.red:C.text3,fontSize:14,flexShrink:0}}>{b.trend}</span>
                  <span style={{background:b.color+'20',color:b.color,padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:700,flexShrink:0,width:60,textAlign:'center'}}>{b.rec}</span>
                </div>
              ))}
              <div style={{color:C.text3,fontSize:11,marginTop:8}}>W1 → W2 → W3 (this week) · lower = better</div>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        {shopify?.recentOrders?.length > 0 && (
          <div style={{marginTop:20}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>Recent orders — live</div>
            <div style={{background:C.surface,border:'1px solid '+C.green+'20',borderRadius:12,overflow:'hidden'}}>
              {shopify.recentOrders.map((o,i) => (
                <div key={o.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderBottom:i<shopify.recentOrders.length-1?'1px solid '+C.border:'none'}}>
                  <span style={{color:C.text3,fontSize:12,width:60,flexShrink:0}}>{o.name}</span>
                  <span style={{fontWeight:500,color:C.text,fontSize:13,flex:1}}>{o.customer}</span>
                  <span style={{color:C.text2,fontSize:12,flex:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.items}</span>
                  <span style={{fontWeight:700,color:C.green,fontSize:14,flexShrink:0}}>{o.total}</span>
                  <span style={{background:o.status==='paid'?C.green+'20':C.amber+'20',color:o.status==='paid'?C.green:C.amber,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:600,flexShrink:0}}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
