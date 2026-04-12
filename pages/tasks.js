import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const STATIC_TASKS = {
  daily: [
    // SEO
    { id:'d_sc_check', role:'seo', label:'Check Search Console for penalties or traffic drops', link:'/organic-seo', priority:'high' },
    { id:'d_gbp_reviews', role:'seo', label:'Check GBP for new reviews across all 3 branches — respond within 24hrs', link:'/local-seo', priority:'high' },
    { id:'d_rank_check', role:'seo', label:'Check rankings for top 20 keywords — flag any drops over 3 positions', link:'/organic-seo', priority:'medium' },
    { id:'d_broken_links', role:'seo', label:'Scan for any new 404 errors or broken links', link:'/website-seo', priority:'medium' },
    // Ads
    { id:'d_ads_check', role:'ads', label:'Check Google Ads — any campaigns overspending or underperforming overnight', link:'/paid-ads', priority:'high' },
    { id:'d_search_terms', role:'ads', label:'Review new search terms — add any irrelevant ones as negative keywords', link:'/paid-ads', priority:'high' },
    // Store
    { id:'d_abandoned', role:'staff', label:'Check abandoned carts — send WhatsApp messages to any new ones', link:'/abandoned-carts', priority:'high' },
    { id:'d_orders', role:'staff', label:'Check todays orders — flag any issues to manager', link:'/', priority:'medium' },
  ],
  weekly: [
    // SEO
    { id:'w_sc_report', role:'seo', label:'Pull Search Console data — compare clicks and impressions week on week', link:'/organic-seo', priority:'high' },
    { id:'w_blog', role:'seo', label:'Write and publish 1 SEO blog post targeting a priority keyword', link:'/blog-planner', priority:'high' },
    { id:'w_collections', role:'seo', label:'Optimise 10 Shopify collection pages — H1, meta, body copy', link:'/website-seo', priority:'medium' },
    { id:'w_gbp_posts', role:'seo', label:'Publish 1 GBP post per branch (3 total) — product, offer or event', link:'/local-seo', priority:'high' },
    { id:'w_citations', role:'seo', label:'Build 2-3 local citations — submit to Leeds business directories', link:'/local-seo', priority:'low' },
    { id:'w_internal_links', role:'seo', label:'Internal linking audit — find pages with no links pointing to them', link:'/website-seo', priority:'medium' },
    // Ads
    { id:'w_ads_upload', role:'ads', label:'Download Google Ads reports and run full audit on platform', link:'/data-upload', priority:'high' },
    { id:'w_negative_kw', role:'ads', label:'Add negative keywords from search terms report to campaigns', link:'/paid-ads', priority:'high' },
    { id:'w_budget_check', role:'ads', label:'Review campaign budgets — scale what is working, reduce what is not', link:'/paid-ads', priority:'high' },
    { id:'w_social', role:'staff', label:'Post 3 social media posts — photo or reel per branch', link:'/social-upload', priority:'medium' },
    { id:'w_reorders', role:'staff', label:'Check reorder reminders — follow up with customers due to reorder', link:'/abandoned-carts', priority:'medium' },
  ],
  monthly: [
    // SEO
    { id:'m_rank_report', role:'seo', label:'Full keyword ranking report — track all target keywords, identify movers', link:'/organic-seo', priority:'high' },
    { id:'m_technical', role:'seo', label:'Technical SEO audit — duplicate titles, thin content, redirect chains', link:'/website-seo', priority:'high' },
    { id:'m_cwv', role:'seo', label:'Core Web Vitals review — check LCP, CLS scores in Search Console', link:'/website-seo', priority:'medium' },
    { id:'m_backlinks', role:'seo', label:'Link building — contact 10 Leeds sites for backlink opportunities', link:'/website-seo', priority:'medium' },
    { id:'m_content_audit', role:'seo', label:'Content audit — review bottom 20 pages, improve or consolidate', link:'/organic-seo', priority:'medium' },
    { id:'m_competitor', role:'seo', label:'Competitor analysis — what content did top competitors publish this month', link:'/organic-seo', priority:'low' },
    { id:'m_seo_report', role:'seo', label:'Monthly SEO report — traffic, rankings, GBP, what worked, plan next month', link:'/organic-seo', priority:'high' },
    // Ads
    { id:'m_ads_report', role:'ads', label:'Monthly Google Ads report — spend, ROAS, conversions vs previous month', link:'/paid-ads', priority:'high' },
    { id:'m_merchant', role:'ads', label:'Review Google Merchant Center — fix disapproved products, update feed', link:'/paid-ads', priority:'high' },
    { id:'m_ad_copy', role:'ads', label:'Review ad copy performance — pause underperforming ads, write new ones', link:'/paid-ads', priority:'medium' },
    { id:'m_events', role:'ads', label:'Review upcoming events — plan budget increases for seasonal opportunities', link:'/events', priority:'medium' },
    { id:'m_gbp_report', role:'seo', label:'GBP performance report — calls, direction requests, clicks per branch', link:'/local-seo', priority:'high' },
  ]
}

const ROLES = [
  { id:'all', label:'All Tasks', color:T.blue },
  { id:'seo', label:'SEO Specialist', color:'#7c3aed' },
  { id:'ads', label:'PPC Manager', color:T.blue },
  { id:'staff', label:'Branch Staff', color:T.green },
]

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function Tasks() {
  const [period, setPeriod] = useState('daily')
  const [role, setRole] = useState('all')
  const [done, setDone] = useState({})
  const [adsData, setAdsData] = useState(null)
  const [adsDate, setAdsDate] = useState(null)
  const [eventTasks, setEventTasks] = useState([])

  useEffect(() => {
    try {
      const d = localStorage.getItem('cc_task_done_'+period)
      if (d) setDone(JSON.parse(d))
      const a = localStorage.getItem('cc_ads_analysis')
      if (a) setAdsData(JSON.parse(a))
      const ad = localStorage.getItem('cc_ads_analysis_date')
      if (ad) setAdsDate(new Date(ad))
    } catch(e) {}

    // Generate event tasks from upcoming events
    const upcoming = [
      { id:'carnival', name:'Leeds West Indian Carnival', date:'2026-08-24', icon:'🎉' },
      { id:'mela', name:'Leeds Mela', date:'2026-07-19', icon:'🌸' },
      { id:'eid_adha', name:'Eid al-Adha', date:'2026-06-06', icon:'🌙' },
      { id:'leeds_festival', name:'Leeds Festival', date:'2026-08-21', icon:'🎸' },
      { id:'christmas', name:'Christmas', date:'2026-12-25', icon:'🎄' },
      { id:'back_to_school', name:'Back to School', date:'2026-09-01', icon:'🎒' },
      { id:'black_history', name:'Black History Month', date:'2026-10-01', icon:'✊' },
      { id:'natural_hair_week', name:'Natural Hair Week', date:'2026-05-04', icon:'💇' },
    ].filter(e => {
      const d = daysUntil(e.date)
      return d >= 0 && d <= 42
    }).map(e => ({
      id: 'evt_'+e.id,
      role: 'ads',
      label: `${e.icon} ${e.name} in ${daysUntil(e.date)} days — prepare content, ads budget and social posts`,
      link: '/events',
      priority: daysUntil(e.date) <= 14 ? 'high' : 'medium',
      isEvent: true,
    }))
    setEventTasks(upcoming)
  }, [period])

  function tick(id) {
    const u = { ...done, [id]: !done[id] }
    setDone(u)
    try { localStorage.setItem('cc_task_done_'+period, JSON.stringify(u)) } catch(e) {}
  }

  function resetDone() {
    setDone({})
    try { localStorage.removeItem('cc_task_done_'+period) } catch(e) {}
  }

  // Generate dynamic tasks from ads data
  const dynamicTasks = []
  if (adsData) {
    if (adsData.biggestWaste) {
      dynamicTasks.push({
        id:'dyn_waste', role:'ads',
        label:`🚨 Fix biggest waste: ${adsData.biggestWaste}`,
        link:'/paid-ads', priority:'high', isDynamic:true,
      })
    }
    if (adsData.scaleOpportunity) {
      dynamicTasks.push({
        id:'dyn_scale', role:'ads',
        label:`🚀 Scale opportunity: ${adsData.scaleOpportunity}`,
        link:'/paid-ads', priority:'high', isDynamic:true,
      })
    }
    ;(adsData.weeklyTasks || []).forEach((t, i) => {
      dynamicTasks.push({
        id:`dyn_task_${i}`, role:'ads',
        label:t, link:'/paid-ads', priority:i < 2 ? 'high' : 'medium', isDynamic:true,
      })
    })
  }

  const allTasks = [
    ...dynamicTasks,
    ...eventTasks,
    ...(STATIC_TASKS[period] || []),
  ]

  const filtered = allTasks.filter(t => role === 'all' || t.role === role)
  const doneCount = filtered.filter(t => done[t.id]).length
  const pct = filtered.length ? Math.round(doneCount / filtered.length * 100) : 0

  const priorityOrder = { high:0, medium:1, low:2 }
  const sorted = [...filtered].sort((a,b) => {
    if (done[a.id] !== done[b.id]) return done[a.id] ? 1 : -1
    return (priorityOrder[a.priority]||1) - (priorityOrder[b.priority]||1)
  })

  const priorityColor = p => p==='high'?T.red:p==='medium'?T.amber:T.textMuted
  const roleColor = r => r==='seo'?'#7c3aed':r==='ads'?T.blue:r==='staff'?T.green:T.textMuted
  const roleLabel = r => r==='seo'?'SEO':r==='ads'?'PPC':r==='staff'?'Staff':''

  return (
    <>
      <Head><title>Task List — CC Intelligence</title></Head>
      <Shell title="Master Task List" subtitle="Daily, weekly and monthly tasks for SEO, PPC and staff — generated from your real data">

        {/* Data status */}
        {adsData ? (
          <div style={{background:T.greenBg,border:'0.5px solid '+T.greenBorder,borderRadius:8,padding:'9px 14px',marginBottom:12,fontSize:11,color:T.green,display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:T.green}}/>
            <span><strong>Live data loaded</strong> — tasks generated from your Google Ads audit ({adsDate?.toLocaleDateString('en-GB')})</span>
            <a href="/data-upload" style={{marginLeft:'auto',color:T.blue,fontWeight:700,textDecoration:'none'}}>Update →</a>
          </div>
        ) : (
          <div style={{background:T.amberBg,border:'0.5px solid '+T.amber+'40',borderRadius:8,padding:'9px 14px',marginBottom:12,fontSize:11,color:'#9a6700',display:'flex',gap:8}}>
            <span>⚠ No audit data — showing standard task list. <a href="/data-upload" style={{color:'#9a6700',fontWeight:700}}>Upload Google Ads data</a> to get tasks specific to your campaigns.</span>
          </div>
        )}

        {/* Period tabs */}
        <div style={{display:'flex',gap:4,marginBottom:10,borderBottom:'1px solid '+T.border}}>
          {[{id:'daily',label:'Daily'},{id:'weekly',label:'Weekly'},{id:'monthly',label:'Monthly'}].map(p=>(
            <button key={p.id} onClick={()=>{setPeriod(p.id);setDone({})}} style={{
              padding:'7px 18px',fontSize:12,fontWeight:600,border:'none',background:'none',
              borderBottom:period===p.id?'2px solid '+T.blue:'2px solid transparent',
              color:period===p.id?T.blue:T.textMuted,cursor:'pointer',
            }}>{p.label}</button>
          ))}
        </div>

        {/* Role filter */}
        <div style={{display:'flex',gap:5,marginBottom:12,flexWrap:'wrap'}}>
          {ROLES.map(r=>(
            <button key={r.id} onClick={()=>setRole(r.id)} style={{
              padding:'4px 12px',fontSize:11,fontWeight:600,borderRadius:20,cursor:'pointer',
              background:role===r.id?r.color:T.bg,
              color:role===r.id?'#fff':T.textMuted,
              border:'1px solid '+(role===r.id?r.color:T.border),
            }}>{r.label}</button>
          ))}
        </div>

        {/* Progress */}
        <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'12px 14px',marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:700,color:T.text}}>{doneCount} of {filtered.length} tasks done today</span>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:700,color:pct>=100?T.green:pct>=50?T.amber:T.red}}>{pct}%</span>
              <button onClick={resetDone} style={{fontSize:10,color:T.textMuted,background:'none',border:'0.5px solid '+T.border,borderRadius:4,padding:'2px 8px',cursor:'pointer'}}>Reset</button>
            </div>
          </div>
          <div style={{height:8,background:T.borderLight,borderRadius:99,overflow:'hidden'}}>
            <div style={{width:pct+'%',height:'100%',background:pct>=100?T.green:pct>=50?T.amber:T.blue,borderRadius:99,transition:'width 0.3s'}}/>
          </div>
        </div>

        {/* Task list */}
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {sorted.map((task, i) => {
            const isDone = !!done[task.id]
            return (
              <div key={task.id} style={{
                background:isDone?T.bg:T.surface,
                border:'0.5px solid '+(isDone?T.borderLight:T.border),
                borderLeft:'3px solid '+(isDone?T.borderLight:task.isDynamic?T.green:task.isEvent?'#E1306C':priorityColor(task.priority)),
                borderRadius:7,padding:'10px 12px',
                display:'flex',alignItems:'center',gap:10,
                opacity:isDone?0.6:1,
                transition:'all 0.2s',
              }}>
                <input type="checkbox" checked={isDone} onChange={()=>tick(task.id)}
                  style={{width:16,height:16,cursor:'pointer',flexShrink:0,accentColor:T.blue}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:isDone?400:600,color:isDone?T.textMuted:T.text,textDecoration:isDone?'line-through':'none',lineHeight:1.4}}>
                    {task.label}
                  </div>
                  <div style={{display:'flex',gap:6,marginTop:3,alignItems:'center'}}>
                    <span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:3,background:roleColor(task.role)+'20',color:roleColor(task.role),textTransform:'uppercase'}}>{roleLabel(task.role)}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:3,background:priorityColor(task.priority)+'20',color:priorityColor(task.priority),textTransform:'uppercase'}}>{task.priority}</span>
                    {task.isDynamic && <span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:3,background:T.greenBg,color:T.green}}>FROM YOUR DATA</span>}
                    {task.isEvent && <span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:3,background:'#fff0f5',color:'#E1306C'}}>EVENT</span>}
                  </div>
                </div>
                <a href={task.link} style={{fontSize:10,color:T.blue,textDecoration:'none',fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}>
                  Go →
                </a>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{padding:40,textAlign:'center',color:T.textMuted,fontSize:12}}>
            No tasks for this filter
          </div>
        )}

      </Shell>
    </>
  )
}
