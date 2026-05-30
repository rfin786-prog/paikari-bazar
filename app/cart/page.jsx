'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncCart = useCallback(() => {
    setCartItems(getCart());
    setLoading(false);
  }, []);

  useEffect(() => {
    syncCart();
    window.addEventListener('cartUpdated', syncCart);
    return () => window.removeEventListener('cartUpdated', syncCart);
  }, [syncCart]);

  const handleIncrease = (id) => {
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx !== -1) { cart[idx].quantity += 1; saveCart(cart); }
  };

  const handleDecrease = (id, minOrder) => {
    const minQty = minOrder ? parseInt(minOrder) : 1;
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    if (cart[idx].quantity <= minQty) cart.splice(idx, 1);
    else cart[idx].quantity -= 1;
    saveCart(cart);
  };

  const handleRemove = (id) => {
    const cart = getCart().filter(i => i.id !== id);
    saveCart(cart);
  };

  const handleClearCart = () => {
    if (confirm('কার্ট খালি করবেন?')) saveCart([]);
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const totalQty = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family: 'Hind Siliguri', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { transform:translateY(60px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }

        .cart-item {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #ebebeb;
          overflow: hidden;
          animation: fadeUp 0.3s ease forwards;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cart-item:hover { border-color: #d0d0d0; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

        .qty-btn {
          border: none; cursor: pointer;
          font-weight: 700; font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          background: none; color: #fff;
          transition: background 0.12s, transform 0.12s;
          font-family: 'Hind Siliguri', sans-serif;
          width: 40px; height: 38px;
        }
        .qty-btn:hover { background: rgba(255,255,255,0.1); }
        .qty-btn:active { transform: scale(0.82); }

        .remove-btn {
          border: none; background: none; cursor: pointer;
          color: #d0d0d0; font-size: 15px; padding: 3px 5px;
          transition: color 0.15s; flex-shrink: 0;
        }
        .remove-btn:hover { color: #999; }

        .checkout-btn {
          border: none; cursor: pointer;
          font-family: 'Hind Siliguri', sans-serif;
          transition: background 0.18s, transform 0.18s;
          display: flex;
        }
        .checkout-btn:hover { background: #222 !important; transform: translateY(-1px); }
        .checkout-btn:active { transform: scale(0.98); }

        .back-btn { transition: background 0.15s; }
        .back-btn:hover { background: #ebebeb !important; }

        .clear-btn { transition: all 0.15s; }
        .clear-btn:hover { border-color: #111 !important; color: #111 !important; }

        .continue-btn { transition: all 0.15s; }
        .continue-btn:hover { border-color: #111 !important; color: #111 !important; }

        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-thumb { background: #e8e8e8; border-radius: 4px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f7f7f7', paddingBottom: cartItems.length > 0 ? 96 : 24 }}>

        {/* ── Header ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="back-btn" onClick={() => router.back()}
              style={{ background: '#f5f5f5', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#555' }}>←</button>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>আমার কার্ট</h1>
              {cartItems.length > 0 && <p style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{cartItems.length}টি পণ্য</p>}
            </div>
          </div>
          {cartItems.length > 0 && (
            <button className="clear-btn" onClick={handleClearCart}
              style={{ fontSize: 12, color: '#aaa', background: 'none', border: '1.5px solid #ebebeb', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Hind Siliguri' }}>
              সব মুছুন
            </button>
          )}
        </div>

        <div style={{ maxWidth: 560, margin: '0 auto', padding: '14px 14px 0' }}>

          {/* ── Skeleton ── */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, height: 100, border: '1.5px solid #f0f0f0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,#f7f7f7 25%,#efefef 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                </div>
              ))}
            </div>

          /* ── Empty ── */
          ) : cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeUp 0.4s ease' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#333', marginBottom: 8 }}>কার্ট খালি আছে</p>
              <p style={{ fontSize: 13, color: '#bbb', marginBottom: 24 }}>পছন্দের পণ্য কার্টে যোগ করুন</p>
              <button onClick={() => router.push('/products')}
                style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Hind Siliguri' }}>
                পণ্য দেখুন →
              </button>
            </div>

          ) : (
            <>
              {/* ── Cart Items ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {cartItems.map((item, i) => {
                  const qty = item.quantity || 1;
                  const minQty = item.min_order ? parseInt(item.min_order) : 1;
                  const itemTotal = item.price * qty;

                  return (
                    <div key={item.id} className="cart-item" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div style={{ display: 'flex' }}>

                        {/* Image */}
                        <div style={{ width: 90, flexShrink: 0, background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100, overflow: 'hidden' }}>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d8d8d8" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <path d="m21 15-5-5L5 21"/>
                            </svg>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>

                          {/* Name + remove */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.5, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {item.name}
                            </p>
                            <button className="remove-btn" onClick={() => handleRemove(item.id)}>✕</button>
                          </div>

                          {/* Price + qty */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: -0.3 }}>
                                ৳{itemTotal.toLocaleString('bn-BD')}
                              </div>
                              <div style={{ fontSize: 10, color: '#c0c0c0', fontWeight: 500, marginTop: 1 }}>
                                ৳{item.price} × {qty}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', background: '#111', borderRadius: 10, overflow: 'hidden' }}>
                              <button className="qty-btn" onClick={() => handleDecrease(item.id, item.min_order)}>−</button>
                              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, minWidth: 26, textAlign: 'center' }}>{qty}</span>
                              <button className="qty-btn" onClick={() => handleIncrease(item.id)}>+</button>
                            </div>
                          </div>

                          {minQty > 1 && (
                            <p style={{ fontSize: 10, color: '#bbb', fontWeight: 600 }}>সর্বনিম্ন অর্ডার: {minQty}টি</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Order Summary ── */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #ebebeb', padding: '16px', marginBottom: 10, animation: 'fadeUp 0.35s ease 0.1s both' }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: '#c8c8c8', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>অর্ডার সারসংক্ষেপ</p>

                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <span style={{ fontSize: 12, color: '#aaa', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                      {item.name} × {item.quantity || 1}
                    </span>
                    <span style={{ fontSize: 12, color: '#555', fontWeight: 600, flexShrink: 0 }}>
                      ৳{(item.price * (item.quantity || 1)).toLocaleString('bn-BD')}
                    </span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1.5px solid #f0f0f0' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>সাবটোটাল</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: -0.5 }}>৳{subtotal.toLocaleString('bn-BD')}</span>
                </div>
                <p style={{ fontSize: 10, color: '#c0c0c0', marginTop: 6 }}>* ডেলিভারি চার্জ চেকআউটে যোগ হবে</p>
              </div>

              {/* Continue shopping */}
              <button className="continue-btn" onClick={() => router.push('/products')}
                style={{ width: '100%', background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 12, padding: '11px', fontSize: 13, fontWeight: 600, color: '#999', cursor: 'pointer', fontFamily: 'Hind Siliguri', marginBottom: 10, animation: 'fadeUp 0.35s ease 0.15s both' }}>
                ← আরও কেনাকাটা করুন
              </button>
            </>
          )}
        </div>

        {/* ── Fixed Checkout Bar ── */}
        {cartItems.length > 0 && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, padding: '10px 16px 24px', background: 'linear-gradient(to top, #f7f7f7 65%, transparent)' }}>
            <button className="checkout-btn" onClick={() => router.push('/checkout')}
              style={{ width: '100%', maxWidth: 560, margin: '0 auto', background: '#111', color: '#fff', border: 'none', borderRadius: 16, padding: '14px 20px', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', animation: 'slideUp 0.3s ease' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{totalQty}টি পণ্য</div>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>৳{subtotal.toLocaleString('bn-BD')}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>চেকআউট করুন →</div>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
