'use client';
import { useEffect, useState } from 'react';

const FONT = 'var(--font-hind-siliguri), sans-serif';

const CATEGORIES = [
  'Food & Grocery', 'খাদ্যশস্য', 'Dal & Lentils', 'Oil & Ghee',
  'Sugar & Salt', 'কোমল পানীয়', 'Snacks', 'Beverages',
  'Personal Care', 'Household', 'Stationery', 'Electronics',
];

const UNITS = ['পিস', 'ডজন', 'কেজি', 'গ্রাম', 'লিটার', 'মিলি', 'বস্তা', 'প্যাকেট', 'কার্টন', 'বাক্স'];

const EMPTY_FORM = {
  name: '', emoji: '📦', category: '', price: '', mrp: '',
  cost_price: '', trade_price: '', discount_price: '',
  unit: '', stock: '', moq: '1', max_qty: '',
  image_url: '', description: '', brand: '', sku: '', weight: '', active: true,
};

const C = {
  bg: '#0f0e17',
  surface: '#1a1828',
  surfaceHover: '#201e30',
  border: 'rgba(255,255,255,.08)',
  borderFocus: '#f59e0b',
  amber: '#f59e0b',
  amberHover: '#fbbf24',
  amberText: '#0f0e17',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,.55)',
  textLabel: 'rgba(255,255,255,.8)',
  green: '#34d399',
  red: '#f87171',
  input: '#12111f',
};

function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          padding: '12px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600,
          fontFamily: FONT, boxShadow: '0 4px 20px rgba(0,0,0,.4)',
          background: t.type === 'success' ? C.amber : C.red,
          color: t.type === 'success' ? C.amberText : '#fff',
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.textLabel, fontFamily: FONT }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: C.input,
  border: `1px solid rgba(255,255,255,.15)`,
  borderRadius: 10,
  padding: '10px 14px',
  color: C.text,
  fontSize: 15,
  fontFamily: FONT,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [toasts, setToasts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dynCats, setDynCats] = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const toast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, bRes] = await Promise.all([fetch('/api/products'), fetch('/api/brands')]);
      const pData = await pRes.json();
      const bData = await bRes.json();
      setProducts(pData || []);
      setBrands(bData || []);
      setDynCats([...new Set((pData || []).map((p) => p.category).filter(Boolean))]);
    } catch { toast('ডেটা লোড ব্যর্থ', 'error'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAdd = () => { setFormData(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (p) => {
    setFormData({
      name: p.name || '', emoji: p.emoji || '📦', category: p.category || '',
      price: p.price || '', mrp: p.mrp || '', cost_price: p.cost_price || '',
      trade_price: p.trade_price || '', discount_price: p.discount_price || '',
      unit: p.unit || '', stock: p.stock || '', moq: p.moq || '1',
      max_qty: p.max_qty || '', image_url: p.image_url || '',
      description: p.description || '', brand: p.brand || '',
      sku: p.sku || '', weight: p.weight || '', active: p.active !== false,
    });
    setEditId(p.id); setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) { toast('নাম ও দাম আবশ্যক', 'error'); return; }
    setSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/products?id=${editId}` : '/api/products';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error();
      toast(editId ? 'পণ্য আপডেট হয়েছে ✓' : 'পণ্য যোগ হয়েছে ✓');
      setShowForm(false); setEditId(null); fetchAll();
    } catch { toast('সংরক্ষণ ব্যর্থ', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast('পণ্য মুছে ফেলা হয়েছে'); setConfirmDelete(null); fetchAll();
    } catch { toast('মুছতে ব্যর্থ', 'error'); }
    finally { setDeleting(null); }
  };

  const toggleActive = async (p) => {
    try {
      const res = await fetch(`/api/products?id=${p.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, active: !p.active }),
      });
      if (!res.ok) throw new Error();
      toast(p.active ? 'নিষ্ক্রিয় করা হয়েছে' : 'সক্রিয় করা হয়েছে'); fetchAll();
    } catch { toast('আপডেট ব্যর্থ', 'error'); }
  };

  const allCats = [...new Set([...CATEGORIES, ...dynCats])];
  const filtered = products.filter((p) => {
    const s = p.name?.toLowerCase().includes(search.toLowerCase());
    const c = filterCat ? p.category === filterCat : true;
    return s && c;
  });

  return (
    <div style={{ fontFamily: FONT, color: C.text, minHeight: '100%' }}>
      <Toast toasts={toasts} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.amber, fontFamily: FONT }}>পণ্য ব্যবস্থাপনা</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMuted, fontFamily: FONT }}>{products.length}টি পণ্য মোট</p>
        </div>
        <button onClick={openAdd} style={{
          background: C.amber, color: C.amberText, border: 'none',
          padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          fontFamily: FONT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          + নতুন পণ্য যোগ
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="🔍 পণ্য খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ ...inputStyle, width: 200 }}>
          <option value="">সব ক্যাটাগরি</option>
          {allCats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.amber, fontSize: 24 }}>⏳</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontFamily: FONT }}>কোনো পণ্য পাওয়া যায়নি</div>
      ) : (
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['পণ্য', 'ক্যাটাগরি', 'দাম', 'স্টক', 'স্ট্যাটাস', 'অ্যাকশন'].map((h) => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: h === 'দাম' || h === 'স্টক' ? 'right' : h === 'স্ট্যাটাস' || h === 'অ্যাকশন' ? 'center' : 'left',
                    fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase',
                    letterSpacing: '0.05em', fontFamily: FONT,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHover}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 8, background: C.input,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0, overflow: 'hidden',
                      }}>
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover' }} />
                          : (p.emoji || '📦')}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT }}>{p.name}</div>
                        {p.unit && <div style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT }}>{p.unit}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textMuted, fontFamily: FONT }}>{p.category || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.amber, fontFamily: FONT }}>৳{p.price}</div>
                    {p.mrp > 0 && <div style={{ fontSize: 11, color: C.textMuted, textDecoration: 'line-through', fontFamily: FONT }}>৳{p.mrp}</div>}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{
                      fontSize: 14, fontWeight: 600, fontFamily: FONT,
                      color: p.stock > 10 ? C.green : p.stock > 0 ? '#fbbf24' : C.red,
                    }}>{p.stock ?? 0}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button onClick={() => toggleActive(p)} style={{
                      padding: '4px 12px', borderRadius: 20, border: 'none',
                      fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: 'pointer',
                      background: p.active ? 'rgba(52,211,153,.12)' : 'rgba(255,255,255,.07)',
                      color: p.active ? C.green : C.textMuted,
                    }}>
                      {p.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button onClick={() => openEdit(p)} style={{
                        background: 'rgba(245,158,11,.1)', border: 'none', color: C.amber,
                        padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                      }}>✏️</button>
                      <button onClick={() => setConfirmDelete(p)} style={{
                        background: 'rgba(248,113,113,.1)', border: 'none', color: C.red,
                        padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                      }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 1000,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: 24, overflowY: 'auto',
        }}>
          <div style={{
            background: '#1a1828', border: `1px solid rgba(255,255,255,.1)`,
            borderRadius: 16, width: '100%', maxWidth: 680, marginTop: 24, marginBottom: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,.6)',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: `1px solid rgba(255,255,255,.08)`,
            }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.amber, fontFamily: FONT }}>
                {editId ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditId(null); }} style={{
                background: 'none', border: 'none', color: C.textMuted,
                fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0,
              }}>×</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Name + Emoji */}
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="পণ্যের নাম *" style={{ flex: 1 }}>
                  <input name="name" value={formData.name} onChange={handleChange}
                    placeholder="যেমন: মসুর ডাল" style={{ ...inputStyle }} />
                </Field>
                <Field label="ইমোজি">
                  <input name="emoji" value={formData.emoji} onChange={handleChange}
                    style={{ ...inputStyle, width: 70, textAlign: 'center', fontSize: 20 }} />
                </Field>
              </div>

              {/* Category + Unit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="ক্যাটাগরি">
                  <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                    <option value="">নির্বাচন করুন</option>
                    {allCats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="একক (Unit)">
                  <select name="unit" value={formData.unit} onChange={handleChange} style={inputStyle}>
                    <option value="">নির্বাচন করুন</option>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </Field>
              </div>

              {/* Prices */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { name: 'price', label: 'বিক্রয় মূল্য *' },
                  { name: 'mrp', label: 'MRP' },
                  { name: 'cost_price', label: 'ক্রয় মূল্য' },
                  { name: 'trade_price', label: 'ট্রেড প্রাইস' },
                  { name: 'discount_price', label: 'ডিসকাউন্ট প্রাইস' },
                ].map((f) => (
                  <Field key={f.name} label={f.label}>
                    <input type="number" name={f.name} value={formData[f.name]}
                      onChange={handleChange} placeholder="০" style={inputStyle} />
                  </Field>
                ))}
              </div>

              {/* Stock / MOQ / MaxQty */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { name: 'stock', label: 'স্টক' },
                  { name: 'moq', label: 'মিনিমাম অর্ডার' },
                  { name: 'max_qty', label: 'সর্বোচ্চ পরিমাণ' },
                ].map((f) => (
                  <Field key={f.name} label={f.label}>
                    <input type="number" name={f.name} value={formData[f.name]}
                      onChange={handleChange} placeholder="০" style={inputStyle} />
                  </Field>
                ))}
              </div>

              {/* Brand / SKU / Weight */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <Field label="ব্র্যান্ড">
                  <select name="brand" value={formData.brand} onChange={handleChange} style={inputStyle}>
                    <option value="">নির্বাচন করুন</option>
                    {brands.map((b) => <option key={b._id || b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="SKU">
                  <input name="sku" value={formData.sku} onChange={handleChange}
                    placeholder="SKU-001" style={inputStyle} />
                </Field>
                <Field label="ওজন">
                  <input name="weight" value={formData.weight} onChange={handleChange}
                    placeholder="500g" style={inputStyle} />
                </Field>
              </div>

              {/* Image URL */}
              <Field label="ছবির URL">
                <input name="image_url" value={formData.image_url} onChange={handleChange}
                  placeholder="https://..." style={inputStyle} />
                {formData.image_url && (
                  <img src={formData.image_url} alt="preview"
                    style={{ marginTop: 8, width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.border}` }} />
                )}
              </Field>

              {/* Description */}
              <Field label="বিবরণ">
                <textarea name="description" value={formData.description} onChange={handleChange}
                  rows={3} placeholder="পণ্যের বিবরণ লিখুন..."
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </Field>

              {/* Active toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div
                  onClick={() => setFormData((p) => ({ ...p, active: !p.active }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12, position: 'relative',
                    background: formData.active ? C.amber : 'rgba(255,255,255,.15)',
                    transition: 'background .2s', cursor: 'pointer',
                  }}>
                  <div style={{
                    position: 'absolute', top: 3, left: formData.active ? 22 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.3)',
                  }} />
                </div>
                <span style={{ fontSize: 14, color: C.textLabel, fontFamily: FONT }}>পণ্য সক্রিয় রাখুন</span>
              </label>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex', gap: 12, padding: '16px 24px',
              borderTop: `1px solid rgba(255,255,255,.08)`,
            }}>
              <button onClick={() => { setShowForm(false); setEditId(null); }} style={{
                flex: 1, padding: '11px 0', borderRadius: 10,
                border: `1px solid rgba(255,255,255,.15)`, background: 'none',
                color: C.textMuted, fontSize: 14, fontWeight: 600, fontFamily: FONT, cursor: 'pointer',
              }}>বাতিল</button>
              <button onClick={handleSubmit} disabled={saving} style={{
                flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
                background: saving ? 'rgba(245,158,11,.5)' : C.amber,
                color: C.amberText, fontSize: 14, fontWeight: 700, fontFamily: FONT, cursor: 'pointer',
              }}>
                {saving ? 'সংরক্ষণ হচ্ছে...' : editId ? 'আপডেট করুন' : 'পণ্য সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: '#1a1828', border: '1px solid rgba(248,113,113,.3)',
            borderRadius: 16, padding: 28, maxWidth: 360, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,.6)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: C.text, fontFamily: FONT }}>পণ্য মুছবেন?</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: C.textMuted, fontFamily: FONT }}>
              "{confirmDelete.name}" স্থায়ীভাবে মুছে যাবে।
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                border: `1px solid rgba(255,255,255,.15)`, background: 'none',
                color: C.textMuted, fontSize: 14, fontWeight: 600, fontFamily: FONT, cursor: 'pointer',
              }}>বাতিল</button>
              <button onClick={() => handleDelete(confirmDelete.id)} disabled={deleting === confirmDelete.id} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                background: C.red, color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: FONT, cursor: 'pointer', opacity: deleting === confirmDelete.id ? 0.6 : 1,
              }}>
                {deleting === confirmDelete.id ? 'মুছছে...' : 'হ্যাঁ, মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
