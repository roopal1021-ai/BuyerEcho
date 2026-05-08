// src/components/personas/index.jsx
// PersonaCard, PersonaDetail, PersonaLibrary, PersonaReview, EditPersona

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, Edit2, X, Save, FileText, Database, RefreshCw, Play, Check } from 'lucide-react'
import { TOKENS } from '../../tokens.js'
import { personaMeta } from '../../constants/personas.js'
import { PersonaAvatar, Eyebrow, Display, Body, PrimaryButton, GhostButton, Ornament } from '../primitives/index.jsx'

// ---- Shared sub-components ----

function TraitDot({ value, max = 10, color }) {
  const pct = (value / max) * 100
  const fill = color || (value >= 8 ? TOKENS.accent : value >= 5 ? TOKENS.ochre : TOKENS.muted)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: '60px', height: '3px', background: TOKENS.ruleLite }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: fill }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: TOKENS.muted, width: '1rem', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function TraitGrid({ traits, color }) {
  const labels = {
    skepticism: 'Skepticism', risk_tolerance: 'Risk tolerance', technical_fluency: 'Technical fluency',
    jargon_tolerance: 'Jargon tolerance', buzzword_allergy: 'Buzzword allergy', proof_requirement: 'Proof requirement',
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem 2rem' }}>
      {Object.entries(labels).map(([key, label]) => (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0' }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.85rem', color: TOKENS.ink }}>{label}</span>
          <TraitDot value={traits[key]} color={color} />
        </div>
      ))}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: `1px solid ${TOKENS.ruleLite}` }}>
        <Eyebrow>{title}</Eyebrow>
      </div>
      {children}
    </div>
  )
}

function FieldRow({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.5rem', padding: '0.6rem 0', borderBottom: `1px solid ${TOKENS.ruleLite}` }}>
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.78rem', color: TOKENS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '0.1rem' }}>{label}</div>
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.92rem', color: TOKENS.ink, lineHeight: 1.55 }}>{value}</div>
    </div>
  )
}

function ListBlock({ items, ordered = false, italic = false }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: '0.7rem', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.92rem', color: TOKENS.ink, lineHeight: 1.55, fontStyle: italic ? 'italic' : 'normal' }}>
          {ordered && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: TOKENS.muted, flexShrink: 0, paddingTop: '0.2rem', width: '1.4rem' }}>{String(i + 1).padStart(2, '0')}</span>}
          {!ordered && <span style={{ color: TOKENS.accent, flexShrink: 0, paddingTop: '0.1rem' }}>—</span>}
          <span>{item}</span>
        </li>
      ))}
    </ol>
  )
}

// ---- PersonaCard ----

export function PersonaCard({ persona, index, onView, compact = false }) {
  const meta = personaMeta(persona.persona_id)
  const traits = persona.disposition_traits
  const topObjection = persona.objection_library?.stock_objections?.[0]
  const name = persona.identity?.name
  const summary = persona.identity?.professional_summary

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ y: -2 }}
      style={{
        background: TOKENS.paperLite, border: `1px solid ${TOKENS.ruleLite}`,
        borderTop: `3px solid ${meta.color}`,
        padding: compact ? '1.4rem' : '1.8rem',
        cursor: onView ? 'pointer' : 'default',
        transition: 'all 0.2s', position: 'relative',
      }}
      onClick={onView}
      onMouseEnter={e => onView && (e.currentTarget.style.borderColor = meta.color)}
      onMouseLeave={e => onView && (e.currentTarget.style.borderColor = TOKENS.ruleLite)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <PersonaAvatar id={persona.persona_id} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow color={meta.color}>{`Persona 0${index + 1} · ${meta.label.split(',')[0]}`}</Eyebrow>
          <div style={{ marginTop: '0.4rem' }}><Display size="xl">{name || persona.role_label}</Display></div>
          {summary && <div style={{ marginTop: '0.4rem', maxWidth: '32em' }}><Body size="sm" muted>{summary}</Body></div>}
        </div>
      </div>

      {topObjection && !compact && (
        <div style={{ padding: '0.9rem 1rem', borderLeft: `2px solid ${meta.color}`, background: meta.colorSoft, marginBottom: '1.2rem', fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontStyle: 'italic', color: TOKENS.ink, lineHeight: 1.5 }}>
          "{topObjection}"
        </div>
      )}

      {!compact && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', marginBottom: '1rem' }}>
          {[['skepticism', traits.skepticism], ['proof req.', traits.proof_requirement], ['jargon tol.', traits.jargon_tolerance], ['buzzword allergy', traits.buzzword_allergy]].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.75rem', color: TOKENS.muted }}>{label}</span>
              <TraitDot value={value} color={meta.color} />
            </div>
          ))}
        </div>
      )}

      {onView && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.78rem', color: meta.color, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            View profile <ArrowRight size={12} />
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ---- PersonaDetail ----

export function PersonaDetail({ persona, version, readOnly = false, onBack, onEdit, onPrint }) {
  const meta = personaMeta(persona.persona_id)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={onBack}
        style={{ background: TOKENS.white, border: `1px solid ${TOKENS.rule}`, cursor: 'pointer', color: TOKENS.ink, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', padding: '0.5rem 0.85rem', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = TOKENS.ink; e.currentTarget.style.background = TOKENS.paperLite }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = TOKENS.rule; e.currentTarget.style.background = TOKENS.white }}>
        <ChevronLeft size={14} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', flex: 1 }}>
          <PersonaAvatar id={persona.persona_id} size={56} />
          <div>
            <Eyebrow color={meta.color}>Persona profile · Version {version}</Eyebrow>
            <div style={{ marginTop: '0.4rem', marginBottom: '0.4rem' }}><Display size="3xl">{persona.identity?.name || persona.role_label}</Display></div>
            <div style={{ marginBottom: '0.5rem' }}><Body size="sm" muted>{meta.label}</Body></div>
            {persona.identity?.professional_summary && <div style={{ maxWidth: '36em' }}><Body>{persona.identity.professional_summary}</Body></div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onPrint && <GhostButton onClick={() => onPrint(persona)} icon={FileText}>Download PDF</GhostButton>}
          {!readOnly && onEdit && <GhostButton onClick={onEdit} icon={Edit2}>Edit profile</GhostButton>}
        </div>
      </div>

      <Section title="Identity">
        <FieldRow label="Role title" value={persona.identity.role_title} />
        <FieldRow label="Tenure" value={persona.identity.years_in_role_range} />
        <FieldRow label="Career background" value={persona.identity.career_background} />
        <FieldRow label="Reporting line" value={persona.identity.reporting_line} />
      </Section>

      <Section title="Mandate & KPIs">
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: TOKENS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Primary KPIs</div>
          <ListBlock items={persona.mandate_and_kpis.primary_kpis} ordered />
        </div>
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: TOKENS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Secondary KPIs</div>
          <ListBlock items={persona.mandate_and_kpis.secondary_kpis} />
        </div>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: TOKENS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Current year priorities</div>
          <ListBlock items={persona.mandate_and_kpis.current_year_priorities} />
        </div>
      </Section>

      <Section title="Disposition traits"><TraitGrid traits={persona.disposition_traits} color={meta.color} /></Section>

      <Section title="Stock objections — in their voice"><ListBlock items={persona.objection_library.stock_objections} ordered italic /></Section>
      <Section title="Pet peeves"><ListBlock items={persona.objection_library.pet_peeves} /></Section>

      <Section title="Vocabulary">
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: TOKENS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Preferred terminology</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {persona.vocabulary.preferred_terminology.map((t, i) => (
              <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: TOKENS.ink, padding: '0.3rem 0.6rem', border: `1px solid ${TOKENS.rule}`, background: TOKENS.paperLite }}>{t}</span>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: meta.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Forbidden terms</div>
          <div style={{ padding: '1rem', background: meta.colorSoft, border: `1px solid ${meta.color}`, fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontStyle: 'italic', color: meta.color }}>
            "{persona.vocabulary.forbidden_terms[0]}"
          </div>
          <div style={{ marginTop: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {persona.vocabulary.forbidden_terms.slice(1).map((t, i) => (
              <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: TOKENS.muted, padding: '0.3rem 0.6rem', border: `1px solid ${TOKENS.ruleLite}`, textDecoration: 'line-through' }}>{t}</span>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Context modulators — Tier sensitivity">
        <FieldRow label="Tier 1" value={persona.context_modulators.tier_sensitivity.tier_1} />
        <FieldRow label="Tier 2" value={persona.context_modulators.tier_sensitivity.tier_2} />
        <FieldRow label="Tier 3" value={persona.context_modulators.tier_sensitivity.tier_3} />
      </Section>
      <Section title="Context modulators — Region sensitivity">
        <FieldRow label="AMER" value={persona.context_modulators.region_sensitivity.AMER} />
        <FieldRow label="EMEA" value={persona.context_modulators.region_sensitivity.EMEA} />
        <FieldRow label="APAC" value={persona.context_modulators.region_sensitivity.APAC} />
      </Section>
    </motion.div>
  )
}

// ---- PersonaReview ----

export function PersonaReview({ personas, onSave, onSelectView, viewing }) {
  if (viewing) return <PersonaDetail persona={viewing} version={1} readOnly onBack={() => onSelectView(null)} />
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '2.5rem' }}>
        <Eyebrow color={TOKENS.success}>Panel loaded</Eyebrow>
        <div style={{ marginTop: '0.6rem', marginBottom: '1.2rem' }}><Display size="4xl">Meet your <em style={{ color: TOKENS.accent, fontWeight: 500 }}>panel</em>.</Display></div>
        <div style={{ maxWidth: '640px', marginBottom: '1.8rem' }}>
          <Body muted size="lg">Five buyer archetypes from the validated panel. Click any to read the full profile. When you're satisfied, save them as version 1.</Body>
        </div>
        <Ornament />
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
        {personas.map((p, i) => <PersonaCard key={p.persona_id} persona={p} index={i} onView={() => onSelectView(p)} />)}
      </div>
      <div style={{ borderTop: `1px solid ${TOKENS.rule}`, paddingTop: '1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Body muted size="sm">Saving will write five persona records as version 1. This is your starting baseline.</Body>
        <PrimaryButton onClick={onSave} icon={Check}>Save as version 1</PrimaryButton>
      </div>
    </div>
  )
}

// ---- PersonaLibrary ----

export function PersonaLibrary({ personas, onSelectView, onReset, onNewEval, onExport, appState, evalCount, showBackupReminder, onDismissBackupReminder }) {
  const evalsSinceExport = (appState && appState.evals_since_last_export) || 0
  const showReminder = showBackupReminder && evalCount >= 3 && evalsSinceExport >= 5
  const importedFrom = appState?.imported_from_export_dated
  const lastExport = appState?.last_export_at

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {showReminder && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '1.5rem', padding: '0.85rem 1.1rem', background: 'rgba(184, 138, 44, 0.08)', border: `1px solid ${TOKENS.warn}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: TOKENS.ink }}>
            You've run {evalsSinceExport} evaluations since your last export. Download a backup so you don't lose them.
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onExport} style={{ background: TOKENS.ink, color: TOKENS.paper, border: 'none', padding: '0.4rem 0.85rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Export now</button>
            <button onClick={onDismissBackupReminder} style={{ background: 'transparent', border: `1px solid ${TOKENS.rule}`, padding: '0.4rem 0.85rem', fontSize: '0.78rem', cursor: 'pointer', color: TOKENS.muted, fontFamily: "'Inter', sans-serif" }}>Dismiss</button>
          </div>
        </motion.div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <Eyebrow>Persona library</Eyebrow>
          <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}><Display size="4xl">Your buyer panel.</Display></div>
          <div style={{ maxWidth: '560px' }}><Body muted>Five buyer archetypes saved as version 1. Click any persona to view the full profile or to make edits.</Body></div>
          {(importedFrom || lastExport) && (
            <div style={{ marginTop: '0.8rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: TOKENS.muted }}>
              {importedFrom && <div>imported from export of {new Date(importedFrom).toLocaleString()}</div>}
              {lastExport && <div>last export: {new Date(lastExport).toLocaleString()}</div>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <PrimaryButton onClick={onNewEval} icon={Play}>New evaluation</PrimaryButton>
          <GhostButton onClick={onExport} icon={Database}>Export data</GhostButton>
          <GhostButton onClick={onReset} icon={RefreshCw} danger>Reset</GhostButton>
        </div>
      </div>
      <Ornament />
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.2rem' }}>
        {personas.map((p, i) => <PersonaCard key={p.persona_id} persona={p} index={i} onView={() => onSelectView(p)} />)}
      </div>
    </div>
  )
}

// ---- EditPersona ----

export function EditPersona({ persona, onCancel, onSave }) {
  const [draft, setDraft] = useState(JSON.parse(JSON.stringify(persona)))
  const [saving, setSaving] = useState(false)
  const meta = personaMeta(persona.persona_id)

  const updateTrait = (key, value) => {
    const v = Math.max(1, Math.min(10, parseInt(value || 0, 10)))
    setDraft({ ...draft, disposition_traits: { ...draft.disposition_traits, [key]: v } })
  }

  const updateArrayItem = (path, idx, value) => {
    const next = JSON.parse(JSON.stringify(draft))
    const parts = path.split('.')
    let obj = next
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]
    obj[parts[parts.length - 1]][idx] = value
    setDraft(next)
  }
  const addArrayItem = (path) => {
    const next = JSON.parse(JSON.stringify(draft))
    const parts = path.split('.')
    let obj = next
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]
    obj[parts[parts.length - 1]].push('')
    setDraft(next)
  }
  const removeArrayItem = (path, idx) => {
    const next = JSON.parse(JSON.stringify(draft))
    const parts = path.split('.')
    let obj = next
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]
    obj[parts[parts.length - 1]].splice(idx, 1)
    setDraft(next)
  }

  const handleSave = async () => { setSaving(true); await onSave(draft); setSaving(false) }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={onCancel}
        style={{ background: TOKENS.white, border: `1px solid ${TOKENS.rule}`, cursor: 'pointer', color: TOKENS.ink, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', padding: '0.5rem 0.85rem', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = TOKENS.ink; e.currentTarget.style.background = TOKENS.paperLite }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = TOKENS.rule; e.currentTarget.style.background = TOKENS.white }}>
        <ChevronLeft size={14} /> Cancel
      </button>

      <Eyebrow color={meta.color}>Editing</Eyebrow>
      <div style={{ marginTop: '0.4rem' }}><Display size="3xl">{draft.identity?.name || persona.role_label}</Display></div>
      <div style={{ marginTop: '0.6rem', maxWidth: '640px', marginBottom: '2rem' }}>
        <Body muted size="sm">Saving will create a new version of this persona. The previous version is preserved.</Body>
      </div>

      <Section title="Name">
        <input type="text" value={draft.identity?.name || ''} onChange={e => setDraft({ ...draft, identity: { ...draft.identity, name: e.target.value } })}
          style={{ width: '100%', padding: '0.7rem 0.9rem', border: `1px solid ${TOKENS.rule}`, background: TOKENS.paperLite, fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', color: TOKENS.ink }} />
      </Section>

      <Section title="Disposition traits">
        <Body muted size="sm">All values 1–10.</Body>
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem 2rem' }}>
          {Object.entries(draft.disposition_traits).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0' }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: TOKENS.ink }}>{key.replace(/_/g, ' ')}</label>
              <input type="number" min={1} max={10} value={value} onChange={e => updateTrait(key, e.target.value)}
                style={{ width: '60px', textAlign: 'center', padding: '0.4rem', border: `1px solid ${TOKENS.rule}`, background: TOKENS.paperLite, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: TOKENS.ink }} />
            </div>
          ))}
        </div>
      </Section>

      {[
        ['mandate_and_kpis.primary_kpis', 'Primary KPIs'],
        ['objection_library.stock_objections', 'Stock objections'],
        ['objection_library.pet_peeves', 'Pet peeves'],
        ['vocabulary.forbidden_terms', 'Forbidden terms'],
      ].map(([path, label]) => {
        const parts = path.split('.')
        let arr = draft
        for (const p of parts) arr = arr[p]
        return (
          <Section key={path} title={label}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {arr.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" value={item} onChange={e => updateArrayItem(path, i, e.target.value)}
                    style={{ flex: 1, padding: '0.55rem 0.8rem', border: `1px solid ${TOKENS.rule}`, background: TOKENS.paperLite, fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: TOKENS.ink }} />
                  <button onClick={() => removeArrayItem(path, i)} style={{ padding: '0 0.7rem', border: `1px solid ${TOKENS.rule}`, background: 'transparent', cursor: 'pointer', color: TOKENS.muted }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => addArrayItem(path)} style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: TOKENS.muted, background: 'transparent', border: `1px dashed ${TOKENS.rule}`, cursor: 'pointer' }}>+ Add item</button>
            </div>
          </Section>
        )
      })}

      <div style={{ borderTop: `1px solid ${TOKENS.rule}`, paddingTop: '1.5rem', marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
        <GhostButton onClick={onCancel}>Cancel</GhostButton>
        <PrimaryButton onClick={handleSave} disabled={saving} icon={Save}>{saving ? 'Saving...' : 'Save as new version'}</PrimaryButton>
      </div>
    </motion.div>
  )
}
