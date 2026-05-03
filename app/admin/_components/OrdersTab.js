'use client';
import { useState, useEffect } from 'react';
import { SUPABASE_URL, headers, STATUS_OPTIONS, s } from './constants';

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?order=created_at.desc`, { headers });
    setOrders(await res.json());
  };

  const updateOrderStatus = async (id, status) => {
    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
    loadOrders();
  };

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e1b4b' }}>অর্ডার ব্যবস্থাপনা ({orders.length})</h2>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterStatus('all')}
          style={{ ...s.btn, background: filterStatus === 'all' ? '#1e1b4b' : '#e5e7eb', color: filterStatus === 'all' ? '#fff' : '#374151', padding: '6px 14px', fontSize: '12px' }}>
          সব ({orders.length})
        </button>
        {STATUS_OPTIONS.map(opt => {
          const count = orders.filter(o => o.status === opt.value).length;
          return (
            <button key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              style={{ ...s.btn, background: filterStatus === opt.value ? opt.color : opt.bg, color: filterStatus === opt.value ? '#fff' : opt.color, padding: '6px 14px', fontSize: '12px' }}>
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      <div style={s.card}>
        {filteredOrders.length === 0 && <p style={{ color: '#6b7280', fontSize: '13px' }}>কোনো অর্ডার নেই</p>}
        {filteredOrders.map(o => {
          const items = Array.isArray(o.items) ? o.items : [];
          const date = new Date(o.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
          const statusCfg = STATUS_OPTIONS.find(st => st.value === o.status) || STATUS_OPTIONS[0];
          const isExpanded = expandedOrder === o.id;

          return (
            <div key={o.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' }}>#{o.id?.slice(0, 8)?.toUpperCase()}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: statusCfg.bg, color: statusCfg.color }}>{statusCfg.label}</span>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>{o.shop_name || 'অজানা'}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{date} · {items.length} টি পণ্য · ৳{Number(o.total || 0).toLocaleString()}</div>

                  {/* Delivery address if available */}
                  {o.address && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>📍 {o.address}</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <select value={o.status || 'pending'} onChange={e => updateOrderStatus(o.id, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontFamily: 'Hind Siliguri, sans-serif', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
                    {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                    style={{ fontSize: '12px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {isExpanded ? '▲ কম দেখুন' : '▼ বিস্তারিত'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '12px', background: '#f9fafb', borderRadius: '10px', padding: '12px' }}>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: idx < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <span>{item.name} × {item.qty || item.quantity || 1}</span>
                      <span style={{ fontWeight: '600' }}>৳{Number(item.price * (item.qty || item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', paddingTop: '8px', marginTop: '4px', borderTop: '1px solid #e5e7eb' }}>
                    <span>মোট</span><span>৳{Number(o.total || 0).toLocaleString()}</span>
                  </div>
                  {o.note && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>📝 নোট: {o.note}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
