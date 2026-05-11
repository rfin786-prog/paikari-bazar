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
          background: '#e62e2e', color: '#fff', padding: '12px 22px', borderRadius: '50px',
          fontSize: '14px', fontFamily: 'Hind Siliguri, sans-serif',
          fontWeight: '600', boxShadow: '0 8px 24px rgba(230,46,46,0.35)', whiteSpace: 'nowrap',
          animation: t.leaving ? 'toastOut 0.3s ease forwards' : 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, color: '#e62e2e', fontWeight: '800' }}>✓</span>
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateY(16px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(8px) scale(0.95)} }
      `}</style>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ height: 'clamp(110px,15vw,180px)', borderRadius: '8px', background: '#f5f5f5', marginBottom: '10px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '12px', borderRadius: '4px', background: '#f0f0f0', marginBottom: '6px', width: '75%', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '10px', borderRadius: '4px', background: '#f5f5f5', marginBottom: '10px', width: '50%', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '34px', borderRadius: '6px', background: '#f0f0f0', animation: 'pulse 1.5s infinite' }} />
      <style>{`@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}`}</style>
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
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : null;

  return (
    <div
      style={{ background: '#fff', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', border: `1.5px solid ${inCart ? '#e62e2e' : '#f0f0f0'}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'transform 0.18s, box-shadow 0.18s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
    >
      {inCart && <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#e62e2e', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', zIndex: 2 }}>🛒 {inCart.qty}</div>}
      {discount && <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ff6000', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '2px 7px', borderRadius: '4px', zIndex: 2 }}>{discount}% ছাড়</div>}
      {product.stock === 0 && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: '10px', background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
          <span style={{ background: '#e62e2e', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '4px 14px', borderRadius: '4px' }}>স্টক শেষ</span>
        </div>
      )}
      {product.stock > 0 && product.stock <= 10 && !discount && (
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ff6000', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px', zIndex: 2 }}>কম স্টক</div>
      )}

      <div style={{ width: '100%', height: 'clamp(110px,15vw,180px)', borderRadius: '8px', overflow: 'hidden', background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '40px', opacity: 0.25 }}>📦</span>}
      </div>

      <p style={{ color: '#222', fontSize: '13px', fontWeight: '500', margin: 0, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
      {product.unit && <p style={{ color: '#999', fontSize: '11px', margin: 0 }}>প্রতি {product.unit}</p>}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
        <span style={{ color: '#e62e2e', fontSize: '17px', fontWeight: '800' }}>৳{Number(product.price).toLocaleString()}</span>
        {product.mrp && product.mrp > product.price && (
          <span style={{ color: '#bbb', fontSize: '11px', textDecoration: 'line-through' }}>৳{product.mrp}</span>
        )}
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        style={{
          marginTop: '4px', padding: '9px', border: 'none', borderRadius: '6px',
          fontSize: '13px', fontWeight: '700', cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
          fontFamily: 'Hind Siliguri, sans-serif', transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          background: product.stock === 0 ? '#f5f5f5' : added ? '#16a34a' : inCart ? '#fff' : '#e62e2e',
          color: product.stock === 0 ? '#bbb' : added ? '#fff' : inCart ? '#e62e2e' : '#fff',
          border: inCart && !added ? '1.5px solid #e62e2e' : '1.5px solid transparent',
        }}
      >
        {product.stock === 0 ? 'স্টক নেই' : added ? '✓ যোগ হয়েছে!' : inCart ? `🛒 আছে (${inCart.qty})` : <><span style={{ fontSize: '14px' }}>+</span> কার্টে যোগ করুন</>}
      </button>
    </div>
  );
}

// ── Floating Cart ─────────────────────────────────────────
function FloatingCart({ cartItems, onOrder }) {
  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.qty * Number(i.price), 0);
  if (totalQty === 0) return null;
  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#e62e2e', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 'min(480px, calc(100vw - 32px))', zIndex: 999, boxShadow: '0 8px 28px rgba(230,46,46,0.4)' }}>
      <div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '500', margin: 0 }}>কার্টে {totalQty}টি পণ্য</p>
        <p style={{ color: '#fff', fontSize: '18px', fontWeight: '800', margin: 0 }}>মোট ৳{totalPrice.toLocaleString()}</p>
      </div>
      <button onClick={onOrder} style={{ background: '#fff', color: '#e62e2e', border: 'none', padding: '11px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'Hind Siliguri, sans-serif' }}>
        অর্ডার করুন →
      </button>
    </div>
  );
}

// ── Category Button ───────────────────────────────────────
function CatBtn({ cat, isActive, onClick, count, size = 'lg' }) {
  const isLg = size === 'lg';
  return (
    <button
      onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isLg ? '6px' : '4px', padding: isLg ? '10px 14px' : '7px 12px', borderRadius: '10px', cursor: 'pointer', flexShrink: 0, border: `2px solid ${isActive ? '#e62e2e' : '#eee'}`, background: isActive ? '#fff1f1' : '#fff', transition: 'all 0.15s', minWidth: isLg ? '76px' : 'unset' }}
    >
      <div style={{ width: isLg ? '52px' : '36px', height: isLg ? '52px' : '36px', borderRadius: '8px', overflow: 'hidden', background: isActive ? '#ffe0e0' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {cat.image_url
          ? <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: isLg ? '22px' : '16px', opacity: 0.25 }}>▪</span>}
      </div>
      <span style={{ color: isActive ? '#e62e2e' : '#444', fontSize: isLg ? '12px' : '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>{cat.name}</span>
      <span style={{ color: '#aaa', fontSize: '10px' }}>{count} টি</span>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function ProductsSection() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
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
      setAllCategories(Array.isArray(catData) ? catData : []);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setLoading(false);
    }
    fetchData();
    const saved = localStorage.getItem('paikari_cart');
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  const parents = allCategories.filter(c => !c.parent_id);
  const subs = allCategories.filter(c => !!c.parent_id);
  const activeSubs = selectedParent ? subs.filter(s => s.parent_id === selectedParent) : [];

  const handleParentClick = (id) => {
    if (selectedParent === id) { setSelectedParent(null); setSelectedSub(null); }
    else { setSelectedParent(id); setSelectedSub(null); }
  };
  const handleSubClick = (id) => setSelectedSub(selectedSub === id ? null : id);
  const handleAllClick = () => { setSelectedParent(null); setSelectedSub(null); };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (selectedSub) return matchSearch && p.sub_category_id === selectedSub;
    if (selectedParent) {
      const subIds = subs.filter(s => s.parent_id === selectedParent).map(s => s.id);
      return matchSearch && (p.category_id === selectedParent || subIds.includes(p.sub_category_id));
    }
    return matchSearch;
  });

  const selectedLabel = selectedSub
    ? allCategories.find(c => c.id === selectedSub)?.name
    : selectedParent ? allCategories.find(c => c.id === selectedParent)?.name : 'সব পণ্য';

  const addToCart = (product) => {
    const user = localStorage.getItem('user');
    if (!user) { router.push('/login'); return; }
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      let updated;
      if (exists) { updated = prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i); showToast(`${product.name} — আরও ১টি যোগ হয়েছে`); }
      else { updated = [...prev, { ...product, qty: 1 }]; showToast(`${product.name} কার্টে যোগ হয়েছে`); }
      localStorage.setItem('paikari_cart', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div style={{ background: '#f5f5f5', padding: '20px clamp(12px,4vw,60px) 100px', fontFamily: 'Hind Siliguri, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .product-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        @media(min-width:640px){ .product-grid{grid-template-columns:repeat(3,1fr);} }
        @media(min-width:1024px){ .product-grid{grid-template-columns:repeat(5,1fr);} }
        .cat-scroll::-webkit-scrollbar{display:none;}
        .sub-row{animation:subFadeIn 0.22s ease forwards;}
        @keyframes subFadeIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Search */}
        <div style={{ background: '#fff', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
          <span style={{ fontSize: '16px', color: '#bbb' }}>🔍</span>
          <input
            placeholder="পণ্য খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#333', fontFamily: 'Hind Siliguri, sans-serif', background: 'transparent' }}
          />
          {!loading && <span style={{ color: '#e62e2e', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>{selectedLabel} — {filtered.length} টি</span>}
        </div>

        {/* Parent row */}
        {!loading && parents.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '10px', padding: '12px', marginBottom: activeSubs.length > 0 ? '8px' : '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
            <div className="cat-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              <button
                onClick={handleAllClick}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', flexShrink: 0, border: `2px solid ${!selectedParent ? '#e62e2e' : '#eee'}`, background: !selectedParent ? '#fff1f1' : '#fff', transition: 'all 0.15s', minWidth: '72px' }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: !selectedParent ? '#ffe0e0' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏪</div>
                <span style={{ color: !selectedParent ? '#e62e2e' : '#444', fontSize: '12px', fontWeight: '700' }}>সব</span>
                <span style={{ color: '#aaa', fontSize: '10px' }}>{products.length} টি</span>
              </button>
              {parents.map(cat => {
                const subIds = subs.filter(s => s.parent_id === cat.id).map(s => s.id);
                const count = products.filter(p => p.category_id === cat.id || subIds.includes(p.sub_category_id)).length;
                return <CatBtn key={cat.id} cat={cat} isActive={selectedParent === cat.id} onClick={() => handleParentClick(cat.id)} count={count} size="lg" />;
              })}
            </div>
          </div>
        )}

        {/* Sub row */}
        {!loading && activeSubs.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1.5px solid #ffe0e0' }}>
            <div className="cat-scroll sub-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {activeSubs.map(sub => {
                const count = products.filter(p => p.sub_category_id === sub.id).length;
                return <CatBtn key={sub.id} cat={sub} isActive={selectedSub === sub.id} onClick={() => handleSubClick(sub.id)} count={count} size="sm" />;
              })}
            </div>
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="product-grid">{Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '10px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: '#666', fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>কোনো পণ্য পাওয়া যায়নি</p>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '16px' }}>অন্য কিছু দিয়ে খোঁজার চেষ্টা করুন</p>
            {(selectedParent || selectedSub) && (
              <button onClick={handleAllClick} style={{ background: '#e62e2e', color: '#fff', border: 'none', padding: '9px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Hind Siliguri, sans-serif' }}>সব পণ্য দেখুন</button>
            )}
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(product => <ProductCard key={product.id} product={product} onAddToCart={addToCart} cartItems={cartItems} />)}
          </div>
        )}
      </div>

      <FloatingCart cartItems={cartItems} onOrder={() => router.push('/checkout')} />
      <ToastContainer toasts={toasts} />
    </div>
  );
}
