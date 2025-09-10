// Firebase configuration
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

// Show message function
function showMessage(message, type) {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + type;
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}

// Toggle password visibility
function togglePassword(inputId) {
  const passwordInput = document.getElementById(inputId);
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
}

// Sign in with email and password
function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;
  
  // Set persistence based on remember me selection
  const persistence = rememberMe ? 
    firebase.auth.Auth.Persistence.LOCAL : 
    firebase.auth.Auth.Persistence.SESSION;
  
  const auth = firebase.auth();
  const button = document.querySelector('.auth-btn');
  const originalText = button.innerHTML;
  
  // Show loading state
  button.innerHTML = '<span class="loading"></span> Signing in...';
  button.disabled = true;
  
  auth.setPersistence(persistence)
    .then(() => {
      return auth.signInWithEmailAndPassword(email, password);
    })
    .then((userCredential) => {
      // Signed in 
      showMessage('Login successful! Redirecting...', 'success');
      // Redirect to dashboard or home page
      setTimeout(() => {
        window.location.href = '../pages/mainchat.html';
      }, 1500);
    })
    .catch((error) => {
      // Handle errors
      button.innerHTML = originalText;
      button.disabled = false;
      
      const errorCode = error.code;
      let errorMessage = error.message;
      
      if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (errorCode === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (errorCode === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (errorCode === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      }
      
      showMessage(errorMessage, 'error');
    });
}

// Sign up with email and password
function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (password !== confirmPassword) {
    showMessage('Passwords do not match.', 'error');
    return;
  }
  
  if (password.length < 6) {
    showMessage('Password should be at least 6 characters.', 'error');
    return;
  }
  
  const button = document.querySelector('.auth-btn');
  const originalText = button.innerHTML;
  
  // Show loading state
  button.innerHTML = '<span class="loading"></span> Creating account...';
  button.disabled = true;
  
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed up 
      showMessage('Account created successfully! Redirecting...', 'success');
      // Redirect to dashboard or home page
      setTimeout(() => {
        window.location.href = '../pages/mainchat.html';
      }, 1500);
    })
    .catch((error) => {
      // Handle errors
      button.innerHTML = originalText;
      button.disabled = false;
      
      const errorCode = error.code;
      let errorMessage = error.message;
      
      if (errorCode === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (errorCode === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled.';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      }
      
      showMessage(errorMessage, 'error');
    });
}

// Reset password
function resetPassword() {
  const email = document.getElementById('email').value;
  
  const button = document.querySelector('.auth-btn');
  const originalText = button.innerHTML;
  
  // Show loading state
  button.innerHTML = '<span class="loading"></span> Sending reset email...';
  button.disabled = true;
  
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      showMessage('Password reset email sent! Check your inbox.', 'success');
      button.innerHTML = originalText;
      button.disabled = false;
    })
    .catch((error) => {
      // Handle errors
      button.innerHTML = originalText;
      button.disabled = false;
      
      const errorCode = error.code;
      let errorMessage = error.message;
      
      if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (errorCode === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      }
      
      showMessage(errorMessage, 'error');
    });
}

// Sign in with Google
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  const button = document.querySelector('.google-btn');
  const originalText = button.innerHTML;
  
  // Show loading state
  button.innerHTML = '<span class="loading"></span> Connecting...';
  button.disabled = true;
  
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      // Signed in
      showMessage('Login successful! Redirecting...', 'success');
      // Redirect to dashboard or home page
      setTimeout(() => {
        window.location.href = '../pages/mainchat.html';
      }, 1500);
    })
    .catch((error) => {
      // Handle errors
      button.innerHTML = originalText;
      button.disabled = false;
      
      const errorCode = error.code;
      const errorMessage = error.message;
      
      showMessage(errorMessage, 'error');
    });
}

// Sign in with Facebook
function signInWithFacebook() {
  const provider = new firebase.auth.FacebookAuthProvider();
  
  const button = document.querySelector('.facebook-btn');
  const originalText = button.innerHTML;
  
  // Show loading state
  button.innerHTML = '<span class="loading"></span> Connecting...';
  button.disabled = true;
  
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      // Signed in
      showMessage('Login successful! Redirecting...', 'success');
      // Redirect to dashboard or home page
      setTimeout(() => {
        window.location.href = '../pages/mainchat.html';
      }, 1500);
    })
    .catch((error) => {
      // Handle errors
      button.innerHTML = originalText;
      button.disabled = false;
      
      const errorCode = error.code;
      const errorMessage = error.message;
      
      showMessage(errorMessage, 'error');
    });
}

// Check if user is already logged in
firebase.auth().onAuthStateChanged((user) => {
  if (user && window.location.pathname.includes('pages/mainchat.html')) {
    // User is signed in, redirect to dashboard
    window.location.href = '../pages/mainchat.html';
  }
});
