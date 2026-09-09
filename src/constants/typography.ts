/**
 * Typography — mirrors lib/util/styles.dart (robotoRegular/Medium/SemiBold/Bold/Black).
 * V4.0 of the Flutter app uses Roboto (was Poppins in earlier versions).
 * Font family is loaded via expo-font in app start.
 */

import { Dimensions } from './dimensions';

export const FontFamily = {
  regular: 'Roboto-Regular',
  medium: 'Roboto-Medium',
  semiBold: 'Roboto-Medium', // Roboto doesn't have SemiBold, use Medium
  bold: 'Roboto-Bold',
  black: 'Roboto-Black',
} as const;

export type FontFamilyKey = keyof typeof FontFamily;

// Font size scale
export const FontSize = {
  extraSmall: Dimensions.fontSizeExtraSmall,
  small: Dimensions.fontSizeSmall,
  default: Dimensions.fontSizeDefault,
  large: Dimensions.fontSizeLarge,
  extraLarge: Dimensions.fontSizeExtraLarge,
  overLarge: Dimensions.fontSizeOverLarge,
} as const;

// Font weight helpers — using `as const` to get literal types for RN compatibility
export const FontWeights = {
  regular: '400' as '400',
  medium: '500' as '500',
  semiBold: '600' as '600',
  bold: '700' as '700',
  black: '900' as '900',
};

export type FontWeight = keyof typeof FontWeights;

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'button'
  | 'label';

export interface TypographyStyle {
  fontFamily: string;
  fontWeight: '400' | '500' | '600' | '700' | '900';
  fontSize: number;
}

export const Typography: Record<TypographyVariant, TypographyStyle> = {
  h1: { fontFamily: FontFamily.bold, fontWeight: '700', fontSize: 28 },
  h2: { fontFamily: FontFamily.bold, fontWeight: '700', fontSize: 22 },
  h3: { fontFamily: FontFamily.medium, fontWeight: '500', fontSize: 18 },
  title: { fontFamily: FontFamily.medium, fontWeight: '500', fontSize: FontSize.large },
  subtitle: { fontFamily: FontFamily.medium, fontWeight: '500', fontSize: FontSize.default },
  body: { fontFamily: FontFamily.regular, fontWeight: '400', fontSize: FontSize.default },
  bodySmall: { fontFamily: FontFamily.regular, fontWeight: '400', fontSize: FontSize.small },
  caption: { fontFamily: FontFamily.regular, fontWeight: '400', fontSize: FontSize.extraSmall },
  button: { fontFamily: FontFamily.bold, fontWeight: '700', fontSize: FontSize.large },
  label: { fontFamily: FontFamily.medium, fontWeight: '500', fontSize: FontSize.small },
};
