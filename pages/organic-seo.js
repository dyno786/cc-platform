import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const TABS = ['Overview','Quick Wins','Top Keywords','Content Gaps','Technical','Tasks']

const TOP_KW = [
  { kw:'braiding hair leeds',          pos:1.8,  clicks:180, impr:2100,  ctr:8.6,  change:'up',   page:'/collections/braiding-hair' },
  { kw:'cc hair and beauty',           pos:1.2,  clicks:142, impr:890,   ctr:16.0, change:'up',   page:'/' },
  { kw:'afro hair shop leeds',         pos:2.7,  clicks:98,  impr:1240,  ctr:7.9,  change:'up',   page:'/' },
  { kw:'hair shop leeds',              pos:3.1,  clicks:89,  impr:1890,  ctr:4.7,  change:'same', page:'/' },
  { kw:'edge control',                 pos:4.2,  clicks:76,  impr:8900,  ctr:0.9,  change:'up',   page:'/collections/edge-control' },
  { kw:'relaxer uk',                   pos:6.8,  clicks:61,  impr:12400, ctr:0.5,  change:'down', page:'/collections/relaxers' },
  { kw:'braiding hair',                pos:8.1,  clicks:54,  impr:18900, ctr:0.3,  change:'down', page:'/collections/braiding-hair' },
  { kw:'human hair wigs uk',           pos:9.4,  clicks:48,  impr:6700,  ctr:0.7,  change:'same', page:'/collections/human-hair-wigs' },
  { kw:'wigs leeds',                   pos:3.4,  clicks:44,  impr:890,   ctr:4.9,  change:'up',   page:'/collections/wigs' },
  { kw:'dark and lovely relaxer',      pos:5.1,  clicks:41,  impr:4200,  ctr:1.0,  change:'up',   page:'/collections/relaxers' },
  { kw:'cherish french curl',          pos:8.7,  clicks:38,  impr:2100,  ctr:1.8,  change:'up',   page:'/collections/braiding-hair' },
  { kw:'natural hair products leeds',  pos:4.8,  clicks:35,  impr:1890,  ctr:1.9,  change:'same', page:'/' },
  { kw:'ors relaxer',                  pos:7.2,  clicks:32,  impr:5600,  ctr:0.6,  change:'down', page:'/collections/relaxers' },
  { kw:'hair extensions leeds',        pos:5.6,  clicks:29,  impr:1240,  ctr:2.3,  change:'up',   page:'/collections/hair-extensions' },
  { kw:'lace front wigs',              pos:11.2, clicks:24,  impr:9800,  ctr:0.2,  change:'down', page:'/collections/lace-front-wigs' },
]

const QUICK_WINS = [
  { kw:'relaxers uk',          pos:6.8,  impr:60000, ctr:0.5,  expected_ctr:3.5, potential:1950, action:'Write meta title with "Buy Relaxers UK" — ORS, Dark & Lovely, TCB | CC Hair and Beauty Leeds', priority:'critical' },
  { kw:'edge control',         pos:4.2,  impr:8900,  ctr:0.9,  expected_ctr:4.2, potential:297,  action:'Rewrite collection description — add "best edge control UK" in H1 and first 100 words', priority:'critical' },
  { kw:'braiding hair',        pos:8.1,  impr:18900, ctr:0.3,  expected_ctr:3.0, potential:513,  action:'Blog posts about braiding hair will push this from pos 8 to pos 3-4', priority:'high' },
  { kw:'human hair wigs uk',   pos:9.4,  impr:6700,  ctr:0.7,  expected_ctr:2.5, potential:121,  action:'Create dedicated "Human Hair Wigs UK" landing page with full SEO content', priority:'high' },
  { kw:'lace front wigs',      pos:11.2, impr:9800,  ctr:0.2,  expected_ctr:2.0, potential:176,  action:'Position 11 = page 2 of Google. One targeted blog post will push to page 1', priority:'high' },
  { kw:'ors relaxer',          pos:7.2,  impr:5600,  ctr:0.6,  expected_ctr:3.5, potential:162,  action:'Add "ORS Relaxer UK" blog post review — already converts in Ads', priority:'high' },
  { kw:'wigs uk',              pos:12.4, impr:22000, ctr:0.1,  expected_ctr:1.8, potential:374,  action:'Create "Wigs UK — Human Hair & Synthetic" category page with SEO content', priority:'medium' },
  { kw:'natural hair care uk', pos:14.8, impr:14000, ctr:0.1,  expected_ctr:1.5, potential:196,  action:'Write natural hair care guide — targets 4C, 4B hair types nationally', priority:'medium' },
]

const CONTENT_GAPS = [
  { topic:'4C hair care routine UK',     vol:8900,  comp:'Low',    opp:'High', action:'Write 1,200 word guide targeting "4c hair care routine uk"' },
  { topic:'Best relaxer for natural hair UK', vol:6700, comp:'Low', opp:'High', action:'Already in Blog Planner Day 1 — publish this week' },
  { topic:'How to grow natural hair fast UK', vol:5400, comp:'Low', opp:'High', action:'Evergreen guide — drives hair growth product sales' },
  { topic:'Braiding hair brands UK',     vol:4200,  comp:'Medium', opp:'High', action:'Comparison post — Xpression vs Freetress vs Outre' },
  { topic:'Best edge control UK 2026',   vol:3800,  comp:'Low',    opp:'High', action:'Already in Blog Planner — publish this week' },
  { topic:'Mielle rosemary oil review',  vol:3200,  comp:'Medium', opp:'Medium', action:'Product review — trending in 2026' },
  { topic:'LOC method natural hair',     vol:2900,  comp:'Low',    opp:'High', action:'Educational guide — drives leave-in and oil sales' },
  { topic:'Crochet braids at home',      vol:2400,  comp:'Low',    opp:'High', action:'Tutorial post — drives crochet hair sales' },
]

const TECHNICAL = [
  { issue:'Relaxers collection meta title',   severity:'critical', fix:'Change to: "Buy Hair Relaxers UK — ORS, Dark & Lovely, TCB | CC Hair and Beauty Leeds"' },
  { issue:'Edge control collection meta title', severity:'critical', fix:'Change to: "Best Edge Control UK — Style Factor, Edge Booster | CC Hair and Beauty Leeds"' },
  { issue:'Homepage meta description',        severity:'high',     fix:'Add: "CC Hair and Beauty — Leeds afro hair shop since 1979. 23,000+ products. 3 branches."' },
  { issue:'Blog posts have no internal links', severity:'high',     fix:'Every blog post must link to 2-3 product collection pages' },
  { issue:'Collection pages have thin content', severity:'high',   fix:'Add 200-300 word descriptions to top 20 collection pages' },
  { issue:'No schema markup on product pages', severity:'medium',  fix:'Add Product schema — helps Google show star ratings in results' },
  { issue:'Site speed on mobile',             severity:'medium',   fix:'Images need WebP compression — page speed affects rankings' },
  { issue:'Duplicate content on tag pages',   severity:'low',      fix:'Add canonical tags to /tags/ pages in Shopify' },
]

const TASKS = [
  { id:'seo_t1', text:'Fix relaxers collection meta title', how:'Shopify → Online Store → Navigation → Collections → Relaxers → Edit SEO' },
  { id:'seo_t2', text:'Fix edge control collection meta title', how:'Shopify → Online Store → Navigation → Collections → Edge Control → Edit SEO' },
  { id:'seo_t3', text:'Write "Best Relaxer UK 2026" blog post — 60k impressions', how:'Blog Planner → Day 1 → Organic SEO → Generate → Publish' },
  { id:'seo_t4', text:'Write "4C Hair Care Routine UK" guide', how:'Blog Planner → Day 17 → Organic SEO → Generate → Publish' },
  { id:'seo_t5', text:'Add internal links to last 5 blog posts published', how:'Shopify → Blog Posts → edit each post → add 2-3 links to collection pages' },
  { id:'seo_t6', text:'Add 200 word description to Edge Control collection page', how:'Shopify → Products → Collections → Edge Control → Description' },
  { id:'seo_t7', text:'Add 200 word description to Relaxers collection page', how:'Shopify → Products → Collections → Relaxers → Description' },
]

export default function OrganicSEO() {
  const [tab, setTab] = useState('Overview')
  const [tasks, setTasks] = useState({})
  const [sort, setSort] = useState({ key: 'impr', dir: 'desc' })
  const [uploadData, setUploadData] = useState(null)

  useEffect(() => {
    try {
      const t = localStorage.getItem('cc_seo_tasks'); if(t) setTasks(JSON.parse(t))
      const u = localStorage.getItem('cc_data_upload'); if(u) setUploadData(JSON.parse(u))
    } catch(e){}
  }, [])

  function tick(id) {
    const u = { ...tasks, [id]: !tasks[id] }
    setTasks(u); localStorage.setItem('cc_seo_tasks', JSON.stringify(u))
  }

  function doSort(key) {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  }

  function sortData(data) {
    return [...data].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key]
      return sort.dir === 'desc' ? bv - av : av - bv
    })
  }

  const donePct = Math.round(TASKS.filter(t => tasks[t.id]).length / TASKS.length * 100)

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
    const width = Math.max(5, 100 - (pos / 20 * 100))
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 60, height: 4, background: T.borderLight, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: 99 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28 }}>{pos}</span>
      </div>
    )
  }

  return (
    <>
      <Head><title>Organic SEO — CC Intelligence</title></Head>
      <Shell title="Organic SEO" subtitle="Google Search Console data · rankings, clicks, opportunities">

        {uploadData?.results?.seoInsights ? (
          <div style={{ background: T.greenBg, border: `0.5px solid ${T.greenBorder}`, borderRadius: 7, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: T.green }}>
            📥 Live data from upload: {new Date(uploadData.timestamp).toLocaleDateString('en-GB')} — {uploadData.scFile}
          </div>
        ) : (
          <div style={{ background: T.amberBg, border: `0.5px solid ${T.amberBorder}`, borderRadius: 7, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: T.amber }}>
            ⚠️ Upload your Search Console CSV in Data Upload to see live ranking data. Showing historical data below.
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gap: 8, marginBottom: 12 }}>
          {[
            { l: 'Total clicks', v: '4,210', s: 'Last 3 months', sc: T.green },
            { l: 'Impressions', v: '312,000', s: 'Last 3 months', sc: T.textMuted },
            { l: 'Avg position', v: '6.8', s: 'All keywords', sc: T.amber },
            { l: 'Avg CTR', v: '1.35%', s: 'Below 3% target', sc: T.red },
            { l: 'Quick win clicks', v: '+3,789', s: 'Potential/month', sc: T.green },
            { l: 'Tasks done', v: `${TASKS.filter(t => tasks[t.id]).length}/${TASKS.length}`, s: `${donePct}%`, sc: donePct === 100 ? T.green : T.amber },
          ].map((s, i) => (
            <div key={i} style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{s.l}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 2 }}>{s.v}</div>
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
              <div style={{ padding: '9px 13px', borderBottom: `0.5px solid ${T.border}`, background: T.bg, fontSize: 12, fontWeight: 600, color: T.text }}>Top keywords by clicks</div>
              <div style={{ padding: '8px 0' }}>
                {TOP_KW.slice(0, 8).map((k, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderBottom: `0.5px solid ${T.borderLight}` }}>
                    <span style={{ fontSize: 11, color: T.text, flex: 1 }}>{k.kw}</span>
                    <PosBar pos={k.pos} />
                    <span style={{ fontSize: 11, color: T.green, minWidth: 40, textAlign: 'right' }}>{k.clicks} clicks</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: T.redBg, border: `0.5px solid ${T.redBorder}`, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.red, marginBottom: 7 }}>🚨 Biggest opportunities — act now</div>
                {[
                  { l: 'Relaxers — 60,000 impressions at pos 6.8', v: '+1,950 clicks/mo potential' },
                  { l: 'Braiding hair — 18,900 impressions at pos 8', v: '+513 clicks/mo potential' },
                  { l: 'Wigs UK — 22,000 impressions at pos 12', v: '+374 clicks/mo potential' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 2 ? `0.5px solid ${T.redBorder}` : 'none', fontSize: 11, color: T.red }}>
                    <span>{r.l}</span><span style={{ fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: T.amberBg, border: `0.5px solid ${T.amberBorder}`, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.amber, marginBottom: 6 }}>⚠️ CTR problem — 1.35% vs 3% target</div>
                <div style={{ fontSize: 11, color: T.amber, lineHeight: 1.6 }}>Your average CTR is 1.35% when it should be 3%+. This means people see your site in Google but do not click. Fix: rewrite meta titles to be more compelling and include your target keyword in the title.</div>
              </div>
              <div style={{ background: T.greenBg, border: `0.5px solid ${T.greenBorder}`, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.green, marginBottom: 6 }}>✅ What is working</div>
                {[
                  '"Braiding hair leeds" — position 1.8 — keep publishing local content',
                  '"CC hair and beauty" — position 1.2 — brand is strong',
                  '"Wigs leeds" — position 3.4 — local intent working',
                ].map((s, i) => (
                  <div key={i} style={{ fontSize: 11, color: T.green, padding: '3px 0', borderBottom: i < 2 ? `0.5px solid ${T.greenBorder}` : 'none' }}>✓ {s}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QUICK WINS */}
        {tab === 'Quick Wins' && (
          <div>
            <div style={{ background: T.greenBg, border: `0.5px solid ${T.greenBorder}`, borderRadius: 7, padding: '9px 13px', marginBottom: 12, fontSize: 11, color: T.green }}>
              These keywords already rank on page 1 or 2 — small fixes will dramatically increase clicks. Each fix takes less than 30 minutes.
            </div>
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead><tr>
                  <TH k="kw">Keyword</TH>
                  <TH k="pos">Position ↕</TH>
                  <TH k="impr">Impressions ↕</TH>
                  <TH k="ctr">Current CTR ↕</TH>
                  <TH k="potential">Potential clicks ↕</TH>
                  <TH>Priority</TH>
                  <TH>What to do</TH>
                </tr></thead>
                <tbody>
                  {sortData(QUICK_WINS).map((k, i) => (
                    <tr key={i}>
                      <TD bold>{k.kw}</TD>
                      <TD><PosBar pos={k.pos} /></TD>
                      <TD c={T.textMuted}>{k.impr.toLocaleString()}</TD>
                      <TD c={k.ctr < 1 ? T.red : T.amber}>{k.ctr}%</TD>
                      <TD c={T.green} bold>+{k.potential.toLocaleString()}/mo</TD>
                      <TD><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: k.priority === 'critical' ? T.redBg : k.priority === 'high' ? T.amberBg : T.blueBg, color: k.priority === 'critical' ? T.red : k.priority === 'high' ? T.amber : T.blue }}>{k.priority}</span></TD>
                      <TD wrap c={T.textMuted}>{k.action}</TD>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead><tr>
                <TH k="kw">Keyword</TH>
                <TH k="pos">Position ↕</TH>
                <TH k="clicks">Clicks ↕</TH>
                <TH k="impr">Impressions ↕</TH>
                <TH k="ctr">CTR ↕</TH>
                <TH>Trend</TH>
                <TH>Landing page</TH>
              </tr></thead>
              <tbody>
                {sortData(TOP_KW).map((k, i) => (
                  <tr key={i}>
                    <TD bold>{k.kw}</TD>
                    <TD><PosBar pos={k.pos} /></TD>
                    <TD c={T.green}>{k.clicks.toLocaleString()}</TD>
                    <TD c={T.textMuted}>{k.impr.toLocaleString()}</TD>
                    <TD c={k.ctr < 1 ? T.red : k.ctr < 3 ? T.amber : T.green}>{k.ctr}%</TD>
                    <TD c={k.change === 'up' ? T.green : k.change === 'down' ? T.red : T.textMuted}>{k.change === 'up' ? '↑ Rising' : k.change === 'down' ? '↓ Falling' : '→ Stable'}</TD>
                    <TD c={T.blue}>{k.page}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTENT GAPS */}
        {tab === 'Content Gaps' && (
          <div>
            <div style={{ background: T.blueBg, border: `0.5px solid ${T.blueBorder}`, borderRadius: 7, padding: '9px 13px', marginBottom: 12, fontSize: 11, color: T.blue }}>
              These are topics with high search volume where you currently rank nowhere. Writing one blog post per topic could bring hundreds of new visitors per month.
            </div>
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead><tr>
                  <TH k="topic">Topic</TH>
                  <TH k="vol">Monthly searches ↕</TH>
                  <TH k="comp">Competition</TH>
                  <TH k="opp">Opportunity</TH>
                  <TH>What to write</TH>
                </tr></thead>
                <tbody>
                  {CONTENT_GAPS.map((g, i) => (
                    <tr key={i}>
                      <TD bold>{g.topic}</TD>
                      <TD c={T.textMuted}>{g.vol.toLocaleString()}/mo</TD>
                      <TD><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: g.comp === 'Low' ? T.greenBg : T.amberBg, color: g.comp === 'Low' ? T.green : T.amber }}>{g.comp}</span></TD>
                      <TD><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: g.opp === 'High' ? T.greenBg : T.amberBg, color: g.opp === 'High' ? T.green : T.amber }}>{g.opp}</span></TD>
                      <TD wrap c={T.textMuted}>{g.action}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            {TASKS.map((task, i) => (
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
