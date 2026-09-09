/**
 * WithdrawBottomSheet — mirrors lib/features/my_account/widgets/withdrawal_bottomsheet.dart.
 *
 * Bottom sheet with:
 *  - Method dropdown (from saved withdraw methods)
 *  - MethodFields display (per-method fields like bank account / routing)
 *  - Amount text field with decimal regex formatter
 *  - Suggested amount chips (100/200/300/400/500)
 *  - Remark text field
 *  - Validation (method != null, amount > 0, amount <= withdrawable balance)
 *  - createWithdrawRequest call
 *  - SuccessDialog shown after success
 *
 * This component is rendered as a modal from MyAccountScreen.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTranslation } from '@/context/LocalizationContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { formatPrice } from '@/utils/price';
import { createWithdrawRequest } from '@/services/v40_additions';
import { Images } from '@/constants/images';
import type { WithdrawMethod } from '@/types';

interface WithdrawBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  vendorId: string;
  withdrawableBalance: number;
  methods: WithdrawMethod[];
  currencySymbol?: string;
  digitAfterDecimalPoint?: number;
}

const SUGGESTED_AMOUNTS = [100, 200, 300, 400, 500];

export function WithdrawBottomSheet({
  visible,
  onClose,
  vendorId,
  withdrawableBalance,
  methods,
  currencySymbol = '$',
  digitAfterDecimalPoint = 2,
}: WithdrawBottomSheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const snackbar = useSnackbar();

  const [selectedMethod, setSelectedMethod] = useState<WithdrawMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset state when sheet opens
  useEffect(() => {
    if (visible) {
      setSelectedMethod(methods.find((m) => m.is_default) ?? methods[0] ?? null);
      setAmount('');
      setRemark('');
      setShowSuccess(false);
    }
  }, [visible, methods]);

  const numericAmount = useMemo(() => {
    const cleaned = (amount || '').replace(/[^0-9.]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }, [amount]);

  const canSubmit =
    !!selectedMethod && numericAmount > 0 && numericAmount <= withdrawableBalance && !submitting;

  const handleSubmit = async () => {
    if (!selectedMethod) {
      snackbar.error(t('please_select_a_method'));
      return;
    }
    if (numericAmount <= 0) {
      snackbar.error(t('please_enter_a_valid_amount'));
      return;
    }
    if (numericAmount > withdrawableBalance) {
      snackbar.error(t('amount_exceeds_balance'));
      return;
    }
    setSubmitting(true);
    try {
      await createWithdrawRequest(
        vendorId,
        numericAmount,
        selectedMethod.type,
        selectedMethod.fields,
        remark.trim() || undefined
      );
      setShowSuccess(true);
    } catch (e: any) {
      snackbar.error(e?.message || 'Withdraw request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          {showSuccess ? (
            <View style={styles.successWrap}>
              <Image
                source={Images.successIcon}
                style={styles.successIcon}
                resizeMode="contain"
              />
              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
                {t('withdraw_request_submitted')}
              </Text>
              <Text style={[styles.successMsg, { color: colors.textSecondary }]}>
                {t('your_withdraw_request_has_been_submitted')}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.okBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.okBtnText}>{t('okay')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.headerRow}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  {t('withdraw_amount')}
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={[styles.closeBtn, { color: colors.primary }]}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('available_balance')}:{' '}
                <Text style={{ color: colors.primary, fontFamily: 'Roboto-Bold' }}>
                  {formatPrice(withdrawableBalance, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
                </Text>
              </Text>

              {/* Method selector */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('select_method')}
              </Text>
              <View style={styles.methodRow}>
                {methods.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setSelectedMethod(m)}
                    style={[
                      styles.methodChip,
                      {
                        borderColor: selectedMethod?.id === m.id ? colors.primary : colors.border,
                        backgroundColor:
                          selectedMethod?.id === m.id ? colors.primary + '15' : colors.card,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.methodChipText,
                        {
                          color:
                            selectedMethod?.id === m.id ? colors.primary : colors.textPrimary,
                        },
                      ]}
                    >
                      {m.type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Method fields */}
              {selectedMethod && Object.keys(selectedMethod.fields).length > 0 && (
                <View style={[styles.fieldsBox, { backgroundColor: colors.surfaceVariant }]}>
                  {Object.entries(selectedMethod.fields).map(([k, v]) => (
                    <View key={k} style={styles.fieldRow}>
                      <Text style={[styles.fieldKey, { color: colors.textSecondary }]}>{k}</Text>
                      <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{v}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Amount */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('amount')}
              </Text>
              <TextInput
                value={amount}
                onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
                placeholder={formatPrice(0, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
                placeholderTextColor={colors.hint}
                keyboardType="decimal-pad"
                style={[styles.input, { backgroundColor: colors.inputFill, color: colors.textPrimary }]}
              />

              {/* Suggested amounts */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {SUGGESTED_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setAmount(String(amt))}
                    style={[styles.amountChip, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.amountChipText, { color: colors.textPrimary }]}>
                      {formatPrice(amt, { symbol: currencySymbol, digits: digitAfterDecimalPoint })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Remark */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('remark')} ({t('optional')})
              </Text>
              <TextInput
                value={remark}
                onChangeText={setRemark}
                placeholder={t('type_a_message')}
                placeholderTextColor={colors.hint}
                multiline
                style={[styles.input, styles.remark, { backgroundColor: colors.inputFill, color: colors.textPrimary }]}
              />

              <TouchableOpacity
                disabled={!canSubmit}
                onPress={handleSubmit}
                style={[
                  styles.submitBtn,
                  { backgroundColor: canSubmit ? colors.primary : colors.disabled },
                ]}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? t('please_wait') : t('submit')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Tiny inline import to avoid pulling Image into the top-level React import above
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  content: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontFamily: 'Roboto-Bold' },
  closeBtn: { fontSize: 14, fontFamily: 'Roboto-Medium' },
  label: { fontSize: 13, fontFamily: 'Roboto-Medium', marginTop: 12, marginBottom: 6 },
  methodRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  methodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  methodChipText: { fontSize: 13, fontFamily: 'Roboto-Medium' },
  fieldsBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  fieldKey: { fontSize: 12, fontFamily: 'Roboto-Regular' },
  fieldValue: { fontSize: 12, fontFamily: 'Roboto-Medium' },
  input: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  chipsRow: { flexDirection: 'row', marginTop: 8 },
  amountChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 16,
  },
  amountChipText: { fontSize: 12, fontFamily: 'Roboto-Medium' },
  remark: { minHeight: 60, textAlignVertical: 'top' },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  successWrap: { alignItems: 'center', padding: 24 },
  successIcon: { width: 80, height: 80, marginBottom: 16 },
  successTitle: { fontSize: 18, fontFamily: 'Roboto-Bold', marginBottom: 8 },
  successMsg: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  okBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  okBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Roboto-Bold' },
});

export default WithdrawBottomSheet;
