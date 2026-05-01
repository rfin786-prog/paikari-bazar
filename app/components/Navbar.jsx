'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <nav style={{
      background: '#0f2442',
      padding: isMobile ? '12px 18px' : '16px 44px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/')}>
        <div style={{
          width: isMobile ? '36px' : '42px',
          height: isMobile ? '36px' : '42px',
          background: '#e8a020',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMobile ? '18px' : '20px',
          flexShrink: 0,
        }}>🚚</div>
        <div>
          <div style={{ fontSize: isMobile ? '17px' : '21px', color: '#fff', fontWeight: '700', whiteSpace: 'nowrap' }}>
            পাইকারি<span style={{ color: '#e8a020' }}>বাজার</span>
          </div>
          {!isMobile && (
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px' }}>WHOLESALE B2B</div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px', flexShrink: 0 }}>
        <button
          onClick={() => router.push('/login')}
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.8)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            padding: isMobile ? '7px 14px' : '8px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: '600',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          লগইন
        </button>
        <button
          onClick={() => router.push('/register')}
          style={{
            background: '#e8a020',
            color: '#0f2442',
            border: 'none',
            padding: isMobile ? '7px 14px' : '9px 22px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: '700',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          নিবন্ধন
        </button>
      </div>
    </nav>
  );
}
