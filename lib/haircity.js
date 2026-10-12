// The page people find when they search "hair city leeds" (2,109 searches a year).
// Hair City in Leeds has closed and a different business has opened at its old site. This page says so plainly,
// makes clear CC Hair & Beauty is not connected to either, and shows where to find us instead.
// It must never present CC Hair & Beauty as Hair City. Remove the closed notice if Hair City ever reopens.
// Shop addresses, hours and phone come from the shop's own earlier version of this page.
import { CSS } from './hairdye'

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const link = (href, text) => '<a href="' + href + '" style="color:var(--tl);font-weight:700">' + text + '</a>'

const CATS = [
  ['Braiding hair', '/collections/crochet-braided'], ['Wigs and lace wigs', '/collections/wigs-lace-wigs'], ['Human hair extensions', '/pages/human-hair-extensions-leeds'],
  ['Hair weave', '/pages/hair-weave-leeds'], ['Hair dye', '/pages/hair-dye-leeds'], ['Relaxers', '/collections/relaxers'], ['Edge control', '/collections/edge-control'],
  ['Shampoo and conditioner', '/collections/conditioners'], ['Hair oils', '/collections/hair-oil'], ['Skin care', '/collections/skin-care'],
  ['Makeup and lashes', '/collections/eyelashes'], ['Clippers and barber supplies', '/collections/clippers-trimmers'],
]
const FAQ = [
  ['Is Hair City in Leeds still open?', 'We understand Hair City in Leeds has closed, and a different business now trades from its old site. CC Hair & Beauty is a separate business and is not connected to Hair City or to the new business.'],
  ['Where can I buy afro hair products in Leeds city centre?', 'CC Hair & Beauty is at 1–19 New York Street, Leeds LS2 7DT, a 3-minute walk from Leeds Bus Station. We are open Monday to Saturday, 9am to 8pm.'],
  ['Where can I buy braiding hair and wigs in Leeds?', 'At any of our three Leeds shops: New York Street in the city centre, Chapeltown Road and Roundhay Road. You can also order online and collect in store.'],
  ['Is there a hair shop open on Sunday in Leeds?', 'Our Chapeltown Road shop is open every day, 9am to 8pm.'],
]

export const PAGE = {
  handle: 'hair-city-leeds-cc-hair-beauty',
  title: 'Looking for Hair City Leeds?',
  seoTitle: 'Hair City Leeds Closed? Afro Hair Shop in Leeds City Centre | CC Hair & Beauty',
  seoDescription: 'Looking for Hair City in Leeds? We understand it has closed. CC Hair & Beauty, a separate business, is on New York Street in Leeds city centre with braiding hair, wigs, weave, hair dye and more.',
}

export function buildHairCity() {
  return '<style>' + CSS + '.hd-note{background:#fff;border-left:8px solid var(--gd);border-radius:16px;padding:18px 18px;margin:14px 0 0}.hd-note p{margin:0 0 10px}.hd-note p:last-child{margin:0}.hd-cats{display:flex;flex-wrap:wrap;gap:8px}.hd-cats a{background:var(--sd);border-radius:999px;padding:9px 15px;text-decoration:none;font-weight:700;font-size:15px}.hd-cats a:hover{background:var(--gd)}.hd-shops div span{display:block;font-size:14.5px;color:#4a4760}</style>'
    + '<div class="hd" id="hd"><div class="hd-band" style="background:repeating-linear-gradient(90deg,#e4572e 0 40px,#f2b134 40px 80px,#0c6f6f 80px 120px)"></div>'
    + '<div class="hd-hero"><span class="hd-k">Leeds city centre</span><p class="hd-big">Looking for <span>Hair City</span> in Leeds?</p>'
    + '<p>We understand Hair City in Leeds has closed. If you need afro hair and beauty products in Leeds city centre, CC Hair &amp; Beauty is on New York Street, a 3-minute walk from the bus station.</p>'
    + '<a class="hd-btn" href="#visit">Find our city centre shop</a><a class="hd-btn hd-alt" href="/collections">Shop online</a></div>'
    + '<div class="hd-in">'
    + '<div class="hd-note"><p><b>Please note:</b> CC Hair &amp; Beauty is a separate business. We are not connected to Hair City, and we are not connected to the business that has opened at its old site.</p><p>We are a Leeds family business, trading under our own name since 1979.</p></div>'
    + '<section class="hd-s hd-c2" id="visit"><div class="hd-h"><div><h2>CC Hair &amp; Beauty, Leeds city centre</h2><p class="hd-sub">Walk in, no appointment needed.</p></div></div>'
    + '<div class="hd-shops"><div><b>Address</b>1–19 New York Street<span>Leeds LS2 7DT, near Trinity Leeds and Leeds Bus Station</span></div><div><b>Opening hours</b>Monday to Saturday<span>9am to 8pm</span></div><div><b>Phone</b>' + link('tel:+441133183830', '0113 318 3830') + '<span>Online shop open 24/7, free delivery over £75</span></div></div>'
    + '<p style="margin:14px 0 0">' + link('https://maps.google.com/?q=CC+Hair+and+Beauty+New+York+Street+Leeds+LS2+7DT', 'Get directions on Google Maps') + '</p></section>'
    + '<section class="hd-s" id="shop"><div class="hd-h"><div><h2>What you can buy</h2><p class="hd-sub">Over 23,000 products from more than 1,000 brands, in store and online.</p></div></div><div class="hd-cats">'
    + CATS.map(c => '<a href="' + c[1] + '">' + esc(c[0]) + '</a>').join('') + '</div></section>'
    + '<section class="hd-s hd-c3" id="shops"><div class="hd-h"><div><h2>Our three Leeds shops</h2></div></div><div class="hd-shops">'
    + '<div><b>City centre</b>1–19 New York Street, LS2 7DT<span>Monday to Saturday, 9am to 8pm</span></div>'
    + '<div><b>Chapeltown</b>121–129 Chapeltown Road, LS7 3DU<span>Every day, 9am to 8pm</span></div>'
    + '<div><b>Roundhay Road</b>256–258 Roundhay Road, LS8 5RL<span>Monday to Saturday, 9am to 8pm</span></div></div>'
    + '<p style="margin:14px 0 0">Also see: ' + link('/pages/afro-hair-salons-leeds', 'Leeds salon finder') + ' · ' + link('/pages/hair-dye-leeds', 'Hair dye Leeds') + ' · ' + link('/pages/wig-shop-leeds', 'Wig shop Leeds') + ' · ' + link('/pages/hair-extensions-leeds', 'Hair extensions Leeds') + '</p></section>'
    + '<section class="hd-s" id="faq"><div class="hd-h"><div><h2>Questions</h2></div></div>' + FAQ.map(q => '<details><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>').join('') + '</section>'
    + '</div><div class="hd-band" style="background:repeating-linear-gradient(90deg,#e4572e 0 40px,#f2b134 40px 80px,#0c6f6f 80px 120px)"></div></div>'
}
