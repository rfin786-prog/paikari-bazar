'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HeroSection() {
  const router = useRouter();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
    
    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(25px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes glowMove {
      0% { transform: translate(0,0); }
      50% { transform: translate(-20px, 20px); }
      100% { transform: translate(0,0); }
    }

    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(140deg, #071828 0%, #0f2442 50%, #1a3a5c 100%)',
      color: '#fff',
      padding: '70px 16px 50px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* animated glow */}
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        background: 'rgba(232,160,32,0.15)',
        borderRadius: '50%',
        top: '-60px',
        right: '-60px',
        filter: 'blur(60px)',
        animation: 'glowMove 6s ease-in-out infinite'
      }} />

      <div style={{ maxWidth: '520px' }}>

        <h1 style={{
          fontSize: '28px',
          lineHeight: '1.35',
          marginBottom: '12px',
          fontWeight: '900',
          animation: 'fadeUp 0.6s ease forwards'
        }}>
          পাইকারি <span style={{ color: '#e8a020' }}>সহজ</span> হোক<br />
          আপনার জন্য
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.75)',
          lineHeight: '1.6',
          marginBottom: '24px',
          opacity: 0,
          animation: 'fadeUp 0.6s ease forwards',
          animationDelay: '0.2s'
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
            padding: '15px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '16px',
            boxShadow: '0 10px 25px rgba(232,160,32,0.35)',
            opacity: 0,
            animation: 'fadeUp 0.6s ease forwards',
            animationDelay: '0.4s'
          }}
        >
          দোকান নিবন্ধন করুন
        </button>

      </div>

    </div>
  );
}
