'use client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  return (
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
  );
}
