'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function ImageDropzone({ file, onFileSelect, previewUrl, height = '160px' }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const preview = file ? URL.createObjectURL(file) : previewUrl;

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFileSelect(f);
        }}
        style={{
          height,
          borderRadius: '10px',
          border: `2px dashed ${dragOver ? '#e8a020' : 'rgba(255,255,255,0.2)'}`,
          background: dragOver ? 'rgba(232,160,32,0.06)' : 'rgba(255,255,255,0.02)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all .15s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
          style={{ display: 'none' }}
        />
        {preview ? (
          <>
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', bottom: '8px', right: '8px',
              background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px',
              padding: '4px 10px', borderRadius: '6px', fontWeight: '600',
            }}>
              Click to change image
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>🖼️</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>Click to select image</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>or drag and drop here</div>
          </div>
        )}
      </div>
      <div style={{
        fontSize: '11px', color: 'rgba(255,255,255,0.45)',
        marginTop: '6px', marginBottom: '12px', lineHeight: 1.5,
      }}>
        Size: <strong style={{ color: 'rgba(255,255,255,0.65)' }}>1920 × 350px</strong> (landscape, ratio ~5.5:1) —
        JPG/PNG, under 500KB loads fastest. A banner made for a different ratio will get cropped on the sides.
      </div>
    </div>
  );
}

export default function BannerTab() {
  const [banners, setBanners] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  }

  async function fetchBanners() {
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setBanners(data || []);
    } catch (err) {
      showMessage('error', 'ব্যানার লোড করতে ব্যর্থ: ' + err.message);
    } finally {
      setLoadingList(false);
    }
  }

  async function handleUpload() {
    if (!file) return showMessage('error', 'আগে একটা ছবি সিলেক্ট করো');
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('banners').getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('banners').insert([{
        image_url: urlData.publicUrl,
        title: title || null,
        subtitle: subtitle || null,
        link_url: linkUrl || null,
        is_active: true,
        sort_order: banners.length,
      }]);
      if (insertError) throw insertError;

      setTitle('');
      setSubtitle('');
      setLinkUrl('');
      setFile(null);
      showMessage('success', 'ব্যানার যোগ হয়েছে ✅');
      fetchBanners();
    } catch (err) {
      showMessage('error', 'ব্যানার যোগ করতে ব্যর্থ: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function toggleActive(id, current) {
    const { error } = await supabase.from('banners').update({ is_active: !current }).eq('id', id);
    if (error) return showMessage('error', 'ব্যর্থ: ' + error.message);
    showMessage('success', !current ? 'ব্যানার চালু হয়েছে' : 'ব্যানার বন্ধ হয়েছে');
    fetchBanners();
  }

  async function deleteBanner(id) {
    if (!confirm('এই ব্যানারটা মুছে ফেলতে চাও?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) return showMessage('error', 'মুছতে ব্যর্থ: ' + error.message);
    showMessage('success', 'ব্যানার মুছে ফেলা হয়েছে');
    fetchBanners();
  }

  function startEdit(banner) {
    setEditingId(banner.id);
    setEditTitle(banner.title || '');
    setEditSubtitle(banner.subtitle || '');
    setEditLinkUrl(banner.link_url || '');
    setEditFile(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFile(null);
  }

  async function saveEdit(banner) {
    setSavingEdit(true);
    try {
      let imageUrl = banner.image_url;
      if (editFile) {
        const fileName = `${Date.now()}-${editFile.name}`;
        const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, editFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('banners').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('banners')
        .update({
          title: editTitle || null,
          subtitle: editSubtitle || null,
          link_url: editLinkUrl || null,
          image_url: imageUrl,
        })
        .eq('id', banner.id);
      if (error) throw error;

      showMessage('success', 'ব্যানার আপডেট হয়েছে ✅');
      setEditingId(null);
      setEditFile(null);
      fetchBanners();
    } catch (err) {
      showMessage('error', 'আপডেট ব্যর্থ: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  const inputStyle = {
    width: '100%',
    marginBottom: '8px',
    padding: '9px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: '#0f0e17',
    color: '#fff',
    fontSize: '13px',
  };

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h2 style={{ fontFamily: 'var(--font-hind-siliguri)', marginBottom: '16px' }}>
        ব্যানার ম্যানেজমেন্ট
      </h2>

      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px', marginBottom: '14px',
          fontSize: '13px', fontWeight: '600',
          background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          color: message.type === 'success' ? '#4ade80' : '#f87171',
          border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          {message.text}
        </div>
      )}

      <div style={{ background: '#1a1828', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#e8a020' }}>
          নতুন ব্যানার যোগ করো
        </div>

        <ImageDropzone file={file} onFileSelect={setFile} />

        <input placeholder="টাইটেল (optional)" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        <input placeholder="সাবটাইটেল (optional)" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={inputStyle} />
        <input placeholder="লিংক (optional, ক্লিক করলে যেখানে যাবে)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} style={inputStyle} />

        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            background: uploading ? '#8a6415' : '#e8a020', color: '#0f0e17',
            padding: '9px 18px', border: 'none', borderRadius: '6px',
            fontWeight: '700', fontSize: '13px', cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? 'আপলোড হচ্ছে...' : '+ ব্যানার যোগ করো'}
        </button>
      </div>

      <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'rgba(255,255,255,0.6)' }}>
        সব ব্যানার ({banners.length})
      </div>

      {loadingList ? (
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>লোড হচ্ছে...</div>
      ) : banners.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '20px', textAlign: 'center', background: '#1a1828', borderRadius: '8px' }}>
          এখনো কোনো ব্যানার যোগ করা হয়নি
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {banners.map((b) => (
            <div key={b.id} style={{ background: '#1a1828', padding: '12px', borderRadius: '8px' }}>
              {editingId === b.id ? (
                <div>
                  <ImageDropzone file={editFile} onFileSelect={setEditFile} previewUrl={b.image_url} height="140px" />
                  <input placeholder="টাইটেল" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />
                  <input placeholder="সাবটাইটেল" value={editSubtitle} onChange={(e) => setEditSubtitle(e.target.value)} style={inputStyle} />
                  <input placeholder="লিংক" value={editLinkUrl} onChange={(e) => setEditLinkUrl(e.target.value)} style={inputStyle} />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button onClick={() => saveEdit(b)} disabled={savingEdit} style={{ background: '#e8a020', color: '#0f0e17', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                      {savingEdit ? 'সেভ হচ্ছে...' : 'সেভ করো'}
                    </button>
                    <button onClick={cancelEdit} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <img src={b.image_url} alt="" style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{b.title || '(কোনো টাইটেল নেই)'}</div>
                    <small style={{ color: b.is_active ? '#4ade80' : '#f87171' }}>
                      {b.is_active ? '● সক্রিয়' : '○ নিষ্ক্রিয়'}
                    </small>
                  </div>
                  <button onClick={() => startEdit(b)} style={{ padding: '7px 12px', background: 'rgba(232,160,32,0.15)', color: '#e8a020', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    এডিট
                  </button>
                  <button onClick={() => toggleActive(b.id, b.is_active)} style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    {b.is_active ? 'বন্ধ করো' : 'চালু করো'}
                  </button>
                  <button onClick={() => deleteBanner(b.id)} style={{ padding: '7px 12px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    মুছো
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
