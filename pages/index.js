import Head from 'next/head'
import { useRouter } from 'next/router'
import Shell from '../components/Shell'
import { useAuth } from '../components/Auth'
import { T } from '../lib/theme'

const DAILY_STEPS = [
  'Morning setup','Orders & carts','Publish blogs','GBP posts','Reviews','Google Ads','End of day'
]

const QUICK = [
  { label:'Blog planner', sub:'90 posts ready', icon:'📝', href:'/blog-planner', color:T.greenBg, tc:T.green },
  { label:'Paid ads', sub:'5 critical tasks', icon:'📊', href:'/paid-ads', color:T.blueBg, tc:T.blue, managerOnly:true },
  { label:'GBP planner', sub:'3 branches today', icon:'📍', href:'/local-seo', color:T.amberBg, tc:T.amber },
  { label:'Abandoned carts', sub:'Check overnight', icon:'🛒', href:'/abandoned-carts', color:T.redBg, tc:T.red },
  { label:'Local SEO', sub:'Chapeltown 4.1★', icon:'🔍', href:'/local-seo', color:T.purpleBg, tc:T.purple },
  { label:'Weekly report', sub:'Last: Monday', icon:'📋', href:'/monday-report', color:T.bg, tc:T.textMuted },
]

const TODAY_TASKS = [
  { text:'Check overnight Shopify orders', done:true, badge:'Done', bc:T.greenBg, btc:T.green },
  { text:'Check abandoned carts — send WhatsApp', done:true, badge:'Done', bc:T.greenBg, btc:T.green },
  { text:'Publish 3 blog posts — Day 1', done:false, badge:'Now', bc:T.redBg, btc:T.red },
  { text:'Post GBP update — all 3 branches', done:false, badge:'Now', bc:T.redBg, btc:T.red },
  { text:'Reply to all Google reviews', done:false, badge:'Today', bc:T.amberBg, btc:T.amber },
  { text:'Check Ads spend vs budget', done:false, badge:'Today', bc:T.amberBg, btc:T.amber, managerOnly:true },
  { text:'Send WhatsApp review requests — 2pm', done:false, badge:'2pm', bc:T.blueBg, btc:T.blue },
]

function StatCard({ label, value, sub, subColor, blur }) {
  return (
    <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
      <div style={{fontSize:11,color:T.textMuted,marginBottom:5}}>{label}</div>
      <div style={{fontSize:22,fontWeight:600,color:blur?'transparent':T.text,background:blur?'#d0d7de':undefined,borderRadius:blur?4:undefined,marginBottom:3,userSelect:blur?'none':'auto',filter:blur?'blur(8px)':undefined}}>{value}</div>
      <div style={{fontSize:11,color:subColor||T.textMuted}}>{blur?'Manager access only':sub}</div>
    </div>
  )
}

function ProgBar({ label, val, max, color }) {
  const pct = Math.round((val/max)*100)
  return (
    <div style={{marginBottom:9}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:T.textMuted,marginBottom:3}}>
        <span>{label}</span><span>{val}/{max}</span>
      </div>
      <div style={{height:5,background:T.borderLight,borderRadius:99,border:`0.5px solid ${T.border}`,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:99,transition:'width 0.4s'}}/>
      </div>
    </div>
  )
}

export default function Overview() {
  const { isManager } = useAuth()
  const router = useRouter()
  const doneSteps = 2
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <Head><title>Overview — CC Intelligence</title></Head>
      <Shell title={`${greeting}${isManager ? ', Mohammed' : ''}`} subtitle="CC Hair and Beauty — Leeds">
        {/* Daily step progress */}
        <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <span style={{fontSize:13,fontWeight:600,color:T.text}}>Today's progress</span>
            <span style={{fontSize:11,fontWeight:500,padding:'2px 8px',borderRadius:20,background:T.amberBg,color:T.amber,border:`0.5px solid ${T.amberBorder}`}}>{doneSteps}/{DAILY_STEPS.length} steps done</span>
          </div>
          <div style={{display:'flex',alignItems:'flex-start',gap:0}}>
            {DAILY_STEPS.map((step, i) => (
              <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1}}>
                <div style={{display:'flex',alignItems:'center',width:'100%'}}>
                  {i > 0 && <div style={{flex:1,height:2,background:i<=doneSteps?T.green:T.border,marginTop:0}}/>}
                  <div style={{
                    width:24,height:24,borderRadius:'50%',flexShrink:0,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:10,fontWeight:600,
                    background:i<doneSteps?T.green:i===doneSteps?T.surface:T.bg,
                    border:`2px solid ${i<doneSteps?T.green:i===doneSteps?T.blue:T.border}`,
                    color:i<doneSteps?'#fff':i===doneSteps?T.blue:T.textMuted,
                  }}>{i<doneSteps?'✓':i+1}</div>
                  {i < DAILY_STEPS.length-1 && <div style={{flex:1,height:2,background:i<doneSteps?T.green:T.border}}/>}
                </div>
                <div style={{fontSize:9,color:i===doneSteps?T.blue:i<doneSteps?T.green:T.textHint,marginTop:4,textAlign:'center',lineHeight:1.2,maxWidth:52}}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:10,marginBottom:16}}>
          <StatCard label="2yr Ads spend" value="£34,697" sub="93% wasted — act now" subColor={T.amber} blur={!isManager}/>
          <StatCard label="2yr revenue" value="£61,952" sub="1.79x ROAS overall" subColor={T.green} blur={!isManager}/>
          <StatCard label="Blogs published" value="0/90" sub="Start today — Day 1" subColor={T.red}/>
          <StatCard label="Tasks done today" value="2/7" sub="5 remaining" subColor={T.amber}/>
        </div>

        {/* Quick links */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginBottom:16}}>
          {QUICK.filter(q => !q.managerOnly || isManager).map((q,i) => (
            <div key={i} onClick={()=>router.push(q.href)} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px',cursor:'pointer'}}>
              <div style={{width:28,height:28,borderRadius:7,background:q.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,marginBottom:7}}>{q.icon}</div>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:2}}>{q.label}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{q.sub}</div>
            </div>
          ))}
        </div>

        {/* Two col */}
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.6fr) minmax(0,1fr)',gap:12}}>
          {/* Tasks */}
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
            <div style={{padding:'10px 16px',borderBottom:`0.5px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:13,fontWeight:600,color:T.text}}>Today's tasks</span>
              <button onClick={()=>router.push('/tasks')} style={{fontSize:11,color:T.blue,background:'none',border:'none'}}>View all →</button>
            </div>
            <div style={{padding:'4px 0'}}>
              {TODAY_TASKS.filter(t => !t.managerOnly || isManager).map((t,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:9,padding:'7px 16px',borderBottom:`0.5px solid ${T.borderLight}`}}>
                  <div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${t.done?T.green:T.border}`,background:t.done?T.green:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {t.done && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{flex:1,fontSize:12,color:t.done?T.textMuted:T.text,textDecoration:t.done?'line-through':'none'}}>{t.text}</span>
                  <span style={{fontSize:10,fontWeight:500,padding:'2px 7px',borderRadius:20,background:t.bc,color:t.btc,flexShrink:0}}>{t.badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
              <div style={{padding:'10px 16px',borderBottom:`0.5px solid ${T.border}`}}>
                <span style={{fontSize:13,fontWeight:600,color:T.text}}>Monthly progress — April</span>
              </div>
              <div style={{padding:'12px 16px'}}>
                <ProgBar label="Blog posts" val={0} max={90} color={T.green}/>
                <ProgBar label="GBP posts" val={0} max={24} color={T.blue}/>
                <ProgBar label="Reviews replied" val={4} max={6} color={T.amber}/>
                <ProgBar label="Tasks completed" val={2} max={7} color={T.purple}/>
              </div>
            </div>

            {isManager && (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <div style={{padding:'10px 16px',borderBottom:`0.5px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:13,fontWeight:600,color:T.text}}>Finance snapshot</span>
                  <span style={{fontSize:10,fontWeight:500,padding:'2px 7px',borderRadius:20,background:T.amberBg,color:T.amber}}>Manager only</span>
                </div>
                <div style={{padding:'8px 16px'}}>
                  {[
                    { l:'Best CPA', v:'£0.03 — Matrix Matte', vc:T.text },
                    { l:'Scale now', v:'Human Hair 11.29x ROAS', vc:T.green },
                    { l:'Kill now', v:'Energy drinks £1,284', vc:T.red },
                    { l:'Wasted 2yr', v:'£32,160', vc:T.red },
                  ].map((r,i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:i<3?`0.5px solid ${T.borderLight}`:'none'}}>
                      <span style={{fontSize:12,color:T.textMuted}}>{r.l}</span>
                      <span style={{fontSize:12,fontWeight:500,color:r.vc}}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Shell>
    </>
  )
}
