import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
        <div style={{fontSize:11,color:T.textMuted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</div>
        <span style={{fontSize:18}}>{icon}</span>
      </div>
      <div style={{fontSize:28,fontWeight:800,color:color||T.text,lineHeight:1,marginBottom:4}}>{value}</div>
      {sub && <div style={{fontSize:11,color:T.textMuted}}>{sub}</div>}
    </div>
  )
}

export default function Performance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Overview')
  const TABS = ['Overview','Revenue','Orders','Top Products','Targets']

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/live-data?source=shopify')
        const d = await r.json()
        if (d.ok) setData(d)
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

  const fmt = n => n >= 1000 ? `£${(n/1000).toFixed(1)}k` : `£${Math.round(n||0)}`
  const adsData = typeof window !== 'undefined' ? (() => { try { return JSON.parse(localStorage.getItem('cc_ads_analysis')||'null') } catch(e) { return null } })() : null

  // Monthly targets
  const monthlyTarget = 12000
  const monthRevenue = data?.month?.revenue || 0
  const targetPct = Math.min(100, Math.round((monthRevenue / monthlyTarget) * 100))
  const targetColor = targetPct >= 90 ? T.green : targetPct >= 70 ? T.amber : T.red

  return (
    <>
      <Head><title>Performance — CC Intelligence</title></Head>
      <Shell title="Performance" subtitle="Live revenue, orders and top products — pulled directly from Shopify">

        {/* Tabs */}
        <div style={{display:'flex',gap:0,borderBottom:`1px solid ${T.border}`,marginBottom:14}}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'7px 14px',fontSize:11,fontWeight:tab===t?600:400,
              color:tab===t?T.blue:T.textMuted,background:'none',border:'none',
              borderBottom:tab===t?`2px solid ${T.blue}`:'2px solid transparent',
              cursor:'pointer',whiteSpace:'nowrap',
            }}>{t}</button>
          ))}
        </div>

        {loading && (
          <div style={{padding:40,textAlign:'center',color:T.textMuted,fontSize:12}}>Loading live Shopify data...</div>
        )}

        {!loading && tab==='Overview' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
              <StatCard label="Today's revenue" value={data?.today?.formatted||'£0'} sub={`${data?.today?.orders||0} orders`} color={T.green} icon="☀️"/>
              <StatCard label="This week" value={data?.week?.formatted||'£0'} sub={`${data?.week?.orders||0} orders`} color={T.blue} icon="📅"/>
              <StatCard label="This month" value={data?.month?.formatted||'£0'} sub={`${data?.month?.orders||0} orders`} color='#7c3aed' icon="📊"/>
              <StatCard label="Abandoned carts" value={data?.abandonedCount||0} sub={`£${data?.abandonedValue||0} at risk`} color={T.red} icon="🛒"/>
            </div>

            {/* Monthly target */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text}}>Monthly revenue target — £{(monthlyTarget/1000).toFixed(0)}k</div>
                <div style={{fontSize:13,fontWeight:800,color:targetColor}}>{targetPct}%</div>
              </div>
              <div style={{height:12,background:T.borderLight,borderRadius:99,overflow:'hidden',marginBottom:6}}>
                <div style={{width:`${targetPct}%`,height:'100%',background:targetColor,borderRadius:99,transition:'width 0.5s'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:T.textMuted}}>
                <span>{fmt(monthRevenue)} achieved</span>
                <span>{fmt(monthlyTarget - monthRevenue)} to go</span>
              </div>
            </div>

            {/* Recent orders */}
            {data?.recentOrders?.length > 0 && (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <div style={{padding:'10px 14px',background:T.bg,borderBottom:`0.5px solid ${T.border}`,fontSize:12,fontWeight:600,color:T.text}}>Recent orders — live from Shopify</div>
                {data.recentOrders.map((o,i) => (
                  <div key={o.id} style={{padding:'9px 14px',borderBottom:i<data.recentOrders.length-1?`0.5px solid ${T.borderLight}`:'none',display:'flex',alignItems:'center',gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>{o.customer||'Guest'} — {o.name}</div>
                      <div style={{fontSize:10,color:T.textMuted}}>{o.items} · {new Date(o.created).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:T.green}}>{o.total}</div>
                    <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:3,
                      background:o.status==='paid'?T.greenBg:T.amberBg,
                      color:o.status==='paid'?T.green:T.amber,textTransform:'uppercase'}}>{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && tab==='Revenue' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
              <StatCard label="Today" value={data?.today?.formatted||'£0'} sub="Live" color={T.green} icon="☀️"/>
              <StatCard label="This week" value={data?.week?.formatted||'£0'} sub="Last 7 days" color={T.blue} icon="📅"/>
              <StatCard label="This month" value={data?.month?.formatted||'£0'} sub="Last 30 days" color='#7c3aed' icon="📊"/>
            </div>

            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Revenue breakdown</div>
              {[
                {label:'Online (Shopify)', value: data?.month?.formatted||'£0', pct:65, color:T.blue},
                {label:'In-store (estimated)', value: fmt((data?.month?.revenue||0)*0.54), pct:35, color:T.green},
              ].map((r,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                    <span style={{color:T.text}}>{r.label}</span>
                    <span style={{color:r.color,fontWeight:700}}>{r.value} ({r.pct}% est.)</span>
                  </div>
                  <div style={{height:6,background:T.borderLight,borderRadius:99,overflow:'hidden'}}>
                    <div style={{width:`${r.pct}%`,height:'100%',background:r.color,borderRadius:99}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Ads performance from last audit */}
            {adsData && (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Google Ads — from last audit</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {[
                    {label:'Total ad spend',value:adsData.totalSpend||'—',color:T.blue},
                    {label:'Conversions',value:adsData.totalConversions||'—',color:T.green},
                    {label:'Wasted spend',value:adsData.wastedSpend||'—',color:T.red},
                  ].map((m,i)=>(
                    <div key={i} style={{background:T.bg,borderRadius:6,padding:'10px',textAlign:'center'}}>
                      <div style={{fontSize:10,color:T.textMuted,marginBottom:4}}>{m.label}</div>
                      <div style={{fontSize:16,fontWeight:700,color:m.color}}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && tab==='Orders' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
              <StatCard label="Today" value={data?.today?.orders||0} sub="orders" color={T.green} icon="📦"/>
              <StatCard label="This week" value={data?.week?.orders||0} sub="orders" color={T.blue} icon="📅"/>
              <StatCard label="This month" value={data?.month?.orders||0} sub="orders" color='#7c3aed' icon="📊"/>
            </div>

            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Order metrics</div>
              {[
                {label:'Average order value (this month)', value: data?.month?.orders>0 ? fmt((data.month.revenue||0)/data.month.orders) : '—'},
                {label:'Average order value (this week)', value: data?.week?.orders>0 ? fmt((data.week.revenue||0)/data.week.orders) : '—'},
                {label:'Abandoned carts today', value: `${data?.abandonedCount||0} carts (£${data?.abandonedValue||0})`},
              ].map((m,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:i<2?`0.5px solid ${T.borderLight}`:'none'}}>
                  <span style={{fontSize:11,color:T.textMuted}}>{m.label}</span>
                  <span style={{fontSize:12,fontWeight:700,color:T.text}}>{m.value}</span>
                </div>
              ))}
            </div>

            {/* Order targets */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Daily order targets</div>
              {[
                {label:'Orders per day target', target:15, actual: data?.today?.orders||0},
                {label:'Orders per week target', target:100, actual: data?.week?.orders||0},
                {label:'Orders per month target', target:430, actual: data?.month?.orders||0},
              ].map((t,i)=>{
                const pct = Math.min(100,Math.round((t.actual/t.target)*100))
                const c = pct>=90?T.green:pct>=70?T.amber:T.red
                return (
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                      <span style={{color:T.text}}>{t.label}</span>
                      <span style={{color:c,fontWeight:700}}>{t.actual} / {t.target} ({pct}%)</span>
                    </div>
                    <div style={{height:6,background:T.borderLight,borderRadius:99,overflow:'hidden'}}>
                      <div style={{width:`${pct}%`,height:'100%',background:c,borderRadius:99}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loading && tab==='Top Products' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:6}}>Top selling products</div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:10}}>Pulled from your most recent orders — top products by revenue this month</div>
              {data?.recentOrders?.length > 0 ? (
                // Group line items from recent orders
                (() => {
                  const items = {}
                  data.recentOrders.forEach(o => {
                    if (o.items) {
                      items[o.items] = (items[o.items]||0) + 1
                    }
                  })
                  return Object.entries(items).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,count],i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:`0.5px solid ${T.borderLight}`}}>
                      <div style={{width:22,height:22,borderRadius:'50%',background:i<3?T.green:T.blue,color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                      <div style={{flex:1,fontSize:12,color:T.text}}>{name}</div>
                      <div style={{fontSize:11,fontWeight:600,color:T.green}}>{count} sold</div>
                    </div>
                  ))
                })()
              ) : (
                <div style={{fontSize:11,color:T.textMuted,padding:'20px 0',textAlign:'center'}}>
                  Full product analytics require Shopify Analytics API — showing recent order items above
                </div>
              )}
            </div>
            <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontSize:11,fontWeight:700,color:T.amber,marginBottom:4}}>To get full top products by revenue</div>
              <div style={{fontSize:11,color:T.text,lineHeight:1.6}}>Go to Shopify Admin → Analytics → Reports → Sales by product. This gives you the full breakdown by revenue, units sold and margin. The platform shows recent order items as an approximation.</div>
            </div>
          </div>
        )}

        {!loading && tab==='Targets' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:12}}>2026 targets — track progress</div>
              {[
                {label:'Monthly revenue target', target:'£12,000', current:data?.month?.formatted||'—', achieved:targetPct, color:targetColor},
                {label:'Organic traffic growth', target:'+40% vs 2025', current:'Needs Search Console', achieved:0, color:T.textMuted},
                {label:'Google Ads ROAS', target:'3x minimum', current:adsData?.overallRoas||'Upload CSV', achieved:0, color:T.textMuted},
                {label:'GBP reviews per branch', target:'100+ reviews', current:'Check Google Maps', achieved:0, color:T.textMuted},
                {label:'Blog posts published', target:'4 per month', current:'Track in Blog Planner', achieved:0, color:T.textMuted},
                {label:'B2B trade accounts', target:'10 active', current:'0 so far', achieved:0, color:T.textMuted},
              ].map((t,i)=>(
                <div key={i} style={{padding:'10px 0',borderBottom:i<5?`0.5px solid ${T.borderLight}`:'none'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:T.text}}>{t.label}</span>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:11,color:T.textMuted}}>Target: {t.target}</div>
                      <div style={{fontSize:11,color:t.color,fontWeight:600}}>Current: {t.current}</div>
                    </div>
                  </div>
                  {t.achieved > 0 && (
                    <div style={{height:4,background:T.borderLight,borderRadius:99,overflow:'hidden'}}>
                      <div style={{width:`${t.achieved}%`,height:'100%',background:t.color,borderRadius:99}}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </Shell>
    </>
  )
}
