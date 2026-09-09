/**
 * Color resources — FoodHub brand.
 * Updated from original red (#DC2626) to FoodHub orange (#FF6B35) + deep red (#C7283F).
 * Matches the FoodHub admin panel theme.
 */

export const COLORS = {
  // Brand — FoodHub orange/red
  primary: '#FF6B35',
  primaryDark: '#C7283F',
  primaryLight: '#FF8C42',

  // Light theme
  light: {
    primary: '#FF6B35',
    secondaryHeader: '#C7283F',
    disabled: '#999D9F',
    hint: '#9F9F9F',
    card: '#FFFFFF',
    scaffoldBg: '#FFF8F2',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    textTertiary: '#9F9F9F',
    shadow: 'rgba(255,107,53,0.08)',
    divider: '#D1D5DB',
    border: '#E5E5E5',
    inputFill: '#FFF4EF',
    success: '#16A34A',
    warning: '#FFA500',
    error: '#DC2626',
    surfaceVariant: '#FFF4EF',
    bottomNavBg: '#FFFFFF',
    overlayBg: 'rgba(0, 0, 0, 0.5)',
  },

  // Dark theme
  dark: {
    primary: '#FF8C42',
    secondaryHeader: '#C7283F',
    disabled: '#6f7275',
    hint: '#bebebe',
    card: '#1A1A2E',
    scaffoldBg: '#0F0F1A',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#7C7C7C',
    shadow: 'rgba(255,107,53,0.12)',
    divider: '#3A3A4E',
    border: '#2A2A3E',
    inputFill: '#1F1F2E',
    success: '#16A34A',
    warning: '#FFA500',
    error: '#EF4444',
    surfaceVariant: '#1A1A2E',
    bottomNavBg: '#0F0F1A',
    overlayBg: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export type ThemeColors = typeof COLORS.light;
