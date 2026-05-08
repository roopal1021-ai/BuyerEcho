// src/components/analytics/index.jsx
// AnalyticsScreen with four views:
// 1. AssetPerformanceView — scores by asset title
// 2. AssetTypePerformanceView — avg score by asset type
// 3. PersonaHeatmapView — avg score per persona per dimension
// 4. CompetitorPressureView — avg substitutability per competitor

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, LabelList
} from 'recharts'
import { BarChart3, FileType, Users, Shield, ArrowUpRight } from 'lucide-react'
import { TOKENS, bandFor } from '../../tokens.js'
import { personaMeta, PERSONA_ORDER } from '../../constants/personas.js'
import { ASSET_TYPE_LABELS } from '../../constants/assetTypes.js'
import { Eyebrow, Display, Body, PersonaAvatar } from '../primitives/index.jsx'

const ANALYTICS_TABS = [
  { id: 'assets',      label: 'By asset',            icon: BarChart3 },
  { id: 'asset_types', label: 'By asset type',        icon: FileType },
  { id: 'personas',    label: 'By persona',           icon: Users },
  { id: 'competitors', label: 'Competitor pressure',  icon: Shield },
]

// ---- Tooltip ----
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.rule}`, padding: '0.6rem 0.85rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontSize: '0.78rem', color: TOKENS.muted, marginBottom: '0.3rem' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '0.92rem', fontWeight: 600, color: p.fill || TOKENS.ink }}>{p.value}</div>
      ))}
    </div>
  )
}

// ---- Empty state ----
function EmptyState({ message }) {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: TOKENS.muted, fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>
      {message}
    </div>
  )
}

// ---- 1. AssetPerformanceView ----
function AssetPerformanceView({ evalIndex }) {
  const data = useMemo(() => {
    return [...evalIndex]
      .filter(e => e.composite_score != null)
      .slice(0, 30)
      .reverse()
      .map(e => ({
        name: e.asset_title.length > 28 ? e.asset_title.slice(0, 25) + '...' : e.asset_title,
        fullName: e.asset_title,
        score: e.composite_score,
        band: e.verdict_band || bandFor(e.composite_score).label,
        fill: bandFor(e.composite_score).color,
      }))
  }, [evalIndex])

  if (data.length === 0) return <EmptyState message="No evaluations yet. Run your first evaluation to see analytics." />

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Display size="2xl">Composite score by asset</Display>
        <div style={{ marginTop: '0.4rem' }}><Body muted size="sm">Most recent 30 evaluations, oldest to newest.</Body></div>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(320, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 60, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={TOKENS.ruleLite} strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fill: TOKENS.muted }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={200} tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, fill: TOKENS.ink }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="score" radius={0} maxBarSize={22}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            <LabelList dataKey="score" position="right" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fill: TOKENS.muted }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---- 2. AssetTypePerformanceView ----
function AssetTypePerformanceView({ evalIndex }) {
  const data = useMemo(() => {
    const byType = {}
    for (const e of evalIndex) {
      if (!e.asset_type || e.composite_score == null) continue
      if (!byType[e.asset_type]) byType[e.asset_type] = { total: 0, count: 0 }
      byType[e.asset_type].total += e.composite_score
      byType[e.asset_type].count++
    }
    return Object.entries(byType)
      .map(([type, { total, count }]) => ({
        name: ASSET_TYPE_LABELS[type] || type,
        avg: Math.round(total / count),
        count,
        fill: bandFor(Math.round(total / count)).color,
      }))
      .sort((a, b) => b.avg - a.avg)
  }, [evalIndex])

  if (data.length === 0) return <EmptyState message="Need evaluations across multiple asset types to show this view." />

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Display size="2xl">Average score by asset type</Display>
        <div style={{ marginTop: '0.4rem' }}><Body muted size="sm">Which asset types are performing best for this persona set.</Body></div>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(280, data.length * 48)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 80, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={TOKENS.ruleLite} strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fill: TOKENS.muted }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={180} tick={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fill: TOKENS.ink }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="avg" radius={0} maxBarSize={28}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            <LabelList dataKey="avg" position="right" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fill: TOKENS.muted }} formatter={(v, _, props) => `${v} · n=${props?.count ?? ''}`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---- 3. PersonaHeatmapView ----
function PersonaHeatmapView({ evalIndex, allEvaluations }) {
  const dims = ['persuasion', 'clarity', 'differentiation', 'buyer_fit']
  const dimLabels = { persuasion: 'Persuasion', clarity: 'Clarity', differentiation: 'Differentiation', buyer_fit: 'Buyer Fit' }
  const dimColors = { persuasion: TOKENS.dimPersuasion, clarity: TOKENS.dimClarity, differentiation: TOKENS.dimDifferentiation, buyer_fit: TOKENS.dimBuyerFit }

  const matrix = useMemo(() => {
    // Build { personaId → { dimKey → { total, count } } }
    const agg = {}
    for (const e of allEvaluations) {
      if (!e.result?.dimensions || !e.persona_id) continue
      if (!agg[e.persona_id]) {
        agg[e.persona_id] = {}
        for (const d of dims) agg[e.persona_id][d] = { total: 0, count: 0 }
      }
      for (const d of dims) {
        const score = e.result.dimensions[d]?.score
        if (score != null) { agg[e.persona_id][d].total += score; agg[e.persona_id][d].count++ }
      }
    }
    return agg
  }, [allEvaluations])

  const personas = PERSONA_ORDER.filter(p => matrix[p.id])
  if (personas.length === 0) return <EmptyState message="Need evaluations run to show the persona heatmap." />

  const cellBg = (score) => {
    if (score == null) return TOKENS.ruleLite
    if (score >= 85) return 'rgba(61,107,74,0.18)'
    if (score >= 70) return 'rgba(184,138,44,0.16)'
    if (score >= 55) return 'rgba(163,95,31,0.14)'
    return 'rgba(138,42,26,0.12)'
  }
  const cellColor = (score) => {
    if (score == null) return TOKENS.muted
    return bandFor(score).color
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Display size="2xl">Dimension heatmap by persona</Display>
        <div style={{ marginTop: '0.4rem' }}><Body muted size="sm">Where each persona scores your content hardest. Averages across all evaluations.</Body></div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '560px' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.1em', color: TOKENS.muted, fontWeight: 500, borderBottom: `1px solid ${TOKENS.ruleLite}`, background: TOKENS.paperLite }}>PERSONA</th>
              {dims.map(d => (
                <th key={d} style={{ padding: '0.7rem 1rem', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.1em', color: dimColors[d], fontWeight: 500, borderBottom: `1px solid ${TOKENS.ruleLite}`, background: TOKENS.paperLite }}>{dimLabels[d].toUpperCase()}</th>
              ))}
              <th style={{ padding: '0.7rem 1rem', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.1em', color: TOKENS.muted, fontWeight: 500, borderBottom: `1px solid ${TOKENS.ruleLite}`, background: TOKENS.paperLite }}>EVALS</th>
            </tr>
          </thead>
          <tbody>
            {personas.map((p, pi) => {
              const row = matrix[p.id]
              const evalCount = row ? Math.max(...dims.map(d => row[d]?.count || 0)) : 0
              return (
                <tr key={p.id} style={{ background: pi % 2 === 0 ? TOKENS.white : TOKENS.paperLite }}>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${TOKENS.ruleLite}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <PersonaAvatar id={p.id} size={28} />
                      <div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 500, color: TOKENS.ink }}>{p.label.split(',')[0]}</div>
                      </div>
                    </div>
                  </td>
                  {dims.map(d => {
                    const agg = row?.[d]
                    const avg = agg?.count > 0 ? Math.round(agg.total / agg.count) : null
                    return (
                      <td key={d} style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${TOKENS.ruleLite}`, textAlign: 'center', background: cellBg(avg) }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 500, color: cellColor(avg) }}>
                          {avg != null ? avg : '—'}
                        </span>
                      </td>
                    )
                  })}
                  <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${TOKENS.ruleLite}`, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: TOKENS.muted }}>
                    {evalCount}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- 4. CompetitorPressureView ----
function CompetitorPressureView({ allEvaluations }) {
  const data = useMemo(() => {
    const byComp = {}
    for (const e of allEvaluations) {
      if (!e.result?.competitor_analysis) continue
      for (const c of e.result.competitor_analysis) {
        if (!c.competitor || c.substitutability_score == null) continue
        if (!byComp[c.competitor]) byComp[c.competitor] = { total: 0, count: 0 }
        byComp[c.competitor].total += c.substitutability_score
        byComp[c.competitor].count++
      }
    }
    return Object.entries(byComp)
      .map(([name, { total, count }]) => ({
        name,
        avg: Math.round(total / count),
        count,
        fill: bandFor(100 - Math.round(total / count)).color, // invert for color: high sub = bad = red
      }))
      .sort((a, b) => b.avg - a.avg)
  }, [allEvaluations])

  if (data.length === 0) return <EmptyState message="Run evaluations with competitors selected to see substitutability pressure." />

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Display size="2xl">Competitor substitutability pressure</Display>
        <div style={{ marginTop: '0.4rem' }}><Body muted size="sm">Average substitutability score per competitor across all evaluations. Higher is worse — it means competitors could have written your asset.</Body></div>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(280, data.length * 48)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 80, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={TOKENS.ruleLite} strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fill: TOKENS.muted }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={160} tick={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fill: TOKENS.ink }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="avg" radius={0} maxBarSize={28}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            <LabelList dataKey="avg" position="right" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fill: TOKENS.muted }} formatter={(v, _, props) => `${v} · n=${props?.count ?? ''}`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '1.5rem', padding: '0.9rem 1rem', background: TOKENS.paperLite, border: `1px solid ${TOKENS.ruleLite}`, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: TOKENS.muted, lineHeight: 1.5 }}>
        Substitutability 0–49 = clearly differentiated. 50–69 = overlap risk. 70+ = your asset could be their asset.
      </div>
    </div>
  )
}

// ---- AnalyticsScreen (tab controller) ----
export function AnalyticsScreen({ evalIndex, allEvaluations }) {
  const [tab, setTab] = useState('assets')
  const ActiveTab = { assets: AssetPerformanceView, asset_types: AssetTypePerformanceView, personas: PersonaHeatmapView, competitors: CompetitorPressureView }[tab]

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Eyebrow>Analytics</Eyebrow>
        <div style={{ marginTop: '0.5rem', marginBottom: '0.8rem' }}><Display size="4xl">What the data says.</Display></div>
        <Body muted>Across {evalIndex.length} evaluation{evalIndex.length !== 1 ? 's' : ''}.</Body>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '0.3rem', borderBottom: `1px solid ${TOKENS.rule}`, marginBottom: '2rem', overflowX: 'auto' }}>
        {ANALYTICS_TABS.map(t => {
          const active = tab === t.id
          const TabIcon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background: 'transparent', border: 'none', padding: '0.65rem 1.1rem', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.85rem', fontWeight: active ? 600 : 400, color: active ? TOKENS.ink : TOKENS.muted, borderBottom: active ? `2px solid ${TOKENS.accent}` : '2px solid transparent', marginBottom: '-1px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.15s' }}
              onMouseEnter={e => !active && (e.currentTarget.style.color = TOKENS.ink)}
              onMouseLeave={e => !active && (e.currentTarget.style.color = TOKENS.muted)}>
              <TabIcon size={14} strokeWidth={1.6} />
              {t.label}
            </button>
          )
        })}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <ActiveTab evalIndex={evalIndex} allEvaluations={allEvaluations} />
      </motion.div>
    </div>
  )
}
