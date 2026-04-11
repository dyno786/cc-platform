export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  // Show what we have (masked for security)
  const debug = {
    hasClientId: !!clientId,
    clientIdPreview: clientId ? clientId.slice(0,20)+'...' : 'MISSING',
    hasClientSecret: !!clientSecret,
    clientSecretPreview: clientSecret ? clientSecret.slice(0,6)+'...' : 'MISSING',
    hasRefreshToken: !!refreshToken,
    refreshTokenPreview: refreshToken ? refreshToken.slice(0,10)+'...' : 'MISSING',
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      })
    })

    const tokenData = await tokenRes.json()

    res.status(200).json({
      debug,
      tokenResponse: {
        status: tokenRes.status,
        hasAccessToken: !!tokenData.access_token,
        error: tokenData.error || null,
        error_description: tokenData.error_description || null,
        scope: tokenData.scope || null,
        token_type: tokenData.token_type || null,
      }
    })
  } catch(e) {
    res.status(200).json({ debug, fetchError: e.message })
  }
}
