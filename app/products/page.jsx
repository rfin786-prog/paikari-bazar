'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        const cats = [...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(cats);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (e) {}
  };

  const addToCart = (e, product) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem('paikari_cart') || '[]');
    const exists = cart.find(i => i.id === product.id);
    if (!exists) {
      cart.push({ ...product, quantity: 1 });
      localStorage.setItem('paikari_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  let filtered = products;
  if (selectedBrand) filtered = filtered.filter(p => p.brand_id === selectedBrand);
  if (selectedCat) filtered = filtered.filter(p => p.category === selectedCat);
  if (sortBy === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Hind Siliguri', sans-serif; box-sizing: border-box; }
        .prod-card { transition: all 0.2s ease; cursor: pointer; }
        .prod-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(255,106,0,0.13) !important; border-color: #ff6a00 !important; }
        .cart-btn { transition: all 0.2s; }
        .cart-btn:hover { background: #e55a00 !important; }
        .filter-chip { transition: all 0.2s; cursor: pointer; }
        .filter-chip:hover { border-color: #ff6a00 !important; color: #ff6a00 !important; }
        .brand-chip { transition: all 0.2s; cursor: pointer; }
        .brand-chip:hover { border-color: #ff6a00 !important; }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

        {/* Top Bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', flex: 1 }}>
            <div
              className="filter-chip"
              onClick={() => setSelectedCat('')}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: selectedCat === '' ? '2px solid #ff6a00' : '1.5px solid #eee',
                background: selectedCat === '' ? '#fff8f5' : '#fafafa',
                color: selectedCat === '' ? '#ff6a00' : '#555',
                whiteSpace: 'nowrap',
              }}
            >সব ক্যাটাগরি</div>
            {categories.map(cat => (
              <div
                key={cat}
                className="filter-chip"
                onClick={() => setSelectedCat(cat === selectedCat ? '' : cat)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  border: selectedCat === cat ? '2px solid #ff6a00' : '1.5px solid #eee',
                  background: selectedCat === cat ? '#fff8f5' : '#fafafa',
                  color: selectedCat === cat ? '#ff6a00' : '#555',
                  whiteSpace: 'nowrap',
                }}
              >{cat}</div>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              border: '1.5px solid #eee', borderRadius: 8, padding: '6px 12px',
              fontSize: 13, color: '#555', outline: 'none', background: '#fafafa',
            }}
          >
            <option value="newest">নতুন আগে</option>
            <option value="price_asc">দাম: কম থেকে বেশি</option>
            <option value="price_desc">দাম: বেশি থেকে কম</option>
          </select>
        </div>

        <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>

          {/* Left Sidebar — Brands */}
          {brands.length > 0 && (
            <aside style={{ width: 180, flexShrink: 0, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 4, paddingLeft: 4 }}>ব্র্যান্ড</div>
              <div
                className="brand-chip"
                onClick={() => setSelectedBrand('')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                  borderRadius: 8, border: selectedBrand === '' ? '2px solid #ff6a00' : '1.5px solid #eee',
                  background: selectedBrand === '' ? '#fff8f5' : '#fff',
                  fontSize: 13, fontWeight: 600, color: selectedBrand === '' ? '#ff6a00' : '#555',
                }}
              >
                <span>🏪</span> সব ব্র্যান্ড
              </div>
              {brands.map(brand => (
                <div
                  key={brand.id}
                  className="brand-chip"
                  onClick={() => setSelectedBrand(brand.id === selectedBrand ? '' : brand.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 8, border: selectedBrand === brand.id ? '2px solid #ff6a00' : '1.5px solid #eee',
                    background: selectedBrand === brand.id ? '#fff8f5' : '#fff',
                  }}
                >
                  {brand.logo_url
                    ? <img src={brand.logo_url} alt={brand.name} style={{ height: 24, width: 40, objectFit: 'contain' }} />
                    : <div style={{ width: 40, height: 24, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#aaa' }}>{brand.name?.charAt(0)}</div>
                  }
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.name}</span>
                </div>
              ))}
            </aside>
          )}

          {/* Main Content */}
          <main style={{ flex: 1, padding: '16px' }}>
            {/* Result count */}
            <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
              {filtered.length}টি পণ্য পাওয়া গেছে
              {selectedCat && <span style={{ color: '#ff6a00', fontWeight: 600 }}> — {selectedCat}</span>}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 15 }}>লোড হচ্ছে...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                <p>কোনো পণ্য পাওয়া যায়নি</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {filtered.map((p, i) => (
                  <div
                    key={p.id}
                    className="prod-card"
                    onClick={() => router.push(`/products/${p.id}`)}
                    style={{
                      background: '#fff', borderRadius: 12,
                      border: '1.5px solid #eee', overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Image */}
                    <div style={{ height: 160, background: '#f9f9f9', position: 'relative', overflow: 'hidden' }}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <path d="m21 15-5-5L5 21"/>
                            </svg>
                            <span style={{ fontSize: 10, color: '#ccc' }}>ছবি নেই</span>
                          </div>
                        )
                      }
                      {i < 3 && (
                        <span style={{ position: 'absolute', top: 8, left: 8, background: '#ff6a00', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>নতুন</span>
                      )}
                      {p.mrp && p.mrp > p.price && (
                        <span style={{ position: 'absolute', top: 8, right: 8, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                          -{Math.round((1 - p.price / p.mrp) * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {p.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#ff6a00' }}>৳{p.price?.toLocaleString('bn-BD')}</span>
                        {p.mrp && p.mrp > p.price && (
                          <span style={{ fontSize: 11, color: '#bbb', textDecoration: 'line-through' }}>৳{p.mrp}</span>
                        )}
                      </div>
                      {p.min_order && (
                        <div style={{ fontSize: 10, color: '#aaa', marginBottom: 8 }}>MOQ: {p.min_order}</div>
                      )}
                      <button
                        className="cart-btn"
                        onClick={(e) => addToCart(e, p)}
                        style={{
                          width: '100%', background: addedIds[p.id] ? '#22c55e' : '#ff6a00',
                          color: '#fff', border: 'none', borderRadius: 8,
                          padding: '8px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        {addedIds[p.id] ? '✓ যোগ হয়েছে' : '🛒 কার্টে যোগ করুন'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
