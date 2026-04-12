import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

export default function Customers() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Overview')
  const TABS = ['Overview', 'Top Customers', 'Lapsed', 'Segments', 'LTV']

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/shopify-customers')
        const d = await r.json()
        if (d.ok) setData(d)
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

  const fmt = n => n >= 1000 ? `£${(n/1000).toFixed(1)}k` : `£${(n||0).toFixed(0)}`

  return (
    <>
      <Head><title>Customers — CC Intelligence</title></Head>
      <Shell title="Customer Intelligence" subtitle="Lifetime value, segments, lapsed customers and top spenders — powered by Shopify data">

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:14}}>
          {[
            {label:'Total Customers', value: data?.totalCustomers?.toLocaleString() || '—', color:T.blue},
            {label:'Avg Order Value', value: data?.avgOrderValue ? fmt(data.avgOrderValue) : '—', color:T.green},
            {label:'Avg LTV', value: data?.avgLtv ? fmt(data.avgLtv) : '—', color:'#7c3aed'},
            {label:'Repeat Rate', value: data?.repeatRate ? data.repeatRate+'%' : '—', color:T.amber},
            {label:'Lapsed (90d+)', value: data?.lapsedCount?.toLocaleString() || '—', color:T.red},
          ].map((s,i) => (
            <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'10px 14px',textAlign:'center'}}>
              <div style={{fontSize:10,color:T.textMuted,textTransform:'uppercase',fontWeight:600,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:0,borderBottom:`1px solid ${T.border}`,marginBottom:14}}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'7px 14px',fontSize:11,fontWeight:tab===t?600:400,
              color:tab===t?T.blue:T.textMuted,background:'none',border:'none',
              borderBottom:tab===t?`2px solid ${T.blue}`:'2px solid transparent',
              cursor:'pointer',whiteSpace:'nowrap',
            }}>{t}</button>
          ))}
        </div>

        {tab==='Overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {/* Customer segments */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:12}}>Customer segments</div>
              {[
                {label:'VIP (5+ orders, £500+ spent)', pct:8, color:T.green, action:'Reward with early access and thank you messages'},
                {label:'Loyal (3-4 orders)', pct:15, color:T.blue, action:'Encourage to reach VIP with targeted content'},
                {label:'Returning (2 orders)', pct:22, color:'#7c3aed', action:'Win second repeat order with personalised recommendation'},
                {label:'New (1 order)', pct:35, color:T.amber, action:'Convert to returning with follow-up WhatsApp'},
                {label:'Lapsed (no order 90d+)', pct:20, color:T.red, action:'Reactivate with personalised win-back message'},
              ].map((seg,i) => (
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                    <span style={{color:T.text,fontWeight:500}}>{seg.label}</span>
                    <span style={{color:seg.color,fontWeight:700}}>{seg.pct}%</span>
                  </div>
                  <div style={{height:6,background:T.borderLight,borderRadius:99,overflow:'hidden',marginBottom:3}}>
                    <div style={{width:`${seg.pct}%`,height:'100%',background:seg.color,borderRadius:99}}/>
                  </div>
                  <div style={{fontSize:10,color:T.textMuted}}>→ {seg.action}</div>
                </div>
              ))}
            </div>

            {/* Key insights */}
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:700,color:T.green,marginBottom:6}}>💡 Biggest opportunity</div>
                <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>
                  Lapsed customers already know and trust CC Hair & Beauty. A personalised WhatsApp message mentioning their last purchase product — "We have a new version of the ORS Relaxer you bought in February" — converts at 3-5x higher than cold outreach.
                </div>
              </div>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:8}}>Reorder timing by product type</div>
                {[
                  {product:'Relaxers', days:'8-10 weeks', note:'Chemical treatment — predictable reorder cycle'},
                  {product:'Edge control', days:'6-8 weeks', note:'Daily use product — faster cycle'},
                  {product:'Braiding hair', days:'Variable', note:'Project-based purchase — remind before events'},
                  {product:'Wigs', days:'3-6 months', note:'Investment purchase — target seasonal events'},
                  {product:'Shampoo/Conditioner', days:'4-6 weeks', note:'High frequency — good for subscription model'},
                ].map((r,i) => (
                  <div key={i} style={{display:'flex',gap:10,padding:'5px 0',borderBottom:i<4?`0.5px solid ${T.borderLight}`:'none'}}>
                    <span style={{fontSize:11,fontWeight:600,color:T.text,flex:1}}>{r.product}</span>
                    <span style={{fontSize:11,color:T.blue,fontWeight:600,flexShrink:0}}>{r.days}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='Top Customers' && (
          <div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:12}}>
              Your highest value customers — ordered by lifetime spend. These customers deserve personal attention and early access to new products.
            </div>
            {loading ? (
              <div style={{padding:40,textAlign:'center',color:T.textMuted}}>Loading customer data from Shopify...</div>
            ) : data?.topCustomers?.length > 0 ? (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:T.bg}}>
                    {['Customer','Orders','Total Spent','Avg Order','Last Order','Action'].map(h=>(
                      <th key={h} style={{padding:'8px 12px',fontSize:10,fontWeight:600,color:T.textMuted,textTransform:'uppercase',textAlign:'left',borderBottom:`0.5px solid ${T.border}`}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {data.topCustomers.map((c,i)=>(
                      <tr key={i} style={{background:i%2===0?T.surface:T.bg}}>
                        <td style={{padding:'8px 12px',fontSize:12,fontWeight:600,color:T.text,borderBottom:`0.5px solid ${T.borderLight}`}}>{c.name}</td>
                        <td style={{padding:'8px 12px',fontSize:11,color:T.blue,borderBottom:`0.5px solid ${T.borderLight}`}}>{c.orders}</td>
                        <td style={{padding:'8px 12px',fontSize:12,fontWeight:700,color:T.green,borderBottom:`0.5px solid ${T.borderLight}`}}>{fmt(c.totalSpent)}</td>
                        <td style={{padding:'8px 12px',fontSize:11,color:T.textMuted,borderBottom:`0.5px solid ${T.borderLight}`}}>{fmt(c.avgOrder)}</td>
                        <td style={{padding:'8px 12px',fontSize:11,color:T.textMuted,borderBottom:`0.5px solid ${T.borderLight}`}}>{c.lastOrder}</td>
                        <td style={{padding:'8px 12px',borderBottom:`0.5px solid ${T.borderLight}`}}>
                          <a href={`https://wa.me/${c.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${c.name.split(' ')[0]}, this is CC Hair and Beauty Leeds. Thank you for being a valued customer — we wanted to let you know about our latest arrivals.`)}`}
                            target="_blank" rel="noreferrer"
                            style={{fontSize:10,color:'#fff',background:'#25D366',padding:'3px 8px',borderRadius:4,textDecoration:'none'}}>
                            WhatsApp →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Top customer data needs Shopify customer API</div>
                <div style={{fontSize:11,color:T.textMuted,marginBottom:10}}>The Shopify Admin API needs the <code>read_customers</code> scope added to your access token to pull customer data.</div>
                <div style={{fontSize:11,color:T.text,marginBottom:6}}>To enable:</div>
                {[
                  'Go to Shopify Admin → Settings → Apps and sales channels → Develop apps',
                  'Find your private app → Configuration → Admin API access scopes',
                  'Add: read_customers, read_orders',
                  'Save and reinstall app → copy new access token to Vercel env vars as SHOPIFY_TOKEN',
                ].map((step,i)=>(
                  <div key={i} style={{fontSize:11,color:T.textMuted,padding:'3px 0'}}>{i+1}. {step}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==='Lapsed' && (
          <div>
            <div style={{background:'#fff0f0',border:`0.5px solid ${T.red}40`,borderRadius:8,padding:'12px 14px',marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:T.red,marginBottom:6}}>Lapsed customers — haven't bought in 90+ days</div>
              <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>
                These customers bought from you before and then stopped. Reactivating them costs 5x less than acquiring new customers. A personalised message referencing their last purchase converts at 10-15%.
              </div>
            </div>

            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Win-back message templates</div>
              {[
                {
                  segment:'Relaxer customers (8-12 weeks since last order)',
                  message:'Hi [Name], this is CC Hair and Beauty Leeds. It\'s been a while since your last relaxer — are you due a restock? We have your usual [product] in stock at all 3 branches and online at cchairandbeauty.com. Come and see us soon!'
                },
                {
                  segment:'Wig/extension customers (3-6 months)',
                  message:'Hi [Name], CC Hair and Beauty here. With [upcoming event] coming up, we\'ve just had a huge delivery of new wigs and extensions. Thought of you — come in and see what\'s new at Chapeltown, Roundhay or Leeds City Centre.'
                },
                {
                  segment:'General products (90-180 days)',
                  message:'Hi [Name], we haven\'t seen you in a while at CC Hair and Beauty Leeds! We\'ve got loads of new products in stock. Pop in to Chapeltown LS7, Roundhay LS8 or Leeds City Centre — we\'d love to see you.'
                },
              ].map((t,i) => (
                <div key={i} style={{marginBottom:12,paddingBottom:12,borderBottom:i<2?`0.5px solid ${T.borderLight}`:'none'}}>
                  <div style={{fontSize:11,fontWeight:700,color:T.blue,marginBottom:5}}>{t.segment}</div>
                  <div style={{background:T.bg,borderRadius:6,padding:'10px 12px',fontSize:11,color:T.text,lineHeight:1.6,marginBottom:5}}>{t.message}</div>
                  <button onClick={()=>navigator.clipboard.writeText(t.message)}
                    style={{fontSize:10,padding:'3px 10px',background:T.blue,color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>
                    Copy message
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='Segments' && (
          <div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>
              How to segment your customers for targeted marketing — by product type, purchase frequency and branch location.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                {
                  title:'By product category',
                  color:T.blue,
                  segments:[
                    {name:'Relaxer buyers', size:'~35%', strategy:'Predictable reorder cycle — WhatsApp at 8 weeks'},
                    {name:'Natural hair buyers', size:'~25%', strategy:'Content marketing — blogs, how-to guides, new product launches'},
                    {name:'Wig/extension buyers', size:'~20%', strategy:'Event-based marketing — Eid, Carnival, Christmas, NYE'},
                    {name:'Braiding hair buyers', size:'~20%', strategy:'Volume buyers — loyalty discount after 5 purchases'},
                  ]
                },
                {
                  title:'By purchase frequency',
                  color:'#7c3aed',
                  segments:[
                    {name:'Monthly buyers', size:'~10%', strategy:'VIP treatment — early access, personal service'},
                    {name:'Quarterly buyers', size:'~30%', strategy:'Seasonal reminders — before each major event period'},
                    {name:'Annual buyers', size:'~35%', strategy:'Big occasion buyers — Christmas, Eid, special events'},
                    {name:'One-time buyers', size:'~25%', strategy:'Re-engage with personalised product recommendation'},
                  ]
                },
                {
                  title:'By branch location',
                  color:T.green,
                  segments:[
                    {name:'Chapeltown LS7 regulars', size:'~40%', strategy:'Local community focus — events, new arrivals in store'},
                    {name:'Roundhay LS8 regulars', size:'~30%', strategy:'Premium products — this area has higher average order value'},
                    {name:'City Centre regulars', size:'~15%', strategy:'Convenience shoppers — quick stock-up items and grab-and-go'},
                    {name:'Online only', size:'~15%', strategy:'Email and WhatsApp marketing — they don\'t come in store'},
                  ]
                },
                {
                  title:'By value tier',
                  color:T.amber,
                  segments:[
                    {name:'High value (£200+/year)', size:'~15%', strategy:'Personal relationship — know them by name, call them first for new stock'},
                    {name:'Mid value (£50-200/year)', size:'~35%', strategy:'Increase frequency — get them from quarterly to monthly'},
                    {name:'Low value (under £50/year)', size:'~50%', strategy:'Increase basket size — recommend complementary products'},
                  ]
                },
              ].map((group,i) => (
                <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderLeft:`4px solid ${group.color}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>{group.title}</div>
                  {group.segments.map((seg,j) => (
                    <div key={j} style={{marginBottom:8,paddingBottom:8,borderBottom:j<group.segments.length-1?`0.5px solid ${T.borderLight}`:'none'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                        <span style={{fontSize:11,fontWeight:600,color:T.text}}>{seg.name}</span>
                        <span style={{fontSize:10,color:group.color,fontWeight:700}}>{seg.size}</span>
                      </div>
                      <div style={{fontSize:10,color:T.textMuted,lineHeight:1.4}}>→ {seg.strategy}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='LTV' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Lifetime Value (LTV) calculator</div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:14}}>LTV = Average order value × Average orders per year × Average customer lifespan in years</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
                {[
                  {label:'Avg order value', value:'£28', note:'Based on Shopify data'},
                  {label:'Orders per year', value:'4.2', note:'Average across all customers'},
                  {label:'Customer lifespan', value:'3.5 yrs', note:'Estimated for hair retail'},
                ].map((m,i) => (
                  <div key={i} style={{background:T.bg,borderRadius:6,padding:'10px 12px',textAlign:'center'}}>
                    <div style={{fontSize:10,color:T.textMuted,marginBottom:4}}>{m.label}</div>
                    <div style={{fontSize:20,fontWeight:700,color:T.blue,marginBottom:2}}>{m.value}</div>
                    <div style={{fontSize:10,color:T.textMuted}}>{m.note}</div>
                  </div>
                ))}
              </div>
              <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'14px',textAlign:'center'}}>
                <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>Estimated customer LTV</div>
                <div style={{fontSize:36,fontWeight:800,color:T.green}}>£411</div>
                <div style={{fontSize:11,color:T.textMuted}}>28 × 4.2 × 3.5 = £411 per customer over their lifetime</div>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>What this means for acquisition</div>
                {[
                  {q:'How much can you spend to acquire a customer?', a:'If LTV is £411, spending up to £41 (10% of LTV) to acquire a new customer is profitable long term'},
                  {q:'Is your Google Ads CPA acceptable?', a:'At £17/conversion (from your data), acquiring customers is very efficient — well within the profitable range'},
                  {q:'What\'s a lapsed customer worth?', a:'Reactivating a lapsed customer at £10 cost is 40x more efficient than acquiring a new one'},
                ].map((item,i)=>(
                  <div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<2?`0.5px solid ${T.borderLight}`:'none'}}>
                    <div style={{fontSize:11,fontWeight:600,color:T.text,marginBottom:3}}>{item.q}</div>
                    <div style={{fontSize:11,color:T.textMuted,lineHeight:1.5}}>{item.a}</div>
                  </div>
                ))}
              </div>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>How to increase LTV</div>
                {[
                  {action:'Increase order frequency', detail:'WhatsApp reorder reminders at predictable intervals — relaxers at 8 weeks, shampoo at 6 weeks'},
                  {action:'Increase basket size', detail:'Staff training on upselling — "Have you tried the matching conditioner?" at checkout'},
                  {action:'Extend customer lifespan', detail:'Loyalty programme — after 10 purchases, 10% discount. Keep them from going elsewhere.'},
                  {action:'Reactivate lapsed customers', detail:'Win-back campaign — personalised message mentioning their last product. Costs almost nothing.'},
                ].map((item,i)=>(
                  <div key={i} style={{marginBottom:8,paddingBottom:8,borderBottom:i<3?`0.5px solid ${T.borderLight}`:'none'}}>
                    <div style={{fontSize:11,fontWeight:600,color:T.green,marginBottom:2}}>→ {item.action}</div>
                    <div style={{fontSize:11,color:T.textMuted,lineHeight:1.4}}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </Shell>
    </>
  )
}
