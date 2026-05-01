/**
 * Admin Panel Login Module
 * Handles authentication for admin users
 * Supports both direct login and redirect from Project dashboard
 * Features: Rate limiting, XSS prevention, session security, real-time validation
 */

/**
 * Rate limiting configuration
 * Prevents brute force attacks
 */
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  storageKey: 'loginAttempts',
};

/**
 * Form validation state
 */
const FormValidationState = {
  email: null,
  password: null,
  isFormValid() {
    return this.email === true && this.password === true;
  }
};

/**
 * Track login attempts and enforce rate limiting
 * @returns {boolean} True if attempt is allowed, false if rate limited
 */
function checkRateLimit() {
  const now = Date.now();
  try {
    let attempts = JSON.parse(localStorage.getItem(RATE_LIMIT_CONFIG.storageKey) || '[]');
    
    // Remove attempts outside the time window
    attempts = attempts.filter(timestamp => (now - timestamp) < RATE_LIMIT_CONFIG.windowMs);
    
    if (attempts.length >= RATE_LIMIT_CONFIG.maxAttempts) {
      console.warn('⚠️ Rate limit exceeded - Too many login attempts');
      const remainingTime = Math.ceil((RATE_LIMIT_CONFIG.windowMs - (now - attempts[0])) / 1000 / 60);
      console.info(`Try again in ${remainingTime} minutes`);
      return false;
    }
    
    // Record this attempt
    attempts.push(now);
    localStorage.setItem(RATE_LIMIT_CONFIG.storageKey, JSON.stringify(attempts));
    console.debug(`Login attempt ${attempts.length}/${RATE_LIMIT_CONFIG.maxAttempts}`);
    
    return true;
  } catch (error) {
    console.error('❌ Rate limit check error:', error);
    return true; // Allow attempt if error occurs
  }
}

/**
 * Reset rate limit tracking
 * Call after successful login
 */
function resetRateLimit() {
  localStorage.removeItem(RATE_LIMIT_CONFIG.storageKey);
  console.log('✓ Rate limit tracker reset');
}

/**
 * Get remaining time for rate limit
 * @returns {number} Minutes remaining until rate limit expires
 */
function getRateLimitRemaining() {
  const attempts = JSON.parse(localStorage.getItem(RATE_LIMIT_CONFIG.storageKey) || '[]');
  if (attempts.length === 0) return 0;
  
  const oldestAttempt = attempts[0];
  const now = Date.now();
  const elapsedMs = now - oldestAttempt;
  const remainingMs = RATE_LIMIT_CONFIG.windowMs - elapsedMs;
  
  return Math.ceil(remainingMs / 60000); // Convert to minutes
}

/**
 * Real-time email field validation
 * Validates email format and provides immediate feedback
 */
function setupEmailValidation() {
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('emailError');
  
  if (!emailInput) return;
  
  emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    
    if (!email) {
      FormValidationState.email = false;
      emailError.textContent = '✗ Email is required';
      emailInput.classList.add('error');
      return;
    }
    
    // Use Validation module if available
    if (typeof Validation !== 'undefined') {
      const validation = Validation.validateEmail(email);
      if (!validation.isValid) {
        FormValidationState.email = false;
        emailError.textContent = `✗ ${validation.error}`;
        emailInput.classList.add('error');
      } else {
        FormValidationState.email = true;
        emailError.textContent = '';
        emailInput.classList.remove('error');
      }
    }
  });
  
  emailInput.addEventListener('focus', () => {
    emailError.textContent = '';
    emailInput.classList.remove('error');
  });
}

/**
 * Real-time password field validation
 * Shows password strength indicator
 */
function setupPasswordValidation() {
  const passwordInput = document.getElementById('password');
  const passwordError = document.getElementById('passwordError');
  
  if (!passwordInput) return;
  
  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    
    if (!password) {
      FormValidationState.password = false;
      passwordError.textContent = '✗ Password is required';
      passwordInput.classList.add('error');
      return;
    }
    
    // Use Validation module for strength checking if available
    if (typeof Validation !== 'undefined') {
      const strength = Validation.checkPasswordStrength(password);
      const validation = Validation.validatePassword(password);
      
      if (!validation.isValid) {
        FormValidationState.password = false;
        passwordError.textContent = `✗ ${validation.error}`;
        passwordInput.classList.add('error');
      } else {
        FormValidationState.password = true;
        passwordError.textContent = `✓ Strength: ${strength.strength}`;
        passwordInput.classList.remove('error');
      }
    }
  });
}

/**
 * Password visibility toggle
 * Toggles between password and text input types
 */
function setupPasswordToggle() {
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (!togglePasswordBtn) return;
  
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.innerHTML = type === 'password' 
      ? '<span class="material-icons">visibility</span>' 
      : '<span class="material-icons">visibility_off</span>';
    togglePasswordBtn.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
    console.log(`👁️ Password visibility: ${type === 'password' ? 'hidden' : 'visible'}`);
  });
}

/**
 * Helper function to validate email
 */
function isValidEmail(email) {
  if (typeof Validation !== 'undefined') {
    return Validation.validateEmail(email).isValid;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper function to validate password
 */
function validatePassword(password) {
  if (typeof Validation !== 'undefined') {
    const validation = Validation.validatePassword(password);
    return { valid: validation.isValid, message: validation.error };
  }
  return { valid: true, message: '' };
}

/**
 * Helper function to detect potential injection patterns
 */
function hasInjectionPattern(input) {
  const injectionPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /<iframe/i,
    /<img/i,
    /eval\(/i,
  ];
  return injectionPatterns.some(pattern => pattern.test(input));
}

/**
 * Helper function to sanitize input (basic HTML encoding)
 */
function sanitizeInput(input) {
  if (typeof Validation !== 'undefined' && Validation.sanitizeInput) {
    return Validation.sanitizeInput(input);
  }
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Notification helper
 */
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

/**
 * Login form submission handler
 * Validates credentials, checks rate limiting, and authenticates against auth service
 * Stores tokens in both formats (accessToken and adminAuthToken) for integration
 */
const loginForm = document.getElementById('loginForm');
const submitBtn = document.getElementById('submitBtn');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check rate limiting first
    if (!checkRateLimit()) {
      const remaining = getRateLimitRemaining();
      document.getElementById('loginError').textContent = 
        `⏱️ Too many attempts. Please try again in ${remaining} minute(s).`;
      showNotification('Too many login attempts. Please wait.', 'error', 3000);
      return;
    }

    // Clear previous error messages
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('loginError').textContent = '';

    // Get and sanitize input values
    const email = sanitizeInput(document.getElementById('email').value.trim());
    const password = document.getElementById('password').value; // Don't sanitize password
    const rememberMe = document.getElementById('rememberMe').checked;

    // XSS prevention check
    if (hasInjectionPattern(email)) {
      console.warn('⚠️ Potential XSS injection detected in email field');
      document.getElementById('loginError').textContent = '✗ Invalid input detected. Please try again.';
      return;
    }

    // Form validation with detailed error messages
    let hasError = false;

    if (!email) {
      document.getElementById('emailError').textContent = '✗ Email is required';
      hasError = true;
    } else if (!isValidEmail(email)) {
      document.getElementById('emailError').textContent = '✗ Please enter a valid email address';
      hasError = true;
    }

    if (!password) {
      document.getElementById('passwordError').textContent = '✗ Password is required';
      hasError = true;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        document.getElementById('passwordError').textContent = `✗ ${passwordValidation.message}`;
        hasError = true;
      }
    }

    if (hasError) {
      console.warn('⚠️ Form validation failed');
      return;
    }

    // Disable button and show loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="material-icons" style="animation: spin 1s linear infinite;">refresh</span><span class="btn-text">Logging in...</span>';

    try {
      console.log('🔐 Authenticating admin user...');
      
      // Call admin login API (connects to auth service on port 8080)
      const response = await API.adminLogin({ email, password });

      console.log('📋 Auth response received');

      // Handle response from auth service
      // Expected format: { authToken, refreshToken, admin { _id, email, fullName, role, ... } }
      if (response && response.authToken) {
        // Store tokens in both formats for seamless integration with Project dashboard
        localStorage.setItem('accessToken', response.authToken);
        localStorage.setItem('adminAuthToken', response.authToken);
        localStorage.setItem('adminRefreshToken', response.refreshToken || '');
        
        // Store admin data for profile display
        localStorage.setItem('adminData', JSON.stringify(response.admin || response));

        // Remember email if user checked the checkbox
        if (rememberMe) {
          localStorage.setItem('rememberedAdminEmail', email);
          console.log('💾 Email saved for next login');
        } else {
          localStorage.removeItem('rememberedAdminEmail');
        }

        // Reset rate limit on successful login
        resetRateLimit();

        console.log('✅ Admin authentication successful');
        showNotification('✓ Login successful! Redirecting to dashboard...', 'success');
        
        // Redirect to dashboard with slight delay for notification display
        setTimeout(() => {
          window.location.href = '../dashboard/index.html';
        }, 800);
      } else if (response && response.token) {
        // Handle alternative response format
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('adminAuthToken', response.token);
        localStorage.setItem('adminRefreshToken', response.refreshToken || '');
        localStorage.setItem('adminData', JSON.stringify(response));

        if (rememberMe) {
          localStorage.setItem('rememberedAdminEmail', email);
        } else {
          localStorage.removeItem('rememberedAdminEmail');
        }

        // Reset rate limit on successful login
        resetRateLimit();

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
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      document.getElementById('loginError').textContent = `✗ ${errorMessage}`;
      
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
  
  // Setup real-time validation
  setupEmailValidation();
  setupPasswordValidation();
  setupPasswordToggle();
});

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
  input.error {
    border-color: #f56565 !important;
    background-color: #fff5f5 !important;
  }
`;
document.head.appendChild(style);

console.log('✅ Login module loaded with enhanced validation');

/**
 * Login form submission handler
 * Validates credentials, checks rate limiting, and authenticates against auth service
 * Stores tokens in both formats (accessToken and adminAuthToken) for integration
 */
const loginForm = document.getElementById('loginForm');
const submitBtn = document.getElementById('submitBtn');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check rate limiting first
    if (!checkRateLimit()) {
      const remaining = getRateLimitRemaining();
      document.getElementById('loginError').textContent = 
        `⏱️ Too many attempts. Please try again in ${remaining} minute(s).`;
      showNotification('Too many login attempts. Please wait.', 'error', 3000);
      return;
    }

    // Clear previous error messages
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('loginError').textContent = '';

    // Get and sanitize input values
    const email = sanitizeInput(document.getElementById('email').value.trim());
    const password = document.getElementById('password').value; // Don't sanitize password
    const rememberMe = document.getElementById('rememberMe').checked;

    // XSS prevention check
    if (hasInjectionPattern(email)) {
      console.warn('⚠️ Potential XSS injection detected in email field');
      document.getElementById('loginError').textContent = '✗ Invalid input detected. Please try again.';
      return;
    }

    // Form validation with detailed error messages
    let hasError = false;

    if (!email) {
      document.getElementById('emailError').textContent = '✗ Email is required';
      hasError = true;
    } else if (!isValidEmail(email)) {
      document.getElementById('emailError').textContent = '✗ Please enter a valid email address';
      hasError = true;
    }

    if (!password) {
      document.getElementById('passwordError').textContent = '✗ Password is required';
      hasError = true;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        document.getElementById('passwordError').textContent = `✗ ${passwordValidation.message}`;
        hasError = true;
      }
    }

    if (hasError) {
      console.warn('⚠️ Form validation failed');
      return;
    }

    // Disable button and show loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="material-icons" style="animation: spin 1s linear infinite;">refresh</span><span class="btn-text">Logging in...</span>';

    try {
      console.log('🔐 Authenticating admin user...');
      
      // Call admin login API (connects to auth service on port 8080)
      const response = await API.adminLogin({ email, password });

      console.log('📋 Auth response received');

      // Handle response from auth service
      // Expected format: { authToken, refreshToken, admin { _id, email, fullName, role, ... } }
      if (response && response.authToken) {
        // Store tokens in both formats for seamless integration with Project dashboard
        localStorage.setItem('accessToken', response.authToken);
        localStorage.setItem('adminAuthToken', response.authToken);
        localStorage.setItem('adminRefreshToken', response.refreshToken || '');
        
        // Store admin data for profile display
        localStorage.setItem('adminData', JSON.stringify(response.admin || response));

        // Remember email if user checked the checkbox
        if (rememberMe) {
          localStorage.setItem('rememberedAdminEmail', email);
          console.log('💾 Email saved for next login');
        } else {
          localStorage.removeItem('rememberedAdminEmail');
        }

        // Reset rate limit on successful login
        resetRateLimit();

        console.log('✅ Admin authentication successful');
        showNotification('✓ Login successful! Redirecting to dashboard...', 'success');
        
        // Redirect to dashboard with slight delay for notification display
        setTimeout(() => {
          window.location.href = '../dashboard/index.html';
        }, 800);
      } else if (response && response.token) {
        // Handle alternative response format
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('adminAuthToken', response.token);
        localStorage.setItem('adminRefreshToken', response.refreshToken || '');
        localStorage.setItem('adminData', JSON.stringify(response));

        if (rememberMe) {
          localStorage.setItem('rememberedAdminEmail', email);
        } else {
          localStorage.removeItem('rememberedAdminEmail');
        }

        // Reset rate limit on successful login
        resetRateLimit();

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
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      document.getElementById('loginError').textContent = `✗ ${errorMessage}`;
      
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
