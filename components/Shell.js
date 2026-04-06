import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Nav from './Nav'
import { T } from '../lib/theme'
import { useAuth } from './Auth'

export default function Shell({ children, title, subtitle }) {
  const [fontSize, setFontSize] = useState(14)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cc_fontsize')
      if (saved) { const f = parseInt(saved); setFontSize(f); document.body.style.fontSize = f + 'px' }
    } catch(e) {}
  }, [])

  function changeFontSize(delta) {
    const next = Math.max(11, Math.min(18, fontSize + delta))
    setFontSize(next)
    document.body.style.fontSize = next + 'px'
    try { localStorage.setItem('cc_fontsize', String(next)) } catch(e) {}
  }
  const router = useRouter()
  const { isManager, logout } = useAuth()
  const isHome = router.pathname === '/'

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:T.bg,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif'}}>
      <Nav />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        {/* Top bar */}
        <div style={{height:48,background:T.surface,borderBottom:`0.5px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',flexShrink:0}} className="shell-topbar">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {!isHome && (
              <button onClick={()=>router.push('/')} style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',fontSize:12,color:T.textMuted,background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:6}}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"/></svg>
                Back
              </button>
            )}
            <div>
              {title && <div style={{fontSize:14,fontWeight:600,color:T.text}}>{title}</div>}
              {subtitle && <div style={{fontSize:11,color:T.textMuted}}>{subtitle}</div>}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontSize:11,color:T.textMuted}}>{new Date().toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</div>
            <div style={{display:'flex',alignItems:'center',gap:4,background:isManager?T.greenBg:T.blueBg,border:`0.5px solid ${isManager?T.greenBorder:T.blueBorder}`,borderRadius:20,padding:'3px 9px',fontSize:11,fontWeight:500,color:isManager?T.green:T.blue}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:isManager?T.green:T.blue}}/>
              {isManager ? 'Manager' : 'Staff'}
            </div>
          </div>
        </div>
        {/* Page content */}
        <div style={{flex:1,overflowY:'auto',padding:20}}>
          {children}
        </div>
      </div>
    </div>
  )
}
