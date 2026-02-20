import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, ChevronRight, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Order.css';

const Order: React.FC = () => {
    const { cart, updateQuantity, removeFromCart, subtotal, tax, total, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        instructions: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(3);
        clearCart();
    };

    if (step === 3) {
        return (
            <div className="order-page success-page">
                <div className="container">
                    <motion.div 
                        className="success-content"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <CheckCircle size={80} color="var(--color-success)" />
                        <h1>Order Confirmed!</h1>
                        <p>Thank you for choosing Éclat Bistro. Your culinary experience will arrive shortly.</p>
                        <div className="order-number">ORD-{Math.floor(Math.random() * 1000000)}</div>
                        <a href="/" className="btn btn-primary">Return Home</a>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-page">
            <div className="container">
                <div className="order-layout">
                    {/* Cart Items */}
                    <div className="order-main">
                        <div className="section-header">
                            <h1>Your Selection</h1>
                            <p>{cart.length} items in your basket</p>
                        </div>

                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <ShoppingBag size={48} color="var(--color-text-light)" />
                                <p>Your selection is currently empty.</p>
                                <a href="/menu" className="btn btn-outline" style={{marginTop: '1.5rem'}}>Browse Our Menu</a>
                            </div>
                        ) : (
                            <div className="cart-items-list">
                                {cart.map(item => (
                                    <div key={item.id} className="cart-item-row">
                                        <div className="item-img">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="item-info">
                                            <h3>{item.name}</h3>
                                            <p className="item-price">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="item-actions">
                                            <div className="qty-controls">
                                                <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                                            </div>
                                            <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="item-total">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 2 && cart.length > 0 && (
                            <motion.div 
                                className="checkout-form-section"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                <form id="checkoutForm" onSubmit={handleSubmit}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>First Name *</label>
                                            <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name *</label>
                                            <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group full">
                                            <label>Email Address *</label>
                                            <input type="email" name="email" required value={formData.email} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group full">
                                            <label>Delivery Address *</label>
                                            <input type="text" name="address" required value={formData.address} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <textarea 
                                        name="instructions" 
                                        placeholder="Special instructions or dietary requirements" 
                                        value={formData.instructions}
                                        onChange={handleInputChange}
                                    />
                                </form>
                            </motion.div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <aside className="order-sidebar">
                        <div className="summary-card">
                            <h2>Summary</h2>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax (10%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="summary-row total-row">
                                <span>Grand Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            {cart.length > 0 && (
                                <button 
                                    className="btn btn-primary checkout-btn"
                                    onClick={() => step === 1 ? setStep(2) : (document.getElementById('checkoutForm') as HTMLFormElement)?.requestSubmit()}
                                >
                                    {step === 1 ? 'Proceed to Checkout' : 'Place Order'}
                                    <ChevronRight size={18} />
                                </button>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Order;
