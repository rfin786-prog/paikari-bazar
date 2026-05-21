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
    <section style={{ background: '#fff', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: '#1a1a2e',
          marginBottom: 20, fontFamily: 'Hind Siliguri, sans-serif'
        }}>
          জনপ্রিয় ব্র্যান্ড
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* সব বাটন */}
          <div
            onClick={() => setSelectedBrand(null)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
              border: selectedBrand === null ? '2px solid #f59e0b' : '1.5px solid #f0f0f0',
              background: selectedBrand === null ? '#fffbeb' : '#fafafa',
              minWidth: 70, transition: 'all .2s',
            }}
          >
            <span style={{ fontSize: 28 }}>🏪</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'Hind Siliguri, sans-serif' }}>সব</span>
          </div>

          {brands.map(brand => (
            <div
              key={brand.id}
              onClick={() => setSelectedBrand(brand.id === selectedBrand ? null : brand.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
                border: selectedBrand === brand.id ? '2px solid #f59e0b' : '1.5px solid #f0f0f0',
                background: selectedBrand === brand.id ? '#fffbeb' : '#fafafa',
                minWidth: 90, transition: 'all .2s',
              }}
              onMouseEnter={e => { if (selectedBrand !== brand.id) { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = '#fffbeb'; } }}
              onMouseLeave={e => { if (selectedBrand !== brand.id) { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = '#fafafa'; } }}
            >
              <img
                src={brand.logo_url}
                alt={brand.name}
                style={{ height: 48, maxWidth: 80, objectFit: 'contain' }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'Hind Siliguri, sans-serif' }}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
