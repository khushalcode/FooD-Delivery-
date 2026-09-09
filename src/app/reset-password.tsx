/**
 * Reset Password screen — mirrors lib/features/forgot_password/screens/new_pass_screen.dart.
 * Sets a new password after OTP verification.
 */

import { useState } from 'react';
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
import { Dimensions } from '@/constants/dimensions';
import { CustomButton } from '@/components/CustomButton';
import { CustomTextField } from '@/components/CustomTextField';
import { CustomAppBar } from '@/components/CustomAppBar';
import { isPasswordValid } from '@/utils/validators';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; token?: string }>();
  const { resetPassword } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isPasswordValid(password)) return snackbar.error(t('password_should_be'));
    if (password !== confirmPassword) return snackbar.error('Passwords do not match');
    setIsLoading(true);
    const result = await resetPassword(params.phone || '', params.token || '', password);
    setIsLoading(false);
    if (result.isSuccess) {
      snackbar.success(result.message);
      router.replace('/sign-in');
    } else {
      snackbar.error(result.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('reset_password')} onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <CustomTextField
            labelText={t('new_password')}
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

          <View style={{ height: Dimensions.paddingSizeDefault }} />
          <CustomButton
            buttonText={t('reset_password')}
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
});
