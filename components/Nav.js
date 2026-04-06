import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { T } from '../lib/theme'
import { useAuth } from './Auth'

const NAV_ITEMS = [
  { section:'Main', items:[
    { id:'/',                label:'Overview',             icon:'⬡' },
    { id:'/tasks',           label:'Tasks',                icon:'✅' },
  ]},
  { section:'Sales', items:[
    { id:'/paid-ads',        label:'Paid Ads',             icon:'💰' },
    { id:'/abandoned-carts', label:'Abandoned Carts',      icon:'🛒' },
  ]},
  { section:'SEO', items:[
    { id:'/organic-seo',     label:'Organic SEO',          icon:'🔍' },
    { id:'/local-seo',       label:'Local SEO',            icon:'📍' },
    { id:'/website-seo',     label:'Website SEO',          icon:'🌐' },
  ]},
  { section:'Content', items:[
    { id:'/blog-planner',    label:'Blog Planner',         icon:'📝' },
    { id:'/social-upload',   label:'Social Media',         icon:'📱' },
  ]},
  { section:'Store', items:[
    { id:'/shopify-content', label:'Shopify Content',      icon:'🛍️' },
    { id:'/performance',     label:'Performance',          icon:'📊' },
  ]},
  { section:'System', items:[
    { id:'/debug',           label:'Debug & API Status',   icon:'🔧' },
    { id:'/data-upload',     label:'Data Upload',          icon:'📥' },
  ]},
]

export default function Nav() {
  const router = useRouter()
  const { isManager, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-collapse on mobile
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) setCollapsed(true)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false) }, [router.pathname])

  const navWidth = collapsed ? 52 : 196

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        style={{
          display: 'none',
          position: 'fixed', top: 12, left: 12, zIndex: 1000,
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: '6px 10px', fontSize: 18, cursor: 'pointer',
          '@media (max-width: 768px)': { display: 'block' }
        }}
        className="mobile-menu-btn"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 90,
          display: 'none',
        }} className="mobile-overlay"/>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .mobile-overlay { display: block !important; }
          .nav-sidebar {
            position: fixed !important;
            left: ${mobileOpen ? '0' : '-220px'} !important;
            top: 0 !important;
            height: 100vh !important;
            z-index: 100 !important;
            transition: left 0.2s ease !important;
            width: 196px !important;
          }
        }
      `}</style>

      <div className="nav-sidebar" style={{
        width: navWidth,
        minWidth: navWidth,
        background: T.surface,
        borderRight: `0.5px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.2s ease, min-width 0.2s ease',
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '13px 12px' : '13px 16px',
          borderBottom: `0.5px solid ${T.border}`,
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 8, flexShrink: 0,
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none',flex:1,minWidth:0}}>
            <div style={{
              width: 27, height: 27, borderRadius: 7, background: T.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', flexShrink: 0,
            }}>CC</div>
            {!collapsed && <span style={{fontSize:13,fontWeight:600,color:T.text,overflow:'hidden',whiteSpace:'nowrap'}}>CC Intelligence</span>}
          </Link>
          <button onClick={() => setCollapsed(c => !c)}
            style={{background:'none',border:'none',cursor:'pointer',color:T.textMuted,fontSize:14,padding:2,flexShrink:0}}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div style={{
            margin: '8px 10px 2px',
            padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
            background: isManager ? T.greenBg : T.blueBg,
            color: isManager ? T.green : T.blue,
            border: `0.5px solid ${isManager ? T.greenBorder : T.blueBorder}`,
          }}>
            <div style={{width:5,height:5,borderRadius:'50%',background:isManager?T.green:T.blue}}/>
            {isManager ? 'Manager' : 'Staff'}
          </div>
        )}

        {/* Nav items */}
        <div style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
          {NAV_ITEMS.map(section => (
            <div key={section.section} style={{marginBottom:4}}>
              {!collapsed && (
                <div style={{
                  fontSize: 9, fontWeight: 700, color: T.textMuted,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '4px 14px 2px',
                }}>
                  {section.section}
                </div>
              )}
              {section.items.map(item => {
                const isActive = router.pathname === item.id
                return (
                  <Link key={item.id} href={item.id} style={{
                    display: 'flex', alignItems: 'center',
                    gap: collapsed ? 0 : 8,
                    padding: collapsed ? '8px 0' : '6px 14px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    textDecoration: 'none',
                    background: isActive ? T.blueBg : 'transparent',
                    borderRight: isActive ? `2px solid ${T.blue}` : '2px solid transparent',
                    color: isActive ? T.blue : T.textMuted,
                    fontSize: 12, fontWeight: isActive ? 600 : 400,
                    borderRadius: collapsed ? 0 : '0',
                    transition: 'background 0.1s',
                    title: collapsed ? item.label : '',
                  }}>
                    <span style={{fontSize:14,flexShrink:0}}>{item.icon}</span>
                    {!collapsed && <span style={{overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div style={{padding:'8px 10px',borderTop:`0.5px solid ${T.border}`}}>
          <button onClick={logout} style={{
            width:'100%', padding:'6px 0', fontSize:11, color:T.textMuted,
            background:T.bg, border:`0.5px solid ${T.border}`, borderRadius:6, cursor:'pointer',
          }}>
            {collapsed ? '↩' : 'Log out'}
          </button>
        </div>
      </div>
    </>
  )
}
