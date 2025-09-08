// Global JavaScript for Burme Mark App
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.innerHTML = navMenu.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container') && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // Animation on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animated');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Initialize animations
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Trigger on load
    
    // Theme handling (light/dark mode)
    const themeToggle = document.createElement('button');
    themeToggle.id = 'themeToggle';
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        z-index: 99;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLightTheme = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
        
        themeToggle.innerHTML = isLightTheme ? 
            '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        // Update theme variables
        updateThemeVariables(isLightTheme);
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        updateThemeVariables(true);
    }
    
    function updateThemeVariables(isLightTheme) {
        if (isLightTheme) {
            document.documentElement.style.setProperty('--light', '#212529');
            document.documentElement.style.setProperty('--dark', '#f8f9fa');
            document.documentElement.style.setProperty('--text', '#f8f9fa');
            document.documentElement.style.setProperty('--text-light', '#6c757d');
            document.body.style.background = 'linear-gradient(135deg, #e6e6e6 0%, #ffffff 100%)';
            document.body.style.color = '#212529';
        } else {
            document.documentElement.style.setProperty('--light', '#f8f9fa');
            document.documentElement.style.setProperty('--dark', '#212529');
            document.documentElement.style.setProperty('--text', '#2b2d42');
            document.documentElement.style.setProperty('--text-light', '#6c757d');
            document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
            document.body.style.color = '#f8f9fa';
        }
    }
    
    // Handle API errors globally
    window.handleApiError = function(error) {
        console.error('API Error:', error);
        showNotification('An error occurred. Please try again.', 'error');
    };
    
    // Global notification function
    window.showNotification = function(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 5px;
                    color: white;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                    max-width: 500px;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                .notification.success { background: #4caf50; }
                .notification.error { background: #f44336; }
                .notification.info { background: #2196f3; }
                .notification.warning { background: #ff9800; }
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    margin-left: 15px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    };
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    if (lazyImage.dataset.src) {
                        lazyImage.src = lazyImage.dataset.src;
                    }
                    if (lazyImage.dataset.srcset) {
                        lazyImage.srcset = lazyImage.dataset.srcset;
                    }
                    lazyImage.classList.remove('lazy');
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });
        
        document.querySelectorAll('img.lazy').forEach(img => {
            lazyImageObserver.observe(img);
        });
    }
    
    // Add loading animation to buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.btn, button') && !e.target.classList.contains('theme-toggle')) {
            const button = e.target;
            const originalText = button.innerHTML;
            
            // Only add loading animation if the button doesn't already have it
            if (!button.classList.contains('loading')) {
                button.classList.add('loading');
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                button.disabled = true;
                
                // Auto reset after 5 seconds (safety measure)
                setTimeout(() => {
                    if (button.classList.contains('loading')) {
                        button.classList.remove('loading');
                        button.innerHTML = originalText;
                        button.disabled = false;
                    }
                }, 5000);
            }
        }
    });
    
    // Page transition animation
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            // Only apply to internal links
            if (this.hostname === window.location.hostname && !this.hash) {
                e.preventDefault();
                const href = this.href;
                
                // Add page transition
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
    });
    
    // Check if page was loaded from cache and restore opacity
    if (document.body.style.opacity === '0') {
        document.body.style.opacity = '1';
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search (if available)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="earch"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape key to close modals or menus
        if (e.key === 'Escape') {
            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
            
            // Close notifications
            document.querySelectorAll('.notification').forEach(n => n.remove());
        }
    });
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page loaded in ${loadTime}ms`);
            
            if (loadTime > 3000) {
                console.warn('Page load time is slow. Consider optimizing assets.');
            }
        });
    }
    
    // Service Worker registration (for PWA)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('SW registered: ', registration);
                })
                .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
});
