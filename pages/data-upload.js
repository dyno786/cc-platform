import Head from 'next/head'
import { useState } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

export default function DataUpload() {
  const [adsUrl, setAdsUrl] = useState('')
  const [termsUrl, setTermsUrl] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetchStatus, setFetchStatus] = useState({})
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  async function fetchCsv(url, key) {
    if (!url.trim()) return null
    setFetchStatus(s => ({...s, [key]: 'Fetching from Google Drive...'}))
    try {
      const r = await fetch('/api/fetch-drive-csv', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ url: url.trim() })
      })
      // Handle non-JSON response (API not deployed yet or 404)
      const text = await r.text()
      let d
      try { d = JSON.parse(text) }
      catch(e) {
        setFetchStatus(s => ({...s, [key]: '✗ API not found — please upload fetch-drive-csv.js to GitHub'}))
        return null
      }
      if (d.ok) {
        setFetchStatus(s => ({...s, [key]: '✓ ' + d.lines + ' rows loaded — ' + d.preview?.slice(0,60)}))
        return d.content
      } else {
        setFetchStatus(s => ({...s, [key]: '✗ ' + d.error}))
        return null
      }
    } catch(e) {
      setFetchStatus(s => ({...s, [key]: '✗ ' + e.message}))
      return null
    }
  }

  async function analyse() {
    if (!adsUrl.trim()) { setError('Please enter your Campaign Performance Google Drive URL'); return }
    setLoading(true)
    setStep(2)
    setError('')

    const [adsText, termsText] = await Promise.all([
      fetchCsv(adsUrl, 'ads'),
      termsUrl ? fetchCsv(termsUrl, 'terms') : Promise.resolve(null),
    ])

    if (!adsText) {
      setError('Could not load Campaign Performance file. Make sure it is shared with "Anyone with the link".')
      setLoading(false)
      setStep(1)
      return
    }

    setFetchStatus(s => ({...s, analyse: 'Analysing with AI...'}))

    try {
      const r = await fetch('/api/analyse-data', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          adsText: adsText.slice(0, 10000),
          termsText: termsText ? termsText.slice(0, 5000) : null,
        })
      })
      const d = await r.json()
      if (d.ok) {
        setResults(d.results)
        setStep(3)
        // Save to localStorage so other pages can use it
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

  function reset() {
    setStep(1); setResults(null); setError(''); setFetchStatus({})
    setAdsUrl(''); setTermsUrl('')
  }

  return (
    <>
      <Head><title>Data Upload — CC Intelligence</title></Head>
      <Shell title="Google Ads Analysis" subtitle="Paste your Google Drive CSV links — AI analyses your spend and fills the Paid Ads page">

        {/* Live data banner */}
        <div style={{background:T.greenBg,border:'0.5px solid '+T.greenBorder,borderRadius:8,padding:'12px 16px',marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:T.green,marginBottom:8}}>Already live via API — no upload needed</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {[
              {icon:'🔍',label:'Search Console',detail:'Keywords, clicks, positions — live. Organic SEO page.'},
              {icon:'📍',label:'GBP Insights',detail:'Ratings, reviews for all 3 branches — live. Local SEO page.'},
              {icon:'🛍️',label:'Shopify',detail:'Orders, revenue, abandoned carts — live. Overview page.'},
            ].map((s,i) => (
              <div key={i} style={{background:'#fff',borderRadius:6,padding:'8px 10px',border:'0.5px solid '+T.greenBorder}}>
                <div style={{fontSize:14,marginBottom:3}}>{s.icon}</div>
                <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:2}}>{s.label}</div>
                <div style={{fontSize:10,color:T.textMuted,lineHeight:1.4}}>{s.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step indicators */}
        <div style={{display:'flex',gap:0,marginBottom:20}}>
          {[
            {n:1,label:'Paste Drive links'},
            {n:2,label:'AI fetches & analyses'},
            {n:3,label:'Results ready'},
          ].map((s,i) => (
            <div key={s.n} style={{display:'flex',alignItems:'center',flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,
                  background:step>=s.n?T.green:'#d0d7de',color:'#fff'}}>
                  {step>s.n?'✓':s.n}
                </div>
                <span style={{fontSize:11,color:step>=s.n?T.text:T.textMuted,fontWeight:step===s.n?600:400}}>{s.label}</span>
              </div>
              {i<2 && <div style={{flex:1,height:2,background:step>s.n?T.green:'#d0d7de',margin:'0 8px'}}/>}
            </div>
          ))}
        </div>

        {error && (
          <div style={{background:'#fff0f0',border:'0.5px solid #ffa0a0',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:12,color:T.red}}>
            ⚠ {error}
          </div>
        )}

        {/* STEP 1 — Paste URLs */}
        {step === 1 && (
          <div>
            {/* How to get the link */}
            <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>How to get your Google Drive link</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:T.blue,marginBottom:6}}>📊 Campaign Performance</div>
                  {[
                    'Google Ads → Reports → Predefined reports',
                    'Click "Campaign performance"',
                    'Set date range → Download → CSV',
                    'Upload CSV to Google Drive',
                    'Right-click → Share → Anyone with link',
                    'Copy link and paste below',
                  ].map((s,i) => (
                    <div key={i} style={{display:'flex',gap:6,marginBottom:4,fontSize:11,color:T.textMuted}}>
                      <span style={{color:T.blue,fontWeight:700,flexShrink:0}}>{i+1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:'#7c3aed',marginBottom:6}}>🔍 Search Keywords (optional)</div>
                  {[
                    'Google Ads → Reports → When and where ads showed',
                    'Click "Search terms"',
                    'Download → CSV',
                    'Upload to Google Drive',
                    'Share → Anyone with link',
                    'Copy link and paste below',
                  ].map((s,i) => (
                    <div key={i} style={{display:'flex',gap:6,marginBottom:4,fontSize:11,color:T.textMuted}}>
                      <span style={{color:'#7c3aed',fontWeight:700,flexShrink:0}}>{i+1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* URL inputs */}
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:6}}>
                  📊 Campaign Performance CSV — Google Drive link
                  <span style={{color:T.red,marginLeft:4}}>*</span>
                </div>
                <div style={{fontSize:10,color:T.textMuted,marginBottom:8}}>Required. Paste the Google Drive share link for your Campaign Performance CSV.</div>
                <input
                  value={adsUrl}
                  onChange={e=>setAdsUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  style={{width:'100%',padding:'8px 10px',fontSize:12,border:'1px solid '+(adsUrl?T.blue:T.border),borderRadius:7,background:T.bg,color:T.text,boxSizing:'border-box'}}
                />
                {fetchStatus.ads && (
                  <div style={{fontSize:11,marginTop:5,color:fetchStatus.ads.startsWith('✓')?T.green:T.red,fontWeight:600}}>
                    {fetchStatus.ads}
                  </div>
                )}
              </div>

              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:6}}>
                  🔍 Search Keywords/Terms CSV — Google Drive link
                  <span style={{color:T.textMuted,marginLeft:4,fontWeight:400}}>(optional but recommended)</span>
                </div>
                <div style={{fontSize:10,color:T.textMuted,marginBottom:8}}>Optional. Enables negative keyword recommendations based on your actual wasted spend.</div>
                <input
                  value={termsUrl}
                  onChange={e=>setTermsUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  style={{width:'100%',padding:'8px 10px',fontSize:12,border:'1px solid '+(termsUrl?'#7c3aed':T.border),borderRadius:7,background:T.bg,color:T.text,boxSizing:'border-box'}}
                />
                {fetchStatus.terms && (
                  <div style={{fontSize:11,marginTop:5,color:fetchStatus.terms.startsWith('✓')?T.green:T.red,fontWeight:600}}>
                    {fetchStatus.terms}
                  </div>
                )}
              </div>
            </div>

            <button onClick={analyse} disabled={!adsUrl.trim()}
              style={{width:'100%',padding:'13px',fontSize:14,fontWeight:700,
                background:adsUrl.trim()?T.green:'#d0d7de',
                color:'#fff',border:'none',borderRadius:8,
                cursor:adsUrl.trim()?'pointer':'not-allowed'}}>
              Fetch & Analyse →
            </button>
          </div>
        )}

        {/* STEP 2 — Loading */}
        {step === 2 && (
          <div style={{padding:40,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:16}}>⟳</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:8}}>
              {fetchStatus.analyse || 'Fetching your files from Google Drive...'}
            </div>
            <div style={{fontSize:12,color:T.textMuted}}>This takes about 15-20 seconds</div>
            {Object.entries(fetchStatus).filter(([k])=>k!=='analyse').map(([k,v]) => (
              <div key={k} style={{marginTop:8,fontSize:11,color:v.startsWith('✓')?T.green:T.red,fontWeight:600}}>
                {k==='ads'?'Campaign Performance':k==='terms'?'Search Keywords':k}: {v}
              </div>
            ))}
          </div>
        )}

        {/* STEP 3 — Results */}
        {step === 3 && results && (
          <div>
            {/* Summary */}
            <div style={{background:T.greenBg,border:'0.5px solid '+T.greenBorder,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.green,marginBottom:6}}>This week's key findings</div>
              <div style={{fontSize:13,color:T.text,lineHeight:1.6}}>{results.summary}</div>
            </div>

            {/* Key metrics */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
              {[
                {label:'Total Spend', value:results.totalSpend, color:T.blue},
                {label:'Overall ROAS', value:results.overallRoas, color:T.green},
                {label:'Conversions', value:results.totalConversions, color:'#7c3aed'},
                {label:'Wasted Spend', value:results.wastedSpend, color:T.red},
              ].map((m,i) => (
                <div key={i} style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'12px 14px',textAlign:'center'}}>
                  <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',fontWeight:600,marginBottom:4}}>{m.label}</div>
                  <div style={{fontSize:20,fontWeight:700,color:m.color}}>{m.value||'—'}</div>
                </div>
              ))}
            </div>

            {/* Top actions */}
            <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Top 5 actions this week</div>
              {(results.topActions||[]).map((a,i) => (
                <div key={i} style={{display:'flex',gap:10,padding:'6px 0',borderBottom:i<4?'0.5px solid '+T.borderLight:'none'}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:T.blue,color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:12,color:T.text,lineHeight:1.5}}>{a}</div>
                </div>
              ))}
            </div>

            {/* Campaigns table */}
            {results.campaigns?.length > 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,overflow:'auto',marginBottom:12}}>
                <div style={{padding:'10px 14px',borderBottom:'0.5px solid '+T.border,background:T.bg,fontSize:12,fontWeight:600,color:T.text}}>Campaign breakdown</div>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
                  <thead>
                    <tr style={{background:T.bg}}>
                      {['Campaign','Spend','Clicks','Conversions','ROAS','Action'].map(h => (
                        <th key={h} style={{padding:'7px 12px',fontSize:10,fontWeight:600,color:T.textMuted,textTransform:'uppercase',textAlign:'left',borderBottom:'0.5px solid '+T.border}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.campaigns.map((c,i) => {
                      const actionColor = c.action==='Scale'?T.green:c.action==='Pause'?T.red:c.action==='Reduce'?T.amber:T.blue
                      return (
                        <tr key={i} style={{background:i%2===0?T.surface:T.bg}}>
                          <td style={{padding:'8px 12px',fontSize:12,fontWeight:600,color:T.text,borderBottom:'0.5px solid '+T.borderLight}}>{c.name}</td>
                          <td style={{padding:'8px 12px',fontSize:12,color:T.blue,borderBottom:'0.5px solid '+T.borderLight}}>{c.spend}</td>
                          <td style={{padding:'8px 12px',fontSize:12,color:T.textMuted,borderBottom:'0.5px solid '+T.borderLight}}>{c.clicks}</td>
                          <td style={{padding:'8px 12px',fontSize:12,color:T.green,borderBottom:'0.5px solid '+T.borderLight}}>{c.conversions}</td>
                          <td style={{padding:'8px 12px',fontSize:12,fontWeight:700,color:T.text,borderBottom:'0.5px solid '+T.borderLight}}>{c.roas}</td>
                          <td style={{padding:'8px 12px',borderBottom:'0.5px solid '+T.borderLight}}>
                            <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:4,background:actionColor+'20',color:actionColor}}>{c.action}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
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
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Negative keywords to add</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {results.negativeKeywords.map((k,i) => (
                    <span key={i} style={{fontSize:11,padding:'3px 9px',borderRadius:4,background:T.redBg,color:T.red,border:'0.5px solid #ffa0a040',fontWeight:500}}>{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly tasks */}
            {results.weeklyTasks?.length > 0 && (
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Tasks to do this week in Google Ads</div>
                {results.weeklyTasks.map((t,i) => (
                  <div key={i} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:i<results.weeklyTasks.length-1?'0.5px solid '+T.borderLight:'none'}}>
                    <span style={{color:T.blue,fontWeight:700,fontSize:11,flexShrink:0}}>{i+1}.</span>
                    <span style={{fontSize:12,color:T.text}}>{t}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:'flex',gap:8}}>
              <button onClick={reset} style={{padding:'8px 16px',fontSize:12,fontWeight:600,background:T.bg,color:T.text,border:'1px solid '+T.border,borderRadius:7,cursor:'pointer'}}>
                Analyse new files
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
