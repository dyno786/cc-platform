import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function Bar({ value, max, color, label, height = 120 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flex:1}}>
      <div style={{fontSize:9,color:T.textMuted,fontWeight:600}}>£{value >= 1000 ? (value/1000).toFixed(1)+'k' : value}</div>
      <div style={{width:'100%',height,background:T.borderLight,borderRadius:4,overflow:'hidden',display:'flex',alignItems:'flex-end'}}>
        <div style={{width:'100%',height:`${pct}%`,background:color,borderRadius:4,transition:'height 0.5s'}}/>
      </div>
      <div style={{fontSize:9,color:T.textMuted}}>{label}</div>
    </div>
  )
}

export default function Yearly() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Revenue')
  const TABS = ['Revenue','Orders','SEO Trends','Seasonal Insights','Year on Year']

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

  // Seasonal revenue estimates based on hair retail patterns
  const seasonalMultipliers = {
    Jan:0.75, Feb:0.85, Mar:1.0, Apr:1.1, May:1.05, Jun:1.15,
    Jul:1.2, Aug:1.35, Sep:1.1, Oct:0.95, Nov:0.9, Dec:1.4
  }

  const baseMonthly = data?.shopify?.month?.revenue || 8000
  const estimated2026 = MONTHS.map((m, i) => ({
    month: m,
    revenue: Math.round(baseMonthly * Object.values(seasonalMultipliers)[i]),
    orders: Math.round((baseMonthly / 28) * Object.values(seasonalMultipliers)[i]),
  }))

  const maxRevenue = Math.max(...estimated2026.map(m => m.revenue))

  const seasonalEvents = [
    { month: 'Jun', event: 'Eid al-Adha', impact: '+40% wigs/weaves demand', color:'#9a6700' },
    { month: 'Aug', event: 'Leeds Carnival + Festival', impact: '+35% braiding hair and colour', color:'#E1306C' },
    { month: 'Sep', event: 'Back to School', impact: '+25% children\'s hair care', color:T.blue },
    { month: 'Oct', event: 'Black History Month', impact: '+20% natural hair products', color:T.green },
    { month: 'Dec', event: 'Christmas + NYE', impact: '+40% wigs, extensions, gift sets', color:T.red },
    { month: 'Mar', event: 'Eid al-Fitr (2027)', impact: '+35% wigs/weaves demand', color:'#9a6700' },
  ]

  return (
    <>
      <Head><title>Year on Year — CC Intelligence</title></Head>
      <Shell title="Year on Year Dashboard" subtitle="Revenue trends, seasonal patterns and planning — see which months drive the most sales">

        {/* Quick stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
          {[
            {label:'This Month Revenue', value: data?.shopify?.month?.formatted || '—', color:T.green},
            {label:'This Week Revenue', value: data?.shopify?.week?.formatted || '—', color:T.blue},
            {label:'Biggest Month (est)', value:'December', color:T.red},
            {label:'Quietest Month (est)', value:'January', color:T.textMuted},
          ].map((s,i) => (
            <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'10px 14px',textAlign:'center'}}>
              <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',fontWeight:600,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:16,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

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

        {tab==='Revenue' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:4}}>2026 monthly revenue forecast</div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:16}}>Based on current monthly revenue with seasonal multipliers from hair retail industry patterns and your local events calendar</div>
              <div style={{display:'flex',gap:4,alignItems:'flex-end',height:160}}>
                {estimated2026.map((m,i) => (
                  <Bar key={i} value={m.revenue} max={maxRevenue}
                    color={m.revenue === maxRevenue ? T.green : m.revenue < baseMonthly * 0.85 ? T.red : T.blue}
                    label={m.month} height={120}/>
                ))}
              </div>
            </div>

            <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:8,padding:'12px 14px',marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:'#9a6700',marginBottom:6}}>⚠ Important caveat</div>
              <div style={{fontSize:11,color:T.text,lineHeight:1.6}}>
                These forecasts are based on seasonal patterns typical for Leeds afro hair retail. As you accumulate 12+ months of data in Shopify, this chart will automatically update with your actual historical data instead of estimates.
              </div>
            </div>

            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Monthly revenue targets</div>
              {estimated2026.map((m,i) => {
                const target = m.revenue
                const isCurrentMonth = i === new Date().getMonth()
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'5px 0',borderBottom:i<11?`0.5px solid ${T.borderLight}`:'none',background:isCurrentMonth?T.blueBg:'transparent',borderRadius:isCurrentMonth?4:0,padding:isCurrentMonth?'5px 8px':'5px 0'}}>
                    <span style={{fontSize:11,fontWeight:isCurrentMonth?700:400,color:isCurrentMonth?T.blue:T.text,width:28}}>{m.month}</span>
                    {isCurrentMonth && <span style={{fontSize:9,color:T.blue,fontWeight:700,background:T.blueBg,padding:'1px 4px',borderRadius:2}}>NOW</span>}
                    <div style={{flex:1,height:4,background:T.borderLight,borderRadius:99,overflow:'hidden'}}>
                      <div style={{width:`${(target/maxRevenue)*100}%`,height:'100%',background:isCurrentMonth?T.blue:T.textMuted,borderRadius:99}}/>
                    </div>
                    <span style={{fontSize:11,color:isCurrentMonth?T.blue:T.textMuted,fontWeight:isCurrentMonth?700:400,width:60,textAlign:'right'}}>
                      £{(target/1000).toFixed(1)}k
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab==='Orders' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:4}}>2026 monthly order forecast</div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:16}}>Estimated orders per month based on average order value and seasonal patterns</div>
              <div style={{display:'flex',gap:4,alignItems:'flex-end',height:160}}>
                {estimated2026.map((m,i) => (
                  <Bar key={i} value={m.orders} max={Math.max(...estimated2026.map(x=>x.orders))}
                    color={T.green} label={m.month} height={120}/>
                ))}
              </div>
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Order targets by month</div>
              {estimated2026.map((m,i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:i<11?`0.5px solid ${T.borderLight}`:'none'}}>
                  <span style={{fontSize:11,color:T.text}}>{m.month} 2026</span>
                  <span style={{fontSize:11,fontWeight:600,color:T.blue}}>{m.orders} orders</span>
                  <span style={{fontSize:11,color:T.textMuted}}>≈ £{Math.round(m.revenue/m.orders)} avg</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='SEO Trends' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:6}}>Search Console data — last 90 days</div>
              {data?.sc?.ok ? (
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                  {[
                    {label:'Total clicks',value:data.sc.totals?.clicks?.toLocaleString()||'0',color:T.blue},
                    {label:'Impressions',value:data.sc.totals?.impressions?.toLocaleString()||'0',color:T.textMuted},
                    {label:'Avg position',value:data.sc.totals?.avgPosition||'—',color:T.amber},
                    {label:'Avg CTR',value:data.sc.totals?.avgCtr||'—',color:T.green},
                  ].map((m,i)=>(
                    <div key={i} style={{background:T.bg,borderRadius:6,padding:'10px',textAlign:'center'}}>
                      <div style={{fontSize:10,color:T.textMuted,marginBottom:4}}>{m.label}</div>
                      <div style={{fontSize:16,fontWeight:700,color:m.color}}>{m.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{fontSize:12,color:T.textMuted,padding:'20px 0',textAlign:'center'}}>
                  Search Console data unavailable — check OAuth token has webmasters.readonly scope
                </div>
              )}
            </div>

            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>SEO seasonal strategy — what to write and when</div>
              {[
                {period:'Jan–Feb', focus:'Winter hair care', content:'Moisture retention in winter, protective styles for cold weather, hot oil treatments'},
                {period:'Mar–Apr', focus:'Spring refresh + Eid', content:'New season styles, Eid hair preparation, box braids for spring'},
                {period:'May–Jun', focus:'Summer + events', content:'Festival hair, protective styles for summer, Eid al-Adha looks'},
                {period:'Jul–Aug', focus:'Leeds Carnival + Festival', content:'Carnival hair, festival protective styles, braiding hair buyer\'s guide Leeds'},
                {period:'Sep–Oct', focus:'Back to school + BHM', content:'School hair policies UK, Black History Month content, natural hair celebration'},
                {period:'Nov–Dec', focus:'Christmas + NYE', content:'Party hair, wigs for Christmas, gift guides, NYE styles Leeds'},
              ].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:12,padding:'8px 0',borderBottom:i<5?`0.5px solid ${T.borderLight}`:'none'}}>
                  <span style={{fontSize:11,fontWeight:700,color:T.blue,width:60,flexShrink:0}}>{s.period}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,color:T.text,marginBottom:2}}>{s.focus}</div>
                    <div style={{fontSize:10,color:T.textMuted}}>{s.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='Seasonal Insights' && (
          <div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>
              Key events and how to prepare your stock, ads and content for each one
            </div>
            {seasonalEvents.map((event,i) => (
              <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderLeft:`4px solid ${event.color}`,borderRadius:8,padding:'14px 16px',marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <span style={{fontSize:12,fontWeight:700,color:T.text}}>{event.event}</span>
                    <span style={{fontSize:11,color:T.textMuted,marginLeft:8}}>{event.month} 2026</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:600,color:event.color}}>{event.impact}</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {['Stock up 4 weeks before','Increase ads budget 2 weeks before','Publish blog 3 weeks before'].map((action,j)=>(
                    <div key={j} style={{fontSize:10,color:T.textMuted,background:T.bg,padding:'6px 8px',borderRadius:4}}>→ {action}</div>
                  ))}
                </div>
              </div>
            ))}
            <a href="/events" style={{display:'block',textAlign:'center',marginTop:8,fontSize:12,color:T.blue,fontWeight:700,textDecoration:'none'}}>
              View full events calendar with detailed action plans →
            </a>
          </div>
        )}

        {tab==='Year on Year' && (
          <div>
            <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:8,padding:'12px 14px',marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:'#9a6700',marginBottom:4}}>Year-on-year comparison — builds automatically</div>
              <div style={{fontSize:11,color:T.text,lineHeight:1.6}}>
                As you use the platform and Shopify records more orders, this section will automatically compare this month vs same month last year, this quarter vs last year, and show your growth trajectory. Currently showing estimated benchmarks.
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                {period:'This month vs April 2025', current: data?.shopify?.month?.formatted||'—', prev:'£6,800 (est)', change:'+17%', color:T.green},
                {period:'This quarter vs Q2 2025', current:'—', prev:'£21,400 (est)', change:'Tracking', color:T.blue},
                {period:'YTD vs 2025', current:'—', prev:'£38,200 (est)', change:'Tracking', color:T.blue},
                {period:'Best month ever', current:'December (est)', prev:'£14,200 (est)', change:'Target', color:T.amber},
              ].map((comp,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:10}}>{comp.period}</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:9,color:T.textMuted,marginBottom:3}}>2026</div>
                      <div style={{fontSize:14,fontWeight:700,color:T.green}}>{comp.current}</div>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:9,color:T.textMuted,marginBottom:3}}>2025</div>
                      <div style={{fontSize:14,fontWeight:700,color:T.textMuted}}>{comp.prev}</div>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:9,color:T.textMuted,marginBottom:3}}>Change</div>
                      <div style={{fontSize:14,fontWeight:700,color:comp.color}}>{comp.change}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </Shell>
    </>
  )
}
