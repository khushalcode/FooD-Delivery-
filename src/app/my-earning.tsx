/**
 * My Earning screen — mirrors lib/features/my_account/screens/my_earning_screen.dart.
 * Shows earning stats with a period selector and recent earning transactions.
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
import { formatDate } from '@/utils/date';
import { fetchTransactions } from '@/services/data';
import type { Transaction } from '@/types';

type Period = 'today' | 'weekly' | 'monthly' | 'all';

export default function MyEarningScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [period, setPeriod] = useState<Period>('today');
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchTransactions(profile.id);
      setTransactions(data.filter((tx) => tx.type === 'earning'));
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load earnings');
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

  const filterByPeriod = (txs: Transaction[]): Transaction[] => {
    const now = Date.now();
    return txs.filter((tx) => {
      const ts = new Date(tx.created_at).getTime();
      if (period === 'today') return now - ts < 24 * 60 * 60 * 1000;
      if (period === 'weekly') return now - ts < 7 * 24 * 60 * 60 * 1000;
      if (period === 'monthly') return now - ts < 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  };

  const filtered = filterByPeriod(transactions || []);
  const total = filtered.reduce((s, tx) => s + tx.amount, 0);

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: t('today_earnings') },
    { key: 'weekly', label: t('weekly_earnings') },
    { key: 'monthly', label: t('monthly_earnings') },
    { key: 'all', label: t('total_earning') },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar
        title={t('my_earning')}
        onBackPress={() => router.back()}
        rightActions={
          <TouchableOpacity
            onPress={() => router.push('/my-earning-filter')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="filter" size={22} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Earning hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Image source={Images.earningMenu} style={styles.heroIcon} resizeMode="contain" />
          <View>
            <Text style={styles.heroLabel}>
              {periods.find((p) => p.key === period)?.label}
            </Text>
            <Text style={styles.heroValue}>{formatPrice(total)}</Text>
            <Text style={styles.heroSubLabel}>
              {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>
        </View>

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
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodText,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transactions */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t('transaction_history')}
          </Text>

          {transactions === null ? (
            <LoadingShimmer count={4} height={50} />
          ) : filtered.length === 0 ? (
            <EmptyState image={Images.coin} title={t('no_data_available')} />
          ) : (
            filtered.map((tx) => (
              <View
                key={tx.id}
                style={[styles.txRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.txInfo}>
                  <View style={[styles.txIcon, { backgroundColor: colors.success + '15' }]}>
                    <Ionicons name="trending-up" size={16} color={colors.success} />
                  </View>
                  <View>
                    <Text style={[styles.txLabel, { color: colors.textPrimary }]}>
                      {tx.reference || tx.type}
                    </Text>
                    <Text style={[styles.txSub, { color: colors.textSecondary }]}>
                      {formatDate(tx.created_at)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.txAmount, { color: colors.success }]}>
                  +{formatPrice(tx.amount)}
                </Text>
              </View>
            ))
          )}
        </View>

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
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  periodChip: {
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeExtraSmall,
    borderRadius: 16,
    borderWidth: 1,
  },
  periodText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
  },
  cardTitle: {
    ...Typography.title,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Dimensions.paddingSizeSmall,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
    flex: 1,
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txLabel: {
    ...Typography.body,
    fontWeight: '600',
  },
  txSub: {
    ...Typography.caption,
    marginTop: 2,
  },
  txAmount: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
});
