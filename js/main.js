// Global JavaScript for Burme Mark App
document.addEventListener('DOMContentLoaded', function() {
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
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLightTheme = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
            
            themeToggle.innerHTML = isLightTheme ? 
                '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    // Handle API errors globally
    window.handleApiError = function(error) {
        console.error('API Error:', error);
        // Show user-friendly error message
        showNotification('An error occurred. Please try again.', 'error');
    };
    
    // Global notification function
    window.showNotification = function(message, type = 'info') {
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
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    };
});
