import { initValidation } from "./reset-validate.js";
import { initFormSubmit } from "./reset-submit.js";

const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const form = document.querySelector(".auth-form");

const messages = window.messages;
const strongPasswordRegex = window.strongPasswordRegex;
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

// ===== Password Strength Meter =====
if (passwordInput) {
  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    strengthBar.className = 'strength-bar' + (val ? ` s${score}` : '');
    strengthText.textContent = val ? strengthLabels[score] : '';
    strengthText.style.color = strengthColors[score];
  });
}

// ===== Eye Toggle Handler (Proven Pattern) =====
function setupToggleEye() {
  const eyeButtons = document.querySelectorAll('.toggle-eye');
  eyeButtons.forEach((eye) => {
    eye.style.cursor = 'pointer';
    eye.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
        } else {
          input.type = 'password';
          this.textContent = '👁';
        }
      }
    });
  });
}

setupToggleEye();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupToggleEye);
}

initValidation({
  passwordInput,
  confirmInput,
  passwordError: document.getElementById("passwordError"),
  confirmError: document.getElementById("confirmError"),
  messages,
  strongPasswordRegex
});

initFormSubmit({
  form,
  passwordInput,
  confirmInput,
  messages,
  strongPasswordRegex
});

