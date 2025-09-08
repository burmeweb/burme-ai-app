document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const voiceInputBtn = document.getElementById('voice-input-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const imageGenBtn = document.getElementById('image-gen-btn');
    const codeGenBtn = document.getElementById('code-gen-btn');
    const uploadModal = document.getElementById('upload-modal');
    const voiceModal = document.getElementById('voice-modal');
    const loading = document.getElementById('loading');
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const uploadedFiles = document.getElementById('uploaded-files');
    const recordVoiceBtn = document.getElementById('record-voice');
    const voiceStatus = document.getElementById('voice-status');
    const cancelUploadBtn = document.getElementById('cancel-upload');
    const confirmUploadBtn = document.getElementById('confirm-upload');
    const cancelVoiceBtn = document.getElementById('cancel-voice');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const copyCodeBtn = document.getElementById('copy-code-btn');
    
    // State variables
    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];
    let uploadedFilesList = [];
    
    // API Base URL - Cloudflare Worker URL
    const API_BASE = 'https://burmemark-worker.mysvm.workers.dev';
    
    // Event Listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    voiceInputBtn.addEventListener('click', openVoiceModal);
    uploadBtn.addEventListener('click', openUploadModal);
    imageGenBtn.addEventListener('click', () => sendSpecialMessage('image'));
    codeGenBtn.addEventListener('click', () => sendSpecialMessage('code'));
    
    // Modal controls
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
    
    cancelUploadBtn.addEventListener('click', closeAllModals);
    confirmUploadBtn.addEventListener('click', processUploadedFiles);
    cancelVoiceBtn.addEventListener('click', closeAllModals);
    recordVoiceBtn.addEventListener('click', toggleRecording);
    
    // File upload handling
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#4361ee';
        uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.style.borderColor = '#ced4da';
        uploadArea.style.backgroundColor = 'transparent';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#ced4da';
        uploadArea.style.backgroundColor = 'transparent';
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    // Copy code button
    copyCodeBtn.addEventListener('click', function() {
        const codeElement = document.querySelector('.code-preview code');
        navigator.clipboard.writeText(codeElement.textContent)
            .then(() => {
                const originalHtml = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = originalHtml;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy code: ', err);
            });
    });
    
    // Functions
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        addMessage(message, 'user');
        messageInput.value = '';
        
        // Show loading animation
        showLoading();
        
        try {
            // Send message to Cloudflare Worker API
            const response = await fetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (response.ok) {
                const data = await response.json();
                addMessage(data.response, 'bot');
            } else {
                addMessage('တောင်းပန်ပါတယ်၊ အချိန်အနည်းငယ်စောင့်ပြီးထပ်ကြိုးစားပေးပါ။', 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('ဆက်သွယ်ရေးအမှား ကျေးဇူးပြု၍ နောက်မှထပ်ကြိုးစားပေးပါ။', 'bot');
        } finally {
            hideLoading();
        }
    }
    
    function sendSpecialMessage(type) {
        let message = '';
        if (type === 'image') {
            message = 'image ကြောင်ပုံ';
        } else if (type === 'code') {
            message = 'code Python Fibonacci function';
        }
        
        messageInput.value = message;
        sendMessage();
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.textContent = sender === 'user' ? 'U' : 'B';
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const messageText = document.createElement('div');
        messageText.classList.add('message-text');
        
        // Check if the message contains code blocks and format them
        if (text.includes('```')) {
            const parts = text.split('```');
            parts.forEach((part, index) => {
                if (index % 2 === 1) {
                    // This is a code block
                    const codeBlock = document.createElement('pre');
                    codeBlock.textContent = part;
                    messageText.appendChild(codeBlock);
                } else {
                    // This is regular text
                    const textNode = document.createTextNode(part);
                    messageText.appendChild(textNode);
                }
            });
        } else {
            messageText.textContent = text;
        }
        
        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        messageTime.textContent = getCurrentTime();
        
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
    function openUploadModal() {
        uploadModal.classList.add('active');
    }
    
    function openVoiceModal() {
        voiceModal.classList.add('active');
    }
    
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        if (isRecording) {
            stopRecording();
        }
    }
    
    function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            uploadedFilesList.push(file);
            
            const fileElement = document.createElement('div');
            fileElement.classList.add('uploaded-file');
            
            let fileIcon = 'file';
            if (file.type.includes('image')) fileIcon = 'file-image';
            else if (file.type.includes('pdf')) fileIcon = 'file-pdf';
            else if (file.type.includes('zip')) fileIcon = 'file-archive';
            
            fileElement.innerHTML = `
                <i class="fas fa-${fileIcon}"></i>
                <span class="file-name">${file.name}</span>
                <i class="fas fa-times file-remove" data-index="${uploadedFilesList.length - 1}"></i>
            `;
            
            uploadedFiles.appendChild(fileElement);
        }
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.file-remove').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                uploadedFilesList.splice(index, 1);
                this.parentElement.remove();
                
                // Update data-index attributes for remaining buttons
                document.querySelectorAll('.file-remove').forEach((btn, i) => {
                    btn.setAttribute('data-index', i);
                });
            });
        });
    }
    
    function processUploadedFiles() {
        if (uploadedFilesList.length === 0) {
            alert('ကျေးဇူးပြု၍ ဖိုင်တစ်ခုခု ရွေးပေးပါ');
            return;
        }
        
        addMessage(`ဖိုင် ${uploadedFilesList.length} ခု upload လုပ်လိုက်ပါတယ်`, 'user');
        closeAllModals();
        
        // Clear uploaded files list
        uploadedFilesList = [];
        uploadedFiles.innerHTML = '';
    }
    
    function toggleRecording() {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    }
    
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                
                // Send audio to server for processing
                sendAudioToServer(audioBlob);
            };
            
            mediaRecorder.start();
            isRecording = true;
            recordVoiceBtn.innerHTML = '<i class="fas fa-stop"></i> ရပ်ရန်';
            voiceStatus.textContent = 'စကားပြောနေသည်...';
            document.querySelector('.voice-animation').classList.add('recording');
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('မိုက်ကရိုဖုန်းကို အသုံးပြုခွင့် ရှိရန် လိုအပ်ပါတယ်');
        }
    }
    
    async function sendAudioToServer(audioBlob) {
        showLoading();
        
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');
            
            const response = await fetch(`${API_BASE}/api/voice`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                addMessage(data.text, 'user');
                
                // Get bot response
                const botResponse = await fetch(`${API_BASE}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: data.text })
                });
                
                if (botResponse.ok) {
                    const botData = await botResponse.json();
                    addMessage(botData.response, 'bot');
                }
            } else {
                addMessage('အသံဖမ်းယူမှု မအောင်မြင်ပါ', 'bot');
            }
        } catch (error) {
            console.error('Error sending audio:', error);
            addMessage('အသံပို့ဆောင်ရာတွင် အမှားတစ်ခုဖြစ်နေပါသည်', 'bot');
        } finally {
            hideLoading();
        }
    }
    
    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            isRecording = false;
            recordVoiceBtn.innerHTML = '<i class="fas fa-microphone"></i> မှတ်တမ်းတင်ရန်';
            voiceStatus.textContent = 'စကားပြောရန် မှတ်တမ်းတင်ခလုတ်ကို နှိပ်ပါ...';
            document.querySelector('.voice-animation').classList.remove('recording');
        }
    }
    
    function showLoading() {
        loading.classList.add('active');
    }
    
    function hideLoading() {
        loading.classList.remove('active');
    }
    
    // Initialize with a welcome message after a short delay
    setTimeout(() => {
        addMessage('မင်္ဂလာပါ! Burme Mark Chat Bot မှ ကြိုဆိုပါတယ်။ ကျေးဇူးပြု၍ မေးခွန်းမေးပါ။', 'bot');
    }, 500);
});
