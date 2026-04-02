import Head from 'next/head'
import { useState } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8',
  teal:'#14b8a6',
}

// ── 309 LOCAL KEYWORDS ──────────────────────────────────────────────
const KEYWORD_CLUSTERS = [
  {
    cluster: 'Brand searches',
    color: '#6366f1',
    icon: '🏷️',
    desc: 'People searching directly for CC Hair & Beauty',
    keywords: [
      'cc hair beauty','cc hair and beauty','cc hair beauty leeds','cc hair beauty chapeltown',
      'cc hair beauty roundhay','cc hair beauty city centre','cc hair near me','continentals hair beauty',
      'continental hair shop leeds','cc hair beauty opening times','cc hair beauty online',
    ],
  },
  {
    cluster: 'Local intent',
    color: '#14b8a6',
    icon: '📍',
    desc: 'People looking for hair shops in Leeds — high priority for blogs',
    keywords: [
      'hair shop leeds','hair shops in leeds','afro hair shop leeds','black hair shop leeds',
      'natural hair shop leeds','hair beauty shop leeds','hair shop near me leeds',
      'hair shop chapeltown','hair shop roundhay','hair shop city centre leeds',
      'hair supply store leeds','professional hair shop leeds','hair products store leeds',
      'where to buy hair products leeds','hair beauty supply leeds',
    ],
  },
  {
    cluster: 'Product searches',
    color: '#f59e0b',
    icon: '🛍️',
    desc: 'Specific products — use these as blog topics and product page keywords',
    keywords: [
      'braiding hair leeds','buy braiding hair leeds','kanekalon braiding hair leeds',
      'wigs leeds','human hair wigs leeds','lace front wigs leeds','synthetic wigs leeds',
      'hair extensions leeds','clip in hair extensions leeds','weave extensions leeds',
      'relaxers leeds','hair relaxer leeds','ors relaxer leeds','dark and lovely relaxer leeds',
      'hair dye leeds','hair colour leeds','professional hair dye leeds',
      'edge control leeds','natural hair products leeds','cantu products leeds',
      'mielle products leeds','ors products leeds','shea butter hair products leeds',
      'hair growth products leeds','moisture products natural hair leeds',
    ],
  },
  {
    cluster: 'Question searches',
    color: '#22c55e',
    icon: '❓',
    desc: 'Blog post titles — answer these questions to rank on Google',
    keywords: [
      'where to buy braiding hair in leeds','where to buy wigs in leeds',
      'best hair shop in leeds','what time does cc hair beauty open',
      'where to buy ors relaxer in leeds','where can i buy cantu in leeds',
      'best natural hair products uk','how to care for afro hair uk',
      'where to buy hair extensions leeds','best wigs for beginners uk',
      'where to buy edge control uk','best relaxer for natural hair uk',
      'how to grow afro hair uk','best hair growth oil uk',
      'where to buy mielle rosemary oil uk','kanekalon hair uk where to buy',
    ],
  },
  {
    cluster: 'Specialist brands',
    color: '#ef4444',
    icon: '⭐',
    desc: 'Brand + location combos — target customers searching specific brands in Leeds',
    keywords: [
      'redken leeds','loreal professional leeds','wella leeds','schwarzkopf leeds',
      'cantu uk','ors uk','mielle organics uk','dark and lovely uk',
      'africas best uk','shea moisture uk','design essentials uk',
      'olaplex leeds','keratin treatment leeds','professional colour leeds',
      'schwarzkopf professional leeds','wella koleston leeds',
    ],
  },
]

const BRANCHES = [
  {
    id:'chapeltown', name:'Chapeltown', area:'LS7',
    address:'178 Chapeltown Road, Leeds LS7 4HP',
    rating:4.0, reviews:66, target:4.2,
    color:'#22c55e', alertColor:'#f59e0b',
    photo:'https://maps.googleapis.com/maps/api/streetview?size=400x200&location=178+Chapeltown+Road+Leeds&key=placeholder',
    status:'⚠️ Post due',
    tasks:[
      {done:false, text:'Post weekly GBP offer today'},
      {done:false, text:'Reply to 3 unanswered reviews — AI drafts ready'},
      {done:false, text:'Answer 3 unanswered Q&A questions'},
      {done:true,  text:'QR review badge displayed in store'},
    ],
    reviewLink:'https://search.google.com/local/writereview?placeid=ChIJT7m2t7RdeUgRlHFDpf6LGKA',
    gbpLink:'https://business.google.com',
  },
  {
    id:'roundhay', name:'Roundhay', area:'LS8',
    address:'254 Roundhay Road, Leeds LS8 4HS',
    rating:3.8, reviews:119, target:4.2,
    color:'#f59e0b', alertColor:'#ef4444',
    status:'🔴 Post overdue 5 days',
    tasks:[
      {done:false, text:'Post weekly GBP offer — OVERDUE 5 days'},
      {done:false, text:'Reply to negative review from Anonymous (2★)'},
      {done:false, text:'Upload 3 new product photos to GBP'},
      {done:true,  text:'QR review badge displayed in store'},
    ],
    reviewLink:'https://search.google.com/local/writereview?placeid=ChIJrTLr-GyQe0gRBnUga2OdkPI',
    gbpLink:'https://business.google.com',
  },
  {
    id:'citycentre', name:'City Centre', area:'New York St',
    address:'27 New York Street, Leeds LS2 7DY',
    rating:3.3, reviews:35, target:4.2,
    color:'#ef4444', alertColor:'#ef4444',
    status:'🔴 Low rating — urgent',
    tasks:[
      {done:false, text:'Post weekly GBP offer today'},
      {done:false, text:'Reply to 2 negative reviews — AI drafts ready'},
      {done:false, text:'Answer 1 unanswered Q&A question'},
      {done:false, text:'Ask every customer for a review this week'},
    ],
    reviewLink:'https://search.google.com/local/writereview?placeid=ChIJ9z4yFuJceUgRFjYGryOLGn0',
    gbpLink:'https://business.google.com',
  },
]

const REVIEWS = {
  chapeltown:[
    {author:'Sarah M.',  stars:5, time:'2h ago',  text:'Absolutely love this shop! Always have exactly what I need for my natural hair.'},
    {author:'Priya K.',  stars:5, time:'1d ago',  text:'Best hair shop in Leeds! Huge selection. I drive from Bradford just to shop here.'},
    {author:'Anonymous', stars:3, time:'3d ago',  text:'Good selection but it was quite busy when I visited.'},
  ],
  roundhay:[
    {author:'Anonymous', stars:2, time:'4h ago',  text:'Prices are higher than expected and staff seemed busy.'},
    {author:'Diane F.',  stars:5, time:'2d ago',  text:'Love this local branch! Always has everything I need.'},
    {author:'Marcus H.', stars:3, time:'5d ago',  text:'OK selection but could do with more braiding hair options.'},
  ],
  citycentre:[
    {author:'James T.',  stars:3, time:'1d ago',  text:'Decent selection but the shop felt a bit disorganised.'},
    {author:'Fiona R.',  stars:2, time:'3d ago',  text:"Couldn't find what I was looking for and staff weren't very helpful."},
    {author:'Amara O.',  stars:5, time:'1w ago',  text:'Hidden gem in Leeds city centre! Great for natural and afro hair.'},
  ],
}

function genReply(stars, branch) {
  const t = {
    5:`Thank you so much for your wonderful review! We're thrilled you had such a great experience at our ${branch} store. We look forward to seeing you again soon!`,
    4:`Thank you for your kind review and for visiting our ${branch} branch! We're glad you had a positive experience.`,
    3:`Thank you for taking the time to leave a review. We appreciate your honest feedback. We'd love the opportunity to give you an even better experience next time!`,
    2:`Thank you for your feedback. We're sorry to hear your visit to our ${branch} branch didn't fully meet your expectations. We stock specialist professional brands not available in supermarkets. Please visit us again!`,
    1:`Thank you for your feedback. We're very sorry about your experience. Please contact us directly so we can resolve this for you.`,
  }
  return t[stars] || t[3]
}

function ReviewCard({ review, branchName, reviewLink }) {
  const [reply, setReply] = useState(genReply(review.stars, branchName))
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [regen, setRegen] = useState(false)

  async function regenerate() {
    setRegen(true)
    try {
      const res = await fetch('/api/ai-reply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: review.text, branch: branchName, rating: review.stars }),
      })
      const d = await res.json()
      if (d.reply) setReply(d.reply)
    } catch(e) {}
    setRegen(false)
  }

  const starColor = review.stars >= 4 ? C.green : review.stars === 3 ? C.amber : C.red

  return (
    <div style={{ background:C.surface2, borderRadius:10, padding:14, marginBottom:10, border:'1px solid '+(review.stars<=2?C.red+'30':C.border) }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ width:34,height:34,borderRadius:'50%',background:C.surface,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:C.text2,flexShrink:0 }}>
            {review.author[0]}
          </div>
          <div>
            <div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{review.author}</div>
            <div style={{ color:C.text3, fontSize:11 }}>{review.time}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:2 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ color:i<=review.stars?'#f59e0b':C.border,fontSize:14 }}>★</span>)}
        </div>
      </div>
      <p style={{ color:C.text2, fontSize:13, fontStyle:'italic', lineHeight:1.5, marginBottom:10, padding:'8px 10px', background:C.surface, borderRadius:7 }}>"{review.text}"</p>
      <div style={{ background:'rgba(99,102,241,.08)', border:'1px solid rgba(99,102,241,.2)', borderRadius:8, padding:10, marginBottom:8 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.accent2, marginBottom:5, textTransform:'uppercase', letterSpacing:'.05em' }}>✨ AI Reply — copy &amp; paste to Google</div>
        {editing
          ? <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={3} style={{ width:'100%', background:C.surface2, border:'1px solid '+C.border, borderRadius:6, color:C.text, fontSize:12, padding:7, resize:'vertical', fontFamily:'inherit' }}/>
          : <p style={{ color:C.text, fontSize:12, lineHeight:1.6, margin:0 }}>{reply}</p>
        }
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        <button onClick={() => { navigator.clipboard.writeText(reply); setCopied(true); setTimeout(()=>setCopied(false),2000) }} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:copied?C.green:C.accent, color:copied?'#000':'#fff', fontWeight:600, fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>
          {copied ? '✓ Copied!' : '📋 Copy reply'}
        </button>
        <a href={reviewLink} target="_blank" rel="noreferrer" style={{ padding:'5px 12px', borderRadius:6, border:'1px solid '+C.border, background:C.surface, color:C.accent2, fontSize:11, textDecoration:'none', display:'inline-flex', alignItems:'center' }}>
          Open Google →
        </a>
        <button onClick={() => setEditing(!editing)} style={{ padding:'5px 10px', borderRadius:6, border:'1px solid '+C.border, background:C.surface, color:C.text2, cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>{editing?'Done':'Edit'}</button>
        <button onClick={regenerate} disabled={regen} style={{ padding:'5px 10px', borderRadius:6, border:'1px solid '+C.border, background:C.surface, color:C.text2, cursor:'pointer', fontSize:11, marginLeft:'auto', fontFamily:'inherit' }}>{regen?'...':'↺ New'}</button>
      </div>
    </div>
  )
}

function BranchCard({ branch, expanded, onToggle }) {
  const [taskDone, setTaskDone] = useState({})
  const reviews = REVIEWS[branch.id] || []
  const rc = branch.rating >= 4 ? C.green : branch.rating >= 3.7 ? C.amber : C.red
  const reviewsNeeded = Math.ceil((branch.target * branch.reviews - branch.rating * branch.reviews) / (5 - branch.target))

  return (
    <div style={{ border:'2px solid '+(branch.rating>=4?C.green+'40':branch.rating>=3.7?C.amber+'40':C.red+'40'), borderRadius:14, overflow:'hidden', background:C.surface }}>
      {/* Branch header — always visible */}
      <div
        onClick={onToggle}
        style={{ padding:'16px 18px', cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}
      >
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <span style={{ fontWeight:800, fontSize:17, color:C.text }}>{branch.name}</span>
            <span style={{ color:C.text3, fontSize:13 }}>{branch.area}</span>
            <span style={{ background:branch.alertColor+'20', color:branch.alertColor, padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700 }}>{branch.status}</span>
          </div>
          <div style={{ color:C.text3, fontSize:12 }}>{branch.address}</div>
        </div>
        <div style={{ textAlign:'center', flexShrink:0 }}>
          <div style={{ fontSize:28, fontWeight:800, color:rc }}>{branch.rating}★</div>
          <div style={{ fontSize:11, color:C.text3 }}>{branch.reviews} reviews</div>
        </div>
        <div style={{ color:C.text3, fontSize:18 }}>{expanded ? '▲' : '▼'}</div>
      </div>

      {expanded && (
        <div style={{ borderTop:'1px solid '+C.border, padding:'16px 18px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

            {/* LEFT — tasks + rating */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:C.text3, marginBottom:10 }}>📋 This week's tasks</div>
              {branch.tasks.map((t, i) => {
                const done = t.done || taskDone[i]
                return (
                  <div key={i} onClick={() => setTaskDone(p=>({...p,[i]:!p[i]}))} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:8, cursor:'pointer' }}>
                    <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, marginTop:1, background:done?C.green:'transparent', border:'2px solid '+(done?C.green:C.border), display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {done && <span style={{ color:'#000', fontSize:11, fontWeight:700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize:13, color:done?C.text3:C.text, textDecoration:done?'line-through':'none', lineHeight:1.4 }}>{t.text}</span>
                  </div>
                )
              })}

              {/* Rating target */}
              <div style={{ background:C.surface2, borderRadius:10, padding:12, marginTop:12 }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:6 }}>Rating target: {branch.target}★</div>
                <div style={{ height:8, background:C.surface, borderRadius:4, overflow:'hidden', marginBottom:6 }}>
                  <div style={{ width:(branch.rating/5*100)+'%', height:'100%', background:rc, borderRadius:4 }}/>
                </div>
                <div style={{ fontSize:11, color:C.text3 }}>
                  {branch.rating >= branch.target
                    ? '✅ Target met! Keep collecting reviews.'
                    : `Need ~${reviewsNeeded} more 5★ reviews to reach ${branch.target}★`
                  }
                </div>
                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                  <a href={branch.reviewLink} target="_blank" rel="noreferrer" style={{ flex:1, padding:'7px', borderRadius:7, border:'none', background:C.accent, color:'#fff', fontWeight:600, fontSize:12, textDecoration:'none', textAlign:'center' }}>
                    ⭐ Get a review link
                  </a>
                  <a href={branch.gbpLink} target="_blank" rel="noreferrer" style={{ flex:1, padding:'7px', borderRadius:7, border:'1px solid '+C.border, background:C.surface, color:C.text2, fontSize:12, textDecoration:'none', textAlign:'center' }}>
                    Open GBP
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT — reviews + AI replies */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:C.text3, marginBottom:10 }}>⭐ Recent reviews — copy AI reply to Google</div>
              {reviews.map((r, i) => (
                <ReviewCard key={i} review={r} branchName={branch.name} reviewLink={branch.reviewLink}/>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LocalSEOPage() {
  const [expanded, setExpanded] = useState('chapeltown')
  const [kSearch, setKSearch] = useState('')
  const [copiedKw, setCopiedKw] = useState(null)
  const [postText, setPostText] = useState('')
  const [generatingPost, setGeneratingPost] = useState(false)
  const [postBranches, setPostBranches] = useState(['chapeltown','roundhay','citycentre'])
  const [postSent, setPostSent] = useState(false)

  async function generatePost() {
    setGeneratingPost(true)
    try {
      const res = await fetch('/api/generate-gbp-post', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ branches: postBranches }),
      })
      const d = await res.json()
      if (d.post) setPostText(d.post)
    } catch(e) {}
    setGeneratingPost(false)
  }

  function copyKw(kw) {
    navigator.clipboard.writeText(kw)
    setCopiedKw(kw)
    setTimeout(() => setCopiedKw(null), 1500)
  }

  const filteredClusters = KEYWORD_CLUSTERS.map(c => ({
    ...c,
    keywords: kSearch
      ? c.keywords.filter(k => k.toLowerCase().includes(kSearch.toLowerCase()))
      : c.keywords,
  })).filter(c => c.keywords.length > 0)

  const totalKeywords = KEYWORD_CLUSTERS.reduce((s,c) => s + c.keywords.length, 0)

  return (
    <>
      <Head>
        <title>Local SEO — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button,input,textarea{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      <Nav/>

      <div style={{ maxWidth:1300, margin:'0 auto', padding:20 }}>

        {/* PAGE TITLE */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:6 }}>📍 Local SEO — Team Guide</h1>
          <p style={{ color:C.text2, fontSize:14, lineHeight:1.6 }}>
            Follow the steps below each week. GBP posts + review replies keep all 3 branches ranking locally.
            Use the keyword list to write blogs that bring customers from Google.
          </p>
        </div>

        {/* ── STEP 1 — PROCESS FLOW ── */}
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.text3, marginBottom:14 }}>
            Weekly process — do in this order
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:0, position:'relative' }}>
            {[
              { step:'1', icon:'📍', title:'Check all 3 GBP listings', desc:'Open each branch in Google Business Profile. Check for new reviews, Q&A, and that all info is correct.', color:C.teal, urgent:false },
              { step:'2', icon:'⭐', title:'Reply to all reviews', desc:'Copy the AI reply from below and paste it into Google. Every review needs a reply within 48 hours.', color:C.blue, urgent:true },
              { step:'3', icon:'📝', title:'Post weekly offer', desc:'Use the AI generator below. Post to all 3 branches every week — offers, new products, or opening hours reminders.', color:C.accent, urgent:false },
              { step:'4', icon:'❓', title:'Answer Q&A questions', desc:'Check the Q&A section on each GBP listing. Answer any new questions — this helps with local rankings.', color:C.amber, urgent:false },
              { step:'5', icon:'📸', title:'Add new photos', desc:'Upload at least 2 new product photos to each branch per month. GBP listings with photos get 42% more clicks.', color:C.green, urgent:false },
            ].map((s, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                {/* Connector line */}
                {i < 4 && (
                  <div style={{ position:'absolute', top:28, left:'50%', width:'100%', height:2, background:C.border, zIndex:0 }}/>
                )}
                <div style={{ position:'relative', zIndex:1, width:'100%', padding:'0 8px', textAlign:'center' }}>
                  {/* Circle */}
                  <div style={{ width:56, height:56, borderRadius:'50%', background:s.color+'20', border:'2px solid '+s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, margin:'0 auto 10px' }}>
                    {s.icon}
                  </div>
                  <div style={{ fontWeight:700, fontSize:13, color:s.color, marginBottom:4 }}>Step {s.step}</div>
                  <div style={{ fontWeight:600, fontSize:13, color:C.text, marginBottom:6, lineHeight:1.3 }}>{s.title}</div>
                  <div style={{ fontSize:11, color:C.text2, lineHeight:1.5 }}>{s.desc}</div>
                  {s.urgent && (
                    <span style={{ background:C.red+'20', color:C.red, padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700, display:'inline-block', marginTop:6 }}>Must do within 48h</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 2 — 3 BRANCH CARDS ── */}
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.text3, marginBottom:14 }}>
            GBP — 3 branches · click to expand tasks &amp; reviews
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {BRANCHES.map(branch => (
              <BranchCard
                key={branch.id}
                branch={branch}
                expanded={expanded === branch.id}
                onToggle={() => setExpanded(expanded === branch.id ? null : branch.id)}
              />
            ))}
          </div>
        </div>

        {/* ── STEP 3 — GBP POST SCHEDULER ── */}
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.text3, marginBottom:14 }}>
            Step 3 — weekly GBP post scheduler
          </div>
          <div style={{ background:C.surface, border:'1px solid '+C.border, borderRadius:14, padding:20 }}>
            <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4, width:'100%' }}>
                Post to branches:
              </div>
              {BRANCHES.map(b => {
                const sel = postBranches.includes(b.id)
                return (
                  <button key={b.id} onClick={() => setPostBranches(p => sel ? p.filter(x=>x!==b.id) : [...p,b.id])} style={{
                    padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:sel?700:400,
                    border: sel ? 'none' : '1px solid '+C.border,
                    background: sel ? b.color : C.surface2,
                    color: sel ? '#000' : C.text2,
                  }}>
                    {sel ? '✓ ' : ''}{b.name}
                  </button>
                )
              })}
            </div>
            <textarea
              rows={4}
              placeholder="Write your weekly GBP post here... or click Generate with AI below. Include an offer, new product, or tip."
              value={postText}
              onChange={e => setPostText(e.target.value)}
              style={{ width:'100%', background:C.surface2, border:'1px solid '+C.border, borderRadius:10, color:C.text, fontSize:13, padding:'12px 14px', resize:'vertical', marginBottom:12, lineHeight:1.6 }}
            />
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <button onClick={generatePost} disabled={generatingPost} style={{ padding:'9px 18px', borderRadius:8, border:'1px solid '+C.border, background:C.surface2, color:C.text, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                {generatingPost ? '⟳ Writing...' : '✨ Generate with AI'}
              </button>
              <button onClick={() => setPostSent(true)} disabled={!postText.trim() || postSent} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:postSent?C.green:C.accent, color:postSent?'#000':'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                {postSent ? '✓ Posted!' : `Post to ${postBranches.length} branch${postBranches.length!==1?'es':''}`}
              </button>
              <span style={{ color:C.text3, fontSize:12 }}>Post every week — use WIGDEAL15, COLOUR10, EDGE15, BRAID10 codes</span>
            </div>
          </div>
        </div>

        {/* ── STEP 4 — LOCAL KEYWORDS ── */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.text3, marginBottom:4 }}>
                Local keywords — {totalKeywords} terms · use these for blogs &amp; product pages
              </div>
              <div style={{ color:C.text2, fontSize:13 }}>
                Click any keyword to copy it. Use the <strong style={{ color:C.accent2 }}>Question searches</strong> cluster as blog post titles.
              </div>
            </div>
            <input
              value={kSearch}
              onChange={e => setKSearch(e.target.value)}
              placeholder="Search keywords..."
              style={{ background:C.surface2, border:'1px solid '+C.border, borderRadius:8, color:C.text, fontSize:13, padding:'8px 14px', outline:'none', width:220 }}
            />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:14 }}>
            {filteredClusters.map(cluster => (
              <div key={cluster.cluster} style={{ background:C.surface, border:'1px solid '+cluster.color+'30', borderRadius:12, overflow:'hidden' }}>
                {/* Cluster header */}
                <div style={{ padding:'12px 16px', background:cluster.color+'12', borderBottom:'1px solid '+cluster.color+'20' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <span style={{ fontSize:18 }}>{cluster.icon}</span>
                    <span style={{ fontWeight:700, color:cluster.color, fontSize:14 }}>{cluster.cluster}</span>
                    <span style={{ background:cluster.color+'20', color:cluster.color, padding:'1px 8px', borderRadius:99, fontSize:11, fontWeight:600, marginLeft:'auto' }}>{cluster.keywords.length}</span>
                  </div>
                  <div style={{ fontSize:12, color:C.text2, lineHeight:1.4 }}>{cluster.desc}</div>
                </div>
                {/* Keywords */}
                <div style={{ padding:12, display:'flex', flexWrap:'wrap', gap:6 }}>
                  {cluster.keywords.map(kw => (
                    <button
                      key={kw}
                      onClick={() => copyKw(kw)}
                      style={{
                        padding:'4px 10px', borderRadius:6, border:'1px solid '+cluster.color+'30',
                        background: copiedKw===kw ? cluster.color : cluster.color+'10',
                        color: copiedKw===kw ? '#000' : cluster.color,
                        fontSize:12, cursor:'pointer', fontWeight:500,
                        transition:'all .1s',
                      }}
                    >
                      {copiedKw===kw ? '✓ copied' : kw}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Blog tip banner */}
          <div style={{ background:'rgba(99,102,241,.06)', border:'1px solid rgba(99,102,241,.2)', borderRadius:12, padding:16, marginTop:16 }}>
            <div style={{ fontWeight:700, color:C.accent2, marginBottom:8, fontSize:13 }}>
              📝 How to use these keywords for blogs
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {[
                { step:'1', text:'Pick a keyword from "Question searches" — e.g. "Where to buy braiding hair in Leeds"' },
                { step:'2', text:'Use it as your blog title. Write 400 words answering the question. Mention CC Hair & Beauty Leeds.' },
                { step:'3', text:'Add the matching product keywords in the text naturally. Publish to Shopify blog monthly.' },
              ].map(t => (
                <div key={t.step} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:C.accent, color:'#fff', fontSize:12, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{t.step}</div>
                  <span style={{ fontSize:12, color:C.text2, lineHeight:1.5 }}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER — monthly routine ── */}
        <div style={{ background:C.surface, border:'1px solid '+C.border, borderRadius:12, padding:18 }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:12, fontSize:14 }}>📅 Monthly routine — do all 3 pillars</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[
              { label:'Every week', color:C.teal, items:['Post GBP offer all 3 branches','Reply to all new reviews','Check Q&A sections','Share offer on WhatsApp status'] },
              { label:'Every month', color:C.accent, items:['Publish 4 blog posts (use question keywords)','Upload new product photos to GBP','Check keyword rankings in Search Console','Review negative keywords in Google Ads'] },
              { label:'Every quarter', color:C.amber, items:['Full SEO audit of top 10 collection pages','Review discount code performance','Update opening hours on GBP if changed','Check competitor GBP listings and ratings'] },
            ].map(c => (
              <div key={c.label} style={{ background:C.surface2, borderRadius:10, padding:14 }}>
                <div style={{ fontWeight:700, color:c.color, marginBottom:8, fontSize:13 }}>{c.label}</div>
                {c.items.map((item,i) => (
                  <div key={i} style={{ display:'flex', gap:7, marginBottom:5, fontSize:12, color:C.text2 }}>
                    <span style={{ color:c.color, flexShrink:0 }}>→</span>{item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
