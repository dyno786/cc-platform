import { useState } from 'react'

const BRANCH_REVIEWS = {
  chapeltown: {
    name: 'Chapeltown — LS7',
    rating: 4.0,
    total: 66,
    color: '#22c55e',
    gbpUrl: 'https://business.google.com',
    reviews: [
      { author: 'Sarah M.', rating: 5, time: '2h ago', text: 'Absolutely love this shop! Always have exactly what I need for my natural hair. Staff are so helpful and knowledgeable.' },
      { author: 'Priya K.', rating: 5, time: '1d ago', text: 'Best hair shop in Leeds! Huge selection of professional products. I drive from Bradford just to shop here.' },
      { author: 'Tanya B.', rating: 4, time: '3d ago', text: 'Great range of products. Staff helped me find the right relaxer for my hair type. Will definitely be back.' },
    ]
  },
  roundhay: {
    name: 'Roundhay — LS8',
    rating: 3.8,
    total: 119,
    color: '#f59e0b',
    gbpUrl: 'https://business.google.com',
    reviews: [
      { author: 'Anonymous', rating: 2, time: '4h ago', text: 'Prices are higher than expected and staff seemed busy.' },
      { author: 'Diane F.', rating: 5, time: '2d ago', text: 'Love this local branch! Always has everything I need and the staff are really friendly.' },
      { author: 'Marcus H.', rating: 3, time: '5d ago', text: 'OK selection but could do with more braiding hair options. Prices are fair for professional products.' },
    ]
  },
  citycentre: {
    name: 'City Centre — New York St',
    rating: 3.3,
    total: 35,
    color: '#ef4444',
    gbpUrl: 'https://business.google.com',
    reviews: [
      { author: 'James T.', rating: 3, time: '1d ago', text: 'Decent selection but the shop felt a bit disorganised. Would visit again though.' },
      { author: 'Fiona R.', rating: 2, time: '3d ago', text: 'Couldn\'t find what I was looking for and staff weren\'t very helpful. Disappointing.' },
      { author: 'Amara O.', rating: 5, time: '1w ago', text: 'Hidden gem in Leeds city centre! Great for natural and afro hair products. Competitive prices.' },
    ]
  },
}

const AI_REPLY_TEMPLATES = {
  5: (branch) => `Thank you so much for your wonderful review! We're thrilled you had such a great experience at our ${branch} store. Our team works hard to stock the best professional hair products in Leeds. We look forward to seeing you again soon!`,
  4: (branch) => `Thank you for your kind review and for visiting our ${branch} branch! We're glad you had a positive experience. Please don't hesitate to ask our staff for help — we're always happy to assist with product recommendations.`,
  3: (branch) => `Thank you for taking the time to leave a review. We appreciate your honest feedback about our ${branch} branch. We're always working to improve our service and product range. We'd love the opportunity to give you an even better experience next time!`,
  2: (branch) => `Thank you for your feedback. We're sorry to hear your visit to our ${branch} branch didn't fully meet your expectations. We stock specialist professional brands and our staff are trained to assist — please do come back and give us another chance!`,
  1: (branch) => `Thank you for your feedback. We're very sorry about your experience at our ${branch} branch. We take all feedback seriously and would love to make this right. Please contact us directly so we can resolve this for you.`,
}

function ReviewCard({ review, branchName, branchColor, gbpUrl }) {
  const [reply, setReply] = useState(AI_REPLY_TEMPLATES[review.rating]?.(branchName) || '')
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  async function regenerate() {
    setRegenerating(true)
    try {
      const res = await fetch('/api/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: review.text, branch: branchName, rating: review.rating }),
      })
      const data = await res.json()
      if (data.reply) setReply(data.reply)
    } catch (e) {
      console.error(e)
    }
    setRegenerating(false)
  }

  function copy() {
    navigator.clipboard.writeText(reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const rColors = { 5: '#22c55e', 4: '#84cc16', 3: '#f59e0b', 2: '#f97316', 1: '#ef4444' }
  const rc = rColors[review.rating] || '#f59e0b'

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: rc + '30',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: rc, fontWeight: 700, fontSize: 15,
          }}>{review.author[0]}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{review.author}</div>
            <div style={{ color: 'var(--text3)', fontSize: 12 }}>{review.time}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ color: i <= review.rating ? '#f59e0b' : 'var(--border)', fontSize: 16 }}>★</span>
          ))}
        </div>
      </div>

      <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
        "{review.text}"
      </p>

      {/* AI Reply */}
      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent2)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            ✨ AI Reply drafted
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Done editing' : 'Edit'}
          </button>
        </div>
        {editing ? (
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={4}
            style={{ width: '100%', resize: 'vertical', fontSize: 13, lineHeight: 1.6 }}
          />
        ) : (
          <p style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.6 }}>{reply}</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={copy}>
          {copied ? '✓ Copied!' : '📋 Copy reply'}
        </button>
        <a href={gbpUrl} target="_blank" rel="noreferrer"
          className="btn btn-ghost btn-sm">
          Open in Google →
        </a>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={regenerate} disabled={regenerating}>
          {regenerating ? '...' : '↺ Regenerate'}
        </button>
      </div>
    </div>
  )
}

export default function ReviewsTab() {
  const [activeBranch, setActiveBranch] = useState('chapeltown')
  const branch = BRANCH_REVIEWS[activeBranch]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Branch selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {Object.entries(BRANCH_REVIEWS).map(([id, b]) => {
          const active = activeBranch === id
          return (
            <button key={id} onClick={() => setActiveBranch(id)}
              className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />
              {b.name}
              <span style={{
                background: b.color + '20', color: b.color,
                borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700,
              }}>{b.rating}★</span>
            </button>
          )
        })}
      </div>

      {/* Branch overview */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div>
          <div style={{ fontSize: 36, fontWeight: 800, color: branch.color }}>{branch.rating}★</div>
          <div style={{ color: 'var(--text2)', fontSize: 13 }}>{branch.total} total reviews</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[5,4,3,2,1].map(n => {
            const count = branch.reviews.filter(r => r.rating === n).length
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--text3)', fontSize: 12, width: 20 }}>{n}★</span>
                <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(count / branch.reviews.length) * 100}%`, height: '100%', background: branch.color, borderRadius: 3 }} />
                </div>
                <span style={{ color: 'var(--text3)', fontSize: 12, width: 20 }}>{count}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href={branch.gbpUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            Open GBP →
          </a>
          <a href={branch.gbpUrl} target="_blank" rel="noreferrer" className="btn btn-green btn-sm">
            View all reviews
          </a>
        </div>
      </div>

      {/* Reviews list */}
      <div>
        <div className="section-label">Recent reviews — {branch.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {branch.reviews.map((r, i) => (
            <ReviewCard key={i} review={r} branchName={branch.name.split(' —')[0]} branchColor={branch.color} gbpUrl={branch.gbpUrl} />
          ))}
        </div>
      </div>
    </div>
  )
}
