// ========== ORDER PAGE JAVASCRIPT ==========
// Éclat Bistro - Online Ordering

"use strict";

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

// ========== STATE ==========
var cart = [];
var menuItems = [];

// ========== DOM READY ==========
document.addEventListener("DOMContentLoaded", function () {
    console.log("Order Page - Loaded");

    // Initialize main functionality
    initNavigation();
    initMobileMenu();
    initCurrentYear();
    initDropdown();
    initPageLoader();

    // Initialize order-specific functionality
    initMenu();
    initCart();
    initCategoryFilter();
    initCheckoutModal();
    initSuccessModal();
});

// ========== PAGE LOADER ==========
function initPageLoader() {
    window.addEventListener("load", function () {
        setTimeout(function () {
            var pageLoader = document.getElementById("pageLoader");
            if (pageLoader) {
                pageLoader.style.opacity = "0";
                pageLoader.style.visibility = "hidden";
                setTimeout(function () {
                    pageLoader.remove();
                }, 300);
            }
        }, 500);
    });
}

// ========== NAVIGATION ==========
function initNavigation() {
    var navbar = document.getElementById("navbar");
    if (!navbar) return;

    window.addEventListener("scroll", debounce(function () {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }, 100));
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    var menuToggle = document.getElementById("menuToggle");
    var navMenu = document.getElementById("navMenu");
    var navActions = document.querySelector(".nav-actions");

    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener("click", function () {
        var isExpanded = this.getAttribute("aria-expanded") === "true";

        this.classList.toggle("active");
        navMenu.classList.toggle("active");

        if (navActions && window.innerWidth <= 768) {
            navActions.classList.toggle("active");
        }

        this.setAttribute("aria-expanded", !isExpanded);
        navMenu.setAttribute("aria-hidden", isExpanded);

        document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
    });

    document.addEventListener("click", function (event) {
        if (!navMenu.contains(event.target) &&
            !menuToggle.contains(event.target) &&
            navMenu.classList.contains("active")) {
            closeMobileMenu(menuToggle, navMenu, navActions);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && navMenu.classList.contains("active")) {
            closeMobileMenu(menuToggle, navMenu, navActions);
        }
    });

    window.addEventListener("resize", debounce(function () {
        if (window.innerWidth > 768) {
            closeMobileMenu(menuToggle, navMenu, navActions);
        }
    }, 250));
}

function closeMobileMenu(menuToggle, navMenu, navActions) {
    menuToggle.classList.remove("active");
    navMenu.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    navMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (navActions) {
        navActions.classList.remove("active");
    }
}

// ========== DROPDOWN ==========
function initDropdown() {
    var dropdownToggles = document.querySelectorAll(".dropdown-toggle");
    var dropdowns = document.querySelectorAll(".nav-dropdown");

    dropdownToggles.forEach(function (toggle) {
        toggle.addEventListener("click", function (e) {
            e.preventDefault();
            var parent = this.parentElement;
            parent.classList.toggle("open");
        });
    });

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".nav-dropdown")) {
            dropdowns.forEach(function (dropdown) {
                dropdown.classList.remove("open");
            });
        }
    });
}

// ========== CURRENT YEAR ==========
function initCurrentYear() {
    var yearElements = document.querySelectorAll("#currentYear");
    var currentYear = new Date().getFullYear();

    yearElements.forEach(function (element) {
        element.textContent = currentYear;
    });
}

// ========== MENU ==========
async function initMenu() {
    try {
        var response = await fetch("/api/menu");
        if (!response.ok) throw new Error("Failed to fetch menu");

        menuItems = await response.json();
        renderMenu(menuItems);
    } catch (error) {
        console.error("Error loading menu:", error);
    }
}

function renderMenu(items) {
    var menuGrid = document.querySelector(".menu-grid");
    if (!menuGrid) return;

    menuGrid.innerHTML = items.map(function (item) {
        return '<div class="menu-item" data-category="' + item.category + '" data-id="' + item.id + '">' +
            '<div class="menu-item-image">' +
            '<img src="' + item.image + '" alt="' + item.name + '" loading="lazy">' +
            (item.badge ? '<span class="menu-badge">' + item.badge + '</span>' : "") +
            '</div>' +
            '<div class="menu-item-content">' +
            '<div class="menu-item-header">' +
            '<h3 class="menu-item-name">' + item.name + '</h3>' +
            '<span class="menu-item-price">$' + item.price.toFixed(2) + '</span>' +
            '</div>' +
            '<p class="menu-item-desc">' + item.description + '</p>' +
            '<button class="btn-add-cart" onclick="addToCart(' + item.id + ')">' +
            '<span class="btn-icon">+</span> Add to Cart' +
            '</button>' +
            '</div>' +
            '</div>';
    }).join("");
}

// ========== CART ==========
function initCart() {
    var savedCart = localStorage.getItem("eclatCart");
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }

    updateCartDisplay();
    updateCartCount();
}

function addToCart(itemId) {
    var item = menuItems.find(function (i) { return i.id === itemId; });
    if (!item) return;

    var existingItem = cart.find(function (i) { return i.id === itemId; });
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartDisplay();
    updateCartCount();
    showNotification("Added " + item.name + " to cart", "success");
}

function removeFromCart(itemId) {
    cart = cart.filter(function (item) { return item.id !== itemId; });
    saveCart();
    updateCartDisplay();
    updateCartCount();
}

function updateQuantity(itemId, change) {
    var item = cart.find(function (i) { return i.id === itemId; });
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
            updateCartDisplay();
            updateCartCount();
        }
    }
}

function saveCart() {
    localStorage.setItem("eclatCart", JSON.stringify(cart));
}

function updateCartDisplay() {
    var cartItems = document.querySelector(".cart-items");
    var cartTotal = document.querySelector(".cart-total");
    var checkoutBtn = document.querySelector(".btn-checkout");

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">' +
            '<div class="cart-empty-icon">🛒</div>' +
            "<p>Your cart is empty</p>" +
            "<span>Add some delicious items from our menu!</span>" +
            '</div>';

        if (checkoutBtn) checkoutBtn.disabled = true;

        if (cartTotal) {
            cartTotal.innerHTML = '<div class="total-row"><span>Subtotal</span><span>$0.00</span></div>' +
                '<div class="total-row"><span>Tax (10%)</span><span>$0.00</span></div>' +
                '<div class="total-row grand-total"><span>Total</span><span>$0.00</span></div>';
        }

        return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    cartItems.innerHTML = cart.map(function (item) {
        return '<div class="cart-item" data-id="' + item.id + '">' +
            '<div class="cart-item-image"><img src="' + item.image + '" alt="' + item.name + '"></div>' +
            '<div class="cart-item-details">' +
            '<h4 class="cart-item-name">' + item.name + '</h4>' +
            '<span class="cart-item-price">$' + item.price.toFixed(2) + '</span>' +
            '</div>' +
            '<div class="cart-item-actions">' +
            '<div class="quantity-control">' +
            '<button class="qty-btn" onclick="updateQuantity(' + item.id + ', -1)">-</button>' +
            '<span class="qty-value">' + item.quantity + '</span>' +
            '<button class="qty-btn" onclick="updateQuantity(' + item.id + ', 1)">+</button>' +
            '</div>' +
            '<button class="btn-remove" onclick="removeFromCart(' + item.id + ')"><span>×</span></button>' +
            '</div></div>';
    }).join("");

    var subtotal = cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
    var tax = subtotal * 0.10;
    var total = subtotal + tax;

    if (cartTotal) {
        cartTotal.innerHTML = '<div class="total-row"><span>Subtotal</span><span>$' + subtotal.toFixed(2) + '</span></div>' +
            '<div class="total-row"><span>Tax (10%)</span><span>$' + tax.toFixed(2) + '</span></div>' +
            '<div class="total-row grand-total"><span>Total</span><span>$' + total.toFixed(2) + '</span></div>';
    }
}

function updateCartCount() {
    var cartCount = document.querySelector(".cart-count");
    if (cartCount) {
        var count = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? "flex" : "none";
    }
}

// ========== CATEGORY FILTER ==========
function initCategoryFilter() {
    var categoryButtons = document.querySelectorAll(".category-btn");
    var menuItemsEls = document.querySelectorAll(".menu-item");

    if (categoryButtons.length === 0) return;

    categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var category = this.getAttribute("data-category");

            categoryButtons.forEach(function (btn) { btn.classList.remove("active"); });
            this.classList.add("active");

            menuItemsEls.forEach(function (item) {
                var itemCategory = item.getAttribute("data-category");

                if (category === "all" || itemCategory === category) {
                    item.style.display = "flex";
                    item.style.opacity = "1";
                    item.style.transform = "translateY(0)";
                } else {
                    item.style.opacity = "0";
                    item.style.transform = "translateY(20px)";
                    setTimeout(function () {
                        if (item.style.opacity === "0") {
                            item.style.display = "none";
                        }
                    }, 300);
                }
            });
        });
    });
}

// ========== CHECKOUT MODAL ==========
function initCheckoutModal() {
    var checkoutBtn = document.getElementById("checkoutBtn");
    var closeBtn = document.getElementById("closeCheckoutModal");
    var modal = document.getElementById("checkoutModal");

    if (!checkoutBtn || !modal) return;

    checkoutBtn.addEventListener("click", function () {
        if (cart.length === 0) return;

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        updateOrderSummary();
    });

    function closeModal() {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    // Close when clicking background
    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }
    });

    var phoneInput = document.getElementById("checkoutPhone");
    if (phoneInput) {
        phoneInput.addEventListener("input", function (e) {
            var value = e.target.value.replace(/\D/g, "");
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = "(" + value;
                } else if (value.length <= 6) {
                    value = "(" + value.substring(0, 3) + ") " + value.substring(3);
                } else {
                    value = "(" + value.substring(0, 3) + ") " + value.substring(3, 6) + "-" + value.substring(6, 10);
                }
            }
            e.target.value = value;
        });
    }

    var form = document.getElementById("checkoutForm");
    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn.textContent;
            submitBtn.textContent = "Processing...";
            submitBtn.disabled = true;

            var subtotal = cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
            var deliveryFee = 5.00; // Fixed delivery fee for now
            var tax = subtotal * 0.10;
            var total = subtotal + tax + deliveryFee;

            var orderData = {
                items: cart.map(function (item) {
                    return { 
                        id: item.id, 
                        name: item.name, 
                        price: item.price, 
                        quantity: item.quantity,
                        subtotal: item.price * item.quantity
                    };
                }),
                customer: {
                    firstName: document.getElementById("checkoutFirstName").value,
                    lastName: document.getElementById("checkoutLastName").value,
                    email: document.getElementById("checkoutEmail").value,
                    phone: document.getElementById("checkoutPhone").value,
                    address: (document.getElementById("checkoutAddress").value || "") + ", " + 
                             (document.getElementById("checkoutCity").value || "") + " " + 
                             (document.getElementById("checkoutZip").value || "")
                },
                totals: {
                    subtotal: subtotal,
                    deliveryFee: deliveryFee,
                    tax: tax,
                    total: total
                },
                orderType: "delivery", // Default for now
                paymentMethod: "card", // Default for now
                specialInstructions: document.getElementById("orderNotes").value || "",
                time: "asap"
            };

            var result = await submitOrder(orderData);

            if (result.success) {
                // Save user email for dashboard tracking
                if (orderData.customer && orderData.customer.email) {
                    localStorage.setItem('eclat_user_email', orderData.customer.email);
                    console.log('User email saved for dashboard:', orderData.customer.email);
                }

                cart = [];
                saveCart();
                updateCartDisplay();
                updateCartCount();
                closeModal();
                showSuccessModal(result.data.order);
            } else {
                alert("Failed to place order: " + (result.error || "Please try again."));
            }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
}

function updateOrderSummary() {
    var summaryItems = document.querySelector(".summary-items");

    if (!summaryItems) return;

    var subtotal = cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
    var tax = subtotal * 0.10;
    var total = subtotal + tax;

    summaryItems.innerHTML = cart.map(function (item) {
        return '<div class="summary-item"><span class="item-name">' + item.name + " × " + item.quantity + '</span><span class="item-price">$' + (item.price * item.quantity).toFixed(2) + '</span></div>';
    }).join("");

    var subtotalEl = document.querySelector(".summary-subtotal");
    var taxEl = document.querySelector(".summary-tax");
    var totalEl = document.querySelector(".summary-total");

    if (subtotalEl) subtotalEl.textContent = "$" + subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = "$" + tax.toFixed(2);
    if (totalEl) totalEl.textContent = "$" + total.toFixed(2);
}

// ========== SUCCESS MODAL ==========
function initSuccessModal() {
    var closeBtn = document.getElementById("closeSuccessModal");
    var modal = document.getElementById("successModal");

    if (!modal) return;

    function closeSuccessModal() {
        modal.classList.remove("active");
        document.body.style.overflow = "";
        window.location.href = "/"; // Redirect to home
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeSuccessModal);
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeSuccessModal();
        }
    });
}

function showSuccessModal(order) {
    var modal = document.getElementById("successModal");
    if (!modal) return;

    var orderId = document.querySelector(".success-order-id");
    var orderTotal = document.querySelector(".success-order-total");

    if (orderId) orderId.textContent = order.orderNumber || "ORD-" + Date.now().toString().slice(-8);
    if (orderTotal) orderTotal.textContent = "$" + (order.totals ? order.totals.total : 0).toFixed(2);

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// ========== UTILITY FUNCTIONS ==========
function debounce(func, wait) {
    var timeout;
    return function executedFunction() {
        var args = arguments;
        var context = this;
        var later = function () {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type) {
    type = type || "info";
    var existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach(function (notification) {
        notification.classList.add("hide");
        setTimeout(function () { notification.remove(); }, 300);
    });

    var notification = document.createElement("div");
    notification.className = "notification " + type;
    notification.innerHTML = '<span class="notification-icon">' + getNotificationIcon(type) + '</span><span class="notification-text">' + message + '</span>';

    document.body.appendChild(notification);

    setTimeout(function () {
        notification.classList.add("hide");
        setTimeout(function () { notification.remove(); }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case "success": return "✓";
        case "error": return "✕";
        case "warning": return "⚠";
        default: return "ℹ";
    }
}

async function submitOrder(orderData) {
    try {
        var response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        var data = await response.json();

        if (response.ok) {
            console.log("Order submitted successfully:", data);
            return { success: true, data: data };
        } else {
            console.error("Order submission failed:", data.error);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error("Error submitting order:", error);
        return { success: false, error: "Network error. Please try again." };
    }
}

// ========== EXPORT FOR GLOBAL ACCESS ==========
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;

console.log("Order Page JavaScript initialized successfully");
