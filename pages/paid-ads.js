import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { useAuth } from '../components/Auth'
import { T } from '../lib/theme'

// ── GLOSSARY ──────────────────────────────────────────────────────────────────
const GLOSSARY = {
  'Scale': 'This campaign is making good money — put more budget into it to get more sales',
  'Pause': 'Stop spending money on this — it is losing money right now',
  'Delete': 'Remove it completely — it is an old campaign that serves no purpose',
  'Monitor': 'Keep an eye on it — not bad enough to pause, not good enough to scale yet',
  'Reduce': 'Keep it running but spend less money on it — ROAS is below target',
  'ROAS': 'Return on Ad Spend — how much revenue you get for every £1 spent. 3x means £3 back for every £1 spent',
  'CPA': 'Cost Per Acquisition — how much it costs to get one sale. Lower is better',
  'CTR': 'Click Through Rate — how many people click your ad after seeing it. Higher is better',
  'Quality Score': 'Google rates your ads 1–10. Higher score = lower cost per click. Aim for 7+',
  'Impression Share': 'How often your ad shows vs how often it could show. Low = you are losing to competitors',
  'Bid Modifier': 'A percentage increase or decrease on your base bid for specific devices, times or locations',
  'Negative Keyword': 'A word that stops your ad showing for irrelevant searches — saves wasted spend',
  'Exact Match': 'Your ad only shows when someone types that exact phrase — most targeted match type',
  'Dayparting': 'Setting your ads to only show at certain times of day to save budget',
}

// ── ALL TASKS — unified store so everything feeds one progress bar ─────────────
const ALL_TASK_IDS = [
  // Critical
  't_neg_energy','t_pause_wigs','t_delete_2018','t_scale_hh',
  // Devices
  't_mobile_reduce','t_desktop_scale','t_tablet_bid',
  // Dayparting
  't_excl_night','t_fri_eve','t_sat_day',
  // Locations
  't_pause_glasgow','t_reduce_london','t_scale_leeds','t_scale_bradford',
  // Scale keywords
  't_kw_matrix','t_kw_nst','t_kw_bsset','t_kw_hh','t_kw_edge',
  // Block keywords
  't_neg_redbull','t_neg_salon','t_neg_tutorial',
]

const LOCATIONS = [
  { city:'Leeds',          spend:8420,  conv:612, roas:3.21, cpa:13.76, change:'+15%', bid:'+15%', action:'Scale — home city, best ROAS',        tid:'t_scale_leeds',    how:'Campaigns → Settings → Locations → Leeds → +15% bid adj' },
  { city:'Bradford',       spend:3210,  conv:198, roas:2.84, cpa:16.21, change:'+10%', bid:'+10%', action:'Scale — nearby city, strong ROAS',    tid:'t_scale_bradford', how:'Campaigns → Settings → Locations → Bradford → +10% bid adj' },
  { city:'Wakefield',      spend:1240,  conv:78,  roas:2.76, cpa:15.90, change:'+5%',  bid:'+5%',  action:'Increase slightly — good ROAS',       tid:null,               how:'Campaigns → Settings → Locations → Wakefield → +5%' },
  { city:'Huddersfield',   spend:980,   conv:61,  roas:2.62, cpa:16.07, change:'+5%',  bid:'+5%',  action:'Increase slightly — above 2.5x',      tid:null,               how:'Campaigns → Settings → Locations → Huddersfield → +5%' },
  { city:'Halifax',        spend:720,   conv:44,  roas:2.50, cpa:16.36, change:'Keep', bid:'Keep', action:'Monitor — borderline good',           tid:null,               how:'No change needed' },
  { city:'Manchester',     spend:2890,  conv:142, roas:2.34, cpa:20.35, change:'Keep', bid:'Keep', action:'Monitor — good volume',               tid:null,               how:'No change needed' },
  { city:'Sheffield',      spend:1840,  conv:89,  roas:2.10, cpa:20.67, change:'Keep', bid:'Keep', action:'Monitor — borderline',                tid:null,               how:'No change needed' },
  { city:'York',           spend:640,   conv:29,  roas:1.98, cpa:22.07, change:'-10%', bid:'-10%', action:'Reduce slightly — below 2x',          tid:null,               how:'Campaigns → Settings → Locations → York → -10%' },
  { city:'Liverpool',      spend:1120,  conv:44,  roas:1.82, cpa:25.45, change:'-15%', bid:'-15%', action:'Reduce bid — low ROAS',               tid:null,               how:'Campaigns → Settings → Locations → Liverpool → -15%' },
  { city:'Birmingham',     spend:1620,  conv:61,  roas:1.58, cpa:26.56, change:'-25%', bid:'-25%', action:'Reduce budget — low ROAS',            tid:null,               how:'Campaigns → Settings → Locations → Birmingham → -25%' },
  { city:'Nottingham',     spend:890,   conv:31,  roas:1.42, cpa:28.71, change:'-30%', bid:'-30%', action:'Reduce — weak ROAS',                  tid:null,               how:'Campaigns → Settings → Locations → Nottingham → -30%' },
  { city:'London',         spend:4210,  conv:98,  roas:1.24, cpa:42.96, change:'-40%', bid:'-40%', action:'Reduce budget — very poor ROAS',      tid:'t_reduce_london',  how:'Campaigns → Settings → Locations → London → -40% bid adj' },
  { city:'Edinburgh',      spend:620,   conv:11,  roas:0.89, cpa:56.36, change:'-60%', bid:'-60%', action:'Heavily reduce — below break even',   tid:null,               how:'Campaigns → Settings → Locations → Edinburgh → -60%' },
  { city:'Glasgow',        spend:890,   conv:12,  roas:0.71, cpa:74.17, change:'PAUSE',bid:'PAUSE',action:'PAUSE — below 1x ROAS, losing money', tid:'t_pause_glasgow',  how:'Campaigns → Settings → Locations → Glasgow → Excluded' },
  { city:'Other UK',       spend:11617, conv:989, roas:1.98, cpa:11.75, change:'Keep', bid:'Keep', action:'Monitor — bulk of remaining traffic', tid:null,               how:'No change needed' },
]

const DAYS = [
  { day:'Mon', spend:4820, conv:421, roas:2.90, bid:'+0%',  action:'Keep current budget', how:'No change needed', weekly_tip:'Monday is steady — good for new campaigns to gather data' },
  { day:'Tue', spend:4210, conv:389, roas:2.76, bid:'+0%',  action:'Keep current budget', how:'No change needed', weekly_tip:'Tuesday dips slightly — monitor but do not change' },
  { day:'Wed', spend:4980, conv:441, roas:2.81, bid:'+0%',  action:'Keep current budget', how:'No change needed', weekly_tip:'Wednesday is consistent — solid mid-week performance' },
  { day:'Thu', spend:5120, conv:498, roas:3.12, bid:'+10%', action:'Increase bid +10%',   how:'Ad Schedule → Thursday → +10% bid modifier', weekly_tip:'Thursday picks up — people planning weekend purchases' },
  { day:'Fri', spend:5840, conv:562, roas:3.41, bid:'+15%', action:'Increase bid +15%',   how:'Ad Schedule → Friday → +15% bid modifier', weekly_tip:'Friday is strong — weekend shoppers. Increase budget' },
  { day:'Sat', spend:6210, conv:612, roas:3.89, bid:'+20%', action:'Increase bid +20%',   how:'Ad Schedule → Saturday → +20% bid modifier', weekly_tip:'Saturday is your BEST day — 3.89x ROAS. Always max budget' },
  { day:'Sun', spend:3517, conv:368, roas:3.24, bid:'+10%', action:'Increase bid +10%',   how:'Ad Schedule → Sunday → +10% bid modifier', weekly_tip:'Sunday is strong — good for next-day delivery intent' },
]

const TIMINGS = [
  { hour:'12am–6am', spend:2137, conv:73,  roas:1.24, action:'EXCLUDE — losing £2,137',     modifier:'Excluded', how:'Ad Schedule → exclude 12am–6am all days', tid:'t_excl_night' },
  { hour:'6am–9am',  spend:1240, conv:89,  roas:2.10, action:'Keep',                        modifier:'Keep',     how:'No change needed', tid:null },
  { hour:'9am–12pm', spend:4210, conv:312, roas:2.84, action:'Keep',                        modifier:'Keep',     how:'No change needed', tid:null },
  { hour:'12pm–3pm', spend:5840, conv:398, roas:2.62, action:'Keep',                        modifier:'Keep',     how:'No change needed', tid:null },
  { hour:'3pm–6pm',  spend:6120, conv:421, roas:2.67, action:'Keep',                        modifier:'Keep',     how:'No change needed', tid:null },
  { hour:'6pm–9pm',  spend:8940, conv:701, roas:3.42, action:'+20% bid — best window',      modifier:'+20%',     how:'Ad Schedule → 6pm–9pm → +20% bid modifier', tid:'t_fri_eve' },
  { hour:'9pm–12am', spend:4210, conv:298, roas:2.88, action:'Keep',                        modifier:'Keep',     how:'No change needed', tid:null },
]

const MONTHLY_BUDGET = [
  { month:'January',   budget:'£2,100', action:'Reduce 20%',  reason:'Worst month historically — lowest ROAS', color:T.red },
  { month:'February',  budget:'£2,600', action:'Keep',         reason:'Steady recovery after Jan', color:T.amber },
  { month:'March',     budget:'£3,000', action:'Increase 15%', reason:'Spring surge — hair prep', color:T.green },
  { month:'April',     budget:'£3,100', action:'Increase 10%', reason:'Current month — steady growth', color:T.green },
  { month:'May',       budget:'£3,400', action:'Increase 15%', reason:'Pre-summer hair prep surge', color:T.green },
  { month:'June',      budget:'£3,800', action:'Increase 20%', reason:'Summer — peak wigs and extensions', color:T.green },
  { month:'July',      budget:'£4,200', action:'Increase 25%', reason:'Peak summer — best for wigs', color:T.green },
  { month:'August',    budget:'£4,200', action:'Keep peak',     reason:'Summer peak continues', color:T.green },
  { month:'September', budget:'£3,000', action:'Reduce 20%',  reason:'Post-summer dip — reduce all', color:T.amber },
  { month:'October',   budget:'£3,400', action:'Increase 15%', reason:'Back to school — braiding surge', color:T.green },
  { month:'November',  budget:'£3,800', action:'Increase 20%', reason:'Pre-Christmas — scale all', color:T.green },
  { month:'December',  budget:'£4,500', action:'Max budget',   reason:'Christmas — best month of year', color:T.green },
]

const POSITIVE_KW = [
  { kw:'human hair extensions',    curr:0.45, rec:1.80, roas:11.3, priority:'critical', reason:'11.29x ROAS — only £62 spent in 2 years. Put £500/month here.',        tid:'t_kw_hh',     how:'Keywords → [human hair extensions] → Edit bid → £1.80' },
  { kw:'matrix matte definer',     curr:0.20, rec:0.80, roas:1000, priority:'critical', reason:'1000x ROAS — £0.03 CPA. Best keyword in the entire account.',           tid:'t_kw_matrix', how:'Keywords → + Add → [matrix matte definer] exact match → £0.80 bid' },
  { kw:'naturally straight textures', curr:0.15, rec:0.60, roas:735, priority:'critical', reason:'735x ROAS — 7 conversions at £0.04 CPA. Add as exact match.',        tid:'t_kw_nst',    how:'Keywords → + Add → [naturally straight beautiful textures] → £0.60' },
  { kw:'bsset curl cream',         curr:0.80, rec:1.40, roas:11,   priority:'high',     reason:'Highest volume converter — 24 conversions. Increase to capture more.', tid:'t_kw_bsset',  how:'Keywords → bsset curl cream → Edit bid → £1.40' },
  { kw:'edge control',             curr:0.85, rec:1.30, roas:7.0,  priority:'high',     reason:'7x ROAS — strong keyword. Increase to dominate impression share.',      tid:'t_kw_edge',   how:'Keywords → edge control → Edit bid → £1.30' },
  { kw:'braiding hair leeds',      curr:0.65, rec:0.95, roas:3.5,  priority:'high',     reason:'Local high-intent term. 3.5x ROAS. Dominate local search.',             tid:null,          how:'Keywords → braiding hair leeds → Edit bid → £0.95' },
  { kw:'ors relaxer',              curr:0.45, rec:0.70, roas:2.84, priority:'medium',   reason:'Brand keyword. Good ROAS. Protect brand impression share.',             tid:null,          how:'Keywords → ors relaxer → Edit bid → £0.70' },
  { kw:'papaya brightening serum', curr:0.30, rec:0.55, roas:251,  priority:'high',     reason:'251x ROAS — very low spend. Easy win to scale.',                        tid:null,          how:'Keywords → papaya brightening serum → Edit bid → £0.55' },
  { kw:'iris wigs',                curr:0.40, rec:0.75, roas:165,  priority:'high',     reason:'165x ROAS — wigs converting well. Increase bid.',                       tid:null,          how:'Keywords → iris wigs → Edit bid → £0.75' },
  { kw:'caro light soap',          curr:0.35, rec:0.60, roas:40,   priority:'medium',   reason:'40x ROAS — skincare converting. Scale.',                               tid:null,          how:'Keywords → caro light soap → Edit bid → £0.60' },
]

const NEGATIVE_KW = [
  { kw:'monster energy drink',     spent:'£612',  reason:'Zero conv — food item',        tid:'t_neg_energy', selected:true  },
  { kw:'red bull',                 spent:'£389',  reason:'Zero conv — food item',        tid:'t_neg_redbull',selected:true  },
  { kw:'sour patch kids',          spent:'£283',  reason:'0.26x ROAS — food item',       tid:null,           selected:true  },
  { kw:'hair salon near me',       spent:'£920',  reason:'Service intent — not retail',  tid:'t_neg_salon',  selected:true  },
  { kw:'hair extensions salon',    spent:'£640',  reason:'Service intent',               tid:null,           selected:true  },
  { kw:'how to braid hair',        spent:'£276',  reason:'Tutorial intent',              tid:'t_neg_tutorial', selected:true },
  { kw:'braiding hair tutorial',   spent:'£198',  reason:'Tutorial intent',              tid:null,           selected:true  },
  { kw:'afro hair styles 4c',      spent:'£298',  reason:'Inspiration intent',           tid:null,           selected:true  },
  { kw:'synthetic hair styles',    spent:'£334',  reason:'Style inspo — not buying',     tid:null,           selected:false },
  { kw:'cheap wigs',               spent:'£412',  reason:'1.42x ROAS — borderline',      tid:null,           selected:false },
  { kw:'hair growth tips',         spent:'£156',  reason:'Info intent',                  tid:null,           selected:true  },
  { kw:'black hair care routine',  spent:'£189',  reason:'Info intent',                  tid:null,           selected:true  },
]

const CAMPAIGNS = [
  { name:'Shopify All Products', device:'Mobile',  spend:27521, rev:45830, roas:1.67, conv:1842, cpa:14.94, impr:892000, ctr:2.1, qs:6, status:'reduce',  action:'Reduce mobile bid -40%',        tid:'t_mobile_reduce', how:'Campaigns → Shopify All Products → Devices → Mobile → -40% bid modifier' },
  { name:'Shopify All Products', device:'Desktop', spend:3126,  rev:12411, roas:3.97, conv:312,  cpa:10.02, impr:89000,  ctr:3.8, qs:8, status:'scale',   action:'Increase desktop budget +50%',  tid:'t_desktop_scale', how:'Campaigns → Shopify All Products → Devices → Desktop → +50% bid modifier' },
  { name:'Shopify All Products', device:'Tablet',  spend:892,   rev:2970,  roas:3.33, conv:89,   cpa:10.02, impr:31000,  ctr:3.1, qs:7, status:'scale',   action:'Tablet bid modifier +20%',      tid:'t_tablet_bid',    how:'Campaigns → Shopify All Products → Devices → Tablets → +20% bid modifier' },
  { name:'Human Hair - Brands',  device:'Mobile',  spend:62,    rev:699,   roas:11.29,conv:24,   cpa:2.58,  impr:4200,   ctr:5.2, qs:9, status:'urgent',  action:'SCALE to £500/month NOW',       tid:'t_scale_hh',      how:'Campaigns → Human Hair - Brands → Budget → £16.67/day (= £500/month)' },
  { name:'Synthetic Wigs 2026',  device:'Mobile',  spend:1240,  rev:595,   roas:0.48, conv:18,   cpa:68.89, impr:62000,  ctr:1.1, qs:4, status:'pause',   action:'PAUSE — losing £1,240',         tid:'t_pause_wigs',    how:'Campaigns → Synthetic Wigs 2026 → Status dropdown → Paused' },
  { name:'March 2018 Campaign',  device:'All',     spend:0,     rev:0,     roas:0,    conv:0,    cpa:0,     impr:0,      ctr:0,   qs:1, status:'kill',    action:'DELETE — dead test campaign',   tid:'t_delete_2018',   how:'Campaigns → March 2018 → 3-dot menu → Remove campaign' },
  { name:'Edge Control',         device:'Desktop', spend:420,   rev:2940,  roas:7.00, conv:84,   cpa:5.00,  impr:18000,  ctr:4.2, qs:8, status:'scale',   action:'Scale — 7x ROAS increase +50%', tid:null,              how:'Campaigns → Edge Control → Budget → increase by 50%' },
  { name:'Relaxers',             device:'Mobile',  spend:890,   rev:2136,  roas:2.40, conv:107,  cpa:8.32,  impr:45000,  ctr:2.8, qs:6, status:'monitor', action:'Monitor — check search terms',  tid:null,              how:'Reports → Search terms → look for irrelevant searches' },
  { name:'Braiding Hair',        device:'Desktop', spend:634,   rev:2219,  roas:3.50, conv:95,   cpa:6.67,  impr:28000,  ctr:3.5, qs:7, status:'scale',   action:'Scale desktop +30%',            tid:null,              how:'Campaigns → Braiding Hair → Budget → increase 30%' },
  { name:'Wigs General',         device:'Tablet',  spend:312,   rev:530,   roas:1.70, conv:21,   cpa:14.86, impr:22000,  ctr:1.8, qs:5, status:'monitor', action:'Monitor ROAS this week',        tid:null,              how:'Check again next Monday before changing' },
]

const TABS = ['Overview','Campaigns','Devices & Times','Locations','Weekly Budget','Monthly Budget','Scale Keywords','Block Keywords','Competitors','How-To Guide','Tasks']

// ── HELPERS ───────────────────────────────────────────────────────────────────
function TH({ children, onSort, sorted }) {
  return (
    <th onClick={onSort} style={{padding:'7px 11px',fontSize:10,fontWeight:600,color:T.textMuted,textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left',background:T.bg,borderBottom:`0.5px solid ${T.border}`,whiteSpace:'nowrap',cursor:onSort?'pointer':'default',userSelect:'none'}}>
      {children}{onSort?<span style={{marginLeft:3,opacity:0.5}}>{sorted==='asc'?'↑':sorted==='desc'?'↓':'↕'}</span>:null}
    </th>
  )
}
function TD({ children, c, bold, wrap, small }) {
  return <td style={{padding:'8px 11px',fontSize:small?10:12,color:c||T.text,fontWeight:bold?600:400,borderBottom:`0.5px solid ${T.borderLight}`,verticalAlign:'middle',whiteSpace:wrap?'normal':'nowrap'}}>{children}</td>
}
function RBar({ v, max=12 }) {
  const pct = Math.min((v/max)*100,100)
  const col = v>=4?T.green:v>=2?T.amber:T.red
  return (
    <div style={{display:'flex',alignItems:'center',gap:6}}>
      <div style={{flex:1,height:4,background:T.borderLight,borderRadius:99,overflow:'hidden',border:`0.5px solid ${T.border}`,minWidth:50}}>
        <div style={{width:`${pct}%`,height:'100%',background:col,borderRadius:99}}/>
      </div>
      <span style={{fontSize:11,fontWeight:700,color:col,minWidth:36}}>{v}x</span>
    </div>
  )
}
function Badge({ text, c, bg }) {
  return <span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:bg,color:c,flexShrink:0,whiteSpace:'nowrap'}}>{text}</span>
}
function StatusBadge({ s }) {
  const m = {
    scale:  {bg:T.greenBg, c:T.green,  t:'Scale — put more budget here',         tip:'This is making money. Put more budget in to get more sales.'},
    urgent: {bg:'#fef2f2', c:'#b91c1c', t:'Urgent — scale immediately',           tip:'This is making a lot of money but has almost no budget. Fix this today.'},
    pause:  {bg:T.redBg,   c:T.red,    t:'Pause — stop spending',                 tip:'This is losing money. Stop it immediately to save budget.'},
    kill:   {bg:'#1f2328', c:'#fff',   t:'Delete — remove completely',            tip:'This campaign is dead and serves no purpose. Remove it.'},
    monitor:{bg:T.amberBg, c:T.amber,  t:'Monitor — watch but do not change yet', tip:'Not bad enough to pause, not good enough to scale. Check again next Monday.'},
    reduce: {bg:T.amberBg, c:T.amber,  t:'Reduce — spend less here',              tip:'Below target ROAS. Cut the budget but do not stop it completely.'},
  }
  const x = m[s]||m.monitor
  return (
    <span title={x.tip} style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:x.bg,color:x.c,cursor:'help',borderBottom:`1px dashed ${x.c}40`}}>{x.t}</span>
  )
}
function TickBox({ done, onToggle, tid, small }) {
  if (!tid) return null
  return (
    <div onClick={e=>{e.stopPropagation();onToggle(tid)}} style={{width:small?14:16,height:small?14:16,borderRadius:4,border:`1.5px solid ${done?T.green:T.border}`,background:done?T.green:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.1s'}}>
      {done&&<svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  )
}
function HowTo({ text }) {
  return <div style={{fontSize:10,color:T.blue,marginTop:3,lineHeight:1.4}}>→ {text}</div>
}

function sortData(data, key, dir) {
  return [...data].sort((a,b) => {
    const av = typeof a[key]==='string'?a[key].toLowerCase():a[key]
    const bv = typeof b[key]==='string'?b[key].toLowerCase():b[key]
    if (av===bv) return 0
    const res = av>bv?1:-1
    return dir==='asc'?res:-res
  })
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function PaidAds() {
  const { isManager } = useAuth()
  const [tab, setTab] = useState('Overview')
  const [tasks, setTasks] = useState({})
  const [negSel, setNegSel] = useState(()=>Object.fromEntries(NEGATIVE_KW.map(k=>[k.kw,k.selected])))
  const [copied, setCopied] = useState(false)
  const [uploadData, setUploadData] = useState(null)
  const [sort, setSort] = useState({key:null,dir:'desc'})
  const [glossaryWord, setGlossaryWord] = useState(null)

  const [analysisDate, setAnalysisDate] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)

  useEffect(()=>{
    try {
      const t=localStorage.getItem('cc_ads_v3'); if(t) setTasks(JSON.parse(t))
      const u=localStorage.getItem('cc_data_upload'); if(u) setUploadData(JSON.parse(u))
      // Load analysis data pushed from data-upload page
      const a=localStorage.getItem('cc_ads_analysis'); if(a) setAnalysisData(JSON.parse(a))
      const d=localStorage.getItem('cc_ads_analysis_date'); if(d) setAnalysisDate(new Date(d))
    } catch(e){}
  },[])

  function tick(id) {
    if (!id) return
    const u={...tasks,[id]:!tasks[id]}
    setTasks(u); localStorage.setItem('cc_ads_v3',JSON.stringify(u))
  }

  function copyNegs() {
    const txt = NEGATIVE_KW.filter(k=>negSel[k.kw]).map(k=>k.kw).join('\n')
    navigator.clipboard.writeText(txt)
    // Auto-tick neg keyword tasks
    const u={...tasks}
    NEGATIVE_KW.filter(k=>negSel[k.kw]&&k.tid).forEach(k=>{u[k.tid]=true})
    setTasks(u); localStorage.setItem('cc_ads_v3',JSON.stringify(u))
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  function doSort(key) {
    setSort(s=>({key,dir:s.key===key&&s.dir==='desc'?'asc':'desc'}))
  }

  const donePct = Math.round(ALL_TASK_IDS.filter(id=>tasks[id]).length/ALL_TASK_IDS.length*100)
  const doneCount = ALL_TASK_IDS.filter(id=>tasks[id]).length

  const sortedCampaigns = sort.key?sortData(CAMPAIGNS,sort.key,sort.dir):CAMPAIGNS
  const sortedLocations = sort.key?sortData(LOCATIONS,sort.key,sort.dir):LOCATIONS

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

        {/* Glossary tooltip */}
        {glossaryWord && (
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setGlossaryWord(null)}>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,padding:20,maxWidth:400,margin:20}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:8}}>{glossaryWord}</div>
              <div style={{fontSize:13,color:T.textMuted,lineHeight:1.6}}>{GLOSSARY[glossaryWord]}</div>
              <button onClick={()=>setGlossaryWord(null)} style={{marginTop:12,fontSize:11,color:T.textMuted,background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:6,padding:'5px 14px',cursor:'pointer'}}>Close</button>
            </div>
          </div>
        )}

        {uploadData && (
          <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:7,padding:'7px 12px',marginBottom:10,fontSize:11,color:T.blue,display:'flex',alignItems:'center',gap:6}}>
            📥 Data uploaded: {new Date(uploadData.timestamp).toLocaleDateString('en-GB')} — {uploadData.adsFile}
          </div>
        )}

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,minmax(0,1fr))',gap:7,marginBottom:12}}>
          {[
            {l:'2yr Spend',    v:'£34,697', s:'Apr 2024–Apr 2026',    sc:T.textMuted},
            {l:'2yr Revenue',  v:'£61,952', s:'Tracked conversions',  sc:T.green},
            {l:'ROAS',         v:'1.79x',   s:'Target: 3x minimum',   sc:T.amber},
            {l:'Conversions',  v:'3,291',   s:'2 year total',         sc:T.textMuted},
            {l:'Wasted',       v:'£32,160', s:'93% of total spend',   sc:T.red},
            {l:'Best CPA',     v:'£0.03',   s:'Matrix Matte Definer', sc:T.green},
            {l:'Avg CPA',      v:'£10.54',  s:'All conversions',      sc:T.amber},
            {l:'Tasks done',   v:`${doneCount}/${ALL_TASK_IDS.length}`, s:`${donePct}% complete`, sc:donePct===100?T.green:T.amber},
          ].map((s,i)=>(
            <div key={i} style={{background:T.surface,border:`0.5px solid ${i===4?T.redBorder:i===1||i===5?T.greenBorder:T.border}`,borderRadius:8,padding:'10px 12px'}}>
              <div style={{fontSize:9,color:T.textMuted,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:3}}>{s.l}</div>
              <div style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:2}}>{s.v}</div>
              <div style={{fontSize:10,color:s.sc}}>{s.s}</div>
            </div>
          ))}
        </div>

        {/* Global progress bar */}
        <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'10px 14px',marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:11}}>
            <span style={{fontWeight:600,color:T.text}}>Overall action progress — tick each action across all tabs as you complete it</span>
            <span style={{color:T.textMuted}}>{doneCount}/{ALL_TASK_IDS.length} actions done · {donePct}%</span>
          </div>
          <div style={{height:6,background:T.borderLight,borderRadius:99,border:`0.5px solid ${T.border}`,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${donePct}%`,background:donePct===100?T.green:T.blue,borderRadius:99,transition:'width 0.3s'}}/>
          </div>
        </div>

        {/* Glossary bar */}
        <div style={{background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:7,padding:'7px 12px',marginBottom:12,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
          <span style={{fontSize:10,color:T.textMuted,fontWeight:600}}>GLOSSARY:</span>
          {Object.keys(GLOSSARY).map(w=>(
            <button key={w} onClick={()=>setGlossaryWord(w)} style={{fontSize:10,color:T.blue,background:'none',border:`0.5px solid ${T.blueBorder}`,borderRadius:4,padding:'1px 6px',cursor:'pointer'}}>
              {w}
            </button>
          ))}
        </div>

        {/* Sub tabs */}
        <div style={{display:'flex',gap:0,borderBottom:`0.5px solid ${T.border}`,marginBottom:14,overflowX:'auto'}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'7px 12px',fontSize:11,fontWeight:tab===t?600:400,color:tab===t?T.blue:T.textMuted,background:'none',border:'none',borderBottom:tab===t?`2px solid ${T.blue}`:'2px solid transparent',whiteSpace:'nowrap',cursor:'pointer'}}>
              {t}{t==='Tasks'?` (${donePct}%)`:''}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab==='Overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <div style={{padding:'9px 13px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:12,fontWeight:600,color:T.text}}>Campaign ROAS — hover status badges for plain English explanation</div>
                <div style={{padding:'12px 14px'}}>
                  {[{l:'Human Hair Brands',r:11.29,s:'urgent'},{l:'Edge Control Desktop',r:7.00,s:'scale'},{l:'Braiding Hair Desktop',r:3.50,s:'scale'},{l:'Shopify Desktop',r:3.97,s:'scale'},{l:'Relaxers Mobile',r:2.40,s:'monitor'},{l:'Shopify Mobile',r:1.67,s:'reduce'},{l:'Synthetic Wigs',r:0.48,s:'pause'}].map((i,x)=>(
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
                <div style={{fontSize:11,fontWeight:600,color:T.red,marginBottom:7}}>🚨 Biggest waste — fix today</div>
                {[
                  {l:'Energy drinks (Monster, Red Bull, Sour Patch)',v:'£1,284 at 0.26x',tid:'t_neg_energy'},
                  {l:'Service intent (hair salon searches)',v:'£2,560 at 0.82x',tid:'t_neg_salon'},
                  {l:'Synthetic Wigs 2026 campaign',v:'£1,240 at 0.48x',tid:'t_pause_wigs'},
                  {l:'Night spend 12am–6am',v:'£2,137 at 1.24x',tid:'t_excl_night'},
                  {l:'Glasgow targeting',v:'£890 at 0.71x',tid:'t_pause_glasgow'},
                ].map((i,x)=>(
                  <div key={x} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:x<4?`0.5px solid ${T.redBorder}`:'none'}}>
                    <TickBox done={!!tasks[i.tid]} onToggle={tick} tid={i.tid} small/>
                    <span style={{flex:1,fontSize:11,color:tasks[i.tid]?T.textMuted:T.red,textDecoration:tasks[i.tid]?'line-through':'none'}}>{i.l}</span>
                    <span style={{fontSize:11,fontWeight:600,color:tasks[i.tid]?T.textMuted:T.red}}>{i.v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:600,color:T.green,marginBottom:7}}>🚀 Scale these — money left on table</div>
                {[
                  {l:'Human Hair Brands — only £62 spend in 2 years!',v:'11.29x ROAS',tid:'t_scale_hh'},
                  {l:'Matrix Matte Definer — £0.03 CPA',v:'1000x ROAS',tid:'t_kw_matrix'},
                  {l:'Naturally Straight Textures',v:'735x ROAS',tid:'t_kw_nst'},
                  {l:'Desktop vs Mobile — fix device split',v:'3.94x vs 1.66x',tid:'t_mobile_reduce'},
                ].map((i,x)=>(
                  <div key={x} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:x<3?`0.5px solid ${T.greenBorder}`:'none'}}>
                    <TickBox done={!!tasks[i.tid]} onToggle={tick} tid={i.tid} small/>
                    <span style={{flex:1,fontSize:11,color:tasks[i.tid]?T.textMuted:T.green,textDecoration:tasks[i.tid]?'line-through':'none'}}>{i.l}</span>
                    <span style={{fontSize:11,fontWeight:600,color:tasks[i.tid]?T.textMuted:T.green}}>{i.v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:600,color:T.amber,marginBottom:6}}>⚠️ Device imbalance — most important fix</div>
                <div style={{fontSize:11,color:T.amber,lineHeight:1.6}}>86% of budget on mobile at 1.66x ROAS. Desktop gets 13% at 3.94x ROAS. In plain English: you are spending most of your money on the device that makes the least money. Fixing this alone could save £8,000–£12,000 per year.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── BUDGET TRACKER ── */}
        {tab==='Budget Tracker' && (
          <div>
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:12}}>Monthly budget vs spend tracker — update these each month from Google Ads</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
              {[
                {label:'Monthly Budget', value:'£1,200', sub:'Set in Google Ads', color:T.blue},
                {label:'Spent This Month', value:'£847', sub:'As of today', color:T.green},
                {label:'Remaining', value:'£353', sub:'29% left', color:T.amber},
              ].map((s,i) => (
                <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',textAlign:'center'}}>
                  <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>{s.label}</div>
                  <div style={{fontSize:26,fontWeight:800,color:s.color,marginBottom:4}}>{s.value}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>Daily spend pace</div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:10}}>At current pace you will spend £1,040/month — £160 under budget. Consider increasing bids on Scale campaigns.</div>
              {[
                {label:'Human Hair Brands', budget:'£200', spent:'£178', pct:89, status:'On track'},
                {label:'Edge Control Desktop', budget:'£150', spent:'£124', pct:83, status:'On track'},
                {label:'Braiding Hair Desktop', budget:'£180', spent:'£165', pct:92, status:'On track'},
                {label:'Shopify Desktop', budget:'£200', spent:'£143', pct:72, status:'Under pacing'},
                {label:'Relaxers Mobile', budget:'£150', spent:'£112', pct:75, status:'Under pacing'},
                {label:'Shopify Mobile', budget:'£120', spent:'£94', pct:78, status:'On track'},
                {label:'Synthetic Wigs', budget:'£200', spent:'£31', pct:16, status:'PAUSED'},
              ].map((c,i) => (
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                    <span style={{fontWeight:600,color:T.text}}>{c.label}</span>
                    <span style={{color:c.status==='PAUSED'?T.textMuted:c.status==='Under pacing'?T.amber:T.green,fontWeight:600}}>{c.status} — {c.spent} / {c.budget}</span>
                  </div>
                  <div style={{height:6,background:T.borderLight,borderRadius:99,overflow:'hidden'}}>
                    <div style={{width:`${c.pct}%`,height:'100%',background:c.status==='PAUSED'?T.borderLight:c.status==='Under pacing'?T.amber:T.green,borderRadius:99}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:'#ddf4ff',border:`0.5px solid ${T.blueBorder}`,borderRadius:8,padding:'10px 14px',fontSize:11,color:T.blue}}>
              These figures are based on your last CSV upload. Upload a new CSV from Google Ads → Reports → Campaign performance to update them.
            </div>
          </div>
        )}

        {/* ── BRAND VS NON-BRAND ── */}
        {tab==='Brand vs Non-Brand' && (
          <div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>Brand keywords = searches that include "CC Hair", "CC Hair and Beauty", "cchairandbeauty" etc. Non-brand = everything else.</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              {[
                { label:'Brand keywords', spend:'£124', conv:89, roas:14.2, cpa:'£1.39', color:T.green,
                  note:'Protect your brand — bid just enough to stay #1, do not overspend',
                  keywords:['cc hair and beauty','cc hair leeds','cchairandbeauty','cc continental hair','cc hair n beauty'] },
                { label:'Non-brand keywords', spend:'£723', conv:198, roas:3.1, cpa:'£3.65', color:T.blue,
                  note:'This is where growth comes from — these bring in new customers',
                  keywords:['afro hair shop leeds','braiding hair','relaxer uk','hair extensions leeds','wigs uk'] },
              ].map((c,i) => (
                <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderLeft:`4px solid ${c.color}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8}}>{c.label}</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6,marginBottom:10}}>
                    {[{l:'Spend',v:c.spend},{l:'Conversions',v:c.conv},{l:'ROAS',v:c.roas+'x'},{l:'CPA',v:c.cpa}].map((s,x)=>(
                      <div key={x} style={{background:T.bg,borderRadius:5,padding:'6px 8px'}}>
                        <div style={{fontSize:10,color:T.textMuted}}>{s.l}</div>
                        <div style={{fontSize:14,fontWeight:700,color:c.color}}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:11,color:T.textMuted,marginBottom:8,fontStyle:'italic'}}>{c.note}</div>
                  <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>Top keywords</div>
                  {c.keywords.map((k,x) => (
                    <div key={x} style={{fontSize:11,color:T.text,padding:'2px 0'}}>{k}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>Recommendation</div>
              <div style={{fontSize:11,color:T.textMuted,lineHeight:1.6}}>
                Your brand ROAS of 14.2x is excellent — these searches come from people who already know you. Keep brand budget low (£100-150/month) and put the rest into non-brand to capture new customers. Your non-brand ROAS of 3.1x is above the 2.5x target — scale the best non-brand campaigns.
              </div>
            </div>
          </div>
        )}

        {/* ── CAMPAIGNS ── */}
        {tab==='Campaigns' && (
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
            <div style={{padding:'9px 13px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,fontSize:11,color:T.textMuted}}>
              Click column headers to sort. Hover status badges for plain English. Tick boxes feed into the progress bar above.
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:1100}}>
              <thead><tr>
                <TH>Done</TH>
                <TH onSort={()=>doSort('name')} sorted={sort.key==='name'?sort.dir:null}>Campaign</TH>
                <TH onSort={()=>doSort('device')} sorted={sort.key==='device'?sort.dir:null}>Device</TH>
                <TH onSort={()=>doSort('spend')} sorted={sort.key==='spend'?sort.dir:null}>Spend ↕</TH>
                <TH onSort={()=>doSort('rev')} sorted={sort.key==='rev'?sort.dir:null}>Revenue ↕</TH>
                <TH onSort={()=>doSort('roas')} sorted={sort.key==='roas'?sort.dir:null}>ROAS ↕</TH>
                <TH onSort={()=>doSort('conv')} sorted={sort.key==='conv'?sort.dir:null}>Conv. ↕</TH>
                <TH onSort={()=>doSort('cpa')} sorted={sort.key==='cpa'?sort.dir:null}>CPA ↕</TH>
                <TH onSort={()=>doSort('ctr')} sorted={sort.key==='ctr'?sort.dir:null}>CTR ↕</TH>
                <TH onSort={()=>doSort('qs')} sorted={sort.key==='qs'?sort.dir:null}>QS ↕</TH>
                <TH>Status</TH>
                <TH>Action & How to do it</TH>
              </tr></thead>
              <tbody>
                {sortedCampaigns.map((c,i)=>(
                  <tr key={i} style={{background:c.status==='kill'?'#fff8f8':c.status==='urgent'?'#f0fff4':'transparent'}}>
                    <TD><TickBox done={!!tasks[c.tid]} onToggle={tick} tid={c.tid}/></TD>
                    <TD bold>{c.name}</TD>
                    <TD c={T.textMuted}>{c.device}</TD>
                    <TD c={T.textMuted}>£{c.spend.toLocaleString()}</TD>
                    <TD c={c.roas>=3?T.green:c.roas>=2?T.amber:T.red}>£{c.rev.toLocaleString()}</TD>
                    <TD><RBar v={c.roas}/></TD>
                    <TD>{c.conv.toLocaleString()}</TD>
                    <TD c={c.cpa<5?T.green:c.cpa<15?T.amber:T.red}>£{c.cpa.toFixed(2)}</TD>
                    <TD>{c.ctr}%</TD>
                    <TD c={c.qs>=8?T.green:c.qs>=6?T.amber:T.red}>{c.qs}/10</TD>
                    <TD><StatusBadge s={c.status}/></TD>
                    <td style={{padding:'8px 11px',fontSize:11,borderBottom:`0.5px solid ${T.borderLight}`,verticalAlign:'top',maxWidth:220}}>
                      <div style={{color:T.text,fontWeight:500,marginBottom:2}}>{c.action}</div>
                      <HowTo text={c.how}/>
                    </td>
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
              {[
                {device:'Desktop',spend:4572,rev:18001,roas:3.94,conv:491,cpa:9.31,pct:13,tid:'t_desktop_scale',action:'Put more budget here — making the most money per click',modifier:'+50% bid modifier',how:'Campaigns → Shopify All Products → Devices → Desktop → set to +50%'},
                {device:'Mobile', spend:29713,rev:49260,roas:1.66,conv:1991,cpa:14.92,pct:86,tid:'t_mobile_reduce',action:'Reduce budget — spending too much, making too little',modifier:'-40% bid modifier',how:'Campaigns → Shopify All Products → Devices → Mobile → set to -40%'},
                {device:'Tablet', spend:1204,rev:3500,roas:2.91,conv:110,cpa:10.95,pct:3,tid:'t_tablet_bid',action:'Small increase — solid ROAS',modifier:'+20% bid modifier',how:'Campaigns → Shopify All Products → Devices → Tablets → set to +20%'},
              ].map((d,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${d.roas>=3?T.greenBorder:d.roas>=2?T.amberBorder:T.redBorder}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <span style={{fontSize:13,fontWeight:700,color:T.text}}>{d.device}</span>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:11,color:T.textMuted}}>{d.pct}% of budget</span>
                      <TickBox done={!!tasks[d.tid]} onToggle={tick} tid={d.tid}/>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                    {[{l:'Spend',v:`£${d.spend.toLocaleString()}`},{l:'Revenue',v:`£${d.rev.toLocaleString()}`},{l:'Conversions',v:d.conv},{l:'Cost/sale',v:`£${d.cpa.toFixed(2)}`}].map((s,x)=>(
                      <div key={x}><div style={{fontSize:9,color:T.textMuted,textTransform:'uppercase'}}>{s.l}</div><div style={{fontSize:14,fontWeight:700,color:T.text}}>{s.v}</div></div>
                    ))}
                  </div>
                  <RBar v={d.roas}/>
                  <div style={{marginTop:8,background:d.roas>=3?T.greenBg:d.roas>=2?T.amberBg:T.redBg,borderRadius:6,padding:'6px 9px',fontSize:11,color:d.roas>=3?T.green:d.roas>=2?T.amber:T.red,fontWeight:500}}>{d.action}</div>
                  <div style={{marginTop:6,fontSize:11,color:T.text,fontWeight:600}}>Change to: <span style={{color:T.blue}}>{d.modifier}</span></div>
                  <HowTo text={d.how}/>
                </div>
              ))}
            </div>

            {/* Day of week */}
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>Day of week — when to increase or decrease budget</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',gap:8,marginBottom:16}}>
              {DAYS.map((d,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${d.roas>=3?T.greenBorder:d.roas>=2?T.amberBorder:T.redBorder}`,borderRadius:8,padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:3}}>{d.day}</div>
                  <div style={{fontSize:18,fontWeight:700,color:d.roas>=3?T.green:d.roas>=2?T.amber:T.red,marginBottom:1}}>{d.roas}x</div>
                  <div style={{fontSize:9,color:T.textMuted,marginBottom:5}}>£{d.spend.toLocaleString()}</div>
                  <div style={{fontSize:9,fontWeight:600,color:d.bid!=='0%'&&d.bid!=='+0%'?T.green:T.textMuted,background:d.bid!=='+0%'?T.greenBg:T.bg,borderRadius:4,padding:'2px 4px',marginBottom:4}}>{d.bid}</div>
                  <div style={{fontSize:9,color:T.textMuted,lineHeight:1.3}}>{d.weekly_tip}</div>
                </div>
              ))}
            </div>

            {/* Hour heatmap */}
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>Hour of day heatmap — when your ads perform best</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',gap:8}}>
              {TIMINGS.map((t,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${t.roas>=3?T.greenBorder:t.roas>=2?T.amberBorder:T.redBorder}`,borderRadius:8,padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontSize:9,color:T.textMuted,marginBottom:3}}>{t.hour}</div>
                  <div style={{fontSize:20,fontWeight:700,color:t.roas>=3?T.green:t.roas>=2?T.amber:T.red,marginBottom:2}}>{t.roas}x</div>
                  <div style={{fontSize:9,color:T.textMuted,marginBottom:5}}>£{t.spend.toLocaleString()}</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                    <TickBox done={!!tasks[t.tid]} onToggle={tick} tid={t.tid} small/>
                    <div style={{fontSize:9,fontWeight:600,color:t.action.includes('EXCL')?T.red:t.roas>=3?T.green:T.textMuted}}>{t.modifier}</div>
                  </div>
                  <div style={{fontSize:8,color:T.textMuted,marginTop:3,lineHeight:1.2}}>{t.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOCATIONS ── */}
        {tab==='Locations' && (
          <div>
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:12,fontSize:11,color:T.green}}>
              15 UK cities analysed. Leeds and Bradford make the most money — put more budget there. Glasgow and Edinburgh are losing money — stop spending there. Click headers to sort.
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                <thead><tr>
                  <TH>Done</TH>
                  <TH onSort={()=>doSort('city')} sorted={sort.key==='city'?sort.dir:null}>City A–Z</TH>
                  <TH onSort={()=>doSort('spend')} sorted={sort.key==='spend'?sort.dir:null}>Spend ↕</TH>
                  <TH onSort={()=>doSort('conv')} sorted={sort.key==='conv'?sort.dir:null}>Sales ↕</TH>
                  <TH onSort={()=>doSort('roas')} sorted={sort.key==='roas'?sort.dir:null}>ROAS ↕</TH>
                  <TH onSort={()=>doSort('cpa')} sorted={sort.key==='cpa'?sort.dir:null}>Cost per sale ↕</TH>
                  <TH>Change bid by</TH>
                  <TH>What to do</TH>
                  <TH>How to do it in Google Ads</TH>
                </tr></thead>
                <tbody>
                  {sortedLocations.map((l,i)=>(
                    <tr key={i} style={{background:l.roas<1?T.redBg:l.change.includes('+')?'#f8fff9':'transparent'}}>
                      <TD><TickBox done={!!tasks[l.tid]} onToggle={tick} tid={l.tid}/></TD>
                      <TD bold>{l.city}</TD>
                      <TD c={T.textMuted}>£{l.spend.toLocaleString()}</TD>
                      <TD>{l.conv}</TD>
                      <TD><RBar v={l.roas} max={4}/></TD>
                      <TD c={l.cpa<20?T.green:l.cpa<40?T.amber:T.red}>£{l.cpa.toFixed(2)}</TD>
                      <TD c={l.change.includes('+')?T.green:l.change==='Keep'?T.textMuted:T.red} bold>{l.change}</TD>
                      <TD c={l.roas<1?T.red:l.roas<2?T.amber:T.green} wrap>{l.action}</TD>
                      <TD c={T.blue} wrap small>{l.how}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── WEEKLY BUDGET ── */}
        {tab==='Weekly Budget' && (
          <div>
            <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:12,fontSize:11,color:T.blue}}>
              Based on 2 years of data — when in the week to increase or decrease your bids. Weekend is your best time. Night is your worst.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',gap:8,marginBottom:14}}>
              {DAYS.map((d,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${d.roas>=3?T.greenBorder:d.roas>=2?T.amberBorder:T.redBorder}`,borderRadius:8,padding:'12px 10px'}}>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4,textAlign:'center'}}>{d.day}</div>
                  <div style={{fontSize:22,fontWeight:700,color:d.roas>=3?T.green:d.roas>=2?T.amber:T.red,marginBottom:2,textAlign:'center'}}>{d.roas}x</div>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:8,textAlign:'center'}}>£{d.spend.toLocaleString()} spend</div>
                  <div style={{background:d.bid!=='+0%'?T.greenBg:T.bg,borderRadius:6,padding:'5px 7px',textAlign:'center',marginBottom:6}}>
                    <div style={{fontSize:10,color:T.textMuted}}>Bid change</div>
                    <div style={{fontSize:14,fontWeight:700,color:d.bid!=='+0%'?T.green:T.textMuted}}>{d.bid}</div>
                  </div>
                  <div style={{fontSize:10,color:T.text,fontWeight:500,marginBottom:4}}>{d.action}</div>
                  <div style={{fontSize:9,color:T.blue,lineHeight:1.3}}>{d.how}</div>
                  <div style={{fontSize:9,color:T.textMuted,marginTop:4,lineHeight:1.3,fontStyle:'italic'}}>{d.weekly_tip}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>How to set day-of-week bid modifiers in Google Ads</div>
              {['Go to ads.google.com','Click on a campaign name','In the left menu click "Ad schedule"','Click the blue + button to add a time segment','Select the day and time range','Set the bid adjustment percentage (e.g. +20%)','Click Save','Repeat for each day you want to adjust'].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:5}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:T.blueBg,border:`1px solid ${T.blue}`,color:T.blue,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:11,color:T.textMuted}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MONTHLY BUDGET ── */}
        {tab==='Monthly Budget' && (
          <div>
            <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:12,fontSize:11,color:T.amber}}>
              Based on 2 years of historical data — when in the year to increase or decrease your monthly budget. December is your best month. January is your worst.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:10,marginBottom:14}}>
              {MONTHLY_BUDGET.map((m,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${m.color===T.green?T.greenBorder:m.color===T.red?T.redBorder:T.amberBorder}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:6}}>{m.month}</div>
                  <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>Suggested budget</div>
                  <div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>{m.budget}</div>
                  <div style={{background:m.color===T.green?T.greenBg:m.color===T.red?T.redBg:T.amberBg,borderRadius:6,padding:'4px 8px',marginBottom:6}}>
                    <span style={{fontSize:11,fontWeight:600,color:m.color}}>{m.action}</span>
                  </div>
                  <div style={{fontSize:10,color:T.textMuted,lineHeight:1.4}}>{m.reason}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>How to change your monthly budget in Google Ads</div>
              {['Go to ads.google.com','Click on Campaigns in the left menu','Find the campaign you want to change','Click the budget amount (shown under the campaign name)','Type the new daily budget (monthly ÷ 30.4 = daily amount)','Click Save — changes take effect within minutes'].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:5}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:T.amberBg,border:`1px solid ${T.amber}`,color:T.amber,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:11,color:T.textMuted}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCALE KEYWORDS ── */}
        {tab==='Scale Keywords' && (
          <div>
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:12,fontSize:11,color:T.green}}>
              These keywords are making money — increase bids to get more sales. Tick each one as you do it.
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                <thead><tr>
                  <TH>Done</TH>
                  <TH onSort={()=>doSort('kw')} sorted={sort.key==='kw'?sort.dir:null}>Keyword</TH>
                  <TH>Priority</TH>
                  <TH onSort={()=>doSort('curr')} sorted={sort.key==='curr'?sort.dir:null}>Current bid</TH>
                  <TH onSort={()=>doSort('rec')} sorted={sort.key==='rec'?sort.dir:null}>New bid</TH>
                  <TH onSort={()=>doSort('roas')} sorted={sort.key==='roas'?sort.dir:null}>ROAS ↕</TH>
                  <TH>Why increase</TH>
                  <TH>How to do it in Google Ads</TH>
                </tr></thead>
                <tbody>
                  {POSITIVE_KW.map((k,i)=>(
                    <tr key={i} style={{background:k.priority==='critical'?'#f0fff4':'transparent'}}>
                      <TD><TickBox done={!!tasks[k.tid]} onToggle={tick} tid={k.tid}/></TD>
                      <TD bold>{k.kw}</TD>
                      <TD><Badge text={k.priority==='critical'?'Do today':k.priority==='high'?'This week':'Soon'} c={k.priority==='critical'?T.green:k.priority==='high'?T.blue:T.amber} bg={k.priority==='critical'?T.greenBg:k.priority==='high'?T.blueBg:T.amberBg}/></TD>
                      <TD c={T.textMuted}>£{k.curr.toFixed(2)}</TD>
                      <TD c={T.green} bold>£{k.rec.toFixed(2)}</TD>
                      <TD><RBar v={Math.min(k.roas,12)} max={12}/></TD>
                      <TD c={T.textMuted} wrap>{k.reason}</TD>
                      <TD c={T.blue} wrap small>{k.how}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BLOCK KEYWORDS ── */}
        {tab==='Block Keywords' && (
          <div>
            <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:10}}>
              <div style={{flex:1,background:T.redBg,border:`0.5px solid ${T.redBorder}`,borderRadius:7,padding:'8px 12px',fontSize:11,color:T.red}}>
                Select the keywords wasting your money → click Copy → paste directly into Google Ads negative keywords tool. Ticking also marks them done in the progress bar.
              </div>
              <button onClick={copyNegs} style={{padding:'9px 20px',fontSize:12,fontWeight:600,color:'#fff',background:copied?T.green:T.red,border:'none',borderRadius:7,cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>
                {copied?'✓ Copied & ticked!':'📋 Copy selected + tick done'}
              </button>
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden',marginBottom:12}}>
              <div style={{padding:'8px 12px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,display:'flex',gap:8,alignItems:'center'}}>
                <button onClick={()=>setNegSel(Object.fromEntries(NEGATIVE_KW.map(k=>[k.kw,true])))} style={{fontSize:11,color:T.blue,background:'none',border:`0.5px solid ${T.blueBorder}`,borderRadius:5,padding:'3px 10px',cursor:'pointer'}}>Select all</button>
                <button onClick={()=>setNegSel(Object.fromEntries(NEGATIVE_KW.map(k=>[k.kw,false])))} style={{fontSize:11,color:T.textMuted,background:'none',border:`0.5px solid ${T.border}`,borderRadius:5,padding:'3px 10px',cursor:'pointer'}}>Clear all</button>
                <span style={{fontSize:11,color:T.textMuted,marginLeft:'auto'}}>{Object.values(negSel).filter(Boolean).length} selected · total wasted: £{NEGATIVE_KW.filter(k=>negSel[k.kw]).reduce((a,k)=>a+parseInt(k.spent.replace('£','')),0).toLocaleString()}</span>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr>
                  <TH w={40}>Select</TH>
                  <TH onSort={()=>doSort('kw')} sorted={sort.key==='kw'?sort.dir:null}>Keyword A–Z</TH>
                  <TH onSort={()=>doSort('spent')} sorted={sort.key==='spent'?sort.dir:null}>Wasted ↕</TH>
                  <TH>Reason</TH>
                  <TH>How to add in Google Ads</TH>
                </tr></thead>
                <tbody>
                  {NEGATIVE_KW.map((k,i)=>(
                    <tr key={i} style={{background:negSel[k.kw]?T.redBg:'transparent',cursor:'pointer'}} onClick={()=>setNegSel(s=>({...s,[k.kw]:!s[k.kw]}))}>
                      <TD>
                        <div style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${negSel[k.kw]?T.red:T.border}`,background:negSel[k.kw]?T.red:'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {negSel[k.kw]&&<svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      </TD>
                      <TD bold>{k.kw}</TD>
                      <TD c={T.red}>{k.spent}</TD>
                      <TD c={T.textMuted}>{k.reason}</TD>
                      <TD c={T.blue} wrap small>Tools → Shared library → Negative keyword lists → CC Block List → Add</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontSize:11,fontWeight:600,color:T.blue,marginBottom:8}}>How to bulk add negative keywords in Google Ads (step by step)</div>
              {['Go to ads.google.com','Click Tools & Settings (wrench icon) at the top','Click Shared library → Negative keyword lists','Click the blue + button → New negative keyword list','Name it "CC Block List April 2026"','Paste all copied keywords — one per line','Click Save','Now go to Campaigns in the left menu','Select all your campaigns using the checkbox at top','Click Settings → Negative keywords → Add list → CC Block List April 2026','Click Save — done'].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:5}}>
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
              Upload your Google Ads Auction Insights CSV in Data Upload for precise data. Below is estimated analysis based on keyword research and market knowledge.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,marginBottom:14}}>
              {[
                {name:'Hair City Leeds',overlap:68,kw:'braiding hair leeds, wigs leeds, afro hair shop',est:'Medium spend',threat:'High',strategy:'They dominate "wigs leeds" — increase your bid on this term to +£1.20 to outbid them'},
                {name:'Kashmir Hair',overlap:54,kw:'relaxer uk, hair products leeds, dark and lovely',est:'Low-medium spend',threat:'Medium',strategy:'Competing on relaxer terms — add brand keywords like "ors relaxer" to protect your share'},
                {name:'Beauty Depot Online',overlap:41,kw:'hair extensions uk, human hair wigs',est:'High spend — national',threat:'High',strategy:'National budget. You cannot beat them nationally — focus on Leeds local terms where they are weak'},
                {name:'Afro Hair UK',overlap:38,kw:'afro hair products, natural hair uk',est:'Medium spend',threat:'Medium',strategy:'National focus — compete locally in Chapeltown and Roundhay where you have physical stores'},
              ].map((c,i)=>(
                <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:600,color:T.text}}>{c.name}</span>
                    <Badge text={`${c.threat} threat`} c={c.threat==='High'?T.red:T.amber} bg={c.threat==='High'?T.redBg:T.amberBg}/>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:T.textMuted,marginBottom:3}}>Keyword overlap with you</div>
                    <div style={{height:6,background:T.borderLight,borderRadius:99,overflow:'hidden',border:`0.5px solid ${T.border}`}}>
                      <div style={{width:`${c.overlap}%`,height:'100%',background:c.overlap>60?T.red:T.amber,borderRadius:99}}/>
                    </div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{c.overlap}% of their keywords match yours</div>
                  </div>
                  <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}><span style={{fontWeight:600,color:T.text}}>Competing on: </span>{c.kw}</div>
                  <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:6,padding:'7px 9px',fontSize:11,color:T.blue}}><span style={{fontWeight:600}}>Your counter-strategy: </span>{c.strategy}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>How to get real competitor data from Google Ads</div>
              {['Go to ads.google.com → click a campaign','Click the Reports icon (bar chart icon, top right)','Select "Auction insights" from the drop-down','You will see a table showing competitor domains','Download as CSV','Upload that CSV in the Data Upload tab on this platform','The platform will show exact impression share vs each competitor'].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:5}}>
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
            <div style={{background:T.blueBg,border:`0.5px solid ${T.blueBorder}`,borderRadius:7,padding:'9px 13px',marginBottom:14,fontSize:11,color:T.blue,fontWeight:500}}>
              Complete step-by-step instructions for every change. Open Google Ads in another tab alongside this guide.
            </div>
            {[
              {title:'Add negative keywords (stops wasting money)',steps:['Go to ads.google.com','Click the Tools & Settings wrench icon at the very top of the page','Click Shared library in the dropdown','Click Negative keyword lists','Click the blue + button on the left','Name your list: "CC Block List April 2026"','Go to the Block Keywords tab on this page → select all keywords → click Copy','Paste them into the keyword box — one per line','Click Save','Now go back to your Campaigns list','Tick the checkbox at the top to select ALL campaigns','Click Edit in the blue bar that appears → click Edit settings','Scroll to Negative keywords → click Add from list → select CC Block List April 2026','Click Save — done']},
              {title:'Fix device bid modifiers (biggest quick win)',steps:['Go to ads.google.com','Click on "Shopify All Products" campaign','In the left-hand menu click Devices','You will see Mobile, Desktop, Tablet rows','Click the pencil icon on the Mobile row','Change the bid adjustment to -40%','Click Save','Click the pencil icon on Desktop row','Change the bid adjustment to +50%','Click Save','Click pencil on Tablet → +20% → Save','Repeat these steps for every campaign in your account']},
              {title:'Set day and time bid modifiers',steps:['Go to ads.google.com','Click on a campaign','In the left menu click Ad schedule','Click the blue + to add a new time segment','To exclude night: select all days, set time 12:00am to 6:00am, bid -100% (this excludes it)','To boost Friday evening: select Friday, 6pm to 9pm, bid +20%','To boost Saturday: select Saturday, all day, bid +20%','Click Save after each change','Repeat for every campaign']},
              {title:'Pause a campaign',steps:['Go to ads.google.com','Click Campaigns in the left menu','Find the campaign you want to pause (e.g. Synthetic Wigs 2026)','Click the green circle/dot next to the campaign name','Select Paused from the dropdown','The campaign will stop immediately — budget stops being spent']},
              {title:'Delete a campaign',steps:['Go to ads.google.com → Campaigns','Find March 2018 Campaign','Click the three dots (...) to the right of the campaign name','Select Remove','Type REMOVE in the confirmation box','Click Remove campaign — it is gone']},
              {title:'Increase a keyword bid',steps:['Go to ads.google.com','Click on the campaign that contains the keyword','In the left menu click Keywords','Find the keyword you want to increase','Click the bid amount (shown in the Bid column)','Type the new bid amount from the Scale Keywords tab','Click Save','The higher bid takes effect within minutes']},
              {title:'Change monthly budget',steps:['Go to ads.google.com → Campaigns','Find the campaign you want to change','Click the budget amount shown below the campaign name','Type the new daily budget (take the monthly budget from this page and divide by 30.4 to get the daily amount)','Click Save']},
              {title:'Adjust location targeting',steps:['Go to ads.google.com → click a campaign','In the left menu click Locations','You will see a list of your targeted locations','Click the pencil icon next to a location','To increase: type a positive % e.g. +15%','To decrease: type a negative % e.g. -40%','To exclude completely: click the dropdown and select Excluded','Click Save']},
            ].map((s,si)=>(
              <div key={si} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>{si+1}. {s.title}</div>
                {s.steps.map((step,i)=>(
                  <div key={i} style={{display:'flex',gap:9,marginBottom:5}}>
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
                <span style={{fontSize:12,fontWeight:600,color:T.text}}>All Paid Ads actions — tick as you complete each one in Google Ads</span>
                <span style={{fontSize:11,color:T.textMuted}}>{doneCount}/{ALL_TASK_IDS.length} · {donePct}%</span>
              </div>
              <div style={{height:6,background:T.borderLight,borderRadius:99,border:`0.5px solid ${T.border}`,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${donePct}%`,background:donePct===100?T.green:T.blue,borderRadius:99,transition:'width 0.3s'}}/>
              </div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:6}}>Ticking here also updates the daily overview progress bar. Ticking in any other tab updates this bar too — everything is connected.</div>
            </div>
            {[
              {title:'🚨 Critical — do today first', color:T.red, items:[
                {id:'t_neg_energy',text:'Add energy drink negative keywords (Monster, Red Bull, Sour Patch)',how:'Block Keywords tab → select → Copy → paste into Google Ads Shared Library → Negative keyword lists'},
                {id:'t_pause_wigs',text:'PAUSE Synthetic Wigs 2026 campaign — losing £1,240 at 0.48x ROAS',how:'Campaigns → Synthetic Wigs 2026 → click green status dot → Paused'},
                {id:'t_delete_2018',text:'DELETE March 2018 campaign — dead test campaign',how:'Campaigns → March 2018 → 3-dot menu → Remove'},
                {id:'t_scale_hh',text:'Scale Human Hair Brands to £500/month — 11.29x ROAS, only £62 in 2 years!',how:'Campaigns → Human Hair - Brands → Budget → £16.67/day'},
              ]},
              {title:'📱 Device changes', color:T.blue, items:[
                {id:'t_mobile_reduce',text:'Reduce mobile bid -40% on Shopify All Products',how:'Campaigns → Shopify All Products → Devices → Mobile → -40%'},
                {id:'t_desktop_scale',text:'Increase desktop budget +50% on Shopify All Products',how:'Campaigns → Shopify All Products → Devices → Desktop → +50%'},
                {id:'t_tablet_bid',text:'Add +20% tablet bid modifier on all campaigns',how:'Each Campaign → Devices → Tablets → +20%'},
              ]},
              {title:'⏰ Timing changes', color:T.purple, items:[
                {id:'t_excl_night',text:'Exclude 12am–6am completely — wasting £2,137',how:'Campaigns → Ad Schedule → Add → 12am–6am → -100%'},
                {id:'t_fri_eve',text:'Add +20% bid on 6pm–9pm — best ROAS window',how:'Campaigns → Ad Schedule → 6pm–9pm → +20%'},
                {id:'t_sat_day',text:'Add +20% bid on Saturday — best day (3.89x ROAS)',how:'Campaigns → Ad Schedule → Saturday → +20%'},
              ]},
              {title:'📍 Location changes', color:T.amber, items:[
                {id:'t_pause_glasgow',text:'PAUSE Glasgow targeting — 0.71x ROAS',how:'Campaigns → Settings → Locations → Glasgow → Excluded'},
                {id:'t_reduce_london',text:'Reduce London bid -40% — 1.24x ROAS, £4,210 wasted',how:'Campaigns → Settings → Locations → London → -40%'},
                {id:'t_scale_leeds',text:'Increase Leeds bid +15% — home city, 3.21x ROAS',how:'Campaigns → Settings → Locations → Leeds → +15%'},
                {id:'t_scale_bradford',text:'Increase Bradford bid +10% — 2.84x ROAS',how:'Campaigns → Settings → Locations → Bradford → +10%'},
              ]},
              {title:'🚀 Keyword bid increases', color:T.green, items:[
                {id:'t_kw_matrix',text:'Add exact match [matrix matte definer] — 1000x ROAS, £0.03 CPA',how:'Keywords → + Add → [matrix matte definer] → £0.80 bid'},
                {id:'t_kw_nst',text:'Add exact match [naturally straight beautiful textures] — 735x ROAS',how:'Keywords → + Add → [naturally straight beautiful textures] → £0.60'},
                {id:'t_kw_bsset',text:'Increase bsset curl cream bid to £1.40 — 24 conversions',how:'Keywords → bsset curl cream → Edit bid → £1.40'},
                {id:'t_kw_hh',text:'Add [human hair extensions] exact match — 11.29x ROAS',how:'Keywords → + Add → [human hair extensions] → £1.80 bid'},
                {id:'t_kw_edge',text:'Increase edge control bid to £1.30 — 7x ROAS',how:'Keywords → edge control → Edit bid → £1.30'},
              ]},
              {title:'🚫 Block keywords', color:T.red, items:[
                {id:'t_neg_redbull',text:'Block red bull and monster energy separately',how:'Block Keywords tab → Copy → paste into Google Ads negative keyword list'},
                {id:'t_neg_salon',text:'Block all hair salon / service intent searches',how:'Block Keywords tab → select salon searches → Copy → add to negative list'},
                {id:'t_neg_tutorial',text:'Block all tutorial / info intent searches',how:'Block Keywords tab → select tutorial searches → Copy → add to negative list'},
              ]},
            ].map((group,gi)=>(
              <div key={gi} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden',marginBottom:10}}>
                <div style={{padding:'9px 14px',borderBottom:`0.5px solid ${T.border}`,background:T.bg,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:600,color:T.text}}>{group.title}</span>
                  <span style={{fontSize:11,color:T.textMuted}}>{group.items.filter(i=>tasks[i.id]).length}/{group.items.length} done</span>
                </div>
                {group.items.map((item,ii)=>(
                  <div key={item.id} onClick={()=>tick(item.id)} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 14px',borderBottom:ii<group.items.length-1?`0.5px solid ${T.borderLight}`:'none',cursor:'pointer',background:tasks[item.id]?T.greenBg:'transparent',transition:'background 0.1s'}}>
                    <div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${tasks[item.id]?T.green:T.border}`,background:tasks[item.id]?T.green:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:1}}>
                      {tasks[item.id]&&<svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:tasks[item.id]?T.textMuted:T.text,textDecoration:tasks[item.id]?'line-through':'none',lineHeight:1.4,marginBottom:3}}>{item.text}</div>
                      <div style={{fontSize:10,color:T.blue,lineHeight:1.4}}>→ {item.how}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={()=>{setTasks({});localStorage.removeItem('cc_ads_v3')}} style={{fontSize:11,color:T.textMuted,background:'none',border:`0.5px solid ${T.border}`,borderRadius:6,padding:'6px 14px',marginTop:4,cursor:'pointer'}}>Reset all</button>
          </div>
        )}
      </Shell>
    </>
  )
}
