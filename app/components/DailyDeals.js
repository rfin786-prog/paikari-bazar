'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// products.unit ইংরেজিতে সেভ থাকে (admin ফর্মের UNITS লিস্ট অনুযায়ী) — এখানে বাংলায় দেখানোর জন্য ম্যাপিং
const UNIT_LABELS = {
  KG: 'কেজি',
  Gram: 'গ্রাম',
  Litre: 'লিটার',
  ML: 'মিলি লিটার',
  Piece: 'পিস',
  Dozen: 'ডজন',
  Sack: 'বস্তা',
  Packet: 'প্যাকেট',
  Carton: 'কার্টন',
  Box: 'বক্স',
};

function unitLabel(unit) {
  if (!unit) return 'পিস';
  return UNIT_LABELS[unit] || unit;
}

// আসল বর্তমান সময় থেকে আজ রাত ১২টা (মধ্যরাত) পর্যন্ত বাকি সময় বের করে —
// ডাটাবেসে deal-এর নির্দিষ্ট শেষ সময় যোগ না করা পর্যন্ত এটাই সবচেয়ে কাছের "real" countdown
function getMsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function msToHMS(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h, m, s };
}

function Countdown() {
  const [remaining, setRemaining] = useState(() => getMsUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getMsUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { h, m, s } = msToHMS(remaining);
  const pad = n => String(n).padStart(2, '0');

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {[pad(h), pad(m), pad(s)].map((val, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            background: '#111111', color: '#ffffff', fontWeight: 'bold',
            padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '1.1rem'
          }}>{val}</span>
          {i < 2 && <span style={{ color: '#111111', fontWeight: 'bold' }}>:</span>}
        </span>
      ))}
    </div>
  );
}

function DealCardSkeleton({ isDesktop }) {
  return (
    <div style={{
      background: '#f5f5f5', border: '1px solid #e0e0e0',
      borderRadius: '12px', padding: isDesktop ? '18px' : '14px',
    }}>
      <div style={{
        width: isDesktop ? '56px' : '48px', height: isDesktop ? '56px' : '48px',
        borderRadius: '8px', background: '#e5e5e5', marginBottom: '12px',
      }} />
      <div style={{ width: '80%', height: '14px', borderRadius: '4px', background: '#e5e5e5', marginBottom: '8px' }} />
      <div style={{ width: '50%', height: '16px', borderRadius: '4px', background: '#e5e5e5' }} />
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: '#111111', color: '#ffffff', fontFamily: 'Hind Siliguri',
          fontSize: '0.9rem', fontWeight: 600, padding: '10px 18px',
          borderRadius: '999px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ color: '#22c55e' }}>✓</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export default function DailyDeals() {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedIds, setAddedIds] = useState({});
  const [toasts, setToasts] = useState([]);

  const showToast = (msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2200);
  };

  const addToCart = (e, product) => {
    e.stopPropagation();
    const cart = getCart();
    const exists = cart.find(i => i.id === product.id);
    if (!exists) {
      saveCart([...cart, { ...product, quantity: 1 }]);
      showToast(`${product.name} কার্টে যোগ হয়েছে`);
    } else {
      showToast(`${product.name} আগে থেকেই কার্টে আছে`);
    }
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [product.id]: false })), 1800);
  };

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchDeals() {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) throw new Error('ডেটা আনতে সমস্যা হয়েছে');

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('অপ্রত্যাশিত রেসপন্স');

        // যেসব প্রোডাক্টে mrp > price (মানে আসল ছাড় আছে) সেগুলো বাছাই করে,
        // সবচেয়ে বেশি ছাড়ের হারওয়ালা প্রথম ৪টা দেখানো হচ্ছে
        const discounted = data
          .filter(p => {
            const mrp = parseFloat(p.mrp);
            const price = parseFloat(p.price);
            return p.active !== false && mrp > 0 && price > 0 && mrp > price;
          })
          .map(p => {
            const mrp = parseFloat(p.mrp);
            const price = parseFloat(p.price);
            return { ...p, _discountPct: Math.round((1 - price / mrp) * 100) };
          })
          .sort((a, b) => b._discountPct - a._discountPct)
          .slice(0, 4);

        if (!cancelled) setDeals(discounted);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDeals();
    return () => { cancelled = true; };
  }, []);

  // এই মুহূর্তে ছাড়ে থাকা কোনো প্রোডাক্ট নেই বা ডেটা আনতে সমস্যা হলে সেকশনটাই লুকিয়ে ফেলা হয়
  if (!loading && (error || deals.length === 0)) return null;

  return (
    <section style={{ padding: isDesktop ? '24px' : '24px 16px', background: '#ffffff' }}>
      <Toast toasts={toasts} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ color: '#111111', fontFamily: 'Hind Siliguri', fontSize: '1.3rem', margin: 0 }}>
          🔥 আজকের অফার
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#666666', fontSize: '0.85rem' }}>শেষ হবে:</span>
            <Countdown />
          </div>
          <button
            onClick={() => router.push('/products')}
            style={{
              background: '#111111', color: '#ffffff', border: 'none',
              fontSize: '0.8rem', fontWeight: 500, padding: '6px 14px',
              borderRadius: '20px', cursor: 'pointer', fontFamily: 'Hind Siliguri',
              whiteSpace: 'nowrap',
            }}
          >
            সব দেখুন →
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: isDesktop ? '16px' : '12px' }}>
        {loading
          ? Array.from({ length: isDesktop ? 4 : 2 }).map((_, i) => (
              <DealCardSkeleton key={i} isDesktop={isDesktop} />
            ))
          : deals.map(deal => (
              <div
                key={deal.id}
                onClick={() => router.push(`/products/${deal.id}`)}
                style={{
                  background: '#f5f5f5', border: '1px solid #e0e0e0',
                  borderRadius: '12px', padding: isDesktop ? '18px' : '14px', position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: '#111111', color: '#ffffff', fontSize: '0.7rem',
                  fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px'
                }}>
                  {deal._discountPct}% ছাড়
                </span>

                {deal.image_url ? (
                  <div style={{
                    width: isDesktop ? '56px' : '48px', height: isDesktop ? '56px' : '48px',
                    borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', background: '#ffffff',
                  }}>
                    <img
                      src={deal.image_url}
                      alt={deal.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div style={{ fontSize: isDesktop ? '2.4rem' : '2rem', marginBottom: '8px' }}>📦</div>
                )}

                <div style={{
                  color: '#111111', fontFamily: 'Hind Siliguri', fontWeight: 600, marginBottom: '4px',
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {deal.name}
                </div>

                {deal.stock !== undefined && deal.stock !== null ? (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600,
                      color: parseInt(deal.stock) > 0 ? '#16a34a' : '#ef4444',
                      background: parseInt(deal.stock) > 0 ? '#dcfce7' : '#fee2e2',
                      padding: '2px 6px', borderRadius: '4px',
                    }}>
                      {parseInt(deal.stock) > 0 ? `স্টকে আছে ${deal.stock}` : 'স্টক শেষ'}
                    </span>
                  </div>
                ) : null}

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '6px' }}>
                  <div>
                    <div style={{ color: '#111111', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      ৳{parseFloat(deal.price).toLocaleString('bn-BD')}
                      <span style={{ fontSize: '0.75rem', color: '#666666' }}>/{unitLabel(deal.unit)}</span>
                    </div>
                    <div style={{ color: '#999999', fontSize: '0.8rem', textDecoration: 'line-through' }}>
                      ৳{parseFloat(deal.mrp).toLocaleString('bn-BD')}
                    </div>
                  </div>

                  <button
                    onClick={(e) => addToCart(e, deal)}
                    aria-label={addedIds[deal.id] ? 'যোগ হয়েছে' : 'কার্টে যোগ করুন'}
                    disabled={deal.stock !== undefined && deal.stock !== null && parseInt(deal.stock) <= 0}
                    style={{
                      width: isDesktop ? '34px' : '30px',
                      height: isDesktop ? '34px' : '30px',
                      background: addedIds[deal.id] ? '#22c55e' : '#111111',
                      color: '#ffffff', border: 'none',
                      borderRadius: '8px',
                      cursor: (deal.stock !== undefined && deal.stock !== null && parseInt(deal.stock) <= 0) ? 'not-allowed' : 'pointer',
                      opacity: (deal.stock !== undefined && deal.stock !== null && parseInt(deal.stock) <= 0) ? 0.4 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'background 0.15s ease',
                    }}
                  >
                    {addedIds[deal.id]
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    }
                  </button>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
