# Éclat Bistro - Modern Fine Dining Experience

Éclat Bistro is a sophisticated, full-stack restaurant website designed for a premium dining experience. It features a dynamic menu, real-time online ordering, a reservation system, and a comprehensive administrative dashboard for restaurant management.

## 🍽️ Key Features

### For Customers
- **Elegant Homepage**: A visually stunning introduction to the bistro's story and culinary philosophy.
- **Dynamic Menu**: Browsable menu categories (Starters, Mains, Desserts, Drinks) synced directly from the backend.
- **Online Ordering**: A seamless shopping cart experience with tax calculation and checkout.
- **Table Reservations**: Real-time booking system with guest count, area preference, and special requests.
- **Personal Dashboard**: Customers can track their order history, upcoming reservations, and loyalty points.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.

### For Administrators
- **Executive Dashboard**: Real-time overview of daily revenue, total orders, and active reservations.
- **Order Management**: Track and update order statuses from "Pending" to "Delivered".
- **Reservation Tracking**: Manage table assignments and guest lists.
- **Live Activity Feed**: Instant notifications for new orders, messages, and bookings.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Variables), JavaScript (ES6+), Font Awesome, Google Fonts.
- **Backend**: Node.js, Express.js.
- **Data Storage**: JSON-based persistent storage (File System).
- **Communication**: RESTful API.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project files.**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   *For development with auto-reload:*
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - **Main Website**: [http://localhost:3000](http://localhost:3000)
   - **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📁 Project Structure

```text
├── server.js           # Express server & REST API
├── admin.html          # Administrative dashboard
├── index.html          # Main homepage
├── menu.html           # Full menu view
├── order.html          # Online ordering system
├── dashboard.html      # Customer account page
├── data/               # JSON data storage (Orders, Reservations, Contacts)
├── javascript/         # Frontend logic and API integration
├── styles/             # Modular CSS stylesheets
└── images/             # Optimized culinary assets
```

## 🔌 API Endpoints

- `GET /api/menu`: Retrieve all menu items.
- `POST /api/orders`: Place a new order.
- `GET /api/orders`: Admin access to all orders.
- `POST /api/reservations`: Submit a booking request.
- `GET /api/stats`: Retrieve dashboard analytics.
- `GET /api/customer/dashboard`: Get personalized data for a specific customer.

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Designed & Developed by David Peprah*
