'use client';

import { useEffect, useState } from 'react';

export default function ProductsTab() {
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '',
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      setBrands(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Product add failed');
      }

      alert('Product added');

      setFormData({
        name: '',
        price: '',
        brand: '',
      });
    } catch (error) {
      console.error(error);
      alert('Error');
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow border">
      <h2 className="text-xl font-semibold mb-5">
        Add Product
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Product name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3 outline-none"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3 outline-none"
        />

        <select
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3 outline-none"
        >
          <option value="">
            Select Brand
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

        <button
          type="submit"
          className="bg-black text-white px-5 py-3 rounded-xl"
        >
          Save Product
        </button>
      </form>
    </div>
  );
}
