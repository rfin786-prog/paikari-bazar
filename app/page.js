'use client';
import HeroSection from './components/HeroSection';
import CategorySection from './components/CategorySection';
import DailyDeals from './components/DailyDeals';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'Hind Siliguri, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <HeroSection />
      <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', marginTop: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <CategorySection />
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', marginTop: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <DailyDeals />
        </div>
      </div>
      <Footer />
    </main>
  );
}
