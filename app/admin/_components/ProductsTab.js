'use client';
import { useState, useEffect, useRef } from 'react';
import { SUPABASE_URL, SUPABASE_KEY, headers, s } from './constants';

// ─── Styles ───────────────────────────────────────────────────────────────────
const inp = {
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  border: '1px solid #334155', fontSize: '13px', color: '#e2e8f0',
  background: '#0f172a', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};
const st = {
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
  btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' },
  label: { fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  iconBtn: { width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' },
};

const emptyForm = {
  name: '', description: '', category_id: '', sub_category_id: '', cost_price: '',
  trade_price: '', mrp: '', discount_price: '', unit: 'kg',
  stock: '', moq: '1', max_qty: '',
};

const LOW_STOCK_THRESHOLD = 10;

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const isSuccess = type === 'success';
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      background: '#1e293b', border: `1px solid ${isSuccess ? '#166534' : '#991b1b'}`,
      color: isSuccess ? '#4ade80' : '#f87171',
      borderRadius: '10px', padding: '12px 20px', fontSize: '13px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.3s ease',
    }}>
      {msg}
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product.name || '',
    description: product.description || '',
    unit: product.unit || '',
    stock: product.stock ?? '',
    moq: product.moq ?? 1,
    max_qty: product.max_qty ?? '',
    cost_price: product.cost_price ?? '',
    trade_price: product.trade_price ?? product.price ?? '',
    mrp: product.mrp ?? '',
    discount_price: product.discount_price ?? '',
  });

  const profit = form.cost_price && form.trade_price
    ? Number(form.trade_price) - Number(form.cost_price) : null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b', marginBottom: '20px' }}>✏️ Edit Product</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={st.label}>Product Name *</label>
            <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          {/* ✅ Description in Edit Modal */}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={st.label}>Description</label>
            <textarea
              style={{ ...inp, minHeight: '80px', resize: 'vertical', lineHeight: '1.5' }}
              placeholder="Product description (optional)..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label style={st.label}>Unit</label>
            <input style={inp} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div>
            <label style={st.label}>Stock</label>
            <input style={inp} type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div>
            <label style={st.label}>MOQ</label>
            <input style={inp} type="number" value={form.moq} onChange={e => setForm({ ...form, moq: e.target.value })} />
          </div>
          <div>
            <label style={st.label}>Max Qty</label>
            <input style={inp} type="number" value={form.max_qty} onChange={e => setForm({ ...form, max_qty: e.target.value })} />
          </div>
        </div>

        {/* Prices */}
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', marginBottom: '12px' }}>💰 Prices</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={st.label}>Cost Price (Admin Only)</label>
              <input style={{ ...inp, borderColor: '#854d0e' }} type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} />
            </div>
            <div>
              <label style={st.label}>Trade Price *</label>
              <input style={{ ...inp, borderColor: '#4338ca' }} type="number" value={form.trade_price} onChange={e => setForm({ ...form, trade_price: e.target.value })} />
            </div>
            <div>
              <label style={st.label}>MRP</label>
              <input style={inp} type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
            </div>
            <div>
              <label style={st.label}>Discount Price</label>
              <input style={{ ...inp, borderColor: '#065f46' }} type="number" value={form.discount_price} onChange={e => setForm({ ...form, discount_price: e.target.value })} />
            </div>
          </div>
          {profit !== null && (
            <div style={{
              marginTop: '10px', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', fontWeight: '700',
              background: profit >= 0 ? '#052e16' : '#450a0a',
              border: `1px solid ${profit >= 0 ? '#166534' : '#991b1b'}`,
              color: profit >= 0 ? '#4ade80' : '#f87171',
            }}>
              {profit >= 0 ? '🟢' : '🔴'}
              {profit >= 0 ? 'Profit' : 'Loss'}: ৳{Math.abs(profit)}
              {form.cost_price && <span style={{ fontWeight: '400', color: '#64748b', marginLeft: '8px' }}>({((Math.abs(profit) / Number(form.cost_price)) * 100).toFixed(1)}%)</span>}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
          <button style={{ ...st.btn, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }} onClick={onClose}>Cancel</button>
          <button style={{ ...st.btn, background: '#f59e0b', color: '#0f172a' }} onClick={() => onSave(form)}>💾 Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState([null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [editProduct, setEditProduct] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [formOpen, setFormOpen] = useState(true);

  // Filters & Sort
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortKey, setSortKey] = useState('newest');

  const toastTimer = useRef(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ msg: '', type: 'success' }), 2800);
  };

  const loadCategories = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?parent_id=is.null&order=created_at.asc`, { headers });
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  const loadSubCategories = async (categoryId) => {
    if (!categoryId) { setSubCategories([]); return; }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?parent_id=eq.${categoryId}&order=created_at.asc`, { headers });
    const data = await res.json();
    setSubCategories(Array.isArray(data) ? data : []);
  };

  const loadProducts = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?order=created_at.desc`, { headers });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  const filteredProducts = products
    .filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter && p.category !== catFilter) return false;
      if (statusFilter === 'active' && !p.active) return false;
      if (statusFilter === 'inactive' && p.active) return false;
      if (stockFilter === 'low' && !(p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD)) return false;
      if (stockFilter === 'out' && p.stock !== 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortKey === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'price_asc') return (a.trade_price || 0) - (b.trade_price || 0);
      if (sortKey === 'price_desc') return (b.trade_price || 0) - (a.trade_price || 0);
      if (sortKey === 'stock') return b.stock - a.stock;
      if (sortKey === 'profit') return ((b.trade_price || 0) - (b.cost_price || 0)) - ((a.trade_price || 0) - (a.cost_price || 0));
      return 0;
    });

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD).length;
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const handleImageSelect = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles[index] = file;
    newPreviews[index] = URL.createObjectURL(file);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles[index] = null;
    newPreviews[index] = null;
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/products/${fileName}`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;
  };

  const addProduct = async () => {
    if (!form.name) { showToast('❌ Product name is required', 'error'); return; }
    if (!form.trade_price) { showToast('❌ Trade price is required', 'error'); return; }
    setUploading(true);

    const [url1, url2, url3] = await Promise.all(imageFiles.map(uploadImage));

    const selectedSubName = subCategories.find(sc => sc.id === form.sub_category_id)?.name || null;
    const selectedParentName = categories.find(c => c.id === form.category_id)?.name || null;
    const categoryName = selectedSubName || selectedParentName || null;

    const body = {
      name: form.name,
      description: form.description || null,   // ✅ description
      category_id: form.category_id || null,
      sub_category_id: form.sub_category_id || null,
      category: categoryName,
      cost_price: Number(form.cost_price) || 0,
      price: Number(form.trade_price),
      trade_price: Number(form.trade_price),
      mrp: Number(form.mrp) || 0,
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      unit: form.unit,
      stock: Number(form.stock) || 0,
      moq: Number(form.moq) || 1,
      max_qty: form.max_qty ? Number(form.max_qty) : null,
      active: true,
      image_url: url1,
      image_url_2: url2,
      image_url_3: url3,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(body),
    });

    setUploading(false);
    if (res.status === 201) {
      showToast('✅ Product added successfully', 'success');
      setForm(emptyForm);
      setImageFiles([null, null, null]);
      setImagePreviews([null, null, null]);
      setSubCategories([]);
      loadProducts();
    } else {
      const err = await res.json();
      showToast('❌ Error: ' + (err?.message || 'Unknown error'), 'error');
    }
  };

  const toggleActive = async (id, active) => {
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ active: !active }),
    });
    showToast(`Product ${!active ? 'activated' : 'deactivated'}`, 'success');
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'DELETE', headers });
    showToast('🗑 Product deleted', 'error');
    loadProducts();
  };

  const updateStock = async (id, newStock) => {
    const stock = Math.max(0, Number(newStock) || 0);
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ stock }),
    });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p));
    showToast(`Stock updated → ${stock}`, 'success');
  };

  const saveEdit = async (formData) => {
    const body = {
      name: formData.name,
      description: formData.description || null,   // ✅ description
      unit: formData.unit,
      stock: Number(formData.stock) || 0,
      moq: Number(formData.moq) || 1,
      max_qty: formData.max_qty ? Number(formData.max_qty) : null,
      cost_price: Number(formData.cost_price) || 0,
      trade_price: Number(formData.trade_price) || 0,
      price: Number(formData.trade_price) || 0,
      mrp: Number(formData.mrp) || 0,
      discount_price: formData.discount_price ? Number(formData.discount_price) : null,
    };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${editProduct.id}`, {
      method: 'PATCH', headers: { ...headers, 'Prefer': 'return=representation' }, body: JSON.stringify(body),
    });
    if (res.ok || res.status === 204) {
      showToast('✅ Product updated', 'success');
      setEditProduct(null);
      loadProducts();
    } else {
      showToast('❌ Update failed', 'error');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? new Set(filteredProducts.map(p => p.id)) : new Set());
  };

  const bulkToggle = async (active) => {
    await Promise.all([...selectedIds].map(id =>
      fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({ active }) })
    ));
    setSelectedIds(new Set());
    showToast(`✅ ${active ? 'Activated' : 'Deactivated'} ${selectedIds.size} products`, 'success');
    loadProducts();
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected products?`)) return;
    await Promise.all([...selectedIds].map(id =>
      fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'DELETE', headers })
    ));
    setSelectedIds(new Set());
    showToast('🗑 Deleted selected products', 'error');
    loadProducts();
  };

  const exportCSV = () => {
    const rows = [['Name', 'Description', 'Category', 'Unit', 'Stock', 'MOQ', 'Cost Price', 'Trade Price', 'MRP', 'Discount', 'Active']];
    filteredProducts.forEach(p => rows.push([
      p.name, p.description || '', p.category || '', p.unit, p.stock, p.moq,
      p.cost_price || '', p.trade_price || p.price || '',
      p.mrp || '', p.discount_price || '', p.active ? 'Yes' : 'No',
    ]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `products_${Date.now()}.csv`; a.click();
    showToast('📤 CSV exported', 'success');
  };

  const printProducts = () => {
    const rows = filteredProducts.map(p =>
      `<tr><td>${p.name}</td><td>${p.description || '-'}</td><td>${p.category || '-'}</td><td>${p.unit}</td><td>${p.stock}</td><td>৳${p.trade_price || p.price || 0}</td><td>${p.active ? 'Active' : 'Inactive'}</td></tr>`
    ).join('');
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Product List</title>
      <style>body{font-family:sans-serif;padding:20px}h2{margin-bottom:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:13px}th{background:#f3f4f6;font-weight:600}</style>
      </head><body>
      <h2>আড়ৎ — Product List (${filteredProducts.length} items)</h2>
      <table><tr><th>Name</th><th>Description</th><th>Category</th><th>Unit</th><th>Stock</th><th>Trade Price</th><th>Status</th></tr>${rows}</table>
      </body></html>
    `);
    w.print();
  };

  const profit = form.cost_price && form.trade_price
    ? Number(form.trade_price) - Number(form.cost_price) : null;

  const sortTabs = [
    { key: 'newest', label: 'Newest' },
    { key: 'name', label: 'Name A-Z' },
    { key: 'price_asc', label: 'Price ↑' },
    { key: 'price_desc', label: 'Price ↓' },
    { key: 'stock', label: 'Stock ↓' },
    { key: 'profit', label: 'Profit ↓' },
  ];

  return (
    <div>
      <Toast msg={toast.msg} type={toast.type} />
      {editProduct && <EditModal product={editProduct} onClose={() => setEditProduct(null)} onSave={saveEdit} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>📦 Product Management</h2>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Manage your wholesale product catalog</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#64748b' }}>
            {products.length} products
          </span>
          {lowStockCount > 0 && (
            <span style={{ background: '#431407', border: '1px solid #9a3412', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#fb923c', fontWeight: '700' }}>
              ⚠️ {lowStockCount} low stock
            </span>
          )}
          <button onClick={exportCSV} style={{ ...st.btn, background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', padding: '6px 12px', fontSize: '12px' }}>📤 Export CSV</button>
          <button onClick={printProducts} style={{ ...st.btn, background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', padding: '6px 12px', fontSize: '12px' }}>🖨 Print</button>
        </div>
      </div>

      {/* Search + Filter Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...inp, flex: 1, minWidth: '200px' }}
          placeholder="🔍 Search products by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...inp, width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={{ ...inp, width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select style={{ ...inp, width: 'auto' }} value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
          <option value="">All Stock</option>
          <option value="low">⚠️ Low Stock (&lt;{LOW_STOCK_THRESHOLD})</option>
          <option value="out">❌ Out of Stock</option>
        </select>
      </div>

      {/* Sort Tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {sortTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSortKey(tab.key)}
            style={{
              ...st.btn,
              background: sortKey === tab.key ? '#f59e0b' : '#0f172a',
              color: sortKey === tab.key ? '#0f172a' : '#64748b',
              border: `1px solid ${sortKey === tab.key ? '#f59e0b' : '#334155'}`,
              padding: '5px 12px', fontSize: '12px', fontWeight: sortKey === tab.key ? '700' : '500',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add Product Form */}
      <div style={st.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: formOpen ? '16px' : '0' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#f59e0b' }}>➕ Add New Product</div>
          <button onClick={() => setFormOpen(!formOpen)} style={{ ...st.btn, background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', padding: '5px 12px', fontSize: '12px' }}>
            {formOpen ? '▲ Collapse' : '▼ Expand'}
          </button>
        </div>

        {formOpen && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={st.label}>Product Name *</label>
                <input style={inp} placeholder="e.g. Miniket Rice (50kg bag)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              {/* ✅ Description field */}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={st.label}>Description</label>
                <textarea
                  style={{ ...inp, minHeight: '80px', resize: 'vertical', lineHeight: '1.5' }}
                  placeholder="Product description, quality info, origin, etc. (optional)"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label style={st.label}>Category</label>
                <select style={inp} value={form.category_id} onChange={e => { setForm({ ...form, category_id: e.target.value, sub_category_id: '' }); loadSubCategories(e.target.value); }}>
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={st.label}>Sub-Category</label>
                <select style={inp} value={form.sub_category_id} onChange={e => setForm({ ...form, sub_category_id: e.target.value })} disabled={!form.category_id}>
                  <option value="">-- Select Sub-Category --</option>
                  {subCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={st.label}>Unit</label>
                <input style={inp} placeholder="e.g. 50kg bag, litre, piece" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div>
                <label style={st.label}>Stock Quantity</label>
                <input style={inp} type="number" placeholder="500" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div>
                <label style={st.label}>MOQ (Min Order Qty)</label>
                <input style={inp} type="number" placeholder="1" value={form.moq} onChange={e => setForm({ ...form, moq: e.target.value })} />
              </div>
              <div>
                <label style={st.label}>Max Order Qty</label>
                <input style={inp} type="number" placeholder="100" value={form.max_qty} onChange={e => setForm({ ...form, max_qty: e.target.value })} />
              </div>
            </div>

            {/* Price Box */}
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', marginBottom: '12px' }}>💰 Price Configuration</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={st.label}>Cost Price (Admin Only)</label>
                  <input style={{ ...inp, borderColor: '#854d0e' }} type="number" placeholder="1000" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} />
                </div>
                <div>
                  <label style={st.label}>Trade Price * (Customer Sees)</label>
                  <input style={{ ...inp, borderColor: '#4338ca' }} type="number" placeholder="1200" value={form.trade_price} onChange={e => setForm({ ...form, trade_price: e.target.value })} />
                </div>
                <div>
                  <label style={st.label}>MRP</label>
                  <input style={inp} type="number" placeholder="1500" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
                </div>
                <div>
                  <label style={st.label}>Discount Price (Optional)</label>
                  <input style={{ ...inp, borderColor: '#065f46' }} type="number" placeholder="1150" value={form.discount_price} onChange={e => setForm({ ...form, discount_price: e.target.value })} />
                </div>
              </div>
              {profit !== null && (
                <div style={{
                  marginTop: '10px', padding: '10px 14px', borderRadius: '8px',
                  background: profit >= 0 ? '#052e16' : '#450a0a',
                  border: `1px solid ${profit >= 0 ? '#166534' : '#991b1b'}`,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '13px', fontWeight: '700',
                  color: profit >= 0 ? '#4ade80' : '#f87171',
                }}>
                  {profit >= 0 ? '🟢' : '🔴'}
                  {profit >= 0 ? 'Profit' : 'Loss'} per unit: ৳{Math.abs(profit)}
                  {form.cost_price && (
                    <span style={{ fontWeight: '400', color: '#64748b', marginLeft: '8px' }}>
                      ({((Math.abs(profit) / Number(form.cost_price)) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div style={{ marginBottom: '16px' }}>
              <label style={st.label}>Product Images (max 3)</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ position: 'relative' }}>
                    {imagePreviews[i] ? (
                      <>
                        <img src={imagePreviews[i]} alt={`preview ${i + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #f59e0b' }} />
                        <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </>
                    ) : (
                      <label style={{ width: '80px', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', border: '2px dashed #334155', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', color: '#475569', gap: '4px' }}>
                        <span style={{ fontSize: '22px' }}>📷</span>
                        Image {i + 1}
                        <input type="file" accept="image/*" onChange={e => handleImageSelect(i, e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              style={{ ...st.btn, background: '#f59e0b', color: '#0f172a', width: '100%', padding: '12px', opacity: uploading ? 0.7 : 1 }}
              onClick={addProduct}
              disabled={uploading}
            >
              {uploading ? '⏳ Uploading...' : '+ Add Product'}
            </button>
          </>
        )}
      </div>

      {/* Products List */}
      <div style={st.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>Product List</div>
            <span style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#64748b' }}>{filteredProducts.length} shown</span>
            {selectedIds.size > 0 && (
              <span style={{ background: '#451a03', border: '1px solid #f59e0b', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#f59e0b', fontWeight: '700' }}>{selectedIds.size} selected</span>
            )}
          </div>
          {selectedIds.size > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => bulkToggle(true)} style={{ ...st.btn, background: '#14532d', color: '#86efac', fontSize: '12px', padding: '6px 12px' }}>✅ Activate</button>
              <button onClick={() => bulkToggle(false)} style={{ ...st.btn, background: '#1e293b', color: '#f59e0b', border: '1px solid #f59e0b', fontSize: '12px', padding: '6px 12px' }}>⏸ Deactivate</button>
              <button onClick={bulkDelete} style={{ ...st.btn, background: '#7f1d1d', color: '#fca5a5', fontSize: '12px', padding: '6px 12px' }}>🗑 Delete</button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #334155' }}>
          <input
            type="checkbox"
            checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p.id))}
            onChange={e => toggleSelectAll(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#f59e0b' }}
          />
          <label style={{ fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>Select All</label>
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
            <div style={{ fontSize: '13px' }}>No products found</div>
          </div>
        )}

        {filteredProducts.map(p => {
          const itemProfit = p.cost_price && p.trade_price ? (p.trade_price || p.price) - p.cost_price : null;
          const isLow = p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD;
          const isOut = p.stock === 0;
          const extraImgs = [p.image_url_2, p.image_url_3].filter(Boolean);

          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1e293b' }}>
              <input
                type="checkbox"
                checked={selectedIds.has(p.id)}
                onChange={() => toggleSelect(p.id)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#f59e0b', flexShrink: 0 }}
              />

              {p.image_url
                ? <img src={p.image_url} alt={p.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155', flexShrink: 0 }} />
                : <div style={{ width: '52px', height: '52px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📦</div>
              }

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {p.name}
                  {isOut && <span style={{ background: '#1a0505', color: '#ef4444', border: '1px solid #7f1d1d', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: '700' }}>OUT OF STOCK</span>}
                  {isLow && <span style={{ background: '#431407', color: '#fb923c', border: '1px solid #9a3412', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: '700' }}>⚠️ LOW STOCK</span>}
                </div>

                {/* ✅ Description preview in list */}
                {p.description && (
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                    {p.description}
                  </div>
                )}

                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {p.category || 'No category'} · {p.unit} · MOQ: {p.moq}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Trade: <strong style={{ color: '#f59e0b' }}>৳{p.trade_price || p.price}</strong>
                  {p.mrp ? ` · MRP: ৳${p.mrp}` : ''}
                  {p.discount_price ? ` · Discount: ৳${p.discount_price}` : ''}
                  {itemProfit !== null && (
                    <span style={{ marginLeft: '6px', color: itemProfit >= 0 ? '#4ade80' : '#f87171', fontWeight: '700' }}>
                      · {itemProfit >= 0 ? '🟢' : '🔴'} ৳{itemProfit}
                    </span>
                  )}
                </div>
                {extraImgs.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    {extraImgs.map((url, i) => (
                      <img key={i} src={url} alt="" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #334155', cursor: 'pointer' }}
                        onClick={() => window.open(url, '_blank')} />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', minWidth: '90px', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button onClick={() => updateStock(p.id, p.stock - 1)} style={{ background: '#334155', border: 'none', borderRadius: '4px', color: '#e2e8f0', cursor: 'pointer', padding: '2px 7px', fontSize: '14px' }}>−</button>
                  <input
                    type="number"
                    defaultValue={p.stock}
                    key={p.stock}
                    onBlur={e => { if (Number(e.target.value) !== p.stock) updateStock(p.id, e.target.value); }}
                    style={{ width: '48px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '3px 6px', color: '#e2e8f0', fontSize: '12px', textAlign: 'center' }}
                  />
                  <button onClick={() => updateStock(p.id, p.stock + 1)} style={{ background: '#334155', border: 'none', borderRadius: '4px', color: '#e2e8f0', cursor: 'pointer', padding: '2px 7px', fontSize: '14px' }}>+</button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => toggleActive(p.id, p.active)}
                  style={{
                    ...st.btn,
                    background: p.active ? '#052e16' : '#450a0a',
                    color: p.active ? '#4ade80' : '#f87171',
                    border: `1px solid ${p.active ? '#166534' : '#991b1b'}`,
                    padding: '5px 10px', fontSize: '11px', fontWeight: '700',
                  }}
                >
                  {p.active ? '● Active' : '○ Inactive'}
                </button>
                <button
                  onClick={() => setEditProduct(p)}
                  style={{ ...st.iconBtn, background: '#1e3a5f', color: '#60a5fa' }}
                  title="Edit"
                >✏️</button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  style={{ ...st.iconBtn, background: '#450a0a', color: '#f87171' }}
                  title="Delete"
                >🗑</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
