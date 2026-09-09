/**
 * Change Password screen — mirrors reset_password flow for password-change mode.
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
import { CustomAppBar } from '@/components/CustomAppBar';
import { CustomButton } from '@/components/CustomButton';
import { CustomTextField } from '@/components/CustomTextField';
import { isPasswordValid } from '@/utils/validators';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!current.trim()) return snackbar.error('Enter current password');
    if (!isPasswordValid(newPass)) return snackbar.error(t('password_should_be'));
    if (newPass !== confirm) return snackbar.error('Passwords do not match');
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    snackbar.success(t('password_changed_successfully'));
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('change_password')} onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Image source={Images.shieldSecurity} style={styles.heroImage} resizeMode="contain" />
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              {t('change_password')}
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Update your password to keep your account secure
            </Text>
          </View>

          <CustomTextField
            labelText={t('current_password')}
            hintText="********"
            value={current}
            onChangeText={setCurrent}
            isPassword
            leftIcon="lock-closed-outline"
          />
          <CustomTextField
            labelText={t('new_password')}
            hintText="********"
            value={newPass}
            onChangeText={setNewPass}
            isPassword
            leftIcon="lock-closed-outline"
          />
          <CustomTextField
            labelText={t('confirm_new_password')}
            hintText="********"
            value={confirm}
            onChangeText={setConfirm}
            isPassword
            leftIcon="lock-closed-outline"
          />

          <View style={{ height: Dimensions.paddingSizeDefault }} />
          <CustomButton buttonText={t('save_changes')} isLoading={saving} onPress={handleSave} />
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
    marginVertical: Dimensions.paddingSizeDefault,
  },
  heroImage: {
    width: 100,
    height: 100,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  heroTitle: {
    ...Typography.h2,
  },
  heroSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Dimensions.paddingSizeDefault,
  },
});
