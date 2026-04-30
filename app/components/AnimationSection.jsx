'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AnimationSection() {
  const containerRef = useRef(null);
  const vanRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // TITLE ANIMATION
      gsap.from(".title", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      // TRUCK LOOP (SMOOTH)
      gsap.fromTo(
        vanRef.current,
        { x: -200 },
        {
          x: window.innerWidth + 200,
          duration: 6,
          ease: "none",
          repeat: -1
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        background: '#0a1628',
        padding: '40px 0 0',
        position: 'relative',
        height: '260px',
        overflow: 'hidden'
      }}
    >
      
      {/* TITLE */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div
          className="title"
          style={{ fontSize: '22px', color: '#fff', fontWeight: '700' }}
        >
          সরাসরি কারখানা থেকে আপনার দোকানে
        </div>
      </div>

      {/* ROAD */}
      <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, height: '50px', background: '#1a2540' }}></div>
      <div style={{ position: 'absolute', bottom: '82px', left: 0, right: 0, height: '4px', background: '#e8a020', opacity: 0.3 }}></div>

      {[0,1,2,3,4,5,6,7].map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: '82px',
            left: `${i * 160 + 60}px`,
            width: '80px',
            height: '4px',
            background: '#faf7f2',
            opacity: 0.2
          }}
        ></div>
      ))}

      {/* FACTORY */}
      <div style={{ position: 'absolute', bottom: '108px', left: '40px', fontSize: '60px' }}>
        🏭
      </div>
      <div style={{ position: 'absolute', bottom: '60px', left: '40px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
        কারখানা
      </div>

      {/* SHOP */}
      <div style={{ position: 'absolute', bottom: '108px', right: '40px', fontSize: '60px' }}>
        🏪
      </div>
      <div style={{ position: 'absolute', bottom: '60px', right: '40px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
        আপনার দোকান
      </div>

      {/* TRUCK */}
      <div
        ref={vanRef}
        style={{
          position: 'absolute',
          bottom: '108px',
          fontSize: '50px',
          willChange: 'transform'
        }}
      >
        🚚
      </div>

    </div>
  );
}
