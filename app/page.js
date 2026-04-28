'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <main style={{ minHeight: '100vh', background: '#0f2442', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ textAlign: 'center', color: '#faf7f2' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#e8a020', marginBottom: '12px' }}>পাইকারি বাজার</h1>
        <p style={{ fontSize: '18px', color: '#faf7f2', marginBottom: '48px', opacity: 0.8 }}>বাংলাদেশের সেরা পাইকারি মার্কেটপ্লেস</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/login')}
            style={{ padding: '14px 40px', background: '#e8a020', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>
            লগইন করুন
          </button>
          <button
            onClick={() => router.push('/register')}
            style={{ padding: '14px 40px', background: 'transparent', color: '#e8a020', border: '2px solid #e8a020', borderRadius: '8px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>
            রেজিস্ট্রেশন করুন
          </button>
        </div>
      </div>
    </main>
  );
}
