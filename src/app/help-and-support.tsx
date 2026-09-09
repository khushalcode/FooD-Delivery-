/**
 * Help & Support screen — mirrors lib/features/ride_module/help_and_support/screens/help_and_support_screen.dart.
 * FAQ list + contact options (chat with admin, call, email).
 */

import { Image, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from '@/context/LocalizationContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { Images } from '@/constants/images';
import { CustomAppBar } from '@/components/CustomAppBar';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How do I receive new orders?',
    a: 'Make sure your online status is enabled. New orders will be sent as push notifications and appear in the Order Request tab.',
  },
  {
    q: 'When do I get paid?',
    a: 'Earnings are credited to your wallet after each completed order. You can withdraw funds to your saved withdraw method at any time.',
  },
  {
    q: 'How do I update my bank details?',
    a: 'Go to Profile > Withdraw Method > Add/Edit Withdraw Method to update your payout information.',
  },
  {
    q: 'What should I do if a customer is unreachable?',
    a: 'Try calling them at least twice. If still unreachable, contact support via the chat option and they will assist you.',
  },
  {
    q: 'How can I track my earnings?',
    a: 'Visit Profile > My Earning to see daily, weekly, and monthly earnings breakdowns. You can also view the Earning Report for a detailed analysis.',
  },
];

export default function HelpAndSupportScreen() {
  const router = useRouter();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleCall = () => {
    Linking.openURL('tel:+18001234567').catch(() => snackbar.error('Unable to open dialer'));
  };
  const handleEmail = () => {
    Linking.openURL('mailto:support@vendor.app').catch(() => snackbar.error('Unable to open email'));
  };
  const handleChat = () => {
    router.push({ pathname: '/chat', params: { conversation_id: 'admin-support', customer_name: 'Support' } });
  };

  const contactOptions = [
    { label: 'Chat with us', icon: 'chatbubble-outline' as const, color: colors.primary, action: handleChat },
    { label: 'Call support', icon: 'call-outline' as const, color: colors.success, action: handleCall },
    { label: 'Email us', icon: 'mail-outline' as const, color: '#2196F3', action: handleEmail },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('help_and_support')} onBackPress={() => router.back()} />
      <View style={styles.container}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Image source={Images.support} style={styles.heroImage} resizeMode="contain" />
          <Text style={styles.heroTitle}>We're here to help</Text>
          <Text style={styles.heroSubtitle}>
            Reach out to us via chat, call, or email — we usually respond within an hour.
          </Text>
        </View>

        {/* Contact options */}
        <View style={styles.contactRow}>
          {contactOptions.map((c, i) => (
            <TouchableOpacity
              key={i}
              onPress={c.action}
              style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIcon, { backgroundColor: c.color + '15' }]}>
                <Ionicons name={c.icon} size={22} color={c.color} />
              </View>
              <Text style={[styles.contactLabel, { color: colors.textPrimary }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Frequently Asked Questions
        </Text>
        <View style={styles.faqList}>
          {FAQS.map((f, i) => (
            <View
              key={i}
              style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQ, { color: colors.textPrimary }]}>{f.q}</Text>
                <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.faqA, { color: colors.textSecondary }]}>{f.a}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    padding: Dimensions.paddingSizeDefault,
    flexGrow: 1,
  },
  hero: {
    borderRadius: Dimensions.radiusDefault,
    padding: Dimensions.paddingSizeLarge,
    alignItems: 'center',
    marginBottom: Dimensions.paddingSizeDefault,
  },
  heroImage: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
    marginBottom: Dimensions.paddingSizeSmall,
  },
  heroTitle: {
    ...Typography.h2,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 4,
  },
  contactRow: {
    flexDirection: 'row',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  contactCard: {
    flex: 1,
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    alignItems: 'center',
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Dimensions.paddingSizeSmall,
  },
  contactLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    ...Typography.title,
    marginTop: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  faqList: {
    gap: Dimensions.paddingSizeSmall,
  },
  faqCard: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: 6,
  },
  faqQ: {
    ...Typography.subtitle,
    fontWeight: '600',
    flex: 1,
  },
  faqA: {
    ...Typography.body,
    lineHeight: 22,
  },
});
