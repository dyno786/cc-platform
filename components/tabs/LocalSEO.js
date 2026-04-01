import { useState } from 'react'

const BRANCHES = [
  {
    id: 'chapeltown',
    name: 'Chapeltown',
    area: 'LS7',
    rating: 4.0,
    reviews: 66,
    lastPost: '2 days ago',
    photos: 12,
    qa: 3,
    status: 'warn',
    alerts: ['Post due today', '3 unanswered Q&A'],
    gbpUrl: 'https://business.google.com',
    reviewUrl: 'https://search.google.com/local/reviews',
  },
  {
    id: 'roundhay',
    name: 'Roundhay',
    area: 'LS8',
    rating: 3.8,
    reviews: 119,
    lastPost: '5 days ago',
    photos: 8,
    qa: 0,
    status: 'danger',
    alerts: ['Post overdue 5 days'],
    gbpUrl: 'https://business.google.com',
    reviewUrl: 'https://search.google.com/local/reviews',
  },
  {
    id: 'city-centre',
    name: 'City Centre',
    area: 'New York St',
    rating: 3.3,
    reviews: 35,
    lastPost: '1 day ago',
    photos: 4,
    qa: 1,
    status: 'danger',
    alerts: ['Low rating — needs reviews!', '1 unanswered Q&A'],
    gbpUrl: 'https://business.google.com',
    reviewUrl: 'https://search.google.com/local/reviews',
  },
]

const REVIEWS = [
  {
    branch: 'Chapeltown', branchColor: 'var(--local)',
    author: 'Sarah M.', rating: 5, time: '2h ago',
    text: 'Absolutely love this shop! Always have exactly what I need for my natural hair. Staff are so helpful and knowledgeable.',
    aiReply: "Thank you so much Sarah! We're thrilled you found everything you needed. Our team works hard to stock the best natural hair products in Leeds. We'd love to see you again soon at our Chapeltown branch!",
  },
  {
    branch: 'Roundhay', branchColor: 'var(--paid)',
    author: 'Anonymous', rating: 2, time: '4h ago',
    text: 'Prices are higher than expected and staff seemed busy.',
    aiReply: "Thank you for your feedback. We're sorry your visit didn't fully meet your expectations. We stock specialist professional brands not available in supermarkets, which is reflected in our pricing. Please do visit us again — our team will ensure you receive the best service.",
  },
  {
    branch: 'City Centre', branchColor: '#ef4444',
    author: 'James T.', rating: 3, time: '1d ago',
    text: 'Decent selection but the shop felt a bit disorganised. Would visit again though.',
    aiReply: "Thank you James! We appreciate you taking the time to leave a review. We're always working to improve the in-store experience at our City Centre branch. Please do pop back in — you'll notice the improvements!",
  },
]

const KEYWORDS = [
  { kw: 'hair shop leeds', pos: 3, change: '+2', vol: 880 },
  { kw: 'braiding hair leeds', pos: 1, change: '0', vol: 320 },
  { kw: 'wigs leeds', pos: 5, change: '-1', vol: 210 },
  { kw: 'natural hair products leeds', pos: 2, change: '+1', vol: 170 },
  { kw: 'hair extensions leeds', pos: 7, change: '+3', vol: 140 },
  { kw: 'afro hair shop leeds', pos: 4, change: '0', vol: 90 },
]

function StarRating({ n }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? '#f59e0b' : 'var(--border)', fontSize: 14 }}>★</span>
      ))}
    </span>
  )
}

function ReviewCard({ r }) {
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [reply, setReply] = useState(r.aiReply)

  async function regenerate() {
    setRegenerating(true)
    try {
      const res = await fetch('/api/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: r.text, branch: r.branch, rating: r.rating }),
      })
      const data = await res.json()
      if (data.reply) setReply(data.reply)
    } catch (e) { console.error(e) }
    setRegenerating(false)
  }

  function copy() {
    navigator.clipboard.writeText(reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const branchColorMap = { Chapeltown: '#22c55e', Roundhay: '#f59e0b', 'City Centre': '#ef4444' }
  const bc = branchColorMap[r.branch] || 'var(--accent)'

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarRating n={r.rating} />
          <span style={{ fontWeight: 600 }}>{r.author}</span>
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>· {r.time}</span>
        </div>
        <span className="pill" style={{ background: bc + '20', color: bc }}>{r.branch}</span>
      </div>
      <p style={{ color: 'var(--text2)', fontSize: 13, fontStyle: 'italic', lineHeight: 1.5 }}>"{r.text}"</p>
      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent2)', marginBottom: 6, letterSpacing: '.05em', textTransform: 'uppercase' }}>AI Reply</div>
        <p style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.6 }}>{reply}</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓ Copied!' : 'Copy reply'}</button>
        <a href={r.reviewUrl || 'https://business.google.com'} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--accent2)', textDecoration: 'none', marginLeft: 4 }}>
          Open in Google →
        </a>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={regenerate} disabled={regenerating}>
          {regenerating ? '...' : '↺ Regenerate'}
        </button>
      </div>
    </div>
  )
}

export default function LocalSEOTab() {
  const [activeSection, setActiveSection] = useState('monitor')
  const [postText, setPostText] = useState('')
  const [selectedBranches, setSelectedBranches] = useState(['chapeltown', 'roundhay', 'city-centre'])
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)

  const sections = [
    { id: 'monitor', label: 'GBP Monitor' },
    { id: 'reviews', label: 'New Reviews' },
    { id: 'posts', label: 'Post Scheduler' },
    { id: 'keywords', label: 'Local Keywords' },
  ]

  async function schedulePost() {
    if (!postText.trim()) return
    setPosting(true)
    // In prod this would POST to /api/gbp-post
    await new Promise(r => setTimeout(r, 1200))
    setPosting(false)
    setPosted(true)
    setTimeout(() => setPosted(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Section nav */}
      <div style={{ display: 'flex', gap: 4 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`btn ${activeSection === s.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* GBP Monitor */}
      {activeSection === 'monitor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-label">Google Business Profile — 3 branches live monitoring</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {BRANCHES.map(b => {
              const rColor = b.rating >= 4 ? '#22c55e' : b.rating >= 3.7 ? '#f59e0b' : '#ef4444'
              const alertColor = b.status === 'danger' ? '#ef4444' : '#f59e0b'
              return (
                <div key={b.id} className="card" style={{ borderColor: alertColor + '40' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{b.name} — {b.area}</div>
                    </div>
                    <div style={{ color: rColor, fontWeight: 800, fontSize: 18 }}>{b.rating}★</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
                    {[
                      ['Reviews', b.reviews],
                      ['Last post', b.lastPost],
                      ['Photos', b.photos],
                      ['Q&A unanswered', b.qa],
                    ].map(([k, v]) => (
                      <div key={k} style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--text3)' }}>{k}: </span>
                        <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {b.alerts.map(a => (
                      <span key={a} className="pill" style={{ background: alertColor + '20', color: alertColor }}>{a}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={b.gbpUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      Open GBP
                    </a>
                    <a href={b.reviewUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      Reviews
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reviews */}
      {activeSection === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-label">New reviews — AI reply drafted, copy &amp; paste to Google</div>
          {REVIEWS.map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
      )}

      {/* Post Scheduler */}
      {activeSection === 'posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="section-label">GBP post scheduler</div>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Post to branches</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {BRANCHES.map(b => {
                const sel = selectedBranches.includes(b.id)
                return (
                  <button key={b.id} onClick={() => setSelectedBranches(p =>
                    sel ? p.filter(x => x !== b.id) : [...p, b.id]
                  )} className={`btn btn-sm ${sel ? 'btn-primary' : 'btn-ghost'}`}>
                    {b.name}
                  </button>
                )
              })}
            </div>
            <textarea
              rows={4}
              placeholder="Write your GBP post here... (or ask AI to generate one)"
              value={postText}
              onChange={e => setPostText(e.target.value)}
              style={{ width: '100%', resize: 'vertical', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={async () => {
                const res = await fetch('/api/generate-gbp-post', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ branches: selectedBranches }),
                })
                const d = await res.json()
                if (d.post) setPostText(d.post)
              }}>✨ Generate with AI</button>
              <button className="btn btn-green" onClick={schedulePost} disabled={posting || !postText.trim()}>
                {posted ? '✓ Posted!' : posting ? 'Posting...' : `Post to ${selectedBranches.length} branch${selectedBranches.length !== 1 ? 'es' : ''}`}
              </button>
            </div>
          </div>

          {/* Post history */}
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Recent posts</div>
            {[
              { branch: 'All branches', text: '🌟 NEW IN: Mielle Organics Rosemary Oil is back in stock! Perfect for natural hair growth. Visit us in-store or order online.', date: '30 Mar 2026' },
              { branch: 'Chapeltown', text: '💇‍♀️ Weekly offer: 15% off all box braiding hair this week only at our Chapeltown store. Use code BRAID15 online.', date: '24 Mar 2026' },
            ].map((p, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="pill pill-green">{p.branch}</span>
                  <span style={{ color: 'var(--text3)', fontSize: 12 }}>{p.date}</span>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: 13 }}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local Keywords */}
      {activeSection === 'keywords' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-label">Local keyword tracker — 309 search terms</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <input placeholder="Filter keywords..." style={{ flex: 1 }} />
              <span style={{ color: 'var(--text3)', fontSize: 13 }}>Showing 6 of 309</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Keyword', 'Position', 'Change', 'Monthly searches'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KEYWORDS.map((k, i) => {
                  const chNum = parseInt(k.change)
                  const chColor = chNum > 0 ? '#22c55e' : chNum < 0 ? '#ef4444' : 'var(--text3)'
                  return (
                    <tr key={k.kw} style={{ borderBottom: i < KEYWORDS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '10px 16px', fontSize: 13 }}>{k.kw}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          background: k.pos <= 3 ? 'var(--green-dim)' : k.pos <= 10 ? 'rgba(59,130,246,.15)' : 'var(--surface2)',
                          color: k.pos <= 3 ? 'var(--green)' : k.pos <= 10 ? 'var(--blue)' : 'var(--text2)',
                          padding: '2px 8px', borderRadius: 6, fontWeight: 600, fontSize: 13,
                        }}>#{k.pos}</span>
                      </td>
                      <td style={{ padding: '10px 16px', color: chColor, fontWeight: 600, fontSize: 13 }}>
                        {chNum > 0 ? `↑ ${k.change}` : chNum < 0 ? `↓ ${k.change}` : '—'}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text2)', fontSize: 13 }}>{k.vol.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
