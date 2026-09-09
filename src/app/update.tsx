/**
 * UpdateScreen — mirrors lib/features/update/screens/update_screen.dart.
 *
 * Two modes:
 *  - isUpdate=true  →  forced-update UI; shows "Update Now" button opening the
 *    appropriate app store URL (config.appUrlAndroid / appUrlIos).
 *  - isUpdate=false →  maintenance-mode UI; shows the maintenance message from
 *    ConfigModel plus tappable contact phone/email links.
 *
 * A DottedDivider separates sections, matching the Flutter source.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
    TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTranslation } from '@/context/LocalizationContext';
import { useConfig } from '@/context/ConfigContext';
import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { Images } from '@/constants/images';
import { DottedDivider } from '@/components/DottedDivider';
import { openAppStoreUpdate } from '@/services/v40_additions';

export default function UpdateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ isUpdate?: string }>();
  const isUpdate = params.isUpdate === 'true' || params.isUpdate === '1';
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { config } = useConfig();

  const phone = config?.phone ?? null;
  const email = config?.email ?? null;
  const maintenanceMessage =
    config?.maintenance_mode_data?.maintenance_message ??
    'The app is currently under maintenance. Please try again later.';

  const openPhone = useCallback(() => {
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => {});
  }, [phone]);

  const openEmail = useCallback(() => {
    if (email) Linking.openURL(`mailto:${email}`).catch(() => {});
  }, [email]);

  const onUpdate = useCallback(async () => {
    if (config) {
      await openAppStoreUpdate(config);
    }
  }, [config]);

  return (
    <View style={[styles.container, { backgroundColor: colors.scaffoldBg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.imageWrap}>
          <Image
            source={isUpdate ? Images.update : Images.maintenance}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {isUpdate ? t('update_available') : t('maintenance')}
        </Text>

        {!isUpdate && (
          <>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {maintenanceMessage}
            </Text>
            <View style={styles.dividerWrap}>
              <DottedDivider />
            </View>
            <View style={styles.contactRow}>
              {phone ? (
                <TouchableOpacity onPress={openPhone} style={styles.contactBtn}>
                  <Text style={[styles.contactText, { color: colors.primary }]}>{phone}</Text>
                </TouchableOpacity>
              ) : null}
              {email ? (
                <TouchableOpacity onPress={openEmail} style={styles.contactBtn}>
                  <Text style={[styles.contactText, { color: colors.primary }]}>{email}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        )}

        {isUpdate && (
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {t('update_now_to_continue_using_the_app')}
          </Text>
        )}

        {isUpdate ? (
          <TouchableOpacity
            onPress={onUpdate}
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.ctaText}>{t('update_now')}</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  imageWrap: { marginBottom: 24 },
  image: { width: 200, height: 200 },
  title: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  dividerWrap: { width: '80%', marginVertical: 16 },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  contactBtn: { padding: 6 },
  contactText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    textDecorationLine: 'underline',
  },
  ctaBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
});
