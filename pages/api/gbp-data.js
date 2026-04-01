export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  const { placeId, branch } = req.query
  const key = process.env.GOOGLE_PLACES_KEY

  if (!key) return res.status(200).json({ ok: false, error: 'No Places API key' })
  if (!placeId) return res.status(200).json({ ok: false, error: 'No place ID' })

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,opening_hours,formatted_address,formatted_phone_number,website,reviews,photos&key=${key}`
    const r = await fetch(url)
    const d = await r.json()

    if (d.status !== 'OK') {
      return res.status(200).json({ ok: false, error: d.status, branch })
    }

    const place = d.result
    res.status(200).json({
      ok: true,
      branch,
      name: place.name,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
      isOpen: place.opening_hours?.open_now,
      hours: place.opening_hours?.weekday_text || [],
      reviews: (place.reviews || []).map(r => ({
        author: r.author_name,
        stars: r.rating,
        text: r.text,
        time: r.relative_time_description,
        authorUrl: r.author_url,
      })),
      photoCount: place.photos?.length || 0,
    })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message, branch })
  }
}
