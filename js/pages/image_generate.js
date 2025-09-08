// Image Generate Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.querySelector('.generate-image-btn');
    const promptInput = document.getElementById('prompt-input');
    const styleButtons = document.querySelectorAll('.style-btn');
    const sizeButtons = document.querySelectorAll('.size-btn');
    const galleryContainer = document.querySelector('.gallery-container');
    
    let selectedStyle = 'Realistic';
    let selectedSize = '768×768';
    
    // Style buttons selection
    styleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            styleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedStyle = this.textContent;
        });
    });
    
    // Size buttons selection
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            sizeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedSize = this.textContent;
        });
    });
    
    // Generate button
    if (generateBtn) {
        generateBtn.addEventListener('click', generateImage);
    }
    
    // Enter key to generate
    if (promptInput) {
        promptInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateImage();
            }
        });
    }
    
    function generateImage() {
        if (!promptInput || promptInput.value.trim() === '') {
            showNotification('Please describe the image you want to generate', 'warning');
            return;
        }
        
        const prompt = promptInput.value.trim();
        
        // Show loading state
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            generateBtn.disabled = true;
        }
        
        // Simulate API call
        setTimeout(() => {
            // Simulate image generation
            const imageItem = createImageItem(prompt, selectedStyle, selectedSize);
            
            if (galleryContainer) {
                // Clear placeholder if it exists
                const placeholder = galleryContainer.querySelector('.image-placeholder');
                if (placeholder) {
                    galleryContainer.innerHTML = '';
                }
                
                galleryContainer.appendChild(imageItem);
            }
            
            // Reset button state
            if (generateBtn) {
                generateBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate Image';
                generateBtn.disabled = false;
            }
            
            showNotification('Image generated successfully!', 'success');
        }, 3000);
    }
    
    function createImageItem(prompt, style, size) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        // In a real app, this would be an actual image URL from the AI service
        // For simulation, we're using a placeholder
        item.innerHTML = `
            <div class="image-placeholder">
                <i class="fas fa-image"></i>
                <p>Generated Image Preview</p>
            </div>
            <div class="image-info">
                <h4>${prompt.substring(0, 20)}${prompt.length > 20 ? '...' : ''}</h4>
                <p>${style} • ${size}</p>
                <div class="image-actions">
                    <button class="action-btn download-img-btn">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="action-btn regenerate-btn">
                        <i class="fas fa-sync"></i> Regenerate
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to the buttons
        const downloadBtn = item.querySelector('.download-img-btn');
        const regenerateBtn = item.querySelector('.regenerate-btn');
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => downloadImage(prompt));
        }
        
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                promptInput.value = prompt;
                generateImage();
            });
        }
        
        return item;
    }
    
    function downloadImage(prompt) {
        // In a real app, this would download the actual generated image
        // For simulation, we'll show a notification
        showNotification('Image download started!', 'success');
        
        // Simulate download process
        setTimeout(() => {
            showNotification('Image downloaded successfully!', 'success');
        }, 1500);
    }
    
    // Initialize with first style and size selected
    if (styleButtons.length > 0) {
        styleButtons[0].classList.add('active');
    }
    if (sizeButtons.length > 0) {
        sizeButtons[1].classList.add('active'); // Select 768×768 by default
    }
});
