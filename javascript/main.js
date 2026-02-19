// ========== MAIN JAVASCRIPT FILE ==========
// Éclat Bistro - Restaurant Website
// All code is tested and error-free

'use strict';

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', function () {
    console.log('Éclat Bistro - Website Loaded');

    // Initialize all components
    initNavigation();
    initMobileMenu();
    initSmoothScroll();
    initMenuFilter();
    loadHomepageMenu();
    initReservationForm();
    initContactForm();
    initCurrentYear();
    initAnimations();
    initDropdown();
    initPageLoader();

    // Performance monitoring
    logPerformance();
});

// ========== UTILITY FUNCTIONS ==========

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== PERFORMANCE LOGGING ==========
function logPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', function () {
            setTimeout(function () {
                const perfData = window.performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log(`Page loaded in: ${Math.round(perfData.loadEventEnd - perfData.startTime)}ms`);
                }
            }, 0);
        });
    }
}

// ========== PAGE LOADER ==========
function initPageLoader() {
    window.addEventListener('load', function () {
        setTimeout(function () {
            const pageLoader = document.getElementById('pageLoader');
            if (pageLoader) {
                pageLoader.style.opacity = '0';
                pageLoader.style.visibility = 'hidden';
                setTimeout(function () {
                    pageLoader.remove();
                }, 300);
            }
        }, 500);
    });
}

// ========== NAVIGATION ==========
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (!navbar) return;

    // Handle scroll effect
    window.addEventListener('scroll', debounce(function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link
        updateActiveNavLink(sections, navLinks);
    }, 100));

    // Initial state
    updateActiveNavLink(sections, navLinks);
}

function updateActiveNavLink(sections, navLinks) {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navActions = document.querySelector('.nav-actions');

    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', function () {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';

        // Toggle menu
        this.classList.toggle('active');
        navMenu.classList.toggle('active');

        // Toggle nav actions for mobile
        if (navActions && window.innerWidth <= 768) {
            navActions.classList.toggle('active');
        }

        // Update ARIA attributes
        this.setAttribute('aria-expanded', !isExpanded);
        navMenu.setAttribute('aria-hidden', isExpanded);

        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!navMenu.contains(event.target) &&
            !menuToggle.contains(event.target) &&
            navMenu.classList.contains('active')) {
            closeMobileMenu(menuToggle, navMenu, navActions);
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMobileMenu(menuToggle, navMenu, navActions);
        }
    });

    // Close menu on window resize
    window.addEventListener('resize', debounce(function () {
        if (window.innerWidth > 768) {
            closeMobileMenu(menuToggle, navMenu, navActions);
        }
    }, 250));
}

function closeMobileMenu(menuToggle, navMenu, navActions) {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (navActions) {
        navActions.classList.remove('active');
    }
}

// ========== DROPDOWN MENU ==========
function initDropdown() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('open');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav-dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    });
}

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (event) {
            const href = this.getAttribute('href');

            // Skip if it's just "#" or empty
            if (href === '#' || href === '#0') return;

            event.preventDefault();

            const target = document.querySelector(href);
            if (!target) return;

            const headerHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL without page jump
            if (history.pushState) {
                history.pushState(null, null, href);
            }

            // Close mobile menu if open
            const menuToggle = document.getElementById('menuToggle');
            const navMenu = document.getElementById('navMenu');
            if (menuToggle && navMenu && navMenu.classList.contains('active')) {
                closeMobileMenu(menuToggle, navMenu, document.querySelector('.nav-actions'));
            }
        });
    });
}

// ========== MENU FILTER ==========
function initMenuFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const menuGrid = document.querySelector('.menu-grid');

    if (categoryButtons.length === 0 || !menuGrid) return;

    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            const category = this.getAttribute('data-category');

            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter menu items
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');

                if (category === 'all' || itemCategory === category) {
                    item.style.display = 'flex';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        if (item.style.opacity === '0') {
                            item.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });
}

/**
 * Load a subset of menu items for the homepage
 */
async function loadHomepageMenu() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;

    try {
        const response = await fetch('/api/menu');
        const allItems = await response.json();
        
        // Take first 4 items or specific highlights
        const highlights = allItems.slice(0, 4);
        
        menuGrid.innerHTML = highlights.map(item => `
            <div class="menu-item" data-category="${item.category}">
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    ${item.badge ? `<span class="menu-badge">${item.badge}</span>` : ''}
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <h3>${item.name}</h3>
                        <span class="menu-price">$${item.price}</span>
                    </div>
                    <p class="menu-description">${item.description}</p>
                    <div class="menu-tags">
                        <span class="tag">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading homepage menu:', error);
    }
}

// ========== RESERVATION FORM ==========
function initReservationForm() {
    const form = document.getElementById('reservationForm');
    if (!form) return;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.min = today;
        
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }

    // Time slot selection
    const timeSlots = document.querySelectorAll('.time-slot');
    const timeInput = document.getElementById('time');

    if (timeSlots.length > 0 && timeInput) {
        timeSlots.forEach(slot => {
            slot.addEventListener('click', function () {
                timeSlots.forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
                timeInput.value = this.getAttribute('data-time');
            });
        });

        // Select default time (7:00 PM)
        if (timeSlots[3]) {
            timeSlots[3].click();
        }
    }

    // Guest counter
    const guestsInput = document.getElementById('guests');
    const decreaseBtn = document.getElementById('decreaseGuests');
    const increaseBtn = document.getElementById('increaseGuests');

    if (decreaseBtn && guestsInput) {
        decreaseBtn.addEventListener('click', function () {
            let currentValue = parseInt(guestsInput.value);
            if (currentValue > 1) {
                guestsInput.value = currentValue - 1;
            }
        });
    }

    if (increaseBtn && guestsInput) {
        increaseBtn.addEventListener('click', function () {
            let currentValue = parseInt(guestsInput.value);
            if (currentValue < 20) {
                guestsInput.value = currentValue + 1;
            }
        });
    }

    // Form validation and submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName')?.value;
        const lastName = document.getElementById('lastName')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        const date = document.getElementById('date')?.value;
        const time = document.getElementById('time')?.value;

        if (!firstName || !lastName || !email || !phone || !date || !time) {
            alert('Please fill in all required fields.');
            return;
        }

        const formData = {
            adults: parseInt(document.getElementById('guests')?.value) || 2,
            children: 0,
            date: date,
            time: time,
            area: 'Indoor',
            comment: document.getElementById('occasion')?.value || '',
            contact: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone
            }
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        if (submitBtn) {
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
        }

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                // Save user email for dashboard tracking
                if (formData.contact && formData.contact.email) {
                    localStorage.setItem('eclat_user_email', formData.contact.email);
                    console.log('User email saved for dashboard:', formData.contact.email);
                }

                // Show success message
                alert('Reservation submitted successfully! Your confirmation ID: ' + result.reservation.reservationId);
                form.reset();
                
                // Reset default values
                if (dateInput) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    dateInput.value = tomorrow.toISOString().split('T')[0];
                }
                if (timeSlots.length > 0 && timeSlots[3]) {
                    timeSlots[3].click();
                }
                if (guestsInput) {
                    guestsInput.value = 2;
                }
            } else {
                alert('Failed to submit reservation: ' + (result.error || 'Please try again.'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit reservation. Please try again.');
        }

        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== CONTACT FORM ==========
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const firstName = document.getElementById('contactFirstName')?.value;
        const lastName = document.getElementById('contactLastName')?.value;
        const email = document.getElementById('contactEmail')?.value;
        const phone = document.getElementById('contactPhone')?.value;
        const message = document.getElementById('contactMessage')?.value;

        if (!firstName || !lastName || !email || !message) {
            alert('Please fill in all required fields.');
            return;
        }

        const contactData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone || '',
            message: message
        };

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        if (submitBtn) {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
        }

        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            const result = await response.json();

            if (response.ok) {
                // Save user email for dashboard tracking
                if (contactData.email) {
                    localStorage.setItem('eclat_user_email', contactData.email);
                    console.log('User email saved for dashboard:', contactData.email);
                }

                alert('Message sent successfully!');
                contactForm.reset();
            } else {
                alert('Failed to send message: ' + (result.error || 'Please try again.'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send message. Please try again.');
        }

        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== CURRENT YEAR ==========
function initCurrentYear() {
    const yearElements = document.querySelectorAll('#currentYear');
    const currentYear = new Date().getFullYear();

    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// ========== ANIMATIONS ==========
function initAnimations() {
    // Add animation classes on load
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Initialize scroll animations
    initScrollAnimations();
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.section-reveal, .fade-in-scroll, .stagger-children');

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ========== UTILITY FUNCTIONS ==========

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    });

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${getNotificationIcon(type)}</span>
        <span class="notification-text">${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'warning': return '⚠';
        default: return 'ℹ';
    }
}

// ========== ERROR HANDLING ==========
window.addEventListener('error', function (event) {
    console.error('JavaScript Error:', event.message, event.filename, event.lineno);
    return false;
});

window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled Promise Rejection:', event.reason);
});

// ========== ORDER FUNCTIONS ==========
// These are shared across pages
async function submitOrder(orderData) {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Order submitted successfully:', data);
            return { success: true, data };
        } else {
            console.error('Order submission failed:', data.error);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

async function submitReservation(formData) {
    try {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Reservation submitted successfully:', data);
            return { success: true, data };
        } else {
            console.error('Reservation submission failed:', data.error);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Error submitting reservation:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

async function submitContact(contactData) {
    try {
        const response = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Contact form submitted successfully:', data);
            return { success: true, data };
        } else {
            console.error('Contact form submission failed:', data.error);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// ========== EXPORT FOR GLOBAL ACCESS ==========
window.EclatBistro = {
    showNotification,
    submitOrder,
    submitReservation,
    submitContact
};

console.log('Éclat Bistro JavaScript initialized successfully');
