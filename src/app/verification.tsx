/**
 * Verification screen — mirrors lib/features/forgot_password/screens/verification_screen.dart.
 * 4-digit OTP entry, resend countdown, then routes to reset password.
 */

import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { CustomButton } from '@/components/CustomButton';
import { CustomAppBar } from '@/components/CustomAppBar';

const CODE_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function VerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ number?: string; mode?: string }>();
  const phone = params.number || '';
  const mode = params.mode || 'forgot';

  const { verifyOtp, resendOtp } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const handleCodeChange = (text: string, idx: number) => {
    const next = [...code];
    next[idx] = text.replace(/[^0-9]/g, '').slice(-1);
    setCode(next);
    if (text && idx < CODE_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKey = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length !== CODE_LENGTH) {
      return snackbar.error('Please enter the full code');
    }
    setIsLoading(true);
    const result = await verifyOtp(phone, otp);
    setIsLoading(false);
    if (result.isSuccess) {
      snackbar.success(result.message);
      if (mode === 'forgot') {
        router.replace({
          pathname: '/reset-password',
          params: { phone, token: otp },
        });
      } else {
        router.replace('/registration-success');
      }
    } else {
      snackbar.error(result.message);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    const result = await resendOtp(phone);
    if (result.isSuccess) {
      snackbar.success(result.message);
      setResendIn(RESEND_SECONDS);
    } else {
      snackbar.error(result.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('verification')} onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t('enter_verification_code')}
          </Text>
          <Text style={[styles.phone, { color: colors.primary }]}>{phone}</Text>

          <View style={styles.codeRow}>
            {Array.from({ length: CODE_LENGTH }).map((_, idx) => (
              <TextInput
                key={idx}
                ref={(r) => {
                  inputs.current[idx] = r;
                }}
                value={code[idx]}
                onChangeText={(t) => handleCodeChange(t, idx)}
                onKeyPress={(e) => handleKey(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.codeBox,
                  {
                    backgroundColor: colors.inputFill,
                    borderColor: code[idx] ? colors.primary : colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                autoFocus={idx === 0}
              />
            ))}
          </View>

          <View style={styles.resendRow}>
            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
              {t('resend_code_in')}
            </Text>
            <Text style={[styles.resendTimer, { color: resendIn > 0 ? colors.disabled : colors.primary }]}>
              {resendIn > 0 ? `00:${String(resendIn).padStart(2, '0')}` : t('resend')}
            </Text>
          </View>

          <View style={{ height: Dimensions.paddingSizeLarge }} />
          <CustomButton
            buttonText={t('verify')}
            isLoading={isLoading}
            onPress={handleVerify}
          />

          <View style={{ height: Dimensions.paddingSizeSmall }} />
          <CustomButton
            buttonText={t('resend')}
            variant="outline"
            disabled={resendIn > 0}
            onPress={handleResend}
          />
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
  title: {
    ...Typography.h3,
    textAlign: 'center',
    marginTop: Dimensions.paddingSizeExtraLarge,
  },
  phone: {
    ...Typography.subtitle,
    textAlign: 'center',
    marginTop: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeExtraLarge,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeLarge,
  },
  codeBox: {
    width: 60,
    height: 60,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  resendText: {
    ...Typography.body,
  },
  resendTimer: {
    ...Typography.subtitle,
    fontWeight: '700',
  },
});
