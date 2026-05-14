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
          <span style={{ position: 'absolute', top: 8, right: 8, background: '#ff6a00', color: '#fff', fontSize: '9px', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>কম স্টক</span>
        )}
        {product.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '700' }}>স্টক শেষ</span>
          </div>
        )}
        {inCart && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: '#22c55e', color: '#fff', fontSize: '9px', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
            🛒 {inCart.qty}
          </span>
        )}
      </div>

      <div style={{ padding: isMobile ? '8px 10px' : '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: '10px', color: '#6366f1', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase' }}>
          {product.category || 'সাধারণ'}
        </p>
        <h3 style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: '600', color: '#1a1a1a', lineHeight: '1.3', marginBottom: '3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>
        {product.unit && (
          <p style={{ fontSize: '10px', color: '#aaa', marginBottom: '6px' }}>প্রতি {product.unit}</p>
        )}
        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
            ৳{Number(product.price).toLocaleString('bn-BD')}
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
            {product.stock === 0 ? 'স্টক নেই' : added ? '✓ যোগ হয়েছে!' : inCart ? `🛒 কার্টে আছে (${inCart.qty})` : '🛒 কার্টে যোগ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ items, onClose, onUpdateQty, onRemove }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: '380px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>🛒 কার্ট ({items.length})</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9ca3af' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
              <p>কার্ট খালি আছে</p>
            </div>
          ) : items.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '10px', background: '#f9fafb', borderRadius: '12px', padding: '10px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '20px' }}>📦</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                <p style={{ fontSize: '13px', color: '#ff6a00', fontWeight: '700' }}>৳{Number(item.price).toLocaleString('bn-BD')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => onUpdateQty(item.id, item.qty - 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>−</button>
                  <span style={{ fontSize: '13px', fontWeight: '700', width: '20px', textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => onUpdateQty(item.id, item.qty + 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff3eb', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#ff6a00' }}>+</button>
                  <button onClick={() => onRemove(item.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', fontSize: '12px', cursor: 'pointer' }}>সরান</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280' }}>
              <span>মোট পণ্য</span>
              <span>{items.reduce((s, i) => s + i.qty, 0)} টি</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '16px' }}>
              <span>মোট মূল্য</span>
              <span style={{ color: '#ff6a00' }}>৳{Number(total).toLocaleString('bn-BD')}</span>
            </div>
            <Link href="/checkout" style={{ display: 'block', width: '100%', background: '#ff6a00', color: '#fff', textAlign: 'center', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }} onClick={onClose}>
              অর্ডার করুন →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');
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
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
          { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` } }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          const cats = ['সব', ...new Set(data.map((p) => p.category).filter(Boolean))];
          setCategories(cats);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('paikari_cart');
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('paikari_cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartItems]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat) setSelectedCategory(cat);
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === 'সব' || p.category === selectedCategory;
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        showToast(`${product.name} — আরও ১টি যোগ হয়েছে`);
        return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      showToast(`${product.name} কার্টে যোগ হয়েছে`);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) setCartItems((prev) => prev.filter((i) => i.id !== id));
    else setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };

  const removeItem = (id) => setCartItems((prev) => prev.filter((i) => i.id !== id));
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Hind Siliguri', sans-serif" }}>

      {/* Filter bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f3f4f6',
        padding: isMobile ? '8px 12px' : '10px 20px',
        position: 'sticky', top: isMobile ? '113px' : '105px', zIndex: 30
      }}>
        <div className="cat-scroll" style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                background: selectedCategory === cat ? '#ff6a00' : '#f3f4f6',
                color: selectedCategory === cat ? '#fff' : '#555',
                fontFamily: "'Hind Siliguri', sans-serif",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '12px' : '20px' }}>
        {!loading && (
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
            {filtered.length} টি পণ্য পাওয়া গেছে
          </p>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))', gap: isMobile ? '10px' : '14px' }}>
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🔍</div>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>কোনো পণ্য পাওয়া যায়নি</p>
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
