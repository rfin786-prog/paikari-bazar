'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name:'', shop_name:'', phone:'', area:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!form.name || !form.phone || !form.password) { setError('সব তথ্য পূরণ করুন'); return; }
    if (form.phone.length !== 11) { setError('সঠিক ফোন নম্বর দিন'); return; }
    if (form.password !== form.confirm) { setError('পাসওয়ার্ড মিলছে না'); return; }
    if (form.password.length < 6) { setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ name: form.name, shop_name: form.shop_name, phone: form.phone, area: form.area, password: form.password, role: 'user', status: 'active', wallet: 0 })
      });
      if (res.status === 201) {
        setSuccess('✅ নিবন্ধন সফল! লগইন করুন।');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        const err = await res.json();
        if (err.code === '23505') { setError('এই ফোন নম্বর আগেই নিবন্ধিত'); }
        else { setError('সমস্যা হয়েছে, আবার চেষ্টা করুন'); }
      }
    } catch { setError('সমস্যা হয়েছে, আবার চেষ্টা করুন'); }
    setLoading(false);
  };

  const s = {
    page: { minHeight:'100vh', display:'flex', fontFamily:'Hind Siliguri, sans-serif' },
    left: { flex:'0 0 360px', background:'#0f2442', display:'flex', flexDirection:'column', justifyContent:'center', padding:'44px', color:'#fff' },
    right: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'44px', background:'#faf7f2', overflowY:'auto' },
    box: { width:'100%', maxWidth:'500px', background:'#fff', borderRadius:'18px', padding:'40px', boxShadow:'0 4px 24px rgba(15,36,66,.10)' },
    inp: { width:'100%', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontFamily:'Hind Siliguri, sans-serif', fontSize:'14px', color:'#0f2442', outline:'none', marginBottom:'14px', boxSizing:'border-box' },
    btn: { width:'100%', background:'#0f2442', color:'#fff', border:'none', padding:'13px', borderRadius:'9px', fontFamily:'Hind Siliguri, sans-serif', fontSize:'15px', fontWeight:'700', cursor:'pointer', marginTop:'4px' },
    err: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'10px 13px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' },
    suc: { background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', padding:'10px 13px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' },
    label: { fontSize:'12px', fontWeight:'600', color:'#0f2442', display:'block', marginBottom:'6px' },
    row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' },
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={{fontFamily:'serif', fontSize:'24px', fontWeight:'700', marginBottom:'8px'}}>পাইকারি<span style={{color:'#e8a020'}}>বাজার</span></div>
        <div style={{fontSize:'13px', color:'rgba(255,255,255,.6)', lineHeight:'1.7', marginBottom:'32px'}}>বাংলাদেশের #১ পাইকারি B2B প্ল্যাটফর্ম</div>
        {[['১','নাম ও দোকান','আপনার তথ্য দিন'],['২','ফোন নম্বর','যোগাযোগের নম্বর'],['৩','পাসওয়ার্ড','নিরাপদ পাসওয়ার্ড'],['৪','সম্পন্ন','পাইকারি শুরু করুন']].map(([n,t,s])=>(
          <div key={n} style={{display:'flex', gap:'12px', marginBottom:'18px', alignItems:'flex-start'}}>
            <div style={{width:'26px', height:'26px', background:'#e8a020', color:'#0f2442', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', flexShrink:0}}>{n}</div>
            <div><strong style={{display:'block', fontSize:'14px', color:'#fff'}}>{t}</strong><span style={{fontSize:'12px', color:'rgba(255,255,255,.55)'}}>{s}</span></div>
          </div>
        ))}
      </div>
      <div style={s.right}>
        <div style={s.box}>
          <h2 style={{fontFamily:'serif', fontSize:'24px', color:'#0f2442', marginBottom:'5px'}}>নিবন্ধন করুন</h2>
          <p style={{fontSize:'13px', color:'#6b7280', marginBottom:'24px'}}>নতুন অ্যাকাউন্ট তৈরি করুন</p>
          {error && <div style={s.err}>{error}</div>}
          {success && <div style={s.suc}>{success}</div>}
          <div style={s.row}>
            <div>
              <label style={s.label}>আপনার নাম *</label>
              <input style={s.inp} placeholder="মোঃ রহিম" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            </div>
            <div>
              <label style={s.label}>দোকানের নাম</label>
              <input style={s.inp} placeholder="রহিম স্টোর" value={form.shop_name} onChange={e=>setForm({...form, shop_name:e.target.value})} />
            </div>
          </div>
          <div style={s.row}>
            <div>
              <label style={s.label}>ফোন নম্বর *</label>
              <input style={s.inp} placeholder="01XXXXXXXXX" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
            </div>
            <div>
              <label style={s.label}>এলাকা</label>
              <input style={s.inp} placeholder="ঢাকা, চট্টগ্রাম..." value={form.area} onChange={e=>setForm({...form, area:e.target.value})} />
            </div>
          </div>
          <div style={s.row}>
            <div>
              <label style={s.label}>পাসওয়ার্ড *</label>
              <input style={s.inp} type="password" placeholder="কমপক্ষে ৬ অক্ষর" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
            </div>
            <div>
              <label style={s.label}>পাসওয়ার্ড নিশ্চিত *</label>
              <input style={s.inp} type="password" placeholder="আবার দিন" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} />
            </div>
          </div>
          <button style={s.btn} onClick={handleSubmit} disabled={loading}>{loading ? 'অপেক্ষা করুন...' : 'নিবন্ধন করুন'}</button>
          <div style={{textAlign:'center', marginTop:'16px', fontSize:'13px', color:'#6b7280'}}>
            অ্যাকাউন্ট আছে? <span style={{color:'#e8a020', fontWeight:'700', cursor:'pointer'}} onClick={()=>router.push('/login')}>লগইন করুন</span>
          </div>
          <div style={{textAlign:'center', marginTop:'8px', fontSize:'13px'}}>
            <span style={{color:'#6b7280', cursor:'pointer'}} onClick={()=>router.push('/')}>← হোমে ফিরুন</span>
          </div>
        </div>
      </div>
    </div>
  );
}