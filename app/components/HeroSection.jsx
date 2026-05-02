"use client";

import { useRouter } from ‘next/navigation’;
import { useEffect, useState } from ‘react’;

export default function HeroSection() {
const router = useRouter();
const [scrollY, setScrollY] = useState(0);
const [line1, setLine1] = useState(’’);
const [line2, setLine2] = useState(’’);
const [showSub, setShowSub] = useState(false);
const [showBtn, setShowBtn] = useState(false);

const text1 = ‘আপনার ব্যবসায়িক প্রয়োজনে’;
const text2 = ‘সোর্সিং থেকে ডেলিভারি — সব এক জায়গায়।’;

useEffect(() => {
const style = document.createElement(‘style’);
style.innerHTML = `@keyframes glowMove { 0% { transform: translate(0,0); } 50% { transform: translate(-30px, 30px); } 100% { transform: translate(0,0); } } @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } } @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } } .cursor::after { content: '|'; animation: blink 0.7s infinite; color: #e8a020; } @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`;
document.head.appendChild(style);

```
const handleScroll = () => setScrollY(window.scrollY);
window.addEventListener('scroll', handleScroll);

// Type line 1
let i = 0;
const t1 = setInterval(() => {
  setLine1(text1.slice(0, i + 1));
  i++;
  if (i >= text1.length) {
    clearInterval(t1);
    // Type line 2 after short pause
    setTimeout(() => {
      let j = 0;
      const t2 = setInterval(() => {
        setLine2(text2.slice(0, j + 1));
        j++;
        if (j >= text2.length) {
          clearInterval(t2);
          // Show subtitle and button
          setTimeout(() => setShowSub(true), 300);
          setTimeout(() => setShowBtn(true), 600);
        }
      }, 45);
    }, 300);
  }
}, 60);

return () => {
  window.removeEventListener('scroll', handleScroll);
};
```

}, []);

return (
<div style={{
background: ‘linear-gradient(140deg, #071828 0%, #0f2442 50%, #1a3a5c 100%)’,
color: ‘#fff’,
padding: ‘80px 16px 60px’,
position: ‘relative’,
overflow: ‘hidden’,
transform: `translateY(${scrollY * 0.1}px)`,
opacity: scrollY > 200 ? 0.8 : 1
}}>

```
  {/* glow */}
  <div style={{
    position: 'absolute',
    width: '220px',
    height: '220px',
    background: 'rgba(232,160,32,0.15)',
    borderRadius: '50%',
    top: '-60px',
    right: '-60px',
    filter: 'blur(70px)',
    animation: 'glowMove 7s ease-in-out infinite'
  }} />

  <div style={{ maxWidth: '520px' }}>

    {/* HEADLINE */}
    <h1 style={{
      fontSize: '28px',
      fontWeight: '900',
      lineHeight: '1.5',
      marginBottom: '14px',
      minHeight: '90px',
    }}>
      <span className={line1.length < text1.length ? 'cursor' : ''} style={{ display: 'block', color: '#fff' }}>
        {line1}
      </span>
      <span className={line1.length >= text1.length && line2.length < text2.length ? 'cursor' : ''} style={{ display: 'block', color: '#e8a020' }}>
        {line2}
      </span>
    </h1>

    {/* SUB */}
    {showSub && (
      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.75)',
        marginBottom: '24px',
        animation: 'fadeUp 0.6s ease forwards',
      }}>
        সরাসরি পাইকার থেকে আপনার দোকানে
      </p>
    )}

    {/* BUTTON */}
    {showBtn && (
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
          animation: 'pulse 2.5s infinite',
          cursor: 'pointer',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        দোকান নিবন্ধন করুন
      </button>
    )}

  </div>
</div>
```

);
}
