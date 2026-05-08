// src/lib/pdf.js
// PDF generation via jsPDF (loaded lazily from cdnjs).
// Exports generatePersonaPdf and generateEvaluationPdf.

import { ASSET_TYPE_LABELS, ASSET_TYPE_WEIGHTS } from '../constants/assetTypes.js'

let _jspdfLoadPromise = null
function loadJsPdf() {
  if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF)
  if (_jspdfLoadPromise) return _jspdfLoadPromise
  _jspdfLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    script.onload = () => {
      if (!window.jspdf || !window.jspdf.jsPDF) { reject(new Error('jsPDF failed to expose window.jspdf.jsPDF')); return }
      resolve(window.jspdf.jsPDF)
    }
    script.onerror = () => reject(new Error('could not load jsPDF from CDN'))
    document.head.appendChild(script)
  })
  return _jspdfLoadPromise
}

class PdfBuilder {
  constructor(jsPDF) {
    this.doc = new jsPDF({ unit: 'pt', format: 'letter' })
    this.pageW = 612; this.pageH = 792
    this.marginX = 54; this.marginTop = 54; this.marginBottom = 54
    this.contentW = this.pageW - 2 * this.marginX
    this.y = this.marginTop; this.pageNum = 1
  }

  ensureSpace(height) {
    if (this.y + height > this.pageH - this.marginBottom) {
      this.doc.addPage(); this.y = this.marginTop; this.pageNum++
    }
  }

  text(str, opts = {}) {
    if (!str) return
    const size = opts.size || 10
    const bold = !!opts.bold; const italic = !!opts.italic
    const color = opts.color || [26, 31, 46]
    const indent = opts.indent || 0
    const lineHeight = opts.lineHeight || size * 1.45
    const maxWidth = this.contentW - indent
    this.doc.setFont('helvetica', bold ? (italic ? 'bolditalic' : 'bold') : (italic ? 'italic' : 'normal'))
    this.doc.setFontSize(size)
    this.doc.setTextColor(color[0], color[1], color[2])
    const lines = this.doc.splitTextToSize(String(str), maxWidth)
    for (const ln of lines) {
      this.ensureSpace(lineHeight)
      this.doc.text(ln, this.marginX + indent, this.y + size)
      this.y += lineHeight
    }
  }

  monoBlock(str, opts = {}) {
    if (!str) return
    const size = opts.size || 8.5; const lineHeight = size * 1.5
    const indent = opts.indent || 0; const maxWidth = this.contentW - indent
    this.doc.setFont('courier', 'normal'); this.doc.setFontSize(size); this.doc.setTextColor(60, 60, 60)
    const userLines = String(str).split(/\r?\n/)
    for (const userLine of userLines) {
      const wrapped = this.doc.splitTextToSize(userLine || ' ', maxWidth)
      for (const ln of wrapped) {
        this.ensureSpace(lineHeight)
        this.doc.text(ln, this.marginX + indent, this.y + size)
        this.y += lineHeight
      }
    }
  }

  gap(pts) { this.y += pts }

  rule(opts = {}) {
    this.ensureSpace(8)
    const color = opts.color || [26, 31, 46]; const width = opts.width || 1
    this.doc.setDrawColor(color[0], color[1], color[2])
    this.doc.setLineWidth(width)
    this.doc.line(this.marginX, this.y, this.marginX + this.contentW, this.y)
    this.y += 4
  }

  sectionHeader(label) {
    this.gap(10); this.ensureSpace(28)
    this.doc.setFont('helvetica', 'bold'); this.doc.setFontSize(10); this.doc.setTextColor(26, 31, 46)
    this.doc.text(String(label).toUpperCase(), this.marginX, this.y + 10)
    this.y += 14; this.rule({ color: [26, 31, 46], width: 0.5 }); this.gap(4)
  }

  label(text) {
    this.gap(6); this.text(String(text).toUpperCase(), { size: 8, bold: true, color: [110, 110, 110] }); this.gap(-2)
  }

  pageHeader(subtitle) {
    this.doc.setFont('helvetica', 'bold'); this.doc.setFontSize(9); this.doc.setTextColor(26, 31, 46)
    this.doc.text('BUYERECHO', this.marginX, this.y + 9)
    this.doc.setFont('helvetica', 'normal'); this.doc.setFontSize(9); this.doc.setTextColor(120, 120, 120)
    this.doc.text(String(subtitle || ''), this.marginX + this.contentW, this.y + 9, { align: 'right' })
    this.y += 14; this.rule({ color: [26, 31, 46], width: 1.2 }); this.gap(8)
  }

  title(text, eyebrow = null) {
    if (eyebrow) { this.text(String(eyebrow).toUpperCase(), { size: 8, color: [120, 120, 120] }); this.gap(2) }
    this.text(String(text), { size: 22, bold: true, lineHeight: 26 }); this.gap(6)
  }

  bullets(items) {
    for (const item of items) this.text('•  ' + String(item), { size: 10, lineHeight: 14 })
  }

  numbered(items) {
    items.forEach((item, i) => this.text((i + 1) + '.  ' + String(item), { size: 10, lineHeight: 14 }))
  }

  keyValue(key, value) {
    if (!value && value !== 0) return
    this.text(`${key}: ${value}`, { size: 10, lineHeight: 14 })
  }

  finalize(footerNote) {
    const total = this.doc.internal.getNumberOfPages()
    for (let i = 1; i <= total; i++) {
      this.doc.setPage(i)
      this.doc.setFont('helvetica', 'italic'); this.doc.setFontSize(8); this.doc.setTextColor(140, 140, 140)
      this.doc.text(String(footerNote || ''), this.marginX, this.pageH - 28)
      this.doc.text(`${i} / ${total}`, this.marginX + this.contentW, this.pageH - 28, { align: 'right' })
    }
  }

  save(filename) {
    const blob = this.doc.output('blob')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }
}

export async function generatePersonaPdf(persona) {
  const jsPDF = await loadJsPdf()
  const b = new PdfBuilder(jsPDF)
  const id = persona.identity || {}
  const dateStr = new Date().toLocaleDateString()

  b.pageHeader(`Persona profile · ${dateStr}`)
  b.title(id.name || persona.role_label, persona.role_label || 'Persona')
  if (id.professional_summary) b.text(id.professional_summary, { size: 10.5, color: [70, 70, 70], lineHeight: 15 })

  b.sectionHeader('Identity')
  if (id.role_title) b.keyValue('Role title', id.role_title)
  if (id.years_in_role_range) b.keyValue('Tenure', id.years_in_role_range)
  if (id.reporting_line) b.keyValue('Reports to', id.reporting_line)
  if (id.career_background) { b.gap(2); b.label('Career background'); b.text(id.career_background) }

  const mandate = persona.mandate_and_kpis || {}
  if (Object.keys(mandate).length > 0) {
    b.sectionHeader('Mandate & KPIs')
    if (mandate.primary_kpis?.length) { b.label('Primary KPIs'); b.bullets(mandate.primary_kpis) }
    if (mandate.secondary_kpis?.length) { b.label('Secondary KPIs'); b.bullets(mandate.secondary_kpis) }
    if (mandate.board_pressure_topics?.length) { b.label('Board pressure topics'); b.bullets(mandate.board_pressure_topics) }
    if (mandate.current_year_priorities?.length) { b.label('Current-year priorities'); b.bullets(mandate.current_year_priorities) }
  }

  const buying = persona.buying_behavior || {}
  if (Object.keys(buying).length > 0) {
    b.sectionHeader('Buying Behavior')
    if (buying.budget_authority_usd_range) b.keyValue('Budget authority', buying.budget_authority_usd_range)
    if (buying.decision_role) b.keyValue('Decision role', buying.decision_role)
    if (buying.procurement_rigor) b.keyValue('Procurement rigor', buying.procurement_rigor)
    if (buying.pilot_appetite) b.keyValue('Pilot appetite', buying.pilot_appetite)
    if (buying.typical_deal_stakeholders?.length) { b.label('Typical deal stakeholders'); b.bullets(buying.typical_deal_stakeholders) }
  }

  const disp = persona.disposition_traits || {}
  if (Object.keys(disp).length > 0) {
    b.sectionHeader('Disposition Traits')
    Object.entries(disp).forEach(([k, v]) => b.keyValue(k.replace(/_/g, ' '), String(v)))
  }

  const objLib = persona.objection_library || {}
  if (objLib.stock_objections?.length) { b.sectionHeader('Stock Objections'); b.bullets(objLib.stock_objections) }
  if (objLib.pet_peeves?.length) { b.sectionHeader('Pet Peeves'); b.bullets(objLib.pet_peeves) }

  const vocab = persona.vocabulary || {}
  if (Object.keys(vocab).length > 0) {
    b.sectionHeader('Vocabulary')
    if (vocab.preferred_terminology?.length) { b.label('Preferred terminology'); b.text(vocab.preferred_terminology.join(' · '), { size: 9.5 }) }
    if (vocab.forbidden_terms?.length) { b.label('Forbidden terms'); b.text(vocab.forbidden_terms.join(' · '), { size: 9.5 }) }
    if (vocab.domain_shorthand_used?.length) { b.label('Domain shorthand'); b.text(vocab.domain_shorthand_used.join(' · '), { size: 9.5 }) }
  }

  b.finalize(`BuyerEcho V1 · ${id.name || persona.role_label} · printed ${dateStr}`)
  const safeName = (id.name || persona.role_label || 'persona').replace(/[^a-z0-9]+/gi, '_')
  b.save(`buyerecho_persona_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export async function generateEvaluationPdf(evaluation) {
  const jsPDF = await loadJsPdf()
  const b = new PdfBuilder(jsPDF)
  const result = evaluation.result || {}
  const persona = evaluation.persona_snapshot || {}
  const composite = result.composite_score || 0
  const verdict = result.verdict_band || '—'
  const dims = result.dimensions || {}
  const weights = ASSET_TYPE_WEIGHTS[evaluation.asset_type] || ASSET_TYPE_WEIGHTS.other
  const dimList = [
    { key: 'persuasion',      label: 'Persuasion',      weight: weights.persuasion },
    { key: 'clarity',         label: 'Clarity',         weight: weights.clarity },
    { key: 'differentiation', label: 'Differentiation', weight: weights.differentiation },
    { key: 'buyer_fit',       label: 'Buyer Fit',       weight: weights.buyer_fit },
  ]
  const evalDateStr = new Date(evaluation.created_at).toLocaleString()

  b.pageHeader(`Evaluation report · ${evalDateStr}`)
  b.title(evaluation.asset_title, ASSET_TYPE_LABELS[evaluation.asset_type] || evaluation.asset_type)

  const subParts = [`Evaluated against ${persona.identity?.name || persona.role_label}`]
  if (evaluation.tier) subParts.push(`Tier: ${evaluation.tier.replace(/_/g, ' ')}`)
  if (evaluation.region) subParts.push(`Region: ${evaluation.region}`)
  if (evaluation.line_of_business) subParts.push(`LOB: ${evaluation.line_of_business}`)
  b.text(subParts.join(' · '), { size: 10, color: [80, 80, 80] })

  b.gap(8); b.rule({ color: [26, 31, 46], width: 1 }); b.gap(6)
  b.text(`Composite score: ${composite} / 100`, { size: 16, bold: true })
  b.text(`Verdict: ${verdict.toUpperCase()}`, { size: 11, bold: true })
  if (result.verdict_summary) { b.gap(2); b.text(result.verdict_summary, { size: 10.5, lineHeight: 14.5 }) }
  b.gap(2); b.rule({ color: [26, 31, 46], width: 1 })

  if (result.biggest_limiter) {
    b.label(`Biggest limiter · ${(result.biggest_limiter.dimension || '').toUpperCase()}`)
    b.text(result.biggest_limiter.explanation)
  }

  b.sectionHeader('Four-Dimension Scoring')
  dimList.forEach(d => {
    const dim = dims[d.key] || {}
    const score = typeof dim.score === 'number' ? dim.score : null
    const notApplicable = d.weight === 0
    b.text(`${d.label.toUpperCase()}  —  weight ${d.weight}%  —  ${notApplicable ? 'n/a' : (score !== null ? score : '—')}`, { size: 11, bold: true })
    if (notApplicable) {
      b.text('Not applicable for this asset type.', { size: 9.5, italic: true, color: [120, 120, 120], indent: 12 })
    } else if (dim.subfactors?.length > 0) {
      dim.subfactors.forEach(sf => {
        const scorePart = typeof sf.score === 'number' ? ` (${sf.score})` : ''
        const note = sf.note ? ` — ${sf.note}` : ''
        b.text(`• ${sf.name}${scorePart}${note}`, { size: 9.5, indent: 12, lineHeight: 13.5 })
      })
    }
    b.gap(4)
  })

  if (result.in_voice_reaction) {
    b.sectionHeader('In-Voice Reaction')
    b.text(`"${result.in_voice_reaction}"`, { size: 11, italic: true, indent: 8 })
    b.gap(2)
    b.text(`— ${persona.identity?.name || persona.role_label}`, { size: 9, color: [110, 110, 110], indent: 8 })
  }

  if (result.ranked_objections?.length > 0) {
    b.sectionHeader('Ranked Objections')
    result.ranked_objections.forEach(o => {
      b.text(`[${(o.severity || 'concern').toUpperCase()}]  ${o.objection || ''}`, { size: 10, bold: true, lineHeight: 14 })
      if (o.what_would_answer_it) b.text(`What would answer it: ${o.what_would_answer_it}`, { size: 9.5, italic: true, color: [110, 110, 110], indent: 12 })
      b.gap(2)
    })
  }

  if (result.diagnosis) {
    b.sectionHeader('Diagnosis')
    if (result.diagnosis.what_works) { b.label('What works'); b.bullets(Array.isArray(result.diagnosis.what_works) ? result.diagnosis.what_works : [result.diagnosis.what_works]) }
    if (result.diagnosis.what_breaks) { b.label('What breaks'); b.bullets(Array.isArray(result.diagnosis.what_breaks) ? result.diagnosis.what_breaks : [result.diagnosis.what_breaks]) }
  }

  if (result.action_items?.length > 0) {
    b.sectionHeader('Action Items')
    b.numbered(result.action_items.map(a => typeof a === 'string' ? a : (a.action || JSON.stringify(a))))
  }

  if (result.competitor_analysis?.length > 0) {
    b.sectionHeader('Competitor Differentiation')
    result.competitor_analysis.forEach(c => {
      b.text(`${c.competitor}  —  Substitutability: ${c.substitutability_score}`, { size: 11, bold: true })
      if (c.verbatim_claim?.trim()) b.text(`Their positioning: "${c.verbatim_claim}"`, { size: 9.5, italic: true, color: [80, 80, 80], indent: 12 })
      if (c.what_they_dont_say) b.text(`What they don't say: ${c.what_they_dont_say}`, { size: 9.5, indent: 12 })
      if (c.line_of_attack) b.text(`Line of attack: ${c.line_of_attack}`, { size: 9.5, indent: 12 })
      if (c.competitor_objection) b.text(`"${c.competitor_objection}"`, { size: 9.5, italic: true, color: [110, 110, 110], indent: 12 })
      b.gap(4)
    })
  }

  if (evaluation.asset_text) {
    b.doc.addPage(); b.y = b.marginTop; b.pageNum++
    b.sectionHeader('Appendix: Asset Content Evaluated')
    b.monoBlock(evaluation.asset_text)
  }

  b.finalize(`BuyerEcho V1 · evaluation pinned to persona version ${evaluation.persona_version_at_run || 1}`)
  const safeTitle = evaluation.asset_title.replace(/[^a-z0-9]+/gi, '_').slice(0, 40)
  b.save(`buyerecho_eval_${safeTitle}_${new Date(evaluation.created_at).toISOString().slice(0, 10)}.pdf`)
}
