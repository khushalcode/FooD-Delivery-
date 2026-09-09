/**
 * Color resources — FoodHub Delivery App
 * Unified with the FoodHub Admin dashboard (Shopeers-inspired light SaaS palette).
 * Primary: #3B82F6 (vibrant blue) — matches admin dashboard.
 */

export const COLORS = {
  // Brand
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  primaryLight: '#EFF6FF',

  // Light theme — matches admin dashboard globals.css
  light: {
    primary: '#3B82F6',
    secondaryHeader: '#3B82F6',
    disabled: '#9CA3AF',
    hint: '#9CA3AF',
    card: '#FFFFFF',
    scaffoldBg: '#F4F5F7', // cool light gray canvas (same as admin)
    textPrimary: '#111827', // near-black headings
    textSecondary: '#6B7280', // medium gray
    textTertiary: '#9CA3AF', // light gray
    shadow: 'rgba(0, 0, 0, 0.04)',
    divider: '#E5E7EB',
    border: '#E5E7EB',
    inputFill: '#F3F4F6',
    success: '#10B981', // emerald green
    warning: '#F59E0B', // amber
    error: '#EF4444', // red
    surfaceVariant: '#F9FAFB',
    bottomNavBg: '#FFFFFF',
    overlayBg: 'rgba(0, 0, 0, 0.5)',
    accent: '#EFF6FF', // very light blue background
    accentForeground: '#1D4ED8',
  },

  // Dark theme — keeps the same primary blue for brand consistency
  dark: {
    primary: '#3B82F6',
    secondaryHeader: '#3B82F6',
    disabled: '#6B7280',
    hint: '#9CA3AF',
    card: '#1F2937',
    scaffoldBg: '#111827',
    textPrimary: '#FFFFFF',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    shadow: 'rgba(0, 0, 0, 0.3)',
    divider: '#374151',
    border: '#374151',
    inputFill: '#374151',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    surfaceVariant: '#1F2937',
    bottomNavBg: '#1F2937',
    overlayBg: 'rgba(0, 0, 0, 0.7)',
    accent: '#1E3A8A',
    accentForeground: '#93C5FD',
  },
} as const;

export type ThemeColors = typeof COLORS.light;
