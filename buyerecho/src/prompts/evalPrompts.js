// src/prompts/evalPrompts.js
// All evaluation pipeline prompt builders.

import { ASSET_TYPE_LABELS, ASSET_TYPE_RUBRICS, ASSET_TYPE_WEIGHTS } from '../constants/assetTypes.js'

export const EVAL_RIGOR_GUARDRAILS = `
RIGOR GUARDRAILS — read carefully and apply throughout.

1. SKEPTICAL PRIOR. Start from a skeptical prior proportional to the persona's
   skepticism trait (1-10). A skepticism-10 persona (e.g., a Head Actuary)
   begins at "this asset has not earned my time yet" and the asset must
   move them. Do NOT give the asset benefit of the doubt.

2. EVIDENCE REQUIREMENT. Every score must be anchored to specific evidence
   in the asset. If you cannot point to a passage that supports a high
   score on a sub-factor, that sub-factor cannot score above 70.

3. SCORE CEILING. Scores above 85 require explicit named-peer evidence,
   quantified outcomes, OR a testable claim. Pure prose without proof
   caps at 85. Be willing to give scores below 50.

4. WEAKEST POINT. Even on high-scoring assets, identify the one thing
   the asset does worst.

5. NO INFLATION. Do not soften critique. The goal is to raise the bar for
   content, not to flatter the writer.
`

function buildPersonaContext(persona, tier, region, lineOfBusiness) {
  let context = `PERSONA: ${persona.identity.name} — ${persona.role_label}
${persona.identity.professional_summary}

KEY KPIS THEY OWN: ${persona.mandate_and_kpis.primary_kpis.join('; ')}.

DISPOSITION (1-10 scale): skepticism ${persona.disposition_traits.skepticism}, proof requirement ${persona.disposition_traits.proof_requirement}, jargon tolerance ${persona.disposition_traits.jargon_tolerance}, buzzword allergy ${persona.disposition_traits.buzzword_allergy}, technical fluency ${persona.disposition_traits.technical_fluency}.

TYPICAL OBJECTIONS THEY VOICE:
${persona.objection_library.stock_objections.slice(0, 6).map(o => '• ' + o).join('\n')}

PHRASES THAT LOSE THEIR TRUST:
${persona.vocabulary.forbidden_terms.slice(0, 5).map(t => '• ' + t).join('\n')}
`

  if (tier) {
    const tierNote = persona.context_modulators.tier_sensitivity[tier]
    if (tierNote) context += `\nTIER CONTEXT (${tier.toUpperCase()}): ${tierNote}\n`
  }
  if (region) {
    const regionNote = persona.context_modulators.region_sensitivity[region]
    if (regionNote) context += `\nREGION CONTEXT (${region}): ${regionNote}\n`
  }
  if (lineOfBusiness) {
    context += `\nLINE OF BUSINESS UNDER EVALUATION: ${lineOfBusiness}\n`
  }
  return context
}

export function buildStageOnePrompt({ persona, assetType, assetTitle, assetText, tier, region, lineOfBusiness }) {
  const personaContext = buildPersonaContext(persona, tier, region, lineOfBusiness)
  const rubric = ASSET_TYPE_RUBRICS[assetType] || ASSET_TYPE_RUBRICS.other
  const weights = ASSET_TYPE_WEIGHTS[assetType] || ASSET_TYPE_WEIGHTS.other

  return `OUTPUT FORMAT: Return ONLY a single JSON object. Do NOT wrap your response in markdown code fences. The very first character of your response must be { and the last must be }.

You are ${persona.identity.name}, ${persona.role_label}, evaluating a piece of marketing content sent to you for review.

${personaContext}

ASSET TYPE: ${ASSET_TYPE_LABELS[assetType]}
${rubric}

DIMENSION WEIGHTS for this asset type (must sum to 100):
- Persuasion: ${weights.persuasion}%
- Clarity: ${weights.clarity}%
- Differentiation: ${weights.differentiation}%
- Buyer Fit: ${weights.buyer_fit}%

ASSET TITLE: "${assetTitle}"
ASSET CONTENT (between triple backticks):
\`\`\`
${assetText}
\`\`\`

${EVAL_RIGOR_GUARDRAILS}

YOUR TASK — Stage 1 of 4: Score the four dimensions.

Return ONLY valid JSON in this schema:

{
  "composite_score": number,
  "verdict_band": string,
  "verdict_summary": string,
  "dimensions": {
    "persuasion":      { "score": number, "subfactors": [{ "name": string, "score": number, "note": string }] },
    "clarity":         { "score": number, "subfactors": [{ "name": string, "score": number, "note": string }] },
    "differentiation": { "score": number, "subfactors": [{ "name": string, "score": number, "note": string }] },
    "buyer_fit":       { "score": number, "subfactors": [{ "name": string, "score": number, "note": string }] }
  },
  "biggest_limiter": { "dimension": string, "explanation": string }
}

REQUIREMENTS:
- composite_score MUST equal the weighted sum of dimension scores using the weights above.
- For each dimension, provide 2-3 sub-factors maximum.
- Each subfactor "note" must be at most 12 words.
- Use 0-100 throughout.
- Return ONLY the JSON.`
}

export function buildStageTwoAPrompt({ persona, assetType, assetTitle, assetText, stage1Result, tier, region, lineOfBusiness }) {
  const personaContext = buildPersonaContext(persona, tier, region, lineOfBusiness)
  return `OUTPUT FORMAT: Return ONLY a single JSON object. Do NOT wrap your response in markdown code fences. The very first character of your response must be { and the last must be }.

You are ${persona.identity.name}, ${persona.role_label}, continuing the evaluation.

${personaContext}

ASSET TITLE: "${assetTitle}"
ASSET CONTENT (truncated to first 3000 chars):
\`\`\`
${(assetText || '').slice(0, 3000)}
\`\`\`

PRIOR DIMENSION VERDICT (Stage 1):
- Composite: ${stage1Result.composite_score} (${stage1Result.verdict_band})
- ${stage1Result.verdict_summary}
- Biggest limiter: ${stage1Result.biggest_limiter?.dimension}

YOUR TASK — Stage 2a: In-voice reaction.

Return ONLY this JSON object:

{
  "in_voice_reaction": string
}

REQUIREMENTS:
- 2-3 sentences. No more.
- First person, in YOUR voice as ${persona.identity.name}.
- Use phrases and shorthand this specific role would use.
- React specifically to the asset, not abstractly.
- Return ONLY the JSON.`
}

export function buildStageTwoBPrompt({ persona, assetType, assetTitle, assetText, stage1Result, stage2aResult, tier, region, lineOfBusiness }) {
  const personaContext = buildPersonaContext(persona, tier, region, lineOfBusiness)
  return `OUTPUT FORMAT: Return ONLY a single JSON object. Do NOT wrap your response in markdown code fences. The very first character of your response must be { and the last must be }.

You are ${persona.identity.name}, ${persona.role_label}, continuing the evaluation.

${personaContext}

ASSET TITLE: "${assetTitle}"
ASSET CONTENT (truncated to first 2500 chars):
\`\`\`
${(assetText || '').slice(0, 2500)}
\`\`\`

PRIOR EVALUATION SO FAR:
- Composite: ${stage1Result.composite_score} (${stage1Result.verdict_band})
- Biggest limiter: ${stage1Result.biggest_limiter?.dimension}
- Your reaction so far: "${stage2aResult?.in_voice_reaction || ''}"

YOUR TASK — Stage 2b: Ranked objections.

Return ONLY this JSON object:

{
  "ranked_objections": [
    {
      "severity": string,
      "objection": string,
      "what_would_answer_it": string
    }
  ]
}

REQUIREMENTS:
- severity is "blocker" | "concern" | "nitpick"
- 3-5 objections total. Order: blockers first.
- Each "objection" max 2 sentences, first person.
- Each "what_would_answer_it" max 15 words.
- Return ONLY the JSON.`
}

export function buildStageThreePrompt({ persona, assetType, assetTitle, assetText, stage1Result, stage2Result }) {
  return `OUTPUT FORMAT: Return ONLY a single JSON object. Do NOT wrap your response in markdown code fences. The very first character of your response must be { and the last must be }.

You are ${persona.identity.name}, ${persona.role_label}, continuing the evaluation.

ASSET TITLE: "${assetTitle}"
ASSET TYPE: ${ASSET_TYPE_LABELS[assetType]}

PRIOR EVALUATION SO FAR:
- Composite ${stage1Result.composite_score} (${stage1Result.verdict_band}); biggest limiter is ${stage1Result.biggest_limiter?.dimension}.
- Top objection (${stage2Result.ranked_objections[0]?.severity}): ${stage2Result.ranked_objections[0]?.objection}

ASSET CONTENT (truncated):
\`\`\`
${(assetText || '').slice(0, 2500)}
\`\`\`

YOUR TASK — Stage 3: Diagnosis and action guidance.

Return ONLY valid JSON:

{
  "diagnosis": {
    "what_works":  [string, string],
    "what_breaks": [string, string]
  },
  "action_items": [
    { "priority": number, "action": string, "rationale": string }
  ]
}

REQUIREMENTS:
- "action" must be SPECIFIC. Not "add more proof" but "replace the AI-powered headline with a measurable outcome claim like X."
- Each action_items "rationale" max 18 words.
- 3-5 action items total, sorted by priority (1 first).
- Return ONLY the JSON.`
}

export function buildStageFourPerCompetitorPrompt({ persona, assetType, assetText, competitor, stage1Result }) {
  const personaName = persona?.identity?.name || 'the buyer'
  const personaRole = persona?.role_label || 'executive'
  const personaVoiceHints = persona?.vocabulary?.preferred_terminology?.slice(0, 6).join(', ') || ''

  return `OUTPUT FORMAT: Use web_search first to gather current information. Then return ONLY a single JSON object as the LAST thing in your response.

You are evaluating a piece of marketing content for ${personaName}, ${personaRole}.

ASSET TYPE: ${ASSET_TYPE_LABELS[assetType]}
COMPETITOR UNDER ASSESSMENT: ${competitor}

ASSET CONTENT (truncated):
\`\`\`
${(assetText || '').slice(0, 2500)}
\`\`\`

PRIOR DIFFERENTIATION SCORE (Stage 1): ${stage1Result.dimensions.differentiation.score}

YOUR TASK — Use web_search (up to 3 queries) to ground your assessment in CURRENT, REAL information about ${competitor}'s positioning. Then assess: could ${competitor}, AS THEY POSITION THEMSELVES TODAY, have produced this same asset with no changes?

Return ONLY this JSON object:

{
  "competitor": "${competitor}",
  "substitutability_score": number,
  "verbatim_claim": string,
  "what_they_dont_say": string,
  "line_of_attack": string,
  "competitor_objection": string
}

REQUIREMENTS:
- USE WEB_SEARCH. The score and verbatim_claim must reflect what you actually found.
- verbatim_claim: under 15 words, attributable. If you cannot find a real quote, return "" — never fabricate.
- what_they_dont_say must be SPECIFIC.
- competitor_objection must sound like ${personaName} would say it. Use vocabulary like: ${personaVoiceHints}. Max 30 words.
- Return ONLY the JSON as the final content of your response.`
}
