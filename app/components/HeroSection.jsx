'use client';

export default function HeroSection() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
      <img
        src="/hero-personalcare.jpg"
        alt="Rupanjel Personal Care"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center'
        }}
      />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '18px 20px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)'
      }}>
        <p style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '800',
          color: '#ffffff',
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          fontFamily: 'Hind Siliguri, sans-serif'
        }}>
          Everything for your care, in one place
        </p>
      </div>
    </div>
  );
}
