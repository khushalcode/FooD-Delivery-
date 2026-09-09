/**
 * Vehicle Details screen — mirrors lib/features/ride_module/add_vehicle/screens/vehicle_details_screen.dart.
 * Shows rider's vehicle info (brand, model, plate, year, color, status).
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
import { fetchVehicles, deleteVehicle } from '@/services/data';
import type { Vehicle } from '@/types';

export default function VehicleDetailsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchVehicles(profile.id);
      setVehicles(data);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load vehicles');
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

  const statusColor = (status: string | null) => {
    if (status === 'approved') return colors.success;
    if (status === 'pending') return colors.warning;
    return colors.error;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('vehicle_details')} onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {vehicles === null ? (
          <LoadingShimmer count={1} height={200} />
        ) : vehicles.length === 0 ? (
          <EmptyState
            image={Images.car}
            title="No vehicle added"
            description="Add a vehicle to start accepting ride requests"
          />
        ) : (
          vehicles.map((v) => (
            <View key={v.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="car" size={28} color={colors.primary} />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>
                    {v.brand} {v.model}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(v.vehicle_request_status) + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor(v.vehicle_request_status) }]}>
                      {(v.vehicle_request_status || 'pending').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.fields, { borderTopColor: colors.border }]}>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldKey, { color: colors.textSecondary }]}>{t('vehicle_category')}</Text>
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{v.category}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldKey, { color: colors.textSecondary }]}>{t('license_plate')}</Text>
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{v.license_plate}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldKey, { color: colors.textSecondary }]}>{t('vehicle_year')}</Text>
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{v.year}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldKey, { color: colors.textSecondary }]}>{t('vehicle_color')}</Text>
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{v.color}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <CustomButton
                  buttonText={t('edit_vehicle')}
                  variant="outline"
                  onPress={() => router.push({ pathname: '/add-vehicle', params: { id: v.id } })}
                  style={{ flex: 1, marginRight: Dimensions.paddingSizeSmall }}
                />
                <CustomButton
                  buttonText="Delete"
                  variant="danger"
                  onPress={async () => {
                    await deleteVehicle(v.id);
                    snackbar.success('Vehicle deleted');
                    load();
                  }}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ))
        )}

        {vehicles && vehicles.length === 0 ? (
          <View style={{ marginTop: Dimensions.paddingSizeDefault }}>
            <CustomButton
              buttonText={t('add_vehicle')}
              onPress={() => router.push('/add-vehicle')}
            />
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
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  vehicleName: {
    ...Typography.h3,
    fontWeight: '700',
  },
  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  fields: {
    marginTop: Dimensions.paddingSizeDefault,
    paddingTop: Dimensions.paddingSizeDefault,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  fieldKey: {
    ...Typography.body,
    textTransform: 'capitalize',
  },
  fieldValue: {
    ...Typography.body,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    marginTop: Dimensions.paddingSizeDefault,
  },
});
