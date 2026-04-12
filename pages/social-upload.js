import Head from 'next/head'
import { useState, useRef } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const BRANCHES = ['Chapeltown', 'Roundhay', 'City Centre']
const POST_TYPES = [
  { id:'new_arrival',  label:'New Arrival',    desc:'Just landed in store' },
  { id:'back_instore', label:'Back In Store',   desc:'Popular product back in stock' },
  { id:'new_colour',   label:'New Colour',      desc:'New shade or colour option' },
  { id:'deal_of_day',  label:'Deal of the Day', desc:'Special offer or bundle' },
  { id:'staff_pick',   label:'Staff Pick',      desc:'Our team recommends this' },
  { id:'trending',     label:'Trending Now',    desc:'Flying off the shelves' },
]

function getHistoryText(entry, platform) {
  if (platform === 'ig') {
    return (entry.instagram?.caption || '') + '\n\n' + (entry.instagram?.hashtags || '')
  }
  if (platform === 'fb') return entry.facebook?.caption || ''
  if (platform === 'tt') {
    const hook = entry.tiktok?.hook ? ('Hook: ' + entry.tiktok.hook + '\n\n') : ''
    return hook + (entry.tiktok?.caption || '')
  }
  if (platform === 'gbp') return entry.gbp?.post || ''
  return ''
}

export default function SocialUpload() {
  const [branch, setBranch] = useState('')
  const [postType, setPostType] = useState('')
  const [mediaType, setMediaType] = useState('photo')
  const [inputMode, setInputMode] = useState('photo')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [productText, setProductText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState({})
  const [activeTab, setActiveTab] = useState('create')
  const [history, setHistory] = useState([])

  useEffect(() => {
    try {
      const h = localStorage.getItem('cc_social_history')
      if (h) setHistory(JSON.parse(h))
    } catch(e) {}
  }, [])
  const fileRef = useRef()

  function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 800
        let w = img.width, h = img.height
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX }
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        setImagePreview(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  async function generate() {
    if (!branch || !postType) return
    if (inputMode === 'photo' && !imagePreview) return
    if (inputMode === 'text' && productText.trim().length < 3) return

    setGenerating(true)
    setResult(null)
    setError(null)

    try {
      const postTypeLabel = POST_TYPES.find(p => p.id === postType)?.label || postType
      const body = inputMode === 'text'
        ? { productText: productText.trim(), branch, postType, postTypeLabel, mediaType }
        : { imageBase64: imagePreview.split(',')[1], mimeType: image?.type || 'image/jpeg', branch, postType, postTypeLabel, mediaType }

      const r = await fetch('/api/generate-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!d.ok) {
        setError(d.error || 'Generation failed')
      } else {
        setResult(d)
        const entry = {
          id: Date.now(),
          date: new Date().toISOString(),
          branch,
          postTypeLabel: POST_TYPES.find(p=>p.id===postType)?.label,
          mediaType,
          productName: d.productName || productText || 'Photo upload',
          instagram: d.instagram,
          facebook: d.facebook,
          tiktok: d.tiktok,
          gbp: d.gbp,
        }
        const newHistory = [entry, ...history].slice(0, 50)
        setHistory(newHistory)
        try { localStorage.setItem('cc_social_history', JSON.stringify(newHistory)) } catch(e) {}
      }
    } catch(e) {
      setError('Connection error: ' + e.message)
    }
    setGenerating(false)
  }

  function copy(key, text) {
    navigator.clipboard.writeText(text)
    setCopied(c => ({...c, [key]: true}))
    setTimeout(() => setCopied(c => ({...c, [key]: false})), 2000)
  }

  function deleteHistory(i) {
    const h = [...history]
    h.splice(i, 1)
    setHistory(h)
    try { localStorage.setItem('cc_social_history', JSON.stringify(h)) } catch(e) {}
  }

  function reset() {
    setResult(null); setImage(null); setImagePreview(null)
    setBranch(''); setPostType(''); setProductText(''); setError(null)
  }

  const canGenerate = branch && postType && (
    inputMode === 'photo' ? !!imagePreview : productText.trim().length > 3
  )

  return (
    <>
      <Head><title>Social Media — CC Intelligence</title></Head>
      <Shell title="Social Media" subtitle="Upload a photo or type product details — get Instagram, Facebook, TikTok and GBP posts instantly">
        <div style={{maxWidth:560,margin:'0 auto'}}>

          {/* Tab switcher */}
          <div style={{display:'flex',gap:4,marginBottom:14,borderBottom:`1px solid ${T.border}`}}>
            {[{id:'create',label:'Create Post'},{id:'history',label:'History ('+history.length+')'}].map(t => (
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                padding:'7px 16px',fontSize:12,fontWeight:600,border:'none',background:'none',
                borderBottom:activeTab===t.id?('2px solid '+T.blue):'2px solid transparent',
                color:activeTab===t.id?T.blue:T.textMuted,cursor:'pointer',
              }}>{t.label}</button>
            ))}
          </div>

          {/* HISTORY TAB */}
          {activeTab==='history' && (
            <div>
              {history.length===0 && (
                <div style={{padding:30,textAlign:'center',color:T.textMuted,fontSize:12,background:T.surface,borderRadius:8,border:'0.5px solid '+T.border}}>
                  No history yet — generated posts will appear here
                </div>
              )}
              {history.map((entry, i) => (
                <div key={entry.id} style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:10,padding:14,marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:T.text}}>{entry.productName}</div>
                      <div style={{fontSize:10,color:T.textMuted}}>
                        {entry.branch} · {entry.postTypeLabel} · {new Date(entry.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                    <button onClick={()=>deleteHistory(i)}
                      style={{padding:'3px 8px',fontSize:10,color:T.red,background:'none',border:'0.5px solid '+T.red,borderRadius:4,cursor:'pointer'}}>
                      Delete
                    </button>
                  </div>
                  {['ig','fb','tt','gbp'].map(platform => {
                    const labels = {ig:'Instagram',fb:'Facebook',tt:'TikTok',gbp:'GBP'}
                    const text = getHistoryText(entry, platform)
                    if (!text) return null
                    return (
                      <div key={platform} style={{marginBottom:6}}>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                          <span style={{fontSize:10,fontWeight:700,color:T.textMuted}}>{labels[platform]}</span>
                          <button onClick={()=>copy('h_'+entry.id+'_'+platform, text)}
                            style={{padding:'2px 8px',fontSize:10,background:T.blue,color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>
                            Copy
                          </button>
                        </div>
                        <div style={{fontSize:11,color:T.text,background:T.bg,borderRadius:5,padding:'6px 8px',lineHeight:1.5,maxHeight:60,overflow:'hidden'}}>
                          {text.slice(0,150)}{text.length>150?'...':''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {/* CREATE TAB */}
          {activeTab==='create' && (
            <div>
              {/* Step 1 — Photo or Text */}
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:10,padding:16,marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>1. Product</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}}>
                  {['photo','text'].map(m => (
                    <button key={m} onClick={()=>{setInputMode(m);setResult(null);setError(null)}} style={{
                      padding:'8px',fontSize:11,fontWeight:600,borderRadius:7,cursor:'pointer',
                      background:inputMode===m?T.blue:T.bg,
                      color:inputMode===m?'#fff':T.text,
                      border:'2px solid '+(inputMode===m?T.blue:T.border),
                    }}>
                      {m==='photo'?'Upload Photo':'Type Product Details'}
                    </button>
                  ))}
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{display:'none'}}/>

                {inputMode==='photo' && (
                  imagePreview ? (
                    <div style={{position:'relative'}}>
                      <img src={imagePreview} alt="Product" style={{width:'100%',maxHeight:220,objectFit:'cover',borderRadius:8,border:'1px solid '+T.border}}/>
                      <button onClick={()=>{setImage(null);setImagePreview(null);setResult(null)}}
                        style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.6)',color:'#fff',border:'none',borderRadius:20,padding:'4px 10px',fontSize:11,cursor:'pointer'}}>
                        Change
                      </button>
                    </div>
                  ) : (
                    <button onClick={()=>fileRef.current?.click()} style={{
                      width:'100%',height:130,border:'2px dashed '+T.border,borderRadius:8,
                      background:T.bg,color:T.textMuted,cursor:'pointer',
                      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,
                    }}>
                      <span style={{fontSize:28}}>📷</span>
                      <span style={{fontSize:12,fontWeight:600}}>Choose from camera roll or take photo</span>
                    </button>
                  )
                )}

                {inputMode==='text' && (
                  <div>
                    <div style={{fontSize:11,color:T.textMuted,marginBottom:5}}>
                      Format: Brand — Product — Size (e.g. ORS — Curl Jam — 340g)
                    </div>
                    <textarea
                      value={productText}
                      onChange={e=>setProductText(e.target.value)}
                      placeholder={'e.g. Dark and Lovely — Optimum Care Relaxer — Super'}
                      rows={3}
                      style={{width:'100%',padding:'8px 10px',fontSize:12,border:'1px solid '+T.border,borderRadius:7,background:T.bg,color:T.text,resize:'vertical',fontFamily:'inherit',lineHeight:1.5,boxSizing:'border-box'}}
                    />
                  </div>
                )}
              </div>

              {/* Step 2 — Branch */}
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:10,padding:16,marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>2. Which branch?</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                  {BRANCHES.map(b => (
                    <button key={b} onClick={()=>setBranch(b)} style={{
                      padding:'10px 6px',fontSize:11,fontWeight:600,borderRadius:7,cursor:'pointer',
                      background:branch===b?T.blue:T.bg,
                      color:branch===b?'#fff':T.text,
                      border:'2px solid '+(branch===b?T.blue:T.border),
                    }}>{b}</button>
                  ))}
                </div>
              </div>

              {/* Step 3 — Post type */}
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:10,padding:16,marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>3. Type of post?</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                  {POST_TYPES.map(p => (
                    <button key={p.id} onClick={()=>setPostType(p.id)} style={{
                      padding:'9px 10px',textAlign:'left',borderRadius:7,cursor:'pointer',
                      background:postType===p.id?T.blueBg:T.bg,
                      border:'2px solid '+(postType===p.id?T.blue:T.border),
                    }}>
                      <div style={{fontSize:11,fontWeight:700,color:postType===p.id?T.blue:T.text}}>{p.label}</div>
                      <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4 — Photo or Reel */}
              <div style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:10,padding:16,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>4. Photo post or Reel?</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                  {[{id:'photo',label:'Photo Post',icon:'🖼️'},{id:'reel',label:'Reel / Video',icon:'🎬'}].map(m => (
                    <button key={m.id} onClick={()=>setMediaType(m.id)} style={{
                      padding:'10px',textAlign:'left',borderRadius:7,cursor:'pointer',
                      background:mediaType===m.id?T.blueBg:T.bg,
                      border:'2px solid '+(mediaType===m.id?T.blue:T.border),
                    }}>
                      <div style={{fontSize:18,marginBottom:4}}>{m.icon}</div>
                      <div style={{fontSize:11,fontWeight:700,color:mediaType===m.id?T.blue:T.text}}>{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate */}
              <button onClick={generate} disabled={!canGenerate||generating} style={{
                width:'100%',padding:'14px',fontSize:14,fontWeight:700,
                background:canGenerate&&!generating?T.blue:'#d0d7de',
                color:'#fff',border:'none',borderRadius:10,
                cursor:canGenerate&&!generating?'pointer':'not-allowed',
                marginBottom:14,
              }}>
                {generating?'Generating...':canGenerate?'Generate All Posts':'Complete steps above'}
              </button>

              {error && (
                <div style={{background:'#fff0f0',border:'1px solid #ffa0a0',borderRadius:8,padding:'10px 14px',fontSize:12,color:T.red,marginBottom:12}}>
                  Error: {error}
                </div>
              )}

              {/* Results */}
              {result && (
                <div>
                  {result.productName && (
                    <div style={{fontSize:11,color:T.textMuted,marginBottom:10,textAlign:'center'}}>
                      Product detected: <strong style={{color:T.text}}>{result.productName}</strong>
                    </div>
                  )}
                  {[
                    {key:'ig',icon:'📸',label:'Instagram '+(mediaType==='reel'?'Reel':'Post'),color:T.blue},
                    {key:'fb',icon:'👥',label:'Facebook Post',color:'#1877F2'},
                    {key:'tt',icon:'🎵',label:'TikTok '+(mediaType==='reel'?'Video':'Photo Mode'),color:'#000'},
                    {key:'gbp',icon:'📍',label:'Google Business Profile',color:'#34A853'},
                  ].map(p => {
                    const text = getHistoryText(result.instagram ? {instagram:result.instagram,facebook:result.facebook,tiktok:result.tiktok,gbp:result.gbp} : {}, p.key === 'ig' ? 'ig' : p.key === 'fb' ? 'fb' : p.key === 'tt' ? 'tt' : 'gbp')
                    if (!text) return null
                    return (
                      <div key={p.key} style={{background:T.surface,border:'0.5px solid '+T.border,borderRadius:10,padding:14,marginBottom:8}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                          <span style={{fontSize:18}}>{p.icon}</span>
                          <span style={{fontSize:13,fontWeight:700,color:T.text,flex:1}}>{p.label}</span>
                          <button onClick={()=>copy(p.key,text)} style={{
                            padding:'4px 12px',fontSize:11,fontWeight:600,
                            background:copied[p.key]?T.green:p.color,
                            color:'#fff',border:'none',borderRadius:5,cursor:'pointer',
                          }}>
                            {copied[p.key]?'Copied!':'Copy'}
                          </button>
                        </div>
                        {p.key==='ig' ? (
                          <div>
                            <div style={{fontSize:12,color:T.text,lineHeight:1.6,marginBottom:6,whiteSpace:'pre-wrap'}}>{result.instagram?.caption}</div>
                            <div style={{fontSize:11,color:'#7c3aed',lineHeight:1.8}}>{result.instagram?.hashtags}</div>
                          </div>
                        ) : (
                          <div style={{fontSize:12,color:T.text,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{text}</div>
                        )}
                        {p.key==='gbp' && (
                          <div style={{fontSize:10,color:(result.gbp?.post||'').length>280?T.red:T.textMuted,marginTop:4}}>
                            {(result.gbp?.post||'').length}/280 characters
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <button onClick={reset} style={{
                    width:'100%',padding:12,fontSize:12,fontWeight:600,
                    background:T.bg,color:T.text,border:'1px solid '+T.border,
                    borderRadius:10,cursor:'pointer',marginBottom:16,
                  }}>
                    Post another product
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </Shell>
    </>
  )
}
