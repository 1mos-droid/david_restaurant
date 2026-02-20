import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock DB
let orders = [];
let reservations = [];

// Initial Menu Data
let menuItems = [
    {
        id: 1,
        name: 'Yellowfin Tuna Tartare',
        description: 'Fresh yellowfin tuna, avocado, cucumber, yuzu kosho, crispy shallots.',
        price: 24,
        category: 'starters',
        image: '/images/sahal-hameed-Nq9KlQTTEbQ-unsplash.jpg',
        badge: "Chef's Signature"
    },
    {
        id: 2,
        name: 'Burrata & Heirloom Tomatoes',
        description: 'Creamy burrata, heritage tomatoes, basil oil, aged balsamic reduction.',
        price: 22,
        category: 'starters',
        image: '/images/kobby-mendez-q54Oxq44MZs-unsplash.jpg'
    },
    {
        id: 3,
        name: 'French Onion Soup',
        description: 'Classic caramelized onion soup with Gruyère cheese, croutons, and thyme.',
        price: 16,
        category: 'starters',
        image: '/images/food-935391_1280.jpg'
    },
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
        image: '/images/kobby-mendez-idTwDKt2j2o-unsplash.jpg'
    },
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
        id: 14,
        name: 'Éclat Signature Martini',
        description: 'Grey Goose vodka, Lillet Blanc, orange bitters.',
        price: 18,
        category: 'drinks',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        badge: 'Signature'
    }
];

// Static files (from public)
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/menu', (req, res) => {
    const category = req.query.category;
    if (category && category !== 'all') {
        res.json(menuItems.filter(item => item.category === category));
    } else {
        res.json(menuItems);
    }
});

// ---- ADMIN API (HIGH PRIVILEGE) ----

// Menu Management
app.post('/api/admin/menu', (req, res) => {
    const newItem = { id: Date.now(), ...req.body };
    menuItems.push(newItem);
    res.status(201).json(newItem);
});

app.put('/api/admin/menu/:id', (req, res) => {
    const index = menuItems.findIndex(item => item.id === parseInt(req.params.id));
    if (index !== -1) {
        menuItems[index] = { ...menuItems[index], ...req.body };
        res.json(menuItems[index]);
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

app.delete('/api/admin/menu/:id', (req, res) => {
    menuItems = menuItems.filter(item => item.id !== parseInt(req.params.id));
    res.status(204).send();
});

// Reservation Management
app.get('/api/admin/reservations', (req, res) => res.json(reservations));

app.patch('/api/admin/reservations/:id/status', (req, res) => {
    const resv = reservations.find(r => r.id === req.params.id);
    if (resv) {
        resv.status = req.body.status;
        res.json(resv);
    } else {
        res.status(404).json({ error: 'Reservation not found' });
    }
});

// Analytics
app.get('/api/admin/stats', (req, res) => {
    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const todayReservations = reservations.filter(r => {
        const today = new Date().toISOString().split('T')[0];
        return r.details.date === today;
    }).length;
    
    // Find most popular category
    const categoryCount = {};
    orders.forEach(o => o.items?.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + item.quantity;
    }));
    const popularCategory = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b, 'None');

    res.json({
        totalRevenue,
        totalOrders: orders.length,
        totalReservations: reservations.length,
        pendingOrders,
        todayReservations,
        popularCategory
    });
});

// ---- CUSTOMER DASHBOARD ----
app.get('/api/customer/dashboard', (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.json({
            user: { firstName: 'Guest', lastName: 'User', membershipTier: 'Bronze' },
            stats: { totalOrders: 0, totalReservations: 0, loyaltyPoints: 0, totalSpent: 0 },
            activeOrders: [],
            pastOrders: [],
            reservations: []
        });
    }

    const customerOrders = orders.filter(o => o.customer?.email?.toLowerCase() === email.toLowerCase());
    const customerReservations = reservations.filter(r => r.contact?.email?.toLowerCase() === email.toLowerCase());
    
    const activeOrders = customerOrders.filter(o => ['pending', 'preparing'].includes(o.status));
    const pastOrders = customerOrders.filter(o => !['pending', 'preparing'].includes(o.status));
    
    const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    const loyaltyPoints = Math.floor(totalSpent * 10);

    // Calculate Tier and Next Perk
    let membershipTier = 'Bronze';
    let nextPerk = 'Free Coffee on Sundays';
    let pointsToNext = 1000 - loyaltyPoints;

    if (loyaltyPoints >= 5000) {
        membershipTier = 'Platinum';
        nextPerk = 'Private Chef Experience';
        pointsToNext = 0;
    } else if (loyaltyPoints >= 2500) {
        membershipTier = 'Gold';
        nextPerk = 'Exclusive Wine Tasting Access';
        pointsToNext = 5000 - loyaltyPoints;
    } else if (loyaltyPoints >= 1000) {
        membershipTier = 'Silver';
        nextPerk = 'Priority Weekend Booking';
        pointsToNext = 2500 - loyaltyPoints;
    }

    res.json({
        user: {
            firstName: customerOrders[0]?.customer?.firstName || 'Valued',
            lastName: customerOrders[0]?.customer?.lastName || 'Guest',
            email,
            membershipTier,
            nextPerk,
            pointsToNext: Math.max(0, pointsToNext),
            avatar: (customerOrders[0]?.customer?.firstName?.[0] || 'G') + (customerOrders[0]?.customer?.lastName?.[0] || 'U')
        },
        stats: {
            totalOrders: customerOrders.length,
            activeOrdersCount: activeOrders.length,
            totalReservations: customerReservations.length,
            loyaltyPoints,
            totalSpent
        },
        activeOrders,
        pastOrders: pastOrders.slice(-5).reverse(),
        reservations: customerReservations,
        recentActivity: [
            { type: 'login', message: 'Account accessed', date: new Date().toISOString() }
        ]
    });
});

app.post('/api/orders', (req, res) => {
    const newOrder = {
        id: uuidv4(),
        orderNumber: `ORD-${Date.now()}`,
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    res.status(201).json({ success: true, order: newOrder });
});

// Serve Vite build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
};

startServer(PORT);
