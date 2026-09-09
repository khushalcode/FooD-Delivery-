/**
 * Profile screen — mirrors lib/features/profile/screens/profile_screen.dart (V4.0).
 * Vendor variant: full menu with system/background notification toggles, vehicle details,
 * change password, conversations, language, edit profile, my reviews, leaderboard,
 * help & support, my earning, earning report, my account, withdraw method, disbursement,
 * refer & earn, safety, terms, privacy, delete account, logout.
 */

import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { AppConstants } from '@/constants/app_constants';
import { CustomAppBar } from '@/components/CustomAppBar';
import { formatPrice } from '@/utils/price';

interface MenuItem {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconImage?: number;
  route?: string;
  action?: () => void;
  color?: string;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: () => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, logout, updateProfile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors, mode, toggleTheme } = useTheme();

  const [bgNotification, setBgNotification] = useState(true);
  const [systemNotification, setSystemNotification] = useState(true);

  const handleLogout = () => {
    Alert.alert(t('logout'), t('are_you_sure_you_want_to_logout'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          snackbar.success('Logged out');
          router.replace('/sign-in');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_account'),
      t('are_you_sure_to_delete_account'),
      [
        { text: t('no'), style: 'cancel' },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            snackbar.success('Account deletion requested');
            router.replace('/sign-in');
          },
        },
      ]
    );
  };

  const items: MenuItem[] = [
    // Dark mode toggle
    {
      label: t('dark_mode'),
      icon: mode === 'dark' ? 'sunny-outline' : 'moon-outline',
      isToggle: true,
      toggleValue: mode === 'dark',
      onToggle: toggleTheme,
    },
    // System notification toggle
    {
      label: t('system_notification'),
      iconImage: Images.setting,
      isToggle: true,
      toggleValue: systemNotification,
      onToggle: () => {
        setSystemNotification((v) => !v);
        snackbar.info(`System notifications ${!systemNotification ? 'enabled' : 'disabled'}`);
      },
    },
    // Background notification toggle (Android only conceptually, shown on all)
    {
      label: t('background_notification'),
      iconImage: Images.notificationBing,
      isToggle: true,
      toggleValue: bgNotification,
      onToggle: () => {
        setBgNotification((v) => !v);
        snackbar.info(`Background notifications ${!bgNotification ? 'enabled' : 'disabled'}`);
      },
    },
    // Vehicle details (only when ride mode active)
    ...(profile?.vehicle ? [{
      label: t('vehicle_details'),
      iconImage: Images.car,
      route: '/vehicle-details',
    }] : []),
    // Change password
    {
      label: t('change_password'),
      iconImage: Images.shieldSecurity,
      route: '/change-password',
    },
    // Conversations
    {
      label: t('conversation'),
      iconImage: Images.messages,
      route: '/conversations',
    },
    // Language
    {
      label: t('language'),
      iconImage: Images.translate,
      route: '/language',
    },
    // Edit profile
    {
      label: t('edit_profile'),
      iconImage: Images.userEdit,
      route: '/update-profile',
    },
    // My reviews
    {
      label: t('my_reviews'),
      iconImage: Images.riderNoReview,
      route: '/reviews',
    },
    // Leaderboard
    {
      label: t('leader_board'),
      iconImage: Images.riderLeaderBoardIcon,
      route: '/leaderboard',
    },
    // Help & support
    {
      label: t('help_and_support'),
      iconImage: Images.support,
      route: '/help-and-support',
    },
    // My earning (only when earnings enabled)
    ...(profile?.earnings === 1 ? [{
      label: t('my_earning'),
      iconImage: Images.earningMenu,
      route: '/my-earning',
    }] : []),
    // Earning report
    ...(profile?.earnings === 1 ? [{
      label: t('earning_report'),
      iconImage: Images.earningReport,
      route: '/earning-report',
    }] : []),
    // My account
    ...(profile?.earnings === 1 ? [{
      label: t('my_account'),
      iconImage: Images.emptyWallet,
      route: '/my-account',
    }] : []),
    // Withdraw method
    {
      label: t('withdraw_method'),
      icon: 'card-outline',
      route: '/withdraw-method',
    },
    // Disbursement
    {
      label: t('disbursement'),
      icon: 'swap-vertical-outline',
      route: '/disbursement',
    },
    // Refer & earn
    {
      label: t('refer_and_earn'),
      iconImage: Images.earningMenu,
      route: '/refer-and-earn',
    },
    // Safety
    {
      label: t('safety'),
      iconImage: Images.shieldTick,
      route: '/safety-policy',
    },
    // Terms
    {
      label: t('terms_condition'),
      iconImage: Images.documentText,
      route: '/terms',
    },
    // Privacy
    {
      label: t('privacy_policy'),
      iconImage: Images.documentText,
      route: '/privacy',
    },
    // Delete account
    {
      label: t('delete_account'),
      iconImage: Images.trash,
      action: handleDeleteAccount,
      color: colors.error,
    },
    // Logout
    {
      label: t('logout'),
      icon: 'log-out-outline',
      action: handleLogout,
      color: colors.error,
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('my_profile')} showBack={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.avatarWrap}>
            {profile?.logo_url ? (
              <Image source={{ uri: profile.logo_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitial}>
                  {(profile?.store_name || 'V').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.storeName, { color: colors.textPrimary }]} numberOfLines={1}>
              {profile?.store_name || 'Vendor'}
            </Text>
            <Text style={[styles.ownerName, { color: colors.textSecondary }]} numberOfLines={1}>
              {profile?.owner_name || ''}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFA500" />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {profile?.avg_rating?.toFixed(1) || '0.0'} ({profile?.rating_count || 0} {t('reviews')})
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/update-profile')}
            style={[styles.editBtn, { borderColor: colors.primary }]}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {profile?.member_since_days || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('days_since_joining')}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {profile?.order_count || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('order_completed')}
            </Text>
          </View>
        </View>

        {/* Online status card */}
        <View style={[styles.onlineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={Images.onlineStatus} style={[styles.onlineIcon, { tintColor: colors.disabled }]} resizeMode="contain" />
          <View style={styles.onlineInfo}>
            <Text style={[styles.onlineTitle, { color: colors.textPrimary }]}>
              {t('online_status')}
            </Text>
            <Text style={[styles.onlineSubtitle, { color: colors.textSecondary }]}>
              {t('manage_your_delivery_availability')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              if (!profile) return;
              const newActive = !profile.active;
              await updateProfile({ active: newActive });
              snackbar.success(newActive ? t('store_is_online') : t('store_is_offline'));
            }}
            style={[
              styles.switchBtn,
              {
                backgroundColor: profile?.active ? colors.primary : colors.disabled + '40',
              },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.switchKnob,
                {
                  backgroundColor: '#FFFFFF',
                  transform: [{ translateX: profile?.active ? 22 : 0 }],
                },
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Balance card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>{t('available_balance')}</Text>
              <Text style={styles.balanceValue}>{formatPrice(profile?.balance || 0)}</Text>
            </View>
            <Image source={Images.wallet} style={styles.balanceIcon} resizeMode="contain" />
          </View>
          <View style={styles.balanceSubRow}>
            <View>
              <Text style={styles.balanceSubLabel}>{t('cash_in_hand')}</Text>
              <Text style={styles.balanceSubValue}>{formatPrice(profile?.cash_in_hand || 0)}</Text>
            </View>
            <View>
              <Text style={styles.balanceSubLabel}>{t('total_earning')}</Text>
              <Text style={styles.balanceSubValue}>{formatPrice(profile?.total_earning || 0)}</Text>
            </View>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menu}>
          {items.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                if (item.isToggle) {
                  item.onToggle?.();
                } else if (item.action) {
                  item.action();
                } else if (item.route) {
                  router.push(item.route as any);
                }
              }}
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.card,
                  borderBottomColor: colors.border,
                },
              ]}
              activeOpacity={0.6}
            >
              <View
                style={[
                  styles.menuIconWrap,
                  { backgroundColor: (item.color || colors.primary) + '15' },
                ]}
              >
                {item.iconImage ? (
                  <Image
                    source={item.iconImage}
                    style={[styles.menuIconImg, { tintColor: item.color || colors.primary }]}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons
                    name={item.icon || 'chevron-forward-outline'}
                    size={20}
                    color={item.color || colors.primary}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.menuLabel,
                  { color: item.color || colors.textPrimary },
                ]}
              >
                {item.label}
              </Text>
              {item.isToggle ? (
                <View
                  style={[
                    styles.toggleIndicator,
                    {
                      backgroundColor: item.toggleValue ? colors.primary : colors.disabled + '40',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      {
                        transform: [{ translateX: item.toggleValue ? 18 : 0 }],
                      },
                    ]}
                  />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.disabled} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.versionText, { color: colors.disabled }]}>
          {t('version')} {AppConstants.appVersion}
        </Text>
        <View style={{ height: Dimensions.paddingSizeExtraLarge }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeDefault,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Dimensions.paddingSizeDefault,
  },
  avatarWrap: {},
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  storeName: {
    ...Typography.h3,
    fontWeight: '700',
  },
  ownerName: {
    ...Typography.body,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    ...Typography.caption,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Dimensions.paddingSizeSmall,
    padding: Dimensions.paddingSizeDefault,
  },
  statCard: {
    flex: 1,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h3,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 2,
    textAlign: 'center',
  },
  onlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeDefault,
    borderRadius: Dimensions.radiusSmall,
    borderWidth: 1,
    padding: Dimensions.paddingSizeSmall,
    gap: Dimensions.paddingSizeSmall,
  },
  onlineIcon: {
    width: 25,
    height: 25,
  },
  onlineInfo: {
    flex: 1,
  },
  onlineTitle: {
    ...Typography.body,
    fontWeight: '500',
  },
  onlineSubtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  switchBtn: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  balanceCard: {
    marginHorizontal: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeDefault,
    borderRadius: Dimensions.radiusDefault,
    padding: Dimensions.paddingSizeDefault,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Dimensions.paddingSizeDefault,
  },
  balanceLabel: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.85)',
  },
  balanceValue: {
    ...Typography.h2,
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 4,
  },
  balanceIcon: {
    width: 50,
    height: 50,
    tintColor: '#FFFFFF',
  },
  balanceSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 1,
    paddingTop: Dimensions.paddingSizeSmall,
  },
  balanceSubLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  balanceSubValue: {
    ...Typography.subtitle,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
  menu: {
    marginHorizontal: Dimensions.paddingSizeDefault,
    borderRadius: Dimensions.radiusDefault,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Dimensions.paddingSizeDefault,
    paddingHorizontal: Dimensions.paddingSizeDefault,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Dimensions.paddingSizeSmall,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconImg: {
    width: 20,
    height: 20,
  },
  menuLabel: {
    flex: 1,
    ...Typography.body,
  },
  toggleIndicator: {
    width: 38,
    height: 22,
    borderRadius: 11,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  versionText: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Dimensions.paddingSizeDefault,
  },
});
