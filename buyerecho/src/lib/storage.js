// src/lib/storage.js
// All persistent storage operations.
//
// Uses a shim over localStorage that mimics the artifact `window.storage` API,
// so the rest of the codebase is unchanged. Data persists per-browser.
// For cross-device sync, swap this shim for Vercel KV, Supabase, or Postgres.

if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key)
      if (value === null) return null
      return { key, value, shared: false }
    },
    async set(key, value) {
      localStorage.setItem(key, value)
      return { key, value, shared: false }
    },
    async delete(key) {
      const existed = localStorage.getItem(key) !== null
      localStorage.removeItem(key)
      return { key, deleted: existed, shared: false }
    },
    async list(prefix) {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (!prefix || k.startsWith(prefix)) keys.push(k)
      }
      return { keys, prefix }
    },
  }
}

export const STORAGE = {
  async getAppState() {
    try { const r = await window.storage.get('app_state'); return r ? JSON.parse(r.value) : null }
    catch { return null }
  },
  async setAppState(state) { return window.storage.set('app_state', JSON.stringify(state)) },

  async getPersonaList() {
    try { const r = await window.storage.get('personas:list'); return r ? JSON.parse(r.value) : [] }
    catch { return [] }
  },
  async setPersonaList(list) { return window.storage.set('personas:list', JSON.stringify(list)) },

  async getPersonaActiveVersion(id) {
    try { const r = await window.storage.get(`persona:${id}:active`); return r ? parseInt(r.value, 10) : null }
    catch { return null }
  },
  async setPersonaActiveVersion(id, v) { return window.storage.set(`persona:${id}:active`, String(v)) },

  async getPersonaVersion(id, v) {
    try { const r = await window.storage.get(`persona:${id}:v${v}`); return r ? JSON.parse(r.value) : null }
    catch { return null }
  },
  async setPersonaVersion(id, v, data) { return window.storage.set(`persona:${id}:v${v}`, JSON.stringify(data)) },

  async getActivePersona(id) {
    const v = await this.getPersonaActiveVersion(id)
    if (!v) return null
    return this.getPersonaVersion(id, v)
  },

  async listAllKeys() {
    try { const r = await window.storage.list(); return r ? r.keys : [] }
    catch { return [] }
  },

  async appendAudit(entry) {
    try {
      const r = await window.storage.get('audit_log')
      const log = r ? JSON.parse(r.value) : []
      log.push({ ...entry, ts: new Date().toISOString() })
      await window.storage.set('audit_log', JSON.stringify(log.slice(-500)))
    } catch (e) { console.error('audit write failed', e) }
  },

  // ---- Evaluations ----
  async getEvalList() {
    try { const r = await window.storage.get('evaluations:list'); return r ? JSON.parse(r.value) : [] }
    catch { return [] }
  },
  async setEvalList(list) { return window.storage.set('evaluations:list', JSON.stringify(list)) },

  async getEvaluation(id) {
    try { const r = await window.storage.get(`eval:${id}`); return r ? JSON.parse(r.value) : null }
    catch { return null }
  },
  async setEvaluation(id, data) { return window.storage.set(`eval:${id}`, JSON.stringify(data)) },

  async addEvaluation(evalData) {
    const list = await this.getEvalList()
    list.unshift({
      id: evalData.id,
      created_at: evalData.created_at,
      asset_title: evalData.asset_title,
      asset_type: evalData.asset_type,
      persona_id: evalData.persona_id,
      composite_score: evalData.result?.composite_score,
      verdict_band: evalData.result?.verdict_band,
    })
    await this.setEvalList(list.slice(0, 200))
    await this.setEvaluation(evalData.id, evalData)
  },

  // ---- Export / Import ----
  async exportAll() {
    const personaList = await this.getPersonaList()
    const personas = []
    for (const id of personaList) {
      const activeV = await this.getPersonaActiveVersion(id)
      const versions = []
      for (let v = 1; v <= (activeV || 1); v++) {
        const data = await this.getPersonaVersion(id, v)
        if (data) versions.push({ version_number: v, profile_json: data, source: v === 1 ? 'bootstrap' : 'manual', created_at: null })
      }
      personas.push({
        persona_id: id,
        role_label: versions[versions.length - 1]?.profile_json?.role_label,
        versions,
        active_version: activeV,
      })
    }

    const evalIndex = await this.getEvalList()
    const evaluations = []
    for (const idxEntry of evalIndex) {
      const full = await this.getEvaluation(idxEntry.id)
      if (full) evaluations.push(full)
    }

    let auditLog = []
    try {
      const r = await window.storage.get('audit_log')
      if (r) auditLog = JSON.parse(r.value)
    } catch {}

    return {
      buyerecho_export_version: '1.0',
      exported_at: new Date().toISOString(),
      source: 'v1-web',
      personas,
      evaluations,
      audit_log: auditLog,
    }
  },

  async importAll(payload) {
    if (!payload || payload.buyerecho_export_version !== '1.0') {
      throw new Error('Unrecognized export format. Expected buyerecho_export_version 1.0.')
    }
    if (!Array.isArray(payload.personas) || payload.personas.length === 0) {
      throw new Error('Export contains no personas.')
    }

    const safeSet = async (key, value) => {
      if (/[\s'"\/\\]/.test(key)) return { ok: false, key, size: value.length, error: 'invalid characters in key' }
      try {
        await window.storage.set(key, value)
        return { ok: true, key, size: value.length }
      } catch (e) {
        return { ok: false, key, size: value.length, error: e.message || String(e) }
      }
    }

    const failures = []
    let personas_written = 0, evaluations_written = 0, evaluations_skipped = 0

    const writtenIds = []
    for (const p of payload.personas) {
      if (!p.persona_id || !Array.isArray(p.versions) || p.versions.length === 0) {
        failures.push({ kind: 'persona', id: p.persona_id || 'unknown', error: 'missing versions or persona_id' })
        continue
      }
      let personaOk = true
      for (const v of p.versions) {
        if (typeof v.version_number !== 'number' || !v.profile_json) {
          failures.push({ kind: 'persona_version', id: `${p.persona_id} v${v?.version_number}`, error: 'invalid version record' })
          personaOk = false; continue
        }
        const r = await safeSet(`persona:${p.persona_id}:v${v.version_number}`, JSON.stringify(v.profile_json))
        if (!r.ok) { failures.push({ kind: 'persona_version', id: `${p.persona_id} v${v.version_number}`, error: r.error }); personaOk = false }
      }
      const r2 = await safeSet(`persona:${p.persona_id}:active`, String(p.active_version || 1))
      if (!r2.ok) { failures.push({ kind: 'persona_active', id: p.persona_id, error: r2.error }); personaOk = false }
      if (personaOk) { writtenIds.push(p.persona_id); personas_written++ }
    }

    if (writtenIds.length > 0) {
      const r = await safeSet('personas:list', JSON.stringify(writtenIds))
      if (!r.ok) failures.push({ kind: 'personas_list', error: r.error })
    }

    const evalIndexEntries = []
    if (Array.isArray(payload.evaluations)) {
      for (const ev of payload.evaluations) {
        if (!ev.id) { evaluations_skipped++; continue }
        const r = await safeSet(`eval:${ev.id}`, JSON.stringify(ev))
        if (!r.ok) { failures.push({ kind: 'evaluation', id: ev.id, error: r.error }); evaluations_skipped++; continue }
        evaluations_written++
        evalIndexEntries.push({
          id: ev.id, created_at: ev.created_at,
          asset_title: ev.asset_title, asset_type: ev.asset_type,
          persona_id: ev.persona_id,
          composite_score: ev.result?.composite_score,
          verdict_band: ev.result?.verdict_band,
        })
      }
      evalIndexEntries.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      await safeSet('evaluations:list', JSON.stringify(evalIndexEntries.slice(0, 200)))
    }

    if (Array.isArray(payload.audit_log) && payload.audit_log.length > 0) {
      await safeSet('audit_log', JSON.stringify(payload.audit_log.slice(-500)))
    }

    const stateValue = JSON.stringify({
      initialized: true, version: '1.0',
      imported_at: new Date().toISOString(),
      imported_from_export_dated: payload.exported_at,
      evals_since_last_export: 0,
      last_export_at: payload.exported_at,
    })
    const r = await safeSet('app_state', stateValue)
    if (!r.ok) throw new Error(`Could not write app_state: ${r.error}.`)

    return {
      personas_count: payload.personas.length, personas_written,
      evaluations_count: (payload.evaluations || []).length,
      evaluations_written, evaluations_skipped,
      audit_count: (payload.audit_log || []).length,
      exported_at: payload.exported_at,
      failures,
    }
  },
}
