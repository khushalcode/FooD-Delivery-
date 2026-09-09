/**
 * Root layout — top-level providers wrap the entire app.
 * Mirrors the MyApp widget in lib/main.dart.
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/constants/theme';
import { AuthProvider } from '@/context/AuthContext';
import { LocalizationProvider } from '@/context/LocalizationContext';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { ConfigProvider } from '@/context/ConfigContext';
import { FontFamily } from '@/constants/typography';

SplashScreen.preventAutoHideAsync().catch(() => {});

function InnerLayout() {
  const { mode } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          [FontFamily.regular]: require('@/assets/../assets/fonts/Roboto-Regular.ttf'),
          [FontFamily.medium]: require('@/assets/../assets/fonts/Roboto-Medium.ttf'),
          [FontFamily.bold]: require('@/assets/../assets/fonts/Roboto-Bold.ttf'),
          [FontFamily.black]: require('@/assets/../assets/fonts/Roboto-Black.ttf'),
        });
      } catch (e) {
        console.warn('Font load failed:', e);
      } finally {
        setReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: mode === 'dark' ? '#161617' : '#FFFFFF' },
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verification" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="registration-success" />
        <Stack.Screen name="(tabs)" />

        {/* Order management */}
        <Stack.Screen name="order-details" />
        <Stack.Screen name="running-order" />

        {/* Profile & settings */}
        <Stack.Screen name="update-profile" />
        <Stack.Screen name="change-password" />

        {/* Communication */}
        <Stack.Screen name="notifications" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="conversations" />

        {/* Earnings */}
        <Stack.Screen name="my-account" />
        <Stack.Screen name="my-earning" />
        <Stack.Screen name="my-earning-filter" />
        <Stack.Screen name="transaction-history" />
        <Stack.Screen name="earning-report" />
        <Stack.Screen name="refer-and-earn" />

        {/* Withdraw methods */}
        <Stack.Screen name="withdraw-method" />
        <Stack.Screen name="add-withdraw-method" />
        <Stack.Screen name="edit-withdraw-method" />

        {/* Disbursement */}
        <Stack.Screen name="disbursement" />

        {/* Language & info */}
        <Stack.Screen name="language" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="html-viewer" />

        {/* Update / maintenance (V4.0) */}
        <Stack.Screen name="update" />

        {/* Ride module */}
        <Stack.Screen name="vehicle-details" />
        <Stack.Screen name="add-vehicle" />
        <Stack.Screen name="help-and-support" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="reviews" />
        <Stack.Screen name="safety-policy" />
        <Stack.Screen name="pending-rides" />
        <Stack.Screen name="ongoing-rides" />
        <Stack.Screen name="ride-details" />
        <Stack.Screen name="ride-order" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LocalizationProvider>
            <ConfigProvider>
              <AuthProvider>
                <SnackbarProvider>
                  <InnerLayout />
                </SnackbarProvider>
              </AuthProvider>
            </ConfigProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
