'use client';
import { useState } from 'react';
import HeroSection from './components/HeroSection';
import CategorySection from './components/CategorySection';
import BrandsSection from './components/BrandsSection';
import ProductsSection from './components/ProductsSection';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState(null);

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Hind Siliguri, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <HeroSection />
      <CategorySection />
      <BrandsSection selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />
      <ProductsSection selectedBrand={selectedBrand} />
      <CTABanner />
      <Footer />
    </main>
  );
}
