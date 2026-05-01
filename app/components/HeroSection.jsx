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

  return (
    <div style={{
      background: 'linear-gradient(140deg, #071828 0%, #0f2442 45%, #1a3a5c 100%)',
      color: '#fff',
      padding: isMobile ? '40px 16px' : '64px 48px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      justifyContent: 'center',
      minHeight: '80vh',
    }}>

      {/* TEXT */}
      <div style={{ width: '100%' }}>

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
          marginBottom: '28px',
        }}>
          সরাসরি পাইকার থেকে আপনার দোকানে
        </p>

        <button
          onClick={() => router.push('/register')}
          style={{
            width: '100%',
            background: '#e8a020',
            color: '#0f2442',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '16px',
          }}
        >
          দোকান নিবন্ধন করুন
        </button>

      </div>

    </div>
  );
}
