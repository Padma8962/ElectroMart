import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { API_ORIGIN, addProduct, deleteProduct, getProducts, updateProduct } from '../services/api';

const icons = {
  All: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Mobiles: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>,
  Laptops: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M0 21h24M7 21l2-4h6l2 4"/></svg>,
  Appliances: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20"/></svg>,
  Headphones: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  Watches: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/></svg>,
};

const CATEGORIES = ['All', 'Mobiles', 'Laptops', 'Appliances', 'Headphones', 'Watches'];
const FALLBACK_IMAGE = 'https://via.placeholder.com/300x150?text=ElectroMart';

const resolveImageUrl = product => {
  if (!product.imageUrl) return FALLBACK_IMAGE;
  if (product.imageUrl.startsWith('http')) return product.imageUrl;
  if (product.imageUrl.startsWith('/api/')) return `${API_ORIGIN}${product.imageUrl}`;
  return product.imageUrl;
};

export default function AdminDashboard({ darkMode, toggleDark }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [form, setForm] = useState({ title: '', price: '', category: 'Mobiles', description: '', imageFile: null, imagePreview: null });
  const [editModal, setEditModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts(0, 100);
      setProducts(res.data.content || []);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Unable to load products.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'imageFile' && files[0]) {
      const url = URL.createObjectURL(files[0]);
      setForm(f => ({ ...f, imageFile: files[0], imagePreview: url }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleAddProduct = async e => {
    e.preventDefault();
    if (!form.title || !form.price) return;

    try {
      const data = new FormData();
      data.append('name', form.title);
      data.append('price', form.price);
      data.append('category', form.category);
      data.append('description', form.description);
      data.append('stockQuantity', '100');
      if (form.imageFile) data.append('image', form.imageFile);

      const res = await addProduct(data);
      setProducts(prev => [res.data, ...prev]);
      setForm({ title: '', price: '', category: 'Mobiles', description: '', imageFile: null, imagePreview: null });
      setToast({ message: 'Product added successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Could not add product.', type: 'error' });
    }
  };

  const handleDelete = async id => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setToast({ message: 'Product deleted.', type: 'error' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Could not delete product.', type: 'error' });
    }
  };

  const handleEditSave = async () => {
    try {
      const data = new FormData();
      data.append('name', editModal.name);
      data.append('price', editModal.price);
      data.append('category', editModal.category);
      data.append('description', editModal.description || '');
      data.append('stockQuantity', editModal.stockQuantity || '100');

      const res = await updateProduct(editModal.id, data);
      setProducts(prev => prev.map(p => p.id === editModal.id ? res.data : p));
      setEditModal(null);
      setToast({ message: 'Product updated!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Could not update product.', type: 'error' });
    }
  };

  const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  return (
    <div className="dashboard-page">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      <div className="dashboard-content">
        <h2 className="welcome-heading">
          Welcome, <span>{user?.fullName || 'Admin'}</span>
        </h2>

        <div className="add-product-card">
          <h3>Add Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="add-product-row">
              <input className="form-control" placeholder="Title" name="title" value={form.title} onChange={handleFormChange} required />
              <input className="form-control" placeholder="Price" name="price" type="number" value={form.price} onChange={handleFormChange} required />
            </div>
            <div className="add-product-row">
              <select className="form-control" name="category" value={form.category} onChange={handleFormChange}>
                {['Mobiles','Laptops','Appliances','Headphones','Watches'].map(c => <option key={c}>{c}</option>)}
              </select>
              <div className="file-input-wrapper">
                <input type="file" accept="image/*" name="imageFile" onChange={handleFormChange} style={{ fontSize: '0.8rem' }} />
              </div>
            </div>
            <textarea className="form-control" placeholder="Description" name="description" value={form.description} onChange={handleFormChange} rows={3} />
            <button type="submit" className="btn-add-product">Add Product</button>
          </form>
        </div>

        <div className="category-tabs">
          {CATEGORIES.map(cat => {
            const Icon = icons[cat];
            return (
              <button key={cat} className={`cat-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                {Icon && <Icon />}
                {cat}
              </button>
            );
          })}
        </div>

        {loading && <div className="empty-state">Loading products...</div>}
        {!loading && filtered.length === 0 && <div className="empty-state">No products found.</div>}

        <div className="products-grid">
          {filtered.map(product => (
            <div className="product-card" key={product.id}>
              <img className="product-card-img" src={resolveImageUrl(product)} alt={product.name} onError={e => { e.target.src = FALLBACK_IMAGE; }} />
              <div className="product-card-body">
                <div className="product-name">{product.name}</div>
                <div className="product-price" style={{ marginBottom: 8 }}>Rs. {Number(product.price).toLocaleString()}</div>
                <div className="admin-card-footer">
                  <button className="btn-edit" onClick={() => setEditModal({ ...product })}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Edit Product</h3>
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={editModal.name} onChange={e => setEditModal({...editModal, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Price (Rs.)</label>
              <input className="form-control" type="number" value={editModal.price} onChange={e => setEditModal({...editModal, price: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={editModal.category} onChange={e => setEditModal({...editModal, category: e.target.value})}>
                {['Mobiles','Laptops','Appliances','Headphones','Watches'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn-save" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
