'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function HeroSection() {
  const router = useRouter();
  const cardsRef = useRef([]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatA {
        0%, 100% { transform: translateY(0px) rotateX(2deg); }
        50% { transform: translateY(-10px) rotateX(-2deg); }
      }
      @keyframes floatB {
        0%, 100% { transform: translateY(-6px) rotateX(-1deg); }
        50% { transform: translateY(6px) rotateX(2deg); }
      }
      @keyframes floatC {
        0%, 100% { transform: translateY(0px); }
        33% { transform: translateY(-8px); }
        66% { transform: translateY(4px); }
      }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes orbitSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulseBadge {
        0%, 100% { box-shadow: 0 0 0 0 rgba(232,160,32,0.4); }
        50% { box-shadow: 0 0 0 8px rgba(232,160,32,0); }
      }
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      .hero-badge {
        animation: pulseBadge 2.5s ease-in-out infinite, fadeSlideUp 0.6s ease both;
      }
      .hero-title {
        animation: fadeSlideUp 0.7s ease 0.1s both;
      }
      .hero-para {
        animation: fadeSlideUp 0.7s ease 0.2s both;
      }
      .hero-btns {
        animation: fadeSlideUp 0.7s ease 0.3s both;
      }
      .stat-card-0 {
        animation: floatA 4s ease-in-out infinite, fadeSlideUp 0.7s ease 0.35s both;
      }
      .stat-card-1 {
        animation: floatB 5s ease-in-out infinite, fadeSlideUp 0.7s ease 0.45s both;
      }
      .stat-card-2 {
        animation: floatC 4.5s ease-in-out infinite, fadeSlideUp 0.7s ease 0.55s both;
      }
      .stat-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        transform-style: preserve-3d;
        perspective: 600px;
        cursor: default;
      }
      .stat-card:hover {
        background: rgba(255,255,255,0.15) !important;
        box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(232,160,32,0.3);
      }
      .btn-primary {
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        position: relative;
        overflow: hidden;
      }
      .btn-primary::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
        background-size: 200% 100%;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .btn-primary:hover::after {
        opacity: 1;
        animation: shimmer 0.6s ease;
      }
      .btn-primary:hover {
        transform: translateY(-3px) scale(1.03);
        box-shadow: 0 10px 30px rgba(232,160,32,0.6) !important;
      }
      .btn-primary:active {
        transform: translateY(0px) scale(0.98);
      }
      .btn-secondary {
        transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;
      }
      .btn-secondary:hover {
        background: rgba(255,255,255,0.1) !important;
        border-color: rgba(255,255,255,0.7) !important;
        transform: translateY(-3px);
      }
      .btn-secondary:active {
        transform: translateY(0px);
      }
      .orbit-ring {
        animation: orbitSpin 18s linear infinite;
      }
      .orbit-ring-2 {
        animation: orbitSpin 28s linear infinite reverse;
      }
      .hero-text-glow {
        text-shadow:
          0 0 40px rgba(232,160,32,0.25),
          0 2px 0 rgba(0,0,0,0.3),
          0 4px 8px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const stats = [
    { icon: '📦', title: '৫,০০০+ পণ্য', sub: 'বিভিন্ন ক্যাটাগরিতে' },
    { icon: '🏪', title: '১০,০০০+ দোকান', sub: 'সারা বাংলাদেশে' },
    { icon: '🚚', title: 'দ্রুত ডেলিভারি', sub: '২৪-৪৮ ঘণ্টায়' },
  ];

  return (
    <div style={{
      background: 'linear-gradient(140deg, #071828 0%, #0f2442 45%, #1a3a5c 100%)',
      color: '#fff',
      padding: '64px 48px 60px',
      display: 'flex',
      gap: '50px',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '340px',
    }}>

      {/* Background decorative rings */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Large orbit ring top-right */}
        <div className="orbit-ring" style={{
          position: 'absolute',
          width: '560px', height: '560px',
          border: '1.5px dashed rgba(232,160,32,0.12)',
          borderRadius: '50%',
          right: '-180px', top: '-200px',
        }} />
        <div className="orbit-ring-2" style={{
          position: 'absolute',
          width: '380px', height: '380px',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '50%',
          right: '-80px', top: '-100px',
        }} />
        {/* Dot on orbit */}
        <div style={{
          position: 'absolute',
          width: '8px', height: '8px',
          background: 'rgba(232,160,32,0.6)',
          borderRadius: '50%',
          right: '100px', top: '40px',
          boxShadow: '0 0 12px rgba(232,160,32,0.8)',
        }} />
        {/* Bottom left glow */}
        <div style={{
          position: 'absolute',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(232,160,32,0.08) 0%, transparent 70%)',
          left: '-80px', bottom: '-80px',
        }} />
        {/* Grid lines subtle */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* Left content */}
      <div style={{ flex: 1, zIndex: 1 }}>
        {/* Badge */}
        <div className="hero-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(232,160,32,0.12)',
          border: '1px solid rgba(232,160,32,0.5)',
          borderRadius: '30px',
          padding: '6px 16px',
          fontSize: '12px',
          color: '#f5c842',
          fontWeight: '600',
          marginBottom: '22px',
          letterSpacing: '0.02em',
        }}>
          🚀 বাংলাদেশের #১ পাইকারি প্ল্যাটফর্ম
        </div>

        {/* Heading with 3D text effect */}
        <h1 className="hero-title" style={{
          fontSize: '46px',
          lineHeight: '1.18',
          marginBottom: '18px',
          fontWeight: '900',
          letterSpacing: '-0.5px',
        }}>
          পাইকারি{' '}
          <span className="hero-text-glow" style={{
            color: '#e8a020',
            display: 'inline-block',
            transform: 'perspective(300px) rotateX(4deg)',
            transformOrigin: 'center bottom',
          }}>
            সহজ
          </span>{' '}হোক<br />
          <span style={{
            background: 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            আপনার জন্য
          </span>
        </h1>

        <p className="hero-para" style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: '1.85',
          maxWidth: '400px',
          marginBottom: '34px',
        }}>
          সরাসরি কারখানা থেকে পণ্য কিনুন। সেরা দামে পাইকারি অর্ডার করুন।
        </p>

        {/* Buttons */}
        <div className="hero-btns" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => router.push('/register')}
            style={{
              background: 'linear-gradient(135deg, #f0b030 0%, #e8a020 60%, #d4900a 100%)',
              color: '#0f2442',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 6px 24px rgba(232,160,32,0.45), 0 2px 0 rgba(255,255,255,0.2) inset',
              letterSpacing: '0.01em',
            }}
          >
            বিনামূল্যে শুরু করুন
          </button>
          <button
            className="btn-secondary"
            onClick={() => router.push('/login')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.3)',
              padding: '14px 28px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'inherit',
              backdropFilter: 'blur(8px)',
            }}
          >
            লগইন করুন
          </button>
        </div>
      </div>

      {/* Right — 3D floating stat cards */}
      <div style={{
        flex: '0 0 270px',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        perspective: '800px',
      }}>
        {stats.map((c, i) => (
          <div
            key={i}
            className={`stat-card stat-card-${i}`}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: '16px',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.08) inset',
            }}
          >
            {/* Icon with 3D glow */}
            <div style={{
              fontSize: '30px',
              width: '52px', height: '52px',
              background: 'rgba(232,160,32,0.12)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(232,160,32,0.2)',
              transform: 'perspective(200px) rotateY(-8deg) rotateX(4deg)',
            }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: '15px', color: '#fff', fontWeight: '700', marginBottom: '2px' }}>{c.title}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{c.sub}</div>
            </div>
            {/* Right accent line */}
            <div style={{
              marginLeft: 'auto',
              width: '3px', height: '32px',
              background: 'linear-gradient(180deg, rgba(232,160,32,0.8) 0%, rgba(232,160,32,0.1) 100%)',
              borderRadius: '2px',
              flexShrink: 0,
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
