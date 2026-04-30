'use client';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();

  return (
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
          <button onClick={() => router.push('/register')} style={{ background: '#e8a020', color: '#0f2442', border: 'none', padding: '13px 30px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(232,160,32,0.4)' }}>বিনামূল্যে শুরু করুন</button>
          <button onClick={() => router.push('/login')} style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', padding: '13px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>লগইন করুন</button>
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
  );
}
