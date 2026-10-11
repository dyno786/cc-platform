// Shared server code for the salon finder pages on cchairandbeauty.com.
// Used by /api/salon-finder (called from the shop's city pages) and the Salon Clicks page.
import { gql } from './intake'

// Cities where the sign-up box and click counting are switched on. Add a city here when its page gets the box.
export const CITIES = {
  nottingham: { name: 'Nottingham', code: 'NOTTINGHAM10' },
}

export const STYLES = {
  braids: 'Braids', twists: 'Twists', crochet: 'Crochet', wig: 'Wig', weave: 'Weave or sew-in',
  locs: 'Locs', natural: 'Natural hair', barber: 'Barber cut', other: 'Not sure yet',
}

const NS = 'cc_salon', KEY = 'clicks'
const unesc = s => String(s || '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
export const monthKey = () => new Date().toISOString().slice(0, 7)

async function loadPage(city) {
  const d = await gql('query($q: String!) { pages(first: 1, query: $q) { nodes { id handle body metafield(namespace: "' + NS + '", key: "' + KEY + '") { value } } } }', { q: 'handle:afro-hair-salons-' + city })
  const p = (d.pages.nodes || [])[0]
  if (!p || p.handle !== 'afro-hair-salons-' + city) return null
  let counts = {}
  try { counts = p.metafield ? JSON.parse(p.metafield.value) || {} : {} } catch (e) { counts = {} }
  return { id: p.id, body: String(p.body || ''), counts }
}

// The salon's name is read from our own page, so nothing a visitor sends is ever stored.
function salonName(body, placeId) {
  const at = body.indexOf('query_place_id=' + placeId + '"')
  if (at < 0) return null
  const b = body.lastIndexOf('<b>', at)
  if (b < 0) return null
  const end = body.indexOf('</b>', b)
  return unesc(body.slice(b + 3, end)).trim().slice(0, 120) || null
}

// Adds one click to a salon's count for this month. Counts are per salon, never per visitor.
export async function countClick(city, placeId, kind) {
  if (!CITIES[city] || !/^[A-Za-z0-9_-]{10,80}$/.test(placeId)) return false
  const page = await loadPage(city)
  if (!page) return false
  const name = salonName(page.body, placeId)
  if (!name) return false
  const m = monthKey()
  const month = page.counts[m] || (page.counts[m] = {})
  const row = month[placeId] || (month[placeId] = { name, maps: 0, phone: 0 })
  row.name = name
  if (kind === 'phone') row.phone = (row.phone || 0) + 1; else row.maps = (row.maps || 0) + 1
  const r = await gql('mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { message } } }', { m: [{ ownerId: page.id, namespace: NS, key: KEY, type: 'json', value: JSON.stringify(page.counts) }] })
  return !(r.metafieldsSet.userErrors || []).length
}

export async function readClicks() {
  const out = []
  for (const city of Object.keys(CITIES)) {
    const page = await loadPage(city)
    if (!page) continue
    for (const m of Object.keys(page.counts)) for (const id of Object.keys(page.counts[m])) {
      const r = page.counts[m][id]
      out.push({ city: CITIES[city].name, month: m, salon: r.name, maps: r.maps || 0, phone: r.phone || 0 })
    }
  }
  return out
}

// The script that runs on the city page. Phone numbers open a small pop-up with the offer and a Call button.
// The pop-up shows once per visit and never blocks the call. Clicks are counted per salon only.
const CLIENT_JS = `(function(){
var CITY="__CITY__",API="https://cc-platform-two.vercel.app/api/salon-finder",KEY="cgCall";
var root=document.getElementById("offer");
var joined=location.search.indexOf("customer_posted=true")>-1,shown=false,pop=null,back=null;
function send(id,kind){if(!id)return;var b=JSON.stringify({action:"click",city:CITY,id:id,kind:kind});try{if(navigator.sendBeacon)navigator.sendBeacon(API,b);else fetch(API,{method:"POST",body:b,keepalive:true})}catch(x){}}
function placeId(card){var m=card&&card.querySelector('a[href*="query_place_id="]');return m?(m.getAttribute("href").match(/query_place_id=([A-Za-z0-9_-]+)/)||[])[1]||"":""}
function setTags(f){var s=f.querySelector("select").value;f.querySelector('[name="contact[tags]"]').value="newsletter, salon-finder, salon-city-"+CITY+(s?", salon-style-"+s:"")}
function shut(){if(!pop)return;pop.parentNode.removeChild(pop);pop=null;document.removeEventListener("keydown",esc);if(back&&back.focus)back.focus()}
function esc(e){if(e.key==="Escape")shut()}
function show(a,card,id){
shown=true;back=a;
var b=card.querySelector("b"),name=b?b.textContent:"the salon",tel=a.getAttribute("href"),num=a.textContent;
pop=document.createElement("div");pop.className="cg-pop cg-o";
pop.innerHTML='<div class="cg-pb" role="dialog" aria-modal="true" aria-labelledby="cg-pt"><button type="button" class="cg-px" aria-label="Close">×</button><h2 id="cg-pt"></h2><p class="cg-pp">Bringing your own hair? Get 10% off braiding hair, wigs, weaves and extensions before you go.</p><button type="button" class="cg-pg">Get my 10% code</button><div class="cg-pf" hidden></div><a class="cg-pc"></a></div>';
pop.querySelector("h2").textContent="Before you call "+name;
var call=pop.querySelector(".cg-pc");call.setAttribute("href",tel);call.textContent="Call "+num;
var f=root.querySelector("form").cloneNode(true),em=f.querySelector("#cg-oe"),se=f.querySelector("#cg-os");
em.id="cg-pe";se.id="cg-ps";f.querySelector('label[for="cg-oe"]').setAttribute("for","cg-pe");f.querySelector('label[for="cg-os"]').setAttribute("for","cg-ps");
var box=pop.querySelector(".cg-pf"),get=pop.querySelector(".cg-pg");box.appendChild(f);
get.addEventListener("click",function(){box.hidden=false;get.hidden=true;em.focus()});
f.addEventListener("submit",function(){setTags(f);try{sessionStorage.setItem(KEY,JSON.stringify({n:name,t:tel,p:num,i:id}))}catch(x){}});
call.addEventListener("click",function(){send(id,"phone");setTimeout(shut,0)});
pop.querySelector(".cg-px").addEventListener("click",shut);
pop.addEventListener("click",function(e){if(e.target===pop)shut()});
document.addEventListener("keydown",esc);
document.body.appendChild(pop);get.focus();
}
document.addEventListener("click",function(e){
var t=e.target;if(!t||!t.closest)return;var a=t.closest(".cg-c a");if(!a)return;
var card=a.closest(".cg-c"),id=placeId(card);if(!id)return;
var tel=(a.getAttribute("href")||"").indexOf("tel:")===0;
if(tel&&root&&!joined&&!shown){e.preventDefault();show(a,card,id);return}
send(id,tel?"phone":"maps");
});
if(!root)return;
var form=root.querySelector("form"),msg=root.querySelector(".cg-om"),done=root.querySelector(".cg-od");
form.addEventListener("submit",function(){setTags(form)});
if(joined){
form.hidden=true;done.hidden=false;
try{var w=JSON.parse(sessionStorage.getItem(KEY)||"null");sessionStorage.removeItem(KEY);
if(w&&/^tel:[0-9+]+$/.test(w.t)){var p=document.createElement("p");p.className="cg-call";var c=document.createElement("a");c.className="cg-btn";c.setAttribute("href",w.t);c.textContent="Call "+String(w.n).slice(0,80)+" on "+String(w.p).slice(0,20);c.addEventListener("click",function(){send(String(w.i),"phone")});p.appendChild(c);done.insertBefore(p,done.lastChild)}
}catch(x){}
}else if(location.search.indexOf("form_type=customer")>-1){msg.textContent="That did not go through. Check your email address and try again.";msg.hidden=false}
})();`

// The sign-up box and click counter that sit on a city page. The sign-up uses Shopify's own newsletter form,
// so the shop's usual sign-up rules apply and this app never handles the email address.
export function offerBlock(city) {
  const c = CITIES[city]
  if (!c) return ''
  const opts = Object.keys(STYLES).map(k => '<option value="' + k + '">' + STYLES[k] + '</option>').join('')
  return '<style id="cg-offer-css">.cg-o [hidden]{display:none!important}.cg-o form{display:grid;gap:12px;max-width:560px}.cg .cg-o .cg-ok a{color:var(--tl);font-weight:700}.cg-o label{display:block;font-weight:700;font-size:15px;margin:0 0 5px}.cg-o input[type=email],.cg-o select{width:100%;font-size:16px;padding:12px 14px;border:2px solid #d9d2c3;border-radius:12px;background:#fff;color:var(--ink);font-family:inherit}.cg-o input[type=email]:focus,.cg-o select:focus{outline:3px solid var(--gd);border-color:var(--ink)}.cg-o .cg-ok{display:flex;gap:10px;align-items:flex-start;font-weight:400;font-size:15px;line-height:1.45}.cg-o .cg-ok input{width:22px;height:22px;flex:0 0 22px;margin:1px 0 0;accent-color:var(--tl)}.cg-o button.cg-btn{border:0;cursor:pointer;font-family:inherit;justify-self:start;margin:0}.cg-o .cg-om{color:#b3261e;font-weight:700;margin:0}.cg-o .cg-od{background:var(--sd);border-radius:16px;padding:18px;max-width:560px}.cg-o .cg-code{display:inline-block;font-size:26px;font-weight:800;letter-spacing:.08em;background:#fff;border:2px dashed var(--tl);border-radius:12px;padding:8px 16px;margin:0 0 12px}.cg-o .cg-sm{font-size:14px!important;color:#5d5a70!important;margin:0!important}.cg-o .cg-call{margin:12px 0}.cg-pop{--ink:#1d1b2f;--tl:#0c6f6f;--co:#e4572e;--sd:#f6efe4;--gd:#f2b134;position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483000;background:rgba(29,27,47,.75);display:flex;align-items:center;justify-content:center;padding:16px;color:#1d1b2f;font-size:17px;line-height:1.5}.cg-pop *{box-sizing:border-box}.cg-pb{position:relative;background:#fff;border-radius:20px;border-top:8px solid #e4572e;padding:22px 18px 18px;width:100%;max-width:460px;max-height:calc(100vh - 32px);overflow:auto}.cg-pop h2{font-size:24px;line-height:1.15;font-weight:800;margin:0 48px 8px 0;color:#1d1b2f}.cg-pop p{color:#1d1b2f}.cg-pop .cg-pp{margin:0 0 16px}.cg-pop .cg-pg,.cg-pop .cg-pc{display:block;width:100%;text-align:center;border-radius:999px;padding:14px 18px;font-weight:700;font-size:17px;line-height:1.3;font-family:inherit;cursor:pointer;text-decoration:none;margin:0 0 10px}.cg-pop .cg-pg{background:#e4572e;color:#fff;border:2px solid #e4572e}.cg-pop .cg-pc{background:#fff;color:#1d1b2f;border:2px solid #1d1b2f;margin-bottom:0}.cg-pop .cg-px{position:absolute;top:10px;right:10px;width:44px;height:44px;border-radius:50%;border:0;background:#f6efe4;color:#1d1b2f;font-size:26px;line-height:1;cursor:pointer;padding:0 0 3px}.cg-pop .cg-pf{margin:0 0 14px}.cg-pop .cg-ok a{color:#0c6f6f;font-weight:700}.cg-pop .cg-pg:focus-visible,.cg-pop .cg-pc:focus-visible,.cg-pop .cg-px:focus-visible{outline:3px solid #f2b134;outline-offset:2px}</style>'
    + '<section class="cg-s cg-o" id="offer"><div class="cg-h"><div><h2>Get 10% off the hair for your appointment</h2>'
    + '<p class="cg-sub">Buying your hair before you book? Join our email list and we will show you a 10% code for braiding hair, wigs, weaves and extensions.</p></div></div>'
    + '<form method="post" action="/contact#offer" accept-charset="UTF-8"><input type="hidden" name="form_type" value="customer"><input type="hidden" name="utf8" value="✓"><input type="hidden" name="contact[tags]" value="newsletter, salon-finder, salon-city-' + city + '">'
    + '<div><label for="cg-oe">Your email</label><input id="cg-oe" type="email" name="contact[email]" autocomplete="email" required></div>'
    + '<div><label for="cg-os">What style are you booking?</label><select id="cg-os" required><option value="">Choose a style</option>' + opts + '</select></div>'
    + '<label class="cg-ok"><input type="checkbox" required><span>Yes, email me hair offers and tips from CC Hair &amp; Beauty, including offers for the style I chose. I can unsubscribe at any time. See our <a href="/policies/privacy-policy">privacy policy</a>.</span></label>'
    + '<p class="cg-om" role="alert" hidden></p><button type="submit" class="cg-btn">Get my 10% code</button>'
    + '<p class="cg-sm">One use per customer. Cannot be combined with other codes.</p></form>'
    + '<div class="cg-od" hidden><p><b>You are on the list. Here is your code:</b></p><span class="cg-code">' + c.code + '</span>'
    + '<p><a class="cg-btn" href="/discount/' + c.code + '?redirect=/collections/crochet-braided">Shop braiding hair</a><a class="cg-btn cg-alt" style="border:2px solid var(--ink)" href="/discount/' + c.code + '?redirect=/collections/wigs-lace-wigs">Shop wigs</a></p>'
    + '<p class="cg-sm">The code is added for you when you use these buttons, or type it in at checkout. 10% off braiding hair, wigs, weaves and hair extensions. One use per customer.</p></div></section>'
    + '<script id="cg-offer-js">' + CLIENT_JS.replace('__CITY__', city) + '</script>'
}

// Puts the box on a city page, just above "Shop before your appointment". Running it again replaces the old box.
export async function installOffer(city, save) {
  const page = await loadPage(city)
  if (!page) return { ok: false, error: 'The city page was not found.' }
  const old = /<style id="cg-offer-css">[\s\S]*?<script id="cg-offer-js">[\s\S]*?<\/script>/
  let body = page.body.replace(old, '').replace('<a href="#offer">10% off hair</a>', '')
  const mark = '<section class="cg-s" id="shop">', nav = '<a href="#shop">Shop</a>'
  if (body.split(mark).length !== 2 || body.split(nav).length !== 2) return { ok: false, error: 'The page layout is not what was expected, so nothing was changed.' }
  body = body.replace(mark, offerBlock(city) + mark).replace(nav, '<a href="#offer">10% off hair</a>' + nav)
  if (!save) return { ok: true, saved: false, hadBox: old.test(page.body), length: body.length }
  const r = await gql('mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { userErrors { message } } }', { id: page.id, p: { body } })
  const ue = r.pageUpdate.userErrors || []
  return ue.length ? { ok: false, error: ue.map(e => e.message).join('; ') } : { ok: true, saved: true }
}
