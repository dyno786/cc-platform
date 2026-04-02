import Head from 'next/head'
import { useState, useRef } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8', teal:'#14b8a6',
}

// Google Ads report download instructions
const REPORTS = [
  {
    id: 'campaigns',
    label: 'Campaign Performance',
    icon: '📢',
    color: C.accent,
    description: 'Spend, revenue, ROAS and CPA per campaign',
    steps: [
      'Go to Google Ads → Reports → Predefined reports (Dimensions)',
      'Click "Basic" → "Campaign"',
      'Set date range to Last 30 days',
      'Make sure columns include: Campaign, Cost, Conversions, Conv. value, CPA, ROAS',
      'Click Download → CSV',
      'Upload the file here',
    ],
    directUrl: 'https://ads.google.com/aw/reports/predefined/campaign',
  },
  {
    id: 'searchterms',
    label: 'Search Terms',
    icon: '🔍',
    color: C.teal,
    description: 'Find wasted spend and new negative keywords',
    steps: [
      'Go to Google Ads → Keywords → Search terms',
      'Set date range to Last 30 days',
      'Click Download → CSV',
      'Upload the file here',
    ],
    directUrl: 'https://ads.google.com/aw/keywords/searchterms',
  },
  {
    id: 'shopping',
    label: 'Shopping Products',
    icon: '🛒',
    color: C.amber,
    description: 'Top performing products in Shopping campaigns',
    steps: [
      'Go to Google Ads → Reports → Shopping → Products',
      'Set date range to Last 30 days',
      'Download as CSV',
      'Upload the file here',
    ],
    directUrl: 'https://ads.google.com/aw/reports',
  },
  {
    id: 'keywords',
    label: 'Keywords',
    icon: '🔑',
    color: C.green,
    description: 'Keyword performance — CPC, conversions, quality score',
    steps: [
      'Go to Google Ads → Keywords → Search keywords',
      'Set date range to Last 30 days',
      'Download as CSV',
      'Upload the file here',
    ],
    directUrl: 'https://ads.google.com/aw/keywords',
  },
]

// Known negative keywords (always shown)
const NEGATIVE_KEYWORDS = [
  { category: 'Supermarket brands',    color: C.red,   keywords: ['head and shoulders','tresemme','pantene','dove shampoo','alberto balsam','herbal essences','vo5','timotei'] },
  { category: 'Non-relevant products', color: C.amber, keywords: ['mustard oil cooking','olive oil cooking','coconut oil cooking','food grade','kitchen oil'] },
  { category: 'Competitor terms',      color: C.blue,  keywords: ['sally beauty','pak cosmetics','sweethearts beauty','beautyworld'] },
  { category: 'Free / DIY searches',   color: C.text3, keywords: ['free wig','diy relaxer','homemade hair mask','free samples'] },
  { category: 'Wrong location',        color: C.text3, keywords: ['manchester hair shop','birmingham hair shop','london hair shop'] },
]

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

function Divider() {
  return <div style={{height:2,background:C.border,margin:'36px 0',borderRadius:1}}/>
}

function ReportUploader({ report, onResult }) {
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [expanded, setExpanded] = useState(false)
  const fileRef = useRef(null)

  async function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f.name)
    setLoading(true)
    const text = await f.text()
    try {
      const res = await fetch('/api/parse-ads-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text, reportType: report.label }),
      })
      const d = await res.json()
      if (d.ok) onResult(report.id, d)
    } catch(e) {}
    setLoading(false)
  }

  return (
    <div style={{background:C.surface,border:'1px solid '+report.color+'40',borderRadius:12,overflow:'hidden'}}>
      <div style={{padding:16,display:'flex',alignItems:'center',gap:12}}>
        <span style={{fontSize:24}}>{report.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,color:C.text,fontSize:14}}>{report.label}</div>
          <div style={{color:C.text3,fontSize:12,marginTop:2}}>{report.description}</div>
        </div>
        {file ? (
          <span style={{background:C.green+'20',color:C.green,padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>✓ {file}</span>
        ) : loading ? (
          <span style={{color:C.text3,fontSize:12}}>⟳ Analysing...</span>
        ) : null}
        <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{display:'none'}}/>
        <button onClick={()=>fileRef.current?.click()} disabled={loading} style={{padding:'7px 14px',borderRadius:8,border:'none',background:loading?C.surface2:report.color,color:loading?C.text3:'#000',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          {loading ? '⟳ Analysing...' : file ? '↺ Re-upload' : '+ Upload CSV'}
        </button>
        <button onClick={()=>setExpanded(!expanded)} style={{padding:'7px 10px',borderRadius:8,border:'1px solid '+C.border,background:C.surface2,color:C.text2,fontSize:12,cursor:'pointer'}}>
          {expanded ? '▲ Hide' : '▼ How to download'}
        </button>
      </div>

      {expanded && (
        <div style={{borderTop:'1px solid '+C.border,padding:16,background:C.surface2}}>
          <div style={{fontWeight:600,color:report.color,marginBottom:10,fontSize:13}}>How to download this report from Google Ads:</div>
          {report.steps.map((s,i) => (
            <div key={i} style={{display:'flex',gap:8,marginBottom:6,fontSize:13,color:C.text2}}>
              <span style={{background:report.color,color:'#000',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0}}>{i+1}</span>
              {s}
            </div>
          ))}
          <a href={report.directUrl} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,marginTop:10,padding:'7px 14px',borderRadius:8,border:'none',background:report.color,color:'#000',fontWeight:700,fontSize:12,textDecoration:'none'}}>
            Open Google Ads →
          </a>
        </div>
      )}
    </div>
  )
}

function AnalysisResult({ data }) {
  const [copiedNeg, setCopiedNeg] = useState(null)
  if (!data) return null

  const statusColor = s => s==='SCALE'?C.green:s==='GROW'?C.blue:s==='REDUCE'?C.amber:C.red

  return (
    <div style={{background:C.surface,border:'2px solid '+C.green+'40',borderRadius:14,padding:20,marginTop:16}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <span style={{fontSize:20}}>✨</span>
        <div>
          <div style={{fontWeight:800,color:C.green,fontSize:15}}>AI Analysis Complete — {data.reportType}</div>
          <div style={{color:C.text3,fontSize:12}}>{data.summary?.dateRange}</div>
        </div>
      </div>

      {/* Summary metrics */}
      {data.summary && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
          {[
            {label:'Total Spend',    val:data.summary.totalSpend,    color:C.red},
            {label:'Total Revenue',  val:data.summary.totalRevenue,  color:C.green},
            {label:'Overall ROAS',   val:data.summary.overallROAS,   color:C.blue},
            {label:'Overall CPA',    val:data.summary.overallCPA,    color:C.amber},
            {label:'Conversions',    val:data.summary.totalConversions, color:C.teal},
          ].map(m => (
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
          {data.urgentActions.map((a,i) => (
            <div key={i} style={{display:'flex',gap:8,marginBottom:6,fontSize:13,color:C.text2}}>
              <span style={{color:C.red,flexShrink:0}}>{i+1}.</span>{a}
            </div>
          ))}
        </div>
      )}

      {/* Campaigns */}
      {data.campaigns?.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:10,fontSize:13}}>📢 Campaign performance</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
            {data.campaigns.map((c,i) => (
              <div key={i} style={{background:C.surface2,border:'1px solid '+statusColor(c.status)+'40',borderRadius:10,padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div style={{fontWeight:700,color:C.text,fontSize:13,flex:1,marginRight:8}}>{c.name}</div>
                  <span style={{background:statusColor(c.status)+'20',color:statusColor(c.status),padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,flexShrink:0}}>{c.status}</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:8}}>
                  {[{k:'Spend',v:c.spend,col:C.text2},{k:'Revenue',v:c.revenue,col:C.green},{k:'ROAS',v:c.roas,col:C.blue},{k:'CPA',v:c.cpa,col:C.amber},{k:'Conv.',v:c.conversions,col:C.text}].map(m => (
                    <div key={m.k} style={{background:C.surface,borderRadius:6,padding:'5px 8px'}}>
                      <div style={{fontSize:10,color:C.text3}}>{m.k}</div>
                      <div style={{fontWeight:600,color:m.col,fontSize:12}}>{m.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:12,color:statusColor(c.status),background:statusColor(c.status)+'10',borderRadius:7,padding:'6px 9px'}}>
                  → {c.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wasted spend */}
      {data.wastedSpend?.length > 0 && (
        <div style={{background:'rgba(239,68,68,.06)',border:'1px solid '+C.red+'30',borderRadius:10,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.red,marginBottom:10,fontSize:13}}>
            💸 Wasted spend — {data.wastedSpend.reduce((s,w)=>s+parseInt((w.spend||'0').replace(/[£,]/g,'')||0),0).toLocaleString()} total
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {data.wastedSpend.map((w,i) => (
              <div key={i} style={{background:C.surface,borderRadius:8,padding:10}}>
                <div style={{fontWeight:600,color:C.text,fontSize:13}}>{w.term}</div>
                <div style={{color:C.red,fontWeight:700,fontSize:12}}>{w.spend} wasted</div>
                <div style={{color:C.text3,fontSize:11,marginTop:3}}>{w.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top keywords */}
      {data.topKeywords?.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:10,fontSize:13}}>🔑 Top keywords</div>
          <div style={{background:C.surface2,borderRadius:10,overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'8px 12px',borderBottom:'1px solid '+C.border}}>
              {['Keyword','Clicks','Spend','Conv.','CPA'].map(h=>(
                <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase'}}>{h}</span>
              ))}
            </div>
            {data.topKeywords.slice(0,10).map((k,i) => (
              <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'9px 12px',borderBottom:i<data.topKeywords.length-1?'1px solid '+C.border:'none',alignItems:'center'}}>
                <span style={{fontSize:13,color:C.text}}>{k.keyword}</span>
                <span style={{fontSize:13,color:C.text2}}>{k.clicks}</span>
                <span style={{fontSize:13,color:C.amber}}>{k.spend}</span>
                <span style={{fontSize:13,color:C.green}}>{k.conversions}</span>
                <span style={{fontSize:13,color:C.text2}}>{k.cpa}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaidAdsPage() {
  const [results, setResults]   = useState({})
  const [copiedNeg, setCopiedNeg] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)

  function handleResult(reportId, data) {
    setResults(p => ({ ...p, [reportId]: data }))
  }

  const hasAnyResult = Object.keys(results).length > 0

  // Discount codes — real ones
  const CODES = [
    { code:'WIGDEAL15',  pct:'15%', collection:'Wigs',           color:C.green  },
    { code:'COLOUR10',   pct:'10%', collection:'Hair Dye',       color:C.blue   },
    { code:'EDGE15',     pct:'15%', collection:'Edge Control',   color:C.teal   },
    { code:'BRAID10',    pct:'10%', collection:'Braiding Hair',  color:C.amber  },
    { code:'OIL10',      pct:'10%', collection:'Hair Oils',      color:C.red    },
    { code:'GROW10',     pct:'10%', collection:'Hair Growth',    color:C.blue   },
    { code:'COMEBACK10', pct:'10%', collection:'Abandoned Carts',color:C.accent },
  ]

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

        {/* PAGE HEADER */}
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:24,fontWeight:800,color:C.text,marginBottom:6}}>📊 Paid Ads — Google Ads Analysis</h1>
          <p style={{color:C.text2,fontSize:14,lineHeight:1.6}}>
            Download your reports from Google Ads, upload the CSV files below, and AI will instantly analyse your campaigns, find wasted spend and tell you exactly what to do.
          </p>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:12,padding:16,marginBottom:28}}>
          <div style={{fontWeight:700,color:C.accent2,marginBottom:10,fontSize:14}}>How it works</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
            {[
              {n:'1',t:'Open Google Ads',d:'Click any "Open Google Ads →" button below or go to ads.google.com'},
              {n:'2',t:'Download report as CSV',d:'Follow the steps shown — takes 30 seconds per report'},
              {n:'3',t:'Upload CSV here',d:'Click Upload CSV on any report card and select your file'},
              {n:'4',t:'Get instant AI analysis',d:'See real spend, ROAS, wasted spend and exact actions to take'},
            ].map(s=>(
              <div key={s.n} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:C.accent,color:'#fff',fontSize:12,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{s.n}</div>
                <div>
                  <div style={{fontWeight:600,color:C.text,fontSize:13,marginBottom:2}}>{s.t}</div>
                  <div style={{color:C.text3,fontSize:11,lineHeight:1.4}}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── REPORT UPLOADERS ── */}
        <SectionTitle num="1" icon="📂" title="Upload your Google Ads reports"
          sub="Upload any or all reports — each one unlocks a different section of analysis"/>

        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>
          {REPORTS.map(report => (
            <div key={report.id}>
              <ReportUploader report={report} onResult={handleResult}/>
              {results[report.id] && <AnalysisResult data={results[report.id]}/>}
            </div>
          ))}
        </div>

        {!hasAnyResult && (
          <div style={{background:C.surface,border:'2px dashed '+C.border,borderRadius:14,padding:40,textAlign:'center',marginBottom:28}}>
            <div style={{fontSize:40,marginBottom:12}}>📊</div>
            <div style={{fontWeight:700,color:C.text,fontSize:16,marginBottom:6}}>No reports uploaded yet</div>
            <div style={{color:C.text2,fontSize:13,maxWidth:400,margin:'0 auto'}}>
              Upload your Google Ads CSV reports above to see real campaign performance, wasted spend and AI recommendations.
            </div>
          </div>
        )}

        <Divider/>

        {/* ── NEGATIVE KEYWORDS ── */}
        <SectionTitle num="2" icon="🚫" title="Negative keywords — always exclude these"
          sub="Add these to all campaigns in Google Ads to stop wasting budget on irrelevant searches"/>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12,marginBottom:14}}>
          {NEGATIVE_KEYWORDS.map(cat => (
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

        {/* ── DISCOUNT CODES ── */}
        <SectionTitle num="3" icon="🎟️" title="Discount codes — use in ad copy"
          sub="Add these to your ad descriptions to improve CTR and track which campaigns drive purchases"/>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10,marginBottom:14}}>
          {CODES.map(o => (
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
                Add to ad copy: "Use code {o.code} for {o.pct} off"
              </div>
            </div>
          ))}
        </div>

        <Divider/>

        {/* ── MONTHLY ROUTINE ── */}
        <SectionTitle num="4" icon="📅" title="Monthly Paid Ads routine"/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[
            {label:'Every week', color:C.amber, items:[
              'Upload Search Terms CSV → add new negatives from wasted spend',
              'Upload Campaign CSV → check ROAS and scale/pause accordingly',
              'Check device bid adjustments — desktop should be +30%',
              'Review Shopping feed disapprovals in Merchant Center',
            ]},
            {label:'Every month', color:C.accent, items:[
              'Upload all 4 report CSVs for full account review',
              'Rotate discount codes if conversion rate drops',
              'Check Merchant Center for disapproved products',
              'Review competitor ads for new keyword opportunities',
            ]},
            {label:'Every quarter', color:C.teal, items:[
              'Full campaign audit — kill persistent underperformers',
              'Test new specialist campaign categories',
              'Review audience targeting for remarketing campaigns',
              'Update ad copy with seasonal offers and new products',
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
