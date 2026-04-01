import Head from 'next/head'
import { useState } from 'react'

const TABS = [
  { id: 'overview',     label: 'Overview',          icon: '⬡' },
  { id: 'tasks',        label: 'Tasks',              icon: '✅' },
  { id: 'local-seo',   label: 'Local SEO',          icon: '📍' },
  { id: 'organic-seo', label: 'Organic SEO',        icon: '🔍' },
  { id: 'paid-ads',    label: 'Paid Ads',           icon: '📊' },
  { id: 'reviews',     label: 'Reviews',            icon: '⭐' },
  { id: 'carts',       label: 'Abandoned Carts',    icon: '🛒' },
  { id: 'launch',      label: 'New Product Launch', icon: '🚀' },
  { id: 'shopify',     label: 'Shopify',            icon: '🛍' },
  { id: 'ispy',        label: 'i-Spy Competitors',  icon: '🕵️' },
  { id: 'audit',       label: 'Audit',              icon: '📋' },
  { id: 'content',     label: 'Content Studio',     icon: '✍️' },
  { id: 'performance', label: 'Performance',        icon: '📈' },
]

const STATUS_DOTS = [
  { label: 'Shopify',        color: '#22c55e' },
  { label: 'Search Console', color: '#22c55e' },
  { label: 'Analytics',      color: '#22c55e' },
  { label: 'Ads CSV',        color: '#f59e0b' },
  { label: 'WhatsApp',       color: '#22c55e' },
  { label: 'GBP',            color: '#22c55e' },
]

const METRICS = {
  today: [
    { label: 'Online revenue', val: '£1,320', note: '+14% vs yesterday', color: '#22c55e' },
    { label: 'Website visits', val: '2,184',  note: '+8% vs yesterday',  color: '#22c55e' },
    { label: 'Ads cost/sale',  val: '£9.35',  note: 'Target: £8.00',     color: '#f59e0b' },
    { label: 'Avg GBP rating', val: '3.8★',   note: '3 new reviews today', color: '#f59e0b' },
  ],
  week: [
    { label: 'Online revenue', val: '£9,240',  note: '+8% vs last week',  color: '#22c55e' },
    { label: 'Website visits', val: '14,561',  note: '+12% vs last week', color: '#22c55e' },
    { label: 'Ads cost/sale',  val: '£9.35',   note: 'Target: under £8',  color: '#f59e0b' },
    { label: 'Avg GBP rating', val: '3.8★',    note: '220 total reviews', color: '#f59e0b' },
  ],
  month: [
    { label: 'Online revenue', val: '£38,400', note: '+5% vs last month',  color: '#22c55e' },
    { label: 'Website visits', val: '61,200',  note: '+9% vs last month',  color: '#22c55e' },
    { label: 'Ads cost/sale',  val: '£8.90',   note: 'Target: under £8',   color: '#f59e0b' },
    { label: 'Avg GBP rating', val: '3.8★',    note: '220 total reviews',  color: '#f59e0b' },
  ],
  year: [
    { label: 'Online revenue', val: '£412,000', note: '+18% vs last year', color: '#22c55e' },
    { label: 'Website visits', val: '720,000',  note: '+22% vs last year', color: '#22c55e' },
    { label: 'Ads cost/sale',  val: '£7.80',    note: 'Target: under £8',  color: '#22c55e' },
    { label: 'Avg GBP rating', val: '3.8★',     note: '220 total reviews', color: '#f59e0b' },
  ],
}

const PILLARS = [
  {
    id: 'local', label: 'Local SEO', color: '#22c55e', badge: '2 urgent', badgeColor: '#ef4444',
    tasks: [
      { text: 'Post GBP offer — Chapeltown', done: true, when: '' },
      { text: 'Reply to 3 new reviews (AI draft ready)', done: false, when: 'Urgent', urgent: true },
      { text: 'Upload new photos — Roundhay branch', done: false, when: 'Today' },
      { text: 'Check all 3 GBP listings for accuracy', done: false, when: 'Today' },
    ],
  },
  {
    id: 'organic', label: 'Organic SEO', color: '#3b82f6', badge: '1 blog due', badgeColor: '#3b82f6',
    tasks: [
      { text: 'Publish blog: "Best relaxers in Leeds 2026"', done: false, when: 'Today' },
      { text: 'Fix Wigs collection meta title', done: true, when: '' },
      { text: 'Add COLOUR10 banner to Hair Dye page', done: false, when: 'Today' },
      { text: 'Update 5 product descriptions — SEO Audit', done: false, when: 'This week' },
    ],
  },
  {
    id: 'paid', label: 'Paid Ads', color: '#f59e0b', badge: '3 urgent', badgeColor: '#ef4444',
    tasks: [
      { text: 'Set desktop bid +30% — Shopify All Products', done: false, when: 'Urgent', urgent: true },
      { text: 'Scale ORS budget 10x (CPA 47p!)', done: false, when: 'Urgent', urgent: true },
      { text: 'Excluded mustard oil, t gel, olive oil', done: true, when: '' },
      { text: 'Undo Nivea cream exclusion', done: false, when: 'Urgent', urgent: true },
    ],
  },
]

const BRANCHES = [
  { name: 'Chapeltown — LS7', rating: 4.0, reviews: 66,  lastPost: '2 days ago', photos: 12, qa: 3, alertColor: '#f59e0b', alerts: ['Post due today', '3 unanswered Q&A'] },
  { name: 'Roundhay — LS8',   rating: 3.8, reviews: 119, lastPost: '5 days ago', photos: 8,  qa: 0, alertColor: '#ef4444', alerts: ['Post overdue 5 days'] },
  { name: 'City Centre',      rating: 3.3, reviews: 35,  lastPost: '1 day ago',  photos: 4,  qa: 1, alertColor: '#ef4444', alerts: ['Low rating — needs reviews!'] },
]

const TEAM_TASKS = [
  { pillar: 'Local SEO', pc: '#22c55e', text: 'Print and display Google Review QR badges at till — all 3 branches', assign: 'Branch managers', when: 'Done', done: true },
  { pillar: 'Local SEO', pc: '#22c55e', text: 'Post weekly offer to Google Business Profile — all 3 branches', assign: 'Social media team', when: 'Today', done: false },
  { pillar: 'Organic',   pc: '#3b82f6', text: 'Publish blog post: "Best relaxers for natural hair — available in Leeds"', assign: 'Content team · Use Content Studio tab', when: 'Today', done: false },
  { pillar: 'Paid Ads',  pc: '#f59e0b', text: 'Google Ads: Set desktop bid adjustment +30% on Shopify All Products campaign', assign: 'Mohammed · ads.google.com → Devices', when: 'Today', done: false },
  { pillar: 'Paid Ads',  pc: '#f59e0b', text: 'Add COLOUR10 banner to Hair Dye & Colour collection page in Shopify', assign: 'Shopify team · Shopify → Online Store → Collections', when: 'This week', done: false },
  { pillar: 'Organic',   pc: '#3b82f6', text: 'Fix 12 products with missing meta descriptions — SEO Audit tab shows exact products', assign: 'Content team · Use SEO Audit tab → AI Fix', when: 'This week', done: false },
]

const KEYWORDS = [
  { kw: 'cc hair beauty',    vol: 1150 },
  { kw: 'hair shop leeds',   vol: 220 },
  { kw: 'wigs leeds',        vol: 21 },
  { kw: 'hair dye',          vol: 47 },
]

const BRAND_ADS = [
  { brand: 'ORS',         cpa: '47p CPA',   pct: 95, color: '#22c55e' },
  { brand: 'Cantu',       cpa: '£1.77',     pct: 75, color: '#22c55e' },
  { brand: 'Loreal',      cpa: '£7.23',     pct: 45, color: '#f59e0b' },
  { brand: 'H&Shoulders', cpa: '£0 conv',   pct: 8,  color: '#ef4444' },
]

const REVIEWS_DATA = {
  chapeltown: {
    name: 'Chapeltown — LS7', rating: 4.0, total: 66, color: '#22c55e',
    reviews: [
      { author: 'Sarah M.',  rating: 5, time: '2h ago',  text: 'Absolutely love this shop! Always have exactly what I need for my natural hair. Staff are so helpful and knowledgeable.' },
      { author: 'Priya K.',  rating: 5, time: '1d ago',  text: 'Best hair shop in Leeds! Huge selection of professional products. I drive from Bradford just to shop here.' },
      { author: 'Tanya B.',  rating: 4, time: '3d ago',  text: 'Great range of products. Staff helped me find the right relaxer for my hair type. Will definitely be back.' },
    ],
  },
  roundhay: {
    name: 'Roundhay — LS8', rating: 3.8, total: 119, color: '#f59e0b',
    reviews: [
      { author: 'Anonymous', rating: 2, time: '4h ago',  text: 'Prices are higher than expected and staff seemed busy.' },
      { author: 'Diane F.',  rating: 5, time: '2d ago',  text: 'Love this local branch! Always has everything I need and the staff are really friendly.' },
      { author: 'Marcus H.', rating: 3, time: '5d ago',  text: 'OK selection but could do with more braiding hair options.' },
    ],
  },
  citycentre: {
    name: 'City Centre — New York St', rating: 3.3, total: 35, color: '#ef4444',
    reviews: [
      { author: 'James T.',  rating: 3, time: '1d ago',  text: 'Decent selection but the shop felt a bit disorganised. Would visit again though.' },
      { author: 'Fiona R.',  rating: 2, time: '3d ago',  text: "Couldn't find what I was looking for and staff weren't very helpful." },
      { author: 'Amara O.',  rating: 5, time: '1w ago',  text: 'Hidden gem in Leeds city centre! Great for natural and afro hair products.' },
    ],
  },
}

function genReply(rating, branch) {
  const t = {
    5: 'Thank you so much for your wonderful review! We\'re thrilled you had such a great experience at our ' + branch + ' store. We look forward to seeing you again soon!',
    4: 'Thank you for your kind review and for visiting our ' + branch + ' branch! We\'re glad you had a positive experience. Please don\'t hesitate to ask our staff for help anytime.',
    3: 'Thank you for taking the time to leave a review. We appreciate your honest feedback about our ' + branch + ' branch. We\'d love the opportunity to give you an even better experience next time!',
    2: 'Thank you for your feedback. We\'re sorry to hear your visit to our ' + branch + ' branch didn\'t fully meet your expectations. We\'d love to make this right — please do come back and give us another chance!',
    1: 'Thank you for your feedback. We\'re very sorry about your experience at our ' + branch + ' branch. Please contact us directly so we can resolve this for you.',
  }
  return t[rating] || t[3]
}

function Stars({ n, size }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? '#f59e0b' : '#2e3347', fontSize: size || 14 }}>★</span>
      ))}
    </span>
  )
}

function ReviewCard({ review, branchName }) {
  const [reply, setReply] = useState(genReply(review.rating, branchName))
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)

  function copy() {
    navigator.clipboard.writeText(reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: '#1a1d27', border: '1px solid #2e3347', borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Stars n={review.rating} />
          <span style={{ fontWeight: 600, color: '#e8eaf0' }}>{review.author}</span>
          <span style={{ color: '#555b75', fontSize: 12 }}>· {review.time}</span>
        </div>
      </div>
      <p style={{ color: '#8b90a7', fontSize: 13, fontStyle: 'italic', marginBottom: 10, lineHeight: 1.5 }}>"{review.text}"</p>
      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>✨ AI Reply</div>
        {editing
          ? <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} style={{ width: '100%', background: '#22263a', border: '1px solid #2e3347', borderRadius: 6, color: '#e8eaf0', fontSize: 13, padding: 8, resize: 'vertical' }} />
          : <p style={{ color: '#e8eaf0', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{reply}</p>
        }
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={copy} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #2e3347', background: '#22263a', color: '#e8eaf0', cursor: 'pointer', fontSize: 12 }}>
          {copied ? '✓ Copied!' : '📋 Copy reply'}
        </button>
        <a href="https://business.google.com" target="_blank" rel="noreferrer" style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #2e3347', background: '#22263a', color: '#818cf8', cursor: 'pointer', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Open in Google →
        </a>
        <button onClick={() => setEditing(!editing)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #2e3347', background: '#22263a', color: '#e8eaf0', cursor: 'pointer', fontSize: 12, marginLeft: 'auto' }}>
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>
    </div>
  )
}

function OverviewTab() {
  const [period, setPeriod] = useState('today')
  const [taskDone, setTaskDone] = useState({})
  const metrics = METRICS[period]
  const done = TEAM_TASKS.filter(t => t.done || taskDone[t.text]).length
  const pct = Math.round((done / TEAM_TASKS.length) * 100)

  return (
    <div>
      {/* Period toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['today','week','month','year'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '7px 14px', borderRadius: 8, border: period === p ? 'none' : '1px solid #2e3347',
            background: period === p ? '#6366f1' : '#1a1d27', color: '#e8eaf0', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>
            {{ today:'Today', week:'This Week', month:'This Month', year:'This Year' }[p]}
          </button>
        ))}
      </div>

      {/* Metrics */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555b75', marginBottom: 10 }}>
        {{ today:'Today', week:'This Week', month:'This Month', year:'This Year' }[period]} at a glance
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: '#1a1d27', border: '1px solid #2e3347', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#e8eaf0', letterSpacing: '-0.02em' }}>{m.val}</div>
            <div style={{ color: '#8b90a7', fontSize: 12, marginTop: 2 }}>{m.label}</div>
            <div style={{ color: m.color, fontSize: 12, marginTop: 4, fontWeight: 500 }}>{m.note}</div>
          </div>
        ))}
      </div>

      {/* Pillars */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555b75', marginBottom: 10 }}>Today's tasks — by pillar</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {PILLARS.map(p => (
          <div key={p.id} style={{ background: '#1a1d27', border: '1px solid ' + p.color + '40', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: p.color, fontWeight: 700, fontSize: 14 }}>{p.label}</span>
              <span style={{ background: p.badgeColor + '20', color: p.badgeColor, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{p.badge}</span>
            </div>
            {p.tasks.map(t => (
              <div key={t.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1, background: t.done ? p.color : 'transparent', border: '2px solid ' + (t.done ? p.color : '#2e3347'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.done && <span style={{ color: '#000', fontSize: 10, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ flex: 1, color: t.done ? '#555b75' : '#e8eaf0', fontSize: 13, textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
                {t.when && <span style={{ background: t.urgent ? 'rgba(239,68,68,.15)' : t.when === 'Today' ? 'rgba(99,102,241,.15)' : 'rgba(139,144,167,.1)', color: t.urgent ? '#ef4444' : t.when === 'Today' ? '#818cf8' : '#8b90a7', padding: '2px 6px', borderRadius: 99, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{t.when}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* GBP */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555b75', marginBottom: 10 }}>Google Business Profile — 3 branches</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {BRANCHES.map(b => {
          const rc = b.rating >= 4 ? '#22c55e' : b.rating >= 3.7 ? '#f59e0b' : '#ef4444'
          return (
            <div key={b.name} style={{ background: '#1a1d27', border: '1px solid ' + b.alertColor + '40', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: '#e8eaf0' }}>{b.name}</span>
                <span style={{ color: rc, fontWeight: 700, fontSize: 16 }}>{b.rating}★</span>
              </div>
              <div style={{ color: '#8b90a7', fontSize: 12, marginBottom: 8 }}>Reviews: {b.reviews} · Last post: {b.lastPost}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {b.alerts.map(a => <span key={a} style={{ background: b.alertColor + '20', color: b.alertColor, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{a}</span>)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Team tasks */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555b75', marginBottom: 10 }}>This week's team tasks</div>
      <div style={{ background: '#1a1d27', border: '1px solid #2e3347', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #2e3347', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, color: '#e8eaf0' }}>Week of 1 April 2026 — {done} of {TEAM_TASKS.length} done</span>
          <span style={{ color: '#8b90a7', fontSize: 13 }}>{pct}% complete</span>
        </div>
        <div style={{ height: 4, background: '#22263a' }}><div style={{ height: '100%', width: pct + '%', background: '#22c55e', transition: 'width .3s' }} /></div>
        {TEAM_TASKS.map((t, i) => {
          const isDone = t.done || taskDone[t.text]
          return (
            <div key={i} onClick={() => setTaskDone(p => ({ ...p, [t.text]: !p[t.text] }))} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: i < TEAM_TASKS.length - 1 ? '1px solid #2e3347' : 'none', cursor: 'pointer' }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, background: isDone ? '#22c55e' : 'transparent', border: '2px solid ' + (isDone ? '#22c55e' : '#2e3347'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isDone && <span style={{ color: '#000', fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ background: t.pc + '20', color: t.pc, padding: '2px 6px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{t.pillar}</span>
                  <span style={{ color: isDone ? '#555b75' : '#e8eaf0', fontSize: 13, fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none' }}>{t.text}</span>
                </div>
                <div style={{ color: '#555b75', fontSize: 12 }}>Assigned to: {t.assign}</div>
              </div>
              <span style={{ background: isDone ? 'rgba(34,197,94,.15)' : t.when === 'Today' ? 'rgba(99,102,241,.15)' : 'rgba(139,144,167,.1)', color: isDone ? '#22c55e' : t.when === 'Today' ? '#818cf8' : '#8b90a7', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {isDone ? 'Done' : t.when}
              </span>
            </div>
          )
        })}
      </div>

      {/* Performance */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555b75', marginBottom: 10 }}>Performance snapshot</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#1a1d27', border: '1px solid #2e3347', borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 600, color: '#e8eaf0', marginBottom: 12 }}>Top organic keywords</div>
          {KEYWORDS.map(k => (
            <div key={k.kw} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ color: '#8b90a7', fontSize: 13, width: 160, flexShrink: 0 }}>{k.kw}</span>
              <div style={{ flex: 1, height: 6, background: '#22263a', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: (k.vol / 1150 * 100) + '%', height: '100%', background: '#3b82f6', borderRadius: 3 }} />
              </div>
              <span style={{ color: '#e8eaf0', fontWeight: 600, fontSize: 13, width: 40, textAlign: 'right' }}>{k.vol}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#1a1d27', border: '1px solid #2e3347', borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 600, color: '#e8eaf0', marginBottom: 12 }}>Ads brand performance</div>
          {BRAND_ADS.map(b => (
            <div key={b.brand} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ color: '#8b90a7', fontSize: 13, width: 110, flexShrink: 0 }}>{b.brand}</span>
              <div style={{ flex: 1, height: 6, background: '#22263a', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: b.pct + '%', height: '100%', background: b.color, borderRadius: 3 }} />
              </div>
              <span style={{ color: b.color, fontWeight: 600, fontSize: 13, width: 60, textAlign: 'right' }}>{b.cpa}</span>
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {Object.entries(REVIEWS_DATA).map(([id, d]) => (
          <button key={id} onClick={() => setBranch(id)} style={{ padding: '7px 14px', borderRadius: 8, border: branch === id ? 'none' : '1px solid #2e3347', background: branch === id ? '#6366f1' : '#1a1d27', color: '#e8eaf0', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
            {d.name.split(' —')[0]}
            <span style={{ background: d.color + '20', color: d.color, padding: '1px 6px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{d.rating}★</span>
          </button>
        ))}
      </div>
      <div style={{ background: '#1a1d27', border: '1px solid #2e3347', borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div>
          <div style={{ fontSize: 36, fontWeight: 800, color: b.color }}>{b.rating}★</div>
          <div style={{ color: '#8b90a7', fontSize: 13 }}>{b.total} total reviews</div>
        </div>
        <div style={{ flex: 1 }}>
          {[5,4,3,2,1].map(n => {
            const count = b.reviews.filter(r => r.rating === n).length
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: '#555b75', fontSize: 12, width: 20 }}>{n}★</span>
                <div style={{ flex: 1, height: 6, background: '#22263a', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: (count / b.reviews.length * 100) + '%', height: '100%', background: b.color, borderRadius: 3 }} />
                </div>
              </div>
            )
          })}
        </div>
        <a href="https://business.google.com" target="_blank" rel="noreferrer" style={{ padding: '8px 14px', borderRadius: 8, background: '#22c55e', color: '#000', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>View all reviews</a>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555b75', marginBottom: 10 }}>Recent reviews — {b.name}</div>
      {b.reviews.map((r, i) => <ReviewCard key={i} review={r} branchName={b.name.split(' —')[0]} />)}
    </div>
  )
}

function ComingSoon({ tab }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: 16 }}>
      <div style={{ fontSize: 56 }}>{TABS.find(t => t.id === tab)?.icon || '⬡'}</div>
      <div style={{ fontWeight: 700, fontSize: 22, color: '#e8eaf0', textTransform: 'capitalize' }}>{tab.replace(/-/g,' ')}</div>
      <p style={{ color: '#8b90a7', maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>This tab is being built next. Come back soon.</p>
      <span style={{ background: 'rgba(168,85,247,.15)', color: '#a855f7', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>BUILDING NEXT</span>
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')

  function renderTab() {
    if (activeTab === 'overview') return <OverviewTab />
    if (activeTab === 'reviews')  return <ReviewsTab />
    return <ComingSoon tab={activeTab} />
  }

  return (
    <>
      <Head>
        <title>CC Hair &amp; Beauty — Intelligence Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #0f1117; color: #e8eaf0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 14px; min-height: 100vh; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-thumb { background: #2e3347; border-radius: 3px; }
          button { font-family: inherit; }
        `}</style>
      </Head>

      {/* Header */}
      <div style={{ background: '#1a1d27', borderBottom: '1px solid #2e3347', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 20, height: 52, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>CC</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>CC Hair &amp; Beauty — Intelligence Platform</span>
        </div>
        <div style={{ display: 'flex', gap: 16, marginLeft: 'auto', alignItems: 'center' }}>
          {STATUS_DOTS.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
              <span style={{ fontSize: 12, color: '#8b90a7' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#1a1d27', borderBottom: '1px solid #2e3347', padding: '0 20px', display: 'flex', gap: 2, overflowX: 'auto' }}>
        {TABS.map(tab => {
          const active = tab.id === activeTab
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: active ? '2px solid #818cf8' : '2px solid transparent', color: active ? '#818cf8' : '#8b90a7', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}>
              {tab.icon} {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 20 }}>
        {renderTab()}
      </div>
    </>
  )
}
