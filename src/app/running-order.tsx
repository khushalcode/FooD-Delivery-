/**
 * Running Order screen — mirrors lib/features/order/screens/running_order_screen.dart.
 * Lists currently-active orders (accepted, processing, handover, picked_up).
 */

import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTranslation } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Dimensions } from '@/constants/dimensions';
import { CustomAppBar } from '@/components/CustomAppBar';
import { OrderWidget } from '@/components/OrderWidget';
import { EmptyState } from '@/components/EmptyState';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { Images } from '@/constants/images';
import { fetchCurrentOrders } from '@/services/data';
import type { Order } from '@/types';

export default function RunningOrderScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchCurrentOrders(profile.id);
      const running = data.filter(
        (o) => !['pending', 'delivered', 'canceled', 'failed', 'returned'].includes(o.order_status)
      );
      setOrders(running);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load running orders');
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
      <CustomAppBar title={t('running_order')} onBackPress={() => router.back()} />
      <FlatList
        data={orders || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Dimensions.paddingSizeDefault, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: Dimensions.paddingSizeSmall }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          orders === null ? (
            <LoadingShimmer count={3} height={140} />
          ) : (
            <EmptyState image={Images.bag} title={t('no_order_available')} />
          )
        }
        renderItem={({ item }) => (
          <OrderWidget
            order={item}
            isRunningOrder
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
});
