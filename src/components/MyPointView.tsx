/**
 * MyPointView — mirrors lib/features/my_account/widgets/account/my_point_view.dart.
 *
 * Shows:
 *  - Hero card with current loyalty points + convert-to-balance CTA
 *  - Paginated loyalty-point transaction list (earned / spent)
 *
 * Calls fetchLoyaltyPointList + convertLoyaltyPoints from v40_additions.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTranslation } from '@/context/LocalizationContext';
import { useConfig } from '@/context/ConfigContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Images } from '@/constants/images';
import { formatPrice } from '@/utils/price';
import {
  fetchLoyaltyPointList,
  convertLoyaltyPoints,
} from '@/services/v40_additions';
import type { LoyaltyPoint } from '@/types';

const PAGE_SIZE = 10;

export function MyPointView({ currencySymbol = '$', digitAfterDecimalPoint = 2 }: { currencySymbol?: string; digitAfterDecimalPoint?: number }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { config } = useConfig();
  const snackbar = useSnackbar();

  const [items, setItems] = useState<LoyaltyPoint[]>([]);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertPoints, setConvertPoints] = useState('');
  const [converting, setConverting] = useState(false);

  const isRideActive = !!profile?.is_ride_on;
  const loyaltyData = isRideActive
    ? config?.rider_loyalty_point_data
    : config?.dm_loyalty_point_data;
  const conversionRate = loyaltyData?.loyalty_point_conversion_rate ?? 1;
  const minPoints = loyaltyData?.min_loyalty_point_to_convert ?? 100;
  const enabled = (loyaltyData?.loyalty_point_status ?? 1) === 1;
  const currentPoints = profile?.loyalty_points ?? 0;

  const load = useCallback(
    async (resetOffset = 0) => {
      if (!profile) return;
      try {
        const next = await fetchLoyaltyPointList(profile.id, resetOffset, PAGE_SIZE);
        if (resetOffset === 0) setItems(next);
        else setItems((prev) => [...prev, ...next]);
        setOffset(resetOffset + next.length);
      } catch (e: any) {
        snackbar.error(e?.message || 'Failed to load points');
      }
    },
    [profile, snackbar]
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(0);
    setRefreshing(false);
  };

  const onLoadMore = () => load(offset);

  const handleConvert = async () => {
    const n = parseInt(convertPoints, 10);
    if (isNaN(n) || n <= 0) {
      snackbar.error(t('please_enter_a_valid_amount'));
      return;
    }
    if (n < minPoints) {
      snackbar.error(t('minimum_points_required', { count: minPoints }));
      return;
    }
    if (n > currentPoints) {
      snackbar.error(t('not_enough_points'));
      return;
    }
    setConverting(true);
    try {
      await convertLoyaltyPoints(profile!.id, n, isRideActive);
      snackbar.success(t('points_converted'));
      setShowConvertModal(false);
      setConvertPoints('');
      load(0);
    } catch (e: any) {
      snackbar.error(e?.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  if (!enabled) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('loyalty_points_not_enabled')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <Image source={Images.loyaltyPoint ?? Images.coin} style={styles.heroIcon} resizeMode="contain" />
        <View style={{ flex: 1 }}>
          <Text style={styles.heroLabel}>{t('loyalty_points')}</Text>
          <Text style={styles.heroValue}>{currentPoints.toLocaleString()}</Text>
          {loyaltyData?.sub_title ? (
            <Text style={styles.heroSub}>{loyaltyData.sub_title}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => setShowConvertModal(true)}
          style={styles.convertBtn}
        >
          <Text style={styles.convertBtnText}>{t('convert')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{item.reference}</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
            <Text
              style={[
                styles.rowPoints,
                { color: item.type === 'earned' ? colors.success : colors.error },
              ]}
            >
              {item.type === 'earned' ? '+' : '−'} {item.points.toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('no_data_available')}
          </Text>
        }
        scrollEnabled={false}
      />

      {/* Convert modal */}
      <Modal visible={showConvertModal} transparent animationType="slide" onRequestClose={() => setShowConvertModal(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t('convert_loyalty_points')}
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              {t('minimum_points_required', { count: minPoints })}
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              {t('conversion_rate')}: 1 {t('point')} = {formatPrice(conversionRate, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
            </Text>
            <TextInput
              value={convertPoints}
              onChangeText={(v) => setConvertPoints(v.replace(/[^0-9]/g, ''))}
              placeholder={`${minPoints}`}
              placeholderTextColor={colors.hint}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: colors.inputFill, color: colors.textPrimary }]}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={() => setShowConvertModal(false)}
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.textPrimary }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={converting}
                onPress={handleConvert}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>
                  {converting ? t('please_wait') : t('convert')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  heroIcon: { width: 56, height: 56 },
  heroLabel: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Roboto-Regular', opacity: 0.85 },
  heroValue: { color: '#FFFFFF', fontSize: 26, fontFamily: 'Roboto-Black' },
  heroSub: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Roboto-Regular', opacity: 0.85, marginTop: 2 },
  convertBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  convertBtnText: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Roboto-Bold' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  rowTitle: { fontSize: 14, fontFamily: 'Roboto-Medium' },
  rowSub: { fontSize: 12, fontFamily: 'Roboto-Regular', marginTop: 2 },
  rowPoints: { fontSize: 16, fontFamily: 'Roboto-Bold' },
  emptyWrap: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Roboto-Regular' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'Roboto-Bold', marginBottom: 4 },
  modalSub: { fontSize: 13, fontFamily: 'Roboto-Regular', marginTop: 4 },
  input: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12, fontSize: 14, fontFamily: 'Roboto-Regular' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalBtnText: { fontSize: 14, fontFamily: 'Roboto-Bold' },
});

export default MyPointView;
