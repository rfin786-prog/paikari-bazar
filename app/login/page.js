'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function LoginPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!form.phone || !form.password) {
      setError('সব তথ্য পূরণ করুন');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/users?phone=eq.${form.phone}&password=eq.${form.password}&status=eq.active`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      if (data.length === 0) {
        setError('ফোন নম্বর বা পাসওয়ার্ড ভুল');
        setLoading(false);
        return;
      }
      const user = data[0];
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('সমস্যা হয়েছে, আবার চেষ্টা করুন');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      fontFamily: "'Hind Siliguri', sans-serif",
    }}>

      {/* LEFT PANEL */}
      {!isMobile && (
        <div style={{
          flex: '0 0 380px',
          background: 'linear-gradient(160deg, #071828 0%, #0f2442 60%, #1a3a5c 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px',
          color: '#fff',
        }}>
          <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>
            পাইকারি<span style={{ color: '#e8a020' }}>বজার</span>
          </div>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7' }}>
            সরাসরি সাপ্লায়ার থেকে<br />আপনার দোকানে পৌঁছে দিই।
          </p>
        </div>
      )}

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f0',
        padding: isMobile ? '24px 16px' : '48px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: '#ffffff',
          borderRadius: '20px',
          padding: isMobile ? '28px 20px' : '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        }}>

          {/* Mobile logo */}
          {isMobile && (
            <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px', color: '#0f2442' }}>
              পাইকারি<span style={{ color: '#e8a020' }}>বজার</span>
            </div>
          )}

          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '6px',
          }}>
            লগইন করুন
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
            আপনার অ্যাকাউন্টে প্রবেশ করুন
          </p>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              color: '#dc2626',
              padding: '12px 14px',
              borderRadius: '10px',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Phone input */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px',
            }}>
              ফোন নম্বর
            </label>
            <input
              type="tel"
              placeholder="01700000000"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '15px',
                color: '#111827',
                fontFamily: "'Hind Siliguri', sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
              }}
            />
          </div>

          {/* Password input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px',
            }}>
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '15px',
                color: '#111827',
                fontFamily: "'Hind Siliguri', sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
              }}
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#6b7280' : '#0f2442',
              color: '#ffffff',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              fontFamily: "'Hind Siliguri', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'অপেক্ষা করুন...' : 'লগইন করুন'}
          </button>

          {/* Register link */}
          <p style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '14px',
            color: '#6b7280',
          }}>
            অ্যাকাউন্ট নেই?{' '}
            <span
              onClick={() => router.push('/register')}
              style={{ color: '#e8a020', fontWeight: '700', cursor: 'pointer' }}
            >
              নিবন্ধন করুন
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
