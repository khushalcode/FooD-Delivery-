/**
 * Pending Rides screen — mirrors lib/features/ride_module/ride_order/screens/pending_ride_list_screen.dart.
 * Lists pending ride requests awaiting rider's accept/reject.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
import { CustomButton } from '@/components/CustomButton';
import { EmptyState } from '@/components/EmptyState';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { formatPrice } from '@/utils/price';
import { timeAgo } from '@/utils/date';
import { fetchPendingRides, acceptRide } from '@/services/data';
import type { Ride } from '@/types';

export default function PendingRidesScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [rides, setRides] = useState<Ride[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchPendingRides(profile.id);
      setRides(data);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load rides');
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

  const handleAccept = async (ride: Ride) => {
    if (!profile) return;
    try {
      await acceptRide(ride.id, profile.id);
      snackbar.success(t('ride_request') + ' accepted');
      load();
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to accept ride');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('pending_rides')} onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {rides === null ? (
          <LoadingShimmer count={2} height={180} />
        ) : rides.length === 0 ? (
          <EmptyState
            image={Images.noRideRequest}
            title={t('no_ride_request')}
            description="New ride requests will appear here"
          />
        ) : (
          <View style={styles.list}>
            {rides.map((r) => (
              <View key={r.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.customerInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarText}>{r.customer_name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={[styles.customerName, { color: colors.textPrimary }]}>{r.customer_name}</Text>
                      <Text style={[styles.time, { color: colors.textSecondary }]}>{timeAgo(r.created_at)}</Text>
                    </View>
                  </View>
                  <View style={styles.fareWrap}>
                    <Text style={[styles.fare, { color: colors.primary }]}>{formatPrice(r.fare)}</Text>
                    <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>{t('estimated_fare')}</Text>
                  </View>
                </View>

                <View style={[styles.routeBox, { backgroundColor: colors.surfaceVariant }]}>
                  <View style={styles.routeRow}>
                    <Image source={Images.riderFromIcon} style={styles.routeIcon} resizeMode="contain" />
                    <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>
                      {r.pickup_address}
                    </Text>
                  </View>
                  <View style={[styles.routeLine, { backgroundColor: colors.disabled }]} />
                  <View style={styles.routeRow}>
                    <Image source={Images.riderTargetLocationIcon} style={styles.routeIcon} resizeMode="contain" />
                    <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>
                      {r.destination_address}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="navigate-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {r.distance.toFixed(1)} km
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {r.estimated_duration} min
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name={r.payment_method === 'cash' ? 'cash-outline' : 'card-outline'}
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {r.payment_method.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <CustomButton
                    buttonText={t('reject_ride')}
                    variant="outline"
                    onPress={() => router.back()}
                    style={{ flex: 1, marginRight: Dimensions.paddingSizeSmall }}
                  />
                  <CustomButton
                    buttonText={t('accept_ride')}
                    onPress={() => handleAccept(r)}
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
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  customerName: {
    ...Typography.subtitle,
    fontWeight: '600',
  },
  time: {
    ...Typography.caption,
    marginTop: 2,
  },
  fareWrap: {
    alignItems: 'flex-end',
  },
  fare: {
    ...Typography.h3,
    fontWeight: '900',
  },
  fareLabel: {
    ...Typography.caption,
  },
  routeBox: {
    borderRadius: Dimensions.radiusSmall,
    padding: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
  },
  routeIcon: {
    width: 18,
    height: 18,
  },
  routeText: {
    flex: 1,
    ...Typography.body,
  },
  routeLine: {
    width: 2,
    height: 16,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
  },
  actions: {
    flexDirection: 'row',
  },
});
