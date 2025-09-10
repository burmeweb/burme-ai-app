     // Firebase configuration - replace with your actual config
        const firebaseConfig = {
              apiKey: "AIzaSyAr7Hv2ApKtNTxF11MhT5cuWeg_Dgsh0TY",
              authDomain: "smart-burme-app.firebaseapp.com",
              projectId: "smart-burme-app",
              storageBucket: "smart-burme-app.appspot.com",
              messagingSenderId: "851502425686",
              appId: "1:851502425686:web:f29e0e1dfa84794b4abdf7"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();

        // Check authentication state
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                document.getElementById('userEmail').textContent = user.email;
                loadUserChats(user.uid);
            } else {
                // No user is signed in, redirect to login
                window.location.href = '../user/login.html';
            }
        });

        // Function to load user's chats from Firestore
        function loadUserChats(userId) {
            db.collection('chats')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get()
                .then((querySnapshot) => {
                    const chatList = document.getElementById('chatList');
                    chatList.innerHTML = ''; // Clear existing items
                    
                    querySnapshot.forEach((doc) => {
                        const chatData = doc.data();
                        const li = document.createElement('li');
                        li.className = 'chat-item';
                        li.textContent = chatData.title || 'Untitled Chat';
                        li.setAttribute('data-id', doc.id);
                        
                        li.addEventListener('click', () => {
                            // Remove active class from all items
                            document.querySelectorAll('.chat-item').forEach(item => {
                                item.classList.remove('active');
                            });
                            // Add active class to clicked item
                            li.classList.add('active');
                            // Load chat messages
                            loadChatMessages(doc.id);
                        });
                        
                        chatList.appendChild(li);
                    });
                })
                .catch((error) => {
                    console.error("Error loading chats: ", error);
                });
        }

        // Function to load chat messages
        function loadChatMessages(chatId) {
            // Implementation for loading specific chat messages
            console.log("Loading chat: ", chatId);
        }

        // Send message functionality
        document.getElementById('sendBtn').addEventListener('click', sendMessage);
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            
            if (message) {
                const user = auth.currentUser;
                if (user) {
                    // Add message to Firestore
                    // This is a simplified example - you'd need to implement your actual data structure
                    db.collection('messages').add({
                        userId: user.uid,
                        text: message,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        isUser: true
                    })
                    .then(() => {
                        messageInput.value = '';
                    })
                    .catch((error) => {
                        console.error("Error sending message: ", error);
                    });
                }
            }
        }

        // New chat button
        document.getElementById('newChatBtn').addEventListener('click', () => {
            const user = auth.currentUser;
            if (user) {
                db.collection('chats').add({
                    userId: user.uid,
                    title: 'New Chat',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then((docRef) => {
                    loadUserChats(user.uid);
                })
                .catch((error) => {
                    console.error("Error creating new chat: ", error);
                });
            }
        });

        // Clear conversations
        document.getElementById('clearBtn').addEventListener('click', () => {
            // Implementation for clearing conversations
            if (confirm("Are you sure you want to clear all conversations?")) {
                console.log("Clearing conversations");
                // You would need to implement the actual deletion logic here
            }
        });
    