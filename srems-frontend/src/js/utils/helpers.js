/**
 * helpers.js
 * Utility helper functions for common operations
 */

import { FIELD_LENGTHS, VALIDATION_RULES, VALIDATION_PATTERNS } from './config.js';
import { PHASES, PHASE_LABELS, STATUS_COLORS, PROJECT_STATUS } from './constants.js';

/**
 * Validate form data against field rules
 */
export function validateFormData(formData, fieldDefinitions) {
  const errors = {};
  
  for (const [fieldName, definition] of Object.entries(fieldDefinitions)) {
    const value = formData[definition.id];
    
    // Check required
    if (definition.required && (!value || value.trim?.() === '')) {
      errors[definition.id] = `${definition.label} is required`;
      continue;
    }

    // Validate using validation function
    if (definition.validation && value) {
      const error = definition.validation(value);
      if (error) {
        errors[definition.id] = error;
      }
    }

    // Validate enum options
    if (definition.type === 'select' && value && definition.options) {
      if (!definition.options.includes(value)) {
        errors[definition.id] = `Invalid ${definition.label}`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Format date to readable format
 */
export function formatDate(dateString, format = 'DD/MM/YYYY') {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  
  return date.toLocaleDateString('en-IN', options);
}

/**
 * Format date with time
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return formatDate(dateString);
}

/**
 * Capitalize string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitleCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .trim();
}

/**
 * Get status badge color
 */
export function getStatusColor(status) {
  return STATUS_COLORS[status] || '#6C757D';
}

/**
 * Check if project phase is accessible
 */
export function canAccessPhase(currentPhase, targetPhase) {
  const phaseOrder = Object.values(PHASES);
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const targetIndex = phaseOrder.indexOf(targetPhase);
  
  return targetIndex <= currentIndex;
}

/**
 * Get phase progress percentage
 */
export function getPhaseProgress(currentPhase) {
  const phaseOrder = Object.values(PHASES);
  const currentIndex = phaseOrder.indexOf(currentPhase);
  
  if (currentIndex === -1) return 0;
  return ((currentIndex + 1) / phaseOrder.length) * 100;
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects (shallow)
 */
export function mergeObjects(target, source) {
  return { ...target, ...source };
}

/**
 * Check if email is valid
 */
export function isValidEmail(email) {
  return VALIDATION_PATTERNS.EMAIL.test(email);
}

/**
 * Check if phone is valid
 */
export function isValidPhone(phone) {
  return VALIDATION_PATTERNS.PHONE.test(phone);
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Debounce function for performance
 */
export function debounce(fn, delay = 300) {
  let timeoutId = null;
  
  return function debounced(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Throttle function for performance
 */
export function throttle(fn, limit = 300) {
  let inThrottle = false;
  
  return function throttled(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Get query param from URL
 */
export function getQueryParam(param) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param);
}

/**
 * Build query string from object
 */
export function buildQueryString(params) {
  return new URLSearchParams(params).toString();
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show confirmation dialog
 */
export function showConfirmDialog(title, message) {
  return new Promise((resolve) => {
    if (confirm(`${title}\n\n${message}`)) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

/**
 * Show modal dialog
 */
export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('show');
  }
}

/**
 * Hide modal dialog
 */
export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    modal.classList.add('hidden');
  }
}

/**
 * Get file extension
 */
export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Check if file is valid (size, type, etc.)
 */
export function isValidFile(file, allowedTypes = [], maxSizeMB = 5) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  return { valid: true };
}

/**
 * CSV to array of objects
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    return obj;
  });
  
  return data;
}

/**
 * Download file
 */
export function downloadFile(content, filename, contentType = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Local storage operations
 */
export const storage = {
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  get: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear()
};

/**
 * Check if user has permission
 */
export function hasPermission(userRole, requiredRoles) {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  
  return requiredRoles.includes(userRole);
}

export default {
  validateFormData,
  formatDate,
  formatDateTime,
  getRelativeTime,
  capitalize,
  camelToTitleCase,
  getStatusColor,
  canAccessPhase,
  getPhaseProgress,
  deepClone,
  mergeObjects,
  isValidEmail,
  isValidPhone,
  sanitizeInput,
  debounce,
  throttle,
  getQueryParam,
  buildQueryString,
  showToast,
  showConfirmDialog,
  showModal,
  hideModal,
  getFileExtension,
  isValidFile,
  parseCSV,
  downloadFile,
  storage,
  hasPermission
};
