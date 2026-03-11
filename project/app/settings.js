const API_BASE = window.RUNTIME_ENV.API_BASE_URL;

function getDeviceUUID() {
  let uuid = localStorage.getItem("deviceUUID");
  if (!uuid) { uuid = crypto.randomUUID(); localStorage.setItem("deviceUUID", uuid); }
  return uuid;
}

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json", "x-device-uuid": getDeviceUUID() };
  if (token) headers["x-access-token"] = token;
  return headers;
}

function saveNewToken(res) {
  const t = res.headers.get("x-access-token");
  if (t) localStorage.setItem("accessToken", t);
}

// ===== Toggle Eye =====
document.querySelectorAll(".toggle-eye").forEach(eye => {
  eye.addEventListener("click", () => {
    const input = document.getElementById(eye.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});

// ===== Load current account data into form fields =====
async function loadCurrentAccount() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders(),
      credentials: "include",
    });
    saveNewToken(res);
    if (res.status === 401) { window.location.href = "../auth/login.html"; return; }
    const data = await res.json();
    if (res.ok && data.success) {
      const u = data.data;
      document.getElementById("firstName").value = u.firstName || "";
      document.getElementById("emailUpdate").value = u.email || "";
      document.getElementById("phoneUpdate").value = u.phone || "";
      const enabled = u.isTwoFactorEnabled;
      document.getElementById("twoFaStatus").textContent =
        `2FA is currently: ${enabled ? "✅ Enabled" : "❌ Disabled"}`;
    }
  } catch {}
}

// ===== Update Profile =====
document.getElementById("updateBtn").addEventListener("click", async () => {
  const btn = document.getElementById("updateBtn");
  const updateError = document.getElementById("updateError");
  const updateSuccess = document.getElementById("updateSuccess");
  updateError.textContent = "";
  updateSuccess.textContent = "";

  const body = {};
  const firstName = document.getElementById("firstName").value.trim();
  const email = document.getElementById("emailUpdate").value.trim();
  const phoneRaw = document.getElementById("phoneUpdate").value.trim();

  if (firstName) body.firstName = firstName;
  if (email) body.email = email;
  if (phoneRaw) {
    const match = phoneRaw.match(/^\+(\d{1,3})(\d+)$/);
    if (!match) {
      updateError.textContent = "Phone must be in format +91XXXXXXXXXX";
      return;
    }
    body.countryCode = match[1];
    body.localNumber = match[2];
  }

  btn.disabled = true;
  btn.textContent = "Updating...";

  try {
    const res = await fetch(`${API_BASE}/account/update-details`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      updateError.textContent = data.message || "Update failed.";
    } else {
      updateSuccess.textContent = data.message || "Profile updated successfully!";
    }
  } catch {
    updateError.textContent = "Network error.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Update Profile";
  }
});

// ===== Change Password =====
document.getElementById("changePasswordBtn").addEventListener("click", async () => {
  const btn = document.getElementById("changePasswordBtn");
  const changePasswordError = document.getElementById("changePasswordError");
  const changePasswordSuccess = document.getElementById("changePasswordSuccess");
  changePasswordError.textContent = "";
  changePasswordSuccess.textContent = "";

  const password = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!password || !newPassword || !confirmPassword) {
    changePasswordError.textContent = "All password fields are required.";
    return;
  }
  if (newPassword !== confirmPassword) {
    changePasswordError.textContent = "New passwords do not match.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Changing...";

  try {
    const res = await fetch(`${API_BASE}/account/change-password`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ password, newPassword, confirmPassword }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      changePasswordError.textContent = data.message || "Failed to change password.";
    } else {
      changePasswordSuccess.textContent = data.message || "Password changed successfully!";
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
    }
  } catch {
    changePasswordError.textContent = "Network error.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Change Password";
  }
});

// ===== 2FA Toggle =====
document.getElementById("enable2faBtn").addEventListener("click", () => toggle2FA(true));
document.getElementById("disable2faBtn").addEventListener("click", () => toggle2FA(false));

async function toggle2FA(enable) {
  const twoFaError = document.getElementById("twoFaError");
  const twoFaSuccess = document.getElementById("twoFaSuccess");
  const password = document.getElementById("twoFaPassword").value;
  const btn = enable
    ? document.getElementById("enable2faBtn")
    : document.getElementById("disable2faBtn");

  twoFaError.textContent = "";
  twoFaSuccess.textContent = "";

  if (!password) { twoFaError.textContent = "Password is required."; return; }

  btn.disabled = true;
  btn.textContent = enable ? "Enabling..." : "Disabling...";

  const endpoint = enable
    ? `${API_BASE}/account/enable-2fa`
    : `${API_BASE}/account/disable-2fa`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      twoFaError.textContent = data.message || (enable ? "Failed to enable 2FA." : "Failed to disable 2FA.");
    } else {
      twoFaSuccess.textContent = data.message || (enable ? "2FA enabled!" : "2FA disabled!");
      document.getElementById("twoFaPassword").value = "";
      await loadCurrentAccount();
    }
  } catch {
    twoFaError.textContent = "Network error.";
  } finally {
    btn.disabled = false;
    btn.textContent = enable ? "Enable 2FA" : "Disable 2FA";
  }
}

// ===== Deactivate Account =====
document.getElementById("deactivateBtn").addEventListener("click", async () => {
  const btn = document.getElementById("deactivateBtn");
  const deactivateError = document.getElementById("deactivateError");
  const deactivateSuccess = document.getElementById("deactivateSuccess");
  const password = document.getElementById("deactivatePassword").value;
  deactivateError.textContent = "";
  deactivateSuccess.textContent = "";

  if (!password) { deactivateError.textContent = "Password is required."; return; }
  if (!confirm("Are you sure you want to deactivate your account?")) return;

  btn.disabled = true;
  btn.textContent = "Deactivating...";

  try {
    const res = await fetch(`${API_BASE}/account/deactivate`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      deactivateError.textContent = data.message || "Failed to deactivate account.";
      btn.disabled = false;
      btn.textContent = "Deactivate Account";
      return;
    }
    deactivateSuccess.textContent = data.message || "Account deactivated. Redirecting...";
    setTimeout(() => { window.location.href = "../auth/login.html"; }, 2000);
  } catch {
    deactivateError.textContent = "Network error.";
    btn.disabled = false;
    btn.textContent = "Deactivate Account";
  }
});

// ===== Hard Delete Account =====
document.getElementById("deleteBtn").addEventListener("click", async () => {
  const btn = document.getElementById("deleteBtn");
  const deleteError = document.getElementById("deleteError");
  const deleteSuccess = document.getElementById("deleteSuccess");
  const password = document.getElementById("deletePassword").value;
  deleteError.textContent = "";
  deleteSuccess.textContent = "";

  if (!password) { deleteError.textContent = "Password is required."; return; }
  if (!confirm("This will PERMANENTLY delete your account and all data. This cannot be undone. Are you absolutely sure?")) return;

  btn.disabled = true;
  btn.textContent = "Deleting...";

  try {
    const res = await fetch(`${API_BASE}/account/hard-delete`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      deleteError.textContent = data.message || "Failed to delete account.";
      btn.disabled = false;
      btn.textContent = "Delete Account Permanently";
      return;
    }
    deleteSuccess.textContent = data.message || "Account deleted. Redirecting...";
    setTimeout(() => { window.location.href = "../auth/login.html"; }, 2000);
  } catch {
    deleteError.textContent = "Network error.";
    btn.disabled = false;
    btn.textContent = "Delete Account Permanently";
  }
});

loadCurrentAccount();
