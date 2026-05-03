'use client';
import { useState, useEffect } from 'react';
import { SUPABASE_URL, headers, s } from './constants';

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({}); // { userId: { orderCount, totalSpent, lastOrder } }
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadUsers();
    loadOrders();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=created_at.desc`, { headers });
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  const loadOrders = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=user_id,total,created_at`, { headers });
    const orders = await res.json();
    if (!Array.isArray(orders)) return;

    const stats = {};
    orders.forEach(o => {
      if (!o.user_id) return;
      if (!stats[o.user_id]) stats[o.user_id] = { orderCount: 0, totalSpent: 0, lastOrder: null };
      stats[o.user_id].orderCount += 1;
      stats[o.user_id].totalSpent += parseFloat(o.total) || 0;
      if (!stats[o.user_id].lastOrder || new Date(o.created_at) > new Date(stats[o.user_id].lastOrder)) {
        stats[o.user_id].lastOrder = o.created_at;
      }
    });
    setUserStats(stats);
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`"${name}" কে মুছে ফেলবেন?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
      if (res.ok || res.status === 204) {
        showToast(`✅ "${name}" মুছে ফেলা হয়েছে`);
        await loadUsers();
      } else {
        showToast('❌ মুছতে ব্যর্থ হয়েছে', 'error');
      }
    } catch {
      showToast('❌ নেটওয়ার্ক সমস্যা', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.shop_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1.5px solid ${toast.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
          color: toast.type === 'success' ? '#065f46' : '#991b1b',
          padding: '12px 18px', borderRadius: '12px', fontSize: '14px',
          fontFamily: 'Hind Siliguri, sans-serif', fontWeight: '600',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}>
          {toast.message}
        </div>
      )}

      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e1b4b' }}>
        গ্রাহক তালিকা ({users.length})
      </h2>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          style={{ ...s.inp, maxWidth: '360px' }}
          placeholder="🔍 নাম, ফোন বা দোকান খুঁজুন..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* User Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredUsers.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '13px' }}>কোনো গ্রাহক নেই</p>
        )}

        {filteredUsers.map(u => {
          const stat = userStats[u.id] || { orderCount: 0, totalSpent: 0, lastOrder: null };
          const joinDate = new Date(u.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
          const lastOrderDate = stat.lastOrder
            ? new Date(stat.lastOrder).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })
            : null;
          const isDeleting = deletingId === u.id;
          const avatarLetter = u.name?.charAt(0)?.toUpperCase() || '?';

          return (
            <div key={u.id} style={{
              background: '#fff',
              border: '1.5px solid #e5e7eb',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              opacity: isDeleting ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}>
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  {/* Avatar */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: '#ede9fe', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: '700', fontSize: '17px',
                    color: '#6366f1', flexShrink: 0,
                  }}>
                    {avatarLetter}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    {/* Name */}
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>
                      {u.name || 'অজানা'}
                    </div>
                    {/* Phone + Shop */}
                    <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>
                      📞 {u.phone}
                      {u.shop_name && (
                        <span style={{ marginLeft: '8px' }}>🏪 {u.shop_name}</span>
                      )}
                    </div>
                    {/* Join date */}
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                      যোগ দিয়েছেন: {joinDate}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => deleteUser(u.id, u.name)}
                  disabled={isDeleting}
                  style={{
                    background: 'none', border: '1.5px solid #fee2e2',
                    color: '#ef4444', borderRadius: '8px',
                    padding: '5px 10px', fontSize: '12px', cursor: 'pointer',
                    fontFamily: 'Hind Siliguri, sans-serif', fontWeight: '600',
                    flexShrink: 0,
                  }}>
                  🗑️ মুছুন
                </button>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap',
              }}>
                {/* Order count */}
                <div style={{
                  background: '#f0f9ff', border: '1px solid #bae6fd',
                  borderRadius: '8px', padding: '5px 10px',
                  fontSize: '12px', color: '#0369a1', fontWeight: '600',
                }}>
                  🛒 {stat.orderCount} টি অর্ডার
                </div>

                {/* Total spent */}
                {stat.totalSpent > 0 && (
                  <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: '8px', padding: '5px 10px',
                    fontSize: '12px', color: '#15803d', fontWeight: '600',
                  }}>
                    💰 ৳{stat.totalSpent.toLocaleString()}
                  </div>
                )}

                {/* Wallet */}
                {u.wallet > 0 && (
                  <div style={{
                    background: '#fefce8', border: '1px solid #fde68a',
                    borderRadius: '8px', padding: '5px 10px',
                    fontSize: '12px', color: '#92400e', fontWeight: '600',
                  }}>
                    👛 ওয়ালেট ৳{u.wallet}
                  </div>
                )}

                {/* Last order */}
                {lastOrderDate && (
                  <div style={{
                    background: '#faf5ff', border: '1px solid #e9d5ff',
                    borderRadius: '8px', padding: '5px 10px',
                    fontSize: '12px', color: '#7e22ce', fontWeight: '600',
                  }}>
                    🕐 সর্বশেষ: {lastOrderDate}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
