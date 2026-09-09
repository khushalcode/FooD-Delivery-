/**
 * Orders screen — mirrors lib/features/order/screens/order_screen.dart.
 * Lists all vendor orders with filter chips by status.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTranslation } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { CustomAppBar } from '@/components/CustomAppBar';
import { OrderWidget } from '@/components/OrderWidget';
import { EmptyState } from '@/components/EmptyState';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { Images } from '@/constants/images';
import { fetchAllOrders } from '@/services/data';
import type { Order } from '@/types';

type FilterKey = 'all' | 'pending' | 'confirmed' | 'processing' | 'delivered' | 'canceled';

export default function OrdersScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchAllOrders(profile.id);
      setOrders(data);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load orders');
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
    { key: 'all', label: t('all_orders') },
    { key: 'pending', label: t('pending') },
    { key: 'confirmed', label: t('confirmed') },
    { key: 'processing', label: t('processing') },
    { key: 'delivered', label: t('delivered') },
    { key: 'canceled', label: t('canceled') },
  ];

  const filtered = (orders || []).filter((o) => {
    if (filter === 'all') return true;
    return o.order_status === filter;
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('orders')} showBack={false} />

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
                activeOpacity={0.7}
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
          orders === null ? (
            <LoadingShimmer count={4} height={140} />
          ) : (
            <EmptyState image={Images.bag} title={t('no_order_found')} />
          )
        }
        renderItem={({ item }) => (
          <OrderWidget
            order={item}
            onTap={() =>
              router.push({ pathname: '/order-details', params: { id: item.id } })
            }
          />
        )}
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
});
