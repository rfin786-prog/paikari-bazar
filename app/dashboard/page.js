'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const STATUS = {
  pending:    { label: 'অপেক্ষমান',      color: '#d97706', bg: '#fef3c7' },
  processing: { label: 'প্রক্রিয়াধীন',   color: '#2563eb', bg: '#dbeafe' },
  shipped:    { label: 'পাঠানো হয়েছে',   color: '#7c3aed', bg: '#ede9fe' },
  delivered:  { label: 'ডেলিভারি হয়েছে', color: '#059669', bg: '#d1fae5' },
  cancelled:  { label: 'বাতিল',           color: '#dc2626', bg: '#fee2e2' },
};

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Address form
  const [address, setAddress] = useState({});
  const [addressMsg, setAddressMsg] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [passMsg, setPassMsg] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role === 'admin') { router.push('/admin'); return; }
    setUser(u);
    setAddress({
      shop_name: u.shop_name || '',
      phone: u.phone || '',
      district: u.district || '',
      thana: u.thana || '',
      address: u.address || '',
    });
    loadOrders(u.id);
  }, []);

  const loadOrders = async (userId) => {
    setOrdersLoading(true);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?user_id=eq.${userId}&order=created_at.desc`,
      { headers }
    );
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setOrdersLoading(false);
  };

  const saveAddress = async () => {
    setAddressLoading(true);
    setAddressMsg('');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify(address),
    });
    if (res.ok) {
      const updated = { ...user, ...address };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setAddressMsg('✅ ঠিকানা সেভ হয়েছে');
    } else {
      setAddressMsg('❌ সমস্যা হয়েছে');
    }
    setAddressLoading(false);
    setTimeout(() => setAddressMsg(''), 3000);
  };

  const changePassword = async () => {
    setPassMsg('');
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPassMsg('❌ সব ঘর পূরণ করুন'); return;
    }
    if (passwords.current !== user.password) {
      setPassMsg('❌ বর্তমান পাসওয়ার্ড ভুল'); return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPassMsg('❌ নতুন পাসওয়ার্ড মিলছে না'); return;
    }
    if (passwords.newPass.length < 6) {
      setPassMsg('❌ পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে'); return;
    }
    setPassLoading(true);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ password: passwords.newPass }),
    });
    if (res.ok) {
      const updated = { ...user, password: passwords.newPass };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setPasswords({ current: '', newPass: '', confirm: '' });
      setPassMsg('✅ পাসওয়ার্ড পরিবর্তন হয়েছে');
    } else {
      setPassMsg('❌ সমস্যা হয়েছে');
    }
    setPassLoading(false);
    setTimeout(() => setPassMsg(''), 3000);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    router.push('/login');
  };

  const s = {
    inp: {
      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
      borderRadius: '8px', fontSize: '14px', color: '#111827',
      fontFamily: 'Hind Siliguri, sans-serif', boxSizing: 'border-box', outline: 'none',
    },
    btn: {
      background: '#0f2442', color: '#fff', border: 'none',
      padding: '11px 24px', borderRadius: '9px', fontSize: '14px',
      fontWeight: '700', cursor: 'pointer', fontFamily: 'Hind Siliguri, sans-serif',
    },
    label: { fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '5px' },
    card: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Hind Siliguri, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background: '#0f2442', height: '60px', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', cursor: 'pointer' }} onClick={() => router.push('/products')}>
          পাইকারি<span style={{ color: '#e8a020' }}>বজার</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => router.push('/products')} style={{ background: '#e8a020', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            🛒 পণ্য দেখুন
          </button>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
            লগআউট
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>

        {/* User Info */}
        <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#0f2442', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff', fontWeight: '800', flexShrink: 0 }}>
            {user?.name?.[0] || user?.phone?.[0] || '?'}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '17px', color: '#111827' }}>{user?.name || 'ব্যবহারকারী'}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>{user?.phone} · {user?.shop_name}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#fff', padding: '6px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {[['orders', '📦 আমার অর্ডার'], ['address', '📍 ঠিকানা'], ['password', '🔒 পাসওয়ার্ড']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontSize: '13px',
              fontWeight: '700', cursor: 'pointer', fontFamily: 'Hind Siliguri, sans-serif',
              background: tab === t ? '#0f2442' : 'transparent',
              color: tab === t ? '#fff' : '#6b7280',
            }}>{l}</button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>⏳ লোড হচ্ছে...</div>
            ) : orders.length === 0 ? (
              <div style={{ ...s.card, textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
                <p>কোনো অর্ডার নেই</p>
                <button onClick={() => router.push('/products')} style={{ ...s.btn, marginTop: '12px' }}>পণ্য দেখুন</button>
              </div>
            ) : orders.map(order => {
              const items = Array.isArray(order.items) ? order.items : [];
              const st = STATUS[order.status] || STATUS.pending;
              const date = new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9ca3af' }}>#{order.id?.slice(0, 8)?.toUpperCase()}</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{date}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {items.slice(0, 3).map((item, i) => (
                          <span key={i} style={{ fontSize: '12px', background: '#f3f4f6', padding: '3px 10px', borderRadius: '20px', color: '#374151' }}>
                            {item.emoji || ''} {item.name} × {item.qty || item.quantity || 1}
                          </span>
                        ))}
                        {items.length > 3 && (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>+{items.length - 3} আরও</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: '800', fontSize: '18px', color: '#0f2442' }}>৳{Number(order.total || 0).toLocaleString()}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{items.length} টি পণ্য</div>
                    </div>
                  </div>

                  <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '13px', cursor: 'pointer', padding: '8px 0 0', fontFamily: 'Hind Siliguri, sans-serif' }}>
                    {isExpanded ? '▲ কম দেখুন' : '▼ বিস্তারিত দেখুন'}
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: '12px', background: '#f9fafb', borderRadius: '10px', padding: '12px' }}>
                      {items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: i < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <span style={{ color: '#111827', fontWeight: '500' }}>{item.emoji || ''} {item.name} × {item.qty || item.quantity || 1}</span>
                          <span style={{ fontWeight: '700', color: '#0f2442' }}>৳{(item.price * (item.qty || item.quantity || 1)).toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '14px', paddingTop: '10px', marginTop: '4px', borderTop: '1px solid #e5e7eb', color: '#111827' }}>
                        <span>মোট</span>
                        <span>৳{Number(order.total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Address Tab */}
        {tab === 'address' && (
          <div style={s.card}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f2442' }}>📍 ডেলিভারি ঠিকানা</h3>
            {addressMsg && (
              <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', background: addressMsg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: addressMsg.includes('✅') ? '#16a34a' : '#dc2626' }}>{addressMsg}</div>
            )}
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={s.label}>দোকানের নাম</label>
                <input style={s.inp} value={address.shop_name || ''} onChange={e => setAddress({ ...address, shop_name: e.target.value })} placeholder="দোকানের নাম" />
              </div>
              <div>
                <label style={s.label}>ফোন নম্বর</label>
                <input style={s.inp} value={address.phone || ''} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="01XXXXXXXXX" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={s.label}>জেলা</label>
                  <select style={s.inp} value={address.district || ''} onChange={e => setAddress({ ...address, district: e.target.value })}>
                    <option value="">জেলা বাছুন</option>
                    {['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'সিলেট', 'খুলনা', 'বরিশাল', 'ময়মনসিংহ', 'রংপুর'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>থানা</label>
                  <input style={s.inp} value={address.thana || ''} onChange={e => setAddress({ ...address, thana: e.target.value })} placeholder="থানা" />
                </div>
              </div>
              <div>
                <label style={s.label}>পূর্ণ ঠিকানা</label>
                <textarea style={{ ...s.inp, height: '80px', resize: 'none' }} value={address.address || ''} onChange={e => setAddress({ ...address, address: e.target.value })} placeholder="বাড়ি/রাস্তা/এলাকা" />
              </div>
              <button onClick={saveAddress} disabled={addressLoading} style={{ ...s.btn, opacity: addressLoading ? 0.7 : 1 }}>
                {addressLoading ? 'সেভ হচ্ছে...' : 'ঠিকানা সেভ করুন'}
              </button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div style={s.card}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f2442' }}>🔒 পাসওয়ার্ড পরিবর্তন</h3>
            {passMsg && (
              <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', background: passMsg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: passMsg.includes('✅') ? '#16a34a' : '#dc2626' }}>{passMsg}</div>
            )}
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={s.label}>বর্তমান পাসওয়ার্ড</label>
                <input type="password" style={s.inp} value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} placeholder="বর্তমান পাসওয়ার্ড" />
              </div>
              <div>
                <label style={s.label}>নতুন পাসওয়ার্ড</label>
                <input type="password" style={s.inp} value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" />
              </div>
              <div>
                <label style={s.label}>পাসওয়ার্ড নিশ্চিত করুন</label>
                <input type="password" style={s.inp} value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="আবার পাসওয়ার্ড দিন" />
              </div>
              <button onClick={changePassword} disabled={passLoading} style={{ ...s.btn, opacity: passLoading ? 0.7 : 1 }}>
                {passLoading ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
