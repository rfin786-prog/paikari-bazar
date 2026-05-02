'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function ProductsSection() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // null = সব

  useEffect(() => {
    async function fetchData() {
      const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

      const [catRes, prodRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/categories?order=created_at.asc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/products?active=eq.true&order=created_at.desc`, { headers }),
      ]);

      const [catData, prodData] = await Promise.all([catRes.json(), prodRes.json()]);
      setCategories(Array.isArray(catData) ? catData : []);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setLoading(false);
    }
    fetchData();
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
    alert(`✅ ${product.name} কার্টে যোগ হয়েছে!`);
  }

  const filtered = products.filter(p => {
    const matchCat = !selectedCategory || p.category_id === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: '#0a1f38', padding: '40px 16px', fontFamily: 'Hind Siliguri, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: '800', margin: '0 0 8px' }}>
            🛒 পাইকারি পণ্য
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
            সরাসরি সাপ্লায়ার থেকে সেরা দামে
          </p>
        </div>

        {/* Category Section */}
        {!loading && categories.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ক্যাটাগরি
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

              {/* "সব" button */}
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '12px 16px', borderRadius: '14px', border: '2px solid',
                  borderColor: !selectedCategory ? '#1D9E75' : 'rgba(255,255,255,0.1)',
                  background: !selectedCategory ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.05)',
                  cursor: 'pointer', transition: 'all 0.2s', minWidth: '72px',
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px',
                }}>🏪</div>
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>সব</span>
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '12px 16px', borderRadius: '14px', border: '2px solid',
                    borderColor: selectedCategory === cat.id ? '#1D9E75' : 'rgba(255,255,255,0.1)',
                    background: selectedCategory === cat.id ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer', transition: 'all 0.2s', minWidth: '72px',
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {cat.image_url
                      ? <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '22px' }}>📦</span>
                    }
                  </div>
                  <span style={{
                    color: selectedCategory === cat.id ? '#1D9E75' : '#fff',
                    fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
                  }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <input
          placeholder="🔍 পণ্য খুঁজুন..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '12px',
            border: '1.5px solid rgba(255,255,255,0.15)', fontSize: '14px',
            marginBottom: '20px', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.07)', color: '#fff',
            outline: 'none', fontFamily: 'Hind Siliguri, sans-serif',
          }}
        />

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
            লোড হচ্ছে...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            কোনো পণ্য পাওয়া যায়নি
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
            {filtered.map(product => (
              <div key={product.id} style={{
                background: 'rgba(255,255,255,0.07)', borderRadius: '14px',
                padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(29,158,117,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                {/* Product Image or Emoji */}
                <div style={{
                  width: '100%', height: '100px', borderRadius: '10px', overflow: 'hidden',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '36px' }}>{product.emoji || '📦'}</span>
                  }
                </div>

                <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', margin: 0 }}>{product.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>{product.unit}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#1D9E75', fontSize: '15px', fontWeight: '700' }}>৳{product.price}</span>
                  {product.mrp && product.mrp > product.price && (
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textDecoration: 'line-through' }}>৳{product.mrp}</span>
                  )}
                </div>

                <button
                  onClick={() => addToCart(product)}
                  style={{
                    padding: '9px', background: '#1D9E75', color: '#fff',
                    border: 'none', borderRadius: '10px', fontSize: '13px',
                    fontWeight: '600', cursor: 'pointer', fontFamily: 'Hind Siliguri, sans-serif',
                  }}
                >
                  🚛 মাল তুলুন
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
