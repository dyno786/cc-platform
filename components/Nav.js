import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from './Auth'
import { T } from '../lib/theme'

const NAV = [
  { section:'Main', items:[
    { id:'/',               label:'Overview',       icon:'⬡'  },
    { id:'/tasks',          label:'Tasks',          icon:'✅' },
    { id:'/data-upload',    label:'Data upload',    icon:'📥' },
    { id:'/monday-report',  label:'Weekly report',  icon:'📋' },
  ]},
  { section:'SEO', items:[
    { id:'/local-seo',      label:'Local SEO',      icon:'📍' },
    { id:'/website-seo',    label:'Website SEO',    icon:'🌐' },
    { id:'/organic-seo',    label:'Organic SEO',    icon:'🔍' },
    { id:'/blog-planner',   label:'Blog planner',   icon:'📝' },
  ]},
  { section:'Ads & Sales', items:[
    { id:'/paid-ads',       label:'Paid ads',       icon:'📊', managerOnly:true },
    { id:'/abandoned-carts',label:'Abandoned carts',icon:'🛒' },
    { id:'/shopify-content',label:'Shopify',        icon:'🛍' },
  ]},
  { section:'Content', items:[
    { id:'/content-studio', label:'Content studio', icon:'✍️' },
    { id:'/performance',    label:'Performance',    icon:'📈', managerOnly:true },
  ]},
]

export default function Nav() {
  const router = useRouter()
  const { isManager, logout } = useAuth()

  return (
    <div style={{
      width:196,background:T.surface,borderRight:`0.5px solid ${T.border}`,
      display:'flex',flexDirection:'column',flexShrink:0,
      position:'sticky',top:0,height:'100vh',overflowY:'auto',
    }}>
      {/* Logo */}
      <div style={{padding:'13px 16px',borderBottom:`0.5px solid ${T.border}`,display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
        <div style={{width:27,height:27,borderRadius:7,background:T.green,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',letterSpacing:'-0.3px'}}>CC</div>
        <span style={{fontSize:13,fontWeight:600,color:T.text}}>CC Intelligence</span>
      </div>

      {/* Role */}
      <div style={{margin:'10px 12px 2px',padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:500,display:'flex',alignItems:'center',gap:6,
        background:isManager?T.greenBg:T.blueBg,
        color:isManager?T.green:T.blue,
        border:`0.5px solid ${isManager?T.greenBorder:T.blueBorder}`,
      }}>
        <div style={{width:6,height:6,borderRadius:'50%',background:isManager?T.green:T.blue,flexShrink:0}}/>
        {isManager ? 'Manager view' : 'Staff view'}
      </div>

      {/* Nav */}
      <div style={{flex:1,paddingBottom:8}}>
        {NAV.map(sec => (
          <div key={sec.section} style={{paddingTop:8}}>
            <div style={{fontSize:10,fontWeight:600,color:T.textHint,padding:'2px 16px 3px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{sec.section}</div>
            {sec.items.map(item => {
              const locked = item.managerOnly && !isManager
              const active = router.pathname === item.id
              if (locked) return (
                <div key={item.id} style={{display:'flex',alignItems:'center',gap:7,padding:'5px 16px',fontSize:12,color:'#c6cdd5',cursor:'not-allowed',userSelect:'none'}}>
                  <span style={{fontSize:11,width:14,textAlign:'center'}}>{item.icon}</span>
                  <span style={{flex:1}}>{item.label}</span>
                  <svg width="9" height="9" viewBox="0 0 16 16" fill="#c6cdd5"><path d="M4 6V4a4 4 0 018 0v2h1a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1h1zm2-2v2h4V4a2 2 0 00-4 0z"/></svg>
                </div>
              )
              return (
                <Link key={item.id} href={item.id} style={{
                  display:'flex',alignItems:'center',gap:7,padding:'5px 16px',
                  fontSize:12,color:active?T.green:T.textMuted,
                  background:active?T.greenBg:'transparent',
                  fontWeight:active?600:400,
                  borderRight:active?`2px solid ${T.green}`:'2px solid transparent',
                  transition:'background 0.1s',
                }}>
                  <span style={{fontSize:11,width:14,textAlign:'center'}}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{borderTop:`0.5px solid ${T.border}`,padding:'10px 12px',flexShrink:0}}>
        <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:8}}>
          {[{l:'Shopify',c:T.green},{l:'GBP',c:T.green},{l:'Ads CSV',c:T.amber}].map(s=>(
            <div key={s.l} style={{display:'flex',alignItems:'center',gap:3,background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:20,padding:'2px 7px',fontSize:10,color:s.c,fontWeight:500}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:s.c}}/>
              {s.l}
            </div>
          ))}
        </div>
        <button onClick={logout} style={{width:'100%',padding:'6px 0',fontSize:11,color:T.textMuted,background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:6}}>
          Sign out
        </button>
      </div>
    </div>
  )
}
