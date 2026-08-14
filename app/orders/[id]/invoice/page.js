'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SB = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const STATUS_MAP = {
  pending:   { label: 'Pending' },
  confirmed: { label: 'Processing' },
  shipped:   { label: 'Shipped' },
  delivered: { label: 'Delivered' },
  cancelled: { label: 'Cancelled' },
};

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    setUser(JSON.parse(saved));

    fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=*`, { headers: SB })
      .then(r => r.json())
      .then(data => { setOrder(Array.isArray(data) ? data[0] : null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#999', fontFamily: 'Hind Siliguri, sans-serif' }}>Loading...</p>
    </div>
  );

  if (!order) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hind Siliguri, sans-serif' }}>
      <p style={{ color: '#999', fontSize: 13, marginBottom: 20 }}>Order not found.</p>
      <Link href="/orders" style={{ color: '#ff6a00', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>← Back to Order List</Link>
    </div>
  );

  const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '24px 16px 60px' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-box, #invoice-box * { visibility: visible; }
          #invoice-box { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Action bar — hidden on print */}
      <div className="no-print" style={{ maxWidth: 640, margin: '0 auto 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Hind Siliguri, sans-serif' }}>
        <Link href={`/orders`} style={{ color: '#888', fontSize: 13, textDecoration: 'none' }}>← Go Back</Link>
        <button
          onClick={handlePrint}
          style={{ background: '#ff6a00', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Hind Siliguri, sans-serif' }}
        >
          🖨️ Print / Download PDF
        </button>
      </div>

      {/* Invoice */}
      <div id="invoice-box" style={{ maxWidth: 640, margin: '0 auto', background: '#fff', borderRadius: 14, padding: '32px 28px', fontFamily: 'Hind Siliguri, sans-serif', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1a1a1a', paddingBottom: 16, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: 0, letterSpacing: 1 }}>RUPANJEL</h1>
            <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0' }}>Invoice</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Order No.</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#ff6a00', margin: '2px 0', fontFamily: 'monospace', letterSpacing: 1 }}>
              #{String(order.id).slice(0, 8).toUpperCase()}
            </p>
            <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>
              {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Customer + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 13 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', margin: '0 0 4px' }}>Customer</p>
            <p style={{ margin: 0, color: '#1a1a1a', fontWeight: 700 }}>{order.customer_name || user?.name || '—'}</p>
            <p style={{ margin: '2px 0 0', color: '#888' }}>{order.phone || user?.phone || ''}</p>
            <p style={{ margin: '2px 0 0', color: '#888' }}>{order.delivery_address || order.address || ''}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', margin: '0 0 4px' }}>Status</p>
            <p style={{ margin: 0, color: '#1a1a1a', fontWeight: 700 }}>{st.label}</p>
          </div>
        </div>

        {/* Items table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee', color: '#aaa', fontSize: 11, textTransform: 'uppercase' }}>
              <th style={{ textAlign: 'left', padding: '6px 0' }}>Item</th>
              <th style={{ textAlign: 'right', padding: '6px 0' }}>Unit Price</th>
              <th style={{ textAlign: 'right', padding: '6px 0' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '6px 0' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const qty = item.qty || item.quantity || 1;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '8px 0', color: '#1a1a1a' }}>{item.name}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: '#888' }}>৳{Number(item.price).toLocaleString('en-US')}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: '#888' }}>×{qty}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>৳{(item.price * qty).toLocaleString('en-US')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginLeft: 'auto', width: '60%', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: 4 }}>
            <span>Subtotal</span><span>৳{Number(order.subtotal || 0).toLocaleString('en-US')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: 8 }}>
            <span>Delivery</span><span>{order.delivery === 0 ? 'Free' : `৳${Number(order.delivery || 0).toLocaleString('en-US')}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15, color: '#1a1a1a', borderTop: '2px solid #1a1a1a', paddingTop: 8 }}>
            <span>Total</span><span style={{ color: '#ff6a00' }}>৳{Number(order.total || 0).toLocaleString('en-US')}</span>
          </div>
        </div>

        {/* Payment info */}
        {order.payment_method && (
          <p style={{ fontSize: 12, color: '#888', margin: '20px 0 0' }}>
            Payment Method: <strong>{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</strong>
          </p>
        )}

        <p style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 32, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          This invoice is system-generated — Rupanjel
        </p>
      </div>
    </div>
  );
}
