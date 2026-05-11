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

const emptyForm = {
  name: '',
  category_id: '',
  sub_category_id: '',
  cost_price: '',
  trade_price: '',
  mrp: '',
  discount_price: '',
  unit: 'কেজি',
  stock: '',
  moq: '1',
  max_qty: '',
};

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState([null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Load only parent categories
  const loadCategories = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?parent_id=is.null&order=created_at.asc`, { headers });
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  // Load sub-categories when category changes
  const loadSubCategories = async (categoryId) => {
    if (!categoryId) { setSubCategories([]); return; }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?parent_id=eq.${categoryId}&order=created_at.asc`, { headers });
    const data = await res.json();
    setSubCategories(Array.isArray(data) ? data : []);
  };

  const loadProducts = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?order=created_at.desc`, { headers });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  const handleCategoryChange = (categoryId) => {
    setForm({ ...form, category_id: categoryId, sub_category_id: '' });
    loadSubCategories(categoryId);
  };

  const handleImageSelect = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles[index] = file;
    newPreviews[index] = URL.createObjectURL(file);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles[index] = null;
    newPreviews[index] = null;
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/products/${fileName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': file.type,
      },
      body: file,
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;
  };

  // Profit calculation
  const calcProfit = () => {
    const cost = Number(form.cost_price);
    const sell = Number(form.trade_price);
    if (!cost || !sell) return null;
    return sell - cost;
  };

  const addProduct = async () => {
    if (!form.name || !form.trade_price) { setMsg('❌ নাম ও ট্রেড মূল্য দিন'); return; }
    setUploading(true);
    setMsg('');

    const [url1, url2, url3] = await Promise.all([
      uploadImage(imageFiles[0]),
      uploadImage(imageFiles[1]),
      uploadImage(imageFiles[2]),
    ]);

    const body = {
      name: form.name,
      category_id: form.category_id || null,
      sub_category_id: form.sub_category_id || null,
      cost_price: Number(form.cost_price) || 0,
      price: Number(form.trade_price),
      trade_price: Number(form.trade_price),
      mrp: Number(form.mrp) || 0,
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      unit: form.unit,
      stock: Number(form.stock) || 0,
      moq: Number(form.moq) || 1,
      max_qty: form.max_qty ? Number(form.max_qty) : null,
      active: true,
      image_url: url1,
      image_url_2: url2,
      image_url_3: url3,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(body),
    });

    setUploading(false);
    if (res.status === 201) {
      setMsg('✅ পণ্য যোগ হয়েছে');
      setForm(emptyForm);
      setImageFiles([null, null, null]);
      setImagePreviews([null, null, null]);
      setSubCategories([]);
      loadProducts();
    } else {
      const err = await res.json();
      setMsg('❌ সমস্যা হয়েছে: ' + (err?.message || ''));
    }
  };

  const toggleProduct = async (id, active) => {
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ active: !active }),
    });
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm('এই পণ্য মুছে ফেলবেন?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'DELETE', headers });
    loadProducts();
  };

  const profit = calcProfit();

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e1b4b' }}>পণ্য ব্যবস্থাপনা</h2>

      {msg && (
        <div style={{
          background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
          color: msg.includes('✅') ? '#16a34a' : '#dc2626',
          padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px',
        }}>
          {msg}
        </div>
      )}

      {/* Add Product Form */}
      <div style={{ ...s.card, marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#1e1b4b' }}>নতুন পণ্য যোগ করুন</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

          {/* Name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>পণ্যের নাম *</label>
            <input style={inp} placeholder="চাল (মিনিকেট)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>ক্যাটাগরি</label>
            <select style={inp} value={form.category_id} onChange={e => handleCategoryChange(e.target.value)}>
              <option value="">-- ক্যাটাগরি বেছে নিন --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Sub-category */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>সাব-ক্যাটাগরি</label>
            <select style={inp} value={form.sub_category_id} onChange={e => setForm({ ...form, sub_category_id: e.target.value })} disabled={!form.category_id}>
              <option value="">-- সাব-ক্যাটাগরি বেছে নিন --</option>
              {subCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>ইউনিট</label>
            <input style={inp} placeholder="৫০ কেজি বস্তা" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
          </div>

          {/* Stock */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>স্টক</label>
            <input style={inp} type="number" placeholder="500" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>

          {/* MOQ */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>MOQ (সর্বনিম্ন অর্ডার)</label>
            <input style={inp} type="number" placeholder="1" value={form.moq} onChange={e => setForm({ ...form, moq: e.target.value })} />
          </div>

          {/* Max Qty */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>সর্বোচ্চ অর্ডার (Max Qty)</label>
            <input style={inp} type="number" placeholder="100" value={form.max_qty} onChange={e => setForm({ ...form, max_qty: e.target.value })} />
          </div>
        </div>

        {/* Price Section */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e1b4b', marginBottom: '12px' }}>💰 মূল্য নির্ধারণ</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            {/* Cost Price */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>ক্রয় মূল্য (Cost Price) — admin only</label>
              <input style={{ ...inp, borderColor: '#fbbf24' }} type="number" placeholder="1000" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} />
            </div>

            {/* Trade Price */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>ট্রেড মূল্য (Trade Price) * — customer দেখবে</label>
              <input style={{ ...inp, borderColor: '#6366f1' }} type="number" placeholder="1200" value={form.trade_price} onChange={e => setForm({ ...form, trade_price: e.target.value })} />
            </div>

            {/* MRP */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>MRP</label>
              <input style={inp} type="number" placeholder="1500" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
            </div>

            {/* Discount Price */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>ডিসকাউন্ট মূল্য (optional)</label>
              <input style={{ ...inp, borderColor: '#10b981' }} type="number" placeholder="1150" value={form.discount_price} onChange={e => setForm({ ...form, discount_price: e.target.value })} />
            </div>
          </div>

          {/* Profit Display */}
          {profit !== null && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: profit >= 0 ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${profit >= 0 ? '#bbf7d0' : '#fecaca'}`,
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', fontWeight: '700',
              color: profit >= 0 ? '#16a34a' : '#dc2626',
            }}>
              {profit >= 0 ? '🟢' : '🔴'}
              প্রতি ইউনিটে {profit >= 0 ? 'লাভ' : 'লোকসান'}: ৳{Math.abs(profit)}
              {form.cost_price && (
                <span style={{ fontWeight: '400', color: '#6b7280', marginLeft: '8px' }}>
                  ({((Math.abs(profit) / Number(form.cost_price)) * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Image Upload — 3 slots */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px', color: '#374151' }}>পণ্যের ছবি (সর্বোচ্চ ৩টি)</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                {imagePreviews[i] ? (
                  <div style={{ position: 'relative' }}>
                    <img src={imagePreviews[i]} alt={`preview ${i + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #6366f1' }} />
                    <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ) : (
                  <label style={{ width: '80px', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', border: '2px dashed #d1d5db', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', color: '#9ca3af', gap: '4px' }}>
                    <span style={{ fontSize: '22px' }}>📷</span>
                    ছবি {i + 1}
                    <input type="file" accept="image/*" onChange={e => handleImageSelect(i, e)} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <button style={{ ...s.btn, opacity: uploading ? 0.7 : 1 }} onClick={addProduct} disabled={uploading}>
          {uploading ? '⏳ আপলোড হচ্ছে...' : '+ পণ্য যোগ করুন'}
        </button>
      </div>

      {/* Products List */}
      <div style={s.card}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#1e1b4b' }}>পণ্য তালিকা ({products.length})</h3>
        {products.length === 0 && <p style={{ color: '#6b7280', fontSize: '13px' }}>কোনো পণ্য নেই</p>}
        {products.map(p => {
          const cat = categories.find(c => c.id === p.category_id);
          const itemProfit = p.trade_price && p.cost_price ? p.trade_price - p.cost_price : null;
          return (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  : <div style={{ width: '52px', height: '52px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#9ca3af' }}>No img</div>
                }
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {cat ? cat.name : 'ক্যাটাগরি নেই'} | {p.unit} | স্টক: {p.stock}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Trade: ৳{p.trade_price || p.price}
                    {p.mrp ? ` | MRP: ৳${p.mrp}` : ''}
                    {p.discount_price ? ` | Discount: ৳${p.discount_price}` : ''}
                    {itemProfit !== null && (
                      <span style={{ marginLeft: '6px', color: itemProfit >= 0 ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
                        | {itemProfit >= 0 ? '🟢' : '🔴'} ৳{itemProfit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
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
