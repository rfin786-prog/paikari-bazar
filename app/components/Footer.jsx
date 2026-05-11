'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();

  const links = [
    { title: 'About Us', href: '/about' },
    { title: 'Terms & Conditions', href: '/terms' },
    { title: 'Privacy Policy', href: '/privacy' },
    { title: 'Contact Us', href: '/contact' },
  ];

  return (
    <>
      <style>{`
        .footer-link {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: #e8a020;
        }
      `}</style>

      <footer style={{ background: '#0a1628', borderTop: '1px solid rgba(232,160,32,0.2)', padding: '28px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>

            {/* Logo */}
            <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
              <Image
                src="/logo.png"
                alt="পাইকারি বাজার"
                width={80}
                height={32}
                style={{ objectFit: 'contain', mixBlendMode: 'screen' }}
              />
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {links.map((item, i) => (
                <span key={i} className="footer-link" onClick={() => router.push(item.href)}>
                  {item.title}
                </span>
              ))}
            </div>

          </div>

          {/* Copyright */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
              © {new Date().getFullYear()} <span style={{ color: 'rgba(232,160,32,0.5)' }}>পাইকারি বাজার</span> — সর্বস্বত্ব সংরক্ষিত
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
