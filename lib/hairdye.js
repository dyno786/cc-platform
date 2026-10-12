// The "Hair Dye Leeds" page on cchairandbeauty.com (/pages/hair-dye-leeds).
// Order: brands (scrollable), best sellers (live price and photo from the shop), collections, then a short guide.
// Best sellers are by units sold in the 12 months to October 2026. Keywords: hair dye leeds, hair colour leeds,
// professional hair colour, bleach and developer, toner, henna, grey coverage.

// [brand, link, product handle used for the tile photo, line]
const BRANDS = [
  ["L'Oréal Hi Color", '/collections/vendors?q=Loreal%20Hi%20Color', 'loreal-technique-excellence-permanent-hicolor-1-74oz', 'Bright colour on dark hair, no bleach'],
  ['Wella Color Charm', '/collections/vendors?q=Wella%20ColorCharm', 'wella-permanent-liquid-toners', 'Professional liquid colour and toners'],
  ["L'Oréal Majirel", '/collections/vendors?q=Loreal%20Professionel%20-%20Majirel', 'loreal-professionel-majirel', 'Salon permanent colour'],
  ['Schwarzkopf Live', '/collections/schwarzkopf-live', 'schwarzkopf-live-colour-lift-hair-colour', 'Intense, lift and pastel shades'],
  ['Garnier Belle Color', '/collections/vendors?q=Garnier%20-%20Belle%20Color', 'garnier-belle-color-permanent-hair-dyes', 'Natural-looking permanent colour'],
  ['Garnier Nutrisse', '/collections/vendors?q=Garnier%20Nutrisse', 'garnier-nutrisse-hair-dyes', 'Nourishing permanent colour'],
  ['Schwarzkopf Oleo Intense', '/collections/vendors?q=Schwarzkopf%20-%20Oleo%20Intense', 'schwarzkopf-oleo-intense-permanent-hair-colour', 'Oil-powered, no ammonia'],
  ["L'Oréal Excellence", '/collections/vendors?q=Loreal%20Paris%20-%20Excellence%20Cr%C3%A8me', 'loreal-excellence-creme-permanent-hair-dye', 'Triple care grey coverage'],
  ['Creme of Nature', '/collections/vendors?q=Creme%20of%20Nature%20Women%20Hair%20Dye', 'creme-of-nature-exotic-shine-permanent-hair-dye-with-argan-oil-all-colours', 'Made for afro and textured hair'],
  ['Dark & Lovely', '/collections/vendors?q=Dark%20%26%20Lovely%20Hair%20Dyes', 'dark-and-lovely-fade-resist-rich-conditioning-color', 'Rich colour for dark hair'],
  ['Bigen', '/collections/vendors?q=Bigen%20Powder%20Dye', 'bigen-permanent-powder-hair-colour', 'Powder dye, no ammonia'],
  ['Henna', '/collections/henna', 'color-for-me-henna-hair-colour-60g', 'Plant-based colour'],
  ['Jerome Russell', '/collections/jerome-russell', 'jerome-russell-bblonde-maximum-colour-toner', 'Blonde toners and bleach'],
  ['Bleach London', '/collections/bleach-london', '', 'Bold and pastel shades'],
  ['Fudge', '/collections/fudge', '', 'Paintbox bright colours'],
  ['Kiss Colors', '/collections/kiss-colors', '', 'Tintation semi-permanent'],
]

// Best sellers, most units first.
const BEST = [
  'loreal-technique-excellence-permanent-hicolor-1-74oz', 'wella-permanent-liquid-toners', 'loreal-professionel-majirel',
  'garnier-belle-color-permanent-hair-dyes', 'schwarzkopf-live-colour-lift-hair-colour', 'garnier-nutrisse-hair-dyes',
  'schwarzkopf-live-semi-permanent-ultra-bright-or-pastel-hair-dyes', 'schwarzkopf-live-permanent-intense-colour-hair-dyes',
  'schwarzkopf-oleo-intense-permanent-hair-colour', 'loreal-excellence-creme-permanent-hair-dye',
  'creme-of-nature-exotic-shine-permanent-hair-dye-with-argan-oil-all-colours', 'bigen-permanent-powder-hair-colour',
  'loreal-paris-preference-vivid-colours-permanent-hair-dye', 'color-for-me-henna-hair-colour-60g', 'loreal-professionel-dia-richesse',
  'dark-and-lovely-gointense-ultra-vibrant-color-on-dark-hair', 'jerome-russell-bblonde-maximum-colour-toner',
]

const CDN = 'https://cdn.shopify.com/s/files/1/0605/2118/5501/collections/'
const COLLECTIONS = [
  ['Permanent hair dye', 'permanent-hair-dyes', 'permanent-hair-dyes-collection.png?v=1791362436', 'Lasts until it grows out'],
  ['Semi-permanent', 'semi-permanent-hair-dye', 'semi-permanent-hair-dye-collection.png?v=1791362615', 'Fades over 4 to 8 washes'],
  ['Demi-permanent', 'demi-permanent-hair-dye', 'demi-permanent-hair-dye-collection.png?v=1791362640', 'Gloss and blend, up to 24 washes'],
  ['Temporary colour', 'temporary-hair-colour', 'temporary-hair-colour-collection.png?v=1791362668', 'Washes out in one go'],
  ['Bleach and lighteners', 'hair-bleach', 'hair-bleach-collection.png?v=1791362916', 'Lift before bright shades'],
  ['Developers and peroxide', 'peroxide', 'peroxide-collection.png?v=1791363126', '10 to 40 volume'],
  ['Toners', 'hair-dye-toners', 'hair-dye-toners-collection.png?v=1791363150', 'Take out brassy tones'],
  ['Grey coverage and root touch-up', 'grey-coverage-root-touch-up', 'grey-coverage-root-touch-up-collection.png?v=1791363176', 'Cover greys and regrowth'],
  ['Henna', 'henna', 'henna-collection.png?v=1791363438', 'Plant-based colour'],
  ["Men's hair and beard dye", 'hair-beard-dye', 'hair-beard-dye-collection.png?v=1791363463', 'Hair, beard and moustache'],
  ['Dye removers', 'hair-dye-remover', 'hair-dye-remover-collection.png?v=1791363487', 'Undo a colour'],
  ['Dye accessories', 'hair-dye-accessories', 'hair-dye-accessories-collection.png?v=1791363513', 'Bowls, brushes, gloves, caps'],
]

const FAQ = [
  ['Where can I buy hair dye in Leeds?', 'In any of our three CC Hair & Beauty shops: 119 Chapeltown Road (LS7), 256 Roundhay Road (LS8) and New York Street in the city centre (LS2). You can also order online and collect in store, or have it delivered.'],
  ['Do you sell professional hair colour in Leeds?', "Yes. We stock salon brands including L'Oréal Majirel and Dia Richesse, Wella Color Charm and L'Oréal Hi Color, plus developers, bleach and toners. Salons can ask in store about trade prices."],
  ['Which hair dye works on dark or afro hair without bleach?', "High-lift colours such as L'Oréal Hi Color and Dark & Lovely Go Intense are made to show on dark hair without bleach. For a big change from black to blonde, you will usually need to lighten first."],
  ['Can I dye relaxed or freshly braided hair?', 'Wait at least two weeks between relaxing and colouring, and use a conditioning dye. Colour before you get braids put in, not after, so the dye reaches your whole head evenly.'],
  ['What developer volume do I need?', '10 volume deposits colour or tones. 20 volume covers greys and lifts about one level. 30 volume lifts about two levels. 40 volume is for professionals and high lift. Always follow the dye maker\u2019s instructions.'],
  ['Do I need a patch test?', 'Yes, every time, even with a brand you have used before. Most dyes ask you to test 48 hours before colouring. Never use hair dye on your eyebrows or eyelashes.'],
]

const CSS = `.hd{--ink:#1d1b2f;--tl:#0c6f6f;--co:#e4572e;--sd:#f6efe4;--gd:#f2b134;--pl:#7b2d8e;color:var(--ink);font-size:17px;line-height:1.6;background:var(--ink);border-radius:22px;overflow:hidden}
.hd *{box-sizing:border-box}.hd p{margin:0 0 14px;color:var(--ink)}.hd a{color:inherit}.hd ul{margin:0 0 14px;padding-left:20px}.hd li{margin:0 0 6px}
.hd-band{height:14px;background:linear-gradient(90deg,#1d1b2f 0 10%,#5a2a18 10% 22%,#8a3f1c 22% 34%,#c98b3d 34% 46%,#e8d29a 46% 58%,#b3261e 58% 70%,#7b2d8e 70% 82%,#0c6f6f 82% 100%)}
.hd-hero{text-align:center;padding:36px 18px 30px}.hd-k{display:inline-block;background:var(--gd);color:var(--ink);font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;border-radius:999px;padding:6px 16px;margin:0 0 14px}
.hd .hd-big{color:#fff;font-size:36px;line-height:1.08;font-weight:800;margin:0 auto 12px;max-width:none}.hd-big span{color:var(--gd)}.hd-hero p{color:#fff;max-width:660px;margin:0 auto 16px}
.hd-btn{display:inline-block;background:var(--co);color:#fff!important;text-decoration:none;border-radius:999px;padding:12px 22px;font-weight:700;font-size:16px;margin:4px 4px 0}.hd-btn.hd-alt{background:#fff;color:var(--ink)!important}
.hd-in{padding:0 12px 20px}
.hd-nav{display:flex;gap:8px;overflow-x:auto;padding:4px 0;scrollbar-width:none}.hd-nav::-webkit-scrollbar{display:none}.hd-nav a{flex:0 0 auto;background:rgba(255,255,255,.14);color:#fff;font-weight:700;font-size:15px;text-decoration:none;border-radius:999px;padding:9px 16px;white-space:nowrap}.hd-nav a:hover{background:var(--gd);color:var(--ink)}
.hd-s{background:#fff;border-radius:20px;padding:22px 16px 18px;margin:14px 0 0;border-top:8px solid var(--tl);scroll-margin-top:90px}.hd-s.hd-c2{border-top-color:var(--co)}.hd-s.hd-c3{border-top-color:var(--pl)}.hd-s.hd-c4{border-top-color:var(--gd)}
.hd-h{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:0 0 14px}
.hd h2{font-size:27px;line-height:1.15;font-weight:800;color:var(--ink);margin:0}.hd h3{font-size:19px;line-height:1.25;color:var(--tl);margin:18px 0 8px}
.hd-sub{margin:6px 0 0!important;font-size:15px;color:#5d5a70!important}
.hd-a{display:flex;gap:8px;flex:0 0 auto}.hd-a button{width:42px;height:42px;border-radius:50%;border:0;background:var(--ink);color:#fff;font-size:24px;line-height:1;cursor:pointer;padding:0 0 3px}.hd-a button:hover{background:var(--co)}
.hd-t{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x proximity;padding:4px 2px 12px;-webkit-overflow-scrolling:touch}
.hd-t a{flex:0 0 160px;display:block;text-decoration:none;border-radius:18px;padding:8px;scroll-snap-align:start}.hd-t a:hover{outline:3px solid var(--gd)}
.hd-i{display:block;position:relative;aspect-ratio:1/1;background:#fff;border-radius:12px;overflow:hidden}
.hd .hd-i img{position:absolute;top:0;left:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:contain;display:block;margin:0!important;border:0!important;border-radius:0!important}
.hd-br a{background:var(--ink);color:#fff}.hd-br a:nth-child(3n+2){background:var(--pl)}.hd-br a:nth-child(3n){background:var(--tl)}
.hd-br .hd-i{display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;font-size:20px;line-height:1.15;color:var(--ink);padding:10px}
.hd-n{display:block;font-weight:800;font-size:16px;line-height:1.25;padding:10px 4px 2px}.hd-l{display:block;font-size:13.5px;line-height:1.35;padding:0 4px 4px;opacity:.85}
.hd-bs a{background:var(--sd);color:var(--ink);flex-basis:170px}
.hd-rk{position:absolute;top:8px;left:8px;z-index:1;background:var(--co);color:#fff;font-weight:800;font-size:13px;border-radius:999px;padding:2px 9px}
.hd-v{display:block;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--co);padding:8px 4px 0}.hd-pn{display:block;font-weight:700;font-size:14.5px;line-height:1.3;padding:2px 4px 0}.hd-p{display:block;font-weight:800;font-size:15px;color:var(--tl);padding:4px 4px 2px;min-height:24px}
.hd-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.hd-g a{display:block;text-decoration:none;background:var(--sd);border-radius:16px;padding:8px;color:var(--ink)}.hd-g a:hover{outline:3px solid var(--gd)}
.hd .hd-g img{width:100%!important;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:11px;margin:0!important;max-width:none!important}
.hd-g b{display:block;font-size:15.5px;line-height:1.25;padding:8px 4px 0}.hd-g span{display:block;font-size:13.5px;color:#5d5a70;padding:2px 4px 4px}
.hd-two{display:grid;gap:14px}.hd-box{background:var(--sd);border-radius:16px;padding:16px}.hd-box h3{margin-top:0}.hd-box p:last-child,.hd-box ul:last-child{margin-bottom:0}
.hd-warn{background:#fbf0d4;border-radius:14px;padding:14px 16px;margin:14px 0 0}
.hd-shops{display:grid;gap:10px}.hd-shops div{background:var(--sd);border-radius:14px;padding:12px 14px}.hd-shops b{display:block}
.hd details{border-top:2px dotted #d9d2c3;padding:14px 0}.hd details:last-of-type{border-bottom:2px dotted #d9d2c3}.hd summary{font-weight:700;font-size:17px;cursor:pointer}.hd details p{margin:10px 0 0}
.hd button:focus-visible,.hd a:focus-visible{outline:3px solid var(--gd);outline-offset:2px}
@media(min-width:700px){.hd-hero{padding:56px 28px 46px}.hd .hd-big{font-size:58px}.hd-in{padding:0 26px 28px}.hd-s{padding:28px 26px 22px;margin-top:20px}.hd h2{font-size:33px}.hd-t a{flex-basis:200px}.hd-g{grid-template-columns:repeat(4,minmax(0,1fr))}.hd-two{grid-template-columns:1fr 1fr}.hd-shops{grid-template-columns:repeat(3,1fr)}.hd-nav{justify-content:center;flex-wrap:wrap}}
@media(min-width:990px){.hd{width:min(1200px,calc(100vw - 100px));position:relative;left:50%;transform:translateX(-50%)}.hd-g{grid-template-columns:repeat(6,minmax(0,1fr))}}`

const JS = `(function(){var r=document.getElementById("hd");if(!r)return;
r.addEventListener("click",function(e){var b=e.target.closest?e.target.closest("[data-sc]"):null;if(!b)return;var t=b.closest(".hd-s").querySelector(".hd-t");t.scrollBy({left:Number(b.getAttribute("data-sc"))*t.clientWidth*.8,behavior:"smooth"})});
function money(p){return "\\u00a3"+(p/100).toFixed(2)}
[].forEach.call(r.querySelectorAll("[data-h]"),function(a){fetch("/products/"+a.getAttribute("data-h")+".js").then(function(x){if(!x.ok)throw 0;return x.json()}).then(function(p){
var s=p.featured_image||"";if(s){if(s.indexOf("//")===0)s="https:"+s;var i=document.createElement("img");i.alt="";i.loading="lazy";i.src=s+(s.indexOf("?")>-1?"&":"?")+"width=360";var box=a.querySelector(".hd-i");box.textContent="";box.appendChild(i)}
var n=a.querySelector(".hd-pn");if(n)n.textContent=p.title;var v=a.querySelector(".hd-v");if(v)v.textContent=p.vendor;
var pr=a.querySelector(".hd-p");if(pr){pr.textContent=p.available?((p.price_varies?"From ":"")+money(p.price_min)):"Out of stock";if(!p.available)a.parentNode.appendChild(a)}
}).catch(function(){if(a.classList.contains("hd-prod")&&a.parentNode)a.parentNode.removeChild(a)})});})();`

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const arrows = '<div class="hd-a"><button type="button" aria-label="Scroll left" data-sc="-1">‹</button><button type="button" aria-label="Scroll right" data-sc="1">›</button></div>'
const pretty = h => h.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')

export function buildHairDye() {
  const brands = BRANDS.map(b => '<a href="' + b[1] + '"' + (b[2] ? ' data-h="' + b[2] + '"' : '') + '><span class="hd-i">' + esc(b[0]) + '</span><span class="hd-n">' + esc(b[0]) + '</span><span class="hd-l">' + esc(b[3]) + '</span></a>').join('')
  const best = BEST.map((h, i) => '<a class="hd-prod" href="/products/' + h + '" data-h="' + h + '"><span class="hd-i"><span class="hd-rk">' + (i + 1) + '</span></span><span class="hd-v"></span><span class="hd-pn">' + esc(pretty(h)) + '</span><span class="hd-p"></span></a>').join('')
  const cols = COLLECTIONS.map(c => '<a href="/collections/' + c[1] + '"><img src="' + CDN + c[2] + '&amp;width=400" alt="" loading="lazy"><b>' + esc(c[0]) + '</b><span>' + esc(c[3]) + '</span></a>').join('')
  return '<style>' + CSS + '</style><div class="hd" id="hd"><div class="hd-band"></div>'
    + '<div class="hd-hero"><span class="hd-k">Hair dye Leeds</span><p class="hd-big">Hair dye and hair colour in <span>Leeds</span></p>'
    + '<p>Box dye, professional salon colour, bleach, developers and toners from the brands Leeds buys most. In our three shops in Chapeltown, Roundhay Road and the city centre, or delivered.</p>'
    + '<a class="hd-btn" href="#best">Best sellers</a><a class="hd-btn hd-alt" href="#shops">Our Leeds shops</a></div>'
    + '<div class="hd-in"><nav class="hd-nav" aria-label="On this page"><a href="#brands">Brands</a><a href="#best">Best sellers</a><a href="#types">Shop by type</a><a href="#guide">Which dye?</a><a href="#shops">Leeds shops</a><a href="#faq">Questions</a></nav>'
    + '<section class="hd-s hd-c3" id="brands"><div class="hd-h"><div><h2>Hair dye brands</h2><p class="hd-sub">Swipe through the colour brands we stock.</p></div>' + arrows + '</div><div class="hd-t hd-br">' + brands + '</div></section>'
    + '<section class="hd-s hd-c2" id="best"><div class="hd-h"><div><h2>Best-selling hair dye</h2><p class="hd-sub">Our most-bought hair colour over the last 12 months, number 1 first.</p></div>' + arrows + '</div><div class="hd-t hd-bs">' + best + '</div>'
    + '<p style="margin:6px 0 0"><a href="/collections/hair-dyes" style="color:var(--tl);font-weight:700">See all ' + 328 + ' hair dyes</a></p></section>'
    + '<section class="hd-s" id="types"><div class="hd-h"><div><h2>Shop hair colour by type</h2><p class="hd-sub">From a one-day colour to a full bleach and tone.</p></div></div><div class="hd-g">' + cols + '</div></section>'
    + '<section class="hd-s hd-c4" id="guide"><div class="hd-h"><div><h2>Which hair dye do I need?</h2><p class="hd-sub">A quick guide before you buy.</p></div></div><div class="hd-two">'
    + '<div class="hd-box"><h3>How long it lasts</h3><ul><li><b>Temporary:</b> washes out in one shampoo. Good for a night out.</li><li><b>Semi-permanent:</b> fades over 4 to 8 washes. No developer, kinder to hair.</li><li><b>Demi-permanent:</b> lasts up to 24 washes, blends greys and adds shine.</li><li><b>Permanent:</b> stays until it grows out. Full grey coverage.</li></ul></div>'
    + '<div class="hd-box"><h3>Going lighter or brighter</h3><ul><li><b>Dark hair, brighter colour:</b> high-lift dyes such as L\'Oréal Hi Color show without bleach.</li><li><b>Black to blonde:</b> lighten first with bleach and developer, then tone.</li><li><b>Brassy or yellow:</b> a toner such as Wella Color Charm takes it out.</li><li><b>Afro and relaxed hair:</b> pick a conditioning dye and deep condition after.</li></ul></div>'
    + '</div><div class="hd-warn"><b>Patch test every time.</b> Test 48 hours before you colour, even with a dye you have used before, and follow the instructions in the box. Never use hair dye on eyebrows or eyelashes.</div></section>'
    + '<section class="hd-s hd-c3" id="shops"><div class="hd-h"><div><h2>Buy hair dye in Leeds</h2><p class="hd-sub">Ask our staff to help you match a shade.</p></div></div><div class="hd-shops">'
    + '<div><b>Chapeltown</b>119 Chapeltown Road, Leeds LS7</div><div><b>Roundhay Road</b>256 Roundhay Road, Harehills, Leeds LS8</div><div><b>City centre</b>New York Street, Leeds LS2</div></div>'
    + '<p style="margin:14px 0 0">Call <a href="tel:+441132495562" style="color:var(--tl);font-weight:700">0113 249 5562</a>. Salons and barbers can ask about trade prices. Looking for a colourist? See our <a href="/pages/afro-hair-salons-leeds" style="color:var(--tl);font-weight:700">Leeds salon finder</a>.</p></section>'
    + '<section class="hd-s" id="faq"><div class="hd-h"><div><h2>Questions</h2></div></div>' + FAQ.map(q => '<details><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>').join('') + '</section>'
    + '</div><div class="hd-band"></div></div><script>' + JS + '</script>'
}

export const PAGE = {
  handle: 'hair-dye-leeds',
  title: 'Hair Dye Leeds',
  seoTitle: 'Hair Dye Leeds | Hair Colour, Bleach & Professional Dye | CC Hair & Beauty',
  seoDescription: "Hair dye in Leeds: L'Oréal, Wella, Schwarzkopf, Garnier, Creme of Nature and more. Box dye, salon colour, bleach, developers and toners in Chapeltown, Roundhay Road and the city centre.",
}
