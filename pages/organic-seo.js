import Head from 'next/head'
import Nav from '../components/Nav'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8',
}

const KEYWORDS = [
  { query:'cc hair beauty',              clicks:1150, impressions:4200, position:1.2, change:'+0' },
  { query:'hair shop leeds',             clicks:220,  impressions:1800, position:3.1, change:'+2' },
  { query:'braiding hair leeds',         clicks:180,  impressions:760,  position:1.8, change:'+1' },
  { query:'wigs leeds',                  clicks:95,   impressions:890,  position:2.4, change:'+3' },
  { query:'natural hair products leeds', clicks:76,   impressions:540,  position:2.1, change:'+1' },
  { query:'afro hair shop leeds',        clicks:54,   impressions:420,  position:3.8, change:'-1' },
  { query:'hair extensions leeds',       clicks:43,   impressions:380,  position:6.2, change:'+3' },
  { query:'ors relaxer uk',              clicks:38,   impressions:290,  position:4.1, change:'+2' },
  { query:'cantu shea butter uk',        clicks:31,   impressions:240,  position:5.3, change:'0'  },
  { query:'mielle organics uk',          clicks:28,   impressions:210,  position:4.7, change:'+1' },
  { query:'edge control uk',             clicks:24,   impressions:180,  position:7.1, change:'+4' },
  { query:'hair relaxer leeds',          clicks:19,   impressions:160,  position:5.8, change:'0'  },
]

const BLOGS = [
  { title:'Best relaxers for natural hair in Leeds 2026',        status:'due',       priority:'high',   keyword:'relaxers leeds',          volume:320, notes:'High intent local buyers' },
  { title:'Where to buy braiding hair in Leeds — complete guide', status:'planned',   priority:'high',   keyword:'braiding hair leeds',     volume:280, notes:'High volume, low competition' },
  { title:'Mielle Organics Rosemary Oil — everything you need',   status:'drafted',   priority:'medium', keyword:'mielle rosemary oil uk',  volume:440, notes:'Trending product' },
  { title:'Top 10 ORS products available in Leeds',               status:'planned',   priority:'medium', keyword:'ors hair products',       volume:190, notes:'Brand + local combo' },
  { title:'Cantu vs SheaMoisture — which is right for your hair?',status:'planned',   priority:'medium', keyword:'cantu shea moisture',     volume:210, notes:'Comparison content ranks well' },
  { title:'CC Hair & Beauty store guide — hours, branches, info', status:'published', priority:'low',    keyword:'cc hair beauty leeds',    volume:1150, notes:'Done — monitor' },
  { title:'Best edge control products UK 2026',                   status:'planned',   priority:'medium', keyword:'edge control uk',         volume:180, notes:'Growing search trend' },
  { title:'Wigs for beginners — how to choose in Leeds',          status:'planned',   priority:'high',   keyword:'wigs leeds',              volume:290, notes:'High value products' },
]

const COLLECTIONS = [
  { name:'Wigs',              handle:'wigs',            score:62, priority:'high',   issues:['Meta title too short','Missing H1','No alt text on 3 images'] },
  { name:'Hair Dye & Colour', handle:'hair-dye-colour', score:71, priority:'high',   issues:['Meta description missing','Thin content under 200 words'] },
  { name:'Braiding Hair',     handle:'braiding-hair',   score:85, priority:'low',    issues:['Could add more keywords in description'] },
  { name:'Natural Hair Care', handle:'natural-hair',    score:58, priority:'urgent', issues:['Meta title missing brand name','Description needs rewrite','No internal links'] },
  { name:'Edge Control',      handle:'edge-control',    score:79, priority:'medium', issues:['Meta description too long (178 chars)'] },
  { name:'Wigs & Hairpieces', handle:'wigs-hairpieces', score:44, priority:'urgent', issues:['Possible duplicate of Wigs collection','Thin content','No unique keywords'] },
  { name:'Hair Extensions',   handle:'hair-extensions', score:68, priority:'medium', issues:['Missing H2 tags','Low word count'] },
  { name:'Relaxers',          handle:'relaxers',        score:74, priority:'medium', issues:['Could target more local keywords'] },
]

function scoreColor(s) {
  return s >= 80 ? C.green : s >= 60 ? C.amber : C.red
}

export default function OrganicSEOPage() {
  const [section, setSection] = useState('keywords')
  const [blogDone, setBlogDone] = useState({})
  const [fixing, setFixing] = useState(null)
  const [fixes, setFixes] = useState({})
  const [generating, setGenerating] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [showDraft, setShowDraft] = useState(null)
  const [copied, setCopied] = useState({})
  const [kSort, setKSort] = useState('clicks')

  async function generateFix(col) {
    setFixing(col.handle)
    try {
      const res = await fetch('/api/generate-content', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ collection: col.name, contentType:'meta' })
      })
      const d = await res.json()
      setFixes(p => ({ ...p, [col.handle]: d.content }))
    } catch(e) {}
    setFixing(null)
  }

  async function generateBlog(blog) {
    setGenerating(blog.title)
    try {
      const res = await fetch('/api/generate-content', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ product:{ title: blog.title, product_type:'blog post' }, contentType:'blog' })
      })
      const d = await res.json()
      setDrafts(p => ({ ...p, [blog.title]: d.content }))
      setShowDraft(blog.title)
    } catch(e) {}
    setGenerating(null)
  }

  function copy(key, text) {
    navigator.clipboard.writeText(text)
    setCopied(p => ({ ...p, [key]: true }))
    setTimeout(() => setCopied(p => ({ ...p, [key]: false })), 2000)
  }

  const sortedKeywords = [...KEYWORDS].sort((a, b) => b[kSort] - a[kSort])
  const statusColors = { due: C.red, planned: C.amber, drafted: C.blue, published: C.green }

  const SECTIONS = ['keywords','blog','collections']

  return (
    <>
      <Head>
        <title>Organic SEO — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button,input,select,textarea{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      <Nav/>

      <div style={{maxWidth:1300,margin:'0 auto',padding:20}}>

        {/* ── KEYWORDS ── */}
        {section === 'keywords' && (
          <div>
            <div style={{background:'rgba(59,130,246,.06)',border:'1px solid #3b82f630',borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:C.blue}}>
              ℹ️ Keyword data from Search Console. Full live sync available once OAuth flow is completed — showing last known data.
            </div>

            {/* Summary cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
              {[
                { label:'Total clicks',      val: KEYWORDS.reduce((s,k)=>s+k.clicks,0).toLocaleString(),      color:C.green },
                { label:'Total impressions', val: KEYWORDS.reduce((s,k)=>s+k.impressions,0).toLocaleString(), color:C.blue },
                { label:'Avg position',      val: (KEYWORDS.reduce((s,k)=>s+k.position,0)/KEYWORDS.length).toFixed(1), color:C.amber },
                { label:'Keywords tracked',  val: KEYWORDS.length,                                             color:C.text },
              ].map(m => (
                <div key={m.label} style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:14}}>
                  <div style={{fontSize:26,fontWeight:800,color:m.color}}>{m.val}</div>
                  <div style={{color:C.text2,fontSize:12,marginTop:4}}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Sort controls */}
            <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
              <span style={{color:C.text3,fontSize:12}}>Sort by:</span>
              {['clicks','impressions','position'].map(s => (
                <button key={s} onClick={() => setKSort(s)} style={{
                  padding:'4px 12px', borderRadius:6, fontSize:12, cursor:'pointer',
                  border: kSort===s ? 'none' : '1px solid '+C.border,
                  background: kSort===s ? C.accent : C.surface2,
                  color: C.text, textTransform:'capitalize',
                }}>{s}</button>
              ))}
            </div>

            {/* Keywords table */}
            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1.5fr',padding:'10px 16px',borderBottom:'1px solid '+C.border}}>
                {['Keyword','Clicks','Impressions','Position','Change','Bar'].map(h => (
                  <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:'.05em'}}>{h}</span>
                ))}
              </div>
              {sortedKeywords.map((k, i) => {
                const posColor = k.position <= 3 ? C.green : k.position <= 10 ? C.amber : C.red
                const chNum = parseInt(k.change)
                const chColor = chNum > 0 ? C.green : chNum < 0 ? C.red : C.text3
                return (
                  <div key={k.query} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1.5fr',padding:'11px 16px',borderBottom:i<sortedKeywords.length-1?'1px solid '+C.border:'none',alignItems:'center'}}>
                    <span style={{color:C.text,fontSize:13,fontWeight:500}}>{k.query}</span>
                    <span style={{color:C.green,fontWeight:700,fontSize:13}}>{k.clicks.toLocaleString()}</span>
                    <span style={{color:C.text2,fontSize:13}}>{k.impressions.toLocaleString()}</span>
                    <span style={{background:posColor+'20',color:posColor,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,display:'inline-block'}}>#{k.position.toFixed(1)}</span>
                    <span style={{color:chColor,fontWeight:600,fontSize:13}}>{chNum > 0 ? '↑ +'+k.change : chNum < 0 ? '↓ '+k.change : '—'}</span>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{flex:1,height:6,background:C.surface2,borderRadius:3,overflow:'hidden'}}>
                        <div style={{width:Math.min(k.clicks/1150*100,100)+'%',height:'100%',background:C.blue,borderRadius:3}}/>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── BLOG PIPELINE ── */}
        {section === 'blog' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3}}>Blog Pipeline — {BLOGS.length} posts</div>
              </div>
              <div style={{display:'flex',gap:6,fontSize:12}}>
                {['due','planned','drafted','published'].map(s => (
                  <span key={s} style={{background:statusColors[s]+'20',color:statusColors[s],padding:'3px 10px',borderRadius:99,fontWeight:600,textTransform:'capitalize'}}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {BLOGS.map((b, i) => {
                const sc = statusColors[b.status] || C.text3
                const isDone = blogDone[b.title]
                const hasDraft = drafts[b.title]
                return (
                  <div key={i}>
                    <div style={{background:C.surface,border:'1px solid '+(b.status==='due'?C.red+'40':C.border),borderRadius:12,padding:16,display:'flex',alignItems:'center',gap:14}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
                          <span style={{fontWeight:600,color:isDone?C.text3:C.text,fontSize:14,textDecoration:isDone?'line-through':'none'}}>{b.title}</span>
                          <span style={{background:sc+'20',color:sc,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,textTransform:'uppercase'}}>{b.status}</span>
                          {b.priority === 'high' && !isDone && (
                            <span style={{background:'rgba(239,68,68,.15)',color:C.red,padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:700}}>HIGH PRIORITY</span>
                          )}
                        </div>
                        <div style={{display:'flex',gap:16,color:C.text3,fontSize:12}}>
                          <span>🔑 Target: <strong style={{color:C.text2}}>{b.keyword}</strong></span>
                          <span>📊 Vol: <strong style={{color:C.blue}}>{b.volume}/mo</strong></span>
                          <span>{b.notes}</span>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:8,flexShrink:0}}>
                        {b.status !== 'published' && (
                          <button
                            onClick={() => hasDraft ? setShowDraft(showDraft===b.title?null:b.title) : generateBlog(b)}
                            disabled={generating===b.title}
                            style={{padding:'7px 14px',borderRadius:7,border:'none',background:hasDraft?C.green:C.accent,color:hasDraft?'#000':'#fff',fontWeight:600,fontSize:12,cursor:'pointer'}}
                          >
                            {generating===b.title ? '⟳ Writing...' : hasDraft ? (showDraft===b.title?'Hide draft':'Show draft') : '✨ Draft with AI'}
                          </button>
                        )}
                        <button
                          onClick={() => setBlogDone(p => ({ ...p, [b.title]: !p[b.title] }))}
                          style={{padding:'7px 12px',borderRadius:7,border:'1px solid '+C.border,background:isDone?C.green+'20':C.surface2,color:isDone?C.green:C.text2,fontWeight:600,fontSize:12,cursor:'pointer'}}
                        >
                          {isDone ? '✓ Done' : 'Mark done'}
                        </button>
                      </div>
                    </div>
                    {/* Draft panel */}
                    {showDraft === b.title && hasDraft && (
                      <div style={{background:C.surface2,border:'1px solid '+C.accent+'40',borderRadius:'0 0 12px 12px',padding:16,marginTop:-2}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                          <span style={{fontSize:11,fontWeight:700,color:C.accent2,textTransform:'uppercase',letterSpacing:'.05em'}}>✨ AI Draft</span>
                          <button onClick={() => copy(b.title, hasDraft)} style={{padding:'5px 12px',borderRadius:6,border:'1px solid '+C.border,background:C.surface,color:C.text,cursor:'pointer',fontSize:12}}>
                            {copied[b.title] ? '✓ Copied!' : '📋 Copy'}
                          </button>
                        </div>
                        <div style={{color:C.text,fontSize:13,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{hasDraft}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── COLLECTION SEO ── */}
        {section === 'collections' && (
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:16}}>Collection Page SEO Scores</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
              {COLLECTIONS.map(col => {
                const sc = scoreColor(col.score)
                const hasFix = fixes[col.handle]
                const borderCol = col.priority === 'urgent' ? C.red+'40' : col.priority === 'high' ? C.amber+'40' : C.border
                return (
                  <div key={col.handle} style={{background:C.surface,border:'1px solid '+borderCol,borderRadius:12,padding:16}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:C.text}}>{col.name}</div>
                        <div style={{color:C.text3,fontSize:12,marginTop:2}}>/{col.handle}</div>
                      </div>
                      <div style={{textAlign:'center',flexShrink:0}}>
                        <div style={{fontSize:30,fontWeight:800,color:sc}}>{col.score}</div>
                        <div style={{fontSize:11,color:C.text3}}>/ 100</div>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div style={{height:6,background:C.surface2,borderRadius:3,overflow:'hidden',marginBottom:12}}>
                      <div style={{width:col.score+'%',height:'100%',background:sc,borderRadius:3}}/>
                    </div>

                    {/* Issues */}
                    <div style={{marginBottom:12}}>
                      {col.issues.map((issue, i) => (
                        <div key={i} style={{display:'flex',gap:6,marginBottom:4}}>
                          <span style={{color:C.red,flexShrink:0,fontSize:13}}>✗</span>
                          <span style={{color:C.text2,fontSize:12}}>{issue}</span>
                        </div>
                      ))}
                    </div>

                    {/* AI fix */}
                    {hasFix ? (
                      <div style={{background:'rgba(99,102,241,.08)',border:'1px solid rgba(99,102,241,.2)',borderRadius:8,padding:12,marginBottom:8}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                          <span style={{fontSize:11,fontWeight:700,color:C.accent2,textTransform:'uppercase',letterSpacing:'.05em'}}>✨ AI Fix</span>
                          <button onClick={() => copy(col.handle, hasFix)} style={{padding:'3px 10px',borderRadius:5,border:'1px solid '+C.border,background:C.surface,color:C.text,cursor:'pointer',fontSize:11}}>
                            {copied[col.handle] ? '✓' : '📋 Copy'}
                          </button>
                        </div>
                        <p style={{color:C.text,fontSize:12,lineHeight:1.6}}>{hasFix}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => generateFix(col)}
                        disabled={fixing === col.handle}
                        style={{padding:'7px 16px',borderRadius:7,border:'none',background:fixing===col.handle?C.surface2:C.accent,color:fixing===col.handle?C.text3:'#fff',fontWeight:600,fontSize:12,cursor:'pointer',opacity:fixing===col.handle?.7:1}}
                      >
                        {fixing === col.handle ? '⟳ Generating...' : '✨ AI Fix'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
