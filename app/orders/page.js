"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const STATUS_CONFIG = {
  pending:    { label: 'অপেক্ষমান',     color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  confirmed:  { label: 'প্রক্রিয়াধীন',  color: 'bg-blue-100 text-blue-700 border-blue-200' },
  processing: { label: 'প্রক্রিয়াধীন',  color: 'bg-blue-100 text-blue-700 border-blue-200' },
  shipped:    { label: 'পাঠানো হয়েছে',  color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  delivered:  { label: 'ডেলিভারি হয়েছে', color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled:  { label: 'বাতিল',          color: 'bg-red-100 text-red-700 border-red-200' },
};

// ─── Timeline steps ───────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { value: 'pending',   label: 'অর্ডার দেওয়া হয়েছে', sub: 'আমরা আপনার অর্ডার পেয়েছি',         icon: '📋' },
  { value: 'confirmed', label: 'প্রক্রিয়াধীন',        sub: 'আপনার অর্ডার প্রস্তুত করা হচ্ছে',   icon: '⚙️' },
  { value: 'shipped',   label: 'মাল পাঠানো হয়েছে',   sub: 'পণ্য রওনা দিয়েছে',                  icon: '🚚' },
  { value: 'delivered', label: 'ডেলিভারি সম্পন্ন',   sub: 'পণ্য পৌঁছে গেছে',                   icon: '✅' },
];
const STEP_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];
// map processing → confirmed for timeline display
const normalizeStatus = (s) => s === 'processing' ? 'confirmed' : s;

function getStepIndex(status) {
  const idx = STEP_ORDER.indexOf(normalizeStatus(status));
  return idx === -1 ? 0 : idx;
}

// ─── Tracking Timeline (inline inside expanded card) ─────────────────────────
function TrackingTimeline({ status }) {
  const currentIdx = getStepIndex(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-semibold text-red-700 text-sm">অর্ডার বাতিল করা হয়েছে</p>
          <p className="text-xs text-red-400 mt-0.5">এই অর্ডারটি বাতিল হয়েছে</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">অর্ডার ট্র্যাকিং</p>
      <div>
        {TIMELINE_STEPS.map((step, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;
          const isLast = idx === TIMELINE_STEPS.length - 1;

          return (
            <div key={step.value} className="flex gap-3">
              {/* Icon + line */}
              <div className="flex flex-col items-center" style={{ width: 36, flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isCurrent ? 16 : 14,
                  background: isCurrent ? '#f59e0b' : isDone ? '#10b981' : '#f3f4f6',
                  border: isCurrent ? '2.5px solid #fcd34d' : isDone ? '2.5px solid #6ee7b7' : '2.5px solid #e5e7eb',
                  boxShadow: isCurrent ? '0 0 0 3px rgba(245,158,11,0.15)' : isDone ? '0 0 0 3px rgba(16,185,129,0.1)' : 'none',
                  color: isPending ? '#9ca3af' : '#fff',
                  fontWeight: 700,
                  transition: 'all 0.3s',
                  flexShrink: 0,
                }}>
                  {isPending ? (idx + 1) : (isDone && !isCurrent ? '✓' : step.icon)}
                </div>
                {!isLast && (
                  <div style={{
                    width: 3, flex: 1, minHeight: 24,
                    background: idx < currentIdx ? '#10b981' : '#e5e7eb',
                    margin: '3px 0', borderRadius: 2,
                  }} />
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                <p style={{
                  fontWeight: 700, fontSize: 13,
                  color: isPending ? '#9ca3af' : '#111827',
                  marginBottom: 1,
                }}>
                  {step.label}
                  {isCurrent && (
                    <span style={{
                      marginLeft: 8, fontSize: 10, fontWeight: 700,
                      background: '#fef3c7', color: '#92400e',
                      padding: '1px 7px', borderRadius: 20,
                    }}>বর্তমান</span>
                  )}
                </p>
                <p style={{ fontSize: 11, color: isPending ? '#d1d5db' : '#6b7280' }}>
                  {isPending ? 'অপেক্ষমান' : step.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onExpand, expanded, isNew }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const date = new Date(order.created_at);
  const dateStr = date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 ${
      isNew ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-100'
    }`}>
      {/* New order banner */}
      {isNew && (
        <div className="bg-green-500 text-white text-xs font-bold text-center py-1.5 tracking-wide">
          ✓ অর্ডার সফলভাবে দেওয়া হয়েছে
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono text-gray-400">#{order.id?.slice(0, 8)?.toUpperCase()}</span>
            <StatusBadge status={order.status || 'pending'} />
            {isNew && (
              <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">নতুন</span>
            )}
          </div>
          <p className="font-semibold text-gray-800 text-sm truncate">{order.shop_name || 'অজানা দোকান'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{dateStr} · {timeStr}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-gray-900">৳{Number(order.total || 0).toLocaleString('bn-BD')}</p>
          <p className="text-xs text-gray-400">{items.length} টি পণ্য</p>
        </div>
      </div>

      {/* Item preview tags */}
      {items.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex gap-1.5 flex-wrap">
            {items.slice(0, 3).map((item, idx) => (
              <span key={idx} className="text-xs bg-gray-50 border border-gray-100 text-gray-600 rounded-lg px-2 py-1">
                {item.name} × {item.qty}
              </span>
            ))}
            {items.length > 3 && (
              <span className="text-xs bg-gray-50 border border-gray-100 text-gray-400 rounded-lg px-2 py-1">
                +{items.length - 3} আরও
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => onExpand(order.id)}
        className="w-full px-4 py-2.5 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1 border-t border-gray-50"
      >
        {expanded ? '▲ কম দেখুন' : '▼ বিস্তারিত দেখুন'}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">

          {/* 🆕 Tracking Timeline */}
          <TrackingTimeline status={order.status || 'pending'} />

          {/* Items list */}
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center text-xs font-bold">
                    {item.qty}
                  </span>
                  <span className="text-gray-700">{item.name}</span>
                  {item.unit && <span className="text-xs text-gray-400">({item.unit})</span>}
                </div>
                <span className="font-medium text-gray-800">৳{Number(item.price * item.qty).toLocaleString('bn-BD')}</span>
              </div>
            ))}
          </div>

          {/* Price summary */}
          <div className="border-t border-gray-200 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>পণ্যের মূল্য</span>
              <span>৳{Number(order.subtotal || 0).toLocaleString('bn-BD')}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>ডেলিভারি চার্জ</span>
              <span>৳{Number(order.delivery || 0).toLocaleString('bn-BD')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-800 border-t border-gray-200 pt-1.5">
              <span>মোট</span>
              <span>৳{Number(order.total || 0).toLocaleString('bn-BD')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-12 ml-auto" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="h-6 bg-gray-100 rounded-lg w-24" />
        <div className="h-6 bg-gray-100 rounded-lg w-20" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('সব');
  const [user, setUser] = useState(null);
  const [newOrderId, setNewOrderId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      fetchOrders(u.id);
    } else {
      setLoading(false);
    }

    const nid = localStorage.getItem('new_order_id');
    if (nid) {
      setNewOrderId(nid);
      setExpandedId(nid);
      localStorage.removeItem('new_order_id');
    }
  }, []);

  async function fetchOrders(userId) {
    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?user_id=eq.${userId}&order=created_at.desc`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      setError('অর্ডার লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  }

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const filtered = filterStatus === 'সব'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const statusFilters = ['সব', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🚚</span>
              <span className="font-bold text-indigo-700 text-lg">পাইকারি<span className="text-gray-800">বাজার</span></span>
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">লগইন করুন</h2>
            <p className="text-gray-500 mb-6 text-sm">অর্ডার দেখতে আপনার অ্যাকাউন্টে লগইন করতে হবে।</p>
            <Link href="/login" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
              লগইন করুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl">🚚</span>
            <span className="font-bold text-indigo-700 text-lg">পাইকারি<span className="text-gray-800">বাজার</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/products" className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors">পণ্য</Link>
            <Link href="/products" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              🛒 কার্ট
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">আমার অর্ডার</h1>
          {user && <p className="text-sm text-gray-500 mt-0.5">{user.shop_name || user.phone}</p>}
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap mb-5">
          {statusFilters.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const isActive = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {cfg ? cfg.label : 'সব'}
                {s !== 'সব' && (
                  <span className={`ml-1 ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>
                    ({orders.filter((o) => o.status === s).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">
            <div className="text-5xl mb-3">⚠️</div>
            <p>{error}</p>
            <button onClick={() => fetchOrders(user.id)} className="mt-4 text-sm text-indigo-600 underline">
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-medium text-gray-600">
              {filterStatus === 'সব' ? 'এখনো কোনো অর্ডার নেই' : 'এই স্ট্যাটাসে কোনো অর্ডার নেই'}
            </p>
            <p className="text-sm mt-1 mb-6">পণ্য দেখুন এবং প্রথম অর্ডার দিন!</p>
            <Link href="/products" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm">
              পণ্য দেখুন →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-2">{filtered.length} টি অর্ডার</p>
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onExpand={toggleExpand}
                expanded={expandedId === order.id}
                isNew={order.id === newOrderId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
