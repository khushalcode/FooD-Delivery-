/**
 * Chat screen — mirrors lib/features/chat/screens/chat_screen.dart.
 * 1-on-1 chat with messages list + text input. Uses Supabase realtime if configured.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import { formatTime } from '@/utils/date';
import { fetchMessages, sendMessage } from '@/services/data';
import type { ChatMessage } from '@/types';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    conversation_id?: string;
    customer_name?: string;
  }>();
  const conversationId = params.conversation_id || '';
  const customerName = params.customer_name || 'Customer';

  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!conversationId) return;
    try {
      const data = await fetchMessages(conversationId);
      setMessages(data);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load messages');
    }
  }, [conversationId, snackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !profile) return;
    setSending(true);
    setText('');
    try {
      const newMsg = await sendMessage(conversationId, profile.id, trimmed);
      if (newMsg) {
        setMessages((prev) => [...(prev || []), newMsg]);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      }
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar
        title={customerName}
        onBackPress={() => router.back()}
        leading={
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {customerName.charAt(0).toUpperCase()}
            </Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Dimensions.paddingSizeDefault, flexGrow: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: Dimensions.paddingSizeSmall }} />}
          ListEmptyComponent={
            messages === null ? (
              <LoadingShimmer count={4} height={60} />
            ) : (
              <EmptyState
                image={Images.messages}
                title="No messages yet"
                description="Say hello to start the conversation"
              />
            )
          }
          renderItem={({ item }) => {
            const isMe = item.sender_type === 'vendor';
            return (
              <View style={[styles.messageRow, isMe ? styles.messageRowMe : {}]}>
                <View
                  style={[
                    styles.bubble,
                    {
                      backgroundColor: isMe ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      { color: isMe ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {item.message}
                  </Text>
                  <Text
                    style={[
                      styles.timeText,
                      { color: isMe ? 'rgba(255,255,255,0.7)' : colors.disabled },
                    ]}
                  >
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('type_a_message')}
            placeholderTextColor={colors.hint}
            style={[
              styles.input,
              { backgroundColor: colors.inputFill, color: colors.textPrimary },
            ]}
            multiline
            maxLength={250}
            editable={!sending}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[
              styles.sendBtn,
              { backgroundColor: text.trim() ? colors.primary : colors.disabled },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: Dimensions.radiusDefault,
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeSmall,
    borderWidth: 1,
  },
  messageText: {
    ...Typography.body,
  },
  timeText: {
    ...Typography.caption,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Dimensions.paddingSizeSmall,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Dimensions.paddingSizeSmall,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: 8,
    ...Typography.body,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
