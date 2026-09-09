/**
 * TitleWidget — mirrors lib/common/widgets/title_widget.dart.
 * Section header with title, optional count badge, and "view all" action.
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';

interface TitleWidgetProps {
  title: string;
  showOrderCount?: boolean;
  orderCount?: number;
  onTap?: () => void;
  actionLabel?: string;
}

export function TitleWidget({
  title,
  showOrderCount = false,
  orderCount = 0,
  onTap,
  actionLabel = 'View All',
}: TitleWidgetProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {showOrderCount && orderCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{orderCount}</Text>
          </View>
        ) : null}
      </View>

      {onTap ? (
        <TouchableOpacity onPress={onTap} style={styles.rightBtn} activeOpacity={0.7}>
          <Text style={[styles.action, { color: colors.primary }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Dimensions.paddingSizeSmall,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
  },
  title: {
    ...Typography.h3,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  action: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
});
