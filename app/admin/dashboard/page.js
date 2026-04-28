'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const initialProducts = [
  { id: 1, name: 'চাল (মিনিকেট)', price: 65, unit: 'কেজি', category: 'শস্য', active: true },
  { id: 2, name: 'ডাল (মসুর)', price: 120, unit: 'কেজি', category: 'শস্য', active: true },
  { id: 3, name: 'সয়াবিন তেল', price: 175, unit: 'লিটার', category: 'তেল', active: true },
  { id: 4, name: 'চিনি', price: 130, unit: 'কেজি', category: 'মশলা', active: true },
  { id: 5, name: 'লবণ', price: 40, unit: 'কেজি', category: 'মশলা', active: false },
  { id: 6, name: 'আটা', price: 55, unit: 'কেজি', category: 'শস্য', active: true },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editId, setEditId] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  const toggleActive = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setEditPrice(String(p.price));
  };

  const savePrice = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, price: Number(editPrice) } : p));
    setEditId(null);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#1e1b4b', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#12103a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#e8a020', fontSize: '22px', fontWeight: '800', margin: 0 }}>Admin Dashboard</h1>
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: '1px solid #e8a020', color: '#e8a020', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
          লগআউট
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '24px' }}>
        <div style={{ background: '#2d2a5e', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style={{ color: '#e8a020', fontSize: '32px', fontWeight: '800' }}>{products.length}</div>
          <div style={{ color: '#aaa', fontSize: '14px' }}>মোট পণ্য</div>
        </div>
        <div style={{ background: '#2d2a5e', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style={{ color: '#4ade80', fontSize: '32px', fontWeight: '800' }}>{products.filter(p => p.active).length}</div>
          <div style={{ color: '#aaa', fontSize: '14px' }}>সক্রিয় পণ্য</div>
        </div>
        <div style={{ background: '#2d2a5e', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style={{ color: '#f87171', fontSize: '32px', fontWeight: '800' }}>{products.filter(p => !p.active).length}</div>
          <div style={{ color: '#aaa', fontSize: '14px' }}>নিষ্ক্রিয় পণ্য</div>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        <h2 style={{ color: '#e8a020', marginBottom: '16px' }}>পণ্য ব্যবস্থাপনা</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#2d2a5e', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', opacity: p.active ? 1 : 0.6 }}>
              <div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>{p.name}</div>
                <div style={{ color: '#888', fontSize: '13px' }}>{p.category} - প্রতি {p.unit}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {editId === p.id ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e8a020', background: '#1e1b4b', color: '#fff', fontSize: '14px' }} />
                    <button onClick={() => savePrice(p.id)} style={{ padding: '6px 14px', background: '#e8a020', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>সেভ</button>
                    <button onClick={() => setEditId(null)} style={{ padding: '6px 14px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>বাতিল</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#e8a020', fontWeight: '800', fontSize: '18px' }}>Tk {p.price}</span>
                    <button onClick={() => startEdit(p)} style={{ padding: '6px 12px', background: '#3d3a6b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>দাম বদলান</button>
                  </div>
                )}
                <button onClick={() => toggleActive(p.id)} style={{ padding: '8px 16px', background: p.active ? '#f87171' : '#4ade80', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  {p.active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
