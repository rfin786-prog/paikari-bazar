'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function ProductsSection() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [addedIds, setAddedIds] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/products?select=*&limit=8&order=created_at.desc`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          setTimeout(() => setVisible(true), 100);
        }
      } catch (e) {}
    };
    fetchProducts();
  }, []);

  // ✅ FIX: 'paikari_cart' → 'cart'
  const addToCart = (e, product) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const exists = cart.find(i => i.id === product.id);
    if (!exists) {
      cart.push({ ...product, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  if (products.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .prod-card {
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .prod-card:hover {
          border-color: #ff6a00 !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(255,106,0,0.12) !important;
        }
        .add-btn { transition: background 0.2s, transform 0.1s; }
        .add-btn:hover { background: #e55a00 !important; }
        .add-btn:active { transform: scale(0.97); }
        .prod-scroll::-webkit-scrollbar { display: none; }
        .prod-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ padding: isMobile ? '4px 12px 16px' : '4px 20px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>
              ফিচার্ড পণ্য
            </h2>
            <p style={{ fontSize: '11px', color: '#999', margin: '2px 0 0' }}>সর্বশেষ যোগ হওয়া পণ্য</p>
          </div>
          <span
            style={{ fontSize: '13px', color: '#ff6a00', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => router.push('/products')}
          >
            সব দেখুন →
          </span>
        </div>

        {/* Mobile: horizontal scroll, Desktop: grid */}
        {isMobile ? (
          <div
            className="prod-scroll"
            style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}
          >
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                p={p}
                i={i}
                visible={visible}
                addedIds={addedIds}
                addToCart={addToCart}
                router={router}
                isMobile={true}
              />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px'
          }}>
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                p={p}
                i={i}
                visible={visible}
                addedIds={addedIds}
                addToCart={addToCart}
                router={router}
                isMobile={false}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ProductCard({ p, i, visible, addedIds, addToCart, router, isMobile }) {
  return (
    <div
      className="prod-card"
      onClick={() => router.push('/products')}
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #eee',
        overflow: 'hidden',
        flexShrink: 0,
        width: isMobile ? '150px' : 'auto',
        opacity: visible ? 1 : 0,
        animation: visible ? `fadeUp 0.4s ease forwards` : 'none',
        animationDelay: `${i * 0.06}s`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}
    >
      {/* Image */}
      <div style={{
        height: isMobile ? '120px' : '130px',
        background: '#f9f9f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative'
      }}>
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', background: '#f5f5f5',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
            <span style={{ fontSize: '10px', color: '#ccc' }}>ছবি নেই</span>
          </div>
        )}

        {/* Badge */}
        {i < 3 && (
          <span style={{
            position: 'absolute', top: 8, left: 8,
            background: '#ff6a00', color: '#fff',
            fontSize: '9px', fontWeight: '700',
            padding: '2px 8px', borderRadius: '20px'
          }}>
            নতুন
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: isMobile ? '8px' : '10px' }}>
        <div style={{
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '600', color: '#1a1a1a',
          marginBottom: '4px', lineHeight: '1.3',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
        }}>
          {p.name}
        </div>

        <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: '800', color: '#ff6a00', marginBottom: '2px' }}>
          ৳{p.price?.toLocaleString('bn-BD')}
        </div>

        {p.min_order && (
          <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '8px' }}>
            MOQ: {p.min_order}
          </div>
        )}

        <button
          className="add-btn"
          onClick={(e) => addToCart(e, p)}
          style={{
            width: '100%',
            background: addedIds[p.id] ? '#22c55e' : '#ff6a00',
            color: '#fff', border: 'none',
            borderRadius: '7px',
            padding: isMobile ? '7px' : '8px',
            fontSize: '11px', fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          {addedIds[p.id] ? '✓ যোগ হয়েছে' : '🛒 কার্টে যোগ করুন'}
        </button>
      </div>
    </div>
  );
}
