import Head from 'next/head'
import Nav from '../components/Nav'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const C = {
  bg:'#0f1117', surface:'#1a1d27', surface2:'#22263a',
  border:'#2e3347', text:'#e8eaf0', text2:'#8b90a7', text3:'#555b75',
  green:'#22c55e', amber:'#f59e0b', red:'#ef4444',
  blue:'#3b82f6', accent:'#6366f1', accent2:'#818cf8',
}

const QUICK = [
  { icon:'📍', label:'GBP Post — Weekly offer',      prompt:'Write a Google Business Profile post for CC Hair & Beauty Leeds (all 3 branches: Chapeltown LS7, Roundhay LS8, City Centre). Feature a weekly offer. Start with an emoji. Use one of these codes if relevant: WIGDEAL15, COLOUR10, EDGE15, BRAID10.' },
  { icon:'✍️', label:'Blog — Natural hair Leeds',     prompt:'Write a 400-word SEO blog post for CC Hair & Beauty Leeds about natural hair care products available in Leeds. Include local keywords, product recommendations from brands like ORS, Cantu, Mielle, and a call to action to visit cchairandbeauty.com.' },
  { icon:'📊', label:'Google Ad — Wigs Leeds',        prompt:'Write 3 Google Ads headlines (max 30 chars each) and 2 descriptions (max 90 chars each) for CC Hair & Beauty Leeds targeting customers searching for wigs in Leeds.' },
  { icon:'📸', label:'Instagram — New stock',         prompt:'Write an Instagram caption for CC Hair & Beauty Leeds announcing new stock arrivals. Engaging tone, include relevant hashtags: #LeedsHair #NaturalHair #CCHairBeauty #HairShopLeeds. Max 3 lines then hashtags.' },
  { icon:'⭐', label:'Review request — SMS',          prompt:'Write a friendly SMS (max 160 chars) asking a recent CC Hair & Beauty customer to leave a Google review. Include [REVIEW_LINK] placeholder. Warm and not pushy.' },
  { icon:'📧', label:'Abandoned cart — Email',        prompt:'Write a short friendly email to recover an abandoned cart for CC Hair & Beauty online store. Customer left items in basket. Subject line + 3 short paragraphs. Include 10% off code COMEBACK10 as incentive.' },
  { icon:'📍', label:'GBP Post — City Centre push',   prompt:'Write an urgent Google Business Profile post specifically for CC Hair & Beauty City Centre branch (New York Street, Leeds). Our rating is 3.3 stars and we need more reviews. Invite customers to visit and leave a review.' },
  { icon:'🔍', label:'Meta description — Wigs page',  prompt:'Write an SEO meta description for CC Hair & Beauty wigs collection page. Max 155 characters. Include "Leeds", "wigs", and a call to action. Must be compelling for search results.' },
  { icon:'✍️', label:'Blog — Braiding hair guide',    prompt:'Write a 400-word SEO blog post for CC Hair & Beauty Leeds titled "Where to buy braiding hair in Leeds — complete guide 2026". Target keyword: braiding hair leeds. Include types of braiding hair stocked, prices, and store locations.' },
  { icon:'📊', label:'Ad copy — ORS products',        prompt:'Write Google Ads copy for CC Hair & Beauty Leeds promoting ORS (Olive Oil for Hair) products. 3 headlines max 30 chars, 2 descriptions max 90 chars. Highlight availability in Leeds stores and online.' },
  { icon:'📸', label:'Instagram — Branch feature',    prompt:'Write an Instagram caption featuring one of CC Hair & Beauty 3 Leeds branches. Pick Chapeltown LS7. Warm community feel. Include opening hours hint and invite followers to visit. Hashtags at end.' },
  { icon:'🔑', label:'Product description — Edge control', prompt:'Write a compelling Shopify product description for an edge control styling product at CC Hair & Beauty. 2 paragraphs, focus on benefits, finish, hold strength, suitable hair types. Professional but accessible tone.' },
]

const SYSTEM = `You are the content writer for CC Hair & Beauty, a specialist hair and beauty retailer in Leeds, UK (established 1979).

Business details:
- 3 branches: Chapeltown (LS7), Roundhay (LS8), City Centre (New York Street)  
- Website: cchairandbeauty.com
- 23,000+ products including ORS, Cantu, Mielle, Redken, Loreal, Wella, Dark & Lovely, Africa's Best
- Specialises in Afro, natural, relaxed and textured hair products
- Discount codes: WIGDEAL15 (wigs), COLOUR10 (hair dye), EDGE15 (edge control), BRAID10 (braiding), OIL10 (oils), GROW10 (growth)
- Google ratings: Chapeltown 4.0★, Roundhay 3.8★, City Centre 3.3★

Write content that sounds authentic, local, and knowledgeable — not generic AI content.`

export default function ContentStudioPage() {
  const [input, setInput]       = useState('')
  const [output, setOutput]     = useState('')
  const [streaming, setStreaming] = useState(false)
  const [history, setHistory]   = useState([])
  const [copied, setCopied]     = useState(false)
  const [activeHistory, setActiveHistory] = useState(null)
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  async function generate(prompt) {
    const p = prompt || input
    if (!p.trim() || streaming) return
    setStreaming(true)
    setOutput('')
    setActiveHistory(null)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          system: SYSTEM,
          messages: [{ role: 'user', content: p }],
        }),
      })

      const data = await res.json()
      const text = data.content?.[0]?.text || 'Failed to generate — check API key'
      setOutput(text)
      setHistory(prev => [{ id: Date.now(), prompt: p, output: text, time: new Date().toLocaleTimeString('en-GB') }, ...prev.slice(0, 19)])
    } catch(e) {
      setOutput('Error: ' + e.message)
    }
    setStreaming(false)
  }

  function copy() {
    const text = activeHistory ? activeHistory.output : output
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function clear() {
    setOutput('')
    setInput('')
    setActiveHistory(null)
  }

  const displayOutput = activeHistory ? activeHistory.output : output
  const displayPrompt = activeHistory ? activeHistory.prompt : null

  return (
    <>
      <Head>
        <title>Content Studio — CC Intelligence</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
          button,textarea{font-family:inherit}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>
      </Head>

      <Nav/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',height:'calc(100vh - 52px)'}}>

        {/* MAIN — prompt + output */}
        <div style={{display:'flex',flexDirection:'column',borderRight:'1px solid '+C.border}}>

          {/* Quick prompts */}
          <div style={{padding:'12px 16px',borderBottom:'1px solid '+C.border,overflowX:'auto',scrollbarWidth:'none'}}>
            <div style={{display:'flex',gap:6,width:'max-content'}}>
              {QUICK.map((q, i) => (
                <button
                  key={i}
                  onClick={() => generate(q.prompt)}
                  disabled={streaming}
                  style={{
                    padding:'6px 12px', borderRadius:8, border:'1px solid '+C.border,
                    background:C.surface, color:C.text2, cursor:'pointer', fontSize:12,
                    whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5,
                    transition:'all .12s',
                  }}
                >
                  {q.icon} {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Output area */}
          <div ref={outputRef} style={{flex:1,overflowY:'auto',padding:20}}>
            {!displayOutput && !streaming && (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:16,color:C.text3}}>
                <div style={{fontSize:52}}>✍️</div>
                <div style={{fontSize:18,fontWeight:600,color:C.text2}}>Content Studio</div>
                <div style={{fontSize:13,maxWidth:400,textAlign:'center',lineHeight:1.7}}>
                  Click a quick prompt above or type your own below.<br/>
                  Every piece of content is tailored for CC Hair &amp; Beauty Leeds.
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,maxWidth:400,marginTop:8}}>
                  {['GBP posts','Blog posts','Google Ads','Instagram captions','Email campaigns','SMS messages','Product descriptions','Meta descriptions'].map(t => (
                    <div key={t} style={{background:C.surface,border:'1px solid '+C.border,borderRadius:8,padding:'8px 12px',fontSize:12,color:C.text2,textAlign:'center'}}>✓ {t}</div>
                  ))}
                </div>
              </div>
            )}

            {streaming && !displayOutput && (
              <div style={{display:'flex',gap:10,alignItems:'center',color:C.text3,padding:20}}>
                <span style={{fontSize:20}}>⟳</span> Writing content...
              </div>
            )}

            {displayOutput && (
              <div>
                {displayPrompt && (
                  <div style={{background:C.surface2,borderRadius:10,padding:12,marginBottom:14,fontSize:13,color:C.text3,lineHeight:1.5}}>
                    <span style={{color:C.accent2,fontWeight:600,marginRight:6}}>Prompt:</span>{displayPrompt}
                  </div>
                )}
                <div style={{background:C.surface,border:'1px solid '+C.accent+'30',borderRadius:12,padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <span style={{fontSize:11,fontWeight:700,color:C.accent2,textTransform:'uppercase',letterSpacing:'.06em'}}>✨ Generated Content</span>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={copy} style={{padding:'6px 14px',borderRadius:6,border:'none',background:copied?C.green:C.accent,color:copied?'#000':'#fff',fontWeight:600,fontSize:12,cursor:'pointer'}}>
                        {copied ? '✓ Copied!' : '📋 Copy'}
                      </button>
                      <button onClick={clear} style={{padding:'6px 12px',borderRadius:6,border:'1px solid '+C.border,background:C.surface2,color:C.text2,cursor:'pointer',fontSize:12}}>Clear</button>
                    </div>
                  </div>
                  <div style={{fontSize:14,color:C.text,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{displayOutput}</div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div style={{padding:16,borderTop:'1px solid '+C.border,background:C.surface}}>
            <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
                placeholder="Write a post about our new Mielle Organics range... or ask anything about CC Hair & Beauty content"
                rows={3}
                style={{
                  flex:1, background:C.surface2, border:'1px solid '+C.border,
                  borderRadius:10, color:C.text, fontSize:13, padding:'10px 14px',
                  resize:'none', outline:'none', lineHeight:1.5,
                }}
              />
              <button
                onClick={() => generate()}
                disabled={streaming || !input.trim()}
                style={{
                  padding:'12px 20px', borderRadius:10, border:'none',
                  background: streaming || !input.trim() ? C.surface2 : C.accent,
                  color: streaming || !input.trim() ? C.text3 : '#fff',
                  fontWeight:700, fontSize:14, cursor: streaming || !input.trim() ? 'default' : 'pointer',
                  flexShrink:0,
                }}
              >
                {streaming ? '⟳' : '↑ Send'}
              </button>
            </div>
            <div style={{color:C.text3,fontSize:11,marginTop:6}}>⌘+Enter to send · Content is tailored for CC Hair &amp; Beauty Leeds</div>
          </div>
        </div>

        {/* RIGHT — history */}
        <div style={{display:'flex',flexDirection:'column',background:C.surface}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid '+C.border,fontWeight:600,fontSize:13}}>
            History {history.length > 0 && <span style={{color:C.text3,fontWeight:400,marginLeft:4}}>({history.length})</span>}
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {history.length === 0 ? (
              <div style={{padding:20,textAlign:'center',color:C.text3,fontSize:13}}>
                Generated content will appear here
              </div>
            ) : (
              history.map(h => (
                <div
                  key={h.id}
                  onClick={() => setActiveHistory(activeHistory?.id === h.id ? null : h)}
                  style={{
                    padding:'12px 16px', borderBottom:'1px solid '+C.border,
                    cursor:'pointer', background: activeHistory?.id === h.id ? C.surface2 : 'transparent',
                    transition:'background .12s',
                  }}
                >
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <span style={{fontSize:11,color:C.text3}}>{h.time}</span>
                    <button
                      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(h.output) }}
                      style={{padding:'2px 8px',borderRadius:4,border:'1px solid '+C.border,background:C.surface,color:C.text3,cursor:'pointer',fontSize:10}}
                    >
                      Copy
                    </button>
                  </div>
                  <div style={{fontSize:12,color:C.text2,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',lineHeight:1.5}}>
                    {h.prompt}
                  </div>
                  <div style={{fontSize:11,color:C.text3,marginTop:4,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                    {h.output.substring(0, 60)}...
                  </div>
                </div>
              ))
            )}
          </div>
          {history.length > 0 && (
            <div style={{padding:12,borderTop:'1px solid '+C.border}}>
              <button
                onClick={() => setHistory([])}
                style={{width:'100%',padding:'7px',borderRadius:7,border:'1px solid '+C.border,background:C.surface2,color:C.text3,cursor:'pointer',fontSize:12}}
              >
                Clear history
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
