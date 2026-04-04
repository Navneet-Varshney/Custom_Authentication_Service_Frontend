// Theme Management
const THEME_KEY = 'adminPanelTheme';
const SYSTEM_PREFERENCE = window.matchMedia('(prefers-color-scheme: dark)');

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const storedTheme = savedTheme || (SYSTEM_PREFERENCE.matches ? 'dark' : 'light');
  
  setTheme(storedTheme);
  setupThemeToggle();
}

function setTheme(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

function updateThemeIcon(theme) {
  const toggleBtns = document.querySelectorAll('#themeToggle');
  toggleBtns.forEach(btn => {
    const icon = btn.querySelector('.material-icons');
    if (icon) {
      icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
  });
}

function setupThemeToggle() {
  const toggleBtns = document.querySelectorAll('#themeToggle');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
  
  // Listen for system preference changes
  SYSTEM_PREFERENCE.addEventListener('change', (e) => {
    setTheme(e.matches ? 'dark' : 'light');
  });
}

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
  initializeTheme();
}

console.log('✅ Theme module loaded');
