"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ── Toast ─────────────────────────────────────────────────
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
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '50px',
          fontSize: '14px',
          fontFamily: "'Hind Siliguri', sans-serif",
          fontWeight: '600',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          border: '1px solid rgba(232,160,32,0.3)',
          animation: t.leaving
            ? 'toastOut 0.3s ease forwards'
            : 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #e8a020, #f5c842)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', flexShrink: 0,
          }}>✓</span>
          <span>{t.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(8px) scale(0.95); }
        }
        @keyframes dotPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.6); opacity: 0.5; }
        }
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

// ── Skeleton ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '14px',
      border: '1px solid #f0ede6',
      overflow: 'hidden',
    }}>
      <div style={{ background: '#f0ede6', height: '130px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ height: '12px', background: '#f0ede6', borderRadius: '6px', width: '50%', marginBottom: '8px' }} />
        <div style={{ height: '14px', background: '#f0ede6', borderRadius: '6px', width: '80%', marginBottom: '8px' }} />
        <div style={{ height: '20px', background: '#f0ede6', borderRadius: '6px', width: '40%', marginBottom: '12px' }} />
        <div style={{ height: '36px', background: '#f0ede6', borderRadius: '10px' }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────
function ProductCard({ product, onAddToCart, cartItems }) {
  const inCart = cartItems.find(i => i.id === product.id);
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '14px',
        border: '1px solid #f0ede6',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        cursor: 'pointer',
      }}
    >
      {/* Image area */}
      <div style={{
        background: '#f8f4ed',
        height: '130px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '38px', opacity: 0.2 }}>📦</span>
        )}

        {/* Category badge */}
        {product.category && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px',
            background: '#e8a020', color: '#0a1a2e',
            fontSize: '10px', fontWeight: '700',
            padding: '2px 8px', borderRadius: '100px',
          }}>{product.category}</span>
        )}

        {/* Low stock */}
        {product.stock <= 10 && product.stock > 0 && (
          <span style={{
            position: 'absolute', top: '8px', right: '8px',
            background: '#f97316', color: '#fff',
            fontSize: '10px', fontWeight: '700',
            padding: '2px 7px', borderRadius: '100px',
          }}>কম স্টক</span>
        )}

        {/* Stock out overlay */}
        {product.stock === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: '#ef4444', color: '#fff',
              fontSize: '11px', fontWeight: '700',
              padding: '3px 10px', borderRadius: '100px',
            }}>স্টক শেষ</span>
          </div>
        )}

        {/* In cart badge */}
        {inCart && (
          <span style={{
            position: 'absolute', bottom: '8px', right: '8px',
            background: '#22c55e', color: '#fff',
            fontSize: '10px', fontWeight: '700',
            padding: '2px 8px', borderRadius: '100px',
          }}>🛒 {inCart.qty}</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 2px', lineHeight: '1.4' }}>
          {product.name}
        </p>
        {product.unit && (
          <p style={{ fontSize: '11px', color: '#aaa', margin: '0 0 8px' }}>প্রতি {product.unit}</p>
        )}
        <p style={{ fontSize: '18px', fontWeight: '900', color: '#b8820f', margin: '0 0 10px' }}>
          ৳{Number(product.price).toLocaleString('bn-BD')}
        </p>

        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '700',
            border: inCart && !added ? '2px solid #22c55e' : 'none',
            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
            background: product.stock === 0
              ? '#f0f0f0'
              : added
              ? '#22c55e'
              : inCart
              ? '#f0fdf4'
              : '#e8a020',
            color: product.stock === 0
              ? '#aaa'
              : added
              ? '#fff'
              : inCart
              ? '#15803d'
              : '#0a1a2e',
            transition: 'all 0.2s ease',
            transform: added ? 'scale(0.97)' : 'scale(1)',
          }}
        >
          {product.stock === 0
            ? 'স্টক নেই'
            : added
            ? '✓ যোগ হয়েছে!'
            : inCart
            ? `🛒 কার্টে আছে (${inCart.qty})`
            : '🛒 কার্টে যোগ করুন'}
        </button>
      </div>
    </div>
  );
}

// ── Cart Drawer ───────────────────────────────────────────
function CartDrawer({ items, onClose, onUpdateQty, onRemove }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative',
        background: '#fff',
        width: '100%',
        maxWidth: '360px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px',
          borderBottom: '1px solid #f0ede6',
        }}>
          <h2 style={{ fontWeight: '800', fontSize: '16px', color: '#1a1a1a', margin: 0 }}>
            🛒 আপনার কার্ট ({items.length})
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '22px', color: '#aaa', cursor: 'pointer', lineHeight: 1 }}
          >×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '80px', color: '#ccc' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
              <p style={{ fontSize: '14px' }}>কার্ট খালি আছে</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{
              display: 'flex', gap: '10px',
              background: '#faf8f4',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid #f0ede6',
            }}>
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '10px',
                background: '#f0ede6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '22px' }}>📦</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                <p style={{ fontSize: '13px', color: '#b8820f', fontWeight: '800', margin: '0 0 6px' }}>৳{Number(item.price).toLocaleString('bn-BD')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => onUpdateQty(item.id, item.qty - 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f0ede6', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => onUpdateQty(item.id, item.qty + 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e8a020', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px', color: '#0a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  <button onClick={() => onRemove(item.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>সরান</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #f0ede6', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#888' }}>
              <span>মোট পণ্য</span>
              <span>{items.reduce((s, i) => s + i.qty, 0)} টি</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '17px', color: '#1a1a1a' }}>
              <span>মোট মূল্য</span>
              <span style={{ color: '#b8820f' }}>৳{Number(total).toLocaleString('bn-BD')}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              style={{
                display: 'block',
                width: '100%',
                background: '#e8a020',
                color: '#0a1a2e',
                textAlign: 'center',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '15px',
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              অর্ডার করুন →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const { toasts, showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          const cats = ['সব', ...new Set(data.map(p => p.category).filter(Boolean))];
          setCategories(cats);
        }
      } catch (err) {
        console.error('Products fetch error:', err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('paikari_cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch (_) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('paikari_cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartItems]);

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'সব' || p.category === selectedCategory;
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        showToast(`${product.name} — আরও ১টি যোগ হয়েছে`);
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      showToast(`${product.name} কার্টে যোগ হয়েছে`);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) setCartItems(prev => prev.filter(i => i.id !== id));
    else setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const removeItem = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4', fontFamily: "'Hind Siliguri', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');`}</style>

      {/* Navbar */}
      <nav style={{
        background: '#000',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '6px', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '900', letterSpacing: '-0.5px' }}>আড়ৎ</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '3px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b3b', display: 'block', animation: 'dotPulse 1.2s ease-in-out infinite' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e8a020', display: 'block', animation: 'dotPulse 1.2s ease-in-out infinite 0.4s' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'block', animation: 'dotPulse 1.2s ease-in-out infinite 0.8s' }} />
          </div>
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: '360px', position: 'relative' }}>
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>🔍</span>
        </div>

        {/* Cart */}
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#e8a020',
            color: '#0a1a2e',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          🛒 কার্ট
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-7px', right: '-7px',
              background: '#ff3b3b',
              color: '#fff',
              fontSize: '10px',
              width: '18px', height: '18px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700',
            }}>{cartCount}</span>
          )}
        </button>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: '700',
                border: selectedCategory === cat ? 'none' : '1px solid #e8e0d0',
                background: selectedCategory === cat ? '#e8a020' : '#fff',
                color: selectedCategory === cat ? '#0a1a2e' : '#666',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {!loading && (
          <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '14px' }}>
            {filtered.length} টি পণ্য পাওয়া গেছে
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px', color: '#ccc' }}>
            <div style={{ fontSize: '52px', marginBottom: '14px' }}>🔍</div>
            <p style={{ fontSize: '15px', fontWeight: '600' }}>কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                cartItems={cartItems}
              />
            ))}
          </div>
        )}
      </div>

      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onRemove={removeItem}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
