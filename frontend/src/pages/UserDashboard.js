import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { API_ORIGIN, getByCategory, getProducts } from '../services/api';

const icons = {
  All: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Mobiles: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>,
  Laptops: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M0 21h24M7 21l2-4h6l2 4"/></svg>,
  Appliances: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20"/></svg>,
  Headphones: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  Watches: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/></svg>,
};

const CATEGORIES = ['All', 'Mobiles', 'Laptops', 'Appliances', 'Headphones', 'Watches'];
const PAGE_SIZE = 8;
const FALLBACK_IMAGE = 'https://via.placeholder.com/300x150?text=ElectroMart';

const resolveImageUrl = product => {
  if (!product.imageUrl) return FALLBACK_IMAGE;
  if (product.imageUrl.startsWith('http')) return product.imageUrl;
  if (product.imageUrl.startsWith('/api/')) return `${API_ORIGIN}${product.imageUrl}`;
  return product.imageUrl;
};

export default function UserDashboard({ darkMode, toggleDark }) {
  const { user, setCartCount, cartCount } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('em_cart') || '[]'));
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setCartCount(cart.length);
  }, [cart, setCartCount]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = activeCategory === 'All'
          ? await getProducts(page, PAGE_SIZE)
          : await getByCategory(activeCategory);

        if (activeCategory === 'All') {
          setProducts(res.data.content || []);
          setTotalPages(res.data.totalPages || 0);
        } else {
          const categoryProducts = res.data || [];
          setProducts(categoryProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
          setTotalPages(Math.ceil(categoryProducts.length / PAGE_SIZE));
        }
      } catch (err) {
        setProducts([]);
        setTotalPages(0);
        setToast({ message: err.response?.data?.message || 'Unable to load products.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeCategory, page]);

  const handleCategoryChange = cat => {
    setActiveCategory(cat);
    setPage(0);
  };

  const handleAddToCart = product => {
    const existing = cart.find(c => c.id === product.id);
    const updated = existing
      ? cart.map(c => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c)
      : [...cart, { ...product, imageUrl: resolveImageUrl(product), quantity: 1 }];

    setCart(updated);
    localStorage.setItem('em_cart', JSON.stringify(updated));
    setToast({ message: `${product.name} added to cart!`, type: 'success' });
  };

  return (
    <div className="dashboard-page">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} cartCount={cartCount} />

      <div className="dashboard-content">
        <h2 className="welcome-heading">
          Welcome, <span>{user?.fullName || 'User'}</span>
        </h2>

        <div className="category-tabs">
          {CATEGORIES.map(cat => {
            const Icon = icons[cat];
            return (
              <button key={cat} className={`cat-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => handleCategoryChange(cat)}>
                {Icon && <Icon />}
                {cat}
              </button>
            );
          })}
        </div>

        {loading && <div className="empty-state">Loading products...</div>}
        {!loading && products.length === 0 && <div className="empty-state">No products found.</div>}

        <div className="products-grid">
          {products.map(product => (
            <div className="product-card" key={product.id}>
              <img className="product-card-img" src={resolveImageUrl(product)} alt={product.name} onError={e => { e.target.src = FALLBACK_IMAGE; }} />
              <div className="product-card-body">
                <div className="product-name">{product.name}</div>
                <div className="product-desc">{product.description}</div>
                <div className="product-footer">
                  <span className="product-price">Rs. {Number(product.price).toLocaleString()}</span>
                  <button className="btn-add-cart" onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              &lt;
            </button>
            <span className="page-info">
              Page <span>{page + 1}</span> of <span>{totalPages}</span>
            </span>
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
              &gt;
            </button>
          </div>
        )}
      </div>

      <Footer />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
