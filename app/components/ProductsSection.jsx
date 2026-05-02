'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function ProductsSection() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('সব');

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?active=eq.true&order=created_at.desc`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  function addToCart(product) {
    const user = localStorage.getItem('user');
    if (!user) { router.push('/login'); return; }
    const cart = JSON.parse(localStorage.getItem('paikari_cart') || '[]');
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    localStorage.setItem('paikari_cart', JSON.stringify(cart));
    alert(`✅ ${product.name} কার্ট যোগ হয়েছে!`);
  }

  const categories = ['সব', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchCat = category === 'সব' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', marginBottom: '1rem', textAlign: 'center' }}>
        🛒 পাইকারি পণ্য
      </h2>

      {/* Search */}
      <input
        placeholder="পণ্য খুঁজুন..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: 'none', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }}
      />

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              background: category === cat ? '#1D9E75' : 'rgba(255,255,255,0.15)',
              color: '#fff' }}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#aaa', textAlign: 'center' }}>লোড হচ্ছে...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {filtered.map(product => (
            <div key={product.id} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '32px', textAlign: 'center' }}>{product.emoji || '📦'}</div>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: 0, textAlign: 'center' }}>{product.name}</p>
              <p style={{ color: '#aaa', fontSize: '12px', margin: 0, textAlign: 'center' }}>{product.unit}</p>
              <p style={{ color: '#1D9E75', fontSize: '15px', fontWeight: '700', margin: 0, textAlign: 'center' }}>৳ {product.price}</p>
              <button onClick={() => addToCart(product)}
                style={{ marginTop: '6px', padding: '8px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                🚛 মাল তুলুন
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
