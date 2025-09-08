// js/main.js

// Global variables
let currentPage = 'mainchat';
let currentTheme = 'light';
let apiEndpoint = 'https://api.burmemark.com/v1';
let userPreferences = {
    theme: 'light',
    fontSize: 'medium',
    autoSave: true,
    notifications: true
};

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
    setupEventListeners();
    loadUserPreferences();
});

/**
 * Initialize the application
 */
function initializeApplication() {
    console.log('Burme-Mark Application Initializing...');
    
    // Apply saved theme
    applyTheme(userPreferences.theme);
    
    // Check if user is logged in (placeholder for future implementation)
    checkAuthStatus();
    
    // Initialize service worker if available
    if ('serviceWorker' in navigator) {
        initializeServiceWorker();
    }
    
    // Load initial page content
    loadPageContent(currentPage);
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    // Navigation events
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-nav]')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-nav');
            navigateTo(page);
        }
    });
    
    // Theme toggle
    document.addEventListener('click', function(e) {
        if (e.target.matches('#themeToggle')) {
            toggleTheme();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + / for help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            navigateTo('docs');
        }
        
        // Escape key to clear selection/close modals
        if (e.key === 'Escape') {
            clearSelection();
        }
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page) {
            loadPageContent(e.state.page);
        }
    });
}

/**
 * Navigate to a different page
 * @param {string} page - The page to navigate to
 */
function navigateTo(page) {
    if (page === currentPage) return;
    
    // Save current page state (placeholder for future implementation)
    savePageState(currentPage);
    
    // Update current page
    currentPage = page;
    
    // Update browser history
    window.history.pushState({ page }, '', `pages/${page}.html`);
    
    // Load new page content
    loadPageContent(page);
    
    // Update active navigation
    updateActiveNav(page);
}

/**
 * Load content for a specific page
 * @param {string} page - The page to load
 */
function loadPageContent(page) {
    console.log(`Loading page: ${page}`);
    
    // Show loading indicator
    showLoading();
    
    // Fetch page content
    fetch(`pages/${page}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load page: ${page}`);
            }
            return response.text();
        })
        .then(html => {
            // Insert content into main container
            document.getElementById('main-content').innerHTML = html;
            
            // Load page-specific JavaScript
            loadPageScript(page);
            
            // Hide loading indicator
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading page:', error);
            showError(`Failed to load ${page} page. Please try again.`);
            hideLoading();
        });
}

/**
 * Load page-specific JavaScript
 * @param {string} page - The page to load script for
 */
function loadPageScript(page) {
    // Remove any previously loaded page script
    const existingScript = document.getElementById('page-script');
    if (existingScript) {
        existingScript.remove();
    }
    
    // Create new script element
    const script = document.createElement('script');
    script.id = 'page-script';
    script.src = `js/pages/${page}.js`;
    script.onerror = function() {
        console.warn(`No script found for ${page} page`);
        this.remove();
    };
    
    document.body.appendChild(script);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    
    // Save preference
    userPreferences.theme = currentTheme;
    saveUserPreferences();
}

/**
 * Apply the selected theme
 * @param {string} theme - The theme to apply ('light' or 'dark')
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    
    // Update theme toggle button if it exists
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        themeToggle.setAttribute('aria-label', 
            `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
    }
}

/**
 * Show loading indicator
 */
function showLoading() {
    // Create or show loading overlay
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        `;
        document.body.appendChild(loadingOverlay);
    }
    
    loadingOverlay.style.display = 'flex';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * Show error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    // Create or update error toast
    let errorToast = document.getElementById('error-toast');
    if (!errorToast) {
        errorToast = document.createElement('div');
        errorToast.id = 'error-toast';
        errorToast.innerHTML = `
            <div class="error-content">
                <span class="error-message"></span>
                <button class="error-close">×</button>
            </div>
        `;
        document.body.appendChild(errorToast);
        
        // Add close event listener
        errorToast.querySelector('.error-close').addEventListener('click', function() {
            errorToast.classList.remove('active');
        });
    }
    
    errorToast.querySelector('.error-message').textContent = message;
    errorToast.classList.add('active');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorToast.classList.remove('active');
    }, 5000);
}

/**
 * Clear current selection or close modals
 */
function clearSelection() {
    // Clear any text selection
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
    
    // Close any open modals (implementation depends on your modal system)
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        // You would typically have a function to close modals
        // For now, we'll just remove a show class if it exists
        modal.classList.remove('show');
    });
}

/**
 * Update active navigation item
 * @param {string} page - The current active page
 */
function updateActiveNav(page) {
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('[data-nav]');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current nav item
    const currentNavItem = document.querySelector(`[data-nav="${page}"]`);
    if (currentNavItem) {
        currentNavItem.classList.add('active');
    }
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
    const savedPreferences = localStorage.getItem('burmemark-preferences');
    if (savedPreferences) {
        try {
            userPreferences = { ...userPreferences, ...JSON.parse(savedPreferences) };
            
            // Apply preferences
            if (userPreferences.theme) {
                applyTheme(userPreferences.theme);
            }
            
            if (userPreferences.fontSize) {
                document.documentElement.style.fontSize = 
                    userPreferences.fontSize === 'small' ? '14px' :
                    userPreferences.fontSize === 'large' ? '18px' : '16px';
            }
        } catch (e) {
            console.error('Error parsing saved preferences:', e);
        }
    }
}

/**
 * Save user preferences to localStorage
 */
function saveUserPreferences() {
    try {
        localStorage.setItem('burmemark-preferences', JSON.stringify(userPreferences));
    } catch (e) {
        console.error('Error saving preferences:', e);
    }
}

/**
 * Initialize service worker for offline functionality
 */
function initializeServiceWorker() {
    navigator.serviceWorker.register('/worker/worker.js')
        .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
        });
}

/**
 * Check authentication status (placeholder for future implementation)
 */
function checkAuthStatus() {
    // This would check if the user is logged in
    // For now, we'll just set a placeholder
    const isLoggedIn = localStorage.getItem('burmemark-auth-token') !== null;
    window.userAuthenticated = isLoggedIn;
    
    // Dispatch custom event for other components to listen to
    document.dispatchEvent(new CustomEvent('authStatusChanged', { 
        detail: { isAuthenticated: isLoggedIn } 
    }));
}

/**
 * Save current page state (placeholder for future implementation)
 * @param {string} page - The page to save state for
 */
function savePageState(page) {
    // This would save the state of the current page before navigating away
    // For example, saving form data, scroll position, etc.
    
    // Dispatch custom event for page-specific save handlers
    document.dispatchEvent(new CustomEvent('pageBeforeUnload', { 
        detail: { page } 
    }));
}

/**
 * Make API request to backend
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
function apiRequest(endpoint, options = {}) {
    const url = `${apiEndpoint}${endpoint}`;
    
    // Set default headers
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    // Add auth token if available
    const authToken = localStorage.getItem('burmemark-auth-token');
    if (authToken) {
        defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Merge headers
    options.headers = { ...defaultHeaders, ...options.headers };
    
    // Show loading indicator for requests that take time
    if (!options.silent) {
        showLoading();
    }
    
    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .finally(() => {
            if (!options.silent) {
                hideLoading();
            }
        });
}

// Export functions for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        navigateTo,
        toggleTheme,
        apiRequest,
        showError,
        userPreferences
    };
}
