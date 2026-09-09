/**
 * Safety Policy screen — mirrors lib/features/ride_module/safety/screen/safety_policy_screen.dart.
 * Shows safety tips, precautions, emergency contacts, and "send safety alert" button.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { CustomAppBar } from '@/components/CustomAppBar';
import { CustomButton } from '@/components/CustomButton';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import {
  fetchPrecautions,
  fetchEmergencyContacts,
  fetchSafetyReasons,
  createSafetyAlert,
} from '@/services/data';
import type { Precaution, EmergencyContact, SafetyReason } from '@/types';

export default function SafetyPolicyScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [precautions, setPrecautions] = useState<Precaution[] | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [reasons, setReasons] = useState<SafetyReason[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');

  const load = useCallback(async () => {
    try {
      const [p, c, r] = await Promise.all([
        fetchPrecautions(),
        fetchEmergencyContacts(),
        fetchSafetyReasons(),
      ]);
      setPrecautions(p);
      setContacts(c);
      setReasons(r);
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to load safety info');
    }
  }, [snackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleSendAlert = async () => {
    if (!profile) return;
    if (!selectedReason) {
      snackbar.error('Please select a reason');
      return;
    }
    try {
      await createSafetyAlert({
        rider_id: profile.id,
        ride_id: null,
        reason: selectedReason,
        status: 'pending',
        other_contact: null,
      });
      snackbar.success('Safety alert sent — support team has been notified');
      setAlertModalVisible(false);
      setSelectedReason('');
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to send alert');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('safety')} onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Image source={Images.shieldTick} style={styles.heroImage} resizeMode="contain" />
          <Text style={styles.heroTitle}>{t('safety_first')}</Text>
          <Text style={styles.heroSubtitle}>
            Your safety is our priority. In an emergency, tap the button below to alert our support team instantly.
          </Text>
        </View>

        {/* Emergency alert button */}
        <CustomButton
          buttonText={t('send_safety_alert')}
          variant="danger"
          icon={<Ionicons name="warning-outline" size={20} color="#FFFFFF" />}
          onPress={() => setAlertModalVisible(true)}
        />

        {/* Precautions */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('precautions')}
        </Text>
        {precautions === null ? (
          <LoadingShimmer count={3} height={80} />
        ) : (
          <View style={styles.precautionsList}>
            {precautions.map((p, i) => (
              <View
                key={p.id}
                style={[styles.precautionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.precautionIcon, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.precautionTitle, { color: colors.textPrimary }]}>
                    {p.title}
                  </Text>
                  <Text style={[styles.precautionDesc, { color: colors.textSecondary }]}>
                    {p.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Emergency contacts */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('emergency_contacts')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {contacts.map((c, i) => (
            <View
              key={c.id}
              style={[
                styles.contactRow,
                i < contacts.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth } : {},
              ]}
            >
              <View style={[styles.contactIconWrap, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="call" size={18} color={colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactName, { color: colors.textPrimary }]}>{c.name}</Text>
                <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>{c.phone}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: Dimensions.paddingSizeExtraLarge }} />
      </ScrollView>

      {/* Safety alert modal */}
      <Modal
        transparent
        visible={alertModalVisible}
        animationType="slide"
        onRequestClose={() => setAlertModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlayBg }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="warning" size={48} color={colors.error} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t('send_safety_alert')}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Select the reason for your safety alert. Our support team will be notified immediately.
            </Text>

            <View style={styles.reasonsList}>
              {reasons.map((r) => {
                const active = r.reason === selectedReason;
                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setSelectedReason(r.reason)}
                    style={[
                      styles.reasonChip,
                      {
                        backgroundColor: active ? colors.error : colors.surfaceVariant,
                        borderColor: active ? colors.error : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.reasonText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                      {r.reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <CustomButton
                buttonText={t('cancel')}
                variant="outline"
                onPress={() => setAlertModalVisible(false)}
                style={{ flex: 1, marginRight: Dimensions.paddingSizeSmall }}
              />
              <CustomButton
                buttonText={t('send_safety_alert')}
                variant="danger"
                onPress={handleSendAlert}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
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
    width: 70,
    height: 70,
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
  sectionTitle: {
    ...Typography.title,
    marginTop: Dimensions.paddingSizeDefault,
    marginBottom: Dimensions.paddingSizeSmall,
  },
  precautionsList: {
    gap: Dimensions.paddingSizeSmall,
  },
  precautionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
    gap: Dimensions.paddingSizeSmall,
  },
  precautionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  precautionTitle: {
    ...Typography.subtitle,
    fontWeight: '600',
  },
  precautionDesc: {
    ...Typography.bodySmall,
    marginTop: 4,
    lineHeight: 20,
  },
  card: {
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    padding: Dimensions.paddingSizeDefault,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Dimensions.paddingSizeSmall,
    gap: Dimensions.paddingSizeSmall,
  },
  contactIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    ...Typography.body,
    fontWeight: '600',
  },
  contactPhone: {
    ...Typography.caption,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Dimensions.paddingSizeLarge,
  },
  modalContent: {
    width: '100%',
    borderRadius: Dimensions.radiusLarge,
    padding: Dimensions.paddingSizeLarge,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Dimensions.paddingSizeDefault,
  },
  modalTitle: {
    ...Typography.h3,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  reasonsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  reasonChip: {
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeExtraSmall,
    borderRadius: 16,
    borderWidth: 1,
  },
  reasonText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
  },
});
