'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function DeliveryScene() {
  const containerRef = useRef(null);
  const truckRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      const width = containerRef.current.offsetWidth;

      const tl = gsap.timeline({ repeat: -1 });

      // 🚚 Truck enters
      tl.fromTo(truckRef.current,
        { x: -200 },
        {
          x: width / 2 - 60,
          duration: 3,
          ease: "power2.out"
        }
      )

      // ⏸️ ছোট pause
      .to({}, { duration: 0.5 })

      // 📦 Box drop (delivery)
      .fromTo(boxRef.current,
        { y: -40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "bounce.out"
        }
      )

      // ⏸️ দেখানোর জন্য pause
      .to({}, { duration: 1 })

      // 🚚 Truck চলে যায়
      .to(truckRef.current, {
        x: width + 200,
        duration: 3,
        ease: "power2.in"
      })

      // 🔄 Reset box
      .set(boxRef.current, { opacity: 0, y: -40 })

      // 🔄 Reset truck
      .set(truckRef.current, { x: -200 });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        height: '300px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)'
      }}
    >

      {/* TITLE */}
      <div style={{
        position: 'absolute',
        top: '20px',
        width: '100%',
        textAlign: 'center',
        color: '#fff',
        fontWeight: '700'
      }}>
        সরাসরি কারখানা থেকে আপনার দোকানে ডেলিভারি
      </div>

      {/* ROAD */}
      <div style={{
        position: 'absolute',
        bottom: '70px',
        left: 0,
        right: 0,
        height: '60px',
        background: '#1e293b'
      }} />

      {/* DASH LINE */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: 0,
        right: 0,
        height: '4px',
        background: 'repeating-linear-gradient(to right, #fff 0 40px, transparent 40px 80px)',
        opacity: 0.2
      }} />

      {/* SHOP */}
      <div style={{
        position: 'absolute',
        bottom: '130px',
        right: '40px',
        color: '#94a3b8'
      }}>
        দোকান
      </div>

      {/* BOX */}
      <img
        ref={boxRef}
        src="/box.png"
        alt="box"
        style={{
          position: 'absolute',
          bottom: '110px',
          right: '100px',
          width: '40px',
          opacity: 0
        }}
      />

      {/* TRUCK */}
      <img
        ref={truckRef}
        src="/truck.png"
        alt="truck"
        style={{
          position: 'absolute',
          bottom: '95px',
          width: '110px',
          willChange: 'transform',
          filter: 'drop-shadow(0px 6px 6px rgba(0,0,0,0.4))'
        }}
      />

    </section>
  );
}
