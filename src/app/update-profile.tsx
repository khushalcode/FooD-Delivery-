/**
 * Update Profile screen — mirrors lib/features/profile/screens/update_profile_screen.dart.
 * Edit store info, owner info, contact, address. Optional logo upload.
 */

import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
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
import { CustomTextField } from '@/components/CustomTextField';
import { isEmailValid } from '@/utils/validators';

export default function UpdateProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [storeName, setStoreName] = useState(profile?.store_name || '');
  const [ownerName, setOwnerName] = useState(profile?.owner_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!storeName.trim()) return snackbar.error('Store name is required');
    if (!ownerName.trim()) return snackbar.error('Owner name is required');
    if (!isEmailValid(email)) return snackbar.error('Valid email is required');

    setIsLoading(true);
    const result = await updateProfile({
      store_name: storeName.trim(),
      owner_name: ownerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    setIsLoading(false);

    if (result.isSuccess) {
      snackbar.success(result.message);
      router.back();
    } else {
      snackbar.error(result.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={t('update_profile')} onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar upload */}
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
              {profile?.logo_url ? (
                <Image source={{ uri: profile.logo_url }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarInitial}>
                  {storeName.charAt(0).toUpperCase() || 'V'}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.cameraBtn, { backgroundColor: colors.primary, borderColor: colors.card }]}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('store_information')}
            </Text>
            <CustomTextField
              labelText={t('store_name')}
              hintText="Store name"
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
              hintText="Owner name"
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
              hintText="Phone number"
              value={phone}
              onChangeText={setPhone}
              leftIcon="call-outline"
              keyboardType="phone-pad"
            />
          </View>

          <View style={{ height: Dimensions.paddingSizeDefault }} />
          <CustomButton buttonText={t('save_changes')} isLoading={isLoading} onPress={handleSave} />
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
  avatarWrap: {
    alignItems: 'center',
    marginVertical: Dimensions.paddingSizeDefault,
    position: 'relative',
  },
  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: '38%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  section: {
    marginTop: Dimensions.paddingSizeDefault,
  },
  sectionTitle: {
    ...Typography.title,
    marginBottom: Dimensions.paddingSizeSmall,
  },
});
