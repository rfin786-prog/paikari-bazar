'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CheckoutPage() {
const router = useRouter();
const [cartItems, setCartItems] = useState([]);
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [placing, setPlacing] = useState(false);
const [success, setSuccess] = useState(false);
const [orderId, setOrderId] = useState(null);
const [error, setError] = useState(””);

useEffect(() => {
// Cart load
const saved = localStorage.getItem(“paikari_cart”);
if (saved) setCartItems(JSON.parse(saved));

```
// User load — key হলো 'user'
const savedUser = localStorage.getItem("user");
if (!savedUser) {
  router.push("/login");
  return;
}

const parsedUser = JSON.parse(savedUser);

async function fetchUser() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", parsedUser.id)
    .single();

  if (error || !data) {
    router.push("/login");
    return;
  }
  setUser(data);
  setLoading(false);
}

fetchUser();
```

}, []);

const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);

const handlePlaceOrder = async () => {
if (cartItems.length === 0) {
setError(“কার্টে কোনো পণ্য নেই!”);
return;
}

```
setPlacing(true);
setError("");

const orderItems = cartItems.map((i) => ({
  product_id: i.id,
  name: i.name,
  price: i.price,
  qty: i.qty,
  image_url: i.image_url || null,
  unit: i.unit || null,
}));

const newOrderId = `ORD-${Date.now()}`;

const { error: insertError } = await supabase.from("orders").insert({
  id: newOrderId,
  user_id: user.id,
  shop_name: user.shop_name,
  items: orderItems,
  subtotal: subtotal,
  total: subtotal,
  status: "pending",
  created_at: new Date().toISOString(),
});

if (insertError) {
  setError("অর্ডার দেওয়া যায়নি। আবার চেষ্টা করুন।");
  setPlacing(false);
  return;
}

localStorage.removeItem("paikari_cart");
setOrderId(newOrderId);
setSuccess(true);
setPlacing(false);
```

};

if (loading) {
return (
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
<div className="text-center">
<div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
<p className="text-gray-500 text-sm">লোড হচ্ছে…</p>
</div>
</div>
);
}

if (success) {
return (
<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
<span className="text-3xl">✅</span>
</div>
<h2 className="text-xl font-bold text-gray-800 mb-2">অর্ডার সফল হয়েছে!</h2>
<p className="text-sm text-gray-500 mb-1">অর্ডার নম্বর:</p>
<p className="font-mono text-indigo-600 font-semibold text-sm mb-4">{orderId}</p>
<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
<p className="text-amber-800 text-sm font-medium">🚚 পণ্য পেয়ে টাকা পরিশোধ করতে হবে</p>
</div>
<Link
href="/products"
className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
>
আরও কেনাকাটা করুন
</Link>
<Link
href="/dashboard"
className="block w-full mt-2 text-indigo-600 hover:text-indigo-800 py-2 text-sm font-medium"
>
আমার অর্ডার দেখুন →
</Link>
</div>
</div>
);
}

return (
<div className="min-h-screen bg-gray-50">
{/* Navbar */}
<nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
<div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
<Link href="/products" className="text-gray-400 hover:text-gray-600 text-xl">
←
</Link>
<span className="text-xl">🚚</span>
<span className="font-bold text-indigo-700 text-lg">
পাইকারি<span className="text-gray-800">বাজার</span>
</span>
<span className="text-gray-300 mx-1">/</span>
<span className="text-gray-600 text-sm font-medium">চেকআউট</span>
</div>
</nav>

```
  <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

    {/* Shop Info */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>🏪</span> দোকানের তথ্য
      </h2>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-400 text-xs mb-0.5">মালিকের নাম</p>
          <p className="font-semibold text-gray-800">{user?.name || "—"}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">দোকানের নাম</p>
          <p className="font-semibold text-gray-800">{user?.shop_name || "—"}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">এলাকা</p>
          <p className="font-semibold text-gray-800">{user?.area || "—"}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">ফোন</p>
          <p className="font-semibold text-gray-800">{user?.phone || "—"}</p>
        </div>
      </div>
    </div>

    {/* Order Items */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📦</span> অর্ডার সামারি ({totalItems} টি পণ্য)
      </h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-2">🛒</div>
          <p className="text-sm">কার্ট খালি আছে</p>
          <Link href="/products" className="text-indigo-600 text-sm font-medium mt-2 inline-block">
            পণ্য দেখুন →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">📦</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                {item.unit && <p className="text-xs text-gray-400">প্রতি {item.unit}</p>}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {item.qty} × ৳{Number(item.price).toLocaleString("bn-BD")}
                  </p>
                  <p className="text-sm font-bold text-indigo-600">
                    ৳{Number(item.price * item.qty).toLocaleString("bn-BD")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Price Summary */}
    {cartItems.length > 0 && (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>💰</span> মূল্য বিবরণ
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>সাবটোটাল ({totalItems} টি)</span>
            <span>৳{Number(subtotal).toLocaleString("bn-BD")}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>ডেলিভারি চার্জ</span>
            <span className="text-green-600 font-medium">ফ্রি</span>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-base text-gray-800">
            <span>মোট মূল্য</span>
            <span className="text-indigo-600">৳{Number(subtotal).toLocaleString("bn-BD")}</span>
          </div>
        </div>
      </div>
    )}

    {/* Payment Note */}
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
      <span className="text-xl flex-shrink-0">🚚</span>
      <div>
        <p className="font-semibold text-amber-800 text-sm">পেমেন্ট পদ্ধতি</p>
        <p className="text-amber-700 text-sm mt-0.5">পণ্য পেয়ে টাকা পরিশোধ করতে হবে</p>
      </div>
    </div>

    {/* Error */}
    {error && (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
        ⚠️ {error}
      </div>
    )}

    {/* Place Order Button */}
    {cartItems.length > 0 && (
      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-2xl font-bold text-base transition-all active:scale-95 shadow-sm"
      >
        {placing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            অর্ডার দেওয়া হচ্ছে...
          </span>
        ) : (
          "✅ অর্ডার কনফার্ম করুন"
        )}
      </button>
    )}

    <p className="text-center text-xs text-gray-400 pb-4">
      অর্ডার দেওয়ার পর পরিবর্তন করা যাবে না
    </p>
  </div>
</div>
```

);
}
