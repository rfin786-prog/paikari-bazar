'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <nav style={{
      background: '#0f2442',
      padding: '12px 18px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/')}>
        <div style={{
          width: '38px', height: '38px',
          background: '#e8a020', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', flexShrink: 0,
        }}>🚚</div>
        <div style={{ fontSize: '19px', color: '#fff', fontWeight: '700' }}>
          পাইকারি<span style={{ color: '#e8a020' }}>বাজার</span>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Cart */}
        <button onClick={() => router.push('/checkout')} style={{
          background: 'rgba(255,255,255,0.1)',
          color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)',
          padding: '7px 12px', borderRadius: '8px',
          cursor: 'pointer', fontSize: '16px',
          fontFamily: 'inherit', position: 'relative',
        }}>
          🛒
          <CartCount />
        </button>

        {/* Profile or Login */}
        {user ? (
          <button onClick={() => router.push('/dashboard')} style={{
            background: '#e8a020',
            color: '#0f2442', border: 'none',
            padding: '7px 14px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '14px',
            fontFamily: 'inherit', fontWeight: '700',
          }}>
            👤 {user.shop_name || user.name || 'প্রোফাইল'}
          </button>
        ) : (
          <button onClick={() => router.push('/login')} style={{
            background: '#e8a020',
            color: '#0f2442', border: 'none',
            padding: '7px 14px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '14px',
            fontFamily: 'inherit', fontWeight: '700',
          }}>
            লগইন
          </button>
        )}
      </div>
    </nav>
  );
}

function CartCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('paikari_cart') || '[]');
    setCount(cart.length);
  }, []);
  if (count === 0) return null;
  return (
    <span style={{
      position: 'absolute', top: '-6px', right: '-6px',
      background: '#e8a020', color: '#0f2442',
      borderRadius: '50%', width: '18px', height: '18px',
      fontSize: '11px', fontWeight: '700',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{count}</span>
  );
}
