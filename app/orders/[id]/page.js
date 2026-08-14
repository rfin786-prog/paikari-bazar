'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SB = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const STATUS_MAP = {
  pending:   { label: 'Pending',        bg: '#fff7ed', color: '#c2410c' },
  confirmed: { label: 'Processing',      bg: '#eff6ff', color: '#1d4ed8' },
  shipped:   { label: 'Shipped',     bg: '#f0fdf4', color: '#15803d' },
  delivered: { label: 'Delivered', bg: '#ecfdf5', color: '#059669' },
  cancelled: { label: 'Cancelled',             bg: '#fef2f2', color: '#dc2626' },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const user = JSON.parse(saved);

    fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${params.id}&select=*`, { headers: SB })
      .then(r => r.json())
      .then(data => {
        const found = Array.isArray(data) ? data[0] : null;
        if (!found || found.user_id !== user.id) { setNotFound(true); return; }
        setOrder(found);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#999', fontFamily: 'Hind Siliguri, sans-serif' }}>Loading...</p>
    </div>
  );

  if (notFound || !order) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hind Siliguri, sans-serif' }}>
      <p style={{ fontSize: 48, margin: 0 }}>🔍</p>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: '12px 0 8px' }}>Order Not Found</h2>
      <Link href="/orders" style={{ background: '#ff6a00', color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
        Back to Order List →
      </Link>
    </div>
  );

  const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const items = Array.isArray(order.items) ? order.items : [];
  const history = Array.isArray(order.tracking_history) ? order.tracking_history : [];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 60px', fontFamily: 'Hind Siliguri, sans-serif' }}>
      <Link href="/orders" style={{ fontSize: 13, color: '#999', textDecoration: 'none' }}>← Order List</Link>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, marginTop: 12, overflow: 'hidden' }}>
        <div style={{ padding: '18px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Order No.</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#ff6a00', margin: '2px 0', fontFamily: 'monospace', letterSpacing: 1 }}>
                #{String(order.id).slice(0, 8).toUpperCase()}
              </p>
              <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>
                {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>
              {st.label}
            </span>
          </div>
        </div>

        {/* Items */}
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#ff6a00', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 10px' }}>Products</p>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div>
                <p style={{ fontSize: 13, color: '#1a1a1a', margin: 0 }}>{item.name}</p>
                <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{item.qty || item.quantity} × ৳{Number(item.price).toLocaleString('en-US')}</p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#ff6a00', margin: 0 }}>
                ৳{(item.price * (item.qty || item.quantity || 1)).toLocaleString('en-US')}
              </p>
            </div>
          ))}

          <div style={{ background: '#fafafa', borderRadius: 10, padding: 12, fontSize: 13, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: 4 }}>
              <span>Subtotal</span><span>৳{Number(order.subtotal || 0).toLocaleString('en-US')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: 4 }}>
              <span>Delivery</span><span>{order.delivery === 0 ? 'Free' : `৳${order.delivery}`}</span>
            </div>
            {order.platform_fee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: 4 }}>
                <span>Platform Fee</span><span>৳{Number(order.platform_fee).toLocaleString('en-US')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#1a1a1a', borderTop: '1px solid #eee', paddingTop: 8, marginTop: 4 }}>
              <span>Total</span><span style={{ color: '#ff6a00' }}>৳{Number(order.total || 0).toLocaleString('en-US')}</span>
            </div>
          </div>

          {order.payment_method && (
            <p style={{ fontSize: 12, color: '#888', margin: '12px 0 0' }}>
              💳 Payment: <strong>{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</strong>
            </p>
          )}
          {order.pickup_point_name && (
            <p style={{ fontSize: 12, color: '#888', margin: '6px 0 0' }}>
              📍 Pickup Point: <strong>{order.pickup_point_name}</strong> — {order.pickup_point_address}
            </p>
          )}
          {order.note && (
            <p style={{ fontSize: 12, color: '#888', margin: '6px 0 0' }}>📝 Note: {order.note}</p>
          )}

          {history.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#ff6a00', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 8px' }}>Tracking</p>
              {history.map((h, i) => (
                <div key={i} style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                  <strong style={{ color: '#1a1a1a' }}>{STATUS_MAP[h.status]?.label || h.status}</strong>
                  {h.note ? ` — ${h.note}` : ''}
                  {h.time ? <span style={{ color: '#bbb' }}> ({new Date(h.time).toLocaleDateString('bn-BD')})</span> : ''}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <Link href={`/orders/${order.id}/invoice`} style={{ display: 'block', textAlign: 'center', background: '#ff6a00', color: '#fff', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            View Invoice →
          </Link>
        </div>
      </div>
    </div>
  );
}
