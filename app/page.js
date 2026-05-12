'use client';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#0f2442', fontFamily: 'Hind Siliguri, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
