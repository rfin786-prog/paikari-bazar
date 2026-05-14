'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

// fallback icons for categories
const CAT_META = {
  'পোশাক': { icon: '👕', bg: '#fff3eb' },
  'মুদি': { icon: '🛒', bg: '#e8f5e9' },
  'খাদ্য': { icon: '🍚', bg: '#e8f5e9' },
  'ইলেকট্রনিক': { icon: '📱', bg: '#e3f2fd' },
  'গৃহস্থালি': { icon: '🏠', bg: '#fce4ec' },
  'কৃষি': { icon: '🌾', bg: '#f1f8e9' },
  'সৌন্দর্য': { icon: '🧴', bg: '#f3e5f5' },
  'শিশু': { icon: '👶', bg: '#fff8e1' },
  'প্যাকেজিং': { icon: '📦', bg: '#e0f2f1' },
  'হার্ডওয়্যার': { icon: '🔧', bg: '#fbe9e7' },
  'অর্গানিক': { icon: '🌿', bg: '#f9fbe7' },
  'পানীয়': { icon: '🥤', bg: '#e3f2fd' },
  'default': { icon: '🏷️', bg: '#f5f5f5' },
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

        // parent_id null = main category
        const parents = data.filter(c => !c.parent_id);
        const children = data.filter(c => c.parent_id);

        // sub category map: { parent_id: [children] }
        const map = {};
        children.forEach(c => {
          if (!map[c.parent_id]) map[c.parent_id] = [];
          map[c.parent_id].push(c);
        });

        setCategories(parents);
        setSubMap(map);

        // animate in
        setTimeout(() => setVisible(true), 100);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, []);

  const handleCatClick = (cat) => {
    if (subMap[cat.id]?.length > 0) {
      setActiveId(activeId === cat.id ? null : cat.id);
    } else {
      router.push(`/products?cat=${encodeURIComponent(cat.name)}`);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes subSlide {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 300px; }
        }
        .cat-card {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          border: 1.5px solid #eee;
        }
        .cat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(255,106,0,0.12);
          border-color: #ff6a00 !important;
        }
        .cat-card.active {
          border-color: #ff6a00 !important;
          box-shadow: 0 4px 16px rgba(255,106,0,0.15);
        }
        .sub-chip {
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          font-size: 11px;
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid #eee;
          background: #fff;
          color: #555;
          white-space: nowrap;
        }
        .sub-chip:hover {
          background: #ff6a00;
          color: #fff;
          border-color: #ff6a00;
        }
        .sub-scroll::-webkit-scrollbar { display: none; }
        .sub-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ padding: isMobile ? '14px 12px' : '16px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>
              পণ্য বিভাগ
            </h2>
            <p style={{ fontSize: '11px', color: '#999', margin: '2px 0 0' }}>
              বিভাগ বেছে নিন
            </p>
          </div>
          <span
            style={{ fontSize: '13px', color: '#ff6a00', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => router.push('/products')}
          >
            সব দেখুন →
          </span>
        </div>

        {/* Category grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: isMobile ? '8px' : '10px'
        }}>
          {categories.map((cat, i) => {
            const meta = getMeta(cat.name);
            const isActive = activeId === cat.id;
            const hasSubs = subMap[cat.id]?.length > 0;

            return (
              <div
                key={cat.id}
                className={`cat-card${isActive ? ' active' : ''}`}
                onClick={() => handleCatClick(cat)}
                style={{
                  background: '#fff',
                  borderRadius: isMobile ? '10px' : '12px',
                  padding: isMobile ? '10px 6px' : '14px 10px',
                  textAlign: 'center',
                  opacity: visible ? 1 : 0,
                  animation: visible ? `fadeUp 0.4s ease forwards` : 'none',
                  animationDelay: `${i * 0.05}s`,
                  position: 'relative'
                }}
              >
                {/* Sub indicator */}
                {hasSubs && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    fontSize: '8px', color: '#ff6a00', fontWeight: '800'
                  }}>
                    {isActive ? '▲' : '▼'}
                  </span>
                )}

                <div style={{
                  width: isMobile ? '36px' : '44px',
                  height: isMobile ? '36px' : '44px',
                  borderRadius: '10px',
                  background: isActive ? '#ff6a00' : meta.bg,
                  margin: '0 auto 6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? '18px' : '22px',
                  transition: 'background 0.2s'
                }}>
                  {cat.image_url
                    ? <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                    : meta.icon
                  }
                </div>

                <div style={{
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: '700',
                  color: isActive ? '#ff6a00' : '#222',
                  lineHeight: 1.3
                }}>
                  {cat.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sub categories — active category এর নিচে */}
        {activeId && subMap[activeId] && (
          <div
            className="sub-scroll"
            style={{
              marginTop: 12,
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              padding: '10px 4px',
              animation: 'subSlide 0.3s ease forwards',
              borderTop: '1px solid #f3f4f6'
            }}
          >
            {/* সব দেখুন chip */}
            <span
              className="sub-chip"
              style={{ background: '#fff3eb', color: '#ff6a00', borderColor: '#ff6a00', fontWeight: '700' }}
              onClick={() => {
                const parent = categories.find(c => c.id === activeId);
                router.push(`/products?cat=${encodeURIComponent(parent?.name)}`);
              }}
            >
              সব দেখুন
            </span>

            {subMap[activeId].map(sub => (
              <span
                key={sub.id}
                className="sub-chip"
                onClick={() => router.push(`/products?cat=${encodeURIComponent(sub.name)}`)}
              >
                {sub.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
