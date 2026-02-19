// ========== ANIMATIONS JAVASCRIPT ==========
// Advanced animations for Éclat Bistro website

'use strict';

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', function () {
    initParallaxEffect();
    initMenuHoverEffects();
    initGalleryHoverEffects();
    initButtonAnimations();
    initFormAnimations();
    initScrollBasedAnimations();
    initPageTransitions();
});

// ========== PARALLAX EFFECT ==========
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax, .hero-image');

    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    });
}

// ========== MENU HOVER EFFECTS ==========
function initMenuHoverEffects() {
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        const image = item.querySelector('.menu-item-image img');
        const badge = item.querySelector('.menu-badge');

        item.addEventListener('mouseenter', function () {
            if (image) {
                image.style.transform = 'scale(1.1)';
            }

            if (badge) {
                badge.style.transform = 'rotate(5deg) scale(1.1)';
            }

            // Add subtle lift effect
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
        });

        item.addEventListener('mouseleave', function () {
            if (image) {
                image.style.transform = 'scale(1)';
            }

            if (badge) {
                badge.style.transform = 'rotate(0) scale(1)';
            }

            // Reset lift effect
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
        });
    });

    // Category buttons hover effect
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
}

// ========== GALLERY HOVER EFFECTS ==========
function initGalleryHoverEffects() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        const image = item.querySelector('img');

        item.addEventListener('mouseenter', function () {
            if (image) {
                image.style.transform = 'scale(1.05)';
            }

            // Show overlay with delay
            const overlay = this.querySelector('.gallery-overlay');
            if (overlay) {
                setTimeout(() => {
                    overlay.style.opacity = '1';
                }, 100);
            }

            // Animate content
            const content = this.querySelector('.gallery-content');
            if (content) {
                content.style.transform = 'translateY(0)';
            }
        });

        item.addEventListener('mouseleave', function () {
            if (image) {
                image.style.transform = 'scale(1)';
            }

            // Hide overlay
            const overlay = this.querySelector('.gallery-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }

            // Reset content
            const content = this.querySelector('.gallery-content');
            if (content) {
                content.style.transform = 'translateY(20px)';
            }
        });
    });
}

// ========== BUTTON ANIMATIONS ==========
function initButtonAnimations() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline');

    buttons.forEach(button => {
        // Ripple effect
        button.addEventListener('click', function (e) {
            createRipple(e, this);
        });

        // Hover scale effect
        button.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';

            // Animate arrow
            const arrow = this.querySelector('.btn-arrow');
            if (arrow) {
                arrow.style.transform = 'translateX(4px)';
            }
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';

            // Reset arrow
            const arrow = this.querySelector('.btn-arrow');
            if (arrow) {
                arrow.style.transform = 'translateX(0)';
            }
        });
    });
}

function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    element.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ========== FORM ANIMATIONS ==========
function initFormAnimations() {
    const formInputs = document.querySelectorAll('input, select, textarea');

    formInputs.forEach(input => {
        // Add focus animation
        input.addEventListener('focus', function () {
            this.parentNode.classList.add('focused');

            // Add pulse animation to label
            const label = this.nextElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.classList.add('pulse');
                setTimeout(() => label.classList.remove('pulse'), 600);
            }
        });

        input.addEventListener('blur', function () {
            this.parentNode.classList.remove('focused');
        });

        // Add validation animation
        input.addEventListener('input', function () {
            if (this.value) {
                this.classList.add('filled');
            } else {
                this.classList.remove('filled');
            }
        });
    });
}

// ========== SCROLL-BASED ANIMATIONS ==========
function initScrollBasedAnimations() {
    // Animate elements on viewport entry
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Stagger animations for menu items
    const menuItems = document.querySelectorAll('.menu-item');
    if (menuItems.length > 0) {
        const menuObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, index * 100);
                    menuObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        menuItems.forEach(item => menuObserver.observe(item));
    }
}

// ========== PAGE TRANSITIONS ==========
function initPageTransitions() {
    // Add page load animation
    document.body.classList.add('page-load');

    // Handle internal link clicks for smooth transitions
    const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    internalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                // Add page transition class
                document.body.classList.add('page-transition');

                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth' });

                    setTimeout(() => {
                        document.body.classList.remove('page-transition');
                    }, 300);
                }, 150);
            }
        });
    });
}

// ========== TEXT ANIMATIONS ==========
function initTextAnimations() {
    // Typewriter effect for hero text
    const typewriterElements = document.querySelectorAll('.typewriter');

    typewriterElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.width = '0';

        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                element.style.width = `${(i + 1) * 10}px`;
                i++;
                setTimeout(typeWriter, 50);
            }
        }

        // Start typing when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(element);
    });

    // Animate numbers counting up
    const countElements = document.querySelectorAll('.count-up');

    countElements.forEach(element => {
        const target = parseInt(element.textContent);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        element.textContent = Math.round(current);
                    }, 16);

                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(element);
    });
}

// ========== CURSOR ANIMATIONS ==========
function initCursorAnimations() {
    // Custom cursor (optional - can be disabled)
    if (window.innerWidth > 768) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            // Smooth movement
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;

            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;

            requestAnimationFrame(animateCursor);
        }

        animateCursor();

        // Add hover effects
        const hoverElements = document.querySelectorAll('a, button, .menu-item, .gallery-item');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });

            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
    }
}

// ========== DEBOUNCE UTILITY ==========
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

// ========== INITIALIZE ON LOAD ==========
window.addEventListener('load', function () {
    // Start all animations
    initTextAnimations();
    initCursorAnimations();

    // Remove loading state
    document.body.classList.add('fully-loaded');

    // Add loaded class to images
    document.querySelectorAll('img').forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        }
    });
});

// ========== ERROR HANDLING ==========
window.addEventListener('error', function (e) {
    console.error('Animation Error:', e.message);
});

// ========== EXPORT FOR DEBUGGING ==========
window.EclatAnimations = {
    initParallaxEffect,
    initMenuHoverEffects,
    initButtonAnimations
};

console.log('Animation system initialized');



/* ===============================
SCROLL REVEAL
================================ */
const revealElements = document.querySelectorAll(
    '.about-content, .about-images, .menu-item, .service-card, .section-header, .contact-form, .contact-info, .footer'
);

const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    },
    { threshold: 0.15 }
);

revealElements.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

/* ===============================
MENU FILTER ANIMATION
================================ */
const categoryBtns = document.querySelectorAll('.category-btn');
const menuItems = document.querySelectorAll('.menu-item');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.category;

        menuItems.forEach(item => {
            item.classList.remove('show');

            setTimeout(() => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                    requestAnimationFrame(() => item.classList.add('show'));
                }

                else {
                    item.style.display = 'none';
                }
            }

                , 200);
        });
    });
});
