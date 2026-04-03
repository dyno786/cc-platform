import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { useAuth } from '../components/Auth'
import { T } from '../lib/theme'

// ── 2-YEAR REAL DATA ──────────────────────────────────────────────────────────
const CAMPAIGNS = [
  { name:'Shopify All Products',    device:'Mobile',  spend:27521, rev:45830, roas:1.67, conv:1842, cpa:14.94, status:'scale',   action:'Reduce mobile budget 40% — low ROAS' },
  { name:'Shopify All Products',    device:'Desktop', spend:3126,  rev:12411, roas:3.97, conv:312,  cpa:10.02, status:'scale',   action:'Scale desktop — 3.97x ROAS, underinvested' },
  { name:'Shopify All Products',    device:'Tablet',  spend:892,   rev:2970,  roas:3.33, conv:89,   cpa:10.02, status:'scale',   action:'Increase tablet bid +20%' },
  { name:'Human Hair - Brands',     device:'Mobile',  spend:62,    rev:699,   roas:11.29,conv:24,   cpa:2.58,  status:'urgent',  action:'Scale to £500/month — 11.29x ROAS!' },
  { name:'Synthetic Wigs 2026',     device:'Mobile',  spend:1240,  rev:595,   roas:0.48, conv:18,   cpa:68.89, status:'pause',   action:'PAUSE — 0.48x ROAS, losing money' },
  { name:'March 2018 Campaign',     device:'All',     spend:0,     rev:0,     roas:0,    conv:0,    cpa:0,     status:'kill',    action:'DELETE — old test campaign from 2018' },
  { name:'Edge Control',            device:'Desktop', spend:420,   rev:2940,  roas:7.00, conv:84,   cpa:5.00,  status:'scale',   action:'Scale — 7x ROAS, increase budget 50%' },
  { name:'Relaxers & Texturisers',  device:'Mobile',  spend:890,   rev:2136,  roas:2.40, conv:107,  cpa:8.32,  status:'monitor', action:'Monitor — above 2x, check search terms' },
  { name:'Braiding Hair',           device:'Desktop', spend:634,   rev:2219,  roas:3.50, conv:95,   cpa:6.67,  status:'scale',   action:'Scale desktop braiding — 3.5x ROAS' },
  { name:'Wigs General',            device:'Tablet',  spend:312,   rev:530,   roas:1.70, conv:21,   cpa:14.86, status:'monitor', action:'Monitor — borderline ROAS' },
]

const DEVICES = [
  { device:'Desktop', spend:4572,  rev:18001, roas:3.94, conv:491,  cpa:9.31,  pct:13 },
  { device:'Mobile',  spend:29713, rev:49260, roas:1.66, conv:1991, cpa:14.92, pct:86 },
  { device:'Tablet',  spend:1204,  rev:3500,  roas:2.91, conv:110,  cpa:10.95, pct:3  },
]

const LOCATIONS = [
  { city:'Leeds',          spend:8420,  conv:612,  roas:3.21, cpa:13.76, action:'Scale — home city, best ROAS' },
  { city:'Bradford',       spend:3210,  conv:198,  roas:2.84, cpa:16.21, action:'Scale — nearby, strong ROAS' },
  { city:'Manchester',     spend:2890,  conv:142,  roas:2.34, cpa:20.35, action:'Monitor — good volume' },
  { city:'Sheffield',      spend:1840,  conv:89,   roas:2.10, cpa:20.67, action:'Monitor — borderline' },
  { city:'Birmingham',     spend:1620,  conv:61,   roas:1.58, cpa:26.56, action:'Reduce bid — low ROAS' },
  { city:'London',         spend:4210,  conv:98,   roas:1.24, cpa:42.96, action:'Reduce budget — very low ROAS' },
  { city:'Glasgow',        spend:890,   conv:12,   roas:0.71, cpa:74.17, action:'PAUSE — below 1x ROAS' },
  { city:'Other UK',       spend:11617, conv:989,  roas:1.98, cpa:11.75, action:'Monitor' },
]

const TIMINGS = [
  { hour:'6am–9am',   spend:1240, conv:89,  roas:2.10, label:'Early morning' },
  { hour:'9am–12pm',  spend:4210, conv:312, roas:2.84, label:'Morning' },
  { hour:'12pm–3pm',  spend:5840, conv:398, roas:2.62, label:'Lunchtime' },
  { hour:'3pm–6pm',   spend:6120, conv:421, roas:2.67, label:'Afternoon' },
  { hour:'6pm–9pm',   spend:8940, conv:701, roas:3.42, label:'Evening' },
  { hour:'9pm–12am',  spend:4210, conv:298, roas:2.88, label:'Late evening' },
  { hour:'12am–6am',  spend:2137, conv:73,  roas:1.24, label:'Night' },
]

const TOP_CONVERTERS = [
  { term:'matrix matte definer',           conv:5,   cpa:0.03,  roas:1000, spend:0.15,  rev:150,  action:'Scale — best in account' },
  { term:'naturally straight beautiful textures', conv:7, cpa:0.04, roas:735, spend:0.28, rev:206, action:'Scale — exact match' },
  { term:'xpression springy bohemian twist', conv:6, cpa:0.07,  roas:276, spend:0.42,  rev:116,  action:'Scale — add to exact match' },
  { term:'papaya brightening serum',       conv:5,   cpa:0.06,  roas:251, spend:0.30,  rev:75,   action:'Scale budget' },
  { term:'blueberry bliss scalp oil',      conv:4.5, cpa:0.08,  roas:429, spend:0.36,  rev:154,  action:'Scale — hair growth trend' },
  { term:'bsset curl cream',               conv:24,  cpa:1.23,  roas:11,  spend:29.52, rev:325,  action:'Scale — highest volume converter' },
  { term:'iris wigs',                      conv:4.6, cpa:0.34,  roas:165, spend:1.56,  rev:257,  action:'Scale wig category' },
  { term:'caro light soap',                conv:11,  cpa:0.31,  roas:40,  spend:3.41,  rev:136,  action:'Scale skincare' },
  { term:'american crew superglue',        conv:9,   cpa:0.23,  roas:82,  spend:2.07,  rev:170,  action:'Scale mens range' },
  { term:'wella t28 toner',                conv:5.5, cpa:0.16,  roas:127, spend:0.88,  rev:112,  action:'Scale toners' },
]

const WASTED = [
  { term:'monster energy drink',    spend:612,  conv:0,  roas:0,    action:'Add as negative — IMMEDIATELY' },
  { term:'red bull',                spend:389,  conv:0,  roas:0,    action:'Add as negative — IMMEDIATELY' },
  { term:'sour patch kids',         spend:283,  conv:2,  roas:0.26, action:'Add as negative — food item' },
  { term:'hair salon near me',      spend:920,  conv:8,  roas:0.89, action:'Add as negative — service not product' },
  { term:'hair extensions salon',   spend:640,  conv:5,  roas:0.76, action:'Add as negative — service intent' },
  { term:'cheap wigs',              spend:412,  conv:14, roas:1.42, action:'Monitor — low ROAS' },
  { term:'synthetic hair styles',   spend:334,  conv:3,  roas:0.54, action:'Add as negative — info intent' },
  { term:'afro hair styles 4c',     spend:298,  conv:2,  roas:0.40, action:'Add as negative — info intent' },
  { term:'how to braid hair',       spend:276,  conv:1,  roas:0.21, action:'Add as negative — tutorial intent' },
  { term:'braiding hair tutorial',  spend:198,  conv:0,  roas:0,    action:'Add as negative — tutorial intent' },
]

const BID_KEYWORDS = [
  { kw:'bsset curl cream',          bid:1.20, roas:11,   status:'increase', pct:'+30%', reason:'11x ROAS — should bid higher' },
  { kw:'edge control',              bid:0.85, roas:7.0,  status:'increase', pct:'+25%', reason:'7x ROAS — room to scale' },
  { kw:'braiding hair leeds',       bid:0.65, roas:3.5,  status:'increase', pct:'+15%', reason:'Local high-intent term' },
  { kw:'human hair extensions',     bid:0.90, roas:11.3, status:'increase', pct:'+40%', reason:'Massively underinvested — 11.29x' },
  { kw:'wigs leeds',                bid:0.75, roas:3.1,  status:'increase', pct:'+20%', reason:'Local wig search — good ROAS' },
  { kw:'synthetic wigs',            bid:1.20, roas:0.48, status:'decrease', pct:'-60%', reason:'0.48x ROAS — losing money' },
  { kw:'hair salon',                bid:0.95, roas:0.89, status:'pause',    pct:'PAUSE', reason:'Service intent — wrong audience' },
  { kw:'cheap wigs',                bid:0.80, roas:1.42, status:'decrease', pct:'-30%', reason:'Low ROAS — reduce not pause' },
  { kw:'relaxer',                   bid:0.55, roas:2.40, status:'monitor',  pct:'Keep',  reason:'Monitor — above 2x' },
  { kw:'ors relaxer',               bid:0.45, roas:2.84, status:'increase', pct:'+20%', reason:'Brand + good ROAS' },
]

const TABS = ['Overview','Campaigns','Devices','Locations','Timings','Keywords','Wasted Spend','Tasks']

function Stat({ label, value, sub, subColor, border }) {
  return (
    <div style={{background:T.surface,border:`0.5px solid ${border||T.border}`,borderRadius:8,padding:'12px 14px'}}>
      <div style={{fontSize:10,color:T.textMuted,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.04em'}}>{label}</div>
      <div style={{fontSize:20,fontWeight:600,color:T.text,marginBottom:2}}>{value}</div>
      {sub && <div style={{fontSize:11,color:subColor||T.textMuted}}>{sub}</div>}
    </div>
  )
}

function Badge({ text, color, bg }) {
  return <span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:bg,color,flexShrink:0}}>{text}</span>
}

function StatusBadge({ status }) {
  const map = {
    scale:   { bg:T.greenBg,  c:T.green,  t:'Scale now' },
    urgent:  { bg:'#fff0f0',  c:'#b91c1c', t:'Urgent — scale' },
    pause:   { bg:T.redBg,    c:T.red,    t:'Pause' },
    kill:    { bg:'#1f2328',  c:'#fff',   t:'Delete' },
    monitor: { bg:T.amberBg,  c:T.amber,  t:'Monitor' },
  }
  const s = map[status] || map.monitor
  return <Badge text={s.t} color={s.c} bg={s.bg}/>
}

function RoasBar({ roas, max=12 }) {
  const pct = Math.min((roas/max)*100, 100)
  const color = roas>=4?T.green:roas>=2?T.amber:T.red
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div style={{flex:1,height:5,background:T.borderLight,borderRadius:99,overflow:'hidden',border:`0.5px solid ${T.border}`}}>
        <div style={{width:`${pct}%`,height:'100%',background:color,borderRadius:99}}/>
      </div>
      <span style={{fontSize:11,fontWeight:600,color,minWidth:36,textAlign:'right'}}>{roas}x</span>
    </div>
  )
}

function TH({ children }) {
  return <th style={{padding:'8px 12px',fontSize:10,fontWeight:600,color:T.textMuted,textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left',background:T.bg,borderBottom:`0.5px solid ${T.border}`,whiteSpace:'nowrap'}}>{children}</th>
}
function TD({ children, color, bold }) {
  return <td style={{padding:'9px 12px',fontSize:12,color:color||T.text,fontWeight:bold?600:400,borderBottom:`0.5px solid ${T.borderLight}`,verticalAlign:'middle'}}>{children}</td>
}

export default function PaidAds() {
  const { isManager } = useAuth()
  const [tab, setTab] = useState('Overview')
  const [tasksDone, setTasksDone] = useState({})
  const [uploadData, setUploadData] = useState(null)

  useEffect(() => {
    try {
      const t = localStorage.getItem('cc_ads_tasks'); if(t) setTasksDone(JSON.parse(t))
      const u = localStorage.getItem('cc_data_upload'); if(u) setUploadData(JSON.parse(u))
    } catch(e){}
  }, [])

  function toggleTask(id) {
    const u = { ...tasksDone, [id]: !tasksDone[id] }
    setTasksDone(u); localStorage.setItem('cc_ads_tasks', JSON.stringify(u))
  }

  if (!isManager) return (
    <Shell title="Paid Ads" subtitle="Manager access only">
      <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:48,textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:12}}>🔒</div>
        <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:6}}>Manager access only</div>
        <div style={{fontSize:13,color:T.textMuted}}>Sign out and enter the manager PIN (1979) to access financial data.</div>
      </div>
    </Shell>
  )

  const totalTasks = 15
  const doneTasks = Object.values(tasksDone).filter(Boolean).length
  const pct = Math.round(doneTasks/totalTasks*100)

  return (
    <>
      <Head><title>Paid Ads — CC Intelligence</title></Head>
      <Shell title="Paid Ads — Deep Analysis" subtitle="3 Apr 2024 – 3 Apr 2026 · 2 full years of real Google Ads data">

        {uploadData && (
          <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:8,padding:'9px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:8,fontSize:12,color:T.blue}}>
            <span>📥</span> Last data upload: {new Date(uploadData.timestamp).toLocaleDateString('en-GB')} — {uploadData.adsFile}
          </div>
        )}

        {/* Top stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,minmax(0,1fr))',gap:8,marginBottom:14}}>
          <Stat label="2yr Spend"    value="£34,697" sub="All campaigns"       subColor={T.textMuted}/>
          <Stat label="2yr Revenue"  value="£61,952" sub="Tracked conversions" subColor={T.green}/>
          <Stat label="Overall ROAS" value="1.79x"   sub="Target: 3x+"         subColor={T.amber}/>
          <Stat label="Conversions"  value="3,291"   sub="2 year total"        subColor={T.textMuted}/>
          <Stat label="Wasted"       value="£32,160" sub="93% of spend"        subColor={T.red} border={T.redBorder}/>
          <Stat label="Best CPA"     value="£0.03"   sub="Matrix Matte"        subColor={T.green} border={T.greenBorder}/>
        </div>

        {/* Sub tabs */}
        <div style={{display:'flex',gap:0,borderBottom:`0.5px solid ${T.border}`,marginBottom:14,overflowX:'auto'}}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'7px 14px',fontSize:12,fontWeight:tab===t?600:400,
              color:tab===t?T.blue:T.textMuted,background:'none',border:'none',
              borderBottom:tab===t?`2px solid ${T.blue}`:'2px solid transparent',
              whiteSpace:'nowrap',cursor:'pointer',
            }}>{t}{t==='Tasks'?` (${doneTasks}/${totalTasks})`:''}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab==='Overview' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <div style={{padding:'10px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.bg}}>
                  <span style={{fontSize:12,fontWeight:600,color:T.text}}>ROAS by campaign status</span>
                </div>
                <div style={{padding:'12px 14px'}}>
                  {[{l:'Human Hair Brands',r:11.29,s:'urgent'},{l:'Edge Control',r:7.00,s:'scale'},{l:'Braiding Hair',r:3.50,s:'scale'},{l:'Shopify Desktop',r:3.97,s:'scale'},{l:'Relaxers',r:2.40,s:'monitor'},{l:'Shopify Mobile',r:1.67,s:'monitor'},{l:'Synthetic Wigs',r:0.48,s:'pause'}].map((i,x)=>(
                    <div key={x} style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                        <span style={{fontSize:11,color:T.text}}>{i.l}</span>
                        <StatusBadge status={i.s}/>
                      </div>
                      <RoasBar roas={i.r}/>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{background:T.redBg,border:`0.5px solid ${T.redBorder}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.red,marginBottom:6}}>🚨 Biggest waste — fix today</div>
                  {[{l:'Energy drinks (Monster, Red Bull, Sour Patch)',v:'£1,284',r:'0.26x'},{l:'Hair salon searches (service intent)',v:'£1,560',r:'0.82x'},{l:'Synthetic Wigs 2026 campaign',v:'£1,240',r:'0.48x'}].map((i,x)=>(
                    <div key={x} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:x<2?`0.5px solid ${T.redBorder}`:'none'}}>
                      <span style={{fontSize:11,color:T.red}}>{i.l}</span>
                      <span style={{fontSize:11,fontWeight:600,color:T.red}}>{i.v} at {i.r}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.green,marginBottom:6}}>🚀 Scale these now</div>
                  {[{l:'Human Hair Brands — only £62 spend!',v:'11.29x'},{l:'Matrix Matte Definer',v:'1000x'},{l:'Bsset Curl Cream — highest volume',v:'11x'}].map((i,x)=>(
                    <div key={x} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:x<2?`0.5px solid ${T.greenBorder}`:'none'}}>
                      <span style={{fontSize:11,color:T.green}}>{i.l}</span>
                      <span style={{fontSize:11,fontWeight:600,color:T.green}}>{i.v} ROAS</span>
                    </div>
                  ))}
                </div>
                <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.amber,marginBottom:6}}>⚠️ Device split problem</div>
                  <div style={{fontSize:11,color:T.amber}}>86% of spend is on mobile at 1.67x ROAS. Desktop gets 13% of spend at 3.94x ROAS. You are massively overfunding the wrong device.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGNS */}
        {tab==='Campaigns' && (
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
              <thead><tr>
                <TH>Campaign</TH><TH>Device</TH><TH>Spend</TH><TH>Revenue</TH><TH>ROAS</TH><TH>Conv.</TH><TH>CPA</TH><TH>Status</TH><TH>Action</TH>
              </tr></thead>
              <tbody>
                {CAMPAIGNS.map((c,i)=>(
                  <tr key={i} style={{background:c.status==='kill'?'#fff8f8':c.status==='urgent'?'#f0fff4':'transparent'}}>
                    <TD bold>{c.name}</TD>
                    <TD>{c.device}</TD>
                    <TD color={T.textMuted}>£{c.spend.toLocaleString()}</TD>
                    <TD color={c.roas>=3?T.green:c.roas>=2?T.amber:T.red}>£{c.rev.toLocaleString()}</TD>
                    <TD><RoasBar roas={c.roas}/></TD>
                    <TD>{c.conv.toLocaleString()}</TD>
                    <TD color={c.cpa<5?T.green:c.cpa<15?T.amber:T.red}>£{c.cpa.toFixed(2)}</TD>
                    <TD><StatusBadge status={c.status}/></TD>
                    <TD color={T.textMuted}>{c.action}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DEVICES */}
        {tab==='Devices' && (
          <div>
            <div style={{background:T.redBg,border:`0.5px solid ${T.redBorder}`,borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:12,color:T.red,fontWeight:500}}>
              ⚠️ Critical device imbalance — 86% of budget on mobile (1.66x ROAS) vs 13% on desktop (3.94x ROAS). Shift budget to desktop immediately.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10,marginBottom:14}}>
              {DEVICES.map((d,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${d.roas>=3?T.greenBorder:d.roas>=2?T.amberBorder:T.redBorder}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:10}}>{d.device} <span style={{fontSize:11,fontWeight:400,color:T.textMuted}}>({d.pct}% of budget)</span></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                    {[{l:'Spend',v:`£${d.spend.toLocaleString()}`},{l:'Revenue',v:`£${d.rev.toLocaleString()}`},{l:'Conv.',v:d.conv},{l:'CPA',v:`£${d.cpa.toFixed(2)}`}].map((s,x)=>(
                      <div key={x}><div style={{fontSize:10,color:T.textMuted}}>{s.l}</div><div style={{fontSize:14,fontWeight:600,color:T.text}}>{s.v}</div></div>
                    ))}
                  </div>
                  <RoasBar roas={d.roas}/>
                  <div style={{marginTop:8,fontSize:11,color:d.roas>=3?T.green:d.roas>=2?T.amber:T.red,fontWeight:500}}>
                    {d.device==='Mobile'?'Reduce budget 40% — below target ROAS':d.device==='Desktop'?'Scale — best ROAS, underinvested':'Increase tablet bid +20%'}
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><TH>Device</TH><TH>Budget %</TH><TH>Spend</TH><TH>Revenue</TH><TH>ROAS</TH><TH>Conversions</TH><TH>CPA</TH><TH>Recommended action</TH></tr></thead>
                <tbody>
                  {DEVICES.map((d,i)=>(
                    <tr key={i}>
                      <TD bold>{d.device}</TD>
                      <TD><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:60,height:5,background:T.borderLight,borderRadius:99,overflow:'hidden'}}><div style={{width:`${d.pct}%`,height:'100%',background:d.roas>=3?T.green:d.roas>=2?T.amber:T.red,borderRadius:99}}/></div><span style={{fontSize:11}}>{d.pct}%</span></div></TD>
                      <TD>£{d.spend.toLocaleString()}</TD>
                      <TD color={T.green}>£{d.rev.toLocaleString()}</TD>
                      <TD><RoasBar roas={d.roas}/></TD>
                      <TD>{d.conv}</TD>
                      <TD color={d.cpa<10?T.green:d.cpa<15?T.amber:T.red}>£{d.cpa.toFixed(2)}</TD>
                      <TD color={T.textMuted}>{d.device==='Mobile'?'Reduce bid modifier -40%':d.device==='Desktop'?'Increase budget +50%':'Increase bid modifier +20%'}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOCATIONS */}
        {tab==='Locations' && (
          <div>
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:12,color:T.green,fontWeight:500}}>
              Leeds and Bradford deliver the best ROAS. London and Glasgow are wasting budget. Shift spend to Yorkshire.
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><TH>City / Region</TH><TH>Spend</TH><TH>Conv.</TH><TH>ROAS</TH><TH>CPA</TH><TH>Recommended action</TH></tr></thead>
                <tbody>
                  {LOCATIONS.map((l,i)=>(
                    <tr key={i} style={{background:l.roas<1?T.redBg:'transparent'}}>
                      <TD bold>{l.city}</TD>
                      <TD>£{l.spend.toLocaleString()}</TD>
                      <TD>{l.conv}</TD>
                      <TD><RoasBar roas={l.roas} max={4}/></TD>
                      <TD color={l.cpa<20?T.green:l.cpa<40?T.amber:T.red}>£{l.cpa.toFixed(2)}</TD>
                      <TD color={l.roas<1?T.red:l.roas<2?T.amber:T.green}>{l.action}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TIMINGS */}
        {tab==='Timings' && (
          <div>
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:12,color:T.green}}>
              Evening 6pm–9pm is your best converting window (3.42x ROAS). Night ads (12am–6am) waste money at 1.24x ROAS — add a dayparting exclusion.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',gap:8,marginBottom:14}}>
              {TIMINGS.map((t,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${t.roas>=3?T.greenBorder:t.roas>=2?T.amberBorder:T.redBorder}`,borderRadius:8,padding:'10px 10px',textAlign:'center'}}>
                  <div style={{fontSize:10,fontWeight:600,color:T.textMuted,marginBottom:4}}>{t.hour}</div>
                  <div style={{fontSize:18,fontWeight:700,color:t.roas>=3?T.green:t.roas>=2?T.amber:T.red,marginBottom:2}}>{t.roas}x</div>
                  <div style={{fontSize:9,color:T.textMuted,marginBottom:6}}>{t.label}</div>
                  <div style={{height:4,background:T.borderLight,borderRadius:99,overflow:'hidden'}}>
                    <div style={{width:`${(t.roas/4)*100}%`,height:'100%',background:t.roas>=3?T.green:t.roas>=2?T.amber:T.red,borderRadius:99}}/>
                  </div>
                  <div style={{fontSize:9,color:T.textMuted,marginTop:4}}>£{t.spend.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>Recommended dayparting adjustments</div>
              {[
                {t:'6pm–9pm', a:'+20% bid modifier — best ROAS window', c:T.green},
                {t:'9am–6pm', a:'Keep current — solid 2.6x+ ROAS', c:T.amber},
                {t:'6am–9am', a:'Keep — morning browsing converts at 2.1x', c:T.amber},
                {t:'12am–6am', a:'EXCLUDE entirely — 1.24x ROAS, wasting £2,137 over 2 years', c:T.red},
              ].map((r,i)=>(
                <div key={i} style={{display:'flex',gap:10,padding:'6px 0',borderBottom:i<3?`0.5px solid ${T.borderLight}`:'none'}}>
                  <span style={{fontSize:12,fontWeight:600,color:T.text,minWidth:90}}>{r.t}</span>
                  <span style={{fontSize:12,color:r.c}}>{r.a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KEYWORDS */}
        {tab==='Keywords' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden',marginBottom:12}}>
              <div style={{padding:'10px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:12,fontWeight:600,color:T.text}}>Top converting keywords — bid adjustments</span>
                <Badge text="Increase bids on green · Decrease on red" color={T.textMuted} bg={T.bg}/>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><TH>Keyword</TH><TH>Current bid</TH><TH>ROAS</TH><TH>Action</TH><TH>Change</TH><TH>Reason</TH></tr></thead>
                <tbody>
                  {BID_KEYWORDS.map((k,i)=>(
                    <tr key={i} style={{background:k.status==='pause'?T.redBg:'transparent'}}>
                      <TD bold>{k.kw}</TD>
                      <TD>£{k.bid.toFixed(2)}</TD>
                      <TD><RoasBar roas={k.roas} max={12}/></TD>
                      <TD><Badge text={k.status==='increase'?'Increase':k.status==='decrease'?'Decrease':k.status==='pause'?'Pause':'Monitor'} color={k.status==='increase'?T.green:k.status==='decrease'?T.amber:k.status==='pause'?T.red:T.textMuted} bg={k.status==='increase'?T.greenBg:k.status==='decrease'?T.amberBg:k.status==='pause'?T.redBg:T.bg}/></TD>
                      <TD color={k.status==='increase'?T.green:k.status==='pause'?T.red:T.amber} bold>{k.pct}</TD>
                      <TD color={T.textMuted}>{k.reason}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
              <div style={{padding:'10px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.bg}}>
                <span style={{fontSize:12,fontWeight:600,color:T.text}}>Top converters — full detail</span>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><TH>Search term</TH><TH>Conv.</TH><TH>CPA</TH><TH>ROAS</TH><TH>Spend</TH><TH>Revenue</TH><TH>Action</TH></tr></thead>
                <tbody>
                  {TOP_CONVERTERS.map((k,i)=>(
                    <tr key={i}>
                      <TD bold>{k.term}</TD>
                      <TD color={T.green}>{k.conv}</TD>
                      <TD color={T.green}>£{k.cpa.toFixed(2)}</TD>
                      <TD><RoasBar roas={Math.min(k.roas,12)} max={12}/></TD>
                      <TD color={T.textMuted}>£{k.spend.toFixed(2)}</TD>
                      <TD color={T.green}>£{k.rev}</TD>
                      <TD color={T.green}>{k.action}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WASTED SPEND */}
        {tab==='Wasted Spend' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10,marginBottom:12}}>
              <Stat label="Total wasted 2yr" value="£32,160" sub="93% of total spend" subColor={T.red} border={T.redBorder}/>
              <Stat label="Energy drinks alone" value="£1,284" sub="Zero conversions" subColor={T.red} border={T.redBorder}/>
              <Stat label="Service intent waste" value="£2,560" sub="Salon/styling searches" subColor={T.amber} border={T.amberBorder}/>
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
              <div style={{padding:'10px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.redBg,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:12,fontWeight:600,color:T.red}}>Wasted spend — add these as negative keywords</span>
                <Badge text="Add all as negatives in Google Ads" color={T.red} bg={T.redBg}/>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><TH>Search term</TH><TH>Wasted spend</TH><TH>Conv.</TH><TH>ROAS</TH><TH>Action required</TH></tr></thead>
                <tbody>
                  {WASTED.map((w,i)=>(
                    <tr key={i} style={{background:w.roas===0?'#fff8f8':'transparent'}}>
                      <TD bold>{w.term}</TD>
                      <TD color={T.red}>£{w.spend.toLocaleString()}</TD>
                      <TD color={w.conv===0?T.red:T.amber}>{w.conv}</TD>
                      <TD><RoasBar roas={w.roas} max={3}/></TD>
                      <TD color={w.roas===0?T.red:T.amber}>{w.action}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TASKS */}
        {tab==='Tasks' && (
          <div style={{maxWidth:860}}>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px',marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:12,fontWeight:600,color:T.text}}>Task progress</span>
                <span style={{fontSize:11,color:T.textMuted}}>{doneTasks}/{totalTasks} · {pct}%</span>
              </div>
              <div style={{height:5,background:T.borderLight,borderRadius:99,border:`0.5px solid ${T.border}`,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${pct}%`,background:pct===100?T.green:T.blue,borderRadius:99,transition:'width 0.3s'}}/>
              </div>
            </div>
            {[
              { title:'🚨 Critical — do today', color:T.red, items:[
                {id:'at1',text:'Add energy drink negative keywords — Red Bull, Monster, Sour Patch Kids (£1,284 wasted at 0.26x ROAS)'},
                {id:'at2',text:'PAUSE Synthetic Wigs 2026 campaign — 0.48x ROAS, losing £1,240'},
                {id:'at3',text:'DELETE March 2018 campaign — old test campaign'},
              ]},
              { title:'📱 Device adjustments', color:T.blue, items:[
                {id:'at4',text:'Reduce Shopify All Products mobile bid -40% — 1.67x ROAS on mobile'},
                {id:'at5',text:'Increase Shopify All Products desktop budget +50% — 3.97x ROAS'},
                {id:'at6',text:'Add tablet bid modifier +20% across all campaigns — 3x+ ROAS'},
              ]},
              { title:'📍 Location adjustments', color:T.amber, items:[
                {id:'at7',text:'Reduce London bid -40% — 1.24x ROAS, £4,210 spend'},
                {id:'at8',text:'PAUSE Glasgow targeting — 0.71x ROAS'},
                {id:'at9',text:'Increase Leeds and Bradford bids +15% — best ROAS cities'},
              ]},
              { title:'⏰ Timing adjustments', color:T.purple, items:[
                {id:'at10',text:'Add dayparting exclusion 12am–6am — 1.24x ROAS, wasting £2,137'},
                {id:'at11',text:'Add +20% bid modifier for 6pm–9pm slot — 3.42x ROAS'},
              ]},
              { title:'🚀 Scale these now', color:T.green, items:[
                {id:'at12',text:'Scale Human Hair Brands campaign to £500/month — 11.29x ROAS, only £62 spend in 2 years'},
                {id:'at13',text:'Add exact match for "naturally straight beautiful textures" — 7 conv at £0.04 CPA'},
                {id:'at14',text:'Add exact match for "matrix matte definer" — 5 conv at £0.03 CPA, 1000x ROAS'},
                {id:'at15',text:'Increase bsset curl cream budget — 24 conversions, highest volume converter in account'},
              ]},
            ].map((group,gi)=>(
              <div key={gi} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden',marginBottom:10}}>
                <div style={{padding:'9px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:12,fontWeight:600,color:T.text}}>{group.title}</span>
                  <span style={{fontSize:11,color:T.textMuted}}>{group.items.filter(i=>tasksDone[i.id]).length}/{group.items.length}</span>
                </div>
                {group.items.map((item,ii)=>(
                  <div key={item.id} onClick={()=>toggleTask(item.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',borderBottom:ii<group.items.length-1?`0.5px solid ${T.borderLight}`:'none',cursor:'pointer',background:tasksDone[item.id]?T.greenBg:'transparent'}}>
                    <div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${tasksDone[item.id]?T.green:T.border}`,background:tasksDone[item.id]?T.green:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {tasksDone[item.id]&&<svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span style={{fontSize:12,color:tasksDone[item.id]?T.textMuted:T.text,textDecoration:tasksDone[item.id]?'line-through':'none',lineHeight:1.4}}>{item.text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Shell>
    </>
  )
}
