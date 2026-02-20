import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, 
    Calendar, 
    Star, 
    Clock, 
    LogOut,
    Zap,
    Utensils,
    ChefHat
} from 'lucide-react';
import { fetchDashboardData } from '../api/dashboard';
import type { CustomerDashboardData } from '../types/index';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const [data, setData] = useState<CustomerDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Data Fetching & Polling
    useEffect(() => {
        const email = localStorage.getItem('eclat_user_email');
        if (!email) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                const dashboardData = await fetchDashboardData(email);
                setData(dashboardData);
            } catch (err) {
                console.error("Dashboard sync failed", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        // Poll every 10 seconds for real-time order updates
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('eclat_user_email');
        window.location.href = '/';
    };

    // calculate progress to next tier
    const getTierProgress = (points: number, tier: string) => {
        const tiers = { 'Bronze': 1000, 'Silver': 2500, 'Gold': 5000, 'Platinum': 10000 };
        const nextThreshold = tiers[tier as keyof typeof tiers] || 10000;
        return Math.min((points / nextThreshold) * 100, 100);
    };

    if (loading) return (
        <div className="dash-loading">
            <div className="spinner"></div>
            <p>Syncing with Kitchen...</p>
        </div>
    );

    if (!data) return (
        <div className="dash-login">
            <div className="login-card">
                <h1>Member Access</h1>
                <p>Please place an order to create your account.</p>
                <a href="/order" className="btn btn-primary">Order Now</a>
            </div>
        </div>
    );

    const activeOrder = data.activeOrders && data.activeOrders.length > 0 ? data.activeOrders[0] : null;

    return (
        <div className="dashboard-v2">
            <div className="dash-container">
                
                {/* SIDEBAR NAVIGATION */}
                <aside className="dash-sidebar">
                    <div className="user-profile-mini">
                        <div className="avatar">{data.user.firstName[0]}</div>
                        <div className="user-details">
                            <h3>{data.user.firstName}</h3>
                            <span className="tier-tag">{data.user.membershipTier}</span>
                        </div>
                    </div>
                    
                    <nav className="dash-nav">
                        <button className="active"><Zap size={18} /> Overview</button>
                        <a href="/order"><ShoppingBag size={18} /> New Order</a>
                        <a href="/#reservation"><Calendar size={18} /> Reservations</a>
                    </nav>

                    <div className="dash-footer">
                        <button onClick={handleLogout} className="logout-link">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="dash-main">
                    
                    {/* HEADER */}
                    <header className="dash-header">
                        <div>
                            <h1>Dashboard</h1>
                            <p className="live-time">
                                <span className="dot pulse"></span> 
                                {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • System Online
                            </p>
                        </div>
                        <div className="points-display">
                            <span className="label">Loyalty Balance</span>
                            <span className="value">{data.stats.loyaltyPoints.toLocaleString()} <small>PTS</small></span>
                        </div>
                    </header>

                    {/* LIVE ALERTS SECTION */}
                    <AnimatePresence>
                        {activeOrder && (
                            <motion.div 
                                className="live-order-banner"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div className="banner-icon">
                                    <ChefHat size={24} />
                                </div>
                                <div className="banner-content">
                                    <h3>Order #{activeOrder.orderNumber} is Live</h3>
                                    <div className="status-tracker">
                                        <div className={`step completed`}>Placed</div>
                                        <div className={`step ${activeOrder.status === 'preparing' || activeOrder.status === 'delivered' ? 'completed' : 'active'}`}>
                                            Preparing
                                            {activeOrder.status === 'preparing' && <span className="spinner-mini"></span>}
                                        </div>
                                        <div className={`step ${activeOrder.status === 'delivered' ? 'active' : ''}`}>Ready</div>
                                    </div>
                                </div>
                                <div className="banner-timer">
                                    <Clock size={16} />
                                    <span>~25m</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="dash-grid">
                        
                        {/* STATS CARDS */}
                        <div className="card stat-card">
                            <div className="icon-box purple"><ShoppingBag size={20} /></div>
                            <div className="stat-info">
                                <span className="stat-label">Total Orders</span>
                                <span className="stat-num">{data.stats.totalOrders}</span>
                            </div>
                        </div>
                        <div className="card stat-card">
                            <div className="icon-box blue"><Calendar size={20} /></div>
                            <div className="stat-info">
                                <span className="stat-label">Reservations</span>
                                <span className="stat-num">{data.stats.totalReservations}</span>
                            </div>
                        </div>
                        <div className="card stat-card">
                            <div className="icon-box gold"><Star size={20} /></div>
                            <div className="stat-info">
                                <span className="stat-label">Next Reward</span>
                                <span className="stat-num text-sm">{data.user.nextPerk}</span>
                            </div>
                        </div>

                        {/* LOYALTY PROGRESS */}
                        <div className="card wide-card loyalty-section">
                            <div className="card-header">
                                <h3>Tier Progress</h3>
                                <span>{data.user.membershipTier} &rarr; Next Level</span>
                            </div>
                            <div className="progress-bar-container">
                                <motion.div 
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getTierProgress(data.stats.loyaltyPoints, data.user.membershipTier)}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                            <div className="progress-meta">
                                <span>{data.stats.loyaltyPoints} PTS</span>
                                <span>{data.user.pointsToNext} PTS to upgrade</span>
                            </div>
                        </div>

                        {/* RECENT ACTIVITY */}
                        <div className="card wide-card history-section">
                            <div className="card-header">
                                <h3>Recent Activity</h3>
                            </div>
                            <div className="activity-table">
                                {data.orders.length === 0 && <div className="empty-state">No activity yet.</div>}
                                {data.orders.slice(0, 4).map(order => (
                                    <div key={order.id} className="activity-row">
                                        <div className="act-icon"><Utensils size={16} /></div>
                                        <div className="act-details">
                                            <strong>Order {order.orderNumber}</strong>
                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className={`act-status ${order.status}`}>{order.status}</div>
                                        <div className="act-price">${order.totals.total.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
