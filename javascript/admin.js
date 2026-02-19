/**
 * Admin Dashboard JavaScript
 * Éclat Bistro Restaurant Management
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initNavigation();
    initModals();
    initFilters();
    initTimeUpdates();
    loadDashboardData();
    
    // Set up auto-refresh
    setInterval(loadDashboardData, 30000);
});

/**
 * Fetch and load all dashboard data
 */
async function loadDashboardData() {
    try {
        const [statsRes, ordersRes, reservationsRes, contactsRes] = await Promise.all([
            fetch('/api/stats'),
            fetch('/api/orders'),
            fetch('/api/reservations'),
            fetch('/api/contacts')
        ]);
        
        const stats = await statsRes.json();
        const orders = await ordersRes.json();
        const reservations = await reservationsRes.json();
        const contacts = await contactsRes.json();
        
        updateStatsUI(stats);
        updateOrdersUI(orders);
        updateReservationsUI(reservations);
        updateActivitiesUI(orders, reservations, contacts);
        
        console.log('Admin dashboard data loaded successfully');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Update Statistics UI
 */
function updateStatsUI(stats) {
    const todayRevenueEl = document.getElementById('todayRevenue');
    const todayOrdersEl = document.getElementById('todayOrders');
    const todayReservationsEl = document.getElementById('todayReservations');
    const totalGuestsEl = document.getElementById('totalGuests');

    if (todayRevenueEl) todayRevenueEl.textContent = formatCurrency(stats.orders.totalRevenue);
    if (todayOrdersEl) todayOrdersEl.textContent = stats.orders.total;
    if (todayReservationsEl) todayReservationsEl.textContent = stats.reservations.total;
    if (totalGuestsEl) totalGuestsEl.textContent = stats.messages.total; // Using messages as placeholder for 'total interactions'
}

/**
 * Update Orders Table
 */
function updateOrdersUI(orders) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (!ordersTableBody) return;

    if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No orders found</td></tr>';
        return;
    }

    ordersTableBody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>#${order.orderNumber.split('-')[1] || order.orderNumber}</strong></td>
            <td>
                <div class="customer-cell">
                    <div class="customer-avatar">${order.customer.firstName[0]}${order.customer.lastName[0]}</div>
                    <span>${order.customer.firstName} ${order.customer.lastName}</span>
                </div>
            </td>
            <td><span class="type-badge ${order.orderType}">${order.orderType}</span></td>
            <td>${order.items.length} items</td>
            <td><strong>${formatCurrency(order.totals.total)}</strong></td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>${formatRelativeTime(new Date(order.createdAt))}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" title="View Details" onclick="viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" title="Update Status" onclick="updateOrderStatus('${order.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Update Reservations UI
 */
function updateReservationsUI(reservations) {
    // Current admin.html uses a grid for time slots. 
    // For now, we'll just log or update a list if we add one.
    console.log('Reservations updated:', reservations.length);
}

/**
 * Update Recent Activity List
 */
function updateActivitiesUI(orders, reservations, contacts) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    const activities = [];

    // Process orders
    orders.slice(-3).forEach(order => {
        activities.push({
            type: 'new-order',
            icon: 'fas fa-shopping-bag',
            title: `New Order #${order.orderNumber.split('-')[1] || order.orderNumber}`,
            desc: `${order.customer.firstName} ${order.customer.lastName} - ${formatCurrency(order.totals.total)}`,
            time: new Date(order.createdAt),
            class: 'new-order'
        });
    });

    // Process reservations
    reservations.slice(-3).forEach(res => {
        activities.push({
            type: 'reservation',
            icon: 'fas fa-calendar-plus',
            title: 'New Reservation',
            desc: `${res.contact.firstName} ${res.contact.lastName} - ${res.details.adults} guests`,
            time: new Date(res.createdAt),
            class: 'reservation'
        });
    });

    // Process contacts
    contacts.slice(-3).forEach(contact => {
        activities.push({
            type: 'review', // Using review icon for messages
            icon: 'fas fa-envelope',
            title: 'New Message',
            desc: `${contact.name}: ${contact.message.substring(0, 30)}...`,
            time: new Date(contact.createdAt),
            class: 'review'
        });
    });

    // Sort by time descending
    activities.sort((a, b) => b.time - a.time);

    activityList.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.class}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <span class="activity-title">${activity.title}</span>
                <span class="activity-desc">${activity.desc}</span>
                <span class="activity-time">${formatRelativeTime(activity.time)}</span>
            </div>
        </div>
    `).join('') || '<p style="text-align:center; padding: 20px;">No recent activity</p>';
}

/**
 * Initialize sidebar toggle
 */
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    const main = document.querySelector('.admin-main');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            sidebar.classList.toggle('collapsed');
            if (main) main.classList.toggle('expanded');
        });
    }
}

/**
 * Initialize sidebar navigation
 */
function initNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');

    sidebarLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');

            // Update active link
            sidebarLinks.forEach(function(l) {
                l.classList.remove('active');
            });
            this.classList.add('active');

            // Show corresponding section
            const sections = document.querySelectorAll('.admin-section');
            sections.forEach(function(section) {
                section.classList.remove('active');
            });

            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

/**
 * Initialize modal functionality
 */
function initModals() {
    // Close modal on overlay click
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    modalOverlays.forEach(function(overlay) {
        overlay.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Close modal on X button click
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
}

/**
 * Initialize table filters
 */
function initFilters() {
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    const orderTypeFilter = document.getElementById('orderTypeFilter');
    const orderDateFilter = document.getElementById('orderDateFilter');

    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', filterOrders);
    }
    if (orderTypeFilter) {
        orderTypeFilter.addEventListener('change', filterOrders);
    }
    if (orderDateFilter) {
        orderDateFilter.addEventListener('change', filterOrders);
    }
}

/**
 * Filter orders based on selected criteria
 */
function filterOrders() {
    const status = document.getElementById('orderStatusFilter').value;
    const type = document.getElementById('orderTypeFilter').value;
    // const date = document.getElementById('orderDateFilter').value;

    const rows = document.querySelectorAll('#ordersTableBody tr');

    rows.forEach(function(row) {
        let show = true;

        if (status) {
            const rowStatus = row.querySelector('.status-badge');
            if (rowStatus && !rowStatus.classList.contains(status)) {
                show = false;
            }
        }

        if (type) {
            const rowType = row.querySelector('.type-badge');
            if (rowType && !rowType.classList.contains(type)) {
                show = false;
            }
        }

        row.style.display = show ? '' : 'none';
    });
}

/**
 * Open order details modal
 */
function viewOrder(orderId) {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.classList.add('active');
        console.log('Viewing order:', orderId);
    }
}

/**
 * Update order status
 */
function updateOrderStatus(orderId) {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Update status from modal
 */
async function updateStatusFromModal() {
    const select = document.getElementById('orderStatusSelect');
    // In a real app, we'd have the orderId stored somewhere
    if (select) {
        const newStatus = select.value;
        console.log('Updating status to:', newStatus);
        // showNotification('Status updated', 'success');
    }
    closeOrderModal();
}

/**
 * Close order modal
 */
function closeOrderModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

/**
 * Format relative time
 */
function formatRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
}

/**
 * Logout functionality
 */
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'index.html';
        }
    });
}

function initTimeUpdates() {
    setInterval(loadDashboardData, 60000);
}
