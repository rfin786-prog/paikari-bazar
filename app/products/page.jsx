'use client';
import { Suspense, useCallback, useMemo } from 'react';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #f0f0f0', overflow: 'hidden' }}>
      <div style={{ height: 160, background: 'linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: 12 }}>
        <div style={{ height: 11, background: 'linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6, marginBottom: 8 }} />
        <div style={{ height: 11, width: '65%', background: 'linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6, marginBottom: 14 }} />
        <div style={{ height: 38, background: 'linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 9 }} />
      </div>
    </div>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts]             = useState([]);
  const [brands, setBrands]                 = useState([]);
  const [selectedBrand, setSelectedBrand]   = useState('');
  const [activeTab, setActiveTab]           = useState('hot'); // 'hot' | category name
  const [selectedSubcat, setSelectedSubcat] = useState('');
  const [sortBy, setSortBy]                 = useState('newest');
  const [loading, setLoading]               = useState(true);
  const [cartQty, setCartQty]               = useState({});
  const [cartTotal, setCartTotal]           = useState(0);
  const [cartCount, setCartCount]           = useState(0);
  const [isMobile, setIsMobile]             = useState(false);
  const [showProfit, setShowProfit]         = useState({});
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const drawerRef = useRef(null);
  const tabBarRef = useRef(null);

  // ── sync cart ──────────────────────────────────────────────
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

  useEffect(() => {
    if (!drawerOpen) return;
    const h = (e) => { if (drawerRef.current && !drawerRef.current.contains(e.target)) setDrawerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [drawerOpen]);

  // ── fetch ──────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchProducts(); fetchBrands(); }, [fetchProducts, fetchBrands]);

  // ── derived data ───────────────────────────────────────────
  const categories = useMemo(() =>
    [...new Set(products.map(p => p.category).filter(Boolean))].sort(),
  [products]);

  const subcategories = useMemo(() => {
    if (activeTab === 'hot') return [];
    return [...new Set(
      products.filter(p => p.category === activeTab).map(p => p.subcategory).filter(Boolean)
    )].sort();
  }, [products, activeTab]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedBrand) list = list.filter(p => p.brand_id === selectedBrand);

    if (activeTab === 'hot') {
      // newest 20 as "hot sale"
      list = list.slice(0, 20);
    } else {
      list = list.filter(p => p.category === activeTab);
      if (selectedSubcat) list = list.filter(p => p.subcategory === selectedSubcat);
    }

    if (sortBy === 'price_asc')  list.sort((a,b) => a.price - b.price);
    if (sortBy === 'price_desc') list.sort((a,b) => b.price - a.price);
    return list;
  }, [products, selectedBrand, activeTab, selectedSubcat, sortBy]);

  // ── profit animation ───────────────────────────────────────
  useEffect(() => {
    if (filtered.length === 0) return;
    const timers = [];
    filtered.forEach((p, i) => {
      const profit = p.mrp && p.price && p.mrp > p.price ? p.mrp - p.price : 0;
      if (profit <= 0) return;
      const delay = (i % 5) * 600;
      const cycle = () => {
        const t1 = setTimeout(() => {
          setShowProfit(prev => ({ ...prev, [p.id]: true }));
          const t2 = setTimeout(() => {
            setShowProfit(prev => ({ ...prev, [p.id]: false }));
          }, 2000);
          timers.push(t2);
        }, delay);
        timers.push(t1);
      };
      cycle();
      const interval = setInterval(cycle, 4000 + delay);
      timers.push(interval);
    });
    return () => timers.forEach(t => clearTimeout(t) || clearInterval(t));
  }, [filtered.length]);

  // ── cart handlers ──────────────────────────────────────────
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedSubcat('');
  };

  const activeBrandName = brands.find(b => b.id === selectedBrand)?.name;

  // ── Brand Sidebar ──────────────────────────────────────────
  const BrandList = () => (
    <div style={{ padding: '14px 10px' }}>
      <p style={{ fontSize: 9, fontWeight: 800, color: '#bbb', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 6 }}>Brand</p>
      {[{ id: '', name: 'All Brands' }, ...brands].map(brand => {
        const isActive = selectedBrand === brand.id;
        return (
          <button key={brand.id || 'all'}
            onClick={() => { setSelectedBrand(brand.id === selectedBrand ? '' : brand.id); if (isMobile) setDrawerOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px', borderRadius: 8, marginBottom: 2, border: 'none', cursor: 'pointer', textAlign: 'left', background: isActive ? '#111' : 'transparent', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f5f5f5'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            {brand.logo_url
              ? <img src={brand.logo_url} alt={brand.name} style={{ height: 20, width: 40, objectFit: 'contain', borderRadius: 4, filter: isActive ? 'brightness(0) invert(1)' : 'none' }} />
              : <div style={{ width: 28, height: 20, background: isActive ? 'rgba(255,255,255,0.15)' : '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: isActive ? '#fff' : '#bbb', flexShrink: 0 }}>{brand.name?.charAt(0)}</div>
            }
            <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#fff' : '#444', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.name}</span>
            {isActive && <span style={{ fontSize: 9, color: '#fff', opacity: 0.7 }}>✓</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family: 'Hind Siliguri', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes shimmer   { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeUp    { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn     { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes fadeScrim { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp   { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

        .prod-card { animation: fadeUp 0.3s ease forwards; background: #fff; cursor: pointer; transition: transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s, border-color 0.22s; }
        .prod-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; border-color: #111 !important; }
        .prod-card:active { transform: scale(0.98); }
        .prod-img { transition: transform 0.35s ease; display: block; width: 100%; height: 100%; object-fit: cover; }
        .prod-card:hover .prod-img { transform: scale(1.05); }
        .qty-badge { animation: popIn 0.3s cubic-bezier(.4,0,.2,1) forwards; }
        .qty-btn { border: none; cursor: pointer; font-family: 'Hind Siliguri', sans-serif; font-weight: 800; font-size: 20px; line-height: 1; display: flex; align-items: center; justify-content: center; transition: all 0.15s; background: none; }
        .qty-btn:active { transform: scale(0.85); }
        .cart-btn { border: none; cursor: pointer; font-family: 'Hind Siliguri', sans-serif; transition: all 0.15s; }
        .cart-btn:hover { filter: brightness(0.88); }
        .cart-btn:active { transform: scale(0.97); }

        .tab-btn { cursor: pointer; white-space: nowrap; font-family: 'Hind Siliguri', sans-serif; border: none; transition: all 0.18s; }
        .subcat-chip { cursor: pointer; white-space: nowrap; font-family: 'Hind Siliguri', sans-serif; transition: all 0.15s; }
        .subcat-chip:hover { background: #111 !important; color: #fff !important; border-color: #111 !important; }

        .sort-select { cursor: pointer; font-family: 'Hind Siliguri', sans-serif; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px !important; }
        .sort-select:focus { outline: none; border-color: #111 !important; }

        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; animation: fadeScrim 0.2s ease; }
        .drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 240px; background: #fff; z-index: 201; overflow-y: auto; animation: slideLeft 0.25s ease; box-shadow: 4px 0 24px rgba(0,0,0,0.15); }

        .float-cart { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 150; width: calc(100% - 32px); max-width: 420px; display: flex; align-items: center; justify-content: space-between; background: #111; color: #fff; border: none; border-radius: 14px; padding: 13px 18px; cursor: pointer; box-shadow: 0 8px 32px rgba(0,0,0,0.28); font-family: 'Hind Siliguri', sans-serif; animation: slideUp 0.35s cubic-bezier(.4,0,.2,1) forwards; transition: background 0.2s, transform 0.2s; }
        .float-cart:hover { background: #222; transform: translateX(-50%) translateY(-2px); }
        .float-cart:active { transform: translateX(-50%) scale(0.98); }

        .btn-inner { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .btn-label { position: absolute; display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; transition: opacity 0.8s ease; white-space: nowrap; }
        .btn-label-cart { opacity: 1; }
        .btn-label-cart.faded { opacity: 0; }
        .btn-label-profit { opacity: 0; }
        .btn-label-profit.visible { opacity: 1; }

        .hot-badge { background: #111; color: #fff; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; animation: pulse 2s infinite; }

        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

        @media (max-width: 480px) {
          .product-grid { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
          .prod-name { font-size: 12px !important; min-height: 30px !important; }
          .cart-btn { font-size: 11px !important; }
        }
        @media (min-width: 481px) and (max-width: 768px)  { .product-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (min-width: 769px) and (max-width: 1024px) { .product-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (min-width: 1025px) { .product-grid { grid-template-columns: repeat(auto-fill,minmax(195px,1fr)) !important; } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f7f7f7', paddingBottom: cartCount > 0 ? 84 : 0 }}>

        {/* ── Top Nav ── */}
        <div style={{ background: '#fff', borderBottom: '1.5px solid #ebebeb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

          {/* Category Tab Row */}
          <div ref={tabBarRef} style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #f0f0f0' }}>
            {/* Brand toggle (mobile) */}
            {isMobile && brands.length > 0 && (
              <button onClick={() => setDrawerOpen(true)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, padding: '0 14px', height: 44, background: selectedBrand ? '#111' : '#fff', color: selectedBrand ? '#fff' : '#666', fontSize: 11, fontWeight: 700, border: 'none', borderRight: '1px solid #f0f0f0', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 14 }}>🏪</span>
                <span>{activeBrandName || 'Brand'}</span>
              </button>
            )}

            {/* Hot Sale tab */}
            <button className="tab-btn" onClick={() => handleTabClick('hot')}
              style={{ flexShrink: 0, padding: '0 16px', height: 44, fontSize: 13, fontWeight: 800, background: activeTab === 'hot' ? '#111' : 'transparent', color: activeTab === 'hot' ? '#fff' : '#555', borderBottom: activeTab === 'hot' ? '2.5px solid #111' : '2.5px solid transparent', display: 'flex', alignItems: 'center', gap: 6 }}>
              🔥 Hot Sale
            </button>

            {/* Category tabs */}
            {categories.map(cat => (
              <button key={cat} className="tab-btn" onClick={() => handleTabClick(cat)}
                style={{ flexShrink: 0, padding: '0 16px', height: 44, fontSize: 13, fontWeight: 700, background: activeTab === cat ? '#111' : 'transparent', color: activeTab === cat ? '#fff' : '#555', borderBottom: activeTab === cat ? '2.5px solid #111' : '2.5px solid transparent' }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Subcategory chips (only when a category is active & has subcats) */}
          {activeTab !== 'hot' && subcategories.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #f5f5f5' }}>
              <button className="subcat-chip" onClick={() => setSelectedSubcat('')}
                style={{ flexShrink: 0, padding: '5px 13px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1.5px solid ${selectedSubcat === '' ? '#111' : '#e0e0e0'}`, background: selectedSubcat === '' ? '#111' : '#fff', color: selectedSubcat === '' ? '#fff' : '#666' }}>
                All
              </button>
              {subcategories.map(sub => (
                <button key={sub} className="subcat-chip" onClick={() => setSelectedSubcat(sub === selectedSubcat ? '' : sub)}
                  style={{ flexShrink: 0, padding: '5px 13px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1.5px solid ${selectedSubcat === sub ? '#111' : '#e0e0e0'}`, background: selectedSubcat === sub ? '#111' : '#fff', color: selectedSubcat === sub ? '#fff' : '#666' }}>
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Count + Sort row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 12, color: '#888' }}>
                <b style={{ color: '#111', fontWeight: 800 }}>{filtered.length}</b> পণ্য
              </span>
              {activeTab === 'hot' && <span className="hot-badge">Hot Sale</span>}
              {activeTab !== 'hot' && selectedSubcat && (
                <span style={{ fontSize: 11, background: '#111', color: '#fff', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{selectedSubcat}</span>
              )}
              {activeBrandName && (
                <span style={{ fontSize: 11, background: '#f0f0f0', color: '#444', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{activeBrandName}</span>
              )}
              {(selectedBrand || selectedSubcat) && (
                <button onClick={() => { setSelectedBrand(''); setSelectedSubcat(''); }} style={{ fontSize: 11, color: '#999', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Hind Siliguri' }}>Clear</button>
              )}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select"
              style={{ border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '5px 28px 5px 10px', fontSize: 11, color: '#555', outline: 'none', background: '#fafafa', minWidth: 125 }}>
              <option value="newest">Newest First</option>
              <option value="price_asc">দাম: কম → বেশি</option>
              <option value="price_desc">দাম: বেশি → কম</option>
            </select>
          </div>
        </div>

        {/* ── Mobile Brand Drawer ── */}
        {isMobile && drawerOpen && (
          <>
            <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
            <div className="drawer" ref={drawerRef}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#111' }}>Brand বেছে নাও</span>
                <button onClick={() => setDrawerOpen(false)} style={{ background: '#f5f5f5', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 14, color: '#666' }}>✕</button>
              </div>
              <BrandList />
            </div>
          </>
        )}

        {/* ── Layout ── */}
        <div style={{ display: 'flex', maxWidth: 1440, margin: '0 auto' }}>

          {/* Desktop Brand Sidebar */}
          {!isMobile && brands.length > 0 && (
            <aside style={{ width: 196, flexShrink: 0, background: '#fff', borderRight: '1.5px solid #ebebeb', position: 'sticky', top: 105, alignSelf: 'flex-start', overflowY: 'auto', maxHeight: 'calc(100vh - 105px)' }}>
              <BrandList />
            </aside>
          )}

          {/* Product Grid */}
          <main style={{ flex: 1, padding: isMobile ? 10 : 16 }}>
            {loading ? (
              <div className="product-grid" style={{ display: 'grid', gap: 10 }}>
                {[...Array(isMobile ? 4 : 8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeUp 0.4s ease' }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>📦</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#444', marginBottom: 6 }}>কোনো পণ্য পাওয়া যায়নি</p>
                <p style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>অন্য category বা filter চেষ্টা করুন</p>
                <button onClick={() => { handleTabClick('hot'); setSelectedBrand(''); }}
                  style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Hind Siliguri' }}>
                  🔥 Hot Sale দেখুন
                </button>
              </div>
            ) : (
              <div className="product-grid" style={{ display: 'grid', gap: 10 }}>
                {filtered.map((p, i) => {
                  const qty            = cartQty[p.id] || 0;
                  const inCart         = qty > 0;
                  const outOfStock     = p.stock !== undefined && p.stock !== null && p.stock <= 0;
                  const minQty         = p.min_order ? parseInt(p.min_order) : 1;
                  const profit         = p.mrp && p.price && p.mrp > p.price ? p.mrp - p.price : 0;
                  const discount       = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : null;
                  const hasImage       = !!p.image_url;
                  const profitVisible  = showProfit[p.id] || false;

                  return (
                    <div key={p.id} className="prod-card"
                      onClick={() => !outOfStock && router.push(`/products/${p.id}`)}
                      style={{ borderRadius: 12, border: `1.5px solid ${inCart ? '#111' : '#ebebeb'}`, overflow: 'hidden', animationDelay: `${Math.min(i * 0.04, 0.35)}s`, boxShadow: inCart ? '0 4px 16px rgba(0,0,0,0.12)' : '0 2px 6px rgba(0,0,0,0.04)', opacity: outOfStock ? 0.68 : 1 }}>

                      {/* Image */}
                      <div style={{ height: hasImage ? 160 : 80, position: 'relative', overflow: 'hidden', background: '#f8f8f8' }}>
                        {hasImage
                          ? <img src={p.image_url} alt={p.name} className="prod-img" loading="lazy" />
                          : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'linear-gradient(135deg,#fafafa,#f0f0f0)' }}>
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                              <span style={{ fontSize: 9, color: '#ccc', fontWeight: 600 }}>No Image</span>
                            </div>
                          )
                        }
                        {outOfStock && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ background: '#111', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 14px', borderRadius: 20 }}>Stock নেই</span>
                          </div>
                        )}
                        {inCart && (
                          <div className="qty-badge" style={{ position: 'absolute', top: 8, left: 8, background: '#111', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', border: '2px solid #fff' }}>
                            {qty}
                          </div>
                        )}
                        {discount && !outOfStock && (
                          <span style={{ position: 'absolute', top: 8, right: 8, background: '#111', color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 20 }}>-{discount}%</span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '10px 11px 11px' }}>
                        <p className="prod-name" style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.45, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 38 }}>
                          {p.name}
                        </p>

                        {/* Price Box */}
                        <div style={{ background: '#fafafa', borderRadius: 9, padding: '7px 9px', border: '1px solid #f0f0f0', marginBottom: minQty > 1 ? 5 : 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Trade Price</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: outOfStock ? '#bbb' : '#111' }}>
                              ৳{p.price?.toLocaleString('bn-BD')}
                            </span>
                          </div>
                          <div style={{ height: 1, background: '#ebebeb', margin: '3px 0' }} />
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>MRP</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: p.mrp && p.mrp > p.price ? '#666' : '#ccc' }}>
                              {p.mrp && p.mrp > p.price ? `৳${p.mrp?.toLocaleString('bn-BD')}` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {minQty > 1 && (
                          <p style={{ fontSize: 10, color: '#888', marginBottom: 6, fontWeight: 600 }}>Min: {minQty} pcs</p>
                        )}

                        {/* Cart Button */}
                        {outOfStock ? (
                          <div style={{ width: '100%', background: '#f3f4f6', color: '#bbb', borderRadius: 9, padding: '9px 8px', fontSize: 12, fontWeight: 700, textAlign: 'center' }}>Stock নেই</div>
                        ) : inCart ? (
                          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', borderRadius: 9, overflow: 'hidden', boxShadow: '0 3px 10px rgba(0,0,0,0.18)' }}>
                            <button className="qty-btn" onClick={e => handleDecrease(e, p)} style={{ width: 38, height: 38, color: '#fff', fontSize: 22 }}>−</button>
                            <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{qty}</span>
                            <button className="qty-btn" onClick={e => handleIncrease(e, p)} style={{ width: 38, height: 38, color: '#fff', fontSize: 22 }}>+</button>
                          </div>
                        ) : (
                          <button className="cart-btn" onClick={e => handleAddToCart(e, p)}
                            style={{ width: '100%', height: 38, background: profitVisible && profit > 0 ? '#16a34a' : '#111', color: '#fff', borderRadius: 9, fontSize: 12, fontWeight: 700, boxShadow: profitVisible && profit > 0 ? '0 3px 10px rgba(22,163,74,0.2)' : '0 3px 10px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden', transition: 'background 1s ease, box-shadow 1s ease' }}>
                            <div className="btn-inner">
                              <span className={`btn-label btn-label-cart${profitVisible && profit > 0 ? ' faded' : ''}`}>
                                <span>+</span><span>Cart এ যোগ করুন</span>
                              </span>
                              <span className={`btn-label btn-label-profit${profitVisible && profit > 0 ? ' visible' : ''}`}>
                                <span>💰</span><span>Profit ৳{profit.toLocaleString('bn-BD')}</span>
                              </span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* ── Floating Cart ── */}
        {cartCount > 0 && (
          <button className="float-cart" onClick={() => router.push('/cart')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 9, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛒</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{cartCount}টি পণ্য</div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>৳{cartTotal.toLocaleString('bn-BD')}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700 }}>
              <span>Cart দেখুন</span>
              <span style={{ fontSize: 16 }}>→</span>
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
      <div style={{ minHeight: '100vh', background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hind Siliguri, sans-serif', color: '#aaa', fontSize: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>⏳</div>
          <p>লোড হচ্ছে...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
