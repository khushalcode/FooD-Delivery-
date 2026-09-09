/**
 * IncomeStatementView — mirrors lib/features/my_account/widgets/account/income_statement_view.dart.
 *
 * Shows:
 *  - Horizontal PricingCard row: totalEarning, totalIncome, rideIncome, deliveryIncome, totalTips
 *  - Delivery statement / Ride statement tab switcher (gated on profile.is_delivery_on && is_ride_on)
 *  - Paginated statement list with DeliveryStatementCard / RideStatementCard
 *  - DeliveryIncomeBottomSheet / RideIncomeBottomSheet on card tap
 *
 * Calls fetchRideIncomeStatement + fetchDeliveryIncomeStatement from v40_additions.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTranslation } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Images } from '@/constants/images';
import { formatPrice } from '@/utils/price';
import { PricingCard } from './PricingCard';
import {
  fetchDeliveryIncomeStatement,
  fetchRideIncomeStatement,
  downloadEarningInvoice,
} from '@/services/v40_additions';
import type { DeliveryIncomeStatement, RideIncomeStatement } from '@/types';

const PAGE_SIZE = 10;

type Tab = 'delivery' | 'ride';

export function IncomeStatementView({ currencySymbol = '$', digitAfterDecimalPoint = 2 }: { currencySymbol?: string; digitAfterDecimalPoint?: number }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { profile } = useAuth();
  const snackbar = useSnackbar();

  const [activeTab, setActiveTab] = useState<Tab>('delivery');
  const [deliveryItems, setDeliveryItems] = useState<DeliveryIncomeStatement[]>([]);
  const [rideItems, setRideItems] = useState<RideIncomeStatement[]>([]);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<
    | { type: 'delivery'; item: DeliveryIncomeStatement }
    | { type: 'ride'; item: RideIncomeStatement }
    | null
  >(null);

  const hasDelivery = !!profile?.is_delivery_on;
  const hasRide = !!profile?.is_ride_on;
  const showTabs = hasDelivery && hasRide;

  const totalEarning = profile?.total_earning ?? 0;
  const totalIncome = profile?.total_income ?? totalEarning;
  const rideIncome = profile?.trip_income ?? 0;
  const deliveryIncome = profile?.delivery_income ?? 0;
  const totalTips = profile?.total_tips ?? 0;

  const load = useCallback(
    async (resetOffset = 0, tab: Tab) => {
      if (!profile) return;
      try {
        if (tab === 'delivery') {
          const next = await fetchDeliveryIncomeStatement(profile.id, resetOffset, PAGE_SIZE);
          if (resetOffset === 0) setDeliveryItems(next);
          else setDeliveryItems((p) => [...p, ...next]);
        } else {
          const next = await fetchRideIncomeStatement(profile.id, resetOffset, PAGE_SIZE);
          if (resetOffset === 0) setRideItems(next);
          else setRideItems((p) => [...p, ...next]);
        }
        setOffset(resetOffset + (tab === 'delivery' ? deliveryItems.length : rideItems.length));
      } catch (e: any) {
        snackbar.error(e?.message || 'Failed to load statements');
      }
    },
    [profile, snackbar, deliveryItems.length, rideItems.length]
  );

  useEffect(() => {
    if (hasDelivery) load(0, 'delivery');
    if (hasRide) load(0, 'ride');
  }, [load, hasDelivery, hasRide]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(0, activeTab);
    setRefreshing(false);
  };

  const onLoadMore = () => load(offset, activeTab);

  const onDownload = async (type: 'delivery' | 'ride') => {
    if (!profile) return;
    try {
      await downloadEarningInvoice(profile.id, type);
      snackbar.success(t('invoice_downloaded'));
    } catch (e: any) {
      snackbar.error(e?.message || 'Download failed');
    }
  };

  return (
    <View style={styles.container}>
      {/* Pricing cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
        <PricingCard
          image={Images.totalEarning}
          title={t('total_earning')}
          amount={totalEarning}
          currencySymbol={currencySymbol}
          digitAfterDecimalPoint={digitAfterDecimalPoint}
        />
        <PricingCard
          image={Images.riderTotalIncome ?? Images.totalEarning}
          title={t('total_income')}
          amount={totalIncome}
          currencySymbol={currencySymbol}
          digitAfterDecimalPoint={digitAfterDecimalPoint}
        />
        {hasRide ? (
          <PricingCard
            image={Images.riderRideIncome ?? Images.rideImage}
            title={t('ride_income')}
            amount={rideIncome}
            currencySymbol={currencySymbol}
            digitAfterDecimalPoint={digitAfterDecimalPoint}
          />
        ) : null}
        {hasDelivery ? (
          <PricingCard
            image={Images.riderDeliveryIncome ?? Images.deliveryFeeEarned}
            title={t('delivery_income')}
            amount={deliveryIncome}
            currencySymbol={currencySymbol}
            digitAfterDecimalPoint={digitAfterDecimalPoint}
          />
        ) : null}
        <PricingCard
          image={Images.riderTotalTips ?? Images.deliveryTipsEarned}
          title={t('total_tips')}
          amount={totalTips}
          currencySymbol={currencySymbol}
          digitAfterDecimalPoint={digitAfterDecimalPoint}
        />
      </ScrollView>

      {/* Tab switcher */}
      {showTabs ? (
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('delivery')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: activeTab === 'delivery' ? colors.primary : colors.surfaceVariant,
              },
            ]}
          >
            <Text style={{ color: activeTab === 'delivery' ? '#FFFFFF' : colors.textPrimary, fontFamily: 'Roboto-Bold', fontSize: 13 }}>
              {t('delivery_statement')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('ride')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: activeTab === 'ride' ? colors.primary : colors.surfaceVariant,
              },
            ]}
          >
            <Text style={{ color: activeTab === 'ride' ? '#FFFFFF' : colors.textPrimary, fontFamily: 'Roboto-Bold', fontSize: 13 }}>
              {t('ride_statement')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Statement list */}
      <View style={styles.listHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {activeTab === 'delivery' ? t('delivery_statement') : t('ride_statement')}
        </Text>
        <TouchableOpacity onPress={() => onDownload(activeTab)}>
          <Text style={[styles.downloadBtn, { color: colors.primary }]}>
            {t('download_invoice')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'delivery' ? (
        <FlatList
          data={deliveryItems}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => {
            const income = item.original_delivery_charge + item.dm_tips - item.delivery_fee_comission;
            return (
              <TouchableOpacity
                onPress={() => setSelected({ type: 'delivery', item })}
                style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                    {formatPrice(income, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                    {t('order')} #{item.order_id}
                  </Text>
                </View>
                <Text style={[styles.rowDate, { color: colors.textTertiary }]}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              {t('no_data_available')}
            </Text>
          }
          scrollEnabled={false}
        />
      ) : (
        <FlatList
          data={rideItems}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => {
            const income = item.paid_fare + item.coupon_amount + item.discount_amount - item.admin_commission;
            return (
              <TouchableOpacity
                onPress={() => setSelected({ type: 'ride', item })}
                style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                    {formatPrice(income, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                    {t('ride')} #{item.ride_id}
                  </Text>
                </View>
                <Text style={[styles.rowDate, { color: colors.textTertiary }]}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              {t('no_data_available')}
            </Text>
          }
          scrollEnabled={false}
        />
      )}

      {/* Statement detail bottom sheet */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            {selected?.type === 'delivery' ? (
              <DeliveryIncomeBottomSheetContent item={selected.item} currencySymbol={currencySymbol} digitAfterDecimalPoint={digitAfterDecimalPoint} />
            ) : selected?.type === 'ride' ? (
              <RideIncomeBottomSheetContent item={selected.item} currencySymbol={currencySymbol} digitAfterDecimalPoint={digitAfterDecimalPoint} />
            ) : null}
            <TouchableOpacity
              onPress={() => setSelected(null)}
              style={[styles.closeBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.closeBtnText}>{t('okay')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DeliveryIncomeBottomSheetContent({
  item,
  currencySymbol,
  digitAfterDecimalPoint,
}: {
  item: DeliveryIncomeStatement;
  currencySymbol: string;
  digitAfterDecimalPoint: number;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const income = item.original_delivery_charge + item.dm_tips - item.delivery_fee_comission;
  return (
    <View style={styles.sheetContent}>
      <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
        {t('delivery_income_details')}
      </Text>
      <Row label={t('original_delivery_charge')} value={formatPrice(item.original_delivery_charge, { symbol: currencySymbol, digits: digitAfterDecimalPoint })} color={colors.textPrimary} subColor={colors.textSecondary} />
      <Row label={t('delivery_fee_comission')} value={`- ${formatPrice(item.delivery_fee_comission, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}`} color={colors.textPrimary} subColor={colors.textSecondary} />
      <Row label={t('dm_tips')} value={`+ ${formatPrice(item.dm_tips, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}`} color={colors.textPrimary} subColor={colors.textSecondary} />
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <Row label={t('total_income')} value={formatPrice(income, { symbol: currencySymbol, digits: digitAfterDecimalPoint })} color={colors.primary} subColor={colors.primary} bold />
    </View>
  );
}

function RideIncomeBottomSheetContent({
  item,
  currencySymbol,
  digitAfterDecimalPoint,
}: {
  item: RideIncomeStatement;
  currencySymbol: string;
  digitAfterDecimalPoint: number;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const income = item.paid_fare + item.coupon_amount + item.discount_amount - item.admin_commission;
  return (
    <View style={styles.sheetContent}>
      <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
        {t('ride_income_details')}
      </Text>
      <Row label={t('paid_fare')} value={formatPrice(item.paid_fare, { symbol: currencySymbol, digits: digitAfterDecimalPoint })} color={colors.textPrimary} subColor={colors.textSecondary} />
      <Row label={t('admin_commission')} value={`- ${formatPrice(item.admin_commission, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}`} color={colors.textPrimary} subColor={colors.textSecondary} />
      <Row label={t('coupon')} value={`+ ${formatPrice(item.coupon_amount, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}`} color={colors.textPrimary} subColor={colors.textSecondary} />
      <Row label={t('discount_amount')} value={`+ ${formatPrice(item.discount_amount, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}`} color={colors.textPrimary} subColor={colors.textSecondary} />
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <Row label={t('total_income')} value={formatPrice(income, { symbol: currencySymbol, digits: digitAfterDecimalPoint })} color={colors.primary} subColor={colors.primary} bold />
    </View>
  );
}

function Row({ label, value, color, subColor, bold }: { label: string; value: string; color: string; subColor: string; bold?: boolean }) {
  return (
    <View style={styles.row2}>
      <Text style={{ color: subColor, fontSize: 13, fontFamily: bold ? 'Roboto-Bold' : 'Roboto-Regular' }}>{label}</Text>
      <Text style={{ color, fontSize: 14, fontFamily: bold ? 'Roboto-Bold' : 'Roboto-Medium' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  cardsRow: { paddingVertical: 8 },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  sectionTitle: { fontSize: 15, fontFamily: 'Roboto-Bold' },
  downloadBtn: { fontSize: 13, fontFamily: 'Roboto-Medium' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  rowTitle: { fontSize: 14, fontFamily: 'Roboto-Bold' },
  rowSub: { fontSize: 12, fontFamily: 'Roboto-Regular', marginTop: 2 },
  rowDate: { fontSize: 11, fontFamily: 'Roboto-Regular' },
  empty: { fontSize: 13, fontFamily: 'Roboto-Regular', textAlign: 'center', padding: 16 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  sheetContent: { gap: 6 },
  sheetTitle: { fontSize: 18, fontFamily: 'Roboto-Bold', marginBottom: 12 },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  divider: { height: 1, marginVertical: 8 },
  closeBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  closeBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Roboto-Bold' },
});

export default IncomeStatementView;
