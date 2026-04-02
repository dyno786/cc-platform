import Head from 'next/head'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8', teal:'#14b8a6',
}

const BRANCHES = [
  {
    id:'chapeltown', name:'Chapeltown', area:'LS7',
    address:'119-129 Chapeltown Road, Leeds LS7 3DU',
    rating:4.0, reviews:66, target:4.2, color:C.green, alertColor:C.amber,
    status:'⚠️ Post due today',
    reviewLink:'https://www.google.com/search?q=cc+hair+and+beauty+chapeltown&sca_esv=69b89b82830faa31&ei=yjvOabydLZmDhbIPjtub-Ac&oq=cc+hair+and+beauty+c',
    gbpLink:'https://business.google.com',
    tasks:[
      {done:false, text:'Post weekly GBP offer — use Product Post Builder below'},
      {done:false, text:'Reply to any new reviews — open GBP and reply'},
      {done:false, text:'Answer any unanswered Q&A questions'},
      {done:true,  text:'QR review badge displayed in store'},
    ],
  },
  {
    id:'roundhay', name:'Roundhay', area:'LS8',
    address:'256-258 Roundhay Road, Leeds LS8 5RL',
    rating:3.8, reviews:119, target:4.2, color:C.amber, alertColor:C.red,
    status:'🔴 Post overdue',
    reviewLink:'https://www.google.com/search?gs_ssp=eJwVxkEOQDAQAMC48om9ONvVCvUEv9jttuVCiEr9Xsxp6qZLHd3xSWcxWM0tFjuNbpDJIalHsTJjcagy9qEnIiPexgW8h5W3C3hXkMD5fuE68q4r_2H9AEBjGsI&q=cc+hair+and+beauty+roundhay+road',
    gbpLink:'https://business.google.com',
    tasks:[
      {done:false, text:'Post weekly GBP offer — OVERDUE'},
      {done:false, text:'Reply to negative review — open GBP and reply'},
      {done:false, text:'Upload 3 new product photos to GBP'},
      {done:true,  text:'QR review badge displayed in store'},
    ],
  },
  {
    id:'citycentre', name:'City Centre', area:'New York St',
    address:'1-19 New York Street, Leeds LS2 6BY',
    rating:3.3, reviews:35, target:4.2, color:C.red, alertColor:C.red,
    status:'🔴 Low rating — urgent',
    reviewLink:'https://www.google.com/search?q=CC+Hair+And+Beauty+-+City+Centre&stick=H4sIAAAAAAAA_-NgU1I1qDCxMLc0TTa0tDRKTjQ2S7S0MqgwTjQ0Nk8yNzNPMjZNsjA3XMSq4Oys4JGYWaTgmJei4JSaWFpSqaCr4JwJpJxT80qKUgEOkP78TAAAAA&hl=en&mat=Cd64hHkqvRApElcBTVDHnrOhGuUeBg2O6hxkh0-6mbYmSjenQqp5QY7sd28FxsVBtJB_e4bYNd1JpQtWp-lkXd0LTc_kP29Rz9Q6yBB7L4Jlx8MPaWVz9hJ02G8BefDv3oI&authuser=0',
    gbpLink:'https://business.google.com',
    tasks:[
      {done:false, text:'Post weekly GBP offer today'},
      {done:false, text:'Reply to negative reviews — open GBP and reply'},
      {done:false, text:'Ask every customer for a review this week'},
      {done:false, text:'Answer unanswered Q&A questions'},
    ],
  },
]

const KEYWORD_CLUSTERS = [
  { cluster:'Brand searches',    color:'#6366f1', icon:'🏷️', desc:'People searching directly for CC Hair & Beauty',
    keywords:['cc hair beauty','cc hair and beauty','cc hair beauty leeds','cc hair beauty chapeltown','cc hair beauty roundhay','cc hair beauty city centre','cc hair near me','continentals hair beauty','continental hair shop leeds','cc hair beauty opening times','cc hair beauty online'] },
  { cluster:'Local intent',      color:'#14b8a6', icon:'📍', desc:'People looking for hair shops in Leeds — blog priority',
    keywords:['hair shop leeds','hair shops in leeds','afro hair shop leeds','black hair shop leeds','natural hair shop leeds','hair beauty shop leeds','hair shop near me leeds','hair shop chapeltown','hair shop roundhay','hair shop city centre leeds','hair supply store leeds','professional hair shop leeds','hair products store leeds','where to buy hair products leeds','hair beauty supply leeds'] },
  { cluster:'Product searches',  color:'#f59e0b', icon:'🛍️', desc:'Specific products — blog topics and product page keywords',
    keywords:['braiding hair leeds','buy braiding hair leeds','kanekalon braiding hair leeds','wigs leeds','human hair wigs leeds','lace front wigs leeds','synthetic wigs leeds','hair extensions leeds','clip in hair extensions leeds','weave extensions leeds','relaxers leeds','hair relaxer leeds','ors relaxer leeds','dark and lovely relaxer leeds','hair dye leeds','hair colour leeds','professional hair dye leeds','edge control leeds','natural hair products leeds','cantu products leeds','mielle products leeds','ors products leeds','shea butter hair products leeds','hair growth products leeds','moisture products natural hair leeds'] },
  { cluster:'Question searches', color:'#22c55e', icon:'❓', desc:'Use these as blog post titles — answer to rank on Google',
    keywords:['where to buy braiding hair in leeds','where to buy wigs in leeds','best hair shop in leeds','what time does cc hair beauty open','where to buy ors relaxer in leeds','where can i buy cantu in leeds','best natural hair products uk','how to care for afro hair uk','where to buy hair extensions leeds','best wigs for beginners uk','where to buy edge control uk','best relaxer for natural hair uk','how to grow afro hair uk','best hair growth oil uk','where to buy mielle rosemary oil uk','kanekalon hair uk where to buy'] },
  { cluster:'Specialist brands', color:'#ef4444', icon:'⭐', desc:'Brand + location combos — customers searching specific brands',
    keywords:['redken leeds','loreal professional leeds','wella leeds','schwarzkopf leeds','cantu uk','ors uk','mielle organics uk','dark and lovely uk','africas best uk','shea moisture uk','design essentials uk','olaplex leeds','keratin treatment leeds','professional colour leeds','schwarzkopf professional leeds','wella koleston leeds'] },
]

// Build 30-day blog planner from keywords
function buildPlanner() {
  const order = [
    ...KEYWORD_CLUSTERS.find(c=>c.cluster==='Question searches').keywords,
    ...KEYWORD_CLUSTERS.find(c=>c.cluster==='Local intent').keywords,
    ...KEYWORD_CLUSTERS.find(c=>c.cluster==='Product searches').keywords.slice(0,15),
  ]
  const today = new Date()
  return order.slice(0,30).map((kw, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const cluster = KEYWORD_CLUSTERS.find(c => c.keywords.includes(kw))
    return {
      day: i+1,
      date: d.toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short'}),
      keyword: kw,
      color: cluster?.color || C.accent,
      icon: cluster?.icon || '📝',
      cluster: cluster?.cluster || '',
    }
  })
}

function SectionTitle({children, sub}) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:4}}>
        {children}
      </div>
      {sub && <div style={{color:C.text2,fontSize:13}}>{sub}</div>}
    </div>
  )
}

function Divider() {
  return <div style={{height:1,background:C.border,margin:'36px 0'}}/>
}

export default function LocalSEOPage() {
  // Branch tasks state
  const [branchTasks, setBranchTasks] = useState({})
  const [expanded, setExpanded] = useState('chapeltown')

  // GBP Post Builder
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productOffset, setProductOffset] = useState(0)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [generatingPosts, setGeneratingPosts] = useState(false)
  const [gbpPosts, setGbpPosts] = useState(null)
  const [copiedPost, setCopiedPost] = useState(null)

  // Blog Generator
  const [selectedKw, setSelectedKw] = useState(null)
  const [customKw, setCustomKw] = useState('')
  const [generatingBlog, setGeneratingBlog] = useState(false)
  const [blog, setBlog] = useState(null)
  const [copiedBlog, setCopiedBlog] = useState(null)
  const [kwSearch, setKwSearch] = useState('')

  // Daily planner
  const [plannerDone, setPlannerDone] = useState({})
  const planner = buildPlanner()

  // Keywords
  const [kwCopied, setKwCopied] = useState(null)

  const BATCH = 4

  useEffect(() => {
    fetch('/api/shopify-products?type=products&limit=50')
      .then(r => r.json())
      .then(d => { setProducts(d.data || []); setProductsLoading(false) })
      .catch(() => setProductsLoading(false))
  }, [])

  function toggleTask(branchId, idx) {
    setBranchTasks(p => ({
      ...p,
      [branchId]: { ...(p[branchId]||{}), [idx]: !(p[branchId]||{})[idx] }
    }))
  }

  function toggleProduct(p) {
    setSelectedProducts(prev =>
      prev.find(x => x.id === p.id)
        ? prev.filter(x => x.id !== p.id)
        : prev.length < 4 ? [...prev, p] : prev
    )
  }

  async function generateGBPPosts() {
    if (!selectedProducts.length) return
    setGeneratingPosts(true)
    setGbpPosts(null)
    const productList = selectedProducts.map(p => p.title).join(', ')
    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: { title: productList, product_type: 'multiple products' },
          contentType: 'gbp',
        }),
      })
      const d = await res.json()
      // Generate 3 branch-specific posts
      const base = d.content || ''
      setGbpPosts({
        chapeltown: `📍 ${base} Visit us at 119-129 Chapeltown Road, Leeds LS7. #LeedsHair #Chapeltown`,
        roundhay:   `🛍️ ${base} Find us at 256-258 Roundhay Road, Leeds LS8. #LeedsHair #Roundhay`,
        citycentre: `✨ ${base} Pop into our City Centre store, New York Street Leeds LS2. #LeedsHair #CitycentreLeeds`,
        imagePrompt: `Professional product photo of ${productList} for a hair beauty shop blog post, clean white background, professional lighting`,
      })
    } catch(e) {
      setGbpPosts({ error: 'Failed — try again' })
    }
    setGeneratingPosts(false)
  }

  async function generateBlog(kw) {
    const keyword = kw || customKw
    if (!keyword.trim()) return
    setGeneratingBlog(true)
    setBlog(null)
    try {
      const res = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      })
      const d = await res.json()
      if (d.ok) {
        setBlog(d)
      } else {
        setBlog({ error: d.error || 'Failed — try again' })
      }
    } catch(e) {
      setBlog({ error: 'Failed — try again' })
    }
    setGeneratingBlog(false)
  }

  function copyText(key, text) {
    navigator.clipboard.writeText(text)
    setCopiedBlog(key)
    setTimeout(() => setCopiedBlog(null), 2000)
  }

  function copyPost(key, text) {
    navigator.clipboard.writeText(text)
    setCopiedPost(key)
    setTimeout(() => setCopiedPost(null), 2000)
  }

  function copyKw(kw) {
    navigator.clipboard.writeText(kw)
    setKwCopied(kw)
    setTimeout(() => setKwCopied(null), 1500)
  }

  const batch = products.slice(productOffset, productOffset + BATCH)
  const totalKw = KEYWORD_CLUSTERS.reduce((s, c) => s + c.keywords.length, 0)

  return (
    <>
      <Head>
        <title>Local SEO — CC Intelligence</title>
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
          <h1 style={{fontSize:24,fontWeight:800,color:C.text,marginBottom:6}}>📍 Local SEO — Team Guide</h1>
          <p style={{color:C.text2,fontSize:14,lineHeight:1.6}}>
            One page. Follow top to bottom each week. GBP posts → review replies → daily blogs → keywords.
          </p>
        </div>

        {/* ════════════════════════════════════════════════
            SECTION 1 — WEEKLY PROCESS FLOW
        ════════════════════════════════════════════════ */}
        <SectionTitle sub="Do these 5 steps every week in order">
          Step 1 — Weekly GBP process
        </SectionTitle>

        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:0,position:'relative',marginBottom:28}}>
          {[
            {step:'1',icon:'📍',title:'Check all 3 GBP listings',desc:'Open GBP. Check for new reviews, Q&A, correct info.',color:C.teal},
            {step:'2',icon:'⭐',title:'Reply to reviews',desc:'Reply within 48 hours. Open each branch GBP link below.',color:C.blue,urgent:true},
            {step:'3',icon:'📝',title:'Post weekly offer',desc:'Pick products below → AI writes 3 posts → paste to GBP.',color:C.accent},
            {step:'4',icon:'❓',title:'Answer Q&A',desc:'Check Q&A section on each GBP listing. Answer all new.',color:C.amber},
            {step:'5',icon:'📸',title:'Add new photos',desc:'Upload 2+ product photos to each branch per month.',color:C.green},
          ].map((s,i) => (
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',position:'relative'}}>
              {i<4 && <div style={{position:'absolute',top:28,left:'50%',width:'100%',height:2,background:C.border,zIndex:0}}/>}
              <div style={{position:'relative',zIndex:1,width:'100%',padding:'0 6px',textAlign:'center'}}>
                <div style={{width:56,height:56,borderRadius:'50%',background:s.color+'20',border:'2px solid '+s.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,margin:'0 auto 10px'}}>{s.icon}</div>
                <div style={{fontWeight:700,fontSize:12,color:s.color,marginBottom:3}}>Step {s.step}</div>
                <div style={{fontWeight:600,fontSize:12,color:C.text,marginBottom:4,lineHeight:1.3}}>{s.title}</div>
                <div style={{fontSize:11,color:C.text2,lineHeight:1.5}}>{s.desc}</div>
                {s.urgent && <span style={{background:C.red+'20',color:C.red,padding:'2px 7px',borderRadius:99,fontSize:10,fontWeight:700,display:'inline-block',marginTop:5}}>Within 48h</span>}
              </div>
            </div>
          ))}
        </div>

        {/* ── 3 BRANCH CARDS ── */}
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:8}}>
          {BRANCHES.map(branch => {
            const isOpen = expanded === branch.id
            const rc = branch.rating>=4?C.green:branch.rating>=3.7?C.amber:C.red
            const tasks = branchTasks[branch.id] || {}
            const reviewsNeeded = Math.max(0, Math.ceil((branch.target*(branch.reviews+30) - branch.rating*branch.reviews)/(5-branch.target)))
            return (
              <div key={branch.id} style={{border:'2px solid '+branch.color+'40',borderRadius:14,overflow:'hidden',background:C.surface}}>
                <div onClick={()=>setExpanded(isOpen?null:branch.id)} style={{padding:'14px 18px',cursor:'pointer',display:'flex',alignItems:'center',gap:14}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3,flexWrap:'wrap'}}>
                      <span style={{fontWeight:800,fontSize:16,color:C.text}}>{branch.name}</span>
                      <span style={{color:C.text3,fontSize:12}}>{branch.area}</span>
                      <span style={{background:branch.alertColor+'20',color:branch.alertColor,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700}}>{branch.status}</span>
                    </div>
                    <div style={{color:C.text3,fontSize:12}}>{branch.address}</div>
                  </div>
                  <div style={{textAlign:'center',flexShrink:0}}>
                    <div style={{fontSize:26,fontWeight:800,color:rc}}>{branch.rating}★</div>
                    <div style={{fontSize:11,color:C.text3}}>{branch.reviews} reviews</div>
                  </div>
                  <div style={{color:C.text3}}>{isOpen?'▲':'▼'}</div>
                </div>
                {isOpen && (
                  <div style={{borderTop:'1px solid '+C.border,padding:'16px 18px'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>📋 This week's tasks</div>
                        {branch.tasks.map((t,i) => {
                          const done = t.done || tasks[i]
                          return (
                            <div key={i} onClick={()=>toggleTask(branch.id,i)} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:8,cursor:'pointer'}}>
                              <div style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:1,background:done?C.green:'transparent',border:'2px solid '+(done?C.green:C.border),display:'flex',alignItems:'center',justifyContent:'center'}}>
                                {done&&<span style={{color:'#000',fontSize:11,fontWeight:700}}>✓</span>}
                              </div>
                              <span style={{fontSize:13,color:done?C.text3:C.text,textDecoration:done?'line-through':'none',lineHeight:1.4}}>{t.text}</span>
                            </div>
                          )
                        })}
                        <div style={{background:C.surface2,borderRadius:10,padding:12,marginTop:10}}>
                          <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:5}}>Target: {branch.target}★</div>
                          <div style={{height:7,background:C.surface,borderRadius:3,overflow:'hidden',marginBottom:5}}>
                            <div style={{width:(branch.rating/5*100)+'%',height:'100%',background:rc,borderRadius:3}}/>
                          </div>
                          <div style={{fontSize:11,color:C.text3,marginBottom:10}}>
                            {branch.rating>=branch.target?'✅ Target met!':'Need ~'+reviewsNeeded+' more 5★ reviews to reach '+branch.target+'★'}
                          </div>
                          <div style={{display:'flex',gap:8}}>
                            <a href={branch.reviewLink} target="_blank" rel="noreferrer" style={{flex:1,padding:'7px',borderRadius:7,border:'none',background:C.accent,color:'#fff',fontWeight:600,fontSize:12,textDecoration:'none',textAlign:'center'}}>⭐ Review link</a>
                            <a href={branch.gbpLink} target="_blank" rel="noreferrer" style={{flex:1,padding:'7px',borderRadius:7,border:'1px solid '+C.border,background:C.surface,color:C.text2,fontSize:12,textDecoration:'none',textAlign:'center'}}>Open GBP</a>
                          </div>
                        </div>
                      </div>
                      <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.2)',borderRadius:10,padding:14}}>
                        <div style={{fontWeight:700,color:C.amber,marginBottom:8,fontSize:13}}>⭐ How to reply to reviews</div>
                        <div style={{fontSize:13,color:C.text2,lineHeight:1.6,marginBottom:12}}>
                          Google only allows replies from GBP dashboard directly. Steps:
                        </div>
                        {['Click "Open GBP" button above','Go to Reviews in the left menu','Find unanswered reviews','Click Reply and paste your response','Use polite, professional language'].map((s,i)=>(
                          <div key={i} style={{display:'flex',gap:7,marginBottom:5,fontSize:12,color:C.text2}}>
                            <span style={{color:C.amber,flexShrink:0}}>{i+1}.</span>{s}
                          </div>
                        ))}
                        <a href={branch.reviewLink} target="_blank" rel="noreferrer" style={{display:'block',marginTop:12,padding:'8px',borderRadius:8,border:'none',background:C.amber,color:'#000',fontWeight:700,fontSize:12,textDecoration:'none',textAlign:'center'}}>
                          Open {branch.name} Reviews on Google →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <Divider/>

        {/* ════════════════════════════════════════════════
            SECTION 2 — GBP POST BUILDER
        ════════════════════════════════════════════════ */}
        <SectionTitle sub="Pick products from Shopify → AI writes 3 posts → copy & paste to Google Business Profile">
          Step 2 — Weekly GBP post builder
        </SectionTitle>

        <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:14,padding:20,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontWeight:600,color:C.text}}>Pick up to 4 products to feature this week</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setProductOffset(Math.max(0,productOffset-BATCH))} disabled={productOffset===0} style={{padding:'5px 12px',borderRadius:6,border:'1px solid '+C.border,background:productOffset>0?C.surface2:'transparent',color:productOffset>0?C.text:C.text3,cursor:productOffset>0?'pointer':'default',fontSize:12}}>← Prev</button>
              <span style={{fontSize:12,color:C.text3,padding:'5px 0'}}>{productOffset+1}–{Math.min(productOffset+BATCH,products.length)} of {products.length}</span>
              <button onClick={()=>setProductOffset(productOffset+BATCH)} disabled={productOffset+BATCH>=products.length} style={{padding:'5px 12px',borderRadius:6,border:'1px solid '+C.border,background:productOffset+BATCH<products.length?C.surface2:'transparent',color:productOffset+BATCH<products.length?C.text:C.text3,cursor:productOffset+BATCH<products.length?'pointer':'default',fontSize:12}}>Next →</button>
            </div>
          </div>

          {productsLoading ? (
            <div style={{textAlign:'center',padding:30,color:C.text3}}>Loading from Shopify...</div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
              {batch.map(p => {
                const isSel = !!selectedProducts.find(x=>x.id===p.id)
                return (
                  <div key={p.id} onClick={()=>toggleProduct(p)} style={{border:'2px solid '+(isSel?C.green:C.border),borderRadius:10,padding:10,cursor:'pointer',background:isSel?C.green+'10':C.surface2,position:'relative',transition:'all .12s'}}>
                    {isSel && <div style={{position:'absolute',top:7,right:7,background:C.green,color:'#000',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>✓</div>}
                    {p.images?.[0]?.src
                      ? <img src={p.images[0].src} alt="" style={{width:'100%',height:80,objectFit:'cover',borderRadius:6,marginBottom:7}}/>
                      : <div style={{width:'100%',height:80,background:C.surface,borderRadius:6,marginBottom:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>📦</div>
                    }
                    <div style={{fontSize:11,fontWeight:600,color:C.text,lineHeight:1.3,marginBottom:3}}>{p.title}</div>
                    <div style={{fontSize:10,color:C.text3}}>{p.product_type}</div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <button onClick={generateGBPPosts} disabled={!selectedProducts.length||generatingPosts} style={{padding:'9px 20px',borderRadius:9,border:'none',background:selectedProducts.length&&!generatingPosts?C.accent:C.surface2,color:selectedProducts.length&&!generatingPosts?'#fff':C.text3,fontWeight:700,fontSize:14,cursor:'pointer'}}>
              {generatingPosts?'⟳ Writing posts...':'✨ Generate 3 GBP Posts'}
            </button>
            {selectedProducts.length>0 && (
              <span style={{color:C.text2,fontSize:13}}>
                Selected: <strong style={{color:C.green}}>{selectedProducts.map(p=>p.title).join(', ')}</strong>
                <button onClick={()=>setSelectedProducts([])} style={{marginLeft:8,padding:'2px 8px',borderRadius:4,border:'1px solid '+C.border,background:C.surface2,color:C.text3,cursor:'pointer',fontSize:11}}>Clear</button>
              </span>
            )}
          </div>
        </div>

        {gbpPosts && !gbpPosts.error && (
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:8}}>
            {BRANCHES.map(branch => {
              const txt = gbpPosts[branch.id]
              if (!txt) return null
              const rc = branch.rating>=4?C.green:branch.rating>=3.7?C.amber:C.red
              return (
                <div key={branch.id} style={{background:C.surface,border:'1px solid '+branch.color+'40',borderRadius:12,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:branch.color}}/>
                      <span style={{fontWeight:700,color:C.text}}>{branch.name}</span>
                      <span style={{color:C.text3,fontSize:12}}>{branch.address}</span>
                      <span style={{color:rc,fontWeight:700,fontSize:13}}>{branch.rating}★</span>
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>copyPost(branch.id,txt)} style={{padding:'5px 12px',borderRadius:6,border:'none',background:copiedPost===branch.id?C.green:C.accent,color:copiedPost===branch.id?'#000':'#fff',fontWeight:600,fontSize:11,cursor:'pointer'}}>
                        {copiedPost===branch.id?'✓ Copied!':'📋 Copy'}
                      </button>
                      <a href={branch.gbpLink} target="_blank" rel="noreferrer" style={{padding:'5px 12px',borderRadius:6,border:'1px solid '+C.border,background:C.surface2,color:C.accent2,fontSize:11,textDecoration:'none'}}>Post to GBP →</a>
                    </div>
                  </div>
                  <div style={{background:C.surface2,borderRadius:8,padding:12,fontSize:13,color:C.text,lineHeight:1.6}}>{txt}</div>
                </div>
              )
            })}
            {gbpPosts.imagePrompt && (
              <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.2)',borderRadius:10,padding:14}}>
                <div style={{fontWeight:700,color:C.amber,marginBottom:6,fontSize:13}}>🖼️ AI image prompt — paste into ChatGPT or Canva</div>
                <div style={{background:C.surface2,borderRadius:7,padding:10,fontSize:12,color:C.text2,marginBottom:10}}>{gbpPosts.imagePrompt}</div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>copyPost('img',gbpPosts.imagePrompt)} style={{padding:'5px 12px',borderRadius:6,border:'none',background:copiedPost==='img'?C.green:C.amber,color:'#000',fontWeight:600,fontSize:11,cursor:'pointer'}}>
                    {copiedPost==='img'?'✓ Copied!':'📋 Copy prompt'}
                  </button>
                  <a href="https://chat.openai.com" target="_blank" rel="noreferrer" style={{padding:'5px 12px',borderRadius:6,border:'1px solid '+C.border,background:C.surface2,color:C.text2,fontSize:11,textDecoration:'none'}}>ChatGPT →</a>
                  <a href="https://www.canva.com/ai-image-generator/" target="_blank" rel="noreferrer" style={{padding:'5px 12px',borderRadius:6,border:'1px solid '+C.border,background:C.surface2,color:C.text2,fontSize:11,textDecoration:'none'}}>Canva AI →</a>
                </div>
              </div>
            )}
          </div>
        )}
        {gbpPosts?.error && <div style={{background:'rgba(239,68,68,.08)',border:'1px solid '+C.red+'30',borderRadius:8,padding:12,color:C.red,marginBottom:8}}>{gbpPosts.error}</div>}

        <Divider/>

        {/* ════════════════════════════════════════════════
            SECTION 3 — DAILY BLOG PLANNER
        ════════════════════════════════════════════════ */}
        <SectionTitle sub="30 days of daily blogs — tick off each one as you publish it. Consistency = Google ranking.">
          Step 3 — 30-day daily blog planner
        </SectionTitle>

        <div style={{background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.2)',borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:C.green}}>
          📈 Daily blogging = faster Google rankings. Each post targets one keyword. Use the Blog Generator below to write each one in 30 seconds.
          <strong style={{marginLeft:6}}>{Object.values(plannerDone).filter(Boolean).length} of 30 published</strong>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:8}}>
          {planner.map(day => {
            const done = plannerDone[day.day]
            return (
              <div key={day.day} onClick={()=>setPlannerDone(p=>({...p,[day.day]:!p[day.day]}))} style={{
                border:'1px solid '+(done?day.color:C.border),
                borderRadius:10, padding:10, cursor:'pointer',
                background: done ? day.color+'15' : C.surface,
                transition:'all .12s',
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                  <span style={{fontSize:11,fontWeight:700,color:done?day.color:C.text3}}>Day {day.day}</span>
                  <div style={{width:16,height:16,borderRadius:'50%',background:done?day.color:'transparent',border:'2px solid '+(done?day.color:C.border),display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {done&&<span style={{color:'#000',fontSize:9,fontWeight:700}}>✓</span>}
                  </div>
                </div>
                <div style={{fontSize:10,color:C.text3,marginBottom:4}}>{day.date}</div>
                <div style={{fontSize:11,color:done?day.color:C.text2,lineHeight:1.4,fontWeight:done?600:400}}>{day.keyword}</div>
                <div style={{fontSize:10,color:day.color,marginTop:4}}>{day.icon} {day.cluster}</div>
                <button
                  onClick={e=>{e.stopPropagation();setSelectedKw(day.keyword);window.scrollTo({top:document.getElementById('blog-gen')?.offsetTop-80,behavior:'smooth'})}}
                  style={{marginTop:6,width:'100%',padding:'3px',borderRadius:5,border:'none',background:done?day.color+'30':C.surface2,color:done?day.color:C.text3,fontSize:10,cursor:'pointer'}}
                >
                  {done?'✓ Published':'Generate →'}
                </button>
              </div>
            )
          })}
        </div>

        <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:10,padding:14,marginBottom:4}}>
          <div style={{fontWeight:600,color:C.text,marginBottom:8,fontSize:13}}>📅 Monthly publishing schedule</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,fontSize:12,color:C.text2}}>
            {[
              {week:'Week 1',type:'Question searches',color:C.green,tip:'Where to buy X in Leeds — ranks fastest'},
              {week:'Week 2',type:'Local intent keywords',color:C.teal,tip:'Hair shop Leeds, braiding hair Leeds etc'},
              {week:'Week 3',type:'Product guides',color:C.amber,tip:'ORS relaxer, Mielle rosemary oil etc'},
              {week:'Week 4',type:'Brand spotlights',color:C.red,tip:'Cantu UK, Redken Leeds, Wella Leeds etc'},
            ].map(w => (
              <div key={w.week} style={{background:C.surface2,borderRadius:8,padding:10}}>
                <div style={{fontWeight:700,color:w.color,marginBottom:4}}>{w.week}</div>
                <div style={{fontWeight:600,color:C.text,marginBottom:3,fontSize:12}}>{w.type}</div>
                <div style={{color:C.text3,fontSize:11}}>{w.tip}</div>
              </div>
            ))}
          </div>
        </div>

        <Divider/>

        {/* ════════════════════════════════════════════════
            SECTION 4 — BLOG GENERATOR
        ════════════════════════════════════════════════ */}
        <div id="blog-gen">
          <SectionTitle sub="Click a keyword → generate a full SEO blog post in 30 seconds → copy into Shopify">
            Step 4 — Blog generator
          </SectionTitle>
        </div>

        <div style={{background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.2)',borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:C.green}}>
          After generating: paste into Shopify → <strong>Online Store → Blog Posts → Add blog post</strong>. Blog name = <strong>Local News</strong>. URL = <strong>cchairandbeauty.com/blogs/local-news/[slug]</strong>
        </div>

        {/* Keyword picker */}
        <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:14,padding:20,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:10}}>
            <div style={{fontWeight:600,color:C.text}}>Pick a keyword to blog about:</div>
            <input value={kwSearch} onChange={e=>setKwSearch(e.target.value)} placeholder="Search keywords..." style={{background:C.surface2,border:'1px solid '+C.border,borderRadius:7,color:C.text,fontSize:13,padding:'7px 12px',outline:'none',width:180}}/>
          </div>

          {KEYWORD_CLUSTERS.map(cluster => {
            const kws = kwSearch ? cluster.keywords.filter(k=>k.toLowerCase().includes(kwSearch.toLowerCase())) : cluster.keywords
            if (!kws.length) return null
            return (
              <div key={cluster.cluster} style={{marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:7}}>
                  <span style={{fontSize:15}}>{cluster.icon}</span>
                  <span style={{fontWeight:700,color:cluster.color,fontSize:13}}>{cluster.cluster}</span>
                  <span style={{color:C.text3,fontSize:11}}>({kws.length})</span>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {kws.map(kw => {
                    const isSel = selectedKw === kw
                    return (
                      <button key={kw} onClick={()=>setSelectedKw(isSel?null:kw)} style={{
                        padding:'5px 11px', borderRadius:7,
                        border: isSel ? 'none' : '1px solid '+cluster.color+'40',
                        background: isSel ? cluster.color : cluster.color+'12',
                        color: isSel ? '#000' : cluster.color,
                        fontSize:12, cursor:'pointer', fontWeight: isSel?700:400,
                      }}>
                        {isSel?'✓ ':''}{kw}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div style={{borderTop:'1px solid '+C.border,paddingTop:14,marginTop:4,display:'flex',gap:8,alignItems:'center'}}>
            <input value={customKw} onChange={e=>{setCustomKw(e.target.value);setSelectedKw(null)}} placeholder="Or type your own keyword..." style={{flex:1,background:C.surface2,border:'1px solid '+C.border,borderRadius:7,color:C.text,fontSize:13,padding:'8px 12px',outline:'none'}}/>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          <button
            onClick={()=>generateBlog(selectedKw||customKw)}
            disabled={(!selectedKw&&!customKw.trim())||generatingBlog}
            style={{padding:'11px 28px',borderRadius:10,border:'none',background:generatingBlog||(!selectedKw&&!customKw.trim())?C.surface2:C.green,color:generatingBlog||(!selectedKw&&!customKw.trim())?C.text3:'#000',fontWeight:700,fontSize:15,cursor:'pointer'}}
          >
            {generatingBlog?'⟳ Writing blog post...':'✨ Generate Blog Post'}
          </button>
          {(selectedKw||customKw) && <span style={{color:C.text2,fontSize:13}}>Keyword: <strong style={{color:C.green}}>{selectedKw||customKw}</strong></span>}
        </div>

        {/* Blog output */}
        {blog && !blog.error && (
          <div style={{background:C.surface,border:'1px solid '+C.green+'40',borderRadius:14,overflow:'hidden',marginBottom:16}}>
            <div style={{background:'rgba(34,197,94,.08)',padding:'12px 18px',borderBottom:'1px solid '+C.border,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:12,fontWeight:700,color:C.green}}>✨ Blog post ready — paste each field into Shopify</span>
              <a href="https://cchairandbeauty.myshopify.com/admin/articles/new" target="_blank" rel="noreferrer" style={{padding:'5px 14px',borderRadius:7,border:'none',background:C.green,color:'#000',fontWeight:700,fontSize:12,textDecoration:'none'}}>
                Open Shopify Blog →
              </a>
            </div>
            <div style={{padding:18,display:'flex',flexDirection:'column',gap:10}}>
              {[
                {label:'📄 SEO Page Title',    key:'seoTitle',        hint:'Shopify → SEO section → Page title'},
                {label:'🔗 URL Slug',          key:'urlSlug',         hint:'Shopify → URL and handle field', prefix:'cchairandbeauty.com/blogs/local-news/'},
                {label:'📝 Meta Description', key:'metaDescription',  hint:'Shopify → SEO section → Meta description'},
                {label:'🏷️ H1 Heading',       key:'h1',              hint:'Use as the blog post Title in Shopify'},
                {label:'🖼️ Image Alt Text',   key:'imageAlt',        hint:'Add to your featured image alt text'},
              ].map(f => (
                <div key={f.key} style={{background:C.surface2,borderRadius:9,padding:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
                    <div>
                      <span style={{fontWeight:700,color:C.text,fontSize:13}}>{f.label}</span>
                      <span style={{color:C.text3,fontSize:11,marginLeft:8}}>{f.hint}</span>
                    </div>
                    <button onClick={()=>copyText(f.key, f.prefix?(f.prefix+blog[f.key]):blog[f.key])} style={{padding:'3px 10px',borderRadius:5,border:'none',background:copiedBlog===f.key?C.green:C.accent,color:copiedBlog===f.key?'#000':'#fff',fontWeight:600,fontSize:11,cursor:'pointer',flexShrink:0,marginLeft:10}}>
                      {copiedBlog===f.key?'✓':'📋 Copy'}
                    </button>
                  </div>
                  <div style={{color:C.accent2,fontSize:12,fontFamily:'monospace',background:C.surface,padding:'6px 10px',borderRadius:6,lineHeight:1.5}}>
                    {f.prefix ? f.prefix+blog[f.key] : blog[f.key]}
                  </div>
                </div>
              ))}

              <div style={{background:C.surface2,borderRadius:9,padding:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <div>
                    <span style={{fontWeight:700,color:C.text,fontSize:13}}>📖 Blog Content (HTML)</span>
                    <span style={{color:C.text3,fontSize:11,marginLeft:8}}>Switch to HTML mode in Shopify editor</span>
                  </div>
                  <button onClick={()=>copyText('html',blog.blogContent)} style={{padding:'3px 10px',borderRadius:5,border:'none',background:copiedBlog==='html'?C.green:C.accent,color:copiedBlog==='html'?'#000':'#fff',fontWeight:600,fontSize:11,cursor:'pointer'}}>
                    {copiedBlog==='html'?'✓ Copied!':'📋 Copy HTML'}
                  </button>
                </div>
                <div style={{background:C.surface,borderRadius:6,padding:12,fontSize:12,color:C.text2,lineHeight:1.7,maxHeight:250,overflowY:'auto'}} dangerouslySetInnerHTML={{__html:blog.blogContent}}/>
              </div>

              <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.2)',borderRadius:9,padding:12}}>
                <div style={{fontWeight:700,color:C.amber,marginBottom:8,fontSize:13}}>🖼️ Where to get the blog image</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {[
                    {title:'Shopify product image',desc:'Download from your own Shopify product pages — best option, you own it.'},
                    {title:'Free stock (Pexels)',desc:'Go to pexels.com, search your keyword, download free. No credit needed.'},
                    {title:'AI generated',desc:'Paste the keyword into ChatGPT → DALL-E or Canva AI text-to-image.'},
                  ].map(o=>(
                    <div key={o.title} style={{background:C.surface2,borderRadius:7,padding:9}}>
                      <div style={{fontWeight:600,color:C.amber,fontSize:11,marginBottom:3}}>{o.title}</div>
                      <div style={{color:C.text2,fontSize:11,lineHeight:1.4}}>{o.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {blog?.error && (
          <div style={{background:'rgba(239,68,68,.08)',border:'1px solid '+C.red+'30',borderRadius:9,padding:12,color:C.red,marginBottom:16}}>{blog.error}</div>
        )}

        <Divider/>

        {/* ════════════════════════════════════════════════
            SECTION 5 — KEYWORDS
        ════════════════════════════════════════════════ */}
        <SectionTitle sub={`${totalKw} total keywords — click any to copy. Use Question searches as blog titles.`}>
          Step 5 — Local keyword bank
        </SectionTitle>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14,marginBottom:8}}>
          {KEYWORD_CLUSTERS.map(cluster => (
            <div key={cluster.cluster} style={{background:C.surface,border:'1px solid '+cluster.color+'30',borderRadius:12,overflow:'hidden'}}>
              <div style={{padding:'11px 14px',background:cluster.color+'12',borderBottom:'1px solid '+cluster.color+'20'}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                  <span style={{fontSize:16}}>{cluster.icon}</span>
                  <span style={{fontWeight:700,color:cluster.color,fontSize:13}}>{cluster.cluster}</span>
                  <span style={{background:cluster.color+'20',color:cluster.color,padding:'1px 7px',borderRadius:99,fontSize:11,fontWeight:600,marginLeft:'auto'}}>{cluster.keywords.length}</span>
                </div>
                <div style={{fontSize:11,color:C.text2}}>{cluster.desc}</div>
              </div>
              <div style={{padding:11,display:'flex',flexWrap:'wrap',gap:5}}>
                {cluster.keywords.map(kw => (
                  <button key={kw} onClick={()=>copyKw(kw)} style={{
                    padding:'4px 9px',borderRadius:6,border:'1px solid '+cluster.color+'30',
                    background:kwCopied===kw?cluster.color:cluster.color+'10',
                    color:kwCopied===kw?'#000':cluster.color,
                    fontSize:11,cursor:'pointer',fontWeight:500,transition:'all .1s',
                  }}>
                    {kwCopied===kw?'✓':kw}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:12,padding:16,marginBottom:8}}>
          <div style={{fontWeight:700,color:C.accent2,marginBottom:10,fontSize:13}}>📝 How to use keywords for daily blogs</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
            {[
              {n:'1',t:'Pick a Question keyword',d:'e.g. "where to buy braiding hair in leeds"'},
              {n:'2',t:'Click Generate Blog above',d:'30 seconds — full blog written automatically'},
              {n:'3',t:'Copy into Shopify',d:'Blog Posts → Add blog post → paste each field'},
              {n:'4',t:'Tick off in the planner',d:'Mark Day 1 done and move to the next keyword'},
            ].map(s=>(
              <div key={s.n} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                <div style={{width:22,height:22,borderRadius:'50%',background:C.accent,color:'#fff',fontSize:11,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{s.n}</div>
                <div>
                  <div style={{fontWeight:600,color:C.text,fontSize:12,marginBottom:2}}>{s.t}</div>
                  <div style={{color:C.text3,fontSize:11}}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider/>

        {/* ── MONTHLY ROUTINE ── */}
        <SectionTitle>Monthly routine — all 3 pillars</SectionTitle>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[
            {label:'Every week',color:C.teal,items:['Post GBP offer — all 3 branches','Reply to all new reviews within 48h','Publish 1 daily blog (use generator above)','Check Q&A sections on GBP','Share offer on WhatsApp status']},
            {label:'Every month',color:C.accent,items:['Publish 30 blog posts (use daily planner)','Upload new product photos to GBP','Check keyword rankings in Search Console','Review negative keywords in Google Ads','Review discount code performance']},
            {label:'Every quarter',color:C.amber,items:['Full SEO audit — top 10 collection pages','Check competitor GBP listings and ratings','Update opening hours on GBP if changed','Review which blogs drove the most traffic','Plan next 30-day blog keyword list']},
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
