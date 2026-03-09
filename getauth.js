// ===== FIREBASE AUTH SYSTEM ===== 
let currentUser = null;

// Check if user is already logged in and redirect
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        console.log('✅ User already logged in:', user.email);
        // Redirect to platform.html
        window.location.href = 'platform.html';
    }
});

// ===== PASSWORD TOGGLE =====
const loginTogglePassword = document.getElementById('login-toggle-password');
const loginPasswordInput = document.getElementById('login-password');

if (loginTogglePassword && loginPasswordInput) {
    loginTogglePassword.addEventListener('click', function() {
        const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        loginPasswordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}

// ===== LOGIN FORM SUBMISSION =====
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const submitBtn = loginForm.querySelector('.auth-submit-btn');

        // Validation
        if (!email || !password) {
            alert('❌ Please fill in all fields');
            return;
        }

        // Show loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        try {
            // Firebase login
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            console.log('✅ Login successful:', user.email);

            // Show success message
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Success! Redirecting...';

            // Redirect to platform.html
            setTimeout(() => {
                window.location.href = 'platform.html';
            }, 1000);

        } catch (error) {
            console.error('❌ Login error:', error);

            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;

            // Show error message
            let errorMessage = 'Login failed. Please try again.';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = '❌ No account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = '❌ Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = '❌ Invalid email format';
                    break;
                case 'auth/user-disabled':
                    errorMessage = '❌ This account has been disabled';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = '❌ Too many failed attempts. Please try again later';
                    break;
                default:
                    errorMessage = `❌ ${error.message}`;
            }

            alert(errorMessage);
        }
    });
}

// ===== FORGOT PASSWORD MODAL =====
function handleForgotPassword(e) {
    e.preventDefault();

    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'forgot-password-modal';
    modal.innerHTML = `
        <div class="forgot-password-content">
            <h3>Reset Password</h3>
            <p>Enter your email to receive a password reset link</p>
            <input type="email" id="reset-email" placeholder="Enter your email" class="auth-input">
            <div class="modal-buttons">
                <button class="modal-btn cancel-btn">Cancel</button>
                <button class="modal-btn send-btn">Send Reset Link</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Focus on input
    setTimeout(() => {
        document.getElementById('reset-email').focus();
    }, 100);

    // Handle cancel button
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });

    // Handle send button
    modal.querySelector('.send-btn').addEventListener('click', async () => {
        const email = document.getElementById('reset-email').value.trim();

        if (!email) {
            alert('❌ Please enter your email');
            return;
        }

        const sendBtn = modal.querySelector('.send-btn');
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        sendBtn.disabled = true;

        try {
            await auth.sendPasswordResetEmail(email);
            alert('✅ Password reset email sent! Check your inbox.');
            modal.remove();
        } catch (error) {
            console.error('❌ Password reset error:', error);

            let errorMessage = 'Failed to send reset email';

            if (error.code === 'auth/user-not-found') {
                errorMessage = '❌ No account found with this email';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = '❌ Invalid email format';
            } else {
                errorMessage = `❌ ${error.message}`;
            }

            alert(errorMessage);
            sendBtn.innerHTML = 'Send Reset Link';
            sendBtn.disabled = false;
        }
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Attach forgot password handler
const forgotPasswordLink = document.getElementById('forgot-password-link');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
}

console.log('🔥 Login system initialized');