'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Footer() {
  const router = useRouter();
  const [extraLinks, setExtraLinks] = useState([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/pages?order=id.asc&select=slug,title`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setExtraLinks(data.map(p => ({ title: p.title, href: `/${p.slug}` })));
        }
      } catch (e) {}
    };
    fetchPages();
  }, []);

  const cols = [
    {
      title: 'আড়ৎ সম্পর্কে',
      links: [
        { title: 'আমাদের পরিচয়', href: '/about' },
        { title: 'কীভাবে কাজ করে', href: '/about' },
        { title: 'যোগাযোগ', href: '/contact' },
      ],
    },
    {
      title: 'ক্রেতাদের জন্য',
      links: [
        { title: 'নিবন্ধন করুন', href: '/register' },
        { title: 'পণ্য দেখুন', href: '/products' },
        { title: 'অর্ডার ট্র্যাক', href: '/orders' },
      ],
    },
    {
      title: 'সাপ্লায়ারদের জন্য',
      links: [
        { title: 'সাপ্লায়ার হোন', href: '/register' },
        { title: 'পণ্য লিস্ট করুন', href: '/dashboard' },
      ],
    },
    {
      title: 'সাহায্য',
      links: [
        { title: 'Terms & Conditions', href: '/terms' },
        { title: 'Privacy Policy', href: '/privacy' },
        ...extraLinks,
      ],
    },
  ];

  return (
    <>
      <style>{`
        .footer-link { font-size: 12px; color: rgba(255,255,255,0.5); cursor: pointer; display: block; margin-bottom: 6px; transition: color 0.2s; }
        .footer-link:hover { color: #ff6a00; }
      `}</style>
      <footer style={{ background: '#111', borderTop: '1px solid rgba(255,106,0,0.2)', padding: '32px 20px 20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {cols.map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>{col.title}</div>
                {col.links.map((l, j) => (
                  <span key={j} className="footer-link" onClick={() => router.push(l.href)}>{l.title}</span>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
              <Image src="/logo.png" alt="আড়ৎ" width={70} height={28} style={{ objectFit: 'contain', mixBlendMode: 'screen' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
              © {new Date().getFullYear()} <span style={{ color: 'rgba(255,106,0,0.6)' }}>আড়ৎ</span> — সর্বস্বত্ব সংরক্ষিত
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>bKash · নগদ · ব্যাংক ট্রান্সফার</div>
          </div>
        </div>
      </footer>
    </>
  );
}
