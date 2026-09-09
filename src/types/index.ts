/**
 * Domain types — mirror the Flutter models in lib/features/{feature}/domain/models/.
 * V4.0 includes: vendor/delivery-man profile, orders, items, notifications,
 * conversations, chat messages, withdraw methods, transactions, disbursement reports,
 * rides, vehicles, earning reports, referral earnings, leaderboard, reviews,
 * safety alerts, trips, loyalty points, config model, parcel cancellation, payments,
 * delivery income statement, ride income statement.
 *
 * Used by Supabase queries, contexts, and screens.
 */

// ---------------------------------------------------------------------------
// ConfigModel (mirrors lib/common/models/config_model.dart) — V4.0 root config
// ---------------------------------------------------------------------------

export interface RiderFaq {
  id: string;
  question: string;
  answer: string;
  question_answer_for: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSystemSetup {
  maintenance_system_setup: string[];
  selected_maintenance_system_setup: string[];
}

export interface MaintenanceDurationSetup {
  maintenance_duration: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface MaintenanceMessageSetup {
  maintenance_message: string | null;
  maintenance_message_for: string[];
  body: string | null;
  footer: string | null;
}

export interface MaintenanceModeData {
  maintenance_system_setup: string[];
  selected_maintenance_system_setup: string[];
  maintenance_duration: string | null;
  start_date: string | null;
  end_date: string | null;
  maintenance_message: string | null;
  maintenance_message_for: string[];
  body: string | null;
  footer: string | null;
}

export interface LoyaltyPointData {
  loyalty_point_status: number;
  loyalty_point_conversion_rate: number;
  min_loyalty_point_to_convert: number;
  title: string;
  sub_title: string;
  image: string | null;
}

export interface ReferralData {
  referral_status: number;
  referral_amount: number;
  referral_type_for: string;
}

export interface ParcelCancellationBasicSetup {
  status: number;
  parcel_return_time_status: number;
  min_return_time: number;
  return_time_type: string;
  return_fee_for_dm: number;
}

export interface ParcelReturnTimeFee {
  status: number;
  parcel_return_time: number;
  return_time_type: string;
  return_fee_for_dm: number;
}

export interface Module {
  id: number;
  type: string;
  name: string;
  description: string;
  icon: string | null;
  thumbnail: string | null;
  status: number;
  add_on: number;
  stock: number;
  veg_non_veg: number;
  unit: number;
  order_attachment: number;
  show_restaurant_text: number;
  is_parcel: number;
  new_variation: boolean;
}

export interface ModuleConfig {
  [key: string]: Module;
}

export interface ConfigModel {
  business_name: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  default_location: { lat: number; lng: number } | null;
  currency_symbol: string;
  currency_symbol_direction: 'left' | 'right';
  app_minimum_version_android: number | null;
  app_url_android: string | null;
  app_minimum_version_ios: number | null;
  app_url_ios: string | null;
  customer_verification: number;
  schedule_order: number;
  order_delivery_verification: number;
  cash_on_delivery: number;
  digital_payment: number;
  per_km_shipping_charge: number;
  minimum_shipping_charge: number;
  free_delivery_over: number | null;
  demo: number;
  maintenance_mode: boolean;
  order_confirmation_model: string;
  show_dm_earning: number;
  show_rider_earning: number;
  canceled_by_deliveryman: number;
  time_format: string;
  language: string;
  toggle_veg_non_veg: number;
  toggle_dm_registration: number;
  toggle_rider_registration: number;
  schedule_order_slot_duration: number;
  digit_after_decimal_point: number;
  module_config: ModuleConfig;
  parcel_per_km_shipping_charge: number;
  parcel_minimum_shipping_charge: number;
  dm_picture_upload_status: number;
  additional_charge_name: string | null;
  web_socket_status: number;
  web_socket_uri: string | null;
  web_socket_port: string | null;
  web_socket_key: string | null;
  web_socket_scheme: string | null;
  disbursement_type: 'manual' | 'automated';
  active_payment_method_list: Record<string, { gateway: string; method_name: string }>;
  min_amount_to_pay_dm: number;
  min_amount_to_pay_rider: number;
  firebase_otp_verification: number;
  parcel_cancellation_status: number;
  parcel_cancellation_basic_setup: ParcelCancellationBasicSetup | null;
  parcel_return_time_fee: ParcelReturnTimeFee | null;
  dm_loyalty_point_data: LoyaltyPointData | null;
  rider_loyalty_point_data: LoyaltyPointData | null;
  dm_referral_data: ReferralData | null;
  rider_referral_data: ReferralData | null;
  vehicle_fuel_types: string[];
  vehicle_transmission_types: string[];
  safety_feature_status: number;
  safety_feature_minimum_trip_delay_time: number;
  after_trip_complete_safety_feature_set_time: number;
  safety_feature_emergency_govt_number: string | null;
  bid_on_fare: number;
  otp_confirmation_for_trip: number;
  rider_level_status: number;
  rider_can_review_customer: number;
  rider_faqs: RiderFaq[];
  completion_radius: number;
  rider_max_cash_in_hand: number;
  maintenance_mode_data: MaintenanceModeData | null;
}

// ---------------------------------------------------------------------------
// Vendor / DeliveryMan Profile (lib/features/profile/domain/models/profile_model.dart)
// ---------------------------------------------------------------------------

export interface VendorProfile {
  id: string;
  auth_user_id: string;
  store_name: string;
  owner_name: string;
  email: string;
  phone: string;
  country_code: string;
  dial_code: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  cover_url: string | null;
  image_full_url: string | null;
  balance: number;
  cash_in_hand: number;
  cash_in_hands?: number; // alias used by V4.0
  total_earning: number;
  total_withdrawn: number;
  pending_balance: number;
  active: boolean; // online/offline toggle
  earnings_visible: boolean;
  earnings: number; // 0 or 1 — whether earnings feature is enabled
  is_approved: boolean;
  type: string; // 'store_wise' | 'dm_wise'
  order_count: number;
  todays_order_count?: number;
  this_week_order_count?: number;
  total_rides?: number;
  total_income?: number;
  trip_income?: number; // ride income
  delivery_income?: number;
  total_tips?: number;
  avg_rating: number;
  rating_count: number;
  member_since_days: number;
  level: number;
  is_delivery_on?: boolean;
  is_ride_on?: boolean;
  loyalty_points?: number;
  vehicle: Vehicle | null;
  fcm_token: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Order Items (lib/features/delivery_module/order/domain/models/order_details_model.dart)
// ---------------------------------------------------------------------------

export interface ChoiceOptions {
  name: string;
  title: string;
  options: string[];
  required: 'on' | 'off';
}

export interface VariationValue {
  label: string;
  optionPrice: number;
}

export interface FoodVariation {
  name: string;
  type: string;
  min: number;
  max: number;
  required: 'on' | 'off';
  variations: VariationValue[];
}

export interface ItemVariations {
  type: string;
  price: number;
  label: string;
}

export interface ItemDetails {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  image_full_url: string | null;
  category_ids: string[];
  variations: ItemVariations[] | null;
  food_variations: FoodVariation[] | null;
  add_ons: { id: string; name: string; price: number }[];
  choice_options: ChoiceOptions[];
  price: number;
  tax: number;
  tax_type: string;
  discount: number;
  discount_type: string;
  available_time_starts: string | null;
  available_time_ends: string | null;
  store_id: string;
  store_name: string;
  store_discount: number;
  avg_rating: number;
  veg: number;
  unit_type: string | null;
  rating_count: number;
  module_type: string;
}

export interface OrderItemAddOn {
  id?: string;
  name: string;
  price: number;
  quantity?: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  variant: string | null;
  add_ons: OrderItemAddOn[];
  total: number;
  // V4.0 additions (optional — populated by Supabase queries when available)
  discount_on_item?: number;
  discount_type?: string;
  tax_amount?: number;
  total_add_on_price?: number;
  vendor_id?: string | null;
  food_variation?: FoodVariation[] | null;
  variation?: ItemVariations[] | null;
  item_details?: ItemDetails | null;
  parcel_cancellation?: ParcelCancellation | null;
  item_campaign_id?: string | null;
}

// ---------------------------------------------------------------------------
// Parcel Cancellation (lib/features/delivery_module/order/domain/models/order_cancellation_body.dart)
// ---------------------------------------------------------------------------

export interface ParcelCancellation {
  id: string;
  order_id: string;
  reason: string[];
  cancel_by: 'customer' | 'delivery_man' | 'admin' | null;
  note: string | null;
  return_otp: string | null;
  return_fee: number;
  return_fee_payment_status: 'paid' | 'unpaid' | null;
  return_date: string | null;
  dm_penalty_fee: number;
  before_pickup: boolean;
  set_return_date: string | null;
}

// ---------------------------------------------------------------------------
// Payments (for partial-payment flow)
// ---------------------------------------------------------------------------

export interface Payments {
  id: string;
  order_id: string;
  amount: number;
  payment_status: 'paid' | 'unpaid' | 'refunded';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Delivery Address (as object, lib/features/delivery_module/order/domain/models/order_model.dart)
// ---------------------------------------------------------------------------

export interface DeliveryAddress {
  id: string;
  contact_person_name: string;
  address_type: string;
  address: string;
  road: string | null;
  house: string | null;
  floor: string | null;
  longitude: string | null;
  latitude: string | null;
  phone: string | null;
  email: string | null;
  contact_person_number: string | null;
}

export interface ParcelCategory {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  image_full_url: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  image: string | null;
  image_full_url: string | null;
}

// ---------------------------------------------------------------------------
// Order (lib/features/delivery_module/order/domain/models/order_model.dart)
// ---------------------------------------------------------------------------

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_image: string | null;
  customer?: Customer | null;
  delivery_man_id: string | null;
  delivery_man_name: string | null;
  order_type: 'delivery' | 'take_away' | 'parcel' | 'prescription';
  payment_method:
    | 'cash_on_delivery'
    | 'digital'
    | 'wallet'
    | 'partial_payment'
    | 'offline_payment'
    | 'ssl_commerz';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  order_status:
    | 'pending'
    | 'confirmed'
    | 'accepted'
    | 'processing'
    | 'handover'
    | 'picked_up'
    | 'delivered'
    | 'canceled'
    | 'failed'
    | 'refunded'
    | 'returned';
  total_amount: number;
  delivery_charge: number;
  // V4.0 billing breakdown (optional — populated when available from backend)
  item_price?: number;
  addons_total?: number;
  subtotal?: number;
  coupon_discount_amount?: number;
  total_tax_amount?: number;
  original_delivery_charge?: number;
  charge_payer?: 'customer' | 'vendor' | 'admin' | null;
  module_type?: string;
  delivery_address: DeliveryAddress | string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_address_id?: string | null;
  receiver_details?: DeliveryAddress | null;
  parcel_category?: ParcelCategory | null;
  dm_tips?: number;
  cutlery?: number;
  unavailable_item_note?: string | null;
  delivery_instruction?: string | null;
  order_proof_full_url?: string[] | null;
  payments?: Payments[];
  store_discount_amount?: number;
  tax_status?: 'included' | 'excluded';
  additional_charge?: number;
  is_guest?: number;
  flash_admin_discount_amount?: number;
  flash_store_discount_amount?: number;
  extra_packaging_amount?: number;
  referrer_bonus_amount?: number;
  store_business_model?: 'subscription' | 'commission' | null;
  store_chat_permission?: boolean;
  canceled?: string | null;
  parcel_cancellation?: ParcelCancellation | null;
  bring_change_amount?: number;
  delivery_type?: 'single' | 'multiple' | null;
  delivery_type_charge?: number;
  pro_discount?: number;
  benefit_type?: string | null;
  delivery_offer_type?: string | null;
  delivery_fee_reduction_amount?: number;
  item_campaign_id?: string | null;
  transaction_reference?: string | null;
  delivery_address_text?: string | null; // convenience text for UI
  store_id?: string | null;
  store_name?: string | null;
  store_address?: string | null;
  store_lat?: number | null;
  store_lng?: number | null;
  store_logo_full_url?: string | null;
  store_phone?: string | null;
  details_count?: number;
  order_note?: string | null;
  prescription_order?: boolean;
  order_attachment_full_url?: string[] | null;
  schedule_at?: string | null;
  scheduled?: number;
  items: OrderItem[];
  note: string | null;
  scheduled_at_legacy?: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Notification / Chat
// ---------------------------------------------------------------------------

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'order' | 'message' | 'general' | 'warning' | 'ride' | 'maintenance';
  data: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_image: string | null;
  customer_phone?: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'vendor' | 'customer' | 'delivery_man' | 'rider' | 'admin';
  message: string;
  attachment_url: string | null;
  attachment_type?: 'image' | 'file' | 'video' | null;
  attachment_name?: string | null;
  attachment_size?: number | null;
  is_read: boolean;
  is_from_faq?: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Withdraw / Transaction / Disbursement
// ---------------------------------------------------------------------------

export interface WithdrawMethod {
  id: string;
  vendor_id: string;
  type: 'bank' | 'paypal' | 'stripe' | 'mobile_money' | 'other';
  is_default: boolean;
  fields: Record<string, string>;
  method_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WithdrawRequest {
  id: string;
  vendor_id: string;
  amount: number;
  method_name: string;
  method_fields: Record<string, string>;
  sender_note: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
}

export interface Transaction {
  id: string;
  vendor_id: string;
  type:
    | 'earning'
    | 'withdrawal'
    | 'cash_collected'
    | 'adjustment'
    | 'refund'
    | 'referral_earning'
    | 'loyalty_conversion';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'on_hold';
  method: string | null;
  reference: string | null;
  note: string | null;
  created_at: string;
}

export interface DisbursementReport {
  id: string;
  vendor_id: string;
  period_start: string;
  period_end: string;
  total_earning: number;
  total_withdrawn: number;
  pending_balance: number;
  status: 'pending' | 'paid';
  created_at: string;
}

export interface WalletPayment {
  id: string;
  vendor_id: string;
  amount: number;
  type: 'provided' | 'spent' | 'adjustment';
  reference: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Vehicle / Ride
// ---------------------------------------------------------------------------

export interface Vehicle {
  id: string;
  rider_id: string;
  brand: string;
  model: string;
  category: string; // 'car' | 'bike' | 'truck' | 'bicycle'
  license_plate: string;
  year: number;
  color: string;
  // V4.0 additions (optional)
  fuel_type?: string | null;
  transmission?: string | null;
  body_type?: string | null;
  image_url: string | null;
  vehicle_request_status: 'pending' | 'approved' | 'rejected' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ride {
  id: string;
  rider_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_image: string | null;
  vehicle_id: string;
  vehicle_name: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_address: string;
  destination_latitude: number;
  destination_longitude: number;
  distance: number; // km
  estimated_duration: number; // minutes
  fare: number;
  paid_fare?: number;
  admin_commission?: number;
  coupon_amount?: number;
  discount_amount?: number;
  discount?: number; // legacy alias used by some screens
  tips: number;
  payment_method: 'cash' | 'digital' | 'wallet';
  payment_status: 'unpaid' | 'paid';
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
  otp: string;
  cancellation_reason: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  bid_amount?: number | null; // bid-on-fare
  is_bidding?: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Income Statements (lib/features/my_account/domain/models/delivery_income_statement_model.dart)
// ---------------------------------------------------------------------------

export interface DeliveryIncomeStatement {
  id: string;
  vendor_id: string;
  order_id: string;
  original_delivery_charge: number;
  delivery_fee_comission: number;
  dm_tips: number;
  created_at: string;
}

export interface RideIncomeStatement {
  id: string;
  rider_id: string;
  ride_id: string;
  paid_fare: number;
  admin_commission: number;
  coupon_amount: number;
  discount_amount: number;
  created_at: string;
}

export interface EarningReportFilters {
  type?: 'delivery' | 'ride' | 'tip' | 'referral' | 'loyalty';
  dateRange?: 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  offset?: number;
  limit?: number;
}

export interface EarningReport {
  id: string;
  vendor_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  period_label: string;
  total_earning: number;
  delivery_fee_earned: number;
  delivery_tips_earned: number;
  ride_income: number;
  referral_earning: number;
  total_rides: number;
  total_orders: number;
  created_at: string;
}

export interface ReferralEarning {
  id: string;
  vendor_id: string;
  referred_user_id: string;
  referred_user_name: string;
  referred_user_image: string | null;
  amount: number;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  total_earning: number;
  pending_earning: number;
}

export interface LeaderboardEntry {
  id: string;
  rider_id: string;
  rider_name: string;
  rider_image: string | null;
  total_rides: number;
  total_earning: number;
  rating: number;
  rank: number;
  level: number;
}

export interface Review {
  id: string;
  ride_id: string | null;
  order_id: string | null;
  customer_id: string;
  customer_name: string;
  customer_image: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface SafetyAlert {
  id: string;
  rider_id: string;
  ride_id: string | null;
  reason: string;
  status: 'pending' | 'solved' | 'cancelled';
  other_contact: string | null;
  created_at: string;
}

export interface Trip {
  id: string;
  rider_id: string;
  ride_id: string | null;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  distance_km: number;
  created_at: string;
}

export interface LoyaltyPoint {
  id: string;
  vendor_id: string;
  points: number;
  type: 'earned' | 'spent';
  reference: string;
  created_at: string;
}

export interface LevelInfo {
  current_level: {
    id: string;
    name: string;
    min_rides: number;
    reward: number;
  };
  next_level: {
    id: string;
    name: string;
    min_rides: number;
    reward: number;
  } | null;
  progress: number; // 0-100
  total_rides: number;
}

export interface VehicleBrand {
  id: string;
  name: string;
  image: string | null;
}

export interface VehicleCategory {
  id: string;
  name: string;
  type: 'car' | 'bike' | 'truck' | 'bicycle';
  image: string | null;
}

export interface CancellationReason {
  id: string;
  reason: string;
  type: 'order' | 'ride' | 'parcel';
}

export interface SafetyReason {
  id: string;
  reason: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export interface Precaution {
  id: string;
  title: string;
  description: string;
  image: string | null;
}

export interface LanguageModel {
  imageUrl: number;
  languageName: string;
  countryCode: string;
  languageCode: string;
}

export interface NotificationBody {
  type: string;
  orderId?: number;
  conversationId?: number;
  rideId?: number;
  isParcel?: boolean;
}
