'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetch('/api/banners')
      .then((res) => res.json())
      .then((data) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const heroHeight = isMobile ? '320px' : 'clamp(360px, 48vh, 520px)';
  const usingFallback = banners.length === 0;
  const banner = usingFallback ? null : banners[current];

  return (
    <div style={{ position: 'relative', width: '100%', height: heroHeight, overflow: 'hidden', background: '#0d0d0d' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@400;500;600&display=swap');

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #c9a961;
          animation: heroFadeUp 0.6s ease 0.1s both;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.08;
          animation: heroFadeUp 0.6s ease 0.22s both;
        }
        .hero-sub {
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          color: #e8e4da;
          animation: heroFadeUp 0.6s ease 0.34s both;
        }
        .hero-cta {
          font-family: 'Jost', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          animation: heroFadeUp 0.6s ease 0.46s both;
        }
        .hero-cta-primary {
          background: #c9a961;
          color: #0d0d0d;
          padding: 14px 30px;
        }
        .hero-cta-primary:hover { background: #e3d3ab; }
        .hero-cta-secondary {
          background: transparent;
          color: #ffffff;
          padding: 13px 28px;
          border: 1px solid rgba(255,255,255,0.55);
        }
        .hero-cta-secondary:hover { border-color: #c9a961; color: #c9a961; }
        .hero-dots button {
          width: 7px; height: 7px; border-radius: 50%; border: none; padding: 0; cursor: pointer;
        }
      `}</style>

      <img
        src={usingFallback ? '/hero-babydress.jpg' : banner.image_url}
        alt={usingFallback ? 'Rupanjel — Baby & Kids Fashion' : (banner.title || 'Rupanjel banner')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.82 }}
      />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.15) 45%, rgba(13,13,13,0.65) 100%)',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: isMobile ? '0 24px' : '0 40px',
      }}>
        {usingFallback ? (
          <>
            <p className="hero-eyebrow" style={{ margin: '0 0 14px' }}>Bangladesh's Baby &amp; Kids Lifestyle Store</p>
            <h1 className="hero-title" style={{ margin: 0, fontSize: isMobile ? '34px' : 'clamp(42px, 5vw, 68px)', maxWidth: '820px' }}>
              Little Beginnings,<br />Beautifully Dressed
            </h1>
            <p className="hero-sub" style={{ margin: isMobile ? '16px 0 26px' : '20px 0 34px', fontSize: isMobile ? '13.5px' : '15px', maxWidth: '480px', lineHeight: 1.6 }}>
              Thoughtfully made clothing for every age, from New Born to Kids — crafted for comfort, styled for every occasion.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="hero-cta hero-cta-primary" onClick={() => router.push('/products')}>
                Shop New Arrivals
              </button>
              <button className="hero-cta hero-cta-secondary" onClick={() => router.push('/products')}>
                Explore Collections
              </button>
            </div>
          </>
        ) : (
          <>
            {banner.title && (
              <h1 className="hero-title" style={{ margin: 0, fontSize: isMobile ? '30px' : 'clamp(38px, 4.6vw, 60px)', maxWidth: '820px' }}>
                {banner.title}
              </h1>
            )}
            {banner.subtitle && (
              <p className="hero-sub" style={{ margin: isMobile ? '14px 0 24px' : '18px 0 30px', fontSize: isMobile ? '13.5px' : '15px', maxWidth: '480px', lineHeight: 1.6 }}>
                {banner.subtitle}
              </p>
            )}
            <button
              className="hero-cta hero-cta-primary"
              onClick={() => router.push(banner.link_url || '/products')}
            >
              Shop Now
            </button>
          </>
        )}
      </div>

      {!usingFallback && banners.length > 1 && (
        <div className="hero-dots" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{ background: i === current ? '#c9a961' : 'rgba(255,255,255,0.4)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
