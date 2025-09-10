// DOM Elements
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const newChatBtn = document.getElementById('newChatBtn');
const clearBtn = document.getElementById('clearBtn');
const chatList = document.getElementById('chatList');
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const uploadBtn = document.getElementById('uploadBtn');
const voiceBtn = document.getElementById('voiceBtn');

// Worker endpoint URLs - တစ်ခုတည်းသော BASE_URL ကိုပဲသုံးပါ
const WORKER_BASE_URL = "https://burmemark-worker.mysvm.workers.dev";
const CHAT_API_ENDPOINT = `${WORKER_BASE_URL}/chat`;
const IMAGE_API_ENDPOINT = `${WORKER_BASE_URL}/generate-image`;
const ASSISTANT_API_ENDPOINT = `${WORKER_BASE_URL}/assistants/chat`;

// Toggle sidebar on mobile
menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Create a new chat
newChatBtn.addEventListener('click', () => {
    // Clear active class from all chat items
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Create new chat item
    const newChatItem = document.createElement('li');
    newChatItem.className = 'chat-item active';
    newChatItem.textContent = 'New Chat ' + (chatList.children.length + 1);
    
    // Add to the top of the list
    chatList.insertBefore(newChatItem, chatList.firstChild);
    
    // Clear chat box
    chatBox.innerHTML = '';
    
    // Focus on input
    messageInput.focus();
    
    // Show welcome message
    addMessage('assistant', 'Hello! How can I assist you today?');
});

// Clear conversations
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all conversations?')) {
        // Keep only the first 4 default chats
        while (chatList.children.length > 4) {
            chatList.removeChild(chatList.lastChild);
        }
        
        // Clear active class from all items
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Clear chat box
        chatBox.innerHTML = '';
        
        // Show welcome message
        addMessage('assistant', 'All conversations have been cleared. How can I help you?');
    }
});

// Send message function
async function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        // Add user message
        addMessage('user', message);
        
        // Clear input
        messageInput.value = '';
        
        // Check for special commands
        if (message.startsWith('/image ')) {
            const prompt = message.substring(7);
            if (prompt) {
                await generateImage(prompt);
            }
            return;
        }
        
        if (message.startsWith('/code ')) {
            const prompt = message.substring(6);
            if (prompt) {
                await generateCode(prompt);
            }
            return;
        }
        
        // Show typing indicator
        const typingIndicator = addTypingIndicator();
        
        try {
            // Call the external API for AI response
            const response = await fetch(CHAT_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Remove typing indicator
            removeTypingIndicator(typingIndicator);
            
            // Add AI response
            addMessage('assistant', data.response || data.message || data.error || "I'm sorry, I couldn't process your request.");
        } catch (error) {
            console.error('Error fetching AI response:', error);
            
            // Remove typing indicator
            removeTypingIndicator(typingIndicator);
            
            // Add error message
            addMessage('assistant', "I'm having trouble connecting to the server. Please try again later.");
        }
    }
}

// Add typing indicator
function addTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message assistant typing';
    typingIndicator.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingIndicator;
}

// Remove typing indicator
function removeTypingIndicator(typingIndicator) {
    if (typingIndicator && typingIndicator.parentNode) {
        chatBox.removeChild(typingIndicator);
    }
}

// Add message to chat
function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if text contains image data URL
    let contentHtml = text;
    if (text.startsWith('data:image/')) {
        contentHtml = `<img src="${text}" alt="Generated image" style="max-width: 100%; border-radius: 8px; margin-top: 8px;">`;
    } else if (text.includes('```')) {
        // Format code blocks with syntax highlighting
        contentHtml = formatCodeBlocks(text);
    } else {
        // Convert URLs to clickable links
        contentHtml = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        // Convert line breaks to <br>
        contentHtml = contentHtml.replace(/\n/g, '<br>');
    }
    
    messageElement.innerHTML = `
        <div class="message-content">
            ${contentHtml}
            <div class="message-info">
                <span>${sender === 'user' ? 'You' : 'Assistant'}</span>
                <span>${timeString}</span>
            </div>
        </div>
    `;
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Apply syntax highlighting if code blocks are present
    if (text.includes('```')) {
        setTimeout(() => {
            document.querySelectorAll('pre code').forEach((block) => {
                if (typeof hljs !== 'undefined') {
                    hljs.highlightBlock(block);
                }
            });
        }, 100);
    }
}

// Format code blocks with syntax highlighting
function formatCodeBlocks(text) {
    return text.replace(/```(\w+)?\s([\s\S]*?)```/g, (match, language, code) => {
        const langClass = language ? `language-${language}` : '';
        return `
            <div class="code-block">
                <div class="code-header">
                    <span>${language || 'code'}</span>
                    <button class="copy-code-btn" onclick="copyCodeToClipboard(this)">Copy</button>
                </div>
                <pre><code class="${langClass}">${escapeHtml(code.trim())}</code></pre>
            </div>
        `;
    });
}

// Escape HTML special characters
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Copy code to clipboard
function copyCodeToClipboard(button) {
    const codeBlock = button.parentElement.nextElementSibling;
    const codeText = codeBlock.textContent;
    
    navigator.clipboard.writeText(codeText).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Generate image from text
async function generateImage(prompt) {
    if (!prompt) return;
    
    // Show typing indicator for image generation
    const typingIndicator = addTypingIndicator();
    typingIndicator.querySelector('.typing-indicator').innerHTML = '<span>Generating image...</span>';
    
    try {
        // Call the image generation API
        const response = await fetch(IMAGE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt, output_format: "webp" })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        // Add image response
        if (data.image) {
            addMessage('assistant', data.image);
        } else if (data.image_url) {
            addMessage('assistant', data.image_url);
        } else {
            addMessage('assistant', data.message || data.error || "I couldn't generate an image for that prompt.");
        }
    } catch (error) {
        console.error('Error generating image:', error);
        
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        // Add error message
        addMessage('assistant', "I'm having trouble connecting to the image generation service.");
    }
}

// Generate code from text - Using assistant endpoint for code generation
async function generateCode(prompt) {
    if (!prompt) return;
    
    // Show typing indicator for code generation
    const typingIndicator = addTypingIndicator();
    typingIndicator.querySelector('.typing-indicator').innerHTML = '<span>Generating code...</span>';
    
    try {
        // Use assistant endpoint for code generation
        const response = await fetch(ASSISTANT_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: `Please generate code for: ${prompt}. Provide the code in a code block.`,
                assistant_id: "math-tutor" // You can change this to your preferred assistant ID
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        // Add code response
        if (data.response) {
            addMessage('assistant', data.response);
        } else {
            addMessage('assistant', data.message || data.error || "I couldn't generate code for that prompt.");
        }
    } catch (error) {
        console.error('Error generating code:', error);
        
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        // Add error message
        addMessage('assistant', "I'm having trouble connecting to the code generation service.");
    }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Upload button functionality
uploadBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*, .txt, .pdf, .js, .py, .java, .html, .css';
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                if (file.type.startsWith('image/')) {
                    // For images, display them
                    addMessage('user', `Uploaded image: ${file.name}`);
                    addMessage('assistant', `I see you uploaded an image. How would you like me to help with this image?`);
                } else {
                    // For text files, send as message
                    const truncatedContent = content.length > 1000 ? content.substring(0, 1000) + '...' : content;
                    messageInput.value = `Please analyze this ${file.name} file:\n\n${truncatedContent}`;
                }
            };
            
            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        }
    };
    
    fileInput.click();
});

// Voice button functionality
let isListening = false;
let recognition = null;

// Check if browser supports Web Speech API
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript;
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        updateVoiceButton(false);
    };
    
    recognition.onend = () => {
        updateVoiceButton(false);
    };
}

function updateVoiceButton(listening) {
    isListening = listening;
    voiceBtn.innerHTML = listening ? '<i class="fas fa-stop"></i>' : '<i class="fas fa-microphone"></i>';
    voiceBtn.style.color = listening ? 'var(--error)' : '';
}

voiceBtn.addEventListener('click', () => {
    if (!recognition) {
        alert('Your browser does not support voice recognition.');
        return;
    }
    
    if (!isListening) {
        recognition.start();
        updateVoiceButton(true);
    } else {
        recognition.stop();
        updateVoiceButton(false);
    }
});

// Initialize with welcome message
window.addEventListener('load', () => {
    setTimeout(() => {
        addMessage('assistant', 'Hello! How can I assist you today? You can:\n- Ask me anything\n- Type "/image prompt" to generate images\n- Type "/code prompt" to generate code\n- Upload files for analysis');
    }, 500);
    
    // Load highlight.js for code syntax highlighting if available
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth < 768 && 
        !sidebar.contains(e.target) && 
        !menuBtn.contains(e.target) && 
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

// Prevent sidebar from closing when clicking inside it
sidebar.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Auto-scroll to bottom when new messages are added
const observer = new MutationObserver(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
});

observer.observe(chatBox, { childList: true });

// Add CSS for code blocks
const style = document.createElement('style');
style.textContent = `
    .code-block {
        background: var(--code-bg, #f8f9fa);
        border-radius: 8px;
        margin: 8px 0;
        overflow: hidden;
        border: 1px solid var(--border-color, #e9ecef);
    }
    
    .code-header {
        background: var(--sidebar-bg, #2d3748);
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--text-secondary, #a0aec0);
    }
    
    .copy-code-btn {
        background: var(--primary, #4299e1);
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        transition: background 0.2s;
    }
    
    .copy-code-btn:hover {
        background: var(--primary-dark, #3182ce);
    }
    
    pre {
        margin: 0;
        padding: 12px;
        overflow-x: auto;
        background: var(--code-bg, #f8f9fa);
    }
    
    code {
        font-family: 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .hljs {
        background: transparent !important;
    }
    
    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .typing-indicator span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-secondary);
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typing {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
    }
    
    a {
        color: var(--primary);
        text-decoration: underline;
    }
    
    a:hover {
        color: var(--primary-dark);
    }
`;

document.head.appendChild(style);

// Make functions available globally for onclick handlers
window.copyCodeToClipboard = copyCodeToClipboard;
window.sendMessage = sendMessage;
