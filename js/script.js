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

// Worker endpoint URLs
const CHAT_API_ENDPOINT = "https://burmemark-worker.mysvm.workers.dev/api/chat";
const IMAGE_API_ENDPOINT = "https://burmemark-worker.mysvm.workers.dev/api/image";

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
        
        // Show typing indicator
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
        
        try {
            // Call the external API for AI response
            const response = await fetch(CHAT_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            chatBox.removeChild(typingIndicator);
            
            // Add AI response
            addMessage('assistant', data.response || data.message || "I'm sorry, I couldn't process your request.");
        } catch (error) {
            console.error('Error fetching AI response:', error);
            
            // Remove typing indicator
            chatBox.removeChild(typingIndicator);
            
            // Add error message
            addMessage('assistant', "I'm having trouble connecting to the server. Please try again later.");
        }
    }
}

// Add message to chat
function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if text contains image URL (simple check)
    let contentHtml = text;
    if (text.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
        contentHtml = `<img src="${text}" alt="Generated image" style="max-width: 100%; border-radius: 8px; margin-top: 8px;">`;
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
}

// Generate image from text
async function generateImage(prompt) {
    if (!prompt) return;
    
    // Show typing indicator for image generation
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message assistant typing';
    typingIndicator.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span>Generating image...</span>
            </div>
        </div>
    `;
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        // Call the image generation API
        const response = await fetch(IMAGE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        chatBox.removeChild(typingIndicator);
        
        // Add image response
        if (data.image_url) {
            addMessage('assistant', data.image_url);
        } else {
            addMessage('assistant', data.message || "I couldn't generate an image for that prompt.");
        }
    } catch (error) {
        console.error('Error generating image:', error);
        
        // Remove typing indicator
        chatBox.removeChild(typingIndicator);
        
        // Add error message
        addMessage('assistant', "I'm having trouble connecting to the image generation service.");
    }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Upload button functionality
uploadBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*, .txt, .pdf';
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            alert(`File "${file.name}" selected. Upload functionality would be implemented here.`);
            // Here you would typically upload the file and process it
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
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.style.color = '';
        isListening = false;
    };
    
    recognition.onend = () => {
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.style.color = '';
        isListening = false;
    };
}

voiceBtn.addEventListener('click', () => {
    if (!recognition) {
        alert('Your browser does not support voice recognition.');
        return;
    }
    
    if (!isListening) {
        isListening = true;
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        voiceBtn.style.color = 'var(--error)';
        recognition.start();
    } else {
        isListening = false;
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.style.color = '';
        recognition.stop();
    }
});

// Initialize with welcome message
window.addEventListener('load', () => {
    setTimeout(() => {
        addMessage('assistant', 'Hello! How can I assist you today? You can ask me anything or type "/image" followed by a description to generate an image.');
    }, 500);
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

// Handle special commands
messageInput.addEventListener('input', (e) => {
    const text = e.target.value;
    if (text.startsWith('/image ')) {
        // You could show a hint that this will generate an image
    }
});

// Override sendMessage to handle special commands
const originalSendMessage = sendMessage;
sendMessage = async function() {
    const message = messageInput.value.trim();
    
    if (message.startsWith('/image ')) {
        const prompt = message.substring(7); // Remove "/image " prefix
        if (prompt) {
            addMessage('user', message);
            messageInput.value = '';
            await generateImage(prompt);
        }
        return;
    }
    
    // Handle other commands or normal messages
    originalSendMessage();
};
