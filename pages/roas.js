import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

export default function RoasCalculator() {
  const [shopifyRevenue, setShopifyRevenue] = useState(null)
  const [adsData, setAdsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [manualSpend, setManualSpend] = useState('')
  const [manualRevenue, setManualRevenue] = useState('')
  const [tab, setTab] = useState('Calculator')

  useEffect(() => {
    async function load() {
      try {
        const [shopify, ads] = await Promise.all([
          fetch('/api/live-data?source=shopify').then(r => r.json()),
          Promise.resolve(JSON.parse(localStorage.getItem('cc_ads_analysis') || 'null')),
        ])
        setShopifyRevenue(shopify)
        setAdsData(ads)
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

  const totalSpend = parseFloat((adsData?.totalSpend || manualSpend || '0').replace(/[£,]/g, '')) || 0
  const totalRevenue = parseFloat((shopifyRevenue?.month?.revenue || manualRevenue || '0').toString().replace(/[£,]/g, '')) || 0
  const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : 0
  const roasColor = roas >= 4 ? T.green : roas >= 2.5 ? T.amber : T.red
  const roasStatus = roas >= 4 ? 'Excellent' : roas >= 3 ? 'Good — above target' : roas >= 2 ? 'Below target (3x)' : roas >= 1 ? 'Poor — losing money' : 'No data'

  const breakEven = totalSpend > 0 ? totalSpend.toFixed(2) : 0
  const profit = totalRevenue - totalSpend
  const targetRevenue = totalSpend * 3
  const revenueGap = Math.max(0, targetRevenue - totalRevenue)

  // Campaign level ROAS from ads data
  const campaigns = adsData?.campaigns || []

  return (
    <>
      <Head><title>ROAS Calculator — CC Intelligence</title></Head>
      <Shell title="ROAS Calculator" subtitle="Connect your Shopify revenue to your Google Ads spend — see true return on ad spend">

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.border}`, marginBottom: 14 }}>
          {['Calculator', 'Campaign ROAS', 'Targets', 'Improve ROAS'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', fontSize: 12, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? T.blue : T.textMuted, background: 'none', border: 'none',
              borderBottom: tab === t ? `2px solid ${T.blue}` : '2px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{t}</button>
          ))}
        </div>

        {tab === 'Calculator' && (
          <div>
            {/* Data sources */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {/* Shopify revenue */}
              <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Shopify Revenue (this month)</div>
                {shopifyRevenue?.month ? (
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: T.green, marginBottom: 4 }}>{shopifyRevenue.month.formatted || '£0'}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{shopifyRevenue.month.orders || 0} orders · Live from Shopify API</div>
                    <div style={{ fontSize: 10, color: T.green, marginTop: 4 }}>✓ Auto-loaded from Shopify</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>Enter manually if Shopify data not loading</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: T.text }}>£</span>
                      <input value={manualRevenue} onChange={e => setManualRevenue(e.target.value)}
                        placeholder="e.g. 12500"
                        style={{ flex: 1, padding: '8px 10px', fontSize: 14, border: `1px solid ${T.border}`, borderRadius: 6, background: T.bg, color: T.text }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Ads spend */}
              <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Google Ads Spend (this month)</div>
                {adsData?.totalSpend ? (
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: T.blue, marginBottom: 4 }}>{adsData.totalSpend}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>From your last audit · {new Date(localStorage.getItem('cc_ads_analysis_date') || '').toLocaleDateString('en-GB')}</div>
                    <div style={{ fontSize: 10, color: T.blue, marginTop: 4 }}>✓ Loaded from Google Ads audit</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>Upload Google Ads CSV or enter manually</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: T.text }}>£</span>
                      <input value={manualSpend} onChange={e => setManualSpend(e.target.value)}
                        placeholder="e.g. 2814"
                        style={{ flex: 1, padding: '8px 10px', fontSize: 14, border: `1px solid ${T.border}`, borderRadius: 6, background: T.bg, color: T.text }} />
                    </div>
                    <a href="/data-upload" style={{ fontSize: 10, color: T.blue, textDecoration: 'none', fontWeight: 700 }}>Upload Google Ads CSV →</a>
                  </div>
                )}
              </div>
            </div>

            {/* ROAS result */}
            {(totalSpend > 0 || totalRevenue > 0) && (
              <div>
                <div style={{ background: T.surface, border: `1px solid ${roasColor}40`, borderRadius: 10, padding: '24px', marginBottom: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Overall ROAS</div>
                  <div style={{ fontSize: 56, fontWeight: 900, color: roasColor, lineHeight: 1, marginBottom: 8 }}>{roas}x</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: roasColor }}>{roasStatus}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>For every £1 spent on ads, you get £{roas} back in revenue</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
                  {[
                    { label: 'Revenue', value: `£${totalRevenue.toLocaleString('en-GB', {minimumFractionDigits:0,maximumFractionDigits:0})}`, color: T.green },
                    { label: 'Ad Spend', value: `£${totalSpend.toLocaleString('en-GB', {minimumFractionDigits:0,maximumFractionDigits:0})}`, color: T.blue },
                    { label: 'Gross from ads', value: `£${profit.toLocaleString('en-GB', {minimumFractionDigits:0,maximumFractionDigits:0})}`, color: profit >= 0 ? T.green : T.red },
                    { label: 'Gap to 3x ROAS', value: revenueGap > 0 ? `£${revenueGap.toLocaleString('en-GB', {minimumFractionDigits:0,maximumFractionDigits:0})} more revenue needed` : '✓ Above 3x target', color: revenueGap > 0 ? T.amber : T.green },
                  ].map((m, i) => (
                    <div key={i} style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {roas < 3 && (
                  <div style={{ background: T.amberBg, border: `0.5px solid ${T.amberBorder}`, borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.amber, marginBottom: 6 }}>Below 3x ROAS target — here's what to do</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        'Pause Shopify All Products (0.74% conversion) — save £64/day',
                        'Reduce All By Brands to £50/day — currently £150/day at 0.81% conv',
                        'Scale Hair City Visitors to £15/day — 16.67% conversion rate',
                        'Add 10+ negative keywords from search terms report',
                        'Fix 14% disapproved products in Merchant Center',
                        'Improve landing pages — ensure collection pages load fast',
                      ].map((action, i) => (
                        <div key={i} style={{ fontSize: 11, color: T.text, display: 'flex', gap: 6 }}>
                          <span style={{ color: T.amber, flexShrink: 0 }}>→</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {totalSpend === 0 && totalRevenue === 0 && (
              <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>Enter your spend and revenue</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>Upload your Google Ads CSV and Shopify revenue will load automatically</div>
              </div>
            )}
          </div>
        )}

        {tab === 'Campaign ROAS' && (
          <div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>
              ROAS per campaign from your last audit. {campaigns.length === 0 ? 'Upload your Google Ads CSV to see campaign-level data.' : ''}
            </div>
            {campaigns.length === 0 ? (
              <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: T.text, marginBottom: 12 }}>Example campaign ROAS breakdown — upload your data to see real figures</div>
                {[
                  { name: 'Hair City Visitors (Search)', spend: '£19.73', conv: '3', roas: 'N/A*', action: 'Scale', daily: '£10/day → increase to £15/day' },
                  { name: 'All By Brands (Shopping)', spend: '£1,447', conv: '107', roas: 'N/A*', action: 'Reduce', daily: '£150/day → reduce to £50/day' },
                  { name: 'Shopify All Products (Shopping)', spend: '£1,347', conv: '78', roas: 'N/A*', action: 'Pause', daily: '£64/day → pause or reduce to £20/day' },
                ].map((c, i) => {
                  const ac = c.action === 'Scale' ? T.green : c.action === 'Pause' ? T.red : T.amber
                  return (
                    <div key={i} style={{ padding: '10px 0', borderBottom: i < 2 ? `0.5px solid ${T.borderLight}` : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{c.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: ac + '20', color: ac }}>{c.action}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: T.textMuted }}>
                        <span>Spend: <strong style={{ color: T.blue }}>{c.spend}</strong></span>
                        <span>Conv: <strong style={{ color: T.green }}>{c.conv}</strong></span>
                        <span>ROAS: <strong>{c.roas}</strong></span>
                      </div>
                      <div style={{ fontSize: 10, color: T.green, marginTop: 3 }}>→ {c.daily}</div>
                    </div>
                  )
                })}
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 8 }}>* ROAS cannot be calculated without revenue values in the CSV. Add conversion values in Google Ads → Tools → Conversions to get true ROAS.</div>
              </div>
            ) : (
              <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: T.bg }}>
                    {['Campaign', 'Spend', 'Conversions', 'ROAS', 'Daily Budget Rec.', 'Action'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', textAlign: 'left', borderBottom: `0.5px solid ${T.border}` }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {campaigns.map((c, i) => {
                      const ac = c.action === 'Scale' ? T.green : c.action === 'Pause' ? T.red : c.action === 'Reduce' ? T.amber : T.blue
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? T.surface : T.bg }}>
                          <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: T.text, borderBottom: `0.5px solid ${T.borderLight}` }}>{c.name}</td>
                          <td style={{ padding: '8px 12px', fontSize: 11, color: T.blue, borderBottom: `0.5px solid ${T.borderLight}` }}>{c.spend}</td>
                          <td style={{ padding: '8px 12px', fontSize: 11, color: T.green, borderBottom: `0.5px solid ${T.borderLight}` }}>{c.conversions}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: T.text, borderBottom: `0.5px solid ${T.borderLight}` }}>{c.roas}</td>
                          <td style={{ padding: '8px 12px', fontSize: 10, color: T.textMuted, borderBottom: `0.5px solid ${T.borderLight}` }}>{c.reason}</td>
                          <td style={{ padding: '8px 12px', borderBottom: `0.5px solid ${T.borderLight}` }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: ac + '20', color: ac }}>{c.action}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'Targets' && (
          <div>
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 12 }}>ROAS targets and what they mean</div>
              {[
                { roas: '1x', meaning: 'Break-even — revenue equals spend. You\'re paying for ads but not making money from them.', color: T.red, status: 'Loss' },
                { roas: '2x', meaning: 'Marginal — you get £2 back per £1 spent. After product cost and other overheads, probably still unprofitable.', color: T.amber, status: 'Marginal' },
                { roas: '3x', meaning: 'Our minimum target. £3 back per £1 spent. Generally profitable after margins.', color: T.amber, status: 'Minimum target' },
                { roas: '4x', meaning: 'Good performance. £4 back per £1. Campaigns are working well.', color: T.green, status: 'Good' },
                { roas: '6x+', meaning: 'Excellent. £6+ back per £1. Scale these campaigns immediately — increase budget.', color: T.green, status: 'Scale now' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < 4 ? `0.5px solid ${T.borderLight}` : 'none', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: r.color, width: 40, flexShrink: 0 }}>{r.roas}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: r.color, marginBottom: 2 }}>{r.status}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{r.meaning}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>Why your CSV doesn\'t show ROAS</div>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, marginBottom: 10 }}>
                Google Ads shows "Conversion value" (ROAS) only if you\'ve set up conversion values. Currently your conversions are being tracked but without a £ value attached, so ROAS can\'t be calculated from the CSV alone.
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>How to fix it — 2 options:</div>
              {[
                { option: 'Option A — Set conversion values in Google Ads (recommended)', steps: ['Go to Google Ads → Tools → Conversions', 'Click on your purchase conversion action', 'Set "Use different values for each conversion" → connect to Shopify order value', 'This automatically passes revenue to Google Ads for ROAS tracking'] },
                { option: 'Option B — Use this calculator (what we\'re doing now)', steps: ['Upload your Google Ads CSV for spend data', 'The platform reads Shopify revenue via API', 'We calculate ROAS by dividing total Shopify revenue by total Ads spend', 'Not perfect (includes organic revenue) but gives a good approximation'] },
              ].map((o, i) => (
                <div key={i} style={{ background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 6, padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 6 }}>{o.option}</div>
                  {o.steps.map((step, j) => (
                    <div key={j} style={{ fontSize: 11, color: T.textMuted, padding: '2px 0' }}>{j + 1}. {step}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Improve ROAS' && (
          <div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>
              Based on your actual campaign data — specific actions to improve your ROAS this month
            </div>
            {[
              {
                priority: 1, impact: 'HIGH', title: 'Pause or drastically reduce Shopify All Products',
                desc: '£1,347 spent, 0.74% conversion rate. This is your biggest drain. Reduce to £20/day and redirect the budget to Hair City Visitors.',
                saving: 'Save ~£1,100/month', color: T.red,
              },
              {
                priority: 2, impact: 'HIGH', title: 'Scale Hair City Visitors to £15/day',
                desc: 'Currently £10/day with 16.67% conversion rate — your best performing campaign. At £15/day it will generate significantly more conversions.',
                saving: '+conversions at same efficiency', color: T.green,
              },
              {
                priority: 3, impact: 'HIGH', title: 'Reduce All By Brands from £150/day to £50/day',
                desc: '0.81% conversion rate — spending £150/day for very low returns. Reduce to £50/day and monitor for 2 weeks.',
                saving: 'Save ~£3,000/month', color: T.red,
              },
              {
                priority: 4, impact: 'MEDIUM', title: 'Fix 14% disapproved products in Merchant Center',
                desc: '~3,356 products not showing in Shopping ads. Each approved product is another chance to appear — fixing this could improve Shopping performance by 15-20%.',
                saving: '+15-20% Shopping visibility', color: T.amber,
              },
              {
                priority: 5, impact: 'MEDIUM', title: 'Add 10+ negative keywords from search terms',
                desc: 'Irrelevant searches are wasting budget. Box braids, afro kinky, aftress hair — add all from your Search Terms CSV as negative exact match keywords.',
                saving: 'Reduce wasted spend', color: T.amber,
              },
              {
                priority: 6, impact: 'MEDIUM', title: 'Set up conversion value tracking',
                desc: 'Without revenue values in Google Ads, the algorithm can\'t optimise for profit. Adding Shopify order values enables Smart Bidding to maximise ROAS automatically.',
                saving: 'Automated ROAS optimisation', color: T.blue,
              },
            ].map((action, i) => (
              <div key={i} style={{
                background: T.surface, border: `0.5px solid ${T.border}`,
                borderLeft: `4px solid ${action.color}`,
                borderRadius: 8, padding: '14px 16px', marginBottom: 8,
                display: 'flex', gap: 12,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: action.color, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{action.priority}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{action.title}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 2, background: action.color + '20', color: action.color }}>{action.impact}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5, marginBottom: 4 }}>{action.desc}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: action.color }}>{action.saving}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </Shell>
    </>
  )
}
