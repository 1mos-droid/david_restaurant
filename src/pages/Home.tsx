import React from 'react';
import { motion } from 'framer-motion';
import { Clock, GlassWater, UtensilsCrossed, Briefcase } from 'lucide-react';
import Gallery from '../components/Gallery';
import Reservation from '../components/Reservation';
import './Home.css';

const Home: React.FC = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="container hero-container">
                    <motion.div 
                        className="hero-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="hero-welcome">Est. 2010</span>
                        <h1>Crafting <br />Culinary <br /><span className="highlight">Artistry</span></h1>
                        <p>An immersive dining experience where modern innovation <br />meets timeless French tradition.</p>
                        <div className="hero-buttons">
                            <a href="#reservation" className="btn btn-primary">Book a Table</a>
                            <a href="/menu" className="btn btn-outline">Explore Menu</a>
                        </div>
                        <div className="hero-hours">
                            <Clock size={16} /> Mon – Sun: 11:00am – 11:00pm
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="hero-image"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Exquisite Dining Experience" />
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section className="about" id="about">
                <div className="container">
                    <div className="about-grid">
                        <motion.div 
                            className="about-content"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="section-label">Philosophie</span>
                            <h2 className="section-title">Where Tradition <br />Meets Innovation</h2>
                            <p className="about-description">
                                "Each dish tells a story—of the land, the sea, and the passionate hands that bring it to your table."
                            </p>
                            <p>
                                Founded in 2010 by Chef Alexandre Moreau, Éclat Bistro represents a harmonious blend of classic
                                French techniques and modern culinary innovation. We believe that exceptional dining is not just about food, but about creating memorable experiences that linger long after the last bite.
                            </p>
                            
                            <div className="about-stats">
                                <div className="stat">
                                    <div className="stat-number">14</div>
                                    <div className="stat-label">Years of Excellence</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-number">3</div>
                                    <div className="stat-label">Michelin Stars</div>
                                </div>
                            </div>
                        </motion.div>
                        
                        <div className="about-images">
                            <div className="image-main">
                                <img src="https://images.unsplash.com/photo-1550966842-30c2768d58ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Exquisite Kitchen" loading="lazy" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services-section container" id="services">
                <div className="text-center">
                    <span className="section-label">Privé</span>
                    <h2 className="section-title">Exclusive Services</h2>
                    <p className="section-description">Bespoke culinary experiences tailored for the most discerning guests.</p>
                </div>
                
                <div className="services-grid">
                    {[
                        { icon: UtensilsCrossed, title: 'Private Events', desc: 'From intimate celebrations to grand galas, our dedicated events team ensures every detail is perfect.' },
                        { icon: GlassWater, title: 'Sommelier Selection', desc: 'Guided tastings and private cellar access for true wine connoisseurs.' },
                        { icon: Briefcase, title: 'Corporate Dining', desc: 'Sophisticated environments for business discussions over world-class cuisine.' }
                    ].map((service, index) => (
                        <motion.div 
                            key={index}
                            className="service-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="service-icon"><service.icon size={24} /></div>
                            <h3>{service.title}</h3>
                            <p>{service.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <Gallery />
            
            <Reservation />
            
            {/* Testimonials */}
            <section className="testimonials">
                <div className="container">
                    <motion.div 
                        className="testimonial-content text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <span className="section-label">Reviews</span>
                        <h3 className="testimonial-text">"An Unforgettable Experience. The service was impeccable, and the tasting menu was a journey through flavors I never knew existed."</h3>
                        <div className="testimonial-author">
                            <strong>Michael Foster</strong>
                            <span>Food Critic, Epicure Magazine</span>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
