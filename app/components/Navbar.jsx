'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?q=${encodeURIComponent(query)}`);
  };

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
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .nav-icon-btn:focus, .nav-icon-btn:active, .nav-icon-btn:hover {
          background: none !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .search-input::placeholder { color: #aaa; }
        .search-input:focus { outline: none; }
      `}</style>

      {/* Top bar — শুধু desktop */}
      {!isMobile && (
        <div style={{ background: '#222', color: '#ccc', fontSize: '11px', padding: '4px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>বাংলাদেশের B2B পাইকারি প্ল্যাটফর্ম</span>
          <span style={{ display: 'flex', gap: '12px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => router.push('/about')}>সাহায্য</span>
            <span style={{ cursor: 'pointer' }} onClick={() => router.push('/contact')}>যোগাযোগ</span>
          </span>
        </div>
      )}

      {/* Main nav */}
      <nav style={{
        background: '#fff',
        padding: isMobile ? '8px 14px' : '10px 20px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '8px' : '12px',
        borderBottom: '2px solid #ff6a00',
        boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        position: 'sticky', top: 0, zIndex: 100
      }}>

        {/* Mobile: Logo row */}
        {isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div style={{ display: 'inline-flex', alignItems: 'flex-end', cursor: 'pointer' }} onClick={() => router.push('/')}>
              <Image src="/logo.png" alt="আড়ৎ" width={70} height={28} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '3px', marginBottom: '3px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b3b', animation: 'blink 1.2s ease-in-out infinite' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e8a020', animation: 'blink 1.2s ease-in-out infinite 0.4s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'blink 1.2s ease-in-out infinite 0.8s' }} />
              </div>
            </div>

            {/* Mobile icons */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
              <button className="nav-icon-btn" onClick={() => router.push('/checkout')}>
                <CartIcon />
                <CartCount />
              </button>
              <button className="nav-icon-btn" onClick={() => router.push(user ? '/dashboard' : '/login')}>
                <UserIcon />
              </button>
            </div>
          </div>
        ) : (
          /* Desktop: Logo */
          <div style={{ display: 'inline-flex', alignItems: 'flex-end', cursor: 'pointer', flexShrink: 0 }} onClick={() => router.push('/')}>
            <Image src="/logo.png" alt="আড়ৎ" width={80} height={32} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '3px', marginBottom: '3px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff3b3b', animation: 'blink 1.2s ease-in-out infinite' }} />
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e8a020', animation: 'blink 1.2s ease-in-out infinite 0.4s' }} />
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'blink 1.2s ease-in-out infinite 0.8s' }} />
            </div>
          </div>
        )}

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{
          flex: 1,
          display: 'flex',
          border: '2px solid #ff6a00',
          borderRadius: isMobile ? '8px' : '4px',
          overflow: 'hidden'
        }}>
          {!isMobile && (
            <select style={{ border: 'none', borderRight: '1px solid #eee', padding: '0 10px', fontSize: '12px', color: '#555', background: '#f9f9f9', outline: 'none' }}>
              <option>সব পণ্য</option>
              <option>পোশাক</option>
              <option>মুদি পণ্য</option>
              <option>ইলেকট্রনিক্স</option>
              <option>গৃহস্থালি</option>
            </select>
          )}
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="পণ্য বা ক্যাটাগরি খুঁজুন..."
            style={{
              flex: 1, border: 'none',
              padding: isMobile ? '10px 12px' : '8px 12px',
              fontSize: '13px', background: '#fff', color: '#333'
            }}
          />
          <button type="submit" style={{ background: '#ff6a00', color: '#fff', border: 'none', padding: '0 16px', cursor: 'pointer' }}>
            <SearchIcon />
          </button>
        </form>

        {/* Desktop icons */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
            <button className="nav-icon-btn" onClick={() => router.push('/checkout')}>
              <CartIcon />
              <CartCount />
            </button>
            <button className="nav-icon-btn" onClick={() => router.push(user ? '/dashboard' : '/login')}>
              <UserIcon />
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

// ✅ FIX: 'paikari_cart' → 'cart'
function CartCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCount(cart.length);
    };
    update();
    window.addEventListener('cartUpdated', update);
    return () => window.removeEventListener('cartUpdated', update);
  }, []);
  if (count === 0) return null;
  return (
    <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff6a00', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {count}
    </span>
  );
}
