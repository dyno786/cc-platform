import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const SHOPIFY_ADMIN = 'https://admin.shopify.com/store/cchairandbeauty'
const STORE = 'https://cchairandbeauty.com'

// Turn a URL path into a friendly name
function friendlyName(path) {
  if (!path || path === '/') return 'Homepage'
  const slug = path.split('/').filter(Boolean).pop() || path
  return slug.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0,40)
}

// Shopify admin link based on URL type
function shopifyEditLink(path) {
  if (path.includes('/collections/')) {
    const handle = path.replace('/collections/','').split('?')[0]
    return `${SHOPIFY_ADMIN}/collections?search=${handle}`
  }
  if (path.includes('/products/')) {
    const handle = path.replace('/products/','').split('?')[0]
    return `${SHOPIFY_ADMIN}/products?search=${handle}`
  }
  if (path.includes('/blogs/')) return `${SHOPIFY_ADMIN}/blogs`
  if (path === '/' || path === '') return `${SHOPIFY_ADMIN}/online_store/preferences`
  return `${SHOPIFY_ADMIN}/online_store`
}

// Position colour
function posColor(pos) {
  if (pos <= 3) return T.green
  if (pos <= 10) return T.amber
  return T.red
}

export default function OrganicSEO() {
  const [tab, setTab] = useState('Overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState({ key: 'impressions', dir: 'desc' })
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_seo_tasks') || '{}') } catch(e) { return {} }
  })

  // Content gap publishing
  const [gapPublishing, setGapPublishing] = useState({})
  const [gapPublished, setGapPublished] = useState({})
  const [gapStatus, setGapStatus] = useState({})
  const [qwTitles, setQwTitles] = useState({}) // quick win -> {suggested title, current title}
  const [qwLoading, setQwLoading] = useState({})
  const [qwPushing, setQwPushing] = useState({})
  const [qwPushed, setQwPushed] = useState({})
  const [fixLoading, setFixLoading] = useState({})
  const [fixPushed, setFixPushed] = useState({})

  useEffect(() => {
    fetch('/api/live-data?source=searchconsole')
      .then(r => r.json())
      .then(d => { if (d.ok) setData(d); else setError(d.error || 'Failed') })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function tick(id) {
    const u = { ...tasks, [id]: !tasks[id] }
    setTasks(u)
    try { localStorage.setItem('cc_seo_tasks', JSON.stringify(u)) } catch(e) {}
  }

  function doSort(key) {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  }

  function sortRows(rows) {
    if (!rows) return []
    return [...rows].sort((a, b) => {
      const av = typeof a[sort.key] === 'string' ? parseFloat(a[sort.key]) : a[sort.key]
      const bv = typeof b[sort.key] === 'string' ? parseFloat(b[sort.key]) : b[sort.key]
      return sort.dir === 'desc' ? bv - av : av - bv
    })
  }

  async function getSuggestedTitle(qw) {
    const key = qw.query
    setQwLoading(l=>({...l,[key]:true}))
    try {
      // Try to find matching Shopify collection
      const r = await fetch(`/api/shopify-collections-search?q=${encodeURIComponent(qw.query)}&limit=3`)
      const d = await r.json()
      const col = d.collections?.[0]
      const currentTitle = col ? (col.seoTitle || col.title) : null
      const brand = qw.query.split(' ')[0]
      const suggested = col
        ? `Buy ${col.title} UK | CC Hair and Beauty Leeds`
        : `${qw.query.replace(/\w/g,c=>c.toUpperCase())} | CC Hair and Beauty Leeds`
      setQwTitles(t=>({...t,[key]:{
        suggested,
        currentTitle,
        handle: col?.handle,
        collectionTitle: col?.title,
      }}))
    } catch(e){}
    setQwLoading(l=>({...l,[key]:false}))
  }

  async function pushQwTitle(qw, title) {
    const key = qw.query
    const info = qwTitles[key]
    if (!info?.handle) return
    setQwPushing(p=>({...p,[key]:true}))
    try {
      const r = await fetch('/api/push-collection-seo',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({handle:info.handle,seoTitle:title,metaDesc:`Shop ${info.collectionTitle} at CC Hair and Beauty Leeds — Chapeltown, Roundhay and Leeds City Centre. UK delivery available.`})
      })
      const d = await r.json()
      if(d.ok) setQwPushed(p=>({...p,[key]:true}))
    } catch(e){}
    setQwPushing(p=>({...p,[key]:false}))
  }

  async function pushLowCtrFix(page) {
    const key = page.page
    setFixLoading(f=>({...f,[key]:true}))
    const suggestions = {
      '/collections/relaxers': {
        title: 'Buy Hair Relaxers UK — ORS, Dark & Lovely, TCB | CC Hair and Beauty Leeds',
        desc: 'Shop professional hair relaxers at CC Hair and Beauty Leeds. Huge range including ORS, Dark and Lovely, TCB and more. In store and online. Free UK delivery over £50.'
      },
      '/blogs/cantu-product-blog/the-ultimate-guide-to-cantu-hair-care-products-for-every-hair-type': {
        title: 'The Ultimate Guide to Cantu Hair Care Products | CC Hair and Beauty Leeds',
        desc: 'Complete guide to Cantu hair care — shea butter, leave-in conditioner, curl cream and more. Shop the full Cantu range at CC Hair and Beauty Leeds.'
      },
      '/products/casting-creme-gloss-semi-permanent-hair-dye': {
        title: 'Casting Creme Gloss Semi Permanent Hair Dye — Colour Chart UK | CC Hair and Beauty',
        desc: 'Buy Casting Creme Gloss semi permanent hair dye at CC Hair and Beauty. Full UK colour chart available. Free delivery over £50.'
      },
      '/collections/hair-extensions': {
        title: 'Buy Hair Extensions UK — Human Hair & Synthetic | CC Hair and Beauty Leeds',
        desc: 'Shop hair extensions at CC Hair and Beauty Leeds. Human hair, synthetic, clip-in, weave and more. 3 stores in Leeds. Free UK delivery over £50.'
      },
    }
    const fix = suggestions[key] || {
      title: page.page.split('/').pop().replace(/-/g,' ').replace(/\w/g,c=>c.toUpperCase()) + ' | CC Hair and Beauty Leeds',
      desc: `Shop at CC Hair and Beauty Leeds — Chapeltown LS7, Roundhay LS8 and Leeds City Centre. Free UK delivery over £50.`
    }
    try {
      const isCollection = key.includes('/collections/')
      const handle = key.split('/').pop().split('?')[0]
      const endpoint = isCollection ? '/api/push-collection-seo' : '/api/push-product-seo'
      const r = await fetch(endpoint,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({handle,seoTitle:fix.title,metaDesc:fix.desc})
      })
      const d = await r.json()
      if(d.ok) setFixPushed(f=>({...f,[key]:'done'}))
      else setFixPushed(f=>({...f,[key]:'error: '+d.error}))
    } catch(e){ setFixPushed(f=>({...f,[key]:'error: '+e.message})) }
    setFixLoading(f=>({...f,[key]:false}))
  }

  async function publishGap(gap) {
    const key = gap.query
    setGapPublishing(p => ({...p, [key]: true}))
    setGapStatus(p => ({...p, [key]: 'Writing blog post...'}))
    try {
      const slug = gap.query.toLowerCase().replace(/[^a-z0-9]+/g,'-')
      const blogRes = await fetch('/api/generate-blog', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          title: gap.query.replace(/\b\w/g, c => c.toUpperCase()),
          seoTitle: `${gap.query.replace(/\b\w/g, c => c.toUpperCase())} | CC Hair and Beauty Leeds`,
          metaDesc: `Everything you need to know about ${gap.query.toLowerCase()} at CC Hair and Beauty Leeds.`,
          keywords: [gap.query, gap.query + ' uk', gap.query + ' leeds'],
          slug, cat: 'org',
          data: `Search Console: ${gap.impressions.toLocaleString()} impressions, position ${gap.position}, only ${gap.ctr}% CTR — big content gap opportunity`,
        })
      })
      const blogData = await blogRes.json()
      if (!blogData.ok) {
        setGapStatus(p => ({...p, [key]: '✗ Generation failed: ' + (blogData.error||'unknown')}))
        setGapPublishing(p => ({...p, [key]: false}))
        return
      }
      setGapStatus(p => ({...p, [key]: 'Publishing to Shopify...'}))
      const pubRes = await fetch('/api/publish-to-shopify', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          title: gap.query.replace(/\b\w/g, c => c.toUpperCase()),
          seoTitle: `${gap.query.replace(/\b\w/g, c => c.toUpperCase())} | CC Hair and Beauty Leeds`,
          metaDesc: `Everything you need to know about ${gap.query.toLowerCase()} at CC Hair and Beauty Leeds.`,
          slug, content: blogData.content, cat: 'org',
          keywords: [gap.query, gap.query + ' uk'],
          imageUrl: blogData.featuredImage?.src || null,
          imageAlt: blogData.featuredImage?.alt || null,
        })
      })
      const pubData = await pubRes.json()
      if (pubData.ok) {
        setGapStatus(p => ({...p, [key]: `✓ Live at ${pubData.articleUrl}`}))
        setGapPublished(p => ({...p, [key]: pubData.articleUrl}))
      } else {
        setGapStatus(p => ({...p, [key]: '✗ Publish failed: ' + (pubData.error||'unknown')}))
      }
    } catch(e) {
      setGapStatus(p => ({...p, [key]: '✗ Error: ' + e.message}))
    }
    setGapPublishing(p => ({...p, [key]: false}))
  }

  const TABS = ['Overview','Quick Wins','Top Keywords','Top Pages','Content Gaps','Technical','Tasks']

  const Th = ({k, children}) => (
    <th onClick={k ? ()=>doSort(k) : undefined} style={{
      padding:'7px 11px',fontSize:10,fontWeight:600,color:T.textMuted,
      textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left',
      background:T.bg,borderBottom:`0.5px solid ${T.border}`,
      whiteSpace:'nowrap',cursor:k?'pointer':'default',
    }}>
      {children}{k && <span style={{marginLeft:3,opacity:.5}}>{sort.key===k?(sort.dir==='desc'?'↓':'↑'):'↕'}</span>}
    </th>
  )

  const Td = ({children, color, bold, mono}) => (
    <td style={{
      padding:'8px 11px',fontSize:12,color:color||T.text,
      fontWeight:bold?600:400,fontFamily:mono?'monospace':'inherit',
      borderBottom:`0.5px solid ${T.borderLight}`,verticalAlign:'middle',
    }}>{children}</td>
  )

  if (loading) return (
    <Shell title="Organic SEO" subtitle="Loading live Search Console data...">
      <div style={{padding:60,textAlign:'center',color:T.textMuted}}>
        <div style={{fontSize:32,marginBottom:12}}>⟳</div>
        Loading live data from Google Search Console...
      </div>
    </Shell>
  )

  if (error) return (
    <Shell title="Organic SEO" subtitle="Error loading data">
      <div style={{padding:40,background:'#fff0f0',borderRadius:8,color:T.red,fontSize:13}}>
        Search Console error: {error}
      </div>
    </Shell>
  )

  const { totals, keywords, pages, quickWins, contentGaps, lowCtrPages, keywordCount, period } = data || {}

  return (
    <>
      <Head><title>Organic SEO — CC Intelligence</title></Head>
      <Shell title="Organic SEO" subtitle={`Live Search Console data · ${period}`}>

        {/* Live banner */}
        <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:7,padding:'7px 13px',marginBottom:14,fontSize:11,color:T.green,display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:T.green}}/>
          Live data from Search Console — {keywordCount?.toLocaleString() || 0} keywords analysed · last 90 days
          <button onClick={()=>{setLoading(true);setData(null);fetch('/api/live-data?source=searchconsole').then(r=>r.json()).then(d=>{if(d.ok)setData(d);else setError(d.error)}).finally(()=>setLoading(false))}}
            style={{marginLeft:'auto',padding:'3px 10px',fontSize:11,color:T.green,background:'none',border:`1px solid ${T.green}`,borderRadius:5,cursor:'pointer'}}>
            Refresh
          </button>
        </div>

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginBottom:16}}>
          {[
            {label:'Total Clicks', value:totals?.clicks?.toLocaleString(), sub:'Last 90 days'},
            {label:'Impressions', value:totals?.impressions?.toLocaleString(), sub:'Last 90 days'},
            {label:'Avg Position', value:totals?.avgPosition, sub:parseFloat(totals?.avgPosition)<=5?'Good — top 5':'Room to improve', color:parseFloat(totals?.avgPosition)<=5?T.green:T.amber},
            {label:'Avg CTR', value:totals?.avgCtr, sub:'Target 3%+', color:parseFloat(totals?.avgCtr)>=3?T.green:T.amber},
            {label:'Quick Wins', value:quickWins?.length, sub:'Keywords just off page 1', color:T.blue},
            {label:'Content Gaps', value:contentGaps?.length, sub:'Blog opportunities', color:'#7c3aed'},
          ].map((s,i) => (
            <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',fontWeight:600,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color||T.text}}>{s.value}</div>
              <div style={{fontSize:10,color:T.textMuted}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:14,borderBottom:`1px solid ${T.border}`}}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'7px 14px',fontSize:12,fontWeight:600,border:'none',background:'none',
              borderBottom:tab===t?`2px solid ${T.blue}`:'2px solid transparent',
              color:tab===t?T.blue:T.textMuted,cursor:'pointer',whiteSpace:'nowrap',
            }}>{t}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab==='Overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {/* Top 5 keywords */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
              <div style={{padding:'8px 12px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:11,fontWeight:600,color:T.text}}>Top 5 keywords by clicks</div>
              {(keywords||[]).slice(0,5).map((k,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderBottom:`0.5px solid ${T.borderLight}`}}>
                  <span style={{fontSize:11,fontWeight:700,color:T.textMuted,width:16}}>{i+1}</span>
                  <span style={{fontSize:12,color:T.text,flex:1}}>{k.query}</span>
                  <span style={{fontSize:11,fontWeight:700,color:T.green}}>{k.clicks} clicks</span>
                  <span style={{fontSize:10,color:posColor(k.position),fontWeight:600}}>pos {k.position}</span>
                </div>
              ))}
            </div>
            {/* Top 5 pages */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
              <div style={{padding:'8px 12px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:11,fontWeight:600,color:T.text}}>Top 5 pages by clicks</div>
              {(pages||[]).slice(0,5).map((p,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderBottom:`0.5px solid ${T.borderLight}`}}>
                  <span style={{fontSize:11,fontWeight:700,color:T.textMuted,width:16}}>{i+1}</span>
                  <span style={{fontSize:12,color:T.text,flex:1}}>{friendlyName(p.page)}</span>
                  <span style={{fontSize:11,fontWeight:700,color:T.green}}>{p.clicks} clicks</span>
                  <span style={{fontSize:10,color:p.ctr<1?T.red:T.amber,fontWeight:600}}>{p.ctrStr} CTR</span>
                </div>
              ))}
            </div>
            {/* Low CTR pages alert */}
            {lowCtrPages?.length > 0 && (
              <div style={{gridColumn:'span 2',background:'#fff8e1',border:`1px solid ${T.amberBorder}`,borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:8}}>Pages with high impressions but low CTR — fix these first</div>
                {lowCtrPages.slice(0,5).map((p,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:5}}>
                    <span style={{fontSize:12,fontWeight:600,color:T.text,flex:1}}>{friendlyName(p.page)}</span>
                    <span style={{fontSize:11,color:T.textMuted}}>{p.impressions.toLocaleString()} impr</span>
                    <span style={{fontSize:11,fontWeight:700,color:T.red}}>{p.ctrStr} CTR</span>
                    <span style={{fontSize:11,color:T.textMuted}}>pos {p.position}</span>
                    <a href={shopifyEditLink(p.page)} target="_blank" rel="noreferrer"
                      style={{fontSize:11,fontWeight:600,color:'#fff',background:T.blue,padding:'3px 10px',borderRadius:5,textDecoration:'none'}}>
                      Fix SEO →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── QUICK WINS ── */}
        {tab==='Quick Wins' && (
          <div>
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:12,fontSize:11,color:T.green}}>
              {quickWins?.length} keywords ranking positions 4-20 with 200+ monthly impressions. Improving these pages could unlock significant traffic.
            </div>
            {(quickWins||[]).map((k,i) => (
              <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderLeft:`4px solid ${posColor(k.position)}`,borderRadius:8,padding:'12px 14px',marginBottom:6}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5,flexWrap:'wrap'}}>
                      <span style={{fontSize:13,fontWeight:700,color:T.text}}>{k.query}</span>
                      <span style={{fontSize:11,fontWeight:700,color:posColor(k.position)}}>pos {k.position}</span>
                      <span style={{fontSize:11,color:T.green}}>{k.clicks} clicks</span>
                      <span style={{fontSize:11,color:T.textMuted}}>{k.impressions.toLocaleString()} impr</span>
                      <span style={{fontSize:11,color:k.ctr<2?T.red:T.amber}}>{k.ctrStr} CTR</span>
                      {k.potentialClicks > 0 && (
                        <span style={{fontSize:10,fontWeight:600,color:'#fff',background:T.green,padding:'2px 7px',borderRadius:4}}>
                          +{k.potentialClicks} clicks possible
                        </span>
                      )}
                    </div>
                    <div style={{fontSize:11,color:T.blue,fontWeight:500}}>{k.fix}</div>
                  </div>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(k.query)}`} target="_blank" rel="noreferrer"
                    style={{padding:'5px 10px',fontSize:11,color:T.blue,border:`0.5px solid ${T.border}`,borderRadius:5,textDecoration:'none',whiteSpace:'nowrap',flexShrink:0}}>
                    Check on Google →
                  </a>
                </div>
                {/* Title preview + push */}
                {qwTitles[k.query] && !qwPushed[k.query] && (
                  <div style={{marginTop:8,padding:'10px 12px',background:T.bg,border:`1px solid ${T.border}`,borderRadius:7}}>
                    {qwTitles[k.query].currentTitle && (
                      <div style={{fontSize:11,color:T.textMuted,marginBottom:5}}>
                        Current Shopify title: <span style={{color:T.red}}>{qwTitles[k.query].currentTitle}</span>
                      </div>
                    )}
                    <div style={{fontSize:11,color:T.text,marginBottom:8}}>
                      Suggested: <strong style={{color:T.green}}>{qwTitles[k.query].suggested}</strong>
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      {qwTitles[k.query].handle ? (
                        <button onClick={()=>pushQwTitle(k, qwTitles[k.query].suggested)} disabled={qwPushing[k.query]}
                          style={{padding:'5px 14px',fontSize:11,fontWeight:700,background:qwPushing[k.query]?T.border:T.green,color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}}>
                          {qwPushing[k.query]?'Pushing...':'✓ Accept & push to Shopify'}
                        </button>
                      ) : (
                        <span style={{fontSize:11,color:T.textMuted}}>No matching Shopify collection found — fix manually</span>
                      )}
                      <button onClick={()=>setQwTitles(t=>({...t,[k.query]:undefined}))}
                        style={{padding:'5px 10px',fontSize:11,color:T.textMuted,background:'none',border:`0.5px solid ${T.border}`,borderRadius:5,cursor:'pointer'}}>
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TOP KEYWORDS ── */}
        {tab==='Top Keywords' && (
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
            <div style={{padding:'8px 12px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:11,color:T.textMuted}}>
              Top 100 keywords by clicks · {keywordCount?.toLocaleString()} total keywords found · Click column headers to sort
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
              <thead><tr>
                <Th>Keyword</Th>
                <Th k="clicks">Clicks</Th>
                <Th k="impressions">Impressions</Th>
                <Th k="position">Position</Th>
                <Th k="ctr">CTR</Th>
              </tr></thead>
              <tbody>
                {sortRows(keywords).map((k,i) => (
                  <tr key={i} style={{background:k.ctr<1&&k.impressions>500?'#fff8f8':'transparent'}}>
                    <Td bold>{k.query}</Td>
                    <Td color={T.green}>{k.clicks.toLocaleString()}</Td>
                    <Td color={T.textMuted}>{k.impressions.toLocaleString()}</Td>
                    <td style={{padding:'8px 11px',borderBottom:`0.5px solid ${T.borderLight}`}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:50,height:4,background:T.borderLight,borderRadius:99,overflow:'hidden'}}>
                          <div style={{width:`${Math.max(5,100-(k.position/25*100))}%`,height:'100%',background:posColor(k.position),borderRadius:99}}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,color:posColor(k.position)}}>{k.position}</span>
                      </div>
                    </td>
                    <Td color={k.ctr<1?T.red:k.ctr<3?T.amber:T.green}>{k.ctrStr}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TOP PAGES ── */}
        {tab==='Top Pages' && (
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
            <div style={{padding:'8px 12px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:11,color:T.textMuted}}>
              Live data — {pages?.length} pages getting traffic from Google · Red = low CTR, needs meta title fix
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
              <thead><tr>
                <Th>Page</Th>
                <Th k="clicks">Clicks</Th>
                <Th k="impressions">Impressions</Th>
                <Th k="position">Position</Th>
                <Th k="ctr">CTR</Th>
                <Th>Fix</Th>
              </tr></thead>
              <tbody>
                {sortRows(pages).map((p,i) => {
                  const lowCtr = p.ctr < 2 && p.impressions > 200
                  return (
                    <tr key={i} style={{background:lowCtr?'#fff8f8':'transparent'}}>
                      <td style={{padding:'8px 11px',borderBottom:`0.5px solid ${T.borderLight}`}}>
                        <div style={{fontSize:12,fontWeight:700,color:T.text}}>{friendlyName(p.page)}</div>
                        <div style={{fontSize:10,color:T.textMuted,fontFamily:'monospace'}}>{p.page.slice(0,50)}{p.page.length>50?'...':''}</div>
                        {lowCtr && <div style={{fontSize:10,color:T.red,fontWeight:600,marginTop:2}}>Low CTR — fix meta title</div>}
                      </td>
                      <Td color={T.green}>{p.clicks.toLocaleString()}</Td>
                      <Td color={T.textMuted}>{p.impressions.toLocaleString()}</Td>
                      <td style={{padding:'8px 11px',borderBottom:`0.5px solid ${T.borderLight}`}}>
                        <span style={{fontSize:11,fontWeight:700,color:posColor(p.position)}}>{p.position}</span>
                      </td>
                      <Td color={p.ctr<1?T.red:p.ctr<3?T.amber:T.green}>{p.ctrStr}</Td>
                      <td style={{padding:'8px 11px',borderBottom:`0.5px solid ${T.borderLight}`}}>
                        <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                          <a href={shopifyEditLink(p.page)} target="_blank" rel="noreferrer"
                            style={{fontSize:10,fontWeight:600,color:'#fff',background:T.blue,padding:'3px 8px',borderRadius:4,textDecoration:'none',whiteSpace:'nowrap'}}>
                            Edit SEO →
                          </a>
                          <a href={`${STORE}${p.page}`} target="_blank" rel="noreferrer"
                            style={{fontSize:10,color:T.blue,textDecoration:'none',whiteSpace:'nowrap'}}>
                            View →
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CONTENT GAPS ── */}
        {tab==='Content Gaps' && (
          <div>
            <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:12,fontSize:11,color:T.blue}}>
              {contentGaps?.length} real keywords from your Search Console data — 100+ monthly impressions, under 3% CTR, position 5+. These are topics Google is already showing you for but you have no good content. Click Generate and Publish to fix them.
            </div>
            {(contentGaps||[]).map((gap,i) => {
              const key = gap.query
              const isPub = gapPublished[key]
              const isRunning = gapPublishing[key]
              const status = gapStatus[key]
              return (
                <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px',marginBottom:6}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                    <span style={{fontSize:12,fontWeight:700,color:T.text,flex:1}}>{gap.query}</span>
                    <span style={{fontSize:11,color:T.textMuted}}>{gap.impressions.toLocaleString()} impr/mo</span>
                    <span style={{fontSize:11,color:T.red,fontWeight:600}}>{gap.ctrStr} CTR</span>
                    <span style={{fontSize:11,color:posColor(gap.position)}}>pos {gap.position}</span>
                    {isPub ? (
                      <a href={isPub} target="_blank" rel="noreferrer"
                        style={{padding:'5px 14px',fontSize:11,fontWeight:700,color:'#fff',background:'#1a7f37',borderRadius:6,textDecoration:'none'}}>
                        ✓ Live →
                      </a>
                    ) : (
                      <button onClick={()=>publishGap(gap)} disabled={isRunning}
                        style={{padding:'5px 14px',fontSize:11,fontWeight:700,color:'#fff',background:isRunning?T.border:T.blue,border:'none',borderRadius:6,cursor:'pointer',whiteSpace:'nowrap'}}>
                        {isRunning?'Publishing...':'🚀 Generate & Publish'}
                      </button>
                    )}
                  </div>
                  {status && (
                    <div style={{marginTop:8,padding:'7px 10px',borderRadius:5,fontSize:11,fontWeight:500,
                      background:status.startsWith('✓')?'#dafbe1':status.startsWith('✗')?'#fff0f0':'#ddf4ff',
                      color:status.startsWith('✓')?'#1a7f37':status.startsWith('✗')?T.red:T.blue}}>
                      {status}
                      {isPub && <a href={isPub} target="_blank" rel="noreferrer" style={{marginLeft:10,color:'#1a7f37',fontWeight:700,textDecoration:'underline'}}>View post →</a>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── TECHNICAL ── */}
        {tab==='Technical' && (
          <div>
            {[
              {issue:'HTTP homepage indexed separately', severity:'critical', fix:'http://www.cchairandbeauty.com is getting 761 clicks — set up 301 redirect to https://cchairandbeauty.com in Shopify Domains settings'},
              {issue:'Relaxers collection — 37,671 impressions, 0.5% CTR', severity:'critical', fix:'Meta title is generic. Change to: "Buy Hair Relaxers UK — ORS, Dark & Lovely, TCB | CC Hair and Beauty Leeds"'},
              {issue:'Cantu blog — 21,123 impressions, 0.5% CTR', severity:'high', fix:'Blog post title needs the keyword. Add internal links to Cantu product collection from within the post'},
              {issue:'Casting Creme Gloss product — 12,000 impressions, 0.6% CTR', severity:'high', fix:'Product page meta title needs to include the colour chart keywords. Add "Colour Chart UK" to title'},
              {issue:'Collection pages — thin content', severity:'high', fix:'Relaxers, Braiding Hair, Human Hair Wigs, Lace Front Wigs all need 200+ word descriptions. Use Website SEO tab to generate and push'},
              {issue:'No schema markup on product pages', severity:'medium', fix:'Add Product schema — helps Google show star ratings in search results'},
              {issue:'Site speed on mobile', severity:'medium', fix:'Images need WebP compression — use a Shopify app like Crush.pics or TinyIMG'},
              {issue:'Duplicate content on tag pages', severity:'low', fix:'Add canonical tags to /tags/ pages — contact Shopify support or use a theme edit'},
            ].map((t,i) => (
              <div key={i} style={{
                background:T.surface,
                border:`0.5px solid ${t.severity==='critical'?T.redBorder:t.severity==='high'?T.amberBorder:T.border}`,
                borderLeft:`4px solid ${t.severity==='critical'?T.red:t.severity==='high'?T.amber:T.blue}`,
                borderRadius:8,padding:'12px 14px',marginBottom:7,
              }}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5}}>
                  <span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:4,
                    background:t.severity==='critical'?T.redBg:t.severity==='high'?T.amberBg:T.blueBg,
                    color:t.severity==='critical'?T.red:t.severity==='high'?T.amber:T.blue}}>
                    {t.severity}
                  </span>
                  <span style={{fontSize:12,fontWeight:600,color:T.text}}>{t.issue}</span>
                </div>
                <div style={{fontSize:11,color:T.textMuted}}>Fix: {t.fix}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── TASKS ── */}
        {tab==='Tasks' && (
          <div>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:10}}>Click to mark done. These are generated from your live Search Console data.</div>
            {[
              {id:'t1', text:'Fix HTTP redirect — 761 clicks going to wrong URL', how:'Shopify → Settings → Domains → Redirect all traffic to primary domain'},
              {id:'t2', text:'Fix Relaxers collection meta title — 37,671 impressions at 0.5% CTR', how:'Website SEO tab → Relaxers → Edit SEO → Push to Shopify'},
              {id:'t3', text:'Fix Hair Extensions collection meta title — 11,685 impressions at 1.1% CTR', how:'Website SEO tab → Hair Extensions → Edit SEO → Push to Shopify'},
              {id:'t4', text:'Add description to Relaxers collection — currently empty', how:'Website SEO tab → Relaxers → Generate description → Push'},
              {id:'t5', text:'Publish "cherish french curl braiding hair" content — 1,157 impressions, no good page', how:'Content Gaps tab → Generate & Publish'},
              {id:'t6', text:'Improve Cantu blog CTR — 21,123 impressions, only 0.5% CTR', how:'Shopify → Blog Posts → Cantu guide → Edit SEO title to include the main keyword'},
              {id:'t7', text:'Fix Casting Creme Gloss product meta title — 12,000 impressions, 0.6% CTR', how:'Shopify → Products → Casting Creme Gloss → Edit website SEO'},
              {id:'t8', text:'Publish content for top 5 Content Gaps', how:'Content Gaps tab → Generate & Publish for each keyword'},
              {id:'t9', text:'Add descriptions to Human Hair Wigs, Lace Front Wigs collections', how:'Website SEO tab → each collection → Push to Shopify'},
              {id:'t10', text:'Fix afro-kinky-braids collection — 9,340 impressions, 1.0% CTR', how:'Shopify → Collections → Afro Kinky Braids → Edit website SEO'},
            ].map(task => (
              <div key={task.id} onClick={()=>tick(task.id)} style={{
                display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',
                background:tasks[task.id]?T.greenBg:T.surface,
                border:`0.5px solid ${tasks[task.id]?T.greenBorder:T.border}`,
                borderRadius:8,marginBottom:6,cursor:'pointer',
              }}>
                <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${tasks[task.id]?T.green:T.border}`,background:tasks[task.id]?T.green:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                  {tasks[task.id] && <span style={{color:'#fff',fontSize:12,fontWeight:700}}>✓</span>}
                </div>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:tasks[task.id]?T.green:T.text,textDecoration:tasks[task.id]?'line-through':'none'}}>{task.text}</div>
                  <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{task.how}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </Shell>
    </>
  )
}
