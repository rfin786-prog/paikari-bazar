"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function HeroSection() {
  const router = useRouter();
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [showRule, setShowRule] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  const [showTrust, setShowTrust] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const animRef = useRef(null);

  const text1 = 'আপনার ব্যবসায়িক প্রয়োজনে';
  const text2 = 'সোর্সিং থেকে ডেলিভারি —\nসব এক জায়গায়।';

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes cursor { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes floatOrb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,15px)} }
      @keyframes floatOrb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-10px)} }
      @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      .hero-btn:active { transform: scale(0.97) !important; }
    `;
    document.head.appendChild(style);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const timers = [];
    const delay = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); };

    let i = 0;
    const iv1 = setInterval(() => {
      setLine1(text1.slice(0, i + 1));
      i++;
      if (i >= text1.length) {
        clearInterval(iv1);
        delay(() => {
          let j = 0;
          const iv2 = setInterval(() => {
            setLine2(text2.slice(0, j + 1));
            j++;
            if (j >= text2.length) {
              clearInterval(iv2);
              delay(() => setShowRule(true), 200);
              delay(() => setShowSub(true), 400);
              delay(() => setShowStats(true), 600);
              delay(() => setShowBtn(true), 800);
              delay(() => setShowTrust(true), 1000);
            }
          }, 40);
          timers.push(iv2);
        }, 250);
      }
    }, 55);
    timers.push(iv1);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      timers.forEach(clearTimeout);
      try { document.head.removeChild(style); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232,160,32,0.5)';
        ctx.fill();
      });
      for (let a = 0; a < pts.length; a++) {
        for (let b = a + 1; b < pts.length; b++) {
          const dx = pts[a].x - pts[b].x;
          const dy = pts[a].y - pts[b].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(pts[a].x, pts[a].y);
            ctx.lineTo(pts[b].x, pts[b].y);
            ctx.strokeStyle = `rgba(232,160,32,${0.12 * (1 - d / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const isTypingL1 = line1.length < text1.length;
  const isTypingL2 = !isTypingL1 && line2.length < text2.length;
  const heroOpacity = scrollY > 250 ? Math.max(0.5, 1 - (scrollY - 250) / 350) : 1;
  const heroPush = Math.min(scrollY * 0.1, 40);

  const CursorBar = () => (
    <span style={{
      display: 'inline-block',
      width: '3px',
      height: '1em',
      background: '#e8a020',
      marginLeft: '3px',
      verticalAlign: 'middle',
      borderRadius: '2px',
      animation: 'cursor 0.65s step-end infinite',
    }} />
  );

  return (
    <div
      ref={heroRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #000 0%, #050f1a 40%, #091828 100%)',
        color: '#fff',
        minHeight: '480px',
        padding: 'clamp(48px,9vw,80px) clamp(20px,5vw,40px) 56px',
        opacity: heroOpacity,
        transform: `translateY(${heroPush}px)`,
        transition: 'opacity 0.08s linear, transform 0.08s linear',
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />

      {/* Ambient orbs */}
      <div style={{
        position: 'absolute',
        width: '380px',
        height: '380px',
        background: 'radial-gradient(circle, rgba(232,160,32,0.12) 0%, transparent 70%)',
        top: '-140px',
        right: '-100px',
        borderRadius: '50%',
        animation: 'floatOrb1 9s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '240px',
        height: '240px',
        background: 'radial-gradient(circle, rgba(40,100,200,0.07) 0%, transparent 70%)',
        bottom: '-60px',
        left: '-50px',
        borderRadius: '50%',
        animation: 'floatOrb2 12s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>

        {/* Top badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          background: 'rgba(232,160,32,0.1)',
          border: '1px solid rgba(232,160,32,0.22)',
          borderRadius: '100px',
          padding: '5px 13px 5px 7px',
          marginBottom: '22px',
          fontSize: '11px',
          color: '#e8a020',
          fontWeight: '700',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          <span style={{
            width: '16px',
            height: '16px',
            background: '#e8a020',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            color: '#000',
          }}>✦</span>
          B2B সোর্সিং প্ল্যাটফর্ম
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 36px)',
          fontWeight: '900',
          lineHeight: '1.55',
          margin: '0 0 18px',
          letterSpacing: '-0.01em',
          minHeight: 'clamp(130px, 18vw, 180px)',
        }}>
          <span style={{ display: 'block', color: 'rgba(255,255,255,0.92)', marginBottom: '4px' }}>
            {line1}
            {isTypingL1 && <CursorBar />}
          </span>
          <span style={{
            display: 'block',
            whiteSpace: 'pre-line',
            backgroundImage: line2.length > 0
              ? 'linear-gradient(90deg, #f4c050 0%, #e8a020 50%, #d4891a 100%)'
              : 'none',
            WebkitBackgroundClip: line2.length > 0 ? 'text' : 'unset',
            WebkitTextFillColor: line2.length > 0 ? 'transparent' : '#e8a020',
            backgroundClip: line2.length > 0 ? 'text' : 'unset',
          }}>
            {line2}
            {isTypingL2 && (
              <span style={{ WebkitTextFillColor: 'initial' }}>
                <CursorBar />
              </span>
            )}
          </span>
        </h1>

        {/* Animated rule */}
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, #e8a020, rgba(232,160,32,0))',
          width: showRule ? '100px' : '0px',
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          borderRadius: '2px',
          marginBottom: '14px',
        }} />

        {/* Subtext */}
        <p style={{
          fontSize: 'clamp(13px, 2.5vw, 15px)',
          color: 'rgba(255,255,255,0.5)',
          margin: '0 0 22px',
          lineHeight: '1.7',
          opacity: showSub ? 1 : 0,
          transform: showSub ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          সরাসরি পাইকার থেকে আপনার দোকানে —<br />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            কম খরচে, দ্রুত ও নির্ভরযোগ্যভাবে।
          </span>
        </p>

        {/* Stat pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '26px',
          opacity: showStats ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          {[
            { value: '৫০০০+', label: 'পাইকার' },
            { value: '৪৮ ঘণ্টা', label: 'ডেলিভারি' },
            { value: '১০টি', label: 'বিভাগ' },
          ].map((s, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(232,160,32,0.08)',
              border: '1px solid rgba(232,160,32,0.18)',
              borderRadius: '100px',
              padding: '6px 14px 6px 8px',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#e8a020',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                <strong style={{ color: '#e8a020' }}>{s.value}</strong> {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <button
          className="hero-btn"
          onClick={() => router.push('/register')}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: 'clamp(220px, 60%, 280px)',
            padding: '15px 22px',
            background: btnHover
              ? 'linear-gradient(135deg, #f4c050 0%, #e8a020 100%)'
              : 'linear-gradient(135deg, #e8a020 0%, #d4891a 100%)',
            color: '#0a1a2e',
            borderRadius: '13px',
            fontWeight: '800',
            fontSize: 'clamp(14px, 3vw, 16px)',
            border: 'none',
            cursor: 'pointer',
            opacity: showBtn ? 1 : 0,
            transform: showBtn ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease, background 0.25s ease, box-shadow 0.25s ease',
            boxShadow: btnHover
              ? '0 8px 28px rgba(232,160,32,0.35)'
              : '0 4px 16px rgba(232,160,32,0.2)',
            letterSpacing: '0.01em',
            pointerEvents: showBtn ? 'auto' : 'none',
          }}
        >
          {btnHover && (
            <span style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
              backgroundSize: '200% auto',
              animation: 'shimmer 0.6s linear',
              borderRadius: '13px',
              pointerEvents: 'none',
            }} />
          )}
          <span>দোকান নিবন্ধন করুন</span>
          <span style={{
            width: '24px',
            height: '24px',
            background: 'rgba(10,26,46,0.15)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            transform: btnHover ? 'translateX(3px)' : 'translateX(0)',
            transition: 'transform 0.25s ease',
            flexShrink: 0,
          }}>→</span>
        </button>

        {/* Trust note */}
        <p style={{
          marginTop: '14px',
          marginBottom: 0,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          opacity: showTrust ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          🔒 বিনামূল্যে নিবন্ধন · কোনো কমিশন নেই · যেকোনো সময় বাতিল
        </p>

      </div>
    </div>
  );
}
