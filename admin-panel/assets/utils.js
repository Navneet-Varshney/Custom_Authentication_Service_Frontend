/**
 * Utility Functions Module
 * Provides common functions for admin panel:
 * - Authentication helpers
 * - Data management (localStorage)
 * - UI notifications
 * - Form validation
 * - Date formatting
 */

/**
 * Check if admin is authenticated
 * Validates token and admin data existence
 * @returns {Object|null} Admin data object or null if not authenticated
 */
function checkAdminAuth() {
  const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('accessToken');
  const adminData = localStorage.getItem('adminData');
  
  if (!token) {
    console.warn('🔓 No authentication token found');
    window.location.href = '../auth/login.html';
    return null;
  }
  
  try {
    return adminData ? JSON.parse(adminData) : { email: 'Admin', fullName: 'Admin User' };
  } catch (e) {
    console.error('❌ Invalid admin data in localStorage:', e);
    window.location.href = '../auth/login.html';
    return null;
  }
}

/**
 * Retrieve admin data from localStorage
 * @returns {Object|null} Parsed admin data or null if not available
 */
function getAdminData() {
  const admin = localStorage.getItem('adminData');
  return admin ? JSON.parse(admin) : null;
}

/**
 * Store admin data in localStorage
 * @param {Object} adminData - Admin data object to store
 */
function setAdminData(adminData) {
  console.debug('💾 Storing admin data in localStorage');
  localStorage.setItem('adminData', JSON.stringify(adminData));
}

/**
 * Show error notification with icon and auto-dismiss
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
function showErrorNotification(message, duration = 5000) {
  console.error('🔴 Error:', message);
  const notification = document.createElement('div');
  notification.className = 'notification notification-error';
  notification.innerHTML = `<span class="material-icons">error</span><span>${message}</span>`;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), duration);
}

/**
 * Show success notification
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showSuccessNotification(message, duration = 3000) {
  console.log('✅ Success:', message);
  const notification = document.createElement('div');
  notification.className = 'notification notification-success';
  notification.innerHTML = `<span class="material-icons">check_circle</span><span>${message}</span>`;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), duration);
}

/**
 * Safely parse JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
function safeJSONParse(jsonString, defaultValue = null) {
  try {
    if (!jsonString) return defaultValue;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

/**
 * Format date to readable string
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}
}

/**
 * Logout admin user completely
 * Clears all admin credentials and redirects to Project login
 * Keeps accessToken and deviceUUID for potential future use
 */
function logoutAdmin() {
  console.log('🚪 Admin logout initiated - Redirecting to Project login');
  
  // Clear admin-specific data
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('adminRefreshToken');
  localStorage.removeItem('adminData');
  
  // Keep accessToken and deviceUUID - for future sessions
  
  console.log('✓ Admin credentials cleared - Complete logout');
  
  // Add small delay for UI feedback
  setTimeout(() => {
    // Redirect to Project login page
    window.location.href = 'http://127.0.0.1:5500/project/index.html';
  }, 300);
}

/**
 * Display notification to user
 * Creates a floating notification with specified message and type
 * @param {string} message - Notification message text
 * @param {string} type - Notification type: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Display duration in milliseconds
 */
function showNotification(message, type = 'success', duration = 3000) {
  const notification = document.getElementById('notification');
  if (!notification) {
    const div = document.createElement('div');
    div.id = 'notification';
    div.className = 'notification';
    document.body.appendChild(div);
  }

  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.className = `notification show ${type}`;

  setTimeout(() => {
    notif.classList.remove('show');
  }, duration);
}

// Format date
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return dateString;
  }
}

// Format time
function formatTime(dateString) {
  try {
    const date = new Date(dateString);
    const options = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    return date.toLocaleTimeString('en-US', options);
  } catch (e) {
    return dateString;
  }
}

// Get status badge HTML
function getStatusBadge(status) {
  const statusMap = {
    'active': { class: 'status-active', label: 'Active' },
    'blocked': { class: 'status-blocked', label: 'Blocked' },
    'pending': { class: 'status-pending', label: 'Pending' },
    'disabled': { class: 'status-blocked', label: 'Disabled' },
  };

  const normalized = status ? status.toLowerCase() : 'active';
  const config = statusMap[normalized] || { class: 'status-active', label: normalized };

  return `<span class="status-badge ${config.class}">${config.label}</span>`;
}

// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Confirm dialog
function confirmAction(message = 'Are you sure?') {
  return confirm(message);
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard', 'success', 2000);
  }).catch(() => {
    showNotification('Failed to copy', 'error', 2000);
  });
}

// Pagination helper
function getPaginationButtons(currentPage, totalPages) {
  const buttons = [];
  const maxButtons = 5;
  
  if (totalPages <= maxButtons) {
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(i);
    }
  } else {
    buttons.push(1);
    
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    if (startPage > 2) buttons.push('...');
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }
    
    if (endPage < totalPages - 1) buttons.push('...');
    buttons.push(totalPages);
  }
  
  return buttons;
}

/**
 * INPUT VALIDATION FUNCTIONS
 * Provide data validation and sanitization for form inputs
 */

/**
 * Email validation
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Password validation
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, message: string }
 */
function validatePassword(password) {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must not exceed 128 characters' };
  }
  return { valid: true, message: 'Password is valid' };
}

/**
 * Username/name validation
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid name format
 */
function isValidName(name) {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 100) return false;
  // Allow letters, numbers, spaces, hyphens, apostrophes
  return /^[a-zA-Z0-9\s\-']+$/.test(name);
}

/**
 * UUID validation
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID format
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * ID validation (MongoDB ObjectId format)
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid MongoDB ObjectId
 */
function isValidObjectId(id) {
  return /^[0-9a-f]{24}$/i.test(id);
}

/**
 * Sanitize input string for safe display
 * Removes potential XSS vulnerabilities
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
function sanitizeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate form data before submission
 * @param {Object} data - Form data object
 * @param {Array} rules - Validation rules array
 * @returns {Object} { valid: boolean, errors: Object }
 */
function validateFormData(data, rules) {
  const errors = {};
  
  rules.forEach(rule => {
    const { field, type, required = true, min, max } = rule;
    const value = data[field];
    
    // Check required
    if (required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`;
      return;
    }
    
    // Check type-specific validations
    if (value) {
      switch (type) {
        case 'email':
          if (!isValidEmail(value)) {
            errors[field] = 'Invalid email format';
          }
          break;
        case 'name':
          if (!isValidName(value)) {
            errors[field] = 'Invalid name format';
          }
          break;
        case 'uuid':
          if (!isValidUUID(value)) {
            errors[field] = 'Invalid UUID format';
          }
          break;
        case 'string':
          if (min && value.length < min) {
            errors[field] = `Minimum ${min} characters required`;
          }
          if (max && value.length > max) {
            errors[field] = `Maximum ${max} characters allowed`;
          }
          break;
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * XSS/Injection prevention helper
 * @param {string} input - User input
 * @returns {boolean} True if input contains potential injection
 */
function hasInjectionPattern(input) {
  const injectionPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
    /<iframe/i,
    /svg.*onload/i,
  ];
  
  return injectionPatterns.some(pattern => pattern.test(input));
}

// Add notification styles if not exist
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      background: #48bb78;
      color: white;
      font-weight: 500;
      display: none;
      z-index: 9999;
      animation: slideIn 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    }

    .notification.show {
      display: block;
    }

    .notification.success {
      background: #48bb78;
    }

    .notification.error {
      background: #f56565;
    }

    .notification.warning {
      background: #ed8936;
    }

    .notification.info {
      background: #4299e1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .notification {
        bottom: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * SESSION MANAGEMENT HELPERS
 * Manage admin session, token refresh, and session monitoring
 */

/**
 * Extended session management with token refresh tracking
 * @type {Object}
 */
const SessionManager = {
  /**
   * Get current session info
   * @returns {Object} Session information
   */
  getSessionInfo() {
    return {
      hasAdminToken: !!localStorage.getItem('adminAuthToken'),
      hasAccessToken: !!localStorage.getItem('accessToken'),
      hasDeviceUUID: !!localStorage.getItem('deviceUUID'),
      adminData: JSON.parse(localStorage.getItem('adminData') || 'null'),
      sessionStartTime: localStorage.getItem('sessionStartTime'),
    };
  },

  /**
   * Initialize session timer
   * @param {number} durationMs - Session duration in milliseconds
   */
  initSessionTimer(durationMs = 24 * 60 * 60 * 1000) {
    const startTime = Date.now();
    localStorage.setItem('sessionStartTime', startTime.toString());
    console.log(`⏱️ Session timer initialized for ${durationMs / 1000 / 60} minutes`);
  },

  /**
   * Check if session is still valid
   * @returns {boolean} True if session is valid
   */
  isSessionValid() {
    const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('accessToken');
    return !!token;
  },

  /**
   * Refresh session tokens
   * @async
   * @returns {Promise<boolean>} True if refresh successful
   */
  async refreshSession() {
    try {
      console.log('🔄 Attempting session refresh...');
      // Placeholder for future token refresh logic
      return true;
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      return false;
    }
  }
};

/**
 * DATA CACHE MANAGEMENT
 * Cache API responses to reduce server requests
 */

/**
 * Simple cache implementation for API responses
 * @type {Object}
 */
const CacheManager = {
  cache: new Map(),
  defaultTTL: 5 * 60 * 1000, // 5 minutes

  /**
   * Set cache item
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = this.defaultTTL) {
    const expires = Date.now() + ttl;
    this.cache.set(key, { value, expires });
    console.debug(`💾 Cached: ${key} (expires in ${ttl / 1000}s)`);
  },

  /**
   * Get cache item
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      console.debug(`❌ Cache miss: ${key}`);
      return null;
    }

    if (Date.now() > item.expires) {
      console.debug(`⏱️ Cache expired: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.debug(`✅ Cache hit: ${key}`);
    return item.value;
  },

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key
   */
  clear(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      console.debug(`🗑️ Cleared cache: ${key}`);
    }
  },

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
    console.debug(`🗑️ All cache cleared`);
  },

  /**
   * Get cache stats
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      items: Array.from(this.cache.keys())
    };
  }
};

/**
 * PERFORMANCE MONITORING
 * Track and log performance metrics
 */

/**
 * Performance monitor utility
 * @type {Object}
 */
const PerformanceMonitor = {
  metrics: {},

  /**
   * Start performance measurement
   * @param {string} label - Metric label
   */
  start(label) {
    this.metrics[label] = performance.now();
    console.debug(`⏱️ Started measuring: ${label}`);
  },

  /**
   * End performance measurement and log result
   * @param {string} label - Metric label
   */
  end(label) {
    const startTime = this.metrics[label];
    if (!startTime) {
      console.warn(`⚠️ No start time for metric: ${label}`);
      return null;
    }

    const duration = performance.now() - startTime;
    console.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    delete this.metrics[label];
    return duration;
  },

  /**
   * Measure async operation duration
   * @async
   * @param {string} label - Operation label
   * @param {Function} asyncFn - Async function to measure
   * @returns {Promise} Result of async function
   */
  async measure(label, asyncFn) {
    this.start(label);
    try {
      const result = await asyncFn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
};

console.log('✅ Utils module loaded');
