import Head from 'next/head'
import { useState, useRef } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const STEPS = [
  { id:1, label:'Upload Google Ads CSV', icon:'📁' },
  { id:2, label:'AI analyses spend', icon:'🧠' },
  { id:3, label:'Paid Ads page updates', icon:'✅' },
]

const SOURCES = [
  { id:'ads', label:'Google Ads CSV', desc:'Download from Google Ads → Reports → Predefined reports → Campaign performance → Download CSV', required:true, color:T.blue, icon:'📊' },
]

// Note: Search Console and GBP Insights are pulled live via API — no upload needed

export default function DataUpload() {
  const [files, setFiles] = useState({})
  const [step, setStep] = useState(1)
  const [analysing, setAnalysing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(null)
  const refs = { ads: useRef() }

  function handleFile(id, file) {
    if (!file || !file.name.endsWith('.csv')) { setError('Please upload a CSV file'); return }
    setFiles(f => ({ ...f, [id]: file }))
    setError('')
  }

  function handleDrop(id, e) {
    e.preventDefault(); setDragOver(null)
    const file = e.dataTransfer.files[0]
    handleFile(id, file)
  }

  async function analyse() {
    if (!files.ads) { setError('Please upload your Google Ads CSV file to continue'); return }
    setAnalysing(true); setStep(2); setError('')
    try {
      // Read Google Ads CSV
      const adsText = await readFile(files.ads)
      const scText = null  // Search Console data is pulled live via API
      const gbpText = null  // GBP Insights data is pulled live via API

      const r = await fetch('/api/analyse-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ads: adsText.slice(0, 8000),
          sc: scText.slice(0, 8000),
          gbp: gbpText ? gbpText.slice(0, 4000) : null,
        })
      })
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Analysis failed')

      // Save results to localStorage for all tabs to read
      localStorage.setItem('cc_data_upload', JSON.stringify({
        timestamp: Date.now(),
        adsFile: files.ads.name,
        scFile: files.sc.name,
        results: d.results,
      }))

      setResults(d.results)
      setStep(3)
    } catch(e) {
      setError(e.message)
      setStep(1)
    }
    setAnalysing(false)
  }

  function readFile(file) {
    return new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = e => res(e.target.result)
      r.onerror = () => rej(new Error('Could not read file'))
      r.readAsText(file)
    })
  }

  function reset() {
    setFiles({}); setStep(1); setResults(null); setError('')
  }

  return (
    <>
      <Head><title>Data Upload — CC Intelligence</title></Head>
      <Shell title="Data Upload" subtitle="Upload Monday reports — entire platform updates automatically">

        {/* Step indicator */}
        <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 20px',marginBottom:16,display:'flex',alignItems:'center',gap:0}}>
          {STEPS.map((s,i) => (
            <div key={s.id} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:'auto'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,
                  background:step>s.id?T.green:step===s.id?T.blue:T.bg,
                  color:step>=s.id?'#fff':T.textMuted,
                  border:`2px solid ${step>s.id?T.green:step===s.id?T.blue:T.border}`,
                  fontWeight:600,
                }}>
                  {step>s.id ? '✓' : s.id}
                </div>
                <span style={{fontSize:12,fontWeight:step===s.id?600:400,color:step===s.id?T.text:T.textMuted,whiteSpace:'nowrap'}}>{s.label}</span>
              </div>
              {i < STEPS.length-1 && <div style={{flex:1,height:2,background:step>s.id?T.green:T.border,margin:'0 12px'}}/>}
            </div>
          ))}
        </div>

        {error && (
          <div style={{background:T.redBg,border:`0.5px solid ${T.redBorder}`,borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:12,color:T.red}}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1 — Upload */}
        {step === 1 && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:12,marginBottom:16}}>
              {SOURCES.map(src => (
                <div key={src.id}
                  onDragOver={e=>{e.preventDefault();setDragOver(src.id)}}
                  onDragLeave={()=>setDragOver(null)}
                  onDrop={e=>handleDrop(src.id,e)}
                  onClick={()=>refs[src.id].current.click()}
                  style={{
                    background:files[src.id]?T.greenBg:T.surface,
                    border:`1.5px dashed ${files[src.id]?T.green:dragOver===src.id?src.color:T.border}`,
                    borderRadius:8,padding:20,cursor:'pointer',textAlign:'center',transition:'all 0.15s',
                  }}>
                  <input ref={refs[src.id]} type="file" accept=".csv" style={{display:'none'}} onChange={e=>handleFile(src.id,e.target.files[0])}/>
                  <div style={{fontSize:24,marginBottom:8}}>{files[src.id]?'✅':src.icon}</div>
                  <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:4}}>
                    {src.label}
                    {src.required && <span style={{color:T.red,marginLeft:3}}>*</span>}
                  </div>
                  {files[src.id] ? (
                    <div style={{fontSize:11,color:T.green,fontWeight:500}}>{files[src.id].name}</div>
                  ) : (
                    <div style={{fontSize:11,color:T.textMuted,lineHeight:1.4}}>{src.desc}</div>
                  )}
                  {files[src.id] && (
                    <button onClick={e=>{e.stopPropagation();setFiles(f=>{const u={...f};delete u[src.id];return u})}}
                      style={{marginTop:8,fontSize:10,color:T.textMuted,background:'none',border:`0.5px solid ${T.border}`,borderRadius:4,padding:'2px 8px'}}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* How to download guide */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>How to download the reports</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:T.blue,marginBottom:6}}>Google Ads CSV</div>
                  {['Go to ads.google.com','Click Reports → Predefined reports','Select "Campaign" report','Set date range to last 12 months','Click Download → CSV'].map((s,i)=>(
                    <div key={i} style={{display:'flex',gap:7,marginBottom:4,alignItems:'flex-start'}}>
                      <div style={{width:16,height:16,borderRadius:'50%',background:T.blueBg,color:T.blue,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>{i+1}</div>
                      <span style={{fontSize:11,color:T.textMuted}}>{s}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:T.green,marginBottom:6}}>Search Console CSV</div>
                  {['Go to search.google.com/search-console','Select cchairandbeauty.com','Click Performance → Search results','Set date range to last 3 months','Click Export → Download CSV'].map((s,i)=>(
                    <div key={i} style={{display:'flex',gap:7,marginBottom:4,alignItems:'flex-start'}}>
                      <div style={{width:16,height:16,borderRadius:'50%',background:T.greenBg,color:T.green,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>{i+1}</div>
                      <span style={{fontSize:11,color:T.textMuted}}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={analyse} disabled={!files.ads||!files.sc}
              style={{padding:'10px 28px',fontSize:13,fontWeight:600,color:'#fff',background:(!files.ads||!files.sc)?T.border:T.green,border:'none',borderRadius:8,cursor:(!files.ads||!files.sc)?'not-allowed':'pointer'}}>
              Analyse reports →
            </button>
          </div>
        )}

        {/* Step 2 — Analysing */}
        {step === 2 && analysing && (
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:48,textAlign:'center'}}>
            <div style={{fontSize:36,marginBottom:16}}>🧠</div>
            <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:8}}>AI is analysing your reports</div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:24}}>Reading Google Ads and Search Console data — takes about 30 seconds</div>
            <div style={{display:'flex',flexDirection:'column',gap:8,maxWidth:400,margin:'0 auto',textAlign:'left'}}>
              {['Reading Google Ads campaign data...','Identifying wasted spend and quick wins...','Analysing Search Console rankings...','Finding keyword opportunities...','Generating weekly task list...','Writing platform updates...'].map((msg,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:T.textMuted}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:T.blue,flexShrink:0,animation:'pulse 1s ease-in-out infinite',animationDelay:`${i*0.2}s`}}/>
                  {msg}
                </div>
              ))}
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
          </div>
        )}

        {/* Step 3 — Results */}
        {step === 3 && results && (
          <div>
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>✅</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:T.green}}>Platform updated successfully</div>
                <div style={{fontSize:11,color:T.textMuted}}>All tabs have been updated with the latest data</div>
              </div>
            </div>

            {/* What updated */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10,marginBottom:16}}>
              {[
                { icon:'📊', label:'Paid Ads', desc:'ROAS, wasted spend, top converters updated', color:T.blue },
                { icon:'🔍', label:'Organic SEO', desc:'Rankings, quick wins, CTR opportunities updated', color:T.green },
                { icon:'📝', label:'Blog Planner', desc:'This week\'s 21 posts reprioritised by data', color:T.purple },
                { icon:'✅', label:'Tasks', desc:'Fresh Monday task list generated', color:T.amber },
                { icon:'📋', label:'Weekly Report', desc:'Full management summary auto-written', color:T.textMuted },
                { icon:'📍', label:'Local SEO', desc:'Branch visibility and actions updated', color:T.red },
              ].map((u,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{fontSize:18,marginBottom:6}}>{u.icon}</div>
                  <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:3}}>{u.label} ✓</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{u.desc}</div>
                </div>
              ))}
            </div>

            {/* AI Summary */}
            {results.summary && (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:10}}>This week's key findings</div>
                <div style={{fontSize:12,color:T.textMuted,lineHeight:1.7,whiteSpace:'pre-line'}}>{results.summary}</div>
              </div>
            )}

            {/* Top actions */}
            {results.topActions && results.topActions.length > 0 && (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:10}}>Top 5 actions this week</div>
                {results.topActions.map((action,i)=>(
                  <div key={i} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:i<results.topActions.length-1?`0.5px solid ${T.borderLight}`:'none'}}>
                    <div style={{width:20,height:20,borderRadius:'50%',background:i<2?T.redBg:T.amberBg,color:i<2?T.red:T.amber,fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                    <span style={{fontSize:12,color:T.text,lineHeight:1.4}}>{action}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={reset} style={{fontSize:12,color:T.textMuted,background:'none',border:`0.5px solid ${T.border}`,borderRadius:6,padding:'7px 16px'}}>
              Upload new reports
            </button>
          </div>
        )}
      </Shell>
    </>
  )
}
