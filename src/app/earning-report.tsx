/**
 * Earning Report screen — mirrors lib/features/earning_reports/screens/earning_report_screen.dart.
 * Shows earning breakdown with period selector, stats cards, and earning chart.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTranslation } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { Images } from '@/constants/images';
import { CustomAppBar } from '@/components/CustomAppBar';
import { EmptyState } from '@/components/EmptyState';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { formatPrice } from '@/utils/price';
import { fetchEarningReports } from '@/services/data';
import type { EarningReport } from '@/types';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function EarningReportScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [reports, setReports] = useState<EarningReport[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('weekly');

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchEarningReports(profile.id);
      setReports(data);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load reports');
    }
  }, [profile, snackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const periods: { key: Period; label: string }[] = [
    { key: 'daily', label: t('daily') },
    { key: 'weekly', label: t('weekly') },
    { key: 'monthly', label: t('monthly') },
    { key: 'yearly', label: t('yearly') },
  ];

  const selected = (reports || []).find((r) => r.period === period) || (reports || [])[0];

  const breakdown: { label: string; value: number; icon: keyof typeof Ionicons.glyphMap; color: string; image?: number }[] = [
    { label: t('total_earning'), value: selected?.total_earning || 0, icon: 'trending-up', color: colors.primary, image: Images.totalEarning },
    { label: t('delivery_fee_earned'), value: selected?.delivery_fee_earned || 0, icon: 'bicycle', color: '#2196F3', image: Images.deliveryFeeEarned },
    { label: t('delivery_tips_earned'), value: selected?.delivery_tips_earned || 0, icon: 'cash', color: '#28A745', image: Images.deliveryTipsEarned },
    { label: t('referral_earning'), value: selected?.referral_earning || 0, icon: 'gift', color: '#FF9800', image: Images.referCoin },
    { label: t('ride_income'), value: selected?.ride_income || 0, icon: 'car', color: '#9C27B0', image: Images.riderRideCar },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('earning_report')} onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Period selector */}
        <View style={styles.periodRow}>
          {periods.map((p) => {
            const active = p.key === period;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => setPeriod(p.key)}
                style={[
                  styles.periodChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceVariant,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.periodText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {reports === null ? (
          <LoadingShimmer count={3} height={80} />
        ) : !selected ? (
          <EmptyState image={Images.earningReport} title={t('no_data_available')} />
        ) : (
          <>
            {/* Hero stat */}
            <View style={[styles.hero, { backgroundColor: colors.primary }]}>
              <Image source={Images.earningMenu} style={styles.heroIcon} resizeMode="contain" />
              <View>
                <Text style={styles.heroLabel}>{selected.period_label}</Text>
                <Text style={styles.heroValue}>{formatPrice(selected.total_earning)}</Text>
                <Text style={styles.heroSubLabel}>
                  {selected.total_orders} {t('orders')} · {selected.total_rides} {t('total_ride')}
                </Text>
              </View>
            </View>

            {/* Breakdown */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('income_statement')}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {breakdown.map((b, i) => (
                <View
                  key={i}
                  style={[
                    styles.breakdownRow,
                    i < breakdown.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth } : {},
                  ]}
                >
                  <View style={[styles.breakdownIcon, { backgroundColor: b.color + '15' }]}>
                    {b.image ? (
                      <Image source={b.image} style={[styles.breakdownImg, { tintColor: b.color }]} resizeMode="contain" />
                    ) : (
                      <Ionicons name={b.icon} size={18} color={b.color} />
                    )}
                  </View>
                  <Text style={[styles.breakdownLabel, { color: colors.textPrimary }]}>{b.label}</Text>
                  <Text style={[styles.breakdownValue, { color: b.color }]}>
                    {formatPrice(b.value)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Mini bar chart */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('weekly')} {t('earning_report')}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.chartRow}>
                {(reports || []).slice(0, 4).map((r, i) => {
                  const maxVal = Math.max(...(reports || []).map((x) => x.total_earning), 1);
                  const height = (r.total_earning / maxVal) * 120;
                  return (
                    <View key={i} style={styles.chartBarWrap}>
                      <View style={[styles.chartBar, { height, backgroundColor: colors.primary }]} />
                      <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
                        {r.period_label.substring(0, 3)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
        <View style={{ height: Dimensions.paddingSizeExtraLarge }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    padding: Dimensions.paddingSizeDefault,
    flexGrow: 1,
  },
  periodRow: {
    flexDirection: 'row',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  periodChip: {
    flex: 1,
    paddingVertical: Dimensions.paddingSizeSmall,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  hero: {
    borderRadius: Dimensions.radiusDefault,
    padding: Dimensions.paddingSizeLarge,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  heroIcon: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
  },
  heroLabel: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.85)',
  },
  heroValue: {
    ...Typography.h1,
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 4,
  },
  heroSubLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    ...Typography.title,
    marginTop: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Dimensions.paddingSizeSmall,
    gap: Dimensions.paddingSizeSmall,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownImg: {
    width: 18,
    height: 18,
  },
  breakdownLabel: {
    flex: 1,
    ...Typography.body,
  },
  breakdownValue: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 150,
    paddingVertical: Dimensions.paddingSizeSmall,
  },
  chartBarWrap: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 32,
    borderRadius: 4,
  },
  chartLabel: {
    ...Typography.caption,
    marginTop: 4,
  },
});
