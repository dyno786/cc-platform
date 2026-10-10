import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import Shell from '../components/Shell'
import { T } from '../lib/theme'

// Add products: staff scan a barcode, the app finds the details on the price watch shops,
// writes the listing and saves it in Shopify as a draft. Products with options (colour, size,
// hair length) get one barcode per option, then photos are attached on the Photos tab.

const KINDS = [
  { id: 'single', label: 'One product', hint: 'No colours or sizes to choose', names: [] },
  { id: 'colour', label: 'Colours or shades', hint: 'Hair dye, lipstick, edge control scents', names: ['Colour'] },
  { id: 'size', label: 'Sizes', hint: 'Same product in 100ml, 250ml, 500ml', names: ['Size'] },
  { id: 'hair', label: 'Hair: lengths and colours', hint: 'Extensions, weaves, wigs, braids', names: ['Length', 'Colour'] },
]

const box = { background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }
const input = { width: '100%', padding: '11px 12px', fontSize: 16, border: `1px solid ${T.border}`, borderRadius: 8, background: '#fff', color: T.text }
const btn = (bg, fg, bd) => ({ padding: '11px 16px', fontSize: 15, fontWeight: 600, borderRadius: 8, border: `1px solid ${bd || bg}`, background: bg, color: fg, cursor: 'pointer' })
const primary = btn(T.green, '#fff'), plain = btn('#fff', T.text, T.border)
const label = { display: 'block', fontSize: 13, fontWeight: 600, color: T.text, margin: '0 0 6px' }
const hint = { fontSize: 12.5, color: T.textMuted, lineHeight: 1.45 }
const digits = s => String(s || '').replace(/[^0-9]/g, '')

async function api(path, body) {
  try {
    const r = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined)
    return await r.json()
  } catch (e) { return { ok: false, error: 'No connection. Check the internet and try again.' } }
}

// ---------- camera scanner ----------
function Camera({ onCode, onClose }) {
  const video = useRef(null)
  const [msg, setMsg] = useState('Starting the camera…')
  useEffect(() => {
    let stop = false, stream = null, reader = null
    const done = code => { if (stop) return; const c = digits(code); if (c.length >= 6) { stop = true; onCode(c) } }
    async function start() {
      try {
        if ('BarcodeDetector' in window) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          video.current.srcObject = stream; await video.current.play()
          setMsg('Hold the barcode in front of the camera.')
          const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] })
          const tick = async () => { if (stop) return; try { const f = await det.detect(video.current); if (f[0]) return done(f[0].rawValue) } catch (e) { } setTimeout(tick, 250) }
          tick()
        } else {
          await new Promise((ok, bad) => { if (window.ZXing) return ok(); const s = document.createElement('script'); s.src = 'https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js'; s.onload = ok; s.onerror = bad; document.head.appendChild(s) })
          reader = new window.ZXing.BrowserMultiFormatReader()
          setMsg('Hold the barcode in front of the camera.')
          reader.decodeFromConstraints({ video: { facingMode: 'environment' } }, video.current, result => { if (result) done(result.getText()) })
        }
      } catch (e) { setMsg('The camera could not be opened. Allow camera access for this site, or type the barcode instead.') }
    }
    start()
    return () => { stop = true; try { if (reader) reader.reset() } catch (e) { } try { if (stream) stream.getTracks().forEach(t => t.stop()) } catch (e) { } }
  }, [])
  return (
    <div style={{ ...box, background: '#111', color: '#fff' }}>
      <video ref={video} playsInline muted style={{ width: '100%', maxHeight: 300, borderRadius: 8, background: '#000', objectFit: 'cover' }} />
      <div style={{ fontSize: 13, margin: '10px 0' }}>{msg}</div>
      <button style={plain} onClick={onClose}>Close camera</button>
    </div>
  )
}

// One barcode field. A handheld scanner types the numbers and presses Enter, which jumps to the next field.
function CodeField({ value, onChange, onCamera, placeholder }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <input className="cc-code" inputMode="numeric" style={{ ...input, fontFamily: 'ui-monospace,monospace' }} placeholder={placeholder || 'Scan barcode'} value={value}
        onChange={e => onChange(digits(e.target.value))}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const all = [...document.querySelectorAll('input.cc-code')]; const next = all.slice(all.indexOf(e.target) + 1).find(x => !x.value); if (next) next.focus(); else e.target.blur() } }} />
      {onCamera && <button type="button" title="Scan with the camera" style={{ ...plain, padding: '0 12px' }} onClick={onCamera}>📷</button>}
    </div>
  )
}

function Note({ kind, children }) {
  const c = kind === 'bad' ? [T.redBg, T.red, T.redBorder] : kind === 'warn' ? [T.amberBg, '#7d5a00', T.amberBorder] : kind === 'good' ? [T.greenBg, T.green, T.greenBorder] : [T.blueBg, T.blue, T.blueBorder]
  return <div style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, borderRadius: 8, padding: '10px 12px', fontSize: 14, lineHeight: 1.45, marginBottom: 12 }}>{children}</div>
}

// ---------- scan tab ----------
function ScanTab({ goPhotos }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [look, setLook] = useState(null)        // answer from the lookup
  const [pick, setPick] = useState(0)           // which shop's details to use
  const [imgs, setImgs] = useState([])          // chosen picture addresses
  const [name, setName] = useState(''); const [brand, setBrand] = useState('')
  const [kind, setKind] = useState('single')
  const [rows, setRows] = useState([{ value: '', barcode: '' }])            // one option: value + barcode
  const [lengths, setLengths] = useState(''); const [colours, setColours] = useState('')
  const [grid, setGrid] = useState({})                                      // "length|colour" -> barcode
  const [cam, setCam] = useState(null)          // which field the camera fills: 'main' | row index | grid key
  const [done, setDone] = useState(null)
  const first = useRef(null)

  useEffect(() => { if (first.current) first.current.focus() }, [look, done])

  function reset() { setCode(''); setLook(null); setErr(''); setPick(0); setImgs([]); setName(''); setBrand(''); setKind('single'); setRows([{ value: '', barcode: '' }]); setLengths(''); setColours(''); setGrid({}); setDone(null) }

  async function lookup(c) {
    const bc = digits(c || code)
    if (bc.length < 6) { setErr('Scan or type the barcode first.'); return }
    setErr(''); setBusy('Looking this barcode up on ' + 17 + ' shops…'); setLook(null); setDone(null)
    const d = await api('/api/intake-lookup?barcode=' + bc)
    setBusy('')
    if (!d.ok) { setErr(d.error || 'The lookup failed.'); return }
    setCode(bc); setLook(d); setPick(0)
    const f = d.found[0]
    setImgs(f ? f.images.slice(0, 4) : [])
    setRows([{ value: f && f.variantTitle ? f.variantTitle : '', barcode: bc }])
    if (f && f.variants && f.variants.length > 1) setKind(f.optionNames.length >= 2 ? 'hair' : /size|ml|oz|volume/i.test(f.optionNames[0] || '') ? 'size' : 'colour')
    else setKind('single')
  }

  const src = look && look.found[pick]
  const lens = lengths.split(',').map(s => s.trim()).filter(Boolean), cols = colours.split(',').map(s => s.trim()).filter(Boolean)
  const kindDef = KINDS.find(k => k.id === kind)

  function fillFromShop() {
    if (!src || !src.variants.length) return
    if (kind === 'hair') {
      const L = [...new Set(src.variants.map(v => v.options[0]).filter(Boolean))], C = [...new Set(src.variants.map(v => v.options[1]).filter(Boolean))]
      setLengths(L.join(', ')); setColours(C.join(', '))
      const g = {}; for (const v of src.variants) if (v.options[0] && v.options[1] && v.barcode) g[v.options[0] + '|' + v.options[1]] = v.barcode
      setGrid(g)
    } else setRows(src.variants.map(v => ({ value: v.options.join(' / ') || v.title, barcode: v.barcode })))
  }

  async function save() {
    setErr('')
    let variants = [], optionNames = kindDef.names
    if (kind === 'hair') {
      for (const l of lens) for (const c of cols) { const b = grid[l + '|' + c]; if (b) variants.push({ values: [l, c], barcode: b }) }
      if (!lens.length || !cols.length) { setErr('Type the lengths and the colours first.'); return }
      if (!variants.length) { setErr('Scan a barcode for at least one length and colour.'); return }
    } else if (kind !== 'single') {
      variants = rows.filter(r => r.value.trim() && r.barcode).map(r => ({ values: [r.value.trim()], barcode: r.barcode }))
      if (!variants.length) { setErr('Add at least one ' + optionNames[0].toLowerCase() + ' with its barcode.'); return }
      const half = rows.find(r => (r.value.trim() && !r.barcode) || (!r.value.trim() && r.barcode))
      if (half) { setErr('One row has a ' + (half.barcode ? 'barcode but no ' + optionNames[0].toLowerCase() : optionNames[0].toLowerCase() + ' but no barcode') + '. Fill it in or remove it.'); return }
    }
    if (!look.found.length && !name.trim()) { setErr('Type the product name. No other shop had this barcode.'); return }
    setBusy('Writing the listing and saving the draft… this takes up to a minute.')
    const d = await api('/api/intake-create', { barcode: code, sources: src ? [src, ...look.found.filter((_, i) => i !== pick).slice(0, 2)] : [], name, brand, images: imgs, optionNames, variants })
    setBusy('')
    if (!d.ok) { setErr(d.error || 'It could not be saved.'); return }
    setDone({ ...d, hasOptions: kind !== 'single' })
  }

  const onCam = c => { if (cam === 'main') { setCam(null); setCode(c); lookup(c) } else if (typeof cam === 'number') { setRows(rows.map((r, i) => i === cam ? { ...r, barcode: c } : r)); setCam(null) } else if (cam) { setGrid({ ...grid, [cam]: c }); setCam(null) } }

  if (done) return (
    <div style={box}>
      <Note kind="good"><b>Saved as a draft.</b> Customers cannot see it until it is approved in Shopify.</Note>
      {done.warn && <Note kind="warn">{done.warn}</Note>}
      {done.flagged && <Note kind="warn">This looks like a skin lightening product, so no selling description was written. It is marked for the owner to check.</Note>}
      {!done.written && !done.flagged && <Note kind="warn">The description could not be written automatically, so only the name was saved. It is marked as needing wording.</Note>}
      <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{done.title}</div>
      <div style={hint}>Brand: {done.vendor || 'not set'} · Category: {done.type || 'not set'} · Pictures: {done.images}{done.options ? ' · Options: ' + done.options : ''}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        <button style={primary} onClick={reset}>Scan the next product</button>
        {done.hasOptions && <button style={plain} onClick={goPhotos}>Add photos for the options</button>}
        <a style={{ ...plain, textDecoration: 'none' }} href={done.adminUrl} target="_blank" rel="noreferrer">Open in Shopify</a>
      </div>
    </div>
  )

  return (
    <div>
      {cam !== null && <Camera onCode={onCam} onClose={() => setCam(null)} />}
      <div style={box}>
        <label style={label}>1. Scan the barcode</label>
        <form onSubmit={e => { e.preventDefault(); lookup() }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input ref={look ? null : first} inputMode="numeric" autoFocus style={{ ...input, flex: '1 1 180px', fontFamily: 'ui-monospace,monospace', fontSize: 18 }} placeholder="Scan or type the barcode" value={code} onChange={e => setCode(digits(e.target.value))} />
          <button type="button" style={plain} onClick={() => setCam('main')}>📷 Camera</button>
          <button type="submit" style={primary} disabled={!!busy}>Look up</button>
        </form>
        <div style={{ ...hint, marginTop: 8 }}>A handheld scanner works here: click in the box and scan.</div>
      </div>

      {busy && <Note>{busy}</Note>}
      {err && <Note kind="bad">{err}</Note>}

      {look && look.ours && (
        <div style={box}>
          <Note kind="warn"><b>This barcode is already in the shop.</b></Note>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{look.ours.title}</div>
          <div style={hint}>{look.ours.variantTitle && look.ours.variantTitle !== 'Default Title' ? 'Option: ' + look.ours.variantTitle + ' · ' : ''}Status: {look.ours.status === 'ACTIVE' ? 'Live' : look.ours.status === 'DRAFT' ? 'Draft' : 'Archived'}</div>
          <button style={{ ...primary, marginTop: 12 }} onClick={reset}>Scan the next product</button>
        </div>
      )}

      {look && !look.ours && (
        <>
          <div style={box}>
            <label style={label}>2. Check the details</label>
            {look.found.length === 0 ? (
              <>
                <Note kind="warn">None of the shops had this barcode. Type the name from the packaging and it will be saved without a picture.</Note>
                <label style={label}>Product name and size</label>
                <input style={{ ...input, marginBottom: 10 }} placeholder="e.g. Cantu Shea Butter Edge Stay Gel 2.25 oz" value={name} onChange={e => setName(e.target.value)} />
                <label style={label}>Brand</label>
                <input style={input} placeholder="e.g. Cantu" value={brand} onChange={e => setBrand(e.target.value)} />
              </>
            ) : (
              <>
                <div style={{ ...hint, marginBottom: 8 }}>Found on {look.found.length} {look.found.length === 1 ? 'shop' : 'shops'}. Pick the one that matches what is in your hand.</div>
                {look.found.slice(0, 5).map((f, i) => (
                  <label key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 10, border: `1px solid ${i === pick ? T.green : T.borderLight}`, background: i === pick ? T.greenBg : '#fff', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}>
                    <input type="radio" checked={i === pick} onChange={() => { setPick(i); setImgs(f.images.slice(0, 4)) }} style={{ marginTop: 4 }} />
                    {f.images[0] && <img src={f.images[0]} alt="" style={{ width: 56, height: 56, objectFit: 'contain', background: '#fff', borderRadius: 6, border: `1px solid ${T.borderLight}` }} />}
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: T.text }}>{f.title}{f.variantTitle ? ' – ' + f.variantTitle : ''}</span>
                      <span style={hint}>{f.shop}{f.vendor ? ' · ' + f.vendor : ''}{f.price ? ' · they charge £' + Number(f.price).toFixed(2) : ''}{f.exact ? '' : ' · name match only, check it'}</span>
                    </span>
                  </label>
                ))}
                {src && src.images.length > 0 && (
                  <>
                    <label style={{ ...label, marginTop: 12 }}>Pictures to use (tap to remove or add)</label>
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                      {src.images.map(u => { const on = imgs.includes(u); return (
                        <button key={u} type="button" onClick={() => setImgs(on ? imgs.filter(x => x !== u) : [...imgs, u])} style={{ flex: '0 0 84px', height: 84, padding: 2, borderRadius: 8, border: `2px solid ${on ? T.green : T.border}`, background: '#fff', opacity: on ? 1 : 0.45, cursor: 'pointer' }}>
                          <img src={u} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </button>) })}
                    </div>
                    <div style={hint}>These are the other shop's pictures. Only keep ones that show the plain product pack.</div>
                  </>
                )}
              </>
            )}
          </div>

          <div style={box}>
            <label style={label}>3. Does it come in different options?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
              {KINDS.map(k => (
                <button key={k.id} type="button" onClick={() => setKind(k.id)} style={{ textAlign: 'left', padding: 10, borderRadius: 8, cursor: 'pointer', border: `1px solid ${kind === k.id ? T.green : T.border}`, background: kind === k.id ? T.greenBg : '#fff' }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: T.text }}>{k.label}</div>
                  <div style={hint}>{k.hint}</div>
                </button>
              ))}
            </div>

            {kind !== 'single' && src && src.variants.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <button type="button" style={plain} onClick={fillFromShop}>Fill in the {src.variants.length} options listed by {src.shop}</button>
                <div style={{ ...hint, marginTop: 4 }}>Then remove any you do not stock and check each barcode against the pack.</div>
              </div>
            )}

            {(kind === 'colour' || kind === 'size') && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr) 36px', gap: 6, alignItems: 'center' }}>
                  <div style={label}>{kindDef.names[0]}</div><div style={label}>Barcode</div><div />
                  {rows.map((r, i) => [
                    <input key={'v' + i} style={input} placeholder={kind === 'size' ? 'e.g. 250ml' : 'e.g. 1B Off Black'} value={r.value} onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />,
                    <CodeField key={'b' + i} value={r.barcode} onChange={v => setRows(rows.map((x, j) => j === i ? { ...x, barcode: v } : x))} onCamera={() => setCam(i)} />,
                    <button key={'x' + i} type="button" title="Remove this row" style={{ ...plain, padding: '8px 0' }} onClick={() => setRows(rows.length > 1 ? rows.filter((_, j) => j !== i) : [{ value: '', barcode: '' }])}>✕</button>,
                  ])}
                </div>
                <button type="button" style={{ ...plain, marginTop: 10 }} onClick={() => setRows([...rows, { value: '', barcode: '' }])}>+ Add another {kindDef.names[0].toLowerCase()}</button>
              </div>
            )}

            {kind === 'hair' && (
              <div style={{ marginTop: 14 }}>
                <label style={label}>Lengths (put a comma between each)</label>
                <input style={{ ...input, marginBottom: 10 }} placeholder='e.g. 10", 12", 14", 16", 18"' value={lengths} onChange={e => setLengths(e.target.value)} />
                <label style={label}>Colours (put a comma between each)</label>
                <input style={input} placeholder="e.g. 1, 1B, 2, 4, 27, 613" value={colours} onChange={e => setColours(e.target.value)} />
                {lens.length > 0 && cols.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ ...hint, marginBottom: 8 }}>Scan the barcode for each one you stock. Leave the others empty and they will not be added. {lens.length * cols.length > 100 && <b>Shopify allows 100 options on one product; only the first 100 with barcodes are saved.</b>}</div>
                    {lens.map(l => (
                      <div key={l} style={{ border: `1px solid ${T.borderLight}`, borderRadius: 8, padding: 10, marginBottom: 8 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 8 }}>Length {l}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(70px,auto) minmax(0,1fr)', gap: 6, alignItems: 'center' }}>
                          {cols.map(c => [
                            <div key={'n' + c} style={{ fontSize: 14 }}>{c}</div>,
                            <CodeField key={'f' + c} value={grid[l + '|' + c] || ''} onChange={v => setGrid({ ...grid, [l + '|' + c]: v })} onCamera={() => setCam(l + '|' + c)} />,
                          ])}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={box}>
            <button style={{ ...primary, width: '100%', fontSize: 16, padding: 14 }} disabled={!!busy} onClick={save}>{busy ? 'Saving…' : 'Save as a draft'}</button>
            <div style={{ ...hint, marginTop: 8 }}>No price or stock is set here. They come from the data file. The owner approves the draft before customers see it.</div>
          </div>
        </>
      )}
    </div>
  )
}

// ---------- photos tab ----------
function shrink(file) {
  return new Promise((ok, bad) => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 1800, k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.88))
    }
    img.onerror = () => { URL.revokeObjectURL(url); bad(new Error('not a picture')) }
    img.src = url
  })
}

function PhotosTab() {
  const [list, setList] = useState(null)
  const [err, setErr] = useState('')
  const [log, setLog] = useState({})            // product id -> lines
  const [busy, setBusy] = useState('')
  const [copied, setCopied] = useState('')

  async function load() { setErr(''); const d = await api('/api/intake-list'); if (!d.ok) { setErr(d.error || 'Could not load the list.'); setList([]) } else setList(d.products) }
  useEffect(() => { load() }, [])

  const sheet = p => 'PRODUCT: ' + p.title + '\n\nPlease make one clean product photo for each option below, on a plain white background, square.\nSave each finished picture with EXACTLY the file name shown. The file name is the barcode. It is how the website knows which option the picture belongs to.\n\n' +
    p.variants.map((v, i) => (i + 1) + '. ' + v.title + '  ->  ' + v.barcode + '.jpg').join('\n') + '\n\nDo not rename the files. Send back ' + p.variants.length + ' pictures.'

  async function copy(p) { try { await navigator.clipboard.writeText(sheet(p)); setCopied(p.id); setTimeout(() => setCopied(''), 2500) } catch (e) { window.prompt('Copy this text:', sheet(p)) } }

  async function upload(p, files) {
    const lines = []
    const say = (t, kind) => { lines.push({ t, kind }); setLog(l => ({ ...l, [p.id]: [...lines] })) }
    setBusy(p.id)
    for (const f of [...files]) {
      const code = digits(f.name.replace(/\.[a-z0-9]+$/i, ''))
      const v = p.variants.find(x => x.barcode && (x.barcode === code || (code.length >= 8 && code.includes(x.barcode))))
      if (!v) { say(f.name + ': no option has this barcode. Rename the file to the barcode and try again.', 'bad'); continue }
      if (v.hasPhoto) { say(f.name + ': ' + v.title + ' already has a photo, so this one was skipped.', 'warn'); continue }
      let data
      try { data = await shrink(f) } catch (e) { say(f.name + ': this file is not a picture.', 'bad'); continue }
      const d = await api('/api/intake-photo', { productId: p.id, variantId: v.id, data, alt: p.title + ' - ' + v.title })
      if (d.ok) { v.hasPhoto = true; say(f.name + ': added to ' + v.title + '.', 'good') } else say(f.name + ': ' + (d.error || 'failed'), 'bad')
    }
    setBusy(''); load()
  }

  if (list === null) return <Note>Loading…</Note>
  return (
    <div>
      {err && <Note kind="bad">{err}</Note>}
      <div style={box}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>How photos get onto the right option</div>
        <ol style={{ ...hint, fontSize: 13.5, paddingLeft: 18, margin: 0 }}>
          <li>Take a photo of each option.</li>
          <li>Press <b>Copy list for ChatGPT</b> and paste it into ChatGPT with your photos. The list tells it to name each picture with the barcode.</li>
          <li>Save the finished pictures, then press <b>Upload photos</b> and choose them all at once. Each one is matched to its option by the barcode in the file name.</li>
        </ol>
      </div>
      {list.length === 0 && !err && <Note>No products are waiting for photos.</Note>}
      {list.map(p => {
        const have = p.variants.filter(v => v.hasPhoto).length
        return (
          <div key={p.id} style={box}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              {p.image && <img src={p.image} alt="" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6, border: `1px solid ${T.borderLight}` }} />}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600 }}>{p.title}</div>
                <div style={hint}>{have} of {p.variants.length} options have a photo · added {p.created}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <button style={plain} onClick={() => copy(p)}>{copied === p.id ? 'Copied' : 'Copy list for ChatGPT'}</button>
              <label style={{ ...primary, opacity: busy ? 0.6 : 1 }}>{busy === p.id ? 'Uploading…' : 'Upload photos'}
                <input type="file" accept="image/*" multiple disabled={!!busy} style={{ display: 'none' }} onChange={e => { const f = e.target.files; if (f && f.length) upload(p, f); e.target.value = '' }} />
              </label>
              <a style={{ ...plain, textDecoration: 'none' }} href={p.adminUrl} target="_blank" rel="noreferrer">Open in Shopify</a>
            </div>
            {(log[p.id] || []).map((l, i) => <div key={i} style={{ fontSize: 13, color: l.kind === 'bad' ? T.red : l.kind === 'warn' ? '#7d5a00' : T.green, marginBottom: 3 }}>{l.t}</div>)}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto auto', gap: '6px 12px', fontSize: 13.5, marginTop: 8, alignItems: 'center' }}>
              <div style={{ ...hint, fontWeight: 600 }}>Option</div><div style={{ ...hint, fontWeight: 600 }}>File name to use</div><div style={{ ...hint, fontWeight: 600 }}>Photo</div>
              {p.variants.map(v => [
                <div key={v.id + 'a'}>{v.title}</div>,
                <div key={v.id + 'b'} style={{ fontFamily: 'ui-monospace,monospace' }}>{v.barcode ? v.barcode + '.jpg' : 'no barcode'}</div>,
                <div key={v.id + 'c'} style={{ color: v.hasPhoto ? T.green : T.textMuted }}>{v.hasPhoto ? 'Yes' : 'Needed'}</div>,
              ])}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Intake() {
  const [tab, setTab] = useState('scan')
  return (
    <Shell title="Add products" subtitle="Scan a barcode to add a product as a draft">
      <Head><title>Add products · CC</title></Head>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['scan', 'Scan a product'], ['photos', 'Photos for options']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={{ ...btn(tab === id ? T.text : '#fff', tab === id ? '#fff' : T.text, tab === id ? T.text : T.border), flex: 1 }}>{l}</button>
          ))}
        </div>
        {tab === 'scan' ? <ScanTab goPhotos={() => setTab('photos')} /> : <PhotosTab />}
      </div>
    </Shell>
  )
}
