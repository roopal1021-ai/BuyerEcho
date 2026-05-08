// src/components/evaluation/Form.jsx

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, FileText, Upload, Play, Check, AlertCircle, Loader2 } from 'lucide-react'
import { TOKENS } from '../../tokens.js'
import { personaMeta } from '../../constants/personas.js'
import { ASSET_TYPE_OPTIONS, LINE_OF_BUSINESS_OPTIONS, COMPETITOR_OPTIONS } from '../../constants/assetTypes.js'
import { extractTextFromFile } from '../../lib/fileExtraction.js'
import { Eyebrow, Display, Body, PrimaryButton, GhostButton, PersonaAvatar } from '../primitives/index.jsx'

function FormField({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.45rem' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 500, color: TOKENS.ink }}>{label}</span>
        {required && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: TOKENS.accent, letterSpacing: '0.1em' }}>REQUIRED</span>}
        {!required && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: TOKENS.mutedLite, letterSpacing: '0.1em' }}>OPTIONAL</span>}
      </div>
      {hint && <div style={{ marginBottom: '0.5rem' }}><Body size="sm" muted>{hint}</Body></div>}
      {children}
    </div>
  )
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '0.7rem 0.9rem', border: `1px solid ${TOKENS.rule}`, background: TOKENS.white, fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: TOKENS.ink, appearance: 'none', backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 fill=%22%236b6358%22><path d=%22M3 5l3 3 3-3z%22/></svg>')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', paddingRight: '2rem' }}>
      <option value="">{placeholder}</option>
      {options.map(opt => typeof opt === 'string' ? <option key={opt} value={opt}>{opt}</option> : <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  )
}

function ChipMultiSelect({ values, onChange, options, max }) {
  const toggle = (opt) => {
    if (values.includes(opt)) onChange(values.filter(v => v !== opt))
    else if (!max || values.length < max) onChange([...values, opt])
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
      {options.map(opt => {
        const active = values.includes(opt)
        const disabled = !active && max && values.length >= max
        return (
          <button key={opt} onClick={() => !disabled && toggle(opt)} disabled={disabled}
            style={{ padding: '0.45rem 0.8rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', border: `1px solid ${active ? TOKENS.accent : TOKENS.rule}`, background: active ? TOKENS.accent : (disabled ? TOKENS.paperLite : TOKENS.white), color: active ? TOKENS.paper : (disabled ? TOKENS.mutedLite : TOKENS.ink), cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
            {active && <Check size={11} strokeWidth={2.5} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />}
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function PersonaPicker({ personas, value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
      {personas.map(p => {
        const meta = personaMeta(p.persona_id)
        const active = value === p.persona_id
        return (
          <button key={p.persona_id} onClick={() => onChange(p.persona_id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.8rem 1rem', border: `1px solid ${active ? meta.color : TOKENS.rule}`, borderTop: `3px solid ${meta.color}`, background: active ? meta.colorSoft : TOKENS.white, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <PersonaAvatar id={p.persona_id} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 500, color: TOKENS.ink, lineHeight: 1.1 }}>{p.identity?.name || p.role_label}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: TOKENS.muted, marginTop: '0.15rem' }}>{meta.label.split(',')[0]}</div>
            </div>
            {active && <Check size={14} strokeWidth={2.5} color={meta.color} />}
          </button>
        )
      })}
    </div>
  )
}

function FileDropZone({ onFile, file }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const handleFiles = (files) => { if (!files || files.length === 0) return; onFile(files[0]) }
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      onClick={() => inputRef.current?.click()}
      style={{ border: `1.5px dashed ${dragging ? TOKENS.accent : TOKENS.rule}`, background: dragging ? TOKENS.paperLite : TOKENS.white, padding: '2rem 1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
      <input type="file" ref={inputRef} accept=".txt,.md,.markdown,.pdf,.docx" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      {file ? (
        <div>
          <FileText size={24} color={TOKENS.success} style={{ margin: '0 auto 0.6rem' }} />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: TOKENS.ink }}>{file.name}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: TOKENS.muted, marginTop: '0.2rem' }}>{(file.size / 1024).toFixed(1)} KB · click to replace</div>
        </div>
      ) : (
        <div>
          <Upload size={20} color={TOKENS.muted} style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: TOKENS.ink, marginBottom: '0.3rem' }}>Drop a file or click to browse</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: TOKENS.muted }}>PDF · DOCX · TXT · MD</div>
        </div>
      )}
    </div>
  )
}

export function EvaluationForm({ personas, onCancel, onSubmit }) {
  const [assetTitle, setAssetTitle] = useState('')
  const [assetType, setAssetType] = useState('')
  const [personaId, setPersonaId] = useState('')
  const [sourceMode, setSourceMode] = useState('paste')
  const [pastedText, setPastedText] = useState('')
  const [file, setFile] = useState(null)
  const [tier, setTier] = useState('')
  const [region, setRegion] = useState('')
  const [lineOfBusiness, setLineOfBusiness] = useState('')
  const [competitors, setCompetitors] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [fileError, setFileError] = useState(null)

  const canSubmit = !submitting && !extracting && assetTitle.trim() && assetType && personaId &&
    ((sourceMode === 'paste' && pastedText.trim().length > 50) || (sourceMode === 'file' && file))

  const handleSubmit = async () => {
    if (submitting || extracting) return
    setFileError(null)
    let text = pastedText
    if (sourceMode === 'file' && file) {
      setExtracting(true)
      try { text = await extractTextFromFile(file) }
      catch (e) { setFileError('Could not read the file: ' + (e.message || String(e))); setExtracting(false); return }
      setExtracting(false)
      if (!text || text.trim().length < 50) { setFileError(`The extracted text is too short (${text ? text.trim().length : 0} characters).`); return }
    }
    setSubmitting(true)
    onSubmit({ asset_title: assetTitle.trim(), asset_type: assetType, asset_text: text, persona_id: personaId, tier: tier || null, region: region || null, line_of_business: lineOfBusiness || null, competitors })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={onCancel}
        style={{ background: TOKENS.white, border: `1px solid ${TOKENS.rule}`, cursor: 'pointer', color: TOKENS.ink, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', padding: '0.5rem 0.85rem', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = TOKENS.ink; e.currentTarget.style.background = TOKENS.paperLite }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = TOKENS.rule; e.currentTarget.style.background = TOKENS.white }}>
        <ChevronLeft size={14} /> Back to personas
      </button>

      <Eyebrow color={TOKENS.accent}>New evaluation</Eyebrow>
      <div style={{ marginTop: '0.6rem', marginBottom: '0.8rem' }}><Display size="4xl">Run an asset through the panel.</Display></div>
      <div style={{ maxWidth: '640px', marginBottom: '2rem' }}>
        <Body muted>The evaluation runs in multiple stages — dimension scoring, in-voice reaction, ranked objections, action guidance, and (if competitors are selected) a per-competitor differentiation lens with live web research. Total time: about 60 seconds without competitors, up to 2-3 minutes with three competitors selected.</Body>
      </div>

      <div style={{ marginTop: '2.5rem', background: TOKENS.white, padding: '2rem', border: `1px solid ${TOKENS.ruleLite}` }}>
        <FormField label="Asset title" required hint="A short label so you can find this evaluation later.">
          <input type="text" value={assetTitle} onChange={e => setAssetTitle(e.target.value)} placeholder="e.g. Q4 Federato Battle Card v3"
            style={{ width: '100%', padding: '0.7rem 0.9rem', border: `1px solid ${TOKENS.rule}`, background: TOKENS.white, fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: TOKENS.ink }} />
        </FormField>

        <FormField label="Asset type" required hint="The type of asset shapes how it's scored.">
          <Select value={assetType} onChange={setAssetType} options={ASSET_TYPE_OPTIONS} placeholder="Choose an asset type..." />
        </FormField>

        <FormField label="Asset content" required hint="Paste the asset text or upload a file (.txt, .md, .pdf, .docx).">
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
            {[{ id: 'paste', label: 'Paste text' }, { id: 'file', label: 'Upload file' }].map(opt => (
              <button key={opt.id} onClick={() => setSourceMode(opt.id)}
                style={{ padding: '0.45rem 0.9rem', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', border: `1px solid ${sourceMode === opt.id ? TOKENS.ink : TOKENS.rule}`, background: sourceMode === opt.id ? TOKENS.ink : TOKENS.white, color: sourceMode === opt.id ? TOKENS.paper : TOKENS.ink, cursor: 'pointer' }}>
                {opt.label}
              </button>
            ))}
          </div>
          {sourceMode === 'paste' ? (
            <textarea value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="Paste the full text of the asset here..." rows={10}
              style={{ width: '100%', padding: '0.8rem 0.9rem', border: `1px solid ${TOKENS.rule}`, background: TOKENS.white, fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: TOKENS.ink, resize: 'vertical', lineHeight: 1.5 }} />
          ) : (
            <FileDropZone onFile={setFile} file={file} />
          )}
        </FormField>

        <FormField label="Persona" required hint="Pick the buyer who will evaluate this asset.">
          <PersonaPicker personas={personas} value={personaId} onChange={setPersonaId} />
        </FormField>

        <div style={{ borderTop: `1px solid ${TOKENS.ruleLite}`, marginTop: '0.5rem', paddingTop: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}><Eyebrow>Optional context</Eyebrow></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 1.5rem' }}>
            <FormField label="Carrier tier" hint="Shapes the persona's posture.">
              <Select value={tier} onChange={setTier} options={[{ value: 'tier_1', label: 'Tier 1 (large multinational)' }, { value: 'tier_2', label: 'Tier 2 (regional / specialist)' }, { value: 'tier_3', label: 'Tier 3 (small / local)' }]} placeholder="No tier specified" />
            </FormField>
            <FormField label="Region" hint="Regional regulatory and market context.">
              <Select value={region} onChange={setRegion} options={[{ value: 'AMER', label: 'AMER (Americas)' }, { value: 'EMEA', label: 'EMEA (Europe, Middle East, Africa)' }, { value: 'APAC', label: 'APAC (Asia Pacific)' }]} placeholder="No region specified" />
            </FormField>
          </div>
          <FormField label="Line of business" hint="If the asset targets a specific P&C line.">
            <Select value={lineOfBusiness} onChange={setLineOfBusiness} options={LINE_OF_BUSINESS_OPTIONS} placeholder="No line specified" />
          </FormField>
          <FormField label="Competitors (up to 3)" hint="Adds a differentiation lens with live web research per competitor. Each competitor adds ~30-45 seconds.">
            <ChipMultiSelect values={competitors} onChange={setCompetitors} options={COMPETITOR_OPTIONS} max={3} />
            {competitors.length > 0 && <div style={{ marginTop: '0.5rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: TOKENS.muted }}>{competitors.length} of 3 selected</div>}
          </FormField>
        </div>

        {fileError && (
          <div style={{ marginTop: '1rem', padding: '0.7rem 0.9rem', background: 'rgba(138, 42, 26, 0.06)', border: `1px solid ${TOKENS.err}`, color: TOKENS.err, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={13} /> {fileError}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${TOKENS.ruleLite}`, paddingTop: '1.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton onClick={handleSubmit} disabled={!canSubmit} icon={extracting ? Loader2 : Play}>
            {extracting ? 'Extracting text...' : 'Run evaluation'}
          </PrimaryButton>
        </div>
      </div>
    </motion.div>
  )
}
