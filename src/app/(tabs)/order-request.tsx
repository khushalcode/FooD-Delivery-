/**
 * Order Request screen — mirrors lib/features/order/screens/order_request_screen.dart.
 * Shows pending order requests awaiting vendor accept/decline.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
import { CustomButton } from '@/components/CustomButton';
import { EmptyState } from '@/components/EmptyState';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { Images } from '@/constants/images';
import { formatPrice } from '@/utils/price';
import { timeAgo } from '@/utils/date';
import { fetchCurrentOrders, updateOrderStatus } from '@/services/data';
import type { Order } from '@/types';

export default function OrderRequestScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [requests, setRequests] = useState<Order[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const all = await fetchCurrentOrders(profile.id);
      const pending = all.filter((o) => o.order_status === 'pending');
      setRequests(pending);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load requests');
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

  const handleAccept = async (order: Order) => {
    try {
      await updateOrderStatus(order.id, 'confirmed');
      snackbar.success(t('order_accepted'));
      load();
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to accept order');
    }
  };

  const handleReject = async (order: Order) => {
    try {
      await updateOrderStatus(order.id, 'canceled');
      snackbar.success(t('order_rejected'));
      load();
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to reject order');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('order_request')} showBack={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {requests === null ? (
          <LoadingShimmer count={3} height={140} />
        ) : requests.length === 0 ? (
          <EmptyState
            image={Images.request}
            title={t('no_order_available')}
            description="New order requests will appear here"
          />
        ) : (
          <View style={styles.list}>
            {requests.map((o) => (
              <View key={o.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.orderNumber, { color: colors.textPrimary }]}>
                    {o.order_number}
                  </Text>
                  <Text style={[styles.time, { color: colors.textSecondary }]}>
                    {timeAgo(o.created_at)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t('customer')}</Text>
                  <Text style={[styles.value, { color: colors.textPrimary }]}>{o.customer_name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t('items')}</Text>
                  <Text style={[styles.value, { color: colors.textPrimary }]}>
                    {o.items?.length || 0} {t('items')}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t('total_amount')}</Text>
                  <Text style={[styles.value, { color: colors.primary, fontWeight: '700' }]}>
                    {formatPrice(o.total_amount)}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <CustomButton
                    buttonText={t('reject')}
                    variant="outline"
                    onPress={() => handleReject(o)}
                    style={{ flex: 1, marginRight: Dimensions.paddingSizeSmall }}
                  />
                  <CustomButton
                    buttonText={t('accept')}
                    onPress={() => handleAccept(o)}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
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
  list: {
    gap: Dimensions.paddingSizeSmall,
  },
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Dimensions.paddingSizeSmall,
  },
  orderNumber: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
  time: {
    ...Typography.caption,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    ...Typography.body,
  },
  value: {
    ...Typography.body,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginTop: Dimensions.paddingSizeDefault,
  },
});
