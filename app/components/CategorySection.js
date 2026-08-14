'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

function monogram(name) {
  return name ? name.trim().charAt(0) : '—';
}

export default function CategorySection() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [subMap, setSubMap] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const rightPanelRef = useRef(null);

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
          `${SUPABASE_URL}/rest/v1/categories?select=*&order=sort_order.asc,created_at.asc`,
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
        Object.keys(map).forEach(pid => {
          map[pid].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        });
        setCategories(parents);
        setSubMap(map);
        if (parents.length > 0) setActiveId(parents[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (rightPanelRef.current) rightPanelRef.current.scrollLeft = 0;
  }, [activeId]);

  const activeCategory = categories.find(c => c.id === activeId);
  const activeSubs = subMap[activeId] || [];

  const handleSubClick = (sub) => router.push(`/products?cat=${encodeURIComponent(sub.name)}`);
  const handleViewAll = () => {
    if (activeCategory) router.push(`/products?cat=${encodeURIComponent(activeCategory.name)}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@400;500;600&display=swap');

        @keyframes catFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .cs-wrap { background: #ffffff; padding: ${isMobile ? '28px 16px' : '48px 40px'}; }
        .cs-eyebrow {
          font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 0.22em;
          text-transform: uppercase; color: #c9a961; text-align: center; margin: 0 0 8px;
        }
        .cs-heading {
          font-family: 'Cormorant Garamond', serif; font-weight: 600; color: #0d0d0d;
          text-align: center; margin: 0 0 28px; font-size: ${isMobile ? '26px' : '38px'};
        }
        .cs-tabs {
          display: flex; gap: ${isMobile ? '8px' : '14px'}; justify-content: ${isMobile ? 'flex-start' : 'center'};
          overflow-x: auto; padding-bottom: 4px; margin-bottom: ${isMobile ? '20px' : '32px'};
          scrollbar-width: none;
        }
        .cs-tabs::-webkit-scrollbar { display: none; }
        .cs-tab {
          font-family: 'Jost', sans-serif; font-size: ${isMobile ? '11px' : '12px'}; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap;
          padding: ${isMobile ? '9px 16px' : '11px 26px'}; cursor: pointer; border: 1px solid #e7e2d8;
          color: #6b6558; background: #fff; transition: all 0.2s ease; flex-shrink: 0;
        }
        .cs-tab.active { background: #0d0d0d; color: #c9a961; border-color: #0d0d0d; }
        .cs-tab:hover:not(.active) { border-color: #c9a961; color: #0d0d0d; }

        .cs-grid {
          display: grid;
          grid-template-columns: repeat(${isMobile ? 3 : 6}, 1fr);
          gap: ${isMobile ? '10px' : '18px'};
        }
        .cs-card { cursor: pointer; animation: catFadeUp 0.35s ease both; }
        .cs-card-img {
          position: relative; aspect-ratio: 3/4; overflow: hidden;
          background: linear-gradient(135deg, #1a1a1a, #3a3a3a); margin-bottom: 8px;
        }
        .cs-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .cs-card:hover .cs-card-img img { transform: scale(1.06); }
        .cs-card-mono {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif; font-size: ${isMobile ? '26px' : '34px'}; color: #e3d3ab;
        }
        .cs-card-name {
          font-family: 'Jost', sans-serif; font-size: ${isMobile ? '10.5px' : '12px'}; font-weight: 500;
          letter-spacing: 0.03em; color: #333; text-align: center; line-height: 1.3;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .cs-viewall {
          font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #0d0d0d; text-align: center; margin-top: ${isMobile ? '20px' : '30px'};
          cursor: pointer; border-bottom: 1px solid #c9a961; display: inline-block; padding-bottom: 3px;
        }
        .cs-viewall-wrap { text-align: center; }
      `}</style>

      <div className="cs-wrap">
        <p className="cs-eyebrow">Shop by Category</p>
        <h2 className="cs-heading">Girls &amp; Boys Collections</h2>

        {loading ? (
          <div className="cs-grid">
            {[...Array(isMobile ? 6 : 6)].map((_, i) => (
              <div key={i}>
                <div style={{ aspectRatio: '3/4', background: '#f0eee8', marginBottom: 8 }} />
                <div style={{ height: 8, background: '#f0eee8', width: '70%', margin: '0 auto' }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="cs-tabs">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className={`cs-tab${activeId === cat.id ? ' active' : ''}`}
                  onClick={() => setActiveId(cat.id)}
                >
                  {cat.name}
                </div>
              ))}
            </div>

            <div className="cs-grid" ref={rightPanelRef}>
              {activeSubs.map((sub, i) => (
                <div
                  key={sub.id}
                  className="cs-card"
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => handleSubClick(sub)}
                >
                  <div className="cs-card-img">
                    {sub.image_url ? (
                      <img src={sub.image_url} alt={sub.name} />
                    ) : (
                      <div className="cs-card-mono">{monogram(sub.name)}</div>
                    )}
                  </div>
                  <p className="cs-card-name">{sub.name}</p>
                </div>
              ))}
            </div>

            {activeCategory && (
              <div className="cs-viewall-wrap">
                <span className="cs-viewall" onClick={handleViewAll}>
                  Shop All {activeCategory.name} →
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
