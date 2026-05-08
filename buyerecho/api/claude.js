// api/claude.js — Vercel serverless function
// Proxies requests to the Anthropic API so the key never hits the browser.
// The frontend posts { system, user, tools, max_tokens } and gets back
// the raw Anthropic response JSON.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  try {
    const { system, user, tools, max_tokens = 1000 } = req.body

    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens,
      system,
      messages: [{ role: 'user', content: user }]
    }
    if (tools) body.tools = tools

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify(body)
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      return res.status(upstream.status).json(data)
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('Claude proxy error:', err)
    return res.status(500).json({ error: err.message })
  }
}
