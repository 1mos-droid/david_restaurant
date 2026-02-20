// ========== ÉCLAT BISTRO BACKEND ==========
// Node.js/Express Server - Vercel Compatible

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Added missing fs import

const app = express();

// ========== VERCEL COMPATIBLE STORAGE ==========
// Note: Vercel functions are ephemeral. For production, use MongoDB or Supabase.
let orders = [];
let reservations = [];
let contacts = [];

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== STATIC FILES ==========
// Serve from root and specific folders
app.use(express.static(path.join(__dirname, '.')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/javascript', express.static(path.join(__dirname, 'javascript')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// ========== HELPER FUNCTIONS ==========
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const generateOrderNumber = () => {
    return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
};

const generateReservationId = () => {
    return 'RES-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
};

// ========== API ROUTES ==========

// ---- ORDERS API ----
app.get('/api/orders', (req, res) => res.json(orders));

app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    order ? res.json(order) : res.status(404).json({ error: 'Order not found' });
});

app.post('/api/orders', (req, res) => {
    try {
        const { customer, items, totals, orderType, paymentMethod, specialInstructions, time } = req.body;
        if (!customer?.email || !items?.length) return res.status(400).json({ error: 'Invalid order data' });

        const newOrder = {
            id: uuidv4(),
            orderNumber: generateOrderNumber(),
            customer: { ...customer, instructions: specialInstructions || '' },
            items: items.map(item => ({ ...item, subtotal: item.price * item.quantity })),
            totals,
            orderType: orderType || 'delivery',
            paymentMethod: paymentMethod || 'card',
            preferredTime: time || 'asap',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        orders.push(newOrder);
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// ---- RESERVATIONS API ----
app.post('/api/reservations', (req, res) => {
    try {
        const { adults, date, time, contact } = req.body;
        if (!adults || !date || !contact?.email) return res.status(400).json({ error: 'Missing info' });

        const newRes = {
            id: uuidv4(),
            reservationId: generateReservationId(),
            details: req.body,
            contact,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        reservations.push(newRes);
        res.status(201).json({ success: true, reservation: newRes });
    } catch (error) {
        res.status(500).json({ error: 'Reservation failed' });
    }
});

// ---- MENU API ----
app.get('/api/menu', (req, res) => {
    const menuItems = [
        { id: 1, name: 'Yellowfin Tuna Tartare', price: 24, category: 'starters', image: '/images/tuna.jpg' },
        { id: 5, name: 'Australian Wagyu Tenderloin', price: 68, category: 'mains', image: '/images/wagyu.jpg' }
        // ... (Add your other menu items here)
    ];
    const category = req.query.category;
    res.json(category && category !== 'all' ? menuItems.filter(i => i.category === category) : menuItems);
});

// ---- CUSTOMER DASHBOARD ----
app.get('/api/customer/dashboard', (req, res) => {
    const { email } = req.query;
    if (!email) return res.json({ user: { firstName: 'Guest' }, stats: {}, orders: [] });

    const customerOrders = orders.filter(o => o.customer?.email?.toLowerCase() === email.toLowerCase());
    const customerReservations = reservations.filter(r => r.contact?.email?.toLowerCase() === email.toLowerCase());

    res.json({
        user: { 
            firstName: customerOrders[0]?.customer?.firstName || 'User',
            email,
            avatar: 'CU'
        },
        stats: {
            totalOrders: customerOrders.length,
            totalSpent: customerOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0)
        },
        orders: customerOrders.slice(-5).reverse(),
        reservations: customerReservations
    });
});

// ========== PAGE ROUTES ==========
const pages = ['/', '/menu', '/order', '/dashboard', '/admin'];
pages.forEach(route => {
    app.get(route, (req, res) => {
        const fileName = route === '/' ? 'index.html' : `${route.substring(1)}.html`;
        res.sendFile(path.join(__dirname, fileName));
    });
});

// Catch-all
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;