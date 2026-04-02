export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  const key = process.env.GOOGLE_PLACES_KEY

  // If called with ?lookup=true, find all 3 Place IDs automatically
  if (req.query.lookup) {
    const branches = [
      { id: 'chapeltown', query: 'CC Hair Beauty 119 Chapeltown Road Leeds LS7' },
      { id: 'roundhay',   query: 'CC Hair Beauty 256 Roundhay Road Leeds LS8' },
      { id: 'citycentre', query: 'CC Hair Beauty New York Street Leeds LS2' },
    ]
    const results = {}
    for (const branch of branches) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(branch.query)}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total,formatted_address&key=${key}`
        const r = await fetch(url)
        const d = await r.json()
        const c = d.candidates?.[0]
        results[branch.id] = c
          ? { placeId: c.place_id, name: c.name, rating: c.rating, reviews: c.user_ratings_total, address: c.formatted_address, status: d.status }
          : { error: d.status || 'No results', query: branch.query }
      } catch(e) {
        results[branch.id] = { error: e.message }
      }
    }
    return res.status(200).json({ ok: true, branches: results })
  }

  // Standard single place lookup by placeId
  const placeId = req.query.placeId
  if (!placeId) return res.status(400).json({ ok: false, error: 'No place ID' })

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,opening_hours,formatted_address&key=${key}`
    const r = await fetch(url)
    const d = await r.json()
    if (d.status !== 'OK') return res.status(200).json({ ok: false, error: d.status })
    const p = d.result
    res.status(200).json({
      ok: true,
      name: p.name,
      rating: p.rating,
      reviews: p.user_ratings_total,
      address: p.formatted_address,
      recentReviews: (p.reviews || []).slice(0, 3).map(r => ({
        author: r.author_name,
        stars: r.rating,
        text: r.text,
        time: r.relative_time_description,
      })),
    })
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
