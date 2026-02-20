import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, Send } from 'lucide-react';
import axios from 'axios';
import './Reservation.css';

const Reservation: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        guests: 2,
        date: '',
        time: '',
        occasion: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await axios.post('http://localhost:3000/api/reservations', {
                adults: formData.guests,
                date: formData.date,
                time: formData.time,
                contact: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone
                }
            });
            setStatus('success');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                guests: 2,
                date: '',
                time: '',
                occasion: ''
            });
        } catch (error) {
            console.error('Reservation failed:', error);
            setStatus('error');
        }
    };

    return (
        <section className="reservation-section" id="reservation">
            <div className="reservation-container container">
                <div className="reservation-content">
                    <motion.div 
                        className="reservation-text"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="section-label">Concierge</span>
                        <h2 className="section-title">Reserve Your Table</h2>
                        <p>Join us for an unforgettable dining experience. We recommend booking at least 48 hours in advance for weekend dinners.</p>
                        
                        <div className="reservation-info">
                            <div className="info-item">
                                <Clock size={20} />
                                <div>
                                    <h4>Lunch Service</h4>
                                    <p>Mon - Sun: 11:30am - 2:30pm</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <Clock size={20} />
                                <div>
                                    <h4>Dinner Service</h4>
                                    <p>Mon - Sun: 5:30pm - 11:00pm</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="reservation-form-wrapper"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        {status === 'success' ? (
                            <div className="reservation-success">
                                <Send size={48} className="success-icon" />
                                <h3>Reservation Request Received</h3>
                                <p>Thank you! We will contact you shortly to confirm your booking.</p>
                                <button className="btn btn-outline" onClick={() => setStatus('idle')}>Make Another Booking</button>
                            </div>
                        ) : (
                            <form className="reservation-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <input type="text" name="firstName" placeholder="FIRST NAME *" required value={formData.firstName} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <input type="text" name="lastName" placeholder="LAST NAME *" required value={formData.lastName} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <input type="email" name="email" placeholder="EMAIL ADDRESS *" required value={formData.email} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <input type="tel" name="phone" placeholder="PHONE NUMBER *" required value={formData.phone} onChange={handleInputChange} pattern="[0-9+() -]*" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <div className="input-with-icon">
                                            <Users size={16} />
                                            <input type="number" name="guests" min="1" max="20" required value={formData.guests} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="input-with-icon">
                                            <Calendar size={16} />
                                            <input type="date" name="date" required value={formData.date} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <input type="time" name="time" required value={formData.time} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <textarea name="occasion" placeholder="SPECIAL REQUESTS OR OCCASION" value={formData.occasion} onChange={handleInputChange}></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary submit-btn" disabled={status === 'submitting'}>
                                    {status === 'submitting' ? 'Processing...' : 'Secure Reservation'}
                                </button>
                                {status === 'error' && <p className="error-message">Something went wrong. Please try again.</p>}
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Reservation;
