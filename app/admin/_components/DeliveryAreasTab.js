'use client';
import { useState, useEffect } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const FONT = 'var(--font-hind-siliguri), sans-serif';

const s = {
  card: { background: '#1e1c2e', borderRadius: '14px', padding: '20px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' },
  input: { background: '#2a2840', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '14px', fontFamily: FONT, outline: 'none', width: '100%' },
  btn: { border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: FONT },
};

export default function DeliveryAreasTab() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ district: '', thana: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadAreas(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAreas = async () => {
    setLoading(true);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/delivery_areas?select=*&order=district.asc,thana.asc`, { headers });
    const data = await res.json();
    setAreas(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const addArea = async () => {
    if (!form.district.trim() || !form.thana.trim()) return showToast('জেলা ও থানা দিন', 'error');
    setSaving(true);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/delivery_areas`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ district: form.district.trim(), thana: form.thana.trim(), active: true }),
    });
    if (res.status === 201) {
      setForm({ district: '', thana: '' });
      showToast('✅ এলাকা যোগ হয়েছে');
      await loadAreas();
    } else {
      showToast('❌ সমস্যা হয়েছে', 'error');
    }
    setSaving(false);
  };

  const toggleActive = async (id, current) => {
    await fetch(`${SUPABASE_URL}/rest/v1/delivery_areas?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ active: !current }),
    });
    await loadAreas();
  };

  const deleteArea = async (id) => {
    if (!confirm('এই এলাকা মুছে ফেলবেন?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/delivery_areas?id=eq.${id}`, { method: 'DELETE', headers });
    showToast('🗑️ মুছে ফেলা হয়েছে');
    await loadAreas();
  };

  // Group by district
  const grouped = areas.reduce((acc, area) => {
    if (!acc[area.district]) acc[area.district] = [];
    acc[area.district].push(area);
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: FONT }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success' ? '#1a3a2a' : '#3a1a1a',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: toast.type === 'success' ? '#6ee7b7' : '#f87171',
          padding: '12px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
          fontFamily: FONT,
        }}>{toast.msg}</div>
      )}

      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '20px' }}>
        🗺️ ডেলিভারি এলাকা
      </h2>

      {/* Add Form */}
      <div style={s.card}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
          নতুন এলাকা যোগ করুন
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>জেলা</div>
            <input
              style={s.input}
              placeholder="যেমন: ঢাকা"
              value={form.district}
              onChange={e => setForm({ ...form, district: e.target.value })}
            />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>থানা / উপজেলা</div>
            <input
              style={s.input}
              placeholder="যেমন: মিরপুর"
              value={form.thana}
              onChange={e => setForm({ ...form, thana: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addArea()}
            />
          </div>
          <button
            onClick={addArea}
            disabled={saving}
            style={{ ...s.btn, background: '#818cf8', color: '#fff', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? '...' : '+ যোগ করুন'}
          </button>
        </div>
      </div>

      {/* Areas List */}
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.4)', padding: '20px' }}>লোড হচ্ছে...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ ...s.card, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px' }}>
          এখনো কোনো এলাকা যোগ করা হয়নি
        </div>
      ) : Object.entries(grouped).map(([district, thanas]) => (
        <div key={district} style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px' }}>📍</span>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{district}</span>
            <span style={{ fontSize: '11px', background: 'rgba(129,140,248,0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: '20px' }}>
              {thanas.length} টি থানা
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {thanas.map(area => (
              <div key={area.id} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: area.active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${area.active ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px', padding: '6px 10px',
              }}>
                <span style={{ fontSize: '13px', color: area.active ? '#6ee7b7' : 'rgba(255,255,255,0.35)', fontWeight: '600' }}>
                  {area.thana}
                </span>
                <button
                  onClick={() => toggleActive(area.id, area.active)}
                  title={area.active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '0', lineHeight: 1 }}
                >
                  {area.active ? '✅' : '⭕'}
                </button>
                <button
                  onClick={() => deleteArea(area.id)}
                  title="মুছুন"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#f87171', padding: '0', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
