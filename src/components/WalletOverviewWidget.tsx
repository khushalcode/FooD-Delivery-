/**
 * WalletOverviewWidget — mirrors lib/features/my_account/widgets/account/wallet_overview_widget.dart.
 *
 * Shows:
 *  - Hero card with cash_in_hand, withdrawable balance, pending balance
 *  - "Withdraw" button that opens WithdrawBottomSheet
 *  - Wallet-provided earnings list (compact)
 *  - Withdraw request list (status chips)
 */

import { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
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
import { Dimensions } from '@/constants/dimensions';
import { Images } from '@/constants/images';
import { formatPrice } from '@/utils/price';
import {
  fetchWalletProvidedEarningList,
  fetchWithdrawRequestList,
  makeWalletAdjustment,
} from '@/services/v40_additions';
import { fetchWithdrawMethods } from '@/services/data';
import { WithdrawBottomSheet } from './WithdrawBottomSheet';
import type { WalletPayment, WithdrawMethod, WithdrawRequest } from '@/types';

export function WalletOverviewWidget({ currencySymbol = '$', digitAfterDecimalPoint = 2 }: { currencySymbol?: string; digitAfterDecimalPoint?: number }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { profile } = useAuth();
  const snackbar = useSnackbar();

  const [provided, setProvided] = useState<WalletPayment[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [methods, setMethods] = useState<WithdrawMethod[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const [p, wr, m] = await Promise.all([
        fetchWalletProvidedEarningList(profile.id),
        fetchWithdrawRequestList(profile.id),
        fetchWithdrawMethods(profile.id),
      ]);
      setProvided(p);
      setWithdrawRequests(wr);
      setMethods(m);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load wallet data');
    }
  }, [profile, snackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onAdjustment = async () => {
    if (!profile) return;
    try {
      await makeWalletAdjustment(profile.id);
      snackbar.success(t('wallet_adjustment_done'));
      load();
    } catch (e: any) {
      snackbar.error(e?.message || 'Adjustment failed');
    }
  };

  const cashInHand = profile?.cash_in_hand ?? 0;
  const withdrawable = profile?.balance ?? 0;
  const pending = profile?.pending_balance ?? 0;

  return (
    <View style={styles.container}>
      <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
        <View style={styles.heroRow}>
          <View style={styles.heroItem}>
            <Text style={styles.heroLabel}>{t('cash_in_hand')}</Text>
            <Text style={styles.heroValue}>
              {formatPrice(cashInHand, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
            </Text>
          </View>
          <View style={styles.heroItem}>
            <Text style={styles.heroLabel}>{t('withdrawable_balance')}</Text>
            <Text style={styles.heroValue}>
              {formatPrice(withdrawable, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
            </Text>
          </View>
          <View style={styles.heroItem}>
            <Text style={styles.heroLabel}>{t('pending_balance')}</Text>
            <Text style={styles.heroValue}>
              {formatPrice(pending, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => setShowWithdraw(true)}
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
        >
          <Image source={Images.withdraw} style={styles.actionIcon} resizeMode="contain" />
          <Text style={styles.actionBtnText}>{t('withdraw')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAdjustment}
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
        >
          <Image source={Images.walletIcon ?? Images.wallet} style={styles.actionIcon} resizeMode="contain" />
          <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>{t('adjustment')}</Text>
        </TouchableOpacity>
      </View>

      {/* Provided earnings list */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        {t('wallet_provided_earnings')}
      </Text>
      <FlatList
        data={provided}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={[styles.listRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {formatPrice(item.amount, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
              </Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{item.reference ?? '—'}</Text>
            </View>
            <Text style={[styles.rowDate, { color: colors.textTertiary }]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            {t('no_data_available')}
          </Text>
        }
        scrollEnabled={false}
      />

      {/* Withdraw requests */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        {t('withdraw_requests')}
      </Text>
      <FlatList
        data={withdrawRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.listRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {formatPrice(item.amount, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
              </Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                {item.method_name}
              </Text>
            </View>
            <View
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    item.status === 'completed' ? colors.success + '20' : colors.warning + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: item.status === 'completed' ? colors.success : colors.warning },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            {t('no_data_available')}
          </Text>
        }
        scrollEnabled={false}
      />

      {profile && (
        <WithdrawBottomSheet
          visible={showWithdraw}
          onClose={() => setShowWithdraw(false)}
          vendorId={profile.id}
          withdrawableBalance={withdrawable}
          methods={methods}
          currencySymbol={currencySymbol}
          digitAfterDecimalPoint={digitAfterDecimalPoint}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heroCard: {
    borderRadius: 16,
    padding: 16,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroItem: { flex: 1 },
  heroLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Roboto-Regular',
    opacity: 0.85,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionIcon: { width: 18, height: 18, tintColor: '#FFFFFF' },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowTitle: { fontSize: 14, fontFamily: 'Roboto-Bold' },
  rowSub: { fontSize: 12, fontFamily: 'Roboto-Regular', marginTop: 2 },
  rowDate: { fontSize: 11, fontFamily: 'Roboto-Regular' },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    textTransform: 'uppercase',
  },
  empty: {
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    padding: 16,
  },
});

export default WalletOverviewWidget;
