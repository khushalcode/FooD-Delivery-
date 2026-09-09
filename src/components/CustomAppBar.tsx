/**
 * CustomAppBar — reusable header used across most screens.
 * Mirrors the AppBar usage pattern in Flutter screens (back button, title, actions).
 */

import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';

interface CustomAppBarProps {
  title: string;
  onBackPress?: () => void;
  showBack?: boolean;
  rightActions?: ReactNode;
  leading?: ReactNode;
  subtitle?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export function CustomAppBar({
  title,
  onBackPress,
  showBack = true,
  rightActions,
  leading,
  subtitle,
  backgroundColor,
  style,
}: CustomAppBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || colors.card,
          borderBottomColor: colors.border,
          paddingTop: insets.top,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.side, { minWidth: 40 }]}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : leading}
        </View>

        <View style={styles.titleWrap}>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={[styles.side, { alignItems: 'flex-end', minWidth: 40 }]}>
          {rightActions}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Dimensions.paddingSizeSmall,
    paddingBottom: Dimensions.paddingSizeSmall,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  side: {
    justifyContent: 'center',
  },
  backBtn: {
    padding: 4,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Dimensions.paddingSizeSmall,
  },
  title: {
    ...Typography.title,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
  },
});
