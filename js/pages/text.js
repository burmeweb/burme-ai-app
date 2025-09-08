// js/pages/text.js

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const promptInput = document.getElementById('prompt-input');
    const wordCount = document.querySelector('.word-count');
    const writingStyle = document.getElementById('writing-style');
    const textLength = document.getElementById('text-length');
    const tone = document.getElementById('tone');
    const generateBtn = document.getElementById('generate-btn');
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedOptions = document.getElementById('advanced-options');
    const temperature = document.getElementById('temperature');
    const tempValue = document.getElementById('temp-value');
    const maxTokens = document.getElementById('max-tokens');
    const tokenValue = document.getElementById('token-value');
    const avoidRepetition = document.getElementById('avoid-repetition');
    const includeExamples = document.getElementById('include-examples');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsContent = document.getElementById('results-content');
    const historyBtn = document.querySelector('.history-btn');
    const historyModal = document.getElementById('history-modal');
    const clearBtn = document.querySelector('.tool-btn[title="Clear text"]');
    const exampleBtn = document.querySelector('.tool-btn[title="Insert example"]');
    
    // Variables
    let generatedText = '';
    let currentPrompt = '';
    
    // Event Listeners
    promptInput.addEventListener('input', updateWordCount);
    advancedToggle.addEventListener('change', toggleAdvancedOptions);
    temperature.addEventListener('input', updateTemperatureValue);
    maxTokens.addEventListener('input', updateTokenValue);
    generateBtn.addEventListener('click', generateText);
    copyBtn.addEventListener('click', copyText);
    downloadBtn.addEventListener('click', downloadText);
    regenerateBtn.addEventListener('click', regenerateText);
    historyBtn.addEventListener('click', showHistory);
    clearBtn.addEventListener('click', clearPrompt);
    exampleBtn.addEventListener('click', insertExample);
    
    // Close modal when clicking on close button
    document.querySelector('.close-modal').addEventListener('click', () => {
        historyModal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.remove('active');
        }
    });
    
    // Functions
    function updateWordCount() {
        const text = promptInput.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        wordCount.textContent = `${words} words`;
    }
    
    function toggleAdvancedOptions() {
        advancedOptions.classList.toggle('active', advancedToggle.checked);
    }
    
    function updateTemperatureValue() {
        tempValue.textContent = temperature.value;
    }
    
    function updateTokenValue() {
        tokenValue.textContent = maxTokens.value;
    }
    
    function generateText() {
        currentPrompt = promptInput.value.trim();
        
        if (!currentPrompt) {
            alert('Please enter a prompt before generating text.');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        resultsContent.innerHTML = '';
        
        // Simulate API call (in a real app, this would be an actual API request)
        setTimeout(() => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            // Generate sample text based on prompt and options
            generatedText = generateSampleText(currentPrompt);
            
            // Display the generated text
            resultsContent.innerHTML = generatedText;
        }, 2000);
    }
    
    function generateSampleText(prompt) {
        const style = writingStyle.value;
        const length = textLength.value;
        const toneValue = tone.value;
        const creativity = parseFloat(temperature.value);
        
        // This is a simplified text generation for demonstration
        // In a real application, this would be replaced with an API call
        
        let text = '';
        
        // Introduction based on writing style
        if (style === 'creative') {
            text += `<p>In a world where ${prompt.toLowerCase()}, imagination knows no bounds. `;
        } else if (style === 'professional') {
            text += `<p>This analysis examines the concept of ${prompt.toLowerCase()} from a professional perspective. `;
        } else if (style === 'academic') {
            text += `<p>The scholarly discourse surrounding ${prompt.toLowerCase()} has evolved significantly in recent years. `;
        } else if (style === 'technical') {
            text += `<p>The technical specifications for ${prompt.toLowerCase()} require careful consideration of multiple parameters. `;
        } else {
            text += `<p>So, ${prompt.toLowerCase()} is something we should talk about. `;
        }
        
        // Add more content based on length
        if (length === 'short') {
            text += `The implications are fascinating and worth exploring. This brief examination highlights the key aspects that make this topic particularly relevant in today's context.</p>`;
        } else if (length === 'medium') {
            text += `The implications are multifaceted and complex. First, we must consider the historical context that has shaped our current understanding. Second, the contemporary applications demonstrate the practical relevance of this concept. Finally, future developments suggest even greater potential for innovation and growth in this area.</p>`;
            
            text += `<p>Furthermore, the relationship between ${prompt.toLowerCase()} and broader societal trends cannot be overlooked. As we navigate an increasingly interconnected world, these connections become ever more important to recognize and understand.</p>`;
        } else {
            text += `The implications are both profound and far-reaching. To fully appreciate the significance, we must begin with a historical overview of how this concept has evolved over time.</p>`;
            
            text += `<p>In the early stages, ${prompt.toLowerCase()} was primarily understood through limited frameworks that failed to capture its complexity. However, as research methodologies advanced, new dimensions began to emerge, revealing previously unrecognized patterns and relationships.</p>`;
            
            text += `<p>The contemporary landscape presents both challenges and opportunities. On one hand, technological advancements have enabled more sophisticated approaches to ${prompt.toLowerCase()}. On the other hand, ethical considerations require careful navigation to ensure responsible development and application.</p>`;
            
            text += `<p>Looking toward the future, several trends suggest exciting directions for further exploration. Interdisciplinary collaboration appears particularly promising, as insights from diverse fields can illuminate aspects that might otherwise remain obscured.</p>`;
            
            text += `<p>Ultimately, the study of ${prompt.toLowerCase()} reflects broader themes in our quest for knowledge and understanding. It demonstrates both the limitations of our current paradigms and the potential for breakthrough thinking that transcends traditional boundaries.</p>`;
        }
        
        // Add examples if requested
        if (includeExamples.checked) {
            text += `<h3>Examples</h3>`;
            text += `<ul>`;
            text += `<li>Example 1: A practical application of ${prompt.toLowerCase()} in everyday contexts</li>`;
            text += `<li>Example 2: How ${prompt.toLowerCase()} has been implemented in different industries</li>`;
            text += `<li>Example 3: Future possibilities for ${prompt.toLowerCase()} based on current trends</li>`;
            text += `</ul>`;
        }
        
        return text;
    }
    
    function copyText() {
        if (!generatedText) {
            alert('No text to copy. Please generate some text first.');
            return;
        }
        
        // Create a temporary element to copy from
        const tempElement = document.createElement('div');
        tempElement.innerHTML = generatedText;
        const textToCopy = tempElement.textContent || tempElement.innerText || '';
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Show success feedback
                const originalHtml = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = originalHtml;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy text to clipboard.');
            });
    }
    
    function downloadText() {
        if (!generatedText) {
            alert('No text to download. Please generate some text first.');
            return;
        }
        
        // Create a temporary element to extract text from
        const tempElement = document.createElement('div');
        tempElement.innerHTML = generatedText;
        const textToDownload = tempElement.textContent || tempElement.innerText || '';
        
        // Create a blob and download link
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function regenerateText() {
        if (!currentPrompt) {
            alert('No previous prompt found. Please enter a new prompt.');
            return;
        }
        
        generateText();
    }
    
    function showHistory() {
        historyModal.classList.add('active');
    }
    
    function clearPrompt() {
        promptInput.value = '';
        updateWordCount();
    }
    
    function insertExample() {
        const examples = [
            "Write a story about a robot who discovers human emotions",
            "Explain the concept of artificial intelligence in simple terms",
            "Create a product description for a new smartphone",
            "Describe the benefits of renewable energy sources",
            "Compose a persuasive essay on the importance of space exploration"
        ];
        
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        promptInput.value = randomExample;
        updateWordCount();
    }
    
    // Initialize range values display
    updateTemperatureValue();
    updateTokenValue();
});
