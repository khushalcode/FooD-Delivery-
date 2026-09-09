/**
 * DottedDivider — mirrors lib/common/widgets/dotted_divider.dart.
 * Renders a horizontal dashed-line divider using N small segments.
 */

import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';

interface DottedDividerProps {
  width?: DimensionValue;
  dashWidth?: number;
  dashGap?: number;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
}

export function DottedDivider({
  width = '100%',
  dashWidth = 4,
  dashGap = 3,
  color = '#D0D5DD',
  thickness = 1,
  style,
}: DottedDividerProps) {
  // Render enough segments to cover the width — when width is a percentage
  // we approximate using the parent's width via flex-grow on each segment.
  const isPercent = typeof width === 'string' && width.endsWith('%');
  const segmentCount = isPercent ? 80 : Math.max(1, Math.floor(Number(width) / (dashWidth + dashGap)));

  return (
    <View style={[{ width, flexDirection: 'row', overflow: 'hidden' }, style]}>
      {Array.from({ length: segmentCount }).map((_, i) => (
        <View
          key={i}
          style={{
            width: dashWidth,
            height: thickness,
            backgroundColor: color,
            marginRight: dashGap,
            flexGrow: isPercent ? 1 : 0,
            flexShrink: isPercent ? 0 : 1,
          }}
        />
      ))}
    </View>
  );
}

export default DottedDivider;
