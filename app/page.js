'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.password) {
      setError('সব তথ্য পূরণ করুন');
      return;
    }
    if (form.phone.length !== 11) {
      setError('সঠিক ফোন নম্বর দিন');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: '#faf7f2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Hind Siliguri, sans-serif',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(15,36,66,0.10)',
      }}>
        <h1 style={{
          color: '#0f2442',
          fontSize: '26px',
          fontWeight: '700',
          marginBottom: '8px',
          textAlign: 'center',
        }}>নতুন অ্যাকাউন্ট</h1>
        <p style={{
          color: '#888',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '28px',
        }}>পাইকারি বাজারে যোগ দিন</p>

        {error && (
          <div style={{
            background: '#fff0f0',
            color: '#cc0000',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#0f2442', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
              পূর্ণ নাম
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="আপনার নাম লিখুন"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e0d8cc',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Hind Siliguri, sans-serif',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#0f2442', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
              ফোন নম্বর
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              maxLength={11}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e0d8cc',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Hind Siliguri, sans-serif',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#0f2442', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
              ঠিকানা
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="আপনার ঠিকানা লিখুন"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e0d8cc',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Hind Siliguri, sans-serif',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#0f2442', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
              পাসওয়ার্ড
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="পাসওয়ার্ড দিন"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e0d8cc',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Hind Siliguri, sans-serif',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#aaa' : '#e8a020',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Hind Siliguri, sans-serif',
            }}
          >
            {loading ? 'অপেক্ষা করুন...' : 'রেজিস্ট্রেশন করুন'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888' }}>
          আগেই অ্যাকাউন্ট আছে?{' '}
          <a href="/login" style={{ color: '#0f2442', fontWeight: '600', textDecoration: 'none' }}>
            লগইন করুন
          </a>
        </p>
      </div>
    </main>
  );
}
