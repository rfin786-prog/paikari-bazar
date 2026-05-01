'use client';
import { useEffect, useRef } from 'react';

export default function FeaturesSection() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.2 }
    );

    cardsRef.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: '🛒',
      title: 'সহজ অর্ডার',
      desc: 'মাত্র কয়েক ক্লিকে হাজার হাজার পণ্য অর্ডার করুন',
      color: '#f59e0b',
    },
    {
      icon: '💰',
      title: 'সেরা দাম',
      desc: 'সরাসরি পাইকার থেকে কিনুন, মধ্যস্বত্বভোগী নেই',
      color: '#22c55e',
    },
    {
      icon: '📊',
      title: 'অর্ডার ট্র্যাকিং',
      desc: 'রিয়েল-টাইম আপনার অর্ডারের অবস্থা জানুন',
      color: '#3b82f6',
    },
  ];

  return (
    <div style={{
      background: '#f8fafc',
      padding: '40px 12px',
    }}>

      <div style={{
        display: 'flex',
        gap: '14px',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '10px',
      }}>
        {features.map((item, i) => (
          <div
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            style={{
              flex: '0 0 75%',
              maxWidth: '220px',
              scrollSnapAlign: 'center',
              background: '#fff',
              borderRadius: '22px',
              padding: '20px 16px',
              textAlign: 'center',
              boxShadow: '0 12px 30px rgba(0,0,0,0.08)',

              // animation initial
              opacity: 0,
              transform: 'translateY(30px)',
              transition: `all 0.6s ease ${i * 0.15}s`,
            }}
          >

            <div style={{
              fontSize: '30px',
              marginBottom: '12px',
            }}>
              {item.icon}
            </div>

            <div style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '8px',
              color: '#0f172a',
            }}>
              {item.title}
            </div>

            <div style={{
              fontSize: '12px',
              color: '#64748b',
              lineHeight: '1.5',
            }}>
              {item.desc}
            </div>

            <div style={{
              width: '6px',
              height: '6px',
              background: item.color,
              borderRadius: '50%',
              margin: '12px auto 0',
              opacity: 0.6,
            }} />
          </div>
        ))}
      </div>

    </div>
  );
}
