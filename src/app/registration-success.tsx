/**
 * Registration Success screen — mirrors lib/features/auth/screens/dm_registration_success_screen.dart.
 * Shown after successful vendor registration.
 */

import { StyleSheet, Text, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { Images } from '@/constants/images';
import { CustomButton } from '@/components/CustomButton';

export default function RegistrationSuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.iconWrap, { backgroundColor: colors.success + '20' }]}>
          <Image source={Images.checked} style={styles.icon} resizeMode="contain" />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t('registration_success')}
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('registration_pending')}. {t('account_created_successfully')}. You can now sign in to
          your account.
        </Text>

        <View style={styles.actions}>
          <CustomButton
            buttonText={t('log_in')}
            onPress={() => router.replace('/sign-in')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Dimensions.paddingSizeLarge,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Dimensions.paddingSizeLarge,
  },
  icon: {
    width: 60,
    height: 60,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Dimensions.paddingSizeSmall,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Dimensions.paddingSizeExtraLarge,
  },
  actions: {
    width: '100%',
  },
});
