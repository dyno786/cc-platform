import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

// Place IDs confirmed live via API
const PLACE_IDS = {
  Chapeltown:   'ChIJ_5jc6wlceUgRo_t7u41q3Dw',
  Roundhay:     'ChIJSwvcAYlbeUgRT7wTEeJy25A',
  'City Centre':'ChIJqTbKkhlceUgRcbg1e3Z7Ezo',
}

const STATIC_BRANCHES = [
  { name:'Chapeltown',  addr:'119 Chapeltown Rd, Leeds LS7 3HY',      phone:'0113 318 3830', rating:4.1, reviews:72 },
  { name:'Roundhay',    addr:'256 Roundhay Rd, Leeds LS8 5RL',         phone:'0113 249 5450', rating:3.9, reviews:128 },
  { name:'City Centre', addr:'1-19 New York St, Leeds LS2 7DT',        phone:'',              rating:3.6, reviews:41 },
]

const TRUSTPILOT = 'https://uk.trustpilot.com/review/www.cchairandbeauty.com'
const COMMUNITY_BLOG = 'https://cchairandbeauty.com/blogs/news'

// Calculate how many 5-star reviews needed to reach a target rating
function reviewsNeeded(currentRating, currentCount, targetRating) {
  // (currentRating * currentCount + 5 * x) / (currentCount + x) = targetRating
  // Solve for x: x = (targetRating * currentCount - currentRating * currentCount) / (5 - targetRating)
  if (targetRating >= 5) return Math.ceil((5 * currentCount - currentRating * currentCount) / (5 - 4.99))
  const x = (targetRating * currentCount - currentRating * currentCount) / (5 - targetRating)
  return Math.max(0, Math.ceil(x))
}

function buildReviewWhatsApp(branch) {
  const googleLink = branch.reviewLink || `https://search.google.com/local/writereview?placeid=${branch.placeId}`
  const msg = [
    `Hi, thank you for visiting CC Hair and Beauty ${branch.name}!`,
    ``,
    `We hope you enjoyed your experience with us. Would you mind leaving us a quick Google review? It takes less than 2 minutes and really helps us as a Leeds community business.`,
    ``,
    `Leave a review here: ${googleLink}`,
    ``,
    `We have been serving the Leeds community since 1979 and your support means everything to us.`,
    ``,
    `You can read more about our community work here: ${COMMUNITY_BLOG}`,
    ``,
    `Thank you so much.`,
    `CC Hair and Beauty ${branch.name}`,
  ].join('\n')
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}

function buildReviewEmail(branch) {
  const googleLink = branch.reviewLink || `https://search.google.com/local/writereview?placeid=${branch.placeId}`
  const subj = `Thank you for visiting CC Hair and Beauty ${branch.name}`
  const body = [
    `Hi,`,
    ``,
    `Thank you for visiting CC Hair and Beauty ${branch.name}!`,
    ``,
    `We hope you enjoyed your experience. Would you mind leaving us a quick Google review? It takes less than 2 minutes and really helps us as a Leeds community business serving customers since 1979.`,
    ``,
    `Leave a review here: ${googleLink}`,
    ``,
    `You can also read more about our community work here: ${COMMUNITY_BLOG}`,
    ``,
    `Thank you so much for your support.`,
    ``,
    `Warm regards,`,
    `CC Hair and Beauty ${branch.name}`,
    `cchairandbeauty.com`,
  ].join('\n')
  return `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
}

const REPLY_TEMPLATES = {
  5: `Thank you so much for your kind words! We're delighted you had a great experience at CC Hair and Beauty [BRANCH]. Our team works hard to give every customer the best service and product knowledge. We look forward to seeing you again soon! — CC Hair and Beauty`,
  4: `Thank you for your lovely review! We're glad you enjoyed your visit to CC Hair and Beauty [BRANCH]. We appreciate your feedback and hope to see you again soon! — CC Hair and Beauty`,
  3: `Thank you for your review of CC Hair and Beauty [BRANCH]. We'd love to hear more about how we could improve — please contact us at info@cchairandbeauty.com. — CC Hair and Beauty`,
  2: `Thank you for your feedback. We're sorry your experience didn't meet expectations. Please contact us at info@cchairandbeauty.com or call us so we can make this right. — CC Hair and Beauty`,
  1: `We sincerely apologise for your experience. This is not our standard. Please contact us directly at info@cchairandbeauty.com or call 0113 318 3830 so we can resolve this for you. — CC Hair and Beauty`,
}

const GBP_TASKS = [
  { id:'gbp_t1', text:'Post GBP update — City Centre (0 posts this week)',     how:'business.google.com → City Centre → Add update' },
  { id:'gbp_t2', text:'Reply to any low-rating reviews across all branches',   how:'Google Maps → your branch → Reviews → Reply' },
  { id:'gbp_t3', text:'Add new product photos to Roundhay GBP profile',        how:'business.google.com → Roundhay → Photos → Add photos' },
  { id:'gbp_t4', text:'Send review request WhatsApp to yesterday\'s customers', how:'WhatsApp → send review request template with branch link' },
  { id:'gbp_t5', text:'Post GBP Monday product spotlight — all 3 branches',    how:'Blog Planner → GBP Posts → Week 1 → Generate → Post' },
  { id:'gbp_t6', text:'Post GBP Thursday promo — BRAID10 — all 3 branches',   how:'Blog Planner → GBP Posts → Week 1 Thursday → Generate → Post' },
  { id:'gbp_t7', text:'Check all 3 branch opening hours are correct on Google', how:'business.google.com → each branch → Business information → Hours' },
]

export default function LocalSEO() {
  const [tab, setTab] = useState('Branches')
  const [branches, setBranches] = useState(STATIC_BRANCHES)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState({})
  const [replyRating, setReplyRating] = useState(null)
  const [copiedReply, setCopiedReply] = useState(null)

  useEffect(() => {
    try {
      const t = localStorage.getItem('cc_local_tasks')
      if (t) setTasks(JSON.parse(t))
    } catch(e) {}

    fetch('/api/live-data?source=gbp')
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.branches) {
          // Merge live data over static
          const merged = STATIC_BRANCHES.map(sb => {
            const live = d.branches.find(lb => lb.name === sb.name)
            if (!live) return sb
            return {
              ...sb,
              rating: live.rating || sb.rating,
              reviews: live.reviewCount || sb.reviews,
              isOpen: live.isOpen,
              phone: live.phone || sb.phone,
              reviewLink: live.reviewLink,
              mapsLink: live.mapsLink,
              recentReviews: live.recentReviews || [],
              isLive: true,
            }
          })
          setBranches(merged)
          // Flatten all reviews
          const allReviews = d.branches.flatMap(b =>
            (b.recentReviews || []).map(r => ({ ...r, branch: b.name, reviewLink: b.reviewLink }))
          ).sort((x, y) => x.rating - y.rating)
          setReviews(allReviews)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function tick(id) {
    const u = { ...tasks, [id]: !tasks[id] }
    setTasks(u)
    try { localStorage.setItem('cc_local_tasks', JSON.stringify(u)) } catch(e) {}
  }

  function copyReply(rating, branch) {
    const text = REPLY_TEMPLATES[rating].replace('[BRANCH]', branch)
    navigator.clipboard.writeText(text)
    setCopiedReply(rating)
    setTimeout(() => setCopiedReply(null), 2000)
  }

  const donePct = Math.round(GBP_TASKS.filter(t => tasks[t.id]).length / GBP_TASKS.length * 100)
  const criticalReviews = reviews.filter(r => r.rating <= 2).length

  function StarRow({ n }) {
    return (
      <div style={{ display:'flex', gap:2 }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ fontSize:14, color: i <= n ? '#f59e0b' : T.borderLight }}>★</span>
        ))}
      </div>
    )
  }

  return (
    <>
      <Head><title>Local SEO — CC Intelligence</title></Head>
      <Shell title="Local SEO" subtitle="3 branches · GBP performance · reviews · local rankings">

        {/* Upload reminder */}
        <div style={{ background:T.blueBg, border:`0.5px solid ${T.blueBorder}`, borderRadius:7, padding:'8px 12px', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, color:T.blue }}>
          <span>📥 GBP ratings load live automatically via Google Places API</span>
          <span style={{ fontSize:10, color:T.green, fontWeight:600 }}>{loading ? 'Loading...' : '✓ Live data connected'}</span>
        </div>

        {criticalReviews > 0 && (
          <div style={{ background:T.redBg, border:`0.5px solid ${T.redBorder}`, borderRadius:7, padding:'8px 12px', marginBottom:10, fontSize:11, color:T.red, fontWeight:500 }}>
            🚨 {criticalReviews} low-rating review{criticalReviews > 1 ? 's' : ''} — reply within 24 hours
          </div>
        )}

        {/* Branch cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:10, marginBottom:12 }}>
          {branches.map((b, i) => {
            const ratingColor = b.rating >= 4 ? T.green : b.rating >= 3.5 ? T.amber : T.red
            const borderColor = b.rating >= 4 ? T.greenBorder : b.rating >= 3.5 ? T.amberBorder : T.redBorder
            return (
              <div key={i} style={{ background:T.surface, border:`0.5px solid ${borderColor}`, borderRadius:8, padding:'14px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{b.name}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ fontSize:14 }}>⭐</span>
                    <span style={{ fontSize:13, fontWeight:700, color:ratingColor }}>{b.rating}</span>
                    <span style={{ fontSize:10, color:T.textMuted }}>({b.reviews})</span>
                    {b.isLive && <span style={{ fontSize:9, color:T.green, background:T.greenBg, borderRadius:3, padding:'1px 4px', fontWeight:600 }}>LIVE</span>}
                  </div>
                </div>
                <div style={{ fontSize:10, color:T.textMuted, marginBottom:6 }}>{b.addr}</div>
                {b.phone && <div style={{ fontSize:10, color:T.textMuted, marginBottom:6 }}>{b.phone}</div>}
                {b.isOpen !== undefined && (
                  <div style={{ marginBottom:8 }}>
                    <span style={{ fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:20, background: b.isOpen ? T.greenBg : T.redBg, color: b.isOpen ? T.green : T.red }}>
                      {b.isOpen ? '● Open now' : '● Closed now'}
                    </span>
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                  {[{l:'Views',v:'—'},{l:'Calls',v:'—'},{l:'Directions',v:'—'},{l:'Website',v:'—'}].map((s,x) => (
                    <div key={x} style={{ background:T.bg, borderRadius:6, padding:'5px 8px' }}>
                      <div style={{ fontSize:9, color:T.textMuted }}>{s.l}</div>
                      <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <a href="https://business.google.com/" target="_blank" rel="noreferrer"
                    style={{ fontSize:10, color:'#fff', background:T.blue, borderRadius:5, padding:'3px 9px', textDecoration:'none', fontWeight:500 }}>
                    Manage GBP →
                  </a>
                  {b.reviewLink && (
                    <a href={b.reviewLink} target="_blank" rel="noreferrer"
                      style={{ fontSize:10, color:T.blue, background:T.blueBg, border:`0.5px solid ${T.blueBorder}`, borderRadius:5, padding:'3px 9px', textDecoration:'none', fontWeight:500 }}>
                      Get reviews →
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:`0.5px solid ${T.border}`, marginBottom:14, overflowX:'auto' }}>
          {['Branches','Reviews','Reply Templates','GBP Actions','Tasks'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'7px 14px', fontSize:11, fontWeight:tab===t?600:400, color:tab===t?T.blue:T.textMuted, background:'none', border:'none', borderBottom:tab===t?`2px solid ${T.blue}`:'2px solid transparent', whiteSpace:'nowrap', cursor:'pointer' }}>
              {t}{t==='Reviews' && reviews.length > 0 ? ` (${reviews.length})` : ''}
            </button>
          ))}
        </div>

        {/* BRANCHES tab */}
        {tab === 'Branches' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ background:T.surface, border:`0.5px solid ${T.border}`, borderRadius:8, padding:'14px 16px' }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.text, marginBottom:10 }}>Rating comparison — live from Google</div>
              {branches.map((b, i) => {
                const ratingColor = b.rating >= 4 ? T.green : b.rating >= 3.5 ? T.amber : T.red
                // Build review targets from current rating up to 5.0 in 0.1 steps
                const targets = []
                let t = Math.ceil(b.rating * 10) / 10
                while (t <= 5.0 && targets.length < 8) {
                  t = parseFloat((t + 0.1).toFixed(1))
                  if (t > b.rating) targets.push({ target: t, needed: reviewsNeeded(b.rating, b.reviews, t) })
                }
                return (
                  <div key={i} style={{ marginBottom:16, paddingBottom:16, borderBottom: i < branches.length-1 ? `0.5px solid ${T.border}` : 'none' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:T.text }}>{b.name}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:ratingColor }}>{b.rating}★ ({b.reviews} reviews)</span>
                    </div>
                    <div style={{ height:5, background:T.borderLight, borderRadius:99, overflow:'hidden', border:`0.5px solid ${T.border}`, marginBottom:8 }}>
                      <div style={{ width:`${(b.rating/5)*100}%`, height:'100%', background:ratingColor, borderRadius:99 }}/>
                    </div>
                    {/* Review targets — how many 5★ reviews to reach next milestone */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:6, marginBottom:8 }}>
                      {[0.1,0.2,0.3,0.4,0.5].map((inc,ti) => {
                        const target = parseFloat((Math.ceil(b.rating*10)/10 + inc).toFixed(1))
                        if (target > 5) return null
                        const needed = reviewsNeeded(b.rating, b.reviews, target)
                        return (
                          <div key={ti} style={{
                            fontSize:10, padding:'2px 8px', borderRadius:4,
                            background: ti===0 ? T.greenBg : T.bg,
                            border:`1px solid ${ti===0 ? T.greenBorder : T.border}`,
                            color: ti===0 ? T.green : T.textMuted,
                            fontWeight: ti===0 ? 700 : 400,
                          }}>
                            {target}★ — {needed} more 5★ review{needed!==1?'s':''}
                          </div>
                        )
                      })}
                    </div>
                    {/* Review request buttons */}
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      <a href={buildReviewWhatsApp(b)} target="_blank" rel="noreferrer"
                        style={{ fontSize:10, fontWeight:700, color:'#fff', background:'#25D366', borderRadius:5, padding:'4px 10px', textDecoration:'none' }}>
                        WhatsApp review request
                      </a>
                      <a href={buildReviewEmail(b)} target="_blank" rel="noreferrer"
                        style={{ fontSize:10, fontWeight:700, color:'#fff', background:T.blue, borderRadius:5, padding:'4px 10px', textDecoration:'none' }}>
                        Email review request
                      </a>
                      {b.reviewLink && (
                        <a href={b.reviewLink} target="_blank" rel="noreferrer"
                          style={{ fontSize:10, color:T.blue, background:T.blueBg, border:`0.5px solid ${T.blueBorder}`, borderRadius:5, padding:'4px 9px', textDecoration:'none' }}>
                          Google review link →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ background:T.surface, border:`0.5px solid ${T.border}`, borderRadius:8, padding:'14px 16px' }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.text, marginBottom:10 }}>How to improve ratings</div>
              {[
                { branch:'City Centre (3.6★)', steps:['Reply to ALL reviews within 24hrs','Post GBP updates every Monday and Thursday','Send review requests after every purchase','Fix recurring complaints from reviews'] },
                { branch:'Roundhay (3.9★)', steps:['Reply to any unanswered low reviews today','Post weekly GBP updates','Send review requests after purchases'] },
              ].map((b, i) => (
                <div key={i} style={{ marginBottom:12, paddingBottom:12, borderBottom:i===0?`0.5px solid ${T.borderLight}`:'none' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:T.amber, marginBottom:6 }}>{b.branch}</div>
                  {b.steps.map((s, x) => (
                    <div key={x} style={{ display:'flex', gap:6, marginBottom:4 }}>
                      <span style={{ color:T.amber, fontSize:11 }}>{x+1}.</span>
                      <span style={{ fontSize:11, color:T.textMuted }}>{s}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS tab */}
        {tab === 'Reviews' && (
          <div>
            {loading && (
              <div style={{ padding:20, textAlign:'center', color:T.textMuted, fontSize:12 }}>
                Loading live reviews from Google Places...
              </div>
            )}
            {!loading && reviews.length === 0 && (
              <div style={{ background:T.amberBg, border:`0.5px solid ${T.amberBorder}`, borderRadius:8, padding:20, textAlign:'center', color:T.amber, fontSize:12 }}>
                No reviews loaded yet — Google Places API returns up to 5 most recent reviews per branch.
              </div>
            )}
            {reviews.map((r, i) => (
              <div key={i} style={{ background:T.surface, border:`0.5px solid ${r.rating <= 2 ? T.redBorder : T.border}`, borderRadius:8, padding:'12px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:T.bg, border:`0.5px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:T.text, flexShrink:0 }}>
                    {(r.author || '?').charAt(0)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:T.text }}>{r.author}</div>
                    <div style={{ fontSize:10, color:T.textMuted }}>{r.branch} · {r.time}</div>
                  </div>
                  <StarRow n={r.rating} />
                  <span style={{ fontSize:9, color:T.green, background:T.greenBg, borderRadius:3, padding:'1px 5px', fontWeight:600 }}>LIVE</span>
                  {r.rating <= 3 && (
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:T.redBg, color:T.red }}>Reply needed</span>
                  )}
                </div>
                <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.5, marginBottom:8 }}>{r.text}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <button onClick={() => setReplyRating(replyRating === r.rating ? null : r.rating)}
                    style={{ fontSize:11, color:T.blue, background:T.blueBg, border:`0.5px solid ${T.blueBorder}`, borderRadius:6, padding:'4px 12px', cursor:'pointer' }}>
                    {replyRating === r.rating ? 'Hide template' : 'Get reply template'}
                  </button>
                  {r.reviewLink && (
                    <a href={r.reviewLink} target="_blank" rel="noreferrer"
                      style={{ fontSize:11, color:'#fff', background:T.green, borderRadius:6, padding:'4px 12px', textDecoration:'none', fontWeight:500 }}>
                      Reply on Google Maps →
                    </a>
                  )}
                </div>
                {replyRating === r.rating && (
                  <div style={{ marginTop:8, background:T.bg, border:`0.5px solid ${T.border}`, borderRadius:6, padding:'8px 10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                      <span style={{ fontSize:10, color:T.textMuted }}>Reply template — edit before posting</span>
                      <button onClick={() => copyReply(r.rating, r.branch)}
                        style={{ fontSize:10, color:'#fff', background:copiedReply===r.rating?T.green:T.blue, border:'none', borderRadius:4, padding:'3px 8px', cursor:'pointer' }}>
                        {copiedReply===r.rating ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted, lineHeight:1.5, fontStyle:'italic' }}>
                      {REPLY_TEMPLATES[r.rating]?.replace('[BRANCH]', r.branch)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* REPLY TEMPLATES tab */}
        {tab === 'Reply Templates' && (
          <div>
            <div style={{ background:T.blueBg, border:`0.5px solid ${T.blueBorder}`, borderRadius:7, padding:'9px 13px', marginBottom:12, fontSize:11, color:T.blue }}>
              Copy the template for the review star rating. Replace [BRANCH] with the branch name before pasting.
            </div>
            {[5,4,3,2,1].map(rating => (
              <div key={rating} style={{ background:T.surface, border:`0.5px solid ${rating<=2?T.redBorder:T.border}`, borderRadius:8, padding:'12px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <StarRow n={rating} />
                  <button onClick={() => { navigator.clipboard.writeText(REPLY_TEMPLATES[rating]); setCopiedReply(rating); setTimeout(()=>setCopiedReply(null),2000) }}
                    style={{ padding:'5px 14px', fontSize:11, fontWeight:600, color:'#fff', background:copiedReply===rating?T.green:T.blue, border:'none', borderRadius:6, cursor:'pointer' }}>
                    {copiedReply===rating ? '✓ Copied!' : '📋 Copy template'}
                  </button>
                </div>
                <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.6, fontStyle:'italic' }}>{REPLY_TEMPLATES[rating]}</div>
              </div>
            ))}
          </div>
        )}

        {/* GBP ACTIONS tab */}
        {tab === 'GBP Actions' && (
          <div>
            <div style={{ background:T.surface, border:`0.5px solid ${T.border}`, borderRadius:8, overflow:'hidden', marginBottom:12 }}>
              <div style={{ padding:'9px 13px', borderBottom:`0.5px solid ${T.border}`, background:T.bg, fontSize:12, fontWeight:600, color:T.text }}>This week — what to post on GBP</div>
              {[
                { day:'Monday', type:'Product spotlight', content:'Bsset Curl Cream — tip on how to use for defined curls. Post on all 3 branches.', code:'OIL10' },
                { day:'Thursday', type:'Promotion', content:'BRAID10 — 10% off all braiding hair this week. Post on all 3 branches.', code:'BRAID10' },
              ].map((item, i) => (
                <div key={i} style={{ padding:'10px 14px', borderBottom:i===0?`0.5px solid ${T.borderLight}`:'none' }}>
                  <div style={{ display:'flex', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:T.blue, minWidth:70 }}>{item.day}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:T.text }}>{item.type}</span>
                  </div>
                  <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>{item.content}</div>
                  <div style={{ fontSize:10, color:T.blue }}>→ Blog Planner → GBP Posts → Generate → Copy → Post on Google Business Profile</div>
                </div>
              ))}
            </div>
            <div style={{ background:T.surface, border:`0.5px solid ${T.border}`, borderRadius:8, padding:'12px 14px' }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.text, marginBottom:8 }}>How to post on Google Business Profile</div>
              {['Go to business.google.com','Select the branch','Click "Add update"','Paste the generated post from Blog Planner','Add a photo if available','Click Publish'].map((s, i) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom:5 }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', background:T.blueBg, border:`1px solid ${T.blue}`, color:T.blue, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
                  <span style={{ fontSize:11, color:T.textMuted }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TASKS tab */}
        {tab === 'Tasks' && (
          <div style={{ maxWidth:860 }}>
            <div style={{ background:T.surface, border:`0.5px solid ${T.border}`, borderRadius:8, padding:'10px 14px', marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:11 }}>
                <span style={{ fontWeight:600, color:T.text }}>Local SEO task progress</span>
                <span style={{ color:T.textMuted }}>{donePct}%</span>
              </div>
              <div style={{ height:5, background:T.borderLight, borderRadius:99, border:`0.5px solid ${T.border}`, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${donePct}%`, background:donePct===100?T.green:T.blue, borderRadius:99, transition:'width 0.3s' }}/>
              </div>
            </div>
            {GBP_TASKS.map(task => (
              <div key={task.id} onClick={() => tick(task.id)}
                style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', background:tasks[task.id]?T.greenBg:T.surface, border:`0.5px solid ${T.border}`, borderRadius:8, marginBottom:7, cursor:'pointer' }}>
                <div style={{ width:15, height:15, borderRadius:4, border:`1.5px solid ${tasks[task.id]?T.green:T.border}`, background:tasks[task.id]?T.green:'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}>
                  {tasks[task.id] && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div>
                  <div style={{ fontSize:12, color:tasks[task.id]?T.textMuted:T.text, textDecoration:tasks[task.id]?'line-through':'none', marginBottom:3 }}>{task.text}</div>
                  <div style={{ fontSize:10, color:T.blue }}>→ {task.how}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Shell>
    </>
  )
}
