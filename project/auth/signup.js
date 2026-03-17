// ── Multi-step navigation ──
let currentStep = 1;
const totalSteps = 3;

function goToStep(n) {
  document.getElementById(`stepPanel${currentStep}`).style.display = 'none';
  document.getElementById(`step${currentStep}`).classList.remove('active');
  if (n > currentStep) document.getElementById(`step${currentStep}`).classList.add('done');
  else document.getElementById(`step${currentStep}`).classList.remove('done');

  currentStep = n;
  document.getElementById(`stepPanel${currentStep}`).style.display = 'block';
  document.getElementById(`step${currentStep}`).classList.add('active');

  document.getElementById('backBtn').style.display = currentStep > 1 ? 'block' : 'none';
  document.getElementById('nextBtn').style.display = currentStep < totalSteps ? 'block' : 'none';
  document.getElementById('submitBtn').style.display = currentStep === totalSteps ? 'block' : 'none';
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearStepErrors() {
  ['usernameError','phoneError','emailError','passwordError','confirmError']
    .forEach(id => showErr(id, ''));
}

function validateStep(step) {
  const AUTH_MODE = window.RUNTIME_ENV ? window.RUNTIME_ENV.AUTH_MODE : 'EMAIL';

  if (step === 1) {
    const raw = document.getElementById('username').value;
    if (!raw || !raw.trim()) { showErr('usernameError', 'Username is required'); return false; }
    if (/\s/.test(raw)) { showErr('usernameError', 'Spaces are not allowed in username'); return false; }
    if (raw.trim().length < 2) { showErr('usernameError', 'Username must be at least 2 characters'); return false; }
    if (raw.trim().length > 20) { showErr('usernameError', 'Username must be max 20 characters'); return false; }
    showErr('usernameError', '');
    return true;
  }

  if (step === 2) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sel = document.getElementById('countryCode');
    const reqLen = sel && sel.options[sel.selectedIndex] ? Number(sel.options[sel.selectedIndex].dataset.length) : 0;

    if (AUTH_MODE === 'EMAIL') {
      const email = document.getElementById('email').value.trim();
      if (!email) { showErr('emailError', 'Email address is required'); return false; }
      if (!emailRegex.test(email)) { showErr('emailError', 'Enter a valid email (e.g. you@example.com)'); return false; }
      showErr('emailError', '');
      return true;
    }

    if (AUTH_MODE === 'PHONE') {
      const phone = document.getElementById('phone').value.trim();
      if (!phone) { showErr('phoneError', 'Phone number is required'); return false; }
      if (reqLen && phone.length < reqLen) { showErr('phoneError', `Phone must be exactly ${reqLen} digits`); return false; }
      showErr('phoneError', '');
      return true;
    }

    if (AUTH_MODE === 'BOTH') {
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      if (!phone) { showErr('phoneError', 'Phone number is required'); return false; }
      if (reqLen && phone.length < reqLen) { showErr('phoneError', `Phone must be exactly ${reqLen} digits`); return false; }
      showErr('phoneError', '');
      if (!email) { showErr('emailError', 'Email address is required'); return false; }
      if (!emailRegex.test(email)) { showErr('emailError', 'Enter a valid email (e.g. you@example.com)'); return false; }
      showErr('emailError', '');
      return true;
    }

    if (AUTH_MODE === 'EITHER') {
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      if (!phone && !email) { showErr('phoneError', 'Enter either phone or email'); return false; }
      if (email && !emailRegex.test(email)) { showErr('emailError', 'Enter a valid email (e.g. you@example.com)'); return false; }
      if (phone && reqLen && phone.length < reqLen) { showErr('phoneError', `Phone must be exactly ${reqLen} digits`); return false; }
      showErr('phoneError', ''); showErr('emailError', '');
      return true;
    }

    return true;
  }

  return true;
}

document.getElementById('nextBtn').addEventListener('click', () => {
  if (validateStep(currentStep)) goToStep(currentStep + 1);
});
document.getElementById('backBtn').addEventListener('click', () => {
  if (currentStep > 1) { clearStepErrors(); goToStep(currentStep - 1); }
});

// ── Password strength ──
const passwordInput = document.getElementById('password');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

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

// ── Password toggle eye ──
function setupToggleEye() {
  const eyeButtons = document.querySelectorAll('.toggle-eye');
  console.log('Found toggle-eye buttons:', eyeButtons.length);
  
  eyeButtons.forEach((eye) => {
    eye.style.cursor = 'pointer';
    eye.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      
      console.log('Toggle clicked for:', targetId, 'Input found:', !!input);
      
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

// Setup immediately and on DOM ready
setupToggleEye();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupToggleEye);
}
