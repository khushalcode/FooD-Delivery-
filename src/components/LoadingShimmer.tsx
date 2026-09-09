/**
 * LoadingShimmer — mirrors lib/common/widgets/order_shimmer_widget.dart.
 * A simple animated placeholder while data loads.
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useTheme } from '@/constants/theme';
import { Dimensions } from '@/constants/dimensions';

interface LoadingShimmerProps {
  count?: number;
  height?: number;
  style?: object;
}

export function LoadingShimmer({ count = 1, height = 80, style }: LoadingShimmerProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.shimmer,
            {
              height,
              backgroundColor: colors.surfaceVariant,
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Dimensions.paddingSizeSmall,
  },
  shimmer: {
    borderRadius: Dimensions.radiusDefault,
    width: '100%',
  },
});
