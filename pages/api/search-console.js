export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  // Search Console OAuth requires a stored refresh token from the user
  // completing the consent flow. Until that's done, return known keyword data.
  res.status(200).json({
    ok: true,
    note: 'Search Console OAuth pending — showing last known keyword data',
    keywords: [
      { query:'cc hair beauty',              clicks:1150, impressions:4200, position:1.2 },
      { query:'hair shop leeds',             clicks:220,  impressions:1800, position:3.1 },
      { query:'braiding hair leeds',         clicks:180,  impressions:760,  position:1.8 },
      { query:'wigs leeds',                  clicks:95,   impressions:890,  position:2.4 },
      { query:'natural hair products leeds', clicks:76,   impressions:540,  position:2.1 },
      { query:'afro hair shop leeds',        clicks:54,   impressions:420,  position:3.8 },
      { query:'hair extensions leeds',       clicks:43,   impressions:380,  position:6.2 },
      { query:'ors relaxer uk',              clicks:38,   impressions:290,  position:4.1 },
      { query:'cantu shea butter uk',        clicks:31,   impressions:240,  position:5.3 },
      { query:'mielle organics uk',          clicks:28,   impressions:210,  position:4.7 },
    ]
  })
}
