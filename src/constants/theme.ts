export const Colors = {
  // Backgrounds
  background: '#0D0D1A',
  backgroundSecondary: '#12122A',

  // Glass surfaces
  glass: 'rgba(255, 255, 255, 0.06)',
  glassHighlight: 'rgba(255, 255, 255, 0.12)',
  glassDark: 'rgba(0, 0, 0, 0.3)',

  // Gold palette
  gold: '#C9A84C',
  goldLight: '#F0C857',
  goldDim: 'rgba(201, 168, 76, 0.25)',
  goldBorder: 'rgba(201, 168, 76, 0.35)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.35)',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.1)',
  borderMedium: 'rgba(255, 255, 255, 0.18)',

  // Semantic
  error: '#FF6B6B',
  success: '#4CAF83',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  displayLarge: { fontSize: 32, fontWeight: '800' as const, letterSpacing: 0.5 },
  displayMedium: { fontSize: 26, fontWeight: '700' as const, letterSpacing: 0.3 },
  title: { fontSize: 20, fontWeight: '700' as const },
  subtitle: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '500' as const },
  caption: { fontSize: 11, fontWeight: '400' as const },
} as const;

export const Shadow = {
  gold: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
