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
    { icon: '🏪', num: '৫০০০+', label: 'যাচাইকৃত পাইকার', bg: '#fff3eb', color: '#cc5200' },
    { icon: '🚚', num: '৪৮ ঘণ্টা', label: 'দ্রুত ডেলিভারি', bg: '#e8f5e9', color: '#2e7d32' },
    { icon: '📦', num: '১০টি', label: 'পণ্য বিভাগ', bg: '#ede7f6', color: '#4527a0' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '10px',
      padding: isMobile ? '10px 12px' : '12px 20px',
      background: '#f5f5f5'
    }}>

      {/* Main hero */}
      <div style={{
        flex: 1,
        background: '#fff3eb',
        borderRadius: '8px',
        padding: isMobile ? '22px 18px' : '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: isMobile ? '160px' : '200px'
      }}>
        <span style={{
          display: 'inline-block', background: '#ffe8d6', color: '#cc5200',
          fontSize: '11px', fontWeight: '700', padding: '3px 12px',
          borderRadius: '20px', marginBottom: '10px', width: 'fit-content'
        }}>
          ✦ B2B সোর্সিং প্ল্যাটফর্ম
        </span>
        <h1 style={{
          fontSize: isMobile ? '20px' : 'clamp(20px, 3vw, 28px)',
          fontWeight: '700', color: '#1a1a1a',
          margin: '0 0 8px', lineHeight: '1.35'
        }}>
          সরাসরি পাইকার থেকে<br />আপনার দোকানে
        </h1>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 18px' }}>
          কম খরচে · দ্রুত ডেলিভারি · যাচাইকৃত সাপ্লায়ার
        </p>
        <button
          onClick={() => router.push('/register')}
          style={{
            background: '#ff6a00', color: '#fff', border: 'none',
            padding: isMobile ? '12px 20px' : '11px 24px',
            borderRadius: '6px', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', width: 'fit-content'
          }}
        >
          দোকান নিবন্ধন করুন →
        </button>
        <p style={{ marginTop: '10px', fontSize: '11px', color: '#999' }}>
          🔒 বিনামূল্যে · কোনো কমিশন নেই · যেকোনো সময় বাতিল
        </p>
      </div>

      {/* Stat cards — mobile এ horizontal scroll, desktop এ column */}
      {isMobile ? (
        <div style={{
          display: 'flex', flexDirection: 'row', gap: '8px',
          overflowX: 'auto', paddingBottom: '4px',
          msOverflowStyle: 'none', scrollbarWidth: 'none'
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '8px', padding: '12px 14px',
              border: '1px solid #eee', display: 'flex', alignItems: 'center',
              gap: '10px', flexShrink: 0, minWidth: '150px'
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '8px',
                background: s.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '16px', flexShrink: 0
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>{s.num}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '170px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '8px', padding: '14px 16px',
              border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '8px',
                background: s.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '18px', flexShrink: 0
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>{s.num}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
