import Head from 'next/head'
import { useState, useRef } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8', teal:'#14b8a6',
}

const NEGATIVE_KEYWORDS = [
  { category:'Supermarket brands',    color:C.red,   keywords:['head and shoulders','tresemme','pantene','dove shampoo','alberto balsam','herbal essences','vo5','timotei'] },
  { category:'Non-relevant products', color:C.amber, keywords:['mustard oil cooking','olive oil cooking','coconut oil cooking','food grade','kitchen oil'] },
  { category:'Competitor terms',      color:C.blue,  keywords:['sally beauty','pak cosmetics','sweethearts beauty','beautyworld'] },
  { category:'Free / DIY searches',   color:C.text3, keywords:['free wig','diy relaxer','homemade hair mask','free samples'] },
  { category:'Wrong location',        color:C.text3, keywords:['manchester hair shop','birmingham hair shop','london hair shop'] },
]

const CODES = [
  { code:'WIGDEAL15',  pct:'15%', collection:'Wigs',           color:C.green  },
  { code:'COLOUR10',   pct:'10%', collection:'Hair Dye',       color:C.blue   },
  { code:'EDGE15',     pct:'15%', collection:'Edge Control',   color:C.teal   },
  { code:'BRAID10',    pct:'10%', collection:'Braiding Hair',  color:C.amber  },
  { code:'OIL10',      pct:'10%', collection:'Hair Oils',      color:C.red    },
  { code:'GROW10',     pct:'10%', collection:'Hair Growth',    color:C.blue   },
  { code:'COMEBACK10', pct:'10%', collection:'Abandoned Carts',color:C.accent },
]

function Divider() {
  return <div style={{height:2,background:C.border,margin:'36px 0',borderRadius:1}}/>
}

function SectionTitle({num, icon, title, sub}) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
        <div style={{width:28,height:28,borderRadius:8,background:C.amber,color:'#000',fontWeight:800,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{num}</div>
        <h2 style={{fontSize:18,fontWeight:800,color:C.text,margin:0}}>{icon} {title}</h2>
      </div>
      {sub && <div style={{color:C.text2,fontSize:13,marginLeft:38}}>{sub}</div>}
    </div>
  )
}

function AnalysisResult({ data }) {
  const [copiedNeg, setCopiedNeg] = useState(null)
  if (!data) return null
  const statusColor = s => s==='SCALE'?C.green:s==='GROW'?C.blue:s==='REDUCE'?C.amber:C.red

  return (
    <div style={{background:C.surface,border:'2px solid '+C.green+'40',borderRadius:14,padding:20,marginTop:20}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <span style={{fontSize:24}}>✨</span>
        <div>
          <div style={{fontWeight:800,color:C.green,fontSize:16}}>AI Analysis Complete</div>
          <div style={{color:C.text3,fontSize:12}}>{data.summary?.dateRange} · {data.filesAnalysed} file{data.filesAnalysed!==1?'s':''} analysed</div>
        </div>
      </div>

      {/* Summary metrics */}
      {data.summary && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
          {[
            {label:'Total Spend',    val:data.summary.totalSpend,       color:C.red},
            {label:'Total Revenue',  val:data.summary.totalRevenue,     color:C.green},
            {label:'Overall ROAS',   val:data.summary.overallROAS,      color:C.blue},
            {label:'Overall CPA',    val:data.summary.overallCPA,       color:C.amber},
            {label:'Conversions',    val:data.summary.totalConversions, color:C.teal},
          ].map(m=>(
            <div key={m.label} style={{background:C.surface2,borderRadius:9,padding:12,textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:800,color:m.color}}>{m.val}</div>
              <div style={{fontSize:11,color:C.text3,marginTop:2}}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Insights */}
      {data.insights && (
        <div style={{background:'rgba(99,102,241,.08)',border:'1px solid rgba(99,102,241,.2)',borderRadius:10,padding:14,marginBottom:16,fontSize:13,color:C.accent2,lineHeight:1.6}}>
          💡 {data.insights}
        </div>
      )}

      {/* Urgent actions */}
      {data.urgentActions?.length > 0 && (
        <div style={{background:'rgba(239,68,68,.06)',border:'1px solid '+C.red+'30',borderRadius:10,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.red,marginBottom:10,fontSize:13}}>🚨 Urgent actions</div>
          {data.urgentActions.map((a,i)=>(
            <div key={i} style={{display:'flex',gap:8,marginBottom:6,fontSize:13,color:C.text2}}>
              <span style={{color:C.red,flexShrink:0,fontWeight:700}}>{i+1}.</span>{a}
            </div>
          ))}
        </div>
      )}

      {/* Device performance */}
      {data.devicePerformance?.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:10,fontSize:13}}>📱 Device performance</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {data.devicePerformance.map((d,i)=>(
              <div key={i} style={{background:C.surface2,borderRadius:10,padding:14,textAlign:'center'}}>
                <div style={{fontSize:22,marginBottom:4}}>{d.device==='Mobile'?'📱':d.device==='Desktop'?'🖥️':'📟'}</div>
                <div style={{fontWeight:700,color:C.text,fontSize:14}}>{d.device}</div>
                <div style={{color:C.green,fontWeight:700,fontSize:13,marginTop:4}}>{d.roas} ROAS</div>
                <div style={{color:C.amber,fontSize:12}}>{d.cpa} CPA</div>
                <div style={{color:C.text3,fontSize:11,marginTop:4}}>{d.spend} spend</div>
                <div style={{marginTop:8,padding:'5px 8px',borderRadius:6,background:d.recommendation.includes('Increase')?C.green+'20':d.recommendation.includes('Reduce')?C.red+'20':C.amber+'20',color:d.recommendation.includes('Increase')?C.green:d.recommendation.includes('Reduce')?C.red:C.amber,fontSize:11,fontWeight:600}}>
                  {d.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best times */}
      {data.bestTimes?.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:10,fontSize:13}}>🕐 Best times to advertise</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {data.bestTimes.map((t,i)=>(
              <div key={i} style={{background:C.surface2,borderRadius:8,padding:'8px 12px',display:'flex',gap:8,alignItems:'center'}}>
                <span style={{color:C.green,fontWeight:700,fontSize:13}}>{t.time}</span>
                <span style={{color:C.text3,fontSize:12}}>{t.roas} ROAS · {t.conversions} conv.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top locations */}
      {data.topLocations?.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:10,fontSize:13}}>📍 Top converting locations</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            {data.topLocations.slice(0,8).map((l,i)=>(
              <div key={i} style={{background:C.surface2,borderRadius:8,padding:10}}>
                <div style={{fontWeight:600,color:C.text,fontSize:13}}>{l.location}</div>
                <div style={{color:C.green,fontSize:12}}>{l.conversions} conv.</div>
                <div style={{color:C.text3,fontSize:11}}>{l.spend} spend</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns */}
      {data.campaigns?.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:10,fontSize:13}}>📢 Campaign performance</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
            {data.campaigns.map((c,i)=>(
              <div key={i} style={{background:C.surface2,border:'1px solid '+statusColor(c.status)+'40',borderRadius:10,padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div style={{fontWeight:700,color:C.text,fontSize:13,flex:1,marginRight:8}}>{c.name}</div>
                  <span style={{background:statusColor(c.status)+'20',color:statusColor(c.status),padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,flexShrink:0}}>{c.status}</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:8}}>
                  {[{k:'Spend',v:c.spend,col:C.text2},{k:'Revenue',v:c.revenue,col:C.green},{k:'ROAS',v:c.roas,col:C.blue},{k:'CPA',v:c.cpa,col:C.amber},{k:'Conv.',v:c.conversions,col:C.text}].map(m=>(
                    <div key={m.k} style={{background:C.surface,borderRadius:6,padding:'5px 8px'}}>
                      <div style={{fontSize:10,color:C.text3}}>{m.k}</div>
                      <div style={{fontWeight:600,color:m.col,fontSize:12}}>{m.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:12,color:statusColor(c.status),background:statusColor(c.status)+'10',borderRadius:7,padding:'6px 9px'}}>→ {c.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords opportunities */}
      {data.keywordOpportunities?.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:10,fontSize:13}}>🚀 Keyword opportunities — low competition, high value</div>
          <div style={{background:C.surface2,borderRadius:10,overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'8px 12px',borderBottom:'1px solid '+C.border}}>
              {['Keyword','Clicks','Conv.','CPA','Opportunity'].map(h=>(
                <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase'}}>{h}</span>
              ))}
            </div>
            {data.keywordOpportunities.slice(0,10).map((k,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'9px 12px',borderBottom:i<9?'1px solid '+C.border:'none',alignItems:'center'}}>
                <span style={{fontSize:13,color:C.text}}>{k.keyword}</span>
                <span style={{fontSize:13,color:C.text2}}>{k.clicks}</span>
                <span style={{fontSize:13,color:C.green}}>{k.conversions}</span>
                <span style={{fontSize:13,color:C.amber}}>{k.cpa}</span>
                <span style={{fontSize:11,color:C.teal,fontWeight:600}}>{k.opportunity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wasted spend */}
      {data.wastedSpend?.length > 0 && (
        <div style={{background:'rgba(239,68,68,.06)',border:'1px solid '+C.red+'30',borderRadius:10,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.red,marginBottom:10,fontSize:13}}>
            💸 Wasted spend to cut immediately
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {data.wastedSpend.map((w,i)=>(
              <div key={i} style={{background:C.surface,borderRadius:8,padding:10,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{fontWeight:600,color:C.text,fontSize:13}}>{w.term}</div>
                  <div style={{color:C.text3,fontSize:11,marginTop:2}}>{w.action}</div>
                </div>
                <div style={{color:C.red,fontWeight:700,fontSize:13,flexShrink:0,marginLeft:8}}>{w.spend}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shopping products */}
      {data.topProducts?.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:10,fontSize:13}}>🛒 Top shopping products</div>
          <div style={{background:C.surface2,borderRadius:10,overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'3fr 1fr 1fr 1fr 1fr',padding:'8px 12px',borderBottom:'1px solid '+C.border}}>
              {['Product','Clicks','Conv.','Revenue','ROAS'].map(h=>(
                <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase'}}>{h}</span>
              ))}
            </div>
            {data.topProducts.slice(0,8).map((p,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'3fr 1fr 1fr 1fr 1fr',padding:'9px 12px',borderBottom:i<7?'1px solid '+C.border:'none',alignItems:'center'}}>
                <span style={{fontSize:12,color:C.text,lineHeight:1.3}}>{p.product}</span>
                <span style={{fontSize:13,color:C.text2}}>{p.clicks}</span>
                <span style={{fontSize:13,color:C.green}}>{p.conversions}</span>
                <span style={{fontSize:13,color:C.green}}>{p.revenue}</span>
                <span style={{fontSize:13,color:C.blue,fontWeight:600}}>{p.roas}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaidAdsPage() {
  const [files, setFiles]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState(null)
  const [dragOver, setDragOver]   = useState(false)
  const [copiedNeg, setCopiedNeg] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)
  const fileRef = useRef(null)

  async function handleFiles(fileList) {
    const arr = Array.from(fileList).filter(f => f.name.endsWith('.csv') || f.name.endsWith('.txt'))
    if (!arr.length) return
    setFiles(arr.map(f=>f.name))
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Read all CSVs and combine
      const csvContents = await Promise.all(arr.map(async f => {
        const text = await f.text()
        return `\n\n=== FILE: ${f.name} ===\n${text}`
      }))
      const combined = csvContents.join('\n')

      const res = await fetch('/api/parse-ads-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csv: combined,
          reportType: 'Full Account Analysis',
          filesCount: arr.length,
          fileNames: arr.map(f=>f.name),
        }),
      })
      const d = await res.json()
      if (d.ok) {
        setResult({ ...d, filesAnalysed: arr.length })
      } else {
        setError(d.error || 'Analysis failed')
      }
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <>
      <Head>
        <title>Paid Ads — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button,input{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      <Nav/>

      <div style={{maxWidth:1200,margin:'0 auto',padding:20}}>

        {/* HEADER */}
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:24,fontWeight:800,color:C.text,marginBottom:6}}>📊 Paid Ads — Google Ads Analysis</h1>
          <p style={{color:C.text2,fontSize:14,lineHeight:1.6}}>
            Download your reports from Google Ads, drop all CSV files here at once, and AI will give you a complete account analysis — campaigns, devices, locations, wasted spend, keyword opportunities and exact actions to take.
          </p>
        </div>

        {/* HOW TO GET THE REPORTS */}
        <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16,marginBottom:20}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:12,fontSize:14}}>📥 How to download your reports from Google Ads</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[
              { icon:'📢', title:'Campaigns', where:'Left sidebar → Campaigns → ↓ Download → CSV' },
              { icon:'🔍', title:'Search Terms', where:'Left sidebar → Keywords → Search terms → ↓ Download → CSV' },
              { icon:'🔑', title:'Keywords', where:'Left sidebar → Keywords → Search keywords → ↓ Download → CSV' },
              { icon:'📱', title:'Devices', where:'Left sidebar → Campaigns → Segment → Device → ↓ Download → CSV' },
              { icon:'📍', title:'Locations', where:'Left sidebar → Campaigns → Locations → ↓ Download → CSV' },
              { icon:'🛒', title:'Shopping', where:'Left sidebar → Products (under Shopping) → ↓ Download → CSV' },
            ].map(r=>(
              <div key={r.title} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                <span style={{fontSize:18,flexShrink:0}}>{r.icon}</span>
                <div>
                  <div style={{fontWeight:600,color:C.text,fontSize:13}}>{r.title}</div>
                  <div style={{color:C.text3,fontSize:11,lineHeight:1.4,marginTop:2}}>{r.where}</div>
                </div>
              </div>
            ))}
          </div>
          <a href="https://ads.google.com" target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,marginTop:14,padding:'8px 16px',borderRadius:8,background:C.accent,color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none'}}>
            Open Google Ads →
          </a>
        </div>

        {/* UPLOAD ZONE */}
        <SectionTitle num="1" icon="📂" title="Drop all your CSV files here"
          sub="Upload as many files as you have — campaigns, search terms, keywords, devices, locations, shopping — all at once"/>

        <div
          onDragOver={e=>{e.preventDefault();setDragOver(true)}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={onDrop}
          onClick={()=>!loading && fileRef.current?.click()}
          style={{
            background: dragOver ? 'rgba(99,102,241,.12)' : loading ? 'rgba(34,197,94,.05)' : C.surface,
            border: `2px dashed ${dragOver ? C.accent : loading ? C.green : files.length ? C.green : C.border}`,
            borderRadius: 16,
            padding: '40px 20px',
            textAlign: 'center',
            cursor: loading ? 'default' : 'pointer',
            transition: 'all .2s',
            marginBottom: 8,
          }}
        >
          <input ref={fileRef} type="file" accept=".csv,.txt" multiple onChange={e=>handleFiles(e.target.files)} style={{display:'none'}}/>

          {loading ? (
            <div>
              <div style={{fontSize:40,marginBottom:12}}>⟳</div>
              <div style={{fontWeight:700,color:C.green,fontSize:16,marginBottom:4}}>Analysing your reports...</div>
              <div style={{color:C.text3,fontSize:13}}>AI is reading all {files.length} file{files.length!==1?'s':''} and building your analysis</div>
              <div style={{marginTop:12,display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center'}}>
                {files.map(f=>(
                  <span key={f} style={{background:C.green+'20',color:C.green,padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:600}}>✓ {f}</span>
                ))}
              </div>
            </div>
          ) : files.length && result ? (
            <div>
              <div style={{fontSize:36,marginBottom:8}}>✅</div>
              <div style={{fontWeight:700,color:C.green,fontSize:15,marginBottom:4}}>{files.length} file{files.length!==1?'s':''} analysed</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center',marginBottom:10}}>
                {files.map(f=>(
                  <span key={f} style={{background:C.green+'20',color:C.green,padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:600}}>✓ {f}</span>
                ))}
              </div>
              <div style={{color:C.text3,fontSize:12}}>Click to upload new files and refresh analysis</div>
            </div>
          ) : (
            <div>
              <div style={{fontSize:48,marginBottom:12}}>📂</div>
              <div style={{fontWeight:700,color:C.text,fontSize:16,marginBottom:6}}>Drop your Google Ads CSV files here</div>
              <div style={{color:C.text2,fontSize:13,marginBottom:16,maxWidth:400,margin:'0 auto 16px'}}>
                Drag and drop multiple files at once, or click to browse. Upload campaigns, search terms, keywords, devices, locations and shopping all together.
              </div>
              <div style={{display:'inline-flex',padding:'10px 24px',borderRadius:10,background:C.accent,color:'#fff',fontWeight:700,fontSize:14}}>
                Browse files
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{background:'rgba(239,68,68,.1)',border:'1px solid '+C.red,borderRadius:10,padding:12,marginBottom:16,color:C.red,fontSize:13}}>
            ❌ {error}
          </div>
        )}

        {result && <AnalysisResult data={result}/>}

        <Divider/>

        {/* NEGATIVE KEYWORDS */}
        <SectionTitle num="2" icon="🚫" title="Negative keywords — always exclude these"
          sub="Add these to all campaigns to stop wasting budget on irrelevant searches"/>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12,marginBottom:14}}>
          {NEGATIVE_KEYWORDS.map(cat=>(
            <div key={cat.category} style={{background:C.surface,border:'1px solid '+cat.color+'30',borderRadius:12,overflow:'hidden'}}>
              <div style={{padding:'10px 14px',background:cat.color+'10',borderBottom:'1px solid '+cat.color+'20',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontWeight:700,color:cat.color,fontSize:13}}>{cat.category}</span>
                <button onClick={()=>{navigator.clipboard.writeText(cat.keywords.join('\n'));setCopiedNeg(cat.category);setTimeout(()=>setCopiedNeg(null),2000)}} style={{padding:'3px 10px',borderRadius:5,border:'none',background:copiedNeg===cat.category?C.green:cat.color,color:'#000',fontWeight:600,fontSize:11,cursor:'pointer'}}>
                  {copiedNeg===cat.category?'✓ Copied!':'📋 Copy all'}
                </button>
              </div>
              <div style={{padding:11,display:'flex',flexWrap:'wrap',gap:5}}>
                {cat.keywords.map(kw=>(
                  <span key={kw} style={{background:C.surface2,color:C.text2,padding:'3px 9px',borderRadius:5,fontSize:12}}>{kw}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.2)',borderRadius:10,padding:12,fontSize:13,color:C.amber,marginBottom:8}}>
          📋 <strong>How to add in Google Ads:</strong> Tools & Settings → Shared Library → Negative keyword lists → Create list → paste → Apply to all campaigns.
        </div>

        <Divider/>

        {/* DISCOUNT CODES */}
        <SectionTitle num="3" icon="🎟️" title="Discount codes — use in ad copy"
          sub="Add to your ad descriptions to improve CTR and track which campaigns drive purchases"/>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10,marginBottom:14}}>
          {CODES.map(o=>(
            <div key={o.code} style={{background:C.surface,border:'1px solid '+o.color+'40',borderRadius:12,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div>
                  <div style={{fontSize:20,fontWeight:800,color:o.color,fontFamily:'monospace'}}>{o.code}</div>
                  <div style={{color:C.text3,fontSize:12}}>{o.pct} off · {o.collection}</div>
                </div>
                <button onClick={()=>{navigator.clipboard.writeText(o.code);setCopiedCode(o.code);setTimeout(()=>setCopiedCode(null),2000)}} style={{padding:'5px 10px',borderRadius:7,border:'none',background:copiedCode===o.code?C.green:o.color,color:'#000',fontWeight:700,fontSize:11,cursor:'pointer'}}>
                  {copiedCode===o.code?'✓':'📋 Copy'}
                </button>
              </div>
              <div style={{fontSize:11,color:C.text3,background:C.surface2,borderRadius:6,padding:'5px 8px'}}>
                "Use code {o.code} for {o.pct} off"
              </div>
            </div>
          ))}
        </div>

        <Divider/>

        {/* MONTHLY ROUTINE */}
        <SectionTitle num="4" icon="📅" title="Monthly Paid Ads routine"/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[
            {label:'Every week', color:C.amber, items:[
              'Upload all CSVs → act on urgent actions immediately',
              'Add new wasted search terms as negative keywords',
              'Check device bids — desktop should be +30%',
              'Review Shopping feed for disapprovals',
            ]},
            {label:'Every month', color:C.accent, items:[
              'Download fresh CSVs and run full analysis',
              'Scale budgets on SCALE campaigns',
              'Pause or reduce PAUSE/REDUCE campaigns',
              'Add new negative keywords from Search Terms report',
            ]},
            {label:'Every quarter', color:C.teal, items:[
              'Full campaign audit — kill persistent underperformers',
              'Test new ad copy with seasonal offers',
              'Review audience targeting for remarketing',
              'Check competitor ads for new keyword opportunities',
            ]},
          ].map(c=>(
            <div key={c.label} style={{background:C.surface,border:'1px solid '+c.color+'30',borderRadius:12,padding:16}}>
              <div style={{fontWeight:700,color:c.color,marginBottom:10,fontSize:14}}>{c.label}</div>
              {c.items.map((item,i)=>(
                <div key={i} style={{display:'flex',gap:7,marginBottom:6,fontSize:13,color:C.text2}}>
                  <span style={{color:c.color,flexShrink:0}}>→</span>{item}
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </>
  )
}
