'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name:'', emoji:'📦', category:'', price:'', mrp:'', unit:'কেজি', stock:'', moq:'1' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadProducts(); loadOrders(); loadUsers();
  }, []);

  const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

  const loadProducts = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?order=created_at.desc`, { headers });
    setProducts(await res.json());
  };

  const loadOrders = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?order=created_at.desc`, { headers });
    setOrders(await res.json());
  };

  const loadUsers = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=created_at.desc`, { headers });
    setUsers(await res.json());
  };

  const addProduct = async () => {
    if (!form.name || !form.price) { setMsg('নাম ও মূল্য দিন'); return; }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ name: form.name, emoji: form.emoji, category: form.category, price: Number(form.price), mrp: Number(form.mrp), unit: form.unit, stock: Number(form.stock), moq: Number(form.moq), active: true })
    });
    if (res.status === 201) { setMsg('✅ পণ্য যোগ হয়েছে'); setForm({ name:'', emoji:'📦', category:'', price:'', mrp:'', unit:'কেজি', stock:'', moq:'1' }); loadProducts(); }
    else { setMsg('❌ সমস্যা হয়েছে'); }
  };

  const toggleProduct = async (id, active) => {
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({ active: !active }) });
    loadProducts();
  };

  const updateOrderStatus = async (id, status) => {
    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
    loadOrders();
  };

  const logout = () => { localStorage.removeItem('user'); router.push('/login'); };

  const s = {
    nav: { background:'#1e1b4b', padding:'0 36px', display:'flex', justifyContent:'space-between', alignItems:'center', height:'60px' },
    tab: (t) => ({ padding:'7px 16px', borderRadius:'7px', fontSize:'13px', fontWeight:'600', cursor:'pointer', border:'none', fontFamily:'Hind Siliguri, sans-serif', background: tab===t ? 'rgba(255,255,255,.15)' : 'transparent', color: tab===t ? '#818cf8' : 'rgba(255,255,255,.6)' }),
    inp: { width:'100%', padding:'9px 12px', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontFamily:'Hind Siliguri, sans-serif', fontSize:'13px', outline:'none', boxSizing:'border-box' },
    btn: { background:'#1e1b4b', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'8px', fontFamily:'Hind Siliguri, sans-serif', fontSize:'13px', fontWeight:'700', cursor:'pointer' },
  };

  return (
    <div style={{minHeight:'100vh', background:'#f3f4f6', fontFamily:'Hind Siliguri, sans-serif'}}>
      <nav style={s.nav}>
        <div style={{display:'flex', gap:'4px'}}>
          {[['products','পণ্য'],['orders','অর্ডার'],['users','গ্রাহক']].map(([t,l])=>(
            <button key={t} style={s.tab(t)} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <span style={{color:'rgba(255,255,255,.7)', fontSize:'13px'}}>Admin Panel</span>
          <button onClick={logout} style={{...s.btn, background:'rgba(255,255,255,.1)', fontSize:'12px', padding:'7px 14px'}}>লগআউট</button>
        </div>
      </nav>

      <div style={{padding:'32px 44px'}}>

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px', color:'#1e1b4b'}}>পণ্য ব্যবস্থাপনা</h2>
            {msg && <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', padding:'10px', borderRadius:'8px', marginBottom:'16px', fontSize:'13px'}}>{msg}</div>}
            <div style={{background:'#fff', borderRadius:'14px', padding:'24px', marginBottom:'24px', boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              <h3 style={{fontSize:'15px', fontWeight:'700', marginBottom:'16px', color:'#1e1b4b'}}>নতুন পণ্য যোগ করুন</h3>
              <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'12px'}}>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>পণ্যের নাম *</label><input style={s.inp} placeholder="চাল (মিনিকেট)" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>ইমোজি</label><input style={s.inp} placeholder="🌾" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>ক্যাটাগরি</label><input style={s.inp} placeholder="শস্য" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>ইউনিট</label><input style={s.inp} placeholder="কেজি" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>পাইকারি মূল্য *</label><input style={s.inp} type="number" placeholder="65" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>MRP</label><input style={s.inp} type="number" placeholder="75" value={form.mrp} onChange={e=>setForm({...form,mrp:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>স্টক</label><input style={s.inp} type="number" placeholder="500" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>MOQ</label><input style={s.inp} type="number" placeholder="1" value={form.moq} onChange={e=>setForm({...form,moq:e.target.value})} /></div>
              </div>
              <button style={s.btn} onClick={addProduct}>+ পণ্য যোগ করুন</button>
            </div>
            <div style={{background:'#fff', borderRadius:'14px', padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              <h3 style={{fontSize:'15px', fontWeight:'700', marginBottom:'16px', color:'#1e1b4b'}}>পণ্য তালিকা ({products.length})</h3>
              {products.map(p=>(
                <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f3f4f6'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <span style={{fontSize:'24px'}}>{p.emoji}</span>
                    <div>
                      <div style={{fontWeight:'600', fontSize:'14px'}}>{p.name}</div>
                      <div style={{fontSize:'12px', color:'#6b7280'}}>{p.category} | {p.unit} | স্টক: {p.stock}</div>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <span style={{fontWeight:'700', color:'#1e1b4b'}}>৳{p.price}</span>
                    <button onClick={()=>toggleProduct(p.id, p.active)} style={{...s.btn, background: p.active ? '#dcfce7' : '#fee2e2', color: p.active ? '#16a34a' : '#dc2626', padding:'6px 12px', fontSize:'12px'}}>{p.active ? '🟢 সক্রিয়' : '🔴 নিষ্ক্রিয়'}</button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <p style={{color:'#6b7280', fontSize:'13px'}}>কোনো পণ্য নেই</p>}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px', color:'#1e1b4b'}}>অর্ডার ব্যবস্থাপনা ({orders.length})</h2>
            <div style={{background:'#fff', borderRadius:'14px', padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              {orders.map(o=>(
                <div key={o.id} style={{padding:'16px 0', borderBottom:'1px solid #f3f4f6'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <div style={{fontWeight:'700', fontSize:'14px'}}>{o.id}</div>
                      <div style={{fontSize:'12px', color:'#6b7280'}}>{o.shop_name} | ৳{o.total}</div>
                    </div>
                    <select value={o.status} onChange={e=>updateOrderStatus(o.id, e.target.value)} style={{padding:'6px 10px', borderRadius:'8px', border:'1.5px solid #e5e7eb', fontFamily:'Hind Siliguri, sans-serif', fontSize:'13px', cursor:'pointer'}}>
                      {['pending','accepted','preparing','transit','delivered','cancelled'].map(s=>(
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p style={{color:'#6b7280', fontSize:'13px'}}>কোনো অর্ডার নেই</p>}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px', color:'#1e1b4b'}}>গ্রাহক তালিকা ({users.length})</h2>
            <div style={{background:'#fff', borderRadius:'14px', padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              {users.map(u=>(
                <div key={u.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f3f4f6'}}>
                  <div>
                    <div style={{fontWeight:'600', fontSize:'14px'}}>{u.name}</div>
                    <div style={{fontSize:'12px', color:'#6b7280'}}>{u.phone} | {u.shop_name} | {u.area}</div>
                  </div>
                  <div style={{fontSize:'13px', color:'#6b7280'}}>ওয়ালেট: ৳{u.wallet||0}</div>
                </div>
              ))}
              {users.length === 0 && <p style={{color:'#6b7280', fontSize:'13px'}}>কোনো গ্রাহক নেই</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}