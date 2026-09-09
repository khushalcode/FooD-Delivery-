/**
 * App Constants — mirrors lib/util/app_constants.dart from the Flutter V4.0 delivery app.
 *
 * Vendor variant: adapted for store/vendor use cases with Supabase backend. API URIs
 * from the Flutter source are kept here as documentation for parity with the V4.0 spec;
 * the RN port talks to Supabase directly instead, but having them inline keeps the
 * constants file a faithful mirror of the Flutter source.
 */

import { AppMode } from './enums';

export const AppConstants = {
  appName: 'FoodHub Driver',
  appVersion: 4.0,

  // App mode: 'delivery' (orders) or 'ride' (ride-share module)
  appMode: AppMode.delivery,

  fontFamily: 'Roboto',

  // Base URL (kept for parity; the RN port uses Supabase instead of this REST base)
  baseUrl: 'https://foodhub-admin.6amtech.com',
  polylineMapKey: 'YOUR_MAP_KEY_HERE',

  // ---- Shared Key (parity with Flutter V4.0) ----
  theme: 'sixam_mart_delivery_theme',
  token: 'sixam_mart_delivery_token',
  countryCode: 'sixam_mart_delivery_country_code',
  languageCode: 'sixam_mart_delivery_language_code',
  cacheCountryCode: 'cache_country_code',
  cacheLanguageCode: 'cache_language_code',
  userPassword: 'sixam_mart_delivery_user_password',
  userAddress: 'sixam_mart_delivery_user_address',
  userNumber: 'sixam_mart_delivery_user_number',
  userCountryDialCode: 'sixam_mart_delivery_user_country_dial_code',
  userCountryCode: 'sixam_mart_delivery_user_country_code',
  notification: 'sixam_mart_delivery_notification',
  notificationCount: 'sixam_mart_delivery_notification_count',
  ignoreList: 'sixam_mart_delivery_ignore_list',
  localizationKey: 'X-localization',
  langIntro: 'language_intro',
  notificationIdList: 'notification_id_list',

  // ---- RN port storage keys (vendor variants used by existing screens) ----
  themeKey: 'vendor_app_theme',
  tokenKey: 'vendor_app_token',
  countryCodeKey: 'vendor_app_country_code',
  languageCodeKey: 'vendor_app_language_code',
  cacheCountryCodeKey: 'cache_country_code',
  cacheLanguageCodeKey: 'cache_language_code',
  userPasswordKey: 'vendor_app_user_password',
  userAddressKey: 'vendor_app_user_address',
  userNumberKey: 'vendor_app_user_number',
  userCountryDialCodeKey: 'vendor_app_user_country_dial_code',
  userCountryCodeKey: 'vendor_app_user_country_code',
  notificationKey: 'vendor_app_notification',
  notificationCountKey: 'vendor_app_notification_count',
  ignoreListKey: 'vendor_app_ignore_list',
  langIntroKey: 'language_intro',
  notificationIdListKey: 'notification_id_list',

  // ---- FCM Topics (parity with Flutter V4.0) ----
  topicDeliveryman: 'all_zone_delivery_man',
  topicRider: 'all_zone_rider',
  zoneTopic: 'zone_topic',
  vehicleWiseTopic: 'vehicle_wise_topic',

  // ---- Maintenance mode flags (parity with Flutter V4.0) ----
  maintenanceModeDeliveryMan: 'maintenance_mode_deliveryman_app',
  maintenanceModeRider: 'maintenance_mode_rider_app',

  // ---- Order statuses (Flutter V4.0) ----
  pending: 'pending',
  confirmed: 'confirmed',
  accepted: 'accepted',
  processing: 'processing',
  handover: 'handover',
  pickedUp: 'picked_up',
  delivered: 'delivered',
  canceled: 'canceled',
  failed: 'failed',
  refunded: 'refunded',
  returned: 'returned',

  // ---- Ride statuses (Flutter V4.0) ----
  outForPickup: 'out_for_pickup',
  ongoing: 'ongoing',
  completed: 'completed',
  cancelled: 'cancelled',
  parcel: 'parcel',
  unPaid: 'unpaid',
  paid: 'paid',
  findingRider: 'findingRider',
  initial: 'initial',
  riseFare: 'riseFare',
  pickUpRide: 'pickUpRide',
  afterAcceptRider: 'afterAcceptRider',
  otpSend: 'otpSent',
  ongoingRide: 'ongoingRide',
  completeRide: 'completeRide',
  sender: 'sender',
  scheduleRequest: 'scheduled_request',
  cacheZoneId: 'cache_zone_id',

  // ---- Roles ----
  user: 'user',
  customer: 'customer',
  deliveryMan: 'delivery_man',
  vendor: 'vendor',
  admin: 'admin',
  rider: 'rider',

  // ---- Map ----
  mapZoom: 20,
} as const;

export type OrderStatus =
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

export type RideStatus =
  | 'pending'
  | 'accepted'
  | 'out_for_pickup'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export type UserRole = 'user' | 'customer' | 'delivery_man' | 'vendor' | 'rider' | 'admin';
