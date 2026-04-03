import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const COLLECTIONS = [
  { name:'Relaxers & Texturisers', handle:'relaxers', impr:60000, clicks:312, pos:6.8, ctr:0.5, hasDesc:false, metaOk:false, priority:'critical' },
  { name:'Edge Control',           handle:'edge-control', impr:8900, clicks:76, pos:4.2, ctr:0.9, hasDesc:false, metaOk:false, priority:'critical' },
  { name:'Braiding Hair',          handle:'braiding-hair', impr:18900, clicks:54, pos:8.1, ctr:0.3, hasDesc:true, metaOk:false, priority:'high' },
  { name:'Human Hair Wigs',        handle:'human-hair-wigs', impr:6700, clicks:48, pos:9.4, ctr:0.7, hasDesc:false, metaOk:false, priority:'high' },
  { name:'Lace Front Wigs',        handle:'lace-front-wigs', impr:9800, clicks:24, pos:11.2, ctr:0.2, hasDesc:false, metaOk:false, priority:'high' },
  { name:'Synthetic Wigs',         handle:'synthetic-hair-wigs', impr:4200, clicks:31, pos:7.8, ctr:0.7, hasDesc:true, metaOk:true, priority:'medium' },
  { name:'Hair Extensions',        handle:'hair-extensions', impr:3800, clicks:28, pos:9.1, ctr:0.7, hasDesc:false, metaOk:false, priority:'medium' },
  { name:'Natural Hair Products',  handle:'moisturisers', impr:2900, clicks:19, pos:12.4, ctr:0.7, hasDesc:false, metaOk:false, priority:'medium' },
  { name:'Leave In Conditioner',   handle:'leavein-conditioner-hair-care', impr:2100, clicks:15, pos:8.9, ctr:0.7, hasDesc:false, metaOk:false, priority:'medium' },
  { name:'Hair Gels',              handle:'hair-styling-gels', impr:1890, clicks:14, pos:11.8, ctr:0.7, hasDesc:true, metaOk:true, priority:'low' },
]

const META_TEMPLATES = [
  { collection:'Relaxers & Texturisers', current:'Relaxers & Texturisers', suggested:'Buy Hair Relaxers UK — ORS, Dark & Lovely, TCB | CC Hair and Beauty Leeds', metaDesc:'Shop hair relaxers and texturisers at CC Hair and Beauty Leeds. ORS, Dark & Lovely, TCB, Optimum and more. In store at Chapeltown, Roundhay & City Centre or online with UK delivery.' },
  { collection:'Edge Control',           current:'Edge Control',           suggested:'Best Edge Control UK — Style Factor, Edge Booster | CC Hair and Beauty Leeds', metaDesc:'Buy the best edge control in the UK at CC Hair and Beauty. Style Factor Edge Booster, Got2b, Eco Styler and more. 3 Leeds stores or shop online at cchairandbeauty.com.' },
  { collection:'Braiding Hair',          current:'Braiding Hair',          suggested:'Braiding Hair UK — Xpression, Freetress, Outre | CC Hair and Beauty Leeds',  metaDesc:'Buy braiding hair in the UK at CC Hair and Beauty Leeds. Xpression, Freetress, Outre, Janet Collection and 1,000+ styles. In store at Chapeltown LS7, Roundhay LS8 and City Centre.' },
  { collection:'Human Hair Wigs',        current:'Human Hair Wigs',        suggested:'Human Hair Wigs UK — Lace Front & Full Wigs | CC Hair and Beauty Leeds',     metaDesc:'Shop human hair wigs at CC Hair and Beauty Leeds. Brazilian, Peruvian and Indian remy hair wigs. Try in store at Chapeltown LS7, Roundhay LS8 or City Centre. UK delivery available.' },
  { collection:'Lace Front Wigs',        current:'Lace Front Wigs',        suggested:'Lace Front Wigs UK — Human Hair & Synthetic | CC Hair and Beauty Leeds',     metaDesc:'Buy lace front wigs at CC Hair and Beauty Leeds. Human hair and synthetic lace fronts in every style and colour. Try before you buy in store across our 3 Leeds branches.' },
]

const PAGES = [
  { page:'Homepage',    url:'/', title:'CC Hair & Beauty', metaDesc: false, issue:'Store name uses & not "and". No location keyword in title.', fix:'CC Hair and Beauty Leeds — Afro Hair Shop Since 1979 | 23,000+ Products' },
  { page:'About',       url:'/pages/about', title:'About CC Hair and Beauty Leeds', metaDesc: true, issue:'Good — already fixed', fix:'No change needed' },
  { page:'Contact',     url:'/pages/contact', title:'Help & Contact', metaDesc: false, issue:'No location keyword. No brand name.', fix:'Contact CC Hair and Beauty Leeds — Find Your Nearest Branch' },
  { page:'Blog index',  url:'/blogs/news', title:'Chapeltown and Leeds Community News — CC Hair and Beauty', metaDesc: true, issue:'Good — already correct', fix:'No change needed' },
]

const TASKS = [
  { id:'wseo_t1', text:'Fix relaxers collection meta title and description', how:'Shopify → Online Store → Navigation → Catalog → Collections → Relaxers → Edit website SEO' },
  { id:'wseo_t2', text:'Fix edge control collection meta title and description', how:'Shopify → Collections → Edge Control → Edit website SEO' },
  { id:'wseo_t3', text:'Add 200-word description to Relaxers collection page', how:'Shopify → Collections → Relaxers → Description — include keywords: relaxer uk, ors relaxer, dark and lovely' },
  { id:'wseo_t4', text:'Add 200-word description to Edge Control collection page', how:'Shopify → Collections → Edge Control → Description — include: best edge control uk, style factor, edge booster' },
  { id:'wseo_t5', text:'Fix homepage meta title — add "Leeds" and "and"', how:'Shopify → Online Store → Preferences → Homepage title' },
  { id:'wseo_t6', text:'Fix braiding hair collection meta title', how:'Shopify → Collections → Braiding Hair → Edit website SEO' },
  { id:'wseo_t7', text:'Add 200-word description to Human Hair Wigs collection', how:'Shopify → Collections → Human Hair Wigs → Description' },
]

export default function WebsiteSEO() {
  const [tab, setTab] = useState('Collections')
  const [tasks, setTasks] = useState({})
  const [copied, setCopied] = useState(null)
  const [sort, setSort] = useState({ key: 'impr', dir: 'desc' })

  useEffect(() => {
    try { const t = localStorage.getItem('cc_wseo_tasks'); if(t) setTasks(JSON.parse(t)) } catch(e){}
  }, [])

  function tick(id) {
    const u = { ...tasks, [id]: !tasks[id] }
    setTasks(u); localStorage.setItem('cc_wseo_tasks', JSON.stringify(u))
  }

  function copyText(text, id) {
    navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  function doSort(key) {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  }

  const donePct = Math.round(TASKS.filter(t => tasks[t.id]).length / TASKS.length * 100)

  const sortedCollections = [...COLLECTIONS].sort((a, b) => {
    const av = a[sort.key], bv = b[sort.key]
    return sort.dir === 'desc' ? bv - av : av - bv
  })

  const TH = ({ children, k }) => (
    <th onClick={k ? () => doSort(k) : undefined} style={{ padding: '7px 11px', fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', background: T.bg, borderBottom: `0.5px solid ${T.border}`, whiteSpace: 'nowrap', cursor: k ? 'pointer' : 'default' }}>
      {children}{k ? <span style={{ marginLeft: 3, opacity: 0.5 }}>{sort.key === k ? (sort.dir === 'desc' ? '↓' : '↑') : '↕'}</span> : null}
    </th>
  )

  return (
    <>
      <Head><title>Website SEO — CC Intelligence</title></Head>
      <Shell title="Website SEO" subtitle="Collection pages · meta titles · page performance · 2,760 collections">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8, marginBottom: 12 }}>
          {[
            { l: 'Collections needing meta fix', v: '8', s: 'Critical or high priority', sc: T.red },
            { l: 'Collections with no description', v: '7', s: 'Thin content = low rankings', sc: T.amber },
            { l: 'Pages already fixed', v: '2', s: 'Homepage title, about page', sc: T.green },
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
            <span style={{ fontWeight: 600, color: T.text }}>Website SEO task progress</span>
            <span style={{ color: T.textMuted }}>{donePct}%</span>
          </div>
          <div style={{ height: 5, background: T.borderLight, borderRadius: 99, border: `0.5px solid ${T.border}`, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${donePct}%`, background: donePct === 100 ? T.green : T.blue, borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `0.5px solid ${T.border}`, marginBottom: 14, overflowX: 'auto' }}>
          {['Collections', 'Meta Templates', 'Pages', 'Tasks'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 14px', fontSize: 11, fontWeight: tab === t ? 600 : 400, color: tab === t ? T.blue : T.textMuted, background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${T.blue}` : '2px solid transparent', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Collections' && (
          <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'auto' }}>
            <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${T.border}`, background: T.bg, fontSize: 11, color: T.textMuted }}>
              Click column headers to sort. Red = fix today. Collections with high impressions but low CTR need new meta titles.
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead><tr>
                <TH>Collection</TH>
                <TH k="impr">Impressions ↕</TH>
                <TH k="clicks">Clicks ↕</TH>
                <TH k="pos">Position ↕</TH>
                <TH k="ctr">CTR ↕</TH>
                <TH>Has description</TH>
                <TH>Meta title</TH>
                <TH>Priority</TH>
                <TH>How to fix</TH>
              </tr></thead>
              <tbody>
                {sortedCollections.map((c, i) => (
                  <tr key={i} style={{ background: c.priority === 'critical' ? T.redBg : 'transparent' }}>
                    <td style={{ padding: '8px 11px', fontSize: 12, fontWeight: 600, color: T.text, borderBottom: `0.5px solid ${T.borderLight}`, whiteSpace: 'nowrap' }}>{c.name}</td>
                    <td style={{ padding: '8px 11px', fontSize: 12, color: T.textMuted, borderBottom: `0.5px solid ${T.borderLight}` }}>{c.impr.toLocaleString()}</td>
                    <td style={{ padding: '8px 11px', fontSize: 12, color: T.green, borderBottom: `0.5px solid ${T.borderLight}` }}>{c.clicks}</td>
                    <td style={{ padding: '8px 11px', fontSize: 12, color: c.pos <= 5 ? T.green : c.pos <= 10 ? T.amber : T.red, fontWeight: 600, borderBottom: `0.5px solid ${T.borderLight}` }}>{c.pos}</td>
                    <td style={{ padding: '8px 11px', fontSize: 12, color: c.ctr < 1 ? T.red : T.amber, fontWeight: 600, borderBottom: `0.5px solid ${T.borderLight}` }}>{c.ctr}%</td>
                    <td style={{ padding: '8px 11px', fontSize: 12, borderBottom: `0.5px solid ${T.borderLight}` }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: c.hasDesc ? T.greenBg : T.redBg, color: c.hasDesc ? T.green : T.red }}>{c.hasDesc ? '✓ Yes' : '✗ No'}</span>
                    </td>
                    <td style={{ padding: '8px 11px', fontSize: 12, borderBottom: `0.5px solid ${T.borderLight}` }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: c.metaOk ? T.greenBg : T.redBg, color: c.metaOk ? T.green : T.red }}>{c.metaOk ? '✓ Good' : '✗ Fix needed'}</span>
                    </td>
                    <td style={{ padding: '8px 11px', fontSize: 12, borderBottom: `0.5px solid ${T.borderLight}` }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: c.priority === 'critical' ? T.redBg : c.priority === 'high' ? T.amberBg : T.blueBg, color: c.priority === 'critical' ? T.red : c.priority === 'high' ? T.amber : T.blue }}>{c.priority}</span>
                    </td>
                    <td style={{ padding: '8px 11px', fontSize: 10, color: T.blue, borderBottom: `0.5px solid ${T.borderLight}`, whiteSpace: 'nowrap' }}>
                      Shopify → Collections → {c.name} → Edit SEO
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Meta Templates' && (
          <div>
            <div style={{ background: T.blueBg, border: `0.5px solid ${T.blueBorder}`, borderRadius: 7, padding: '9px 13px', marginBottom: 12, fontSize: 11, color: T.blue }}>
              Copy these exact titles and descriptions into Shopify. They are already optimised with the right keywords and character counts.
            </div>
            {META_TEMPLATES.map((m, i) => (
              <div key={i} style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12 }}>{m.collection}</div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Current title (bad)</div>
                  <div style={{ fontSize: 12, color: T.red, background: T.redBg, padding: '6px 10px', borderRadius: 6 }}>{m.current}</div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase' }}>New title — copy this ({m.suggested.length} chars)</div>
                    <button onClick={() => copyText(m.suggested, `title_${i}`)} style={{ fontSize: 10, color: '#fff', background: copied === `title_${i}` ? T.green : T.blue, border: 'none', borderRadius: 5, padding: '3px 10px', cursor: 'pointer' }}>
                      {copied === `title_${i}` ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: T.green, background: T.greenBg, padding: '6px 10px', borderRadius: 6 }}>{m.suggested}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase' }}>Meta description — copy this ({m.metaDesc.length} chars)</div>
                    <button onClick={() => copyText(m.metaDesc, `desc_${i}`)} style={{ fontSize: 10, color: '#fff', background: copied === `desc_${i}` ? T.green : T.blue, border: 'none', borderRadius: 5, padding: '3px 10px', cursor: 'pointer' }}>
                      {copied === `desc_${i}` ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, background: T.bg, padding: '6px 10px', borderRadius: 6, lineHeight: 1.5 }}>{m.metaDesc}</div>
                </div>
                <div style={{ fontSize: 10, color: T.blue, marginTop: 8 }}>→ Shopify → Online Store → Navigation → Collections → {m.collection} → Edit website SEO → paste both fields → Save</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Pages' && (
          <div>
            {PAGES.map((p, i) => (
              <div key={i} style={{ background: T.surface, border: `0.5px solid ${p.fix === 'No change needed' ? T.greenBorder : T.redBorder}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{p.page}</span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>{p.url}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: p.fix === 'No change needed' ? T.greenBg : T.redBg, color: p.fix === 'No change needed' ? T.green : T.red }}>
                    {p.fix === 'No change needed' ? '✓ Good' : 'Fix needed'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Current: <span style={{ color: T.text }}>{p.title}</span></div>
                {p.fix !== 'No change needed' && <div style={{ fontSize: 11, color: T.green }}>Fix to: <span style={{ fontWeight: 600 }}>{p.fix}</span></div>}
                <div style={{ fontSize: 10, color: T.red, marginTop: 4 }}>{p.issue}</div>
              </div>
            ))}
          </div>
        )}

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
