'use client';
import { useState, useEffect, useCallback } from 'react';
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

const IMG_SIZE = 44;

export default function CategoriesTab() {
  const [parents, setParents] = useState([]);
  const [subs, setSubs] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success'); // 'success' | 'error'

  // Add parent form
  const [parentForm, setParentForm] = useState({ name: '' });
  const [parentImg, setParentImg] = useState(null);
  const [parentPreview, setParentPreview] = useState(null);
  const [parentLoading, setParentLoading] = useState(false);

  // Add sub form
  const [subForm, setSubForm] = useState({ name: '', parent_id: '' });
  const [subImg, setSubImg] = useState(null);
  const [subPreview, setSubPreview] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  // Edit — separate state for parent vs sub to avoid conflict
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', parent_id: '' });
  const [editImg, setEditImg] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete loading state
  const [deletingId, setDeletingId] = useState(null);

  // Auto-clear message after 4 seconds
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(''), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const showMsg = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
  };

  const loadAll = useCallback(async () => {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/categories?order=sort_order.asc,created_at.asc`,
      { headers }
    );
    const data = await res.json();
    if (!Array.isArray(data)) return;
    setParents(data.filter(c => !c.parent_id));
    setSubs(data.filter(c => !!c.parent_id));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const uploadImage = async (file) => {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const fileName = `cat_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/category-images/${fileName}`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': file.type,
        },
        body: file,
      }
    );
    if (!res.ok) {
      showMsg('❌ ছবি আপলোড হয়নি', 'error');
      return null;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/category-images/${fileName}`;
  };

  // ─── Add Parent ───────────────────────────────────────────────
  const addParent = async () => {
    if (!parentForm.name.trim()) { showMsg('❌ ক্যাটাগরির নাম দিন', 'error'); return; }
    setParentLoading(true);
    const image_url = await uploadImage(parentImg);
    if (parentImg && !image_url) { setParentLoading(false); return; } // upload failed
    const nextOrder = parents.length > 0 ? Math.max(...parents.map(p => p.sort_order ?? 0)) + 1 : 1;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ name: parentForm.name.trim(), image_url, parent_id: null, sort_order: nextOrder }),
    });
    setParentLoading(false);
    if (res.status === 201) {
      showMsg('✅ ক্যাটাগরি যোগ হয়েছে');
      setParentForm({ name: '' });
      setParentImg(null); setParentPreview(null);
      loadAll();
    } else {
      const err = await res.json().catch(() => ({}));
      showMsg(`❌ সমস্যা হয়েছে: ${err.message || err.details || res.status}`, 'error');
    }
  };

  // ─── Add Sub ──────────────────────────────────────────────────
  const addSub = async () => {
    if (!subForm.name.trim()) { showMsg('❌ সাব-ক্যাটাগরির নাম দিন', 'error'); return; }
    if (!subForm.parent_id) { showMsg('❌ প্যারেন্ট ক্যাটাগরি বেছে নিন', 'error'); return; }
    setSubLoading(true);
    const image_url = await uploadImage(subImg);
    if (subImg && !image_url) { setSubLoading(false); return; }
    const siblingCount = subs.filter(sc => sc.parent_id === subForm.parent_id).length;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        name: subForm.name.trim(),
        image_url,
        parent_id: subForm.parent_id,
        sort_order: siblingCount + 1,
      }),
    });
    setSubLoading(false);
    if (res.status === 201) {
      showMsg('✅ সাব-ক্যাটাগরি যোগ হয়েছে');
      setSubForm({ name: '', parent_id: '' });
      setSubImg(null); setSubPreview(null);
      loadAll();
    } else {
      const err = await res.json().catch(() => ({}));
      showMsg(`❌ সমস্যা হয়েছে: ${err.message || err.details || res.status}`, 'error');
    }
  };

  // ─── Edit ─────────────────────────────────────────────────────
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, parent_id: cat.parent_id || '' });
    setEditImg(null);
    setEditPreview(cat.image_url || null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', parent_id: '' });
    setEditImg(null);
    setEditPreview(null);
  };

  const saveEdit = async (cat) => {
    if (!editForm.name.trim()) return;
    setEditLoading(true);
    let image_url = cat.image_url;
    if (editImg) {
      const uploaded = await uploadImage(editImg);
      if (!uploaded) { setEditLoading(false); return; }
      image_url = uploaded;
    }
    const body = { name: editForm.name.trim(), image_url };
    // Allow moving sub to different parent
    if (cat.parent_id && editForm.parent_id) body.parent_id = editForm.parent_id;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${cat.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(body),
    });
    setEditLoading(false);
    if (res.ok) {
      cancelEdit();
      loadAll();
      showMsg('✅ আপডেট হয়েছে');
    } else {
      const err = await res.json().catch(() => ({}));
      showMsg(`❌ আপডেট হয়নি: ${err.message || err.details || res.status}`, 'error');
    }
  };

  // ─── Delete ───────────────────────────────────────────────────
  const deleteCategory = async (id, isParent = false) => {
    const confirmed = window.confirm(
      isParent
        ? 'এই ক্যাটাগরি এবং এর সব সাব-ক্যাটাগরি মুছে ফেলবেন?'
        : 'এই সাব-ক্যাটাগরি মুছে ফেলবেন?'
    );
    if (!confirmed) return;
    setDeletingId(id);

    try {
      // Delete sub-categories first if parent
      if (isParent) {
        const childIds = subs.filter(sc => sc.parent_id === id).map(sc => sc.id);
        for (const childId of childIds) {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${childId}`, {
            method: 'DELETE',
            headers: { ...headers, 'Prefer': 'return=representation' },
          });
          if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            if (err.code === '23503') {
              showMsg('❌ সাব-ক্যাটাগরিতে product আছে, আগে product সরান', 'error');
            } else {
              showMsg(`❌ সাব মুছতে সমস্যা: ${err.message || err.details || r.status}`, 'error');
            }
            setDeletingId(null);
            return;
          }
        }
      }

      const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`, {
        method: 'DELETE',
        headers: { ...headers, 'Prefer': 'return=representation' },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.code === '23503') {
          showMsg('❌ এই ক্যাটাগরিতে product আছে, আগে product সরান', 'error');
        } else {
          showMsg(`❌ মুছতে সমস্যা: ${err.message || err.details || res.status}`, 'error');
        }
        setDeletingId(null);
        return;
      }

      showMsg('✅ মুছে ফেলা হয়েছে');
      loadAll();
    } catch (e) {
      showMsg(`❌ Network error: ${e.message}`, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Reorder ──────────────────────────────────────────────────
  const reorder = async (list, id, direction) => {
    const idx = list.findIndex(item => item.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === list.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const a = list[idx];
    const b = list[swapIdx];

    const newOrderA = b.sort_order ?? swapIdx + 1;
    const newOrderB = a.sort_order ?? idx + 1;

    await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${a.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sort_order: newOrderA }),
      }),
      fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${b.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sort_order: newOrderB }),
      }),
    ]);
    loadAll();
  };

  // ─── UI Helpers ───────────────────────────────────────────────
  const imgBox = (url, size = IMG_SIZE) => (
    url
      ? <img src={url} alt="" style={{ width: size, height: size, objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb', flexShrink: 0 }} />
      : <div style={{ width: size, height: size, borderRadius: '8px', background: '#f3f4f6', border: '1px solid #e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: '18px' }}>📁</div>
  );

  const imagePickerLabel = (preview, onChange, label = 'ছবি') => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {preview && <img src={preview} alt="preview" style={{ width: IMG_SIZE, height: IMG_SIZE, objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f3f4f6', border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#6b7280' }}>
        📷 {label}
        <input type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
      </label>
    </div>
  );

  const OrderButtons = ({ list, id }) => {
    const idx = list.findIndex(item => item.id === id);
    const btnStyle = {
      width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #e5e7eb',
      background: '#f9fafb', cursor: 'pointer', fontSize: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#6b7280', flexShrink: 0,
    };
    const disabledStyle = { ...btnStyle, opacity: 0.3, cursor: 'not-allowed' };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
        <button
          style={idx === 0 ? disabledStyle : btnStyle}
          disabled={idx === 0}
          onClick={() => reorder(list, id, 'up')}
          title="উপরে নিয়ে যান"
        >▲</button>
        <button
          style={idx === list.length - 1 ? disabledStyle : btnStyle}
          disabled={idx === list.length - 1}
          onClick={() => reorder(list, id, 'down')}
          title="নিচে নিয়ে যান"
        >▼</button>
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e1b4b' }}>
        ক্যাটাগরি ব্যবস্থাপনা
      </h2>

      {msg && (
        <div style={{
          background: msgType === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${msgType === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: msgType === 'success' ? '#16a34a' : '#dc2626',
          padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px',
        }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* Add Parent */}
        <div style={s.card}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', color: '#1e1b4b' }}>নতুন ক্যাটাগরি</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>নাম *</label>
            <input
              style={inp}
              placeholder="যেমন: Grocery, Oil..."
              value={parentForm.name}
              onChange={e => setParentForm({ name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addParent()}
            />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', color: '#374151' }}>ছবি</label>
            {imagePickerLabel(parentPreview, e => { const f = e.target.files[0]; if (f) { setParentImg(f); setParentPreview(URL.createObjectURL(f)); } })}
          </div>
          <button
            style={{ ...s.btn, background: '#059669', opacity: parentLoading ? 0.7 : 1 }}
            onClick={addParent}
            disabled={parentLoading}
          >
            {parentLoading ? 'যোগ হচ্ছে...' : '+ ক্যাটাগরি যোগ করুন'}
          </button>
        </div>

        {/* Add Sub */}
        <div style={s.card}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', color: '#1e1b4b' }}>নতুন সাব-ক্যাটাগরি</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>প্যারেন্ট ক্যাটাগরি *</label>
            <select style={inp} value={subForm.parent_id} onChange={e => setSubForm({ ...subForm, parent_id: e.target.value })}>
              <option value="">-- বেছে নিন --</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#374151' }}>সাব-ক্যাটাগরি নাম *</label>
            <input
              style={inp}
              placeholder="যেমন: Rice, Lentil..."
              value={subForm.name}
              onChange={e => setSubForm({ ...subForm, name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addSub()}
            />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', color: '#374151' }}>ছবি</label>
            {imagePickerLabel(subPreview, e => { const f = e.target.files[0]; if (f) { setSubImg(f); setSubPreview(URL.createObjectURL(f)); } })}
          </div>
          <button
            style={{ ...s.btn, opacity: subLoading ? 0.7 : 1 }}
            onClick={addSub}
            disabled={subLoading}
          >
            {subLoading ? 'যোগ হচ্ছে...' : '+ সাব-ক্যাটাগরি যোগ করুন'}
          </button>
        </div>
      </div>

      {/* Category List */}
      <div style={s.card}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#1e1b4b' }}>
          ক্যাটাগরি তালিকা ({parents.length} ক্যাটাগরি, {subs.length} সাব-ক্যাটাগরি)
        </h3>

        {parents.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '13px' }}>কোনো ক্যাটাগরি নেই</p>
        )}

        {parents.map((cat, catIdx) => {
          const catSubs = subs.filter(sc => sc.parent_id === cat.id);
          return (
            <div key={cat.id} style={{ marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>

              {/* Parent Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                  {/* Order buttons for parent */}
                  <OrderButtons list={parents} id={cat.id} />

                  {/* Order badge */}
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '50%', background: '#e0e7ff',
                    color: '#4338ca', fontSize: '11px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {catIdx + 1}
                  </span>

                  {editingId === cat.id
                    ? <img src={editPreview || cat.image_url} alt="" style={{ width: IMG_SIZE, height: IMG_SIZE, objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    : imgBox(cat.image_url)
                  }

                  {editingId === cat.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        style={{ ...inp, width: '180px', padding: '6px 10px', fontSize: '13px' }}
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && saveEdit(cat)}
                      />
                      <label style={{ fontSize: '11px', color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}>
                        📷 ছবি পরিবর্তন
                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setEditImg(f); setEditPreview(URL.createObjectURL(f)); } }} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e1b4b' }}>{cat.name}</span>
                  )}
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>({catSubs.length} সাব)</span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {editingId === cat.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(cat)}
                        disabled={editLoading}
                        style={{ ...s.btn, background: '#059669', padding: '5px 12px', fontSize: '12px', opacity: editLoading ? 0.7 : 1 }}
                      >
                        {editLoading ? '...' : '✅ সেভ'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ ...s.btn, background: '#f3f4f6', color: '#374151', padding: '5px 12px', fontSize: '12px' }}
                      >
                        বাতিল
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        style={{ ...s.btn, background: '#ede9fe', color: '#6d28d9', padding: '5px 12px', fontSize: '12px' }}
                      >✏️</button>
                      <button
                        onClick={() => deleteCategory(cat.id, true)}
                        disabled={deletingId === cat.id}
                        style={{ ...s.btn, background: '#fee2e2', color: '#dc2626', padding: '5px 12px', fontSize: '12px', opacity: deletingId === cat.id ? 0.7 : 1 }}
                      >
                        {deletingId === cat.id ? '...' : '🗑'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Sub-category Rows */}
              {catSubs.length > 0 && (
                <div style={{ padding: '8px 14px 10px 14px', display: 'flex', flexDirection: 'column', gap: '6px', background: '#fff' }}>
                  {catSubs.map((sc, scIdx) => (
                    <div key={sc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#d1d5db', fontSize: '12px' }}>└</span>

                        {/* Order buttons for sub */}
                        <OrderButtons list={catSubs} id={sc.id} />

                        {/* Sub order badge */}
                        <span style={{
                          width: '20px', height: '20px', borderRadius: '50%', background: '#fef3c7',
                          color: '#d97706', fontSize: '10px', fontWeight: '700',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {scIdx + 1}
                        </span>

                        {editingId === sc.id
                          ? <img src={editPreview || sc.image_url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                          : imgBox(sc.image_url, 36)
                        }

                        {editingId === sc.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input
                              style={{ ...inp, width: '140px', padding: '5px 8px', fontSize: '13px' }}
                              value={editForm.name}
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && saveEdit(sc)}
                            />
                            {/* Allow changing parent */}
                            <select
                              style={{ ...inp, width: '140px', padding: '4px 8px', fontSize: '12px' }}
                              value={editForm.parent_id}
                              onChange={e => setEditForm({ ...editForm, parent_id: e.target.value })}
                            >
                              {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <label style={{ fontSize: '11px', color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}>
                              📷 ছবি পরিবর্তন
                              <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setEditImg(f); setEditPreview(URL.createObjectURL(f)); } }} style={{ display: 'none' }} />
                            </label>
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#374151' }}>{sc.name}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {editingId === sc.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(sc)}
                              disabled={editLoading}
                              style={{ ...s.btn, background: '#059669', padding: '4px 10px', fontSize: '11px', opacity: editLoading ? 0.7 : 1 }}
                            >
                              {editLoading ? '...' : '✅'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{ ...s.btn, background: '#f3f4f6', color: '#374151', padding: '4px 10px', fontSize: '11px' }}
                            >✕</button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(sc)}
                              style={{ ...s.btn, background: '#ede9fe', color: '#6d28d9', padding: '4px 10px', fontSize: '11px' }}
                            >✏️</button>
                            <button
                              onClick={() => deleteCategory(sc.id, false)}
                              disabled={deletingId === sc.id}
                              style={{ ...s.btn, background: '#fee2e2', color: '#dc2626', padding: '4px 10px', fontSize: '11px', opacity: deletingId === sc.id ? 0.7 : 1 }}
                            >
                              {deletingId === sc.id ? '...' : '🗑'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
