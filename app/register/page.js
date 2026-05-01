'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    shop_name: '',
    phone: '',
    area: '',
    password: '',
    confirm: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const next = () => {
    setError('');

    if (step === 1 && !form.name) return setError('নাম দিন');
    if (step === 2 && form.phone.length !== 11) return setError('সঠিক ফোন দিন');
    if (step === 3) {
      if (form.password.length < 6) return setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর');
      if (form.password !== form.confirm) return setError('পাসওয়ার্ড মিলছে না');
    }

    setStep(step + 1);
  };

  const prev = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: form.name,
          shop_name: form.shop_name,
          phone: form.phone,
          area: form.area,
          password: form.password,
          role: 'user',
          status: 'active',
          wallet: 0
        })
      });

      if (res.status === 201) {
        router.push('/login');
      } else {
        const err = await res.json();
        if (err.code === '23505') setError('এই ফোন আগে ব্যবহার হয়েছে');
        else setError('সমস্যা হয়েছে');
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা');
    }

    setLoading(false);
  };

  const s = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f8fafc',
      padding: '16px'
    },
    box: {
      width: '100%',
      maxWidth: '420px',
      background: '#fff',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '12px'
    },
    btn: {
      width: '100%',
      padding: '12px',
      background: '#0f2442',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '700'
    }
  };

  return (
    <div style={s.page}>
      <div style={s.box}>

        {/* Progress */}
        <div style={{
          height: '6px',
          background: '#e5e7eb',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: `${(step / 3) * 100}%`,
            height: '100%',
            background: '#e8a020',
            borderRadius: '10px'
          }} />
        </div>

        <h2 style={{ marginBottom: '10px' }}>নিবন্ধন</h2>

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input style={s.input} placeholder="আপনার নাম"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input style={s.input} placeholder="দোকানের নাম"
              value={form.shop_name}
              onChange={e => setForm({ ...form, shop_name: e.target.value })}
            />
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input style={s.input} placeholder="ফোন নম্বর"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <input style={s.input} placeholder="এলাকা"
              value={form.area}
              onChange={e => setForm({ ...form, area: e.target.value })}
            />
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input type="password" style={s.input} placeholder="পাসওয়ার্ড"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <input type="password" style={s.input} placeholder="পাসওয়ার্ড নিশ্চিত"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
            />
          </>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {step > 1 && (
            <button style={{ ...s.btn, background: '#94a3b8' }} onClick={prev}>
              পিছনে
            </button>
          )}

          {step < 3 ? (
            <button style={s.btn} onClick={next}>
              পরবর্তী
            </button>
          ) : (
            <button style={s.btn} onClick={handleSubmit}>
              {loading ? 'অপেক্ষা করুন...' : 'সম্পন্ন করুন'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
