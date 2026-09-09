/**
 * Disbursement screen — mirrors lib/features/disbursement/screens/disbursement_screen.dart.
 * Lists disbursement reports (weekly / monthly earning summaries).
 */

import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
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
import { fetchDisbursementReports } from '@/services/data';
import type { DisbursementReport } from '@/types';

export default function DisbursementScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [reports, setReports] = useState<DisbursementReport[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchDisbursementReports(profile.id);
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('disbursement')} onBackPress={() => router.back()} />
      <FlatList
        data={reports || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Dimensions.paddingSizeDefault, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: Dimensions.paddingSizeSmall }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          reports === null ? (
            <LoadingShimmer count={3} height={120} />
          ) : (
            <EmptyState image={Images.transactionReportIcon} title={t('no_data_available')} />
          )
        }
        renderItem={({ item }) => {
          const statusColor = item.status === 'paid' ? colors.success : colors.warning;
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.period, { color: colors.textPrimary }]}>
                    {formatDate(item.period_start)} — {formatDate(item.period_end)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="swap-vertical" size={20} color={colors.primary} />
                </View>
              </View>

              <View style={[styles.summary, { borderTopColor: colors.border }]}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('total_earning')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    +{formatPrice(item.total_earning)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Withdrawn
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.warning }]}>
                    -{formatPrice(item.total_withdrawn)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('pending_balance')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {formatPrice(item.pending_balance)}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  period: {
    ...Typography.subtitle,
    fontWeight: '600',
  },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flexDirection: 'row',
    marginTop: Dimensions.paddingSizeDefault,
    paddingTop: Dimensions.paddingSizeDefault,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    ...Typography.caption,
  },
  summaryValue: {
    ...Typography.subtitle,
    fontWeight: '700',
    marginTop: 4,
  },
});
