import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchMenuItems } from '../api/menu';
import type { MenuItem } from '../types/index';
import './Menu.css';

const Menu: React.FC = () => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const { addToCart } = useCart();

    useEffect(() => {
        const loadMenu = async () => {
            setLoading(true);
            const data = await fetchMenuItems(activeCategory);
            setItems(data);
            setLoading(false);
        };
        loadMenu();
    }, [activeCategory]);

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'starters', label: 'Starters' },
        { id: 'mains', label: 'Mains' },
        { id: 'desserts', label: 'Desserts' },
        { id: 'drinks', label: 'Drinks' }
    ];

    return (
        <div className="menu-page">
            <header className="menu-header">
                <div className="container">
                    <span className="section-label">La Carte</span>
                    <h1>Culinary Artistry</h1>
                    <p className="section-description">A curated selection of seasonal flavors and modern French techniques.</p>
                </div>
            </header>

            <div className="container">
                <nav className="menu-nav">
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            className={`menu-nav-btn ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </nav>

                <div className="menu-grid">
                    <AnimatePresence mode='popLayout'>
                        {loading ? (
                            <div className="menu-loading">Loading...</div>
                        ) : items.length === 0 ? (
                            <div className="menu-empty">No items found for this category.</div>
                        ) : (
                            items.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    className="menu-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    layout
                                >
                                    <div className="menu-card-image">
                                        <img src={item.image} alt={item.name} />
                                        {item.badge && <span className="menu-badge">{item.badge}</span>}
                                    </div>
                                    <div className="menu-card-content">
                                        <div className="menu-card-header">
                                            <h3>{item.name}</h3>
                                            <span className="menu-price">${item.price.toFixed(2)}</span>
                                        </div>
                                        <p className="menu-description">{item.description}</p>
                                        <button 
                                            className="btn btn-primary add-to-cart"
                                            onClick={() => addToCart(item)}
                                        >
                                            <ShoppingBag size={16} />
                                            <span>Add to Cart</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Menu;
