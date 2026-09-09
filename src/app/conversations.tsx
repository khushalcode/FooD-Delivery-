/**
 * Conversations screen — mirrors lib/features/chat/screens/conversation_screen.dart.
 * Lists all chat conversations with the customer (and search bar).
 */

import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { fetchConversations } from '@/services/data';
import type { Conversation } from '@/types';

export default function ConversationsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [items, setItems] = useState<Conversation[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchConversations(profile.id);
      setItems(data);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load conversations');
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

  const filtered = (items || []).filter((c) =>
    c.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('conversations')} onBackPress={() => router.back()} />

      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('search')}
          placeholderTextColor={colors.hint}
          style={[
            styles.searchInput,
            { backgroundColor: colors.inputFill, color: colors.textPrimary, borderColor: colors.border },
          ]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Dimensions.paddingSizeDefault, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: Dimensions.paddingSizeSmall }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          items === null ? (
            <LoadingShimmer count={5} height={70} />
          ) : (
            <EmptyState
              image={Images.messages}
              title={t('no_conversation_found')}
              description="Start a conversation from an order detail page"
            />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/chat',
                params: { conversation_id: item.id, customer_name: item.customer_name },
              })
            }
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {item.customer_name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.customer_name}
                </Text>
                <Text style={[styles.time, { color: colors.disabled }]}>
                  {timeAgo(item.last_message_at)}
                </Text>
              </View>
              <View style={styles.messageRow}>
                <Text
                  style={[styles.lastMessage, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.last_message}
                </Text>
                {item.unread_count > 0 ? (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.unreadText}>{item.unread_count}</Text>
                  </View>
                ) : null}
              </View>
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
  searchWrap: {
    padding: Dimensions.paddingSizeDefault,
  },
  searchInput: {
    height: 44,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    paddingHorizontal: Dimensions.paddingSizeDefault,
    ...Typography.body,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    gap: Dimensions.paddingSizeSmall,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...Typography.subtitle,
    fontWeight: '700',
    flex: 1,
  },
  time: {
    ...Typography.caption,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    ...Typography.bodySmall,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
