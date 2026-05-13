'use client';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { icon: '👕', name: 'পোশাক', count: '১২০০+', bg: '#fff3eb' },
  { icon: '🛒', name: 'মুদি পণ্য', count: '৮৫০+', bg: '#e8f5e9' },
  { icon: '📱', name: 'ইলেকট্রনিক্স', count: '৪৩০+', bg: '#e3f2fd' },
  { icon: '🏠', name: 'গৃহস্থালি', count: '৬৭০+', bg: '#fce4ec' },
  { icon: '🌾', name: 'কৃষি পণ্য', count: '৩২০+', bg: '#f1f8e9' },
  { icon: '🧴', name: 'সৌন্দর্য পণ্য', count: '২৮০+', bg: '#f3e5f5' },
  { icon: '👶', name: 'শিশু পণ্য', count: '১৯০+', bg: '#fff8e1' },
  { icon: '📦', name: 'প্যাকেজিং', count: '১৫০+', bg: '#e0f2f1' },
  { icon: '🔧', name: 'হার্ডওয়্যার', count: '২৪০+', bg: '#fbe9e7' },
  { icon: '🌿', name: 'অর্গানিক', count: '১১০+', bg: '#f9fbe7' },
];

export default function CategorySection() {
  const router = useRouter();
  return (
    <>
      <style>{`
        .cat-card { transition: border-color 0.2s, transform 0.2s; cursor: pointer; }
        .cat-card:hover { border-color: #ff6a00 !important; transform: translateY(-2px); }
      `}</style>
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>পণ্য বিভাগ</h2>
          <span style={{ fontSize: '13px', color: '#ff6a00', cursor: 'pointer' }} onClick={() => router.push('/products')}>সব দেখুন →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
          {CATEGORIES.map((cat, i) => (
            <div
              key={i}
              className="cat-card"
              onClick={() => router.push(`/products?cat=${encodeURIComponent(cat.name)}`)}
              style={{ background: '#fff', borderRadius: '10px', padding: '14px 10px', textAlign: 'center', border: '1px solid #eee' }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: cat.bg, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                {cat.icon}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#222', marginBottom: '3px' }}>{cat.name}</div>
              <div style={{ fontSize: '10px', color: '#999' }}>{cat.count} পণ্য</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
