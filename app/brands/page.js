'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/brands')
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(d => {
        setBrands(Array.isArray(d) ? d.filter(b => b.logo_url) : []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() =>
    brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase())),
    [brands, search]
  );

  return (
    <>
      <style>{`
        .brand-grid-card {
          cursor: pointer;
          border: 1px solid #ececec;
          border-radius: 16px;
          background: #fff;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: border-color 0.2s ease, transform 0.2s ease;
          position: relative;
        }
        .brand-grid-card:hover {
          border-color: #ddd;
          transform: translateY(-2px);
        }
        .search-input:focus {
          outline: none;
          border-color: #d0d0d0;
          background: #fff;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .brand-grid-card { animation: fadeIn 0.25s ease forwards; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fff' }}>
        {/* Header */}
        <div style={{
          background: '#fff',
          padding: '28px 24px 20px',
          position: 'sticky', top: 0, zIndex: 10,
          borderBottom: '1px solid #f4f4f4',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 20, padding: 0, color: '#1a1a1a',
                display: 'flex', alignItems: 'center',
              }}
            >
              ←
            </button>
            <div>
              <h1 style={{
                fontSize: 20, fontWeight: 600, color: '#111',
                margin: 0, letterSpacing: '-0.01em',
              }}>
                All Brands
              </h1>
              {!loading && (
                <p style={{ fontSize: 13, color: '#aaa', margin: '2px 0 0' }}>
                  {filtered.length} brand{filtered.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Search */}
          <input
            className="search-input"
            type="text"
            placeholder="Search brands"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '13px 16px',
              borderRadius: 12,
              border: '1px solid #eee',
              fontSize: 14,
              color: '#111',
              background: '#fafafa',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease, background 0.2s ease',
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: '24px 20px 40px' }}>
          {/* Loading */}
          {loading && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{
                  height: 128, borderRadius: 16,
                  background: '#f6f6f6',
                  animation: 'pulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.08}s`,
                }} />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
              <p style={{ fontSize: 14, marginBottom: 16 }}>Couldn't load brands. Please try again.</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 24px',
                  background: '#111', color: '#fff',
                  border: 'none', borderRadius: 10,
                  fontSize: 13, cursor: 'pointer', fontWeight: 500,
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#aaa' }}>
              <p style={{ fontSize: 14 }}>No brands found for "{search}"</p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}>
              {filtered.map((brand, i) => (
                <button
                  key={brand.id}
                  className="brand-grid-card"
                  onClick={() => router.push(`/products?brand=${brand.id}`)}
                  aria-label={`View products from ${brand.name}`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    style={{ height: 44, maxWidth: '100%', objectFit: 'contain' }}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span style={{
                    fontSize: 12, fontWeight: 500, color: '#333',
                    textAlign: 'center', lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    width: '100%',
                  }}>
                    {brand.name}
                  </span>
                  {brand.product_count > 0 && (
                    <span style={{ fontSize: 11, color: '#bbb' }}>
                      {brand.product_count} product{brand.product_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
