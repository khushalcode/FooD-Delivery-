/**
 * V4.0 additions — service functions added by the V3.9 → V4.0 upgrade.
 *
 * These functions cover:
 *  - ConfigModel fetch (with maintenance mode + forced-update checks)
 *  - Income statements (ride + delivery)
 *  - Wallet payment lists + wallet-provided earnings
 *  - Collect cash payment / wallet adjustment
 *  - Earning invoice download (via expo-file-system + expo-sharing)
 *  - Withdraw request list + create
 *  - Loyalty point list + convert
 *  - Referral report + loyalty report (with filters)
 *  - Ride accept/reject/start/complete/cancel
 *  - Vehicle brands + categories
 *  - Profile level info
 *  - Chat image/file/video upload
 *  - Account deletion
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import type {
  ConfigModel,
  DeliveryIncomeStatement,
  RideIncomeStatement,
  WalletPayment,
  WithdrawRequest,
  LoyaltyPoint,
  EarningReport,
  EarningReportFilters,
  VehicleBrand,
  VehicleCategory,
  LevelInfo,
  Ride,
  Review,
  ChatMessage,
  VendorProfile,
} from '@/types';

// ---------------------------------------------------------------------------
// ConfigModel
// ---------------------------------------------------------------------------

const MOCK_CONFIG: ConfigModel = {
  business_name: 'Delivery',
  logo: null,
  address: 'Demo address',
  phone: '+1-800-123-4567',
  email: 'support@delivery.app',
  country: 'United States',
  default_location: { lat: 40.7128, lng: -74.006 },
  currency_symbol: '$',
  currency_symbol_direction: 'left',
  app_minimum_version_android: 4.0,
  app_url_android: 'https://play.google.com/store/apps/details?id=com.delivery.app',
  app_minimum_version_ios: 4.0,
  app_url_ios: 'https://apps.apple.com/app/delivery/id000000000',
  customer_verification: 1,
  schedule_order: 1,
  order_delivery_verification: 1,
  cash_on_delivery: 1,
  digital_payment: 1,
  per_km_shipping_charge: 1.5,
  minimum_shipping_charge: 2.5,
  free_delivery_over: 50,
  demo: 1,
  maintenance_mode: false,
  order_confirmation_model: 'after_confirm',
  show_dm_earning: 1,
  show_rider_earning: 1,
  canceled_by_deliveryman: 1,
  time_format: '24h',
  language: 'en',
  toggle_veg_non_veg: 1,
  toggle_dm_registration: 1,
  toggle_rider_registration: 1,
  schedule_order_slot_duration: 30,
  digit_after_decimal_point: 2,
  module_config: {
    food: {
      id: 1,
      type: 'food',
      name: 'Food',
      description: 'Food delivery module',
      icon: null,
      thumbnail: null,
      status: 1,
      add_on: 1,
      stock: 1,
      veg_non_veg: 1,
      unit: 0,
      order_attachment: 0,
      show_restaurant_text: 1,
      is_parcel: 0,
      new_variation: true,
    },
    parcel: {
      id: 2,
      type: 'parcel',
      name: 'Parcel',
      description: 'Parcel delivery module',
      icon: null,
      thumbnail: null,
      status: 1,
      add_on: 0,
      stock: 0,
      veg_non_veg: 0,
      unit: 0,
      order_attachment: 1,
      show_restaurant_text: 0,
      is_parcel: 1,
      new_variation: false,
    },
  },
  parcel_per_km_shipping_charge: 2.0,
  parcel_minimum_shipping_charge: 3.0,
  dm_picture_upload_status: 1,
  additional_charge_name: null,
  web_socket_status: 0,
  web_socket_uri: null,
  web_socket_port: null,
  web_socket_key: null,
  web_socket_scheme: null,
  disbursement_type: 'manual',
  active_payment_method_list: {
    cash: { gateway: 'cash', method_name: 'Cash on Delivery' },
    digital: { gateway: 'digital', method_name: 'Digital Payment' },
    wallet: { gateway: 'wallet', method_name: 'Wallet' },
  },
  min_amount_to_pay_dm: 100,
  min_amount_to_pay_rider: 100,
  firebase_otp_verification: 0,
  parcel_cancellation_status: 1,
  parcel_cancellation_basic_setup: {
    status: 1,
    parcel_return_time_status: 1,
    min_return_time: 30,
    return_time_type: 'minutes',
    return_fee_for_dm: 0,
  },
  parcel_return_time_fee: {
    status: 1,
    parcel_return_time: 30,
    return_time_type: 'minutes',
    return_fee_for_dm: 0,
  },
  dm_loyalty_point_data: {
    loyalty_point_status: 1,
    loyalty_point_conversion_rate: 1,
    min_loyalty_point_to_convert: 100,
    title: 'Loyalty Points',
    sub_title: 'Convert your points to wallet balance',
    image: null,
  },
  rider_loyalty_point_data: {
    loyalty_point_status: 1,
    loyalty_point_conversion_rate: 1,
    min_loyalty_point_to_convert: 100,
    title: 'Rider Loyalty Points',
    sub_title: 'Convert your points to wallet balance',
    image: null,
  },
  dm_referral_data: { referral_status: 1, referral_amount: 5, referral_type_for: 'delivery_man' },
  rider_referral_data: { referral_status: 1, referral_amount: 10, referral_type_for: 'rider' },
  vehicle_fuel_types: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
  vehicle_transmission_types: ['Manual', 'Automatic', 'CVT'],
  safety_feature_status: 1,
  safety_feature_minimum_trip_delay_time: 5,
  after_trip_complete_safety_feature_set_time: 30,
  safety_feature_emergency_govt_number: '911',
  bid_on_fare: 1,
  otp_confirmation_for_trip: 1,
  rider_level_status: 1,
  rider_can_review_customer: 1,
  rider_faqs: [
    {
      id: 'f1',
      question: 'How do I receive ride requests?',
      answer: 'When you go online, you will automatically receive ride requests in your area.',
      question_answer_for: 'rider',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'f2',
      question: 'When do I get paid for a ride?',
      answer: 'Your earnings are added to your wallet immediately after completing the ride.',
      question_answer_for: 'rider',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  completion_radius: 100, // meters
  rider_max_cash_in_hand: 500,
  maintenance_mode_data: null,
};

/**
 * Fetch the global app ConfigModel. Falls back to a default demo config when
 * Supabase is not configured or the row doesn't exist.
 *
 * Mirrors lib/features/splash/domain/services/splash_service.dart → getConfigData().
 */
export async function fetchConfig(): Promise<ConfigModel> {
  if (!isSupabaseConfigured) return MOCK_CONFIG;
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return MOCK_CONFIG;
  // Merge with the mock so missing fields fall back to defaults.
  return { ...MOCK_CONFIG, ...(data as Partial<ConfigModel>) };
}

// ---------------------------------------------------------------------------
// Income Statements (V4.0 new)
// ---------------------------------------------------------------------------

export async function fetchDeliveryIncomeStatement(
  vendorId: string,
  offset = 0,
  limit = 10
): Promise<DeliveryIncomeStatement[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('delivery_income_statements')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data || []) as DeliveryIncomeStatement[];
}

export async function fetchRideIncomeStatement(
  riderId: string,
  offset = 0,
  limit = 10
): Promise<RideIncomeStatement[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('ride_income_statements')
    .select('*')
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data || []) as RideIncomeStatement[];
}

// ---------------------------------------------------------------------------
// Wallet payment lists + provided earnings (V4.0)
// ---------------------------------------------------------------------------

export async function fetchWalletPaymentList(
  vendorId: string,
  offset = 0,
  limit = 10
): Promise<WalletPayment[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('wallet_payments')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data || []) as WalletPayment[];
}

export async function fetchWalletProvidedEarningList(
  vendorId: string,
  offset = 0,
  limit = 10
): Promise<WalletPayment[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('wallet_payments')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('type', 'provided')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data || []) as WalletPayment[];
}

export async function makeCollectCashPayment(
  vendorId: string,
  amount: number,
  paymentGatewayName: string
): Promise<void> {
  if (!isSupabaseConfigured) return;
  // Use the admin panel's wallet_transactions table (not the V4.0 'transactions' table)
  const { error } = await supabase.from('wallet_transactions').insert({
    user_id: vendorId,
    credit: amount,
    debit: 0,
    balance: 0,
    reference: 'cash_collected',
    transaction_type: 'cash_collected',
  });
  if (error) throw error;
}

export async function makeWalletAdjustment(vendorId: string): Promise<void> {
  // Admin panel doesn't expose wallet_payments as a separate concept —
  // the wallet_transactions table is the single source of truth. This is a no-op
  // for the unified DB; the screen will just show 0.
  if (!isSupabaseConfigured) return;
}

// ---------------------------------------------------------------------------
// Earning invoice download (V4.0)
// ---------------------------------------------------------------------------

export async function downloadEarningInvoice(
  vendorId: string,
  earningType: 'delivery' | 'ride'
): Promise<void> {
  // In a real app this would hit the V4.0 /deliveryman-earning-report-invoice
  // endpoint and download the PDF. Here we generate a tiny CSV so the user can
  // preview the action without a backend.
  const fileName = `earning-${earningType}-${vendorId}-${Date.now()}.csv`;
  const csv = `earning_type,vendor_id,generated_at\n${earningType},${vendorId},${new Date().toISOString()}\n`;
  const fileUri = FileSystem.documentDirectory + fileName;
  try {
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }
  } catch (e) {
    console.warn('Invoice download failed:', e);
  }
}

// ---------------------------------------------------------------------------
// Withdraw requests (V4.0)
// ---------------------------------------------------------------------------

export async function fetchWithdrawRequestList(
  vendorId: string,
  offset = 0,
  limit = 10
): Promise<WithdrawRequest[]> {
  if (!isSupabaseConfigured) return [];
  // Use the admin panel's withdraw_requests table, filtered by delivery_man_id
  const { data, error } = await supabase
    .from('withdraw_requests')
    .select('*')
    .eq('delivery_man_id', vendorId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data || []) as WithdrawRequest[];
}

export async function createWithdrawRequest(
  vendorId: string,
  amount: number,
  methodName: string,
  methodFields: Record<string, string>,
  senderNote?: string
): Promise<WithdrawRequest | null> {
  if (!isSupabaseConfigured) {
    return {
      id: 'local-' + Date.now(),
      vendor_id: vendorId,
      amount,
      method_name: methodName,
      method_fields: methodFields,
      sender_note: senderNote ?? null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase
    .from('withdraw_requests')
    .insert({
      delivery_man_id: vendorId,
      amount,
      type: 'delivery_man',
      withdrawal_method_fields: { method_name: methodName, ...methodFields },
      sender_note: senderNote ?? null,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data as WithdrawRequest;
}

// ---------------------------------------------------------------------------
// Loyalty points (V4.0)
// ---------------------------------------------------------------------------

export async function fetchLoyaltyPointList(
  vendorId: string,
  offset = 0,
  limit = 10
): Promise<LoyaltyPoint[]> {
  if (!isSupabaseConfigured) return [];
  // Use the admin panel's loyalty_point_transactions table
  const { data, error } = await supabase
    .from('loyalty_point_transactions')
    .select('*')
    .eq('user_id', vendorId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data || []) as LoyaltyPoint[];
}

export async function convertLoyaltyPoints(
  vendorId: string,
  points: number,
  isRideActive = false
): Promise<void> {
  if (!isSupabaseConfigured) return;
  // Use the admin panel's loyalty_point_transactions + wallet_transactions tables.
  const { error: ins } = await supabase.from('loyalty_point_transactions').insert({
    user_id: vendorId,
    debit: points,
    credit: 0,
    balance: 0,
    reference: 'convert_to_balance',
    transaction_type: 'spent',
  });
  if (ins) throw ins;
  // Add equivalent balance (1 point = 1 unit currency) to wallet_transactions
  const { error: wal } = await supabase.from('wallet_transactions').insert({
    user_id: vendorId,
    credit: points,
    debit: 0,
    balance: 0,
    reference: 'loyalty_conversion',
    transaction_type: 'loyalty_conversion',
  });
  if (wal) throw wal;
}

// ---------------------------------------------------------------------------
// Referral report + Loyalty report (V4.0 — filtered)
// ---------------------------------------------------------------------------

export async function fetchEarningReportFiltered(
  vendorId: string,
  filters: EarningReportFilters = {}
): Promise<EarningReport[]> {
  if (!isSupabaseConfigured) return [];
  let query = supabase
    .from('earning_reports')
    .select('*')
    .eq('vendor_id', vendorId);

  if (filters.type) {
    // type filter acts on the type column where applicable; earning_reports
    // row format is one row per period+type so this narrows correctly.
    query = query.eq('period', filters.type);
  }
  if (filters.startDate) query = query.gte('created_at', filters.startDate);
  if (filters.endDate) query = query.lte('created_at', filters.endDate);

  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 20;
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data || []) as EarningReport[];
}

// ---------------------------------------------------------------------------
// Vehicle reference data (V4.0)
// ---------------------------------------------------------------------------

export async function fetchVehicleBrands(): Promise<VehicleBrand[]> {
  if (!isSupabaseConfigured) {
    return [
      { id: 'b1', name: 'Toyota', image: null },
      { id: 'b2', name: 'Honda', image: null },
      { id: 'b3', name: 'Ford', image: null },
      { id: 'b4', name: 'Tesla', image: null },
      { id: 'b5', name: 'Yamaha', image: null },
    ];
  }
  const { data, error } = await supabase.from('vehicle_brands').select('*');
  if (error) throw error;
  return (data || []) as VehicleBrand[];
}

export async function fetchVehicleCategories(): Promise<VehicleCategory[]> {
  if (!isSupabaseConfigured) {
    return [
      { id: 'c1', name: 'Car', type: 'car', image: null },
      { id: 'c2', name: 'Bike', type: 'bike', image: null },
      { id: 'c3', name: 'Truck', type: 'truck', image: null },
      { id: 'c4', name: 'Bicycle', type: 'bicycle', image: null },
    ];
  }
  const { data, error } = await supabase.from('vehicle_categories').select('*');
  if (error) throw error;
  return (data || []) as VehicleCategory[];
}

// ---------------------------------------------------------------------------
// Profile level (V4.0)
// ---------------------------------------------------------------------------

export async function fetchLevelInfo(vendorId: string): Promise<LevelInfo | null> {
  if (!isSupabaseConfigured) {
    return {
      current_level: {
        id: 'l1',
        name: 'Bronze',
        min_rides: 0,
        reward: 0,
      },
      next_level: {
        id: 'l2',
        name: 'Silver',
        min_rides: 50,
        reward: 25,
      },
      progress: 35,
      total_rides: 17,
    };
  }
  const { data, error } = await supabase
    .from('level_info')
    .select('*')
    .eq('vendor_id', vendorId)
    .maybeSingle();
  if (error || !data) return null;
  return data as LevelInfo;
}

// ---------------------------------------------------------------------------
// Ride lifecycle (V4.0)
// ---------------------------------------------------------------------------

export async function acceptRide(rideId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('rides')
    .update({
      status: 'accepted',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', rideId);
  if (error) throw error;
}

export async function rejectRide(rideId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('rides')
    .update({
      status: 'cancelled',
      cancellation_reason: 'rejected_by_rider',
      updated_at: new Date().toISOString(),
    })
    .eq('id', rideId);
  if (error) throw error;
}

export async function updateRideStatus(
  rideId: string,
  status: Ride['status'],
  cancellationReason?: string
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const patch: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === 'ongoing') patch.started_at = new Date().toISOString();
  if (status === 'completed') patch.completed_at = new Date().toISOString();
  if (status === 'cancelled' && cancellationReason)
    patch.cancellation_reason = cancellationReason;
  const { error } = await supabase.from('rides').update(patch).eq('id', rideId);
  if (error) throw error;
}

export async function submitRideReview(
  rideId: string,
  customerId: string,
  rating: number,
  comment: string
): Promise<Review | null> {
  if (!isSupabaseConfigured) {
    return {
      id: 'local-' + Date.now(),
      ride_id: rideId,
      order_id: null,
      customer_id: customerId,
      customer_name: '',
      customer_image: null,
      rating,
      comment,
      created_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ride_id: rideId,
      customer_id: customerId,
      rating,
      comment,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

// ---------------------------------------------------------------------------
// Account deletion (V4.0)
// ---------------------------------------------------------------------------

export async function deleteVendorAccount(vendorId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  // Soft-delete: mark the delivery_men row inactive + application_status rejected;
  // RLS will then hide it from queries.
  const { error } = await supabase
    .from('delivery_men')
    .update({ active: false, application_status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', vendorId);
  if (error) throw error;
  // Also sign out the auth session.
  await supabase.auth.signOut();
}

// ---------------------------------------------------------------------------
// Chat attachments (V4.0)
// ---------------------------------------------------------------------------

export async function sendChatImage(
  conversationId: string,
  senderId: string,
  senderType: ChatMessage['sender_type'],
  fileUri: string,
  fileName: string
): Promise<ChatMessage | null> {
  let attachmentUrl: string | null = null;
  if (isSupabaseConfigured) {
    const path = `chat/${conversationId}/${Date.now()}-${fileName}`;
    const file = await fetch(fileUri);
    const blob = await file.blob();
    const { error: upErr } = await supabase.storage
      .from('chat-attachments')
      .upload(path, blob, { contentType: 'image/jpeg' });
    if (!upErr) {
      const { data: pub } = supabase.storage.from('chat-attachments').getPublicUrl(path);
      attachmentUrl = pub.publicUrl;
    }
  }
  return sendChatMessage(conversationId, senderId, senderType, '', {
    attachment_url: attachmentUrl ?? fileUri,
    attachment_type: 'image',
    attachment_name: fileName,
    attachment_size: null,
  });
}

export async function sendChatFile(
  conversationId: string,
  senderId: string,
  senderType: ChatMessage['sender_type'],
  fileUri: string,
  fileName: string,
  fileSize: number
): Promise<ChatMessage | null> {
  let attachmentUrl: string | null = null;
  if (isSupabaseConfigured) {
    const path = `chat/${conversationId}/${Date.now()}-${fileName}`;
    const file = await fetch(fileUri);
    const blob = await file.blob();
    const { error: upErr } = await supabase.storage
      .from('chat-attachments')
      .upload(path, blob);
    if (!upErr) {
      const { data: pub } = supabase.storage.from('chat-attachments').getPublicUrl(path);
      attachmentUrl = pub.publicUrl;
    }
  }
  return sendChatMessage(conversationId, senderId, senderType, '', {
    attachment_url: attachmentUrl ?? fileUri,
    attachment_type: 'file',
    attachment_name: fileName,
    attachment_size: fileSize,
  });
}

export async function sendChatVideo(
  conversationId: string,
  senderId: string,
  senderType: ChatMessage['sender_type'],
  fileUri: string,
  fileName: string,
  fileSize: number
): Promise<ChatMessage | null> {
  let attachmentUrl: string | null = null;
  if (isSupabaseConfigured) {
    const path = `chat/${conversationId}/${Date.now()}-${fileName}`;
    const file = await fetch(fileUri);
    const blob = await file.blob();
    const { error: upErr } = await supabase.storage
      .from('chat-attachments')
      .upload(path, blob, { contentType: 'video/mp4' });
    if (!upErr) {
      const { data: pub } = supabase.storage.from('chat-attachments').getPublicUrl(path);
      attachmentUrl = pub.publicUrl;
    }
  }
  return sendChatMessage(conversationId, senderId, senderType, '', {
    attachment_url: attachmentUrl ?? fileUri,
    attachment_type: 'video',
    attachment_name: fileName,
    attachment_size: fileSize,
  });
}

/**
 * Internal helper — sends a chat message row with optional attachment metadata.
 * Falls back to mock when Supabase is not configured.
 */
async function sendChatMessage(
  conversationId: string,
  senderId: string,
  senderType: ChatMessage['sender_type'],
  message: string,
  attachment: Partial<Pick<ChatMessage, 'attachment_url' | 'attachment_type' | 'attachment_name' | 'attachment_size' | 'is_from_faq'>>
): Promise<ChatMessage | null> {
  if (!isSupabaseConfigured) {
    return {
      id: 'local-' + Date.now(),
      conversation_id: conversationId,
      sender_id: senderId,
      sender_type: senderType,
      message,
      attachment_url: attachment.attachment_url ?? null,
      attachment_type: attachment.attachment_type ?? null,
      attachment_name: attachment.attachment_name ?? null,
      attachment_size: attachment.attachment_size ?? null,
      is_read: false,
      is_from_faq: false,
      created_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_type: senderType,
      message,
      attachment_url: attachment.attachment_url ?? null,
      attachment_type: attachment.attachment_type ?? null,
      attachment_name: attachment.attachment_name ?? null,
      attachment_size: attachment.attachment_size ?? null,
      is_from_faq: attachment.is_from_faq ?? false,
      is_read: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as ChatMessage;
}

// ---------------------------------------------------------------------------
// App store open (for forced-update flow)
// ---------------------------------------------------------------------------

export async function openAppStoreUpdate(config: ConfigModel): Promise<void> {
  const url =
    Platform.OS === 'ios' ? config.app_url_ios : config.app_url_android;
  if (url) {
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn('Failed to open app store URL:', e);
    }
  }
}

// Re-export for screens that need it
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Convenience: V4.0 maintenance check
// ---------------------------------------------------------------------------

/**
 * Returns true if the current app mode platform is in maintenance mode
 * per the V4.0 ConfigModel.
 *
 * Mirrors splash_controller.dart → isInMaintenance logic.
 */
export function isInMaintenanceMode(config: ConfigModel | null): boolean {
  if (!config || !config.maintenance_mode) return false;
  const platform =
    Platform.OS === 'android' ? 'deliveryman_app' : 'deliveryman_app'; // mirror V4.0 default
  const list = config.maintenance_mode_data?.maintenance_system_setup ?? [];
  return list.includes(platform);
}

/**
 * Returns true if the running app version is below the minimum required.
 * Mirrors splash_controller.dart → forced-update branch.
 */
export function isForcedUpdateRequired(
  config: ConfigModel | null,
  currentVersion: number
): boolean {
  if (!config) return false;
  const min =
    Platform.OS === 'ios'
      ? config.app_minimum_version_ios
      : config.app_minimum_version_android;
  if (min == null) return false;
  return currentVersion < min;
}
