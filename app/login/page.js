'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ── SMS পাঠাও (API route দিয়ে) ──
async function sendOTPSms(phone, otp) {
  const number = '88' + phone; // 01700000000 → 8801700000000
  const message = `আড়ৎ: আপনার OTP হলো ${otp}। এটি ৫ মিনিট বৈধ। কাউকে শেয়ার করবেন না।`;
  const res = await fetch(`/api/send-sms?number=${number}&message=${encodeURIComponent(message)}`);
  const text = await res.text();
  const code = parseInt(text.trim());
  if (code === 202) return { success: true };
  const errors = {
    1001: 'ফোন নম্বর সঠিক নয়',
    1002: 'Sender ID সমস্যা',
    1006: 'SMS ব্যালেন্স শেষ',
    1007: 'ব্যালেন্স অপর্যাপ্ত',
    1011: 'API ব্যবহারকারী পাওয়া যায়নি',
    1031: 'অ্যাকাউন্ট ভেরিফাই হয়নি',
    1032: 'IP whitelist করা নেই',
  };
  return { success: false, msg: errors[code] || `SMS পাঠানো যায়নি (${code})` };
}

// ── OTP Supabase-এ save করো ──
async function saveOTP(phone, otp) {
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // ৫ মিনিট
  // পুরনো OTP delete
  await fetch(`${SUPABASE_URL}/rest/v1/otp_requests?phone=eq.${phone}`, {
    method: 'DELETE',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  // নতুন OTP insert
  await fetch(`${SUPABASE_URL}/rest/v1/otp_requests`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ phone, otp, expires_at, used: false }),
  });
}

// ── OTP verify করো ──
async function verifyOTP(phone, otp) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/otp_requests?phone=eq.${phone}&otp=eq.${otp}&used=eq.false`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await res.json();
  if (!data.length) return { valid: false, msg: 'OTP ভুল' };
  const record = data[0];
  if (new Date(record.expires_at) < new Date()) return { valid: false, msg: 'OTP মেয়াদ শেষ' };
  // mark as used
  await fetch(`${SUPABASE_URL}/rest/v1/otp_requests?id=eq.${record.id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ used: true }),
  });
  return { valid: true };
}

// ── পাসওয়ার্ড update করো ──
async function updatePassword(phone, newPass) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?phone=eq.${phone}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ password: newPass }),
  });
  return res.ok;
}

export default function LoginPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // view: 'login' | 'forgot_phone' | 'forgot_otp' | 'forgot_reset'
  const [view, setView] = useState('login');

  // login state
  const [form, setForm]         = useState({ phone: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [shakePass, setShakePass] = useState(false);

  // forgot state
  const [fpPhone, setFpPhone]     = useState('');
  const [fpOtp, setFpOtp]         = useState(['', '', '', '', '', '']);
  const [fpNewPass, setFpNewPass] = useState('');
  const [fpConfPass, setFpConfPass] = useState('');
  const [fpError, setFpError]     = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  // ── LOGIN ──
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
      if (!data.length) {
        setShakePass(false);
        setTimeout(() => setShakePass(true), 10);
        setError('ফোন নম্বর বা পাসওয়ার্ড ভুল');
        setLoading(false);
        return;
      }
      const user = data[0];
      localStorage.setItem('user', JSON.stringify(user));
      router.push(user.role === 'admin' ? '/admin' : '/products');
    } catch {
      setError('সমস্যা হয়েছে, আবার চেষ্টা করুন');
      setLoading(false);
    }
  };

  // ── FORGOT: ফোন submit ──
  const handleSendOtp = async () => {
    setFpError('');
    if (!/^01[3-9]\d{8}$/.test(fpPhone)) {
      setFpError('সঠিক ফোন নম্বর দিন (01XXXXXXXXX)');
      return;
    }
    setFpLoading(true);
    try {
      // ফোন নম্বর আছে কিনা check
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/users?phone=eq.${fpPhone}&status=eq.active`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      if (!data.length) {
        setFpError('এই ফোন নম্বরে কোনো অ্যাকাউন্ট নেই');
        setFpLoading(false);
        return;
      }
      // OTP generate
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await saveOTP(fpPhone, otp);
      const smsRes = await sendOTPSms(fpPhone, otp);
      if (!smsRes.success) {
        setFpError('SMS পাঠানো যায়নি: ' + smsRes.msg);
        setFpLoading(false);
        return;
      }
      setView('forgot_otp');
      setResendTimer(60);
      setFpOtp(['', '', '', '', '', '']);
    } catch {
      setFpError('সমস্যা হয়েছে, আবার চেষ্টা করুন');
    }
    setFpLoading(false);
  };

  // ── FORGOT: OTP input handle ──
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...fpOtp];
    next[i] = val;
    setFpOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !fpOtp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setFpOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // ── FORGOT: OTP verify ──
  const handleVerifyOtp = async () => {
    setFpError('');
    const otp = fpOtp.join('');
    if (otp.length < 6) { setFpError('৬ সংখ্যার OTP দিন'); return; }
    setFpLoading(true);
    try {
      const result = await verifyOTP(fpPhone, otp);
      if (!result.valid) { setFpError(result.msg); setFpLoading(false); return; }
      setView('forgot_reset');
    } catch {
      setFpError('সমস্যা হয়েছে, আবার চেষ্টা করুন');
    }
    setFpLoading(false);
  };

  // ── FORGOT: Resend OTP ──
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setFpError('');
    setFpLoading(true);
    try {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await saveOTP(fpPhone, otp);
      const smsRes = await sendOTPSms(fpPhone, otp);
      if (!smsRes.success) { setFpError('SMS পাঠানো যায়নি: ' + smsRes.msg); setFpLoading(false); return; }
      setResendTimer(60);
      setFpOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch {
      setFpError('সমস্যা হয়েছে');
    }
    setFpLoading(false);
  };

  // ── FORGOT: নতুন পাসওয়ার্ড ──
  const handleResetPass = async () => {
    setFpError('');
    if (fpNewPass.length < 6) { setFpError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে'); return; }
    if (fpNewPass !== fpConfPass) { setFpError('পাসওয়ার্ড দুটো মিলছে না'); return; }
    setFpLoading(true);
    try {
      const ok = await updatePassword(fpPhone, fpNewPass);
      if (!ok) { setFpError('পাসওয়ার্ড আপডেট হয়নি, আবার চেষ্টা করুন'); setFpLoading(false); return; }
      // reset করে login-এ ফিরে যাও
      setView('login');
      setFpPhone(''); setFpOtp(['','','','','','']); setFpNewPass(''); setFpConfPass('');
      setForm({ phone: fpPhone, password: '' });
      // success toast
      setError('');
      setTimeout(() => setError('✅ পাসওয়ার্ড পরিবর্তন সফল! নতুন পাসওয়ার্ড দিয়ে লগইন করুন'), 100);
    } catch {
      setFpError('সমস্যা হয়েছে, আবার চেষ্টা করুন');
    }
    setFpLoading(false);
  };

  // ── STYLES ──
  const shimmerStyle = {
    background: 'linear-gradient(90deg,#fff 0%,#fff 40%,#e8a020 50%,#fff 60%,#fff 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'shimmer 2.5s linear infinite',
    display: 'inline-block',
  };
  const fieldWrapStyle = {
    display: 'flex', alignItems: 'center',
    background: '#161616', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', padding: '0 12px', transition: 'border-color 0.2s,box-shadow 0.2s',
  };
  const inputStyle = {
    background: 'none', border: 'none', outline: 'none',
    color: '#fff', fontSize: '15px', padding: '12px 0',
    width: '100%', fontFamily: 'inherit',
  };
  const labelStyle = {
    display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)',
    marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase',
  };
  const btnGold = {
    width: '100%', background: '#e8a020', color: '#000', border: 'none',
    borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700',
    cursor: fpLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
    opacity: fpLoading ? 0.7 : 1, marginTop: '8px',
  };
  const btnOutline = {
    width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    padding: '12px', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px',
  };

  // ── LEFT PANEL ──
  const LeftPanel = () => (
    <div style={{ flex:'0 0 260px', background:'#000', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 36px', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
      <div onClick={() => router.push('/')} style={{ cursor:'pointer', marginBottom:'12px' }}>
        <span style={{ fontSize:'28px', fontWeight:'800', ...shimmerStyle }}>Rupanjel</span>
        <span className="red-dot" />
      </div>
      <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.4)', lineHeight:'1.7' }}>
        সরাসরি সাপ্লায়ার থেকে<br />আপনার দোকানে।
      </p>
    </div>
  );

  // ── ERROR / SUCCESS message ──
  const ErrorMsg = ({ msg }) => msg ? (
    <p style={{ fontSize:'12px', color: msg.startsWith('✅') ? '#4ade80' : '#ff5555', marginTop:'6px', paddingLeft:'4px' }}>
      {msg}
    </p>
  ) : null;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeup { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .red-dot { display:inline-block;width:7px;height:7px;background:#ff3b3b;border-radius:50%;margin-left:3px;vertical-align:middle;margin-bottom:3px;animation:blink 1.2s ease-in-out infinite; }
        .fw:focus-within { border-color:#e8a020 !important; box-shadow:0 0 0 3px rgba(232,160,32,0.12) !important; }
        .fade1{opacity:0;animation:fadeup 0.5s ease forwards 0.1s}
        .fade2{opacity:0;animation:fadeup 0.5s ease forwards 0.2s}
        .fade3{opacity:0;animation:fadeup 0.5s ease forwards 0.3s}
        .fade4{opacity:0;animation:fadeup 0.5s ease forwards 0.4s}
        .fade5{opacity:0;animation:fadeup 0.5s ease forwards 0.5s}
        .shake-anim{animation:shake 0.4s ease;}
        .spinner{width:18px;height:18px;border:2px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto;}
        .otp-box{width:44px;height:52px;background:#161616;border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:22px;font-weight:700;text-align:center;outline:none;transition:border-color 0.2s,box-shadow 0.2s;font-family:inherit;}
        .otp-box:focus{border-color:#e8a020;box-shadow:0 0 0 3px rgba(232,160,32,0.12);}
        .back-link{font-size:12px;color:rgba(255,255,255,0.35);cursor:pointer;display:inline-flex;align-items:center;gap:4px;margin-bottom:24px;}
        .back-link:hover{color:rgba(255,255,255,0.6);}
      `}</style>

      <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column', fontFamily:"'Hind Siliguri', sans-serif" }}>

        {/* MOBILE TOP BAR */}
        {isMobile && (
          <div style={{ background:'#000', padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div onClick={() => router.push('/')} style={{ cursor:'pointer' }}>
              <span style={{ fontSize:'22px', fontWeight:'800', ...shimmerStyle }}>Rupanjel</span>
              <span className="red-dot" />
            </div>
            <span onClick={() => router.push('/')} style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', cursor:'pointer' }}>← হোমে যান</span>
          </div>
        )}

        <div style={{ flex:1, display:'flex', flexDirection: isMobile ? 'column' : 'row' }}>

          {!isMobile && <LeftPanel />}

          <div style={{ flex:1, display:'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent:'center', padding: isMobile ? '32px 24px' : '48px' }}>
            <div style={{ width:'100%', maxWidth:'320px' }}>

              {/* ════ LOGIN VIEW ════ */}
              {view === 'login' && (
                <>
                  {!isMobile && (
                    <div className="fade1" onClick={() => router.push('/')} style={{ color:'rgba(255,255,255,0.35)', fontSize:'12px', cursor:'pointer', marginBottom:'32px' }}>
                      ← হোমে যান
                    </div>
                  )}

                  <div className="fade2" style={{ marginBottom:'14px' }}>
                    <label style={labelStyle}>ফোন নম্বর</label>
                    <div className="fw" style={fieldWrapStyle}>
                      <span style={{ fontSize:'16px', color:'rgba(255,255,255,0.3)', marginRight:'8px' }}>📞</span>
                      <input type="tel" placeholder="01700000000" value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        style={inputStyle} />
                    </div>
                  </div>

                  <div className="fade3" style={{ marginBottom:'4px' }}>
                    <label style={labelStyle}>পাসওয়ার্ড</label>
                    <div className={`fw${shakePass ? ' shake-anim' : ''}`} style={fieldWrapStyle}>
                      <span style={{ fontSize:'16px', color:'rgba(255,255,255,0.3)', marginRight:'8px' }}>🔒</span>
                      <input type="password" placeholder="••••••••" value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        style={inputStyle} />
                    </div>
                    <ErrorMsg msg={error} />
                  </div>

                  {/* Forgot password link */}
                  <div className="fade3" style={{ textAlign:'right', marginBottom:'4px' }}>
                    <span
                      onClick={() => { setView('forgot_phone'); setFpPhone(form.phone); setFpError(''); }}
                      style={{ fontSize:'12px', color:'rgba(232,160,32,0.7)', cursor:'pointer' }}
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </span>
                  </div>

                  <div className="fade4">
                    <button onClick={handleSubmit} disabled={loading}
                      style={{ width:'100%', background:'#e8a020', color:'#000', border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:'700', cursor: loading ? 'not-allowed' : 'pointer', marginTop:'8px', fontFamily:'inherit', opacity: loading ? 0.7 : 1 }}>
                      {loading ? <div className="spinner" /> : 'লগইন করুন'}
                    </button>
                  </div>

                  <p className="fade5" style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'rgba(255,255,255,0.3)' }}>
                    অ্যাকাউন্ট নেই?{' '}
                    <span onClick={() => router.push('/register')} style={{ color:'#e8a020', fontWeight:'700', cursor:'pointer' }}>
                      নিবন্ধন করুন
                    </span>
                  </p>
                </>
              )}

              {/* ════ FORGOT: ফোন নম্বর ════ */}
              {view === 'forgot_phone' && (
                <>
                  <span className="back-link" onClick={() => setView('login')}>← লগইনে ফিরুন</span>
                  <h2 style={{ color:'#fff', fontSize:'20px', fontWeight:'700', marginBottom:'6px' }}>পাসওয়ার্ড রিসেট</h2>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'13px', marginBottom:'24px', lineHeight:'1.6' }}>
                    আপনার নিবন্ধিত ফোন নম্বরে OTP পাঠানো হবে।
                  </p>

                  <div style={{ marginBottom:'14px' }}>
                    <label style={labelStyle}>ফোন নম্বর</label>
                    <div className="fw" style={fieldWrapStyle}>
                      <span style={{ fontSize:'16px', color:'rgba(255,255,255,0.3)', marginRight:'8px' }}>📞</span>
                      <input type="tel" placeholder="01700000000" value={fpPhone}
                        onChange={e => setFpPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                        style={inputStyle} />
                    </div>
                    <ErrorMsg msg={fpError} />
                  </div>

                  <button onClick={handleSendOtp} disabled={fpLoading} style={btnGold}>
                    {fpLoading ? <div className="spinner" /> : 'OTP পাঠান'}
                  </button>
                </>
              )}

              {/* ════ FORGOT: OTP ════ */}
              {view === 'forgot_otp' && (
                <>
                  <span className="back-link" onClick={() => setView('forgot_phone')}>← ফিরে যান</span>
                  <h2 style={{ color:'#fff', fontSize:'20px', fontWeight:'700', marginBottom:'6px' }}>OTP যাচাই</h2>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'13px', marginBottom:'24px', lineHeight:'1.6' }}>
                    <span style={{ color:'#e8a020' }}>{fpPhone}</span> নম্বরে ৬ সংখ্যার OTP পাঠানো হয়েছে।
                  </p>

                  {/* OTP boxes */}
                  <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginBottom:'16px' }}>
                    {fpOtp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        className="otp-box"
                        type="tel"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                      />
                    ))}
                  </div>

                  <ErrorMsg msg={fpError} />

                  {/* Timer & resend */}
                  <p style={{ textAlign:'center', fontSize:'13px', color:'rgba(255,255,255,0.35)', margin:'8px 0 4px' }}>
                    {resendTimer > 0 ? (
                      <>আবার পাঠান <span style={{ color:'#e8a020', fontWeight:'700' }}>{resendTimer}s</span></>
                    ) : (
                      <span onClick={handleResend} style={{ color:'#e8a020', cursor:'pointer', fontWeight:'600' }}>
                        আবার OTP পাঠান
                      </span>
                    )}
                  </p>

                  <button onClick={handleVerifyOtp} disabled={fpLoading || fpOtp.join('').length < 6} style={{ ...btnGold, opacity: fpLoading || fpOtp.join('').length < 6 ? 0.5 : 1 }}>
                    {fpLoading ? <div className="spinner" /> : 'যাচাই করুন'}
                  </button>
                </>
              )}

              {/* ════ FORGOT: নতুন পাসওয়ার্ড ════ */}
              {view === 'forgot_reset' && (
                <>
                  <span className="back-link" onClick={() => setView('forgot_otp')}>← ফিরে যান</span>
                  <h2 style={{ color:'#fff', fontSize:'20px', fontWeight:'700', marginBottom:'6px' }}>নতুন পাসওয়ার্ড</h2>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'13px', marginBottom:'24px', lineHeight:'1.6' }}>
                    নতুন পাসওয়ার্ড দিন।
                  </p>

                  <div style={{ marginBottom:'14px' }}>
                    <label style={labelStyle}>নতুন পাসওয়ার্ড</label>
                    <div className="fw" style={fieldWrapStyle}>
                      <span style={{ fontSize:'16px', color:'rgba(255,255,255,0.3)', marginRight:'8px' }}>🔒</span>
                      <input type="password" placeholder="কমপক্ষে ৬ অক্ষর" value={fpNewPass}
                        onChange={e => setFpNewPass(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleResetPass()}
                        style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ marginBottom:'8px' }}>
                    <label style={labelStyle}>পাসওয়ার্ড নিশ্চিত করুন</label>
                    <div className="fw" style={fieldWrapStyle}>
                      <span style={{ fontSize:'16px', color:'rgba(255,255,255,0.3)', marginRight:'8px' }}>🔒</span>
                      <input type="password" placeholder="আবার দিন" value={fpConfPass}
                        onChange={e => setFpConfPass(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleResetPass()}
                        style={inputStyle} />
                    </div>
                    <ErrorMsg msg={fpError} />
                  </div>

                  {/* strength indicator */}
                  {fpNewPass && (
                    <div style={{ display:'flex', gap:'4px', marginBottom:'8px' }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex:1, height:'3px', borderRadius:'2px',
                          background: fpNewPass.length >= i * 3
                            ? i <= 1 ? '#ef4444' : i <= 2 ? '#f97316' : i <= 3 ? '#eab308' : '#22c55e'
                            : 'rgba(255,255,255,0.1)'
                        }} />
                      ))}
                    </div>
                  )}

                  <button onClick={handleResetPass} disabled={fpLoading} style={btnGold}>
                    {fpLoading ? <div className="spinner" /> : 'পাসওয়ার্ড পরিবর্তন করুন'}
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
