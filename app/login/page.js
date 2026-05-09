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
  const [titleText, setTitleText] = useState('');
  const [showDot, setShowDot] = useState(false);
  const [shakePass, setShakePass] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const text = 'Sareng';
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setTitleText(prev => prev + text[i]);
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setShowDot(true);
        }
      }, 80);
      return () => clearInterval(interval);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!form.phone || !form.password) {
      setShakePass(false);
      setTimeout(() => setShakePass(true), 10);
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
        setShakePass(false);
        setTimeout(() => setShakePass(true), 10);
        setError('ফোন নম্বর বা পাসওয়ার্ড ভুল');
        setLoading(false);
        return;
      }
      const user = data[0];
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/products');
      }
    } catch {
      setError('সমস্যা হয়েছে, আবার চেষ্টা করুন');
      setLoading(false);
    }
  };

  const shimmerStyle = {
    background: 'linear-gradient(90deg, #fff 0%, #fff 40%, #e8a020 50%, #fff 60%, #fff 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'shimmer 2.5s linear infinite',
    display: 'inline-block',
  };

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeup { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .red-dot { display:inline-block; width:7px; height:7px; background:#ff3b3b; border-radius:50%; margin-left:3px; vertical-align:middle; margin-bottom:3px; animation:blink 1.2s ease-in-out infinite; }
        .field-wrap:focus-within { border-color:#e8a020 !important; box-shadow:0 0 0 3px rgba(232,160,32,0.12) !important; }
        .fade1{opacity:0;animation:fadeup 0.5s ease forwards 0.1s}
        .fade2{opacity:0;animation:fadeup 0.5s ease forwards 0.2s}
        .fade3{opacity:0;animation:fadeup 0.5s ease forwards 0.3s}
        .fade4{opacity:0;animation:fadeup 0.5s ease forwards 0.4s}
        .fade5{opacity:0;animation:fadeup 0.5s ease forwards 0.5s}
        .fade6{opacity:0;animation:fadeup 0.5s ease forwards 0.6s}
        .shake-anim { animation:shake 0.4s ease; }
        .spinner { width:18px;height:18px;border:2px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto; }
        input { -webkit-text-fill-color: #fff !important; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Hind Siliguri', sans-serif",
      }}>

        {/* MOBILE TOP BAR */}
        {isMobile && (
          <div style={{
            background: '#000',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
              <span style={{ fontSize: '22px', fontWeight: '800', ...shimmerStyle }}>Sareng</span>
              <span className="red-dot" />
            </div>
            <span
              onClick={() => router.push('/')}
              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
            >
              ← হোমে যান
            </span>
          </div>
        )}

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
        }}>

          {/* LEFT — desktop only */}
          {!isMobile && (
            <div style={{
              flex: '0 0 260px',
              background: '#000',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '48px 36px',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div onClick={() => router.push('/')} style={{ cursor: 'pointer', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', ...shimmerStyle }}>Sareng</span>
                <span className="red-dot" />
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.7' }}>
                সরাসরি সাপ্লায়ার থেকে<br />আপনার দোকানে।
              </p>
            </div>
          )}

          {/* RIGHT — form */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'center',
            padding: isMobile ? '32px 24px' : '48px',
          }}>
            <div style={{ width: '100%', maxWidth: '320px' }}>

              {/* Back — desktop only */}
              {!isMobile && (
                <div
                  className="fade1"
                  onClick={() => router.push('/')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.35)', fontSize: '12px', cursor: 'pointer', marginBottom: '32px' }}
                >
                  ← হোমে যান
                </div>
              )}

              {/* Title */}
              <div className="fade2" style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', marginBottom: '28px' }}>
                <span style={{ fontSize: '26px', fontWeight: '800', ...shimmerStyle }}>{titleText}</span>
                {showDot && <span className="red-dot" />}
              </div>

              {/* Phone */}
              <div className="fade3" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  ফোন নম্বর
                </label>
                <div className="field-wrap" style={{ display: 'flex', alignItems: 'center', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 12px', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                  <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)', marginRight: '8px' }}>📞</span>
                  <input
                    type="tel"
                    placeholder="01700000000"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '15px', padding: '12px 0', width: '100%', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="fade4" style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  পাসওয়ার্ড
                </label>
                <div
                  className={`field-wrap${shakePass ? ' shake-anim' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 12px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                >
                  <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)', marginRight: '8px' }}>🔒</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '15px', padding: '12px 0', width: '100%', fontFamily: 'inherit' }}
                  />
                </div>
                {error && (
                  <p style={{ fontSize: '12px', color: '#ff5555', marginTop: '6px', paddingLeft: '4px' }}>{error}</p>
                )}
              </div>

              {/* Button */}
              <div className="fade5">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ width: '100%', background: '#e8a020', color: '#000', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <div className="spinner" /> : 'লগইন করুন'}
                </button>
              </div>

              {/* Register */}
              <p className="fade6" style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
                অ্যাকাউন্ট নেই?{' '}
                <span onClick={() => router.push('/register')} style={{ color: '#e8a020', fontWeight: '700', cursor: 'pointer' }}>
                  নিবন্ধন করুন
                </span>
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
