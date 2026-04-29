"use client";

import { useState, useEffect } from ‘react’;
import { useRouter } from ‘next/navigation’;
import Link from ‘next/link’;

export default function CheckoutPage() {
const router = useRouter();

// Cart state (in real app, this comes from context/localStorage)
const [cartItems, setCartItems] = useState([
{ id: 1, name: ‘সয়াবিন তেল’, unit: ‘প্রতি ৫ লিটার’, price: 1800, qty: 4 },
{ id: 2, name: ‘আটা’, unit: ‘প্রতি ৫০ কেজি বস্তা’, price: 1200, qty: 1 },
{ id: 3, name: ‘চাল (মিনিকেট)’, unit: ‘প্রতি ৫০ কেজি বস্তা’, price: 2800, qty: 1 },
]);

const [form, setForm] = useState({
name: ‘’,
phone: ‘’,
address: ‘’,
area: ‘’,
note: ‘’,
paymentMethod: ‘cod’,
});

const [loading, setLoading] = useState(false);
const [orderPlaced, setOrderPlaced] = useState(false);
const [orderId, setOrderId] = useState(’’);

const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
const deliveryCharge = subtotal >= 10000 ? 0 : 150;
const total = subtotal + deliveryCharge;

const handleChange = (e) => {
setForm({ …form, [e.target.name]: e.target.value });
};

const handleQtyChange = (id, delta) => {
setCartItems(prev =>
prev.map(item =>
item.id === id
? { …item, qty: Math.max(1, item.qty + delta) }
: item
)
);
};

const handleRemove = (id) => {
setCartItems(prev => prev.filter(item => item.id !== id));
};

const handleSubmit = async () => {
if (!form.name || !form.phone || !form.address) {
alert(‘নাম, ফোন এবং ঠিকানা দিন’);
return;
}
setLoading(true);
// Simulate API call
await new Promise(r => setTimeout(r, 1500));
const id = ‘PB-’ + Date.now().toString().slice(-6);
setOrderId(id);
setOrderPlaced(true);
setLoading(false);
};

if (orderPlaced) {
return (
<div style={styles.successOverlay}>
<div style={styles.successCard}>
<div style={styles.checkCircle}>✓</div>
<h2 style={styles.successTitle}>অর্ডার সম্পন্ন হয়েছে!</h2>
<p style={styles.successSub}>অর্ডার আইডি: <strong>{orderId}</strong></p>
<p style={styles.successMsg}>আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।</p>
<div style={styles.successBtns}>
<Link href="/dashboard" style={styles.btnPrimary}>ড্যাশবোর্ডে যান</Link>
<Link href="/products" style={styles.btnOutline}>আরও কেনাকাটা</Link>
</div>
</div>
</div>
);
}

return (
<>
<style>{`
@import url(‘https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Tiro+Bangla:ital@0;1&display=swap’);

```
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Hind Siliguri', sans-serif;
      background: #faf7f2;
      min-height: 100vh;
    }

    .checkout-wrapper {
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px 16px 60px;
    }

    /* Navbar */
    .navbar {
      background: #0f2442;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    }
    .navbar-brand {
      color: #e8a020;
      font-family: 'Tiro Bangla', serif;
      font-size: 1.4rem;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .navbar-back {
      color: #faf7f2;
      text-decoration: none;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .navbar-back:hover { opacity: 1; }

    /* Page title */
    .page-title {
      font-family: 'Tiro Bangla', serif;
      color: #0f2442;
      font-size: 1.6rem;
      margin: 28px 0 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Grid */
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 768px) {
      .checkout-grid { grid-template-columns: 1fr; }
    }

    /* Cards */
    .card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 16px rgba(15,36,66,0.08);
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f2442;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 2px solid #faf7f2;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Form */
    .form-group { margin-bottom: 16px; }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #0f2442;
      margin-bottom: 6px;
    }
    .form-label span { color: #e8a020; }
    .form-input {
      width: 100%;
      padding: 12px 14px;
      border: 2px solid #e8e0d0;
      border-radius: 10px;
      font-family: 'Hind Siliguri', sans-serif;
      font-size: 0.95rem;
      color: #0f2442;
      background: #faf7f2;
      transition: border-color 0.2s;
      outline: none;
    }
    .form-input:focus { border-color: #e8a020; background: white; }
    .form-input::placeholder { color: #aaa; }
    textarea.form-input { resize: vertical; min-height: 80px; }

    /* Payment */
    .payment-options { display: flex; gap: 12px; flex-wrap: wrap; }
    .payment-option {
      flex: 1;
      min-width: 120px;
      padding: 14px 12px;
      border: 2px solid #e8e0d0;
      border-radius: 12px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      background: #faf7f2;
    }
    .payment-option.active {
      border-color: #0f2442;
      background: #0f2442;
      color: white;
    }
    .payment-option-icon { font-size: 1.5rem; display: block; margin-bottom: 4px; }
    .payment-option-label { font-size: 0.82rem; font-weight: 600; }

    /* Cart items in checkout */
    .cart-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f0ebe0;
    }
    .cart-item:last-child { border-bottom: none; }
    .cart-item-icon {
      width: 48px;
      height: 48px;
      background: #f0ebe0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }
    .cart-item-info { flex: 1; }
    .cart-item-name { font-weight: 600; font-size: 0.9rem; color: #0f2442; }
    .cart-item-unit { font-size: 0.75rem; color: #888; margin-top: 2px; }
    .cart-item-price { font-weight: 700; color: #0f2442; font-size: 0.9rem; }

    .qty-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
    }
    .qty-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid #0f2442;
      background: white;
      color: #0f2442;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: all 0.15s;
    }
    .qty-btn:hover { background: #0f2442; color: white; }
    .qty-num { font-weight: 700; font-size: 0.9rem; min-width: 20px; text-align: center; }
    .remove-btn {
      background: none;
      border: none;
      color: #e05555;
      cursor: pointer;
      font-size: 0.75rem;
      padding: 4px;
      transition: opacity 0.15s;
    }
    .remove-btn:hover { opacity: 0.7; }

    /* Summary */
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #555;
      margin-bottom: 10px;
    }
    .summary-row.total {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f2442;
      padding-top: 12px;
      border-top: 2px solid #f0ebe0;
      margin-top: 4px;
    }
    .free-delivery {
      background: #e8f5e9;
      color: #2e7d32;
      font-size: 0.78rem;
      padding: 6px 10px;
      border-radius: 8px;
      margin: 10px 0;
      text-align: center;
    }

    /* Order button */
    .btn-order {
      width: 100%;
      padding: 16px;
      background: #e8a020;
      color: #0f2442;
      border: none;
      border-radius: 12px;
      font-family: 'Hind Siliguri', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(232,160,32,0.4);
    }
    .btn-order:hover:not(:disabled) {
      background: #d4911a;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(232,160,32,0.5);
    }
    .btn-order:disabled { opacity: 0.7; cursor: not-allowed; }

    /* Success */
    .success-overlay {
      min-height: 100vh;
      background: #faf7f2;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .success-card {
      background: white;
      border-radius: 20px;
      padding: 48px 40px;
      text-align: center;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 8px 40px rgba(15,36,66,0.12);
    }
    .check-circle {
      width: 80px;
      height: 80px;
      background: #0f2442;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      color: #e8a020;
      margin: 0 auto 20px;
      animation: popIn 0.4s ease;
    }
    @keyframes popIn {
      0% { transform: scale(0); }
      70% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .spinner {
      width: 20px; height: 20px;
      border: 3px solid rgba(15,36,66,0.3);
      border-top-color: #0f2442;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `}</style>

  {/* Navbar */}
  <nav className="navbar">
    <a href="/products" className="navbar-back">← পণ্য তালিকায় ফিরুন</a>
    <a href="/" className="navbar-brand">🚐 পাইকারিবাজার</a>
  </nav>

  <div className="checkout-wrapper">
    <h1 className="page-title">🧾 চেকআউট</h1>

    <div className="checkout-grid">
      {/* LEFT: Form */}
      <div>
        {/* Delivery Info */}
        <div className="card">
          <div className="card-title">📍 ডেলিভারি তথ্য</div>

          <div className="form-group">
            <label className="form-label">পুরো নাম <span>*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="আপনার নাম লিখুন"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">ফোন নম্বর <span>*</span></label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              className="form-input"
              type="tel"
            />
          </div>

          <div className="form-group">
            <label className="form-label">পূর্ণ ঠিকানা <span>*</span></label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="বাড়ি/গ্রাম, রাস্তা, উপজেলা..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">এলাকা / থানা</label>
            <input
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="যেমন: মিরপুর, ঢাকা"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">বিশেষ নির্দেশনা (ঐচ্ছিক)</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="কোনো বিশেষ কথা থাকলে লিখুন..."
              className="form-input"
              style={{ minHeight: 60 }}
            />
          </div>
        </div>

        {/* Payment */}
        <div className="card">
          <div className="card-title">💳 পেমেন্ট পদ্ধতি</div>
          <div className="payment-options">
            {[
              { id: 'cod', icon: '💵', label: 'ক্যাশ অন ডেলিভারি' },
              { id: 'bkash', icon: '📱', label: 'বিকাশ' },
              { id: 'nagad', icon: '🟠', label: 'নগদ' },
            ].map(opt => (
              <div
                key={opt.id}
                className={`payment-option ${form.paymentMethod === opt.id ? 'active' : ''}`}
                onClick={() => setForm({ ...form, paymentMethod: opt.id })}
              >
                <span className="payment-option-icon">{opt.icon}</span>
                <span className="payment-option-label">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Order Summary */}
      <div>
        <div className="card">
          <div className="card-title">🛒 অর্ডার সামারি</div>

          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-icon">📦</div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-unit">{item.unit}</div>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => handleQtyChange(item.id, -1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => handleQtyChange(item.id, 1)}>+</button>
                  <button className="remove-btn" onClick={() => handleRemove(item.id)}>✕ সরান</button>
                </div>
              </div>
              <div className="cart-item-price">৳{(item.price * item.qty).toLocaleString('bn-BD')}</div>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <div className="summary-row">
              <span>পণ্যমূল্য ({cartItems.reduce((s, i) => s + i.qty, 0)} টি)</span>
              <span>৳{subtotal.toLocaleString('bn-BD')}</span>
            </div>
            <div className="summary-row">
              <span>ডেলিভারি চার্জ</span>
              <span>{deliveryCharge === 0 ? 'বিনামূল্যে' : `৳${deliveryCharge}`}</span>
            </div>

            {subtotal < 10000 && (
              <div className="free-delivery">
                আরও ৳{(10000 - subtotal).toLocaleString('bn-BD')} কিনলে ফ্রি ডেলিভারি পাবেন!
              </div>
            )}

            <div className="summary-row total">
              <span>মোট মূল্য</span>
              <span>৳{total.toLocaleString('bn-BD')}</span>
            </div>
          </div>

          <button
            className="btn-order"
            onClick={handleSubmit}
            disabled={loading || cartItems.length === 0}
          >
            {loading ? (
              <><span className="spinner"></span> প্রক্রিয়া হচ্ছে...</>
            ) : (
              <>✅ অর্ডার নিশ্চিত করুন</>
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#999', marginTop: 12 }}>
            🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ
          </p>
        </div>
      </div>
    </div>
  </div>
</>
```

);
}

// Inline styles for success screen (used outside JSX className)
const styles = {
successOverlay: {
minHeight: ‘100vh’,
background: ‘#faf7f2’,
display: ‘flex’,
alignItems: ‘center’,
justifyContent: ‘center’,
padding: ‘24px’,
fontFamily: “‘Hind Siliguri’, sans-serif”,
},
successCard: {
background: ‘white’,
borderRadius: ‘20px’,
padding: ‘48px 40px’,
textAlign: ‘center’,
maxWidth: ‘440px’,
width: ‘100%’,
boxShadow: ‘0 8px 40px rgba(15,36,66,0.12)’,
},
checkCircle: {
width: ‘80px’,
height: ‘80px’,
background: ‘#0f2442’,
borderRadius: ‘50%’,
display: ‘flex’,
alignItems: ‘center’,
justifyContent: ‘center’,
fontSize: ‘2.2rem’,
color: ‘#e8a020’,
margin: ‘0 auto 20px’,
},
successTitle: {
fontFamily: “‘Tiro Bangla’, serif”,
color: ‘#0f2442’,
fontSize: ‘1.6rem’,
marginBottom: ‘8px’,
},
successSub: { color: ‘#555’, marginBottom: ‘8px’, fontSize: ‘0.95rem’ },
successMsg: { color: ‘#888’, fontSize: ‘0.9rem’, marginBottom: ‘28px’ },
successBtns: { display: ‘flex’, gap: ‘12px’, justifyContent: ‘center’, flexWrap: ‘wrap’ },
btnPrimary: {
padding: ‘12px 24px’,
background: ‘#0f2442’,
color: ‘white’,
borderRadius: ‘10px’,
textDecoration: ‘none’,
fontWeight: ‘600’,
fontSize: ‘0.9rem’,
},
btnOutline: {
padding: ‘12px 24px’,
background: ‘white’,
color: ‘#0f2442’,
border: ‘2px solid #0f2442’,
borderRadius: ‘10px’,
textDecoration: ‘none’,
fontWeight: ‘600’,
fontSize: ‘0.9rem’,
},
};
