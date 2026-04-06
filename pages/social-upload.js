import Head from 'next/head'
import { useState, useRef } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

const BRANCHES = ['Chapeltown', 'Roundhay', 'City Centre']
const POST_TYPES = [
  { id:'new_arrival',   label:'New Arrival',      desc:'Just landed in store' },
  { id:'back_instore',  label:'Back In Store',     desc:'Popular product back in stock' },
  { id:'new_colour',    label:'New Colour',        desc:'New shade or colour option' },
  { id:'deal_of_day',   label:'Deal of the Day',   desc:'Special offer or bundle' },
  { id:'staff_pick',    label:'Staff Pick',        desc:'Our team recommends this product' },
  { id:'trending',      label:'Trending Now',      desc:'Flying off the shelves' },
]
const MEDIA_TYPES = [
  { id:'photo', label:'Photo Post', desc:'Static image — best for product shots' },
  { id:'reel',  label:'Reel / Video', desc:'Short video — best for demos and trending sounds' },
]

export default function SocialUpload() {
  const [branch, setBranch] = useState('')
  const [postType, setPostType] = useState('')
  const [mediaType, setMediaType] = useState('photo')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState({})
  const fileRef = useRef()

  function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setResult(null)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function generate() {
    if (!branch || !postType || !imagePreview) return
    setGenerating(true)
    setResult(null)

    try {
      // Convert image to base64 for Claude vision
      const base64 = imagePreview.split(',')[1]
      const mimeType = image.type || 'image/jpeg'
      const isVideo = mediaType === 'reel'
      const postTypeLabel = POST_TYPES.find(p => p.id === postType)?.label || postType

      // prompt built server-side
      const _unused = `You are writing social media content for CC Hair and Beauty Leeds, a community hair and beauty retailer established in 1979 with 3 branches (Chapeltown LS7, Roundhay LS8, City Centre).

This is a ${postTypeLabel} post for the ${branch} branch.
Media type: ${isVideo ? 'Short video/Reel' : 'Photo post'}

Look at the product image and generate the following. Return as JSON only, no markdown:

{
  "productName": "Your best guess at the product name from the image",
  "instagram": {
    "caption": "Engaging Instagram caption, 2-3 short paragraphs, friendly tone, mentions ${branch} branch, ends with call to action to visit or shop online at cchairandbeauty.com. ${isVideo ? 'Written for a Reel — punchy opening hook, fast energy.' : 'Written for a photo post.'}",
    "hashtags": "20-25 relevant hashtags as a single string starting with # — mix of product-specific, Leeds local, and afro hair community hashtags"
  },
  "facebook": {
    "caption": "Facebook post — more conversational, slightly longer than Instagram, mentions CC Hair and Beauty Leeds community since 1979, includes cchairandbeauty.com link. Warm community tone."
  },
  "tiktok": {
    "hook": "${isVideo ? 'First 3 seconds hook — short punchy line that stops the scroll, written for spoken word' : 'TikTok photo mode caption — trend-aware, fun, uses current TikTok language'}",
    "caption": "TikTok caption — short, energetic, ${isVideo ? 'includes trending audio suggestion relevant to the product' : 'uses trending TikTok phrases'}, 3-5 hashtags only"
  },
  "gbp": {
    "post": "Google Business Profile post — max 300 characters, professional, mentions the branch address, includes product name"
  }
}`

      const r = await fetch('/api/generate-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          branch,
          postType,
          postTypeLabel: POST_TYPES.find(p => p.id === postType)?.label || postType,
          mediaType,
        })
      })

      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Generation failed')
      setResult(d)
    } catch(e) {
      setResult({ error: 'Generation failed: ' + e.message })
    }
    setGenerating(false)
  }

  function copy(key, text) {
    navigator.clipboard.writeText(text)
    setCopied(c => ({...c, [key]: true}))
    setTimeout(() => setCopied(c => ({...c, [key]: false})), 2000)
  }

  const canGenerate = branch && postType && imagePreview

  return (
    <>
      <Head><title>Social Media Upload — CC Intelligence</title></Head>
      <Shell title="Social Media" subtitle="Upload a product photo — get Instagram, Facebook, TikTok and GBP posts instantly">

        <div style={{maxWidth:600,margin:'0 auto'}}>

          {/* Step 1 — Upload image */}
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,padding:16,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>1. Upload product photo</div>
            <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment"
              onChange={handleImage} style={{display:'none'}}/>
            {!imagePreview ? (
              <button onClick={()=>fileRef.current?.click()}
                style={{width:'100%',height:160,border:`2px dashed ${T.border}`,borderRadius:8,background:T.bg,color:T.textMuted,fontSize:14,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8}}>
                <span style={{fontSize:32}}>📷</span>
                <span style={{fontSize:13,fontWeight:600}}>Tap to take photo or upload from camera roll</span>
                <span style={{fontSize:11}}>Best for: new arrivals, back in stock, product shots</span>
              </button>
            ) : (
              <div style={{position:'relative'}}>
                <img src={imagePreview} alt="Product" style={{width:'100%',maxHeight:250,objectFit:'cover',borderRadius:8,border:`1px solid ${T.border}`}}/>
                <button onClick={()=>{setImage(null);setImagePreview(null);setResult(null)}}
                  style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.6)',color:'#fff',border:'none',borderRadius:20,padding:'4px 10px',fontSize:11,cursor:'pointer'}}>
                  Change photo
                </button>
              </div>
            )}
          </div>

          {/* Step 2 — Branch */}
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,padding:16,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>2. Which branch?</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {BRANCHES.map(b => (
                <button key={b} onClick={()=>setBranch(b)} style={{
                  padding:'10px 8px',fontSize:12,fontWeight:600,borderRadius:8,cursor:'pointer',
                  background:branch===b?T.blue:T.bg,
                  color:branch===b?'#fff':T.text,
                  border:`2px solid ${branch===b?T.blue:T.border}`,
                }}>{b}</button>
              ))}
            </div>
          </div>

          {/* Step 3 — Post type */}
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,padding:16,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>3. What type of post?</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
              {POST_TYPES.map(p => (
                <button key={p.id} onClick={()=>setPostType(p.id)} style={{
                  padding:'10px 12px',textAlign:'left',borderRadius:8,cursor:'pointer',
                  background:postType===p.id?T.blueBg:T.bg,
                  border:`2px solid ${postType===p.id?T.blue:T.border}`,
                }}>
                  <div style={{fontSize:12,fontWeight:700,color:postType===p.id?T.blue:T.text}}>{p.label}</div>
                  <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4 — Photo or Video */}
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>4. Photo post or Reel/Video?</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {MEDIA_TYPES.map(m => (
                <button key={m.id} onClick={()=>setMediaType(m.id)} style={{
                  padding:'10px 12px',textAlign:'left',borderRadius:8,cursor:'pointer',
                  background:mediaType===m.id?T.blueBg:T.bg,
                  border:`2px solid ${mediaType===m.id?T.blue:T.border}`,
                }}>
                  <div style={{fontSize:20,marginBottom:4}}>{m.id==='photo'?'🖼️':'🎬'}</div>
                  <div style={{fontSize:12,fontWeight:700,color:mediaType===m.id?T.blue:T.text}}>{m.label}</div>
                  <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button onClick={generate} disabled={!canGenerate||generating}
            style={{width:'100%',padding:'14px',fontSize:15,fontWeight:700,
              background:canGenerate&&!generating?T.blue:T.border,
              color:'#fff',border:'none',borderRadius:10,cursor:canGenerate&&!generating?'pointer':'not-allowed',
              marginBottom:16,
            }}>
            {generating ? 'Generating posts...' : canGenerate ? 'Generate All Posts' : 'Complete steps above to generate'}
          </button>

          {result?.error && (
            <div style={{background:'#fff0f0',border:`1px solid ${T.redBorder}`,borderRadius:8,padding:12,fontSize:12,color:T.red,marginBottom:12}}>
              {result.error}
            </div>
          )}

          {/* Results */}
          {result && !result.error && (
            <div>
              {result.productName && (
                <div style={{fontSize:12,color:T.textMuted,marginBottom:12,textAlign:'center'}}>
                  Detected product: <strong style={{color:T.text}}>{result.productName}</strong>
                </div>
              )}

              {/* Instagram */}
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,padding:14,marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <span style={{fontSize:20}}>📸</span>
                  <span style={{fontSize:13,fontWeight:700,color:T.text}}>Instagram {mediaType==='reel'?'Reel':'Post'}</span>
                  <button onClick={()=>copy('ig',`${result.instagram?.caption}\n\n${result.instagram?.hashtags}`)}
                    style={{marginLeft:'auto',padding:'4px 12px',fontSize:11,fontWeight:600,background:copied.ig?T.green:T.blue,color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}}>
                    {copied.ig?'Copied!':'Copy all'}
                  </button>
                </div>
                <div style={{fontSize:12,color:T.text,lineHeight:1.6,marginBottom:8,whiteSpace:'pre-wrap'}}>{result.instagram?.caption}</div>
                <div style={{fontSize:11,color:'#7c3aed',lineHeight:1.8}}>{result.instagram?.hashtags}</div>
              </div>

              {/* Facebook */}
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,padding:14,marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <span style={{fontSize:20}}>👥</span>
                  <span style={{fontSize:13,fontWeight:700,color:T.text}}>Facebook Post</span>
                  <button onClick={()=>copy('fb',result.facebook?.caption)}
                    style={{marginLeft:'auto',padding:'4px 12px',fontSize:11,fontWeight:600,background:copied.fb?T.green:'#1877F2',color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}}>
                    {copied.fb?'Copied!':'Copy'}
                  </button>
                </div>
                <div style={{fontSize:12,color:T.text,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{result.facebook?.caption}</div>
              </div>

              {/* TikTok */}
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,padding:14,marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <span style={{fontSize:20}}>🎵</span>
                  <span style={{fontSize:13,fontWeight:700,color:T.text}}>TikTok {mediaType==='reel'?'Video':'Photo Mode'}</span>
                  <button onClick={()=>copy('tt',`${result.tiktok?.hook}\n\n${result.tiktok?.caption}`)}
                    style={{marginLeft:'auto',padding:'4px 12px',fontSize:11,fontWeight:600,background:copied.tt?T.green:'#000',color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}}>
                    {copied.tt?'Copied!':'Copy'}
                  </button>
                </div>
                {mediaType==='reel' && (
                  <div style={{background:T.bg,borderRadius:6,padding:'6px 10px',marginBottom:8,fontSize:11,fontWeight:600,color:T.text}}>
                    Hook (first 3 seconds): {result.tiktok?.hook}
                  </div>
                )}
                <div style={{fontSize:12,color:T.text,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{result.tiktok?.caption}</div>
              </div>

              {/* GBP */}
              <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:10,padding:14,marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <span style={{fontSize:20}}>📍</span>
                  <span style={{fontSize:13,fontWeight:700,color:T.text}}>Google Business Profile Post</span>
                  <button onClick={()=>copy('gbp',result.gbp?.post)}
                    style={{marginLeft:'auto',padding:'4px 12px',fontSize:11,fontWeight:600,background:copied.gbp?T.green:'#34A853',color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}}>
                    {copied.gbp?'Copied!':'Copy'}
                  </button>
                </div>
                <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{result.gbp?.post}</div>
                <div style={{fontSize:10,color:T.textMuted,marginTop:6}}>{result.gbp?.post?.length || 0}/300 characters</div>
              </div>

              {/* Post another */}
              <button onClick={()=>{setResult(null);setImage(null);setImagePreview(null);setBranch('');setPostType('');setMediaType('photo')}}
                style={{width:'100%',padding:12,fontSize:13,fontWeight:600,background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,cursor:'pointer',marginBottom:16}}>
                Post another product
              </button>
            </div>
          )}
        </div>

      </Shell>
    </>
  )
}
