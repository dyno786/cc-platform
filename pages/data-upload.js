import Head from 'next/head'
import { useState } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

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

export default function DataUpload() {
  const [driveUrl, setDriveUrl] = useState('https://drive.google.com/drive/folders/1CYCY_VVh0Ac4Fkr6vu8kwbzp_QMPNUfd')
  const [folderFiles, setFolderFiles] = useState([])
  const [loadingFolder, setLoadingFolder] = useState(false)
  const [adsFileId, setAdsFileId] = useState('')
  const [termsFileId, setTermsFileId] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [results, setResults] = useState(null)
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
          // Auto-detect which file is which based on name
          d.files.forEach(f => {
            const n = f.name.toLowerCase()
            if (n.includes('campaign') || n.includes('performance')) setAdsFileId(f.id)
            if (n.includes('search') || n.includes('term') || n.includes('keyword')) setTermsFileId(f.id)
          })
        } else {
          setError(d.error)
        }
      } else {
        // Single file — set as ads file
        setAdsFileId(id)
        setFolderFiles([{ id, name: 'Selected file', mimeType: 'text/csv' }])
      }
    } catch(e) {
      setError(e.message)
    }
    setLoadingFolder(false)
  }

  async function fetchFile(fileId) {
    const url = fileId.includes('spreadsheet')
      ? `https://docs.google.com/spreadsheets/d/${fileId}`
      : `https://drive.google.com/file/d/${fileId}/view`
    const r = await fetch('/api/fetch-drive-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    const text = await r.text()
    try {
      const d = JSON.parse(text)
      return d.ok ? d.content : null
    } catch(e) {
      return null
    }
  }

  async function analyse() {
    if (!adsFileId) { setError('Please select the Campaign Performance file'); return }
    setLoading(true)
    setStep(2)
    setError('')

    setStatus('Reading Campaign Performance from Google Drive...')
    const adsText = await fetchFile(adsFileId)
    if (!adsText) {
      setError('Could not read Campaign Performance file')
      setLoading(false)
      setStep(1)
      return
    }

    let termsText = null
    if (termsFileId) {
      setStatus('Reading Search Keywords from Google Drive...')
      termsText = await fetchFile(termsFileId)
    }

    setStatus('Analysing with AI...')
    try {
      const r = await fetch('/api/analyse-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adsText: adsText.slice(0, 10000),
          termsText: termsText ? termsText.slice(0, 5000) : null,
        })
      })
      const d = await r.json()
      if (d.ok) {
        setResults(d.results)
        setStep(3)
        try { localStorage.setItem('cc_ads_analysis', JSON.stringify(d.results)) } catch(e) {}
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

  return (
    <>
      <Head><title>Data Upload — CC Intelligence</title></Head>
      <Shell title="Google Ads Analysis" subtitle="Point to your Google Drive folder — platform reads files directly using your existing Google credentials">

        {/* Live data banner */}
        <div style={{background:T.greenBg,border:'0.5px solid '+T.greenBorder,borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:11,color:T.green}}>
          <strong>Already live via API:</strong> Search Console · GBP Insights · Shopify — no upload needed for those.
          Only Google Ads requires this step.
        </div>

        {error && (
          <div style={{background:'#fff0f0',border:'0.5px solid #ffa0a0',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:12,color:T.red}}>
            ⚠ {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            {/* Drive URL input */}
            <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:6}}>
                Your Google Drive folder or file URL
              </div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:10}}>
                Paste your Drive folder URL — the platform will list all files inside so you can pick which is which.
              </div>
              <div style={{display:'flex',gap:8}}>
                <input
                  value={driveUrl}
                  onChange={e=>setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  style={{flex:1,padding:'8px 10px',fontSize:12,border:'1px solid '+T.border,borderRadius:7,background:T.bg,color:T.text}}
                />
                <button onClick={loadFolder} disabled={loadingFolder} style={{
                  padding:'8px 16px',fontSize:12,fontWeight:700,
                  background:T.blue,color:'#fff',border:'none',borderRadius:7,cursor:'pointer',whiteSpace:'nowrap'
                }}>
                  {loadingFolder ? 'Loading...' : 'Load Files'}
                </button>
              </div>
            </div>

            {/* File list */}
            {folderFiles.length > 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'16px',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>
                  Files found — assign each one:
                </div>
                {folderFiles.map(f => (
                  <div key={f.id} style={{
                    display:'flex',alignItems:'center',gap:10,padding:'8px 10px',
                    marginBottom:6,borderRadius:6,
                    background:adsFileId===f.id?T.blueBg:termsFileId===f.id?'#f3f0ff':T.bg,
                    border:'1px solid '+(adsFileId===f.id?T.blue:termsFileId===f.id?'#7c3aed':T.border),
                  }}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>{f.name}</div>
                      <div style={{fontSize:10,color:T.textMuted}}>{f.mimeType?.includes('sheet')?'Google Sheet':'CSV file'}</div>
                    </div>
                    <div style={{display:'flex',gap:5}}>
                      <button onClick={()=>setAdsFileId(adsFileId===f.id?'':f.id)} style={{
                        padding:'4px 10px',fontSize:10,fontWeight:700,borderRadius:4,cursor:'pointer',
                        background:adsFileId===f.id?T.blue:'#fff',
                        color:adsFileId===f.id?'#fff':T.blue,
                        border:'1px solid '+T.blue,
                      }}>
                        {adsFileId===f.id?'✓ Campaign Perf':'Campaign Perf'}
                      </button>
                      <button onClick={()=>setTermsFileId(termsFileId===f.id?'':f.id)} style={{
                        padding:'4px 10px',fontSize:10,fontWeight:700,borderRadius:4,cursor:'pointer',
                        background:termsFileId===f.id?'#7c3aed':'#fff',
                        color:termsFileId===f.id?'#fff':'#7c3aed',
                        border:'1px solid #7c3aed',
                      }}>
                        {termsFileId===f.id?'✓ Search Terms':'Search Terms'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Summary of assignment */}
                <div style={{marginTop:10,padding:'8px 10px',background:T.bg,borderRadius:6,fontSize:11}}>
                  <div style={{color:adsFileId?T.green:T.red,marginBottom:2}}>
                    {adsFileId?'✓':'✗'} Campaign Performance: {adsFileId ? folderFiles.find(f=>f.id===adsFileId)?.name : 'not assigned'}
                  </div>
                  <div style={{color:termsFileId?T.green:T.textMuted}}>
                    {termsFileId?'✓':'○'} Search Terms: {termsFileId ? folderFiles.find(f=>f.id===termsFileId)?.name : 'not assigned (optional)'}
                  </div>
                </div>
              </div>
            )}

            <button onClick={analyse} disabled={!adsFileId} style={{
              width:'100%',padding:'13px',fontSize:14,fontWeight:700,
              background:adsFileId?T.green:'#d0d7de',
              color:'#fff',border:'none',borderRadius:8,
              cursor:adsFileId?'pointer':'not-allowed',
            }}>
              {adsFileId ? 'Read & Analyse →' : 'Load files first then assign Campaign Performance'}
            </button>
          </div>
        )}

        {/* STEP 2 — Loading */}
        {step === 2 && (
          <div style={{padding:60,textAlign:'center'}}>
            <div style={{fontSize:36,marginBottom:16}}>⟳</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:8}}>{status}</div>
            <div style={{fontSize:11,color:T.textMuted}}>Reading directly from your Google Drive using your existing credentials</div>
          </div>
        )}

        {/* STEP 3 — Results */}
        {step === 3 && results && (
          <div>
            <div style={{background:T.greenBg,border:'0.5px solid '+T.greenBorder,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.green,marginBottom:6}}>This week's key findings</div>
              <div style={{fontSize:13,color:T.text,lineHeight:1.6}}>{results.summary}</div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
              {[
                {label:'Total Spend',value:results.totalSpend,color:T.blue},
                {label:'Overall ROAS',value:results.overallRoas,color:T.green},
                {label:'Conversions',value:results.totalConversions,color:'#7c3aed'},
                {label:'Wasted Spend',value:results.wastedSpend,color:T.red},
              ].map((m,i) => (
                <div key={i} style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'12px 14px',textAlign:'center'}}>
                  <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',fontWeight:600,marginBottom:4}}>{m.label}</div>
                  <div style={{fontSize:20,fontWeight:700,color:m.color}}>{m.value||'—'}</div>
                </div>
              ))}
            </div>

            <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Top 5 actions this week</div>
              {(results.topActions||[]).map((a,i) => (
                <div key={i} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:i<4?'0.5px solid '+T.borderLight:'none'}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:T.blue,color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:12,color:T.text,lineHeight:1.5}}>{a}</div>
                </div>
              ))}
            </div>

            {results.campaigns?.length > 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,overflow:'auto',marginBottom:12}}>
                <div style={{padding:'10px 14px',borderBottom:'0.5px solid '+T.border,background:T.bg,fontSize:12,fontWeight:600,color:T.text}}>Campaign breakdown</div>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
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
                          <td style={{padding:'8px 12px',fontSize:11,fontWeight:700,color:T.text,borderBottom:'0.5px solid '+T.borderLight}}>{c.roas}</td>
                          <td style={{padding:'8px 12px',borderBottom:'0.5px solid '+T.borderLight}}>
                            <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,background:ac+'20',color:ac}}>{c.action}</span>
                          </td>
                          <td style={{padding:'8px 12px',fontSize:10,color:T.textMuted,borderBottom:'0.5px solid '+T.borderLight,maxWidth:200}}>{c.reason}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div style={{background:T.greenBg,border:'0.5px solid '+T.greenBorder,borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:700,color:T.green,marginBottom:5}}>Scale this now</div>
                <div style={{fontSize:12,color:T.text}}>{results.scaleOpportunity}</div>
              </div>
              <div style={{background:'#fff0f0',border:'0.5px solid #ffa0a040',borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:700,color:T.red,marginBottom:5}}>Biggest waste</div>
                <div style={{fontSize:12,color:T.text}}>{results.biggestWaste}</div>
              </div>
            </div>

            {results.negativeKeywords?.length > 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Negative keywords to add in Google Ads</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {results.negativeKeywords.map((k,i)=>(
                    <span key={i} style={{fontSize:11,padding:'3px 9px',borderRadius:4,background:'#fff0f0',color:T.red,border:'0.5px solid #ffa0a040',fontWeight:500}}>{k}</span>
                  ))}
                </div>
              </div>
            )}

            {results.weeklyTasks?.length > 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Tasks to do this week in Google Ads</div>
                {results.weeklyTasks.map((t,i)=>(
                  <div key={i} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:i<results.weeklyTasks.length-1?'0.5px solid '+T.borderLight:'none'}}>
                    <span style={{color:T.blue,fontWeight:700,fontSize:11,flexShrink:0}}>{i+1}.</span>
                    <span style={{fontSize:12,color:T.text}}>{t}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setStep(1);setResults(null);setError('');setStatus('')}}
                style={{padding:'8px 16px',fontSize:12,fontWeight:600,background:T.bg,color:T.text,border:'1px solid '+T.border,borderRadius:7,cursor:'pointer'}}>
                Analyse again
              </button>
              <a href="/paid-ads" style={{padding:'8px 16px',fontSize:12,fontWeight:700,background:T.blue,color:'#fff',borderRadius:7,textDecoration:'none'}}>
                View Paid Ads page →
              </a>
            </div>
          </div>
        )}

      </Shell>
    </>
  )
}
