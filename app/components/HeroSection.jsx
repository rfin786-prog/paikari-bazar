'use client';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/banners')
      .then((res) => res.json())
      .then((data) => setBanners(data))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
        <img
          src="/hero-personalcare.jpg"
          alt="Rupanjel Personal Care"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, padding: '18px 20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)'
        }}>
          <p style={{
            margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)', fontFamily: 'Hind Siliguri, sans-serif'
          }}>
            Everything for your care, in one place
          </p>
        </div>
      </div>
    );
  }

  const banner = banners[current];

  const content = (
    <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
      <img
        src={banner.image_url}
        alt={banner.title || 'Rupanjel banner'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      />
      {(banner.title || banner.subtitle) && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, padding: '18px 20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)'
        }}>
          {banner.title && (
            <p style={{
              margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)', fontFamily: 'Hind Siliguri, sans-serif'
            }}>
              {banner.title}
            </p>
          )}
          {banner.subtitle && (
            <p style={{
              margin: '4px 0 0', fontSize: '13px', color: '#f0f0f0',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)', fontFamily: 'Hind Siliguri, sans-serif'
            }}>
              {banner.subtitle}
            </p>
          )}
        </div>
      )}
      {banners.length > 1 && (
        <div style={{ position: 'absolute', bottom: '10px', right: '16px', display: 'flex', gap: '6px' }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: i === current ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                border: 'none', padding: 0, cursor: 'pointer'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  return banner.link_url ? <a href={banner.link_url}>{content}</a> : content;
}
