'use client';
import { useEffect, useRef } from 'react';

export default function AnimationSection() {
  const vanRef = useRef(null);

  useEffect(() => {
    let pos = -150;
    const interval = setInterval(() => {
      pos += 1.5;
      if (pos > window.innerWidth + 150) pos = -150;
      if (vanRef.current) vanRef.current.style.left = pos + 'px';
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#0a1628', padding: '40px 0 0', position: 'relative', height: '260px', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', color: '#fff', fontWeight: '700' }}>🏭 সরাসরি কারখানা থেকে আপনার দোকানে 🏪</div>
      </div>
      <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, height: '50px', background: '#1a2540' }}></div>
      <div style={{ position: 'absolute', bottom: '82px', left: 0, right: 0, height: '4px', background: '#e8a020', opacity: 0.3 }}></div>
      {[0,1,2,3,4,5,6,7].map(i => (
        <div key={i} style={{ position: 'absolute', bottom: '82px', left: `${i * 160 + 60}px`, width: '80px', height: '4px', background: '#faf7f2', opacity: 0.2 }}></div>
      ))}
      <div style={{ position: 'absolute', bottom: '108px', left: '40px', fontSize: '60px' }}>🏭</div>
      <div style={{ position: 'absolute', bottom: '60px', left: '40px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>কারখানা</div>
      <div style={{ position: 'absolute', bottom: '108px', right: '40px', fontSize: '60px' }}>🏪</div>
      <div style={{ position: 'absolute', bottom: '60px', right: '40px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>আপনার দোকান</div>
      <div ref={vanRef} style={{ position: 'absolute', bottom: '108px', left: '-150px', fontSize: '50px', transition: 'none' }}>🚚</div>
    </div>
  );
}
