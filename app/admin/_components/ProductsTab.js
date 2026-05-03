'use client';
import { useState, useEffect } from 'react';
import { SUPABASE_URL, SUPABASE_KEY, headers, s } from './constants';

const inp = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  fontFamily: 'Hind Siliguri, sans-serif',
  color: '#111827',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', emoji: '📦', category_id: '', price: '', mrp: '', unit: 'কেজি', stock: '', moq: '1' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?order=created_at.desc`, { headers });
    setProducts(await res.json());
  };

  const loadCategories = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?order=created_at.asc`, { headers });
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

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

  const addProduct = async () => {
    if (!form.name || !form.price) { setMsg('❌ নাম ও মূল্য দিন'); return; }
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
      setForm({ name: '', emoji: '📦', category_id: '', price: '', mrp: '', unit: 'কেজি', stock: '', moq: '1' });
      setImageFile(null); setImagePreview(null);
      loadProducts();
    } else {
      setMsg('❌ সমস্যা হয়েছে');
    }
  };

  const toggleProduct = async (id, active) => {
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({ active: !active }) });
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm('এই পণ্য মুছে ফেলবেন?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'DELETE', headers });
    loadProducts();
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e1b4b' }}>পণ্য ব্যবস্থাপনা</h2>

      {msg && (
        <div style={{ background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}`, color: msg.includes('✅') ? '#16a34a' : '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      {/* Add Product Form */}
      <div style={{ ...s.card, marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#1e1b4b' }}>নতুন পণ্য যোগ করুন</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>পণ্যের নাম *</label>
            <input style={inp} placeholder="চাল (মিনিকেট)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>ইমোজি</label>
            <input style={inp} placeholder="🌾" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>ক্যাটাগরি</label>
            <select style={inp} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">-- ক্যাটাগরি বেছে নিন --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>ইউনিট</label>
            <input style={inp} placeholder="৫০ কেজি বস্তা" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>পাইকারি মূল্য *</label>
            <input style={inp} type="number" placeholder="1200" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>MRP</label>
            <input style={inp} type="number" placeholder="1500" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>স্টক</label>
            <input style={inp} type="number" placeholder="500" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>MOQ</label>
            <input style={inp} type="number" placeholder="1" value={form.moq} onChange={e => setForm({ ...form, moq: e.target.value })} />
          </div>
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px', color: '#374151' }}>পণ্যের ছবি</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {imagePreview && <img src={imagePreview} alt="preview" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid #e5e7eb' }} />}
            <label style={{ display: 'inline-block', padding: '10px 16px', background: '#f3f4f6', border: '2px dashed #d1d5db', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: '#6b7280' }}>
              📷 ছবি বেছে নিন
              <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
            </label>
            {imageFile && <span style={{ fontSize: '12px', color: '#10b981' }}>✅ {imageFile.name}</span>}
          </div>
        </div>

        <button style={{ ...s.btn, opacity: uploading ? 0.7 : 1 }} onClick={addProduct} disabled={uploading}>
          {uploading ? 'আপলোড হচ্ছে...' : '+ পণ্য যোগ করুন'}
        </button>
      </div>

      {/* Products List */}
      <div style={s.card}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#1e1b4b' }}>পণ্য তালিকা ({products.length})</h3>
        {products.length === 0 && <p style={{ color: '#6b7280', fontSize: '13px' }}>কোনো পণ্য নেই</p>}
        {products.map(p => {
          const cat = categories.find(c => c.id === p.category_id);
          return (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                  : <span style={{ fontSize: '28px' }}>{p.emoji}</span>}
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{cat ? cat.name : 'ক্যাটাগরি নেই'} | {p.unit} | স্টক: {p.stock}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '700', color: '#1e1b4b' }}>৳{p.price}</span>
                <button onClick={() => toggleProduct(p.id, p.active)} style={{ ...s.btn, background: p.active ? '#dcfce7' : '#fee2e2', color: p.active ? '#16a34a' : '#dc2626', padding: '6px 12px', fontSize: '12px' }}>
                  {p.active ? '🟢 সক্রিয়' : '🔴 নিষ্ক্রিয়'}
                </button>
                <button onClick={() => deleteProduct(p.id)} style={{ ...s.btn, background: '#fee2e2', color: '#dc2626', padding: '6px 12px', fontSize: '12px' }}>
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
