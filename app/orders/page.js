'use client';
import { useState } from 'react';

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
  pending:   { label: 'অপেক্ষমান',        bg: '#fff7ed', color: '#c2410c' },
  confirmed: { label: 'প্রক্রিয়াধীন',      bg: '#eff6ff', color: '#1d4ed8' },
  shipped:   { label: 'পাঠানো হয়েছে',     bg: '#f0fdf4', color: '#15803d' },
  delivered: { label: 'ডেলিভারি সম্পন্ন',  bg: '#ecfdf5', color: '#059669' },
  cancelled: { label: 'বাতিল',             bg: '#fef2f2', color: '#dc2626' },
};

const TrackingTimeline = ({ order }) => {
  if (order.status === 'cancelled') {
    return (
      <div style={{ marginTop: 16, padding: 14, backgroundColor: '#fef2f2', borderRadius: 10, textAlign: 'center' }}>
        <p style={{ color: '#dc2626', fontWeight: 700, margin: 0 }}>❌ এই অর্ডারটি বাতিল করা হয়েছে</p>
      </div>
    );
  }

  const currentStepIdx = STEP_ORDER.indexOf(order.status);

  return (
    <div style={{ marginTop: 16 }}>
      {TIMELINE_STEPS.map((step, idx) => {
        const isDone = idx <= currentStepIdx;
        const isCurrent = idx === currentStepIdx;
        const isPending = idx > currentStepIdx;
        const isLast = idx === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.value} style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: isDone ? '#10b981' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13, fontWeight: 'bold', flexShrink: 0
              }}>
                {isDone ? '✓' : idx + 1}
              </div>
              {!isLast && (
                <div style={{
                  width: 2, flex: 1, minHeight: 24,
                  backgroundColor: idx < currentStepIdx ? '#10b981' : '#e5e7eb'
                }} />
              )}
            </div>

            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: isPending ? '#9ca3af' : '#111827', margin: 0 }}>
                {step.label}
              </p>
              {isCurrent && (
                <p style={{ fontSize: 11, color: '#059669', margin: '2px 0', fontWeight: 600 }}>
                  📅 {new Date(order.updated_at || order.created_at).toLocaleString('bn-BD', {
                    hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short'
                  })}
                </p>
              )}
              <p style={{ fontSize: 12, color: isPending ? '#d1d5db' : '#6b7280', margin: 0 }}>
                {isPending ? 'অপেক্ষমান' : step.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function OrderTrackPage() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // exact UUID match অথবা শুরুর অংশ দিয়ে খোঁজো
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=ilike.${q}%&select=*&limit=1`,
        { headers }
      );
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setOrder(data[0]);
      } else {
        setError('কোনো অর্ডার পাওয়া যায়নি। সঠিক অর্ডার নম্বর দিন।');
      }
    } catch {
      setError('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = order ? (STATUS_MAP[order.status] || STATUS_MAP.pending) : null;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 16px', fontFamily: 'sans-serif' }}>

      {/* হেডার */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontSize: 40, margin: 0 }}>📦</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 4px', color: '#111827' }}>
          অর্ডার ট্র্যাক করুন
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
          অর্ডার নম্বর দিন — আপনার পণ্যের অবস্থান জানুন
        </p>
      </div>

      {/* সার্চ বক্স */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
          placeholder="অর্ডার নম্বর লিখুন..."
          style={{
            flex: 1, padding: '13px 16px', borderRadius: 10,
            border: '1.5px solid #e5e7eb', fontSize: 14,
            outline: 'none', fontFamily: 'sans-serif', color: '#111827'
          }}
        />
        <button
          onClick={handleTrack}
          disabled={loading || !query.trim()}
          style={{
            padding: '13px 22px', borderRadius: 10, border: 'none',
            backgroundColor: '#ff6a00', color: '#fff', fontWeight: 700,
            fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || !query.trim() ? 0.6 : 1,
            whiteSpace: 'nowrap'
          }}
        >
          {loading ? '...' : 'ট্র্যাক করুন'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: 14, backgroundColor: '#fef2f2', borderRadius: 10,
          color: '#dc2626', fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 16
        }}>
          ❌ {error}
        </div>
      )}

      {/* অর্ডার রেজাল্ট */}
      {order && (
        <div style={{
          border: '1px solid #e5e7eb', borderRadius: 16, padding: 20,
          backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.07)'
        }}>
          {/* অর্ডার হেডার */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>অর্ডার নম্বর</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: '2px 0', letterSpacing: 1 }}>
                #{order.id?.slice(0, 8).toUpperCase()}
              </p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
                {new Date(order.created_at).toLocaleDateString('bn-BD', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                backgroundColor: statusInfo.bg, color: statusInfo.color, display: 'block', marginBottom: 6
              }}>
                {statusInfo.label}
              </span>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>
                ৳{order.total}
              </p>
            </div>
          </div>

          {/* ঠিকানা */}
          {order.address && (
            <div style={{
              padding: '8px 12px', backgroundColor: '#f9fafb',
              borderRadius: 8, marginBottom: 4, fontSize: 12, color: '#6b7280'
            }}>
              📍 {order.address}
            </div>
          )}

          {/* টাইমলাইন */}
          <TrackingTimeline order={order} />
        </div>
      )}
    </div>
  );
}
