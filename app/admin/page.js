'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductsTab from './_components/ProductsTab';
import CategoriesTab from './_components/CategoriesTab';
import OrdersTab from './_components/OrdersTab';
import UsersTab from './_components/UsersTab';

const TABS = [
  { key: 'products',   label: 'পণ্য' },
  { key: 'categories', label: 'ক্যাটাগরি' },
  { key: 'orders',     label: 'অর্ডার' },
  { key: 'users',      label: 'গ্রাহক' },
];

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState('products');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'admin') { router.push('/login'); }
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Hind Siliguri, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background: '#1e1b4b', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '7px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', border: 'none', fontFamily: 'Hind Siliguri, sans-serif',
              background: tab === key ? 'rgba(255,255,255,.15)' : 'transparent',
              color: tab === key ? '#818cf8' : 'rgba(255,255,255,.6)',
            }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'rgba(255,255,255,.7)', fontSize: '13px' }}>Admin</span>
          <button onClick={logout} style={{
            background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none',
            padding: '7px 14px', borderRadius: '8px', fontFamily: 'Hind Siliguri, sans-serif',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
          }}>
            লগআউট
          </button>
        </div>
      </nav>

      {/* Tab Content */}
      <div style={{ padding: '24px' }}>
        {tab === 'products'   && <ProductsTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'orders'     && <OrdersTab />}
        {tab === 'users'      && <UsersTab />}
      </div>
    </div>
  );
}
