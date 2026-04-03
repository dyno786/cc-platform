import Head from 'next/head'
import { useState, useEffect } from 'react'
import { T } from '../lib/theme'

const APIS = [
  { id:'shopify',    label:'Shopify',              url:'/api/live-data?source=shopify',        desc:'Orders, revenue, products' },
  { id:'sc',         label:'Search Console',        url:'/api/live-data?source=searchconsole',  desc:'Rankings, clicks, impressions' },
  { id:'gbp',        label:'Google Places (GBP)',   url:'/api/live-data?source=gbp',            desc:'Branch ratings, reviews, status' },
  { id:'collections',label:'Shopify Collections',  url:'/api/live-data?source=shopify-collections', desc:'All Shopify collection data' },
  { id:'shopifystats',label:'Shopify Stats (legacy)',url:'/api/shopify-stats',                  desc:'Legacy stats endpoint' },
]

export default function Debug() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})
  const [blogTest, setBlogTest] = useState(null)
  const [blogLoading, setBlogLoading] = useState(false)
  const [imageTest, setImageTest] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [publishTest, setPublishTest] = useState(null)
  const [publishLoading, setPublishLoading] = useState(false)
  const [envCheck, setEnvCheck] = useState(null)

  async function testAPI(api) {
    setLoading(l => ({...l, [api.id]: true}))
    const start = Date.now()
    try {
      const r = await fetch(api.url)
      const ms = Date.now() - start
      const d = await r.json()
      setResults(prev => ({...prev, [api.id]: {
        status: r.status,
        ok: d.ok !== false,
        ms,
        data: d,
        preview: JSON.stringify(d).slice(0, 300),
        error: d.error || null,
      }}))
    } catch(e) {
      setResults(prev => ({...prev, [api.id]: {
        status: 0, ok: false, ms: Date.now() - start,
        error: e.message, preview: e.message,
      }}))
    }
    setLoading(l => ({...l, [api.id]: false}))
  }

  async function testAllAPIs() {
    for (const api of APIS) await testAPI(api)
  }

  async function testShopifyPublish() {
    setPublishLoading(true); setPublishTest(null)
    try {
      const r = await fetch('/api/test-publish', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const d = await r.json()
      setPublishTest(d)
    } catch(e) {
      setPublishTest({ ok: false, log: [], error: e.message })
    }
    setPublishLoading(false)
  }

  async function testImageGen() {
    setImageLoading(true); setImageTest(null)
    try {
      const r = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Edge Control UK — Best Products 2026',
          cat: 'ads',
          keywords: ['edge control uk', 'best edge control', 'style factor'],
        })
      })
      const d = await r.json()
      setImageTest({
        ok: d.ok,
        error: d.error,
        hasImage: !!d.imageUrl,
        imageUrl: d.imageUrl,
        altText: d.altText,
        filename: d.filename,
        prompt: d.prompt,
        status: r.status,
      })
    } catch(e) {
      setImageTest({ ok: false, error: e.message, hasImage: false, status: 0 })
    }
    setImageLoading(false)
  }

  async function testBlogGen() {
    setBlogLoading(true); setBlogTest(null)
    try {
      const r = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test: Best Edge Control UK 2026',
          seoTitle: 'Best Edge Control UK 2026 | CC Hair and Beauty Leeds',
          metaDesc: 'Test meta description for edge control.',
          keywords: ['edge control uk', 'best edge control', 'edge booster uk'],
          slug: 'test-edge-control',
          cat: 'ads',
          data: 'Test generation — Ads: 7x ROAS',
        })
      })
      const d = await r.json()
      setBlogTest({
        ok: d.ok,
        error: d.error,
        contentLength: d.content?.length || 0,
        preview: d.content?.slice(0, 400) || '(empty)',
        status: r.status,
      })
    } catch(e) {
      setBlogTest({ ok: false, error: e.message, contentLength: 0, preview: '', status: 0 })
    }
    setBlogLoading(false)
  }

  useEffect(() => { testAllAPIs() }, [])

  const StatusDot = ({ ok, loading }) => (
    <div style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      background: loading ? T.amber : ok ? T.green : T.red,
      boxShadow: loading ? 'none' : ok ? `0 0 4px ${T.green}` : `0 0 4px ${T.red}`,
    }}/>
  )

  return (
    <>
      <Head><title>Debug — CC Intelligence</title></Head>
      <div style={{minHeight:'100vh',background:T.bg,padding:20}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
      <div style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>🔧 Debug & API Status</div>
      <div style={{fontSize:12,color:T.textMuted,marginBottom:16}}>Live API health check · response times · raw data preview</div>

        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
          <button onClick={testAllAPIs}
            style={{ padding:'7px 16px', fontSize:12, fontWeight:600, color:'#fff', background:T.blue, border:'none', borderRadius:7, cursor:'pointer' }}>
            ↺ Test all APIs
          </button>
          <button onClick={testShopifyPublish} disabled={publishLoading}
            style={{ padding:'7px 16px', fontSize:12, fontWeight:600, color:'#fff', background:publishLoading?T.border:'#1f883d', border:'none', borderRadius:7, cursor:'pointer' }}>
            {publishLoading ? '⟳ Testing...' : '🛍️ Test Shopify publish'}
          </button>
          <button onClick={testImageGen} disabled={imageLoading}
            style={{ padding:'7px 16px', fontSize:12, fontWeight:600, color:'#fff', background:imageLoading?T.border:'#7c3aed', border:'none', borderRadius:7, cursor:'pointer' }}>
            {imageLoading ? '⟳ Generating...' : '🖼️ Test image generation'}
          </button>
          <button onClick={testBlogGen} disabled={blogLoading}
            style={{ padding:'7px 16px', fontSize:12, fontWeight:600, color:'#fff', background:blogLoading?T.border:T.green, border:'none', borderRadius:7, cursor:'pointer' }}>
            {blogLoading ? '⟳ Testing...' : '✍️ Test blog generation'}
          </button>
        </div>

        {/* API Status cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,minmax(0,1fr))', gap:8, marginBottom:14 }}>
          {APIS.map(api => {
            const r = results[api.id]
            const isLoading = loading[api.id]
            return (
              <div key={api.id} style={{ background:T.surface, border:`0.5px solid ${!r?T.border:r.ok?T.greenBorder:T.redBorder}`, borderRadius:8, padding:'12px 14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                  <StatusDot ok={r?.ok} loading={isLoading}/>
                  <span style={{ fontSize:12, fontWeight:600, color:T.text }}>{api.label}</span>
                </div>
                <div style={{ fontSize:10, color:T.textMuted, marginBottom:6 }}>{api.desc}</div>
                {r && (
                  <>
                    <div style={{ fontSize:11, color:r.ok?T.green:T.red, fontWeight:600, marginBottom:3 }}>
                      {r.ok ? '✓ Connected' : '✗ Failed'} · {r.ms}ms
                    </div>
                    {r.error && <div style={{ fontSize:10, color:T.red, marginBottom:3 }}>{r.error}</div>}
                    <div style={{ fontSize:10, color:T.textMuted }}>HTTP {r.status}</div>
                  </>
                )}
                {isLoading && <div style={{ fontSize:11, color:T.amber }}>Testing...</div>}
                <button onClick={() => testAPI(api)}
                  style={{ marginTop:6, fontSize:10, color:T.blue, background:'none', border:`0.5px solid ${T.blueBorder}`, borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>
                  Retest
                </button>
              </div>
            )
          })}
        </div>

        {/* Blog generation test result */}
        {blogTest && (
          <div style={{ background:T.surface, border:`0.5px solid ${blogTest.ok?T.greenBorder:T.redBorder}`, borderRadius:8, padding:'14px 16px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <StatusDot ok={blogTest.ok}/>
              <span style={{ fontSize:13, fontWeight:600, color:T.text }}>Blog generation test</span>
              <span style={{ fontSize:11, color:blogTest.ok?T.green:T.red, fontWeight:600 }}>
                {blogTest.ok ? `✓ Working — ${blogTest.contentLength} chars generated` : `✗ Failed — ${blogTest.error}`}
              </span>
            </div>
            {blogTest.contentLength > 0 && (
              <div style={{ background:T.bg, border:`0.5px solid ${T.border}`, borderRadius:6, padding:'8px 10px', fontSize:11, color:T.textMuted, fontFamily:'monospace', whiteSpace:'pre-wrap', lineHeight:1.4 }}>
                {blogTest.preview}...
              </div>
            )}
            {!blogTest.ok && (
              <div style={{ background:T.redBg, borderRadius:6, padding:'8px 10px', fontSize:11, color:T.red, marginTop:6 }}>
                Error: {blogTest.error || 'Unknown error — check Vercel runtime logs'}
              </div>
            )}
          </div>
        )}

        {/* Image test result */}
        {imageTest && (
          <div style={{ background:T.surface, border:`0.5px solid ${imageTest.ok?T.greenBorder:T.redBorder}`, borderRadius:8, padding:'14px 16px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:imageTest.ok?T.green:T.red, flexShrink:0 }}/>
              <span style={{ fontSize:13, fontWeight:600, color:T.text }}>Image generation test (DALL-E 3)</span>
              <span style={{ fontSize:11, color:imageTest.ok?T.green:T.red, fontWeight:600 }}>
                {imageTest.ok ? '✓ Working — image generated' : `✗ Failed — ${imageTest.error}`}
              </span>
            </div>
            {imageTest.ok && imageTest.imageUrl && (
              <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:12, alignItems:'start' }}>
                <img src={imageTest.imageUrl} alt={imageTest.altText} style={{ width:'100%', borderRadius:6, border:`0.5px solid ${T.border}` }}/>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:T.text, marginBottom:4 }}>✓ Image generated successfully</div>
                  <div style={{ fontSize:10, color:T.textMuted, marginBottom:3 }}><span style={{ fontWeight:600 }}>Alt text:</span> {imageTest.altText}</div>
                  <div style={{ fontSize:10, color:T.textMuted, marginBottom:8 }}><span style={{ fontWeight:600 }}>Filename:</span> {imageTest.filename}</div>
                  <div style={{ fontSize:10, color:T.textMuted, fontStyle:'italic', lineHeight:1.4 }}><span style={{ fontWeight:600, fontStyle:'normal' }}>Prompt used:</span><br/>{imageTest.prompt}</div>
                </div>
              </div>
            )}
            {!imageTest.ok && (
              <div style={{ background:T.redBg, borderRadius:6, padding:'8px 10px', fontSize:11, color:T.red }}>
                Error: {imageTest.error}
              </div>
            )}
          </div>
        )}

        {/* Shopify publish test result */}
        {publishTest && (
          <div style={{ background:T.surface, border:`0.5px solid ${publishTest.ok?T.greenBorder:T.redBorder}`, borderRadius:8, padding:'14px 16px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:publishTest.ok?T.green:T.red }}/>
              <span style={{ fontSize:13, fontWeight:600, color:T.text }}>Shopify publish test</span>
              <span style={{ fontSize:11, color:publishTest.ok?T.green:T.red, fontWeight:600 }}>
                {publishTest.ok ? '✓ Working — draft article created in Shopify' : `✗ Failed — ${publishTest.error}`}
              </span>
            </div>
            {/* Step by step log */}
            <div style={{ background:T.bg, border:`0.5px solid ${T.border}`, borderRadius:6, padding:'8px 10px', marginBottom:publishTest.article?10:0 }}>
              {(publishTest.log||[]).map((line, i) => (
                <div key={i} style={{ fontSize:11, color:line.startsWith('✓')?T.green:line.startsWith('Found')||line.startsWith('Using')?T.blue:T.textMuted, padding:'2px 0', fontFamily:'monospace' }}>
                  {line}
                </div>
              ))}
            </div>
            {publishTest.article && (
              <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontSize:12, color:T.text }}>Article created in blog: <strong>{publishTest.article.blog}</strong></span>
                <a href={publishTest.article.adminUrl} target="_blank" rel="noreferrer"
                  style={{ fontSize:11, color:'#fff', background:T.blue, borderRadius:5, padding:'4px 12px', textDecoration:'none', fontWeight:600 }}>
                  View in Shopify admin →
                </a>
                <span style={{ fontSize:10, color:T.red }}>⚠️ Delete this test post when done</span>
              </div>
            )}
          </div>
        )}

        {/* Detailed API responses */}
        <div style={{ fontSize:12, fontWeight:600, color:T.text, marginBottom:10 }}>API response detail</div>
        {APIS.map(api => {
          const r = results[api.id]
          if (!r) return null
          return (
            <div key={api.id} style={{ background:T.surface, border:`0.5px solid ${T.border}`, borderRadius:8, overflow:'hidden', marginBottom:8 }}>
              <div style={{ padding:'8px 13px', borderBottom:`0.5px solid ${T.border}`, background:T.bg, display:'flex', alignItems:'center', gap:8 }}>
                <StatusDot ok={r.ok}/>
                <span style={{ fontSize:12, fontWeight:600, color:T.text }}>{api.label}</span>
                <span style={{ fontSize:11, color:T.textMuted }}>HTTP {r.status} · {r.ms}ms</span>
                {r.ok && r.data && (
                  <span style={{ fontSize:11, color:T.green, marginLeft:'auto' }}>
                    {api.id==='shopify' && r.data.today ? `Today: ${r.data.today.formatted} · ${r.data.today.orders} orders · ${r.data.productCount?.toLocaleString()} products` : ''}
                    {api.id==='sc' && r.data.totals ? `${r.data.totals.clicks?.toLocaleString()} clicks · pos ${r.data.totals.avgPosition} · ${r.data.keywords?.length} keywords` : ''}
                    {api.id==='gbp' && r.data.branches ? r.data.branches.map(b=>`${b.name}: ${b.rating}★`).join(' · ') : ''}
                    {api.id==='collections' && r.data.collections ? `${r.data.collections.length} collections` : ''}
                  </span>
                )}
              </div>
              <div style={{ padding:'8px 13px' }}>
                {r.error && <div style={{ fontSize:11, color:T.red, marginBottom:6, fontWeight:600 }}>Error: {r.error}</div>}
                <div style={{ fontSize:10, color:T.textMuted, fontFamily:'monospace', whiteSpace:'pre-wrap', lineHeight:1.5, maxHeight:120, overflow:'auto' }}>
                  {r.preview}
                </div>
              </div>
            </div>
          )
        })}

        <div style={{ background:T.amberBg, border:`0.5px solid ${T.amberBorder}`, borderRadius:8, padding:'10px 14px', marginTop:14, fontSize:11, color:T.amber }}>
          <span style={{ fontWeight:600 }}>Runtime logs:</span> Go to vercel.com → cc-platform → Deployments → latest → Functions tab to see server-side console.log output in real time. Or use Vercel CLI: <code style={{ fontFamily:'monospace', background:'rgba(0,0,0,0.05)', padding:'1px 4px', borderRadius:3 }}>vercel logs cc-platform-two.vercel.app</code>
        </div>

      </div>
      </div>
    </>
  )
}
