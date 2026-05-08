// src/components/layout/index.jsx

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, AlertCircle, Loader2, ChevronLeft, ChevronRight, Database, RefreshCw, Plus, Upload, X, History, Users, BarChart3 } from 'lucide-react'
import { TOKENS } from '../../tokens.js'
import { bandFor } from '../../tokens.js'
import { PERSONA_ORDER } from '../../constants/personas.js'
import { ASSET_TYPE_LABELS } from '../../constants/assetTypes.js'
import { personaMeta } from '../../constants/personas.js'
import { readFileAsText } from '../../lib/fileExtraction.js'
import { Logo, Eyebrow, Display, Body, PrimaryButton, GhostButton, Ornament, StorageIndicator, PersonaAvatar } from '../primitives/index.jsx'

// ---- AppHeader ----

export function AppHeader({ keyCount, currentTab, onTab }) {
  const tabs = [
    { id: 'personas',  label: 'Personas',       icon: Users },
    { id: 'evaluate',  label: 'New evaluation',  icon: Plus },
    { id: 'analytics', label: 'Analytics',       icon: BarChart3 },
    { id: 'history',   label: 'History',         icon: History },
  ]
  return (
    <header style={{ borderBottom: `1px solid ${TOKENS.rule}`, padding: '0.9rem 2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', gap: '1rem', flexWrap: 'wrap', background: TOKENS.paperLite }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', paddingBottom: '0.9rem' }}>
        <Logo size="md" />
        <nav style={{ display: 'flex', gap: '0.3rem' }}>
          {tabs.map(t => {
            const active = currentTab === t.id
            const TabIcon = t.icon
            return (
              <button key={t.id} onClick={() => onTab(t.id)}
                style={{ background: 'transparent', border: 'none', padding: '0.5rem 0.9rem', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.85rem', fontWeight: active ? 600 : 400, color: active ? TOKENS.ink : TOKENS.muted, borderBottom: active ? `2px solid ${TOKENS.accent}` : '2px solid transparent', marginBottom: '-1px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.15s' }}
                onMouseEnter={e => !active && (e.currentTarget.style.color = TOKENS.ink)}
                onMouseLeave={e => !active && (e.currentTarget.style.color = TOKENS.muted)}
              >
                <TabIcon size={14} strokeWidth={1.6} />
                {t.label}
              </button>
            )
          })}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingBottom: '0.9rem' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: TOKENS.muted }}>v1.0</span>
        <StorageIndicator keyCount={keyCount} />
      </div>
    </header>
  )
}

// ---- WelcomeScreen ----

export function WelcomeScreen({ onStart, onImport }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
      style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: '1.5rem' }}>
          <Eyebrow color={TOKENS.accent}>First run</Eyebrow>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} style={{ marginBottom: '1.8rem' }}>
          <Logo size="lg" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
          <Display size="4xl">A tough room of <em style={{ color: TOKENS.accent, fontWeight: 500 }}>five</em><br />for your marketing copy.</Display>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.6 }} style={{ marginTop: '1.8rem', marginBottom: '2.4rem', maxWidth: '520px' }}>
          <Body size="lg" muted>Before you can evaluate anything, BuyerEcho needs to assemble your buyer panel — five synthetic personas representing the executives who actually decide whether to read, share, or ignore your work.</Body>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }} style={{ marginBottom: '2rem' }}>
          <Ornament />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2.4rem' }}>
          {PERSONA_ORDER.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.9rem', color: TOKENS.ink }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: TOKENS.muted, width: '1.5rem' }}>0{i + 1}</span>
              <p.icon size={15} strokeWidth={1.5} color={p.color} />
              <span>{p.label}</span>
            </div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
          <PrimaryButton onClick={onStart} icon={ArrowRight}>Generate the panel</PrimaryButton>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: `1px solid ${TOKENS.ruleLite}`, maxWidth: '440px' }}>
          <button onClick={onImport}
            style={{ background: 'transparent', border: 'none', color: TOKENS.muted, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.85rem', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'underline', textUnderlineOffset: '0.2em' }}
            onMouseEnter={e => e.currentTarget.style.color = TOKENS.ink}
            onMouseLeave={e => e.currentTarget.style.color = TOKENS.muted}>
            I have a previous export — import it instead
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ---- ImportScreen ----

export function ImportScreen({ onCancel, onImport }) {
  const [jsonText, setJsonText] = useState('')
  const [file, setFile] = useState(null)
  const [parsedSummary, setParsedSummary] = useState(null)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const tryPreview = (text) => {
    try {
      const parsed = JSON.parse(text)
      if (parsed.buyerecho_export_version !== '1.0') { setError('Not a BuyerEcho export (version mismatch).'); setParsedSummary(null); return }
      setError(null)
      setParsedSummary({ personas: parsed.personas?.length || 0, evaluations: parsed.evaluations?.length || 0, audit: parsed.audit_log?.length || 0, exported_at: parsed.exported_at })
    } catch (e) { setError('Not valid JSON: ' + e.message); setParsedSummary(null) }
  }

  const handleTextChange = (text) => {
    setJsonText(text)
    if (text.trim()) tryPreview(text)
    else { setError(null); setParsedSummary(null) }
  }

  const handleFile = async (f) => {
    if (!f) return
    setFile(f)
    try { const text = await readFileAsText(f); handleTextChange(text) }
    catch (e) { setError('Could not read file: ' + e.message) }
  }

  const handleImport = async () => {
    if (!jsonText.trim() || !parsedSummary) return
    setImporting(true)
    try { await onImport(jsonText) }
    catch (e) { setError(e.message); setImporting(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ minHeight: '85vh', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <button onClick={onCancel}
          style={{ background: TOKENS.white, border: `1px solid ${TOKENS.rule}`, cursor: 'pointer', color: TOKENS.ink, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', padding: '0.5rem 0.85rem', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = TOKENS.ink; e.currentTarget.style.background = TOKENS.paperLite }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = TOKENS.rule; e.currentTarget.style.background = TOKENS.white }}>
          <ChevronLeft size={14} /> Back to welcome
        </button>
        <Eyebrow color={TOKENS.accent}>Import</Eyebrow>
        <div style={{ marginTop: '0.6rem', marginBottom: '1.5rem' }}><Display size="3xl">Restore from a previous export.</Display></div>
        <div style={{ marginBottom: '2rem' }}><Body muted>Paste the contents of a BuyerEcho export JSON file, or drop the file.</Body></div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
            <button onClick={() => inputRef.current?.click()}
              style={{ padding: '0.5rem 0.9rem', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', border: `1px solid ${TOKENS.rule}`, background: TOKENS.white, color: TOKENS.ink, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Upload size={13} /> Choose file
            </button>
            <input ref={inputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
            {file && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: TOKENS.muted, display: 'inline-flex', alignItems: 'center' }}>{file.name}</span>}
          </div>
          <textarea value={jsonText} onChange={e => handleTextChange(e.target.value)} placeholder="Or paste your export JSON here..." rows={10}
            style={{ width: '100%', padding: '0.8rem 0.9rem', border: `1px solid ${TOKENS.rule}`, background: TOKENS.white, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: TOKENS.ink, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        {parsedSummary && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem 1.2rem', background: 'rgba(61, 107, 74, 0.06)', border: `1px solid ${TOKENS.success}`, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', color: TOKENS.success, fontWeight: 600 }}>
              <Check size={14} strokeWidth={2.5} /> Valid export detected
            </div>
            <div style={{ color: TOKENS.ink, lineHeight: 1.6 }}>
              <div>Personas: <strong>{parsedSummary.personas}</strong></div>
              <div>Evaluations: <strong>{parsedSummary.evaluations}</strong></div>
              {parsedSummary.exported_at && <div style={{ marginTop: '0.5rem', color: TOKENS.muted, fontSize: '0.78rem' }}>Exported on: {new Date(parsedSummary.exported_at).toLocaleString()}</div>}
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.9rem 1rem', background: 'rgba(138, 42, 26, 0.06)', border: `1px solid ${TOKENS.err}`, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: TOKENS.err }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={14} /> {error}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton onClick={handleImport} disabled={!parsedSummary || importing} icon={Check}>{importing ? 'Importing...' : 'Import & continue'}</PrimaryButton>
        </div>
      </div>
    </motion.div>
  )
}

// ---- BootstrapProgress ----

export function BootstrapProgress({ states }) {
  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <Eyebrow color={TOKENS.accent}>Assembling your panel</Eyebrow>
        <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          <Display size="3xl">Loading the validated panel.<br /><em style={{ color: TOKENS.muted, fontWeight: 400 }}>One persona at a time.</em></Display>
        </div>
        <Ornament />
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {PERSONA_ORDER.map((p, i) => {
            const state = states[i] || 'pending'
            const Icon = p.icon
            return (
              <motion.div key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem', background: TOKENS.paperLite, border: `1px solid ${state === 'active' ? p.color : TOKENS.ruleLite}`, fontFamily: "'Inter', system-ui, sans-serif" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: TOKENS.muted, width: '1.5rem' }}>0{i + 1}</span>
                <Icon size={16} strokeWidth={1.5} color={p.color} />
                <span style={{ flex: 1, fontSize: '0.9rem', color: TOKENS.ink }}>{p.label}</span>
                {state === 'pending' && <span style={{ fontSize: '0.78rem', color: TOKENS.mutedLite }}>queued</span>}
                {state === 'active' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: p.color }}><Loader2 size={12} className="animate-spin" /> loading</span>}
                {state === 'done' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: TOKENS.success }}><Check size={13} strokeWidth={2} /> ready</span>}
                {state === 'error' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: TOKENS.err }}><AlertCircle size={13} strokeWidth={2} /> failed</span>}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---- EvaluationHistory ----

export function EvaluationHistory({ evalIndex, personas, onSelect, onNewEval, onBack, onDelete }) {
  const BackButton = () => (
    <button onClick={onBack}
      style={{ background: TOKENS.white, border: `1px solid ${TOKENS.rule}`, cursor: 'pointer', color: TOKENS.ink, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', padding: '0.5rem 0.85rem', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = TOKENS.ink; e.currentTarget.style.background = TOKENS.paperLite }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = TOKENS.rule; e.currentTarget.style.background = TOKENS.white }}>
      <ChevronLeft size={14} /> Back to personas
    </button>
  )

  if (!evalIndex || evalIndex.length === 0) {
    return (
      <div style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <BackButton />
        <Eyebrow>History</Eyebrow>
        <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}><Display size="3xl">No evaluations yet.</Display></div>
        <div style={{ marginBottom: '2rem', maxWidth: '560px' }}><Body muted>Run your first evaluation to see it here.</Body></div>
        <PrimaryButton onClick={onNewEval} icon={Plus}>Start your first evaluation</PrimaryButton>
      </div>
    )
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <BackButton />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <Eyebrow>History</Eyebrow>
          <div style={{ marginTop: '0.5rem' }}><Display size="4xl">Past evaluations.</Display></div>
        </div>
        <PrimaryButton onClick={onNewEval} icon={Plus}>New evaluation</PrimaryButton>
      </div>
      <Ornament />
      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {evalIndex.map((e, i) => {
          const meta = personaMeta(e.persona_id)
          const band = bandFor(e.composite_score || 0)
          return (
            <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(e.id)} whileHover={{ x: 2 }}
              style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', gap: '1rem', alignItems: 'center', padding: '1rem 1.2rem', background: TOKENS.white, border: `1px solid ${TOKENS.ruleLite}`, borderLeft: `3px solid ${meta.color}`, cursor: 'pointer', transition: 'all 0.15s' }}>
              <PersonaAvatar id={e.persona_id} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 500, color: TOKENS.ink, lineHeight: 1.2 }}>{e.asset_title}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: TOKENS.muted, marginTop: '0.2rem', display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                  <span>{ASSET_TYPE_LABELS[e.asset_type] || e.asset_type}</span>
                  <span>·</span>
                  <span>{meta.label.split(',')[0]}</span>
                  <span>·</span>
                  <span>{new Date(e.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', fontWeight: 500, color: band.color, lineHeight: 1 }}>{e.composite_score}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: TOKENS.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.15rem' }}>{e.verdict_band}</div>
              </div>
              <button onClick={(ev) => { ev.stopPropagation(); onDelete && onDelete(e.id, e.asset_title) }}
                style={{ background: 'transparent', border: '1px solid transparent', cursor: 'pointer', padding: '0.35rem 0.45rem', color: TOKENS.mutedLite, transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={(ev) => { ev.currentTarget.style.color = TOKENS.err; ev.currentTarget.style.borderColor = TOKENS.ruleLite }}
                onMouseLeave={(ev) => { ev.currentTarget.style.color = TOKENS.mutedLite; ev.currentTarget.style.borderColor = 'transparent' }}>
                <X size={14} strokeWidth={1.6} />
              </button>
              <ChevronRight size={16} color={TOKENS.muted} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
