import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const SHOPIFY_ADMIN = 'https://admin.shopify.com/store/cchairandbeauty'

const COLLECTIONS = [
  { name:'Relaxers & Texturisers', handle:'relaxers',                  impr:60000, clicks:312, pos:6.8,  ctr:0.5, hasDesc:false, priority:'critical',
    suggestedTitle:'Buy Hair Relaxers UK — ORS, Dark & Lovely, TCB | CC Hair and Beauty Leeds',
    suggestedDesc:'Shop hair relaxers and texturisers at CC Hair and Beauty Leeds. ORS, Dark & Lovely, TCB, Optimum and more. In store at Chapeltown LS7, Roundhay LS8 & City Centre or online with UK delivery.' },
  { name:'Edge Control',           handle:'edge-control',               impr:8900,  clicks:76,  pos:4.2,  ctr:0.9, hasDesc:false, priority:'critical',
    suggestedTitle:'Best Edge Control UK — Style Factor, Edge Booster | CC Hair and Beauty Leeds',
    suggestedDesc:'Buy the best edge control in the UK at CC Hair and Beauty. Style Factor Edge Booster, Got2b, Eco Styler and more. 3 Leeds stores or shop online at cchairandbeauty.com.' },
  { name:'Braiding Hair',          handle:'braiding-hair',              impr:18900, clicks:54,  pos:8.1,  ctr:0.3, hasDesc:true,  priority:'high',
    suggestedTitle:'Braiding Hair UK — Xpression, Freetress, Outre | CC Hair and Beauty Leeds',
    suggestedDesc:'Buy braiding hair in the UK at CC Hair and Beauty Leeds. Xpression, Freetress, Outre, Janet Collection and 1,000+ styles. In store at Chapeltown LS7, Roundhay LS8 and City Centre.' },
  { name:'Lace Front Wigs',        handle:'lace-front-wigs',            impr:9800,  clicks:24,  pos:11.2, ctr:0.2, hasDesc:false, priority:'high',
    suggestedTitle:'Lace Front Wigs UK — Human Hair & Synthetic | CC Hair and Beauty Leeds',
    suggestedDesc:'Buy lace front wigs at CC Hair and Beauty Leeds. Human hair and synthetic lace fronts in every style and colour. Try before you buy in store across our 3 Leeds branches.' },
  { name:'Human Hair Wigs',        handle:'human-hair-wigs',            impr:6700,  clicks:48,  pos:9.4,  ctr:0.7, hasDesc:false, priority:'high',
    suggestedTitle:'Human Hair Wigs UK — Lace Front & Full Wigs | CC Hair and Beauty Leeds',
    suggestedDesc:'Shop human hair wigs at CC Hair and Beauty Leeds. Brazilian, Peruvian and Indian remy hair wigs. Try in store at Chapeltown LS7, Roundhay LS8 or City Centre. UK delivery available.' },
  { name:'Synthetic Wigs',         handle:'synthetic-hair-wigs',        impr:4200,  clicks:31,  pos:7.8,  ctr:0.7, hasDesc:true,  priority:'medium',
    suggestedTitle:'Synthetic Wigs UK — Affordable Styles | CC Hair and Beauty Leeds',
    suggestedDesc:'Shop synthetic wigs at CC Hair and Beauty Leeds. Affordable styles in every colour and length. Available in store at Chapeltown, Roundhay and City Centre or online with UK delivery.' },
  { name:'Hair Extensions',        handle:'hair-extensions',            impr:3800,  clicks:28,  pos:9.1,  ctr:0.7, hasDesc:false, priority:'medium',
    suggestedTitle:'Hair Extensions UK — Clip In, Weave & More | CC Hair and Beauty Leeds',
    suggestedDesc:'Buy hair extensions at CC Hair and Beauty Leeds. Clip in, weave, tape and bonded extensions. Human hair and synthetic options available in store or online with UK delivery.' },
  { name:'Natural Hair Products',  handle:'moisturisers',               impr:2900,  clicks:19,  pos:12.4, ctr:0.7, hasDesc:false, priority:'medium',
    suggestedTitle:'Natural Hair Products UK — Moisturisers & Treatments | CC Hair and Beauty Leeds',
    suggestedDesc:'Shop natural hair products at CC Hair and Beauty Leeds. Moisturisers, deep conditioners and treatments for natural afro hair. Available in store or online at cchairandbeauty.com.' },
  { name:'Leave In Conditioner',   handle:'leavein-conditioner-hair-care', impr:2100, clicks:15, pos:8.9, ctr:0.7, hasDesc:false, priority:'medium',
    suggestedTitle:'Leave In Conditioner UK — Best Products for Afro Hair | CC Hair and Beauty Leeds',
    suggestedDesc:'Buy leave in conditioner at CC Hair and Beauty Leeds. Best leave in conditioners for afro, natural and relaxed hair. Shop in store or online at cchairandbeauty.com.' },
  { name:'Hair Gels',              handle:'hair-styling-gels',          impr:1890,  clicks:14,  pos:11.8, ctr:0.7, hasDesc:true,  priority:'low',
    suggestedTitle:'Hair Gels UK — Eco Styler, Got2b & More | CC Hair and Beauty Leeds',
    suggestedDesc:'Buy hair gels at CC Hair and Beauty Leeds. Eco Styler, Got2b, Murray\'s and more. Perfect for slick edges, twist outs and sleek styles. Shop in 3 Leeds stores or online.' },
]

// Top pages from Search Console with friendly names
const TOP_PAGES = [
  { url:'/', name:'Homepage',                         clicks:1553, issue:'Title missing "Leeds" — add location keyword', fixUrl:`${SHOPIFY_ADMIN}/online_store/preferences` },
  { url:'/collections/relaxers', name:'Relaxers Collection',   clicks:198,  issue:'Meta title is just "Relaxers" — no brand or location', fixUrl:`${SHOPIFY_ADMIN}/collections` },
  { url:'http://www.cchairandbeauty.com/', name:'HTTP Homepage (redirect issue)', clicks:773, issue:'HTTP version indexed — set up 301 redirect to HTTPS', fixUrl:`${SHOPIFY_ADMIN}/domains` },
  { url:'https://www.cchairandbeauty.com/', name:'HTTPS Homepage (canonical)',    clicks:282, issue:'Duplicate with / — consolidate canonical URL', fixUrl:`${SHOPIFY_ADMIN}/online_store/preferences` },
  { url:'/collections/hair-extensions', name:'Hair Extensions Collection', clicks:129, issue:'Meta title needs brand + location keywords', fixUrl:`${SHOPIFY_ADMIN}/collections` },
  { url:'/products/cherish-spiral-french-curl-3x-braid-pre-stretched-22', name:'Cherish Spiral Braid Product', clicks:149, issue:'Good traffic — check meta description is set', fixUrl:`${SHOPIFY_ADMIN}/products` },
  { url:'/blogs/cantu-product-blog/the-ultimate-guide-to-cantu-hair-care-products-for-every-hair-type', name:'Cantu Hair Care Guide Blog', clicks:113, issue:'Blog driving traffic — add internal links to Cantu products', fixUrl:`${SHOPIFY_ADMIN}/blogs` },
  { url:'/collections/afro-kinky-braids', name:'Afro Kinky Braids Collection', clicks:90, issue:'Meta title needs brand + location keywords', fixUrl:`${SHOPIFY_ADMIN}/collections` },
  { url:'/collections/human-hair-wigs', name:'Human Hair Wigs Collection', clicks:67, issue:'Meta title needs brand + location keywords', fixUrl:`${SHOPIFY_ADMIN}/collections` },
  { url:'/products/got2b-get-fresh-mist-150ml', name:'Got2b Fresh Mist Product', clicks:53, issue:'Good product traffic — ensure meta description set', fixUrl:`${SHOPIFY_ADMIN}/products` },
  { url:'/products/casting-creme-gloss-semi-permanent-hair-dye', name:'Casting Creme Gloss Hair Dye', clicks:78, issue:'High traffic product — add discount code COLOUR10 to meta desc', fixUrl:`${SHOPIFY_ADMIN}/products` },
]

const PRIORITY_COLORS = { critical:'#cf222e', high:'#9a6700', medium:'#0969da', low:'#57606a' }
const PRIORITY_BG = { critical:'#fff0f0', high:'#fff8e1', medium:'#ddf4ff', low:'#f6f8fa' }

export default function WebsiteSEO() {
  const [tab, setTab] = useState('Collections')
  const [editing, setEditing] = useState({})
  const [pushing, setPushing] = useState({})
  const [pushed, setPushed] = useState({})
  const [errors, setErrors] = useState({})
  const [editValues, setEditValues] = useState({})
  const [shopifyCollections, setShopifyCollections] = useState({}) // handle -> {id, adminUrl}
  const [loadingCollections, setLoadingCollections] = useState(true)

  useEffect(() => {
    async function loadCollections() {
      try {
        const r = await fetch('/api/shopify-collections-search')
        const d = await r.json()
        if (d.ok) {
          // Build handle -> collection map
          const map = {}
          d.collections.forEach(c => { map[c.handle] = c })
          setShopifyCollections(map)
        }
      } catch(e) { console.error('Failed to load collections:', e) }
      setLoadingCollections(false)
    }
    loadCollections()
  }, [])

  function getAdminUrl(col) {
    const live = shopifyCollections[col.handle]
    if (live) return live.adminUrl
    // Fallback — direct collections list
    return 'https://admin.shopify.com/store/cchairandbeauty/collections'
  }

  function startEdit(col) {
    setEditValues(v => ({
      ...v,
      [col.handle]: {
        title: v[col.handle]?.title ?? col.suggestedTitle,
        desc:  v[col.handle]?.desc  ?? col.suggestedDesc,
      }
    }))
    setEditing(e => ({...e, [col.handle]: true}))
  }

  async function pushToShopify(col) {
    const vals = editValues[col.handle] || { title: col.suggestedTitle, desc: col.suggestedDesc }
    const liveCol = shopifyCollections[col.handle]
    setPushing(p => ({...p, [col.handle]: true}))
    setErrors(e => ({...e, [col.handle]: null}))
    try {
      const r = await fetch('/api/update-collection-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: col.handle, collectionId: liveCol?.id, metaTitle: vals.title, metaDesc: vals.desc })
      })
      const d = await r.json()
      if (d.ok) {
        setPushed(p => ({...p, [col.handle]: true}))
        setEditing(e => ({...e, [col.handle]: false}))
      } else {
        setErrors(e => ({...e, [col.handle]: d.error}))
      }
    } catch(e) {
      setErrors(prev => ({...prev, [col.handle]: e.message}))
    }
    setPushing(p => ({...p, [col.handle]: false}))
  }

  const TABS = ['Collections', 'Top Pages', 'Tasks']

  return (
    <>
      <Head><title>Website SEO — CC Intelligence</title></Head>
      <Shell title="Website SEO" subtitle="Fix collection & page SEO · push directly to Shopify">

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:16,borderBottom:`1px solid ${T.border}`,paddingBottom:0}}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'7px 16px',fontSize:12,fontWeight:600,border:'none',background:'none',
              borderBottom: tab===t ? `2px solid ${T.blue}` : '2px solid transparent',
              color: tab===t ? T.blue : T.textMuted, cursor:'pointer',
            }}>{t}</button>
          ))}
        </div>

        {/* COLLECTIONS TAB */}
        {tab === 'Collections' && (
          <div>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>
              Red = fix today. Click <strong>Edit SEO</strong> to review and edit the suggested title/description, then <strong>Push to Shopify</strong> to apply in one click.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,marginBottom:8,padding:'4px 8px',background:T.surface,borderRadius:6,border:`0.5px solid ${T.border}`,fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase'}}>
              <div>Collection</div><div>Search Data</div><div>Actions</div>
            </div>
            {COLLECTIONS.map(col => {
              const isPushed = pushed[col.handle]
              const isEditing = editing[col.handle]
              const isPushing = pushing[col.handle]
              const err = errors[col.handle]
              const vals = editValues[col.handle] || { title: col.suggestedTitle, desc: col.suggestedDesc }
              return (
                <div key={col.handle} style={{
                  background: isPushed ? '#dafbe1' : PRIORITY_BG[col.priority],
                  border:`1px solid ${isPushed?'#1a7f37':PRIORITY_COLORS[col.priority]}30`,
                  borderRadius:8, marginBottom:8, overflow:'hidden'
                }}>
                  {/* Header row */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,padding:'10px 14px',alignItems:'center'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:4,background:PRIORITY_COLORS[col.priority],color:'#fff',textTransform:'uppercase',flexShrink:0}}>
                        {col.priority}
                      </span>
                      <span style={{fontSize:13,fontWeight:700,color:T.text}}>{col.name}</span>
                      {!loadingCollections && !shopifyCollections[col.handle] && (
                        <span style={{fontSize:10,color:'#cf222e',fontWeight:600}}>⚠ Handle not found in Shopify — check handle</span>
                      )}
                      <span style={{fontSize:10,color:T.textMuted}}>
                        {col.impr.toLocaleString()} impr · {col.clicks} clicks · pos {col.pos} · CTR {col.ctr}%
                      </span>
                      {!col.hasDesc && <span style={{fontSize:10,color:'#cf222e',fontWeight:600}}>⚠ No description</span>}
                    </div>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      {isPushed ? (
                        <span style={{fontSize:11,color:'#1a7f37',fontWeight:700}}>✓ Updated in Shopify</span>
                      ) : (
                        <>
                          {!isEditing && (
                            <button onClick={()=>startEdit(col)}
                              style={{padding:'5px 12px',fontSize:11,fontWeight:600,background:T.blue,color:'#fff',border:'none',borderRadius:6,cursor:'pointer'}}>
                              ✏️ Edit SEO
                            </button>
                          )}
                          {isEditing && (
                            <button onClick={()=>pushToShopify(col)} disabled={isPushing}
                              style={{padding:'5px 14px',fontSize:11,fontWeight:700,background:isPushing?T.border:'#1a7f37',color:'#fff',border:'none',borderRadius:6,cursor:'pointer'}}>
                              {isPushing ? '⟳ Pushing...' : '🚀 Push to Shopify'}
                            </button>
                          )}
                          <a href={getAdminUrl(col)} target="_blank" rel="noreferrer"
                            style={{padding:'5px 10px',fontSize:11,color:T.blue,background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:6,textDecoration:'none'}}>
                            {loadingCollections ? 'Loading...' : shopifyCollections[col.handle] ? 'View in Shopify →' : '⚠ Not found'}
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit panel */}
                  {isEditing && (
                    <div style={{padding:'0 14px 14px',borderTop:`0.5px solid ${T.border}`}}>
                      {err && <div style={{fontSize:11,color:'#cf222e',margin:'8px 0',padding:'6px 10px',background:'#fff0f0',borderRadius:5}}>{err}</div>}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:10}}>
                        <div>
                          <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>
                            SEO Title <span style={{color: vals.title.length > 70 ? '#cf222e' : '#1a7f37'}}>{vals.title.length}/70 chars</span>
                          </div>
                          <textarea value={vals.title} rows={2}
                            onChange={e => setEditValues(v => ({...v, [col.handle]: {...vals, title: e.target.value}}))}
                            style={{width:'100%',padding:'7px 9px',fontSize:12,border:`1px solid ${T.border}`,borderRadius:6,background:T.bg,color:T.text,resize:'vertical',lineHeight:1.4}}/>
                        </div>
                        <div>
                          <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>
                            Meta Description <span style={{color: vals.desc.length > 160 ? '#cf222e' : '#1a7f37'}}>{vals.desc.length}/160 chars</span>
                          </div>
                          <textarea value={vals.desc} rows={2}
                            onChange={e => setEditValues(v => ({...v, [col.handle]: {...vals, desc: e.target.value}}))}
                            style={{width:'100%',padding:'7px 9px',fontSize:12,border:`1px solid ${T.border}`,borderRadius:6,background:T.bg,color:T.text,resize:'vertical',lineHeight:1.4}}/>
                        </div>
                      </div>
                      <div style={{fontSize:11,color:T.textMuted,marginTop:8}}>
                        📱 Google preview: <em style={{color:T.blue}}>{vals.title}</em> — {vals.desc.slice(0,80)}...
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* TOP PAGES TAB */}
        {tab === 'Top Pages' && (
          <div>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>
              Pages getting the most traffic from Google. Click <strong>Fix in Shopify →</strong> to go directly to the right place in Shopify admin to fix the issue.
            </div>
            {TOP_PAGES.map((page, i) => (
              <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px',marginBottom:6,display:'grid',gridTemplateColumns:'180px 1fr auto',gap:12,alignItems:'center'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:2}}>{page.name}</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{page.url.replace('https://www.cchairandbeauty.com','').slice(0,40)}</div>
                  <div style={{fontSize:11,fontWeight:700,color:T.green,marginTop:2}}>{page.clicks.toLocaleString()} clicks</div>
                </div>
                <div style={{fontSize:11,color:'#9a6700',background:'#fff8e1',padding:'5px 9px',borderRadius:5,border:'1px solid #f0c040'}}>
                  ⚠️ {page.issue}
                </div>
                <a href={page.fixUrl} target="_blank" rel="noreferrer"
                  style={{padding:'6px 12px',fontSize:11,fontWeight:600,background:T.blue,color:'#fff',borderRadius:6,textDecoration:'none',whiteSpace:'nowrap'}}>
                  Fix in Shopify →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === 'Tasks' && (
          <div>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>Quick wins — fix these in order of priority.</div>
            {[
              { text:'Fix Relaxers meta title — 60k+ impressions, 0.5% CTR is critical', link:`${SHOPIFY_ADMIN}/collections`, priority:'critical' },
              { text:'Fix Edge Control meta title — 4.2 avg position, should be 5%+ CTR', link:`${SHOPIFY_ADMIN}/collections`, priority:'critical' },
              { text:'Add description to Relaxers collection — no description currently', link:`${SHOPIFY_ADMIN}/collections`, priority:'critical' },
              { text:'Fix Braiding Hair meta title — 18.9k impressions, 0.3% CTR is very low', link:`${SHOPIFY_ADMIN}/collections`, priority:'high' },
              { text:'Fix Lace Front Wigs meta title — 9.8k impressions, 0.2% CTR is the lowest', link:`${SHOPIFY_ADMIN}/collections`, priority:'high' },
              { text:'Redirect HTTP homepage to HTTPS — 773 clicks going to wrong URL', link:`${SHOPIFY_ADMIN}/domains`, priority:'high' },
              { text:'Fix homepage meta title — missing Leeds and "and" instead of &', link:`${SHOPIFY_ADMIN}/online_store/preferences`, priority:'medium' },
              { text:'Add descriptions to Hair Extensions, Human Hair Wigs collections', link:`${SHOPIFY_ADMIN}/collections`, priority:'medium' },
            ].map((task, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:7,marginBottom:5}}>
                <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,background:PRIORITY_COLORS[task.priority],color:'#fff',textTransform:'uppercase',flexShrink:0}}>{task.priority}</span>
                <span style={{fontSize:12,color:T.text,flex:1}}>{task.text}</span>
                <a href={task.link} target="_blank" rel="noreferrer"
                  style={{fontSize:11,color:T.blue,textDecoration:'none',fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>Fix →</a>
              </div>
            ))}
          </div>
        )}

      </Shell>
    </>
  )
}
