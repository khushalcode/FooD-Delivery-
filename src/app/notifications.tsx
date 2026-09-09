/**
 * Notifications screen — mirrors lib/features/notification/screens/notification_screen.dart.
 * Lists notifications with read/unread states; tapping marks as read.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import { EmptyState } from '@/components/EmptyState';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { timeAgo } from '@/utils/date';
import { fetchNotifications, markNotificationRead } from '@/services/data';
import type { NotificationItem } from '@/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchNotifications(profile.id);
      setItems(data);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load notifications');
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

  const handleTap = async (item: NotificationItem) => {
    if (!item.is_read) {
      await markNotificationRead(item.id);
      setItems((prev) =>
        prev?.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)) || null
      );
    }
    if (item.type === 'order' && item.data?.order_id) {
      router.push({ pathname: '/order-details', params: { id: String(item.data.order_id) } });
    } else if (item.type === 'message') {
      router.push('/conversations');
    }
  };

  const iconForType = (type: NotificationItem['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'order':
        return 'bag-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'warning':
        return 'warning-outline';
      default:
        return 'notifications-outline';
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('notifications')} onBackPress={() => router.back()} />

      <FlatList
        data={items || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Dimensions.paddingSizeDefault, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: Dimensions.paddingSizeSmall }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          items === null ? (
            <LoadingShimmer count={4} height={70} />
          ) : (
            <EmptyState
              image={Images.notificationBing}
              title="No notifications yet"
              description="Your notifications will appear here"
            />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleTap(item)}
            style={[
              styles.card,
              {
                backgroundColor: item.is_read ? colors.card : colors.primary + '0A',
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: (item.type === 'warning' ? colors.warning : colors.primary) + '15' },
              ]}
            >
              <Ionicons
                name={iconForType(item.type)}
                size={20}
                color={item.type === 'warning' ? colors.warning : colors.primary}
              />
            </View>

            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text
                  style={[styles.title, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {!item.is_read ? (
                  <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                ) : null}
              </View>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
              <Text style={[styles.time, { color: colors.disabled }]}>
                {timeAgo(item.created_at)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  card: {
    flexDirection: 'row',
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    gap: Dimensions.paddingSizeSmall,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.subtitle,
    fontWeight: '700',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  description: {
    ...Typography.bodySmall,
    marginTop: 4,
  },
  time: {
    ...Typography.caption,
    marginTop: 4,
  },
});
