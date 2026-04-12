import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const TRADE_TIERS = [
  { name:'Bronze', minOrder:100, discount:10, color:T.amber, perks:['10% off all products','Same-day collection from any branch','Priority restock notifications'] },
  { name:'Silver', minOrder:250, discount:15, color:'#9B9B9B', perks:['15% off all products','Free delivery on orders over £250','Monthly newsletter with new arrivals','Dedicated account contact'] },
  { name:'Gold', minOrder:500, discount:20, color:'#C9A84C', perks:['20% off all products','Free delivery on all orders','Early access to new stock','Personal account manager','Credit terms available'] },
]

const TARGET_FITTERS = [
  { type:'Hair extension fitters', count:'50+ in Leeds', opportunity:'Convert from rivals to customers', strategy:'Offer Bronze account — £100 min order, 10% discount. They save money, we gain revenue.' },
  { type:'Braiding salons', count:'30+ in Leeds', opportunity:'High-volume braiding hair buyers', strategy:'Monthly standing order for braiding hair. Offer Silver tier for guaranteed monthly minimum.' },
  { type:'Locticians', count:'20+ in Leeds', opportunity:'Specialist loc products and maintenance', strategy:'Stock specialist loc butters, gels and extensions for them wholesale.' },
  { type:'Mobile hair stylists', count:'100+ in Leeds', opportunity:'Product buyers who travel to clients', strategy:'Offer click-and-collect — they order online, collect from nearest branch.' },
  { type:'Beauty schools', count:'5-10 in Yorkshire', opportunity:'Training product bulk orders', strategy:'Supply mannequin heads, practice hair, tools and products for training courses.' },
  { type:'Barber shops', count:'200+ in Leeds', opportunity:'Crossover products — edge control, oils', strategy:'Target barbershops near our branches — they already buy products, just not from us.' },
]

export default function Trade() {
  const [tab, setTab] = useState('Overview')
  const [form, setForm] = useState({ name:'', business:'', phone:'', email:'', type:'', monthly:'' })
  const [submitted, setSubmitted] = useState(false)
  const [accounts, setAccounts] = useState([])

  const TABS = ['Overview', 'Trade Tiers', 'Target Businesses', 'Applications', 'Active Accounts']

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cc_trade_accounts')
      if (saved) setAccounts(JSON.parse(saved))
    } catch(e) {}
  }, [])

  function submitApplication() {
    if (!form.name || !form.business || !form.phone) return
    const newAccount = { ...form, id: Date.now(), status:'Pending', date: new Date().toLocaleDateString('en-GB'), tier:'Bronze' }
    const updated = [...accounts, newAccount]
    setAccounts(updated)
    try { localStorage.setItem('cc_trade_accounts', JSON.stringify(updated)) } catch(e) {}
    setSubmitted(true)
    setForm({ name:'', business:'', phone:'', email:'', type:'', monthly:'' })
  }

  function updateStatus(id, status) {
    const updated = accounts.map(a => a.id === id ? {...a, status} : a)
    setAccounts(updated)
    try { localStorage.setItem('cc_trade_accounts', JSON.stringify(updated)) } catch(e) {}
  }

  const statusColor = s => s==='Active'?T.green:s==='Pending'?T.amber:s==='Declined'?T.red:T.textMuted

  return (
    <>
      <Head><title>B2B Trade Portal — CC Intelligence</title></Head>
      <Shell title="B2B Trade Portal" subtitle="Turn local hair fitters and stylists from competitors into wholesale customers">

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
          {[
            {label:'Trade accounts', value:accounts.filter(a=>a.status==='Active').length, color:T.green},
            {label:'Pending applications', value:accounts.filter(a=>a.status==='Pending').length, color:T.amber},
            {label:'Target businesses', value:'200+', color:T.blue},
            {label:'Potential B2B revenue', value:'£5k-15k/mo', color:'#7c3aed'},
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
            }}>{t}{t==='Applications'&&accounts.filter(a=>a.status==='Pending').length>0?` (${accounts.filter(a=>a.status==='Pending').length})`:''}</button>
          ))}
        </div>

        {tab==='Overview' && (
          <div>
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:T.green,marginBottom:8}}>The opportunity</div>
              <div style={{fontSize:12,color:T.text,lineHeight:1.7}}>
                There are 200+ hair fitters, braiding salons, locticians and mobile stylists in Leeds. Right now they buy products from various suppliers — many from competitors. By offering trade accounts with bulk discounts, we turn them from competition into a distribution channel worth £5,000–£15,000/month in additional B2B wholesale revenue.
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Why fitters will say yes</div>
                {['Cheaper than buying retail — 10-20% discount','Same-day collection from 3 Leeds branches','No minimum order faff — just £100 minimum','Trusted supplier since 1979 — product quality guaranteed','23,000 products — one supplier for everything'].map((r,i)=>(
                  <div key={i} style={{fontSize:11,color:T.text,padding:'4px 0',borderBottom:i<4?`0.5px solid ${T.borderLight}`:'none'}}>✓ {r}</div>
                ))}
              </div>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>How to find them</div>
                {['Search "hair extensions Leeds" on Google — fitters appear in Maps','Instagram — search #LeedsHair #LeedsBraids #LeedsWigs','Facebook groups — Leeds hair, Leeds beauty groups','Ask your existing branch customers who does their hair','Look at your Shopify customers — some are likely fitters already'].map((r,i)=>(
                  <div key={i} style={{fontSize:11,color:T.text,padding:'4px 0',borderBottom:i<4?`0.5px solid ${T.borderLight}`:'none'}}>→ {r}</div>
                ))}
              </div>
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Outreach message template</div>
              <div style={{background:T.bg,borderRadius:6,padding:'12px',fontSize:11,color:T.text,lineHeight:1.7,marginBottom:8}}>
                Hi [Name], I'm from CC Hair & Beauty Leeds — we've been supplying the Leeds hair community since 1979 with 23,000+ products across 3 branches in Chapeltown, Roundhay and City Centre.{'\n\n'}
                We're launching a trade account programme for local hair professionals — you get 10-20% discount on all products, same-day collection from any branch, and first access to new stock.{'\n\n'}
                Would you be interested in setting up a trade account? There's a £100 minimum order and no sign-up fee. Happy to chat — just reply here or call us at [branch number].
              </div>
              <button onClick={()=>navigator.clipboard.writeText(`Hi [Name], I'm from CC Hair & Beauty Leeds — we've been supplying the Leeds hair community since 1979 with 23,000+ products across 3 branches in Chapeltown, Roundhay and City Centre.\n\nWe're launching a trade account programme for local hair professionals — you get 10-20% discount on all products, same-day collection from any branch, and first access to new stock.\n\nWould you be interested in setting up a trade account? There's a £100 minimum order and no sign-up fee. Happy to chat — just reply here or call us at [branch number].`)}
                style={{fontSize:11,padding:'6px 14px',background:T.blue,color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}}>
                Copy message
              </button>
            </div>
          </div>
        )}

        {tab==='Trade Tiers' && (
          <div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>Three tiers based on monthly order volume — the more they buy, the bigger the discount</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:14}}>
              {TRADE_TIERS.map((tier,i) => (
                <div key={i} style={{background:T.surface,border:`1px solid ${tier.color}40`,borderRadius:10,overflow:'hidden'}}>
                  <div style={{background:tier.color,padding:'16px',textAlign:'center'}}>
                    <div style={{fontSize:20,fontWeight:800,color:'#fff'}}>{tier.name}</div>
                    <div style={{fontSize:28,fontWeight:900,color:'#fff',marginTop:4}}>{tier.discount}% off</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.8)',marginTop:2}}>Min order £{tier.minOrder}/month</div>
                  </div>
                  <div style={{padding:'14px 16px'}}>
                    {tier.perks.map((perk,j) => (
                      <div key={j} style={{fontSize:11,color:T.text,padding:'5px 0',borderBottom:j<tier.perks.length-1?`0.5px solid ${T.borderLight}`:'none',display:'flex',gap:6}}>
                        <span style={{color:tier.color}}>✓</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>How tier upgrades work</div>
              <div style={{fontSize:11,color:T.textMuted,lineHeight:1.6}}>
                Tiers are reviewed monthly based on previous month's spending. A fitter spending £280 in March automatically moves to Silver in April. No admin needed — just check the total at end of each month and update their account here.
              </div>
            </div>
          </div>
        )}

        {tab==='Target Businesses' && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {TARGET_FITTERS.map((t,i) => (
              <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderLeft:`4px solid ${T.blue}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.text}}>{t.type}</div>
                  <span style={{fontSize:10,color:T.blue,fontWeight:600,background:T.blueBg,padding:'2px 8px',borderRadius:3}}>{t.count}</span>
                </div>
                <div style={{fontSize:11,color:T.green,marginBottom:4}}>Opportunity: {t.opportunity}</div>
                <div style={{fontSize:11,color:T.textMuted}}>Strategy: {t.strategy}</div>
              </div>
            ))}
          </div>
        )}

        {tab==='Applications' && (
          <div>
            {/* New application form */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:12}}>Add new trade account application</div>
              {submitted && (
                <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:6,padding:'8px 12px',marginBottom:10,fontSize:11,color:T.green}}>
                  ✓ Application saved — review in Active Accounts tab
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                {[
                  {key:'name',label:'Contact name',placeholder:'e.g. Sarah Johnson'},
                  {key:'business',label:'Business name',placeholder:'e.g. Sarahs Hair Studio'},
                  {key:'phone',label:'Phone number',placeholder:'e.g. 07700 000000'},
                  {key:'email',label:'Email',placeholder:'e.g. sarah@example.com'},
                  {key:'type',label:'Business type',placeholder:'e.g. Hair fitter, Braiding salon'},
                  {key:'monthly',label:'Est. monthly spend',placeholder:'e.g. £200'},
                ].map(f => (
                  <div key={f.key}>
                    <div style={{fontSize:11,fontWeight:600,color:T.text,marginBottom:4}}>{f.label}</div>
                    <input value={form[f.key]} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))}
                      placeholder={f.placeholder}
                      style={{width:'100%',padding:'7px 10px',fontSize:12,border:`1px solid ${T.border}`,borderRadius:6,background:T.bg,color:T.text,boxSizing:'border-box'}}/>
                  </div>
                ))}
              </div>
              <button onClick={submitApplication} disabled={!form.name||!form.business||!form.phone}
                style={{padding:'8px 20px',fontSize:12,fontWeight:700,background:form.name&&form.business&&form.phone?T.green:'#d0d7de',color:'#fff',border:'none',borderRadius:7,cursor:'pointer'}}>
                Save Application →
              </button>
            </div>

            {/* Pending applications */}
            {accounts.filter(a=>a.status==='Pending').length > 0 && (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <div style={{padding:'10px 14px',background:T.bg,borderBottom:`0.5px solid ${T.border}`,fontSize:12,fontWeight:600,color:T.text}}>
                  Pending applications — {accounts.filter(a=>a.status==='Pending').length}
                </div>
                {accounts.filter(a=>a.status==='Pending').map((acc,i) => (
                  <div key={acc.id} style={{padding:'12px 14px',borderBottom:`0.5px solid ${T.borderLight}`,display:'flex',alignItems:'center',gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>{acc.name} — {acc.business}</div>
                      <div style={{fontSize:10,color:T.textMuted}}>{acc.type} · {acc.phone} · Applied {acc.date}</div>
                    </div>
                    <div style={{display:'flex',gap:5}}>
                      <button onClick={()=>updateStatus(acc.id,'Active')} style={{fontSize:10,padding:'4px 10px',background:T.green,color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Approve</button>
                      <button onClick={()=>updateStatus(acc.id,'Declined')} style={{fontSize:10,padding:'4px 10px',background:T.red,color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==='Active Accounts' && (
          <div>
            {accounts.filter(a=>a.status==='Active').length === 0 ? (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:48,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>🏪</div>
                <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:6}}>No active trade accounts yet</div>
                <div style={{fontSize:12,color:T.textMuted}}>Add applications in the Applications tab and approve them to see active accounts here</div>
              </div>
            ) : (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:T.bg}}>
                    {['Business','Contact','Type','Tier','Monthly est.','Status','Action'].map(h=>(
                      <th key={h} style={{padding:'8px 12px',fontSize:10,fontWeight:600,color:T.textMuted,textTransform:'uppercase',textAlign:'left',borderBottom:`0.5px solid ${T.border}`}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {accounts.filter(a=>a.status==='Active').map((acc,i)=>(
                      <tr key={acc.id} style={{background:i%2===0?T.surface:T.bg}}>
                        <td style={{padding:'8px 12px',fontSize:12,fontWeight:600,color:T.text,borderBottom:`0.5px solid ${T.borderLight}`}}>{acc.business}</td>
                        <td style={{padding:'8px 12px',fontSize:11,color:T.textMuted,borderBottom:`0.5px solid ${T.borderLight}`}}>{acc.name}</td>
                        <td style={{padding:'8px 12px',fontSize:11,color:T.textMuted,borderBottom:`0.5px solid ${T.borderLight}`}}>{acc.type}</td>
                        <td style={{padding:'8px 12px',fontSize:11,fontWeight:700,color:T.amber,borderBottom:`0.5px solid ${T.borderLight}`}}>{acc.tier}</td>
                        <td style={{padding:'8px 12px',fontSize:11,color:T.green,borderBottom:`0.5px solid ${T.borderLight}`}}>{acc.monthly}</td>
                        <td style={{padding:'8px 12px',borderBottom:`0.5px solid ${T.borderLight}`}}>
                          <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:3,background:statusColor(acc.status)+'20',color:statusColor(acc.status)}}>{acc.status}</span>
                        </td>
                        <td style={{padding:'8px 12px',borderBottom:`0.5px solid ${T.borderLight}`}}>
                          {acc.phone && (
                            <a href={`https://wa.me/${acc.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${acc.name.split(' ')[0]}, this is CC Hair & Beauty Leeds. Just checking in on your trade account — anything you need restocking?`)}`}
                              target="_blank" rel="noreferrer"
                              style={{fontSize:10,color:'#fff',background:'#25D366',padding:'3px 8px',borderRadius:4,textDecoration:'none'}}>WhatsApp</a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </Shell>
    </>
  )
}
