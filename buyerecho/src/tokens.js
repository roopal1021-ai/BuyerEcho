// src/tokens.js — design system tokens and score band utility

export const TOKENS = {
  ink:        '#1a1f2e',
  paper:      '#f5f1e8',
  paperLite:  '#faf7ef',
  paperWarm:  '#f0e9d8',
  white:      '#ffffff',
  rule:       '#d8d0bd',
  ruleLite:   '#e8e2d0',
  accent:     '#a3370a',
  accentSoft: '#c75a2c',
  ochre:      '#b88a2c',
  muted:      '#6b6358',
  mutedLite:  '#8a8275',
  success:    '#3d6b4a',
  warn:       '#8a5a16',
  err:        '#8a2a1a',

  bandShip:      '#3d6b4a',
  bandRevise:    '#b88a2c',
  bandRethink:   '#a35f1f',
  bandRebuild:   '#8a2a1a',
  bandShipBg:    'rgba(61, 107, 74, 0.08)',
  bandReviseBg:  'rgba(184, 138, 44, 0.10)',
  bandRethinkBg: 'rgba(163, 95, 31, 0.10)',
  bandRebuildBg: 'rgba(138, 42, 26, 0.08)',

  dimPersuasion:      '#a3370a',
  dimClarity:         '#3a4d6b',
  dimDifferentiation: '#2d5f3f',
  dimBuyerFit:        '#7a2848',
}

export function bandFor(score) {
  if (score >= 85) return { label: 'ship',    color: TOKENS.bandShip,    bg: TOKENS.bandShipBg }
  if (score >= 70) return { label: 'revise',  color: TOKENS.bandRevise,  bg: TOKENS.bandReviseBg }
  if (score >= 55) return { label: 'rethink', color: TOKENS.bandRethink, bg: TOKENS.bandRethinkBg }
  return                  { label: 'rebuild', color: TOKENS.bandRebuild, bg: TOKENS.bandRebuildBg }
}
