/**
 * Add Vehicle screen — mirrors lib/features/ride_module/add_vehicle/screens/add_vehicle_screen.dart.
 * Form to add or edit a vehicle.
 */

import { useCallback, useEffect, useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import { fetchVehicleBrands, fetchVehicleCategories, addVehicle, fetchVehicles, updateVehicle } from '@/services/data';
import type { VehicleBrand, VehicleCategory } from '@/types';

export default function AddVehicleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!params.id;
  const { profile } = useAuth();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [color, setColor] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [b, c] = await Promise.all([fetchVehicleBrands(), fetchVehicleCategories()]);
        setBrands(b);
        setCategories(c);
      } catch (e: any) {
        snackbar.error(e?.message || 'Failed to load options');
      }
    })();
  }, [snackbar]);

  useEffect(() => {
    if (isEdit && profile) {
      (async () => {
        const vs = await fetchVehicles(profile.id);
        const v = vs.find((x) => x.id === params.id);
        if (v) {
          setSelectedBrand(v.brand);
          setSelectedCategory(v.category);
          setModel(v.model);
          setLicensePlate(v.license_plate);
          setYear(String(v.year));
          setColor(v.color);
        }
      })();
    }
  }, [isEdit, params.id, profile]);

  const handleSave = async () => {
    if (!profile) return;
    if (!selectedBrand) return snackbar.error('Select vehicle brand');
    if (!model.trim()) return snackbar.error('Enter vehicle model');
    if (!selectedCategory) return snackbar.error('Select vehicle category');
    if (!licensePlate.trim()) return snackbar.error('Enter license plate');
    if (!year.trim()) return snackbar.error('Enter year');
    if (!color.trim()) return snackbar.error('Enter vehicle color');

    setSaving(true);
    try {
      const payload = {
        rider_id: profile.id,
        brand: selectedBrand,
        model: model.trim(),
        category: selectedCategory,
        license_plate: licensePlate.trim(),
        year: parseInt(year, 10),
        color: color.trim(),
        image_url: null,
        vehicle_request_status: 'pending' as const,
        is_active: true,
      };
      if (isEdit && params.id) {
        await updateVehicle(params.id, payload);
        snackbar.success('Vehicle updated');
      } else {
        await addVehicle(payload);
        snackbar.success('Vehicle added — pending approval');
      }
      router.back();
    } catch (e: any) {
      snackbar.error(e?.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.scaffoldBg }]} edges={['top']}>
      <CustomAppBar title={isEdit ? t('edit_vehicle') : t('add_vehicle')} onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Image upload placeholder */}
          <View style={styles.imageWrap}>
            <View style={[styles.imageBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <Ionicons name="camera" size={36} color={colors.disabled} />
              <Text style={[styles.imageHint, { color: colors.textSecondary }]}>
                {t('vehicle_image')}
              </Text>
            </View>
          </View>

          {/* Brand selector */}
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t('vehicle_brand')}</Text>
          <View style={styles.chipsRow}>
            {brands.map((b) => {
              const active = b.name === selectedBrand;
              return (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => setSelectedBrand(b.name)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceVariant,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <CustomTextField
            labelText={t('vehicle_model')}
            hintText="e.g. Camry"
            value={model}
            onChangeText={setModel}
            leftIcon="car-outline"
          />

          {/* Category selector */}
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t('vehicle_category')}</Text>
          <View style={styles.chipsRow}>
            {categories.map((c) => {
              const active = c.type === selectedCategory;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedCategory(c.type)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceVariant,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <CustomTextField
            labelText={t('license_plate')}
            hintText="ABC-1234"
            value={licensePlate}
            onChangeText={setLicensePlate}
            leftIcon="document-text-outline"
            autoCapitalize="characters"
          />
          <CustomTextField
            labelText={t('vehicle_year')}
            hintText="2022"
            value={year}
            onChangeText={setYear}
            leftIcon="calendar-outline"
            keyboardType="numeric"
          />
          <CustomTextField
            labelText={t('vehicle_color')}
            hintText="White"
            value={color}
            onChangeText={setColor}
            leftIcon="color-palette-outline"
          />

          <View style={{ height: Dimensions.paddingSizeDefault }} />
          <CustomButton
            buttonText={isEdit ? t('save_changes') : t('add_vehicle')}
            isLoading={saving}
            onPress={handleSave}
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
  imageWrap: {
    alignItems: 'center',
    marginBottom: Dimensions.paddingSizeDefault,
  },
  imageBox: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageHint: {
    ...Typography.caption,
    marginTop: 8,
  },
  label: {
    ...Typography.label,
    marginBottom: Dimensions.paddingSizeExtraSmall,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Dimensions.paddingSizeSmall,
    marginBottom: Dimensions.paddingSizeDefault,
  },
  chip: {
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeExtraSmall,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
});
