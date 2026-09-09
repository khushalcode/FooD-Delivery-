/**
 * Withdraw Method screen — mirrors lib/features/my_account/screens/withdraw_method_screen.dart.
 * Lists saved withdraw methods; allows adding new, editing, deleting, setting default.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
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
import { CustomButton } from '@/components/CustomButton';
import { EmptyState } from '@/components/EmptyState';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import {
  fetchWithdrawMethods,
  deleteWithdrawMethod,
  makeDefaultWithdrawMethod,
} from '@/services/data';
import type { WithdrawMethod } from '@/types';

export default function WithdrawMethodScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [methods, setMethods] = useState<WithdrawMethod[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchWithdrawMethods(profile.id);
      setMethods(data);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load methods');
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

  const handleDelete = (m: WithdrawMethod) => {
    Alert.alert('Delete Method', `Are you sure you want to delete this ${m.type} method?`, [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          await deleteWithdrawMethod(m.id);
          snackbar.success('Method deleted');
          load();
        },
      },
    ]);
  };

  const handleMakeDefault = async (m: WithdrawMethod) => {
    if (!profile) return;
    await makeDefaultWithdrawMethod(profile.id, m.id);
    snackbar.success('Default method updated');
    load();
  };

  const iconForType = (type: WithdrawMethod['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'bank':
        return 'business-outline';
      case 'paypal':
        return 'logo-paypal';
      case 'stripe':
        return 'card-outline';
      case 'mobile_money':
        return 'phone-portrait-outline';
      default:
        return 'wallet-outline';
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('withdraw_methods')} onBackPress={() => router.back()} />

      <FlatList
        data={methods || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Dimensions.paddingSizeDefault, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: Dimensions.paddingSizeSmall }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          methods === null ? (
            <LoadingShimmer count={3} height={100} />
          ) : (
            <EmptyState
              image={Images.emptyWallet}
              title="No withdraw methods"
              description="Add a withdraw method to receive your earnings"
            />
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={iconForType(item.type)} size={22} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.type, { color: colors.textPrimary }]}>
                    {item.type.replace('_', ' ').toUpperCase()}
                  </Text>
                  {item.is_default ? (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.defaultText, { color: colors.success }]}>
                        {t('default_method')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={[styles.fields, { borderTopColor: colors.border }]}>
              {Object.entries(item.fields).map(([k, v]) => (
                <View key={k} style={styles.fieldRow}>
                  <Text style={[styles.fieldKey, { color: colors.textSecondary }]}>{k.replace(/_/g, ' ')}:</Text>
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{v}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardActions}>
              {!item.is_default ? (
                <TouchableOpacity
                  onPress={() => handleMakeDefault(item)}
                  style={[styles.actionBtn, { borderColor: colors.success }]}
                >
                  <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
                  <Text style={[styles.actionText, { color: colors.success }]}>{t('make_default')}</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/edit-withdraw-method',
                    params: { id: item.id, type: item.type },
                  })
                }
                style={[styles.actionBtn, { borderColor: colors.primary }]}
              >
                <Ionicons name="create-outline" size={14} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>{t('edit_withdraw_method')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={[styles.actionBtn, { borderColor: colors.error }]}
              >
                <Ionicons name="trash-outline" size={14} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={{ marginTop: Dimensions.paddingSizeDefault }}>
            <CustomButton
              buttonText={t('add_withdraw_method')}
              variant="outline"
              onPress={() => router.push('/add-withdraw-method')}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  type: {
    ...Typography.subtitle,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  defaultBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
  },
  fields: {
    marginTop: Dimensions.paddingSizeDefault,
    paddingTop: Dimensions.paddingSizeDefault,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    textTransform: 'capitalize',
  },
  fieldKey: {
    ...Typography.bodySmall,
    textTransform: 'capitalize',
  },
  fieldValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: Dimensions.paddingSizeSmall,
    marginTop: Dimensions.paddingSizeDefault,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Dimensions.paddingSizeSmall,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
