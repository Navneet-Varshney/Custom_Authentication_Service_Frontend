export function initValidation({
  phoneInput,
  emailInput,
  countryCodeSelect,
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
      const validationError = document.getElementById("validationError");
      if (validationError) validationError.textContent = "";
    });
  });

  phoneInput.addEventListener("input", () => {
    const validationError = document.getElementById("validationError");
    phoneInput.value = phoneInput.value.replace(/\D/g, "");
    const selectedOption =
      countryCodeSelect.options[countryCodeSelect.selectedIndex];
    const requiredLength = Number(selectedOption.dataset.length);

    if (phoneInput.value.length === 0) {
      validationError.textContent = messages.phoneRequired;
    } else if (phoneInput.value.length < requiredLength) {
      validationError.textContent = `You must enter ${requiredLength} digits`;
    } else {
      validationError.textContent = "";
    }
  });


}
