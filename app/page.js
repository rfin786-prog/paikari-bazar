'use client';
import HeroSection from './components/HeroSection';
import CategorySection from './components/CategorySection';
import ProductsSection from './components/ProductsSection';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Hind Siliguri, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <HeroSection />
      <CategorySection />
      <ProductsSection />
      <CTABanner />
      <Footer />
    </main>
  );
}
