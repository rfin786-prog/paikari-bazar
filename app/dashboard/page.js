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
    <main style={{ minHeight: '100vh', background: '#1e1b4b', fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700' }}>পাইকারি বাজার — অ্যাডমিন</h1>
          <button
            onClick={() => router.push('/')}
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            হোমে যান
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['পণ্য', 'ক্যাটাগরি', 'দাম', 'ইউনিট', 'স্ট্যাটাস', 'অ্যাকশন'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '500' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 16px', color: '#fff', fontSize: '14px' }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{p.category}</td>
                  <td style={{ padding: '12px 16px', color: '#fff', fontSize: '14px' }}>
                    {editId === p.id ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        style={{ width: '80px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #6366f1', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px' }}
                      />
                    ) : (
                      `৳ ${p.price}`
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{p.unit}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: p.active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: p.active ? '#10b981' : '#ef4444' }}>
                      {p.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editId === p.id ? (
                        <button onClick={() => savePrice(p.id)} style={{ padding: '5px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>সেভ</button>
                      ) : (
                        <button onClick={() => startEdit(p)} style={{ padding: '5px 12px', background: 'rgba(99,102,241,0.3)', color: '#818cf8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>দাম পরিবর্তন</button>
                      )}
                      <button onClick={() => toggleActive(p.id)} style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        {p.active ? 'বন্ধ করুন' : 'চালু করুন'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
