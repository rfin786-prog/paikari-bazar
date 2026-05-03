'use client';
import { useState, useEffect } from 'react';
import { SUPABASE_URL, headers, s } from './constants';

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=created_at.desc`, { headers });
    setUsers(await res.json());
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.shop_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e1b4b' }}>গ্রাহক তালিকা ({users.length})</h2>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          style={{ ...s.inp, maxWidth: '360px' }}
          placeholder="🔍 নাম, ফোন বা দোকান খুঁজুন..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={s.card}>
        {filteredUsers.length === 0 && <p style={{ color: '#6b7280', fontSize: '13px' }}>কোনো গ্রাহক নেই</p>}
        {filteredUsers.map((u, idx) => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx < filteredUsers.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Avatar */}
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', color: '#6366f1' }}>
                {u.name?.charAt(0) || '?'}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{u.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{u.phone} {u.shop_name ? `| 🏪 ${u.shop_name}` : ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {u.wallet > 0 && (
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669', background: '#d1fae5', padding: '3px 10px', borderRadius: '20px' }}>
                  ৳{u.wallet}
                </span>
              )}
              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                {new Date(u.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
