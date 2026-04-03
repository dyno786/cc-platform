export const config = { maxDuration: 30 }

const BRANCHES = {
  chapeltown: { name:'Chapeltown', address:'Chapeltown Road, Leeds LS7', rating:'4.1★', phone:'0113 XXX XXXX' },
  roundhay:   { name:'Roundhay',   address:'Roundhay Road, Leeds LS8',   rating:'3.8★', phone:'0113 XXX XXXX' },
  city:       { name:'City Centre',address:'New York Street, Leeds LS2', rating:'3.5★', phone:'0113 XXX XXXX' },
}

const CODES = { wigs:'WIGDEAL15 (15% off)', dye:'COLOUR10 (10% off)', edge:'EDGE15 (15% off)', braid:'BRAID10 (10% off)', oil:'OIL10 (10% off)', growth:'GROW10 (10% off)' }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { branch, type, week, product, code } = req.body
  const b = BRANCHES[branch]

  const prompts = {
    spotlight: `Write a Google Business Profile post for CC Hair and Beauty ${b.name} branch (${b.address}).
Post type: Product Spotlight.
Product to feature: ${product}
Week: ${week}

Requirements:
- 150-200 words maximum
- Start with an attention-grabbing first line (no emoji at start)
- Mention the product name naturally 2-3 times
- Mention the branch location (${b.name}, ${b.address}) 
- Include 1-2 practical tips about using the product
- End with: "Visit us at ${b.address} or shop online at cchairandbeauty.com"
- Add 3-5 relevant hashtags at the end
- Friendly, expert tone
- No markdown, plain text only`,

    promo: `Write a Google Business Profile post for CC Hair and Beauty ${b.name} branch (${b.address}).
Post type: Weekly Promotion/Offer.
Discount code to promote: ${code}
Week: ${week}

Requirements:
- 150-200 words maximum  
- Start with the offer/deal prominently
- Mention what the discount applies to
- Include urgency — this week only
- Mention the branch location (${b.name}, ${b.address})
- Include the discount code clearly: ${code}
- End with: "Visit us at ${b.address} or shop online at cchairandbeauty.com"
- Add 3-5 relevant hashtags at the end
- Friendly, exciting tone
- No markdown, plain text only`
  }

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompts[type] }]
    })
  })

  const d = await r.json()
  const content = d.content?.[0]?.text || ''
  res.status(200).json({ ok: true, content })
}
