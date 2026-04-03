import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const TABS = ['Overview','Quick Wins','Top Keywords','Top Pages','Content Gaps','Technical','Tasks']

const CONTENT_GAPS = [
  { topic:'4C hair care routine UK',          vol:8900,  comp:'Low',    opp:'High',   cat:'org', blog:'hair-care-guides', keywords:['4c hair','leave in conditioner','hair oil'], action:'Write 1,200 word guide — drives leave-in and oil sales' },
  { topic:'Best relaxer for natural hair UK', vol:6700,  comp:'Low',    opp:'High',   cat:'org', blog:'hair-care-guides', keywords:['relaxer','natural hair relaxer','ors relaxer'], action:'Already in Blog Planner Day 1 — publish this week' },
  { topic:'How to grow natural hair fast UK', vol:5400,  comp:'Low',    opp:'High',   cat:'org', blog:'hair-care-guides', keywords:['hair growth','rosemary oil','hair growth products'], action:'Evergreen guide — drives hair growth product sales' },
  { topic:'Braiding hair brands UK',          vol:4200,  comp:'Medium', opp:'High',   cat:'org', blog:'leeds',            keywords:['braiding hair','xpression','freetress'], action:'Comparison — Xpression vs Freetress vs Outre' },
  { topic:'Best edge control UK 2026',        vol:3800,  comp:'Low',    opp:'High',   cat:'ads', blog:'product-reviews',  keywords:['edge control','edge booster','style factor'], action:'Already in Blog Planner — publish this week' },
  { topic:'Mielle rosemary oil review',       vol:3200,  comp:'Medium', opp:'Medium', cat:'ads', blog:'product-reviews',  keywords:['mielle','rosemary oil','mielle organics'], action:'Product review — trending 2026' },
  { topic:'LOC method natural hair',          vol:2900,  comp:'Low',    opp:'High',   cat:'org', blog:'hair-care-guides', keywords:['loc method','leave in conditioner','hair oil'], action:'Educational guide — drives leave-in and oil sales' },
  { topic:'Crochet braids at home',           vol:2400,  comp:'Low',    opp:'High',   cat:'org', blog:'leeds',            keywords:['crochet braids','crochet hair','braiding hair'], action:'Tutorial — drives crochet hair sales' },
]

const TECHNICAL = [
  { issue:'Relaxers collection meta title',    severity:'critical', fix:'Change to: "Buy Hair Relaxers UK — ORS, Dark & Lovely, TCB | CC Hair and Beauty Leeds"' },
  { issue:'Edge control collection meta title', severity:'critical', fix:'Change to: "Best Edge Control UK — Style Factor, Edge Booster | CC Hair and Beauty Leeds"' },
  { issue:'Homepage meta description',         severity:'high',     fix:'Add: "CC Hair and Beauty — Leeds afro hair shop since 1979. 23,000+ products. 3 branches."' },
  { issue:'Blog posts have no internal links', severity:'high',     fix:'Every blog post must link to 2-3 product collection pages' },
  { issue:'Collection pages have thin content', severity:'high',    fix:'Add 200-300 word descriptions to top 20 collection pages (use Website SEO tab)' },
  { issue:'No schema markup on product pages', severity:'medium',   fix:'Add Product schema — helps Google show star ratings in results' },
  { issue:'Site speed on mobile',              severity:'medium',   fix:'Images need WebP compression — page speed affects rankings' },
  { issue:'Duplicate content on tag pages',    severity:'low',      fix:'Add canonical tags to /tags/ pages in Shopify' },
]

const SEO_TASKS = [
  { id:'seo_t1', text:'Fix relaxers collection meta title — 60k impressions at 0.5% CTR', how:'Shopify → Collections → Relaxers → Edit SEO → paste new title from Website SEO tab' },
  { id:'seo_t2', text:'Fix edge control collection meta title', how:'Shopify → Collections → Edge Control → Edit SEO' },
  { id:'seo_t3', text:'Write "Best Relaxer UK 2026" blog post', how:'Blog Planner → Day 1 → Organic SEO → Generate → Publish' },
  { id:'seo_t4', text:'Write "4C Hair Care Routine UK" guide', how:'Blog Planner → Day 17 → Organic SEO → Generate → Publish' },
  { id:'seo_t5', text:'Add internal links to last 5 published blog posts', how:'Shopify → Blog Posts → edit each → add 2-3 links to collection pages' },
  { id:'seo_t6', text:'Add 200 word description to Edge Control collection page', how:'Shopify → Collections → Edge Control → Description (use Website SEO AI generator)' },
  { id:'seo_t7', text:'Add 200 word description to Relaxers collection page', how:'Shopify → Collections → Relaxers → Description (use Website SEO AI generator)' },
]

export default function OrganicSEO() {
  const [tab, setTab] = useState('Overview')
  const [tasks, setTasks] = useState({})
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState({ key: 'impressions', dir: 'desc' })
  const [generating, setGenerating] = useState(null)
  const [generatedContent, setGeneratedContent] = useState({})
  const [gapPublishing, setGapPublishing] = useState({})
  const [gapPublished, setGapPublished] = useState({})
  const [gapStatus, setGapStatus] = useState({})
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    try { const t = localStorage.getItem('cc_seo_tasks'); if(t) setTasks(JSON.parse(t)) } catch(e){}
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true); setError(null)
    try {
      const r = await fetch('/api/live-data?source=searchconsole')
      const d = await r.json()
      if (d.ok) setData(d)
      else setError(d.error)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  function tick(id) {
    const u = { ...tasks, [id]: !tasks[id] }
    setTasks(u); localStorage.setItem('cc_seo_tasks', JSON.stringify(u))
  }

  function doSort(key) {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  }

  function sortRows(rows) {
    return [...rows].sort((a, b) => {
      const av = typeof a[sort.key] === 'string' ? parseFloat(a[sort.key]) : a[sort.key]
      const bv = typeof b[sort.key] === 'string' ? parseFloat(b[sort.key]) : b[sort.key]
      return sort.dir === 'desc' ? bv - av : av - bv
    })
  }

  async function generateAndPublishGap(g) {
    const topic = g.topic
    setGapPublishing(p => ({...p, [topic]: true}))
    setGapStatus(p => ({...p, [topic]: 'Writing blog post...'}))
    try {
      // Step 1 — generate blog with real product links
      const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const blogRes = await fetch('/api/generate-blog', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: topic,
          seoTitle: `${topic} | CC Hair and Beauty Leeds`,
          metaDesc: `Complete guide to ${topic.toLowerCase()} at CC Hair and Beauty Leeds. Expert advice, product recommendations and where to buy.`,
          keywords: g.keywords,
          slug,
          cat: g.cat,
          data: 'Content gap — high search volume, low competition',
        })
      })
      const blogData = await blogRes.json()
      if (!blogData.ok || !blogData.content) {
        setGapStatus(p => ({...p, [topic]: '✗ Blog generation failed: ' + (blogData.error || 'unknown')}))
        setGapPublishing(p => ({...p, [topic]: false}))
        return
      }
      setGeneratedContent(prev => ({...prev, [topic]: blogData.content}))
      setGapStatus(p => ({...p, [topic]: 'Publishing to Shopify...'}))

      // Step 2 — publish directly to correct Shopify blog
      const imageUrl = blogData.featuredImage?.src || null
      const pubRes = await fetch('/api/publish-to-shopify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: topic,
          seoTitle: `${topic} | CC Hair and Beauty Leeds`,
          metaDesc: `Complete guide to ${topic.toLowerCase()} at CC Hair and Beauty Leeds.`,
          slug, content: blogData.content, cat: g.cat,
          keywords: g.keywords, imageUrl,
          imageAlt: imageUrl ? `${topic} - CC Hair and Beauty Leeds` : null,
        })
      })
      const pubData = await pubRes.json()
      if (pubData.ok) {
        setGapStatus(p => ({...p, [topic]: `✓ Live at ${pubData.articleUrl}`}))
        setGapPublished(p => ({...p, [topic]: pubData.articleUrl}))
      } else {
        setGapStatus(p => ({...p, [topic]: '✗ Publish failed: ' + (pubData.error || 'unknown')}))
      }
    } catch(e) {
      setGapStatus(p => ({...p, [topic]: '✗ Error: ' + e.message}))
    }
    setGapPublishing(p => ({...p, [topic]: false}))
  }

  function copyContent(topic) {
    navigator.clipboard.writeText(generatedContent[topic])
    setCopied(topic); setTimeout(() => setCopied(null), 2000)
  }

  const donePct = Math.round(SEO_TASKS.filter(t => tasks[t.id]).length / SEO_TASKS.length * 100)

  const TH = ({ children, k }) => (
    <th onClick={k ? () => doSort(k) : undefined} style={{ padding: '7px 11px', fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', background: T.bg, borderBottom: `0.5px solid ${T.border}`, whiteSpace: 'nowrap', cursor: k ? 'pointer' : 'default' }}>
      {children}{k ? <span style={{ marginLeft: 3, opacity: 0.5 }}>{sort.key === k ? (sort.dir === 'desc' ? '↓' : '↑') : '↕'}</span> : null}
    </th>
  )

  const TD = ({ children, c, bold, wrap }) => (
    <td style={{ padding: '8px 11px', fontSize: 12, color: c || T.text, fontWeight: bold ? 600 : 400, borderBottom: `0.5px solid ${T.borderLight}`, verticalAlign: 'middle', whiteSpace: wrap ? 'normal' : 'nowrap' }}>{children}</td>
  )

  function PosBar({ pos }) {
    const color = pos <= 3 ? T.green : pos <= 10 ? T.amber : T.red
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 60, height: 4, background: T.borderLight, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${Math.max(5, 100 - (pos / 20 * 100))}%`, height: '100%', background: color, borderRadius: 99 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 30 }}>{pos}</span>
      </div>
    )
  }

  const keywords = data?.keywords || []
  const pages = data?.pages || []
  const quickWins = data?.quickWins || keywords.filter(k => k.position >= 4 && k.position <= 15 && k.impressions > 100).sort((a,b) => b.impressions - a.impressions).slice(0,10)

  return (
    <>
      <Head><title>Organic SEO — CC Intelligence</title></Head>
      <Shell title="Organic SEO" subtitle={data?.live ? `Live Search Console data · ${data.period}` : 'Loading live data...'}>

        {loading && (
          <div style={{ background: T.blueBg, border: `0.5px solid ${T.blueBorder}`, borderRadius: 7, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: T.blue }}>
            ⟳ Loading live Search Console data...
          </div>
        )}

        {error && (
          <div style={{ background: T.redBg, border: `0.5px solid ${T.redBorder}`, borderRadius: 7, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: T.red }}>
            ⚠️ Could not load live data: {error}
            <button onClick={fetchData} style={{ marginLeft: 10, fontSize: 11, color: T.blue, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
          </div>
        )}

        {data?.live && (
          <div style={{ background: T.greenBg, border: `0.5px solid ${T.greenBorder}`, borderRadius: 7, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: T.green, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>✅ Live data from Search Console — last 90 days</span>
            <button onClick={fetchData} style={{ fontSize: 11, color: T.green, background: 'none', border: `0.5px solid ${T.greenBorder}`, borderRadius: 5, padding: '2px 10px', cursor: 'pointer' }}>↺ Refresh</button>
          </div>
        )}

        {/* Live stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gap: 8, marginBottom: 12 }}>
          {[
            { l: 'Total clicks', v: data ? data.totals.clicks.toLocaleString() : '—', s: 'Last 90 days', sc: T.green },
            { l: 'Impressions', v: data ? data.totals.impressions.toLocaleString() : '—', s: 'Last 90 days', sc: T.textMuted },
            { l: 'Avg position', v: data ? data.totals.avgPosition : '—', s: keywords.length > 0 ? `${keywords.length} keywords` : 'All keywords', sc: T.amber },
            { l: 'Avg CTR', v: data ? data.totals.avgCtr : '—', s: 'Target: 3%+', sc: parseFloat(data?.totals?.avgCtr) < 3 ? T.red : T.green },
            { l: 'Quick wins', v: quickWins.length, s: 'Page 1 or 2 keywords', sc: T.blue },
            { l: 'Tasks done', v: `${SEO_TASKS.filter(t => tasks[t.id]).length}/${SEO_TASKS.length}`, s: `${donePct}%`, sc: donePct === 100 ? T.green : T.amber },
          ].map((s, i) => (
            <div key={i} style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{s.l}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 2 }}>{loading ? '...' : s.v}</div>
              <div style={{ fontSize: 10, color: s.sc }}>{s.s}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
            <span style={{ fontWeight: 600, color: T.text }}>SEO task progress</span>
            <span style={{ color: T.textMuted }}>{donePct}%</span>
          </div>
          <div style={{ height: 5, background: T.borderLight, borderRadius: 99, border: `0.5px solid ${T.border}`, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${donePct}%`, background: donePct === 100 ? T.green : T.blue, borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `0.5px solid ${T.border}`, marginBottom: 14, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 14px', fontSize: 11, fontWeight: tab === t ? 600 : 400, color: tab === t ? T.blue : T.textMuted, background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${T.blue}` : '2px solid transparent', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              {t}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '9px 13px', borderBottom: `0.5px solid ${T.border}`, background: T.bg, fontSize: 12, fontWeight: 600, color: T.text }}>
                Top keywords by clicks — live from Search Console
              </div>
              <div style={{ padding: '4px 0' }}>
                {loading ? (
                  <div style={{ padding: 20, textAlign: 'center', color: T.textMuted, fontSize: 12 }}>Loading...</div>
                ) : (
                  keywords.slice(0, 10).map((k, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderBottom: `0.5px solid ${T.borderLight}` }}>
                      <span style={{ fontSize: 11, color: T.text, flex: 1 }}>{k.query}</span>
                      <PosBar pos={k.position} />
                      <span style={{ fontSize: 11, color: T.green, minWidth: 50, textAlign: 'right' }}>{k.clicks} clicks</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: T.redBg, border: `0.5px solid ${T.redBorder}`, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.red, marginBottom: 7 }}>🚨 Biggest opportunities — live data</div>
                {quickWins.slice(0, 4).map((k, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 3 ? `0.5px solid ${T.redBorder}` : 'none', fontSize: 11, color: T.red }}>
                    <span>"{k.query}" at pos {k.position}</span>
                    <span style={{ fontWeight: 600 }}>{k.impressions.toLocaleString()} impressions</span>
                  </div>
                ))}
              </div>
              <div style={{ background: T.greenBg, border: `0.5px solid ${T.greenBorder}`, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.green, marginBottom: 7 }}>✅ What is working — live</div>
                {keywords.filter(k => k.position <= 3).slice(0, 4).map((k, i) => (
                  <div key={i} style={{ fontSize: 11, color: T.green, padding: '3px 0', borderBottom: i < 2 ? `0.5px solid ${T.greenBorder}` : 'none' }}>
                    ✓ "{k.query}" — pos {k.position} · {k.clicks} clicks
                  </div>
                ))}
              </div>
              <div style={{ background: T.amberBg, border: `0.5px solid ${T.amberBorder}`, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.amber, marginBottom: 6 }}>⚠️ CTR problem</div>
                <div style={{ fontSize: 11, color: T.amber, lineHeight: 1.6 }}>
                  Average CTR is {data?.totals?.avgCtr} against 3% target. Your title tags are not compelling enough. Use Website SEO tab to generate better meta titles for your top collections.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUICK WINS */}
        {tab === 'Quick Wins' && (
          <div>
            <div style={{ background: T.greenBg, border: `0.5px solid ${T.greenBorder}`, borderRadius: 7, padding: '9px 13px', marginBottom: 12, fontSize: 11, color: T.green }}>
              Live data — keywords already ranking on page 1 or 2. Small fixes will dramatically increase clicks.
            </div>
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead><tr>
                  <TH k="query">Keyword</TH>
                  <TH k="position">Position ↕</TH>
                  <TH k="impressions">Impressions ↕</TH>
                  <TH k="ctr">CTR ↕</TH>
                  <TH k="clicks">Clicks ↕</TH>
                  <TH>Opportunity</TH>
                </tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: T.textMuted }}>Loading live data...</td></tr>
                  ) : sortRows(quickWins).map((k, i) => (
                    <tr key={i}>
                      <TD bold>{k.query}</TD>
                      <TD><PosBar pos={k.position} /></TD>
                      <TD c={T.textMuted}>{k.impressions.toLocaleString()}</TD>
                      <TD c={parseFloat(k.ctr) < 1 ? T.red : T.amber}>{k.ctr}</TD>
                      <TD c={T.green}>{k.clicks}</TD>
                      <TD c={T.green} bold>
                        {k.potentialClicks > 0 ? `+${k.potentialClicks} clicks/mo at 3% CTR` : 'Already performing'}
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TOP KEYWORDS */}
        {tab === 'Top Keywords' && (
          <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'auto' }}>
            <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${T.border}`, background: T.bg, fontSize: 11, color: T.textMuted }}>
              Live data from Search Console — last 90 days — {keywords.length} keywords. Click headers to sort.
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead><tr>
                <TH k="query">Keyword</TH>
                <TH k="position">Position ↕</TH>
                <TH k="clicks">Clicks ↕</TH>
                <TH k="impressions">Impressions ↕</TH>
                <TH k="ctr">CTR ↕</TH>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: T.textMuted }}>Loading...</td></tr>
                ) : sortRows(keywords).map((k, i) => (
                  <tr key={i}>
                    <TD bold>{k.query}</TD>
                    <TD><PosBar pos={k.position} /></TD>
                    <TD c={T.green}>{k.clicks.toLocaleString()}</TD>
                    <TD c={T.textMuted}>{k.impressions.toLocaleString()}</TD>
                    <TD c={parseFloat(k.ctr) < 1 ? T.red : parseFloat(k.ctr) < 3 ? T.amber : T.green}>{k.ctr}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TOP PAGES */}
        {tab === 'Top Pages' && (
          <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'auto' }}>
            <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${T.border}`, background: T.bg, fontSize: 11, color: T.textMuted }}>
              Live data — pages getting the most traffic from Google
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead><tr>
                <TH k="page">Page URL</TH>
                <TH k="clicks">Clicks ↕</TH>
                <TH k="impressions">Impressions ↕</TH>
                <TH k="position">Position ↕</TH>
                <TH k="ctr">CTR ↕</TH>
                <TH>Shopify link</TH>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: T.textMuted }}>Loading...</td></tr>
                ) : sortRows(pages).map((p, i) => {
                  const rawPage = p.page.replace('https://www.cchairandbeauty.com','').replace('http://www.cchairandbeauty.com','')
                  const handle = rawPage.replace('/collections/', '').replace(/\//g, '')
                  const isCollection = rawPage.includes('/collections/')
                  const isProduct = rawPage.includes('/products/')
                  const isBlog = rawPage.includes('/blogs/')
                  // Generate friendly name from URL
                  const friendlyName = handle
                    ? handle.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')
                    : 'Homepage'
                  const ctr = parseFloat(p.ctr)
                  const lowCtr = ctr < 1
                  return (
                    <tr key={i} style={{background: lowCtr ? '#fff8f8' : 'transparent'}}>
                      <td style={{ padding: '8px 11px', borderBottom: `0.5px solid ${T.borderLight}` }}>
                        <div style={{fontSize:12,fontWeight:700,color:T.text}}>{friendlyName}</div>
                        <div style={{fontSize:10,color:T.textMuted,fontFamily:'monospace'}}>{rawPage.slice(0,45)}{rawPage.length>45?'...':''}</div>
                        {lowCtr && <div style={{fontSize:10,color:'#cf222e',fontWeight:600,marginTop:2}}>⚠ Low CTR — fix meta title</div>}
                      </td>
                      <TD c={T.green}>{p.clicks.toLocaleString()}</TD>
                      <TD c={T.textMuted}>{p.impressions.toLocaleString()}</TD>
                      <TD><PosBar pos={p.position} /></TD>
                      <TD c={lowCtr ? T.red : T.amber}>{p.ctr}</TD>
                      <td style={{ padding: '8px 11px', borderBottom: `0.5px solid ${T.borderLight}` }}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          {isCollection && (
                            <a href={`https://admin.shopify.com/store/cchairandbeauty/collections?search=${handle}`} target="_blank" rel="noreferrer"
                              style={{ fontSize: 10, color: '#fff', background: T.blue, borderRadius: 4, padding: '2px 8px', textDecoration: 'none', whiteSpace:'nowrap' }}>
                              Edit SEO →
                            </a>
                          )}
                          {isProduct && (
                            <a href={`https://admin.shopify.com/store/cchairandbeauty/products?search=${handle}`} target="_blank" rel="noreferrer"
                              style={{ fontSize: 10, color: '#fff', background: T.blue, borderRadius: 4, padding: '2px 8px', textDecoration: 'none', whiteSpace:'nowrap' }}>
                              Edit product →
                            </a>
                          )}
                          {isBlog && (
                            <a href={`https://admin.shopify.com/store/cchairandbeauty/blogs`} target="_blank" rel="noreferrer"
                              style={{ fontSize: 10, color: '#fff', background: '#7c3aed', borderRadius: 4, padding: '2px 8px', textDecoration: 'none', whiteSpace:'nowrap' }}>
                              Edit blog →
                            </a>
                          )}
                          <a href={`https://cchairandbeauty.com${rawPage}`} target="_blank" rel="noreferrer"
                            style={{ fontSize: 10, color: T.blue, textDecoration: 'none', whiteSpace:'nowrap' }}>View →</a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTENT GAPS */}
        {tab === 'Content Gaps' && (
          <div>
            <div style={{ background: T.blueBg, border: `0.5px solid ${T.blueBorder}`, borderRadius: 7, padding: '9px 13px', marginBottom: 12, fontSize: 11, color: T.blue }}>
              Topics with high search volume you currently rank nowhere for. Click 🚀 Generate & Publish to write the blog with real product links and publish directly to the correct Shopify blog.
            </div>
            {CONTENT_GAPS.map((g, i) => (
              <div key={i} style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1 }}>{g.topic}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>{g.vol.toLocaleString()}/mo</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: g.comp === 'Low' ? T.greenBg : T.amberBg, color: g.comp === 'Low' ? T.green : T.amber }}>{g.comp} competition</span>
                  {gapPublished[g.topic] ? (
                    <a href={gapPublished[g.topic]} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#1a7f37', borderRadius: 6, padding: '5px 14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      ✓ Live →
                    </a>
                  ) : (
                    <button onClick={() => generateAndPublishGap(g)} disabled={gapPublishing[g.topic]}
                      style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: gapPublishing[g.topic] ? T.border : T.blue, border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {gapPublishing[g.topic] ? '⟳ Publishing...' : '🚀 Generate & Publish'}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: gapStatus[g.topic] ? 6 : 0 }}>
                  {g.action} · <span style={{color:T.textMuted}}>Blog: <strong>{g.blog}</strong></span>
                </div>
                {gapStatus[g.topic] && (
                  <div style={{padding:'8px 12px',borderRadius:6,fontSize:12,fontWeight:500,
                    background: gapStatus[g.topic].startsWith('✓') ? '#dafbe1' : gapStatus[g.topic].startsWith('✗') ? '#fff0f0' : '#ddf4ff',
                    color: gapStatus[g.topic].startsWith('✓') ? '#1a7f37' : gapStatus[g.topic].startsWith('✗') ? '#cf222e' : T.blue,
                    border: `1px solid ${gapStatus[g.topic].startsWith('✓') ? '#1a7f37' : gapStatus[g.topic].startsWith('✗') ? '#cf222e' : T.blueBorder}`,
                    display:'flex',alignItems:'center',gap:8}}>
                    {gapPublishing[g.topic] && <span>⟳</span>}
                    {gapStatus[g.topic]}
                    {gapPublished[g.topic] && (
                      <a href={gapPublished[g.topic]} target="_blank" rel="noreferrer"
                        style={{marginLeft:'auto',color:'#1a7f37',fontWeight:700,textDecoration:'underline'}}>
                        View live post →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TECHNICAL */}
        {tab === 'Technical' && (
          <div>
            {TECHNICAL.map((t, i) => (
              <div key={i} style={{ background: T.surface, border: `0.5px solid ${t.severity === 'critical' ? T.redBorder : t.severity === 'high' ? T.amberBorder : T.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: t.severity === 'critical' ? T.redBg : t.severity === 'high' ? T.amberBg : T.blueBg, color: t.severity === 'critical' ? T.red : t.severity === 'high' ? T.amber : T.blue }}>{t.severity}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{t.issue}</span>
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Fix: {t.fix}</div>
              </div>
            ))}
          </div>
        )}

        {/* TASKS */}
        {tab === 'Tasks' && (
          <div style={{ maxWidth: 860 }}>
            {SEO_TASKS.map((task) => (
              <div key={task.id} onClick={() => tick(task.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: tasks[task.id] ? T.greenBg : T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, marginBottom: 7, cursor: 'pointer' }}>
                <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${tasks[task.id] ? T.green : T.border}`, background: tasks[task.id] ? T.green : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  {tasks[task.id] && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: tasks[task.id] ? T.textMuted : T.text, textDecoration: tasks[task.id] ? 'line-through' : 'none', marginBottom: 3 }}>{task.text}</div>
                  <div style={{ fontSize: 10, color: T.blue }}>→ {task.how}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Shell>
    </>
  )
}
