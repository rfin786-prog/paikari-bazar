'use client';

import { useState, useEffect } from 'react';

const deals = [
  { id: 1, name: 'মিনিকেট চাল', price: 58, originalPrice: 65, unit: 'কেজি', emoji: '🌾' },
  { id: 2, name: 'সয়াবিন তেল', price: 145, originalPrice: 160, unit: 'লিটার', emoji: '🫙' },
  { id: 3, name: 'মসুর ডাল', price: 95, originalPrice: 110, unit: 'কেজি', emoji: '🫘' },
  { id: 4, name: 'চিনি', price: 120, originalPrice: 135, unit: 'কেজি', emoji: '🧂' },
];

function Countdown() {
  const [time, setTime] = useState({ h: 23, m: 59, s: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 23, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {[pad(time.h), pad(time.m), pad(time.s)].map((val, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            background: '#e8a020', color: '#000', fontWeight: 'bold',
            padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '1.1rem'
          }}>{val}</span>
          {i < 2 && <span style={{ color: '#e8a020', fontWeight: 'bold' }}>:</span>}
        </span>
      ))}
    </div>
  );
}

export default function DailyDeals() {
  return (
    <section style={{ padding: '24px 16px', background: '#111' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ color: '#e8a020', fontFamily: 'Hind Siliguri', fontSize: '1.3rem', margin: 0 }}>
          🔥 আজকের অফার
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#aaa', fontSize: '0.85rem' }}>শেষ হবে:</span>
          <Countdown />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {deals.map(deal => (
          <div key={deal.id} style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: '12px', padding: '14px', position: 'relative'
          }}>
            <span style={{
              position: 'absolute', top: '8px', right: '8px',
              background: '#e8a020', color: '#000', fontSize: '0.7rem',
              fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px'
            }}>
              {Math.round((1 - deal.price / deal.originalPrice) * 100)}% ছাড়
            </span>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{deal.emoji}</div>
            <div style={{ color: '#fff', fontFamily: 'Hind Siliguri', fontWeight: 600, marginBottom: '4px' }}>
              {deal.name}
            </div>
            <div style={{ color: '#e8a020', fontWeight: 'bold', fontSize: '1.1rem' }}>
              ৳{deal.price}<span style={{ fontSize: '0.75rem', color: '#aaa' }}>/{deal.unit}</span>
            </div>
            <div style={{ color: '#666', fontSize: '0.8rem', textDecoration: 'line-through' }}>
              ৳{deal.originalPrice}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
