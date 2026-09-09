/**
 * Ride Details screen — mirrors lib/features/ride_module/ride_order/screens/ride_details_screen.dart.
 * Shows full ride info, customer, route, fare breakdown, and status actions (start / complete / cancel).
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
import { fetchRideById, updateRideStatus } from '@/services/data';
import type { Ride } from '@/types';

const STATUS_COLORS: Record<Ride['status'], string> = {
  pending: '#FFA500',
  accepted: '#2196F3',
  ongoing: '#9C27B0',
  completed: '#28A745',
  cancelled: '#DC2626',
};

export default function RideDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!params.id) return;
    try {
      setLoading(true);
      const r = await fetchRideById(params.id);
      setRide(r);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load ride');
    } finally {
      setLoading(false);
    }
  }, [params.id, snackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (next: Ride['status']) => {
    if (!ride) return;
    try {
      await updateRideStatus(ride.id, next);
      snackbar.success('Ride status updated');
      setRide({ ...ride, status: next });
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to update status');
    }
  };

  if (loading || !ride) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
        <CustomAppBar title={t('ride_details')} onBackPress={() => router.back()} />
        <View style={{ padding: Dimensions.paddingSizeDefault }}>
          <LoadingShimmer count={3} height={100} />
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLORS[ride.status];

  const statusActions: { label: string; next: Ride['status']; variant?: 'primary' | 'outline' | 'danger' }[] = [];
  if (ride.status === 'accepted') {
    statusActions.push({ label: t('start_ride'), next: 'ongoing' });
  } else if (ride.status === 'ongoing') {
    statusActions.push({ label: t('complete_ride'), next: 'completed' });
  }
  if (['accepted', 'ongoing'].includes(ride.status)) {
    statusActions.push({ label: t('cancel_ride'), next: 'cancelled', variant: 'outline' });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('ride_details')} onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusColor + '15' }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>{t('ride_status')}</Text>
          <Text style={[styles.statusValue, { color: statusColor }]}>
            {ride.status.toUpperCase()}
          </Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatDateTime(ride.created_at)}
          </Text>
        </View>

        {/* Customer card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('customer')}</Text>
          <View style={styles.customerRow}>
            <View style={[styles.customerAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.customerInitial}>
                {ride.customer_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, { color: colors.textPrimary }]}>{ride.customer_name}</Text>
              <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>{ride.customer_phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <View style={[styles.contactBtn, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="call" size={16} color={colors.primary} />
              </View>
              <View style={[styles.contactBtn, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="chatbubble" size={16} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>

        {/* Route info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('pickup_location')} & {t('destination')}</Text>
          <View style={[styles.routeBox, { backgroundColor: colors.surfaceVariant }]}>
            <View style={styles.routeRow}>
              <Image source={Images.riderFromIcon} style={styles.routeIcon} resizeMode="contain" />
              <View>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>{t('pickup_location')}</Text>
                <Text style={[styles.routeText, { color: colors.textPrimary }]}>{ride.pickup_address}</Text>
              </View>
            </View>
            <View style={[styles.routeLine, { backgroundColor: colors.disabled }]} />
            <View style={styles.routeRow}>
              <Image source={Images.riderTargetLocationIcon} style={styles.routeIcon} resizeMode="contain" />
              <View>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>{t('destination')}</Text>
                <Text style={[styles.routeText, { color: colors.textPrimary }]}>{ride.destination_address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trip details */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('ride_details')}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
              <View>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{t('estimated_distance')}</Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{ride.distance.toFixed(1)} km</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <View>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{t('estimated_duration')}</Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{ride.estimated_duration} min</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fare breakdown */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('final_fare')}</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('fare_price')}</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formatPrice(ride.fare)}</Text>
          </View>
          {(ride.discount ?? 0) > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('discount_amount')}</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>{formatPrice(-(ride.discount ?? 0))}</Text>
            </View>
          ) : null}
          {ride.tips > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('total_tips')}</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>{formatPrice(ride.tips)}</Text>
            </View>
          ) : null}
          <View style={[styles.summaryRow, { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Dimensions.paddingSizeSmall, marginTop: 4 }]}>
            <Text style={[styles.grandLabel, { color: colors.textPrimary }]}>{t('total_amount')}</Text>
            <Text style={[styles.grandValue, { color: colors.primary }]}>
              {formatPrice(ride.fare - (ride.discount ?? 0) + ride.tips)}
            </Text>
          </View>
        </View>

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
  statusLabel: { ...Typography.caption },
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
  customerInfo: { flex: 1 },
  customerName: { ...Typography.body, fontWeight: '600' },
  customerPhone: { ...Typography.caption, marginTop: 2 },
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
  routeBox: {
    borderRadius: Dimensions.radiusSmall,
    padding: Dimensions.paddingSizeSmall,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
  },
  routeIcon: { width: 18, height: 18 },
  routeLabel: { ...Typography.caption },
  routeText: { ...Typography.body, marginTop: 2 },
  routeLine: {
    width: 2,
    height: 16,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Dimensions.paddingSizeLarge,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
    flex: 1,
  },
  metaLabel: { ...Typography.caption },
  metaValue: { ...Typography.body, fontWeight: '600', marginTop: 2 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: { ...Typography.body },
  summaryValue: { ...Typography.body, fontWeight: '600' },
  grandLabel: { ...Typography.subtitle, fontWeight: '700' },
  grandValue: { ...Typography.h3, fontWeight: '900' },
  statusActionsRow: {
    flexDirection: 'row',
    marginTop: Dimensions.paddingSizeDefault,
  },
});
