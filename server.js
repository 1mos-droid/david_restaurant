// ========== ÉCLAT BISTRO BACKEND ==========
// Node.js/Express Server - Vercel Compatible

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ========== VERCEL COMPATIBLE STORAGE ==========
// Use in-memory storage (Vercel has ephemeral filesystem)
let orders = [];
let reservations = [];
let contacts = [];

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== STATIC FILES ==========
app.use(express.static(path.join(__dirname, '.')));

// ========== API ROUTES ==========

// Simple UUID generator
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

// ---- ORDERS API ----

// Get all orders (admin)
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Create new order
app.post('/api/orders', (req, res) => {
    try {
        const { customer, items, totals, orderType, paymentMethod, specialInstructions, time } = req.body;

        // Validation
        if (!customer || !customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
            return res.status(400).json({ error: 'Missing required customer information' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }
        
        const newOrder = {
            id: uuidv4(),
            orderNumber: generateOrderNumber(),
            customer: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address || null,
                instructions: specialInstructions || ''
            },
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            })),
            totals: {
                subtotal: totals.subtotal,
                deliveryFee: totals.deliveryFee,
                tax: totals.tax,
                total: totals.total
            },
            orderType: orderType || 'delivery',
            paymentMethod: paymentMethod || 'card',
            preferredTime: time || 'asap',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        orders.push(newOrder);

        // Log order (in production, send email notifications here)
        console.log('New order received:', newOrder.orderNumber);

        res.status(201).json({
            success: true,
            order: newOrder,
            message: 'Order placed successfully'
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const orderIndex = orders.findIndex(o => o.id === req.params.id);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();

        res.json({
            success: true,
            order: orders[orderIndex],
            message: 'Order status updated'
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
    try {
        const orderIndex = orders.findIndex(o => o.id === req.params.id);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const deletedOrder = orders.splice(orderIndex, 1)[0];

        res.json({
            success: true,
            message: 'Order deleted',
            order: deletedOrder
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// ---- RESERVATIONS API ----

// Get all reservations
app.get('/api/reservations', (req, res) => {
    res.json(reservations);
});

// Get single reservation
app.get('/api/reservations/:id', (req, res) => {
    const reservation = reservations.find(r => r.id === req.params.id);
    if (reservation) {
        res.json(reservation);
    } else {
        res.status(404).json({ error: 'Reservation not found' });
    }
});

// Create new reservation
app.post('/api/reservations', (req, res) => {
    try {
        const { adults, children, date, time, area, comment, contact } = req.body;

        // Validation
        if (!adults || !date || !time) {
            return res.status(400).json({ error: 'Missing required reservation information' });
        }

        if (!contact || !contact.firstName || !contact.lastName || !contact.email || !contact.phone) {
            return res.status(400).json({ error: 'Missing contact information' });
        }

        const newReservation = {
            id: uuidv4(),
            reservationId: generateReservationId(),
            details: {
                adults: parseInt(adults) || 1,
                children: parseInt(children) || 0,
                date: date,
                time: time,
                area: area || 'Indoor',
                comment: comment || ''
            },
            contact: {
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                phone: contact.phone
            },
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        reservations.push(newReservation);

        // Log reservation
        console.log('New reservation received:', newReservation.reservationId);

        res.status(201).json({
            success: true,
            reservation: newReservation,
            message: 'Reservation request submitted successfully'
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

// Update reservation status
app.patch('/api/reservations/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const reservationIndex = reservations.findIndex(r => r.id === req.params.id);
        
        if (reservationIndex === -1) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        reservations[reservationIndex].status = status;
        reservations[reservationIndex].updatedAt = new Date().toISOString();

        res.json({
            success: true,
            reservation: reservations[reservationIndex],
            message: 'Reservation status updated'
        });
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({ error: 'Failed to update reservation' });
    }
});

// Delete reservation
app.delete('/api/reservations/:id', (req, res) => {
    try {
        const reservationIndex = reservations.findIndex(r => r.id === req.params.id);
        
        if (reservationIndex === -1) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        const deletedReservation = reservations.splice(reservationIndex, 1)[0];

        res.json({
            success: true,
            message: 'Reservation deleted',
            reservation: deletedReservation
        });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ error: 'Failed to delete reservation' });
    }
});

// ---- CONTACT API ----

// Get all contact messages
app.get('/api/contacts', (req, res) => {
    res.json(contacts);
});

// Submit contact form
app.post('/api/contacts', (req, res) => {
    try {
        const { firstName, lastName, email, phone, message } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ error: 'Missing required information' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        const newContact = {
            id: uuidv4(),
            name: `${firstName} ${lastName}`,
            email: email,
            phone: phone || '',
            message: message,
            status: 'new',
            createdAt: new Date().toISOString()
        };

        contacts.push(newContact);

        console.log('New contact message received:', newContact.id);

        res.status(201).json({
            success: true,
            contact: newContact,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// ---- MENU API ----

// Get menu items
app.get('/api/menu', (req, res) => {
    const menuItems = [
        // Starters
        {
            id: 1,
            name: 'Yellowfin Tuna Tartare',
            description: 'Fresh yellowfin tuna, avocado, cucumber, yuzu kosho, crispy shallots, served with sesame crackers.',
            price: 24,
            category: 'starters',
            image: '/images/sahal-hameed-Nq9KlQTTEbQ-unsplash.jpg',
            badge: 'Chef\'s Signature'
        },
        {
            id: 2,
            name: 'Burrata & Heirloom Tomatoes',
            description: 'Creamy burrata, heritage tomatoes, basil oil, aged balsamic reduction, sourdough crostini.',
            price: 22,
            category: 'starters',
            image: '/images/kobby-mendez-q54Oxq44MZs-unsplash.jpg',
            badge: null
        },
        {
            id: 3,
            name: 'French Onion Soup',
            description: 'Classic caramelized onion soup with Gruyère cheese, croutons, and fresh thyme.',
            price: 16,
            category: 'starters',
            image: '/images/food-935391_1280.jpg',
            badge: null
        },
        {
            id: 4,
            name: 'Beef Carpaccio',
            description: 'Thinly sliced raw beef, arugula, capers, Parmesan shavings, lemon olive oil dressing.',
            price: 26,
            category: 'starters',
            image: '/images/dani-ZLqxSzvVr7I-unsplash.jpg',
            badge: null
        },
        // Main Courses
        {
            id: 5,
            name: 'Australian Wagyu Tenderloin',
            description: '8oz grass-fed wagyu, truffle mashed potatoes, glazed baby vegetables, red wine reduction.',
            price: 68,
            category: 'mains',
            image: '/images/dani-ZLqxSzvVr7I-unsplash.jpg',
            badge: 'Most Popular'
        },
        {
            id: 6,
            name: 'Atlantic Halibut',
            description: 'Pan-seared halibut, saffron fennel puree, confit tomatoes, lemon beurre blanc, micro herbs.',
            price: 42,
            category: 'mains',
            image: '/images/kobby-mendez-idTwDKt2j2o-unsplash.jpg',
            badge: null
        },
        {
            id: 7,
            name: 'Duck Confit',
            description: 'Slow-cooked duck leg, cherry gastrique, roasted root vegetables, potato gratin.',
            price: 38,
            category: 'mains',
            image: '/images/eiliv-aceron-ZuIDLSz3XLg-unsplash.jpg',
            badge: null
        },
        {
            id: 8,
            name: 'Lobster Risotto',
            description: 'Butter-poached lobster tail, saffron risotto, green peas, finished with fresh herbs.',
            price: 52,
            category: 'mains',
            image: '/images/pexels-guilhermealmeida-1858175.jpg',
            badge: 'Chef\'s Signature'
        },
        {
            id: 9,
            name: 'Herb-Crusted Lamb Rack',
            description: 'Roasted lamb rack, mint pesto, ratatouille, lamb jus reduction.',
            price: 56,
            category: 'mains',
            image: '/images/rayul-_M6gy9oHgII-unsplash.jpg',
            badge: null
        },
        // Desserts
        {
            id: 10,
            name: 'Grand Marnier Soufflé',
            description: 'Light orange soufflé with Grand Marnier, served warm with vanilla bean ice cream.',
            price: 18,
            category: 'desserts',
            image: '/images/food-935391_1280.jpg',
            badge: 'Must Order Ahead'
        },
        {
            id: 11,
            name: 'Chocolate Lava Cake',
            description: 'Warm chocolate cake with molten center, raspberry coulis, whipped cream.',
            price: 16,
            category: 'desserts',
            image: '/images/pexels-alipazani-2787341.jpg',
            badge: null
        },
        {
            id: 12,
            name: 'Crème Brûlée',
            description: 'Classic vanilla custard with caramelized sugar crust, fresh berries.',
            price: 14,
            category: 'desserts',
            image: '/images/food-935391_1280.jpg',
            badge: null
        },
        {
            id: 13,
            name: 'Tiramisu',
            description: 'Espresso-soaked ladyfingers, mascarpone cream, cocoa powder, coffee liqueur.',
            price: 15,
            category: 'desserts',
            image: '/images/pexels-guilhermealmeida-1858175.jpg',
            badge: null
        },
        // Drinks
        {
            id: 14,
            name: 'Éclat Signature Martini',
            description: 'Grey Goose vodka, Lillet Blanc, orange bitters, expressed lemon peel.',
            price: 18,
            category: 'drinks',
            image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            badge: 'Signature'
        },
        {
            id: 15,
            name: 'Classic Old Fashioned',
            description: 'Bourbon, angostura bitters, orange peel, maraschino cherry.',
            price: 16,
            category: 'drinks',
            image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            badge: null
        },
        {
            id: 16,
            name: 'Sparkling Water',
            description: 'San Pellegrino 750ml bottle.',
            price: 8,
            category: 'drinks',
            image: '/images/products-popular-global-soft-drink-brands-poznan-pol-oct-344374883.jpg',
            badge: null
        },
        {
            id: 17,
            name: 'Fresh Lemonade',
            description: 'House-made lemonade with fresh mint and lemon wheels.',
            price: 6,
            category: 'drinks',
            image: '/images/Alcoholic-Drink-1.jpg',
            badge: null
        }
    ];

    const category = req.query.category;
    if (category && category !== 'all') {
        const filtered = menuItems.filter(item => item.category === category);
        res.json(filtered);
    } else {
        res.json(menuItems);
    }
});

// ---- STATS API ----

// Get dashboard statistics
app.get('/api/stats', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const stats = {
        orders: {
            total: orders.length,
            today: orders.filter(o => o.createdAt && o.createdAt.startsWith(today)).length,
            pending: orders.filter(o => o.status === 'pending').length,
            totalRevenue: orders.reduce((sum, o) => sum + (o.totals?.total || 0), 0)
        },
        reservations: {
            total: reservations.length,
            today: reservations.filter(r => r.details && r.details.date === today).length,
            pending: reservations.filter(r => r.status === 'pending').length
        },
        messages: {
            total: contacts.length,
            unread: contacts.filter(c => c.status === 'new').length
        }
    };

    res.json(stats);
});

// ========== CUSTOMER API ==========

// Get customer dashboard data (orders, reservations, loyalty)
app.get('/api/customer/dashboard', (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        // Return demo data for non-logged in users
        return res.json({
            user: {
                firstName: 'Guest',
                lastName: 'User',
                email: '',
                membershipTier: 'Bronze',
                avatar: 'GU'
            },
            stats: {
                totalOrders: 0,
                totalReservations: 0,
                loyaltyPoints: 0,
                totalSpent: 0
            },
            orders: [],
            reservations: [],
            favorites: [],
            recentActivity: []
        });
    }
    
    const customerOrders = orders.filter(o => 
        o.customer && o.customer.email && o.customer.email.toLowerCase() === email.toLowerCase()
    );
    
    // Filter reservations by customer email
    const customerReservations = reservations.filter(r => 
        r.contact && r.contact.email && r.contact.email.toLowerCase() === email.toLowerCase()
    );
    
    // Calculate stats
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    
    // Get upcoming reservations (future dates)
    const today = new Date().toISOString().split('T')[0];
    const upcomingReservations = customerReservations
        .filter(r => r.details && r.details.date >= today && r.status !== 'cancelled')
        .sort((a, b) => new Date(a.details.date) - new Date(b.details.date));
    
    // Calculate loyalty points (10 points per dollar spent)
    const loyaltyPoints = Math.floor(totalSpent * 10);
    
    // Determine tier based on points
    let membershipTier = 'Bronze';
    if (loyaltyPoints >= 5000) membershipTier = 'Platinum';
    else if (loyaltyPoints >= 2500) membershipTier = 'Gold';
    else if (loyaltyPoints >= 1000) membershipTier = 'Silver';
    
    // Generate avatar initials
    const firstInitial = customerOrders[0]?.customer?.firstName?.charAt(0) || 'G';
    const lastInitial = customerOrders[0]?.customer?.lastName?.charAt(0) || 'U';
    
    res.json({
        user: {
            firstName: customerOrders[0]?.customer?.firstName || 'Guest',
            lastName: customerOrders[0]?.customer?.lastName || 'User',
            email: email,
            membershipTier: membershipTier,
            avatar: (firstInitial + lastInitial).toUpperCase()
        },
        stats: {
            totalOrders: totalOrders,
            totalReservations: upcomingReservations.length,
            loyaltyPoints: loyaltyPoints,
            totalSpent: totalSpent
        },
        orders: customerOrders.slice(-5).reverse(),
        reservations: upcomingReservations.slice(0, 3),
        favorites: [],
        recentActivity: [
            { type: 'order', message: 'Order placed', date: new Date().toISOString(), points: 0 }
        ]
    });
});

// Get customer orders by email
app.get('/api/customer/orders', (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({ error: 'Email parameter required' });
    }
    
    const customerOrders = orders.filter(o => 
        o.customer && o.customer.email && o.customer.email.toLowerCase() === email.toLowerCase()
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(customerOrders);
});

// Get customer reservations by email
app.get('/api/customer/reservations', (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({ error: 'Email parameter required' });
    }
    
    const customerReservations = reservations.filter(r => 
        r.contact && r.contact.email && r.contact.email.toLowerCase() === email.toLowerCase()
    ).sort((a, b) => new Date(a.details?.date || 0) - new Date(b.details?.date || 0));
    
    res.json(customerReservations);
});

// Save customer favorites
app.post('/api/customer/favorites', (req, res) => {
    const { email, itemId, menuItem } = req.body;
    
    if (!email || !itemId) {
        return res.status(400).json({ error: 'Email and itemId required' });
    }
    
    console.log(`Favorite saved: ${email} - Item ${itemId}`);
    
    res.json({
        success: true,
        message: 'Favorite saved',
        favorite: { email, itemId, menuItem }
    });
});

// ========== FRONTEND ROUTES ==========

// Explicit routes for main pages
const pages = [
    { route: '/', file: 'index.html' },
    { route: '/index', file: 'index.html' },
    { route: '/menu', file: 'menu.html' },
    { route: '/order', file: 'order.html' },
    { route: '/dashboard', file: 'dashboard.html' },
    { route: '/admin', file: 'admin.html' }
];

pages.forEach(page => {
    app.get(page.route, (req, res) => {
        res.sendFile(path.join(__dirname, page.file));
    });
    // Also support .html extension explicitly
    if (page.route !== '/') {
        app.get(`${page.route}.html`, (req, res) => {
            res.sendFile(path.join(__dirname, page.file));
        });
    }
});

// ========== SERVE FRONTEND (CATCH-ALL) ==========
app.get('*', (req, res) => {
    const filePath = req.path;
    
    // Check if it's an API route that didn't match anything
    if (filePath.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For all other routes, serve index.html
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== EXPORT APP FOR VERCEL ==========
module.exports = app;

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Éclat Bistro Server running on http://localhost:${PORT}`);
    });
}