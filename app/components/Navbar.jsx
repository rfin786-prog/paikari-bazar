'use client';

import Image from ‘next/image’;
import { useRouter } from ‘next/navigation’;
import { useEffect, useState } from ‘react’;

export default function Navbar() {
const router = useRouter();
const [user, setUser] = useState(null);

useEffect(() => {
const saved = localStorage.getItem(‘user’);
if (saved) setUser(JSON.parse(saved));
}, []);

return (
<>
<style>{`
@keyframes blink {
0%, 100% { opacity: 1; }
50% { opacity: 0; }
}

```
    .red-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #ff3b3b;
      flex-shrink: 0;
      margin-bottom: 3px;
      animation: blink 1.2s ease-in-out infinite;
    }

    .nav-icon-btn {
      background: none !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      -webkit-appearance: none !important;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .nav-icon-btn:focus,
    .nav-icon-btn:active,
    .nav-icon-btn:hover {
      background: none !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }
  `}</style>

  <nav style={{
    background: '#000',
    padding: '12px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  }}>

    {/* Logo */}
    <div
      style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', cursor: 'pointer' }}
      onClick={() => router.push('/')}
    >
      <Image
        src="/logo.png"
        alt="আড়ৎ"
        width={80}
        height={40}
        style={{ objectFit: 'contain' }}
      />
      <span className="red-dot" />
    </div>

    {/* Right */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <button className="nav-icon-btn" onClick={() => router.push('/checkout')}>
        <CartIcon />
        <CartCount />
      </button>

      {user ? (
        <button className="nav-icon-btn" onClick={() => router.push('/dashboard')}>
          <UserIcon color="#e8a020" />
        </button>
      ) : (
        <button className="nav-icon-btn" onClick={() => router.push('/login')}>
          <UserIcon color="#e8a020" />
        </button>
      )}
    </div>

  </nav>
</>
```

);
}

function CartIcon() {
return (
<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
<line x1="3" y1="6" x2="21" y2="6"/>
<path d="M16 10a4 4 0 01-8 0"/>
</svg>
);
}

function UserIcon({ color }) {
return (
<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
<circle cx="12" cy="7" r="4"/>
</svg>
);
}

function CartCount() {
const [count, setCount] = useState(0);

useEffect(() => {
const updateCount = () => {
const cart = JSON.parse(localStorage.getItem(‘cart’) || ‘[]’);
setCount(cart.length);
};

```
updateCount();

// cart update হলে reactive ভাবে badge update হবে
window.addEventListener('cartUpdated', updateCount);
return () => window.removeEventListener('cartUpdated', updateCount);
```

}, []);

if (count === 0) return null;

return (
<span style={{
position: ‘absolute’, top: ‘-6px’, right: ‘-6px’,
background: ‘#e8a020’, color: ‘#000’,
borderRadius: ‘50%’, width: ‘18px’, height: ‘18px’,
fontSize: ‘11px’, fontWeight: ‘700’,
display: ‘flex’, alignItems: ‘center’, justifyContent: ‘center’,
}}>{count}</span>
);
}
