/**
 * Language screen — mirrors lib/features/language/screens/language_screen.dart.
 * Allows the user to pick the app language.
 */

import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation, SUPPORTED_LANGUAGES, type LanguageCode } from '@/context/LocalizationContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { Images } from '@/constants/images';
import { CustomAppBar } from '@/components/CustomAppBar';
import { AppConstants } from '@/constants/app_constants';

const LANGUAGES: { code: LanguageCode; name: string; country: string; image: any }[] = [
  { code: 'en', name: 'English', country: 'US', image: Images.english },
  { code: 'ar', name: 'Arabic', country: 'SA', image: Images.arabic },
  { code: 'es', name: 'Spanish', country: 'ES', image: Images.spanish },
  { code: 'bn', name: 'Bengali', country: 'BN', image: Images.bangla },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { lang, setLang } = useTranslation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={AppConstants.appName + ' - ' + 'Language'} onBackPress={() => router.back()} />
      <View style={styles.container}>
        <Image source={Images.languageBg} style={styles.heroImage} resizeMode="contain" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Select Your Language</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose your preferred language for the app interface.
        </Text>

        <View style={styles.list}>
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <TouchableOpacity
                key={l.code}
                onPress={() => setLang(l.code)}
                style={[
                  styles.langCard,
                  {
                    backgroundColor: active ? colors.primary + '15' : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Image source={l.image} style={styles.flag} resizeMode="contain" />
                <Text style={[styles.langName, { color: colors.textPrimary }]}>{l.name}</Text>
                <Ionicons
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={active ? colors.primary : colors.disabled}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    padding: Dimensions.paddingSizeLarge,
    flexGrow: 1,
  },
  heroImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: Dimensions.paddingSizeDefault,
    opacity: 0.6,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Dimensions.paddingSizeExtraSmall,
    marginBottom: Dimensions.paddingSizeLarge,
  },
  list: {
    gap: Dimensions.paddingSizeSmall,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Dimensions.paddingSizeDefault,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    gap: Dimensions.paddingSizeDefault,
  },
  flag: {
    width: 32,
    height: 22,
    borderRadius: 4,
  },
  langName: {
    flex: 1,
    ...Typography.body,
    fontWeight: '600',
  },
});
