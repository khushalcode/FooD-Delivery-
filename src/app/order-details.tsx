/**
 * Order Details screen — mirrors lib/features/order/screens/order_details_screen.dart.
 * Shows full order info, items breakdown, customer details, delivery info, status actions.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import { CustomButton } from '@/components/CustomButton';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { formatPrice } from '@/utils/price';
import { formatDateTime } from '@/utils/date';
import { fetchOrderById, updateOrderStatus } from '@/services/data';
import type { Order } from '@/types';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!params.id) return;
    try {
      setLoading(true);
      const o = await fetchOrderById(params.id);
      setOrder(o);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [params.id, snackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (next: Order['order_status']) => {
    if (!order) return;
    try {
      await updateOrderStatus(order.id, next);
      snackbar.success('Order status updated');
      setOrder({ ...order, order_status: next });
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to update status');
    }
  };

  if (loading || !order) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
        <CustomAppBar title={t('order_details')} onBackPress={() => router.back()} />
        <View style={{ padding: Dimensions.paddingSizeDefault }}>
          <LoadingShimmer count={3} height={100} />
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = order.items.reduce((s, it) => s + it.total, 0);
  const grandTotal = subtotal + order.delivery_charge;

  const statusActions: { label: string; next: Order['order_status']; variant?: 'primary' | 'outline' }[] = [];
  if (order.order_status === 'pending') {
    statusActions.push(
      { label: t('reject'), next: 'canceled', variant: 'outline' },
      { label: t('accept'), next: 'confirmed' }
    );
  } else if (order.order_status === 'confirmed') {
    statusActions.push({ label: t('processing'), next: 'processing' });
  } else if (order.order_status === 'processing') {
    statusActions.push({ label: t('handover'), next: 'handover' });
  } else if (order.order_status === 'handover') {
    statusActions.push({ label: t('picked_up'), next: 'picked_up' });
  } else if (order.order_status === 'picked_up') {
    statusActions.push({ label: t('delivered'), next: 'delivered' });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={`${t('order_details')}`} subtitle={order.order_number} onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            {t('order_status')}
          </Text>
          <Text style={[styles.statusValue, { color: colors.primary }]}>
            {order.order_status.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatDateTime(order.created_at)}
          </Text>
        </View>

        {/* Customer card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t('customer')}
          </Text>
          <View style={styles.customerRow}>
            <View style={[styles.customerAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.customerInitial}>
                {order.customer_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, { color: colors.textPrimary }]}>
                {order.customer_name}
              </Text>
              <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>
                {order.customer_phone}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: colors.primary + '15' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/chat', params: { conversation_id: order.id } })}
                style={[styles.contactBtn, { backgroundColor: colors.primary + '15' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Items card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t('items')} ({order.items.length})
          </Text>
          {order.items.map((it, i) => (
            <View
              key={it.id}
              style={[
                styles.itemRow,
                i < order.items.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth } : {},
              ]}
            >
              <View style={[styles.itemImgWrap, { backgroundColor: colors.surfaceVariant }]}>
                {it.product_image ? (
                  <Image source={{ uri: it.product_image }} style={styles.itemImg} />
                ) : (
                  <Ionicons name="fast-food-outline" size={22} color={colors.textSecondary} />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {it.product_name}
                </Text>
                {it.variant ? (
                  <Text style={[styles.itemVariant, { color: colors.textSecondary }]}>
                    {it.variant} · {t('qty')} {it.quantity}
                  </Text>
                ) : (
                  <Text style={[styles.itemVariant, { color: colors.textSecondary }]}>
                    {t('qty')} {it.quantity}
                  </Text>
                )}
                {it.add_ons.length > 0 ? (
                  <Text style={[styles.itemAddons, { color: colors.textSecondary }]} numberOfLines={1}>
                    Add-ons: {it.add_ons.map((a) => a.name).join(', ')}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.itemPrice, { color: colors.textPrimary }]}>
                {formatPrice(it.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Order summary */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t('order_summary')}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('subtotal')}</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {formatPrice(subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('delivery_charge')}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {formatPrice(order.delivery_charge)}
            </Text>
          </View>
          <View style={[styles.summaryRow, { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Dimensions.paddingSizeSmall, marginTop: 4 }]}>
            <Text style={[styles.grandLabel, { color: colors.textPrimary }]}>{t('total_amount')}</Text>
            <Text style={[styles.grandValue, { color: colors.primary }]}>{formatPrice(grandTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('payment_method')}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {order.payment_method.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('payment_status')}
            </Text>
            <Text style={[styles.summaryValue, { color: order.payment_status === 'paid' ? colors.success : colors.warning }]}>
              {order.payment_status}
            </Text>
          </View>
        </View>

        {/* Delivery info */}
        {order.delivery_address ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t('delivery_address')}
            </Text>
            <View style={styles.deliveryRow}>
              <Image source={Images.location} style={styles.deliveryIcon} resizeMode="contain" />
              <Text style={[styles.deliveryText, { color: colors.textPrimary }]}>
                {typeof order.delivery_address === 'string'
                  ? order.delivery_address
                  : order.delivery_address?.address ?? order.delivery_address_text ?? ''}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Status actions */}
        {statusActions.length > 0 ? (
          <View style={styles.statusActionsRow}>
            {statusActions.map((a, i) => (
              <CustomButton
                key={i}
                buttonText={a.label}
                variant={a.variant}
                onPress={() => handleStatus(a.next)}
                style={{ flex: 1, marginRight: i < statusActions.length - 1 ? Dimensions.paddingSizeSmall : 0 }}
              />
            ))}
          </View>
        ) : null}

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
  statusBanner: {
    borderRadius: Dimensions.radiusDefault,
    padding: Dimensions.paddingSizeDefault,
    alignItems: 'center',
    marginBottom: Dimensions.paddingSizeDefault,
  },
  statusLabel: {
    ...Typography.caption,
  },
  statusValue: {
    ...Typography.h2,
    fontWeight: '900',
    marginTop: 4,
  },
  timeText: {
    ...Typography.caption,
    marginTop: 4,
  },
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  cardTitle: {
    ...Typography.title,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    ...Typography.body,
    fontWeight: '600',
  },
  customerPhone: {
    ...Typography.caption,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    gap: Dimensions.paddingSizeExtraSmall,
  },
  contactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Dimensions.paddingSizeSmall,
    gap: Dimensions.paddingSizeSmall,
  },
  itemImgWrap: {
    width: 44,
    height: 44,
    borderRadius: Dimensions.radiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.body,
    fontWeight: '600',
  },
  itemVariant: {
    ...Typography.caption,
    marginTop: 2,
  },
  itemAddons: {
    ...Typography.caption,
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemPrice: {
    ...Typography.body,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    ...Typography.body,
  },
  summaryValue: {
    ...Typography.body,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  grandLabel: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
  grandValue: {
    ...Typography.h3,
    fontWeight: '900',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Dimensions.paddingSizeSmall,
  },
  deliveryIcon: {
    width: 22,
    height: 22,
  },
  deliveryText: {
    flex: 1,
    ...Typography.body,
  },
  statusActionsRow: {
    flexDirection: 'row',
    marginTop: Dimensions.paddingSizeDefault,
  },
});
