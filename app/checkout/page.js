'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SB_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export default function CheckoutPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [platformFee, setPlatformFee] = useState(0);

  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [note, setNote] = useState('');

  const [pickupPoints, setPickupPoints] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);

  // Editable delivery contact/address (prefilled from user profile, editable per order)
  const [editingAddress, setEditingAddress] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrAddress, setAddrAddress] = useState('');

  const [deliveryOptions, setDeliveryOptions] = useState([
    { id: 'standard',  name: 'Standard',      info: '3-5 business days', price: 60 },
    { id: 'express',   name: 'Express',        info: '1-2 business days', price: 120 },
    { id: 'scheduled', name: 'Scheduled',      info: 'Choose a date',     price: 80 },
    { id: 'pickup',    name: 'Self Pickup',    info: 'Pick from warehouse', price: 0 },
  ]);

  const paymentOptions = [
    { id: 'cod',    icon: '💵', name: 'Cash on Delivery' },
    { id: 'bkash',  icon: '📱', name: 'bKash' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);

    // Prefill editable address fields from profile
    setAddrName(u.name || u.shop_name || '');
    setAddrPhone(u.phone || '');
    setAddrAddress(
      [u.address, u.thana, u.district].filter(Boolean).join(', ')
    );

    const cart = localStorage.getItem('cart');
    if (cart) setCartItems(JSON.parse(cart));

    Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.delivery_charges&select=value`, { headers: SB_HEADERS }).then(r => r.json()),
      fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.platform_fee&select=value`, { headers: SB_HEADERS }).then(r => r.json()),
      fetch(`${SUPABASE_URL}/rest/v1/pickup_points?active=eq.true&order=name`, { headers: SB_HEADERS }).then(r => r.json()),
    ]).then(([chargesData, feeData, pickupData]) => {
      if (chargesData[0]?.value) {
        const c = chargesData[0].value;
        setDeliveryOptions(prev => prev.map(opt => ({ ...opt, price: c[opt.id] ?? opt.price })));
      }
      if (feeData[0]?.value) {
        setPlatformFee(parseFloat(feeData[0].value) || 0);
      }
      if (Array.isArray(pickupData)) setPickupPoints(pickupData);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateQty = (id, delta) => {
    const updated = cartItems
      .map(c => c.id === id ? { ...c, qty: (c.qty || c.quantity || 1) + delta } : c)
      .filter(c => (c.qty || c.quantity || 1) > 0);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const setQty = (id, val) => {
    const num = parseInt(val);
    if (isNaN(num) || num < 0) return;
    let updated;
    if (num === 0) {
      updated = cartItems.filter(c => c.id !== id);
    } else {
      updated = cartItems.map(c => c.id === id ? { ...c, qty: num } : c);
    }
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const deliveryCost = deliveryOptions.find(d => d.id === deliveryMethod)?.price || 0;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.qty || item.quantity || 1), 0);
  const grandTotal = Math.max(0, subtotal + deliveryCost + platformFee);

  async function placeOrder() {
    if (cartItems.length === 0) { alert('Cart is empty.'); return; }
    if (!addrName.trim()) { alert('Please enter a name.'); return; }
    if (!addrPhone.trim()) { alert('Please enter a mobile number.'); return; }
    if (deliveryMethod !== 'pickup' && !addrAddress.trim()) { alert('Please enter a delivery address.'); return; }
    if (deliveryMethod === 'scheduled' && !deliveryDate) { alert('Please select a delivery date.'); return; }
    if (deliveryMethod === 'pickup' && !selectedPickup) { alert('Please select a pickup point.'); return; }

    setPlacing(true);
    try {
      const normalizedItems = cartItems.map(item => ({
        ...item,
        qty: item.qty || item.quantity || 1,
        quantity: item.qty || item.quantity || 1,
      }));

      const selectedPickupPoint = pickupPoints.find(p => p.id === selectedPickup);

      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: { ...SB_HEADERS, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          user_id: user.id,
          shop_name: user.shop_name,
          delivery_name: addrName,
          delivery_phone: addrPhone,
          delivery_address: addrAddress,
          items: normalizedItems,
          subtotal,
          delivery: deliveryCost,
          platform_fee: platformFee,
          total: grandTotal,
          payment_method: paymentMethod,
          delivery_method: deliveryMethod,
          delivery_date: deliveryDate || null,
          pickup_point_id: selectedPickup || null,
          pickup_point_name: selectedPickupPoint?.name || null,
          pickup_point_address: selectedPickupPoint?.address || null,
          note: note || null,
          status: 'pending',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || JSON.stringify(data));

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      setOrderSuccess(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      console.error('Order error:', err);
      alert('Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  const s = {
    page: { background: '#f5f5f5', minHeight: '100vh', padding: '24px 16px 60px', fontFamily: 'Inter, sans-serif' },
    wrap: { maxWidth: '560px', margin: '0 auto' },
    card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '12px' },
    label: { color: '#111', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px', display: 'block' },
    input: { width: '100%', padding: '10px 12px', background: '#f9f9f9', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#333', outline: 'none', boxSizing: 'border-box' },
  };

  if (orderSuccess) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '2.5rem 2rem', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '32px' }}>✓</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '0 0 8px' }}>Order Placed!</h2>
          <p style={{ color: '#888', fontSize: '13px', margin: '0 0 1.5rem', lineHeight: '1.6' }}>Your order has been received. We will contact you shortly.</p>
          <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            {orderSuccess.id && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>Order ID</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#111', fontFamily: 'monospace' }}>#{String(orderSuccess.id).slice(0, 8).toUpperCase()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Total</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#22c55e' }}>৳{Number(orderSuccess.total || grandTotal).toLocaleString('en-US')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Platform Fee</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>৳{platformFee.toLocaleString('en-US')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Status</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#111', background: '#f3f4f6', padding: '2px 10px', borderRadius: '20px' }}>Pending</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/orders" style={{ display: 'block', background: '#111', color: '#fff', padding: '13px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>
              View Orders →
            </Link>
            <Link href="/dashboard" style={{ display: 'block', background: '#f5f5f5', color: '#555', padding: '13px', borderRadius: '10px', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888', fontSize: '14px' }}>Loading...</p>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.wrap}>

        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: 0 }}>Checkout</h1>
          <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0' }}>{cartItems.length} items in cart</p>
        </div>

        {/* Delivery Address */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ ...s.label, marginBottom: 0 }}>Delivery Address</span>
            <button
              onClick={() => setEditingAddress(v => !v)}
              style={{ border: 'none', background: 'none', color: '#111', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {editingAddress ? 'Done' : 'Change'}
            </button>
          </div>

          {editingAddress ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ ...s.label, marginBottom: '6px' }}>Name</label>
                <input style={s.input} value={addrName} onChange={e => setAddrName(e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label style={{ ...s.label, marginBottom: '6px' }}>Mobile</label>
                <input style={s.input} value={addrPhone} onChange={e => setAddrPhone(e.target.value)} placeholder="Mobile number" />
              </div>
              <div>
                <label style={{ ...s.label, marginBottom: '6px' }}>Address</label>
                <textarea style={{ ...s.input, height: '64px', resize: 'none' }} value={addrAddress} onChange={e => setAddrAddress(e.target.value)} placeholder="Full delivery address" />
              </div>
            </div>
          ) : (
            <>
              <div style={{ color: '#111', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{addrName || 'No name'}</div>
              <div style={{ color: '#666', fontSize: '13px', marginBottom: '2px' }}>{addrPhone || 'No mobile number'}</div>
              <div style={{ color: '#888', fontSize: '13px', lineHeight: '1.5' }}>{addrAddress || 'No address'}</div>
            </>
          )}
        </div>

        {/* Cart Items */}
        <div style={s.card}>
          <span style={s.label}>Cart Items</span>
          {cartItems.length === 0 ? (
            <p style={{ color: '#ccc', fontSize: '13px', textAlign: 'center', padding: '1rem 0' }}>Cart is empty</p>
          ) : cartItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#111', fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>{item.name}</div>
                <div style={{ color: '#999', fontSize: '11px' }}>৳{item.price} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 12px' }}>
                <button
                  onClick={() => updateQty(item.id, -1)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <input
                  type="number"
                  value={item.qty || item.quantity || 1}
                  onChange={e => setQty(item.id, e.target.value)}
                  style={{ width: '40px', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '3px', fontSize: '13px', fontWeight: '700' }}
                />
                <button
                  onClick={() => updateQty(item.id, 1)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    border: 'none', background: '#111', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <div style={{ color: '#111', fontSize: '13px', fontWeight: '700', minWidth: '60px', textAlign: 'right' }}>
                ৳{(item.price * (item.qty || item.quantity || 1)).toLocaleString('en-US')}
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Method */}
        <div style={s.card}>
          <span style={s.label}>Delivery Method</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {deliveryOptions.map(opt => {
              const active = deliveryMethod === opt.id;
              return (
                <div key={opt.id} onClick={() => { setDeliveryMethod(opt.id); setSelectedPickup(null); }} style={{ border: `${active ? '2px solid #111' : '1px solid #e5e7eb'}`, borderRadius: '10px', padding: '10px', cursor: 'pointer', background: active ? '#f3f4f6' : '#fff', transition: 'all 0.15s' }}>
                  <div style={{ color: '#111', fontSize: '13px', fontWeight: '700', marginBottom: '2px' }}>{opt.name}</div>
                  <div style={{ color: '#999', fontSize: '11px', marginBottom: '4px' }}>{opt.info}</div>
                  <div style={{ color: opt.price === 0 ? '#22c55e' : '#111', fontSize: '12px', fontWeight: '700' }}>{opt.price === 0 ? 'Free' : `৳${opt.price}`}</div>
                </div>
              );
            })}
          </div>

          {deliveryMethod === 'scheduled' && (
            <div style={{ marginTop: '10px' }}>
              <label style={{ ...s.label, marginBottom: '6px' }}>Delivery Date</label>
              <input type="date" style={s.input} value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
          )}

          {deliveryMethod === 'pickup' && (
            <div style={{ marginTop: '12px' }}>
              <label style={{ ...s.label, marginBottom: '8px' }}>📍 Select Pickup Point</label>
              {pickupPoints.length === 0 ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>No active pickup points available</div>
              ) : pickupPoints.map(p => (
                <div key={p.id} onClick={() => setSelectedPickup(p.id)} style={{ border: `${selectedPickup === p.id ? '2px solid #111' : '1px solid #e5e7eb'}`, borderRadius: '10px', padding: '12px', marginBottom: '8px', cursor: 'pointer', background: selectedPickup === p.id ? '#f3f4f6' : '#fafafa', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>{p.address}</div>
                    </div>
                    {p.area && (
                      <span style={{ fontSize: '11px', color: '#111', background: '#f3f4f6', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', border: '1px solid #e5e7eb', flexShrink: 0 }}>{p.area}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={s.card}>
          <span style={s.label}>Order Summary</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#888' }}>
            <span>Subtotal</span><span>৳{subtotal.toLocaleString('en-US')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#888' }}>
            <span>Delivery</span><span>{deliveryCost === 0 ? 'Free' : `৳${deliveryCost}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#888' }}>
            <span>Platform Fee</span><span>৳{platformFee.toLocaleString('en-US')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', paddingTop: '10px', borderTop: '1px solid #f0f0f0', marginTop: '8px' }}>
            <span style={{ color: '#111' }}>Total</span>
            <span style={{ color: '#111' }}>৳{grandTotal.toLocaleString('en-US')}</span>
          </div>
        </div>

        {/* Payment */}
        <div style={s.card}>
          <span style={s.label}>Payment Method</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            {paymentOptions.map(opt => {
              const active = paymentMethod === opt.id;
              return (
                <div key={opt.id} onClick={() => setPaymentMethod(opt.id)} style={{ border: `${active ? '2px solid #111' : '1px solid #e5e7eb'}`, borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer', background: active ? '#f3f4f6' : '#fff', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{opt.icon}</div>
                  <div style={{ color: active ? '#111' : '#666', fontSize: '12px', fontWeight: '700' }}>{opt.name}</div>
                </div>
              );
            })}
          </div>

          {paymentMethod === 'bkash' && (
            <div style={{ background: '#fdf2f8', border: '1px solid #f0abcc', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px', fontSize: '13px', color: '#9d174d' }}>
              📱 bKash Payment: <strong>01813888860</strong><br />
              <span style={{ fontSize: '11px', color: '#be185d', marginTop: '4px', display: 'block' }}>We'll call you once your order is confirmed.</span>
            </div>
          )}

          <label style={{ ...s.label, marginBottom: '6px' }}>Note (Optional)</label>
          <textarea
            style={{ ...s.input, height: '70px', resize: 'none', marginBottom: '14px' }}
            placeholder="Any special instructions for delivery or order..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <button
            onClick={placeOrder}
            disabled={placing}
            style={{
              width: '100%', padding: '14px',
              background: placing ? '#9ca3af' : '#111',
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
              color: '#fff', cursor: placing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {placing ? 'Placing Order...' : 'Confirm Order →'}
          </button>
        </div>

      </div>
    </div>
  );
}
