// Password visibility toggle
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.innerHTML = type === 'password' 
      ? '<span class="material-icons">visibility</span>' 
      : '<span class="material-icons">visibility_off</span>';
  });
}

// Login form submission
const loginForm = document.getElementById('loginForm');
const submitBtn = document.getElementById('submitBtn');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('loginError').textContent = '';

    // Get values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validation
    let hasError = false;

    if (!email) {
      document.getElementById('emailError').textContent = 'Email is required';
      hasError = true;
    } else if (!isValidEmail(email)) {
      document.getElementById('emailError').textContent = 'Please enter a valid email';
      hasError = true;
    }

    if (!password) {
      document.getElementById('passwordError').textContent = 'Password is required';
      hasError = true;
    } else if (password.length < 6) {
      document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (hasError) return;

    // Disable button and show loading
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="material-icons" style="animation: spin 1s linear infinite;">refresh</span><span class="btn-text">Logging in...</span>';

    try {
      // Call admin login API (now connects to auth service)
      const response = await API.adminLogin({ email, password });

      console.log('Login Response:', response);

      // Handle response from auth service
      // Auth service returns: { authToken, refreshToken, admin { _id, email, fullName, role, ... } }
      if (response && response.authToken) {
        localStorage.setItem('accessToken', response.authToken);
        localStorage.setItem('adminAuthToken', response.authToken);
        localStorage.setItem('adminRefreshToken', response.refreshToken || '');
        localStorage.setItem('adminData', JSON.stringify(response.admin || response));

        // Remember email if checked
        if (rememberMe) {
          localStorage.setItem('rememberedAdminEmail', email);
        } else {
          localStorage.removeItem('rememberedAdminEmail');
        }

        console.log('✅ Admin login successful');
        showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '../dashboard/index.html';
        }, 800);
      } else if (response && response.token) {
        // Alternative response format
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('adminAuthToken', response.token);
        localStorage.setItem('adminRefreshToken', response.refreshToken || '');
        localStorage.setItem('adminData', JSON.stringify(response));

        if (rememberMe) {
          localStorage.setItem('rememberedAdminEmail', email);
        } else {
          localStorage.removeItem('rememberedAdminEmail');
        }

        console.log('✅ Admin login successful');
        showNotification('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
          window.location.href = '../dashboard/index.html';
        }, 800);
      } else {
        throw new Error('No authentication token received from server');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      document.getElementById('loginError').textContent = 
        error.message || 'Login failed. Please check your credentials.';
      
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Auto-fill remembered email
window.addEventListener('load', () => {
  const rememberedEmail = localStorage.getItem('rememberedAdminEmail');
  if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
    document.getElementById('rememberMe').checked = true;
  }
});

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Notification helper
function showNotification(message, type = 'success', duration = 3000) {
  const notification = document.getElementById('notification') || (() => {
    const div = document.createElement('div');
    div.id = 'notification';
    document.body.appendChild(div);
    return div;
  })();

  notification.textContent = message;
  notification.className = `notification show ${type}`;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '15px 20px';
  notification.style.borderRadius = '8px';
  notification.style.color = 'white';
  notification.style.fontWeight = '500';
  notification.style.zIndex = '9999';
  notification.style.background = type === 'success' ? '#48bb78' : '#f56565';

  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

// Add spin animation for loading state
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .notification {
    display: none;
  }
  .notification.show {
    display: block;
  }
`;
document.head.appendChild(style);
