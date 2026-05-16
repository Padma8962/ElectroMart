import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const PAYMENT_OPTIONS = [
  { id: 'cod', label: 'Cash on Delivery', note: 'Pay when your order reaches your address.' },
  { id: 'card', label: 'Credit / Debit Card', note: 'Enter card details for a secure payment demo.' },
  { id: 'upi', label: 'UPI', note: 'Use any UPI app to complete this demo payment.' },
];

const initialDelivery = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  pincode: '',
};

export default function CheckoutPage({ darkMode, toggleDark }) {
  const navigate = useNavigate();
  const { cartCount, setCartCount } = useAuth();
  const [cart] = useState(() => JSON.parse(localStorage.getItem('em_cart') || '[]'));
  const [delivery, setDelivery] = useState(initialDelivery);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [toast, setToast] = useState(null);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const deliveryCharge = total > 0 && total < 1000 ? 49 : 0;
  const payable = total + deliveryCharge;

  useEffect(() => {
    setCartCount(cart.length);
  }, [cart.length, setCartCount]);

  const updateDelivery = (field, value) => {
    setDelivery(prev => ({ ...prev, [field]: value }));
  };

  const updateCard = (field, value) => {
    setCard(prev => ({ ...prev, [field]: value }));
  };

  const validateOrder = () => {
    if (cart.length === 0) return 'Your cart is empty.';
    if (!delivery.fullName || !delivery.phone || !delivery.address || !delivery.city || !delivery.pincode) {
      return 'Please fill all delivery details.';
    }
    if (!/^[0-9]{10}$/.test(delivery.phone)) return 'Please enter a valid 10 digit mobile number.';
    if (!/^[0-9]{6}$/.test(delivery.pincode)) return 'Please enter a valid 6 digit pincode.';

    if (paymentMethod === 'card') {
      if (!card.name || !card.number || !card.expiry || !card.cvv) return 'Please fill all card details.';
      if (card.number.replace(/\s/g, '').length < 12) return 'Please enter a valid card number.';
      if (!/^[0-9]{3,4}$/.test(card.cvv)) return 'Please enter a valid CVV.';
    }

    if (paymentMethod === 'upi' && !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
      return 'Please enter a valid UPI ID.';
    }

    return '';
  };

  const handlePlaceOrder = (event) => {
    event.preventDefault();
    const error = validateOrder();
    if (error) {
      setToast({ message: error, type: 'error' });
      return;
    }

    localStorage.removeItem('em_cart');
    setCartCount(0);
    setToast({ message: 'Order placed successfully!', type: 'success' });
    setTimeout(() => navigate('/dashboard'), 1200);
  };

  return (
    <div className="checkout-page">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} cartCount={cartCount} />

      <form className="checkout-content" onSubmit={handlePlaceOrder}>
        <div className="checkout-header">
          <div>
            <h2 className="cart-title">Transaction</h2>
            <p className="checkout-subtitle">Confirm delivery details and choose how you want to pay.</p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => navigate('/cart')}>
            Back to Cart
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">Your cart is empty. Add products before checkout.</div>
        ) : (
          <div className="checkout-grid">
            <div className="checkout-main">
              <section className="checkout-panel">
                <h3>Delivery Details</h3>
                <div className="checkout-form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input className="form-control" value={delivery.fullName} onChange={e => updateDelivery('fullName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input className="form-control" value={delivery.phone} maxLength="10" onChange={e => updateDelivery('phone', e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div className="form-group checkout-wide">
                    <label>Delivery Address</label>
                    <textarea className="form-control" value={delivery.address} onChange={e => updateDelivery('address', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input className="form-control" value={delivery.city} onChange={e => updateDelivery('city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input className="form-control" value={delivery.pincode} maxLength="6" onChange={e => updateDelivery('pincode', e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
              </section>

              <section className="checkout-panel">
                <h3>Payment Method</h3>
                <div className="payment-options">
                  {PAYMENT_OPTIONS.map(option => (
                    <label className={`payment-option ${paymentMethod === option.id ? 'active' : ''}`} key={option.id}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === option.id}
                        onChange={() => setPaymentMethod(option.id)}
                      />
                      <span>
                        <strong>{option.label}</strong>
                        <small>{option.note}</small>
                      </span>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="payment-detail-grid">
                    <div className="form-group checkout-wide">
                      <label>Name on Card</label>
                      <input className="form-control" value={card.name} onChange={e => updateCard('name', e.target.value)} />
                    </div>
                    <div className="form-group checkout-wide">
                      <label>Card Number</label>
                      <input className="form-control" value={card.number} maxLength="19" onChange={e => updateCard('number', e.target.value.replace(/[^\d ]/g, ''))} />
                    </div>
                    <div className="form-group">
                      <label>Expiry</label>
                      <input className="form-control" placeholder="MM/YY" value={card.expiry} maxLength="5" onChange={e => updateCard('expiry', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input className="form-control" type="password" value={card.cvv} maxLength="4" onChange={e => updateCard('cvv', e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="payment-detail-grid">
                    <div className="form-group checkout-wide">
                      <label>UPI ID</label>
                      <input className="form-control" placeholder="name@bank" value={upiId} onChange={e => setUpiId(e.target.value)} />
                    </div>
                  </div>
                )}
              </section>
            </div>

            <aside className="checkout-summary">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cart.map(item => (
                  <div className="summary-item" key={item.id}>
                    <span>{item.name} x {item.quantity}</span>
                    <strong>Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>
              <div className="summary-line">
                <span>Subtotal</span>
                <strong>Rs. {total.toLocaleString('en-IN')}</strong>
              </div>
              <div className="summary-line">
                <span>Delivery</span>
                <strong>{deliveryCharge === 0 ? 'Free' : `Rs. ${deliveryCharge}`}</strong>
              </div>
              <div className="summary-total">
                <span>Payable</span>
                <strong>Rs. {payable.toLocaleString('en-IN')}</strong>
              </div>
              <button type="submit" className="btn-primary checkout-place-order">
                Place Order
              </button>
            </aside>
          </div>
        )}
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
