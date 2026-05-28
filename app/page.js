'use client';
import HeroSection from './components/HeroSection';
import CategorySection from './components/CategorySection';
import DailyDeals from './components/DailyDeals';
import BrandsSection from './components/BrandsSection';
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
      <div style={{ background: '#fff' }}>
        <CategorySection />
      </div>
      <div style={{ background: '#fff' }}>
        <DailyDeals />
      </div>
      <div style={{ background: '#fff' }}>
        <BrandsSection />
      </div>
      <Footer />
    </main>
  );
}
