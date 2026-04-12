import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const DAILY_ACTIONS = [
  { id:'sell',    icon:'💰', label:'What sold today?',                    freq:'daily'   },
  { id:'waste',   icon:'🚫', label:'Where am I losing money today?',       freq:'daily'   },
  { id:'ads',     icon:'⚡', label:'One Google Ads action today',          freq:'daily'   },
  { id:'chase',   icon:'🛒', label:'Abandoned carts to chase',             freq:'daily'   },
  { id:'brand',   icon:'🏷️', label:'Which brand to focus on this week?',   freq:'weekly'  },
  { id:'style',   icon:'💇', label:'Which hair style is trending?',        freq:'weekly'  },
  { id:'blog',    icon:'✍️', label:'Which blog to write this week?',       freq:'weekly'  },
  { id:'budget',  icon:'📊', label:'Budget moves to make this week?',      freq:'weekly'  },
  { id:'seo',     icon:'🔍', label:'Biggest SEO opportunity this month?',  freq:'monthly' },
  { id:'stock',   icon:'📦', label:'What to stock up on this month?',      freq:'monthly' },
  { id:'compete', icon:'🏆', label:'Are competitors gaining on us?',       freq:'monthly' },
  { id:'plan',    icon:'📅', label:'What event is coming — prepare now?',  freq:'monthly' },
]

function Tag({ freq }) {
  const cfg = {
    daily:   { bg:'#fff0f0', color:T.red,   label:'Daily'   },
    weekly:  { bg:'#f0f7ff', color:T.blue,  label:'Weekly'  },
    monthly: { bg:'#f5f0ff', color:'#7c3aed',label:'Monthly' },
  }[freq]
  return (
    <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:3,background:cfg.bg,color:cfg.color,textTransform:'uppercase',letterSpacing:'0.05em'}}>
      {cfg.label}
    </span>
  )
}

function Card({ icon, title, freq, data, section }) {
  const borderColor = freq==='daily'?T.red:freq==='weekly'?T.blue:'#7c3aed'
  return (
    <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderLeft:`4px solid ${borderColor}`,borderRadius:8,padding:'14px 16px',marginBottom:10}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
        <span style={{fontSize:20}}>{icon}</span>
        <div style={{flex:1,fontSize:13,fontWeight:800,color:T.text}}>{title}</div>
        <Tag freq={freq}/>
      </div>
      {data}
    </div>
  )
}

export default function DailyBrief() {
  const [scData, setScData]       = useState(null)
  const [shopify, setShopify]     = useState(null)
  const [adsData, setAdsData]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [generating, setGenerating] = useState(false)
  const [brief, setBrief]         = useState(null)
  const [briefDate, setBriefDate] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [copied, setCopied]       = useState(null)

  const today = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
  const dayOfWeek = new Date().getDay() // 0=Sun,1=Mon...

  useEffect(() => {
    async function load() {
      try {
        const [sc, sh] = await Promise.all([
          fetch('/api/live-data?source=searchconsole').then(r=>r.json()),
          fetch('/api/live-data?source=shopify').then(r=>r.json()),
        ])
        setScData(sc); setShopify(sh)
      } catch(e) {}
      try {
        const saved = localStorage.getItem('cc_daily_brief')
        const date  = localStorage.getItem('cc_daily_brief_date')
        const ads   = localStorage.getItem('cc_ads_analysis')
        if (saved) setBrief(JSON.parse(saved))
        if (date)  setBriefDate(new Date(date))
        if (ads)   setAdsData(JSON.parse(ads))
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

  function copy(text, id) {
    navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(()=>setCopied(null), 2000)
  }

  async function generate() {
    setGenerating(true)
    try {
      const kw   = scData?.keywords?.slice(0,60)  || []
      const wins = scData?.quickWins?.slice(0,12) || []
      const pgs  = scData?.pages?.filter(p=>p.impressions>1000&&p.ctr<2).slice(0,10) || []

      const hairStyles = kw.filter(k=>
        /braids?|locs?|twist|weave|wig|extension|relaxer|natural|curl|wave|crochet|french curl|box braid|knotless|faux loc|butterfly|passion twist|senegalese|cornrow|afro/i.test(k.query)
      ).sort((a,b)=>b.impressions-a.impressions).slice(0,8)

      const brands = kw.filter(k=>
        /cantu|ors|dark.?lovely|cherish|sensationnel|x.?pression|freetress|bsset|organique|ebin|got2b|schwarzkopf|loreal|l.?oreal|elvive|casting|wave.?nouveau|ultra.?sheen|elasta|difeel|creme.?of.?nature|sheamoisture|motions|optimum|affirm|pcj|syntonics|dressmaker|aftress|jazzy/i.test(k.query)
      ).sort((a,b)=>b.impressions-a.impressions).slice(0,8)

      const recentItems = shopify?.recentOrders?.map(o=>o.items).filter(Boolean) || []

      const upcomingEvents = [
        { name:'Eid al-Adha',     date:'Jun 2026',  weeks:8,  products:'Wigs, lace fronts, weaves, human hair' },
        { name:'Leeds Carnival',  date:'Aug 2026',  weeks:16, products:'Braiding hair, crochet, colour' },
        { name:'Back to School',  date:'Sep 2026',  weeks:20, products:'Children\'s hair care, protective styles' },
        { name:'Christmas / NYE', date:'Dec 2026',  weeks:35, products:'Wigs, gift sets, extensions' },
      ]

      const prompt = `You are a Google Ads and SEO consultant for CC Hair & Beauty Leeds UK.
Afro hair retailer since 1979. 3 branches. 23,000 products. cchairandbeauty.com.
Today: ${today} (day of week index: ${dayOfWeek}, 1=Monday)

Be SPECIFIC. Name real products and brands from the data. Give exact numbers.
For every action: say WHERE to go, WHAT to do, and WHAT RESULT to expect.
Never say "consider" — say "do this".

=== SHOPIFY LIVE DATA ===
Today revenue: ${shopify?.today?.formatted}, orders: ${shopify?.today?.orders}
This week revenue: ${shopify?.week?.formatted}, orders: ${shopify?.week?.orders}  
This month: ${shopify?.month?.formatted}
Abandoned carts: ${shopify?.abandonedCount} worth £${shopify?.abandonedValue}
Recent sold items: ${JSON.stringify(recentItems.slice(0,8))}

=== SEARCH CONSOLE (90 days) ===
Total clicks: ${scData?.totals?.clicks}, impressions: ${scData?.totals?.impressions}, avg position: ${scData?.totals?.avgPosition}
Top keywords: ${JSON.stringify(kw.slice(0,20))}
Hair style searches: ${JSON.stringify(hairStyles)}
Brand searches: ${JSON.stringify(brands)}
Quick wins (high impressions, low CTR): ${JSON.stringify(wins)}
Pages losing clicks (high impressions, low CTR): ${JSON.stringify(pgs)}

=== GOOGLE ADS ===
${adsData ? `Spend: ${adsData.totalSpend}, Waste: ${adsData.wastedSpend}
Campaigns: ${JSON.stringify(adsData.campaigns)}
Scale opportunity: ${adsData.scaleOpportunity}
Biggest waste: ${adsData.biggestWaste}
Top actions: ${JSON.stringify(adsData.topActions)}` : 'No Google Ads CSV uploaded yet. Give advice based on organic data and known campaign structure (Hair City Visitors search campaign, All By Brands Shopping, Shopify All Products Shopping).'}

=== UPCOMING EVENTS ===
${JSON.stringify(upcomingEvents)}

Return ONLY valid JSON. No markdown. No backticks.

{
  "todaySummary": "Plain English: what is happening today in the business. Revenue, orders, anything urgent. Max 3 sentences.",

  "daily_what_sold": {
    "products": ["specific product 1 from recent orders", "product 2", "product 3"],
    "insight": "what this tells you about demand right now",
    "action": "specific thing to do today based on what sold — promote it, stock it up, put it in an ad",
    "exactSteps": "exact steps to take right now"
  },

  "daily_waste": {
    "topWaste": [
      {
        "what": "specific page URL or keyword losing you money",
        "impressions": 0,
        "clicks": 0,
        "ctr": "X%",
        "whyBad": "plain English explanation of why this is a waste",
        "fix": "exact fix — go to Shopify → [page] → SEO → change title to [exact new title]",
        "timeToFix": "e.g. 5 minutes"
      }
    ],
    "urgentFix": "the single most important fix to do today with exact steps"
  },

  "daily_ads_action": {
    "action": "single most important Google Ads action today",
    "whyUrgent": "specific reason with figures — how much is being wasted or missed",
    "whereToGo": "exact Google Ads navigation path",
    "whatToDo": "exact values to add, change or pause — be specific",
    "doNotTouch": "what NOT to change today",
    "expectedImpact": "specific result with figures"
  },

  "daily_abandoned_carts": {
    "count": 0,
    "value": "£X",
    "action": "specific message to send — WhatsApp or email. Write the actual message text.",
    "message": "Hi [Name], I noticed you left something in your basket at CC Hair & Beauty — [product]. It is still available. Come in to Chapeltown, Roundhay or Leeds City Centre, or order at cchairandbeauty.com. Can we help?"
  },

  "weekly_brand_focus": {
    "brand": "brand name with most search interest this week",
    "data": {"impressions": 0, "clicks": 0, "position": 0, "ctr": "X%"},
    "seoFix": "exact SEO title to put on this brand's collection page right now — write the full title",
    "adsBid": "should you create or increase a Google Shopping campaign for this brand — yes/no and why, with exact budget",
    "blogIdea": "exact blog title targeting this brand",
    "whyThisWeek": "specific reason why this brand is the priority right now"
  },

  "weekly_hair_style": {
    "topStyle": "hair style getting most searches this week",
    "data": {"impressions": 0, "position": 0, "ctr": "X%"},
    "exactSeoTitle": "write the exact SEO title to put on the collection page for this style",
    "exactBlogTitle": "write the exact blog post title to target this style",
    "stockCheck": "what products you need in stock to serve this demand",
    "adOpportunity": "is there an ad campaign opportunity for this style — yes/no, what budget",
    "otherTrendingStyles": ["style 2 with impressions", "style 3 with impressions"]
  },

  "weekly_blog": {
    "title": "exact full blog post title — make it SEO-optimised and compelling",
    "why": "specific data showing why this topic — impressions, search gap, seasonal relevance",
    "keywords": ["main keyword", "keyword 2", "keyword 3", "keyword 4"],
    "outline": ["1. H2 section title — what to cover", "2. H2 section 2", "3. H2 section 3", "4. H2 section 4", "5. H2 section 5"],
    "internalLinks": ["which collection pages to link to"],
    "cta": "what call to action to put at the end of the blog",
    "expectedMonthlyTraffic": "realistic estimate if it reaches page 1"
  },

  "weekly_budget_moves": {
    "scale": [
      {"campaign": "exact campaign name", "from": "£X/day", "to": "£X/day", "why": "specific reason with data", "expectedROI": "what this will return"}
    ],
    "cut": [
      {"campaign": "exact campaign name", "from": "£X/day", "to": "£X/day", "why": "specific reason", "saving": "£X/week saved"}
    ],
    "create": "new campaign to build if obvious — name it, set the budget, explain why",
    "negativeKeywords": ["exact term to add as negative 1", "term 2", "term 3", "term 4", "term 5"]
  },

  "monthly_seo_opportunity": {
    "title": "name the biggest SEO opportunity this month",
    "detail": "specific data proving this opportunity — impressions, position, CTR gap",
    "exactFix": "step by step what to do",
    "expectedImpact": "realistic traffic and revenue impact within 60-90 days"
  },

  "monthly_stock_plan": {
    "stockNow": ["specific product or brand to stock up on with reason", "product 2", "product 3"],
    "upcomingEvent": "which event is coming and what it means for stock",
    "weeksToEvent": 0,
    "stockAction": "specific stock action — order X of Y from Z supplier before [date]"
  },

  "monthly_competitor_check": {
    "keywordsToCheck": ["specific keyword to check manually on Google", "keyword 2", "keyword 3"],
    "howToCheck": "go to Google.co.uk in incognito mode and search each keyword — see if Samba, Tiesha, Kashmire or Julie appear above you",
    "ifTheyAreAhead": "specific action to take if a competitor ranks above you for a keyword",
    "socialCheck": "which competitor social media to review this month and what to look for"
  },

  "monthly_event_prep": {
    "nextEvent": "name of next major event",
    "date": "month and year",
    "weeksAway": 0,
    "whatToDoNow": "specific prep actions to take this month",
    "stockToOrder": "specific products to have ready",
    "adsToCreate": "specific Google Ads campaign or ad to prepare",
    "contentToCreate": "specific blog post or social content to create now"
  }
}`

      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens: 8000,
          messages:[{role:'user',content:prompt}]
        })
      })
      const d = await r.json()
      const text = d.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g,'').trim()
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) {
        const result = JSON.parse(match[0])
        setBrief(result)
        setBriefDate(new Date())
        localStorage.setItem('cc_daily_brief', JSON.stringify(result))
        localStorage.setItem('cc_daily_brief_date', new Date().toISOString())
      }
    } catch(e) { console.error(e) }
    setGenerating(false)
  }

  const stale = briefDate && (new Date()-briefDate) > 8*60*60*1000

  const TABS = [
    { id:'all',     label:'All' },
    { id:'daily',   label:'🔴 Today' },
    { id:'weekly',  label:'🔵 This Week' },
    { id:'monthly', label:'🟣 This Month' },
  ]

  return (
    <>
      <Head><title>Daily Brief — CC Intelligence</title></Head>
      <Shell title="Intelligence Brief" subtitle={today}>

        {/* Generate button */}
        <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 16px',marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:2}}>
              {briefDate ? `Last generated: ${briefDate.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})} — ${briefDate.toLocaleDateString('en-GB')}` : 'Generate your intelligence brief'}
            </div>
            <div style={{fontSize:11,color:stale?T.red:T.textMuted}}>
              {stale ? '⚠ Data is stale — regenerate for today\'s intelligence' : brief ? 'Run every morning. Daily questions change each day. Weekly on Mondays. Monthly on the 1st.' : 'Answers 12 specific questions across daily, weekly and monthly priorities'}
            </div>
          </div>
          <button onClick={generate} disabled={generating||loading} style={{
            padding:'10px 24px',fontSize:13,fontWeight:700,whiteSpace:'nowrap',minWidth:180,
            background:generating?T.border:stale?T.red:T.green,color:'#fff',border:'none',borderRadius:8,cursor:'pointer'
          }}>
            {generating ? '⏳ Generating...' : brief ? '🔄 Regenerate' : '🧠 Generate Brief →'}
          </button>
        </div>

        {/* Live stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:14}}>
          {[
            {l:"Today's Revenue", v:shopify?.today?.formatted||'—',    c:T.green},
            {l:"Today's Orders",  v:shopify?.today?.orders||'—',       c:T.blue},
            {l:'This Week',       v:shopify?.week?.formatted||'—',     c:'#7c3aed'},
            {l:'Abandoned Carts', v:`${shopify?.abandonedCount||0}`,   c:T.red},
            {l:'Abandoned Value', v:`£${shopify?.abandonedValue||0}`,  c:T.red},
          ].map((s,i)=>(
            <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontSize:9,color:T.textMuted,textTransform:'uppercase',fontWeight:700,marginBottom:4,letterSpacing:'0.05em'}}>{s.l}</div>
              <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:6,marginBottom:14}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
              padding:'6px 16px',fontSize:12,fontWeight:activeTab===t.id?700:400,
              color:activeTab===t.id?'#fff':T.text,
              background:activeTab===t.id?T.blue:T.surface,
              border:`0.5px solid ${activeTab===t.id?T.blue:T.border}`,
              borderRadius:20,cursor:'pointer'
            }}>{t.label}</button>
          ))}
        </div>

        {!brief && !generating && (
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:60,textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>🧠</div>
            <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:10}}>12 questions. Real answers. Every day.</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,maxWidth:700,margin:'0 auto 20px',textAlign:'left'}}>
              {[
                {label:'🔴 Daily (run every morning)',   items:['What sold today?','Where am I losing money today?','One Google Ads action today','Abandoned carts to chase']},
                {label:'🔵 Weekly (run on Mondays)',     items:['Which brand to focus on?','Which hair style is trending?','Which blog to write?','Budget moves this week']},
                {label:'🟣 Monthly (run on the 1st)',    items:['Biggest SEO opportunity','What to stock up on','Are competitors gaining?','Event preparation now']},
              ].map((col,i)=>(
                <div key={i} style={{background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:6,padding:'12px'}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.text,marginBottom:8}}>{col.label}</div>
                  {col.items.map((item,j)=>(
                    <div key={j} style={{fontSize:11,color:T.textMuted,padding:'3px 0',borderBottom:`0.5px solid ${T.borderLight}`}}>→ {item}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {brief && (
          <div>
            {/* Summary */}
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'12px 16px',marginBottom:14,fontSize:12,color:T.text,lineHeight:1.7}}>
              <strong style={{color:T.green}}>Today's summary: </strong>{brief.todaySummary}
            </div>

            {/* ═══ DAILY ═══ */}
            {(activeTab==='all'||activeTab==='daily') && (<>
              <div style={{fontSize:11,fontWeight:700,color:T.red,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8,paddingBottom:4,borderBottom:`2px solid ${T.red}`}}>🔴 Do today</div>

              {/* What sold */}
              {brief.daily_what_sold && (
                <Card icon="💰" title="What sold today?" freq="daily" data={
                  <div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                      {brief.daily_what_sold.products?.map((p,i)=>(
                        <span key={i} style={{fontSize:11,padding:'4px 10px',background:T.greenBg,color:T.green,border:`0.5px solid ${T.greenBorder}`,borderRadius:4,fontWeight:600}}>
                          {i===0?'🥇 ':i===1?'🥈 ':'🥉 '}{p}
                        </span>
                      ))}
                    </div>
                    <div style={{fontSize:12,color:T.textMuted,marginBottom:10,lineHeight:1.6}}>{brief.daily_what_sold.insight}</div>
                    <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:6,padding:'10px 12px',marginBottom:6}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.green,textTransform:'uppercase',marginBottom:4}}>What to do right now</div>
                      <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{brief.daily_what_sold.action}</div>
                    </div>
                    <div style={{background:T.bg,borderRadius:6,padding:'10px 12px'}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>Exact steps</div>
                      <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{brief.daily_what_sold.exactSteps}</div>
                    </div>
                  </div>
                }/>
              )}

              {/* Waste */}
              {brief.daily_waste && (
                <Card icon="🚫" title="Where am I losing money today?" freq="daily" data={
                  <div>
                    {brief.daily_waste.topWaste?.map((w,i)=>(
                      <div key={i} style={{background:'#fff0f0',border:`0.5px solid ${T.red}40`,borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                          <span style={{fontSize:12,fontWeight:700,color:T.text,flex:1}}>{w.what}</span>
                          <div style={{display:'flex',gap:8,fontSize:10,flexShrink:0,marginLeft:8}}>
                            <span style={{color:T.textMuted}}>{w.impressions?.toLocaleString()} impressions</span>
                            <span style={{color:T.red,fontWeight:700}}>CTR: {w.ctr}</span>
                            <span style={{color:T.textMuted}}>{w.timeToFix}</span>
                          </div>
                        </div>
                        <div style={{fontSize:11,color:T.red,marginBottom:6}}>{w.whyBad}</div>
                        <div style={{background:T.bg,borderRadius:4,padding:'7px 10px'}}>
                          <div style={{fontSize:10,fontWeight:700,color:T.green,marginBottom:2}}>Fix right now:</div>
                          <div style={{fontSize:11,color:T.text,lineHeight:1.5}}>{w.fix}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{background:T.bg,borderRadius:6,padding:'10px 12px'}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.red,textTransform:'uppercase',marginBottom:4}}>Single most urgent fix today</div>
                      <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{brief.daily_waste.urgentFix}</div>
                    </div>
                  </div>
                }/>
              )}

              {/* Ads action */}
              {brief.daily_ads_action && (
                <Card icon="⚡" title="Google Ads — one action today" freq="daily" data={
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:8}}>{brief.daily_ads_action.action}</div>
                    <div style={{background:'#fff0f0',border:`0.5px solid ${T.red}40`,borderRadius:6,padding:'8px 12px',marginBottom:8,fontSize:11,color:T.text}}>
                      <strong style={{color:T.red}}>Why urgent: </strong>{brief.daily_ads_action.whyUrgent}
                    </div>
                    <div style={{background:T.bg,borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>Where to go</div>
                      <div style={{fontSize:12,color:T.blue,fontWeight:600,fontFamily:'monospace'}}>{brief.daily_ads_action.whereToGo}</div>
                    </div>
                    <div style={{background:T.bg,borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>Exactly what to do</div>
                      <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{brief.daily_ads_action.whatToDo}</div>
                    </div>
                    {brief.daily_ads_action.doNotTouch && (
                      <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:6,padding:'8px 12px',marginBottom:8,fontSize:11,color:T.text}}>
                        <strong style={{color:T.amber}}>⚠ Do NOT touch today: </strong>{brief.daily_ads_action.doNotTouch}
                      </div>
                    )}
                    <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:6,padding:'9px 12px',fontSize:11,color:T.green,fontWeight:600}}>
                      Expected: {brief.daily_ads_action.expectedImpact}
                    </div>
                  </div>
                }/>
              )}

              {/* Abandoned carts */}
              {brief.daily_abandoned_carts && parseInt(brief.daily_abandoned_carts.count) > 0 && (
                <Card icon="🛒" title="Abandoned carts to chase right now" freq="daily" data={
                  <div>
                    <div style={{display:'flex',gap:10,marginBottom:10}}>
                      <div style={{background:'#fff0f0',borderRadius:6,padding:'10px 14px',textAlign:'center',flex:1}}>
                        <div style={{fontSize:9,color:T.textMuted,textTransform:'uppercase',marginBottom:3}}>Carts abandoned</div>
                        <div style={{fontSize:24,fontWeight:800,color:T.red}}>{brief.daily_abandoned_carts.count}</div>
                      </div>
                      <div style={{background:'#fff0f0',borderRadius:6,padding:'10px 14px',textAlign:'center',flex:1}}>
                        <div style={{fontSize:9,color:T.textMuted,textTransform:'uppercase',marginBottom:3}}>Value at risk</div>
                        <div style={{fontSize:24,fontWeight:800,color:T.red}}>{brief.daily_abandoned_carts.value}</div>
                      </div>
                    </div>
                    <div style={{background:T.bg,borderRadius:6,padding:'12px',marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>WhatsApp message to send</div>
                      <div style={{fontSize:12,color:T.text,lineHeight:1.7,fontStyle:'italic',marginBottom:8}}>{brief.daily_abandoned_carts.message}</div>
                      <button onClick={()=>copy(brief.daily_abandoned_carts.message,'cart')} style={{fontSize:11,padding:'5px 12px',background:T.green,color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>
                        {copied==='cart'?'✓ Copied!':'Copy message'}
                      </button>
                    </div>
                    <a href="/abandoned-carts" style={{fontSize:11,color:T.blue,fontWeight:700,textDecoration:'none'}}>View all abandoned carts with customer details →</a>
                  </div>
                }/>
              )}
            </>)}

            {/* ═══ WEEKLY ═══ */}
            {(activeTab==='all'||activeTab==='weekly') && (<>
              <div style={{fontSize:11,fontWeight:700,color:T.blue,textTransform:'uppercase',letterSpacing:'0.1em',margin:'16px 0 8px',paddingBottom:4,borderBottom:`2px solid ${T.blue}`}}>🔵 This week's focus</div>

              {/* Brand focus */}
              {brief.weekly_brand_focus && (
                <Card icon="🏷️" title="Brand to focus on this week" freq="weekly" data={
                  <div>
                    <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:10}}>
                      <div style={{fontSize:22,fontWeight:900,color:T.amber}}>{brief.weekly_brand_focus.brand}</div>
                      <div style={{display:'flex',gap:8,fontSize:11}}>
                        <span style={{color:T.textMuted}}>{brief.weekly_brand_focus.data?.impressions?.toLocaleString()} impressions</span>
                        <span style={{color:T.blue}}>{brief.weekly_brand_focus.data?.clicks} clicks</span>
                        <span style={{color:T.amber}}>pos {brief.weekly_brand_focus.data?.position}</span>
                        <span style={{color:T.red,fontWeight:700}}>CTR {brief.weekly_brand_focus.data?.ctr}</span>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:T.textMuted,marginBottom:10,lineHeight:1.6}}>{brief.weekly_brand_focus.whyThisWeek}</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                      {[
                        {label:'SEO fix',      value:brief.weekly_brand_focus.seoFix,   color:T.blue,   id:'seo_title'},
                        {label:'Google Ads',   value:brief.weekly_brand_focus.adsBid,   color:T.green,  id:null},
                        {label:'Blog to write',value:brief.weekly_brand_focus.blogIdea, color:'#7c3aed', id:'blog_title'},
                      ].map((item,i)=>(
                        <div key={i} style={{background:T.bg,borderRadius:6,padding:'9px 11px',borderLeft:`3px solid ${item.color}`}}>
                          <div style={{fontSize:9,fontWeight:700,color:item.color,textTransform:'uppercase',marginBottom:3}}>{item.label}</div>
                          <div style={{fontSize:11,color:T.text,lineHeight:1.5,marginBottom:item.id?6:0}}>{item.value}</div>
                          {item.id && (
                            <button onClick={()=>copy(item.value,item.id)} style={{fontSize:9,padding:'2px 7px',background:item.color,color:'#fff',border:'none',borderRadius:3,cursor:'pointer'}}>
                              {copied===item.id?'✓':'Copy'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                }/>
              )}

              {/* Hair style */}
              {brief.weekly_hair_style && (
                <Card icon="💇" title="Hair style people are searching for most" freq="weekly" data={
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                      <div style={{fontSize:20,fontWeight:900,color:T.text}}>{brief.weekly_hair_style.topStyle}</div>
                      <div style={{display:'flex',gap:8,fontSize:11}}>
                        <span style={{color:T.blue}}>{brief.weekly_hair_style.data?.impressions?.toLocaleString()} searches</span>
                        <span style={{color:T.amber}}>pos {brief.weekly_hair_style.data?.position}</span>
                        <span style={{color:brief.weekly_hair_style.data?.ctr?.replace('%','')<3?T.red:T.green,fontWeight:700}}>CTR {brief.weekly_hair_style.data?.ctr}</span>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
                      <div style={{flex:1,background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:4,padding:'7px 10px',fontSize:11,color:T.text,fontFamily:'monospace'}}>
                        {brief.weekly_hair_style.exactSeoTitle}
                      </div>
                      <button onClick={()=>copy(brief.weekly_hair_style.exactSeoTitle,'style_title')} style={{fontSize:10,padding:'5px 10px',background:T.blue,color:'#fff',border:'none',borderRadius:4,cursor:'pointer',whiteSpace:'nowrap'}}>
                        {copied==='style_title'?'✓ Copied!':'Copy SEO title'}
                      </button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                      <div style={{background:T.bg,borderRadius:6,padding:'9px 11px'}}>
                        <div style={{fontSize:9,fontWeight:700,color:'#7c3aed',textTransform:'uppercase',marginBottom:3}}>Blog to write</div>
                        <div style={{fontSize:11,color:T.text,lineHeight:1.5,marginBottom:4}}>{brief.weekly_hair_style.exactBlogTitle}</div>
                        <button onClick={()=>copy(brief.weekly_hair_style.exactBlogTitle,'style_blog')} style={{fontSize:9,padding:'2px 7px',background:'#7c3aed',color:'#fff',border:'none',borderRadius:3,cursor:'pointer'}}>
                          {copied==='style_blog'?'✓':'Copy title'}
                        </button>
                      </div>
                      <div style={{background:T.bg,borderRadius:6,padding:'9px 11px'}}>
                        <div style={{fontSize:9,fontWeight:700,color:T.amber,textTransform:'uppercase',marginBottom:3}}>Stock check</div>
                        <div style={{fontSize:11,color:T.text,lineHeight:1.5}}>{brief.weekly_hair_style.stockCheck}</div>
                      </div>
                    </div>
                    {brief.weekly_hair_style.otherTrendingStyles?.length>0 && (
                      <div style={{fontSize:11,color:T.textMuted}}>
                        <strong style={{color:T.text}}>Also trending: </strong>{brief.weekly_hair_style.otherTrendingStyles?.join(' · ')}
                      </div>
                    )}
                  </div>
                }/>
              )}

              {/* Blog */}
              {brief.weekly_blog && (
                <Card icon="✍️" title="Blog to write this week" freq="weekly" data={
                  <div>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                      <div style={{flex:1,fontSize:15,fontWeight:800,color:'#7c3aed'}}>{brief.weekly_blog.title}</div>
                      <button onClick={()=>copy(brief.weekly_blog.title,'blog_title')} style={{fontSize:10,padding:'4px 10px',background:'#7c3aed',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',flexShrink:0}}>
                        {copied==='blog_title'?'✓ Copied!':'Copy title'}
                      </button>
                    </div>
                    <div style={{fontSize:11,color:T.textMuted,marginBottom:8,lineHeight:1.6}}>{brief.weekly_blog.why}</div>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
                      {brief.weekly_blog.keywords?.map((k,i)=>(
                        <span key={i} style={{fontSize:10,padding:'2px 8px',background:'#f5f0ff',color:'#7c3aed',border:'0.5px solid #7c3aed40',borderRadius:3}}>{k}</span>
                      ))}
                    </div>
                    <div style={{background:T.bg,borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Outline</div>
                      {brief.weekly_blog.outline?.map((s,i)=>(
                        <div key={i} style={{fontSize:11,color:T.text,padding:'4px 0',borderBottom:`0.5px solid ${T.borderLight}`}}>{s}</div>
                      ))}
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                      <span style={{color:'#7c3aed',fontWeight:600}}>{brief.weekly_blog.cta && `CTA: ${brief.weekly_blog.cta}`}</span>
                      <span style={{color:T.green,fontWeight:700}}>Target: {brief.weekly_blog.expectedMonthlyTraffic}</span>
                    </div>
                    <a href="/blog-planner" style={{display:'inline-block',marginTop:8,fontSize:11,color:'#fff',background:'#7c3aed',padding:'5px 12px',borderRadius:5,textDecoration:'none',fontWeight:700}}>
                      Go to Blog Planner →
                    </a>
                  </div>
                }/>
              )}

              {/* Budget moves */}
              {brief.weekly_budget_moves && (
                <Card icon="📊" title="Budget moves this week" freq="weekly" data={
                  <div>
                    {brief.weekly_budget_moves.scale?.length>0 && (
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:10,fontWeight:700,color:T.green,textTransform:'uppercase',marginBottom:6}}>⬆ Scale — put more money here</div>
                        {brief.weekly_budget_moves.scale.map((s,i)=>(
                          <div key={i} style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:6,padding:'10px 12px',marginBottom:6}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                              <span style={{fontSize:12,fontWeight:700,color:T.text}}>{s.campaign}</span>
                              <span style={{fontSize:13,fontWeight:800,color:T.green}}>{s.from} → {s.to}</span>
                            </div>
                            <div style={{fontSize:11,color:T.textMuted,marginBottom:3}}>{s.why}</div>
                            <div style={{fontSize:11,color:T.green,fontWeight:600}}>{s.expectedROI}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {brief.weekly_budget_moves.cut?.length>0 && (
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:10,fontWeight:700,color:T.red,textTransform:'uppercase',marginBottom:6}}>⬇ Cut — stop wasting money here</div>
                        {brief.weekly_budget_moves.cut.map((s,i)=>(
                          <div key={i} style={{background:'#fff0f0',border:`0.5px solid ${T.red}40`,borderRadius:6,padding:'10px 12px',marginBottom:6}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                              <span style={{fontSize:12,fontWeight:700,color:T.text}}>{s.campaign}</span>
                              <span style={{fontSize:13,fontWeight:800,color:T.red}}>{s.from} → {s.to}</span>
                            </div>
                            <div style={{fontSize:11,color:T.textMuted,marginBottom:3}}>{s.why}</div>
                            <div style={{fontSize:11,color:T.green,fontWeight:600}}>Saving: {s.saving}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {brief.weekly_budget_moves.negativeKeywords?.length>0 && (
                      <div>
                        <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Add these as negative keywords in Google Ads</div>
                        <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
                          {brief.weekly_budget_moves.negativeKeywords.map((k,i)=>(
                            <span key={i} style={{fontSize:11,padding:'3px 9px',background:'#fff0f0',color:T.red,border:`0.5px solid ${T.red}40`,borderRadius:4}}>{k}</span>
                          ))}
                        </div>
                        <button onClick={()=>copy(brief.weekly_budget_moves.negativeKeywords.join('\n'),'negkw')} style={{fontSize:11,padding:'5px 12px',background:T.red,color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>
                          {copied==='negkw'?'✓ Copied!':'Copy all negatives'}
                        </button>
                      </div>
                    )}
                  </div>
                }/>
              )}
            </>)}

            {/* ═══ MONTHLY ═══ */}
            {(activeTab==='all'||activeTab==='monthly') && (<>
              <div style={{fontSize:11,fontWeight:700,color:'#7c3aed',textTransform:'uppercase',letterSpacing:'0.1em',margin:'16px 0 8px',paddingBottom:4,borderBottom:`2px solid #7c3aed`}}>🟣 This month's strategy</div>

              {/* SEO opportunity */}
              {brief.monthly_seo_opportunity && (
                <Card icon="🔍" title="Biggest SEO opportunity this month" freq="monthly" data={
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:'#7c3aed',marginBottom:8}}>{brief.monthly_seo_opportunity.title}</div>
                    <div style={{fontSize:12,color:T.text,lineHeight:1.7,marginBottom:10}}>{brief.monthly_seo_opportunity.detail}</div>
                    <div style={{background:T.bg,borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:'#7c3aed',textTransform:'uppercase',marginBottom:6}}>Exact steps</div>
                      <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{brief.monthly_seo_opportunity.exactFix}</div>
                    </div>
                    <div style={{fontSize:11,color:T.green,fontWeight:600}}>Expected: {brief.monthly_seo_opportunity.expectedImpact}</div>
                  </div>
                }/>
              )}

              {/* Stock plan */}
              {brief.monthly_stock_plan && (
                <Card icon="📦" title="What to stock up on this month" freq="monthly" data={
                  <div>
                    <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:6,padding:'9px 12px',marginBottom:10,fontSize:12,color:T.text}}>
                      <strong style={{color:T.amber}}>Upcoming: </strong>{brief.monthly_stock_plan.upcomingEvent} — {brief.monthly_stock_plan.weeksToEvent} weeks away
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
                      {brief.monthly_stock_plan.stockNow?.map((item,i)=>(
                        <div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:`0.5px solid ${T.borderLight}`}}>
                          <span style={{color:T.amber,flexShrink:0}}>📦</span>
                          <span style={{fontSize:12,color:T.text}}>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{background:T.bg,borderRadius:6,padding:'10px 12px'}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.amber,textTransform:'uppercase',marginBottom:4}}>Stock action now</div>
                      <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{brief.monthly_stock_plan.stockAction}</div>
                    </div>
                  </div>
                }/>
              )}

              {/* Competitor check */}
              {brief.monthly_competitor_check && (
                <Card icon="🏆" title="Competitor check — are they gaining on us?" freq="monthly" data={
                  <div>
                    <div style={{fontSize:12,color:T.textMuted,marginBottom:10,lineHeight:1.6}}>{brief.monthly_competitor_check.howToCheck}</div>
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.text,textTransform:'uppercase',marginBottom:6}}>Check these keywords manually in Google (incognito mode)</div>
                      <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                        {brief.monthly_competitor_check.keywordsToCheck?.map((k,i)=>(
                          <a key={i} href={`https://www.google.co.uk/search?q=${encodeURIComponent(k)}`} target="_blank" rel="noreferrer"
                            style={{fontSize:11,padding:'4px 10px',background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:4,color:T.blue,textDecoration:'none',fontWeight:600}}>
                            {k} →
                          </a>
                        ))}
                      </div>
                    </div>
                    <div style={{background:'#fff0f0',border:`0.5px solid ${T.red}40`,borderRadius:6,padding:'9px 12px',marginBottom:8,fontSize:11,color:T.text}}>
                      <strong style={{color:T.red}}>If a competitor ranks above you: </strong>{brief.monthly_competitor_check.ifTheyAreAhead}
                    </div>
                    <div style={{fontSize:11,color:T.textMuted}}><strong style={{color:T.text}}>Social check: </strong>{brief.monthly_competitor_check.socialCheck}</div>
                  </div>
                }/>
              )}

              {/* Event prep */}
              {brief.monthly_event_prep && (
                <Card icon="📅" title={`Event prep — ${brief.monthly_event_prep.nextEvent}`} freq="monthly" data={
                  <div>
                    <div style={{display:'flex',gap:10,marginBottom:12}}>
                      <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:6,padding:'10px 14px',flex:1,textAlign:'center'}}>
                        <div style={{fontSize:9,color:T.amber,textTransform:'uppercase',marginBottom:3}}>Event date</div>
                        <div style={{fontSize:14,fontWeight:700,color:T.text}}>{brief.monthly_event_prep.date}</div>
                      </div>
                      <div style={{background:T.amberBg,border:`0.5px solid ${T.amberBorder}`,borderRadius:6,padding:'10px 14px',flex:1,textAlign:'center'}}>
                        <div style={{fontSize:9,color:T.amber,textTransform:'uppercase',marginBottom:3}}>Weeks away</div>
                        <div style={{fontSize:24,fontWeight:800,color:T.amber}}>{brief.monthly_event_prep.weeksAway}</div>
                      </div>
                    </div>
                    {[
                      {label:'Do now',          value:brief.monthly_event_prep.whatToDoNow,     color:T.red},
                      {label:'Stock to order',  value:brief.monthly_event_prep.stockToOrder,    color:T.amber},
                      {label:'Ads to prepare',  value:brief.monthly_event_prep.adsToCreate,     color:T.blue},
                      {label:'Content to make', value:brief.monthly_event_prep.contentToCreate, color:'#7c3aed'},
                    ].map((item,i)=>(
                      <div key={i} style={{background:T.bg,borderRadius:6,padding:'9px 11px',marginBottom:6,borderLeft:`3px solid ${item.color}`}}>
                        <div style={{fontSize:9,fontWeight:700,color:item.color,textTransform:'uppercase',marginBottom:3}}>{item.label}</div>
                        <div style={{fontSize:12,color:T.text,lineHeight:1.5}}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                }/>
              )}
            </>)}

          </div>
        )}

      </Shell>
    </>
  )
}
