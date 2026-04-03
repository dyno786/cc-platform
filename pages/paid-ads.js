import Head from 'next/head'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117',surface:'#1a1d27',surface2:'#22263a',border:'#2e3347',
  text:'#e8eaf0',text2:'#8b90a7',text3:'#555b75',
  green:'#22c55e',amber:'#f59e0b',red:'#ef4444',
  blue:'#3b82f6',accent:'#6366f1',accent2:'#818cf8',teal:'#14b8a6',purple:'#a855f7',
}

// ─── 2-YEAR DATA (Apr 2024 – Apr 2026) ───────────────────────────────────────
const YEARLY = {
  dateRange: '3 Apr 2024 – 3 Apr 2026',
  totalSpend: '£34,697',
  totalRevenue: '£61,952',
  overallROAS: '1.79x',
  totalConversions: '3,291',
  wastedSpend: '£32,160',
  wastedPct: '93%',
  summary: 'Over 2 years CC Hair & Beauty spent £34,697 on Google Ads generating £61,952 revenue at 1.79x ROAS — well below the 3x minimum target. The most shocking finding: £32,160 (93%) of search term spend generated zero conversions. You spent £1,284 on energy drink searches (Monster, Red Bull, Sour Patch Kids) — completely irrelevant. Your best converting terms cost pennies: "naturally straight beautiful textures" at £0.04 CPA and "xpression springy bohemian twist" at £0.07 CPA. Shopify All Products consumed £29,601 (85% of all spend) at only 1.74x ROAS.',
  campaigns: [
    { name:'Shopify All Products', spend:'£29,601', revenue:'£51,454', roas:'1.74x', cpa:'£10.79', conversions:'2,744', clicks:'228,914', status:'REDUCE', action:'Consuming 85% of budget at 1.74x ROAS — reduce by 40%, add 50 negative keywords, switch to exact match' },
    { name:'All By Brands', spend:'£906', revenue:'£2,879', roas:'3.18x', cpa:'£5.69', conversions:'159', clicks:'16,307', status:'SCALE', action:'Only campaign above 3x ROAS — increase budget 3x immediately, this is where the money is' },
    { name:'Shopify All Products #3', spend:'£2,190', revenue:'£3,981', roas:'1.82x', cpa:'£9.90', conversions:'221', clicks:'16,541', status:'REDUCE', action:'Below 2x ROAS — reduce budget 30%, add negative keywords' },
    { name:'Synthetic Hair Bids', spend:'£292', revenue:'£549', roas:'1.88x', cpa:'£12.48', conversions:'23', clicks:'3,371', status:'REDUCE', action:'Under 2x ROAS — reduce budget, tighten targeting to exact match' },
    { name:'Human Hair - Brands', spend:'£65', revenue:'£745', roas:'11.29x', cpa:'£7.88', conversions:'8', clicks:'725', status:'SCALE', action:'11.29x ROAS — massively underinvested, increase budget 5x and scale aggressively' },
    { name:'Synthetic Wigs 2026', spend:'£83', revenue:'£38', roas:'0.46x', cpa:'£20.97', conversions:'4', clicks:'580', status:'PAUSE', action:'0.46x ROAS — losing more than earning, pause immediately' },
    { name:'March 2018', spend:'£12', revenue:'£0', roas:'0x', cpa:'—', conversions:'0', clicks:'65', status:'KILL', action:'Old test campaign — delete immediately' },
  ],
  devices: [
    { device:'Mobile', spend:'£30,843', revenue:'£53,203', roas:'1.72x', cpa:'£10.77', conversions:'2,864', clicks:'248,295', recommendation:'Increase bid +20% — drives 87% of all conversions', insight:'Mobile is everything. But ROAS is only 1.72x — the problem is not the device, it\'s the keywords. Fix keywords first.' },
    { device:'Desktop', spend:'£1,979', revenue:'£5,369', roas:'2.71x', cpa:'£8.17', conversions:'242', clicks:'15,165', recommendation:'Keep current bid — actually better ROAS than mobile', insight:'Surprise — desktop has better ROAS than mobile (2.71x vs 1.72x). Consider increasing desktop bids.' },
    { device:'Tablet', spend:'£349', revenue:'£1,076', roas:'3.08x', cpa:'£6.51', conversions:'53', clicks:'3,199', recommendation:'Increase bid +15% — best ROAS of all devices', insight:'Best ROAS at 3.08x and cheapest CPA at £6.51 — completely underinvested, increase budget.' },
  ],
  topConvertingTerms: [
    { term:'bsset curl cream', clicks:'312', cost:'£29.64', conversions:'24.17', cpa:'£1.23', action:'Top converter — add as exact match, increase bid to £0.15' },
    { term:'edge booster', clicks:'176', cost:'£22.17', conversions:'9.48', cpa:'£2.34', action:'Strong performer — add as exact match keyword' },
    { term:'caro light soap', clicks:'26', cost:'£3.36', conversions:'11.00', cpa:'£0.31', action:'Excellent CPA — scale immediately, increase bid' },
    { term:'american crew superglue', clicks:'18', cost:'£2.06', conversions:'9.00', cpa:'£0.23', action:'23p CPA — scale aggressively, massively underinvested' },
    { term:'naturally straight beautiful textures', clicks:'4', cost:'£0.25', conversions:'7.00', cpa:'£0.04', action:'4p CPA — scale immediately, set bid to £0.30' },
    { term:'xpression springy bohemian twist', clicks:'4', cost:'£0.43', conversions:'6.00', cpa:'£0.07', action:'7p CPA — scale immediately' },
    { term:'designer touch relaxer', clicks:'51', cost:'£4.50', conversions:'5.90', cpa:'£0.76', action:'Add as exact match, increase bid' },
    { term:'dark and lovely cholesterol', clicks:'18', cost:'£2.30', conversions:'8.00', cpa:'£0.29', action:'Add as exact match keyword' },
    { term:'bsset defining curl cream', clicks:'153', cost:'£14.84', conversions:'6.00', cpa:'£2.47', action:'Good volume converter — keep and optimise' },
    { term:'filthy muk styling paste', clicks:'8', cost:'£1.10', conversions:'6.00', cpa:'£0.18', action:'18p CPA — scale, this is a hidden gem' },
    { term:'dr miracles leave in conditioner', clicks:'7', cost:'£0.84', conversions:'6.00', cpa:'£0.14', action:'14p CPA — scale immediately' },
    { term:'style factor edge booster', clicks:'51', cost:'£6.29', conversions:'6.00', cpa:'£1.05', action:'Add as exact match keyword' },
  ],
  topWastedTerms: [
    { term:'Monster Energy drinks (Red Bull, Monster, Sour Patch Kids etc)', cost:'£1,284', reason:'Energy drinks & snacks — completely irrelevant to hair & beauty. 1,988 different energy drink searches.' },
    { term:'ash blonde', cost:'£37.52', reason:'Hair colour tutorial search — not shopping intent' },
    { term:'elvive conditioner', cost:'£35.57', reason:'Specific supermarket brand — wrong audience' },
    { term:'makeup remover', cost:'£29.36', reason:'Generic search — users want specific brands we may not stock' },
    { term:'nk lip gloss', cost:'£26.37', reason:'Specific brand — not our target product' },
    { term:'shampoo', cost:'£21.23', reason:'Too broad — 99% looking for supermarket brands' },
    { term:'nair', cost:'£20.30', reason:'Hair removal brand — wrong product category' },
    { term:'kinky curly custard', cost:'£19.53', reason:'Specific US brand — not stocked' },
    { term:'dove body wash', cost:'£19.43', reason:'Supermarket brand — wrong audience' },
    { term:'purple shampoo', cost:'£19.34', reason:'Generic — users want specific toning brands' },
    { term:'baby oil', cost:'£18.24', reason:'Pharmacy/supermarket product — wrong category' },
    { term:'head and shoulders', cost:'£17.99', reason:'Supermarket brand — completely wrong audience' },
    { term:'baby powder', cost:'£17.70', reason:'Baby product — wrong category' },
    { term:'mouthwash', cost:'£17.48', reason:'Oral hygiene — nothing to do with hair & beauty' },
    { term:'butterfly locs', cost:'£17.18', reason:'DIY tutorial search — not shopping intent' },
  ],
  biggestInsights: [
    '🚨 Energy drinks cost you £1,284 over 2 years — Monster, Red Bull, Sour Patch Kids were triggering your ads somehow. Add ALL energy drink terms as negatives immediately.',
    '💡 Human Hair - Brands has 11.29x ROAS but only £65 spend in 2 years — this is your most profitable campaign and you\'ve been ignoring it. Increase budget 5x now.',
    '💡 Tablet has the best ROAS at 3.08x and cheapest CPA at £6.51 — but only £349 spent in 2 years. Increase tablet bids by 15%.',
    '💡 Desktop has 2.71x ROAS vs Mobile 1.72x — counter-intuitive but desktop converts better. Don\'t cut desktop, cut bad keywords instead.',
    '🚨 Shopify All Products spent £29,601 (85% of budget) at 1.74x ROAS — this is the main problem. Reduce budget by 40% and add 50 negative keywords.',
    '💡 Your cheapest converting keywords cost 4p-23p CPA — "naturally straight beautiful textures" (4p), "american crew superglue" (23p). These need 10x the budget.',
  ],
  negativeKeywords: [
    'red bull','monster energy','monster drink','sour patch kids','purple monster','pink monster','peach monster','white monster','pipeline punch monster','monster nitro','redbull',
    'ash blonde','dark ash blonde','purple shampoo','shampoo','conditioner','elvive','dove body wash','head and shoulders','garnier',
    'makeup remover','mouthwash','baby oil','baby powder','nair','kinky curly custard','nk lip gloss',
    'butterfly locs','leave in conditioner','rose water','energy drink',
  ],
}

// ─── MARCH 2026 MONTHLY DATA ─────────────────────────────────────────────────
const MARCH_2026 = {
  month: 'March 2026',
  dateRange: '4 Mar – 2 Apr 2026',
  totalSpend: '£1,487',
  totalRevenue: '£2,111',
  overallROAS: '1.42x',
  overallCPA: '£13.52',
  totalConversions: '110',
  wastedSpend: '£1,503',
  wastedPct: '99%',
  summary: 'March 2026: £1,487 spent generating £2,111 revenue (1.42x ROAS). Mobile drove 93% of conversions at £13.31 CPA. Critical issue: £1,503 of £1,518 search term spend (99%) generated zero conversions. Key action: pause Human Hair - Brands immediately (£20 spent, 0 conversions) and add 20 negative keywords this week.',
  campaigns: [
    { name:'All By Brands', spend:'£430', revenue:'£618', roas:'1.44x', cpa:'£8.15', conversions:'52.82', clicks:'6,342', status:'GROW', action:'Best this month — increase budget 20%, move to exact match keywords' },
    { name:'Shopify All Products', spend:'£885', revenue:'£1,307', roas:'1.48x', cpa:'£17.88', conversions:'49.51', clicks:'6,954', status:'REDUCE', action:'Too broad — reduce 30%, add negative keywords, exact match only' },
    { name:'Synthetic Hair Bids', spend:'£114', revenue:'£142', roas:'1.24x', cpa:'£23.43', conversions:'4.90', clicks:'1,322', status:'REDUCE', action:'Poor ROAS — reduce 20%, review targeting' },
    { name:'Synthetic Wigs 2026', spend:'£37', revenue:'£5', roas:'0.15x', cpa:'£18.50', conversions:'2.00', clicks:'236', status:'PAUSE', action:'0.15x ROAS — losing money, pause now' },
    { name:'Human Hair - Brands', spend:'£20', revenue:'£0', roas:'0x', cpa:'—', conversions:'0', clicks:'223', status:'KILL', action:'PAUSE immediately — £20 spent, zero conversions' },
  ],
  devices: [
    { device:'Mobile', spend:'£1,354', revenue:'£1,922', roas:'1.42x', cpa:'£13.31', conversions:'101', clicks:'13,877', recommendation:'Increase bid +20% — drives 93% of conversions' },
    { device:'Desktop', spend:'£116', revenue:'£124', roas:'1.07x', cpa:'£21.37', conversions:'5', clicks:'1,034', recommendation:'Reduce bid -30% — barely breaking even' },
    { device:'Tablet', spend:'£16', revenue:'£26', roas:'1.64x', cpa:'£8.22', conversions:'2', clicks:'166', recommendation:'Keep current — good ROAS but small volume' },
  ],
  topConvertingTerms: [
    { term:'beauty formulas hair removal cream', clicks:'2', cost:'£0.10', conversions:'3', cpa:'£0.03' },
    { term:'ors curls unleashed leave in conditioner', clicks:'2', cost:'£0.08', conversions:'3', cpa:'£0.03' },
    { term:'lip gloss', clicks:'5', cost:'£0.22', conversions:'3', cpa:'£0.07' },
    { term:'cocoa butter nubian queen', clicks:'3', cost:'£0.16', conversions:'2.99', cpa:'£0.05' },
    { term:'premium too hh deep wave bulk', clicks:'1', cost:'£0.16', conversions:'2.94', cpa:'£0.05' },
    { term:'nivea cream', clicks:'71', cost:'£3.22', conversions:'2', cpa:'£1.61' },
    { term:'paw paw cream', clicks:'6', cost:'£0.51', conversions:'2', cpa:'£0.26' },
    { term:'silvertree argan oil', clicks:'2', cost:'£0.33', conversions:'2', cpa:'£0.17' },
  ],
  topWastedTerms: [
    { term:'afro hair', cost:'£7.04', reason:'Too broad — no shopping intent' },
    { term:'hairco', cost:'£2.94', reason:'Competitor brand' },
    { term:'creme of nature hair dye', cost:'£2.84', reason:'Specific brand — wrong audience' },
    { term:'eyebrow shapes', cost:'£2.70', reason:'Tutorial search — not shopping' },
    { term:'freetress gogo curl braids', cost:'£2.73', reason:'Zero conversions' },
    { term:'t gel shampoo', cost:'£2.43', reason:'Pharmacy product — wrong category' },
    { term:'olive oil ear drops', cost:'£2.01', reason:'Medical product — completely irrelevant' },
    { term:'fashion idol bundles', cost:'£2.11', reason:'Zero conversions — too vague' },
    { term:'neutrogena hand cream', cost:'£1.70', reason:'Wrong brand — not stocked' },
    { term:'mustard oil', cost:'£1.66', reason:'Cooking search — wrong category' },
  ],
  negativeKeywords: [
    'afro hair','eyebrow shapes','t gel shampoo','mustard oil','olive oil ear drops','neutrogena','pantene','veet cream','comb','hairco',
    'eyebrow razor','fake tan','coal tar shampoo','simple moisturizer','cerave','colgate','dove deodorant','baby oil','alberto balsam',
    'garnier shampoo','elvive shampoo','st ives','head and shoulders','tresemme','herbal essences','apple cider vinegar',
  ],
  urgentActions: [
    'PAUSE Human Hair - Brands — £20 spent, 0 conversions, complete waste',
    'PAUSE Synthetic Wigs 2026 — 0.15x ROAS, losing money every click',
    'Add 26 negative keywords — £1,503 wasted this month alone',
    'Scale ORS Curls Unleashed — 3 conversions at 3p CPA, massively underinvested',
    'Reduce Shopify All Products budget 30% — 1.48x ROAS is below break even',
  ],
  tasks: [
    { id:'m1', cat:'🚨 Urgent', text:'PAUSE Human Hair - Brands campaign', done:false },
    { id:'m2', cat:'🚨 Urgent', text:'PAUSE Synthetic Wigs 2026 campaign', done:false },
    { id:'m3', cat:'🚫 Keywords', text:'Copy & add all 26 negative keywords to Google Ads', done:false },
    { id:'m4', cat:'📢 Campaigns', text:'Reduce Shopify All Products budget by 30%', done:false },
    { id:'m5', cat:'📢 Campaigns', text:'Switch All By Brands to Exact Match only', done:false },
    { id:'m6', cat:'📱 Bids', text:'Set mobile bid modifier to +20% on All By Brands', done:false },
    { id:'m7', cat:'📱 Bids', text:'Set desktop bid modifier to -30% on all campaigns', done:false },
    { id:'m8', cat:'🔍 Scale', text:'Add ORS Curls Unleashed as exact match — bid £0.20', done:false },
    { id:'m9', cat:'🔍 Scale', text:'Add beauty formulas hair removal cream as exact match', done:false },
    { id:'m10', cat:'🔍 Scale', text:'Add lip gloss as exact match keyword', done:false },
  ],
}

// Yearly tasks
const YEARLY_TASKS_KEY = 'cc_yearly_tasks'
const YEARLY_TASKS_DEFAULT = [
  { id:'y1', cat:'🚨 Critical', text:'Scale Human Hair - Brands budget 5x — 11.29x ROAS, only £65 spent in 2 years', done:false },
  { id:'y2', cat:'🚨 Critical', text:'Add all energy drink negative keywords — Monster, Red Bull, Sour Patch Kids cost £1,284 over 2 years', done:false },
  { id:'y3', cat:'🚨 Critical', text:'Reduce Shopify All Products budget 40% — spent £29,601 at only 1.74x ROAS', done:false },
  { id:'y4', cat:'📢 Campaigns', text:'KILL March 2018 campaign — old test campaign, delete from Google Ads', done:false },
  { id:'y5', cat:'📢 Campaigns', text:'PAUSE Synthetic Wigs 2026 — 0.46x ROAS over 2 years', done:false },
  { id:'y6', cat:'📱 Bids', text:'Increase tablet bid +15% — best ROAS at 3.08x, only £349 spent in 2 years', done:false },
  { id:'y7', cat:'📱 Bids', text:'Do NOT cut desktop bids — desktop 2.71x ROAS vs mobile 1.72x', done:false },
  { id:'y8', cat:'🔍 Scale', text:'Scale "naturally straight beautiful textures" — 4p CPA, 7 conversions', done:false },
  { id:'y9', cat:'🔍 Scale', text:'Scale "american crew superglue" — 23p CPA, 9 conversions', done:false },
  { id:'y10', cat:'🔍 Scale', text:'Scale "xpression springy bohemian twist" — 7p CPA, 6 conversions', done:false },
  { id:'y11', cat:'🔍 Scale', text:'Scale "dr miracles leave in conditioner" — 14p CPA, 6 conversions', done:false },
  { id:'y12', cat:'🔍 Scale', text:'Scale "filthy muk styling paste" — 18p CPA, 6 conversions', done:false },
]

function Card({ title, icon, color, children }) {
  return (
    <div style={{ background:C.surface, border:`1px solid ${color}30`, borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'11px 16px', background:`${color}10`, borderBottom:`1px solid ${color}20`, display:'flex', alignItems:'center', gap:8 }}>
        <span>{icon}</span>
        <span style={{ fontWeight:700, color, fontSize:13 }}>{title}</span>
      </div>
      <div style={{ padding:16 }}>{children}</div>
    </div>
  )
}

function Stat({ label, value, color, sub }) {
  return (
    <div style={{ background:C.surface2, borderRadius:10, padding:'11px 13px', textAlign:'center' }}>
      <div style={{ fontSize:20, fontWeight:800, color }}>{value}</div>
      {sub && <div style={{ fontSize:9, color:C.red, marginTop:1 }}>{sub}</div>}
      <div style={{ fontSize:10, color:C.text3, marginTop:3 }}>{label}</div>
    </div>
  )
}

function StatusBadge({ s }) {
  const c = s==='SCALE'?C.green:s==='GROW'?C.blue:s==='REDUCE'?C.amber:C.red
  return <span style={{ background:`${c}20`, color:c, padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700 }}>{s}</span>
}

function TaskList({ tasks, onToggle }) {
  const cats = [...new Set(tasks.map(t=>t.cat))]
  return (
    <div>
      {cats.map(cat => {
        const ct = tasks.filter(t=>t.cat===cat)
        const cd = ct.filter(t=>t.done).length
        return (
          <div key={cat} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
              <span style={{ fontWeight:700, color:C.text, fontSize:13 }}>{cat}</span>
              <span style={{ fontSize:11, color:cd===ct.length?C.green:C.text3 }}>{cd}/{ct.length}</span>
            </div>
            {ct.map(t => (
              <div key={t.id} onClick={()=>onToggle(t.id)}
                style={{ background:t.done?`${C.green}08`:C.surface, border:`1px solid ${t.done?C.green:C.border}`, borderRadius:9, padding:'10px 13px', cursor:'pointer', display:'flex', gap:11, marginBottom:5, alignItems:'flex-start' }}>
                <div style={{ width:18,height:18,borderRadius:4,border:`2px solid ${t.done?C.green:C.border}`,background:t.done?C.green:'none',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}>
                  {t.done && <span style={{ color:'#000', fontSize:11, fontWeight:800 }}>✓</span>}
                </div>
                <span style={{ fontSize:12, color:t.done?C.text3:C.text, textDecoration:t.done?'line-through':'none', lineHeight:1.5 }}>{t.text}</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default function PaidAds() {
  const [view, setView] = useState('yearly') // 'yearly' | 'monthly'
  const [activeTab, setActiveTab] = useState('overview')
  const [yearlyTasks, setYearlyTasks] = useState(YEARLY_TASKS_DEFAULT)
  const [monthlyTasks, setMonthlyTasks] = useState(MARCH_2026.tasks)
  const [copied, setCopied] = useState(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [monthlyUrl, setMonthlyUrl] = useState('')

  useEffect(() => {
    try {
      const yt = localStorage.getItem('cc_yearly_tasks')
      if (yt) setYearlyTasks(JSON.parse(yt))
      const mt = localStorage.getItem('cc_monthly_tasks_mar26')
      if (mt) setMonthlyTasks(JSON.parse(mt))
      const mu = localStorage.getItem('cc_monthly_url')
      if (mu) setMonthlyUrl(mu)
    } catch(e) {}
  }, [])

  function toggleYearlyTask(id) {
    const u = yearlyTasks.map(t=>t.id===id?{...t,done:!t.done}:t)
    setYearlyTasks(u); localStorage.setItem('cc_yearly_tasks', JSON.stringify(u))
  }
  function toggleMonthlyTask(id) {
    const u = monthlyTasks.map(t=>t.id===id?{...t,done:!t.done}:t)
    setMonthlyTasks(u); localStorage.setItem('cc_monthly_tasks_mar26', JSON.stringify(u))
  }

  const tasks = view==='yearly' ? yearlyTasks : monthlyTasks
  const done = tasks.filter(t=>t.done).length
  const pct = Math.round((done/tasks.length)*100)
  const d = view==='yearly' ? YEARLY : MARCH_2026

  const yearlyTabs = [
    {id:'overview',label:'Overview',icon:'📊'},
    {id:'tasks',label:`Tasks (${done}/${tasks.length})`,icon:'✅'},
    {id:'campaigns',label:'Campaigns',icon:'📢'},
    {id:'devices',label:'By Device',icon:'📱'},
    {id:'keywords',label:'Search Terms',icon:'🔍'},
    {id:'negatives',label:'Neg. Keywords',icon:'🚫'},
    {id:'insights',label:'Key Insights',icon:'💡'},
  ]

  const monthlyTabs = [
    {id:'overview',label:'Overview',icon:'📊'},
    {id:'tasks',label:`Tasks (${done}/${tasks.length})`,icon:'✅'},
    {id:'campaigns',label:'Campaigns',icon:'📢'},
    {id:'devices',label:'By Device',icon:'📱'},
    {id:'keywords',label:'Search Terms',icon:'🔍'},
    {id:'negatives',label:'Neg. Keywords',icon:'🚫'},
  ]

  const TABS = view==='yearly' ? yearlyTabs : monthlyTabs

  return (
    <>
      <Head>
        <title>Paid Ads — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}button,input{font-family:inherit}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`}</style>
      </Head>
      <Nav/>

      <div style={{ maxWidth:1300, margin:'0 auto', padding:20 }}>

        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:3 }}>📊 Paid Ads Analysis</h1>
            <div style={{ color:C.text3, fontSize:12 }}>{d.dateRange} · Real Google Ads data</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>{setView('yearly');setActiveTab('overview')}}
              style={{ padding:'8px 16px', borderRadius:8, border:`2px solid ${view==='yearly'?C.accent:C.border}`, background:view==='yearly'?`${C.accent}20`:C.surface2, color:view==='yearly'?C.accent2:C.text2, fontWeight:700, fontSize:12, cursor:'pointer' }}>
              📅 2-Year View
            </button>
            <button onClick={()=>{setView('monthly');setActiveTab('overview')}}
              style={{ padding:'8px 16px', borderRadius:8, border:`2px solid ${view==='monthly'?C.green:C.border}`, background:view==='monthly'?`${C.green}20`:C.surface2, color:view==='monthly'?C.green:C.text2, fontWeight:700, fontSize:12, cursor:'pointer' }}>
              📆 March 2026
            </button>
            <button onClick={()=>setShowUrlInput(!showUrlInput)}
              style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface2, color:C.text2, fontWeight:600, fontSize:12, cursor:'pointer' }}>
              🔗 Add Month
            </button>
          </div>
        </div>

        {/* ADD MONTH URL */}
        {showUrlInput && (
          <div style={{ background:C.surface, border:`1px solid ${C.accent}30`, borderRadius:11, padding:14, marginBottom:14 }}>
            <div style={{ fontWeight:700, color:C.text, marginBottom:6, fontSize:13 }}>📎 Add Next Month — paste your filtered CC Master Report Google Sheet URL</div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={monthlyUrl} onChange={e=>setMonthlyUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..."
                style={{ flex:1, background:C.surface2, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, fontSize:12, padding:'8px 11px', outline:'none' }}/>
              <button onClick={()=>{localStorage.setItem('cc_monthly_url',monthlyUrl);setShowUrlInput(false)}}
                style={{ padding:'8px 16px', borderRadius:7, border:'none', background:C.accent, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>Save</button>
            </div>
          </div>
        )}

        {/* PROGRESS */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:11, padding:13, marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{view==='yearly'?'2-Year Analysis Tasks':'March 2026 Tasks'} — {done}/{tasks.length} completed</div>
            <div style={{ color:C.text3, fontSize:11, marginTop:2 }}>Tick off each task as you complete it in Google Ads</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:160, height:7, background:C.surface2, borderRadius:99, overflow:'hidden' }}>
              <div style={{ width:`${pct}%`, height:'100%', background:pct===100?C.green:pct>50?C.blue:C.amber, borderRadius:99, transition:'width .3s' }}/>
            </div>
            <span style={{ background:pct===100?`${C.green}20`:`${C.accent}20`, color:pct===100?C.green:C.accent2, padding:'3px 11px', borderRadius:99, fontSize:12, fontWeight:700 }}>
              {pct===100?'✅ Done!':pct+'%'}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:1, marginBottom:14, borderBottom:`1px solid ${C.border}`, overflowX:'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
              padding:'8px 13px', border:'none', background:'none', whiteSpace:'nowrap',
              borderBottom:activeTab===t.id?`2px solid ${C.accent}`:'2px solid transparent',
              color:activeTab===t.id?C.accent2:C.text3, fontWeight:activeTab===t.id?700:400,
              fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4, marginBottom:-1,
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab==='overview' && (
          <div>
            <div style={{ background:`${C.amber}08`, border:`1px solid ${C.amber}20`, borderRadius:10, padding:13, marginBottom:14, fontSize:13, color:C.amber, lineHeight:1.7 }}>
              💡 {d.summary}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:9, marginBottom:14 }}>
              <Stat label="Total Spend" value={d.totalSpend} color={C.red}/>
              <Stat label="Revenue" value={d.totalRevenue} color={C.green}/>
              <Stat label="ROAS" value={d.overallROAS} color={C.blue}/>
              {d.overallCPA && <Stat label="CPA" value={d.overallCPA} color={C.amber}/>}
              <Stat label="Conversions" value={d.totalConversions} color={C.teal}/>
              <Stat label="Wasted" value={d.wastedSpend} color={C.red} sub={d.wastedPct+' of budget'}/>
            </div>
            {d.urgentActions && (
              <Card title="Urgent actions this month" icon="🚨" color={C.red}>
                {d.urgentActions.map((a,i)=>(
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:7, fontSize:13, color:C.text2, lineHeight:1.5, paddingBottom:7, borderBottom:i<d.urgentActions.length-1?`1px solid ${C.border}`:'none' }}>
                    <div style={{ width:20,height:20,borderRadius:'50%',background:i<2?C.red:i<4?C.amber:C.blue,color:'#000',fontWeight:800,fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{i+1}</div>
                    {a}
                  </div>
                ))}
              </Card>
            )}
            {view==='yearly' && d.biggestInsights && (
              <Card title="2-year biggest findings" icon="🔍" color={C.blue}>
                {d.biggestInsights.map((ins,i)=>(
                  <div key={i} style={{ fontSize:13, color:C.text2, lineHeight:1.6, marginBottom:8, paddingBottom:8, borderBottom:i<d.biggestInsights.length-1?`1px solid ${C.border}`:'none' }}>{ins}</div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* ── TASKS ── */}
        {activeTab==='tasks' && (
          <div>
            <div style={{ color:C.text2, fontSize:13, marginBottom:14 }}>Click to tick off each task. Progress saves automatically.</div>
            <TaskList tasks={tasks} onToggle={view==='yearly'?toggleYearlyTask:toggleMonthlyTask}/>
            {pct===100 && (
              <div style={{ background:`${C.green}10`, border:`1px solid ${C.green}`, borderRadius:11, padding:18, textAlign:'center', marginTop:8 }}>
                <div style={{ fontSize:28, marginBottom:6 }}>🎉</div>
                <div style={{ fontWeight:800, color:C.green, fontSize:15, marginBottom:6 }}>All tasks complete!</div>
                <div style={{ color:C.text2, fontSize:13, marginBottom:12 }}>Add next month's Google Sheet to start April 2026 analysis.</div>
                <button onClick={()=>setShowUrlInput(true)} style={{ padding:'8px 20px', borderRadius:8, border:'none', background:C.green, color:'#000', fontWeight:700, fontSize:13, cursor:'pointer' }}>🔗 Add April 2026</button>
              </div>
            )}
          </div>
        )}

        {/* ── CAMPAIGNS ── */}
        {activeTab==='campaigns' && (
          <div>
            <div style={{ color:C.text2, fontSize:13, marginBottom:12 }}>All campaigns ranked by performance — {d.dateRange}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {d.campaigns.map((c,i)=>{
                const sc = c.status==='SCALE'?C.green:c.status==='GROW'?C.blue:c.status==='REDUCE'?C.amber:C.red
                return (
                  <div key={i} style={{ background:C.surface, border:`1px solid ${sc}30`, borderRadius:12, padding:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:9, flexWrap:'wrap', gap:7 }}>
                      <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{c.name}</div>
                      <StatusBadge s={c.status}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:6, marginBottom:9 }}>
                      {[{k:'Spend',v:c.spend,col:C.text2},{k:'Revenue',v:c.revenue,col:C.green},{k:'ROAS',v:c.roas,col:C.blue},{k:'CPA',v:c.cpa,col:C.amber},{k:'Conv.',v:c.conversions,col:C.teal},{k:'Clicks',v:c.clicks,col:C.text2}].map(m=>(
                        <div key={m.k} style={{ background:C.surface2, borderRadius:6, padding:'5px 7px' }}>
                          <div style={{ fontSize:9, color:C.text3 }}>{m.k}</div>
                          <div style={{ fontWeight:700, color:m.col, fontSize:11 }}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:`${sc}10`, borderRadius:7, padding:'6px 10px', fontSize:12, color:sc }}>→ {c.action}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── DEVICES ── */}
        {activeTab==='devices' && (
          <div>
            {view==='yearly' && (
              <div style={{ background:`${C.blue}08`, border:`1px solid ${C.blue}20`, borderRadius:10, padding:12, marginBottom:14, fontSize:13, color:C.blue }}>
                💡 Surprising finding: Desktop (2.71x ROAS) and Tablet (3.08x ROAS) both outperform Mobile (1.72x ROAS) over 2 years — the problem is bad keywords, not the device mix.
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {d.devices.map((dv,i)=>(
                <div key={i} style={{ background:C.surface, border:`1px solid ${C.teal}30`, borderRadius:14, padding:18, textAlign:'center' }}>
                  <div style={{ fontSize:36, marginBottom:7 }}>{dv.device==='Mobile'?'📱':dv.device==='Desktop'?'🖥️':'📟'}</div>
                  <div style={{ fontWeight:800, color:C.text, fontSize:16, marginBottom:10 }}>{dv.device}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                    {[{k:'Spend',v:dv.spend},{k:'Revenue',v:dv.revenue},{k:'ROAS',v:dv.roas},{k:'CPA',v:dv.cpa},{k:'Conversions',v:dv.conversions},{k:'Clicks',v:dv.clicks}].map(m=>(
                      <div key={m.k} style={{ background:C.surface2, borderRadius:5, padding:'5px 7px' }}>
                        <div style={{ fontSize:9, color:C.text3 }}>{m.k}</div>
                        <div style={{ fontWeight:700, color:m.k==='ROAS'?C.green:m.k==='CPA'?C.amber:C.text, fontSize:11 }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:`${C.teal}15`, borderRadius:7, padding:'6px 9px', fontSize:11, color:C.teal, fontWeight:600 }}>{dv.recommendation}</div>
                  {dv.insight && <div style={{ marginTop:7, fontSize:11, color:C.text3, lineHeight:1.5 }}>{dv.insight}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEARCH TERMS ── */}
        {activeTab==='keywords' && (
          <div>
            <div style={{ background:`${C.red}08`, border:`1px solid ${C.red}20`, borderRadius:10, padding:11, marginBottom:14, fontSize:13, color:C.red }}>
              💸 <strong>{d.wastedSpend} wasted</strong> ({d.wastedPct} of budget) — zero conversions on these terms
            </div>
            <Card title="✅ Top converting terms — scale these" icon="🏆" color={C.green}>
              <div style={{ background:C.surface2, borderRadius:10, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr 1fr', padding:'6px 12px', borderBottom:`1px solid ${C.border}` }}>
                  {['Term','Clicks','Cost','Conv.','CPA'].map(h=><span key={h} style={{ fontSize:10, fontWeight:700, color:C.text3, textTransform:'uppercase' }}>{h}</span>)}
                </div>
                {d.topConvertingTerms.map((t,i)=>(
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr 1fr', padding:'7px 12px', borderBottom:i<d.topConvertingTerms.length-1?`1px solid ${C.border}`:'none', alignItems:'center' }}>
                    <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{t.term}</span>
                    <span style={{ fontSize:11, color:C.text2 }}>{t.clicks}</span>
                    <span style={{ fontSize:11, color:C.text2 }}>{t.cost}</span>
                    <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>{t.conversions}</span>
                    <span style={{ fontSize:12, color:C.amber }}>{t.cpa}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="💸 Wasted terms — add as negative keywords" icon="🚫" color={C.red}>
              <div style={{ background:C.surface2, borderRadius:10, overflow:'hidden', marginBottom:11 }}>
                <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr 3fr', padding:'6px 12px', borderBottom:`1px solid ${C.border}` }}>
                  {['Term','Cost','Why Irrelevant'].map(h=><span key={h} style={{ fontSize:10, fontWeight:700, color:C.text3, textTransform:'uppercase' }}>{h}</span>)}
                </div>
                {d.topWastedTerms.map((t,i)=>(
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 3fr', padding:'7px 12px', borderBottom:i<d.topWastedTerms.length-1?`1px solid ${C.border}`:'none', alignItems:'center' }}>
                    <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{t.term}</span>
                    <span style={{ fontSize:12, color:C.red, fontWeight:600 }}>{t.cost}</span>
                    <span style={{ fontSize:11, color:C.text3 }}>{t.reason}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>{navigator.clipboard.writeText(d.negativeKeywords.join('\n'));setCopied('wasted');setTimeout(()=>setCopied(null),2000)}}
                style={{ padding:'6px 14px', borderRadius:6, border:'none', background:copied==='wasted'?C.green:C.red, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                {copied==='wasted'?'✓ Copied!':'📋 Copy all as negative keywords'}
              </button>
            </Card>
          </div>
        )}

        {/* ── NEGATIVE KEYWORDS ── */}
        {activeTab==='negatives' && (
          <div>
            <div style={{ color:C.text2, fontSize:13, marginBottom:12 }}>
              Add ALL to Google Ads → Tools & Settings → Shared Library → Negative keyword lists → Apply to ALL campaigns
            </div>
            <Card title={`All negative keywords — ${d.negativeKeywords.length} terms`} icon="🚫" color={C.red}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
                {d.negativeKeywords.map((kw,i)=>(
                  <span key={i} style={{ background:C.surface2, color:C.text2, padding:'3px 8px', borderRadius:5, fontSize:12 }}>{kw}</span>
                ))}
              </div>
              <button onClick={()=>{navigator.clipboard.writeText(d.negativeKeywords.join('\n'));setCopied('all');setTimeout(()=>setCopied(null),2000)}}
                style={{ padding:'7px 16px', borderRadius:7, border:'none', background:copied==='all'?C.green:C.red, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                {copied==='all'?'✓ Copied!':'📋 Copy all negative keywords'}
              </button>
            </Card>
            {view==='yearly' && (
              <Card title="🚨 Energy drinks — £1,284 wasted over 2 years" icon="⚡" color={C.amber}>
                <div style={{ fontSize:13, color:C.text2, lineHeight:1.6, marginBottom:10 }}>
                  Monster Energy, Red Bull, Sour Patch Kids and 1,985 other energy drink/snack terms triggered your ads over 2 years. This is the single biggest waste in your account. Add these as negatives immediately:
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                  {['red bull','monster energy','monster drink','sour patch kids','purple monster','pink monster','peach monster','white monster','pipeline punch monster','monster nitro','redbull','energy drink','monster punch','pacific punch monster'].map((kw,i)=>(
                    <span key={i} style={{ background:`${C.amber}20`, color:C.amber, padding:'3px 8px', borderRadius:5, fontSize:12 }}>{kw}</span>
                  ))}
                </div>
                <button onClick={()=>{navigator.clipboard.writeText(['red bull','monster energy','monster drink','sour patch kids','purple monster','pink monster','peach monster','white monster','pipeline punch monster','monster nitro','redbull','energy drink'].join('\n'));setCopied('energy');setTimeout(()=>setCopied(null),2000)}}
                  style={{ padding:'6px 14px', borderRadius:6, border:'none', background:copied==='energy'?C.green:C.amber, color:'#000', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                  {copied==='energy'?'✓ Copied!':'📋 Copy energy drink negatives'}
                </button>
              </Card>
            )}
          </div>
        )}

        {/* ── KEY INSIGHTS (yearly only) ── */}
        {activeTab==='insights' && view==='yearly' && (
          <div>
            {[
              { title:'🚀 Hidden Gold — Human Hair - Brands', color:C.green, content:'This campaign has 11.29x ROAS — the best in your entire account by far. But you\'ve only spent £65 on it in 2 years. If it had even £1,000/month budget at this ROAS, it would generate £11,290 revenue per month. This is your biggest opportunity. Increase budget 5x immediately and monitor closely.' },
              { title:'⚡ Tablet is your secret weapon', color:C.teal, content:'Tablets have 3.08x ROAS — the best of any device — and the cheapest CPA at £6.51. Yet you\'ve only spent £349 on tablets in 2 years. Increase tablet bid modifier to +15% across all campaigns.' },
              { title:'🖥️ Desktop is better than you think', color:C.blue, content:'Desktop has 2.71x ROAS vs Mobile\'s 1.72x. The common assumption is mobile is best — but your data shows desktop converts better. Do NOT cut desktop bids. The problem is keywords, not device.' },
              { title:'💸 The energy drink problem', color:C.amber, content:'£1,284 spent on Monster Energy, Red Bull, Sour Patch Kids and 1,985 other energy drink/snack searches over 2 years. These terms somehow triggered your hair and beauty ads. Add them all as negatives immediately. This alone would have saved over £1,200.' },
              { title:'💡 Your cheapest converters need 100x more budget', color:C.purple, content:'"Naturally straight beautiful textures" converts at £0.04 CPA with 7 conversions. "Xpression springy bohemian twist" at £0.07 CPA. "American crew superglue" at £0.23 CPA. These keywords have almost no spend but convert brilliantly. Add them as exact match keywords and increase bids to £0.30-0.50.' },
              { title:'🎯 The real fix — not more budget, better keywords', color:C.red, content:'You spent £34,697 over 2 years but £32,160 (93%) was wasted on irrelevant searches. If you had fixed your keywords in year 1, you could have saved £16,000 and doubled your ROAS. The answer is not increasing budget — it\'s adding negative keywords and switching to exact match first.' },
            ].map((s,i)=>(
              <div key={i} style={{ background:C.surface, border:`1px solid ${s.color}30`, borderRadius:12, padding:16, marginBottom:12 }}>
                <div style={{ fontWeight:800, color:s.color, fontSize:14, marginBottom:8 }}>{s.title}</div>
                <div style={{ fontSize:13, color:C.text2, lineHeight:1.7 }}>{s.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
