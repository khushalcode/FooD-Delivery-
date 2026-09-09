/**
 * Ride Order screen — mirrors lib/features/ride_module/ride_order/screens/ride_order_screen.dart.
 * Top-level ride history screen with filter chips (all / pending / ongoing / completed / cancelled).
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
import { fetchAllRides } from '@/services/data';
import type { Ride } from '@/types';

type FilterKey = 'all' | 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<Ride['status'], string> = {
  pending: '#FFA500',
  accepted: '#2196F3',
  ongoing: '#9C27B0',
  completed: '#28A745',
  cancelled: '#DC2626',
};

export default function RideOrderScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [rides, setRides] = useState<Ride[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchAllRides(profile.id);
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

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: t('ride_request') },
    { key: 'ongoing', label: t('ongoing_rides') },
    { key: 'completed', label: t('ride_completed') },
    { key: 'cancelled', label: t('ride_cancelled') },
  ];

  const filtered = (rides || []).filter((r) => filter === 'all' || r.status === filter);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('ride_history')} onBackPress={() => router.back()} />

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
                <Text style={[styles.filterText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          rides === null ? (
            <LoadingShimmer count={4} height={120} />
          ) : (
            <EmptyState image={Images.noRideRequest} title={t('no_ride_request')} />
          )
        }
        renderItem={({ item }) => {
          const statusColor = STATUS_COLORS[item.status];
          return (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/ride-details', params: { id: item.id } })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
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
                  <Text style={[styles.statusText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.footerRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="navigate-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {item.distance.toFixed(1)} km · {item.estimated_duration} min
                  </Text>
                </View>
                <Text style={[styles.fare, { color: colors.primary }]}>{formatPrice(item.fare)}</Text>
              </View>
            </TouchableOpacity>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  customerName: { ...Typography.subtitle, fontWeight: '600' },
  time: { ...Typography.caption, marginTop: 2 },
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
  metaText: { ...Typography.caption },
  fare: {
    ...Typography.h3,
    fontWeight: '900',
  },
});
