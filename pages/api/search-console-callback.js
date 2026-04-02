// Step 2 — Google redirects back here with a code, exchange it for refresh token
export default async function handler(req, res) {
  const { code, error } = req.query

  if (error) {
    return res.status(200).send(`
      <html><body style="font-family:sans-serif;padding:40px;background:#0f1117;color:#e8eaf0">
        <h2 style="color:#ef4444">❌ Auth error: ${error}</h2>
        <p>Go back and try again.</p>
      </body></html>
    `)
  }

  if (!code) {
    return res.status(400).send('No code received')
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'https://cc-platform-two.vercel.app/api/search-console-callback',
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (tokens.error) {
      return res.status(200).send(`
        <html><body style="font-family:sans-serif;padding:40px;background:#0f1117;color:#e8eaf0">
          <h2 style="color:#ef4444">❌ Token error: ${tokens.error}</h2>
          <pre style="color:#8b90a7">${tokens.error_description}</pre>
        </body></html>
      `)
    }

    const refreshToken = tokens.refresh_token

    // Show the refresh token for manual saving to Vercel env vars
    return res.status(200).send(`
      <html>
      <head><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"></head>
      <body style="font-family:'DM Sans',sans-serif;padding:40px;background:#0f1117;color:#e8eaf0;max-width:700px;margin:0 auto">
        <div style="background:#1a1d27;border:2px solid #22c55e;border-radius:16px;padding:32px;text-align:center">
          <div style="font-size:48px;margin-bottom:16px">✅</div>
          <h1 style="color:#22c55e;margin-bottom:8px">Search Console Connected!</h1>
          <p style="color:#8b90a7;margin-bottom:24px">Copy the refresh token below and add it to Vercel environment variables.</p>
        </div>

        <div style="background:#22263a;border-radius:12px;padding:20px;margin-top:24px">
          <div style="font-size:12px;color:#555b75;margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em">Your Refresh Token</div>
          <div style="background:#0f1117;border-radius:8px;padding:14px;font-family:monospace;font-size:13px;color:#818cf8;word-break:break-all;margin-bottom:12px">${refreshToken}</div>
          <button onclick="navigator.clipboard.writeText('${refreshToken}');this.textContent='✓ Copied!';this.style.background='#22c55e';this.style.color='#000'" 
            style="width:100%;padding:12px;border:none;border-radius:8px;background:#6366f1;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">
            📋 Copy Refresh Token
          </button>
        </div>

        <div style="background:#1a1d27;border-radius:12px;padding:20px;margin-top:16px">
          <div style="font-weight:700;color:#f59e0b;margin-bottom:12px">Next step — add to Vercel:</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${['1. Go to vercel.com → cc-platform project → Settings → Environment Variables',
               '2. Click "Add New"',
               '3. Name: GOOGLE_REFRESH_TOKEN',
               '4. Value: paste the token above',
               '5. Save → then Redeploy the project'].map(s => `
              <div style="display:flex;gap:10px;font-size:13px;color:#8b90a7">
                <span style="color:#f59e0b">→</span>${s}
              </div>`).join('')}
          </div>
          <a href="https://vercel.com/mohammed-adris-projects/cc-platform/settings/environment-variables" target="_blank"
            style="display:block;margin-top:16px;padding:10px;border-radius:8px;border:none;background:#f59e0b;color:#000;font-weight:700;font-size:13px;text-decoration:none;text-align:center">
            Open Vercel Environment Variables →
          </a>
        </div>
      </body></html>
    `)
  } catch(e) {
    return res.status(500).send(`Error: ${e.message}`)
  }
}
