/**
 * Splash screen — mirrors lib/features/splash/screens/splash_screen.dart.
 *
 * V4.0 flow:
 *  1. Show splash for at least 1.5s.
 *  2. Wait for ConfigContext to finish loading the ConfigModel.
 *  3. Route based on config:
 *     - Maintenance mode → /update?isUpdate=false
 *     - Forced update required → /update?isUpdate=true
 *     - User logged in (or demo mode) → /(tabs)/home
 *     - Otherwise → /sign-in
 */

import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useAuth } from '@/context/AuthContext';
import { useConfig } from '@/context/ConfigContext';
import { Images } from '@/constants/images';
import { COLORS } from '@/constants/colors';
import { isSupabaseConfigured } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function SplashScreenPage() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const { config, loading: configLoading } = useConfig();
  const [minSplashShown, setMinSplashShown] = useState(false);

  useEffect(() => {
    (async () => {
      await new Promise((r) => setTimeout(r, 1500));
      setMinSplashShown(true);
      await SplashScreen.hideAsync().catch(() => {});
    })();
  }, []);

  useEffect(() => {
    if (!minSplashShown || configLoading) return;

    // V4.0: maintenance mode + forced-update checks
    if (config?.maintenance_mode) {
      const platform = 'deliveryman_app'; // matches V4.0 maintenance_system_setup list
      const list = config.maintenance_mode_data?.maintenance_system_setup ?? [];
      if (list.includes(platform)) {
        router.replace('/update?isUpdate=false');
        return;
      }
    }
    const minVersion =
      config?.app_minimum_version_android != null || config?.app_minimum_version_ios != null
        ? Math.min(
            config?.app_minimum_version_android ?? Number.MAX_SAFE_INTEGER,
            config?.app_minimum_version_ios ?? Number.MAX_SAFE_INTEGER
          )
        : null;
    if (minVersion != null && minVersion > 4.0) {
      router.replace('/update?isUpdate=true');
      return;
    }

    // Routing logic: if logged in (or in demo mode), go to dashboard; otherwise sign-in
    const isLoggedIn = !!session || !!profile || !isSupabaseConfigured;
    if (isLoggedIn) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/sign-in');
    }
  }, [minSplashShown, configLoading, config, session, profile, router]);

  return (
    <View style={styles.container}>
      <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 36,
  },
});
