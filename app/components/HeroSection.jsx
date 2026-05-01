'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
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
      padding: isMobile ? '40px 16px' : '64px 48px 60px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '32px' : '50px',
      alignItems: isMobile ? 'flex-start' : 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background (hide on mobile) */}
      {!isMobile && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{
            position: 'absolute',
            width: '560px', height: '560px',
            border: '1.5px dashed rgba(232,160,32,0.12)',
            borderRadius: '50%',
            right: '-180px', top: '-200px',
          }} />
          <div style={{
            position: 'absolute',
            width: '380px', height: '380px',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '50%',
            right: '-80px', top: '-100px',
          }} />
        </div>
      )}

      {/* LEFT */}
      <div style={{ flex: 1, zIndex: 1, width: '100%' }}>
        <div style={{
          display: 'inline-flex',
          background: 'rgba(232,160,32,0.12)',
          border: '1px solid rgba(232,160,32,0.5)',
          borderRadius: '30px',
          padding: '6px 14px',
          fontSize: '12px',
          marginBottom: '18px',
        }}>
          🚀 বাংলাদেশের #১ পাইকারি প্ল্যাটফর্ম
        </div>

        <h1 style={{
          fontSize: isMobile ? '28px' : '46px',
          lineHeight: isMobile ? '1.3' : '1.18',
          marginBottom: '14px',
          fontWeight: '900',
        }}>
          পাইকারি <span style={{ color: '#e8a020' }}>সহজ</span> হোক<br />
          আপনার জন্য
        </h1>

        <p style={{
          fontSize: isMobile ? '14px' : '16px',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: '1.7',
          marginBottom: '24px',
          maxWidth: isMobile ? '100%' : '400px',
        }}>
          সরাসরি কারখানা থেকে পণ্য কিনুন। সেরা দামে পাইকারি অর্ডার করুন।
        </p>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          width: '100%',
        }}>
          <button
            onClick={() => router.push('/register')}
            style={{
              width: isMobile ? '100%' : 'auto',
              background: '#e8a020',
              color: '#0f2442',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: '700',
            }}
          >
            বিনামূল্যে শুরু করুন
          </button>

          <button
            onClick={() => router.push('/login')}
            style={{
              width: isMobile ? '100%' : 'auto',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '14px',
              borderRadius: '10px',
            }}
          >
            লগইন করুন
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {stats.map((c, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{ fontSize: '24px' }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{c.title}</div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
