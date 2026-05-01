'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `

    @keyframes wordIn {
      0% {
        opacity: 0;
        transform: translateY(40px) scale(0.95);
        filter: blur(6px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    @keyframes glowMove {
      0% { transform: translate(0,0); }
      50% { transform: translate(-30px, 30px); }
      100% { transform: translate(0,0); }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.04); }
      100% { transform: scale(1); }
    }

    `;
    document.head.appendChild(style);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const words = [
    { text: 'পাইকারি', highlight: false },
    { text: 'সহজ', highlight: true },
    { text: 'হোক', highlight: false },
    { text: 'আপনার', highlight: false },
    { text: 'জন্য', highlight: false },
  ];

  return (
    <div style={{
      background: 'linear-gradient(140deg, #071828 0%, #0f2442 50%, #1a3a5c 100%)',
      color: '#fff',
      padding: '80px 16px 60px',
      position: 'relative',
      overflow: 'hidden',
      transform: `translateY(${scrollY * 0.1}px)`,
      opacity: scrollY > 200 ? 0.8 : 1
    }}>

      {/* glow */}
      <div style={{
        position: 'absolute',
        width: '220px',
        height: '220px',
        background: 'rgba(232,160,32,0.15)',
        borderRadius: '50%',
        top: '-60px',
        right: '-60px',
        filter: 'blur(70px)',
        animation: 'glowMove 7s ease-in-out infinite'
      }} />

      <div style={{ maxWidth: '520px' }}>

        {/* TEXT */}
        <h1 style={{
          fontSize: '30px',
          fontWeight: '900',
          lineHeight: '1.4',
          marginBottom: '14px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {words.map((word, i) => (
            <span
              key={i}
              style={{
                opacity: 0,
                animation: 'wordIn 0.6s ease forwards',
                animationDelay: `${i * 0.15}s`,
                color: word.highlight ? '#e8a020' : '#fff'
              }}
            >
              {word.text}
            </span>
          ))}
        </h1>

        {/* SUB */}
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.75)',
          marginBottom: '24px',
          opacity: 0,
          animation: 'wordIn 0.6s ease forwards',
          animationDelay: '0.9s'
        }}>
          সরাসরি পাইকার থেকে আপনার দোকানে
        </p>

        {/* BUTTON */}
        <button
          onClick={() => router.push('/register')}
          style={{
            width: '100%',
            background: '#e8a020',
            color: '#0f2442',
            padding: '15px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '16px',
            animation: 'pulse 2.5s infinite',
            transition: '0.2s',
            cursor: 'pointer'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          দোকান নিবন্ধন করুন
        </button>

      </div>

    </div>
  );
}
