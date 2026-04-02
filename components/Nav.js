import Link from 'next/link'
import { useRouter } from 'next/router'

const C = {
  surface:'#1a1d27', border:'#2e3347', text:'#e8eaf0',
  text2:'#8b90a7', text3:'#555b75', accent:'#6366f1', accent2:'#818cf8',
  green:'#22c55e', amber:'#f59e0b',
}

const NAV = [
  { id:'/',               label:'Overview',        icon:'⬡'  },
  { id:'/tasks',          label:'Tasks',           icon:'✅' },
  { id:'/local-seo',      label:'Local SEO',       icon:'📍' },
  { id:'/organic-seo',    label:'Organic SEO',     icon:'🔍' },
  { id:'/paid-ads',       label:'Paid Ads',        icon:'📊' },
  { id:'/local-seo',      label:'Reviews',         icon:'⭐' },
  { id:'/abandoned-carts',label:'Abandoned Carts', icon:'🛒' },
  { id:'/shopify-content',label:'Shopify',         icon:'🛍' },
  { id:'/content-studio', label:'Content Studio',  icon:'✍️' },
  { id:'/performance',    label:'Performance',     icon:'📈' },
]

const STATUS = [
  { label:'Shopify',  color:'#22c55e' },
  { label:'SC',       color:'#22c55e' },
  { label:'Ads CSV',  color:'#f59e0b' },
  { label:'WhatsApp', color:'#22c55e' },
  { label:'GBP',      color:'#22c55e' },
]

export default function Nav({ activeInline, onInlineClick }) {
  const router = useRouter()
  const currentPath = router.pathname

  return (
    <>
      <style>{`
        .nav-tab { transition: color .15s, border-color .15s; }
        .nav-tab:hover { color: #818cf8 !important; }
      `}</style>

      {/* Top bar */}
      <div style={{
        background: C.surface, borderBottom: '1px solid '+C.border,
        padding: '0 16px', display: 'flex', alignItems: 'center',
        gap: 10, height: 52, position: 'sticky', top: 0, zIndex: 200,
      }}>
        {/* Logo */}
        <Link href="/" style={{textDecoration:'none',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff'}}>CC</div>
          </div>
        </Link>

        {/* Nav tabs */}
        <div style={{display:'flex',flex:1,overflowX:'auto',scrollbarWidth:'none',gap:0}}>
          {NAV.map(tab => {
            const isActive = tab.inline
              ? activeInline === tab.id
              : currentPath === tab.id

            const baseStyle = {
              padding: '0 11px', height: 52, background: 'none', border: 'none',
              borderBottom: isActive ? '2px solid '+C.accent2 : '2px solid transparent',
              color: isActive ? C.accent2 : C.text2,
              fontSize: 12, fontWeight: isActive ? 600 : 400,
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
              cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit',
              flexShrink: 0,
            }

            if (tab.inline) {
              return (
                <button
                  key={tab.id}
                  className="nav-tab"
                  onClick={() => onInlineClick && onInlineClick(tab.id)}
                  style={baseStyle}
                >
                  {tab.icon} {tab.label}
                </button>
              )
            }

            return (
              <Link key={tab.id} href={tab.id} className="nav-tab" style={baseStyle}>
                {tab.icon} {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Status dots */}
        <div style={{display:'flex',gap:10,alignItems:'center',flexShrink:0}}>
          {STATUS.map(s => (
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:s.color,boxShadow:'0 0 4px '+s.color}}/>
              <span style={{fontSize:10,color:C.text3}}>{s.label}</span>
            </div>
          ))}
          <a href="/debug" style={{fontSize:10,color:C.text3,textDecoration:'none',marginLeft:2}}>⚙</a>
        </div>
      </div>
    </>
  )
}
