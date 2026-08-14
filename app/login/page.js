'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ── ইমেইলে OTP পাঠাও (API route দিয়ে, Resend ব্যবহার করে) ──
async function sendOTPEmail(email, otp) {
  const html = `
    <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;">
      <h2 style="color:#111;margin:0 0 12px;">Rupanjel</h2>
      <p style="color:#333;font-size:14px;">Use the OTP code below to reset your password:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;background:#f3f2ef;padding:14px;text-align:center;border-radius:8px;margin:16px 0;">${otp}</div>
      <p style="color:#888;font-size:12px;">This code is valid for 5 minutes. Do not share it with anyone.</p>
    </div>
  `;
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, subject: 'Your Rupanjel OTP Code', html }),
    });
    const data = await res.json();
    if (data.success) return { success: true };
    return { success: false, msg: data.error || 'Failed to send email' };
  } catch {
    return { success: false, msg: 'Failed to send email' };
  }
}

// ইমেইল আংশিক লুকানো — যেমন rf****n@gmail.com
function maskEmail(email) {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;
  if (user.length <= 2) return `${user[0] || ''}***@${domain}`;
  return `${user.slice(0, 2)}****${user.slice(-1)}@${domain}`;
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
  if (!data.length) return { valid: false, msg: 'Incorrect OTP' };
  const record = data[0];
  if (new Date(record.expires_at) < new Date()) return { valid: false, msg: 'OTP expired' };
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
  const [fpEmail, setFpEmail]     = useState('');
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
      setError('Please fill in all fields');
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
        setError('Incorrect phone number or password');
        setLoading(false);
        return;
      }
      const user = data[0];
      localStorage.setItem('user', JSON.stringify(user));
      router.push(user.role === 'admin' ? '/admin' : '/products');
    } catch {
      setError('Something went wrong, please try again');
      setLoading(false);
    }
  };

  // ── FORGOT: ফোন submit ──
  const handleSendOtp = async () => {
    setFpError('');
    if (!/^01[3-9]\d{8}$/.test(fpPhone)) {
      setFpError('Enter a valid phone number (01XXXXXXXXX)');
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
        setFpError('No account found with this phone number');
        setFpLoading(false);
        return;
      }
      const account = data[0];
      if (!account.email) {
        setFpError('No email is linked to this account. Please contact support.');
        setFpLoading(false);
        return;
      }
      // OTP generate
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await saveOTP(fpPhone, otp);
      const emailRes = await sendOTPEmail(account.email, otp);
      if (!emailRes.success) {
        setFpError('Failed to send email: ' + emailRes.msg);
        setFpLoading(false);
        return;
      }
      setFpEmail(account.email);
      setView('forgot_otp');
      setResendTimer(60);
      setFpOtp(['', '', '', '', '', '']);
    } catch {
      setFpError('Something went wrong, please try again');
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
    if (otp.length < 6) { setFpError('Enter the 6-digit OTP'); return; }
    setFpLoading(true);
    try {
      const result = await verifyOTP(fpPhone, otp);
      if (!result.valid) { setFpError(result.msg); setFpLoading(false); return; }
      setView('forgot_reset');
    } catch {
      setFpError('Something went wrong, please try again');
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
      const emailRes = await sendOTPEmail(fpEmail, otp);
      if (!emailRes.success) { setFpError('Failed to send email: ' + emailRes.msg); setFpLoading(false); return; }
      setResendTimer(60);
      setFpOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch {
      setFpError('Something went wrong');
    }
    setFpLoading(false);
  };

  // ── FORGOT: নতুন পাসওয়ার্ড ──
  const handleResetPass = async () => {
    setFpError('');
    if (fpNewPass.length < 6) { setFpError('Password must be at least 6 characters'); return; }
    if (fpNewPass !== fpConfPass) { setFpError('Passwords do not match'); return; }
    setFpLoading(true);
    try {
      const ok = await updatePassword(fpPhone, fpNewPass);
      if (!ok) { setFpError('Password update failed, please try again'); setFpLoading(false); return; }
      // reset করে login-এ ফিরে যাও
      setView('login');
      setFpPhone(''); setFpEmail(''); setFpOtp(['','','','','','']); setFpNewPass(''); setFpConfPass('');
      setForm({ phone: fpPhone, password: '' });
      // success toast
      setError('');
      setTimeout(() => setError('✅ Password changed successfully! Log in with your new password'), 100);
    } catch {
      setFpError('Something went wrong, please try again');
    }
    setFpLoading(false);
  };

  // ── STYLES ──
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
    display: 'flex', alignItems: 'center',
    background: '#f3f2ef', border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '10px', padding: '0 12px', transition: 'border-color 0.2s,box-shadow 0.2s',
  };
  const inputStyle = {
    background: 'none', border: 'none', outline: 'none',
    color: '#1a1a1a', fontSize: '15px', padding: '12px 0',
    width: '100%', fontFamily: 'inherit',
  };
  const labelStyle = {
    display: 'block', fontSize: '11px', color: 'rgba(0,0,0,0.5)',
    marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase',
  };
  const btnGold = {
    width: '100%', background: '#e8a020', color: '#000', border: 'none',
    borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700',
    cursor: fpLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
    opacity: fpLoading ? 0.7 : 1, marginTop: '8px',
  };
  const btnOutline = {
    width: '100%', background: 'transparent', color: 'rgba(0,0,0,0.6)',
    border: '1px solid rgba(0,0,0,0.15)', borderRadius: '10px',
    padding: '12px', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px',
  };

  // ── LEFT PANEL ──
  const LeftPanel = () => (
    <div style={{ flex:'0 0 260px', background:'#fff', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 36px', borderRight:'1px solid rgba(0,0,0,0.08)' }}>
      <div onClick={() => router.push('/')} style={{ cursor:'pointer', marginBottom:'12px' }}>
        <span style={{ fontSize:'28px', fontWeight:'800', ...shimmerStyle }}>Rupanjel</span>
        <span className="red-dot" />
      </div>
      <p style={{ fontSize:'14px', color:'rgba(0,0,0,0.5)', lineHeight:'1.7' }}>
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
        .otp-box{width:44px;height:52px;background:#f3f2ef;border:1.5px solid rgba(0,0,0,0.12);border-radius:10px;color:#1a1a1a;font-size:22px;font-weight:700;text-align:center;outline:none;transition:border-color 0.2s,box-shadow 0.2s;font-family:inherit;}
        .otp-box:focus{border-color:#e8a020;box-shadow:0 0 0 3px rgba(232,160,32,0.12);}
        .back-link{font-size:12px;color:rgba(0,0,0,0.45);cursor:pointer;display:inline-flex;align-items:center;gap:4px;margin-bottom:24px;}
        .back-link:hover{color:rgba(0,0,0,0.7);}
      `}</style>

      <div style={{ minHeight:'100vh', background:'#faf9f7', display:'flex', flexDirection:'column', fontFamily:"'Hind Siliguri', sans-serif" }}>

        <div style={{ flex:1, display:'flex', flexDirection: isMobile ? 'column' : 'row' }}>

          {!isMobile && <LeftPanel />}

          <div style={{ flex:1, display:'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent:'center', padding: isMobile ? '32px 24px' : '48px' }}>
            <div style={{ width:'100%', maxWidth:'320px' }}>

              {/* ════ LOGIN VIEW ════ */}
              {view === 'login' && (
                <>
                  {!isMobile && (
                    <div className="fade1" onClick={() => router.push('/')} style={{ color:'rgba(0,0,0,0.45)', fontSize:'12px', cursor:'pointer', marginBottom:'32px' }}>
                      ← Go Home
                    </div>
                  )}

                  <div className="fade2" style={{ marginBottom:'14px' }}>
                    <label style={labelStyle}>Phone Number</label>
                    <div className="fw" style={fieldWrapStyle}>
                      <span style={{ fontSize:'16px', color:'rgba(0,0,0,0.4)', marginRight:'8px' }}>📞</span>
                      <input type="tel" placeholder="01700000000" value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        style={inputStyle} />
                    </div>
                  </div>

                  <div className="fade3" style={{ marginBottom:'4px' }}>
                    <label style={labelStyle}>Password</label>
                    <div className={`fw${shakePass ? ' shake-anim' : ''}`} style={fieldWrapStyle}>
                      <span style={{ fontSize:'16px', color:'rgba(0,0,0,0.4)', marginRight:'8px' }}>🔒</span>
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
                      Forgot Password?
                    </span>
                  </div>

                  <div className="fade4">
                    <button onClick={handleSubmit} disabled={loading}
                      style={{ width:'100%', background:'#e8a020', color:'#000', border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:'700', cursor: loading ? 'not-allowed' : 'pointer', marginTop:'8px', fontFamily:'inherit', opacity: loading ? 0.7 : 1 }}>
                      {loading ? <div className="spinner" /> : 'Login'}
                    </button>
                  </div>

                  <p className="fade5" style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'rgba(0,0,0,0.45)' }}>
                    Don't have an account?{' '}
                    <span onClick={() => router.push('/register')} style={{ color:'#e8a020', fontWeight:'700', cursor:'pointer' }}>
                      Register
                    </span>
                  </p>
                </>
              )}

              {/* ════ FORGOT: ফোন নম্বর ════ */}
              {view === 'forgot_phone' && (
                <>
                  <span className="back-link" onClick={() => setView('login')}>← Back to Login</span>
                  <h2 style={{ color:'#1a1a1a', fontSize:'20px', fontWeight:'700', marginBottom:'6px' }}>Reset Password</h2>
                  <p style={{ color:'rgba(0,0,0,0.5)', fontSize:'13px', marginBottom:'24px', lineHeight:'1.6' }}>
                    An OTP will be sent to your registered email.
                  </p>

                  <div style={{ marginBottom:'14px' }}>
                    <label style={labelStyle}>Phone Number</label>
                    <div className="fw" style={fieldWrapStyle}>
                      <span style={{ fontSize:'16px', color:'rgba(0,0,0,0.4)', marginRight:'8px' }}>📞</span>
                      <input type="tel" placeholder="01700000000" value={fpPhone}
                        onChange={e => setFpPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                        style={inputStyle} />
                    </div>
                    <ErrorMsg msg={fpError} />
                  </div>

                  <button onClick={handleSendOtp} disabled={fpLoading} style={btnGold}>
                    {fpLoading ? <div className="spinner" /> : 'Send OTP'}
                  </button>
                </>
              )}

              {/* ════ FORGOT: OTP ════ */}
              {view === 'forgot_otp' && (
                <>
                  <span className="back-link" onClick={() => setView('forgot_phone')}>← Go Back</span>
                  <h2 style={{ color:'#1a1a1a', fontSize:'20px', fontWeight:'700', marginBottom:'6px' }}>Verify OTP</h2>
                  <p style={{ color:'rgba(0,0,0,0.5)', fontSize:'13px', marginBottom:'24px', lineHeight:'1.6' }}>
                    A 6-digit OTP has been sent to <span style={{ color:'#e8a020' }}>{maskEmail(fpEmail)}</span>.
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
                  <p style={{ textAlign:'center', fontSize:'13px', color:'rgba(0,0,0,0.5)', margin:'8px 0 4px' }}>
                    {resendTimer > 0 ? (
                      <>Resend in <span style={{ color:'#e8a020', fontWeight:'700' }}>{resendTimer}s</span></>
                    ) : (
                      <span onClick={handleResend} style={{ color:'#e8a020', cursor:'pointer', fontWeight:'600' }}>
                        Resend OTP
                      </span>
                    )}
                  </p>

                  <button onClick={handleVerifyOtp} disabled={fpLoading || fpOtp.join('').length < 6} style={{ ...btnGold, opacity: fpLoading || fpOtp.join('').length < 6 ? 0.5 : 1 }}>
                    {fpLoading ? <div className="spinner" /> : 'Verify'}
                  </button>
                </>
              )}

              {/* ════ FORGOT: নতুন পাসওয়ার্ড ════ */}
              {view === 'forgot_reset' && (
                <>
                  <span className="back-link" onClick={() => setView('forgot_otp')}>← Go Back</span>
                  <h2 style={{ color:'#1a1a1a', fontSize:'20px', fontWeight:'700', marginBottom:'6px' }}>New Password</h2>
                  <p style={{ color:'rgba(0,0,0,0.5)', fontSize:'13px', marginBottom:'24px', lineHeight:'1.6' }}>
                    Enter your new password.
                  </p>

                  <div style={{ marginBottom:'14px' }}>
                    <label style={labelStyle}>New Password</label>
                    <div className="fw" style={fieldWrapStyle}>
                      <span style={{ fontSize:'16px', color:'rgba(0,0,0,0.4)', marginRight:'8px' }}>🔒</span>
                      <input type="password" placeholder="At least 6 characters" value={fpNewPass}
                        onChange={e => setFpNewPass(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleResetPass()}
                        style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ marginBottom:'8px' }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <div className="fw" style={fieldWrapStyle}>
                      <span style={{ fontSize:'16px', color:'rgba(0,0,0,0.4)', marginRight:'8px' }}>🔒</span>
                      <input type="password" placeholder="Re-enter password" value={fpConfPass}
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
                            : 'rgba(0,0,0,0.1)'
                        }} />
                      ))}
                    </div>
                  )}

                  <button onClick={handleResetPass} disabled={fpLoading} style={btnGold}>
                    {fpLoading ? <div className="spinner" /> : 'Change Password'}
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
