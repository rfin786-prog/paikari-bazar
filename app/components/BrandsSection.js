'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function BrandsSection() {
  const [brands, setBrands]             = useState([]);
  const [activeBrand, setActiveBrand]   = useState(null);
  const [products, setProducts]         = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const router = useRouter();

  // Fetch brands
  useEffect(() => {
    fetch('/api/brands')
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : [];
        setBrands(list);
        if (list.length > 0) setActiveBrand(list[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingBrands(false));
  }, []);

  // Fetch products for active brand
  const fetchProducts = useCallback(async (brandId) => {
    if (!brandId) return;
    setLoadingProducts(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*&brand_id=eq.${brandId}&order=created_at.desc&limit=5`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (activeBrand?.id) fetchProducts(activeBrand.id);
  }, [activeBrand, fetchProducts]);

  if (loadingBrands) return null;
  if (brands.length === 0) return null;

  return (
    <>
      <style>{`
        .brands-section { background: #fff; border-bottom: 1px solid #f0f0f0; }

        /* Sidebar */
        .brand-sidebar { width: 90px; flex-shrink: 0; border-right: 1px solid #f0f0f0; overflow-y: auto; max-height: 380px; }
        .brand-sidebar::-webkit-scrollbar { width: 2px; }
        .brand-sidebar::-webkit-scrollbar-thumb { background: #eee; border-radius: 2px; }

        .brand-item {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 5px; padding: 10px 6px; cursor: pointer;
          border-left: 3px solid transparent;
          border-bottom: 1px solid #f8f8f8;
          background: transparent; width: 100%;
          transition: all 0.2s ease;
        }
        .brand-item.active { border-left-color: #ff6a00; background: #fff8f5; }
        .brand-item:hover:not(.active) { background: #fafafa; }

        .brand-logo-wrap {
          width: 54px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          background: #f5f5f5; border-radius: 8px; overflow: hidden;
        }
        .brand-item.active .brand-logo-wrap { background: #fff0e6; }

        .brand-label {
          font-size: 9px; font-weight: 700; color: #999;
          text-align: center; line-height: 1.2;
          overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap; width: 72px;
          font-family: 'Hind Siliguri', sans-serif;
        }
        .brand-item.active .brand-label { color: #ff6a00; }

        /* Content */
        .brand-content { flex: 1; overflow: hidden; }

        .view-all-banner {
          margin: 12px 12px 10px;
          background: #fff5ee; border-radius: 12px;
          padding: 12px 16px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; border: 1px solid #ffe5cc;
          transition: all 0.2s;
        }
        .view-all-banner:hover { background: #ffe8d4; }
        .view-all-text { font-size: 13px; font-weight: 800; color: #ff6a00; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Hind Siliguri', sans-serif; }

        /* Product grid */
        .bp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0 12px 12px; }

        .bp-card {
          background: #fafafa; border-radius: 10px;
          overflow: hidden; border: 1.5px solid #f0f0f0;
          cursor: pointer; transition: all 0.2s ease;
        }
        .bp-card:hover { border-color: #ffcfaa; box-shadow: 0 4px 12px rgba(255,106,0,0.1); transform: translateY(-2px); }

        .bp-img {
          height: 70px; background: linear-gradient(135deg, #f8f8f8, #efefef);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .bp-img img { width: 100%; height: 100%; object-fit: cover; }
        .bp-img-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; }

        .bp-info { padding: 6px 7px 8px; }
        .bp-name {
          font-size: 10px; font-weight: 600; color: #333;
          line-height: 1.3; margin-bottom: 3px;
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          min-height: 26px; font-family: 'Hind Siliguri', sans-serif;
        }
        .bp-price { font-size: 12px; font-weight: 800; color: #ff6a00; font-family: 'Hind Siliguri', sans-serif; }

        /* View more */
        .bp-more {
          background: #fafafa; border-radius: 10px;
          border: 1.5px dashed #e0e0e0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 5px; cursor: pointer; min-height: 110px;
          transition: all 0.2s;
        }
        .bp-more:hover { border-color: #ff6a00; background: #fff8f5; }
        .bp-more-dots { display: flex; gap: 3px; }
        .bp-more-dot { width: 5px; height: 5px; border-radius: 50%; background: #ccc; }
        .bp-more-text { font-size: 10px; font-weight: 700; color: #aaa; font-family: 'Hind Siliguri', sans-serif; }

        /* Skeleton */
        .bp-skeleton { background: linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%); background-size: 200% 100%; animation: bpShimmer 1.4s infinite; border-radius: 10px; }
        @keyframes bpShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 0', background: '#fff' }}>
        <div style={{ width: 4, height: 20, background: '#ff6a00', borderRadius: 2 }} />
        <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', fontFamily: 'Hind Siliguri, sans-serif' }}>Brands</span>
      </div>

      <div className="brands-section">
        <div style={{ display: 'flex' }}>

          {/* Left Sidebar */}
          <div className="brand-sidebar">
            {brands.map(brand => (
              <button
                key={brand.id}
                className={`brand-item${activeBrand?.id === brand.id ? ' active' : ''}`}
                onClick={() => setActiveBrand(brand)}
              >
                <div className="brand-logo-wrap">
                  {brand.logo_url
                    ? <img src={brand.logo_url} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    : <span style={{ fontSize: 20 }}>🏪</span>
                  }
                </div>
                <span className="brand-label">{brand.name}</span>
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="brand-content">

            {/* View All Banner */}
            <div
              className="view-all-banner"
              onClick={() => router.push(`/products?brand=${activeBrand?.id}`)}
            >
              <span className="view-all-text">View all {activeBrand?.name}</span>
              <span style={{ fontSize: 18, color: '#ff6a00' }}>→</span>
            </div>

            {/* Products */}
            <div className="bp-grid">
              {loadingProducts ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1.5px solid #f0f0f0' }}>
                      <div className="bp-skeleton" style={{ height: 70 }} />
                      <div style={{ padding: '6px 7px 8px' }}>
                        <div className="bp-skeleton" style={{ height: 10, marginBottom: 5 }} />
                        <div className="bp-skeleton" style={{ height: 10, width: '60%' }} />
                      </div>
                    </div>
                  ))}
                  <div className="bp-more" style={{ opacity: 0.4 }}>
                    <div className="bp-more-dots">
                      {[0,1,2].map(i => <div key={i} className="bp-more-dot" />)}
                    </div>
                    <span className="bp-more-text">View More</span>
                  </div>
                </>
              ) : products.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#bbb', fontSize: 13, fontFamily: 'Hind Siliguri, sans-serif' }}>
                  No products found
                </div>
              ) : (
                <>
                  {products.map(p => (
                    <div
                      key={p.id}
                      className="bp-card"
                      onClick={() => router.push(`/products/${p.id}`)}
                    >
                      <div className="bp-img">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} />
                          : (
                            <div className="bp-img-placeholder">
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            </div>
                          )
                        }
                      </div>
                      <div className="bp-info">
                        <p className="bp-name">{p.name}</p>
                        <span className="bp-price">৳{p.price?.toLocaleString('bn-BD')}</span>
                      </div>
                    </div>
                  ))}

                  {/* View More */}
                  <div
                    className="bp-more"
                    onClick={() => router.push(`/products?brand=${activeBrand?.id}`)}
                  >
                    <div className="bp-more-dots">
                      {[0,1,2].map(i => <div key={i} className="bp-more-dot" />)}
                    </div>
                    <span className="bp-more-text">View More</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
