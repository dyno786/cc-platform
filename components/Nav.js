import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

const DARK = {
  bg:'#0f1117', surface:'#1a1d27', border:'#2e3347',
  text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  accent:'#6366f1', accent2:'#818cf8',
}

const LIGHT = {
  bg:'#f8f9fb', surface:'#ffffff', border:'#e5e7eb',
  text:'#111827', text2:'#6b7280', text3:'#9ca3af',
  accent:'#4f46e5', accent2:'#4f46e5',
}

const NAV = [
  { id:'/',                label:'Overview',      icon:'⬡'  },
  { id:'/tasks',           label:'Tasks',         icon:'✅' },
  { id:'/local-seo',       label:'Local SEO',     icon:'📍' },
  { id:'/blog-planner',    label:'Blog Planner',  icon:'📝' },
  { id:'/organic-seo',     label:'Organic SEO',   icon:'🔍' },
  { id:'/paid-ads',        label:'Paid Ads',      icon:'📊' },
  { id:'/monday-report',   label:'Weekly Report', icon:'📋' },
  { id:'/abandoned-carts', label:'Abandoned Carts',icon:'🛒' },
  { id:'/shopify-content', label:'Shopify',       icon:'🛍' },
  { id:'/content-studio',  label:'Content Studio',icon:'✍️' },
  { id:'/performance',     label:'Performance',   icon:'📈' },
]

const STATUS = [
  { label:'Shopify',  color:'#22c55e' },
  { label:'SC',       color:'#22c55e' },
  { label:'Ads CSV',  color:'#f59e0b' },
  { label:'GBP',      color:'#22c55e' },
]

export default function Nav({ activeInline, onInlineClick }) {
  const router = useRouter()
  const [theme, setTheme] = useState('dark')
  const [fontSize, setFontSize] = useState(14)

  useEffect(() => {
    try {
      const t = localStorage.getItem('cc_theme'); if(t) setTheme(t)
      const f = localStorage.getItem('cc_fontsize'); if(f) setFontSize(parseInt(f))
    } catch(e){}
  }, [])

  useEffect(() => {
    const C = theme === 'light' ? LIGHT : DARK
    document.body.style.background = C.bg
    document.body.style.color = C.text
    document.body.style.fontSize = fontSize + 'px'
    // Inject CSS variables for theme
    document.documentElement.style.setProperty('--bg', C.bg)
    document.documentElement.style.setProperty('--surface', C.surface)
    document.documentElement.style.setProperty('--border', C.border)
    document.documentElement.style.setProperty('--text', C.text)
    document.documentElement.style.setProperty('--text2', C.text2)
    document.documentElement.style.setProperty('--text3', C.text3)
    document.documentElement.style.setProperty('--accent', C.accent)
    document.documentElement.style.setProperty('--accent2', C.accent2)
  }, [theme, fontSize])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next); localStorage.setItem('cc_theme', next)
  }

  function changeFont(delta) {
    const next = Math.max(11, Math.min(18, fontSize + delta))
    setFontSize(next); localStorage.setItem('cc_fontsize', String(next))
  }

  const C = theme === 'light' ? LIGHT : DARK

  return (
    <>
      <style>{`
        .nav-tab { transition: color .15s, border-color .15s; }
        .nav-tab:hover { color: ${C.accent2} !important; }
        .nav-ctrl:hover { opacity: 1 !important; }
        * { box-sizing: border-box; }
        body {
          background: ${C.bg} !important;
          color: ${C.text} !important;
          font-size: ${fontSize}px !important;
        }
      `}</style>

      <div style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        boxShadow: theme==='light' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        padding: '0 16px', display: 'flex', alignItems: 'center',
        gap: 8, height: 52, position: 'sticky', top: 0, zIndex: 200,
      }}>
        {/* Logo */}
        <Link href="/" style={{textDecoration:'none',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:30,height:30,borderRadius:9,background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff',letterSpacing:'-0.5px'}}>CC</div>
            {theme==='light' && <span style={{fontSize:13,fontWeight:700,color:C.text,letterSpacing:'-0.3px'}}>CC Intelligence</span>}
          </div>
        </Link>

        {/* Divider */}
        <div style={{width:1,height:24,background:C.border,flexShrink:0}}/>

        {/* Nav tabs */}
        <div style={{display:'flex',flex:1,overflowX:'auto',scrollbarWidth:'none',gap:0,WebkitOverflowScrolling:'touch'}}>
          {NAV.map(tab => {
            const isActive = tab.inline
              ? activeInline === tab.id
              : router.pathname === tab.id

            const baseStyle = {
              padding: '0 12px', height: 52,
              background: isActive && theme==='light' ? '#f5f3ff' : 'none',
              border: 'none',
              borderBottom: isActive
                ? `2px solid ${C.accent}`
                : '2px solid transparent',
              color: isActive ? C.accent : C.text2,
              fontSize: 12, fontWeight: isActive ? 600 : 400,
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
              cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit',
              flexShrink: 0, borderRadius: isActive && theme==='light' ? '4px 4px 0 0' : 0,
            }

            if (tab.inline) {
              return (
                <button key={tab.id} className="nav-tab"
                  onClick={() => onInlineClick && onInlineClick(tab.id)}
                  style={baseStyle}>
                  {tab.icon} {tab.label}
                </button>
              )
            }

            return (
              <Link key={tab.id+tab.label} href={tab.id} className="nav-tab" style={baseStyle}>
                {tab.icon} {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Controls */}
        <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>

          {/* Status dots */}
          {STATUS.map(s => (
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:3}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:s.color,boxShadow:`0 0 4px ${s.color}`}}/>
              <span style={{fontSize:10,color:C.text3}}>{s.label}</span>
            </div>
          ))}

          {/* Divider */}
          <div style={{width:1,height:20,background:C.border}}/>

          {/* Font size */}
          <div style={{display:'flex',alignItems:'center',gap:3,background:C.bg,borderRadius:6,padding:'2px 4px',border:`1px solid ${C.border}`}}>
            <button className="nav-ctrl" onClick={()=>changeFont(-1)}
              style={{width:22,height:22,borderRadius:4,border:'none',background:'none',color:C.text2,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:0.7,fontWeight:700}}>−</button>
            <span style={{fontSize:10,color:C.text3,minWidth:22,textAlign:'center',fontWeight:600}}>{fontSize}px</span>
            <button className="nav-ctrl" onClick={()=>changeFont(1)}
              style={{width:22,height:22,borderRadius:4,border:'none',background:'none',color:C.text2,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:0.7,fontWeight:700}}>+</button>
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="nav-ctrl"
            style={{
              height:30,padding:'0 10px',borderRadius:6,
              border:`1px solid ${C.border}`,
              background: theme==='light' ? '#f5f3ff' : C.bg,
              color: theme==='light' ? C.accent : C.text2,
              fontSize:11,fontWeight:600,cursor:'pointer',
              display:'flex',alignItems:'center',gap:4,opacity:0.85,
              whiteSpace:'nowrap',
            }}>
            {theme==='dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          <a href="/debug" style={{fontSize:10,color:C.text3,textDecoration:'none'}}>⚙</a>
        </div>
      </div>
    </>
  )
}
