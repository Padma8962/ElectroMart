import React from 'react';
import { useNavigate } from 'react-router-dom';

const featuredProducts = [
  { name: 'Apple iPhone', price: 'Rs. 1,29,999', imageUrl: '/images/iphone.jpeg' },
  { name: 'Acer Laptop', price: 'Rs. 39,999', imageUrl: '/images/acer.jpeg' },
  { name: 'Boat Earphone', price: 'Rs. 399', imageUrl: '/images/earphone2.png' },
];

export default function HomePage({ darkMode, toggleDark }) {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <nav className="home-navbar">
        <button className="navbar-brand home-brand" onClick={() => navigate('/')}>
          ElectroMart
        </button>
        <div className="home-nav-actions">
          <button className="btn-secondary" onClick={toggleDark}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/admin/login')}>
            Admin
          </button>
          <button className="btn-primary home-login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </nav>

      <main className="home-hero">
        <section className="home-copy">
          <p className="home-kicker">Electronics, appliances, and accessories</p>
          <h1>ElectroMart</h1>
          <p>
            Shop mobiles, laptops, headphones, and smart home essentials with a simple cart and checkout experience.
          </p>
          <div className="home-actions">
            <button className="btn-primary home-shop-btn" onClick={() => navigate('/login')}>
              Start Shopping
            </button>
            <button className="btn-secondary" onClick={() => navigate('/admin/login')}>
              Admin Login
            </button>
          </div>
        </section>

        <section className="home-products" aria-label="Featured products">
          {featuredProducts.map(product => (
            <article className="home-product-card" key={product.name}>
              <img src={product.imageUrl} alt={product.name} />
              <div>
                <h3>{product.name}</h3>
                <p>{product.price}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
