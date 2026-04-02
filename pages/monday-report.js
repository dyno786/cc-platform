import Head from 'next/head'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117',surface:'#1a1d27',surface2:'#22263a',border:'#2e3347',
  text:'#e8eaf0',text2:'#8b90a7',text3:'#555b75',
  green:'#22c55e',amber:'#f59e0b',red:'#ef4444',
  blue:'#3b82f6',accent:'#6366f1',accent2:'#818cf8',teal:'#14b8a6',
}

const statusColor = s => s==='SCALE'?C.green:s==='GROW'?C.blue:s==='REDUCE'?C.amber:s==='PAUSE'?C.red:C.text2
const priorityColor = p => p==='urgent'?C.red:p==='high'?C.amber:C.blue
const typeColor = t => t==='local'?C.teal:t==='product'?C.amber:t==='national'?C.blue:C.accent

function Card({title,icon,color,children}) {
  return (
    <div style={{background:C.surface,border:`1px solid ${color}30`,borderRadius:14,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'12px 16px',background:`${color}10`,borderBottom:`1px solid ${color}20`,display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontSize:18}}>{icon}</span>
        <span style={{fontWeight:700,color,fontSize:14}}>{title}</span>
      </div>
      <div style={{padding:16}}>{children}</div>
    </div>
  )
}

function ActionBadge({status}) {
  return <span style={{background:`${statusColor(status)}20`,color:statusColor(status),padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700}}>{status}</span>
}

function PriorityBadge({priority,num}) {
  return (
    <div style={{width:24,height:24,borderRadius:'50%',background:priorityColor(priority),color:'#000',fontSize:11,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      {num}
    </div>
  )
}

export default function MondayReport() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastFetched, setLastFetched] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  async function fetchReport() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/monday-report')
      const d = await res.json()
      if (d.ok) {
        setReport(d)
        setLastFetched(new Date())
      } else {
        setError(d.error || 'Failed to generate report')
      }
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => { fetchReport() }, [])

  const tabs = [
    {id:'overview',    label:'Overview',   icon:'⬡'},
    {id:'paid',        label:'Paid Ads',   icon:'📊'},
    {id:'organic',     label:'Organic SEO',icon:'🔍'},
    {id:'local',       label:'Local SEO',  icon:'📍'},
    {id:'actions',     label:'Top Actions',icon:'⚡'},
  ]

  return (
    <>
      <Head>
        <title>Monday Report — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>
      <Nav/>

      <div style={{maxWidth:1200,margin:'0 auto',padding:20}}>

        {/* HEADER */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:800,color:C.text,marginBottom:4}}>
              📋 Intelligence Report
            </h1>
            <div style={{color:C.text3,fontSize:13}}>
              {report?.dateRange || 'Loading latest data...'} · All 3 pillars
            </div>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
            {lastFetched && (
              <span style={{fontSize:12,color:C.text3}}>
                Generated: {lastFetched.toLocaleTimeString('en-GB')}
              </span>
            )}
            {/* Data freshness indicators */}
            {report?.dataFreshness && (
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {Object.entries(report.dataFreshness).map(([k,v]) => (
                  <span key={k} style={{background:v?`${C.green}20`:`${C.red}20`,color:v?C.green:C.red,padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:600}}>
                    {v?'✓':'✗'} {k}
                  </span>
                ))}
              </div>
            )}
            <button onClick={fetchReport} disabled={loading} style={{padding:'8px 18px',borderRadius:9,border:'none',background:loading?C.surface2:C.accent,color:loading?C.text3:'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>
              {loading ? '⟳ Generating...' : '🔄 Refresh Report'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{background:`${C.red}15`,border:`1px solid ${C.red}`,borderRadius:10,padding:12,marginBottom:16,color:C.red,fontSize:13}}>
            ❌ {error}
          </div>
        )}

        {loading && !report && (
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:60,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:12}}>⟳</div>
            <div style={{fontWeight:700,color:C.text,fontSize:16,marginBottom:6}}>Generating your Intelligence Report...</div>
            <div style={{color:C.text3,fontSize:13}}>Reading all 5 Google Ads reports + Search Console + GBP data</div>
          </div>
        )}

        {report && (
          <>
            {/* Week summary */}
            <div style={{background:`rgba(99,102,241,.08)`,border:`1px solid rgba(99,102,241,.2)`,borderRadius:12,padding:16,marginBottom:20,fontSize:14,color:C.accent2,lineHeight:1.7}}>
              💡 {report.weekSummary}
            </div>

            {/* TABS */}
            <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:`1px solid ${C.border}`,paddingBottom:0}}>
              {tabs.map(t => (
                <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                  padding:'8px 16px',border:'none',background:'none',
                  borderBottom:activeTab===t.id?`2px solid ${C.accent}`:'2px solid transparent',
                  color:activeTab===t.id?C.accent2:C.text3,
                  fontWeight:activeTab===t.id?700:400,
                  fontSize:13,cursor:'pointer',
                  display:'flex',alignItems:'center',gap:5,marginBottom:-1,
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab==='overview' && (
              <div>
                {/* 3 Pillar summary cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
                  {[
                    {icon:'📊',label:'Paid Ads',color:C.amber,data:report.pillar1_paidAds,
                     stats:[{k:'Spend',v:report.pillar1_paidAds?.totalSpend},{k:'Revenue',v:report.pillar1_paidAds?.totalRevenue},{k:'ROAS',v:report.pillar1_paidAds?.overallROAS}]},
                    {icon:'🔍',label:'Organic SEO',color:C.blue,data:report.pillar2_organicSeo,
                     stats:[{k:'Top keyword',v:report.pillar2_organicSeo?.topKeywords?.[0]?.keyword},{k:'Blog topics',v:report.pillar2_organicSeo?.blogTopics?.length+' ready'},{k:'Quick wins',v:report.pillar2_organicSeo?.quickWins?.length}]},
                    {icon:'📍',label:'Local SEO',color:C.green,data:report.pillar3_localSeo,
                     stats:[{k:'GBP actions',v:report.pillar3_localSeo?.gbpActions?.length},{k:'Post ideas',v:report.pillar3_localSeo?.gbpPostIdeas?.length},{k:'Local KWs',v:report.pillar3_localSeo?.localKeywordOpportunities?.length}]},
                  ].map(p => (
                    <div key={p.label} style={{background:C.surface,border:`1px solid ${p.color}30`,borderRadius:14,padding:16}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                        <span style={{fontSize:20}}>{p.icon}</span>
                        <span style={{fontWeight:700,color:p.color,fontSize:15}}>{p.label}</span>
                      </div>
                      <div style={{color:C.text2,fontSize:13,lineHeight:1.5,marginBottom:12}}>{p.data?.headline}</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                        {p.stats.map(s => (
                          <div key={s.k} style={{background:C.surface2,borderRadius:7,padding:'6px 8px',textAlign:'center'}}>
                            <div style={{fontSize:13,fontWeight:700,color:p.color}}>{s.v || '—'}</div>
                            <div style={{fontSize:10,color:C.text3}}>{s.k}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cross channel insights */}
                {report.crossChannelInsights?.length > 0 && (
                  <Card title="Cross-channel insights" icon="🔗" color={C.teal}>
                    {report.crossChannelInsights.map((insight,i) => (
                      <div key={i} style={{display:'flex',gap:8,marginBottom:8,fontSize:13,color:C.text2}}>
                        <span style={{color:C.teal,flexShrink:0}}>→</span>{insight}
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}

            {/* ── PAID ADS TAB ── */}
            {activeTab==='paid' && report.pillar1_paidAds && (
              <div>
                {/* Summary */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
                  {[
                    {k:'Total Spend',v:report.pillar1_paidAds.totalSpend,c:C.red},
                    {k:'Total Revenue',v:report.pillar1_paidAds.totalRevenue,c:C.green},
                    {k:'Overall ROAS',v:report.pillar1_paidAds.overallROAS,c:C.blue},
                  ].map(m => (
                    <div key={m.k} style={{background:C.surface,border:`1px solid ${m.c}30`,borderRadius:12,padding:14,textAlign:'center'}}>
                      <div style={{fontSize:24,fontWeight:800,color:m.c}}>{m.v}</div>
                      <div style={{fontSize:12,color:C.text3,marginTop:4}}>{m.k}</div>
                    </div>
                  ))}
                </div>

                {/* Urgent actions */}
                {report.pillar1_paidAds.urgentActions?.length > 0 && (
                  <Card title="Urgent actions" icon="🚨" color={C.red}>
                    {report.pillar1_paidAds.urgentActions.map((a,i) => (
                      <div key={i} style={{display:'flex',gap:8,marginBottom:8,fontSize:13,color:C.text2}}>
                        <span style={{color:C.red,fontWeight:700,flexShrink:0}}>{i+1}.</span>{a}
                      </div>
                    ))}
                  </Card>
                )}

                {/* Campaigns */}
                {report.pillar1_paidAds.campaigns?.length > 0 && (
                  <Card title="Campaign performance" icon="📢" color={C.amber}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
                      {report.pillar1_paidAds.campaigns.map((c,i) => (
                        <div key={i} style={{background:C.surface2,border:`1px solid ${statusColor(c.status)}30`,borderRadius:10,padding:12}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                            <div style={{fontWeight:600,color:C.text,fontSize:13}}>{c.name}</div>
                            <ActionBadge status={c.status}/>
                          </div>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:8}}>
                            {[{k:'Spend',v:c.spend,col:C.text2},{k:'Revenue',v:c.revenue,col:C.green},{k:'ROAS',v:c.roas,col:C.blue}].map(m => (
                              <div key={m.k} style={{background:C.surface,borderRadius:5,padding:'4px 7px'}}>
                                <div style={{fontSize:9,color:C.text3}}>{m.k}</div>
                                <div style={{fontWeight:600,color:m.col,fontSize:12}}>{m.v}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{fontSize:12,color:statusColor(c.status),background:`${statusColor(c.status)}10`,borderRadius:6,padding:'5px 8px'}}>→ {c.action}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Devices */}
                {report.pillar1_paidAds.deviceInsights?.length > 0 && (
                  <Card title="Device performance" icon="📱" color={C.teal}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                      {report.pillar1_paidAds.deviceInsights.map((d,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:10,padding:14,textAlign:'center'}}>
                          <div style={{fontSize:24,marginBottom:6}}>{d.device==='Mobile'?'📱':d.device==='Desktop'?'🖥️':'📟'}</div>
                          <div style={{fontWeight:700,color:C.text,fontSize:13}}>{d.device}</div>
                          <div style={{color:C.green,fontSize:12,marginTop:4}}>{d.roas} ROAS</div>
                          <div style={{color:C.text3,fontSize:11}}>{d.spend} · {d.conversions} conv.</div>
                          <div style={{marginTop:8,padding:'4px 8px',borderRadius:6,background:`${C.teal}15`,color:C.teal,fontSize:11,fontWeight:600}}>{d.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Locations */}
                {report.pillar1_paidAds.topLocations?.length > 0 && (
                  <Card title="Location performance" icon="📍" color={C.blue}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                      {report.pillar1_paidAds.topLocations.slice(0,9).map((l,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:8,padding:10}}>
                          <div style={{fontWeight:600,color:C.text,fontSize:13}}>{l.city}</div>
                          <div style={{color:C.green,fontSize:12}}>{l.conversions} conv · {l.cpa} CPA</div>
                          <div style={{color:C.text3,fontSize:11}}>{l.spend}</div>
                          <div style={{color:C.blue,fontSize:11,marginTop:4,fontWeight:600}}>{l.action}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Wasted spend */}
                {report.pillar1_paidAds.wastedSpend?.length > 0 && (
                  <Card title="Wasted spend — add as negative keywords" icon="💸" color={C.red}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
                      {report.pillar1_paidAds.wastedSpend.map((w,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:8,padding:10,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                          <div>
                            <div style={{fontWeight:600,color:C.text,fontSize:12}}>{w.term}</div>
                            <div style={{color:C.text3,fontSize:11,marginTop:2}}>{w.action}</div>
                          </div>
                          <div style={{color:C.red,fontWeight:700,fontSize:12,flexShrink:0,marginLeft:6}}>{w.spend}</div>
                        </div>
                      ))}
                    </div>
                    {report.pillar1_paidAds.newNegativeKeywords?.length > 0 && (
                      <div style={{background:`${C.red}08`,border:`1px solid ${C.red}20`,borderRadius:8,padding:10}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.red,marginBottom:6}}>Add ALL these to negative keywords in Google Ads:</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                          {report.pillar1_paidAds.newNegativeKeywords.map((kw,i) => (
                            <span key={i} style={{background:C.surface,color:C.text2,padding:'2px 8px',borderRadius:5,fontSize:12}}>{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}

            {/* ── ORGANIC SEO TAB ── */}
            {activeTab==='organic' && report.pillar2_organicSeo && (
              <div>
                {/* Top keywords */}
                {report.pillar2_organicSeo.topKeywords?.length > 0 && (
                  <Card title="Top performing keywords this week" icon="🔍" color={C.blue}>
                    <div style={{background:C.surface2,borderRadius:10,overflow:'hidden'}}>
                      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr',padding:'8px 12px',borderBottom:`1px solid ${C.border}`}}>
                        {['Keyword','Clicks','Position','Opportunity'].map(h => (
                          <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase'}}>{h}</span>
                        ))}
                      </div>
                      {report.pillar2_organicSeo.topKeywords.map((k,i) => (
                        <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr',padding:'9px 12px',borderBottom:i<report.pillar2_organicSeo.topKeywords.length-1?`1px solid ${C.border}`:'none',alignItems:'center'}}>
                          <span style={{fontSize:13,color:C.text,fontWeight:500}}>{k.keyword}</span>
                          <span style={{fontSize:13,color:C.green,fontWeight:600}}>{k.clicks}</span>
                          <span style={{fontSize:13,color:C.amber}}># {k.position}</span>
                          <span style={{fontSize:12,color:C.teal}}>{k.opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Blog content calendar */}
                {report.pillar2_organicSeo.contentCalendar?.length > 0 && (
                  <Card title="This week's content calendar" icon="📅" color={C.accent}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8}}>
                      {report.pillar2_organicSeo.contentCalendar.map((d,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:10,padding:10,textAlign:'center'}}>
                          <div style={{fontWeight:700,color:C.accent2,fontSize:12,marginBottom:4}}>{d.day}</div>
                          <div style={{fontSize:11,color:C.text,lineHeight:1.3,marginBottom:4}}>{d.topic}</div>
                          <span style={{background:`${typeColor(d.type)}20`,color:typeColor(d.type),padding:'1px 6px',borderRadius:99,fontSize:10,fontWeight:600}}>{d.type}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Blog topics */}
                {report.pillar2_organicSeo.blogTopics?.length > 0 && (
                  <Card title="Blog topics to publish this week" icon="✍️" color={C.teal}>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {report.pillar2_organicSeo.blogTopics.map((b,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:10,padding:12,display:'flex',alignItems:'flex-start',gap:12}}>
                          <span style={{background:`${priorityColor(b.priority)}20`,color:priorityColor(b.priority),padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,flexShrink:0,marginTop:1}}>{b.priority}</span>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,color:C.text,fontSize:13,marginBottom:3}}>{b.title}</div>
                            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                              <span style={{background:`${typeColor(b.type)}15`,color:typeColor(b.type),padding:'1px 7px',borderRadius:99,fontSize:11}}>{b.type}</span>
                              <span style={{color:C.text3,fontSize:12}}>Target: <strong style={{color:C.text2}}>{b.keyword}</strong></span>
                            </div>
                            <div style={{color:C.text3,fontSize:12,marginTop:4}}>{b.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Quick wins + keyword gaps */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  {report.pillar2_organicSeo.quickWins?.length > 0 && (
                    <Card title="Quick wins this week" icon="⚡" color={C.green}>
                      {report.pillar2_organicSeo.quickWins.map((w,i) => (
                        <div key={i} style={{display:'flex',gap:8,marginBottom:7,fontSize:13,color:C.text2}}>
                          <span style={{color:C.green,flexShrink:0}}>✓</span>{w}
                        </div>
                      ))}
                    </Card>
                  )}
                  {report.pillar2_organicSeo.keywordGaps?.length > 0 && (
                    <Card title="Keyword gaps — we're missing these" icon="🎯" color={C.amber}>
                      {report.pillar2_organicSeo.keywordGaps.map((k,i) => (
                        <div key={i} style={{display:'flex',gap:8,marginBottom:7,fontSize:13,color:C.text2}}>
                          <span style={{color:C.amber,flexShrink:0}}>→</span>{k}
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* ── LOCAL SEO TAB ── */}
            {activeTab==='local' && report.pillar3_localSeo && (
              <div>
                {/* GBP Actions */}
                {report.pillar3_localSeo.gbpActions?.length > 0 && (
                  <Card title="Google Business Profile actions" icon="📍" color={C.green}>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {report.pillar3_localSeo.gbpActions.map((a,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:10,padding:12,display:'flex',alignItems:'center',gap:12}}>
                          <span style={{background:`${priorityColor(a.priority)}20`,color:priorityColor(a.priority),padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700,flexShrink:0}}>{a.priority}</span>
                          <div style={{flex:1}}>
                            <span style={{color:C.teal,fontWeight:600,fontSize:12}}>{a.branch} — </span>
                            <span style={{color:C.text,fontSize:13}}>{a.action}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* GBP Post ideas */}
                {report.pillar3_localSeo.gbpPostIdeas?.length > 0 && (
                  <Card title="Ready-to-post GBP content" icon="📝" color={C.accent}>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {report.pillar3_localSeo.gbpPostIdeas.map((p,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:10,padding:14}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                            <span style={{background:`${C.teal}20`,color:C.teal,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:600}}>{p.branch}</span>
                            <span style={{color:C.text3,fontSize:12}}>{p.product}</span>
                          </div>
                          <div style={{fontSize:13,color:C.text,lineHeight:1.6,background:C.surface,borderRadius:8,padding:10}}>
                            {p.postText}
                          </div>
                          <button onClick={()=>navigator.clipboard.writeText(p.postText)} style={{marginTop:8,padding:'5px 12px',borderRadius:6,border:'none',background:C.accent,color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                            📋 Copy post
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Review strategy + local keywords */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  {report.pillar3_localSeo.reviewStrategy && (
                    <Card title="Review strategy this week" icon="⭐" color={C.amber}>
                      <div style={{fontSize:13,color:C.text2,lineHeight:1.6}}>{report.pillar3_localSeo.reviewStrategy}</div>
                    </Card>
                  )}
                  {report.pillar3_localSeo.localKeywordOpportunities?.length > 0 && (
                    <Card title="Local keyword opportunities" icon="🎯" color={C.teal}>
                      {report.pillar3_localSeo.localKeywordOpportunities.map((k,i) => (
                        <div key={i} style={{display:'flex',gap:8,marginBottom:7,fontSize:13,color:C.text2}}>
                          <span style={{color:C.teal,flexShrink:0}}>→</span>{k}
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* ── TOP ACTIONS TAB ── */}
            {activeTab==='actions' && report.top5ActionsThisWeek && (
              <div>
                <div style={{marginBottom:12,color:C.text2,fontSize:13}}>Your top 5 highest-impact actions this week — prioritised by impact vs effort</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {report.top5ActionsThisWeek.map((a,i) => (
                    <div key={i} style={{background:C.surface,border:`1px solid ${priorityColor(i===0?'urgent':i<3?'high':'medium')}30`,borderRadius:14,padding:16,display:'flex',gap:14,alignItems:'flex-start'}}>
                      <PriorityBadge priority={i===0?'urgent':i<3?'high':'medium'} num={a.priority}/>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6,flexWrap:'wrap'}}>
                          <span style={{fontWeight:700,color:C.text,fontSize:14}}>{a.action}</span>
                          <span style={{background:`${C.accent}20`,color:C.accent2,padding:'1px 8px',borderRadius:99,fontSize:11,fontWeight:600}}>{a.channel}</span>
                          <span style={{background:C.surface2,color:C.text3,padding:'1px 8px',borderRadius:99,fontSize:11}}>{a.effort}</span>
                        </div>
                        <div style={{color:C.green,fontSize:12}}>Expected: {a.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
