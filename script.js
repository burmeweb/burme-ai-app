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
            const response = await fetch('https://burmemark-worker.mysvm.workers.dev', {
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
            addMessage('assistant', data.response || "I'm sorry, I couldn't process your request.");
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
    
    messageElement.innerHTML = `
        <div class="message-content">
            ${text}
            <div class="message-info">
                <span>${sender === 'user' ? 'You' : 'Assistant'}</span>
                <span>${timeString}</span>
            </div>
        </div>
    `;
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
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
    alert('File upload functionality would be implemented here');
});

// Voice button functionality
let isListening = false;
voiceBtn.addEventListener('click', () => {
    if (!isListening) {
        isListening = true;
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        voiceBtn.style.color = 'var(--error)';
        alert('Voice recognition started. Speak now...');
    } else {
        isListening = false;
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.style.color = '';
        alert('Voice recognition stopped');
    }
});

// Initialize with welcome message
window.addEventListener('load', () => {
    setTimeout(() => {
        addMessage('assistant', 'Hello! How can I assist you today?');
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