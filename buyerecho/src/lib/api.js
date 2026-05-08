// src/lib/api.js
// Thin client that calls the Vercel serverless proxy instead of Anthropic directly.
// This keeps the API key server-side and avoids CORS issues in production.

export async function callClaude({ system, user, timeoutMs = 90000, tools = null }) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const body = { system, user, max_tokens: tools ? 2500 : 1000 }
  if (tools) body.tools = tools

  let response
  try {
    response = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (e) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') throw new Error(`request timed out after ${timeoutMs / 1000}s`)
    throw e
  }
  clearTimeout(timeoutId)

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
  return { text, content: data.content }
}

// Robust JSON extractor — handles fenced, prefixed, and truncated responses.
export function extractJson(text) {
  if (!text || typeof text !== 'string') throw new Error('empty or non-string response')

  const trimmed = text.trim()
  try { return JSON.parse(trimmed) } catch (e) { /* fall through */ }

  const firstBrace = text.indexOf('{')
  if (firstBrace === -1) throw new Error(`no JSON object found in response. Got: ${text.slice(0, 200)}`)

  let depth = 0, inString = false, escapeNext = false, endIdx = -1
  for (let i = firstBrace; i < text.length; i++) {
    const ch = text[i]
    if (escapeNext) { escapeNext = false; continue }
    if (ch === '\\' && inString) { escapeNext = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) { endIdx = i; break }
    }
  }

  if (endIdx === -1) throw new Error(`JSON object never closed (likely truncated). Depth ended at ${depth}.`)

  const slice = text.slice(firstBrace, endIdx + 1)
  try { return JSON.parse(slice) }
  catch (e) { throw new Error(`failed to parse extracted JSON: ${e.message}. Slice: ${slice.slice(0, 300)}...`) }
}

export async function callJsonStage(prompt, stageName = 'stage') {
  let raw
  try {
    const result = await callClaude({
      system: 'Return only valid JSON matching the requested schema. Do not wrap your response in markdown code fences. Output the JSON object directly, starting with { and ending with }.',
      user: prompt,
    })
    raw = result.text
  } catch (e) {
    throw new Error(`${stageName} API call failed: ${e.message}`)
  }
  try {
    return extractJson(raw)
  } catch (e) {
    const snippet = raw.length > 400 ? raw.slice(0, 400) + '...' : raw
    throw new Error(`${stageName} returned unparseable response. ${e.message}\n\nRaw response:\n${snippet}`)
  }
}

export async function callJsonStageWithSearch(prompt, stageName = 'stage') {
  let result
  try {
    result = await callClaude({
      system: 'Use web_search to gather current information from authoritative sources. Then return ONLY valid JSON matching the requested schema. The JSON must be the LAST thing in your response.',
      user: prompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      timeoutMs: 120000,
    })
  } catch (e) {
    throw new Error(`${stageName} API call failed: ${e.message}`)
  }

  const sources = []
  const seenUrls = new Set()
  for (const block of result.content || []) {
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const r of block.content) {
        if (r.type === 'web_search_result' && r.url && !seenUrls.has(r.url)) {
          seenUrls.add(r.url)
          sources.push({ url: r.url, title: r.title || r.url })
        }
      }
    }
  }

  let json
  try {
    json = extractJson(result.text)
  } catch (e) {
    const snippet = result.text.length > 400 ? result.text.slice(0, 400) + '...' : result.text
    throw new Error(`${stageName} returned unparseable response. ${e.message}\n\nRaw response:\n${snippet}`)
  }

  return { json, sources }
}
