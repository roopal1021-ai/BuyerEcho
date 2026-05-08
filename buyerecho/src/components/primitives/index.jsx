// src/components/primitives/index.jsx
// Logo, typography, buttons, modals, ornament, storage indicator.

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { TOKENS } from '../../tokens.js'
import { personaMeta } from '../../constants/personas.js'

export function Logo({ size = 'lg' }) {
  const fontSize = size === 'lg' ? '2.5rem' : size === 'md' ? '1.5rem' : '1.1rem'
  return (
    <div className="flex items-baseline gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <span style={{ fontSize, fontWeight: 600, letterSpacing: '-0.02em', color: TOKENS.ink, lineHeight: 1 }}>
        Buyer<span style={{ color: TOKENS.accent, fontStyle: 'italic' }}>Echo</span>
      </span>
    </div>
  )
}

export function Eyebrow({ children, color }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.7rem', letterSpacing: '0.18em',
      textTransform: 'uppercase', color: color || TOKENS.muted,
      fontWeight: 500,
    }}>{children}</div>
  )
}

export function Display({ children, as: As = 'h1', size = '5xl', italic = false }) {
  const sizes = { '5xl': '3.5rem', '4xl': '2.6rem', '3xl': '2rem', '2xl': '1.6rem', 'xl': '1.3rem' }
  return (
    <As style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: sizes[size], fontWeight: 500,
      color: TOKENS.ink, letterSpacing: '-0.02em',
      lineHeight: 1.1, fontStyle: italic ? 'italic' : 'normal',
      margin: 0,
    }}>{children}</As>
  )
}

export function Body({ children, muted = false, size = 'base' }) {
  const sizes = { sm: '0.85rem', base: '0.95rem', lg: '1.05rem' }
  return (
    <p style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: sizes[size], lineHeight: 1.6,
      color: muted ? TOKENS.muted : TOKENS.ink,
      margin: 0, fontWeight: 400,
    }}>{children}</p>
  )
}

export function PrimaryButton({ children, onClick, disabled, icon: Icon, color }) {
  const bg = color || TOKENS.ink
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        background: disabled ? TOKENS.mutedLite : bg,
        color: TOKENS.paper, border: 'none',
        padding: '0.85rem 1.6rem',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.02em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = TOKENS.accent)}
      onMouseLeave={e => !disabled && (e.currentTarget.style.background = bg)}
    >
      {children}
      {Icon && <Icon size={16} strokeWidth={1.6} />}
    </button>
  )
}

export function GhostButton({ children, onClick, icon: Icon, danger = false }) {
  const color = danger ? TOKENS.err : TOKENS.ink
  return (
    <button onClick={onClick}
      style={{
        background: 'transparent', color,
        border: `1px solid ${TOKENS.rule}`,
        padding: '0.7rem 1.2rem',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '0.82rem', fontWeight: 500,
        letterSpacing: '0.02em', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = TOKENS.paperLite }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = TOKENS.rule; e.currentTarget.style.background = 'transparent' }}
    >
      {Icon && <Icon size={14} strokeWidth={1.6} />}
      {children}
    </button>
  )
}

export function Ornament() {
  return (
    <svg width="60" height="14" viewBox="0 0 60 14" style={{ display: 'block' }}>
      <line x1="0" y1="7" x2="22" y2="7" stroke={TOKENS.rule} strokeWidth="0.5" />
      <circle cx="30" cy="7" r="2.5" fill="none" stroke={TOKENS.accent} strokeWidth="0.7" />
      <line x1="38" y1="7" x2="60" y2="7" stroke={TOKENS.rule} strokeWidth="0.5" />
    </svg>
  )
}

export function StorageIndicator({ keyCount }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.4rem 0.7rem',
      border: `1px solid ${TOKENS.ruleLite}`,
      background: TOKENS.paperLite,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.7rem', color: TOKENS.muted,
    }}>
      <span>{keyCount} {keyCount === 1 ? 'key' : 'keys'}</span>
    </div>
  )
}

export function Modal({ open, onClose, children, maxWidth = '440px' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(26, 31, 46, 0.55)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: TOKENS.paper, border: `1px solid ${TOKENS.rule}`,
          maxWidth, width: '100%',
          padding: '1.8rem 1.8rem 1.5rem 1.8rem',
          fontFamily: "'Inter', sans-serif",
          boxShadow: '0 8px 32px rgba(26, 31, 46, 0.2)',
        }}>
        {children}
      </motion.div>
    </div>
  )
}

export function ConfirmDialog({ open, title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div style={{ marginBottom: '0.4rem' }}>
        <Eyebrow color={danger ? TOKENS.err : TOKENS.muted}>{danger ? 'Destructive action' : 'Confirm'}</Eyebrow>
      </div>
      <div style={{ marginBottom: '1rem' }}><Display size="2xl">{title}</Display></div>
      <div style={{ marginBottom: '1.5rem', color: TOKENS.ink, fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{body}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
        <GhostButton onClick={onCancel}>{cancelLabel}</GhostButton>
        <button onClick={onConfirm}
          style={{
            background: danger ? TOKENS.err : TOKENS.ink,
            color: TOKENS.paper, border: 'none',
            padding: '0.7rem 1.2rem',
            fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 500,
            cursor: 'pointer', letterSpacing: '0.02em',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          }}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function AlertDialog({ open, title, body, tone = 'info', onClose }) {
  const colorMap = { info: TOKENS.muted, success: TOKENS.success, warn: TOKENS.warn, err: TOKENS.err }
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ marginBottom: '0.4rem' }}>
        <Eyebrow color={colorMap[tone] || TOKENS.muted}>
          {tone === 'err' ? 'Error' : tone === 'warn' ? 'Warning' : tone === 'success' ? 'Done' : 'Notice'}
        </Eyebrow>
      </div>
      <div style={{ marginBottom: '1rem' }}><Display size="2xl">{title}</Display></div>
      {body && <div style={{ marginBottom: '1.5rem', color: TOKENS.ink, fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{body}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <PrimaryButton onClick={onClose}>OK</PrimaryButton>
      </div>
    </Modal>
  )
}

export function PersonaAvatar({ id, size = 36 }) {
  const meta = personaMeta(id)
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: meta.color, color: TOKENS.paper,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: size * 0.28, fontWeight: 500, letterSpacing: '0.02em',
    }}>
      {meta.initials}
    </div>
  )
}
