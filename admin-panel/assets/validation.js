/**
 * Input Validation Utilities for Admin Panel
 * Provides reusable validation functions for forms and API payloads
 * Features: Email, password, username, URL, phone validation with regex
 * Returns: Object with isValid flag and error message
 */

const Validation = {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) {
      return { isValid: false, error: 'Email is required' };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    if (email.length > 255) {
      return { isValid: false, error: 'Email must be less than 255 characters' };
    }
    return { isValid: true, error: null };
  },

  /**
   * Validate password strength
   * Requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
   * @param {string} password - Password to validate
   * @returns {Object} { isValid: boolean, error: string }
   */
  validatePassword(password) {
    if (!password || !password.trim()) {
      return { isValid: false, error: 'Password is required' };
    }
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }
    if (password.length > 128) {
      return { isValid: false, error: 'Password must be less than 128 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { isValid: true, error: null };
  },

  /**
   * Validate username (alphanumeric, hyphens, underscores only)
   * @param {string} username - Username to validate
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!username || !username.trim()) {
      return { isValid: false, error: 'Username is required' };
    }
    if (!usernameRegex.test(username)) {
      return { isValid: false, error: 'Username must be 3-30 characters (letters, numbers, hyphens, underscores only)' };
    }
    return { isValid: true, error: null };
  },

  /**
   * Validate full name
   * @param {string} name - Name to validate
   * @param {number} minLength - Minimum length (default: 2)
   * @param {number} maxLength - Maximum length (default: 100)
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateName(name, minLength = 2, maxLength = 100) {
    const nameRegex = /^[a-zA-Z\s'-]{2,}$/;
    if (!name || !name.trim()) {
      return { isValid: false, error: 'Name is required' };
    }
    if (name.length < minLength) {
      return { isValid: false, error: `Name must be at least ${minLength} characters` };
    }
    if (name.length > maxLength) {
      return { isValid: false, error: `Name must be less than ${maxLength} characters` };
    }
    if (!nameRegex.test(name)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true, error: null };
  },



  /**
   * Validate numeric ID (positive integer)
   * @param {number|string} id - ID to validate
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateID(id) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      return { isValid: false, error: 'Invalid ID format' };
    }
    return { isValid: true, error: null };
  },

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateURL(url) {
    try {
      if (!url || !url.trim()) {
        return { isValid: false, error: 'URL is required' };
      }
      new URL(url);
      return { isValid: true, error: null };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  },

  /**
   * Validate phone number (international format support)
   * @param {string} phone - Phone number to validate
   * @returns {Object} { isValid: boolean, error: string }
   */
  validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
    if (!phone || !phone.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }
    if (!phoneRegex.test(phone)) {
      return { isValid: false, error: 'Invalid phone number format (10-20 digits with optional + () - )' };
    }
    return { isValid: true, error: null };
  },

  /**
   * Validate required field with trimming
   * @param {string} value - Value to validate
   * @param {string} fieldName - Field name for error message
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateRequired(value, fieldName = 'This field') {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true, error: null };
  },

  /**
   * Validate minimum length
   * @param {string} value - Value to validate
   * @param {number} minLength - Minimum required length
   * @param {string} fieldName - Field name for error message
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateMinLength(value, minLength, fieldName = 'This field') {
    if (!value) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    if (value.length < minLength) {
      return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
    }
    return { isValid: true, error: null };
  },

  /**
   * Validate maximum length
   * @param {string} value - Value to validate
   * @param {number} maxLength - Maximum allowed length
   * @param {string} fieldName - Field name for error message
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateMaxLength(value, maxLength, fieldName = 'This field') {
    if (value && value.length > maxLength) {
      return { isValid: false, error: `${fieldName} must be less than ${maxLength} characters` };
    }
    return { isValid: true, error: null };
  },

  /**
   * Validate admin creation payload
   * @param {Object} payload - Admin data { email, password, firstName, lastName }
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validateAdminPayload(payload) {
    const errors = {};
    
    // Validate email
    const emailValidation = this.validateEmail(payload.email);
    if (!emailValidation.isValid) errors.email = emailValidation.error;
    
    // Validate password
    const passwordValidation = this.validatePassword(payload.password);
    if (!passwordValidation.isValid) errors.password = passwordValidation.error;
    
    // Validate first name
    const firstNameValidation = this.validateName(payload.firstName, 2, 50);
    if (!firstNameValidation.isValid) errors.firstName = firstNameValidation.error;
    
    // Validate last name
    const lastNameValidation = this.validateName(payload.lastName, 2, 50);
    if (!lastNameValidation.isValid) errors.lastName = lastNameValidation.error;
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate organization creation payload
   * @param {Object} payload - Organization data { name, description }
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validateOrganizationPayload(payload) {
    const errors = {};
    
    // Validate name
    const nameValidation = this.validateRequired(payload.name, 'Organization name');
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error;
    } else {
      const lengthValidation = this.validateMaxLength(payload.name, 100, 'Organization name');
      if (!lengthValidation.isValid) errors.name = lengthValidation.error;
    }
    
    // Validate description (optional but if provided, check length)
    if (payload.description) {
      const descValidation = this.validateMaxLength(payload.description, 500, 'Description');
      if (!descValidation.isValid) errors.description = descValidation.error;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Sanitize user input to prevent XSS attacks
   * @param {string} input - User input to sanitize
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
    if (!input) return '';
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  /**
   * Validate batch of fields
   * @param {Object} fields - Object with field name as key and value as value
   * @param {Object} rules - Object with field name as key and validation rules as value
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validateBatch(fields, rules) {
    const errors = {};
    
    for (const [fieldName, value] of Object.entries(fields)) {
      if (!rules[fieldName]) continue;
      
      const rule = rules[fieldName];
      
      // Check required
      if (rule.required) {
        const validation = this.validateRequired(value, rule.label || fieldName);
        if (!validation.isValid) {
          errors[fieldName] = validation.error;
          continue;
        }
      }
      
      // Check type-specific validation
      if (!errors[fieldName]) {
        if (rule.type === 'email') {
          const validation = this.validateEmail(value);
          if (!validation.isValid) errors[fieldName] = validation.error;
        } else if (rule.type === 'password') {
          const validation = this.validatePassword(value);
          if (!validation.isValid) errors[fieldName] = validation.error;
        } else if (rule.type === 'username') {
          const validation = this.validateUsername(value);
          if (!validation.isValid) errors[fieldName] = validation.error;
        } else if (rule.type === 'phone') {
          const validation = this.validatePhone(value);
          if (!validation.isValid) errors[fieldName] = validation.error;
        } else if (rule.type === 'url') {
          const validation = this.validateURL(value);
          if (!validation.isValid) errors[fieldName] = validation.error;
        }
      }
      
      // Check length constraints
      if (!errors[fieldName]) {
        if (rule.minLength) {
          const validation = this.validateMinLength(value, rule.minLength, rule.label || fieldName);
          if (!validation.isValid) errors[fieldName] = validation.error;
        }
        
        if (!errors[fieldName] && rule.maxLength) {
          const validation = this.validateMaxLength(value, rule.maxLength, rule.label || fieldName);
          if (!validation.isValid) errors[fieldName] = validation.error;
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate numeric value
   * @param {string|number} value - Value to validate
   * @param {number} min - Minimum value (optional)
   * @param {number} max - Maximum value (optional)
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateNumber(value, min = null, max = null) {
    const num = Number(value);
    
    if (isNaN(num)) {
      return { isValid: false, error: 'Must be a valid number' };
    }
    
    if (min !== null && num < min) {
      return { isValid: false, error: `Must be at least ${min}` };
    }
    
    if (max !== null && num > max) {
      return { isValid: false, error: `Must not exceed ${max}` };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} dateStr - Date string to validate
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateDate(dateStr) {
    if (!dateStr) {
      return { isValid: false, error: 'Date is required' };
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      return { isValid: false, error: 'Date must be in YYYY-MM-DD format' };
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date' };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate textarea input with length limits
   * @param {string} text - Text to validate
   * @param {number} minLength - Minimum characters
   * @param {number} maxLength - Maximum characters
   * @returns {Object} { isValid: boolean, error: string }
   */
  validateTextarea(text, minLength = 10, maxLength = 1000) {
    if (!text || !text.trim()) {
      return { isValid: false, error: 'Content is required' };
    }
    
    if (text.length < minLength) {
      return { isValid: false, error: `Content must be at least ${minLength} characters` };
    }
    
    if (text.length > maxLength) {
      return { isValid: false, error: `Content must not exceed ${maxLength} characters` };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Check if value is empty
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  /**
   * Sanitize HTML to prevent XSS
   * @param {string} html - HTML string to sanitize
   * @returns {string} Sanitized HTML
   */
  sanitizeHTML(html) {
    if (!html) return '';
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return html.replace(/[&<>"']/g, char => map[char]);
  },

  /**
   * Format validation errors for display
   * @param {Object} errors - Errors object from validation
   * @returns {string} Formatted error message
   */
  formatErrors(errors) {
    return Object.entries(errors)
      .map(([field, error]) => `• ${field}: ${error}`)
      .join('\n');
  },

  /**
   * Check password strength level
   * @param {string} password - Password to check
   * @returns {Object} { strength: 'weak'|'medium'|'strong', percentage: number }
   */
  checkPasswordStrength(password) {
    let strength = 0;
    
    // Check length
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    
    // Check character types
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    
    let level = 'weak';
    if (strength >= 60) level = 'strong';
    else if (strength >= 40) level = 'medium';
    
    return { strength: level, percentage: Math.min(strength, 100) };
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validation;
}
