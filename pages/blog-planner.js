import Head from 'next/head'
import Shell from '../components/Shell'
import { useState, useEffect } from 'react'

const C = {
  bg:'#f6f8fa', surface:'#ffffff', surface2:'#f6f8fa', border:'#d0d7de',
  text:'#1f2328', text2:'#656d76', text3:'#9ea8b3',
  green:'#1f883d', amber:'#bf8700', red:'#cf222e',
  blue:'#0969da', accent:'#0969da', accent2:'#0969da', teal:'#1f883d',
}

const CAT_META = {
  local:{ label:'Local SEO', color:C.green, blog:'Leeds Hair Shop Guides', handle:'leeds' },
  ads:  { label:'Paid Ads SEO', color:C.red, blog:'Product Reviews', handle:'product-reviews' },
  org:  { label:'Organic SEO', color:C.blue, blog:'Hair Care Guides', handle:'hair-care' },
}

const POSTS = [
  {day:1,cat:'local',title:'Where to Buy Braiding Hair in Leeds 2026',seoTitle:'Where to Buy Braiding Hair in Leeds 2026 | CC Hair and Beauty',metaDesc:'Buy braiding hair in Leeds at CC Hair and Beauty. Xpression, Freetress, Janet Collection and 1,000+ styles across Chapeltown LS7, Roundhay LS8 and City Centre.',slug:'braiding-hair-leeds-2026',keywords:['braiding hair leeds','buy braiding hair leeds','crochet hair leeds','xpression braiding hair leeds'],data:'SC pos #1.8 · 180 clicks/mo'},
  {day:1,cat:'ads',title:'Bsset Curl Cream Review — Best Defining Curl Cream UK 2026',seoTitle:'Bsset Curl Cream Review UK 2026 | CC Hair and Beauty',metaDesc:'Our honest Bsset Curl Cream review — the best defining curl cream for natural hair in the UK. Available online and in store at CC Hair and Beauty Leeds.',slug:'bsset-curl-cream-review',keywords:['bsset curl cream review','bsset curl cream uk','best curl cream natural hair uk'],data:'Ads: 24 conv · £1.23 CPA · 11x ROAS'},
  {day:1,cat:'org',title:'Best Relaxer for Natural Hair UK 2026 — ORS vs Dark & Lovely vs TCB',seoTitle:'Best Relaxer for Natural Hair UK 2026 | ORS vs Dark & Lovely vs TCB',metaDesc:'Which is the best relaxer for natural hair in the UK? We compare ORS, Dark & Lovely and TCB on strength, damage and results at CC Hair and Beauty.',slug:'best-relaxer-natural-hair-uk-2026',keywords:['best relaxer natural hair uk','ors relaxer uk','dark and lovely relaxer uk','best relaxer uk 2026'],data:'SC: 60k+ impressions · biggest quick win'},
  {day:2,cat:'local',title:'Wigs for Cancer Patients Leeds — Compassionate Guide to Medical Wigs',seoTitle:'Wigs for Cancer Patients Leeds — Medical Wigs | CC Hair and Beauty',metaDesc:'CC Hair and Beauty offers a compassionate wig fitting service in Leeds for cancer patients and those experiencing hair loss across Chapeltown, Roundhay and City Centre.',slug:'wigs-cancer-patients-leeds',keywords:['wigs for cancer patients leeds','medical wigs leeds','hair loss wigs leeds','wig fitting leeds'],data:'Zero competition · high buying intent'},
  {day:2,cat:'ads',title:'Edge Booster vs Style Factor — Which Edge Control Is Best UK?',seoTitle:'Edge Booster vs Style Factor — Best Edge Control UK 2026',metaDesc:'Edge Booster vs Style Factor Edge Booster — we compare hold, ingredients, shine and value. Both available at CC Hair and Beauty Leeds.',slug:'edge-booster-vs-style-factor',keywords:['edge booster vs style factor','best edge control uk','edge booster review uk'],data:'Ads: 9 conv £2.34 CPA · 6 conv £1.05 CPA'},
  {day:2,cat:'org',title:'Cherish French Curl Braiding Hair Review 2026',seoTitle:'Cherish French Curl Braiding Hair Review UK 2026 | CC Hair and Beauty',metaDesc:'Full Cherish French Curl braiding hair review — texture, curl pattern, longevity and styling tips. In stock at CC Hair and Beauty Leeds.',slug:'cherish-french-curl-review',keywords:['cherish french curl','cherish french curl braiding hair','french curl crochet hair uk'],data:'SC pos #8.7 · 417 impressions · already ranking'},
  {day:3,cat:'local',title:'Hair Shop Leeds — Chapeltown, Roundhay & City Centre Guide',seoTitle:'Hair Shop Leeds | CC Hair and Beauty — 3 Branches, 23,000+ Products',metaDesc:"CC Hair and Beauty is Leeds' largest afro hair and beauty retailer. 3 branches in Chapeltown LS7, Roundhay LS8 and City Centre with 23,000+ products.",slug:'hair-shop-leeds',keywords:['hair shop leeds','afro hair shop leeds','hair and beauty leeds','cc hair and beauty leeds'],data:'SC pos #2.7 · 10 clicks/mo'},
  {day:3,cat:'ads',title:'Designer Touch Relaxer Review — Does It Work on Natural Hair?',seoTitle:'Designer Touch Relaxer Review UK 2026 | CC Hair and Beauty',metaDesc:'Our honest Designer Touch Relaxer review — performance on natural hair, application tips and where to buy in the UK at CC Hair and Beauty.',slug:'designer-touch-relaxer-review',keywords:['designer touch relaxer review','designer touch relaxer uk','best relaxer natural hair uk'],data:'Ads: 5.9 conv · £0.76 CPA · 47x ROAS'},
  {day:3,cat:'org',title:'Mielle Rosemary Oil Review — Does It Actually Work for Hair Growth?',seoTitle:'Mielle Rosemary Oil Review UK 2026 — Does It Work? | CC Hair and Beauty',metaDesc:'Does Mielle Rosemary Oil really work for hair growth? Our honest review covers ingredients, how to use and real results. Buy at CC Hair and Beauty.',slug:'mielle-rosemary-oil-review',keywords:['mielle rosemary oil review','mielle rosemary oil uk','rosemary oil hair growth uk'],data:'Trending 2026 · high national search volume'},
  {day:4,cat:'local',title:'Lace Front Wigs Leeds — Try Before You Buy at CC Hair and Beauty',seoTitle:'Lace Front Wigs Leeds | Try In Store | CC Hair and Beauty',metaDesc:'Shop lace front wigs in Leeds at CC Hair and Beauty. Try before you buy at Chapeltown LS7, Roundhay LS8 or City Centre. Human hair and synthetic lace fronts.',slug:'lace-front-wigs-leeds',keywords:['lace front wigs leeds','lace wigs leeds','buy lace front wigs leeds'],data:'Keyword gap — no local competitor ranks for this'},
  {day:4,cat:'ads',title:'Caro Light Soap UK — Where to Buy & How to Use',seoTitle:'Caro Light Soap UK — Where to Buy & How to Use 2026',metaDesc:'Caro Light Soap available at CC Hair and Beauty Leeds. Full guide on how to use for best results, price and UK delivery options.',slug:'caro-light-soap-uk',keywords:['caro light soap uk','where to buy caro light uk','caro light soap how to use'],data:'Ads: 11 conv · £0.31 CPA · 40x ROAS'},
  {day:4,cat:'org',title:'Cantu vs ORS — Which Natural Hair Products Are Best for UK Hair?',seoTitle:'Cantu vs ORS Natural Hair Products UK 2026 | CC Hair and Beauty',metaDesc:'Cantu vs ORS — which natural hair brand is better for UK hair? We compare shampoos, conditioners, leave-ins and styling products at CC Hair and Beauty.',slug:'cantu-vs-ors-natural-hair-uk',keywords:['cantu vs ors','cantu natural hair uk','ors natural hair uk','best natural hair products uk 2026'],data:'Both brands convert in Ads · national search volume'},
  {day:5,cat:'local',title:"Afro Hair Shop Leeds — Leeds' Largest with 23,000+ Products",seoTitle:"Afro Hair Shop Leeds | 23,000+ Products | CC Hair and Beauty",metaDesc:"CC Hair and Beauty is Leeds' largest afro hair shop with 23,000+ products — human hair, wigs, braiding hair, relaxers and more across 3 Leeds branches.",slug:'afro-hair-shop-leeds',keywords:['afro hair shop leeds','afro caribbean hair shop leeds','afro hair products leeds','black hair shop leeds'],data:'High volume local keyword'},
  {day:5,cat:'ads',title:'American Crew Superglue Review — Full UK Review 2026',seoTitle:'American Crew Superglue Review UK 2026 | CC Hair and Beauty',metaDesc:'Full American Crew Superglue review — the best strong hold styling product for men in the UK. Available at CC Hair and Beauty with next day delivery.',slug:'american-crew-superglue-review',keywords:['american crew superglue review','american crew superglue uk','best mens hair styling uk'],data:'Ads: 9 conv · £0.23 CPA · 82x ROAS'},
  {day:5,cat:'org',title:'ORS Olive Oil Relaxer Review — Best No-Lye Relaxer UK?',seoTitle:'ORS Olive Oil Relaxer Review UK 2026 | CC Hair and Beauty',metaDesc:'Our ORS Olive Oil Relaxer review — strength levels, damage, results on natural hair and how it compares to competitors. Buy ORS at CC Hair and Beauty.',slug:'ors-olive-oil-relaxer-review',keywords:['ors olive oil relaxer review','ors relaxer uk','best no lye relaxer uk','ors hair products uk'],data:'ORS converts in Ads · SC relaxer 60k+ impressions'},
  {day:6,cat:'local',title:'Human Hair Extensions Leeds — Buying Guide & Where to Shop',seoTitle:'Human Hair Extensions Leeds | In Store & Online | CC Hair and Beauty',metaDesc:'Buy human hair extensions in Leeds at CC Hair and Beauty. Brazilian, Peruvian and Indian remy hair in store at Chapeltown, Roundhay and City Centre.',slug:'human-hair-extensions-leeds',keywords:['human hair extensions leeds','remy hair extensions leeds','buy hair extensions leeds'],data:'High value keyword · high buyer intent'},
  {day:6,cat:'ads',title:'Caro White Soap UK — Everything You Need to Know',seoTitle:'Caro White Soap UK — Guide & Where to Buy | CC Hair and Beauty',metaDesc:'Caro White Soap available at CC Hair and Beauty Leeds. Complete guide on ingredients, how to use and where to buy in the UK with fast delivery.',slug:'caro-white-soap-uk',keywords:['caro white soap uk','where to buy caro white uk','caro white soap review'],data:'Ads: 9 conv · £0.45 CPA · 25x ROAS'},
  {day:6,cat:'org',title:'Dark & Lovely Cholesterol Conditioning Treatment Review',seoTitle:'Dark & Lovely Cholesterol Review UK 2026 | CC Hair and Beauty',metaDesc:'Full Dark & Lovely Cholesterol Conditioning Treatment review — how it works on natural and relaxed hair, how to use and where to buy in the UK.',slug:'dark-and-lovely-cholesterol-review',keywords:['dark and lovely cholesterol','dark and lovely cholesterol review','hair cholesterol treatment uk'],data:'Ads: 8 conv · £0.29 CPA · 52x ROAS'},
  {day:7,cat:'local',title:'Synthetic Wigs Leeds — Try In Store at CC Hair and Beauty',seoTitle:'Synthetic Wigs Leeds | Try Before You Buy | CC Hair and Beauty',metaDesc:'Browse synthetic wigs in Leeds at CC Hair and Beauty. Hundreds of styles across Chapeltown LS7, Roundhay LS8 and City Centre Leeds. All budgets catered for.',slug:'synthetic-wigs-leeds',keywords:['synthetic wigs leeds','cheap wigs leeds','affordable wigs leeds','wig shop leeds'],data:'High search volume · covers budget buyers'},
  {day:7,cat:'ads',title:'Kojic Acid Cream UK — What It Does & Where to Buy',seoTitle:'Kojic Acid Cream UK Review & Guide 2026 | CC Hair and Beauty',metaDesc:'Kojic Acid Cream available at CC Hair and Beauty Leeds. Full guide on how kojic acid works, how to use safely and the best kojic acid creams in the UK.',slug:'kojic-acid-cream-uk',keywords:['kojic acid cream uk','where to buy kojic acid cream uk','best kojic acid cream uk'],data:'Ads: 8 conv · £0.57 CPA · 32x ROAS'},
  {day:7,cat:'org',title:'Aztec Clay Mask for Natural Hair — Does It Really Work?',seoTitle:'Aztec Clay Mask Natural Hair Review UK 2026 | CC Hair and Beauty',metaDesc:'Does the Aztec Clay Mask work on natural hair? Our honest review covers how to use it, results for 4C hair and where to buy in the UK.',slug:'aztec-clay-mask-natural-hair',keywords:['aztec clay mask natural hair','aztec clay mask 4c hair','clay mask afro hair uk'],data:'Ads: 8 conv · £0.96 CPA · 12x ROAS'},
  {day:8,cat:'local',title:'Click & Collect Leeds — Order Online, Pick Up at CC Hair and Beauty',seoTitle:'Click & Collect Hair & Beauty Leeds | CC Hair and Beauty',metaDesc:'Order online and collect same day at CC Hair and Beauty Leeds. Available at Chapeltown LS7, Roundhay LS8 and City Centre. Free over £30.',slug:'click-collect-leeds-hair',keywords:['click collect hair products leeds','same day collection hair leeds','cc hair and beauty click collect'],data:'Service USP · differentiates from online-only'},
  {day:8,cat:'ads',title:'Bsset Texture Powder Review — Best Volumising Powder for Natural Hair',seoTitle:'Bsset Texture Powder Review UK 2026 | CC Hair and Beauty',metaDesc:'Honest Bsset Texture Powder review — volume, hold, finish and how to use on natural hair. Available at CC Hair and Beauty Leeds.',slug:'bsset-texture-powder-review',keywords:['bsset texture powder review','bsset texture powder uk','best hair texture powder uk'],data:'Ads: 6 conv · £0.29 CPA · 32x ROAS'},
  {day:8,cat:'org',title:'Best Curl Cream for Natural Hair UK 2026 — Top 10 Reviewed',seoTitle:'Best Curl Cream Natural Hair UK 2026 — Top 10 | CC Hair and Beauty',metaDesc:'The best curl creams for natural hair in the UK 2026 — we review and rank the top 10 by hold, moisture, definition and price at CC Hair and Beauty.',slug:'best-curl-cream-natural-hair-uk-2026',keywords:['best curl cream natural hair uk','best curl cream 4c hair uk','curl cream review uk 2026'],data:'High volume category page'},
  {day:9,cat:'local',title:'Chapeltown Hair Shop — CC Hair and Beauty LS7 Complete Guide',seoTitle:'Chapeltown Hair Shop LS7 | CC Hair and Beauty Leeds',metaDesc:"CC Hair and Beauty Chapeltown on Chapeltown Road LS7 — Leeds' original afro hair shop. Wigs, extensions, braiding hair, relaxers and beauty in stock.",slug:'chapeltown-hair-shop-ls7',keywords:['chapeltown hair shop','cc hair chapeltown','hair shop chapeltown road','ls7 hair shop'],data:'Branch-specific SEO · Chapeltown local search'},
  {day:9,cat:'ads',title:'White Express Lotion Review — Best Brightening Body Lotion UK',seoTitle:'White Express Lotion Review UK 2026 | CC Hair and Beauty',metaDesc:'White Express Brightening Body Lotion review — results, ingredients and how to use. Available at CC Hair and Beauty Leeds.',slug:'white-express-lotion-review',keywords:['white express lotion review','white express brightening lotion uk','brightening body lotion uk'],data:'Ads: 7.25 conv · £0.71 CPA · 27x ROAS'},
  {day:9,cat:'org',title:'Wella T28 Toner Review — Best Silver Toner for Blonde Hair UK',seoTitle:'Wella T28 Toner Review UK 2026 | CC Hair and Beauty',metaDesc:'Wella T28 Silver Toner review — how it works on blonde hair, application tips and where to buy in the UK at CC Hair and Beauty.',slug:'wella-t28-toner-review',keywords:['wella t28 toner review','wella t28 uk','best silver toner blonde hair uk'],data:'Ads: 5.5 conv · £0.16 CPA · 127x ROAS'},
  {day:10,cat:'local',title:'Roundhay Hair & Beauty Shop — CC Hair and Beauty LS8 Guide',seoTitle:'Roundhay Hair Shop LS8 | CC Hair and Beauty Leeds',metaDesc:'CC Hair and Beauty Roundhay on Roundhay Road LS8 — full product range, opening hours and what to expect at our Roundhay branch.',slug:'roundhay-hair-shop-ls8',keywords:['roundhay hair shop','cc hair roundhay','hair shop roundhay road','ls8 hair shop'],data:'Branch-specific SEO · Roundhay LS8'},
  {day:10,cat:'ads',title:'Filthy Muk Styling Paste Review — Best Hair Paste for Men UK',seoTitle:'Filthy Muk Styling Paste Review UK 2026 | CC Hair and Beauty',metaDesc:'Honest Filthy Muk Styling Paste review — hold, texture, finish and how it compares. Available at CC Hair and Beauty with UK delivery.',slug:'filthy-muk-styling-paste-review',keywords:['filthy muk styling paste review','filthy muk hair paste uk','best hair paste men uk'],data:'Ads: 6 conv · £0.18 CPA · 98x ROAS'},
  {day:10,cat:'org',title:'Blue Magic Pressing Oil — Does It Work on Natural Hair?',seoTitle:'Blue Magic Pressing Oil Review UK 2026 | CC Hair and Beauty',metaDesc:'Blue Magic Pressing Oil review — how to use on natural and relaxed hair for a smooth press. Available at CC Hair and Beauty Leeds.',slug:'blue-magic-pressing-oil-review',keywords:['blue magic pressing oil','blue magic pressing oil uk','best pressing oil natural hair uk'],data:'Ads: 5 conv · £0.50 CPA · 48x ROAS'},
  {day:11,cat:'local',title:'Leeds City Centre Hair Shop — CC Hair and Beauty New York Street',seoTitle:'Leeds City Centre Hair Shop | CC Hair and Beauty New York Street',metaDesc:'CC Hair and Beauty City Centre on New York Street, Leeds — central location for wigs, extensions, hair dye and afro hair products near Leeds train station.',slug:'leeds-city-centre-hair-shop',keywords:['leeds city centre hair shop','hair shop leeds city centre','new york street hair leeds'],data:'Branch-specific SEO · city centre footfall'},
  {day:11,cat:'ads',title:'Dr Miracles Leave In Conditioner Review UK 2026',seoTitle:'Dr Miracles Leave In Conditioner Review UK | CC Hair and Beauty',metaDesc:'Full Dr Miracles Leave In Conditioner review — moisture, detangling and results on natural and relaxed hair. Available at CC Hair and Beauty Leeds.',slug:'dr-miracles-leave-in-conditioner-review',keywords:['dr miracles leave in conditioner review','dr miracles uk','best leave in conditioner natural hair uk'],data:'Ads: 6 conv · £0.14 CPA · 134x ROAS'},
  {day:11,cat:'org',title:'Macadamia Healing Oil Treatment Review UK',seoTitle:'Macadamia Healing Oil Treatment Review UK 2026 | CC Hair and Beauty',metaDesc:'Macadamia Healing Oil Treatment review — how it works on damaged and dry hair, application tips and results. Available at CC Hair and Beauty.',slug:'macadamia-healing-oil-treatment-review',keywords:['macadamia healing oil treatment','macadamia oil hair treatment uk','best hair oil treatment uk'],data:'Ads: 5.61 conv · £0.32 CPA · 115x ROAS'},
  {day:12,cat:'local',title:"Hair Dye Leeds — Where to Buy ORS, Dark & Lovely and L'Oréal",seoTitle:"Hair Dye Leeds | ORS, Dark & Lovely, L'Oréal | CC Hair and Beauty",metaDesc:'Buy hair dye in Leeds at CC Hair and Beauty. Dark & Lovely, ORS, L\'Oréal and 500+ hair colours across Chapeltown, Roundhay and City Centre.',slug:'hair-dye-leeds',keywords:['hair dye leeds','buy hair dye leeds','dark and lovely leeds','hair colour shop leeds'],data:'High volume product category · local intent'},
  {day:12,cat:'ads',title:'Matrix Matte Definer Review — Best Matte Styling Product UK',seoTitle:'Matrix Matte Definer Review UK 2026 | CC Hair and Beauty',metaDesc:'Matrix Matte Definer review — hold, matte finish and how to use. One of our best-converting products. Available at CC Hair and Beauty.',slug:'matrix-matte-definer-review',keywords:['matrix matte definer review','matrix matte definer uk','best matte hair product uk'],data:'Ads: 5 conv · £0.03 CPA · 1000x ROAS'},
  {day:12,cat:'org',title:'Best Edge Control UK 2026 — Top 8 Products Ranked & Reviewed',seoTitle:'Best Edge Control UK 2026 — Top 8 Ranked | CC Hair and Beauty',metaDesc:'The best edge control products in the UK 2026 — we rank and review the top 8 by hold, moisture, shine and flaking at CC Hair and Beauty.',slug:'best-edge-control-uk-2026',keywords:['best edge control uk','best edge control 4c hair uk','edge control review uk 2026'],data:'Category page targeting all edge control searches'},
  {day:13,cat:'local',title:'Relaxer Leeds — Where to Buy the Best Hair Relaxers in Leeds',seoTitle:'Relaxer Leeds | ORS, Dark & Lovely, TCB | CC Hair and Beauty',metaDesc:'Buy hair relaxers in Leeds at CC Hair and Beauty. ORS, Dark & Lovely, TCB and more in stock across Chapeltown, Roundhay and City Centre.',slug:'relaxer-leeds',keywords:['relaxer leeds','buy relaxer leeds','hair relaxer shop leeds','ors relaxer leeds'],data:'SC relaxers 60k+ impressions · local version'},
  {day:13,cat:'ads',title:"Bsset Defining Curl Cream vs Bsset Curl Cream — What's the Difference?",seoTitle:'Bsset Defining Curl Cream vs Bsset Curl Cream UK | CC Hair and Beauty',metaDesc:"Bsset Defining Curl Cream vs the original Bsset Curl Cream — what's the difference? We compare both for natural hair at CC Hair and Beauty.",slug:'bsset-defining-curl-cream-vs-curl-cream',keywords:['bsset defining curl cream','bsset defining curl cream review','bsset curl cream vs defining cream'],data:'Ads: 6 conv · £2.47 CPA · 9x ROAS'},
  {day:13,cat:'org',title:'Naturally Straight Beautiful Textures — Full Review UK',seoTitle:'Naturally Straight Beautiful Textures Review UK | CC Hair and Beauty',metaDesc:'Full Naturally Straight Beautiful Textures review — ingredients, how to use for straightening natural hair and results. Available at CC Hair and Beauty.',slug:'naturally-straight-beautiful-textures-review',keywords:['naturally straight beautiful textures','naturally straight beautiful textures review','texturizer natural hair uk'],data:'Ads: 7 conv · £0.04 CPA · 735x ROAS'},
  {day:14,cat:'local',title:'Crochet Hair Leeds — Full Guide to Crochet Braids in Leeds',seoTitle:'Crochet Hair Leeds | Crochet Braids Shop | CC Hair and Beauty',metaDesc:'Buy crochet hair in Leeds at CC Hair and Beauty. Freetress, Xpression, Bohemian and dozens of crochet styles across Chapeltown, Roundhay and City Centre.',slug:'crochet-hair-leeds',keywords:['crochet hair leeds','crochet braids leeds','buy crochet hair leeds','freetress crochet hair leeds'],data:'Crochet high search volume · freetress converts in Ads'},
  {day:14,cat:'ads',title:'Style Factor Edge Booster Review — Best Edge Control for Hold?',seoTitle:'Style Factor Edge Booster Review UK 2026 | CC Hair and Beauty',metaDesc:'Style Factor Edge Booster review — extra hold, shine, moisture and how it compares. Available at CC Hair and Beauty Leeds.',slug:'style-factor-edge-booster-review',keywords:['style factor edge booster review','style factor edge control review','best hold edge control uk'],data:'Ads: 6 conv · £1.05 CPA · 12x ROAS'},
  {day:14,cat:'org',title:'Xpression Springy Bohemian Twist Review — Is It Worth It?',seoTitle:'Xpression Springy Bohemian Twist Review UK 2026 | CC Hair and Beauty',metaDesc:'Full Xpression Springy Bohemian Twist review — texture, length, durability and how to install. Available at CC Hair and Beauty Leeds.',slug:'xpression-springy-bohemian-twist-review',keywords:['xpression springy bohemian twist','xpression bohemian twist review','bohemian twist braiding hair uk'],data:'Ads: 6 conv · £0.07 CPA · 276x ROAS'},
  {day:15,cat:'local',title:'Natural Hair Products Leeds — Best Brands at CC Hair and Beauty',seoTitle:'Natural Hair Products Leeds | Cantu, ORS, Mielle | CC Hair and Beauty',metaDesc:'Shop natural hair products in Leeds at CC Hair and Beauty. Cantu, ORS, Mielle, SheaMoisture and 200+ natural hair brands across Leeds.',slug:'natural-hair-products-leeds',keywords:['natural hair products leeds','natural hair shop leeds','cantu leeds','mielle organics leeds'],data:'Broad category · captures all natural hair local searches'},
  {day:15,cat:'ads',title:'Nivea Body Lotion UK — Which Is Best for Black Skin?',seoTitle:'Best Nivea Body Lotion for Black Skin UK 2026 | CC Hair and Beauty',metaDesc:'Which Nivea body lotion is best for black skin? We review the full Nivea range for moisture and value. Available at CC Hair and Beauty.',slug:'nivea-body-lotion-black-skin-uk',keywords:['nivea body lotion uk','best nivea lotion black skin','best body lotion black skin uk'],data:'Ads: 5 conv · £4.81 CPA · high volume term'},
  {day:15,cat:'org',title:'How to Moisturise Natural Hair — Complete UK Guide 2026',seoTitle:'How to Moisturise Natural Hair UK 2026 | CC Hair and Beauty',metaDesc:'Complete guide to moisturising natural hair in the UK — the best products, techniques and routines for 4A, 4B and 4C hair at CC Hair and Beauty.',slug:'how-to-moisturise-natural-hair-uk',keywords:['how to moisturise natural hair','moisturise 4c hair uk','best moisturiser natural hair uk'],data:'High volume how-to · evergreen content'},
  {day:16,cat:'local',title:'Hair Extensions Leeds — Complete 2026 Buying Guide',seoTitle:'Hair Extensions Leeds Buying Guide 2026 | CC Hair and Beauty',metaDesc:'Complete guide to buying hair extensions in Leeds — types, prices, brands and where to shop. CC Hair and Beauty stocks 500+ extension styles.',slug:'hair-extensions-leeds-guide',keywords:['hair extensions leeds','buy hair extensions leeds','clip in extensions leeds'],data:'High value keyword · buyer intent'},
  {day:16,cat:'ads',title:'Curling Cream for Natural Hair — Best Options UK 2026',seoTitle:'Best Curling Cream Natural Hair UK 2026 | CC Hair and Beauty',metaDesc:'Best curling creams for natural hair in the UK 2026 — our top picks for definition, moisture and hold at CC Hair and Beauty Leeds.',slug:'best-curling-cream-natural-hair-uk',keywords:['curling cream natural hair uk','best curling cream 4c hair','curl defining cream uk'],data:'Ads: 6 conv · £2.02 CPA · 5x ROAS'},
  {day:16,cat:'org',title:'Protein vs Moisture — How to Balance Natural Hair UK',seoTitle:'Protein vs Moisture Balance Natural Hair UK | CC Hair and Beauty',metaDesc:'How to balance protein and moisture in natural hair — signs of overload, the best products and routines from CC Hair and Beauty.',slug:'protein-vs-moisture-natural-hair',keywords:['protein vs moisture natural hair','protein overload natural hair uk','moisture balance natural hair'],data:'Evergreen educational · high search volume'},
  {day:17,cat:'local',title:'Wig Fitting Leeds — In-Store Wig Consultation at CC Hair and Beauty',seoTitle:'Wig Fitting Leeds | In-Store Consultation | CC Hair and Beauty',metaDesc:'Get a wig fitting at CC Hair and Beauty Leeds. Our team help you find the perfect wig across our 3 Leeds branches — Chapeltown, Roundhay and City Centre.',slug:'wig-fitting-leeds',keywords:['wig fitting leeds','wig consultation leeds','try wigs leeds','wig shop leeds'],data:'High intent service keyword · in-store differentiator'},
  {day:17,cat:'ads',title:'LA Colors Lip Liner Review — Best Affordable Lip Liner UK',seoTitle:'LA Colors Lip Liner Review UK 2026 | CC Hair and Beauty',metaDesc:'LA Colors Lip Liner review — pigment, longevity, shades and value. One of the best affordable lip liners available in the UK at CC Hair and Beauty.',slug:'la-colors-lip-liner-review',keywords:['la colors lip liner review','la colors lip liner uk','best affordable lip liner uk'],data:'Ads: 6 conv · £0.36 CPA · 15x ROAS'},
  {day:17,cat:'org',title:"4C Hair Care Routine UK — Complete Beginner's Guide 2026",seoTitle:"4C Hair Care Routine UK 2026 — Beginners Guide | CC Hair and Beauty",metaDesc:"Complete 4C hair care routine for beginners in the UK — washing, moisturising, styling and the best products at CC Hair and Beauty.",slug:'4c-hair-care-routine-uk',keywords:['4c hair care routine uk','4c hair routine beginners','how to care for 4c hair uk'],data:'Highest search volume natural hair category'},
  {day:18,cat:'local',title:'Hair Loss Wigs Leeds — Medical & Fashion Wigs at CC Hair and Beauty',seoTitle:'Hair Loss Wigs Leeds | Medical & Fashion Wigs | CC Hair and Beauty',metaDesc:'Compassionate wig service for hair loss in Leeds at CC Hair and Beauty. Human hair and synthetic wigs for alopecia, cancer treatment and thinning hair.',slug:'hair-loss-wigs-leeds',keywords:['hair loss wigs leeds','alopecia wigs leeds','thinning hair wigs leeds'],data:'Covers all hair loss conditions · compassionate angle'},
  {day:18,cat:'ads',title:'Edge Booster Gel vs Edge Booster Cream — Which Should You Buy?',seoTitle:'Edge Booster Gel vs Cream — Which Is Better? | CC Hair and Beauty',metaDesc:'Edge Booster Gel vs Edge Booster Cream — we compare hold strength, ingredients and finish. Both at CC Hair and Beauty Leeds.',slug:'edge-booster-gel-vs-cream',keywords:['edge booster gel vs cream','edge booster gel review','best edge booster uk'],data:'Ads: edge booster gel 6 conv · £2.02 CPA'},
  {day:18,cat:'org',title:'Best Shampoo for Afro Hair UK 2026 — Top 10 Ranked',seoTitle:'Best Shampoo Afro Hair UK 2026 — Top 10 | CC Hair and Beauty',metaDesc:'The best shampoos for afro hair in the UK 2026 — we rank the top 10 for moisture, cleansing and scalp health at CC Hair and Beauty.',slug:'best-shampoo-afro-hair-uk-2026',keywords:['best shampoo afro hair uk','best shampoo natural hair uk','sulfate free shampoo uk natural hair'],data:'High volume category · national reach'},
  {day:19,cat:'local',title:'Braiding Hair Brands Leeds — Xpression, Freetress, Outre In Stock',seoTitle:'Braiding Hair Brands Leeds | Xpression, Freetress, Outre | CC Hair',metaDesc:'All top braiding hair brands in stock in Leeds — Xpression, Freetress, Outre, Sensationnel at CC Hair and Beauty across 3 Leeds branches.',slug:'braiding-hair-brands-leeds',keywords:['xpression braiding hair leeds','freetress braiding hair leeds','outre braiding hair leeds'],data:'Brand-specific local searches with buying intent'},
  {day:19,cat:'ads',title:'Motions Texturizer Review — Best Curl Texturizer UK 2026',seoTitle:'Motions Texturizer Review UK 2026 | CC Hair and Beauty',metaDesc:'Motions Texturizer review — how it works on natural hair, strength levels and results. Available at CC Hair and Beauty Leeds.',slug:'motions-texturizer-review',keywords:['motions texturizer review','motions curl texturizer uk','best texturizer natural hair uk'],data:'Ads: 5 conv · £0.11 CPA · 149x ROAS'},
  {day:19,cat:'org',title:'How to Do Box Braids at Home — Step by Step UK Guide',seoTitle:'How to Do Box Braids at Home UK 2026 | CC Hair and Beauty',metaDesc:'Step by step guide to doing box braids at home in the UK — prep, sectioning, technique and recommended products at CC Hair and Beauty.',slug:'how-to-do-box-braids-at-home-uk',keywords:['how to do box braids at home','box braids at home uk','diy box braids uk'],data:'High volume how-to · drives braiding hair sales'},
  {day:20,cat:'local',title:'Leeds Afro Caribbean Shop — CC Hair and Beauty Full Product Guide',seoTitle:'Afro Caribbean Shop Leeds | CC Hair and Beauty',metaDesc:"Leeds' best afro caribbean shop — CC Hair and Beauty stocks 23,000+ products including hair, beauty and skin care for afro caribbean hair and skin.",slug:'afro-caribbean-shop-leeds',keywords:['afro caribbean shop leeds','afro caribbean hair products leeds','afro shop leeds'],data:'High intent local search · broad category capture'},
  {day:20,cat:'ads',title:'Cantu Mango Butter Review — Best Cantu Product for Natural Hair?',seoTitle:'Cantu Mango Butter Review UK 2026 | CC Hair and Beauty',metaDesc:'Cantu Mango Butter review — is it the best Cantu product for natural hair? We test moisture, hold and smell at CC Hair and Beauty Leeds.',slug:'cantu-mango-butter-review',keywords:['cantu mango butter review','cantu mango butter uk','best cantu products natural hair'],data:'Ads: 5 conv · £0.17 CPA · 44x ROAS'},
  {day:20,cat:'org',title:'Cantu vs SheaMoisture — Which Brand Is Best for Natural Hair UK?',seoTitle:'Cantu vs SheaMoisture UK 2026 — Which Is Better? | CC Hair and Beauty',metaDesc:'Cantu vs SheaMoisture — the ultimate UK comparison for natural hair. We compare shampoos, conditioners, leave-ins and styling products.',slug:'cantu-vs-sheamoisture-uk',keywords:['cantu vs sheamoisture','best natural hair brand uk','cantu vs sheamoisture which is better'],data:'High volume comparison · national reach'},
  {day:21,cat:'local',title:'Hair & Beauty Delivery Leeds — Same Day & Next Day at CC Hair',seoTitle:'Hair & Beauty Delivery Leeds | Same Day | CC Hair and Beauty',metaDesc:'CC Hair and Beauty offers same day delivery in Leeds and next day UK delivery. Order afro hair products, wigs and beauty online with fast delivery.',slug:'hair-beauty-delivery-leeds',keywords:['hair delivery leeds','same day hair delivery leeds','next day hair products leeds'],data:'Captures Leeds delivery intent · competitive USP'},
  {day:21,cat:'ads',title:'Schwarzkopf Keratin Heat Protect Spray Review UK',seoTitle:'Schwarzkopf Keratin Heat Protect Spray Review UK | CC Hair and Beauty',metaDesc:'Schwarzkopf Keratin Heat Protect Spray review — protection level, smell and finish on natural and relaxed hair. Available at CC Hair and Beauty.',slug:'schwarzkopf-keratin-heat-protect-review',keywords:['schwarzkopf keratin heat protect spray','best heat protection spray uk','keratin heat protect uk'],data:'Ads: 5 conv · £0.13 CPA · 68x ROAS'},
  {day:21,cat:'org',title:'How to Grow Natural Hair Fast UK — Proven Tips & Products 2026',seoTitle:'How to Grow Natural Hair Fast UK 2026 | CC Hair and Beauty',metaDesc:'Proven tips to grow natural hair faster in the UK — the best products, protective styles and routines at CC Hair and Beauty.',slug:'how-to-grow-natural-hair-fast-uk',keywords:['how to grow natural hair fast uk','natural hair growth tips uk','hair growth products natural hair uk'],data:'Evergreen high-volume search · drives product sales'},
  {day:22,cat:'local',title:'Weave Hair Leeds — Where to Buy Human Hair Weave in Leeds',seoTitle:'Human Hair Weave Leeds | In Stock | CC Hair and Beauty',metaDesc:'Buy human hair weave in Leeds at CC Hair and Beauty. Brazilian, Peruvian, Malaysian and Indian weave across Chapeltown, Roundhay and City Centre.',slug:'weave-hair-leeds',keywords:['weave hair leeds','human hair weave leeds','buy weave hair leeds','hair weave shop leeds'],data:'High buyer intent · weave is high value purchase'},
  {day:22,cat:'ads',title:'Papaya Brightening Serum UK — Where to Buy & How to Use',seoTitle:'Papaya Brightening Serum UK Guide 2026 | CC Hair and Beauty',metaDesc:'Papaya Brightening Serum guide — ingredients, how to use and where to buy in the UK. Available at CC Hair and Beauty Leeds.',slug:'papaya-brightening-serum-uk',keywords:['papaya brightening serum uk','brightening serum uk','papaya skin care uk'],data:'Ads: 5 conv · £0.06 CPA · 251x ROAS'},
  {day:22,cat:'org',title:'Best Protective Styles for Natural Hair UK 2026',seoTitle:'Best Protective Styles Natural Hair UK 2026 | CC Hair and Beauty',metaDesc:'The best protective styles for natural hair in the UK 2026 — box braids, twists, locs, wigs and more with product recommendations.',slug:'best-protective-styles-natural-hair-uk',keywords:['best protective styles natural hair uk','protective styles 4c hair uk','natural hair protective styles 2026'],data:'High volume category · evergreen content'},
  {day:23,cat:'local',title:"Kids Hair Products Leeds — Children's Hair Care at CC Hair and Beauty",seoTitle:"Kids Hair Products Leeds | Children's Hair Care | CC Hair and Beauty",metaDesc:"Buy children's hair products in Leeds at CC Hair and Beauty. Gentle shampoos, detanglers and styling products for afro and curly kids hair.",slug:'kids-hair-products-leeds',keywords:["kids hair products leeds","childrens hair products leeds","afro kids hair shop leeds","curly kids hair products leeds"],data:'Underserved local keyword · parents high buying intent'},
  {day:23,cat:'ads',title:'Blueberry Bliss Scalp Oil Review — Best Scalp Oil for Hair Growth UK',seoTitle:'Blueberry Bliss Scalp Oil Review UK 2026 | CC Hair and Beauty',metaDesc:'Tgin Blueberry Bliss Scalp Oil review — ingredients, how to use and results for hair growth. Available at CC Hair and Beauty Leeds.',slug:'blueberry-bliss-scalp-oil-review',keywords:['blueberry bliss scalp oil review','best scalp oil hair growth uk','scalp oil review uk'],data:'Ads: 4.5 conv · £0.08 CPA · 429x ROAS'},
  {day:23,cat:'org',title:'Low Porosity Hair Guide UK — Products, Routines & Tips 2026',seoTitle:'Low Porosity Hair Guide UK 2026 | CC Hair and Beauty',metaDesc:'Complete low porosity hair guide — how to identify it, the best products and routines for low porosity natural hair at CC Hair and Beauty.',slug:'low-porosity-hair-guide-uk',keywords:['low porosity hair uk','low porosity hair products uk','low porosity hair routine uk'],data:'Evergreen educational · high search volume'},
  {day:24,cat:'local',title:"Men's Hair Products Leeds — Grooming at CC Hair and Beauty",seoTitle:"Men's Hair Products Leeds | Grooming | CC Hair and Beauty",metaDesc:"Men's hair and grooming products in Leeds at CC Hair and Beauty — wave products, edge control, moisturisers across our 3 Leeds branches.",slug:'mens-hair-products-leeds',keywords:["men's hair products leeds","male grooming products leeds","wave products leeds","men's hair shop leeds"],data:"Underserved local keyword · men's range in store"},
  {day:24,cat:'ads',title:'Iris Wigs UK — Full Review & Where to Buy',seoTitle:'Iris Wigs UK Review 2026 — Where to Buy | CC Hair and Beauty',metaDesc:'Iris Wigs review — quality, realistic look and price. Where to buy Iris Wigs in the UK at CC Hair and Beauty Leeds.',slug:'iris-wigs-uk-review',keywords:['iris wigs uk','iris wigs review','where to buy iris wigs uk'],data:'Ads: 4.63 conv · £0.34 CPA · 165x ROAS'},
  {day:24,cat:'org',title:'High Porosity Hair Routine UK — Best Products & Tips 2026',seoTitle:'High Porosity Hair Routine UK 2026 | CC Hair and Beauty',metaDesc:'Complete high porosity hair routine — products to seal moisture, reduce frizz and strengthen high porosity natural hair at CC Hair and Beauty.',slug:'high-porosity-hair-routine-uk',keywords:['high porosity hair uk','high porosity hair products uk','high porosity hair routine uk'],data:'Companion to low porosity · high search volume'},
  {day:25,cat:'local',title:'Makeup Leeds — Full Range at CC Hair and Beauty',seoTitle:'Makeup Leeds | Beauty Products for Dark Skin | CC Hair and Beauty',metaDesc:'Shop makeup in Leeds at CC Hair and Beauty — LA Colors, Black Opal, NYX and more. Full makeup range for darker skin tones across our 3 Leeds branches.',slug:'makeup-leeds',keywords:['makeup leeds','makeup shop leeds','foundation for dark skin leeds','makeup for black skin leeds'],data:'Expands beyond hair · captures makeup local searches'},
  {day:25,cat:'ads',title:'French Curl Braids Review — Best French Curl Hair UK 2026',seoTitle:'French Curl Braids Review UK 2026 | CC Hair and Beauty',metaDesc:'French Curl braids review — texture, hold, longevity and how to install. The best French Curl braiding hair available at CC Hair and Beauty Leeds.',slug:'french-curl-braids-review',keywords:['french curl braids review','french curl hair uk','best french curl braiding hair'],data:'Ads: 4.5 conv · £3.47 CPA · 12x ROAS'},
  {day:25,cat:'org',title:'Twist Out on 4C Hair — Complete UK Step by Step Guide',seoTitle:'Twist Out 4C Hair UK — Step by Step Guide | CC Hair and Beauty',metaDesc:'How to do a perfect twist out on 4C hair — products, technique and tips for long-lasting definition at CC Hair and Beauty.',slug:'twist-out-4c-hair-uk',keywords:['twist out 4c hair uk','how to do twist out natural hair','twist out products uk'],data:'High volume tutorial · drives product discovery'},
  {day:26,cat:'local',title:'Hair Accessories Leeds — Bonnets, Durags & Styling Tools',seoTitle:'Hair Accessories Leeds | Bonnets, Durags & More | CC Hair and Beauty',metaDesc:'Buy hair accessories in Leeds at CC Hair and Beauty — satin bonnets, durags, hair pins, combs and styling tools across Chapeltown, Roundhay and City Centre.',slug:'hair-accessories-leeds',keywords:['hair accessories leeds','satin bonnet leeds','durag leeds','hair tools shop leeds'],data:'Broad accessory category · high frequency purchase'},
  {day:26,cat:'ads',title:'Premium Too Human Hair Review — Is It Worth Buying?',seoTitle:'Premium Too Human Hair Review UK 2026 | CC Hair and Beauty',metaDesc:'Premium Too HH Deep Wave Bulk hair review — quality, shedding, tangling and value. Available at CC Hair and Beauty Leeds.',slug:'premium-too-human-hair-review',keywords:['premium too human hair review','premium too hh hair uk','human hair bulk uk review'],data:'Ads: 4.27 conv · £0.63 CPA · 123x ROAS'},
  {day:26,cat:'org',title:'Braid Out vs Twist Out — Which Is Better for Natural Hair UK?',seoTitle:'Braid Out vs Twist Out — Which Is Better? | CC Hair and Beauty',metaDesc:'Braid out vs twist out — which gives better definition, less frizz and lasts longer on natural hair? Our comparison guide with recommended products.',slug:'braid-out-vs-twist-out-natural-hair',keywords:['braid out vs twist out','braid out natural hair uk','which is better braid out twist out'],data:'Comparison content · drives engagement and product sales'},
  {day:27,cat:'local',title:'CC Hair and Beauty Leeds Opening Hours — All 3 Branches',seoTitle:'CC Hair and Beauty Leeds Opening Hours | All Branches 2026',metaDesc:'CC Hair and Beauty opening hours for all 3 Leeds branches — Chapeltown LS7, Roundhay LS8 and City Centre. Bank holiday and Sunday times included.',slug:'cc-hair-beauty-leeds-opening-hours',keywords:['cc hair and beauty opening hours','cc hair chapeltown opening times','cc hair roundhay opening hours'],data:'Practical page · captures brand + location searches'},
  {day:27,cat:'ads',title:'Have a Scent Collection UK — Where to Buy & Full Review',seoTitle:'Have a Scent Collection UK Review 2026 | CC Hair and Beauty',metaDesc:'Have a Scent Collection — a complete guide on where to buy in the UK and our full review of the range. Available at CC Hair and Beauty.',slug:'have-a-scent-collection-uk',keywords:['have a scent collection uk','have a scent collection review','african beauty products uk'],data:'Ads: 4.5 conv · £6.13 CPA · 3.7x ROAS'},
  {day:27,cat:'org',title:'How to Detangle Natural Hair — No Breakage UK Guide 2026',seoTitle:'How to Detangle Natural Hair UK 2026 — No Breakage | CC Hair and Beauty',metaDesc:'How to detangle natural hair without breakage — the best tools, products and technique for 4A, 4B and 4C hair at CC Hair and Beauty.',slug:'how-to-detangle-natural-hair-uk',keywords:['how to detangle natural hair uk','detangle 4c hair without breakage','best detangler natural hair uk'],data:'Evergreen how-to · high search volume'},
  {day:28,cat:'local',title:'Parking Near CC Hair and Beauty Leeds — All 3 Branches Guide',seoTitle:'Parking Near CC Hair and Beauty Leeds | Branch Location Guide',metaDesc:'Practical guide to parking near CC Hair and Beauty in Leeds — Chapeltown LS7, Roundhay LS8 and New York Street City Centre.',slug:'parking-near-cc-hair-beauty-leeds',keywords:['parking chapeltown road leeds','parking roundhay road ls8','cc hair beauty how to get there'],data:'Practical local content · reduces friction for in-store visits'},
  {day:28,cat:'ads',title:'Wella Colour Touch Review — Best Semi-Permanent Hair Dye UK?',seoTitle:'Wella Colour Touch Review UK 2026 | CC Hair and Beauty',metaDesc:'Full Wella Colour Touch review — shade range, how to use, results and longevity. One of the best semi-permanent hair dyes at CC Hair and Beauty.',slug:'wella-colour-touch-review',keywords:['wella colour touch review','wella colour touch uk','best semi permanent hair dye uk'],data:'Ads: wella toner 3 conv · £0.45 CPA · high ROAS'},
  {day:28,cat:'org',title:'Pre-Poo Natural Hair — What It Is & Why You Should Do It',seoTitle:'Pre-Poo Natural Hair UK Guide 2026 | CC Hair and Beauty',metaDesc:'What is pre-pooing and why should you do it? Complete guide on pre-poo oils, treatments and routines at CC Hair and Beauty.',slug:'pre-poo-natural-hair-uk',keywords:['pre poo natural hair','pre poo routine uk','best pre poo oil natural hair'],data:'Evergreen educational · high search volume'},
  {day:29,cat:'local',title:'CC Hair and Beauty Chapeltown — Your Complete LS7 Branch Guide',seoTitle:'CC Hair and Beauty Chapeltown LS7 — Complete Branch Guide 2026',metaDesc:'Your complete guide to CC Hair and Beauty Chapeltown — location, opening hours, parking, product range and what to expect. Leeds LS7 premier hair shop.',slug:'cc-hair-beauty-chapeltown-ls7-guide',keywords:['cc hair beauty chapeltown','chapeltown hair shop ls7','cc hair chapeltown road'],data:'Flagship branch guide · strong local SEO signal'},
  {day:29,cat:'ads',title:'Garlic Nail Strengthener UK — Does It Really Work?',seoTitle:'Garlic Nail Strengthener Review UK 2026 | CC Hair and Beauty',metaDesc:'Garlic Nail Strengthener review — does it actually strengthen nails? We test and review the best garlic nail products in the UK at CC Hair and Beauty.',slug:'garlic-nail-strengthener-uk-review',keywords:['garlic nail strengthener uk','garlic nail strengthener review','best nail strengthener uk'],data:'Ads: 5.1 conv · £0.11 CPA · 81x ROAS'},
  {day:29,cat:'org',title:'LOC Method for Natural Hair UK — Complete Guide 2026',seoTitle:'LOC Method Natural Hair UK 2026 — Complete Guide | CC Hair and Beauty',metaDesc:'Complete guide to the LOC Method for natural hair in the UK — what it is, how to do it and the best products. All at CC Hair and Beauty.',slug:'loc-method-natural-hair-uk',keywords:['loc method natural hair uk','loc method 4c hair','best loc method products uk'],data:'High volume method page · evergreen content'},
  {day:30,cat:'local',title:'Best Hair Shop in Leeds 2026 — Why CC Hair and Beauty?',seoTitle:'Best Hair Shop Leeds 2026 | CC Hair and Beauty',metaDesc:"Why CC Hair and Beauty is Leeds' best hair shop — 23,000+ products, 3 branches, established since 1979, expert staff and the best afro hair range in Yorkshire.",slug:'best-hair-shop-leeds-2026',keywords:['best hair shop leeds','best afro hair shop leeds','top hair shop leeds 2026'],data:'Reputation content · captures best searches'},
  {day:30,cat:'ads',title:'Beauty Formulas Hair Removal Cream UK — Full Review',seoTitle:'Beauty Formulas Hair Removal Cream Review UK 2026 | CC Hair and Beauty',metaDesc:'Beauty Formulas Hair Removal Cream review — does it work, how to use safely and where to buy in the UK at CC Hair and Beauty Leeds.',slug:'beauty-formulas-hair-removal-cream-review',keywords:['beauty formulas hair removal cream review','beauty formulas cream uk','best hair removal cream uk'],data:'Ads: 3 conv · £0.03 CPA · extraordinary low CPA'},
  {day:30,cat:'org',title:'30-Day Natural Hair Challenge UK — Transform Your Hair Routine',seoTitle:'30-Day Natural Hair Challenge UK 2026 | CC Hair and Beauty',metaDesc:'Take the CC Hair and Beauty 30-day natural hair challenge — daily tips, product recommendations and routines to transform your hair in 30 days.',slug:'30-day-natural-hair-challenge-uk',keywords:['30 day natural hair challenge uk','natural hair challenge 2026','natural hair transformation uk'],data:'Viral-friendly · social sharing · links to products'},
]

const GBP_PLAN = [
  { week:1, monday:{ product:'Bsset Curl Cream', cat:'local' }, thursday:{ code:'BRAID10 — 10% off all braiding hair', cat:'ads' } },
  { week:2, monday:{ product:'Edge Booster Edge Control', cat:'ads' }, thursday:{ code:'WIGDEAL15 — 15% off all wigs', cat:'local' } },
  { week:3, monday:{ product:'Mielle Rosemary Oil', cat:'org' }, thursday:{ code:'COLOUR10 — 10% off all hair dye', cat:'ads' } },
  { week:4, monday:{ product:'ORS Olive Oil Relaxer', cat:'ads' }, thursday:{ code:'EDGE15 — 15% off all edge control', cat:'local' } },
]

const BRANCHES = [
  { id:'chapeltown', name:'Chapeltown', address:'Chapeltown Road, Leeds LS7' },
  { id:'roundhay',   name:'Roundhay',   address:'Roundhay Road, Leeds LS8' },
  { id:'city',       name:'City Centre', address:'New York Street, Leeds LS2' },
]

export default function BlogPlanner() {
  const [tab, setTab] = useState('blogs') // 'blogs' | 'gbp'
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [published, setPublished] = useState({})
  const [expanded, setExpanded] = useState(null)
  const [generating, setGenerating] = useState({})
  const [generated, setGenerated] = useState({})
  const [copied, setCopied] = useState({})
  const [images, setImages] = useState({})
  const [imgGenerating, setImgGenerating] = useState({})
  const [imgCopied, setImgCopied] = useState({})
  const [gbpGenerating, setGbpGenerating] = useState({})
  const [gbpContent, setGbpContent] = useState({})
  const [gbpCopied, setGbpCopied] = useState({})

  useEffect(() => {
    try {
      const s = localStorage.getItem('cc_blog_pub'); if(s) setPublished(JSON.parse(s))
      const g = localStorage.getItem('cc_blog_gen'); if(g) setGenerated(JSON.parse(g))
      const img = localStorage.getItem('cc_blog_images'); if(img) setImages(JSON.parse(img))
      const gc = localStorage.getItem('cc_gbp_content'); if(gc) setGbpContent(JSON.parse(gc))
    } catch(e){}
  }, [])

  function togglePub(slug) {
    const u = { ...published, [slug]: !published[slug] }
    setPublished(u); localStorage.setItem('cc_blog_pub', JSON.stringify(u))
  }

  async function generateBlog(post) {
    setGenerating(g => ({ ...g, [post.slug]: true }))
    try {
      const r = await fetch('/api/generate-blog', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ title:post.title, seoTitle:post.seoTitle, metaDesc:post.metaDesc, keywords:post.keywords, slug:post.slug, cat:post.cat, data:post.data })
      })
      const d = await r.json()
      if (!d.ok || !d.content || d.content.trim() === '') {
        const errMsg = d.error || 'Empty response — please try again'
        console.error('[blog-planner] Generation failed:', errMsg)
        alert('Generation failed: ' + errMsg)
        setGenerating(g => { const u = {...g}; delete u[post.slug]; return u })
        return
      }
      const blogContent = d.content
      setGenerated(prev => {
        const u = { ...prev, [post.slug]: blogContent }
        try { localStorage.setItem('cc_blog_gen', JSON.stringify(u)) } catch(e) {}
        return u
      })
    } catch(e) {}
    setGenerating(g => { const u = {...g}; delete u[post.slug]; return u })
  }

  async function generateImage(post) {
    setImgGenerating(g => ({ ...g, [post.slug]: true }))
    try {
      const r = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: post.title, cat: post.cat, keywords: post.keywords })
      })
      const d = await r.json()
      if (d.ok) {
        setImages(prev => {
          const u = { ...prev, [post.slug]: { url: d.imageUrl, alt: d.altText, filename: d.filename } }
          try { localStorage.setItem('cc_blog_images', JSON.stringify(u)) } catch(e) {}
          return u
        })
      } else {
        alert('Image generation failed: ' + (d.error || 'Unknown error'))
      }
    } catch(e) { alert('Error: ' + e.message) }
    setImgGenerating(g => { const u = {...g}; delete u[post.slug]; return u })
  }

  function copyBlog(slug) {
    const content = generated[slug]
    if (!content) return
    navigator.clipboard.writeText(content)
    setCopied(c => ({ ...c, [slug]: true }))
    setTimeout(() => setCopied(c => ({ ...c, [slug]: false })), 2000)
  }

  async function generateGbp(key, branch, type, week, product, code) {
    setGbpGenerating(g => ({ ...g, [key]: true }))
    try {
      const r = await fetch('/api/generate-gbp', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ branch, type, week:`Week ${week}`, product, code })
      })
      const d = await r.json()
      const u = { ...gbpContent, [key]: d.content }
      setGbpContent(u); localStorage.setItem('cc_gbp_content', JSON.stringify(u))
    } catch(e) {}
    setGbpGenerating(g => ({ ...g, [key]: false }))
  }

  function copyGbp(key) {
    const content = gbpContent[key]
    if (!content) return
    navigator.clipboard.writeText(content)
    setGbpCopied(c => ({ ...c, [key]: true }))
    setTimeout(() => setGbpCopied(c => ({ ...c, [key]: false })), 2000)
  }

  const filtered = POSTS.filter(p => {
    if (filter !== 'all' && p.cat !== filter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const pubCount = POSTS.filter(p => published[p.slug]).length
  const pct = Math.round(pubCount / POSTS.length * 100)

  return (
    <>
      <Head><title>Blog Planner — CC Intelligence</title></Head>
      <Shell title="Blog Planner" subtitle="90 blog posts + 24 GBP posts · AI generates full content · just copy and paste">
      <div style={{maxWidth:'100%'}}>

        {/* HEADER */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:10}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:3}}>📝 Blog & GBP Planner</h1>
            <div style={{color:C.text3,fontSize:12}}>90 blog posts + 24 GBP posts · all data-proven · AI generates full content · just copy & paste</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{fontSize:12,color:C.text3}}>{pubCount}/90 blogs published</div>
            <div style={{width:100,height:6,background:C.surface2,borderRadius:99,overflow:'hidden'}}>
              <div style={{width:`${pct}%`,height:'100%',background:C.green,borderRadius:99}}/>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:C.accent2}}>{pct}%</span>
          </div>
        </div>

        {/* MAIN TABS */}
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[{id:'blogs',label:'📝 90 Blog Posts'},{id:'gbp',label:'📍 24 GBP Posts'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'9px 20px',borderRadius:9,border:`2px solid ${tab===t.id?C.accent:C.border}`,
              background:tab===t.id?`${C.accent}20`:C.surface2,
              color:tab===t.id?C.accent2:C.text3,fontWeight:700,fontSize:13,cursor:'pointer'
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── BLOGS TAB ── */}
        {tab==='blogs' && (
          <div>
            {/* Structure reminder */}
            <div style={{background:C.surface,border:`1px solid ${C.amber}30`,borderRadius:11,padding:14,marginBottom:14}}>
              <div style={{fontWeight:700,color:C.amber,fontSize:12,marginBottom:8}}>📋 Shopify structure — create these 3 blogs first, then post articles inside them</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {[{cat:'local',name:'Leeds Hair Shop Guides',handle:'leeds'},{cat:'ads',name:'Product Reviews',handle:'product-reviews'},{cat:'org',name:'Hair Care Guides',handle:'hair-care'}].map((b,i)=>(
                  <div key={i} style={{background:C.surface2,borderRadius:7,padding:9,borderLeft:`3px solid ${CAT_META[b.cat].color}`}}>
                    <div style={{fontWeight:600,color:C.text,fontSize:12}}>{b.name}</div>
                    <div style={{fontSize:10,color:C.text3,marginTop:2}}>cchairandbeauty.com/blogs/{b.handle}/</div>
                    <div style={{fontSize:10,color:CAT_META[b.cat].color,marginTop:2}}>30 posts to publish</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
              {['all','local','ads','org'].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{
                  padding:'5px 12px',borderRadius:6,border:`1px solid ${filter===f?(f==='all'?C.accent:CAT_META[f]?.color):C.border}`,
                  background:filter===f?`${f==='all'?C.accent:CAT_META[f]?.color}20`:C.surface2,
                  color:filter===f?(f==='all'?C.accent2:CAT_META[f]?.color):C.text3,
                  fontWeight:filter===f?700:400,fontSize:12,cursor:'pointer'
                }}>
                  {f==='all'?'All (90)':f==='local'?'Local SEO (30)':f==='ads'?'Paid Ads SEO (30)':'Organic SEO (30)'}
                </button>
              ))}
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search titles..."
                style={{flex:1,minWidth:180,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:6,color:C.text,fontSize:12,padding:'5px 10px',outline:'none'}}/>
            </div>

            {/* Posts list */}
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {filtered.map(post => {
                const col = CAT_META[post.cat].color
                const isPub = published[post.slug]
                const isExp = expanded === post.slug
                const hasGen = !!generated[post.slug]
                const isGen = generating[post.slug]
                return (
                  <div key={post.slug} style={{background:C.surface,border:`1px solid ${isPub?C.green:C.border}`,borderRadius:11,overflow:'hidden'}}>
                    {/* ROW */}
                    <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px'}}>
                      {/* Publish tick */}
                      <div onClick={()=>togglePub(post.slug)}
                        style={{width:18,height:18,borderRadius:4,border:`2px solid ${isPub?C.green:C.border}`,background:isPub?C.green:'none',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,cursor:'pointer'}}>
                        {isPub&&<span style={{color:'#000',fontSize:10,fontWeight:800}}>✓</span>}
                      </div>
                      {/* Day */}
                      <div style={{background:C.surface2,borderRadius:4,padding:'2px 6px',fontSize:10,color:C.text3,flexShrink:0}}>Day {post.day}</div>
                      {/* Cat */}
                      <div style={{background:`${col}15`,color:col,padding:'2px 7px',borderRadius:4,fontSize:10,fontWeight:600,flexShrink:0}}>{CAT_META[post.cat].label}</div>
                      {/* Title */}
                      <div style={{fontWeight:600,color:isPub?C.text3:C.text,fontSize:13,flex:1,textDecoration:isPub?'line-through':'none',lineHeight:1.3,cursor:'pointer'}} onClick={()=>setExpanded(isExp?null:post.slug)}>{post.title}</div>
                      {/* Generate button */}
                      {!hasGen ? (
                        <button onClick={()=>{setExpanded(post.slug);generateBlog(post)}} disabled={isGen}
                          style={{padding:'5px 12px',borderRadius:6,border:'none',background:isGen?C.surface2:col,color:isGen?C.text3:'#000',fontWeight:700,fontSize:11,cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>
                          {isGen?'⟳ Writing...':'✨ Generate'}
                        </button>
                      ) : (
                        <button onClick={()=>copyBlog(post.slug)}
                          style={{padding:'5px 12px',borderRadius:6,border:'none',background:copied[post.slug]?C.green:C.teal,color:'#000',fontWeight:700,fontSize:11,cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>
                          {copied[post.slug]?'✓ Copied!':'📋 Copy Post'}
                        </button>
                      )}
                      {/* Expand */}
                      <div style={{color:C.text3,fontSize:14,cursor:'pointer'}} onClick={()=>setExpanded(isExp?null:post.slug)}>{isExp?'▲':'▼'}</div>
                    </div>

                    {/* EXPANDED */}
                    {isExp && (
                      <div style={{borderTop:`1px solid ${C.border}`,padding:14,background:C.surface2}}>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:C.text3,textTransform:'uppercase',marginBottom:4}}>SEO Title</div>
                            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:'7px 9px',fontSize:12,color:C.text,marginBottom:8}}>{post.seoTitle}</div>
                            <div style={{fontSize:10,fontWeight:700,color:C.text3,textTransform:'uppercase',marginBottom:4}}>Meta Description</div>
                            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:'7px 9px',fontSize:12,color:C.text,marginBottom:8,lineHeight:1.5}}>{post.metaDesc}</div>
                            <div style={{fontSize:10,fontWeight:700,color:C.text3,textTransform:'uppercase',marginBottom:4}}>URL Slug</div>
                            <div style={{background:C.surface,border:`1px solid ${col}30`,borderRadius:6,padding:'6px 9px',fontSize:11,color:col,fontFamily:'monospace'}}>cchairandbeauty.com/blogs/{CAT_META[post.cat].handle}/{post.slug}</div>
                          </div>
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:C.text3,textTransform:'uppercase',marginBottom:4}}>Target Keywords</div>
                            <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
                              {post.keywords.map((kw,i)=><span key={i} style={{background:C.surface,border:`1px solid ${col}30`,color:col,padding:'2px 7px',borderRadius:4,fontSize:11}}>{kw}</span>)}
                            </div>
                            <div style={{fontSize:10,fontWeight:700,color:C.text3,textTransform:'uppercase',marginBottom:4}}>Data Source</div>
                            <div style={{background:`${col}10`,border:`1px solid ${col}20`,borderRadius:6,padding:'7px 9px',fontSize:12,color:col,marginBottom:8}}>{post.data}</div>
                            <div style={{fontSize:10,fontWeight:700,color:C.text3,textTransform:'uppercase',marginBottom:4}}>Post Into Shopify Blog</div>
                            <div style={{background:C.surface,border:`1px solid ${col}30`,borderRadius:6,padding:'7px 9px',fontSize:12,color:C.text}}>
                              Online Store → Blog Posts → <span style={{color:col,fontWeight:700}}>{CAT_META[post.cat].blog}</span> → Add article
                            </div>
                          </div>
                        </div>

                        {/* Generated content */}
                        {isGen && (
                          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:14,textAlign:'center',color:C.text3,fontSize:13}}>
                            ✨ AI is writing your blog post... this takes about 15 seconds
                          </div>
                        )}
                        {hasGen && !isGen && (
                          <div>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                              <div style={{fontSize:12,fontWeight:700,color:C.green}}>✅ Blog post ready — copy and paste into Shopify</div>
                              <div style={{display:'flex',gap:6}}>
                                <button onClick={()=>generateBlog(post)} style={{padding:'5px 10px',borderRadius:5,border:`1px solid ${C.border}`,background:C.surface2,color:C.text3,fontSize:11,cursor:'pointer'}}>↺ Regenerate</button>
                                <button onClick={()=>copyBlog(post.slug)} style={{padding:'5px 14px',borderRadius:5,border:'none',background:copied[post.slug]?C.green:C.teal,color:'#000',fontWeight:700,fontSize:12,cursor:'pointer'}}>
                                  {copied[post.slug]?'✓ Copied!':'📋 Copy Full Post'}
                                </button>
                              </div>
                            </div>
                            <textarea readOnly value={generated[post.slug]} rows={12}
                              style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,color:C.text2,fontSize:11,padding:10,resize:'vertical',lineHeight:1.5}}/>
                          </div>
                        )}
                        {!hasGen && !isGen && (
                          <button onClick={()=>generateBlog(post)}
                            style={{width:'100%',padding:'10px',borderRadius:8,border:`2px dashed ${col}`,background:`${col}08`,color:col,fontWeight:700,fontSize:13,cursor:'pointer'}}>
                            ✨ Click to Generate Full Blog Post (700-900 words, formatted, ready to paste into Shopify)
                          </button>
                        )}
                        {/* IMAGE SECTION — shows after blog is generated */}
                        {hasGen && !isGen && (
                          <div style={{marginTop:14,borderTop:`1px solid ${C.border}`,paddingTop:14}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
                              <div>
                                <div style={{fontWeight:700,color:C.text,fontSize:13}}>🖼️ Blog Header Image</div>
                                <div style={{fontSize:11,color:C.text3}}>DALL-E 3 · 1792×1024px · tailored to this post</div>
                              </div>
                              {!images[post.slug] && !imgGenerating[post.slug] && (
                                <button onClick={()=>generateImage(post)}
                                  style={{padding:'7px 18px',borderRadius:7,border:'none',background:'#7c3aed',color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer'}}>
                                  🎨 Generate Image
                                </button>
                              )}
                            </div>
                            {imgGenerating[post.slug] && (
                              <div style={{background:`#7c3aed10`,border:`1px solid #7c3aed30`,borderRadius:8,padding:20,textAlign:'center',color:'#a78bfa',fontSize:13}}>
                                🎨 DALL-E 3 is creating your bespoke blog header image... about 15 seconds
                              </div>
                            )}
                            {images[post.slug] && !imgGenerating[post.slug] && (
                              <div>
                                <img src={images[post.slug].url} alt={images[post.slug].alt}
                                  style={{width:'100%',borderRadius:9,border:`1px solid ${C.border}`,marginBottom:10,display:'block'}}/>
                                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:'8px 10px'}}>
                                    <div style={{fontSize:9,fontWeight:700,color:C.text3,textTransform:'uppercase',marginBottom:3}}>Alt text — paste into Shopify image field</div>
                                    <div style={{fontSize:12,color:C.text2,lineHeight:1.4}}>{images[post.slug].alt}</div>
                                  </div>
                                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:'8px 10px'}}>
                                    <div style={{fontSize:9,fontWeight:700,color:C.text3,textTransform:'uppercase',marginBottom:3}}>Save file as (for SEO)</div>
                                    <div style={{fontSize:11,color:'#7c3aed',fontFamily:'monospace'}}>{images[post.slug].filename}</div>
                                  </div>
                                </div>
                                <div style={{display:'flex',gap:6}}>
                                  <button onClick={()=>{
                                    const a = document.createElement('a')
                                    a.href = images[post.slug].url
                                    a.download = images[post.slug].filename
                                    a.click()
                                  }}
                                    style={{flex:1,padding:'8px',borderRadius:6,border:'none',background:'#7c3aed',color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer',textAlign:'center'}}>
                                    ⬇️ Download Image
                                  </button>
                                  <button onClick={()=>generateImage(post)}
                                    style={{padding:'8px 14px',borderRadius:6,border:`1px solid ${C.border}`,background:C.surface2,color:C.text3,fontWeight:600,fontSize:11,cursor:'pointer'}}>
                                    ↺ New Image
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── GBP TAB ── */}
        {tab==='gbp' && (
          <div>
            <div style={{background:`${C.blue}08`,border:`1px solid ${C.blue}20`,borderRadius:11,padding:14,marginBottom:16,fontSize:13,color:C.blue,lineHeight:1.6}}>
              📍 2 GBP posts per week × 3 branches = 6 posts per week = 24 posts per month. Monday = product spotlight. Thursday = promotion with discount code. Each branch gets its own version. Generate → Copy → Paste into Google Business Profile for each branch.
            </div>

            {GBP_PLAN.map((week,wi) => (
              <div key={wi} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:12}}>
                <div style={{fontWeight:800,color:C.text,fontSize:15,marginBottom:14}}>Week {week.week}</div>

                {[
                  { day:'Monday', type:'spotlight', product:week.monday.product, label:`Product Spotlight — ${week.monday.product}`, color:C.teal },
                  { day:'Thursday', type:'promo', code:week.thursday.code, label:`Promotion — ${week.thursday.code}`, color:C.amber },
                ].map((slot,si) => (
                  <div key={si} style={{marginBottom:si===0?16:0}}>
                    <div style={{fontWeight:700,color:slot.color,fontSize:12,marginBottom:10}}>{slot.day} · {slot.label}</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                      {BRANCHES.map((branch,bi) => {
                        const key = `w${week.week}-${slot.day}-${branch.id}`
                        const isGen = gbpGenerating[key]
                        const hasContent = !!gbpContent[key]
                        return (
                          <div key={bi} style={{background:C.surface2,borderRadius:9,padding:12,border:`1px solid ${slot.color}20`}}>
                            <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:2}}>{branch.name}</div>
                            <div style={{fontSize:10,color:C.text3,marginBottom:10}}>{branch.address}</div>

                            {!hasContent ? (
                              <button onClick={()=>generateGbp(key,branch.id,slot.type,week.week,slot.product,slot.code)} disabled={isGen}
                                style={{width:'100%',padding:'7px',borderRadius:6,border:'none',background:isGen?C.surface:slot.color,color:isGen?C.text3:'#000',fontWeight:700,fontSize:11,cursor:'pointer'}}>
                                {isGen?'⟳ Writing...':'✨ Generate'}
                              </button>
                            ) : (
                              <div>
                                <textarea readOnly value={gbpContent[key]} rows={5}
                                  style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:5,color:C.text2,fontSize:10,padding:7,resize:'none',lineHeight:1.4,marginBottom:6}}/>
                                <div style={{display:'flex',gap:5}}>
                                  <button onClick={()=>generateGbp(key,branch.id,slot.type,week.week,slot.product,slot.code)}
                                    style={{flex:1,padding:'5px',borderRadius:5,border:`1px solid ${C.border}`,background:C.surface,color:C.text3,fontSize:10,cursor:'pointer'}}>↺</button>
                                  <button onClick={()=>copyGbp(key)}
                                    style={{flex:2,padding:'5px',borderRadius:5,border:'none',background:gbpCopied[key]?C.green:slot.color,color:'#000',fontWeight:700,fontSize:11,cursor:'pointer'}}>
                                    {gbpCopied[key]?'✓ Copied!':'📋 Copy'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      </Shell>
    </>
  )
}
