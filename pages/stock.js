import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const ROUND_IP = '192.168.1.12'
const DB = 'ITSDryStock'

export default function Stock() {
  const [tab, setTab] = useState('Alerts')
  const [stockData, setStockData] = useState([])
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [lastSync, setLastSync] = useState(null)
  const TABS = ['Alerts','Best Sellers','Reorder Guide','Suppliers']

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cc_stock_alerts')
      const sync = localStorage.getItem('cc_stock_sync')
      if (saved) setAlerts(JSON.parse(saved))
      if (sync) setLastSync(new Date(sync))
    } catch(e) {}
  }, [])

  async function loadStock() {
    setLoading(true)
    try {
      const r = await fetch(`http://${ROUND_IP}:3002/api/stock/low?threshold=5`)
      const d = await r.json()
      if (d.items) {
        setAlerts(d.items)
        setLastSync(new Date())
        localStorage.setItem('cc_stock_alerts', JSON.stringify(d.items))
        localStorage.setItem('cc_stock_sync', new Date().toISOString())
      }
    } catch(e) {
      // Show manual entry mode if SQL not accessible
      console.log('SQL not accessible from browser — use manual mode')
    }
    setLoading(false)
  }

  // Manual stock alert entry
  const [manualItem, setManualItem] = useState({ product:'', qty:'', branch:'', supplier:'' })
  const [manualAlerts, setManualAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_manual_stock') || '[]') } catch(e) { return [] }
  })

  function addManualAlert() {
    if (!manualItem.product) return
    const newAlert = { ...manualItem, id: Date.now(), date: new Date().toLocaleDateString('en-GB'), resolved: false }
    const updated = [newAlert, ...manualAlerts]
    setManualAlerts(updated)
    localStorage.setItem('cc_manual_stock', JSON.stringify(updated))
    setManualItem({ product:'', qty:'', branch:'', supplier:'' })
  }

  function resolveAlert(id) {
    const updated = manualAlerts.map(a => a.id === id ? {...a, resolved: true} : a)
    setManualAlerts(updated)
    localStorage.setItem('cc_manual_stock', JSON.stringify(updated))
  }

  const BEST_SELLERS = [
    { product:'ORS Olive Oil Relaxer — Super', category:'Relaxers', monthly:45, reorderQty:24, supplier:'Beauty Star', leadDays:2 },
    { product:'Dark & Lovely Relaxer — Regular', category:'Relaxers', monthly:38, reorderQty:24, supplier:'Beauty Star', leadDays:2 },
    { product:'Cantu Shea Butter Leave-In', category:'Natural Hair', monthly:52, reorderQty:36, supplier:'Beauty Star', leadDays:2 },
    { product:'Eco Styler Argan Oil Gel 946ml', category:'Styling', monthly:41, reorderQty:24, supplier:'Janson', leadDays:3 },
    { product:'X-Pression Braiding Hair — 1B', category:'Braiding Hair', monthly:89, reorderQty:48, supplier:'Sherry\'s', leadDays:1 },
    { product:'Sensationnel Braiding Hair', category:'Braiding Hair', monthly:76, reorderQty:48, supplier:'Sherry\'s', leadDays:1 },
    { product:'Freetress Water Wave', category:'Crochet Hair', monthly:34, reorderQty:24, supplier:'Sherry\'s', leadDays:1 },
    { product:'Murray\'s Edge Wax', category:'Edge Control', monthly:62, reorderQty:36, supplier:'Janson', leadDays:3 },
    { product:'Ebin 24hr Edge Tamer', category:'Edge Control', monthly:48, reorderQty:24, supplier:'Beauty Star', leadDays:2 },
    { product:'Shea Moisture Curl Enhancing Smoothie', category:'Natural Hair', monthly:39, reorderQty:24, supplier:'Beauty Star', leadDays:2 },
  ]

  const SUPPLIERS = [
    { name:'Beauty Star', id:'Supplier 37', phone:'', email:'', leadDays:2, minOrder:'£500', products:'Relaxers, natural hair, edge control, treatments', notes:'Primary supplier — best range for afro hair' },
    { name:"Sherry's", id:'Supplier 35', phone:'', email:'', leadDays:1, minOrder:'£300', products:'Braiding hair, crochet hair, weaves', notes:'Best prices on braiding hair — always check here first' },
    { name:'Janson', id:'Supplier 51', phone:'', email:'', leadDays:3, minOrder:'£400', products:'Styling products, tools, accessories', notes:'Good for styling products and salon supplies' },
  ]

  return (
    <>
      <Head><title>Stock Alerts — CC Intelligence</title></Head>
      <Shell title="Stock & Inventory" subtitle="Low stock alerts, best sellers, reorder guide and supplier contacts">

        {/* Sync status */}
        <div style={{display:'flex',alignItems:'center',gap:10,background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'10px 14px',marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:T.text}}>Stock system connection</div>
            <div style={{fontSize:10,color:T.textMuted}}>
              {lastSync ? `Last synced: ${lastSync.toLocaleString('en-GB')}` : `Connects to ITSDryStock on ${ROUND_IP}:3002 — must be on Roundhay branch network`}
            </div>
          </div>
          <button onClick={loadStock} disabled={loading} style={{
            padding:'7px 14px',fontSize:11,fontWeight:700,
            background:loading?T.border:T.blue,color:'#fff',
            border:'none',borderRadius:6,cursor:'pointer',whiteSpace:'nowrap',
          }}>
            {loading?'Syncing...':'Sync Stock Data →'}
          </button>
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

        {tab==='Alerts' && (
          <div>
            {/* Manual alert entry */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Log a low stock alert manually</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:8}}>
                {[
                  {key:'product',placeholder:'Product name',label:'Product'},
                  {key:'qty',placeholder:'Qty left',label:'Qty'},
                  {key:'branch',placeholder:'Which branch',label:'Branch'},
                  {key:'supplier',placeholder:'Beauty Star / Sherrys / Janson',label:'Supplier'},
                ].map(f=>(
                  <div key={f.key}>
                    <div style={{fontSize:10,color:T.textMuted,marginBottom:3}}>{f.label}</div>
                    <input value={manualItem[f.key]} onChange={e=>setManualItem(p=>({...p,[f.key]:e.target.value}))}
                      placeholder={f.placeholder}
                      style={{width:'100%',padding:'6px 8px',fontSize:11,border:`1px solid ${T.border}`,borderRadius:5,background:T.bg,color:T.text,boxSizing:'border-box'}}/>
                  </div>
                ))}
              </div>
              <button onClick={addManualAlert} disabled={!manualItem.product}
                style={{fontSize:11,padding:'6px 14px',background:manualItem.product?T.red:'#d0d7de',color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}}>
                Log Alert →
              </button>
            </div>

            {/* Active alerts */}
            {manualAlerts.filter(a=>!a.resolved).length > 0 ? (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden',marginBottom:12}}>
                <div style={{padding:'10px 14px',background:'#fff0f0',borderBottom:`0.5px solid ${T.border}`,fontSize:12,fontWeight:700,color:T.red}}>
                  🚨 Low stock alerts — {manualAlerts.filter(a=>!a.resolved).length} items
                </div>
                {manualAlerts.filter(a=>!a.resolved).map((alert,i)=>(
                  <div key={alert.id} style={{padding:'10px 14px',borderBottom:`0.5px solid ${T.borderLight}`,display:'flex',alignItems:'center',gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>{alert.product}</div>
                      <div style={{fontSize:10,color:T.textMuted}}>{alert.branch} · Qty: {alert.qty} · {alert.supplier} · {alert.date}</div>
                    </div>
                    <button onClick={()=>resolveAlert(alert.id)}
                      style={{fontSize:10,padding:'3px 10px',background:T.green,color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>
                      ✓ Resolved
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'14px',textAlign:'center',marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:600,color:T.green}}>✓ No active stock alerts</div>
              </div>
            )}

            {/* Resolved alerts */}
            {manualAlerts.filter(a=>a.resolved).length > 0 && (
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
                <div style={{padding:'10px 14px',background:T.bg,borderBottom:`0.5px solid ${T.border}`,fontSize:11,fontWeight:600,color:T.textMuted}}>
                  Resolved alerts — {manualAlerts.filter(a=>a.resolved).length}
                </div>
                {manualAlerts.filter(a=>a.resolved).map((alert,i)=>(
                  <div key={alert.id} style={{padding:'8px 14px',borderBottom:`0.5px solid ${T.borderLight}`,opacity:0.6,display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:11,color:T.textMuted,textDecoration:'line-through'}}>{alert.product}</span>
                    <span style={{fontSize:10,color:T.green}}>✓ Resolved</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==='Best Sellers' && (
          <div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>Top 10 products by estimated monthly unit sales — never let these run out</div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:T.bg}}>
                  {['Product','Category','Monthly Sales','Reorder Qty','Supplier','Lead Time'].map(h=>(
                    <th key={h} style={{padding:'8px 12px',fontSize:10,fontWeight:600,color:T.textMuted,textTransform:'uppercase',textAlign:'left',borderBottom:`0.5px solid ${T.border}`,whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {BEST_SELLERS.map((p,i)=>(
                    <tr key={i} style={{background:i%2===0?T.surface:T.bg}}>
                      <td style={{padding:'8px 12px',fontSize:12,fontWeight:600,color:T.text,borderBottom:`0.5px solid ${T.borderLight}`}}>{p.product}</td>
                      <td style={{padding:'8px 12px',fontSize:11,color:T.textMuted,borderBottom:`0.5px solid ${T.borderLight}`}}>{p.category}</td>
                      <td style={{padding:'8px 12px',fontSize:12,fontWeight:700,color:T.green,borderBottom:`0.5px solid ${T.borderLight}`}}>{p.monthly} units</td>
                      <td style={{padding:'8px 12px',fontSize:11,color:T.blue,borderBottom:`0.5px solid ${T.borderLight}`}}>{p.reorderQty} units</td>
                      <td style={{padding:'8px 12px',fontSize:11,color:T.textMuted,borderBottom:`0.5px solid ${T.borderLight}`}}>{p.supplier}</td>
                      <td style={{padding:'8px 12px',fontSize:11,color:p.leadDays<=1?T.green:p.leadDays<=2?T.amber:T.red,fontWeight:600,borderBottom:`0.5px solid ${T.borderLight}`}}>{p.leadDays} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='Reorder Guide' && (
          <div>
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>When to reorder — by product category</div>
              {[
                {category:'Relaxers',threshold:'Under 12 units per branch',frequency:'Every 3-4 weeks',note:'Predictable demand — order before Leeds Carnival, Eid and Christmas'},
                {category:'Braiding Hair',threshold:'Under 20 packs per branch',frequency:'Every 1-2 weeks',note:'High turnover — Sherry\'s has 1-day lead time so can order more frequently'},
                {category:'Edge Control',threshold:'Under 15 units per branch',frequency:'Every 3 weeks',note:'Daily use product — consistent demand year round'},
                {category:'Natural Hair Products',threshold:'Under 10 units per SKU',frequency:'Monthly',note:'Wider range — focus on top 20 SKUs first'},
                {category:'Wigs & Extensions',threshold:'Under 5 units per style',frequency:'Monthly',note:'Higher value — check trends before reordering seasonal styles'},
                {category:'Crochet & Braiding Hair',threshold:'Under 24 packs',frequency:'Weekly in summer',note:'Peaks at Leeds Carnival — stock 3x normal quantity in July/August'},
              ].map((r,i)=>(
                <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 2fr',gap:10,padding:'8px 0',borderBottom:i<5?`0.5px solid ${T.borderLight}`:'none',alignItems:'start'}}>
                  <div style={{fontSize:11,fontWeight:700,color:T.text}}>{r.category}</div>
                  <div style={{fontSize:11,color:T.red}}>{r.threshold}</div>
                  <div style={{fontSize:11,color:T.blue}}>{r.frequency}</div>
                  <div style={{fontSize:10,color:T.textMuted}}>{r.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='Suppliers' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {SUPPLIERS.map((s,i)=>(
              <div key={i} style={{background:T.surface,border:`0.5px solid ${T.border}`,borderLeft:`4px solid ${T.blue}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:T.text}}>{s.name}</div>
                    <div style={{fontSize:10,color:T.textMuted}}>System ID: {s.id} · Lead time: {s.leadDays} days · Min order: {s.minOrder}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}><strong style={{color:T.text}}>Products:</strong> {s.products}</div>
                <div style={{fontSize:11,color:T.green}}><strong style={{color:T.text}}>Note:</strong> {s.notes}</div>
              </div>
            ))}
          </div>
        )}

      </Shell>
    </>
  )
}
