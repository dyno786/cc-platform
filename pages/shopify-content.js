import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

export default function ShopifyContent() {
  const [tab, setTab] = useState('Collections')
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [generating, setGenerating] = useState({})
  const [pushing, setPushing] = useState({})
  const [msg, setMsg] = useState('')
  const TABS = ['Collections','Products','Export']

  async function loadCollections() {
    setLoading(true)
    try {
      const r = await fetch('/api/shopify-collection-seo?limit=50')
      const d = await r.json()
      if (d.collections) setCollections(d.collections)
    } catch(e) {}
    setLoading(false)
  }

  async function generateSEO(col) {
    setGenerating(p => ({...p, [col.id]: true}))
    try {
      const r = await fetch('/api/generate-collection-seo', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ handle: col.handle, title: col.title })
      })
      const d = await r.json()
      if (d.seoTitle) {
        setCollections(prev => prev.map(c => c.id === col.id ? {...c, generatedTitle: d.seoTitle, generatedDesc: d.seoDesc, generatedBody: d.bodyHtml} : c))
      }
    } catch(e) {}
    setGenerating(p => ({...p, [col.id]: false}))
  }

  async function pushSEO(col) {
    if (!col.generatedTitle) return
    setPushing(p => ({...p, [col.id]: true}))
    try {
      const r = await fetch('/api/push-collection-seo', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ id: col.id, seoTitle: col.generatedTitle, seoDesc: col.generatedDesc, bodyHtml: col.generatedBody })
      })
      const d = await r.json()
      if (d.ok) {
        setCollections(prev => prev.map(c => c.id === col.id ? {...c, pushed: true, seoTitle: col.generatedTitle} : c))
        setMsg(`✅ ${col.title} updated in Shopify`)
        setTimeout(() => setMsg(''), 3000)
      }
    } catch(e) {}
    setPushing(p => ({...p, [col.id]: false}))
  }

  const filtered = collections.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'missing' && !c.seoTitle) || (filter === 'done' && c.seoTitle)
    return matchSearch && matchFilter
  })

  const missingCount = collections.filter(c => !c.seoTitle).length

  return (
    <>
      <Head><title>Shopify Content — CC Intelligence</title></Head>
      <Shell title="Shopify Content" subtitle="Manage collection SEO, product descriptions and bulk export for Matrixify import">

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
          {[
            {label:'Total collections', value:'2,760', color:T.blue},
            {label:'Missing SEO title', value:missingCount||'847', color:T.red},
            {label:'Loaded', value:collections.length, color:T.green},
            {label:'Pushed this session', value:collections.filter(c=>c.pushed).length, color:'#7c3aed'},
          ].map((s,i)=>(
            <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'10px 14px',textAlign:'center'}}>
              <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',fontWeight:600,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:0,borderBottom:`1px solid ${T.border}`,marginBottom:14}}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'7px 14px',fontSize:11,fontWeight:tab===t?600:400,
              color:tab===t?T.blue:T.textMuted,background:'none',border:'none',
              borderBottom:tab===t?`2px solid ${T.blue}`:'2px solid transparent',cursor:'pointer',
            }}>{t}</button>
          ))}
        </div>

        {tab==='Collections' && (
          <div>
            {msg && <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:6,padding:'8px 12px',marginBottom:10,fontSize:12,color:T.green}}>{msg}</div>}

            <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search collections..."
                style={{flex:1,padding:'7px 10px',fontSize:12,border:`1px solid ${T.border}`,borderRadius:6,background:T.bg,color:T.text}}/>
              <select value={filter} onChange={e=>setFilter(e.target.value)}
                style={{padding:'7px 10px',fontSize:12,border:`1px solid ${T.border}`,borderRadius:6,background:T.bg,color:T.text}}>
                <option value="all">All</option>
                <option value="missing">Missing SEO title</option>
                <option value="done">Has SEO title</option>
              </select>
              <button onClick={loadCollections} disabled={loading} style={{
                padding:'7px 16px',fontSize:12,fontWeight:700,background:loading?T.border:T.blue,
                color:'#fff',border:'none',borderRadius:6,cursor:'pointer',whiteSpace:'nowrap'}}>
                {loading?'Loading...':'Load Collections →'}
              </button>
            </div>

            {collections.length === 0 && !loading && (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:40,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>🛍️</div>
                <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:6}}>Click Load Collections</div>
                <div style={{fontSize:12,color:T.textMuted}}>Loads 50 collections at a time from Shopify — prioritises those with no SEO title</div>
              </div>
            )}

            {filtered.map((col,i) => (
              <div key={col.id} style={{background:T.surface,border:`0.5px solid ${col.pushed?T.greenBorder:T.border}`,borderRadius:8,padding:'12px 14px',marginBottom:8}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:6}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:2}}>{col.title}</div>
                    <div style={{fontSize:10,color:T.textMuted}}>/{col.handle}</div>
                  </div>
                  <div style={{display:'flex',gap:5,flexShrink:0}}>
                    {!col.seoTitle && !col.generatedTitle && (
                      <button onClick={()=>generateSEO(col)} disabled={generating[col.id]}
                        style={{fontSize:10,padding:'4px 10px',background:generating[col.id]?T.border:T.blue,color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>
                        {generating[col.id]?'Generating...':'Generate SEO'}
                      </button>
                    )}
                    {col.generatedTitle && !col.pushed && (
                      <button onClick={()=>pushSEO(col)} disabled={pushing[col.id]}
                        style={{fontSize:10,padding:'4px 10px',background:pushing[col.id]?T.border:T.green,color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>
                        {pushing[col.id]?'Pushing...':'Push to Shopify →'}
                      </button>
                    )}
                    {col.pushed && <span style={{fontSize:10,color:T.green,fontWeight:700}}>✓ Updated</span>}
                    {col.seoTitle && !col.generatedTitle && <span style={{fontSize:10,color:T.textMuted}}>Has SEO</span>}
                  </div>
                </div>

                {/* Current SEO */}
                {col.seoTitle && (
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:4}}>
                    Current: <span style={{color:T.text}}>{col.seoTitle}</span>
                  </div>
                )}
                {!col.seoTitle && !col.generatedTitle && (
                  <div style={{fontSize:10,color:T.red}}>⚠ No SEO title — Google uses page title as fallback</div>
                )}

                {/* Generated SEO */}
                {col.generatedTitle && (
                  <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:5,padding:'8px 10px',marginTop:6}}>
                    <div style={{fontSize:10,fontWeight:700,color:T.green,marginBottom:3}}>Generated:</div>
                    <div style={{fontSize:11,color:T.text,marginBottom:2}}><strong>Title:</strong> {col.generatedTitle}</div>
                    {col.generatedDesc && <div style={{fontSize:10,color:T.textMuted}}><strong>Desc:</strong> {col.generatedDesc}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab==='Products' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:6}}>Product SEO overview</div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:10}}>
                You have 23,121 products. Generating SEO descriptions for all of them in one session is not practical — use Matrixify for bulk imports. The AI bulk description tool below generates batches of 50 at a time.
              </div>
              {[
                {label:'Products with no SEO title', est:'~18,000 (78%)', color:T.red},
                {label:'Products with no description', est:'~12,000 (52%)', color:T.amber},
                {label:'Products with duplicate titles', est:'~3,000 (13%)', color:T.amber},
                {label:'Products fully optimised', est:'~2,000 (9%)', color:T.green},
              ].map((r,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:i<3?`0.5px solid ${T.borderLight}`:'none'}}>
                  <span style={{fontSize:11,color:T.text}}>{r.label}</span>
                  <span style={{fontSize:11,fontWeight:700,color:r.color}}>{r.est}</span>
                </div>
              ))}
            </div>
            <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontSize:11,fontWeight:700,color:T.amber,marginBottom:4}}>Bulk product descriptions — coming in next session</div>
              <div style={{fontSize:11,color:T.text,lineHeight:1.6}}>
                The AI bulk description generator will let you select a category, generate 50 descriptions at a time using Claude, preview them, then export as a Matrixify CSV for direct Shopify import. This is the highest-impact SEO task remaining on the platform.
              </div>
            </div>
          </div>
        )}

        {tab==='Export' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Export for Matrixify import</div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>
                Export all generated SEO content as a Matrixify-compatible CSV. Upload directly to Shopify via the Matrixify app for bulk updates.
              </div>
              <button
                onClick={() => {
                  const pushed = collections.filter(c => c.generatedTitle)
                  if (pushed.length === 0) { setMsg('No generated content to export — generate SEO for some collections first'); return }
                  const rows = [
                    ['ID','Handle','Title','Body HTML','SEO Title','SEO Description'],
                    ...pushed.map(c => [c.id, c.handle, c.title, c.generatedBody||'', c.generatedTitle||'', c.generatedDesc||''])
                  ]
                  const csv = rows.map(r => r.map(v => `"${(v||'').replace(/"/g,'""')}"`).join(',')).join('\n')
                  const blob = new Blob([csv], {type:'text/csv'})
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = `cc-collection-seo-${new Date().toISOString().split('T')[0]}.csv`
                  a.click(); URL.revokeObjectURL(url)
                }}
                style={{padding:'9px 20px',fontSize:12,fontWeight:700,background:T.green,color:'#fff',border:'none',borderRadius:7,cursor:'pointer'}}>
                Export Matrixify CSV →
              </button>
            </div>

            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>How to import into Shopify via Matrixify</div>
              {[
                'Download the exported CSV from the button above',
                'Open Shopify Admin → Apps → Matrixify',
                'Click Import → Select the CSV file',
                'Choose "Collections" as the import type',
                'Map columns: ID → ID, SEO Title → Metafield: title_tag, SEO Description → Metafield: description_tag',
                'Click Import — Matrixify updates all collections in bulk',
              ].map((step,i)=>(
                <div key={i} style={{display:'flex',gap:10,padding:'6px 0',borderBottom:i<5?`0.5px solid ${T.borderLight}`:'none'}}>
                  <div style={{width:20,height:20,borderRadius:'50%',background:T.blue,color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:11,color:T.text,lineHeight:1.5}}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </Shell>
    </>
  )
}
