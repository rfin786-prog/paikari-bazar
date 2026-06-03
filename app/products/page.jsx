'use client';

import { Suspense, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
 apikey: SUPABASE_KEY,
 Authorization: `Bearer ${SUPABASE_KEY}`,
};

const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const saveCart = (cart) => {
 localStorage.setItem('cart', JSON.stringify(cart));
 window.dispatchEvent(new Event('cartUpdated'));
};

function SkeletonCard() {
 return (
   <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
     <div style={{ aspectRatio: '1/1', background: 'linear-gradient(90deg,#f7f7f7 25%,#efefef 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
     <div style={{ padding: '10px' }}>
       <div style={{ height: 10, background: 'linear-gradient(90deg,#f7f7f7 25%,#efefef 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6, marginBottom: 7 }} />
       <div style={{ height: 10, width: '60%', background: 'linear-gradient(90deg,#f7f7f7 25%,#efefef 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6 }} />
     </div>
   </div>
 );
}

function ProductsPageContent() {
 const router = useRouter();
 const [products, setProducts] = useState([]);
 const [categories, setCategories] = useState([]);
 const [subMap, setSubMap] = useState({});
 const [activeCategory, setActiveCategory] = useState(null);
 const [activeSubcat, setActiveSubcat] = useState(null);
 const [loading, setLoading] = useState(true);
 const [cartQty, setCartQty] = useState({});
 const [cartTotal, setCartTotal] = useState(0);
 const [cartCount, setCartCount] = useState(0);
 const [isMobile, setIsMobile] = useState(false);
 const [flyingItems, setFlyingItems] = useState([]);
 const subcatRefs = useRef({});

 const syncCart = useCallback(() => {
   const cart = getCart();
   const map = {};
   let total = 0, count = 0;
   cart.forEach(i => {
     map[i.id] = i.quantity;
     total += (i.price || 0) * i.quantity;
     count += i.quantity;
   });
   setCartQty(map);
   setCartTotal(total);
   setCartCount(count);
 }, []);

 useEffect(() => {
   syncCart();
   window.addEventListener('cartUpdated', syncCart);
   return () => window.removeEventListener('cartUpdated', syncCart);
 }, [syncCart]);

 useEffect(() => {
   const check = () => setIsMobile(window.innerWidth < 768);
   check();
   window.addEventListener('resize', check);
   return () => window.removeEventListener('resize', check);
 }, []);

 useEffect(() => {
   const fetchCategories = async () => {
     try {
       const res = await fetch(
         `${SUPABASE_URL}/rest/v1/categories?select=*&order=sort_order.asc,created_at.asc`,
         { headers }
       );
       const data = await res.json();
       if (!Array.isArray(data)) return;
       const parents = data.filter(c => c.parent_id === null);
       const children = data.filter(c => c.parent_id !== null);
       const map = {};
       children.forEach(c => {
         if (!map[c.parent_id]) map[c.parent_id] = [];
         map[c.parent_id].push(c);
       });
       setCategories(parents);
       setSubMap(map);
       if (parents.length > 0) setActiveCategory(parents[0]);
     } catch (e) { console.error(e); }
   };
   fetchCategories();
 }, []);

 useEffect(() => {
   const fetchProducts = async () => {
     try {
       const res = await fetch(
         `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
         { headers }
       );
       const data = await res.json();
       if (Array.isArray(data)) setProducts(data);
     } catch (e) { console.error(e); }
     finally { setLoading(false); }
   };
   fetchProducts();
 }, []);

 const subcategories = useMemo(() => {
   if (!activeCategory) return [];
   return subMap[activeCategory.id] || [];
 }, [activeCategory, subMap]);

 const groupedProducts = useMemo(() => {
   if (!activeCategory) return {};
   let list = products.filter(p => p.category_id === activeCategory.id);
   if (activeSubcat) {
     return {
       [activeSubcat.name]: { items: list.filter(p => p.sub_category_id === activeSubcat.id) }
     };
   }
   const groups = {};
   const noSubcat = [];
   subcategories.forEach(sub => {
     const items = list.filter(p => p.sub_category_id === sub.id);
     if (items.length > 0) groups[sub.name] = { items, sub };
   });
   list.forEach(p => {
     const matched = subcategories.some(s => s.id === p.sub_category_id);
     if (!matched) noSubcat.push(p);
   });
   if (noSubcat.length > 0) groups['অন্যান্য'] = { items: noSubcat, sub: null };
   return groups;
 }, [products, activeCategory, activeSubcat, subcategories]);

 const handleCategoryClick = (cat) => {
   setActiveCategory(cat);
   setActiveSubcat(null);
   window.scrollTo({ top: 0, behavior: 'smooth' });
 };

 const handleSubcatClick = (sub) => {
   if (activeSubcat?.id === sub.id) {
     setActiveSubcat(null);
     return;
   }
   setActiveSubcat(sub);
   setTimeout(() => {
     const el = subcatRefs.current[sub.name];
     if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
   }, 50);
 };

 const triggerFly = (e, product) => {
   const startX = e.clientX;
   const startY = e.clientY;
   const cartBar = document.getElementById('view-cart-bar');
   if (!cartBar) return;
   const rect = cartBar.getBoundingClientRect();
   const endX = rect.left + rect.width / 2;
   const endY = rect.top + rect.height / 2;
   const id = Date.now() + Math.random();
   setFlyingItems(prev => [...prev, { id, startX, startY, endX, endY, imageUrl: product.image_url }]);
   setTimeout(() => {
     setFlyingItems(prev => prev.filter(f => f.id !== id));
   }, 650);
 };

 const handleAddToCart = (e, product) => {
   e.stopPropagation();
   const minQty = product.min_order ? parseInt(product.min_order) : 1;
   const cart = getCart();
   const idx = cart.findIndex(i => i.id === product.id);
   if (idx === -1) cart.push({ ...product, quantity: minQty });
   else cart[idx].quantity += 1;
   saveCart(cart);
   triggerFly(e, product);
 };

 const handleIncrease = (e, product) => {
   e.stopPropagation();
   const cart = getCart();
   const idx = cart.findIndex(i => i.id === product.id);
   if (idx !== -1) { cart[idx].quantity += 1; saveCart(cart); }
   triggerFly(e, product);
 };

 const handleDecrease = (e, product) => {
   e.stopPropagation();
   const minQty = product.min_order ? parseInt(product.min_order) : 1;
   const cart = getCart();
   const idx = cart.findIndex(i => i.id === product.id);
   if (idx === -1) return;
   if (cart[idx].quantity <= minQty) cart.splice(idx, 1);
   else cart[idx].quantity -= 1;
   saveCart(cart);
 };

 const ProductCard = ({ p }) => {
   const qty = cartQty[p.id] || 0;
   const inCart = qty > 0;
   const outOfStock = p.stock !== undefined && p.stock !== null && p.stock <= 0;
   const minQty = p.min_order ? parseInt(p.min_order) : 1;
   const discount = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : null;

   return (
     <div className="prod-card" style={{
       background: '#fff',
       borderRadius: 16,
       overflow: 'hidden',
       border: '1px solid #f0f0f0',
       boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
       opacity: outOfStock ? 0.55 : 1,
       transition: 'box-shadow 0.2s, transform 0.2s',
     }}>
       {/* Image area */}
       <div style={{ position: 'relative', background: '#f5f5f5', aspectRatio: '1/1', overflow: 'hidden' }}>
         {p.image_url
           ? <img src={p.image_url} alt={p.name} className="prod-img" loading="lazy"
               style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.35s' }} />
           : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5">
                 <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
               </svg>
             </div>
         }

         {/* Out of stock overlay */}
         {outOfStock && (
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <span style={{ background: '#333', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 20 }}>Stock নেই</span>
           </div>
         )}

         {/* Add / stepper button — bottom right of image */}
         {!outOfStock && (
           <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
             {inCart ? (
               <div onClick={e => e.stopPropagation()}
                 style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 24, border: '1.5px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', overflow: 'hidden', height: 32 }}>
                 <button onClick={e => handleDecrease(e, p)}
                   style={{ width: 32, height: 32, background: 'none', border: 'none', color: '#111', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                 <span style={{ color: '#111', fontWeight: 800, fontSize: 13, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                 <button onClick={e => handleIncrease(e, p)}
                   style={{ width: 32, height: 32, background: '#111', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
               </div>
             ) : (
               <button onClick={e => handleAddToCart(e, p)} className="add-btn"
                 style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #e0e0e0', background: '#fff', color: '#111', fontSize: 22, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', lineHeight: 1 }}>
                 +
               </button>
             )}
           </div>
         )}
       </div>

       {/* Info area */}
       <div style={{ padding: '10px 10px 12px' }}>
         {/* Price row */}
         <div style={{ marginBottom: 5 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
             <span style={{ fontSize: 16, fontWeight: 800, color: '#e8192c' }}>
               ৳{p.price?.toLocaleString('bn-BD')}
             </span>
             {p.mrp && p.mrp > p.price && (
               <span style={{ fontSize: 12, color: '#aaa', textDecoration: 'line-through', fontWeight: 500 }}>
                 ৳{p.mrp?.toLocaleString('bn-BD')}
               </span>
             )}
           </div>
           {discount && (
             <div style={{ marginTop: 4 }}>
               <span style={{ fontSize: 11, background: '#ffe4e6', color: '#e8192c', fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>
                 {discount}% off
               </span>
             </div>
           )}
         </div>

         {/* Name */}
         <p style={{ fontSize: 12, fontWeight: 500, color: '#444', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 36 }}>
           {p.name}
         </p>

         {minQty > 1 && (
           <p style={{ fontSize: 10, color: '#bbb', marginTop: 4, fontWeight: 600 }}>Min: {minQty} pcs</p>
         )}
       </div>
     </div>
   );
 };

 return (
   <>
     <style>{`
       @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');
       *, *::before, *::after { font-family: 'Hind Siliguri', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

       @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
       @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
       @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
       @keyframes slideUp { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
       @keyframes cartBounce {
         0%   { transform: translateY(0); }
         30%  { transform: translateY(-6px); }
         60%  { transform: translateY(-3px); }
         100% { transform: translateY(0); }
       }
       @keyframes flyToCart {
         0%   { transform: translate(0,0) scale(1); opacity: 1; }
         70%  { opacity: 0.8; }
         100% { transform: translate(var(--fly-x), var(--fly-y)) scale(0.12); opacity: 0; }
       }

       .prod-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
       .prod-card:hover .prod-img { transform: scale(1.04); }
       .add-btn:hover { background: #111 !important; color: #fff !important; border-color: #111 !important; }
       .add-btn:active { transform: scale(0.88); }

       .cat-tab { cursor: pointer; white-space: nowrap; border: none; background: transparent; font-family: 'Hind Siliguri', sans-serif; transition: all 0.15s; flex-shrink: 0; display: flex; align-items: center; gap: 6px; }
       .subcat-chip { cursor: pointer; white-space: nowrap; border: none; font-family: 'Hind Siliguri', sans-serif; transition: all 0.15s; }
       .subcat-chip:hover { background: #111 !important; color: #fff !important; }

       .view-cart-bar {
         position: fixed;
         bottom: 16px;
         left: 50%;
         transform: translateX(-50%);
         z-index: 150;
         width: calc(100% - 32px);
         max-width: 480px;
         display: flex;
         align-items: center;
         justify-content: space-between;
         background: #e8192c;
         color: #fff;
         border: none;
         border-radius: 16px;
         padding: 13px 16px;
         cursor: pointer;
         box-shadow: 0 8px 32px rgba(232,25,44,0.35);
         font-family: 'Hind Siliguri', sans-serif;
         animation: slideUp 0.3s ease forwards;
         transition: background 0.2s, transform 0.15s;
       }
       .view-cart-bar:hover { background: #c8001e; transform: translateX(-50%) translateY(-2px); }
       .view-cart-bar:active { transform: translateX(-50%) scale(0.98); }
       .view-cart-bar.bounce { animation: slideUp 0.3s ease forwards, cartBounce 0.4s ease; }

       ::-webkit-scrollbar { height: 3px; width: 3px; }
       ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
       .section-fade { animation: fadeUp 0.3s ease forwards; }
     `}</style>

     {/* Flying items */}
     {flyingItems.map(fly => (
       <div key={fly.id} style={{
         position: 'fixed',
         left: fly.startX - 24,
         top: fly.startY - 24,
         width: 48, height: 48,
         borderRadius: 10,
         overflow: 'hidden',
         zIndex: 999,
         pointerEvents: 'none',
         '--fly-x': `${fly.endX - fly.startX}px`,
         '--fly-y': `${fly.endY - fly.startY}px`,
         animation: 'flyToCart 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
         boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
       }}>
         {fly.imageUrl
           ? <img src={fly.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           : <div style={{ width: '100%', height: '100%', background: '#e8192c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛒</div>
         }
       </div>
     ))}

     <div style={{ minHeight: '100vh', background: '#f7f7f7', paddingBottom: cartCount > 0 ? 90 : 16 }}>

       {/* Category Tab Bar */}
       <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
         <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
           {categories.map(cat => {
             const isActive = activeCategory?.id === cat.id;
             return (
               <button key={cat.id} className="cat-tab"
                 onClick={() => handleCategoryClick(cat)}
                 style={{
                   padding: '0 18px', height: 48, fontSize: 13,
                   fontWeight: isActive ? 800 : 500,
                   color: isActive ? '#111' : '#999',
                   borderBottom: `2.5px solid ${isActive ? '#111' : 'transparent'}`,
                 }}>
                 {cat.image_url && (
                   <img src={cat.image_url} alt={cat.name} style={{ width: 20, height: 20, objectFit: 'cover', borderRadius: 4 }} />
                 )}
                 {cat.name}
               </button>
             );
           })}
         </div>

         {subcategories.length > 0 && (
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', overflowX: 'auto', scrollbarWidth: 'none', borderTop: '1px solid #f5f5f5' }}>
             <button className="subcat-chip" onClick={() => setActiveSubcat(null)}
               style={{ flexShrink: 0, width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${!activeSubcat ? '#111' : '#e0e0e0'}`, background: !activeSubcat ? '#111' : '#fff', color: !activeSubcat ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
               ↕
             </button>
             {subcategories.map(sub => (
               <button key={sub.id} className="subcat-chip"
                 onClick={() => handleSubcatClick(sub)}
                 style={{
                   flexShrink: 0, padding: '6px 16px', borderRadius: 24,
                   fontSize: 12, fontWeight: 700,
                   border: `1.5px solid ${activeSubcat?.id === sub.id ? '#111' : '#e0e0e0'}`,
                   background: activeSubcat?.id === sub.id ? '#111' : '#fff',
                   color: activeSubcat?.id === sub.id ? '#fff' : '#555',
                 }}>
                 {sub.name}
               </button>
             ))}
           </div>
         )}
       </div>

       {/* Main Content */}
       <div style={{ flex: 1, padding: isMobile ? '12px 10px' : '16px 20px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
         {loading ? (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
             {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
           </div>
         ) : Object.keys(groupedProducts).length === 0 ? (
           <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeUp 0.4s ease' }}>
             <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
             <p style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 6 }}>কোন পণ্য পাওয়া যায়নি</p>
             <p style={{ fontSize: 12, color: '#bbb' }}>অন্য ক্যাটাগরি চেষ্টা করন</p>
           </div>
         ) : (
           Object.entries(groupedProducts).map(([subcatName, { items }]) => (
             <div key={subcatName} className="section-fade"
               ref={el => subcatRefs.current[subcatName] = el}
               style={{ marginBottom: 28 }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                 <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: -0.3 }}>{subcatName}</h2>
                 <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600 }}>{items.length}টি পণ্য</span>
               </div>
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
                 gap: isMobile ? 10 : 14,
               }}>
                 {items.map(p => <ProductCard key={p.id} p={p} />)}
               </div>
             </div>
           ))
         )}
       </div>
     </div>

     {/* View Cart Bar */}
     {cartCount > 0 && (
       <button id="view-cart-bar" className="view-cart-bar" onClick={() => router.push('/cart')}>
         {/* Left: count badge */}
         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
           <div style={{
             width: 32, height: 32, borderRadius: '50%',
             background: 'rgba(255,255,255,0.22)',
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             fontSize: 13, fontWeight: 800, border: '2px solid rgba(255,255,255,0.4)',
             animation: 'popIn 0.3s ease',
           }}>
             {cartCount}
           </div>
           <span style={{ fontSize: 14, fontWeight: 700 }}>View cart</span>
         </div>

         {/* Right: total */}
         <div style={{ fontSize: 15, fontWeight: 800 }}>
           ৳{cartTotal.toLocaleString('bn-BD')}
         </div>
       </button>
     )}
   </>
 );
}

export default function ProductsPage() {
 return (
   <Suspense fallback={
     <div style={{ minHeight: '100vh', background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hind Siliguri, sans-serif', color: '#bbb', fontSize: 14 }}>
       <div style={{ textAlign: 'center' }}>
         <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
         <p>লোড হচ্ছে...</p>
       </div>
     </div>
   }>
     <ProductsPageContent />
   </Suspense>
 );
}
