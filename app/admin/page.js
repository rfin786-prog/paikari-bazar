'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'অপেক্ষমান',     color: '#f59e0b', bg: '#fef3c7' },
  { value: 'processing', label: 'প্রক্রিয়াধীন',  color: '#3b82f6', bg: '#dbeafe' },
  { value: 'shipped',    label: 'পাঠানো হয়েছে',  color: '#6366f1', bg: '#e0e7ff' },
  { value: 'delivered',  label: 'ডেলিভারি হয়েছে', color: '#10b981', bg: '#d1fae5' },
  { value: 'cancelled',  label: 'বাতিল',          color: '#ef4444', bg: '#fee2e2' },
];

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Product form
  const [form, setForm] = useState({ name:'', emoji:'📦', category_id:'', price:'', mrp:'', unit:'কেজি', stock:'', moq:'1' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  // Category form
  const [catForm, setCatForm] = useState({ name: '' });
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState(null);
  const [catUploading, setCatUploading] = useState(false);
  const [catMsg, setCatMsg] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadProducts(); loadOrders(); loadUsers(); loadCategories();
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

  const loadCategories = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?order=created_at.asc`, { headers });
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  // Product image upload
  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadProductImage() {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/products/${fileName}`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': imageFile.type },
      body: imageFile,
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;
  }

  // Category image upload
  function handleCatImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setCatImageFile(file);
    setCatImagePreview(URL.createObjectURL(file));
  }

  async function uploadCatImage() {
    if (!catImageFile) return null;
    const ext = catImageFile.name.split('.').pop();
    const fileName = `cat_${Date.now()}.${ext}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/category-images/${fileName}`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': catImageFile.type },
      body: catImageFile,
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/category-images/${fileName}`;
  }

  const addProduct = async () => {
    if (!form.name || !form.price) { setMsg('নাম ও মূল্য দিন'); return; }
    setUploading(true);
    const image_url = await uploadProductImage();
    const body = {
      name: form.name, emoji: form.emoji,
      price: Number(form.price), mrp: Number(form.mrp),
      unit: form.unit, stock: Number(form.stock), moq: Number(form.moq),
      active: true, image_url,
    };
    if (form.category_id) body.category_id = form.category_id;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(body),
    });
    setUploading(false);
    if (res.status === 201) {
      setMsg('✅ পণ্য যোগ হয়েছে');
      setForm({ name:'', emoji:'📦', category_id:'', price:'', mrp:'', unit:'কেজি', stock:'', moq:'1' });
      setImageFile(null); setImagePreview(null);
      loadProducts();
    } else {
      setMsg('❌ সমস্যা হয়েছে');
    }
  };

  const addCategory = async () => {
    if (!catForm.name) { setCatMsg('ক্যাটাগরির নাম দিন'); return; }
    setCatUploading(true);
    const image_url = await uploadCatImage();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ name: catForm.name, image_url }),
    });
    setCatUploading(false);
    if (res.status === 201) {
      setCatMsg('✅ ক্যাটাগরি যোগ হয়েছে');
      setCatForm({ name: '' });
      setCatImageFile(null); setCatImagePreview(null);
      loadCategories();
    } else {
      setCatMsg('❌ সমস্যা হয়েছে');
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('এই ক্যাটাগরি মুছে ফেলবেন?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`, { method: 'DELETE', headers });
    loadCategories();
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
    nav: { background:'#1e1b4b', padding:'0 24px', display:'flex', justifyContent:'space-between', alignItems:'center', height:'60px' },
    tab: (t) => ({ padding:'7px 16px', borderRadius:'7px', fontSize:'13px', fontWeight:'600', cursor:'pointer', border:'none', fontFamily:'Hind Siliguri, sans-serif', background: tab===t ? 'rgba(255,255,255,.15)' : 'transparent', color: tab===t ? '#818cf8' : 'rgba(255,255,255,.6)' }),
    inp: { width:'100%', padding:'9px 12px', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontFamily:'Hind Siliguri, sans-serif', fontSize:'13px', outline:'none', boxSizing:'border-box' },
    btn: { background:'#1e1b4b', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'8px', fontFamily:'Hind Siliguri, sans-serif', fontSize:'13px', fontWeight:'700', cursor:'pointer' },
  };

  return (
    <div style={{minHeight:'100vh', background:'#f3f4f6', fontFamily:'Hind Siliguri, sans-serif'}}>
      <nav style={s.nav}>
        <div style={{display:'flex', gap:'4px'}}>
          {[['products','পণ্য'],['categories','ক্যাটাগরি'],['orders','অর্ডার'],['users','গ্রাহক']].map(([t,l])=>(
            <button key={t} style={s.tab(t)} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <span style={{color:'rgba(255,255,255,.7)', fontSize:'13px'}}>Admin</span>
          <button onClick={logout} style={{...s.btn, background:'rgba(255,255,255,.1)', fontSize:'12px', padding:'7px 14px'}}>লগআউট</button>
        </div>
      </nav>

      <div style={{padding:'24px'}}>

        {/* ===== PRODUCTS TAB ===== */}
        {tab === 'products' && (
          <div>
            <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px', color:'#1e1b4b'}}>পণ্য ব্যবস্থাপনা</h2>
            {msg && <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', padding:'10px', borderRadius:'8px', marginBottom:'16px', fontSize:'13px'}}>{msg}</div>}

            <div style={{background:'#fff', borderRadius:'14px', padding:'20px', marginBottom:'24px', boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              <h3 style={{fontSize:'15px', fontWeight:'700', marginBottom:'16px', color:'#1e1b4b'}}>নতুন পণ্য যোগ করুন</h3>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px'}}>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>পণ্যের নাম *</label><input style={s.inp} placeholder="চাল (মিনিকেট)" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>ইমোজি</label><input style={s.inp} placeholder="🌾" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} /></div>

                {/* Category dropdown */}
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>ক্যাটাগরি</label>
                  <select style={s.inp} value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}>
                    <option value="">-- ক্যাটাগরি বেছে নিন --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>ইউনিট</label><input style={s.inp} placeholder="৫০ কেজি বস্তা" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>পাইকারি মূল্য *</label><input style={s.inp} type="number" placeholder="1200" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>MRP</label><input style={s.inp} type="number" placeholder="1500" value={form.mrp} onChange={e=>setForm({...form,mrp:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>স্টক</label><input style={s.inp} type="number" placeholder="500" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} /></div>
                <div><label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>MOQ</label><input style={s.inp} type="number" placeholder="1" value={form.moq} onChange={e=>setForm({...form,moq:e.target.value})} /></div>
              </div>

              <div style={{marginBottom:'16px'}}>
                <label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'8px'}}>পণ্যের ছবি</label>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                  {imagePreview && <img src={imagePreview} alt="preview" style={{width:'70px', height:'70px', objectFit:'cover', borderRadius:'10px', border:'1.5px solid #e5e7eb'}} />}
                  <label style={{display:'inline-block', padding:'10px 16px', background:'#f3f4f6', border:'2px dashed #d1d5db', borderRadius:'10px', cursor:'pointer', fontSize:'13px', color:'#6b7280'}}>
                    📷 ছবি বেছে নিন
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{display:'none'}} />
                  </label>
                  {imageFile && <span style={{fontSize:'12px', color:'#10b981'}}>✅ {imageFile.name}</span>}
                </div>
              </div>

              <button style={{...s.btn, opacity: uploading ? 0.7 : 1}} onClick={addProduct} disabled={uploading}>
                {uploading ? 'আপলোড হচ্ছে...' : '+ পণ্য যোগ করুন'}
              </button>
            </div>

            <div style={{background:'#fff', borderRadius:'14px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              <h3 style={{fontSize:'15px', fontWeight:'700', marginBottom:'16px', color:'#1e1b4b'}}>পণ্য তালিকা ({products.length})</h3>
              {products.map(p => {
                const cat = categories.find(c => c.id === p.category_id);
                return (
                  <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f3f4f6'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} style={{width:'48px', height:'48px', objectFit:'cover', borderRadius:'8px'}} />
                        : <span style={{fontSize:'28px'}}>{p.emoji}</span>
                      }
                      <div>
                        <div style={{fontWeight:'600', fontSize:'14px'}}>{p.name}</div>
                        <div style={{fontSize:'12px', color:'#6b7280'}}>{cat ? cat.name : 'ক্যাটাগরি নেই'} | {p.unit} | স্টক: {p.stock}</div>
                      </div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <span style={{fontWeight:'700', color:'#1e1b4b'}}>৳{p.price}</span>
                      <button onClick={()=>toggleProduct(p.id, p.active)} style={{...s.btn, background: p.active ? '#dcfce7' : '#fee2e2', color: p.active ? '#16a34a' : '#dc2626', padding:'6px 12px', fontSize:'12px'}}>{p.active ? '🟢 সক্রিয়' : '🔴 নিষ্ক্রিয়'}</button>
                    </div>
                  </div>
                );
              })}
              {products.length === 0 && <p style={{color:'#6b7280', fontSize:'13px'}}>কোনো পণ্য নেই</p>}
            </div>
          </div>
        )}

        {/* ===== CATEGORIES TAB ===== */}
        {tab === 'categories' && (
          <div>
            <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px', color:'#1e1b4b'}}>ক্যাটাগরি ব্যবস্থাপনা</h2>
            {catMsg && <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', padding:'10px', borderRadius:'8px', marginBottom:'16px', fontSize:'13px'}}>{catMsg}</div>}

            {/* Add Category Form */}
            <div style={{background:'#fff', borderRadius:'14px', padding:'20px', marginBottom:'24px', boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              <h3 style={{fontSize:'15px', fontWeight:'700', marginBottom:'16px', color:'#1e1b4b'}}>নতুন ক্যাটাগরি যোগ করুন</h3>

              <div style={{marginBottom:'12px'}}>
                <label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>ক্যাটাগরির নাম *</label>
                <input style={s.inp} placeholder="যেমন: খাদ্যশস্য, তেল, মশলা..." value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})} />
              </div>

              <div style={{marginBottom:'16px'}}>
                <label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'8px'}}>ক্যাটাগরির ছবি</label>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                  {catImagePreview && (
                    <img src={catImagePreview} alt="preview" style={{width:'70px', height:'70px', objectFit:'cover', borderRadius:'10px', border:'1.5px solid #e5e7eb'}} />
                  )}
                  <label style={{display:'inline-block', padding:'10px 16px', background:'#f3f4f6', border:'2px dashed #d1d5db', borderRadius:'10px', cursor:'pointer', fontSize:'13px', color:'#6b7280'}}>
                    📷 ছবি বেছে নিন
                    <input type="file" accept="image/*" onChange={handleCatImageSelect} style={{display:'none'}} />
                  </label>
                  {catImageFile && <span style={{fontSize:'12px', color:'#10b981'}}>✅ {catImageFile.name}</span>}
                </div>
              </div>

              <button style={{...s.btn, background:'#059669', opacity: catUploading ? 0.7 : 1}} onClick={addCategory} disabled={catUploading}>
                {catUploading ? 'আপলোড হচ্ছে...' : '+ ক্যাটাগরি যোগ করুন'}
              </button>
            </div>

            {/* Categories List */}
            <div style={{background:'#fff', borderRadius:'14px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              <h3 style={{fontSize:'15px', fontWeight:'700', marginBottom:'16px', color:'#1e1b4b'}}>ক্যাটাগরি তালিকা ({categories.length})</h3>
              {categories.length === 0 && <p style={{color:'#6b7280', fontSize:'13px'}}>কোনো ক্যাটাগরি নেই</p>}
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'12px'}}>
                {categories.map(cat => (
                  <div key={cat.id} style={{border:'1.5px solid #f3f4f6', borderRadius:'12px', padding:'14px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', position:'relative'}}>
                    <div style={{width:'60px', height:'60px', borderRadius:'12px', overflow:'hidden', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      {cat.image_url
                        ? <img src={cat.image_url} alt={cat.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        : <span style={{fontSize:'28px'}}>📦</span>
                      }
                    </div>
                    <span style={{fontWeight:'600', fontSize:'14px', textAlign:'center'}}>{cat.name}</span>
                    <button onClick={() => deleteCategory(cat.id)} style={{...s.btn, background:'#fee2e2', color:'#dc2626', padding:'5px 12px', fontSize:'12px'}}>
                      🗑 মুছুন
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== ORDERS TAB ===== */}
        {tab === 'orders' && (
          <div>
            <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px', color:'#1e1b4b'}}>অর্ডার ব্যবস্থাপনা ({orders.length})</h2>
            <div style={{background:'#fff', borderRadius:'14px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              {orders.length === 0 && <p style={{color:'#6b7280', fontSize:'13px'}}>কোনো অর্ডার নেই</p>}
              {orders.map(o => {
                const items = Array.isArray(o.items) ? o.items : [];
                const date = new Date(o.created_at).toLocaleDateString('bn-BD', { day:'numeric', month:'long', year:'numeric' });
                const statusCfg = STATUS_OPTIONS.find(s => s.value === o.status) || STATUS_OPTIONS[0];
                const isExpanded = expandedOrder === o.id;
                return (
                  <div key={o.id} style={{borderBottom:'1px solid #f3f4f6', paddingBottom:'12px', marginBottom:'12px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px'}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap'}}>
                          <span style={{fontSize:'12px', fontFamily:'monospace', color:'#6b7280'}}>#{o.id?.slice(0,8)?.toUpperCase()}</span>
                          <span style={{fontSize:'11px', fontWeight:'600', padding:'2px 8px', borderRadius:'20px', background: statusCfg.bg, color: statusCfg.color}}>{statusCfg.label}</span>
                        </div>
                        <div style={{fontWeight:'700', fontSize:'14px', color:'#111827'}}>{o.shop_name || 'অজানা'}</div>
                        <div style={{fontSize:'12px', color:'#6b7280'}}>{date} · {items.length} টি পণ্য · ৳{Number(o.total||0).toLocaleString()}</div>
                      </div>
                      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px'}}>
                        <select value={o.status || 'pending'} onChange={e => updateOrderStatus(o.id, e.target.value)}
                          style={{padding:'6px 10px', borderRadius:'8px', border:'1.5px solid #e5e7eb', fontFamily:'Hind Siliguri, sans-serif', fontSize:'13px', cursor:'pointer', outline:'none'}}>
                          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <button onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                          style={{fontSize:'12px', color:'#6366f1', background:'none', border:'none', cursor:'pointer', padding:0}}>
                          {isExpanded ? '▲ কম দেখুন' : '▼ বিস্তারিত'}
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{marginTop:'12px', background:'#f9fafb', borderRadius:'10px', padding:'12px'}}>
                        {items.map((item, idx) => (
                          <div key={idx} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', padding:'4px 0', borderBottom: idx < items.length-1 ? '1px solid #f3f4f6' : 'none'}}>
                            <span>{item.name} × {item.qty || item.quantity || 1}</span>
                            <span style={{fontWeight:'600'}}>৳{Number(item.price * (item.qty || item.quantity || 1)).toLocaleString()}</span>
                          </div>
                        ))}
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'14px', fontWeight:'700', paddingTop:'8px', marginTop:'4px', borderTop:'1px solid #e5e7eb'}}>
                          <span>মোট</span><span>৳{Number(o.total||0).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== USERS TAB ===== */}
        {tab === 'users' && (
          <div>
            <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px', color:'#1e1b4b'}}>গ্রাহক তালিকা ({users.length})</h2>
            <div style={{background:'#fff', borderRadius:'14px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              {users.map(u=>(
                <div key={u.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f3f4f6'}}>
                  <div>
                    <div style={{fontWeight:'600', fontSize:'14px'}}>{u.name}</div>
                    <div style={{fontSize:'12px', color:'#6b7280'}}>{u.phone} | {u.shop_name}</div>
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
