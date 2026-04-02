import Head from 'next/head'
import Nav from '../components/Nav'
import { useState } from 'react'


const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8',
}

const TEAM = ['Mohammed','Branch managers','Social media team','Content team','Shopify team','All staff']

const DEFAULT_TASKS = [
  { id:1,  pillar:'Local SEO',  pc:'#22c55e', text:'Reply to 3 unanswered Google reviews — AI drafts ready',                    assign:'Mohammed',         when:'Today',     urgent:true,  done:false, link:'/' },
  { id:2,  pillar:'Local SEO',  pc:'#22c55e', text:'Post weekly offer to GBP — all 3 branches (Chapeltown, Roundhay, City Centre)', assign:'Social media team', when:'Today',     urgent:false, done:false, link:'/' },
  { id:3,  pillar:'Local SEO',  pc:'#22c55e', text:'Upload new product photos to GBP — Roundhay branch',                        assign:'Branch managers',  when:'Today',     urgent:false, done:false },
  { id:4,  pillar:'Paid Ads',   pc:'#f59e0b', text:'Set desktop bid +30% on Shopify All Products campaign',                      assign:'Mohammed',         when:'Today',     urgent:true,  done:false, link:'/paid-ads' },
  { id:5,  pillar:'Paid Ads',   pc:'#f59e0b', text:'Scale ORS ad group budget 10x — CPA only 47p, massive ROI',                  assign:'Mohammed',         when:'Today',     urgent:true,  done:false, link:'/paid-ads' },
  { id:6,  pillar:'Paid Ads',   pc:'#f59e0b', text:'Undo Nivea cream exclusion — was converting at £3.02 CPA',                   assign:'Mohammed',         when:'Today',     urgent:true,  done:false, link:'/paid-ads' },
  { id:7,  pillar:'Organic',    pc:'#3b82f6', text:'Publish blog: "Best relaxers for natural hair in Leeds 2026"',               assign:'Content team',     when:'Today',     urgent:false, done:false, link:'/organic-seo' },
  { id:8,  pillar:'Local SEO',  pc:'#22c55e', text:'Check all 3 GBP listings for accuracy and unanswered Q&A',                   assign:'Mohammed',         when:'This week', urgent:false, done:false },
  { id:9,  pillar:'Organic',    pc:'#3b82f6', text:'Fix meta description — Wigs collection page (score: 62)',                    assign:'Content team',     when:'This week', urgent:false, done:false, link:'/organic-seo' },
  { id:10, pillar:'Organic',    pc:'#3b82f6', text:'Add COLOUR10 banner to Hair Dye & Colour collection page',                   assign:'Shopify team',     when:'This week', urgent:false, done:false },
  { id:11, pillar:'Organic',    pc:'#3b82f6', text:'Fix 12 products with missing meta descriptions — use SEO Audit AI Fix',      assign:'Content team',     when:'This week', urgent:false, done:false, link:'/organic-seo' },
  { id:12, pillar:'Paid Ads',   pc:'#f59e0b', text:'Export and review negative keywords — copy list to Google Ads',              assign:'Mohammed',         when:'This week', urgent:false, done:false, link:'/paid-ads' },
  { id:13, pillar:'Local SEO',  pc:'#22c55e', text:'Respond to City Centre GBP Q&A — 1 unanswered',                             assign:'Branch managers',  when:'This week', urgent:false, done:false },
  { id:14, pillar:'Paid Ads',   pc:'#f59e0b', text:'Pause H&Shoulders campaign — £180 spent, zero conversions',                  assign:'Mohammed',         when:'This week', urgent:true,  done:false, link:'/paid-ads' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState(DEFAULT_TASKS)
  const [filter, setFilter] = useState('all')
  const [assignFilter, setAssignFilter] = useState('all')
  const [generating, setGenerating] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newPillar, setNewPillar] = useState('Organic')
  const [newAssign, setNewAssign] = useState('Mohammed')
  const [newWhen, setNewWhen] = useState('Today')

  function toggleDone(id) {
    setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function addTask() {
    if (!newTask.trim()) return
    const pillarColors = { 'Local SEO':'#22c55e', 'Organic':'#3b82f6', 'Paid Ads':'#f59e0b' }
    setTasks(p => [...p, {
      id: Date.now(), pillar: newPillar, pc: pillarColors[newPillar] || C.accent,
      text: newTask, assign: newAssign, when: newWhen, urgent: false, done: false
    }])
    setNewTask('')
    setShowAdd(false)
  }

  async function generateAITasks() {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-gbp-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branches: ['all'], topic: `Generate 4 specific actionable tasks for CC Hair & Beauty Leeds for today ${new Date().toDateString()}. Return as plain text numbered list. Mix of: review replies needed, GBP posts due, product SEO fixes, ad optimisations. Be specific with numbers and branch names.` })
      })
      const d = await res.json()
      if (d.post) {
        const lines = d.post.split('\n').filter(l => l.trim()).slice(0, 4)
        const pillarCycle = ['Local SEO','Organic','Paid Ads','Local SEO']
        const pillarColors = { 'Local SEO':'#22c55e', 'Organic':'#3b82f6', 'Paid Ads':'#f59e0b' }
        const newTasks = lines.map((line, i) => ({
          id: Date.now() + i,
          pillar: pillarCycle[i],
          pc: pillarColors[pillarCycle[i]],
          text: line.replace(/^\d+[\.\)]\s*/, '').trim(),
          assign: 'Mohammed',
          when: 'Today',
          urgent: false,
          done: false,
        }))
        setTasks(p => [...p, ...newTasks])
      }
    } catch(e) { console.error(e) }
    setGenerating(false)
  }

  const filtered = tasks.filter(t => {
    if (filter === 'today'   && t.when !== 'Today') return false
    if (filter === 'urgent'  && !t.urgent) return false
    if (filter === 'done'    && !t.done) return false
    if (filter === 'pending' && t.done) return false
    if (assignFilter !== 'all' && t.assign !== assignFilter) return false
    return true
  })

  const done = tasks.filter(t => t.done).length
  const total = tasks.length
  const pct = Math.round(done / total * 100)
  const urgentCount = tasks.filter(t => t.urgent && !t.done).length

  // Group by pillar
  const groups = {}
  filtered.forEach(t => {
    if (!groups[t.pillar]) groups[t.pillar] = []
    groups[t.pillar].push(t)
  })

  const whenColor = (t) => {
    if (t.done) return { bg: C.green+'20', color: C.green }
    if (t.urgent) return { bg: 'rgba(239,68,68,.15)', color: C.red }
    if (t.when === 'Today') return { bg: 'rgba(99,102,241,.15)', color: C.accent2 }
    return { bg: 'rgba(139,144,167,.1)', color: C.text3 }
  }

  return (
    <>
      <Head>
        <title>Tasks — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button,input,select{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      <Nav/>

      <div style={{maxWidth:1100,margin:'0 auto',padding:20}}>

        {/* Progress bar */}
        <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16,marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontWeight:700,fontSize:15}}>
              {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} — {done} of {total} done
            </span>
            <span style={{color:C.text2,fontWeight:600}}>{pct}% complete</span>
          </div>
          <div style={{height:8,background:C.surface2,borderRadius:4,overflow:'hidden',marginBottom:14}}>
            <div style={{width:pct+'%',height:'100%',background:C.green,borderRadius:4,transition:'width .4s'}}/>
          </div>
          {/* Filters */}
          <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
            {['all','today','urgent','pending','done'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:'4px 12px', borderRadius:6, fontSize:12, cursor:'pointer',
                border: filter===f ? 'none' : '1px solid '+C.border,
                background: filter===f ? C.accent : C.surface2,
                color: C.text, textTransform:'capitalize',
              }}>{f === 'all' ? `All (${tasks.length})` : f === 'today' ? `Today (${tasks.filter(t=>t.when==='Today').length})` : f === 'urgent' ? `Urgent (${urgentCount})` : f === 'pending' ? `Pending (${tasks.filter(t=>!t.done).length})` : `Done (${done})`}</button>
            ))}
            <div style={{marginLeft:'auto'}}>
              <select value={assignFilter} onChange={e => setAssignFilter(e.target.value)} style={{background:C.surface2,border:'1px solid '+C.border,borderRadius:6,color:C.text,padding:'5px 10px',fontSize:12}}>
                <option value="all">All team members</option>
                {TEAM.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Add task form */}
        {showAdd && (
          <div style={{background:C.surface,border:'1px solid '+C.accent+'50',borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontWeight:600,marginBottom:12,color:C.accent2}}>Add new task</div>
            <input
              value={newTask} onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Task description..."
              style={{width:'100%',background:C.surface2,border:'1px solid '+C.border,borderRadius:8,color:C.text,fontSize:13,padding:'9px 12px',outline:'none',marginBottom:10}}
              autoFocus
            />
            <div style={{display:'flex',gap:8}}>
              <select value={newPillar} onChange={e => setNewPillar(e.target.value)} style={{background:C.surface2,border:'1px solid '+C.border,borderRadius:7,color:C.text,padding:'7px 10px',fontSize:13,flex:1}}>
                <option>Local SEO</option><option>Organic</option><option>Paid Ads</option>
              </select>
              <select value={newAssign} onChange={e => setNewAssign(e.target.value)} style={{background:C.surface2,border:'1px solid '+C.border,borderRadius:7,color:C.text,padding:'7px 10px',fontSize:13,flex:1}}>
                {TEAM.map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={newWhen} onChange={e => setNewWhen(e.target.value)} style={{background:C.surface2,border:'1px solid '+C.border,borderRadius:7,color:C.text,padding:'7px 10px',fontSize:13}}>
                <option>Today</option><option>This week</option><option>Next week</option>
              </select>
              <button onClick={addTask} style={{padding:'7px 18px',borderRadius:7,border:'none',background:C.accent,color:'#fff',fontWeight:600,fontSize:13,cursor:'pointer'}}>Add</button>
              <button onClick={() => setShowAdd(false)} style={{padding:'7px 12px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.text2,cursor:'pointer',fontSize:13}}>Cancel</button>
            </div>
          </div>
        )}

        {/* Task groups */}
        {Object.keys(groups).length === 0 && (
          <div style={{textAlign:'center',padding:60,color:C.text3}}>
            <div style={{fontSize:40,marginBottom:12}}>🎉</div>
            <div style={{fontSize:16}}>No tasks match this filter</div>
          </div>
        )}

        {Object.entries(groups).map(([pillar, pillarTasks]) => (
          <div key={pillar} style={{marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:pillarTasks[0].pc}}/>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:pillarTasks[0].pc}}>
                {pillar}
              </span>
              <span style={{color:C.text3,fontSize:12}}>— {pillarTasks.filter(t => !t.done).length} remaining</span>
            </div>
            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,overflow:'hidden'}}>
              {pillarTasks.map((t, i) => {
                const wc = whenColor(t)
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleDone(t.id)}
                    style={{
                      display:'flex', alignItems:'flex-start', gap:12, padding:'13px 16px',
                      borderBottom: i < pillarTasks.length-1 ? '1px solid '+C.border : 'none',
                      cursor:'pointer',
                      background: t.done ? 'rgba(34,197,94,.02)' : 'transparent',
                      transition:'background .15s',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width:20, height:20, borderRadius:5, flexShrink:0, marginTop:1,
                      background: t.done ? t.pc : 'transparent',
                      border: '2px solid '+(t.done ? t.pc : C.border),
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      {t.done && <span style={{color:'#000',fontSize:11,fontWeight:800}}>✓</span>}
                    </div>

                    {/* Content */}
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                        <span style={{
                          color: t.done ? C.text3 : C.text, fontSize:14, fontWeight:500,
                          textDecoration: t.done ? 'line-through' : 'none',
                        }}>{t.text}</span>
                        {t.urgent && !t.done && (
                          <span style={{background:'rgba(239,68,68,.15)',color:C.red,padding:'1px 7px',borderRadius:99,fontSize:10,fontWeight:700,flexShrink:0}}>URGENT</span>
                        )}
                      </div>
                      <div style={{display:'flex',gap:14,color:C.text3,fontSize:12,alignItems:'center'}}>
                        <span>👤 {t.assign}</span>
                        {t.link && (
                          <a href={t.link} onClick={e => e.stopPropagation()} style={{color:C.accent2,textDecoration:'none',fontSize:12}}>
                            → Open tab
                          </a>
                        )}
                      </div>
                    </div>

                    {/* When badge */}
                    <span style={{
                      background: wc.bg, color: wc.color,
                      padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:600, flexShrink:0,
                    }}>
                      {t.done ? 'Done' : t.urgent ? 'Urgent' : t.when}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
