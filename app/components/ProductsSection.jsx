"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ── Toast System ──────────────────────────────────────────
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
          animation: t.leaving ? 'toastOut 0.3s ease forwards' : 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
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
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 2000);
  }, []);

  return { toasts, showToast };
}

// ── Skeleton ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="bg-gray-200 h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────
function ProductCard({ product, onAddToCart, cartItems }) {
  const inCart = cartItems.find((i) => i.id === product.id);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="relative bg-gray-50 h-48 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-5xl opacity-30">📦</div>
        )}
        {product.stock <= 10 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">কম স্টক</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-red-500 px-3 py-1 rounded-full">স্টক শেষ</span>
          </div>
        )}
        {inCart && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            🛒 {inCart.qty}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-indigo-500 font-medium mb-1 uppercase tracking-wide">{product.category || 'সাধারণ'}</p>
        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1 line-clamp-2">{product.name}</h3>
        {product.unit && <p className="text-xs text-gray-400 mb-2">প্রতি {product.unit}</p>}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-xl font-bold text-gray-900">৳{Number(product.price).toLocaleString('bn-BD')}</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-green-500 text-white scale-95'
                : inCart
                ? 'bg-green-50 text-green-700 border-2 border-green-400 hover:bg-green-100'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
            }`}
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
    </div>
  );
}

// ── Cart Drawer ───────────────────────────────────────────
function CartDrawer({ items, onClose, onUpdateQty, onRemove }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg text-gray-800">🛒 আপনার কার্ট ({items.length})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🛒</div>
              <p>কার্ট খালি আছে</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-sm text-indigo-600 font-semibold">৳{Number(item.price).toLocaleString('bn-BD')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => onUpdateQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center hover:bg-gray-300">−</button>
                    <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center hover:bg-indigo-200">+</button>
                    <button onClick={() => onRemove(item.id)} className="ml-auto text-red-400 hover:text-red-600 text-xs">সরান</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>মোট পণ্য</span>
              <span>{items.reduce((s, i) => s + i.qty, 0)} টি</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-800">
              <span>মোট মূল্য</span>
              <span>৳{Number(total).toLocaleString('bn-BD')}</span>
            </div>
            <Link href="/checkout" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-xl font-semibold transition-colors" onClick={onClose}>
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
  const [sortBy, setSortBy] = useState('default');

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
          const cats = ['সব', ...new Set(data.map((p) => p.category).filter(Boolean))];
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
    const saved = localStorage.getItem('paikari_cart');
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('paikari_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const filtered = products
    .filter((p) => {
      const matchCat = selectedCategory === 'সব' || p.category === selectedCategory;
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
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
    <div className="min-h-screen bg-gray-50">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap'); body { font-family: 'Hind Siliguri', sans-serif; }`}</style>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl">🚚</span>
            <span className="font-bold text-indigo-700 text-lg">পাইকারি<span className="text-gray-800">বাজার</span></span>
          </Link>
          <div className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-xl hover:bg-indigo-50 transition-colors">
              📦 <span className="hidden sm:inline">আমার অর্ডার</span>
            </Link>
            <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              🛒
              <span className="hidden sm:inline">কার্ট</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-2 flex-wrap flex-1">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'}`}>
                {cat}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="default">ডিফল্ট</option>
            <option value="price_asc">দাম: কম থেকে বেশি</option>
            <option value="price_desc">দাম: বেশি থেকে কম</option>
            <option value="name">নাম অনুযায়ী</option>
          </select>
        </div>

        {!loading && <p className="text-sm text-gray-500 mb-4">{filtered.length} টি পণ্য পাওয়া গেছে</p>}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-medium">কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} cartItems={cartItems} />
            ))}
          </div>
        )}
      </div>

      {cartOpen && <CartDrawer items={cartItems} onClose={() => setCartOpen(false)} onUpdateQty={updateQty} onRemove={removeItem} />}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
