import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { totalItems } = useCart();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const scrollToSection = (id: string) => {
        closeMenu();
        if (location.pathname !== '/') {
            // Navigation handled by ScrollToTop in App.tsx
            return;
        }
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <Link to="/" className="logo" onClick={closeMenu}>
                    <span className="logo-icon">E</span>
                    <span className="logo-text">Éclat Bistro</span>
                </Link>

                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className={`nav-link ${location.pathname === '/' && !location.hash ? 'active' : ''}`} onClick={closeMenu}>Home</Link>
                    <Link to="/menu" className={`nav-link ${location.pathname === '/menu' ? 'active' : ''}`} onClick={closeMenu}>Menu</Link>
                    <Link to="/#reservation" className={`nav-link ${location.hash === '#reservation' ? 'active' : ''}`} onClick={() => scrollToSection('reservation')}>Reservations</Link>
                    <Link to="/#gallery" className={`nav-link ${location.hash === '#gallery' ? 'active' : ''}`} onClick={() => scrollToSection('gallery')}>Gallery</Link>
                    <Link to="/#about" className={`nav-link ${location.hash === '#about' ? 'active' : ''}`} onClick={() => scrollToSection('about')}>About</Link>
                    <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={closeMenu}>Dashboard</Link>
                </div>

                <div className="nav-actions">
                    <Link to="/order" className="btn btn-primary btn-sm order-btn">
                        <ShoppingBag size={18} />
                        <span className="order-text">Order Online</span>
                        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                    </Link>
                    
                    <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
