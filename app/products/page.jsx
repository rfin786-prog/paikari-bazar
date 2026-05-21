'use client';

import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();

      setProducts(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();

      setBrands(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = selectedBrand
    ? products.filter(
        (product) => product.brand === selectedBrand
      )
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="text-gray-500 mt-1">
            Total Products: {filteredProducts.length}
          </p>
        </div>

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) =>
            setSelectedBrand(e.target.value)
          }
          className="border rounded-xl px-4 py-3 outline-none min-w-[220px]"
        >
          <option value="">
            All Brands
          </option>

          {brands.map((brand) => (
            <option
              key={brand._id}
              value={brand.name}
            >
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 rounded-xl mb-4"></div>

            {/* Product Name */}
            <h2 className="font-semibold text-lg line-clamp-2">
              {product.name}
            </h2>

            {/* Brand */}
            <p className="text-sm text-gray-500 mt-1">
              {product.brand}
            </p>

            {/* Price */}
            <p className="font-bold text-xl mt-3">
              ৳ {product.price}
            </p>

            {/* Button */}
            <button className="w-full mt-4 bg-black text-white py-2 rounded-xl">
              View Product
            </button>
          </div>
        ))}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-20">
            <p className="text-gray-500 text-lg">
              কোনো প্রোডাক্ট পাওয়া যায়নি
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
