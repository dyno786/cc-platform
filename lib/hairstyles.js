// The "Afro hairstyles" guide page on cchairandbeauty.com: a swipeable style picker that shows, for each style,
// how much hair to buy, real products from several brands, aftercare advice and the aftercare range.
// buildPage() returns the page HTML. Edit the STYLES list to change pack numbers, wording or products.

const CDN = 'https://cdn.shopify.com/s/files/1/0605/2118/5501/'

// Aftercare range tiles: collections already in the shop.
const CARE = {
  braidcare: ['Braid care', 'braid-care', 'collections/braid-care-collection.png?v=1791368196'],
  oil: ['Scalp and hair oils', 'hair-oil', 'collections/hair-oil-collection.png?v=1791672046'],
  bonnet: ['Bonnets and sleep caps', 'bonnets-sleep-caps', 'collections/bonnets-sleep-caps-collection.png?v=1791303558'],
  edge: ['Edge control', 'edge-control', 'collections/edge-control-collection.png?v=1791672062'],
  beads: ['Hair beads', 'hair-beads', 'collections/hair-beads-collection.png?v=1791304182'],
  kids: ['Kids braid care', 'braid-care-kids', 'collections/braid-care-kids-collection.png?v=1791300635'],
  gel: ['Styling gels', 'hair-styling-gels', 'collections/hair-styling-gels-collection.png?v=1791367623'],
  sheen: ['Sheen spray', 'sheen-spray', 'collections/sheen-spray-collection.png?v=1791368014'],
  serum: ['Hair serums', 'serums', 'collections/serums-collection.png?v=1791367566'],
  shampoo: ['Shampoo', 'shampoo', 'collections/shampoo-collection.png?v=1791365618'],
  conditioner: ['Conditioners', 'conditioners', 'collections/conditioners-collection.png?v=1791366494'],
  wigcap: ['Wig caps and bands', 'wig-caps-heads', 'collections/wig-caps-heads-collection.png?v=1791556497'],
  glue: ['Wig glue and removers', 'glues-removers-1', 'collections/glues-removers-1-collection.png?v=1791556470'],
  wigacc: ['Wig accessories', 'wig-accessories', 'collections/wig-accessories-collection.png?v=1791556453'],
}

const NIGHT = 'Sleep in a satin bonnet or scarf every night.'
const SCALP = 'Oil or spray your scalp two or three times a week. Go light on the lengths.'
const WASH = 'Every two weeks, wash your scalp with diluted shampoo and dry it fully.'
const TIGHT = 'If it hurts or you see bumps at the hairline, it is too tight. Go back to your stylist.'
const BRAID_ALL = ['/collections/crochet-braided', 'See all braiding hair']
const LENGTHS = ['Shoulder', 'Mid-back', 'Waist']

// packs: one entry per length. hair: [product handle, short name, brand].
export const STYLES = [
  { id: 'knotless-braids', name: 'Knotless braids', short: 'Knotless',
    blurb: 'Box braids that start with your own hair and feed the extension in, so there is no knot at the root. They lie flat, feel lighter and are kinder to your edges.',
    lasts: '6 to 8 weeks', chair: '4 to 8 hours', hairType: 'pre-stretched braiding hair',
    packs: ['4 to 5 packs', '5 to 7 packs', '7 to 9 packs'], note: 'Large 160g packs such as X-pression Ultra Braid go further: about 2, 3 or 4 packs.',
    hair: [['x-pression-ultra-braid-pre-stretched', 'Ultra Braid Pre-Stretched 46"', 'X-pression'], ['smart-braid-professional-pre-stretched-braid-3x-28-value-pack', 'Pre-Stretched Braid 3X 28" Value Pack', 'Smart Braid'], ['kuknus-collection-kuknus-braid-professional-pre-stretched-anti-itch-fibre-6x-26', 'Pre-Stretched Anti Itch Braid 6X 26"', 'Kuknus'], ['x-pression-6x-synthetic-pre-stretched-ultra-braid-52', 'Pre-Stretched Ultra Braid 6X 52"', 'X-pression']],
    all: BRAID_ALL, tips: [NIGHT, SCALP, WASH, 'Take them out after eight weeks at the most.', TIGHT], care: ['braidcare', 'oil', 'bonnet', 'edge'] },
  { id: 'box-braids', name: 'Box braids', short: 'Box braids',
    blurb: 'The classic: square partings with the extension knotted in at the root. Hard wearing and easy to style up or down.',
    lasts: '6 to 8 weeks', chair: '4 to 8 hours', hairType: 'pre-stretched braiding hair',
    packs: ['4 to 5 packs', '5 to 7 packs', '7 to 9 packs'], note: 'Large 160g packs such as X-pression Ultra Braid go further: about 2, 3 or 4 packs.',
    hair: [['x-pression-ultra-braid-pre-stretched', 'Ultra Braid Pre-Stretched 46"', 'X-pression'], ['x-smart-pre-stretched-braid-2x-26', 'Pre-Stretched Braid 2X 26"', 'Smart Braid'], ['kuknus-collection-26-8x-pack-pre-stretch-braids', 'Pre Stretch Braids 8X 26"', 'Kuknus'], ['x-pression-3x-synthetic-pre-stretched-ultra-braid-72', 'Pre-Stretched Ultra Braid 3X 72"', 'X-pression']],
    all: BRAID_ALL, tips: [NIGHT, SCALP, WASH, 'Take them out after eight weeks at the most.', TIGHT], care: ['braidcare', 'oil', 'bonnet', 'edge'] },
  { id: 'ghana-braids', name: 'Ghana braids', short: 'Ghana braids',
    blurb: 'Also called feed-in cornrows or banana braids. Thick cornrows braided close to the scalp, usually straight back or into a ponytail.',
    lasts: '2 to 4 weeks', chair: '1 to 3 hours', hairType: 'braiding hair',
    packs: ['2 to 3 packs', '3 to 4 packs', '4 to 5 packs'], note: 'Fewer, thicker cornrows need less hair. Lots of thin ones need more.',
    hair: [['x-pression-ultra-braid-pre-stretched', 'Ultra Braid Pre-Stretched 46"', 'X-pression'], ['kuknus-collection-braiding-extensions-20', 'Pre Stretch Braids 2X 20"', 'Kuknus'], ['x-smart-pre-stretched-braid-2x-26', 'Pre-Stretched Braid 2X 26"', 'Smart Braid']],
    all: BRAID_ALL, tips: ['Tie them down with a durag or satin scarf at night to keep them flat.', SCALP, 'Smooth flyaways with a little edge control or mousse.', 'Take them out after four weeks at the most.', TIGHT], care: ['oil', 'edge', 'bonnet', 'sheen'] },
  { id: 'fulani-braids', name: 'Fulani braids', short: 'Fulani',
    blurb: 'Cornrows at the front, often with one down the centre, and loose braids at the back. Usually finished with beads or cuffs.',
    lasts: '4 to 6 weeks', chair: '3 to 5 hours', hairType: 'braiding hair, plus beads',
    packs: ['3 to 4 packs', '4 to 5 packs', '5 to 6 packs'], note: 'Add one or two packs of beads or cuffs.',
    hair: [['kuknus-collection-braiding-extensions-26', 'Pre Stretch Braids 2X 26"', 'Kuknus'], ['x-pression-ultra-braid-pre-stretched', 'Ultra Braid Pre-Stretched 46"', 'X-pression'], ['smart-braid-professional-pre-stretched-braid-3x-28-value-pack', 'Pre-Stretched Braid 3X 28" Value Pack', 'Smart Braid']],
    all: BRAID_ALL, tips: [NIGHT, SCALP, 'Check beads are secure, and take heavy ones off if they pull.', 'Take them out after six weeks at the most.', TIGHT], care: ['beads', 'oil', 'edge', 'bonnet'] },
  { id: 'boho-braids', name: 'Boho braids', short: 'Boho',
    blurb: 'Also called goddess braids. Knotless braids with loose curly pieces left out along the length for a softer, fuller look.',
    lasts: '4 to 6 weeks', chair: '5 to 8 hours', hairType: 'braiding hair, plus curly bulk hair',
    packs: ['4 to 5 packs of braiding hair, plus 2 packs of curls', '5 to 7 packs of braiding hair, plus 2 to 3 packs of curls', '7 to 8 packs of braiding hair, plus 3 to 4 packs of curls'], note: 'Human hair curls cost more but tangle far less than synthetic ones.',
    hair: [['rush-100-virgin-brazilian-boho-braids-deep-wave-bulk', 'Virgin Brazilian Boho Braids Deep Wave Bulk', 'Rush'], ['cherish-deep-twist-bulk-22', 'Deep Twist Bulk', 'Cherish'], ['hair-maker-boho-braids-crochet-styles-caribbean-pre-stretched-deep-twist-22', 'Boho Braids Deep Twist 22"', 'Hair Maker'], ['x-pression-ultra-braid-pre-stretched', 'Ultra Braid Pre-Stretched 46"', 'X-pression']],
    all: BRAID_ALL, tips: [NIGHT, 'Mist the curls with water and a light leave-in, then smooth on mousse. Separate them with your fingers, not a comb.', SCALP, 'Trim any curls that matt. Take the style out after six weeks at the most.', TIGHT], care: ['braidcare', 'oil', 'bonnet', 'serum'] },
  { id: 'french-curl-braids', name: 'French curl braids', short: 'French curl',
    blurb: 'Braids that stop part way down and finish in long, bouncy curls. The curl is already in the hair, so the look is ready as soon as it is braided.',
    lasts: '4 to 6 weeks', chair: '4 to 7 hours', hairType: 'French curl braiding hair',
    packs: ['5 to 6 single packs', '6 to 8 single packs', '8 to 10 single packs'], note: 'A 3X value pack counts as three single packs.',
    hair: [['cherish-spiral-french-curl-3x-braid-pre-stretched-22', 'Spiral French Curl 3X 22"', 'Cherish'], ['jazzy-ultra-3d-3x-french-curl-braids-22', 'Ultra 3D French Curl 3X 22"', 'Jazzy'], ['kali-feel-me-french-curl-22', 'Feel Me French Curl 22"', 'Kali'], ['sleek-fashion-idol-french-curl-braids-28', 'Fashion Idol French Curl 28"', 'Sleek']],
    all: BRAID_ALL, tips: [NIGHT, 'Smooth mousse over the curls every few days and separate them with your fingers.', SCALP, 'Do not brush the curls. Take the style out after six weeks at the most.', TIGHT], care: ['braidcare', 'oil', 'bonnet', 'sheen'] },
  { id: 'senegalese-twists', name: 'Senegalese twists', short: 'Senegalese',
    blurb: 'Smooth, rope-like two-strand twists made with straight braiding hair. Sleek and light, with a little more shine than braids.',
    lasts: '6 to 8 weeks', chair: '4 to 7 hours', hairType: 'pre-stretched braiding hair',
    packs: ['4 to 5 packs', '5 to 7 packs', '7 to 8 packs'], note: 'Large 160g packs go further: about 2, 3 or 4 packs.',
    hair: [['x-pression-ultra-braid-pre-stretched', 'Ultra Braid Pre-Stretched 46"', 'X-pression'], ['kuknus-collection-braiding-extensions-26', 'Pre Stretch Braids 2X 26"', 'Kuknus'], ['smart-braid-professional-pre-stretched-braid-3x-28-value-pack', 'Pre-Stretched Braid 3X 28" Value Pack', 'Smart Braid']],
    all: BRAID_ALL, tips: [NIGHT, SCALP, WASH, 'Twists can slip sooner than braids. Ask your stylist to redo the front if it loosens.', TIGHT], care: ['braidcare', 'oil', 'bonnet', 'edge'] },
  { id: 'passion-twists', name: 'Passion twists', short: 'Passion twists',
    blurb: 'Soft, springy two-strand twists made with water wave hair. They have a relaxed, slightly undone finish.',
    lasts: '4 to 6 weeks', chair: '3 to 5 hours', hairType: 'water wave or passion twist hair',
    packs: ['5 to 6 packs', '6 to 8 packs', '8 to 10 packs'], note: 'Pre-twisted crochet packs are quicker to fit: allow 6 to 8 packs.',
    hair: [['cherish-syn-bulk-passion-twist-18', 'Bulk Passion Twist 18"', 'Cherish'], ['freetress-braids-water-wave-bulk-22', 'Water Wave Bulk 22"', 'Freetress'], ['cherish-bulk-water-wave-bulk-22-inch', 'Water Wave Bulk', 'Cherish'], ['janet-collection-nala-tress-passion-twist-crochet-braid-18', 'Nala Tress Passion Twist Crochet 18"', 'Janet Collection'], ['kali-classic-passion-twist-crochet-braid-18', 'Passion Twist Crochet 3X 18"', 'Kali']],
    all: BRAID_ALL, tips: [NIGHT, 'Smooth mousse over the twists to calm frizz. Some frizz is part of the look.', SCALP, 'Take them out after six weeks at the most.', TIGHT], care: ['braidcare', 'oil', 'bonnet', 'gel'] },
  { id: 'marley-twists', name: 'Marley twists', short: 'Marley twists',
    blurb: 'Chunky twists made with coarse, kinky Marley hair, so they look close to natural afro hair. Light for their size.',
    lasts: '6 to 8 weeks', chair: '3 to 5 hours', hairType: 'Marley or afro kinky hair',
    packs: ['4 to 5 packs', '5 to 7 packs', '6 to 8 packs'], note: 'Thicker twists use fewer packs.',
    hair: [['jinnys-beauty-marley-braid', 'Marley Braid Afro Twist', "Jinny's Beauty"], ['angels-marley-braids-crochet-120g', 'Marley Braids 120g', 'Angels'], ['kuknus-collection-crochet-marley-braid-20', 'Crochet Marley Braid 20"', 'Kuknus'], ['aftress-afro-kinky-bulk-24-oos', 'Afro Kinky Bulk 24"', 'Aftress']],
    all: BRAID_ALL, tips: [NIGHT, SCALP, WASH, 'Seal the ends as your stylist shows you so they do not unravel.', TIGHT], care: ['braidcare', 'oil', 'bonnet', 'edge'] },
  { id: 'faux-locs', name: 'Faux locs', short: 'Faux locs',
    blurb: 'The look of locs without the commitment. Soft locs, butterfly locs and crochet locs are all versions of this style.',
    lasts: '6 to 8 weeks', chair: '4 to 8 hours', hairType: 'crochet locs, or wrapping hair for soft locs',
    packs: ['5 to 6 packs', '6 to 8 packs', '8 to 10 packs'], note: 'Ready-made crochet locs are the quickest to fit. Wrapped locs take longer and use more hair.',
    hair: [['janet-collection-ghana-faux-locs-20-nala-tress', 'Nala Tress Ghana Faux Locs 20"', 'Janet Collection'], ['janet-collection-2-x-havana-mambo-faux-locs-14', 'Havana Mambo Faux Locs 2X', 'Janet Collection'], ['angels-soft-dredlocks-crochet-braids', 'Soft Dreadlocks Crochet', 'Angels'], ['outre-x-pression-twisted-up-borabora-locs-3x', 'Twisted Up Borabora Locs 3X', 'Outre X-pression'], ['magic-collection-faux-locs-brazilian-wool-hair-70g', 'Faux Locs Brazilian Wool 70g', 'Magic Collection']],
    all: BRAID_ALL, tips: ['Use a large bonnet or loc sock at night.', SCALP, WASH, 'Locs are heavier than braids. Do not tie them up tightly.', TIGHT], care: ['oil', 'braidcare', 'bonnet', 'sheen'] },
  { id: 'crochet-braids', name: 'Crochet braids', short: 'Crochet',
    blurb: 'Your own hair is cornrowed, then ready-made curls, twists or braids are looped on with a crochet needle. One of the fastest protective styles.',
    lasts: '4 to 6 weeks', chair: '2 to 3 hours', hairType: 'crochet hair',
    packs: ['3 to 4 packs', '4 to 6 packs', '5 to 7 packs'], note: 'Curly crochet hair gives more volume, so you need fewer packs than with straight styles.',
    hair: [['jazzyhair-crochet-braid-passion-curl', 'Crochet Braid Passion Curl', 'Jazzy Hair'], ['lexi-curl-looped-crochet-braid', 'Looped Crochet Braid Lexi Curl', 'Angels'], ['kali-classic-water-wave-crochet-braid-16', 'Water Wave Crochet 3X 16"', 'Kali'], ['kuknus-feather-crochet-human-hair-mastermix-deep-weave-20', 'Feather Crochet Deep Wave 18"', 'Kuknus'], ['outre-crochet-braids-x-pression-twisted-up-3x-springy-afro-twist-24', 'Springy Afro Twist 3X', 'Outre X-pression']],
    all: BRAID_ALL, tips: [NIGHT, 'Separate curls with your fingers and a little mousse. Do not brush them.', SCALP, 'Snip off any tangles. Take the style out after six weeks at the most.', TIGHT], care: ['gel', 'oil', 'bonnet', 'sheen'] },
  { id: 'sew-in-weave', name: 'Sew-in weave', short: 'Sew-in',
    blurb: 'Bundles of hair sewn onto cornrows, finished with a closure or some of your own hair left out at the parting.',
    lasts: '6 to 8 weeks', chair: '2 to 4 hours', hairType: 'weave bundles, plus a closure',
    packs: ['2 bundles and a closure', '3 bundles and a closure', '3 to 4 bundles and a closure'], note: 'The longer the hair, the thinner each bundle, so long styles need an extra one.',
    hair: [['premium-too-human-hair-extensions-yaki-weave', 'Premium Too Yaki Weave', 'Sensationnel'], ['hairmaker-brazilian-human-hair-premium-blend-natural-straight-weave', 'Brazilian Premium Blend Straight Weave', 'Hairmaker'], ['sensationnel-premium-too-deep-wave-weave-100-human-hair-extensions-110g-1', 'Premium Too Deep Wave Weave', 'Sensationnel'], ['rush-unique-original-brazilian-glamour-4x4-full-lace-closure-with-baby-hair-straight', 'Brazilian Glamour 4x4 Lace Closure', 'Rush']],
    all: ['/collections/hair-extensions', 'See all hair extensions'], tips: ['Wrap the hair in a silk scarf at night.', 'Wash every one to two weeks and dry the braids underneath fully.', 'Use a light serum on the lengths. Keep oil away from the wefts.', 'Have it taken down after eight weeks at the most.', TIGHT], care: ['serum', 'shampoo', 'conditioner', 'bonnet'] },
  { id: 'wig-install', name: 'Wig install', short: 'Wigs',
    blurb: 'A lace wig fitted by a stylist: your hair is braided flat, the wig is secured, and the lace is cut and blended into your hairline.',
    lasts: '1 to 3 weeks per install', chair: '1 to 2 hours', hairType: 'a lace wig, plus a wig cap and lace glue or gel',
    fixed: '1 wig, 1 wig cap and lace glue or holding gel', note: 'Ask your stylist whether they want a glueless wig or one to glue down.',
    hair: [['kali-feel-me-syn-tiffany-lace-front-wig', 'Feel Me Lace Wig Tiffany', 'Kali'], ['outre-melted-hairline-kinkysoft-3-hd-lace-front-wig-12', 'Melted Hairline KinkySoft HD Lace Front Wig', 'Outre'], ['ebin-wonder-lace-bond-hd-wig-cap', 'Wonder Lace Bond HD Wig Cap', 'EBIN New York'], ['ebin-new-york-wonder-lace-bond-wig-adhesive-spray-sensitive-14-2oz', 'Wonder Lace Bond Adhesive Spray Sensitive', 'EBIN New York'], ['ebin-new-york-tinted-lace-wig-knots-powder', 'Tinted Lace Powder', 'EBIN New York']],
    all: ['/collections/lace-front-wigs', 'See all lace front wigs'], tips: ['Do a patch test before using lace glue for the first time.', 'Tie a scarf or melt band around the hairline at night.', 'Always use a proper remover to lift the lace. Never pull it.', 'Give your own hair and hairline a rest between installs.'], care: ['wigcap', 'glue', 'wigacc', 'bonnet'] },
  { id: 'starter-locs', name: 'Starter locs and retwists', short: 'Locs',
    blurb: 'Locs started with comb coils, two-strand twists or interlocking, then kept neat with a retwist every few weeks.',
    lasts: 'Retwist every 4 to 6 weeks', chair: '1 to 3 hours', hairType: 'no added hair',
    fixed: 'No added hair needed', note: 'You only need a light locking gel and an oil for your scalp.',
    hair: [], all: ['/collections/hair-styling-gels', 'See styling gels'],
    tips: ['Cover locs with a durag, loc sock or bonnet at night.', 'Wait about four weeks before the first wash, then wash gently.', 'Use light products. Heavy creams and waxes cause build-up.', 'Do not retwist too often or too tightly: it thins the roots.'], care: ['gel', 'oil', 'bonnet', 'shampoo'] },
  { id: 'kids-braids', name: "Kids' braids with beads", short: 'Kids',
    blurb: 'Cornrows or small box braids for children, often finished with beads. Keep them light, loose and short enough to play in.',
    lasts: '3 to 4 weeks', chair: '1 to 3 hours', hairType: 'braiding hair, plus beads',
    packs: ['1 to 2 packs', '2 to 3 packs', '3 to 4 packs'], note: 'Many styles for children use no added hair at all. Add one or two packs of beads.',
    hair: [['kuknus-collection-braiding-extensions-12', 'Pre Stretch Braids 3X 12"', 'Kuknus'], ['cherish-junior-kids-3x-spirel-french-curl-14', 'Junior Kids French Curl 3X 14"', 'Cherish'], ['cherish-synthetic-junior-kids-crochet-braid-hair-passion-twist-8', 'Junior Kids Passion Twist 8"', 'Cherish'], ['outre-x-pression-lil-looks-box-braid-10', 'Lil Looks Box Braid 10"', 'Outre X-pression']],
    all: BRAID_ALL, tips: ['Never braid tightly on a child. If they say it hurts, loosen it.', 'A small satin bonnet at night keeps braids neat.', 'Oil the scalp lightly twice a week.', 'Check beads are secure, and keep them away from very young children.', 'Take the style out after four weeks at the most.'], care: ['kids', 'beads', 'oil', 'bonnet'] },
]

const CITY_LINKS = ['London', 'Birmingham', 'Manchester', 'Nottingham', 'Bristol', 'Liverpool', 'Glasgow', 'Leicester', 'Wolverhampton', 'Sheffield']

const FAQ = [
  ['How many packs of braiding hair do I need?', 'For medium knotless or box braids at mid-back length, allow 5 to 7 standard packs, or about 3 large 160g packs. Shorter or thicker braids need less, and longer or smaller braids need more. Pick your style above for a guide, then check with your braider before you order.'],
  ['What is the difference between knotless braids and box braids?', 'Box braids start with a small knot of extension hair at the root. Knotless braids start with your own hair and feed the extension in gradually, so they lie flatter, feel lighter and put less tension on the scalp. Knotless braids usually take a little longer to do.'],
  ['Which protective style lasts the longest?', 'Knotless braids, box braids, Senegalese twists, Marley twists and faux locs can all last six to eight weeks with good care. Ghana braids and kids\' styles are shorter-term, at two to four weeks.'],
  ['Should I buy my own hair before my appointment?', 'Many braiders and stylists ask you to bring your own hair. Ask them for the brand, length, colour and number of packs before you order, and order in good time for delivery.'],
  ['What colour should I choose?', 'Colour 1 is jet black, 1B is off black and suits most people, 2 is darkest brown and 4 is medium brown. 27, 30 and 613 are honey blonde, auburn and blonde. Ombre packs blend two colours for you.'],
]

const CSS = `.hs{--ink:#1d1b2f;--tl:#0c6f6f;--co:#e4572e;--sd:#f6efe4;--gd:#f2b134;color:var(--ink);font-size:17px;line-height:1.6;background:var(--ink);border-radius:22px;overflow:hidden}
.hs *{box-sizing:border-box}.hs p{margin:0 0 14px;color:var(--ink)}.hs a{color:inherit}.hs ul{margin:0 0 14px;padding-left:20px}.hs li{margin:0 0 6px}
.hs-band{height:14px;background:repeating-linear-gradient(90deg,var(--co) 0 40px,var(--gd) 40px 80px,var(--tl) 80px 120px)}
.hs-hero{text-align:center;padding:34px 18px 22px}.hs-hero.hs-mini{padding:16px 16px 6px}.hs-hero.hs-mini p{color:#fff;font-size:15.5px;font-weight:600;margin:0 auto;max-width:520px}.hs-k{display:inline-block;background:var(--gd);color:var(--ink);font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;border-radius:999px;padding:6px 16px;margin:0 0 14px}
.hs .hs-big{color:#fff;font-size:34px;line-height:1.08;font-weight:800;margin:0 auto 12px;max-width:none}.hs-big span{color:var(--gd)}.hs-hero p{color:#fff;max-width:640px;margin:0 auto}
.hs-in{padding:0 12px 20px}
.hs-rail{display:flex;gap:10px;overflow-x:auto;padding:6px 2px 14px;scroll-snap-type:x proximity;scrollbar-width:none;-webkit-overflow-scrolling:touch}.hs-rail::-webkit-scrollbar{display:none}
.hs-rail a{flex:0 0 92px;display:block;text-align:center;text-decoration:none;color:#fff;font-weight:700;font-size:13.5px;line-height:1.25;scroll-snap-align:start;border-radius:16px;padding:6px 4px 8px}
.hs-rail i{display:block;width:76px;height:76px;margin:0 auto 7px;border-radius:50%;overflow:hidden;background:var(--sd);border:3px solid rgba(255,255,255,.25)}
.hs .hs-rail img{width:100%!important;height:100%!important;max-width:none!important;object-fit:cover;display:block;margin:0!important;border:0!important;border-radius:0!important}
.hs-rail a.hs-pill{flex:0 0 auto;background:rgba(255,255,255,.14);border-radius:999px;padding:11px 18px;font-size:15px;white-space:nowrap}.hs-rail a.hs-pill[aria-current=true]{background:var(--gd);color:var(--ink)}.hs-rail a[aria-current=true]{background:rgba(255,255,255,.12)}.hs-rail a[aria-current=true] i{border-color:var(--gd)}.hs-rail a:focus-visible{outline:3px solid var(--gd)}
.hs-hint{color:#fff!important;opacity:.8;font-size:14px;text-align:center;margin:0 0 6px!important}
.hs-p,.hs-s{background:#fff;border-radius:20px;padding:20px 16px 18px;margin:14px 0 0;border-top:8px solid var(--co);scroll-margin-top:90px}.hs-s{border-top-color:var(--tl)}
.hs-js .hs-p{display:none}.hs-js .hs-p.hs-on{display:block}
.hs-top{display:grid;gap:16px}.hs-img{position:relative;aspect-ratio:9/16;background:var(--sd);border-radius:16px;overflow:hidden;max-width:min(360px,42vh);width:100%;margin:0 auto}
.hs-gw{margin:0 0 6px}.hs-gh p{display:none}.hs-gh{justify-content:flex-end!important;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 10px}.hs-gh p{color:#fff!important;margin:0!important;font-weight:700;font-size:15px}.hs-ga{display:flex;gap:8px;flex:0 0 auto}.hs-ga button{width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:24px;line-height:1;cursor:pointer;padding:0 0 3px}.hs-ga button:hover{background:var(--gd);color:var(--ink)}
.hs-gal{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 9% 16px;scroll-padding:0 9%;margin:0 -12px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.hs-gal::-webkit-scrollbar{display:none}
.hs-gal a{flex:0 0 82%;max-width:380px;position:relative;display:block;aspect-ratio:9/16;border-radius:20px;overflow:hidden;scroll-snap-align:center;background:var(--sd);text-decoration:none}.hs-gal a:hover,.hs-gal a:focus-visible{outline:3px solid var(--gd);outline-offset:2px}
.hs .hs-gal img{position:absolute;top:0;left:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:cover;display:block;margin:0!important;border:0!important;border-radius:0!important}
.hs-gal span{position:absolute;left:0;right:0;bottom:0;padding:40px 12px 12px;background:linear-gradient(transparent,rgba(29,27,47,.88));color:#fff;font-size:13.5px;font-weight:700}.hs-gal span{padding:60px 16px 16px;font-size:15px}.hs-gal b{display:block;font-size:22px;line-height:1.2;margin:0 0 2px}
.hs .hs-img img{position:absolute;top:0;left:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:cover;display:block;margin:0!important;border:0!important;border-radius:0!important}
.hs-img[data-turn]{cursor:ew-resize;touch-action:pan-y}.hs-img img[hidden]{display:none!important}.hs-turn{position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(29,27,47,.78);color:#fff;font-style:normal;font-size:12.5px;font-weight:700;border-radius:999px;padding:4px 12px;white-space:nowrap;pointer-events:none}
.hs-img span{position:absolute;left:10px;bottom:10px;background:rgba(29,27,47,.78);color:#fff;font-size:12px;font-weight:700;border-radius:999px;padding:3px 10px}
.hs h2{font-size:28px;line-height:1.12;font-weight:800;color:var(--ink);margin:0 0 8px}.hs h3{font-size:19px;line-height:1.25;color:var(--tl);margin:22px 0 8px}
.hs-f{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 4px}.hs-f span{background:var(--sd);border-radius:999px;padding:5px 12px;font-size:14px}.hs-f b{font-weight:700}
.hs-len{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}.hs-len button{font:inherit;font-weight:700;font-size:15px;border:2px solid var(--ink);background:#fff;color:var(--ink);border-radius:999px;padding:9px 16px;cursor:pointer}
.hs-len button[aria-pressed=true]{background:var(--ink);color:#fff}.hs-len button:focus-visible,.hs-nav button:focus-visible{outline:3px solid var(--gd);outline-offset:2px}
.hs-need{background:var(--sd);border-left:6px solid var(--gd);border-radius:14px;padding:14px 16px;margin:0 0 6px}.hs-need b{display:block;font-size:22px;line-height:1.25}.hs-need span{display:block;font-size:15px;color:#4a4760;margin-top:4px}
.hs-pr{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x proximity;padding:4px 2px 12px;-webkit-overflow-scrolling:touch}
.hs-pr a{flex:0 0 150px;display:block;text-decoration:none;background:var(--sd);border-radius:16px;padding:8px;scroll-snap-align:start;color:var(--ink)}.hs-pr a:hover{outline:3px solid var(--gd)}
.hs-pr i{display:block;position:relative;aspect-ratio:1/1;background:#fff;border-radius:11px;overflow:hidden}
.hs .hs-pr img{position:absolute;top:0;left:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:contain;display:block;margin:0!important;border:0!important;border-radius:0!important}
.hs-pr em{display:block;font-style:normal;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--co);padding:8px 4px 0}.hs-pr b{display:block;font-size:14.5px;line-height:1.3;padding:2px 4px 0}.hs-pr u{display:block;text-decoration:none;font-size:14px;font-weight:700;color:var(--tl);padding:4px 4px 2px;min-height:22px}
.hs .hs-more{font-weight:700;color:var(--tl)}
.hs-care{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.hs-care a{display:flex;align-items:center;gap:10px;text-decoration:none;background:var(--tl);color:#fff;border-radius:14px;padding:8px;font-weight:700;font-size:14.5px;line-height:1.25}.hs-care a:nth-child(2n){background:var(--ink)}.hs-care a:hover{outline:3px solid var(--gd)}
.hs-care i{flex:0 0 48px;height:48px;border-radius:9px;overflow:hidden;background:#fff}.hs .hs-care img{width:100%!important;height:100%!important;max-width:none!important;object-fit:cover;display:block;margin:0!important;border:0!important;border-radius:0!important}
.hs-nav{display:flex;justify-content:space-between;gap:10px;margin:20px 0 0;border-top:2px dotted #d9d2c3;padding-top:16px}.hs-nav button{font:inherit;font-weight:700;font-size:15px;border:0;background:var(--co);color:#fff;border-radius:999px;padding:11px 18px;cursor:pointer}.hs-nav button:first-child{background:var(--sd);color:var(--ink)}
.hs:not(.hs-js) .hs-nav,.hs:not(.hs-js) .hs-hint{display:none}
.hs-city{display:flex;flex-wrap:wrap;gap:8px}.hs-city a{background:var(--sd);border-radius:999px;padding:8px 14px;text-decoration:none;font-weight:700;font-size:15px}.hs-city a:hover{background:var(--gd)}
.hs-sub{margin:0 0 14px!important;font-size:15px;color:#5d5a70!important}.hs-sm{font-size:14px!important;color:#5d5a70!important}
.hs details{border-top:2px dotted #d9d2c3;padding:14px 0}.hs details:last-of-type{border-bottom:2px dotted #d9d2c3}.hs summary{font-weight:700;font-size:17px;cursor:pointer}.hs details p{margin:10px 0 0}
@media(min-width:700px){.hs-hero:not(.hs-mini){padding:52px 28px 28px}.hs .hs-big{font-size:54px}.hs-in{padding:0 26px 28px}.hs-p,.hs-s{padding:28px 26px 22px;margin-top:20px}.hs h2{font-size:34px}.hs-top{grid-template-columns:300px 1fr;align-items:start}.hs-gal{margin:0;padding:2px 2px 16px;scroll-padding:0}.hs-gal a{flex-basis:240px}.hs-rail a{flex-basis:104px}.hs-pr a{flex-basis:178px}.hs-care{grid-template-columns:repeat(4,1fr)}}
@media(min-width:990px){.hs{width:min(1200px,calc(100vw - 100px));position:relative;left:50%;transform:translateX(-50%)}.hs-rail{flex-wrap:wrap;justify-content:center}.hs .hs-hint{display:none}.hs-top{grid-template-columns:320px 1fr}.hs-gal a{flex-basis:260px}}`

const JS = `(function(){
var root=document.getElementById("hs");if(!root)return;
var panels=[].slice.call(root.querySelectorAll(".hs-p")),tabs=[].slice.call(root.querySelectorAll(".hs-rail a")),rail=root.querySelector(".hs-rail"),cur=-1;
function money(p){return "\\u00a3"+(p/100).toFixed(2)}
function load(panel){
if(panel.getAttribute("data-l"))return;panel.setAttribute("data-l","1");
[].forEach.call(panel.querySelectorAll(".hs-pr a[data-h]"),function(a){
fetch("/products/"+a.getAttribute("data-h")+".js").then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(p){
var src=p.featured_image||"";if(src){if(src.indexOf("//")===0)src="https:"+src;var im=document.createElement("img");im.alt="";im.loading="lazy";im.src=src+(src.indexOf("?")>-1?"&":"?")+"width=360";a.querySelector("i").appendChild(im)}
a.querySelector("u").textContent=p.available?((p.price_varies?"From ":"")+money(p.price_min)):"Out of stock";
if(!p.available)a.parentNode.appendChild(a);
}).catch(function(){if(a.parentNode)a.parentNode.removeChild(a)});
});
}
function pick(i,opts){
i=(i+panels.length)%panels.length;if(i===cur)return;cur=i;
panels.forEach(function(p,n){p.classList.toggle("hs-on",n===i)});
tabs.forEach(function(t,n){t.setAttribute("aria-current",n===i?"true":"false")});
var t=tabs[i];rail.scrollTo({left:t.offsetLeft-(rail.clientWidth-t.offsetWidth)/2,behavior:opts&&opts.quiet?"auto":"smooth"});
load(panels[i]);
if(!(opts&&opts.quiet)){try{history.replaceState(null,"","#"+panels[i].id)}catch(e){}}
if(opts&&opts.top){var y=rail.getBoundingClientRect().top+window.pageYOffset-80;window.scrollTo({top:y,behavior:"smooth"})}
}
function fromHash(){var h=location.hash.replace("#","");for(var n=0;n<panels.length;n++)if(panels[n].id===h)return n;return -1}
root.classList.add("hs-js");
tabs.forEach(function(t,n){t.addEventListener("click",function(e){e.preventDefault();pick(n)})});
[].forEach.call(root.querySelectorAll(".hs-img[data-turn]"),function(box){var imgs={};[].forEach.call(box.querySelectorAll("img[data-v]"),function(i){imgs[i.getAttribute("data-v")]=i});var now="front";
function show(v){if(v===now||!imgs[v])return;now=v;for(var k in imgs)imgs[k].hidden=(k!==v)}
function at(x){var r=box.getBoundingClientRect(),f=(x-r.left)/r.width;show(f<0.36?"left":f>0.64?"right":"front")}
box.addEventListener("pointermove",function(e){at(e.clientX)});box.addEventListener("pointerdown",function(e){at(e.clientX)});
box.addEventListener("pointerleave",function(e){if(e.pointerType==="mouse")show("front")});
box.addEventListener("touchmove",function(e){if(e.touches[0])at(e.touches[0].clientX)},{passive:true});
box.addEventListener("touchend",function(){setTimeout(function(){show("front")},900)},{passive:true})});
var gal=root.querySelector(".hs-gal");
if(gal){[].forEach.call(gal.querySelectorAll("a"),function(a){a.addEventListener("click",function(e){e.preventDefault();var id=a.getAttribute("href").slice(1);for(var n=0;n<panels.length;n++)if(panels[n].id===id){cur=-1;pick(n,{top:true});var p=panels[n];setTimeout(function(){var y=p.getBoundingClientRect().top+window.pageYOffset-80;window.scrollTo({top:y,behavior:"smooth"})},60);break}})});
[].forEach.call(root.querySelectorAll("[data-gs]"),function(b){b.addEventListener("click",function(){gal.scrollBy({left:Number(b.getAttribute("data-gs"))*gal.clientWidth*.8,behavior:"smooth"})})})}
root.addEventListener("click",function(e){
var b=e.target.closest?e.target.closest("button"):null;if(!b)return;
if(b.hasAttribute("data-go")){pick(cur+Number(b.getAttribute("data-go")),{top:true});return}
if(b.hasAttribute("data-p")){var box=b.closest(".hs-p");[].forEach.call(box.querySelectorAll(".hs-len button"),function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});box.querySelector(".hs-need b").textContent=b.getAttribute("data-p")}
});
var sx=0,sy=0,ok=false;
root.addEventListener("touchstart",function(e){var t=e.target;ok=!!(t.closest&&t.closest(".hs-p")&&!t.closest(".hs-pr"));sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
root.addEventListener("touchend",function(e){if(!ok)return;var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*2)pick(cur+(dx<0?1:-1))},{passive:true});
window.addEventListener("hashchange",function(){var n=fromHash();if(n>-1)pick(n,{quiet:true})});
var first=fromHash();pick(first>-1?first:0,{quiet:true});
})();`

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// images: { styleId: full image URL }. A style with no image shows a plain tile.
const FILES = 'https://cdn.shopify.com/s/files/1/0605/2118/5501/files/'
// Style illustrations uploaded to Shopify Files (made in ChatGPT, 9:16). Add a style here when its picture is uploaded.
export const IMAGES = {
  'knotless-braids': FILES + 'knotless-braids-cc-hair-and-beauty.png?v=1791796014', 'box-braids': FILES + 'box-braids-cc-hair-and-beauty.png?v=1791796282',
  'ghana-braids': FILES + 'ghana-braids-cc-hair-and-beauty.png?v=1791796290', 'fulani-braids': FILES + 'fulani-braids-cc-hair-and-beauty.png?v=1791796300',
  'boho-braids': FILES + 'boho-braids-cc-hair-and-beauty.png?v=1791796311', 'french-curl-braids': FILES + 'french-curl-braids-cc-hair-and-beauty.png?v=1791796321',
  'senegalese-twists': FILES + 'senegalese-twists-cc-hair-and-beauty.png?v=1791796330', 'passion-twists': FILES + 'passion-twists-cc-hair-and-beauty.png?v=1791796341',
  'marley-twists': FILES + 'marley-twists-cc-hair-and-beauty.png?v=1791796351', 'faux-locs': FILES + 'faux-locs-cc-hair-and-beauty.png?v=1791796361',
}

// TURN: styles with three views (front, left, right) uploaded to Shopify Files as
// <style>-front-cc-hair-and-beauty.png, <style>-left-cc-hair-and-beauty.png, <style>-right-cc-hair-and-beauty.png.
// Moving the cursor (or a finger) across the picture turns the head. Add a style here when its views are uploaded.
export const TURN = {}

const sized = (u, w) => esc(u + (u.includes('?') ? '&' : '?') + 'width=' + w)
const front = v => typeof v === 'string' ? v : v && v.front

export function buildPage(images) {
  images = Object.assign({}, images || {})
  for (const k of Object.keys(TURN)) images[k] = TURN[k]
  const img = (s, w) => {
    const v = images[s.id]
    if (!v) return ''
    if (typeof v === 'string') return '<img src="' + sized(v, w) + '" alt="' + esc(s.name + ' illustration') + '" loading="lazy">'
    return ['left', 'front', 'right'].map(k => '<img data-v="' + k + '" src="' + sized(v[k], w) + '" alt="' + esc(s.name + ' illustration, ' + (k === 'front' ? 'front' : k + ' side') + ' view') + '"' + (k === 'front' ? '' : ' hidden') + '>').join('') + '<em class="hs-turn">‹ Move to turn ›</em>'
  }
  const rail = STYLES.map(s => '<a href="#' + s.id + '" class="hs-pill">' + esc(s.short) + '</a>').join('')
  const withImg = STYLES.filter(s => images[s.id])
  const gallery = withImg.length ? '<div class="hs-gw"><div class="hs-gh"><p>Swipe the looks, then tap one to see what to buy</p><div class="hs-ga"><button type="button" aria-label="Scroll left" data-gs="-1">‹</button><button type="button" aria-label="Scroll right" data-gs="1">›</button></div></div><div class="hs-gal">'
    + withImg.map((s, i) => '<a href="#' + s.id + '"><img src="' + sized(front(images[s.id]), 760) + '" alt="' + esc(s.name + ' illustration') + '"' + (i > 2 ? ' loading="lazy"' : '') + '><span><b>' + esc(s.name) + '</b>Shop the look ›</span></a>').join('') + '</div></div>' : ''
  const panels = STYLES.map((s, n) => {
    const need = s.fixed
      ? '<div class="hs-need"><b>' + esc(s.fixed) + '</b><span>' + esc(s.note) + '</span></div>'
      : '<div class="hs-len" role="group" aria-label="Length">' + LENGTHS.map((l, i) => '<button type="button" aria-pressed="' + (i === 1 ? 'true' : 'false') + '" data-p="' + esc(s.packs[i]) + '">' + l + '</button>').join('') + '</div>'
        + '<div class="hs-need" aria-live="polite"><b>' + esc(s.packs[1]) + '</b><span>Of ' + esc(s.hairType) + ', for a medium size. ' + esc(s.note) + '</span></div>'
    const hair = s.hair.length
      ? '<h3>Hair to buy</h3><div class="hs-pr">' + s.hair.map(h => '<a href="/products/' + h[0] + '" data-h="' + h[0] + '"><i></i><em>' + esc(h[2]) + '</em><b>' + esc(h[1]) + '</b><u></u></a>').join('') + '</div>'
      : ''
    return '<article class="hs-p" id="' + s.id + '">' + (images[s.id] ? '<div class="hs-top"><div class="hs-img"' + (typeof images[s.id] === 'object' ? ' data-turn' : '') + '>' + img(s, 720) + '<span>Style illustration</span></div><div>' : '<div><div>')
      + '<h2>' + esc(s.name) + '</h2><p>' + esc(s.blurb) + '</p>'
      + '<div class="hs-f"><span><b>Lasts:</b> ' + esc(s.lasts) + '</span><span><b>Time in the chair:</b> ' + esc(s.chair) + '</span></div>'
      + '<h3>How much hair do I need?</h3>' + need
      + '<p class="hs-sm">A guide only. Stylists and brands differ, so check with your braider before you order.</p></div></div>'
      + hair + '<p><a class="hs-more" href="' + s.all[0] + '">' + esc(s.all[1]) + '</a></p>'
      + '<h3>Aftercare for ' + esc(s.name.toLowerCase()) + '</h3><ul>' + s.tips.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>'
      + '<div class="hs-care">' + s.care.map(k => '<a href="/collections/' + CARE[k][1] + '"><i><img src="' + CDN + esc(CARE[k][2]) + '&amp;width=120" alt="" loading="lazy"></i>' + esc(CARE[k][0]) + '</a>').join('') + '</div>'
      + '<div class="hs-nav"><button type="button" data-go="-1">‹ ' + esc(STYLES[(n + STYLES.length - 1) % STYLES.length].short) + '</button><button type="button" data-go="1">' + esc(STYLES[(n + 1) % STYLES.length].short) + ' ›</button></div></article>'
  }).join('')
  return '<style>' + CSS + '</style><div class="hs" id="hs"><div class="hs-band"></div>'
    + '<div class="hs-hero hs-mini"><p>Tap a look to see everything you need, then add it all to your basket.</p></div>'
    + '<div class="hs-in">' + gallery + '<p class="hs-hint">All styles</p><nav class="hs-rail" aria-label="Hairstyles">' + rail + '</nav>'
    + panels
    + '<section class="hs-s"><h2>Find someone to do it</h2><p class="hs-sub">Afro hair salons, braiders, loc specialists and barbers, city by city.</p><div class="hs-city">'
    + CITY_LINKS.map(c => '<a href="/pages/afro-hair-salons-' + c.toLowerCase() + '">' + c + '</a>').join('') + '</div>'
    + '<p class="hs-sm" style="margin:14px 0 0!important">In Leeds? Visit one of our three shops in Chapeltown, Roundhay Road and the city centre.</p></section>'
    + '<section class="hs-s"><h2>Questions</h2>' + FAQ.map(q => '<details><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>').join('')
    + (Object.keys(images).length ? '<p class="hs-sm" style="margin:14px 0 0!important">Style pictures on this page are illustrations, not photos of customers or of any salon\'s work.</p>' : '') + '</section>'
    + '</div><div class="hs-band"></div></div><script>' + JS + '</script><style>' + LOOK_CSS + '</style><script>' + LOOK_JS.replace('__DATA__', JSON.stringify(lookData(images)).replace(/</g, '\\u003c')) + '</script>'
}

export const PAGE = {
  handle: 'afro-hairstyles',
  title: 'Afro Hairstyles',
  seoTitle: 'Afro Hairstyles Guide: How Many Packs of Hair You Need | CC Hair & Beauty',
  seoDescription: 'Knotless braids, box braids, passion twists, faux locs, sew-ins and more. Pick a style to see how many packs of hair to buy, which hair to use and how to look after it.',
}

// ---------- Full-screen "shop the look" view ----------
// Tapping a look opens it full screen with a sheet at the bottom: the hair (brand, colour, number of packs)
// and the tools and aftercare for that style, with live prices, added to the basket in one go.
const X = {
  comb: 'stella-collection-8-rat-tail-styling-comb-2451', gel: 'cantu-protective-styles-by-angela-braiding-twisting-gel',
  edge: 'all-day-got-hold-edge-control-dragon-fruit-100ml', ebrush: 'ebin-new-york-edge-tamer-brush-extreme-hard-type-nylon',
  spray: 'kuza-jamaican-black-castor-oil-conditioning-braid-spray-2-oz', bonnet: 'murry-collection-smooth-and-thick-bonnet',
  mousse: 'studio-2000-system-mousse-extra-hold-volume-long-lasting-hold-300ml', beads: 'magic-collection-16mm-round-hair-beads', beader: 'quick-beader-1561',
  kdet: 'cantu-care-for-kids-conditioning-detangler-6oz-177ml', kspray: 'african-pride-dream-kids-olive-miracle-soothing-moisturising-braid-spray-12oz-u3', kbonnet: 'murry-collection-kids-satin-bonnet',
  wigcap: 'ebin-wonder-lace-bond-hd-wig-cap', glue: 'ebin-new-york-wonder-lace-bond-wig-adhesive-spray-sensitive-14-2oz',
}
const KIT = {
  'knotless-braids': ['comb', 'gel', 'edge', 'ebrush', 'spray', 'bonnet'], 'box-braids': ['comb', 'gel', 'edge', 'ebrush', 'spray', 'bonnet'],
  'ghana-braids': ['comb', 'gel', 'edge', 'ebrush', 'bonnet'], 'fulani-braids': ['comb', 'gel', 'edge', 'beads', 'beader', 'bonnet'],
  'boho-braids': ['comb', 'gel', 'mousse', 'spray', 'bonnet'], 'french-curl-braids': ['comb', 'gel', 'mousse', 'spray', 'bonnet'],
  'senegalese-twists': ['comb', 'gel', 'edge', 'spray', 'bonnet'], 'passion-twists': ['comb', 'mousse', 'spray', 'bonnet'],
  'marley-twists': ['comb', 'gel', 'spray', 'bonnet'], 'faux-locs': ['comb', 'gel', 'spray', 'bonnet'], 'crochet-braids': ['comb', 'mousse', 'bonnet'],
  'sew-in-weave': ['comb', 'bonnet'], 'wig-install': ['wigcap', 'glue', 'edge', 'ebrush'], 'starter-locs': ['spray', 'bonnet'],
  'kids-braids': ['comb', 'kdet', 'kspray', 'beads', 'beader', 'kbonnet'],
}
const mid = t => { const n = String(t || '').match(/\d+/g); return n ? Math.ceil(n.length > 1 ? (Number(n[0]) + Number(n[1])) / 2 : Number(n[0])) : 1 }

export function lookData(images) {
  const out = {}
  for (const s of STYLES) {
    const v = images[s.id]
    out[s.id] = {
      name: s.name, img: v ? sized(front(v), 1100).replace(/&amp;/g, '&') : '', lasts: s.lasts, chair: s.chair,
      lens: s.fixed ? null : s.packs, qty: s.fixed ? [1, 1, 1] : s.packs.map(mid), note: s.note, fixed: s.fixed || '',
      hair: s.hair.map(h => [h[0], h[2] + ' ' + h[1]]), extras: (KIT[s.id] || []).map(k => X[k]), tips: s.tips.slice(0, 3),
    }
  }
  return out
}

export const LOOK_CSS = `.lk{position:fixed;inset:0;z-index:2147482000;background:#1d1b2f;display:flex;flex-direction:column;color:#1d1b2f;font-size:16px;line-height:1.45}
.lk *{box-sizing:border-box}.lk[hidden]{display:none!important}
.lk-pic{position:relative;flex:1 1 auto;min-height:0;background:#f6efe4}
.lk-pic img{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:cover;object-position:center top;display:block;margin:0!important;border:0!important}
.lk-noimg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;color:#1d1b2f;padding:20px;text-align:center}
.lk-x{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:12px;width:46px;height:46px;border-radius:50%;border:0;background:rgba(29,27,47,.8);color:#fff;font-size:28px;line-height:1;cursor:pointer;z-index:2}
.lk-tag{position:absolute;left:12px;top:calc(18px + env(safe-area-inset-top,0px));background:rgba(29,27,47,.8);color:#fff;font-size:12px;font-weight:700;border-radius:999px;padding:4px 11px;z-index:2}
.lk-sheet{position:absolute;left:0;right:0;bottom:0;max-height:46%;background:#fff;border-radius:22px 22px 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;transition:max-height .28s ease;z-index:3}
.lk-sheet.lk-up{max-height:88%}
.lk-grab{flex:0 0 auto;border:0;background:none;padding:10px 16px 4px;cursor:pointer;width:100%;text-align:center}.lk-grab i{display:block;width:44px;height:5px;border-radius:9px;background:#d9d2c3;margin:0 auto}
.lk-body{flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 16px 12px;overscroll-behavior:contain}
.lk-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px}.lk-h b{font-size:23px;font-weight:800;line-height:1.15}.lk-h span{font-size:13px;color:#5d5a70;white-space:nowrap}
.lk-sub{font-size:14px;color:#5d5a70;margin:4px 0 10px}
.lk-len{display:flex;gap:8px;margin:0 0 10px}.lk-len button{flex:1;font:inherit;font-weight:700;font-size:14.5px;border:2px solid #1d1b2f;background:#fff;color:#1d1b2f;border-radius:999px;padding:9px 6px;cursor:pointer;min-height:44px}.lk-len button[aria-pressed=true]{background:#1d1b2f;color:#fff}
.lk-row{display:grid;grid-template-columns:auto 56px minmax(0,1fr);gap:10px;align-items:center;padding:10px 0;border-top:1px solid #efe6d8}
.lk-row input[type=checkbox]{width:22px;height:22px;accent-color:#0c6f6f;margin:0}
.lk-th{width:56px;height:56px;border-radius:10px;background:#f6efe4;overflow:hidden}.lk-th img{width:100%!important;height:100%!important;object-fit:contain;display:block;margin:0!important;max-width:none!important}
.lk-n{font-weight:700;font-size:14.5px;line-height:1.3}.lk-p{font-size:14px;color:#0c6f6f;font-weight:700}
.lk-ctl{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;align-items:center}
.lk-ctl select{font:inherit;font-size:14px;max-width:100%;padding:7px 8px;border:1.5px solid #d9d2c3;border-radius:9px;background:#fff;color:#1d1b2f;min-height:38px}
.lk-q{display:inline-flex;align-items:center;border:1.5px solid #d9d2c3;border-radius:9px;overflow:hidden}.lk-q button{width:36px;height:36px;border:0;background:#f6efe4;font-size:19px;cursor:pointer;color:#1d1b2f}.lk-q span{min-width:30px;text-align:center;font-weight:700}
.lk-tips{margin:10px 0 0;padding:12px 14px;background:#f6efe4;border-radius:14px;font-size:14px}.lk-tips b{display:block;margin-bottom:4px}.lk-tips ul{margin:0;padding-left:18px}
.lk-foot{flex:0 0 auto;padding:10px 16px calc(12px + env(safe-area-inset-bottom,0px));border-top:1px solid #efe6d8;background:#fff}
.lk-add{width:100%;border:0;border-radius:999px;background:#e4572e;color:#fff;font:inherit;font-weight:800;font-size:17px;padding:15px;cursor:pointer;min-height:52px}.lk-add:disabled{opacity:.6}
.lk-msg{font-size:14px;text-align:center;margin:8px 0 0;font-weight:700}.lk-msg a{color:#0c6f6f}
.lk button:focus-visible,.lk select:focus-visible{outline:3px solid #f2b134;outline-offset:2px}
@media(min-width:900px){.lk{flex-direction:row;background:rgba(29,27,47,.92);padding:24px}.lk-pic{flex:0 0 min(46vw,560px);border-radius:20px 0 0 20px;overflow:hidden}.lk-pic img{object-fit:contain}.lk-sheet,.lk-sheet.lk-up{position:relative;max-height:none;flex:1 1 auto;max-width:560px;border-radius:0 20px 20px 0}.lk-grab{display:none}}`

export const LOOK_JS = `(function(){
var DATA=__DATA__,root=document.getElementById("hs");if(!root)return;
var cache={},lk,cur,lastFocus;
function money(p){return "\\u00a3"+(p/100).toFixed(2)}
function prod(h){if(!cache[h])cache[h]=fetch("/products/"+h+".js").then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return null});return cache[h]}
function el(t,c,txt){var e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e}
function build(){lk=el("div","lk");lk.hidden=true;lk.setAttribute("role","dialog");lk.setAttribute("aria-modal","true");
lk.innerHTML='<div class="lk-pic"></div><button type="button" class="lk-x" aria-label="Close">\\u00d7</button><div class="lk-sheet"><button type="button" class="lk-grab" aria-label="Show more"><i></i></button><div class="lk-body"></div><div class="lk-foot"><button type="button" class="lk-add">Add to basket</button><p class="lk-msg" role="status"></p></div></div>';
document.body.appendChild(lk);
lk.querySelector(".lk-x").addEventListener("click",function(){history.state&&history.state.lk?history.back():close()});
lk.querySelector(".lk-grab").addEventListener("click",function(){lk.querySelector(".lk-sheet").classList.toggle("lk-up")});
lk.querySelector(".lk-body").addEventListener("scroll",function(){lk.querySelector(".lk-sheet").classList.add("lk-up")},{passive:true});
lk.querySelector(".lk-add").addEventListener("click",add);
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!lk.hidden)lk.querySelector(".lk-x").click()});
window.addEventListener("popstate",function(){if(!lk.hidden)close()})}
function close(){lk.hidden=true;document.documentElement.style.overflow="";if(lastFocus&&lastFocus.focus)lastFocus.focus()}
function open(id,from){var d=DATA[id];if(!d)return;if(!lk)build();lastFocus=from;cur={id:id,d:d,len:1,rows:[]};
var pic=lk.querySelector(".lk-pic");pic.textContent="";if(d.img){var im=el("img");im.src=d.img;im.alt=d.name+" illustration";pic.appendChild(im);pic.appendChild(el("span","lk-tag","Style illustration"))}else pic.appendChild(el("div","lk-noimg",d.name));
lk.querySelector(".lk-sheet").classList.remove("lk-up");lk.querySelector(".lk-msg").textContent="";
render();lk.hidden=false;document.documentElement.style.overflow="hidden";try{history.pushState({lk:1},"","#"+id)}catch(e){}lk.querySelector(".lk-x").focus()}
function render(){var d=cur.d,b=lk.querySelector(".lk-body");b.textContent="";b.scrollTop=0;
var h=el("div","lk-h");h.appendChild(el("b",null,d.name));h.appendChild(el("span",null,"Lasts "+d.lasts));b.appendChild(h);
b.appendChild(el("p","lk-sub",d.fixed?d.fixed:"Pick your length. We have filled in the usual number of packs."));
if(d.lens){var L=el("div","lk-len");["Shoulder","Mid-back","Waist"].forEach(function(t,i){var x=el("button",null,t);x.type="button";x.setAttribute("aria-pressed",i===cur.len?"true":"false");x.addEventListener("click",function(){cur.len=i;[].forEach.call(L.children,function(c,j){c.setAttribute("aria-pressed",j===i?"true":"false")});if(cur.hair){cur.hair.qty=d.qty[i];cur.hair.qEl.textContent=cur.hair.qty;total()}});L.appendChild(x)});b.appendChild(L)}
cur.rows=[];cur.hair=null;
if(d.hair.length)row(b,{handles:d.hair,qty:d.qty[cur.len],hair:true});
d.extras.forEach(function(x){row(b,{handles:[[x,""]],qty:1})});
var t=el("div","lk-tips");t.appendChild(el("b",null,"Aftercare"));var ul=el("ul");d.tips.forEach(function(x){ul.appendChild(el("li",null,x))});t.appendChild(ul);b.appendChild(t);
var g=el("p","lk-sub",d.note+" A guide only: check with your stylist before you order.");g.style.marginTop="10px";b.appendChild(g);
var a=el("a",null,"See the full guide for "+d.name.toLowerCase());a.href="#"+cur.id;a.style.cssText="display:block;font-weight:700;color:#0c6f6f;margin:0 0 6px";a.addEventListener("click",function(e){e.preventDefault();var id=cur.id;close();try{history.replaceState(null,"","#"+id)}catch(x){}var p=document.getElementById(id);if(p){window.dispatchEvent(new HashChangeEvent("hashchange"));setTimeout(function(){p.scrollIntoView({behavior:"smooth"})},60)}});b.appendChild(a);
total()}
function row(b,o){var r=el("div","lk-row"),cb=el("input");cb.type="checkbox";cb.checked=true;cb.setAttribute("aria-label","Include");var th=el("div","lk-th"),info=el("div"),n=el("div","lk-n",o.handles[0][1]||"Loading\\u2026"),p=el("div","lk-p",""),ctl=el("div","lk-ctl");
info.appendChild(n);info.appendChild(p);info.appendChild(ctl);r.appendChild(cb);r.appendChild(th);r.appendChild(info);b.appendChild(r);
var it={on:true,qty:o.qty,vid:null,price:0,ok:false};cur.rows.push(it);if(o.hair)cur.hair=it;
cb.addEventListener("change",function(){it.on=cb.checked;total()});
var q=el("span","lk-q"),m=el("button",null,"\\u2212"),qv=el("span",null,String(it.qty)),pl=el("button",null,"+");m.type=pl.type="button";m.setAttribute("aria-label","Fewer");pl.setAttribute("aria-label","More");q.appendChild(m);q.appendChild(qv);q.appendChild(pl);it.qEl=qv;
m.addEventListener("click",function(){if(it.qty>1){it.qty--;qv.textContent=it.qty;total()}});pl.addEventListener("click",function(){if(it.qty<20){it.qty++;qv.textContent=it.qty;total()}});
var brand=null;if(o.handles.length>1){brand=el("select");brand.setAttribute("aria-label","Brand");o.handles.forEach(function(h,i){var op=el("option",null,h[1]);op.value=i;brand.appendChild(op)});ctl.appendChild(brand)}
var vs=el("select");vs.setAttribute("aria-label","Colour or size");
function load(i){var hd=o.handles[i][0];n.textContent=o.handles[i][1]||"Loading\\u2026";p.textContent="";it.ok=false;total();
prod(hd).then(function(pr){if(!pr||!pr.variants){n.textContent=(o.handles[i][1]||"This item")+" (not available)";cb.checked=false;it.on=false;total();return}
n.textContent=pr.title;th.textContent="";if(pr.featured_image){var im=el("img");var s=pr.featured_image;if(s.indexOf("//")===0)s="https:"+s;im.src=s+(s.indexOf("?")>-1?"&":"?")+"width=120";im.alt="";th.appendChild(im)}
vs.textContent="";var first=null;pr.variants.forEach(function(v){var op=el("option",null,(v.title==="Default Title"?"One size":v.title)+(v.available?"":" (out of stock)"));op.value=v.id;op.disabled=!v.available;op.dataset.price=v.price;vs.appendChild(op);if(!first&&v.available)first=v});
if(pr.variants.length>1){if(!vs.parentNode)ctl.appendChild(vs)}else if(vs.parentNode)vs.parentNode.removeChild(vs);
if(first){vs.value=String(first.id);it.vid=first.id;it.price=first.price;it.ok=true;if(!it.touched){cb.checked=true;it.on=true}}else{it.ok=false;cb.checked=false;it.on=false;n.textContent=pr.title+" (out of stock)"}
p.textContent=it.ok?money(it.price)+" each":"";total()})}
vs.addEventListener("change",function(){var op=vs.options[vs.selectedIndex];it.vid=Number(vs.value);it.price=Number(op.dataset.price);p.textContent=money(it.price)+" each";total()});
cb.addEventListener("change",function(){it.touched=true});
if(brand)brand.addEventListener("change",function(){load(Number(brand.value))});
ctl.appendChild(q);load(0)}
function total(){var s=0,c=0;cur.rows.forEach(function(r){if(r.on&&r.ok){s+=r.price*r.qty;c+=r.qty}});var a=lk.querySelector(".lk-add");a.disabled=!c;a.textContent=c?"Add "+c+" item"+(c>1?"s":"")+" to basket \\u00b7 "+money(s):"Choose items to add"}
function add(){var items=cur.rows.filter(function(r){return r.on&&r.ok&&r.vid}).map(function(r){return{id:r.vid,quantity:r.qty}});if(!items.length)return;
var a=lk.querySelector(".lk-add"),m=lk.querySelector(".lk-msg");a.disabled=true;a.textContent="Adding\\u2026";m.textContent="";
fetch("/cart/add.js",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({items:items})}).then(function(r){return r.json().then(function(j){if(!r.ok)throw j;return j})}).then(function(){a.textContent="Added to your basket";m.innerHTML='<a href="/cart">View basket and check out \\u203a</a>';
fetch("/cart.js").then(function(r){return r.json()}).then(function(c){[].forEach.call(document.querySelectorAll(".cart-count-bubble span[aria-hidden],#cart-icon-bubble .cart-count-bubble span"),function(x){x.textContent=c.item_count})}).catch(function(){})})
.catch(function(e){a.disabled=false;total();m.textContent=(e&&e.description)?e.description:"Some items could not be added. Check stock and try again."})}
[].forEach.call(root.querySelectorAll(".hs-gal a, .hs-rail a"),function(a){a.addEventListener("click",function(e){var id=a.getAttribute("href").slice(1);if(!DATA[id])return;e.preventDefault();e.stopImmediatePropagation();open(id,a)},true)});
})();`
