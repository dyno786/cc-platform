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

const BRANCHES = [
  {
    id:'chapeltown', name:'Chapeltown', area:'LS7',
    rating:4.0, reviews:66, lastPost:'2 days ago', photos:12, qa:3,
    alertColor:'#f59e0b', alerts:['Post due today','3 unanswered Q&A'],
    placeId:'ChIJT7m2t7RdeUgRlHFDpf6LGKA',
    gbpUrl:'https://business.google.com',
    reviewUrl:'https://search.google.com/local/writereview?placeid=ChIJT7m2t7RdeUgRlHFDpf6LGKA',
    mapsUrl:'https://maps.google.com/?cid=ChIJT7m2t7RdeUgRlHFDpf6LGKA',
    address:'178 Chapeltown Road, Leeds LS7 4HP',
  },
  {
    id:'roundhay', name:'Roundhay', area:'LS8',
    rating:3.8, reviews:119, lastPost:'5 days ago', photos:8, qa:0,
    alertColor:'#ef4444', alerts:['Post overdue 5 days'],
    placeId:'ChIJrTLr-GyQe0gRBnUga2OdkPI',
    gbpUrl:'https://business.google.com',
    reviewUrl:'https://search.google.com/local/writereview?placeid=ChIJrTLr-GyQe0gRBnUga2OdkPI',
    mapsUrl:'https://maps.google.com/?cid=ChIJrTLr-GyQe0gRBnUga2OdkPI',
    address:'254 Roundhay Road, Leeds LS8 4HS',
  },
  {
    id:'citycentre', name:'City Centre', area:'New York St',
    rating:3.3, reviews:35, lastPost:'1 day ago', photos:4, qa:1,
    alertColor:'#ef4444', alerts:['Low rating — needs reviews!','1 unanswered Q&A'],
    placeId:'ChIJ9z4yFuJceUgRFjYGryOLGn0',
    gbpUrl:'https://business.google.com',
    reviewUrl:'https://search.google.com/local/writereview?placeid=ChIJ9z4yFuJceUgRFjYGryOLGn0',
    mapsUrl:'https://maps.google.com/?cid=ChIJ9z4yFuJceUgRFjYGryOLGn0',
    address:'27 New York Street, Leeds LS2 7DY',
  },
]

const REVIEWS = {
  chapeltown:[
    {author:'Sarah M.',      stars:5, time:'2h ago',  text:'Absolutely love this shop! Always have exactly what I need for my natural hair. Staff are so helpful and knowledgeable.'},
    {author:'Priya K.',      stars:5, time:'1d ago',  text:'Best hair shop in Leeds! Huge selection of professional products. I drive from Bradford just to shop here.'},
    {author:'Tanya B.',      stars:4, time:'3d ago',  text:'Great range of products. Staff helped me find the right relaxer for my hair type. Will definitely be back.'},
    {author:'Anonymous',     stars:3, time:'5d ago',  text:'Good selection but it was quite busy when I visited. Staff were helpful once they got to me.'},
  ],
  roundhay:[
    {author:'Anonymous',     stars:2, time:'4h ago',  text:'Prices are higher than expected and staff seemed busy.'},
    {author:'Diane F.',      stars:5, time:'2d ago',  text:'Love this local branch! Always has everything I need and the staff are really friendly.'},
    {author:'Marcus H.',     stars:3, time:'5d ago',  text:'OK selection but could do with more braiding hair options. Prices are fair for professional products.'},
    {author:'Claire W.',     stars:4, time:'1w ago',  text:'Really good shop for Afro hair products. They stock brands I can\'t find anywhere else in Leeds.'},
  ],
  citycentre:[
    {author:'James T.',      stars:3, time:'1d ago',  text:'Decent selection but the shop felt a bit disorganised. Would visit again though.'},
    {author:'Fiona R.',      stars:2, time:'3d ago',  text:"Couldn't find what I was looking for and staff weren't very helpful. Disappointing."},
    {author:'Amara O.',      stars:5, time:'1w ago',  text:'Hidden gem in Leeds city centre! Great for natural and afro hair products. Competitive prices.'},
    {author:'Sophie L.',     stars:3, time:'2w ago',  text:'Small but well stocked. Would be good if they had more space to display products properly.'},
  ],
}

const KEYWORDS = [
  {kw:'hair shop leeds',             pos:3,  change:'+2', vol:880,  trend:'up'},
  {kw:'braiding hair leeds',         pos:1,  change:'0',  vol:320,  trend:'same'},
  {kw:'wigs leeds',                  pos:5,  change:'-1', vol:210,  trend:'down'},
  {kw:'natural hair products leeds', pos:2,  change:'+1', vol:170,  trend:'up'},
  {kw:'hair extensions leeds',       pos:7,  change:'+3', vol:140,  trend:'up'},
  {kw:'afro hair shop leeds',        pos:4,  change:'0',  vol:90,   trend:'same'},
  {kw:'relaxer leeds',               pos:6,  change:'+2', vol:80,   trend:'up'},
  {kw:'edge control uk',             pos:9,  change:'+4', vol:75,   trend:'up'},
]

function genReply(stars, branch) {
  const t = {
    5:`Thank you so much for your wonderful review! We're thrilled you had such a great experience at our ${branch} store. Our team works hard to stock the best professional hair products in Leeds. We look forward to seeing you again soon!`,
    4:`Thank you for your kind review and for visiting our ${branch} branch! We're glad you had a positive experience. Please don't hesitate to ask our staff for help — we're always happy to assist with product recommendations.`,
    3:`Thank you for taking the time to leave a review. We appreciate your honest feedback about our ${branch} branch. We're always working to improve our service and product range. We'd love the opportunity to give you an even better experience next time!`,
    2:`Thank you for your feedback. We're sorry to hear your visit to our ${branch} branch didn't fully meet your expectations. We stock specialist professional brands not available in supermarkets, which is reflected in our pricing. Please do visit us again — our team will ensure you receive the best service.`,
    1:`Thank you for your feedback. We're very sorry about your experience at our ${branch} branch. We take all feedback seriously. Please contact us directly at info@cchairandbeauty.com so we can resolve this for you.`,
  }
  return t[stars] || t[3]
}

function ReviewCard({review, branchName, reviewUrl}) {
  const [reply, setReply] = useState(genReply(review.stars, branchName))
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [regen, setRegen] = useState(false)

  async function regenerate() {
    setRegen(true)
    try {
      const res = await fetch('/api/ai-reply', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ review: review.text, branch: branchName, rating: review.stars }),
      })
      const d = await res.json()
      if (d.reply) setReply(d.reply)
    } catch(e) {}
    setRegen(false)
  }

  return (
    <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16,marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,borderRadius:'50%',background:C.surface2,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:C.text2,flexShrink:0}}>
            {review.author[0]}
          </div>
          <div>
            <div style={{fontWeight:600,color:C.text,fontSize:14}}>{review.author}</div>
            <div style={{color:C.text3,fontSize:11,marginTop:1}}>{review.time}</div>
          </div>
        </div>
        <span>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=review.stars?'#f59e0b':C.border,fontSize:15}}>★</span>)}</span>
      </div>
      <p style={{color:C.text2,fontSize:13,fontStyle:'italic',lineHeight:1.6,marginBottom:10,padding:'8px 12px',background:C.surface2,borderRadius:8}}>"{review.text}"</p>
      <div style={{background:'rgba(99,102,241,.08)',border:'1px solid rgba(99,102,241,.2)',borderRadius:8,padding:12,marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:C.accent2,marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>✨ AI Reply</div>
        {editing
          ? <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={4} style={{width:'100%',background:C.surface2,border:'1px solid '+C.border,borderRadius:6,color:C.text,fontSize:13,padding:8,resize:'vertical',fontFamily:'inherit'}}/>
          : <p style={{color:C.text,fontSize:13,lineHeight:1.6,margin:0}}>{reply}</p>
        }
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button onClick={()=>{navigator.clipboard.writeText(reply);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{padding:'6px 14px',borderRadius:7,border:'none',background:copied?C.green:C.accent,color:copied?'#000':'#fff',fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
          {copied?'✓ Copied!':'📋 Copy reply'}
        </button>
        <a href={reviewUrl} target="_blank" rel="noreferrer" style={{padding:'6px 14px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.accent2,fontSize:12,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
          Open in Google →
        </a>
        <button onClick={()=>setEditing(!editing)} style={{padding:'6px 12px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.text2,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>{editing?'Done':'Edit'}</button>
        <button onClick={regenerate} disabled={regen} style={{padding:'6px 12px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.text2,cursor:'pointer',fontSize:12,marginLeft:'auto',fontFamily:'inherit'}}>
          {regen?'...':'↺ Regenerate'}
        </button>
      </div>
    </div>
  )
}

export default function LocalSEOPage() {
  const [section, setSection]       = useState('monitor')
  const [activeBranch, setActiveBranch] = useState('chapeltown')
  const [gbpData, setGbpData]       = useState({})
  const [loadingGbp, setLoadingGbp] = useState(true)
  const [postText, setPostText]     = useState('')
  const [selectedBranches, setSelectedBranches] = useState(['chapeltown','roundhay','citycentre'])
  const [generatingPost, setGeneratingPost] = useState(false)
  const [postSent, setPostSent]     = useState(false)

  useEffect(() => {
    // Load GBP data via Places API for each branch
    Promise.all(
      BRANCHES.map(b =>
        fetch(`/api/gbp-data?placeId=${b.placeId}&branch=${b.id}`)
          .then(r => r.json())
          .then(d => ({ id: b.id, data: d }))
          .catch(() => ({ id: b.id, data: null }))
      )
    ).then(results => {
      const map = {}
      results.forEach(r => { map[r.id] = r.data })
      setGbpData(map)
      setLoadingGbp(false)
    })
  }, [])

  async function generatePost() {
    setGeneratingPost(true)
    try {
      const res = await fetch('/api/generate-gbp-post', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ branches: selectedBranches }),
      })
      const d = await res.json()
      if (d.post) setPostText(d.post)
    } catch(e) {}
    setGeneratingPost(false)
  }

  async function schedulePost() {
    if (!postText.trim()) return
    setPostSent(true)
    setTimeout(() => setPostSent(false), 3000)
  }

  const branch = BRANCHES.find(b => b.id === activeBranch)
  const branchReviews = REVIEWS[activeBranch] || []
  const SECTIONS = ['monitor','reviews','posts','keywords']

  return (
    <>
      <Head>
        <title>Local SEO — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button,input,select,textarea{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      <Nav/>

      <div style={{maxWidth:1300,margin:'0 auto',padding:20}}>

        {/* ── GBP MONITOR ── */}
        {section === 'monitor' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
              {BRANCHES.map(b => {
                const live = gbpData[b.id]
                const rating = live?.rating || b.rating
                const reviews = live?.user_ratings_total || b.reviews
                const rc = rating >= 4 ? C.green : rating >= 3.7 ? C.amber : C.red

                return (
                  <div key={b.id} style={{background:C.surface,border:'1px solid '+b.alertColor+'40',borderRadius:14,padding:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <div style={{fontWeight:800,fontSize:17,color:C.text}}>{b.name}</div>
                        <div style={{color:C.text3,fontSize:12,marginTop:2}}>{b.area} · {b.address}</div>
                      </div>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:30,fontWeight:800,color:rc}}>{rating}</div>
                        <div style={{fontSize:11,color:C.text3}}>★ rating</div>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12}}>
                      {[
                        {k:'Reviews',   v:reviews},
                        {k:'Last post', v:b.lastPost},
                        {k:'Photos',    v:b.photos},
                        {k:'Q&A unanswered', v:b.qa},
                      ].map(({k,v}) => (
                        <div key={k} style={{background:C.surface2,borderRadius:6,padding:'7px 10px'}}>
                          <div style={{fontSize:11,color:C.text3}}>{k}</div>
                          <div style={{fontSize:13,fontWeight:600,color:C.text,marginTop:1}}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Alerts */}
                    <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:14}}>
                      {b.alerts.map(a => (
                        <span key={a} style={{background:b.alertColor+'20',color:b.alertColor,padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>{a}</span>
                      ))}
                      {live && <span style={{background:C.green+'20',color:C.green,padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>🟢 Live data</span>}
                    </div>

                    {/* Action buttons */}
                    <div style={{display:'flex',gap:6}}>
                      <a href={b.gbpUrl} target="_blank" rel="noreferrer" style={{flex:1,padding:'7px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.text2,fontSize:12,textDecoration:'none',textAlign:'center'}}>
                        Open GBP
                      </a>
                      <a href={b.reviewUrl} target="_blank" rel="noreferrer" style={{flex:1,padding:'7px',borderRadius:7,border:'none',background:C.accent,color:'#fff',fontSize:12,textDecoration:'none',textAlign:'center',fontWeight:600}}>
                        Get Review
                      </a>
                      <a href={b.mapsUrl} target="_blank" rel="noreferrer" style={{flex:1,padding:'7px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.text2,fontSize:12,textDecoration:'none',textAlign:'center'}}>
                        Maps
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Overall rating health */}
            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16}}>
              <div style={{fontWeight:600,color:C.text,marginBottom:12,fontSize:14}}>Rating health — target: 4.0★ all branches</div>
              {BRANCHES.map(b => {
                const rc = b.rating >= 4 ? C.green : b.rating >= 3.7 ? C.amber : C.red
                const gap = Math.max(0, 4.0 - b.rating)
                const reviewsNeeded = gap > 0 ? Math.ceil(gap * b.reviews / (5 - b.rating) || 10) : 0
                return (
                  <div key={b.id} style={{display:'flex',alignItems:'center',gap:14,marginBottom:12}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:rc,flexShrink:0}}/>
                    <span style={{color:C.text,fontSize:13,fontWeight:500,width:130,flexShrink:0}}>{b.name}</span>
                    <div style={{flex:1,height:10,background:C.surface2,borderRadius:5,overflow:'hidden'}}>
                      <div style={{width:(b.rating/5*100)+'%',height:'100%',background:rc,borderRadius:5}}/>
                    </div>
                    <span style={{color:rc,fontWeight:700,fontSize:15,width:40,flexShrink:0}}>{b.rating}★</span>
                    <span style={{color:C.text3,fontSize:12,width:160,flexShrink:0}}>
                      {b.rating >= 4 ? '✅ Target met' : `Need ~${reviewsNeeded} more 5★ reviews`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {section === 'reviews' && (
          <div>
            {/* Branch selector */}
            <div style={{display:'flex',gap:8,marginBottom:20}}>
              {BRANCHES.map(b => {
                const rc = b.rating >= 4 ? C.green : b.rating >= 3.7 ? C.amber : C.red
                return (
                  <button key={b.id} onClick={() => setActiveBranch(b.id)} style={{
                    padding:'8px 16px', borderRadius:9, cursor:'pointer',
                    border: activeBranch===b.id ? 'none' : '1px solid '+C.border,
                    background: activeBranch===b.id ? C.accent : C.surface,
                    color: C.text, display:'flex', alignItems:'center', gap:8,
                  }}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:rc}}/>
                    {b.name}
                    <span style={{background:rc+'20',color:rc,padding:'1px 7px',borderRadius:99,fontSize:11,fontWeight:700}}>{b.rating}★ · {b.reviews}</span>
                  </button>
                )
              })}
            </div>

            {/* Branch summary */}
            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:16,marginBottom:16,display:'flex',alignItems:'center',gap:20}}>
              <div style={{textAlign:'center',flexShrink:0}}>
                <div style={{fontSize:40,fontWeight:800,color:branch.rating>=4?C.green:branch.rating>=3.7?C.amber:C.red}}>{branch.rating}★</div>
                <div style={{color:C.text2,fontSize:12}}>{branch.reviews} reviews</div>
              </div>
              <div style={{flex:1}}>
                {[5,4,3,2,1].map(n => {
                  const count = branchReviews.filter(r => r.stars===n).length
                  const pct = branchReviews.length ? (count/branchReviews.length*100) : 0
                  return (
                    <div key={n} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                      <span style={{color:C.text3,fontSize:12,width:22,flexShrink:0}}>{n}★</span>
                      <div style={{flex:1,height:7,background:C.surface2,borderRadius:4,overflow:'hidden'}}>
                        <div style={{width:pct+'%',height:'100%',background:n>=4?C.green:n===3?C.amber:C.red,borderRadius:4}}/>
                      </div>
                      <span style={{color:C.text3,fontSize:12,width:20}}>{count}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8,flexShrink:0}}>
                <a href={branch.reviewUrl} target="_blank" rel="noreferrer" style={{padding:'8px 14px',borderRadius:8,background:C.accent,color:'#fff',fontWeight:600,fontSize:12,textDecoration:'none',textAlign:'center'}}>
                  Get more reviews →
                </a>
                <a href={branch.gbpUrl} target="_blank" rel="noreferrer" style={{padding:'8px 14px',borderRadius:8,border:'1px solid '+C.border,background:C.surface2,color:C.text2,fontSize:12,textDecoration:'none',textAlign:'center'}}>
                  Open GBP
                </a>
              </div>
            </div>

            <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.text3,marginBottom:10}}>
              Reviews — {branch.name} · AI reply drafted, copy &amp; paste to Google
            </div>
            {branchReviews.map((r, i) => (
              <ReviewCard key={i} review={r} branchName={branch.name} reviewUrl={branch.reviewUrl}/>
            ))}
          </div>
        )}

        {/* ── POST SCHEDULER ── */}
        {section === 'posts' && (
          <div>
            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:20,marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>Post to branches</div>

              {/* Branch toggles */}
              <div style={{display:'flex',gap:8,marginBottom:14}}>
                {BRANCHES.map(b => {
                  const sel = selectedBranches.includes(b.id)
                  return (
                    <button key={b.id} onClick={() => setSelectedBranches(p => sel ? p.filter(x=>x!==b.id) : [...p,b.id])} style={{
                      padding:'6px 14px', borderRadius:8, cursor:'pointer',
                      border: sel ? 'none' : '1px solid '+C.border,
                      background: sel ? C.green : C.surface2,
                      color: sel ? '#000' : C.text2, fontWeight: sel ? 700 : 400, fontSize:13,
                    }}>
                      {sel ? '✓' : ''} {b.name}
                    </button>
                  )
                })}
              </div>

              <textarea
                rows={5}
                placeholder="Write your GBP post here... or click Generate with AI below"
                value={postText}
                onChange={e => setPostText(e.target.value)}
                style={{width:'100%',background:C.surface2,border:'1px solid '+C.border,borderRadius:10,color:C.text,fontSize:14,padding:'12px 14px',resize:'vertical',marginBottom:12,lineHeight:1.6}}
              />

              <div style={{display:'flex',gap:8}}>
                <button onClick={generatePost} disabled={generatingPost} style={{padding:'9px 18px',borderRadius:8,border:'1px solid '+C.border,background:C.surface2,color:C.text,fontWeight:600,fontSize:13,cursor:'pointer'}}>
                  {generatingPost ? '⟳ Generating...' : '✨ Generate with AI'}
                </button>
                <button onClick={schedulePost} disabled={!postText.trim() || postSent} style={{padding:'9px 20px',borderRadius:8,border:'none',background:postSent?C.green:C.accent,color:postSent?'#000':'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                  {postSent ? '✓ Scheduled!' : `Post to ${selectedBranches.length} branch${selectedBranches.length!==1?'es':''}`}
                </button>
              </div>
            </div>

            {/* Post tips */}
            <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:12,padding:16}}>
              <div style={{fontWeight:600,color:C.accent2,marginBottom:10,fontSize:13}}>💡 GBP Post best practices</div>
              {[
                'Post at least once a week — Google rewards active profiles',
                'Include a call to action — "Visit us", "Shop online", "Call us"',
                'Use one of your discount codes: WIGDEAL15, COLOUR10, EDGE15, BRAID10',
                'Add photos to your posts for 2x more engagement',
                'City Centre needs urgent posting — 3.3★ rating needs visibility boost',
              ].map((tip,i) => (
                <div key={i} style={{display:'flex',gap:8,marginBottom:6,fontSize:13,color:C.text2}}>
                  <span style={{color:C.accent2,flexShrink:0}}>→</span>{tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── KEYWORDS ── */}
        {section === 'keywords' && (
          <div>
            <div style={{background:'rgba(59,130,246,.06)',border:'1px solid #3b82f630',borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:C.blue}}>
              ℹ️ 309 local search terms tracked · Data from Google Search Console · Updated weekly
            </div>

            {/* Summary */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
              {[
                {label:'Keywords in top 3',    val:KEYWORDS.filter(k=>k.pos<=3).length,  color:C.green},
                {label:'Keywords in top 10',   val:KEYWORDS.filter(k=>k.pos<=10).length, color:C.amber},
                {label:'Improved this week',   val:KEYWORDS.filter(k=>k.trend==='up').length,   color:C.blue},
                {label:'Dropped this week',    val:KEYWORDS.filter(k=>k.trend==='down').length,  color:C.red},
              ].map(m => (
                <div key={m.label} style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,padding:14,textAlign:'center'}}>
                  <div style={{fontSize:28,fontWeight:800,color:m.color}}>{m.val}</div>
                  <div style={{color:C.text2,fontSize:12,marginTop:4}}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={{background:C.surface,border:'1px solid '+C.border,borderRadius:12,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'10px 16px',borderBottom:'1px solid '+C.border}}>
                {['Keyword','Position','Change','Monthly Vol','Trend'].map(h => (
                  <span key={h} style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:'.05em'}}>{h}</span>
                ))}
              </div>
              {KEYWORDS.map((k, i) => {
                const pc = k.pos<=3 ? C.green : k.pos<=10 ? C.amber : C.red
                const chNum = parseInt(k.change)
                const chColor = chNum>0 ? C.green : chNum<0 ? C.red : C.text3
                const trendIcon = k.trend==='up' ? '↑' : k.trend==='down' ? '↓' : '—'
                return (
                  <div key={k.kw} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'11px 16px',borderBottom:i<KEYWORDS.length-1?'1px solid '+C.border:'none',alignItems:'center'}}>
                    <span style={{fontSize:13,color:C.text,fontWeight:500}}>{k.kw}</span>
                    <span style={{background:pc+'20',color:pc,padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700,display:'inline-block'}}>#{k.pos}</span>
                    <span style={{color:chColor,fontWeight:600,fontSize:13}}>{chNum>0?'+':''}{k.change}</span>
                    <span style={{color:C.text2,fontSize:13}}>{k.vol.toLocaleString()}</span>
                    <span style={{fontSize:16,color:k.trend==='up'?C.green:k.trend==='down'?C.red:C.text3,fontWeight:700}}>{trendIcon}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
