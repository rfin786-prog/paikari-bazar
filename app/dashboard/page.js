'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const STATUS = {
  pending:    { label: 'Pending',      color: '#8a5a13', bg: '#faf0dc', dot: '#c8912f' },
  processing: { label: 'Processing',   color: '#2c5f78', bg: '#e2f0f3', dot: '#3d90ae' },
  confirmed:  { label: 'Processing',   color: '#2c5f78', bg: '#e2f0f3', dot: '#3d90ae' },
  shipped:    { label: 'Shipped',   color: '#5c4a7a', bg: '#eee8f5', dot: '#8168ab' },
  delivered:  { label: 'Delivered', color: '#2f5f3f', bg: '#e5f2e6', dot: '#4f8b5f' },
  cancelled:  { label: 'Cancelled',           color: '#8c2f2f', bg: '#f7e6e6', dot: '#b34a4a' },
};

const TIMELINE_STEPS = [
  { value: 'pending',   label: 'Order Placed', icon: '📋', sub: 'Your order has been received' },
  { value: 'confirmed', label: 'Processing',         icon: '⚙️', sub: 'Your order is being verified and packed' },
  { value: 'shipped',   label: 'Shipped',    icon: '🚚', sub: 'Your product is with the courier or on the way' },
  { value: 'delivered', label: 'Delivered',    icon: '✅', sub: 'You have received the product' },
];
const STEP_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// ─── Password Strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    { label: 'Very Weak', color: '#b34a4a' },
    { label: 'Weak',     color: '#c8802f' },
    { label: 'Medium',      color: '#c8912f' },
    { label: 'Good',       color: '#6a9b5e' },
    { label: 'Strong', color: '#4f8b5f' },
  ];
  const lvl = levels[Math.min(strength, 4)];

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {levels.map((l, i) => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '4px',
            background: i <= strength - 1 ? lvl.color : '#e8ddc9',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: '11px', fontWeight: '600', color: lvl.color }}>{lvl.label}</div>
    </div>
  );
}

// ─── Tracking Timeline ────────────────────────────────────────────────────────
function TrackingTimeline({ order }) {
  if (order.status === 'cancelled') {
    return (
      <div style={{ marginTop: '16px', padding: '14px 16px', background: '#f7e6e6', borderRadius: '10px', border: '1px solid #e3bcbc' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#8c2f2f' }}>❌ This order has been cancelled</div>
      </div>
    );
  }

  const status = order.status === 'processing' ? 'confirmed' : order.status;
  const currentStepIdx = STEP_ORDER.indexOf(status);
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
    <div style={{ marginTop: '16px', padding: '16px', background: '#faf7f0', borderRadius: '12px', border: '1px solid #ece1cb' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#8a7f6e', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>
        Order Tracking
      </div>
      {TIMELINE_STEPS.map((step, idx) => {
        const isDone = idx <= currentStepIdx;
        const isCurrent = idx === currentStepIdx;
        const isPending = idx > currentStepIdx;
        const isLast = idx === TIMELINE_STEPS.length - 1;
        const histEntry = getHistoryEntry(step.value);
        const noteText = histEntry?.note || '';
        const displayTime = histEntry?.time
          ? histEntry.time
          : idx === 0 ? order.created_at : null;

        return (
          <div key={step.value} style={{ display: 'flex', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '36px', flexShrink: 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isCurrent ? '#b8862e' : isDone ? '#4f8b5f' : '#ece1cb',
                border: isCurrent ? '3px solid #e3c88a' : isDone ? '3px solid #a9cbaf' : '3px solid #ece1cb',
                color: isPending ? '#a99e8c' : '#fff',
                fontWeight: '700', fontSize: isPending ? '13px' : '15px',
              }}>
                {isPending ? (idx + 1) : (isDone && !isCurrent ? '✓' : step.icon)}
              </div>
              {!isLast && (
                <div style={{
                  width: '3px', flex: 1, minHeight: '26px',
                  background: idx < currentStepIdx ? '#4f8b5f' : '#ece1cb',
                  margin: '4px 0', borderRadius: '2px',
                }} />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : '14px' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: isPending ? '#a99e8c' : '#241f1b' }}>
                {step.label}
              </div>
              {isDone && displayTime && (
                <div style={{ fontSize: '11px', color: isCurrent ? '#b8862e' : '#4f8b5f', marginTop: '2px', fontWeight: '600' }}>
                  📅 {formatDateTime(displayTime)}
                </div>
              )}
              {isPending && <div style={{ fontSize: '11px', color: '#a99e8c', marginTop: '2px' }}>Pending</div>}
              {isDone && <div style={{ fontSize: '12px', color: '#8a7f6e', marginTop: '2px' }}>{step.sub}</div>}
              {noteText && (
                <div style={{
                  marginTop: '8px', background: '#fff', border: '1px solid #ece1cb',
                  borderLeft: '3px solid #b8862e', borderRadius: '8px', padding: '8px 10px',
                  fontSize: '12px', color: '#4a4238',
                }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#a99e8c', display: 'block', marginBottom: '2px' }}>Note</span>
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

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [address, setAddress] = useState({});
  const [addressMsg, setAddressMsg] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [passMsg, setPassMsg] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const [reorderToast, setReorderToast] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role === 'admin') { router.push('/admin'); return; }
    setUser(u);
    setEmail(u.email || '');
    setAddress({
      shop_name: u.shop_name || '',
      phone: u.phone || '',
      district: u.district || '',
      thana: u.thana || '',
      address: u.address || '',
    });
    loadOrders(u.id);
  }, []);

  useEffect(() => {
    if (orderFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => {
        if (orderFilter === 'active') return ['pending', 'processing', 'confirmed', 'shipped'].includes(o.status);
        if (orderFilter === 'delivered') return o.status === 'delivered';
        if (orderFilter === 'cancelled') return o.status === 'cancelled';
        return true;
      }));
    }
  }, [orderFilter, orders]);

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
    const { phone, ...addressData } = address;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify(addressData),
    });
    if (res.ok) {
      const updated = { ...user, ...address };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated); setAddressMsg('success');
    } else {
      const err = await res.text();
      console.error('Address save error:', err);
      setAddressMsg('error');
    }
    setAddressLoading(false);
    setTimeout(() => setAddressMsg(''), 3000);
  };

  const saveEmail = async () => {
    setEmailMsg('');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailMsg('invalid');
      return;
    }
    setEmailLoading(true);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      const updated = { ...user, email };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setEmailMsg('success');
    } else {
      const err = await res.text();
      console.error('Email save error:', err);
      setEmailMsg('error');
    }
    setEmailLoading(false);
    setTimeout(() => setEmailMsg(''), 3000);
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

  const handleReorder = (order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const cartItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      emoji: item.emoji || '',
      qty: item.qty || item.quantity || 1,
    }));
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setReorderToast('✅ Added to cart! Redirecting to checkout...');
    setTimeout(() => {
      setReorderToast('');
      router.push('/checkout');
    }, 1500);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    router.push('/login');
  };

  const emailMessages = {
    invalid: '❌ Please enter a valid email address',
    success: '✅ Email updated successfully',
    error:   '❌ Something went wrong, please try again',
  };

  const passMessages = {
    empty:    '❌ Please fill in all fields',
    wrong:    '❌ Current password is incorrect',
    mismatch: '❌ New passwords do not match',
    short:    '❌ Password must be at least 6 characters',
    success:  '✅ Password changed successfully',
    error:    '❌ Something went wrong',
  };

  const avatarLetter = user?.name?.[0] || user?.phone?.[0] || '?';
  const addressIncomplete = user && (!user.district || !user.thana || !user.address);

  const filterOptions = [
    { value: 'all',       label: 'All' },
    { value: 'active',    label: 'Active' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const tabList = [
    ['orders',   '📦', 'My Orders'],
    ['account',  '👤', 'Account Info'],
    ['address',  '📍', 'Address'],
    ['password', '🔒', 'Password'],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Hind Siliguri', sans-serif; }

        .dash-wrap {
          min-height: 100vh;
          background: #f7f1e6;
          background-image:
            radial-gradient(circle at 12% 8%, rgba(184,134,46,0.07) 0%, transparent 45%),
            radial-gradient(circle at 90% 92%, rgba(79,139,95,0.06) 0%, transparent 45%);
        }
        .content { max-width: 720px; margin: 0 auto; padding: 24px 16px 48px; }

        /* User hero — receipt-tag style */
        .user-hero {
          background: #fffdf8;
          border: 1px solid #ece1cb;
          border-radius: 16px; padding: 20px;
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(74,66,56,0.05);
          position: relative;
        }
        .user-hero::before {
          content: '';
          position: absolute; left: 0; top: 14px; bottom: 14px; width: 4px;
          background: #b8862e; border-radius: 0 3px 3px 0;
        }
        .avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: #4f8b5f;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 700; color: #fff; flex-shrink: 0;
          font-family: 'Tiro Bangla', serif;
        }
        .user-info-name { font-size: 18px; font-weight: 700; color: #241f1b; margin-bottom: 3px; font-family: 'Tiro Bangla', serif; }
        .user-info-sub { font-size: 13px; color: #8a7f6e; }
        .user-info-sub span { display: inline-block; background: #f0e9d8; color: #8a5a13; padding: 2px 10px; border-radius: 20px; font-size: 11px; margin-left: 6px; font-weight: 600; }
        .btn-logout {
          background: #fff; color: #8c2f2f;
          border: 1px solid #e3bcbc;
          padding: 8px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'Hind Siliguri', sans-serif;
          transition: background 0.15s; flex-shrink: 0; margin-left: auto;
        }
        .btn-logout:hover { background: #f7e6e6; }

        /* Underline tabs */
        .tabs {
          display: flex; gap: 4px;
          border-bottom: 2px solid #ece1cb;
          margin-bottom: 20px;
          overflow-x: auto;
        }
        .tab-btn {
          flex: 1; min-width: fit-content; padding: 10px 10px 12px;
          border: none; background: transparent; cursor: pointer;
          font-size: 13px; font-weight: 600; font-family: 'Hind Siliguri', sans-serif;
          color: #a99e8c; border-bottom: 2px solid transparent; margin-bottom: -2px;
          transition: color 0.15s, border-color 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap;
        }
        .tab-btn.active { color: #241f1b; border-bottom-color: #b8862e; }
        .tab-btn.inactive:hover { color: #4a4238; }

        /* Filter pills */
        .filter-pills { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .pill {
          padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
          border: 1.5px solid #ece1cb; cursor: pointer;
          font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s;
          color: #8a7f6e; background: #fffdf8;
        }
        .pill.active { background: #4f8b5f; border-color: #4f8b5f; color: #fff; }
        .pill:hover:not(.active) { border-color: #c9bb98; color: #4a4238; }

        .address-warning {
          background: #faf0dc; border: 1px solid #e3c88a;
          border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: #8a5a13; font-weight: 600; cursor: pointer;
        }
        .address-warning:hover { background: #f5e6c4; }

        .reorder-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: #241f1b; border: 1px solid #b8862e; color: #f0e9d8;
          padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 700;
          z-index: 9999; font-family: 'Hind Siliguri', sans-serif;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Order card — receipt styling with a perforated cut line */
        .card {
          background: #fffdf8; border: 1px solid #ece1cb; border-radius: 14px;
          padding: 18px 20px; margin-bottom: 12px;
          box-shadow: 0 2px 10px rgba(74,66,56,0.05);
        }
        .order-id { font-size: 11px; font-family: 'Courier New', monospace; color: #a99e8c; background: #f4efe3; padding: 3px 8px; border-radius: 5px; display: inline-block; margin-bottom: 8px; letter-spacing: 0.3px; }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 20px; margin-left: 6px; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .order-date { font-size: 12px; color: #a99e8c; margin-bottom: 10px; }
        .order-amount { font-size: 20px; font-weight: 800; color: #241f1b; line-height: 1; font-family: 'Tiro Bangla', serif; }
        .cut-line {
          border: none; height: 0; margin: 12px 0 0;
          border-top: 1.5px dashed #ddd0b3;
        }
        .expand-btn { background: none; border: none; color: #4f8b5f; font-size: 13px; cursor: pointer; padding: 10px 0 0; font-family: 'Hind Siliguri', sans-serif; font-weight: 600; display: flex; align-items: center; gap: 4px; }

        .invoice-btn {
          background: #fff; border: 1.5px solid #d8cba8; color: #4a4238;
          font-size: 12px; font-weight: 700; cursor: pointer;
          padding: 7px 14px; border-radius: 8px;
          font-family: 'Hind Siliguri', sans-serif;
          display: flex; align-items: center; gap: 5px;
          transition: background 0.15s, border-color 0.15s;
        }
        .invoice-btn:hover { background: #f4efe3; border-color: #b8862e; }

        .reorder-btn {
          background: #b8862e; color: #fff; border: none; padding: 7px 16px;
          border-radius: 8px; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: 'Hind Siliguri', sans-serif;
          margin-left: auto; transition: background 0.15s;
        }
        .reorder-btn:hover { background: #a3762a; }

        .order-detail { margin-top: 14px; background: #faf7f0; border-radius: 10px; padding: 14px; border: 1px solid #ece1cb; }
        .detail-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 15px; padding-top: 12px; margin-top: 4px; border-top: 2px solid #ece1cb; color: #241f1b; }

        .form-card { background: #fffdf8; border: 1px solid #ece1cb; border-radius: 14px; padding: 22px; box-shadow: 0 2px 10px rgba(74,66,56,0.05); }
        .form-title { font-size: 16px; font-weight: 700; color: #241f1b; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; padding-bottom: 12px; border-bottom: 2px solid #ece1cb; font-family: 'Tiro Bangla', serif; }
        .label { display: block; font-size: 12px; font-weight: 600; color: #8a7f6e; margin-bottom: 6px; letter-spacing: 0.3px; }
        .inp { width: 100%; padding: 11px 14px; border: 1.5px solid #ece1cb; border-radius: 9px; font-size: 14px; color: #241f1b; font-family: 'Hind Siliguri', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s; background: #faf7f0; }
        .inp:focus { border-color: #4f8b5f; box-shadow: 0 0 0 3px rgba(79,139,95,0.12); background: #fff; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .btn-primary { background: #4f8b5f; color: #fff; border: none; padding: 13px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Hind Siliguri', sans-serif; width: 100%; margin-top: 6px; transition: background 0.15s; }
        .btn-primary:hover:not(:disabled) { background: #3f7550; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .alert { padding: 12px 16px; border-radius: 9px; margin-bottom: 16px; font-size: 13px; font-weight: 600; }
        .alert.success { background: #e5f2e6; color: #2f5f3f; border: 1px solid #b9dcbe; }
        .alert.error { background: #f7e6e6; color: #8c2f2f; border: 1px solid #e3bcbc; }
        .empty-state { text-align: center; padding: 44px 20px; color: #a99e8c; }
        .empty-icon { font-size: 42px; margin-bottom: 12px; }
        .empty-text { font-size: 14px; margin-bottom: 16px; }
        .loading-state { text-align: center; padding: 44px; color: #a99e8c; font-size: 14px; }
        @media (max-width: 480px) { .grid2 { grid-template-columns: 1fr; } .order-amount { font-size: 17px; } }
      `}</style>

      <div className="dash-wrap">
        <div className="content">
          {user && (
            <div className="user-hero">
              <div className="avatar">{avatarLetter}</div>
              <div style={{ flex: 1 }}>
                <div className="user-info-name">{user.name || 'User'}</div>
                <div className="user-info-sub">
                  {user.phone}
                  {user.shop_name && <span>{user.shop_name}</span>}
                </div>
              </div>
              <button className="btn-logout" onClick={logout}>Logout</button>
            </div>
          )}

          <div className="tabs">
            {tabList.map(([t, icon, l]) => (
              <button key={t} onClick={() => setTab(t)} className={`tab-btn ${tab === t ? 'active' : 'inactive'}`}>
                <span>{icon}</span><span>{l}</span>
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div>
              {addressIncomplete && (
                <div className="address-warning" onClick={() => setTab('address')}>
                  <span style={{ fontSize: '17px' }}>⚠️</span>
                  <span>Delivery address incomplete! Please fill it in before placing an order →</span>
                </div>
              )}

              {!ordersLoading && orders.length > 0 && (
                <div className="filter-pills">
                  {filterOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`pill ${orderFilter === opt.value ? 'active' : ''}`}
                      onClick={() => setOrderFilter(opt.value)}
                    >
                      {opt.label}
                      {opt.value === 'all' && ` (${orders.length})`}
                      {opt.value === 'active' && ` (${orders.filter(o => ['pending','processing','confirmed','shipped'].includes(o.status)).length})`}
                      {opt.value === 'delivered' && ` (${orders.filter(o => o.status === 'delivered').length})`}
                      {opt.value === 'cancelled' && ` (${orders.filter(o => o.status === 'cancelled').length})`}
                    </button>
                  ))}
                </div>
              )}

              {ordersLoading ? (
                <div className="loading-state">Loading...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <p className="empty-text">
                      {orders.length === 0 ? 'No orders yet' : 'No orders in this category'}
                    </p>
                    {orders.length === 0 && (
                      <button className="btn-primary" style={{ width: 'auto', padding: '11px 28px', marginTop: 0 }} onClick={() => router.push('/products')}>View Products</button>
                    )}
                  </div>
                </div>
              ) : filteredOrders.map(order => {
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
                            background: order.payment_status === 'paid' ? '#e5f2e6' : '#f7e6e6',
                            color: order.payment_status === 'paid' ? '#2f5f3f' : '#8c2f2f',
                          }}>
                            {order.payment_status === 'paid' ? '✅ PAID' : '⚠️ DUE'}
                          </span>
                        </div>
                        <div className="order-date">{date}</div>
                        <div style={{ fontSize: '12px', color: '#a99e8c' }}>{items.length} Products</div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div className="order-amount">৳{Number(order.total || 0).toLocaleString('en-US')}</div>
                      </div>
                    </div>

                    <hr className="cut-line" />

                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="expand-btn" style={{ marginTop: 0 }} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                        {isExpanded ? '▲ Show Less' : '▼ Details & Tracking'}
                      </button>
                      <button
                        className="invoice-btn"
                        onClick={() => router.push(`/orders/${order.id}/invoice`)}
                      >
                        🧾 Invoice
                      </button>
                      {items.length > 0 && (
                        <button className="reorder-btn" onClick={() => handleReorder(order)}>
                          🔄 Reorder
                        </button>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="order-detail">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '6px 0 8px', borderBottom: '2px solid #ece1cb', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#a99e8c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Item</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#a99e8c', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'right' }}>Unit Price</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#a99e8c', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'center' }}>Qty</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#a99e8c', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'right' }}>Amount</span>
                        </div>
                        {items.map((item, i) => {
                          const qty = item.qty || item.quantity || 1;
                          const total = item.price * qty;
                          return (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '7px 0', borderBottom: i < items.length - 1 ? '1px dashed #ece1cb' : 'none', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', color: '#4a4238' }}>{item.emoji || ''} {item.name}</span>
                              <span style={{ fontSize: '13px', color: '#8a7f6e', textAlign: 'right' }}>৳{Number(item.price).toLocaleString('en-US')}</span>
                              <span style={{ fontSize: '13px', color: '#8a7f6e', textAlign: 'center', background: '#f4efe3', borderRadius: '6px', padding: '2px 8px' }}>×{qty}</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#241f1b', textAlign: 'right' }}>৳{total.toLocaleString('en-US')}</span>
                            </div>
                          );
                        })}
                        <div className="detail-total">
                          <span>Total</span>
                          <span>৳{Number(order.total || 0).toLocaleString('en-US')}</span>
                        </div>
                      </div>
                    )}

                    {isExpanded && <TrackingTimeline order={order} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Account Info Tab */}
          {tab === 'account' && (
            <div className="form-card">
              <div className="form-title">👤 Account Info</div>
              {emailMsg && (
                <div className={`alert ${emailMsg === 'success' ? 'success' : 'error'}`}>
                  {emailMessages[emailMsg]}
                </div>
              )}
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="inp"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#a99e8c' }}>
                    Used for password reset OTP and account notifications.
                  </div>
                </div>
                <button className="btn-primary" onClick={saveEmail} disabled={emailLoading}>
                  {emailLoading ? 'Saving...' : 'Save Email'}
                </button>
              </div>
            </div>
          )}

          {/* Address Tab */}
          {tab === 'address' && (
            <div className="form-card">
              <div className="form-title">📍 Delivery Address</div>
              {addressMsg && (
                <div className={`alert ${addressMsg === 'success' ? 'success' : 'error'}`}>
                  {addressMsg === 'success' ? '✅ Address saved' : '❌ Something went wrong'}
                </div>
              )}
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label className="label">Shop Name</label>
                  <input className="inp" value={address.shop_name || ''} onChange={e => setAddress({ ...address, shop_name: e.target.value })} placeholder="Enter shop name" />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input className="inp" value={address.phone || ''} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                </div>
                <div className="grid2">
                  <div>
                    <label className="label">District</label>
                    <select className="inp" value={address.district || ''} onChange={e => setAddress({ ...address, district: e.target.value })}>
                      <option value="">Select District</option>
                      {['Dhaka','Chattogram','Rajshahi','Sylhet','Khulna','Barishal','Mymensingh','Rangpur'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Thana</label>
                    <input className="inp" value={address.thana || ''} onChange={e => setAddress({ ...address, thana: e.target.value })} placeholder="Thana name" />
                  </div>
                </div>
                <div>
                  <label className="label">Full Address</label>
                  <textarea className="inp" style={{ height: '88px', resize: 'none' }} value={address.address || ''} onChange={e => setAddress({ ...address, address: e.target.value })} placeholder="House No. / Road / Area" />
                </div>
                <button className="btn-primary" onClick={saveAddress} disabled={addressLoading}>
                  {addressLoading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {tab === 'password' && (
            <div className="form-card">
              <div className="form-title">🔒 Change Password</div>
              {passMsg && (
                <div className={`alert ${passMsg === 'success' ? 'success' : 'error'}`}>
                  {passMessages[passMsg]}
                </div>
              )}
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label className="label">Current Password</label>
                  <input type="password" className="inp" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} placeholder="Enter current password" />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="inp" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="At least 6 characters" />
                  <PasswordStrength password={passwords.newPass} />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input type="password" className="inp" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Re-enter password" />
                  {passwords.confirm && passwords.newPass && (
                    <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: '600', color: passwords.confirm === passwords.newPass ? '#2f5f3f' : '#8c2f2f' }}>
                      {passwords.confirm === passwords.newPass ? '✅ Passwords match' : '❌ Passwords do not match'}
                    </div>
                  )}
                </div>
                <button className="btn-primary" onClick={changePassword} disabled={passLoading}>
                  {passLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {reorderToast && <div className="reorder-toast">{reorderToast}</div>}
    </>
  );
}
