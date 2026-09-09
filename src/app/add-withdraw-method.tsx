/**
 * Add Withdraw Method screen — mirrors lib/features/my_account/screens/add_withdraw_method_screen.dart.
 * Form to add a new withdraw method (bank / paypal / stripe / mobile_money).
 */

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { useSnackbar } from '@/context/SnackbarContext';
import { useTranslation } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { CustomAppBar } from '@/components/CustomAppBar';
import { CustomButton } from '@/components/CustomButton';
import { CustomTextField } from '@/components/CustomTextField';
import { addWithdrawMethod } from '@/services/data';
import type { WithdrawMethod } from '@/types';

type MethodType = 'bank' | 'paypal' | 'stripe' | 'mobile_money' | 'other';

const TYPE_OPTIONS: { key: MethodType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'bank', label: 'Bank', icon: 'business-outline' },
  { key: 'paypal', label: 'PayPal', icon: 'logo-paypal' },
  { key: 'stripe', label: 'Stripe', icon: 'card-outline' },
  { key: 'mobile_money', label: 'Mobile Money', icon: 'phone-portrait-outline' },
  { key: 'other', label: 'Other', icon: 'wallet-outline' },
];

export default function AddWithdrawMethodScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [type, setType] = useState<MethodType>('bank');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const fieldConfig: Record<MethodType, { key: string; label: string; placeholder: string }[]> = {
    bank: [
      { key: 'account_name', label: 'Account Name', placeholder: 'John Doe' },
      { key: 'account_number', label: 'Account Number', placeholder: '1234567890' },
      { key: 'bank_name', label: 'Bank Name', placeholder: 'HDFC Bank' },
      { key: 'ifsc', label: 'IFSC / Routing Code', placeholder: 'HDFC0001234' },
    ],
    paypal: [{ key: 'email', label: 'PayPal Email', placeholder: 'you@paypal.com' }],
    stripe: [{ key: 'account_id', label: 'Stripe Account ID', placeholder: 'acct_XXXX' }],
    mobile_money: [
      { key: 'phone', label: 'Mobile Money Phone', placeholder: '+1 555 1234' },
      { key: 'carrier', label: 'Carrier', placeholder: 'MTN / Airtel / Vodafone' },
    ],
    other: [{ key: 'details', label: 'Method Details', placeholder: 'Enter details' }],
  };

  const handleSave = async () => {
    if (!profile) return;
    // Validate required fields
    for (const f of fieldConfig[type]) {
      if (!fields[f.key] || !fields[f.key].trim()) {
        return snackbar.error(`${f.label} is required`);
      }
    }
    setSaving(true);
    try {
      await addWithdrawMethod({
        vendor_id: profile.id,
        type,
        is_default: isDefault,
        fields,
      });
      snackbar.success('Method added');
      router.back();
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to add method');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('add_withdraw_method')} onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Method Type</Text>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((opt) => {
              const active = opt.key === type;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => {
                    setType(opt.key);
                    setFields({});
                  }}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: active ? colors.primary + '15' : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={22}
                    color={active ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: active ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Details</Text>
          {fieldConfig[type].map((f) => (
            <CustomTextField
              key={f.key}
              labelText={f.label}
              hintText={f.placeholder}
              value={fields[f.key] || ''}
              onChangeText={(text) => setFields((prev) => ({ ...prev, [f.key]: text }))}
            />
          ))}

          <TouchableOpacity
            onPress={() => setIsDefault((v) => !v)}
            style={styles.defaultRow}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDefault ? 'checkbox' : 'square-outline'}
              size={22}
              color={isDefault ? colors.primary : colors.disabled}
            />
            <Text style={[styles.defaultText, { color: colors.textPrimary }]}>
              Set as default method
            </Text>
          </TouchableOpacity>

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
  sectionTitle: {
    ...Typography.title,
    marginTop: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  typeCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    alignItems: 'center',
    gap: Dimensions.paddingSizeExtraSmall,
  },
  typeLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Dimensions.paddingSizeSmall,
    marginTop: Dimensions.paddingSizeDefault,
  },
  defaultText: {
    ...Typography.body,
  },
});
