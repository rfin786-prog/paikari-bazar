'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SB_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export default function AdminSettings() {
  const router = useRouter();
  const [platformFee, setPlatformFee] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.platform_fee&select=value`, { headers: SB_HEADERS })
      .then(r => r.json())
      .then(data => {
        if (data[0]?.value) setPlatformFee(data[0].value);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const num = parseFloat(platformFee);
    if (isNaN(num) || num < 0) { alert('Enter a valid amount.'); return; }
    setSaving(true);
    await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.platform_fee`, {
      method: 'PATCH',
      headers: SB_HEADERS,
      body: JSON.stringify({ value: String(num) }),
    });
    setSaving(false);
    setToast('Saved successfully!');
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.push('/admin/dashboard')} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>← Back</button>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111' }}>Settings</h1>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#111', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', marginTop: 0 }}>Platform Fee</h2>

          <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px', marginTop: 0 }}>
            This fee is added to every customer order automatically.
          </p>

          <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '8px' }}>Fee Amount (৳)</label>
          <input
            type="number"
            value={platformFee}
            onChange={e => setPlatformFee(e.target.value)}
            placeholder="e.g. 10"
            min="0"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', fontWeight: '700', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }}
          />

          <button
            onClick={save}
            disabled={saving || loading}
            style={{ width: '100%', padding: '12px', background: saving ? '#9ca3af' : '#111', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {toast && (
          <div style={{ marginTop: '16px', background: '#111', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
            ✅ {toast}
          </div>
        )}
      </div>
    </div>
  );
}
