/**
 * Home screen — mirrors lib/features/home/screens/home_screen.dart (V4.0).
 * Vendor variant: shows online toggle, today's earnings, active orders, recent orders,
 * quick action grid (earnings, withdraw, transactions, disbursement, refer & earn, earning report),
 * cash in hand card, referral card.
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
import { AppConstants } from '@/constants/app_constants';
import { Images } from '@/constants/images';
import { OrderWidget } from '@/components/OrderWidget';
import { OrderCountWidget } from '@/components/OrderCountWidget';
import { TitleWidget } from '@/components/TitleWidget';
import { EmptyState } from '@/components/EmptyState';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { formatPrice } from '@/utils/price';
import {
  fetchCurrentOrders,
  fetchLatestOrders,
  fetchNotifications,
  updateVendorActiveStatus,
} from '@/services/data';
import type { Order, NotificationItem } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, refreshProfile, updateProfile } = useAuth();
  const { config } = useConfig();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [currentOrders, setCurrentOrders] = useState<Order[] | null>(null);
  const [latestOrders, setLatestOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile) return;
    try {
      const [curr, latest, notifs] = await Promise.all([
        fetchCurrentOrders(profile.id),
        fetchLatestOrders(profile.id, 5),
        fetchNotifications(profile.id),
      ]);
      setCurrentOrders(curr);
      setLatestOrders(latest);
      setNotifications(notifs);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load data');
    }
  }, [profile, snackbar]);

  useEffect(() => {
    refreshProfile();
    loadData();
  }, [refreshProfile, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), loadData()]);
    setRefreshing(false);
  }, [refreshProfile, loadData]);

  const handleToggleOnline = async () => {
    if (!profile) return;
    const newActive = !profile.active;
    try {
      await updateVendorActiveStatus(profile.id, newActive);
      await updateProfile({ active: newActive });
      snackbar.success(newActive ? t('store_is_online') : t('store_is_offline'));
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to update status');
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);
  const activeOrders = currentOrders || [];

  // V4.0: referral card is gated on profile.earnings == 1 AND dmReferralData.referalStatus == 1
  const referralEnabled =
    (profile?.earnings ?? 0) === 1 &&
    (config?.dm_referral_data?.referral_status ?? 0) === 1;

  const stats: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: t('today_earnings'), value: formatPrice(245.5), icon: 'trending-up' },
    { label: t('total_earning'), value: formatPrice(profile?.total_earning || 0), icon: 'wallet' },
    { label: t('cash_in_hand'), value: formatPrice(profile?.cash_in_hand || 0), icon: 'cash' },
    { label: t('orders'), value: String(activeOrders.length), icon: 'bag-check' },
  ];

  const quickActions: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
    { label: t('my_earning'), icon: 'bar-chart', route: '/my-earning' },
    { label: t('earning_report'), icon: 'document-text', route: '/earning-report' },
    { label: t('withdraw'), icon: 'cash-outline', route: '/withdraw-method' },
    { label: t('transaction_history'), icon: 'receipt', route: '/transaction-history' },
    { label: t('disbursement'), icon: 'swap-vertical', route: '/disbursement' },
    { label: t('refer_and_earn'), icon: 'gift', route: '/refer-and-earn' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Image source={Images.logo} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={[styles.appName, { color: colors.textPrimary }]} numberOfLines={1}>
              {AppConstants.appName}
            </Text>
            <Text style={[styles.storeName, { color: colors.textSecondary }]} numberOfLines={1}>
              {profile?.store_name || '...'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          style={styles.bellBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="notifications" size={24} color={colors.textPrimary} />
          {hasUnread ? (
            <View style={[styles.dot, { backgroundColor: colors.error }]} />
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Online toggle */}
        <View style={[styles.onlineCard, { backgroundColor: colors.primary }]}>
          <View style={styles.onlineInfo}>
            <Image
              source={profile?.active ? Images.onlineStatus : Images.dmOfflineIcon}
              style={styles.onlineIcon}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.onlineTitle}>
                {profile?.active ? t('store_is_online') : t('store_is_offline')}
              </Text>
              <Text style={styles.onlineSubtitle}>
                {profile?.active
                  ? 'You will receive new orders'
                  : t('go_online_to_receive_orders')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleToggleOnline}
            style={[
              styles.toggleBtn,
              { backgroundColor: profile?.active ? '#FFFFFF' : 'rgba(255,255,255,0.25)' },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleText,
                { color: profile?.active ? colors.primary : '#FFFFFF' },
              ]}
            >
              {profile?.active ? t('turn_off_store') : t('turn_on_store')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View
              key={i}
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.statIconWrap, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={s.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]} numberOfLines={1}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Cash in hand card (only when > 0) */}
        {(profile?.cash_in_hand || 0) > 0 ? (
          <View style={[styles.cashCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={Images.cashInHandBg} style={styles.cashBg} resizeMode="cover" />
            <View style={styles.cashContent}>
              <Text style={[styles.cashLabel, { color: colors.textSecondary }]}>
                {t('cash_in_hand')}
              </Text>
              <Text style={[styles.cashValue, { color: colors.textPrimary }]}>
                {formatPrice(profile?.cash_in_hand || 0)}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/my-account')}
                style={[styles.cashBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.7}
              >
                <Text style={styles.cashBtnText}>{t('view_all')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Quick actions */}
        <View style={styles.section}>
          <TitleWidget title={t('my_account')} />
          <View style={styles.actionsGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => router.push(a.route as any)}
                style={[
                  styles.actionCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={a.icon} size={22} color={colors.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.textPrimary }]} numberOfLines={2}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* V4.0: Order count widget — today / this week / total */}
        <OrderCountWidget
          todaysCount={profile?.todays_order_count ?? null}
          thisWeekCount={profile?.this_week_order_count ?? null}
          totalCount={profile?.order_count ?? null}
          compact={(profile?.earnings ?? 0) === 1}
        />

        {/* Referral card (V4.0: gated on earnings + dm_referral_data.referal_status) */}
        {referralEnabled ? (
          <View style={[styles.referralCard, { backgroundColor: colors.primary }]}>
            <View style={styles.referralInfo}>
              <Image source={Images.gift} style={styles.referralIcon} resizeMode="contain" />
              <View>
                <Text style={styles.referralTitle}>{t('refer_and_earn')}</Text>
                <Text style={styles.referralSubtitle}>
                  Invite friends and earn rewards for every referral!
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/refer-and-earn')}
              style={styles.referralBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.referralBtnText}>{t('view_all')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Active orders */}
        <View style={styles.section}>
          <TitleWidget
            title={t('active_order')}
            showOrderCount
            orderCount={activeOrders.length}
            onTap={
              activeOrders.length > 1
                ? () => router.push('/running-order')
                : undefined
            }
          />
          {currentOrders === null ? (
            <LoadingShimmer count={1} height={120} />
          ) : activeOrders.length === 0 ? (
            <EmptyState
              image={Images.bag}
              title={t('no_order_available')}
              description="New orders will appear here once received"
            />
          ) : (
            <OrderWidget
              order={activeOrders[0]}
              isRunningOrder
              onTap={() =>
                router.push({ pathname: '/order-details', params: { id: activeOrders[0].id } })
              }
            />
          )}
        </View>

        {/* Latest orders */}
        {latestOrders.length > 0 ? (
          <View style={styles.section}>
            <TitleWidget
              title={t('latest_orders')}
              onTap={() => router.push('/(tabs)/orders')}
            />
            <View style={styles.latestList}>
              {latestOrders.slice(0, 3).map((o) => (
                <OrderWidget
                  key={o.id}
                  order={o}
                  onTap={() =>
                    router.push({ pathname: '/order-details', params: { id: o.id } })
                  }
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeSmall,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
    flex: 1,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  appName: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
  storeName: {
    ...Typography.caption,
  },
  bellBtn: {
    padding: 8,
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    padding: Dimensions.paddingSizeDefault,
    paddingBottom: Dimensions.paddingSizeExtraLarge,
  },
  onlineCard: {
    borderRadius: Dimensions.radiusDefault,
    padding: Dimensions.paddingSizeDefault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Dimensions.paddingSizeDefault,
  },
  onlineInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
  },
  onlineIcon: {
    width: 36,
    height: 36,
    tintColor: '#FFFFFF',
  },
  onlineTitle: {
    ...Typography.subtitle,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  onlineSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeSmall,
    borderRadius: Dimensions.radiusDefault,
  },
  toggleText: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    alignItems: 'flex-start',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Dimensions.paddingSizeSmall,
  },
  statValue: {
    ...Typography.h3,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 2,
  },
  cashCard: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeDefault,
    overflow: 'hidden',
    position: 'relative',
  },
  cashBg: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
    opacity: 0.15,
  },
  cashContent: {},
  cashLabel: {
    ...Typography.body,
  },
  cashValue: {
    ...Typography.h2,
    fontWeight: '900',
    marginTop: 4,
  },
  cashBtn: {
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeExtraSmall,
    borderRadius: Dimensions.radiusSmall,
    alignSelf: 'flex-start',
    marginTop: Dimensions.paddingSizeSmall,
  },
  cashBtnText: {
    color: '#FFFFFF',
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  section: {
    marginBottom: Dimensions.paddingSizeDefault,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Dimensions.paddingSizeSmall,
  },
  actionCard: {
    flexBasis: '31%',
    flexGrow: 1,
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
  actionLabel: {
    ...Typography.bodySmall,
    textAlign: 'center',
    fontWeight: '600',
  },
  referralCard: {
    borderRadius: Dimensions.radiusDefault,
    padding: Dimensions.paddingSizeDefault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Dimensions.paddingSizeDefault,
  },
  referralInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
  },
  referralIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
  },
  referralTitle: {
    ...Typography.subtitle,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  referralSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    flexShrink: 1,
  },
  referralBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Dimensions.paddingSizeSmall,
    paddingVertical: Dimensions.paddingSizeExtraSmall,
    borderRadius: Dimensions.radiusSmall,
  },
  referralBtnText: {
    color: '#DC2626',
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  latestList: {
    gap: Dimensions.paddingSizeSmall,
  },
});
