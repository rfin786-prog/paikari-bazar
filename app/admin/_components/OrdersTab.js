'use client';
import { useState, useEffect, useRef } from 'react';
import { SUPABASE_URL, headers, STATUS_OPTIONS, s } from './constants';

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null); // { message, type }
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrders = async () => {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?select=*,users(name,phone,shop_name)&order=created_at.desc`,
      { headers }
    );
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  };

  const updateOrderStatus = async (id, status, shopName) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      if (res.ok || res.status === 204) {
        const statusCfg = STATUS_OPTIONS.find(st => st.value === status);
        showToast(`✅ "${shopName || 'অর্ডার'}" → ${statusCfg?.label || status}`, 'success');
        await loadOrders();
      } else {
        showToast('❌ আপডেট ব্যর্থ হয়েছে, আবার চেষ্টা করুন', 'error');
      }
    } catch (e) {
      showToast('❌ নেটওয়ার্ক সমস্যা', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const printInvoice = (o) => {
    const items = Array.isArray(o.items) ? o.items : [];
    const date = new Date(o.created_at).toLocaleDateString('bn-BD', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const statusCfg = STATUS_OPTIONS.find(st => st.value === o.status) || STATUS_OPTIONS[0];
    const userInfo = o.users || {};
    const phone = userInfo.phone || o.phone || '';
    const buyerName = userInfo.name || o.shop_name || 'অজানা';
    const address = o.address || o.delivery_address || '';

    const html = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8"/>
        <title>ইনভয়েস #${o.id?.slice(0,8)?.toUpperCase()}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Hind Siliguri', sans-serif; color: #111; padding: 32px; max-width: 600px; margin: auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #1e1b4b; padding-bottom: 16px; }
          .brand { font-size: 24px; font-weight: 700; color: #1e1b4b; }
          .brand span { display: block; font-size: 12px; font-weight: 400; color: #6b7280; }
          .invoice-meta { text-align: right; font-size: 12px; color: #6b7280; }
          .invoice-meta strong { display: block; font-size: 16px; color: #111; margin-bottom: 4px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .info-box { background: #f9fafb; border-radius: 8px; padding: 12px; }
          .info-box p { font-size: 13px; margin-bottom: 4px; }
          .info-box strong { font-size: 14px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #1e1b4b; color: #fff; padding: 8px 12px; font-size: 12px; text-align: left; }
          td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
          .total-row td { font-weight: 700; font-size: 15px; border-top: 2px solid #1e1b4b; border-bottom: none; }
          .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${statusCfg.bg}; color: ${statusCfg.color}; }
          .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">পাইকারি বাজার <span>B2B পাইকারি প্ল্যাটফর্ম</span></div>
          <div class="invoice-meta">
            <strong>ইনভয়েস #${o.id?.slice(0,8)?.toUpperCase()}</strong>
            <div>${date}</div>
            <div style="margin-top:6px"><span class="status-badge">${statusCfg.label}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="info-grid">
            <div class="info-box">
              <div class="section-title">ক্রেতার তথ্য</div>
              <strong>${buyerName}</strong>
              ${phone ? `<p>📞 ${phone}</p>` : ''}
              ${address ? `<p>📍 ${address}</p>` : ''}
            </div>
            <div class="info-box">
              <div class="section-title">ডেলিভারি তথ্য</div>
              ${address ? `<strong>${address}</strong>` : '<p style="color:#9ca3af">ঠিকানা দেওয়া হয়নি</p>'}
              ${o.delivery_type ? `<p>🚚 ${o.delivery_type}</p>` : ''}
              ${o.delivery_date ? `<p>📅 ${o.delivery_date}</p>` : ''}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">পণ্য তালিকা</div>
          <table>
            <thead><tr><th>পণ্যের নাম</th><th>পরিমাণ</th><th>একক মূল্য</th><th>মোট</th></tr></thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name || ''}</td>
                  <td>${item.qty || item.quantity || 1}</td>
                  <td>৳${Number(item.price || 0).toLocaleString()}</td>
                  <td>৳${Number(item.price * (item.qty || item.quantity || 1)).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">সর্বমোট</td>
                <td>৳${Number(o.total || 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${o.note ? `<div class="section"><div class="section-title">নোট</div><p style="font-size:13px;color:#6b7280;font-style:italic">📝 ${o.note}</p></div>` : ''}

        <div class="footer">পাইকারি বাজার · ধন্যবাদ আপনার অর্ডারের জন্য</div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1.5px solid ${toast.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
          color: toast.type === 'success' ? '#065f46' : '#991b1b',
          padding: '12px 18px', borderRadius: '12px', fontSize: '14px',
          fontFamily: 'Hind Siliguri, sans-serif', fontWeight: '600',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e1b4b' }}>
        অর্ডার ব্যবস্থাপনা ({orders.length})
      </h2>

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

      <div style={{ ...s.card, padding: '8px', background: '#f9fafb' }}>
        {filteredOrders.length === 0 && <p style={{ color: '#6b7280', fontSize: '13px' }}>কোনো অর্ডার নেই</p>}
        {filteredOrders.map(o => {
          const items = Array.isArray(o.items) ? o.items : [];
          const date = new Date(o.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
          const statusCfg = STATUS_OPTIONS.find(st => st.value === o.status) || STATUS_OPTIONS[0];
          const isExpanded = expandedOrder === o.id;
          const userInfo = o.users || {};
          const phone = userInfo.phone || o.phone || '';
          const address = o.address || o.delivery_address || '';
          const isUpdating = updatingId === o.id;

          return (
            <div key={o.id} style={{ border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' }}>#{o.id?.slice(0, 8)?.toUpperCase()}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: statusCfg.bg, color: statusCfg.color }}>{statusCfg.label}</span>
                  </div>

                  {/* Shop name */}
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>
                    {o.shop_name || userInfo.shop_name || 'অজানা'}
                  </div>

                  {/* Phone */}
                  {phone && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      📞 {phone}
                    </div>
                  )}

                  {/* Order summary */}
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {date} · {items.length} টি পণ্য · ৳{Number(o.total || 0).toLocaleString()}
                  </div>

                  {/* Delivery address */}
                  {address && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>📍 {address}</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {/* Status select */}
                  <select
                    value={o.status || 'pending'}
                    disabled={isUpdating}
                    onChange={e => updateOrderStatus(o.id, e.target.value, o.shop_name || userInfo.shop_name)}
                    style={{
                      padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
                      fontFamily: 'Hind Siliguri, sans-serif', fontSize: '13px', cursor: isUpdating ? 'wait' : 'pointer',
                      outline: 'none', opacity: isUpdating ? 0.6 : 1,
                    }}>
                    {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Invoice button */}
                    <button
                      onClick={() => printInvoice(o)}
                      style={{
                        fontSize: '12px', color: '#fff', background: '#1e1b4b',
                        border: 'none', cursor: 'pointer', padding: '5px 10px',
                        borderRadius: '8px', fontFamily: 'Hind Siliguri, sans-serif', fontWeight: '600',
                      }}>
                      🧾 ইনভয়েস
                    </button>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                      style={{ fontSize: '12px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {isExpanded ? '▲ কম দেখুন' : '▼ বিস্তারিত'}
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '12px', background: '#eef0f5', borderRadius: '10px', padding: '12px' }}>
                  {/* Buyer info */}
                  <div style={{ marginBottom: '10px', padding: '8px', background: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>ক্রেতার তথ্য</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{o.shop_name || userInfo.shop_name || 'অজানা'}</div>
                    {(userInfo.name && userInfo.name !== o.shop_name) && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>👤 {userInfo.name}</div>
                    )}
                    {phone && <div style={{ fontSize: '12px', color: '#6b7280' }}>📞 {phone}</div>}
                    {address && <div style={{ fontSize: '12px', color: '#6b7280' }}>📍 {address}</div>}
                    {o.delivery_type && <div style={{ fontSize: '12px', color: '#6b7280' }}>🚚 {o.delivery_type}</div>}
                  </div>

                  {/* Items */}
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: idx < items.length - 1 ? '1px solid #e5e7eb' : 'none', color: '#111827' }}>
                      <span style={{ fontWeight: '500', color: '#111827' }}>{item.name} × {item.qty || item.quantity || 1}</span>
                      <span style={{ fontWeight: '700', color: '#1e1b4b' }}>৳{Number(item.price * (item.qty || item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', paddingTop: '10px', marginTop: '4px', borderTop: '2px solid #1e1b4b', color: '#111827' }}>
                    <span>মোট</span><span style={{ color: '#1e1b4b' }}>৳{Number(o.total || 0).toLocaleString()}</span>
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
