export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { outOfStockItem, customerName } = req.body

  const shop = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_TOKEN
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }

  try {
    // Search for similar products by first meaningful word of the out of stock item
    const keyword = outOfStockItem.split(' ').find(w => w.length > 3) || outOfStockItem.split(' ')[0]
    const r = await fetch(
      `https://${shop}/admin/api/2024-01/products.json?title=${encodeURIComponent(keyword)}&limit=5&fields=id,title,handle,variants,images`,
      { headers }
    )
    const d = await r.json()

    // Filter to only in-stock alternatives (not the original item)
    const alternatives = (d.products || [])
      .filter(p => p.title !== outOfStockItem)
      .filter(p => p.variants?.some(v => (v.inventory_quantity || 0) > 0))
      .slice(0, 3)
      .map(p => ({
        title: p.title,
        url: `https://cchairandbeauty.com/products/${p.handle}`,
        price: `£${parseFloat(p.variants[0]?.price || 0).toFixed(2)}`,
      }))

    // Use AI to write the message
    const firstName = customerName?.split(' ')[0] || 'there'
    let aiMessage = null

    if (process.env.ANTHROPIC_API_KEY) {
      const altList = alternatives.length > 0
        ? alternatives.map(a => `- ${a.title} (${a.price}): ${a.url}`).join('\n')
        : 'No direct alternatives found — suggest browsing the full range.'

      const prompt = `Write a short, friendly plain text WhatsApp message to ${firstName} from CC Hair and Beauty Leeds.

The customer previously ordered: ${outOfStockItem}
This item is currently out of stock.

Available alternatives from our store:
${altList}

Rules:
- Plain text only, NO emojis
- Maximum 6 lines
- Mention the out of stock item by name
- Suggest 1-2 alternatives with the URL
- End with our website: https://cchairandbeauty.com
- Sign off as CC Hair and Beauty Leeds
- Friendly but brief`

      const ar = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 300, messages: [{ role: 'user', content: prompt }] })
      })
      const ad = await ar.json()
      aiMessage = ad.content?.[0]?.text || null
    }

    // Fallback generic message
    const genericMessage = [
      `Hi ${firstName},`,
      ``,
      `We wanted to let you know that ${outOfStockItem} is currently out of stock.`,
      alternatives.length > 0
        ? `You may like these alternatives:\n${alternatives.map(a => `${a.title} - ${a.url}`).join('\n')}`
        : `Please browse our full range at https://cchairandbeauty.com`,
      ``,
      `If you need any help finding something similar, just reply and we will be happy to help.`,
      `CC Hair and Beauty Leeds`,
    ].join('\n')

    res.status(200).json({
      ok: true,
      alternatives,
      aiMessage,
      genericMessage,
      outOfStockItem,
    })
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message, alternatives: [], aiMessage: null, genericMessage: '' })
  }
}
