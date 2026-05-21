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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

        .prod-card {
          transition: all 0.22s cubic-bezier(.4,0,.2,1);
          cursor: pointer;
          background: #fff;
        }
        .prod-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(255,106,0,0.13) !important;
          border-color: #ff6a00 !important;
        }
        .cart-btn { transition: all 0.18s; border: none; cursor: pointer; }
        .cart-btn:hover { filter: brightness(0.9); }
        .cart-btn:active { transform: scale(0.97); }

        .chip { transition: all 0.15s; cursor: pointer; white-space: nowrap; }
        .chip:hover { border-color: #ff6a00 !important; color: #ff6a00 !important; }

        .brand-row { transition: all 0.15s; cursor: pointer; }
        .brand-row:hover { background: #fff5f0 !important; }

        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .prod-card { animation: fadeIn 0.3s ease forwards; }

        .img-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 6px; background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%);
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f6f6f6' }}>

        {/* Top Filter Bar */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #ebebeb',
          padding: '10px 16px', display: 'flex', alignItems: 'center',
          gap: 10, flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {/* Category chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, paddingBottom: 2 }}>
            <div
              className="chip"
              onClick={() => setSelectedCat('')}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: selectedCat === '' ? '2px solid #ff6a00' : '1.5px solid #e8e8e8',
                background: selectedCat === '' ? '#fff5f0' : '#fafafa',
                color: selectedCat === '' ? '#ff6a00' : '#555',
              }}
            >সব ক্যাটাগরি</div>
            {categories.map(cat => (
              <div
                key={cat}
                className="chip"
                onClick={() => setSelectedCat(cat === selectedCat ? '' : cat)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: selectedCat === cat ? '2px solid #ff6a00' : '1.5px solid #e8e8e8',
                  background: selectedCat === cat ? '#fff5f0' : '#fafafa',
                  color: selectedCat === cat ? '#ff6a00' : '#555',
                }}
              >{cat}</div>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '5px 10px',
              fontSize: 12, color: '#555', outline: 'none', background: '#fafafa',
              fontFamily: 'Hind Siliguri, sans-serif', cursor: 'pointer',
            }}
          >
            <option value="newest">নতুন আগে</option>
            <option value="price_asc">দাম: কম → বেশি</option>
            <option value="price_desc">দাম: বেশি → কম</option>
          </select>
        </div>

        <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>

          {/* Left Sidebar */}
          {brands.length > 0 && (
            <aside style={{
              width: sidebarOpen ? 200 : 0,
              flexShrink: 0,
              overflow: 'hidden',
              transition: 'width 0.25s ease',
              background: '#fff',
              borderRight: '1px solid #ebebeb',
              minHeight: 'calc(100vh - 53px)',
            }}>
              <div style={{ padding: '14px 12px', width: 200 }}>
                {/* Sidebar header */}
                <div style={{
                  fontSize: 12, fontWeight: 700, color: '#888',
                  letterSpacing: 1, textTransform: 'uppercase',
                  marginBottom: 10, paddingLeft: 4
                }}>ব্র্যান্ড</div>

                {/* সব */}
                <div
                  className="brand-row"
                  onClick={() => setSelectedBrand('')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 8, marginBottom: 4,
                    background: selectedBrand === '' ? '#fff5f0' : 'transparent',
                    borderLeft: selectedBrand === '' ? '3px solid #ff6a00' : '3px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 18 }}>🏪</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: selectedBrand === '' ? '#ff6a00' : '#444' }}>
                    সব ব্র্যান্ড
                  </span>
                </div>

                {brands.map(brand => (
                  <div
                    key={brand.id}
                    className="brand-row"
                    onClick={() => setSelectedBrand(brand.id === selectedBrand ? '' : brand.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 8, marginBottom: 4,
                      background: selectedBrand === brand.id ? '#fff5f0' : 'transparent',
                      borderLeft: selectedBrand === brand.id ? '3px solid #ff6a00' : '3px solid transparent',
                    }}
                  >
                    {brand.logo_url
                      ? <img src={brand.logo_url} alt={brand.name} style={{ height: 22, width: 44, objectFit: 'contain', borderRadius: 3 }} />
                      : <div style={{ width: 44, height: 22, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#aaa', fontWeight: 700 }}>{brand.name?.charAt(0)}</div>
                    }
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: selectedBrand === brand.id ? '#ff6a00' : '#444',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1
                    }}>{brand.name}</span>
                  </div>
                ))}
              </div>
            </aside>
          )}

          {/* Main */}
          <main style={{ flex: 1, padding: '14px 16px' }}>

            {/* Result bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {brands.length > 0 && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                      background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 7,
                      padding: '5px 10px', fontSize: 13, cursor: 'pointer', color: '#555',
                    }}
                  >
                    {sidebarOpen ? '◀ ব্র্যান্ড' : '▶ ব্র্যান্ড'}
                  </button>
                )}
                <span style={{ fontSize: 13, color: '#888' }}>
                  <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{filtered.length}</span>টি পণ্য
                  {selectedCat && <span style={{ color: '#ff6a00', fontWeight: 600 }}> — {selectedCat}</span>}
                  {selectedBrand && brands.find(b => b.id === selectedBrand) && (
                    <span style={{ color: '#ff6a00', fontWeight: 600 }}> — {brands.find(b => b.id === selectedBrand)?.name}</span>
                  )}
                </span>
              </div>
              {(selectedBrand || selectedCat) && (
                <span
                  onClick={() => { setSelectedBrand(''); setSelectedCat(''); }}
                  style={{ fontSize: 12, color: '#ff6a00', cursor: 'pointer', fontWeight: 600 }}
                >
                  ✕ ফিল্টার সরান
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, height: 280, border: '1.5px solid #eee' }}>
                    <div style={{ height: 160, background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', borderRadius: '12px 12px 0 0' }} />
                    <div style={{ padding: 10 }}>
                      <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📦</div>
                <p style={{ fontSize: 15, fontWeight: 600 }}>কোনো পণ্য পাওয়া যায়নি</p>
                <p style={{ fontSize: 13 }}>ফিল্টার পরিবর্তন করে চেষ্টা করুন</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {filtered.map((p, i) => {
                  const discount = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : null;
                  return (
                    <div
                      key={p.id}
                      className="prod-card"
                      onClick={() => router.push(`/products/${p.id}`)}
                      style={{
                        borderRadius: 12, border: '1.5px solid #ebebeb',
                        overflow: 'hidden', animationDelay: `${i * 0.04}s`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      {/* Image */}
                      <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: '#f9f9f9' }}>
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                          />
                        ) : (
                          <div className="img-placeholder">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <path d="m21 15-5-5L5 21"/>
                            </svg>
                            <span style={{ fontSize: 10, color: '#ccc' }}>ছবি নেই</span>
                          </div>
                        )}
                        {/* Badges */}
                        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {i < 3 && (
                            <span style={{ background: '#ff6a00', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>নতুন</span>
                          )}
                        </div>
                        {discount && (
                          <span style={{ position: 'absolute', top: 8, right: 8, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
                            -{discount}%
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600, color: '#1a1a1a',
                          lineHeight: 1.4, marginBottom: 6,
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          minHeight: 36,
                        }}>
                          {p.name}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#ff6a00' }}>
                            ৳{p.price?.toLocaleString('bn-BD')}
                          </span>
                          {p.mrp && p.mrp > p.price && (
                            <span style={{ fontSize: 11, color: '#bbb', textDecoration: 'line-through' }}>৳{p.mrp}</span>
                          )}
                        </div>

                        {p.min_order && (
                          <div style={{ fontSize: 10, color: '#aaa', marginBottom: 8 }}>
                            সর্বনিম্ন অর্ডার: {p.min_order}
                          </div>
                        )}

                        <button
                          className="cart-btn"
                          onClick={(e) => addToCart(e, p)}
                          style={{
                            width: '100%',
                            background: addedIds[p.id] ? '#22c55e' : '#ff6a00',
                            color: '#fff', borderRadius: 8,
                            padding: '8px', fontSize: 12, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                          }}
                        >
                          {addedIds[p.id] ? '✓ যোগ হয়েছে' : '🛒 কার্টে যোগ করুন'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
