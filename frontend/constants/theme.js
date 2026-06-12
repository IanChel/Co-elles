export const FONT_SIZES = {
  hero: 36,
  title: 28,
  subtitle: 18,
  body: 16,
  caption: 14,
};

export const SPACING = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 40,
  xxl: 60,
};

export const BORDER_RADIUS = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  medium: {
    shadowColor: '#b0003a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const lightTheme = {
  primary: '#4338CA', // Bleu Indigo Profond (Trust)
  primaryLight: '#EEF2FF', // Fond léger indigo
  secondary: '#8B5CF6', // Lavande douce
  secondaryLight: '#F5F3FF', // Fond lavande
  accent: '#F472B6', // Rose léger pour les highlights / émotion
  background: '#F9FAFB', // Blanc cassé très pur
  surface: '#FFFFFF',
  inputBackground: '#F3F4F6', // Gris très doux pour les champs
  text: '#111827', // Noir moderne
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

export const darkTheme = {
  primary: '#6366F1', // Indigo plus clair pour contraste sur noir
  primaryLight: '#1E1B4B', // Fond sombre indigo
  secondary: '#A78BFA', // Lavande vibrante
  secondaryLight: '#2E1065', // Fond sombre lavande
  accent: '#F9A8D4', // Rose pastel pour highlights
  background: '#0F172A', // Bleu nuit (Midnight Blue) ultra moderne
  surface: '#1E293B',
  inputBackground: '#334155', 
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
};

// Par défaut, fallback
export const COLORS = lightTheme;
