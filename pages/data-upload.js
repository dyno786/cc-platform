import Head from 'next/head'
import { useState } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const REPORT_TYPES = [
  { id:'ads',      label:'Campaign Performance', icon:'📊', color:T.blue,    desc:'Spend, clicks, conversions per campaign', required:true },
  { id:'terms',    label:'Search Terms',          icon:'🔍', color:'#7c3aed', desc:'Actual queries triggering your ads', required:false },
  { id:'keywords', label:'Keywords',              icon:'🔑', color:'#0969da', desc:'Keyword bids, quality scores, impression share', required:false },
  { id:'devices',  label:'Devices',               icon:'📱', color:'#1a7f37', desc:'Mobile vs desktop vs tablet split', required:false },
  { id:'schedule', label:'When Ads Showed',       icon:'🕐', color:'#9a6700', desc:'Best times and days your ads convert', required:false },
  { id:'auction',  label:'Auction Insights',      icon:'🏆', color:'#cf222e', desc:'Competitors and how often they outrank you', required:false },
]

function extractId(url) {
  const patterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function autoAssign(files) {
  const assignments = {}
  files.forEach(f => {
    const n = f.name.toLowerCase()
    if (n.includes('campaign') || n.includes('performance')) assignments.ads = f.id
    else if (n.includes('search term') || n.includes('search_term')) assignments.terms = f.id
    else if (n.includes('keyword') && !n.includes('term')) assignments.keywords = f.id
    else if (n.includes('device')) assignments.devices = f.id
    else if (n.includes('when') || n.includes('schedule') || n.includes('hour') || n.includes('day')) assignments.schedule = f.id
    else if (n.includes('auction')) assignments.auction = f.id
  })
  return assignments
}

export default function DataUpload() {
  const [driveUrl, setDriveUrl] = useState('https://drive.google.com/drive/folders/1CYCY_VVh0Ac4Fkr6vu8kwbzp_QMPNUfd')
  const [folderFiles, setFolderFiles] = useState([])
  const [loadingFolder, setLoadingFolder] = useState(false)
  const [assignments, setAssignments] = useState({})
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [results, setResults] = useState(null)
  const [pushed, setPushed] = useState(false)
  const [error, setError] = useState('')

  async function loadFolder() {
    const id = extractId(driveUrl)
    if (!id) { setError('Could not extract folder ID from URL'); return }
    setLoadingFolder(true)
    setError('')
    try {
      const isFolder = driveUrl.includes('/folders/')
      if (isFolder) {
        const r = await fetch('/api/list-drive-folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId: id })
        })
        const d = await r.json()
        if (d.ok) {
          setFolderFiles(d.files)
          setAssignments(autoAssign(d.files))
        } else {
          setError(d.error)
        }
      } else {
        setFolderFiles([{ id, name: 'Selected file', mimeType: 'text/csv' }])
        setAssignments({ ads: id })
      }
    } catch(e) {
      setError(e.message)
    }
    setLoadingFolder(false)
  }

  async function fetchFile(fileId) {
    if (!fileId) return null
    const url = `https://drive.google.com/file/d/${fileId}/view`
    try {
      const r = await fetch('/api/fetch-drive-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const text = await r.text()
      const d = JSON.parse(text)
      return d.ok ? d.content : null
    } catch(e) { return null }
  }

  async function analyse() {
    if (!assignments.ads) { setError('Please assign the Campaign Performance report'); return }
    setLoading(true)
    setStep(2)
    setError('')

    // Fetch all assigned files
    const reportData = {}
    for (const type of REPORT_TYPES) {
      if (assignments[type.id]) {
        setStatus(`Reading ${type.label}...`)
        reportData[type.id] = await fetchFile(assignments[type.id])
      }
    }

    setStatus('Running full AI audit across all reports...')
    try {
      const r = await fetch('/api/analyse-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adsText: reportData.ads?.slice(0, 8000) || '',
          termsText: reportData.terms?.slice(0, 4000) || null,
          keywordsText: reportData.keywords?.slice(0, 4000) || null,
          devicesText: reportData.devices?.slice(0, 2000) || null,
          scheduleText: reportData.schedule?.slice(0, 2000) || null,
          auctionText: reportData.auction?.slice(0, 2000) || null,
        })
      })
      const d = await r.json()
      if (d.ok) {
        setResults(d.results)
        setStep(3)
      } else {
        setError(d.error || 'Analysis failed')
        setStep(1)
      }
    } catch(e) {
      setError(e.message)
      setStep(1)
    }
    setLoading(false)
  }

  function pushToPaidAds() {
    try {
      localStorage.setItem('cc_ads_analysis', JSON.stringify(results))
      localStorage.setItem('cc_ads_analysis_date', new Date().toISOString())
      setPushed(true)
      setTimeout(() => window.location.href = '/paid-ads', 1000)
    } catch(e) {
      setError('Could not save: ' + e.message)
    }
  }

  function assign(fileId, reportId) {
    setAssignments(prev => {
      const next = { ...prev }
      // Remove this fileId from any other slot
      Object.keys(next).forEach(k => { if (next[k] === fileId) delete next[k] })
      // Toggle
      if (prev[reportId] === fileId) delete next[reportId]
      else next[reportId] = fileId
      return next
    })
  }

  const assignedCount = Object.keys(assignments).length
  const canAnalyse = !!assignments.ads

  return (
    <>
      <Head><title>Data Upload — CC Intelligence</title></Head>
      <Shell title="Google Ads Full Audit" subtitle="Upload all your reports — AI analyses everything and pushes results across all Paid Ads tabs">

        {/* Live data banner */}
        <div style={{background:T.greenBg,border:'0.5px solid '+T.greenBorder,borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:11,color:T.green}}>
          <strong>Already live via API:</strong> Search Console · GBP Insights · Shopify — no upload needed for those. Only Google Ads reports need uploading.
        </div>

        {error && (
          <div style={{background:'#fff0f0',border:'0.5px solid #ffa0a0',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:12,color:T.red}}>
            ⚠ {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            {/* Drive URL */}
            <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:6}}>Google Drive folder</div>
              <div style={{display:'flex',gap:8}}>
                <input value={driveUrl} onChange={e=>setDriveUrl(e.target.value)}
                  style={{flex:1,padding:'8px 10px',fontSize:12,border:'1px solid '+T.border,borderRadius:7,background:T.bg,color:T.text}}/>
                <button onClick={loadFolder} disabled={loadingFolder} style={{
                  padding:'8px 18px',fontSize:12,fontWeight:700,background:T.blue,
                  color:'#fff',border:'none',borderRadius:7,cursor:'pointer',whiteSpace:'nowrap'
                }}>{loadingFolder?'Loading...':'Load Files'}</button>
              </div>
            </div>

            {/* Report type guide */}
            {folderFiles.length === 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Reports to download from Google Ads</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {REPORT_TYPES.map(r => (
                    <div key={r.id} style={{display:'flex',gap:8,padding:'8px 10px',background:T.bg,borderRadius:6,border:'0.5px solid '+T.border}}>
                      <span style={{fontSize:18,flexShrink:0}}>{r.icon}</span>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:r.color}}>{r.label}{r.required?' *':' (optional)'}</div>
                        <div style={{fontSize:10,color:T.textMuted}}>{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:10,color:T.textMuted,marginTop:8}}>* Required. All others optional but improve analysis quality.</div>
              </div>
            )}

            {/* File list with assignment */}
            {folderFiles.length > 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,overflow:'hidden',marginBottom:12}}>
                <div style={{padding:'10px 14px',borderBottom:'0.5px solid '+T.border,background:T.bg,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:700,color:T.text}}>{folderFiles.length} files found — assign each one</span>
                  <span style={{fontSize:11,color:T.green,fontWeight:600}}>{assignedCount} assigned</span>
                </div>

                {folderFiles.map(f => {
                  const assignedTo = Object.entries(assignments).find(([k,v]) => v === f.id)?.[0]
                  const assignedReport = REPORT_TYPES.find(r => r.id === assignedTo)
                  return (
                    <div key={f.id} style={{padding:'10px 14px',borderBottom:'0.5px solid '+T.borderLight,background:assignedTo?T.greenBg:T.surface}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:assignedTo?0:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:600,color:T.text}}>{f.name}</div>
                          {assignedTo && (
                            <div style={{fontSize:10,color:T.green,fontWeight:600,marginTop:2}}>
                              ✓ Assigned as {assignedReport?.label}
                            </div>
                          )}
                        </div>
                        {assignedTo && (
                          <button onClick={()=>assign(f.id, assignedTo)} style={{
                            padding:'3px 8px',fontSize:10,color:T.red,background:'none',
                            border:'0.5px solid '+T.red,borderRadius:4,cursor:'pointer'
                          }}>Remove</button>
                        )}
                      </div>
                      {!assignedTo && (
                        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                          {REPORT_TYPES.map(rt => (
                            <button key={rt.id} onClick={()=>assign(f.id, rt.id)}
                              disabled={!!assignments[rt.id] && assignments[rt.id] !== f.id}
                              style={{
                                padding:'3px 9px',fontSize:10,fontWeight:600,borderRadius:4,cursor:'pointer',
                                background:assignments[rt.id]?'#f0f0f0':'#fff',
                                color:assignments[rt.id]?T.textMuted:rt.color,
                                border:'1px solid '+(assignments[rt.id]?T.border:rt.color),
                                opacity:assignments[rt.id] && assignments[rt.id]!==f.id?0.4:1,
                              }}>
                              {rt.icon} {rt.label}
                              {assignments[rt.id] ? ' (taken)' : ''}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Assignment summary */}
                <div style={{padding:'10px 14px',background:T.bg,borderTop:'0.5px solid '+T.border}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.text,marginBottom:6}}>Assignment summary</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
                    {REPORT_TYPES.map(r => {
                      const fileId = assignments[r.id]
                      const file = folderFiles.find(f => f.id === fileId)
                      return (
                        <div key={r.id} style={{fontSize:10,color:fileId?T.green:T.textMuted}}>
                          {r.icon} {r.label}: {file ? file.name.slice(0,25) : r.required ? '⚠ Required' : 'Not assigned'}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            <button onClick={analyse} disabled={!canAnalyse} style={{
              width:'100%',padding:'14px',fontSize:14,fontWeight:700,
              background:canAnalyse?T.green:'#d0d7de',
              color:'#fff',border:'none',borderRadius:8,
              cursor:canAnalyse?'pointer':'not-allowed',
            }}>
              {canAnalyse
                ? `Run Full Audit — ${assignedCount} report${assignedCount!==1?'s':''} →`
                : 'Load files and assign Campaign Performance to continue'}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{padding:60,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:16,animation:'spin 1s linear infinite'}}>⟳</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:8}}>{status}</div>
            <div style={{fontSize:11,color:T.textMuted}}>Running full audit across {assignedCount} reports — this takes 20-30 seconds</div>
          </div>
        )}

        {/* STEP 3 — Results */}
        {step === 3 && results && (
          <div>
            {/* Push button — prominent at top */}
            <div style={{background:T.blueBg,border:'0.5px solid '+T.blueBorder,borderRadius:8,padding:'14px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:T.blue}}>Audit complete — push to Paid Ads page</div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>This will fill all tabs in Paid Ads with your real data — campaigns, devices, schedule, competitors, negative keywords and tasks</div>
              </div>
              <button onClick={pushToPaidAds} style={{
                padding:'10px 20px',fontSize:13,fontWeight:700,
                background:pushed?T.green:T.blue,color:'#fff',
                border:'none',borderRadius:8,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0
              }}>
                {pushed?'✓ Pushed! Going to Paid Ads...':'Push to Paid Ads →'}
              </button>
            </div>

            {/* Summary */}
            <div style={{background:T.greenBg,border:'0.5px solid '+T.greenBorder,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.green,marginBottom:6}}>Full audit findings</div>
              <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{results.summary}</div>
            </div>

            {/* Key metrics */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
              {[
                {label:'Total Spend',value:results.totalSpend,color:T.blue},
                {label:'Overall ROAS',value:results.overallRoas,color:T.green},
                {label:'Conversions',value:results.totalConversions,color:'#7c3aed'},
                {label:'Wasted Spend',value:results.wastedSpend,color:T.red},
              ].map((m,i)=>(
                <div key={i} style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'12px',textAlign:'center'}}>
                  <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',fontWeight:600,marginBottom:4}}>{m.label}</div>
                  <div style={{fontSize:18,fontWeight:700,color:m.color}}>{m.value||'—'}</div>
                </div>
              ))}
            </div>

            {/* Top actions */}
            <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Top actions this week</div>
              {(results.topActions||[]).map((a,i)=>(
                <div key={i} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:i<(results.topActions.length-1)?'0.5px solid '+T.borderLight:'none'}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:i===0?T.red:i===1?T.amber:T.blue,color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:12,color:T.text,lineHeight:1.5}}>{a}</div>
                </div>
              ))}
            </div>

            {/* Campaign breakdown */}
            {results.campaigns?.length > 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,overflow:'auto',marginBottom:12}}>
                <div style={{padding:'10px 14px',borderBottom:'0.5px solid '+T.border,background:T.bg,fontSize:12,fontWeight:600,color:T.text}}>Campaign breakdown</div>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:650}}>
                  <thead><tr style={{background:T.bg}}>
                    {['Campaign','Spend','Clicks','Conv.','ROAS','Action','Reason'].map(h=>(
                      <th key={h} style={{padding:'7px 12px',fontSize:10,fontWeight:600,color:T.textMuted,textTransform:'uppercase',textAlign:'left',borderBottom:'0.5px solid '+T.border,whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {results.campaigns.map((c,i)=>{
                      const ac = c.action==='Scale'?T.green:c.action==='Pause'?T.red:c.action==='Reduce'?T.amber:T.blue
                      return (
                        <tr key={i} style={{background:i%2===0?T.surface:T.bg}}>
                          <td style={{padding:'8px 12px',fontSize:11,fontWeight:600,color:T.text,borderBottom:'0.5px solid '+T.borderLight}}>{c.name}</td>
                          <td style={{padding:'8px 12px',fontSize:11,color:T.blue,borderBottom:'0.5px solid '+T.borderLight}}>{c.spend}</td>
                          <td style={{padding:'8px 12px',fontSize:11,color:T.textMuted,borderBottom:'0.5px solid '+T.borderLight}}>{c.clicks}</td>
                          <td style={{padding:'8px 12px',fontSize:11,color:T.green,borderBottom:'0.5px solid '+T.borderLight}}>{c.conversions}</td>
                          <td style={{padding:'8px 12px',fontSize:11,fontWeight:700,borderBottom:'0.5px solid '+T.borderLight}}>{c.roas}</td>
                          <td style={{padding:'8px 12px',borderBottom:'0.5px solid '+T.borderLight}}>
                            <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,background:ac+'20',color:ac}}>{c.action}</span>
                          </td>
                          <td style={{padding:'8px 12px',fontSize:10,color:T.textMuted,borderBottom:'0.5px solid '+T.borderLight,maxWidth:180}}>{c.reason}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Device insights */}
            {results.deviceInsights && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>📱 Device insights</div>
                <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{results.deviceInsights}</div>
              </div>
            )}

            {/* Schedule insights */}
            {results.scheduleInsights && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>🕐 Best times to run ads</div>
                <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{results.scheduleInsights}</div>
              </div>
            )}

            {/* Auction insights */}
            {results.competitorInsights && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>🏆 Competitor analysis</div>
                <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{results.competitorInsights}</div>
              </div>
            )}

            {/* Scale & Waste */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div style={{background:T.greenBg,border:'0.5px solid '+T.greenBorder,borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:700,color:T.green,marginBottom:5}}>🚀 Scale this now</div>
                <div style={{fontSize:12,color:T.text}}>{results.scaleOpportunity}</div>
              </div>
              <div style={{background:'#fff0f0',border:'0.5px solid #ffa0a040',borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:700,color:T.red,marginBottom:5}}>🚨 Biggest waste</div>
                <div style={{fontSize:12,color:T.text}}>{results.biggestWaste}</div>
              </div>
            </div>

            {/* Negative keywords */}
            {results.negativeKeywords?.length > 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Negative keywords to block in Google Ads</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                  {results.negativeKeywords.map((k,i)=>(
                    <span key={i} style={{fontSize:11,padding:'3px 9px',borderRadius:4,background:'#fff0f0',color:T.red,border:'0.5px solid #ffa0a040',fontWeight:500}}>{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Step by step guide */}
            {results.stepByStepGuide?.length > 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Step by step — reduce costs and get more sales</div>
                {results.stepByStepGuide.map((step,i)=>(
                  <div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:i<results.stepByStepGuide.length-1?'0.5px solid '+T.borderLight:'none'}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:i===0?T.red:i<3?T.amber:T.blue,color:'#fff',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:2}}>{step.action}</div>
                      <div style={{fontSize:11,color:T.textMuted,lineHeight:1.5}}>{step.detail}</div>
                      {step.impact && <div style={{fontSize:11,color:T.green,fontWeight:600,marginTop:3}}>Impact: {step.impact}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Push button at bottom too */}
            <button onClick={pushToPaidAds} style={{
              width:'100%',padding:'14px',fontSize:14,fontWeight:700,
              background:pushed?T.green:T.blue,color:'#fff',
              border:'none',borderRadius:8,cursor:'pointer',
            }}>
              {pushed?'✓ Pushed! Going to Paid Ads...':'Push all data to Paid Ads page →'}
            </button>
          </div>
        )}

      </Shell>
    </>
  )
}
