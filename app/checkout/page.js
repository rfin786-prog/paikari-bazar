'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)

  const [editMode, setEditMode] = useState(false)
  const [editedAddress, setEditedAddress] = useState({})

  const [deliveryMethod, setDeliveryMethod] = useState('standard')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [useWallet, setUseWallet] = useState(false)
  const [note, setNote] = useState('')

  const deliveryOptions = [
    { id: 'standard', name: 'স্ট্যান্ডার্ড', info: '৩–৫ কার্যদিবস', price: 60 },
    { id: 'express', name: 'এক্সপ্রেস', info: '১–২ কার্যদিবস', price: 120 },
    { id: 'scheduled', name: 'নির্ধারিত তারিখ', info: 'তারিখ বেছে নিন', price: 80 },
    { id: 'pickup', name: 'সেলফ পিকআপ', info: 'গুদাম থেকে নিন', price: 0 },
  ]

  const paymentOptions = [
    { id: 'cod', icon: '💵', name: 'ক্যাশ অন ডেলিভারি' },
    { id: 'mobile', icon: '📱', name: 'বিকাশ / নগদ' },
    { id: 'bank', icon: '🏦', name: 'ব্যাংক ট্রান্সফার' },
  ]

  // Load user, profile, cart
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: prof } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(prof)
      setEditedAddress({
        shop_name: prof?.shop_name || '',
        phone: prof?.phone || '',
        district: prof?.district || '',
        thana: prof?.thana || '',
        address: prof?.address || '',
      })

      // Load cart from localStorage
      const saved = localStorage.getItem('cart')
      if (saved) setCartItems(JSON.parse(saved))

      setLoading(false)
    }
    load()
  }, [])

  const deliveryCost = deliveryOptions.find(d => d.id === deliveryMethod)?.price || 0
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const walletBalance = profile?.wallet_balance || 0
  const walletDeduction = useWallet ? Math.min(walletBalance, subtotal + deliveryCost - couponDiscount) : 0
  const grandTotal = Math.max(0, subtotal + deliveryCost - couponDiscount - walletDeduction)
  const cashback = Math.round(grandTotal * 0.02)

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase()
    if (code === 'PAIKA10') {
      setCouponDiscount(Math.round(subtotal * 0.1))
      setCouponApplied(true)
    } else {
      alert('কুপন কোডটি সঠিক নয়।')
      setCouponDiscount(0)
      setCouponApplied(false)
    }
  }

  function saveAddress() {
    setProfile(prev => ({ ...prev, ...editedAddress }))
    setEditMode(false)
  }

  async function placeOrder() {
    if (cartItems.length === 0) { alert('কার্টে কোনো পণ্য নেই।'); return }
    if (deliveryMethod === 'scheduled' && !deliveryDate) {
      alert('অনুগ্রহ করে ডেলিভারি তারিখ বেছে নিন।'); return
    }
    setPlacing(true)
    try {
      const deliveryAddress = editMode ? editedAddress : {
        shop_name: profile?.shop_name,
        phone: profile?.phone,
        district: profile?.district,
        thana: profile?.thana,
        address: profile?.address,
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items: cartItems,
          subtotal,
          delivery_cost: deliveryCost,
          delivery_method: deliveryMethod,
          delivery_date: deliveryDate || null,
          coupon_code: couponApplied ? couponCode.toUpperCase() : null,
          coupon_discount: couponDiscount,
          wallet_deduction: walletDeduction,
          payment_method: paymentMethod,
          grand_total: grandTotal,
          cashback,
          note,
          delivery_address: deliveryAddress,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      // Update wallet balance if used
      if (useWallet && walletDeduction > 0) {
        await supabase
          .from('users')
          .update({ wallet_balance: walletBalance - walletDeduction + cashback })
          .eq('id', user.id)
      } else if (cashback > 0) {
        await supabase
          .from('users')
          .update({ wallet_balance: walletBalance + cashback })
          .eq('id', user.id)
      }

      // Clear cart
      localStorage.removeItem('cart')

      router.push(`/orders/${order.id}?placed=true`)
    } catch (err) {
      console.error(err)
      alert('অর্ডার দেওয়া যায়নি। আবার চেষ্টা করুন।')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <p style={{ color: '#6B7280', fontSize: '14px' }}>লোড হচ্ছে...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '1rem 1rem 3rem', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '15px', fontWeight: '600' }}>প</div>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', margin: 0 }}>পাইকারি বাজার</h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>অর্ডার চেকআউট</p>
        </div>
      </div>

      {/* Saved Address */}
      <div style={cardStyle}>
        <SectionTitle>ডেলিভারি ঠিকানা</SectionTitle>
        {!editMode ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 2px' }}>{profile?.shop_name || 'দোকানের নাম নেই'}</p>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 2px' }}>{profile?.phone}</p>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
                {profile?.address}<br />{profile?.thana && `${profile.thana}, `}{profile?.district}
              </p>
            </div>
            <button onClick={() => setEditMode(true)} style={editBtnStyle}>সম্পাদনা</button>
          </div>
        ) : (
          <div style={{ marginTop: '4px' }}>
            <Field label="দোকানের নাম">
              <input style={inputStyle} value={editedAddress.shop_name} onChange={e => setEditedAddress(p => ({ ...p, shop_name: e.target.value }))} />
            </Field>
            <Field label="মোবাইল নম্বর">
              <input style={inputStyle} value={editedAddress.phone} onChange={e => setEditedAddress(p => ({ ...p, phone: e.target.value }))} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Field label="জেলা">
                <select style={inputStyle} value={editedAddress.district} onChange={e => setEditedAddress(p => ({ ...p, district: e.target.value }))}>
                  {['ঢাকা','চট্টগ্রাম','রাজশাহী','সিলেট','খুলনা','বরিশাল','ময়মনসিংহ','রংপুর'].map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="উপজেলা / থানা">
                <input style={inputStyle} value={editedAddress.thana} onChange={e => setEditedAddress(p => ({ ...p, thana: e.target.value }))} />
              </Field>
            </div>
            <Field label="সম্পূর্ণ ঠিকানা">
              <textarea style={{ ...inputStyle, height: '64px', resize: 'none' }} value={editedAddress.address} onChange={e => setEditedAddress(p => ({ ...p, address: e.target.value }))} />
            </Field>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={saveAddress} style={{ ...greenBtnStyle, padding: '7px 16px', fontSize: '13px' }}>সংরক্ষণ করুন</button>
              <button onClick={() => setEditMode(false)} style={{ padding: '7px 16px', fontSize: '13px', background: 'none', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer', color: '#6B7280' }}>বাতিল</button>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Method */}
      <div style={cardStyle}>
        <SectionTitle>ডেলিভারি পদ্ধতি</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {deliveryOptions.map(opt => (
            <div key={opt.id} onClick={() => setDeliveryMethod(opt.id)}
              style={{ border: deliveryMethod === opt.id ? '2px solid #1D9E75' : '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 12px', cursor: 'pointer', background: deliveryMethod === opt.id ? '#F0FBF7' : 'transparent', transition: 'all 0.15s' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 2px' }}>{opt.name}</p>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px' }}>{opt.info}</p>
              <p style={{ fontSize: '12px', color: '#1D9E75', fontWeight: '600', margin: 0 }}>{opt.price === 0 ? 'বিনামূল্যে' : `৳ ${opt.price}`}</p>
            </div>
          ))}
        </div>
        {deliveryMethod === 'scheduled' && (
          <div style={{ marginTop: '10px' }}>
            <Field label="ডেলিভারি তারিখ">
              <input type="date" style={inputStyle} value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </Field>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div style={cardStyle}>
        <SectionTitle>অর্ডার সারসংক্ষেপ</SectionTitle>
        <div style={{ borderBottom: '1px solid #F3F4F6', marginBottom: '12px', paddingBottom: '12px' }}>
          {cartItems.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '1rem 0' }}>কার্টে কোনো পণ্য নেই</p>
          ) : cartItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#111827', margin: '0 0 1px' }}>{item.name}</p>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>{item.quantity} × ৳ {item.price.toLocaleString('bn-BD')}</p>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: 0 }}>৳ {(item.price * item.quantity).toLocaleString('bn-BD')}</p>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="কুপন কোড লিখুন..." value={couponCode}
            onChange={e => { setCouponCode(e.target.value); setCouponApplied(false); setCouponDiscount(0) }}
            disabled={couponApplied} />
          <button onClick={applyCoupon} disabled={couponApplied}
            style={{ padding: '8px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', color: couponApplied ? '#1D9E75' : '#374151' }}>
            {couponApplied ? 'প্রয়োগ হয়েছে' : 'প্রয়োগ করুন'}
          </button>
        </div>

        {/* Totals */}
        <SummaryRow label="পণ্যের মোট" value={`৳ ${subtotal.toLocaleString('bn-BD')}`} />
        <SummaryRow label="ডেলিভারি চার্জ" value={deliveryCost === 0 ? 'বিনামূল্যে' : `৳ ${deliveryCost}`} />
        {couponDiscount > 0 && <SummaryRow label="কুপন ছাড়" value={`- ৳ ${couponDiscount.toLocaleString('bn-BD')}`} green />}
        {walletDeduction > 0 && <SummaryRow label="ওয়ালেট কর্তন" value={`- ৳ ${walletDeduction.toLocaleString('bn-BD')}`} green />}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '600', color: '#111827', paddingTop: '10px', borderTop: '1px solid #F3F4F6', marginTop: '6px' }}>
          <span>সর্বমোট</span>
          <span>৳ {grandTotal.toLocaleString('bn-BD')}</span>
        </div>
      </div>

      {/* Payment */}
      <div style={cardStyle}>
        <SectionTitle>পেমেন্ট</SectionTitle>

        {/* Cashback badge */}
        <div style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>
          এই অর্ডারে ৳ {cashback.toLocaleString('bn-BD')} ক্যাশব্যাক পাবেন (২%)
        </div>

        {/* Wallet toggle */}
        {walletBalance > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 1px' }}>ওয়ালেট ব্যবহার করুন</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>ব্যালেন্স: ৳ {walletBalance.toLocaleString('bn-BD')}</p>
            </div>
            <div onClick={() => setUseWallet(!useWallet)}
              style={{ width: '40px', height: '22px', borderRadius: '20px', background: useWallet ? '#1D9E75' : '#D1D5DB', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '3px', left: useWallet ? '21px' : '3px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
            </div>
          </div>
        )}

        {/* Payment method */}
        <p style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>পেমেন্ট পদ্ধতি</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {paymentOptions.map(opt => (
            <div key={opt.id} onClick={() => setPaymentMethod(opt.id)}
              style={{ border: paymentMethod === opt.id ? '2px solid #1D9E75' : '1px solid #E5E7EB', borderRadius: '10px', padding: '10px', textAlign: 'center', cursor: 'pointer', background: paymentMethod === opt.id ? '#F0FBF7' : 'transparent' }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{opt.icon}</div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#111827', margin: 0 }}>{opt.name}</p>
            </div>
          ))}
        </div>

        {/* Note */}
        <Field label="বিশেষ নোট (ঐচ্ছিক)">
          <textarea style={{ ...inputStyle, height: '60px', resize: 'none' }} placeholder="ডেলিভারি বা অর্ডার সম্পর্কে কিছু জানাতে চাইলে লিখুন..." value={note} onChange={e => setNote(e.target.value)} />
        </Field>

        <button onClick={placeOrder} disabled={placing} style={{ ...greenBtnStyle, width: '100%', padding: '13px', fontSize: '15px', marginTop: '8px', opacity: placing ? 0.7 : 1 }}>
          {placing ? 'অর্ডার দেওয়া হচ্ছে...' : 'অর্ডার নিশ্চিত করুন →'}
        </button>
      </div>
    </div>
  )
}

// ─── Small helpers ───────────────────────────────────────────────
function SectionTitle({ children }) {
  return <p style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{children}</p>
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '3px' }}>{label}</label>
      {children}
    </div>
  )
}

function SummaryRow({ label, value, green }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: green ? '#1D9E75' : '#6B7280' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}

// ─── Shared styles ───────────────────────────────────────────────
const cardStyle = {
  background: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '1rem 1.25rem',
  marginBottom: '12px',
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#111827',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
}

const editBtnStyle = {
  fontSize: '12px',
  color: '#1D9E75',
  border: '1px solid #1D9E75',
  padding: '5px 12px',
  borderRadius: '20px',
  cursor: 'pointer',
  background: 'none',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}

const greenBtnStyle = {
  background: '#1D9E75',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'block',
}
