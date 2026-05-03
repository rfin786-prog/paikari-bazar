'use client';
import { useState, useEffect } from 'react';
import { SUPABASE_URL, SUPABASE_KEY, headers, s } from './constants';

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [catForm, setCatForm] = useState({ name: '' });
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState(null);
  const [catUploading, setCatUploading] = useState(false);
  const [catMsg, setCatMsg] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?order=created_at.asc`, { headers });
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

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

  const addCategory = async () => {
    if (!catForm.name) { setCatMsg('❌ ক্যাটাগরির নাম দিন'); return; }
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

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e1b4b' }}>ক্যাটাগরি ব্যবস্থাপনা</h2>

      {catMsg && (
        <div style={{ background: catMsg.includes('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${catMsg.includes('✅') ? '#bbf7d0' : '#fecaca'}`, color: catMsg.includes('✅') ? '#16a34a' : '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {catMsg}
        </div>
      )}

      {/* Add Category Form */}
      <div style={{ ...s.card, marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#1e1b4b' }}>নতুন ক্যাটাগরি যোগ করুন</h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>ক্যাটাগরির নাম *</label>
          <input style={s.inp} placeholder="যেমন: খাদ্যশস্য, তেল, মশলা..." value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>ক্যাটাগরির ছবি</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {catImagePreview && <img src={catImagePreview} alt="preview" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid #e5e7eb' }} />}
            <label style={{ display: 'inline-block', padding: '10px 16px', background: '#f3f4f6', border: '2px dashed #d1d5db', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: '#6b7280' }}>
              📷 ছবি বেছে নিন
              <input type="file" accept="image/*" onChange={handleCatImageSelect} style={{ display: 'none' }} />
            </label>
            {catImageFile && <span style={{ fontSize: '12px', color: '#10b981' }}>✅ {catImageFile.name}</span>}
          </div>
        </div>

        <button style={{ ...s.btn, background: '#059669', opacity: catUploading ? 0.7 : 1 }} onClick={addCategory} disabled={catUploading}>
          {catUploading ? 'আপলোড হচ্ছে...' : '+ ক্যাটাগরি যোগ করুন'}
        </button>
      </div>

      {/* Categories List */}
      <div style={s.card}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#1e1b4b' }}>ক্যাটাগরি তালিকা ({categories.length})</h3>
        {categories.length === 0 && <p style={{ color: '#6b7280', fontSize: '13px' }}>কোনো ক্যাটাগরি নেই</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ border: '1.5px solid #f3f4f6', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cat.image_url
                  ? <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '28px' }}>📦</span>}
              </div>
              <span style={{ fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>{cat.name}</span>
              <button onClick={() => deleteCategory(cat.id)} style={{ ...s.btn, background: '#fee2e2', color: '#dc2626', padding: '5px 12px', fontSize: '12px' }}>
                🗑 মুছুন
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
