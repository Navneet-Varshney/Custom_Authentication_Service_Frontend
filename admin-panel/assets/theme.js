/**
 * Theme Management Module
 * Handles dark/light theme switching for admin panel
 * Features: System preference detection, accessibility support, persistence
 * Respects WCAG guidelines for color contrast and reduces motion
 */

// Configuration constants
const THEME_KEY = 'adminPanelTheme';
const THEME_TRANSITION_DURATION = 'adminPanelThemeTransitionDuration';
const SYSTEM_PREFERENCE = window.matchMedia('(prefers-color-scheme: dark)');
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Theme configuration with accessibility support
 */
const THEME_CONFIG = {
  dark: {
    name: 'Dark',
    icon: 'light_mode',
    ariaLabel: 'Switch to Light Mode',
    bgColor: '#1a1a1a',
    textColor: '#ffffff',
    contrastRatio: '21:1'
  },
  light: {
    name: 'Light',
    icon: 'dark_mode',
    ariaLabel: 'Switch to Dark Mode',
    bgColor: '#ffffff',
    textColor: '#000000',
    contrastRatio: '21:1'
  }
};

/**
 * Initialize theme on page load
 * Loads saved preference or defaults to system preference
 * Respects reduced motion preferences
 */
function initializeTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const storedTheme = savedTheme || (SYSTEM_PREFERENCE.matches ? 'dark' : 'light');
    
    // Disable transitions during initialization for smooth experience
    disableThemeTransitions();
    console.debug(`🎨 Initializing theme: ${storedTheme} (from ${savedTheme ? 'localStorage' : 'system preference'})`);
    setTheme(storedTheme);
    setupThemeToggle();
  } catch (error) {
    console.error('❌ Theme initialization error:', error);
    setTheme('light'); // Fallback to light theme
  }
  
  // Re-enable transitions after initialization
  setTimeout(() => enableThemeTransitions(), 100);
}

/**
 * Apply theme to document
 * Updates data-theme attribute and saves preference
 * Ensures accessibility attributes are updated
 * @param {string} theme - Theme name: 'dark' or 'light'
 */
function setTheme(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  html.setAttribute('color-scheme', theme);
  
  // Update aria-label for accessibility
  document.querySelectorAll('#themeToggle').forEach(btn => {
    const config = THEME_CONFIG[theme];
    if (config) {
      btn.setAttribute('aria-label', config.ariaLabel);
      btn.setAttribute('title', config.ariaLabel);
    }
  });
  
  localStorage.setItem(THEME_KEY, theme);
  console.log(`🎨 Theme changed to: ${theme}`);
  
  // Emit custom event for theme change
  window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
  updateThemeIcon(theme);
}

/**
 * Toggle between light and dark themes
 * Switches from current theme to opposite
 * Supports keyboard accessibility (Enter/Space)
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  console.log(`🔄 Theme toggle: ${current} → ${newTheme}`);
  setTheme(newTheme);
}

/**
 * Disable CSS transitions for theme change
 * Improves perceived performance during initialization
 * Respects user's motion preferences
 */
function disableThemeTransitions() {
  if (PREFERS_REDUCED_MOTION.matches) return;
  
  const style = document.createElement('style');
  style.id = 'theme-transition-disabled';
  style.textContent = '* { transition: none !important; }';
  document.head.appendChild(style);
}

/**
 * Re-enable CSS transitions
 * Called after theme initialization
 */
function enableThemeTransitions() {
  const style = document.getElementById('theme-transition-disabled');
  if (style) {
    style.remove();
  }
}

/**
 * Update theme toggle button icon
 * Shows appropriate icon based on current theme
 * Maintains accessibility with aria-labels
 * @param {string} theme - Current theme ('dark' or 'light')
 */
function updateThemeIcon(theme) {
  const toggleBtns = document.querySelectorAll('#themeToggle');
  toggleBtns.forEach(btn => {
    const icon = btn.querySelector('.material-icons');
    if (icon) {
      const config = THEME_CONFIG[theme];
      icon.textContent = config.icon;
      icon.setAttribute('aria-hidden', 'true');
    }
    
    // Update button accessibility
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
  });
}

/**
 * Setup theme toggle button listeners
 * Attaches click handlers and keyboard support
 * Listens for system preference changes
 */
function setupThemeToggle() {
  const toggleBtns = document.querySelectorAll('#themeToggle');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
    
    // Add keyboard support (Enter and Space)
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  });
  
  // Listen for system preference changes
  SYSTEM_PREFERENCE.addEventListener('change', (e) => {
    const newTheme = e.matches ? 'dark' : 'light';
    console.log(`🔄 System preference changed to: ${newTheme}`);
    // Only auto-switch if user hasn't manually set preference
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(newTheme);
    }
  });
  
  // Listen for reduced motion preference changes
  PREFERS_REDUCED_MOTION.addEventListener('change', (e) => {
    const prefersReduced = e.matches;
    document.documentElement.style.transitionDuration = prefersReduced ? '0s' : '';
    console.log(`🎬 Reduced motion preference: ${prefersReduced ? 'enabled' : 'disabled'})`);
  });
}

/**
 * Get current theme
 * @returns {string} Current theme ('dark' or 'light')
 */
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

/**
 * Force theme without saving preference
 * Useful for temporary theme changes
 * @param {string} theme - Theme to apply
 */
function applyThemeTemporarily(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
  console.log(`🎨 Applied temporary theme: ${theme}`);
}

/**
 * Reset theme to system preference
 * Clears saved user preference
 */
function resetThemeToSystem() {
  localStorage.removeItem(THEME_KEY);
  const newTheme = SYSTEM_PREFERENCE.matches ? 'dark' : 'light';
  setTheme(newTheme);
  console.log(`🔄 Theme reset to system preference: ${newTheme}`);
}

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
  initializeTheme();
}

console.log('✅ Theme module loaded');
