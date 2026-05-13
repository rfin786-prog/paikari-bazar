'use client';
import { useState, useEffect } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

const TIMELINE_STEPS = [
  { value: 'pending',   label: 'অর্ডার দেওয়া হয়েছে', sub: 'আপনার অর্ডারটি গ্রহণ করা হয়েছে' },
  { value: 'confirmed', label: 'প্রক্রিয়াধীন',         sub: 'অর্ডারটি যাচাই ও প্যাক করা হচ্ছে' },
  { value: 'shipped',   label: 'মাল পাঠানো হয়েছে',    sub: 'পণ্যটি কুরিয়ারে বা ডেলিভারিতে আছে' },
  { value: 'delivered', label: 'ডেলিভারি সম্পন্ন',    sub: 'আপনি পণ্যটি হাতে পেয়েছেন' },
];

const STEP_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

const STATUS_MAP = {
  pending:   { label: 'অপেক্ষমান',       bg: '#fff7ed', color: '#c2410c' },
  confirmed: { label: 'প্রক্রিয়াধীন',     bg: '#eff6ff', color: '#1d4ed8' },
  shipped:   { label: 'পাঠানো হয়েছে',    bg: '#f0fdf4', color: '#15803d' },
  delivered: { label: 'ডেলিভারি সম্পন্ন', bg: '#ecfdf5', color: '#059669' },
  cancelled: { label: 'বাতিল',            bg: '#fef2f2', color: '#dc2626' },
};

const TrackingTimeline = ({ status, order }) => {
  if (status === 'cancelled') {
    return (
      <div style={{ marginTop: 16, padding: 14, backgroundColor: '#fef2f2', borderRadius: 10, textAlign: 'center' }}>
        <p style={{ color: '#dc2626', fontWeight: 700, margin: 0 }}>❌ এই অর্ডারটি বাতিল করা হয়েছে</p>
      </div>
    );
  }

  const currentStepIdx = STEP_ORDER.indexOf(status);

  return (
    <div style={{ marginTop: 16, padding: 14, backgroundColor: '#f9fafb', borderRadius: 10 }}>
      {TIMELINE_STEPS.map((step, idx) => {
        const isDone = idx <= currentStepIdx;
        const isCurrent = idx === currentStepIdx;
        const isPending = idx > currentStepIdx;
        const isLast = idx === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.value} style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                backgroundColor: isDone ? '#10b981' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 12, fontWeight: 'bold', flexShrink: 0
              }}>
                {isDone ? '✓' : idx + 1}
              </div>
              {!isLast && (
                <div style={{
                  width: 2, flex: 1, minHeight: 20,
                  backgroundColor: idx < currentStepIdx ? '#10b981' : '#e5e7eb'
                }} />
              )}
            </div>

            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: isPending ? '#9ca3af' : '#111827', margin: 0 }}>
                {step.label}
              </p>
              {isCurrent && (
                <p style={{ fontSize: 10, color: '#059669', margin: '2px 0', fontWeight: 600 }}>
                  📅 {new Date(order.updated_at || order.created_at).toLocaleString('bn-BD', {
                    hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short'
                  })}
                </p>
              )}
              <p style={{ fontSize: 11, color: isPending ? '#d1d5db' : '#6b7280', margin: 0 }}>
                {isPending ? 'অপেক্ষমান' : step.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order }) => {
  const [showDetails, setShowDetails] = useState(false);
  const date = new Date(order.created_at);
  const dateStr = date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 16, padding: 16,
      marginBottom: 14, backgroundColor: '#fff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)', fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
            অর্ডার #{order.id?.slice(0, 8).toUpperCase()}
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '4px 0', color: '#374151' }}>
            {dateStr} · {timeStr}
          </p>
          <p style={{ fontSize: 15, color: '#111827', fontWeight: 700, margin: 0 }}>
            মোট: ৳{order.total}
          </p>
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          backgroundColor: statusInfo.bg, color: statusInfo.color, whiteSpace: 'nowrap'
        }}>
          {statusInfo.label}
        </span>
      </div>

      {order.status !== 'cancelled' && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            width: '100%', marginTop: 12, padding: '8px', borderRadius: 8,
            backgroundColor: '#f3f4f6', border: 'none', fontSize: 12,
            fontWeight: 600, cursor: 'pointer', color: '#374151'
          }}
        >
          {showDetails ? '▲ বন্ধ করুন' : '▼ ট্র্যাকিং দেখুন'}
        </button>
      )}

      {showDetails && (
        <div style={{ marginTop: 10, borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
          <TrackingTimeline status={order.status} order={order} />
        </div>
      )}
    </div>
  );
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // localStorage থেকে user নাও
    try {
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      setUserId(user?.id || null);
    } catch {
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        // user_id দিয়ে filter করো
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/orders?user_id=eq.${userId}&order=created_at.desc`,
          { headers }
        );
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Orders fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontFamily: 'sans-serif' }}>
      অর্ডার লোড হচ্ছে...
    </div>
  );

  if (!userId) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#ef4444', fontFamily: 'sans-serif' }}>
      লগইন করুন
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#111827' }}>
        আমার অর্ডারসমূহ ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 40, color: '#9ca3af',
          border: '2px dashed #e5e7eb', borderRadius: 16
        }}>
          <p style={{ fontSize: 32 }}>📦</p>
          <p style={{ fontWeight: 600 }}>কোনো অর্ডার নেই</p>
        </div>
      ) : (
        orders.map(order => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  );
}
