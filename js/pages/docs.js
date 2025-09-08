// Documentation Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const docsItems = document.querySelectorAll('.docs-item');
    const docsSections = document.querySelectorAll('.docs-section');
    const faqItems = document.querySelectorAll('.faq-item');
    
    // Smooth scrolling for documentation navigation
    docsItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.querySelector('a').getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Update active navigation item
                docsItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL hash
                window.location.hash = targetId;
            }
        });
    });
    
    // FAQ toggle functionality
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        const answer = item.querySelector('p');
        
        // Initially hide answers
        answer.style.display = 'none';
        
        question.style.cursor = 'pointer';
        question.addEventListener('click', () => {
            const isVisible = answer.style.display === 'block';
            answer.style.display = isVisible ? 'none' : 'block';
            question.querySelector('i').className = isVisible ? 
                'fas fa-chevron-down' : 'fas fa-chevron-up';
        });
        
        // Add chevron icon to questions
        question.innerHTML = `<i class="fas fa-chevron-down"></i> ${question.textContent}`;
    });
    
    // Highlight current section in navigation while scrolling
    function updateActiveNavItem() {
        const scrollPosition = window.scrollY + 100;
        
        docsSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                docsItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.querySelector('a').getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Check URL hash on load
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetSection = document.getElementById(targetId);
        const targetNavItem = document.querySelector(`.docs-item a[href="#${targetId}"]`).parentElement;
        
        if (targetSection && targetNavItem) {
            docsItems.forEach(item => item.classList.remove('active'));
            targetNavItem.classList.add('active');
            
            setTimeout(() => {
                targetSection.scrollIntoView();
            }, 100);
        }
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', updateActiveNavItem);
    
    // Initialize code syntax highlighting for API examples
    function highlightCodeExamples() {
        const codeElements = document.querySelectorAll('.api-endpoint code');
        codeElements.forEach(code => {
            code.innerHTML = code.textContent
                .replace(/(POST|GET|PUT|DELETE)\s+(\/api\/[^\s]+)/g, '<span class="http-method">$1</span> <span class="endpoint">$2</span>');
        });
    }
    
    // Add copy functionality to code examples
    function addCopyButtons() {
        const codeExamples = document.querySelectorAll('.api-endpoint, pre code');
        
        codeExamples.forEach(example => {
            const button = document.createElement('button');
            button.className = 'copy-code-btn';
            button.innerHTML = '<i class="fas fa-copy"></i>';
            button.title = 'Copy code';
            
            button.addEventListener('click', () => {
                const code = example.querySelector('code') || example;
                navigator.clipboard.writeText(code.textContent)
                    .then(() => {
                        showNotification('Code copied to clipboard!', 'success');
                    })
                    .catch(err => {
                        showNotification('Failed to copy code', 'error');
                        console.error('Copy failed:', err);
                    });
            });
            
            if (example.classList.contains('api-endpoint')) {
                example.style.position = 'relative';
                button.style.position = 'absolute';
                button.style.top = '10px';
                button.style.right = '10px';
                example.appendChild(button);
            } else {
                example.parentElement.style.position = 'relative';
                button.style.position = 'absolute';
                button.style.top = '5px';
                button.style.right = '5px';
                example.parentElement.appendChild(button);
            }
        });
    }
    
    // Initialize documentation features
    highlightCodeExamples();
    addCopyButtons();
    updateActiveNavItem(); // Set initial active state
    
    // Responsive navigation for mobile
    function handleMobileNav() {
        const docsSidebar = document.querySelector('.docs-sidebar');
        const docsContent = document.querySelector('.docs-content');
        
        if (window.innerWidth < 769) {
            // Make sidebar items clickable to show content
            docsItems.forEach(item => {
                item.addEventListener('click', function() {
                    docsContent.scrollIntoView({ behavior: 'smooth' });
                });
            });
        }
    }
    
    // Handle mobile navigation
    handleMobileNav();
    window.addEventListener('resize', handleMobileNav);
    
    // Add search functionality for documentation
    function addSearchFunctionality() {
        const searchContainer = document.createElement('div');
        searchContainer.style.padding = '15px 25px';
        searchContainer.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        
        searchContainer.innerHTML = `
            <div style="position: relative;">
                <input type="text" placeholder="Search documentation..." 
                    style="width: 100%; padding: 10px 15px 10px 40px; 
                    background: rgba(255, 255, 255, 0.05); 
                    border: 1px solid rgba(255, 255, 255, 0.1); 
                    border-radius: 5px; color: white;">
                <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; 
                    transform: translateY(-50%); color: #a5b4fc;"></i>
            </div>
        `;
        
        const docsSidebar = document.querySelector('.docs-sidebar');
        docsSidebar.insertBefore(searchContainer, docsSidebar.querySelector('h3').nextSibling);
        
        const searchInput = searchContainer.querySelector('input');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm.length > 2) {
                // Highlight matching text in documentation
                docsSections.forEach(section => {
                    const text = section.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        section.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
                        setTimeout(() => {
                            section.style.backgroundColor = '';
                        }, 2000);
                    }
                });
                
                // Highlight matching navigation items
                docsItems.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        item.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
                    } else {
                        item.style.backgroundColor = '';
                    }
                });
            } else {
                // Reset highlights
                docsItems.forEach(item => {
                    item.style.backgroundColor = '';
                });
            }
        });
    }
    
    // Initialize search functionality
    addSearchFunctionality();
});
