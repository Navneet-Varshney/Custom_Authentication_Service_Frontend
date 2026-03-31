/**
 * config.js
 * Field validation rules, lengths, and patterns
 * Like backend's fields-length.config.js & validation.config.js
 */

// ═════════════════════════════════════════════════════════════════════════════
// FIELD LENGTH CONSTRAINTS
// ═════════════════════════════════════════════════════════════════════════════

export const FIELD_LENGTHS = {
  PROJECT: {
    NAME: { min: 5, max: 100 },
    DESCRIPTION: { min: 10, max: 1000 },
    PROBLEM_STATEMENT: { min: 10, max: 1000 },
    GOAL: { min: 10, max: 1000 }
  },
  
  STAKEHOLDER: {
    ROLE: { min: 1, max: 50 }
  },
  
  REQUIREMENT: {
    TITLE: { min: 5, max: 200 },
    DESCRIPTION: { min: 0, max: 1000 }
  },
  
  SCOPE: {
    TITLE: { min: 5, max: 200 },
    DESCRIPTION: { min: 0, max: 1000 }
  },
  
  FEATURE: {
    TITLE: { min: 5, max: 200 },
    DESCRIPTION: { min: 0, max: 1000 }
  },
  
  VISION: {
    VISION: { min: 10, max: 2000 }
  },
  
  COMMENT: {
    TEXT: { min: 1, max: 1000 }
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// VALIDATION PATTERNS
// ═════════════════════════════════════════════════════════════════════════════

export const VALIDATION_PATTERNS = {
  // Email pattern
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Phone pattern (basic)
  PHONE: /^[0-9]{10,}$/,
  
  // Custom USR ID (USR followed by 7 digits)
  USER_ID: /^USR\d{7}$/,
  
  // MongoDB ObjectId
  MONGO_ID: /^[a-f\d]{24}$/i,
  
  // Alphanumeric with spaces and hyphens
  ALPHANUMERIC: /^[a-zA-Z0-9\s\-]+$/,
  
  // URL pattern
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  
  // Number (integer or decimal)
  NUMBER: /^\d+(\.\d+)?$/,
  
  // Positive number
  POSITIVE_NUMBER: /^[1-9]\d*$/
};

// ═════════════════════════════════════════════════════════════════════════════
// VALIDATION RULES
// ═════════════════════════════════════════════════════════════════════════════

export const VALIDATION_RULES = {
  // Project validation
  PROJECT_NAME: (value) => {
    if (!value || value.trim().length === 0) return 'Project name is required';
    if (value.length < FIELD_LENGTHS.PROJECT.NAME.min) 
      return `Name must be at least ${FIELD_LENGTHS.PROJECT.NAME.min} characters`;
    if (value.length > FIELD_LENGTHS.PROJECT.NAME.max) 
      return `Name cannot exceed ${FIELD_LENGTHS.PROJECT.NAME.max} characters`;
    return null;
  },
  
  PROJECT_DESCRIPTION: (value) => {
    if (!value || value.trim().length === 0) return 'Description is required';
    if (value.length < FIELD_LENGTHS.PROJECT.DESCRIPTION.min) 
      return `Description must be at least ${FIELD_LENGTHS.PROJECT.DESCRIPTION.min} characters`;
    if (value.length > FIELD_LENGTHS.PROJECT.DESCRIPTION.max) 
      return `Description cannot exceed ${FIELD_LENGTHS.PROJECT.DESCRIPTION.max} characters`;
    return null;
  },
  
  PROJECT_PROBLEM_STATEMENT: (value) => {
    if (!value || value.trim().length === 0) return 'Problem statement is required';
    if (value.length < FIELD_LENGTHS.PROJECT.PROBLEM_STATEMENT.min) 
      return `Problem statement must be at least ${FIELD_LENGTHS.PROJECT.PROBLEM_STATEMENT.min} characters`;
    if (value.length > FIELD_LENGTHS.PROJECT.PROBLEM_STATEMENT.max) 
      return `Problem statement cannot exceed ${FIELD_LENGTHS.PROJECT.PROBLEM_STATEMENT.max} characters`;
    return null;
  },
  
  PROJECT_GOAL: (value) => {
    if (!value || value.trim().length === 0) return 'Goal is required';
    if (value.length < FIELD_LENGTHS.PROJECT.GOAL.min) 
      return `Goal must be at least ${FIELD_LENGTHS.PROJECT.GOAL.min} characters`;
    if (value.length > FIELD_LENGTHS.PROJECT.GOAL.max) 
      return `Goal cannot exceed ${FIELD_LENGTHS.PROJECT.GOAL.max} characters`;
    return null;
  },
  
  // Requirement validation
  REQUIREMENT_TITLE: (value) => {
    if (!value || value.trim().length === 0) return 'Requirement title is required';
    if (value.length < FIELD_LENGTHS.REQUIREMENT.TITLE.min) 
      return `Title must be at least ${FIELD_LENGTHS.REQUIREMENT.TITLE.min} characters`;
    if (value.length > FIELD_LENGTHS.REQUIREMENT.TITLE.max) 
      return `Title cannot exceed ${FIELD_LENGTHS.REQUIREMENT.TITLE.max} characters`;
    return null;
  },
  
  // Scope validation
  SCOPE_TITLE: (value) => {
    if (!value || value.trim().length === 0) return 'Scope title is required';
    if (value.length < FIELD_LENGTHS.SCOPE.TITLE.min) 
      return `Title must be at least ${FIELD_LENGTHS.SCOPE.TITLE.min} characters`;
    if (value.length > FIELD_LENGTHS.SCOPE.TITLE.max) 
      return `Title cannot exceed ${FIELD_LENGTHS.SCOPE.TITLE.max} characters`;
    return null;
  },
  
  // Comment validation
  COMMENT_TEXT: (value) => {
    if (!value || value.trim().length === 0) return 'Comment cannot be empty';
    if (value.length > FIELD_LENGTHS.COMMENT.TEXT.max) 
      return `Comment cannot exceed ${FIELD_LENGTHS.COMMENT.TEXT.max} characters`;
    return null;
  },
  
  // Number validation
  POSITIVE_NUMBER: (value) => {
    if (!value) return null; // Optional field
    if (isNaN(value)) return 'Must be a valid number';
    if (value < 0) return 'Cannot be negative';
    return null;
  },
  
  // Email validation
  EMAIL: (value) => {
    if (!value) return null; // Optional field
    if (!VALIDATION_PATTERNS.EMAIL.test(value)) return 'Invalid email format';
    return null;
  },
  
  // Enum validation
  ENUM: (value, allowedValues) => {
    if (!value) return 'Selection is required';
    if (!allowedValues.includes(value)) return 'Invalid selection';
    return null;
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// FORM FIELD DEFINITIONS
// ═════════════════════════════════════════════════════════════════════════════

export const FORM_FIELDS = {
  CREATE_PROJECT: {
    NAME: {
      id: 'name',
      label: 'Project Name',
      type: 'text',
      required: true,
      validation: VALIDATION_RULES.PROJECT_NAME,
      placeholder: 'Enter project name'
    },
    DESCRIPTION: {
      id: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      validation: VALIDATION_RULES.PROJECT_DESCRIPTION,
      placeholder: 'Describe the project in detail'
    },
    PROBLEM_STATEMENT: {
      id: 'problemStatement',
      label: 'Problem Statement',
      type: 'textarea',
      required: true,
      validation: VALIDATION_RULES.PROJECT_PROBLEM_STATEMENT,
      placeholder: 'What problem does this project solve?'
    },
    GOAL: {
      id: 'goal',
      label: 'Project Goal',
      type: 'textarea',
      required: true,
      validation: VALIDATION_RULES.PROJECT_GOAL,
      placeholder: 'What is the primary goal?'
    },
    PROJECT_TYPE: {
      id: 'projectType',
      label: 'Project Type',
      type: 'select',
      required: true,
      options: ['development', 'enhancement', 'maintenance', 'other']
    },
    PROJECT_CATEGORY: {
      id: 'projectCategory',
      label: 'Project Category',
      type: 'select',
      required: true,
      options: ['individual', 'organization', 'multi_organization']
    },
    EXPECTED_BUDGET: {
      id: 'expectedBudget',
      label: 'Expected Budget',
      type: 'number',
      required: false,
      validation: VALIDATION_RULES.POSITIVE_NUMBER,
      placeholder: 'Enter budget amount'
    },
    EXPECTED_TIMELINE: {
      id: 'expectedTimelineInDays',
      label: 'Expected Timeline (Days)',
      type: 'number',
      required: false,
      validation: VALIDATION_RULES.POSITIVE_NUMBER,
      placeholder: 'Enter timeline in days'
    }
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// ERROR MESSAGES & CODES
// ═════════════════════════════════════════════════════════════════════════════

export const ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR'
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.BAD_REQUEST]: 'Invalid request. Please check your input.',
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized. Please login.',
  [ERROR_CODES.FORBIDDEN]: 'You do not have permission.',
  [ERROR_CODES.NOT_FOUND]: 'Resource not found.',
  [ERROR_CODES.INTERNAL_ERROR]: 'Server error. Please try again later.',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.'
};

// ═════════════════════════════════════════════════════════════════════════════
// HTTP STATUS CODES
// ═════════════════════════════════════════════════════════════════════════════

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// ═════════════════════════════════════════════════════════════════════════════
// API TIMEOUT & RETRY
// ═════════════════════════════════════════════════════════════════════════════

export const API_OPTIONS = {
  TIMEOUT: 30000,           // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,        // 1 second
  CACHE_DURATION: 300000    // 5 minutes
};

// ═════════════════════════════════════════════════════════════════════════════
// FORM VALIDATION HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validate form data against field definitions
 * @param {HTMLFormElement} formElement - Form to validate
 * @param {Object} fieldDefinitions - Field config from FORM_FIELDS
 * @returns {Object} { isValid: boolean, errors: {fieldId: errorMessage} }
 */
export function validateFormData(formElement, fieldDefinitions) {
  const errors = {};
  
  if (!formElement || !fieldDefinitions) {
    return { isValid: true, errors: {} };
  }
  
  Object.values(fieldDefinitions).forEach(field => {
    const element = formElement.querySelector(`[name="${field.id}"], [id="${field.id}"]`);
    if (!element) return;
    
    const value = element.value.trim();
    
    // Check required
    if (field.required && (!value || value.length === 0)) {
      errors[field.id] = `${field.label} is required`;
      return;
    }
    
    // Run validation rule if provided
    if (field.validation && typeof field.validation === 'function') {
      const error = field.validation(value);
      if (error) {
        errors[field.id] = error;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Display form validation errors
 * @param {HTMLFormElement} formElement - Form element
 * @param {Object} errors - Map of fieldId to error message
 */
export function displayFormErrors(formElement, errors = {}) {
  // Clear previous errors
  clearFormErrors(formElement);
  
  if (!formElement) return;
  
  // Display new errors
  Object.entries(errors).forEach(([fieldId, errorMessage]) => {
    const element = formElement.querySelector(`[name="${fieldId}"], [id="${fieldId}"]`);
    if (!element) return;
    
    // Add error class to field
    element.classList.add('error');
    
    // Create and insert error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = errorMessage;
    errorDiv.setAttribute('data-field', fieldId);
    
    // Insert after the field
    element.after(errorDiv);
  });
}

/**
 * Clear all form validation errors
 * @param {HTMLFormElement} formElement - Form element
 */
export function clearFormErrors(formElement) {
  if (!formElement) return;
  
  // Remove error classes
  formElement.querySelectorAll('.error').forEach(el => {
    el.classList.remove('error');
  });
  
  // Remove error messages
  formElement.querySelectorAll('.form-error').forEach(el => {
    el.remove();
  });
}

export default {
  FIELD_LENGTHS,
  VALIDATION_PATTERNS,
  VALIDATION_RULES,
  FORM_FIELDS,
  ERROR_CODES,
  ERROR_MESSAGES,
  HTTP_STATUS,
  API_OPTIONS,
  validateFormData,
  displayFormErrors,
  clearFormErrors
};
