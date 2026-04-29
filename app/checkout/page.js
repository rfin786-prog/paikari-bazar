"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "আরশিন চাল",
      price: 1800,
      qty: 2,
    },
    {
      id: 2,
      name: "মিনিকেট চাল",
      price: 2800,
      qty: 1,
    },
    {
      id: 3,
      name: "সয়াবিন তেল",
      price: 850,
      qty: 3,
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    area: "",
    note: "",
    delivery: "standard",
    payment: "cod",
  });

  useEffect(() => {
    // login check demo
    const loggedIn = true;

    if (!loggedIn) {
      router.push("/login");
    }
  }, [router]);

  const deliveryCharge =
    form.delivery === "express"
      ? 150
      : form.delivery === "pickup"
      ? 0
      : 80;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const total = subtotal + deliveryCharge;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert("সব তথ্য পূরণ করুন");
      return;
    }

    setLoading(true);

    try {
      // Supabase insert later here

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      alert("অর্ডার সফল হয়েছে");

      router.push("/success");
    } catch (error) {
      alert("অর্ডার ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
      {/* LEFT */}
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold">
          Checkout
        </h1>

        {/* ADDRESS */}
        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="text-xl font-semibold">
            Delivery Info
          </h2>

          <input
            type="text"
            name="name"
            placeholder="পূর্ণ নাম"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="text"
            name="phone"
            placeholder="মোবাইল নাম্বার"
            value={form.phone}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <textarea
            name="address"
            placeholder="পূর্ণ ঠিকানা"
            value={form.address}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="text"
            name="area"
            placeholder="এলাকা"
            value={form.area}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <textarea
            name="note"
            placeholder="অর্ডার নোট (ঐচ্ছিক)"
            value={form.note}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />
        </div>

        {/* DELIVERY */}
        <div className="border rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold">
            Delivery Option
          </h2>

          <label className="block">
            <input
              type="radio"
              name="delivery"
              value="standard"
              checked={
                form.delivery === "standard"
              }
              onChange={handleChange}
            />{" "}
            Standard - ৳80
          </label>

          <label className="block">
            <input
              type="radio"
              name="delivery"
              value="express"
              checked={
                form.delivery === "express"
              }
              onChange={handleChange}
            />{" "}
            Express - ৳150
          </label>

          <label className="block">
            <input
              type="radio"
              name="delivery"
              value="pickup"
              checked={
                form.delivery === "pickup"
              }
              onChange={handleChange}
            />{" "}
            Self Pickup - Free
          </label>
        </div>

        {/* PAYMENT */}
        <div className="border rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold">
            Payment Method
          </h2>

          <label className="block">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={form.payment === "cod"}
              onChange={handleChange}
            />{" "}
            Cash on Delivery
          </label>

          <label className="block">
            <input
              type="radio"
              name="payment"
              value="bkash"
              checked={
                form.payment === "bkash"
              }
              onChange={handleChange}
            />{" "}
            bKash
          </label>

          <label className="block">
            <input
              type="radio"
              name="payment"
              value="bank"
              checked={
                form.payment === "bank"
              }
              onChange={handleChange}
            />{" "}
            Bank Transfer
          </label>
        </div>
      </div>

      {/* RIGHT */}
      <div className="space-y-6">
        <div className="border rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-4">
            Order Summary
          </h2>

          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-2"
              >
                <div>
                  <p>{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.qty} x ৳{item.price}
                  </p>
                </div>

                <p>
                  ৳
                  {item.qty *
                    item.price}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span>
                ৳{deliveryCharge}
              </span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full bg-black text-white mt-5 py-3 rounded-xl"
          >
            {loading
              ? "Processing..."
              : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
