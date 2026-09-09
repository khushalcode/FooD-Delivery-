/**
 * Forgot Password screen — mirrors lib/features/forgot_password/screens/forget_pass_screen.dart.
 * Sends OTP to entered phone number.
 */

import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
import { CustomButton } from '@/components/CustomButton';
import { CustomTextField } from '@/components/CustomTextField';
import { CustomAppBar } from '@/components/CustomAppBar';
import { isPhoneValid } from '@/utils/validators';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resendOtp } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+1');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) return snackbar.error(t('enter_phone_number'));
    const fullPhone = dialCode + trimmedPhone;
    const phoneValid = await isPhoneValid(fullPhone);
    if (!phoneValid.isValid) return snackbar.error(t('invalid_phone_number'));

    setIsLoading(true);
    const result = await resendOtp(phoneValid.phone);
    setIsLoading(false);

    if (result.isSuccess) {
      snackbar.success(result.message);
      router.push({
        pathname: '/verification',
        params: { number: phoneValid.phone, mode: 'forgot' },
      });
    } else {
      snackbar.error(result.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('forgot_password')} onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Image source={Images.forgot} style={styles.heroImage} resizeMode="contain" />
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t('forgot_password')}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Enter your phone number and we will send you a verification code to reset your
              password.
            </Text>
          </View>

          <CustomTextField
            labelText={t('phone_number')}
            hintText="xxx-xxxx-xxxx"
            value={phone}
            onChangeText={setPhone}
            isPhone
            countryDialCode={dialCode}
            onCountryChanged={() => {
              const countries = ['+1', '+91', '+44', '+971'];
              const idx = countries.indexOf(dialCode);
              setDialCode(countries[(idx + 1) % countries.length]);
            }}
            leftIcon="call-outline"
          />

          <View style={{ height: Dimensions.paddingSizeDefault }} />
          <CustomButton
            buttonText={t('submit')}
            isLoading={isLoading}
            onPress={handleSubmit}
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
  hero: {
    alignItems: 'center',
    marginVertical: Dimensions.paddingSizeLarge,
  },
  heroImage: {
    width: 140,
    height: 140,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  title: {
    ...Typography.h2,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Dimensions.paddingSizeDefault,
  },
});
