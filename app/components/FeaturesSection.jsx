'use client';
import { useEffect, useRef } from 'react';

export default function FeaturesSection() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
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
      title: 'Easy Ordering',
      desc: 'Order thousands of products in just a few clicks from verified wholesalers.',
    },
    {
      icon: '💰',
      title: 'Best Prices',
      desc: 'Buy directly from wholesalers — no middlemen, no hidden charges.',
    },
    {
      icon: '📦',
      title: 'Order Tracking',
      desc: 'Track your orders in real-time from dispatch to doorstep delivery.',
    },
    {
      icon: '🚚',
      title: 'Fast Delivery',
      desc: 'Choose from Standard, Express, Scheduled, or Self Pickup options.',
    },
    {
      icon: '🧾',
      title: 'Invoice & Reports',
      desc: 'Download or print professional invoices for every order instantly.',
    },
    {
      icon: '🔒',
      title: 'Secure & Trusted',
      desc: 'Your data and transactions are always safe and encrypted.',
    },
  ];

  return (
    <>
      <style>{`
        .feature-card {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .feature-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div style={{
        background: '#f8fafc',
        padding: '60px 20px',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '1.5px',
              color: '#e8a020',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Why Choose Us
            </p>
            <h2 style={{
              fontSize: 'clamp(22px, 4vw, 32px)',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0',
              lineHeight: '1.3',
            }}>
              Everything your business needs
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              marginTop: '10px',
            }}>
              A complete wholesale platform built for Bangladeshi retailers
            </p>
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {features.map((item, i) => (
              <div
                key={i}
                ref={(el) => (cardsRef.current[i] = el)}
                className="feature-card"
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  border: '1px solid #e2e8f0',
                  transitionDelay: `${i * 0.08}s`,
                }}
              >
                <div style={{
                  fontSize: '24px',
                  marginBottom: '14px',
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '8px',
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  lineHeight: '1.6',
                }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
