import Head from 'next/head'
import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const COMPETITORS = [
  {
    id: 'samba',
    name: 'Samba Hair & Beauty',
    type: 'Direct',
    color: '#E05252',
    location: 'Leeds',
    gbpName: 'Samba Hair and Beauty',
    website: 'sambahair.co.uk',
    threat: 'Similar product range, same target market',
    weakness: 'Smaller range, likely single location',
    keywords: ['samba hair','samba hair leeds','samba hair and beauty'],
    ourAdvantage: '45 years established, 3 branches, 23,000+ products',
  },
  {
    id: 'tiesha',
    name: 'Tiesha Hair & Beauty',
    type: 'Direct',
    color: '#E05252',
    location: 'Leeds',
    gbpName: 'Tiesha Hair and Beauty',
    website: null,
    threat: 'Strong community reputation, social media presence',
    weakness: 'Likely single location, limited online range',
    ourAdvantage: 'More products, more locations, longer history',
  },
  {
    id: 'kashmire',
    name: 'Kashmire Hair & Cosmetics',
    type: 'Direct + Cosmetics',
    color: '#9B7DD4',
    location: 'Leeds',
    gbpName: 'Kashmire Hair and Cosmetics',
    website: null,
    threat: 'Hair + cosmetics crossover — same as CC Oud & Beauty plans',
    weakness: 'Niche positioning may limit reach',
    ourAdvantage: 'CC Oud & Beauty will directly compete and outspend them',
  },
  {
    id: 'julie',
    name: 'Julie Hair & Cosmetics',
    type: 'Direct + Cosmetics',
    color: '#9B7DD4',
    location: 'Leeds',
    gbpName: 'Julie Hair and Cosmetics',
    website: null,
    threat: 'Combined hair and cosmetics — entering our expansion market',
    weakness: 'Likely weak SEO and no paid ads strategy',
    ourAdvantage: 'Platform-driven SEO and paid ads will dominate quickly',
  },
  {
    id: 'extensions',
    name: 'Local Hair Extension Fitters',
    type: 'Service Competition',
    color: '#5B9BD5',
    location: 'Leeds (multiple)',
    gbpName: null,
    website: null,
    threat: 'They supply their own hair — taking product sales from us',
    weakness: 'Service businesses, not retailers — no stock depth or range',
    ourAdvantage: 'Become their preferred wholesale supplier — turn rivals into customers',
  },
]

const TRACKED_KEYWORDS = [
  { keyword: 'afro hair shop leeds', ours: null, samba: null, tiesha: null },
  { keyword: 'hair shop leeds', ours: null, samba: null, tiesha: null },
  { keyword: 'braiding hair leeds', ours: null, samba: null, tiesha: null },
  { keyword: 'relaxers uk', ours: null, samba: null, tiesha: null },
  { keyword: 'wigs leeds', ours: null, samba: null, tiesha: null },
  { keyword: 'hair extensions leeds', ours: null, samba: null, tiesha: null },
  { keyword: 'afro hair near me', ours: null, samba: null, tiesha: null },
  { keyword: 'hair shop chapeltown', ours: null, samba: null, tiesha: null },
  { keyword: 'natural hair products leeds', ours: null, samba: null, tiesha: null },
  { keyword: 'black hair shop leeds', ours: null, samba: null, tiesha: null },
  { keyword: 'wig shop leeds', ours: null, samba: null, tiesha: null },
  { keyword: 'hair care products leeds', ours: null, samba: null, tiesha: null },
]

const BATTLE_PLAN = [
  {
    area: 'Google Rankings',
    status: 'action',
    description: 'We need to rank #1-3 for every Leeds hair search. Competitors likely rank for some of these terms.',
    actions: [
      'Write a blog post for every keyword competitor ranks for that we don\'t',
      'Optimise collection pages for local keywords — "relaxers Leeds", "braiding hair Leeds"',
      'Build local citations — every directory listing boosts our local rankings',
      'Add Leeds to all collection SEO titles',
    ]
  },
  {
    area: 'Google Business Profile',
    status: 'winning',
    description: '3 branches = 3 GBP listings = 3 chances to appear in every local search. Competitors with 1 location can\'t compete.',
    actions: [
      'Keep all 3 GBP profiles updated weekly with posts, photos and products',
      'Respond to every review within 24 hours',
      'Get to 100+ reviews on each branch profile',
      'Add all products and services to each GBP listing',
    ]
  },
  {
    area: 'Google Ads',
    status: 'action',
    description: 'If competitors are bidding on "hair shop Leeds" and we\'re not, they\'re getting customers that should be ours.',
    actions: [
      'Upload Auction Insights CSV to see exactly which competitors bid on your keywords',
      'Increase Hair City Visitors budget to £15/day — this targets local searchers near all 3 branches',
      'Add competitor brand names as keywords — bid on "samba hair leeds" to capture their searchers',
      'Create specific ads for each branch location',
    ]
  },
  {
    area: 'Social Media',
    status: 'action',
    description: 'Community-based competitors may have strong social followings. We need consistent branded content.',
    actions: [
      'Post 3x per week minimum across all branches',
      'Show product arrivals, staff picks, customer transformations',
      'Tag Leeds community events and hashtags',
      'Run Instagram/Facebook location ads targeting LS7, LS8, LS2 postcodes',
    ]
  },
  {
    area: 'Hair Fitters B2B Strategy',
    status: 'opportunity',
    description: 'Local fitters are taking product sales. Convert them from rivals to wholesale customers.',
    actions: [
      'Create a trade account page on the website with bulk pricing',
      'Contact local fitters directly — offer trade discount account',
      'Build SEO content targeting "wholesale braiding hair Leeds" and "hair supplier Leeds"',
      'Set up a simple trade order form — minimum order £100, 10% trade discount',
    ]
  },
]

export default function Competitors() {
  const [tab, setTab] = useState('Overview')
  const [ratings, setRatings] = useState({})
  const [loadingRatings, setLoadingRatings] = useState(false)
  const [selectedComp, setSelectedComp] = useState(null)

  const TABS = ['Overview', 'Battle Plan', 'Keyword Gaps', 'GBP Ratings']

  async function loadRatings() {
    setLoadingRatings(true)
    try {
      const r = await fetch('/api/competitor-ratings')
      const d = await r.json()
      if (d.ok) setRatings(d.ratings || {})
    } catch(e) {}
    setLoadingRatings(false)
  }

  const typeColor = t => t === 'Direct' ? T.red : t === 'Direct + Cosmetics' ? '#9B7DD4' : T.blue
  const statusColor = s => s === 'winning' ? T.green : s === 'action' ? T.red : T.blue

  return (
    <>
      <Head><title>Competitors — CC Intelligence</title></Head>
      <Shell title="Competitor Intelligence" subtitle="Track Samba, Tiesha, Kashmire, Julie and local extension fitters — know before they do">

        {/* Competitor cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
          {COMPETITORS.map(c => (
            <div key={c.id} onClick={() => setSelectedComp(selectedComp?.id === c.id ? null : c)}
              style={{
                background: T.surface, border: `0.5px solid ${selectedComp?.id === c.id ? c.color : T.border}`,
                borderLeft: `4px solid ${c.color}`, borderRadius: 8, padding: '12px 14px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 3 }}>{c.name}</div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: typeColor(c.type) + '20', color: typeColor(c.type), textTransform: 'uppercase' }}>{c.type}</span>
                <span style={{ fontSize: 9, color: T.textMuted }}>{c.location}</span>
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4 }}>{c.threat}</div>
            </div>
          ))}
        </div>

        {/* Expanded competitor detail */}
        {selectedComp && (
          <div style={{ background: T.surface, border: `1px solid ${selectedComp.color}40`, borderRadius: 8, padding: '16px', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.red, textTransform: 'uppercase', marginBottom: 5 }}>Their threat</div>
                <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{selectedComp.threat}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.amber, textTransform: 'uppercase', marginBottom: 5 }}>Their weakness</div>
                <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{selectedComp.weakness}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.green, textTransform: 'uppercase', marginBottom: 5 }}>Our advantage</div>
                <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{selectedComp.ourAdvantage}</div>
              </div>
            </div>
            {selectedComp.keywords?.length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `0.5px solid ${T.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', marginBottom: 5 }}>Their brand keywords to bid on in Google Ads</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {selectedComp.keywords.map((k, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, background: T.blueBg, color: T.blue, border: `0.5px solid ${T.blueBorder}` }}>{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.border}`, marginBottom: 14 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', fontSize: 12, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? T.blue : T.textMuted, background: 'none', border: 'none',
              borderBottom: tab === t ? `2px solid ${T.blue}` : '2px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{t}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div>
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>Our competitive position</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[
                  { label: 'Our advantage', items: ['45 years established — 1979', '3 branch locations', '23,000+ products online', 'Platform-driven SEO and ads', 'CC Oud & Beauty expansion'] },
                  { label: 'Their advantages', items: ['Community loyalty (Tiesha)', 'Cosmetics crossover (Kashmire, Julie)', 'Fitters supply their own hair', 'Lower overheads (single location)', 'Agile pricing'] },
                  { label: 'Our plan to win', items: ['Rank #1 for all Leeds hair searches', 'Outspend on Google Ads efficiently', 'Turn fitters into wholesale customers', 'Build 100+ reviews per branch', 'Launch CC Oud & Beauty to dominate cosmetics'] },
                ].map((col, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? T.green : i === 1 ? T.red : T.blue, textTransform: 'uppercase', marginBottom: 6 }}>{col.label}</div>
                    {col.items.map((item, j) => (
                      <div key={j} style={{ fontSize: 11, color: T.text, padding: '4px 0', borderBottom: j < col.items.length - 1 ? `0.5px solid ${T.borderLight}` : 'none' }}>
                        {i === 0 ? '✓ ' : i === 1 ? '⚠ ' : '→ '}{item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: T.amberBg, border: `0.5px solid ${T.amberBorder}`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.amber, marginBottom: 6 }}>⚠ Biggest competitive risk right now</div>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6 }}>
                Local hair extension fitters are the most immediate threat — they supply their own hair and keep the product margin. The solution is to approach the top 10 Leeds fitters with a trade account offer. If they buy from CC Hair & Beauty at trade price, we convert rivals into a revenue stream worth potentially £2,000-5,000/month in B2B wholesale.
              </div>
            </div>
          </div>
        )}

        {/* BATTLE PLAN */}
        {tab === 'Battle Plan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BATTLE_PLAN.map((area, i) => (
              <div key={i} style={{
                background: T.surface, border: `0.5px solid ${T.border}`,
                borderLeft: `4px solid ${statusColor(area.status)}`,
                borderRadius: 8, padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, flex: 1 }}>{area.area}</div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3,
                    background: statusColor(area.status) + '20', color: statusColor(area.status), textTransform: 'uppercase'
                  }}>
                    {area.status === 'winning' ? '✓ Winning' : area.status === 'action' ? '⚠ Action needed' : '→ Opportunity'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 10, lineHeight: 1.5 }}>{area.description}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                  {area.actions.map((action, j) => (
                    <div key={j} style={{ fontSize: 11, color: T.text, display: 'flex', gap: 6, lineHeight: 1.4 }}>
                      <span style={{ color: statusColor(area.status), flexShrink: 0 }}>→</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KEYWORD GAPS */}
        {tab === 'Keyword Gaps' && (
          <div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>
              Keywords where competitors likely rank but we may not. Every gap is a content opportunity — write a blog post or optimise a collection page to close it within 60 days.
            </div>
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ padding: '10px 14px', background: T.bg, borderBottom: `0.5px solid ${T.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text, flex: 1 }}>Target keywords — check these in Search Console</span>
                <a href="/organic-seo" style={{ fontSize: 11, color: T.blue, fontWeight: 700, textDecoration: 'none' }}>Fix in Organic SEO →</a>
              </div>
              {TRACKED_KEYWORDS.map((kw, i) => (
                <div key={i} style={{
                  padding: '10px 14px', borderBottom: i < TRACKED_KEYWORDS.length - 1 ? `0.5px solid ${T.borderLight}` : 'none',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: i % 2 === 0 ? T.surface : T.bg
                }}>
                  <div style={{ flex: 1, fontSize: 12, color: T.text, fontWeight: 500 }}>{kw.keyword}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(kw.keyword)}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: 10, color: T.blue, padding: '3px 8px', border: `0.5px solid ${T.border}`, borderRadius: 4, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Check Google →
                    </a>
                    <a href={`/blog-planner`}
                      style={{ fontSize: 10, color: '#fff', background: T.green, padding: '3px 8px', borderRadius: 4, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Write blog →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Competitor brand keywords to bid on in Google Ads</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>Add these as keywords in a new Google Ads campaign — people searching for competitors are in-market buyers</div>
              {[
                { comp: 'Samba', keywords: ['samba hair leeds', 'samba hair and beauty', 'samba beauty leeds'] },
                { comp: 'Tiesha', keywords: ['tiesha hair', 'tiesha hair leeds', 'tiesha beauty'] },
                { comp: 'Kashmire', keywords: ['kashmire hair', 'kashmire hair and cosmetics'] },
                { comp: 'Julie', keywords: ['julie hair', 'julie hair and cosmetics leeds'] },
              ].map((c, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.text, marginBottom: 4 }}>{c.comp}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {c.keywords.map((k, j) => (
                      <span key={j} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: T.blueBg, color: T.blue, border: `0.5px solid ${T.blueBorder}` }}>{k}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GBP RATINGS */}
        {tab === 'GBP Ratings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: T.textMuted }}>Compare Google Business Profile ratings and review counts across CC Hair & Beauty and competitors</div>
              <button onClick={loadRatings} disabled={loadingRatings} style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 700,
                background: loadingRatings ? T.border : T.blue, color: '#fff',
                border: 'none', borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
                {loadingRatings ? 'Loading...' : 'Load ratings →'}
              </button>
            </div>

            {/* Our branches */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>CC Hair & Beauty — our branches</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[
                  { name: 'Chapeltown LS7', target: '4.8★ · 100+ reviews' },
                  { name: 'Roundhay LS8', target: '4.8★ · 100+ reviews' },
                  { name: 'Leeds City Centre', target: '4.8★ · 100+ reviews' },
                ].map((branch, i) => (
                  <div key={i} style={{ background: T.greenBg, border: `0.5px solid ${T.greenBorder}`, borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>{branch.name}</div>
                    <div style={{ fontSize: 18, color: T.green, fontWeight: 700, marginBottom: 2 }}>
                      {ratings[branch.name.toLowerCase().replace(' ', '_')]?.rating || '—'}★
                    </div>
                    <div style={{ fontSize: 10, color: T.textMuted }}>Target: {branch.target}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitors */}
            <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Competitor ratings — check manually on Google Maps</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 12 }}>Search each competitor on Google Maps to see their current rating and review count. Our goal is more reviews than all of them combined.</div>
              {COMPETITORS.filter(c => c.gbpName).map((comp, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 3 ? `0.5px solid ${T.borderLight}` : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{comp.name}</div>
                    <div style={{ fontSize: 10, color: T.textMuted }}>{comp.location}</div>
                  </div>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(comp.gbpName + ' Leeds reviews')}`} target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, color: T.blue, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Check on Google →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

      </Shell>
    </>
  )
}
