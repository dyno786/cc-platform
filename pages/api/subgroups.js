// Email subscriber groups (group1, group2, ...): fixed groups of 6,000 subscribers for email campaigns.
//   job=scopes                         which Shopify permissions this app's key has
//   job=analyse&u=<bulk export url>    read a customer bulk export (JSONL) and report the plan (no changes)
//   job=tag&u=<url>&go=1               add the missing group tags with one Shopify bulk tagsAdd run (keeps all other tags)
//   job=status&id=<bulk op gid>        progress of this app's bulk run
//   job=verify&u=<url>                 counts and date ranges per group tag in a fresh export
//   job=assignnew[&go=1]               give new subscribers the next free group position (scheduled; see notes at the end)
// Never changes marketing consent, never removes tags, never sends email.
import { gql } from '../../lib/intake'

export const config = { maxDuration: 300 }
const SIZE = 6000
const GROUP_RE = /^group(\d+)$/i
const numId = gid => BigInt(String(gid).split('/').pop())

async function load(u) {
  if (!/^https:\/\/storage\.googleapis\.com\//.test(u || '')) throw new Error('u must be the Shopify bulk export URL')
  const r = await fetch(u)
  if (!r.ok) throw new Error('could not download the export (' + r.status + '), it may have expired: run a new export')
  const out = []
  for (const line of (await r.text()).split('\n')) { if (line.trim()) out.push(JSON.parse(line)) }
  return out
}
const groupTags = c => (c.tags || []).filter(t => GROUP_RE.test(t.trim()))
const day = s => s ? s.slice(0, 10) : null

// Order: customer creation date (oldest first), then customer ID (smaller first) as the tie-breaker.
function plan(rows) {
  const states = {}, sub = []
  for (const c of rows) {
    const st = (c.emailMarketingConsent && c.emailMarketingConsent.marketingState) || 'NONE'
    states[st] = (states[st] || 0) + 1
    if (st === 'SUBSCRIBED') sub.push(c)
  }
  sub.sort((a, b) => a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : (numId(a.id) < numId(b.id) ? -1 : numId(a.id) > numId(b.id) ? 1 : 0))
  const groups = {}, conflicts = [], todo = [], already = []
  sub.forEach((c, i) => {
    const g = 'group' + (Math.floor(i / SIZE) + 1)
    const have = groupTags(c)
    const G = groups[g] = groups[g] || { count: 0, firstCreated: c.createdAt, lastCreated: c.createdAt, firstId: c.id, lastId: c.id, needTag: 0, alreadyTagged: 0, subscribedDates: [null, null] }
    G.count++; G.lastCreated = c.createdAt; G.lastId = c.id
    const cs = c.emailMarketingConsent.consentUpdatedAt
    if (cs) { if (!G.subscribedDates[0] || cs < G.subscribedDates[0]) G.subscribedDates[0] = cs; if (!G.subscribedDates[1] || cs > G.subscribedDates[1]) G.subscribedDates[1] = cs } else G.noConsentDate = (G.noConsentDate || 0) + 1
    if (have.length === 0) { todo.push({ id: c.id, g }); G.needTag++ }
    else if (have.length === 1 && have[0].toLowerCase() === g) { already.push(c.id); G.alreadyTagged++ }
    else conflicts.push({ id: c.id, planned: g, has: have })
  })
  // group tags on customers who are not subscribed now: kept as they are (positions are permanent)
  const taggedNotSub = rows.filter(c => (c.emailMarketingConsent || {}).marketingState !== 'SUBSCRIBED' && groupTags(c).length).length
  return { states, subscribed: sub.length, groups, todo, already: already.length, conflicts, taggedNotSub, sub }
}

function tagStats(rows, onlySub) {
  const t = {}
  for (const c of rows) {
    if (onlySub && (c.emailMarketingConsent || {}).marketingState !== 'SUBSCRIBED') continue
    for (const x of c.tags || []) { const k = x.trim().toLowerCase(); t[k] = (t[k] || 0) + 1 }
  }
  return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 80)
}

function optIn(rows) {
  const o = {}
  for (const c of rows) { const e = c.emailMarketingConsent || {}; if (e.marketingState !== 'SUBSCRIBED') continue; const k = (e.marketingOptInLevel || 'NONE'); o[k] = (o[k] || 0) + 1 }
  return o
}

async function stagedUpload(jsonl) {
  const s = await gql('mutation($i:[StagedUploadInput!]!){ stagedUploadsCreate(input:$i){ stagedTargets{ url resourceUrl parameters{ name value } } userErrors{ message } } }',
    { i: [{ resource: 'BULK_MUTATION_VARIABLES', filename: 'groups.jsonl', mimeType: 'text/jsonl', httpMethod: 'POST' }] })
  const tg = s.stagedUploadsCreate.stagedTargets[0]
  if (!tg) throw new Error('staged upload failed: ' + JSON.stringify(s.stagedUploadsCreate.userErrors))
  const fd = new FormData()
  for (const p of tg.parameters) fd.append(p.name, p.value)
  fd.append('file', new Blob([jsonl], { type: 'text/jsonl' }), 'groups.jsonl')
  const r = await fetch(tg.url, { method: 'POST', body: fd })
  if (!r.ok && r.status !== 201 && r.status !== 204) throw new Error('upload failed ' + r.status + ' ' + (await r.text()).slice(0, 200))
  return tg.parameters.find(p => p.name === 'key').value
}

// ---- new subscribers: one shared counter, changed only with compareDigest, so two runs can never hand out the same position
const NS = 'cc_groups'
async function counter() {
  const d = await gql('query{ shop{ id metafield(namespace:"cc_groups", key:"next"){ value compareDigest } } }')
  const m = d.shop.metafield
  return { shopId: d.shop.id, value: m ? JSON.parse(m.value) : null, digest: m ? m.compareDigest : null }
}

async function assignNew(go) {
  const C = await counter()
  if (!C.value) return { ok: false, error: 'counter not set yet: run job=initcounter after the first tagging is verified' }
  // subscribed customers without any group tag, oldest created first
  const found = []; let cur = null
  for (let p = 0; p < 20; p++) {
    const d = await gql('query($c:String){ customers(first:250, after:$c, sortKey:CREATED_AT, query:"email_subscription_status:SUBSCRIBED AND -tag:group1 AND -tag:group2 AND -tag:group3 AND -tag:group4 AND -tag:group5 AND -tag:group6 AND -tag:group7 AND -tag:group8 AND -tag:group9 AND -tag:group10"){ pageInfo{ hasNextPage endCursor } nodes{ id createdAt tags emailMarketingConsent{ marketingState } metafield(namespace:"cc_groups", key:"group"){ value } } } }', { c: cur })
    for (const n of d.customers.nodes) if (n.emailMarketingConsent && n.emailMarketingConsent.marketingState === 'SUBSCRIBED' && !groupTags(n).length) found.push(n)
    if (!d.customers.pageInfo.hasNextPage) break; cur = d.customers.pageInfo.endCursor
  }
  found.sort((a, b) => a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : (numId(a.id) < numId(b.id) ? -1 : 1))
  const done = []
  if (!go) return { ok: true, preview: true, counter: C.value, waiting: found.length, first: found.slice(0, 5).map(f => f.id + ' ' + f.createdAt) }
  let state = C
  for (const c of found) {
    if (c.metafield && c.metafield.value) { // already holds a position (earlier run stopped before tagging): just tag it
      await gql('mutation($id:ID!,$t:[String!]!){ tagsAdd(id:$id, tags:$t){ userErrors{ message } } }', { id: c.id, t: [c.metafield.value] })
      done.push(c.id + ' ' + c.metafield.value + ' (retagged)'); continue
    }
    let placed = null
    for (let attempt = 0; attempt < 5 && !placed; attempt++) {
      const v = state.value
      const g = v.count >= SIZE ? v.group + 1 : v.group
      const next = { group: g, count: v.count >= SIZE ? 1 : v.count + 1 }
      // counter and the customer's own record change together or not at all
      const r = await gql('mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ code message } } }', { m: [
        { ownerId: state.shopId, namespace: NS, key: 'next', type: 'json', value: JSON.stringify(next), compareDigest: state.digest },
        { ownerId: c.id, namespace: NS, key: 'group', type: 'single_line_text_field', value: 'group' + g, compareDigest: null },
      ] })
      const errs = r.metafieldsSet.userErrors
      if (!errs.length) { placed = 'group' + g; state = await counter(); break }
      state = await counter() // someone else moved the counter, or this customer already has a position: re-read and try again
      const mine = await gql('query($id:ID!){ customer(id:$id){ metafield(namespace:"cc_groups", key:"group"){ value } } }', { id: c.id })
      if (mine.customer.metafield) { placed = mine.customer.metafield.value; break }
    }
    if (!placed) { done.push(c.id + ' not placed, will retry next run'); continue }
    await gql('mutation($id:ID!,$t:[String!]!){ tagsAdd(id:$id, tags:$t){ userErrors{ message } } }', { id: c.id, t: [placed] })
    done.push(c.id + ' ' + placed)
  }
  return { ok: true, counter: state.value, assigned: done.length, done: done.slice(0, 50) }
}

export default async function handler(req, res) {
  try {
    const job = String(req.query.job || '')
    if (job === 'scopes') { const d = await gql('query{ currentAppInstallation{ app{ title developerType } accessScopes{ handle } } }'); return res.status(200).json({ ok: true, app: d.currentAppInstallation.app, scopes: d.currentAppInstallation.accessScopes.map(s => s.handle).filter(h => /customer|bulk|metafield|shop/.test(h)) }) }
    if (job === 'analyse' || job === 'tag') {
      const rows = await load(req.query.u)
      const P = plan(rows)
      const summary = { totalCustomers: rows.length, states: P.states, subscribed: P.subscribed, optIn: optIn(rows), groups: P.groups, needTag: P.todo.length, alreadyTagged: P.already, conflicts: P.conflicts.slice(0, 50), conflictCount: P.conflicts.length, groupTaggedButNotSubscribed: P.taggedNotSub }
      if (job === 'analyse') return res.status(200).json({ ok: true, ...summary, tagsAmongSubscribed: tagStats(rows, true) })
      if (req.query.go !== '1') return res.status(200).json({ ok: true, preview: true, ...summary })
      if (P.conflicts.length) return res.status(409).json({ ok: false, error: 'customers already carry a different group tag; nothing applied', conflicts: P.conflicts.slice(0, 50) })
      if (!P.todo.length) return res.status(200).json({ ok: true, nothingToDo: true, ...summary })
      const jsonl = P.todo.map(t => JSON.stringify({ id: t.id, tags: [t.g] })).join('\n')
      const path = await stagedUpload(jsonl)
      const m = await gql('mutation($m:String!,$p:String!){ bulkOperationRunMutation(mutation:$m, stagedUploadPath:$p){ bulkOperation{ id status } userErrors{ message } } }',
        { m: 'mutation call($id:ID!,$tags:[String!]!){ tagsAdd(id:$id, tags:$tags){ userErrors{ message } } }', p: path })
      return res.status(200).json({ ok: true, started: m.bulkOperationRunMutation, lines: P.todo.length, ...summary })
    }
    if (job === 'breakdown') { // how subscribed customers came to be subscribed, from stored data only
      const rows = await load(req.query.u)
      const FORM = /^(newsletter|shopify-forms-\d+|automizely-popups|aftership-popups&forms|forms|password page|halloween-quiz-winner)$/i
      const out = { subscribed: 0, accountState: {}, withSignupFormTag: 0, formTagByName: {}, consentSameMinuteAsCreated: 0, consentLaterThanCreated: 0, noConsentDate: 0, formTagAndAccount: 0, loginWithShop: 0, chat: 0, byYearCreated: {} }
      for (const c of rows) {
        const e = c.emailMarketingConsent || {}; if (e.marketingState !== 'SUBSCRIBED') continue
        out.subscribed++
        out.accountState[c.state] = (out.accountState[c.state] || 0) + 1
        const tags = (c.tags || []).map(t => t.trim())
        const ft = tags.filter(t => FORM.test(t))
        if (ft.length) { out.withSignupFormTag++; ft.forEach(t => { out.formTagByName[t.toLowerCase()] = (out.formTagByName[t.toLowerCase()] || 0) + 1 }); if (c.state === 'ENABLED') out.formTagAndAccount++ }
        if (tags.some(t => /^login with shop$/i.test(t))) out.loginWithShop++
        if (tags.some(t => /^inbox online store chat$/i.test(t))) out.chat++
        const y = c.createdAt.slice(0, 4); out.byYearCreated[y] = (out.byYearCreated[y] || 0) + 1
        if (!e.consentUpdatedAt) out.noConsentDate++
        else if (Math.abs(new Date(e.consentUpdatedAt) - new Date(c.createdAt)) < 60000) out.consentSameMinuteAsCreated++
        else out.consentLaterThanCreated++
      }
      return res.status(200).json({ ok: true, ...out })
    }
    if (job === 'upload') { // build the tagsAdd file and post it to a staged upload target made by the app that will run the bulk tagging
      // t = base64url JSON {url, parameters:[{name,value}]}
      const tg = JSON.parse(Buffer.from(String(req.query.t || ''), 'base64url').toString('utf8'))
      if (!/^https:\/\/shopify-staged-uploads\.storage\.googleapis\.com\/?$/.test(tg.url)) return res.status(400).json({ ok: false, error: 'unexpected upload target' })
      const rows = await load(req.query.u); const P = plan(rows)
      if (P.conflicts.length) return res.status(409).json({ ok: false, error: 'conflicting group tags; nothing uploaded', conflicts: P.conflicts.slice(0, 50) })
      const jsonl = P.todo.map(t => JSON.stringify({ id: t.id, tags: [t.g] })).join('\n')
      const fd = new FormData()
      for (const p of tg.parameters) fd.append(p.name, p.value)
      fd.append('file', new Blob([jsonl], { type: 'text/jsonl' }), 'groups.jsonl')
      const r = await fetch(tg.url, { method: 'POST', body: fd })
      const per = {}; P.todo.forEach(t => { per[t.g] = (per[t.g] || 0) + 1 })
      return res.status(200).json({ ok: r.status < 300, uploadStatus: r.status, lines: P.todo.length, perGroup: per, firstLine: jsonl.split('\n')[0] })
    }
    if (job === 'status') {
      const d = await gql('query($id:ID!){ node(id:$id){ ... on BulkOperation{ status objectCount errorCode url partialDataUrl completedAt } } }', { id: req.query.id })
      const n = d.node || {}
      let errors = null
      if (n.url && n.status === 'COMPLETED') { const t = await (await fetch(n.url)).text(); const lines = t.split('\n').filter(Boolean); errors = lines.filter(l => /"userErrors":\[\{/.test(l)).slice(0, 20); n.resultLines = lines.length; n.linesWithErrors = lines.filter(l => /"userErrors":\[\{/.test(l)).length }
      return res.status(200).json({ ok: true, ...n, url: undefined, errors })
    }
    if (job === 'verify') {
      const rows = await load(req.query.u)
      const g = {}; const multi = []
      for (const c of rows) {
        const ts = groupTags(c); if (!ts.length) continue
        if (ts.length > 1) multi.push(c.id + ' ' + ts.join(','))
        for (const t of ts) { const k = t.toLowerCase(); const G = g[k] = g[k] || { count: 0, subscribedNow: 0, firstCreated: c.createdAt, lastCreated: c.createdAt }; G.count++; if ((c.emailMarketingConsent || {}).marketingState === 'SUBSCRIBED') G.subscribedNow++; if (c.createdAt < G.firstCreated) G.firstCreated = c.createdAt; if (c.createdAt > G.lastCreated) G.lastCreated = c.createdAt }
      }
      const subNoGroup = rows.filter(c => (c.emailMarketingConsent || {}).marketingState === 'SUBSCRIBED' && !groupTags(c).length).map(c => c.id + ' ' + c.createdAt)
      return res.status(200).json({ ok: true, totalCustomers: rows.length, groups: g, customersWithTwoGroupTags: multi.length, multi: multi.slice(0, 20), subscribedWithoutGroup: subNoGroup.length, subscribedWithoutGroupSample: subNoGroup.slice(0, 20) })
    }
    if (job === 'initcounter') { // set the shared counter from the verified tags: g=last group number, n=customers in it
      const C = await counter()
      if (C.value && req.query.force !== '1') return res.status(200).json({ ok: true, exists: C.value })
      const v = { group: parseInt(req.query.g, 10), count: parseInt(req.query.n, 10) }
      if (!(v.group > 0) || !(v.count >= 0 && v.count <= SIZE)) return res.status(400).json({ ok: false, error: 'g and n needed' })
      const r = await gql('mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ message } } }', { m: [{ ownerId: C.shopId, namespace: NS, key: 'next', type: 'json', value: JSON.stringify(v), compareDigest: C.digest }] })
      return res.status(200).json({ ok: true, set: v, errors: r.metafieldsSet.userErrors })
    }
    if (job === 'assignnew') return res.status(200).json(await assignNew(req.query.go === '1'))
    return res.status(400).json({ ok: false, error: 'unknown job' })
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) })
  }
}
