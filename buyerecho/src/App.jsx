// src/App.jsx
// Root state orchestrator. Phases: loading → welcome → import → bootstrap
// → review → library → detail → edit → eval-form → eval-progress →
// eval-report → analytics → history

import React, { useState, useEffect, useCallback } from 'react'
import { TOKENS } from './tokens.js'
import { PREBAKED_PERSONAS } from './constants/personas.js'
import { STORAGE } from './lib/storage.js'
import { callJsonStage, callJsonStageWithSearch } from './lib/api.js'
import { generatePersonaPdf, generateEvaluationPdf } from './lib/pdf.js'
import {
  buildStageOnePrompt, buildStageTwoAPrompt, buildStageTwoBPrompt,
  buildStageThreePrompt, buildStageFourPerCompetitorPrompt,
} from './prompts/evalPrompts.js'

import { AppHeader } from './components/layout/index.jsx'
import { WelcomeScreen } from './components/layout/index.jsx'
import { ImportScreen } from './components/layout/index.jsx'
import { BootstrapProgress } from './components/layout/index.jsx'
import { EvaluationHistory } from './components/layout/index.jsx'
import { PersonaReview } from './components/personas/index.jsx'
import { PersonaLibrary } from './components/personas/index.jsx'
import { PersonaDetail } from './components/personas/index.jsx'
import { EditPersona } from './components/personas/index.jsx'
import { EvaluationForm } from './components/evaluation/Form.jsx'
import { EvaluationProgress, EvaluationReport } from './components/evaluation/Report.jsx'
import { AnalyticsScreen } from './components/analytics/index.jsx'
import { ConfirmDialog, AlertDialog } from './components/primitives/index.jsx'

// ---------------------------------------------------------------------------
// Global font injection (Cormorant Garamond + Inter + JetBrains Mono)
// ---------------------------------------------------------------------------
const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
if (!document.querySelector(`link[href="${FONT_LINK}"]`)) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'; link.href = FONT_LINK
  document.head.appendChild(link)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

async function countStorageKeys() {
  try { const r = await window.storage.list(); return r ? r.keys.length : 0 }
  catch { return 0 }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  // Phase controls what's rendered
  const [phase, setPhase] = useState('loading')
  // 'loading' | 'welcome' | 'import' | 'bootstrap' | 'review' | 'library' |
  // 'detail' | 'edit' | 'eval-form' | 'eval-progress' | 'eval-report' | 'history'

  // Tab within the library/main area
  const [tab, setTab] = useState('personas')

  // Personas
  const [savedPersonas, setSavedPersonas] = useState([])
  const [bootstrapStates, setBootstrapStates] = useState(['pending', 'pending', 'pending', 'pending', 'pending'])
  const [reviewPersonas, setReviewPersonas] = useState(null)

  // Selected persona (for detail / edit)
  const [selectedPersona, setSelectedPersona] = useState(null)
  const [selectedPersonaVersion, setSelectedPersonaVersion] = useState(1)

  // Eval state
  const [activeEval, setActiveEval] = useState(null)   // { asset_title, asset_type, asset_text, persona_id, ... }
  const [evalStage, setEvalStage] = useState(0)
  const [evalError, setEvalError] = useState(null)
  const [evalIndex, setEvalIndex] = useState([])        // flat list for history
  const [allEvaluations, setAllEvaluations] = useState([]) // full objects for analytics
  const [loadedReport, setLoadedReport] = useState(null)

  // App meta
  const [appState, setAppState] = useState(null)
  const [keyCount, setKeyCount] = useState(0)
  const [showBackupReminder, setShowBackupReminder] = useState(true)

  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [alertDialog, setAlertDialog] = useState(null)

  // -------------------------------------------------------------------------
  // Boot — check if already initialized
  // -------------------------------------------------------------------------
  useEffect(() => {
    async function boot() {
      const state = await STORAGE.getAppState()
      const personaList = await STORAGE.getPersonaList()
      const count = await countStorageKeys()
      setKeyCount(count)

      if (state?.initialized && personaList.length > 0) {
        const personas = []
        for (const id of personaList) {
          const p = await STORAGE.getActivePersona(id)
          if (p) personas.push(p)
        }
        setSavedPersonas(personas)
        setAppState(state)
        const idx = await STORAGE.getEvalList()
        setEvalIndex(idx)
        setPhase('library')
      } else {
        setPhase('welcome')
      }
    }
    boot()
  }, [])

  // -------------------------------------------------------------------------
  // Load full evaluations for analytics (lazy, after library loads)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'library' || evalIndex.length === 0) return
    let cancelled = false
    async function loadAll() {
      const results = []
      for (const idx of evalIndex) {
        if (cancelled) return
        const full = await STORAGE.getEvaluation(idx.id)
        if (full) results.push(full)
      }
      if (!cancelled) setAllEvaluations(results)
    }
    loadAll()
    return () => { cancelled = true }
  }, [phase, evalIndex.length])

  // -------------------------------------------------------------------------
  // Bootstrap — instant load from prebaked data (no API call needed)
  // -------------------------------------------------------------------------
  const handleBootstrap = useCallback(async () => {
    setPhase('bootstrap')
    const personaIds = Object.keys(PREBAKED_PERSONAS)
    const loaded = []

    for (let i = 0; i < personaIds.length; i++) {
      setBootstrapStates(s => { const n = [...s]; n[i] = 'active'; return n })
      await new Promise(r => setTimeout(r, 300 + Math.random() * 200)) // brief visual delay
      const persona = PREBAKED_PERSONAS[personaIds[i]]
      loaded.push(persona)
      setBootstrapStates(s => { const n = [...s]; n[i] = 'done'; return n })
    }

    setReviewPersonas(loaded)
    setPhase('review')
  }, [])

  // -------------------------------------------------------------------------
  // Save personas (after review)
  // -------------------------------------------------------------------------
  const handleSavePersonas = useCallback(async (personas) => {
    const ids = personas.map(p => p.persona_id)
    for (const p of personas) {
      await STORAGE.setPersonaVersion(p.persona_id, 1, p)
      await STORAGE.setPersonaActiveVersion(p.persona_id, 1)
    }
    await STORAGE.setPersonaList(ids)
    await STORAGE.setAppState({ initialized: true, version: '1.0', initialized_at: new Date().toISOString(), evals_since_last_export: 0 })

    setSavedPersonas(personas)
    setKeyCount(await countStorageKeys())
    setPhase('library')
  }, [])

  // -------------------------------------------------------------------------
  // Import
  // -------------------------------------------------------------------------
  const handleImport = useCallback(async (jsonText) => {
    const payload = JSON.parse(jsonText)
    await STORAGE.importAll(payload)

    const personaList = await STORAGE.getPersonaList()
    const personas = []
    for (const id of personaList) {
      const p = await STORAGE.getActivePersona(id)
      if (p) personas.push(p)
    }
    setSavedPersonas(personas)
    setAppState(await STORAGE.getAppState())
    setEvalIndex(await STORAGE.getEvalList())
    setKeyCount(await countStorageKeys())
    setPhase('library')
  }, [])

  // -------------------------------------------------------------------------
  // Export
  // -------------------------------------------------------------------------
  const handleExport = useCallback(async () => {
    try {
      const data = await STORAGE.exportAll()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `buyerecho_export_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)

      const state = appState || {}
      const updated = { ...state, last_export_at: new Date().toISOString(), evals_since_last_export: 0 }
      await STORAGE.setAppState(updated)
      setAppState(updated)
    } catch (e) {
      setAlertDialog({ title: 'Export failed', body: e.message, tone: 'err' })
    }
  }, [appState])

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------
  const handleReset = useCallback(() => {
    setConfirmDialog({
      title: 'Reset everything?',
      body: 'This will delete all personas, evaluations, and audit history. This cannot be undone.\n\nExport your data first if you want to keep it.',
      confirmLabel: 'Yes, reset everything',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          const keys = await STORAGE.listAllKeys()
          for (const key of keys) { try { await window.storage.delete(key) } catch {} }
          setSavedPersonas([]); setEvalIndex([]); setAllEvaluations([]); setAppState(null); setKeyCount(0)
          setPhase('welcome')
        } catch (e) {
          setAlertDialog({ title: 'Reset failed', body: e.message, tone: 'err' })
        }
      },
      onCancel: () => setConfirmDialog(null),
    })
  }, [])

  // -------------------------------------------------------------------------
  // Edit persona — save as new version
  // -------------------------------------------------------------------------
  const handleSaveEdit = useCallback(async (draft) => {
    const id = draft.persona_id
    const currentV = await STORAGE.getPersonaActiveVersion(id)
    const nextV = (currentV || 1) + 1
    await STORAGE.setPersonaVersion(id, nextV, draft)
    await STORAGE.setPersonaActiveVersion(id, nextV)
    setSelectedPersonaVersion(nextV)

    setSavedPersonas(prev => prev.map(p => p.persona_id === id ? draft : p))
    setSelectedPersona(draft)
    setKeyCount(await countStorageKeys())
    setPhase('detail')
  }, [])

  // -------------------------------------------------------------------------
  // Delete evaluation
  // -------------------------------------------------------------------------
  const handleDeleteEval = useCallback((id, title) => {
    setConfirmDialog({
      title: 'Delete evaluation?',
      body: `"${title}" will be permanently removed.`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          await window.storage.delete(`eval:${id}`)
          const newIdx = evalIndex.filter(e => e.id !== id)
          await STORAGE.setEvalList(newIdx)
          setEvalIndex(newIdx)
          setAllEvaluations(prev => prev.filter(e => e.id !== id))
          setKeyCount(await countStorageKeys())
        } catch (e) {
          setAlertDialog({ title: 'Delete failed', body: e.message, tone: 'err' })
        }
      },
      onCancel: () => setConfirmDialog(null),
    })
  }, [evalIndex])

  // -------------------------------------------------------------------------
  // Eval pipeline
  // -------------------------------------------------------------------------
  const runEvaluation = useCallback(async (ctx) => {
    setActiveEval({ ...ctx, _stage1: null, _stage2a: null, _stage2b: null, _stage3: null })
    setEvalStage(1)
    setEvalError(null)
    setPhase('eval-progress')

    const persona = savedPersonas.find(p => p.persona_id === ctx.persona_id)
    if (!persona) {
      setEvalError('Selected persona not found in saved library.')
      return
    }

    const personaVersion = await STORAGE.getPersonaActiveVersion(ctx.persona_id) || 1
    const evalId = genId()
    const created_at = new Date().toISOString()
    let stage1, stage2a, stage2b, stage3
    const incompleteSections = []
    const competitorResults = []

    // Stage 1 — required
    try {
      stage1 = await callJsonStage(
        buildStageOnePrompt({ persona, assetType: ctx.asset_type, assetTitle: ctx.asset_title, assetText: ctx.asset_text, tier: ctx.tier, region: ctx.region, lineOfBusiness: ctx.line_of_business }),
        'Stage 1 (dimension scoring)'
      )
      setActiveEval(e => ({ ...e, _stage1: stage1 }))
    } catch (e) {
      setEvalError(`Stage 1 failed (dimension scoring):\n\n${e.message}`)
      return
    }

    // Stage 2a — in-voice reaction
    setEvalStage(2)
    try {
      stage2a = await callJsonStage(
        buildStageTwoAPrompt({ persona, assetType: ctx.asset_type, assetTitle: ctx.asset_title, assetText: ctx.asset_text, stage1Result: stage1, tier: ctx.tier, region: ctx.region, lineOfBusiness: ctx.line_of_business }),
        'Stage 2a (in-voice reaction)'
      )
      setActiveEval(e => ({ ...e, _stage2a: stage2a }))
    } catch (e) {
      console.error('Stage 2a failed, continuing:', e)
      stage2a = { in_voice_reaction: null }
      incompleteSections.push('in_voice_reaction')
    }

    // Stage 2b — ranked objections
    try {
      stage2b = await callJsonStage(
        buildStageTwoBPrompt({ persona, assetType: ctx.asset_type, assetTitle: ctx.asset_title, assetText: ctx.asset_text, stage1Result: stage1, stage2aResult: stage2a, tier: ctx.tier, region: ctx.region, lineOfBusiness: ctx.line_of_business }),
        'Stage 2b (ranked objections)'
      )
      setActiveEval(e => ({ ...e, _stage2b: stage2b }))
    } catch (e) {
      console.error('Stage 2b failed, continuing:', e)
      stage2b = { ranked_objections: [] }
      incompleteSections.push('ranked_objections')
    }

    // Stage 3 — diagnosis + action items
    setEvalStage(3)
    try {
      stage3 = await callJsonStage(
        buildStageThreePrompt({ persona, assetType: ctx.asset_type, assetTitle: ctx.asset_title, assetText: ctx.asset_text, stage1Result: stage1, stage2Result: stage2b }),
        'Stage 3 (diagnosis)'
      )
      setActiveEval(e => ({ ...e, _stage3: stage3 }))
    } catch (e) {
      console.error('Stage 3 failed, continuing:', e)
      stage3 = { diagnosis: null, action_items: [] }
      incompleteSections.push('diagnosis')
    }

    // Stage 4 — competitors (optional, per competitor)
    if (ctx.competitors?.length > 0) {
      for (let i = 0; i < ctx.competitors.length; i++) {
        setEvalStage(4 + i)
        const competitor = ctx.competitors[i]
        try {
          const { json, sources } = await callJsonStageWithSearch(
            buildStageFourPerCompetitorPrompt({ persona, assetType: ctx.asset_type, assetText: ctx.asset_text, competitor, stage1Result: stage1 }),
            `Stage 4 competitor: ${competitor}`
          )
          competitorResults.push({ ...json, sources, retrieved_at: new Date().toISOString() })
        } catch (e) {
          console.error(`Stage 4 failed for ${competitor}, continuing:`, e)
          competitorResults.push({ competitor, substitutability_score: null, error: e.message })
        }
      }
    }

    // Assemble result
    const result = {
      composite_score: stage1.composite_score,
      verdict_band: stage1.verdict_band,
      verdict_summary: stage1.verdict_summary,
      dimensions: stage1.dimensions,
      biggest_limiter: stage1.biggest_limiter,
      in_voice_reaction: stage2a?.in_voice_reaction || null,
      ranked_objections: stage2b?.ranked_objections || [],
      diagnosis: stage3?.diagnosis || null,
      action_items: stage3?.action_items || [],
      competitor_analysis: competitorResults,
    }

    const evaluation = {
      id: evalId,
      created_at,
      asset_title: ctx.asset_title,
      asset_type: ctx.asset_type,
      asset_text: ctx.asset_text,
      persona_id: ctx.persona_id,
      persona_snapshot: persona,
      persona_version_at_run: personaVersion,
      tier: ctx.tier,
      region: ctx.region,
      line_of_business: ctx.line_of_business,
      competitors: ctx.competitors,
      result,
      incomplete_sections: incompleteSections,
    }

    await STORAGE.addEvaluation(evaluation)

    // Update app state counters
    const state = appState || {}
    const updatedState = { ...state, evals_since_last_export: (state.evals_since_last_export || 0) + 1 }
    await STORAGE.setAppState(updatedState)
    setAppState(updatedState)

    const newIdx = await STORAGE.getEvalList()
    setEvalIndex(newIdx)
    setAllEvaluations(prev => [evaluation, ...prev])
    setKeyCount(await countStorageKeys())

    setLoadedReport(evaluation)
    setPhase('eval-report')
  }, [savedPersonas, appState])

  // -------------------------------------------------------------------------
  // Load a specific evaluation for report view
  // -------------------------------------------------------------------------
  const handleSelectEval = useCallback(async (id) => {
    const full = await STORAGE.getEvaluation(id)
    if (full) { setLoadedReport(full); setPhase('eval-report') }
    else setAlertDialog({ title: 'Not found', body: 'This evaluation could not be retrieved from storage.', tone: 'err' })
  }, [])

  // -------------------------------------------------------------------------
  // Tab switching — lazy load evaluations if needed
  // -------------------------------------------------------------------------
  const handleTab = useCallback(async (newTab) => {
    setTab(newTab)
    if (newTab === 'evaluate') { setPhase('eval-form'); return }
    if (newTab === 'history') { setPhase('history'); return }
    if (newTab === 'analytics') { setPhase('analytics'); return }
    if (newTab === 'personas') { setPhase('library'); return }
  }, [])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const showHeader = !['loading', 'welcome', 'import', 'bootstrap', 'review'].includes(phase)

  const bodyBg = TOKENS.paper
  const bodyStyle = {
    minHeight: '100vh',
    background: bodyBg,
    fontFamily: "'Inter', system-ui, sans-serif",
  }

  return (
    <div style={bodyStyle}>
      {/* Global reset */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: ${TOKENS.paper}; }
        textarea, input, select, button { outline: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {showHeader && (
        <AppHeader
          keyCount={keyCount}
          currentTab={tab}
          onTab={handleTab}
        />
      )}

      <main>
        {phase === 'loading' && (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TOKENS.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', letterSpacing: '0.1em' }}>
            LOADING...
          </div>
        )}

        {phase === 'welcome' && (
          <WelcomeScreen
            onStart={handleBootstrap}
            onImport={() => setPhase('import')}
          />
        )}

        {phase === 'import' && (
          <ImportScreen
            onCancel={() => setPhase('welcome')}
            onImport={handleImport}
          />
        )}

        {phase === 'bootstrap' && (
          <BootstrapProgress states={bootstrapStates} />
        )}

        {phase === 'review' && reviewPersonas && (
          <PersonaReview
            personas={reviewPersonas}
            onSave={() => handleSavePersonas(reviewPersonas)}
            onSelectView={setSelectedPersona}
            viewing={selectedPersona}
          />
        )}

        {phase === 'library' && (
          <PersonaLibrary
            personas={savedPersonas}
            onSelectView={(p) => {
              setSelectedPersona(p)
              STORAGE.getPersonaActiveVersion(p.persona_id).then(v => setSelectedPersonaVersion(v || 1))
              setPhase('detail')
            }}
            onReset={handleReset}
            onNewEval={() => { setTab('evaluate'); setPhase('eval-form') }}
            onExport={handleExport}
            appState={appState}
            evalCount={evalIndex.length}
            showBackupReminder={showBackupReminder}
            onDismissBackupReminder={() => setShowBackupReminder(false)}
          />
        )}

        {phase === 'detail' && selectedPersona && (
          <PersonaDetail
            persona={selectedPersona}
            version={selectedPersonaVersion}
            onBack={() => { setSelectedPersona(null); setPhase('library') }}
            onEdit={() => setPhase('edit')}
            onPrint={(p) => generatePersonaPdf(p)}
          />
        )}

        {phase === 'edit' && selectedPersona && (
          <EditPersona
            persona={selectedPersona}
            onCancel={() => setPhase('detail')}
            onSave={handleSaveEdit}
          />
        )}

        {phase === 'eval-form' && (
          <EvaluationForm
            personas={savedPersonas}
            onCancel={() => { setTab('personas'); setPhase('library') }}
            onSubmit={runEvaluation}
          />
        )}

        {phase === 'eval-progress' && (
          <EvaluationProgress
            stage={evalStage}
            hasCompetitors={activeEval?.competitors?.length > 0}
            competitors={activeEval?.competitors || []}
            error={evalError}
            onRetry={() => activeEval && runEvaluation(activeEval)}
            onCancel={() => { setTab('personas'); setPhase('library') }}
          />
        )}

        {phase === 'eval-report' && loadedReport && (
          <EvaluationReport
            evaluation={loadedReport}
            onBack={() => { setPhase('history') }}
            onPrint={(e) => generateEvaluationPdf(e)}
          />
        )}

        {phase === 'analytics' && (
          <AnalyticsScreen
            evalIndex={evalIndex}
            allEvaluations={allEvaluations}
          />
        )}

        {phase === 'history' && (
          <EvaluationHistory
            evalIndex={evalIndex}
            personas={savedPersonas}
            onSelect={handleSelectEval}
            onNewEval={() => { setTab('evaluate'); setPhase('eval-form') }}
            onBack={() => { setTab('personas'); setPhase('library') }}
            onDelete={handleDeleteEval}
          />
        )}
      </main>

      {/* Global dialogs */}
      {confirmDialog && (
        <ConfirmDialog
          open={!!confirmDialog}
          title={confirmDialog.title}
          body={confirmDialog.body}
          confirmLabel={confirmDialog.confirmLabel}
          danger={confirmDialog.danger}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
      {alertDialog && (
        <AlertDialog
          open={!!alertDialog}
          title={alertDialog.title}
          body={alertDialog.body}
          tone={alertDialog.tone}
          onClose={() => setAlertDialog(null)}
        />
      )}
    </div>
  )
}
