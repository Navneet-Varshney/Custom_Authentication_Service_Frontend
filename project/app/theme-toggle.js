const DASHBOARD_THEME_KEY = "dashboardTheme";

function applyDashboardTheme(theme, persist = true) {
  const safeTheme = theme === "dark" ? "dark" : "light";
  const body = document.body;

  body.classList.remove("theme-light", "theme-dark");
  body.classList.add(`theme-${safeTheme}`);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    const icon = btn.querySelector("[data-theme-icon]");
    const switchingTo = safeTheme === "dark" ? "light" : "dark";
    if (icon) {
      icon.textContent = safeTheme === "dark" ? "light_mode" : "dark_mode";
    }
    btn.title = `Switch to ${switchingTo} mode`;
    btn.setAttribute("aria-label", `Switch to ${switchingTo} mode`);
  });

  if (persist) {
    localStorage.setItem(DASHBOARD_THEME_KEY, safeTheme);
  }
}

function initializeThemeToggle() {
  const savedTheme = localStorage.getItem(DASHBOARD_THEME_KEY);
  applyDashboardTheme(savedTheme === "dark" ? "dark" : "light", false);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const isDark = document.body.classList.contains("theme-dark");
      applyDashboardTheme(isDark ? "light" : "dark");
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeThemeToggle);
} else {
  initializeThemeToggle();
}
