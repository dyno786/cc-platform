import Head from 'next/head'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117',surface:'#1a1d27',surface2:'#22263a',border:'#2e3347',
  text:'#e8eaf0',text2:'#8b90a7',text3:'#555b75',
  green:'#22c55e',amber:'#f59e0b',red:'#ef4444',
  blue:'#3b82f6',accent:'#6366f1',accent2:'#818cf8',teal:'#14b8a6',
}

// Extract sheet ID from URL or raw ID
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
  campaigns:   { label:'Campaigns',      icon:'📢', desc:'Campaign performance by device' },
  devices:     { label:'Devices',        icon:'📱', desc:'Mobile vs Desktop vs Tablet' },
  locations:   { label:'Locations',      icon:'📍', desc:'Cities — clicks, cost, conversions' },
  shopping:    { label:'Shopping',       icon:'🛒', desc:'Shopping product performance' },
  searchTerms: { label:'Search Terms',   icon:'🔍', desc:'All search terms with spend' },
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

function SettingsPanel({ sheets, onSave, onClose }) {
  const [vals, setVals] = useState({ ...sheets })
  const [saved, setSaved] = useState(false)

  function save() {
    // Save to localStorage so it persists
    localStorage.setItem('cc_ads_sheets', JSON.stringify(vals))
    onSave(vals)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1500)
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24,width:'100%',maxWidth:640,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <div style={{fontWeight:800,color:C.text,fontSize:18}}>⚙️ Google Ads Sheet URLs</div>
            <div style={{color:C.text3,fontSize:12,marginTop:4}}>Paste your Google Sheets URLs — updates automatically when sheets refresh daily</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.text2,fontSize:20,cursor:'pointer'}}>✕</button>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {Object.entries(SHEET_LABELS).map(([key, meta]) => (
            <div key={key}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                <span style={{fontSize:16}}>{meta.icon}</span>
                <span style={{fontWeight:600,color:C.text,fontSize:13}}>{meta.label}</span>
                <span style={{color:C.text3,fontSize:12}}>— {meta.desc}</span>
              </div>
              <input
                value={vals[key] || ''}
                onChange={e => setVals(p => ({...p, [key]: e.target.value}))}
                placeholder={`Paste ${meta.label} Google Sheet URL here...`}
                style={{width:'100%',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:12,padding:'9px 12px',outline:'none',fontFamily:'monospace'}}
              />
              {vals[key] && (
                <div style={{fontSize:11,color:C.green,marginTop:3}}>
                  ✓ Sheet ID: {extractSheetId(vals[key])}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button onClick={save} style={{flex:1,padding:'11px',borderRadius:9,border:'none',background:saved?C.green:C.accent,color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>
            {saved ? '✓ Saved!' : '💾 Save Sheet URLs'}
          </button>
          <button onClick={onClose} style={{padding:'11px 20px',borderRadius:9,border:`1px solid ${C.border}`,background:'none',color:C.text2,fontWeight:600,fontSize:14,cursor:'pointer'}}>
            Cancel
          </button>
        </div>

        <div style={{marginTop:16,background:`${C.amber}10`,border:`1px solid ${C.amber}30`,borderRadius:8,padding:12,fontSize:12,color:C.amber}}>
          💡 Make sure each Sheet is shared with <strong>cchairnbeauty@gmail.com</strong> or set to "Anyone with the link can view"
        </div>
      </div>
    </div>
  )
}

export default function MondayReport() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSettings, setShowSettings] = useState(false)
  const [sheets, setSheets] = useState(DEFAULT_SHEETS)
  const [copiedPost, setCopiedPost] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)

  // Load saved sheet URLs from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cc_ads_sheets')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const extracted = {}
        Object.keys(parsed).forEach(k => {
          extracted[k] = extractSheetId(parsed[k])
        })
        setSheets(prev => ({ ...prev, ...extracted }))
      } catch(e) {}
    }
  }, [])

  function handleSaveSheets(vals) {
    const extracted = {}
    Object.keys(vals).forEach(k => {
      extracted[k] = extractSheetId(vals[k])
    })
    setSheets(extracted)
  }

  async function fetchReport() {
    setLoading(true)
    setError(null)
    try {
      // Pass sheet IDs as query params
      const params = new URLSearchParams(sheets)
      const res = await fetch(`/api/monday-report?${params}`)
      const d = await res.json()
      if (d.ok) { setReport(d); setLastFetched(new Date()) }
      else setError(d.error || 'Failed to generate report')
    } catch(e) { setError(e.message) }
    setLoading(false)
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
        <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}button{font-family:inherit}input{font-family:inherit}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`}</style>
      </Head>
      <Nav/>

      {showSettings && (
        <SettingsPanel
          sheets={sheets}
          onSave={handleSaveSheets}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div style={{maxWidth:1200,margin:'0 auto',padding:20}}>

        {/* HEADER */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:800,color:C.text,marginBottom:4}}>📋 Weekly Intelligence Report</h1>
            <div style={{color:C.text3,fontSize:13}}>
              {r?.dateRange || '3 Mar – 2 Apr 2026'} · Paid Ads + Organic SEO + Local SEO
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            {lastFetched && <span style={{fontSize:12,color:C.text3}}>Updated: {lastFetched.toLocaleTimeString('en-GB')}</span>}
            <button onClick={() => setShowSettings(true)} style={{padding:'8px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.surface2,color:C.text2,fontWeight:600,fontSize:12,cursor:'pointer'}}>
              ⚙️ Sheet URLs
            </button>
            <button onClick={fetchReport} disabled={loading} style={{padding:'8px 18px',borderRadius:9,border:'none',background:loading?C.surface2:C.accent,color:loading?C.text3:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              {loading ? (
                <><span style={{display:'inline-block',animation:'spin 1s linear infinite'}}>⟳</span> Generating...</>
              ) : (
                '🔄 Generate Report'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div style={{background:`${C.red}15`,border:`1px solid ${C.red}`,borderRadius:10,padding:12,marginBottom:16,color:C.red,fontSize:13}}>
            ❌ {error}
          </div>
        )}

        {/* Sheet status indicators */}
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {Object.entries(SHEET_LABELS).map(([key,meta]) => (
            <div key={key} style={{display:'flex',alignItems:'center',gap:4,background:sheets[key]?`${C.green}15`:`${C.amber}15`,border:`1px solid ${sheets[key]?C.green:C.amber}30`,borderRadius:99,padding:'3px 10px'}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:sheets[key]?C.green:C.amber}}/>
              <span style={{fontSize:11,color:sheets[key]?C.green:C.amber,fontWeight:600}}>{meta.icon} {meta.label}</span>
            </div>
          ))}
        </div>

        {!r && !loading && (
          <div style={{background:C.surface,border:`2px dashed ${C.border}`,borderRadius:16,padding:60,textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:48,marginBottom:16}}>📋</div>
            <div style={{fontWeight:800,color:C.text,fontSize:18,marginBottom:8}}>Generate Your Weekly Intelligence Report</div>
            <div style={{color:C.text2,fontSize:14,maxWidth:500,margin:'0 auto 24px'}}>
              Reads your 5 Google Ads Sheets + Search Console + GBP data in real time. AI analyses everything across all 3 pillars and gives you exact actions to take.
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={fetchReport} style={{padding:'12px 28px',borderRadius:10,border:'none',background:C.accent,color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer'}}>
                🔄 Generate Report Now
              </button>
              <button onClick={() => setShowSettings(true)} style={{padding:'12px 20px',borderRadius:10,border:`1px solid ${C.border}`,background:C.surface2,color:C.text2,fontWeight:600,fontSize:14,cursor:'pointer'}}>
                ⚙️ Update Sheet URLs
              </button>
            </div>
            <div style={{marginTop:20,color:C.text3,fontSize:12}}>
              Sheet URLs already configured — 5 of 5 connected
            </div>
          </div>
        )}

        {loading && (
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:40,textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:36,marginBottom:12}}>⟳</div>
            <div style={{fontWeight:700,color:C.text,fontSize:16,marginBottom:6}}>Generating Intelligence Report...</div>
            <div style={{color:C.text3,fontSize:13,marginBottom:16}}>Reading Google Ads Sheets + Search Console + GBP data</div>
            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
              {Object.entries(SHEET_LABELS).map(([key,meta]) => (
                <span key={key} style={{background:`${C.green}15`,color:C.green,padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:600,animation:'pulse 1.5s ease-in-out infinite'}}>
                  {meta.icon} Reading {meta.label}...
                </span>
              ))}
            </div>
          </div>
        )}

        {r && (
          <>
            {/* Summary */}
            <div style={{background:'rgba(99,102,241,.08)',border:'1px solid rgba(99,102,241,.2)',borderRadius:12,padding:16,marginBottom:20,fontSize:14,color:C.accent2,lineHeight:1.7}}>
              💡 {r.weekSummary}
            </div>

            {/* TABS */}
            <div style={{display:'flex',gap:2,marginBottom:20,borderBottom:`1px solid ${C.border}`,overflowX:'auto'}}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding:'9px 18px',border:'none',background:'none',whiteSpace:'nowrap',
                  borderBottom:activeTab===t.id?`2px solid ${C.accent}`:'2px solid transparent',
                  color:activeTab===t.id?C.accent2:C.text3,
                  fontWeight:activeTab===t.id?700:400,
                  fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:5,marginBottom:-1,
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeTab==='overview' && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
                  {[
                    {icon:'📊',label:'Paid Ads',   color:C.amber, h:r.pillar1_paidAds?.headline,
                     stats:[{k:'Spend',v:r.pillar1_paidAds?.totalSpend},{k:'Revenue',v:r.pillar1_paidAds?.totalRevenue},{k:'ROAS',v:r.pillar1_paidAds?.overallROAS}]},
                    {icon:'🔍',label:'Organic SEO',color:C.blue,  h:r.pillar2_organicSeo?.headline,
                     stats:[{k:'Top KW',v:r.pillar2_organicSeo?.topKeywords?.[0]?.keyword?.split(' ').slice(0,2).join(' ')},{k:'Blog topics',v:(r.pillar2_organicSeo?.blogTopics?.length||0)+' ready'},{k:'Quick wins',v:r.pillar2_organicSeo?.quickWins?.length}]},
                    {icon:'📍',label:'Local SEO',  color:C.green, h:r.pillar3_localSeo?.headline,
                     stats:[{k:'GBP actions',v:r.pillar3_localSeo?.gbpActions?.length},{k:'Posts ready',v:r.pillar3_localSeo?.gbpPostIdeas?.length},{k:'Local KWs',v:r.pillar3_localSeo?.localKeywordOpportunities?.length}]},
                  ].map(p => (
                    <div key={p.label} style={{background:C.surface,border:`1px solid ${p.color}30`,borderRadius:14,padding:16}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                        <span style={{fontSize:20}}>{p.icon}</span>
                        <span style={{fontWeight:700,color:p.color,fontSize:14}}>{p.label}</span>
                      </div>
                      <div style={{color:C.text2,fontSize:12,lineHeight:1.5,marginBottom:12,minHeight:32}}>{p.h}</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                        {p.stats.map(s => (
                          <div key={s.k} style={{background:C.surface2,borderRadius:7,padding:'6px 8px',textAlign:'center'}}>
                            <div style={{fontSize:12,fontWeight:700,color:p.color}}>{s.v||'—'}</div>
                            <div style={{fontSize:10,color:C.text3}}>{s.k}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {r.crossChannelInsights?.length > 0 && (
                  <Card title="Cross-channel insights" icon="🔗" color={C.teal}>
                    {r.crossChannelInsights.map((insight,i) => (
                      <div key={i} style={{display:'flex',gap:8,marginBottom:8,fontSize:13,color:C.text2,lineHeight:1.5}}>
                        <span style={{color:C.teal,flexShrink:0,marginTop:2}}>→</span>{insight}
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}

            {/* ── PAID ADS ── */}
            {activeTab==='paid' && r.pillar1_paidAds && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
                  {[
                    {k:'Total Spend',  v:r.pillar1_paidAds.totalSpend,   c:C.red},
                    {k:'Total Revenue',v:r.pillar1_paidAds.totalRevenue, c:C.green},
                    {k:'Overall ROAS', v:r.pillar1_paidAds.overallROAS,  c:C.blue},
                  ].map(m => (
                    <div key={m.k} style={{background:C.surface,border:`1px solid ${m.c}30`,borderRadius:12,padding:16,textAlign:'center'}}>
                      <div style={{fontSize:28,fontWeight:800,color:m.c}}>{m.v}</div>
                      <div style={{fontSize:12,color:C.text3,marginTop:4}}>{m.k}</div>
                    </div>
                  ))}
                </div>

                {r.pillar1_paidAds.urgentActions?.length > 0 && (
                  <Card title="Urgent actions this week" icon="🚨" color={C.red}>
                    {r.pillar1_paidAds.urgentActions.map((a,i) => (
                      <div key={i} style={{display:'flex',gap:8,marginBottom:8,fontSize:13,color:C.text2,lineHeight:1.5}}>
                        <span style={{color:C.red,fontWeight:700,flexShrink:0}}>{i+1}.</span>{a}
                      </div>
                    ))}
                  </Card>
                )}

                {r.pillar1_paidAds.campaigns?.length > 0 && (
                  <Card title="Campaign performance" icon="📢" color={C.amber}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
                      {r.pillar1_paidAds.campaigns.map((c,i) => (
                        <div key={i} style={{background:C.surface2,border:`1px solid ${statusColor(c.status)}30`,borderRadius:10,padding:12}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                            <div style={{fontWeight:600,color:C.text,fontSize:13,flex:1,marginRight:8}}>{c.name}</div>
                            <span style={{background:`${statusColor(c.status)}20`,color:statusColor(c.status),padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,flexShrink:0}}>{c.status}</span>
                          </div>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:5,marginBottom:8}}>
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

                {r.pillar1_paidAds.deviceInsights?.length > 0 && (
                  <Card title="Device performance" icon="📱" color={C.teal}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                      {r.pillar1_paidAds.deviceInsights.map((d,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:10,padding:14,textAlign:'center'}}>
                          <div style={{fontSize:28,marginBottom:6}}>{d.device==='Mobile'?'📱':d.device==='Desktop'?'🖥️':'📟'}</div>
                          <div style={{fontWeight:700,color:C.text}}>{d.device}</div>
                          <div style={{color:C.green,fontSize:12,marginTop:4,fontWeight:600}}>{d.roas} ROAS</div>
                          <div style={{color:C.text3,fontSize:11}}>{d.spend} · {d.conversions} conv.</div>
                          <div style={{marginTop:8,padding:'4px 8px',borderRadius:6,background:`${C.teal}15`,color:C.teal,fontSize:11,fontWeight:600}}>{d.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {r.pillar1_paidAds.topLocations?.length > 0 && (
                  <Card title="Location performance" icon="📍" color={C.blue}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                      {r.pillar1_paidAds.topLocations.map((l,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:8,padding:10,border:`1px solid ${l.action?.includes('❌')?C.red:l.action?.includes('🔥')?C.green:C.border}20`}}>
                          <div style={{fontWeight:600,color:C.text,fontSize:13}}>{l.city}</div>
                          <div style={{color:C.green,fontSize:12}}>{l.conversions} conv · {l.cpa} CPA</div>
                          <div style={{color:C.text3,fontSize:11}}>{l.spend} spend</div>
                          <div style={{color:l.action?.includes('❌')?C.red:l.action?.includes('🔥')?C.green:C.blue,fontSize:11,marginTop:4,fontWeight:600}}>{l.action}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {r.pillar1_paidAds.wastedSpend?.length > 0 && (
                  <Card title="Wasted spend — add these as negative keywords NOW" icon="💸" color={C.red}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
                      {r.pillar1_paidAds.wastedSpend.map((w,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:8,padding:10,display:'flex',justifyContent:'space-between',gap:6}}>
                          <div>
                            <div style={{fontWeight:600,color:C.text,fontSize:12}}>{w.term}</div>
                            <div style={{color:C.text3,fontSize:11,marginTop:2}}>{w.action}</div>
                          </div>
                          <div style={{color:C.red,fontWeight:700,fontSize:12,flexShrink:0}}>{w.spend}</div>
                        </div>
                      ))}
                    </div>
                    {r.pillar1_paidAds.newNegativeKeywords?.length > 0 && (
                      <div style={{background:`${C.red}08`,border:`1px solid ${C.red}20`,borderRadius:8,padding:12}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.red,marginBottom:8}}>Copy all and add to Google Ads → Negative Keywords:</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
                          {r.pillar1_paidAds.newNegativeKeywords.map((kw,i) => (
                            <span key={i} style={{background:C.surface,color:C.text2,padding:'2px 8px',borderRadius:5,fontSize:11}}>{kw}</span>
                          ))}
                        </div>
                        <button onClick={() => {
                          navigator.clipboard.writeText(r.pillar1_paidAds.newNegativeKeywords.join('\n'))
                        }} style={{padding:'6px 14px',borderRadius:7,border:'none',background:C.red,color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer'}}>
                          📋 Copy all negative keywords
                        </button>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}

            {/* ── ORGANIC SEO ── */}
            {activeTab==='organic' && r.pillar2_organicSeo && (
              <div>
                {r.pillar2_organicSeo.topKeywords?.length > 0 && (
                  <Card title="Top performing keywords" icon="🔍" color={C.blue}>
                    <div style={{background:C.surface2,borderRadius:10,overflow:'hidden'}}>
                      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr',padding:'8px 12px',borderBottom:`1px solid ${C.border}`}}>
                        {['Keyword','Clicks','Position','Opportunity'].map(h => (
                          <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase'}}>{h}</span>
                        ))}
                      </div>
                      {r.pillar2_organicSeo.topKeywords.map((k,i) => (
                        <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr',padding:'9px 12px',borderBottom:i<r.pillar2_organicSeo.topKeywords.length-1?`1px solid ${C.border}`:'none',alignItems:'center'}}>
                          <span style={{fontSize:13,color:C.text,fontWeight:500}}>{k.keyword}</span>
                          <span style={{fontSize:13,color:C.green,fontWeight:600}}>{k.clicks}</span>
                          <span style={{fontSize:13,color:C.amber}}>#{k.position}</span>
                          <span style={{fontSize:11,color:C.teal}}>{k.opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {r.pillar2_organicSeo.contentCalendar?.length > 0 && (
                  <Card title="This week's content calendar" icon="📅" color={C.accent}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8}}>
                      {r.pillar2_organicSeo.contentCalendar.map((d,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:10,padding:10,textAlign:'center'}}>
                          <div style={{fontWeight:700,color:C.accent2,fontSize:12,marginBottom:6}}>{d.day}</div>
                          <div style={{fontSize:11,color:C.text,lineHeight:1.3,marginBottom:6}}>{d.topic}</div>
                          <span style={{background:`${typeColor(d.type)}20`,color:typeColor(d.type),padding:'1px 6px',borderRadius:99,fontSize:10,fontWeight:600}}>{d.type}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {r.pillar2_organicSeo.blogTopics?.length > 0 && (
                  <Card title="Blog topics to publish this week" icon="✍️" color={C.teal}>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {r.pillar2_organicSeo.blogTopics.map((b,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:10,padding:12,display:'flex',alignItems:'flex-start',gap:12}}>
                          <span style={{background:`${priorityColor(b.priority)}20`,color:priorityColor(b.priority),padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,flexShrink:0}}>{b.priority}</span>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,color:C.text,fontSize:13,marginBottom:4}}>{b.title}</div>
                            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:4}}>
                              <span style={{background:`${typeColor(b.type)}15`,color:typeColor(b.type),padding:'1px 7px',borderRadius:99,fontSize:11}}>{b.type}</span>
                              <span style={{color:C.text3,fontSize:12}}>Target: <strong style={{color:C.text2}}>{b.keyword}</strong></span>
                            </div>
                            <div style={{color:C.text3,fontSize:12,marginBottom:b.metaDescription?6:0}}>{b.reason}</div>
                            {b.metaDescription && (
                              <div style={{background:`${C.blue}10`,border:`1px solid ${C.blue}20`,borderRadius:6,padding:'6px 8px',marginBottom:4}}>
                                <div style={{fontSize:10,color:C.blue,fontWeight:700,marginBottom:2}}>META DESCRIPTION — paste into Shopify:</div>
                                <div style={{fontSize:11,color:C.text2}}>{b.metaDescription}</div>
                              </div>
                            )}
                            {b.firstParagraph && (
                              <div style={{background:`${C.teal}10`,border:`1px solid ${C.teal}20`,borderRadius:6,padding:'6px 8px'}}>
                                <div style={{fontSize:10,color:C.teal,fontWeight:700,marginBottom:2}}>FIRST PARAGRAPH — copy and start writing:</div>
                                <div style={{fontSize:11,color:C.text2,lineHeight:1.5}}>{b.firstParagraph}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  {r.pillar2_organicSeo.quickWins?.length > 0 && (
                    <Card title="Quick wins this week" icon="⚡" color={C.green}>
                      {r.pillar2_organicSeo.quickWins.map((w,i) => (
                        <div key={i} style={{display:'flex',gap:8,marginBottom:8,fontSize:13,color:C.text2,lineHeight:1.5}}>
                          <span style={{color:C.green,flexShrink:0}}>✓</span>{w}
                        </div>
                      ))}
                    </Card>
                  )}
                  {r.pillar2_organicSeo.keywordGaps?.length > 0 && (
                    <Card title="Keyword gaps — missing opportunity" icon="🎯" color={C.amber}>
                      {r.pillar2_organicSeo.keywordGaps.map((k,i) => (
                        <div key={i} style={{display:'flex',gap:8,marginBottom:8,fontSize:13,color:C.text2,lineHeight:1.5}}>
                          <span style={{color:C.amber,flexShrink:0}}>→</span>{k}
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* ── LOCAL SEO ── */}
            {activeTab==='local' && r.pillar3_localSeo && (
              <div>
                {r.pillar3_localSeo.gbpActions?.length > 0 && (
                  <Card title="Google Business Profile actions" icon="📍" color={C.green}>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {r.pillar3_localSeo.gbpActions.map((a,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:10,padding:12,display:'flex',alignItems:'center',gap:12}}>
                          <span style={{background:`${priorityColor(a.priority)}20`,color:priorityColor(a.priority),padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700,flexShrink:0}}>{a.priority}</span>
                          <div>
                            <span style={{color:C.teal,fontWeight:600,fontSize:12}}>{a.branch} — </span>
                            <span style={{color:C.text,fontSize:13}}>{a.action}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {r.pillar3_localSeo.gbpPostIdeas?.length > 0 && (
                  <Card title="Ready-to-post GBP content — copy and paste directly to Google Business Profile" icon="📝" color={C.accent}>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {r.pillar3_localSeo.gbpPostIdeas.map((p,i) => (
                        <div key={i} style={{background:C.surface2,borderRadius:10,padding:14}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:6}}>
                            <span style={{background:`${C.teal}20`,color:C.teal,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:600}}>{p.branch}</span>
                            <span style={{color:C.text3,fontSize:12}}>{p.product}</span>
                          </div>
                          <div style={{fontSize:13,color:C.text,lineHeight:1.6,background:C.surface,borderRadius:8,padding:12,marginBottom:8}}>
                            {p.postText}
                          </div>
                          <button
                            onClick={() => { navigator.clipboard.writeText(p.postText); setCopiedPost(i); setTimeout(()=>setCopiedPost(null),2000) }}
                            style={{padding:'5px 14px',borderRadius:6,border:'none',background:copiedPost===i?C.green:C.accent,color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer'}}
                          >
                            {copiedPost===i?'✓ Copied!':'📋 Copy post'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  {r.pillar3_localSeo.reviewStrategy && (
                    <Card title="Review strategy this week" icon="⭐" color={C.amber}>
                      <div style={{fontSize:13,color:C.text2,lineHeight:1.7}}>{r.pillar3_localSeo.reviewStrategy}</div>
                    </Card>
                  )}
                  {r.pillar3_localSeo.localKeywordOpportunities?.length > 0 && (
                    <Card title="Local keyword opportunities" icon="🎯" color={C.teal}>
                      {r.pillar3_localSeo.localKeywordOpportunities.map((k,i) => (
                        <div key={i} style={{display:'flex',gap:8,marginBottom:8,fontSize:13,color:C.text2,lineHeight:1.5}}>
                          <span style={{color:C.teal,flexShrink:0}}>→</span>{k}
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
                <div style={{color:C.text2,fontSize:13,marginBottom:16}}>Top {r.top5ActionsThisWeek.length} highest-impact actions this week — prioritised by impact vs effort</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {r.top5ActionsThisWeek.map((a,i) => (
                    <div key={i} style={{background:C.surface,border:`1px solid ${priorityColor(i===0?'urgent':i<3?'high':'medium')}30`,borderRadius:14,padding:16,display:'flex',gap:14,alignItems:'flex-start'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:priorityColor(i===0?'urgent':i<3?'high':'medium'),color:'#000',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{a.priority}</div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6,flexWrap:'wrap'}}>
                          <span style={{fontWeight:700,color:C.text,fontSize:14}}>{a.action}</span>
                          <span style={{background:`${C.accent}20`,color:C.accent2,padding:'1px 8px',borderRadius:99,fontSize:11,fontWeight:600}}>{a.channel}</span>
                          <span style={{background:C.surface2,color:C.text3,padding:'1px 8px',borderRadius:99,fontSize:11}}>{a.effort}</span>
                        </div>
                        <div style={{color:C.green,fontSize:13}}>📈 {a.impact}</div>
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
