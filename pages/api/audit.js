// One-off helper for four clean-up jobs. Without go=1 each job only reports. Remove once done.
//   job=ping    is the writing key set up?
//   job=size    products whose title has no size: looks the barcode up on the price-watch shops and adds the size they agree on
//   job=brands  makes sure each product carries its own brand's collection tag
//   job=desc    writes a description for collections that still have none of the new-format text
import { gql, stripHtml, lookupElsewhere, policyFlag } from '../../lib/intake'

export const config = { maxDuration: 60 }

const RANKING = new Set(["13x4-brazilian-lace-wigs", "13x4-closures", "afro-sheen", "agor", "all", "arlos-beard-oil", "bobbi-boss-braids", "bobbi-boss-locs", "bsset", "cameleo", "cc-hair-beauty", "cc-hair-n-beauty", "collection-all", "daggett-and-ramsdell", "difeel-ultra-growth", "doctor-clear", "double-sheen", "dressmaker-brazilian-wigs", "edgebooster", "elasta-qp", "empress-lace-wigs", "frontpage", "hair-care", "hair-ecstasy", "hair-oil", "human-hair-wigs", "jahaitian", "janet-collection-synthetic-wigs-1", "jazzy-blended-hair-braiding", "jazzy-hair-crochet", "kali-braids", "kali-essential", "kali-lace-wigs-1", "kashmir-hair-cosmetics-leeds", "mizz-brazil", "model-model-cocktail-wigs-1", "mpl", "murray-collection", "offers", "outre-xpression", "parnevu", "permanent-hair-dyes", "poppy-ivy", "relaxers-kids", "rich-ruitz", "rush-silky-luxati-weft", "rush-virgin-brazilian-glamour", "search", "sleek-fashion-idol-weave", "sleek-hair-remy-gorgous", "smart-braid-vivitress", "synthetic-hair", "ultra-sheen", "via-natural-1", "view-all-wigs", "wigs"])
const FLUFFY = /than any|largest|number one|leading |ultimate|premium quality|high-quality|discover the|transform your|experience the|unleash|shop the latest|^(get |achieve|elevate|discover|experience|transform|unleash|upgrade|step up|say goodbye|indulge|revitali[sz]e|enhance|embrace|introducing|welcome|looking for|browse our)/i
const norm = s => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim()
const HAS_SIZE = /\d\s*(fl\s?oz|oz|ml|g|kg|l|lb|pcs|pc|pack|pieces?|inch|mm|cm|w)\b|\d\s*("|”|″|'')/i
const LIQUID = /shampoo|conditioner|oil|serum|cream|butter|lotion|gel|spray|sheen|mask|treatment|relaxer|texturi|colour|dye|soap|wash|cleanser|toner|pomade|wax|mousse|moistur|fragrance|deodor|leave-in|scrub|balm|jelly/i

export function sizesIn(text) {
  const out = []
  const re = /(\d+(?:\.\d+)?)\s*(fl\.?\s*oz|floz|oz|ounces?|mls?|millilit(?:re|er)s?|kgs?|grams?|gms?|gr|g|lit(?:re|er)s?|ltrs?|l|lbs?)\b/gi
  let m
  while ((m = re.exec(String(text || '')))) {
    const n = m[1], u = m[2].toLowerCase().replace(/[.\s]/g, '')
    const unit = /^fl/.test(u) ? ' fl oz' : /^o/.test(u) ? 'oz' : /^m/.test(u) ? 'ml' : /^k/.test(u) ? 'kg' : /^g/.test(u) ? 'g' : /^lb/.test(u) ? 'lb' : 'L'
    out.push({ n: parseFloat(n), unit: unit.trim(), text: n + unit })
  }
  return out
}

async function bulk(lines, mutation) {
  const su = await gql('mutation { stagedUploadsCreate(input: [{ resource: BULK_MUTATION_VARIABLES, filename: "vars.jsonl", mimeType: "text/jsonl", httpMethod: POST }]) { stagedTargets { url parameters { name value } } userErrors { message } } }')
  const tgt = su.stagedUploadsCreate.stagedTargets[0]
  const form = new FormData()
  let key = ''
  for (const prm of tgt.parameters) { form.append(prm.name, prm.value); if (prm.name === 'key') key = prm.value }
  form.append('file', new Blob([lines.join('\n')], { type: 'text/jsonl' }), 'vars.jsonl')
  const up = await fetch(tgt.url, { method: 'POST', body: form })
  if (!up.ok) throw new Error('upload failed ' + up.status)
  const run = await gql('mutation($m: String!, $p: String!) { bulkOperationRunMutation(mutation: $m, stagedUploadPath: $p) { bulkOperation { id status } userErrors { message } } }', { m: mutation, p: key })
  return run.bulkOperationRunMutation
}

async function beat(job, obj) {
  try {
    const sh = await gql('{ shop { id } }')
    await gql('mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { message } } }', { m: [{ ownerId: sh.shop.id, namespace: 'cc_audit', key: job, type: 'json', value: JSON.stringify({ at: new Date().toISOString(), ...obj }) }] })
  } catch (e) { }
}
async function readBeat() {
  const d = await gql('{ shop { size: metafield(namespace: "cc_audit", key: "size") { value } desc: metafield(namespace: "cc_audit", key: "desc") { value } } }')
  const j = v => { try { return JSON.parse(v.value) } catch (e) { return null } }
  return { size: j(d.shop.size), desc: j(d.shop.desc), now: new Date().toISOString() }
}

async function pool(items, n, fn) {
  let i = 0
  const work = async () => { while (i < items.length) { const it = items[i++]; await fn(it) } }
  await Promise.all(Array.from({ length: n }, work))
}

async function write(c) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const prompt = `You are writing the collection page text for CC Hair & Beauty, a family-run afro hair and beauty shop in Leeds, UK, trading since 1979.

COLLECTION NAME: ${c.title}
SOME OF THE PRODUCTS IN IT (titles only; this is everything you know about the range):
${c.products.map(p => '- ' + p).join('\n')}

Write the page text as HTML in exactly this shape:
<h2>[the collection name, tidied]</h2>
<p>[2 or 3 sentences saying what the range or category is and what is in it, naming product kinds and brands that appear in the titles above]</p>
<h3>[either "Which one do you need?" or "What's in the range"]</h3>
<ul>[3 to 5 <li> items, each starting with a <strong>product kind or name:</strong> then one plain sentence on what it is for]</ul>
<h3>Common questions</h3>
[2 or 3 questions a shopper would really ask, each as <p><strong>Question?</strong> Answer in one or two sentences.</p>]
<p>Order online for UK delivery, or visit CC Hair &amp; Beauty in Chapeltown, Roundhay or Leeds City Centre.</p>

RULES
- Plain UK English, short sentences, calm tone. No hype words (best, ultimate, amazing, premium, luxurious, transform, unleash, discover). No exclamation marks. No dashes used as punctuation.
- Only state what the product titles support, plus widely known, cautious general care advice. Never invent ingredients, sizes, prices, awards, reviews, stock levels or history of the brand.
- Never promise hair growth, hair regrowth, or any medical or skin-lightening result. If asked-about growth, say no product can speed up growth.
- For hair dye, bleach, relaxers, texturisers, hair removal and adhesives, tell the shopper to follow the pack and do a skin or strand test first.
- Do not praise brands or products (no trusted, reliable, professional-grade, popular, loved, quality, leading). Do not state how many products there are.
- Never mention fade creams, dark spot, brightening, lightening, whitening or even-tone products, even if they are in the list.
- Do not say "we are the largest", "number one", "widest range" or compare with other shops.
- Do not mention delivery prices or thresholds.
- If you are not sure what a product is for or how it works, name it and leave it at that. Do not guess how a tool or product works.
- If the name and titles do not tell you enough to write honestly, reply with exactly: SKIP

After the HTML, on a new line write META: followed by a 120 to 155 character search description in the same plain style.`
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 1400, messages: [{ role: 'user', content: prompt }] }),
    })
    const j = await r.json()
    const text = String(((j.content || [])[0] || {}).text || '').trim()
    if (!text || /^SKIP/.test(text)) return { skip: true, why: j.error ? j.error.message : 'skip' }
    const at = text.lastIndexOf('META:')
    let html = (at > 0 ? text.slice(0, at) : text).replace(/```html|```/g, '').trim()
    const meta = at > 0 ? text.slice(at + 5).replace(/\s+/g, ' ').trim().slice(0, 170) : ''
    if (!/^<h2>/.test(html) || !/<\/p>\s*$/.test(html)) return { skip: true, why: 'shape' }
    if (/\b(grow(s|th)? (your )?hair faster|regrow|lighten(s|ing)? (your )?skin|whiten|largest|number one|guarantee)/i.test(stripHtml(html)) && !/no product can/i.test(html)) return { skip: true, why: 'claim' }
    if (/fade (milk|cream)|dark spot|brighten|lighten|whiten|even ?tone|papaya|clarifying (lotion|cream|milk|soap)|trusted|professional-grade/i.test(stripHtml(html))) return { skip: true, why: 'banned wording' }
    html = html.replace(/\s+—\s+|\s+–\s+/g, ', ')
    return { html, meta }
  } catch (e) { return { skip: true, why: String(e.message || e) } }
}

export default async function handler(req, res) {
  const job = String(req.query.job || '')
  const go = req.query.go === '1'
  let cursor = req.query.cursor ? String(req.query.cursor) : null
  const started = Date.now()
  const counts = {}, samples = []
  const bump = (k, n) => { counts[k] = (counts[k] || 0) + (n || 1) }
  const chainOn = async (extra) => {
    const left = parseInt(req.query.left || '0', 10)
    if (!go || !(left > 0) || !cursor) return false
    const u = 'https://' + req.headers.host + '/api/audit?job=' + job + '&go=1&left=' + (left - 1) + '&cursor=' + encodeURIComponent(cursor) + (extra || '')
    fetch(u).catch(() => { })
    await new Promise(r => setTimeout(r, 1500))
    return true
  }
  try {
    if (job === 'selftest') {
      const u = 'https://' + req.headers.host + '/api/audit?job=ping'
      let out
      try { const r = await fetch(u); out = { status: r.status, body: (await r.text()).slice(0, 200) } } catch (e) { out = { error: String(e.message || e), cause: String((e.cause && e.cause.message) || '') } }
      return res.status(200).json({ ok: true, host: req.headers.host, out })
    }
    if (job === 'ping') return res.status(200).json({ ok: true, writingKey: !!process.env.ANTHROPIC_API_KEY, progress: await readBeat() })

    if (job === 'size') {
      let seen = 0, done = false
      while (Date.now() - started < 36000) {
        const d = await gql('query($c: String) { products(first: 40, after: $c, reverse: ' + (req.query.rev === '1') + ', query: "status:active") { pageInfo { hasNextPage endCursor } nodes { id title productType vendor vol: metafield(namespace: "custom", key: "volume") { value } old: metafield(namespace: "custom", key: "old_title") { value } variants(first: 3) { nodes { barcode } } } } }', { c: cursor })
        const cands = []
        for (const p of d.products.nodes || []) {
          seen++
          if (HAS_SIZE.test(p.title)) continue
          if (!LIQUID.test(p.productType + ' ' + p.title)) { bump('no size, not a bottle or jar'); continue }
          if (p.variants.nodes.length !== 1) { bump('no size, has options'); continue }
          const bc = (p.variants.nodes[0] || {}).barcode
          if (!bc || String(bc).replace(/\D/g, '').length < 8) { bump('no size, no barcode'); continue }
          cands.push({ p, bc })
        }
        await pool(cands, 4, async ({ p, bc }) => {
          bump('looked up')
          const found = (await lookupElsewhere(bc)).filter(f => f.exact && f.shop !== 'openbeautyfacts.org')
          if (!found.length) { bump('not found on other shops'); return }
          const tally = {}
          for (const f of found) { const seenHere = new Set(); for (const s of sizesIn(f.title + ' ' + (f.variantTitle || ''))) { if (!seenHere.has(s.text)) { seenHere.add(s.text); tally[s.text] = (tally[s.text] || { ...s, c: 0 }); tally[s.text].c++ } } }
          const list = Object.values(tally).sort((a, b) => b.c - a.c)
          if (!list.length) { bump('found, but no size shown there'); return }
          const top = list[0]
          const base = o => o.unit === 'ml' || o.unit === 'g' ? o.n : o.unit === 'L' || o.unit === 'kg' ? o.n * 1000 : o.unit === 'lb' ? o.n * 454 : o.n * 29
          const vals = list.map(base)
          if (top.c < 2 && list.length > 2) { bump('only one shop, several sizes shown'); return }
          if (Math.max(...vals) / Math.min(...vals) > 1.15 || list.some(o => o !== top && o.unit === top.unit && o.n !== top.n)) { bump('shops disagree on size'); if (samples.length < 12) samples.push({ t: p.title, disagree: list.map(o => o.text + ' x' + o.c) }); return }
          const mine = sizesIn(p.vol ? p.vol.value : '')[0]
          if (mine) bump(mine.unit === top.unit ? (mine.n === top.n ? 'our volume field agrees' : 'our volume field differs') : 'our volume field in another unit')
          const title = (p.title.replace(/\s+$/, '') + ' ' + top.text.replace(' fl oz', ' fl oz')).slice(0, 250)
          bump('size found')
          if (samples.length < 25) samples.push({ t: p.title, add: top.text, shops: found.length, ourField: p.vol ? p.vol.value : null })
          if (go) {
            const input = { id: p.id, title }
            if (!p.old) input.metafields = [{ namespace: 'custom', key: 'old_title', type: 'single_line_text_field', value: p.title.slice(0, 250) }]
            const r = await gql('mutation($i: ProductInput!) { productUpdate(input: $i) { userErrors { message } } }', { i: input })
            if (r.productUpdate.userErrors.length) bump('save error'); else bump('saved')
          }
        })
        if (!d.products.pageInfo.hasNextPage) { done = true; cursor = null; break }
        cursor = d.products.pageInfo.endCursor
      }
      const tot = { seen: seen + parseInt(req.query.ts || '0', 10), saved: (counts.saved || 0) + parseInt(req.query.tw || '0', 10) }
      if (go) await beat('size', { ...tot, done, cursor })
      const chained = done ? false : await chainOn('&ts=' + tot.seen + '&tw=' + tot.saved)
      return res.status(200).json({ ok: true, job, go, seen, counts, done, chained, cursor, samples })
    }

    if (job === 'brands') {
      const tagOf = {}
      let c = null
      for (;;) {
        const d = await gql('query($c: String) { collections(first: 250, after: $c) { pageInfo { hasNextPage endCursor } nodes { title ruleSet { rules { column relation condition } } } } }', { c })
        for (const n of d.collections.nodes) { const r = n.ruleSet && n.ruleSet.rules; if (r && r.length === 1 && r[0].column === 'TAG' && r[0].relation === 'EQUALS') tagOf[norm(r[0].condition)] = r[0].condition }
        if (!d.collections.pageInfo.hasNextPage) break
        c = d.collections.pageInfo.endCursor
      }
      const prods = []
      c = null
      for (;;) {
        const d = await gql('query($c: String) { products(first: 250, after: $c, query: "status:active") { pageInfo { hasNextPage endCursor } nodes { id title vendor tags } } }', { c })
        prods.push(...d.products.nodes)
        if (!d.products.pageInfo.hasNextPage) break
        c = d.products.pageInfo.endCursor
      }
      const vendorCount = {}
      for (const p of prods) vendorCount[norm(p.vendor)] = (vendorCount[norm(p.vendor)] || 0) + 1
      const brandTag = {}
      for (const k of Object.keys(tagOf)) if (vendorCount[k]) brandTag[k] = tagOf[k]
      const lines = []
      const wrong = {}
      for (const p of prods) {
        const v = norm(p.vendor), tags = p.tags.slice(), had = new Set(tags.map(norm))
        let changed = false
        const tw = norm(p.title).split(' ')
        const fits = v.split(' ').filter(w => w.length >= 3 && !['and', 'the', 'for'].includes(w)).every(w => tw.some(x => x.startsWith(w) || w.startsWith(x) && x.length >= 4))
        if (brandTag[v] && !had.has(v) && fits) { tags.push(brandTag[v]); changed = true; bump('own brand tag added'); if (samples.length < 14) samples.push({ t: p.title, add: brandTag[v] }) }
        const vw = new Set((v + ' ' + norm(p.title)).split(' '))
        for (const t of p.tags) {
          const k = norm(t)
          if (!brandTag[k] || k === v || k === 'sulphur 8' || k === 'curls') continue
          const words = k.split(' ').filter(w => w.length >= 3 && !['and', 'the', 'for', 'hair', 'new', 'professional', 'collection', 'natural', 'naturals', 'beauty', 'kids', 'oil', 'care'].includes(w))
          if (!words.length || words.some(w => vw.has(w))) continue
          bump("other brand's tag found")
          wrong[t] = (wrong[t] || 0) + 1
          if (samples.length < 40) samples.push({ t: p.title, vendor: p.vendor, wrongTag: t })
          if (req.query.remove === '1') { const i = tags.indexOf(t); if (i >= 0) { tags.splice(i, 1); changed = true } }
        }
        if (changed) lines.push(JSON.stringify({ input: { id: p.id, tags } }))
      }
      const run = go && lines.length ? await bulk(lines, 'mutation call($input: ProductInput!) { productUpdate(input: $input) { product { id } userErrors { message } } }') : null
      return res.status(200).json({ ok: true, job, go, products: prods.length, brandCollections: Object.keys(brandTag).length, changes: lines.length, counts, topWrong: Object.entries(wrong).sort((a, b) => b[1] - a[1]).slice(0, 25), run, samples })
    }

    if (job === 'desc') {
      let seen = 0, done = false
      while (Date.now() - started < 44000) {
        const d = await gql('query($c: String) { collections(first: 40, after: $c, reverse: ' + (req.query.rev === '1') + ') { pageInfo { hasNextPage endCursor } nodes { id handle title descriptionHtml seo { title description } productsCount { count } products(first: 10, sortKey: BEST_SELLING) { nodes { title status } } } } }', { c: cursor })
        const todo = []
        for (const n of d.collections.nodes) {
          seen++
          if (/^\s*<h2>/i.test(n.descriptionHtml || '')) { bump('already has new text'); continue }
          if (RANKING.has(n.handle)) { bump('already ranks well, left alone'); continue }
          const cur = stripHtml(n.descriptionHtml || '')
          if (cur.length > 220 && !FLUFFY.test(cur.slice(0, 260))) { bump('has its own factual text, left alone'); continue }
          const live = n.products.nodes.filter(p => p.status === 'ACTIVE').map(p => p.title)
          if (live.length < 2) { bump('fewer than 2 live products'); continue }
          if (policyFlag(n.title + ' ' + live.join(' ')) || /skin success|glow|fair|white|bright|lighten|tone ?up|caro|carotone|maxi|clair|bleach(ing)? cream/i.test(n.title)) { bump('skin lightening, left alone'); continue }
          if (/^(all|new|new in|best sellers|vendors|frontpage|offers|sale|goes with|african african)/i.test(n.title) || /^goes-with|-old$/.test(n.handle)) { bump('utility collection, left alone'); continue }
          todo.push({ id: n.id, handle: n.handle, title: n.title, count: n.productsCount.count, products: live, seo: n.seo })
        }
        await pool(todo, 6, async (c) => {
          if (!go && samples.length >= 3) { bump('would write'); return }
          const w = await write(c)
          if (!w || w.skip) { bump('writer skipped: ' + (w ? w.why : 'no key')); return }
          if (!go) { bump('would write'); samples.push({ handle: c.handle, html: w.html, meta: w.meta }); return }
          const r = await gql('mutation($i: CollectionInput!) { collectionUpdate(input: $i) { userErrors { message } } }', { i: { id: c.id, descriptionHtml: w.html, seo: { title: c.seo.title, description: w.meta || c.seo.description } } })
          if (r.collectionUpdate.userErrors.length) bump('save error'); else bump('written')
        })
        if (!d.collections.pageInfo.hasNextPage) { done = true; cursor = null; break }
        cursor = d.collections.pageInfo.endCursor
        if (!go && seen >= 200) break
      }
      const tot = { seen: seen + parseInt(req.query.ts || '0', 10), written: (counts.written || 0) + parseInt(req.query.tw || '0', 10) }
      if (go) await beat('desc', { ...tot, done, cursor })
      const chained = done ? false : await chainOn('&ts=' + tot.seen + '&tw=' + tot.written)
      return res.status(200).json({ ok: true, job, go, seen, counts, done, chained, cursor, samples })
    }
    res.status(200).json({ ok: false, error: 'job must be ping, size, brands or desc' })
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e.message || e), job, cursor, counts })
  }
}
