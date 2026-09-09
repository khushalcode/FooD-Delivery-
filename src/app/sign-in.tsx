/**
 * Sign In screen — mirrors lib/features/auth/screens/sign_in_screen.dart.
 * Phone + password login with remember-me and "join as vendor" CTA.
 */

import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
import { CustomButton } from '@/components/CustomButton';
import { CustomTextField } from '@/components/CustomTextField';
import { isPasswordValid, isPhoneValid } from '@/utils/validators';

export default function SignInScreen() {
  const router = useRouter();
  const { login, isLoading, isActiveRememberMe, toggleRememberMe, saveUserNumberAndPassword, clearUserNumberAndPassword, getUserNumber, getUserPassword, getUserCountryDialCode, getUserCountryCode } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [dialCode, setDialCode] = useState('+1');
  const [countryCode, setCountryCode] = useState('US');

  useEffect(() => {
    (async () => {
      const savedNumber = await getUserNumber();
      const savedPassword = await getUserPassword();
      const savedDial = await getUserCountryDialCode();
      const savedCountry = await getUserCountryCode();
      if (savedNumber) setPhone(savedNumber);
      if (savedPassword) setPassword(savedPassword);
      if (savedDial) setDialCode(savedDial);
      if (savedCountry) setCountryCode(savedCountry);
    })();
  }, []);

  const handleLogin = async () => {
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();
    const fullPhone = dialCode + trimmedPhone;

    const phoneValid = await isPhoneValid(fullPhone);

    if (!trimmedPhone) {
      snackbar.error(t('enter_phone_number'));
      return;
    }
    if (!phoneValid.isValid) {
      snackbar.error(t('invalid_phone_number'));
      return;
    }
    if (!trimmedPassword) {
      snackbar.error(t('enter_password'));
      return;
    }
    if (!isPasswordValid(trimmedPassword)) {
      snackbar.error(t('password_should_be'));
      return;
    }

    const result = await login(phoneValid.phone, trimmedPassword);

    if (result.isSuccess) {
      if (isActiveRememberMe) {
        await saveUserNumberAndPassword(trimmedPhone, trimmedPassword, dialCode, countryCode);
      } else {
        await clearUserNumberAndPassword();
      }
      snackbar.success(result.message);
      router.replace('/(tabs)/home');
    } else {
      snackbar.error(result.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('login')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('welcome_back')}
          </Text>

          <View style={styles.form}>
            <CustomTextField
              labelText={t('phone_number')}
              hintText="xxx-xxxx-xxxx"
              value={phone}
              onChangeText={setPhone}
              isPhone
              countryDialCode={dialCode}
              onCountryChanged={() => {
                // Simple cycle through a few countries
                const countries = [
                  { dial: '+1', code: 'US' },
                  { dial: '+91', code: 'IN' },
                  { dial: '+44', code: 'GB' },
                  { dial: '+971', code: 'AE' },
                ];
                const idx = countries.findIndex((c) => c.dial === dialCode);
                const next = countries[(idx + 1) % countries.length];
                setDialCode(next.dial);
                setCountryCode(next.code);
              }}
              leftIcon="call-outline"
            />

            <CustomTextField
              labelText={t('password')}
              hintText="********"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
            />

            <View style={styles.row}>
              <Text
                style={[styles.remember, { color: colors.textPrimary }]}
                onPress={toggleRememberMe}
              >
                <Ionicons
                  name={isActiveRememberMe ? 'checkbox' : 'square-outline'}
                  size={18}
                  color={isActiveRememberMe ? colors.primary : colors.disabled}
                />
                {'  '}
                {t('remember_me')}
              </Text>

              <Text
                style={[styles.forgot, { color: colors.primary }]}
                onPress={() => router.push('/forgot-password')}
              >
                {t('forgot_password')}?
              </Text>
            </View>

            <View style={{ height: Dimensions.paddingSizeDefault }} />

            <CustomButton
              buttonText={t('log_in')}
              isLoading={isLoading}
              onPress={handleLogin}
            />

            <View style={styles.orRow}>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.disabled }]}>{t('or')}</Text>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            </View>

            <Text style={[styles.joinText, { color: colors.disabled }]}>
              {t('join_as_a')}{' '}
              <Text
                style={[styles.joinHighlight, { color: colors.primary }]}
                onPress={() => router.push('/register')}
              >
                {t('delivery_man')}
              </Text>
            </Text>
          </View>
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
  logoWrap: {
    alignItems: 'center',
    marginTop: Dimensions.paddingSizeExtraLarge,
    marginBottom: Dimensions.paddingSizeExtraLarge,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 28,
  },
  title: {
    ...Typography.h1,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Dimensions.paddingSizeExtraSmall,
  },
  form: {
    marginTop: Dimensions.paddingSizeExtraLarge,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Dimensions.paddingSizeSmall,
  },
  remember: {
    ...Typography.body,
  },
  forgot: {
    ...Typography.body,
    fontWeight: '600',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Dimensions.paddingSizeDefault,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    ...Typography.body,
    marginHorizontal: Dimensions.paddingSizeDefault,
  },
  joinText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Dimensions.paddingSizeExtraSmall,
  },
  joinHighlight: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
