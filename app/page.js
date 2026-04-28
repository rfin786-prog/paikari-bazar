'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function Home() {
  const router = useRouter();
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
    <main style={{ minHeight: '100vh', background: '#0f2442', fontFamily: 'Hind Siliguri, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ background: '#0f2442', padding: '16px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', background: '#e8a020', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🚚</div>
          <div>
            <div style={{ fontSize: '21px', color: '#fff', fontWeight: '700' }}>পাইকারি<span style={{ color: '#e8a020' }}>বাজার</span></div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px' }}>WHOLESALE B2B</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => router.push('/admin/login')} style={{ background: 'rgba(129,140,248,0.15)', color: '#a5b4fc', border: '1.5px solid rgba(129,140,248,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}>Admin</button>
          <button onClick={() => router.push('/login')} style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.3)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}>লগইন</button>
          <button onClick={() => router.push('/register')} style={{ background: '#e8a020', color: '#0f2442', border: 'none', padding: '9px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit' }}>নিবন্ধন</button>
        </div>
      </nav>

      {/* ANIMATION */}
      <div style={{ background: '#0a1628', padding: '40px 0 0', position: 'relative', height: '260px', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '22px', color: '#fff', fontWeight: '700' }}>🏭 সরাসরি কারখানা থেকে আপনার দোকানে 🏪</div>
        </div>
        {/* Road */}
        <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, height: '50px', background: '#1a2540' }}></div>
        <div style={{ position: 'absolute', bottom: '82px', left: 0, right: 0, height: '4px', background: '#e8a020', opacity: 0.3 }}></div>
        {/* Dashes */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ position: 'absolute', bottom: '82px', left: `${i * 160 + 60}px`, width: '80px', height: '4px', background: '#faf7f2', opacity: 0.2 }}></div>
        ))}
        {/* Factory */}
        <div style={{ position: 'absolute', bottom: '108px', left: '40px', fontSize: '60px' }}>🏭</div>
        <div style={{ position: 'absolute', bottom: '60px', left: '40px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>কারখানা</div>
        {/* Shop */}
        <div style={{ position: 'absolute', bottom: '108px', right: '40px', fontSize: '60px' }}>🏪</div>
        <div style={{ position: 'absolute', bottom: '60px', right: '40px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>আপনার দোকান</div>
        {/* Van */}
        <div ref={vanRef} style={{ position: 'absolute', bottom: '108px', left: '-150px', fontSize: '50px', transition: 'none' }}>🚚</div>
      </div>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(140deg, #0f2442 0%, #1a3a5c 50%, #1e4976 100%)', color: '#fff', padding: '60px 44px 50px', display: 'flex', gap: '50px', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', border: '70px solid rgba(232,160,32,0.07)', borderRadius: '50%', right: '-160px', top: '-160px' }}></div>
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.4)', borderRadius: '30px', padding: '5px 14px', fontSize: '12px', color: '#f5c842', fontWeight: '500', marginBottom: '18px' }}>
            🚀 বাংলাদেশের #১ পাইকারি প্ল্যাটফর্ম
          </div>
          <h1 style={{ fontSize: '44px', lineHeight: '1.2', marginBottom: '16px', fontWeight: '800' }}>
            পাইকারি <span style={{ color: '#e8a020' }}>সহজ</span> হোক<br />আপনার জন্য
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.8', maxWidth: '420px', marginBottom: '32px' }}>
            সরাসরি কারখানা থেকে পণ্য কিনুন। সেরা দামে পাইকারি অর্ডার করুন।
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => router.push('/register')} style={{ background: '#e8a020', color: '#0f2442', border: 'none', padding: '13px 30px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(232,160,32,0.4)' }}>
              বিনামূল্যে শুরু করুন
            </button>
            <button onClick={() => router.push('/login')} style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', padding: '13px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              লগইন করুন
            </button>
          </div>
        </div>
        <div style={{ flex: '0 0 260px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '📦', title: '৫,০০০+ পণ্য', sub: 'বিভিন্ন ক্যাটাগরিতে' },
            { icon: '🏪', title: '১০,০০০+ দোকান', sub: 'সারা বাংলাদেশে' },
            { icon: '🚚', title: 'দ্রুত ডেলিভারি', sub: '২৪-৪৮ ঘণ্টায়' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '13px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '28px' }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>{c.title}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: '#fff', padding: '44px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
        {[
          { icon: '🛒', title: 'সহজ অর্ডার', desc: 'মাত্র কয়েক ক্লিকে হাজার হাজার পণ্য অর্ডার করুন' },
          { icon: '💰', title: 'সেরা দাম', desc: 'সরাসরি কারখানা থেকে কিনুন, মধ্যস্থতাকারী নেই' },
          { icon: '📊', title: 'অর্ডার ট্র্যাকিং', desc: 'রিয়েল-টাইমে আপনার অর্ডারের অবস্থান জানুন' },
        ].map((f, i) => (
          <div key={i} style={{ padding: '26px', border: '1.5px solid #e5e7eb', borderRadius: '14px' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(232,160,32,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>{f.icon}</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: '#0f2442' }}>{f.title}</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.7' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
