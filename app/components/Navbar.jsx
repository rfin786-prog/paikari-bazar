'use client';
import Image from 'next/image';
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
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .nav-icon-btn {
          background: none !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          -webkit-appearance: none !important;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .nav-icon-btn:focus,
        .nav-icon-btn:active,
        .nav-icon-btn:hover {
          background: none !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
      <nav style={{
        background: '#000',
        padding: '10px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div
          style={{ display: 'inline-flex', alignItems: 'flex-end', cursor: 'pointer' }}
          onClick={() => router.push('/')}
        >
          <Image
            src="/logo.png"
            alt="আড়ৎ"
            width={80}
            height={32}
            style={{ objectFit: 'contain', mixBlendMode: 'screen', display: 'block' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '3px', marginBottom: '3px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff3b3b', flexShrink: 0, animation: 'blink 1.2s ease-in-out infinite' }} />
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e8a020', flexShrink: 0, animation: 'blink 1.2s ease-in-out infinite 0.4s' }} />
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'blink 1.2s ease-in-out infinite 0.8s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="nav-icon-btn" onClick={() => router.push('/checkout')}>
            <CartIcon />
            <CartCount />
          </button>
          {user ? (
            <button className="nav-icon-btn" onClick={() => router.push('/dashboard')}>
              <UserIcon color="#e8a020" />
            </button>
          ) : (
            <button className="nav-icon-btn" onClick={() => router.push('/login')}>
              <UserIcon color="#e8a020" />
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
    </svg>
  );
}

function UserIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function CartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('paikari_cart') || '[]');
      setCount(cart.length);
    };
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  if (count === 0) return null;

  return (
    <span style={{
      position: 'absolute', top: '-6px', right: '-6px',
      background: '#e8a020', color: '#000',
      borderRadius: '50%', width: '18px', height: '18px',
      fontSize: '11px', fontWeight: '700',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{count}</span>
  );
}
