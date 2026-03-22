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

    const validationError = document.getElementById("validationError");
    const formError = document.getElementById("formError");
    const resetSuccess = document.getElementById("resetSuccess");
    const forgotError = document.getElementById("forgotError");
    const submitBtn = form.querySelector("button[type='submit']");

    // Clear all previous messages
    resetSuccess.textContent = "";
    forgotError.textContent = "";
    validationError.textContent = "";
    formError.textContent = "";

    const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
    const requiredLength = Number(selectedOption.dataset.length);

    if (phoneInput.value && phoneInput.value.length !== requiredLength) {
      const errorMsg = messages.phoneLength(requiredLength);
      validationError.textContent = errorMsg;
      return;
    }

    if (emailInput.value && !emailRegex.test(emailInput.value.trim())) {
      const errorMsg = messages.emailInvalid;
      forgotError.textContent = errorMsg;
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
      console.log("📧 Forgot Password attempt:");
      console.log("   Email:", emailInput.value || "empty");
      console.log("   Phone:", localNumber || "empty");
      console.log("   Country Code:", countryCode);
      console.log("   Request body:", JSON.stringify(requestBody, null, 2));
      
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

      console.log("📡 Forgot password response:");
      console.log("   Status:", res.status);
      console.log("   Data:", data);

      if (!res.ok || !data.success) {
        console.log("❌ Failed to send reset link");
        resetSuccess.textContent = "";
        
        // Display backend error message
        const errorMessage = data.message || data.error || "Failed to send reset link. Please try again.";
        forgotError.textContent = errorMessage;
        
        return;
      }

      console.log("✅ Reset link sent successfully");
      // Store info for OTP/reset page
      const contactMode = data.data?.contactMode || (emailInput.value ? "EMAIL" : "PHONE");
      localStorage.setItem("otpDeliveryMode", contactMode);
      localStorage.setItem("otpPurpose", "PASSWORD_RESET");
      localStorage.setItem("signupEmail", emailInput.value || "");
      localStorage.setItem("signupPhone", localNumber ? `+${countryCode}${localNumber}` : "");

      console.log("💾 Stored in localStorage:");
      console.log("   otpDeliveryMode:", contactMode);
      console.log("   otpPurpose: PASSWORD_RESET");
      console.log("   signupEmail:", emailInput.value || "empty");
      console.log("   signupPhone:", localNumber ? `+${countryCode}${localNumber}` : "empty");

      resetSuccess.textContent = "Password reset link sent! Redirecting...";
      setTimeout(() => {
        console.log("→ Redirecting to otp.html");
        window.location.href = "otp.html";
      }, 1000);
      // Reset form
      phoneInput.value = "";
      emailInput.value = "";
      applyAuthMode(AUTH_MODE, phoneField, emailField, phoneInput, emailInput, phoneDropdown);

    } catch (err) {
      console.log("❌ Forgot password error:", err);
      forgotError.textContent = "Network error. Please check your connection.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Reset Link";
    }
  });
}

function getDeviceUUID() {
  let uuid = localStorage.getItem("deviceUUID");
  if (!uuid) { uuid = crypto.randomUUID(); localStorage.setItem("deviceUUID", uuid); }
  return uuid;
}
