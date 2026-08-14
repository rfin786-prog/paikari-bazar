'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supaHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartQty, setCartQty] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState({});

  const syncCart = useCallback(() => {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    setCartQty(item?.quantity || 0);
    let total = 0, count = 0;
    cart.forEach(i => { total += (i.price || 0) * i.quantity; count += i.quantity; });
    setCartTotal(total);
    setCartCount(count);
  }, [id]);

  useEffect(() => {
    syncCart();
    window.addEventListener('cartUpdated', syncCart);
    return () => window.removeEventListener('cartUpdated', syncCart);
  }, [syncCart]);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        // Fetch product
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`,
          { headers: supaHeaders }
        );
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) { setLoading(false); return; }
        const prod = data[0];
        setProduct(prod);

        // Fetch related — same category_id, exclude self
        if (prod.category_id) {
          try {
            const relRes = await fetch(
              `${SUPABASE_URL}/rest/v1/products?category_id=eq.${prod.category_id}&id=neq.${id}&select=*&limit=10&order=created_at.desc`,
              { headers: supaHeaders }
            );
            const relData = await relRes.json();
            if (Array.isArray(relData)) setRelated(relData);
          } catch {}
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx === -1) cart.push({ ...product, quantity: 1 });
    else cart[idx].quantity += 1;
    saveCart(cart);
  };

  const handleIncrease = () => {
    if (!product) return;
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx !== -1) { cart[idx].quantity += 1; saveCart(cart); }
  };

  const handleDecrease = () => {
    if (!product) return;
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx === -1) return;
    if (cart[idx].quantity <= 1) cart.splice(idx, 1);
    else cart[idx].quantity -= 1;
    saveCart(cart);
  };

  const discount = product?.mrp && product.mrp > product.price
    ? Math.round((1 - product.price / product.mrp) * 100) : null;
  const outOfStock = product?.stock !== undefined && product?.stock !== null && product.stock <= 0;
  const inCart = cartQty > 0;

  // Build image list
  const images = product ? [
    product.image_url,
    product.image_url_2,
    product.image_url_3,
  ].filter(Boolean) : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family: 'Hind Siliguri', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .back-btn { background: #f5f5f5; border: none; border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; color: #555; transition: background 0.15s; }
        .back-btn:hover { background: #ebebeb; }
        .qty-btn { border: none; cursor: pointer; font-weight: 800; font-size: 22px; display: flex; align-items: center; justify-content: center; background: none; color: #fff; transition: transform 0.15s; font-family: 'Hind Siliguri', sans-serif; width: 52px; height: 48px; }
        .qty-btn:active { transform: scale(0.82); }
        .thumb { border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color 0.15s; flex-shrink: 0; }
        .thumb.active { border-color: #111; }
        .rel-card { background: #fff; border-radius: 12px; border: 1.5px solid #ebebeb; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; flex-shrink: 0; }
        .rel-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .add-to-cart-btn { width: 100%; background: #111; color: #fff; border: none; border-radius: 14px; padding: 15px; font-size: 15px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Hind Siliguri', sans-serif; transition: background 0.15s; }
        .add-to-cart-btn:hover { background: #222; }
        .add-to-cart-btn:active { transform: scale(0.98); }
        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f7f7f7', paddingBottom: 100 }}>

        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="back-btn" onClick={() => router.back()}>←</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Product Description</span>
          {cartCount > 0 && (
            <button onClick={() => router.push('/cart')}
              style={{ background: '#111', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Hind Siliguri, sans-serif' }}>
              🛒 {cartCount}
            </button>
          )}
          {cartCount === 0 && <div style={{ width: 36 }} />}
        </div>

        {loading ? (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}>
            <div style={{ height: 300, background: 'linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 16, marginBottom: 14 }} />
            <div style={{ background: '#fff', borderRadius: 16, padding: 20 }}>
              {[80, 50, 30].map((w, i) => (
                <div key={i} style={{ height: 16, width: `${w}%`, background: 'linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6, marginBottom: 14 }} />
              ))}
              <div style={{ height: 48, background: 'linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 12 }} />
            </div>
          </div>
        ) : !product ? (
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#555', marginBottom: 16 }}>Product Not Found</p>
            <button onClick={() => router.push('/products')}
              style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Hind Siliguri, sans-serif' }}>
              View All Products
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '14px 14px 0', animation: 'fadeUp 0.3s ease' }}>

            {/* Image Gallery */}
            <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ position: 'relative', background: '#f8f8f8', aspectRatio: '1/1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {images.length > 0 && !imgError[activeImg] ? (
                  <img
                    src={images[activeImg]}
                    alt={product.name}
                    onError={() => setImgError(prev => ({ ...prev, [activeImg]: true }))}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                    <span style={{ fontSize: 12, color: '#ccc' }}>No Image</span>
                  </div>
                )}
                {discount && !outOfStock && (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: '#e8192c', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>-{discount}%</span>
                )}
                {outOfStock && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ background: '#333', color: '#fff', fontSize: 14, fontWeight: 800, padding: '8px 20px', borderRadius: 20 }}>Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: '10px 14px 14px', overflowX: 'auto' }}>
                  {images.map((img, i) => (
                    <div key={i} className={`thumb${activeImg === i ? ' active' : ''}`}
                      onClick={() => setActiveImg(i)}
                      style={{ width: 60, height: 60, background: '#f5f5f5' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Card */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '18px 16px 20px', marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
                {product.brand && (
                  <span style={{ fontSize: 11, background: '#f5f5f5', color: '#666', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{product.brand}</span>
                )}
                {product.category && (
                  <span style={{ fontSize: 11, background: '#f0f0f0', color: '#888', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{product.category}</span>
                )}
              </div>

              {/* Name */}
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.45, marginBottom: 12 }}>{product.name}</h1>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: outOfStock ? '#bbb' : '#e8192c' }}>
                  ৳{product.price?.toLocaleString('en-US')}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span style={{ fontSize: 15, color: '#bbb', textDecoration: 'line-through', fontWeight: 500 }}>
                    ৳{product.mrp?.toLocaleString('en-US')}
                  </span>
                )}
                {discount && <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>{discount}% Off</span>}
              </div>

              {/* Cart Action */}
              {outOfStock ? (
                <div style={{ background: '#f3f4f6', borderRadius: 14, padding: 14, textAlign: 'center', color: '#aaa', fontWeight: 700, fontSize: 14 }}>
                  Out of Stock
                </div>
              ) : inCart ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#111', borderRadius: 14, overflow: 'hidden', flex: 1, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                    <button className="qty-btn" onClick={handleDecrease}>−</button>
                    <span style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 17 }}>{cartQty}</span>
                    <button className="qty-btn" onClick={handleIncrease}>+</button>
                  </div>
                  <button onClick={() => router.push('/cart')}
                    style={{ background: '#f5f5f5', color: '#111', border: 'none', borderRadius: 14, height: 48, padding: '0 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Hind Siliguri, sans-serif' }}>
                    Cart →
                  </button>
                </div>
              ) : (
                <button className="add-to-cart-btn" onClick={handleAdd}>
                  <span>🛒</span> Add to Cart
                </button>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 10 }}>📋 Details</h2>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{product.description}</p>
              </div>
            )}

            {/* Extra info */}
            {(product.sku || product.weight || product.unit || product.brand) && (
              <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 12 }}>ℹ️ Information</h2>
                {[
                  product.brand    && ['Brand', product.brand],
                  product.category && ['Category', product.category],
                  product.sku      && ['SKU', product.sku],
                  product.weight   && ['Weight', product.weight],
                  product.unit     && ['Unit', product.unit],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <span style={{ fontSize: 13, color: '#888' }}>{label}</span>
                    <span style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Related Products */}
            {related.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>🔗 Related Products</h2>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
                  {related.map(rel => {
                    const relDisc = rel.mrp && rel.mrp > rel.price ? Math.round((1 - rel.price / rel.mrp) * 100) : null;
                    return (
                      <div key={rel.id} className="rel-card"
                        onClick={() => router.push(`/products/${rel.id}`)}
                        style={{ width: 140, minWidth: 140 }}>
                        <div style={{ height: 110, background: '#f8f8f8', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {rel.image_url
                            ? <img src={rel.image_url} alt={rel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                          }
                          {relDisc && (
                            <span style={{ position: 'absolute', top: 6, right: 6, background: '#e8192c', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20 }}>-{relDisc}%</span>
                          )}
                        </div>
                        <div style={{ padding: '8px 10px 10px' }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4, marginBottom: 5, minHeight: 34 }}>{rel.name}</p>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#e8192c' }}>৳{rel.price?.toLocaleString('en-US')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fixed Bottom Cart Bar */}
        {cartCount > 0 && !loading && product && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, padding: '10px 16px 24px', background: 'linear-gradient(to top, #f7f7f7 65%, transparent)', animation: 'slideUp 0.3s ease' }}>
            <button onClick={() => router.push('/cart')}
              style={{ width: '100%', maxWidth: 560, margin: '0 auto', display: 'flex', background: '#111', color: '#fff', border: 'none', borderRadius: 16, padding: '13px 20px', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,0.2)', fontFamily: 'Hind Siliguri, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🛒</div>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{cartCount} Products</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>৳{cartTotal.toLocaleString('en-US')}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>View Cart →</div>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
