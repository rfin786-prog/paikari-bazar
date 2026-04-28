'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.phone || !form.password) { setError('সব তথ্য পূরণ করুন'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/users?phone=eq.${form.phone}&password=eq.${form.password}&status=eq.active`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const data = await res.json();
      if (data.length === 0) { setError('ফোন নম্বর বা পাসওয়ার্ড ভুল'); setLoading(false); return; }
      const user = data[0];
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'admin') { router.push('/admin'); }
      else { router.push('/dashboard'); }
    } catch {
      setError('সমস্যা হয়েছে, আবার চেষ্টা করুন');
      setLoading(false);
    }
  };

  const s = {
    page: { minHeight:'100vh', display:'flex', fontFamily:'Hind Siliguri, sans-serif' },
    left: { flex:'0 0 360px', background:'#0f2442', display:'flex', flexDirection:'column', justifyContent:'center', padding:'44px', color:'#fff' },
    right: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'44px', background:'#faf7f2' },
    box: { width:'100%', maxWidth:'440px', background:'#fff', borderRadius:'18px', padding:'40px', boxShadow:'0 4px 24px rgba(15,36,66,.10)' },
    inp: { width:'100%', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontFamily:'Hind Siliguri, sans-serif', fontSize:'14px', color:'#0f2442', outline:'none', marginBottom:'14px', boxSizing:'border-box' },
    btn: { width:'100%', background:'#0f2442', color:'#fff', border:'none', padding:'13px', borderRadius:'9px', fontFamily:'Hind Siliguri, sans-serif', fontSize:'15px', fontWeight:'700', cursor:'pointer', marginTop:'4px' },
    err: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'10px 13px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' },
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={{fontFamily:'serif', fontSize:'24px', fontWeight:'700', marginBottom:'8px'}}>পাইকারি<span style={{color:'#e8a020'}}>বাজার</span></div>
        <div style={{fontSize:'13px', color:'rgba(255,255,255,.6)', lineHeight:'1.7', marginBottom:'32px'}}>বাংলাদেশের #১ পাইকারি B2B প্ল্যাটফর্ম</div>
        {[['১', 'ফোন নম্বর দিন', 'আপনার রেজিস্টার্ড নম্বর'],['২', 'পাসওয়ার্ড দিন', 'আপনার গোপন পাসওয়ার্ড'],['৩', 'লগইন করুন', 'ড্যাশবোর্ডে প্রবেশ করুন']].map(([n,t,s])=>(
          <div key={n} style={{display:'flex', gap:'12px', marginBottom:'18px', alignItems:'flex-start'}}>
            <div style={{width:'26px', height:'26px', background:'#e8a020', color:'#0f2442', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', flexShrink:0}}>{n}</div>
            <div><strong style={{display:'block', fontSize:'14px', color:'#fff'}}>{t}</strong><span style={{fontSize:'12px', color:'rgba(255,255,255,.55)'}}>{s}</span></div>
          </div>
        ))}
      </div>
      <div style={s.right}>
        <div style={s.box}>
          <h2 style={{fontFamily:'serif', fontSize:'24px', color:'#0f2442', marginBottom:'5px'}}>লগইন করুন</h2>
          <p style={{fontSize:'13px', color:'#6b7280', marginBottom:'24px'}}>আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
          {error && <div style={s.err}>{error}</div>}
          <label style={{fontSize:'12px', fontWeight:'600', color:'#0f2442', display:'block', marginBottom:'6px'}}>ফোন নম্বর</label>
          <input style={s.inp} placeholder="01XXXXXXXXX" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
          <label style={{fontSize:'12px', fontWeight:'600', color:'#0f2442', display:'block', marginBottom:'6px'}}>পাসওয়ার্ড</label>
          <input style={s.inp} type="password" placeholder="পাসওয়ার্ড" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
          <button style={s.btn} onClick={handleSubmit} disabled={loading}>{loading ? 'অপেক্ষা করুন...' : 'লগইন করুন'}</button>
          <div style={{textAlign:'center', marginTop:'16px', fontSize:'13px', color:'#6b7280'}}>
            অ্যাকাউন্ট নেই? <span style={{color:'#e8a020', fontWeight:'700', cursor:'pointer'}} onClick={()=>router.push('/register')}>নিবন্ধন করুন</span>
          </div>
          <div style={{textAlign:'center', marginTop:'8px', fontSize:'13px', color:'#6b7280'}}>
            <span style={{color:'#6b7280', cursor:'pointer'}} onClick={()=>router.push('/')}>← হোমে ফিরুন</span>
          </div>
        </div>
      </div>
    </div>
  );
}