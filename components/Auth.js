import { useState, useEffect, createContext, useContext } from 'react'
import { PINS, ROLES } from '../lib/theme'

const AuthContext = createContext(null)
export function useAuth() { return useContext(AuthContext) }

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cc_role')
      const expiry = localStorage.getItem('cc_role_expiry')
      if (saved && expiry && Date.now() < parseInt(expiry)) setRole(saved)
    } catch(e) {}
    setLoading(false)
  }, [])

  function login(pin) {
    if (pin === PINS.manager) { save(ROLES.manager); return 'manager' }
    if (pin === PINS.staff) { save(ROLES.staff); return 'staff' }
    return false
  }

  function save(r) {
    const exp = Date.now() + 8 * 60 * 60 * 1000
    localStorage.setItem('cc_role', r)
    localStorage.setItem('cc_role_expiry', String(exp))
    setRole(r)
  }

  function logout() {
    localStorage.removeItem('cc_role')
    localStorage.removeItem('cc_role_expiry')
    setRole(null)
  }

  if (loading) return null
  if (!role) return <LoginScreen login={login} />
  return (
    <AuthContext.Provider value={{ role, logout, isManager: role === ROLES.manager, isStaff: role === ROLES.staff }}>
      {children}
    </AuthContext.Provider>
  )
}

function LoginScreen({ login }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  function press(d) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) {
      setTimeout(() => {
        const ok = login(next)
        if (!ok) {
          setShake(true); setPin(''); setError('Incorrect PIN')
          setTimeout(() => setShake(false), 500)
        }
      }, 120)
    }
  }

  function del() { setPin(p => p.slice(0, -1)); setError('') }

  return (
    <div style={{minHeight:'100vh',background:'#f6f8fa',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,sans-serif'}}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
      <div style={{width:300,background:'#fff',border:'0.5px solid #d0d7de',borderRadius:14,padding:'32px 28px',textAlign:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <div style={{width:52,height:52,borderRadius:13,background:'#dafbe1',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:18,fontWeight:700,color:'#1f883d'}}>CC</div>
        <div style={{fontSize:17,fontWeight:600,color:'#1f2328',marginBottom:3}}>CC Intelligence</div>
        <div style={{fontSize:12,color:'#656d76',marginBottom:22}}>Enter your PIN to continue</div>
        <div style={{display:'flex',justifyContent:'center',gap:14,marginBottom:6,animation:shake?'shake 0.4s ease':'none'}}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{width:13,height:13,borderRadius:'50%',border:`2px solid ${pin.length>i?'#1f883d':'#d0d7de'}`,background:pin.length>i?'#1f883d':'transparent',transition:'all 0.15s'}}/>
          ))}
        </div>
        <div style={{height:20,fontSize:12,color:'#cf222e',marginBottom:6}}>{error}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:6}}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={()=>press(String(n))} style={{padding:'13px 0',fontSize:17,fontWeight:500,color:'#1f2328',background:'#f6f8fa',border:'0.5px solid #d0d7de',borderRadius:8}}>
              {n}
            </button>
          ))}
          <div/>
          <button onClick={()=>press('0')} style={{padding:'13px 0',fontSize:17,fontWeight:500,color:'#1f2328',background:'#f6f8fa',border:'0.5px solid #d0d7de',borderRadius:8}}>0</button>
          <button onClick={del} style={{padding:'13px 0',fontSize:15,color:'#656d76',background:'#f6f8fa',border:'0.5px solid #d0d7de',borderRadius:8}}>⌫</button>
        </div>
        <div style={{fontSize:11,color:'#9ea8b3',marginTop:8}}>Session lasts 8 hours</div>
      </div>
    </div>
  )
}
