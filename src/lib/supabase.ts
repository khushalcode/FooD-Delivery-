/**
 * Supabase client — auth + data layer for the DELIVERY MAN app.
 *
 * Reads credentials from app.json `expo.extra` (preferred) so the same
 * Supabase project as the admin panel and customer app is used.
 *
 * Falls back to process.env.EXPO_PUBLIC_* then to placeholder values
 * (demo mode) so the app still boots without configuration.
 *
 * UNIFIED DATABASE — both apps share the same Supabase project, the
 * same auth.users table, and the same `delivery_men` table.
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://YOUR-PROJECT-REF.supabase.co';

const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'YOUR-SUPABASE-ANON-KEY';

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('YOUR-PROJECT-REF') &&
  SUPABASE_ANON_KEY !== 'YOUR-SUPABASE-ANON-KEY' &&
  SUPABASE_ANON_KEY.length > 20;

// SSR-safe storage adapter: uses AsyncStorage on native, in-memory on Node SSR,
// localStorage on web client.
const memoryStore: Record<string, string | null> = {};
const customStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Native (AsyncStorage)
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage.getItem) {
        return await AsyncStorage.getItem(key);
      }
      // Web client (localStorage)
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      // Node SSR
      return memoryStore[key] ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage.setItem) {
        await AsyncStorage.setItem(key, value);
        return;
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      memoryStore[key] = value;
    } catch {
      // ignore
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage.removeItem) {
        await AsyncStorage.removeItem(key);
        return;
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      delete memoryStore[key];
    } catch {
      // ignore
    }
  },
};

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: customStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: { eventsPerSecond: 5 },
    },
  });
  return _client;
}

export const supabase = getSupabase();
