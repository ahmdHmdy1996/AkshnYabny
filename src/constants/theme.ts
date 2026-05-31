// src/constants/theme.ts — CINEMA ROYALE design language
//
// Palette philosophy:
//   Background #04050C  — void black, like a cinema before the projector lights
//   Gold       #FFB800  — warm projector-light amber, not classic jewellery gold
//   Crimson    #FF3D71  — velvet-curtain red for tension and action (skip/error)
//   Emerald    #00E676  — green-room neon for triumph and success (correct)

// ─── Colors ───────────────────────────────────────────────────────────────────

export const Colors = {
  // ── Backgrounds
  background:          '#04050C',  // Void black — cinema before projection
  backgroundSecondary: '#080A16',  // Deep navy for layered surfaces
  surface:             '#0D0F1E',  // Elevated surface

  // ── Glass surfaces
  glass:          'rgba(255, 255, 255, 0.04)',
  glassHighlight: 'rgba(255, 255, 255, 0.09)',
  glassDark:      'rgba(0, 0, 0, 0.55)',
  glassBorder:    'rgba(255, 255, 255, 0.10)',

  // ── Gold — warm projector amber ──────────────────────────────────────────────
  gold:       '#FFB800',
  goldLight:  '#FFD340',
  goldDeep:   '#C98F00',
  goldDim:    'rgba(255, 184, 0, 0.12)',
  goldBorder: 'rgba(255, 184, 0, 0.30)',
  goldGlow:   'rgba(255, 184, 0, 0.20)',

  // ── Crimson — velvet curtain (skip / error) ──────────────────────────────────
  crimson:       '#FF3D71',
  crimsonDark:   '#B0183E',
  crimsonDim:    'rgba(255, 61, 113, 0.14)',
  crimsonBorder: 'rgba(255, 61, 113, 0.30)',

  // ── Emerald — green-room light (correct / success) ───────────────────────────
  emerald:       '#00E676',
  emeraldDark:   '#00995A',
  emeraldDim:    'rgba(0, 230, 118, 0.12)',
  emeraldBorder: 'rgba(0, 230, 118, 0.28)',

  // ── Text — warm ivory
  textPrimary:   '#F0EEE8',
  textSecondary: 'rgba(240, 238, 232, 0.65)',
  textTertiary:  'rgba(240, 238, 232, 0.30)',

  // ── Borders
  borderSubtle: 'rgba(255, 255, 255, 0.07)',
  borderMedium: 'rgba(255, 255, 255, 0.14)',

  // ── Semantic aliases
  error:   '#FF3D71',
  success: '#00E676',
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

// ─── Border radii ─────────────────────────────────────────────────────────────

export const BorderRadius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const Typography = {
  displayLarge:  { fontSize: 34, fontWeight: '800' as const, letterSpacing: 0.3 },
  displayMedium: { fontSize: 26, fontWeight: '700' as const, letterSpacing: 0.2 },
  title:         { fontSize: 20, fontWeight: '700' as const, letterSpacing: 0.1 },
  subtitle:      { fontSize: 17, fontWeight: '600' as const },
  body:          { fontSize: 15, fontWeight: '400' as const },
  label:         { fontSize: 13, fontWeight: '500' as const },
  caption:       { fontSize: 11, fontWeight: '400' as const },
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const Shadow = {
  gold: {
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.42,
    shadowRadius: 16,
    elevation: 12,
  },
  goldGlow: {
    shadowColor: '#FFD340',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.58,
    shadowRadius: 30,
    elevation: 20,
  },
  crimsonGlow: {
    shadowColor: '#FF3D71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.52,
    shadowRadius: 18,
    elevation: 14,
  },
  emeraldGlow: {
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.52,
    shadowRadius: 18,
    elevation: 14,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
} as const;
