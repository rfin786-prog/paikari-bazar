'use client';
import { useEffect, useState } from 'react';

export default function BrandsSection({ selectedBrand, setSelectedBrand }) {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetch('/api/brands')
      .then(r => r.json())
      .then(d => setBrands(Array.isArray(d) ? d.filter(b => b.logo_url) : []))
      .catch(() => {});
  }, []);

  if (brands.length === 0) return null;

  return (
    <>
      <style>{`
        .brand-scroll::-webkit-scrollbar { height: 4px; }
        .brand-scroll::-webkit-scrollbar-track { background: #f5f5f5; }
        .brand-scroll::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
        .brand-card {
          transition: all 0.2s ease;
          cursor: pointer;
          flex-shrink: 0;
        }
        .brand-card:hover {
          border-color: #ff6a00 !important;
          box-shadow: 0 4px 16px rgba(255,106,0,0.12) !important;
          transform: translateY(-2px);
        }
      `}</style>

      <section style={{ background: '#fff', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
        {/* Header */}
        <div style={{ padding: '0 20px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, background: '#ff6a00', borderRadius: 2 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', fontFamily: 'Hind Siliguri, sans-serif' }}>
              জনপ্রিয় ব্র্যান্ড
            </span>
          </div>
          {selectedBrand && (
            <span
              onClick={() => setSelectedBrand(null)}
              style={{ fontSize: 12, color: '#ff6a00', cursor: 'pointer', fontWeight: 600, fontFamily: 'Hind Siliguri, sans-serif' }}
            >
              সব দেখুন ✕
            </span>
          )}
        </div>

        {/* Scrollable Brand List */}
        <div
          className="brand-scroll"
          style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 20px 8px' }}
        >
          {/* সব card */}
          <div
            className="brand-card"
            onClick={() => setSelectedBrand(null)}
            style={{
              width: 80, height: 72,
              border: selectedBrand === null ? '2px solid #ff6a00' : '1.5px solid #eee',
              borderRadius: 10,
              background: selectedBrand === null ? '#fff8f5' : '#fafafa',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 22 }}>🏪</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#555', fontFamily: 'Hind Siliguri, sans-serif' }}>সব</span>
          </div>

          {brands.map(brand => (
            <div
              key={brand.id}
              className="brand-card"
              onClick={() => setSelectedBrand(brand.id === selectedBrand ? null : brand.id)}
              style={{
                width: 100, height: 72,
                border: selectedBrand === brand.id ? '2px solid #ff6a00' : '1.5px solid #eee',
                borderRadius: 10,
                background: selectedBrand === brand.id ? '#fff8f5' : '#fff',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 10px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <img
                src={brand.logo_url}
                alt={brand.name}
                style={{ height: 36, maxWidth: 80, objectFit: 'contain' }}
              />
              <span style={{
                fontSize: 10, fontWeight: 600, color: '#444',
                fontFamily: 'Hind Siliguri, sans-serif',
                whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis', maxWidth: 90, textAlign: 'center',
              }}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
