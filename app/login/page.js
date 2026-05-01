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
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
          }
        }
      );

      const data = await res.json();

      if (data.length === 0) {
        setError('ফন নম্বর বা পাসওয়ার্ড ভুল');
        setLoading(false);
        return;
      }

      const user = data[0];

      // Admin কে user login থেকে ঢুকতে দেওয়া হবে না
      if (user.role === 'admin') {
        setError('Admin লগইনের জন্য Admin Panel ব্যবহার করুন');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');

    } catch {
      setError('সমস্যা হয়েছে, আবার চেষ্টা করুন');
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      fontFamily: 'Hind Siliguri, sans-serif'
    },

    left: {
      display: isMobile ? 'none' : 'flex',
      flex: '0 0 360px',
      background: '#0f2442',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '44px',
      color: '#fff'
    },

    right: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '20px 14px' : '44px',
      background: '#faf7f2'
    },

    box: {
      width: '100%',
      maxWidth: '420px',
      background: '#fff',
      borderRadius: '16px',
      padding: isMobile ? '22px' : '36px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
    },

    inp: {
      width: '100%',
      padding: '12px',
      border: '1.5px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '14px'
    },

    btn: {
      width: '100%',
      background: '#0f2442',
      color: '#fff',
      border: 'none',
      padding: '13px',
      borderRadius: '9px',
      fontWeight: '700',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1
    },

    err: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '12px'
    }
  };

  return (
    <div style={s.page}>

      {/* LEFT (desktop only) */}
      <div style={s.left}>
        <div style={{ fontSize: '24px', fontWeight: '700' }}>
          পাইকারি<span style={{ color: '#e8a020' }}>বজার</span>
        </div>
      </div>

      {/* RIGHT */}
      <div style={s.right}>
        <div style={s.box}>

          <h2 style={{ marginBottom: '10px' }}>লগইন করুন</h2>

          {error && <div style={s.err}>{error}</div>}

          <input
            style={s.inp}
            placeholder="ফোন নমর"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />

          <input
            style={s.inp}
            type="password"
            placeholder="পাসওয়ার্ড"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <button style={s.btn} onClick={handleSubmit} disabled={loading}>
            {loading ? 'অপেক্ষা করুন...' : 'লগইন করুন'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            অ্যাকাউন্ট নেই?{' '}
            <span
              style={{ color: '#e8a020', fontWeight: '700', cursor: 'pointer' }}
              onClick={() => router.push('/register')}
            >
              নিবন্ধন করুন
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
