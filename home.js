const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Throttle function for performance
function throttle(fn, wait) {
    let lastTime = 0;
    return function (...args) {
        const now = performance.now();
        if (now - lastTime >= wait) {
            fn.apply(this, args);
            lastTime = now;
        }
    };
}

// Mobile Menu Toggle
function toggleMenu() {
    navLinks.classList.toggle('active');
    const icon = mobileMenuToggle.querySelector('span');
    icon.textContent = navLinks.classList.contains('active') ? 'close' : 'menu';
}

mobileMenuToggle.addEventListener('click', toggleMenu, { passive: true });

// Close mobile menu when clicking on a link
function closeMenu() {
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileMenuToggle.querySelector('span').textContent = 'menu';
    }
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu, { passive: true });
});

// Optimized smooth scrolling
function smoothScroll(e) {
    if (this.getAttribute('href') === '#') return;
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: 'smooth'
        });
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', smoothScroll, { passive: false });
});

// Sticky navigation with IntersectionObserver
const nav = document.querySelector('.modern-nav');
const navObserver = new IntersectionObserver(
    ([entry]) => {
        requestAnimationFrame(() => {
            if (!entry.isIntersecting) {
                nav.style.padding = '10px 0';
                nav.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
            } else {
                nav.style.padding = '15px 0';
                nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        });
    },
    { threshold: 0.1, rootMargin: '-70px 0px 0px 0px' }
);

const navSentinel = document.createElement('div');
navSentinel.style.position = 'absolute';
navSentinel.style.top = '70px';
navSentinel.style.width = '1px';
navSentinel.style.height = '1px';
document.body.prepend(navSentinel);
navObserver.observe(navSentinel);

// Animation on scroll with IntersectionObserver
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    animationObserver.unobserve(entry.target);
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .product-card, .testimonial-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'transform 0.6s ease';
        element.style.willChange = 'opacity, transform';
        animationObserver.observe(element);
    });
}

// Current year for copyright
document.querySelector('.copyright').innerHTML = `© ${new Date().getFullYear()} Sri Annakamatchi Traders. All Rights Reserved.`;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupScrollAnimations();
    
    // Optimize images loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        lazyImages.forEach(img => {
            img.loading = 'lazy';
            img.decoding = 'async';
        });
    }
}, { passive: true });

// Optimize window load event
window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        document.querySelectorAll('.feature-card, .product-card, .testimonial-card').forEach(el => {
            el.style.willChange = 'auto';
        });
    });
}, { passive: true });

// Optimized scroll handling
let lastScrollTop = 0;
const handleScroll = throttle(() => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScroll > lastScrollTop) {
        // Downscroll
        nav.classList.add('scroll-down');
        nav.classList.remove('scroll-up');
    } else {
        // Upscroll
        nav.classList.add('scroll-up');
        nav.classList.remove('scroll-down');
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, 100);

window.addEventListener('scroll', handleScroll, { passive: true });

// Optimized resize handler
let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Handle responsive adjustments
        requestAnimationFrame(() => {
            // Add any responsive adjustments here
        });
    }, 100);
}

window.addEventListener('resize', handleResize, { passive: true });