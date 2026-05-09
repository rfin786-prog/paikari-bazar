'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function CheckoutPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [note, setNote] = useState('');

  const deliveryOptions = [
    { id: 'standard', name: 'স্ট্যান্ডার্ড', info: '৩-৫ কার্যদিবস', price: 60 },
    { id: 'express', name: 'এক্সপ্রেস', info: '১-২ কার্যদিবস', price: 120 },
    { id: 'scheduled', name: 'নির্ধারিত তারিখ', info: 'তারিখ বেছে নিন', price: 80 },
    { id: 'pickup', name: 'সেলফ পিকআপ', info: 'গুদাম থেকে নিন', price: 0 },
  ];

  const paymentOptions = [
    { id: 'cod', icon: '💵', name: 'ক্যাশ অন ডেলিভারি' },
    { id: 'mobile', icon: '📱', name: 'বিকাশ / নগদ' },
    { id: 'bank', icon: '🏦', name: 'ব্যাংক ট্রান্সফার' },
    { id: 'credit', icon: '📒', name: 'বাকি' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);
    const cart = localStorage.getItem('paikari_cart');
    if (cart) setCartItems(JSON.parse(cart));
    setLoading(false);
  }, []);

  const deliveryCost = deliveryOptions.find(d => d.id === deliveryMethod)?.price || 0;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.qty || item.quantity || 1), 0);
  const grandTotal = Math.max(0, subtotal + deliveryCost);

  async function placeOrder() {
    if (cartItems.length === 0) { alert('কার্টে কোনো পণ্য নেই।'); return; }
    if (deliveryMethod === 'scheduled' && !deliveryDate) {
      alert('অনুগ্রহ করে ডেলিভারি তারিখ বেছে নিন।'); return;
    }
    setPlacing(true);
    try {
      const normalizedItems = cartItems.map(item => ({
        ...item,
        qty: item.qty || item.quantity || 1,
        quantity: item.qty || item.quantity || 1,
      }));

      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          user_id: user.id,
          shop_name: user.shop_name,
          items: normalizedItems,
          subtotal,
          delivery: deliveryCost,
          total: grandTotal,
          payment_method: paymentMethod,
          delivery_method: deliveryMethod,
          delivery_date: deliveryDate || null,
          note: note || null,
          status: 'pending',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');

      localStorage.removeItem('paikari_cart');
      setOrderSuccess(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      console.error(err);
      alert('অর্ডার দেওয়া যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setPlacing(false);
    }
  }

  const s = {
    page: { background: '#0a1628', minHeight: '100vh', padding: '24px 16px 60px', fontFamily: 'Hind Siliguri, sans-serif' },
    wrap: { maxWidth: '520px', margin: '0 auto' },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', marginBottom: '12px' },
    label: { color: 'rgba(232,160,32,0.8)', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px', display: 'block' },
    input: { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', fontSize: '14px', color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'Hind Siliguri, sans-serif' },
  };

  // ── Success Screen ────────────────────────────────────
  if (orderSuccess) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '2.5rem 2rem', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '36px' }}>✓</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 8px' }}>অর্ডার সফল হয়েছে!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 1.5rem', lineHeight: '1.6' }}>
            আপনার অর্ডার গ্রহণ করা হয়েছে। শীঘ্রই আমরা যোগাযোগ করব।
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            {orderSuccess.id && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>অর্ডার ID</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#e8a020', fontFamily: 'monospace' }}>#{String(orderSuccess.id).slice(0, 8).toUpperCase()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>মোট পরিমাণ</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1D9E75' }}>৳{Number(orderSuccess.total || grandTotal).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>স্ট্যাটাস</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#e8a020', background: 'rgba(232,160,32,0.15)', padding: '2px 10px', borderRadius: '20px' }}>অপেক্ষমান</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/orders" style={{ display: 'block', background: 'linear-gradient(135deg, #e8a020, #f5c842)', color: '#0a1628', padding: '13px', borderRadius: '12px', fontWeight: '800', fontSize: '15px', textDecoration: 'none' }}>
              📦 আমার অর্ডার দেখুন
            </Link>
            <Link href="/products" style={{ display: 'block', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', padding: '13px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
              🛒 আরও কেনাকাটা করুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>লোড হচ্ছে...</p>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.wrap}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#e8a020,#f5c842)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#0a1628' }}>প</div>
          <div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>পাইকারি বাজার</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>অর্ডার চেকআউট</div>
          </div>
        </div>

        {/* Delivery Address */}
        <div style={s.card}>
          <span style={s.label}>ডেলিভারি ঠিকানা</span>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{user?.shop_name || 'দোকানের নাম নেই'}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '2px' }}>{user?.phone}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.5' }}>
            {user?.address}{user?.thana ? `, ${user.thana}` : ''}{user?.district ? `, ${user.district}` : ''}
          </div>
        </div>

        {/* Delivery Method */}
        <div style={s.card}>
          <span style={s.label}>ডেলিভারি পদ্ধতি</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {deliveryOptions.map(opt => {
              const active = deliveryMethod === opt.id;
              return (
                <div key={opt.id} onClick={() => setDeliveryMethod(opt.id)} style={{ border: `${active ? '2px solid #e8a020' : '1px solid rgba(255,255,255,0.1)'}`, borderRadius: '10px', padding: '10px', cursor: 'pointer', background: active ? 'rgba(232,160,32,0.08)' : 'transparent', transition: 'all 0.15s' }}>
                  <div style={{ color: '#fff', fontSize: '13px', fontWeight: '700', marginBottom: '2px' }}>{opt.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '4px' }}>{opt.info}</div>
                  <div style={{ color: opt.price === 0 ? '#1D9E75' : '#e8a020', fontSize: '12px', fontWeight: '700' }}>{opt.price === 0 ? 'বিনামূল্যে' : `৳${opt.price}`}</div>
                </div>
              );
            })}
          </div>
          {deliveryMethod === 'scheduled' && (
            <div style={{ marginTop: '10px' }}>
              <label style={{ ...s.label, marginBottom: '6px' }}>ডেলিভারি তারিখ</label>
              <input type="date" style={s.input} value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={s.card}>
          <span style={s.label}>অর্ডার সারসংক্ষেপ</span>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '12px' }}>
            {cartItems.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '1rem 0' }}>কার্টে কোনো পণ্য নেই</p>
            ) : cartItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '13px', marginBottom: '1px' }}>{item.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{item.qty || item.quantity} x ৳{item.price.toLocaleString()}</div>
                </div>
                <div style={{ color: '#e8a020', fontSize: '13px', fontWeight: '700' }}>৳{(item.price * (item.qty || item.quantity || 1)).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0', color: 'rgba(255,255,255,0.5)' }}>
            <span>সাবটোটাল</span><span>৳{subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0', color: 'rgba(255,255,255,0.5)' }}>
            <span>ডেলিভারি চার্জ</span><span>{deliveryCost === 0 ? 'বিনামূল্যে' : `৳${deliveryCost}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px' }}>
            <span style={{ color: '#fff' }}>সর্বমোট</span>
            <span style={{ color: '#e8a020' }}>৳{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment */}
        <div style={s.card}>
          <span style={s.label}>পেমেন্ট পদ্ধতি</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            {paymentOptions.map(opt => {
              const active = paymentMethod === opt.id;
              return (
                <div key={opt.id} onClick={() => setPaymentMethod(opt.id)} style={{ border: `${active ? '2px solid #e8a020' : '1px solid rgba(255,255,255,0.1)'}`, borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer', background: active ? 'rgba(232,160,32,0.08)' : 'transparent', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{opt.icon}</div>
                  <div style={{ color: active ? '#e8a020' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '700' }}>{opt.name}</div>
                </div>
              );
            })}
          </div>

          <label style={{ ...s.label, marginBottom: '6px' }}>বিশেষ নোট (ঐচ্ছিক)</label>
          <textarea
            style={{ ...s.input, height: '70px', resize: 'none', marginBottom: '14px' }}
            placeholder="ডেলিভারি বা অর্ডার সম্পর্কে কিছু জানাতে চাইলে লিখুন..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <button
            onClick={placeOrder}
            disabled={placing}
            style={{ width: '100%', padding: '14px', background: placing ? 'rgba(232,160,32,0.4)' : 'linear-gradient(135deg,#e8a020,#f5c842)', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', color: '#0a1628', cursor: placing ? 'not-allowed' : 'pointer', fontFamily: 'Hind Siliguri, sans-serif', transition: 'all 0.2s' }}
          >
            {placing ? 'অর্ডার হচ্ছে...' : 'অর্ডার নিশ্চিত করুন →'}
          </button>
        </div>

      </div>
    </div>
  );
}
