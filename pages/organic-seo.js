import Head from 'next/head'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8', teal:'#14b8a6',
}

// ── KEYWORD CLUSTERS (309 terms) ──────────────────────────────────────
const CLUSTERS = [
  { id:'brand',    label:'Brand searches',     color:'#6366f1', icon:'🏷️', count:11,
    desc:'Direct searches for CC Hair & Beauty',
    keywords:['cc hair beauty','cc hair and beauty','cc hair beauty leeds','cc hair beauty chapeltown','cc hair beauty roundhay','cc hair beauty city centre','cc hair near me','continentals hair beauty','continental hair shop leeds','cc hair beauty opening times','cc hair beauty online'] },
  { id:'local',    label:'Local intent',        color:'#14b8a6', icon:'📍', count:45,
    desc:'Hair shop searches in Leeds — high buying intent',
    keywords:['hair shop leeds','afro hair shop leeds','black hair shop leeds','natural hair shop leeds','hair shop chapeltown','hair shop roundhay','hair shop city centre leeds','braiding hair leeds','wigs leeds','hair extensions leeds','relaxers leeds','hair dye leeds','edge control leeds','natural hair products leeds'] },
  { id:'product',  label:'Product searches',    color:'#f59e0b', icon:'🛍️', count:89,
    desc:'Specific products — target on collection & product pages',
    keywords:['ors relaxer uk','cantu shea butter uk','mielle rosemary oil uk','dark and lovely relaxer','kanekalon braiding hair','lace front wigs','human hair wigs','hair growth oil uk','edge control uk','shea moisture uk','africas best uk','design essentials uk','wella koleston','redken colour','schwarzkopf professional'] },
  { id:'question', label:'Question searches',   color:'#22c55e', icon:'❓', count:67,
    desc:'Use as blog post titles — answers these to rank',
    keywords:['where to buy braiding hair in leeds','where to buy wigs in leeds','best hair shop in leeds','how to care for afro hair uk','best relaxer for natural hair uk','how to grow afro hair uk','best natural hair products uk','where to buy ors relaxer uk','where can i buy cantu in leeds','best wigs for beginners uk','how to use edge control','what is the best hair growth oil','how to do box braids at home','best hair dye for afro hair uk','where to buy mielle rosemary oil uk'] },
  { id:'specialist',label:'Specialist brands', color:'#ef4444', icon:'⭐', count:97,
    desc:'Brand + UK / Leeds combos — high conversion intent',
    keywords:['redken leeds','loreal professional leeds','wella leeds','schwarzkopf leeds','cantu uk','ors uk','mielle organics uk','dark and lovely uk','africas best uk','shea moisture uk','olaplex leeds','keratin treatment leeds','design essentials uk','wella koleston leeds','schwarzkopf professional leeds'] },
]

// ── COLLECTION PAGES ──────────────────────────────────────────────────
const COLLECTIONS = [
  { name:'Wigs',              handle:'wigs',             score:62, priority:'high',   traffic:890,  conv:'2.1%',
    issues:['Meta title too short — missing brand name','Meta description missing','No H1 on page','Low word count — add 150+ word description'],
    targetKws:['wigs leeds','human hair wigs leeds','lace front wigs leeds','best wigs uk'],
  },
  { name:'Hair Dye & Colour', handle:'hair-dye-colour',  score:71, priority:'high',   traffic:540,  conv:'3.4%',
    issues:['Meta description missing','Thin description — under 100 words','Missing internal links to blog'],
    targetKws:['hair dye leeds','hair colour leeds','professional hair dye leeds','COLOUR10'],
  },
  { name:'Braiding Hair',     handle:'braiding-hair',    score:85, priority:'low',    traffic:320,  conv:'6.2%',
    issues:['Could add more local keywords to description'],
    targetKws:['braiding hair leeds','kanekalon braiding hair leeds','buy braiding hair leeds'],
  },
  { name:'Relaxers',          handle:'relaxers',         score:68, priority:'high',   traffic:290,  conv:'4.1%',
    issues:['Meta title missing keyword "Leeds"','Description needs ORS/Dark&Lovely brand names'],
    targetKws:['relaxers leeds','ors relaxer leeds','best relaxer for natural hair uk'],
  },
  { name:'Natural Hair Care', handle:'natural-hair-care',score:54, priority:'urgent', traffic:440,  conv:'1.8%',
    issues:['Meta title missing','Description rewrite needed','No brand names mentioned','Missing H1'],
    targetKws:['natural hair products leeds','natural hair care uk','cantu products leeds','mielle products leeds'],
  },
  { name:'Edge Control',      handle:'edge-control',     score:79, priority:'medium', traffic:180,  conv:'5.3%',
    issues:['Meta description slightly over 160 chars — trim it'],
    targetKws:['edge control leeds','edge control uk','EDGE15'],
  },
  { name:'Wigs & Hairpieces', handle:'wigs-hairpieces',  score:41, priority:'urgent', traffic:760,  conv:'0.9%',
    issues:['Possible duplicate of Wigs collection','Thin content','No unique keywords','High traffic but terrible conversion'],
    targetKws:['wigs leeds','synthetic wigs leeds','hairpieces uk'],
  },
  { name:'Hair Extensions',   handle:'hair-extensions',  score:66, priority:'medium', traffic:380,  conv:'3.1%',
    issues:['Missing H2 tags','Low word count in description'],
    targetKws:['hair extensions leeds','clip in hair extensions leeds'],
  },
]

// ── SEARCH CONSOLE KEYWORDS ───────────────────────────────────────────
const SC_KEYWORDS = [
  { query:'cc hair beauty',              clicks:1150, impressions:4200, ctr:'27.4%', pos:1.2,  change:'+0',  flag:false },
  { query:'hair shop leeds',             clicks:220,  impressions:1800, ctr:'12.2%', pos:3.1,  change:'+2',  flag:false },
  { query:'braiding hair leeds',         clicks:180,  impressions:760,  ctr:'23.7%', pos:1.8,  change:'+1',  flag:false },
  { query:'wigs leeds',                  clicks:95,   impressions:890,  ctr:'10.7%', pos:2.4,  change:'+3',  flag:false },
  { query:'natural hair products leeds', clicks:76,   impressions:540,  ctr:'14.1%', pos:2.1,  change:'+1',  flag:false },
  { query:'afro hair shop leeds',        clicks:54,   impressions:420,  ctr:'12.9%', pos:3.8,  change:'-1',  flag:false },
  { query:'hair extensions leeds',       clicks:43,   impressions:380,  ctr:'11.3%', pos:6.2,  change:'+3',  flag:false },
  { query:'ors relaxer uk',              clicks:38,   impressions:290,  ctr:'13.1%', pos:4.1,  change:'+2',  flag:false },
  { query:'lace front wigs leeds',       clicks:12,   impressions:680,  ctr:'1.8%',  pos:8.4,  change:'+1',  flag:true  }, // low CTR
  { query:'best natural hair products',  clicks:8,    impressions:520,  ctr:'1.5%',  pos:11.2, change:'+4',  flag:true  }, // low CTR
  { query:'hair relaxer leeds',          clicks:19,   impressions:160,  ctr:'11.9%', pos:5.8,  change:'0',   flag:false },
  { query:'edge control uk',             clicks:24,   impressions:180,  ctr:'13.3%', pos:7.1,  change:'+4',  flag:false },
  { query:'wigs uk',                     clicks:6,    impressions:890,  ctr:'0.7%',  pos:14.1, change:'+2',  flag:true  }, // page 2
  { query:'cantu shea butter uk',        clicks:31,   impressions:240,  ctr:'12.9%', pos:5.3,  change:'0',   flag:false },
]

function ScoreBar({score}) {
  const color = score >= 80 ? C.green : score >= 60 ? C.amber : C.red
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div style={{flex:1,height:8,background:C.surface,borderRadius:4,overflow:'hidden'}}>
        <div style={{width:score+'%',height:'100%',background:color,borderRadius:4,transition:'width .4s'}}/>
      </div>
      <span style={{fontWeight:700,color,fontSize:14,width:36}}>{score}</span>
    </div>
  )
}

function SectionTitle({num, icon, title, sub}) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
        <div style={{width:28,height:28,borderRadius:8,background:C.accent,color:'#fff',fontWeight:800,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{num}</div>
        <h2 style={{fontSize:18,fontWeight:800,color:C.text,margin:0}}>{icon} {title}</h2>
      </div>
      {sub && <div style={{color:C.text2,fontSize:13,marginLeft:38}}>{sub}</div>}
    </div>
  )
}

function Divider() {
  return <div style={{height:2,background:C.border,margin:'36px 0',borderRadius:1}}/>
}

export default function OrganicSEOPage() {
  // Keyword state
  const [kwSearch, setKwSearch]   = useState('')
  const [kwCopied, setKwCopied]   = useState(null)
  const [kwFilter, setKwFilter]   = useState('all')

  // Collection state
  const [fixing, setFixing]       = useState(null)
  const [fixes, setFixes]         = useState({})
  const [fixCopied, setFixCopied] = useState(null)

  // Blog state
  const [selectedKw, setSelectedKw]     = useState(null)
  const [customKw, setCustomKw]         = useState('')
  const [generatingBlog, setGenerating] = useState(false)
  const [blog, setBlog]                 = useState(null)
  const [blogCopied, setBlogCopied]     = useState(null)

  // SC state
  const [scSort, setScSort] = useState('clicks')
  const [scFilter, setScFilter] = useState('all')

  // Product SEO
  const [products, setProducts]     = useState([])
  const [prodLoading, setProdLoading] = useState(true)
  const [selectedProd, setSelectedProd] = useState(null)
  const [generatingMeta, setGeneratingMeta] = useState(false)
  const [metaFixes, setMetaFixes]   = useState({})
  const [metaCopied, setMetaCopied] = useState(null)

  useEffect(() => {
    fetch('/api/shopify-products?type=products&limit=30')
      .then(r => r.json())
      .then(d => { setProducts(d.data || []); setProdLoading(false) })
      .catch(() => setProdLoading(false))
  }, [])

  async function fixCollection(col) {
    setFixing(col.handle)
    try {
      const res = await fetch('/api/generate-content', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ collection: col.name, contentType:'meta' }),
      })
      const d = await res.json()
      setFixes(p => ({ ...p, [col.handle]: {
        title: `${col.name} | CC Hair & Beauty Leeds — ${col.targetKws[0]}`,
        description: d.content || `Shop ${col.name.toLowerCase()} at CC Hair & Beauty Leeds. ${col.targetKws.slice(0,2).join(', ')}. Visit our Chapeltown, Roundhay or City Centre branches. Free UK delivery over £50.`,
      }}))
    } catch(e) {}
    setFixing(null)
  }

  async function generateBlog(kw) {
    const keyword = kw || customKw
    if (!keyword.trim()) return
    setGenerating(true)
    setBlog(null)
    try {
      const res = await fetch('/api/generate-blog', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ keyword }),
      })
      const d = await res.json()
      setBlog(d.ok ? d : { error: d.error || 'Failed — try again' })
    } catch(e) {
      setBlog({ error: 'Failed — try again' })
    }
    setGenerating(false)
  }

  async function fixProductMeta(prod) {
    setGeneratingMeta(true)
    try {
      const res = await fetch('/api/generate-content', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ product: { title: prod.title, product_type: prod.product_type }, contentType:'meta' }),
      })
      const d = await res.json()
      setMetaFixes(p => ({ ...p, [prod.id]: {
        title: `${prod.title} | CC Hair & Beauty Leeds`,
        description: d.content || `Buy ${prod.title} at CC Hair & Beauty Leeds. In stock at Chapeltown LS7, Roundhay LS8 and City Centre. Free UK delivery over £50. Shop online at cchairandbeauty.com`,
        altText: `${prod.title} — available at CC Hair & Beauty Leeds`,
      }}))
    } catch(e) {}
    setGeneratingMeta(false)
  }

  function copyKw(kw) { navigator.clipboard.writeText(kw); setKwCopied(kw); setTimeout(()=>setKwCopied(null),1500) }
  function copyFix(key, text) { navigator.clipboard.writeText(text); setFixCopied(key); setTimeout(()=>setFixCopied(null),2000) }
  function copyBlog(key, text) { navigator.clipboard.writeText(text); setBlogCopied(key); setTimeout(()=>setBlogCopied(null),2000) }
  function copyMeta(key, text) { navigator.clipboard.writeText(text); setMetaCopied(key); setTimeout(()=>setMetaCopied(null),2000) }

  const scData = [...SC_KEYWORDS]
    .filter(k => scFilter === 'lowctr' ? k.flag : scFilter === 'top10' ? parseFloat(k.pos) <= 10 : true)
    .sort((a,b) => {
      if (scSort==='clicks') return b.clicks - a.clicks
      if (scSort==='impressions') return b.impressions - a.impressions
      if (scSort==='pos') return parseFloat(a.pos) - parseFloat(b.pos)
      return 0
    })

  const filteredClusters = CLUSTERS.map(c => ({
    ...c,
    keywords: kwSearch ? c.keywords.filter(k=>k.toLowerCase().includes(kwSearch.toLowerCase())) : c.keywords,
  })).filter(c => (kwFilter==='all'||kwFilter===c.id) && c.keywords.length > 0)

  const totalKw = CLUSTERS.reduce((s,c)=>s+c.count,0)
  const urgentCollections = COLLECTIONS.filter(c=>c.priority==='urgent')
  const highCollections   = COLLECTIONS.filter(c=>c.priority==='high')

  return (
    <>
      <Head>
        <title>Organic SEO — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button,input,textarea{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      <Nav/>

      <div style={{maxWidth:1200,margin:'0 auto',padding:20}}>

        {/* PAGE HEADER */}
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:24,fontWeight:800,color:C.text,marginBottom:6}}>🔍 Organic SEO — Team Guide</h1>
          <p style={{color:C.text2,fontSize:14,lineHeight:1.6}}>
            Pillar 2 from your SEO strategy. Follow top to bottom: keywords → collection pages → blog content → product SEO → Search Console.
          </p>
          {/* Priority banner */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:16}}>
            {[
              {label:'Keywords tracked',   val:totalKw,                              color:C.blue,  icon:'🔑'},
              {label:'Collections needing fixes', val:COLLECTIONS.filter(c=>c.score<75).length, color:C.red,   icon:'📄'},
              {label:'Low CTR keywords',   val:SC_KEYWORDS.filter(k=>k.flag).length, color:C.amber, icon:'📊'},
            ].map(m=>(
              <div key={m.label} style={{background:C.surface,border:'1px solid '+m.color+'30',borderRadius:10,padding:14,display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24}}>{m.icon}</span>
                <div>
                  <div style={{fontSize:26,fontWeight:800,color:m.color}}>{m.val}</div>
                  <div style={{color:C.text2,fontSize:12}}>{m.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════
            1. KEYWORD CLUSTERS
        ════════════════════════════════════════════ */}
        <SectionTitle num="1" icon="🔑" title="Keyword clusters — 309 search terms"
          sub="Your master keyword bank. Use these across collection pages, product descriptions, and blog posts."/>

        {/* Filter tabs */}
        <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
          <button onClick={()=>setKwFilter('all')} style={{padding:'5px 14px',borderRadius:99,border:kwFilter==='all'?'none':'1px solid '+C.border,background:kwFilter==='all'?C.accent:C.surface2,color:C.text,fontSize:12,cursor:'pointer'}}>All ({totalKw})</button>
          {CLUSTERS.map(c=>(
            <button key={c.id} onClick={()=>setKwFilter(c.id)} style={{padding:'5px 14px',borderRadius:99,border:kwFilter===c.id?'none':'1px solid '+c.color+'40',background:kwFilter===c.id?c.color:c.color+'10',color:kwFilter===c.id?'#000':c.color,fontSize:12,cursor:'pointer',fontWeight:kwFilter===c.id?700:400}}>
              {c.icon} {c.label} ({c.count})
            </button>
          ))}
          <input value={kwSearch} onChange={e=>setKwSearch(e.target.value)} placeholder="Search keywords..." style={{marginLeft:'auto',background:C.surface2,border:'1px solid '+C.border,borderRadius:7,color:C.text,fontSize:12,padding:'6px 12px',outline:'none',width:180}}/>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))',gap:12,marginBottom:8}}>
          {filteredClusters.map(cluster=>(
            <div key={cluster.id} style={{background:C.surface,border:'1px solid '+cluster.color+'30',borderRadius:12,overflow:'hidden'}}>
              <div style={{padding:'11px 14px',background:cluster.color+'10',borderBottom:'1px solid '+cluster.color+'20'}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                  <span style={{fontSize:16}}>{cluster.icon}</span>
                  <span style={{fontWeight:700,color:cluster.color,fontSize:13}}>{cluster.label}</span>
                  <span style={{background:cluster.color+'20',color:cluster.color,padding:'1px 7px',borderRadius:99,fontSize:11,fontWeight:600,marginLeft:'auto'}}>{cluster.count}</span>
                </div>
                <div style={{fontSize:11,color:C.text2}}>{cluster.desc}</div>
              </div>
              <div style={{padding:10,display:'flex',flexWrap:'wrap',gap:5}}>
                {cluster.keywords.map(kw=>(
                  <button key={kw} onClick={()=>copyKw(kw)} style={{
                    padding:'4px 9px',borderRadius:6,border:'1px solid '+cluster.color+'30',
                    background:kwCopied===kw?cluster.color:cluster.color+'10',
                    color:kwCopied===kw?'#000':cluster.color,
                    fontSize:11,cursor:'pointer',fontWeight:500,transition:'all .1s',
                  }}>{kwCopied===kw?'✓':kw}</button>
                ))}
                {cluster.count > cluster.keywords.length && (
                  <span style={{fontSize:11,color:C.text3,padding:'4px 6px'}}>+{cluster.count-cluster.keywords.length} more...</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:10,padding:12,marginBottom:8,fontSize:13,color:C.accent2}}>
          💡 <strong>How to use keywords:</strong> Brand searches → homepage & About page. Local intent → collection page titles + descriptions. Product searches → product page titles. Question searches → blog post titles (see Blog section below). Specialist brands → dedicated brand pages or blog posts.
        </div>

        <Divider/>

        {/* ════════════════════════════════════════════
            2. COLLECTION PAGES
        ════════════════════════════════════════════ */}
        <SectionTitle num="2" icon="📄" title="Collection pages — SEO scores"
          sub="Fix collection page meta titles, descriptions and content. Urgent ones first."/>

        {/* Urgent alert */}
        {urgentCollections.length > 0 && (
          <div style={{background:'rgba(239,68,68,.06)',border:'1px solid '+C.red+'30',borderRadius:10,padding:12,marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
            <span style={{fontSize:18,flexShrink:0}}>🚨</span>
            <div>
              <div style={{fontWeight:700,color:C.red,marginBottom:4}}>{urgentCollections.length} collection pages need urgent fixing</div>
              <div style={{color:C.text2,fontSize:13}}>{urgentCollections.map(c=>c.name).join(', ')} — high traffic, low SEO score. Fix these first.</div>
            </div>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:8}}>
          {COLLECTIONS.sort((a,b)=>a.score-b.score).map(col=>{
            const sc = col.score>=80?C.green:col.score>=60?C.amber:C.red
            const hasFix = fixes[col.handle]
            const priorityColor = col.priority==='urgent'?C.red:col.priority==='high'?C.amber:col.priority==='medium'?C.blue:C.green
            return (
              <div key={col.handle} style={{background:C.surface,border:'1px solid '+(col.priority==='urgent'?C.red+'40':col.priority==='high'?C.amber+'40':C.border),borderRadius:12,padding:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:C.text}}>{col.name}</div>
                    <div style={{color:C.text3,fontSize:12,marginTop:2}}>
                      /{col.handle} · {col.traffic.toLocaleString()} visits/mo · {col.conv} conv
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <span style={{background:priorityColor+'20',color:priorityColor,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,textTransform:'uppercase',display:'block',marginBottom:4}}>{col.priority}</span>
                    <span style={{fontSize:22,fontWeight:800,color:sc}}>{col.score}</span><span style={{color:C.text3,fontSize:11}}>/100</span>
                  </div>
                </div>

                <ScoreBar score={col.score}/>

                <div style={{marginTop:10,marginBottom:12}}>
                  {col.issues.map((issue,i)=>(
                    <div key={i} style={{display:'flex',gap:6,marginBottom:4,fontSize:12,color:C.text2}}>
                      <span style={{color:C.red,flexShrink:0}}>✗</span>{issue}
                    </div>
                  ))}
                </div>

                {/* Target keywords */}
                <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12}}>
                  {col.targetKws.map(kw=>(
                    <span key={kw} style={{background:C.surface2,color:C.accent2,padding:'2px 8px',borderRadius:5,fontSize:11}}>{kw}</span>
                  ))}
                </div>

                {/* AI Fix */}
                {hasFix ? (
                  <div style={{background:'rgba(99,102,241,.08)',border:'1px solid rgba(99,102,241,.2)',borderRadius:9,padding:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.accent2,marginBottom:8,textTransform:'uppercase',letterSpacing:'.05em'}}>✨ AI Fix — paste into Shopify collection</div>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:11,color:C.text3,marginBottom:3}}>Meta Title (paste in Shopify → Collections → SEO)</div>
                      <div style={{background:C.surface,borderRadius:6,padding:'6px 10px',fontSize:12,color:C.accent2,fontFamily:'monospace',marginBottom:5}}>{hasFix.title}</div>
                      <button onClick={()=>copyFix(col.handle+'_t',hasFix.title)} style={{padding:'3px 10px',borderRadius:5,border:'none',background:fixCopied===col.handle+'_t'?C.green:C.accent,color:fixCopied===col.handle+'_t'?'#000':'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>
                        {fixCopied===col.handle+'_t'?'✓ Copied!':'📋 Copy title'}
                      </button>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:C.text3,marginBottom:3}}>Meta Description</div>
                      <div style={{background:C.surface,borderRadius:6,padding:'6px 10px',fontSize:12,color:C.text2,marginBottom:5,lineHeight:1.5}}>{hasFix.description}</div>
                      <button onClick={()=>copyFix(col.handle+'_d',hasFix.description)} style={{padding:'3px 10px',borderRadius:5,border:'none',background:fixCopied===col.handle+'_d'?C.green:C.accent,color:fixCopied===col.handle+'_d'?'#000':'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>
                        {fixCopied===col.handle+'_d'?'✓ Copied!':'📋 Copy description'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>fixCollection(col)} disabled={fixing===col.handle} style={{flex:1,padding:'8px',borderRadius:8,border:'none',background:fixing===col.handle?C.surface2:C.accent,color:fixing===col.handle?C.text3:'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                      {fixing===col.handle?'⟳ Generating...':'✨ AI Fix meta title & description'}
                    </button>
                    <a href={`https://cchairandbeauty.myshopify.com/admin/collections?query=${encodeURIComponent(col.name)}`} target="_blank" rel="noreferrer" style={{padding:'8px 12px',borderRadius:8,border:'1px solid '+C.border,background:C.surface2,color:C.text2,fontSize:12,textDecoration:'none'}}>
                      Edit →
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.2)',borderRadius:10,padding:12,fontSize:13,color:C.amber}}>
          📋 <strong>How to fix in Shopify:</strong> Admin → Collections → click collection → scroll to bottom → SEO section → paste meta title (max 60 chars) and meta description (max 155 chars). Also add the target keywords naturally into the collection description (aim for 150+ words).
        </div>

        <Divider/>

        {/* ════════════════════════════════════════════
            3. BLOG CONTENT
        ════════════════════════════════════════════ */}
        <SectionTitle num="3" icon="✍️" title="Blog content — 1 post per day target"
          sub="Use Question searches as titles. AI writes in 30 seconds. Paste into Shopify → Blog Posts → Local News."/>

        <div style={{background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.2)',borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:C.green}}>
          📍 Blog URL structure: <strong>cchairandbeauty.com/blogs/local-news/[keyword-slug]</strong> — Create a blog called "Local News" in Shopify if you haven't already.
        </div>

        {/* Keyword picker */}
        <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:14,padding:18,marginBottom:14}}>
          <div style={{fontWeight:600,color:C.text,marginBottom:12}}>Pick a keyword to blog about — start with ❓ Question searches:</div>
          {CLUSTERS.map(cluster=>(
            <div key={cluster.id} style={{marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                <span style={{fontSize:14}}>{cluster.icon}</span>
                <span style={{fontWeight:700,color:cluster.color,fontSize:12}}>{cluster.label}</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {cluster.keywords.map(kw=>{
                  const isSel = selectedKw===kw
                  return (
                    <button key={kw} onClick={()=>setSelectedKw(isSel?null:kw)} style={{
                      padding:'4px 10px',borderRadius:7,fontSize:11,cursor:'pointer',fontWeight:isSel?700:400,
                      border: isSel?'none':'1px solid '+cluster.color+'40',
                      background:isSel?cluster.color:cluster.color+'10',
                      color:isSel?'#000':cluster.color,
                    }}>{isSel?'✓ ':''}{kw}</button>
                  )
                })}
              </div>
            </div>
          ))}
          <div style={{borderTop:'1px solid '+C.border,paddingTop:12,marginTop:4}}>
            <input value={customKw} onChange={e=>{setCustomKw(e.target.value);setSelectedKw(null)}} placeholder="Or type your own keyword..." style={{width:'100%',background:C.surface2,border:'1px solid '+C.border,borderRadius:7,color:C.text,fontSize:13,padding:'8px 12px',outline:'none'}}/>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,flexWrap:'wrap'}}>
          <button onClick={()=>generateBlog(selectedKw||customKw)} disabled={(!selectedKw&&!customKw.trim())||generatingBlog} style={{padding:'11px 28px',borderRadius:10,border:'none',background:generatingBlog||(!selectedKw&&!customKw.trim())?C.surface2:C.green,color:generatingBlog||(!selectedKw&&!customKw.trim())?C.text3:'#000',fontWeight:700,fontSize:14,cursor:'pointer'}}>
            {generatingBlog?'⟳ Writing blog...':'✨ Generate Blog Post'}
          </button>
          {(selectedKw||customKw)&&<span style={{color:C.text2,fontSize:13}}>Keyword: <strong style={{color:C.green}}>{selectedKw||customKw}</strong></span>}
        </div>

        {blog && !blog.error && (
          <div style={{background:C.surface,border:'1px solid '+C.green+'40',borderRadius:14,overflow:'hidden',marginBottom:14}}>
            <div style={{background:'rgba(34,197,94,.08)',padding:'12px 18px',borderBottom:'1px solid '+C.border,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:12,fontWeight:700,color:C.green}}>✨ Blog ready — paste each field into Shopify Blog Posts</span>
              <a href="https://cchairandbeauty.myshopify.com/admin/articles/new" target="_blank" rel="noreferrer" style={{padding:'5px 14px',borderRadius:7,border:'none',background:C.green,color:'#000',fontWeight:700,fontSize:12,textDecoration:'none'}}>Open Shopify Blog →</a>
            </div>
            <div style={{padding:16,display:'flex',flexDirection:'column',gap:9}}>
              {[
                {label:'📄 SEO Title',       key:'seoTitle',       hint:'Shopify SEO section → Page title'},
                {label:'🔗 URL Slug',        key:'urlSlug',        hint:'Shopify → URL and handle', prefix:'cchairandbeauty.com/blogs/local-news/'},
                {label:'📝 Meta Description',key:'metaDescription',hint:'Shopify SEO section → Meta description'},
                {label:'🏷️ H1 Heading',      key:'h1',             hint:'Use as the blog post Title field'},
                {label:'🖼️ Image Alt Text',  key:'imageAlt',       hint:'Add to your featured image alt text'},
              ].map(f=>(
                <div key={f.key} style={{background:C.surface2,borderRadius:9,padding:11}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                    <div><span style={{fontWeight:700,color:C.text,fontSize:12}}>{f.label}</span><span style={{color:C.text3,fontSize:11,marginLeft:8}}>{f.hint}</span></div>
                    <button onClick={()=>copyBlog(f.key,f.prefix?(f.prefix+blog[f.key]):blog[f.key])} style={{padding:'3px 10px',borderRadius:5,border:'none',background:blogCopied===f.key?C.green:C.accent,color:blogCopied===f.key?'#000':'#fff',fontWeight:600,fontSize:11,cursor:'pointer',flexShrink:0,marginLeft:10}}>
                      {blogCopied===f.key?'✓':'📋 Copy'}
                    </button>
                  </div>
                  <div style={{color:C.accent2,fontSize:12,fontFamily:'monospace',background:C.surface,padding:'5px 9px',borderRadius:6}}>{f.prefix?f.prefix+blog[f.key]:blog[f.key]}</div>
                </div>
              ))}
              <div style={{background:C.surface2,borderRadius:9,padding:11}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
                  <div><span style={{fontWeight:700,color:C.text,fontSize:12}}>📖 Blog HTML</span><span style={{color:C.text3,fontSize:11,marginLeft:8}}>Switch to HTML mode in Shopify editor</span></div>
                  <button onClick={()=>copyBlog('html',blog.blogContent)} style={{padding:'3px 10px',borderRadius:5,border:'none',background:blogCopied==='html'?C.green:C.accent,color:blogCopied==='html'?'#000':'#fff',fontWeight:600,fontSize:11,cursor:'pointer'}}>
                    {blogCopied==='html'?'✓ Copied!':'📋 Copy HTML'}
                  </button>
                </div>
                <div style={{background:C.surface,borderRadius:6,padding:10,fontSize:12,color:C.text2,lineHeight:1.7,maxHeight:220,overflowY:'auto'}} dangerouslySetInnerHTML={{__html:blog.blogContent}}/>
              </div>
            </div>
          </div>
        )}
        {blog?.error && <div style={{background:'rgba(239,68,68,.08)',border:'1px solid '+C.red+'30',borderRadius:9,padding:12,color:C.red,marginBottom:14}}>{blog.error}</div>}

        <Divider/>

        {/* ════════════════════════════════════════════
            4. PRODUCT SEO
        ════════════════════════════════════════════ */}
        <SectionTitle num="4" icon="🏷️" title="Product SEO — meta titles & descriptions"
          sub="Fix product meta titles, descriptions and image alt text. Start with best-selling products."/>

        <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:14,padding:18,marginBottom:14}}>
          <div style={{fontWeight:600,color:C.text,marginBottom:12}}>Select a product to generate its meta title, description and image alt text:</div>
          {prodLoading ? (
            <div style={{textAlign:'center',padding:30,color:C.text3}}>Loading products from Shopify...</div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:8,marginBottom:14}}>
              {products.slice(0,12).map(p=>{
                const isSel = selectedProd?.id===p.id
                return (
                  <div key={p.id} onClick={()=>setSelectedProd(isSel?null:p)} style={{border:'2px solid '+(isSel?C.accent:C.border),borderRadius:10,padding:9,cursor:'pointer',background:isSel?C.accent+'10':C.surface2,position:'relative',transition:'all .12s'}}>
                    {isSel&&<div style={{position:'absolute',top:6,right:6,background:C.accent,color:'#fff',borderRadius:'50%',width:16,height:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700}}>✓</div>}
                    {p.images?.[0]?.src?<img src={p.images[0].src} alt="" style={{width:'100%',height:70,objectFit:'cover',borderRadius:6,marginBottom:6}}/>:<div style={{width:'100%',height:70,background:C.surface,borderRadius:6,marginBottom:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📦</div>}
                    <div style={{fontSize:11,fontWeight:600,color:C.text,lineHeight:1.3}}>{p.title}</div>
                  </div>
                )
              })}
            </div>
          )}
          <button onClick={()=>selectedProd&&fixProductMeta(selectedProd)} disabled={!selectedProd||generatingMeta} style={{padding:'9px 22px',borderRadius:9,border:'none',background:selectedProd&&!generatingMeta?C.accent:C.surface2,color:selectedProd&&!generatingMeta?'#fff':C.text3,fontWeight:700,fontSize:13,cursor:'pointer'}}>
            {generatingMeta?'⟳ Generating...':'✨ Generate meta title & description'}
          </button>
        </div>

        {selectedProd && metaFixes[selectedProd.id] && (
          <div style={{background:C.surface,border:'1px solid '+C.accent+'40',borderRadius:12,padding:16,marginBottom:14}}>
            <div style={{fontWeight:700,color:C.accent2,marginBottom:12,fontSize:13}}>✨ SEO fix for: {selectedProd.title}</div>
            {[
              {label:'Meta Title',      key:'title',       hint:'Shopify → Products → SEO → Page title'},
              {label:'Meta Description',key:'description', hint:'Shopify → Products → SEO → Meta description'},
              {label:'Image Alt Text',  key:'altText',     hint:'Shopify → Products → click image → Alt text'},
            ].map(f=>{
              const val = metaFixes[selectedProd.id][f.key]
              const mKey = selectedProd.id+'_'+f.key
              return (
                <div key={f.key} style={{background:C.surface2,borderRadius:9,padding:11,marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                    <div><span style={{fontWeight:700,color:C.text,fontSize:12}}>{f.label}</span><span style={{color:C.text3,fontSize:11,marginLeft:8}}>{f.hint}</span></div>
                    <button onClick={()=>copyMeta(mKey,val)} style={{padding:'3px 10px',borderRadius:5,border:'none',background:metaCopied===mKey?C.green:C.accent,color:metaCopied===mKey?'#000':'#fff',fontWeight:600,fontSize:11,cursor:'pointer',flexShrink:0,marginLeft:10}}>
                      {metaCopied===mKey?'✓':'📋 Copy'}
                    </button>
                  </div>
                  <div style={{color:C.accent2,fontSize:12,fontFamily:'monospace',background:C.surface,padding:'5px 9px',borderRadius:6}}>{val}</div>
                </div>
              )
            })}
            <a href={`https://cchairandbeauty.myshopify.com/admin/products`} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.accent2,fontSize:12,textDecoration:'none'}}>
              Open product in Shopify →
            </a>
          </div>
        )}

        <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:10,padding:12,fontSize:13,color:C.accent2}}>
          📋 <strong>Shopify product SEO checklist:</strong> Title should be under 60 chars and include the product name + brand. Meta description 140-155 chars. Every image needs an alt text. Priority: your top 20 best-selling products first.
        </div>

        <Divider/>

        {/* ════════════════════════════════════════════
            5. SEARCH CONSOLE
        ════════════════════════════════════════════ */}
        <SectionTitle num="5" icon="📊" title="Search Console — monitor & fix"
          sub="Track keyword rankings, find low CTR pages, and monitor which queries bring traffic."/>

        <div style={{background:'rgba(59,130,246,.06)',border:'1px solid #3b82f630',borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:C.blue}}>
          ℹ️ Showing last known keyword data. Full live sync available once Google Search Console OAuth is connected — go to the Debug page to connect.
        </div>

        {/* Low CTR alert */}
        {SC_KEYWORDS.filter(k=>k.flag).length > 0 && (
          <div style={{background:'rgba(239,68,68,.06)',border:'1px solid '+C.red+'30',borderRadius:10,padding:12,marginBottom:14}}>
            <div style={{fontWeight:700,color:C.red,marginBottom:8}}>🚨 {SC_KEYWORDS.filter(k=>k.flag).length} keywords with low CTR — you rank but people aren't clicking</div>
            <div style={{fontSize:13,color:C.text2,marginBottom:10}}>Fix: rewrite the page title and meta description to be more clickable. Use power words, numbers, and your location.</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {SC_KEYWORDS.filter(k=>k.flag).map(k=>(
                <div key={k.query} style={{display:'flex',alignItems:'center',gap:12,background:C.surface,borderRadius:8,padding:'9px 12px'}}>
                  <span style={{flex:1,fontSize:13,color:C.text}}>{k.query}</span>
                  <span style={{color:C.text2,fontSize:12}}>{k.impressions.toLocaleString()} impressions</span>
                  <span style={{color:C.red,fontWeight:700,fontSize:13}}>CTR: {k.ctr}</span>
                  <span style={{color:C.text3,fontSize:12}}>Pos: #{k.pos}</span>
                  <span style={{background:C.red+'20',color:C.red,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700}}>Fix title</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort + filter */}
        <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
          {[
            {id:'all',    label:'All keywords'},
            {id:'lowctr', label:'🔴 Low CTR (fix these)'},
            {id:'top10',  label:'Top 10 positions'},
          ].map(f=>(
            <button key={f.id} onClick={()=>setScFilter(f.id)} style={{padding:'5px 13px',borderRadius:99,border:scFilter===f.id?'none':'1px solid '+C.border,background:scFilter===f.id?C.accent:C.surface2,color:C.text,fontSize:12,cursor:'pointer',fontWeight:scFilter===f.id?700:400}}>{f.label}</button>
          ))}
          <div style={{marginLeft:'auto',display:'flex',gap:5}}>
            {['clicks','impressions','pos'].map(s=>(
              <button key={s} onClick={()=>setScSort(s)} style={{padding:'5px 12px',borderRadius:7,border:scSort===s?'none':'1px solid '+C.border,background:scSort===s?C.surface2:C.surface,color:scSort===s?C.accent2:C.text3,fontSize:11,cursor:'pointer',textTransform:'capitalize'}}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,overflow:'hidden',marginBottom:8}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr',padding:'9px 14px',borderBottom:'1px solid '+C.border}}>
            {['Keyword','Clicks','Impressions','CTR','Position','Change'].map(h=>(
              <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:'.04em'}}>{h}</span>
            ))}
          </div>
          {scData.map((k,i)=>{
            const pc = parseFloat(k.pos)<=3?C.green:parseFloat(k.pos)<=10?C.amber:C.red
            const chNum = parseInt(k.change)
            const chColor = chNum>0?C.green:chNum<0?C.red:C.text3
            return (
              <div key={k.query} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 14px',borderBottom:i<scData.length-1?'1px solid '+C.border:'none',alignItems:'center',background:k.flag?'rgba(239,68,68,.03)':'transparent'}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  {k.flag&&<span style={{color:C.red,fontSize:11,flexShrink:0}}>⚠</span>}
                  <span style={{fontSize:13,color:C.text}}>{k.query}</span>
                </div>
                <span style={{color:C.green,fontWeight:700,fontSize:13}}>{k.clicks.toLocaleString()}</span>
                <span style={{color:C.text2,fontSize:13}}>{k.impressions.toLocaleString()}</span>
                <span style={{color:k.flag?C.red:C.text2,fontWeight:k.flag?700:400,fontSize:13}}>{k.ctr}</span>
                <span style={{background:pc+'20',color:pc,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,display:'inline-block'}}>#{k.pos}</span>
                <span style={{color:chColor,fontWeight:600,fontSize:13}}>{chNum>0?'↑ +':chNum<0?'↓ ':''}{k.change}</span>
              </div>
            )
          })}
        </div>

        <div style={{background:'rgba(59,130,246,.06)',border:'1px solid #3b82f630',borderRadius:10,padding:12,fontSize:13,color:C.blue}}>
          📊 <strong>Search Console routine:</strong> Check weekly. Keywords on position 8-15 are on the edge of page 1 — add them to collection pages and write a blog targeting that exact phrase to push them to top 5.
        </div>

        <Divider/>

        {/* ── MONTHLY ROUTINE ── */}
        <SectionTitle num="6" icon="📅" title="Monthly Organic SEO routine"/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[
            {label:'Every week', color:C.teal, items:[
              'Publish 1-2 blog posts using Blog Generator',
              'Check Search Console for new low CTR keywords',
              'Review new products — generate meta tags',
              'Add keywords to any new collection pages',
            ]},
            {label:'Every month', color:C.accent, items:[
              'Fix all red/amber collection page SEO scores',
              'Publish 4+ blogs targeting Question searches',
              'Update meta descriptions on top 5 collections',
              'Check which blogs are driving traffic in SC',
              'Add internal links from blogs to collection pages',
            ]},
            {label:'Every quarter', color:C.amber, items:[
              'Full audit of all 309 tracked keywords',
              'Check positions for all collection page keywords',
              'Identify new keyword opportunities from SC',
              'Update old blog posts with fresher content',
              'Review competitor collection page SEO',
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
