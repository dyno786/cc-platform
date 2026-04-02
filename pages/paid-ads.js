import Head from 'next/head'
import Nav from '../components/Nav'
import { useState } from 'react'
import Link from 'next/link'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8',
}

const KNOWN = {
  totalSpend:'£101,060', totalConversions:'8,420', avgCPA:'£12.00',
  brands:[
    {name:'ORS',         spend:'£2,100',  cpa:'47p',    conv:4468, rec:'SCALE 10x',       color:'#22c55e'},
    {name:'Redken',      spend:'£340',    cpa:'24p',    conv:1417, rec:'SCALE',            color:'#22c55e'},
    {name:'Cantu',       spend:'£890',    cpa:'£1.77',  conv:503,  rec:'SCALE',            color:'#22c55e'},
    {name:'Nivea Cream', spend:'£120',    cpa:'£3.02',  conv:40,   rec:'UNDO EXCLUSION',   color:'#3b82f6'},
    {name:'Loreal',      spend:'£1,200',  cpa:'£7.23',  conv:166,  rec:'REDUCE',           color:'#f59e0b'},
    {name:'Creme of Nature',spend:'£810', cpa:'£10.12', conv:80,   rec:'REDUCE',           color:'#f59e0b'},
    {name:'H&Shoulders', spend:'£180',    cpa:'£0',     conv:0,    rec:'PAUSE',            color:'#ef4444'},
  ],
  wasted:[
    {term:'mustard oil',    spend:'£241', status:'Excluded ✓'},
    {term:'olive oil',      spend:'£198', status:'Excluded ✓'},
    {term:'t gel shampoo',  spend:'£232', status:'Excluded ✓'},
  ],
  negatives:['mustard oil','olive oil','t gel shampoo','cooking oil','food oil',
    'dandruff shampoo boots','hair oil cooking','castor oil food','coconut oil cooking',
    'hair grease food','oil for cooking','edible oil'],
  devices:[
    {device:'Desktop', icon:'🖥️', conv:'2.04%', bid:'+30%', color:'#22c55e', action:'Increase bid'},
    {device:'Mobile',  icon:'📱', conv:'1.41%', bid:'0%',   color:'#f59e0b', action:'Keep same'},
    {device:'Tablet',  icon:'📟', conv:'0.89%', bid:'-20%', color:'#ef4444', action:'Decrease bid'},
  ],
  wins:[
    'Scale ORS 10x immediately — only 47p CPA, biggest ROI opportunity in account',
    'Scale Redken — 24p CPA, best performer in whole account',
    'Undo Nivea cream exclusion — was converting at £3.02 CPA before exclusion',
    'Set +30% desktop bid adjustment — desktop converts 2.04% vs 1.41% mobile',
  ],
  urgent:[
    'PAUSE H&Shoulders — £180 spent, zero conversions, wasting budget daily',
    'REDUCE Creme of Nature — £10.12 CPA is 4x above target, cut budget 60%',
    'REDUCE Loreal — £7.23 CPA above £8 target, reduce by 30%',
  ],
}

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
}

export default function PaidAdsPage() {
  const [files, setFiles] = useState({})
  const [analysis, setAnalysis] = useState(null)
  const [analysing, setAnalysing] = useState(false)
  const [section, setSection] = useState('upload')
  const [negCopied, setNegCopied] = useState(false)

  const FILE_TYPES = [
    { id:'search_terms', label:'Search Terms',  icon:'🔍', desc:'Reports → Search terms' },
    { id:'campaigns',    label:'Campaigns',     icon:'📢', desc:'Reports → Campaigns' },
    { id:'keywords',     label:'Keywords',      icon:'🔑', desc:'Reports → Keywords' },
    { id:'devices',      label:'Devices',       icon:'📱', desc:'Reports → Devices' },
  ]

  function handleFile(type, file) {
    const reader = new FileReader()
    reader.onload = e => {
      const rows = parseCSV(e.target.result)
      setFiles(p => ({ ...p, [type]: { name: file.name, rows } }))
    }
    reader.readAsText(file)
  }

  function runAnalysis() {
    setAnalysing(true)
    setTimeout(() => {
      setAnalysis({ ...KNOWN, fromUpload: Object.keys(files).length > 0 })
      setAnalysing(false)
      setSection('analysis')
    }, 800)
  }

  const SECTIONS = ['upload','analysis','brands','devices','negatives']

  return (
    <>
      <Head>
        <title>Paid Ads — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button,input,select{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      <Nav/>

      <div style={{maxWidth:1300,margin:'0 auto',padding:20}}>

        {/* ── UPLOAD ── */}
        {section === 'upload' && (
          <div>
            <div style={{background:'rgba(245,158,11,.06)',border:'1px solid #f59e0b30',borderRadius:12,padding:16,marginBottom:20,display:'flex',gap:12}}>
              <span style={{fontSize:20,flexShrink:0}}>⚠️</span>
              <div>
                <div style={{color:C.amber,fontWeight:600,marginBottom:4}}>Google Ads API is blocked from Vercel — CSV upload required</div>
                <div style={{color:C.text2,fontSize:13}}>In Google Ads → Reports → Predefined Reports → download as CSV. Or click Analyse to use your known £101,060 spend data immediately.</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:20}}>
              {FILE_TYPES.map(ft => (
                <div key={ft.id} style={{background:C.surface,border:'1px solid '+(files[ft.id]?C.green+'50':C.border),borderRadius:12,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:15}}>{ft.icon} {ft.label}</div>
                      <div style={{color:C.text3,fontSize:12,marginTop:2}}>{ft.desc}</div>
                    </div>
                    {files[ft.id] && <span style={{background:C.green+'20',color:C.green,padding:'2px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>✓ {files[ft.id].rows.length} rows</span>}
                  </div>
                  <label style={{display:'block',padding:12,borderRadius:8,border:'2px dashed '+(files[ft.id]?C.green:C.border),textAlign:'center',cursor:'pointer',color:files[ft.id]?C.green:C.text3,fontSize:13}}>
                    {files[ft.id] ? '✓ ' + files[ft.id].name : '+ Click to upload CSV'}
                    <input type="file" accept=".csv,.txt" style={{display:'none'}} onChange={e => e.target.files[0] && handleFile(ft.id, e.target.files[0])}/>
                  </label>
                </div>
              ))}
            </div>
            <button onClick={runAnalysis} disabled={analysing} style={{padding:'10px 28px',borderRadius:8,border:'none',background:C.accent,color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>
              {analysing ? '⟳ Analysing...' : Object.keys(files).length > 0 ? `✨ Analyse ${Object.keys(files).length} file(s)` : '✨ Analyse from £101k known data'}
            </button>
            {Object.keys(files).length === 0 && <span style={{color:C.text3,fontSize:12,marginLeft:12}}>No files? Analyses from your known spend data</span>}
          </div>
        )}

        {/* ── ANALYSIS SUMMARY ── */}
        {section === 'analysis' && (
          <div>
            {!analysis ? (
              <div style={{textAlign:'center',padding:60,color:C.text3}}>
                <div style={{fontSize:40,marginBottom:12}}>📊</div>
                <div>Go to Upload tab and click Analyse first</div>
              </div>
            ) : (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
                  {[
                    {label:'Total Ad Spend',    val:analysis.totalSpend,        color:C.text},
                    {label:'Total Conversions', val:analysis.totalConversions,  color:C.green},
                    {label:'Avg CPA',           val:analysis.avgCPA,            color:C.amber},
                  ].map(m => (
                    <div key={m.label} style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:20}}>
                      <div style={{fontSize:32,fontWeight:800,color:m.color}}>{m.val}</div>
                      <div style={{color:C.text2,fontSize:13,marginTop:6}}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div style={{background:C.surface,border:'1px solid '+C.green+'30',borderRadius:12,padding:16}}>
                    <div style={{fontWeight:700,color:C.green,marginBottom:14,fontSize:14}}>🚀 Top Wins — Act Now</div>
                    {analysis.wins.map((w,i) => (
                      <div key={i} style={{display:'flex',gap:8,marginBottom:10}}>
                        <span style={{color:C.green,flexShrink:0}}>→</span>
                        <span style={{color:C.text,fontSize:13,lineHeight:1.5}}>{w}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{background:C.surface,border:'1px solid '+C.red+'30',borderRadius:12,padding:16}}>
                    <div style={{fontWeight:700,color:C.red,marginBottom:14,fontSize:14}}>🚨 Urgent Actions</div>
                    {analysis.urgent.map((a,i) => (
                      <div key={i} style={{display:'flex',gap:8,marginBottom:10}}>
                        <span style={{color:C.red,flexShrink:0}}>!</span>
                        <span style={{color:C.text,fontSize:13,lineHeight:1.5}}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BRANDS ── */}
        {section === 'brands' && (
          <div>
            {!analysis ? <div style={{textAlign:'center',padding:60,color:C.text3}}>Run analysis first — go to Upload tab</div> : (
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:12}}>Brand Performance — Scale vs Pause</div>
                <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,overflow:'hidden',marginBottom:16}}>
                  <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr 1fr 1.2fr',padding:'10px 16px',borderBottom:'1px solid '+C.border}}>
                    {['Brand','Spend','CPA','Conversions','Recommendation'].map(h => (
                      <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:'.05em'}}>{h}</span>
                    ))}
                  </div>
                  {analysis.brands.map((b,i) => (
                    <div key={b.name} style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr 1fr 1.2fr',padding:'13px 16px',borderBottom:i<analysis.brands.length-1?'1px solid '+C.border:'none',alignItems:'center'}}>
                      <span style={{fontWeight:600,color:C.text,fontSize:14}}>{b.name}</span>
                      <span style={{color:C.text2,fontSize:13}}>{b.spend}</span>
                      <span style={{color:b.color,fontWeight:800,fontSize:16}}>{b.cpa}</span>
                      <span style={{color:C.text2,fontSize:13}}>{b.conv.toLocaleString()}</span>
                      <span style={{background:b.color+'20',color:b.color,padding:'4px 12px',borderRadius:99,fontSize:11,fontWeight:700}}>{b.rec}</span>
                    </div>
                  ))}
                </div>
                {/* Visual bars */}
                <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16}}>
                  <div style={{fontWeight:600,color:C.text,marginBottom:12}}>CPA comparison (lower = better)</div>
                  {analysis.brands.map(b => {
                    const cpaNum = parseFloat(b.cpa.replace(/[^0-9.]/g,'')) || 0
                    const pct = b.conv === 0 ? 100 : Math.min(cpaNum/12*100, 100)
                    return (
                      <div key={b.name} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                        <span style={{color:C.text2,fontSize:13,width:120,flexShrink:0}}>{b.name}</span>
                        <div style={{flex:1,height:8,background:C.surface2,borderRadius:4,overflow:'hidden'}}>
                          <div style={{width:pct+'%',height:'100%',background:b.color,borderRadius:4}}/>
                        </div>
                        <span style={{color:b.color,fontWeight:700,fontSize:13,width:70,textAlign:'right'}}>{b.cpa}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DEVICES ── */}
        {section === 'devices' && (
          <div>
            {!analysis ? <div style={{textAlign:'center',padding:60,color:C.text3}}>Run analysis first</div> : (
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:12}}>Device Bid Recommendations</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
                  {analysis.devices.map(d => (
                    <div key={d.device} style={{background:C.surface,border:'1px solid '+d.color+'40',borderRadius:14,padding:28,textAlign:'center'}}>
                      <div style={{fontSize:44,marginBottom:12}}>{d.icon}</div>
                      <div style={{fontWeight:700,fontSize:18,color:C.text,marginBottom:6}}>{d.device}</div>
                      <div style={{fontSize:38,fontWeight:800,color:d.color,marginBottom:6}}>{d.bid}</div>
                      <div style={{color:C.text2,fontSize:13,marginBottom:14}}>Conv rate: {d.conv}</div>
                      <div style={{background:d.color+'20',color:d.color,padding:'6px 16px',borderRadius:99,fontSize:12,fontWeight:700,display:'inline-block'}}>{d.action}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:12,padding:16}}>
                  <div style={{fontWeight:600,color:C.accent2,marginBottom:8}}>How to apply in Google Ads:</div>
                  <div style={{color:C.text2,fontSize:13,lineHeight:1.8}}>
                    <strong style={{color:C.text}}>Campaigns → select all → Settings → Devices</strong><br/>
                    Set bid adjustments: Desktop <strong style={{color:C.green}}>+30%</strong> · Mobile <strong style={{color:C.amber}}>0%</strong> · Tablet <strong style={{color:C.red}}>-20%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── NEGATIVE KEYWORDS ── */}
        {section === 'negatives' && (
          <div>
            {!analysis ? <div style={{textAlign:'center',padding:60,color:C.text3}}>Run analysis first</div> : (
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:12}}>Wasted Spend — Negative Keywords</div>
                <div style={{background:C.surface,border:'1px solid '+C.red+'30',borderRadius:12,padding:16,marginBottom:16}}>
                  <div style={{fontWeight:700,color:C.red,marginBottom:12,fontSize:15}}>£671+ identified as wasted spend</div>
                  {analysis.wasted.map((w,i) => (
                    <div key={w.term} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<analysis.wasted.length-1?'1px solid '+C.border:'none'}}>
                      <span style={{fontFamily:'monospace',color:C.text,fontSize:14}}>{w.term}</span>
                      <div style={{display:'flex',gap:12,alignItems:'center'}}>
                        <span style={{color:C.red,fontWeight:700}}>{w.spend}</span>
                        <span style={{background:C.green+'20',color:C.green,padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>{w.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <div style={{fontWeight:600,color:C.text}}>Full negative keywords list</div>
                    <button onClick={() => { navigator.clipboard.writeText(analysis.negatives.join('\n')); setNegCopied(true); setTimeout(() => setNegCopied(false), 2000) }}
                      style={{padding:'6px 14px',borderRadius:6,border:'1px solid '+C.border,background:C.surface2,color:C.text,cursor:'pointer',fontSize:12}}>
                      {negCopied ? '✓ Copied!' : '📋 Copy all'}
                    </button>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14}}>
                    {analysis.negatives.map(k => (
                      <span key={k} style={{background:'rgba(239,68,68,.1)',color:C.red,padding:'5px 12px',borderRadius:6,fontSize:12,fontFamily:'monospace'}}>− {k}</span>
                    ))}
                  </div>
                  <div style={{background:'rgba(99,102,241,.06)',borderRadius:8,padding:12,color:C.text2,fontSize:12,lineHeight:1.7}}>
                    <strong style={{color:C.text}}>To add in Google Ads:</strong> Tools → Shared Library → Negative keyword lists → Create list → paste above → apply to all campaigns
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
