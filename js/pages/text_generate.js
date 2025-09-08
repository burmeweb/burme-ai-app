// Text Generate Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.querySelector('.generate-btn');
    const clearBtn = document.querySelector('.clear-btn');
    const copyBtn = document.querySelector('.copy-btn');
    const downloadBtn = document.querySelector('.download-btn');
    const textInput = document.querySelector('.generate-input textarea');
    const outputContent = document.querySelector('.output-content');
    const lengthSelector = document.querySelector('.length-selector select');
    
    // Option cards click handling
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function() {
            const option = this.querySelector('h3').textContent;
            setOptionTemplate(option);
        });
    });
    
    // Generate button
    if (generateBtn) {
        generateBtn.addEventListener('click', generateText);
    }
    
    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', clearInput);
    }
    
    // Copy button
    if (copyBtn) {
        copyBtn.addEventListener('click', copyOutput);
    }
    
    // Download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadOutput);
    }
    
    function setOptionTemplate(option) {
        const templates = {
            'Article Writing': 'Write a comprehensive article about...',
            'Social Media': 'Create an engaging social media post about...',
            'Email Content': 'Write a professional email about...',
            'Creative Writing': 'Write a creative story about...'
        };
        
        if (textInput && templates[option]) {
            textInput.value = templates[option];
            textInput.focus();
        }
    }
    
    function generateText() {
        if (!textInput || textInput.value.trim() === '') {
            showNotification('Please enter some text to generate content', 'warning');
            return;
        }
        
        const prompt = textInput.value.trim();
        const length = lengthSelector ? lengthSelector.value : 'Medium (300 words)';
        
        // Show loading state
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            generateBtn.disabled = true;
        }
        
        if (outputContent) {
            outputContent.innerHTML = '<p class="loading">Generating content...<br><i class="fas fa-spinner fa-spin"></i></p>';
        }
        
        // Simulate API call
        setTimeout(() => {
            // Simulated response based on prompt
            const generatedText = simulateTextGeneration(prompt, length);
            
            if (outputContent) {
                outputContent.innerHTML = `<p>${generatedText}</p>`;
            }
            
            // Reset button state
            if (generateBtn) {
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Text';
                generateBtn.disabled = false;
            }
            
            showNotification('Text generated successfully!', 'success');
        }, 2000);
    }
    
    function simulateTextGeneration(prompt, length) {
        // Simple text generation simulation
        const wordCount = length.includes('Short') ? 100 : length.includes('Long') ? 500 : 300;
        
        return `This is a generated text based on your prompt: "${prompt}". The AI has created approximately ${wordCount} words of content here. In a real application, this would be actual generated text from the AI model based on your input parameters and requirements. The content would be tailored to your specific needs and would reflect the style and tone appropriate for your requested use case.`;
    }
    
    function clearInput() {
        if (textInput) {
            textInput.value = '';
        }
        if (outputContent) {
            outputContent.innerHTML = '<p>Your generated content will appear here...</p>';
        }
    }
    
    function copyOutput() {
        if (!outputContent) return;
        
        const textToCopy = outputContent.textContent;
        if (textToCopy && textToCopy !== 'Your generated content will appear here...') {
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    showNotification('Content copied to clipboard!', 'success');
                })
                .catch(err => {
                    showNotification('Failed to copy content', 'error');
                    console.error('Copy failed:', err);
                });
        } else {
            showNotification('No content to copy', 'warning');
        }
    }
    
    function downloadOutput() {
        if (!outputContent) return;
        
        const textToDownload = outputContent.textContent;
        if (textToDownload && textToDownload !== 'Your generated content will appear here...') {
            const blob = new Blob([textToDownload], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated-content.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Content downloaded successfully!', 'success');
        } else {
            showNotification('No content to download', 'warning');
        }
    }
});
