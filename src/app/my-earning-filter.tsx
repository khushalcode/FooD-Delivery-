/**
 * My Earning Filter screen — mirrors lib/features/my_account/screens/my_earning_filter_screen.dart.
 * Lets vendor pick a date range and transaction type for filtering earnings.
 */

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { CustomAppBar } from '@/components/CustomAppBar';
import { CustomButton } from '@/components/CustomButton';

type TxType = 'all' | 'earning' | 'withdrawal' | 'cash_collected' | 'adjustment';

export default function MyEarningFilterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [txType, setTxType] = useState<TxType>('all');
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');

  const txTypes: { key: TxType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'earning', label: 'Earning' },
    { key: 'withdrawal', label: 'Withdrawal' },
    { key: 'cash_collected', label: 'Cash Collected' },
    { key: 'adjustment', label: 'Adjustment' },
  ];

  const ranges: { key: typeof range; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'custom', label: 'Custom' },
  ];

  const handleApply = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('my_earning_filter')} onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Transaction Type</Text>
        <View style={styles.chipsRow}>
          {txTypes.map((opt) => {
            const active = opt.key === txType;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setTxType(opt.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceVariant,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Date Range</Text>
        <View style={styles.chipsRow}>
          {ranges.map((opt) => {
            const active = opt.key === range;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setRange(opt.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceVariant,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {range === 'custom' ? (
          <View style={{ marginTop: Dimensions.paddingSizeSmall }}>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Custom date range picker will appear here in production.
            </Text>
          </View>
        ) : null}

        <View style={{ height: Dimensions.paddingSizeLarge }} />
        <CustomButton buttonText={t('apply')} onPress={handleApply} />
      </ScrollView>
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Dimensions.paddingSizeSmall,
  },
  chip: {
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeExtraSmall,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  hint: {
    ...Typography.body,
    fontStyle: 'italic',
  },
});
