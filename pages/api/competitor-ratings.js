export const config = { maxDuration: 30 }

// Known Leeds hair & beauty competitors with their Google Place IDs
// Place IDs found via Google Places API search
const COMPETITORS = [
  { name: 'Kashmir Hair & Cosmetics', handle: 'kashmir', search: 'Kashmir Hair Cosmetics Leeds' },
  { name: 'Hair City Leeds', handle: 'haircity', search: 'Hair City Leeds' },
  { name: 'Elegance Hair', handle: 'elegance', search: 'Elegance Hair Leeds' },
  { name: 'New Look Hair', handle: 'newlook', search: 'New Look Hair Leeds' },
]

export default async function handler(req, res) {
  const key = process.env.GOOGLE_PLACES_KEY
  if (!key) return res.status(200).json({ ok: false, error: 'No Google Places key' })

  try {
    const results = await Promise.all(COMPETITORS.map(async comp => {
      try {
        // Search for the place
        const searchR = await fetch(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(comp.search)}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total,formatted_address&key=${key}`
        )
        const searchD = await searchR.json()
        const place = searchD.candidates?.[0]

        if (!place) return { ...comp, found: false, rating: null, reviews: null }

        return {
          ...comp,
          found: true,
          placeId: place.place_id,
          name: place.name || comp.name,
          rating: place.rating || null,
          reviews: place.user_ratings_total || null,
          address: place.formatted_address || '',
        }
      } catch(e) {
        return { ...comp, found: false, rating: null, reviews: null, error: e.message }
      }
    }))

    res.status(200).json({ ok: true, competitors: results })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message })
  }
}
