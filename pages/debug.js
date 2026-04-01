import Head from 'next/head'
import { useState, useEffect } from 'react'

const s = {
  page:    { background: '#0f1117', minHeight: '100vh', color: '#e8eaf0', fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24 },
  header:  { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 },
  logo:    { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' },
  title:   { fontSize: 22, fontWeight: 800 },
  sub:     { color: '#8b90a7', fontSize: 13, marginTop: 2 },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 24 },
  card:    { background: '#1a1d27', border: '1px solid #2e3347', borderRadius: 14, padding: 20 },
  cardOk:  { background: '#1a1d27', border: '1px solid #22c55e40', borderRadius: 14, padding: 20 },
  cardErr: { background: '#1a1d27', border: '1px solid #ef444440', borderRadius: 14, padding: 20 },
  cardWarn:{ background: '#1a1d27', border: '1px solid #f59e0b40', borderRadius: 14, padding: 20 },
  dot:     (c) => ({ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: '0 0 8px ' + c, flexShrink: 0 }),
  badge:   (c) => ({ background: c + '20', color: c, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }),
  btn:     { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
  btnSm:   { padding: '6px 12px', borderRadius: 6, border: '1px solid #2e3347', background: '#22263a', color: '#e8eaf0', fontSize: 12, cursor: 'pointer' },
  row:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2e3347' },
  label:   { color: '#8b90a7', fontSize: 12 },
  val:     { color: '#e8eaf0', fontSize: 12, fontWeight: 600, fontFamily: 'monospace' },
  section: { fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555b75', marginBottom: 12, marginTop: 24 },
  logBox:  { background: '#0a0c12', border: '1px solid #2e3347', borderRadius: 8, padding: 14, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7, maxHeight: 300, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
}

function StatusDot({ ok, warn }) {
  const c = ok ? '#22c55e' : warn ? '#f59e0b' : '#ef4444'
  return <div style={s.dot(c)} />
}

function CheckCard({ name, data, loading }) {
  if (loading) return (
    <div style={s.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2e3347', animation: 'pulse 1s infinite' }} />
        <span style={{ fontWeight: 700, fontSize: 15 }}>{name}</span>
      </div>
      <div style={{ color: '#555b75', fontSize: 13 }}>Running check...</div>
    </div>
  )

  if (!data) return null
  const isWarn = data.knownIssue || data.external
  const cardStyle = data.ok ? s.cardOk : isWarn ? s.cardWarn : s.cardErr

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusDot ok={data.ok} warn={isWarn} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>{data.name || name}</span>
        </div>
        <span style={s.badge(data.ok ? '#22c55e' : isWarn ? '#f59e0b' : '#ef4444')}>
          {data.ok ? 'OK' : isWarn ? 'WARNING' : 'FAIL'}
        </span>
      </div>
      <p style={{ color: '#8b90a7', fontSize: 13, marginBottom: data.ms ? 8 : 0, lineHeight: 1.5 }}>{data.message}</p>
      {data.ms && <div style={{ color: '#555b75', fontSize: 12 }}>Response time: {data.ms}ms</div>}
      {data.count !== undefined && <div style={{ color: '#22c55e', fontSize: 12, marginTop: 4 }}>Products: {data.count?.toLocaleString()}</div>}
      {data.model && <div style={{ color: '#555b75', fontSize: 12, marginTop: 4, fontFamily: 'monospace' }}>Model: {data.model}</div>}
    </div>
  )
}

function EnvCard({ vars }) {
  if (!vars) return null
  return (
    <div style={s.card}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Environment Variables</div>
      {Object.entries(vars).map(([key, v]) => (
        <div key={key} style={s.row}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: v.present ? '#e8eaf0' : '#ef4444' }}>{key}</div>
            <div style={{ fontSize: 11, color: '#555b75', marginTop: 1 }}>{v.present ? v.length + ' chars · ' + v.preview : 'NOT SET'}</div>
          </div>
          <span style={s.badge(v.present ? '#22c55e' : '#ef4444')}>{v.present ? 'SET' : 'MISSING'}</span>
        </div>
      ))}
    </div>
  )
}

export default function DebugPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState([])
  const [lastRun, setLastRun] = useState(null)

  function addLog(msg, type = 'info') {
    const time = new Date().toLocaleTimeString('en-GB')
    setLog(p => [...p, { time, msg, type }])
  }

  async function runChecks() {
    setLoading(true)
    setData(null)
    setLog([])
    addLog('Starting system check...', 'info')
    addLog('Testing Anthropic Claude API...', 'info')
    addLog('Testing Shopify Admin API...', 'info')
    addLog('Testing Google Places API...', 'info')
    addLog('Checking all environment variables...', 'info')

    try {
      const res = await fetch('/api/system-check')
      const result = await res.json()
      setData(result)
      setLastRun(new Date().toLocaleTimeString('en-GB'))

      addLog('─────────────────────────────', 'sep')
      addLog('System check complete in ' + result.totalMs + 'ms', 'info')
      addLog('Overall status: ' + result.overallStatus, result.overallStatus === 'ALL_OK' ? 'ok' : 'warn')
      addLog('─────────────────────────────', 'sep')

      Object.entries(result.checks).forEach(([key, check]) => {
        const icon = check.ok ? '✅' : check.knownIssue || check.external ? '⚠️' : '❌'
        addLog(icon + ' ' + check.name + ': ' + check.message, check.ok ? 'ok' : 'warn')
      })

      addLog('─────────────────────────────', 'sep')
      const envMissing = Object.entries(result.envVars).filter(([,v]) => !v.present).map(([k]) => k)
      if (envMissing.length === 0) {
        addLog('✅ All ' + Object.keys(result.envVars).length + ' environment variables set', 'ok')
      } else {
        addLog('❌ Missing env vars: ' + envMissing.join(', '), 'error')
      }
    } catch (e) {
      addLog('❌ System check failed: ' + e.message, 'error')
    }

    setLoading(false)
  }

  useEffect(() => { runChecks() }, [])

  const logColors = { ok: '#22c55e', warn: '#f59e0b', error: '#ef4444', info: '#8b90a7', sep: '#2e3347' }

  return (
    <>
      <Head>
        <title>System Debug — CC Intelligence Platform</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #0f1117; }`}</style>
      </Head>
      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logo}>CC</div>
          <div>
            <div style={s.title}>System Debug &amp; API Health Check</div>
            <div style={s.sub}>CC Hair &amp; Beauty Intelligence Platform · cc-platform-two.vercel.app</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            {lastRun && <span style={{ color: '#555b75', fontSize: 12 }}>Last run: {lastRun}</span>}
            <button style={s.btn} onClick={runChecks} disabled={loading}>
              {loading ? '⟳ Running...' : '↺ Run checks'}
            </button>
            <a href="/" style={{ ...s.btnSm, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>← Dashboard</a>
          </div>
        </div>

        {/* Overall status banner */}
        {data && (
          <div style={{
            background: data.overallStatus === 'ALL_OK' ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
            border: '1px solid ' + (data.overallStatus === 'ALL_OK' ? '#22c55e40' : '#f59e0b40'),
            borderRadius: 12, padding: '14px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontSize: 28 }}>{data.overallStatus === 'ALL_OK' ? '✅' : '⚠️'}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: data.overallStatus === 'ALL_OK' ? '#22c55e' : '#f59e0b' }}>
                {data.overallStatus === 'ALL_OK' ? 'All systems operational' : 'Some issues detected'}
              </div>
              <div style={{ color: '#8b90a7', fontSize: 13 }}>
                Checked {Object.keys(data.checks).length} services in {data.totalMs}ms · {data.timestamp}
              </div>
            </div>
          </div>
        )}

        {/* API Checks */}
        <div style={s.section}>API Connection Checks</div>
        <div style={s.grid}>
          {['anthropic','shopify','shopifyProducts','googlePlaces','googleOAuth','googleAds','whatsapp'].map(key => (
            <CheckCard key={key} name={key} data={data?.checks?.[key]} loading={loading} />
          ))}
          <EnvCard vars={data?.envVars} />
        </div>

        {/* Quick fixes */}
        {data && (
          <>
            <div style={s.section}>Quick Actions</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              <a href="https://vercel.com/mohammed-adris-projects/cc-platform/settings/environment-variables" target="_blank" rel="noreferrer" style={{ ...s.btnSm, textDecoration: 'none' }}>⚙️ Vercel Env Vars</a>
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ ...s.btnSm, textDecoration: 'none' }}>🤖 Anthropic Console</a>
              <a href={'https://' + (process.env.SHOPIFY_STORE || 'cchairandbeauty.myshopify.com') + '/admin'} target="_blank" rel="noreferrer" style={{ ...s.btnSm, textDecoration: 'none' }}>🛍 Shopify Admin</a>
              <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ ...s.btnSm, textDecoration: 'none' }}>☁️ Google Cloud Console</a>
              <a href="https://business.google.com" target="_blank" rel="noreferrer" style={{ ...s.btnSm, textDecoration: 'none' }}>📍 Google Business Profile</a>
              <a href="/api/system-check" target="_blank" rel="noreferrer" style={{ ...s.btnSm, textDecoration: 'none' }}>🔗 Raw JSON output</a>
            </div>
          </>
        )}

        {/* Run log */}
        <div style={s.section}>Check Log</div>
        <div style={s.logBox}>
          {log.length === 0
            ? <span style={{ color: '#555b75' }}>No logs yet — click Run checks</span>
            : log.map((l, i) => (
                <div key={i}>
                  <span style={{ color: '#555b75' }}>[{l.time}] </span>
                  <span style={{ color: logColors[l.type] || '#e8eaf0' }}>{l.msg}</span>
                </div>
              ))
          }
        </div>

        {/* Platform info */}
        <div style={s.section}>Platform Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { label: 'Platform', val: 'CC Intelligence Platform v1.0' },
            { label: 'Live URL', val: 'cc-platform-two.vercel.app' },
            { label: 'GitHub', val: 'dyno786/cc-platform' },
            { label: 'Team', val: 'mohammed-adris-projects' },
            { label: 'Framework', val: 'Next.js 14.2.3' },
            { label: 'Runtime', val: 'Node.js 24.x' },
            { label: 'Region', val: 'iad1 (Washington DC)' },
            { label: 'Google Ads', val: 'CSV upload only (API blocked)' },
          ].map(item => (
            <div key={item.label} style={{ background: '#1a1d27', border: '1px solid #2e3347', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ color: '#555b75', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: '#e8eaf0', fontSize: 13, fontWeight: 500, fontFamily: 'monospace' }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
