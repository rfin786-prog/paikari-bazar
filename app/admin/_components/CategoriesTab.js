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

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '' });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editUploading, setEditUploading] = useState(false);

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

  function handleEditImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file) {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const fileName = `cat_${Date.now()}.${ext}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/category-images/${fileName}`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/category-images/${fileName}`;
  }

  const addCategory = async () => {
    if (!catForm.name) { setCatMsg('❌ ক্যাটাগরির নাম দিন'); return; }
    setCatUploading(true);
    const image_url = await uploadImage(catImageFile);
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

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name });
    setEditImageFile(null);
    setEditImagePreview(cat.image_url || null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '' });
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const saveEdit = async (cat) => {
    if (!editForm.name) return;
    setEditUploading(true);
    let image_url = cat.image_url;
    if (editImageFile) {
      const uploaded = await uploadImage(editImageFile);
      if (uploaded) image_url = uploaded;
    }
    await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${cat.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ name: editForm.name, image_url }),
    });
    setEditUploading(false);
    cancelEdit();
    loadCategories();
    setCatMsg('✅ ক্যাটাগরি আপডেট হয়েছে');
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
            <div key={cat.id} style={{ border: `1.5px solid ${editingId === cat.id ? '#6366f1' : '#f3f4f6'}`, borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: editingId === cat.id ? '#f5f3ff' : 'white' }}>
              
              {/* Image */}
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(editingId === cat.id ? editImagePreview : cat.image_url)
                  ? <img src={editingId === cat.id ? editImagePreview : cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '28px' }}>📦</span>}
              </div>

              {/* Edit mode */}
              {editingId === cat.id ? (
                <>
                  <input
                    style={{ ...s.inp, fontSize: '13px', padding: '6px 8px', width: '100%', textAlign: 'center' }}
                    value={editForm.name}
                    onChange={e => setEditForm({ name: e.target.value })}
                  />
                  <label style={{ fontSize: '11px', color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}>
                    📷 ছবি বদলান
                    <input type="file" accept="image/*" onChange={handleEditImageSelect} style={{ display: 'none' }} />
                  </label>
                  <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                    <button
                      onClick={() => saveEdit(cat)}
                      disabled={editUploading}
                      style={{ ...s.btn, background: '#059669', color: 'white', padding: '5px 10px', fontSize: '12px', flex: 1, opacity: editUploading ? 0.7 : 1 }}>
                      {editUploading ? '...' : '✅ সেভ'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{ ...s.btn, background: '#f3f4f6', color: '#374151', padding: '5px 10px', fontSize: '12px', flex: 1 }}>
                      ✕
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span style={{ fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>{cat.name}</span>
                  <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                    <button
                      onClick={() => startEdit(cat)}
                      style={{ ...s.btn, background: '#ede9fe', color: '#6d28d9', padding: '5px 10px', fontSize: '12px', flex: 1 }}>
                      ✏️ এডিট
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      style={{ ...s.btn, background: '#fee2e2', color: '#dc2626', padding: '5px 10px', fontSize: '12px', flex: 1 }}>
                      🗑
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
