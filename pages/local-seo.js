import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const BRANCHES = [
  { id:'chapeltown', name:'Chapeltown', addr:'121–129 Chapeltown Road, Leeds LS7 3DU', rating:4.1, reviews:71,  views:1240, calls:89,  directions:142, website:198, ph:'0113 318 3830', posts:2, color:T.green  },
  { id:'roundhay',   name:'Roundhay',   addr:'256–258 Roundhay Road, Leeds LS8 5RL',   rating:3.8, reviews:120, views:890,  calls:61,  directions:98,  website:134, ph:'0113 249 5450', posts:1, color:T.amber  },
  { id:'city',       name:'City Centre',addr:'New York Street, Leeds City Centre LS2',  rating:3.5, reviews:40,  views:640,  calls:44,  directions:71,  website:89,  ph:'',              posts:0, color:T.red    },
]

// Reviews now pulled live from Google Places API — see liveBranches state
const STATIC_REVIEWS = [
  { branch:'Chapeltown', author:'Sarah M', rating:5, text:'Amazing selection of braiding hair. Staff were so helpful and knowledgeable. Will definitely be back!', date:'2 days ago', replied:false },
  { branch:'Roundhay',   author:'Aisha K', rating:4, text:'Good range of products. Prices are reasonable. Only downside was it was quite busy when I visited.', date:'4 days ago', replied:true  },
  { branch:'Chapeltown', author:'James T', rating:2, text:'Waited 20 minutes to be served. Staff seemed uninterested. Products are good but service needs work.', date:'5 days ago', replied:false },
  { branch:'City Centre', author:'Maria L', rating:5, text:'Best hair shop in Leeds! Great staff and they always have what I need. Love this place.', date:'1 week ago', replied:false },
  { branch:'Roundhay',   author:'Diane F', rating:1, text:'Terrible experience. Bought a wig that fell apart after one wear. No refund offered. Very disappointed.', date:'1 week ago', replied:false },
  { branch:'Chapeltown', author:'Priya S', rating:5, text:'CC Hair always has the best stock. Found the Bsset Curl Cream here when nowhere else had it!', date:'2 weeks ago', replied:true  },
]

const GBP_TASKS = [
  { id:'gbp_t1', text:'Reply to 3-star review — Roundhay (Aisha K)', how:'Google Maps → CC Hair Roundhay → Reviews → Reply' },
  { id:'gbp_t2', text:'Reply to 2-star review — Chapeltown (James T)', how:'Google Maps → CC Hair Chapeltown → Reviews → Reply' },
  { id:'gbp_t3', text:'Reply to 1-star review — Roundhay (Diane F)', how:'Google Maps → CC Hair Roundhay → Reviews → Reply — apologise and offer solution' },
  { id:'gbp_t4', text:'Reply to 5-star review — City Centre (Maria L)', how:'Google Maps → CC Hair City Centre → Reviews → Reply — thank her' },
  { id:'gbp_t5', text:'Post GBP update — City Centre (0 posts this week)', how:'GBP Planner tab → City Centre → Generate → Copy → Post on Google' },
  { id:'gbp_t6', text:'Add product photos to Roundhay GBP profile', how:'Google Business Profile → Roundhay → Photos → Add photos (new arrivals)' },
  { id:'gbp_t7', text:'Send WhatsApp review requests to yesterday\'s customers', how:'WhatsApp → send template message asking for Google review — link to branch' },
]

const REVIEW_TEMPLATES = {
  5: `Thank you so much for your kind words! We're delighted you had a great experience at CC Hair and Beauty [BRANCH]. Our team works hard to give every customer the best service and product knowledge. We look forward to seeing you again soon! — CC Hair and Beauty`,
  4: `Thank you for your lovely review and for visiting CC Hair and Beauty [BRANCH]! We're glad you enjoyed our range and found our prices fair. We appreciate the feedback and will use it to keep improving. Hope to see you again soon! — CC Hair and Beauty`,
  3: `Thank you for taking the time to leave a review. We're glad some aspects of your visit were positive. We'd love to hear more about how we could improve — please feel free to contact us at info@cchairandbeauty.com. — CC Hair and Beauty`,
  2: `Thank you for your feedback. We're sorry your experience didn't meet your expectations. We take all feedback seriously and would love the opportunity to make this right. Please contact us at info@cchairandbeauty.com or call 0113 318 3830 and we'll do everything we can to help. — CC Hair and Beauty`,
  1: `We're very sorry to hear about your experience and sincerely apologise that we let you down. This is not the standard we hold ourselves to. Please contact us directly at info@cchairandbeauty.com or call 0113 318 3830 so we can resolve this for you personally. — CC Hair and Beauty`,
}


function LiveRating({ branch, liveBranches, loadingGBP }) {
  if (loadingGBP) return <span style={{ fontSize: 10, color: '#656d76' }}>Loading...</span>
  const live = liveBranches?.find(lb => lb.name === branch.name)
  const rating = live?.rating || branch.rating
  const reviews = live?.reviewCount || branch.reviews
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 14 }}>⭐</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: rating >= 4 ? '#1f883d' : rating >= 3.5 ? '#bf8700' : '#cf222e' }}>{rating}</span>
      <span style={{ fontSize: 10, color: '#656d76' }}>({reviews})</span>
      {live?.rating && <span style={{ fontSize: 9, color: '#1f883d', background: '#dafbe1', borderRadius: 3, padding: '1px 4px', fontWeight: 600 }}>LIVE</span>}
    </div>
  )
}

function BranchStatus({ branch, liveBranches }) {
  const live = liveBranches?.find(lb => lb.name === branch.name)
  if (!live) return null
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
      {live.isOpen !== undefined && (
        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: live.isOpen ? '#dafbe1' : '#fff0f0', color: live.isOpen ? '#1f883d' : '#cf222e' }}>
          {live.isOpen ? '● Open now' : '● Closed now'}
        </span>
      )}
      {live.phone && <span style={{ fontSize: 10, color: '#656d76' }}>{live.phone}</span>}
    </div>
  )
}

export default function LocalSEO() {
  const [tab, setTab] = useState('Branches')
  const [liveBranches, setLiveBranches] = useState(null)
  const [loadingGBP, setLoadingGBP] = useState(true)

  useEffect(() => {
    fetch('/api/live-data?source=gbp')
      .then(r => r.json())
      .then(d => { if(d.ok && d.branches) setLiveBranches(d.branches) })
      .finally(() => setLoadingGBP(false))
  }, [])
  const [tasks, setTasks] = useState({})
  const [replyRating, setReplyRating] = useState(null)
  const [copiedReply, setCopiedReply] = useState(null)

  useEffect(() => {
    try { const t = localStorage.getItem('cc_local_tasks'); if(t) setTasks(JSON.parse(t)) } catch(e){}
  }, [])

  function tick(id) {
    const u = { ...tasks, [id]: !tasks[id] }
    setTasks(u); localStorage.setItem('cc_local_tasks', JSON.stringify(u))
  }

  function copyReply(rating, branch) {
    const text = REVIEW_TEMPLATES[rating].replace('[BRANCH]', branch)
    navigator.clipboard.writeText(text)
    setCopiedReply(rating); setTimeout(() => setCopiedReply(null), 2000)
    tick(`gbp_reply_${rating}`)
  }

  const donePct = Math.round(GBP_TASKS.filter(t => tasks[t.id]).length / GBP_TASKS.length * 100)
  const unreplied = REVIEWS.filter(r => !r.replied).length
  const criticalReviews = REVIEWS.filter(r => r.rating <= 2 && !r.replied).length

  return (
    <>
      <Head><title>Local SEO — CC Intelligence</title></Head>
      <Shell title="Local SEO" subtitle="3 branches · GBP performance · reviews · local rankings">

        <div style={{ background: T.blueBg, border: `0.5px solid ${T.blueBorder}`, borderRadius: 7, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: T.blue }}>
          <span>📥 Connect your Google Business Profile to see live ratings and reviews</span>
          <a href="/data-upload" style={{ fontSize: 11, color: '#fff', background: T.blue, borderRadius: 5, padding: '3px 12px', textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}>
            Upload GBP data →
          </a>
        </div>
        {criticalReviews > 0 && (
          <div style={{ background: T.redBg, border: `0.5px solid ${T.redBorder}`, borderRadius: 7, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: T.red, fontWeight: 500 }}>
            🚨 {criticalReviews} low-rating review{criticalReviews > 1 ? 's' : ''} not yet replied to — reply within 24 hours
          </div>
        )}

        {/* Branch summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: 12 }}>
          {BRANCHES.map((b, i) => (
            <div key={i} style={{ background: T.surface, border: `0.5px solid ${b.color === T.green ? T.greenBorder : b.color === T.amber ? T.amberBorder : T.redBorder}`, borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{b.name}</span>
                <LiveRating branch={b} liveBranches={liveBranches} loadingGBP={loadingGBP} />
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>{b.addr}</div>
              <BranchStatus branch={b} liveBranches={liveBranches} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
                {[{ l: 'Views', v: b.views.toLocaleString() }, { l: 'Calls', v: b.calls }, { l: 'Directions', v: b.directions }, { l: 'Website clicks', v: b.website }].map((s, x) => (
                  <div key={x} style={{ background: T.bg, borderRadius: 6, padding: '5px 8px' }}>
                    <div style={{ fontSize: 9, color: T.textMuted }}>{s.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: b.posts === 0 ? T.red : T.green, fontWeight: 500 }}>
                {b.posts === 0 ? '⚠️ No GBP posts this week — post today' : `✓ ${b.posts} GBP post${b.posts > 1 ? 's' : ''} this week`}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <a href={`https://business.google.com/`} target="_blank" rel="noreferrer"
                  style={{ fontSize: 10, color: '#fff', background: T.blue, borderRadius: 5, padding: '3px 9px', textDecoration: 'none', fontWeight: 500 }}>
                  Manage GBP →
                </a>
                <a href={`https://search.google.com/local/writereview?placeid=${b.id}`} target="_blank" rel="noreferrer"
                  style={{ fontSize: 10, color: T.blue, background: T.blueBg, border: `0.5px solid ${T.blueBorder}`, borderRadius: 5, padding: '3px 9px', textDecoration: 'none', fontWeight: 500 }}>
                  Get reviews →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `0.5px solid ${T.border}`, marginBottom: 14, overflowX: 'auto' }}>
          {['Branches', 'Reviews', 'Reply Templates', 'GBP Actions', 'Tasks'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 14px', fontSize: 11, fontWeight: tab === t ? 600 : 400, color: tab === t ? T.blue : T.textMuted, background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${T.blue}` : '2px solid transparent', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              {t}{t === 'Reviews' && unreplied > 0 ? ` (${unreplied} unreplied)` : ''}
            </button>
          ))}
        </div>

        {/* BRANCHES */}
        {tab === 'Branches' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 10 }}>Rating comparison</div>
              {BRANCHES.map((b, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{b.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: b.rating >= 4 ? T.green : b.rating >= 3.5 ? T.amber : T.red }}>{b.rating}★</span>
                  </div>
                  <div style={{ height: 5, background: T.borderLight, borderRadius: 99, overflow: 'hidden', border: `0.5px solid ${T.border}` }}>
                    <div style={{ width: `${(b.rating / 5) * 100}%`, height: '100%', background: b.rating >= 4 ? T.green : b.rating >= 3.5 ? T.amber : T.red, borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>
                    {b.rating < 4 ? `⚠️ Target 4.0★ — need ${Math.ceil((4.0 * b.reviews + 5 * 10) / (b.reviews + 10) * 10) / 10} avg from next 10 reviews` : '✓ Above 4.0 target'}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 10 }}>How to improve ratings</div>
              {[
                { branch: 'City Centre (3.5★)', steps: ['Reply to ALL reviews within 24hrs', 'Send review requests to happy customers', 'Post GBP updates every week', 'Fix any recurring complaints mentioned in reviews'] },
                { branch: 'Roundhay (3.8★)', steps: ['Reply to the 1-star wig complaint today', 'Post weekly GBP updates', 'Send review requests after every purchase'] },
              ].map((b, i) => (
                <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i === 0 ? `0.5px solid ${T.borderLight}` : 'none' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.amber, marginBottom: 6 }}>{b.branch}</div>
                  {b.steps.map((s, x) => (
                    <div key={x} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      <span style={{ color: T.amber, fontSize: 11 }}>{x + 1}.</span>
                      <span style={{ fontSize: 11, color: T.textMuted }}>{s}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === 'Reviews' && (
          <div>
            {loadingGBP && <div style={{padding:20,textAlign:'center',color:T.textMuted,fontSize:12}}>Loading live reviews from Google...</div>}
            {liveBranches && liveBranches.flatMap(b => (b.recentReviews||[]).map(r=>({...r,branch:b.name,reviewLink:b.reviewLink,mapsLink:b.mapsLink}))).sort((x,y)=>x.rating-y.rating).map((r, i) => (
              <div key={i} style={{ background: T.surface, border: `0.5px solid ${r.rating <= 2 ? T.redBorder : T.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.bg, border: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.text, flexShrink: 0 }}>{(r.author||'?').charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{r.author}</div>
                    <div style={{ fontSize: 10, color: T.textMuted }}>{r.branch} · {r.time}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(n => <span key={n} style={{ fontSize: 14, color: n <= r.rating ? '#f59e0b' : T.borderLight }}>★</span>)}
                  </div>
                  <span style={{ fontSize: 9, color: T.green, background: T.greenBg, borderRadius: 3, padding: '1px 5px', fontWeight: 600 }}>LIVE</span>
                  {r.rating <= 3 && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: T.redBg, color: T.red }}>Reply needed</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, marginBottom: 8 }}>{r.text}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => setReplyRating(r.rating === replyRating ? null : r.rating)} style={{ fontSize: 11, color: T.blue, background: T.blueBg, border: `0.5px solid ${T.blueBorder}`, borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}>
                    {replyRating === r.rating ? 'Hide template' : 'Get reply template'}
                  </button>
                  <a href={r.reviewLink} target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, color: '#fff', background: T.green, borderRadius: 6, padding: '4px 12px', textDecoration: 'none', fontWeight: 500 }}>
                    Reply on Google Maps →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REPLY TEMPLATES */}
        {tab === 'Reply Templates' && (
          <div>
            <div style={{ background: T.blueBg, border: `0.5px solid ${T.blueBorder}`, borderRadius: 7, padding: '9px 13px', marginBottom: 12, fontSize: 11, color: T.blue }}>
              Copy the template for the star rating of the review. Edit [BRANCH] to the branch name before pasting into Google Maps.
            </div>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} style={{ background: T.surface, border: `0.5px solid ${rating <= 2 ? T.redBorder : T.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3, 4, 5].map(n => <span key={n} style={{ fontSize: 16, color: n <= rating ? '#f59e0b' : T.borderLight }}>★</span>)}</div>
                  <button onClick={() => { navigator.clipboard.writeText(REVIEW_TEMPLATES[rating]); setCopiedReply(rating); setTimeout(() => setCopiedReply(null), 2000) }}
                    style={{ padding: '5px 14px', fontSize: 11, fontWeight: 600, color: '#fff', background: copiedReply === rating ? T.green : T.blue, border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    {copiedReply === rating ? '✓ Copied!' : '📋 Copy template'}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, fontStyle: 'italic' }}>{REVIEW_TEMPLATES[rating]}</div>
              </div>
            ))}
          </div>
        )}

        {/* GBP ACTIONS */}
        {tab === 'GBP Actions' && (
          <div>
            {[
              { title: 'What to post on GBP this week', items: [
                { day: 'Monday', type: 'Product spotlight', content: 'Bsset Curl Cream — tip on how to use for defined curls. All 3 branches.', urgent: false },
                { day: 'Thursday', type: 'Promotion', content: 'BRAID10 — 10% off all braiding hair this week only. All 3 branches.', urgent: false },
              ]},
            ].map((s, i) => (
              <div key={i} style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ padding: '9px 13px', borderBottom: `0.5px solid ${T.border}`, background: T.bg, fontSize: 12, fontWeight: 600, color: T.text }}>{s.title}</div>
                {s.items.map((item, ii) => (
                  <div key={ii} style={{ padding: '10px 14px', borderBottom: ii < s.items.length - 1 ? `0.5px solid ${T.borderLight}` : 'none' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.blue, minWidth: 70 }}>{item.day}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{item.type}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{item.content}</div>
                    <div style={{ fontSize: 10, color: T.blue, marginTop: 4 }}>→ Use Blog Planner → GBP Planner tab → Generate → Copy → Post on Google Business Profile</div>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>How to post on Google Business Profile</div>
              {['Go to business.google.com','Select the branch you want to post for','Click "Add update" or "Create post"','Paste the generated post from the Blog Planner','Add a photo if available','Click Publish — post appears on Google Maps immediately'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: T.blueBg, border: `1px solid ${T.blue}`, color: T.blue, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 11, color: T.textMuted }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TASKS */}
        {tab === 'Tasks' && (
          <div style={{ maxWidth: 860 }}>
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
                <span style={{ fontWeight: 600, color: T.text }}>Local SEO task progress</span>
                <span style={{ color: T.textMuted }}>{donePct}%</span>
              </div>
              <div style={{ height: 5, background: T.borderLight, borderRadius: 99, border: `0.5px solid ${T.border}`, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${donePct}%`, background: donePct === 100 ? T.green : T.blue, borderRadius: 99, transition: 'width 0.3s' }} />
              </div>
            </div>
            {GBP_TASKS.map((task, i) => (
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
