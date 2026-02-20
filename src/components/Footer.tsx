import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h2 className="logo-text">Éclat Bistro</h2>
                        <p>Experience the perfect blend of tradition and modern innovation in every dish we serve.</p>
                    </div>

                    <div className="footer-col">
                        <h3>Explore</h3>
                        <ul>
                            <li><a href="/menu">Menu</a></li>
                            <li><a href="/#reservation">Reservations</a></li>
                            <li><a href="/#about">Our Story</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3>Contact</h3>
                        <p>Richmond Hill, Ontario CA</p>
                        <p>info@eclatbistro.com</p>
                        <p>(888) 123-4567</p>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Éclat Bistro. All rights reserved.</p>
                    <div className="social-links">
                        <a href="#" className="social-link"><Instagram size={20} /></a>
                        <a href="#" className="social-link"><Facebook size={20} /></a>
                        <a href="#" className="social-link"><Twitter size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
