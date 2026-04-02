// Step 1 — redirect user to Google consent screen
export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = 'https://cc-platform-two.vercel.app/api/search-console-callback'
  const scope = 'https://www.googleapis.com/auth/webmasters.readonly'

  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline` +
    `&prompt=consent`

  res.redirect(url)
}
