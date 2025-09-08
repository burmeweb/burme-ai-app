// Main Chat Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Chat functionality
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input textarea');
    const sendButton = document.querySelector('.send-btn');
    const newChatBtn = document.querySelector('.new-chat-btn');
    
    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        
        // Send message on Enter (but allow Shift+Enter for new line)
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Send button click handler
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // New chat button
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
    
    // Chat option buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const option = this.textContent.trim();
            // Add predefined message based on option
            const messages = {
                'Image': 'Can you generate an image of...',
                'Code': 'Can you help me with this code...',
                'Suggest': 'Can you suggest some...'
            };
            
            if (chatInput) {
                chatInput.value = messages[option] || 'Can you help me with...';
                chatInput.focus();
                chatInput.dispatchEvent(new Event('input'));
            }
        });
    });
    
    // Chat history items
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            document.querySelectorAll('.chat-item').forEach(i => {
                i.classList.remove('active');
            });
            // Add active class to clicked item
            this.classList.add('active');
            // Load chat history (simulated)
            loadChatHistory(this.dataset.chatId);
        });
    });
    
    function sendMessage() {
        if (!chatInput || chatInput.value.trim() === '') return;
        
        const message = chatInput.value.trim();
        addMessageToChat(message, 'user');
        
        // Clear input and reset height
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        // Simulate AI response
        setTimeout(() => {
            simulateAIResponse(message);
        }, 1000);
    }
    
    function addMessageToChat(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        
        if (chatMessages) {
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    function simulateAIResponse(userMessage) {
        // Simple response simulation
        const responses = [
            "I understand what you're asking about. Here's what I can tell you...",
            "That's an interesting question. Based on my knowledge...",
            "I can help you with that. Here's some information...",
            "Thanks for your message. Let me provide some details about that..."
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        addMessageToChat(response, 'ai');
    }
    
    function startNewChat() {
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        if (chatInput) {
            chatInput.value = '';
            chatInput.style.height = 'auto';
        }
        
        // Add welcome message
        addMessageToChat("Hello! I'm Burme Mark, your AI assistant. How can I help you today?", 'ai');
        
        // Update chat history active item
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
    }
    
    function loadChatHistory(chatId) {
        // Simulate loading chat history
        if (chatMessages) {
            chatMessages.innerHTML = '';
            addMessageToChat("Loading your previous conversation...", 'ai');
            
            setTimeout(() => {
                chatMessages.innerHTML = '';
                addMessageToChat("Here's our previous conversation about this topic.", 'ai');
                // In a real app, you would load actual message history here
            }, 500);
        }
    }
    
    // Initialize with welcome message
    if (!document.querySelector('.ai-message')) {
        addMessageToChat("Hello! I'm Burme Mark, your AI assistant. How can I help you today?", 'ai');
    }
});
