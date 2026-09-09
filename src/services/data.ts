/**
 * Data services — wrap Supabase queries for each domain.
 * V4.0 includes: orders, notifications, conversations, chat, withdraw methods,
 * transactions, disbursement, rides, vehicles, earning reports, referral earnings,
 * leaderboard, reviews, safety alerts, trips, loyalty points.
 *
 * If Supabase is not configured, fall back to mock data so screens can render.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  Order,
  NotificationItem,
  Conversation,
  ChatMessage,
  WithdrawMethod,
  Transaction,
  VendorProfile,
  DisbursementReport,
  Ride,
  Vehicle,
  EarningReport,
  ReferralEarning,
  ReferralStats,
  LeaderboardEntry,
  Review,
  SafetyAlert,
  Trip,
  LoyaltyPoint,
  LevelInfo,
  VehicleBrand,
  VehicleCategory,
  CancellationReason,
  SafetyReason,
  EmergencyContact,
  Precaution,
} from '@/types';

// ---------- Mock data (used when Supabase is not configured) ----------
const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001',
    order_number: '#ORD-2024-001',
    customer_id: 'cust-1',
    customer_name: 'John Doe',
    customer_phone: '+1 555-1234',
    customer_image: null,
    delivery_man_id: 'dm-1',
    delivery_man_name: 'Mike Rider',
    order_type: 'delivery',
    payment_method: 'cash_on_delivery',
    payment_status: 'unpaid',
    order_status: 'pending',
    total_amount: 245.5,
    delivery_charge: 25,
    items: [
      {
        id: 'item-1',
        order_id: 'ord-001',
        product_id: 'p-1',
        product_name: 'Margherita Pizza',
        product_image: null,
        price: 180,
        quantity: 1,
        variant: 'Large',
        add_ons: [{ name: 'Extra Cheese', price: 30 }],
        total: 210,
      },
      {
        id: 'item-2',
        order_id: 'ord-001',
        product_id: 'p-2',
        product_name: 'Garlic Bread',
        product_image: null,
        price: 30,
        quantity: 1,
        variant: null,
        add_ons: [],
        total: 30,
      },
    ],
    delivery_address: '123 Main St, Springfield, IL',
    delivery_latitude: 39.7817,
    delivery_longitude: -89.6501,
    note: 'Ring the doorbell',
    schedule_at: null,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ord-002',
    order_number: '#ORD-2024-002',
    customer_id: 'cust-2',
    customer_name: 'Sarah Smith',
    customer_phone: '+1 555-5678',
    customer_image: null,
    delivery_man_id: null,
    delivery_man_name: null,
    order_type: 'take_away',
    payment_method: 'digital',
    payment_status: 'paid',
    order_status: 'confirmed',
    total_amount: 89.0,
    delivery_charge: 0,
    items: [
      {
        id: 'item-3',
        order_id: 'ord-002',
        product_id: 'p-3',
        product_name: 'Veg Burger',
        product_image: null,
        price: 89,
        quantity: 1,
        variant: 'Medium',
        add_ons: [],
        total: 89,
      },
    ],
    delivery_address: null,
    delivery_latitude: null,
    delivery_longitude: null,
    note: null,
    schedule_at: null,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_RIDES: Ride[] = [
  {
    id: 'ride-001',
    rider_id: 'demo-vendor',
    customer_id: 'cust-1',
    customer_name: 'John Doe',
    customer_phone: '+1 555-1234',
    customer_image: null,
    vehicle_id: 'veh-1',
    vehicle_name: 'Toyota Camry',
    pickup_address: '123 Main St',
    pickup_latitude: 37.7749,
    pickup_longitude: -122.4194,
    destination_address: '456 Market St',
    destination_latitude: 37.7849,
    destination_longitude: -122.4094,
    distance: 2.5,
    estimated_duration: 12,
    fare: 18.5,
    discount: 0,
    tips: 0,
    payment_method: 'cash',
    payment_status: 'unpaid',
    status: 'pending',
    otp: '1234',
    cancellation_reason: null,
    scheduled_at: null,
    started_at: null,
    completed_at: null,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    rider_id: 'demo-vendor',
    brand: 'Toyota',
    model: 'Camry',
    category: 'car',
    license_plate: 'ABC-1234',
    year: 2022,
    color: 'White',
    image_url: null,
    vehicle_request_status: 'approved',
    is_active: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Order Received',
    description: 'You have received a new order #ORD-2024-001',
    type: 'order',
    data: { order_id: 'ord-001' },
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'n2',
    title: 'Payment Received',
    description: 'Payment of ₹245.50 received for order #ORD-2024-001',
    type: 'general',
    data: null,
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'n3',
    title: 'New Message',
    description: 'John Doe sent you a message',
    type: 'message',
    data: { conversation_id: 'c1' },
    is_read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    customer_id: 'cust-1',
    customer_name: 'John Doe',
    customer_image: null,
    last_message: 'Hello, when will my order arrive?',
    last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unread_count: 2,
  },
  {
    id: 'c2',
    customer_id: 'cust-2',
    customer_name: 'Sarah Smith',
    customer_image: null,
    last_message: 'Thanks for the quick delivery!',
    last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread_count: 0,
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    vendor_id: 'demo-vendor',
    type: 'earning',
    amount: 245.5,
    status: 'completed',
    method: null,
    reference: 'ORD-2024-001',
    note: 'Order earning',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 't2',
    vendor_id: 'demo-vendor',
    type: 'withdrawal',
    amount: 500,
    status: 'pending',
    method: 'bank',
    reference: 'WDR-2024-005',
    note: 'Bank withdrawal',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 't3',
    vendor_id: 'demo-vendor',
    type: 'cash_collected',
    amount: 320.5,
    status: 'completed',
    method: 'cash_on_delivery',
    reference: 'ORD-2024-001',
    note: 'Cash collected from customer',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 't4',
    vendor_id: 'demo-vendor',
    type: 'referral_earning',
    amount: 50,
    status: 'completed',
    method: null,
    reference: 'REF-2024-001',
    note: 'Referral bonus for Sarah Smith',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_WITHDRAW_METHODS: WithdrawMethod[] = [
  {
    id: 'wm1',
    vendor_id: 'demo-vendor',
    type: 'bank',
    is_default: true,
    fields: {
      account_name: 'Demo Vendor',
      account_number: '****4567',
      bank_name: 'HDFC Bank',
      ifsc: 'HDFC0001234',
    },
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wm2',
    vendor_id: 'demo-vendor',
    type: 'paypal',
    is_default: false,
    fields: { email: 'vendor@paypal.com' },
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_EARNING_REPORTS: EarningReport[] = [
  {
    id: 'er1',
    vendor_id: 'demo-vendor',
    period: 'daily',
    period_label: 'Today',
    total_earning: 245.5,
    delivery_fee_earned: 200,
    delivery_tips_earned: 25,
    ride_income: 0,
    referral_earning: 20.5,
    total_rides: 0,
    total_orders: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'er2',
    vendor_id: 'demo-vendor',
    period: 'weekly',
    period_label: 'This Week',
    total_earning: 1820.75,
    delivery_fee_earned: 1400,
    delivery_tips_earned: 180,
    ride_income: 0,
    referral_earning: 240.75,
    total_rides: 0,
    total_orders: 22,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'er3',
    vendor_id: 'demo-vendor',
    period: 'monthly',
    period_label: 'This Month',
    total_earning: 7540.25,
    delivery_fee_earned: 5800,
    delivery_tips_earned: 720,
    ride_income: 0,
    referral_earning: 1020.25,
    total_rides: 0,
    total_orders: 95,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_REFERRALS: ReferralEarning[] = [
  {
    id: 'ref1',
    vendor_id: 'demo-vendor',
    referred_user_id: 'cust-2',
    referred_user_name: 'Sarah Smith',
    referred_user_image: null,
    amount: 50,
    status: 'completed',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ref2',
    vendor_id: 'demo-vendor',
    referred_user_id: 'cust-3',
    referred_user_name: 'Mike Johnson',
    referred_user_image: null,
    amount: 50,
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb1',
    rider_id: 'r1',
    rider_name: 'Alex Turner',
    rider_image: null,
    total_rides: 245,
    total_earning: 4520.5,
    rating: 4.9,
    rank: 1,
    level: 5,
  },
  {
    id: 'lb2',
    rider_id: 'r2',
    rider_name: 'Maria Garcia',
    rider_image: null,
    total_rides: 210,
    total_earning: 4100,
    rating: 4.8,
    rank: 2,
    level: 5,
  },
  {
    id: 'lb3',
    rider_id: 'demo-vendor',
    rider_name: 'Demo Vendor',
    rider_image: null,
    total_rides: 180,
    total_earning: 3650,
    rating: 4.7,
    rank: 3,
    level: 4,
  },
];

const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev1',
    ride_id: null,
    order_id: 'ord-001',
    customer_id: 'cust-1',
    customer_name: 'John Doe',
    customer_image: null,
    rating: 5,
    comment: 'Excellent service! Very fast delivery.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev2',
    ride_id: null,
    order_id: 'ord-002',
    customer_id: 'cust-2',
    customer_name: 'Sarah Smith',
    customer_image: null,
    rating: 4,
    comment: 'Good service, but took a bit long.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ---------- Orders service ----------
// UNIFIED: orders are filtered by delivery_man_id (the logged-in DM), not vendor_id.
// Order details live in the admin panel's `order_details` table (not `order_items`).
export async function fetchCurrentOrders(deliveryManId: string): Promise<Order[]> {
  if (!isSupabaseConfigured) return MOCK_ORDERS;
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_details(*), stores(id, name, logo, address, phone)')
    .eq('delivery_man_id', deliveryManId)
    .in('order_status', ['pending', 'confirmed', 'processing', 'handover', 'picked_up'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapOrderRow);
}

export async function fetchLatestOrders(deliveryManId: string, limit = 5): Promise<Order[]> {
  if (!isSupabaseConfigured) return MOCK_ORDERS.slice(0, limit);
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_details(*), stores(id, name, logo, address, phone)')
    .eq('delivery_man_id', deliveryManId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(mapOrderRow);
}

export async function fetchAllOrders(deliveryManId: string): Promise<Order[]> {
  if (!isSupabaseConfigured) return MOCK_ORDERS;
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_details(*), stores(id, name, logo, address, phone)')
    .eq('delivery_man_id', deliveryManId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapOrderRow);
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  if (!isSupabaseConfigured) return MOCK_ORDERS.find((o) => o.id === orderId) || MOCK_ORDERS[0];
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_details(*), stores(id, name, logo, address, phone)')
    .eq('id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrderRow(data) : null;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['order_status']
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('orders')
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

// Map an admin panel `orders` row to the Order shape used by this app.
function mapOrderRow(row: any): Order {
  const details = row.items || row.order_details || [];
  const store = row.stores;
  return {
    id: String(row.id),
    order_number: row.order_code || `#${row.id}`,
    customer_id: String(row.user_id ?? ''),
    customer_name: '',
    customer_phone: '',
    customer_image: null,
    delivery_man_id: row.delivery_man_id ? String(row.delivery_man_id) : null,
    delivery_man_name: null,
    order_type: row.order_type || 'delivery',
    payment_method: row.payment_method === 'cash_on_delivery' ? 'cash_on_delivery' : 'digital',
    payment_status: row.payment_status || 'unpaid',
    order_status: row.order_status || 'pending',
    total_amount: Number(row.order_amount ?? 0),
    delivery_charge: Number(row.additional_charge ?? 0),
    delivery_address: row.delivery_address ?? '',
    delivery_latitude: null,
    delivery_longitude: null,
    store_id: row.store_id ? String(row.store_id) : null,
    store_name: store?.name ?? null,
    store_address: store?.address ?? null,
    store_logo_full_url: store?.logo ?? null,
    store_phone: store?.phone ?? null,
    dm_tips: Number(row.dm_tips ?? 0),
    items: details.map((d: any) => ({
      id: String(d.id),
      order_id: String(d.order_id),
      product_id: String(d.item_id ?? ''),
      product_name: d.item_details?.name ?? '',
      product_image: d.item_details?.image_url ?? null,
      price: Number(d.price ?? 0),
      quantity: Number(d.quantity ?? 1),
      variant: null,
      add_ons: [],
      total: Number(d.price ?? 0) * Number(d.quantity ?? 1),
    })),
    note: null,
    scheduled_at: row.schedule_at ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  } as Order;
}

// ---------- Notifications service ----------
export async function fetchNotifications(vendorId: string): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured) return MOCK_NOTIFICATIONS;
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as NotificationItem[];
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

// ---------- Conversations / Chat ----------
export async function fetchConversations(vendorId: string): Promise<Conversation[]> {
  if (!isSupabaseConfigured) return MOCK_CONVERSATIONS;
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Conversation[];
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: 'm1',
        conversation_id: conversationId,
        sender_id: 'cust-1',
        sender_type: 'customer',
        message: 'Hello, when will my order arrive?',
        attachment_url: null,
        is_read: true,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'm2',
        conversation_id: conversationId,
        sender_id: 'demo-vendor',
        sender_type: 'vendor',
        message: 'Hi! Your order is being prepared and will arrive in about 30 minutes.',
        attachment_url: null,
        is_read: true,
        created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
    ];
  }
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as ChatMessage[];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<ChatMessage | null> {
  if (!isSupabaseConfigured) {
    return {
      id: 'local-' + Date.now(),
      conversation_id: conversationId,
      sender_id: senderId,
      sender_type: 'vendor',
      message: text,
      attachment_url: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_type: 'vendor',
      message: text,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ChatMessage;
}

// ---------- Withdraw Methods ----------
export async function fetchWithdrawMethods(vendorId: string): Promise<WithdrawMethod[]> {
  if (!isSupabaseConfigured) return MOCK_WITHDRAW_METHODS;
  const { data, error } = await supabase
    .from('withdraw_methods')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as WithdrawMethod[];
}

export async function addWithdrawMethod(
  method: Omit<WithdrawMethod, 'id' | 'created_at' | 'updated_at'>
): Promise<WithdrawMethod | null> {
  if (!isSupabaseConfigured) {
    return {
      ...method,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase
    .from('withdraw_methods')
    .insert(method)
    .select()
    .single();
  if (error) throw error;
  return data as WithdrawMethod;
}

export async function deleteWithdrawMethod(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('withdraw_methods').delete().eq('id', id);
}

export async function makeDefaultWithdrawMethod(
  vendorId: string,
  methodId: string
): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('withdraw_methods').update({ is_default: false }).eq('vendor_id', vendorId);
  await supabase.from('withdraw_methods').update({ is_default: true }).eq('id', methodId);
}

// ---------- Transactions ----------
export async function fetchTransactions(vendorId: string): Promise<Transaction[]> {
  if (!isSupabaseConfigured) return MOCK_TRANSACTIONS;
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Transaction[];
}

export async function requestWithdraw(
  vendorId: string,
  amount: number,
  methodId: string
): Promise<Transaction | null> {
  if (!isSupabaseConfigured) {
    return {
      id: 'local-' + Date.now(),
      vendor_id: vendorId,
      type: 'withdrawal',
      amount,
      status: 'pending',
      method: methodId,
      reference: 'WDR-' + Date.now(),
      note: 'Withdrawal request',
      created_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      vendor_id: vendorId,
      type: 'withdrawal',
      amount,
      status: 'pending',
      method: methodId,
      note: 'Withdrawal request',
    })
    .select()
    .single();
  if (error) throw error;
  return data as Transaction;
}

// ---------- Disbursement ----------
export async function fetchDisbursementReports(vendorId: string): Promise<DisbursementReport[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: 'dr1',
        vendor_id: vendorId,
        period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
        total_earning: 1250.5,
        total_withdrawn: 500,
        pending_balance: 750.5,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ];
  }
  const { data, error } = await supabase
    .from('disbursement_reports')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as DisbursementReport[];
}

// ---------- Earning Reports ----------
export async function fetchEarningReports(vendorId: string): Promise<EarningReport[]> {
  if (!isSupabaseConfigured) return MOCK_EARNING_REPORTS;
  const { data, error } = await supabase
    .from('earning_reports')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as EarningReport[];
}

// ---------- Referral Earnings ----------
export async function fetchReferralEarnings(vendorId: string): Promise<ReferralEarning[]> {
  if (!isSupabaseConfigured) return MOCK_REFERRALS;
  const { data, error } = await supabase
    .from('referral_earnings')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ReferralEarning[];
}

export async function fetchReferralStats(vendorId: string): Promise<ReferralStats> {
  if (!isSupabaseConfigured) {
    return {
      referral_code: 'DEMO500',
      total_referrals: MOCK_REFERRALS.length,
      total_earning: MOCK_REFERRALS.reduce((s, r) => s + r.amount, 0),
      pending_earning: MOCK_REFERRALS.filter((r) => r.status === 'pending').reduce(
        (s, r) => s + r.amount,
        0
      ),
    };
  }
  const { data, error } = await supabase
    .from('referral_stats')
    .select('*')
    .eq('vendor_id', vendorId)
    .maybeSingle();
  if (error) throw error;
  return (data as ReferralStats) || {
    referral_code: '',
    total_referrals: 0,
    total_earning: 0,
    pending_earning: 0,
  };
}

// ---------- Rides ----------
export async function fetchPendingRides(riderId: string): Promise<Ride[]> {
  if (!isSupabaseConfigured) return MOCK_RIDES.filter((r) => r.status === 'pending');
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('rider_id', riderId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Ride[];
}

export async function fetchOngoingRides(riderId: string): Promise<Ride[]> {
  if (!isSupabaseConfigured) return MOCK_RIDES.filter((r) => ['accepted', 'ongoing'].includes(r.status));
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('rider_id', riderId)
    .in('status', ['accepted', 'ongoing'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Ride[];
}

export async function fetchAllRides(riderId: string): Promise<Ride[]> {
  if (!isSupabaseConfigured) return MOCK_RIDES;
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Ride[];
}

export async function fetchRideById(rideId: string): Promise<Ride | null> {
  if (!isSupabaseConfigured) return MOCK_RIDES.find((r) => r.id === rideId) || MOCK_RIDES[0];
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .maybeSingle();
  if (error) throw error;
  return (data as Ride) || null;
}

export async function updateRideStatus(rideId: string, status: Ride['status']): Promise<void> {
  if (!isSupabaseConfigured) return;
  const updates: any = { status, updated_at: new Date().toISOString() };
  if (status === 'ongoing') updates.started_at = new Date().toISOString();
  if (status === 'completed') updates.completed_at = new Date().toISOString();
  const { error } = await supabase.from('rides').update(updates).eq('id', rideId);
  if (error) throw error;
}

export async function acceptRide(rideId: string, riderId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('rides')
    .update({
      status: 'accepted',
      rider_id: riderId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rideId);
  if (error) throw error;
}

// ---------- Vehicles ----------
export async function fetchVehicles(riderId: string): Promise<Vehicle[]> {
  if (!isSupabaseConfigured) return MOCK_VEHICLES;
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Vehicle[];
}

export async function addVehicle(
  vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>
): Promise<Vehicle | null> {
  if (!isSupabaseConfigured) {
    return {
      ...vehicle,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase.from('vehicles').insert(vehicle).select().single();
  if (error) throw error;
  return data as Vehicle;
}

export async function updateVehicle(id: string, patch: Partial<Vehicle>): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('vehicles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteVehicle(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('vehicles').delete().eq('id', id);
}

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
  const { data, error } = await supabase.from('vehicle_brands').select('*').order('name');
  if (error) throw error;
  return (data || []) as VehicleBrand[];
}

export async function fetchVehicleCategories(): Promise<VehicleCategory[]> {
  if (!isSupabaseConfigured) {
    return [
      { id: 'c1', name: 'Car', type: 'car', image: null },
      { id: 'c2', name: 'Motorcycle', type: 'bike', image: null },
      { id: 'c3', name: 'Bicycle', type: 'bicycle', image: null },
      { id: 'c4', name: 'Truck', type: 'truck', image: null },
    ];
  }
  const { data, error } = await supabase.from('vehicle_categories').select('*').order('name');
  if (error) throw error;
  return (data || []) as VehicleCategory[];
}

// ---------- Leaderboard ----------
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured) return MOCK_LEADERBOARD;
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })
    .limit(50);
  if (error) throw error;
  return (data || []) as LeaderboardEntry[];
}

// ---------- Reviews ----------
export async function fetchReviews(vendorId: string): Promise<Review[]> {
  if (!isSupabaseConfigured) return MOCK_REVIEWS;
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Review[];
}

// ---------- Safety Alerts ----------
export async function fetchSafetyAlerts(riderId: string): Promise<SafetyAlert[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('safety_alerts')
    .select('*')
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as SafetyAlert[];
}

export async function createSafetyAlert(
  alert: Omit<SafetyAlert, 'id' | 'created_at'>
): Promise<SafetyAlert | null> {
  if (!isSupabaseConfigured) {
    return {
      ...alert,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase.from('safety_alerts').insert(alert).select().single();
  if (error) throw error;
  return data as SafetyAlert;
}

export async function fetchSafetyReasons(): Promise<SafetyReason[]> {
  if (!isSupabaseConfigured) {
    return [
      { id: 's1', reason: 'Feel unsafe' },
      { id: 's2', reason: 'Customer behaving aggressively' },
      { id: 's3', reason: 'Vehicle breakdown' },
      { id: 's4', reason: 'Accident' },
      { id: 's5', reason: 'Other emergency' },
    ];
  }
  const { data, error } = await supabase.from('safety_reasons').select('*');
  if (error) throw error;
  return (data || []) as SafetyReason[];
}

export async function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  if (!isSupabaseConfigured) {
    return [
      { id: 'e1', name: 'Police', phone: '911' },
      { id: 'e2', name: 'Ambulance', phone: '911' },
      { id: 'e3', name: 'Customer Support', phone: '+1-800-123-4567' },
    ];
  }
  const { data, error } = await supabase.from('emergency_contacts').select('*');
  if (error) throw error;
  return (data || []) as EmergencyContact[];
}

export async function fetchPrecautions(): Promise<Precaution[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: 'p1',
        title: 'Always share trip details',
        description: 'Share your trip details with family or friends before starting a ride.',
        image: null,
      },
      {
        id: 'p2',
        title: 'Verify OTP before starting',
        description: 'Always verify the OTP provided by the customer before starting the ride.',
        image: null,
      },
      {
        id: 'p3',
        title: 'Follow traffic rules',
        description: 'Always follow traffic rules and speed limits for your safety.',
        image: null,
      },
    ];
  }
  const { data, error } = await supabase.from('precautions').select('*');
  if (error) throw error;
  return (data || []) as Precaution[];
}

// ---------- Trips ----------
export async function fetchTrips(riderId: string): Promise<Trip[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Trip[];
}

// ---------- Loyalty Points ----------
export async function fetchLoyaltyPoints(vendorId: string): Promise<LoyaltyPoint[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as LoyaltyPoint[];
}

export async function convertLoyaltyPoints(
  vendorId: string,
  points: number
): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('loyalty_points').insert({
    vendor_id: vendorId,
    points: -points,
    type: 'spent',
    reference: 'Converted to balance',
  });
}

// ---------- Level Info ----------
export async function fetchLevelInfo(riderId: string): Promise<LevelInfo | null> {
  if (!isSupabaseConfigured) {
    return {
      current_level: { id: 'l4', name: 'Gold', min_rides: 100, reward: 100 },
      next_level: { id: 'l5', name: 'Platinum', min_rides: 200, reward: 250 },
      progress: 75,
      total_rides: 150,
    };
  }
  const { data, error } = await supabase
    .from('level_info')
    .select('*')
    .eq('rider_id', riderId)
    .maybeSingle();
  if (error) throw error;
  return (data as LevelInfo) || null;
}

// ---------- Cancellation Reasons ----------
export async function fetchCancellationReasons(type: 'order' | 'ride' | 'parcel'): Promise<CancellationReason[]> {
  if (!isSupabaseConfigured) {
    return [
      { id: 'cr1', reason: 'Customer not available', type },
      { id: 'cr2', reason: 'Wrong address', type },
      { id: 'cr3', reason: 'Unable to reach location', type },
      { id: 'cr4', reason: 'Other', type },
    ];
  }
  const { data, error } = await supabase
    .from('cancellation_reasons')
    .select('*')
    .eq('type', type);
  if (error) throw error;
  return (data || []) as CancellationReason[];
}

// ---------- Profile ----------
export async function fetchVendorProfile(userId: string): Promise<VendorProfile | null> {
  // Look up the delivery_men row that matches the auth user's email
  if (!isSupabaseConfigured) return null;
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user?.email) return null;
  const { data, error } = await supabase
    .from('delivery_men')
    .select('*')
    .eq('email', userData.user.email)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: String(data.id),
    auth_user_id: userId,
    store_name: `${data.f_name || ''} ${data.l_name || ''}`.trim() || 'Delivery Man',
    owner_name: `${data.f_name || ''} ${data.l_name || ''}`.trim(),
    email: data.email ?? '',
    phone: data.phone ?? '',
    country_code: 'US',
    dial_code: '+1',
    address: '',
    latitude: null,
    longitude: null,
    logo_url: data.image ?? null,
    cover_url: null,
    image_full_url: data.image ?? null,
    balance: Number(data.earning ?? 0),
    cash_in_hand: 0,
    cash_in_hands: 0,
    total_earning: Number(data.earning ?? 0),
    total_withdrawn: 0,
    pending_balance: 0,
    active: Boolean(data.active),
    earnings_visible: true,
    earnings: 1,
    is_approved: data.application_status === 'approved',
    type: data.type || 'delivery_man',
    order_count: Number(data.order_count ?? 0),
    total_rides: 0,
    avg_rating: 0,
    rating_count: 0,
    member_since_days: 0,
    level: 1,
    loyalty_points: Number(data.loyalty_point ?? 0),
    vehicle: null,
    fcm_token: null,
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? new Date().toISOString(),
  } as VendorProfile;
}

export async function updateVendorActiveStatus(
  vendorId: string,
  active: boolean
): Promise<void> {
  if (!isSupabaseConfigured) return;
  // vendorId is actually the delivery_men.id (bigint) — match by id
  const { error } = await supabase
    .from('delivery_men')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', vendorId);
  if (error) throw error;
}

// Alias for screens that pass deliveryManId instead of vendorId
export const fetchDeliveryManProfile = fetchVendorProfile;
export const updateDeliveryManActiveStatus = updateVendorActiveStatus;
