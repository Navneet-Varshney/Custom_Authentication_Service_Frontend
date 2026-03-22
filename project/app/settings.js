const API_BASE = window.RUNTIME_ENV.API_BASE_URL;
console.log("📄 settings.js loading...");
console.log("   📍 API_BASE:", API_BASE);

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

// ===== Load current account data into form fields =====
async function loadCurrentAccount() {
  console.log("🔄 Loading current account data for pre-fill...");
  
  const firstNameField = document.getElementById("firstName");
  const emailField = document.getElementById("emailUpdate");
  const phoneField = document.getElementById("phoneUpdate");
  
  // Show loading state
  firstNameField.placeholder = "Loading...";
  emailField.placeholder = "Loading...";
  phoneField.placeholder = "Loading...";
  firstNameField.disabled = true;
  emailField.disabled = true;
  phoneField.disabled = true;
  
  try {
    console.log("📡 Fetching user data from:", `${API_BASE}/auth/me`);
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders(),
      credentials: "include",
    });
    console.log("   - Response status:", res.status);
    saveNewToken(res);
    
    if (res.status === 401) { 
      console.log("❌ Unauthorized, redirecting to login");
      window.location.href = "../auth/login.html"; 
      return; 
    }
    
    const data = await res.json();
    console.log("📦 Full User data received:", JSON.stringify(data, null, 2));
    
    if (res.ok && data.success) {
      const backendData = data.data;
      console.log("🔍 Backend Data Keys:", Object.keys(backendData));
      
      // Extract from backend response (with correct key names and fallbacks)
      const firstName = backendData["First Name"] || backendData["firstName"] || "";
      const email = backendData["Email"] || backendData["email"] || "";
      const phone = backendData["Phone"] || backendData["phone"] || "";
      
      console.log("✅ Extracted values:");
      console.log("   - firstName:", firstName, "| from key: 'First Name'");
      console.log("   - email:", email, "| from key: 'Email'");
      console.log("   - phone:", phone, "| from key: 'Phone'");
      
      // 2FA: Fallback to both possible backend keys + localStorage cache
      let isTwoFaEnabled = (backendData["2FA Enabled"] === "Yes");
      
      // Fallback to alternate key name if first didn't work
      if (!isTwoFaEnabled) {
        isTwoFaEnabled = (backendData["isTwoFactorEnabled"] === "Yes");
      }
      
      // If backend says "No" but localStorage has newer cached "enabled" state, use cache
      if (!isTwoFaEnabled) {
        const cached2FA = localStorage.getItem("twoFAUpdated");
        if (cached2FA) {
          try {
            const parsed = JSON.parse(cached2FA);
            const cacheAge = new Date().getTime() - parsed.timestamp;
            // Use cache if less than 2 minutes old
            if (cacheAge < 120000 && parsed.enabled === true) {
              console.log("⚠️ Backend says 2FA disabled, but using cached 'enabled' state (age:", cacheAge + "ms)");
              isTwoFaEnabled = true;
            }
          } catch (e) {
            // Invalid cache, ignore
          }
        }
      }
      
      console.log("   - 2FA Enabled:", isTwoFaEnabled);
      
      // Pre-fill form fields
      firstNameField.value = firstName;
      emailField.value = email;
      phoneField.value = phone;
      
      console.log("✅ Form fields populated successfully");
      
      // Set 2FA status
      const twoFaStatus = document.getElementById("twoFaStatusText");
      if (twoFaStatus) {
        twoFaStatus.textContent = `2FA is currently: ${isTwoFaEnabled ? "✅ Enabled" : "❌ Disabled"}`;
      }
    } else {
      console.error("❌ API Error:", data.message);
    }
  } catch (err) {
    console.error("❌ Failed to load account data:", err);
  } finally {
    // Re-enable form fields
    firstNameField.disabled = false;
    emailField.disabled = false;
    phoneField.disabled = false;
    firstNameField.placeholder = "First name";
    emailField.placeholder = "Email address";
    phoneField.placeholder = "+91XXXXXXXXXX";
  }
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

  console.log("🔍 Update Profile - Form Values:");
  console.log("   - firstName:", firstName);
  console.log("   - email:", email);
  console.log("   - phoneRaw:", phoneRaw);

  if (firstName) body.firstName = firstName;
  if (email) body.email = email;
  if (phoneRaw) {
    const match = phoneRaw.match(/^\+(\d{1,3})(\d+)$/);
    if (!match) {
      updateError.textContent = "Phone must be in format +91XXXXXXXXXX";
      console.error("❌ Phone validation failed:", phoneRaw);
      return;
    }
    body.countryCode = match[1];
    body.localNumber = match[2];
    console.log("   - Phone parsed - countryCode:", match[1], "localNumber:", match[2]);
  }

  console.log("📤 Sending Update Request:");
  console.log("   - Endpoint:", `${API_BASE}/account/update-details`);
  console.log("   - Method: PATCH");
  console.log("   - Payload:", JSON.stringify(body, null, 2));

  btn.disabled = true;
  btn.textContent = "Updating...";

  try {
    const res = await fetch(`${API_BASE}/account/update-details`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
      credentials: "include",
    });
    
    console.log("📥 Response Status:", res.status);
    console.log("   - Headers:", {
      'content-type': res.headers.get('content-type'),
      'x-access-token': res.headers.get('x-access-token') ? 'Present' : 'Missing'
    });
    
    saveNewToken(res);
    const data = await res.json();
    
    console.log("📦 Response Data:", data);
    
    if (!res.ok || !data.success) {
      updateError.textContent = data.message || "Update failed.";
      console.error("❌ Update failed:", data);
    } else {
      updateSuccess.textContent = data.message || "Profile updated successfully!";
      console.log("✅ Profile update successful");
      
      // If email or phone was changed, backend logs user out
      // Check response headers or wait briefly then check token
      setTimeout(async () => {
        try {
          // Try to fetch account info - if 401, user was logged out
          const checkRes = await fetch(`${API_BASE}/auth/me`, {
            headers: authHeaders(),
            credentials: "include"
          });
          
          if (checkRes.status === 401) {
            console.log("⚠️ Session expired - Email/Phone changed, user logged out");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("deviceUUID");
            window.location.href = "../auth/login.html";
          } else {
            // Still logged in, reload form
            console.log("✅ Session still active, reloading form");
            loadCurrentAccount();
          }
        } catch (err) {
          // If fetch fails, just reload form
          console.error("⚠️ Session check failed:", err);
          loadCurrentAccount();
        }
      }, 1000);
    }
  } catch (err) {
    updateError.textContent = "Network error.";
    console.error("❌ Network error in update profile:", err);
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
      // Terminate session after password change
      console.log("🔐 Password changed - terminating session...");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      // Clear password fields
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
      
      // Show success message with logout notice
      changePasswordSuccess.textContent = "✅ Password changed successfully! Session terminated - redirecting to login...";
      
      // Redirect to login after delay
      setTimeout(() => {
        window.location.href = "../auth/login.html";
      }, 2000);
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
      
      // Wait a moment for backend to fully process
      setTimeout(async () => {
        // Reload account data
        await loadCurrentAccount();
        
        // Broadcast update to other tabs/windows
        localStorage.setItem("twoFAUpdated", JSON.stringify({
          timestamp: new Date().getTime(),
          enabled: enable
        }));
        
        // Notify any listening windows
        if (window.opener) {
          window.opener.postMessage({
            type: "2FA_STATUS_CHANGED",
            enabled: enable,
            timestamp: new Date().getTime()
          }, "*");
        }
        
        console.log("✅ 2FA status updated successfully:", enable ? "ENABLED" : "DISABLED");
      }, 500);
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
    console.log("🔐 Deactivate attempt:");
    console.log("   Password:", password ? "✅ provided" : "❌ missing");
    console.log("   Auth headers:", authHeaders());
    
    const requestBody = { password };
    console.log("   Request body:", requestBody);
    
    const res = await fetch(`${API_BASE}/account/deactivate`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(requestBody),
      credentials: "include",
    });
    const data = await res.json();
    
    console.log("📡 Deactivate response:");
    console.log("   Status:", res.status);
    console.log("   Data:", data);
    
    if (!res.ok || !data.success) {
      console.log("❌ Deactivation failed");
      deactivateError.textContent = data.message || "Failed to deactivate account.";
      btn.disabled = false;
      btn.textContent = "Deactivate Account";
      return;
    }
    console.log("✅ Deactivation successful");
    deactivateSuccess.textContent = data.message || "Account deactivated. Redirecting...";
    setTimeout(() => { window.location.href = "../auth/login.html"; }, 2000);
  } catch (err) {
    console.log("❌ Deactivate error:", err);
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

console.log("✅ All event listeners attached");
console.log("🔄 Calling loadCurrentAccount() on page load...");
loadCurrentAccount();
