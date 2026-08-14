'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const user = JSON.parse(saved);

    fetch(`${SUPABASE_URL}/rest/v1/orders?user_id=eq.${user.id}&order=created_at.desc&select=*`, { headers: SB })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#999', fontFamily: 'Hind Siliguri, sans-serif' }}>Loading...</p>
    </div>
  );

  if (orders.length === 0) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hind Siliguri, sans-serif' }}>
      <p style={{ fontSize: 48, margin: 0 }}>📦</p>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: '12px 0 8px' }}>No Orders</h2>
      <p style={{ color: '#999', fontSize: 13, marginBottom: 20 }}>You haven't placed any orders yet.</p>
      <Link href="/products" style={{ background: '#ff6a00', color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
        Start Shopping →
      </Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 60px', fontFamily: 'Hind Siliguri, sans-serif' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>My Orders</h1>
      <p style={{ fontSize: 13, color: '#999', margin: '0 0 20px' }}>Total {orders.length} Orders</p>

      {orders.map(order => {
        const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
        const items = Array.isArray(order.items) ? order.items : [];
        const isOpen = expanded === order.id;

        return (
          <div key={order.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
            
            {/* Header */}
            <div
              onClick={() => setExpanded(isOpen ? null : order.id)}
              style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Order No.</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#ff6a00', margin: '2px 0', fontFamily: 'monospace', letterSpacing: 1 }}>
                  #{String(order.id).slice(0, 8).toUpperCase()}
                </p>
                <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>
                  {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, marginBottom: 6 }}>
                  {st.label}
                </span>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>
                  ৳{Number(order.total || 0).toLocaleString('en-US')}
                </p>
                <p style={{ fontSize: 11, color: '#bbb', margin: '2px 0 0' }}>{isOpen ? '▲ Collapse' : '▼ Details'}</p>
              </div>
            </div>

            {/* Expanded */}
            {isOpen && (
              <div style={{ borderTop: '1px solid #f0f0f0', padding: '14px 16px', background: '#fafafa' }}>
                
                {/* Items */}
                {items.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#ff6a00', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 8px' }}>Products</p>
                    {items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <div>
                          <p style={{ fontSize: 13, color: '#1a1a1a', margin: 0 }}>{item.name}</p>
                          <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{item.qty || item.quantity} × ৳{Number(item.price).toLocaleString('en-US')}</p>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#ff6a00', margin: 0 }}>
                          ৳{(item.price * (item.qty || item.quantity || 1)).toLocaleString('en-US')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary */}
                <div style={{ background: '#fff', borderRadius: 10, padding: 12, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: 4 }}>
                    <span>Subtotal</span><span>৳{Number(order.subtotal || 0).toLocaleString('en-US')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: 8 }}>
                    <span>Delivery</span><span>{order.delivery === 0 ? 'Free' : `৳${order.delivery}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#1a1a1a', borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                    <span>Total</span><span style={{ color: '#ff6a00' }}>৳{Number(order.total || 0).toLocaleString('en-US')}</span>
                  </div>
                </div>

                {/* Payment & delivery info */}
                {order.payment_method && (
                  <p style={{ fontSize: 12, color: '#888', margin: '10px 0 0' }}>
                    💳 Payment: <strong>{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</strong>
                  </p>
                )}
                {order.note && (
                  <p style={{ fontSize: 12, color: '#888', margin: '6px 0 0' }}>📝 Note: {order.note}</p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <Link href={`/orders/${order.id}`} style={{ flex: 1, textAlign: 'center', background: '#fff', border: '1px solid #ddd', color: '#333', padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                    View Details
                  </Link>
                  <Link href={`/orders/${order.id}/invoice`} style={{ flex: 1, textAlign: 'center', background: '#ff6a00', color: '#fff', padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                    Invoice
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
