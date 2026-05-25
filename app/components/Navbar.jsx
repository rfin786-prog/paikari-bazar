'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supaHeaders = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

const CAT_META = {
  'পোশাক':       { icon: '👕' },
  'মুদি':        { icon: '🛒' },
  'খাদ্য':       { icon: '🍚' },
  'ইলেকট্রনিক':  { icon: '📱' },
  'গৃহস্থালি':   { icon: '🏠' },
  'কৃষি':        { icon: '🌾' },
  'সৌন্দর্য':    { icon: '🧴' },
  'শিশু':        { icon: '👶' },
  'প্যাকেজিং':   { icon: '📦' },
  'হার্ডওয়্যার': { icon: '🔧' },
  'অর্গানিক':    { icon: '🌿' },
  'পানীয়':      { icon: '🥤' },
  'default':     { icon: '🏷️' },
};

function getCatIcon(name) {
  const key = Object.keys(CAT_META).find(k => name?.includes(k));
  return key ? CAT_META[key].icon : CAT_META['default'].icon;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Category dropdown state
  const [categories, setCategories] = useState([]);
  const [subMap, setSubMap] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredCatId, setHoveredCatId] = useState(null);
  const menuRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch categories from Supabase
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
    fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&order=name.asc`, { headers: supaHeaders })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const parents = data.filter(c => !c.parent_id);
        const children = data.filter(c => c.parent_id);
        const map = {};
        children.forEach(c => {
          if (!map[c.parent_id]) map[c.parent_id] = [];
          map[c.parent_id].push(c);
        });
        setCategories(parents);
        setSubMap(map);
        if (parents.length > 0) setHoveredCatId(parents[0].id);
      })
      .catch(console.error);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?q=${encodeURIComponent(query)}`);
  };

  const handleMenuEnter = () => {
    clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };

  const handleMenuLeave = () => {
    closeTimer.current = setTimeout(() => setMenuOpen(false), 180);
  };

  const hoveredCategory = categories.find(c => c.id === hoveredCatId);
  const hoveredSubs = subMap[hoveredCatId] || [];

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
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

        /* Category bar */
        .cat-bar-btn {
          background: none;
          border: none;
          color: #fff;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
          border-bottom: 3px solid transparent;
          transition: border-color 0.15s, background 0.15s;
          letter-spacing: 0.01em;
        }
        .cat-bar-btn:hover {
          border-bottom-color: #fff;
          background: rgba(255,255,255,0.1);
        }
        .all-cat-btn {
          background: rgba(0,0,0,0.18) !important;
          border-radius: 0 !important;
          border-bottom: 3px solid transparent !important;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          padding: 9px 18px !important;
        }
        .all-cat-btn:hover, .all-cat-btn.open {
          background: rgba(0,0,0,0.32) !important;
          border-bottom-color: #fff !important;
        }

        /* Mega dropdown */
        .mega-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 999;
          background: #fff;
          box-shadow: 0 8px 32px rgba(0,0,0,0.16);
          border-radius: 0 0 10px 10px;
          border-top: 3px solid #ff6a00;
          display: flex;
          min-width: 560px;
          max-height: 420px;
          animation: dropdownFade 0.18s ease forwards;
          overflow: hidden;
        }
        .mega-left {
          width: 210px;
          flex-shrink: 0;
          background: #f9f9f9;
          border-right: 1px solid #f0f0f0;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .mega-left::-webkit-scrollbar { display: none; }
        .mega-left-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          cursor: pointer;
          border-left: 3px solid transparent;
          border-bottom: 1px solid #f5f5f5;
          transition: background 0.12s, border-color 0.12s;
          font-size: 13px;
          font-weight: 500;
          color: #333;
        }
        .mega-left-item:hover, .mega-left-item.active {
          background: #fff;
          border-left-color: #ff6a00;
          color: #ff6a00;
          font-weight: 700;
        }
        .mega-right {
          flex: 1;
          padding: 14px 16px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .mega-right::-webkit-scrollbar { display: none; }
        .mega-right-title {
          font-size: 11px;
          font-weight: 800;
          color: #ff6a00;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        .mega-sub-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .mega-sub-item {
          padding: 8px 6px;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          color: #444;
          transition: background 0.12s, color 0.12s;
          line-height: 1.4;
        }
        .mega-sub-item:hover {
          background: #fff3eb;
          color: #ff6a00;
        }
        .mega-sub-item .sub-icon {
          font-size: 20px;
          display: block;
          margin-bottom: 4px;
        }
        .mega-view-all {
          display: block;
          width: 100%;
          margin-top: 12px;
          padding: 8px;
          background: #ff6a00;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          text-align: center;
          transition: background 0.15s;
        }
        .mega-view-all:hover { background: #e85d00; }
      `}</style>

      {/* Top bar — desktop only */}
      {!isMobile && (
        <div style={{ background: '#222', color: '#ccc', fontSize: '11px', padding: '4px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Bangladesh B2B Wholesale Platform</span>
          <span style={{ display: 'flex', gap: '12px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => router.push('/about')}>Help</span>
            <span style={{ cursor: 'pointer' }} onClick={() => router.push('/contact')}>Contact</span>
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
        borderBottom: isMobile ? '2px solid #ff6a00' : 'none',
        boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        position: 'sticky', top: 0, zIndex: 100
      }}>

        {/* Mobile: Logo row */}
        {isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <LogoMark router={router} size="small" />
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
          <LogoMark router={router} size="large" />
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
              <option>All Products</option>
              <option>Clothing</option>
              <option>Groceries</option>
              <option>Electronics</option>
              <option>Household</option>
            </select>
          )}
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products or categories..."
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

      {/* Category bar — desktop only */}
      {!isMobile && (
        <div style={{
          background: '#ff6a00',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          position: 'sticky',
          top: 57,
          zIndex: 99,
          boxShadow: '0 2px 8px rgba(255,106,0,0.18)',
        }}>

          {/* All Categories button with mega dropdown */}
          <div
            ref={menuRef}
            style={{ position: 'relative', flexShrink: 0 }}
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
          >
            <button className={`cat-bar-btn all-cat-btn${menuOpen ? ' open' : ''}`}>
              <HamburgerIcon />
              All Categories
            </button>

            {/* Mega Dropdown */}
            {menuOpen && categories.length > 0 && (
              <div className="mega-dropdown" onMouseEnter={handleMenuEnter} onMouseLeave={handleMenuLeave}>
                {/* Left: parent categories */}
                <div className="mega-left">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className={`mega-left-item${hoveredCatId === cat.id ? ' active' : ''}`}
                      onMouseEnter={() => setHoveredCatId(cat.id)}
                      onClick={() => {
                        router.push(`/products?cat=${encodeURIComponent(cat.name)}`);
                        setMenuOpen(false);
                      }}
                    >
                      <span style={{ fontSize: 16 }}>
                        {cat.image_url
                          ? <img src={cat.image_url} alt={cat.name} style={{ width: 20, height: 20, objectFit: 'cover', borderRadius: 4 }} />
                          : getCatIcon(cat.name)
                        }
                      </span>
                      <span>{cat.name}</span>
                      {subMap[cat.id]?.length > 0 && (
                        <span style={{ marginLeft: 'auto', color: '#bbb', fontSize: 11 }}>›</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Right: sub-categories */}
                <div className="mega-right">
                  {hoveredCategory && (
                    <div className="mega-right-title">{hoveredCategory.name}</div>
                  )}
                  {hoveredSubs.length > 0 ? (
                    <>
                      <div className="mega-sub-grid">
                        {hoveredSubs.map(sub => (
                          <div
                            key={sub.id}
                            className="mega-sub-item"
                            onClick={() => {
                              router.push(`/products?cat=${encodeURIComponent(sub.name)}`);
                              setMenuOpen(false);
                            }}
                          >
                            <span className="sub-icon">
                              {sub.image_url
                                ? <img src={sub.image_url} alt={sub.name} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 6 }} />
                                : getCatIcon(sub.name)
                              }
                            </span>
                            {sub.name}
                          </div>
                        ))}
                      </div>
                      <button
                        className="mega-view-all"
                        onClick={() => {
                          router.push(`/products?cat=${encodeURIComponent(hoveredCategory?.name)}`);
                          setMenuOpen(false);
                        }}
                      >
                        View all in {hoveredCategory?.name} →
                      </button>
                    </>
                  ) : (
                    <button
                      className="mega-view-all"
                      onClick={() => {
                        router.push(`/products?cat=${encodeURIComponent(hoveredCategory?.name)}`);
                        setMenuOpen(false);
                      }}
                    >
                      View all products →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick category links */}
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat.id}
              className="cat-bar-btn"
              onClick={() => router.push(`/products?cat=${encodeURIComponent(cat.name)}`)}
            >
              {cat.name}
            </button>
          ))}

          <button
            className="cat-bar-btn"
            style={{ marginLeft: 'auto', opacity: 0.85 }}
            onClick={() => router.push('/products')}
          >
            View All →
          </button>
        </div>
      )}

      {/* Mobile: horizontal category scroll */}
      {isMobile && categories.length > 0 && (
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          gap: '8px',
          padding: '8px 14px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <button
            onClick={() => router.push('/products')}
            style={{
              flexShrink: 0, background: '#ff6a00', color: '#fff',
              border: 'none', borderRadius: 20, padding: '6px 14px',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => router.push(`/products?cat=${encodeURIComponent(cat.name)}`)}
              style={{
                flexShrink: 0, background: '#f5f5f5', color: '#333',
                border: 'none', borderRadius: 20, padding: '6px 14px',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap'
              }}
            >
              {getCatIcon(cat.name)} {cat.name}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Sub-components ── */

function LogoMark({ router, size }) {
  const w = size === 'large' ? 80 : 70;
  const h = size === 'large' ? 32 : 28;
  const dot = size === 'large' ? 7 : 6;
  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'flex-end', cursor: 'pointer', flexShrink: 0 }}
      onClick={() => router.push('/')}
    >
      <Image src="/logo.png" alt="Arat" width={w} height={h} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '3px', marginBottom: '3px' }}>
        {['#ff3b3b', '#e8a020', '#22c55e'].map((bg, i) => (
          <span key={i} style={{ width: dot, height: dot, borderRadius: '50%', background: bg, display: 'block', animation: `blink 1.2s ease-in-out infinite ${i * 0.4}s` }} />
        ))}
      </div>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
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
    <span style={{
      position: 'absolute', top: '-6px', right: '-6px',
      background: '#ff6a00', color: '#fff', borderRadius: '50%',
      width: '18px', height: '18px', fontSize: '11px', fontWeight: '700',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {count}
    </span>
  );
}
