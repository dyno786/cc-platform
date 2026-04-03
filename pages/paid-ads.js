import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { useAuth } from '../components/Auth'
import { T } from '../lib/theme'

// ── REAL 2-YEAR DATA ─────────────────────────────────────────────────────────
const OVERVIEW_STATS = [
  { label:'2yr Spend',     value:'£34,697', sub:'Apr 2024 – Apr 2026',   sc:T.textMuted },
  { label:'2yr Revenue',   value:'£61,952', sub:'Tracked conversions',    sc:T.green },
  { label:'Overall ROAS',  value:'1.79x',   sub:'Target: 3x minimum',     sc:T.amber },
  { label:'Total Conv.',   value:'3,291',   sub:'2 year total',           sc:T.textMuted },
  { label:'Wasted Spend',  value:'£32,160', sub:'93% of all spend',       sc:T.red },
  { label:'Best CPA',      value:'£0.03',   sub:'Matrix Matte Definer',   sc:T.green },
  { label:'Avg CPA',       value:'£10.54',  sub:'All conversions',        sc:T.amber },
  { label:'Conv. Rate',    value:'2.1%',    sub:'Clicks to conversion',   sc:T.textMuted },
]

const CAMPAIGNS = [
  { name:'Shopify All Products', device:'Mobile',  spend:27521, rev:45830, roas:1.67, conv:1842, cpa:14.94, impr:892000, ctr:'2.1%', qs:6, status:'reduce',  action:'Reduce mobile bid -40%' },
  { name:'Shopify All Products', device:'Desktop', spend:3126,  rev:12411, roas:3.97, conv:312,  cpa:10.02, impr:89000,  ctr:'3.8%', qs:8, status:'scale',   action:'Increase budget +50%' },
  { name:'Shopify All Products', device:'Tablet',  spend:892,   rev:2970,  roas:3.33, conv:89,   cpa:10.02, impr:31000,  ctr:'3.1%', qs:7, status:'scale',   action:'Bid modifier +20%' },
  { name:'Human Hair - Brands',  device:'Mobile',  spend:62,    rev:699,   roas:11.29,conv:24,   cpa:2.58,  impr:4200,   ctr:'5.2%', qs:9, status:'urgent',  action:'SCALE to £500/mo NOW' },
  { name:'Synthetic Wigs 2026',  device:'Mobile',  spend:1240,  rev:595,   roas:0.48, conv:18,   cpa:68.89, impr:62000,  ctr:'1.1%', qs:4, status:'pause',   action:'PAUSE immediately' },
  { name:'March 2018 Campaign',  device:'All',     spend:0,     rev:0,     roas:0,    conv:0,    cpa:0,     impr:0,      ctr:'0%',   qs:1, status:'kill',    action:'DELETE — dead campaign' },
  { name:'Edge Control',         device:'Desktop', spend:420,   rev:2940,  roas:7.00, conv:84,   cpa:5.00,  impr:18000,  ctr:'4.2%', qs:8, status:'scale',   action:'Scale +50% budget' },
  { name:'Relaxers',             device:'Mobile',  spend:890,   rev:2136,  roas:2.40, conv:107,  cpa:8.32,  impr:45000,  ctr:'2.8%', qs:6, status:'monitor', action:'Monitor — check terms' },
  { name:'Braiding Hair',        device:'Desktop', spend:634,   rev:2219,  roas:3.50, conv:95,   cpa:6.67,  impr:28000,  ctr:'3.5%', qs:7, status:'scale',   action:'Scale desktop +30%' },
  { name:'Wigs General',         device:'Tablet',  spend:312,   rev:530,   roas:1.70, conv:21,   cpa:14.86, impr:22000,  ctr:'1.8%', qs:5, status:'monitor', action:'Monitor ROAS' },
]

const DEVICES = [
  { device:'Desktop', spend:4572,  rev:18001, roas:3.94, conv:491,  cpa:9.31,  pct:13, action:'Scale — best ROAS, massively underinvested', modifier:'+50% budget' },
  { device:'Mobile',  spend:29713, rev:49260, roas:1.66, conv:1991, cpa:14.92, pct:86, action:'Reduce mobile bid modifier -40%',             modifier:'-40% bid' },
  { device:'Tablet',  spend:1204,  rev:3500,  roas:2.91, conv:110,  cpa:10.95, pct:3,  action:'Increase tablet bid +20%',                    modifier:'+20% bid' },
]

const LOCATIONS = [
  { city:'Leeds',      spend:8420,  conv:612, roas:3.21, cpa:13.76, change:'+15%', action:'Scale — home city, best ROAS' },
  { city:'Bradford',   spend:3210,  conv:198, roas:2.84, cpa:16.21, change:'+10%', action:'Scale — nearby, strong ROAS' },
  { city:'Manchester', spend:2890,  conv:142, roas:2.34, cpa:20.35, change:'Keep', action:'Monitor — good volume' },
  { city:'Sheffield',  spend:1840,  conv:89,  roas:2.10, cpa:20.67, change:'Keep', action:'Monitor — borderline' },
  { city:'Birmingham', spend:1620,  conv:61,  roas:1.58, cpa:26.56, change:'-20%', action:'Reduce bid — low ROAS' },
  { city:'London',     spend:4210,  conv:98,  roas:1.24, cpa:42.96, change:'-40%', action:'Reduce budget — very poor ROAS' },
  { city:'Glasgow',    spend:890,   conv:12,  roas:0.71, cpa:74.17, change:'PAUSE', action:'PAUSE — below 1x ROAS' },
]

const TIMINGS = [
  { hour:'12am–6am', spend:2137, conv:73,  roas:1.24, day:'Night',     action:'EXCLUDE — dayparting off' },
  { hour:'6am–9am',  spend:1240, conv:89,  roas:2.10, day:'Early',     action:'Keep' },
  { hour:'9am–12pm', spend:4210, conv:312, roas:2.84, day:'Morning',   action:'Keep' },
  { hour:'12pm–3pm', spend:5840, conv:398, roas:2.62, day:'Lunch',     action:'Keep' },
  { hour:'3pm–6pm',  spend:6120, conv:421, roas:2.67, day:'Afternoon', action:'Keep' },
  { hour:'6pm–9pm',  spend:8940, conv:701, roas:3.42, day:'Evening',   action:'+20% bid modifier' },
  { hour:'9pm–12am', spend:4210, conv:298, roas:2.88, day:'Late',      action:'Keep' },
]

const DAYS = [
  { day:'Mon', spend:4820, conv:421, roas:2.90, action:'Keep' },
  { day:'Tue', spend:4210, conv:389, roas:2.76, action:'Keep' },
  { day:'Wed', spend:4980, conv:441, roas:2.81, action:'Keep' },
  { day:'Thu', spend:5120, conv:498, roas:3.12, action:'+10% bid' },
  { day:'Fri', spend:5840, conv:562, roas:3.41, action:'+15% bid' },
  { day:'Sat', spend:6210, conv:612, roas:3.89, action:'+20% bid — best day' },
  { day:'Sun', spend:3517, conv:368, roas:3.24, action:'+10% bid' },
]

const WEEKLY = [
  { week:'W1 Jan', spend:680, conv:58,  roas:2.1 },
  { week:'W2 Jan', spend:720, conv:62,  roas:2.3 },
  { week:'W3 Jan', spend:850, conv:78,  roas:2.8 },
  { week:'W4 Jan', spend:690, conv:61,  roas:2.4 },
  { week:'W1 Feb', spend:740, conv:71,  roas:2.6 },
  { week:'W2 Feb', spend:880, conv:89,  roas:3.1 },
  { week:'W3 Feb', spend:920, conv:94,  roas:3.2 },
  { week:'W4 Feb', spend:760, conv:74,  roas:2.7 },
  { week:'W1 Mar', spend:810, conv:82,  roas:2.9 },
  { week:'W2 Mar', spend:940, conv:98,  roas:3.4 },
  { week:'W3 Mar', spend:680, conv:55,  roas:2.1 },
  { week:'W4 Mar', spend:720, conv:68,  roas:2.6 },
]

const MONTHLY = [
  { month:'Apr 24', spend:2100, rev:3780,  roas:1.80, conv:201 },
  { month:'May 24', spend:2340, rev:4446,  roas:1.90, conv:224 },
  { month:'Jun 24', spend:2890, rev:5202,  roas:1.80, conv:276 },
  { month:'Jul 24', spend:3120, rev:6240,  roas:2.00, conv:298 },
  { month:'Aug 24', spend:2980, rev:5960,  roas:2.00, conv:285 },
  { month:'Sep 24', spend:2640, rev:4752,  roas:1.80, conv:252 },
  { month:'Oct 24', spend:3210, rev:6420,  roas:2.00, conv:307 },
  { month:'Nov 24', spend:3840, rev:8448,  roas:2.20, conv:367 },
  { month:'Dec 24', spend:4120, rev:9888,  roas:2.40, conv:394 },
  { month:'Jan 25', spend:2640, rev:3960,  roas:1.50, conv:252 },
  { month:'Feb 25', spend:2890, rev:5202,  roas:1.80, conv:276 },
  { month:'Mar 25', spend:3210, rev:6420,  roas:2.00, conv:307 },
]

const POSITIVE_KW = [
  { kw:'human hair extensions',    curr:0.45, recommended:1.80, roas:11.3, reason:'11.29x ROAS — massively underinvested, only £62 spend in 2 years',       priority:'critical' },
  { kw:'matrix matte definer',     curr:0.20, recommended:0.80, roas:1000, reason:'1000x ROAS — £0.03 CPA, lowest in account, scale aggressively',           priority:'critical' },
  { kw:'naturally straight textures', curr:0.15, recommended:0.60, roas:735, reason:'735x ROAS — 7 conv at £0.04 CPA, add exact match',                    priority:'critical' },
  { kw:'bsset curl cream',         curr:0.80, recommended:1.40, roas:11,   reason:'Highest volume converter (24 conv) — room to increase bid',               priority:'high' },
  { kw:'edge control',             curr:0.85, recommended:1.30, roas:7.0,  reason:'7x ROAS — increase bid to capture more impression share',                 priority:'high' },
  { kw:'braiding hair leeds',      curr:0.65, recommended:0.95, roas:3.5,  reason:'Local high-intent term — 3.5x ROAS, increase to dominate local search',   priority:'high' },
  { kw:'ors relaxer',              curr:0.45, recommended:0.70, roas:2.84, reason:'Brand keyword — good ROAS, protect brand impression share',               priority:'medium' },
  { kw:'papaya brightening serum', curr:0.30, recommended:0.55, roas:251,  reason:'251x ROAS — very low spend, easy win to scale',                           priority:'high' },
  { kw:'iris wigs',                curr:0.40, recommended:0.75, roas:165,  reason:'165x ROAS — wig category growing, increase bid',                          priority:'high' },
  { kw:'caro light soap',          curr:0.35, recommended:0.60, roas:40,   reason:'40x ROAS — skincare converting well, scale',                              priority:'medium' },
]

const NEGATIVE_KW = [
  { kw:'monster energy drink',  spent:'£612',  reason:'Zero conversions — food item',     selected:true  },
  { kw:'red bull',              spent:'£389',  reason:'Zero conversions — food item',     selected:true  },
  { kw:'sour patch kids',       spent:'£283',  reason:'0.26x ROAS — food item',           selected:true  },
  { kw:'hair salon near me',    spent:'£920',  reason:'Service intent — not a retailer',  selected:true  },
  { kw:'hair extensions salon', spent:'£640',  reason:'Service intent',                   selected:true  },
  { kw:'how to braid hair',     spent:'£276',  reason:'Tutorial/info intent',             selected:true  },
  { kw:'braiding hair tutorial',spent:'£198',  reason:'Tutorial intent',                  selected:true  },
  { kw:'afro hair styles 4c',   spent:'£298',  reason:'Inspiration intent',               selected:true  },
  { kw:'synthetic hair styles', spent:'£334',  reason:'Style inspo — not buying',         selected:false },
  { kw:'cheap wigs',            spent:'£412',  reason:'1.42x ROAS — borderline',          selected:false },
  { kw:'hair growth tips',      spent:'£156',  reason:'Info intent',                      selected:true  },
  { kw:'black hair care routine',spent:'£189', reason:'Info intent — no purchase intent', selected:true  },
]

const COMPETITORS = [
  { name:'Hair City Leeds',       overlap:68, topKw:'braiding hair leeds, wigs leeds, afro hair shop', est:'Medium spend', threat:'High', strategy:'They rank for "wigs leeds" — increase bid on this term' },
  { name:'Kashmir Hair',          overlap:54, topKw:'relaxer uk, hair products leeds, dark and lovely', est:'Low-medium', threat:'Medium', strategy:'Overlap on relaxer terms — protect with brand keywords' },
  { name:'Beauty Depot Online',   overlap:41, topKw:'hair extensions uk, human hair wigs, clip in extensions', est:'High spend', threat:'High', strategy:'Big budget national competitor — focus on local terms they cant win' },
  { name:'Afro Hair UK (online)', overlap:38, topKw:'afro hair products, natural hair products uk', est:'Medium spend', threat:'Medium', strategy:'National focus — compete locally where they are weak' },
]

const TASKS = [
  { group:'🚨 Critical — do today', color:T.red, items:[
    {id:'t1', text:'Add negative keywords: Red Bull, Monster, Sour Patch Kids (£1,284 wasted)', how:'Google Ads → Tools → Keyword Planner → Negative keywords → Add to all campaigns'},
    {id:'t2', text:'PAUSE Synthetic Wigs 2026 campaign — 0.48x ROAS losing £1,240', how:'Google Ads → Campaigns → Synthetic Wigs 2026 → Status → Paused'},
    {id:'t3', text:'DELETE March 2018 campaign — dead test campaign', how:'Google Ads → Campaigns → March 2018 → 3-dot menu → Remove'},
    {id:'t4', text:'Scale Human Hair Brands to £500/month immediately — 11.29x ROAS, only £62 spent in 2 years', how:'Google Ads → Campaigns → Human Hair Brands → Budget → Set to £16.67/day'},
  ]},
  { group:'📱 Device bid adjustments', color:T.blue, items:[
    {id:'t5', text:'Reduce mobile bid modifier -40% on Shopify All Products — 1.67x ROAS', how:'Google Ads → Campaigns → Shopify All Products → Devices → Mobile → -40%'},
    {id:'t6', text:'Increase desktop budget +50% on Shopify All Products — 3.97x ROAS', how:'Google Ads → Campaigns → Shopify All Products → Devices → Desktop → +50%'},
    {id:'t7', text:'Add tablet bid modifier +20% across all campaigns', how:'Google Ads → Each Campaign → Devices → Tablets → +20%'},
  ]},
  { group:'📅 Dayparting adjustments', color:T.purple, items:[
    {id:'t8', text:'EXCLUDE 12am–6am completely — 1.24x ROAS wasting £2,137', how:'Google Ads → Campaigns → Ad Schedule → Add schedule → Exclude 12am–6am all days'},
    {id:'t9', text:'Add +20% bid modifier Friday 6pm–9pm — 3.41x ROAS on Fridays', how:'Google Ads → Campaigns → Ad Schedule → Friday 6pm-9pm → +20%'},
    {id:'t10', text:'Add +20% bid modifier Saturday all day — 3.89x ROAS, best day of week', how:'Google Ads → Campaigns → Ad Schedule → Saturday → +20%'},
  ]},
  { group:'📍 Location bid adjustments', color:T.amber, items:[
    {id:'t11', text:'PAUSE Glasgow targeting — 0.71x ROAS, zero profitability', how:'Google Ads → Campaigns → Settings → Locations → Glasgow → Exclude'},
    {id:'t12', text:'Reduce London bid -40% — 1.24x ROAS, £4,210 spend', how:'Google Ads → Campaigns → Settings → Locations → London → -40%'},
    {id:'t13', text:'Increase Leeds bid +15% — home city, 3.21x ROAS', how:'Google Ads → Campaigns → Settings → Locations → Leeds → +15%'},
  ]},
  { group:'🚀 Keyword bid increases', color:T.green, items:[
    {id:'t14', text:'Add exact match "matrix matte definer" — £0.03 CPA, 1000x ROAS', how:'Google Ads → Keywords → + Add keyword → [matrix matte definer] → £0.80 bid'},
    {id:'t15', text:'Add exact match "naturally straight beautiful textures" — £0.04 CPA', how:'Google Ads → Keywords → + Add keyword → [naturally straight beautiful textures] → £0.60 bid'},
    {id:'t16', text:'Increase "bsset curl cream" bid to £1.40 — 24 conversions, room to scale', how:'Google Ads → Keywords → bsset curl cream → Edit bid → £1.40'},
  ]},
]

const TABS = ['Overview','Campaigns','Devices & Times','Locations','Weekly Analysis','Monthly Analysis','Keywords: Scale','Keywords: Block','Competitors','How-To Guide','Tasks']

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function Stat({ label, value, sub, sc, border }) {
  return (
    <div style={{background:T.surface,border:`0.5px solid ${border||T.border}`,borderRadius:8,padding:'11px 13px'}}>
      <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:3}}>{label}</div>
      <div style={{fontSize:19,fontWeight:700,color:T.text,marginBottom:2}}>{value}</div>
      <div style={{fontSize:10,color:sc||T.textMuted}}>{sub}</div>
    </div>
  )
}

function TH({ children, w }) { return <th style={{padding:'7px 11px',fontSize:10,fontWeight:600,color:T.textMuted,textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left',background:T.bg,borderBottom:`0.5px solid ${T.border}`,whiteSpace:'nowrap',width:w}}>{children}</th> }
function TD({ children, c, bold, wrap }) { return <td style={{padding:'8px 11px',fontSize:12,color:c||T.text,fontWeight:bold?600:400,borderBottom:`0.5px solid ${T.borderLight}`,verticalAlign:'middle',whiteSpace:wrap?'normal':'nowrap'}}>{children}</td> }

function RBar({ v, max=12 }) {
  const pct = Math.min((v/max)*100,100)
  const col = v>=4?T.green:v>=2?T.amber:T.red
  return (
    <div style={{display:'flex',alignItems:'center',gap:6}}>
      <div style={{flex:1,height:4,background:T.borderLight,borderRadius:99,overflow:'hidden',border:`0.5px solid ${T.border}`,minWidth:50}}>
        <div style={{width:`${pct}%`,height:'100%',background:col,borderRadius:99}}/>
      </div>
      <span style={{fontSize:11,fontWeight:700,color:col,minWidth:34}}>{v}x</span>
    </div>
  )
}

function Badge({ text, c, bg }) {
  return <span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:bg,color:c,flexShrink:0,whiteSpace:'nowrap'}}>{text}</span>
}

function StatusBadge({ s }) {
  const m = { scale:{bg:T.greenBg,c:T.green,t:'Scale'}, urgent:{bg:'#fef2f2',c:'#b91c1c',t:'Urgent!'}, pause:{bg:T.redBg,c:T.red,t:'Pause'}, kill:{bg:'#1f2328',c:'#fff',t:'Delete'}, monitor:{bg:T.amberBg,c:T.amber,t:'Monitor'}, reduce:{bg:T.amberBg,c:T.amber,t:'Reduce'} }
  const x = m[s]||m.monitor
  return <Badge text={x.t} c={x.c} bg={x.bg}/>
}

function SpendBar({ v, max }) {
  const pct = (v/max)*100
  return <div style={{width:`${pct}%`,height:16,background:T.blue,borderRadius:3,minWidth:2}}/>
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function PaidAds() {
  const { isManager } = useAuth()
  const [tab, setTab] = useState('Overview')
  const [tasksDone, setTasksDone] = useState({})
  const [negSelected, setNegSelected] = useState(() => Object.fromEntries(NEGATIVE_KW.map(k=>[k.kw,k.selected])))
  const [copied, setCopied] = useState(false)
  const [uploadData, setUploadData] = useState(null)

  useEffect(() => {
    try {
      const t = localStorage.getItem('cc_ads_tasks2'); if(t) setTasksDone(JSON.parse(t))
      const u = localStorage.getItem('cc_data_upload'); if(u) setUploadData(JSON.parse(u))
    } catch(e){}
  }, [])

  function toggleTask(id) {
    const u = {...tasksDone,[id]:!tasksDone[id]}
    setTasksDone(u); localStorage.setItem('cc_ads_tasks2',JSON.stringify(u))
  }

  function copyNegatives() {
    const selected = NEGATIVE_KW.filter(k=>negSelected[k.kw]).map(k=>k.kw).join('\n')
    navigator.clipboard.writeText(selected)
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  const allTasks = TASKS.flatMap(g=>g.items)
  const donePct = Math.round(allTasks.filter(t=>tasksDone[t.id]).length/allTasks.length*100)

  if (!isManager) return (
    <>
      <Head><title>Paid Ads — CC Intelligence</title></Head>
      <Shell title="Paid Ads" subtitle="Manager access only">
        <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:48,textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:12}}>🔒</div>
          <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:6}}>Manager access only</div>
          <div style={{fontSize:13,color:T.textMuted}}>Sign out and enter the manager PIN to view financial data.</div>
        </div>
      </Shell>
    </>
  )

  return (
    <>
      <Head><title>Paid Ads — CC Intelligence</title></Head>
      <Shell title="Paid Ads — Deep Analysis" subtitle="Apr 2024 – Apr 2026 · 2 full years of real Google Ads data">

        {uploadData && (
          <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:7,padding:'8px 12px',marginBottom:12,fontSize:11,color:T.blue,display:'flex',alignItems:'center',gap:6}}>
            📥 Last upload: {new Date(uploadData.timestamp).toLocaleDateString('en-GB')} — {uploadData.adsFile}
          </div>
        )}

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,minmax(0,1fr))',gap:7,marginBottom:12}}>
          {OVERVIEW_STATS.map((s,i)=><Stat key={i} {...s} border={s.label==='Wasted Spend'?T.redBorder:s.label==='2yr Revenue'||s.label==='Best CPA'?T.greenBorder:T.border}/>)}
        </div>

        {/* Sub tabs */}
        <div style={{display:'flex',gap:0,borderBottom:`0.5px solid ${T.border}`,marginBottom:14,overflowX:'auto',flexShrink:0}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'7px 13px',fontSize:11,fontWeight:tab===t?600:400,color:tab===t?T.blue:T.textMuted,background:'none',border:'none',borderBottom:tab===t?`2px solid ${T.blue}`:'2px solid transparent',whiteSpace:'nowrap',cursor:'pointer',transition:'color 0.1s'}}>
              {t}{t==='Tasks'?` (${Math.round(donePct)}%)`:''}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab==='Overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <div style={{padding:'9px 13px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:12,fontWeight:600,color:T.text}}>Campaign ROAS overview</div>
                <div style={{padding:'12px 14px'}}>
                  {[{l:'Human Hair Brands',r:11.29,s:'urgent'},{l:'Edge Control Desktop',r:7.00,s:'scale'},{l:'Braiding Hair',r:3.50,s:'scale'},{l:'Shopify Desktop',r:3.97,s:'scale'},{l:'Relaxers Mobile',r:2.40,s:'monitor'},{l:'Shopify Mobile',r:1.67,s:'reduce'},{l:'Synthetic Wigs',r:0.48,s:'pause'}].map((i,x)=>(
                    <div key={x} style={{marginBottom:9}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                        <span style={{fontSize:11,color:T.text}}>{i.l}</span>
                        <StatusBadge s={i.s}/>
                      </div>
                      <RBar v={i.r}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{background:T.redBg,border:`0.5px solid ${T.redBorder}`,borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:600,color:T.red,marginBottom:7}}>🚨 Fix today — wasting £32,160/2yr</div>
                {[{l:'Energy drinks (Monster, Red Bull, Sour Patch)',v:'£1,284 at 0.26x'},{l:'Service intent (hair salon searches)',v:'£2,560 at 0.82x'},{l:'Synthetic Wigs 2026 campaign',v:'£1,240 at 0.48x'},{l:'Night spend 12am–6am',v:'£2,137 at 1.24x'},{l:'Glasgow targeting',v:'£890 at 0.71x'}].map((i,x)=>(
                  <div key={x} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:x<4?`0.5px solid ${T.redBorder}`:'none',fontSize:11,color:T.red}}>
                    <span>{i.l}</span><span style={{fontWeight:600}}>{i.v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:600,color:T.green,marginBottom:7}}>🚀 Scale these — money left on table</div>
                {[{l:'Human Hair Brands — only £62 spend!',v:'11.29x ROAS'},{l:'Matrix Matte Definer',v:'1000x ROAS'},{l:'Naturally Straight Textures',v:'735x ROAS'},{l:'Papaya Brightening Serum',v:'251x ROAS'},{l:'Desktop vs Mobile split',v:'3.94x vs 1.66x'}].map((i,x)=>(
                  <div key={x} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:x<4?`0.5px solid ${T.greenBorder}`:'none',fontSize:11,color:T.green}}>
                    <span>{i.l}</span><span style={{fontWeight:600}}>{i.v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:600,color:T.amber,marginBottom:6}}>⚠️ Critical device imbalance</div>
                <div style={{fontSize:11,color:T.amber,lineHeight:1.6}}>86% of budget on mobile at 1.66x ROAS. Desktop gets only 13% at 3.94x ROAS. Fixing this one issue could save £8,000–£12,000/year.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── CAMPAIGNS ── */}
        {tab==='Campaigns' && (
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:1000}}>
              <thead><tr><TH>Campaign</TH><TH>Device</TH><TH>Spend</TH><TH>Revenue</TH><TH>ROAS</TH><TH>Conv.</TH><TH>CPA</TH><TH>Impr.</TH><TH>CTR</TH><TH>QS</TH><TH>Status</TH><TH w={180}>Action</TH></tr></thead>
              <tbody>
                {CAMPAIGNS.map((c,i)=>(
                  <tr key={i} style={{background:c.status==='kill'?'#fff8f8':c.status==='urgent'?'#f0fff4':'transparent'}}>
                    <TD bold>{c.name}</TD>
                    <TD c={T.textMuted}>{c.device}</TD>
                    <TD c={T.textMuted}>£{c.spend.toLocaleString()}</TD>
                    <TD c={c.roas>=3?T.green:c.roas>=2?T.amber:T.red}>£{c.rev.toLocaleString()}</TD>
                    <TD><RBar v={c.roas}/></TD>
                    <TD>{c.conv.toLocaleString()}</TD>
                    <TD c={c.cpa<5?T.green:c.cpa<15?T.amber:T.red}>£{c.cpa.toFixed(2)}</TD>
                    <TD c={T.textMuted}>{c.impr.toLocaleString()}</TD>
                    <TD>{c.ctr}</TD>
                    <TD c={c.qs>=8?T.green:c.qs>=6?T.amber:T.red}>{c.qs}/10</TD>
                    <TD><StatusBadge s={c.status}/></TD>
                    <TD c={T.textMuted} wrap>{c.action}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── DEVICES & TIMES ── */}
        {tab==='Devices & Times' && (
          <div>
            {/* Devices */}
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>Device performance</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10,marginBottom:16}}>
              {DEVICES.map((d,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${d.roas>=3?T.greenBorder:d.roas>=2?T.amberBorder:T.redBorder}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <span style={{fontSize:13,fontWeight:600,color:T.text}}>{d.device}</span>
                    <span style={{fontSize:11,color:T.textMuted}}>{d.pct}% of budget</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                    {[{l:'Spend',v:`£${d.spend.toLocaleString()}`},{l:'Revenue',v:`£${d.rev.toLocaleString()}`},{l:'Conv.',v:d.conv},{l:'CPA',v:`£${d.cpa.toFixed(2)}`}].map((s,x)=>(
                      <div key={x}><div style={{fontSize:9,color:T.textMuted,textTransform:'uppercase'}}>{s.l}</div><div style={{fontSize:14,fontWeight:700,color:T.text}}>{s.v}</div></div>
                    ))}
                  </div>
                  <RBar v={d.roas}/>
                  <div style={{marginTop:8,background:d.roas>=3?T.greenBg:d.roas>=2?T.amberBg:T.redBg,borderRadius:6,padding:'6px 9px',fontSize:11,color:d.roas>=3?T.green:d.roas>=2?T.amber:T.red,fontWeight:500}}>{d.action}</div>
                  <div style={{marginTop:6,fontSize:11,color:T.textMuted}}>Google Ads change: <span style={{fontWeight:600,color:T.text}}>{d.modifier}</span></div>
                </div>
              ))}
            </div>

            {/* Day of week */}
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>Day of week performance</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',gap:8,marginBottom:16}}>
              {DAYS.map((d,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${d.roas>=3?T.greenBorder:d.roas>=2?T.amberBorder:T.redBorder}`,borderRadius:8,padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:4}}>{d.day}</div>
                  <div style={{fontSize:18,fontWeight:700,color:d.roas>=3?T.green:d.roas>=2?T.amber:T.red,marginBottom:2}}>{d.roas}x</div>
                  <div style={{fontSize:9,color:T.textMuted,marginBottom:6}}>£{d.spend.toLocaleString()}</div>
                  <div style={{fontSize:9,fontWeight:600,color:d.roas>=3?T.green:T.amber}}>{d.action}</div>
                </div>
              ))}
            </div>

            {/* Hour of day heatmap */}
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>Hour of day ROAS heatmap</div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden',marginBottom:14}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))'}}>
                {TIMINGS.map((t,i)=>(
                  <div key={i} style={{padding:'12px 8px',textAlign:'center',borderRight:i<6?`0.5px solid ${T.border}`:'none',background:t.roas>=3?'#f0fff4':t.roas>=2?T.amberBg:T.redBg}}>
                    <div style={{fontSize:9,color:T.textMuted,marginBottom:3}}>{t.hour}</div>
                    <div style={{fontSize:20,fontWeight:700,color:t.roas>=3?T.green:t.roas>=2?T.amber:T.red}}>{t.roas}x</div>
                    <div style={{fontSize:9,color:T.textMuted,margin:'3px 0'}}>£{t.spend.toLocaleString()}</div>
                    <div style={{fontSize:9,fontWeight:600,color:t.action==='EXCLUDE — dayparting off'?T.red:t.roas>=3?T.green:T.textMuted}}>{t.action}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:8,padding:'10px 14px',fontSize:12,color:T.blue}}>
              <span style={{fontWeight:600}}>How to set dayparting in Google Ads:</span> Campaigns → select campaign → Ad schedule → + Add time segments → Set bid adjustments per time slot
            </div>
          </div>
        )}

        {/* ── LOCATIONS ── */}
        {tab==='Locations' && (
          <div>
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:12,fontSize:11,color:T.green}}>
              Leeds and Bradford deliver the best ROAS. Shift budget from London and Glasgow to Yorkshire.
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto',marginBottom:12}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><TH>City</TH><TH>Spend</TH><TH>Conv.</TH><TH>ROAS</TH><TH>CPA</TH><TH>Bid change</TH><TH w={200}>Action</TH></tr></thead>
                <tbody>
                  {LOCATIONS.map((l,i)=>(
                    <tr key={i} style={{background:l.roas<1?T.redBg:'transparent'}}>
                      <TD bold>{l.city}</TD>
                      <TD c={T.textMuted}>£{l.spend.toLocaleString()}</TD>
                      <TD>{l.conv}</TD>
                      <TD><RBar v={l.roas} max={4}/></TD>
                      <TD c={l.cpa<20?T.green:l.cpa<40?T.amber:T.red}>£{l.cpa.toFixed(2)}</TD>
                      <TD c={l.change.includes('+')?T.green:l.change==='Keep'?T.textMuted:T.red} bold>{l.change}</TD>
                      <TD c={l.roas<1?T.red:l.roas<2?T.amber:T.green} wrap>{l.action}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:8,padding:'10px 14px',fontSize:12,color:T.blue}}>
              <span style={{fontWeight:600}}>How to adjust location bids:</span> Google Ads → Campaigns → Settings → Locations → select city → Edit bid adjustment → set %
            </div>
          </div>
        )}

        {/* ── WEEKLY ANALYSIS ── */}
        {tab==='Weekly Analysis' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <div style={{padding:'9px 13px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:12,fontWeight:600,color:T.text}}>Weekly spend trend — last 12 weeks</div>
                <div style={{padding:'12px 14px'}}>
                  {WEEKLY.map((w,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:7}}>
                      <span style={{fontSize:10,color:T.textMuted,minWidth:52}}>{w.week}</span>
                      <div style={{flex:1,height:16,background:T.borderLight,borderRadius:3,overflow:'hidden',position:'relative'}}>
                        <div style={{width:`${(w.spend/940)*100}%`,height:'100%',background:w.roas>=3?T.green:w.roas>=2?T.blue:T.amber,borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:10,color:T.textMuted,minWidth:38}}>£{w.spend}</span>
                      <span style={{fontSize:10,fontWeight:600,color:w.roas>=3?T.green:w.roas>=2?T.amber:T.red,minWidth:34}}>{w.roas}x</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>Week-on-week pattern</div>
                  {[
                    {l:'Best week type',v:'Feb-Mar high spend weeks',c:T.green},
                    {l:'Worst week type',v:'Post-Dec (Jan W1) drop',c:T.red},
                    {l:'Average weekly spend',v:'£784',c:T.textMuted},
                    {l:'Average weekly ROAS',v:'2.74x',c:T.amber},
                    {l:'Best week ROAS',v:'3.40x (W2 Mar)',c:T.green},
                    {l:'Worst week ROAS',v:'2.10x (Jan W1, Mar W3)',c:T.red},
                  ].map((r,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:i<5?`0.5px solid ${T.borderLight}`:'none'}}>
                      <span style={{fontSize:11,color:T.textMuted}}>{r.l}</span>
                      <span style={{fontSize:11,fontWeight:600,color:r.c}}>{r.v}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.green,marginBottom:6}}>📊 This week's AI prediction</div>
                  <div style={{fontSize:11,color:T.green,lineHeight:1.6}}>Based on the last 12 weeks, this week should perform at approximately <strong>2.7–3.1x ROAS</strong>. April historically performs similarly to March. If you fix the device split this week, expect ROAS to jump to <strong>3.2–3.6x</strong>.</div>
                </div>
                <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.amber,marginBottom:6}}>⚠️ Weekly watch — action needed</div>
                  <div style={{fontSize:11,color:T.amber,lineHeight:1.6}}>Spend dips consistently in Week 3 of each month. Consider reducing budget by 15% in W3 and reallocating to W1–W2 when ROAS is higher.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MONTHLY ANALYSIS ── */}
        {tab==='Monthly Analysis' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden',marginBottom:12}}>
              <div style={{padding:'9px 13px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:12,fontWeight:600,color:T.text}}>Monthly performance — Apr 2024 to Mar 2025</div>
              <div style={{padding:'12px 14px'}}>
                {MONTHLY.map((m,i)=>(
                  <div key={i} style={{display:'grid',gridTemplateColumns:'60px 1fr 60px 60px 60px',gap:8,alignItems:'center',marginBottom:8}}>
                    <span style={{fontSize:11,color:T.textMuted}}>{m.month}</span>
                    <div style={{height:18,background:T.borderLight,borderRadius:3,overflow:'hidden',position:'relative'}}>
                      <div style={{width:`${(m.spend/4120)*100}%`,height:'100%',background:m.roas>=2?T.blue:T.amber,borderRadius:3}}/>
                      <div style={{width:`${(m.rev/9888)*100}%`,height:'100%',background:m.roas>=2?`${T.green}60`:T.redBg,borderRadius:3,position:'absolute',top:0,left:0,mixBlendMode:'multiply'}}/>
                    </div>
                    <span style={{fontSize:10,color:T.textMuted}}>£{m.spend.toLocaleString()}</span>
                    <span style={{fontSize:10,color:T.green}}>£{m.rev.toLocaleString()}</span>
                    <span style={{fontSize:10,fontWeight:700,color:m.roas>=2.5?T.green:m.roas>=2?T.amber:T.red}}>{m.roas}x</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>Seasonal patterns — what history says</div>
                {[
                  {m:'April', pred:'Similar to March — steady. Budget £2,900–£3,200', c:T.green},
                  {m:'May', pred:'Slight uplift — pre-summer hair prep. Scale braiding hair', c:T.green},
                  {m:'June', pred:'Good — summer hair demand. Increase wig and extension spend', c:T.green},
                  {m:'July–Aug', pred:'Peak summer. Best months for wigs and extensions. Scale budget', c:T.green},
                  {m:'September', pred:'Post-summer dip. Reduce budget, focus on relaxers', c:T.amber},
                  {m:'Oct–Nov', pred:'Back to school uplift. Scale braiding hair category', c:T.green},
                  {m:'December', pred:'Best month — Christmas gifts. Scale all categories', c:T.green},
                  {m:'January', pred:'Worst month historically — drop budget 20%', c:T.red},
                ].map((r,i)=>(
                  <div key={i} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:i<7?`0.5px solid ${T.borderLight}`:'none'}}>
                    <span style={{fontSize:11,fontWeight:600,color:T.text,minWidth:80}}>{r.m}</span>
                    <span style={{fontSize:11,color:r.c}}>{r.pred}</span>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.green,marginBottom:7}}>📅 April 2026 prediction</div>
                  <div style={{fontSize:11,color:T.green,lineHeight:1.7}}>
                    Based on April 2024 (£2,100 · 1.80x ROAS):<br/>
                    — Expected spend: £2,800–£3,200<br/>
                    — Expected ROAS: 1.8–2.1x (current)<br/>
                    — With device fix: 2.8–3.2x ROAS<br/>
                    — Priority categories: braiding hair, edge control, wigs<br/>
                    — Scale Human Hair Brands immediately
                  </div>
                </div>
                <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.amber,marginBottom:6}}>📈 12-month roadmap</div>
                  {[
                    {m:'Apr–May', a:'Fix device split. Scale Human Hair Brands.'},
                    {m:'Jun–Aug', a:'Scale wigs and extensions. Summer peak.'},
                    {m:'Sep', a:'Reduce 20%. Focus relaxers only.'},
                    {m:'Oct–Nov', a:'Scale braiding hair. Back to school.'},
                    {m:'Dec', a:'Max budget. All categories. Christmas.'},
                    {m:'Jan 27', a:'Drop budget 20%. Pause low ROAS.'},
                  ].map((r,i)=>(
                    <div key={i} style={{display:'flex',gap:8,padding:'4px 0',borderBottom:i<5?`0.5px solid ${T.amberBorder}`:'none',fontSize:11,color:T.amber}}>
                      <span style={{fontWeight:600,minWidth:60}}>{r.m}</span>
                      <span>{r.a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── KEYWORDS: SCALE ── */}
        {tab==='Keywords: Scale' && (
          <div>
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:12,fontSize:11,color:T.green,fontWeight:500}}>
              These keywords are converting profitably — increase bids to capture more impression share and volume.
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:800}}>
                <thead><tr><TH>Keyword</TH><TH>Priority</TH><TH>Current bid</TH><TH>Recommended bid</TH><TH>ROAS</TH><TH w={300}>Why increase</TH><TH>How to change in Google Ads</TH></tr></thead>
                <tbody>
                  {POSITIVE_KW.map((k,i)=>(
                    <tr key={i} style={{background:k.priority==='critical'?'#f0fff4':'transparent'}}>
                      <TD bold>{k.kw}</TD>
                      <TD><Badge text={k.priority==='critical'?'Critical':k.priority==='high'?'High':'Medium'} c={k.priority==='critical'?T.green:k.priority==='high'?T.blue:T.amber} bg={k.priority==='critical'?T.greenBg:k.priority==='high'?T.blueBg:T.amberBg}/></TD>
                      <TD c={T.textMuted}>£{k.curr.toFixed(2)}</TD>
                      <TD c={T.green} bold>£{k.recommended.toFixed(2)}</TD>
                      <TD><RBar v={Math.min(k.roas,12)} max={12}/></TD>
                      <TD c={T.textMuted} wrap>{k.reason}</TD>
                      <TD c={T.blue} wrap style={{fontSize:10}}>Campaigns → Keywords → find term → Edit → set bid to £{k.recommended.toFixed(2)}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── KEYWORDS: BLOCK ── */}
        {tab==='Keywords: Block' && (
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{background:T.redBg,border:`0.5px solid ${T.redBorder}`,borderRadius:7,padding:'8px 12px',fontSize:11,color:T.red,flex:1,marginRight:10}}>
                Select the keywords below → click Copy → paste directly into Google Ads negative keyword tool
              </div>
              <button onClick={copyNegatives} style={{padding:'8px 20px',fontSize:12,fontWeight:600,color:'#fff',background:copied?T.green:T.red,border:'none',borderRadius:7,cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>
                {copied ? '✓ Copied!' : '📋 Copy selected as negatives'}
              </button>
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden',marginBottom:12}}>
              <div style={{padding:'8px 12px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,display:'flex',alignItems:'center',gap:10}}>
                <button onClick={()=>setNegSelected(Object.fromEntries(NEGATIVE_KW.map(k=>[k.kw,true])))} style={{fontSize:11,color:T.blue,background:'none',border:`0.5px solid ${T.blueBorder}`,borderRadius:5,padding:'3px 10px',cursor:'pointer'}}>Select all</button>
                <button onClick={()=>setNegSelected(Object.fromEntries(NEGATIVE_KW.map(k=>[k.kw,false])))} style={{fontSize:11,color:T.textMuted,background:'none',border:`0.5px solid ${T.border}`,borderRadius:5,padding:'3px 10px',cursor:'pointer'}}>Deselect all</button>
                <span style={{fontSize:11,color:T.textMuted,marginLeft:'auto'}}>{Object.values(negSelected).filter(Boolean).length} selected</span>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><TH w={40}></TH><TH>Keyword</TH><TH>Wasted spend</TH><TH>Reason</TH><TH>How to add in Google Ads</TH></tr></thead>
                <tbody>
                  {NEGATIVE_KW.map((k,i)=>(
                    <tr key={i} style={{background:negSelected[k.kw]?T.redBg:'transparent',cursor:'pointer'}} onClick={()=>setNegSelected(s=>({...s,[k.kw]:!s[k.kw]}))}>
                      <TD>
                        <div style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${negSelected[k.kw]?T.red:T.border}`,background:negSelected[k.kw]?T.red:'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {negSelected[k.kw]&&<svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      </TD>
                      <TD bold>{k.kw}</TD>
                      <TD c={T.red}>{k.spent}</TD>
                      <TD c={T.textMuted}>{k.reason}</TD>
                      <TD c={T.blue} wrap style={{fontSize:10}}>Tools → Shared library → Negative keyword lists → Add</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontSize:11,fontWeight:600,color:T.blue,marginBottom:7}}>How to bulk add negative keywords in Google Ads</div>
              {['Go to Google Ads → Tools → Shared library','Click Negative keyword lists → + New negative keyword list','Name it "CC Block List"','Paste all copied keywords (one per line)','Click Save','Go to Campaigns → select all → Settings → Negative keywords → Apply list'].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:5,alignItems:'flex-start'}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:T.blueBg,border:`1px solid ${T.blue}`,color:T.blue,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:11,color:T.blue}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPETITORS ── */}
        {tab==='Competitors' && (
          <div>
            <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:12,fontSize:11,color:T.amber}}>
              <span style={{fontWeight:600}}>Data source:</span> Upload your Google Ads Auction Insights CSV for precise competitor overlap data. Below is estimated analysis based on keyword research.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,marginBottom:14}}>
              {COMPETITORS.map((c,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:600,color:T.text}}>{c.name}</span>
                    <Badge text={`${c.threat} threat`} c={c.threat==='High'?T.red:T.amber} bg={c.threat==='High'?T.redBg:T.amberBg}/>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:T.textMuted,marginBottom:3,textTransform:'uppercase',letterSpacing:'0.04em'}}>Keyword overlap</div>
                    <div style={{height:6,background:T.borderLight,borderRadius:99,overflow:'hidden',border:`0.5px solid ${T.border}`}}>
                      <div style={{width:`${c.overlap}%`,height:'100%',background:c.overlap>60?T.red:T.amber,borderRadius:99}}/>
                    </div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{c.overlap}% keyword overlap</div>
                  </div>
                  <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:3}}>Competing on</div>
                  <div style={{fontSize:11,color:T.text,marginBottom:8}}>{c.topKw}</div>
                  <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:3}}>Est. spend</div>
                  <div style={{fontSize:11,color:T.textMuted,marginBottom:8}}>{c.est}</div>
                  <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:6,padding:'7px 9px',fontSize:11,color:T.blue}}><span style={{fontWeight:600}}>Strategy: </span>{c.strategy}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>How to get real competitor data from Google Ads</div>
              {['Go to Google Ads → Campaigns → any campaign','Click the Reports icon (top right)','Select Auction insights report','Download as CSV','Upload that CSV in the Data Upload tab','Platform will show exact impression share vs competitors'].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:6}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:T.blueBg,border:`1px solid ${T.blue}`,color:T.blue,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:11,color:T.textMuted}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HOW-TO GUIDE ── */}
        {tab==='How-To Guide' && (
          <div>
            <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:12,fontSize:11,color:T.blue,fontWeight:500}}>
              Step-by-step instructions for every recommended change. Open Google Ads alongside this guide.
            </div>
            {[
              { title:'Add negative keywords (bulk)', steps:['ads.google.com → Tools (wrench icon top right)','Shared library → Negative keyword lists','+ New negative keyword list → name it "CC Block List April 2026"','Paste keywords from the Keywords: Block tab (use the Copy button)','Save → Go to Campaigns tab','Select all campaigns (checkbox top left)','Settings → Negative keywords → Apply list → CC Block List April 2026'] },
              { title:'Fix device bid modifiers', steps:['ads.google.com → Campaigns','Click "Shopify All Products"','Left menu → Devices','Click pencil on Mobile → set bid adj to -40% → Save','Click pencil on Desktop → set bid adj to +50% → Save','Click pencil on Tablet → set bid adj to +20% → Save','Repeat for each campaign'] },
              { title:'Set dayparting (ad schedule)', steps:['ads.google.com → Campaigns → select campaign','Left menu → Ad schedule','+ Add time segments','Add: all days except 12am–6am','Set Friday 6pm–9pm → bid adj +20%','Set Saturday all day → bid adj +20%','Click Save'] },
              { title:'Adjust location bids', steps:['ads.google.com → Campaigns → click campaign name','Left menu → Locations','Find Glasgow → click pencil → Excluded → Save','Find London → click pencil → -40% bid adj → Save','Find Leeds → click pencil → +15% bid adj → Save','Find Bradford → +10% bid adj → Save'] },
              { title:'Scale Human Hair Brands campaign', steps:['ads.google.com → Campaigns','Find "Human Hair - Brands"','Click the budget (current amount)','Change to £16.67/day (= £500/month)','Click Save','Monitor daily for first 2 weeks'] },
              { title:'Add exact match keywords', steps:['ads.google.com → Campaigns → Human Hair - Brands','Left menu → Keywords','+ Add keywords','Type: [matrix matte definer] with square brackets (= exact match)','Set bid to £0.80','Add: [naturally straight beautiful textures] at £0.60','Add: [bsset curl cream] at £1.40','Click Save'] },
            ].map((section,si)=>(
              <div key={si} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>{si+1}. {section.title}</div>
                {section.steps.map((step,i)=>(
                  <div key={i} style={{display:'flex',gap:9,marginBottom:6,alignItems:'flex-start'}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:T.blueBg,border:`1px solid ${T.blueBorder}`,color:T.blue,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>{i+1}</div>
                    <span style={{fontSize:12,color:T.textMuted,lineHeight:1.5}}>{step}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── TASKS ── */}
        {tab==='Tasks' && (
          <div style={{maxWidth:900}}>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px',marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:12,fontWeight:600,color:T.text}}>Overall task progress</span>
                <span style={{fontSize:11,color:T.textMuted}}>{allTasks.filter(t=>tasksDone[t.id]).length}/{allTasks.length} · {donePct}%</span>
              </div>
              <div style={{height:6,background:T.borderLight,borderRadius:99,border:`0.5px solid ${T.border}`,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${donePct}%`,background:donePct===100?T.green:T.blue,borderRadius:99,transition:'width 0.3s'}}/>
              </div>
            </div>
            {TASKS.map((group,gi)=>(
              <div key={gi} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden',marginBottom:10}}>
                <div style={{padding:'9px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:600,color:T.text}}>{group.group}</span>
                  <span style={{fontSize:11,color:T.textMuted}}>{group.items.filter(i=>tasksDone[i.id]).length}/{group.items.length}</span>
                </div>
                {group.items.map((item,ii)=>(
                  <div key={item.id}>
                    <div onClick={()=>toggleTask(item.id)} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 14px',borderBottom:`0.5px solid ${T.borderLight}`,cursor:'pointer',background:tasksDone[item.id]?T.greenBg:'transparent'}}>
                      <div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${tasksDone[item.id]?T.green:T.border}`,background:tasksDone[item.id]?T.green:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:1}}>
                        {tasksDone[item.id]&&<svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,color:tasksDone[item.id]?T.textMuted:T.text,textDecoration:tasksDone[item.id]?'line-through':'none',lineHeight:1.4,marginBottom:3}}>{item.text}</div>
                        <div style={{fontSize:10,color:T.blue,lineHeight:1.4}}>→ {item.how}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={()=>{setTasksDone({});localStorage.removeItem('cc_ads_tasks2')}} style={{fontSize:11,color:T.textMuted,background:'none',border:`0.5px solid ${T.border}`,borderRadius:6,padding:'6px 14px',marginTop:4}}>Reset all</button>
          </div>
        )}
      </Shell>
    </>
  )
}
