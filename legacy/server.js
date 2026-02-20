// ========== ÉCLAT BISTRO BACKEND ==========
// Node.js/Express Server - Vercel Compatible

const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();

// ========== VERCEL COMPATIBLE STORAGE ==========
// Note: Data is stored in memory. For persistence, connect to a database (MongoDB, Postgres, etc.)
let orders = [];
let reservations = [];
let contacts = [];

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== STATIC FILES ==========
// Explicitly serve static folders
app.use(express.static(path.join(process.cwd())));
app.use('/styles', express.static(path.join(process.cwd(), 'styles')));
app.use('/javascript', express.static(path.join(process.cwd(), 'javascript')));
app.use('/images', express.static(path.join(process.cwd(), 'images')));
app.use('/videos', express.static(path.join(process.cwd(), 'videos')));
app.use('/payment-images', express.static(path.join(process.cwd(), 'payment-images')));

// ========== HELPER FUNCTIONS ==========
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
        
        // Basic validation
        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ error: 'Invalid order data' });
        }

        const newOrder = {
            id: uuidv4(),
            orderNumber: generateOrderNumber(),
            customer: {
                ...customer,
                instructions: specialInstructions || ''
            },
            items: items.map(item => ({
                ...item,
                subtotal: (item.price || 0) * (item.quantity || 1)
            })),
            totals: totals || { total: 0 },
            orderType: orderType || 'delivery',
            paymentMethod: paymentMethod || 'card',
            preferredTime: time || 'asap',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        orders.push(newOrder);
        console.log('New Order:', newOrder.orderNumber);
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// ---- RESERVATIONS API ----
app.get('/api/reservations', (req, res) => res.json(reservations));

app.post('/api/reservations', (req, res) => {
    try {
        const { adults, date, time, contact } = req.body;
        if (!adults || !date || !contact?.email) {
            return res.status(400).json({ error: 'Missing required reservation info' });
        }

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

// ---- CONTACT API ----
app.post('/api/contacts', (req, res) => {
    try {
        const newContact = {
            id: uuidv4(),
            ...req.body,
            status: 'new',
            createdAt: new Date().toISOString()
        };
        contacts.push(newContact);
        res.status(201).json({ success: true, contact: newContact });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// ---- MENU API ----
app.get('/api/menu', (req, res) => {
    const menuItems = [
        // Starters
        {
            id: 1,
            name: 'Yellowfin Tuna Tartare',
            description: 'Fresh yellowfin tuna, avocado, cucumber, yuzu kosho, crispy shallots.',
            price: 24,
            category: 'starters',
            image: '/images/sahal-hameed-Nq9KlQTTEbQ-unsplash.jpg',
            badge: 'Chef\'s Signature'
        },
        {
            id: 2,
            name: 'Burrata & Heirloom Tomatoes',
            description: 'Creamy burrata, heritage tomatoes, basil oil, aged balsamic reduction.',
            price: 22,
            category: 'starters',
            image: '/images/kobby-mendez-q54Oxq44MZs-unsplash.jpg',
            badge: null
        },
        {
            id: 3,
            name: 'French Onion Soup',
            description: 'Classic caramelized onion soup with Gruyère cheese, croutons, and thyme.',
            price: 16,
            category: 'starters',
            image: '/images/food-935391_1280.jpg',
            badge: null
        },
        {
            id: 4,
            name: 'Beef Carpaccio',
            description: 'Thinly sliced raw beef, arugula, capers, Parmesan shavings.',
            price: 26,
            category: 'starters',
            image: '/images/dani-ZLqxSzvVr7I-unsplash.jpg',
            badge: null
        },
        // Mains
        {
            id: 5,
            name: 'Australian Wagyu Tenderloin',
            description: '8oz grass-fed wagyu, truffle mashed potatoes, red wine reduction.',
            price: 68,
            category: 'mains',
            image: '/images/dani-ZLqxSzvVr7I-unsplash.jpg',
            badge: 'Most Popular'
        },
        {
            id: 6,
            name: 'Atlantic Halibut',
            description: 'Pan-seared halibut, saffron fennel puree, lemon beurre blanc.',
            price: 42,
            category: 'mains',
            image: '/images/kobby-mendez-idTwDKt2j2o-unsplash.jpg',
            badge: null
        },
        {
            id: 7,
            name: 'Duck Confit',
            description: 'Slow-cooked duck leg, cherry gastrique, roasted root vegetables.',
            price: 38,
            category: 'mains',
            image: '/images/eiliv-aceron-ZuIDLSz3XLg-unsplash.jpg',
            badge: null
        },
        {
            id: 8,
            name: 'Lobster Risotto',
            description: 'Butter-poached lobster tail, saffron risotto, green peas.',
            price: 52,
            category: 'mains',
            image: '/images/pexels-guilhermealmeida-1858175.jpg',
            badge: 'Chef\'s Signature'
        },
        // Desserts
        {
            id: 10,
            name: 'Grand Marnier Soufflé',
            description: 'Light orange soufflé with Grand Marnier, served warm.',
            price: 18,
            category: 'desserts',
            image: '/images/food-935391_1280.jpg',
            badge: 'Must Order Ahead'
        },
        {
            id: 11,
            name: 'Chocolate Lava Cake',
            description: 'Warm chocolate cake with molten center, raspberry coulis.',
            price: 16,
            category: 'desserts',
            image: '/images/pexels-alipazani-2787341.jpg',
            badge: null
        },
        // Drinks
        {
            id: 14,
            name: 'Éclat Signature Martini',
            description: 'Grey Goose vodka, Lillet Blanc, orange bitters.',
            price: 18,
            category: 'drinks',
            image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            badge: 'Signature'
        },
        {
            id: 15,
            name: 'Classic Old Fashioned',
            description: 'Bourbon, angostura bitters, orange peel.',
            price: 16,
            category: 'drinks',
            image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            badge: null
        }
    ];

    const category = req.query.category;
    if (category && category !== 'all') {
        res.json(menuItems.filter(item => item.category === category));
    } else {
        res.json(menuItems);
    }
});

// ---- CUSTOMER DASHBOARD ----
app.get('/api/customer/dashboard', (req, res) => {
    const { email } = req.query;
    
    // Default demo data if no email
    if (!email) {
        return res.json({
            user: { firstName: 'Guest', lastName: 'User', membershipTier: 'Bronze' },
            stats: { totalOrders: 0, totalReservations: 0, loyaltyPoints: 0, totalSpent: 0 },
            orders: [],
            reservations: []
        });
    }

    // Filter in-memory data
    const customerOrders = orders.filter(o => o.customer?.email?.toLowerCase() === email.toLowerCase());
    const customerReservations = reservations.filter(r => r.contact?.email?.toLowerCase() === email.toLowerCase());
    const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    const loyaltyPoints = Math.floor(totalSpent * 10);

    // Calculate Tier
    let membershipTier = 'Bronze';
    if (loyaltyPoints >= 5000) membershipTier = 'Platinum';
    else if (loyaltyPoints >= 2500) membershipTier = 'Gold';
    else if (loyaltyPoints >= 1000) membershipTier = 'Silver';

    res.json({
        user: {
            firstName: customerOrders[0]?.customer?.firstName || 'Valued',
            lastName: customerOrders[0]?.customer?.lastName || 'Guest',
            email,
            membershipTier,
            avatar: (customerOrders[0]?.customer?.firstName?.[0] || 'G') + (customerOrders[0]?.customer?.lastName?.[0] || 'U')
        },
        stats: {
            totalOrders: customerOrders.length,
            totalReservations: customerReservations.length,
            loyaltyPoints,
            totalSpent
        },
        orders: customerOrders.slice(-5).reverse(),
        reservations: customerReservations,
        recentActivity: [
            { type: 'login', message: 'Account accessed', date: new Date().toISOString() }
        ]
    });
});

// ========== PAGE ROUTES ==========
// Handle explicit HTML requests
const pages = ['/', '/menu', '/order', '/dashboard', '/admin'];

pages.forEach(route => {
    app.get(route, (req, res) => {
        const pageName = route === '/' ? 'index.html' : `${route.substring(1)}.html`;
        res.sendFile(path.join(process.cwd(), pageName));
    });
});

// Catch-all for SPA-like behavior (return index.html or 404 for assets)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.includes('.')) {
        // If it looks like an API call or a file extension request that wasn't found by static middleware
        return res.status(404).send('Not Found');
    }
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
// Only listen if run directly (not via Vercel import)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
