import Head from 'next/head'
import { useState } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

// Top 20 brand Instagram pages — direct profile URLs
const BRANDS = [
  { name: 'Dark and Lovely', handle: 'darkandlovely', category: 'Relaxers & Colour', color: '#8B1A1A' },
  { name: 'Cantu', handle: 'cantuhaircare', category: 'Natural Hair', color: '#2D5016' },
  { name: "Palmer's", handle: 'palmers', category: 'Moisturisers', color: '#8B4513' },
  { name: 'ORS', handle: 'ors_haircare', category: 'Natural Hair', color: '#1A4A8A' },
  { name: 'SheaMoisture', handle: 'sheamoisture', category: 'Natural Hair', color: '#4A2C8A' },
  { name: 'Schwarzkopf', handle: 'schwarzkopf_professional', category: 'Colour & Care', color: '#1A1A1A' },
  { name: 'African Pride', handle: 'africanpride', category: 'Natural Hair', color: '#8A4A1A' },
  { name: 'Mielle Organics', handle: 'mielleorganics', category: 'Natural Hair', color: '#8A1A4A' },
  { name: 'Creme of Nature', handle: 'cremeofnature', category: 'Colour & Natural', color: '#1A6A3A' },
  { name: 'Design Essentials', handle: 'designessentials', category: 'Natural Hair', color: '#1A3A6A' },
  { name: 'As I Am', handle: 'asiamnatural', category: 'Natural Hair', color: '#4A6A1A' },
  { name: 'Eco Styler', handle: 'ecostyler', category: 'Styling', color: '#1A6A6A' },
  { name: 'Aunt Jackie', handle: 'auntjackiescurlsandcoils', category: 'Natural Hair', color: '#6A1A6A' },
  { name: 'Jamaican Mango & Lime', handle: 'jamaicanmangoandlime', category: 'Locs & Braids', color: '#4A7A1A' },
  { name: 'Luster Products', handle: 'lusterproducts', category: 'Moisturisers', color: '#7A4A1A' },
  { name: 'Motions', handle: 'motionshair', category: 'Relaxers', color: '#1A1A7A' },
  { name: 'TCB', handle: 'tcbhaircare', category: 'Relaxers', color: '#5A1A1A' },
  { name: 'Elasta QP', handle: 'elastaqp', category: 'Relaxers & Care', color: '#1A5A4A' },
  { name: 'Profectiv', handle: 'profectivhaircare', category: 'Growth & Care', color: '#3A1A6A' },
  { name: 'Bonfi Natural', handle: 'bonfinatural', category: 'Natural Hair', color: '#1A4A1A' },
]

const CATEGORIES = ['All', ...new Set(BRANDS.map(b => b.category))]

export default function BrandVideos() {
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = BRANDS.filter(b => {
    const matchCat = filter === 'All' || b.category === filter
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <Head><title>Brand Videos — CC Intelligence</title></Head>
      <Shell title="Brand Video Hub" subtitle="Top brand Instagram pages — browse and repost content to your channels">

        <div style={{display:'grid',gridTemplateColumns:selectedBrand?'280px 1fr':'1fr',gap:14,transition:'all 0.2s'}}>

          {/* Left — Brand List */}
          <div>
            {/* Search + Filter */}
            <div style={{marginBottom:10}}>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Search brands..."
                style={{width:'100%',padding:'7px 10px',fontSize:12,border:`1px solid ${T.border}`,borderRadius:7,background:T.bg,color:T.text,marginBottom:7,boxSizing:'border-box'}}
              />
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={()=>setFilter(c)} style={{
                    padding:'3px 9px',fontSize:10,fontWeight:600,borderRadius:20,cursor:'pointer',
                    background:filter===c?T.blue:T.bg,
                    color:filter===c?'#fff':T.textMuted,
                    border:`1px solid ${filter===c?T.blue:T.border}`,
                  }}>{c}</button>
                ))}
              </div>
            </div>

            {/* Brand cards */}
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {filtered.map(brand => (
                <button key={brand.handle} onClick={()=>setSelectedBrand(selectedBrand?.handle===brand.handle?null:brand)}
                  style={{
                    display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
                    background:selectedBrand?.handle===brand.handle?T.blueBg:T.surface,
                    border:`1px solid ${selectedBrand?.handle===brand.handle?T.blue:T.border}`,
                    borderLeft:`4px solid ${brand.color}`,
                    borderRadius:8,cursor:'pointer',textAlign:'left',
                  }}>
                  <div style={{
                    width:36,height:36,borderRadius:'50%',background:brand.color,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:13,fontWeight:700,color:'#fff',flexShrink:0,
                  }}>
                    {brand.name.charAt(0)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.text}}>{brand.name}</div>
                    <div style={{fontSize:10,color:T.textMuted}}>@{brand.handle}</div>
                    <div style={{fontSize:10,color:brand.color,fontWeight:600}}>{brand.category}</div>
                  </div>
                  <span style={{fontSize:10,color:T.textMuted}}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right — Brand Instagram viewer */}
          {selectedBrand && (
            <div>
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,overflow:'hidden'}}>
                {/* Brand header */}
                <div style={{padding:'14px 16px',borderBottom:`0.5px solid ${T.border}`,display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:44,height:44,borderRadius:'50%',background:selectedBrand.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'#fff'}}>
                    {selectedBrand.name.charAt(0)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>{selectedBrand.name}</div>
                    <div style={{fontSize:11,color:T.textMuted}}>@{selectedBrand.handle}</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <a href={`https://www.instagram.com/${selectedBrand.handle}/`}
                      target="_blank" rel="noreferrer"
                      style={{padding:'6px 14px',fontSize:11,fontWeight:700,color:'#fff',background:'#E1306C',borderRadius:7,textDecoration:'none'}}>
                      Open on Instagram →
                    </a>
                    <button onClick={()=>setSelectedBrand(null)}
                      style={{padding:'6px 10px',fontSize:11,color:T.textMuted,background:T.bg,border:`0.5px solid ${T.border}`,borderRadius:7,cursor:'pointer'}}>
                      Close
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div style={{padding:'10px 16px',background:'#fff8e1',borderBottom:`0.5px solid ${T.border}`,fontSize:11,color:'#9a6700'}}>
                  <strong>How to download:</strong> Open Instagram below → find a video you want → tap the 3 dots (•••) → Copy Link → paste into the downloader below
                </div>

                {/* Video downloader input */}
                <div style={{padding:'14px 16px',borderBottom:`0.5px solid ${T.border}`}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Download a video</div>
                  <div style={{fontSize:11,color:T.textMuted,marginBottom:8}}>
                    Paste an Instagram post or Reel URL — we will open a downloader for it
                  </div>
                  <InstagramDownloader brand={selectedBrand} />
                </div>

                {/* Embed Instagram profile */}
                <div style={{padding:'14px 16px'}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>
                    {selectedBrand.name} Instagram — latest posts
                  </div>
                  <div style={{background:T.bg,borderRadius:8,padding:12,border:`0.5px solid ${T.border}`,fontSize:11,color:T.textMuted,textAlign:'center',marginBottom:10}}>
                    Due to Instagram restrictions, posts can only be viewed directly on Instagram.
                    Click below to open their page in a new tab and find videos to download.
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
                    <a href={`https://www.instagram.com/${selectedBrand.handle}/`} target="_blank" rel="noreferrer"
                      style={{display:'block',padding:'12px',background:'#E1306C',color:'#fff',borderRadius:8,textDecoration:'none',textAlign:'center',fontSize:12,fontWeight:700}}>
                      📸 View All Posts
                    </a>
                    <a href={`https://www.instagram.com/${selectedBrand.handle}/reels/`} target="_blank" rel="noreferrer"
                      style={{display:'block',padding:'12px',background:'#833AB4',color:'#fff',borderRadius:8,textDecoration:'none',textAlign:'center',fontSize:12,fontWeight:700}}>
                      🎬 View Reels
                    </a>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,padding:'14px 16px',marginTop:10}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Tips for reposting</div>
                {[
                  'Always credit the brand in your caption — tag @'+selectedBrand.handle,
                  'Add your own comment — "Available at CC Hair and Beauty — Chapeltown, Roundhay and City Centre"',
                  'Post Reels as Reels, not as regular posts — gets more reach',
                  'Best time to post: Tuesday-Friday 11am-1pm or 7pm-9pm',
                  'Add your own hashtags — #LeedsHair #CCHairAndBeauty #ChapeltownLeeds',
                ].map((tip,i) => (
                  <div key={i} style={{display:'flex',gap:8,marginBottom:6,fontSize:11,color:T.text}}>
                    <span style={{color:T.green,flexShrink:0,fontWeight:700}}>✓</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No brand selected */}
          {!selectedBrand && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,background:T.surface,borderRadius:10,border:`0.5px solid ${T.border}`,color:T.textMuted,fontSize:12}}>
              Select a brand from the left to view their Instagram page
            </div>
          )}
        </div>

      </Shell>
    </>
  )
}

function InstagramDownloader({ brand }) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('')

  function openDownloader() {
    if (!url.trim()) return
    // Sanitise — must be instagram.com URL
    if (!url.includes('instagram.com')) {
      setStatus('Please paste an Instagram URL')
      return
    }
    // Open in popular free Instagram downloader
    const encoded = encodeURIComponent(url.trim())
    window.open(`https://snapinsta.app/?url=${encoded}`, '_blank')
    setStatus('Downloader opened — paste the URL there to download the video')
  }

  return (
    <div>
      <div style={{display:'flex',gap:6}}>
        <input
          value={url}
          onChange={e=>{setUrl(e.target.value);setStatus('')}}
          placeholder="https://www.instagram.com/p/... or /reel/..."
          style={{flex:1,padding:'7px 10px',fontSize:11,border:`1px solid ${T.border}`,borderRadius:7,background:T.bg,color:T.text}}
        />
        <button onClick={openDownloader}
          style={{padding:'7px 14px',fontSize:11,fontWeight:700,color:'#fff',background:url?'#E1306C':'#d0d7de',border:'none',borderRadius:7,cursor:url?'pointer':'not-allowed',whiteSpace:'nowrap'}}>
          Download
        </button>
      </div>
      {status && (
        <div style={{marginTop:6,fontSize:11,color:T.textMuted,fontStyle:'italic'}}>{status}</div>
      )}
      <div style={{marginTop:6,fontSize:10,color:T.textMuted}}>
        Uses snapinsta.app — free, no account needed. Works for posts and reels.
      </div>
    </div>
  )
}
