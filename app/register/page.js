'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', shop_name: '', phone: '', area: '', password: '', confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.name) return setError('নাম দিন');
    if (form.phone.length !== 11) return setError('সঠিক ফোন নম্বর দিন');
    if (form.password.length < 6) return setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর');
    if (form.password !== form.confirm) return setError('পাসওয়ার্ড মিলছে না');

    setLoading(true);
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
        if (err.code === '23505') setError('এই ফোন নম্বর আগে ব্যবহার হয়েছে');
        else setError('সমস্যা হয়েছে, আবার চেষ্টা করুন');
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-page {
          min-height: 100vh;
          background: #f0f4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Hind Siliguri', sans-serif;
        }

        .reg-card {
          background: #fff;
          border-radius: 24px;
          padding: 36px 32px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 60px rgba(14, 36, 66, 0.12);
        }

        .reg-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .reg-logo-icon {
          width: 42px; height: 42px;
          background: #e8a020;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }

        .reg-logo-text {
          font-size: 20px;
          font-weight: 700;
          color: #0f2442;
        }

        .reg-logo-text span { color: #e8a020; }

        .reg-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f2442;
          margin-bottom: 4px;
        }

        .reg-sub {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 24px;
        }

        .field-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .field-full {
          margin-bottom: 12px;
        }

        label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #0f2442;
          margin-bottom: 5px;
          letter-spacing: 0.3px;
        }

        input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'Hind Siliguri', sans-serif;
          color: #0f2442;
          background: #f8fafc;
          transition: border-color 0.2s, background 0.2s;
          outline: none;
        }

        input:focus {
          border-color: #e8a020;
          background: #fff;
        }

        input::placeholder { color: #94a3b8; }

        .error-msg {
          background: #fff1f2;
          color: #e11d48;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 14px;
          border-left: 3px solid #e11d48;
        }

        .submit-btn {
          width: 100%;
          padding: 13px;
          background: #0f2442;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Hind Siliguri', sans-serif;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s, transform 0.1s;
        }

        .submit-btn:hover { background: #1a3a5c; }
        .submit-btn:active { transform: scale(0.99); }
        .submit-btn:disabled { background: #94a3b8; cursor: not-allowed; }

        .login-link {
          text-align: center;
          margin-top: 16px;
          font-size: 13px;
          color: #64748b;
        }

        .login-link a {
          color: #e8a020;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .reg-card { padding: 28px 20px; }
          .field-group { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="reg-page">
        <div className="reg-card">

          <div className="reg-logo">
            <div className="reg-logo-icon">🚚</div>
            <div className="reg-logo-text">পাইকারি<span>বাজার</span></div>
          </div>

          <div className="reg-title">নতুন অ্যাকাউন্ট</div>
          <div className="reg-sub">আপনার দোকানের তথ্য দিয়ে নিবন্ধন করুন</div>

          {error && <div className="error-msg">⚠️ {error}</div>}

          <div className="field-group">
            <div>
              <label>আপনার নাম *</label>
              <input placeholder="রহিম মিয়া"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label>দোকানের নাম</label>
              <input placeholder="রহিম স্টোর"
                value={form.shop_name}
                onChange={e => setForm({ ...form, shop_name: e.target.value })}
              />
            </div>
          </div>

          <div className="field-group">
            <div>
              <label>ফোন নম্বর *</label>
              <input placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label>এলাকা</label>
              <input placeholder="ঢাকা"
                value={form.area}
                onChange={e => setForm({ ...form, area: e.target.value })}
              />
            </div>
          </div>

          <div className="field-group">
            <div>
              <label>পাসওয়ার্ড *</label>
              <input type="password" placeholder="কমপক্ষে ৬ অক্ষর"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label>পাসওয়ার্ড নিশ্চিত *</label>
              <input type="password" placeholder="আবার লিখুন"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
              />
            </div>
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ অপেক্ষা করুন...' : '✅ নিবন্ধন সম্পন্ন করুন'}
          </button>

          <div className="login-link">
            আগে থেকে অ্যাকাউন্ট আছে? <a onClick={() => router.push('/login')}>লগইন করুন</a>
          </div>

        </div>
      </div>
    </>
  );
}
