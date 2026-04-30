'use client';
import Navbar from './components/Navbar';
import AnimationSection from './components/AnimationSection';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#0f2442', fontFamily: 'Hind Siliguri, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <AnimationSection />
      <HeroSection />
      <FeaturesSection />
    </main>
  );
}
