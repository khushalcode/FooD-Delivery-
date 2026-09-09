/**
 * Ongoing Rides screen — mirrors lib/features/ride_module/ride_order/screens/ongoing_ride_list_screen.dart.
 * Lists rides that are currently accepted/ongoing.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
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
import { EmptyState } from '@/components/EmptyState';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { formatPrice } from '@/utils/price';
import { timeAgo } from '@/utils/date';
import { fetchOngoingRides } from '@/services/data';
import type { Ride } from '@/types';

const STATUS_COLORS: Record<Ride['status'], string> = {
  pending: '#FFA500',
  accepted: '#2196F3',
  ongoing: '#9C27B0',
  completed: '#28A745',
  cancelled: '#DC2626',
};

export default function OngoingRidesScreen() {
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
      const data = await fetchOngoingRides(profile.id);
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('ongoing_rides')} onBackPress={() => router.back()} />
      <FlatList
        data={rides || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: Dimensions.paddingSizeSmall }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          rides === null ? (
            <LoadingShimmer count={2} height={120} />
          ) : (
            <EmptyState image={Images.noRideRequest} title="No ongoing rides" />
          )
        }
        renderItem={({ item }) => {
          const statusColor = STATUS_COLORS[item.status];
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.customerInfo}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>{item.customer_name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={[styles.customerName, { color: colors.textPrimary }]}>{item.customer_name}</Text>
                    <Text style={[styles.time, { color: colors.textSecondary }]}>{timeAgo(item.created_at)}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={[styles.routeBox, { backgroundColor: colors.surfaceVariant }]}>
                <View style={styles.routeRow}>
                  <Image source={Images.riderFromIcon} style={styles.routeIcon} resizeMode="contain" />
                  <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.pickup_address}
                  </Text>
                </View>
                <View style={[styles.routeLine, { backgroundColor: colors.disabled }]} />
                <View style={styles.routeRow}>
                  <Image source={Images.riderTargetLocationIcon} style={styles.routeIcon} resizeMode="contain" />
                  <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.destination_address}
                  </Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="navigate-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {item.distance.toFixed(1)} km
                  </Text>
                </View>
                <Text style={[styles.fare, { color: colors.primary }]}>{formatPrice(item.fare)}</Text>
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
  listContent: {
    padding: Dimensions.paddingSizeDefault,
    flexGrow: 1,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
  },
  fare: {
    ...Typography.h3,
    fontWeight: '900',
  },
});
