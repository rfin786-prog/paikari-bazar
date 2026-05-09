'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ── Toast ─────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, leaving: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 2200);
  }, []);
  return { toasts, showToast };
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', bottom: '28px', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column',
      gap: '10px', alignItems: 'center', pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'linear-gradient(135deg, #0f2442, #1a3a6b)',
          color: '#fff', padding: '12px 22px', borderRadius: '50px',
          fontSize: '14px', fontFamily: 'Hind Siliguri, sans-serif',
          fontWeight: '600', boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          border: '1px solid rgba(232,160,32,0.35)', whiteSpace: 'nowrap',
          animation: t.leaving
            ? 'toastOut 0.3s ease forwards'
            : 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          <span style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #e8a020, #f5c842)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', flexShrink: 0, color: '#0f2442', fontWeight: '800',
          }}>✓</span>
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity:0; transform:translateY(16px) scale(0.9); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity:1; transform:translateY(0) scale(1); }
          to   { opacity:0; transform:translateY(8px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
      padding: '14px', border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ height: 'clamp(110px, 15vw, 180px)', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', marginBottom: '10px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', marginBottom: '6px', width: '75%', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', marginBottom: '10px', width: '50%', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', animation: 'pulse 1.5s infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────
function ProductCard({ product, onAddToCart, cartItems }) {
  const inCart = cartItems.find(i => i.id === product.id);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (product.stock === 0) return;
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', borderRadius: '16px',
      padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px',
      border: `1px solid ${inCart ? 'rgba(29,158,117,0.5)' : 'rgba(255,255,255,0.08)'}`,
      transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
      position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {inCart && (
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          background: '#1D9E75', color: '#fff',
          fontSize: '11px', fontWeight: '700',
          padding: '2px 8px', borderRadius: '20px', zIndex: 2,
        }}>🛒 {inCart.qty}</div>
      )}

      {discount && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          background: '#e8a020', color: '#412402',
          fontSize: '10px', fontWeight: '800',
          padding: '2px 7px', borderRadius: '20px', zIndex: 2,
        }}>{discount}% ছাড়</div>
      )}

      {product.stock === 0 && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '16px',
          background: 'rgba(0,0,0,0.55)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 3,
        }}>
          <span style={{ background: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>স্টক শেষ</span>
        </div>
      )}
      {product.stock > 0 && product.stock <= 10 && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          background: '#f97316', color: '#fff',
          fontSize: '10px', fontWeight: '700',
          padding: '2px 7px', borderRadius: '20px', zIndex: 2,
        }}>কম স্টক</div>
      )}

      <div style={{
        width: '100%', height: 'clamp(110px, 15vw, 180px)', borderRadius: '10px',
        overflow: 'hidden', background: 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '40px' }}>{product.emoji || '📦'}</span>
        }
      </div>

      <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', margin: 0, lineHeight: '1.4' }}>{product.name}</p>
      {product.unit && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', margin: 0 }}>প্রতি {product.unit}</p>}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ color: '#e8a020', fontSize: '16px', fontWeight: '800' }}>৳{Number(product.price).toLocaleString()}</span>
        {product.mrp && product.mrp > product.price && (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textDecoration: 'line-through' }}>৳{product.mrp}</span>
        )}
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        style={{
          padding: '10px', border: 'none', borderRadius: '10px',
          fontSize: '13px', fontWeight: '700', cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
          fontFamily: 'Hind Siliguri, sans-serif',
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          background: product.stock === 0
            ? 'rgba(255,255,255,0.08)'
            : added
            ? 'linear-gradient(135deg, #16a34a, #22c55e)'
            : inCart
            ? 'rgba(29,158,117,0.2)'
            : 'linear-gradient(135deg, #e8a020, #f5c842)',
          color: product.stock === 0
            ? 'rgba(255,255,255,0.3)'
            : added || inCart
            ? '#fff'
            : '#0f2442',
          border: inCart && !added ? '1.5px solid #1D9E75' : '1.5px solid transparent',
        }}
      >
        {product.stock === 0
          ? 'স্টক নেই'
          : added
          ? '✓ যোগ হয়েছে!'
          : inCart
          ? `🛒 আছে (${inCart.qty})`
          : <><span style={{ fontSize: '14px' }}>+</span> কার্টে যোগ করুন</>
        }
      </button>
    </div>
  );
}

// ── Floating Cart Bar ─────────────────────────────────────
function FloatingCart({ cartItems, onOrder }) {
  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.qty * Number(i.price), 0);

  if (totalQty === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #e8a020, #f5c842)',
      borderRadius: '16px', padding: '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: 'min(480px, calc(100vw - 32px))',
      zIndex: 999, boxShadow: '0 8px 32px rgba(232,160,32,0.4)',
    }}>
      <div>
        <p style={{ color: '#412402', fontSize: '12px', fontWeight: '600', margin: 0 }}>কার্টে {totalQty}টি</p>
        <p style={{ color: '#412402', fontSize: '18px', fontWeight: '800', margin: 0 }}>মোট ৳{totalPrice.toLocaleString()}</p>
      </div>
      <button
        onClick={onOrder}
        style={{
          background: '#0f2442', color: '#fff', border: 'none',
          padding: '11px 20px', borderRadius: '12px',
          fontSize: '14px', fontWeight: '700', cursor: 'pointer',
          fontFamily: 'Hind Siliguri, sans-serif',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        অর্ডার করুন →
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function ProductsSection() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const { toasts, showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
      const [catRes, prodRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/categories?order=created_at.asc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/products?active=eq.true&order=created_at.desc`, { headers }),
      ]);
      const [catData, prodData] = await Promise.all([catRes.json(), prodRes.json()]);
      setCategories(Array.isArray(catData) ? catData : []);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setLoading(false);
    }
    fetchData();
    const saved = localStorage.getItem('paikari_cart');
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  const addToCart = (product) => {
    const user = localStorage.getItem('user');
    if (!user) { router.push('/login'); return; }
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      let updated;
      if (exists) {
        updated = prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
        showToast(`${product.name} — আরও ১টি যোগ হয়েছে`);
      } else {
        updated = [...prev, { ...product, qty: 1 }];
        showToast(`${product.name} কার্টে যোগ হয়েছে`);
      }
      localStorage.setItem('paikari_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const filtered = products.filter(p => {
    const matchCat = !selectedCategory || p.category_id === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectedCatName = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name
    : 'সব পণ্য';

  const CATEGORY_EMOJIS = ['🌾', '🫙', '🛒', '🫘', '🥛', '🧂', '🌶️', '🍬'];

  return (
    <div style={{
      background: '#0a1628',
      padding: '48px clamp(16px, 5vw, 80px) 100px',
      fontFamily: 'Hind Siliguri, sans-serif',
    }}>
      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (min-width: 640px) {
          .product-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .product-grid { grid-template-columns: repeat(5, 1fr); }
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
      `}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Search + Count একসাথে */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>🔍</span>
            <input
              placeholder="পণ্য খুঁজুন..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '11px 16px 11px 40px',
                borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.12)',
                fontSize: '14px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.07)', color: '#fff',
                outline: 'none', fontFamily: 'Hind Siliguri, sans-serif',
              }}
            />
          </div>
          {!loading && (
            <div style={{
              background: 'rgba(232,160,32,0.12)', border: '1px solid rgba(232,160,32,0.25)',
              borderRadius: '10px', padding: '8px 14px',
              color: '#e8a020', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
            }}>
              {selectedCatName} — {filtered.length} টি
            </div>
          )}
        </div>

        {/* Category horizontal scroll */}
        {!loading && categories.length > 0 && (
          <div
            className="cat-scroll"
            style={{
              display: 'flex', gap: '10px',
              overflowX: 'auto', paddingBottom: '8px',
              marginBottom: '28px', scrollbarWidth: 'none',
            }}
          >
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: 'clamp(10px, 1.5vw, 18px) clamp(14px, 2vw, 22px)',
                borderRadius: '16px', cursor: 'pointer',
                border: `2px solid ${!selectedCategory ? '#e8a020' : 'rgba(255,255,255,0.1)'}`,
                background: !selectedCategory ? 'rgba(232,160,32,0.12)' : 'rgba(255,255,255,0.04)',
                transition: 'all 0.2s', minWidth: 'clamp(80px, 8vw, 110px)', flexShrink: 0,
              }}
            >
              <div style={{
                width: 'clamp(44px, 5vw, 64px)', height: 'clamp(44px, 5vw, 64px)',
                borderRadius: '14px',
                background: !selectedCategory ? 'rgba(232,160,32,0.2)' : 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'clamp(20px, 2.5vw, 28px)',
              }}>🏪</div>
              <span style={{ color: !selectedCategory ? '#e8a020' : 'rgba(255,255,255,0.7)', fontSize: 'clamp(11px, 1.2vw, 14px)', fontWeight: '700' }}>সব</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>{products.length} টি</span>
            </button>

            {categories.map((cat, idx) => {
              const count = products.filter(p => p.category_id === cat.id).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    padding: 'clamp(10px, 1.5vw, 18px) clamp(14px, 2vw, 22px)',
                    borderRadius: '16px', cursor: 'pointer',
                    border: `2px solid ${isActive ? '#e8a020' : 'rgba(255,255,255,0.1)'}`,
                    background: isActive ? 'rgba(232,160,32,0.12)' : 'rgba(255,255,255,0.04)',
                    transition: 'all 0.2s', minWidth: 'clamp(80px, 8vw, 110px)', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 'clamp(44px, 5vw, 64px)', height: 'clamp(44px, 5vw, 64px)',
                    borderRadius: '14px', overflow: 'hidden',
                    background: isActive ? 'rgba(232,160,32,0.2)' : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {cat.image_url
                      ? <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 'clamp(20px, 2.5vw, 28px)' }}>{CATEGORY_EMOJIS[idx % CATEGORY_EMOJIS.length]}</span>
                    }
                  </div>
                  <span style={{ color: isActive ? '#e8a020' : 'rgba(255,255,255,0.7)', fontSize: 'clamp(11px, 1.2vw, 14px)', fontWeight: '700', whiteSpace: 'nowrap' }}>{cat.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>{count} টি</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', margin: '0 auto 16px',
            }}>🔍</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>কোনো পণ্য পাওয়া যায়নি</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>অন্য কিছু দিয়ে খোঁজার চেষ্টা করুন</p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  marginTop: '16px', background: 'rgba(232,160,32,0.12)',
                  border: '1px solid rgba(232,160,32,0.3)', color: '#e8a020',
                  padding: '8px 20px', borderRadius: '10px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer', fontFamily: 'Hind Siliguri, sans-serif',
                }}
              >
                সব পণ্য দেখুন
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid">
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

      <FloatingCart cartItems={cartItems} onOrder={() => router.push('/checkout')} />
      <ToastContainer toasts={toasts} />
    </div>
  );
}
