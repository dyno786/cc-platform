// The Leeds salon finder page on cchairandbeauty.com (/pages/afro-hair-salons-leeds).
// Listings come from Google's business listings, checked October 2026. Shops that also sell hair and
// cosmetics are left out on purpose. Headings and questions use the terms people search for in Leeds
// (from the shop's Search Console: hair weave leeds, afro hair salon leeds, hair braiding leeds city centre,
// black hair salon leeds, black hairdressers leeds, afro hairdressers leeds, african hair salon leeds).
import { wantBlock, offerBlock } from './salon'

// [name, area, address (null = area only, home-based), what they do, phone, Google place id]
export const GROUPS = [
  ['salons', 'Afro and black hair salons in Leeds', [
    ['Creatyve', 'Harehills', '9 Harehills Road, Leeds LS8 5HR', 'Afro and black hair salon', '07905 582543', 'ChIJU98wsYlbeUgRF3K0J2pjnNA'],
    ['Gold Afro Hair Restoration Studio', 'Harehills', 'Roundhay Road, Leeds LS8 5AJ', 'Afro hair restoration and treatments', '07780 183100', 'ChIJ8RYBVoFdeUgRosGvTszlEn0'],
    ['Hairlife Hair Design', 'Roundhay', 'Unit 3a, Roundhay Road, Leeds LS8 2SH', 'Afro and natural hair styling', '07593 173022', 'ChIJndrAxQ5ceUgRhoydIqwh8p0'],
    ['Comforts Hair and Beauty', 'Meanwood', '601 Meanwood Road, Leeds LS6 4AY', 'Afro hair salon: braids, locs and styling', '0113 217 4098', 'ChIJkZUX0URZeUgRNI5KTfd4U6o'],
    ['Samba Hair and Beauty', 'Harehills', '79 Harehills Road, Leeds LS8 5HS', 'African hair salon: braids and styling', '07410 783889', 'ChIJrW4NDs1beUgRTEgNk27QlLI'],
    ["Nicky's Hair Boutique", 'Chapeltown', '219 Chapeltown Road, Leeds LS7 3DX', 'Afro and natural hair salon', '0113 519 9417', 'ChIJVz2lN75beUgR6R03bDr2W74'],
    ['Divine Touch Multicultural Hair & Beauty', 'Chapeltown', '52 Mexborough Street, Leeds LS7 3EH', 'Multicultural hair salon', '0113 262 8245', 'ChIJhS1FTPZbeUgRnx3sRQoyvcM'],
    ['Creative Hands Hair Salon', 'Harehills', '579 Harehills Lane, Leeds LS9 6NQ', 'Braids, natural hair and afro styling', '07704 437429', 'ChIJ14o7MCVdeUgR0JONr60uSrM'],
    ['Keka Hair', 'City centre', '20-22 King Charles Street, Leeds LS1 6LT', 'Afro Caribbean hairdresser and braiding', '0113 440 9736', 'ChIJ_cPQF55deUgRZx_8-UO5gxw'],
    ['Elite Hair Studio', 'Armley', '43 Armley Ridge Road, Leeds LS12 3LD', 'Afro and black hair salon', '0113 220 5888', 'ChIJq5IFbNleeUgRNXO5pI9_1Rc'],
    ['Routed Creative Studio', 'City centre', '36 Call Lane, Leeds LS1 6DT', 'Natural hair studio', '', 'ChIJveF72aJdeUgRv7ZJxiksl5I'],
  ]],
  ['braiders', 'Hair braiding in Leeds', [
    ['Josephines Hair Braiding', 'City centre', 'Unit 490, Leeds Kirkgate Market, Leeds LS2 7JG', 'African hair braiding in the market', '07722 651979', 'ChIJPYIisxBceUgRlz78bA2ljTQ'],
    ['BraidsYong', 'Roundhay', 'Unit 3a, Clock Buildings, Roundhay Road, Leeds LS8 2SH', 'Knotless braids and braid styles', '07867 598683', 'ChIJgxMokhxbeUgRQIpM_c8udvw'],
    ['MXBRAIDS', 'Armley', '73 Town Street, Armley, Leeds LS12 3HD', 'Braids and knotless braids', '', 'ChIJiR0wMlRfeUgR5tMIyQ1DNsI'],
    ["Madorsa Braids & Strykafade's", 'Beeston', '289 Beeston Road, Leeds LS11 7HX', 'Braids, plus a unisex barber', '07897 174665', 'ChIJRc6ujUVfeUgRt9Qr9Da1jcM'],
    ['Hairby', 'Harehills', 'Harehills Lane, Leeds LS9 6AP', 'Braids', '07737 351979', 'ChIJDQSH-r9deUgRaL2IRmmuxMQ'],
    ['Afro Hair Extensions', 'Belle Isle', null, 'Braids and afro hair extensions', '07702 067145', 'ChIJr_wo1KFdeUgRT8izAHlb02Q'],
    ['Bolikokoroewa', 'Harehills', null, 'Knotless braids and locs', '07448 849017', 'ChIJz-GiRu5beUgRcI1d7vxL0S0'],
    ['Hairluxe by Chinygold', 'Holbeck', null, 'Knotless braids', '07466 511745', 'ChIJO4xMxeZfeUgR70gp76UtIGo'],
  ]],
  ['locs', 'Loc specialists and dreadlock salons in Leeds', [
    ['Deluxe Locs Studio', 'Oakwood', 'Oaktree House, Oakwood Lane, Leeds LS8 3LG', 'Locs: starting, retwists and maintenance', '07743 365275', 'ChIJ9SztgcxbeUgRcx5ekOyzZPY'],
    ["Queenie's Loc Boutique", 'Chapeltown', '178 Chapeltown Road, Leeds LS7 4HP', 'Loc specialist', '07904 289629', 'ChIJ6R1uxZxbeUgRvzW4SKn7ctY'],
    ['Monodreadlocks', 'Wortley', '127 Upper Wortley Road, Leeds LS12 4JR', 'Dreadlocks and loc extensions', '', 'ChIJC7sPNaNfeUgRWNplEvqPhTo'],
    ['Dreadlock Rasta P', 'Chapel Allerton', null, 'Dreadlocks', '07786 320240', 'ChIJD7XZJDJbeUgRHUWriLZU15Q'],
  ]],
  ['barbers', 'Black and afro barbers in Leeds', [
    ['Sensation Barbers', 'Chapeltown', '158 Chapeltown Road, Leeds LS7 4EE', 'Afro barber: fades and cuts', '07963 146512', 'ChIJ2-Xry_VbeUgRVTT02PrCXlA'],
    ['W2 Barbershop', 'Roundhay', '131 Easterly Road, Leeds LS8 2TP', 'Barber: fades and cuts', '0113 248 1637', 'ChIJy3W7hIFbeUgRRSSuM4a-odM'],
    ['Kblackbarbers', 'Dewsbury Road', '116 Dewsbury Road, Leeds LS11 6XD', 'Afro barber', '', 'ChIJ-9mQ4o9feUgRk2lKfjBWD6E'],
  ]],
  ['weave', 'Hair weave and wig installs in Leeds', [
    ['LUXBYLALA', 'Chapeltown', '174 Chapeltown Road, Leeds LS7 4HP', 'Wig installs and weaves', '07307 629909', 'ChIJGUjIGRddeUgRNM8c7gXyiCg'],
    ['Hair By Finocas', 'Dewsbury Road', '116 Dewsbury Road, Leeds LS11 6XD', 'Wig installs, weaves and locs', '07900 462065', 'ChIJi039bltdeUgRYfnskDuKFLk'],
    ['Vicky Boateng', 'Meanwood Road', '134 Meanwood Road, Leeds LS7 2AQ', 'Wigs and hair extensions', '07960 146809', 'ChIJCfdM-0pdeUgR-al5Kbuir44'],
  ]],
]

const FAQ = [
  ['Where can I get my hair braided in Leeds city centre?', 'Braiders listed in or near the city centre include Josephines Hair Braiding in Kirkgate Market and Keka Hair on King Charles Street. Many more braiders work in Harehills, Chapeltown and Roundhay, a short trip from town.'],
  ['Where can I buy braiding hair and weave in Leeds?', 'At any of our three CC Hair & Beauty shops: 119 Chapeltown Road, 256 Roundhay Road and New York Street in the city centre. You can also order online and collect in store.'],
  ['Is there a black hair salon near me in Leeds?', 'Most afro and black hair salons in Leeds are in Harehills, Chapeltown and Roundhay (LS7 and LS8), with others in the city centre, Meanwood, Armley and Beeston. If there is none near you, use the "No salon near you?" box on this page.'],
  ['Where are the black barbers in Leeds?', 'Barbers listed here are in Chapeltown, Roundhay and on Dewsbury Road. Call ahead to check opening times.'],
  ['Do you recommend these salons?', 'No. We list them to help you find afro hair specialists in Leeds. We have not visited them and we do not rank them. Read their own pages and reviews, and call before you travel.'],
]

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const maps = (name, id) => 'https://www.google.com/maps/search/?api=1&amp;query=' + encodeURIComponent(name + ' Leeds').replace(/%20/g, '+') + '&amp;query_place_id=' + id

function card(l) {
  const [name, area, addr, what, phone, id] = l
  const tel = phone ? ' · <a href="tel:' + phone.replace(/\s/g, '') + '">' + esc(phone) + '</a>' : ''
  return '<div class="cg-c">\n<span class="cg-ar">' + esc(area) + '</span><b>' + esc(name) + '</b><span>' + esc(what) + '</span><span>' + (addr ? esc(addr) : 'By appointment') + '</span><p><a href="' + maps(name, id) + '" target="_blank" rel="noopener nofollow">View on Google Maps</a>' + tel + '</p>\n</div>'
}

export const COUNT = GROUPS.reduce((a, g) => a + g[2].length, 0)

// css: the <style> block from another city page, so all city pages share one look.
// shop: the "Shop before your appointment" section from another city page.
export function buildLeeds(css, shop) {
  const shopLeeds = shop
    .replace(/Order it here and have it delivered to [A-Za-z ]+\./, 'Pick it up at one of our three Leeds shops, or order here and collect in store.')
    .replace(/<p style="margin:10px 0 0">[\s\S]*?<\/p>/, '<p style="margin:10px 0 0">Our Leeds shops are at 119 Chapeltown Road (LS7), 256 Roundhay Road (LS8) and New York Street in the city centre (LS2). Staff can tell you how many packs to buy for your style.</p>')
  const dir = GROUPS.map(g => '<h3>' + esc(g[1]) + '</h3>\n<div class="cg-d">\n' + g[2].map(card).join('\n') + '\n</div>').join('\n')
  return css + '<div class="cg">\n<div class="cg-band"></div>\n<div class="cg-hero">\n<span class="cg-k">Leeds hair guide</span><p class="cg-big">Afro hair salons, braiders and black barbers in <span>Leeds</span></p>\n'
    + '<p>' + COUNT + ' afro and black hair salons, braiders, loc specialists and barbers across Leeds, plus where to buy your braiding hair and weave before your appointment.</p>\n'
    + '<a class="cg-btn" href="#find">Find a salon</a><a class="cg-btn cg-alt" href="#near-me">No salon near you?</a>\n</div>\n<div class="cg-in">\n'
    + '<nav class="cg-nav" aria-label="On this page"><a href="#find">Salons and braiders</a><a href="#near-me">Near me</a><a href="#offer">10% off hair</a><a href="#shop">Shop</a><a href="#weave">Hair weave</a><a href="#faq">Questions</a></nav>'
    + '<section class="cg-s" id="find"><div class="cg-h"><div>\n<h2>Afro hair salons and black hairdressers in Leeds</h2>\n<p class="cg-sub">African, Caribbean and natural hair specialists, listed by type in no particular order. Call ahead to check opening times and prices.</p>\n</div></div>\n'
    + dir
    + '<p class="cg-src">Listings were found through Google and checked in October 2026. Shops that mainly sell hair and cosmetics are not listed. We have not visited these businesses, we are not connected to them and we do not rank or recommend one over another. Own one of these businesses, or spotted a mistake? Call us on <a href="tel:+441132495562">0113 249 5562</a> and we will fix it.</p></section>'
    + wantBlock('leeds')
    + offerBlock('leeds')
    + shopLeeds
    + '<section class="cg-s cg-g" id="weave"><div class="cg-h"><div>\n<h2>Hair weave in Leeds: what to buy</h2>\n<p class="cg-sub">Getting a sew-in or a wig install? Here is what your stylist will usually ask you to bring.</p>\n</div></div>\n'
    + '<ul>\n<li><b>Bundles.</b> Two bundles for short to shoulder length, three for mid-back, three or four for longer hair.</li>\n<li><b>A closure or frontal.</b> A 4x4 closure finishes the parting; a 13x4 frontal covers the whole hairline.</li>\n<li><b>Human hair or synthetic.</b> Human hair can be curled, straightened and coloured. Synthetic is cheaper but most cannot take heat.</li>\n<li><b>Aftercare.</b> A light serum for the lengths, a leave-in conditioner and a silk scarf for night.</li>\n</ul>\n'
    + '<p style="margin:0">See our <a href="/pages/hair-extensions-leeds">hair extensions in Leeds</a> and <a href="/pages/wig-shop-leeds">wig shop in Leeds</a> guides, or the <a href="/pages/afro-hairstyles">afro hairstyles guide</a> for how much hair each style needs.</p></section>'
    + '<section class="cg-s" id="faq"><div class="cg-h"><div><h2>Questions</h2></div></div>\n'
    + FAQ.map(q => '<details><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>').join('')
    + '</section>\n</div>\n<div class="cg-band"></div>\n</div>'
}

export const PAGE = {
  handle: 'afro-hair-salons-leeds',
  title: 'Afro Hair Salons, Braiders & Black Barbers in Leeds',
  seoTitle: 'Afro Hair Salons & Black Hairdressers in Leeds | Braiding, Locs, Barbers',
  seoDescription: 'Find afro and black hair salons, hair braiding, loc specialists, black barbers and hair weave stylists across Leeds, from Chapeltown and Harehills to the city centre.',
}
