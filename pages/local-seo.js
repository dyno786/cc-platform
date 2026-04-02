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
    rating:4.0, reviews:66, target:4.2, color:'#22c55e', alertColor:'#f59e0b',
    status:'⚠️ Post due today',
    // Real Google URLs from Mohammed
    reviewLink:'https://www.google.com/search?q=cc+hair+and+beauty+chapeltown&sca_esv=69b89b82830faa31&sxsrf=ANbL-n46WJg9e1zcfKpKEL6iDccIYyPESA%3A1775123402749&ei=yjvOabydLZmDhbIPjtub-Ac&biw=1728&bih=958&oq=cc+hair+and+beauty+c&gs_lp=Egxnd3Mtd2l6LXNlcnAiFGNjIGhhaXIgYW5kIGJlYXV0eSBjKgIIADIKECMYgAQYJxiKBTIEECMYJzIEECMYJzIGEAAYFhgeMgYQABgWGB4yBhAAGBYYHjIIEAAYFhgKGB4yBhAAGBYYHjIGEAAYFhgeMgYQABgWGB5IihBQ-wFY-wFwAXgBkAEAmAGCAaABggGqAQMwLjG4AQHIAQD4AQGYAgKgAo0BwgIHECMYsAMYJ8ICChAAGLADGNYEGEeYAwCIBgGQBgmSBwMxLjGgB6kLsgcDMC4xuAeKAcIHBTAuMS4xyAcHgAgA&sclient=gws-wiz-serp',
    postLink:'https://business.google.com/posts/create',
    gbpLink:'https://business.google.com',
    tasks:[
      {done:false, text:'Post weekly GBP offer — use product post builder below'},
      {done:false, text:'Reply to any new reviews — copy AI reply to Google'},
      {done:false, text:'Answer any unanswered Q&A questions'},
      {done:true,  text:'QR review badge displayed in store'},
    ],
  },
  {
    id:'roundhay', name:'Roundhay', area:'LS8',
    address:'256-258 Roundhay Road, Leeds LS8 5RL',
    rating:3.8, reviews:119, target:4.2, color:'#f59e0b', alertColor:'#ef4444',
    status:'🔴 Post overdue',
    reviewLink:'https://www.google.com/search?gs_ssp=eJwVxkEOQDAQAMC48om9ONvVCvUEv9jttuVCiEr9Xsxp6qZLHd3xSWcxWM0tFjuNbpDJIalHsTJjcagy9qEnIiPexgW8h5W3C3hXkMD5fuE68q4r_2H9AEBjGsI&q=cc+hair+and+beauty+roundhay+road&oq=cchair+aND+BEAUTY+round&gs_lcrp=EgZjaHJvbWUqDwgBEC4YDRivARjHARiABDIGCAAQRRg5Mg8IARAuGA0YrwEYxwEYgAQyCAgCEAAYFhgeMggIAxAAGBYYHjIICAQQABgWGB4yBggFEEUYPDIGCAYQRRg8MgYIBxBFGD3SAQg4NDc0ajBqNKgCA7ACAfEF8b8iTYjuLQQ&sourceid=chrome&ie=UTF-8#mpd=~16035079984380978849/customers/reviews',
    postLink:'https://business.google.com/posts/create',
    gbpLink:'https://business.google.com',
    tasks:[
      {done:false, text:'Post weekly GBP offer — OVERDUE'},
      {done:false, text:'Reply to negative review — copy AI reply to Google'},
      {done:false, text:'Upload 3 new product photos to GBP'},
      {done:true,  text:'QR review badge displayed in store'},
    ],
  },
  {
    id:'citycentre', name:'City Centre', area:'New York St',
    address:'1-19 New York Street, Leeds LS2 6BY',
    rating:3.3, reviews:35, target:4.2, color:'#ef4444', alertColor:'#ef4444',
    status:'🔴 Low rating — urgent',
    // Using the exact URL format Mohammed provided
    reviewLink:'https://www.google.com/search?q=CC+Hair+And+Beauty+-+City+Centre&stick=H4sIAAAAAAAA_-NgU1I1qDCxMLc0TTa0tDRKTjQ2S7S0MqgwTjQ0Nk8yNzNPMjZNsjA3XMSq4Oys4JGYWaTgmJei4JSaWFpSqaCr4JwJpJxT80qKUgEOkP78TAAAAA&hl=en&mat=Cd64hHkqvRApElcBTVDHnrOhGuUeBg2O6hxkh0-6mbYmSjenQqp5QY7sd28FxsVBtJB_e4bYNd1JpQtWp-lkXd0LTc_kP29Rz9Q6yBB7L4Jlx8MPaWVz9hJ02G8BefDv3oI&authuser=0',
    postLink:'https://business.google.com/posts/create',
    gbpLink:'https://business.google.com',
    tasks:[
      {done:false, text:'Post weekly GBP offer today'},
      {done:false, text:'Reply to negative reviews — copy AI reply to Google'},
      {done:false, text:'Ask every customer for a review this week'},
      {done:false, text:'Answer unanswered Q&A questions'},
    ],
  },
]

const KEYWORD_CLUSTERS = [
  { cluster:'Brand searches', color:'#6366f1', icon:'🏷️', desc:'People searching directly for CC Hair & Beauty',
    keywords:['cc hair beauty','cc hair and beauty','cc hair beauty leeds','cc hair beauty chapeltown','cc hair beauty roundhay','cc hair beauty city centre','cc hair near me','continentals hair beauty','continental hair shop leeds','cc hair beauty opening times','cc hair beauty online'] },
  { cluster:'Local intent', color:'#14b8a6', icon:'📍', desc:'People looking for hair shops in Leeds — high priority for blogs',
    keywords:['hair shop leeds','hair shops in leeds','afro hair shop leeds','black hair shop leeds','natural hair shop leeds','hair beauty shop leeds','hair shop near me leeds','hair shop chapeltown','hair shop roundhay','hair shop city centre leeds','hair supply store leeds','professional hair shop leeds','hair products store leeds','where to buy hair products leeds','hair beauty supply leeds'] },
  { cluster:'Product searches', color:'#f59e0b', icon:'🛍️', desc:'Specific products — use these as blog topics and product page keywords',
    keywords:['braiding hair leeds','buy braiding hair leeds','kanekalon braiding hair leeds','wigs leeds','human hair wigs leeds','lace front wigs leeds','synthetic wigs leeds','hair extensions leeds','clip in hair extensions leeds','weave extensions leeds','relaxers leeds','hair relaxer leeds','ors relaxer leeds','dark and lovely relaxer leeds','hair dye leeds','hair colour leeds','professional hair dye leeds','edge control leeds','natural hair products leeds','cantu products leeds','mielle products leeds','ors products leeds','shea butter hair products leeds','hair growth products leeds','moisture products natural hair leeds'] },
  { cluster:'Question searches', color:'#22c55e', icon:'❓', desc:'Use these as blog post titles — answer these to rank on Google',
    keywords:['where to buy braiding hair in leeds','where to buy wigs in leeds','best hair shop in leeds','what time does cc hair beauty open','where to buy ors relaxer in leeds','where can i buy cantu in leeds','best natural hair products uk','how to care for afro hair uk','where to buy hair extensions leeds','best wigs for beginners uk','where to buy edge control uk','best relaxer for natural hair uk','how to grow afro hair uk','best hair growth oil uk','where to buy mielle rosemary oil uk','kanekalon hair uk where to buy'] },
  { cluster:'Specialist brands', color:'#ef4444', icon:'⭐', desc:'Brand + location combos — customers searching specific brands in Leeds',
    keywords:['redken leeds','loreal professional leeds','wella leeds','schwarzkopf leeds','cantu uk','ors uk','mielle organics uk','dark and lovely uk','africas best uk','shea moisture uk','design essentials uk','olaplex leeds','keratin treatment leeds','professional colour leeds','schwarzkopf professional leeds','wella koleston leeds'] },
]

// ── BLOG GENERATOR ──────────────────────────────────────────────────
function BlogGenerator() {
  const [kSearch, setKSearch] = useState('')
  const [selectedKw, setSelectedKw] = useState(null)
  const [customKw, setCustomKw] = useState('')
  const [generating, setGenerating] = useState(false)
  const [blog, setBlog] = useState(null)
  const [copying, setCopying] = useState(null)
  const [copiedKw, setCopiedKw] = useState(null)

  const allKeywords = KEYWORD_CLUSTERS.flatMap(c => c.keywords.map(k => ({kw:k, color:c.color, cluster:c.cluster})))
  const filtered = kSearch ? allKeywords.filter(k => k.kw.toLowerCase().includes(kSearch.toLowerCase())) : allKeywords

  async function generateBlog(kw) {
    setGenerating(true)
    setBlog(null)
    const keyword = kw || customKw
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json','anthropic-version':'2023-06-01'},
        body: JSON.stringify({
          model:'claude-haiku-4-5-20251001',
          max_tokens:1500,
          messages:[{ role:'user', content:`Write a LOCAL SEO blog post for CC Hair & Beauty Leeds.

Target keyword: "${keyword}"

Return ONLY a JSON object with these exact fields:
{
  "seoTitle": "SEO page title (include keyword, under 60 chars)",
  "urlSlug": "seo-friendly-url-slug (lowercase, hyphens only)",
  "metaDescription": "Meta description for Google (include keyword, 140-155 chars, call to action)",
  "h1": "H1 heading (engaging, includes keyword)",
  "imageAlt": "Alt text for the hero image (descriptive, includes keyword)",
  "blogContent": "Full blog post HTML with <h2>, <p> tags. 450-500 words. Include: intro mentioning CC Hair & Beauty Leeds, 3-4 sections with tips/info, product recommendations from CC Hair & Beauty, mention all 3 branches (Chapeltown LS7, Roundhay LS8, City Centre), call to action to visit cchairandbeauty.com or stores. Make it genuinely helpful and locally relevant."
}

No markdown, no backticks, pure JSON only.` }]
        })
      })
      const d = await res.json()
      const text = d.content?.[0]?.text || '{}'
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setBlog({ ...parsed, keyword })
    } catch(e) {
      setBlog({ error: 'Failed to generate — try again', keyword })
    }
    setGenerating(false)
  }

  function copyField(key, text) {
    navigator.clipboard.writeText(text)
    setCopying(key)
    setTimeout(() => setCopying(null), 2000)
  }

  function copyKw(kw) {
    navigator.clipboard.writeText(kw)
    setCopiedKw(kw)
    setTimeout(() => setCopiedKw(null), 1500)
  }

  return (
    <div>
      {/* Keyword bank */}
      <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:14,padding:20,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:10}}>
          <div>
            <div style={{fontWeight:700,color:C.text,fontSize:15,marginBottom:3}}>Step 1 — Pick a keyword</div>
            <div style={{color:C.text2,fontSize:13}}>Click any keyword to select it, then click Generate Blog below. Use <span style={{color:C.green,fontWeight:600}}>Question searches</span> for best results.</div>
          </div>
          <input value={kSearch} onChange={e=>setKSearch(e.target.value)} placeholder="Search keywords..." style={{background:C.surface2,border:'1px solid '+C.border,borderRadius:8,color:C.text,fontSize:13,padding:'8px 14px',outline:'none',width:200}}/>
        </div>

        {KEYWORD_CLUSTERS.map(cluster => {
          const clusterKws = kSearch ? cluster.keywords.filter(k=>k.toLowerCase().includes(kSearch.toLowerCase())) : cluster.keywords
          if (clusterKws.length === 0) return null
          return (
            <div key={cluster.cluster} style={{marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:7}}>
                <span>{cluster.icon}</span>
                <span style={{fontWeight:700,color:cluster.color,fontSize:13}}>{cluster.cluster}</span>
                <span style={{color:C.text3,fontSize:11}}>({clusterKws.length})</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {clusterKws.map(kw => {
                  const isSelected = selectedKw === kw
                  return (
                    <button key={kw} onClick={() => setSelectedKw(isSelected ? null : kw)} style={{
                      padding:'5px 11px', borderRadius:7, border: isSelected ? 'none' : '1px solid '+cluster.color+'40',
                      background: isSelected ? cluster.color : cluster.color+'12',
                      color: isSelected ? '#000' : cluster.color,
                      fontSize:12, cursor:'pointer', fontWeight: isSelected ? 700 : 500, transition:'all .1s',
                    }}>
                      {isSelected ? '✓ ' : ''}{kw}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Custom keyword */}
        <div style={{borderTop:'1px solid '+C.border,paddingTop:14,marginTop:6}}>
          <div style={{fontWeight:600,color:C.text2,fontSize:13,marginBottom:8}}>Or type your own keyword:</div>
          <div style={{display:'flex',gap:8}}>
            <input value={customKw} onChange={e=>{setCustomKw(e.target.value);setSelectedKw(null)}} placeholder="e.g. best wig shop in leeds" style={{flex:1,background:C.surface2,border:'1px solid '+C.border,borderRadius:8,color:C.text,fontSize:13,padding:'8px 12px',outline:'none'}}/>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <button
          onClick={() => generateBlog(selectedKw || customKw)}
          disabled={(!selectedKw && !customKw.trim()) || generating}
          style={{padding:'11px 28px',borderRadius:10,border:'none',background:generating||(!selectedKw&&!customKw.trim())?C.surface2:C.accent,color:generating||(!selectedKw&&!customKw.trim())?C.text3:'#fff',fontWeight:700,fontSize:15,cursor:'pointer'}}
        >
          {generating ? '⟳ Writing blog...' : '✨ Generate Blog Post'}
        </button>
        {selectedKw && <span style={{color:C.text2,fontSize:13}}>Keyword: <strong style={{color:C.accent2}}>{selectedKw}</strong></span>}
        {customKw && !selectedKw && <span style={{color:C.text2,fontSize:13}}>Keyword: <strong style={{color:C.accent2}}>{customKw}</strong></span>}
      </div>

      {/* Blog output */}
      {blog && !blog.error && (
        <div style={{background:C.surface,border:'1px solid '+C.accent+'40',borderRadius:14,overflow:'hidden'}}>
          <div style={{background:'rgba(99,102,241,.08)',padding:'14px 20px',borderBottom:'1px solid '+C.border,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <span style={{fontSize:11,fontWeight:700,color:C.accent2,textTransform:'uppercase',letterSpacing:'.06em'}}>✨ Blog post ready — </span>
              <span style={{color:C.text2,fontSize:12}}>paste each field into Shopify blog editor</span>
            </div>
            <a href="https://cchairandbeauty.myshopify.com/admin/articles/new" target="_blank" rel="noreferrer" style={{padding:'6px 14px',borderRadius:7,border:'none',background:C.green,color:'#000',fontWeight:700,fontSize:12,textDecoration:'none'}}>
              Open Shopify Blog →
            </a>
          </div>

          <div style={{padding:20,display:'flex',flexDirection:'column',gap:12}}>
            {/* SEO fields */}
            {[
              {label:'📄 SEO Page Title', key:'seoTitle', value:blog.seoTitle, hint:'Paste into Shopify "Page title" field (SEO section)'},
              {label:'🔗 URL Slug', key:'urlSlug', value:'cchairandbeauty.com/blogs/local-news/'+blog.urlSlug, hint:'Paste into Shopify "URL and handle" field'},
              {label:'📝 Meta Description', key:'metaDescription', value:blog.metaDescription, hint:'Paste into Shopify "Meta description" field'},
              {label:'🏷️ H1 Heading', key:'h1', value:blog.h1, hint:'Use as the blog post title in Shopify'},
              {label:'🖼️ Image Alt Text', key:'imageAlt', value:blog.imageAlt, hint:'Add to the featured image alt text field'},
            ].map(f => (
              <div key={f.key} style={{background:C.surface2,borderRadius:10,padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div>
                    <div style={{fontWeight:700,color:C.text,fontSize:13}}>{f.label}</div>
                    <div style={{color:C.text3,fontSize:11,marginTop:2}}>{f.hint}</div>
                  </div>
                  <button onClick={() => copyField(f.key, f.value)} style={{padding:'4px 12px',borderRadius:6,border:'none',background:copying===f.key?C.green:C.accent,color:copying===f.key?'#000':'#fff',fontWeight:600,fontSize:11,cursor:'pointer',flexShrink:0,marginLeft:10,fontFamily:'inherit'}}>
                    {copying===f.key?'✓ Copied!':'📋 Copy'}
                  </button>
                </div>
                <div style={{color:C.accent2,fontSize:13,lineHeight:1.5,fontFamily:'monospace',background:C.surface,padding:'8px 10px',borderRadius:7}}>{f.value}</div>
              </div>
            ))}

            {/* Blog content */}
            <div style={{background:C.surface2,borderRadius:10,padding:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div>
                  <div style={{fontWeight:700,color:C.text,fontSize:13}}>📖 Blog Content (HTML)</div>
                  <div style={{color:C.text3,fontSize:11,marginTop:2}}>Paste into Shopify blog editor (switch to HTML mode)</div>
                </div>
                <button onClick={() => copyField('blogContent', blog.blogContent)} style={{padding:'4px 12px',borderRadius:6,border:'none',background:copying==='blogContent'?C.green:C.accent,color:copying==='blogContent'?'#000':'#fff',fontWeight:600,fontSize:11,cursor:'pointer',flexShrink:0,marginLeft:10,fontFamily:'inherit'}}>
                  {copying==='blogContent'?'✓ Copied!':'📋 Copy HTML'}
                </button>
              </div>
              <div style={{color:C.text2,fontSize:12,lineHeight:1.7,background:C.surface,padding:12,borderRadius:7,maxHeight:300,overflowY:'auto'}} dangerouslySetInnerHTML={{__html:blog.blogContent}}/>
            </div>

            {/* Image guidance */}
            <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.2)',borderRadius:10,padding:14}}>
              <div style={{fontWeight:700,color:C.amber,marginBottom:8,fontSize:13}}>🖼️ Where to get the blog image</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                {[
                  {opt:'1. Use a product image', desc:'Go to Shopify → Products, find a relevant product and download its image. Best option — real, owned.'},
                  {opt:'2. Free stock photo', desc:'Visit pexels.com or unsplash.com, search your keyword, download free to use. No attribution needed.'},
                  {opt:'3. AI generated', desc:'Go to ChatGPT → DALL-E or Canva AI, type: "Professional photo of [keyword] for hair shop blog". Download and use.'},
                ].map(o => (
                  <div key={o.opt} style={{background:C.surface2,borderRadius:8,padding:10}}>
                    <div style={{fontWeight:600,color:C.amber,fontSize:12,marginBottom:4}}>{o.opt}</div>
                    <div style={{color:C.text2,fontSize:11,lineHeight:1.5}}>{o.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {blog?.error && (
        <div style={{background:'rgba(239,68,68,.08)',border:'1px solid '+C.red+'30',borderRadius:10,padding:14,color:C.red}}>{blog.error}</div>
      )}
    </div>
  )
}

// ── PRODUCT POST BUILDER ─────────────────────────────────────────────
function ProductPostBuilder() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [selected, setSelected] = useState([])
  const [generating, setGenerating] = useState(false)
  const [posts, setPosts] = useState(null)
  const [copying, setCopying] = useState(null)
  const BATCH = 4

  async function loadProducts(off = 0) {
    setLoading(true)
    try {
      const res = await fetch(`/api/shopify-products?type=products&limit=50`)
      const d = await res.json()
      const all = d.data || []
      setProducts(all)
      setOffset(off)
    } catch(e) {}
    setLoading(false)
  }

  useEffect(() => { loadProducts(0) }, [])

  const batch = products.slice(offset, offset + BATCH)
  const hasNext = offset + BATCH < products.length
  const hasPrev = offset > 0

  function toggleSelect(p) {
    setSelected(prev => prev.find(x=>x.id===p.id) ? prev.filter(x=>x.id!==p.id) : prev.length < 4 ? [...prev, p] : prev)
  }

  async function generatePosts() {
    if (selected.length === 0) return
    setGenerating(true)
    setPosts(null)
    const productList = selected.map(p => p.title).join(', ')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json','anthropic-version':'2023-06-01'},
        body: JSON.stringify({
          model:'claude-haiku-4-5-20251001',
          max_tokens:1200,
          messages:[{ role:'user', content:`Write 3 Google Business Profile posts for CC Hair & Beauty Leeds about these products: ${productList}

CC Hair & Beauty has 3 branches: Chapeltown (LS7), Roundhay (LS8), City Centre (New York Street).
Discount codes available: WIGDEAL15, COLOUR10, EDGE15, BRAID10, OIL10, GROW10.

Return ONLY a JSON object:
{
  "chapeltown": "GBP post for Chapeltown branch. Start with emoji. 2-3 sentences. Mention the specific products. Include a relevant discount code. End with visit us at 119-129 Chapeltown Road LS7.",
  "roundhay": "GBP post for Roundhay branch. Start with emoji. 2-3 sentences. Mention the specific products. Include a relevant discount code. End with visit us at 256-258 Roundhay Road LS8.",
  "citycentre": "GBP post for City Centre branch. Start with emoji. 2-3 sentences. Mention the specific products. Include a relevant discount code. End with visit us at New York Street Leeds city centre.",
  "imagePrompt": "A short prompt to generate an AI image for these products (for use in DALL-E or Canva AI)"
}

No markdown, no backticks, pure JSON only.` }]
        })
      })
      const d = await res.json()
      const text = d.content?.[0]?.text || '{}'
      const clean = text.replace(/```json|```/g, '').trim()
      setPosts(JSON.parse(clean))
    } catch(e) {
      setPosts({error:'Failed to generate — try again'})
    }
    setGenerating(false)
  }

  function copy(key, text) {
    navigator.clipboard.writeText(text)
    setCopying(key)
    setTimeout(() => setCopying(null), 2000)
  }

  return (
    <div>
      {/* Product picker */}
      <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:14,padding:20,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div>
            <div style={{fontWeight:700,color:C.text,fontSize:15,marginBottom:3}}>Step 1 — Pick up to 4 products</div>
            <div style={{color:C.text2,fontSize:13}}>Select the products you want to feature in your GBP posts this week</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => setOffset(Math.max(0, offset-BATCH))} disabled={!hasPrev} style={{padding:'6px 12px',borderRadius:7,border:'1px solid '+C.border,background:hasPrev?C.surface2:'transparent',color:hasPrev?C.text:C.text3,cursor:hasPrev?'pointer':'default',fontSize:12,fontFamily:'inherit'}}>← Prev 4</button>
            <button onClick={() => setOffset(offset+BATCH)} disabled={!hasNext} style={{padding:'6px 12px',borderRadius:7,border:'1px solid '+C.border,background:hasNext?C.surface2:'transparent',color:hasNext?C.text:C.text3,cursor:hasNext?'pointer':'default',fontSize:12,fontFamily:'inherit'}}>Next 4 →</button>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:40,color:C.text3}}>Loading products from Shopify...</div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
            {batch.map(p => {
              const isSel = selected.find(x=>x.id===p.id)
              return (
                <div key={p.id} onClick={() => toggleSelect(p)} style={{
                  border:'2px solid '+(isSel?C.green:C.border),
                  borderRadius:10, padding:10, cursor:'pointer',
                  background: isSel ? C.green+'10' : C.surface2,
                  transition:'all .15s', position:'relative',
                }}>
                  {isSel && <div style={{position:'absolute',top:8,right:8,background:C.green,color:'#000',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700}}>✓</div>}
                  {p.images?.[0]?.src
                    ? <img src={p.images[0].src} alt="" style={{width:'100%',height:90,objectFit:'cover',borderRadius:7,marginBottom:8}}/>
                    : <div style={{width:'100%',height:90,background:C.surface,borderRadius:7,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>📦</div>
                  }
                  <div style={{fontSize:12,fontWeight:600,color:C.text,lineHeight:1.3,marginBottom:4}}>{p.title}</div>
                  <div style={{fontSize:11,color:C.text3}}>{p.product_type}</div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{marginTop:12,display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontSize:13,color:C.text2}}>
            {selected.length > 0
              ? <><span style={{color:C.green,fontWeight:700}}>{selected.length} selected:</span> {selected.map(p=>p.title).join(', ')}</>
              : 'No products selected yet'
            }
          </div>
          {selected.length > 0 && <button onClick={() => setSelected([])} style={{padding:'3px 10px',borderRadius:5,border:'1px solid '+C.border,background:C.surface2,color:C.text3,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>Clear</button>}
        </div>
      </div>

      {/* Generate button */}
      <div style={{marginBottom:20}}>
        <button onClick={generatePosts} disabled={selected.length===0||generating} style={{padding:'11px 28px',borderRadius:10,border:'none',background:selected.length===0||generating?C.surface2:C.accent,color:selected.length===0||generating?C.text3:'#fff',fontWeight:700,fontSize:15,cursor:'pointer'}}>
          {generating ? '⟳ Writing posts...' : '✨ Generate 3 GBP Posts'}
        </button>
        <span style={{color:C.text3,fontSize:12,marginLeft:12}}>One post per branch — ready to copy &amp; paste to Google Business Profile</span>
      </div>

      {/* Posts output */}
      {posts && !posts.error && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {BRANCHES.map(branch => {
            const postText = posts[branch.id]
            if (!postText) return null
            const isCopied = copying === branch.id
            const rc = branch.rating>=4?C.green:branch.rating>=3.7?C.amber:C.red
            return (
              <div key={branch.id} style={{background:C.surface,border:'1px solid '+branch.color+'40',borderRadius:12,padding:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:branch.color}}/>
                    <span style={{fontWeight:700,color:C.text,fontSize:14}}>{branch.name}</span>
                    <span style={{color:C.text3,fontSize:12}}>{branch.address}</span>
                    <span style={{color:rc,fontWeight:700}}>{branch.rating}★</span>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={() => copy(branch.id, postText)} style={{padding:'6px 14px',borderRadius:7,border:'none',background:isCopied?C.green:C.accent,color:isCopied?'#000':'#fff',fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
                      {isCopied?'✓ Copied!':'📋 Copy post'}
                    </button>
                    <a href={branch.postLink} target="_blank" rel="noreferrer" style={{padding:'6px 14px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.accent2,fontSize:12,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>
                      Post to GBP →
                    </a>
                  </div>
                </div>
                <div style={{background:C.surface2,borderRadius:8,padding:12,fontSize:13,color:C.text,lineHeight:1.7}}>{postText}</div>
              </div>
            )
          })}

          {/* Image prompt */}
          {posts.imagePrompt && (
            <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.2)',borderRadius:12,padding:16}}>
              <div style={{fontWeight:700,color:C.amber,marginBottom:8,fontSize:13}}>🖼️ AI Image prompt — paste into ChatGPT DALL-E or Canva AI</div>
              <div style={{background:C.surface2,borderRadius:8,padding:10,fontSize:13,color:C.text2,lineHeight:1.5,marginBottom:10}}>{posts.imagePrompt}</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button onClick={() => copy('imagePrompt', posts.imagePrompt)} style={{padding:'6px 14px',borderRadius:7,border:'none',background:copying==='imagePrompt'?C.green:C.amber,color:'#000',fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
                  {copying==='imagePrompt'?'✓ Copied!':'📋 Copy image prompt'}
                </button>
                <a href="https://chat.openai.com" target="_blank" rel="noreferrer" style={{padding:'6px 14px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.text2,fontSize:12,textDecoration:'none'}}>Open ChatGPT →</a>
                <a href="https://www.canva.com/ai-image-generator/" target="_blank" rel="noreferrer" style={{padding:'6px 14px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.text2,fontSize:12,textDecoration:'none'}}>Open Canva AI →</a>
              </div>
            </div>
          )}
        </div>
      )}
      {posts?.error && <div style={{background:'rgba(239,68,68,.08)',border:'1px solid '+C.red+'30',borderRadius:10,padding:14,color:C.red}}>{posts.error}</div>}
    </div>
  )
}

// ── BRANCH CARD ──────────────────────────────────────────────────────
function BranchCard({branch, expanded, onToggle}) {
  const [taskDone, setTaskDone] = useState({})
  const rc = branch.rating>=4?C.green:branch.rating>=3.7?C.amber:C.red
  const reviewsNeeded = Math.ceil((branch.target * (branch.reviews + 20) - branch.rating * branch.reviews) / (5 - branch.rating))

  return (
    <div style={{border:'2px solid '+(branch.rating>=4?C.green+'40':branch.rating>=3.7?C.amber+'40':C.red+'40'),borderRadius:14,overflow:'hidden',background:C.surface}}>
      <div onClick={onToggle} style={{padding:'16px 18px',cursor:'pointer',display:'flex',alignItems:'center',gap:14}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4,flexWrap:'wrap'}}>
            <span style={{fontWeight:800,fontSize:17,color:C.text}}>{branch.name}</span>
            <span style={{color:C.text3,fontSize:13}}>{branch.area}</span>
            <span style={{background:branch.alertColor+'20',color:branch.alertColor,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700}}>{branch.status}</span>
          </div>
          <div style={{color:C.text3,fontSize:12}}>{branch.address}</div>
        </div>
        <div style={{textAlign:'center',flexShrink:0}}>
          <div style={{fontSize:28,fontWeight:800,color:rc}}>{branch.rating}★</div>
          <div style={{fontSize:11,color:C.text3}}>{branch.reviews} reviews</div>
        </div>
        <div style={{color:C.text3,fontSize:18}}>{expanded?'▲':'▼'}</div>
      </div>

      {expanded && (
        <div style={{borderTop:'1px solid '+C.border,padding:'16px 18px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>📋 This week's tasks</div>
              {branch.tasks.map((t,i) => {
                const done = t.done||taskDone[i]
                return (
                  <div key={i} onClick={()=>setTaskDone(p=>({...p,[i]:!p[i]}))} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:8,cursor:'pointer'}}>
                    <div style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:1,background:done?C.green:'transparent',border:'2px solid '+(done?C.green:C.border),display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {done&&<span style={{color:'#000',fontSize:11,fontWeight:700}}>✓</span>}
                    </div>
                    <span style={{fontSize:13,color:done?C.text3:C.text,textDecoration:done?'line-through':'none',lineHeight:1.4}}>{t.text}</span>
                  </div>
                )
              })}
              <div style={{background:C.surface2,borderRadius:10,padding:12,marginTop:12}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:6}}>Rating target: {branch.target}★</div>
                <div style={{height:8,background:C.surface,borderRadius:4,overflow:'hidden',marginBottom:6}}>
                  <div style={{width:(branch.rating/5*100)+'%',height:'100%',background:rc,borderRadius:4}}/>
                </div>
                <div style={{fontSize:11,color:C.text3,marginBottom:10}}>
                  {branch.rating>=branch.target?'✅ Target met! Keep collecting reviews.':`Need ~${Math.max(0,reviewsNeeded)} more 5★ reviews to reach ${branch.target}★`}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <a href={branch.reviewLink} target="_blank" rel="noreferrer" style={{flex:1,padding:'7px',borderRadius:7,border:'none',background:C.accent,color:'#fff',fontWeight:600,fontSize:12,textDecoration:'none',textAlign:'center'}}>⭐ Get review link</a>
                  <a href={branch.gbpLink} target="_blank" rel="noreferrer" style={{flex:1,padding:'7px',borderRadius:7,border:'1px solid '+C.border,background:C.surface,color:C.text2,fontSize:12,textDecoration:'none',textAlign:'center'}}>Open GBP</a>
                </div>
              </div>
            </div>
            <div>
              <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.2)',borderRadius:10,padding:14}}>
                <div style={{fontWeight:700,color:C.amber,marginBottom:8,fontSize:13}}>⭐ Reviews — how to reply</div>
                <div style={{fontSize:13,color:C.text2,lineHeight:1.6,marginBottom:12}}>
                  Google Business Profile only allows replies from the GBP dashboard — we can't post directly from here. Here's how:
                </div>
                {[
                  '1. Click "Open GBP" button above',
                  '2. Go to Reviews section',
                  '3. Use the GBP Post Builder tab (above) to generate posts',
                  '4. For review replies — click Reply on each review in GBP',
                ].map((step,i) => (
                  <div key={i} style={{display:'flex',gap:8,marginBottom:6,fontSize:12,color:C.text2}}>
                    <span style={{color:C.amber,flexShrink:0}}>→</span>{step}
                  </div>
                ))}
                <a href={branch.reviewLink} target="_blank" rel="noreferrer" style={{display:'block',marginTop:12,padding:'8px 14px',borderRadius:8,border:'none',background:C.amber,color:'#000',fontWeight:700,fontSize:12,textDecoration:'none',textAlign:'center'}}>
                  Open {branch.name} Reviews on Google →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MAIN PAGE ────────────────────────────────────────────────────────
export default function LocalSEOPage() {
  const [tab, setTab] = useState('process')
  const [expanded, setExpanded] = useState('chapeltown')

  const TABS = [
    {id:'process',  label:'📋 Weekly Process'},
    {id:'posts',    label:'📝 GBP Post Builder'},
    {id:'blogs',    label:'✍️ Blog Generator'},
    {id:'keywords', label:'🔑 Keywords (83)'},
  ]

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

      <div style={{maxWidth:1300,margin:'0 auto',padding:20}}>

        {/* Header */}
        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:6}}>📍 Local SEO — Team Guide</h1>
          <p style={{color:C.text2,fontSize:14,lineHeight:1.6}}>
            Follow the weekly process, build GBP posts from your latest Shopify products, auto-generate SEO blogs from local keywords, and track all 3 branches.
          </p>
        </div>

        {/* Sub tabs */}
        <div style={{display:'flex',gap:4,marginBottom:24,borderBottom:'1px solid '+C.border,paddingBottom:0}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'9px 16px', background:'none', border:'none',
              borderBottom: tab===t.id ? '2px solid '+C.accent2 : '2px solid transparent',
              color: tab===t.id ? C.accent2 : C.text2,
              fontSize:13, fontWeight: tab===t.id ? 700 : 400,
              cursor:'pointer', marginBottom:-1,
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── WEEKLY PROCESS ── */}
        {tab === 'process' && (
          <div>
            {/* 5-step flow */}
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:14}}>Do these in order every week</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:0,position:'relative'}}>
                {[
                  {step:'1',icon:'📍',title:'Check all 3 GBP listings',desc:'Open GBP. Check for new reviews, Q&A, and info accuracy.',color:C.teal,urgent:false},
                  {step:'2',icon:'⭐',title:'Reply to all reviews',desc:'Open GBP → Reviews. Reply to every new review within 48 hours.',color:C.blue,urgent:true},
                  {step:'3',icon:'📝',title:'Post weekly offer',desc:'Use the GBP Post Builder tab — pick products, AI writes 3 posts.',color:C.accent,urgent:false},
                  {step:'4',icon:'❓',title:'Answer Q&A questions',desc:'Check Q&A on each listing. Answer any new questions.',color:C.amber,urgent:false},
                  {step:'5',icon:'📸',title:'Add new photos',desc:'Upload 2+ product photos to each branch per month.',color:C.green,urgent:false},
                ].map((s,i) => (
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',position:'relative'}}>
                    {i<4&&<div style={{position:'absolute',top:28,left:'50%',width:'100%',height:2,background:C.border,zIndex:0}}/>}
                    <div style={{position:'relative',zIndex:1,width:'100%',padding:'0 8px',textAlign:'center'}}>
                      <div style={{width:56,height:56,borderRadius:'50%',background:s.color+'20',border:'2px solid '+s.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,margin:'0 auto 10px'}}>{s.icon}</div>
                      <div style={{fontWeight:700,fontSize:13,color:s.color,marginBottom:4}}>Step {s.step}</div>
                      <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:5,lineHeight:1.3}}>{s.title}</div>
                      <div style={{fontSize:11,color:C.text2,lineHeight:1.5}}>{s.desc}</div>
                      {s.urgent&&<span style={{background:C.red+'20',color:C.red,padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:700,display:'inline-block',marginTop:5}}>Within 48h</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Branch cards */}
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:12}}>
              3 branches — click to expand tasks
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
              {BRANCHES.map(b => (
                <BranchCard key={b.id} branch={b} expanded={expanded===b.id} onToggle={()=>setExpanded(expanded===b.id?null:b.id)}/>
              ))}
            </div>

            {/* Monthly routine */}
            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:18}}>
              <div style={{fontWeight:700,color:C.text,marginBottom:12,fontSize:14}}>📅 Monthly routine</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                {[
                  {label:'Every week',color:C.teal,items:['Post GBP offer all 3 branches','Reply to all new reviews','Check Q&A sections','Share offer on WhatsApp status']},
                  {label:'Every month',color:C.accent,items:['Publish 4 blogs (use Blog Generator tab)','Upload new product photos to GBP','Check keyword rankings in Search Console','Review negative keywords in Google Ads']},
                  {label:'Every quarter',color:C.amber,items:['Full SEO audit of top 10 collection pages','Review discount code performance','Update opening hours on GBP if changed','Check competitor GBP listings and ratings']},
                ].map(c => (
                  <div key={c.label} style={{background:C.surface2,borderRadius:10,padding:14}}>
                    <div style={{fontWeight:700,color:c.color,marginBottom:8,fontSize:13}}>{c.label}</div>
                    {c.items.map((item,i) => (
                      <div key={i} style={{display:'flex',gap:7,marginBottom:5,fontSize:12,color:C.text2}}>
                        <span style={{color:c.color,flexShrink:0}}>→</span>{item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GBP POST BUILDER ── */}
        {tab === 'posts' && (
          <div>
            <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:10,padding:12,marginBottom:20,fontSize:13,color:C.accent2}}>
              Pick products from your Shopify store → AI writes a GBP post for each branch → Copy &amp; paste to Google Business Profile. Get an AI image prompt to use in ChatGPT or Canva.
            </div>
            <ProductPostBuilder/>
          </div>
        )}

        {/* ── BLOG GENERATOR ── */}
        {tab === 'blogs' && (
          <div>
            <div style={{background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.2)',borderRadius:10,padding:12,marginBottom:20,fontSize:13,color:C.green}}>
              Pick a keyword → AI writes a full SEO blog post with title, URL slug, meta description, H1, image alt text, and full HTML content → Copy and paste straight into Shopify Blog editor at <strong>cchairandbeauty.com/blogs/local-news</strong>
            </div>
            <BlogGenerator/>
          </div>
        )}

        {/* ── KEYWORDS ── */}
        {tab === 'keywords' && (
          <div>
            <div style={{color:C.text2,fontSize:13,marginBottom:20,lineHeight:1.6}}>
              Click any keyword to copy it. Use <strong style={{color:C.green}}>Question searches</strong> as blog titles in the Blog Generator. Use <strong style={{color:C.teal}}>Local intent</strong> keywords on collection pages and in GBP posts.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:14}}>
              {KEYWORD_CLUSTERS.map(cluster => {
                const [copiedKw, setCopiedKw] = useState(null)
                return (
                  <div key={cluster.cluster} style={{background:C.surface,border:'1px solid '+cluster.color+'30',borderRadius:12,overflow:'hidden'}}>
                    <div style={{padding:'12px 16px',background:cluster.color+'12',borderBottom:'1px solid '+cluster.color+'20'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                        <span style={{fontSize:18}}>{cluster.icon}</span>
                        <span style={{fontWeight:700,color:cluster.color,fontSize:14}}>{cluster.cluster}</span>
                        <span style={{background:cluster.color+'20',color:cluster.color,padding:'1px 8px',borderRadius:99,fontSize:11,fontWeight:600,marginLeft:'auto'}}>{cluster.keywords.length}</span>
                      </div>
                      <div style={{fontSize:12,color:C.text2,lineHeight:1.4}}>{cluster.desc}</div>
                    </div>
                    <div style={{padding:12,display:'flex',flexWrap:'wrap',gap:6}}>
                      {cluster.keywords.map(kw => (
                        <button key={kw} onClick={()=>{navigator.clipboard.writeText(kw);setCopiedKw(kw);setTimeout(()=>setCopiedKw(null),1500)}} style={{
                          padding:'4px 10px',borderRadius:6,border:'1px solid '+cluster.color+'30',
                          background:copiedKw===kw?cluster.color:cluster.color+'10',
                          color:copiedKw===kw?'#000':cluster.color,
                          fontSize:12,cursor:'pointer',fontWeight:500,transition:'all .1s',
                        }}>{copiedKw===kw?'✓ copied':kw}</button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Blog tip */}
            <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:12,padding:16,marginTop:16}}>
              <div style={{fontWeight:700,color:C.accent2,marginBottom:8,fontSize:13}}>📝 How to turn keywords into blogs</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                {[
                  {step:'1',text:'Pick a keyword from "Question searches" — e.g. "Where to buy braiding hair in Leeds"'},
                  {step:'2',text:'Click the Blog Generator tab above. Select the keyword. Click Generate.'},
                  {step:'3',text:'Copy the title, meta description and HTML content. Paste into Shopify Blog editor.'},
                ].map(t => (
                  <div key={t.step} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                    <div style={{width:24,height:24,borderRadius:'50%',background:C.accent,color:'#fff',fontSize:12,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{t.step}</div>
                    <span style={{fontSize:12,color:C.text2,lineHeight:1.5}}>{t.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
