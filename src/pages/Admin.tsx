import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    Utensils, 
    ShoppingBag, 
    Calendar, 
    Plus,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    ArrowUpRight,
    Search,
    X,
    Save
} from 'lucide-react';
import type { Order, MenuItem, Reservation } from '../types/index';
import './Admin.css';

const Admin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'orders' | 'reservations'>('dashboard');
    const [stats, setStats] = useState<any>(null);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

    const API_URL = '/api';

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const res = await axios.get(`${API_URL}/admin/stats`);
                setStats(res.data);
            } else if (activeTab === 'menu') {
                const res = await axios.get(`${API_URL}/menu`);
                setMenu(res.data);
            } else if (activeTab === 'orders') {
                const res = await axios.get(`${API_URL}/admin/orders`);
                setOrders(res.data);
            } else if (activeTab === 'reservations') {
                const res = await axios.get(`${API_URL}/admin/reservations`);
                setReservations(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- MENU ACTIONS ---
    const handleSaveMenu = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem?.id) {
                await axios.put(`${API_URL}/admin/menu/${editingItem.id}`, editingItem);
            } else {
                await axios.post(`${API_URL}/admin/menu`, editingItem);
            }
            setIsMenuModalOpen(false);
            setEditingItem(null);
            fetchData();
        } catch (error) {
            alert('Failed to save item');
        }
    };

    const deleteMenuItem = async (id: number) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await axios.delete(`${API_URL}/admin/menu/${id}`);
            fetchData();
        } catch (error) {
            console.error('Delete failed');
        }
    };

    // --- ORDER ACTIONS ---
    const updateOrderStatus = async (id: string, status: string) => {
        try {
            await axios.patch(`${API_URL}/admin/orders/${id}/status`, { status });
            fetchData();
        } catch (error) {
            console.error('Failed to update status');
        }
    };

    // --- RESERVATION ACTIONS ---
    const updateResStatus = async (id: string, status: string) => {
        try {
            await axios.patch(`${API_URL}/admin/reservations/${id}/status`, { status });
            fetchData();
        } catch (error) {
            console.error('Failed to update status');
        }
    };

    return (
        <div className="admin-page">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <div className="logo-sq">E</div>
                    <span>Operations</span>
                </div>
                <nav className="admin-nav">
                    <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={18} /> Analytics
                    </button>
                    <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>
                        <Utensils size={18} /> Menu Library
                    </button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        <ShoppingBag size={18} /> Live Orders
                    </button>
                    <button className={activeTab === 'reservations' ? 'active' : ''} onClick={() => setActiveTab('reservations')}>
                        <Calendar size={18} /> Bookings
                    </button>
                </nav>
            </aside>

            {/* MAIN */}
            <main className="admin-main">
                <header className="admin-main-header">
                    <div>
                        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p>Managing Éclat Bistro Real-time Data</p>
                    </div>
                    <div className="admin-actions">
                        <div className="admin-user">
                            <div className="avatar-sm">A</div>
                            <span>Administrator</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {loading ? (
                        <div className="admin-loading-view">
                            <div className="spinner-lg"></div>
                            <p>Fetching latest operational data...</p>
                        </div>
                    ) : (
                        <>
                            {/* ANALYTICS VIEW */}
                            {activeTab === 'dashboard' && stats && (
                        <div className="admin-dashboard-view">
                            <div className="stats-grid">
                                <div className="admin-stat-card primary">
                                    <span className="label">Total Revenue</span>
                                    <span className="value">${stats.totalRevenue.toLocaleString()}</span>
                                    <span className="trend up"><ArrowUpRight size={14}/> Live Sync</span>
                                </div>
                                <div className="admin-stat-card">
                                    <span className="label">Pending Orders</span>
                                    <span className="value">{stats.pendingOrders}</span>
                                    <p>Kitchen waiting to start</p>
                                </div>
                                <div className="admin-stat-card">
                                    <span className="label">Today's Bookings</span>
                                    <span className="value">{stats.todayReservations}</span>
                                    <p>Tables reserved for today</p>
                                </div>
                                <div className="admin-stat-card">
                                    <span className="label">Popular Category</span>
                                    <span className="value text-lg">{stats.popularCategory}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MENU MANAGEMENT VIEW */}
                    {activeTab === 'menu' && (
                        <div className="admin-table-view">
                            <div className="table-header-actions">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input type="text" placeholder="Search menu items..." />
                                </div>
                                <button className="btn btn-primary" onClick={() => { setEditingItem({}); setIsMenuModalOpen(true); }}>
                                    <Plus size={18} /> New Item
                                </button>
                            </div>
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Dish</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menu.map(item => (
                                            <tr key={item.id}>
                                                <td className="dish-cell">
                                                    <img src={item.image} alt="" />
                                                    <div>
                                                        <strong>{item.name}</strong>
                                                        <span>{item.description.substring(0, 30)}...</span>
                                                    </div>
                                                </td>
                                                <td><span className="tag">{item.category}</span></td>
                                                <td><strong>${item.price.toFixed(2)}</strong></td>
                                                <td><span className="status-indicator online">Available</span></td>
                                                <td className="actions">
                                                    <button onClick={() => { setEditingItem(item); setIsMenuModalOpen(true); }}><Edit2 size={16} /></button>
                                                    <button className="del" onClick={() => deleteMenuItem(item.id)}><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ORDERS VIEW */}
                    {activeTab === 'orders' && (
                        <div className="admin-table-view">
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Control</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length === 0 && <tr><td colSpan={6} style={{textAlign: 'center', padding: '4rem'}}>No orders found.</td></tr>}
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td><small>{order.orderNumber}</small></td>
                                                <td>
                                                    <strong>{order.customer.firstName} {order.customer.lastName}</strong>
                                                    <small className="block">{order.customer.email}</small>
                                                </td>
                                                <td>{order.items.length} items</td>
                                                <td><strong>${order.totals.total.toFixed(2)}</strong></td>
                                                <td><span className={`status-pill ${order.status}`}>{order.status}</span></td>
                                                <td className="actions">
                                                    {order.status === 'pending' && (
                                                        <button className="btn-icon success" onClick={() => updateOrderStatus(order.id, 'preparing')} title="Start Preparing">
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    {order.status === 'preparing' && (
                                                        <button className="btn-icon success" onClick={() => updateOrderStatus(order.id, 'delivered')} title="Complete Order">
                                                            <ShoppingBag size={18} />
                                                        </button>
                                                    )}
                                                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                                        <button className="btn-icon error" onClick={() => updateOrderStatus(order.id, 'cancelled')} title="Cancel Order">
                                                            <XCircle size={18} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* RESERVATIONS VIEW */}
                    {activeTab === 'reservations' && (
                        <div className="admin-table-view">
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Date / Time</th>
                                            <th>Guest</th>
                                            <th>Party</th>
                                            <th>Status</th>
                                            <th>Manage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.length === 0 && <tr><td colSpan={5} style={{textAlign: 'center', padding: '4rem'}}>No reservations found.</td></tr>}
                                        {reservations.map(res => (
                                            <tr key={res.id}>
                                                <td>
                                                    <strong>{new Date(res.details.date).toLocaleDateString()}</strong>
                                                    <small className="block">{res.details.time}</small>
                                                </td>
                                                <td>
                                                    <strong>{res.contact.firstName} {res.contact.lastName}</strong>
                                                    <small className="block">{res.contact.phone}</small>
                                                </td>
                                                <td>{res.details.adults} Guests</td>
                                                <td><span className={`status-pill ${res.status}`}>{res.status}</span></td>
                                                <td className="actions">
                                                    {res.status === 'pending' && (
                                                        <button className="btn-icon success" onClick={() => updateResStatus(res.id, 'confirmed')}><CheckCircle size={18} /></button>
                                                    )}
                                                    {res.status !== 'cancelled' && (
                                                        <button className="btn-icon error" onClick={() => updateResStatus(res.id, 'cancelled')}><XCircle size={18} /></button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </main>
            {/* MENU MODAL */}
            {isMenuModalOpen && (
                <div className="admin-modal-overlay">
                    <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="modal-header">
                            <h2>{editingItem?.id ? 'Edit Dish' : 'Add New Dish'}</h2>
                            <button onClick={() => setIsMenuModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveMenu}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Dish Name</label>
                                    <input type="text" value={editingItem?.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input type="number" step="0.01" value={editingItem?.price || ''} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={editingItem?.category || 'mains'} onChange={e => setEditingItem({...editingItem, category: e.target.value as any})}>
                                        <option value="starters">Starters</option>
                                        <option value="mains">Mains</option>
                                        <option value="desserts">Desserts</option>
                                        <option value="drinks">Drinks</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input type="text" value={editingItem?.image || ''} onChange={e => setEditingItem({...editingItem, image: e.target.value})} placeholder="/images/food.jpg" required />
                                </div>
                                <div className="form-group full">
                                    <label>Description</label>
                                    <textarea value={editingItem?.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setIsMenuModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><Save size={18} /> Save Dish</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Admin;
