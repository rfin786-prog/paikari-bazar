'use client';
import { useRouter } from 'next/navigation';

const products = [
  { id: 1, name: 'চাল (মিনিকেট)', price: 65, unit: 'কেজি', category: 'শস্য' },
  { id: 2, name: 'ডাল (মসুর)', price: 120, unit: 'কেজি', category: 'শস্য' },
  { id: 3, name: 'সয়াবিন তেল', price: 175, unit: 'লিটার', category: 'তেল' },
  { id: 4, name: 'চিনি', price: 130, unit: 'কেজি', category: 'মশলা' },
  { id: 5, name: 'লবণ', price: 40, unit: 'কেজি', category: 'মশলা' },
  { id: 6, name: 'আটা', price: 55, unit: 'কেজি', category: 'শস্য' },
];

export default function Dashboard() {
  const router = useRouter();

  return (
    <main style={{ minHeight: '100vh', background: '#faf7f2', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#0f2442', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#e8a020', fontSize: '22px', fontWeight: '800', margin: 0 }}>পাইকারি বাজার</h1>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'transparent', border: '1px solid #e8a020', color: '#e8a020', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
          লগআউট
        </button>
      </div>

      {/* Welcome */}
      <div style={{ padding: '24px', background: '#fff', borderBottom: '1px solid #e0d8cc' }}>
        <h2 style={{ color: '#0f2442', fontSize: '20px', margin: 0 }}>স্বাগতম! 👋</h2>
        <p style={{ color: '#888', margin: '4px 0 0' }}>আজকের পণ্য তালিকা দেখুন</p>
      </div>

      {/* Products */}
      <div style={{ padding: '24px' }}>
        <h3 style={{ color: '#0f2442', marginBottom: '16px' }}>পণ্য তালিকা</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(15,36,66,0.08)', border: '1px solid #e0d8cc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ color: '#0f2442', margin: '0 0 4px', fontSize: '16px' }}>{p.name}</h4>
                  <span style={{ background: '#faf7f2', color: '#888', fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}>{p.category}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#e8a020', fontWeight: '800', fontSize: '20px' }}>৳{p.price}</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>প্রতি {p.unit}</div>
                </div>
              </div>
              <button style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#0f2442', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                অর্ডার করুন
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
