'use client';
import { useState, useEffect } from 'react';
import { SUPABASE_URL, headers } from './constants';

// ─── Timeline Steps Configuration ───────────────────────────────────────────
const TIMELINE_STEPS = [
  { value: 'pending',   label: 'অর্ডার দেওয়া হয়েছে', sub: 'আপনার অর্ডারটি গ্রহণ করা হয়েছে' },
  { value: 'confirmed', label: 'প্রক্রিয়াধীন',         sub: 'অর্ডারটি যাচাই ও প্যাক করা হচ্ছে' },
  { value: 'shipped',   label: 'মাল পাঠানো হয়েছে',    sub: 'পণ্যটি কুরিয়ারে বা ডেলিভারিতে আছে' },
  { value: 'delivered', label: 'ডেলিভারি সম্পন্ন',    sub: 'আপনি পণ্যটি হাতে পেয়েছেন' },
];

const STEP_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

// ─── Timeline Component (এখানেই সময় দেখানোর লজিক যোগ করা হয়েছে) ────────────────
const TrackingTimeline = ({ status, order }) => {
  const currentStepIdx = STEP_ORDER.indexOf(status);

  return (
    <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f9fafb', borderRadius: 12 }}>
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
                color: '#fff', fontSize: 12, fontWeight: 'bold', zIndex: 1
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

              {/* সময় দেখানোর নতুন অংশ */}
              {isDone && (
                <p style={{ fontSize: 10, color: '#059669', margin: '2px 0', fontWeight: 600 }}>
                  📅 {new Date(isCurrent ? (order.updated_at || order.created_at) : order.created_at).toLocaleString('bn-BD', {
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

// ─── Order Card Component ───────────────────────────────────────────────────
const OrderCard = ({ order, isNew }) => {
  const [showDetails, setShowDetails] = useState(false);
  const date = new Date(order.created_at);
  const dateStr = date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });

  return (
    <div style={{
      border: isNew ? '2px solid #10b981' : '1px solid #e5e7eb',
      borderRadius: 16, padding: 16, marginBottom: 16, backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>অর্ডার আইডি: #{order.id.slice(0, 8).toUpperCase()}</p>
          <p style={{ fontSize: 14, fontWeight: 700, margin: '4px 0' }}>{dateStr} | {timeStr}</p>
          <p style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>মোট: ৳{order.total}</p>
        </div>
        <div style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          backgroundColor: order.status === 'delivered' ? '#ecfdf5' : '#fff7ed',
          color: order.status === 'delivered' ? '#059669' : '#c2410c',
          border: `1px solid ${order.status === 'delivered' ? '#10b981' : '#fb923c'}`
        }}>
          {order.status === 'pending' ? 'অপেক্ষমান' : 
           order.status === 'confirmed' ? 'প্রক্রিয়াধীন' :
           order.status === 'shipped' ? 'পাঠানো হয়েছে' : 'ডেলিভারি সম্পন্ন'}
        </div>
      </div>

      <button 
        onClick={() => setShowDetails(!showDetails)}
        style={{
          width: '100%', marginTop: 12, padding: '8px', borderRadius: 8,
          backgroundColor: '#f3f4f6', border: 'none', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', color: '#374151'
        }}
      >
        {showDetails ? 'বিস্তারিত লুকান' : 'বিস্তারিত ট্র্যাকিং দেখুন'}
      </button>

      {showDetails && (
        <div style={{ marginTop: 12, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>পণ্যের তালিকা:</p>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>{item.name} x {item.qty}</span>
              <span>৳{item.price * item.qty}</span>
            </div>
          ))}
          
          {/* ট্র্যাকিং টাইমলাইন */}
          <TrackingTimeline status={order.status} order={order} />
        </div>
      )}
    </div>
  );
};

// ─── Main MyOrders Page ─────────────────────────────────────────────────────
export default function MyOrders({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderId, setNewOrderId] = useState(null);

  useEffect(() => {
    // চেক করা হচ্ছে কোনো রিসেন্ট অর্ডার আছে কি না
    const recent = localStorage.getItem('last_order_id');
    if (recent) setNewOrderId(recent);

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/orders?user_id=eq.${userId}&order=created_at.desc`,
          { headers }
        );
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("অর্ডার লোড করতে সমস্যা:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>অর্ডার লোড হচ্ছে...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>আমার অর্ডারসমূহ ({orders.length})</h2>
      
      {newOrderId && (
        <div style={{ backgroundColor: '#ecfdf5', padding: 12, borderRadius: 12, marginBottom: 20, border: '1px solid #10b981' }}>
          <p style={{ color: '#065f46', fontSize: 14, fontWeight: 600, margin: 0 }}>🎉 আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!</p>
        </div>
      )}

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>আপনার কোনো অর্ডার পাওয়া যায়নি।</p>
      ) : (
        orders.map(order => (
          <OrderCard key={order.id} order={order} isNew={order.id === newOrderId} />
        ))
      )}
    </div>
  );
}
