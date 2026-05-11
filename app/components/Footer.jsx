'use client';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();

  const links = [
    { icon: '🏢', title: 'About Us', desc: 'আমাদের প্ল্যাটফর্ম ও লক্ষ্য সম্পর্কে জানুন।', href: '/about' },
    { icon: '📄', title: 'Terms & Conditions', desc: 'প্ল্যাটফর্ম ব্যবহারের আগে শর্তাবলী পড়ুন।', href: '/terms' },
    { icon: '🔒', title: 'Privacy Policy', desc: 'আমরা কীভাবে আপনার তথ্য সুরক্ষিত রাখি।', href: '/privacy' },
  ];

  return (
    <>
      <style>{`
        .footer-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px 20px;
          cursor: pointer;
          transition: border-color 0.3s ease, background 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .footer-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, #e8a020, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .footer-card:hover {
          border-color: rgba(232,160,32,0.4);
          background: rgba(232,160,32,0.06);
        }
        .footer-card:hover::before {
          opacity: 1;
        }
      `}</style>

      <footer style={{ background: '#0a1628', borderTop: '1px solid rgba(232,160,32,0.2)', padding: '60px 20px 30px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#e8a020', letterSpacing: '1px', marginBottom: '6px' }}>
              পাইকারি বাজার
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Wholesale Marketplace
            </div>
            <div style={{ width: '48px', height: '2px', background: 'linear-gradient(90deg, #e8a020, transparent)', margin: '12px auto 0' }} />
          </div>

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '48px' }}>
            {links.map((item, i) => (
              <div key={i} className="footer-card" onClick={() => router.push(item.href)}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>{item.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.7' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div style={{ textAlign: 'center', paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.5px' }}>
              © {new Date().getFullYear()} <span style={{ color: 'rgba(232,160,32,0.5)' }}>পাইকারি বাজার</span> — সর্বস্বত্ব সংরক্ষিত
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
