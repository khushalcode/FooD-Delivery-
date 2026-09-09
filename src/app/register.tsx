/**
 * Vendor Registration screen — mirrors lib/features/auth/screens/dm_registration_screen.dart.
 * Multi-section form: store info, owner info, contact, address.
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
import { isEmailValid, isPasswordValid } from '@/utils/validators';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+1');
  const [countryCode, setCountryCode] = useState('US');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async () => {
    if (!storeName.trim()) return snackbar.error('Store name is required');
    if (!ownerName.trim()) return snackbar.error('Owner name is required');
    if (!isEmailValid(email)) return snackbar.error('Valid email is required');
    if (!phone.trim()) return snackbar.error('Phone number is required');
    if (!isPasswordValid(password)) return snackbar.error(t('password_should_be'));
    if (password !== confirmPassword) return snackbar.error('Passwords do not match');
    if (!address.trim()) return snackbar.error('Address is required');

    const result = await register({
      storeName: storeName.trim(),
      ownerName: ownerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dialCode,
      countryCode,
      password,
      address: address.trim(),
    });

    if (result.isSuccess) {
      snackbar.success(result.message);
      router.replace('/registration-success');
    } else {
      snackbar.error(result.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('store_registration')} onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroWrap}>
            <Image source={Images.userEdit} style={styles.heroImage} resizeMode="contain" />
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              {t('store_registration')}
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Fill in your store details to get started
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('store_information')}
            </Text>
            <CustomTextField
              labelText={t('store_name')}
              hintText="e.g. Pizza Palace"
              value={storeName}
              onChangeText={setStoreName}
              leftIcon="storefront-outline"
            />
            <CustomTextField
              labelText={t('address')}
              hintText="Store address"
              value={address}
              onChangeText={setAddress}
              leftIcon="location-outline"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('personal_information')}
            </Text>
            <CustomTextField
              labelText={t('owner_name')}
              hintText="Owner full name"
              value={ownerName}
              onChangeText={setOwnerName}
              leftIcon="person-outline"
            />
            <CustomTextField
              labelText={t('email')}
              hintText="owner@example.com"
              value={email}
              onChangeText={setEmail}
              leftIcon="mail-outline"
              keyboardType="email-address"
            />
            <CustomTextField
              labelText={t('phone_number')}
              hintText="xxx-xxxx-xxxx"
              value={phone}
              onChangeText={setPhone}
              isPhone
              countryDialCode={dialCode}
              onCountryChanged={() => {
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
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('password')}
            </Text>
            <CustomTextField
              labelText={t('password')}
              hintText="********"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
            />
            <CustomTextField
              labelText={t('confirm_password')}
              hintText="********"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              leftIcon="lock-closed-outline"
            />
          </View>

          <View style={{ height: Dimensions.paddingSizeDefault }} />
          <CustomButton
            buttonText={t('sign_up')}
            isLoading={isLoading}
            onPress={handleSubmit}
          />
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
  heroWrap: {
    alignItems: 'center',
    marginVertical: Dimensions.paddingSizeDefault,
  },
  heroImage: {
    width: 100,
    height: 100,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  heroTitle: {
    ...Typography.h2,
  },
  heroSubtitle: {
    ...Typography.body,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: Dimensions.paddingSizeLarge,
  },
  sectionTitle: {
    ...Typography.title,
    marginBottom: Dimensions.paddingSizeSmall,
  },
});
