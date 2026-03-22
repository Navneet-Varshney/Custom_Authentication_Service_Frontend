export function initValidation({
  phoneInput,
  emailInput,
  countryCodeSelect,
  phoneError,
  messages,
  emailRegex
}) {
  [phoneInput, emailInput].forEach(input => {
    input.addEventListener("input", () => {
      const successMessage = document.getElementById("successMessage");
      if (successMessage) successMessage.textContent = "";
      const resetSuccess = document.getElementById("resetSuccess");
      if (resetSuccess) resetSuccess.textContent = "";
      const forgotError = document.getElementById("forgotError");
      if (forgotError) forgotError.textContent = "";
    });
  });

  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "");
    const selectedOption =
      countryCodeSelect.options[countryCodeSelect.selectedIndex];
    const requiredLength = Number(selectedOption.dataset.length);

    if (phoneInput.value.length === 0) {
      phoneError.textContent = messages.phoneRequired;
    } else if (phoneInput.value.length < requiredLength) {
      phoneError.textContent = `You must enter ${requiredLength} digits`;
    } else {
      phoneError.textContent = "";
    }
  });

  emailInput.addEventListener("input", () => {
    const emailError = document.getElementById("emailError");
    if (!emailInput.value) {
      emailError.textContent = "";
    } else if (!emailRegex.test(emailInput.value.trim())) {
      emailError.textContent = messages.emailInvalid;
    } else {
      emailError.textContent = "";
    }
  });
}
