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

const NAV = [
  { id:'overview',     label:'Overview',           icon:'⬡',  page:null,               group:'main' },
  { id:'tasks',        label:'Tasks',              icon:'✅', page:'/tasks',           group:'main' },
  { id:'local-seo',    label:'Local SEO',          icon:'📍', page:'/local-seo',       group:'seo' },
  { id:'organic-seo',  label:'Organic SEO',        icon:'🔍', page:'/organic-seo',     group:'seo' },
  { id:'paid-ads',     label:'Paid Ads',           icon:'📊', page:'/paid-ads',        group:'ads' },
  { id:'reviews',      label:'Reviews',            icon:'⭐', page:null,               group:'main' },
  { id:'carts',        label:'Abandoned Carts',    icon:'🛒', page:'/abandoned-carts', group:'main' },
  { id:'launch',       label:'New Product Launch', icon:'🚀', page:null,               group:'shopify' },
  { id:'shopify',      label:'Shopify Content',    icon:'🛍', page:'/shopify-content', group:'shopify' },
  { id:'ispy',         label:'i-Spy Competitors',  icon:'🕵️', page:null,               group:'intel' },
  { id:'audit',        label:'Audit',              icon:'📋', page:null,               group:'intel' },
  { id:'content',      label:'Content Studio',     icon:'✍️', page:'/content-studio',  group:'content' },
  { id:'performance',  label:'Performance',        icon:'📈', page:'/performance',     group:'main' },
]

const GROUPS = [
  { id:'main',    label:'Dashboard' },
  { id:'seo',     label:'SEO' },
  { id:'ads',     label:'Advertising' },
  { id:'shopify', label:'Shopify' },
  { id:'content', label:'Content' },
  { id:'intel',   label:'Intelligence' },
]

const STATUS_DOTS = [
  { label:'Shopify',  color:'#22c55e' },
  { label:'SC',       color:'#22c55e' },
  { label:'Ads CSV',  color:'#f59e0b' },
  { label:'WhatsApp', color:'#22c55e' },
  { label:'GBP',      color:'#22c55e' },
]

const PILLARS = [
  { id:'local', label:'Local SEO', color:'#22c55e', badge:'2 urgent', badgeColor:'#ef4444',
    tasks:[
      {text:'Post GBP offer — Chapeltown', done:true, when:''},
      {text:'Reply to 3 new reviews (AI draft ready)', done:false, when:'Urgent', urgent:true},
      {text:'Upload new photos — Roundhay branch', done:false, when:'Today'},
      {text:'Check all 3 GBP listings for accuracy', done:false, when:'Today'},
    ]},
  { id:'organic', label:'Organic SEO', color:'#3b82f6', badge:'1 blog due', badgeColor:'#3b82f6',
    tasks:[
      {text:'Publish blog: "Best relaxers in Leeds 2026"', done:false, when:'Today'},
      {text:'Fix Wigs collection meta title', done:true, when:''},
      {text:'Add COLOUR10 banner to Hair Dye page', done:false, when:'Today'},
      {text:'Update 5 product descriptions — SEO Audit', done:false, when:'This week'},
    ]},
  { id:'paid', label:'Paid Ads', color:'#f59e0b', badge:'3 urgent', badgeColor:'#ef4444',
    tasks:[
      {text:'Set desktop bid +30% — Shopify All Products', done:false, when:'Urgent', urgent:true},
      {text:'Scale ORS budget 10x (CPA 47p!)', done:false, when:'Urgent', urgent:true},
      {text:'Excluded mustard oil, t gel, olive oil', done:true, when:''},
      {text:'Undo Nivea cream exclusion', done:false, when:'Urgent', urgent:true},
    ]},
]

const BRANCHES = [
  {name:'Chapeltown — LS7', rating:4.0, reviews:66,  lastPost:'2 days ago', alertColor:'#f59e0b', alerts:['Post due today','3 unanswered Q&A']},
  {name:'Roundhay — LS8',   rating:3.8, reviews:119, lastPost:'5 days ago', alertColor:'#ef4444', alerts:['Post overdue 5 days']},
  {name:'City Centre',      rating:3.3, reviews:35,  lastPost:'1 day ago',  alertColor:'#ef4444', alerts:['Low rating — needs reviews!']},
]

const TEAM_TASKS = [
  {pillar:'Local SEO', pc:'#22c55e', text:'Print and display Google Review QR badges — all 3 branches',          assign:'Branch managers',  when:'Done',      done:true},
  {pillar:'Local SEO', pc:'#22c55e', text:'Post weekly offer to Google Business Profile — all 3 branches',       assign:'Social media team', when:'Today',     done:false},
  {pillar:'Organic',   pc:'#3b82f6', text:'Publish blog: "Best relaxers for natural hair — available in Leeds"', assign:'Content team',      when:'Today',     done:false},
  {pillar:'Paid Ads',  pc:'#f59e0b', text:'Google Ads: Set desktop bid +30% on Shopify All Products',            assign:'Mohammed',          when:'Today',     done:false},
  {pillar:'Paid Ads',  pc:'#f59e0b', text:'Add COLOUR10 banner to Hair Dye & Colour collection page',            assign:'Shopify team',      when:'This week', done:false},
  {pillar:'Organic',   pc:'#3b82f6', text:'Fix 12 products with missing meta descriptions',                      assign:'Content team',      when:'This week', done:false},
]

const BRAND_ADS = [
  {brand:'ORS',         cpa:'47p CPA', pct:95, color:'#22c55e'},
  {brand:'Cantu',       cpa:'£1.77',   pct:75, color:'#22c55e'},
  {brand:'Loreal',      cpa:'£7.23',   pct:45, color:'#f59e0b'},
  {brand:'H&Shoulders', cpa:'£0 conv', pct:8,  color:'#ef4444'},
]

const KEYWORDS = [
  {kw:'cc hair beauty',    vol:1150},
  {kw:'hair shop leeds',   vol:220},
  {kw:'braiding hair leeds',vol:180},
  {kw:'wigs leeds',        vol:95},
]

const REVIEWS_DATA = {
  chapeltown:{name:'Chapeltown — LS7',rating:4.0,total:66,color:'#22c55e',reviews:[
    {author:'Sarah M.',  rating:5,time:'2h ago', text:'Absolutely love this shop! Always have exactly what I need for my natural hair. Staff are so helpful and knowledgeable.'},
    {author:'Priya K.',  rating:5,time:'1d ago', text:'Best hair shop in Leeds! Huge selection of professional products. I drive from Bradford just to shop here.'},
    {author:'Tanya B.',  rating:4,time:'3d ago', text:'Great range of products. Staff helped me find the right relaxer. Will definitely be back.'},
  ]},
  roundhay:{name:'Roundhay — LS8',rating:3.8,total:119,color:'#f59e0b',reviews:[
    {author:'Anonymous',rating:2,time:'4h ago', text:'Prices are higher than expected and staff seemed busy.'},
    {author:'Diane F.',  rating:5,time:'2d ago', text:'Love this local branch! Always has everything I need and the staff are really friendly.'},
    {author:'Marcus H.', rating:3,time:'5d ago', text:'OK selection but could do with more braiding hair options.'},
  ]},
  citycentre:{name:'City Centre — New York St',rating:3.3,total:35,color:'#ef4444',reviews:[
    {author:'James T.', rating:3,time:'1d ago', text:'Decent selection but the shop felt a bit disorganised. Would visit again though.'},
    {author:'Fiona R.', rating:2,time:'3d ago', text:"Couldn't find what I was looking for and staff weren't very helpful."},
    {author:'Amara O.', rating:5,time:'1w ago', text:'Hidden gem in Leeds city centre! Great for natural and afro hair products.'},
  ]},
}

function genReply(rating, branch) {
  const t = {
    5:`Thank you so much for your wonderful review! We're thrilled you had such a great experience at our ${branch} store. We look forward to seeing you again soon!`,
    4:`Thank you for your kind review and for visiting our ${branch} branch! We're glad you had a positive experience. Please don't hesitate to ask our staff for help anytime.`,
    3:`Thank you for taking the time to leave a review. We appreciate your honest feedback about our ${branch} branch. We'd love the opportunity to give you an even better experience next time!`,
    2:`Thank you for your feedback. We're sorry to hear your visit to our ${branch} branch didn't fully meet your expectations. We stock specialist professional brands not available in supermarkets. Please do come back!`,
    1:`Thank you for your feedback. We're very sorry about your experience at our ${branch} branch. Please contact us directly so we can resolve this for you.`,
  }
  return t[rating] || t[3]
}

function ReviewCard({review, branchName}) {
  const [reply, setReply] = useState(genReply(review.rating, branchName))
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [regen, setRegen] = useState(false)

  async function regenerate() {
    setRegen(true)
    try {
      const res = await fetch('/api/ai-reply', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({review:review.text,branch:branchName,rating:review.rating})})
      const d = await res.json()
      if (d.reply) setReply(d.reply)
    } catch(e) {}
    setRegen(false)
  }

  return (
    <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16,marginBottom:12}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
        <span>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=review.rating?'#f59e0b':C.border,fontSize:14}}>★</span>)}</span>
        <span style={{fontWeight:600,color:C.text}}>{review.author}</span>
        <span style={{color:C.text3,fontSize:12}}>· {review.time}</span>
      </div>
      <p style={{color:C.text2,fontSize:13,fontStyle:'italic',marginBottom:10,lineHeight:1.5}}>"{review.text}"</p>
      <div style={{background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:8,padding:12,marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:C.accent2,marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>✨ AI Reply</div>
        {editing
          ? <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={3} style={{width:'100%',background:C.surface2,border:'1px solid '+C.border,borderRadius:6,color:C.text,fontSize:13,padding:8,resize:'vertical'}}/>
          : <p style={{color:C.text,fontSize:13,lineHeight:1.6,margin:0}}>{reply}</p>
        }
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button onClick={()=>{navigator.clipboard.writeText(reply);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{padding:'6px 12px',borderRadius:6,border:'1px solid '+C.border,background:C.surface2,color:C.text,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
          {copied?'✓ Copied!':'📋 Copy reply'}
        </button>
        <a href="https://business.google.com/reviews" target="_blank" rel="noreferrer" style={{padding:'6px 12px',borderRadius:6,border:'1px solid '+C.border,background:C.surface2,color:C.accent2,fontSize:12,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>
          Open in Google →
        </a>
        <button onClick={()=>setEditing(!editing)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid '+C.border,background:C.surface2,color:C.text,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>{editing?'Done':'Edit'}</button>
        <button onClick={regenerate} disabled={regen} style={{padding:'6px 12px',borderRadius:6,border:'1px solid '+C.border,background:C.surface2,color:C.text,cursor:'pointer',fontSize:12,marginLeft:'auto',fontFamily:'inherit'}}>
          {regen?'...':'↺ Regenerate'}
        </button>
      </div>
    </div>
  )
}

function OverviewTab({shopifyData, shopifyLoading}) {
  const [period, setPeriod] = useState('today')
  const [taskDone, setTaskDone] = useState({})
  const done = TEAM_TASKS.filter(t=>t.done||taskDone[t.text]).length
  const pct = Math.round(done/TEAM_TASKS.length*100)
  const p = shopifyData?.periods?.[period]

  const metrics = [
    {label:'Online revenue',  val:shopifyLoading?'...':(p?p.revenueFormatted:'—'), sub:shopifyLoading?'Loading from Shopify...':(p?p.orders+' orders':'—'), color:C.green, live:true},
    {label:'Total products',  val:shopifyLoading?'...':(shopifyData?.productCount?.toLocaleString()||'—'), sub:'Live from Shopify', color:C.blue, live:true},
    {label:'Ads cost/sale',   val:'£9.35', sub:'Target: £8.00 — upload CSV',    color:C.amber, live:false},
    {label:'Avg GBP rating',  val:'3.8★',  sub:'220 reviews · 3 branches',      color:C.amber, live:false},
  ]

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {['today','week','month','year'].map(p=>(
          <button key={p} onClick={()=>setPeriod(p)} style={{padding:'7px 14px',borderRadius:8,border:period===p?'none':'1px solid '+C.border,background:period===p?C.accent:C.surface,color:C.text,cursor:'pointer',fontSize:13,fontWeight:500,fontFamily:'inherit'}}>
            {{today:'Today',week:'This Week',month:'This Month',year:'This Year'}[p]}
          </button>
        ))}
      </div>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>
        {{today:'Today',week:'This Week',month:'This Month',year:'This Year'}[period]} at a glance
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {metrics.map(m=>(
          <div key={m.label} style={{background:C.surface,border:'1px solid '+(m.live?C.green+'20':C.border),borderRadius:12,padding:16,position:'relative'}}>
            {m.live&&<div style={{position:'absolute',top:10,right:10,width:6,height:6,borderRadius:'50%',background:C.green,boxShadow:'0 0 6px '+C.green}}/>}
            <div style={{fontSize:28,fontWeight:700,color:C.text,letterSpacing:'-0.02em'}}>{m.val}</div>
            <div style={{color:C.text2,fontSize:12,marginTop:2}}>{m.label}</div>
            <div style={{color:m.color,fontSize:12,marginTop:4,fontWeight:500}}>{m.sub}</div>
          </div>
        ))}
      </div>
      {shopifyData?.recentOrders?.length>0&&(
        <>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>Recent orders — live</div>
          <div style={{background:C.surface,border:'1px solid '+C.green+'20',borderRadius:12,overflow:'hidden',marginBottom:24}}>
            {shopifyData.recentOrders.map((o,i)=>(
              <div key={o.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderBottom:i<shopifyData.recentOrders.length-1?'1px solid '+C.border:'none'}}>
                <div style={{flex:1}}><span style={{fontWeight:600,color:C.text,fontSize:13}}>{o.name}</span><span style={{color:C.text2,fontSize:12,marginLeft:8}}>{o.customer}</span><div style={{color:C.text3,fontSize:12,marginTop:2}}>{o.items}</div></div>
                <span style={{fontWeight:700,color:C.green,fontSize:14}}>{o.total}</span>
                <span style={{background:o.status==='paid'?'rgba(34,197,94,.15)':'rgba(245,158,11,.15)',color:o.status==='paid'?C.green:C.amber,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:600}}>{o.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>Today's tasks — by pillar</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {PILLARS.map(p=>(
          <div key={p.id} style={{background:C.surface,border:'1px solid '+p.color+'40',borderRadius:12,padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{color:p.color,fontWeight:700,fontSize:14}}>{p.label}</span>
              <span style={{background:p.badgeColor+'20',color:p.badgeColor,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:600}}>{p.badge}</span>
            </div>
            {p.tasks.map(t=>(
              <div key={t.text} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:8}}>
                <div style={{width:16,height:16,borderRadius:4,flexShrink:0,marginTop:1,background:t.done?p.color:'transparent',border:'2px solid '+(t.done?p.color:C.border),display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {t.done&&<span style={{color:'#000',fontSize:10,fontWeight:700}}>✓</span>}
                </div>
                <span style={{flex:1,color:t.done?C.text3:C.text,fontSize:13,textDecoration:t.done?'line-through':'none'}}>{t.text}</span>
                {t.when&&<span style={{background:t.urgent?'rgba(239,68,68,.15)':t.when==='Today'?'rgba(99,102,241,.15)':'rgba(139,144,167,.1)',color:t.urgent?C.red:t.when==='Today'?C.accent2:C.text3,padding:'2px 6px',borderRadius:99,fontSize:11,fontWeight:600,flexShrink:0}}>{t.when}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>Google Business Profile — 3 branches</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {BRANCHES.map(b=>{
          const rc=b.rating>=4?C.green:b.rating>=3.7?C.amber:C.red
          return (
            <div key={b.name} style={{background:C.surface,border:'1px solid '+b.alertColor+'40',borderRadius:12,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontWeight:600,color:C.text}}>{b.name}</span><span style={{color:rc,fontWeight:700,fontSize:16}}>{b.rating}★</span></div>
              <div style={{color:C.text2,fontSize:12,marginBottom:8}}>Reviews: {b.reviews} · Last post: {b.lastPost}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>{b.alerts.map(a=><span key={a} style={{background:b.alertColor+'20',color:b.alertColor,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:600}}>{a}</span>)}</div>
            </div>
          )
        })}
      </div>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>This week's team tasks</div>
      <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,overflow:'hidden',marginBottom:24}}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid '+C.border,display:'flex',justifyContent:'space-between'}}>
          <span style={{fontWeight:600,color:C.text}}>Week of {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})} — {done} of {TEAM_TASKS.length} done</span>
          <span style={{color:C.text2,fontSize:13}}>{pct}% complete</span>
        </div>
        <div style={{height:4,background:C.surface2}}><div style={{height:'100%',width:pct+'%',background:C.green,transition:'width .3s'}}/></div>
        {TEAM_TASKS.map((t,i)=>{
          const isDone=t.done||taskDone[t.text]
          return (
            <div key={i} onClick={()=>setTaskDone(p=>({...p,[t.text]:!p[t.text]}))} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 16px',borderBottom:i<TEAM_TASKS.length-1?'1px solid '+C.border:'none',cursor:'pointer'}}>
              <div style={{width:18,height:18,borderRadius:5,flexShrink:0,marginTop:1,background:isDone?C.green:'transparent',border:'2px solid '+(isDone?C.green:C.border),display:'flex',alignItems:'center',justifyContent:'center'}}>{isDone&&<span style={{color:'#000',fontSize:11,fontWeight:700}}>✓</span>}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <span style={{background:t.pc+'20',color:t.pc,padding:'2px 6px',borderRadius:99,fontSize:11,fontWeight:600}}>{t.pillar}</span>
                  <span style={{color:isDone?C.text3:C.text,fontSize:13,fontWeight:500,textDecoration:isDone?'line-through':'none'}}>{t.text}</span>
                </div>
                <div style={{color:C.text3,fontSize:12}}>Assigned to: {t.assign}</div>
              </div>
              <span style={{background:isDone?'rgba(34,197,94,.15)':t.when==='Today'?'rgba(99,102,241,.15)':'rgba(139,144,167,.1)',color:isDone?C.green:t.when==='Today'?C.accent2:C.text3,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:600,flexShrink:0}}>{isDone?'Done':t.when}</span>
            </div>
          )
        })}
      </div>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>Performance snapshot</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16}}>
          <div style={{fontWeight:600,color:C.text,marginBottom:12}}>Top organic keywords</div>
          {KEYWORDS.map(k=>(
            <div key={k.kw} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
              <span style={{color:C.text2,fontSize:13,width:170,flexShrink:0}}>{k.kw}</span>
              <div style={{flex:1,height:6,background:C.surface2,borderRadius:3,overflow:'hidden'}}><div style={{width:(k.vol/1150*100)+'%',height:'100%',background:C.blue,borderRadius:3}}/></div>
              <span style={{color:C.text,fontWeight:600,fontSize:13,width:40,textAlign:'right'}}>{k.vol}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16}}>
          <div style={{fontWeight:600,color:C.text,marginBottom:12}}>Ads brand performance</div>
          {BRAND_ADS.map(b=>(
            <div key={b.brand} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
              <span style={{color:C.text2,fontSize:13,width:110,flexShrink:0}}>{b.brand}</span>
              <div style={{flex:1,height:6,background:C.surface2,borderRadius:3,overflow:'hidden'}}><div style={{width:b.pct+'%',height:'100%',background:b.color,borderRadius:3}}/></div>
              <span style={{color:b.color,fontWeight:600,fontSize:13,width:60,textAlign:'right'}}>{b.cpa}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReviewsTab() {
  const [branch, setBranch] = useState('chapeltown')
  const b = REVIEWS_DATA[branch]
  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {Object.entries(REVIEWS_DATA).map(([id,d])=>(
          <button key={id} onClick={()=>setBranch(id)} style={{padding:'7px 14px',borderRadius:8,border:branch===id?'none':'1px solid '+C.border,background:branch===id?C.accent:C.surface,color:C.text,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:8,fontFamily:'inherit'}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:d.color}}/>{d.name.split(' —')[0]}
            <span style={{background:d.color+'20',color:d.color,padding:'1px 6px',borderRadius:99,fontSize:11,fontWeight:700}}>{d.rating}★</span>
          </button>
        ))}
      </div>
      <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16,marginBottom:16,display:'flex',alignItems:'center',gap:20}}>
        <div><div style={{fontSize:36,fontWeight:800,color:b.color}}>{b.rating}★</div><div style={{color:C.text2,fontSize:13}}>{b.total} total reviews</div></div>
        <div style={{flex:1}}>{[5,4,3,2,1].map(n=>{const count=b.reviews.filter(r=>r.rating===n).length;return(<div key={n} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><span style={{color:C.text3,fontSize:12,width:20}}>{n}★</span><div style={{flex:1,height:6,background:C.surface2,borderRadius:3,overflow:'hidden'}}><div style={{width:(count/b.reviews.length*100)+'%',height:'100%',background:b.color,borderRadius:3}}/></div></div>)})}</div>
        <a href="https://business.google.com" target="_blank" rel="noreferrer" style={{padding:'8px 14px',borderRadius:8,background:C.green,color:'#000',fontWeight:600,fontSize:13,textDecoration:'none'}}>View all reviews</a>
      </div>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>Recent reviews — {b.name}</div>
      {b.reviews.map((r,i)=><ReviewCard key={i} review={r} branchName={b.name.split(' —')[0]}/>)}
    </div>
  )
}

function ComingSoon({tab}) {
  const info = {
    'local-seo':{icon:'📍',desc:'Live GBP monitoring for all 3 branches, AI review replies, post scheduler, 309 keyword tracker.'},
    launch:     {icon:'🚀',desc:'8-step pipeline from USA trend detection to Google cache for new product launches.'},
    ispy:       {icon:'🕵️',desc:'Monitor competitors by URL — GBP ratings, keyword rankings, social follower counts.'},
    audit:      {icon:'📋',desc:'Automated audit schedule: product SEO weekly, GBP daily, Ads monthly, blogs quarterly.'},
  }
  const t = info[tab]||{icon:'⬡',desc:'Coming soon.'}
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'80px 20px',gap:16}}>
      <div style={{fontSize:56}}>{t.icon}</div>
      <div style={{fontWeight:700,fontSize:22,color:C.text,textTransform:'capitalize'}}>{tab.replace(/-/g,' ')}</div>
      <p style={{color:C.text2,maxWidth:400,textAlign:'center',lineHeight:1.6}}>{t.desc}</p>
      <span style={{background:'rgba(168,85,247,.15)',color:'#a855f7',padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700}}>BUILDING NEXT</span>
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [shopifyData, setShopifyData] = useState(null)
  const [shopifyLoading, setShopifyLoading] = useState(true)

  useEffect(() => {
    fetch('/api/shopify-stats')
      .then(r=>r.json())
      .then(d=>{ setShopifyData(d); setShopifyLoading(false) })
      .catch(()=>setShopifyLoading(false))
  }, [])

  function renderTab() {
    if (activeTab==='overview') return <OverviewTab shopifyData={shopifyData} shopifyLoading={shopifyLoading}/>
    if (activeTab==='reviews')  return <ReviewsTab/>
    return <ComingSoon tab={activeTab}/>
  }

  const builtPages = NAV.filter(n => n.page)
  const inlineTabs = NAV.filter(n => !n.page)

  return (
    <>
      <Head>
        <title>CC Hair &amp; Beauty — Intelligence Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          html,body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px;min-height:100vh}
          button{font-family:inherit}
          ::-webkit-scrollbar{width:6px;height:6px}
          ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
          .nav-link:hover{background:rgba(99,102,241,.1)!important;color:#818cf8!important}
        `}</style>
      </Head>

      <Nav activeInline={activeTab} onInlineClick={setActiveTab}/>
      {/* content */}