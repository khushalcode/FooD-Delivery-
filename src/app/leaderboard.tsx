/**
 * Leaderboard screen — mirrors lib/features/ride_module/leaderboard/screens/leaderboard_screen.dart.
 * Shows top riders ranked by rides / earnings / rating, plus the current user's rank.
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
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { EmptyState } from '@/components/EmptyState';
import { formatPrice } from '@/utils/price';
import { fetchLeaderboard } from '@/services/data';
import type { LeaderboardEntry } from '@/types';

export default function LeaderboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchLeaderboard();
      setEntries(data);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load leaderboard');
    }
  }, [snackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const podium = (entries || []).slice(0, 3);
  const rest = (entries || []).slice(3);
  const myEntry = (entries || []).find((e) => e.rider_id === profile?.id);

  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // gold, silver, bronze
  const podiumHeights = [120, 100, 90];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('leader_board')} onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* My rank card */}
        {myEntry ? (
          <View style={[styles.myRankCard, { backgroundColor: colors.primary }]}>
            <Image source={Images.riderLeaderBoardIcon} style={styles.myRankIcon} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={styles.myRankLabel}>{t('leaderboard_rank')}</Text>
              <Text style={styles.myRankValue}>#{myEntry.rank} · {myEntry.total_rides} {t('total_ride')}</Text>
              <Text style={styles.myRankSub}>{formatPrice(myEntry.total_earning)} earned</Text>
            </View>
            <View style={styles.myRankBadge}>
              <Text style={styles.myRankBadgeText}>LVL {myEntry.level}</Text>
            </View>
          </View>
        ) : null}

        {/* Podium */}
        {entries === null ? (
          <LoadingShimmer count={3} height={120} />
        ) : entries.length === 0 ? (
          <EmptyState image={Images.riderLeaderBoardIcon} title={t('no_data_available')} />
        ) : (
          <>
            <View style={styles.podiumRow}>
              {podium.map((p, i) => {
                // Visual order: silver, gold, bronze
                const visualIndex = i === 0 ? 1 : i === 1 ? 0 : 2;
                return (
                  <View key={p.id} style={styles.podiumCol}>
                    <View style={[styles.podiumAvatar, { backgroundColor: podiumColors[i] }]}>
                      <Text style={styles.podiumAvatarText}>
                        {p.rider_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.podiumName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {p.rider_name}
                    </Text>
                    <Text style={[styles.podiumRides, { color: colors.textSecondary }]}>
                      {p.total_rides} {t('total_ride')}
                    </Text>
                    <View style={[styles.podiumBlock, { backgroundColor: podiumColors[i], height: podiumHeights[i] }]}>
                      <Text style={styles.podiumRank}>#{p.rank}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Rest of leaderboard */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {rest.map((e, i) => (
                <View
                  key={e.id}
                  style={[
                    styles.leaderboardRow,
                    i < rest.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth } : {},
                  ]}
                >
                  <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>#{e.rank}</Text>
                  <View style={[styles.leaderboardAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.leaderboardAvatarText}>
                      {e.rider_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.leaderboardName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {e.rider_name}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#FFA500" />
                      <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                        {e.rating.toFixed(1)} · {e.total_rides} {t('total_ride')}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.earningText, { color: colors.success }]}>
                    {formatPrice(e.total_earning)}
                  </Text>
                </View>
              ))}
            </View>
          </>
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
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Dimensions.radiusDefault,
    padding: Dimensions.paddingSizeDefault,
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  myRankIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
  },
  myRankLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  myRankValue: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
  myRankSub: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  myRankBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Dimensions.paddingSizeSmall,
    paddingVertical: 4,
    borderRadius: Dimensions.radiusSmall,
  },
  myRankBadgeText: {
    color: '#DC2626',
    fontWeight: '900',
    fontSize: 12,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginBottom: Dimensions.paddingSizeDefault,
    minHeight: 200,
  },
  podiumCol: {
    alignItems: 'center',
    flex: 1,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  podiumAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  podiumName: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  podiumRides: {
    ...Typography.caption,
    marginBottom: 6,
  },
  podiumBlock: {
    width: '100%',
    borderRadius: Dimensions.radiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRank: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Dimensions.paddingSizeSmall,
    gap: Dimensions.paddingSizeSmall,
  },
  rankNumber: {
    ...Typography.subtitle,
    fontWeight: '700',
    width: 36,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  leaderboardName: {
    ...Typography.body,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    ...Typography.caption,
  },
  earningText: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
});
