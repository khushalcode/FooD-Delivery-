/**
 * OrderWidget — mirrors lib/common/widgets/order_widget.dart.
 * Compact card showing order info: order number, customer, status, total, items count.
 */

import { Image, Linking, StyleSheet, Text, TouchableOpacity, View, type DimensionValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { Images } from '@/constants/images';
import { formatPrice } from '@/utils/price';
import { timeAgo } from '@/utils/date';
import type { Order } from '@/types';

interface OrderWidgetProps {
  order: Order;
  cardWidth?: DimensionValue;
  isRunningOrder?: boolean;
  onTap?: () => void;
}

const STATUS_COLORS: Record<Order['order_status'], string> = {
  pending: '#FFA500',
  confirmed: '#2196F3',
  accepted: '#9C27B0',
  processing: '#FF9800',
  handover: '#FF5722',
  picked_up: '#00BCD4',
  delivered: '#28A745',
  canceled: '#DC2626',
  failed: '#DC2626',
  refunded: '#607D8B',
  returned: '#795548',
};

export function OrderWidget({ order, cardWidth = '100%', isRunningOrder, onTap }: OrderWidgetProps) {
  const { colors } = useTheme();

  const statusColor = STATUS_COLORS[order.order_status] || colors.primary;
  const itemCount = order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;
  const isParcel = order.order_type === 'parcel';
  const isPrescription = order.prescription_order || order.order_type === 'prescription';
  const isPickedUp = order.order_status === 'picked_up';

  // V4.0 — 4-branch destination logic for the Direction button
  const directionDestination: { lat: number; lng: number } | null = (() => {
    if (isParcel) {
      if (isPickedUp && order.receiver_details?.latitude && order.receiver_details?.longitude) {
        return { lat: Number(order.receiver_details.latitude), lng: Number(order.receiver_details.longitude) };
      }
      if (order.delivery_latitude != null && order.delivery_longitude != null) {
        return { lat: order.delivery_latitude, lng: order.delivery_longitude };
      }
    }
    if (!isParcel && isPickedUp && order.delivery_latitude != null && order.delivery_longitude != null) {
      return { lat: order.delivery_latitude, lng: order.delivery_longitude };
    }
    if (order.store_lat != null && order.store_lng != null) {
      return { lat: order.store_lat, lng: order.store_lng };
    }
    return null;
  })();

  const onDirection = () => {
    if (!directionDestination) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${directionDestination.lat},${directionDestination.lng}&mode=d`;
    Linking.openURL(url).catch(() => {});
  };

  const storeName = order.store_name ?? 'Store';
  const storeAddress = order.store_address ?? null;
  const deliveryAddressText =
    typeof order.delivery_address === 'string'
      ? order.delivery_address
      : order.delivery_address?.address ?? null;

  return (
    <TouchableOpacity
      onPress={onTap}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          width: cardWidth,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.orderLabel, { color: colors.textSecondary }]}>
            {isParcel ? 'PARCEL' : 'ORDER'} #{order.order_number}
          </Text>
          <Text style={[styles.orderNumber, { color: colors.textPrimary }]} numberOfLines={1}>
            {order.customer_name}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {timeAgo(order.created_at)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor + '20', borderColor: statusColor },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {order.order_status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* V4.0: store row */}
      <View style={styles.storeRow}>
        <Image
          source={isParcel ? Images.house : Images.markerStore ?? Images.restaurantMarker}
          style={styles.storeIcon}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.storeName, { color: colors.textPrimary }]} numberOfLines={1}>
            {storeName}
          </Text>
          {storeAddress ? (
            <Text style={[styles.storeAddr, { color: colors.textSecondary }]} numberOfLines={1}>
              {storeAddress}
            </Text>
          ) : null}
        </View>
      </View>

      {/* V4.0: location row */}
      {deliveryAddressText ? (
        <View style={styles.locationRow}>
          <Image source={Images.locationMarker} style={styles.storeIcon} resizeMode="contain" />
          <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={2}>
            {deliveryAddressText}
          </Text>
        </View>
      ) : null}

      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.customerName, { color: colors.textPrimary }]} numberOfLines={1}>
            {order.customer_name}
          </Text>
          <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
            {!isParcel && !isPrescription && itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} · `
              : ''}
            {order.order_type.replace('_', ' ')}
          </Text>
        </View>

        <View style={styles.amountWrap}>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {formatPrice(order.total_amount)}
          </Text>
          <View style={[styles.paymentBadge, {
            backgroundColor: order.payment_status === 'paid' ? colors.success + '20' : colors.warning + '20',
          }]}>
            <Ionicons
              name={order.payment_status === 'paid' ? 'checkmark-circle' : 'time-outline'}
              size={12}
              color={order.payment_status === 'paid' ? colors.success : colors.warning}
            />
            <Text
              style={[
                styles.paymentStatus,
                {
                  color:
                    order.payment_status === 'paid' ? colors.success : colors.warning,
                },
              ]}
            >
              {order.payment_status}
            </Text>
          </View>
        </View>
      </View>

      {/* V4.0: action footer with Direction + Details buttons */}
      <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity onPress={onDirection} disabled={!directionDestination} style={[styles.actionBtn, { opacity: directionDestination ? 1 : 0.4 }]}>
          <Image source={Images.riderNavigation ?? Images.location} style={styles.actionIcon} resizeMode="contain" />
          <Text style={[styles.actionText, { color: colors.primary }]}>{'Direction'}</Text>
        </TouchableOpacity>
        <View style={{ width: 1, backgroundColor: colors.border, marginVertical: 4 }} />
        <TouchableOpacity onPress={onTap} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: colors.primary }]}>{'Details'}</Text>
        </TouchableOpacity>
      </View>

      {isRunningOrder ? (
        <View style={[styles.footer, { backgroundColor: colors.surfaceVariant }]}>
          <Image source={Images.deliveryManMarker} style={styles.footerIcon} resizeMode="contain" />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {order.delivery_man_name || 'Assigning delivery partner...'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    overflow: 'hidden',
    padding: Dimensions.paddingSizeDefault,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 10,
    fontFamily: 'Roboto-Medium',
    letterSpacing: 1,
    marginBottom: 2,
  },
  orderNumber: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
  time: {
    ...Typography.caption,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Dimensions.paddingSizeSmall,
  },
  // V4.0: store row
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  storeIcon: { width: 18, height: 18 },
  storeName: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  storeAddr: {
    fontSize: 11,
    fontFamily: 'Roboto-Regular',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    flex: 1,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
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
  customerName: {
    ...Typography.body,
    fontWeight: '600',
  },
  itemCount: {
    ...Typography.caption,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  amount: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  paymentStatus: {
    fontSize: 10,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  // V4.0: action footer
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  actionIcon: { width: 16, height: 16 },
  actionText: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  footer: {
    marginTop: Dimensions.paddingSizeSmall,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Dimensions.paddingSizeSmall,
    borderRadius: Dimensions.radiusSmall,
    gap: Dimensions.paddingSizeSmall,
  },
  footerIcon: {
    width: 18,
    height: 18,
  },
  footerText: {
    flex: 1,
    ...Typography.bodySmall,
  },
});
