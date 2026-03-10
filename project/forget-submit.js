export function initFormSubmit({ 
  form, 
  phoneField, 
  emailField, 
  phoneInput, 
  emailInput, 
  countryCodeSelect, 
  messages, 
  emailRegex, 
  applyAuthMode, 
  AUTH_MODE,
  phoneDropdown
}) {
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const phoneError = document.getElementById("phoneError");
    const resetSuccess = document.getElementById("resetSuccess");
    const submitBtn = form.querySelector("button[type='submit']");

    resetSuccess.textContent = "";
    phoneError.textContent = "";

    const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
    const requiredLength = Number(selectedOption.dataset.length);

    if (phoneInput.value && phoneInput.value.length !== requiredLength) {
      alert(messages.phoneLength(requiredLength));
      return;
    }

    if (emailInput.value && !emailRegex.test(emailInput.value.trim())) {
      alert(messages.emailInvalid);
      return;
    }

    const countryCode = countryCodeSelect.value.replace("+", "");
    const localNumber = phoneInput.value.trim();

    const requestBody = {};
    if (emailInput.value) requestBody.email = emailInput.value.trim();
    if (localNumber) {
      requestBody.countryCode = countryCode;
      requestBody.localNumber = localNumber;
      requestBody.phone = `+${countryCode}${localNumber}`;
    }

    const API_BASE = window.RUNTIME_ENV.API_BASE_URL;
    const deviceUUID = getDeviceUUID();

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const res = await fetch(`${API_BASE}/password/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-uuid": deviceUUID,
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        resetSuccess.textContent = "";
        alert(data.message || "Failed to send reset link.");
        return;
      }

      // Store info for OTP/reset page
      const contactMode = data.data?.contactMode || (emailInput.value ? "EMAIL" : "PHONE");
      localStorage.setItem("otpDeliveryMode", contactMode);
      localStorage.setItem("otpPurpose", "PASSWORD_RESET");
      localStorage.setItem("signupEmail", emailInput.value || "");
      localStorage.setItem("signupPhone", localNumber ? `+${countryCode}${localNumber}` : "");

      window.location.href = "otp.html";
      // Reset form
      phoneInput.value = "";
      emailInput.value = "";
      applyAuthMode(AUTH_MODE, phoneField, emailField, phoneInput, emailInput, phoneDropdown);

    } catch (err) {
      alert("Network error. Please check your connection.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });
}

function getDeviceUUID() {
  let uuid = localStorage.getItem("deviceUUID");
  if (!uuid) { uuid = crypto.randomUUID(); localStorage.setItem("deviceUUID", uuid); }
  return uuid;
}
