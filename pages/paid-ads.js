import Head from 'next/head'
import { useState, useRef } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117',surface:'#1a1d27',surface2:'#22263a',border:'#2e3347',
  text:'#e8eaf0',text2:'#8b90a7',text3:'#555b75',
  green:'#22c55e',amber:'#f59e0b',red:'#ef4444',
  blue:'#3b82f6',accent:'#6366f1',accent2:'#818cf8',teal:'#14b8a6',purple:'#a855f7',
}

const SHEET_IDS = {
  campaigns:   '1qULuI_YAOIZRM5tebrz9VAss5BT4RO21DU_zg9Yfy7M',
  devices:     '1QxkUwDLGjq-W8GhWH-9QFlhX9D5Ly8fXdc6hsq96IBk',
  locations:   '1pU7GUJkCuJ2CIbVbPDDfqOlF1-7fjFzbC0q3pRII1qc',
  shopping:    '1RGqr8VbHb-TXdFRRhVSCzKiYg5-G3mJqMpkKYBinLlE',
  searchTerms: '19hyImj3WVjVFBf_KUuB61975JuQ7kv-tqjTbQFM-V0g',
}

const NEGATIVE_KEYWORDS = [
  { cat:'Supermarket brands', color:C.red, kws:['head and shoulders','tresemme','pantene','dove shampoo','alberto balsam','herbal essences','vo5','elvive','garnier shampoo','loreal elvive'] },
  { cat:'Wrong products',     color:C.amber, kws:['mustard oil cooking','olive oil ear drops','olive oil cooking','coconut oil cooking','baby oil','colgate','cerave','neutrogena','st ives','simple moisturizer'] },
  { cat:'Irrelevant searches', color:C.blue, kws:['eyebrow shapes','eyebrow razor','fake tan','veet cream','coal tar shampoo','apple cider vinegar'] },
  { cat:'Zero-intent brands', color:C.text3, kws:['parachute coconut oil','vatika hair oil','alberto balsam','inecto hair dye'] },
]

const CODES = [
  { code:'WIGDEAL15', pct:'15%', cat:'Wigs', color:C.green },
  { code:'COLOUR10',  pct:'10%', cat:'Hair Dye', color:C.blue },
  { code:'EDGE15',    pct:'15%', cat:'Edge Control', color:C.teal },
  { code:'BRAID10',   pct:'10%', cat:'Braiding Hair', color:C.amber },
  { code:'OIL10',     pct:'10%', cat:'Hair Oils', color:C.red },
  { code:'GROW10',    pct:'10%', cat:'Hair Growth', color:C.purple },
]

function Section({ title, icon, color, children }) {
  return (
    <div style={{ background:C.surface, border:`1px solid ${color}30`, borderRadius:14, overflow:'hidden', marginBottom:16 }}>
      <div style={{ padding:'12px 16px', background:`${color}10`, borderBottom:`1px solid ${color}20`, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <span style={{ fontWeight:700, color, fontSize:14 }}>{title}</span>
      </div>
      <div style={{ padding:16 }}>{children}</div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background:C.surface2, borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
      <div style={{ fontSize:22, fontWeight:800, color }}>{value}</div>
      <div style={{ fontSize:11, color:C.text3, marginTop:3 }}>{label}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = { SCALE:C.green, GROW:C.blue, REDUCE:C.amber, PAUSE:C.red, KILL:'#6b0000' }
  const c = colors[status] || C.text3
  return <span style={{ background:`${c}20`, color:c, padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:700 }}>{status}</span>
}

function TierBadge({ tier }) {
  const c = tier?.includes('Scale')?C.green:tier?.includes('Good')?C.teal:tier?.includes('Watch')?C.amber:C.red
  return <span style={{ fontSize:14 }}>{tier?.split(' ')[0]} </span>
}

export default function PaidAds() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(null)

  async function runAnalysis() {
    setLoading(true); setError(null); setAnalysis(null); setActiveTab('overview')
    setLoadingStep('Reading Google Sheets...')
    try {
      // Step 1 — read all sheets
      const params = new URLSearchParams(SHEET_IDS)
      const r1 = await fetch(`/api/monday-report?step=sheets&${params}`)
      const d1 = await r1.json()
      if (!d1.ok) throw new Error(d1.error || 'Failed to read sheets')

      setLoadingStep('AI analysing campaigns, devices, locations, keywords...')

      // Step 2 — dedicated paid ads AI analysis
      const r2 = await fetch('/api/paid-ads-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheets: d1.sheets })
      })
      const d2 = await r2.json()
      if (!d2.ok) throw new Error(d2.error || 'Analysis failed')
      setAnalysis(d2)
    } catch(e) { setError(e.message) }
    setLoading(false); setLoadingStep('')
  }

  const tabs = [
    { id:'overview',  label:'Overview',          icon:'📊' },
    { id:'campaigns', label:'Campaigns',          icon:'📢' },
    { id:'devices',   label:'By Device',          icon:'📱' },
    { id:'locations', label:'Locations (Top 10)', icon:'📍' },
    { id:'keywords',  label:'Search Terms',       icon:'🔍' },
    { id:'shopping',  label:'Shopping',           icon:'🛒' },
    { id:'killers',   label:'ROI Killers',        icon:'💀' },
    { id:'negatives', label:'Negative Keywords',  icon:'🚫' },
  ]

  const a = analysis

  return (
    <>
      <Head>
        <title>Paid Ads — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}button{font-family:inherit}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`}</style>
      </Head>
      <Nav/>

      <div style={{ maxWidth:1300, margin:'0 auto', padding:20 }}>

        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:4 }}>📊 Paid Ads — Full Account Analysis</h1>
            <p style={{ color:C.text2, fontSize:13, lineHeight:1.6 }}>
              Live data from your Google Ads Sheets — campaigns, devices, locations, search terms, shopping. Every number you need to maximise ROI.
            </p>
          </div>
          <button onClick={runAnalysis} disabled={loading} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:loading?C.surface2:C.accent, color:loading?C.text3:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', flexShrink:0 }}>
            {loading ? `⟳ ${loadingStep}` : '🔄 Run Full Analysis'}
          </button>
        </div>

        {error && <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}`, borderRadius:9, padding:12, marginBottom:16, color:C.red, fontSize:13 }}>❌ {error}</div>}

        {!a && !loading && (
          <div style={{ background:C.surface, border:`2px dashed ${C.border}`, borderRadius:16, padding:60, textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:44, marginBottom:12 }}>📊</div>
            <div style={{ fontWeight:800, color:C.text, fontSize:18, marginBottom:8 }}>Full Google Ads Account Analysis</div>
            <div style={{ color:C.text2, fontSize:13, maxWidth:520, margin:'0 auto 12px', lineHeight:1.6 }}>
              Reads your live Google Sheets and gives you everything: campaigns by ROI, devices, top 10 locations by CPA, every wasted search term, shopping product performance, and an exact list of what to kill, what to scale, and what to fix.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, maxWidth:700, margin:'20px auto', textAlign:'left' }}>
              {[
                '✅ Campaigns ranked by ROAS',
                '✅ Mobile vs Desktop vs Tablet',
                '✅ Top 10 locations by CPA/ROI',
                '✅ Wasted spend by search term',
                '✅ Shopping product performance',
                '✅ Bad campaigns to pause/kill',
                '✅ Negative keywords to add now',
                '✅ Exact bid changes to make',
              ].map((item,i) => (
                <div key={i} style={{ fontSize:12, color:C.text2, background:C.surface2, borderRadius:7, padding:'8px 10px' }}>{item}</div>
              ))}
            </div>
            <button onClick={runAnalysis} style={{ padding:'12px 32px', borderRadius:10, border:'none', background:C.accent, color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer' }}>
              🔄 Run Full Analysis Now
            </button>
          </div>
        )}

        {loading && (
          <div style={{ background:C.surface, borderRadius:14, padding:50, textAlign:'center', marginBottom:16 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>⟳</div>
            <div style={{ fontWeight:700, color:C.text, fontSize:16, marginBottom:6 }}>{loadingStep}</div>
            <div style={{ color:C.text3, fontSize:13 }}>Reading 5 Google Sheets + running deep AI analysis across all dimensions</div>
          </div>
        )}

        {a && (
          <>
            {/* TABS */}
            <div style={{ display:'flex', gap:1, marginBottom:18, borderBottom:`1px solid ${C.border}`, overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                  padding:'8px 14px', border:'none', background:'none', whiteSpace:'nowrap',
                  borderBottom:activeTab===t.id?`2px solid ${C.accent}`:'2px solid transparent',
                  color:activeTab===t.id?C.accent2:C.text3,
                  fontWeight:activeTab===t.id?700:400,
                  fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4, marginBottom:-1,
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeTab==='overview' && (
              <div>
                {a.summary && a.summary.trim() !== '' && (
                  <div style={{ background:`${C.amber}08`, border:`1px solid ${C.amber}20`, borderRadius:11, padding:14, marginBottom:16, fontSize:13, color:C.amber, lineHeight:1.7 }}>
                    💡 {a.summary}
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:16 }}>
                  <Stat label="Total Spend" value={a.totalSpend||'—'} color={C.red}/>
                  <Stat label="Total Revenue" value={a.totalRevenue||'—'} color={C.green}/>
                  <Stat label="Overall ROAS" value={a.overallROAS||'—'} color={C.blue}/>
                  <Stat label="Overall CPA" value={a.overallCPA||'—'} color={C.amber}/>
                  <Stat label="Conversions" value={a.totalConversions||'—'} color={C.teal}/>
                </div>
                {(!a.summary || a.summary.trim() === '') && (
                  <div style={{background:`${C.amber}10`,border:`1px solid ${C.amber}30`,borderRadius:10,padding:12,marginBottom:14,fontSize:13,color:C.amber}}>
                    ⚠️ Summary not generated — the AI analysis may have timed out on the first run. Click <strong>🔄 Run Full Analysis</strong> again to get fresh results.
                  </div>
                )}
                {a.topUrgentActions?.length > 0 && (
                  <Section title="Top urgent actions — do these today" icon="🚨" color={C.red}>
                    {a.topUrgentActions.map((ac,i) => (
                      <div key={i} style={{ display:'flex', gap:8, marginBottom:9, fontSize:13, color:C.text2, lineHeight:1.5, paddingBottom:9, borderBottom:i<a.topUrgentActions.length-1?`1px solid ${C.border}`:'none' }}>
                        <div style={{ width:22, height:22, borderRadius:'50%', background:i===0?C.red:i<3?C.amber:C.blue, color:'#000', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
                        <div>{ac}</div>
                      </div>
                    ))}
                  </Section>
                )}
                {/* ROI scorecard */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                  {[
                    { label:'Best performing campaign', value:a.bestCampaign, color:C.green, icon:'🏆' },
                    { label:'Worst performing campaign', value:a.worstCampaign, color:C.red, icon:'💀' },
                    { label:'Best location by CPA', value:a.bestLocation, color:C.teal, icon:'📍' },
                  ].map((s,i) => (
                    <div key={i} style={{ background:C.surface, border:`1px solid ${s.color}30`, borderRadius:12, padding:14 }}>
                      <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
                      <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>{s.label}</div>
                      <div style={{ fontWeight:700, color:s.color, fontSize:14 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CAMPAIGNS ── */}
            {activeTab==='campaigns' && (
              <div>
                <div style={{ color:C.text2, fontSize:13, marginBottom:14 }}>All campaigns ranked by ROAS — what to scale, what to kill</div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {(a.campaigns||[]).map((c,i) => (
                    <div key={i} style={{ background:C.surface, border:`1px solid ${c.status==='SCALE'?C.green:c.status==='GROW'?C.blue:c.status==='PAUSE'||c.status==='KILL'?C.red:C.amber}30`, borderRadius:12, padding:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, flexWrap:'wrap', gap:8 }}>
                        <div style={{ fontWeight:700, color:C.text, fontSize:15 }}>{c.name}</div>
                        <StatusBadge status={c.status}/>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:12 }}>
                        {[
                          { k:'Spend', v:c.spend, col:C.text2 },
                          { k:'Revenue', v:c.revenue, col:C.green },
                          { k:'ROAS', v:c.roas, col:c.roas?.replace('x','')>=3?C.green:c.roas?.replace('x','')>=2?C.blue:C.red },
                          { k:'CPA', v:c.cpa, col:C.amber },
                          { k:'Conv.', v:c.conversions, col:C.teal },
                          { k:'Clicks', v:c.clicks, col:C.text2 },
                        ].map(m => (
                          <div key={m.k} style={{ background:C.surface2, borderRadius:7, padding:'7px 10px' }}>
                            <div style={{ fontSize:10, color:C.text3 }}>{m.k}</div>
                            <div style={{ fontWeight:700, color:m.col, fontSize:13 }}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:`${c.status==='SCALE'?C.green:c.status==='GROW'?C.blue:c.status==='PAUSE'||c.status==='KILL'?C.red:C.amber}10`, borderRadius:8, padding:'8px 12px', fontSize:13, color:c.status==='SCALE'?C.green:c.status==='GROW'?C.blue:c.status==='PAUSE'||c.status==='KILL'?C.red:C.amber }}>
                        → {c.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── BY DEVICE ── */}
            {activeTab==='devices' && (
              <div>
                <div style={{ color:C.text2, fontSize:13, marginBottom:14 }}>Performance by device — where to increase or decrease bids across all campaigns</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:16 }}>
                  {(a.devices||[]).map((d,i) => (
                    <div key={i} style={{ background:C.surface, border:`1px solid ${C.teal}30`, borderRadius:14, padding:18, textAlign:'center' }}>
                      <div style={{ fontSize:40, marginBottom:8 }}>{d.device==='Mobile'?'📱':d.device==='Desktop'?'🖥️':'📟'}</div>
                      <div style={{ fontWeight:800, color:C.text, fontSize:17, marginBottom:12 }}>{d.device}</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                        {[
                          { k:'Spend', v:d.spend, col:C.text2 },
                          { k:'Revenue', v:d.revenue, col:C.green },
                          { k:'ROAS', v:d.roas, col:C.blue },
                          { k:'CPA', v:d.cpa, col:C.amber },
                          { k:'Conversions', v:d.conversions, col:C.teal },
                          { k:'Clicks', v:d.clicks, col:C.text2 },
                        ].map(m => (
                          <div key={m.k} style={{ background:C.surface2, borderRadius:7, padding:'6px 8px' }}>
                            <div style={{ fontSize:9, color:C.text3 }}>{m.k}</div>
                            <div style={{ fontWeight:700, color:m.col, fontSize:13 }}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:`${C.teal}15`, borderRadius:8, padding:'8px 12px', fontSize:12, color:C.teal, fontWeight:600 }}>
                        {d.bidRecommendation}
                      </div>
                      <div style={{ marginTop:8, fontSize:12, color:C.text3, lineHeight:1.5 }}>{d.insight}</div>
                    </div>
                  ))}
                </div>

                {a.deviceByCampaign?.length > 0 && (
                  <Section title="Device performance by campaign — where to set bid adjustments" icon="⚙️" color={C.blue}>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {a.deviceByCampaign.map((d,i) => (
                        <div key={i} style={{ background:C.surface2, borderRadius:9, padding:'10px 14px', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 2fr', gap:10, alignItems:'center' }}>
                          <div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{d.campaign}</div>
                          <div style={{ fontSize:12 }}><span style={{ fontSize:10, color:C.text3 }}>Device </span><span style={{ color:C.text }}>{d.device}</span></div>
                          <div style={{ fontSize:12, color:C.green, fontWeight:600 }}>{d.roas} ROAS</div>
                          <div style={{ fontSize:12, color:C.amber }}>{d.cpa} CPA</div>
                          <div style={{ fontSize:11, color:C.blue }}>{d.action}</div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            )}

            {/* ── LOCATIONS ── */}
            {activeTab==='locations' && (
              <div>
                <div style={{ color:C.text2, fontSize:13, marginBottom:14 }}>Top 10 locations by ROI — where to increase bids, where to exclude entirely</div>

                {a.topLocationsByROI?.length > 0 && (
                  <Section title="🔥 Top locations by ROI — scale these" icon="🏆" color={C.green}>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {a.topLocationsByROI.map((l,i) => (
                        <div key={i} style={{ background:C.surface2, borderRadius:9, padding:'11px 14px', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr 2fr', gap:10, alignItems:'center' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:24, height:24, borderRadius:'50%', background:C.green, color:'#000', fontSize:12, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
                            <span style={{ fontWeight:600, color:C.text, fontSize:13 }}>{l.city}</span>
                          </div>
                          <div style={{ fontSize:12 }}><div style={{ fontSize:9, color:C.text3 }}>Spend</div><div style={{ color:C.text }}>{l.spend}</div></div>
                          <div style={{ fontSize:12 }}><div style={{ fontSize:9, color:C.text3 }}>Conv.</div><div style={{ color:C.green, fontWeight:700 }}>{l.conversions}</div></div>
                          <div style={{ fontSize:12 }}><div style={{ fontSize:9, color:C.text3 }}>Conv. Value</div><div style={{ color:C.green }}>{l.convValue}</div></div>
                          <div style={{ fontSize:12 }}><div style={{ fontSize:9, color:C.text3 }}>CPA</div><div style={{ color:C.amber, fontWeight:700 }}>{l.cpa}</div></div>
                          <div style={{ fontSize:12 }}><div style={{ fontSize:9, color:C.text3 }}>ROI</div><div style={{ color:C.blue, fontWeight:700 }}>{l.roi}</div></div>
                          <div style={{ fontSize:11, color:C.green }}>{l.action}</div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {a.wastedLocations?.length > 0 && (
                  <Section title="❌ Wasted locations — exclude these immediately" icon="💸" color={C.red}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:10 }}>
                      {a.wastedLocations.map((l,i) => (
                        <div key={i} style={{ background:C.surface2, borderRadius:8, padding:10 }}>
                          <div style={{ fontWeight:600, color:C.text, fontSize:13, marginBottom:4 }}>{l.city}</div>
                          <div style={{ display:'flex', gap:8, fontSize:12 }}>
                            <span style={{ color:C.red }}>{l.spend} wasted</span>
                            <span style={{ color:C.text3 }}>0 conversions</span>
                          </div>
                          <div style={{ fontSize:11, color:C.red, marginTop:4 }}>→ {l.action}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:`${C.red}08`, border:`1px solid ${C.red}20`, borderRadius:8, padding:10, fontSize:12, color:C.red }}>
                      💡 Total wasted on zero-conversion locations: <strong>{a.totalWastedLocationSpend}</strong> — exclude all from Google Ads Locations settings
                    </div>
                  </Section>
                )}

                {a.locationInsights && (
                  <Section title="Location strategy insights" icon="💡" color={C.blue}>
                    <div style={{ fontSize:13, color:C.text2, lineHeight:1.7 }}>{a.locationInsights}</div>
                  </Section>
                )}
              </div>
            )}

            {/* ── SEARCH TERMS ── */}
            {activeTab==='keywords' && (
              <div>
                {a.topConvertingTerms?.length > 0 && (
                  <Section title="✅ Top converting search terms — increase bids on these" icon="🏆" color={C.green}>
                    <div style={{ background:C.surface2, borderRadius:10, overflow:'hidden' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr 1fr 2fr', padding:'7px 12px', borderBottom:`1px solid ${C.border}` }}>
                        {['Search Term','Clicks','Cost','Conv.','CPA','Action'].map(h => (
                          <span key={h} style={{ fontSize:10, fontWeight:700, color:C.text3, textTransform:'uppercase' }}>{h}</span>
                        ))}
                      </div>
                      {a.topConvertingTerms.map((t,i) => (
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr 1fr 2fr', padding:'8px 12px', borderBottom:i<a.topConvertingTerms.length-1?`1px solid ${C.border}`:'none', alignItems:'center' }}>
                          <span style={{ fontSize:13, color:C.text, fontWeight:500 }}>{t.term}</span>
                          <span style={{ fontSize:12, color:C.text2 }}>{t.clicks}</span>
                          <span style={{ fontSize:12, color:C.text2 }}>{t.cost}</span>
                          <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>{t.conversions}</span>
                          <span style={{ fontSize:12, color:C.amber }}>{t.cpa}</span>
                          <span style={{ fontSize:11, color:C.green }}>{t.action}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {a.wastedTerms?.length > 0 && (
                  <Section title="💸 Zero-conversion search terms — add as negative keywords" icon="🚫" color={C.red}>
                    <div style={{ background:C.surface2, borderRadius:10, overflow:'hidden', marginBottom:12 }}>
                      <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr 3fr', padding:'7px 12px', borderBottom:`1px solid ${C.border}` }}>
                        {['Search Term','Clicks','Cost','Conv.','Why Irrelevant'].map(h => (
                          <span key={h} style={{ fontSize:10, fontWeight:700, color:C.text3, textTransform:'uppercase' }}>{h}</span>
                        ))}
                      </div>
                      {a.wastedTerms.map((t,i) => (
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr 3fr', padding:'8px 12px', borderBottom:i<a.wastedTerms.length-1?`1px solid ${C.border}`:'none', alignItems:'center' }}>
                          <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{t.term}</span>
                          <span style={{ fontSize:12, color:C.text2 }}>{t.clicks}</span>
                          <span style={{ fontSize:12, color:C.red }}>{t.cost}</span>
                          <span style={{ fontSize:12, color:C.text3 }}>0</span>
                          <span style={{ fontSize:11, color:C.text3 }}>{t.reason}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ fontSize:12, color:C.red }}>Total wasted: <strong>{a.totalWastedTermSpend}</strong></div>
                      <button onClick={()=>{navigator.clipboard.writeText((a.wastedTerms||[]).map(t=>t.term).join('\n'));setCopied('terms');setTimeout(()=>setCopied(null),2000)}}
                        style={{ padding:'5px 14px', borderRadius:7, border:'none', background:copied==='terms'?C.green:C.red, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                        {copied==='terms'?'✓ Copied!':'📋 Copy all as negative keywords'}
                      </button>
                    </div>
                  </Section>
                )}

                {a.keywordOpportunities?.length > 0 && (
                  <Section title="🚀 Keyword opportunities — low cost, high potential" icon="💡" color={C.blue}>
                    {a.keywordOpportunities.map((k,i) => (
                      <div key={i} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13, color:C.text2, lineHeight:1.5 }}>
                        <span style={{ color:C.blue, flexShrink:0 }}>→</span>{k}
                      </div>
                    ))}
                  </Section>
                )}
              </div>
            )}

            {/* ── SHOPPING ── */}
            {activeTab==='shopping' && (
              <div>
                <div style={{ color:C.text2, fontSize:13, marginBottom:14 }}>Shopping product performance — which products are getting clicks but no sales</div>
                {a.shoppingInsights && (
                  <div style={{ background:`${C.amber}08`, border:`1px solid ${C.amber}20`, borderRadius:10, padding:12, marginBottom:14, fontSize:13, color:C.amber, lineHeight:1.6 }}>
                    💡 {a.shoppingInsights}
                  </div>
                )}
                {a.topShoppingProducts?.length > 0 && (
                  <Section title="Top clicked shopping products" icon="🛒" color={C.teal}>
                    <div style={{ background:C.surface2, borderRadius:10, overflow:'hidden' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr 1fr 2fr', padding:'7px 12px', borderBottom:`1px solid ${C.border}` }}>
                        {['Product ID','Clicks','Impressions','CTR','Conv.','Action'].map(h => (
                          <span key={h} style={{ fontSize:10, fontWeight:700, color:C.text3, textTransform:'uppercase' }}>{h}</span>
                        ))}
                      </div>
                      {a.topShoppingProducts.map((p,i) => (
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr 1fr 2fr', padding:'8px 12px', borderBottom:i<a.topShoppingProducts.length-1?`1px solid ${C.border}`:'none', alignItems:'center' }}>
                          <span style={{ fontSize:11, color:C.text2, fontFamily:'monospace' }}>{p.id?.substring(0,30)}...</span>
                          <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>{p.clicks}</span>
                          <span style={{ fontSize:12, color:C.text2 }}>{p.impressions}</span>
                          <span style={{ fontSize:12, color:C.blue }}>{p.ctr}</span>
                          <span style={{ fontSize:12, color:p.conversions>0?C.green:C.red }}>{p.conversions}</span>
                          <span style={{ fontSize:11, color:p.conversions>0?C.green:C.amber }}>{p.action}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
                {a.shoppingActions?.length > 0 && (
                  <Section title="Shopping feed actions" icon="⚙️" color={C.blue}>
                    {a.shoppingActions.map((s,i) => (
                      <div key={i} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13, color:C.text2, lineHeight:1.5 }}>
                        <span style={{ color:C.blue, fontWeight:700, flexShrink:0 }}>{i+1}.</span>{s}
                      </div>
                    ))}
                  </Section>
                )}
              </div>
            )}

            {/* ── ROI KILLERS ── */}
            {activeTab==='killers' && (
              <div>
                <div style={{ background:`${C.red}08`, border:`1px solid ${C.red}30`, borderRadius:11, padding:14, marginBottom:16, fontSize:13, color:C.red, lineHeight:1.6 }}>
                  💀 These are the exact things costing you money right now. Fix these first before increasing any budgets.
                </div>

                {[
                  { title:'Bad campaigns — losing money', icon:'📢', color:C.red, items:a.badCampaigns },
                  { title:'Bad search terms — irrelevant searches costing you', icon:'🔍', color:C.amber, items:a.badKeywords },
                  { title:'Bad locations — spend with zero return', icon:'📍', color:C.red, items:a.badLocations },
                  { title:'Bad products — clicks but zero sales', icon:'🛒', color:C.amber, items:a.badProducts },
                  { title:'Bad match types — too broad, catching wrong searches', icon:'⚙️', color:C.blue, items:a.badMatchTypes },
                ].map((section,i) => section.items?.length > 0 && (
                  <Section key={i} title={section.title} icon={section.icon} color={section.color}>
                    {section.items.map((item,j) => (
                      <div key={j} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13, color:C.text2, lineHeight:1.5, paddingBottom:8, borderBottom:j<section.items.length-1?`1px solid ${C.border}`:'none' }}>
                        <span style={{ color:section.color, fontWeight:700, flexShrink:0 }}>✗</span>{item}
                      </div>
                    ))}
                  </Section>
                ))}
              </div>
            )}

            {/* ── NEGATIVE KEYWORDS ── */}
            {activeTab==='negatives' && (
              <div>
                <div style={{ color:C.text2, fontSize:13, marginBottom:14 }}>
                  Add ALL of these to Google Ads → Tools & Settings → Shared Library → Negative keyword lists → Apply to all campaigns
                </div>

                {/* AI-generated negatives */}
                {a.negativeKeywords?.length > 0 && (
                  <Section title="AI-identified negative keywords from your search terms data" icon="🤖" color={C.red}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                      {a.negativeKeywords.map((kw,i) => (
                        <span key={i} style={{ background:C.surface2, color:C.text2, padding:'4px 10px', borderRadius:6, fontSize:12 }}>{kw}</span>
                      ))}
                    </div>
                    <button onClick={()=>{navigator.clipboard.writeText(a.negativeKeywords.join('\n'));setCopied('ai-neg');setTimeout(()=>setCopied(null),2000)}}
                      style={{ padding:'7px 16px', borderRadius:7, border:'none', background:copied==='ai-neg'?C.green:C.red, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                      {copied==='ai-neg'?'✓ Copied!':'📋 Copy all AI negative keywords'}
                    </button>
                  </Section>
                )}

                {/* Permanent negative lists */}
                {NEGATIVE_KEYWORDS.map((cat,i) => (
                  <Section key={i} title={cat.cat} icon="🚫" color={cat.color}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                      {cat.kws.map((kw,j) => (
                        <span key={j} style={{ background:C.surface2, color:C.text2, padding:'3px 9px', borderRadius:5, fontSize:12 }}>{kw}</span>
                      ))}
                    </div>
                    <button onClick={()=>{navigator.clipboard.writeText(cat.kws.join('\n'));setCopied(`cat-${i}`);setTimeout(()=>setCopied(null),2000)}}
                      style={{ padding:'5px 12px', borderRadius:6, border:'none', background:copied===`cat-${i}`?C.green:cat.color, color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer' }}>
                      {copied===`cat-${i}`?'✓ Copied!':'📋 Copy'}
                    </button>
                  </Section>
                ))}

                {/* Discount codes */}
                <Section title="Discount codes — use in ad descriptions" icon="🎟️" color={C.accent}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                    {CODES.map((c,i) => (
                      <div key={i} style={{ background:C.surface2, borderRadius:10, padding:12, border:`1px solid ${c.color}30` }}>
                        <div style={{ fontSize:18, fontWeight:800, color:c.color, fontFamily:'monospace', marginBottom:3 }}>{c.code}</div>
                        <div style={{ color:C.text3, fontSize:12, marginBottom:8 }}>{c.pct} off · {c.cat}</div>
                        <button onClick={()=>{navigator.clipboard.writeText(c.code);setCopied(`code-${i}`);setTimeout(()=>setCopied(null),2000)}}
                          style={{ padding:'4px 10px', borderRadius:5, border:'none', background:copied===`code-${i}`?C.green:c.color, color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer' }}>
                          {copied===`code-${i}`?'✓':'📋 Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
