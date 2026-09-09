/**
 * Edit Withdraw Method screen — mirrors lib/features/my_account/screens/edit_withdraw_method_screen.dart.
 * Edits an existing withdraw method's fields. Loads existing values from list (mock).
 */

import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTranslation } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { CustomAppBar } from '@/components/CustomAppBar';
import { CustomButton } from '@/components/CustomButton';
import { CustomTextField } from '@/components/CustomTextField';
import { fetchWithdrawMethods } from '@/services/data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { WithdrawMethod } from '@/types';

export default function EditWithdrawMethodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; type?: string }>();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [method, setMethod] = useState<WithdrawMethod | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      try {
        const all = await fetchWithdrawMethods(profile.id);
        const m = all.find((x) => x.id === params.id);
        if (m) {
          setMethod(m);
          setFields(m.fields);
        }
      } catch (e: any) {
        snackbar.error(e?.message || 'Failed to load method');
      }
    })();
  }, [profile, params.id, snackbar]);

  const handleSave = async () => {
    if (!method) return;
    // Validate
    for (const [k, v] of Object.entries(fields)) {
      if (!v || !v.trim()) {
        return snackbar.error(`${k.replace(/_/g, ' ')} is required`);
      }
    }
    setSaving(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('withdraw_methods')
          .update({ fields, updated_at: new Date().toISOString() })
          .eq('id', method.id);
        if (error) throw error;
      }
      snackbar.success('Method updated');
      router.back();
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to update method');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('edit_withdraw_method')} onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>
            Type: {method?.type?.toUpperCase() || params.type?.toUpperCase()}
          </Text>

          {Object.entries(fields).map(([k, v]) => (
            <CustomTextField
              key={k}
              labelText={k.replace(/_/g, ' ')}
              hintText="Enter value"
              value={v}
              onChangeText={(text) => setFields((prev) => ({ ...prev, [k]: text }))}
            />
          ))}

          <View style={{ height: Dimensions.paddingSizeDefault }} />
          <CustomButton buttonText={t('save_changes')} isLoading={saving} onPress={handleSave} />
          <View style={{ height: Dimensions.paddingSizeExtraLarge }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    padding: Dimensions.paddingSizeLarge,
    flexGrow: 1,
  },
  typeLabel: {
    ...Typography.body,
    marginTop: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeSmall,
    textTransform: 'capitalize',
  },
});
