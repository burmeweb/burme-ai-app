// Preview Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const searchInputs = document.querySelectorAll('.search-box input');
    const filterSelects = document.querySelectorAll('.filter-options select');
    const viewButtons = document.querySelectorAll('.view-btn');
    const editButtons = document.querySelectorAll('.edit-btn');
    const copyButtons = document.querySelectorAll('.copy-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const downloadImgButtons = document.querySelectorAll('.download-img-btn');
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
            
            // Update URL hash
            window.location.hash = tabId;
        });
    });
    
    // Check URL hash for initial tab
    if (window.location.hash) {
        const tabId = window.location.hash.substring(1);
        const tabButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
    
    // Search functionality
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const tabId = this.closest('.tab-content').id.replace('-tab', '');
            filterContent(tabId, this.value.toLowerCase());
        });
    });
    
    // Filter functionality
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            const tabId = this.closest('.tab-content').id.replace('-tab', '');
            filterContent(tabId, '', this.value);
        });
    });
    
    // Action buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.text-item, .code-item');
            const title = item.querySelector('h3').textContent;
            showPreviewModal(title, item);
        });
    });
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.text-item');
            const content = item.querySelector('.item-preview').textContent;
            showEditModal(content);
        });
    });
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.text-item, .code-item');
            let content = '';
            
            if (item.classList.contains('text-item')) {
                content = item.querySelector('.item-preview').textContent;
            } else if (item.classList.contains('code-item')) {
                content = item.querySelector('code').textContent;
            }
            
            navigator.clipboard.writeText(content)
                .then(() => {
                    showNotification('Content copied to clipboard!', 'success');
                })
                .catch(err => {
                    showNotification('Failed to copy content', 'error');
                    console.error('Copy failed:', err);
                });
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.text-item, .code-item, .gallery-item');
            const title = item.querySelector('h3, h4').textContent;
            
            if (confirm(`Are you sure you want to delete "${title}"?`)) {
                item.style.opacity = '0';
                setTimeout(() => {
                    item.remove();
                    showNotification('Item deleted successfully', 'success');
                    checkEmptyState();
                }, 300);
            }
        });
    });
    
    downloadImgButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.gallery-item');
            const title = item.querySelector('h4').textContent;
            showNotification(`Downloading "${title}"...`, 'info');
            
            // Simulate download
            setTimeout(() => {
                showNotification('Image downloaded successfully!', 'success');
            }, 1500);
        });
    });
    
    function filterContent(tabId, searchTerm = '', filterValue = 'all') {
        const items = document.querySelectorAll(`#${tabId}-tab .text-item, #${tabId}-tab .code-item, #${tabId}-tab .gallery-item`);
        let hasVisibleItems = false;
        
        items.forEach(item => {
            let matchesSearch = true;
            let matchesFilter = true;
            
            // Apply search filter
            if (searchTerm) {
                const textContent = item.textContent.toLowerCase();
                matchesSearch = textContent.includes(searchTerm);
            }
            
            // Apply type filter (for text items)
            if (filterValue !== 'all' && item.classList.contains('text-item')) {
                const itemType = item.querySelector('h3').textContent.toLowerCase();
                matchesFilter = itemType.includes(filterValue.toLowerCase());
            }
            
            // Apply style filter (for image items)
            if (filterValue !== 'all' && item.classList.contains('gallery-item')) {
                const itemStyle = item.querySelector('p').textContent.toLowerCase();
                matchesFilter = itemStyle.includes(filterValue.toLowerCase());
            }
            
            // Apply language filter (for code items)
            if (filterValue !== 'all' && item.classList.contains('code-item')) {
                const itemLang = item.querySelector('.item-lang').textContent.toLowerCase();
                matchesFilter = itemLang.includes(filterValue.toLowerCase());
            }
            
            if (matchesSearch && matchesFilter) {
                item.style.display = '';
                hasVisibleItems = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show empty state if no items match
        const emptyState = document.querySelector(`#${tabId}-tab .empty-state`);
        if (!hasVisibleItems) {
            if (!emptyState) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-state';
                emptyMessage.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #a5b4fc;">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>No items found matching your criteria</p>
                    </div>
                `;
                document.querySelector(`#${tabId}-tab > div:last-child`).appendChild(emptyMessage);
            }
        } else if (emptyState) {
            emptyState.remove();
        }
    }
    
    function showPreviewModal(title, contentElement) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        `;
        
        // Modal content
        modal.innerHTML = `
            <div style="background: #1a1a2e; border-radius: 10px; padding: 25px; max-width: 80%; max-height: 80%; overflow: auto; position: relative;">
                <button style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 20px; cursor: pointer;">&times;</button>
                <h2 style="margin-bottom: 20px; color: white;">${title}</h2>
                <div class="modal-content">
                    ${contentElement.innerHTML}
                </div>
            </div>
        `;
        
        // Close button functionality
        const closeButton = modal.querySelector('button');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        document.body.appendChild(modal);
    }
    
    function showEditModal(content) {
        // Create edit modal
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        `;
        
        // Modal content
        modal.innerHTML = `
            <div style="background: #1a1a2e; border-radius: 10px; padding: 25px; width: 80%; max-width: 600px; position: relative;">
                <button style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 20px; cursor: pointer;">&times;</button>
                <h2 style="margin-bottom: 20px; color: white;">Edit Content</h2>
                <textarea style="width: 100%; min-height: 200px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 5px; padding: 15px; color: white; margin-bottom: 20px; resize: vertical;">${content}</textarea>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="cancel-btn" style="padding: 10px 20px; background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 5px; cursor: pointer;">Cancel</button>
                    <button class="save-btn" style="padding: 10px 20px; background: #4361ee; color: white; border: none; border-radius: 5px; cursor: pointer;">Save Changes</button>
                </div>
            </div>
        `;
        
        // Close button functionality
        const closeButton = modal.querySelector('button');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Cancel button
        const cancelButton = modal.querySelector('.cancel-btn');
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Save button
        const saveButton = modal.querySelector('.save-btn');
        const textarea = modal.querySelector('textarea');
        saveButton.addEventListener('click', () => {
            showNotification('Content updated successfully!', 'success');
            document.body.removeChild(modal);
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        document.body.appendChild(modal);
        textarea.focus();
    }
    
    function checkEmptyState() {
        // Check if any tab is empty and show appropriate message
        const tabs = ['text', 'images', 'code'];
        
        tabs.forEach(tabId => {
            const items = document.querySelectorAll(`#${tabId}-tab .text-item, #${tabId}-tab .code-item, #${tabId}-tab .gallery-item`);
            const emptyState = document.querySelector(`#${tabId}-tab .empty-state`);
            
            if (items.length === 0 && !emptyState) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-state';
                emptyMessage.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #a5b4fc;">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>No ${tabId} content available yet</p>
                        <p style="font-size: 0.9rem; margin-top: 10px;">Create some content to see it here</p>
                    </div>
                `;
                document.querySelector(`#${tabId}-tab > div:last-child`).appendChild(emptyMessage);
            }
        });
    }
    
    // Initialize empty state check
    checkEmptyState();
});
