'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

const CAT_META = {
  'পোশাক':     { icon: '👕', color: '#f97316' },
  'মুদি':      { icon: '🛒', color: '#16a34a' },
  'খাদ্য':     { icon: '🍚', color: '#16a34a' },
  'ইলেকট্রনিক':{ icon: '📱', color: '#2563eb' },
  'গৃহস্থালি': { icon: '🏠', color: '#db2777' },
  'কৃষি':      { icon: '🌾', color: '#65a30d' },
  'সৌন্দর্য':  { icon: '🧴', color: '#9333ea' },
  'শিশু':      { icon: '👶', color: '#d97706' },
  'প্যাকেজিং': { icon: '📦', color: '#0891b2' },
  'হার্ডওয়্যার':{ icon: '🔧', color: '#dc2626' },
  'অর্গানিক':  { icon: '🌿', color: '#65a30d' },
  'পানীয়':    { icon: '🥤', color: '#0284c7' },
  'default':   { icon: '🏷️', color: '#f97316' },
};

function getMeta(name) {
  const key = Object.keys(CAT_META).find(k => name?.includes(k));
  return key ? CAT_META[key] : CAT_META['default'];
}

export default function CategorySection() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [subMap, setSubMap] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const subRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/categories?select=*&order=name.asc`,
          { headers }
        );
        const data = await res.json();
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
        setTimeout(() => setVisible(true), 80);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeId && subRef.current) {
      subRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeId]);

  const handleCatClick = (cat) => {
    if (subMap[cat.id]?.length > 0) {
      setActiveId(prev => prev === cat.id ? null : cat.id);
    } else {
      router.push(`/products?cat=${encodeURIComponent(cat.name)}`);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes subIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chipPop {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(249,115,22,0.35); }
          70%  { box-shadow: 0 0 0 8px rgba(249,115,22,0); }
          100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
        }

        .cs-card {
          cursor: pointer;
          transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .cs-card:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 8px 24px rgba(249,115,22,0.18);
        }
        .cs-card:active {
          transform: scale(0.96);
        }
        .cs-card.active {
          box-shadow: 0 0 0 2px #f97316, 0 8px 24px rgba(249,115,22,0.22);
          animation: pulse-ring 0.6s ease forwards;
        }

        .cs-icon-wrap {
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .cs-card.active .cs-icon-wrap {
          background: #f97316 !important;
          transform: scale(1.08);
        }
        .cs-card.active .cs-label {
          color: #f97316 !important;
          font-weight: 800 !important;
        }

        .sub-chip {
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .sub-chip:hover {
          background: #f97316 !important;
          color: #fff !important;
          border-color: #f97316 !important;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(249,115,22,0.25);
        }
        .sub-chip:active {
          transform: scale(0.95);
        }
        .sub-scroll::-webkit-scrollbar { display: none; }
        .sub-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{
        padding: isMobile ? '16px 12px' : '20px 20px',
        background: '#fff',
        borderRadius: isMobile ? 0 : '16px',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '16px',
        }}>
          <div>
            <div style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#f97316',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '3px',
            }}>
              ব্রাউজ করুন
            </div>
            <h2 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '800',
              color: '#111',
              margin: 0,
              lineHeight: 1.2,
            }}>
              পণ্য বিভাগ
            </h2>
          </div>
          <button
            onClick={() => router.push('/products')}
            style={{
              fontSize: '12px',
              color: '#f97316',
              fontWeight: '700',
              background: '#fff3eb',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            সব দেখুন →
          </button>
        </div>

        {/* Category Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: isMobile ? '10px' : '12px',
        }}>
          {categories.map((cat, i) => {
            const meta = getMeta(cat.name);
            const isActive = activeId === cat.id;
            const hasSubs = subMap[cat.id]?.length > 0;

            return (
              <div
                key={cat.id}
                className={`cs-card${isActive ? ' active' : ''}`}
                onClick={() => handleCatClick(cat)}
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  padding: isMobile ? '10px 6px 8px' : '14px 8px 10px',
                  textAlign: 'center',
                  border: isActive ? '2px solid #f97316' : '1.5px solid #f0f0f0',
                  position: 'relative',
                  opacity: visible ? 1 : 0,
                  animation: visible ? `fadeUp 0.35s ease forwards` : 'none',
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                {/* Sub-indicator dot */}
                {hasSubs && (
                  <div style={{
                    position: 'absolute',
                    top: 7, right: 7,
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: isActive ? '#f97316' : '#d1d5db',
                    transition: 'background 0.2s',
                  }} />
                )}

                {/* Icon */}
                <div
                  className="cs-icon-wrap"
                  style={{
                    width: isMobile ? '40px' : '48px',
                    height: isMobile ? '40px' : '48px',
                    borderRadius: '12px',
                    background: isActive ? '#f97316' : `${meta.color}15`,
                    margin: '0 auto 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '20px' : '24px',
                    overflow: 'hidden',
                  }}
                >
                  {cat.image_url
                    ? <img
                        src={cat.image_url}
                        alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                      />
                    : meta.icon
                  }
                </div>

                {/* Label */}
                <div
                  className="cs-label"
                  style={{
                    fontSize: isMobile ? '10px' : '11px',
                    fontWeight: isActive ? '800' : '600',
                    color: isActive ? '#f97316' : '#333',
                    lineHeight: 1.3,
                    transition: 'color 0.2s, font-weight 0.2s',
                  }}
                >
                  {cat.name}
                </div>

                {/* Chevron for sub */}
                {hasSubs && (
                  <div style={{
                    fontSize: '8px',
                    color: isActive ? '#f97316' : '#bbb',
                    marginTop: '3px',
                    transition: 'transform 0.2s, color 0.2s',
                    transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                  }}>
                    ▼
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sub-categories panel */}
        {activeId && subMap[activeId] && (
          <div
            ref={subRef}
            style={{
              marginTop: '14px',
              padding: '14px 4px 4px',
              borderTop: '1.5px dashed #f0f0f0',
              animation: 'subIn 0.25s ease forwards',
            }}
          >
            {/* Sub panel header */}
            <div style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px',
              paddingLeft: '4px',
            }}>
              {categories.find(c => c.id === activeId)?.name} → সাব-ক্যাটাগরি
            </div>

            {/* Chips row */}
            <div
              className="sub-scroll"
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '6px',
              }}
            >
              {/* All chip */}
              <span
                className="sub-chip"
                onClick={() => {
                  const parent = categories.find(c => c.id === activeId);
                  router.push(`/products?cat=${encodeURIComponent(parent?.name)}`);
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: '1.5px solid #f97316',
                  background: '#fff3eb',
                  color: '#f97316',
                  fontSize: '12px',
                  fontWeight: '700',
                  animation: 'chipPop 0.2s ease forwards',
                }}
              >
                🏷️ সব
              </span>

              {subMap[activeId].map((sub, i) => (
                <span
                  key={sub.id}
                  className="sub-chip"
                  onClick={() => router.push(`/products?sub=${encodeURIComponent(sub.name)}`)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '20px',
                    border: '1.5px solid #e5e7eb',
                    background: '#fafafa',
                    color: '#444',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    animation: `chipPop 0.2s ease forwards`,
                    animationDelay: `${i * 0.04}s`,
                    opacity: 0,
                  }}
                >
                  {sub.image_url && (
                    <img
                      src={sub.image_url}
                      alt={sub.name}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {sub.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
