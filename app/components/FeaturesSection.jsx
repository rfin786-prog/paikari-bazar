'use client';
import { useEffect, useRef } from 'react';

export default function FeaturesSection() {
  const features = [
    { icon: '🛒', title: 'সহজ অর্ডার', desc: 'মাত্র কয়েক ক্লিকে হাজার হাজার পণ্য অর্ডার করুন', color: '#e8a020' },
    { icon: '💰', title: 'সেরা দাম', desc: 'সরাসরি কারখানা থেকে কিনুন, মধ্যস্থতাকারী নেই', color: '#27ae60' },
    { icon: '📊', title: 'অর্ডার ট্র্যাকিং', desc: 'রিয়েল-টাইমে আপনার অর্ডারের অবস্থান জানুন', color: '#2980b9' },
  ];

  const cardRefs = useRef([]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes featureSlideUp {
        from { opacity: 0; transform: translateY(40px) rotateX(10deg); }
        to { opacity: 1; transform: translateY(0) rotateX(0deg); }
      }
      @keyframes iconFloat {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-6px) scale(1.08); }
      }
      @keyframes shinePass {
        0% { left: -80%; }
        100% { left: 130%; }
      }
      .feature-card {
        transition: box-shadow 0.3s ease, border-color 0.3s ease;
        transform-style: preserve-3d;
        will-change: transform;
        position: relative;
        overflow: hidden;
      }
      .feature-card::before {
        content: '';
        position: absolute;
        top: 0; left: -80%;
        width: 60%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
        transform: skewX(-15deg);
        opacity: 0;
        transition: opacity 0.1s;
        pointer-events: none;
        z-index: 2;
      }
      .feature-card:hover::before {
        opacity: 1;
        animation: shinePass 0.55s ease forwards;
      }
      .feature-card:hover .feature-icon {
        animation: iconFloat 1.2s ease-in-out infinite;
      }
      .feature-card-0 { animation: featureSlideUp 0.6s ease 0.1s both; }
      .feature-card-1 { animation: featureSlideUp 0.6s ease 0.25s both; }
      .feature-card-2 { animation: featureSlideUp 0.6s ease 0.4s both; }
    `;
    document.head.appendChild(style);

    // 3D tilt on mouse move
    const handlers = cardRefs.current.map((card, i) => {
      if (!card) return null;
      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotY = ((x - cx) / cx) * 10;
        const rotX = -((y - cy) / cy) * 10;
        card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
        card.style.boxShadow = `${-rotY * 1.5}px ${rotX * 1.5}px 32px rgba(0,0,0,0.13), 0 8px 24px rgba(0,0,0,0.08)`;
      };
      const onLeave = () => {
        card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        card.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      return { card, onMove, onLeave };
    });

    return () => {
      document.head.removeChild(style);
      handlers.forEach((h) => {
        if (!h) return;
        h.card.removeEventListener('mousemove', h.onMove);
        h.card.removeEventListener('mouseleave', h.onLeave);
      });
    };
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)',
      padding: '52px 44px',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
    }}>
      {features.map((f, i) => (
        <div
          key={i}
          ref={(el) => (cardRefs.current[i] = el)}
          className={`feature-card feature-card-${i}`}
          style={{
            padding: '30px 26px',
            border: '1.5px solid #e5e7eb',
            borderRadius: '18px',
            background: '#fff',
            cursor: 'default',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Top accent line */}
          <div style={{
            position: 'absolute',
            top: 0, left: '20%', right: '20%',
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
            borderRadius: '0 0 4px 4px',
            opacity: 0.7,
          }} />

          {/* Icon */}
          <div
            className="feature-icon"
            style={{
              width: '54px', height: '54px',
              background: `linear-gradient(135deg, ${f.color}18, ${f.color}30)`,
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '18px',
              boxShadow: `0 4px 14px ${f.color}30`,
              border: `1px solid ${f.color}25`,
              transform: 'perspective(200px) rotateY(-6deg) rotateX(4deg)',
            }}
          >
            {f.icon}
          </div>

          <h3 style={{
            fontSize: '17px',
            fontWeight: '800',
            marginBottom: '8px',
            color: '#0f2442',
            letterSpacing: '-0.2px',
          }}>
            {f.title}
          </h3>
          <p style={{
            fontSize: '13.5px',
            color: '#6b7280',
            lineHeight: '1.75',
            margin: 0,
          }}>
            {f.desc}
          </p>

          {/* Bottom right accent dot */}
          <div style={{
            position: 'absolute',
            bottom: '18px', right: '20px',
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: `${f.color}40`,
            boxShadow: `0 0 8px ${f.color}60`,
          }} />
        </div>
      ))}
    </div>
  );
}
