import React from 'react';
import { motion } from 'framer-motion';
import './Gallery.css';

const Gallery: React.FC = () => {
    const images = [
        { url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', label: 'Mixology', class: 'item-a' },
        { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', label: 'Main Hall', class: 'item-b' },
        { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', label: 'Details', class: 'item-c' },
        { url: 'https://images.unsplash.com/photo-1574937302251-58286950005a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', label: 'Cellar', class: 'item-d' },
        { url: 'https://images.unsplash.com/photo-1550966842-30c2768d58ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', label: 'Craft', class: 'item-e' }
    ];

    return (
        <section className="gallery-section" id="gallery">
            <div className="container text-center">
                <span className="section-label">Atmosphere</span>
                <h2 className="section-title">L'ambiance</h2>
                <p className="section-description">A Visual Journey through our culinary world.</p>
            </div>
            
            <div className="gallery-grid container">
                {images.map((img, index) => (
                    <motion.div 
                        key={index}
                        className={`gallery-item ${img.class}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <img src={img.url} alt={img.label} />
                        <div className="gallery-overlay">
                            <span className="gallery-label">{img.label}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Gallery;
