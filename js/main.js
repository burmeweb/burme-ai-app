// Main JavaScript for Burme-Mark

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    console.log('Burme-Mark initialized');
    
    // Check if user has visited before
    if (!localStorage.getItem('firstVisit')) {
        showWelcomeMessage();
        localStorage.setItem('firstVisit', 'true');
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load user preferences
    loadUserPreferences();
    
    // Check for service worker
    registerServiceWorker();
}

// Show welcome message
function showWelcomeMessage() {
    const welcomeToast = document.createElement('div');
    welcomeToast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.5s ease;
    `;
    
    welcomeToast.innerHTML = `
        <h3>Welcome to Burme-Mark! 🎉</h3>
        <p>Your AI-powered creative suite is ready to use.</p>
    `;
    
    document.body.appendChild(welcomeToast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        welcomeToast.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(welcomeToast);
        }, 500);
    }, 5000);
}

// Set up event listeners
function setupEventListeners() {
    // Navigation toggle for mobile
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileNav);
    }
    
    // Theme switcher (if exists)
    const themeSwitcher = document.querySelector('.theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', toggleTheme);
    }
    
    // Quick action cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const destination = this.getAttribute('href');
            navigateTo(destination);
        });
    });
    
    // Add animation to feature cards on scroll
    setupScrollAnimations();
}

// Toggle mobile navigation
function toggleMobileNav() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Toggle theme between light and dark
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// Load user preferences
function loadUserPreferences() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Load other preferences here
}

// Navigate to page with animation
function navigateTo(url) {
    // Add fade out animation to body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s';
    
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// Set up scroll animations
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .action-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(element);
    });
}

// Register service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('../worker/worker.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch((error) => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
}

// API call function
async function makeApiRequest(endpoint, data) {
    try {
        const response = await fetch(`../worker/burmemark-worker.js/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        showNotification('Connection error. Please try again.', 'error');
        return null;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem;
                border-radius: 8px;
                color: white;
                z-index: 1000;
                animation: slideIn 0.3s ease;
            }
            .notification.info { background: var(--primary); }
            .notification.success { background: var(--success); }
            .notification.error { background: var(--danger); }
            .notification.warning { background: var(--warning); }
            @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export functions for use in other modules
window.BurmeMark = {
    makeApiRequest,
    showNotification,
    formatDate,
    navigateTo
};
