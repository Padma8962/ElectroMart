import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

export default function CartPage({ darkMode, toggleDark }) {
  const navigate = useNavigate();
  const { cartCount, setCartCount } = useAuth();
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('em_cart') || '[]'));
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setCartCount(cart.length);
    localStorage.setItem('em_cart', JSON.stringify(cart));
  }, [cart, setCartCount]);

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        return { ...item, quantity: newQty };
      })
    );
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    setToast({ message: 'Item removed from cart', type: 'error' });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} cartCount={cartCount} />

      <div className="cart-content">
        <h2 className="cart-title">Cart</h2>

        {cart.length === 0 ? (
          <div className="cart-empty">
            🛒 Your cart is empty. Go to dashboard to add products!
          </div>
        ) : (
          <>
            <div className="cart-container">
              {cart.map(item => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>₹{item.price.toLocaleString()}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <button className="btn-remove" onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total">
              Total: ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="cart-actions">
              <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                Continue Shopping
              </button>
              <button className="btn-primary cart-checkout-btn" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
