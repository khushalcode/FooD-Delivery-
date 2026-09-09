/**
 * Auth context — DELIVERY MAN app (unified with admin panel DB).
 *
 * Key differences from the V4.0 vendor app:
 *   - Login uses EMAIL + password (not phone), matching admin panel's auth.users
 *   - Profile table is `delivery_men` (NOT `vendors`)
 *   - On signup: creates user_profiles row with role='delivery-man'
 *     (the auth trigger auto-creates one with role='customer', is_active=false;
 *      we explicitly update it to role='delivery-man', is_active=true)
 *   - On signup: inserts a delivery_men row linked by email
 *
 * Falls back to "demo" mode if Supabase is not configured.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AppConstants } from '@/constants/app_constants';
import type { VendorProfile } from '@/types';

interface AuthResult {
  isSuccess: boolean;
  message: string;
}

interface AuthContextValue {
  session: any | null;
  profile: VendorProfile | null;
  isLoading: boolean;
  isActiveRememberMe: boolean;
  toggleRememberMe: () => void;

  // Auth flows (login uses email + password)
  login: (emailOrPhone: string, password: string) => Promise<AuthResult>;
  register: (payload: RegisterPayload) => Promise<AuthResult>;
  verifyOtp: (phone: string, token: string) => Promise<AuthResult>;
  resendOtp: (phone: string) => Promise<AuthResult>;
  resetPassword: (phone: string, token: string, newPassword: string) => Promise<AuthResult>;
  logout: () => Promise<void>;

  // Profile helpers
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<VendorProfile>) => Promise<AuthResult>;

  // Remember-me persistence
  saveUserNumberAndPassword: (
    phone: string,
    password: string,
    dialCode: string,
    countryCode: string
  ) => Promise<void>;
  clearUserNumberAndPassword: () => Promise<void>;
  getUserNumber: () => Promise<string>;
  getUserPassword: () => Promise<string>;
  getUserCountryDialCode: () => Promise<string>;
  getUserCountryCode: () => Promise<string>;
}

export interface RegisterPayload {
  storeName: string; // displayed as full name
  ownerName: string;
  email: string;
  phone: string;
  dialCode: string;
  countryCode: string;
  password: string;
  address: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_PROFILE: VendorProfile = {
  id: 'demo-delivery-man',
  auth_user_id: 'demo-user',
  store_name: 'Demo Rider',
  owner_name: 'Demo Delivery',
  email: 'delivery@demo.app',
  phone: '5551234567',
  country_code: 'US',
  dial_code: '+1',
  address: 'Demo HQ, Demo City',
  latitude: 37.7749,
  longitude: -122.4194,
  logo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  cover_url: null,
  image_full_url: null,
  balance: 1250.0,
  cash_in_hand: 320.5,
  cash_in_hands: 320.5,
  total_earning: 8500.0,
  total_withdrawn: 7000,
  pending_balance: 250,
  active: true,
  earnings_visible: true,
  earnings: 1,
  is_approved: true,
  type: 'dm_wise',
  order_count: 15,
  total_rides: 0,
  avg_rating: 4.8,
  rating_count: 12,
  member_since_days: 60,
  level: 2,
  loyalty_points: 250,
  vehicle: null,
  fcm_token: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActiveRememberMe, setIsActiveRememberMe] = useState<boolean>(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setProfile(DEMO_PROFILE);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id, data.session.user.email);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadProfile(newSession.user.id, newSession.user.email);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load the delivery_men row that matches the auth user's email.
   * The delivery_men table has an `email` column (unique) which matches
   * auth.users.email — this is what links them (NOT a uuid FK).
   */
  async function loadProfile(userId: string, userEmail?: string) {
    try {
      if (!userEmail) {
        // Try to fetch the user's email from auth.users via the session
        const { data: userData } = await supabase.auth.getUser();
        userEmail = userData.user?.email || undefined;
      }
      if (!userEmail) return;

      const { data, error } = await supabase
        .from('delivery_men')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (error) throw error;
      if (data) setProfile(mapDeliveryManRow(data, userId));
      else setProfile(null);
    } catch (e: any) {
      console.warn('loadProfile error:', e?.message);
    }
  }

  async function refreshProfile() {
    if (!isSupabaseConfigured) {
      setProfile(DEMO_PROFILE);
      return;
    }
    if (!session?.user?.id) return;
    await loadProfile(session.user.id, session.user.email);
  }

  function toggleRememberMe() {
    setIsActiveRememberMe((v) => !v);
  }

  /**
   * Login with email + password (matches admin panel's auth flow).
   * Accepts either an email or a phone string — if it's not an email,
   * we attempt to look up the delivery_man by phone and use their email.
   */
  async function login(emailOrPhone: string, password: string): Promise<AuthResult> {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 800));
        setProfile(DEMO_PROFILE);
        return { isSuccess: true, message: 'Logged in (demo)' };
      }

      let email = emailOrPhone.trim();

      // If the user typed a phone, look up the email from delivery_men
      if (!email.includes('@')) {
        const cleaned = email.replace(/[^\d+]/g, '');
        const { data: dm } = await supabase
          .from('delivery_men')
          .select('email')
          .or(`phone.eq.${cleaned},phone.eq.+${cleaned}`)
          .maybeSingle();
        if (dm?.email) email = dm.email;
        else return { isSuccess: false, message: 'No delivery man found with that phone' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { isSuccess: false, message: error.message };
      setSession(data.session);
      await loadProfile(data.user.id, data.user.email);
      return { isSuccess: true, message: 'Logged in' };
    } catch (e: any) {
      return { isSuccess: false, message: e?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }

  async function register(payload: RegisterPayload): Promise<AuthResult> {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 800));
        setProfile({ ...DEMO_PROFILE, ...payloadToProfile(payload) });
        return { isSuccess: true, message: 'Registered (demo)' };
      }

      // Sign up with email (admin panel's auth.users uses email)
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            name: payload.ownerName,
            role: 'delivery-man',
          },
        },
      });

      if (error) return { isSuccess: false, message: error.message };

      if (data.user) {
        // Update user_profiles (auto-created by trigger) to set role + is_active
        try {
          await supabase
            .from('user_profiles')
            .update({ role: 'delivery-man', is_active: true })
            .eq('user_id', data.user.id);
        } catch {}

        // Insert delivery_men row
        const { error: insertError } = await supabase.from('delivery_men').insert({
          f_name: payload.ownerName.split(' ')[0] || payload.ownerName,
          l_name: payload.ownerName.split(' ').slice(1).join(' ') || '',
          phone: payload.phone,
          email: payload.email,
          status: true,
          active: false, // requires admin approval to go online
          earning: 0,
          current_orders: 0,
          type: 'delivery_man',
          application_status: 'pending',
          order_count: 0,
          is_delivery: true,
          is_ride: false,
          loyalty_point: 0,
        });
        if (insertError) {
          console.warn('delivery_men insert error:', insertError.message);
        }
      }

      return { isSuccess: true, message: 'Registered — pending admin approval' };
    } catch (e: any) {
      return { isSuccess: false, message: e?.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  }

  function payloadToProfile(p: RegisterPayload): Partial<VendorProfile> {
    return {
      store_name: p.storeName,
      owner_name: p.ownerName,
      email: p.email,
      phone: p.phone,
      country_code: p.countryCode,
      dial_code: p.dialCode,
      address: p.address,
    };
  }

  async function verifyOtp(phone: string, token: string): Promise<AuthResult> {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 600));
        return { isSuccess: true, message: 'Verified (demo)' };
      }
      const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) return { isSuccess: false, message: error.message };
      return { isSuccess: true, message: 'Phone verified' };
    } catch (e: any) {
      return { isSuccess: false, message: e?.message || 'Verification failed' };
    } finally {
      setIsLoading(false);
    }
  }

  async function resendOtp(phone: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      return { isSuccess: true, message: 'OTP sent (demo)' };
    }
    const { error } = await supabase.auth.resend({ phone, type: 'sms' });
    if (error) return { isSuccess: false, message: error.message };
    return { isSuccess: true, message: 'OTP sent' };
  }

  async function resetPassword(
    phone: string,
    token: string,
    newPassword: string
  ): Promise<AuthResult> {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 600));
        return { isSuccess: true, message: 'Password reset (demo)' };
      }
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (verifyError) return { isSuccess: false, message: verifyError.message };

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) return { isSuccess: false, message: updateError.message };

      return { isSuccess: true, message: 'Password reset successful' };
    } catch (e: any) {
      return { isSuccess: false, message: e?.message || 'Reset failed' };
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    await clearSharedData();
    setSession(null);
    setProfile(null);
  }

  async function clearSharedData() {
    const keys = [
      AppConstants.tokenKey,
      AppConstants.userPasswordKey,
      AppConstants.userNumberKey,
      AppConstants.userCountryDialCodeKey,
      AppConstants.userCountryCodeKey,
      AppConstants.notificationKey,
      AppConstants.notificationCountKey,
      AppConstants.ignoreListKey,
    ];
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      // ignore
    }
  }

  async function updateProfile(patch: Partial<VendorProfile>): Promise<AuthResult> {
    try {
      if (!profile) return { isSuccess: false, message: 'No profile loaded' };

      if (!isSupabaseConfigured) {
        setProfile({ ...profile, ...patch });
        return { isSuccess: true, message: 'Profile updated (demo)' };
      }

      // Map the delivery-man fields back to delivery_men columns
      const updateRow: Record<string, any> = { updated_at: new Date().toISOString() };
      if (patch.address !== undefined) {
        // delivery_men has no address column — we set the lat/lng or skip
      }
      if (patch.active !== undefined) updateRow.active = patch.active;
      if (patch.logo_url !== undefined) updateRow.image = patch.logo_url;
      if (patch.phone !== undefined) updateRow.phone = patch.phone;

      const { error } = await supabase
        .from('delivery_men')
        .update(updateRow)
        .eq('email', profile.email);
      if (error) return { isSuccess: false, message: error.message };

      setProfile({ ...profile, ...patch });
      return { isSuccess: true, message: 'Profile updated' };
    } catch (e: any) {
      return { isSuccess: false, message: e?.message || 'Update failed' };
    }
  }

  // --- Remember-me persistence ---
  async function saveUserNumberAndPassword(
    phone: string,
    password: string,
    dialCode: string,
    countryCode: string
  ) {
    try {
      await AsyncStorage.multiSet([
        [AppConstants.userNumberKey, phone],
        [AppConstants.userPasswordKey, password],
        [AppConstants.userCountryDialCodeKey, dialCode],
        [AppConstants.userCountryCodeKey, countryCode],
      ]);
    } catch (e) {
      // ignore
    }
  }

  async function clearUserNumberAndPassword() {
    try {
      await AsyncStorage.multiRemove([
        AppConstants.userNumberKey,
        AppConstants.userPasswordKey,
        AppConstants.userCountryDialCodeKey,
        AppConstants.userCountryCodeKey,
      ]);
    } catch (e) {
      // ignore
    }
  }

  async function getUserNumber(): Promise<string> {
    try {
      return (await AsyncStorage.getItem(AppConstants.userNumberKey)) || '';
    } catch {
      return '';
    }
  }
  async function getUserPassword(): Promise<string> {
    try {
      return (await AsyncStorage.getItem(AppConstants.userPasswordKey)) || '';
    } catch {
      return '';
    }
  }
  async function getUserCountryDialCode(): Promise<string> {
    try {
      return (await AsyncStorage.getItem(AppConstants.userCountryDialCodeKey)) || '';
    } catch {
      return '';
    }
  }
  async function getUserCountryCode(): Promise<string> {
    try {
      return (await AsyncStorage.getItem(AppConstants.userCountryCodeKey)) || '';
    } catch {
      return '';
    }
  }

  const value: AuthContextValue = {
    session,
    profile,
    isLoading,
    isActiveRememberMe,
    toggleRememberMe,
    login,
    register,
    verifyOtp,
    resendOtp,
    resetPassword,
    logout,
    refreshProfile,
    updateProfile,
    saveUserNumberAndPassword,
    clearUserNumberAndPassword,
    getUserNumber,
    getUserPassword,
    getUserCountryDialCode,
    getUserCountryCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

/**
 * Map a delivery_men row to the existing VendorProfile shape.
 * The VendorProfile type is preserved for backward-compat with screens,
 * but values are sourced from the admin panel's delivery_men columns.
 */
function mapDeliveryManRow(row: any, authUserId: string): VendorProfile {
  return {
    id: String(row.id),
    auth_user_id: authUserId,
    store_name: `${row.f_name || ''} ${row.l_name || ''}`.trim() || 'Delivery Man',
    owner_name: `${row.f_name || ''} ${row.l_name || ''}`.trim(),
    email: row.email ?? '',
    phone: row.phone ?? '',
    country_code: 'US',
    dial_code: '+1',
    address: '',
    latitude: null,
    longitude: null,
    logo_url: row.image ?? null,
    cover_url: null,
    image_full_url: row.image ?? null,
    balance: Number(row.earning ?? 0),
    cash_in_hand: 0,
    cash_in_hands: 0,
    total_earning: Number(row.earning ?? 0),
    total_withdrawn: 0,
    pending_balance: 0,
    active: Boolean(row.active),
    earnings_visible: true,
    earnings: 1,
    is_approved: row.application_status === 'approved',
    type: row.type || 'delivery_man',
    order_count: Number(row.order_count ?? 0),
    total_rides: 0,
    avg_rating: 0,
    rating_count: 0,
    member_since_days: 0,
    level: 1,
    loyalty_points: Number(row.loyalty_point ?? 0),
    vehicle: null,
    fcm_token: null,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

// Convenience helper to show errors via Alert
export function showAuthError(message: string) {
  Alert.alert('Error', message);
}
