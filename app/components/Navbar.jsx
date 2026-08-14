'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supaHeaders = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

// Fallback monogram used when a category has no image_url
function monogram(name) {
  return name ? name.trim().charAt(0) : '—';
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subMap, setSubMap] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCatId, setExpandedCatId] = useState(null);
  const [hoveredCatId, setHoveredCatId] = useState(null);
  const menuRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    setUser(saved ? JSON.parse(saved) : null);
  }, [pathname]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMenuEnter = () => {
    clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };
  const handleMenuLeave = () => {
    closeTimer.current = setTimeout(() => setMenuOpen(false), 180);
  };

  const handleCatEnter = (id) => {
    clearTimeout(closeTimer.current);
    setHoveredCatId(id);
  };
  const handleCatLeave = () => {
    closeTimer.current = setTimeout(() => setHoveredCatId(null), 180);
  };

  const goTo = (name) => {
    router.push(`/products?cat=${encodeURIComponent(name)}`);
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@400;500;600&display=swap');

        :root {
          --ink: #0d0d0d;
          --white: #ffffff;
          --gold: #c9a961;
          --gold-soft: #e3d3ab;
          --ivory: #f8f6f2;
          --line: #e7e2d8;
          --gray: #8f8b83;
        }

        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes subSlide {
          from { opacity: 0; transform: translateY(-4px); }
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

        /* Wordmark */
        .wordmark {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ink);
          text-transform: uppercase;
          line-height: 1;
        }

        /* Sign in button */
        .signin-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 0;
          border: 1px solid var(--ink);
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          background: transparent;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .signin-btn:hover {
          background: var(--ink);
          color: var(--white);
        }
        .signin-btn-mobile {
          padding: 6px 12px;
          font-size: 10px;
          gap: 5px;
        }

        /* Utility top bar */
        .util-bar a, .util-link {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #cfcfcf;
          cursor: pointer;
          position: relative;
          padding-bottom: 2px;
        }
        .util-link::after {
          content: '';
          position: absolute;
          left: 0; right: 100%;
          bottom: 0;
          height: 1px;
          background: var(--gold);
          transition: right 0.2s ease;
        }
        .util-link:hover::after { right: 0; }

        /* Category bar */
        .cat-bar-btn {
          background: none;
          border: none;
          color: var(--white);
          padding: 15px 16px;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          position: relative;
        }
        .cat-bar-btn::after {
          content: '';
          position: absolute;
          left: 50%; right: 50%;
          bottom: 8px;
          height: 1px;
          background: var(--gold);
          transition: left 0.22s ease, right 0.22s ease;
        }
        .cat-bar-btn:hover::after { left: 16px; right: 16px; }

        .all-cat-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          border-right: 1px solid rgba(255,255,255,0.15);
        }
        .all-cat-btn::after { display: none; }
        .all-cat-btn .plus-icon {
          font-size: 14px;
          font-weight: 300;
          transition: transform 0.25s ease;
        }
        .all-cat-btn.open .plus-icon { transform: rotate(135deg); }

        /* Mega dropdown — image card grid */
        .mega-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 999;
          background: var(--white);
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          border-top: 1px solid var(--gold);
          animation: dropdownFade 0.2s ease forwards;
          padding: 36px 40px 30px;
        }
        .mega-heading {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--gray);
          margin-bottom: 20px;
        }
        .mega-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 22px;
        }
        .cat-card {
          position: relative;
          cursor: pointer;
        }
        .cat-card-image {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1a1a, #3a3a3a);
        }
        .cat-card-image img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .cat-card:hover .cat-card-image img { transform: scale(1.07); }
        .cat-card-mono {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          color: var(--gold-soft);
        }
        .cat-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%);
        }
        .cat-card-name {
          position: absolute;
          left: 12px; bottom: 12px; right: 12px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--white);
          letter-spacing: 0.02em;
        }
        /* corner brackets — signature detail */
        .cat-card-image::before, .cat-card-image::after,
        .bracket-tl, .bracket-br {
          content: '';
          position: absolute;
          width: 18px; height: 18px;
          border-color: var(--gold);
          opacity: 0;
          transition: opacity 0.25s ease, width 0.25s ease, height 0.25s ease;
          z-index: 2;
        }
        .cat-card-image::before {
          top: 8px; left: 8px;
          border-top: 1.5px solid var(--gold);
          border-left: 1.5px solid var(--gold);
        }
        .cat-card-image::after {
          bottom: 8px; right: 8px;
          border-bottom: 1.5px solid var(--gold);
          border-right: 1.5px solid var(--gold);
        }
        .cat-card:hover .cat-card-image::before,
        .cat-card:hover .cat-card-image::after {
          opacity: 1;
          width: 26px; height: 26px;
        }
        .cat-card-subs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }
        .cat-card-sub-tag {
          font-family: 'Jost', sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.03em;
          color: var(--gray);
          cursor: pointer;
          padding: 2px 0;
          border-bottom: 1px solid transparent;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .cat-card-sub-tag:hover {
          color: var(--ink);
          border-color: var(--gold);
        }
        .mega-footer {
          margin-top: 26px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
          display: flex;
          justify-content: flex-end;
        }
        .mega-view-all {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink);
          background: none;
          border: none;
          cursor: pointer;
          padding-bottom: 3px;
          border-bottom: 1px solid var(--gold);
        }

        /* Mobile drawer */
        .drawer-cat-row {
          display: flex; align-items: center; gap: 14px;
          padding: 15px 18px;
          border-bottom: 1px solid var(--line);
          cursor: pointer;
        }
        .drawer-thumb {
          width: 42px; height: 42px;
          flex-shrink: 0;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1a1a, #3a3a3a);
          display: flex; align-items: center; justify-content: center;
        }
        .drawer-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .drawer-thumb-mono {
          font-family: 'Cormorant Garamond', serif;
          color: var(--gold-soft);
          font-size: 18px;
        }
        .drawer-cat-name {
          flex: 1;
          font-family: 'Jost', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: var(--ink);
        }
        .drawer-toggle {
          width: 24px; height: 24px;
          border: 1px solid var(--ink);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .drawer-toggle.open { background: var(--ink); color: var(--white); }
        .sub-slide {
          animation: subSlide 0.18s ease forwards;
          background: var(--ivory);
        }
        .drawer-sub-row {
          padding: 11px 18px 11px 74px;
          font-family: 'Jost', sans-serif;
          font-size: 12.5px;
          color: #555;
          border-bottom: 1px solid #efece5;
          cursor: pointer;
        }
        .drawer-sub-view-all {
          padding: 11px 18px 11px 74px;
          font-family: 'Jost', sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--gold);
          border-bottom: 2px solid var(--line);
          cursor: pointer;
        }
      `}</style>

      {/* Top utility bar — desktop only */}
      {!isMobile && (
        <div className="util-bar" style={{
          background: '#0d0d0d', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '7px 24px',
        }}>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, letterSpacing: '0.1em', color: '#cfcfcf', textTransform: 'uppercase' }}>
            Bangladesh's Baby & Kids Lifestyle Store
          </span>
          <span style={{ display: 'flex', gap: 22 }}>
            <span className="util-link" onClick={() => router.push('/about')}>Help</span>
            <span className="util-link" onClick={() => router.push('/contact')}>Contact</span>
          </span>
        </div>
      )}

      {/* Main nav */}
      <nav style={{
        background: 'var(--white)',
        padding: isMobile ? '14px 16px' : '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 0 }}>
          {isMobile && (
            <button className="nav-icon-btn" onClick={() => setMenuOpen(prev => !prev)} style={{ padding: '4px' }}>
              <HamburgerIcon color="#0d0d0d" />
            </button>
          )}
          <LogoMark router={router} isMobile={isMobile} />
        </div>

        <div style={{ display: 'flex', gap: isMobile ? 14 : 22, alignItems: 'center' }}>
          <button
            className={`signin-btn${isMobile ? ' signin-btn-mobile' : ''}`}
            onClick={() => router.push(user ? '/dashboard' : '/login')}
          >
            <UserIcon />
            {user ? user.name : 'Sign In'}
          </button>
          <button className="nav-icon-btn" onClick={() => router.push('/checkout')}>
            <CartIcon />
            <CartCount />
          </button>
        </div>
      </nav>

      {/* Category bar — desktop only, hidden on /products (that page has its own category bar) */}
      {!isMobile && !pathname?.startsWith('/products') && (
        <div style={{
          background: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          position: 'sticky',
          top: 64,
          zIndex: 99,
        }}>
          {categories.map(cat => {
            const subs = subMap[cat.id] || [];
            const isOpen = hoveredCatId === cat.id;
            return (
              <div
                key={cat.id}
                style={{ position: 'relative', flexShrink: 0 }}
                onMouseEnter={() => handleCatEnter(cat.id)}
                onMouseLeave={handleCatLeave}
              >
                <button className="cat-bar-btn" onClick={() => goTo(cat.name)}>
                  {cat.name}
                </button>

                {isOpen && subs.length > 0 && (
                  <div
                    className="mega-dropdown"
                    style={{ minWidth: 260, padding: '24px 26px' }}
                    onMouseEnter={() => handleCatEnter(cat.id)}
                    onMouseLeave={handleCatLeave}
                  >
                    <div className="mega-heading">{cat.name} — Shop by Type</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {subs.map(s => (
                        <span
                          key={s.id}
                          className="cat-card-sub-tag"
                          style={{ fontSize: 12.5, padding: '6px 0' }}
                          onClick={() => goTo(s.name)}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                    <div className="mega-footer">
                      <button className="mega-view-all" onClick={() => goTo(cat.name)}>
                        Shop All {cat.name} →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            className="cat-bar-btn"
            style={{ marginLeft: 'auto', color: 'var(--gold)' }}
            onClick={() => router.push('/products')}
          >
            View All →
          </button>
        </div>
      )}

      {/* Mobile: slide-out category drawer */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMenuOpen(false)} />
          <div style={{
            position: 'relative', width: 300, background: 'var(--white)',
            height: '100%', overflowY: 'auto', zIndex: 1,
            animation: 'slideInLeft 0.22s ease forwards',
          }}>
            <div style={{
              background: 'var(--ink)', padding: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, zIndex: 2,
            }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff', fontWeight: 600, fontSize: 18, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Categories
              </span>
              <button className="nav-icon-btn" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {categories.map(cat => {
              const subs = subMap[cat.id] || [];
              const isOpen = expandedCatId === cat.id;
              return (
                <div key={cat.id}>
                  <div
                    className="drawer-cat-row"
                    style={{ background: isOpen ? 'var(--ivory)' : '#fff' }}
                    onClick={() => {
                      if (subs.length > 0) {
                        setExpandedCatId(isOpen ? null : cat.id);
                      } else {
                        goTo(cat.name);
                      }
                    }}
                  >
                    <div className="drawer-thumb">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} />
                      ) : (
                        <span className="drawer-thumb-mono">{monogram(cat.name)}</span>
                      )}
                    </div>
                    <span className="drawer-cat-name">{cat.name}</span>
                    {subs.length > 0 && (
                      <span className={`drawer-toggle${isOpen ? ' open' : ''}`}>{isOpen ? '−' : '+'}</span>
                    )}
                  </div>

                  {isOpen && subs.length > 0 && (
                    <div className="sub-slide">
                      {subs.map(sub => (
                        <div key={sub.id} className="drawer-sub-row" onClick={() => goTo(sub.name)}>
                          {sub.name}
                        </div>
                      ))}
                      <div className="drawer-sub-view-all" onClick={() => goTo(cat.name)}>
                        সব দেখুন →
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

/* ── Sub-components ── */

function LogoMark({ router, isMobile }) {
  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      onClick={() => router.push('/')}
    >
      <span className="wordmark" style={{ fontSize: isMobile ? 20 : 24 }}>Rupanjel</span>
    </div>
  );
}

function HamburgerIcon({ color = '#0d0d0d' }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      background: '#0d0d0d', color: '#c9a961', borderRadius: '50%',
      width: '17px', height: '17px', fontSize: '10px', fontWeight: '700',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid #c9a961',
    }}>
      {count}
    </span>
  );
}
