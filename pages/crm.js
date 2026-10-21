import Head from 'next/head'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const TABS = ['Today', 'Customers', 'Flows', 'WhatsApp', 'Email', 'Newsletter', 'Reorders', 'Suggestions', 'Settings']
const WA = '#1f8a4c'
const api = (p, opt) => fetch('/api/crm/' + p, opt).then(r => r.json())
const post = (p, body) => api(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const fmtD = iso => iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'
const fmtDT = iso => iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'
const gbp = n => '£' + Number(n || 0).toFixed(2)
const short = id => String(id || '').split('/').pop()

const card = { background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '12px 14px' }
const btn = (bg, fg, extra) => ({ padding: '6px 11px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: `0.5px solid ${bg === T.surface ? T.border : bg}`, background: bg, color: fg, cursor: 'pointer', textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap', ...(extra || {}) })
const Pill = ({ children, color, bg }) => <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: bg || T.blueBg, color: color || T.blue, whiteSpace: 'nowrap' }}>{children}</span>
const Stat = ({ label, value, color, sub }) => <div style={{ ...card, textAlign: 'center' }}><div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div><div style={{ fontSize: 20, fontWeight: 700, color: color || T.text }}>{value}</div>{sub && <div style={{ fontSize: 10, color: T.textMuted }}>{sub}</div>}</div>
const H = ({ children, sub }) => <div style={{ marginBottom: 10 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{children}</div>{sub && <div style={{ fontSize: 11, color: T.textMuted }}>{sub}</div>}</div>
const Empty = ({ children }) => <div style={{ ...card, color: T.textMuted, fontSize: 12 }}>{children}</div>
const Consent = ({ a }) => <span style={{ display: 'inline-flex', gap: 4 }}>{a.consent && a.consent.email && <Pill color={T.blue} bg={T.blueBg}>Email ✓</Pill>}{a.consent && (a.consent.sms || a.consent.waOk) && <Pill color={WA} bg="#e3f3e8">WhatsApp ✓</Pill>}</span>

function useQueue() {
  const [q, setQ] = useState(null); const [err, setErr] = useState('')
  const load = useCallback(() => api('queue').then(d => { setQ(d); setErr(d.ok ? '' : d.error || '') }).catch(e => setErr(e.message)), [])
  useEffect(() => { load() }, [load])
  const mark = useCallback(async (a, status) => {
    setQ(prev => prev ? { ...prev, actions: prev.actions.filter(x => x.key !== a.key) } : prev)
    await post('action', { customerId: a.customerId, key: a.key, flow: a.flow, channel: a.channel, marketing: a.marketing, status, name: a.name })
  }, [])
  return { q, err, load, mark }
}

// One queued action: who, why, the message, and the buttons
function ActionRow({ a, mark, showText }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(a.text)
  const blocked = a.blocked && a.blocked.length
  const link = a.channel === 'whatsapp' ? 'https://wa.me/' + a.phone.replace(/^0/, '44') + '?text=' + encodeURIComponent(text) : a.link
  return (
    <div style={{ borderTop: `0.5px solid ${T.borderLight}`, padding: '8px 0' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{a.name} <span style={{ color: T.textMuted, fontWeight: 400 }}>· {a.title}</span></div>
          <div style={{ fontSize: 11, color: T.textMuted, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <Pill color={a.channel === 'whatsapp' ? WA : T.blue} bg={a.channel === 'whatsapp' ? '#e3f3e8' : T.blueBg}>{a.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}</Pill>
            {a.marketing ? <Pill color={T.amber} bg={T.amberBg}>Marketing</Pill> : <Pill color={T.textMuted} bg={T.borderLight}>Service</Pill>}
            <Consent a={a} />
            {a.orderTotal != null && <span>{gbp(a.orderTotal)}</span>}{a.items && a.items.length > 0 && <span>· {a.items.join(', ')}</span>}
            <span>· due {fmtD(a.due)}</span>
          </div>
          {blocked ? <div style={{ fontSize: 11, color: T.red, marginTop: 2 }}>Held: {a.blocked.join(' · ')}</div> : null}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => setOpen(o => !o)} style={btn(T.surface, T.text)}>{open ? 'Hide' : 'Message'}</button>
          {!blocked && <a href={link} target="_blank" rel="noreferrer" onClick={() => setTimeout(() => setOpen(true), 300)} style={btn(a.channel === 'whatsapp' ? WA : T.blue, '#fff')}>{a.channel === 'whatsapp' ? 'Open WhatsApp' : 'Open email draft'}</a>}
          <button onClick={() => mark(a, 'sent')} style={btn(T.green, '#fff')}>Sent ✓</button>
          <button onClick={() => mark(a, 'skipped')} style={btn(T.surface, T.textMuted)}>Skip</button>
        </div>
      </div>
      {(open || showText) && (
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: a.channel === 'email' ? '1fr 1fr' : '1fr', gap: 8 }}>
          <div>
            {a.channel === 'email' && <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Subject: {a.subject}</div>}
            <textarea value={text} onChange={e => setText(e.target.value)} style={{ width: '100%', minHeight: 120, fontSize: 12, padding: 8, border: `0.5px solid ${T.border}`, borderRadius: 6, fontFamily: 'inherit', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button onClick={() => navigator.clipboard && navigator.clipboard.writeText(text)} style={btn(T.surface, T.text)}>Copy text</button>
              {a.channel === 'email' && <a href={'/api/crm/preview?key=' + encodeURIComponent(a.key)} target="_blank" rel="noreferrer" style={btn(T.surface, T.text)}>Open branded HTML</a>}
            </div>
          </div>
          {a.channel === 'email' && <iframe title="preview" src={'/api/crm/preview?key=' + encodeURIComponent(a.key)} style={{ width: '100%', height: 320, border: `0.5px solid ${T.border}`, borderRadius: 6, background: '#EEF2FB' }} />}
        </div>
      )}
    </div>
  )
}

// ---------------- TODAY ----------------
const STEP_DEFS = [
  { flows: ['confirm'], title: 'Confirm today\'s paid orders on WhatsApp', why: 'Service message. Cuts "where is my order?" calls.' },
  { flows: ['shipped'], title: 'Tell customers their parcel has left', why: 'Courier and tracking number, same day as dispatch.' },
  { flows: ['checkout'], title: 'Chase yesterday\'s abandoned checkouts', why: 'Shopify Email has already sent the emails; this is the WhatsApp follow-up for people with a phone number.' },
  { flows: ['delivered'], title: 'Delivered check-ins', why: 'Three days after dispatch: has it arrived, anything wrong? Problems get fixed before any review request.' },
  { flows: ['review'], title: 'Ask for Google reviews', why: 'Six days after dispatch, no refund, no open issue. One reminder a week later, then stop.' },
  { flows: ['reorder'], title: 'Reorder reminders due today', why: 'Email first, WhatsApp three days later, one final nudge. Skipped automatically if they already repurchased.' },
  { flows: ['crosssell'], title: '"Complete your routine" suggestions', why: 'Ten days after dispatch, matched to what they bought.' },
  { flows: ['winback'], title: 'Win-back messages (60 / 90 / 180 days)', why: 'Gentle at 60, stronger at 90, reactivation at 180.' },
]
function Today({ Q }) {
  const { q, err, load, mark } = Q
  const [doneSteps, setDone] = useState({})
  if (err) return <Empty>{err} {q && q.pending && <>— go to <b>Settings</b> and press <b>Run first sync</b>.</>}</Empty>
  if (!q) return <Empty>Working out today's list…</Empty>
  const groups = STEP_DEFS.map(s => ({ ...s, items: q.actions.filter(a => s.flows.includes(a.flow)) }))
  const total = groups.length, finished = groups.filter((g, i) => doneSteps[i] || g.items.length === 0).length
  const quiet = (() => { const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' })).getHours(); return h < 9 || h >= 20 })()
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8, marginBottom: 12 }}>
        <Stat label="Ready to send" value={q.ready} color={T.green} />
        <Stat label="Held by rules" value={q.blocked} color={T.amber} sub="consent, caps, quiet period" />
        <Stat label="WhatsApp" value={q.actions.filter(a => a.channel === 'whatsapp').length} color={WA} />
        <Stat label="Email" value={q.actions.filter(a => a.channel === 'email').length} color={T.blue} />
        <Stat label="New subscribers (7d)" value={q.subscribers.length} sub="Shopify sends the welcome" />
        <Stat label="Open checkouts" value={q.checkouts} color={T.purple} />
      </div>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <span>Data from Shopify at {fmtDT(q.updatedAt)} · {q.counts && q.counts.orders} orders in view · <a onClick={load} style={{ color: T.blue, cursor: 'pointer' }}>refresh list</a></span>
        {quiet && <span style={{ color: T.amber, fontWeight: 600 }}>Quiet hours (before 9am / after 8pm): service messages only, hold the marketing ones until morning.</span>}
      </div>
      <div style={{ height: 6, background: T.borderLight, borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}><div style={{ width: (finished / total * 100) + '%', height: '100%', background: T.green, transition: 'width .3s' }} /></div>
      {groups.map((g, i) => (
        <div key={i} style={{ ...card, marginBottom: 8, opacity: doneSteps[i] ? .55 : 1 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: g.items.length ? T.blue : T.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{g.items.length ? i + 1 : '✓'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{g.title} <span style={{ color: T.textMuted, fontWeight: 400 }}>· {g.items.length} {g.items.length === 1 ? 'person' : 'people'}</span></div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{g.why}</div>
            </div>
            {g.items.length > 0 && <button onClick={() => setDone(d => ({ ...d, [i]: !d[i] }))} style={btn(doneSteps[i] ? T.surface : T.green, doneSteps[i] ? T.text : '#fff')}>{doneSteps[i] ? 'Reopen' : 'Step done'}</button>}
          </div>
          {!doneSteps[i] && g.items.length > 0 && <div style={{ marginTop: 8 }}>{g.items.map(a => <ActionRow key={a.key} a={a} mark={mark} />)}</div>}
        </div>
      ))}
      <div style={{ ...card, marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.purple, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{STEP_DEFS.length + 1}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>Send tonight's newsletter</div><div style={{ fontSize: 11, color: T.textMuted }}>Open the <b>Newsletter</b> tab, copy both versions into Shopify Email and schedule them for 6pm.</div></div>
        </div>
      </div>
      <div style={{ ...card }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{STEP_DEFS.length + 2}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>Check replies</div><div style={{ fontSize: 11, color: T.textMuted }}>Anyone who replied STOP or raised a problem: open them in <b>Customers</b> and press <b>Pause all messages</b> or <b>Open issue</b>. That holds every marketing message and review request for them.</div></div>
        </div>
      </div>
    </>
  )
}

// ---------------- CUSTOMERS ----------------
function Customers() {
  const [data, setData] = useState(null); const [q, setQ] = useState(''); const [filter, setFilter] = useState(''); const [sel, setSel] = useState(null); const [detail, setDetail] = useState(null)
  const load = useCallback(() => api('customers?q=' + encodeURIComponent(q) + '&filter=' + filter).then(setData), [q, filter])
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [load])
  useEffect(() => { if (!sel) return setDetail(null); setDetail({ loading: true }); api('customers?id=' + encodeURIComponent(sel)).then(setDetail) }, [sel])
  async function setFlag(set) { await post('action', { customerId: sel, set }); api('customers?id=' + encodeURIComponent(sel)).then(setDetail); load() }
  async function markUp(a, status) { await post('action', { customerId: a.customerId, key: a.key, flow: a.flow, channel: a.channel, marketing: a.marketing, status, name: a.name }); api('customers?id=' + encodeURIComponent(sel)).then(setDetail) }
  if (data && !data.ok) return <Empty>{data.error}</Empty>
  const F = [['', 'All'], ['due', 'Action due'], ['whatsapp', 'Has WhatsApp'], ['email', 'Email subscribed'], ['repeat', 'Repeat buyers'], ['new', 'New (14d)'], ['lapsed', 'Lapsed 60d+']]
  return (
    <>
      {data && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 8, marginBottom: 12 }}>
        <Stat label="Customers (200 days)" value={data.stats.customers.toLocaleString()} />
        <Stat label="With phone" value={data.stats.withPhone.toLocaleString()} color={WA} />
        <Stat label="Email subscribed" value={data.stats.emailSub.toLocaleString()} color={T.blue} />
        <Stat label="Repeat buyers" value={data.stats.repeat.toLocaleString()} color={T.purple} />
        <Stat label="Action due" value={data.stats.due.toLocaleString()} color={T.amber} />
      </div>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, phone, city, brand, product…" style={{ padding: '7px 10px', fontSize: 12, border: `0.5px solid ${T.border}`, borderRadius: 6, minWidth: 260 }} />
        {F.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} style={btn(filter === k ? T.blue : T.surface, filter === k ? '#fff' : T.text)}>{l}</button>)}
        {data && <span style={{ fontSize: 11, color: T.textMuted }}>{data.total.toLocaleString()} shown</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: sel ? 'minmax(0,1.1fr) minmax(320px,1fr)' : '1fr', gap: 12, alignItems: 'start' }}>
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ color: T.textMuted, fontSize: 10, textTransform: 'uppercase' }}>{['Customer', 'Contact', 'Last order', 'Buys', 'Next action', 'LTV'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `0.5px solid ${T.border}` }}>{h}</th>)}</tr></thead>
            <tbody>{(data ? data.rows : []).map(r => (
              <tr key={r.id} onClick={() => setSel(r.id)} style={{ cursor: 'pointer', background: sel === r.id ? T.blueBg : 'transparent' }}>
                <td style={{ padding: '7px 10px', borderBottom: `0.5px solid ${T.borderLight}` }}><b>{r.name}</b>{r.paused && <> <Pill color={T.red} bg={T.redBg}>Paused</Pill></>}{r.issue && <> <Pill color={T.amber} bg={T.amberBg}>Issue</Pill></>}<div style={{ color: T.textMuted, fontSize: 11 }}>{r.city}{r.orders > 1 ? ' · ' + r.orders + ' orders' : ''}</div></td>
                <td style={{ padding: '7px 10px', borderBottom: `0.5px solid ${T.borderLight}` }}><div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>{r.emailSub && <Pill>Email</Pill>}{r.phone && <Pill color={WA} bg="#e3f3e8">{r.smsSub || r.waOk ? 'WhatsApp ✓' : 'Phone'}</Pill>}</div></td>
                <td style={{ padding: '7px 10px', borderBottom: `0.5px solid ${T.borderLight}`, whiteSpace: 'nowrap' }}>{fmtD(r.lastOrderAt)}<div style={{ color: T.textMuted, fontSize: 11 }}>{r.daysSinceOrder != null ? r.daysSinceOrder + ' days ago' : ''}</div></td>
                <td style={{ padding: '7px 10px', borderBottom: `0.5px solid ${T.borderLight}`, maxWidth: 220 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.lastItems.join(', ')}</div><div style={{ color: T.textMuted, fontSize: 11 }}>{r.brands.join(' · ')}</div></td>
                <td style={{ padding: '7px 10px', borderBottom: `0.5px solid ${T.borderLight}` }}>{r.next ? <><Pill color={r.next.blocked.length ? T.amber : T.green} bg={r.next.blocked.length ? T.amberBg : T.greenBg}>{r.next.flowName}</Pill></> : <span style={{ color: T.textHint }}>—</span>}</td>
                <td style={{ padding: '7px 10px', borderBottom: `0.5px solid ${T.borderLight}`, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{gbp(r.ltv)}</td>
              </tr>))}</tbody>
          </table>
          {data && data.rows.length === 0 && <div style={{ padding: 14, color: T.textMuted, fontSize: 12 }}>No customers match.</div>}
        </div>
        {sel && (
          <div style={{ ...card, position: 'sticky', top: 0 }}>
            {!detail || detail.loading ? <div style={{ color: T.textMuted }}>Loading…</div> : !detail.ok ? <div style={{ color: T.red }}>{detail.error}</div> : (() => { const c = detail.customer, st = detail.state; return (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div><div style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</div><div style={{ fontSize: 11, color: T.textMuted }}>{c.email}{c.phone ? ' · ' + c.phone : ''}{c.city ? ' · ' + c.city : ''}</div></div>
                  <button onClick={() => setSel(null)} style={btn(T.surface, T.textMuted)}>Close</button>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '8px 0' }}>
                  <Pill color={c.emailSub ? T.blue : T.textMuted} bg={c.emailSub ? T.blueBg : T.borderLight}>Email marketing {c.emailSub ? 'yes' : 'no'}</Pill>
                  <Pill color={c.smsSub || st.waOk ? WA : T.textMuted} bg={c.smsSub || st.waOk ? '#e3f3e8' : T.borderLight}>WhatsApp marketing {c.smsSub ? 'yes (Shopify)' : st.waOk ? 'yes (agreed to you)' : 'no'}</Pill>
                  {c.topType && <Pill color={T.purple} bg={T.purpleBg}>top: {c.topType}</Pill>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 10 }}>
                  <Stat label="Orders" value={c.orders.length} /><Stat label="Spent" value={gbp(c.ltv)} /><Stat label="Last order" value={c.daysSinceOrder != null ? c.daysSinceOrder + 'd ago' : '—'} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  <button onClick={() => setFlag({ paused: !st.paused })} style={btn(st.paused ? T.red : T.surface, st.paused ? '#fff' : T.text)}>{st.paused ? 'Paused: resume messages' : 'Pause all messages'}</button>
                  <button onClick={() => setFlag({ issue: !st.issue })} style={btn(st.issue ? T.amber : T.surface, st.issue ? '#fff' : T.text)}>{st.issue ? 'Issue open: mark resolved' : 'Open issue'}</button>
                  {!c.smsSub && c.phone && <button onClick={() => setFlag({ waOk: !st.waOk })} style={btn(st.waOk ? WA : T.surface, st.waOk ? '#fff' : T.text)}>{st.waOk ? 'WhatsApp marketing agreed ✓' : 'Customer agreed to WhatsApp offers'}</button>}
                  {c.phone && <a href={'https://wa.me/' + c.phone.replace(/\D/g, '').replace(/^0/, '44')} target="_blank" rel="noreferrer" style={btn(WA, '#fff')}>Open WhatsApp</a>}
                  <a href={'https://admin.shopify.com/store/cchairandbeauty/customers/' + short(c.id)} target="_blank" rel="noreferrer" style={btn(T.surface, T.text)}>Open in Shopify</a>
                </div>
                {detail.upcoming.length > 0 && <><H>Queued for this customer</H>{detail.upcoming.map(a => <ActionRow key={a.key} a={a} mark={markUp} />)}</>}
                <H sub="Orders, dispatches and every message you've marked as sent">Timeline</H>
                <div style={{ borderLeft: `2px solid ${T.borderLight}`, paddingLeft: 10, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                  {detail.timeline.map((t, i) => <div key={i} style={{ fontSize: 12 }}><span style={{ color: T.textMuted, fontSize: 11, marginRight: 6 }}>{fmtD(t.ts)}</span><span style={{ color: t.kind === 'msg' ? T.blue : T.text }}>{t.text}</span></div>)}
                </div>
                {c.cats.length > 0 && <><H>Buys</H><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{c.cats.map(x => <Pill key={x.key} color={T.text} bg={T.borderLight}>{x.name} · {fmtD(x.last)}</Pill>)}</div></>}
              </>) })()}
          </div>
        )}
      </div>
    </>
  )
}

// ---------------- FLOWS ----------------
function Flows({ settings, setSettings }) {
  if (!settings) return <Empty>Loading…</Empty>
  const { flows, settings: S } = settings
  async function toggle(k) { const next = { flows: { [k]: !S.flows[k] } }; const d = await post('settings', next); setSettings(s => ({ ...s, settings: d.settings })) }
  return (
    <>
      <div style={{ ...card, marginBottom: 12, fontSize: 12, color: T.textMuted }}>One connected journey. <b>Shopify Email</b> runs the welcome and abandonment emails (switch them on in Shopify → Marketing → Automations). <b>The CRM</b> queues everything Shopify can't do and stops a flow the moment the customer buys. Marketing messages respect email/WhatsApp consent, a cap of {S.weeklyCap} a week, and a {S.postDeliveryQuietHours}-hour quiet period after delivery.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 10 }}>
        {flows.map(f => (
          <div key={f.key} style={{ ...card, opacity: S.flows[f.key] === false ? .55 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}><span style={{ color: T.textMuted, fontWeight: 400, marginRight: 6 }}>{String(f.n).padStart(2, '0')}</span>{f.name}</div>
              <label style={{ fontSize: 11, display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={S.flows[f.key] !== false} onChange={() => toggle(f.key)} /> On</label>
            </div>
            <div style={{ display: 'flex', gap: 4, margin: '6px 0', flexWrap: 'wrap' }}>
              <Pill color={f.owner === 'crm' ? T.purple : T.green} bg={f.owner === 'crm' ? T.purpleBg : T.greenBg}>{f.owner === 'crm' ? 'CRM queue' : 'Shopify Email'}</Pill>
              {f.channels.map(c => <Pill key={c} color={c === 'whatsapp' ? WA : T.blue} bg={c === 'whatsapp' ? '#e3f3e8' : T.blueBg}>{c === 'whatsapp' ? 'WhatsApp' : 'Email'}</Pill>)}
            </div>
            <div style={{ fontSize: 11, color: T.textMuted }}><b>Trigger:</b> {f.trigger}</div>
            <ol style={{ fontSize: 11, paddingLeft: 16, margin: '6px 0' }}>{f.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            <div style={{ fontSize: 11, color: T.textMuted, borderTop: `0.5px dashed ${T.border}`, paddingTop: 6 }}>Exit: {f.exit}{f.note ? ' · ' + f.note : ''}</div>
            {f.shopify && <a href="https://admin.shopify.com/store/cchairandbeauty/marketing/automations" target="_blank" rel="noreferrer" style={{ ...btn(T.surface, T.text), marginTop: 8 }}>{f.shopify} ↗</a>}
          </div>
        ))}
      </div>
      <div style={{ ...card, marginTop: 12 }}>
        <H>How a customer moves through it</H>
        <pre style={{ fontSize: 11, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: T.text, margin: 0 }}>{`Subscribes          → Welcome (Shopify Email)
Views a product     → Browse abandonment (Shopify Email)
Adds to basket      → stop Browse · Abandoned cart (Shopify Email)
Starts checkout     → stop Cart · Abandoned checkout (Shopify Email) · WhatsApp next day (CRM)
Pays                → stop all abandonment · Order confirmation on WhatsApp (CRM)
Dispatched          → Shipping confirmation (Shopify email + CRM WhatsApp)
+3 days             → Delivered check-in · 48h quiet period
+6 days             → Review request (unless refund / open issue) · one reminder at +13
+10 days            → Complete your routine
Category window     → Reorder: email, WhatsApp +3d, final +7d (skipped if repurchased)
New product arrives → Suggestions tab: tag brand buyers, send via Shopify Email
Stops buying        → 60 / 90 / 180-day win-back · any purchase exits`}</pre>
      </div>
    </>
  )
}

// ---------------- WHATSAPP / EMAIL ----------------
function Channel({ Q, channel }) {
  const { q, err, mark } = Q
  const [flow, setFlow] = useState('')
  if (err) return <Empty>{err}</Empty>
  if (!q) return <Empty>Loading…</Empty>
  const all = q.actions.filter(a => a.channel === channel)
  const flows = [...new Set(all.map(a => a.flowName))]
  const list = all.filter(a => !flow || a.flowName === flow)
  return (
    <>
      <div style={{ ...card, marginBottom: 10, fontSize: 12, color: T.textMuted }}>
        {channel === 'whatsapp'
          ? <>Only people with a phone number appear here. <b>Open WhatsApp</b> opens WhatsApp Desktop (or Web) with the message typed in; you read it, press send, then mark it <b>Sent</b>. Marketing messages need WhatsApp/SMS consent; service messages (order, dispatch, delivery) don't. Send at a human pace: this is your own number.</>
          : <>These are 1-to-1 emails. <b>Open email draft</b> opens Gmail with the plain-text version ready to send; <b>Open branded HTML</b> gives you the designed version to paste. Newsletters and campaigns go through Shopify Email instead (Newsletter tab). Automatic sending can be added later with AWS SES.</>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <button onClick={() => setFlow('')} style={btn(!flow ? T.blue : T.surface, !flow ? '#fff' : T.text)}>All ({all.length})</button>
        {flows.map(f => <button key={f} onClick={() => setFlow(f)} style={btn(flow === f ? T.blue : T.surface, flow === f ? '#fff' : T.text)}>{f} ({all.filter(a => a.flowName === f).length})</button>)}
      </div>
      <div style={card}>{list.length ? list.map(a => <ActionRow key={a.key} a={a} mark={mark} />) : <span style={{ color: T.textMuted, fontSize: 12 }}>Nothing waiting. Nice.</span>}</div>
    </>
  )
}

// ---------------- NEWSLETTER ----------------
function Newsletter() {
  const [meta, setMeta] = useState(null); const [day, setDay] = useState(''); const [aud, setAud] = useState('uk'); const [app, setApp] = useState(true); const [offer, setOffer] = useState(false); const [offerText, setOfferText] = useState('free UK delivery on every order')
  const [out, setOut] = useState(null); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('')
  useEffect(() => { api('newsletter').then(m => { setMeta(m); setDay(m.today) }) }, [])
  async function build() { setBusy(true); setMsg(''); const d = await api('newsletter?day=' + day + '&aud=' + aud + '&app=' + (app ? 1 : 0) + '&offer=' + (offer ? 1 : 0) + '&offerText=' + encodeURIComponent(offerText)); setOut(d); setBusy(false) }
  useEffect(() => { if (day) build() }, [day, aud, app, offer]) // eslint-disable-line
  function copy(t, label) { navigator.clipboard.writeText(t).then(() => setMsg(label + ' copied'), () => setMsg('Copy failed: select the text in the box below')) }
  if (!meta) return <Empty>Loading…</Empty>
  const D = meta.days.find(d => d.key === day)
  return (
    <>
      <div style={{ ...card, marginBottom: 10 }}>
        <H sub="Tonight's is picked. Products are checked live against stock and price before the HTML is built.">1 · Choose the email</H>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{meta.days.map(d => <button key={d.key} onClick={() => setDay(d.key)} style={btn(day === d.key ? T.blue : T.surface, day === d.key ? '#fff' : T.text, { textAlign: 'left' })}><div style={{ fontSize: 10, opacity: .8 }}>{d.d}{d.key === meta.today ? ' · tonight' : ''}</div>{d.theme}</button>)}</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginTop: 10, fontSize: 12 }}>
          <span><b>2 · Who it's for</b></span>
          <button onClick={() => setAud('local')} style={btn(aud === 'local' ? T.text : T.surface, aud === 'local' ? '#fff' : T.text)}>Leeds &amp; West Yorkshire</button>
          <button onClick={() => setAud('uk')} style={btn(aud === 'uk' ? T.text : T.surface, aud === 'uk' ? '#fff' : T.text)}>Rest of UK</button>
          <label><input type="checkbox" checked={app} onChange={e => setApp(e.target.checked)} /> App strip</label>
          <label><input type="checkbox" checked={offer} onChange={e => setOffer(e.target.checked)} /> Offer banner</label>
          {offer && <input value={offerText} onChange={e => setOfferText(e.target.value)} onBlur={build} style={{ padding: '5px 8px', fontSize: 12, border: `0.5px solid ${T.border}`, borderRadius: 6, width: 260 }} />}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)', gap: 12, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {out && out.ok && <>
            <div style={{ ...card, background: T.blueBg, borderColor: T.blueBorder }}><div style={{ fontSize: 10, textTransform: 'uppercase', color: T.textMuted, fontWeight: 600 }}>Send to (Shopify Email → To)</div><div style={{ fontSize: 13, fontWeight: 700 }}>{out.segment}</div><div style={{ fontSize: 11, color: T.textMuted }}>Schedule for 6pm. Do the other audience as a duplicate.</div></div>
            <div style={card}><H>Subject lines</H>{out.subjects.map((s, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderTop: i ? `0.5px solid ${T.borderLight}` : 0, fontSize: 12 }}><span>{s}</span><button onClick={() => copy(s + '\n' + out.preview, 'Subject + preview')} style={btn(T.surface, T.text)}>Copy</button></div>)}<div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>Preview text: {out.preview}</div></div>
            <div style={card}><H sub="Checked live just now">Tonight's four products</H>{out.products.map((p, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, padding: '5px 0', borderTop: i ? `0.5px solid ${T.borderLight}` : 0 }}><span>{p.name}<div style={{ fontSize: 11, color: T.textMuted }}>{p.blurb}</div></span><span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{p.price}<div>{p.ok ? <Pill color={T.green} bg={T.greenBg}>{p.stock} in stock</Pill> : <Pill color={T.red} bg={T.redBg}>{p.status === 'missing' ? 'not found' : p.stock != null && p.stock < 3 ? 'low stock: ' + p.stock : p.status.toLowerCase()}</Pill>}</div></span></div>)}
              {out.swaps.length > 0 && <div style={{ fontSize: 11, color: T.red, marginTop: 6 }}>Swap before sending: {out.swaps.join(', ')}. Ask Claude for a replacement from the same brand.</div>}</div>
            {D && <div style={card}><H>Why this theme</H><div style={{ fontSize: 12, color: T.textMuted }}>{D.why}</div></div>}
          </>}
          {out && !out.ok && <div style={{ ...card, color: T.red }}>{out.error}</div>}
          <div style={card}><H>How to send (10 minutes)</H><ol style={{ fontSize: 12, paddingLeft: 16, margin: 0, lineHeight: 1.6 }}><li>Press <b>Copy email HTML</b>.</li><li>Shopify admin → Marketing → Create campaign → Shopify Email → scroll to <b>Code your own</b>.</li><li>Delete what's there, paste. Check the logo, four products and the Unsubscribe link show.</li><li>Paste the subject and preview text.</li><li><b>To:</b> the segment shown above. Send yourself a test.</li><li>Review → Schedule → today 6:00pm.</li><li>Duplicate it, switch audience here, copy again, change <b>To</b>, schedule.</li></ol></div>
        </div>
        <div style={{ position: 'sticky', top: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
            <button disabled={!out || !out.ok} onClick={() => copy(out.html, 'Email HTML')} style={btn('#C2312B', '#fff')}>Copy email HTML</button>
            <button onClick={build} style={btn(T.surface, T.text)}>{busy ? 'Checking stock…' : 'Rebuild'}</button>
            <span style={{ fontSize: 11, color: T.green }}>{msg}</span>
          </div>
          <iframe title="Newsletter preview" srcDoc={out && out.ok ? out.html.replace('{{ open_tracking_block }}', '').replace('{{ unsubscribe_url }}', '#') : '<p style="font-family:sans-serif;padding:20px;color:#666">Building…</p>'} style={{ width: '100%', height: 760, border: `0.5px solid ${T.border}`, borderRadius: 8, background: '#EEF2FB' }} />
          {out && out.ok && <textarea readOnly value={out.html} style={{ width: '100%', height: 80, fontSize: 10, marginTop: 6, border: `0.5px solid ${T.border}`, borderRadius: 6, fontFamily: 'monospace' }} onFocus={e => e.target.select()} />}
        </div>
      </div>
      <div style={{ ...card, marginTop: 12 }}>
        <H sub="Created in your Shopify admin (Customers → Segments)">Segments</H>
        <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}><tbody>{meta.segments.map((s, i) => <tr key={i}><td style={{ padding: '5px 8px', borderBottom: `0.5px solid ${T.borderLight}`, fontWeight: 600, whiteSpace: 'nowrap' }}>{s[0]}</td><td style={{ padding: '5px 8px', borderBottom: `0.5px solid ${T.borderLight}`, textAlign: 'right', whiteSpace: 'nowrap' }}>{s[1]}</td><td style={{ padding: '5px 8px', borderBottom: `0.5px solid ${T.borderLight}`, color: T.textMuted }}>{s[2]}</td></tr>)}</tbody></table></div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>Counts as of 13 Oct. One-off emails (Our story, App launch, Still with us?) are still in the CC Newsletter Maker page.</div>
      </div>
    </>
  )
}

// ---------------- REORDERS ----------------
function Reorders({ settings }) {
  const [d, setD] = useState(null)
  useEffect(() => { api('reorders').then(setD) }, [])
  if (!d) return <Empty>Loading…</Empty>
  if (!d.ok) return <Empty>No data yet. Run the first sync from Settings.</Empty>
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8, marginBottom: 12 }}>
        <Stat label="Due now" value={d.due} color={T.amber} /><Stat label="In the next 10 days" value={d.rows.filter(r => !r.due).length} /><Stat label="Tracked pairs" value={d.rows.length} />
      </div>
      <div style={{ ...card, padding: 0, overflowX: 'auto', marginBottom: 12 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead><tr style={{ color: T.textMuted, fontSize: 10, textTransform: 'uppercase' }}>{['Customer', 'Product', 'Category', 'Bought', 'Day', 'Window', 'Progress', 'Step'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `0.5px solid ${T.border}` }}>{h}</th>)}</tr></thead>
          <tbody>{d.rows.slice(0, 300).map((r, i) => <tr key={i}>
            <td style={{ padding: '6px 10px', borderBottom: `0.5px solid ${T.borderLight}` }}><b>{r.name}</b><div style={{ display: 'flex', gap: 3 }}>{r.emailSub && <Pill>Email</Pill>}{r.phone && <Pill color={WA} bg="#e3f3e8">{r.smsSub ? 'WhatsApp ✓' : 'Phone'}</Pill>}</div></td>
            <td style={{ padding: '6px 10px', borderBottom: `0.5px solid ${T.borderLight}`, maxWidth: 240 }}>{r.product}</td>
            <td style={{ padding: '6px 10px', borderBottom: `0.5px solid ${T.borderLight}`, whiteSpace: 'nowrap' }}>{r.catName}</td>
            <td style={{ padding: '6px 10px', borderBottom: `0.5px solid ${T.borderLight}`, whiteSpace: 'nowrap' }}>{fmtD(r.boughtAt)}</td>
            <td style={{ padding: '6px 10px', borderBottom: `0.5px solid ${T.borderLight}`, fontVariantNumeric: 'tabular-nums' }}>{r.days}</td>
            <td style={{ padding: '6px 10px', borderBottom: `0.5px solid ${T.borderLight}`, whiteSpace: 'nowrap' }}>{r.window}–{r.max} days</td>
            <td style={{ padding: '6px 10px', borderBottom: `0.5px solid ${T.borderLight}`, minWidth: 90 }}><div style={{ height: 6, background: T.borderLight, borderRadius: 99, overflow: 'hidden' }}><div style={{ width: Math.min(100, r.days / r.max * 100) + '%', height: '100%', background: r.days > r.max ? T.red : r.due ? T.amber : T.blue }} /></div></td>
            <td style={{ padding: '6px 10px', borderBottom: `0.5px solid ${T.borderLight}`, whiteSpace: 'nowrap' }}><Pill color={r.due ? T.amber : T.textMuted} bg={r.due ? T.amberBg : T.borderLight}>{r.step}</Pill></td>
          </tr>)}</tbody>
        </table>
      </div>
      {settings && <div style={card}><H sub="Change them in Settings. Later we can replace these with each customer's real repeat interval.">Reorder windows by category</H>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{settings.categories.filter(c => c.reorder).map(c => <Pill key={c.key} color={T.text} bg={T.borderLight}>{c.name}: {settings.settings.reorderDays[c.key] || c.reorder[0]} days</Pill>)}</div></div>}
    </>
  )
}

// ---------------- SUGGESTIONS ----------------
function Suggestions() {
  const [d, setD] = useState(null); const [msg, setMsg] = useState({})
  useEffect(() => { api('suggest').then(setD) }, [])
  async function tag(p) { setMsg(m => ({ ...m, [p.id]: 'Tagging…' })); const r = await post('suggest', { tag: p.tag, customerIds: p.customerIds }); setMsg(m => ({ ...m, [p.id]: r.ok ? 'Tagged ' + r.tagged + '. Segment query copied: ' + r.segmentQuery : r.error })); if (r.ok && navigator.clipboard) navigator.clipboard.writeText(r.segmentQuery) }
  if (!d) return <Empty>Loading…</Empty>
  if (!d.ok) return <Empty>{d.error}</Empty>
  return (
    <>
      <div style={card}>
        <H sub="Active products added in the last 3 weeks with stock, matched to customers who have bought that brand in the last 200 days. Tag them, then make a Shopify segment from the query and send a Shopify Email to it.">New arrivals → who to tell</H>
        <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead><tr style={{ color: T.textMuted, fontSize: 10, textTransform: 'uppercase' }}>{['Product', 'Brand', 'Stock', 'Brand buyers', 'Subscribed', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: `0.5px solid ${T.border}` }}>{h}</th>)}</tr></thead>
          <tbody>{d.newProducts.map(p => <tr key={p.id}>
            <td style={{ padding: '6px 8px', borderBottom: `0.5px solid ${T.borderLight}` }}><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{p.image && <img src={p.image + (p.image.includes('?') ? '&' : '?') + 'width=60'} alt="" style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 4 }} />}<span><a href={'https://cchairandbeauty.com/products/' + p.handle} target="_blank" rel="noreferrer" style={{ color: T.blue }}>{p.title}</a><div style={{ fontSize: 11, color: T.textMuted }}>{p.type} · {p.price != null ? gbp(p.price) : ''} · added {fmtD(p.createdAt)}</div></span></div></td>
            <td style={{ padding: '6px 8px', borderBottom: `0.5px solid ${T.borderLight}` }}>{p.vendor}</td>
            <td style={{ padding: '6px 8px', borderBottom: `0.5px solid ${T.borderLight}` }}>{p.stock}</td>
            <td style={{ padding: '6px 8px', borderBottom: `0.5px solid ${T.borderLight}` }}>{p.buyers}</td>
            <td style={{ padding: '6px 8px', borderBottom: `0.5px solid ${T.borderLight}` }}>{p.subscribed}</td>
            <td style={{ padding: '6px 8px', borderBottom: `0.5px solid ${T.borderLight}` }}>{p.subscribed > 0 ? <button onClick={() => tag(p)} style={btn(T.blue, '#fff')}>Tag {p.subscribed} in Shopify</button> : <span style={{ color: T.textHint }}>no subscribed buyers</span>}<div style={{ fontSize: 10, color: T.textMuted, maxWidth: 260 }}>{msg[p.id]}</div></td>
          </tr>)}</tbody></table></div>
        {d.newProducts.length === 0 && <div style={{ fontSize: 12, color: T.textMuted }}>No new products with stock in the last three weeks.</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10, marginTop: 12 }}>
        {d.cross.map(c => <div key={c.key} style={card}><div style={{ fontSize: 13, fontWeight: 700 }}>Bought: {c.name}</div><div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>{c.customers} customers · {c.recent} in the last 30 days</div><div style={{ fontSize: 11, fontWeight: 600, color: T.blue }}>{c.title}</div><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>{c.items.map(i => <Pill key={i} color={T.text} bg={T.borderLight}>{i}</Pill>)}</div></div>)}
      </div>
      <div style={{ ...card, marginTop: 12 }}><H>Brands your customers buy most (last 200 days)</H><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{d.topBrands.map(b => <Pill key={b.brand} color={T.text} bg={T.borderLight}>{b.brand} · {b.customers} ({b.subscribed} subscribed)</Pill>)}</div></div>
    </>
  )
}

// ---------------- SETTINGS ----------------
function Settings({ settings, setSettings }) {
  const [status, setStatus] = useState(null); const [log, setLog] = useState([]); const [busy, setBusy] = useState(false)
  const refresh = () => api('status').then(setStatus)
  useEffect(() => { refresh() }, [])
  async function run(full) {
    setBusy(true); setLog(l => [(full ? 'Starting full rebuild…' : 'Syncing…'), ...l])
    const r = await api('sync' + (full ? '?full=1' : ''))
    setLog(l => [...(r.notes || [r.error || JSON.stringify(r)]), ...l]); setBusy(false); refresh()
  }
  async function save(part) { const d = await post('settings', part); setSettings(s => ({ ...s, settings: d.settings })) }
  if (!settings) return <Empty>Loading…</Empty>
  const S = settings.settings
  const Row = ({ label, children }) => <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 10, alignItems: 'center', padding: '6px 0', borderTop: `0.5px solid ${T.borderLight}`, fontSize: 12 }}><div style={{ color: T.textMuted }}>{label}</div><div>{children}</div></div>
  const inp = (v, on, w) => <input defaultValue={v} onBlur={e => on(e.target.value)} style={{ padding: '5px 8px', fontSize: 12, border: `0.5px solid ${T.border}`, borderRadius: 6, width: w || 220 }} />
  const ok = b => <Pill color={b ? T.green : T.red} bg={b ? T.greenBg : T.redBg}>{b ? 'Connected' : 'Missing'}</Pill>
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 10, marginBottom: 12 }}>
        <div style={card}>
          <H>Data</H>
          {status ? <>
            <Row label="Shopify">{ok(status.shopify)} {status.scopes && <span style={{ fontSize: 10, color: T.textMuted }}>{status.scopes.filter(s => /customer|order|product/.test(s)).join(', ')}</span>}</Row>
            <Row label="CRM storage (Vercel Blob)">{ok(status.blob)}</Row>
            <Row label="Claude">{ok(status.claude)}</Row>
            <Row label="AWS SES (auto emails)">{ok(status.ses)} <span style={{ fontSize: 10, color: T.textMuted }}>optional</span></Row>
            <Row label="Snapshot">{status.snapshot ? <>{status.snapshot.counts && status.snapshot.counts.orders} orders · {status.snapshot.counts && status.snapshot.counts.customers} customers · updated {fmtDT(status.snapshot.updatedAt)}</> : <span style={{ color: T.amber }}>Not built yet</span>}</Row>
            <Row label="Export in progress">{status.sync && status.sync.bulkId ? <span style={{ color: T.amber }}>Yes, started {fmtDT(status.sync.bulkStartedAt)} — press Sync now to check</span> : 'No'}</Row>
            <Row label="Sent this month">{status.thisMonth ? status.thisMonth.sent + ' (' + Object.entries(status.thisMonth.byChannel || {}).map(([k, v]) => k + ' ' + v).join(', ') + ')' : '—'}</Row>
          </> : <div style={{ color: T.textMuted, fontSize: 12 }}>Checking…</div>}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            <button disabled={busy} onClick={() => run(false)} style={btn(T.blue, '#fff')}>{status && !status.snapshot ? 'Run first sync' : 'Sync now'}</button>
            <button disabled={busy} onClick={() => run(true)} style={btn(T.surface, T.text)}>Full rebuild (200 days)</button>
            <span style={{ fontSize: 11, color: T.textMuted }}>Runs itself every hour. The first build is a Shopify export that takes a few minutes: press <b>Sync now</b> again until it lands.</span>
          </div>
          {log.length > 0 && <pre style={{ fontSize: 11, background: T.bg, padding: 8, borderRadius: 6, marginTop: 8, maxHeight: 140, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{log.join('\n')}</pre>}
        </div>
        <div style={card}>
          <H>Rules</H>
          <Row label="Send only between (UK)">{inp(S.quietStart, v => save({ quietStart: +v }), 50)} and {inp(S.quietEnd, v => save({ quietEnd: +v }), 50)} o'clock</Row>
          <Row label="Marketing cap per person">{inp(S.weeklyCap, v => save({ weeklyCap: +v }), 50)} per 7 days</Row>
          <Row label="Quiet after delivery">{inp(S.postDeliveryQuietHours, v => save({ postDeliveryQuietHours: +v }), 50)} hours</Row>
          <Row label="WhatsApp marketing needs">
            <select defaultValue={S.whatsappConsent} onChange={e => save({ whatsappConsent: e.target.value })} style={{ padding: '5px 8px', fontSize: 12, border: `0.5px solid ${T.border}`, borderRadius: 6 }}>
              <option value="sms">SMS/WhatsApp consent in Shopify, or marked "agreed" on the customer</option>
              <option value="any">Any phone number (not recommended under PECR)</option>
            </select></Row>
          <Row label="Orders looked at">{inp(S.lookbackDays, v => save({ lookbackDays: +v }), 60)} days</Row>
        </div>
        <div style={card}>
          <H sub="Used in every email and WhatsApp message">Store details</H>
          <Row label="Phone">{inp(S.store.phone, v => save({ store: { phone: v } }))}</Row>
          <Row label="Free delivery over (£)">{inp(S.store.freeDelivery, v => save({ store: { freeDelivery: v } }), 80)}</Row>
          <Row label="Google rating / reviews">{inp(S.store.rating, v => save({ store: { rating: v } }), 60)} {inp(S.store.count, v => save({ store: { count: v } }), 70)}</Row>
          <Row label="Google review link">{inp(S.store.reviewUrl, v => save({ store: { reviewUrl: v } }), 300)}</Row>
          <Row label="App Store link">{inp(S.store.ios, v => save({ store: { ios: v } }), 300)}</Row>
          <Row label="Google Play link">{inp(S.store.android, v => save({ store: { android: v } }), 300)}</Row>
          <Row label="App-only offer">{inp(S.store.appOffer, v => save({ store: { appOffer: v } }), 300)}</Row>
          <Row label="Support email">{inp(S.store.supportEmail, v => save({ store: { supportEmail: v } }), 260)}</Row>
        </div>
        <div style={card}>
          <H sub="First reminder, in days after purchase">Reorder windows</H>
          {settings.categories.filter(c => c.reorder).map(c => <Row key={c.key} label={c.name}>{inp(S.reorderDays[c.key] || c.reorder[0], v => save({ reorderDays: { [c.key]: +v } }), 60)} <span style={{ color: T.textHint, fontSize: 11 }}>typical {c.reorder[0]}–{c.reorder[1]}</span></Row>)}
        </div>
      </div>
    </>
  )
}

export default function CRM() {
  const router = useRouter()
  const [tab, setTab] = useState('Today')
  const [settings, setSettings] = useState(null)
  const Q = useQueue()
  useEffect(() => { const h = (router.asPath.split('#')[1] || ''); const t = TABS.find(x => x.toLowerCase() === h.toLowerCase()); if (t) setTab(t) }, [router.asPath])
  useEffect(() => { api('settings').then(setSettings) }, [])
  const counts = useMemo(() => Q.q && Q.q.ok ? { WhatsApp: Q.q.actions.filter(a => a.channel === 'whatsapp').length, Email: Q.q.actions.filter(a => a.channel === 'email').length, Today: Q.q.actions.length } : {}, [Q.q])
  return (
    <>
      <Head><title>CRM — CC Intelligence</title></Head>
      <Shell title="Customer flows" subtitle="Live from Shopify: today's messages, every customer, the 12 flows, WhatsApp, email and the nightly newsletter">
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.border}`, marginBottom: 14, overflowX: 'auto' }}>
          {TABS.map(t => <button key={t} onClick={() => { setTab(t); router.replace('/crm#' + t.toLowerCase(), undefined, { shallow: true }) }} style={{ padding: '7px 14px', fontSize: 12, fontWeight: tab === t ? 600 : 400, color: tab === t ? T.blue : T.textMuted, background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${T.blue}` : '2px solid transparent', whiteSpace: 'nowrap' }}>{t}{counts[t] ? <span style={{ marginLeft: 5, fontSize: 10, background: T.blueBg, color: T.blue, borderRadius: 99, padding: '0 6px' }}>{counts[t]}</span> : null}</button>)}
        </div>
        {tab === 'Today' && <Today Q={Q} />}
        {tab === 'Customers' && <Customers />}
        {tab === 'Flows' && <Flows settings={settings} setSettings={setSettings} />}
        {tab === 'WhatsApp' && <Channel Q={Q} channel="whatsapp" />}
        {tab === 'Email' && <Channel Q={Q} channel="email" />}
        {tab === 'Newsletter' && <Newsletter />}
        {tab === 'Reorders' && <Reorders settings={settings} />}
        {tab === 'Suggestions' && <Suggestions />}
        {tab === 'Settings' && <Settings settings={settings} setSettings={setSettings} />}
      </Shell>
    </>
  )
}
