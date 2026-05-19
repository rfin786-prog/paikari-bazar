"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

function ToastContainer({ toasts }) {
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '10px',
      alignItems: 'center', pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'linear-gradient(135deg, #0f2442, #1a3a6b)',
          color: '#fff', padding: '12px 20px', borderRadius: '50px',
          fontSize: '14px', fontFamily: "'Hind Siliguri', sans-serif",
          fontWeight: '600', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          border: '1px solid rgba(232,160,32,0.3)',
          animation: t.leaving ? 'toastOut 0.3s ease forwards' : 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #e8a020, #f5c842)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>✓</span>
          <span>{t.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateY(16px) scale(0.92)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(8px) scale(0.95)} }
        .cat-scroll::-webkit-scrollbar{display:none}
        .cat-scroll{-ms-overflow-style:none;scrollbar-width:none}
        .sub-chip:hover{background:#ff6a00!important;color:#fff!important;border-color:#ff6a00!important}
      `}</style>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, leaving: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 2000);
  }, []);
  return { toasts, showToast };
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #f3f4f6', animation: 'pulse 1.5s infinite' }}>
      <div style={{ height: '150px', background: '#f3f4f6' }} />
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: '10px', background: '#f3f4f6', borderRadius: '6px', width: '70%' }} />
        <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '6px', width: '90%' }} />
        <div style={{ height: '10px', background: '#f3f4f6', borderRadius: '6px', width: '100%' }} />
        <div style={{ height: '16px', background: '#f3f4f6', borderRadius: '6px', width: '40%' }} />
        <div style={{ height: '34px', background: '#f3f4f6', borderRadius: '8px' }} />
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

function ProductCard({ product, onAddToCart, cartItems, isMobile }) {
  const inCart = cartItems.find((i) => i.id === product.id);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const qty = inCart?.qty || 0;
  const btnBg = product.stock === 0 ? '#f3f4f6' : added ? '#22c55e' : inCart ? '#fff' : '#ff6a00';
  const btnColor = product.stock === 0 ? '#9ca3af' : inCart && !added ? '#16a34a' : '#fff';

  return (
    <div
      style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f0f0f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,106,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
    >
      <div style={{ position: 'relative', height: isMobile ? '130px' : '160px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '40px', opacity: 0.2 }}>📦</span>
        }
        {product.stock <= 10 && product.stock > 0 && (
          <span style={{ position: 'absolute', top: 8, right: 8, background: '#ff6a00', color: '#fff', fontSize: '9px', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>Low Stock</span>
        )}
        {product.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '700' }}>Out of Stock</span>
          </div>
        )}
        {inCart && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: '#22c55e', color: '#fff', fontSize: '9px', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
            🛒 {qty}
          </span>
        )}
      </div>

      <div style={{ padding: isMobile ? '8px 10px' : '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: '10px', color: '#6366f1', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase' }}>
          {product.category || 'General'}
        </p>
        <h3 style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: '600', color: '#1a1a1a', lineHeight: '1.3', marginBottom: '3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>

        {/* ✅ Description */}
        {product.description && (
          <p style={{
            fontSize: '10px', color: '#9ca3af', lineHeight: '1.4',
            marginBottom: '5px',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.description}
          </p>
        )}

        {product.unit && (
          <p style={{ fontSize: '10px', color: '#aaa', marginBottom: '6px' }}>Per {product.unit}</p>
        )}
        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
            ৳{Number(product.price).toLocaleString('en-BD')}
          </p>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={{
              width: '100%', padding: isMobile ? '8px' : '9px',
              borderRadius: '9px', border: inCart && !added ? '2px solid #22c55e' : 'none',
              background: btnBg, color: btnColor,
              fontSize: isMobile ? '11px' : '12px', fontWeight: '700',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            {product.stock === 0 ? 'Out of Stock' : added ? '✓ Added!' : inCart ? `🛒 In Cart (${qty})` : '🛒 Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ items, onClose, onUpdateQty, onRemove }) {
  const total = items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: '380px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>🛒 Cart ({items.length})</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9ca3af' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
              <p>Cart is empty</p>
            </div>
          ) : items.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '10px', background: '#f9fafb', borderRadius: '12px', padding: '10px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '20px' }}>📦</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                <p style={{ fontSize: '13px', color: '#ff6a00', fontWeight: '700' }}>৳{Number(item.price).toLocaleString('en-BD')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => onUpdateQty(item.id, (item.qty || 1) - 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>−</button>
                  <span style={{ fontSize: '13px', fontWeight: '700', width: '20px', textAlign: 'center' }}>{item.qty || 1}</span>
                  <button onClick={() => onUpdateQty(item.id, (item.qty || 1) + 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff3eb', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#ff6a00' }}>+</button>
                  <button onClick={() => onRemove(item.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280' }}>
              <span>Total Items</span>
              <span>{items.reduce((s, i) => s + (i.qty || 1), 0)} pcs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '16px' }}>
              <span>Total Amount</span>
              <span style={{ color: '#ff6a00' }}>৳{Number(total).toLocaleString('en-BD')}</span>
            </div>
            <Link href="/checkout" style={{ display: 'block', width: '100%', background: '#ff6a00', color: '#fff', textAlign: 'center', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }} onClick={onClose}>
              Place Order →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [parents, setParents] = useState([]);
  const [subMap, setSubMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toasts, showToast } = useToast();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/categories?select=*&order=name.asc`,
          { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` } }
        );
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const p = data.filter(c => !c.parent_id);
        const map = {};
        data.filter(c => c.parent_id).forEach(c => {
          if (!map[c.parent_id]) map[c.parent_id] = [];
          map[c.parent_id].push(c);
        });
        setParents(p);
        setSubMap(map);
      } catch (e) { console.error(e); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
          { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` } }
        );
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('paikari_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const fixed = parsed.map(i => ({ ...i, qty: i.qty || 1 }));
        setCartItems(fixed);
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('paikari_cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartItems]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat && parents.length > 0) {
      const parent = parents.find(p => p.name === cat);
      if (parent) { setSelectedParent(parent); setSelectedSub(null); }
      else {
        Object.entries(subMap).forEach(([pid, subs]) => {
          const sub = subs.find(s => s.name === cat);
          if (sub) {
            const parent = parents.find(p => p.id === pid);
            setSelectedParent(parent || null);
            setSelectedSub(sub);
          }
        });
      }
    }
  }, [parents, subMap]);

  const filtered = products.filter((p) => {
    if (!selectedParent) return true;
    if (selectedSub) {
      return p.category === selectedSub.name;
    }
    const subs = subMap[selectedParent.id] || [];
    if (subs.length > 0) {
      return subs.some(s => p.category === s.name);
    }
    return p.category === selectedParent.name;
  });

  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        showToast(`${product.name} — 1 more added`);
        return prev.map((i) => i.id === product.id ? { ...i, qty: (i.qty || 1) + 1 } : i);
      }
      showToast(`${product.name} added to cart`);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) setCartItems((prev) => prev.filter((i) => i.id !== id));
    else setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };

  const removeItem = (id) => setCartItems((prev) => prev.filter((i) => i.id !== id));
  const cartCount = cartItems.reduce((s, i) => s + (i.qty || 1), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Hind Siliguri', sans-serif" }}>

      {/* Filter bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f3f4f6',
        position: 'sticky', top: isMobile ? '113px' : '105px', zIndex: 30
      }}>
        {/* Parent categories */}
        <div style={{ padding: isMobile ? '8px 12px 4px' : '10px 20px 4px' }}>
          <div className="cat-scroll" style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              onClick={() => { setSelectedParent(null); setSelectedSub(null); }}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                background: !selectedParent ? '#ff6a00' : '#f3f4f6',
                color: !selectedParent ? '#fff' : '#555',
                fontFamily: "'Hind Siliguri', sans-serif",
              }}
            >
              All
            </button>

            {parents.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedParent(cat); setSelectedSub(null); }}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  background: selectedParent?.id === cat.id ? '#ff6a00' : '#f3f4f6',
                  color: selectedParent?.id === cat.id ? '#fff' : '#555',
                  fontFamily: "'Hind Siliguri', sans-serif",
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                {cat.image_url && <img src={cat.image_url} alt="" style={{ width: '14px', height: '14px', borderRadius: '50%', objectFit: 'cover' }} />}
                {cat.name}
                {subMap[cat.id]?.length > 0 && (
                  <span style={{ fontSize: '8px', opacity: 0.7 }}>▼</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sub categories */}
        {selectedParent && subMap[selectedParent.id]?.length > 0 && (
          <div style={{ padding: isMobile ? '4px 12px 8px' : '4px 20px 8px', borderTop: '1px solid #f9fafb' }}>
            <div className="cat-scroll" style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              <span
                className="sub-chip"
                onClick={() => setSelectedSub(null)}
                style={{
                  cursor: 'pointer', fontSize: '11px', padding: '4px 12px',
                  borderRadius: '20px', border: '1px solid #e5e7eb', whiteSpace: 'nowrap', flexShrink: 0,
                  background: !selectedSub ? '#ff6a00' : '#fff',
                  color: !selectedSub ? '#fff' : '#555',
                  fontWeight: '600', transition: 'all 0.15s',
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
              >
                View All
              </span>

              {subMap[selectedParent.id].map(sub => (
                <span
                  key={sub.id}
                  className="sub-chip"
                  onClick={() => setSelectedSub(sub)}
                  style={{
                    cursor: 'pointer', fontSize: '11px', padding: '4px 12px',
                    borderRadius: '20px', border: '1px solid #e5e7eb', whiteSpace: 'nowrap', flexShrink: 0,
                    background: selectedSub?.id === sub.id ? '#ff6a00' : '#fff',
                    color: selectedSub?.id === sub.id ? '#fff' : '#555',
                    fontWeight: '500', transition: 'all 0.15s',
                    fontFamily: "'Hind Siliguri', sans-serif",
                  }}
                >
                  {sub.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '12px' : '20px' }}>
        {!loading && (
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
            {filtered.length} products found
          </p>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))', gap: isMobile ? '10px' : '14px' }}>
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🔍</div>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>No products found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))', gap: isMobile ? '10px' : '14px' }}>
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} cartItems={cartItems} isMobile={isMobile} />
            ))}
          </div>
        )}
      </div>

      {cartOpen && <CartDrawer items={cartItems} onClose={() => setCartOpen(false)} onUpdateQty={updateQty} onRemove={removeItem} />}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
