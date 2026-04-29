‘use client’;
import { useState, useEffect } from ‘react’;
import { useRouter } from ‘next/navigation’;
import { createClient } from ‘@supabase/supabase-js’;

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
const router = useRouter();
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [cart, setCart] = useState({});
const [user, setUser] = useState(null);

useEffect(() => {
// User check
const savedUser = localStorage.getItem(‘user’);
if (!savedUser) { router.push(’/login’); return; }
setUser(JSON.parse(savedUser));

```
// Cart load
const savedCart = localStorage.getItem('paikari_cart');
if (savedCart) {
  const items = JSON.parse(savedCart);
  const cartMap = {};
  items.forEach(i => { cartMap[i.id] = i.qty; });
  setCart(cartMap);
}

// Products from Supabase
async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (!error && data) setProducts(data);
  setLoading(false);
}
fetchProducts();
```

}, []);

// Save cart to localStorage whenever cart changes
useEffect(() => {
const items = products
.filter(p => cart[p.id])
.map(p => ({ …p, qty: cart[p.id] }));
localStorage.setItem(‘paikari_cart’, JSON.stringify(items));
}, [cart, products]);

const totalItems = Object.values(cart).reduce((s, q) => s + q, 0);
const totalPrice = products
.filter(p => cart[p.id])
.reduce((s, p) => s + p.price * cart[p.id], 0);

const addToCart = (product) => {
setCart(prev => ({ …prev, [product.id]: (prev[product.id] || 0) + 1 }));
};

const removeFromCart = (productId) => {
setCart(prev => {
const updated = { …prev };
if (updated[productId] > 1) updated[productId]–;
else delete updated[productId];
return updated;
});
};

const handleLogout = () => {
localStorage.removeItem(‘user’);
localStorage.removeItem(‘paikari_cart’);
router.push(’/’);
};

const handleCheckout = () => {
if (totalItems === 0) return;
router.push(’/checkout’);
};

return (
<main style={{ minHeight: ‘100vh’, background: ‘#faf7f2’, fontFamily: ‘Hind Siliguri, sans-serif’, paddingBottom: totalItems > 0 ? ‘100px’ : ‘24px’ }}>

```
  {/* Header */}
  <div style={{ background: '#0f2442', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40 }}>
    <h1 style={{ color: '#e8a020', fontSize: '22px', fontWeight: '800', margin: 0 }}>পাইকারি বাজার</h1>
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      {totalItems > 0 && (
        <button
          onClick={handleCheckout}
          style={{ background: '#e8a020', border: 'none', color: '#0f2442', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
          🛒 {totalItems}টি
        </button>
      )}
      <button
        onClick={handleLogout}
        style={{ background: 'transparent', border: '1px solid #e8a020', color: '#e8a020', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
        লগআউট
      </button>
    </div>
  </div>

  {/* Welcome */}
  <div style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid #e0d8cc' }}>
    <h2 style={{ color: '#0f2442', fontSize: '18px', margin: 0 }}>স্বাগতম! 👋 {user?.name || ''}</h2>
    <p style={{ color: '#888', margin: '4px 0 0', fontSize: '13px' }}>{user?.shop_name || 'আজকের পণ্য তালিকা দেখুন'}</p>
  </div>

  {/* Products */}
  <div style={{ padding: '20px 24px' }}>
    <h3 style={{ color: '#0f2442', marginBottom: '16px', fontSize: '16px' }}>পণ্য তালিকা</h3>

    {loading ? (
      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>লোড হচ্ছে...</div>
    ) : products.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>কোনো পণ্য নেই</div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {products.map(p => (
          <div key={p.id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(15,36,66,0.08)', border: cart[p.id] ? '2px solid #e8a020' : '1px solid #e0d8cc' }}>
            {p.image_url && (
              <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ color: '#0f2442', margin: '0 0 4px', fontSize: '15px' }}>{p.name}</h4>
                {p.category && <span style={{ background: '#faf7f2', color: '#888', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>{p.category}</span>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#e8a020', fontWeight: '800', fontSize: '20px' }}>৳{p.price}</div>
                {p.unit && <div style={{ color: '#888', fontSize: '12px' }}>প্রতি {p.unit}</div>}
              </div>
            </div>

            {/* Cart Controls */}
            {cart[p.id] ? (
              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#faf7f2', borderRadius: '8px', padding: '6px 12px' }}>
                <button
                  onClick={() => removeFromCart(p.id)}
                  style={{ background: '#0f2442', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>
                  −
                </button>
                <span style={{ fontWeight: '700', color: '#0f2442', fontSize: '15px' }}>{cart[p.id]} টি</span>
                <button
                  onClick={() => addToCart(p)}
                  style={{ background: '#e8a020', color: '#0f2442', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(p)}
                disabled={p.stock === 0}
                style={{ marginTop: '14px', width: '100%', padding: '10px', background: p.stock === 0 ? '#ccc' : '#0f2442', color: '#fff', border: 'none', borderRadius: '8px', cursor: p.stock === 0 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}>
                {p.stock === 0 ? 'স্টক নেই' : 'কার্টে যোগ করুন'}
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Sticky Checkout Bar */}
  {totalItems > 0 && (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f2442', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}>
      <div>
        <div style={{ color: '#fff', fontSize: '13px' }}>{totalItems} টি পণ্য</div>
        <div style={{ color: '#e8a020', fontWeight: '800', fontSize: '18px' }}>৳{Number(totalPrice).toLocaleString('bn-BD')}</div>
      </div>
      <button
        onClick={handleCheckout}
        style={{ background: '#e8a020', color: '#0f2442', border: 'none', padding: '12px 28px', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '800' }}>
        অর্ডার করুন →
      </button>
    </div>
  )}
</main>
```

);
}
