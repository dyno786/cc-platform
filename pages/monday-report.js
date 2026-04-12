import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

export default function MondayReport() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lastGenerated, setLastGenerated] = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cc_monday_report')
      const date = localStorage.getItem('cc_monday_report_date')
      if (saved) setReport(JSON.parse(saved))
      if (date) setLastGenerated(new Date(date))
    } catch(e) {}
  }, [])

  async function generateReport() {
    setLoading(true)
    try {
      const [shopify, sc, ads] = await Promise.all([
        fetch('/api/live-data?source=shopify').then(r => r.json()),
        fetch('/api/live-data?source=searchconsole').then(r => r.json()),
        Promise.resolve(JSON.parse(localStorage.getItem('cc_ads_analysis') || 'null')),
      ])

      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - 7)

      const generatedReport = {
        date: now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
        period: `${weekStart.toLocaleDateString('en-GB', {day:'numeric',month:'short'})} – ${now.toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}`,
        revenue: {
          week: shopify.week?.formatted || '£0',
          month: shopify.month?.formatted || '£0',
          orders: shopify.week?.orders || 0,
          avgOrder: shopify.week?.orders > 0 ? `£${Math.round((shopify.week?.revenue||0)/shopify.week.orders)}` : '£0',
          abandoned: shopify.abandonedCount || 0,
          abandonedValue: `£${shopify.abandonedValue || 0}`,
        },
        seo: {
          clicks: sc.totals?.clicks?.toLocaleString() || '0',
          impressions: sc.totals?.impressions?.toLocaleString() || '0',
          avgPosition: sc.totals?.avgPosition || '—',
          topKeyword: sc.keywords?.[0]?.query || '—',
          quickWins: (sc.quickWins || []).slice(0,3).map(k => k.query),
        },
        ads: {
          spend: ads?.totalSpend || '—',
          conversions: ads?.totalConversions || '—',
          roas: ads?.overallRoas || '—',
          biggestWaste: ads?.biggestWaste || '—',
          scaleOpp: ads?.scaleOpportunity || '—',
          lastAudit: localStorage.getItem('cc_ads_analysis_date') ? new Date(localStorage.getItem('cc_ads_analysis_date')).toLocaleDateString('en-GB') : '—',
        },
        priorities: [
          shopify.abandonedCount > 0 ? `Chase ${shopify.abandonedCount} abandoned carts — £${shopify.abandonedValue || 0} at risk` : null,
          ads?.biggestWaste ? `Fix biggest ad waste: ${ads.biggestWaste}` : null,
          (sc.quickWins||[]).length > 0 ? `SEO quick win: optimise "${sc.quickWins[0]?.query}" (pos ${sc.quickWins[0]?.position})` : null,
          'Publish 1 blog post this week',
          'Post 3x on social media — 1 per branch',
          'Respond to all GBP reviews across all 3 branches',
        ].filter(Boolean).slice(0,6),
      }

      setReport(generatedReport)
      setLastGenerated(now)
      localStorage.setItem('cc_monday_report', JSON.stringify(generatedReport))
      localStorage.setItem('cc_monday_report_date', now.toISOString())
    } catch(e) {
      console.error('Report error:', e)
    }
    setLoading(false)
  }

  function getEmailText() {
    if (!report) return ''
    return `CC HAIR & BEAUTY — WEEKLY REPORT
${report.date}
Period: ${report.period}

REVENUE
Week: ${report.revenue.week} (${report.revenue.orders} orders)
Month to date: ${report.revenue.month}
Average order: ${report.revenue.avgOrder}
Abandoned carts: ${report.revenue.abandoned} (${report.revenue.abandonedValue} at risk)

SEO PERFORMANCE
Google clicks (90 days): ${report.seo.clicks}
Impressions: ${report.seo.impressions}
Average position: ${report.seo.avgPosition}
Top keyword: ${report.seo.topKeyword}
SEO quick wins: ${report.seo.quickWins.join(', ')}

GOOGLE ADS (last audit: ${report.ads.lastAudit})
Total spend: ${report.ads.spend}
Conversions: ${report.ads.conversions}
ROAS: ${report.ads.roas}
Biggest waste: ${report.ads.biggestWaste}
Scale opportunity: ${report.ads.scaleOpp}

THIS WEEK'S PRIORITIES
${report.priorities.map((p,i) => `${i+1}. ${p}`).join('\n')}

CC Hair & Beauty Intelligence Platform
Chapeltown LS7 · Roundhay LS8 · Leeds City Centre`
  }

  function copyReport() {
    navigator.clipboard.writeText(getEmailText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Head><title>Monday Report — CC Intelligence</title></Head>
      <Shell title="Monday Morning Report" subtitle="Weekly summary of revenue, SEO, ads and priorities — generate and share every Monday">

        {/* Generate button */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:2}}>Generate this week's report</div>
            <div style={{fontSize:11,color:T.textMuted}}>
              {lastGenerated ? `Last generated: ${lastGenerated.toLocaleString('en-GB')}` : 'Pull live data from Shopify, Search Console and your last Ads audit'}
            </div>
          </div>
          <button onClick={generateReport} disabled={loading} style={{
            padding:'10px 20px',fontSize:13,fontWeight:700,
            background:loading?T.border:T.green,color:'#fff',
            border:'none',borderRadius:8,cursor:loading?'not-allowed':'pointer',whiteSpace:'nowrap',
          }}>
            {loading ? 'Generating...' : 'Generate Report →'}
          </button>
          {report && (
            <button onClick={copyReport} style={{
              padding:'10px 16px',fontSize:12,fontWeight:700,
              background:copied?T.green:T.blue,color:'#fff',
              border:'none',borderRadius:8,cursor:'pointer',whiteSpace:'nowrap',
            }}>
              {copied ? '✓ Copied!' : 'Copy to share'}
            </button>
          )}
        </div>

        {report && (
          <div>
            {/* Report header */}
            <div style={{background:T.greenBg,border:`0.5px solid ${T.greenBorder}`,borderRadius:8,padding:'12px 16px',marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.green}}>Weekly Report — {report.date}</div>
                <div style={{fontSize:11,color:T.textMuted}}>Period: {report.period}</div>
              </div>
              <div style={{fontSize:10,color:T.green}}>✓ Live data</div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
              {/* Revenue */}
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:10,paddingBottom:6,borderBottom:`0.5px solid ${T.border}`}}>💰 Revenue</div>
                {[
                  {label:'This week', value:report.revenue.week, color:T.green},
                  {label:'Month to date', value:report.revenue.month, color:T.blue},
                  {label:'Orders', value:report.revenue.orders, color:T.text},
                  {label:'Avg order', value:report.revenue.avgOrder, color:T.text},
                  {label:'Abandoned carts', value:`${report.revenue.abandoned} (${report.revenue.abandonedValue})`, color:T.red},
                ].map((r,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:i<4?`0.5px solid ${T.borderLight}`:'none'}}>
                    <span style={{fontSize:11,color:T.textMuted}}>{r.label}</span>
                    <span style={{fontSize:11,fontWeight:600,color:r.color}}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* SEO */}
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:10,paddingBottom:6,borderBottom:`0.5px solid ${T.border}`}}>🔍 SEO (90 days)</div>
                {[
                  {label:'Google clicks', value:report.seo.clicks, color:T.blue},
                  {label:'Impressions', value:report.seo.impressions, color:T.textMuted},
                  {label:'Avg position', value:report.seo.avgPosition, color:T.text},
                  {label:'Top keyword', value:report.seo.topKeyword, color:T.text},
                ].map((r,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:i<3?`0.5px solid ${T.borderLight}`:'none'}}>
                    <span style={{fontSize:11,color:T.textMuted}}>{r.label}</span>
                    <span style={{fontSize:11,fontWeight:600,color:r.color,maxWidth:120,textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.value}</span>
                  </div>
                ))}
                {report.seo.quickWins.length > 0 && (
                  <div style={{marginTop:6,paddingTop:6,borderTop:`0.5px solid ${T.borderLight}`}}>
                    <div style={{fontSize:10,color:T.textMuted,marginBottom:3}}>Quick wins to fix:</div>
                    {report.seo.quickWins.map((k,i)=>(
                      <div key={i} style={{fontSize:10,color:T.amber}}>→ {k}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ads */}
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:10,paddingBottom:6,borderBottom:`0.5px solid ${T.border}`}}>📊 Google Ads</div>
                {[
                  {label:'Total spend', value:report.ads.spend, color:T.blue},
                  {label:'Conversions', value:report.ads.conversions, color:T.green},
                  {label:'ROAS', value:report.ads.roas, color:T.text},
                  {label:'Last audit', value:report.ads.lastAudit, color:T.textMuted},
                ].map((r,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:i<3?`0.5px solid ${T.borderLight}`:'none'}}>
                    <span style={{fontSize:11,color:T.textMuted}}>{r.label}</span>
                    <span style={{fontSize:11,fontWeight:600,color:r.color}}>{r.value}</span>
                  </div>
                ))}
                <div style={{marginTop:6,paddingTop:6,borderTop:`0.5px solid ${T.borderLight}`}}>
                  <div style={{fontSize:10,color:T.red,marginBottom:2}}>Waste: {report.ads.biggestWaste?.slice(0,50)}</div>
                  <div style={{fontSize:10,color:T.green}}>Scale: {report.ads.scaleOpp?.slice(0,50)}</div>
                </div>
              </div>
            </div>

            {/* Priorities */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>This week's priorities</div>
              {report.priorities.map((p,i)=>(
                <div key={i} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:i<report.priorities.length-1?`0.5px solid ${T.borderLight}`:'none'}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:i===0?T.red:i<3?T.amber:T.blue,color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:12,color:T.text,lineHeight:1.5}}>{p}</div>
                </div>
              ))}
            </div>

            {/* Raw text preview */}
            <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,overflow:'hidden'}}>
              <div style={{padding:'10px 14px',background:T.bg,borderBottom:`0.5px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:12,fontWeight:600,color:T.text}}>Plain text — paste into WhatsApp or email</span>
                <button onClick={copyReport} style={{fontSize:11,padding:'4px 12px',background:copied?T.green:T.blue,color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}}>
                  {copied?'Copied!':'Copy all'}
                </button>
              </div>
              <pre style={{padding:'12px 14px',fontSize:11,color:T.textMuted,lineHeight:1.6,whiteSpace:'pre-wrap',margin:0,background:T.bg,fontFamily:'monospace'}}>
                {getEmailText()}
              </pre>
            </div>
          </div>
        )}

        {!report && !loading && (
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:60,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:16}}>📋</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:6}}>Generate your Monday morning report</div>
            <div style={{fontSize:12,color:T.textMuted,maxWidth:400,margin:'0 auto'}}>
              Every Monday, click Generate Report to pull the latest data from Shopify, Search Console and your Google Ads audit. Share it with your team via WhatsApp or email.
            </div>
          </div>
        )}

      </Shell>
    </>
  )
}
