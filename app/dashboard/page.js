'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const STATUS = {
  pending:    { label: 'অপেক্ষমান',      color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
  processing: { label: 'প্রক্রিয়াধীন',   color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6' },
  confirmed:  { label: 'প্রক্রিয়াধীন',   color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6' },
  shipped:    { label: 'পাঠানো হয়েছে',   color: '#5b21b6', bg: '#ede9fe', dot: '#8b5cf6' },
  delivered:  { label: 'ডেলিভারি হয়েছে', color: '#065f46', bg: '#d1fae5', dot: '#10b981' },
  cancelled:  { label: 'বাতিল',           color: '#991b1b', bg: '#fee2e2', dot: '#ef4444' },
};

const TIMELINE_STEPS = [
  { value: 'pending',   label: 'অর্ডার দেওয়া হয়েছে', icon: '📋', sub: 'আপনার অর্ডারটি গ্রহণ করা হয়েছে' },
  { value: 'confirmed', label: 'প্রক্রিয়াধীন',         icon: '⚙️', sub: 'অর্ডারটি যাচাই ও প্যাক করা হচ্ছে' },
  { value: 'shipped',   label: 'মাল পাঠানো হয়েছে',    icon: '🚚', sub: 'পণ্যটি কুরিয়ারে বা ডেলিভারিতে আছে' },
  { value: 'delivered', label: 'ডেলিভারি সম্পন্ন',    icon: '✅', sub: 'আপনি পণ্যটি হাতে পেয়েছেন' },
];
const STEP_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// ─── Tracking Timeline (customer read-only) ───────────────────────────────────
function TrackingTimeline({ order }) {
  // cancelled হলে timeline দেখাবে না
  if (order.status === 'cancelled') {
    return (
      <div style={{ marginTop: '16px', padding: '14px 16px', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fca5a5' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b' }}>❌ এই অর্ডারটি বাতিল করা হয়েছে</div>
      </div>
    );
  }

  // processing → confirmed হিসেবে দেখাও
  const status = order.status === 'processing' ? 'confirmed' : order.status;
  const currentStepIdx = STEP_ORDER.indexOf(status);

  // DB থেকে tracking_history নাও
  const trackingHistory = Array.isArray(order.tracking_history) ? order.tracking_history : [];

  const getHistoryEntry = (stepValue) =>
    trackingHistory.find(h => h.status === stepValue) || null;

  const formatDateTime = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString('bn-BD', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  };

  return (
    <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
        অর্ডার ট্র্যাকিং
      </div>
      {TIMELINE_STEPS.map((step, idx) => {
        const isDone = idx <= currentStepIdx;
        const isCurrent = idx === currentStepIdx;
        const isPending = idx > currentStepIdx;
        const isLast = idx === TIMELINE_STEPS.length - 1;

        // DB tracking_history থেকে এই step-এর data নাও
        const histEntry = getHistoryEntry(step.value);
        const noteText = histEntry?.note || '';

        // সঠিক time: history থেকে → না পেলে created_at (pending-এর জন্য)
        const displayTime = histEntry?.time
          ? histEntry.time
          : idx === 0
            ? order.created_at
            : null;

        return (
          <div key={step.value} style={{ display: 'flex', gap: '14px' }}>
            {/* Icon + line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '38px', flexShrink: 0 }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isCurrent ? '17px' : '15px',
                background: isCurrent ? '#f59e0b' : isDone ? '#10b981' : '#e5e7eb',
                border: isCurrent ? '3px solid #fcd34d' : isDone ? '3px solid #6ee7b7' : '3px solid #e5e7eb',
                boxShadow: isCurrent ? '0 0 0 4px rgba(245,158,11,0.15)' : isDone ? '0 0 0 4px rgba(16,185,129,0.1)' : 'none',
                color: isPending ? '#9ca3af' : '#fff',
                fontWeight: '700', fontSize: isPending ? '13px' : '16px',
              }}>
                {isPending ? (idx + 1) : (isDone && !isCurrent ? '✓' : step.icon)}
              </div>
              {!isLast && (
                <div style={{
                  width: '3px', flex: 1, minHeight: '28px',
                  background: idx < currentStepIdx ? '#10b981' : '#e5e7eb',
                  margin: '4px 0', borderRadius: '2px',
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : '14px' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: isPending ? '#9ca3af' : '#111827' }}>
                {step.label}
              </div>

              {isDone && displayTime && (
                <div style={{ fontSize: '11px', color: isCurrent ? '#f59e0b' : '#10b981', marginTop: '2px', fontWeight: '600' }}>
                  📅 {formatDateTime(displayTime)}
                </div>
              )}
              {isPending && (
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>অপেক্ষমান</div>
              )}
              {isDone && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{step.sub}</div>
              )}

              {/* Admin note — DB থেকে, read only */}
              {noteText && (
                <div style={{
                  marginTop: '8px', background: '#fff', border: '1px solid #e5e7eb',
                  borderLeft: '3px solid #f59e0b',
                  borderRadius: '8px', padding: '8px 10px',
                  fontSize: '12px', color: '#374151',
                }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', display: 'block', marginBottom: '2px' }}>নোট</span>
                  {noteText}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [address, setAddress] = useState({});
  const [addressMsg, setAddressMsg] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);

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
    setAddressLoading(true); setAddressMsg('');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify(address),
    });
    if (res.ok) {
      const updated = { ...user, ...address };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated); setAddressMsg('success');
    } else { setAddressMsg('error'); }
    setAddressLoading(false);
    setTimeout(() => setAddressMsg(''), 3000);
  };

  const changePassword = async () => {
    setPassMsg('');
    if (!passwords.current || !passwords.newPass || !passwords.confirm) return setPassMsg('empty');
    if (passwords.current !== user.password) return setPassMsg('wrong');
    if (passwords.newPass !== passwords.confirm) return setPassMsg('mismatch');
    if (passwords.newPass.length < 6) return setPassMsg('short');
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
      setPassMsg('success');
    } else { setPassMsg('error'); }
    setPassLoading(false);
    setTimeout(() => setPassMsg(''), 3000);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    router.push('/login');
  };

  const passMessages = {
    empty: '❌ সব ঘর পূরণ করুন',
    wrong: '❌ বর্তমান পাসওয়ার্ড ভুল',
    mismatch: '❌ নতুন পাসওয়ার্ড মিলছে না',
    short: '❌ পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে',
    success: '✅ পাসওয়ার্ড পরিবর্তন হয়েছে',
    error: '❌ সমস্যা হয়েছে',
  };

  const avatarLetter = user?.name?.[0] || user?.phone?.[0] || '?';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Hind Siliguri', sans-serif; }

        .dash-wrap {
          min-height: 100vh;
          background: linear-gradient(160deg, #0a1628 0%, #0f2442 40%, #1a3a6b 100%);
          position: relative;
        }
        .dash-wrap::before {
          content: '';
          position: fixed; top: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(232,160,32,0.08) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .navbar {
          position: sticky; top: 0; z-index: 100;
          height: 64px;
          background: rgba(10,22,40,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(232,160,32,0.15);
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }
        .nav-logo { font-size: 22px; font-weight: 800; color: #fff; cursor: pointer; font-family: 'Tiro Bangla', serif; }
        .nav-logo span { color: #e8a020; }
        .btn-ghost {
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 9px 16px; border-radius: 10px;
          font-size: 13px; cursor: pointer;
          font-family: 'Hind Siliguri', sans-serif;
          transition: background 0.15s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.14); }
        .content { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; padding: 28px 16px 48px; }
        .user-hero {
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 24px;
          display: flex; align-items: center; gap: 18px;
          margin-bottom: 24px; backdrop-filter: blur(10px);
        }
        .avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #e8a020, #f5c842);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 800; color: #0f2442; flex-shrink: 0;
          box-shadow: 0 4px 20px rgba(232,160,32,0.4);
          font-family: 'Tiro Bangla', serif;
        }
        .user-info-name { font-size: 19px; font-weight: 700; color: #fff; margin-bottom: 4px; font-family: 'Tiro Bangla', serif; }
        .user-info-sub { font-size: 13px; color: rgba(255,255,255,0.5); }
        .user-info-sub span { display: inline-block; background: rgba(232,160,32,0.15); color: #e8a020; padding: 2px 10px; border-radius: 20px; font-size: 12px; margin-left: 6px; }
        .tabs {
          display: flex; gap: 6px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 6px; border-radius: 14px;
          margin-bottom: 24px; backdrop-filter: blur(10px);
        }
        .tab-btn { flex: 1; padding: 10px 8px; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s; }
        .tab-btn.active { background: linear-gradient(135deg, #e8a020, #f5c842); color: #0f2442; box-shadow: 0 4px 12px rgba(232,160,32,0.35); }
        .tab-btn.inactive { background: transparent; color: rgba(255,255,255,0.5); }
        .tab-btn.inactive:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.06); }
        .card { background: rgba(255,255,255,0.97); border-radius: 18px; padding: 22px; margin-bottom: 14px; box-shadow: 0 4px 24px rgba(0,0,0,0.12); transition: transform 0.15s; }
        .card:hover { transform: translateY(-1px); }
        .order-id { font-size: 11px; font-family: monospace; color: #9ca3af; background: #f3f4f6; padding: 3px 8px; border-radius: 6px; display: inline-block; margin-bottom: 8px; }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-left: 6px; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .order-date { font-size: 12px; color: #9ca3af; margin-bottom: 10px; }
        .item-tag { font-size: 12px; background: #f3f4f6; color: #374151; padding: 4px 11px; border-radius: 20px; display: inline-block; margin: 3px 3px 0 0; }
        .order-amount { font-size: 22px; font-weight: 800; color: #0f2442; line-height: 1; }
        .order-count { font-size: 12px; color: #9ca3af; text-align: right; margin-top: 4px; }
        .expand-btn { background: none; border: none; color: #6366f1; font-size: 13px; cursor: pointer; padding: 10px 0 0; font-family: 'Hind Siliguri', sans-serif; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .order-detail { margin-top: 14px; background: #f9fafb; border-radius: 12px; padding: 14px; border: 1px solid #f0f0f0; }
        .detail-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed #f0f0f0; color: #374151; }
        .detail-row:last-child { border-bottom: none; }
        .detail-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 15px; padding-top: 12px; margin-top: 4px; border-top: 2px solid #e5e7eb; color: #0f2442; }
        .form-card { background: rgba(255,255,255,0.97); border-radius: 18px; padding: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
        .form-title { font-size: 17px; font-weight: 700; color: #0f2442; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; padding-bottom: 14px; border-bottom: 2px solid #f3f4f6; font-family: 'Tiro Bangla', serif; }
        .label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px; letter-spacing: 0.3px; }
        .inp { width: 100%; padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #111827; font-family: 'Hind Siliguri', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s; background: #fafafa; }
        .inp:focus { border-color: #0f2442; box-shadow: 0 0 0 3px rgba(15,36,66,0.08); background: #fff; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .btn-primary { background: linear-gradient(135deg, #0f2442, #1a3a6b); color: #fff; border: none; padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Hind Siliguri', sans-serif; width: 100%; margin-top: 6px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 16px rgba(15,36,66,0.25); }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,36,66,0.35); }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .alert { padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px; font-weight: 600; }
        .alert.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .alert.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .empty-state { text-align: center; padding: 48px 20px; color: #9ca3af; }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-text { font-size: 15px; margin-bottom: 16px; }
        .loading-state { text-align: center; padding: 48px; color: rgba(255,255,255,0.5); font-size: 15px; }
        @media (max-width: 480px) { .grid2 { grid-template-columns: 1fr; } .order-amount { font-size: 18px; } .navbar { padding: 0 14px; } }
      `}</style>

      <div className="dash-wrap">
        <nav className="navbar">
          <div className="nav-logo" onClick={() => router.push('/products')}>পাইকারি<span>বাজার</span></div>
          <button className="btn-ghost" onClick={logout}>লগআউট</button>
        </nav>

        <div className="content">
          {user && (
            <div className="user-hero">
              <div className="avatar">{avatarLetter}</div>
              <div>
                <div className="user-info-name">{user.name || 'ব্যবহারকারী'}</div>
                <div className="user-info-sub">
                  {user.phone}
                  {user.shop_name && <span>{user.shop_name}</span>}
                </div>
              </div>
            </div>
          )}

          <div className="tabs">
            {[['orders', '📦 আমার অর্ডার'], ['address', '📍 ঠিকানা'], ['password', '🔒 পাসওয়ার্ড']].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t)} className={`tab-btn ${tab === t ? 'active' : 'inactive'}`}>{l}</button>
            ))}
          </div>

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div>
              {ordersLoading ? (
                <div className="loading-state">⏳ লোড হচ্ছে...</div>
              ) : orders.length === 0 ? (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <p className="empty-text">এখনো কোনো অর্ডার নেই</p>
                    <button className="btn-primary" style={{ width: 'auto', padding: '11px 28px', marginTop: 0 }} onClick={() => router.push('/products')}>পণ্য দেখুন</button>
                  </div>
                </div>
              ) : orders.map(order => {
                const items = Array.isArray(order.items) ? order.items : [];
                const st = STATUS[order.status] || STATUS.pending;
                const date = new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
                const isExpanded = expandedOrder === order.id;

                return (
                  <div key={order.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                          <span className="order-id">#{order.id?.slice(0, 8)?.toUpperCase()}</span>
                          <span className="status-badge" style={{ background: st.bg, color: st.color }}>
                            <span className="status-dot" style={{ background: st.dot }}></span>
                            {st.label}
                          </span>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: '700',
                            padding: '3px 10px', borderRadius: '20px', marginLeft: '4px',
                            background: order.payment_status === 'paid' ? '#d1fae5' : '#fee2e2',
                            color: order.payment_status === 'paid' ? '#065f46' : '#991b1b',
                          }}>
                            {order.payment_status === 'paid' ? '✅ PAID' : '⚠️ DUE'}
                          </span>
                        </div>
                        <div className="order-date">{date}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{items.length} টি পণ্য</div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div className="order-amount">৳{Number(order.total || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    <button className="expand-btn" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                      {isExpanded ? '▲ কম দেখুন' : '▼ বিস্তারিত ও ট্র্যাকিং'}
                    </button>

                    {isExpanded && (
                      <div className="order-detail">
                        {/* Table header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '6px 0 8px', borderBottom: '2px solid #e5e7eb', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Item</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'right' }}>Unit Price</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'center' }}>Qty</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'right' }}>Amount</span>
                        </div>
                        {/* Table rows */}
                        {items.map((item, i) => {
                          const qty = item.qty || item.quantity || 1;
                          const total = item.price * qty;
                          return (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '7px 0', borderBottom: i < items.length - 1 ? '1px dashed #f0f0f0' : 'none', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', color: '#374151' }}>{item.emoji || ''} {item.name}</span>
                              <span style={{ fontSize: '13px', color: '#6b7280', textAlign: 'right' }}>৳{Number(item.price).toLocaleString()}</span>
                              <span style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', background: '#f3f4f6', borderRadius: '6px', padding: '2px 8px' }}>×{qty}</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f2442', textAlign: 'right' }}>৳{total.toLocaleString()}</span>
                            </div>
                          );
                        })}
                        <div className="detail-total">
                          <span>Total</span>
                          <span>৳{Number(order.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Tracking Timeline — DB থেকে data */}
                    {isExpanded && <TrackingTimeline order={order} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Address Tab */}
          {tab === 'address' && (
            <div className="form-card">
              <div className="form-title">📍 ডেলিভারি ঠিকানা</div>
              {addressMsg && (
                <div className={`alert ${addressMsg === 'success' ? 'success' : 'error'}`}>
                  {addressMsg === 'success' ? '✅ ঠিকানা সেভ হয়েছে' : '❌ সমস্যা হয়েছে'}
                </div>
              )}
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label className="label">দোকানের নাম</label>
                  <input className="inp" value={address.shop_name || ''} onChange={e => setAddress({ ...address, shop_name: e.target.value })} placeholder="দোকানের নাম লিখুন" />
                </div>
                <div>
                  <label className="label">ফোন নম্বর</label>
                  <input className="inp" value={address.phone || ''} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                </div>
                <div className="grid2">
                  <div>
                    <label className="label">জেলা</label>
                    <select className="inp" value={address.district || ''} onChange={e => setAddress({ ...address, district: e.target.value })}>
                      <option value="">জেলা বাছুন</option>
                      {['ঢাকা','চট্টগ্রাম','রাজশাহী','সিলেট','খুলনা','বরিশাল','ময়মনসিংহ','রংপুর'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">থানা</label>
                    <input className="inp" value={address.thana || ''} onChange={e => setAddress({ ...address, thana: e.target.value })} placeholder="থানার নাম" />
                  </div>
                </div>
                <div>
                  <label className="label">পূর্ণ ঠিকানা</label>
                  <textarea className="inp" style={{ height: '88px', resize: 'none' }} value={address.address || ''} onChange={e => setAddress({ ...address, address: e.target.value })} placeholder="বাড়ি নম্বর / রাস্তা / এলাকা" />
                </div>
                <button className="btn-primary" onClick={saveAddress} disabled={addressLoading}>
                  {addressLoading ? '⏳ সেভ হচ্ছে...' : '✅ ঠিকানা সেভ করুন'}
                </button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {tab === 'password' && (
            <div className="form-card">
              <div className="form-title">🔒 পাসওয়ার্ড পরিবর্তন</div>
              {passMsg && (
                <div className={`alert ${passMsg === 'success' ? 'success' : 'error'}`}>
                  {passMessages[passMsg]}
                </div>
              )}
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label className="label">বর্তমান পাসওয়ার্ড</label>
                  <input type="password" className="inp" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} placeholder="বর্তমান পাসওয়ার্ড দিন" />
                </div>
                <div>
                  <label className="label">নতুন পাসওয়ার্ড</label>
                  <input type="password" className="inp" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="কমপক্ষে ৬ অক্ষর" />
                </div>
                <div>
                  <label className="label">পাসওয়ার্ড নিশ্চিত করুন</label>
                  <input type="password" className="inp" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="আবার পাসওয়ার্ড দিন" />
                </div>
                <button className="btn-primary" onClick={changePassword} disabled={passLoading}>
                  {passLoading ? '⏳ পরিবর্তন হচ্ছে...' : '🔒 পাসওয়ার্ড পরিবর্তন করুন'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
