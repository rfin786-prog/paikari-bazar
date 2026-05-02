'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('paikari_cart');
    setUser(null);
    setMenuOpen(false);
    router.push('/');
  }

  return (
    <nav style={{
      background: '#0f2442',
      padding: '12px 18px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'relative',
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

        {/* Hamburger Menu */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          background: 'rgba(255,255,255,0.1)',
          color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)',
          padding: '7px 12px', borderRadius: '8px',
          cursor: 'pointer', fontSize: '16px',
          fontFamily: 'inherit',
        }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '62px', right: '18px',
          background: '#1a3a5c', borderRadius: '12px',
          padding: '12px', zIndex: 999,
          display: 'flex', flexDirection: 'column', gap: '8px',
          minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {user ? (
            <>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', padding: '4px 8px' }}>
                👤 {user.shop_name || user.name || 'আপনি'}
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2px 0' }} />
              <button onClick={() => { router.push('/orders'); setMenuOpen(false); }} style={menuBtnStyle}>
                📦 আমার অর্ডার
              </button>
              <button onClick={() => { router.push('/dashboard'); setMenuOpen(false); }} style={menuBtnStyle}>
                📊 ড্যাশবোর্ড
              </button>
              <button onClick={logout} style={{ ...menuBtnStyle, color: '#ff6b6b' }}>
                🚪 লগআউট
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { router.push('/login'); setMenuOpen(false); }} style={menuBtnStyle}>
                🔑 লগইন
              </button>
              <button onClick={() => { router.push('/register'); setMenuOpen(false); }} style={{ ...menuBtnStyle, background: '#e8a020', color: '#0f2442', fontWeight: '700' }}>
                ✍️ নিবন্ধন
              </button>
            </>
          )}
        </div>
      )}
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

const menuBtnStyle = {
  background: 'none', border: 'none',
  color: '#fff', fontSize: '14px',
  fontFamily: 'inherit', cursor: 'pointer',
  padding: '8px 10px', borderRadius: '8px',
  textAlign: 'left', width: '100%',
};
