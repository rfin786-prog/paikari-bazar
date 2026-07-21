'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BannerTab() {
  const [banners, setBanners] = useState([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    const res = await fetch('/api/banners');
    const data = await res.json();
    setBanners(data);
  }

  async function handleUpload() {
    if (!file) return alert('ছবি সিলেক্ট করো');
    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(fileName, file);

    if (uploadError) {
      alert('আপলোড ব্যর্থ: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(fileName);

    await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: urlData.publicUrl,
        title,
        subtitle,
        link_url: linkUrl,
        sort_order: banners.length,
      }),
    });

    setTitle('');
    setSubtitle('');
    setLinkUrl('');
    setFile(null);
    setUploading(false);
    fetchBanners();
  }

  async function toggleActive(id, current) {
    await fetch(`/api/banners?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    });
    fetchBanners();
  }

  async function deleteBanner(id) {
    if (!confirm('মুছে ফেলবে?')) return;
    await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
    fetchBanners();
  }

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h2 style={{ fontFamily: 'var(--font-hind-siliguri)', marginBottom: '16px' }}>
        ব্যানার ম্যানেজমেন্ট
      </h2>

      <div style={{ background: '#1a1828', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <input
          placeholder="টাইটেল (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', marginBottom: '8px', padding: '8px' }}
        />
        <input
          placeholder="সাবটাইটেল (optional)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          style={{ width: '100%', marginBottom: '8px', padding: '8px' }}
        />
        <input
          placeholder="লিংক (optional, ক্লিক করলে যেখানে যাবে)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          style={{ width: '100%', marginBottom: '8px', padding: '8px' }}
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{ background: '#f59e0b', color: '#0f0e17', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
        >
          {uploading ? 'আপলোড হচ্ছে...' : 'ব্যানার যোগ করো'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {banners.map((b) => (
          <div key={b.id} style={{ background: '#1a1828', padding: '10px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <img src={b.image_url} alt="" style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
            <div style={{ flex: 1 }}>
              <div>{b.title || '(no title)'}</div>
              <small style={{ color: '#888' }}>{b.is_active ? 'Active' : 'Inactive'}</small>
            </div>
            <button onClick={() => toggleActive(b.id, b.is_active)} style={{ padding: '6px 10px' }}>
              {b.is_active ? 'বন্ধ করো' : 'চালু করো'}
            </button>
            <button onClick={() => deleteBanner(b.id)} style={{ padding: '6px 10px', color: 'red' }}>
              মুছো
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
