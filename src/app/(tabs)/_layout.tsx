/**
 * Tabs layout — mirrors lib/features/dashboard/screens/dashboard_screen.dart.
 * Bottom tab navigator with: Home, Order Request, Orders, Profile.
 */

import { Tabs } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { Images } from '@/constants/images';
import { useTranslation } from '@/context/LocalizationContext';

function TabIcon({ source, label, focused }: { source: number; label: string; focused: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.tabItem}>
      <Image
        source={source}
        style={[styles.tabIcon, { tintColor: focused ? colors.primary : colors.disabled }]}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? colors.primary : colors.disabled },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.bottomNavBg,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarIconStyle: { width: '100%', height: '100%' },
        tabBarItemStyle: { paddingVertical: 6 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={Images.home} label={t('home')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="order-request"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={Images.request} label={t('request')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={Images.bag} label={t('orders')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={Images.profile} label={t('profile')} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  tabLabel: {
    ...Typography.caption,
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
});
