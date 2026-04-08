import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

function fmt(n) { return n >= 1000 ? `£${(n/1000).toFixed(1)}k` : `£${n.toFixed(0)}` }
function pct(a, b) {
  if (!b) return null
  const d = ((a - b) / b * 100)
  return { val: Math.abs(d).toFixed(1), up: d >= 0 }
}

function StatCard({ label, value, sub, color, change }) {
  return (
    <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px'}}>
      <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',fontWeight:600,marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:color||T.text}}>{value}</div>
      {change && (
        <div style={{fontSize:11,fontWeight:600,color:change.up?T.green:T.red,marginTop:2}}>
          {change.up?'↑':'↓'} {change.val}% vs last month
        </div>
      )}
      {sub && <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{sub}</div>}
    </div>
  )
}

function MiniBar({ label, value, max, color }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
        <span style={{color:T.text,fontWeight:500}}>{label}</span>
        <span style={{color:color||T.green,fontWeight:700}}>{fmt(value)}</span>
      </div>
      <div style={{height:5,background:T.borderLight,borderRadius:99,overflow:'hidden'}}>
        <div style={{width:`${pct}%`,height:'100%',background:color||T.green,borderRadius:99}}/>
      </div>
    </div>
  )
}

export default function Performance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Overview')

  useEffect(() => {
    async function load() {
      try {
        const [shopify, sc] = await Promise.all([
          fetch('/api/live-data?source=shopify').then(r => r.json()),
          fetch('/api/live-data?source=searchconsole').then(r => r.json()),
        ])
        setData({ shopify, sc })
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

  const s = data?.shopify
  const sc = data?.sc

  const TABS = ['Overview', 'Revenue', 'Orders', 'SEO Performance', 'Conversion']

  if (loading) return (
    <Shell title="Performance" subtitle="Loading live data...">
      <div style={{padding:60,textAlign:'center',color:T.textMuted}}>Loading performance data...</div>
    </Shell>
  )

  return (
    <>
      <Head><title>Performance — CC Intelligence</title></Head>
      <Shell title="Performance Dashboard" subtitle="Live Shopify + Search Console data — revenue, orders, SEO, conversion">

        {/* Live badge */}
        <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:7,padding:'7px 13px',marginBottom:14,fontSize:11,color:T.green,display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:T.green}}/>
          Live data — Shopify + Google Search Console
          <span style={{marginLeft:'auto',color:T.textMuted}}>{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</span>
        </div>

        {/* Top stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:16}}>
          <StatCard label="Today's Revenue" value={s?.today?.formatted||'—'} color={T.green}
            sub={`${s?.today?.orders||0} orders today`}/>
          <StatCard label="This Week" value={s?.week?.formatted||'—'} color={T.blue}
            sub={`${s?.week?.orders||0} orders`}/>
          <StatCard label="This Month" value={s?.month?.formatted||'—'} color='#7c3aed'
            sub={`${s?.month?.orders||0} orders`}/>
          <StatCard label="Products Live" value={s?.productCount?.toLocaleString()||'—'}
            sub="on Shopify store"/>
          <StatCard label="Abandoned Carts" value={s?.abandonedCount||0}
            color={T.amber} sub={`£${s?.abandonedValue||0} at risk`}/>
        </div>

        {/* SEO top stats */}
        {sc?.ok && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
            <StatCard label="Google Clicks (90d)" value={sc.totals?.clicks?.toLocaleString()||'—'} color={T.blue}/>
            <StatCard label="Impressions (90d)" value={sc.totals?.impressions?.toLocaleString()||'—'} color={T.textMuted}/>
            <StatCard label="Avg Position" value={sc.totals?.avgPosition||'—'}
              color={parseFloat(sc.totals?.avgPosition)<=5?T.green:T.amber}/>
            <StatCard label="Avg CTR" value={sc.totals?.avgCtr||'—'}
              color={parseFloat(sc.totals?.avgCtr)>=3?T.green:T.amber}/>
          </div>
        )}

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:14,borderBottom:`1px solid ${T.border}`}}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'7px 14px',fontSize:12,fontWeight:600,border:'none',background:'none',
              borderBottom:tab===t?`2px solid ${T.blue}`:'2px solid transparent',
              color:tab===t?T.blue:T.textMuted,cursor:'pointer',whiteSpace:'nowrap',
            }}>{t}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab==='Overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {/* Recent orders */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
              <div style={{padding:'10px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:12,fontWeight:600,color:T.text}}>
                Recent orders today
              </div>
              {(s?.recentOrders||[]).length === 0 && (
                <div style={{padding:20,textAlign:'center',color:T.textMuted,fontSize:12}}>No orders yet today</div>
              )}
              {(s?.recentOrders||[]).map((o,i) => (
                <div key={i} style={{padding:'9px 14px',borderBottom:`0.5px solid ${T.borderLight}`,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.text}}>{o.customer||'Customer'}</div>
                    <div style={{fontSize:10,color:T.textMuted,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{o.items}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.green}}>{o.total}</div>
                    <div style={{fontSize:10,color:o.status==='paid'?T.green:T.amber}}>{o.status}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top keywords */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
              <div style={{padding:'10px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:12,fontWeight:600,color:T.text}}>
                Top keywords driving traffic
              </div>
              <div style={{padding:'10px 14px'}}>
                {(sc?.keywords||[]).slice(0,8).map((k,i) => (
                  <MiniBar key={i} label={k.query}
                    value={k.clicks} max={sc.keywords[0]?.clicks||1}
                    color={i===0?T.blue:i<3?T.green:T.amber}/>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{gridColumn:'span 2',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
              {[
                {label:'View abandoned carts', sub:`${s?.abandonedCount||0} carts`, href:'/abandoned-carts', color:T.red},
                {label:'Fix low CTR pages', sub:`${sc?.lowCtrPages?.length||0} pages need fixing`, href:'/organic-seo', color:T.amber},
                {label:'Publish content gaps', sub:`${sc?.contentGaps?.length||0} opportunities`, href:'/organic-seo', color:T.blue},
                {label:'Request reviews', sub:'3 branches', href:'/local-seo', color:T.green},
              ].map((a,i) => (
                <a key={i} href={a.href} style={{
                  display:'block',padding:'12px 14px',background:T.surface,
                  border:`0.5px solid ${T.border}`,borderLeft:`4px solid ${a.color}`,
                  borderRadius:8,textDecoration:'none',
                }}>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:3}}>{a.label}</div>
                  <div style={{fontSize:11,color:a.color,fontWeight:600}}>{a.sub}</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* REVENUE */}
        {tab==='Revenue' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
              {[
                {label:'Today', value:s?.today?.formatted, orders:s?.today?.orders},
                {label:'This Week', value:s?.week?.formatted, orders:s?.week?.orders},
                {label:'This Month', value:s?.month?.formatted, orders:s?.month?.orders},
              ].map((r,i) => (
                <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'16px 18px',textAlign:'center'}}>
                  <div style={{fontSize:12,color:T.textMuted,fontWeight:600,marginBottom:6}}>{r.label}</div>
                  <div style={{fontSize:28,fontWeight:800,color:T.green,marginBottom:4}}>{r.value||'£0'}</div>
                  <div style={{fontSize:12,color:T.textMuted}}>{r.orders||0} orders</div>
                  {r.orders > 0 && (
                    <div style={{fontSize:11,color:T.blue,marginTop:4}}>
                      Avg order: {fmt((parseFloat((r.value||'0').replace('£','').replace('k','000')) / r.orders))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>Revenue targets</div>
              {[
                {label:'Daily target', target:500, actual:s?.today?.revenue||0},
                {label:'Weekly target', target:3500, actual:s?.week?.revenue||0},
                {label:'Monthly target', target:15000, actual:s?.month?.revenue||0},
              ].map((r,i) => {
                const pctVal = Math.min(100,(r.actual/r.target)*100)
                return (
                  <div key={i} style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}>
                      <span style={{color:T.text,fontWeight:600}}>{r.label}</span>
                      <span style={{color:T.textMuted}}>£{r.actual.toFixed(0)} / £{r.target.toLocaleString()}</span>
                    </div>
                    <div style={{height:8,background:T.borderLight,borderRadius:99,overflow:'hidden'}}>
                      <div style={{width:`${pctVal}%`,height:'100%',background:pctVal>=100?T.green:pctVal>=70?T.amber:T.red,borderRadius:99,transition:'width 0.5s'}}/>
                    </div>
                    <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{pctVal.toFixed(0)}% of target</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab==='Orders' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>Order summary</div>
                {[
                  {label:'Today', value:s?.today?.orders||0, color:T.green},
                  {label:'This week', value:s?.week?.orders||0, color:T.blue},
                  {label:'This month', value:s?.month?.orders||0, color:'#7c3aed'},
                  {label:'Abandoned carts', value:s?.abandonedCount||0, color:T.red},
                ].map((r,i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`0.5px solid ${T.borderLight}`}}>
                    <span style={{fontSize:12,color:T.text}}>{r.label}</span>
                    <span style={{fontSize:14,fontWeight:700,color:r.color}}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>Recent orders</div>
                {(s?.recentOrders||[]).map((o,i) => (
                  <div key={i} style={{padding:'6px 0',borderBottom:`0.5px solid ${T.borderLight}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                      <span style={{fontSize:12,fontWeight:600,color:T.text}}>{o.customer||'Customer'}</span>
                      <span style={{fontSize:12,fontWeight:700,color:T.green}}>{o.total}</span>
                    </div>
                    <div style={{fontSize:10,color:T.textMuted}}>{o.items?.slice(0,50)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEO PERFORMANCE */}
        {tab==='SEO Performance' && sc?.ok && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
              {/* Quick wins */}
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <div style={{padding:'10px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:600,color:T.text}}>Quick wins — keywords just off page 1</span>
                  <a href="/organic-seo" style={{fontSize:11,color:T.blue,textDecoration:'none'}}>Fix all →</a>
                </div>
                {(sc?.quickWins||[]).slice(0,6).map((k,i) => (
                  <div key={i} style={{padding:'8px 14px',borderBottom:`0.5px solid ${T.borderLight}`,display:'flex',alignItems:'center',gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:600,color:T.text}}>{k.query}</div>
                      <div style={{fontSize:10,color:T.textMuted}}>{k.impressions?.toLocaleString()} impressions · {k.ctrStr} CTR</div>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:k.position<=10?T.amber:T.red}}>pos {k.position}</span>
                  </div>
                ))}
              </div>
              {/* Low CTR pages */}
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <div style={{padding:'10px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:600,color:T.text}}>Pages losing clicks — low CTR</span>
                  <a href="/website-seo" style={{fontSize:11,color:T.blue,textDecoration:'none'}}>Fix SEO →</a>
                </div>
                {(sc?.lowCtrPages||[]).slice(0,6).map((p,i) => (
                  <div key={i} style={{padding:'8px 14px',borderBottom:`0.5px solid ${T.borderLight}`,display:'flex',alignItems:'center',gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:600,color:T.text}}>{p.page?.split('/').pop()?.replace(/-/g,' ')||'Homepage'}</div>
                      <div style={{fontSize:10,color:T.textMuted}}>{p.impressions?.toLocaleString()} impressions</div>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:T.red}}>{p.ctrStr}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONVERSION */}
        {tab==='Conversion' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:12}}>Conversion funnel estimate</div>
              {[
                {label:'Google impressions (90 days)', value:sc?.totals?.impressions?.toLocaleString()||'—', color:T.textMuted},
                {label:'Clicks to site', value:sc?.totals?.clicks?.toLocaleString()||'—', color:T.blue},
                {label:'Orders (this month)', value:s?.month?.orders||0, color:T.green},
                {label:'Abandoned carts', value:s?.abandonedCount||0, color:T.red},
              ].map((f,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`0.5px solid ${T.borderLight}`}}>
                  <div style={{width:24,height:24,borderRadius:'50%',background:f.color,color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <span style={{flex:1,fontSize:12,color:T.text}}>{f.label}</span>
                  <span style={{fontSize:14,fontWeight:700,color:f.color}}>{f.value}</span>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {[
                {label:'Cart recovery potential', value:`£${s?.abandonedValue||0}`, sub:'If 20% recovered', color:T.amber},
                {label:'CTR improvement', value:`+${Math.round((sc?.totals?.clicks||0)*0.5)} clicks`, sub:'If CTR goes from 1.5% to 3%', color:T.blue},
                {label:'SEO opportunity', value:`${sc?.quickWins?.length||0} keywords`, sub:'Just off page 1', color:T.green},
              ].map((c,i) => (
                <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderLeft:`4px solid ${c.color}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>{c.label}</div>
                  <div style={{fontSize:18,fontWeight:700,color:c.color,marginBottom:2}}>{c.value}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{c.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </Shell>
    </>
  )
}
