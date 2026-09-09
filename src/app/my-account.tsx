/**
 * My Account screen — mirrors lib/features/my_account/screens/my_account_screen.dart.
 * Vendor variant: shows cash in hand, balance, and quick links to withdraw, transactions, etc.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { useConfig } from '@/context/ConfigContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTranslation } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { Images } from '@/constants/images';
import { CustomAppBar } from '@/components/CustomAppBar';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { WalletOverviewWidget } from '@/components/WalletOverviewWidget';
import { MyPointView } from '@/components/MyPointView';
import { IncomeStatementView } from '@/components/IncomeStatementView';
import { formatPrice } from '@/utils/price';
import { fetchTransactions } from '@/services/data';
import type { Transaction } from '@/types';

type AccountTab = 'wallet_overview' | 'my_point' | 'income_statement';

export default function MyAccountScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountTab>('wallet_overview');
  const { config } = useConfig();
  const currencySymbol = config?.currency_symbol ?? '$';
  const currencySymbolDirection = config?.currency_symbol_direction ?? 'left';
  const digitAfterDecimalPoint = config?.digit_after_decimal_point ?? 2;

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      await refreshProfile();
      const data = await fetchTransactions(profile.id);
      setTransactions(data.slice(0, 5));
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load data');
    }
  }, [profile, refreshProfile, snackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const recent = transactions || [];
  const pendingWithdrawals = recent.filter(
    (t) => t.type === 'withdrawal' && t.status === 'pending'
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('my_account')} onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Image source={Images.cashInHandBg} style={styles.heroBg} resizeMode="cover" />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>{t('cash_in_hand')}</Text>
            <Text style={styles.heroValue}>{formatPrice(profile?.cash_in_hand || 0, { symbol: currencySymbol, direction: currencySymbolDirection, digits: digitAfterDecimalPoint })}</Text>
            <Text style={styles.heroSubLabel}>{t('available_balance')}</Text>
            <Text style={styles.heroSubValue}>{formatPrice(profile?.balance || 0, { symbol: currencySymbol, direction: currencySymbolDirection, digits: digitAfterDecimalPoint })}</Text>
          </View>
        </View>

        {/* V4.0: 3-tab horizontal segmented control — wallet_overview / my_point / income_statement */}
        <View style={[styles.tabsRow, { backgroundColor: colors.surfaceVariant }]}>
          {([
            { key: 'wallet_overview', label: t('wallet_overview') },
            { key: 'my_point', label: t('my_point') },
            { key: 'income_statement', label: t('income_statement') },
          ] as { key: AccountTab; label: string }[]).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: activeTab === tab.key ? colors.primary : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content (V4.0) */}
        {activeTab === 'wallet_overview' ? (
          <>
            {/* Action buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => router.push('/withdraw-method')}
                style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="cash-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.actionText, { color: colors.textPrimary }]}>{t('withdraw')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/transaction-history')}
                style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="receipt-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.actionText, { color: colors.textPrimary }]}>{t('transaction_history')}</Text>
              </TouchableOpacity>
            </View>

            {/* Pending withdrawals */}
            {pendingWithdrawals.length > 0 ? (
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Pending Withdrawals
                </Text>
                {pendingWithdrawals.map((tx) => (
                  <View key={tx.id} style={[styles.txRow, { borderBottomColor: colors.border }]}>
                    <View>
                      <Text style={[styles.txLabel, { color: colors.textPrimary }]}>
                        {tx.reference || 'Withdrawal'}
                      </Text>
                      <Text style={[styles.txSub, { color: colors.textSecondary }]}>
                        {tx.method} · {tx.status}
                      </Text>
                    </View>
                    <Text style={[styles.txAmount, { color: colors.warning }]}>
                      -{formatPrice(tx.amount, { symbol: currencySymbol, direction: currencySymbolDirection, digits: digitAfterDecimalPoint })}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Recent transactions */}
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {t('transaction_history')}
                </Text>
                <TouchableOpacity onPress={() => router.push('/transaction-history')}>
                  <Text style={[styles.viewAll, { color: colors.primary }]}>{t('view_all')}</Text>
                </TouchableOpacity>
              </View>

              {transactions === null ? (
                <LoadingShimmer count={3} height={50} />
              ) : recent.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('no_data_available')}
                </Text>
              ) : (
                recent.map((tx) => (
                  <View key={tx.id} style={[styles.txRow, { borderBottomColor: colors.border }]}>
                    <View>
                      <Text style={[styles.txLabel, { color: colors.textPrimary }]}>
                        {tx.reference || tx.type}
                      </Text>
                      <Text style={[styles.txSub, { color: colors.textSecondary }]}>
                        {tx.type.replace('_', ' ')} · {tx.status}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        {
                          color:
                            tx.type === 'earning' || tx.type === 'cash_collected'
                              ? colors.success
                              : tx.type === 'withdrawal'
                              ? colors.warning
                              : colors.textPrimary,
                        },
                      ]}
                    >
                      {tx.type === 'withdrawal' ? '-' : '+'}
                      {formatPrice(tx.amount, { symbol: currencySymbol, direction: currencySymbolDirection, digits: digitAfterDecimalPoint })}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : activeTab === 'my_point' ? (
          <MyPointView currencySymbol={currencySymbol} digitAfterDecimalPoint={digitAfterDecimalPoint} />
        ) : (
          <IncomeStatementView currencySymbol={currencySymbol} digitAfterDecimalPoint={digitAfterDecimalPoint} />
        )}

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
  hero: {
    borderRadius: Dimensions.radiusDefault,
    padding: Dimensions.paddingSizeLarge,
    marginBottom: Dimensions.paddingSizeDefault,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    opacity: 0.2,
  },
  heroContent: {},
  heroLabel: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.85)',
  },
  heroValue: {
    ...Typography.h1,
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 4,
  },
  heroSubLabel: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: Dimensions.paddingSizeDefault,
  },
  heroSubValue: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  actionCard: {
    flex: 1,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    alignItems: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Dimensions.paddingSizeSmall,
  },
  actionText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionCard: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Dimensions.paddingSizeSmall,
  },
  sectionTitle: {
    ...Typography.title,
  },
  viewAll: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Dimensions.paddingSizeSmall,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txLabel: {
    ...Typography.body,
    fontWeight: '600',
  },
  txSub: {
    ...Typography.caption,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  txAmount: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    paddingVertical: Dimensions.paddingSizeLarge,
  },
  // V4.0 — 3-tab segmented control
  tabsRow: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: Dimensions.radiusDefault,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Dimensions.paddingSizeSmall,
    borderRadius: Dimensions.radiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    ...Typography.bodySmall,
    fontFamily: 'Roboto-Medium',
    fontWeight: '600',
  },
});
