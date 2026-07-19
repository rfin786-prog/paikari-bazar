'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Footer() {
  const router = useRouter();
  const [extraLinks, setExtraLinks] = useState([]);
  const [activeCard, setActiveCard] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/pages?order=id.asc&select=slug,title`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setExtraLinks(data.map(p => ({ title: p.title, href: `/${p.slug}` })));
        }
      } catch (e) {}
    };
    fetchPages();
  }, []);

  const cols = [
    {
      title: 'About Rupanjel',
      links: [
        { title: 'About Us', href: '/about' },
        { title: 'How It Works', href: '/about' },
        { title: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'For Customers',
      links: [
        { title: 'Register', href: '/register' },
        { title: 'Browse Products', href: '/products' },
        { title: 'Track Order', href: '/orders' },
      ],
    },
    {
      title: 'Help',
      links: [
        { title: 'Terms & Conditions', href: '/terms' },
        { title: 'Privacy Policy', href: '/privacy' },
        ...extraLinks,
      ],
    },
  ];

  const handleSliderScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const cards = slider.querySelectorAll('.ft-card');
    let closest = 0, minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.getBoundingClientRect().left - slider.getBoundingClientRect().left);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveCard(closest);
  };

  return (
    <>
      <style>{`
        .ft-link { font-size: 12px; color: rgba(0,0,0,0.55); cursor: pointer; display: block; margin-bottom: 6px; transition: color 0.2s; }
        .ft-link:hover { color: #e8a020; }

        /* Desktop */
        .ft-desktop-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 24px; margin-bottom: 20px; }
        .ft-mobile-section { display: none; }

        /* Mobile */
        @media (max-width: 640px) {
          .ft-desktop-cols { display: none; }
          .ft-mobile-section { display: block; }
          .ft-slider { overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; display: flex; gap: 10px; padding: 0 16px 10px; scrollbar-width: none; }
          .ft-slider::-webkit-scrollbar { display: none; }
          .ft-card { flex: 0 0 150px; background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 12px 14px; scroll-snap-align: start; }
          .ft-card-title { font-size: 10px; font-weight: 700; color: #e8a020; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px; }
          .ft-card-link { font-size: 11px; color: rgba(0,0,0,0.5); display: block; margin-bottom: 5px; cursor: pointer; }
          .ft-dots { display: flex; justify-content: center; gap: 5px; margin: 4px 0 12px; }
          .ft-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(0,0,0,0.15); transition: background 0.2s; }
          .ft-dot.active { background: #e8a020; }
        }
      `}</style>

      <footer style={{ background: '#faf9f7', borderTop: '1px solid rgba(0,0,0,0.08)', padding: '28px 20px 16px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Desktop columns */}
          <div className="ft-desktop-cols">
            {cols.map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>{col.title}</div>
                {col.links.map((l, j) => (
                  <span key={j} className="ft-link" onClick={() => router.push(l.href)}>{l.title}</span>
                ))}
              </div>
            ))}
          </div>

          {/* Mobile card slider */}
          <div className="ft-mobile-section">
            <div className="ft-slider" ref={sliderRef} onScroll={handleSliderScroll}>
              {cols.map((col, i) => (
                <div key={i} className="ft-card">
                  <div className="ft-card-title">{col.title}</div>
                  {col.links.map((l, j) => (
                    <span key={j} className="ft-card-link" onClick={() => router.push(l.href)}>{l.title}</span>
                  ))}
                </div>
              ))}
            </div>
            <div className="ft-dots">
              {cols.map((_, i) => (
                <div key={i} className={`ft-dot${activeCard === i ? ' active' : ''}`} />
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ cursor: 'pointer', fontSize: '20px', fontWeight: '800', letterSpacing: '1px', color: '#1a1a1a', fontFamily: 'Georgia, serif' }} onClick={() => router.push('/')}>
              RUPANJEL
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.4)' }}>
              © {new Date().getFullYear()} <span style={{ color: '#e8a020' }}>Rupanjel</span> — All rights reserved
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.35)' }}>bKash · Nagad · Bank Transfer</div>
          </div>

        </div>
      </footer>
    </>
  );
}
