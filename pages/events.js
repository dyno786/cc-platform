import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const EVENTS = [
  // Leeds Local
  { id:'carnival', name:'Leeds West Indian Carnival', date:'2026-08-24', category:'local', icon:'🎉', color:'#E1306C',
    products:['Braiding hair','Wigs','Hair colour','Edge control','Lace front wigs'],
    blogTitle:'Best Hair Styles for Leeds West Indian Carnival 2026',
    socialIdea:'Show off carnival-ready styles — braids, colour, wigs. Tag us in your carnival looks!',
    gbpPost:'Get carnival-ready at CC Hair and Beauty Leeds — huge range of braiding hair, wigs and colour in all 3 branches.',
    adsBudget:'Increase Hair City Visitors to £25/day from 2 weeks before',
    prepWeeks:3 },
  { id:'mela', name:'Leeds Mela', date:'2026-07-19', category:'local', icon:'🌸', color:'#7c3aed',
    products:['Hair oils','Treatments','Henna','Styling products'],
    blogTitle:'Hair Care Guide for Leeds Mela 2026 — Products and Styles',
    socialIdea:'Celebrating Leeds Mela — show your festival hair look with our styling products',
    gbpPost:'Leeds Mela is coming — stock up on hair oils, treatments and styling products at CC Hair and Beauty.',
    adsBudget:'Increase All By Brands budget by 20% for 2 weeks',
    prepWeeks:2 },
  { id:'leeds_festival', name:'Leeds Festival', date:'2026-08-21', category:'local', icon:'🎸', color:'#1a7f37',
    products:['Braiding hair','Protective styles','Hair accessories','Dry shampoo'],
    blogTitle:'Festival Hair Ideas 2026 — Styles That Last 3 Days',
    socialIdea:'Festival season is here — braids, locs and protective styles that survive Leeds Festival',
    gbpPost:'Festival ready hair at CC Hair and Beauty — braiding hair, accessories and protective style products in stock now.',
    adsBudget:'Create new Search campaign targeting "festival hair Leeds"',
    prepWeeks:2 },
  // Religious
  { id:'eid_fitr', name:'Eid al-Fitr', date:'2027-03-20', category:'religious', icon:'🌙', color:'#9a6700',
    products:['Wigs','Weaves','Lace fronts','Hair colour','Treatments'],
    blogTitle:'Eid Hair Ideas 2026 — Wigs, Weaves and Special Occasion Styles',
    socialIdea:'Eid Mubarak from CC Hair and Beauty — show us your Eid hair look!',
    gbpPost:'Eid is coming — get your hair done at CC Hair and Beauty. Huge range of wigs, weaves and treatments across 3 Leeds branches.',
    adsBudget:'Increase all campaigns by 30% for 2 weeks before Eid',
    prepWeeks:3 },
  { id:'eid_adha', name:'Eid al-Adha', date:'2026-06-06', category:'religious', icon:'🌙', color:'#9a6700',
    products:['Wigs','Weaves','Lace fronts','Hair colour'],
    blogTitle:'Eid al-Adha Hair Styles — Look Your Best for the Celebrations',
    socialIdea:'Eid al-Adha celebrations — get your hair ready with CC Hair and Beauty Leeds',
    gbpPost:'Eid al-Adha is nearly here — visit CC Hair and Beauty for wigs, weaves and styling products.',
    adsBudget:'Increase all campaigns by 25% for 10 days before',
    prepWeeks:2 },
  // National
  { id:'valentines', name:"Valentine's Day", date:'2027-02-14', category:'national', icon:'❤️', color:'#cf222e',
    products:['Hair treatments','Gift sets','Wigs','Perfumed oils'],
    blogTitle:"Valentine's Day Hair Ideas — Romantic Styles for Leeds",
    socialIdea:"Valentine's Day is coming — treat yourself or someone special to a hair makeover",
    gbpPost:"Valentine's gifts sorted — hair treatments, gift sets and luxury products at CC Hair and Beauty Leeds.",
    adsBudget:'Create gift-focused ad copy 2 weeks before',
    prepWeeks:2 },
  { id:'mothers_day', name:"Mother's Day", date:'2027-03-22', category:'national', icon:'💐', color:'#E1306C',
    products:['Gift sets','Hair treatments','Wigs','Luxury oils'],
    blogTitle:"Best Hair Gift Ideas for Mum — Mother's Day 2026",
    socialIdea:"Treat mum to something special this Mother's Day — hair gift sets at CC Hair and Beauty",
    gbpPost:"Mother's Day gifts at CC Hair and Beauty — hair treatments, gift sets and luxury products. Perfect for mum.",
    adsBudget:'Run gift-focused Shopping ads 3 weeks before',
    prepWeeks:3 },
  { id:'christmas', name:'Christmas', date:'2026-12-25', category:'national', icon:'🎄', color:'#cf222e',
    products:['Wigs','Extensions','Hair colour','Gift sets','Treatments'],
    blogTitle:'Christmas Hair Ideas 2026 — Wigs, Weaves and Festive Styles Leeds',
    socialIdea:'Christmas party season — get your hair done at CC Hair and Beauty. Wigs, weaves and colour in stock now.',
    gbpPost:'Christmas party hair sorted — visit CC Hair and Beauty Leeds for wigs, extensions, colour and gift sets.',
    adsBudget:'Increase all campaigns by 40% from 1 December, peak budget 15-24 December',
    prepWeeks:6 },
  { id:'new_year', name:"New Year's Eve", date:'2026-12-31', category:'national', icon:'🎆', color:'#7c3aed',
    products:['Wigs','Lace fronts','Hair colour','Extensions'],
    blogTitle:'New Year New Hair — Wigs and Extensions for NYE 2026 Leeds',
    socialIdea:"New Year's Eve hair inspo — wigs, lace fronts and extensions at CC Hair and Beauty",
    gbpPost:'New Year New Hair — CC Hair and Beauty Leeds has everything you need for NYE. Wigs, extensions and colour.',
    adsBudget:'Peak budget 27-31 December',
    prepWeeks:2 },
  { id:'back_to_school', name:'Back to School', date:'2026-09-01', category:'national', icon:'🎒', color:'#0969da',
    products:["Children's hair care",'Braiding hair','Hair accessories','Moisturisers'],
    blogTitle:"Back to School Hair Guide 2026 — Easy Styles for Children",
    socialIdea:"Back to school season — stock up on children's hair care at CC Hair and Beauty Leeds",
    gbpPost:"Back to school time — children's hair care, braiding hair and accessories at CC Hair and Beauty. 3 branches in Leeds.",
    adsBudget:'Create children\'s hair care focused ad group',
    prepWeeks:2 },
  { id:'black_history', name:'Black History Month', date:'2026-10-01', category:'national', icon:'✊', color:'#1a7f37',
    products:['Natural hair products','Afro combs','Moisturisers','Protective styles'],
    blogTitle:'Celebrating Black Hair — CC Hair and Beauty Leeds Black History Month 2026',
    socialIdea:'Black History Month — celebrating the beauty and diversity of Black hair. Share your natural hair journey with us.',
    gbpPost:'Black History Month at CC Hair and Beauty Leeds — celebrating Black hair since 1979. Natural hair products and protective style supplies in all 3 branches.',
    adsBudget:'Create content-focused Search campaign targeting natural hair terms',
    prepWeeks:3 },
  { id:'natural_hair_week', name:'Natural Hair Week', date:'2026-05-04', category:'industry', icon:'💇', color:'#1a7f37',
    products:['Curl creams','Moisturisers','Protective styles','Afro combs','Natural shampoos'],
    blogTitle:'Natural Hair Week 2026 — Best Products for Natural Hair at CC Hair and Beauty Leeds',
    socialIdea:'Natural Hair Week — show us your natural hair! Tag us for a chance to be featured.',
    gbpPost:'Natural Hair Week at CC Hair and Beauty — huge range of natural hair products in all 3 Leeds branches.',
    adsBudget:'Run natural hair focused Shopping ads this week',
    prepWeeks:1 },
  { id:'notting_hill', name:'Notting Hill Carnival', date:'2026-08-30', category:'national', icon:'🎭', color:'#E1306C',
    products:['Braiding hair','Wigs','Hair colour','Accessories'],
    blogTitle:'Notting Hill Carnival Hair Ideas 2026 — Stock Up at CC Hair and Beauty Leeds',
    socialIdea:'Notting Hill Carnival weekend — get your hair sorted before you head to London. CC Hair and Beauty has everything you need.',
    gbpPost:'Heading to Notting Hill Carnival? Stock up on braiding hair, wigs and colour at CC Hair and Beauty Leeds first.',
    adsBudget:'Increase budget weekend before Notting Hill',
    prepWeeks:2 },
  { id:'bank_hol_easter', name:'Easter Bank Holiday', date:'2026-04-03', category:'national', icon:'🐣', color:'#9a6700',
    products:['All products','Gift sets'],
    blogTitle:'Easter Hair Refresh — New Season New Style at CC Hair and Beauty Leeds',
    socialIdea:'Easter weekend — treat yourself to a hair refresh. All 3 branches open over Easter.',
    gbpPost:'CC Hair and Beauty open over Easter — visit Chapeltown LS7, Roundhay LS8 or Leeds City Centre.',
    adsBudget:'Increase local Search budget over bank holiday weekend',
    prepWeeks:1 },
  { id:'summer_bank_hol', name:'Summer Bank Holiday', date:'2026-08-31', category:'national', icon:'☀️', color:'#9a6700',
    products:['All products','Sun protection hair care'],
    blogTitle:'Bank Holiday Hair — Get Summer Ready at CC Hair and Beauty Leeds',
    socialIdea:'Bank holiday weekend — all 3 CC Hair and Beauty branches open. Come and treat yourself.',
    gbpPost:'Bank holiday weekend at CC Hair and Beauty — all 3 Leeds branches open. Huge range of summer hair care products.',
    adsBudget:'Increase Hair City Visitors budget over bank holiday',
    prepWeeks:1 },
]

function daysUntil(dateStr) {
  const now = new Date()
  const event = new Date(dateStr)
  return Math.ceil((event - now) / (1000 * 60 * 60 * 24))
}

function urgencyColor(days) {
  if (days < 0) return T.textMuted
  if (days <= 14) return T.red
  if (days <= 30) return T.amber
  return T.green
}

function urgencyLabel(days) {
  if (days < 0) return 'Passed'
  if (days === 0) return 'Today!'
  if (days <= 7) return `${days} days`
  if (days <= 14) return `${days} days — prep now`
  if (days <= 30) return `${days} days — plan now`
  return `${days} days`
}

export default function Events() {
  const [filter, setFilter] = useState('upcoming')
  const [expanded, setExpanded] = useState(null)
  const [tab, setTab] = useState('calendar')

  const sorted = [...EVENTS].sort((a,b) => {
    const da = daysUntil(a.date)
    const db = daysUntil(b.date)
    return da - db
  })

  const filtered = sorted.filter(e => {
    const days = daysUntil(e.date)
    if (filter === 'upcoming') return days >= 0
    if (filter === 'urgent') return days >= 0 && days <= 30
    if (filter === 'passed') return days < 0
    if (filter === 'local') return e.category === 'local'
    if (filter === 'religious') return e.category === 'religious'
    if (filter === 'national') return e.category === 'national' || e.category === 'industry'
    return true
  })

  const urgent = sorted.filter(e => {
    const d = daysUntil(e.date)
    return d >= 0 && d <= 30
  })

  return (
    <>
      <Head><title>Events — CC Intelligence</title></Head>
      <Shell title="Events & Seasonal Calendar" subtitle="Local Leeds events, national holidays and industry calendar — plan content, ads and promotions ahead of time">

        {/* Urgent alert */}
        {urgent.length > 0 && (
          <div style={{background:'#fff0f0',border:'0.5px solid '+T.red+'40',borderRadius:8,padding:'12px 14px',marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:T.red,marginBottom:8}}>🚨 {urgent.length} event{urgent.length!==1?'s':''} in the next 30 days — action needed now</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {urgent.map(e => (
                <div key={e.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:11}}>
                  <span>{e.icon}</span>
                  <span style={{fontWeight:600,color:T.text}}>{e.name}</span>
                  <span style={{color:T.red,fontWeight:700}}>{urgencyLabel(daysUntil(e.date))}</span>
                  <span style={{color:T.textMuted,flex:1}}>— {e.adsBudget}</span>
                  <button onClick={()=>setExpanded(expanded===e.id?null:e.id)}
                    style={{padding:'2px 8px',fontSize:10,background:T.red,color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>
                    View plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:14,borderBottom:'1px solid '+T.border}}>
          {[{id:'calendar',label:'📅 Calendar'},{id:'tasks',label:'✅ Action Plan'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'7px 16px',fontSize:12,fontWeight:600,border:'none',background:'none',
              borderBottom:tab===t.id?'2px solid '+T.blue:'2px solid transparent',
              color:tab===t.id?T.blue:T.textMuted,cursor:'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        {tab==='calendar' && (
          <div>
            {/* Filters */}
            <div style={{display:'flex',gap:5,marginBottom:12,flexWrap:'wrap'}}>
              {[
                {id:'upcoming',label:'Upcoming'},
                {id:'urgent',label:'🚨 Next 30 days'},
                {id:'local',label:'📍 Leeds'},
                {id:'religious',label:'🌙 Religious'},
                {id:'national',label:'🇬🇧 National'},
                {id:'passed',label:'Passed'},
              ].map(f=>(
                <button key={f.id} onClick={()=>setFilter(f.id)} style={{
                  padding:'4px 11px',fontSize:11,fontWeight:600,borderRadius:20,cursor:'pointer',
                  background:filter===f.id?T.blue:T.bg,
                  color:filter===f.id?'#fff':T.textMuted,
                  border:'1px solid '+(filter===f.id?T.blue:T.border),
                }}>{f.label} ({sorted.filter(e=>{
                  const d=daysUntil(e.date)
                  if(f.id==='upcoming') return d>=0
                  if(f.id==='urgent') return d>=0&&d<=30
                  if(f.id==='local') return e.category==='local'
                  if(f.id==='religious') return e.category==='religious'
                  if(f.id==='national') return e.category==='national'||e.category==='industry'
                  if(f.id==='passed') return d<0
                  return true
                }).length})</button>
              ))}
            </div>

            {/* Event cards */}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {filtered.map(e => {
                const days = daysUntil(e.date)
                const isExpanded = expanded === e.id
                const uc = urgencyColor(days)
                return (
                  <div key={e.id} style={{
                    background:T.surface,border:'0.5px solid '+T.border,
                    borderLeft:'4px solid '+e.color,
                    borderRadius:8,overflow:'hidden',
                    opacity:days<0?0.6:1,
                  }}>
                    <div style={{padding:'12px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}
                      onClick={()=>setExpanded(isExpanded?null:e.id)}>
                      <span style={{fontSize:22,flexShrink:0}}>{e.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:T.text}}>{e.name}</div>
                        <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>
                          {new Date(e.date).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                        </div>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:uc}}>{urgencyLabel(days)}</div>
                        <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>Prep {e.prepWeeks} week{e.prepWeeks!==1?'s':''} before</div>
                      </div>
                      <span style={{fontSize:12,color:T.textMuted,marginLeft:4}}>{isExpanded?'▲':'▼'}</span>
                    </div>

                    {isExpanded && (
                      <div style={{borderTop:'0.5px solid '+T.border,padding:'14px 16px',background:T.bg}}>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                          {/* Products to push */}
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:6}}>🛍️ Products to push</div>
                            {e.products.map((p,i)=>(
                              <div key={i} style={{fontSize:11,color:T.textMuted,padding:'2px 0'}}>{p}</div>
                            ))}
                          </div>
                          {/* Google Ads */}
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:6}}>📊 Google Ads</div>
                            <div style={{fontSize:11,color:T.textMuted,lineHeight:1.5}}>{e.adsBudget}</div>
                          </div>
                        </div>

                        {/* Content suggestions */}
                        <div style={{display:'flex',flexDirection:'column',gap:6}}>
                          <div style={{background:'#fff',borderRadius:6,padding:'8px 10px',border:'0.5px solid '+T.border}}>
                            <div style={{fontSize:10,fontWeight:700,color:'#7c3aed',marginBottom:3}}>📝 Blog title</div>
                            <div style={{fontSize:11,color:T.text}}>{e.blogTitle}</div>
                            <a href="/blog-planner" style={{fontSize:10,color:T.blue,textDecoration:'none',fontWeight:600}}>Write this blog →</a>
                          </div>
                          <div style={{background:'#fff',borderRadius:6,padding:'8px 10px',border:'0.5px solid '+T.border}}>
                            <div style={{fontSize:10,fontWeight:700,color:'#E1306C',marginBottom:3}}>📸 Social post idea</div>
                            <div style={{fontSize:11,color:T.text}}>{e.socialIdea}</div>
                            <a href="/social-upload" style={{fontSize:10,color:T.blue,textDecoration:'none',fontWeight:600}}>Create social post →</a>
                          </div>
                          <div style={{background:'#fff',borderRadius:6,padding:'8px 10px',border:'0.5px solid '+T.border}}>
                            <div style={{fontSize:10,fontWeight:700,color:'#1a7f37',marginBottom:3}}>📍 GBP post</div>
                            <div style={{fontSize:11,color:T.text}}>{e.gbpPost}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab==='tasks' && (
          <div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>
              Action plan generated from upcoming events — what to prepare and when
            </div>
            {['This week','This month','Next 3 months'].map((period, pi) => {
              const periodEvents = sorted.filter(e => {
                const d = daysUntil(e.date)
                if (pi===0) return d >= 0 && d <= 7
                if (pi===1) return d > 7 && d <= 30
                if (pi===2) return d > 30 && d <= 90
                return false
              })
              if (periodEvents.length === 0) return null
              return (
                <div key={period} style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8,padding:'6px 10px',background:T.bg,borderRadius:6,border:'0.5px solid '+T.border}}>
                    {period} — {periodEvents.length} event{periodEvents.length!==1?'s':''} to prepare for
                  </div>
                  {periodEvents.map(e => {
                    const days = daysUntil(e.date)
                    return (
                      <div key={e.id} style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:8,padding:'12px 14px',marginBottom:8}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                          <span style={{fontSize:18}}>{e.icon}</span>
                          <div style={{flex:1}}>
                            <span style={{fontSize:12,fontWeight:700,color:T.text}}>{e.name}</span>
                            <span style={{fontSize:11,color:urgencyColor(days),fontWeight:600,marginLeft:8}}>{urgencyLabel(days)}</span>
                          </div>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:4}}>
                          {[
                            {icon:'📊',text:`Ads: ${e.adsBudget}`,href:'/paid-ads'},
                            {icon:'📝',text:`Blog: ${e.blogTitle}`,href:'/blog-planner'},
                            {icon:'📸',text:`Social: ${e.socialIdea.slice(0,80)}...`,href:'/social-upload'},
                            {icon:'📍',text:`GBP: Post about ${e.name} across all 3 branches`,href:'/local-seo'},
                          ].map((task,i)=>(
                            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'4px 0'}}>
                              <span style={{fontSize:12,flexShrink:0}}>{task.icon}</span>
                              <span style={{fontSize:11,color:T.text,flex:1,lineHeight:1.4}}>{task.text}</span>
                              <a href={task.href} style={{fontSize:10,color:T.blue,textDecoration:'none',fontWeight:600,flexShrink:0,whiteSpace:'nowrap'}}>Do it →</a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

      </Shell>
    </>
  )
}
