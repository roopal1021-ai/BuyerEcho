// src/components/evaluation/Report.jsx
// EvaluationProgress + EvaluationReport + all sub-components

import React from 'react'
import { motion } from 'framer-motion'
import { Check, AlertCircle, Loader2, ChevronLeft, FileType, Quote, AlertTriangle, Lightbulb, Activity, Shield, Globe } from 'lucide-react'
import { TOKENS, bandFor } from '../../tokens.js'
import { personaMeta } from '../../constants/personas.js'
import { ASSET_TYPE_LABELS, ASSET_TYPE_WEIGHTS } from '../../constants/assetTypes.js'
import { Eyebrow, Display, Body, GhostButton, PersonaAvatar } from '../primitives/index.jsx'

// ---- EvaluationProgress ----

export function EvaluationProgress({ stage, hasCompetitors, competitors, error, onRetry, onCancel }) {
  const baseStages = [
    { id: 1, label: 'Scoring four dimensions',     icon: Activity },
    { id: 2, label: 'In-voice reaction',           icon: Quote },
    { id: 3, label: 'Ranked objections',           icon: AlertTriangle },
    { id: 4, label: 'Diagnosis & action guidance', icon: Lightbulb },
  ]
  const competitorStages = (hasCompetitors && competitors)
    ? competitors.map((c, i) => ({ id: 5 + i, label: `Researching ${c} (web search)`, icon: Shield }))
    : []
  const stages = [...baseStages, ...competitorStages]

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <Eyebrow color={TOKENS.accent}>Evaluation in progress</Eyebrow>
        <div style={{ marginTop: '1rem', marginBottom: '2rem' }}><Display size="3xl">Running through the panel.</Display></div>
        <div style={{ marginBottom: '2rem' }}><Body muted>Each stage is a separate call to keep responses tight and reliable.</Body></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {stages.map((s, i) => {
            const state = stage > s.id ? 'done' : (stage === s.id ? 'active' : 'pending')
            const StageIcon = s.icon
            return (
              <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.1rem', background: TOKENS.white, border: `1px solid ${state === 'active' ? TOKENS.accent : TOKENS.ruleLite}`, fontFamily: "'Inter', system-ui, sans-serif" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: TOKENS.muted, width: '1.5rem' }}>{String(i + 1).padStart(2, '0')}</span>
                <StageIcon size={15} strokeWidth={1.5} color={TOKENS.muted} />
                <span style={{ flex: 1, fontSize: '0.88rem', color: TOKENS.ink }}>{s.label}</span>
                {state === 'pending' && <span style={{ fontSize: '0.78rem', color: TOKENS.mutedLite }}>queued</span>}
                {state === 'active' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: TOKENS.accent }}><Loader2 size={12} className="animate-spin" /> running</span>}
                {state === 'done' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: TOKENS.success }}><Check size={13} strokeWidth={2} /> done</span>}
              </motion.div>
            )
          })}
        </div>

        {!error && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onCancel}
              style={{ background: 'transparent', border: `1px solid ${TOKENS.rule}`, padding: '0.45rem 0.9rem', fontSize: '0.78rem', cursor: 'pointer', color: TOKENS.muted, fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = TOKENS.err; e.currentTarget.style.color = TOKENS.err }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = TOKENS.rule; e.currentTarget.style.color = TOKENS.muted }}>
              Cancel evaluation
            </button>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.2rem', background: 'rgba(138, 42, 26, 0.06)', border: `1px solid ${TOKENS.err}`, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: TOKENS.err }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: 600 }}><AlertCircle size={14} /> Stage failed</div>
            <div style={{ marginBottom: '0.8rem', color: TOKENS.ink, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '260px', overflowY: 'auto', padding: '0.7rem 0.9rem', background: TOKENS.white, border: `1px solid ${TOKENS.ruleLite}` }}>{error}</div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={onRetry} style={{ background: TOKENS.err, color: TOKENS.paper, border: 'none', padding: '0.5rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer' }}>Retry stage</button>
              <button onClick={onCancel} style={{ background: 'transparent', border: `1px solid ${TOKENS.rule}`, padding: '0.5rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer', color: TOKENS.ink }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Report sub-components ----

function ScoreRing({ value, size = 120, color, label }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={TOKENS.ruleLite} strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: size * 0.32, fill: TOKENS.ink, fontWeight: 500 }}>{value}</text>
      {label && <text x={size / 2} y={size / 2 + size * 0.22} textAnchor="middle" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: size * 0.09, fill: TOKENS.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</text>}
    </svg>
  )
}

function VerdictBadge({ band }) {
  const labels = { ship: 'SHIP IT', revise: 'REVISE', rethink: 'RETHINK', rebuild: 'REBUILD' }
  const ranges = { ship: '85+', revise: '70–84', rethink: '55–69', rebuild: '<55' }
  const score = band === 'ship' ? 90 : band === 'revise' ? 75 : band === 'rethink' ? 60 : 40
  const { color, bg } = bandFor(score)
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.9rem', background: bg, color, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em' }}>
      {labels[band] || band.toUpperCase()}
      <span style={{ opacity: 0.7, fontWeight: 400 }}>· {ranges[band] || ''}</span>
    </div>
  )
}

function DimensionBar({ name, score, weight, subfactors, color }) {
  const notApplicable = weight === 0
  return (
    <div style={{ marginBottom: '1.2rem', padding: '1rem 1.1rem', background: notApplicable ? TOKENS.paperLite : TOKENS.white, border: `1px solid ${TOKENS.ruleLite}`, borderLeft: `3px solid ${notApplicable ? TOKENS.mutedLite : color}`, opacity: notApplicable ? 0.75 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', marginBottom: '0.6rem' }}>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: notApplicable ? TOKENS.muted : TOKENS.ink, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{name}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: TOKENS.mutedLite, marginTop: '0.15rem' }}>{notApplicable ? 'not applicable for this asset type' : `weight ${weight}%`}</div>
        </div>
        {notApplicable ? (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: TOKENS.mutedLite, letterSpacing: '0.1em', textTransform: 'uppercase' }}>n/a</div>
        ) : (
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', fontWeight: 500, color }}>{score}</div>
        )}
      </div>
      {!notApplicable && (
        <>
          <div style={{ position: 'relative', height: '4px', background: TOKENS.ruleLite, marginBottom: '0.7rem' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${score}%`, background: color }} />
          </div>
          {subfactors?.length > 0 && (
            <div style={{ marginTop: '0.7rem' }}>
              {subfactors.map((sf, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.3rem 0', borderTop: i === 0 ? 'none' : `1px dashed ${TOKENS.ruleLite}`, gap: '0.8rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: TOKENS.ink }}>{sf.name}</div>
                    {sf.note && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: TOKENS.muted, fontStyle: 'italic', marginTop: '0.1rem' }}>{sf.note}</div>}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 500, color: sf.score >= 70 ? color : TOKENS.muted }}>{sf.score}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ObjectionItem({ objection, severity, what_would_answer_it }) {
  const severityMap = { blocker: { label: 'BLOCKER', color: TOKENS.err, bg: 'rgba(138,42,26,0.06)' }, concern: { label: 'CONCERN', color: TOKENS.warn, bg: 'rgba(138,90,22,0.08)' }, nitpick: { label: 'NITPICK', color: TOKENS.muted, bg: 'rgba(107,99,88,0.08)' } }
  const sev = severityMap[severity] || severityMap.concern
  return (
    <div style={{ marginBottom: '1rem', padding: '1rem 1.1rem', background: TOKENS.white, border: `1px solid ${TOKENS.ruleLite}` }}>
      <div style={{ display: 'inline-block', padding: '0.2rem 0.5rem', background: sev.bg, color: sev.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', marginBottom: '0.6rem', fontWeight: 600 }}>{sev.label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontStyle: 'italic', color: TOKENS.ink, lineHeight: 1.45, marginBottom: '0.6rem' }}>"{objection}"</div>
      {what_would_answer_it && (
        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.6rem', borderTop: `1px dashed ${TOKENS.ruleLite}` }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: TOKENS.muted, letterSpacing: '0.1em', flexShrink: 0, paddingTop: '0.1rem' }}>WHAT WOULD ANSWER IT</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: TOKENS.ink }}>{what_would_answer_it}</span>
        </div>
      )}
    </div>
  )
}

function CompetitorCard({ competitor, substitutability_score, line_of_attack, competitor_objection, verbatim_claim, what_they_dont_say, sources, retrieved_at }) {
  const danger = substitutability_score >= 70
  const color = danger ? TOKENS.err : substitutability_score >= 50 ? TOKENS.warn : TOKENS.success
  const hasSources = Array.isArray(sources) && sources.length > 0
  const hostFor = (url) => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }
  return (
    <div style={{ padding: '1.1rem', background: TOKENS.white, border: `1px solid ${TOKENS.ruleLite}`, borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 500 }}>{competitor}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 500, color, lineHeight: 1 }}>{substitutability_score}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: TOKENS.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>substitutability</div>
        </div>
      </div>
      {verbatim_claim?.trim() && (
        <div style={{ marginTop: '0.8rem', padding: '0.6rem 0.7rem', background: TOKENS.paperLite, borderLeft: `2px solid ${color}` }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: TOKENS.muted, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>THEIR OWN POSITIONING</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', fontStyle: 'italic', color: TOKENS.ink, lineHeight: 1.4 }}>"{verbatim_claim}"</div>
        </div>
      )}
      {what_they_dont_say && (
        <div style={{ marginTop: '0.8rem' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: TOKENS.success, letterSpacing: '0.1em', marginBottom: '0.3rem' }}>WHAT THEY DON'T SAY</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: TOKENS.ink, lineHeight: 1.5 }}>{what_they_dont_say}</div>
        </div>
      )}
      <div style={{ marginTop: '0.8rem' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: TOKENS.muted, letterSpacing: '0.1em', marginBottom: '0.3rem' }}>LINE OF ATTACK</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: TOKENS.ink, lineHeight: 1.5 }}>{line_of_attack}</div>
      </div>
      <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: `1px dashed ${TOKENS.ruleLite}` }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: TOKENS.muted, letterSpacing: '0.1em', marginBottom: '0.3rem' }}>BUYER OBJECTION</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontStyle: 'italic', color: TOKENS.ink, lineHeight: 1.4 }}>"{competitor_objection}"</div>
      </div>
      {hasSources && (
        <div style={{ marginTop: '0.9rem', paddingTop: '0.7rem', borderTop: `1px dashed ${TOKENS.ruleLite}` }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: TOKENS.muted, letterSpacing: '0.1em', marginBottom: '0.4rem' }}>SOURCES ({sources.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {sources.slice(0, 5).map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" title={s.title}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: TOKENS.muted, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                onMouseEnter={e => { e.currentTarget.style.color = TOKENS.accent; e.currentTarget.style.textDecoration = 'underline' }}
                onMouseLeave={e => { e.currentTarget.style.color = TOKENS.muted; e.currentTarget.style.textDecoration = 'none' }}>
                <Globe size={10} strokeWidth={1.5} />
                {hostFor(s.url)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ActionItem({ priority, action, rationale }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '0.9rem 0', borderBottom: `1px solid ${TOKENS.ruleLite}` }}>
      <div style={{ flexShrink: 0, width: '32px', height: '32px', background: TOKENS.accent, color: TOKENS.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600 }}>{priority}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 500, color: TOKENS.ink, marginBottom: '0.25rem', lineHeight: 1.4 }}>{action}</div>
        {rationale && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: TOKENS.muted, lineHeight: 1.5 }}>{rationale}</div>}
      </div>
    </div>
  )
}

// ---- EvaluationReport ----

export function EvaluationReport({ evaluation, onBack, onPrint }) {
  const result = evaluation.result
  const meta = personaMeta(evaluation.persona_id)
  const persona = evaluation.persona_snapshot
  const composite = result?.composite_score || 0
  const band = bandFor(composite)
  const weights = ASSET_TYPE_WEIGHTS[evaluation.asset_type] || ASSET_TYPE_WEIGHTS.other

  const dimList = [
    { key: 'persuasion',      label: 'Persuasion',      color: TOKENS.dimPersuasion,      weight: weights.persuasion },
    { key: 'clarity',         label: 'Clarity',         color: TOKENS.dimClarity,         weight: weights.clarity },
    { key: 'differentiation', label: 'Differentiation', color: TOKENS.dimDifferentiation, weight: weights.differentiation },
    { key: 'buyer_fit',       label: 'Buyer Fit',       color: TOKENS.dimBuyerFit,        weight: weights.buyer_fit },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <button onClick={onBack}
          style={{ background: TOKENS.white, border: `1px solid ${TOKENS.rule}`, cursor: 'pointer', color: TOKENS.ink, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = TOKENS.ink; e.currentTarget.style.background = TOKENS.paperLite }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = TOKENS.rule; e.currentTarget.style.background = TOKENS.white }}>
          <ChevronLeft size={14} /> Back to history
        </button>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <Eyebrow color={meta.color}>Evaluation report</Eyebrow>
        <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}><Display size="3xl">{evaluation.asset_title}</Display></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', color: TOKENS.muted, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><FileType size={13} /> {ASSET_TYPE_LABELS[evaluation.asset_type] || evaluation.asset_type}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><PersonaAvatar id={evaluation.persona_id} size={20} />{persona?.identity?.name || meta.label}</span>
          {evaluation.tier && <span>· {evaluation.tier.replace('_', ' ').toUpperCase()}</span>}
          {evaluation.region && <span>· {evaluation.region}</span>}
        </div>
      </div>

      {evaluation.incomplete_sections?.length > 0 && (
        <div style={{ marginBottom: '2rem', padding: '1rem 1.2rem', background: 'rgba(184, 138, 44, 0.08)', border: `1px solid ${TOKENS.warn}`, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: TOKENS.warn, fontWeight: 600 }}><AlertTriangle size={14} /> Partial report</div>
          <div style={{ color: TOKENS.ink, lineHeight: 1.5 }}>Missing: <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem' }}>{evaluation.incomplete_sections.join(', ')}</span>. You can re-run this evaluation to try the missing sections again.</div>
        </div>
      )}

      {/* Headline scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', marginBottom: '2.5rem', padding: '1.8rem', background: band.bg, border: `1px solid ${band.color}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
          <ScoreRing value={composite} color={band.color} size={130} label="composite" />
          <VerdictBadge band={result?.verdict_band || band.label} />
        </div>
        <div>
          <Eyebrow color={band.color}>Headline</Eyebrow>
          <div style={{ marginTop: '0.6rem', marginBottom: '1rem' }}><Display size="xl" italic>{result?.verdict_summary || '—'}</Display></div>
          {result?.biggest_limiter && (
            <div style={{ marginTop: '0.6rem', padding: '0.8rem 0.9rem', background: TOKENS.white, borderLeft: `2px solid ${band.color}` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: TOKENS.muted, letterSpacing: '0.12em', marginBottom: '0.3rem' }}>BIGGEST LIMITER · {result.biggest_limiter.dimension?.toUpperCase()}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: TOKENS.ink, lineHeight: 1.5 }}>{result.biggest_limiter.explanation}</div>
            </div>
          )}
        </div>
      </div>

      {/* Dimensions */}
      <div style={{ marginBottom: '2.5rem' }}>
        <Eyebrow>Four dimensions</Eyebrow>
        <div style={{ marginTop: '0.6rem', marginBottom: '1.4rem' }}><Display size="2xl">Where the asset earns its score.</Display></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '0.9rem' }}>
          {dimList.map(d => {
            const dim = result?.dimensions?.[d.key]
            if (!dim) return null
            return <DimensionBar key={d.key} name={d.label} score={dim.score} weight={d.weight} subfactors={dim.subfactors} color={d.color} />
          })}
        </div>
      </div>

      {/* In-voice reaction */}
      {result?.in_voice_reaction && (
        <div style={{ marginBottom: '2.5rem' }}>
          <Eyebrow color={meta.color}>In their voice</Eyebrow>
          <div style={{ marginTop: '0.6rem', marginBottom: '1.2rem' }}><Display size="2xl">{persona?.identity?.name?.split(' ')[0] || 'The persona'} reacts.</Display></div>
          <div style={{ padding: '1.5rem 1.7rem', background: meta.colorSoft, borderLeft: `3px solid ${meta.color}` }}>
            <Quote size={20} color={meta.color} style={{ marginBottom: '0.6rem' }} />
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontStyle: 'italic', color: TOKENS.ink, lineHeight: 1.5 }}>{result.in_voice_reaction}</div>
          </div>
        </div>
      )}

      {/* Objections */}
      {result?.ranked_objections?.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <Eyebrow>Ranked objections</Eyebrow>
          <div style={{ marginTop: '0.6rem', marginBottom: '1.2rem' }}><Display size="2xl">What would block, concern, or annoy them.</Display></div>
          {result.ranked_objections.map((o, i) => <ObjectionItem key={i} {...o} />)}
        </div>
      )}

      {/* Diagnosis */}
      {result?.diagnosis && (
        <div style={{ marginBottom: '2.5rem' }}>
          <Eyebrow>Diagnosis</Eyebrow>
          <div style={{ marginTop: '0.6rem', marginBottom: '1.2rem' }}><Display size="2xl">What works. What breaks.</Display></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div style={{ padding: '1.2rem', background: TOKENS.white, border: `1px solid ${TOKENS.ruleLite}`, borderTop: `3px solid ${TOKENS.success}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}><Check size={15} color={TOKENS.success} strokeWidth={2.5} /><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: TOKENS.success, letterSpacing: '0.12em', fontWeight: 600 }}>WHAT WORKS</span></div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(result.diagnosis.what_works || []).map((item, i) => <li key={i} style={{ display: 'flex', gap: '0.7rem', fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: TOKENS.ink, lineHeight: 1.55 }}><span style={{ color: TOKENS.accent, flexShrink: 0 }}>—</span><span>{item}</span></li>)}
              </ul>
            </div>
            <div style={{ padding: '1.2rem', background: TOKENS.white, border: `1px solid ${TOKENS.ruleLite}`, borderTop: `3px solid ${TOKENS.err}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}><AlertTriangle size={15} color={TOKENS.err} strokeWidth={2.5} /><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: TOKENS.err, letterSpacing: '0.12em', fontWeight: 600 }}>WHAT BREAKS</span></div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(result.diagnosis.what_breaks || []).map((item, i) => <li key={i} style={{ display: 'flex', gap: '0.7rem', fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: TOKENS.ink, lineHeight: 1.55 }}><span style={{ color: TOKENS.accent, flexShrink: 0 }}>—</span><span>{item}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action items */}
      {result?.action_items?.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <Eyebrow color={TOKENS.accent}>Action guidance</Eyebrow>
          <div style={{ marginTop: '0.6rem', marginBottom: '1.2rem' }}><Display size="2xl">Prioritized revisions.</Display></div>
          <div style={{ background: TOKENS.white, padding: '0.5rem 1.2rem', border: `1px solid ${TOKENS.ruleLite}` }}>
            {result.action_items.sort((a, b) => (a.priority || 99) - (b.priority || 99)).map((a, i) => <ActionItem key={i} {...a} />)}
          </div>
        </div>
      )}

      {/* Competitor differentiation */}
      {result?.competitor_analysis?.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <Eyebrow color={TOKENS.accent}>Competitor differentiation lens</Eyebrow>
          <div style={{ marginTop: '0.6rem', marginBottom: '0.6rem' }}><Display size="2xl">How easily could they have written this?</Display></div>
          <div style={{ marginBottom: '1.2rem', maxWidth: '640px' }}><Body muted size="sm">Substitutability score: 100 means a competitor could have produced this asset verbatim. Lower is better.</Body></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {result.competitor_analysis.map((c, i) => <CompetitorCard key={i} {...c} />)}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ paddingTop: '2rem', borderTop: `1px solid ${TOKENS.rule}`, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: TOKENS.muted, letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <span>Evaluation ID · {evaluation.id}</span>
        <span>{new Date(evaluation.created_at).toLocaleString()}</span>
      </div>
    </motion.div>
  )
}
