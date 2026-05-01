'use client';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();

  return (
    <div style={{
      background: 'linear-gradient(140deg, #071828 0%, #0f2442 45%, #1a3a5c 100%)',
      color: '#fff',
      padding: '60px 16px 40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    }}>

      <div style={{ maxWidth: '520px' }}>

        <h1 style={{
          fontSize: '26px',
          lineHeight: '1.35',
          marginBottom: '10px',
          fontWeight: '900',
        }}>
          পাইকারি <span style={{ color: '#e8a020' }}>সহজ</span> হোক<br />
          আপনার জন্য
        </h1>

        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: '1.6',
          marginBottom: '22px',
        }}>
          সরাসরি পাইকার থেকে আপনার দোকানে
        </p>

        <button
          onClick={() => router.push('/register')}
          style={{
            width: '100%',
            background: '#e8a020',
            color: '#0f2442',
            border: 'none',
            padding: '14px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          দোকান নিবন্ধন করুন
        </button>

      </div>

    </div>
  );
}
