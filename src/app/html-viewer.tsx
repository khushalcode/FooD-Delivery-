/**
 * HTML Viewer screen — mirrors lib/features/html/screens/html_viewer_screen.dart.
 * Renders static content for terms & conditions or privacy policy.
 * Used by both /terms and /privacy routes.
 */

import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { CustomAppBar } from '@/components/CustomAppBar';

const TERMS_CONTENT = `
Welcome to Delivery. By accessing or using our services, you agree to be bound by these Terms & Conditions. Please read them carefully.

1. ACCEPTANCE OF TERMS
By registering an account and using the Delivery platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to any part of these terms, you may not access the service.

2. VENDOR RESPONSIBILITIES
As a vendor, you are responsible for maintaining the accuracy of your store information, providing quality products, fulfilling orders in a timely manner, and complying with all applicable laws and regulations in your jurisdiction. You must ensure that all product descriptions, images, and prices are accurate and up to date.

3. ORDER FULFILLMENT
Vendors are expected to accept or decline new orders promptly. Once accepted, the vendor is responsible for preparing the order within the agreed timeframe. Failure to fulfill accepted orders may result in penalties, including suspension of the account.

4. PAYMENTS AND EARNINGS
Earnings from completed orders will be credited to your vendor account balance. Withdrawals can be requested through approved payment methods and will be processed within the standard turnaround time. The platform may charge a commission fee on each transaction as disclosed at the time of onboarding.

5. ACCOUNT TERMINATION
We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or harm other users. You may also terminate your account at any time by contacting support.

6. CHANGES TO TERMS
We may update these Terms from time to time. Continued use of the app after changes constitutes acceptance of the updated Terms.
`;

const PRIVACY_CONTENT = `
This Privacy Policy describes how Delivery collects, uses, and protects your personal information.

1. INFORMATION WE COLLECT
We collect information you provide directly, such as your store name, owner name, contact details, and address. We also collect usage data including order history, device information, and approximate location (with your consent) to provide better services.

2. HOW WE USE YOUR INFORMATION
Your information is used to operate the platform, process orders, facilitate payments, communicate with you about your account and orders, and improve our services. We may also use aggregated, anonymized data for analytics and research purposes.

3. DATA SECURITY
We implement industry-standard security measures including encryption in transit (TLS) and at rest. Access to your personal data is restricted to authorized personnel who need it to operate the service. Supabase is used for authentication and data storage, which complies with GDPR and other major privacy regulations.

4. DATA SHARING
We do not sell your personal information. We may share data with trusted third-party service providers (such as payment processors and delivery partners) strictly for fulfilling orders. We may also disclose information when required by law.

5. YOUR RIGHTS
You have the right to access, correct, or delete your personal data. To exercise these rights, contact our support team. We will respond to your request within a reasonable timeframe.

6. DATA RETENTION
We retain your data for as long as your account is active or as needed to provide services. After account termination, we may retain certain data for legal or accounting purposes for a defined period.

7. CONTACT US
For any privacy-related questions or requests, please reach out via the Help & Support section in the app.
`;

export default function HtmlViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: 'terms' | 'privacy' }>();
  const isPrivacy = params.type === 'privacy';
  const { colors } = useTheme();

  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions';
  const content = isPrivacy ? PRIVACY_CONTENT : TERMS_CONTENT;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={title} onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.bodyText, { color: colors.textPrimary }]}>{content.trim()}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    padding: Dimensions.paddingSizeLarge,
    flexGrow: 1,
  },
  bodyText: {
    ...Typography.body,
    lineHeight: 24,
  },
});
