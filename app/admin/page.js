'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTab from './_components/DashboardTab';
import ProductsTab from './_components/ProductsTab';
import CategoriesTab from './_components/CategoriesTab';
import BrandsTab from './_components/BrandsTab';
import OrdersTab from './_components/OrdersTab';
import UsersTab from './_components/UsersTab';
import DeliveryAreasTab from './_components/DeliveryAreasTab';
import DeliveryChargesTab from './_components/DeliveryChargesTab';
import SalesReportTab from './_components/SalesReportTab';
import WalletTab from './_components/WalletTab';
import PickupPointsTab from './_components/PickupPointsTab';
import SettingsTab from './_components/SettingsTab';

const TABS = [
 { key: 'dashboard',        label: 'Dashboard',  icon: '🏠' },
 { key: 'products',         label: 'Products',   icon: '📦' },
 { key: 'categories',       label: 'Categories', icon: '🏷️' },
 { key: 'brands',           label: 'Brands',     icon: '🎯' },
 { key: 'orders',           label: 'Orders',     icon: '🛒' },
 { key: 'users',            label: 'Users',      icon: '👥' },
 { key: 'wallet',           label: 'Wallet',     icon: '💳' },
 { key: 'delivery_areas',   label: 'Delivery',   icon: '🗺️' },
 { key: 'delivery_charges', label: 'Charges',    icon: '💰' },
 { key: 'pickup_points',    label: 'Pickup',     icon: '📍' },
 { key: 'sales_report',     label: 'Sales',      icon: '📊' },
 { key: 'settings',         label: 'Settings',   icon: '⚙️' },
];

const BOTTOM_TABS = ['dashboard', 'products', 'orders', 'users', 'sales_report'];

export default function AdminPage() {
 const router = useRouter();
 const [tab, setTab] = useState('dashboard');
 const [collapsed, setCollapsed] = useState(false);
 const [isMobile, setIsMobile] = useState(false);
 const [showMoreMenu, setShowMoreMenu] = useState(false);

 useEffect(() => {
   const user = JSON.parse(localStorage.getItem('user') || '{}');
   if (!user || user.role !== 'admin') { router.push('/login'); }
 }, []);

 useEffect(() => {
   const check = () => setIsMobile(window.innerWidth < 768);
   check();
   window.addEventListener('resize', check);
   return () => window.removeEventListener('resize', check);
 }, []);

 const logout = () => {
   localStorage.removeItem('user');
   router.push('/login');
 };

 const handleTabChange = (key) => {
   setTab(key);
   setShowMoreMenu(false);
 };

 const FONT = 'var(--font-hind-siliguri), sans-serif';

 const moreTabs = TABS.filter(t => !BOTTOM_TABS.includes(t.key));
 const bottomTabItems = TABS.filter(t => BOTTOM_TABS.includes(t.key));

 return (
   <div style={{ minHeight: '100vh', background: '#0f0e17', fontFamily: FONT, display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>

     {/* DESKTOP SIDEBAR */}
     {!isMobile && (
       <aside style={{
         width: collapsed ? '64px' : '220px',
         background: '#1a1828',
         borderRight: '1px solid rgba(255,255,255,.06)',
         display: 'flex',
         flexDirection: 'column',
         transition: 'width .25s ease',
         overflow: 'hidden',
         flexShrink: 0,
         position: 'sticky',
         top: 0,
         height: '100vh',
       }}>
         <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '64px' }}>
           {!collapsed && (
             <div>
               <div style={{ fontSize: '18px', fontWeight: '700', color: '#e8a020', lineHeight: 1.2 }}>আড়ৎ</div>
               <div style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,.4)' }}>Admin Panel</div>
             </div>
           )}
           <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'rgba(255,255,255,.07)', border: 'none', color: 'rgba(255,255,255,.5)', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             {collapsed ? '>' : '<'}
           </button>
         </div>

         <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
           {TABS.map(({ key, label, icon }) => (
             <button key={key} onClick={() => setTab(key)} style={{
               width: '100%',
               display: 'flex',
               alignItems: 'center',
               gap: '10px',
               padding: collapsed ? '10px 0' : '10px 12px',
               justifyContent: collapsed ? 'center' : 'flex-start',
               borderRadius: '8px',
               border: 'none',
               background: tab === key ? 'rgba(232,160,32,.12)' : 'transparent',
               borderLeft: tab === key ? '3px solid #e8a020' : '3px solid transparent',
               color: tab === key ? '#e8a020' : 'rgba(255,255,255,.45)',
               fontSize: '13px',
               fontWeight: tab === key ? '600' : '400',
               fontFamily: FONT,
               cursor: 'pointer',
               marginBottom: '2px',
               transition: 'all .15s',
               whiteSpace: 'nowrap',
             }}>
               <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
               {!collapsed && label}
             </button>
           ))}
         </nav>

         <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
           {!collapsed && (
             <div style={{ padding: '8px 12px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(232,160,32,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#e8a020', fontWeight: '700' }}>A</div>
               <div>
                 <div style={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>Admin</div>
                 <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.35)' }}>আড়ৎ</div>
               </div>
             </div>
           )}
           <button onClick={logout} style={{
             width: '100%',
             padding: collapsed ? '10px 0' : '9px 12px',
             borderRadius: '8px',
             border: 'none',
             background: 'rgba(239,68,68,.1)',
             color: '#f87171',
             fontSize: '12px',
             fontWeight: '600',
             fontFamily: FONT,
             cursor: 'pointer',
             display: 'flex',
             alignItems: 'center',
             justifyContent: collapsed ? 'center' : 'flex-start',
             gap: '8px',
           }}>
             <span>🚪</span>
             {!collapsed && 'Logout'}
           </button>
         </div>
       </aside>
     )}

     {/* MOBILE TOPBAR */}
     {isMobile && (
       <header style={{
         background: '#1a1828',
         borderBottom: '1px solid rgba(255,255,255,.06)',
         padding: '12px 16px',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'space-between',
         position: 'sticky',
         top: 0,
         zIndex: 50,
       }}>
         <div>
           <div style={{ fontSize: '20px', fontWeight: '700', color: '#e8a020', lineHeight: 1 }}>আড়ৎ</div>
           <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>Admin Panel</div>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)' }}>
             {TABS.find(t => t.key === tab)?.icon} {TABS.find(t => t.key === tab)?.label}
           </div>
           <button onClick={logout} style={{ background: 'rgba(239,68,68,.15)', border: 'none', color: '#f87171', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', fontFamily: FONT, cursor: 'pointer' }}>
             🚪
           </button>
         </div>
       </header>
     )}

     {/* MAIN CONTENT */}
     <main style={{
       flex: 1,
       padding: isMobile ? '16px 12px' : '28px',
       overflowY: 'auto',
       minHeight: isMobile ? 'calc(100vh - 120px)' : '100vh',
       paddingBottom: isMobile ? '80px' : '28px',
     }}>
       {tab === 'dashboard'        && <DashboardTab setTab={setTab} />}
       {tab === 'products'         && <ProductsTab />}
       {tab === 'categories'       && <CategoriesTab />}
       {tab === 'brands'           && <BrandsTab />}
       {tab === 'orders'           && <OrdersTab />}
       {tab === 'users'            && <UsersTab />}
       {tab === 'wallet'           && <WalletTab />}
       {tab === 'delivery_areas'   && <DeliveryAreasTab />}
       {tab === 'delivery_charges' && <DeliveryChargesTab />}
       {tab === 'pickup_points'    && <PickupPointsTab />}
       {tab === 'sales_report'     && <SalesReportTab />}
       {tab === 'settings'         && <SettingsTab />}
     </main>

     {/* MOBILE BOTTOM NAV */}
     {isMobile && (
       <>
         {showMoreMenu && (
           <div onClick={() => setShowMoreMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 90 }}>
             <div onClick={e => e.stopPropagation()} style={{
               position: 'absolute', bottom: '65px', left: '0', right: '0',
               background: '#1a1828', borderTop: '1px solid rgba(255,255,255,.08)',
               borderRadius: '16px 16px 0 0', padding: '16px 12px',
               display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
             }}>
               <div style={{ gridColumn: '1/-1', fontSize: '11px', color: 'rgba(255,255,255,.35)', fontWeight: '600', marginBottom: '4px', paddingLeft: '4px' }}>More</div>
               {moreTabs.map(({ key, label, icon }) => (
                 <button key={key} onClick={() => handleTabChange(key)} style={{
                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                   padding: '12px 8px', borderRadius: '10px', border: 'none',
                   background: tab === key ? 'rgba(232,160,32,.15)' : 'rgba(255,255,255,.04)',
                   color: tab === key ? '#e8a020' : 'rgba(255,255,255,.6)',
                   fontSize: '11px', fontFamily: FONT, cursor: 'pointer',
                 }}>
                   <span style={{ fontSize: '20px' }}>{icon}</span>
                   {label}
                 </button>
               ))}
             </div>
           </div>
         )}

         <nav style={{
           position: 'fixed', bottom: 0, left: 0, right: 0,
           background: '#1a1828', borderTop: '1px solid rgba(255,255,255,.08)',
           display: 'flex', zIndex: 100,
           paddingBottom: 'env(safe-area-inset-bottom)',
         }}>
           {bottomTabItems.map(({ key, label, icon }) => (
             <button key={key} onClick={() => handleTabChange(key)} style={{
               flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
               gap: '3px', padding: '8px 4px', border: 'none', background: 'transparent',
               color: tab === key ? '#e8a020' : 'rgba(255,255,255,.4)',
               fontSize: '10px', fontFamily: FONT, cursor: 'pointer',
               borderTop: tab === key ? '2px solid #e8a020' : '2px solid transparent',
               transition: 'all .15s',
             }}>
               <span style={{ fontSize: '18px' }}>{icon}</span>
               {label}
             </button>
           ))}
           <button onClick={() => setShowMoreMenu(!showMoreMenu)} style={{
             flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
             gap: '3px', padding: '8px 4px', border: 'none', background: 'transparent',
             color: showMoreMenu ? '#e8a020' : 'rgba(255,255,255,.4)',
             fontSize: '10px', fontFamily: FONT, cursor: 'pointer',
             borderTop: showMoreMenu ? '2px solid #e8a020' : '2px solid transparent',
           }}>
             <span style={{ fontSize: '18px' }}>☰</span>
             More
           </button>
         </nav>
       </>
     )}
   </div>
 );
}
