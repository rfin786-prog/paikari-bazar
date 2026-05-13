'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function ProductsSection() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&limit=8&order=created_at.desc`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (e) {}
    };
    fetchProducts();
  }, []);

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
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  if (products.length === 0) return null;

  return (
    <>
      <style>{`
        .prod-card { transition: border-color 0.2s, transform 0.2s; cursor: pointer; }
        .prod-card:hover { border-color: #ff6a00 !important; transform: translateY(-2px); }
        .add-btn { transition: background 0.2s; }
        .add-btn:hover { background: #e55a00 !important; }
      `}</style>
      <div style={{ padding: '4px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>ফিচার্ড পণ্য</h2>
          <span style={{ fontSize: '13px', color: '#ff6a00', cursor: 'pointer' }} onClick={() => router.push('/products')}>সব দেখুন →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {products.map((p, i) => (
            <div
              key={i}
              className="prod-card"
              onClick={() => router.push('/products')}
              style={{ background: '#fff', borderRadius: '10px', border: '1px solid #eee', overflow: 'hidden' }}
            >
              <div style={{ height: '130px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                      </svg>
                      <span style={{ fontSize: '10px', color: '#ccc' }}>ছবি নেই</span>
                    </div>
                }
              </div>
              <div style={{ padding: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px', lineHeight: '1.3', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#ff6a00', marginBottom: '3px' }}>
                  ৳ {p.price?.toLocaleString('bn-BD')}
                </div>
                {p.min_order && (
                  <div style={{ fontSize: '10px', color: '#999', marginBottom: '8px' }}>MOQ: {p.min_order}</div>
                )}
                <button
                  className="add-btn"
                  onClick={(e) => addToCart(e, p)}
                  style={{
                    width: '100%',
                    background: addedIds[p.id] ? '#22c55e' : '#ff6a00',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.3s',
                  }}
                >
                  {addedIds[p.id] ? '✓ যোগ হয়েছে' : 'কার্টে যোগ করুন'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
