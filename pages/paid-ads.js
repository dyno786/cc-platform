import Head from 'next/head'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

const C = {
  bg:'#0f1117',surface:'#1a1d27',surface2:'#22263a',border:'#2e3347',
  text:'#e8eaf0',text2:'#8b90a7',text3:'#555b75',
  green:'#22c55e',amber:'#f59e0b',red:'#ef4444',
  blue:'#3b82f6',accent:'#6366f1',accent2:'#818cf8',teal:'#14b8a6',purple:'#a855f7',
}

// ─── FULL DEEP DATA — 2 Years (Apr 2024 – Apr 2026) ─────────────────────────

const CAMPAIGN_DEVICE = [
  { campaign:'All By Brands',          device:'Mobile',  spend:839.50,  conv:146.46, rev:2552.35, clicks:15301, roas:3.04, cpa:5.73 },
  { campaign:'All By Brands',          device:'Desktop', spend:59.16,   conv:10.00,  rev:214.87,  clicks:868,   roas:3.63, cpa:5.92 },
  { campaign:'All By Brands',          device:'Tablet',  spend:8.06,    conv:3.00,   rev:112.71,  clicks:138,   roas:13.98,cpa:2.69 },
  { campaign:'Human Hair - Brands',    device:'Mobile',  spend:62.53,   conv:8.37,   rev:745.27,  clicks:687,   roas:11.92,cpa:7.47 },
  { campaign:'Human Hair - Brands',    device:'Desktop', spend:3.15,    conv:0,      rev:0,       clicks:34,    roas:0,    cpa:null },
  { campaign:'Shopify All Products',   device:'Mobile',  spend:27521.71,conv:2497.57,rev:46041.34,clicks:213030,roas:1.67, cpa:11.02 },
  { campaign:'Shopify All Products',   device:'Desktop', spend:1772.86, conv:202.12, rev:4626.79, clicks:13145, roas:2.61, cpa:8.77 },
  { campaign:'Shopify All Products',   device:'Tablet',  spend:306.65,  conv:44.60,  rev:786.76,  clicks:2739,  roas:2.57, cpa:6.88 },
  { campaign:'Shopify All Products #3',device:'Mobile',  spend:2035.86, conv:188.62, rev:3351.78, clicks:15364, roas:1.65, cpa:10.79 },
  { campaign:'Shopify All Products #3',device:'Desktop', spend:126.69,  conv:28.63,  rev:503.16,  clicks:932,   roas:3.97, cpa:4.43 },
  { campaign:'Shopify All Products #3',device:'Tablet',  spend:27.92,   conv:4.00,   rev:126.32,  clicks:245,   roas:4.52, cpa:6.98 },
  { campaign:'Synthetic Hair Bids',    device:'Mobile',  spend:273.57,  conv:19.97,  rev:474.41,  clicks:3146,  roas:1.73, cpa:13.70 },
  { campaign:'Synthetic Hair Bids',    device:'Tablet',  spend:5.05,    conv:2.00,   rev:50.54,   clicks:65,    roas:10.01,cpa:2.52 },
  { campaign:'Synthetic Wigs 2026',    device:'Mobile',  spend:80.02,   conv:4.00,   rev:38.46,   clicks:554,   roas:0.48, cpa:20.00 },
]

const TERM_CATEGORIES = [
  { name:'Converting Hair Products',  spend:2003.67, conv:402,  rev:7945.89, roas:3.97, terms:6220, color:C.green,
    insight:'Your ONLY profitable category — 3.97x ROAS. Every penny here makes money. Scale this.',
    topTerms:[
      {t:'bsset curl cream',         cost:29.64,  conv:24.17,cpa:1.23,  roas:11.0},
      {t:'edge booster',             cost:22.17,  conv:9.48, cpa:2.34,  roas:16.7},
      {t:'caro light soap',          cost:3.36,   conv:11.00,cpa:0.31,  roas:40.5},
      {t:'american crew superglue',  cost:2.06,   conv:9.00, cpa:0.23,  roas:82.8},
      {t:'dark and lovely cholesterol',cost:2.30, conv:8.00, cpa:0.29,  roas:52.0},
      {t:'bsset defining curl cream',cost:14.84,  conv:6.00, cpa:2.47,  roas:9.2},
      {t:'designer touch relaxer',   cost:4.50,   conv:5.90, cpa:0.76,  roas:47.3},
      {t:'style factor edge booster',cost:6.29,   conv:6.00, cpa:1.05,  roas:12.0},
    ]},
  { name:'Supermarket Hair Brands',   spend:2182.69,conv:110, rev:1760.15,roas:0.81, terms:6137, color:C.red,
    insight:'0.81x ROAS — spending £2,182 to earn £1,760. Losing money. These users want Boots/Superdrug brands.',
    topTerms:[
      {t:'elvive conditioner',  cost:35.57,conv:0,  cpa:null,roas:0},
      {t:'dove body wash',      cost:19.43,conv:0,  cpa:null,roas:0},
      {t:'head and shoulders',  cost:17.99,conv:0,  cpa:null,roas:0},
      {t:'garnier olia',        cost:20.39,conv:1,  cpa:20.39,roas:0.7},
      {t:'garnier',             cost:17.37,conv:0,  cpa:null,roas:0},
    ]},
  { name:'Energy Drinks & Snacks',    spend:1285.42,conv:41,  rev:328.55, roas:0.26, terms:1993, color:C.red,
    insight:'0.26x ROAS — spent £1,285 earning £328 on Monster Energy, Red Bull and Sour Patch Kids. Completely irrelevant.',
    topTerms:[
      {t:'red bull',            cost:29.95,conv:0,  cpa:null,roas:0},
      {t:'sour patch kids',     cost:23.96,conv:0,  cpa:null,roas:0},
      {t:'monster energy',      cost:23.22,conv:0,  cpa:null,roas:0},
      {t:'purple monster',      cost:23.02,conv:0,  cpa:null,roas:0},
      {t:'pacific punch monster',cost:21.34,conv:0,cpa:null,roas:0},
    ]},
  { name:'Wrong Category (Makeup/Deodorant/Nails)', spend:1335.50,conv:145,rev:1817.73,roas:1.36,terms:4183, color:C.amber,
    insight:'1.36x ROAS — marginally profitable but mostly irrelevant searches. Makeup removers, deodorants, nail products.',
    topTerms:[
      {t:'makeup remover',       cost:29.36,conv:0,  cpa:null,roas:0},
      {t:'loreal mens deodorant',cost:22.00,conv:2,  cpa:11.0,roas:1.6},
      {t:'makeup removers',      cost:17.19,conv:0,  cpa:null,roas:0},
      {t:'dove deodorant',       cost:12.60,conv:0,  cpa:null,roas:0},
    ]},
  { name:'Pharmacy & Medical',        spend:611.92, conv:34,  rev:370.10, roas:0.60, terms:1629, color:C.red,
    insight:'0.60x ROAS — medical/pharmacy searches. Nair hair removal, rose water, baby products, mouthwash.',
    topTerms:[
      {t:'nair',         cost:20.30,conv:0,cpa:null,roas:0},
      {t:'rose water',   cost:19.05,conv:0,cpa:null,roas:0},
      {t:'baby oil',     cost:18.24,conv:0,cpa:null,roas:0},
      {t:'baby powder',  cost:17.70,conv:0,cpa:null,roas:0},
      {t:'mouthwash',    cost:17.48,conv:0,cpa:null,roas:0},
    ]},
  { name:'Hair Colour Tutorials',     spend:491.83, conv:5,   rev:84.70,  roas:0.17, terms:1837, color:C.red,
    insight:'0.17x ROAS — people googling hair colour tutorials, not shopping. Ash blonde, purple shampoo, ombre.',
    topTerms:[
      {t:'ash blonde',       cost:37.52,conv:0,cpa:null,roas:0},
      {t:'purple shampoo',   cost:19.34,conv:0,cpa:null,roas:0},
      {t:'dark ash blonde',  cost:19.18,conv:0,cpa:null,roas:0},
      {t:'light ash blonde', cost:14.27,conv:1,cpa:14.27,roas:0.6},
    ]},
]

const ALL_CONVERTING_TERMS = [
  {t:'bsset curl cream',                      clicks:312, cost:29.64, conv:24.17,rev:326.54, cpa:1.23,  roas:11.0},
  {t:'caro light soap',                       clicks:26,  cost:3.36,  conv:11.00,rev:136.09, cpa:0.31,  roas:40.5},
  {t:'edge booster',                          clicks:176, cost:22.17, conv:9.48, rev:371.27, cpa:2.34,  roas:16.7},
  {t:'american crew superglue',               clicks:18,  cost:2.06,  conv:9.00, rev:170.59, cpa:0.23,  roas:82.8},
  {t:'caro white soap',                       clicks:36,  cost:4.07,  conv:9.00, rev:103.95, cpa:0.45,  roas:25.5},
  {t:'dark and lovely cholesterol',           clicks:18,  cost:2.30,  conv:8.00, rev:119.57, cpa:0.29,  roas:52.0},
  {t:'kojic acid cream',                      clicks:29,  cost:4.57,  conv:8.00, rev:147.57, cpa:0.57,  roas:32.3},
  {t:'aztec clay mask',                       clicks:59,  cost:7.68,  conv:8.00, rev:97.24,  cpa:0.96,  roas:12.7},
  {t:'naturally straight beautiful textures', clicks:4,   cost:0.25,  conv:7.00, rev:183.90, cpa:0.04,  roas:735.6},
  {t:'white express lotion',                  clicks:66,  cost:5.16,  conv:7.25, rev:141.74, cpa:0.71,  roas:27.5},
  {t:'edge booster gel',                      clicks:96,  cost:12.44, conv:6.17, rev:135.79, cpa:2.02,  roas:10.9},
  {t:'bsset defining curl cream',             clicks:153, cost:14.84, conv:6.00, rev:137.25, cpa:2.47,  roas:9.2},
  {t:'xpression springy bohemian twist',      clicks:4,   cost:0.43,  conv:6.00, rev:118.68, cpa:0.07,  roas:276.0},
  {t:'curling cream',                         clicks:90,  cost:12.12, conv:6.00, rev:60.17,  cpa:2.02,  roas:5.0},
  {t:'bsset texture powder',                  clicks:16,  cost:1.73,  conv:6.00, rev:56.73,  cpa:0.29,  roas:32.8},
  {t:'filthy muk styling paste',              clicks:8,   cost:1.10,  conv:6.00, rev:108.67, cpa:0.18,  roas:98.8},
  {t:'dr miracles leave in conditioner',      clicks:7,   cost:0.84,  conv:6.00, rev:113.16, cpa:0.14,  roas:134.7},
  {t:'la colors lip liner cappuccino',        clicks:23,  cost:2.17,  conv:6.00, rev:33.85,  cpa:0.36,  roas:15.6},
  {t:'style factor edge booster',             clicks:51,  cost:6.29,  conv:6.00, rev:75.71,  cpa:1.05,  roas:12.0},
  {t:'designer touch relaxer',               clicks:51,  cost:4.50,  conv:5.90, rev:212.88, cpa:0.76,  roas:47.3},
  {t:'macadamia healing oil treatment',       clicks:13,  cost:1.81,  conv:5.61, rev:209.29, cpa:0.32,  roas:115.6},
  {t:'wella t28',                             clicks:7,   cost:0.90,  conv:5.50, rev:114.64, cpa:0.16,  roas:127.4},
  {t:'blue magic pressing oil',               clicks:23,  cost:2.48,  conv:5.00, rev:120.42, cpa:0.50,  roas:48.6},
  {t:'matrix matte definer',                  clicks:2,   cost:0.13,  conv:5.00, rev:130.10, cpa:0.03,  roas:1000.8},
  {t:'papaya brightening serum',              clicks:2,   cost:0.30,  conv:5.00, rev:75.36,  cpa:0.06,  roas:251.2},
  {t:'motions texturizer',                    clicks:8,   cost:0.57,  conv:5.00, rev:84.91,  cpa:0.11,  roas:149.0},
  {t:'la colors pink frost lipstick',         clicks:2,   cost:0.14,  conv:5.00, rev:43.41,  cpa:0.03,  roas:310.1},
  {t:'cantu mango butter',                    clicks:8,   cost:0.83,  conv:5.00, rev:36.94,  cpa:0.17,  roas:44.5},
  {t:'schwarzkopf keratin heat protect spray',clicks:5,   cost:0.64,  conv:5.00, rev:43.94,  cpa:0.13,  roas:68.7},
  {t:'puffy hold me down baby gelle',         clicks:6,   cost:0.66,  conv:5.00, rev:40.93,  cpa:0.13,  roas:62.0},
]

const TOP_WASTED = [
  {t:'ash blonde',                cost:37.52,clicks:261},
  {t:'elvive conditioner',        cost:35.57,clicks:263},
  {t:'red bull',                  cost:29.95,clicks:284},
  {t:'makeup remover',            cost:29.36,clicks:295},
  {t:'nk lip gloss',              cost:26.37,clicks:215},
  {t:'sour patch kids',           cost:23.96,clicks:207},
  {t:'monster energy',            cost:23.22,clicks:175},
  {t:'purple monster',            cost:23.02,clicks:214},
  {t:'pacific punch monster',     cost:21.34,clicks:228},
  {t:'peach monster',             cost:21.31,clicks:186},
  {t:'shampoo',                   cost:21.23,clicks:144},
  {t:'nair',                      cost:20.30,clicks:171},
  {t:'monster punch',             cost:20.24,clicks:183},
  {t:'kinky curly custard',       cost:19.53,clicks:200},
  {t:'dove body wash',            cost:19.43,clicks:135},
  {t:'loreal deodorant',          cost:19.35,clicks:152},
  {t:'purple shampoo',            cost:19.34,clicks:152},
  {t:'dark ash blonde',           cost:19.18,clicks:137},
  {t:'rose water',                cost:19.05,clicks:145},
  {t:'pipeline punch monster',    cost:18.77,clicks:211},
  {t:'baby oil',                  cost:18.24,clicks:164},
  {t:'head and shoulders',        cost:17.99,clicks:132},
  {t:'plantur 39 anti grey',      cost:17.71,clicks:114},
  {t:'baby powder',               cost:17.70,clicks:150},
  {t:'mouthwash',                 cost:17.48,clicks:123},
  {t:'garnier',                   cost:17.37,clicks:116},
  {t:'ultimate blends shampoo',   cost:17.29,clicks:120},
  {t:'makeup removers',           cost:17.19,clicks:180},
  {t:'butterfly locs',            cost:17.18,clicks:119},
  {t:'leave in conditioner',      cost:17.15,clicks:116},
  {t:'amla',                      cost:16.97,clicks:138},
  {t:'loreal casting creme gloss',cost:16.70,clicks:131},
  {t:'vatika oil',                cost:16.41,clicks:126},
  {t:'victoria secret',           cost:15.66,clicks:103},
  {t:'dinosaurs',                 cost:15.10,clicks:272},
  {t:'coconut shampoo',           cost:14.76,clicks:100},
  {t:'olive oil relaxer',         cost:14.45,clicks:125},
  {t:'soft braid',                cost:13.95,clicks:124},
  {t:'marley braids',             cost:13.95,clicks:101},
  {t:'olive oil ear drops',       cost:13.92,clicks:101},
  {t:'nivea',                     cost:13.83,clicks:97},
  {t:'root touch up',             cost:13.73,clicks:86},
  {t:'vatika',                    cost:13.62,clicks:97},
  {t:'dinosaur toys',             cost:13.58,clicks:123},
  {t:'aussie lemonade monster',   cost:13.53,clicks:194},
]

const NEG_KEYWORDS = [
  'red bull','monster energy','monster drink','sour patch kids','purple monster','pink monster','peach monster',
  'white monster','pipeline punch monster','monster nitro','redbull','energy drink','monster punch','pacific punch monster',
  'aussie lemonade monster','monster peach','ash blonde','dark ash blonde','purple shampoo','light ash blonde',
  'elvive','elvive conditioner','garnier','head and shoulders','dove body wash','pantene','tresemme','alberto balsam',
  'loreal deodorant','makeup remover','makeup removers','nair','rose water','baby oil','baby powder','mouthwash',
  'baby oil','kinky curly custard','nk lip gloss','victoria secret','dinosaurs','dinosaur toys',
  'shampoo','conditioner','loreal casting','plantur','ultimate blends',
]

function Tbl({ heads, rows, colors }) {
  return (
    <div style={{background:C.surface2,borderRadius:10,overflow:'hidden'}}>
      <div style={{display:'grid',gridTemplateColumns:heads.map(()=>'1fr').join(' '),padding:'7px 12px',borderBottom:`1px solid ${C.border}`}}>
        {heads.map(h=><span key={h} style={{fontSize:10,fontWeight:700,color:C.text3,textTransform:'uppercase'}}>{h}</span>)}
      </div>
      {rows.map((row,i)=>(
        <div key={i} style={{display:'grid',gridTemplateColumns:heads.map(()=>'1fr').join(' '),padding:'7px 12px',borderBottom:i<rows.length-1?`1px solid ${C.border}`:'none',alignItems:'center'}}>
          {row.map((cell,j)=>(
            <span key={j} style={{fontSize:11,color:colors?.[j]||C.text2,fontWeight:j===0?600:400,lineHeight:1.3}}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

function Card({title,icon,color,children}){
  return (
    <div style={{background:C.surface,border:`1px solid ${color}30`,borderRadius:14,overflow:'hidden',marginBottom:14}}>
      <div style={{padding:'10px 15px',background:`${color}10`,borderBottom:`1px solid ${color}20`,display:'flex',alignItems:'center',gap:7}}>
        <span>{icon}</span><span style={{fontWeight:700,color,fontSize:13}}>{title}</span>
      </div>
      <div style={{padding:14}}>{children}</div>
    </div>
  )
}

const TABS = [
  {id:'overview',   label:'Overview',           icon:'📊'},
  {id:'campaigns',  label:'Campaign × Device',  icon:'📢'},
  {id:'categories', label:'Spend by Category',  icon:'🗂️'},
  {id:'converters', label:'Top Converters',      icon:'🏆'},
  {id:'wasted',     label:'Wasted Spend',        icon:'💸'},
  {id:'negatives',  label:'Neg. Keywords',       icon:'🚫'},
  {id:'tasks',      label:'Tasks',               icon:'✅'},
]

const DEFAULT_TASKS = [
  {id:'t1',cat:'🚨 Critical — Do Today',   text:'Scale Human Hair - Brands to £500/month — 11.92x ROAS on mobile, only £62 mobile spend in 2 years',done:false},
  {id:'t2',cat:'🚨 Critical — Do Today',   text:'Add ALL energy drink negative keywords (Red Bull, Monster, Sour Patch Kids etc) — cost £1,285 over 2 years at 0.26x ROAS',done:false},
  {id:'t3',cat:'🚨 Critical — Do Today',   text:'Reduce Shopify All Products mobile budget 40% — £27,521 spend at only 1.67x ROAS on mobile',done:false},
  {id:'t4',cat:'📢 Campaigns',              text:'KILL March 2018 campaign — old test campaign, delete it',done:false},
  {id:'t5',cat:'📢 Campaigns',              text:'PAUSE Synthetic Wigs 2026 — 0.48x ROAS mobile, losing money',done:false},
  {id:'t6',cat:'📢 Campaigns',              text:'Scale Shopify All Products #3 Desktop — 3.97x ROAS, £126 spend over 2 years, massively underinvested',done:false},
  {id:'t7',cat:'📱 Bid Adjustments',        text:'Set ALL CAMPAIGNS Tablet bid +20% — Tablet 3x+ ROAS across the board, cheapest CPA',done:false},
  {id:'t8',cat:'📱 Bid Adjustments',        text:'Do NOT reduce desktop — Desktop 2.61x ROAS vs Mobile 1.67x on Shopify All Products',done:false},
  {id:'t9',cat:'🔍 Scale These Keywords',   text:'Add "naturally straight beautiful textures" exact match bid £0.30 — 7 conv at £0.04 CPA',done:false},
  {id:'t10',cat:'🔍 Scale These Keywords',  text:'Add "american crew superglue" exact match bid £0.30 — 9 conv at £0.23 CPA',done:false},
  {id:'t11',cat:'🔍 Scale These Keywords',  text:'Add "matrix matte definer" exact match — 5 conv at £0.03 CPA, 1000x ROAS',done:false},
  {id:'t12',cat:'🔍 Scale These Keywords',  text:'Add "xpression springy bohemian twist" exact match — 6 conv at £0.07 CPA',done:false},
  {id:'t13',cat:'🔍 Scale These Keywords',  text:'Add "dr miracles leave in conditioner" exact match — 6 conv at £0.14 CPA',done:false},
  {id:'t14',cat:'🚫 Add Negative Keywords', text:'Add all supermarket hair brand negatives — elvive, garnier, dove, head & shoulders, pantene',done:false},
  {id:'t15',cat:'🚫 Add Negative Keywords', text:'Add all pharmacy/medical negatives — nair, rose water, baby oil, baby powder, mouthwash',done:false},
]

export default function PaidAds() {
  const [tab, setTab] = useState('overview')
  const [tasks, setTasks] = useState(DEFAULT_TASKS)
  const [copied, setCopied] = useState(null)
  const [catSort, setCatSort] = useState('spend')
  const [convSort, setConvSort] = useState('conv')
  const [wastedSort, setWastedSort] = useState('cost')

  useEffect(() => {
    try { const s = localStorage.getItem('cc_paid_tasks_2yr'); if(s) setTasks(JSON.parse(s)) } catch(e){}
  }, [])

  function toggleTask(id) {
    const u = tasks.map(t=>t.id===id?{...t,done:!t.done}:t)
    setTasks(u); localStorage.setItem('cc_paid_tasks_2yr', JSON.stringify(u))
  }

  const done = tasks.filter(t=>t.done).length
  const pct = Math.round((done/tasks.length)*100)

  const totalSpend = 34697, totalRev = 61952, totalConv = 3291, wastedAmt = 32160
  const catTotalSpend = TERM_CATEGORIES.reduce((s,c)=>s+c.spend,0)

  return (
    <>
      <Head>
        <title>Paid Ads — Deep Analysis</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}button{font-family:inherit}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`}</style>
      </Head>
      <Nav/>

      <div style={{maxWidth:1300,margin:'0 auto',padding:20}}>

        {/* HEADER */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:10}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:3}}>📊 Paid Ads — Deep Analysis</h1>
            <div style={{color:C.text3,fontSize:12}}>3 Apr 2024 – 3 Apr 2026 · 2 full years of real Google Ads data</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div>
              <div style={{fontSize:11,color:C.text3,marginBottom:4,textAlign:'right'}}>{done}/{tasks.length} tasks done</div>
              <div style={{width:140,height:6,background:C.surface2,borderRadius:99,overflow:'hidden'}}>
                <div style={{width:`${pct}%`,height:'100%',background:pct===100?C.green:pct>50?C.blue:C.amber,borderRadius:99}}/>
              </div>
            </div>
            <span style={{background:pct===100?`${C.green}20`:`${C.accent}20`,color:pct===100?C.green:C.accent2,padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700}}>{pct}%</span>
          </div>
        </div>

        {/* TOP KPI STRIP */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:9,marginBottom:16}}>
          {[
            {l:'2yr Spend',   v:`£${totalSpend.toLocaleString()}`, c:C.red},
            {l:'2yr Revenue', v:`£${totalRev.toLocaleString()}`,   c:C.green},
            {l:'Overall ROAS',v:'1.79x',                           c:C.blue},
            {l:'Total Conv.', v:totalConv.toLocaleString(),        c:C.teal},
            {l:'Wasted',      v:`£${wastedAmt.toLocaleString()}`,  c:C.red},
            {l:'Waste %',     v:'93%',                             c:C.red},
          ].map((s,i)=>(
            <div key={i} style={{background:C.surface2,borderRadius:9,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:10,color:C.text3,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{display:'flex',gap:1,marginBottom:14,borderBottom:`1px solid ${C.border}`,overflowX:'auto'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'8px 13px',border:'none',background:'none',whiteSpace:'nowrap',
              borderBottom:tab===t.id?`2px solid ${C.accent}`:'2px solid transparent',
              color:tab===t.id?C.accent2:C.text3,fontWeight:tab===t.id?700:400,
              fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:4,marginBottom:-1,
            }}>
              {t.icon} {t.id==='tasks'?`Tasks (${done}/${tasks.length})`:t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab==='overview' && (
          <div>
            <div style={{background:`${C.red}08`,border:`1px solid ${C.red}20`,borderRadius:11,padding:14,marginBottom:14,fontSize:13,color:C.red,lineHeight:1.7}}>
              🚨 <strong>93% of your Google Ads budget is wasted.</strong> Over 2 years you spent £34,697 but £32,160 went on searches with zero conversions — energy drinks, supermarket brands, tutorials, medical products. Your actual profitable keywords (bsset curl cream, edge booster, caro soap) only received £2,003 of spend yet generated £7,945 revenue at 3.97x ROAS. The fix is not more budget — it's moving your existing budget from bad keywords to good ones.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
              <Card title="The core problem visualised" icon="📉" color={C.red}>
                {[
                  {cat:'Converting Hair Products', spend:2003,  rev:7945,  roas:3.97, pct:6,   c:C.green},
                  {cat:'Supermarket Hair Brands',  spend:2182,  rev:1760,  roas:0.81, pct:6,   c:C.red},
                  {cat:'Energy Drinks & Snacks',   spend:1285,  rev:328,   roas:0.26, pct:4,   c:C.red},
                  {cat:'Wrong Category',           spend:1335,  rev:1817,  roas:1.36, pct:4,   c:C.amber},
                  {cat:'Pharmacy & Medical',       spend:611,   rev:370,   roas:0.60, pct:2,   c:C.red},
                  {cat:'Hair Colour Tutorials',    spend:491,   rev:84,    roas:0.17, pct:1,   c:C.red},
                ].map((row,i)=>(
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:12,color:C.text,fontWeight:500}}>{row.cat}</span>
                      <div style={{display:'flex',gap:8}}>
                        <span style={{fontSize:11,color:C.text3}}>£{row.spend.toLocaleString()}</span>
                        <span style={{fontSize:11,color:row.roas>=3?C.green:row.roas>=1?C.amber:C.red,fontWeight:600}}>{row.roas}x</span>
                      </div>
                    </div>
                    <div style={{height:6,background:C.surface2,borderRadius:99,overflow:'hidden'}}>
                      <div style={{width:`${Math.min(row.spend/340,100)}%`,height:'100%',background:row.c,borderRadius:99}}/>
                    </div>
                  </div>
                ))}
              </Card>
              <Card title="Campaign × Device — where money is actually made" icon="🎯" color={C.green}>
                {[
                  {camp:'All By Brands',          device:'Tablet',  roas:13.98,cpa:2.69, spend:8,    verdict:'🔥 Hidden gem'},
                  {camp:'Human Hair - Brands',     device:'Mobile',  roas:11.92,cpa:7.47, spend:62,   verdict:'🔥 Scale 5x'},
                  {camp:'All By Brands',           device:'Desktop', roas:3.63, cpa:5.92, spend:59,   verdict:'✅ Good'},
                  {camp:'All By Brands',           device:'Mobile',  roas:3.04, cpa:5.73, spend:839,  verdict:'✅ Scale'},
                  {camp:'Shopify #3',              device:'Tablet',  roas:4.52, cpa:6.98, spend:27,   verdict:'✅ Scale'},
                  {camp:'Shopify #3',              device:'Desktop', roas:3.97, cpa:4.43, spend:126,  verdict:'✅ Increase'},
                  {camp:'Shopify All Products',    device:'Desktop', roas:2.61, cpa:8.77, spend:1772, verdict:'⚠️ OK'},
                  {camp:'Shopify All Products',    device:'Mobile',  roas:1.67, cpa:11.02,spend:27521,verdict:'❌ Reduce 40%'},
                  {camp:'Synthetic Wigs 2026',     device:'Mobile',  roas:0.48, cpa:20.00,spend:80,   verdict:'❌ Pause'},
                ].map((r,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,paddingBottom:6,borderBottom:i<8?`1px solid ${C.border}`:'none'}}>
                    <div>
                      <div style={{fontSize:12,color:C.text,fontWeight:500}}>{r.camp} / {r.device}</div>
                      <div style={{fontSize:10,color:C.text3}}>£{r.spend.toLocaleString()} spend</div>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontSize:12,color:r.roas>=3?C.green:r.roas>=2?C.blue:r.roas>=1?C.amber:C.red,fontWeight:700}}>{r.roas}x</span>
                      <span style={{fontSize:11,color:C.text3}}>£{r.cpa} CPA</span>
                      <span style={{fontSize:10,color:r.verdict.includes('🔥')?C.green:r.verdict.includes('✅')?C.teal:r.verdict.includes('⚠️')?C.amber:C.red,fontWeight:600}}>{r.verdict}</span>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* ── CAMPAIGN × DEVICE ── */}
        {tab==='campaigns' && (
          <div>
            <div style={{color:C.text2,fontSize:13,marginBottom:12,lineHeight:1.6}}>
              Every campaign broken down by device with spend, ROAS and CPA. The data reveals that Desktop and Tablet consistently outperform Mobile — the problem is bad keywords, not device mix.
            </div>
            {['All By Brands','Human Hair - Brands','Shopify All Products','Shopify All Products #3','Synthetic Hair Bids','Synthetic Wigs 2026'].map(camp=>{
              const rows = CAMPAIGN_DEVICE.filter(r=>r.campaign===camp)
              const totalCampSpend = rows.reduce((s,r)=>s+r.spend,0)
              const totalCampConv = rows.reduce((s,r)=>s+r.conv,0)
              const totalCampRev = rows.reduce((s,r)=>s+r.rev,0)
              const totalCampROAS = totalCampRev/totalCampSpend
              const sc = totalCampROAS>=3?C.green:totalCampROAS>=2?C.blue:totalCampROAS>=1?C.amber:C.red
              return (
                <div key={camp} style={{background:C.surface,border:`1px solid ${sc}30`,borderRadius:12,padding:14,marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                    <div style={{fontWeight:700,color:C.text,fontSize:14}}>{camp}</div>
                    <div style={{display:'flex',gap:10}}>
                      {[
                        {l:'Total Spend',v:`£${totalCampSpend.toLocaleString(undefined,{maximumFractionDigits:0})}`,c:C.text2},
                        {l:'Total Revenue',v:`£${totalCampRev.toLocaleString(undefined,{maximumFractionDigits:0})}`,c:C.green},
                        {l:'ROAS',v:`${totalCampROAS.toFixed(2)}x`,c:sc},
                        {l:'Conv.',v:totalCampConv.toFixed(0),c:C.teal},
                      ].map(m=>(
                        <div key={m.l} style={{background:C.surface2,borderRadius:7,padding:'5px 10px',textAlign:'center'}}>
                          <div style={{fontSize:13,fontWeight:700,color:m.c}}>{m.v}</div>
                          <div style={{fontSize:9,color:C.text3}}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Tbl
                    heads={['Device','Spend','Revenue','ROAS','CPA','Conversions','Clicks']}
                    rows={rows.map(r=>[
                      r.device==='Mobile'?'📱 Mobile':r.device==='Desktop'?'🖥️ Desktop':'📟 Tablet',
                      `£${r.spend.toLocaleString(undefined,{maximumFractionDigits:0})}`,
                      `£${r.rev.toLocaleString(undefined,{maximumFractionDigits:0})}`,
                      r.roas>0?`${r.roas}x`:'—',
                      r.cpa?`£${r.cpa}`:'—',
                      r.conv>0?r.conv.toFixed(0):'0',
                      r.clicks.toLocaleString(),
                    ])}
                    colors={[C.text,C.text2,C.green,sc,C.amber,C.teal,C.text3]}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* ── SPEND BY CATEGORY ── */}
        {tab==='categories' && (
          <div>
            <div style={{color:C.text2,fontSize:13,marginBottom:14,lineHeight:1.6}}>
              Every search term categorised by type. This shows exactly where your money is going and what return each category generates. Converting Hair Products is your only profitable category at 3.97x ROAS.
            </div>
            {/* Category summary bars */}
            <div style={{background:C.surface,borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:12}}>Budget allocation vs ROAS by category</div>
              {TERM_CATEGORIES.sort((a,b)=>b.spend-a.spend).map((cat,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div>
                      <span style={{fontWeight:600,color:C.text,fontSize:13}}>{cat.name}</span>
                      <span style={{marginLeft:8,color:C.text3,fontSize:11}}>{cat.terms.toLocaleString()} terms</span>
                    </div>
                    <div style={{display:'flex',gap:12}}>
                      <span style={{fontSize:12,color:C.text2}}>£{cat.spend.toLocaleString(undefined,{maximumFractionDigits:0})} ({Math.round(cat.spend/catTotalSpend*100)}%)</span>
                      <span style={{fontSize:13,fontWeight:700,color:cat.roas>=3?C.green:cat.roas>=1?C.amber:C.red,minWidth:45,textAlign:'right'}}>{cat.roas}x ROAS</span>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                    <div>
                      <div style={{fontSize:9,color:C.text3,marginBottom:2}}>Spend</div>
                      <div style={{height:8,background:C.surface2,borderRadius:99,overflow:'hidden'}}>
                        <div style={{width:`${Math.min(cat.spend/catTotalSpend*100*3,100)}%`,height:'100%',background:C.red,borderRadius:99}}/>
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:C.text3,marginBottom:2}}>Revenue generated</div>
                      <div style={{height:8,background:C.surface2,borderRadius:99,overflow:'hidden'}}>
                        <div style={{width:`${Math.min(cat.rev/8000*100,100)}%`,height:'100%',background:cat.roas>=3?C.green:cat.roas>=1?C.amber:C.red,borderRadius:99}}/>
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:cat.color,marginTop:4}}>{cat.insight}</div>
                </div>
              ))}
            </div>
            {/* Category details */}
            {TERM_CATEGORIES.map((cat,i)=>(
              <Card key={i} title={`${cat.name} — £${cat.spend.toLocaleString(undefined,{maximumFractionDigits:0})} spend, ${cat.roas}x ROAS`} icon={cat.roas>=3?'🏆':cat.roas>=1?'⚠️':'❌'} color={cat.color}>
                <div style={{fontSize:12,color:cat.color,marginBottom:10,fontStyle:'italic'}}>{cat.insight}</div>
                <Tbl
                  heads={['Search Term','Cost','Conv.','CPA','ROAS']}
                  rows={cat.topTerms.map(t=>[
                    t.t,
                    `£${t.cost.toFixed(2)}`,
                    t.conv>0?t.conv.toFixed(0):'0',
                    t.cpa?`£${t.cpa.toFixed(2)}`:'—',
                    t.roas>0?`${t.roas.toFixed(1)}x`:'0x',
                  ])}
                  colors={[C.text,C.text2,cat.roas>=3?C.green:C.text3,C.amber,cat.roas>=3?C.green:C.red]}
                />
              </Card>
            ))}
          </div>
        )}

        {/* ── TOP CONVERTERS ── */}
        {tab==='converters' && (
          <div>
            <div style={{background:`${C.green}08`,border:`1px solid ${C.green}20`,borderRadius:10,padding:12,marginBottom:14,fontSize:13,color:C.green,lineHeight:1.6}}>
              💡 These are your golden keywords — cheap CPA, high ROAS. Most have almost no spend. Moving budget from bad categories to these terms is the single most impactful thing you can do. "Matrix matte definer" has 1000x ROAS with only 13p spend.
            </div>
            <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
              {['conv','cpa','roas','cost'].map(s=>(
                <button key={s} onClick={()=>setConvSort(s)} style={{padding:'5px 12px',borderRadius:7,border:`1px solid ${convSort===s?C.accent:C.border}`,background:convSort===s?`${C.accent}20`:C.surface2,color:convSort===s?C.accent2:C.text3,fontSize:11,fontWeight:600,cursor:'pointer'}}>
                  Sort by {s==='conv'?'Conversions':s==='cpa'?'CPA (lowest)':s==='roas'?'ROAS (highest)':'Cost'}
                </button>
              ))}
            </div>
            <Tbl
              heads={['Search Term','Clicks','Cost','Conv.','Revenue','CPA','ROAS']}
              rows={[...ALL_CONVERTING_TERMS]
                .sort((a,b)=>convSort==='conv'?b.conv-a.conv:convSort==='cpa'?a.cpa-b.cpa:convSort==='roas'?b.roas-a.roas:b.cost-a.cost)
                .map(t=>[
                  t.t,
                  t.clicks,
                  `£${t.cost.toFixed(2)}`,
                  t.conv.toFixed(0),
                  `£${t.rev.toFixed(2)}`,
                  `£${t.cpa.toFixed(2)}`,
                  `${t.roas.toFixed(0)}x`,
                ])}
              colors={[C.text,C.text3,C.text2,C.green,C.green,C.amber,C.green]}
            />
          </div>
        )}

        {/* ── WASTED SPEND ── */}
        {tab==='wasted' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
              {[
                {l:'Total Wasted',v:'£32,160',sub:'93% of all spend',c:C.red},
                {l:'Unique Wasted Terms',v:'113,782',sub:'zero conversions',c:C.red},
                {l:'Energy Drinks alone',v:'£1,285',sub:'1,993 terms at 0.26x ROAS',c:C.amber},
              ].map((s,i)=>(
                <div key={i} style={{background:C.surface,border:`1px solid ${s.c}30`,borderRadius:11,padding:14,textAlign:'center'}}>
                  <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:C.red,marginTop:1}}>{s.sub}</div>
                  <div style={{fontSize:11,color:C.text3,marginTop:3}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
              {['cost','clicks'].map(s=>(
                <button key={s} onClick={()=>setWastedSort(s)} style={{padding:'5px 12px',borderRadius:7,border:`1px solid ${wastedSort===s?C.red:C.border}`,background:wastedSort===s?`${C.red}15`:C.surface2,color:wastedSort===s?C.red:C.text3,fontSize:11,fontWeight:600,cursor:'pointer'}}>
                  Sort by {s==='cost'?'Most wasted £':'Most clicks'}
                </button>
              ))}
              <button onClick={()=>{navigator.clipboard.writeText(TOP_WASTED.map(t=>t.t).join('\n'));setCopied('wasted');setTimeout(()=>setCopied(null),2000)}}
                style={{padding:'5px 14px',borderRadius:7,border:'none',background:copied==='wasted'?C.green:C.red,color:'#fff',fontWeight:700,fontSize:11,cursor:'pointer'}}>
                {copied==='wasted'?'✓ Copied!':'📋 Copy all as negative keywords'}
              </button>
            </div>
            <Tbl
              heads={['Search Term','Cost Wasted','Clicks Wasted','0 Conversions']}
              rows={[...TOP_WASTED]
                .sort((a,b)=>wastedSort==='cost'?b.cost-a.cost:b.clicks-a.clicks)
                .map(t=>[t.t,`£${t.cost.toFixed(2)}`,t.clicks.toLocaleString(),'0'])}
              colors={[C.text,C.red,C.amber,C.text3]}
            />
          </div>
        )}

        {/* ── NEGATIVE KEYWORDS ── */}
        {tab==='negatives' && (
          <div>
            <div style={{color:C.text2,fontSize:13,marginBottom:12}}>
              Add ALL to Google Ads → Tools & Settings → Shared Library → Negative keyword lists → Apply to ALL campaigns
            </div>
            <Card title={`All negative keywords — ${NEG_KEYWORDS.length} terms`} icon="🚫" color={C.red}>
              <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}}>
                {NEG_KEYWORDS.map((kw,i)=>(
                  <span key={i} style={{background:C.surface2,color:C.text2,padding:'3px 8px',borderRadius:5,fontSize:12}}>{kw}</span>
                ))}
              </div>
              <button onClick={()=>{navigator.clipboard.writeText(NEG_KEYWORDS.join('\n'));setCopied('all');setTimeout(()=>setCopied(null),2000)}}
                style={{padding:'7px 16px',borderRadius:7,border:'none',background:copied==='all'?C.green:C.red,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                {copied==='all'?'✓ Copied!':'📋 Copy all negative keywords'}
              </button>
            </Card>
          </div>
        )}

        {/* ── TASKS ── */}
        {tab==='tasks' && (
          <div>
            <div style={{color:C.text2,fontSize:13,marginBottom:14}}>Each task is backed by the data above. Click to complete. Progress saves automatically.</div>
            {[...new Set(tasks.map(t=>t.cat))].map(cat=>{
              const ct = tasks.filter(t=>t.cat===cat)
              const cd = ct.filter(t=>t.done).length
              return (
                <div key={cat} style={{marginBottom:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                    <span style={{fontWeight:700,color:C.text,fontSize:13}}>{cat}</span>
                    <span style={{fontSize:11,color:cd===ct.length?C.green:C.text3}}>{cd}/{ct.length}</span>
                  </div>
                  {ct.map(t=>(
                    <div key={t.id} onClick={()=>toggleTask(t.id)}
                      style={{background:t.done?`${C.green}08`:C.surface,border:`1px solid ${t.done?C.green:C.border}`,borderRadius:9,padding:'10px 13px',cursor:'pointer',display:'flex',gap:11,marginBottom:5,alignItems:'flex-start'}}>
                      <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${t.done?C.green:C.border}`,background:t.done?C.green:'none',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                        {t.done&&<span style={{color:'#000',fontSize:11,fontWeight:800}}>✓</span>}
                      </div>
                      <span style={{fontSize:12,color:t.done?C.text3:C.text,textDecoration:t.done?'line-through':'none',lineHeight:1.5}}>{t.text}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
