/**
 * Dimensions — mirrors lib/util/dimensions.dart exactly.
 * Used to keep spacing consistent with the original Flutter design.
 */

export const Dimensions = {
  // Font sizes
  fontSizeExtraSmall: 10,
  fontSizeSmall: 12,
  fontSizeDefault: 14,
  fontSizeLarge: 16,
  fontSizeExtraLarge: 18,
  fontSizeOverLarge: 24,

  // Padding sizes
  paddingSizeExtraSmall: 5,
  paddingSizeSmall: 10,
  paddingSizeDefault: 15,
  paddingSizeLarge: 20,
  paddingSizeExtraLarge: 25,
  paddingSizeOverLarge: 30,

  // Radius sizes
  radiusSmall: 5,
  radiusMedium: 8,
  radiusDefault: 10,
  radiusLarge: 15,
  radiusExtraLarge: 20,

  // Other
  messageInputLength: 250,
  webMaxWidth: 1170,
} as const;

export type DimensionKey = keyof typeof Dimensions;
