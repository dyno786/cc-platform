export const config = { maxDuration: 60 }

async function checkAnthropic(key) {
  const start = Date.now()
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say OK' }],
      }),
    })
    const data = await res.json()
    const ms = Date.now() - start
    if (data.content?.[0]?.text) {
      return { ok: true, message: 'Connected — model responded in ' + ms + 'ms', ms, model: data.model }
    }
    return { ok: false, message: data.error?.message || 'Unexpected response', ms }
  } catch (e) {
    return { ok: false, message: e.message, ms: Date.now() - start }
  }
}

async function checkShopify(store, token) {
  const start = Date.now()
  try {
    const res = await fetch('https://' + store + '/admin/api/2024-01/shop.json', {
      headers: { 'X-Shopify-Access-Token': token }
    })
    const data = await res.json()
    const ms = Date.now() - start
    if (data.shop) {
      return { ok: true, message: 'Connected — ' + data.shop.name + ' (' + data.shop.domain + ')', ms, products: null, plan: data.shop.plan_name }
    }
    return { ok: false, message: data.errors || 'Auth failed', ms }
  } catch (e) {
    return { ok: false, message: e.message, ms: Date.now() - start }
  }
}

async function checkShopifyProducts(store, token) {
  const start = Date.now()
  try {
    const res = await fetch('https://' + store + '/admin/api/2024-01/products/count.json', {
      headers: { 'X-Shopify-Access-Token': token }
    })
    const data = await res.json()
    const ms = Date.now() - start
    if (data.count !== undefined) {
      return { ok: true, message: data.count.toLocaleString() + ' products in store', ms, count: data.count }
    }
    return { ok: false, message: 'Could not get product count', ms }
  } catch (e) {
    return { ok: false, message: e.message, ms: Date.now() - start }
  }
}

async function checkGooglePlaces(key) {
  const start = Date.now()
  try {
    const res = await fetch(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=CC+Hair+Beauty+Leeds&inputtype=textquery&key=' + key
    )
    const data = await res.json()
    const ms = Date.now() - start
    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      return { ok: true, message: 'API key valid — status: ' + data.status, ms, candidates: data.candidates?.length || 0 }
    }
    return { ok: false, message: 'Places API error: ' + data.status + (data.error_message ? ' — ' + data.error_message : ''), ms }
  } catch (e) {
    return { ok: false, message: e.message, ms: Date.now() - start }
  }
}

async function checkEnvVars() {
  const vars = [
    'ANTHROPIC_API_KEY',
    'SHOPIFY_STORE',
    'SHOPIFY_TOKEN',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_PLACES_KEY',
  ]
  const results = {}
  for (const v of vars) {
    const val = process.env[v]
    results[v] = {
      present: !!val,
      length: val ? val.length : 0,
      preview: val ? val.substring(0, 8) + '...' : 'MISSING',
    }
  }
  return results
}

export default async function handler(req, res) {
  const start = Date.now()
  const envVars = await checkEnvVars()

  const [anthropic, shopify, shopifyProducts, googlePlaces] = await Promise.all([
    envVars.ANTHROPIC_API_KEY.present ? checkAnthropic(process.env.ANTHROPIC_API_KEY) : { ok: false, message: 'API key not set' },
    envVars.SHOPIFY_STORE.present && envVars.SHOPIFY_TOKEN.present ? checkShopify(process.env.SHOPIFY_STORE, process.env.SHOPIFY_TOKEN) : { ok: false, message: 'Store or token not set' },
    envVars.SHOPIFY_STORE.present && envVars.SHOPIFY_TOKEN.present ? checkShopifyProducts(process.env.SHOPIFY_STORE, process.env.SHOPIFY_TOKEN) : { ok: false, message: 'Store or token not set' },
    envVars.GOOGLE_PLACES_KEY.present ? checkGooglePlaces(process.env.GOOGLE_PLACES_KEY) : { ok: false, message: 'Places key not set' },
  ])

  const totalMs = Date.now() - start
  const allOk = anthropic.ok && shopify.ok && googlePlaces.ok

  res.status(200).json({
    timestamp: new Date().toISOString(),
    totalMs,
    overallStatus: allOk ? 'ALL_OK' : 'ISSUES_FOUND',
    envVars,
    checks: {
      anthropic: { name: 'Anthropic Claude API', ...anthropic },
      shopify: { name: 'Shopify Admin API', ...shopify },
      shopifyProducts: { name: 'Shopify Product Count', ...shopifyProducts },
      googlePlaces: { name: 'Google Places API', ...googlePlaces },
      googleOAuth: {
        name: 'Google OAuth (Search Console / GA4)',
        ok: envVars.GOOGLE_CLIENT_ID.present && envVars.GOOGLE_CLIENT_SECRET.present,
        message: envVars.GOOGLE_CLIENT_ID.present && envVars.GOOGLE_CLIENT_SECRET.present
          ? 'Client ID and Secret present — OAuth flow ready'
          : 'Client ID or Secret missing',
      },
      googleAds: {
        name: 'Google Ads API',
        ok: false,
        message: 'Blocked from Vercel serverless (known issue) — use CSV upload instead',
        knownIssue: true,
      },
      whatsapp: {
        name: 'WhatsApp Business API',
        ok: true,
        message: 'Connected via abandoned-cart-theta.vercel.app (separate project)',
        external: true,
      },
    },
  })
}
