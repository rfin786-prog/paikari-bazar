'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SB = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);

    fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${params.id}&select=*`, { headers: SB })
      .then(r => r.json())
      .then(data => {
        const found = Array.isArray(data) ? data[0] : null;
        if (!found || found.user_id !== u.id) { setNotFound(true); return; }
        setOrder(found);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#999', fontFamily: 'Hind Siliguri, sans-serif' }}>লোড হচ্ছে...</p>
    </div>
  );

  if (notFound || !order) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hind Siliguri, sans-serif' }}>
      <p style={{ fontSize: 48, margin: 0 }}>🔍</p>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: '12px 0 8px' }}>ইনভয়েস পাওয়া যায়নি</h2>
      <Link href="/orders" style={{ background: '#ff6a00', color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
        অর্ডার তালিকায় ফিরুন →
      </Link>
    </div>
  );

  const items = Array.isArray(order.items) ? order.items : [];
  const orderNo = String(order.id).slice(0, 8).toUpperCase();
  const orderDate = new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '24px 16px 60px', fontFamily: 'Hind Siliguri, sans-serif' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .invoice-card { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="no-print" style={{ maxWidth: 560, margin: '0 auto 12px', display: 'flex', justifyContent: 'space-between' }}>
        <Link href={`/orders/${order.id}`} style={{ fontSize: 13, color: '#999', textDecoration: 'none' }}>← ফিরে যান</Link>
        <button
          onClick={() => window.print()}
          style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          🖨️ ডাউনলোড / প্রিন্ট
        </button>
      </div>

      <div className="invoice-card" style={{ maxWidth: 560, margin: '0 auto', background: '#fff', borderRadius: 16, border: '1px solid #eee', overflow: 'hidden' }}>

        {/* Brand header */}
        <div style={{ background: '#1a1a1a', padding: '24px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: 0.5 }}>Rupanjel</p>
              <p style={{ fontSize: 11, color: '#aaa', margin: '4px 0 0' }}>rupanjel.com</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: '#aaa', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>ইনভয়েস</p>
              <p style={{ fontSize: 14, fontWeight: 700, margin: '2px 0 0', fontFamily: 'monospace' }}>#{orderNo}</p>
            </div>
          </div>
        </div>

        {/* Bill to + date */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 6px' }}>বিল টু</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{order.shop_name || user?.shop_name}</p>
            <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{user?.phone}</p>
            <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0', maxWidth: 200 }}>
              {user?.address}{user?.thana ? `, ${user.thana}` : ''}{user?.district ? `, ${user.district}` : ''}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 6px' }}>তারিখ</p>
            <p style={{ fontSize: 13, color: '#1a1a1a', margin: 0 }}>{orderDate}</p>
          </div>
        </div>

        {/* Items table */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: 1, textTransform: 'uppercase', paddingBottom: 8, borderBottom: '1px solid #eee' }}>
            <span style={{ flex: 1 }}>পণ্য</span>
            <span style={{ width: 40, textAlign: 'center' }}>পরিমাণ</span>
            <span style={{ width: 70, textAlign: 'right' }}>দর</span>
            <span style={{ width: 80, textAlign: 'right' }}>মোট</span>
          </div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: 13, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ flex: 1, color: '#1a1a1a' }}>{item.name}</span>
              <span style={{ width: 40, textAlign: 'center', color: '#888' }}>{item.qty || item.quantity}</span>
              <span style={{ width: 70, textAlign: 'right', color: '#888' }}>৳{Number(item.price).toLocaleString()}</span>
              <span style={{ width: 80, textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>
                ৳{(item.price * (item.qty || item.quantity || 1)).toLocaleString()}
              </span>
            </div>
          ))}

          {/* Totals */}
          <div style={{ marginTop: 16, paddingTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', padding: '4px 0' }}>
              <span>সাবটোটাল</span><span>৳{Number(order.subtotal || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', padding: '4px 0' }}>
              <span>ডেলিভারি চার্জ</span><span>{order.delivery === 0 ? 'বিনামূল্যে' : `৳${order.delivery}`}</span>
            </div>
            {order.platform_fee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', padding: '4px 0' }}>
                <span>প্ল্যাটফর্ম ফি</span><span>৳{Number(order.platform_fee).toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, color: '#1a1a1a', borderTop: '2px solid #1a1a1a', marginTop: 8, paddingTop: 10 }}>
              <span>সর্বমোট</span><span>৳{Number(order.total || 0).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 12, color: '#888' }}>
            <span>পেমেন্ট পদ্ধতি: <strong style={{ color: '#1a1a1a' }}>{order.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : order.payment_method}</strong></span>
            <span>স্ট্যাটাস: <strong style={{ color: '#1a1a1a' }}>{order.status}</strong></span>
          </div>
        </div>

        <div style={{ background: '#fafafa', padding: '16px 24px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>কেনাকাটার জন্য ধন্যবাদ 🙏</p>
        </div>
      </div>
    </div>
  );
}
