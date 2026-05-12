"use client";

import { useState, useEffect, useCallback } from 'react';

// ── Skeleton ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="bg-gray-200 h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────
function ProductCard({ product, onAddToCart, cartItems }) {
  const inCart = cartItems.find((i) => i.id === product.id);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="relative bg-gray-50 h-48 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-5xl opacity-30">📦</div>
        )}
        {product.stock <= 10 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">কম স্টক</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-red-500 px-3 py-1 rounded-full">স্টক শেষ</span>
          </div>
        )}
        {inCart && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            🛒 {inCart.qty}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-indigo-500 font-medium mb-1 uppercase tracking-wide">{product.category || 'সাধারণ'}</p>
        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1 line-clamp-2">{product.name}</h3>
        {product.unit && <p className="text-xs text-gray-400 mb-2">প্রতি {product.unit}</p>}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-xl font-bold text-gray-900">৳{Number(product.price).toLocaleString('bn-BD')}</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-green-500 text-white scale-95'
                : inCart
                ? 'bg-green-50 text-green-700 border-2 border-green-400 hover:bg-green-100'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
            }`}
          >
            {product.stock === 0
              ? 'স্টক নেই'
              : added
              ? '✓ যোগ হয়েছে!'
              : inCart
              ? `🛒 কার্টে আছে (${inCart.qty})`
              : '🛒 কার্টে যোগ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────
export default function ProductsSection({ cartItems, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          const cats = ['সব', ...new Set(data.map((p) => p.category).filter(Boolean))];
          setCategories(cats);
        }
      } catch (err) {
        console.error('Products fetch error:', err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = products
    .filter((p) => {
      const matchCat = selectedCategory === 'সব' || p.category === selectedCategory;
      const matchSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <input
          type="text"
          placeholder="পণ্য খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      </div>

      {/* Filter + Sort */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2 flex-wrap flex-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="default">ডিফল্ট</option>
          <option value="price_asc">দাম: কম থেকে বেশি</option>
          <option value="price_desc">দাম: বেশি থেকে কম</option>
          <option value="name">নাম অনুযায়ী</option>
        </select>
      </div>

      {!loading && (
        <p className="text-sm text-gray-500 mb-4">{filtered.length} টি পণ্য পাওয়া গেছে</p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg font-medium">কোনো পণ্য পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              cartItems={cartItems}
            />
          ))}
        </div>
      )}
    </div>
  );
}
