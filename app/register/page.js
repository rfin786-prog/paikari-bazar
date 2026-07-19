'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function RegisterPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', password: '', confirm: ''
  });
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
    if (!form.name) return setError('Please enter your name');
    if (form.phone.length !== 11) return setError('Please enter a valid mobile number');
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email');
    if (!form.address) return setError('Please enter your address');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          address: form.address,
          password: form.password,
          role: 'user',
          status: 'active',
          wallet: 0,
        }),
      });

      if (res.status === 201) {
        router.push('/login');
      } else {
        const err = await res.json();
        if (err.code === '23505') setError('This mobile number is already registered');
        else setError('Something went wrong, please try again');
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  // ── STYLES (matched to /login) ──
  const shimmerStyle = {
    background: 'linear-gradient(90deg,#1a1a1a 0%,#1a1a1a 40%,#e8a020 50%,#1a1a1a 60%,#1a1a1a 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'shimmer 2.5s linear infinite',
    display: 'inline-block',
  };

  const fieldWrapStyle = {
    display: 'flex',
    alignItems: 'center',
    background: '#f3f2ef',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '10px',
    padding: '0 12px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputStyle = {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#1a1a1a',
    fontSize: '15px',
    padding: '12px 0',
    width: '100%',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    color: 'rgba(0,0,0,0.5)',
    marginBottom: '6px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };

  const dividerStyle = {
    fontSize: '10px',
    fontWeight: '700',
    color: 'rgba(0,0,0,0.3)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '20px 0 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  // ── LEFT PANEL (matches /login) ──
  const LeftPanel = () => (
    <div style={{ flex: '0 0 260px', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 36px', borderRight: '1px solid rgba(0,0,0,0.08)' }}>
      <div onClick={() => router.push('/')} style={{ cursor: 'pointer', marginBottom: '12px' }}>
        <span style={{ fontSize: '28px', fontWeight: '800', ...shimmerStyle }}>Rupanjel</span>
        <span className="red-dot" />
      </div>
      <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)', lineHeight: '1.7' }}>
        Straight from trusted suppliers<br />to your shop.
      </p>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeup { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .red-dot { display:inline-block; width:7px; height:7px; background:#ff3b3b; border-radius:50%; margin-left:3px; vertical-align:middle; margin-bottom:3px; animation:blink 1.2s ease-in-out infinite; }
        .fw:focus-within { border-color:#e8a020 !important; box-shadow:0 0 0 3px rgba(232,160,32,0.12) !important; }
        .fade1{opacity:0;animation:fadeup 0.5s ease forwards 0.1s}
        .fade2{opacity:0;animation:fadeup 0.5s ease forwards 0.15s}
        .fade3{opacity:0;animation:fadeup 0.5s ease forwards 0.2s}
        .fade4{opacity:0;animation:fadeup 0.5s ease forwards 0.25s}
        .fade5{opacity:0;animation:fadeup 0.5s ease forwards 0.3s}
        .fade6{opacity:0;animation:fadeup 0.5s ease forwards 0.35s}
        .fade7{opacity:0;animation:fadeup 0.5s ease forwards 0.4s}
        .spinner{width:18px;height:18px;border:2px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto;}
        .reg-textarea {
          width:100%; background:#f3f2ef; border:1px solid rgba(0,0,0,0.1);
          border-radius:10px; color:#1a1a1a; font-size:15px; padding:12px 14px;
          font-family:inherit; outline:none; resize:none; height:80px; line-height:1.6;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .reg-textarea:focus { border-color:#e8a020; box-shadow:0 0 0 3px rgba(232,160,32,0.12); }
        .reg-textarea::placeholder { color:rgba(0,0,0,0.3); }
        .two-col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media(max-width:480px) { .two-col { grid-template-columns:1fr; } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

        <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>

          {!isMobile && <LeftPanel />}

          {/* FORM */}
          <div style={{ flex: 1, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? '32px 24px' : '48px', overflowY: 'auto' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>

              {!isMobile && (
                <div className="fade1" onClick={() => router.push('/')} style={{ color: 'rgba(0,0,0,0.45)', fontSize: '12px', cursor: 'pointer', marginBottom: '32px' }}>
                  ← Back to home
                </div>
              )}

              <div className="fade1" style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a', marginBottom: '4px' }}>Create Account</div>
                <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)' }}>Fill in your details to register</div>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Personal Info */}
              <div style={dividerStyle}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                Personal Info
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
              </div>

              <div className="fade2" style={{ marginBottom: '12px' }}>
                <div style={labelStyle}>Full Name *</div>
                <div className="fw" style={fieldWrapStyle}>
                  <input placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div className="fade3" style={{ marginBottom: '12px' }}>
                <div style={labelStyle}>Mobile Number *</div>
                <div className="fw" style={fieldWrapStyle}>
                  <span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.4)', marginRight: '8px' }}>📞</span>
                  <input placeholder="01XXXXXXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div className="fade4" style={{ marginBottom: '12px' }}>
                <div style={labelStyle}>Email (optional)</div>
                <div className="fw" style={fieldWrapStyle}>
                  <span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.4)', marginRight: '8px' }}>✉️</span>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* Address */}
              <div style={dividerStyle}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                Address
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
              </div>

              <div className="fade5" style={{ marginBottom: '12px' }}>
                <div style={labelStyle}>Delivery Address *</div>
                <textarea className="reg-textarea" placeholder="House / Road / Area / City" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>

              {/* Password */}
              <div style={dividerStyle}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                Password
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
              </div>

              <div className="fade6 two-col" style={{ marginBottom: '20px' }}>
                <div>
                  <div style={labelStyle}>Password *</div>
                  <div className="fw" style={fieldWrapStyle}>
                    <span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.4)', marginRight: '8px' }}>🔒</span>
                    <input type="password" placeholder="At least 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Confirm Password *</div>
                  <div className="fw" style={fieldWrapStyle}>
                    <span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.4)', marginRight: '8px' }}>🔒</span>
                    <input type="password" placeholder="Re-enter password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="fade7">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ width: '100%', background: '#e8a020', color: '#000', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <div className="spinner" /> : '✅ Create Account'}
                </button>
              </div>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(0,0,0,0.45)' }}>
                Already have an account?{' '}
                <span onClick={() => router.push('/login')} style={{ color: '#e8a020', fontWeight: '700', cursor: 'pointer' }}>
                  Sign In
                </span>
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
