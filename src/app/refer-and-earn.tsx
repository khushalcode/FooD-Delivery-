/**
 * Refer & Earn screen — mirrors lib/features/refer_and_earn/screens/refer_and_earn_screen.dart.
 * Shows referral code, stats, share button, and list of referral earnings.
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
import * as Clipboard from 'expo-clipboard';
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
import { fetchReferralEarnings, fetchReferralStats } from '@/services/data';
import type { ReferralEarning, ReferralStats } from '@/types';

export default function ReferAndEarnScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [earnings, setEarnings] = useState<ReferralEarning[] | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const [e, s] = await Promise.all([
        fetchReferralEarnings(profile.id),
        fetchReferralStats(profile.id),
      ]);
      setEarnings(e);
      setStats(s);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load referrals');
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

  const handleCopy = async () => {
    if (!stats?.referral_code) return;
    await Clipboard.setStringAsync(stats.referral_code);
    snackbar.success(t('copied_to_clipboard'));
  };

  const handleShare = () => {
    if (!stats?.referral_code) return;
    snackbar.info('Sharing dialog would open here');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('refer_and_earn')} onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card with referral code */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Image source={Images.gift} style={styles.heroImage} resizeMode="contain" />
          <Text style={styles.heroTitle}>{t('refer_and_earn')}</Text>
          <Text style={styles.heroSubtitle}>
            Share your code with friends. Earn rewards when they join!
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>{t('referral_code')}</Text>
            <Text style={styles.codeValue}>{stats?.referral_code || '...'}</Text>
          </View>

          <View style={styles.heroActions}>
            <TouchableOpacity onPress={handleCopy} style={styles.heroBtnOutline}>
              <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
              <Text style={styles.heroBtnText}>{t('copy_code')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.heroBtnFilled}>
              <Ionicons name="share-social-outline" size={16} color={colors.primary} />
              <Text style={[styles.heroBtnText, { color: colors.primary }]}>{t('share_now')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {stats?.total_referrals || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('total_referrals')}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {formatPrice(stats?.total_earning || 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('total_earning')}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {formatPrice(stats?.pending_earning || 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('pending_earning')}
            </Text>
          </View>
        </View>

        {/* Referral earnings list */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('referral_earning')}
        </Text>

        {earnings === null ? (
          <LoadingShimmer count={3} height={70} />
        ) : earnings.length === 0 ? (
          <EmptyState
            image={Images.referCoin}
            title="No referrals yet"
            description="Share your code to start earning rewards"
          />
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {earnings.map((e, i) => (
              <View
                key={e.id}
                style={[
                  styles.earningRow,
                  i < earnings.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth } : {},
                ]}
              >
                <View style={[styles.earningAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.earningAvatarText}>
                    {e.referred_user_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.earningInfo}>
                  <Text style={[styles.earningName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {e.referred_user_name}
                  </Text>
                  <Text style={[styles.earningTime, { color: colors.textSecondary }]}>
                    {timeAgo(e.created_at)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.earningAmount, { color: colors.success }]}>
                    +{formatPrice(e.amount)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: (e.status === 'completed' ? colors.success : colors.warning) + '20' }]}>
                    <Text style={[styles.statusText, { color: e.status === 'completed' ? colors.success : colors.warning }]}>
                      {e.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
    alignItems: 'center',
    marginBottom: Dimensions.paddingSizeDefault,
  },
  heroImage: {
    width: 80,
    height: 80,
    tintColor: '#FFFFFF',
    marginBottom: Dimensions.paddingSizeSmall,
  },
  heroTitle: {
    ...Typography.h2,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  codeBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Dimensions.radiusDefault,
    paddingHorizontal: Dimensions.paddingSizeLarge,
    paddingVertical: Dimensions.paddingSizeSmall,
    alignItems: 'center',
    marginBottom: Dimensions.paddingSizeDefault,
    minWidth: '100%',
  },
  codeLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  codeValue: {
    ...Typography.h2,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
  },
  heroActions: {
    flexDirection: 'row',
    gap: Dimensions.paddingSizeSmall,
    width: '100%',
  },
  heroBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Dimensions.paddingSizeSmall,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  heroBtnFilled: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Dimensions.paddingSizeSmall,
    borderRadius: Dimensions.radiusDefault,
    backgroundColor: '#FFFFFF',
  },
  heroBtnText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  statCard: {
    flex: 1,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeSmall,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h3,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    ...Typography.title,
    marginTop: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
  },
  earningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Dimensions.paddingSizeSmall,
    gap: Dimensions.paddingSizeSmall,
  },
  earningAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  earningInfo: {
    flex: 1,
  },
  earningName: {
    ...Typography.body,
    fontWeight: '600',
  },
  earningTime: {
    ...Typography.caption,
    marginTop: 2,
  },
  earningAmount: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
});
