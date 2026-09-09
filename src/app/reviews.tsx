/**
 * Reviews screen — mirrors lib/features/ride_module/review/screens/review_screen.dart.
 * Shows customer reviews with rating, comment, and customer info.
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
import { timeAgo } from '@/utils/date';
import { fetchReviews } from '@/services/data';
import type { Review } from '@/types';

export default function ReviewsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchReviews(profile.id);
      setReviews(data);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load reviews');
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

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('my_reviews')} onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryLeft}>
            <Text style={[styles.avgRating, { color: colors.textPrimary }]}>
              {avgRating.toFixed(1)}
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Ionicons
                  key={n}
                  name={n <= Math.round(avgRating) ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFA500"
                />
              ))}
            </View>
            <Text style={[styles.totalReviews, { color: colors.textSecondary }]}>
              {reviews?.length || 0} {t('reviews')}
            </Text>
          </View>
          <View style={styles.summaryRight}>
            <Image source={Images.riderNoReview} style={styles.summaryIcon} resizeMode="contain" />
          </View>
        </View>

        {/* Reviews list */}
        {reviews === null ? (
          <LoadingShimmer count={4} height={120} />
        ) : reviews.length === 0 ? (
          <EmptyState
            image={Images.riderNoReview}
            title="No reviews yet"
            description="Customer reviews will appear here once you complete orders"
          />
        ) : (
          <View style={styles.reviewsList}>
            {reviews.map((r) => (
              <View key={r.id} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewerAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.reviewerInitial}>
                      {r.customer_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewerName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {r.customer_name}
                    </Text>
                    <Text style={[styles.reviewTime, { color: colors.textSecondary }]}>
                      {timeAgo(r.created_at)}
                    </Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                    <Text style={styles.ratingBadgeText}>{r.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={[styles.reviewComment, { color: colors.textPrimary }]}>
                  "{r.comment}"
                </Text>
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeLarge,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  summaryLeft: {
    alignItems: 'flex-start',
  },
  avgRating: {
    ...Typography.h1,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  totalReviews: {
    ...Typography.caption,
    marginTop: 4,
  },
  summaryRight: {},
  summaryIcon: {
    width: 80,
    height: 80,
  },
  reviewsList: {
    gap: Dimensions.paddingSizeSmall,
  },
  reviewCard: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewerName: {
    ...Typography.subtitle,
    fontWeight: '600',
  },
  reviewTime: {
    ...Typography.caption,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFA500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  reviewComment: {
    ...Typography.body,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
