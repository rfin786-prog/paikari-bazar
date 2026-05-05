"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [showSub, setShowSub] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  const text1 = 'আপনার ব্যবসায়িক প্রয়োজনে';
  const text2 = 'সোর্সিং থেকে ডেলিভারি — সব এক জায়গায়।';

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `@keyframes glowMove { 0% { transform: translate(0,0); } 50% { transform: translate(-30px, 30px); } 100% { transform: translate(0,0); } } @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } } @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } } .cursor::after { content: '|'; animation: blink 0.7s infinite; color: #e8a020; } @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`;
    document.head.appendChild(style);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    let i = 0;
    let t2Interval = null;
    let sub1Timeout = null;
    let sub2Timeout = null;
    let pauseTimeout = null;

    const t1 = setInterval(() => {
      setLine1(text1.slice(0, i + 1));
      i++;
      if (i >= text1.length) {
        clearInterval(t1);
        pauseTimeout = setTimeout(() => {
          let j = 0;
          t2Interval = setInterval(() => {
            setLine2(text2.slice(0, j + 1));
            j++;
            if (j >= text2.length) {
              clearInterval(t2Interval);
              sub1Timeout = setTimeout(() => setShowSub(true), 300);
              sub2Timeout = setTimeout(() => setShowBtn(true), 600);
            }
          }, 45);
        }, 300);
      }
    }, 60);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(t1);
      if (t2Interval) clearInterval(t2Interval);
      if (pauseTimeout) clearTimeout(pauseTimeout);
      if (sub1Timeout) clearTimeout(sub1Timeout);
      if (sub2Timeout) clearTimeout(sub2Timeout);
      document.head.removeChild(style);
    };
  }, []);

  const bgShift = Math.min(scrollY * 0.05, 30);
  const heroOpacity = scrollY > 300 ? Math.max(0.6, 1 - (scrollY - 300) / 400) : 1;

  return (
    <div style={{
      background: `linear-gradient(140deg, #071828 0%, #0f2442 50%, #1a3a5c 100%)`,
      color: '#fff',
      padding: 'clamp(60px, 10vw, 100px) 16px 60px',
      position: 'relative',
      overflow: 'hidden',
      backgroundPositionY: `${bgShift}px`,
      opacity: heroOpacity,
      transition: 'opacity 0.1s ease',
    }}>

      <div style={{
        position: 'absolute',
        width: '220px',
        height: '220px',
        background: 'rgba(232,160,32,0.15)',
        borderRadius: '50%',
        top: '-60px',
        right: '-60px',
        filter: 'blur(70px)',
        animation: 'glowMove 7s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '520px', minHeight: '280px', display: 'flex', flexDirection: 'column' }}>

        <h1 style={{
          fontSize: 'clamp(22px, 5vw, 32px)',
          fontWeight: '900',
          lineHeight: '1.6',
          marginBottom: '14px',
          minHeight: '110px',
        }}>
          <span
            className={line1.length < text1.length ? 'cursor' : ''}
            style={{ display: 'block', color: '#fff' }}
          >
            {line1}
          </span>
          <span
            className={line1.length >= text1.length && line2.length < text2.length ? 'cursor' : ''}
            style={{ display: 'block', color: '#e8a020' }}
          >
            {line2}
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(13px, 3vw, 15px)',
          color: 'rgba(255,255,255,0.75)',
          marginBottom: '24px',
          opacity: showSub ? 1 : 0,
          visibility: showSub ? 'visible' : 'hidden',
          transform: showSub ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease, visibility 0.6s',
        }}>
          সরাসরি পাইকার থেকে আপনার দোকানে
        </p>

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
            border: 'none',
            animation: showBtn ? 'pulse 2.5s infinite' : 'none',
            cursor: 'pointer',
            transition: 'opacity 0.6s ease, transform 0.6s ease, visibility 0.6s',
            opacity: showBtn ? 1 : 0,
            visibility: showBtn ? 'visible' : 'hidden',
            transform: showBtn ? 'translateY(0)' : 'translateY(16px)',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          দোকান নিবন্ধন করুন
        </button>

      </div>
    </div>
  );
}
