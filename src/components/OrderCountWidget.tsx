/**
 * OrderCountWidget — mirrors lib/features/home/widgets/order_count_widget.dart.
 *
 * Shows a three-card row: today's orders, this week's orders, total orders.
 * Uses shimmer-loading placeholders when the profile data is still loading.
 */

import { Image, StyleSheet, Text, View, ImageSourcePropType } from 'react-native';
import { useTranslation } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Images } from '@/constants/images';
import { LoadingShimmer } from './LoadingShimmer';

interface OrderCountWidgetProps {
  todaysCount: number | null | undefined;
  thisWeekCount: number | null | undefined;
  totalCount: number | null | undefined;
  /** When true, render the compact variant used when earnings are enabled. */
  compact?: boolean;
}

function CountCard({
  icon,
  label,
  value,
  color,
  loading,
  compact,
}: {
  icon: ImageSourcePropType;
  label: string;
  value: number | null | undefined;
  color: string;
  loading: boolean;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        compact ? styles.compactCard : styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Image
        source={icon}
        style={compact ? styles.compactIcon : styles.icon}
        resizeMode="contain"
      />
      <View style={styles.textWrap}>
        {loading ? (
          <LoadingShimmer style={styles.valueShimmer} />
        ) : (
          <Text style={[styles.value, { color: colors.textPrimary }]}>{String(value ?? 0)}</Text>
        )}
        <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </View>
  );
}

export function OrderCountWidget({
  todaysCount,
  thisWeekCount,
  totalCount,
  compact = false,
}: OrderCountWidgetProps) {
  const { t } = useTranslation();
  const loading = todaysCount == null && thisWeekCount == null && totalCount == null;
  return (
    <View style={styles.row}>
      <CountCard
        icon={Images.house}
        label={t('todays_orders')}
        value={todaysCount}
        color="#FFC107"
        loading={loading}
        compact={compact}
      />
      <CountCard
        icon={Images.calenderIcon ?? Images.house}
        label={t('this_week_orders')}
        value={thisWeekCount}
        color="#4CAF50"
        loading={loading}
        compact={compact}
      />
      <CountCard
        icon={Images.list}
        label={t('total_orders')}
        value={totalCount}
        color="#2196F3"
        loading={loading}
        compact={compact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  icon: {
    width: 36,
    height: 36,
    marginBottom: 6,
  },
  compactIcon: {
    width: 22,
    height: 22,
  },
  textWrap: {
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
  },
  valueShimmer: {
    width: 40,
    height: 20,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Roboto-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default OrderCountWidget;
