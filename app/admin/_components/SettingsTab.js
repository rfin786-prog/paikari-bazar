'use client';
import { useState, useEffect } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SB_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export default function SettingsTab() {
  const [platformFee, setPlatformFee] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.platform_fee&select=value`, { headers: SB_HEADERS })
      .then(r => r.json())
      .then(data => { if (data[0]?.value) setPlatformFee(data[0].value); })
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
    setToast('Saved!');
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div>
      <h2 style={{ color: '#e8a020', fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>⚙️ Settings</h2>

      <div style={{ background: '#1a1828', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px', padding: '20px', maxWidth: '400px' }}>
        <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '8px', marginTop: 0 }}>Platform Fee</h3>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '12px', marginBottom: '16px', marginTop: 0 }}>
          Fixed fee added to every customer order.
        </p>

        <label style={{ color: 'rgba(255,255,255,.6)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Amount (৳)</label>
        <input
          type="number"
          value={platformFee}
          onChange={e => setPlatformFee(e.target.value)}
          placeholder="e.g. 10"
          min="0"
          style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: '#fff', fontSize: '16px', fontWeight: '700', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }}
        />

        <button
          onClick={save}
          disabled={saving || loading}
          style={{ width: '100%', padding: '11px', background: saving ? '#555' : '#e8a020', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {toast && (
          <div style={{ marginTop: '12px', background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', color: '#4ade80', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
            ✅ {toast}
          </div>
        )}
      </div>
    </div>
  );
}
