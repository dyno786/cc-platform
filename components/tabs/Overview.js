import { useState } from 'react'

const PERIOD_DATA = {
  today: {
    revenue: '£1,320', revDelta: '+14% vs yesterday',
    visits: '2,184', visitDelta: '+8% vs yesterday',
    cpa: '£9.35', cpaTarget: 'Target: £8.00',
    rating: '3.8★', ratingNote: '3 new reviews today',
    cpaOk: false,
  },
  week: {
    revenue: '£9,240', revDelta: '+8% vs last week',
    visits: '14,561', visitDelta: '+12% vs last week',
    cpa: '£9.35', cpaTarget: 'Target: under £8',
    rating: '3.8★', ratingNote: '220 total reviews',
    cpaOk: false,
  },
  month: {
    revenue: '£38,400', revDelta: '+5% vs last month',
    visits: '61,200', visitDelta: '+9% vs last month',
    cpa: '£8.90', cpaTarget: 'Target: under £8',
    rating: '3.8★', ratingNote: '220 total reviews',
    cpaOk: false,
  },
  year: {
    revenue: '£412,000', revDelta: '+18% vs last year',
    visits: '720,000', visitDelta: '+22% vs last year',
    cpa: '£7.80', cpaTarget: 'Target: under £8',
    rating: '3.8★', ratingNote: '220 total reviews',
    cpaOk: true,
  },
}

const PILLAR_TASKS = {
  local: {
    label: 'Local SEO', color: 'var(--local)', bg: 'var(--local-bg)',
    badge: '2 urgent',
    badgeColor: '#ef4444',
    tasks: [
      { text: 'Post GBP offer — Chapeltown', done: true, when: '' },
      { text: 'Reply to 3 new reviews (AI draft ready)', done: false, when: 'Urgent', urgent: true },
      { text: 'Upload new photos — Roundhay branch', done: false, when: 'Today' },
      { text: 'Check all 3 GBP listings for accuracy', done: false, when: 'Today' },
    ]
  },
  organic: {
    label: 'Organic SEO', color: 'var(--organic)', bg: 'var(--organic-bg)',
    badge: '1 blog due',
    badgeColor: '#3b82f6',
    tasks: [
      { text: 'Publish blog: "Best relaxers in Leeds 2026"', done: false, when: 'Today' },
      { text: 'Fix Wigs collection meta title', done: true, when: '' },
      { text: 'Add COLOUR10 banner to Hair Dye page', done: false, when: 'Today' },
      { text: 'Update 5 product descriptions — SEO Audit', done: false, when: 'This week' },
    ]
  },
  paid: {
    label: 'Paid Ads', color: 'var(--paid)', bg: 'var(--paid-bg)',
    badge: '3 urgent',
    badgeColor: '#ef4444',
    tasks: [
      { text: 'Set desktop bid +30% — Shopify All Products', done: false, when: 'Urgent', urgent: true },
      { text: 'Scale ORS budget 10x (CPA 47p!)', done: false, when: 'Urgent', urgent: true },
      { text: 'Excluded mustard oil, t gel, olive oil', done: true, when: '' },
      { text: 'Undo Nivea cream exclusion', done: false, when: 'Urgent', urgent: true },
    ]
  }
}

const TEAM_TASKS = [
  { pillar: 'Local SEO', pillarColor: 'var(--local)', text: 'Print and display Google Review QR badges at till — all 3 branches', assign: 'Branch managers', when: 'Done', done: true },
  { pillar: 'Local SEO', pillarColor: 'var(--local)', text: 'Post weekly offer to Google Business Profile — Chapeltown, Roundhay, City Centre', assign: 'Social media team', when: 'Today', done: false },
  { pillar: 'Organic', pillarColor: 'var(--organic)', text: 'Publish blog post: "Best relaxers for natural hair — available in Leeds"', assign: 'Content team · Use Content Studio tab', when: 'Today', done: false },
  { pillar: 'Paid Ads', pillarColor: 'var(--paid)', text: 'Google Ads: Set desktop bid adjustment +30% on Shopify All Products campaign', assign: 'Mohammed · ads.google.com → Devices', when: 'Today', done: false, urgent: true },
  { pillar: 'Paid Ads', pillarColor: 'var(--paid)', text: 'Add COLOUR10 (10% off hair dye) banner to Hair Dye & Colour collection page in Shopify', assign: 'Shopify team · Shopify → Online Store → Collections', when: 'This week', done: false },
  { pillar: 'Organic', pillarColor: 'var(--organic)', text: 'Fix 12 products with missing meta descriptions — SEO Audit tab shows exact products', assign: 'Content team · Use SEO Audit tab → AI Fix', when: 'This week', done: false },
]

const TOP_KEYWORDS = [
  { kw: 'cc hair beauty', vol: 1150, max: 1150 },
  { kw: 'hair shop leeds', vol: 220, max: 1150 },
  { kw: 'wigs leeds', vol: 21, max: 1150 },
  { kw: 'hair dye', vol: 47, max: 1150 },
]

const BRAND_ADS = [
  { brand: 'ORS',        cpa: '47p', color: '#22c55e', pct: 95 },
  { brand: 'Cantu',      cpa: '£1.77', color: '#22c55e', pct: 75 },
  { brand: 'Loreal',     cpa: '£7.23', color: '#f59e0b', pct: 45 },
  { brand: 'H&Shoulders',cpa: '£0 conv', color: '#ef4444', pct: 8 },
]

export default function OverviewTab({ onTabChange }) {
  const [period, setPeriod] = useState('today')
  const [taskDone, setTaskDone] = useState({})
  const d = PERIOD_DATA[period]

  const done = TEAM_TASKS.filter(t => t.done || taskDone[t.text]).length
  const total = TEAM_TASKS.length
  const pct = Math.round((done / total) * 100)

  const periodLabel = { today: 'Today', week: 'This Week', month: 'This Month', year: 'This Year' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Period toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['today','week','month','year'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`btn ${period === p ? 'btn-primary' : 'btn-ghost'}`}
          >
            {{ today:'Today', week:'This Week', month:'This Month', year:'This Year' }[p]}
          </button>
        ))}
      </div>

      {/* Headline metrics */}
      <div>
        <div className="section-label">{periodLabel[period]} at a glance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Online revenue', val: d.revenue, note: d.revDelta, noteColor: '#22c55e' },
            { label: 'Website visits', val: d.visits, note: d.visitDelta, noteColor: '#22c55e' },
            { label: 'Ads cost/sale', val: d.cpa, note: d.cpaTarget, noteColor: d.cpaOk ? '#22c55e' : '#f59e0b' },
            { label: 'Avg GBP rating', val: d.rating, note: d.ratingNote, noteColor: '#f59e0b' },
          ].map(m => (
            <div key={m.label} className="card">
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{m.val}</div>
              <div style={{ color: 'var(--text2)', fontSize: 12, marginTop: 2 }}>{m.label}</div>
              <div style={{ color: m.noteColor, fontSize: 12, marginTop: 4, fontWeight: 500 }}>{m.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Pillar task cards */}
      <div>
        <div className="section-label">Today's tasks — by pillar</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Object.values(PILLAR_TASKS).map(p => (
            <div key={p.label} className="card" style={{ borderColor: p.color + '40', background: p.bg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ color: p.color, fontWeight: 700, fontSize: 14 }}>{p.label}</span>
                <span className="pill" style={{ background: p.badgeColor + '20', color: p.badgeColor }}>{p.badge}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {p.tasks.map(t => (
                  <div key={t.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                      background: t.done ? p.color : 'transparent',
                      border: `2px solid ${t.done ? p.color : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {t.done && <span style={{ color: '#000', fontSize: 10 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        color: t.done ? 'var(--text3)' : 'var(--text)',
                        textDecoration: t.done ? 'line-through' : 'none',
                        fontSize: 13,
                      }}>{t.text}</span>
                    </div>
                    {t.when && (
                      <span className="pill" style={{
                        background: t.urgent ? 'rgba(239,68,68,.15)' : t.when === 'Today' ? 'rgba(99,102,241,.15)' : 'rgba(139,144,167,.1)',
                        color: t.urgent ? '#ef4444' : t.when === 'Today' ? '#818cf8' : 'var(--text2)',
                        flexShrink: 0,
                      }}>{t.when}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GBP branch summary */}
      <div>
        <div className="section-label">Google Business Profile — 3 branches live monitoring</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { name: 'Chapeltown — LS7', rating: 4.0, reviews: 66, lastPost: '2 days ago', photos: 12, qa: 3, alerts: ['Post due today', '3 unanswered Q&A'], alertColor: '#f59e0b' },
            { name: 'Roundhay — LS8', rating: 3.8, reviews: 119, lastPost: '5 days ago', photos: 8, qa: 0, alerts: ['Post overdue 5 days'], alertColor: '#ef4444' },
            { name: 'City Centre', rating: 3.3, reviews: 35, lastPost: '1 day ago', photos: 4, qa: 1, alerts: ['Low rating — needs reviews!'], alertColor: '#ef4444' },
          ].map(b => {
            const rColor = b.rating >= 4 ? '#22c55e' : b.rating >= 3.7 ? '#f59e0b' : '#ef4444'
            return (
              <div key={b.name} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600 }}>{b.name}</span>
                  <span style={{ color: rColor, fontWeight: 700 }}>{b.rating}★</span>
                </div>
                <div style={{ color: 'var(--text2)', fontSize: 12, marginTop: 6, display: 'flex', gap: 12 }}>
                  <span>Reviews: {b.reviews}</span>
                  <span>Last post: {b.lastPost}</span>
                </div>
                <div style={{ color: 'var(--text2)', fontSize: 12, marginTop: 2, display: 'flex', gap: 12 }}>
                  <span>Photos: {b.photos}</span>
                  <span>Q&amp;A: {b.qa} unanswered</span>
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {b.alerts.map(a => (
                    <span key={a} className="pill" style={{ background: b.alertColor + '20', color: b.alertColor }}>{a}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Team tasks */}
      <div>
        <div className="section-label">This week's team tasks — assign to team members</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Week of 1 April 2026 — {done} of {total} tasks done</span>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>{pct}% complete</span>
          </div>
          <div style={{ padding: '4px 16px', borderBottom: '1px solid var(--border)', height: 4, background: 'var(--surface2)' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 2, transition: 'width .4s' }} />
          </div>
          <div>
            {TEAM_TASKS.map((t, i) => {
              const isDone = t.done || taskDone[t.text]
              return (
                <div key={i} onClick={() => setTaskDone(p => ({ ...p, [t.text]: !p[t.text] }))}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                    borderBottom: i < TEAM_TASKS.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    background: isDone ? 'rgba(34,197,94,0.03)' : 'transparent',
                    transition: 'background .15s',
                  }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                    background: isDone ? '#22c55e' : 'transparent',
                    border: `2px solid ${isDone ? '#22c55e' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isDone && <span style={{ color: '#000', fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span className="pill" style={{ background: t.pillarColor + '20', color: t.pillarColor }}>{t.pillar}</span>
                      <span style={{
                        color: isDone ? 'var(--text3)' : 'var(--text)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        fontSize: 13, fontWeight: 500,
                      }}>{t.text}</span>
                    </div>
                    <div style={{ color: 'var(--text3)', fontSize: 12 }}>Assigned to: {t.assign}</div>
                  </div>
                  <span className="pill" style={{
                    background: t.done ? 'var(--green-dim)' : t.when === 'Today' ? 'rgba(99,102,241,.15)' : 'rgba(139,144,167,.1)',
                    color: t.done ? 'var(--green)' : t.when === 'Today' ? '#818cf8' : 'var(--text2)',
                    flexShrink: 0,
                  }}>{isDone ? 'Done' : t.when}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Performance snapshot */}
      <div>
        <div className="section-label">Performance snapshot</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Top keywords */}
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Top organic keywords this week</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TOP_KEYWORDS.map(k => (
                <div key={k.kw} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--text2)', fontSize: 13, width: 140, flexShrink: 0 }}>{k.kw}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(k.vol / k.max) * 100}%`, height: '100%', background: 'var(--organic)', borderRadius: 3 }} />
                  </div>
                  <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13, width: 40, textAlign: 'right' }}>{k.vol}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Brand ads */}
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Ads brand performance — scale vs pause</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BRAND_ADS.map(b => (
                <div key={b.brand} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--text2)', fontSize: 13, width: 100, flexShrink: 0 }}>{b.brand}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ color: b.color, fontWeight: 600, fontSize: 13, width: 60, textAlign: 'right' }}>{b.cpa}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
