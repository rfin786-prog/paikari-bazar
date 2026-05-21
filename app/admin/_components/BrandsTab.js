# BrandsTab.js (নতুন)

```jsx
'use client';

import { useEffect, useState } from 'react';

export default function BrandsTab() {
  const [brands, setBrands] = useState([]);
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      setBrands(data || []);
    } catch (error) {
      console.error('Brand fetch error:', error);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();

    if (!brandName.trim()) return;

    try {
      setLoading(true);

      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: brandName,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add brand');
      }

      setBrandName('');
      fetchBrands();
    } catch (error) {
      console.error(error);
      alert('Brand add failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm('Brand delete করতে চান?');

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      fetchBrands();
    } catch (error) {
      console.error(error);
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAddBrand}
        className="bg-white p-5 rounded-2xl shadow border"
      >
        <h2 className="text-xl font-semibold mb-4">নতুন ব্র্যান্ড যোগ করুন</h2>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Brand name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-5 rounded-xl"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">সব ব্র্যান্ড</h2>
        </div>

        <div className="divide-y">
          {brands.map((brand) => (
            <div
              key={brand._id}
              className="flex items-center justify-between p-4"
            >
              <p className="font-medium">{brand.name}</p>

              <button
                onClick={() => handleDelete(brand._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          ))}

          {brands.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              কোনো ব্র্যান্ড নেই
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

# ProductsTab.js (updated — brand dropdown)

```jsx
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
      <h2 className="text-xl font-semibold mb-5">Add Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <option value="">Select Brand</option>

          {brands.map((brand) => (
            <option key={brand._id} value={brand.name}>
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
```

---

# products/page.js (updated — brand filter)

```jsx
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
    ? products.filter((item) => item.brand === selectedBrand)
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">Products</h1>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border rounded-xl px-4 py-3 outline-none min-w-[220px]"
        >
          <option value="">All Brands</option>

          {brands.map((brand) => (
            <option key={brand._id} value={brand.name}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="border rounded-2xl p-4 bg-white shadow-sm"
          >
            <h2 className="font-semibold text-lg">{product.name}</h2>

            <p className="text-gray-500 mt-1">{product.brand}</p>

            <p className="font-bold mt-3">৳ {product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

# প্রয়োজনীয় Product Schema Example

```js
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  brand: String,
});
```

# প্রয়োজনীয় Brand Schema Example

```js
const BrandSchema = new mongoose.Schema({
  name: String,
});
```
