// Main Chat Page JavaScript with Advanced Features
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const stopBtn = document.getElementById('stopBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const fileInput = document.getElementById('fileInput');
    const cameraInput = document.getElementById('cameraInput');
    const uploadPreview = document.getElementById('uploadPreview');
    const chatMessages = document.getElementById('chatMessages');
    const chatHistory = document.getElementById('chatHistory');
    const newChatBtn = document.getElementById('newChatBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const exportChatBtn = document.getElementById('exportChatBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.querySelector('.close-btn');

    // State variables
    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];
    let currentChatId = 'welcome';
    let chatWorker = null;
    let recognition = null;
    let isGenerating = false;

    // Initialize Web Worker
    function initWorker() {
        if (window.Worker) {
            try {
                chatWorker = new Worker('../js/worker.js');
                
                chatWorker.onmessage = function(e) {
                    const { action, result } = e.data;
                    
                    switch (action) {
                        case 'process':
                            handleAIResponse(result);
                            break;
                        case 'transcribe':
                            messageInput.value = result;
                            resizeTextarea();
                            break;
                        case 'error':
                            showNotification('Worker error: ' + result, 'error');
                            break;
                    }
                };
                
                chatWorker.onerror = function(error) {
                    console.error('Worker error:', error);
                    showNotification('Worker failed, using fallback', 'error');
                    chatWorker = null;
                };
            } catch (e) {
                console.warn('Web Worker not available:', e);
                chatWorker = null;
            }
        }
    }

    // Initialize voice recognition
    function initVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = document.getElementById('voiceInputSelect').value;

            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                if (chatWorker) {
                    chatWorker.postMessage({
                        action: 'transcribe',
                        data: transcript
                    });
                } else {
                    messageInput.value = transcript;
                    resizeTextarea();
                }
            };

            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                showNotification('Voice input failed: ' + event.error, 'error');
                voiceBtn.classList.remove('recording');
                isRecording = false;
            };

            recognition.onend = function() {
                voiceBtn.classList.remove('recording');
                isRecording = false;
            };
        }
    }

    // Event Listeners
    messageInput.addEventListener('input', resizeTextarea);
    messageInput.addEventListener('keydown', handleKeydown);
    sendBtn.addEventListener('click', sendMessage);
    stopBtn.addEventListener('click', stopGeneration);
    voiceBtn.addEventListener('click', toggleVoiceRecording);
    uploadBtn.addEventListener('click', triggerFileUpload);
    cameraBtn.addEventListener('click', triggerCamera);
    fileInput.addEventListener('change', handleFileUpload);
    cameraInput.addEventListener('change', handleCameraCapture);
    newChatBtn.addEventListener('click', startNewChat);
    clearHistoryBtn.addEventListener('click', clearChatHistory);
    settingsBtn.addEventListener('click', openSettings);
    exportChatBtn.addEventListener('click', exportChat);
    closeModalBtn.addEventListener('click', closeSettings);

    // Close modal when clicking outside
    settingsModal.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });

    // Settings change handlers
    document.getElementById('voiceInputSelect').addEventListener('change', function() {
        if (recognition) {
            recognition.lang = this.value;
        }
    });

    document.getElementById('themeSelect').addEventListener('change', function() {
        applyTheme(this.value);
    });

    // Initialize
    initWorker();
    initVoiceRecognition();
    loadChatHistory();
    applyTheme(localStorage.getItem('theme') || 'dark');

    // Functions
    function resizeTextarea() {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
    }

    function handleKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        const files = Array.from(uploadPreview.children);

        if ((!message && files.length === 0) || isGenerating) return;

        // Add user message to chat
        addMessageToChat(message, 'user', files);

        // Clear input and preview
        messageInput.value = '';
        uploadPreview.innerHTML = '';
        resizeTextarea();

        // Show stop button, hide send button
        sendBtn.style.display = 'none';
        stopBtn.style.display = 'flex';
        isGenerating = true;

        // Process with worker or direct API call
        processMessage(message, files);
    }

    function processMessage(message, files) {
        const payload = {
            message: message,
            files: files.map(file => file.dataset.type),
            chatId: currentChatId,
            model: document.getElementById('aiModelSelect').value
        };

        if (chatWorker) {
            chatWorker.postMessage({
                action: 'process',
                data: payload
            });
        } else {
            // Fallback to direct API call
            simulateAIResponse(message);
        }
    }

    function simulateAIResponse(message) {
        // Show typing indicator
        showTypingIndicator();

        // Simulate AI processing delay
        setTimeout(() => {
            removeTypingIndicator();
            
            const responses = [
                "I understand what you're asking about. Here's what I can tell you...",
                "That's an interesting question. Based on my knowledge...",
                "I can help you with that. Here's some information...",
                "Thanks for your message. Let me provide some details about that..."
            ];
            
            const response = responses[Math.floor(Math.random() * responses.length)];
            handleAIResponse(response);
        }, 2000);
    }

    function handleAIResponse(response) {
        addMessageToChat(response, 'ai');
        
        // Hide stop button, show send button
        stopBtn.style.display = 'none';
        sendBtn.style.display = 'flex';
        isGenerating = false;

        // Save to chat history
        saveChatHistory();
    }

    function stopGeneration() {
        if (chatWorker) {
            chatWorker.postMessage({ action: 'stop' });
        }
        
        // Hide stop button, show send button
        stopBtn.style.display = 'none';
        sendBtn.style.display = 'flex';
        isGenerating = false;

        // Add cancellation message
        addMessageToChat("Request cancelled by user.", 'ai');
    }

    function toggleVoiceRecording() {
        if (!recognition) {
            showNotification('Voice recognition not supported in your browser', 'error');
            return;
        }

        if (isRecording) {
            recognition.stop();
            voiceBtn.classList.remove('recording');
        } else {
            try {
                recognition.start();
                voiceBtn.classList.add('recording');
                isRecording = true;
            } catch (error) {
                console.error('Recognition start error:', error);
                showNotification('Cannot start voice recording', 'error');
            }
        }
    }

    function triggerFileUpload() {
        fileInput.click();
    }

    function triggerCamera() {
        cameraInput.click();
    }

    function handleFileUpload(e) {
        const files = e.target.files;
        if (!files.length) return;

        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showNotification('File too large: ' + file.name, 'error');
                return;
            }

            const previewItem = createPreviewItem(file);
            uploadPreview.appendChild(previewItem);
        });

        // Reset file input
        fileInput.value = '';
    }

    function handleCameraCapture(e) {
        const file = e.target.files[0];
        if (!file) return;

        const previewItem = createPreviewItem(file);
        uploadPreview.appendChild(previewItem);

        // Reset camera input
        cameraInput.value = '';
    }

    function createPreviewItem(file) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.dataset.type = file.type;
        item.dataset.name = file.name;

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            item.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.muted = true;
            item.appendChild(video);
        } else {
            const icon = document.createElement('div');
            icon.className = 'file-icon';
            icon.innerHTML = '<i class="fas fa-file"></i>';
            item.appendChild(icon);
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-preview';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => item.remove();
        item.appendChild(removeBtn);

        return item;
    }

    function addMessageToChat(content, type, files = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (type === 'ai') {
            avatar.innerHTML = '<img src="../assets/logo.png" alt="AI Avatar">';
        } else {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (content) {
            const text = document.createElement('p');
            text.textContent = content;
            contentDiv.appendChild(text);
        }

        // Add file previews if any
        if (files.length > 0) {
            const filesContainer = document.createElement('div');
            filesContainer.className = 'message-files';
            files.forEach(file => {
                const fileElement = file.cloneNode(true);
                filesContainer.appendChild(fileElement);
            });
            contentDiv.appendChild(filesContainer);
        }

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = new Date().toLocaleTimeString();

        contentDiv.appendChild(timeSpan);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Save to chat history
        saveChatHistory();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typingIndicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<img src="../assets/logo.png" alt="AI Avatar">';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(contentDiv);
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function startNewChat() {
        const newChatId = 'chat-' + Date.now();
        currentChatId = newChatId;
        
        // Clear chat messages
        chatMessages.innerHTML = '';
        
        // Add welcome message
        addMessageToChat("Hello! I'm Burme Mark, your AI assistant. How can I help you today?", 'ai');
        
        // Add to chat history
        addToChatHistory(newChatId, 'New Chat');
        
        // Update active chat
        updateActiveChat(newChatId);
    }

    function addToChatHistory(chatId, title) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chatId;
        
        chatItem.innerHTML = `
            <i class="fas fa-message"></i>
            <span>${title}</span>
            <button class="delete-chat-btn"><i class="fas fa-trash"></i></button>
        `;
        
        chatItem.querySelector('.delete-chat-btn').onclick = (e) => {
            e.stopPropagation();
            deleteChat(chatId);
        };
        
        chatItem.onclick = () => loadChat(chatId);
        
        chatHistory.insertBefore(chatItem, chatHistory.firstChild);
    }

    function loadChat(chatId) {
        // Implementation for loading chat from storage
        currentChatId = chatId;
        updateActiveChat(chatId);
        // Additional loading logic here
    }

    function deleteChat(chatId) {
        if (chatId === currentChatId) {
            startNewChat();
        }
        
        const chatItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
        if (chatItem) {
            chatItem.remove();
        }
        
        // Remove from storage
        localStorage.removeItem(`chat_${chatId}`);
    }

    function clearChatHistory() {
        if (!confirm('Are you sure you want to clear all chat history?')) return;
        
        // Clear UI
        chatHistory.innerHTML = '';
        
        // Clear storage (keep only current chat)
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('chat_') && key !== `chat_${currentChatId}`) {
                localStorage.removeItem(key);
            }
        });
        
        // Add default welcome chat
        addToChatHistory('welcome', 'Welcome to Burme Mark');
        updateActiveChat('welcome');
    }

    function updateActiveChat(chatId) {
        // Remove active class from all items
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current chat
        const activeItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    function saveChatHistory() {
        const chatData = {
            messages: Array.from(chatMessages.children).map(msg => ({
                type: msg.classList.contains('user-message') ? 'user' : 'ai',
                content: msg.querySelector('.message-content p')?.textContent || '',
                time: msg.querySelector('.message-time').textContent
            })),
            timestamp: Date.now()
        };
        
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(chatData));
    }

    function loadChatHistory() {
        // Load chat list from storage
        const keys = Object.keys(localStorage);
        const chatKeys = keys.filter(key => key.startsWith('chat_'));
        
        if (chatKeys.length === 0) {
            addToChatHistory('welcome', 'Welcome to Burme Mark');
        } else {
            chatKeys.forEach(key => {
                const chatId = key.replace('chat_', '');
                const chatData = JSON.parse(localStorage.getItem(key));
                const title = chatData.messages[0]?.content.substring(0, 20) + '...' || 'Chat';
                addToChatHistory(chatId, title);
            });
        }
        
        updateActiveChat(currentChatId);
    }

    function openSettings() {
        settingsModal.classList.add('active');
    }

    function closeSettings() {
        settingsModal.classList.remove('active');
    }

    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    function exportChat() {
        const chatData = {
            messages: Array.from(chatMessages.children).map(msg => ({
                type: msg.classList.contains('user-message') ? 'User' : 'AI',
                content: msg.querySelector('.message-content p')?.textContent || '',
                time: msg.querySelector('.message-time').textContent
            })),
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(chatData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `burme-mark-chat-${currentChatId}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Cloudflare Worker integration
    async function sendToCloudflareWorker(message, files) {
        try {
            const formData = new FormData();
            formData.append('message', message);
            formData.append('chatId', currentChatId);
            formData.append('model', document.getElementById('aiModelSelect').value);

            // Add files if any
            if (files.length > 0) {
                files.forEach((file, index) => {
                    // Note: This would need actual File objects, not just preview elements
                    // In a real impleme
