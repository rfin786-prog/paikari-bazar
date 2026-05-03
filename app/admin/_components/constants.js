export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export const STATUS_OPTIONS = [
  { value: 'pending',    label: 'অপেক্ষমান',      color: '#f59e0b', bg: '#fef3c7' },
  { value: 'processing', label: 'প্রক্রিয়াধীন',   color: '#3b82f6', bg: '#dbeafe' },
  { value: 'shipped',    label: 'পাঠানো হয়েছে',   color: '#6366f1', bg: '#e0e7ff' },
  { value: 'delivered',  label: 'ডেলিভারি হয়েছে', color: '#10b981', bg: '#d1fae5' },
  { value: 'cancelled',  label: 'বাতিল',           color: '#ef4444', bg: '#fee2e2' },
];

export const s = {
  inp: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontFamily: 'Hind Siliguri, sans-serif',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    background: '#1e1b4b',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontFamily: 'Hind Siliguri, sans-serif',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  card: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,.06)',
  },
};
