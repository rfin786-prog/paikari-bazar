'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Footer() {
  const router = useRouter();
  const [links, setLinks] = useState([
    { title: 'About Us', href: '/about' },
    { title: 'Terms & Conditions', href: '/terms' },
    { title: 'Privacy Policy', href: '/privacy' },
    { title: 'Contact Us', href: '/contact' },
  ]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/pages?order=id.asc&select=slug,title`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLinks(data.map(p => ({ title: p.title, href: `/${p.slug}` })));
        }
      } catch (e) {
        // fallback static links থাকবে
      }
    };
    fetchPages();
  }, []);

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
            <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
              <Image
                src="/logo.png"
                alt="পাইকারি বাজার"
                width={80}
                height={32}
                style={{ objectFit: 'contain', mixBlendMode: 'screen' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {links.map((item, i) => (
                <span key={i} className="footer-link" onClick={() => router.push(item.href)}>
                  {item.title}
                </span>
              ))}
            </div>
          </div>
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
