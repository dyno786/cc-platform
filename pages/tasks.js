import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { useAuth } from '../components/Auth'
import { T } from '../lib/theme'

const TASK_GROUPS = [
  { title:'🚨 Critical — Do Today', color:T.red, tasks:[
    { id:'t1', text:'Scale Human Hair Brands to £500/month — 11.92x ROAS on mobile, only £62 mobile spend in 2 years', managerOnly:true },
    { id:'t2', text:'Add ALL energy drink negative keywords (Red Bull, Monster, Sour Patch Kids) — cost £1,285 over 2 years at 0.26x ROAS', managerOnly:true },
    { id:'t3', text:'Reduce Shopify All Products mobile budget 40% — £27,521 spend at only 1.67x ROAS on mobile', managerOnly:true },
  ]},
  { title:'📝 Blog & Content', color:T.purple, tasks:[
    { id:'t4', text:'Publish Local SEO blog post — Day 1: Where to Buy Braiding Hair in Leeds 2026' },
    { id:'t5', text:'Publish Paid Ads SEO blog post — Day 1: Bsset Curl Cream Review' },
    { id:'t6', text:'Publish Organic SEO blog post — Day 1: Best Relaxer UK 2026' },
    { id:'t7', text:'Post GBP update — Chapeltown: Bsset Curl Cream spotlight' },
    { id:'t8', text:'Post GBP update — Roundhay: Bsset Curl Cream spotlight' },
    { id:'t9', text:'Post GBP update — City Centre: Bsset Curl Cream spotlight' },
  ]},
  { title:'⭐ Reviews', color:T.amber, tasks:[
    { id:'t10', text:'Check Google Reviews — Chapeltown LS7 — reply to all new reviews' },
    { id:'t11', text:'Check Google Reviews — Roundhay LS8 — reply to all new reviews' },
    { id:'t12', text:'Check Google Reviews — City Centre — reply to all new reviews' },
    { id:'t13', text:'Send WhatsApp review requests to yesterday\'s customers at 2pm' },
  ]},
  { title:'🛒 Orders & Carts', color:T.blue, tasks:[
    { id:'t14', text:'Check overnight Shopify orders — failed payments, address issues' },
    { id:'t15', text:'Check abandoned carts — send WhatsApp follow-up with discount code' },
    { id:'t16', text:'Reply to all customer emails and messages within 2 hours' },
  ]},
  { title:'📦 Stock', color:T.green, tasks:[
    { id:'t17', text:'Check low stock alerts — place reorders for anything critical' },
    { id:'t18', text:'Check Beauty Star order app — any pending orders?' },
    { id:'t19', text:'Hide any out-of-stock products on Shopify' },
  ]},
]

function TaskRow({ task, done, onToggle }) {
  return (
    <div onClick={onToggle} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 16px',borderBottom:`0.5px solid ${T.borderLight}`,cursor:'pointer',background:done?T.greenBg:'transparent',transition:'background 0.15s'}}>
      <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${done?T.green:T.border}`,background:done?T.green:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {done && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span style={{flex:1,fontSize:12,color:done?T.textMuted:T.text,textDecoration:done?'line-through':'none',lineHeight:1.4}}>{task.text}</span>
    </div>
  )
}

export default function Tasks() {
  const { isManager } = useAuth()
  const [done, setDone] = useState({})

  useEffect(() => {
    try { const s = localStorage.getItem('cc_tasks_v2'); if(s) setDone(JSON.parse(s)) } catch(e){}
  }, [])

  function toggle(id) {
    const u = { ...done, [id]: !done[id] }
    setDone(u)
    localStorage.setItem('cc_tasks_v2', JSON.stringify(u))
  }

  const allTasks = TASK_GROUPS.flatMap(g => g.tasks).filter(t => !t.managerOnly || isManager)
  const doneCount = allTasks.filter(t => done[t.id]).length
  const pct = Math.round(doneCount / allTasks.length * 100)

  return (
    <>
      <Head><title>Tasks — CC Intelligence</title></Head>
      <Shell title="Tasks" subtitle="Daily staff task checklist — click to complete">
        <div style={{maxWidth:860,margin:'0 auto'}}>
          {/* Progress */}
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:600,color:T.text}}>Today's progress</span>
              <span style={{fontSize:12,color:T.textMuted}}>{doneCount}/{allTasks.length} tasks · {pct}%</span>
            </div>
            <div style={{height:6,background:T.borderLight,borderRadius:99,border:`0.5px solid ${T.border}`,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${pct}%`,background:pct===100?T.green:T.blue,borderRadius:99,transition:'width 0.3s'}}/>
            </div>
          </div>

          {TASK_GROUPS.map((group,gi) => {
            const tasks = group.tasks.filter(t => !t.managerOnly || isManager)
            if (!tasks.length) return null
            const groupDone = tasks.filter(t => done[t.id]).length
            return (
              <div key={gi} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden',marginBottom:10}}>
                <div style={{padding:'10px 16px',borderBottom:`0.5px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:T.bg}}>
                  <span style={{fontSize:13,fontWeight:600,color:T.text}}>{group.title}</span>
                  <span style={{fontSize:11,color:T.textMuted}}>{groupDone}/{tasks.length}</span>
                </div>
                {tasks.map(task => (
                  <TaskRow key={task.id} task={task} done={!!done[task.id]} onToggle={()=>toggle(task.id)}/>
                ))}
              </div>
            )
          })}

          <button onClick={()=>{setDone({});localStorage.removeItem('cc_tasks_v2')}}
            style={{fontSize:11,color:T.textMuted,background:'none',border:`0.5px solid ${T.border}`,borderRadius:6,padding:'6px 14px',marginTop:4}}>
            Reset all tasks
          </button>
        </div>
      </Shell>
    </>
  )
}
