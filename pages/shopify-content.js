import Head from 'next/head'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8',
}

const CONTENT_TYPES = [
  { id:'blog',   icon:'✍️', label:'Blog Post',         desc:'400-word SEO blog post' },
  { id:'gbp',    icon:'📍', label:'GBP Post',          desc:'Google Business Profile post' },
  { id:'ad',     icon:'📊', label:'Ad Copy',           desc:'Google Ads description (90 chars)' },
  { id:'social', icon:'📸', label:'Social Post',       desc:'Instagram caption + hashtags' },
  { id:'meta',   icon:'🔍', label:'Meta Description',  desc:'SEO meta description (155 chars)' },
]

export default function ShopifyContentPage() {
  const [type, setType]           = useState('products')
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [generating, setGenerating] = useState(null)
  const [content, setContent]     = useState({})
  const [copied, setCopied]       = useState({})

  useEffect(() => {
    setLoading(true)
    setSelected(null)
    setSearch('')
    fetch(`/api/shopify-products?type=${type}&limit=30`)
      .then(r => r.json())
      .then(d => { setItems(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [type])

  async function generate(item, ctId) {
    const key = `${item.id}_${ctId}`
    setGenerating(key)
    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product:    type === 'products'    ? item : null,
          collection: type === 'collections' ? item.title : null,
          contentType: ctId,
        }),
      })
      const d = await res.json()
      setContent(p => ({ ...p, [key]: d.content || '' }))
    } catch(e) {}
    setGenerating(null)
  }

  async function generateAll(item) {
    for (const ct of CONTENT_TYPES) {
      await generate(item, ct.id)
    }
  }

  function copy(key, text) {
    navigator.clipboard.writeText(text)
    setCopied(p => ({ ...p, [key]: true }))
    setTimeout(() => setCopied(p => ({ ...p, [key]: false })), 2000)
  }

  const filtered = items.filter(i =>
    (i.title || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Head>
        <title>Shopify Content — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button,input{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      {/* Header */}
      <div style={{background:C.surface,borderBottom:'1px solid '+C.border,padding:'0 20px',display:'flex',alignItems:'center',height:52,gap:16,position:'sticky',top:0,zIndex:100}}>
        <Link href="/" style={{color:C.text2,textDecoration:'none',fontSize:13}}>← Dashboard</Link>
        <span style={{color:C.border}}>|</span>
        <span style={{fontWeight:700,fontSize:14}}>🛍 Shopify — 1-Click Content Creator</span>
        <span style={{background:'rgba(99,102,241,.15)',color:C.accent2,padding:'2px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>Powered by Claude AI</span>
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          <button onClick={() => setType('products')} style={{padding:'5px 14px',borderRadius:6,border:type==='products'?'none':'1px solid '+C.border,background:type==='products'?C.accent:C.surface2,color:C.text,cursor:'pointer',fontSize:12}}>
            📦 Products
          </button>
          <button onClick={() => setType('collections')} style={{padding:'5px 14px',borderRadius:6,border:type==='collections'?'none':'1px solid '+C.border,background:type==='collections'?C.accent:C.surface2,color:C.text,cursor:'pointer',fontSize:12}}>
            📂 Collections
          </button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',height:'calc(100vh - 52px)'}}>

        {/* LEFT — product/collection list */}
        <div style={{borderRight:'1px solid '+C.border,display:'flex',flexDirection:'column',background:C.surface}}>
          <div style={{padding:12,borderBottom:'1px solid '+C.border}}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${type}...`}
              style={{width:'100%',background:C.surface2,border:'1px solid '+C.border,borderRadius:8,color:C.text,fontSize:13,padding:'8px 12px',outline:'none'}}
            />
          </div>
          <div style={{flex:1,overflowY:'auto',padding:8}}>
            {loading && (
              <div style={{padding:20,textAlign:'center',color:C.text3}}>Loading from Shopify...</div>
            )}
            {!loading && filtered.length === 0 && (
              <div style={{padding:20,textAlign:'center',color:C.text3}}>No {type} found</div>
            )}
            {filtered.map(item => {
              const isSelected = selected?.id === item.id
              const hasContent = CONTENT_TYPES.some(ct => content[`${item.id}_${ct.id}`])
              return (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{
                    display:'flex', gap:10, alignItems:'center', padding:'8px 10px',
                    borderRadius:8, cursor:'pointer', marginBottom:2,
                    background: isSelected ? C.surface2 : 'transparent',
                    border: '1px solid '+(isSelected ? C.accent+'50' : 'transparent'),
                    transition:'all .12s',
                  }}
                >
                  {item.images?.[0]?.src
                    ? <img src={item.images[0].src} alt="" style={{width:38,height:38,borderRadius:6,objectFit:'cover',flexShrink:0}}/>
                    : <div style={{width:38,height:38,borderRadius:6,background:C.surface2,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                        {type==='products'?'📦':'📂'}
                      </div>
                  }
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:1}}>{item.product_type || item.handle}</div>
                  </div>
                  {hasContent && <div style={{width:6,height:6,borderRadius:'50%',background:C.green,flexShrink:0}}/>}
                </div>
              )
            })}
          </div>
          <div style={{padding:12,borderTop:'1px solid '+C.border,fontSize:12,color:C.text3,textAlign:'center'}}>
            {filtered.length} {type} loaded · <a href="https://cchairandbeauty.myshopify.com/admin" target="_blank" rel="noreferrer" style={{color:C.accent2,textDecoration:'none'}}>Open Shopify Admin →</a>
          </div>
        </div>

        {/* RIGHT — content generator */}
        <div style={{overflowY:'auto',padding:20}}>
          {!selected ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:16,color:C.text3}}>
              <div style={{fontSize:56}}>🛍</div>
              <div style={{fontSize:18,fontWeight:600,color:C.text2}}>Select a {type === 'products' ? 'product' : 'collection'}</div>
              <div style={{fontSize:13,maxWidth:360,textAlign:'center',lineHeight:1.6}}>
                Choose from the left panel to instantly generate blog posts, GBP posts, ad copy, social captions and meta descriptions
              </div>
            </div>
          ) : (
            <div>
              {/* Selected item header */}
              <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16,marginBottom:20,display:'flex',gap:14,alignItems:'center'}}>
                {selected.images?.[0]?.src
                  ? <img src={selected.images[0].src} alt="" style={{width:64,height:64,borderRadius:8,objectFit:'cover',flexShrink:0}}/>
                  : <div style={{width:64,height:64,borderRadius:8,background:C.surface2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>
                      {type==='products'?'📦':'📂'}
                    </div>
                }
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:18,color:C.text,marginBottom:4}}>{selected.title}</div>
                  <div style={{color:C.text3,fontSize:13}}>
                    {selected.product_type || 'Collection'} · /{selected.handle}
                    {selected.tags && <span style={{marginLeft:8,color:C.text3}}>· {selected.tags.split(',').slice(0,3).join(', ')}</span>}
                  </div>
                </div>
                <button
                  onClick={() => generateAll(selected)}
                  disabled={!!generating}
                  style={{padding:'9px 18px',borderRadius:8,border:'none',background:generating?C.surface2:C.green,color:generating?C.text3:'#000',fontWeight:700,fontSize:13,cursor:generating?'default':'pointer',flexShrink:0}}
                >
                  {generating ? '⟳ Generating...' : '⚡ Generate All 5'}
                </button>
              </div>

              {/* Content type cards */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
                {CONTENT_TYPES.map(ct => {
                  const key      = `${selected.id}_${ct.id}`
                  const result   = content[key]
                  const isGen    = generating === key
                  const isCopied = copied[key]

                  return (
                    <div key={ct.id} style={{background:C.surface,border:'1px solid '+(result?C.accent+'40':C.border),borderRadius:12,padding:16,display:'flex',flexDirection:'column',gap:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                        <div>
                          <div style={{fontWeight:600,fontSize:14}}>{ct.icon} {ct.label}</div>
                          <div style={{color:C.text3,fontSize:12,marginTop:2}}>{ct.desc}</div>
                        </div>
                        {result && (
                          <span style={{background:C.green+'20',color:C.green,padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:700}}>READY</span>
                        )}
                      </div>

                      {result ? (
                        <>
                          <div style={{background:C.surface2,borderRadius:8,padding:10,fontSize:13,color:C.text,lineHeight:1.6,maxHeight:130,overflowY:'auto',flex:1}}>
                            {result}
                          </div>
                          <div style={{display:'flex',gap:6}}>
                            <button
                              onClick={() => copy(key, result)}
                              style={{flex:1,padding:'7px',borderRadius:6,border:'none',background:isCopied?C.green:C.accent,color:isCopied?'#000':'#fff',fontWeight:600,fontSize:12,cursor:'pointer'}}
                            >
                              {isCopied ? '✓ Copied!' : '📋 Copy'}
                            </button>
                            <button
                              onClick={() => generate(selected, ct.id)}
                              disabled={isGen}
                              style={{padding:'7px 12px',borderRadius:6,border:'1px solid '+C.border,background:C.surface2,color:C.text2,cursor:'pointer',fontSize:12}}
                            >
                              {isGen ? '...' : '↺'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => generate(selected, ct.id)}
                          disabled={isGen}
                          style={{padding:'10px',borderRadius:8,border:'none',background:isGen?C.surface2:C.accent,color:isGen?C.text3:'#fff',fontWeight:600,fontSize:13,cursor:isGen?'default':'pointer',marginTop:'auto'}}
                        >
                          {isGen ? '⟳ Generating...' : '✨ Generate'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
