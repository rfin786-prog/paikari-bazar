'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function BrandsSection() {
  const [brands, setBrands]                   = useState([]);
  const [activeBrand, setActiveBrand]         = useState(null);
  const [products, setProducts]               = useState([]);
  const [loadingBrands, setLoadingBrands]     = useState(true);
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
        `${SUPABASE_URL}/rest/v1/products?select=*&brand_id=eq.${brandId}&order=created_at.desc&limit=6`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (activeBrand?.id) fetchProducts(activeBrand.id);
  }, [activeBrand, fetchProducts]);

  if (loadingBrands || brands.length === 0) return null;

  return (
    <>
      <style>{`
        /* BRAND SECTION WRAPPER */
        .bs-wrap {
          background: #fff;
          border-radius: 16px;
          margin: 12px;
          overflow: hidden;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
        }

        /* HEADER */
        .bs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 0;
        }
        .bs-title {
          display: flex; align-items: center; gap: 8px;
        }
        .bs-title-bar {
          width: 4px; height: 20px;
          background: #e8a020; border-radius: 2px;
        }
        .bs-title-text {
          font-size: 16px; font-weight: 800;
          color: #1a1a1a;
          font-family: 'Hind Siliguri', sans-serif;
        }
        .bs-view-all {
          font-size: 12px; font-weight: 700;
          color: #e8a020; cursor: pointer;
          font-family: 'Hind Siliguri', sans-serif;
        }

        /* BRAND TABS — horizontal scroll */
        .bs-tabs {
          display: flex;
          gap: 10px;
          padding: 12px 16px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .bs-tabs::-webkit-scrollbar { display: none; }

        .bs-tab {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          padding: 0;
          background: none;
          border: none;
          outline: none;
        }

        .bs-tab-logo {
          width: 64px; height: 48px;
          border-radius: 10px;
          border: 2px solid #f0f0f0;
          background: #fafafa;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          transition: all 0.2s;
        }
        .bs-tab.active .bs-tab-logo {
          border-color: #e8a020;
          background: #fff8ec;
          box-shadow: 0 2px 8px rgba(232,160,32,0.2);
        }
        .bs-tab-logo img {
          width: 100%; height: 100%;
          object-fit: contain; padding: 6px;
        }
        .bs-tab-name {
          font-size: 10px; font-weight: 600;
          color: #999; max-width: 64px;
          text-align: center; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
          font-family: 'Hind Siliguri', sans-serif;
          transition: color 0.2s;
        }
        .bs-tab.active .bs-tab-name { color: #e8a020; }

        /* ACTIVE BRAND BANNER */
        .bs-banner {
          margin: 0 12px 12px;
          background: linear-gradient(120deg, #fff8ec, #fff3d4);
          border-radius: 12px;
          padding: 10px 14px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer;
          border: 1px solid rgba(232,160,32,0.2);
          transition: background 0.2s;
        }
        .bs-banner:hover { background: linear-gradient(120deg, #fff0d0, #ffe8a8); }
        .bs-banner-left {
          display: flex; align-items: center; gap: 10px;
        }
        .bs-banner-logo {
          width: 40px; height: 30px;
          border-radius: 6px; overflow: hidden;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
        }
        .bs-banner-logo img { width: 100%; height: 100%; object-fit: contain; padding: 3px; }
        .bs-banner-text {
          font-size: 13px; font-weight: 800;
          color: #e8a020; letter-spacing: 0.3px;
          font-family: 'Hind Siliguri', sans-serif;
        }
        .bs-banner-sub {
          font-size: 11px; color: #b87a10; font-weight: 500;
          font-family: 'Hind Siliguri', sans-serif;
        }
        .bs-banner-arrow {
          width: 28px; height: 28px;
          background: #e8a020; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 14px;
        }

        /* PRODUCTS GRID */
        .bs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding: 0 12px 14px;
        }

        .bs-card {
          background: #fafafa;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid #f0f0f0;
          cursor: pointer;
          transition: all 0.2s;
        }
        .bs-card:hover {
          border-color: #e8a020;
          box-shadow: 0 4px 12px rgba(232,160,32,0.12);
          transform: translateY(-2px);
        }
        .bs-card-img {
          height: 80px;
          background: linear-gradient(135deg, #f8f8f8, #efefef);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }
        .bs-card-img img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .bs-card-info { padding: 7px 8px 9px; }
        .bs-card-name {
          font-size: 11px; font-weight: 600; color: #222;
          line-height: 1.3; margin-bottom: 4px;
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          min-height: 28px;
          font-family: 'Hind Siliguri', sans-serif;
        }
        .bs-card-price {
          font-size: 13px; font-weight: 800; color: #e8a020;
          font-family: 'Hind Siliguri', sans-serif;
        }
        .bs-card-mrp {
          font-size: 10px; color: #bbb;
          text-decoration: line-through;
          margin-left: 4px;
          font-family: 'Hind Siliguri', sans-serif;
        }

        /* VIEW MORE card */
        .bs-more {
          background: #fafafa;
          border-radius: 10px;
          border: 1.5px dashed #e0e0e0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 6px; cursor: pointer; min-height: 118px;
          transition: all 0.2s;
        }
        .bs-more:hover { border-color: #e8a020; background: #fff8ec; }
        .bs-more-dots { display: flex; gap: 4px; }
        .bs-more-dot { width: 5px; height: 5px; border-radius: 50%; background: #ccc; }
        .bs-more:hover .bs-more-dot { background: #e8a020; }
        .bs-more-text {
          font-size: 10px; font-weight: 700; color: #aaa;
          font-family: 'Hind Siliguri', sans-serif;
        }
        .bs-more:hover .bs-more-text { color: #e8a020; }

        /* SKELETON */
        .bs-skeleton {
          background: linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%);
          background-size: 200% 100%;
          animation: bsShi 1.4s infinite;
          border-radius: 6px;
        }
        @keyframes bsShi {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="bs-wrap">

        {/* HEADER */}
        <div className="bs-header">
          <div className="bs-title">
            <div className="bs-title-bar" />
            <span className="bs-title-text">Brands</span>
          </div>
          <span className="bs-view-all" onClick={() => router.push('/products?tab=brands')}>
            সব দেখুন →
          </span>
        </div>

        {/* BRAND TABS */}
        <div className="bs-tabs">
          {brands.map(brand => (
            <button
              key={brand.id}
              className={`bs-tab${activeBrand?.id === brand.id ? ' active' : ''}`}
              onClick={() => setActiveBrand(brand)}
            >
              <div className="bs-tab-logo">
                {brand.logo_url
                  ? <img src={brand.logo_url} alt={brand.name} onError={e => { e.currentTarget.style.display = 'none'; }} />
                  : <span style={{ fontSize: 22 }}>🏪</span>
                }
              </div>
              <span className="bs-tab-name">{brand.name}</span>
            </button>
          ))}
        </div>

        {/* ACTIVE BRAND BANNER */}
        {activeBrand && (
          <div className="bs-banner" onClick={() => router.push(`/products?brand=${activeBrand.id}`)}>
            <div className="bs-banner-left">
              <div className="bs-banner-logo">
                {activeBrand.logo_url
                  ? <img src={activeBrand.logo_url} alt={activeBrand.name} />
                  : <span style={{ fontSize: 18 }}>🏪</span>
                }
              </div>
              <div>
                <div className="bs-banner-text">সব {activeBrand.name} পণ্য দেখুন</div>
                <div className="bs-banner-sub">সেরা কালেকশনে</div>
              </div>
            </div>
            <div className="bs-banner-arrow">→</div>
          </div>
        )}

        {/* PRODUCTS GRID */}
        <div className="bs-grid">
          {loadingProducts ? (
            // Skeleton
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1.5px solid #f0f0f0' }}>
                  <div className="bs-skeleton" style={{ height: 80 }} />
                  <div style={{ padding: '7px 8px 9px' }}>
                    <div className="bs-skeleton" style={{ height: 10, marginBottom: 6 }} />
                    <div className="bs-skeleton" style={{ height: 10, width: '55%' }} />
                  </div>
                </div>
              ))}
              <div className="bs-more" style={{ opacity: 0.4 }}>
                <div className="bs-more-dots">
                  {[0,1,2].map(i => <div key={i} className="bs-more-dot" />)}
                </div>
                <span className="bs-more-text">আরো দেখুন</span>
              </div>
            </>
          ) : products.length === 0 ? (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px 0', color:'#bbb', fontSize:13, fontFamily:'Hind Siliguri, sans-serif' }}>
              এই ব্র্যান্ডের কোনো পণ্য নেই
            </div>
          ) : (
            <>
              {products.slice(0, 5).map(p => (
                <div
                  key={p.id}
                  className="bs-card"
                  onClick={() => router.push(`/products/${p.id}`)}
                >
                  <div className="bs-card-img">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} />
                      : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="m21 15-5-5L5 21"/>
                        </svg>
                      )
                    }
                  </div>
                  <div className="bs-card-info">
                    <p className="bs-card-name">{p.name}</p>
                    <div style={{ display:'flex', alignItems:'baseline' }}>
                      <span className="bs-card-price">৳{p.price?.toLocaleString('bn-BD')}</span>
                      {p.mrp && p.mrp > p.price && (
                        <span className="bs-card-mrp">৳{p.mrp?.toLocaleString('bn-BD')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* View More */}
              <div
                className="bs-more"
                onClick={() => router.push(`/products?brand=${activeBrand?.id}`)}
              >
                <div className="bs-more-dots">
                  {[0,1,2].map(i => <div key={i} className="bs-more-dot" />)}
                </div>
                <span className="bs-more-text">আরো দেখুন</span>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  );
}
