/**
 * Transaction History screen — mirrors lib/features/my_account/screens/transaction_history_screen.dart.
 * Full list of all transactions with type filter chips.
 */

import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { formatDateTime } from '@/utils/date';
import { fetchTransactions } from '@/services/data';
import type { Transaction } from '@/types';

type FilterKey = 'all' | 'earning' | 'withdrawal' | 'cash_collected';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [items, setItems] = useState<Transaction[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchTransactions(profile.id);
      setItems(data);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load transactions');
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

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'earning', label: 'Earnings' },
    { key: 'withdrawal', label: 'Withdrawals' },
    { key: 'cash_collected', label: 'Cash' },
  ];

  const filtered = (items || []).filter((tx) => filter === 'all' || tx.type === filter);

  const iconForType = (type: Transaction['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'earning':
        return 'trending-up';
      case 'withdrawal':
        return 'cash-outline';
      case 'cash_collected':
        return 'wallet-outline';
      case 'adjustment':
        return 'swap-vertical';
      default:
        return 'receipt-outline';
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('transaction_history')} onBackPress={() => router.back()} />

      <View style={styles.filtersRow}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const active = item.key === filter;
            return (
              <TouchableOpacity
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceVariant,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: Dimensions.paddingSizeSmall }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          items === null ? (
            <LoadingShimmer count={5} height={70} />
          ) : (
            <EmptyState image={Images.transactionReportIcon} title={t('no_data_available')} />
          )
        }
        renderItem={({ item }) => {
          const isCredit = item.type === 'earning' || item.type === 'cash_collected';
          const statusColor =
            item.status === 'completed'
              ? colors.success
              : item.status === 'pending'
              ? colors.warning
              : item.status === 'on_hold'
              ? colors.warning
              : colors.error;

          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: (isCredit ? colors.success : colors.warning) + '15' }]}>
                <Ionicons
                  name={iconForType(item.type)}
                  size={20}
                  color={isCredit ? colors.success : colors.warning}
                />
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.reference || item.type.replace('_', ' ')}
                </Text>
                <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {formatDateTime(item.created_at)}
                </Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              <View>
                <Text
                  style={[
                    styles.amount,
                    {
                      color: isCredit ? colors.success : colors.warning,
                    },
                  ]}
                >
                  {isCredit ? '+' : '-'}
                  {formatPrice(item.amount)}
                </Text>
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
  filtersRow: {
    paddingVertical: Dimensions.paddingSizeSmall,
  },
  filtersContent: {
    paddingHorizontal: Dimensions.paddingSizeDefault,
    gap: Dimensions.paddingSizeSmall,
  },
  filterChip: {
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeExtraSmall + 2,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: Dimensions.paddingSizeSmall,
  },
  filterText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  listContent: {
    padding: Dimensions.paddingSizeDefault,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    gap: Dimensions.paddingSizeSmall,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    ...Typography.subtitle,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sub: {
    ...Typography.caption,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  amount: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
});
