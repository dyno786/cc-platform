// Server-side Place ID finder using Google Places API
export default async function handler(req, res) {
  const key = process.env.GOOGLE_PLACES_KEY
  const branches = [
    { name:'chapeltown', query:'CC Hair and Beauty 119 Chapeltown Road Leeds LS7' },
    { name:'roundhay',   query:'CC Hair and Beauty 256 Roundhay Road Leeds LS8' },
    { name:'citycentre', query:'CC Hair and Beauty New York Street Leeds LS2' },
  ]

  const results = {}
  for (const branch of branches) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(branch.query)}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total,formatted_address&key=${key}`
      const r = await fetch(url)
      const d = await r.json()
      const candidate = d.candidates?.[0]
      results[branch.name] = candidate
        ? { placeId: candidate.place_id, name: candidate.name, rating: candidate.rating, reviews: candidate.user_ratings_total, address: candidate.formatted_address }
        : { error: d.status, query: branch.query }
    } catch(e) {
      results[branch.name] = { error: e.message }
    }
  }
  res.status(200).json(results)
}
