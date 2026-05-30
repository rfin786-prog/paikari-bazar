'use client';

import { Suspense, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '1/1', background: 'linear-gradient(90deg,#f7f7f7 25%,#efefef 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: '12px' }}>
        <div style={{ height: 10, background: 'linear-gradient(90deg,#f7f7f7 25%,#efefef 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6, marginBottom: 7 }} />
        <div style={{ height: 10, width: '60%', background: 'linear-gradient(90deg,#f7f7f7 25%,#efefef 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6 }} />
      </div>
    </div>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // parent categories
  const [subMap, setSubMap] = useState({});          // parent_id → children[]
  const [activeCategory, setActiveCategory] = useState(null); // category object
  const [activeSubcat, setActiveSubcat] = useState(null);     // subcategory object
  const [loading, setLoading] = useState(true);
  const [cartQty, setCartQty] = useState({});
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const subcatRefs = useRef({});

  // ── Cart sync
  const syncCart = useCallback(() => {
    const cart = getCart();
    const map = {};
    let total = 0, count = 0;
    cart.forEach(i => {
      map[i.id] = i.quantity;
      total += (i.price || 0) * i.quantity;
      count += i.quantity;
    });
    setCartQty(map);
    setCartTotal(total);
    setCartCount(count);
  }, []);

  useEffect(() => {
    syncCart();
    window.addEventListener('cartUpdated', syncCart);
    return () => window.removeEventListener('cartUpdated', syncCart);
  }, [syncCart]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Fetch categories table
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/categories?select=*&order=sort_order.asc,created_at.asc`,
          { headers }
        );
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const parents = data.filter(c => !c.parent_id);
        const children = data.filter(c => c.parent_id);
        const map = {};
        children.forEach(c => {
          if (!map[c.parent_id]) map[c.parent_id] = [];
          map[c.parent_id].push(c);
        });
        setCategories(parents);
        setSubMap(map);
        if (parents.length > 0) setActiveCategory(parents[0]);
      } catch (e) { console.error(e); }
    };
    fetchCategories();
  }, []);

  // ── Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
          { headers }
        );
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  // ── Subcategories for active category
  const subcategories = useMemo(() => {
    if (!activeCategory) return [];
    return subMap[activeCategory.id] || [];
  }, [activeCategory, subMap]);

  // ── Filtered & grouped products
  const groupedProducts = useMemo(() => {
    if (!activeCategory) return {};

    // Match products by category name
    let list = products.filter(p =>
      p.category?.trim().toLowerCase() === activeCategory.name?.trim().toLowerCase()
    );

    if (activeSubcat) {
      return {
        [activeSubcat.name]: list.filter(p =>
          p.subcategory?.trim().toLowerCase() === activeSubcat.name?.trim().toLowerCase()
        )
      };
    }

    // Group by subcategory name
    const groups = {};
    const noSubcat = [];

    // Maintain subcategory order from categories table
    subcategories.forEach(sub => {
      const items = list.filter(p =>
        p.subcategory?.trim().toLowerCase() === sub.name?.trim().toLowerCase()
      );
      if (items.length > 0) groups[sub.name] = { items, sub };
    });

    // Products with no matching subcategory
    list.forEach(p => {
      const matched = subcategories.some(s =>
        s.name?.trim().toLowerCase() === p.subcategory?.trim().toLowerCase()
      );
      if (!matched) noSubcat.push(p);
    });

    if (noSubcat.length > 0) groups['অন্যান্য'] = { items: noSubcat, sub: null };

    return groups;
  }, [products, activeCategory, activeSubcat, subcategories]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setActiveSubcat(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubcatClick = (sub) => {
    if (activeSubcat?.id === sub.id) {
      setActiveSubcat(null);
      return;
    }
    setActiveSubcat(sub);
    setTimeout(() => {
      const el = subcatRefs.current[sub.name];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // ── Cart handlers
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const minQty = product.min_order ? parseInt(product.min_order) : 1;
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx === -1) cart.push({ ...product, quantity: minQty });
    else cart[idx].quantity += 1;
    saveCart(cart);
  };

  const handleIncrease = (e, product) => {
    e.stopPropagation();
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx !== -1) { cart[idx].quantity += 1; saveCart(cart); }
  };

  const handleDecrease = (e, product) => {
    e.stopPropagation();
    const minQty = product.min_order ? parseInt(product.min_order) : 1;
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx === -1) return;
    if (cart[idx].quantity <= minQty) cart.splice(idx, 1);
    else cart[idx].quantity -= 1;
    saveCart(cart);
  };

  // ── Product Card
  const ProductCard = ({ p }) => {
    const qty = cartQty[p.id] || 0;
    const inCart = qty > 0;
    const outOfStock = p.stock !== undefined && p.stock !== null && p.stock <= 0;
    const minQty = p.min_order ? parseInt(p.min_order) : 1;
    const discount = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : null;
    const profit = p.mrp && p.price && p.mrp > p.price ? p.mrp - p.price : 0;

    return (
      <div
        className="prod-card"
        onClick={() => !outOfStock && router.push(`/products/${p.id}`)}
        style={{
          background: '#fff',
          borderRadius: 12,
          border: `1.5px solid ${inCart ? '#222' : '#efefef'}`,
          overflow: 'hidden',
          opacity: outOfStock ? 0.55 : 1,
          boxShadow: inCart ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
          cursor: outOfStock ? 'default' : 'pointer',
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}>
        {/* Image */}
        <div style={{ position: 'relative', background: '#f5f5f5', aspectRatio: '1/1', overflow: 'hidden' }}>
          {p.image_url
            ? <img src={p.image_url} alt={p.name} className="prod-img" loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.35s' }} />
            : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                </svg>
              </div>
            )
          }
          {outOfStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: '#333', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 20 }}>Stock নেই</span>
            </div>
          )}
          {discount && !outOfStock && (
            <span style={{ position: 'absolute', top: 8, left: 8, background: '#e8f5e9', color: '#2e7d32', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>
              Save {discount}%
            </span>
          )}
          {inCart && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: '#111', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, border: '2px solid #fff', animation: 'popIn 0.25s ease' }}>
              {qty}
            </div>
          )}
          {!outOfStock && !inCart && (
            <button onClick={e => handleAddToCart(e, p)} className="plus-btn"
              style={{ position: 'absolute', bottom: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1.5px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 300, color: '#333', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.15s' }}>
              +
            </button>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '10px 10px 12px' }}>
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>৳{p.price?.toLocaleString('bn-BD')}</span>
              {p.mrp && p.mrp > p.price && (
                <span style={{ fontSize: 11, color: '#bbb', textDecoration: 'line-through', fontWeight: 500 }}>৳{p.mrp?.toLocaleString('bn-BD')}</span>
              )}
            </div>
            {profit > 0 && (
              <span style={{ fontSize: 10, background: '#fce4ec', color: '#c62828', fontWeight: 700, padding: '2px 7px', borderRadius: 12, display: 'inline-block', marginTop: 3 }}>
                Profit ৳{profit.toLocaleString('bn-BD')}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#444', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 8, minHeight: 36 }}>
            {p.name}
          </p>
          {minQty > 1 && (
            <p style={{ fontSize: 10, color: '#bbb', marginBottom: 6, fontWeight: 600 }}>Min: {minQty} pcs</p>
          )}
          {!outOfStock && inCart && (
            <div onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', borderRadius: 8, overflow: 'hidden', height: 34 }}>
              <button onClick={e => handleDecrease(e, p)} style={{ width: 38, height: 34, background: 'none', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{qty}</span>
              <button onClick={e => handleIncrease(e, p)} style={{ width: 38, height: 34, background: 'none', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family: 'Hind Siliguri', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .prod-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.09) !important; }
        .prod-card:hover .prod-img { transform: scale(1.04); }
        .plus-btn:hover { background: #111 !important; color: #fff !important; border-color: #111 !important; }
        .cat-tab { cursor: pointer; white-space: nowrap; border: none; background: transparent; font-family: 'Hind Siliguri', sans-serif; transition: all 0.15s; flex-shrink: 0; display: flex; align-items: center; gap: 6px; }
        .subcat-chip { cursor: pointer; white-space: nowrap; border: none; font-family: 'Hind Siliguri', sans-serif; transition: all 0.15s; }
        .subcat-chip:hover { background: #111 !important; color: #fff !important; }
        .float-cart { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 150; width: calc(100% - 32px); max-width: 440px; display: flex; align-items: center; justify-content: space-between; background: #111; color: #fff; border: none; border-radius: 14px; padding: 12px 18px; cursor: pointer; box-shadow: 0 8px 40px rgba(0,0,0,0.22); font-family: 'Hind Siliguri', sans-serif; animation: slideUp 0.3s ease forwards; transition: background 0.2s; }
        .float-cart:hover { background: #222; }
        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
        .section-fade { animation: fadeUp 0.3s ease forwards; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f7f7f7', paddingBottom: cartCount > 0 ? 80 : 0 }}>

        {/* ── Category Tab Bar ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {categories.map(cat => {
              const isActive = activeCategory?.id === cat.id;
              return (
                <button key={cat.id} className="cat-tab"
                  onClick={() => handleCategoryClick(cat)}
                  style={{
                    padding: '0 18px', height: 48,
                    fontSize: 13,
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? '#111' : '#999',
                    borderBottom: `2.5px solid ${isActive ? '#111' : 'transparent'}`,
                  }}>
                  {cat.image_url && (
                    <img src={cat.image_url} alt={cat.name} style={{ width: 20, height: 20, objectFit: 'cover', borderRadius: 4 }} />
                  )}
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* ── Subcategory Chips ── */}
          {subcategories.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', overflowX: 'auto', scrollbarWidth: 'none', borderTop: '1px solid #f5f5f5' }}>
              <button className="subcat-chip" onClick={() => setActiveSubcat(null)}
                style={{ flexShrink: 0, width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${!activeSubcat ? '#111' : '#e0e0e0'}`, background: !activeSubcat ? '#111' : '#fff', color: !activeSubcat ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                ↕
              </button>
              {subcategories.map(sub => (
                <button key={sub.id} className="subcat-chip"
                  onClick={() => handleSubcatClick(sub)}
                  style={{
                    flexShrink: 0, padding: '6px 16px', borderRadius: 24,
                    fontSize: 12, fontWeight: 700,
                    border: `1.5px solid ${activeSubcat?.id === sub.id ? '#111' : '#e0e0e0'}`,
                    background: activeSubcat?.id === sub.id ? '#111' : '#fff',
                    color: activeSubcat?.id === sub.id ? '#fff' : '#555',
                  }}>
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, padding: isMobile ? '12px 10px' : '16px 20px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : Object.keys(groupedProducts).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeUp 0.4s ease' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 6 }}>কোনো পণ্য পাওয়া যায়নি</p>
              <p style={{ fontSize: 12, color: '#bbb' }}>অন্য ক্যাটাগরি চেষ্টা করুন</p>
            </div>
          ) : (
            Object.entries(groupedProducts).map(([subcatName, { items }]) => (
              <div key={subcatName} className="section-fade"
                ref={el => subcatRefs.current[subcatName] = el}
                style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: -0.3 }}>{subcatName}</h2>
                  <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600 }}>{items.length}টি পণ্য</span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: isMobile ? 10 : 14,
                }}>
                  {items.map(p => <ProductCard key={p.id} p={p} />)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Floating Cart ── */}
        {cartCount > 0 && (
          <button className="float-cart" onClick={() => router.push('/cart')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛒</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{cartCount}টি পণ্য</div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>৳{cartTotal.toLocaleString('bn-BD')}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700 }}>
              <span>Cart দেখুন</span>
              <span>→</span>
            </div>
          </button>
        )}
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hind Siliguri, sans-serif', color: '#bbb', fontSize: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
          <p>লোড হচ্ছে...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
