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
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        addMessage(message, 'user');
        messageInput.value = '';
        
        // Show loading animation
        showLoading();
        
        // Simulate API call delay
        setTimeout(() => {
            hideLoading();
            generateBotResponse(message);
        }, 1500);
    }
    
    function sendSpecialMessage(type) {
        let message = '';
        if (type === 'image') {
            message = 'ပုံတစ်ပုံ ထုတ်ပေးပါ';
        } else if (type === 'code') {
            message = 'Python ကုဒ် ရေးပေးပါ';
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
        messageText.textContent = text;
        
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
    
    function generateBotResponse(userMessage) {
        let response = '';
        const lowerMsg = userMessage.toLowerCase();
        
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('နေကောင်းလား')) {
            response = 'မင်္ဂလာပါ! Burme Mark Chat Bot မှ ကြိုဆိုပါတယ်။ ဘာလုပ်ပေးရမလဲ?';
        } else if (lowerMsg.includes('name') || lowerMsg.includes('နာမည်')) {
            response = 'ကျွန်တော့်နာမည်က Burme Mark Chat Bot ပါ။ ကျေးဇူးပြု၍ မိတ်ဆက်ရတာ ဝမ်းသာပါတယ်။';
        } else if (lowerMsg.includes('help') || lowerMsg.includes('ကူညီ')) {
            response = 'ကျွန်တော်က မြန်မာလို စကားပြောပေးတဲ့ chat bot ပါ။\n\nကျွန်တော်နဲ့:\n- စကားပြောနိုင်ပါတယ်\n- ပုံတွေထုတ်ပေးနိုင်ပါတယ်\n- ကုဒ်တွေ ရေးပေးနိုင်ပါတယ်\n- ဘာသာပြန်ပေးနိုင်ပါတယ်';
        } else if (lowerMsg.includes('image') || lowerMsg.includes('ပုံ')) {
            response = 'ပုံထုတ်ပေးဖို့ ပြင်ဆင်နေပါတယ်။ ဘယ်လိုပုံမျိုး ထုတ်ချင်ပါသလဲ?';
        } else if (lowerMsg.includes('code') || lowerMsg.includes('ကုဒ်')) {
            response = 'ကုဒ်ရေးပေးဖို့ ပြင်ဆင်နေပါတယ်။ ဘယ်ဘာသာစကားနဲ့ ရေးပေးရမလဲ?';
        } else {
            response = 'နားမလည်လို့ ကျေးဇူးပြု၍ ထပ်မေးပေးပါ။ ကျွန်တော်က စကားပြောတာ၊ ပုံထုတ်ပေးတာ၊ ကုဒ်ရေးပေးတာ စတာတွေ လုပ်ပေးနိုင်ပါတယ်။';
        }
        
        addMessage(response, 'bot');
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
                // Here you would typically send the audio blob to your server for processing
                // For this example, we'll just simulate a response
                
                addMessage('စကားပြောမှတ်တမ်း', 'user');
                setTimeout(() => {
                    addMessage('စကားပြောမှုကို နားလည်ပါတယ်။ ကျေးဇူးတင်ပါတယ်။', 'bot');
                }, 1000);
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
