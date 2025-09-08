// js/pages/mainchat.js

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const generateBtn = document.getElementById('generate-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const fileInput = document.getElementById('file-input');
    const cameraModal = document.getElementById('camera-modal');
    const previewModal = document.getElementById('preview-modal');
    const cameraView = document.getElementById('camera-view');
    const captureBtn = document.getElementById('capture-btn');
    const previewImage = document.getElementById('preview-image');
    const sendImageBtn = document.getElementById('send-image');
    const voiceRecorder = document.getElementById('voice-recorder');
    
    // Variables
    let mediaStream = null;
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    
    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', handleInputKeydown);
    uploadBtn.addEventListener('click', triggerFileUpload);
    cameraBtn.addEventListener('click', openCamera);
    voiceBtn.addEventListener('click', toggleVoiceRecording);
    fileInput.addEventListener('change', handleFileUpload);
    captureBtn.addEventListener('click', capturePhoto);
    sendImageBtn.addEventListener('click', sendCapturedImage);
    
    // Close modals when clicking on close button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            cameraModal.classList.remove('active');
            previewModal.classList.remove('active');
            stopCamera();
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (modal === cameraModal) {
                    stopCamera();
                }
            }
        });
    });
    
    // Functions
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Add message to chat
            addMessageToChat(message, 'user');
            
            // Clear input
            messageInput.value = '';
            
            // Show generating indicator
            sendBtn.classList.add('hidden');
            generateBtn.classList.remove('hidden');
            
            // Simulate AI response (in a real app, this would be an API call)
            setTimeout(() => {
                // Hide generating indicator
                generateBtn.classList.add('hidden');
                sendBtn.classList.remove('hidden');
                
                // Add response
                addMessageToChat("I'm thinking about your message: " + message, 'bot');
                
                // Scroll to bottom
                scrollToBottom();
            }, 2000);
        }
    }
    
    function handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
    
    function triggerFileUpload() {
        fileInput.click();
    }
    
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                previewImage.src = event.target.result;
                previewModal.classList.add('active');
            };
            reader.readAsDataURL(file);
        }
    }
    
    function openCamera() {
        cameraModal.classList.add('active');
        startCamera();
    }
    
    async function startCamera() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' }, 
                audio: false 
            });
            cameraView.srcObject = mediaStream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    }
    
    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    }
    
    function capturePhoto() {
        const canvas = document.getElementById('photo-canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = cameraView.videoWidth;
        canvas.height = cameraView.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(cameraView, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL and show preview
        previewImage.src = canvas.toDataURL('image/png');
        
        // Close camera and show preview
        cameraModal.classList.remove('active');
        previewModal.classList.add('active');
        
        // Stop camera
        stopCamera();
    }
    
    function sendCapturedImage() {
        // In a real app, you would upload the image and send it as a message
        addMessageToChat('', 'user', previewImage.src);
        previewModal.classList.remove('active');
    }
    
    function toggleVoiceRecording() {
        if (isRecording) {
            stopVoiceRecording();
        } else {
            startVoiceRecording();
        }
    }
    
    async function startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                // In a real app, you would upload the audio and send it
                addMessageToChat('', 'user', null, audioBlob);
            };
            
            mediaRecorder.start();
            isRecording = true;
            voiceRecorder.classList.remove('hidden');
            messageInput.classList.add('hidden');
            
            // Stop recording after 30 seconds max
            setTimeout(() => {
                if (isRecording) {
                    stopVoiceRecording();
                }
            }, 30000);
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check permissions.');
        }
    }
    
    function stopVoiceRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            isRecording = false;
            voiceRecorder.classList.add('hidden');
            messageInput.classList.remove('hidden');
        }
    }
    
    function addMessageToChat(text, sender, imageUrl = null, audioBlob = null) {
        const messagesContainer = document.querySelector('.messages-container');
        const messageEl = document.createElement('div');
        messageEl.classList.add('message', `${sender}-message`);
        
        let contentHtml = '';
        
        if (imageUrl) {
            contentHtml = `<img src="${imageUrl}" alt="Sent image" style="max-width: 100%; border-radius: 8px;">`;
        } else if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            contentHtml = `
                <audio controls style="width: 100%;">
                    <source src="${audioUrl}" type="audio/wav">
                    Your browser does not support the audio element.
                </audio>
            `;
        } else {
            contentHtml = `<p>${text}</p>`;
        }
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                ${contentHtml}
                <span class="message-time">${timeString}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageEl);
        scrollToBottom();
    }
    
    function scrollToBottom() {
        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
