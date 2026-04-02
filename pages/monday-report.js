import Head from 'next/head'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117',surface:'#1a1d27',surface2:'#22263a',border:'#2e3347',
  text:'#e8eaf0',text2:'#8b90a7',text3:'#555b75',
  green:'#22c55e',amber:'#f59e0b',red:'#ef4444',
  blue:'#3b82f6',accent:'#6366f1',accent2:'#818cf8',teal:'#14b8a6',purple:'#a855f7',
}

function extractSheetId(urlOrId) {
  if (!urlOrId) return ''
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : urlOrId.trim()
}

const DEFAULT_SHEETS = {
  campaigns:   '1qULuI_YAOIZRM5tebrz9VAss5BT4RO21DU_zg9Yfy7M',
  devices:     '1QxkUwDLGjq-W8GhWH-9QFlhX9D5Ly8fXdc6hsq96IBk',
  locations:   '1pU7GUJkCuJ2CIbVbPDDfqOlF1-7fjFzbC0q3pRII1qc',
  shopping:    '1RGqr8VbHb-TXdFRRhVSCzKiYg5-G3mJqMpkKYBinLlE',
  searchTerms: '19hyImj3WVjVFBf_KUuB61975JuQ7kv-tqjTbQFM-V0g',
}

const SHEET_LABELS = {
  campaigns:   { label:'Campaigns',    icon:'📢' },
  devices:     { label:'Devices',      icon:'📱' },
  locations:   { label:'Locations',    icon:'📍' },
  shopping:    { label:'Shopping',     icon:'🛒' },
  searchTerms: { label:'Search Terms', icon:'🔍' },
}

const statusColor = s => s==='SCALE'?C.green:s==='GROW'?C.blue:s==='REDUCE'?C.amber:s==='PAUSE'?C.red:C.text2
const priorityColor = p => p==='urgent'?C.red:p==='high'?C.amber:C.blue
const typeColor = t => t==='local'?C.teal:t==='product'?C.amber:t==='national'?C.blue:C.accent

function Card({ title, icon, color, children, noPad }) {
  return (
    <div style={{ background:C.surface, border:`1px solid ${color}30`, borderRadius:14, overflow:'hidden', marginBottom:16 }}>
      <div style={{ padding:'11px 16px', background:`${color}10`, borderBottom:`1px solid ${color}20`, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:17 }}>{icon}</span>
        <span style={{ fontWeight:700, color, fontSize:13 }}>{title}</span>
      </div>
      <div style={{ padding: noPad ? 0 : 16 }}>{children}</div>
    </div>
  )
}

function Badge({ label, color }) {
  return <span style={{ background:`${color}20`, color, padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700, flexShrink:0 }}>{label}</span>
}

function Table({ headers, rows, colors }) {
  return (
    <div style={{ background:C.surface2, borderRadius:10, overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:headers.map(()=>'1fr').join(' '), padding:'7px 12px', borderBottom:`1px solid ${C.border}` }}>
        {headers.map(h => <span key={h} style={{ fontSize:10, fontWeight:700, color:C.text3, textTransform:'uppercase' }}>{h}</span>)}
      </div>
      {rows.map((row,i) => (
        <div key={i} style={{ display:'grid', gridTemplateColumns:headers.map(()=>'1fr').join(' '), padding:'8px 12px', borderBottom:i<rows.length-1?`1px solid ${C.border}`:'none', alignItems:'center' }}>
          {row.map((cell,j) => <span key={j} style={{ fontSize:12, color: colors?.[j] || C.text2, fontWeight: j===0?600:400 }}>{cell}</span>)}
        </div>
      ))}
    </div>
  )
}

function SettingsPanel({ sheets, onSave, onClose }) {
  const [vals, setVals] = useState({ ...sheets })
  const [saved, setSaved] = useState(false)
  function save() {
    localStorage.setItem('cc_ads_sheets', JSON.stringify(vals))
    onSave(vals)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1200)
  }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24, width:'100%', maxWidth:600, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div>
            <div style={{ fontWeight:800, color:C.text, fontSize:17 }}>⚙️ Google Ads Sheet URLs</div>
            <div style={{ color:C.text3, fontSize:12, marginTop:3 }}>Paste URLs — data refreshes automatically when sheets update daily</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.text2, fontSize:20, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {Object.entries(SHEET_LABELS).map(([key, meta]) => (
            <div key={key}>
              <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:5 }}>{meta.icon} {meta.label}</div>
              <input value={vals[key]||''} onChange={e=>setVals(p=>({...p,[key]:e.target.value}))}
                placeholder={`Paste ${meta.label} Google Sheet URL...`}
                style={{ width:'100%', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, fontSize:11, padding:'8px 11px', outline:'none', fontFamily:'monospace' }}/>
              {vals[key] && <div style={{ fontSize:10, color:C.green, marginTop:2 }}>✓ ID: {extractSheetId(vals[key])}</div>}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:10, marginTop:18 }}>
          <button onClick={save} style={{ flex:1, padding:10, borderRadius:8, border:'none', background:saved?C.green:C.accent, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            {saved ? '✓ Saved!' : '💾 Save'}
          </button>
          <button onClick={onClose} style={{ padding:'10px 18px', borderRadius:8, border:`1px solid ${C.border}`, background:'none', color:C.text2, fontWeight:600, fontSize:13, cursor:'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function MondayReport() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSettings, setShowSettings] = useState(false)
  const [sheets, setSheets] = useState(DEFAULT_SHEETS)
  const [copiedPost, setCopiedPost] = useState(null)
  const [copiedKW, setCopiedKW] = useState(false)
  const [lastFetched, setLastFetched] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('cc_ads_sheets')
    if (saved) try { const p=JSON.parse(saved); const e={}; Object.keys(p).forEach(k=>{e[k]=extractSheetId(p[k])}); setSheets(s=>({...s,...e})) } catch(e){}
    const cached = localStorage.getItem('cc_report_cache')
    if (cached) try { const c=JSON.parse(cached); if(Date.now()-c.savedAt<3600000) { setReport(c.report); setLastFetched(new Date(c.savedAt)) } } catch(e){}
  }, [])

  async function fetchReport() {
    setLoading(true); setLoadingStep('Reading Google Sheets...'); setError(null)
    try {
      const params = new URLSearchParams({ ...sheets, step:'sheets' })
      const r1 = await fetch(`/api/monday-report?${params}`)
      const d1 = await r1.json()
      if (!d1.ok) { setError(d1.error||'Failed to read sheets'); setLoading(false); return }

      setLoadingStep('AI analysing all 3 pillars in parallel...')
      const r2 = await fetch('/api/monday-report?step=analyse', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ sheets: d1.sheets })
      })
      const d2 = await r2.json()
      if (d2.ok) {
        const full = { ...d2, dataFreshness: d1.freshness }
        setReport(full); setLastFetched(new Date())
        localStorage.setItem('cc_report_cache', JSON.stringify({ report:full, savedAt:Date.now() }))
      } else { setError(d2.error||'Analysis failed') }
    } catch(e) { setError(e.message) }
    setLoading(false); setLoadingStep('')
  }

  const tabs = [
    {id:'overview', label:'Overview',    icon:'⬡'},
    {id:'paid',     label:'Paid Ads',    icon:'📊'},
    {id:'organic',  label:'Organic SEO', icon:'🔍'},
    {id:'local',    label:'Local SEO',   icon:'📍'},
    {id:'actions',  label:'Top Actions', icon:'⚡'},
  ]

  const r = report

  return (
    <>
      <Head>
        <title>Weekly Report — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}button,input{font-family:inherit}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`}</style>
      </Head>
      <Nav/>
      {showSettings && <SettingsPanel sheets={sheets} onSave={v=>{const e={};Object.keys(v).forEach(k=>{e[k]=extractSheetId(v[k])});setSheets(e)}} onClose={()=>setShowSettings(false)}/>}

      <div style={{ maxWidth:1200, margin:'0 auto', padding:20 }}>

        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:3 }}>📋 Weekly Intelligence Report</h1>
            <div style={{ color:C.text3, fontSize:12 }}>{r?.dateRange||'3 Mar – 2 Apr 2026'} · Paid Ads + Organic SEO + Local SEO · All data live from Google</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            {lastFetched && <span style={{ fontSize:11, color:C.text3 }}>Updated {lastFetched.toLocaleTimeString('en-GB')}</span>}
            <button onClick={()=>setShowSettings(true)} style={{ padding:'7px 12px', borderRadius:7, border:`1px solid ${C.border}`, background:C.surface2, color:C.text2, fontWeight:600, fontSize:12, cursor:'pointer' }}>⚙️ Sheet URLs</button>
            <button onClick={fetchReport} disabled={loading} style={{ padding:'8px 18px', borderRadius:8, border:'none', background:loading?C.surface2:C.accent, color:loading?C.text3:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              {loading ? `⟳ ${loadingStep}` : '🔄 Generate Report'}
            </button>
          </div>
        </div>

        {/* Sheet status */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
          {Object.entries(SHEET_LABELS).map(([key,meta]) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:4, background:sheets[key]?`${C.green}15`:`${C.amber}15`, border:`1px solid ${sheets[key]?C.green:C.amber}30`, borderRadius:99, padding:'2px 9px' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:sheets[key]?C.green:C.amber }}/>
              <span style={{ fontSize:10, color:sheets[key]?C.green:C.amber, fontWeight:600 }}>{meta.icon} {meta.label}</span>
            </div>
          ))}
        </div>

        {error && <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}`, borderRadius:9, padding:11, marginBottom:14, color:C.red, fontSize:12 }}>❌ {error}</div>}

        {!r && !loading && (
          <div style={{ background:C.surface, border:`2px dashed ${C.border}`, borderRadius:16, padding:60, textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:12 }}>📋</div>
            <div style={{ fontWeight:800, color:C.text, fontSize:17, marginBottom:6 }}>Generate Your Weekly Intelligence Report</div>
            <div style={{ color:C.text2, fontSize:13, maxWidth:480, margin:'0 auto 20px', lineHeight:1.6 }}>
              Reads all 5 Google Ads Sheets + Search Console live. AI analyses campaigns, keywords, locations by ROI, device performance, blog opportunities and local SEO — all at once.
            </div>
            <button onClick={fetchReport} style={{ padding:'11px 28px', borderRadius:10, border:'none', background:C.accent, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>🔄 Generate Report Now</button>
          </div>
        )}

        {r && (
          <>
            <div style={{ background:'rgba(99,102,241,.08)', border:'1px solid rgba(99,102,241,.2)', borderRadius:11, padding:14, marginBottom:18, fontSize:13, color:C.accent2, lineHeight:1.7 }}>
              💡 {r.weekSummary}
            </div>

            {/* TABS */}
            <div style={{ display:'flex', gap:1, marginBottom:18, borderBottom:`1px solid ${C.border}`, overflowX:'auto' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                  padding:'8px 16px', border:'none', background:'none', whiteSpace:'nowrap',
                  borderBottom:activeTab===t.id?`2px solid ${C.accent}`:'2px solid transparent',
                  color:activeTab===t.id?C.accent2:C.text3,
                  fontWeight:activeTab===t.id?700:400,
                  fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:5, marginBottom:-1,
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeTab==='overview' && (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:18 }}>
                  {[
                    { icon:'📊', label:'Paid Ads',    color:C.amber, h:r.pillar1_paidAds?.headline,
                      stats:[{k:'Spend',v:r.pillar1_paidAds?.totalSpend},{k:'Revenue',v:r.pillar1_paidAds?.totalRevenue},{k:'ROAS',v:r.pillar1_paidAds?.overallROAS}] },
                    { icon:'🔍', label:'Organic SEO', color:C.blue,  h:r.pillar2_organicSeo?.headline,
                      stats:[{k:'Top keyword',v:r.pillar2_organicSeo?.keywordPerformance?.[0]?.keyword?.split(' ').slice(0,2).join(' ')},{k:'Quick wins',v:r.pillar2_organicSeo?.quickWins?.length},{k:'Blog topics',v:(r.pillar2_organicSeo?.blogTopics?.length||0)+' ready'}] },
                    { icon:'📍', label:'Local SEO',   color:C.green, h:r.pillar3_localSeo?.headline,
                      stats:[{k:'GBP actions',v:r.pillar3_localSeo?.gbpActions?.length},{k:'Posts ready',v:r.pillar3_localSeo?.gbpPostIdeas?.length},{k:'Cities',v:r.pillar3_localSeo?.topCitiesByDemand?.length}] },
                  ].map(p => (
                    <div key={p.label} style={{ background:C.surface, border:`1px solid ${p.color}30`, borderRadius:13, padding:15 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:9 }}>
                        <span style={{ fontSize:18 }}>{p.icon}</span>
                        <span style={{ fontWeight:700, color:p.color, fontSize:13 }}>{p.label}</span>
                      </div>
                      <div style={{ color:C.text2, fontSize:12, lineHeight:1.5, marginBottom:10, minHeight:30 }}>{p.h}</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:5 }}>
                        {p.stats.map(s => (
                          <div key={s.k} style={{ background:C.surface2, borderRadius:6, padding:'5px 7px', textAlign:'center' }}>
                            <div style={{ fontSize:12, fontWeight:700, color:p.color }}>{s.v||'—'}</div>
                            <div style={{ fontSize:9, color:C.text3 }}>{s.k}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {r.crossChannelInsights?.length > 0 && (
                  <Card title="Cross-channel insights" icon="🔗" color={C.teal}>
                    {r.crossChannelInsights.map((ins,i) => (
                      <div key={i} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13, color:C.text2, lineHeight:1.5 }}>
                        <span style={{ color:C.teal, flexShrink:0, marginTop:1 }}>→</span>{ins}
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}

            {/* ── PAID ADS ── */}
            {activeTab==='paid' && (
              <div>
                {/* Summary */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
                  {[{k:'Total Spend',v:r.pillar1_paidAds?.totalSpend,c:C.red},{k:'Total Revenue',v:r.pillar1_paidAds?.totalRevenue,c:C.green},{k:'ROAS',v:r.pillar1_paidAds?.overallROAS,c:C.blue}].map(m=>(
                    <div key={m.k} style={{ background:C.surface, border:`1px solid ${m.c}30`, borderRadius:11, padding:14, textAlign:'center' }}>
                      <div style={{ fontSize:26, fontWeight:800, color:m.c }}>{m.v}</div>
                      <div style={{ fontSize:11, color:C.text3, marginTop:3 }}>{m.k}</div>
                    </div>
                  ))}
                </div>

                {/* Urgent actions */}
                {r.pillar1_paidAds?.urgentActions?.length > 0 && (
                  <Card title="Urgent actions this week" icon="🚨" color={C.red}>
                    {r.pillar1_paidAds.urgentActions.map((a,i)=>(
                      <div key={i} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13, color:C.text2, lineHeight:1.5 }}>
                        <span style={{ color:C.red, fontWeight:700, flexShrink:0 }}>{i+1}.</span>{a}
                      </div>
                    ))}
                  </Card>
                )}

                {/* Campaigns */}
                {r.pillar1_paidAds?.campaigns?.length > 0 && (
                  <Card title="Campaign performance" icon="📢" color={C.amber}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                      {r.pillar1_paidAds.campaigns.map((c,i)=>(
                        <div key={i} style={{ background:C.surface2, border:`1px solid ${statusColor(c.status)}30`, borderRadius:10, padding:12 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                            <div style={{ fontWeight:600, color:C.text, fontSize:13, flex:1, marginRight:7 }}>{c.name}</div>
                            <Badge label={c.status} color={statusColor(c.status)}/>
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:5, marginBottom:8 }}>
                            {[{k:'Spend',v:c.spend,col:C.text2},{k:'Revenue',v:c.revenue,col:C.green},{k:'ROAS',v:c.roas,col:C.blue},{k:'Conv.',v:c.conversions,col:C.teal}].map(m=>(
                              <div key={m.k} style={{ background:C.surface, borderRadius:5, padding:'4px 6px' }}>
                                <div style={{ fontSize:9, color:C.text3 }}>{m.k}</div>
                                <div style={{ fontWeight:600, color:m.col, fontSize:11 }}>{m.v}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize:11, color:statusColor(c.status), background:`${statusColor(c.status)}10`, borderRadius:6, padding:'5px 8px' }}>→ {c.action}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Device performance */}
                {r.pillar1_paidAds?.devicePerformance?.length > 0 && (
                  <Card title="Device performance — where to increase/decrease bids" icon="📱" color={C.teal}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                      {r.pillar1_paidAds.devicePerformance.map((d,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:10, padding:14, textAlign:'center' }}>
                          <div style={{ fontSize:28, marginBottom:5 }}>{d.device==='Mobile'?'📱':d.device==='Desktop'?'🖥️':'📟'}</div>
                          <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{d.device}</div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5, margin:'8px 0' }}>
                            {[{k:'Spend',v:d.spend},{k:'ROAS',v:d.roas},{k:'CPA',v:d.cpa},{k:'Conv.',v:d.conversions}].map(m=>(
                              <div key={m.k} style={{ background:C.surface, borderRadius:5, padding:'4px 6px' }}>
                                <div style={{ fontSize:9, color:C.text3 }}>{m.k}</div>
                                <div style={{ fontWeight:600, color:m.k==='ROAS'?C.green:m.k==='CPA'?C.amber:C.text, fontSize:11 }}>{m.v}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ padding:'5px 8px', borderRadius:6, background:`${C.teal}15`, color:C.teal, fontSize:11, fontWeight:600 }}>{d.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Locations by ROI */}
                {r.pillar1_paidAds?.locationsByROI?.length > 0 && (
                  <Card title="Locations ranked by ROI — where to scale or cut spend" icon="📍" color={C.blue}>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {r.pillar1_paidAds.locationsByROI.map((l,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:9, padding:'10px 12px', display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 2fr', gap:8, alignItems:'center' }}>
                          <div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{l.city}</div>
                          <div style={{ fontSize:12 }}><span style={{ color:C.text3, fontSize:10 }}>Spend </span><span style={{ color:C.text }}>{l.spend}</span></div>
                          <div style={{ fontSize:12 }}><span style={{ color:C.text3, fontSize:10 }}>Conv. </span><span style={{ color:C.green, fontWeight:600 }}>{l.conversions}</span></div>
                          <div style={{ fontSize:12 }}><span style={{ color:C.text3, fontSize:10 }}>CPA </span><span style={{ color:C.amber, fontWeight:600 }}>{l.cpa}</span></div>
                          <div style={{ fontSize:13 }}>{l.tier}</div>
                          <div style={{ fontSize:11, color:C.blue }}>{l.action}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Keyword trends */}
                {r.pillar1_paidAds?.keywordTrends?.length > 0 && (
                  <Card title="Keyword trends — what's working and what's not" icon="📈" color={C.purple}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                      {r.pillar1_paidAds.keywordTrends.map((k,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:8, padding:10, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                          <div>
                            <div style={{ fontWeight:600, color:C.text, fontSize:12 }}>{k.term}</div>
                            <div style={{ fontSize:11, color:C.text3, marginTop:2 }}>{k.spend} spend · {k.conversions} conv.</div>
                            <div style={{ fontSize:11, color:C.purple, marginTop:3 }}>{k.recommendation}</div>
                          </div>
                          <span style={{ fontSize:16, flexShrink:0 }}>{k.direction==='up'?'📈':k.direction==='down'?'📉':'🆕'}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Wasted spend */}
                {r.pillar1_paidAds?.wastedSpend?.length > 0 && (
                  <Card title="Wasted spend — add as negative keywords NOW" icon="💸" color={C.red}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7, marginBottom:12 }}>
                      {r.pillar1_paidAds.wastedSpend.map((w,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:8, padding:9, display:'flex', justifyContent:'space-between', gap:6 }}>
                          <div>
                            <div style={{ fontWeight:600, color:C.text, fontSize:12 }}>{w.term}</div>
                            <div style={{ color:C.text3, fontSize:10, marginTop:2 }}>{w.reason}</div>
                          </div>
                          <div style={{ color:C.red, fontWeight:700, fontSize:12, flexShrink:0 }}>{w.spend}</div>
                        </div>
                      ))}
                    </div>
                    {r.pillar1_paidAds.newNegativeKeywords?.length > 0 && (
                      <div style={{ background:`${C.red}08`, border:`1px solid ${C.red}20`, borderRadius:8, padding:11 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:C.red, marginBottom:7 }}>Copy all → Google Ads → Tools → Negative keyword lists:</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:8 }}>
                          {r.pillar1_paidAds.newNegativeKeywords.map((kw,i)=>(
                            <span key={i} style={{ background:C.surface, color:C.text2, padding:'2px 7px', borderRadius:5, fontSize:11 }}>{kw}</span>
                          ))}
                        </div>
                        <button onClick={()=>{navigator.clipboard.writeText(r.pillar1_paidAds.newNegativeKeywords.join('\n'));setCopiedKW(true);setTimeout(()=>setCopiedKW(false),2000)}}
                          style={{ padding:'5px 12px', borderRadius:6, border:'none', background:copiedKW?C.green:C.red, color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer' }}>
                          {copiedKW?'✓ Copied!':'📋 Copy all negative keywords'}
                        </button>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}

            {/* ── ORGANIC SEO ── */}
            {activeTab==='organic' && (
              <div>
                {/* Keyword performance table */}
                {r.pillar2_organicSeo?.keywordPerformance?.length > 0 && (
                  <Card title="Keyword performance — positions, trends, actions" icon="🔍" color={C.blue}>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {r.pillar2_organicSeo.keywordPerformance.map((k,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:9, padding:'10px 12px', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 2fr', gap:8, alignItems:'center' }}>
                          <div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{k.keyword}</div>
                          <div style={{ fontSize:12, color:C.green, fontWeight:600 }}>{k.clicks} clicks</div>
                          <div style={{ fontSize:12, color:C.amber }}>#{k.position}</div>
                          <div style={{ fontSize:11 }}>{k.ctr}</div>
                          <Badge label={k.status} color={k.status?.includes('🏆')?C.green:k.status?.includes('✅')?C.teal:k.status?.includes('⚡')?C.amber:C.blue}/>
                          <div style={{ fontSize:11, color:C.blue }}>{k.action}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Local vs National keywords */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  {r.pillar2_organicSeo?.localKeywords?.length > 0 && (
                    <Card title="Local keyword opportunities" icon="📍" color={C.teal}>
                      {r.pillar2_organicSeo.localKeywords.map((k,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:8, padding:10, marginBottom:7 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontWeight:600, color:C.text, fontSize:12 }}>{k.keyword}</span>
                            <div style={{ display:'flex', gap:4 }}>
                              <Badge label={k.volume} color={k.volume==='high'?C.green:k.volume==='medium'?C.amber:C.text3}/>
                              <Badge label={k.currentRank} color={k.currentRank==='ranking'?C.green:C.text3}/>
                            </div>
                          </div>
                          <div style={{ fontSize:11, color:C.teal }}>{k.opportunity}</div>
                        </div>
                      ))}
                    </Card>
                  )}
                  {r.pillar2_organicSeo?.nationalKeywords?.length > 0 && (
                    <Card title="National keyword opportunities" icon="🌍" color={C.blue}>
                      {r.pillar2_organicSeo.nationalKeywords.map((k,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:8, padding:10, marginBottom:7 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontWeight:600, color:C.text, fontSize:12 }}>{k.keyword}</span>
                            <div style={{ display:'flex', gap:4 }}>
                              <Badge label={k.category} color={C.blue}/>
                              <Badge label={k.volume} color={k.volume==='high'?C.green:k.volume==='medium'?C.amber:C.text3}/>
                            </div>
                          </div>
                          <div style={{ fontSize:11, color:C.blue }}>{k.opportunity}</div>
                        </div>
                      ))}
                    </Card>
                  )}
                </div>

                {/* Quick wins */}
                {r.pillar2_organicSeo?.quickWins?.length > 0 && (
                  <Card title="Quick wins — do these in Shopify today" icon="⚡" color={C.green}>
                    {r.pillar2_organicSeo.quickWins.map((w,i)=>(
                      <div key={i} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13, color:C.text2, lineHeight:1.5 }}>
                        <span style={{ color:C.green, flexShrink:0, fontWeight:700 }}>{i+1}.</span>{w}
                      </div>
                    ))}
                  </Card>
                )}

                {/* Keyword gaps */}
                {r.pillar2_organicSeo?.keywordGaps?.length > 0 && (
                  <Card title="Keyword gaps — missing revenue opportunity" icon="🎯" color={C.amber}>
                    {r.pillar2_organicSeo.keywordGaps.map((k,i)=>(
                      <div key={i} style={{ display:'flex', gap:8, marginBottom:7, fontSize:13, color:C.text2, lineHeight:1.5 }}>
                        <span style={{ color:C.amber, flexShrink:0 }}>→</span>{k}
                      </div>
                    ))}
                  </Card>
                )}

                {/* Blog topics */}
                {r.pillar2_organicSeo?.blogTopics?.length > 0 && (
                  <Card title="Blog topics to publish this week — exact titles and meta descriptions" icon="✍️" color={C.teal}>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {r.pillar2_organicSeo.blogTopics.map((b,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:10, padding:13 }}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:7 }}>
                            <Badge label={b.priority} color={priorityColor(b.priority)}/>
                            <Badge label={b.type} color={typeColor(b.type)}/>
                            <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{b.title}</div>
                          </div>
                          <div style={{ fontSize:11, color:C.text3, marginBottom:7 }}>Target keyword: <strong style={{ color:C.text2 }}>{b.keyword}</strong> · {b.reason}</div>
                          {b.metaDescription && (
                            <div style={{ background:`${C.blue}10`, border:`1px solid ${C.blue}20`, borderRadius:6, padding:'6px 9px', marginBottom:5 }}>
                              <div style={{ fontSize:9, color:C.blue, fontWeight:700, marginBottom:2 }}>META DESCRIPTION — paste into Shopify SEO field:</div>
                              <div style={{ fontSize:11, color:C.text2 }}>{b.metaDescription}</div>
                            </div>
                          )}
                          {b.firstParagraph && (
                            <div style={{ background:`${C.teal}10`, border:`1px solid ${C.teal}20`, borderRadius:6, padding:'6px 9px' }}>
                              <div style={{ fontSize:9, color:C.teal, fontWeight:700, marginBottom:2 }}>FIRST PARAGRAPH — copy and start writing:</div>
                              <div style={{ fontSize:11, color:C.text2, lineHeight:1.5 }}>{b.firstParagraph}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Content calendar */}
                {r.pillar2_organicSeo?.contentCalendar?.length > 0 && (
                  <Card title="7-day content calendar" icon="📅" color={C.accent}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:7 }}>
                      {r.pillar2_organicSeo.contentCalendar.map((d,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:9, padding:9, textAlign:'center' }}>
                          <div style={{ fontWeight:700, color:C.accent2, fontSize:11, marginBottom:5 }}>{d.day}</div>
                          <div style={{ fontSize:10, color:C.text, lineHeight:1.3, marginBottom:5 }}>{d.topic}</div>
                          <span style={{ background:`${typeColor(d.type)}20`, color:typeColor(d.type), padding:'1px 5px', borderRadius:99, fontSize:9, fontWeight:600 }}>{d.type}</span>
                          {d.estimatedTraffic && <div style={{ fontSize:9, color:C.green, marginTop:3 }}>{d.estimatedTraffic}</div>}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ── LOCAL SEO ── */}
            {activeTab==='local' && (
              <div>
                {/* Branch performance */}
                {r.pillar3_localSeo?.branchPerformance?.length > 0 && (
                  <Card title="Branch performance overview" icon="🏪" color={C.green}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                      {r.pillar3_localSeo.branchPerformance.map((b,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:10, padding:14, textAlign:'center' }}>
                          <div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:4 }}>{b.branch}</div>
                          <div style={{ fontSize:28, fontWeight:800, color:b.rating>=4?C.green:b.rating>=3.7?C.amber:C.red, marginBottom:2 }}>{b.rating}★</div>
                          <div style={{ color:C.text3, fontSize:12, marginBottom:8 }}>{b.reviews} reviews</div>
                          <Badge label={b.trend} color={b.trend==='improving'?C.green:b.trend==='declining'?C.red:C.amber}/>
                          <div style={{ fontSize:11, color:C.blue, marginTop:8, textAlign:'left' }}>{b.urgentAction}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Top cities by demand */}
                {r.pillar3_localSeo?.topCitiesByDemand?.length > 0 && (
                  <Card title="Top cities by customer demand — where to focus local content" icon="🗺️" color={C.blue}>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {r.pillar3_localSeo.topCitiesByDemand.map((c,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:9, padding:'10px 12px', display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr 3fr', gap:8, alignItems:'center' }}>
                          <div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{c.city}</div>
                          <div style={{ fontSize:12, color:C.green, fontWeight:600 }}>{c.conversions} conv.</div>
                          <div style={{ fontSize:12, color:C.green }}>{c.convValue}</div>
                          <div style={{ fontSize:12, color:C.amber }}>{c.cpa} CPA</div>
                          <div style={{ fontSize:11, color:C.blue }}>{c.localSeoAction}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* GBP Actions */}
                {r.pillar3_localSeo?.gbpActions?.length > 0 && (
                  <Card title="Google Business Profile actions this week" icon="📍" color={C.teal}>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {r.pillar3_localSeo.gbpActions.map((a,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:9, padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
                          <Badge label={a.priority} color={priorityColor(a.priority)}/>
                          <div>
                            <span style={{ color:C.teal, fontWeight:600, fontSize:12 }}>{a.branch} — </span>
                            <span style={{ color:C.text, fontSize:13 }}>{a.action}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* GBP Posts */}
                {r.pillar3_localSeo?.gbpPostIdeas?.length > 0 && (
                  <Card title="Ready-to-post GBP content — copy and paste directly" icon="📝" color={C.accent}>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {r.pillar3_localSeo.gbpPostIdeas.map((p,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:10, padding:14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:6 }}>
                            <Badge label={p.branch} color={C.teal}/>
                            <span style={{ color:C.text3, fontSize:12 }}>{p.product}</span>
                          </div>
                          <div style={{ fontSize:13, color:C.text, lineHeight:1.7, background:C.surface, borderRadius:8, padding:12, marginBottom:8 }}>{p.postText}</div>
                          <button onClick={()=>{navigator.clipboard.writeText(p.postText);setCopiedPost(i);setTimeout(()=>setCopiedPost(null),2000)}}
                            style={{ padding:'5px 13px', borderRadius:6, border:'none', background:copiedPost===i?C.green:C.accent, color:'#fff', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                            {copiedPost===i?'✓ Copied!':'📋 Copy post'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Review strategy + local keywords */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  {r.pillar3_localSeo?.reviewStrategy && (
                    <Card title="Review strategy this week" icon="⭐" color={C.amber}>
                      <div style={{ fontSize:13, color:C.text2, lineHeight:1.7 }}>{r.pillar3_localSeo.reviewStrategy}</div>
                    </Card>
                  )}
                  {r.pillar3_localSeo?.localKeywordOpportunities?.length > 0 && (
                    <Card title="Local keyword opportunities" icon="🎯" color={C.purple}>
                      {r.pillar3_localSeo.localKeywordOpportunities.map((k,i)=>(
                        <div key={i} style={{ background:C.surface2, borderRadius:8, padding:9, marginBottom:7 }}>
                          <div style={{ fontWeight:600, color:C.text, fontSize:12, marginBottom:3 }}>{k.keyword}</div>
                          <div style={{ display:'flex', gap:5, marginBottom:4 }}>
                            <Badge label={k.competition+' comp.'} color={k.competition==='low'?C.green:k.competition==='medium'?C.amber:C.red}/>
                          </div>
                          <div style={{ fontSize:11, color:C.purple }}>{k.action}</div>
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* ── TOP ACTIONS ── */}
            {activeTab==='actions' && r.top5ActionsThisWeek && (
              <div>
                <div style={{ color:C.text2, fontSize:13, marginBottom:14 }}>Top {r.top5ActionsThisWeek.length} highest-impact actions — prioritised by impact vs effort</div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {r.top5ActionsThisWeek.map((a,i)=>(
                    <div key={i} style={{ background:C.surface, border:`1px solid ${priorityColor(i===0?'urgent':i<3?'high':'medium')}30`, borderRadius:13, padding:15, display:'flex', gap:13, alignItems:'flex-start' }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:priorityColor(i===0?'urgent':i<3?'high':'medium'), color:'#000', fontSize:13, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{a.priority}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:5, flexWrap:'wrap' }}>
                          <span style={{ fontWeight:700, color:C.text, fontSize:14 }}>{a.action}</span>
                          <Badge label={a.channel} color={C.accent}/>
                          <Badge label={a.effort} color={C.text3}/>
                        </div>
                        <div style={{ color:C.green, fontSize:12 }}>📈 {a.impact}</div>
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
