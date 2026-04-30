export default function FeaturesSection() {
  const features = [
    { icon: '🛒', title: 'সহজ অর্ডার', desc: 'মাত্র কয়েক ক্লিকে হাজার হাজার পণ্য অর্ডার করুন' },
    { icon: '💰', title: 'সেরা দাম', desc: 'সরাসরি কারখানা থেকে কিনুন, মধ্যস্থতাকারী নেই' },
    { icon: '📊', title: 'অর্ডার ট্র্যাকিং', desc: 'রিয়েল-টাইমে আপনার অর্ডারের অবস্থান জানুন' },
  ];

  return (
    <div style={{ background: '#fff', padding: '44px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
      {features.map((f, i) => (
        <div key={i} style={{ padding: '26px', border: '1.5px solid #e5e7eb', borderRadius: '14px' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(232,160,32,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>{f.icon}</div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: '#0f2442' }}>{f.title}</h3>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.7' }}>{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
