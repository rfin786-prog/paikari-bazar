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
   <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
     <div style={{ aspectRatio: '1/1', background: 'linear-gradient(90deg,#f7f7f7 25%,#efefef 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
     <div style={{ padding: '12px' }}>
       <div style={{ height: 10, background: 'linear-gradient(90deg,#f7f7f7 25%,#efefef 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6, marginBottom: 7 }} />
       <div style={{ height: 10, width: '60%', background: 'linear-gradient(90deg,#f7f7f7 25%,#efefef 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6 }} />
     </div>
   </div>
 );
}

// Draggable Basket Component
function DraggableBasket({ cartCount, cartTotal, onNavigate, onShake, shaking }) {
 const [pos, setPos] = useState({ x: null, y: null });
 const dragging = useRef(false);
 const offset = useRef({ x: 0, y: 0 });
 const basketRef = useRef(null);
 const hasMoved = useRef(false);

 useEffect(() => {
   // Default position: bottom right
   setPos({
     x: window.innerWidth - 90,
     y: window.innerHeight - 120,
   });
 }, []);

 const onPointerDown = (e) => {
   dragging.current = true;
   hasMoved.current = false;
   const rect = basketRef.current.getBoundingClientRect();
   offset.current = {
     x: e.clientX - rect.left,
     y: e.clientY - rect.top,
   };
   basketRef.current.setPointerCapture(e.pointerId);
 };

 const onPointerMove = (e) => {
   if (!dragging.current) return;
   hasMoved.current = true;
   const newX = e.clientX - offset.current.x;
   const newY = e.clientY - offset.current.y;
   const maxX = window.innerWidth - 70;
   const maxY = window.innerHeight - 70;
   setPos({
     x: Math.max(0, Math.min(newX, maxX)),
     y: Math.max(0, Math.min(newY, maxY)),
   });
 };

 const onPointerUp = (e) => {
   dragging.current = false;
   if (!hasMoved.current) {
     onNavigate();
   }
 };

 if (pos.x === null) return null;

 return (
   <div
     ref={basketRef}
     id="draggable-basket"
     onPointerDown={onPointerDown}
     onPointerMove={onPointerMove}
     onPointerUp={onPointerUp}
     style={{
       position: 'fixed',
       left: pos.x,
       top: pos.y,
       zIndex: 200,
       width: 64,
       height: 64,
       cursor: 'grab',
       userSelect: 'none',
       touchAction: 'none',
       animation: shaking ? 'basketShake 0.45s ease' : 'none',
       filter: shaking ? 'drop-shadow(0 0 10px rgba(245,158,11,0.9))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
       transition: 'filter 0.3s',
     }}
   >
     {/* Basket SVG */}
     <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
       {/* Handle */}
       <path d="M20 26 Q20 14 32 14 Q44 14 44 26" stroke="#92400e" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
       {/* Body */}
       <rect x="10" y="26" width="44" height="28" rx="5" fill="#f59e0b"/>
       {/* Stripes */}
       <line x1="22" y1="26" x2="22" y2="54" stroke="#d97706" strokeWidth="2.5"/>
       <line x1="32" y1="26" x2="32" y2="54" stroke="#d97706" strokeWidth="2.5"/>
       <line x1="42" y1="26" x2="42" y2="54" stroke="#d97706" strokeWidth="2.5"/>
       {/* Top rim */}
       <rect x="8" y="24" width="48" height="7" rx="3.5" fill="#d97706"/>
     </svg>

     {/* Count badge */}
     {cartCount > 0 && (
       <div style={{
         position: 'absolute', top: -4, right: -4,
         background: '#ef4444', color: '#fff',
         borderRadius: '50%', width: 22, height: 22,
         fontSize: 11, fontWeight: 800,
         display: 'flex', alignItems: 'center', justifyContent: 'center',
         border: '2px solid #fff',
         fontFamily: 'Hind Siliguri, sans-serif',
         animation: shaking ? 'popIn 0.3s ease' : 'none',
       }}>
         {cartCount}
       </div>
     )}

     {/* Total label */}
     {cartCount > 0 && (
       <div style={{
         position: 'absolute', bottom: -22, left: '50%', transform: 'translateX(-50%)',
         background: '#111', color: '#fff',
         borderRadius: 8, padding: '2px 7px',
         fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
         fontFamily: 'Hind Siliguri, sans-serif',
       }}>
         ৳{cartTotal.toLocaleString('bn-BD')}
       </div>
     )}
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
 const [basketShaking, setBasketShaking] = useState(false);
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
   // Get click position
   const startX = e.clientX;
   const startY = e.clientY;

   // Get basket position
   const basket = document.getElementById('draggable-basket');
   if (!basket) return;
   const rect = basket.getBoundingClientRect();
   const endX = rect.left + rect.width / 2;
   const endY = rect.top + rect.height / 2;

   const id = Date.now() + Math.random();
   const imageUrl = product.image_url;

   setFlyingItems(prev => [...prev, { id, startX, startY, endX, endY, imageUrl }]);

   // Remove after animation
   setTimeout(() => {
     setFlyingItems(prev => prev.filter(f => f.id !== id));
     // Shake basket
     setBasketShaking(true);
     setTimeout(() => setBasketShaking(false), 500);
   }, 600);
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
   const savedAmount = p.mrp && p.mrp > p.price ? p.mrp - p.price : 0;

   return (
     <div className="prod-card" style={{
       background: '#fff', borderRadius: 12,
       border: `1.5px solid ${inCart ? '#222' : '#efefef'}`,
       overflow: 'hidden', opacity: outOfStock ? 0.55 : 1,
       boxShadow: inCart ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
       cursor: 'default', transition: 'box-shadow 0.2s, transform 0.2s',
     }}>
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
         {outOfStock && (
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <span style={{ background: '#333', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 20 }}>Stock নেই</span>
           </div>
         )}
         {discount && !outOfStock && (
           <span style={{ position: 'absolute', top: 8, left: 8, background: '#111', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>
             {discount}% ছড়
           </span>
         )}
         {inCart && (
           <div style={{ position: 'absolute', top: 8, right: 8, background: '#111', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, border: '2px solid #fff', animation: 'popIn 0.25s ease' }}>
             {qty}
           </div>
         )}
       </div>

       <div style={{ padding: '10px 10px 12px' }}>
         <p style={{ fontSize: 12, fontWeight: 600, color: '#333', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 8, minHeight: 36 }}>
           {p.name}
         </p>
         <div style={{ marginBottom: 8 }}>
           {p.mrp && p.mrp > p.price && (
             <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
               <span style={{ fontSize: 10, color: '#aaa', fontWeight: 500 }}>MRP</span>
               <span style={{ fontSize: 11, color: '#bbb', textDecoration: 'line-through', fontWeight: 500 }}>৳{p.mrp?.toLocaleString('bn-BD')}</span>
             </div>
           )}
           <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
             <span style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>৳{p.price?.toLocaleString('bn-BD')}</span>
             {savedAmount > 0 && (
               <span style={{ fontSize: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 700, padding: '2px 7px', borderRadius: 12 }}>
                 Save ৳{savedAmount.toLocaleString('bn-BD')}
               </span>
             )}
           </div>
         </div>
         {minQty > 1 && (
           <p style={{ fontSize: 10, color: '#bbb', marginBottom: 8, fontWeight: 600 }}>Min: {minQty} pcs</p>
         )}
         {!outOfStock && (
           inCart ? (
             <div onClick={e => e.stopPropagation()}
               style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', borderRadius: 8, overflow: 'hidden', height: 36 }}>
               <button onClick={e => handleDecrease(e, p)} style={{ width: 40, height: 36, background: 'none', border: 'none', color: '#fff', fontSize: 20, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
               <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{qty}</span>
               <button onClick={e => handleIncrease(e, p)} style={{ width: 40, height: 36, background: 'none', border: 'none', color: '#fff', fontSize: 20, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
             </div>
           ) : (
             <button onClick={e => handleAddToCart(e, p)} className="add-cart-btn"
               style={{ width: '100%', height: 36, borderRadius: 8, border: '1.5px solid #111', background: '#fff', color: '#111', fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s' }}>
               🛒 Add to Cart
             </button>
           )
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
       @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }

       @keyframes basketShake {
         0%   { transform: rotate(0deg) scale(1); }
         15%  { transform: rotate(-12deg) scale(1.12); }
         30%  { transform: rotate(10deg) scale(1.08); }
         45%  { transform: rotate(-8deg) scale(1.05); }
         60%  { transform: rotate(6deg) scale(1.03); }
         75%  { transform: rotate(-4deg) scale(1.01); }
         100% { transform: rotate(0deg) scale(1); }
       }

       @keyframes flyToBasket {
         0%   { transform: translate(0, 0) scale(1); opacity: 1; }
         60%  { opacity: 1; }
         100% { transform: translate(var(--fly-x), var(--fly-y)) scale(0.15); opacity: 0; }
       }

       .prod-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.09) !important; }
       .prod-card:hover .prod-img { transform: scale(1.04); }
       .add-cart-btn:hover { background: #111 !important; color: #fff !important; }

       .cat-tab { cursor: pointer; white-space: nowrap; border: none; background: transparent; font-family: 'Hind Siliguri', sans-serif; transition: all 0.15s; flex-shrink: 0; display: flex; align-items: center; gap: 6px; }
       .subcat-chip { cursor: pointer; white-space: nowrap; border: none; font-family: 'Hind Siliguri', sans-serif; transition: all 0.15s; }
       .subcat-chip:hover { background: #111 !important; color: #fff !important; }

       ::-webkit-scrollbar { height: 3px; width: 3px; }
       ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
       .section-fade { animation: fadeUp 0.3s ease forwards; }
     `}</style>

     {/* Flying items layer */}
     {flyingItems.map(fly => (
       <div
         key={fly.id}
         style={{
           position: 'fixed',
           left: fly.startX - 24,
           top: fly.startY - 24,
           width: 48,
           height: 48,
           borderRadius: 10,
           overflow: 'hidden',
           zIndex: 999,
           pointerEvents: 'none',
           '--fly-x': `${fly.endX - fly.startX}px`,
           '--fly-y': `${fly.endY - fly.startY}px`,
           animation: 'flyToBasket 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
           boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
         }}
       >
         {fly.imageUrl
           ? <img src={fly.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           : <div style={{ width: '100%', height: '100%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛒</div>
         }
       </div>
     ))}

     <div style={{ minHeight: '100vh', background: '#f7f7f7', paddingBottom: 20 }}>

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
             <p style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 6 }}>কোনো পণ্য পাওয়া যায়নি</p>
             <p style={{ fontSize: 12, color: '#bbb' }}>অন্য ক্যাটাগরি চেষ্টা করুন</p>
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

     {/* Draggable Basket */}
     <DraggableBasket
       cartCount={cartCount}
       cartTotal={cartTotal}
       onNavigate={() => router.push('/cart')}
       shaking={basketShaking}
       onShake={() => {}}
     />
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
